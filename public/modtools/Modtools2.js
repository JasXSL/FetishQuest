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
import * as EditorAsset from './editors/EditorAsset.js';
import * as EditorAssetTemplate from './editors/EditorAssetTemplate.js';
import * as EditorMaterialTemplate from './editors/EditorMaterialTemplate.js';
import * as EditorWrapper from './editors/EditorWrapper.js';
import * as EditorEffect from './editors/EditorEffect.js';
import * as EditorAction from './editors/EditorAction.js';
import * as EditorActionLearnable from './editors/EditorActionLearnable.js';
import * as EditorGameAction from './editors/EditorGameAction.js';
import * as EditorPlayerClass from './editors/EditorPlayerClass.js';
import * as EditorPlayer from './editors/EditorPlayer.js';
import * as EditorPlayerTemplate from './editors/EditorPlayerTemplate.js';
import * as EditorRoleplay from './editors/EditorRoleplay.js';
import * as EditorRoleplayStage from './editors/EditorRoleplayStage.js';
import * as EditorRoleplayStageOption from './editors/EditorRoleplayStageOption.js';
import * as EditorShop from './editors/EditorShop.js';
import * as EditorShopAsset from './editors/EditorShopAsset.js';
import * as EditorFaction from './editors/EditorFaction.js';
import * as EditorQuest from './editors/EditorQuest.js';
import * as EditorQuestReward from './editors/EditorQuestReward.js';
import * as EditorQuestObjective from './editors/EditorQuestObjective.js';
import * as EditorQuestObjectiveEvent from './editors/EditorQuestObjectiveEvent.js';
import * as EditorEncounter from './editors/EditorEncounter.js';
import * as EditorDungeon from './editors/EditorDungeon.js';
import * as EditorDungeonRoom from './editors/EditorDungeonRoom.js';

// Window types that should be tracked
const TRACKED_WINDOWS = {
	"Database" : true,
};


// Maps database assets to functions
// Type : fn
// Type is named after the name of its array in Mod.js
const DB_MAP = {
	"texts" : { listing : EditorText.list, asset : EditorText.asset, icon : '' },
	"conditions" : { listing : EditorCondition.list, asset : EditorCondition.asset, icon : 'check-mark' },
	"audioKits" : { listing : EditorAudioKit.list, asset : EditorAudioKit.asset, icon : 'speaker' },
	"hitFX" : { listing : EditorHitFX.list, asset : EditorHitFX.asset, icon : 'spiky-explosion' },
	"assets" : { listing : EditorAsset.list, asset : EditorAsset.asset, icon : 'underwear' },
	"wrappers" : { listing : EditorWrapper.list, asset : EditorWrapper.asset, icon : 'jigsaw-box' },
	"effects" : { listing : EditorEffect.list, asset : EditorEffect.asset, icon : 'fairy-wand' },
	"actions" : { listing : EditorAction.list, asset : EditorAction.asset, icon : 'juggler' },
	"assetTemplates" : { listing : EditorAssetTemplate.list, asset : EditorAssetTemplate.asset, icon : 'mail-shirt' },
	"materialTemplates" : { listing : EditorMaterialTemplate.list, asset : EditorMaterialTemplate.asset, icon : 'wool' },
	"actionLearnable" : { listing : EditorActionLearnable.list, asset : EditorActionLearnable.asset, icon : 'graduate-cap' },
	"gameActions" : { listing : EditorGameAction.list, asset : EditorGameAction.asset, icon : 'joystick' },
	"playerClasses" : { listing : EditorPlayerClass.list, asset : EditorPlayerClass.asset, icon : 'vitruvian-man' },
	"players" : { listing : EditorPlayer.list, asset : EditorPlayer.asset, icon : 'mustache' },
	"playerTemplates" : { listing : EditorPlayerTemplate.list, asset : EditorPlayerTemplate.asset, icon : 'anatomy' },
	"roleplay" : { listing : EditorRoleplay.list, asset : EditorRoleplay.asset, icon : 'talk' },
	"roleplayStage" : { listing : EditorRoleplayStage.list, asset : EditorRoleplayStage.asset, icon : 'conversation' },
	"roleplayStageOption" : { listing : EditorRoleplayStageOption.list, asset : EditorRoleplayStageOption.asset, icon : 'click' },
	"shops" : { listing : EditorShop.list, asset : EditorShop.asset, icon : 'shopping-cart' },
	"shopAssets" : { listing : EditorShopAsset.list, asset : EditorShopAsset.asset, icon : 'receive-money' },
	"factions" : { listing : EditorFaction.list, asset : EditorFaction.asset, icon : 'tattered-banner' },
	"quests" : { listing : EditorQuest.list, asset : EditorQuest.asset, icon : 'scroll-quill' },
	"questRewards" : { listing : EditorQuestReward.list, asset : EditorQuestReward.asset, icon : 'open-treasure-chest' },
	"questObjectives" : { listing : EditorQuestObjective.list, asset : EditorQuestObjective.asset, icon : 'direction-sign' },
	"questObjectiveEvents" : { listing : EditorQuestObjectiveEvent.list, asset : EditorQuestObjectiveEvent.asset, icon : 'annexation' },
	"encounters" : { listing : EditorEncounter.list, asset : EditorEncounter.asset, icon : 'kraken-tentacle' },
	"dungeons" : { listing : EditorDungeon.list, asset : EditorDungeon.asset, icon : 'castle' },
	"dungeonRooms" : { listing : EditorDungeonRoom.list, asset : EditorDungeonRoom.asset, icon : 'doorway' },
};

/*

	Continuation order:
	- Update gameActions with fancier controls

*/


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
		this.datalists = document.getElementById("datalists");

		this.dummyUploader = document.getElementById("dummyUploader");	// file input


		this.webgl = new WebGL({
			fullControls : true,
			enableGrid : true
		});
		const gl = this.webgl;
		const control = new TransformControls( gl.camera, gl.renderer.domElement, () => {});
		this.transformControls = control;
		control.setTranslationSnap(1);
		control.setRotationSnap(THREE.Math.degToRad(1));
		control.addEventListener( 'dragging-changed', function( event ){
			gl.controls.enabled = !event.value;
		});
		gl.scene.add(control);
		gl.onRender = function(){
			control.update();
		};
		

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

						Window.create("New Mod", "New", "", "pencil", function(){

							let html = '<h1>New Mod</h1>';
							html += '<form class="center">';
								html += '<input type="text" name="name" placeholder="Mod Name" required /><br />';
								html += '<input type="text" name="author" placeholder="Author" required /><br />';
								html += '<input type="submit" value="Create" />';
							html += '</form>';
							this.setDom(html);

							this.dom.querySelector("form").onsubmit = async event => {
								event.preventDefault();

								const form = event.currentTarget,
									name = form.querySelector("input[name=name]").value.trim(),
									author = form.querySelector("input[name=author]").value.trim()
								;
								if( !name || !author )
									return;

								const mod = new Mod({
									name : name,
									author : author
								});
								await mod.save();
								self.load(mod);								

							};

						});

					});

					Window.addMenuOption("open", "Open (Ctrl+O)", () => { self.loadWindow(); });

					Window.addMenuOption("import", "Import", () => { 
						
						this.dummyUploader.setAttribute("accept", ".fqmod");
						this.dummyUploader.onchange = evt => {
							const file = event.target.files[0];
							if( !file )
								return;

							const reader = new FileReader();
							reader.addEventListener('load', async event => {
								try{
									const raw = JSON.parse(event.target.result);
									if( !raw.id || !raw.name )
										throw 'INVALID_ID';
									
									const mod = new Mod(raw);
									const existing = await Mod.getByID(raw.id);
									if( existing ){
										if( !confirm("Mod already exists, are you sure you want to overwrite?") )
											return;
									}

									await mod.save();
									this.load(mod);

								}catch(err){
									let reason = "JSON Error";
									if( err === "INVALID_ID" )
										reason = 'Required parameters missing';
									alert("This is not a valid mod file ("+reason+")");
									console.error(err);
								}
							});
							reader.readAsText(file);
							

							this.dummyUploader.value = "";
						};
						this.dummyUploader.click();
					});

					// Mod exists
					if( this.mod ){

						Window.addMenuOption("save", "Save (Ctrl+S)", () => {
							this.save();
						});

						Window.addMenuOption("settings", "Settings", () => {
							Window.create("Settings", "File Settings", "", "auto-repair", function(){

								let html = '';
								html += '<form class="center">';
									html += 'Name: <input type="text" name="name" placeholder="Mod Name" value="'+esc(self.mod.name)+'" required /><br />';
									html += 'Author: <input type="text" name="author" placeholder="Author" value="'+esc(self.mod.author)+'" required /><br />';
									html += 'Description: <br />';
									html += '<textarea name="description">'+esc(self.mod.description)+'</textarea><br />';
									html += '<input type="submit" value="Save" />';
									html += '<input type="button" value="Cancel" />';
								html += '</form>';
								this.setDom(html);

								this.dom.querySelector("input[value=Cancel]").onclick = () => {
									this.close();
								};

								const form = this.dom.querySelector("form");
								form.onsubmit = async event => {
									event.preventDefault();

									// Save changes
									const name = form.querySelector("input[name=name]").value.trim(),
										author = form.querySelector("input[name=author]").value.trim(),
										desc = form.querySelector("textarea[name=description]").value.trim()
									;

									if( !name || !desc )
										return;

									self.mod.name = name;
									self.mod.description = desc;
									self.mod.author = author;

									self.modName.innerText = name;

									self.mod.save();
									this.close();
								};
	
							});
						});

						Window.addMenuOption("export", "Export", () => {

							const a = document.createElement('a');
							a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(this.mod)));
							a.setAttribute('download', this.mod.name.split(" ").join('_')+'.fqmod');
							document.body.appendChild(a);
							a.click();
							a.remove();

						});

					}

				}

				// Window menu
				else if( button.dataset.id === "window" ){
					Window.setMenu(button);
					Window.addMenuOption("closeAll", "Close All (Alt+C)", () => {
						Window.closeAll();
					});
					Window.addMenuOption("minimizeAll", "Min/max All (Alt+D)", () => {
						Window.toggleMinimizeAll();
					});
					Window.addMenuOption("resetAll", "Reset All", () => {
						Window.resetAll();
					});
					Window.addMenuOption("refresh", "Refresh Selected (Ctrl+E)", () => {
						Window.front && window.front.rebuild();
					});
					Window.addMenuOption("refreshAll", "Refresh All (Ctrl+Alt+E)", () => {
						Window.rebuildAll();
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

			// Alt+C - Close all
			if( event.key === 'c' && event.altKey ){
				event.preventDefault();
				Window.closeAll();
			}

			// Alt+D - Min/max all
			if( event.key === 'd' && event.altKey ){
				event.preventDefault();
				Window.toggleMinimizeAll();
			}

			// Ctrl+Alt+E - Refresh all
			if( event.key === 'e' && event.altKey && event.ctrlKey ){
				event.preventDefault();
				Window.rebuildAll();
			}

			// Ctrl+E - Rebuild active
			if( event.key === 'e' && event.ctrlKey ){
				event.preventDefault();
				Window.front && Window.front.rebuild();
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
			if( !this.mod )
				return;

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

						if( event.ctrlKey ){

							if( confirm("Are you sure you want to delete the mod: "+m.name+"?") ){
								m.delete();
								if( self.mod && m.id === self.mod.id )
									self.closeMod();
							}

							return;
						}

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

		// Build new datalists
		this.buildDataLists();

		await this.loadWindowStates();
		this.sideMenu.classList.toggle("hidden", false);

		

		this.loading = false;

	}

	save(){
		
		this.setDirty(false);
		this.mod.save();		

	}


	// Builds the autocomplete datalists
	buildDataLists(){
		
		const lists = ['actions'];
		for( let db of lists ){

			const compile = {};
			this.mod[db].concat(this.parentMod[db]).forEach(el => compile[el.label] = true);
			const existing = this.datalists.querySelector("datalist_"+db);
			if( existing )
				existing.remove();

			const datalist = document.createElement("datalist");
			datalist.id = 'datalist_'+db;
			this.datalists.appendChild(datalist);
	
			for( let tag in compile ){
				
				const node = document.createElement("option");
				node.value = tag;
				datalist.appendChild(node);

			}

		}

	}



	// Build windows
	buildDatabaseList( id ){

		if( !DB_MAP[id] || !DB_MAP[id].listing )
			throw 'Trying to build DB list for unknown type: '+id+'. Map the type to DB_MAP in ModTools2.js';

		return Window.create(id, "Database", "", "database", DB_MAP[id].listing);
	}

	// Edit a text asset by id. ID can also be an object to edit directly, in which case it gets appended to data as {asset:}
	// Note that if you use an object directly it won't save the window, and should only be used in special cases like the dungeonAsset GameActions to save space
	buildAssetEditor( type, id, data, parent ){

		if( !DB_MAP[type] || !DB_MAP[type].asset)
			throw 'Asset editor not found for type '+type+", add it to DB_MAP in Modtools2.js";

		const asset = typeof id === 'object' ? id : this.mod.getAssetById(type, id);
		if( !asset )
			throw 'Asset not found: '+id;

		if( typeof data !== "object" )
			data = {};

		if( typeof id === "object" ){

			id = id.label || id.id;
			data.asset = asset;

		}
		

		const w = Window.create(
			id, 
			type, 
			asset.name || asset.label, 
			DB_MAP[type].icon || "pencil", 
			DB_MAP[type].asset, 
			data, 
			parent
		);

		return w;

	}

	// Create an asset linker window to link an asset to another
	/*
		baseAsset is the asset from the mod we want to put the item into
		baseKey is the key of the array in the asset we want to put the target asset into
		targetType is a type defined in DB_MAP of the assets we want to pick from
		data is {parentWindow:parentWindowUniqId, targetType:targetType} - targetType is supplied for windows updates if you modify one of the assets while you still have the picker open
	*/
	buildAssetLinker( parentWindow, baseAsset, baseKey, targetType, single ){

		if( !DB_MAP[targetType] || !DB_MAP[targetType].listing )
			throw 'Asset linker not found for type '+targetType+", add it to DB_MAP in Modtools2.js";

		return Window.create(
			baseKey,
			"linker",
			baseAsset.label,
			'linked-rings',
			DB_MAP[targetType].listing,
			{targetType:targetType, single:single},
			parentWindow
		);

	}


	closeAssetEditors( type, id ){

		const win = Window.getByTypeAndId(type, id);
		console.log("Getting windows by type and id", win);
		if( win )
			win.close();

	}

	// Closes the current mod
	closeMod(){

		Window.closeAll();
		this.mod = null;
		this.sideMenu.classList.toggle("hidden", true);
		this.modName.innerText = '';

	}




	// Converts 
	convertLegacyMod( modVersion = 0 ){

		const mod = this.mod;
		// Mod needs some assets broken out into their own table
		if( modVersion < 1 ){

			// Dungeons
			for( let dungeon of mod.dungeons ){

				// Break dungeon rooms out into their own thing
				for( let i in dungeon.rooms ){
					const room = dungeon.rooms[i];
					if( typeof room !== "object" )
						continue;

					const label = dungeon.label+'>>'+(room.index||0);
					dungeon.rooms[i].label = label;
					dungeon.rooms[i]._mParent = {
						type : 'dungeons',
						label : dungeon.label
					};
					
					this.mod.dungeonRooms.push(dungeon.rooms[i]);
					dungeon.rooms[i] = label;


				}

			}

			// Roleplay
			for( let rp of mod.roleplay ){

				for( let i in rp.stages ){

					const stage = rp.stages[i];
					if( typeof stage !== "object" )
						continue;

					const stageLabel = rp.label+'>>'+stage.index;
					stage.label = stageLabel;
					stage._mParent = {
						type : 'roleplay',
						label : rp.label
					};
					rp.stages[i] = stageLabel;
					mod.roleplayStage.push(stage);

					// Continue by doing the responses
					for( let o in stage.options ){

						const opt = stage.options[0];
						if( typeof opt !== "object" )
							continue;

						const optLabel = stageLabel+'>>'+o;
						opt.label = optLabel;
						opt._mParent = {
							type : 'roleplayStage',
							label : stageLabel
						};

						stage.options[i] = optLabel;
						mod.roleplayStageOption.push(opt);

					}

					// And the text objects
					for( let o in stage.text ){

						const opt = stage.text[0];
						if( typeof opt !== "object" )
							continue;

						const optLabel = stageLabel+'>>'+o;
						opt.label = optLabel;
						opt._mParent = {
							type : 'roleplayStage',
							label : stageLabel
						};

						stage.text[i] = optLabel;
						mod.texts.push(opt);

					}

				}

			}


			// Todo: Quest
			/*
			for( let rp of mod.roleplay ){

				for( let i in rp.stages ){

					const stage = rp.stages[i];
					if( typeof stage !== "object" )
						continue;

					const stageLabel = rp.label+'>>'+stage.index;
					stage.label = stageLabel;
					stage._mParent = {
						type : 'roleplay',
						label : rp.label
					};
					rp.stages[i] = stageLabel;
					mod.roleplayStage.push(stage);

					// Continue by doing the responses
					for( let o in stage.options ){

						const opt = stage.options[0];
						if( typeof opt !== "object" )
							continue;

						const optLabel = stageLabel+'>>'+o;
						opt.label = optLabel;
						opt._mParent = {
							type : 'roleplayStage',
							label : stageLabel
						};

						stage.options[i] = optLabel;
						mod.roleplayStageOption.push(opt);

					}

					// And the text objects
					for( let o in stage.text ){

						const opt = stage.text[0];
						if( typeof opt !== "object" )
							continue;

						const optLabel = stageLabel+'>>'+o;
						opt.label = optLabel;
						opt._mParent = {
							type : 'roleplayStage',
							label : stageLabel
						};

						stage.text[i] = optLabel;
						mod.texts.push(opt);

					}

				}

			}
			*/
			// Break up quests into
				// questRewards
				// questObjectives
					// questObjectiveEvents

			// Break up shops into
				// shopAssets

			// Shops
			for( let shop of mod.shops ){

				// Break out shop assets
				for( let i in shop.items ){

					const asset = shop.items[i];
					if( typeof asset !== "object" )
						continue;

					const label = shop.label+'>>'+(asset.label||i);
					asset.label = label;
					asset._mParent = {
						type : 'shops',
						label : shop.label
					};
					
					this.mod.shopAssets.push(asset);
					shop.items[i] = label;

					console.log("Split it off with label", label);

				}

			}

		}

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


