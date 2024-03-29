import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
//import * as EditorAsset from './EditorAsset.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorEncounter from './EditorEncounter.js';
import * as EditorWrapper from './EditorWrapper.js';
//import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon, { DungeonRoom, DungeonRoomAsset } from '../../classes/Dungeon.js';
import {default as WebGL, Stage} from '../../classes/WebGL.js';
import {default as libMeshes, LibMesh, getNonDoorMeshes} from '../../libraries/meshes.js';
//import TransformControls from '../../ext/TransformControls.js';
import * as THREE from '../../ext/THREE.js'; 
import Window from '../WindowManager.js';
import GameAction from '../../classes/GameAction.js';
import Generic from '../../classes/helpers/Generic.js';
import stdTag from '../../libraries/stdTag.js';
import Audio from '../../classes/Audio.js';
import {GLTFExporter} from '../../ext/GLTFExporter.js';
const DB = 'dungeonRooms',
	CONSTRUCTOR = DungeonRoom,
	ASSET_HISTORY_STATES = 50	
;
let link;
function save( blob, filename ){
	
	if( !link ){

		link = document.createElement( 'a' );
		link.style.display = 'none';
		document.body.appendChild( link ); // Firefox workaround, see #6594

	}

	link.href = URL.createObjectURL( blob );
	link.download = filename;
	link.click();

	// URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

	save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

function saveArrayBuffer( buffer, filename ) {

	save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}

window.exportActiveMesh = function(){

	const gltfExporter = new GLTFExporter();
	gltfExporter.parse( window.ACTIVE_MESH, function ( result ) {

		const name = window.ACTIVE_MESH.name+'.gltf';
		if ( result instanceof ArrayBuffer ) {

			saveArrayBuffer( result, name );

		} else {

			const output = JSON.stringify( result, null, 2 );
			console.log( output );
			saveString( output, name );

		}

	}, {

	});

};


// Single asset editor
export function asset(){


	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset),
		isTemplate = !asset._mParent				// We're editing a procedural room template
	;

	if( !asset )
		return this.close();

	//this.assets = [];			// First asset is always the room. These are DungeonRoomAssets

	let html = '';

	html += '<div class="webglRenderer">'+
		'<div class="pusher"></div>'+
		'<div class="content"></div>'+
	'</div>';

	if( isTemplate )
		html += '<div class="missingAssets" style="color:#F66"></div>';

	html += '<div class="functionFloat" style="float:right; text-align:right">';
		html += '<input type="button" value="Add Randomish" class="insertRandom" /><br />';
		html += '<input type="button" value="Add Player" class="insertPlayerMarker" /><br />';
		html += '<input type="button" value="Add Dir" class="insertDirArrow" />';
	html += '</div>';

	html += '<div class="assetInserter" style="display:inline-block">';
		html += '<select id="meshToTest" multiple>';
		for( let i in libMeshes() )
			html += '<option value="'+i+'">'+i+'</option>';
		html += '</select>';
	html += '</div>';

	html += '<div class="labelFlex">';
		if( isTemplate )	// Editing a template for procedural dungeon
			html += '<label>Label: <input name="label" value="'+esc(asset.label)+'" type="text" class="saveable" autocomplete="chrome-off" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" autocomplete="chrome-off" /></label>';
		html += '<label>Random Event <input type="checkbox" class="saveable" name="expEvt" '+(dummy.expEvt ? 'checked' : '')+' /></label><br />';
		html += '<label>Always Recheck Encounter <input type="checkbox" class="saveable" name="enc_recheck" '+(dummy.enc_recheck ? 'checked' : '')+' /></label><br />';
		
		html += '<label>Outdoors <input type="checkbox" class="saveable" name="outdoors" '+(dummy.outdoors ? 'checked' : '')+' /></label><br />';
		html += '<label title="Lets you change the loading zoom, 0 for auto">Zoom: <input type="number" min=0 step=1 name="zoom" class="saveable" value="'+esc(dummy.zoom)+'" /></label>';
		html += '<label title="Leave empty to set to dungeon ambiance">Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label title="Set to -1 to use dungeon ambiance vol">Ambiance volume <span class="valueExact"></span>: <input type="range" name="ambiance_volume" min=-1 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';
		html += '<label title="Use a low value like less than 0.001. Use 0 for default.">Fog override: <input type="number" name="fog" min=0 max=1 class="saveable" value="'+esc(dummy.fog)+'" /></label>';
		html += '<label title="Indoors only. Hex code such as #AA33AA">Ambient light: <input type="text" name="dirLight" class="saveable" value="'+esc(dummy.dirLight)+'" /></label>';
		html += '<label title="Use 0 to use dungeon default.">Saturation: <input type="number" name="sat" class="saveable" step=0.01 min=0 max=2 value="'+esc(dummy.sat)+'" /></label>';

		html += '<label>Room Mesh: <select class="roomBaseAsset">';
		LibMesh.iterate((mesh, path) => {
			if( mesh.isRoom )
				html += '<option value="'+esc(path)+'">'+esc(path)+'</option>';
		});	
		html += '</select></label>';


		html += '<label>Room Asset rotation: <input type="number" step=1 name="roomAssetRotation" /></label>';

		html += '<div class="labelFlex" style="flex:1">';
			html += '<label>Reverb type: <select name="reverb" class="saveable">'+
				'<option value="none">None</option>'+
				'<option value="" '+(!dummy.reverb ? 'selected' : '')+'>Use Dungeon</option>'
			;
			for( let i in Audio.reverbs )
				html += '<option value="'+i+'" '+(dummy.reverb === i ? 'selected' : '')+'>'+i+'</option>';
			html += '</select></label>';
			html += '<label title="PASS = use dungeon settings">Reverb intensity <span class="valueExact zeroParent"></span>: <input type="range" name="reverbWet" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.reverbWet)+'" /></label>';
			html += '<label title="PASS = use dungeon settings">Lowpass filter <span class="valueExact zeroParent"></span>: <input type="range" name="lowpass" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.lowpass)+'" /></label>';
			html += '<label><input type="button" class="testReverb" value="Test Audio" /></label>';
		html += '</div>';
		
	html += '</div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Picks the first viable one when you enter, stays with it until respawn is triggered">Encounters:</span> <div class="encounters"></div>';
	html += '<span title="Passives to apply to viable players">Passives:</span> <div class="passives"></div>';
	
	this.setDom(html);
	
	// Bind linked objects
	this.dom.querySelector("div.encounters").appendChild(EditorEncounter.assetTable(this, asset, "encounters"));	
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));	
	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.bindTestReverb(
		this.dom.querySelector('select[name=reverb]'),
		this.dom.querySelector('input[name=reverbWet]'),
		this.dom.querySelector('input[name=lowpass]'),
		this.dom.querySelector('input.testReverb')
	);

	HelperAsset.autoBind( this, asset, DB);

	const editor = new Editor(this, asset);


	// Try to use a smart algorithm to add an asset that's previously used to this room
	this.dom.querySelector('input.insertRandom').onclick = () => { editor.addSmartAsset(); };
	this.dom.querySelector('input.insertDirArrow').onclick = () => { editor.addMesh('Generic.Shapes.DirArrow'); };
	this.dom.querySelector('input.insertPlayerMarker').onclick = () => { editor.addMesh('Generic.Marker.Player'); };

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented, ignoreAsset);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*name' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'rTemp_'+Generic.generateUUID(),
	}));

};


export function help(){

	let out = '';

	out += '<h3>Common pitfalls!</h3>';
	out += '<ul>';
		out += '<li>Although you can edit and delete assets when extending an official dungeon, I would recommend against it due to the likelihood of it changing down the line.</li>';
		out += '<li>I highly recommend creating a new door or arrow and linking it to your own network of dungeons.</li>';
	out += '</ul>';

	out += '<h3>3d Editor:</h3>'+
		'<p>Click the 3d editor to select it (it will get white borders). While selected, you can use the following hotkeys:</p>'+
		'<ul>'+
			'<li>Q - Swaps between local and world coordinates</li>'+
			'<li>W - Move tool</li>'+
			'<li>E - Rotation tool</li>'+
			'<li>R - Scale tool</li>'+
			'<li>F - Drop to floor</li>'+
			'<li>Ctrl - Snap to grid</li>'+
			'<li>Ctrl+Z/Ctrl+Y - Undo/redo edits on a particular mesh</li>'+
			'<li>Del - Deletes the selected asset, hurdur. Note that you can\'t undo this.</li>'+
			'<li>Double click on a mesh for more options (the floor is handled separately).</li>'+
		'</ul>'+
		'<p>Double click a mesh to bring up a property editor.</p>'	
	;
		

	out += '<h3>Asset library:</h3>'+
		'<p>Below the editor is the asset library, items starting with [M] are meshes, you can double click these to add them to the scene.</p>';

	out += '<h3>Hot buttons:</h3>'+
		'<p>Add Player/Dir are just hotkeys for common meshes. Add Randomish randomizes an asset based on the probability of it being there. It\'s a very simple algorithm. It compiles a list of all assets that have previously been used on your room mesh. Then picks one based on how commonly used it is. Then places it if it\'s location is not occupied by something else. You\'ll still need to move the assets, but this should help you get started on each cell.</p>';

	const url = 'https://'+window.location.hostname+'/media/audio/ambiance/';
	out += '<h3>Ambiance:</h3>'+
		'<p>URL to an ambiance you want to use, preferably ogg. You can find built in ones at <a href="'+url+'">'+url+'</a>. Leave empty to use dungeon ambient.</p>';
	out += '<h3>Ambiance volume:</h3>'+
		'<p>Volume of background audio, set to -1 to use dungeon ambiance volume.</p>';

	out += '<h3>Random Event:</h3>'+
		'<p>Uses a random encounter from random encounters marked as Proc Event. These are the same random roleplays you get in exploration dungeons. Encounters set in this room will contribute to the events you get.</p>';
	
	out += '<h3>Always Recheck Encounter:</h3>'+
		'<p>By default, encounters are only generated once when you visit a room. And they aren\'t updated until you exit and re-enter the dungeon. Checking this will re-check for the first viable encounter whenever you visit the room if the conditions for the current encounters are no longer met.</p>';

	out += '<h3>Room mesh:</h3>'+
		'<p>This is the base mesh for the room to use.</p>';

	out += '<h3>Room asset rotation:</h3>'+
		'<p>Rotation of the base room asset. You generally want to do 90 degree increases, like 90, 180, or 270.</p>';

		
	out += '<h3>Tags:</h3>'+
		'<p>These are tags that will be added to all players when in this room. Note that many meshes are tagged already for you, so you rarely need to use this.</p>';


	out += '<h3>Encounters:</h3>'+
		'<p>These are encounters to play in this room, the first viable one will be the one used. '+HelperAsset.helpLinkedList+'</p>';

	out += '<h2>If you are creating a procedural dungeon room</h2>';
	out += '<p>You will want to add least one lever asset, chest, door facing in either direction (including up and down), and at least 4 player markers in each room. The editor will tell you if you\'re missing something.</p>';
	out += '<p>Levers can be found in Dungeon/Door/WallLever. The editor automatically attemps to figure out the direction of a door based on its rotation.</p>';

	return out;

};



class Editor{

	// Asset is the room
	constructor( win, asset ){

		const modtools = window.mod,
			gl = modtools.webgl
		;
		this.gl = gl;
		this.win = win;
		this.assetWindow = null;
		this.raycaster = new THREE.Raycaster();
		this.raycaster.far = 1000;

		// Add transform controls
		const control = modtools.transformControls;
		this.control = control;
		control.detach();

		// Handle dragging the tool
		this.saveTimer;
		this.dragging = false;
		this.changed = false;
		this.shift_held = false;

		const handleObjectChange = event => {


			this.changed = false;
			const mesh = event.target.object,
				entry = mesh.userData.dungeonAsset
			;

			entry.x = Math.round(mesh.position.x);
			entry.y = Math.round(mesh.position.y);
			entry.z = Math.round(mesh.position.z);
			entry.rotX = Math.round(mesh.rotation.x*100)/100;
			entry.rotY = Math.round(mesh.rotation.y*100)/100;
			entry.rotZ = Math.round(mesh.rotation.z*100)/100;

			let sMulti = 1.0;
			if( mesh.userData.meshScale )
				sMulti = mesh.userData.meshScale;
			entry.scaleX = Math.round(mesh.scale.x*100/sMulti)/100;
			entry.scaleY = Math.round(mesh.scale.y*100/sMulti)/100;
			entry.scaleZ = Math.round(mesh.scale.z*100/sMulti)/100;
			entry.__modified = true;	// mark it as modified so it can be saved on change

			this.save();
			this.addHistory(entry);

			
		};

		control._listeners.mouseUp = [event => {
			if( this.changed )
				handleObjectChange(event);
		}];
		control._listeners.objectChange = [evt => {

			// Shift clone
			if( !this.changed && this.shift_held ){

				let obj = evt.target.object.userData.dungeonAsset;
				if( !obj )
					return;

				obj = obj.clone(this.room, "mod");
				delete obj.id;	// Forces it to insert a new entry when saving

				if( Array.isArray(obj.interactions) ){

					
					obj.interactions = obj.interactions.map(el => {

						let base = mod.getAssetById('gameActions', el);

						if( base && base._h ){

							base = JSON.parse(JSON.stringify(base));
							// This condition was a sub of the original, we need to clone it
							base.label = mod.mod.insert('gameActions', base);
							return base.label;

						}

						return el;

					});
				}

				if( Array.isArray(obj.conditions) ){

					
					obj.conditions = obj.conditions.map(el => {

						let base = mod.getAssetById('conditions', el);

						if( base && base._h ){
							
							// This condition was a sub of the original, we need to clone it
							base = JSON.parse(JSON.stringify(base));
							base.label = mod.mod.insert('conditions', base);
							return base.label;

						}

						return el;

					});
				}
				

				obj.__history = [];
				obj.__historyMarker = 0;
				this.addHistory(obj);
				this.room.addAsset(obj);
				obj.__modified = true;
				this.gl.stage.addDungeonAsset(obj).then(() => {

					this.save();
					this.bindMeshes();

				});				
					
			}
			this.changed = true;
		}];

		


		const 
			renderDiv = win.dom.querySelector('div.webglRenderer'),
			contentDiv = win.dom.querySelector('div.webglRenderer > div.content')
		;

		this.renderDiv = renderDiv;
		this.contentDiv = contentDiv;
		this.room_raw = asset;
		this.room = DungeonRoom.loadThis(mod.getAssetById('dungeonRooms', asset.label));
		this.rebase();

		gl.renderer.domElement.tabIndex = 0;
		gl.renderer.domElement.onkeydown = event => {

			event.preventDefault();
			if( event.key === 'Shift' ){
				this.shift_held = true;	
			}		
			else if( event.key === "w" )
				control.setMode( "translate" );
			else if( event.key === "e" )
				control.setMode( "rotate" );
			else if( event.key === "r" )
				control.setMode( "scale" );
			else if( event.key === "q" )
				control.setSpace( control.space === "local" ? "world" : "local" );
			else if( event.key === 'Control' ){
				control.setTranslationSnap( 100 );
				control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
			}
			else if( event.key === "Delete" ){
				this.removeMesh(control.object);
				this.buildAssetEditor();
			}
			else if( event.key === 'f' && control.object ){

				const start = control.object.position,
					end = new THREE.Vector3(0,-1,0)
				;

				const raycaster = this.raycaster;
				raycaster.set(start, end);

				const meshes = [];
				control.object.parent.traverse(el => {
					if( el.isMesh ){
						meshes.push(el);
					}
				});

				const intersects = raycaster.intersectObjects(meshes, false);	// Recursive breaks on sprites
				for( let i of intersects ){

					if( i.object === control.object )
						continue;

					control.object.position.y = i.point.y;
					const evt = {target : {object: control.object}};
					handleObjectChange(evt);
					break;

				}

			}
			else if( event.key === "z" && (event.ctrlKey || event.metaKey) )
				this.traverseHistory(control.object.userData.dungeonAsset, -1);
			else if( event.key === "y" && (event.ctrlKey || event.metaKey) )
				this.traverseHistory(control.object.userData.dungeonAsset, 1);
			
		};

		modtools.webgl.renderer.domElement.onkeyup = event => {
			event.preventDefault();
			if( event.key === 'Shift' ){
				this.shift_held = false;
			}
			if( event.key === 'Control' ){

				control.setTranslationSnap( null );
				control.setRotationSnap( null );
			}
		};
		modtools.webgl.renderer.domElement.onclick = event => {
			//event.preventDefault();
		};
		modtools.webgl.renderer.domElement.onmousedown = event => {
			event.preventDefault();
			event.currentTarget.focus(); // Workaround since webgl blocks default select, and double click select shouldn't select text
		};

		const baseAssetSelect = win.dom.querySelector('select.roomBaseAsset');
		const roomAsset = this.room.getRoomAsset();
		this.roomAsset = roomAsset;
		if( roomAsset )
			baseAssetSelect.value = roomAsset.model;
		baseAssetSelect.onchange = () => {
			const base = this.room.getRoomAsset();
			base.model = baseAssetSelect.value;
			base.__modified = true;
			this.save();
			this.draw();
		};

		const baseAssetRotInput = win.dom.querySelector('input[name=roomAssetRotation]');
		if( roomAsset ){
			baseAssetRotInput.value = Math.round(roomAsset.rotY*57.2958) || 0;
		}
		baseAssetRotInput.onchange = event => {
			roomAsset.rotY = Math.round((parseInt(baseAssetRotInput.value)/57.2958 || 0)*100)/100;
			roomAsset._stage_mesh.rotation.y = parseInt(baseAssetRotInput.value)/57.2958 || 0;
			roomAsset.__modified = true;
			this.save();
		};

		const outdoorToggle = win.dom.querySelector('input[name=outdoors]');
		outdoorToggle.addEventListener('change', () => {
			this.room.outdoors = Boolean(outdoorToggle.checked);
			this.draw();
		});

		const fogOverride = win.dom.querySelector('input[name=fog]');
		fogOverride.addEventListener('change', () => {
			this.room.fog = +fogOverride.value || 0;
			this.draw();
		});


		const saturation = win.dom.querySelector('input[name=sat]');
		saturation.addEventListener('change', () => {
			this.room.sat = +saturation.value || 0;
			this.draw();
		});

		const lightOverride = win.dom.querySelector('input[name=dirLight]');
		lightOverride.addEventListener('change', () => {
			this.room.dirLight = lightOverride.value.trim();
			this.draw();
		});

		contentDiv.appendChild(modtools.webgl.renderer.domElement);

		const onResize = () => {

			const rect = renderDiv.getBoundingClientRect();
			const width = rect.width, height = rect.height;

			gl.renderer.domElement.style.width = 'auto';
			gl.renderer.domElement.style.height = 'auto';
			gl.renderer.domElement.width  = width;
			gl.renderer.domElement.height = height;

			gl.updateSize(width, height);
			/*
			gl.renderer.setSize(width, height);
			gl.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
			gl.composer.setSize(width, height);
			
			gl.camera.aspect = width / height;
			gl.camera.updateProjectionMatrix();
			*/
			/*
			gl.fxRenderer.setSize(width, height);
			gl.fxCam.aspect = width/height;
			gl.fxCam.updateProjectionMatrix();
			*/

		};

		// Attach the 3d editor
		// The DOM will be inaccurate without the delay because HTML
		setTimeout(onResize, 1);
		
		//gl.updateSize = onResize;
		win.onResize = onResize;

		this.draw();

		// Mesh add selector
		win.dom.querySelector('div.assetInserter > select').onchange = () => {
			this.updateMeshSelects(0);
		};


		win.onChange = () => {
			this.save();
		};

		try{
			const path = JSON.parse(localStorage.editor_mesh_select_path);
			for( let i in path ){
				const sel = this.win.dom.querySelectorAll('div.assetInserter > select')[i];
				if( sel ){
					sel.value = path[i];
					this.updateMeshSelects(i);
				}
			}
		}catch(err){}

	}
	

	// Takes a mesh object, finds it, and removes it
	removeMesh( mesh ){

		const dungeonAsset = mesh.userData.dungeonAsset;

		for( let i in this.room.assets ){
			
			const asset = this.room.assets[i];
			if( dungeonAsset === asset ){

				// Remove from OUR db (both extending and original)
				mod.mod.deleteAsset('dungeonRoomAssets', asset.id, true);

				this.room.assets.splice(i, 1);
				this.gl.stage.remove(mesh);
				if( mesh === this.control.object )
					this.control.detach();
				this.save();

				return;
			}

		}


	}

	// Adds a new mesh and returns a dungeonRoomAsset
	// Async if addToStage is false
	addMesh( path, addToStage = true ){

		const mesh = LibMesh.getByString(path);
		if( !mesh )
			throw 'Unable to find mesh with path: '+path;
		
		let asset = new DungeonRoomAsset({
			model : path,
		}, this.room);
		delete asset.id;

		asset.__modified = true;
		asset.__history = [];
		asset.__historyMarker = 0;
		this.addHistory(asset);
		this.room.addAsset(asset);

		if( addToStage ){

			return this.gl.stage.addDungeonAsset(asset).then(() => {

				this.save();
				this.bindMeshes();
				this.control.attach(asset._stage_mesh);
				window.ACTIVE_MESH = asset._stage_mesh;
				this.gl.renderer.domElement.focus();
				return asset;

			});
			

		}
		return asset;

	}

	// Adds the first best dungeon room asset that matches
	async addSmartAsset(){

		// try 10 times until successful
		for( let i = 0; i < 10; ++i ){

			const asset = this.getSmartAsset();
			if( !asset )
				return;
			
			const assets = asset.v.slice(); // Array of assets
			shuffle(assets);

			const stage = this.gl.stage;
			const baseMesh = await this.gl.getAssetFromCache( new DungeonRoomAsset(assets[0]), true );
			
			let baseRot = this.roomAsset.rotY || 0;

			for( let asset of assets ){

				const tmp = new DungeonRoomAsset(asset);
				tmp.g_resetID();
				tmp._stage_mesh = baseMesh;

				let rotOffs = (asset.__roomMesh.rotY || 0)-baseRot;
				const startE = new THREE.Euler(tmp.rotX || 0, tmp.rotY || 0, tmp.rotZ || 0);
				const startRot = new THREE.Quaternion().setFromEuler(startE);
				const addE = new THREE.Euler(0, -rotOffs, 0);
				const add = new THREE.Quaternion().setFromEuler(addE);

				startRot.multiply(add);
				const euler = new THREE.Euler().setFromQuaternion(startRot);
				tmp.rotX = euler.x;
				tmp.rotY = euler.y;
				tmp.rotZ = euler.z;

				const cos = Math.cos(rotOffs), sin = Math.sin(rotOffs);
				let x = tmp.x || 0, z = tmp.z || 0;
				tmp.x = x*cos - z*sin;
				tmp.z = x*sin + z*cos;

				stage.updatePositionByAsset(tmp);
				
				
				const intersects = this.intersects(baseMesh);
				if( intersects ){
					//console.log("Skip intersects", intersects);
					continue;
				}
				
				// Test if it intersects with anything
				const newAsset = await this.addMesh(asset.model);
				newAsset.x = tmp.x;
				newAsset.y = tmp.y;
				newAsset.z = tmp.z;
				newAsset.scaleX = tmp.scaleX;
				newAsset.scaleY = tmp.scaleY;
				newAsset.scaleZ = tmp.scaleZ;
				newAsset.rotX = tmp.rotX;
				newAsset.rotY = tmp.rotY;
				newAsset.rotZ = tmp.rotZ;

				stage.updatePositionByAsset(newAsset);

				window.st = stage;
				window.asset = newAsset;

					
				//stage.addDungeonAsset(tmp);
				return;

			}
		
		}

	}

	// Cchecks if a THREE.Mesh intersects any of the assets in this room
	intersects( mesh ){

		const box = new THREE.Box3().setFromObject(mesh);

		for( let cur of this.gl.stage.group.children ){
			// Skip room assets
			if( cur.userData?.dungeonAsset?.room )
				continue;

			const bb = new THREE.Box3().setFromObject(cur);
			if( box.intersectsBox(bb) || mesh.position.distanceTo(cur.position) < 1 )
				return cur;

		}

	}

	updateMeshSelects( index ){

		let path = [];
		let selects = this.win.dom.querySelectorAll('div.assetInserter > select');
		selects.forEach((el, i) => {
			if( i > index )
				el.remove();
			else if( el.value )
				path.push(el.value);
		});
		selects = this.win.dom.querySelectorAll('div.assetInserter > select');	// in case we deleted one


		let meshes = getNonDoorMeshes();

		if( !path.length )
			return;

		localStorage.editor_mesh_select_path = JSON.stringify(path);

		let i = "";
		for( i of path )
			meshes = meshes[i];

		if( !meshes )
			return;
		// Set this as mesh to add
		if( meshes.constructor === LibMesh ){

			selects[selects.length-1].querySelector('option[value=\''+i+'\']').ondblclick = () => {
				this.addMesh(path.join('.'));
			};

		}
		// Draw a selector
		else{

			let select = document.createElement('select');
			select.multiple = true;
			select.name = path.length;
			for( let m in meshes ){
				let obj = meshes[m];
				select.innerHTML += '<option value="'+m+'">'+(obj.constructor === LibMesh ? '[M] ' : '') + m+'</option>';
			}
			this.win.dom.querySelector('div.assetInserter').append(select);


			select.onchange = () => {
				this.updateMeshSelects(path.length);
			};

		}
		

	}

	traverseHistory( asset, direction = -1 ){

		asset.__historyMarker = Math.min(Math.max(asset.__historyMarker+direction, 0), asset.__history.length-1);
		console.log("Loading history", asset.__history, asset.__historyMarker);
		asset.load(asset.__history[asset.__historyMarker]);
		this.gl.stage.updatePositionByAsset(asset);
		this.save();

	}


	addHistory( asset ){

		// Start by splicing anything ahead of us
		if( asset.__historyMarker < asset.__history.length-1 ){
			asset.__history.splice(asset.__historyMarker+1);
		}

		if( asset.__historyMarker >= asset.__history.length )
			asset.__historyMarker = asset.__history.length-1;

		const fieldsToSave = [
			'rotX',
			'rotY',
			'rotZ',
			'scaleX',
			'scaleY',
			'scaleZ',
			'x','y','z'
		];
		let saveState = {};
		for( let field of fieldsToSave ){
			saveState[field] = asset[field];
		}
		asset.__history.push(saveState);
		++asset.__historyMarker;

		if( asset.__history.length > ASSET_HISTORY_STATES ){
			asset.__history.shift();
			--asset.__historyMarker;
		}

	}

	// We're editing a template for a procedural dungeon
	isTemplate(){
		return !this.room_raw._mParent;
	}

	// Try to rebase on start. If you rebase any time later, you'll fuck up history states
	rebase(){
		
		let parents = [];

		// Encounters can be a single encounter once one has started, but is always an array in the editor
		if( !Array.isArray(this.room.encounters) )
			this.room.encounters = [];

		//console.log("Fetching assets", this.room.assets);
		this.room.assets = this.room.assets.map(el => {
			
			if( typeof el === "object" ){
				return el;
			}
			
			let m = mod.mod.getAssetById('dungeonRoomAssets', el);
			// See if we can find a parent one
			if( !m ){

				m = mod.parentMod.getAssetById('dungeonRoomAssets', el);
				if( !m )
					console.error("Unable to find ", el, "in either mod");
				else if( !m._ext ){	// Make sure it's not already extended before inserting
					parents.push(m.id);
				}
			}
			return m;

		}).filter(el => el);

		this.room.rebase();

		// Make sure there's a room asset, otherwise INSERT DUNGEON ROOM ASSET
		if( !this.room.assets.length || !this.room.getRoomAsset() ){

			const roomAsset = this.addMesh('Dungeon.Room.R10x10', false);
			roomAsset.room = true;
			this.save();		
			this.room.rebase();

		}

		

		// This creates new objects and wipes parenting information
		// Mark parents
		for( let asset of this.room.assets ){

			if( parents.includes(asset.id) )
				asset.__isParent = true;

		}

		// Editing a room in a dungeon
		if( !this.isTemplate() ){
			// Get asset from either mod or base
			this.room.parent = new Dungeon(
				window.mod.getAssetById(this.room_raw._mParent.type, this.room_raw._mParent.label) 
			);
		}
		

		// Build initial history state
		for( let asset of this.room.assets ){

			asset.rebase();
			asset.__history = [];
			asset.__historyMarker = 0;
			this.addHistory(asset);

		}


	}

	// Tries to save the room dummy onto room_raw
	save(){

		console.log("Saving", this.room.assets);
		let ids = this.room.assets.map(el => {

			let data = DungeonRoomAsset.saveThis(el, 'mod');
			
			// Preserve extend status when saving over an extend
			// Needed for array compares to work correctly
			data._ext = el._ext;
			data._e = el._e;
			data._h = 1;	// Marks as unique. Needed for cloning parents.


			// Insert new
			if( el.__modified ){

				if( !el.id ){

					let newID = mod.mod.insert('dungeonRoomAssets', data);
					el.id = newID;
					//console.log("Inserted", el, data);

				}
				// This object was from the root mod in an extension
				else if( el.__isParent ){

					let originalId = el.id;
					
					data._e = el._e = originalId;
					data._ext = el._ext = true;	// Needed for optimization to work. Auto set when you fetch from mod with extend true
					mod.mod.insert('dungeonRoomAssets', data);

					el.id = data.id;	// Update the work asset
					delete el.__isParent;

					console.trace("Extended", el, data);

				}
				// Update db entry
				else{
					mod.mod.setAssetById('dungeonRoomAssets', data);
					//console.log("Updated", el, data);
				}


			}

			// Use the original ID when pointing to places
			return el._e || el.id;

		});

		this.room_raw.assets = ids;
		//console.log("Raw:", this.room_raw);

		window.mod.setDirty(true);
		this.updateWants();
	}

	bindMeshes(){

		for( let asset of this.room.assets ){
			
			if( asset.room )
				continue;

			const mesh = asset._stage_mesh;
			mesh.userData.click = () => {
				this.control.detach();
				this.control.attach(mesh);
				window.ACTIVE_MESH = mesh;
			};

			mesh.userData.dblclick = () => {
				this.buildAssetEditor();
			};

			Stage.bindGenericHover(mesh);

			
		}

	}

	async draw(){

		if( this.gl.stage )
			this.gl.stage.destructor();

		console.log("Room", this.room);
		let stage = new Stage(this.room, this.gl, true);
		this.gl.resetStage( stage );
		await stage.draw();
		stage.toggle( true );

		this.gl.toggleOutdoors( this.room.outdoors );
		this.gl.updateFog( 12 );

		this.bindMeshes();
		this.updateWants();

	}
	
	// Updated wanted gameActions and template requirements
	updateWants(){

		if( this.isTemplate() ){

			let html = [];
			const needed_doors = [true, true, true, true, true, true];	// One for each direction
			let hasTreasure = false, hasLever = false, playerMarkers = 0;

			for( let asset of this.room.assets ){

				for( let i in needed_doors ){
					
					if( !needed_doors[i] )
						continue;

					if( asset.pIsDoorDir(i) )
						needed_doors[i] = false;

				}

				if( asset.hasTag(stdTag.mLEVER_MARKER) )
					hasLever = true;
					
				if( asset.hasTag(stdTag.mTREASURE_MARKER) )
					hasTreasure = true;

				if( asset.hasTag(stdTag.mPLAYER_MARKER) )
					++playerMarkers;

			}

			// Calculate needed doors
			let totalNeeded = 0;
			for( let v of needed_doors )
				totalNeeded += v;
			
			if( totalNeeded ){

				let doors = [];
				for( let i in needed_doors ){
					
					if( needed_doors[i] )
						doors.push(DungeonRoomAsset.getDirName(parseInt(i)));
					

				}
				html.push('Doors: '+doors.join(', '));


			}

			if( !hasTreasure )
				html.push('Treasure');
			if( !hasLever )
				html.push('Lever');
			if( playerMarkers < 4 )
				html.push((4-playerMarkers)+" player markers");
			

			this.win.dom.querySelector('div.missingAssets').innerHTML = html.join(" | ");

		}

		const assetHasInteraction = (asset, interaction) => {

			if( interaction === GameAction.types.door && asset.door > -1 )
				return true;

			if( !Array.isArray(asset.interactions) )
				return;

			for( let n of asset.interactions ){

				if( typeof n === "string" )
					n = window.mod.getAssetById("gameActions", n);

				if( n && new GameAction(n).type === interaction )
					return true;
			}

		};

		for( let asset of this.room.assets ){

			const mesh = asset._stage_mesh;
			if( !mesh )
				continue;


			const template = mesh.userData.template;
			if( !template )
				continue;



			const wants = template.want_actions;
			if( !Array.isArray(wants) || !wants.length )
				continue;



			let out = 0;
			for( let want of wants ){
				
				// scan for OR
				if( Array.isArray(want) ){
					for( let n of want ){
						
						if( assetHasInteraction(asset, n) ){
							++out;
							break;
						}

					}
				}
				// Scan for AND
				else if( assetHasInteraction(asset, want) )
					++out;
				
			}


			const hasWants = out === wants.length;
			const mats = toArr(mesh.material);
			for( let mat of mats ){
				mat.color.g = mat.color.b = hasWants ? 1 : 0; 
			}
		
		}

	}

	// Build the asset editor co-screen
	buildAssetEditor(){

		const th = this;
		const asset = th.control.object.userData.dungeonAsset;
		// Asset window already exists, rebuild it
		if( this.assetWindow && !this.assetWindow.dead ){

			if( this.assetWindow.id === asset.id ){
				this.assetWindow.rebuild.call(this.assetWindow);
				return;
			}
			else
				this.assetWindow.close();
			
		}

		
		const dungeon = this.room.parent;
		

		const build = function(){

			if( !th.control.object ){
				this.close();
				return;
			}
			if( !asset ){
				this.close();
				return;
			}



			this.onChange = () => {
			
				asset.__modified = true;
				th.save();
	
			};

			asset.__modified = true;	// mark it as modified so it can be saved on change
			this.asset.asset = asset;	// Needs to be set because dungeonAsset doesn't have a library
			let html = '';
			html += '<div class="labelFlex">';
				html += '<label>Name: <input name="name" value="'+esc(asset.name)+'" type="text" class="saveable" autocomplete="chrome-off" /></label>';
				html += '<label title="Time in seconds, 0 = no respawn">Respawn: <input name="respawn" value="'+esc(asset.respawn)+'" type="text" class="saveable" /></label>';
				html += '<label>Hide if non-interactive: <input name="hide_no_interact" '+(asset.hide_no_interact ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
				html += '<label>Quick door: <select name="door" class="saveable" data-type="int">';
					html += '<option value="-1">NOT A DOOR</option>';
					for( let label of dungeon.rooms ){
						let r = window.mod.getAssetById('dungeonRooms', label);
						if( !r )
							continue;
						const index = Math.trunc(r.index) || 0;
						html += '<option value="'+index+'" '+(index === asset.door ? 'selected' : '')+'>'+esc(r.name)+'</option>';
					}
				html += '</select></label>';
				html += '<label title="The mesh objects themselves have hardcoded tags. This ignores them.">Ignore mesh tags <input type="checkbox" name="ign_tags" class="saveable" '+(asset.ign_tags ? 'checked' : '')+' /></label>';

			html += '</div>';

			
			html += 'Tags: <div class="tags">'+HelperTags.build(asset.tags)+'</div>';
			html += 'Game Actions: <div class="interactions"></div>';
			html += 'Conditions: <div class="conditions"></div>';

			const animated = Boolean(th.control.object.userData.playAnimation);
			if( animated ){
				
				html += '<br />Default animation: <select class="animPreviewer saveable" name="idle_anim">';
				for( let clip of th.control.object.userData.mixer._actions ){
					html += '<option value="'+esc(clip._clip.name)+'" '+(asset.idle_anim === clip._clip.name ? 'selected' : '')+'>'+esc(clip._clip.name)+'</option>';
				}
				html += '</select>';

			}

			this.setDom(html);


			HelperTags.bind(this.dom.querySelector("div.tags"), tags => {
				HelperTags.autoHandleAsset('tags', tags, asset);
				th.save();
			});

			
			this.dom.querySelector("div.interactions").appendChild(EditorGameAction.assetTable(this, asset, "interactions", false, true));
			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, true));	


			HelperAsset.autoBind( this, asset, DB, (field, value) => {
				th.save();
			});

			//const table = this.dom.querySelector('div.interactions table');




			if( animated ){
				this.dom.querySelector('select.animPreviewer').onchange = event => {

					th.control.object.userData.playAnimation(event.currentTarget.value);

				};
			}

			// Bind each table row
			

		};

		
		this.assetWindow = Window.create(asset.id, 'dungeonRoomAssets', '', 'crafting', build, {}, this.win);
		this.assetWindow.setHelp(() => {

			let out = '';

			out += '<h3>Name:</h3>'+
				'<p>Name the asset (optional). If the asset has a door action, this is what will be displayed above the door.</p>';

			out += '<h3>Respawn:</h3>'+
				'<p>Respawn time in seconds if a container. 0 for never respawn.</p>';

			out += '<h3>Hide if non-interactive:</h3>'+
				'<p>Hides the object if it has no viable game actions bound to it.</p>';

			out += '<h3>Tags:</h3>'+
				'<p>These are tags that will be added to all players in the room in addition to the mesh built in tags.</p>';

			out += '<h3>Game Actions:</h3>'+
				'<p>GameActions to trigger when clicking this mesh. '+HelperAsset.helpLinkedList+'. Shift click to pick one from the library, otherwise a specific one will be created only for this mesh.</p>';

			out += '<h3>Conditions:</h3>'+
				'<p>Conditions needed to be met in order to draw this mesh. '+HelperAsset.helpLinkedList+'. Shift click to pick one from the library, otherwise a specific one will be created only for this mesh.</p>';


			return out;
		});

	}

	getSmartAsset(){

		let cur = this.roomAsset;
		
		//const s = Date.now();
	
		// Don't rebake unless we switch rooms
		if( this.__fCacheId !== cur.model ){
		
			const all = window.mod.mod.dungeonRooms.slice().concat(window.mod.parentMod.dungeonRooms.slice());
			
			// Get all meshes that are used with the same room asset
			// This also attaches a __roomMesh value to them, which is the room mesh object for said asset. Useful for detecting rotation.
			const stats = new Map();	// meshPath : (arr)uses
			for( let room of all ){
	
				const roomAsset = mod.getAssetById("dungeonRooms", room.label);
				if( !roomAsset )
					continue;
	
				
	
				let subRoomMesh;
				const sub = new Map(); // same as stats, but we need to check if the room is valid first
				if( Array.isArray(roomAsset.assets) ){

					for( let asset of roomAsset.assets ){
		
						// Fetch the asset
						const ra = mod.getAssetById("dungeonRoomAssets", asset);
						if( !ra )
							continue;
		
						if( ra.room ){
		
							// Not same room asset, gotta end this
							if( ra.model !== cur.model )
								break;
							// Set this as the room mesh
							else{
								subRoomMesh = ra;
								continue;
							}
		
						}
		
						// Save this to sub
						if( !sub.has(ra.model) )
							sub.set(ra.model, []);
						sub.get(ra.model).push(ra);
		
					}

				}
	
				// We can save
				if( subRoomMesh ){
	
					sub.forEach((arr, path) => {
						
						let st = stats.get(path);
						if( !st ){
							st = [];
							stats.set(path, st);
						}
						for( let asset of arr ){
							asset.__room = room;
							asset.__roomMesh = subRoomMesh;
							st.push(asset);
						}
						
					});
	
				}
	
			}
			
			// Convert to array of objects
			let flat = [];
			stats.forEach((val, key) => {

				let mesh = LibMesh.getByString(key);
				if( !mesh.no_randomish )	
					flat.push({
						k : key,
						v : val
					});

			});

			this.__fCache = flat;
			this.__fCacheId = cur.model;
	
		}
		
		//console.log(gsa.fCache, Date.now()-s);
		return weightedRand(this.__fCache, el => el.v.length);
	
	}

}
