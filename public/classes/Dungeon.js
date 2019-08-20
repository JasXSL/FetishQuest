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
import PlayerTemplate from './templates/PlayerTemplate.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import Roleplay from './Roleplay.js';
import GameAction from './GameAction.js';
import Collection from './helpers/Collection.js';

//const always_chest = true;
const always_chest = false;

const interact_cooldowns = {};	// id:true etc

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
		this.difficulty = -1;		// Generally describes how many players this dungeon is for. -1 automatically sets it to nr friendly players
		this.vars = new Collection({}, this);				// Dungeon vars. This one is loaded onto by _state
		this.consumables = [
			'manaPotion', 'majorManaPotion',
			'minorHealingPotion', 'healingPotion', 'majorHealingPotion',
			'minorRepairKit', 'repairKit', 'majorRepairKit',
		];		// Copied over from template

		// Runtime vars
		this.transporting = false;	// Awaiting a room move

		// Custom cache which contains changes made to the dungeon. Host only
		this._state = null;	// Use getState()

		

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.rooms = DungeonRoom.loadThese(this.rooms, this);
		this.consumables = Asset.loadThese(this.consumables, this);
		this.vars = Collection.loadThis(this.vars);
	}

	save( full ){
		
		const vars = {};
		for( let i in this.vars )
			vars[i] = this.vars[i];

		let out = {
			name : this.name,
			tags : this.tags,
			rooms : this.rooms.map(el => {
				return el.save(full);
			}),
			difficulty : this.difficulty,
			vars : vars,
			label : this.label,	// Label is needed for dungeon state events
		};

		// Full or mod
		if( full ){
			out.depth = this.depth;
			out.height = this.height;
			out.shape = this.shape;
			out.consumables = Asset.saveThese(this.consumables, full);
			//if( full !== "mod" )
			//	out._state = this._state.save();
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

	loadState(){

		if( typeof window.game !== "object" || !game.is_host )
			return;

		this._state = game.state_dungeons[this.label] || null;

		if( this._state === null )
			return;
			
		for( let i in this._state.rooms ){
			const room = this.getRoomByIndex(this._state.rooms[i].index);
			if( room )
				room.loadState(this._state.rooms[i]);
		}

		for( let v in this._state.vars )
			this.vars[v] = this._state.vars[v];

	}

	getState(){
		if( !this._state ){
			this._state = game.state_dungeons[this.label];
			if( !this._state ){
				this.resetState();	// Creates a state and links it to game
			}
		}
		return this._state;
	}

	resetState(){
		this._state = new DungeonSaveState({}, this);
		game.state_dungeons.set(this.label, this._state);
	}

	setVar( key, val ){
		this.vars.set(key, val);
		const state = this.getState();
		state.vars.set(key, val);
		game.save();
	}


	getDifficulty(){
		
		if( this.difficulty === -1 )
			return Math.max(1, game.getTeamPlayers().length);
		return this.difficulty;

	}

	// Events
	onEntered(){
		this.getActiveRoom().onVisit();
	}


	/* ROOM */
	getActiveRoom(){
		const room = this.getRoomByIndex(this.active_room);
		if( room )
			return room;
		return this.rooms[0];
	}

	getRoomByIndex( index ){
		for( let room of this.rooms ){
			if( room.index === index )
				return room;
		}
		return false;
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
		if( this.getRoomByIndex(index) )
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



	// Returns viable encounters (1 per room, and 1 per asset max)
	getNumEncounters(){
		let out = 0;
		for( let room of this.rooms )
			out += room.getNumEncounters();
		return out;
	}



	/* Dungeon state */
	// saves asset state
	assetModified( asset ){
		this.getState().assetModified(asset);
	}

	roomModified(room){
		this.getState().roomModified(room);
	}

	// Does a shallow search for roleplays and resets them
	resetRoleplays(){
		for( let room of this.rooms )
			room.resetRoleplays();
	}


	/* EVENTS */
	// mesh is the actual THREE mesh, not the library entry
	// asset is a DungeonRoomAsset
	async assetClicked( player, room, asset, mesh ){

		if( interact_cooldowns[asset.id] ){
			return;
		}

		// If host doesn't have a player, they can use this
		if( !player && game.is_host )
			player = game.getTeamPlayers()[0];
		

		if( !game.getAlivePlayersInTeam(0).length ){
			game.modal.addError("Players are deeeeaaaad");
			return;
		}

		// Prevent non-leaders from interacting with doors unless we're offline or a battle is active (run)
		if( asset.isDoor() && !player.isLeader() && !game.battle_active ){
			game.modal.addError(player.name+" is not the party leader.");
			return;
		}

		if( player.team !== 0 ){
			game.modal.addError("Enemy characters can't interact with items.");
			return;
		}


		asset.interact( player, mesh );
		
	}

	// Tries to get a started encounter by id
	getStartedEncounterById(id){
		for( let room of this.rooms ){
			if( room.encounters.id === id )
				return room.encounters;
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



class DungeonSaveState extends Generic{
	constructor(data, parent){
		super(data);
		this.parent = parent;

		this.vars = new Collection({}, this);			// key : val - DungeonVars
		this.rooms = new Collection({}, this);			// index_(nr) : DungeonRoomSaveState

		this.load(data);
	}

	save( full ){
		const out = {
			vars : this.vars.save(full)
		};
		if( full )
			out.rooms = this.rooms.save();
		return out;
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.vars = new Collection(this.vars, this);
		this.rooms = new Collection(this.rooms, this);
		for( let r in this.rooms ){
			this.rooms[r] = new DungeonRoomSaveState(this.rooms[r], this);
		}
	}

	getOrCreateRoom(room){
		const n = 'index_'+room.index;
		if( !this.rooms[n] )
			this.rooms[n] = new DungeonRoomSaveState({index:room.index}, this);
		return this.rooms[n];
	}

	roomModified( room ){

		const sr = this.getOrCreateRoom(room);
		sr.discovered = room.discovered;

		if( room.encounters instanceof DungeonEncounter && room.encounters.id !== "_BLANK_" ){
			sr.encounter_complete = room.encounters.completed;
			sr.encounter_friendly = room.encounters.friendly;
			sr.encounter_respawn = room.encounters.respawn;
		}
		
	}

	assetModified( asset ){
		const room = this.getOrCreateRoom(asset.parent);
		room.assetModified(asset);
	}

}






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
		this.encounters = null;		// This is either an array of encounters ready to begin or a single encounter tha has begun. Picks the first viable encounter. Generally you just want one encounter that fits all. But this lets you do some crazy stuff with conditions.
									// Or a single encounter that has started.
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
			assets : DungeonRoomAsset.saveThese(this.assets, full),
			ambiance_volume : this.ambiance_volume,
			tags : this.tags,
			name : this.name,
			x : this.x,
			y : this.y,
			z : this.z,
			zoom : this.zoom,
			outdoors : this.outdoors,
			ambiance : this.ambiance,
			encounters : Array.isArray(this.encounters) ? DungeonEncounter.saveThese(this.encounters, full) : this.encounters.save(full),
			id : this.id,	// needed for modtools to work
		};


		// Stuff needed for everything except mod
		if( full !== 'mod' ){
			out.discovered = this.discovered;
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;
	}



	load(data){
		this.g_autoload(data);
	}


	loadState( state ){

		const respawn = ~state.encounter_complete && game.time-state.encounter_complete > state.encounter_respawn && state.encounter_respawn;

		// If encounter is complete, set it to completed
		if( state.encounter_complete !== -1 && state.encounter_complete && !respawn ){
			// Prevents overwriting encounter data when returning to a dungeon after you've left it (the encounter reverts to array)
			if( Array.isArray(this.encounters) )
				this.encounters = new DungeonEncounter({"id":"_BLANK_"}, this);
			this.encounters.completed = true;
		}

		if( state.encounter_friendly !== -1 && this.encounters instanceof DungeonEncounter && !respawn )
			this.encounters.friendly = state.encounter_friendly;

		if( state.discovered )
			this.discovered = true;

		for( let id in state.assets ){
			const asset = state.assets[id];
			let cur = this.getAssetById(id);
			
			if( !cur ){
				this.addAsset(new DungeonRoomAsset(asset, this), true);
				continue;
			}

			const respawnTime = asset._killed+cur.respawn;
			const curRespawn = !isNaN(respawnTime) && cur.respawn && game.time > respawnTime;
			if( curRespawn ){
				delete state.assets[id];
				continue;	// Don't load, it has expired. Let it stay the way it originally was.
			}
			cur.load(asset);
		}
		

	}

	getDungeon(){
		return this.parent;
	}

	rebase(){
		this.assets = DungeonRoomAsset.loadThese(this.assets, this);
		if( !this.encounters )
			this.encounters = [];
		this.encounters = Array.isArray(this.encounters) ? DungeonEncounter.loadThese(this.encounters, this) : new DungeonEncounter(this.encounters, this);
	}

	resetRoleplays(){
		let encounters = this.encounters;
		if( !Array.isArray(encounters) )
			encounters = [encounters];
		for( let encounter of encounters ){
			encounter.resetRoleplays();
		}
		for( let asset of this.assets ){
			asset.resetRoleplays();
		}
	}

	isEntrance(){
		return this === this.parent.rooms[0];
	}

	// Limits to 1 per room and 1 per asset
	getNumEncounters(){
		let out = DungeonEncounter.getFirstViable(this.encounters) ? 1 : 0;
		for( let asset of this.assets ){
			out += DungeonEncounter.getFirstViable(asset.getEncounters()) ? 1 : 0;
		}
		return out;
	}

	makeEncounterHostile( hostile = true ){
		if( this.encounters instanceof DungeonEncounter ){
			this.encounters.friendly = !hostile;
			this.onModified();
			game.save();
		}
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
			if( asset.isDoorLinkingTo( index ) )
				return asset;
		}
		return false;

	}
	
	getExitDoor(){
		for( let asset of this.assets ){
			if( asset.isExit() )
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
	addAsset( dungeonRoomAsset, generated = false ){

		this.assets.push(dungeonRoomAsset);
		dungeonRoomAsset.generated = generated;
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
	
	// Dungeon assets placed that are generated
	getGeneratedAssets(){
		
		const out = [];
		for( let asset of this.assets ){
			if( asset.generated )
				out.push(asset);
		}
		return out;

	}

	removeAsset( asset ){
		for( let i in this.assets ){
			if( this.assets[i] === asset ){
				this.assets.splice(i, 1);
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
	placeAsset( assetPath, generated = false ){

		let mesh = libMeshTools.getByString(assetPath);
		let bearing = Math.floor(Math.random()*4);
		if( mesh.no_rotation )
			bearing = undefined;

		let prop = new DungeonRoomAsset({
			model : assetPath,
			rotZ : bearing ? bearing*90 : 0,
		}, this);

		let positions = this.getFreeTilesForObject(prop, bearing, mesh.position_on_wall);
		let position = shuffle(positions).shift();
		if( position ){

			prop.x = position[0];
			prop.y = position[1];
			this.addAsset(prop, generated);
			return prop;

		}

		prop.onModified();
		return false;

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

		// First visit
		if( !this.discovered ){
			this.discovered = true;
			for( let asset of this.assets )
				asset.onRoomFirstVisit();
		}
		for( let asset of this.assets )
			asset.onRoomVisit();

		// Start a dummy encounter just to set the proper NPCs
		if( Array.isArray(this.encounters) && !this.encounters.length ){
			this.encounters = new DungeonEncounter({
				started : true,
				completed : true
			}, this);
		}

		// An encounter is already running
		if( !Array.isArray(this.encounters) )
			game.startEncounter(player, this.encounters);
		else{
			const viable = DungeonEncounter.getRandomViable(this.encounters);
			if( viable ){
				this.encounters = viable;	// Override templates with the active encounter
				game.startEncounter( player, viable );
			}
		}

		this.onModified();
	}


	onModified(){
		const dungeon = this.getDungeon();
		if( dungeon )
			dungeon.roomModified(this);
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

class DungeonRoomSaveState extends Generic{
	constructor(data, parent){
		super(data);
		this.parent = parent;

		this.index = 0;
		this.discovered = false;
		this.assets = new Collection({}, this);		// id : DungeonRoomAsset
		this.encounter_complete = -1;		// Time when encounter was completed
		this.encounter_friendly = -1;	
		this.encounter_respawn = 0;					// Respawn timer of the generated encounter
		
		this.load(data);
	}

	save(){
		return {
			id : this.id,
			index : this.index,
			assets : this.assets.save(true),	// Save full assets when changed
			discovered : this.discovered,
			encounter_complete : this.encounter_complete,
			encounter_friendly : this.encounter_friendly,
			encounter_respawn : this.encounter_respawn
		};
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.assets = Collection.loadThis(this.assets, this);
		for( let i in this.assets )
			this.assets[i] = DungeonRoomAsset.loadThis(this.assets[i], this.assets);
	}

	assetModified(asset){
		let existing = this.assets[asset.id];
		if( !existing ){
			this.assets[asset.id] = new DungeonRoomAsset({}, this.assets);
		}
		this.assets[asset.id].load(asset);
	}
}










/*
	Room assets store information about meshes to place in the dungeon
	It uses a tile based system (see top of page)
	It can contain loot and encounters when interacted with

*/
class DungeonRoomAsset extends Generic{

	constructor(data, parentObj){
		super(data);

		this.parent = parentObj;
		this.name = '';
		this.model = '';		// Use . notation and select a model from libMeshes
		this.generated = false;	// Whether this was generated through the game or modified.
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
		this.attachments = [];			// Indexes of attachments available in new LibMesh().attachments
		this.interact_cooldown = 1000;	// ms between how often you can interact with this 
		this._model = null;				// Generic mesh model
		this._stage_mesh = null;		// Mesh tied to this object in the current scene

		this.tags = [];
		this.absolute = false;			// Makes X/Y/Z absolute coordinates
		this.room = false;				// This is the room asset
		this.interactions = [];			// Game actions to trigger when interacted with
		this.hide_no_interact = false;	// Hide whenever it's not interactive.
		this.deleted = false;			// Deleted
		this._interactive = null;		// Cache of if this object is interactive
		
		this.respawn = 0;					// Time in seconds before it respawns
		this._killed = 0;

		this.load(data);

	}

	getViableInteractions( player, debug = false ){
		if( !player && window.game )
			player = game.getMyActivePlayer();
		if( !player && window.game )
			player = game.players[0];
		return GameAction.getViable(this.interactions, player, debug);
	}

	isLocked(){
		return !this.getViableInteractions().length;
	}

	save( full ){
		const out = {
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
			attachments : this.attachments,
			tags : this.tags,
			absolute : this.absolute,
			name : this.name,
			room : this.room,
			interactions : GameAction.saveThese(this.interactions, full),
			hide_no_interact: this.hide_no_interact,
			id : this.id,
		};
		if( full !== 'mod' ){
			if( full )
				out._killed = this._killed;
		}	
		else{
			this.g_sanitizeDefaults(out);
		}
		if( full ){
			out.respawn = this.respawn;
		}
		return out;
	}


	// returns the first door interaction
	getDoorInteraction(){
		const viable = window.game ? this.getViableInteractions() : this.interactions;
		for( let i of viable ){
			if( i.type === GameAction.types.door )
				return i;
		}
	}

	getTooltipInteraction(){
		const viable = window.game ? this.getViableInteractions() : this.interactions;
		for( let action of viable ){
			if( action.type === GameAction.types.tooltip )
				return action;
		}
	}

	// Sleep display is clientside
	getSleepInteraction(){
		const viable = window.game ? this.getViableInteractions() : this.interactions;
		for( let action of viable ){
			if( action.type === GameAction.types.sleep )
				return action;
		}
	}


	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.interactions = GameAction.loadThese(this.interactions, this);
	}


	getDungeon(){
		return this.parent.parent;
	}
	


	// Events
	// Room this exists in has been visited the first time
	onRoomFirstVisit(){}
	onRoomVisit(){
		for( let asset of this.interactions )
			asset.convertToLoot();
	}

	// Need to save state if modified
	onModified(){
		if( !this._killed )
			this._killed = game.time;	// Set time of first modification for respawn
		const dungeon = this.getDungeon();
		if( dungeon ){
			dungeon.assetModified(this);
		}
	}

	/* Type checking */
	isDoor(){
		return ( this.getDoorTarget() !== false || this.isExit() );
	}

	// returns the index
	getDoorTarget(){

		const interaction = this.getDoorInteraction();
		if( !interaction )
			return false;

		return interaction.data.index;

	}

	isExit(){
		for( let i of this.interactions ){
			if( i.type === GameAction.types.exit )
				return true;
		}
		return false;
	}

	isRoom(){
		return this.room;
	}

	isInteractive(){

		// mod editor
		if( !window.game )
			return false;

		for( let i of this.interactions ){
			if( !i.validate )
				console.error("Found invalid interaction", i, "in", this);
			if( i.validate(game.getMyActivePlayer() || game.players[0]) )
				return true;
		}
		return false;
	}

	isDoorLinkingTo( index ){
		return this.getDoorTarget() === index;
	}

	hasActiveEncounter(){
		for( let i of this.interactions ){
			if( i.type === GameAction.types.encounters && i.validate() )
				return true;
		}
	}

	



	/* Encounters */
	getEncounters(){
		let encounters = [];
		for( let i of this.interactions ){
			if( i.type === GameAction.types.encounters && i.validate() ){
				encounters = encounters.concat(DungeonEncounter.loadThese(i.data));
			}
		}
		return encounters;
	}
	getAllRoleplayGameActions(){
		const out = [];
		for( let i of this.interactions ){
			if( i.type === GameAction.types.roleplay )
				out.push(i);
		}
		return out;
	}


	resetRoleplays(){
		let enc = this.getAllRoleplayGameActions();
		for( let ga of enc ){
			const rp = ga.getDataAsRoleplay();
			game.wipeRPState(rp.label);
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
				console.error("Mesh not found", this.model, "in", this);
				return false;
			}
		}
		return mesh;
	}

	setStageMesh( c ){
		this._stage_mesh = c;
		let tags = {};
		const all = this.tags.concat(c.userData.template.tags);
		for( let t of all )
			tags[t] = true;
		this.tags = Object.keys(tags);
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
	isLootable(){
		return this.getLootableAssets().length;
	}

	// returns loot that can be accessed
	getLootableAssets(){
		const viable = this.getViableInteractions();
		let out = [];
		for( let v of viable ){
			if( v.type === GameAction.types.loot )
				out = out.concat(v.data);
		}
		return out.map(el => new Asset(el, this));
	}

	getLootById( id ){
		const lootable = this.getLootableAssets();
		for( let item of lootable ){
			if( item.id === id )
				return new Asset(item, this);
		}
		return false;
	}

	remLootById( id ){
		const viable = this.getViableInteractions();
		for( let v of viable ){
			if( v.type === GameAction.types.loot ){
				for( let i in v.data ){
					if( v.data[i].id === id ){
						v.data.splice(i, 1);
						if( !v.data.length )
							v.remove();
						return true;
					}
				}
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
		asset.restore();
		if( player.addAsset(asset) )
			this.remLootById(id);


		game.ui.addText( player.getColoredName()+" looted "+asset.name+".", undefined, player.id,  player.id, 'statMessage important' );
		game.renderer.drawActiveRoom();		// Forces a room refresh
		this.onModified();
		game.save();
		game.ui.draw();

	}





	/* Interactions */
	// Checks if this object is no longer interactive, in which case it sets animation idle_opened and removes click handlers
	updateInteractivity(){

		if( !this._stage_mesh )
			return;

		if( !this._stage_mesh.userData )
			return;

		const pre = this._interactive;
		this._interactive = this.isInteractive();
		if( this._interactive !== pre && this._stage_mesh.userData.template )
			this._stage_mesh.userData.template.onInteractivityChange(this, this._interactive);

		if( this._interactive )
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
		clearTimeout(interact_cooldowns[this.id]);
		interact_cooldowns[this.id] = setTimeout(() => { 
			delete interact_cooldowns[this.id];
		}, ms);
	}

	// Primarily for levers, but might make sense in other places
	// Returns the first dvar condition, or undefined if not found
	getFirstDvar(){
		for( let i of this.interactions ){
			if( i.type === GameAction.types.dungeonVar || i.type === GameAction.types.lever ){
				return this.getDungeon().vars[i.data.id];
			}
		}
	}

	interact( player, mesh ){

		const asset = this;
		const dungeon = this.getDungeon();
		const lootable = asset.isLootable( player, mesh ),
			isSleep = asset.getSleepInteraction();

		if( dungeon && dungeon.transporting )
			return false;

		// Helper function for interact action
		function raiseInteractOnMesh( shared = true ){
			if( mesh.userData.template.onInteract ){
				mesh.userData.template.onInteract.call(mesh.userData.template, mesh, mesh.parent, asset);
				if( game.is_host && shared )
					game.net.dmRaiseInteractOnMesh( asset.id );
			}
		}
		if( asset.isLocked() )
			return game.modal.addError("Locked");

		if( game.isInPersistentRoleplay() )
			return game.modal.addError("Can't use items right now");


		// Ask host unless this is lootable
		if( !game.is_host && !lootable && !isSleep ){
			game.net.playerInteractWithAsset( player, asset );
			return;
		}


		raiseInteractOnMesh( !lootable );



		// Custom logic for if battle is active
		if( game.battle_active ){

			
			if( asset.isDoor() && asset.getDoorTarget() === dungeon.previous_room ){
				
				if( !game.turnPlayerIsMe() ){
					console.error("not your turn error", player, mesh);
					return game.modal.addError("Not your turn");
				}
				let player = game.getTurnPlayer();
				game.modal.close();
				game.useActionOnTarget( player.getActionByLabel('stdEscape'), [player], player );
				return;
			}

			game.modal.addError("Battle in progress");
			return;

		}

		// Trigger interactions in order
		for( let i of this.interactions ){

			if( i !== -1 && i < 1 )
				continue;

			let valid = i.validate(player);
			if( valid )
				i.trigger( player, mesh );

			if( (i.break === "success" && valid) || (i.break === "fail" && !valid) )
				break;

		}

		if( this.interact_cooldown )
			this.setInteractCooldown(this.interact_cooldown);

	}

	getInteractionById( id ){
		for( let i of this.interactions ){
			if( i.id === id )
				return i;
		}
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






/*
	An encounter starts a battle
	It has players and can have wrappers applied when it starts

*/
class DungeonEncounter extends Generic{

	constructor(data, parent){
		super(data);

		this.parent = parent;		// Parent varies, but usually trickles up to a quest or game
		this.label = '';
		this.friendly = false;		// Don't start a battle when starting this encounter
		this.started = false;		// Encounter has started (only set on Game clone of this)
		this.completed = 0;			// Encounter completed (only set on Game clone of this)
		this.players = [];			// Players that MUST be in this event. On encounter start, this may be filled with player_templates to satisfy difficulty
		this.player_templates = [];		// 
		this.player_conditions = new Collection({}, this);	// {id:(arr)conditions}
		this.wrappers = [];			// Wrappers to apply when starting the encounter. auto target is the player that started the encounter
		this.passives = [];			// Use add_conditions to filter out the player(s) the passive should affect
		this.startText = '';		// Text to trigger when starting
		this.conditions = [];
		this.game_actions = [];		// Game actions to run when the encounter starts
		this.time_completed = 0;
		this.respawn = 0;			// Time to respawn

		this.load(data);
	}

	prepare( difficulty ){

		if( !difficulty ){

			const dungeon = this.getDungeon();
			if( dungeon )
				difficulty = dungeon.getDifficulty();
			else
				difficulty = game.getTeamPlayers().length;

		}

		if( this.started )
			return;

		// Run before an encounter is launched. If we're using templates, we should generate the NPCs here
		difficulty = difficulty+Math.random()*0.25;

		let viableMonsters = [];
		// if there are no viable monsters, go with the first one. Todo: Improve this
		let templateMonster = this.player_templates[0];	

		// This encounter has players
		if( templateMonster ){

			const level = game.getAveragePlayerLevel();
			
			for( let p of this.player_templates ){
				if( p.min_level <= level && p.max_level >= level  )
					viableMonsters.push(p);
			}
			if( !viableMonsters.length )
				viableMonsters.push(templateMonster);

			// This could be provided at runtime instead
			let dif = 0;
			while( dif < difficulty && this.players.length < 6 ){

				shuffle(viableMonsters);
				let success = false;
				for( let mTemplate of viableMonsters ){

					// Generate a player to push
					const pl = mTemplate.generate(
						Math.min(mTemplate.max_level, Math.max(level, mTemplate.min_level))
					);
					
					if( mTemplate.difficulty+dif < difficulty ){

						this.players.push(pl);
						dif += mTemplate.difficulty*(mTemplate.powered ? game.getTeamPlayers() : 1);
						success = true;
						break;

					}

				}
				
				if( !success ){
					// make sure there's at least one enemy
					break;
				}

			}

			if( !this.players.length ){
				const mTemplate = viableMonsters[0];
				const pl = mTemplate.generate(
					Math.min(mTemplate.max_level, Math.max(level, mTemplate.min_level))
				);
				this.players.push(pl);
			}


		}	

		for( let player of this.players ){
			player.g_resetID();
		}

	}

	// Whenever the encounter is placed in world, regardless of if it just started or not
	// This is always triggered after the encounter starts, otherwise player effects won't work (since they need game.players populated)
	// If just_started is true, it means the encounter just started
	onPlacedInWorld( just_started = true ){

		// Toggle hide/show of players
		for( let i in this.player_conditions ){
			const pl = this.getPlayerByLabel(i);
			if( !pl )
				continue;
			pl.disabled = !Condition.all(this.player_conditions[i], new GameEvent({target:pl, sender:pl}));
		}

		for( let wrapper of this.passives )
			wrapper.bindEvents();

		// Don't reset HP and such
		if( !just_started )
			return;
		// Run world placement event on all players
		for( let player of this.players )
			player.onPlacedInWorld();
	}

	onRemoved(){
		for( let wrapper of this.passives )
			wrapper.unbindEvents();
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.players = Player.loadThese(this.players, this);
		this.wrappers = Wrapper.loadThese(this.wrappers, this);
		this.passives = Wrapper.loadThese(this.passives, this);
		this.player_templates = PlayerTemplate.loadThese(this.player_templates, this);
		this.conditions = Condition.loadThese(this.conditions, this);
		this.game_actions = GameAction.loadThese(this.game_actions, this);
		this.player_conditions = Collection.loadThis(this.player_conditions, this);
		for( let i in this.player_conditions ){
			this.player_conditions[i] = Condition.loadThese(this.player_conditions[i], this);
		}
	}

	save( full ){
		const out = {};
		if( full ){
			out.startText = this.startText;
			out.wrappers = this.wrappers.map(el => el.save(full));
			out.players = this.players.map(el => el.save(full));
			out.label = this.label;
			out.player_templates = PlayerTemplate.saveThese(this.player_templates, full);
			out.conditions = Condition.saveThese(this.conditions, full);
			out.respawn = this.respawn;
		}
		out.friendly = this.friendly;
		out.game_actions = GameAction.saveThese(this.game_actions, full);
		out.passives = this.passives.map(el => el.save(full));
		out.player_conditions = this.player_conditions.save(full);
		
		if( full !== "mod" ){
			out.id = this.id;
			out.completed = this.completed;
			out.started = this.started;
		}
		else
			this.g_sanitizeDefaults(out);

		// Not really gonna need a full because these are never output to webplayers
		return out;
	}
	
	validate( event ){

		if( !event )
			event = new GameEvent({});
		return Condition.all(this.conditions, event);

	}

	// Takes a player object
	getPassivesForPlayer( player ){
		const out = [];
		if( !(player instanceof Player) ){
			console.error("Trying to get passives for non player", player);
			return out;
		}
		for( let passive of this.passives ){
			if( passive.testAgainst(new GameEvent({sender:player, target:player})) )
				out.push(passive);
		}
		return out;
	}

	getEnemies(){
		return this.players.filter(pl => pl.team !== 0);
	}

	getDungeon(){
		let parent = this.parent;
		if( !parent )
			return false;
		while( !(parent instanceof Dungeon) && parent.parent )
			parent = parent.parent;
		if( parent instanceof Dungeon )
			return parent;
		return false;
	}

	getRoom(){
		let parent = this.parent;
		if( !parent )
			return false;
		while( !(parent instanceof DungeonRoom) && parent.parent )
			parent = parent.parent;
		if( parent instanceof DungeonRoom )
			return parent;
		return false;
	}

	getPlayerById( id ){
		for( let player of this.players ){
			if( player.id === id )
				return player;
		}
		return false;
	}

	getPlayerByLabel( label ){
		for( let player of this.players ){
			if( player.label === label )
				return player;
		}
	}

	// Helper function for below
	getViableActions( targetPlayer ){
		return GameAction.getViable(this.game_actions, targetPlayer, false, false);
	}

	// Gets roleplay ACTIONs
	getRoleplays( player, validate = true ){

		const actions = this.getViableActions();
		return actions.filter(action => {

			if( action.type !== GameAction.types.roleplay )
				return false;
			const rp = action.getDataAsRoleplay();
			if( !rp )
				return false;
			if( !validate )
				return true;
			return rp.validate(player);

		});

	}

	// Gets shop ACTIONs
	getShops(){
		const actions = this.getViableActions();
		return actions.filter(action => {

			if( action.type !== GameAction.types.shop )
				return false;
			const shop = action.getDataAsShop();
			if( !shop )
				return false;
			return true;
		});
	}

	// Gets repairshop actions
	getSmiths( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.repairShop);
	}

	// Gets room rental players
	getRenters( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.rentRoom);
	}

	resetRoleplays(){
		const actions = this.getRoleplays(undefined, false);
		for( let action of actions ){
			const rp = action.getDataAsRoleplay();
			game.wipeRPState(rp.label);
		}
	}

	setCompleted( completed = true ){
		
		if( Boolean(this.completed) === Boolean(completed) )
			return;
		
		this.completed = completed;
		if( this.completed === true )
			this.completed = game.time;
		const dungeon = this.getDungeon(), room = this.getRoom();
		if( room && dungeon )
			dungeon.roomModified(room);
	}

}

// Gets the first viable encounter
DungeonEncounter.getFirstViable = function( arr, event ){
	
	if( !arr.length )
		return false;

	// Prefer one with a proper level range
	const level = game.getAveragePlayerLevel();
	let valid = arr.filter(el => {
		if( !Array.isArray(el.player_templates) )
			console.error("El player templates is not an array, arr was:", arr, "el was", el);
		for( let pt of el.player_templates ){
			if( pt.min_level <= level && pt.max_level >= level )
				return true;
		}
	});
	// None in level range. Allow all D:

	if( !valid.length ){
		valid = arr;
		console.debug("Note: No monsters in level range for in encounter list", arr, "allowing all through");
	}

	for( let enc of valid ){
		if( enc.validate(event) ){
			enc.g_resetID();
			return enc.clone(enc.parent);
		}
	}
	return false;

};
DungeonEncounter.getRandomViable = function( arr, event ){
	const entries = arr.slice();
	shuffle(entries);
	return this.getFirstViable(entries, event);
};





/* STATIC CONTENT */


// Procedural dungeon generator
// In a SemiLinear one, the room number is multiplied by 1.5, 50% being the side rooms
Dungeon.generate = function( numRooms, kit, settings ){

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

	out.consumables = kit.consumables.slice();

	// Add encounters
	let i = 0;
	let encounters = out.rooms.map(() => ++i);
	encounters.shift();	// First room can never be
	shuffle(encounters);
	
	// Between 40% and 60% of all rooms can have encounters
	let numEncounters = Math.ceil(out.rooms.length*(0.4+Math.random()*0.2));
	encounters = encounters.slice(0, numEncounters);

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
				room : true
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
					y : -1,
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

					let adata = {index:a.index};
					// Exit to the bounty board where we accepted the quest
					if( a.index === -1 ){
						adata = {dungeon:game.dungeon.label, index:game.dungeon.active_room};
					}
					let action = new GameAction({
						type : a.index === -1 ? GameAction.types.exit : GameAction.types.door,
						data : adata,
						break : "fail"
					}, door);
					door.interactions.push(action);
					
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
			let mimicChance = Math.min(0.5, numChests*0.1);
			let treasureExists = false;
			if( containers.length && (Math.random() < chance || always_chest) ){

				let path = containers[Math.floor(Math.random()*containers.length)];
				let chest = room.placeAsset(path);
				if( chest ){
					
					// Generate a mimic
					if( Math.random() < mimicChance ){

						let encounter = new GameAction({
							type : GameAction.types.encounters,
							data : ['mimic']
						}, chest);
						chest.interactions.push(encounter);

					}
					else{

						treasureExists = true;
						let lootValue = Math.pow(Math.random(), 2);	// Assuming gear starts at 0.5, it's a 30% chance of an item
						let action = new GameAction({
							type : GameAction.types.autoLoot,
							data : {val:lootValue}
						}, chest);
						
						chest.interactions.push(action);

					}

				}
				
			}

			// See if we need an encounter here
			if( ~encounters.indexOf(room.index) )
				room.encounters = clone(kit.encounters, room);
				
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
				asset.isLocked() ||							// This door is already locked
				!asset.getModel().lockable ||			// This asset has no lock state
				asset.getDoorTarget() === room.parent_index	// Can't lock the "back" door
			)continue;
				
			// Ok this door is valid. Let's find a room to place the lever in.
			let targetRooms = shuffle(out.rooms.slice());
			for( let tr of targetRooms ){

				// Need to put the switch in a room that has equal or lower amount of parents as this. And not the room itself.
				if( tr.index === room.index || tr.getParents().length > rpl )
					continue;

				let addedAsset = tr.placeAsset('Dungeon.Door.WallLever');
				if( addedAsset ){

					const id = 'lever_'+asset.id.substr(0,8);
					// Build the condition saying the lever is down
					const doorInteraction = asset.getDoorInteraction();
					const cond = new Condition({
						type : Condition.Types.dungeonVar,
						data : {
							id : id,
							data : true
						}
					}, doorInteraction);

					out.vars[id] = false;


					// Success
					addedAsset.interactions.push(
						new GameAction({
							type : GameAction.types.lever,
							data : {id:id}
						}, addedAsset),
					);
					
					doorInteraction.break = "fail";
					doorInteraction.conditions.push(cond);

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



export {DungeonRoom,DungeonRoomAsset,DungeonEncounter,DungeonSaveState};
export default Dungeon;