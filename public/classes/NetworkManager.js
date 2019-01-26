import Game from './Game.js';
import GameEvent from './GameEvent.js';
import { AudioKit } from './Audio.js';

class NetworkManager{

	// Parent is game
	constructor(parent){
		
		this.debug = false;
		this.parent = parent;
		this.io = null;
		this.id = null;
		this.public_id = null;
		this.players = [];			// {id:id, name:name}
		this._last_push = null;
		this._pre_push_time = 0;		// Time of last push
		this.timer_reconnect = null;
		
		// This is for debugging purposes
		setTimeout(() => {
			this._last_push = parent.getSaveData();
		}, 100);

	}

	destructor(){
		if( this.io )
			this.io.disconnect();
	}

	// Connect to the server
	connect(){

		if( this.io )
			return true;
		
		this.io = io();

		// Connection event
		this.io.on('connect', () => {
			console.log("Server connection established");
			clearTimeout(this.timer_reconnect);
		});

		// Host left
		this.io.on('hostLeft', () => {
			console.log("Host left the game");
			this.disconnect();
		});

		// Player left
		this.io.on('playerLeft', data => {
			for( let i in this.players ){
				if( this.players[i].id === data.id ){
					game.ui.addText( this.players[i].name+" has left the game.", undefined, undefined, undefined, 'dmInternal' );
					this.players.splice(i, 1);
				}
			}
			game.ui.draw();
		});

		// Player joined
		this.io.on('playerJoined', data => {

			console.log("A player joined the game", data.id, data.name, data.players);
			
			this.players = data.players;

			// Try mapping up the players by name if possible
			if( game.is_host ){
				for( let player of game.players ){
					if( 
						player.netgame_owner_name === data.name && 			// Owned by this name
						!this.getPlayerNameById(player.netgame_owner)		// Original owner id not present
					)player.netgame_owner = data.id;
				}
			}

			game.ui.draw();

			// This wasn't me who joined
			if( data.id !== this.id && game.is_host ){
				this.dmSendFullGame(data.id);
			}
			game.ui.addText( data.name+" has joined the game.", undefined, undefined, undefined, 'dmInternal' );
			this.attempts = 0;

		});

		// Disconnected from server
		this.io.on('disconnect', async data => {

			if( !game.is_host && this.public_id){

				console.log("Disconnected, trying to reconnect...");
				this.joinGame(this.public_id, localStorage.netgameName);
				clearTimeout(this.timer_reconnect);
				this.timer_reconnect = setTimeout(() => {
					console.log("Reconnect failed");
					this.disconnect();
				}, 10000);
				return;

			}


			this.disconnect();
			
		});

		// Game IO
		// Main inputs
		this.io.on('playerTask', data => this.onPlayerTask(data));
		this.io.on('gameUpdate', data => this.onGameUpdate(data));
		this.io.on('dmTask', data => this.onDMTask(data));
		
		// Received a netgame player ID
		return new Promise(res => {
			this.io.on('_id_', id => {
				this.id = id;
				console.log("ID set to ", this.id);
				res();
			});
		});

	}

	// Are we connected?
	isConnected(){
		return !!this.io;
	}

	// Disconnects entirely
	async disconnect(){

		if( !this.io )
			return;

		clearTimeout(this.timer_reconnect);
		
		
		this.public_id = null;
		this.id = null;
		this.players = [];
		this.io.disconnect();
		this.io = null;

		if( !game.is_host )
			await Game.load();
		game.ui.drawMainMenu();
		game.ui.draw();

	}

	// hosts your currently loaded game
	async hostGame(){

		if( !this.io )
			await this.connect();

		if( !this.parent.is_host ){
			game.modal.addError('You are not the host of this game');
			return false;
		}

		return new Promise(res => {
			this.io.emit('host', '', id => {
				if( id ){
					this.public_id = id;
					this._last_push = game.getSaveData();
				}
				else
					game.modal.addError("Attempt to host failed");
				res();
			});
		});

	}

	// Joins a game
	async joinGame( id, name ){

		if( typeof name !== "string" || !name.trim().length )
			return;

		name = name.trim();
		
		this.setStandardNick(name);

		this.public_id = id;

		try{
			await this.connect();
		}catch(err){
			console.error("Connection failed", err);
			return false;
		}

		if( !this.io )
			return;

		return new Promise(res => {
			this.io.emit('join', {room:id, name:name}, success => {
				if( success ){
					game.modal.addNotice("You have joined the game");
					this.attempts = 0;
					Game.joinNetGame();
				}
				else{
					game.modal.addError("Failed to join a game");
					this.disconnect();
				}
				res();
			});
		});

	}







	/* STANDARD OUTPUT */
	// Send a message to the DM
	sendPlayerAction(task, data){
		if( game.is_host || !this.isConnected() )
			return;
		this.io.emit('playerTask', {
			task : task,
			data : data
		});
	}

	// Lets DMs send fragments of game data
	// This is also used internally for modal updates
	sendGameUpdate(){
		
		if( !game.is_host )
			return;

		// Auto
		const current = game.getSaveData();
		const changes = DeepDiff.diff(this._last_push, current);
		if( !changes )
			return;

		this._last_push = current;
		game.modal.onGameUpdate(changes);
		if( this.isConnected() && game.is_host ){
			const now = Date.now();
			this.io.emit('gameUpdate', {ch:changes,ts:this._pre_push_time,now:now});
			this._pre_push_time = now;
		}

	}

	// Lets you purge an object of indexes, such as [["dungeon","rooms",0], ["dungeon","rooms",1]]
	purgeFromLastPush( ...indexes ){
		if( !this._last_push )
			return;
		let getPathObj = p => {
			let base = this._last_push;
			if( typeof base !== "object" )
				return false;
			let sh = p.slice();
			sh.pop();
			for( let s of sh ){
				if( !base[s] || !base.hasOwnProperty(s) )
					return false;
				base = base[s];
			}
			return false;
		}
		for( let index of indexes ){
			let obj = getPathObj(index);
			if( !obj )
				continue;
			delete obj[index.pop()];
		}

	}
	
	// Lets DMs send custom tasks to players
	sendHostTaskTo( id, task, data ){
		if( !this.isConnected() || !game.is_host )
			return;
		this.io.emit('dmTask', {
			player : id,
			task : task,
			data : data
		});
	}

	// Sends a task from host to everyone
	sendHostTask(task, data){
		if( !game.is_host || !this.isConnected() )
			return;
		this.io.emit('dmTask', {
			task : task,
			data : data
		});
	}


	/* PLAYER MANAGEMENT */
	// Gets the name of a network manager player
	getPlayerNameById(id){
		for( let player of this.players ){
			if( player.id === id )
				return player.name;
		}
		return '';
	}

	// Gets a localStorage netgame alias if present
	getStandardNick(){
		let nick = localStorage.netgameName || "";
		return nick.trim();
	}

	// Stores your netgame alias in localstorage
	setStandardNick(name){
		localStorage.netgameName = name.trim();
	}


	




	/* INPUT EVENT */

	// PLAYER -> DM
	onPlayerTask(data){

		let PT = NetworkManager.playerTasks,
			th = this,
			netPlayer = data.player
		;
		if( this.debug )
			console.log("PlayerTask", data);
		if( !game.is_host || typeof data !== "object" )
			return;

		data = data.data;
		if( typeof data !== "object" || !data.task )
			return;
		let task = data.task, args = data.data;
		if( typeof args !== "object" )
			args = {};

		function respondWithError( error ){
			th.sendHostTaskTo(netPlayer, NetworkManager.dmTasks.error, {
				txt : error
			});
			return false;
		}

		// Helper function that validates the player and returns it
		// Depends on the player UUID being under args.player
		function validatePlayer(){

			let player = game.getPlayerById(args.player);
			if(!player)
				return respondWithError('Player not found');
			if(player.netgame_owner !== netPlayer)
				return respondWithError('Player not owned by you');
			return player;

		}

		

		// Equip or unequip gear
		if( args && task === PT.toggleGear && typeof args.player === "string" && typeof args.item === "string" ){

			let player = validatePlayer();
			if( !player )
				return;

			game.equipPlayerItem( player, args.item );
			game.ui.draw();

		}

		if( task === PT.getFullGame ){
			this.dmSendFullGame(netPlayer);
		}

		// Use an action (spell)
		if( args && task === PT.useAction && Array.isArray(args.targets) ){

			let player = validatePlayer();
			if( !player )
				return;
			let spell = player.getActionById(args.action),
				targs = args.targets.map(t => game.getPlayerById(t)).filter(t => !!t)
			;
			if( !spell )
				return game.modal.addError("Action not found", args.action);
			game.useActionOnTarget(spell, targs, player, netPlayer);
		}

		// Chat
		if( args && task === PT.speak && typeof args.player === "string" && typeof args.text === "string" ){

			let p = args.player, txt = args.text, pl = game.getPlayerById(p);

			let isOOC = p === 'ooc';
			if( !isOOC && pl.netgame_owner !== netPlayer )
				return console.error("Player not found or not owned by sender");
			if( isOOC )
				p = this.getPlayerNameById(netPlayer);
			
			game.speakAs(p, txt, isOOC);

		}

		if( task === PT.interact ){

			let player = validatePlayer();
			if( !player )
				return;
			let room = game.dungeon.getActiveRoom(),
				asset = room.getAssetById(args.dungeonAsset)
			;
			if( !asset )
				return respondWithError("Interacted asset not found in room", args.dungeonAsset);

			game.dungeon.assetClicked( player, room, asset, asset._stage_mesh );

		}

		if( task === PT.loot ){
			let player = validatePlayer();
			if( !player )
				return;

			let room = game.dungeon.getActiveRoom(),
				dungeonAsset = room.getAssetById(args.dungeonAsset)
			;
			if( !dungeonAsset )
				return respondWithError("Interacted asset not found in room");
			
			let asset = dungeonAsset.getLootById(args.item);
			if( !asset )
				return respondWithError("Item not found in container");
			
			dungeonAsset.lootToPlayer( asset.id, player );
		}

		// Repair an item
		else if( task === PT.useRepairAsset ){

			let player = validatePlayer();
			if( !player )
				return;
			let targ = game.getPlayerById(args.target);
			if( !targ )
				return respondWithError('Target not found');

			game.useRepairAsset( player, targ, args.repairKit, args.asset)
			
		}


	}

	// DM -> PLAYER
	onDMTask(data){
		if( game.is_host || typeof data !== "object" || !data.task )
			return;
		if( this.debug )
			console.log("DM Task received", data);

		let task = data.task, args = data.data;

		// Load the full game
		if( task === NetworkManager.dmTasks.sendFullGame ){
			game.ui.destructor();
			game.load(args);
			game.renderer.drawActiveRoom();
		}

		// Visual effect
		else if( task === NetworkManager.dmTasks.sendVisual ){

			if( args && args.player && args.fx )
				game.ui.setPlayerVisual(args.player, args.fx);

		}

		// Add a text
		else if( task === NetworkManager.dmTasks.sendText ){

			if( typeof args === "object" )
				game.ui.addText(args.text, args.evtType, args.attackerID, args.targetID, args.acn, true);

		}

		else if( task === NetworkManager.dmTasks.error && args && args.txt ){
			game.modal.addError(args.txt, args.notice);
		}

		else if( task === NetworkManager.dmTasks.animation ){

			let room = game.dungeon.getActiveRoom(),
				dungeonAsset = room.getAssetById(args.dungeonAsset)
			;
			if( dungeonAsset && dungeonAsset._stage_mesh && dungeonAsset._stage_mesh.userData.playAnimation )
				dungeonAsset._stage_mesh.userData.playAnimation(args.animation);

		}

		// Draw repair selector
		else if( task === NetworkManager.dmTasks.drawRepair ){

			let player = game.getPlayerById(args.player),
				target = game.getPlayerById(args.target)
			;
			if( !player || !target )
				return;
			let action = player.getActionById(args.action);
			if( !action )
				return;
			game.ui.drawRepair( player, target, action );

		}
		
		else if( task === NetworkManager.dmTasks.playSoundOnPlayer ){

			if( typeof args === "object" )
				game.playFxAudioKit(
					new AudioKit(args.kit),
					game.getPlayerById(args.sender), 
					game.getPlayerById(args.target), 
					args.armor_slot
				);
		}
		else if( task === NetworkManager.dmTasks.playSoundOnMesh ){

			// {dungeonAsset:(str)mesh_uuid, url:(str)sound_url, volume:(float)volume, loop:(bool)loop[, id:(str)optional_id]}
			let room = game.dungeon.getActiveRoom(),
				dungeonAsset = room.getAssetById(args.dungeonAsset)
			;
			if( dungeonAsset && dungeonAsset._stage_mesh )
				game.renderer.stage.playSound( dungeonAsset._stage_mesh, args.url, args.volume, args.loop, args.id);

		}

		else if( task === NetworkManager.dmTasks.raiseInteractOnMesh ){
			if( args && args.dungeonAsset ){
				let room = game.dungeon.getActiveRoom(),
				dungeonAsset = room.getAssetById(args.dungeonAsset);
				if( 
					dungeonAsset && 
					dungeonAsset._stage_mesh && 
					dungeonAsset._stage_mesh.userData.template &&
					dungeonAsset._stage_mesh.userData.template.onInteract 
				){
					let template = dungeonAsset._stage_mesh.userData.template;
					template.onInteract.call(template, dungeonAsset._stage_mesh, room, dungeonAsset);
				}
			}
		}

		else if( task === NetworkManager.dmTasks.stopSoundOnMesh ){
			// {dungeonAsset:(str)dungeonAsset_uuid, id:(str)url/id, fade:(int)fadeMS}
			let room = game.dungeon.getActiveRoom(),
				dungeonAsset = room.getAssetById(args.dungeonAsset)
			;
			if( dungeonAsset && dungeonAsset._stage_mesh )
				game.renderer.stage.stopSound( dungeonAsset._stage_mesh, args.id, args.fade );

		}

		// Quest completed event
		else if( task === NetworkManager.dmTasks.questCompleted && args )
			game.onQuestCompleted(game.getQuestById(args.id));

	}

	// From DM to player
	onGameUpdate(data){

		
		if( game.is_host )
			return;


		if( typeof data !== "object" )
			return;

		const ts = data.ts, 	// Last update id
			now = data.now;		// this update id
		data = data.ch;			// Changes

		if( !Array.isArray(data) )
			return;

		game.modal.onGameUpdate(data);

		if( this.debug )
			console.log("Game update received", data);

		if( this._pre_push_time != ts && this._pre_push_time !== 0 ){
			this._pre_push_time = 0;
			console.error("Desync detected, requesting whole game");
			this.playerRequestFullGame();
			return;
		}

		this._pre_push_time = now;


		let getPath = function( path ){
			let targ = game;
			let basePath = path.slice();
			while( path.length > 1 ){
				let p = path.shift();
				targ = targ[p];
				if( targ === undefined ){
					console.error("Path target is not defined", basePath);
					return undefined;
				}
			}
			return targ;
		};

		let dungeonChanged = false;		// Whether we need to refresh or not
		let gameCombatPre = game.battle_active;
		let dungeonPreId = game.dungeon.id;
		
		// Paths needing rebasing
		/*
		Todo: Fix this at some point
		let need_rebase = [];			// Sub arrays of path
		let addRebase = path => {

			// Return true if one path is in the other from the left, ex [1,2,3] [1,2,3,4]
			let pathsAreEqual = (a,b) => {
				// Iterate over the shortest one
				for( let i =0; i<Math.min(a.length, b.length); ++a ){
					if( a[i] !== b[i] )
						return false;
				}
				return true;
			}
			for( let n = 0; n<need_rebase.length; ++n ){
				let base = need_rebase[n];
				// These aren't the same paths
				if( !pathsAreEqual(base, path) )
					continue;
				// A shorter or equal one already exists, we can quit iterating
				if( path.length >= base.length )
					return;

				// this one is shorter
				need_rebase[n] = path;
				return;
			}
			// Nothing exists, we need to add the path
			need_rebase.push(path);
		};
		*/

		for( let ch of data ){
			if( ch.path[0] === "dungeon" )
				dungeonChanged = true;

			let kind = ch.kind, path = getPath(ch.path.slice()), el = ch.path[ch.path.length-1];

			if( path === undefined ){
				console.log("Desync detected, resynchronizing the whole game");
				this.playerRequestFullGame();
				return;
			}

			// simple edit or new property added
			if( kind === "E" || kind === "N" )
				path[el] = ch.rhs;
			// Deleted a property
			else if( kind === "D" )
				delete path[el];
			// Array change
			else if( kind === "A" ){

				// Array change
				path = path[el];
				el = ch.item.rhs;
				let k = ch.item.kind;

				// Something has changed
				if( k === "E" || k === "N" )
					path[ch.index] = el;
				// Something was removed
				else if( k === "D" )
					path.splice(ch.index, 1);
				

			}

			
			// Rebase objects
			/*
			if( (typeof ch.rhs === "object" || kind === "A") && Array.isArray(need_rebase) ){
				
				let found = false;
				let arr = ch.path;
				console.log("Checking", arr);
				for( let i = arr.length-1; i>=0; --i ){

					let p = arr.slice(0, i+1);
					let last = getPath(p.slice());
					last = last[p[p.length-1]];
					// Step back if it's been deleted
					if( last === undefined || last === null )
						continue;

					if( typeof last.rebase === "function" ){
						addRebase(p);
						found = true;
						break;
					}

				}

				// Nothing viable has been found, we'll have to rebase the whole game
				// This happens when overwriting an object or array directly under game, as you can't tell what class they are
				if( !found )
					need_rebase = true;
			}
			*/
		}

		//if( need_rebase === true ){
			game.rebase( true );
		//}
		/*
		else{
			console.log("need rebase: ", need_rebase);
			for( let base of need_rebase ){
				let p = getPath(base.slice());
				let target = base[base.length-1];
				console.log("Rebasing", p[target]);
				p[target].rebase();
			}
		}
		*/
		game.ui.draw();
		game.modal.onGameUpdate(data);
		

		if( dungeonPreId !== game.dungeon.id )
			game.renderer.loadActiveDungeon();
		else if( dungeonChanged ){
			game.renderer.drawActiveRoom(false);
		}
		if( gameCombatPre !== game.battle_active )
			game.renderer.onBattleStateChange();
		

		if( !gameCombatPre && game.battle_active ){
			// Trigger start battle cinematic
			game.modal.battleVis();
		}

	}





	/* OUTPUT TASKS PLAYER */
	// Player interacted with dungeon mesh
	playerInteractWithAsset( player, dungeonAsset ){
		this.sendPlayerAction(NetworkManager.playerTasks.interact, {
			player : player.id,
			dungeonAsset : dungeonAsset.id,
		});
	}

	// Player looting dungeon mesh
	playerLoot( player, dungeonAsset, item ){
		this.sendPlayerAction(NetworkManager.playerTasks.loot, {
			player : player.id,
			dungeonAsset : dungeonAsset.id,
			item : item.id
		});
	}

	// Player use action
	// Player and Action are Player/Action objects, targets are also Player objects
	playerUseAction(player, action, targets = []){
		this.sendPlayerAction(NetworkManager.playerTasks.useAction, {
			player : player.id,
			targets : targets.map(el => el.id),
			action : action.id
		}); 
	}

	// Use an asset to repair an item
	playerUseRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID ){
		this.sendPlayerAction(NetworkManager.playerTasks.useRepairAsset, {
			player : senderPlayer.id,
			target : targetPlayer.id,
			repairKit : repairKitID,
			asset : assetID
		}); 
	}	

	playerRequestFullGame(){
		this.sendPlayerAction(NetworkManager.playerTasks.getFullGame, {}); 
	}

	



	/* OUTPUT TASKS DM */
	dmAnimation( dungeonAsset, animation ){
		if( !game.is_host )
			return;
		this.sendHostTask(NetworkManager.dmTasks.animation, {
			dungeonAsset : dungeonAsset.id,
			animation : animation
		});
	}

	dmSendFullGame( target ){
		let fullGame = game.getSaveData();
		const isCyclic = (obj => {
			const keys = []
			const stack = []
			const stackSet = new Set()
			let detected = false
		  
			const detect = ((object, key) => {
			  if (!(object instanceof Object))
				return
		  
			  if (stackSet.has(object)) { // it's cyclic! Print the object and its locations.
				const oldindex = stack.indexOf(object)
				const l1 = `${keys.join('.')}.${key}`
				const l2 = keys.slice(0, oldindex + 1).join('.')
				console.log(`CIRCULAR: ${l1} = ${l2} = ${object}`)
				console.log(object)
				detected = true
				return
			  }
		  
			  keys.push(key)
			  stack.push(object)
			  stackSet.add(object)
			  Object.keys(object).forEach(k => { // dive on the object's children
				if (k && Object.prototype.hasOwnProperty.call(object, k))
				  detect(object[k], k)
			  })
		  
			  keys.pop()
			  stack.pop()
			  stackSet.delete(object)
			})
		  
			detect(obj, 'obj')
			return detected
		});
		console.log(isCyclic(fullGame));
		console.log("JSON encoding", JSON.stringify(fullGame).length);
		fullGame.chat_log = game.chat_log;
		this.sendHostTaskTo( target, NetworkManager.dmTasks.sendFullGame, fullGame);
	}

	// All except netplayer are objects
	dmDrawRepair( netPlayer, player, target, action ){
		this.sendHostTaskTo( netPlayer, NetworkManager.dmTasks.drawRepair, {
			player : player.id,
			target : target.id,
			action : action.id
		});
	}

	dmQuestCompleted( id ){
		this.sendHostTask( NetworkManager.dmTasks.questCompleted, {
			id : id
		});
	}

	// All the args are strings
	dmPlaySoundOnPlayer(sender, target, kit, armor_slot){
		this.sendHostTask(NetworkManager.dmTasks.playSoundOnPlayer, {
			kit : kit,
			sender : sender,
			target : target,
			armor_slot : armor_slot,
		}); 
	}

	// No objects, only ids
	dmPlaySoundOnMesh( dungeonAsset, url, volume, loop, id ){
		this.sendHostTask(NetworkManager.dmTasks.playSoundOnMesh, {
			dungeonAsset : dungeonAsset,
			url : url,
			volume : volume,
			loop : loop,
			id : id,
		}); 
	}

	dmStopSoundOnMesh( dungeonAsset, id, fade ){
		this.sendHostTask(NetworkManager.dmTasks.stopSoundOnMesh, {
			dungeonAsset : dungeonAsset,
			fade : fade,
			id : id,
		}); 
	}

	// IDs only
	dmRaiseInteractOnMesh( dungeonAssetId ){
		this.sendHostTask(NetworkManager.dmTasks.raiseInteractOnMesh, {
			dungeonAsset : dungeonAssetId
		}); 
	}

}

// Send tasks from DM to player
NetworkManager.dmTasks = {
	sendFullGame : 'fullGame',		// Data is a snapshot of the whole current game
	sendText : 'text',				// data is an object with keys: text, evtType, attackerID, targetID, additionalClassName
	sendVisual : 'visual',			// {player:playeruuid, fx:fxName}
	error : 'error',				// {text:(string)errorText, notice:(bool)isNotice}
	animation : 'animation',		// {dungeonAsset:dungeonAssetUUID, anim:animation}
	drawRepair : 'drawRepair',		// {player:(str)casterID, target:(str)targetID, action:(str)actionID}
	questCompleted : 'questCompleted', 		// {id:(str)quest_id}
	playSoundOnPlayer : 'playSoundOnPlayer',	// {kit:(str)soundkitID, sender:senderUUID, target:targetUUID, armor_slot:(str)armorSlotHit} - 
	playSoundOnMesh : 'playSoundOnMesh',		// {dungeonAsset:(str)dungeonAssetuuid, url:(str)sound_url, volume:(float)volume, loop:(bool)loop[, id:(str)optional_id]}
	stopSoundOnMesh : 'stopSoundOnMesh',		// {dungeonAsset:(str)dungeonAsset_uuid, id:(str)url/id, fade:(int)fade_ms}
	raiseInteractOnMesh : 'raiseInteractOnMesh',	// {dungeonAsset:(str)dungeonAsset_uuid} - Triggers the mesh template onInteract function on a dungeon asset
};

// Player -> DM
NetworkManager.playerTasks = {
	toggleGear : 'toggleGear',			// {player:playerUUID, item:gearUUID}
	useAction : 'useAction',			// {action:actionUUID, targets:(arr)targetUUIDs}
	speak : 'speak',					// {player:playerUUID/"ooc"/"DM", text:text_to_say}
	interact : 'interact',				// {player:playerUUID, dungeonAsset:dungeonAssetUUID}
	loot : 'loot',						// {player:playerUUID, dungeonAsset:dungeonAssetUUID, item:itemUUID}
	useRepairAsset : 'useRepairAsset',	// {player:casterUUID, target:(str)targetUUID, repairKit:(str)playerRepairAssetUUID, asset:(str)assetToRepairID}
	getFullGame : 'getFullGame',		// void - Request the full game from host. Useful if there's packet loss or desync
};

export default NetworkManager;
