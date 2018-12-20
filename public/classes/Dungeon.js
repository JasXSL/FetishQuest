/*

	A dungeon contains rooms, which contain assets and encounters
	Only one dungeon and room can be active at a time
	

	Dungeons are based on a tiling system:
	In the dungeon system, each tile is 100x100cm. X is right and Y is down.
	0,0 is the center of the NW middle tile

*/



import Generic from './helpers/Generic.js';
import {default as libMeshes, LibMesh as libMeshTools} from '../libraries/meshes.js';
import stdTag from '../libraries/stdTag.js';
import Player from './Player.js';
import { Wrapper, Effect } from './EffectSys.js';
import Asset from './Asset.js';

import Quest from './Quest.js';

class Dungeon extends Generic{

	constructor(data, parent){
		super(data);

		this.parent = parent;
		this.label = '';			// Dungeon label
		this.name = '';				// Dungeon name
		this.tags = [];				// Dungeon tags
		this.rooms = [];			// All rooms in the dungeon
		this.active_room = 0;		// Room you are currently in
		this.previous_room = 0;		// Room we came from (if any). Used for placing the helper arrow showing where you entered a room.
		this.depth = 0;				// Negative value of how many stories below the entrance we can go
		this.height = 0;			// Positive value of how many stories above the entrance we can go
		this.shape = Dungeon.Shapes.Random;			// If linear, the generator will force each room to go in a linear fashion
		this.difficulty = 1;		// Generally describes how many players this dungeon is for
		
		// Runtime vars
		this.transporting = false;	// Awaiting a room move

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.rooms = DungeonRoom.loadThese(this.rooms, this);
	}

	save( full ){
		
		let out = {
			name : this.name,
			tags : this.tags,
			rooms : this.rooms.map(el => {
				return el.save(full);
			}),
			difficulty : this.difficulty,
		};

		// Full or mod
		if( full ){
			out.label = this.label;
			out.depth = this.depth;
			out.height = this.height;
			out.shape = this.shape;
		}

		// Everything except mod
		if( full !== 'mod' ){
			out.id = this.id;
			out.active_room = this.active_room;
			out.previous_room = this.previous_room;
		}
		else
			this.g_sanitizeDefaults(out);
		return out;
	}

	clone(){
		return new this.constructor(this.save(true));
	}


	/* ROOM */
	getActiveRoom(){
		if( this.rooms[this.active_room] )
			return this.rooms[this.active_room];
		return this.rooms[0];
	}

	generateRoom( shape ){
		if( isNaN(shape) )
			shape = this.shape;

		let room = new DungeonRoom({}, this);
		if( !this.rooms.length ){
			room.discovered = true;
			this.rooms.push(room);
			return room;
		}

		// Shuffle the rooms
		let rooms = this.rooms.slice();
		if( shape === Dungeon.Shapes.Linear || shape === Dungeon.Shapes.SemiLinear )
			rooms = [this.rooms[this.rooms.length-1]];
		shuffle(rooms);
		for( let r of rooms ){
			let empty = this.getEmptyRoomDirectionsFrom(r);
			if( empty.length ){
				shuffle(empty);
				let xyz = empty.shift();
				room.x = r.x+xyz[0];
				room.y = r.y+xyz[1];
				room.z = r.z+xyz[2];
				room.index = this.rooms.length;
				room.parent_index = r.index;
				this.rooms.push(room);
				return room;
			}
		}

		return false;

	}

	getRoomAt(x,y,z){
		for( let room of this.rooms ){
			if( room.x === x && room.y === y && room.z === z)
				return room;
		}
		return false;
	}

	// Returns an array of sub-arrays [x,y,z]
	getEmptyRoomDirectionsFrom(origin){
		let out = [];
		let dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
		for( let d of dirs ){
			let r = this.getRoomAt(origin.x+d[0], origin.y+d[1], origin.z+d[2]);
			if( 
				r ||									// Room already exists
				origin.z+d[2] > this.height ||			// Not allowed to go above the max height
				origin.z+d[2] < this.depth ||				// Not allowed to go below the max depth
				(origin.z+d[2] > -1 && origin.y+d[1]<0)		// Not allowed to go below entrance unless it's below the entrance
			)continue;
			out.push(d);
		}
		return out;
	}

	getRoomsLinkingTo(origin){
		let dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
		let out = [];
		for( let d of dirs ){
			let room = this.getRoomAt(origin.x+d[0],origin.y+d[1],origin.z+d[2]);
			if( room )
				out.push(room);
		}
		return out;
	}

	async goToRoom( player, index ){

		if( this.transporting )
			return false;
		
		this.transporting = true;
		this.previous_room = this.active_room;
		if( this.rooms[index] )
			this.active_room = index;

		// 500 delay before turning off the renderer for load
		await delay(800);
		await game.renderer.drawActiveRoom();
		this.transporting = false;
		game.modal.closeSelectionBox();
		this.getActiveRoom().onVisit(player);
		game.updateAmbiance();
		game.save();

	}



	/* Assets */
	// Search through all rooms and see if we can locate an asset by id
	findAssetById( id ){
		for( let room of this.rooms ){
			for( let asset of room.assets ){
				if( asset.id === id )
					return asset;
			}
		}
		return false;
	}



	/* Encounters */
	getNumMonsters(){
		return this.getMonsters().length;
	}

	// Returns all monsters
	getMonsters(){
		let out = [];
		let encounters = this.getEncounters( true );
		for( let enc of encounters )
			out = out.concat(enc.getEnemies());
		return out;
	}

	getEncounters( activeOnly = false ){
		let out = [];
		for( let room of this.rooms )
			out = out.concat(room.getEncounters());
		if( activeOnly )
			out = out.filter(el => el.active);
		return out;
	}

	getEncounterById(id){
		let encounters = this.getEncounters();
		for( let enc of encounters ){
			if( enc.id === id )
				return enc;
		}
		return false;
	}

	/* EVENTS */
	// mesh is the actual THREE mesh, not the library entry
	// asset is a DungeonRoomAsset
	async assetClicked( player, room, asset, mesh ){

		//console.log("Mesh ", mesh, "Asset ",asset," in room", room, "clicked");

		if( asset._interact_cooldown )
			return;

		if( !game.getAlivePlayersInTeam(0).length ){
			console.log("Players are deeeeaaaad");
			return;
		}

		// Helper function for playing animation on this asset. Returns the animation played if any
		function playAnim( anim ){
			if( !mesh.userData.playAnimation )
				return;
			game.net.dmAnimation( asset, anim );
			return mesh.userData.playAnimation(anim);

		}

		// Helper function for interact action
		function raiseInteractOnMesh( shared = true ){
			if( mesh.userData.template.onInteract ){
				mesh.userData.template.onInteract.call(mesh.userData.template, mesh, room, asset);
				if( game.is_host && shared )
					game.net.dmRaiseInteractOnMesh( asset.id );
			}
		}


		if( asset.locked )
			return game.ui.addError("Locked");

		console.log("used asset", asset, "loot", asset.loot);
		// Seeing the loot is clientside, and needs to go above ask host
		if( asset.loot.length ){
			console.log("Drawing loot selector with", asset.loot);
			raiseInteractOnMesh( false );
			return game.ui.drawContainerLootSelector(asset);
		}
		// Ask host
		if( !game.is_host ){
			game.net.playerInteractWithAsset( player, asset );
			return;
		}

		raiseInteractOnMesh();

		// Custom logic for if battle is active
		if( game.battle_active ){
			if( asset.isDoor() && asset.data.room === this.previous_room ){
				
				if( !game.turnPlayerIsMe() )
					return game.ui.addError("Not your turn");
				
				let player = game.getTurnPlayer();
				game.modal.close();
				game.useActionOnTarget( player.getActionByLabel('stdEscape'), [player], player );

				return;
			}
			game.ui.addError("Battle in progress");
			return;
		}

		// Door
		if( asset.isDoor() ){

			// Todo: Dungeon exit
			if( asset.isExit() ){
				// Todo: Delete this, it's only used for quest debugging
				game.onDungeonExit();
				return;
			}

			else if( !isNaN(asset.data.room) && !this.transporting ){

				playAnim("open");
				game.onRoomChange();
				this.goToRoom( player, asset.data.room );
				

			}

		}

		// Start an encounter
		else if( asset.interactEncounter.active && !asset.interactEncounter.started ){

			// Encounter active, send to host if not hosting
			if( !game.is_host ){
				game.net.playerInteractWithAsset( player, asset );
				return;
			}

			playAnim("open");
			game.startEncounter(player, asset.interactEncounter);
			asset.updateInteractivity();

		}
		

		else if( asset.type === DungeonRoomAsset.Types.Switch ){
			let door = asset.getSwitchTarget();
			if( door ){
				door.locked = !door.locked;
				let aname = 'close';
				if( !door.locked )
					aname = 'open';
				let anim = playAnim(aname);
				if( anim && anim.getClip().duration )
					asset.setInteractCooldown(Math.max(Math.round(anim.getClip().duration*1000), 500));
				game.save();
			}
		}
		
	}


	/* Parents */
	// Returns a quest parent if it exists
	getQuest(){
		let p = this.parent;
		while( p !== undefined && !(p instanceof Quest) )
			p = p.parent;
		return p;
	}
	
	getTags(){
		let t = valsToKeys(this.tags);
		let room = this.getActiveRoom();
		if( !room )
			return [];
		let tags = room.getTags();
		for( let tag of tags )
			t[tag] = true;
		return Object.keys(t);
	}

}


Dungeon.Shapes = {
	Random : 0,
	Linear : 1,
	SemiLinear : 2,			// Linear but with side-chambers of 1-2 linear rooms
};








/*
	Rooms have a position in the dungeon
	They use a tile based system (see top)
	They have DungeonRoomAsset objects which describe where to 
	They can have an encounter
	They store data of whether it has been visited or not
*/
class DungeonRoom extends Generic{

	constructor(data, parent){
		super(data);

		this.name = '';
		this.parent = parent;
		this.index = 0;
		this.parent_index = 0;
		this.discovered = false;
		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.outdoors = false;
		this.zoom = null;			// Lets you manually set the zoom value
		this.encounter = new DungeonEncounter({}, this);
		this.assets = [];			// First asset is always the room. These are DungeonRoomAssets
		this.tags = [];

		this.ambiance = 'media/audio/ambiance/dungeon.ogg';
		this.ambiance_volume = 0.2;

		this.load(data);


	}

	save( full ){

		// shared
		const out = {
			index : this.index,
			parent_index : this.parent_index,
			assets : this.assets.map(el => el.save(full)),
			ambiance_volume : this.ambiance_volume,
			tags : this.tags,
			name : this.name,
			x : this.x,
			y : this.y,
			z : this.z,
			zoom : this.zoom,
			outdoors : this.outdoors,
			ambiance : this.ambiance
		};

		// Full or mod
		if( full )
			out.encounter = this.encounter.save(full);

		// Stuff needed for everything except mod
		if( full !== 'mod' ){
			out.id = this.id;
			out.discovered = this.discovered;
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;
	}



	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.assets = DungeonRoomAsset.loadThese(this.assets, this);
		this.encounter = DungeonEncounter.loadThis(this.encounter, this);
	}

	isEntrance(){
		return this === this.parent.rooms[0];
	}

	getEncounters(){
		let out = [this.encounter];
		for( let asset of this.assets )
			out = out.concat(asset.getEncounters());
		return out;
	}




	/* ROOM CONNECTIONS */
	// Returns an array of [X,Y,Z] which is the offset from this bearing
	getBearingCoords(bearing){
		if( isNaN(bearing) )
			return [0,0];
		return [[0,-1,0],[1,0,0],[0,1,0],[-1,0,0],[0,0,1],[0,0,-1]][bearing];
	}

	getRoomBearingCoords(bearing){
		if( isNaN(bearing) )
			return [0,0];
		return [[0,1,0],[1,0,0],[0,-1,0],[-1,0,0],[0,0,1],[0,0,-1]][bearing];
	}

	// Returns 0-5 based on if the adjacent room is NWSEUD
	getAdjacentBearing( adjacentRoom ){

		let mx = this.x, my = this.y, mz = this.z,
			x = adjacentRoom.x, y = adjacentRoom.y, z = adjacentRoom.z
		;

		if( x > mx )
			return 1;
		if( x < mx )
			return 3;
		if( y < my )
			return 2;
		if( z > mz )
			return 4;
		if( z < mz )
			return 5;
	
		return 0;
	}

	// Helper function for getting a piece of text based on the bearing int supplied
	getBearingLabel( bearing ){
		return [
			'North',
			'East',
			'South',
			'West',
			'Up',
			'Down'
		][bearing];
	}


	// Gets all rooms that link to this
	getDirectConnections(){
		return this.parent.rooms.filter(el => (el.parent_index===this.index || el.index === this.parent_index) && el.index !== this.index);
	}

	// Gets bearings of all rooms linking to this in the form of {bearing:name}
	getAdjacentBearings(){
		const cons = this.getDirectConnections();
		const out = {};
		for( let room of cons )
			out[String(this.getAdjacentBearing(room))] = room; 
		
		return out;
	}

	// Gets parents of this room in order
	getParents(){
		let room = this;
		let out = [];
		while( room.parent_index !== room.index ){
			room = this.parent.rooms[room.parent_index];
			out.push(room);
		}
		return out;
	}

	getDoorLinkingTo( index ){
		for( let asset of this.assets ){
			if( asset.isDoor() && asset.data && asset.data.room === index )
				return asset;
		}
		return false;
	}
	

	getChildren(){
		const rooms = this.parent.rooms;
		let out = [];
		for( let room of rooms ){
			if( room.parent_index === this.index && room.index !== this.index ){
				out.push(room);
				out = out.concat(room.getChildren());
			}
		}
		return out;
	}





	/* TILES */
	getBusyTiles(){
		let out = [];
		let room = this.assets[0].getModel();

		// Start at the top left;
		for( let x = -room.width/2+1; x<=room.width/2; ++x) {

			for( let y = -room.height/2+1; y<=room.height/2; ++y ){

				if( this.isTileBusy(x, y) )
					out.push({x:x,y:y});

			}

		}
		return out;

	}

	getNumFreeTiles(){
		let roomAsset = this.getRoomAsset().getModel();
		let width = roomAsset.width,
			height = roomAsset.height,
			top = roomAsset.top,
			left = roomAsset.left
		;
		let out = 0;
		for( let x = 0; x< width; ++x ){
			for( let y = 0; y<height; ++y ){
				if(this.getFreeTileOffsets(x+top, y+left, 1, 1))
					++ out;
			}
		}
		return out;
	}

	// Checks if all tiles enclosed by width/height from x/y offsets are available
	getFreeTileOffsets(x, y, width, height){
		for( let w = 0; w<width; ++w ){
			for( let h = 0; h<height; ++h ){
				if( this.isTileBusy(x+w,y+h) )
					return false;
			}
		}
		return true;
	}

	// Same as above but checks if all coordinates are holes
	getTileHoleOffsets(roomMesh, x, y, width, height){
		for( let w = 0; w<width; ++w ){
			for( let h = 0; h<height; ++h ){
				if( !roomMesh.isHoleCoordinate(x+w, y+h) )
					return false;
			}
		}
		return true;
	}

	getFreeTilesForObject( roomAsset, bearing, onWall ){
		let width = roomAsset.getRotatedWidth(),
			height = roomAsset.getRotatedHeight(),
			coords = this.getBearingCoords(bearing),
			xNorm = coords[0],
			yNorm = coords[1],
			room = this.assets[0],
			roomMesh = room.getModel(),
			roomWidth = roomMesh.width,
			roomHeight = roomMesh.height,
			roomTop = roomMesh.top,
			roomLeft = roomMesh.left
		;

		let viable = [];	// Sub arrays of X/Y
		for( let x=0; x<roomWidth; ++x ){
			for( let y = 0; y<roomHeight; ++y ){
				let yCoord = roomTop+y, xCoord = roomLeft+x;
				// Bearing is set, this mesh needs to be placed near a wall
				if( onWall && !this.getTileHoleOffsets(roomMesh, xCoord+xNorm, yCoord+yNorm, width, height) )
					continue;

				if( this.getFreeTileOffsets(xCoord, yCoord, width, height) )
					viable.push([xCoord, yCoord]);
			}
		}

		return viable;

	}

	isTileBusy( x,y ){

		for( let asset of this.assets ){

			// Handle room  mesh
			if( asset.isRoom() ){
				// This is a hole coordinate in the room
				if( asset.getModel().isHoleCoordinate(x,y) )
					return true;
				// Disregard room
				continue;
			}

			let width = asset.getRotatedWidth(),
				height = asset.getRotatedHeight(),
				ax = asset.x,
				ay = asset.y
			;
			
			for(let ix = ax; ix<ax+width; ++ix){
				for( let iy = ay; iy<ay+height; ++iy){
					if( ix === x && iy === y )
						return true;
				}
			}
			
		}
		return false;

	}


	


	/* ASSETS */
	addAsset( dungeonRoomAsset ){

		this.assets.push(dungeonRoomAsset);
		let model = dungeonRoomAsset.getModel();
		let attachments = model.attachments.slice();
		let min = isNaN(model.min_attachments) ? 0 :model.min_attachments,
			max = isNaN(model.max_attachments) ? attachments.length : 0;

		if( model )
			dungeonRoomAsset.addTags(model.getTags());
		
		// Make a list of indexes of the assets
		let indexes = [];
		for( let i=0; i<attachments.length; ++i )
			indexes.push(i);

		// If min is -1 (default) use ALL assets in their order
		// Otherwise randomize some assets
		if( min !== -1 ){
			shuffle(indexes);
			let total = Math.floor(Math.random()*(max-min))+min;
			indexes = indexes.slice(0,total);
		}
		dungeonRoomAsset.attachments = indexes;
	}
	
	removeAsset( asset ){
		for( let i in this.assets ){
			if( this.assets[i] === asset ){
				this.assets.splice(i, 1);
				// Deleting an asset causes the netcode to go spastic unless you force a full asset refresh
				game.net.purgeFromLastPush(["dungeon","rooms",this.index,"assets"]);
				return true;
			}
		}	
	}

	// Gets the DungeonRoomAsset that's the room
	getRoomAsset(){
		for( let a of this.assets ){
			if( a.isRoom() )
				return a;
		}
		return false;
	}
	
	// Path in assetLib
	placeAsset( assetPath ){

		let mesh = libMeshTools.getByString(assetPath);
		let bearing = Math.floor(Math.random()*4);
		if( mesh.no_rotation )
			bearing = undefined;

		let prop = new DungeonRoomAsset({
			model : assetPath,
			rotZ : bearing ? bearing*90 : 0,
			type : DungeonRoomAsset.Types.Prop,
		}, this);

		let positions = this.getFreeTilesForObject(prop, bearing, mesh.position_on_wall);
		let position = shuffle(positions).shift();
		if( position ){

			prop.x = position[0];
			prop.y = position[1];
			this.addAsset(prop);
			return prop;

		}

		return false;

	}

	// Adds a lootbag if possible
	addLootBag( assets ){
	
		let prop = this.placeAsset("Generic.Containers.LootBag");
		if( prop ){
			prop.loot = assets;
			game.renderer.drawActiveRoom();
		}

	}

	// Gets an asset in this room by DungeonAsset ID
	getAssetById( id ){
		for( let asset of this.assets ){
			if( asset.id === id )
				return asset;
		}
		return false;
	}

	assetExists( dungeonAsset ){
		// Search by ID or the netcode goes fuck
		for( let asset of this.assets ){
			if( asset.id === dungeonAsset.id )
				return true;
		}
		return false;
	}


	


	/* TAGS */
	getTags(){
		let t = valsToKeys(this.tags);
		for( let asset of this.assets ){
			let tags = asset.getTags();
			for( let tag of tags )
				t[tag] = true;
		}
		return Object.keys(t);
	}

	


	/* EVENTS */
	onVisit( player ){
		if( !this.discovered )
			this.discovered = true;
		game.startEncounter( player, this.encounter );
	}


	
	

}

DungeonRoom.Dirs = {
	North : 0,
	East : 1,
	South : 2,
	West : 3,
	Up : 4,
	Down : 5
};











/*
	Room assets store information about meshes to place in the dungeon
	It uses a tile based system (see top of page)
	It can contain loot and encounters when interacted with

*/
class DungeonRoomAsset extends Generic{
	constructor(data, parentObj){
		super(data);

		this.parent = parentObj;
		this.model = '';		// Use . notation and select a model from libMeshes
		// In absolute mode these are absolute positions and rotations
		// In normal mode, they're based on tiles
		// Absolute objects are excempt from the tiling system in the generator
		this.x = 0;				// X block
		this.y = 0;				// Y block
		this.z = 0;				// Z block
		this.rotX = 0;
		this.rotY = 0;
		this.rotZ = 0;			// Rotation in degrees around the Z axis
		this.scaleX = 1.0;
		this.scaleY = 1.0;
		this.scaleZ = 1.0;
		this.type = DungeonRoomAsset.Types.Prop;
		this.data = {};			// Varies based on type
		this.interactEncounter = new DungeonEncounter({}, this);		// Encounter to start when interacted with
		this.loot = [];											// Asset
		this.attachments = [];			// Indexes of attachments available in new LibMesh().attachments
		this.locked = false;			// Prevents interactions until locked state is set to false
		this.interact_cooldown = 0;		// ms between how often you can interact with this 
		this._model = null;				// Generic mesh model
		this._stage_mesh = null;		// Mesh tied to this object in the current scene
		this._interact_cooldown = null;	// Handles the interact cooldown
		this.tags = [];
		this.absolute = false;			// Makes X/Y/Z absolute coordinates

		this.load(data);

	}

	save( full ){
		const out = {
			id : this.id,			// ID is needed by mods as well due to asset linkage
			model : this.model,
			x : this.x,
			y : this.y,
			z : this.z,
			rotX : this.rotX,
			rotY : this.rotY,
			rotZ : this.rotZ,
			scaleX : this.scaleX,
			scaleY : this.scaleY,
			scaleZ : this.scaleZ,
			type : this.type,
			data : this.data,
			attachments : this.attachments,
			loot : this.loot.map(el => el.save(full)),
			locked : this.locked,
			tags : this.tags,
			absolute : this.absolute,
		};

		// Full or mod
		if( full ){
			out.interactEncounter = this.interactEncounter.save(full);
		}

		if( full !== 'mod' ){
			
		}
		else{
			this.g_sanitizeDefaults(out);
		}
		return out;
	}



	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.interactEncounter = DungeonEncounter.loadThis(this.interactEncounter, this);
		this.loot = Asset.loadThese(this.loot, this);
		this.updateInteractivity();
	}


	getDungeon(){
		return this.parent.parent;
	}
	

	/* Type checking */
	isDoor(){
		return [DungeonRoomAsset.Types.Door,DungeonRoomAsset.Types.Exit].indexOf(this.type) !== -1;
	}

	isExit(){
		return this.type === DungeonRoomAsset.Types.Exit;
	}

	isRoom(){
		return this.type === DungeonRoomAsset.Types.Room;
	}

	isSwitch(){
		return this.type === DungeonRoomAsset.Types.Switch;
	}

	isInteractive(){
		return this.loot.length || 
			this.isSwitch() || 
			(this.interactEncounter.active && !this.interactEncounter.started && !this.interactEncounter.completed) ||
			this.isDoor()
		;
	}


	/* Encounters */
	getEncounters(){
		let out = [this.interactEncounter];
		return out;
	}

	/* Switch */
	// Returns the dungeonAsset this switch toggles lock on
	getSwitchTarget(){
		return this.getDungeon().findAssetById(this.data.asset);
	}

	// Checks if there's a way to open this door
	isUnlockable(){
		let rooms = this.getDungeon().rooms;
		for( let room of rooms ){
			for( let asset of room.assets ){
				if( !asset.isSwitch )
					console.error("Asset is not a proper asset", asset);
				if( asset.isSwitch() && asset.data.asset === this.id )
					return true;
			}
		}
	}

	
	/* Mesh */
	// Gets a generic model, useful for the procedural generator
	// If you're looking for the model placed in the actual 3d renderer, use this._stage_mesh
	getModel(){
		if( this._model )
			return this._model;
		let mesh = libMeshes,
			path = this.model.split('.')
		;
		while( path.length ){
			mesh = mesh[path.shift()];
			if(!mesh){
				console.error("Mesh not found", this.model);
				return false;
			}
		}
		return mesh;
	}




	/* Transforms */
	// These only work for non-absolute
	getRotatedWidth(){
		return this.rotZ%180 ? this.getModel().height : this.getModel().width;
	}

	getRotatedHeight(){
		return this.rotZ%180 ? this.getModel().width : this.getModel().height;
	}





	/* Loot */
	getLootById( id ){
		for( let item of this.loot ){
			if( item.id === id )
				return item;
		}
		return item;
	}

	remLootById( id ){
		for( let i in this.loot ){
			if( this.loot[i].id === id ){
				this.loot.splice(i,1);
				return true;
			}
		}
	}

	// Loots id from this.
	lootToPlayer( id, player, fromNetcode ){
		
		let asset = this.getLootById(id);
		if( !asset )
			return;
		
		if( game.is_host && asset.loot_sound )
			game.playFxAudioKitById(asset.loot_sound, player, player, undefined, true );
		

		if( !game.is_host ){
			game.net.playerLoot( player, this, asset );
			return;
		}
		asset.equipped = false;		// Make sure it's not equipped
		if( player.addAsset(asset) )
			this.remLootById(id);

		// Lootbags are auto removed
		if( !this.isInteractive() ){

			if( this.model === 'Generic.Containers.LootBag' )
				this.parent.removeAsset(this);
			else
				this.updateInteractivity();
		}

		game.ui.addText( player.getColoredName()+" looted "+asset.name+".", undefined, player.id,  player.id, 'statMessage important' );
		//console.log("Drawing active room", this.parent.assets);
		game.renderer.drawActiveRoom();		// Forces a room refresh
		game.save();

	}





	/* Interactions */
	// Checks if this object is no longer interactive, in which case it sets animation idle_opened and removes click handlers
	updateInteractivity(){

		if( this.isInteractive() )
			return;

		if( !this._stage_mesh )
			return;
		
		
		if( this._stage_mesh.userData.playAnimation )
			this._stage_mesh.userData.playAnimation('idle_opened');
		
		// Make sure mouseout is triggered
		if( this._stage_mesh.userData.mouseout )
			this._stage_mesh.userData.mouseout();
		this._stage_mesh.userData.click = undefined;
		this._stage_mesh.userData.mouseover = undefined;
		this._stage_mesh.userData.mouseout = undefined;
	}

	// Sets internal interaction cooldown (prevent spam clicking). If ms is undefined, use the built in interact_cooldown value
	setInteractCooldown( ms ){
		if( ms < 1 )
			ms = this.interact_cooldown;
		this._interact_cooldown = setTimeout(() => { this._interact_cooldown = null; }, ms);
	}

	

	/* Tags */
	// Adds an array of tags
	addTags( tags = [] ){
		for( let tag of tags ){
			if( this.tags.indexOf(tag) === -1 )
				this.tags.push(tag);
		}
	}

	getTags(){
		return this.tags;
	}
	
}

DungeonRoomAsset.Types = {
	Prop : 'prop',			// Data : TODO{}
	Room : 'room',			// Void
	Door : 'door',			// {room:(int)roomID}
	Exit : 'exit',			// Void
	Switch : 'switch',		// {asset:(str)assetUUID} Toggles the locked state of an item when clicked

};







/*
	An encounter starts a battle
	It has players and can have wrappers applied when it starts

*/
class DungeonEncounter extends Generic{

	constructor(data, parent){
		super(data);

		this.parent = parent;		// Parent varies, but usually trickles up to a quest or game
		this.active = false;		// Encounter is enabled
		this.started = false;		// Encounter has started (only set on Game clone of this)
		this.completed = false;		// Encounter completed (only set on Game clone of this)
		this.players = [];			// Players
		this.wrappers = [];			// Wrappers to apply when starting the encounter. auto target is the player that started the encounter
		this.startText = '';		// Text to trigger when starting

		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.players = Player.loadThese(this.players, this);
		this.wrappers = Wrapper.loadThese(this.wrappers, this);
	}

	save( full ){
		const out = {
			players : this.players.map(el => el.save(full)),
			wrappers : this.wrappers.map(el => el.save(full)),
			startText : this.startText
		};

		if( full !== "mod" ){
			out.id = this.id;
			out.completed = this.completed;
			out.started = this.started;
			out.active = this.active;
		}
		else
			this.g_sanitizeDefaults(out);

		// Not really gonna need a full because these are never output to webplayers
		return out;
	}
	getQuest(){
		let p = this.parent;
		while( p !== undefined && !(p instanceof Quest) )
			p = p.parent;
		return p;
	}

	getEnemies(){
		return this.players.filter(pl => pl.team !== 0);
	}

	getPlayerById( id ){
		for( let player of this.players ){
			if( player.id === id )
				return player;
		}
		return false;
	}

}






/* STATIC CONTENT */


// Procedural dungeon generator
// In a SemiLinear one, the room number is multiplied by 1.5, 50% being the side rooms
Dungeon.generate = function( numRooms, kit, settings ){

	const conditions = glib.conditions,
		stdCond = [conditions.senderNotDead, conditions.targetNotDead];

	let out = new this(settings);
	numRooms = Math.max(numRooms, 1);
	let maxAttempts = 1000;
	for( let i=0; i<numRooms; ++i ){
		let attempt = out.generateRoom();

		if( !attempt ){
			out.rooms = [];
			i = -1;
			--maxAttempts;
			console.debug("Got stuck, trying again");
			if( maxAttempts === 0 ){
				console.error("Unable to generate a linear dungeon");
				break;
			}
		}
	}

	// SemiLinear requires at least 2 rooms
	if( out.shape === Dungeon.Shapes.SemiLinear && numRooms > 2 ){

		// Side rooms can be up to 50% of the linear dungeon, min 1
		numRooms = Math.ceil(Math.random()*Math.round(numRooms/2));
		for( let i=0; i<numRooms; ++i )
			out.generateRoom( Dungeon.Shapes.Random );
		
	}

	// Fetch a dungeon kit
	let dungeonTemplateLib = glib.getFull("DungeonTemplate");
	if( dungeonTemplateLib[kit] )
		kit = dungeonTemplateLib[kit];

	// Pick one at random
	kit = objectRandElem(dungeonTemplateLib);

	// Add encounters
	let i = 0;
	let encounters = out.rooms.map(() => ++i);
	encounters.shift();	// First room can never be
	shuffle(encounters);
	
	// Between 40% and 60% of all rooms can have encounters
	let numEncounters = Math.ceil(out.rooms.length*(0.4+Math.random()*0.2));
	encounters = encounters.slice(0, numEncounters);

	let monsterKit = shuffle(kit.monster_types.slice());
	let viableMonsters = [];
	let averageLevel = game.getAveragePlayerLevel();
	let npcLib = glib.getFull("PlayerTemplate");

	// Pick a random monsterkit
	for( let v of monsterKit ){
		viableMonsters = v.filter(el => {
			let mTemplate = npcLib[el];
			if( !mTemplate ){
				console.error("MonsterTemplate not found", mTemplate, "in monsterKit", v);
				return false;
			}
			return mTemplate.max_level >= averageLevel && mTemplate.min_level <= averageLevel;
		});
		if( viableMonsters.length )
			break;
	}
	
	
	let numChests = 0;
	// Generates assets and encounters in the rooms
	for( let room of out.rooms ){
		
		// Pick a room at random
		let templates = shuffle(kit.rooms.slice());

		// Try to find a template that can fit all the required assets
		for(let rt of templates){

			const roomTemplate = glib.get(rt, "RoomTemplate");
			room.assets = [];	// Reset room assets
			let requiredAssetsPlaced = true;

			// ROOM
			let roomAsset = new DungeonRoomAsset({
				model : roomTemplate.basemeshes[Math.floor(roomTemplate.basemeshes.length*Math.random())],
				type : DungeonRoomAsset.Types.Room
			}, room);
			room.addAsset(roomAsset);

			// Audio
			room.ambiance = roomTemplate.ambiance;
			room.ambiance_volume = roomTemplate.ambiance_volume;

			// TRY TO PLACE ALL DOORS
			let adjacent = room.getDirectConnections();				// Adjacent rooms

			// The first rooms needs an additional adjacent to add an exit
			if( room.isEntrance() ){
				adjacent.push(new DungeonRoom({
					index : -1,
					y : -1
				}, out));
			}

			// Add the doors
			for( let a of adjacent ){

				let bearing = room.getAdjacentBearing(a);		// NESWUD
				let doorLib = kit.doors_hor;
				if( bearing === 4 )
					doorLib = kit.doors_up;
				if( bearing === 5 )
					doorLib = kit.doors_down;

				let modelPath = doorLib[Math.floor(doorLib.length*Math.random())];	// Path in dungeon generator library, not drive
				let door = new DungeonRoomAsset({
					model : modelPath,
					rotZ : bearing < 4 ? bearing*90 : 0,
				}, room);
				let mesh = libMeshTools.getByString(modelPath);

				let positions = shuffle(room.getFreeTilesForObject(door, (bearing < 4 ? bearing : undefined), mesh.position_on_wall));
				let position = positions.shift();
				if( position ){
					door.x = position[0];
					door.y = position[1];
					door.type = a.index === -1 ? DungeonRoomAsset.Types.Exit : DungeonRoomAsset.Types.Door;
					door.data = {room:a.index};
					room.addAsset(door);
				}
				else{
					requiredAssetsPlaced = false;
					break;
				}

			}

			// Failed to place required assets, continue
			if( !requiredAssetsPlaced )
				continue;

			// Todo: Place down required assets such as keys and levers
			if( !requiredAssetsPlaced )
				continue;

			
			// All required assets have been placed
			// Put down non-required stuff and stop trying to find a working template

			// Optional assets
			
			// Add props based on room size
			let numAssets = Math.ceil(Math.min(10,Math.ceil(room.getNumFreeTiles()/6))*(Math.random()*0.5+0.5));
			let usedAssets = {};
			for( let i =0; i<numAssets; ++i ){

				let asset = roomTemplate.props[Math.floor(Math.random()*roomTemplate.props.length)];
				if( !asset )
					break;

				// Limit to 3 same assets
				if( usedAssets[asset] > 2 )
					continue;

				if( room.placeAsset(asset) ){
				
					if(!usedAssets[asset])
						usedAssets[asset] = 0;
					++usedAssets[asset];

				}

			}

			// Add a tresure
			let containers = roomTemplate.containers;
			let chance = room.getParents().length*0.05;
			let mimicChance = Math.min(0.1, numChests*0.1);
			let treasureExists = false;
			if( containers.length && Math.random() < chance ){

				let path = containers[Math.floor(Math.random()*containers.length)];
				let chest = room.placeAsset(path);
				if( chest ){
					
					// Generate a mimic
					if( Math.random() < mimicChance ){

						chest.interactEncounter = new DungeonEncounter({
							startText : 'A mimic springs from the chest, grabbing hold of %T\'s ankles and pulling %Thim to the ground!',
							active : true,
							wrappers : [
								new Wrapper({
									label : 'legWrap',
									target: Wrapper.TARGET_AUTO,		// Auto is the person who started the encounter
									duration : 3,
									name : "Leg Wrap",
									icon : "daemon-pull.svg",
									description : "Knocked down on your %knockdown, tentacles spreading your legs",
									trigger_immediate : true,
									tags : [stdTag.wrLegsSpread],
									add_conditions : stdCond.concat([conditions.targetNotKnockedDown,conditions.targetNotBeast]), 
									stay_conditions : stdCond,
									effects : [
										new Effect({
											type : Effect.Types.knockdown,
											data: {
												type : Effect.KnockdownTypes.Back
											}
										}),
										"visAddTargTakeDamage"
									]
								})
							],
							players : [npcLib.mimic.generate(averageLevel)]
						}, chest);

					}
					else{

						treasureExists = true;

						let loot;

						// 25% chance of an item
						if( Math.random() < 0.25 ){
							// Generate a piece of loot
							loot = Asset.generate( 
								undefined, 	// Slot
								game.getAveragePlayerLevel(), 
								undefined, 	// Viable template
								undefined 	// Viable materials
							);
							if( loot )
								chest.loot.push(loot);
						}

						// 0-2 consumables, or 1-3 if no gear
						let numBonus = Math.round(Math.pow(Math.random(),3)*2);
						let numConsumables = numBonus+!loot;
						for( i=0; i<numConsumables; ++i ){
							let consumable = kit.getRandomConsumable();
							if( !consumable )
								break;
							chest.loot.push(consumable.clone(chest));
						}


					}

				}
				
			}


			// See if we need an encounter here
			// Todo: Allow encounters in the first room once the world map is in
			if( ~encounters.indexOf(room.index) && viableMonsters.length ){
				
				
				let difficulty = out.difficulty+Math.random()*0.5-0.25;	// difficulty plus/minus 0.25
				let encounter = room.encounter;
				encounter.wrappers = [];
				encounter.players = [];
				encounter.active = true;

				let dif = 0;
				while( dif < difficulty ){
					shuffle(viableMonsters);
					let success = false;
					for( let m of viableMonsters ){

						let mTemplate = npcLib[m];
						
						if( mTemplate.difficulty+dif < difficulty ){

							// Generate a player to push
							let pl = mTemplate.generate(averageLevel);
							pl._difficulty = mTemplate.difficulty;
							encounter.players.push(pl);
							dif += mTemplate.difficulty;
							success = true;
							break;
						}

					}
					
					if( !success )
						break;
				}

			}


			// This was a working template, so break here and let the loop resume to the next room
			if( treasureExists )
				++numChests;
			break;

		}

	}

	// Place down levers and lock some doors
	let numLevers = Math.round( out.rooms.length/4 );
	for( let i=0; i<numLevers; ++i ){
		// Let's lock a random door
		let room = out.rooms[Math.floor(Math.random()*out.rooms.length)];
		let rpl = room.getParents().length;

		// See if there are any viable doors in this room
		for( let asset of room.assets ){

			let found = false;
			if( 
				!asset.isDoor() || 						// Can only lock a door type asset
				asset.isExit() || 					// Can't look the entrance door
				asset.locked ||							// This door is already locked
				!asset.getModel().lockable ||			// This asset has no lock state
				asset.data.room === room.parent_index	// Can't lock the "back" door
			)continue;
				
			// Ok this door is valid. Let's find a room to place the lever in.
			let targetRooms = shuffle(out.rooms.slice());
			for( let tr of targetRooms ){
				// Need to put the switch in a room that has equal or lower amount of parents as this. And not the room itself.
				if( tr.index === room.index || tr.getParents().length > rpl )
					continue;

				// Todo: Viable switches should probably be added somewhere in the dungeon template
				let addedAsset = tr.placeAsset('Dungeon.Door.WallLever');
				if( addedAsset ){
					// Success
					addedAsset.type = DungeonRoomAsset.Types.Switch;		// Set the asset as a switch
					addedAsset.data = {asset:asset.id};						// Add the door target for the switch
					asset.locked = true;									// Set the door target to locked
					found = true;											// We successfully placed something in this room, stop seeking door assets
					break;
				}
				
			
			}

			// Continue adding levers
			if( found )
				break;

		}
		// The lever must be in a room that has the same or fewer number of parents than the room the lock was in
		

	}

	return out;

};



export {DungeonRoom,DungeonRoomAsset,DungeonEncounter};
export default Dungeon;