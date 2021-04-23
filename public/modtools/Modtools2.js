const TOOL_VERSION = 2;	// Version of the exporter

import Window from './WindowManager.js';
import {default as WebGL, Stage} from '../classes/WebGL.js';
import * as THREE from '../ext/THREE.js';
import {TransformControls} from '../ext/TransformControls.js';
import Mod from '../classes/Mod.js';


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
import * as EditorPlayerTemplateLoot from './editors/EditorPlayerTemplateLoot.js';
import * as EditorRoleplay from './editors/EditorRoleplay.js';
import * as EditorRoleplayStage from './editors/EditorRoleplayStage.js';
import * as EditorRoleplayStageOption from './editors/EditorRoleplayStageOption.js';
import * as EditorRoleplayStageOptionGoto from './editors/EditorRoleplayStageOptionGoto.js';
import * as EditorShop from './editors/EditorShop.js';
import * as EditorShopAsset from './editors/EditorShopAsset.js';
import * as EditorShopAssetToken from './editors/EditorShopAssetToken.js';
import * as EditorFaction from './editors/EditorFaction.js';
import * as EditorQuest from './editors/EditorQuest.js';
import * as EditorQuestReward from './editors/EditorQuestReward.js';
import * as EditorQuestObjective from './editors/EditorQuestObjective.js';
import * as EditorQuestObjectiveEvent from './editors/EditorQuestObjectiveEvent.js';
import * as EditorEncounter from './editors/EditorEncounter.js';
import * as EditorDungeon from './editors/EditorDungeon.js';
import * as EditorDungeonRoom from './editors/EditorDungeonRoom.js';
import * as EditorDungeonTemplate from './editors/EditorDungeonTemplate.js';
import * as EditorDungeonSubTemplate from './editors/EditorDungeonSubTemplate.js';
import * as EditorGallery from './editors/EditorGallery.js';
import Generic from '../classes/helpers/Generic.js';
import GameLib from '../classes/GameLib.js';
import ModRepo from '../classes/ModRepo.js';


// Window types that should be tracked
const TRACKED_WINDOWS = {
	"Database" : true,
	"My Mods" : true
};


// Maps database assets to functions
// Type : fn
// Type is named after the name of its array in Mod.js
const DB_MAP = {
	"texts" : { listing : EditorText.list, asset : EditorText.asset, help : EditorText.help, icon : '' },
	"conditions" : { listing : EditorCondition.list, asset : EditorCondition.asset, icon : 'check-mark', help : EditorCondition.help },
	"audioKits" : { listing : EditorAudioKit.list, asset : EditorAudioKit.asset, icon : 'speaker', help : EditorAudioKit.help },
	"hitFX" : { listing : EditorHitFX.list, asset : EditorHitFX.asset, icon : 'spiky-explosion', help : EditorHitFX.help },
	"assets" : { listing : EditorAsset.list, asset : EditorAsset.asset, icon : 'underwear', help : EditorAsset.help },
	"wrappers" : { listing : EditorWrapper.list, asset : EditorWrapper.asset, icon : 'jigsaw-box', help : EditorWrapper.help },
	"effects" : { listing : EditorEffect.list, asset : EditorEffect.asset, icon : 'fairy-wand', help : EditorEffect.help },
	"actions" : { listing : EditorAction.list, asset : EditorAction.asset, icon : 'juggler', help : EditorAction.help },
	"assetTemplates" : { listing : EditorAssetTemplate.list, asset : EditorAssetTemplate.asset, icon : 'mail-shirt', help : EditorAssetTemplate.help },
	"materialTemplates" : { listing : EditorMaterialTemplate.list, asset : EditorMaterialTemplate.asset, icon : 'wool', help : EditorMaterialTemplate.help },
	"actionLearnable" : { listing : EditorActionLearnable.list, asset : EditorActionLearnable.asset, icon : 'graduate-cap', help : EditorActionLearnable.help },
	"gameActions" : { listing : EditorGameAction.list, asset : EditorGameAction.asset, icon : 'joystick', help : EditorGameAction.help },
	"playerClasses" : { listing : EditorPlayerClass.list, asset : EditorPlayerClass.asset, icon : 'vitruvian-man', help : EditorPlayerClass.help },
	"players" : { listing : EditorPlayer.list, asset : EditorPlayer.asset, icon : 'mustache', help : EditorPlayer.help },
	"playerTemplates" : { listing : EditorPlayerTemplate.list, asset : EditorPlayerTemplate.asset, icon : 'anatomy', help : EditorPlayerTemplate.help },
	"playerTemplateLoot" : { listing : EditorPlayerTemplateLoot.list, asset : EditorPlayerTemplateLoot.asset, icon : 'open-treasure-chest', help : EditorPlayerTemplateLoot.help },
	"roleplay" : { listing : EditorRoleplay.list, asset : EditorRoleplay.asset, icon : 'talk', help : EditorRoleplay.help },
	"roleplayStage" : { listing : EditorRoleplayStage.list, asset : EditorRoleplayStage.asset, icon : 'conversation', help : EditorRoleplayStage.help },
	"roleplayStageOption" : { listing : EditorRoleplayStageOption.list, asset : EditorRoleplayStageOption.asset, icon : 'click', help : EditorRoleplayStageOption.help },
	"roleplayStageOptionGoto" : { listing : EditorRoleplayStageOptionGoto.list, asset : EditorRoleplayStageOptionGoto.asset, icon : 'click', help : EditorRoleplayStageOptionGoto.help },
	"shops" : { listing : EditorShop.list, asset : EditorShop.asset, icon : 'shopping-cart', help : EditorShop.help },
	"shopAssets" : { listing : EditorShopAsset.list, asset : EditorShopAsset.asset, icon : 'receive-money', help : EditorShopAsset.help },
	"shopAssetTokens" : { listing : EditorShopAssetToken.list, asset : EditorShopAssetToken.asset, icon : 'token', help : EditorShopAssetToken.help },
	"factions" : { listing : EditorFaction.list, asset : EditorFaction.asset, icon : 'tattered-banner', help : EditorFaction.help },
	"quests" : { listing : EditorQuest.list, asset : EditorQuest.asset, icon : 'scroll-quill', help : EditorQuest.help },
	"questRewards" : { listing : EditorQuestReward.list, asset : EditorQuestReward.asset, icon : 'open-treasure-chest', help : EditorQuestReward.help },
	"questObjectives" : { listing : EditorQuestObjective.list, asset : EditorQuestObjective.asset, icon : 'direction-sign', help : EditorQuestObjective.help },
	"questObjectiveEvents" : { listing : EditorQuestObjectiveEvent.list, asset : EditorQuestObjectiveEvent.asset, icon : 'annexation', help : EditorQuestObjectiveEvent.help },
	"encounters" : { listing : EditorEncounter.list, asset : EditorEncounter.asset, icon : 'kraken-tentacle', help : EditorEncounter.help },
	"dungeons" : { listing : EditorDungeon.list, asset : EditorDungeon.asset, icon : 'castle', help : EditorDungeon.help },
	"dungeonRooms" : { listing : EditorDungeonRoom.list, asset : EditorDungeonRoom.asset, icon : 'doorway', help : EditorDungeonRoom.help },
	"dungeonTemplates" : { listing : EditorDungeonTemplate.list, asset : EditorDungeonTemplate.asset, icon : 'tower-fall', help : EditorDungeonTemplate.help },
	"dungeonSubTemplates" : { listing : EditorDungeonSubTemplate.list, asset : EditorDungeonSubTemplate.asset, icon : 'tower-fall', help : EditorDungeonSubTemplate.help },
	"gallery" : { listing : EditorGallery.list, asset : EditorGallery.asset, icon : 'mona-lisa', help : EditorGallery.help },
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

		this.modRepo = new ModRepo();

		this.content = document.getElementById('content');
		this.topMenu = document.getElementById("topMenu");
		this.sideMenu = document.getElementById("libraryMenu");
		this.modName = document.querySelector("#modName > span.name");
		this.modDirty = document.querySelector("#modName > span.dirty");
		this.datalists = document.getElementById("datalists");

		this.dummyUploader = document.getElementById("dummyUploader");	// file input


		this.essentialOnly = parseInt(localStorage.editor_essentialOnly);	// In DB lists, only show essential information
		this.toggleEssentialOnly(this.essentialOnly);

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
		/*
		gl.onRender = function(){
			control.update();
		};
		*/
		

		this.dirty = false;
		
		Window.windowContainer = document.getElementById("windows");
		Window.minimizeContainer = document.getElementById("tray");

		const self = this;


		// Click the top menu
		this.topMenu.querySelectorAll("div[data-id]").forEach(el => {
			el.onclick = async evt => {
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
						this.dummyUploader.onchange = async event => {

							const mod = await Mod.import(event);

							if( mod )
								this.load(mod);

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
									html += 'Category: <select name="category">';
									for( let i in Mod.Category ){
										html += '<option value="'+Mod.Category[i]+'" '+(self.mod.category === Mod.Category[i] ? 'selected' : '')+'>'+i+'</option>';
									}
									html += '<br />';
									html += 'Description: <br />';
									html += '<span class="subtitle">If you intend to share this mod online, consider including what fetishes your mod caters to, if any.</span>';
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
										category = form.querySelector("select[name=category]").value,
										desc = form.querySelector("textarea[name=description]").value.trim()
									;

									if( !name || !desc )
										return;

									self.mod.name = name;
									self.mod.description = desc;
									self.mod.author = author;
									self.mod.category = category;

									self.modName.innerText = name;

									self.mod.save();
									this.close();
								};
	
							});
						});

						Window.addMenuOption("export", "Export", () => {

							++this.mod.buildNr;
							this.mod.version = TOOL_VERSION;
							this.mod.save();
							this.updateModName();

							const zip = new JSZip();
							zip.file('mod.json', JSON.stringify(this.mod.getSaveData()));
							zip.generateAsync({
								type:"blob",
								compression : "DEFLATE",
								compressionOptions : {
									level: 9
								}
							}).then(content => {

								const a = document.createElement('a');
								const url = URL.createObjectURL(content);

								a.setAttribute('href', url);
								a.setAttribute('download', this.mod.name.split(" ").join('_')+'_b'+(this.mod.buildNr)+'.fqmod');

								document.body.appendChild(a);
								a.click();
								a.remove();

							});

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
				else if( button.dataset.id === "view" ){
					Window.setMenu(button);

					
					Window.addMenuOption("essential", "DB List only essential (Alt+E) "+(this.essentialOnly ? '&#9745;' : '	&#9744;'), () => {
						this.toggleEssentialOnly();
					}, false);
					
				}

				else if( button.dataset.id === "online" ){
					
					Window.setMenu(button);

					const userData = await this.modRepo.isLoggedIn();

					if( !userData ){

						Window.addMenuOption("login", "Log In", () => {

							Window.create("JasX Login", "Log in", "", "wireframe-globe", function(){

								let html = '<h1>JasX Log In</h1>';
								html += '<p>If you don\'t already have a JasX account, you can create one at <a href="https://jasx.org">https://jasx.org</a></p>';
								html += '<form class="center">';
									html += '<input type="text" name="username" placeholder="Username" required /><br />';
									html += '<input type="password" name="password" placeholder="Password" required /><br />';
									html += '<input type="submit" value="Log In" />';
								html += '</form>';
								this.setDom(html);

								this.dom.querySelector("form").onsubmit = async event => {
									event.preventDefault();

									const form = event.currentTarget,
										name = form.querySelector("input[name=username]").value.trim(),
										pass = form.querySelector("input[name=password]").value.trim()
									;
									if( !name || !pass )
										return;

									if( await self.modRepo.logIn(name, pass) ){

										this.close();

									}

								};

							});

						});

					}

					// While logged in
					else{

						Window.addMenuOption('mymods', 'My Mods', () => {
							
							this.drawMyMods();

						});

						Window.addMenuOption('logout', 'Log Out ('+esc(userData.name)+')', () => {
							this.modRepo.logOut();
						});

					}

					/*
					Window.addMenuOption("open", "Open (Ctrl+O)", () => { self.loadWindow(); });

					Window.addMenuOption("import", "Import", () => { 
						
						this.dummyUploader.setAttribute("accept", ".fqmod");
						this.dummyUploader.onchange = async event => {

							const mod = await Mod.import(event);

							if( mod )
								this.load(mod);

							this.dummyUploader.value = "";

						};

						this.dummyUploader.click();
					});
					*/
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
			// Ctrl+E - Rebuild active
			if( event.key === 'e' && event.altKey ){
				event.preventDefault();
				this.toggleEssentialOnly();
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

		if( !win ){
			console.error("Undefined win", win);
			return;
		}

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
		state.custom = win.custom;

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
					win = this.buildAssetEditor(val.type, val.id, undefined, undefined, val.custom);
				}
				else if( val.type === 'My Mods' )
					win = await this.drawMyMods();
				else{
					console.error("Ignoring window state for", data, "because it's an unsupported type. Add it to TRACKED_WINDOWS (or DB_MAP if a mod asset)");
					continue;
				}
			}catch(err){
				console.error(err);
				continue;
			}

			if( !win )
				return;
			
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
				html += '<tr><th>ID</th><th>Name</th><th>Author</th><th>Description</th><th>Build</th><th>Editor V</th></tr>';
			for( let mod of mods ){

				html += '<tr data-id="'+esc(mod.id)+'">';
					html += '<td>'+esc(mod.id)+'</td>';
					html += '<td>'+esc(mod.name)+'</td>';
					html += '<td>'+esc(mod.author)+'</td>';
					html += '<td>'+esc(mod.description)+'</td>';
					html += '<td>'+esc(mod.buildNr)+'</td>';
					html += '<td>'+esc(mod.version)+'</td>';
				html += '</tr>';

			}
			html += '</table>';
			
			this.setDom(html);

			this.dom.querySelectorAll("table.selectable tr[data-id]").forEach(el => el.onclick = async event => {
				
				const mod = event.currentTarget.dataset.id;
				for( let m of mods ){

					if( m.id === mod ){

						if( event.ctrlKey ){

							const del = await m.delete(true);
							if( del && self.mod && m.id === self.mod.id )
								self.closeMod();

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
		this.modName.innerText = (esc(this.mod.name) || "Unnamed Mod") + ' b'+this.mod.buildNr;
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


		// We're working on the root mod
		if( mod.id !== "MAIN" ){

			const mods = await Mod.getAll();
			let main = null;
			for( let mod of mods ){
				if( mod.id === "MAIN" ){
					
					console.log("Using a custom main mod");
					main = mod;

				}
			}

			const parentMods = [
				main ? main : await GameLib.getMainMod()
			];

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
		}

		/*

			// Create a copy of our mod onto the parent mod
			for( let table in this.mod ){

				if( !Array.isArray(this.mod[table]) )
					continue;

				this.parentMod[i].push(...this.mod[i]);

			}

		*/
		

		this.setDirty(false);
		this.mod = mod;
		Window.closeAll();

		mod.runLegacyConversion();

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

	// Tries to first fetch an asset by label/id from mod, if that doesn't exist, try official 
	getAssetById(...args){
		let out = this.mod.getAssetById(...args);
		if( out )
			return out;

		return this.parentMod.getAssetById(...args);

	}

	getListObjectParent(...args){
		let out = this.mod.getListObjectParent(...args);
		if( out )
			return out;

		return this.parentMod.getListObjectParent(...args);

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
	buildAssetEditor( type, id, data, parent, custom ){

		if( !DB_MAP[type] || !DB_MAP[type].asset)
			throw 'Asset editor not found for type '+type+", add it to DB_MAP in Modtools2.js";

		//console.log("Getting asset", type, id);
		let asset = typeof id === 'object' ? id : this.mod.getAssetById(type, id, true);


		if( !asset )
			asset = this.parentMod.getAssetById(type, id);


		if( !asset )
			throw 'Asset not found: '+id+" type: "+type;
		

		// If we try to edit a library asset, we'll have to crete an extension
		if( asset.__MOD ){

			// See if it already exists. Prefer label.
			const newAsset = {
				_e : asset.label || asset.id
			};

			if( Mod.UseID.includes(type) )
				newAsset.id = Generic.generateUUID();
			else
				newAsset.label = asset.label+'_ext';

			if( asset._mParent ){

				// In an extension, mParent points towards the original asset, original assets in an extension point towards the extension parent 
				newAsset._mParent = {
					type: asset._mParent.type,
					label : asset._mParent.label,
				};

			}

			this.mod[type].push(newAsset);
			asset = newAsset;
			this.setDirty(true);
			
			console.log("Created asset", newAsset);

			Window.rebuildWindowsByTypeAndId('Database', type);
			
		}


		if( typeof data !== "object" )
			data = {};

		if( typeof id === "object" ){

			id = id.label || id.id;
			data.asset = asset;

		}
		else
			id = asset.label || asset.id;

		console.log("Creating window", id, type, asset, data, parent);
		const w = Window.create(
			id, 
			type, 
			asset.name || asset.label || asset.id, 
			DB_MAP[type].icon || "pencil", 
			DB_MAP[type].asset, 
			data, 
			parent,
			custom
		);

		if( DB_MAP[type].help )
			w.setHelp(DB_MAP[type].help);


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



	toggleEssentialOnly( on ){
		
		if( on === undefined )
			this.essentialOnly = this.essentialOnly ? 0 : 1;
		else 
			on = parseInt(on);

		localStorage.editor_essentialOnly = this.essentialOnly;
		this.content.classList.toggle('essentialOnly', Boolean(this.essentialOnly));

	}

	async mergeMod( id ){

		const mod = await Mod.getByID(id);
		if( !mod )
			throw 'Mod not found';

		this.mod.mergeMod(mod);

	}

	// Takes a roleplay nested in ex a game action and unrolls it, adding it to the flat DB and letting you replace the nested one with the flat one
	unrollRoleplay( rpObj ){

		let rp = rpObj;
		if( !rp.id )
			rp.id = Generic.generateUUID();
		if( !rp.label )
			rp.label = rp.id;

		this.mod.roleplay.push(rp);
		console.log("Added RP: ", rp);

		if( rp.stages ){

			rp.stages = rp.stages.map((stage, index) => {

				stage.id = stage.label = rp.label+'>>'+index;
				console.log("Added Stage", stage.label);
				this.mod.roleplayStage.push(stage);
				stage._mParent = {type:'roleplay', label:rp.label};

				if( stage.options ){

					stage.options = stage.options.map((opt, index) => {

						opt.id = opt.label = stage.label+'>>'+index;
						console.log("Added option", opt.id);
						this.mod.roleplayStageOption.push(opt);
						opt._mParent = {type:'roleplayStage', label:stage.id};

						return opt.label;

					});

				}

				if( stage.text ){

					if( typeof stage.text === 'string' )
						stage.text = [{text:stage.text, en:false}];

					stage.text = stage.text.map((text, index) => {

						text.id = text.label = stage.id+'>>'+index;
						console.log("Added text", text.id);
						text._mParent = {type:'roleplayStage', label:stage.id};
						this.mod.texts.push(text);
						
						return text.id;

					});

				}

				
				return stage.label;

			});

		}



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

			for( let quest of mod.quests ){

				const mparent = {
					type : 'quests',
					label : quest.label
				};

				// rewards
				for( let i in quest.rewards ){

					const reward = quest.rewards[i];
					if( typeof reward !== "object" )
						continue;

					const label = quest.label+'>>'+i;
					reward.label = label;
					reward._mParent = mparent;
					mod.questRewards.push(reward);
					quest.rewards[i] = reward;

				}

				const convertObjectives = (arr, prefix='') => {

					// objectives
					for( let i in arr ){

						const obj = arr[i];
						if( typeof obj !== "object" )
							continue;

						const label = quest.label+'>>'+prefix+i;
						obj.label = label;
						obj._mParent = mparent;
						mod.questObjectives.push(obj);
						arr[i] = obj;

					}

				};

				convertObjectives(quest.objectives);
				convertObjectives(quest.completion_objectives);

			}

			
			// Make sure every text has an id
			for( let text of mod.texts ){

				if( !text.id )
					text.id = Generic.generateUUID();

			}

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





	// Draws online mods
	drawMyMods(){

		const self = this;
		return Window.create("My Mods", "My Mods", "", "wireframe-globe", async function(){

			const mods = await self.modRepo.listMyMods();

			let html = '<div class="center">'+
				'<h1>My Mods</h1>';
				html += '<p>Here you can upload or update your mods to the official mod repo.</p>';
				
				html += '<label>Upload new mod: <input type="file" class="modUpload" data-token="_NEW_" accept=".fqmod"  /></label>';
				html += '<p class="subtitle">Please note that by uploading files to the mod repo, you agree to license your mod file under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">Creative Commons By</a>.</p>';

			html += '</div>';

			html += '<br /><br />';

			if( !mods.mods.length )
				html += '<p>You have not shared any mods yet!</p>';
			else{

				html += '<table class="selectable allowMarking">';
				html += '<tr class="noselect">'+
					'<th>Public</th>'+
					'<th>Name</th>'+
					'<th>Category</th>'+
					'<th>Build</th>'+
					'<th>FQ</th>'+
					'<th>Last Update</th>'+
					'<th>Filesize</th>'+
					'<th>Created</th>'+
					'<th>Upload New File</th>'+
					'<th>Download</th>'+
					'<th>Delete</th>'+
				'</tr>';

				for( let mod of mods.mods ){

					const dateUpdated = new Date(mod.date_updated),
						dateCreated = new Date(mod.date_created);
					

					html += '<tr class="noselect" data-token="'+esc(mod.token)+'">';
						html += '<td><input type="checkbox" class="public" '+(mod.public ? 'checked' : '')+' /></td>';
						html += '<td>'+esc(mod.name)+'</td>';
						html += '<td>'+esc(mod.category)+'</td>';
						html += '<td>'+esc(mod.build_nr)+'</td>';
						html += '<td>'+esc(mod.fq_version)+'</td>';
						html += '<td title="'+esc(mod.date_updated)+'">'+fuzzyTime(dateUpdated.getTime())+'</td>';
						html += '<td>'+fuzzyFileSize(mod.filesize)+'</td>';
						html += '<td title="'+esc(mod.date_created)+'">'+fuzzyTime(dateCreated)+'</td>';
						html += '<td><input type="file" class="modUpload" data-token="'+esc(mod.token)+'" accept=".fqmod"  /></td>';
						html += '<td><input type="button" value="Download" class="download" /></td>';
						html += '<td><input type="button" value="Delete" class="delete" /></td>';
					html += '</tr>';

				}

				html += '</table>';

			}

			this.setDom(html);

			this.dom.querySelectorAll(".modUpload").forEach(el => { 
				
				el.onchange = async event => {

					if( !el.value )
						return;

					let token = event.target.dataset.token;
					if( token === '_NEW_' )
						token = false;

					if( !event.target.files.length )
						return;

					await self.modRepo.updateMod(token, event.target.files[0]);

					this.rebuild();
				};

			});

			this.dom.querySelectorAll("input.public").forEach(el => {

				el.onchange = async event => {

					await self.modRepo.togglePublic(
						event.target.parentNode.parentNode.dataset.token, 
						event.target.checked
					);
					this.rebuild();

				};

			});

			this.dom.querySelectorAll("input.download").forEach(el => {

				el.onclick = async event => {
					self.modRepo.downloadMod(event.target.parentNode.parentNode.dataset.token);
				};

			});

			this.dom.querySelectorAll("input.delete").forEach(el => {

				el.onclick = async event => {

					if( !confirm("Are you sure you want to delete your mod from the repo?") )
						return;

					if( await self.modRepo.deleteMod(event.target.parentNode.parentNode.dataset.token) )
						this.rebuild();
				};

			});
			

			self.saveWindowStates();

		});

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


