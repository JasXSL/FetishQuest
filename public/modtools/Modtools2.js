const TOOL_VERSION = 4;	// Version of the exporter

// Mod is needed first
import Mod from '../classes/Mod.js';

import Window from './WindowManager.js';
import {default as WebGL} from '../classes/WebGL.js';
import * as THREE from '../ext/THREE.js';
import {TransformControls} from '../ext/TransformControls.js';


import * as EditorStory from './editors/EditorStory.js';
import * as EditorText from './editors/EditorText.js';
import * as EditorCondition from './editors/EditorCondition.js';
import * as EditorAudioKit from './editors/EditorAudioKit.js';
import * as EditorAudioTrigger from './editors/EditorAudioTrigger.js';
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
import * as EditorEncounterEvent from './editors/EditorEncounterEvent.js';
import * as EditorDungeon from './editors/EditorDungeon.js';
import * as EditorDungeonRoom from './editors/EditorDungeonRoom.js';
import * as EditorDungeonTemplate from './editors/EditorDungeonTemplate.js';
import * as EditorDungeonSubTemplate from './editors/EditorDungeonSubTemplate.js';
import * as EditorGallery from './editors/EditorGallery.js';
import * as EditorLoadingTip from './editors/EditorLoadingTip.js';
import * as EditorBook from './editors/EditorBook.js';
import * as EditorBookPage from './editors/EditorBookPage.js';
import * as EditorFetish from './editors/EditorFetish.js';
import * as EditorArmorEnchant from './editors/EditorArmorEnchant.js';
import * as EditorGraph from './editors/EditorGraph.js';
import Generic from '../classes/helpers/Generic.js';
import ModRepo from '../classes/ModRepo.js';
import Condition from '../classes/Condition.js';
import Calculator from '../classes/Calculator.js';
import Game from '../classes/Game.js';


// Window types that should be tracked
const TRACKED_WINDOWS = {
	"Database" : true,
	"My Mods" : true,
	"Node Editor" : true,
};


// Maps database assets to functions
// Type : fn
// Type is named after the name of its array in Mod.js
const DB_MAP = {
	"texts" : { listing : EditorText.list, asset : EditorText.asset, help : EditorText.help, icon : '' },
	"conditions" : { listing : EditorCondition.list, asset : EditorCondition.asset, icon : 'check-mark', help : EditorCondition.help },
	"audioKits" : { listing : EditorAudioKit.list, asset : EditorAudioKit.asset, icon : 'speaker', help : EditorAudioKit.help },
	"audioTriggers" : { listing : EditorAudioTrigger.list, asset : EditorAudioTrigger.asset, icon : 'screaming', help : EditorAudioTrigger.help },
	"hitFX" : { listing : EditorHitFX.list, asset : EditorHitFX.asset, icon : 'spiky-explosion', help : EditorHitFX.help },
	"assets" : { listing : EditorAsset.list, asset : EditorAsset.asset, icon : 'underwear', help : EditorAsset.help },
	"armorEnchants" : { listing : EditorArmorEnchant.list, asset : EditorArmorEnchant.asset, icon : 'chain-mail', help : EditorArmorEnchant.help },
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
	"roleplay" : { listing : EditorRoleplay.list, asset : EditorRoleplay.asset, icon : 'talk', help : EditorRoleplay.help, },
	"roleplayStage" : { listing : EditorRoleplayStage.list, asset : EditorRoleplayStage.asset, icon : 'conversation', help : EditorRoleplayStage.help },
	"roleplayStageOption" : { listing : EditorRoleplayStageOption.list, asset : EditorRoleplayStageOption.asset, icon : 'click', help : EditorRoleplayStageOption.help },
	"roleplayStageOptionGoto" : { listing : EditorRoleplayStageOptionGoto.list, asset : EditorRoleplayStageOptionGoto.asset, icon : 'click', help : EditorRoleplayStageOptionGoto.help },
	"shops" : { listing : EditorShop.list, asset : EditorShop.asset, icon : 'shopping-cart', help : EditorShop.help },
	"shopAssets" : { listing : EditorShopAsset.list, asset : EditorShopAsset.asset, icon : 'receive-money', help : EditorShopAsset.help },
	"shopAssetTokens" : { listing : EditorShopAssetToken.list, asset : EditorShopAssetToken.asset, icon : 'token', help : EditorShopAssetToken.help },
	"factions" : { listing : EditorFaction.list, asset : EditorFaction.asset, icon : 'tattered-banner', help : EditorFaction.help },
	"story" : { listing : EditorStory.list, asset : EditorStory.asset, icon : 'enlightenment', help : EditorStory.help },
	"quests" : { listing : EditorQuest.list, asset : EditorQuest.asset, icon : 'scroll-quill', help : EditorQuest.help },
	"questRewards" : { listing : EditorQuestReward.list, asset : EditorQuestReward.asset, icon : 'open-treasure-chest', help : EditorQuestReward.help },
	"questObjectives" : { listing : EditorQuestObjective.list, asset : EditorQuestObjective.asset, icon : 'direction-sign', help : EditorQuestObjective.help },
	"questObjectiveEvents" : { listing : EditorQuestObjectiveEvent.list, asset : EditorQuestObjectiveEvent.asset, icon : 'annexation', help : EditorQuestObjectiveEvent.help },
	"encounters" : { listing : EditorEncounter.list, asset : EditorEncounter.asset, icon : 'kraken-tentacle', help : EditorEncounter.help },
	"encounterEvents" : { listing : EditorEncounterEvent.list, asset : EditorEncounterEvent.asset, icon : 'boxing-ring', help : EditorEncounterEvent.help },
	"dungeons" : { listing : EditorDungeon.list, asset : EditorDungeon.asset, icon : 'castle', help : EditorDungeon.help },
	"dungeonRooms" : { listing : EditorDungeonRoom.list, asset : EditorDungeonRoom.asset, icon : 'doorway', help : EditorDungeonRoom.help },
	"dungeonTemplates" : { listing : EditorDungeonTemplate.list, asset : EditorDungeonTemplate.asset, icon : 'tower-fall', help : EditorDungeonTemplate.help },
	"dungeonSubTemplates" : { listing : EditorDungeonSubTemplate.list, asset : EditorDungeonSubTemplate.asset, icon : 'tower-fall', help : EditorDungeonSubTemplate.help },
	"gallery" : { listing : EditorGallery.list, asset : EditorGallery.asset, icon : 'mona-lisa', help : EditorGallery.help },
	"loadingTip" : { listing : EditorLoadingTip.list, asset : EditorLoadingTip.asset, icon : 'evil-book', help : EditorLoadingTip.help },
	"books" : { listing : EditorBook.list, asset : EditorBook.asset, icon : 'archive-register', help : EditorBook.help },
	"bookPages" : { listing : EditorBookPage.list, asset : EditorBookPage.asset, icon : 'folded-paper', help : EditorBookPage.help },
	"fetishes" : { listing : EditorFetish.list, asset : EditorFetish.asset, icon : 'love-mystery', help : EditorFetish.help },
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
		this.dummyGame = new Game();

		this.dummyUploader = document.getElementById("dummyUploader");	// file input


		this.essentialOnly = parseInt(localStorage.editor_essentialOnly);	// In DB lists, only show essential information
		this.showParented = parseInt(localStorage.editor_showParented);
		this.toggleEssentialOnly(this.essentialOnly);
		this.toggleParented(this.showParented);

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

					Window.addMenuOption("import", "Import File", () => { 
						
						this.dummyUploader.setAttribute("accept", ".fqmod");
						this.dummyUploader.onchange = async event => {

							const mod = await Mod.import(event);

							if( mod )
								this.load(mod);

							this.dummyUploader.value = "";

						};

						this.dummyUploader.click();
					});

					Window.addMenuOption("import", "Import JSON", () => { 
						
						this.drawJsonImporter();
						
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
							this.mod.exportFile(TOOL_VERSION, true);
							this.updateModName();
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
					Window.addMenuOption("essential", "DB List parented objects (Advanced) "+(this.showParented ? '&#9745;' : '	&#9744;'), () => {
						this.toggleParented();
					}, false);
					
				}
				else if( button.dataset.id === "cheatSheet" )
					this.drawCheatSheet();
				else if( button.dataset.id === "notepad" )
					this.drawNotepad();

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
			if( event.key === 'o' && (event.ctrlKey || event.metaKey) ){
				event.preventDefault();
				this.loadWindow();
			}

			// Ctrl+S Save
			if( event.key === 's' && (event.ctrlKey || event.metaKey) ){
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
			if( event.key === 'e' && event.altKey && (event.ctrlKey || event.metaKey) ){
				event.preventDefault();
				Window.rebuildAll();
			}

			// Ctrl+E - Rebuild active
			if( event.key === 'e' && (event.ctrlKey || event.metaKey) ){
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
		

		EditorGraph.begin();



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

		if( win.id === 'Notepad' && !this.loading )
			delete localStorage.editorNotepadOpen;
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
				else if( val.type === "Node Editor" )
					win = await this.buildNodeEditor(val.id, undefined, undefined, val.custom);
				else{
					console.error("Ignoring window state for", data, "because it's an unsupported type. Add it to TRACKED_WINDOWS (or DB_MAP if a mod asset, or NODE_MAP if node editor)");
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

			html += '<input type="button" class="cloneMainMod" value="Clone Main Mod" title="Make a copy of the main mod, useful to mess around with the main game without extending it" />';
			
			this.setDom(html);

			this.dom.querySelectorAll("table.selectable tr[data-id]").forEach(el => el.onclick = async event => {
				
				const mod = event.currentTarget.dataset.id;
				for( let m of mods ){

					if( m.id === mod ){

						if( event.ctrlKey || event.metaKey ){

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

			this.dom.querySelector("input.cloneMainMod").onclick = async () => {
				console.log("Todo, copy main mod");
				
				await glib.loadMainMod();
				const mod = glib._main_mod.clone();
				mod.g_resetID();
				mod.save();
				self.load(mod);
			};


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
				main ? main : await Mod.getMainMod()
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

		if( localStorage.editorNotepadOpen )
			this.drawNotepad();

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

		console.log("Searching ", args);
		let out = this.mod.getListObjectParent(...args);
		if( !out )
			out = this.parentMod.getListObjectParent(...args);
		console.log("Out", out);
		return out;

	}

	// Builds the autocomplete datalists
	buildDataLists(){
		
		const lists = [
			'actions',
			// Find voice conditions, take out the voices
			{	
				label : 'voices',
				fn : () => {
					const compile = {};
					this.mod.conditions.concat(this.parentMod.conditions).forEach(el => {

						if( el.type === Condition.Types.voice && el.data.label ){
							toArray(el.data.label).forEach(voice => {
								compile[voice] = true;
							});
						}
					});
					return compile;
				}
			},
			{
				label : 'mathTargs',
				fn : () => {
					return Calculator.Targets;
				}
			}
		];
		for( let db of lists ){

			let compile = {};
			let label = db;
			if( typeof db === 'object' ){
				compile = db.fn();
				label = db.label;
			}
			else
				this.mod[db].concat(this.parentMod[db]).forEach(el => compile[el.label] = true);

			let set = 'datalist_'+label;
			const existing = this.datalists.querySelector(set);
			if( existing )
				existing.remove();

			const datalist = document.createElement("datalist");
			datalist.id = set;
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
			
			console.trace("Created asset", newAsset, "from", id, data, parent);

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

		//console.log("Creating window", id, type, asset, data, parent);


		const w = Window.create(
			id, 
			type, 
			(asset.name || asset.label || asset.id), 
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

	buildNodeEditor( id, data, parent, custom ){

		const w = Window.create(
			id,  						// id
			'Node Editor', 						// type
			"Node Graph Editor",	// name
			"pencil", 									// icon
			EditorGraph.asset, 								// on spawn 
			data || {}, 										// asset
			parent,										// parent
			custom 											// custom
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

		if( !this.hasDB(targetType) )
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

	// Library name has a listing handler
	hasDB( targetType ){
		return ( DB_MAP[targetType] && DB_MAP[targetType].listing );
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
			this.essentialOnly = parseInt(on);

		localStorage.editor_essentialOnly = this.essentialOnly;
		this.content.classList.toggle('essentialOnly', Boolean(this.essentialOnly));

	}

	toggleParented( on ){
		if( on === undefined )
			this.showParented = this.showParented ? 0 : 1;
		else
			this.showParented = parseInt(on);
		
		localStorage.editor_showParented = this.showParented;
		this.content.classList.toggle('showParented', Boolean(this.showParented));

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

			let html = '<div class="center">'+
				'<h1>My Mods</h1>';

			let mods = await self.modRepo.listMyMods();
			if( !mods ){

				html += '<p>You have been logged out, try logging in again.</p>';
				this.setDom(html+'</div>');
				return;

			}

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

	// Draws the cheat sheet
	drawCheatSheet(){

		const self = this;
		return Window.create("Cheat Sheet", "Cheat Sheet", "", "cursed-star", async function(){

			let html = '<h2>Basics</h2>';
			html += '<p><strong>Primer</strong>: FQ mods consist of multiple assets that are linked together. All directly editable assets types are in the left menu, which will display their library tables. They are linked together using IDs and Labels.</p>'+
			'<p><strong style="color:#FAA">Only change a label when creating a new asset, changing a label afterwards will not update it in linked assets and will show up as missing.</strong></p>';
			html += '<p>Some assets will link to other assets, these show up as a linked table with <strong>Library</strong> and <strong>Unique</strong> buttons. Clicking the Library button will open an asset linker from that asset\'s public table. Pressing Unique will create a unique asset linked only to the parent. Use Unique when creating assets that will only be used once, such as door game actions in a dungeon. Pick Library for anything else.</p>';
			
			html += '<h2>Modifier Keys</h2>';
			html += '<p>Use <strong>Control</strong> on an asset to remove it. When used in a database it removes the asset entirely from the database. Note that it doesn\'t remove it from any linked assets. When used in a linked table, it removes the asset only from that linked table, but it stays in the library (unless unique).</p>';
			html += '<p>Use <strong>Alt</strong> in a library table to clone an asset.</p>';
			
			html += '<h2>Extending the Base Game</h2>';
			html += '<p>Grey assets in library/linked tables are part of the main game. Clicking one of these assets will create an extension (experimental) which allows you to modify the base game. Extended assets have blue text. Control clicking one of these will delete the extension. The linked tables will show MAIN or THIS where MAIN means the asset is part of the main mod, and THIS is part of your active mod.</p>';
			
			html += '<h2>MathVars/Formulas</h2>';
			html += '<p>Some fields will specify that you can use a formula. This means you can use mathvars. These are variables you can get with game.getMathVars() in the browser console in a game. Dungeon/rp vars (dVars/rpVars) can have player specific variables set. These are set by using a GameAction of dungeonVar or setRpVar and supplying at least one target constant. To use a player specific var, prefix the var with @@ and end with _TargetConst. Ex "@@rp_rpLabel_rpVar_Target0" or "@@d_dungeonLabel_dvar_Target0".</p>';
			html += '<p>The following is a list of target constants you can use in texts and mathvar fields.</p>';
			html += `<ul>
				<li>Targets: SET: Sets value on all event targets. GET: Sums the values of all event targets.</li>
				<li>Sender: SET: Sets value on event sender. GET: Gets value of event sender.</li>
				<li>TargetN: SET: Set value on a specific target from the event by index, such as Target0, Target1. GET: Same, but gets.</li>
				<li>RpTargets: SET: Sets value on all RP targets. GET: Gets the sum of all RP target values.</li>
				<li>RpTargetN: SET: Sets value on a single RP target by index such as RpTarget0, RpTarget1. GET: Gets the value for a specific RP target.</li>
				<li>Set: SET: Sets value on all players with an existing truthy value. GET: Returns the nr of players with an existing truthy value.</li>
				<li>TeamN: SET: Sets value on all players belonging to a team, such as Team0 for the player team. GET: Sums the value of all players on said team.</li>
			</ul>`;
			html += '<p>You can also set an rpVar to a string by starting the value with $$. Note that trying to use a string var in a formula will throw an error, as formulas only work on numbers. Use mathVarCompare conditions to compare string vars instead.</p>';
			html += '<p>To access a player specific mathvar, the syntax is @@path_to_mathvar_Target, ex @@rp_myEvent_myVar_Target0 to get the mathvar myVar from the roleplay myEvent, for the first player of the event.</p>';
			html += '<p>As a shortcut you can use %rp in a mathvar to target the currently active RP. Useful if you want use a set of conds/gameActions in multiple RPs. Ex if you have an active rp labeled "clickCounter" and var "numClicks", %rp_numClicks is the same as typing rp_clickCounter_numClicks</p>';
			html += '<p>You can use %d the same way for dungeon vars.</p>';
			html += '<p>You can combine @@ and %rp/%d to target the currently active RP, ex @@%rp_Target0 instead of rp_myEvent_myVar_Target0.</p>';
			html += '<p>The following examples assumes a game with 3 players (pl0, pl1, pl2) and an RP/Dungeon with the var "i" set to {"pl0":1,"pl1":0,"pl2":5}</p>';
			html += '<table>';
				html += '<tr><th>Asset Type</th><th>Formula</th><th>Result</th><th>Explanation</th></tr>';
				html += '<tr>'+
					'<td>Formula Condition</td>'+
					'<td>@@%rp_i_Set==g_team_0</td>'+
					'<td>false</td>'+
					'<td>@@%rp_i_Set gets the nr of players with non-false data set on the i rpVar of the active roleplay, in this case 2, because pl1 is set to 0. Then compares that to nr of players on team 0 (player team). Can be useful in making RPs where every player gets to do something once.</td>'+
				'</tr>';
				html += '<tr>'+
					'<td>Formula Condition</td>'+
					'<td>@@%rp_i_Target0==0</td>'+
					'<td>false</td>'+
					'<td>Checks if the first target included in the event has the i rpVar set to 0 or isn\'t set yet.</td>'+
				'</tr>';
				html += '<tr>'+
					'<td>setRpVar gameAction</td>'+
					'<td>id: i, value:@@%rp_i_Target0+1, targets: Target0</td>'+
					'<td>n/a</td>'+
					'<td>Adds 1 to the current value of the first player of the event.</td>'+
				'</tr>';
				html += '<tr>'+
					'<td></td>'+
					'<td></td>'+
					'<td></td>'+
					'<td></td>'+
				'</tr>';
				
				

			html += '</table>';

			this.setDom(html);

			self.saveWindowStates();
		});


	}	

	drawJsonImporter(){

		const self = this;
		return Window.create("JSON Import", "JSON Importer", "", "convergence-target", async function(){

			let html = '<h2>JSON Importer</h2>';
			html += '<div class="error red bold"></div>';
			html += '<div class="notices green"></div>';
			html += '<p>This tool is used to MERGE a small amount of assets from one mod to another by checking them in their database listing and hitting export, then pasting into the text box below. Note that this tool is fairly experimental, and you may need manual editing after importing. Save a backup of your mod before doing this, and don\'t paste code from people you don\'t trust.</p>';
			html += '<form class="jsonImport">';
				html += '<label>Allow overwrite <input type="checkbox" class="allowOverwrite" /></label>';
				html += '<br /><input type="submit" class="merge" />';
				html += '<br />JSON Data:<br />';
				html += '<textarea class="json" style="width:100%; min-height:20vh;">{}</textarea>';
			html += '</form>';

			this.setDom(html);

			const err = this.dom.querySelector("div.error");
			const note = this.dom.querySelector("div.notices");
			this.dom.querySelector("form.jsonImport").addEventListener('submit', event => {
				event.preventDefault();

				err.innerHTML = note.innerHTML = '';

				let errors = [];
				try{

					const allowOverwrite = this.dom.querySelector("input.allowOverwrite").checked;
					const data = JSON.parse(this.dom.querySelector('textarea.json').value);


					const mod = self.mod;
					
					let inserts = {};
					let overwrites = {};
					
					for( let modField in data ){

						if( !Array.isArray(mod[modField]) ){
							errors.push("Unknown database: "+modField);
							continue;
						}

						let dbArray = data[modField];
						if( !Array.isArray(dbArray) ){
							errors.push("Invalid field, must be array: "+modField);
							continue;
						}

						
						for( let asset of dbArray ){

							if( typeof asset !== 'object' ){
								errors.push("Asset ignored. Not an object: "+esc(JSON.stringify(asset), true));
								continue;
							}

							let id = asset.label || asset.id;

							let existing = mod.getAssetById(modField, asset.label || asset.id, false);
							if( existing && !allowOverwrite ){

								errors.push("Asset ignored. Already exists in mod: "+esc(asset.label || asset.id, true)+' ('+esc(modField)+')');
								continue;

							}

							const overwritten = mod.mergeAsset( modField, asset );

							// Remove from existing
							if( overwritten ){

								if( !overwrites[modField] )
									overwrites[modField] = 0;
								++overwrites[modField];

							}
							if( !inserts[modField] )
								inserts[modField] = 0;
							++inserts[modField];

						}

					}

					let out = '';
					for( let i in inserts ){
						out += inserts[i]+' '+i+' inserted '+(overwrites[i] ? '['+overwrites[i]+' REPLACED]' : '')+'<br />';
					}
					if( Object.keys(inserts).length )
						self.setDirty(true);

					note.innerHTML = out;

				}catch(error){
					console.error(error);
					errors.push(error.message || error);
				}

				err.innerHTML = errors.join('<br />');

			});

			self.saveWindowStates();
		});

	}	

	drawNotepad(){

		localStorage.editorNotepadOpen = 1;
		const self = this;
		const w = Window.create("Notepad", "Notes", "", "notebook", async function(){

			let text = localStorage.editorNotepad || 'This is a basic notepad. It\'s bound to your browser, not your mod. Click anywhere to edit.';
	
			let html = '<pre style="position:absolute; top:-2%; left:1%; right:1%; bottom:-2%; overflow:auto; tab-size:4" class="notepad" contenteditable>'+
				esc(text, false)+
			'</pre>';

			this.setDom(html);

			const notepad = this.dom.querySelector('pre.notepad');
			notepad.addEventListener('input', e => {
				localStorage.editorNotepad = notepad.innerText;
			});

			notepad.addEventListener('keydown', e => {
				if( e.which === 9 ){
					e.preventDefault();

					const sel = window.getSelection();
					if( sel && sel.getRangeAt && sel.rangeCount ){

						const range = sel.getRangeAt(0);
						range.deleteContents();
						range.insertNode( document.createTextNode('\t') );
						sel.modify("move", "right", "character");
						
					}
				}
			});

			self.saveWindowStates();
		});

		return w;

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


