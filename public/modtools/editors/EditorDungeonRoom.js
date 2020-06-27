import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorAsset from './EditorAsset.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon, { DungeonRoom, DungeonRoomAsset } from '../../classes/Dungeon.js';
import {default as WebGL, Stage} from '../../classes/WebGL.js';
import {default as libMeshes, LibMesh, getNonDoorMeshes} from '../../libraries/meshes.js';
import TransformControls from '../../ext/TransformControls.js';
import * as THREE from '../../ext/THREE.js'; 

const DB = 'dungeonRooms',
	CONSTRUCTOR = DungeonRoom;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();

	//this.assets = [];			// First asset is always the room. These are DungeonRoomAssets

	let html = '';

	// Todo: Put the 3d editor here
	html += '<div class="webglRenderer">'+
		'<div class="pusher"></div>'+
		'<div class="content"></div>'+
	'</div>';


	// Todo: Add the asset inserter
	html += '<div class="assetInserter">';
		html += '<select id="meshToTest" multiple>';
		for( let i in libMeshes )
			html += '<option value="'+i+'">'+i+'</option>';
		html += '</select>';
	html += '</div>';

	html += '<div class="labelFlex">';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Outdoors <input type="checkbox" class="saveable" name="outdoors" '+(dummy.outdoors ? 'checked' : '')+' /></label><br />';
		html += '<label title="Lets you change the loading zoom, 0 for auto">Zoom: <input type="number" min=0 step=1 name="zoom" class="saveable" value="'+esc(dummy.zoom)+'" /></label>';
		html += '<label>Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label>Ambiance volume: <input type="range" name="ambiance_volume" min=0 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';

		html += '<label>Asset: <select class="roomBaseAsset">';
		LibMesh.iterate((mesh, path) => {
			if( mesh.isRoom )
				html += '<option value="'+esc(path)+'">'+esc(path)+'</option>';
		});	
		html += '</select></label>';
		
	html += '</div>';

	

	

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Picks the first viable one when you enter, stays with it until respawn is triggered">Encounters:</span> <div class="encounters"></div>';
	

	this.setDom(html);



	// Bind linked objects
	this.dom.querySelector("div.encounters").appendChild(EditorAsset.assetTable(this, asset, "encounters"));	
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


class Editor{

	constructor( win, asset ){

		const modtools = window.mod,
			gl = modtools.webgl;
		this.gl = gl;
		this.win = win;


		// Add transform controls
		const control = new TransformControls( gl.camera, gl.renderer.domElement, () => {});
		this.control = control;
		control.setTranslationSnap(1);
		control.setRotationSnap(THREE.Math.degToRad(1));
		control.addEventListener( 'dragging-changed', function( event ){
			gl.controls.enabled = !event.value;
		});

		control.addEventListener( 'objectChange', event => {
			console.log("Object changed", event);
		});

		gl.scene.add(control);
		gl.onRender = function(){
			control.update();
		};
		


		const 
			renderDiv = win.dom.querySelector('div.webglRenderer'),
			contentDiv = win.dom.querySelector('div.webglRenderer > div.content');

		this.renderDiv = renderDiv;
		this.contentDiv = contentDiv;
		this.room_raw = asset;
		this.room = DungeonRoom.loadThis(asset);
		this.rebase();

		const baseAssetSelect = win.dom.querySelector('select.roomBaseAsset');
		const roomAsset = this.room.getRoomAsset();
		if( roomAsset )
			baseAssetSelect.value = roomAsset.model;
		baseAssetSelect.onchange = () => {
			this.room.getRoomAsset().model = baseAssetSelect.value;
			this.save();
			this.draw();
		};
		const outdoorToggle = win.dom.querySelector('input[name=outdoors]');
		outdoorToggle.addEventListener('change', () => {
			this.room.outdoors = Boolean(outdoorToggle.checked);
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

	}

	// Adds a new mesh and returns a dungeonRoomAsset
	addMesh( path ){

		const mesh = LibMesh.getByString(path);
		if( !mesh )
			throw 'Unable to find mesh with path: '+path;
		
		let asset = new DungeonRoomAsset({
			model : path,
		}, this.room);
		this.room.addAsset(asset);
		this.gl.stage.addDungeonAsset(asset);
		this.save();
		this.bindMeshes();
		return asset;

	}

	updateMeshSelects( index ){

		let path = [];
		const selects = this.win.dom.querySelectorAll('div.assetInserter > select');
		selects.forEach((el, i) => {
			if( i > index )
				el.remove();
			else if( el.value )
				path.push(el.value);
		});

		let meshes = getNonDoorMeshes();

		if( !path.length )
			return;

		let i = "";
		for( i of path )
			meshes = meshes[i];

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

	// Try to rebase
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



	}

	// Tries to save the room dummy onto room_raw
	save(){

		const data = this.room.save("mod");
		this.room_raw.assets = data.assets;
		window.mod.setDirty(true);

	}

	bindMeshes(){

		console.log("Todo: Bind the drag and drop");

	}

	async draw(){

		if( this.gl.stage )
			this.gl.stage.destructor();
		let stage = new Stage(this.room, this.gl, true);
		this.gl.resetStage( stage );
		await stage.draw();
		stage.toggle( true );

		this.bindMeshes();

	}
	


}



