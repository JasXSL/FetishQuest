// This is a helper script for all ASSET editors
import Window from '../WindowManager.js';
import Condition from '../../classes/Condition.js';

export default{

	// Automatically binds all inputs, textareas, and selects with the class saveable and a name attribute indicating the field to to save
	// win is a windowmanager object
	// Autobind ADDS an event, so you can use el.eventType = fn before calling autobind if you want
	// List is the name of the array in mod.<array> that the asset is stored in
	// Also binds JSON
	autoBind( win, asset, list ){

		const dom = win.dom,
			dev = window.mod
		;

		// Binds simple inputs
		dom.querySelectorAll(".saveable[name]").forEach(el => el.addEventListener('change', event => {

			const targ = event.currentTarget,
				name = targ.name
			;

			let val = targ.value.trim();
			
			if( targ.tagName === 'INPUT' ){

				const type = targ.type;
				if( type === 'range' || type === 'number' )
					val = +val;
				
				if( type === 'checkbox' )
					val = Boolean(targ.checked);

			}

			// Soft = here because type isn't important
			if( val != asset[name] ){

				asset[name] = val;
				dev.setDirty(true);
				if( list )
					this.rebuildAssetLists(list);


			}

		}));

		this.bindJson( win, asset, list );


	},

	// Automatically binds JSON fields. Needs to be a textarea with class json and name being the field you want to put the data in
	bindJson( win, asset, list ){

		const dev = window.mod;		

		const updateData = textarea => {

			try{
				
				textarea.value = textarea.value.trim();
				
				if( !textarea.value )
					textarea.value = '{}';

				let data = JSON.parse(textarea.value);
				textarea.value = JSON.stringify(data, undefined, 2);	// Auto format

				// Check if it has changed
				if( JSON.stringify(data) !== JSON.stringify(asset.data) ){
					
					asset[textarea.name] = data;
					dev.setDirty(true);
					this.rebuildAssetLists(list);

				}

			}catch(err){
				alert("JSON Syntax error: "+(err.message || err));
				let e = String(err).split(' ');
				let pos = parseInt(e.pop());
				textarea.focus();
				textarea.setSelectionRange(pos, pos);

			}

		};

		win.dom.querySelectorAll('textarea.json[name]').forEach(el => {

			updateData(el);
			el.addEventListener('change', () => updateData(el) );

		});

	},

	// Tries to convert an object, array etc to something that can be put into a table, and escaped
	makeReadable( val ){

		if( Array.isArray(val) )
			val = val.join(', ');
		else if( typeof val === "object" ){
			if( val.label )
				val = val.label;
			else if( val.id )
				val = val.id;
			else
				val = JSON.stringify(val);
		}
		return esc(val);

	},

	// Creates a table inside an asset to show other assets. Such as a table of conditions tied to a text asset
	// Returns a DOM table with events bound on it
	// Asset is a mod asset
	linkedTable( win, asset, key, constructor = Condition, targetLibrary = 'conditions', columns = ['id', 'label', 'desc'] ){

		const entries = toArray(asset[key]);
		const EDITOR = window.mod, MOD = EDITOR.mod;

		let table = document.createElement("table");
		
		let content = '';
		for( let entry of entries ){

			if( typeof entry === "string" )
				entry = MOD.getAssetById( targetLibrary, entry );
			const asset = new constructor(entry);

			content += '<tr data-id="'+esc(asset.id)+'">';
			for( let column of columns ){
				content += '<td>'+this.makeReadable(asset[column])+'</td>';
			}
			content += '</tr>';

		}
		content += '<tr><td colspan=3><input type="button" value="Add" /></td></tr>';
		table.innerHTML = content;

		table.querySelector("input[value=Add]").onclick = () => {
			this.openLinker( win, asset, key, targetLibrary );
		};
		
		return table;

	},


	// Draws a linker window to link an asset to another and binds everything for you
	/* 
		asset is a raw object from the current mod
		assetLibrary is the name of the library the asset lives in, such as text
		targetLibrary is the name of the mod array you want to fetch assets from, such as condition
	*/
	openLinker( parentWindow, asset, key, targetLibrary ){

		const win = window.mod.buildAssetLinker( parentWindow, asset, key, targetLibrary);


	},


	// Binds a window listing. This is used for the window types: database, linker
	// Type is the name of the array of the asset in mod the list fetches elements from
	bindList( win, type ){
		const DEV = window.mod, MOD = DEV.mod;
		const isLinker = win.type === 'linker';		// Checks if this is a linker or not
		const parentWindow = win.asset && Window.get(win.asset.parentWindow);

		if( parentWindow ){

			// Parent is the same type as this, such as adding subconditions. You need to remove the parent from the list to prevent recursion.
			if( type === parentWindow.type ){
				
				const el = win.dom.querySelector('tr[data-id="'+parentWindow.id+'"]');
				if( el )
					el.remove();
				
			}

		}

		// Handle clicks on the rows
		win.dom.querySelectorAll('tr[data-id]').forEach(el => el.onclick = event => {

			const elId = event.currentTarget.dataset.id;
			
			// Ctrl deletes unless it's a linker
			if( !isLinker && event.ctrlKey && confirm("Really delete?") ){

				if( MOD.deleteAsset(elId, type) ){

					DEV.closeAssetEditors(type, elId);
					DEV.setDirty(true);

				}

			}
			// If it's not a linker, or shift is pressed, we bring up an editor
			else if( !isLinker || event.shiftKey ){
				DEV.buildAssetEditor(type, elId);
			}
			// This is a linker, we need to tie it to the parent
			else{

				if( !parentWindow )
					throw 'Parent window missing';

				// Get the asset we need to modify
				const baseAsset = MOD.getAssetById(type, parentWindow.id),	// Window id is the asset ID for asset editors
					targAsset = MOD.getAssetById(win.asset.targetType, elId)				
				;	

				if( !baseAsset )
					throw 'Clicked asset not found';

				// win.id contains the field you're looking to link to
				let label = targAsset.label || targAsset.id;

				if( !baseAsset[win.id] )
					baseAsset[win.id] = [];
				baseAsset[win.id].push(label);

				win.close();

				// Todo: need to have a callback or something to refresh the datalist
				DEV.setDirty(true);

			}
	
		});
	
		win.dom.querySelector('input.new').onclick = event => {
			
			const asset = new Condition({
				label : 'newCondition',
				type : Condition.Types.tag,
				data : {tags:[]}
			});
	
			window.mod.mod.conditions.push(asset.save("mod"));
			window.mod.setDirty(true);
			window.mod.buildAssetEditor(type, asset.id);
	
			this.rebuildAssetLists(type);
			
	
		};


	},

	// Rebuilds all listings by type
	rebuildAssetLists( type ){

		console.log("Rebuilding with type", type);
		for( let win of Window.pages.values() ){

			console.log(win.type, win.asset);
			if( 
				(win.type === "Database" && win.id === type) ||		// This is a database listing of this type
				(win.type === "linker" && win.asset && win.asset.targetType === type)
			){

				console.log("Rebuilding");
				win.rebuild();

			}

		}

	},



};

