/*
	Notes on meshes:

	Custom userData properties:
	- dungeonAsset
	- tweens - Object of functions that return TWEEN.Tweens when called.
	- particles - Array of libParticles particle systems 
	- soundLoops - Array of {url:(str)url, volume:(float)volume=0.5}
	- _stage - Added automatically when placed into a WebGL stage
	- onInteractivityChange() - Raised when interactivity changes
	DOOR ONLY
	- LOCK - three.mesh child object which serves as the lock. 
		Automatically set when adding a child object with the name "LOCK".
		Used to provide a shortcut when toggling lockable object locks.
		Won't show/hide automatically, use onStagePlaced to affect it.
		Also remember to set the LibMesh asset lockable to true if you want to allow it to be locked in the dungeon generator
	RIGGED ONLY
	- playAnimation(str animation) - Starts an animation. Immediately overrides a previous animation.
	- animationIsIdle() - Returns true if only the idle or no animation is playing
	- mixer - The animation mixer. Useful if you want to control the animations directly.
	- template - The mesh template. Useful for dungeons since they hold the height/width coordinates and such
	EDITOR ONLY
	- EDITOR_DRAGGABLE - Boolean of whether an item should be draggable in the editor
	- EDITOR_PATH - Contains the library path for the editor

	ANIMATIONS:
	- If an object is animated, the animation named "idle" is looped by default
	- Interactive objects such as doors, levers, crates etc should also have:
		- open = Open animation. Played once, ends at last key.
		- idle_opened = Idle loop when opened (Optional). Generally the last key.
	
	

*/
import * as THREE from '../ext/THREE.js';
import GameAction from '../classes/GameAction.js';
import libMat from './materials.js';
import JDLoader from '../ext/JDLoader.min.js';
import libParticles from './particles.js';
import AC from '../classes/AssetCache.js';
import stdTag from './stdTag.js';
import Water from '../ext/Water.js';
import Water2 from '../ext/Water2.js';
import {BufferGeometryUtils} from '../ext/BufferGeometryUtils.js';
import {GLTFLoader} from '../ext/GLTFLoader.js';


class LibMesh{
	constructor(data){
		this.isRoom = data.isRoom;					// Set to true if this is a base room mesh		
		this.url = data.url;		// Relative to media/models/ - Can also be a function that returns a mesh
		this.materials = data.materials || [];		// Should be Material objects from materials.js
		
		this.animations = data.animations;			// object of animation : (obj)properties
													// https://threejs.org/docs/#api/en/animation/AnimationAction
		this.receive_shadow = data.receive_shadow !== false;
		this.cast_shadow = data.cast_shadow !== false;
		this.name = data.name || "";
		this.soundLoops = data.soundLoops;
		this.tags = Array.isArray(data.tags) ? data.tags : [];								// Game tags. These get merged over to dungeonAsset for netcode reasons
		this.static = data.static;					// If true this mesh can be cached after flattening
													// If unset, the code tries to figure it out automatically based on the events set, if it's animated etc

		// Metadata for dungeon generator
		this.lockable = data.lockable || false;								// Use the door lock system
		this.attachments = Array.isArray(data.attachments) ? data.attachments : [];	// use LibMeshAttachment
		this.auto_bounding_box = data.auto_bounding_box;										// Creates an automatic invisible prim to use as a bounding box for raycasting
		this.door = data.door || LibMesh.DoorTypes.DOOR_NONE;	// used for the procedural generator to figure out where a door can go. Their placement rotation matters. Where 0 = north, pi/2 = west...
		this.doorRotOffs = data.doorRotOffs || 0;									// Helper for above in order to show which direction is forward

		// helper flags
		this.want_actions = data.want_actions;	// Array of GameAction types that this asset wants. If not, it gets highlighted in the editor. Use sub arrays for OR

		// Events
		this.beforeFlatten = data.beforeFlatten || function(mesh){};		// Raised before you flatten. Only raised once
		this.onFlatten = data.onFlatten || function(mesh){};				// Raised after you flatten, this is the LibMesh object. Only raised once.
		this.onInteract = data.onInteract || undefined;					// Raised when clicked, This is the LibMesh object
		this.onStagePlaced = data.onStagePlaced || function(dungeonAsset, mesh){};		// Raised when placed into world. Can happen multiple times.
		this.afterStagePlaced = data.afterStagePlaced || function(dungeonAsset, mesh){};
		this.onInteractivityChange = data.onInteractivityChange || function(dungeonAsset, interactive){};

	}

	// Note: Avoid parallelization to prevent the viewer from freezing
	// Returns a promise that resolves with a mesh
	async flatten( unique = false ){


		// Attachmentindexes is an array of attachments that should be allowed
		// Use ["ALL"] to enable all attachments
		let submeshes = [];
		for( let att of this.attachments ){
		
			let sub = await att.flatten();
			submeshes.push(sub);

		}

		// Load the model
		let mesh, mats = [], animations;
		if( typeof this.url === "function" ){

			mesh = this.url();
			
		}
		else{

			let data = await LibMesh.cache.fetch('media/models/'+this.url);
			
			const ext = this.url.split('.').pop().toLowerCase();

			// JD loader has built in management
			if( ext === "jd" ){
				data = data.createObject(0);
				if( data.isSkinnedMesh )
					animations = data.geometry.animations;

			}
			// The other one is retarded and needs mesh merging
			else{
				
				data.scene.animations = animations = data.animations;
				data = data.scene;
				// Since this importer deals entirely with groups, we gotta set the sub-names to HITBOX in order for mouse events to work
				data.traverse(el => {
					if( el.isMesh )
						el.name = 'HITBOX';
				});

			}

			
			// Load the materials
			// SkinnedMesh needs a unique material or it goes tits up
			let hasCustomDepthMaterial = false;
			for( let mat of this.materials ){

				if( mat === undefined )
					console.error("Undefined material found in", this);

				const m = mat.fetch(unique || data.type === "SkinnedMesh");
				mats.push(m);
				if( mat.type === 'MeshDepthMaterial' )
					hasCustomDepthMaterial = true;

			}

			if( mats[0].type === 'Water'){
				mesh = new Water(data.geometry, mats[0].material);
				mesh.userData._is_water = true;
			}
			else if( mats[0].type === 'Water2'){
				mesh = new Water2(data.geometry, mats[0].material);
			}
			else{

				if( data.isMesh )
					data.material = mats;
				else{
					
					let n = 0;
					data.traverse(el => {

						if( !el.material )
							return;

						el.material = mats[n];
						++n;
						
					});

				}
					

				mesh = data;

			}
			
			if( hasCustomDepthMaterial ){
				// This doesn't work in three yet
				const depthMats = [];
				let dm = null;
				for( let m of mats ){
					if( m.userData.customDepthMaterial ){
						depthMats.push(m.userData.customDepthMaterial);
						dm = m.userData.customDepthMaterial;
					}
					else
						depthMats.push(new THREE.MeshDepthMaterial({
							blending : THREE.NormalBlending
						}));
				}
				mesh.customDepthMaterial = dm;
			}

		}

		await this.beforeFlatten( mesh );

		let ud = mesh.userData;
		mesh.traverse(el => {
			
			if( el.isMesh ){
				el.receiveShadow = this.receive_shadow;
				el.castShadow = this.cast_shadow;
			}

		});


		if( this.auto_bounding_box ){
			let box = new THREE.Box3().setFromObject( mesh );
			let max = box.max, min = box.min;
			let boundingBox = new THREE.Mesh(
				new THREE.BoxGeometry(
					Math.abs(max.x-min.x),
					Math.abs(max.y-min.y),
					Math.abs(max.z-min.z),
				),
				//new THREE.MeshBasicMaterial()
				libMat.Solids.Invisible.fetch()
			);
			boundingBox.name = 'HITBOX';
			boundingBox.position.x = min.x+(max.x-min.x)/2;
			boundingBox.position.y = min.y+(max.y-min.y)/2;
			boundingBox.position.z = min.z+(max.z-min.z)/2;
			mesh.add(boundingBox);
		}


		// Handle skinning
		if( animations && animations.length ){

			let mixer = new THREE.AnimationMixer(mesh);
			mesh.userData.mixer = mixer;

			// Enable animations
			for( let anim of animations ){

				let clip = mixer.clipAction(anim.name);
				if( typeof this.animations === "object" && typeof this.animations[anim.name] === "object" ){

					for( let i in this.animations[anim.name] )
						clip[i] = this.animations[anim.name][i];

				}
				clip.enabled = true;

			}

			// Enable skinning on the materials
			for( let mat of mats )
				mat.skinning = true;

			// Custom method
			mesh.userData.playAnimation = function( name, crossfade = 0 ){

				let action = mixer.clipAction(name);
				if( action ){

					mesh.userData.activeAnimation = name;
					// Todo: Improve this with tweening
					mixer.stopAllAction();				
					if( action.time === 0 && action.timeScale < 0 )
						action.time = action.getClip().duration;
					action.play();
					return action;

				}
			};

			// no animation or only idle is playing
			mesh.userData.animationIsIdle = function(){
				for( let anim of mesh.geometry.animations ){
					let action = mixer.clipAction(anim);
					if( action.name !== 'idle' && action.isRunning() )
						return false;
				}
				return true;
			};

			mesh.userData.activeAnimation = 'idle';

		}

		mesh.userData.soundLoops = this.soundLoops;
		
		ud.template = this;

		for( let m of submeshes )
			mesh.add(m);

		// Find default naming convention childs
		for( let ch of mesh.children ){

			// Door lock. Makes this asset lockable.
			if( ch.name === 'LOCK' )
				mesh.userData.LOCK = ch;
		}

		mesh.name = this.name;
		await this.onFlatten(mesh);

		await delay(10); // Helps prevent browser freezing

		return mesh;

	}

	// Returns an array of unique keys
	getTags(){
		let tags = valsToKeys(this.tags);
		for( let sub of this.attachments ){
			let subTags = sub.getTags();
			for( let t of subTags )
				tags[t] = true;
		}
		return Object.keys(tags);
	}

	

}

LibMesh.DoorTypes = {
	DOOR_NONE : 0,
	DOOR_AUTO_XY : 1,	// Based on object rotation 
	DOOR_UPDOWN : 2,	// Accept both, ex an elevator
	DOOR_ALL : 3,		// 
	DOOR_DOWN : 4,
	DOOR_UP : 5,
}



LibMesh.loader = new JDLoader();
LibMesh.gltf = new GLTFLoader();
LibMesh.cache = new AC();
LibMesh.cache.fetchMissingAsset = function( path ){
	return new Promise(res => {
		try{
			const ext = path.split(".").pop().toLowerCase();
			if( ext === 'jd' )
				return LibMesh.loader.load(path, res);
			return LibMesh.gltf.load(path, data => {
				res(data);
			});
		}catch(err){
			console.error("Error detected in path", path, err);
		}
	});
};

// Useful helper to play a sound both locally and on netplayers, attached to a DungeonAsset 
LibMesh.playSoundShared = function( mesh, asset, url, volume, loop, id ){
	let stage = mesh.userData._stage;
	stage.playSound(mesh, url, volume, loop, id);
	// Interacts only happen on the host, so make sure stuff is sent to the netgame
	game.net.dmPlaySoundOnMesh( asset.id, url, volume, loop, id );
};
LibMesh.playSound = function( mesh, asset, url, volume, loop, id ){
	let stage = mesh.userData._stage;
	stage.playSound(mesh, url, volume, loop, id);
};

// Creates an array with paths to the library
LibMesh.getFlatLib = function( base, label = '' ){
	
	if( !base )
		base = build();
	let out = [];
	for( let i in base ){
		if( base[i] instanceof this )
			out.push((label ? label+'.' : '')+i);
		else
			out = out.concat(this.getFlatLib(base[i], (label ? label+'.' : '')+i));
	}
	out.sort();
	return out;

};

// Supply a function with arguments (model, path)
LibMesh.iterate = function( fn ){
	let th = this;
	function iterate( obj, base ){
		for( let i in obj ){
			let b = (base ? base+'.'+i : i);
			if( obj[i] instanceof th )
				fn(obj[i], b);
			else
				iterate(obj[i], b);
		}
	}	
	return iterate(build());
};

class LibMeshAttachment{
	constructor(data){
		if( typeof data !== "object" )
			data = {};
		this.path = data.path;
		this.position = data.position || new THREE.Vector3();
		this.rotation = data.rotation || new THREE.Vector3();
		this.scale = data.scale || new THREE.Vector3(1,1,1);
		this.always = !!data.always;
	}

	getTags(){
		let mesh = LibMesh.getByString(this.path);
		if( !mesh )
			return [];
		return mesh.tags;
	}

	async flatten( childIndex ){
		let mesh = LibMesh.getByString(this.path);
		if( !mesh ){
			console.error("mesh not found", this.path);
			return false;
		}
		let out = await mesh.flatten();
		out.position.copy(this.position);
		out.rotation.setFromVector3(this.rotation);
		out.scale.copy(this.scale);
		out.userData.EDITOR_DRAGGABLE = true;			// makes it draggable in the editor
		out.userData.EDITOR_PATH = this.path;
		return out;
	}
}


LibMesh.getByString = function(path){
	path = path.split(".");
	let base = build();
	while(path.length){
		base = base[path.shift()];
		if( !base )
			return false;
	}
	return base;
};

//console.log("Sybian", stdTag.mBondageSybian);
// Has to be wrapped like this due to cyclic dependency
function build(){

	const gameActionDoors = [GameAction.types.door,GameAction.types.exit,GameAction.types.proceduralDungeon];

	if( LibMesh.library )
		return LibMesh.library;
	

		
	LibMesh.library = {

		Dungeon : {
			Room : {
				R10x10 : new LibMesh({
					isRoom : true,
					url : 'rooms/dungeon_10x10.JD',
					materials : [
						libMat.StoneTile.DungeonWall,
						libMat.StoneTile.DungeonFloor,
						libMat.Brick.DungeonBlack,
						libMat.StoneTile.DungeonWall,
					],
					tags : [stdTag.mWall],
				}),
				R10x10RL : new LibMesh({
					isRoom : true,
					url : 'rooms/dungeon_10x10_reverse_l.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.StoneTile.DungeonWall,
						libMat.StoneTile.DungeonFloor,
						libMat.Brick.DungeonBlack,
						libMat.StoneTile.DungeonWall,
					],
				}),
				R6x10 : new LibMesh({
					isRoom : true,
					url : 'rooms/dungeon_6x10.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.StoneTile.DungeonWall,
						libMat.StoneTile.DungeonFloor,
						libMat.Brick.DungeonBlack,
						libMat.StoneTile.DungeonWall,
					],
				}),
				R6x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/dungeon_6x6.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.StoneTile.DungeonWall,
						libMat.StoneTile.DungeonFloor,
						libMat.Brick.DungeonBlack,
						libMat.StoneTile.DungeonWall,
					],
				}),
				Necro8x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/necrodungeon_8x6.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Tile,
					],
				}),
				Necro6x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/necrodungeon_6x6.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Tile,
					],
				}),
				Necro8x6s : new LibMesh({
					isRoom : true,
					url : 'rooms/necrodungeon_8x6s.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Tile,
					],
				}),
				Necro8x8 : new LibMesh({
					isRoom : true,
					url : 'rooms/necrodungeon_8x8.JD',
					tags : [stdTag.mWall],
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Tile,
					],
				}),
				Shackles : new LibMesh({
					url : 'doodads/wall_shackles_1x1.JD',
					tags : [stdTag.mShackles],
					materials : [
						libMat.Metal.Chain,
						libMat.Metal.DarkGeneric,
					],

					
				}),
				WallMount : new LibMesh({
					url : 'doodads/wall_mount_1x1.JD',
					tags : [],
					materials : [
						libMat.Metal.DarkGeneric,
						libMat.Brick.Tile,
					],

					
				}),
				WallChain : new LibMesh({
					url : 'doodads/hanging_chains_1x1.JD',
					tags : [],
					materials : [
						libMat.Metal.Chain,
					],

					
				}),
				SewerOutlet : new LibMesh({
					url : 'doodads/sewer_outlet.JD',
					tags : [],
					materials : [
						libMat.Brick.Tile,
						libMat.Metal.Rust,
						libMat.Solids.Black
					],

					
				}),
			},
			Furniture : {
				RugTorn : new LibMesh({
					url : 'furniture/rug_3x2.JD',
					materials : [libMat.Cloth.Rug.Torn],


					tags : [stdTag.mRug],
				}),
				Altar : new LibMesh({
					url : 'furniture/altar_2x1.JD',
					materials : [libMat.StoneTile.DungeonFloor,libMat.Metal.Rust],


					tags : [stdTag.mAltar],
				}),
				MetalFence : new LibMesh({
					url : 'structure/metal_fence_2x1.JD',
					materials : [libMat.Metal.DarkGeneric],


					tags : [stdTag.mFence],
				}),
				MetalFenceRust : new LibMesh({
					url : 'structure/metal_fence_2x1.JD',
					materials : [libMat.Metal.Rust],


					tags : [stdTag.mFence],
				}),
				Brazier : new LibMesh({
					url : 'doodads/brazier_1x1.JD',
					materials : [libMat.Metal.DarkGeneric],


					tags : [],
				}),
				Podium : new LibMesh({
					url : 'furniture/podium_1x1.JD',
					materials : [libMat.StoneTile.DungeonFloor,libMat.Brick.DungeonBlack],


					tags : ["m_podium"],
				}),
				Pew : new LibMesh({
					url : 'furniture/pew.JD',
					materials : [libMat.Wood.Crate,libMat.Metal.DarkGeneric,libMat.Wood.Floor2],


					tags : [stdTag.mPew, stdTag.mBench],
				}),

				TortureX : new LibMesh({
					url : 'furniture/torture_x_1x1.JD',
					materials : [libMat.Wood.Crate,libMat.Metal.DarkGeneric],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mBondageX],
				}),
				TortureTable : new LibMesh({
					url : 'furniture/torture_table_1x2.JD',
					materials : [libMat.Wood.Crate,libMat.Metal.DarkGeneric],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mBondageTable],
				}),
				TortureRack : new LibMesh({
					url : 'furniture/torture_rack_1x3.JD',
					materials : [libMat.Metal.Chain, libMat.Metal.DarkGeneric, libMat.Wood.Crate],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mBondageTable, stdTag.mBondageRack],
				}),
				CollarSeat : new LibMesh({
					url : 'furniture/collarseat_1x1.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric, libMat.Metal.Chain],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mBondageSeat, stdTag.mBondageCollarSeat],
				}),
				Stocks : new LibMesh({
					url : 'furniture/stocks_1x1.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mStocks],
				}),
				StocksLegs : new LibMesh({
					url : 'furniture/stocks_legs_1x1.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mStocks],
				}),
				Sybian : new LibMesh({
					url : 'furniture/sybian_1x1.JD',
					materials : [libMat.Metal.DarkGeneric, libMat.Metal.Chain, libMat.Solids.Rubber, libMat.Wood.Crate],


					tags : [stdTag.mTorture, stdTag.mBondage, stdTag.mBondageSybian],
				}),

				Coffin : new LibMesh({
					url : 'furniture/coffin.JD',
					materials : [libMat.Wood.Crate],

					tags : [stdTag.mCoffin],
				}),
				CoffinOpen : new LibMesh({
					url : 'furniture/coffin_open.JD',
					materials : [libMat.Wood.Crate],

					tags : [stdTag.mCoffin],
				}),
				CoffinFloating : new LibMesh({
					url : 'furniture/coffin_floating.JD',
					materials : [libMat.Wood.Crate],

					tags : [stdTag.mCoffin],
				}),
			},
			Doodads : {
				BannerAnimated : new LibMesh({
					url : 'doodads/banner_animated.JD',
					materials : [
						libMat.Cloth.Banner.RaggedHand
					],
					tags : [stdTag.mBanner],
				}),
				Paddle : new LibMesh({
					url : 'doodads/paddle_1x1.JD',
					materials : [
						libMat.Wood.Crate
					],


					tags : [],
				}),
				Crop : new LibMesh({
					url : 'doodads/crop.JD',
					materials : [
						libMat.Solids.Rubber
					],

					tags : [],
				}),
				TeslaCoil : new LibMesh({
					url : 'doodads/tesla_coil.JD',
					materials : [
						libMat.Metal.DarkGeneric,
						libMat.Metal.Copper
					],

					tags : [],
					onStagePlaced : function(asset, mesh){
						let particles = libParticles.get('teslaCoil', mesh);
						particles.p.z = 0;
						particles.p.y = 150;
						mesh.userData.particles = [particles];
					}
				}),
			},
			Door : {
				BarsAttachment : new LibMesh({
					name : 'LOCK',	// Items named LOCK put as childs of objects will be auto hidden by default and used as a lock
					url : 'gates/door_lock_attachment.JD',
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
					],
				}),
				Default : new LibMesh({
					auto_bounding_box : true,
					url : 'gates/dungeon_door_2x1.JD',
					materials : [
						libMat.Solids.Black,
						libMat.StoneTile.DungeonWall,
						libMat.Metal.DarkGeneric,
						libMat.Wood.Crate
					],
					attachments : [
						new LibMeshAttachment({path:"Dungeon.Door.BarsAttachment"}),
					],
					


					lockable : true,
					want_actions : [gameActionDoors],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
					onStagePlaced : function( dungeonAsset, mesh ){
						
						let lock = mesh.userData.LOCK;
						if( !lock )
							return;

						// Hide if the dungeon asset is unlocked and doesn't have a way of opening it
						if( !dungeonAsset.isLocked() )
							lock.position.y -= 160;
						else
							lock.position.y = 0;

					},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/dungeon_door.ogg', 0.5 );
					},
					tags : [stdTag.mDoor],
					door : LibMesh.DoorTypes.DOOR_AUTO_XY,
				}),
				Hatched : new LibMesh({
					auto_bounding_box : true,
					url : 'gates/dungeon_door_hatch_2x1.JD',
					materials : [
						libMat.Solids.Black,
						libMat.StoneTile.DungeonWall,
						libMat.Metal.DarkGeneric,
						libMat.Wood.Crate,
						libMat.Metal.Rust
					],
					


					lockable : true,
					want_actions : [gameActionDoors],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
					onStagePlaced : function( dungeonAsset, mesh ){},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/dungeon_door.ogg', 0.5 );
					},
					tags : [stdTag.mDoor],
					door : LibMesh.DoorTypes.DOOR_AUTO_XY,
				}),
				Ladder : new LibMesh({
					url : 'gates/ladder_1x1.JD',
					materials : [
						libMat.Wood.Crate,
					],


					want_actions : [gameActionDoors],
					tags : [stdTag.mLadder],
					onFlatten : function(mesh){
						let lamp = new THREE.SpotLight(0xFFFFFF, 0, 1200, 0.01, 0.5, 0);
						lamp.intensity = 0;
						lamp.position.y = 500;
						lamp.position.z = -50;
						lamp.castShadow = true;
						mesh.add(lamp);
						lamp.target = mesh;
						// Setting a tween like this allows the room to turn it off when the room changes
						mesh.userData.tweens = {
							interact : new TWEEN.Tween(lamp)
								.to({angle:0.2, intensity:1},500)
								.easing(TWEEN.Easing.Sinusoidal.Out)
						};
					},
					// Reset the lamp when placed
					onStagePlaced : function( asset, mesh ){
						let lamp = mesh.children[0];
						lamp.intensity = 0;
						lamp.angle = 0.001;
					},
					onInteract : function(mesh, room, asset){

						mesh.userData.tweens.interact.start();
						LibMesh.playSound( mesh, asset, 'media/audio/ladder.ogg', 0.5);
					
					},
					door : LibMesh.DoorTypes.DOOR_UP,
				}),
				Trapdoor : new LibMesh({
					url : 'gates/trapdoor_2x2.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Solids.Black
					],


					want_actions : [gameActionDoors],
					tags : [stdTag.mTrapdoor],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/trapdoor.ogg', 0.5);
					},
					tags : [stdTag.mDoor],
					door : LibMesh.DoorTypes.DOOR_DOWN,
				}),
				WallLever : new LibMesh({
					auto_bounding_box : true,
					url : 'gates/lever_wall_1x1.JD',
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
					],
					want_actions : [GameAction.types.lever],
					tags : [stdTag.mLever, stdTag.mLEVER_MARKER],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce
						},
						"close" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : -1,
						},
					},
					beforeFlatten : function( mesh ){
						for( let anim of mesh.geometry.animations ){
							if( anim.name === 'open' ){
								let a = new THREE.AnimationClip("close", anim.duration, anim.tracks);
								mesh.geometry.animations.push(a);
								return;
							}
						}
					},
					// Start idle animation if it's already used
					afterStagePlaced : function( dungeonAsset, mesh ){

						// Levers should have a single boolean dungeon var
						const dvar = dungeonAsset.getFirstDvar();
						if( dvar ){
							mesh.userData.playAnimation("idle_opened");
						}
					},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/lever.ogg', 0.5);
					}
				}),
				SpiralStair : new LibMesh({
					url : 'gates/spiral_stairs_2x2.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Brick.Small,
					],


					want_actions : [gameActionDoors],
					tags : [stdTag.mStair],
					onFlatten : function(mesh){
						let lamp = new THREE.SpotLight(0xFFFFFF, 0, 1200, 0.01, 0.5, 0);
						lamp.intensity = 0;
						lamp.position.y = 1000;
						lamp.castShadow = true;
						mesh.add(lamp);
						lamp.target = mesh;
						// Setting a tween like this allows the room to turn it off when the room changes
						mesh.userData.tweens = {
							interact : new TWEEN.Tween(lamp)
								.to({angle:0.2, intensity:1},500)
								.easing(TWEEN.Easing.Sinusoidal.Out)
						};
					},
					// Reset the lamp when placed
					onStagePlaced : function( asset, mesh ){
						let lamp = mesh.children[0];
						lamp.intensity = 0;
						lamp.angle = 0.001;
					},
					onInteract : function(mesh, room, asset){

						mesh.userData.tweens.interact.start();
						LibMesh.playSound( mesh, asset, 'media/audio/ladder.ogg', 0.5);
					
					},
					door : LibMesh.DoorTypes.DOOR_UP
				}),
			}
		},
		Farm : {
			Furniture : {
				Stool : new LibMesh({
					url : 'furniture/stool_05x05.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric
					],


					
					tags : [stdTag.mStool],
				}),
				Chair : new LibMesh({
					url : 'furniture/chair_1x1.JD',
					materials : [
						libMat.Wood.Crate
					],


					
					tags : [stdTag.mChair, stdTag.mChairBackless],
				}),
				Bench : new LibMesh({
					url : 'furniture/bench_105_05.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
					tags : [stdTag.mBench],


					
				}),
				TableOneChair : new LibMesh({
					url : 'furniture/table_2x1.JD',
					materials : [libMat.Wood.Crate],


					tags : [stdTag.mTable],
					attachments : [
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(30.27,75,33.55),rotation:new THREE.Vector3(0,-0.5029,0),scale:new THREE.Vector3(0.87,0.87,0.87),is_key_item:false}),
						new LibMeshAttachment({path:"Generic.Doodads.Bowl",position:new THREE.Vector3(7,75,31),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),is_key_item:false}),
						new LibMeshAttachment({path:"Generic.Doodads.BookOpen",position:new THREE.Vector3(-47,75,26),rotation:new THREE.Vector3(0,0.4887,0),scale:new THREE.Vector3(1,1,1),is_key_item:false}),
						new LibMeshAttachment({path:"Farm.Furniture.Stool",position:new THREE.Vector3(-12,0,72),rotation:new THREE.Vector3(0,-0.0349,0),scale:new THREE.Vector3(1,1,1),is_key_item:false})
					],
				}),
				TableTwoBenches : new LibMesh({
					url : 'furniture/table_2x1.JD',
					materials : [libMat.Wood.Crate],


					tags : [stdTag.mTable],
					attachments : [
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(18,74,27),rotation:new THREE.Vector3(0,-0.5029,0),scale:new THREE.Vector3(0.87,0.87,0.87),}),
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(27,75,-23),rotation:new THREE.Vector3(0,0.841,0),scale:new THREE.Vector3(0.87,0.87,0.87),}),
						new LibMeshAttachment({path:"Generic.Doodads.Bowl",position:new THREE.Vector3(-34,75,31),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Generic.Doodads.Bowl",position:new THREE.Vector3(48,75,-34),rotation:new THREE.Vector3(0,1.117,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Generic.Doodads.Bowl",position:new THREE.Vector3(-43,75,-31),rotation:new THREE.Vector3(0,-0.9425,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Farm.Furniture.Bench",position:new THREE.Vector3(7,0,62),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Farm.Furniture.Bench",position:new THREE.Vector3(7,0,-62),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),}),
					],
				}),
				TableCorner : new LibMesh({
					url : 'furniture/table_2x1.JD',
					materials : [
						libMat.Wood.Crate
					],
					tags : [stdTag.mTable],


					
				}),
				Shelf : new LibMesh({
					url : 'furniture/dungeon_shelf_2x1.JD',
					materials : [
						libMat.Wood.Board
					],
					tags : [stdTag.mShelf],


					
				}),
				WallShelf : new LibMesh({
					url : 'furniture/shelf.JD',
					materials : [
						libMat.Wood.Board
					],
					tags : [stdTag.mShelf],


					
				}),
				ShelfContainers : new LibMesh({
					url : 'furniture/dungeon_shelf_2x1.JD',
					materials : [
						libMat.Wood.Board
					],
					tags : [stdTag.mShelf],


					
					attachments : [
						new LibMeshAttachment({path:"Generic.Containers.Crate",position:new THREE.Vector3(35,205,0),rotation:new THREE.Vector3(0,0.0698,0),scale:new THREE.Vector3(0.74,0.74,0.74),}),
						new LibMeshAttachment({path:"Generic.Containers.Crate",position:new THREE.Vector3(-32.98,1.15,15),rotation:new THREE.Vector3(0,0,-0.0349),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Generic.Containers.CrateOpen",position:new THREE.Vector3(-57.99,100.17,0),rotation:new THREE.Vector3(0,0,-0.0524),scale:new THREE.Vector3(0.56,0.56,0.56),}),
						new LibMeshAttachment({path:"Generic.Containers.Barrel",position:new THREE.Vector3(-61,202,0),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(0.47,0.47,0.47),}),
						new LibMeshAttachment({path:"Generic.Containers.Barrel",position:new THREE.Vector3(62,101,0),rotation:new THREE.Vector3(0,1.2043,0),scale:new THREE.Vector3(0.37,0.37,0.37),}),
					],
				}),
				ShelfProps : new LibMesh({
					url : 'furniture/dungeon_shelf_2x1.JD',
					materials : [
						libMat.Wood.Board
					],
					tags : [stdTag.mShelf],


					
					attachments : [
						new LibMeshAttachment({path:"Generic.Containers.Crate",position:new THREE.Vector3(-55,97,0),rotation:new THREE.Vector3(-0.0035,0,-0.0698),scale:new THREE.Vector3(0.61,0.61,0.61),}),
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(45,104,-25),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1.72,1.72,1.72),}),
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(60.64,203,14.16),rotation:new THREE.Vector3(0,0.8203,0),scale:new THREE.Vector3(1.51,1.51,1.51),}),
						new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(-26.26,206,16.51),rotation:new THREE.Vector3(0,-0.9774,0),scale:new THREE.Vector3(1.48,1.48,1.48),}),
						new LibMeshAttachment({path:"Generic.Doodads.BookClosed",position:new THREE.Vector3(58.72,108,12.5),rotation:new THREE.Vector3(0,0.8378,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Generic.Doodads.BookOpen",position:new THREE.Vector3(13,104,0),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),}),
						new LibMeshAttachment({path:"Generic.Containers.Barrel",position:new THREE.Vector3(-59,201,0),rotation:new THREE.Vector3(0,0,0.0524),scale:new THREE.Vector3(0.45,0.45,0.45),}),
					],
				}),
				RugTorn : new LibMesh({
					tags : [stdTag.mRug],
					url : 'furniture/rug_3x2.JD',
					materials : [
						libMat.Cloth.Rug.Torn
					],


				}),
				RugHide : new LibMesh({
					tags : [stdTag.mRug],
					url : 'furniture/rug_3x2.JD',
					materials : [
						libMat.Cloth.Rug.Hide
					],


				}),
				RugWhite : new LibMesh({
					tags : [stdTag.mRug],
					url : 'furniture/rug_3x2.JD',
					materials : [
						libMat.Cloth.Rug.White
					],


				}),
				RugYellow : new LibMesh({
					tags : [stdTag.mRug],
					url : 'furniture/rug_3x2.JD',
					materials : [
						libMat.Cloth.Rug.Yellow
					],


				}),
				Fireplace : new LibMesh({
					tags : [stdTag.mFireplace],
					url : 'furniture/fireplace.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.StoneTile.DungeonFloor,
						libMat.Metal.DarkGeneric
					],


				}),
				BarShelf : new LibMesh({
					tags : [stdTag.mShelf],
					url : 'furniture/bar_shelf.JD',
					materials : [
						libMat.Wood.Crate
					],


				}),
				BarTable : new LibMesh({
					tags : [stdTag.mTable],
					url : 'furniture/bar_table.JD',
					materials : [
						libMat.Wood.Crate
					],


				}),
				BarTableSquare : new LibMesh({
					tags : [stdTag.mTable],
					url : 'furniture/counter_square.JD',
					materials : [
						libMat.Wood.Crate
					],
				}),
				BarStool : new LibMesh({
					tags : [stdTag.mChair, stdTag.mChairBackless],
					url : 'furniture/barstool.JD',
					materials : [
						libMat.Wood.Crate
					],


				}),
				BannerNavy : new LibMesh({
					url : 'doodads/banner_animated.JD',
					materials : [
						libMat.Cloth.Banner.Navy
					],
					tags : [stdTag.mBanner],
				}),
				Bed : new LibMesh({
					url : 'furniture/bed_1x2.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Cloth.Green,
						libMat.Cloth.Thick,
						libMat.Cloth.Sheet,
					],
					tags : [stdTag.mTable],


					
				}),
				Drawers : new LibMesh({
					url : 'furniture/drawers_2x1.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
					tags : [stdTag.mTable],


					
				}),
				Nightstand : new LibMesh({
					url : 'furniture/nightstand_1x1.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
					tags : [stdTag.mTable],


					
				}),
				WoodSteps : new LibMesh({
					url : 'furniture/wood_steps.JD',
					materials : [
						libMat.Wood.Crate,
					],
					tags : [stdTag.mStair],
				}),
			},
			Room : {
				R8x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/cottage_8x6.JD',
					materials : [
						libMat.Structure.CottageWall,
						libMat.Wood.Floor,
						libMat.Wood.Logs,
						libMat.Wood.Crate,
					],
					tags : [stdTag.mWall],
				}),
				R8x4 : new LibMesh({
					isRoom : true,
					url : 'rooms/cottage_interior_8x4.JD',
					materials : [
						libMat.Structure.CottageWall,
						libMat.Wood.Floor,
						libMat.Wood.Logs,
					],
					tags : [stdTag.mWall],
				}),
				R6x4 : new LibMesh({
					isRoom : true,
					url : 'rooms/cottage_interior_6x4.JD',
					materials : [
						libMat.Structure.CottageWall,
						libMat.Wood.Floor,
						libMat.Wood.Logs,
					],
					tags : [stdTag.mWall],
				}),
				R10x3 : new LibMesh({
					isRoom : true,
					url : 'rooms/cottage_interior_10x3.JD',
					materials : [
						libMat.Structure.CottageWall,
						libMat.Wood.Floor,
						libMat.Wood.Logs,
					],
					tags : [stdTag.mWall],
				}),
				Window : new LibMesh({
					url : 'rooms/cottage_window.JD',
					materials : [
						libMat.Wood.Crate,
					],
				}),
			},
			Doodads : {
				RopeSpool : new LibMesh({
					url : 'doodads/rope_spool.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Cloth.Rope
					],
					tags : [stdTag.mRope],


				}),
				CartWheel : new LibMesh({
					url : 'doodads/cart_wheel.JD',
					materials : [libMat.Wood.Crate],
					tags : [], 
				}),
				Cart : new LibMesh({
					url : 'doodads/cart.JD',
					materials : [libMat.Wood.Crate],
					tags : [stdTag.mCart], 
				}),
				ShopCart : new LibMesh({
					url : 'doodads/shop_cart.JD',
					materials : [libMat.Wood.Crate],
					tags : [stdTag.mMerchantCart], 
				}),
				ShopCartTent : new LibMesh({
					url : 'doodads/merchant_cart.JD',
					materials : [libMat.Wood.Crate,libMat.Cloth.DarkDoublesided],
					tags : [stdTag.mMerchantCart], 
				}),
				WoodBoards : new LibMesh({
					url : 'doodads/woodboards.JD',
					materials : [libMat.Wood.Crate],
					tags : [], 
				}),
				Haybale : new LibMesh({
					url : 'doodads/haybale.JD',
					materials : [libMat.Structure.StrawRoof, libMat.Nature.PalmRoof, libMat.Cloth.Rope],
					tags : [stdTag.mHaybale], 
				}),
				Shovel : new LibMesh({
					url : 'doodads/shovel.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric],
					tags : [stdTag.mShovel],
				}),
				Pitchfork : new LibMesh({
					url : 'doodads/pitchfork.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric],
					tags : [stdTag.mPitchfork],
				}),
				Axe : new LibMesh({
					url : 'doodads/axe.JD',
					materials : [libMat.Wood.Crate, libMat.Metal.DarkGeneric],
					tags : [stdTag.mAxe],
				}),
			},
			Door : {
				Stairs : new LibMesh({
					door : LibMesh.DoorTypes.DOOR_UP,
					url : 'gates/wood_stairs.JD',
					materials : [
						libMat.Wood.Crate,
					],


					want_actions : [gameActionDoors],
					tags : [stdTag.mStair],
					onFlatten : function(mesh){
						let lamp = new THREE.SpotLight(0xFFFFFF, 0, 1200, 0.01, 0.5, 0);
						lamp.intensity = 0;
						lamp.position.y = 500;
						lamp.position.z = -50;
						lamp.castShadow = true;
						mesh.add(lamp);
						lamp.target = mesh;
						// Setting a tween like this allows the room to turn it off when the room changes
						mesh.userData.tweens = {
							interact : new TWEEN.Tween(lamp)
								.to({angle:0.25, intensity:1},500)
								.easing(TWEEN.Easing.Sinusoidal.Out)
						};
					},
					// Reset the lamp when placed
					onStagePlaced : function( asset, mesh ){
						let lamp = mesh.children[0];
						lamp.intensity = 0;
						lamp.angle = 0.001;
					},
					onInteract : function(mesh, room, asset){

						mesh.userData.tweens.interact.start();
						LibMesh.playSound( mesh, asset, 'media/audio/ladder.ogg', 0.5);
					
					}
				}),
				Door : new LibMesh({
					url : 'gates/wood_door.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Solids.Black
					],


					want_actions : [gameActionDoors],
					tags : [stdTag.mDoor],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/trapdoor.ogg', 0.5);
					},
					door : LibMesh.DoorTypes.AUTO_XY,
				}),
			}
		},
		Generic : {
			Containers : {
				Barrel : new LibMesh({
					url : 'containers/barrel_1x1.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric
					],
					tags : [stdTag.mBarrel],


					
				}),
				Crate : new LibMesh({
					url : 'containers/crate_1x1.JD',
					materials : [
						libMat.Wood.Crate
					],
					tags : [stdTag.mCrate],


					
				}),
				CrateOpen : new LibMesh({
					url : 'containers/crate_open_1x1.JD',
					materials : [
						libMat.Wood.Crate
					],


					
				}),
				Chest : new LibMesh({
					url : 'containers/chest_1x1.JD',
					materials : [
						libMat.Metal.DarkGeneric,
						libMat.Wood.Crate
					],
					tags : [stdTag.mChest],


					
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
						}
					},
					
				}),
				ChestInteractive : new LibMesh({
					url : 'containers/chest_1x1.JD',
					materials : [
						libMat.Metal.DarkGeneric,
						libMat.Wood.Crate
					],


					
					tags : [stdTag.mChest],
					want_actions : [[GameAction.types.loot,GameAction.types.autoLoot]],
					// Animation settings
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
						}
					},
					onInteract : function( mesh, room, asset ){
						// Opening and closing a chest is local
						let stage = mesh.userData._stage;
						stage.playSound(mesh, 'media/audio/chest_open.ogg', 0.5);
					},
					afterStagePlaced : function( dungeonAsset, mesh ){
						
						if( !dungeonAsset.isInteractive() ){
							mesh.userData.playAnimation("idle_opened");
						}

					},
				}),
				LootBag : new LibMesh({
					url : 'containers/lootbag_1x1.JD',
					materials : [
						libMat.Cloth.Rope,
						libMat.Cloth.Dark,
					],
					want_actions : [[GameAction.types.loot,GameAction.types.autoLoot]],


					onFlatten : function(mesh){
						let plane = new THREE.Mesh(
							new THREE.PlaneGeometry(100,100,1,1),
							new THREE.MeshBasicMaterial()
						);
						plane.rotation.set(-Math.PI/2, 0, 0);
						plane.material = libMat.Splat.Blood.flatten();
						//plane.customDepthMaterial = libMat.Splat.BloodDepth.flatten();
						plane.receiveShadow = true;
						plane.position.y = 3;
						mesh.add(plane);
					},
					onInteract : function( mesh, room, asset ){
						// Lootbag is local
						let stage = mesh.userData._stage;
						stage.playSound(mesh, 'media/audio/loot_bag.ogg', 0.5);
					},
					tags : [stdTag.mBag],
				}),
				Sarcophagus : new LibMesh({
					url : 'containers/sarcophagus_2x1.JD',
					materials : [
						libMat.Rock.Floor,
						libMat.Metal.Rust,
						libMat.Rock.FloorRunes,
					],
					want_actions : [[GameAction.types.loot,GameAction.types.autoLoot]],
					tags : [stdTag.mChest],


					
					animations : {
						open : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
						}
					},
					afterStagePlaced : function( dungeonAsset, mesh ){
						
						if( !dungeonAsset.isInteractive() ){
							mesh.userData.playAnimation("idle_opened");
						}

					},
				}),
			},
			Emitters : {
				WallSconce : new LibMesh({
					url : 'furniture/wall_sconce_1x1.JD',
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
						libMat.Candle.Wax,
						libMat.Candle.Wick,
					],
					tags : [stdTag.mEmitter, stdTag.mFire, stdTag.mCandle],
					onFlatten : function(mesh){
						let y = 200, z = -24;
						let light = new THREE.PointLight(0xFFDDAA, 0.5, 300, 2);
						light.position.y = y+10;
						light.position.z = z;
						mesh.add(light);

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*10-5,
										x:Math.random()*5-2.5,
										y:y+5+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						const y = 200, z = -24;
						let particles = libParticles.get('candleFlameLarge', mesh);
						particles.p.z = z;
						particles.p.y = y;
						mesh.userData.particles = [
							particles
						];
					}
				}),
				WallSconceFancy : new LibMesh({
					url : 'furniture/wall_sconce_fancy_1x1.JD',
					tags : [stdTag.mEmitter, stdTag.mFire, stdTag.mCandle],
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
						libMat.Candle.Wax,
						libMat.Candle.Wick,
					],
					onFlatten : function(mesh){
						let light = new THREE.SpotLight(0xFFDDAA, 0.5, 300, 1.3, 0.1);
						let z = -16, y = 198;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*10-5,
										x:Math.random()*5-2.5,
										y:10+y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						let particles = libParticles.get('candleFlameLarge', mesh);
						const z = -16, y = 198;
						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles = [
							particles
						];
					}
				}),
				TorchHolder : new LibMesh({
					url : 'furniture/torch_holder_1x1.JD',
					tags : [stdTag.mEmitter, stdTag.mFire, stdTag.mTorch],
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
					],
					onFlatten : function(mesh){
						let light = new THREE.PointLight(0xFFDDAA, 0.5, 1600, 2);
						let z = -13, y = 180;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*20-10,
										x:Math.random()*20-10,
										y:y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						const z = -13, y = 180;
						let particles = libParticles.get('torchFlame', mesh, true);
						particles.p.y = y;
						particles.p.z = z; 
						mesh.userData.particles = [particles];

						particles = libParticles.get('torchSmoke', mesh, true);
						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles.push(particles);

						particles = libParticles.get('torchEmbers', mesh, true);
						particles.p.y = y+5;
						particles.p.z = z;
						mesh.userData.particles.push(particles);
					},

				}),
				Firewood : new LibMesh({
					url : 'doodads/firewood.JD',
					materials : [
						libMat.Wood.Board,
						libMat.Wood.Firewood,
					],


					soundLoops : [
						{url:'media/audio/fireplace.ogg', volume:0.1}
					],
					onFlatten : function(mesh){
						let light = new THREE.PointLight(0xFFCC77, 0.5, 3000, 2);
						let z = 0, y = 30;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*20-10,
										x:Math.random()*20-10,
										y:y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						const z = 0, y = 30;
						let particles = libParticles.get('fireplaceFlame', mesh, true);
						particles.p.y = y;
						particles.p.z = z; 
						mesh.userData.particles = [particles];

						particles = libParticles.get('fireplaceSmoke', mesh, true);
						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles.push(particles);

						particles = libParticles.get('fireplaceEmbers', mesh, true);
						particles.p.y = y+5;
						particles.p.z = z;
						mesh.userData.particles.push(particles);
					}
				}),
				Firebarrel : new LibMesh({
					url : 'doodads/firebarrel.JD',
					tags : [stdTag.mEmitter, stdTag.mFire],
					materials : [
						libMat.Metal.Rust,
						libMat.Metal.DarkGeneric,
						libMat.Wood.Firewood,
						libMat.Decal.SmolderingAsh,
					],


					soundLoops : [
						{url:'media/audio/fireplace.ogg', volume:0.1}
					],
					onFlatten : function(mesh){

						let light = new THREE.PointLight(0xFFCC77, 0.5, 1000, 2);
						let z = 0, y = 30;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*5-2.5,
										x:Math.random()*5-2.5,
										y:y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*200)+50
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						const z = 0, y = 30;

						let particles = libParticles.get('firebarrelFlame', mesh, true);
						particles.p.y = y;
						particles.p.z = z; 
						mesh.userData.particles = [particles];

						particles = libParticles.get('fireplaceSmoke', mesh, true);
						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles.push(particles);

						particles = libParticles.get('firebarrelEmbers', mesh, true);
						particles.p.y = y+5;
						particles.p.z = z;
						mesh.userData.particles.push(particles);
					}
				}),
				Firepit : new LibMesh({
					url : 'nature/outdoor_firepit.JD',
					tags : [stdTag.mEmitter, stdTag.mFire],
					materials : [
						libMat.Wood.Firewood,
						libMat.Decal.SmolderingAsh,
						libMat.Rock.Floor
					],


					soundLoops : [
						{url:'media/audio/fireplace.ogg', volume:0.1}
					],
					onFlatten : function(mesh){
						let light = new THREE.PointLight(0xFFCC77, 0.5, 3000, 2);
						let z = -3, y = 20;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*20-10,
										x:Math.random()*20-10,
										y:y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						const z = -3, y = 20;

						let particles = libParticles.get('torchFlame', mesh);

						particles.p.y = y;
						particles.p.z = z; 
						mesh.userData.particles = [particles];

						particles = libParticles.get('torchSmoke', mesh);

						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles.push(particles);

						particles = libParticles.get('torchEmbers', mesh);

						particles.p.y = y+5;
						particles.p.z = z;
						mesh.userData.particles.push(particles);
					}
				}),
				Bonfire : new LibMesh({
					url : 'nature/outdoor_bonfire.JD',
					materials : [
						libMat.Wood.Firewood,
						libMat.Decal.SmolderingAsh,
					],
					tags : [stdTag.mEmitter, stdTag.mFire],


					soundLoops : [
						{url:'media/audio/fireplace.ogg', volume:0.1}
					],
					onFlatten : function(mesh){
						let light = new THREE.PointLight(0xFFCC77, 0.5, 3000, 2);
						let z = -2, y = 30;
						light.position.z = z;
						light.position.y = y+20;
						mesh.add(light);
						

						//let helper = new THREE.SpotLightHelper(light);
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										z:z+Math.random()*20-10,
										x:Math.random()*20-10,
										y:y+Math.random(10)-5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						
					},
					onStagePlaced : function(asset, mesh){
						let particles = libParticles.get('fireplaceFlame', mesh);
						const z = -2, y = 30;

						particles.p.y = y;
						particles.p.z = z; 
						mesh.userData.particles = [particles];

						particles = libParticles.get('fireplaceSmoke', mesh);

						particles.p.y = y;
						particles.p.z = z;
						mesh.userData.particles.push(particles);

						particles = libParticles.get('fireplaceEmbers', mesh);

						particles.p.y = y+5;
						particles.p.z = z;
						mesh.userData.particles.push(particles);
					}
				}),
			},
			Doodads : {
				Tankard : new LibMesh({
					url : 'doodads/tankard.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
					tags : [stdTag.mTankard],


				}),
				Bowl : new LibMesh({
					url : 'doodads/bowl.JD',
					tags : [stdTag.mBowl],
					materials : [
						libMat.Wood.Crate,
					],


				}),
				Papers : new LibMesh({
					url : 'doodads/papers.JD',
					tags : [stdTag.mPaper],
					materials : [
						libMat.Paper.Torn
					],


				}),
				PaperStack : new LibMesh({
					url : 'doodads/paperstack.JD',
					tags : [stdTag.mPaper],
					materials : [
						libMat.Paper.Torn
					],


				}),
				Candle : new LibMesh({
					url : 'doodads/candle.JD',
					tags : [stdTag.mCandle],
					materials : [
						libMat.Metal.Rust,
						libMat.Candle.Wax,
						libMat.Candle.Wick,
					],


				}),
				CandleLit : new LibMesh({
					url : 'doodads/candle.JD',
					tags : [stdTag.mFire, stdTag.mEmitter, stdTag.mCandle],
					materials : [
						libMat.Metal.Rust,
						libMat.Candle.Wax,
						libMat.Candle.Wick,
					],


					onFlatten : function(mesh){

						let light = new THREE.PointLight(0xFFDDAA, 0.5, 600, 2);
						light.position.y = 50;
						mesh.add(light);

						//let helper = new THREE.Mesh(new THREE.CubeGeometry(1,1,1,1,1,1),new THREE.MeshBasicMaterial(0xFFFFFF));
						//mesh.add(helper);
		
						mesh.userData.tweens = {
							// Setting a tween to a function lets you retrigger it infinitely or until stopped manually
							light : () => {
								return new TWEEN.Tween(light.position)
								.to(
									{
										x:Math.random()*5-2.5,
										z:Math.random()*5-2.5,
										y:50+Math.random(5)-2.5
									}, 
									Math.ceil(Math.random()*300)+100
								)
								//.onUpdate(() => {helper.position.set(light.position.x, light.position.y, light.position.z);})
								.easing(TWEEN.Easing.Sinusoidal.InOut)
								.start();
							}
						};

						

					},
					onStagePlaced : function(asset, mesh){
						let particles = libParticles.get('candleFlame', mesh, true);
						particles.p.y = 22;
						mesh.userData.particles = [
							particles
						];
					}
				}),
				BookClosed : new LibMesh({
					url : 'doodads/book_closed.JD',
					tags : [stdTag.mBook],
					materials : [
						libMat.Book.Closed,
						libMat.Paper.Torn,
					],


				}),
				BookOpen : new LibMesh({
					url : 'doodads/book_open.JD',
					tags : [stdTag.mBook],
					materials : [
						libMat.Book.Full,
						libMat.Paper.Torn,
					],


				}),
				BarBottles : new LibMesh({
					url : 'doodads/bar_bottles.JD',
					materials : [
						libMat.Wood.Cork,
						libMat.Glass.Green,
						libMat.Glass.Brown,
						libMat.Glass.Purple,
						libMat.Cloth.Rope
					],
					tags : [stdTag.mBottle],


				}),
				Firewood : new LibMesh({
					url : 'doodads/firewood.JD',
					materials : [
						libMat.Wood.Board,
						libMat.Wood.Firewood,
					],


				}),
				BannerAnimated : new LibMesh({
					url : 'doodads/banner_animated.JD',
					materials : [
						libMat.Cloth.Banner.RaggedHand
					],
					tags : [stdTag.mBanner],
				}),
				Planks : new LibMesh({
					url : 'doodads/planks.JD',
					materials : [
						libMat.Wood.Crate
					],
				}),
				UpsideDownBucket : new LibMesh({
					url : 'doodads/upside_down_bucket.JD',
					tags : [stdTag.mBucket],
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.Rust,
					],
				}),
				FishingRod : new LibMesh({
					auto_bounding_box : true,
					url : 'doodads/fishing_rod.JD',
					tags : [],
					materials : [
						libMat.Wood.Crate,
						libMat.Wood.Cork,
						libMat.Metal.Rust,
						libMat.Cloth.Thick,
						libMat.Cloth.Dark,
					],
				}),
				Gong : new LibMesh({
					url : 'doodads/gong.JD',
					tags : [],
					materials : [
						libMat.Wood.Crate,
						libMat.Cloth.Rope,
						libMat.Metal.Copper
					],
				}),
				Bucket : new LibMesh({
					url : 'doodads/bucket_standing.JD',
					tags : [stdTag.mBucket],
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
				}),
				BucketHanging : new LibMesh({
					url : 'doodads/bucket_hanging.JD',
					tags : [stdTag.mBucket],
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
				}),
				
			},
			Furniture : {
				Bookshelf : new LibMesh({
					url : 'furniture/bookshelf.glb',
					materials : [
						libMat.Wood.Crate
					],
					tags : [stdTag.mShelf],
				}),
				BookshelfBooksBottom : new LibMesh({
					url : 'furniture/bookshelf_books_bottom.glb',
					materials : [
						libMat.Wood.Crate,
						libMat.Book.Full,
					],
					tags : [stdTag.mShelf, stdTag.mBook],
				}),
				BookshelfFull : new LibMesh({
					url : 'furniture/bookshelf_stacked.glb',
					materials : [
						libMat.Wood.Crate,
						libMat.Book.Full,
					],
					tags : [stdTag.mShelf, stdTag.mBook],
				}),
			},
			
			Signs : {
				Store : new LibMesh({
					url : 'doodads/store_sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Sign.Store
					],
					tags : [],
				}),
				Blacksmith : new LibMesh({
					url : 'doodads/store_sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Sign.Blacksmith
					],
					tags : [],
				}),
				Dojo : new LibMesh({
					url : 'doodads/store_sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Sign.Dojo
					],
					tags : [],
				}),
				Port : new LibMesh({
					url : 'doodads/store_sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Sign.Port
					],
					tags : [],
				}),
				Tavern : new LibMesh({
					url : 'doodads/store_sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Sign.Tavern
					],
					tags : [],
				}),
				BountyBoard : new LibMesh({
					url : 'furniture/bountyboard.JD',
					materials : [
						libMat.Wood.Cork,
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
						libMat.Paper.Torn
					],
					tags : [],
				}),
				Warning : new LibMesh({
					url : 'doodads/sign.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.Rust,
						libMat.Sign.Warning
					],
					tags : [],
				}),
				Cartographers : new LibMesh({
					url : 'doodads/cum_sign.JD',
					materials : [
						libMat.Marble.Tiles,
						libMat.Metal.Copper,
					],
					tags : [],
				}),
			},
			Shapes : {
				DirArrow : new LibMesh({
					auto_bounding_box : true,
					url : 'gates/dir_arrows.JD',
					want_actions : [gameActionDoors],

					materials : [
						libMat.Solids.GreenArrow
					],
					door : LibMesh.DoorTypes.DOOR_AUTO_XY,
					doorRotOffs : Math.PI/2
				}),
				WiggleTest : new LibMesh({
					url : 'tests/wiggletest.glb',
					materials : [
						libMat.Wood.Crate,
					],
					tags : [],
				}),
				WiggleTestJD : new LibMesh({
					url : 'special/wiggletest.JD',
					materials : [
						libMat.Wood.Crate,
					],
					tags : [],
				}),
			},
			// This is an NPC marker. Note that these are dummies and only visible in the editor. WebGL.js handles the actual rendering of them
			Marker : {
				Player : new LibMesh({
					auto_bounding_box : true,
					url : 'special/avatarMarker.JD',
					materials : [
						libMat.Solids.GreenArrow,
						libMat.Metal.DarkGeneric,
						libMat.Solids.GreenArrow,
					],
					tags : [stdTag.mPLAYER_MARKER],
					onStagePlaced : function(asset, mesh){
						if( window.game )
							mesh.visible = false;
					}
				}),
				Treasure : new LibMesh({
					auto_bounding_box : true,
					url : 'containers/chest_1x1.JD',
					materials : [
						libMat.Solids.GreenArrow,
						libMat.Solids.GreenArrow,
					],
					tags : [stdTag.mTREASURE_MARKER],
				}),
			},
			
		},
		Decals : {
			BloodSplat : new LibMesh({
				auto_bounding_box : true,
				url : function(){
					let group = new THREE.Group();
					let plane = new THREE.Mesh(
						new THREE.PlaneGeometry(100,100,1,1),
						new THREE.MeshBasicMaterial()
					);
					plane.rotation.set(Math.PI/2, 0, 0);
					plane.material = libMat.Splat.Blood.flatten();
					//plane.customDepthMaterial = libMat.Splat.BloodDepth.flatten();
					plane.receiveShadow = true;
					plane.position.y = 5;
					group.add(plane);
					return group;
				},
				tags : [],
			}),
			BloodSplatBlack : new LibMesh({
				auto_bounding_box : true,
				url : function(){
					let group = new THREE.Group();
					let plane = new THREE.Mesh(
						new THREE.PlaneGeometry(100,100,1,1),
						new THREE.MeshBasicMaterial()
					);
					plane.rotation.set(Math.PI/2, 0, 0);
					plane.material = libMat.Splat.Black.flatten();
					//plane.customDepthMaterial = libMat.Splat.BloodDepth.flatten();
					plane.receiveShadow = true;
					plane.position.y = 5;
					group.add(plane);
					return group;
				},
				tags : [],
			}),
			RuneCirclePurple : new LibMesh({
				auto_bounding_box : true,
				url : function(){
					let group = new THREE.Group();
					let plane = new THREE.Mesh(
						new THREE.PlaneGeometry(100,100,1,1),
						new THREE.MeshBasicMaterial()
					);
					plane.rotation.set(-Math.PI/2, 0, 0);
					plane.material = libMat.Decal.RuneCirclePurple.flatten();
					//plane.customDepthMaterial = libMat.Splat.BloodDepth.flatten();
					plane.receiveShadow = false;
					plane.position.y = 5;
					group.add(plane);
					return group;
				},
				tags : [],
				onStagePlaced : function(asset, mesh){
					let particles = libParticles.get('runeSparkles', mesh);
					const z = 0, y = 0;
					particles.p.y = y;
					particles.p.z = z; 
					mesh.userData.particles = [particles];
				}
			}),
		},
		// Outdoors
		Land : {
			Yuug : {
				
				WorldMap : {
					Yuug : new LibMesh({
						isRoom : true,
						url : 'land/yuug/yuug_land.JD',
						materials : [
							libMat.Land.Yuug
						],
						attachments : [
							new LibMeshAttachment({path:"Land.Yuug.Ocean"})
						]
					}),
					Ocean : new LibMesh({
						url : 'land/yuug/yuug_water.JD',
						materials : [
							libMat.Water.Ocean
						],
						tags : [stdTag.mWater],
						onStagePlaced(_,mesh){
							mesh.rotation.x = -Math.PI/2;
						}
					}),
					Ocean2 : new LibMesh({
						url : function(){
							const loader = new THREE.TextureLoader();
							const waterGeometry = new THREE.BoxBufferGeometry( 1000, 1000, 100 );
							const water = new Water2( waterGeometry, {
								color: 0xFFAAAA,
								scale: 1,
								clipBias : 0.5,
								flowDirection: new THREE.Vector2( 1, 1 ),
								textureWidth: 1024,
								textureHeight: 1024,
								normalMap0 : loader.load('media/textures/land/waternormals_small.jpg'),
								normalMap1 : loader.load('media/textures/land/waternormals_small.jpg'),
							}); 
							water.rotation.x = -Math.PI/2;
							water.position.y = 100;
							const mat = new THREE.MeshBasicMaterial();
							mat.visible = false;
							const group = new THREE.Mesh(new THREE.BoxGeometry(1000,100,1000), mat);
							group.add(water);
							return group;
						},
						tags : [stdTag.mWater],
					}),
					Ocean_Room : new LibMesh({
						isRoom : true,
						url : 'land/yuug/yuug_water.JD',
						materials : [
							libMat.Water.Ocean
						],
						tags : [stdTag.mWater],
						onStagePlaced(_,mesh){
							mesh.rotation.x = -Math.PI/2;
						}
					}),

					Capital : new LibMesh({
						url : 'land/yuug/yuug_city.JD',
						materials : [
							libMat.Brick.Small,
							libMat.StoneTile.DungeonWall,
							libMat.Wood.Crate,
							libMat.StoneTile.BigBlocks,
							libMat.Metal.DarkGeneric,
							libMat.Wood.Logs,
							libMat.Structure.CottageWall,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Structure.CottageRoof,
							libMat.Structure.StrawRoof,
							libMat.Solids.Invisible,

						],
					}),
					Cottaga : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_cottaga.JD',
						materials : [
							libMat.Wood.Logs,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Structure.CottageRoof,
							libMat.Structure.StrawRoof,
						],
					}),
					MidwayFarm : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_midway_farm.JD',
						materials : [
							libMat.Wood.Logs,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Structure.CottageRoof,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
						],
					}),
					Wallburg : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_wallburg.JD',
						materials : [
							libMat.Structure.CottageRoof,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Wood.Logs,
							libMat.Structure.StrawRoof,
							libMat.StoneTile.DungeonWall,
							
						],
					}),
					WallwayFarm : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_wallway_farm.JD',
						materials : [
							libMat.Wood.Logs,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,					
						],
					}),
					Eaststead : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_eaststead.JD',
						materials : [
							libMat.Structure.CottageRoof,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenC,
							libMat.Wood.Logs,	
							libMat.Structure.StrawRoof,

						],
					}),
					EastwoodFarm : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_eastwood_farm.JD',
						materials : [
							libMat.Wood.Logs,				
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
						],
					}),
					Eastwood : new LibMesh({
						
						url : 'land/yuug/yuug_eastwood.JD',
						materials : [
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Solids.GreenB,
							libMat.Solids.GreenC,
							libMat.Solids.Invisible,
						],
					}),
					Seawatch : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_seawatch.JD',
						materials : [
							libMat.Structure.CottageRoof,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Wood.Logs,
							libMat.Structure.StrawRoof,
							libMat.StoneTile.DungeonWall,
							libMat.Solids.YellowGlow,
						],
					}),
					Southwood : new LibMesh({
						
						url : 'land/yuug/yuug_southwood.JD',
						materials : [
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Solids.GreenB,
							libMat.Solids.GreenC,
							libMat.Solids.Invisible,

						],
					}),
					AbandonedCottage : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_abandoned_cottage.JD',
						materials : [
							libMat.Structure.StrawRoof,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenC,
						],
					}),
					WestwallFarm : new LibMesh({
						auto_bounding_box : true,
						
						url : 'land/yuug/yuug_westwall_farm.JD',
						materials : [
							libMat.Structure.StrawRoof,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Solids.Brown,
							libMat.Solids.GreenC,
						],
					}),
					Westwood : new LibMesh({
						
						url : 'land/yuug/yuug_westwood.JD',
						materials : [
							libMat.Solids.Brown,
							libMat.Solids.GreenA,
							libMat.Solids.GreenB,
							libMat.Solids.GreenC,
							libMat.Solids.Invisible,

						],
					}),
					OutdoorPort : new LibMesh({
						
						url : 'land/yuug/yuug_port.JD',
						materials : [
							libMat.Wood.Logs,
							libMat.Structure.CottageWall,
							libMat.Wood.Crate,
							libMat.Brick.Small,
							libMat.Structure.StrawRoof,
							libMat.Structure.CottageRoof,
							libMat.StoneTile.DungeonWall,
							libMat.Solids.Brown,
							libMat.Solids.GreenB,
							libMat.Solids.Invisible,
						],
					}),

				
					Wall : new LibMesh({
						
						url : 'land/yuug/yuug_wall.JD',
						materials : [
							libMat.Brick.Small,
							libMat.StoneTile.DungeonWall,
							libMat.Wood.Crate,
						],
						
					}),
				},

				Beach : {
					A : new LibMesh({
						url : 'land/yuug/beach_a.JD',
						materials : [
							libMat.Land.BeachA
						],
						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
					B : new LibMesh({
						url : 'land/yuug/beach_b.JD',
						materials : [
							libMat.Land.BeachB
						],
						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
					C : new LibMesh({
						url : 'land/yuug/beach_c.JD',
						materials : [
							libMat.Land.BeachC
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
					D : new LibMesh({
						url : 'land/yuug/beach_d.JD',
						materials : [
							libMat.Land.BeachD
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
					E : new LibMesh({
						url : 'land/yuug/beach_e.JD',
						materials : [
							libMat.Land.BeachE
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
					F : new LibMesh({
						url : 'land/yuug/beach_f.JD',
						materials : [
							libMat.Land.BeachF
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mSand],

					}),
				},
				
				Woods : {
					mainroadA : new LibMesh({
						url : 'land/yuug/woods_mainroad_1.JD',
						materials : [
							libMat.Land.MainroadA
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mDirt],

					}),
					mainroadB : new LibMesh({
						url : 'land/yuug/woods_mainroad_2.JD',
						materials : [
							libMat.Land.MainroadB
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mDirt],

					}),
					mainroadC : new LibMesh({
						url : 'land/yuug/woods_mainroad_3.JD',
						materials : [
							libMat.Land.MainroadC
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mDirt],

					}),
					mainroadD : new LibMesh({
						url : 'land/yuug/woods_mainroad_4.JD',
						materials : [
							libMat.Land.MainroadD
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mDirt],

					}),
					mainroadE : new LibMesh({
						url : 'land/yuug/woods_mainroad_5.JD',
						materials : [
							libMat.Land.MainroadE
						],


						isRoom : true,
						tags : [stdTag.mGrass, stdTag.mDirt],

					}),

					grassgen000 : new LibMesh({
						url : 'land/yuug/GrassGen_000.JD',
						materials : [libMat.Land.GrassGen_000],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					grassgen001 : new LibMesh({
						url : 'land/yuug/GrassGen_001.JD',
						materials : [libMat.Land.GrassGen_001],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					grassgen002 : new LibMesh({
						url : 'land/yuug/GrassGen_002.JD',
						materials : [libMat.Land.GrassGen_002],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					grassgen003 : new LibMesh({
						url : 'land/yuug/GrassGen_003.JD',
						materials : [libMat.Land.GrassGen_003],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					grassgen004 : new LibMesh({
						url : 'land/yuug/GrassGen_004.JD',
						materials : [libMat.Land.GrassGen_004],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					grassgen005 : new LibMesh({
						url : 'land/yuug/GrassGen_005.JD',
						materials : [libMat.Land.GrassGen_005],
						tags : [stdTag.mGrass],
						isRoom: true,
					}),
					
				},

				Port : {
					LandMid : new LibMesh({
						url : 'land/yuug/yuug_port_mid_land.JD',
						materials : [
							libMat.Land.YuugPortMid,
						],


						isRoom : true,

						tags : [stdTag.mGrass, stdTag.mSand],
					}),
					JettyMid : new LibMesh({
						url : 'land/yuug/yuug_port_mid_dock.JD',
						materials : [
							libMat.Wood.Logs,
							libMat.Wood.Crate
						],
					}),
				},
				

			},
			Beach : {
				SmallJetty : new LibMesh({
					url : 'structure/small_jetty.JD',
					materials : [
						libMat.Wood.Crate
					],
				}),
				SmallJetty2 : new LibMesh({
					url : 'structure/jetty2.JD',
					materials : [
						libMat.Wood.Crate
					],
				}),
				Clutter : new LibMesh({
					url : 'nature/beach_clutter.JD',
					materials : [
						libMat.Nature.Seashell,
						libMat.Nature.Starfish,
					],
					tags : [stdTag.mSeashell, stdTag.mStarfish],
				}),
				Oar : new LibMesh({
					url : 'doodads/oar.JD',
					tags : [stdTag.mOar],
					materials : [libMat.Wood.Crate],
				}),
				Rowboat : new LibMesh({
					url : 'doodads/rowboat.JD',
					materials : [libMat.Wood.Crate,libMat.Metal.Rust],
					tags : [stdTag.mOar],
				}),
			},
			Generic : {
				FenceA : new LibMesh({
					url : 'structure/fence_a.JD',
					materials : [libMat.Wood.Crate,],
					tags : [stdTag.mFence], 
				}),
				FenceB : new LibMesh({
					url : 'structure/fence_b.JD',
					materials : [libMat.Wood.Crate,],
					
					tags : [stdTag.mFence],
				}),
				Well : new LibMesh({
					url : 'doodads/well.JD',
					materials : [
						libMat.Brick.Small,
						libMat.Wood.Crate,
						libMat.Metal.Rust,
						libMat.Cloth.Rope
					],
					door : LibMesh.DoorTypes.DOOR_DOWN,
				}),
			},
			City : {
				X : new LibMesh({
					url : 'land/yuug/town_x.JD',
					materials : [
						libMat.Land.TownX
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mSand],

				}),
				T : new LibMesh({
					url : 'land/yuug/town_t.JD',
					materials : [
						libMat.Land.TownT
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mSand],

				}),
				Straight : new LibMesh({
					url : 'land/yuug/town_straight.JD',
					materials : [
						libMat.Land.TownStraight
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mSand],

				}),
				Bend : new LibMesh({
					url : 'land/yuug/town_bend.JD',
					materials : [
						libMat.Land.TownBend
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mSand],

				}),
			},
			Swamp : {
				A : new LibMesh({
					url : 'land/swamp/bog_ground_a.JD',
					materials : [
						libMat.Land.SwampA
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mMoss, stdTag.mSwamp],

				}),
				B : new LibMesh({
					url : 'land/swamp/bog_ground_b.JD',
					materials : [
						libMat.Land.SwampB
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mMoss, stdTag.mSwamp],

				}),
				C : new LibMesh({
					url : 'land/swamp/bog_ground_c.JD',
					materials : [
						libMat.Land.SwampC
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mMoss, stdTag.mSwamp],

				}),
				D : new LibMesh({
					url : 'land/swamp/bog_ground_d.JD',
					materials : [
						libMat.Land.SwampD
					],


					isRoom : true,
					tags : [stdTag.mGrass, stdTag.mMoss, stdTag.mSwamp],

				}),
				Water : new LibMesh({
					url : function(){
						const loader = new THREE.TextureLoader();
						const waterGeometry = new THREE.BoxBufferGeometry( 1000, 1000, 100 );
						const water = new Water2( waterGeometry, {
							color: 0x88AA88,
							scale: 1,
							flowDirection: new THREE.Vector2( 0.1, .1 ),
							textureWidth: 1024,
							textureHeight: 1024,
							reflectivity : 0.01,
							clipBias : 1,
							normalMap0 : loader.load('media/textures/land/waternormals_small.jpg'),
							normalMap1 : loader.load('media/textures/land/waternormals_small.jpg'),
						}); 
						water.rotation.x = -Math.PI/2;
						water.position.y = 100;
						const mat = new THREE.MeshBasicMaterial();
						mat.visible = false;
						const group = new THREE.Mesh(new THREE.BoxGeometry(1000,100,1000), mat);
						group.add(water);
						return group;
					},


					tags : [stdTag.mWater],

				}),
			},
		},

		Cave : {
			Room : {
				R10x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/cave_10x6.JD',
					materials : [
						libMat.Rock.Floor,
						libMat.Rock.Wall,
					],
					tags : [stdTag.mWall],



				}),
				R10x8 : new LibMesh({
					isRoom : true,
					url : 'rooms/cave_10x8.JD',
					materials : [
						libMat.Rock.Floor,
						libMat.Rock.Wall,
					],
					tags : [stdTag.mWall],

				}),
				R6x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/cave_6x6.JD',
					materials : [
						libMat.Rock.Floor,
						libMat.Rock.Wall,
					],
					tags : [stdTag.mWall],



				}),
				R8x6River : new LibMesh({
					url : 'rooms/cave_8x6_river.JD',
					materials : [
						libMat.Water.River
					],
				}),
				R8x6 : new LibMesh({
					isRoom : true,
					url : 'rooms/cave_8x6.JD',
					materials : [
						libMat.Rock.Floor,
						libMat.Rock.Wall,
					],
					attachments : [
						// Needs to be rotated -90 degrees for water to work
						new LibMeshAttachment({path:"Cave.Room.R8x6River", always:true, rotation:new THREE.Vector3(-Math.PI/2,0,0), position:new THREE.Vector3(0,65,-90)}),
					],
					tags : [stdTag.mWall],



				}),
			},
			Stalagmite : new LibMesh({
				url : 'nature/stalag.JD',
				tags : [stdTag.mStalagmite],
				materials : [
					libMat.Rock.Floor
				],
			}),
			Boulder : {
				Large : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/boulder_large.JD',
					materials : [
						libMat.Rock.Wall
					],
				}),
				Double : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/boulder_double.JD',
					materials : [
						libMat.Rock.Wall
					],
				}),
				Knotty : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/boulder_knotty.JD',
					materials : [
						libMat.Rock.Wall
					],
				}),
				Med : new LibMesh({
					url : 'nature/boulder_med.JD',
					tags : [stdTag.mBoulder],
					materials : [
						libMat.Rock.Wall
					],
				}),
			},
			Furniture : {
				RockBench : new LibMesh({
					url : 'furniture/bench_105_05.JD',
					materials : [
						libMat.StoneTile.DungeonFloor,
						libMat.Metal.DarkGeneric,
					],
					tags : [stdTag.mBench],


					
				}),
			},
			Door : {
				CaveDoor : new LibMesh({
					url : 'gates/cave_door.JD',
					want_actions : [gameActionDoors],
					materials : [
						libMat.Rock.Wall,
						libMat.Solids.Black,
						libMat.Wood.Crate,
					],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
					onInteract : function( mesh, room, asset ){
						LibMesh.playSound( mesh, asset, 'media/audio/dungeon_door.ogg', 0.5);
					},
					tags : [stdTag.mDoor],
					door : LibMesh.DoorTypes.DOOR_AUTO_XY,
				}),
				
			}
		},

		Consumable : {
			PotLargeHP : new LibMesh({
				url : 'doodads/pot_large.JD',
				materials : [
					libMat.Glass.RedGlow,
					libMat.Metal.Gold,
				],
			}),
			PotLargeMP : new LibMesh({
				url : 'doodads/pot_large.JD',
				materials : [
					libMat.Glass.BlueGlow,
					libMat.Metal.Silver,
				],
			}),
			PotMedHP : new LibMesh({
				url : 'doodads/pot_med.JD',
				materials : [
					libMat.Glass.RedGlow,
					libMat.Metal.Gold,
				],
			}),
			PotMedMP : new LibMesh({
				url : 'doodads/pot_med.JD',
				materials : [
					libMat.Glass.BlueGlow,
					libMat.Metal.Silver,
				],
			}),
			SewerWaterJug : new LibMesh({
				url : 'doodads/rusty_pitcher.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Wood.Crate,
				],
			}),
			BeerBottle : new LibMesh({
				url : 'doodads/beer_bottle.JD',
				materials : [
					libMat.Glass.Brown,
					libMat.Metal.Silver,
				],
			}),
		},
		

		Structure : {
			Cottage : new LibMesh({
				url : 'structure/cottage.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			CottageLong : new LibMesh({
				url : 'structure/cottage_long.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			CottageBent : new LibMesh({
				url : 'structure/cottage_bent.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			CottageSquared : new LibMesh({
				url : 'structure/cottage_squared.JD',
				materials : [
					libMat.Structure.CottageRoof,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			CottageThatched : new LibMesh({
				url : 'structure/cottage_thatched.JD',
				materials : [
					libMat.Structure.StrawRoof,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			Cottage2StoryA : new LibMesh({
				url : 'structure/cottage_2story_a.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			Cottage2StoryB : new LibMesh({
				url : 'structure/cottage_2story_b.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			CabinDerelict : new LibMesh({
				url : 'structure/cabin_derelict.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Wood.Old,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),

			Gym : new LibMesh({
				url : 'structure/gym.JD',
				materials : [
					libMat.Structure.CottageRoof,
					libMat.Structure.CottageWall2,
					libMat.Wood.Crate,
					libMat.Wood.Crate,
					libMat.StoneTile.ChurchFloor2,
				],
			}),

			Bank : new LibMesh({
				url : 'structure/bank.JD',
				materials : [
					libMat.StoneTile.ChurchFloor2,
					libMat.Rock.Wall,
					libMat.Wood.Crate,
					libMat.Brick.DungeonBlack,
					libMat.Wood.Crate,
					libMat.Glass.Brown
				],
			}),

			Church : new LibMesh({
				url : 'structure/church.JD',
				materials : [
					libMat.StoneTile.ChurchWall,
					libMat.StoneTile.StoneWall,
					libMat.Wood.Crate,
					libMat.Brick.DungeonBlack,
					libMat.Wood.Crate,
					libMat.Glass.Brown
				],
			}),

			Inn : new LibMesh({
				url : 'structure/inn.JD',
				materials : [
					libMat.Structure.CottageRoof,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),
			InnLarge : new LibMesh({
				url : 'structure/inn_big.JD',
				materials : [
					libMat.Structure.CottageRoof,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),

			InnLarge : new LibMesh({
				url : 'structure/inn_big.JD',
				materials : [
					libMat.Structure.CottageRoof,
					libMat.Structure.CottageWall,
					libMat.Wood.Crate,
					libMat.Brick.Small,
				],
			}),

			WatchTowerWood : new LibMesh({
				url : 'structure/wood_tower.JD',
				materials : [
					libMat.Wood.Logs,
					libMat.Metal.DarkGeneric,
				],
			}),
			WatchTowerLarge : new LibMesh({
				url : 'structure/big_tower.JD',
				materials : [
					libMat.Brick.Small,
					libMat.StoneTile.DungeonWall,
					libMat.Wood.Board,
				],
			}),
			WatchTowerSmall : new LibMesh({
				url : 'structure/closed_tower.JD',
				materials : [
					libMat.Brick.Small,
					libMat.StoneTile.DungeonWall,
				],
			}),

			Tents : {
				Small : new LibMesh({
					url : 'structure/tent_small.JD',
					materials : [libMat.Wood.Crate,libMat.Cloth.DarkDoublesided],
					tags : [stdTag.mTent], 
				}),
				Large : new LibMesh({
					url : 'structure/tent_large.JD',
					materials : [libMat.Cloth.DarkDoublesided,libMat.Wood.Crate],
					tags : [stdTag.mTent], 
				}),
				Open : new LibMesh({
					url : 'doodads/tent_open.JD',
					materials : [libMat.Wood.Crate,libMat.Cloth.DarkDoublesided],
					tags : [stdTag.mTent],
				}),
			},

			FortWall : {
				Wall : new LibMesh({
					url : 'structure/fort_wall.JD',
					materials : [
						libMat.Brick.Small,
						libMat.Brick.DungeonBlack,
					],
				}),
				Door : new LibMesh({
					url : 'structure/fort_wall_door.JD',
					materials : [
						libMat.Brick.Small,
						libMat.Brick.DungeonBlack,
					],
				}),
				Tower : new LibMesh({
					url : 'structure/fort_wall_tower.JD',
					materials : [
						libMat.Brick.Small,
						libMat.Brick.DungeonBlack,
					],
				}),
				DoorAnimated : new LibMesh({
					auto_bounding_box : true,
					url : 'structure/fort_wall_door_animated.JD',
					materials : [
						libMat.Wood.Crate,
						libMat.Metal.DarkGeneric,
					],
					animations : {
						"open" : {
							clampWhenFinished : true,
							loop : THREE.LoopOnce,
							timeScale : 2
						}
					},
				}),
			},

			Townstand : new LibMesh({
				url : 'structure/townstand_5x2.JD',
				materials : [
					libMat.Wood.Crate,
				],
			}),

		},

		Room : {

			CabinDerelict : new LibMesh({
				isRoom : true,
				url : 'rooms/cottage_interior_derelict.JD',
				materials : [
					libMat.Structure.CottageWall,
					libMat.Wood.Old,
					libMat.Wood.Crate,
				],
				tags : [stdTag.mWall],



			}),

			Gym : new LibMesh({
				isRoom : true,
				url : 'rooms/gym_interior.JD',
				materials : [
					libMat.StoneTile.ChurchFloor2,
					libMat.Structure.CottageWall2,
				],
				tags : [stdTag.mWall],



			}),

			Bank : new LibMesh({
				isRoom : true,
				url : 'rooms/bank_interior.JD',
				materials : [
					libMat.StoneTile.ChurchFloor2,
					libMat.Rock.Wall,
				],
				tags : [stdTag.mWall],



			}),

			Church : new LibMesh({
				isRoom : true,
				url : 'rooms/church_interior.JD',
				materials : [
					libMat.StoneTile.ChurchWall,
					libMat.StoneTile.StoneWall,
					libMat.StoneTile.ChurchFloor,
				],
				tags : [stdTag.mWall],



			}),


			ChurchSide : new LibMesh({



				isRoom : true,
				url : 'rooms/church_side_room.JD',
				materials : [
					libMat.StoneTile.ChurchWall,
					libMat.StoneTile.StoneWall,
					libMat.StoneTile.ChurchFloor,
				],
				tags : [stdTag.mWall],
			}),

			Sewer : {
				bend_6x6 : new LibMesh({

	

					isRoom : true,
					url : 'rooms/sewer_bend_6x6.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
				double_5x8 : new LibMesh({
					isRoom : true,
					url : 'rooms/sewer_double_5x8.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
				x_8x8 : new LibMesh({
	
					isRoom : true,
					url : 'rooms/sewer_x_8x8.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
				bend_8x8 : new LibMesh({
	
					isRoom : true,
					url : 'rooms/sewer_bend_8x8.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
				narrow_3x8 : new LibMesh({

					isRoom : true,
					url : 'rooms/sewer_narrow_3x8.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
				chamber_8x8 : new LibMesh({

					isRoom : true,
					url : 'rooms/sewer_chamber_8x8.JD',
					materials : [
						libMat.Brick.DungeonBlack,
						libMat.Brick.Small,
						libMat.Brick.Small,
					],
					tags : [stdTag.mWall],
				}),
			},

		},

		Door : {

			GenericDouble : new LibMesh({
				url : 'gates/doubledoor_generic.JD',
					want_actions : [gameActionDoors],
					materials : [
					libMat.Wood.Floor2,
					libMat.Wood.Reinforced,
					libMat.Metal.DarkGeneric,
				],
				animations : {
					"open" : {
						clampWhenFinished : true,
						loop : THREE.LoopOnce,
						timeScale : 2
					}
				},
				onInteract : function( mesh, room, asset ){
					LibMesh.playSound( mesh, asset, 'media/audio/castle_door.ogg', 0.75);
				},
				tags : [stdTag.mDoor],
				door : LibMesh.DoorTypes.DOOR_AUTO_XY,
			}),

			Generic : new LibMesh({
				url : 'gates/generic_door.JD',
				want_actions : [gameActionDoors],
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
				],
				animations : {
					"open" : {
						clampWhenFinished : true,
						loop : THREE.LoopOnce,
						timeScale : 2
					}
				},
				onInteract : function( mesh, room, asset ){
					LibMesh.playSound( mesh, asset, 'media/audio/trapdoor.ogg', 0.5);
				},
				tags : [stdTag.mDoor],
				door : LibMesh.DoorTypes.DOOR_AUTO_XY,
			}),

			Manhole : new LibMesh({
				url : 'gates/manhole.JD',
				want_actions : [gameActionDoors],
				materials : [
					libMat.Brick.Tile,
					libMat.Metal.DarkGeneric,
					libMat.Wood.Crate,
					libMat.Solids.Black
				],
				animations : {
					"open" : {
						clampWhenFinished : true,
						loop : THREE.LoopOnce,
					}
				},
				onInteract : function( mesh, room, asset ){
					// Todo: better sound
					LibMesh.playSound( mesh, asset, 'media/audio/trapdoor.ogg', 0.5);
				},
				tags : [stdTag.mTrapdoor],
				door : LibMesh.DoorTypes.DOOR_DOWN,
			}),

		},

		Nature : {
			Trees : {
				RoundA : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/tree_a.JD',
					materials : [
						libMat.Solids.Brown,
						libMat.Solids.GreenA,
					],
				}),
				RoundB : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/tree_b.JD',
					materials : [
						libMat.Solids.Brown,
						libMat.Solids.GreenB,
					],
				}),
				RoundC : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/tree_c.JD',
					materials : [
						libMat.Solids.Brown,
						libMat.Solids.GreenC,
					],
				}),
				Simple : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/tree_simple.JD',
					materials : [
						libMat.Nature.BushTop,
						libMat.Wood.Bark
					],
				}),
				Leafy : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/leafytree.JD',
					materials : [
						libMat.Wood.Bark,
						libMat.Nature.Bush,
					],
				}),
				Thin : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/leafytree.JD',
					materials : [
						libMat.Wood.Bark,
						libMat.Nature.TreeB,
					],
				}),
				Flowery : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/leafytree.JD',
					materials : [
						libMat.Wood.Bark,
						libMat.Nature.TreeA,
					],
				}),
				Smallball : new LibMesh({
					tags : [stdTag.mTree],
					url : 'nature/leafytree.JD',
					materials : [
						libMat.Wood.Bark,
						libMat.Nature.BushA,
					],
				}),
				Stump : new LibMesh({
					tags : [stdTag.mTreeStump],
					url : 'nature/tree_stump.JD',
					materials : [libMat.Wood.Bark,libMat.Wood.Stump],
				}),
				Dead : new LibMesh({
					tags : [stdTag.mTreeStump],
					url : 'nature/tree_dead.JD',
					materials : [libMat.Wood.Bark],
				}),
				Bog : new LibMesh({
					tags : [stdTag.mTree, stdTag.mVines],
					url : 'nature/bogtree.JD',
					materials : [libMat.Wood.BarkMoss, libMat.Nature.TreeVines, libMat.Nature.Bogtree],
				}),
			},
			Clutter : {
				Stones : new LibMesh({
					url : 'nature/rocks_clutter.JD',
					tags : [stdTag.mStone],
					materials : [
						libMat.Rock.Wall
					],
				}),
			},
			Rocks : {
				A : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/moss_rock_a.JD',
					materials : [
						libMat.Rock.Moss
					],
				}),
				B : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/moss_rock_b.JD',
					materials : [
						libMat.Rock.Moss
					],
				}),
				C : new LibMesh({
					tags : [stdTag.mBoulder],
					url : 'nature/moss_rock_c.JD',
					materials : [
						libMat.Rock.Moss
					],
				}),
				D : new LibMesh({
					url : 'nature/moss_rock_d.JD',
					tags : [stdTag.mBoulder],
					materials : [
						libMat.Rock.Moss
					],
				}),
			},
			Foliage : {
				GrassTuft : new LibMesh({
					tags : [stdTag.mGrassLong],
					url : 'nature/grass_tuft.JD',
					materials : [
						libMat.Nature.Grass
					],
				}),
				GrassBundle : new LibMesh({
					tags : [stdTag.mGrassLong],
					url : 'nature/tall_grass.JD',
					materials : [
						libMat.Nature.Grass
					],
				}),
				GrassWideSingle : new LibMesh({
					tags : [stdTag.mGrassLong],
					url : 'nature/grass_wide_single.JD',
					materials : [
						libMat.Nature.Grass
					],
				}),
				GrassWideGroup : new LibMesh({
					tags : [stdTag.mGrassLong],
					url : 'nature/grass_wide_group.JD',
					materials : [
						libMat.Nature.Grass
					],
				}),
				BushBalls : new LibMesh({
					tags : [stdTag.mBush],
					url : 'nature/grass_wide_group.JD',
					materials : [libMat.Nature.BushA],
				}),
				BushBall : new LibMesh({
					tags : [stdTag.mBush],
					url : 'nature/grass_wide_single.JD',
					materials : [libMat.Nature.BushA],
				}),
				FlowersPink : new LibMesh({
					tags : [stdTag.mGrassLong, stdTag.mFlower],
					url : 'nature/grass_wide_single.JD',
					materials : [libMat.Nature.FlowersA],
				}),
				FlowersYellowGroup : new LibMesh({
					tags : [stdTag.mGrassLong, stdTag.mFlower],
					url : 'nature/grass_wide_group.JD',
					materials : [libMat.Nature.FlowersB],
				}),
				FlowersYellow : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong, stdTag.mFlower],
					materials : [libMat.Nature.FlowersB],
				}),
				GrassShortGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassA],
				}),
				GrassShort : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassA],
				}),
				GrassDryGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassB],
				}),
				GrassDry : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassB],
				}),
				GrassThickGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassC],
				}),
				GrassThick : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.GrassC],
				}),
				BushFlowersGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mBush, stdTag.mFlower],
					materials : [libMat.Nature.TreeA],
				}),
				BushFlowers : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mBush, stdTag.mFlower],
					materials : [libMat.Nature.TreeA],
				}),
				BushTree : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mBush],
					materials : [libMat.Nature.TreeB],
				}),
				VinePatch : new LibMesh({
					url : 'nature/vinepatch.JD',
					tags : [stdTag.mVines],
					materials : [libMat.Nature.Vines],
				}),

				BushThiccGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mBush],
					materials : [libMat.Nature.BushThicc],
				}),
				BushThickSingle : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushThicc],
				}),

				GrassBushGroup : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mBush],
					materials : [libMat.Nature.BushGrass],
				}),
				GrassBushSingle : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushGrass],
				}),

				BushTropical : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mBush],
					materials : [libMat.Nature.BushTropical],
				}),
				BushTropical : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushTropical],
				}),

				BushBogTree : new LibMesh({
					url : 'nature/grass_wide_group.JD',
					tags : [stdTag.mBush],
					materials : [libMat.Nature.Bogtree],
				}),
				BushBogTree : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.Bogtree],
				}),

				BushPalmtree : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushPalm],
				}),

				GrassTuftRed : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushRedgrass],
				}),
				BushBonsai : new LibMesh({
					url : 'nature/grass_wide_single.JD',
					tags : [stdTag.mGrassLong],
					materials : [libMat.Nature.BushTree],
				}),
				
				
			},
			Containers : {
				RazzyBerries : new LibMesh({
					url : 'containers/razzyberries_1x1.JD',
					materials : [
						libMat.Nature.RazzyBerryBush,
						libMat.Nature.RazzyBerryStem,
						libMat.Nature.RazzyBerryBerries
					],
					onInteract : function( mesh, room, asset ){
						
					},
					onInteractivityChange : function(dungeonAsset, interactive){
						const mesh = dungeonAsset._stage_mesh;
						mesh.material[2].visible = interactive;
					},
				}),
				RockPile : new LibMesh({
					auto_bounding_box : true,
					url : 'nature/rockpile.JD',
					materials : [
						libMat.Rock.Quartz,
						libMat.Rock.Floor,
						libMat.Rock.Wall,
					],
					onInteract : function( mesh, room, asset ){
						
					},
					onInteractivityChange : function(dungeonAsset, interactive){
						const mesh = dungeonAsset._stage_mesh;
						mesh.material[0].visible = interactive;
					},
				}),
				Pumpkin : new LibMesh({
					auto_bounding_box : true,
					url : 'nature/pumpkin.JD',
					materials : [
						libMat.Nature.Pumpkin,
						libMat.Nature.Vines,
						libMat.Solids.GreenA,
					],
				}),
				Carrot : new LibMesh({
					auto_bounding_box : true,
					url : 'nature/carrot.JD',
					materials : [
						libMat.Nature.Pumpkin,
						libMat.Nature.Vines
					],
				}),
			},
			Doodads : {
				Logs : new LibMesh({
					tags : [stdTag.mTreeStump],
					url : 'nature/logs.JD',
					materials : [libMat.Wood.Bark, libMat.Wood.Stump],
				}),
			},
			Soil : {
				FarmPatch : new LibMesh({
					tags : [stdTag.mSoil],
					url : 'nature/farm_patch.JD',
					materials : [libMat.Nature.Soil],
				}),
			},
			Weather : {
				Mist : new LibMesh({
					url : 'nature/smokelayer.JD',
					tags : [stdTag.mMist],
					materials : [libMat.Nature.Mist],
					cast_shadow : false,
					receive_shadow : false,
					onFlatten : function(mesh){
						mesh.renderOrder = 1;
					},
				}),
			},
		},
		
		


	};


	return LibMesh.library;

};

function getNonDoorMeshes( sub ){
	if( sub === undefined )
		sub = build();
	
	let out = {};
	for( let i in sub ){
		if( sub[i] instanceof LibMesh ){
			if( !sub[i].isRoom )
				out[i] = sub[i];
		}
		else if( typeof sub[i] === "object" ){
			const o = getNonDoorMeshes(sub[i]);
			if( Object.keys(o).length )
				out[i] = o;
		}

	}
	return out;
}


export {LibMesh, getNonDoorMeshes};

// Use libMesh() to get the library
export default build;