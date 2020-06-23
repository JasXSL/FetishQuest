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

	// Takes a var and library name and turns it into an object (unless it's already one)
	modEntryToObject( v, lib ){
		if( typeof v === "string" )
			v = this.getAssetById( lib, v );
		return v;
	},

	// Creates a table inside an asset to show other assets. Such as a table of conditions tied to a text asset
	// Returns a DOM table with events bound on it
	// Asset is a mod asset
	/*
		win is the Window object that should act as the parent for the asset to link
	*/
	linkedTable( win, asset, key, constructor = Condition, targetLibrary = 'conditions', columns = ['id', 'label', 'desc'] ){

		// Todo: Need to handle non array type linked assets
		const entries = toArray(asset[key]);
		const EDITOR = window.mod, MOD = EDITOR.mod;

		let table = document.createElement("table");
		table.classList.add("linkedTable", "selectable");
		
		let content = '';
		for( let entry of entries ){

			const base = this.modEntryToObject(entry, targetLibrary),
				asset = new constructor(base)
			;
			// prefer label before id
			content += '<tr class="asset" data-id="'+esc(asset.label || asset.id)+'">';
			for( let column of columns )
				content += '<td>'+this.makeReadable(asset[column])+'</td>';
			
			content += '<td>'+(base.__MOD ? esc(base.__MOD) : 'THIS')+'</td>';
			content += '</tr>';

		}
		content += '<tr class="noselect"><td colspan=3><input type="button" value="Add" /></td></tr>';
		table.innerHTML = content;

		table.querySelector("input[value=Add]").onclick = () => {
			window.mod.buildAssetLinker( win, asset, key, targetLibrary);
		};

		table.querySelectorAll("tr.asset").forEach(el => el.onclick = event => {
			
			if( event.ctrlKey && Array.isArray(asset[key]) ){

				const index = [...event.currentTarget.parentElement.children].indexOf(event.currentTarget);
				asset[key].splice(index, 1);	// Remove this
				win.rebuild();
				EDITOR.setDirty(true);

				return;
			}
			else{

				const id = event.currentTarget.dataset.id;
				// See if it's from a mod
				const asset = this.getAssetById(targetLibrary, id);
				if( !asset )
					throw 'Linked asset not found';
				if( asset.__MOD ){
					alert("Can't edit an asset from a different mod. Ctrl+click to delete.");
					return;
				}
				EDITOR.buildAssetEditor( targetLibrary, id );
			}


		});

		// Todo: Need some way to refresh the window if one of the linked assets are changed
		
		return table;

	},


	// Because list and linker use the same function, this can be used to check which it is
	windowIsLinker( win ){

		return win.type === 'linker';

	},



	// Tries to automatically build a selectable list of assets and return the HTML 
	// Fields is an array of {field:true/func} If you use a non function, it'll try to auto generate the value based on the type, otherwise the function will be executed using win as parent and supply the var as an argument
	// Nonfunction is auto escaped, function needs manual escaping
	// Fields should contain an id or label field (or both), it will be used for tracking the TR and prefer label if it exists
	// Constructor is the asset constructor (used for default values)
	buildList( win, library, constr, fields ){

		const db = window.mod.mod.conditions.slice(),
			isLinker = this.windowIsLinker(win)
		;

		// Linker window should add parent mod assets
		if( isLinker && window.mod.parentMod[library] )
			db.push(...window.mod.parentMod[library]);

		// New button
		let html = '<input type="button" class="new" value="New" />';
		
		// Database table
		html += '<table class="selectable autosize">';
	
		html += '<tr>';
		for( let i in fields )
			html += '<th>'+esc(i)+'</th>';
		if( isLinker )
			html += '<th>MOD</th>';
		html += '</tr>';

		for( let asset of db ){

			const a = constr.loadThis(asset);

			html += '<tr data-id="'+esc(asset.label || asset.id)+'" '+(asset.__MOD ? 'data-mod="'+esc(asset.__MOD)+'"' : '')+'>';		

				for( let field in fields ){

					let val = fields[field];
					if( typeof val === "function" )
						val = val.call(win, a);
					else{

						val = a[field];
						if( typeof val === "boolean" )
							val = val ? 'YES' : '';
						else
							val = this.makeReadable(val);

					}
					html += '<td>'+val+'</td>';
		
				}

				// Linker should also show the mod
				if( isLinker ){
					html += '<td>'+(asset.__MOD ? esc(asset.__MOD) : 'THIS')+'</td>';
				}

			html += '</tr>';

		}



		

		html += '</table>';
		return html;

	},

	// Binds a window listing. This is used for the window types: database, linker
	// Type is the name of the array of the asset in mod the list fetches elements from
	bindList( win, type ){
		const DEV = window.mod, MOD = DEV.mod;
		const isLinker = this.windowIsLinker(win);
				// Checks if this is a linker or not
		const parentWindow = win.parent;

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

			const elId = event.currentTarget.dataset.id,
				mod = event.currentTarget.dataset.mod
			;
			
			// Ctrl deletes unless it's a linker
			if( !mod && !isLinker && event.ctrlKey && confirm("Really delete?") ){

				if( MOD.deleteAsset(elId, type) ){

					DEV.closeAssetEditors(type, elId);
					DEV.setDirty(true);

				}

			}
			// If it's not a linker, or shift is pressed, we bring up an editor
			else if( !mod && (!isLinker || event.shiftKey) ){
				DEV.buildAssetEditor(type, elId);
			}
			// This is a linker, we need to tie it to the parent
			else{

				if( !parentWindow )
					throw 'Parent window missing';

				// Get the asset we need to modify
				const baseAsset = MOD.getAssetById(type, parentWindow.id),		// Window id is the asset ID for asset editors. Can only edit our mod, so get from that
					targAsset = this.getAssetById(win.asset.targetType, elId)	// Target can be from a parent mod, so we'll need to include that in this search
				;	

				if( !baseAsset )
					throw 'Clicked asset not found';

				// win.id contains the field you're looking to link to
				let label = targAsset.label || targAsset.id;

				if( !baseAsset[win.id] )
					baseAsset[win.id] = [];
				baseAsset[win.id].push(label);

				win.close();

				parentWindow.rebuild();
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



	// Tries to get an asset from our mod or a parent mod, tries to find id in label or actual id
	getAssetById( type, id ){

		let out = window.mod.mod.getAssetById(type, id);
		if( out )
			return out;
		
		return window.mod.parentMod.getAssetById(type, id);

	},


};

