import Window from './WindowManager.js';
import {default as WebGL, Stage} from '../classes/WebGL.js';
import {default as libMeshes, LibMesh, getNonDoorMeshes} from '../libraries/meshes.js';
import * as THREE from '../ext/THREE.js';
import TransformControls from '../ext/TransformControls.js';
import Mod from '../classes/Mod.js';

import EditorListText from './editors/EditorListText.js';
import EditorListDungeon from './editors/EditorListDungeon.js';

export default class Modtools{

	constructor(){

		this.mod = null;	// Active mod

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
				if( label === "texts" )
					Window.create("Texts", "Asset Selector", "", "database", EditorListText);
				else if( label === "dungeons" )
					Window.create("Dungeons", "Asset Selector", "", "database", EditorListDungeon);


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


		// Auto loader
		const autoload = localStorage.editor_mod;
		if( autoload ){

			(async () => {
 
				const m = await Mod.getByID(autoload);
				if( m )
					this.load(m);

			})();

		}

		

	}

	onWindowOpened( win ){

		// Todo: Track dirty
		
		//this.setDirty(true);

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
	load( mod ){

		if( !mod )
			mod = this.mod;

		if( !mod )
			return;

		if( this.dirty ){
			alert("Todo: Ask if you want to save first");
		}

		this.setDirty(false);
		this.mod = mod;
		Window.closeAll();

		localStorage.editor_mod = mod.id;		// Save this as the actively opened mod
		this.updateModName();					// Set the mod name in the top bar

		console.log("Todo: Window state load");
		// Should load only assets and root lists

		this.sideMenu.classList.toggle("hidden", false);


	}

	save(){
		
		this.setDirty(false);
		console.log("Save");


	}




}