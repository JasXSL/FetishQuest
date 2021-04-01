import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
//import * as EditorAsset from './EditorAsset.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorEncounter from './EditorEncounter.js';
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

	html += '<div class="assetInserter">';
		html += '<select id="meshToTest" multiple>';
		for( let i in libMeshes() )
			html += '<option value="'+i+'">'+i+'</option>';
		html += '</select>';
	html += '</div>';

	html += '<div class="labelFlex">';
		if( isTemplate )	// Editing a template for procedural dungeon
			html += '<label>Label: <input name="label" value="'+esc(asset.label)+'" type="text" class="saveable" autocomplete="chrome-off" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" autocomplete="chrome-off" /></label>';
		
		html += '<label>Outdoors <input type="checkbox" class="saveable" name="outdoors" '+(dummy.outdoors ? 'checked' : '')+' /></label><br />';
		html += '<label title="Lets you change the loading zoom, 0 for auto">Zoom: <input type="number" min=0 step=1 name="zoom" class="saveable" value="'+esc(dummy.zoom)+'" /></label>';
		html += '<label>Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label>Ambiance volume: <input type="range" name="ambiance_volume" min=0 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';
		html += '<label title="Use a low value like less than 0.001. Use 0 for default.">Fog override: <input type="number" name="fog" min=0 max=1 class="saveable" value="'+esc(dummy.fog)+'" /></label>';
		html += '<label title="Indoors only. Hex code such as #AA33AA">Ambient light: <input type="text" name="dirLight" class="saveable" value="'+esc(dummy.dirLight)+'" /></label>';

		html += '<label>Room Mesh: <select class="roomBaseAsset">';
		LibMesh.iterate((mesh, path) => {
			if( mesh.isRoom )
				html += '<option value="'+esc(path)+'">'+esc(path)+'</option>';
		});	
		html += '</select></label>';


		html += '<label>Room Asset rotation: <input type="number" step=1 name="roomAssetRotation" />';
		
	html += '</div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Picks the first viable one when you enter, stays with it until respawn is triggered">Encounters:</span> <div class="encounters"></div>';
	
	

	this.setDom(html);
	// Bind linked objects
	this.dom.querySelector("div.encounters").appendChild(EditorEncounter.assetTable(this, asset, "encounters"));	
	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);


	new Editor(this, asset);


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
		'</ul>'+
		'<p>Double click a mesh to bring up a property editor.</p>'	
	;
		

	out += '<h3>Asset library:</h3>'+
		'<p>Below the editor is the asset library, items starting with [M] are meshes, you can double click these to add them to the scene.</p>';

	const url = 'https://'+window.location.hostname+'/media/audio/ambiance/';
	out += '<h3>Ambiance:</h3>'+
		'<p>URL to an ambiance you want to use, preferably ogg. You can find built in ones at <a href="'+url+'">'+url+'</a></p>';

	out += '<h3>Room mesh:</h3>'+
		'<p>This is the base mesh for the room to use.</p>';

	out += '<h3>Room asset rotation:</h3>'+
		'<p>Rotation of the base room asset. You generally want to do 90 degree increases, like 90, 180, or 270.</p>';

		
	out += '<h3>Tags:</h3>'+
		'<p>These are tags that will be added to all players when in this room. Note that many meshes are tagged already for you, so you rarely need to use this.</p>';


	out += '<h3>Encounters:</h3>'+
		'<p>These are encounters to play in this room, the first viable one will be the one used. '+HelperAsset.helpLinkedList+'</p>';


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
			entry.scaleX = Math.round(mesh.scale.x*100)/100;
			entry.scaleY = Math.round(mesh.scale.y*100)/100;
			entry.scaleZ = Math.round(mesh.scale.z*100)/100;

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

				obj = obj.clone("mod", this.room);
				obj.g_resetID();
				obj.__history = [];
				obj.__historyMarker = 0;
				this.addHistory(obj);
				this.room.addAsset(obj);
				this.gl.stage.addDungeonAsset(obj).then(() => {
					this.save();
					this.bindMeshes();
				});				
					
			}
			this.changed = true;
		}];

		


		const 
			renderDiv = win.dom.querySelector('div.webglRenderer'),
			contentDiv = win.dom.querySelector('div.webglRenderer > div.content');

		this.renderDiv = renderDiv;
		this.contentDiv = contentDiv;
		this.room_raw = asset;
		this.room = DungeonRoom.loadThis(asset);


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
				control.setRotationSnap( THREE.Math.degToRad( 15 ) );
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
					if( el.isMesh )
						meshes.push(el);
				});

				const intersects = raycaster.intersectObjects(meshes);
				for( let i of intersects ){

					if( i.object === control.object )
						continue;

					control.object.position.y = i.point.y;
					const evt = {target : {object: control.object}};
					handleObjectChange(evt);
					break;

				}

			}
			else if( event.key === "z" && event.ctrlKey )
				this.traverseHistory(control.object.userData.dungeonAsset, -1);
			else if( event.key === "y" && event.ctrlKey )
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
			event.preventDefault();
		};
		modtools.webgl.renderer.domElement.onmousedown = event => {
			event.preventDefault();
		};

		const baseAssetSelect = win.dom.querySelector('select.roomBaseAsset');
		const roomAsset = this.room.getRoomAsset();
		if( roomAsset )
			baseAssetSelect.value = roomAsset.model;
		baseAssetSelect.onchange = () => {
			this.room.getRoomAsset().model = baseAssetSelect.value;
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
			console.log(this.room.fog);
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

			gl.renderer.setSize(width, height);
			gl.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
			gl.composer.setSize(width, height);
			
			gl.camera.aspect = width / height;
			gl.camera.updateProjectionMatrix();

			gl.fxRenderer.setSize(width, height);
			gl.fxCam.aspect = width/height;
			gl.fxCam.updateProjectionMatrix();


		};

		// Attach the 3d editor
		// The DOM will be inaccurate without the delay because HTML
		setTimeout(onResize, 1);
		
		gl.updateSize = onResize;
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
	async addMesh( path ){

		const mesh = LibMesh.getByString(path);
		if( !mesh )
			throw 'Unable to find mesh with path: '+path;
		
		let asset = new DungeonRoomAsset({
			model : path,
		}, this.room);

		asset.__history = [];
		asset.__historyMarker = 0;
		this.addHistory(asset);
		this.room.addAsset(asset);
		await this.gl.stage.addDungeonAsset(asset);
		this.save();
		this.bindMeshes();
		this.control.attach(asset._stage_mesh);
		window.ACTIVE_MESH = asset._stage_mesh;
		this.gl.renderer.domElement.focus();
		return asset;

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
		
		// Encounters can be a single encounter once one has started, but is always an array in the editor
		if( !Array.isArray(this.room.encounters) )
			this.room.encounters = [];

		// Make sure there's a room asset
		if( !this.room.assets.length ){

			const roomAsset = new DungeonRoomAsset({
				model : 'Dungeon.Room.R10x10',
				room : true
			}, this.room);
			this.room.addAsset(roomAsset);
			this.save();

		}
		
		this.room.rebase();
		// Editing a room in a dungeon
		if( !this.isTemplate() )
			this.room.parent = new Dungeon(window.mod.mod.getAssetById(this.room_raw._mParent.type, this.room_raw._mParent.label ));

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

		const data = this.room.save("mod");
		this.room_raw.assets = data.assets;
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
			if( !Array.isArray(asset.interactions) )
				return;

			for( let n of asset.interactions ){

				if( typeof n === "string" )
					n = window.mod.getAssetById("gameActions", n);

				if( n.type === interaction )
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

		// Asset window already exists, rebuild it
		if( this.assetWindow && !this.assetWindow.dead ){
			this.assetWindow.rebuild.call(this.assetWindow);
			return;
		}

		const th = this;

		const build = function(){

			if( !th.control.object ){
				this.close();
				return;
			}

			const asset = th.control.object.userData.dungeonAsset;
			if( !asset ){
				this.close();
				return;
			}

			this.asset.asset = asset;	// Needs to be set because dungeonAsset doesn't have a library
			let html = '';
			html += '<div class="labelFlex">';
				html += '<label>Name: <input name="name" value="'+esc(asset.name)+'" type="text" class="saveable" autocomplete="chrome-off" /></label>';
				html += '<label title="Time in seconds, 0 = no respawn">Respawn: <input name="respawn" value="'+esc(asset.respawn)+'" type="text" class="saveable" /></label>';
				html += '<label>Hide if non-interactive: <input name="hide_no_interact" '+(asset.hide_no_interact ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
			html += '</div>';

			html += 'Tags: <div class="tags">'+HelperTags.build(asset.tags)+'</div>';
			html += 'Game Actions: <div class="interactions"></div>';
			html += 'Conditions: <div class="conditions"></div>';

			const animated = Boolean(th.control.object.userData.playAnimation);
			if( animated ){
				
				html += '<br />Preview animation: <select class="animPreviewer">';
				for( let clip of th.control.object.userData.mixer._actions ){
					html += '<option value="'+esc(clip._clip.name)+'">'+esc(clip._clip.name)+'</option>';
				}
				html += '</select>';

			}

			this.setDom(html);


			HelperTags.bind(this.dom.querySelector("div.tags"), tags => {
				HelperTags.autoHandleAsset('tags', tags, asset);
				th.save();
			});

			
			this.dom.querySelector("div.interactions").appendChild(EditorGameAction.assetTable(this, asset, "interactions", false, 2));

			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false, false));	


			HelperAsset.autoBind( this, asset, DB, (field, value) => {
				th.save();
			});

			const table = this.dom.querySelector('div.interactions table');


			// Searches our interactions by id
			const openGameActionEditor = id => {
				
				// Find it in our list
				for( let a of asset.interactions ){

					// This was a string, open editor
					if( a === id ){

						const asset = window.mod.mod.getAssetById('gameActions', a);
						if( !asset ){
							alert("Asset missing or not from this mod");
							return;
						}
						window.mod.buildAssetEditor( 'gameActions', id, undefined, this );
						return;

					}
					else if( a && a.id === id || a.label === id ){

						window.mod.buildAssetEditor( 'gameActions', a, undefined, this );

					}

				}
				
			}

			if( animated ){
				this.dom.querySelector('select.animPreviewer').onchange = event => {

					th.control.object.userData.playAnimation(event.currentTarget.value);

				};
			}

			// Bind each table row
			table.querySelectorAll("tr.asset").forEach(el => el.onclick = event => {
				
				const id = el.dataset.id;
				

				// Delete from linked array
				if( event.ctrlKey ){

					const index = parseInt(el.dataset.index);
					asset.interactions.splice(index, 1);
					this.rebuild();
					th.save();
					window.mod.setDirty(true);
					return;

				}
				openGameActionEditor(id);

			});
			
			// Bind the add new button
			table.querySelector("input.addNew").onclick = () => {

				const linker = window.mod.buildAssetLinker( this, asset, 'interactions', 'gameActions', false );

				linker.dom.querySelector('input.new').onclick = event => {
			
					const obj = new GameAction();
					if( !asset.interactions )
						asset.interactions = [];
					asset.interactions.push(obj);
					linker.remove();
					this.rebuild();	
					
					openGameActionEditor(obj.id);

				};
	
			};


		};

		
		this.assetWindow = Window.create('REPLACE_ID', 'dungeonAssets', '', 'crafting', build, {}, this.win);
		this.assetWindow.onChange = () => build.call(this.assetWindow);
		this.assetWindow.setHelp(() => {

			let out = '';

			out += '<h3>Name:</h3>'+
				'<p>Name the asset (optional). If the asset has a door action, this is what will be displayed above the door.</p>';

			out += '<h3>Respawn:</h3>'+
				'<p>Respawn time in seconds if a container. 0 for never respawn.</p>';

			out += '<h3>Hide if non-interactive:</h3>'+
				'<p>Hides the object if it has no viable game actions bound to it.</p>';

			out += '<h3>Tags:</h3>'+
				'<p>Often auto added, but these are tags that will be added to all players in the room.</p>';

			out += '<h3>Game Actions:</h3>'+
				'<p>GameActions to trigger when clicking this mesh. '+HelperAsset.helpLinkedList+'</p>';

			out += '<h3>Conditions:</h3>'+
				'<p>Conditions needed to be met in order to draw this mesh. '+HelperAsset.helpLinkedList+'</p>';


			return out;
		});

	}


}



