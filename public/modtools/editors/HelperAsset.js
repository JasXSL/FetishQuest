// This is a helper script for all ASSET editors
import Window from '../WindowManager.js';
import Condition from '../../classes/Condition.js';

export default{

	// Automatically binds all inputs, textareas, and selects with the class saveable and a name attribute indicating the field to to save
	// win is a windowmanager object
	// Autobind ADDS an event, so you can use el.eventType = fn before calling autobind if you want
	// List is the name of the array in mod.<array> that the asset is stored in
	// Also binds JSON
	autoBind( win, asset, list, onChange ){

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

			

			let path = name.split('::');
			let base = asset;
			while( path.length > 1 ){
				base = base[path.shift()];
				if( base === undefined ){
					console.error("Path find failed for ", name, "in", asset);
					throw "Unable to find path, see above";
				}
			}
			path = path.shift();

			// Soft = here because type isn't important
			if( val != base[path] ){

				// Label change must update the window
				if( name === "label" || name === "id" ){

					val = val.trim();
					if( !val )
						throw 'Label/id cannot be empty';

					win.id = val;
					win.updateTitle();
					dev.mod.updateChildLabels(base, win.type, base[path], val);	// Make sure any child objects notice the label change

				}
				else if( name === "name" ){
					win.name = val;
					win.updateTitle();
				}
				base[path] = val;
				dev.setDirty(true);
				if( list )
					this.rebuildAssetLists(list);

				this.propagateChange(win);
				if( typeof onChange === "function" )
					onChange(name, val);

			}

		}));

		this.bindJson( win, asset, list );
		this.bindArrayPickers(win, asset, list);

	},

	// Automatically binds JSON fields. Needs to be a textarea with class json and name being the field you want to put the data in
	bindJson( win, asset, list ){

		const dev = window.mod;		

		const updateData = (textarea, checkChange = true) => {

			try{
				
				textarea.value = textarea.value.trim();
				
				if( !textarea.value )
					textarea.value = '{}';

				let data = JSON.parse(textarea.value);
				textarea.value = JSON.stringify(data, undefined, 2);	// Auto format

				// Check if it has changed
				if( JSON.stringify(data) !== JSON.stringify(asset.data) && checkChange ){
					
					asset[textarea.name] = data;
					dev.setDirty(true);
					this.rebuildAssetLists(list);
					this.propagateChange(win);

				}

			}catch(err){
				alert("JSON Syntax error: "+(err.message || err));
				let e = String(err).split(' ');
				let pos = parseInt(e.pop());
				textarea.focus();
				textarea.setSelectionRange(pos, pos);
				return false;
			}

			return true;

		};

		win.dom.querySelectorAll('textarea.json[name]').forEach(el => {

			updateData(el, false);
			el.addEventListener('change', event => {
				if( !updateData(el) )
					event.stopImmediatePropagation();
			});

		});

	},

	// Automatically binds arrayPickers (arrays of checkboxes). Needs to be a div with class arrayPicker and name being the field to put the resulting array in
	bindArrayPickers( win, asset, list ){

		const dev = window.mod;		


		const updateData = div => {

			const out = [], pre = JSON.stringify(asset[div.getAttribute("name")] || []);
			div.querySelectorAll('input[type=checkbox]:checked').forEach(el => {
				out.push(el.value);
			});

			if( JSON.stringify(out) !== pre  ){
				asset[div.getAttribute("name")] = out;
				dev.setDirty(true);
				this.rebuildAssetLists(list);
				this.propagateChange(win);
				
			}

		};

		const picker = win.dom.querySelectorAll('div.arrayPicker[name]');
		picker.forEach(pickerEl => {

			pickerEl.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener("change", () => {
				updateData(pickerEl);
			}));

			updateData(pickerEl);
		});
		
	},

	// Tries to convert an object, array etc to something that can be put into a table, and escaped
	makeReadable( val ){

		if( Array.isArray(val) ){
			val = val.map(el => this.makeReadable(el)).join(', ');
		}
		else if( val === null ){
			val = '{}';
		}
		else if( typeof val === "object" ){	// NULL is technically an object

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
		asset is the parent asset
		key is the key in the asset to modify
		if parented, it sets the _mParent : {type:(str)type, label:(str)label} parameter on any new assets created, and only shows assets with the same _mParent set
		columns can also contain functions, they'll be run with the asset as an argument
		ignoreAsset doesn't put the asset into the list. Used by EditorQuestReward where you have multiple fields mapping the same key to different types of objects
	*/
	linkedTable( win, asset, key, constructor = Condition, targetLibrary = 'conditions', columns = ['id', 'label', 'desc'], single = false, parented = false, ignoreAsset = false ){

		const fullKey = key;
		// Todo: Need to handle non array type linked assets
		let k = key.split('::');
		let entries = asset;
		while( k.length > 1 ){
			entries = entries[k.shift()];
		}
		key = k.shift();

		const allEntries = toArray(entries[key]);
		// Needed because :: may need to set '' as a value in order to work
		if( single && allEntries[0] === '' )
			allEntries.splice(0);

		const EDITOR = window.mod, MOD = EDITOR.mod;

		let table = document.createElement("table");
		table.classList.add("linkedTable", "selectable");
		
		let content = '';
		if( !ignoreAsset ){	// Used in EditorQuestReward where there are multiple inputs all corresponding to the same field

			for( let entry of allEntries ){

				const base = this.modEntryToObject(entry, targetLibrary),
					asset = new constructor(base)
				;

				if( !base )
					console.error("Base not found, trying to find", entry, "in", targetLibrary, "asset was", asset, "all assets", allEntries);

				// prefer label before id
				content += '<tr class="asset" data-id="'+esc(asset.label || asset.id)+'">';
				for( let column of columns )
					content += '<td>'+this.makeReadable(typeof column === 'function' ? column(asset) : asset[column])+'</td>';
				
				content += '<td>'+(base.__MOD ? esc(base.__MOD) : 'THIS')+'</td>';
				content += '</tr>';

			}
		}

		// Parented single asset can only add if one is missing. Otherwise they have to edit by clicking. This works because parented can only belong to the same mod.
		const hasButton = !single || !parented || !entries[key];
		if( hasButton )
			content += '<tr class="noselect"><td class="center" colspan="'+(columns.length+1)+'"><input type="button" class="small addNew" value="'+(single && !parented ? 'Replace' : 'Add')+'" /></td></tr>';
		table.innerHTML = content;

		if( hasButton ){
			table.querySelector("input.addNew").onclick = () => {

				// If parented, insert a new asset immediately, as there's no point in listing assets that are only viable for this parent
				if( parented ){

					let a = new constructor();
					if( a.hasOwnProperty("label") ){
						a.label = (asset.label||asset.id)+'>>'+targetLibrary+Math.floor(Math.random()*0xFFFFFFF);
					}
					a = a.save("mod");
					
					if( single )
						entries[key] = a.label || a.id;		// Store only the ID
					else{
						if( !Array.isArray(entries[key]) )
						entries[key] = [];
						entries[key].push(a.label || a.id);
					}

					a._mParent = {
						type : win.type,
						label : win.id,
					};

					// Insert handles other window refreshers
					this.insertAsset(targetLibrary, a, win);

					// But we still need to refresh this
					win.rebuild();

				}
				else
					window.mod.buildAssetLinker( win, asset, fullKey, targetLibrary, single );

			};
		}

		const clickListener = event => {

			// Ctrl deletes
			if( event.ctrlKey ){

				
				let deletedAsset = entries[key];	// Assume single to start with
				if( single ){
					delete entries[key];	// Don't need to store this param in the mod anymore
				}
				else{

					// Remove from the array
					const index = [...event.currentTarget.parentElement.children].indexOf(event.currentTarget);
					deletedAsset = entries[key][index];
					entries[key].splice(index, 1);	// Remove this

				}

				// Assets in lists are always strings, only the official mod can use objects because it's hardcoded
				// If this table has a parenting relationship (see Mod.js), gotta remove it from the DB too
				if( parented ){
					MOD.deleteAsset(targetLibrary, deletedAsset);
				}
				win.rebuild();
				EDITOR.setDirty(true);
				this.rebuildAssetLists(win.type);


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


		};

		table.querySelectorAll("tr.asset").forEach(el => {
			el.onclick = clickListener;
			el.linkedTableListener = clickListener;	// Stores the listener in the TR in case you want to override it
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

		let db = window.mod.mod[library].slice(),
			isLinker = this.windowIsLinker(win)
		;

		// Linker window should add parent mod assets
		if( isLinker && window.mod.parentMod[library] )
			db.push(...window.mod.parentMod[library]);

		// Don't show parented assets, they only show in linkedTable
		db = db.filter(el => {
			return !el._mParent;
		});
	

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
			html += '<tr data-id="'+esc(asset.label || asset.id || a.label || a.id)+'" '+(asset.__MOD ? 'data-mod="'+esc(asset.__MOD)+'"' : '')+'>';		

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
	// baseObject is the object to insert when pressing "new"
	bindList( win, type, baseObject ){
		const DEV = window.mod, MOD = DEV.mod;
		const isLinker = this.windowIsLinker(win),
				single = isLinker && win.asset && win.asset.single		// This is a linker for only ONE object, otherwise it's an array
		;

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
		win.dom.querySelectorAll('tr[data-id]').forEach(el => el.addEventListener('click', event => {

			const elId = event.currentTarget.dataset.id,
				mod = event.currentTarget.dataset.mod
			;
			
			// Ctrl deletes unless it's a linker
			if( !mod && !isLinker && event.ctrlKey && confirm("Really delete?") ){

				if( MOD.deleteAsset(type, elId) ){

					DEV.closeAssetEditors(type, elId);
					DEV.setDirty(true);
					win.rebuild();
					this.rebuildAssetLists(type);

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
				// Linker expects the parent window to be an asset editor unles parentWindow.asset.asset is set
				let baseAsset = parentWindow.asset.asset || MOD.getAssetById(parentWindow.type, parentWindow.id),		// Window id is the asset ID for asset editors. Can only edit our mod, so get from that
					targAsset = this.getAssetById(type, elId)	// Target can be from a parent mod, so we'll need to include that in this search, which is why we use this instead of MOD
				;	

				
				if( !baseAsset ){
					console.error("Type", type, "parentWindow", parentWindow);
					throw 'Base asset not found';
				}
				if( !targAsset )
					throw 'Target asset not found';

				// Handle subsets. This is pretty much just used for Collection type assets since they don't have their own database
				let targ = win.id.split('::');
				while( targ.length > 1 )
					baseAsset = baseAsset[targ.shift()];

				const key = targ.shift();

				// win.id contains the field you're looking to link to
				let label = targAsset.label || targAsset.id;

				// Single assigns directly to the key
				if( single ){
					baseAsset[key] = label;
				}
				// Nonsingle appends to array
				else{
					if( !Array.isArray(baseAsset[key]) )
						baseAsset[key] = [];
					baseAsset[key].push(label);
				}
				win.close();

				parentWindow.rebuild();
				DEV.setDirty(true);
				this.rebuildAssetLists(parentWindow.type);

			}
	
		}, {
			passive : true
		}));
	
		win.dom.querySelector('input.new').onclick = event => {
			
			const obj = baseObject.save("mod");
			this.insertAsset(type, obj, win);
	
		};


	},

	// mParent should be an object if supplied (see Mod.js for info about parented assets)
	insertAsset( type, asset = {}, win, openEditor = true ){
		const DEV = window.mod, MOD = DEV.mod;

		MOD[type].push(asset);

		if( win.editorOnCreate )
			win.editorOnCreate(win, asset);

		DEV.setDirty(true);
		if( openEditor )
			DEV.buildAssetEditor(type, asset.label || asset.id);
		this.rebuildAssetLists(type);

		
	},

	// Rebuilds all listings by type
	rebuildAssetLists( type ){

		for( let win of Window.pages.values() ){

			if( 
				(win.type === "Database" && win.id === type) ||		// This is a database listing of this type
				(win.type === "linker" && win.asset && win.asset.targetType === type)
			){

				win.rebuild();

			}

		}

	},


	// Checks for an onChildChange method on win and any parents, and calls it
	propagateChange( win ){

		let p = win;
		while( true ){

			if( typeof p.onChange === "function" )
				p.onChange(win);
			p = p.parent;

			if( !p )
				return;

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

