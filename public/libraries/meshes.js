/*
	Notes on meshes:

	Custom userData properties:
	- dungeonAsset
	- tweens - Object of functions that return TWEEN.Tweens when called.
	- particles - Array of libParticles particle systems 
	- _stage - Added automatically when placed into a WebGL stage
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
import libMat from './materials.js';
import JDLoader from '../ext/JDLoader.min.js';
import libParticles from './particles.js';
import AC from '../classes/AssetCache.js';
import stdTag from './stdTag.js';
import Water from '../ext/Water.js';


class LibMesh{
	constructor(data){
		this.isRoom = data.isRoom;					// Set to true if this is a base room mesh		
		this.url = data.url;		// Relative to media/models/
		this.materials = data.materials || [];		// Should be Material objects from materials.js
		this.width = data.width || 1;				// Blocks of 1m
		this.height = data.height || 1;				
		this.depth = data.depth || 1;
		this.top = data.top || 0;
		this.left = data.left || 0;					// The 0/0 block is the one northwest
		this.hole_coordinates = data.hole_coordinates || [];
		this.animations = data.animations;			// object of animation : (obj)properties
													// https://threejs.org/docs/#api/en/animation/AnimationAction
		this.wall_indentation = !isNaN(data.wall_indentation) ? data.wall_indentation : 1;				
			// Used for aligning wall meshes if the wall is sticking out or in.
			// For rooms, this is a unit in centimeters
			// For assets, this is a multiplier of above unit
		this.receive_shadow = data.receive_shadow !== false;
		this.cast_shadow = data.cast_shadow !== false;
		this.name = data.name || "";
		this.tags = Array.isArray(data.tags) ? data.tags : [];								// Game tags. These get merged over to dungeonAsset for netcode reasons
		this.static = data.static;					// If true this mesh can be cached after flattening
													// If unset, the code tries to figure it out automatically based on the events set, if it's animated etc
		//this.interactive = data.interactive;		// Needs to be set on all assets that can be interactive in order to make the material unique
		// Metadata for dungeon generator
		this.position_on_wall = data.position_on_wall || false;		// Where to prefer this mesh to be placed in a dungeon
		this.void_tiles = data.void_tiles || false;							// Does not occupy tiles, useful for rugs and such
		this.use_wall_indentation = data.use_wall_indentation || false;		// Apply wall indentation of the room mesh
		this.no_rotation = data.no_rotation || false;						// Don't rotate in generator
		this.lockable = data.lockable || false;								// Use the door lock system
		this.attachments = Array.isArray(data.attachments) ? data.attachments : [];	// use LibMeshAttachment
		this.min_attachments = isNaN(data.min_attachments) ? -1 : data.min_attachments;
		this.max_attachments = data.max_attachments;
		this.auto_bounding_box = data.auto_bounding_box;										// Creates an automatic invisible prim to use as a bounding box for raycasting

		// Events
		this.beforeFlatten = data.beforeFlatten || function(mesh){};		// Raised before you flatten. Only raised once
		this.onFlatten = data.onFlatten || function(mesh){};				// Raised after you flatten, this is the LibMesh object. Only raised once.
		this.onInteract = data.onInteract || undefined;					// Raised when clicked, This is the LibMesh object
		this.onStagePlaced = data.onStagePlaced || function(dungeonAsset, mesh){};		// Raised when placed into world. Can happen multiple times.
		this.afterStagePlaced = data.afterStagePlaced || function(dungeonAsset, mesh){};

	}

	// Note: Avoid parallelization to prevent the viewer from freezing
	// Returns a promise that resolves with a mesh
	async flatten( attachmentIndexes, unique = false ){


		// Attachmentindexes is an array of attachments that should be allowed
		// Use ["ALL"] to enable all attachments
		let submeshes = [];
		for( let i = 0; i<this.attachments.length; ++i ){
			
			if( !Array.isArray(attachmentIndexes) || ~attachmentIndexes.indexOf(i) ){
				let sub = await this.attachments[i].flatten();
				submeshes.push(sub);
			}

		}

		// Load the model
		let data = await LibMesh.cache.fetch('media/models/'+this.url);
		let obj = data.objects[0];
		let geometry = obj.geometry;
		

		// Load the materials
		let mats = [];
		// SkinnedMesh needs a unique material or it goes tits up
		for( let mat of this.materials )
			mats.push(mat.fetch(unique || obj.type === "SkinnedMesh"));

		let mesh;
		if( mats[0].type === 'Water'){
			mesh = new Water(geometry, mats[0].material);
			mesh.userData._is_water = true;
		}
		else
			mesh = obj.type === 'SkinnedMesh' ? new THREE.SkinnedMesh(geometry, mats) : new THREE.Mesh(geometry, mats);

		await this.beforeFlatten( mesh );
		let ud = mesh.userData;
		mesh.receiveShadow = this.receive_shadow;
		mesh.castShadow = this.cast_shadow;


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
		if( mesh.type === "SkinnedMesh" ){

			let mixer = new THREE.AnimationMixer(mesh);

			// Enable animations
			for( let anim of geometry.animations ){
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
			}

			// no animation or only idle is playing
			mesh.userData.animationIsIdle = function(){
				for( let anim of mesh.geometry.animations ){
					let action = mixer.clipAction(anim);
					if( action.name !== 'idle' && action.isRunning() )
						return false;
				}
				return true;
			}

			mesh.userData.activeAnimation = 'idle';
			mesh.userData.mixer = mixer;

		}
		
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

		await delay(10);

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

	isHoleCoordinate(x,y){

		// out of bounds
		if( 
			x > this.left+this.width-1 || 
			y > this.height+this.top-1 ||
			y < this.top || x < this.left
		)return true;
		for( let coord of this.hole_coordinates ){
			if( coord[0] === x && coord[1] === y )
				return true;
		}
		return false;
	}

}
LibMesh.loader = new JDLoader();
LibMesh.cache = new AC();
LibMesh.cache.fetchMissingAsset = function( path ){
	return new Promise(res => {
		LibMesh.loader.load(path, res);
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
		base = this.library;
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
	return iterate(LibMesh.library);
};

class LibMeshAttachment{
	constructor(data){
		if( typeof data !== "object" )
			data = {};
		this.path = data.path;
		this.position = data.position || new THREE.Vector3();
		this.rotation = data.rotation || new THREE.Vector3();
		this.scale = data.scale || new THREE.Vector3(1,1,1);
		
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
	let base = LibMesh.library;
	while(path.length){
		base = base[path.shift()];
		if( !base )
			return false;
	}
	return base;
}

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
				width: 10,
				height:10,
				wall_indentation : 10,
				top:-4,left:-4,
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
				wall_indentation : 10,
				width: 10,
				height:10,
				hole_coordinates : [
					[-4,-4],[-3,-4],[-2,-4],[-1,-4],[0,-4],[1,-4],
					[-4,-3],[-3,-3],[-2,-3],[-1,-3],[0,-3],[1,-3],
					[-4,-2],[-3,-2],[-2,-2],[-1,-2],[0,-2],[1,-2],
					[-4,-1],[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],
					[-4,0],[-3,0],[-2,0],[-1,0],[0,0],[1,0],
					[-4,1],[-3,1],[-2,1],[-1,1],[0,1],[1,1],
				],
				top:-4,left:-4,

			}),
			R6x10 : new LibMesh({
				isRoom : true,
				url : 'rooms/dungeon_6x10.JD',
				wall_indentation : 10,
				tags : [stdTag.mWall],
				materials : [
					libMat.StoneTile.DungeonWall,
					libMat.StoneTile.DungeonFloor,
					libMat.Brick.DungeonBlack,
					libMat.StoneTile.DungeonWall,
				],
				width: 6,
				height:10,
				top:-4,left:-2,

			}),
			R6x6 : new LibMesh({
				isRoom : true,
				url : 'rooms/dungeon_6x6.JD',
				wall_indentation : 10,
				tags : [stdTag.mWall],
				materials : [
					libMat.StoneTile.DungeonWall,
					libMat.StoneTile.DungeonFloor,
					libMat.Brick.DungeonBlack,
					libMat.StoneTile.DungeonWall,
				],
				width: 6,
				height:6,
				top:-2,left:-2,
			}),
		},
		Furniture : {
			RugTorn : new LibMesh({
				url : 'furniture/rug_3x2.JD',
				materials : [
					libMat.Cloth.Rug.Torn
				],
				width: 3,
				height: 2,
			}),
		},
		Doodads : {
			BannerAnimated : new LibMesh({
				url : 'doodads/banner_animated.JD',
				materials : [
					libMat.Cloth.Banner.RaggedHand
				],
				position_on_wall : true,
				use_wall_indentation: true,
				width: 1,
				height: 1,
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
				position_on_wall : true,
				width: 2,
				height: 1,
				lockable : true,
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
					if( !dungeonAsset.isLocked() ){
						lock.position.y -= 160;
					}

				},
				onInteract : function( mesh, room, asset ){
					LibMesh.playSound( mesh, asset, 'media/audio/dungeon_door.ogg', 0.5 );
				}
			}),
			Ladder : new LibMesh({
				url : 'gates/ladder_1x1.JD',
				materials : [
					libMat.Wood.Crate,
				],
				width: 1,
				height: 1,
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
				
				}
			}),
			Trapdoor : new LibMesh({
				url : 'gates/trapdoor_2x2.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
					libMat.Solids.Black
				],
				width: 2,
				height: 2,
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
				}
			}),
			WallLever : new LibMesh({
				auto_bounding_box : true,
				url : 'gates/lever_wall_1x1.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Metal.DarkGeneric,
				],
				position_on_wall : true,
				wall_indentation : 1.4,
				use_wall_indentation : true,
				width: 1,
				height: 1,
				tags : [stdTag.mLever],
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
				width: 1,
				height: 1,
				position_on_wall : true,
				tags : [stdTag.mStool],
			}),
			Bench : new LibMesh({
				url : 'furniture/bench_105_05.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
				],
				tags : [stdTag.mBench],
				width: 2,
				height: 1,
				position_on_wall : true,
			}),
			TableOneChair : new LibMesh({
				url : 'furniture/table_2x1.JD',
				materials : [libMat.Wood.Crate],
				width: 2,
				height: 2,
				tags : [stdTag.mTable],
				attachments : [
					new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(30.27,75,33.55),rotation:new THREE.Vector3(0,-0.5029,0),scale:new THREE.Vector3(0.87,0.87,0.87),is_key_item:false}),
					new LibMeshAttachment({path:"Generic.Doodads.CandleLit",position:new THREE.Vector3(-19,75,-2),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),is_key_item:false}),
					new LibMeshAttachment({path:"Generic.Doodads.Bowl",position:new THREE.Vector3(7,75,31),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),is_key_item:false}),
					new LibMeshAttachment({path:"Generic.Doodads.BookOpen",position:new THREE.Vector3(-47,75,26),rotation:new THREE.Vector3(0,0.4887,0),scale:new THREE.Vector3(1,1,1),is_key_item:false}),
					new LibMeshAttachment({path:"Farm.Furniture.Stool",position:new THREE.Vector3(-12,0,72),rotation:new THREE.Vector3(0,-0.0349,0),scale:new THREE.Vector3(1,1,1),is_key_item:false})
				],
			}),
			TableTwoBenches : new LibMesh({
				url : 'furniture/table_2x1.JD',
				materials : [libMat.Wood.Crate],
				width: 2,
				height: 2,
				tags : [stdTag.mTable],
				attachments : [
					new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(18,74,27),rotation:new THREE.Vector3(0,-0.5029,0),scale:new THREE.Vector3(0.87,0.87,0.87),}),
					new LibMeshAttachment({path:"Generic.Doodads.Tankard",position:new THREE.Vector3(27,75,-23),rotation:new THREE.Vector3(0,0.841,0),scale:new THREE.Vector3(0.87,0.87,0.87),}),
					new LibMeshAttachment({path:"Generic.Doodads.CandleLit",position:new THREE.Vector3(42,74,-2),rotation:new THREE.Vector3(0,0.925,0),scale:new THREE.Vector3(1,1,1),}),
					new LibMeshAttachment({path:"Generic.Doodads.CandleLit",position:new THREE.Vector3(-19,74,-2),rotation:new THREE.Vector3(0,0,0),scale:new THREE.Vector3(1,1,1),}),
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
				width: 2,
				height: 1,
				position_on_wall : true,
			}),
			Shelf : new LibMesh({
				url : 'furniture/dungeon_shelf_2x1.JD',
				materials : [
					libMat.Wood.Board
				],
				tags : [stdTag.mShelf],
				width: 1,
				height: 2,
				position_on_wall : true,
			}),
			ShelfContainers : new LibMesh({
				url : 'furniture/dungeon_shelf_2x1.JD',
				materials : [
					libMat.Wood.Board
				],
				tags : [stdTag.mShelf],
				width: 1,
				height: 2,
				position_on_wall : true,
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
				width: 1,
				height: 2,
				position_on_wall : true,
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
				width: 3,
				height: 2,
			}),
		},
		Doodads : {
			RopeSpool : new LibMesh({
				url : 'doodads/rope_spool.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Cloth.Rope
				],
				tags : [],
				width: 1,
				height: 1,
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
				width: 1,
				height: 1,
				position_on_wall : true,
			}),
			Crate : new LibMesh({
				url : 'containers/crate_1x1.JD',
				materials : [
					libMat.Wood.Crate
				],
				tags : [stdTag.mCrate],
				width: 1,
				height: 1,
				position_on_wall : true,
			}),
			CrateOpen : new LibMesh({
				url : 'containers/crate_open_1x1.JD',
				materials : [
					libMat.Wood.Crate
				],
				width: 1,
				height: 1,
				position_on_wall : true,
			}),
			Chest : new LibMesh({
				url : 'containers/chest_1x1.JD',
				materials : [
					libMat.Metal.DarkGeneric,
					libMat.Wood.Crate
				],
				tags : [stdTag.mChest],
				width: 1,
				height: 1,
				position_on_wall : true,
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
				width: 1,
				height: 1,
				position_on_wall : true,
				tags : [stdTag.mChest],
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
				}
			}),
			LootBag : new LibMesh({
				url : 'containers/lootbag_1x1.JD',
				materials : [
					libMat.Cloth.Rope,
					libMat.Cloth.Dark,
				],
				width: 1,
				height: 1,
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
				}
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
				width: 1,
				height: 1,
				use_wall_indentation: true,
				position_on_wall : true,
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

					let particles = libParticles.get('candleFlame');
					mesh.add(particles.mesh);
					particles.mesh.position.z = z;
					particles.mesh.position.y = y;
					particles.emitters[0].size.value = 40;
					mesh.userData.particles = [
						particles
					];
				}
			}),
			WallSconceFancy : new LibMesh({
				url : 'furniture/wall_sconce_fancy_1x1.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Metal.DarkGeneric,
					libMat.Candle.Wax,
					libMat.Candle.Wick,
				],
				width: 1,
				height: 1,
				use_wall_indentation: true,
				position_on_wall : true,
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

					let particles = libParticles.get('candleFlame');
					mesh.add(particles.mesh);
					particles.mesh.position.y = y;
					particles.mesh.position.z = z;
					particles.emitters[0].size.value = 40;
					mesh.userData.particles = [
						particles
					];
				}
			}),
			TorchHolder : new LibMesh({
				url : 'furniture/torch_holder_1x1.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Metal.DarkGeneric,
				],
				width: 1,
				height: 1,
				position_on_wall : true,
				use_wall_indentation: true,
				onFlatten : function(mesh){
					let light = new THREE.PointLight(0xFFDDAA, 0.5, 1600, 2);
					let z = -13, y = 175;
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

					let particles = libParticles.get('torchFlame');
					mesh.add(particles.mesh);
					particles.mesh.position.y = y;
					particles.mesh.position.z = z; 
					mesh.userData.particles = [particles];

					particles = libParticles.get('torchSmoke');
					mesh.add(particles.mesh);
					particles.mesh.position.y = y;
					particles.mesh.position.z = z;
					mesh.userData.particles.push(particles);

					particles = libParticles.get('torchEmbers');
					mesh.add(particles.mesh);
					particles.mesh.position.y = y+5;
					particles.mesh.position.z = z;
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
				width: 1,
				height: 1,
			}),
			Bowl : new LibMesh({
				url : 'doodads/bowl.JD',
				materials : [
					libMat.Wood.Crate,
				],
				width: 1,
				height: 1,
			}),
			Papers : new LibMesh({
				url : 'doodads/papers.JD',
				materials : [
					libMat.Paper.Torn
				],
				width: 1,
				height: 1,
			}),
			Candle : new LibMesh({
				url : 'doodads/candle.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Candle.Wax,
					libMat.Candle.Wick,
				],
				width: 1,
				height: 1,
			}),
			CandleLit : new LibMesh({
				url : 'doodads/candle.JD',
				materials : [
					libMat.Metal.Rust,
					libMat.Candle.Wax,
					libMat.Candle.Wick,
				],
				width: 1,
				height: 1,
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

					let particles = libParticles.get('candleFlame');
					mesh.add(particles.mesh);
					particles.mesh.position.y = 22;
					mesh.userData.particles = [
						particles
					];

				}
			}),
			BookClosed : new LibMesh({
				url : 'doodads/book_closed.JD',
				materials : [
					libMat.Book.Closed,
					libMat.Paper.Torn,
				],
				width: 1,
				height: 1,
			}),
			BookOpen : new LibMesh({
				url : 'doodads/book_open.JD',
				materials : [
					libMat.Book.Full,
					libMat.Paper.Torn,
				],
				width: 1,
				height: 1,
			}),
			BannerAnimated : new LibMesh({
				url : 'doodads/banner_animated.JD',
				materials : [
					libMat.Cloth.Banner.RaggedHand
				],
				position_on_wall : true,
				use_wall_indentation: true,
				width: 1,
				height: 1
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
				width: 1,
				height: 1,
			}),
			Blacksmith : new LibMesh({
				url : 'doodads/store_sign.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
					libMat.Sign.Blacksmith
				],
				tags : [],
				width: 1,
				height: 1,
			}),
			Dojo : new LibMesh({
				url : 'doodads/store_sign.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
					libMat.Sign.Dojo
				],
				tags : [],
				width: 1,
				height: 1,
			}),
			Port : new LibMesh({
				url : 'doodads/store_sign.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
					libMat.Sign.Port
				],
				tags : [],
				width: 1,
				height: 1,
			}),
			Tavern : new LibMesh({
				url : 'doodads/store_sign.JD',
				materials : [
					libMat.Wood.Crate,
					libMat.Metal.DarkGeneric,
					libMat.Sign.Tavern
				],
				tags : [],
				width: 1,
				height: 1,
			}),
		}
	},
	Land : {
		Yuug : {
			Yuug : new LibMesh({
				isRoom : true,
				url : 'land/yuug/yuug_land.JD',
				materials : [
					libMat.Land.Yuug
				],
				width: 10,
				height: 10,
				top:-4,left:-4,
				attachments : [
					new LibMeshAttachment({path:"Land.Yuug.Ocean"})
				]
			}),
			Ocean : new LibMesh({
				url : 'land/yuug/yuug_water.JD',
				materials : [
					libMat.Water.Ocean
				],
				width: 10,
				height:10,
				top:-4, left:-4
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
			Port : new LibMesh({
				
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
		

			Port : {
				LandMid : new LibMesh({
					isRoom : true,
					url : 'land/yuug/yuug_port_mid_land.JD',
					materials : [
						libMat.Land.YuugPortMid,
					],
					width: 10,
					height:10,
					isRoom : true,
					top:-4,left:-4,
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

	},

	Nature : {
		Trees : {
			RoundA : new LibMesh({
				url : 'nature/tree_a.JD',
				materials : [
					libMat.Solids.Brown,
					libMat.Solids.GreenA,
				],
			}),
			RoundB : new LibMesh({
				url : 'nature/tree_b.JD',
				materials : [
					libMat.Solids.Brown,
					libMat.Solids.GreenB,
				],
			}),
			RoundC : new LibMesh({
				url : 'nature/tree_c.JD',
				materials : [
					libMat.Solids.Brown,
					libMat.Solids.GreenC,
				],
			}),
		}
	}
	


};

export {LibMesh};
export default LibMesh.library;