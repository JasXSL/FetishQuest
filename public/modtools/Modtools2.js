import Window from './WindowManager.js';
import {default as WebGL, Stage} from '../classes/WebGL.js';
import {default as libMeshes, LibMesh, getNonDoorMeshes} from '../libraries/meshes.js';
import * as THREE from '../ext/THREE.js';
import TransformControls from '../ext/TransformControls.js';
import Mod from '../classes/Mod.js';

import OfficialMod from '../libraries/_main_mod.js';

import * as EditorText from './editors/EditorText.js';
import * as EditorCondition from './editors/EditorCondition.js';
import * as EditorAudioKit from './editors/EditorAudioKit.js';
import * as EditorHitFX from './editors/EditorHitFX.js';
import Generic from '../classes/helpers/Generic.js';



// Window types that should be tracked
const TRACKED_WINDOWS = {
	"Database" : true,
};

// Todo: Asset picker for sub window

// Maps database assets to functions
// Type : fn
// Type is named after the name of its array in Mod.js
const DB_MAP = {
	"texts" : { listing : EditorText.list, asset : EditorText.asset, icon : '' },
	"conditions" : { listing : EditorCondition.list, asset : EditorCondition.asset, icon : 'check-mark' },
	"audioKits" : { listing : EditorAudioKit.list, asset : EditorAudioKit.asset, icon : 'speaker' },
	"hitFX" : { listing : EditorHitFX.list, asset : EditorHitFX.asset, icon : 'spiky-explosion' },
};

export default class Modtools{

	constructor(){

		this.mod = null;						// Active mod
		this.loading = false;					// Used to prevent window states from being altered when loading window states
		// Tracks what windows are open
		this.window_states = new Map();			// uniqid : WindowState
		this.parentMod = new Mod();	// Todo: At some point we'll want to allow mods loaded above in the load order to show up here as well. This is the parent mod which we can extend from.

		this.db = new Dexie("editor");
		this.db.version(1).stores({
			window_states : 'mod'
		});

	
		this.topMenu = document.getElementById("topMenu");
		this.sideMenu = document.getElementById("libraryMenu");
		this.modName = document.querySelector("#modName > span.name");
		this.modDirty = document.querySelector("#modName > span.dirty");

		this.dirty = false;
		
		Window.windowContainer = document.getElementById("windows");
		Window.minimizeContainer = document.getElementById("tray");

		const self = this;

		// Click the top menu
		this.topMenu.querySelectorAll("div[data-id]").forEach(el => {
			el.onclick = evt => {
				evt.stopImmediatePropagation();
				const button = evt.currentTarget;

				// File menu
				if( button.dataset.id === "file" ){
					
					Window.setMenu(button);

					Window.addMenuOption("new", "New Mod", () => {

						Window.create("New Mod", "New", "", "pencil", async function(){
							this.setDom("Todo: New mod");
						});

					});

					Window.addMenuOption("open", "Open", () => { self.loadWindow(); });

					// Mod exists
					if( this.mod ){

						Window.addMenuOption("save", "Save", () => {
							console.log("Todo: Save mod");
						});

						Window.addMenuOption("settings", "Settings", () => {
							Window.create("Settings", "File Settings", "", "auto-repair", function(){

								this.setDom('Todo: ');
	
							});
						});

					}

				}

				// Window menu
				else if( button.dataset.id === "window" ){
					Window.setMenu(button);
					Window.addMenuOption("closeAll", "Close All", () => {
						Window.closeAll();
					});
					Window.addMenuOption("minimizeAll", "Minimize All", () => {
						Window.minimizeAll();
					});
					Window.addMenuOption("resetAll", "Reset All", () => {
						Window.resetAll();
					});
				}

			};
		});

		// Clicked the left menu
		this.sideMenu.querySelectorAll("div[data-category]").forEach(el => {
			el.onclick = evt => {

				const button = evt.currentTarget,
					label = button.dataset.category
				;
				this.buildDatabaseList(label);

			};
		});

		
		// Hotkeys
		window.onkeydown = event => {

			// Ctrl+O = Open
			if( event.key === 'o' && event.ctrlKey ){
				event.preventDefault();
				this.loadWindow();
			}

			// Ctrl+S Save
			if( event.key === 's' && event.ctrlKey ){
				event.preventDefault();
				this.save();
			}
			
		};

		// Window events
		Window.onWindowOpened = win => this.onWindowOpened(win);
		Window.onWindowClosed = win => this.onWindowClosed(win);
		Window.onWindowMoved = win => this.onWindowMoved(win);
		Window.onWindowResized = win => this.onWindowResized(win);
		Window.onWindowMaximized = win => this.onWindowMaximize(win);
		Window.onWindowMinimized = win => this.onWindowMinimize(win);
		Window.onWindowToFront = win => this.onWindowToFront(win);

		// Auto loader
		const autoload = localStorage.editor_mod;
		if( autoload ){

			(async () => {
 
				const m = await Mod.getByID(autoload);
				if( m )
					this.load(m);

			})();

		}

		window.onbeforeunload = e => {
			if( !this.dirty )
				return;
			return 'You have unsaved changes. Really discard these?';
		};
		

	}

	onWindowMoved( win ){
		this.refreshWindowState(win);
	}

	onWindowResized( win ){
		this.refreshWindowState(win);
	}

	onWindowToFront( win ){
		this.refreshWindowState(win);
	}

	onWindowMaximize( win ){
		this.refreshWindowState(win);
	}

	onWindowMinimize(win){
		this.refreshWindowState(win);
	}

	onWindowOpened( win ){

		// Todo: Track dirty

		// Don't need to check loading here, it will rebuild the states
		// Check for tracked windows (custom windows such as the asset listings) and also ALL asset editors (included in DB_MAP)
		if( TRACKED_WINDOWS[win.type] || DB_MAP[win.type] )
			this.window_states.set(
				win.uniqid(), 
				new WindowState()
			);

		this.refreshWindowState(win);


			
		//this.setDirty(true);

	}

	onWindowClosed( win ){

		if( !this.loading ){

			this.window_states.delete(win.uniqid());
			this.saveWindowStates();

		}

	}

	refreshWindowState( win ){

		const state = this.window_states.get(win.uniqid());
		if( !state )
			return;

		state.id = win.id;
		state.type = win.type;
		state.x = win.position.x; 
		state.y = win.position.y; 
		state.z = win.getZindex(); 
		state.h = win.size.h; 
		state.w = win.size.w;
		state.max = win.isMaximized();
		state.min = win.minimized;
		state.data = win.data;

		this.saveWindowStates();

	}

	// Loads window states for the active mod
	async loadWindowStates(){

		const data = await this.db.window_states.get(this.mod.id);
		if( !data )
			return;

		delete data.mod;	// Mod is tacked onto the object for identification

		const order = [];
		for( let id in data ){

			const val = data[id];

			// Open window
			let win;
			try{
				// An asset database listing
				if( val.type === "Database" )
					win = this.buildDatabaseList(val.id);
				// An asset editor
				else if( DB_MAP[val.type] ){
					win = this.buildAssetEditor(val.type, val.id);
				}
				else{
					console.error("Ignoring window state for", data, "because it's an unsupported type. Add it to TRACKED_WINDOWS (or DB_MAP if a mod asset)");
					continue;
				}
			}catch(err){
				console.error(err);
				continue;
			}

			if( val.max )
				win.toggleMaximize();
			if( val.min )
				win.toggleMinimize();

			win.position.x = val.x;
			win.position.y = val.y;
			win.size.w = val.w;
			win.size.h = val.h;
			win.makeFloating();

			order.push({
				id : id,
				z : val.z
			});

		}

		// Sort in ascending order since we loop through from back to front
		order.sort((a, b) => {
			return a.z < b.z ? -1 : 1;
		});


		Window.zIndex = 0;
		for( let block of order ){
			const win = Window.get(block.id);
			if( win )
				win.bringToFront( true );
		}		

	}

	saveWindowStates(){

		if( !this.mod )
			return;
			
		clearTimeout(this._saveWindowStates);
		this._saveWindowStates = setTimeout(async () => {
			try{

				const data = Object.fromEntries(this.window_states);
				data.mod = this.mod.id;
				await this.db.window_states.put(data);
				
			}catch(err){
				console.error("Error in saving", err);
			}
		}, 100);

	}

	setDirty( dirty ){
		
		this.dirty = Boolean(dirty);
		this.modDirty.classList.toggle("hidden", !dirty);

	}

	// Draw the load window
	loadWindow(){

		const self = this;
		
		Window.create("Load", "Load Mod", "", "load", async function(){

			let mods = await Mod.getAll();

			let html = '<table class="selectable">';
				html += '<tr><th>ID</th><th>Name</th><th>Author</th></tr>';
			for( let mod of mods ){

				html += '<tr data-id="'+esc(mod.id)+'">';
					html += '<td>'+esc(mod.id)+'</td>';
					html += '<td>'+esc(mod.name)+'</td>';
					html += '<td>'+esc(mod.author)+'</td>';
				html += '</tr>';

			}
			html += '</table>';
			
			this.setDom(html);

			this.dom.querySelectorAll("table.selectable tr[data-id]").forEach(el => el.onclick = event => {
				
				const mod = event.currentTarget.dataset.id;
				for( let m of mods ){

					if( m.id === mod ){
						self.load(m);
						return;
					}

				}

			});


		});


	}


	// UI stuff
	updateModName(){
		this.modName.innerText = esc(this.mod.name) || "Unnamed Mod";
	}


	// If mod is undefined, reload the current mod
	async load( mod ){

		if( this.dirty && !confirm("Are you sure you want to load? Unsaved changes will be discarded.") )
			return;

		if( !mod )
			mod = this.mod;

		if( !mod )
			return;

		this.loading = true;

		this.parentMod = new Mod();
		// Mods above in the load order, for now just do Official
		// Todo: Later on, allow us to load over multiple mods
		const parentMods = [OfficialMod];
		for( let mod of parentMods ){
			for( let i in mod ){
				if( Array.isArray(mod[i]) ){

					// First make sure we know what mod the asset is from by adding __MOD
					for( let asset of mod[i] )
						asset.__MOD = mod.name || mod.id;

					// later on allow you to search for labels and replace them
					if( Array.isArray(this.parentMod[i]) && this.parentMod[i].length ){
						console.log("Todo: track down changed IDs and ");
					}
					// Not yet set in the parentMod, we're safe to copy the whole thing
					else
						this.parentMod[i] = mod[i].slice();
					
				}
			}
		}

		this.setDirty(false);
		this.mod = mod;
		Window.closeAll();

		localStorage.editor_mod = mod.id;		// Save this as the actively opened mod
		this.updateModName();					// Set the mod name in the top bar

		await this.loadWindowStates();

		this.sideMenu.classList.toggle("hidden", false);

		this.loading = false;

	}

	save(){
		
		this.setDirty(false);
		this.mod.save();		

	}




	// Build windows
	buildDatabaseList( id ){

		if( !DB_MAP[id] || !DB_MAP[id].listing )
			throw 'Trying to build DB list for unknown type: '+id+'. Map the type to DB_MAP in ModTools2.js';

		return Window.create(id, "Database", "", "database", DB_MAP[id].listing);
	}

	// Edit a text asset by id
	buildAssetEditor( type, id, data ){

		if( !DB_MAP[type] || !DB_MAP[type].asset)
			throw 'Asset editor not found for type '+type+", add it to DB_MAP in Modtools2.js";

		const asset = this.mod.getAssetById(type, id);
		if( !asset )
			throw 'Asset not found: '+id;

		return Window.create(
			id, 
			type, 
			asset.label, 
			DB_MAP[type].icon || "pencil", 
			DB_MAP[type].asset, 
			data
		);

	}

	// Create an asset linker window to link an asset to another
	/*
		baseAsset is the asset from the mod we want to put the item into
		baseKey is the key of the array in the asset we want to put the target asset into
		targetType is a type defined in DB_MAP of the assets we want to pick from
		data is {parentWindow:parentWindowUniqId, targetType:targetType} - targetType is supplied for windows updates if you modify one of the assets while you still have the picker open
	*/
	buildAssetLinker( parentWindow, baseAsset, baseKey, targetType ){

		if( !DB_MAP[targetType] || !DB_MAP[targetType].listing )
			throw 'Asset linker not found for type '+targetType+", add it to DB_MAP in Modtools2.js";

		return Window.create(
			baseKey,
			"linker",
			baseAsset.label,
			'linked-rings',
			DB_MAP[targetType].listing,
			{targetType:targetType},
			parentWindow
		);

	}


	closeAssetEditors( type, id ){

		const win = Window.getByTypeAndId(type, id);
		if( win )
			win.close();

	}


}


// Helper for saving window states
class WindowState{

	constructor( id, type, x, y, z, h, w, max, min, data ){
		this.id = id;
		this.type = type;
		this.x = x;
		this.y = y;
		this.z = z;
		this.h = h;
		this.w = w;
		this.max = max;
		this.min = min;
		this.data = data;
	}

}


