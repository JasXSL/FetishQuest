import Game from './Game.js';
import GameEvent from './GameEvent.js';
import { AudioKit } from './Audio.js';
import HitFX from './HitFX.js';
import Comparer from './Comparer.js';
import ActionLearnable from './ActionLearnable.js';
import Player from './Player.js';

class NetworkManager{

	// Parent is game
	constructor(parent){
		
		this.debug = false;
		this.parent = parent;
		this.io = null;
		this.id = null;
		this.public_id = null;
		this.players = [];			// {id:id, name:name}
		this.afk = {};				// id:afk_status
		this._last_push = null;
		this._pre_push_time = 0;		// Time of last push
		this.timer_reconnect = null;
		this.comparer = new Comparer();

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
			console.debug("Server connection established");
			clearTimeout(this.timer_reconnect);
			game.onTurnTimerChanged();
			window.onbeforeunload = function() {
				return true;
			};
		});

		// Host left
		this.io.on('hostLeft', () => {
			console.debug("Host left the game");
			this.disconnect();
		});

		// Player left
		this.io.on('playerLeft', data => {
			for( let i in this.players ){
				if( this.players[i].id === data.id ){
					game.uiAudio( 'player_disconnect' );
					game.ui.addText( this.players[i].name+" has left the game.", undefined, undefined, undefined, 'dmInternal' );
					delete this.afk[data.id];
					this.players.splice(i, 1);
				}
			}
			game.ui.draw();
		});

		// Player joined
		this.io.on('playerJoined', data => {

			const players = data.players;
			for( let player of players ){
				
				if( !this.getPlayerById(player.id) ){

					this.players.push(player);

					if( game.is_host ){

						const gp = game.players;
						for( let p of gp ){
							if( 
								p.netgame_owner_name === player.name && 			// Owned by this name
								!this.getPlayerNameById(p.netgame_owner)			// Original owner id not present
							)p.netgame_owner = data.id;
						}

					}
				}

			}

			game.ui.draw();

			// This wasn't me who joined
			if( data.id !== this.id && game.is_host ){
				this.dmSendFullGame(data.id);
				this.dmRefreshAFK();
			}

			game.uiAudio( 'player_join' );
			game.ui.addText( data.name+" has joined the game.", undefined, undefined, undefined, 'dmInternal' );
			this.attempts = 0;

		});

		// Disconnected from server
		this.io.on('disconnect', async data => {

			if( !game.is_host && this.public_id){

				console.debug("Disconnected, trying to reconnect...");
				game.uiAudio( 'player_disconnect' );

				this.joinGame(this.public_id, localStorage.netgameName);
				clearTimeout(this.timer_reconnect);
				this.timer_reconnect = setTimeout(() => {
					console.debug("Reconnect failed");
					this.disconnect();
				}, 10000);
				return;

			}

			window.onbeforeunload = undefined;
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
		glib.autoloadMods();
		
		
		this.public_id = null;
		this.id = null;
		this.players = [];
		this.io.disconnect();
		this.io = null;

		if( !game.is_host )
			await Game.load();
		game.ui.drawMainMenu();
		game.ui.draw();
		game.onTurnTimerChanged();

	}

	// hosts your currently loaded game
	async hostGame(){

		if( !this.io )
			await this.connect();

		if( !this.parent.is_host ){
			game.ui.modal.addError('You are not the host of this game');
			return false;
		}

		return new Promise(res => {
			this.io.emit('host', '', id => {
				if( id ){
					this.public_id = id;
					this._last_push = game.getSaveData();
					glib.autoloadMods();
				}
				else
					game.ui.modal.addError("Attempt to host failed");
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
					game.ui.modal.addNotice("You have joined the game");
					this.attempts = 0;
					Game.joinNetGame();
				}
				else{
					game.ui.modal.addError("Failed to join a game");
					this.disconnect();
				}
				res();
			});
		});

	}

	// Checks if we're hosting a netgame
	isHostingNetgame(){
		return this.isConnected() && this.parent.is_host;
	}


	// Debugging
	runComparer( data ){
		return this.comparer.compare(this._last_push, data) ;
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
		let time = Date.now();
		const current = game.getSaveData();
		if( this.debug )
			console.debug("Full SaveData", current);
		//console.log("Getting save data took", Date.now()-time); time = Date.now();

		const changes = this.runComparer( current );
		//console.log("Running comparer took", Date.now()-time); time = Date.now();

		if( this.debug )
			console.debug("Game changes", changes);

		if( !Object.keys(changes).length )
			return;

		this._last_push = current;
		game.onGameUpdate(changes);
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

	// Returns a this.players object by id
	getPlayerById( id ){
		for( let p of this.players ){
			if( p.id === id )
				return p;
		}
	}

	// ID is the netgame player id
	isPlayerAFK( id ){

		if( id === this.id && game.is_host )
			id = 'DM';

		return this.afk[id];
	}

	setPlayerAFK( id, afk ){

		if( id === this.id && game.is_host )
			id = 'DM';
		this.afk[id] = Boolean(afk);
		this.dmRefreshAFK();
		game.ui.drawPlayers();
		// Todo: check if all players are afk before doing this
		if( game.battle_active && game.getTurnPlayer().netgame_owner === id && !this.allPlayersAfk() ){
			game.getTurnPlayer().autoPlay();
		}

	}

	// Returns true if all players are afk
	allPlayersAfk(){

		for( let player of game.players ){
			if( player.netgame_owner && !this.isPlayerAFK(player.netgame_owner) )
				return false;
		}
		return true;

	}

	// Takes a netplayer ID and returns an array of players controlled by them
	getOwnedPlayers(id){
		const out = [];
		for( let player of game.players ){
			if( player.netgame_owner === id )
				out.push(player);
		}
		return out;
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
			console.debug("PlayerTask", data);
		if( !game.is_host || typeof data !== "object" )
			return;

		data = data.data;
		if( typeof data !== "object" || !data.task )
			return;
		let task = data.task, args = data.data;
		if( typeof args !== "object" )
			args = {};

		const respondWithError = error => {
			th.sendHostTaskTo(netPlayer, NetworkManager.dmTasks.error, {
				txt : error
			});
			return false;
		}

		// Helper function that validates the player and returns it
		// Depends on the player UUID being under args.player
		const validatePlayer = () => {

			let player = game.getPlayerById(args.player);
			if(!player)
				throw('Player not found');
			if(player.netgame_owner !== netPlayer)
				throw('Player not owned by you');
			return player;

		}


		
		try{

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
				if( !spell ){
					console.error("Player action", args.action, "not found in player", player);
					return respondWithError("Action not found");
				}
				game.useActionOnTarget(spell, targs, player, netPlayer);
			}

			// Chat
			if( args && task === PT.speak && typeof args.player === "string" && typeof args.text === "string" ){

				let p = args.player, txt = args.text, pl = game.getPlayerById(p);

				let isOOC = p === 'ooc';
				if( !isOOC && pl.netgame_owner !== netPlayer )
					return console.error("Player ", p, " not found or not owned by sender", netPlayer);
				if( isOOC )
					p = this.getPlayerNameById(netPlayer);
				
				if( +localStorage.muteSpectators && !this.getOwnedPlayers(netPlayer).length )
					return;
				

				game.speakAs(p, escapeStylizeText(txt), isOOC);

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

				if( !asset._stage_mesh )
					console.log("Clicked asset", asset, "is missing stage mesh");
				game.dungeon.assetClicked( player, room, asset, asset._stage_mesh );

			}

			if( task === PT.loot ){

				let player = validatePlayer();
				if( !player )
					return;

				let room = game.dungeon.getActiveRoom(),
					dungeonAsset = room.getAssetById(args.dungeonAsset)
				;

				if( dungeonAsset )
					dungeonAsset.lootToPlayer( args.item, player );

			}

			if( task === PT.lootPlayer ){

				let player = validatePlayer();
				if( !player )
					return;

				let target = game.getPlayerById(args.target);
				if( !target )
					return respondWithError("Player not found");
				if( !target.isLootableBy(player) )
					return respondWithError("You can't loot that right now");
				target.lootToPlayer(args.item, player );

			}

			if( task === PT.roleplayOption ){

				let player = validatePlayer();
				if( !player )
					return;

				let optID = args.option;
				game.useRoleplayOption( player, optID );

			}

			if( task === PT.roleplay ){

				let player = validatePlayer();
				if( !player )
					return;

				let roleplay = game.getAvailableRoleplayForPlayerById(player, args.roleplay);
				if( !roleplay )
					return respondWithError("Roleplay not available");

				game.setRoleplay( roleplay );

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

			else if( task === PT.deleteAsset ){

				// {player:(str)owner_id, item:(str)assetID}
				if( !args.player || !args.item )
					return;
				let player = validatePlayer();
				if( !player )
					return;
				game.deletePlayerItem( player, args.item, args.amount );

				
			}
			else if( task === PT.tradeAsset ){

				// {player:(str)sender_id, to:(str)sender_id, item:(str)assetID}
				if( !args.player || !args.item || !args.to )
					return;
				let player = validatePlayer();
				if( !player )
					return;
				game.tradePlayerItem( player, game.getPlayerById(args.to), args.item, args.amount );

			}

			else if( task === PT.buyItem ){

				// {player:(str)sender_id, shop:(str)shop_id, item:(str)shopitem_id, amount:(int)amount}
				if( !args.player || !args.shop || !args.item || !args.amount || isNaN(args.amount) ){
					console.error("Net: Missing args in call", task, "got", args);
					return;
				}
				let player = validatePlayer();
				if( !player )
					return;

				game.buyAsset(args.shop, args.item, args.amount, player);
					

			}

			else if( task === PT.sellItem ){

				// {player:(str)sender_id, shop:(str)shop_id, asset:(str)asset_id, amount:(int)amount}
				if( !args.player || !args.shop || !args.asset || !args.amount || isNaN(args.amount) ){
					console.error("Net: Missing args in call", task, "got", args);
					return;
				}
				let player = validatePlayer();
				if( !player )
					return;

				game.sellAsset(args.shop, args.asset, args.amount, player);

			}

			else if( task === PT.repairItemAtBlacksmith ){

				// {player:(str)sender_id, blacksmithPlayer:(str)shop_id, asset:(str)asset_id}
				if( !args.player || !args.blacksmithPlayer || !args.asset ){
					console.error("Net: Missing args in call", task, "got", args);
					return;
				}
				let player = validatePlayer();
				if( !player )
					return;

				const blacksmith = game.getPlayerById(args.blacksmithPlayer);
				game.repairBySmith(blacksmith, player, args.asset);

			}

			else if( task === PT.exchangeGold ){
				let player = validatePlayer();
				if( !player )
					return;
				
				// Todo: Later, add shop to this to make sure there's one available
				game.exchangePlayerMoney(player);

			}

			else if( task === PT.rentRoom ){
				let player = validatePlayer();
				if( !player )
					return;
				
				const renter = game.getPlayerById(args.renter);
				game.roomRentalUsed(renter, player);

			}
			else if( task === PT.sleep ){
				let player = validatePlayer();
				if( !player )
					return;
				
				let room = game.dungeon.getActiveRoom(),
					dungeonAsset = room.getAssetById(args.asset)
				;
				let hours = args.hours;
				game.sleep(player, dungeonAsset, hours);

			}

			else if( task === PT.buyAction ){

				let player = validatePlayer();
				if( !args.gym || !args.actionLearnable )
					throw 'Invalid request';

				game.learnAction(game.getPlayerById(args.gym), player, args.actionLearnable);
					

			}

			else if( task === PT.toggleAction ){

				let player = validatePlayer();
				if( !args.gym || !args.action )
					throw 'Invalid request';

				game.toggleAction(game.getPlayerById(args.gym), player, args.action);

			}
			else if( task === PT.toggleAFK )
				this.setPlayerAFK(netPlayer, args.afk);

		}catch(err){

			respondWithError(err);
			console.error("Net error returned -> ", err);
			console.error("Received data was ", data);

		}

	}

	// DM -> PLAYER
	onDMTask(data){
		if( game.is_host || typeof data !== "object" || !data.task )
			return;
		if( this.debug )
			console.debug("DM Task received", data);

		let task = data.task, args = data.data;

		// Load the full game
		if( task === NetworkManager.dmTasks.sendFullGame ){
			game.ui.destructor();
			game.load(args);
			game.renderer.loadActiveDungeon();

			// Load in custom libraries that are needed
			glib.actionLearnable = {};
			ActionLearnable.loadThese(args.lib_actionLearnable).map(a => glib.actionLearnable[a.label] = a);


			game.ui.updateMute();
		}

		else if( task === NetworkManager.dmTasks.afk ){
			this.afk = args;
			game.ui.drawPlayers();
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
			game.ui.modal.addError(args.txt, args.notice);
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

		else if( task === NetworkManager.dmTasks.blackScreen )
			game.ui.toggleBlackScreen();
		
		else if( task === NetworkManager.dmTasks.playSoundOnPlayer ){

			if( typeof args === "object" )
				game.playFxAudioKit(
					new AudioKit(args.kit),
					game.getPlayerById(args.sender), 
					game.getPlayerById(args.target), 
					args.armor_slot,
					args.volume_multiplier
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

		else if( task === NetworkManager.dmTasks.questAccepted ){

			// {head:head, body:(str)body}
			game.ui.questAcceptFlyout(args.head, args.body);

		}
		else if( task === NetworkManager.dmTasks.hitfx ){

			// {fx:hitfx, caster:(str)casterID, recipients:(arr)recipients, armor_slot:(str)armor_slot}
			if( !args.hitfx || !args.caster || !Array.isArray(args.recipients) ){
				console.error("Received invalid hitfx args from host", args);
				return;
			}

			const fx = new HitFX(args.hitfx);
			const caster = game.getPlayerById(args.caster);
			const recipients = args.recipients.map(el => game.getPlayerById(el));
			game.renderer.playFX( caster, recipients, fx, args.armor_slot, false );

		}

		else if( task === NetworkManager.dmTasks.dmRpOptionSelected ){
			game.ui.rpOptionSelected(args.id);
		}

		else if( task === NetworkManager.dmTasks.rope ){
			const sec = parseInt(args.dur);
			if( !sec )
				return;
			const pl = args.player;
			if( !game.getMyActivePlayer() )
				return;
			if( game.getMyActivePlayer().id !== pl )
				return;
			game.ui.toggleRope(sec);
		}
		else if( task === NetworkManager.dmTasks.floatingCombatText ){
			
			const amt = parseInt(args.amount),
				player = args.player,
				type = args.type || '',
				crit = args.crit || false
			;
			if( !amt || !player )
				return;
			game.ui.floatingCombatText(amt, player, type, crit);

		}


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

		if( typeof data !== "object" )
			return;

		//console.debug("Got game data", data);

		if( this.debug )
			console.debug("Game update received", data);

		if( this._pre_push_time != ts && this._pre_push_time !== 0 ){
			this._pre_push_time = 0;
			console.error("Desync detected, requesting whole game");
			this.playerRequestFullGame();
			return;
		}

		this._pre_push_time = now;

		let gameCombatPre = game.battle_active;
		let dungeonPreId = game.dungeon.id;
		
		game.loadFromNet(data);
		game.ui.draw();		

		if( dungeonPreId !== game.dungeon.id )
			game.renderer.loadActiveDungeon();
		else if( data.dungeon )
			game.renderer.drawActiveRoom(false);
		
		if( gameCombatPre !== game.battle_active )
			game.renderer.onBattleStateChange();

		// Battle start visual
		if( !gameCombatPre && game.battle_active ){
			// Trigger start battle cinematic
			game.ui.battleVis();
			game.renderer.battleVis();
		}

		game.onGameUpdate(data); // Must be after gmae.load* or it won't update properly
		
	}





	/* OUTPUT TASKS PLAYER */
	playerToggleAFK(){
		const afk = !this.isPlayerAFK(this.id);
		if( game.is_host ){
			this.setPlayerAFK(this.id, afk);
			return;
		}
		this.sendPlayerAction(NetworkManager.playerTasks.toggleAFK, {
			afk:afk
		});
	}
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

	playerLootPlayer( player, target, item ){
		this.sendPlayerAction(NetworkManager.playerTasks.lootPlayer, {
			player : player.id,
			target : target.id,
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

	playerDeleteAsset( player, asset, amount = 1 ){
		this.sendPlayerAction(NetworkManager.playerTasks.deleteAsset, {
			player : player.id,
			item : asset.id,
			amount : amount
		});
	}
	playerTradeAsset( fromPlayer, targetPlayer, asset, amount ){
		this.sendPlayerAction(NetworkManager.playerTasks.tradeAsset, {
			player : fromPlayer.id,
			to : targetPlayer.id,
			item : asset.id,
			amount : amount
		});
	}

	playerRoleplayOption( player, optionID ){
		this.sendPlayerAction(NetworkManager.playerTasks.roleplayOption, {
			player : player.id,
			option : optionID,
		});
	}
	playerRoleplay( player, roleplay ){
		this.sendPlayerAction(NetworkManager.playerTasks.roleplay, {
			player : player.id,
			roleplay : roleplay.id,
		});
	}
	
	playerBuyItem(shop, item, amount, player){
		if( typeof shop === "object" )
			shop = shop.label;
		if( typeof item === "object" )
			item = item.id;
		if( typeof player === "object" )
			player = player.id;
		this.sendPlayerAction(NetworkManager.playerTasks.buyItem, {
			item : item,
			shop : shop,
			amount : amount,
			player : player,
		});
	}
	playerSellItem(shop, asset, amount, player){
		if( typeof shop === "object" )
			shop = shop.label;
		if( typeof asset === "object" )
			asset = asset.id;
		if( typeof player === "object" )
			player = player.id;
		this.sendPlayerAction(NetworkManager.playerTasks.sellItem, {
			asset : asset,
			shop : shop,
			amount : amount,
			player : player,
		});
	}
	playerRepairItemAtBlacksmith(blacksmithPlayer, player, asset){
		if( typeof blacksmithPlayer === "object" )
			blacksmithPlayer = blacksmithPlayer.id;
		if( typeof asset === "object" )
			asset = asset.id;
		if( typeof player === "object" )
			player = player.id;
		this.sendPlayerAction(NetworkManager.playerTasks.repairItemAtBlacksmith, {
			asset : asset,
			blacksmithPlayer : blacksmithPlayer,
			player : player,
		});
	}
	
	playerExchangeGold(player){
		this.sendPlayerAction(NetworkManager.playerTasks.exchangeGold, {
			player : player.id,
		});
	}

	playerSleep( player, dungeonAsset, hours ){
		this.sendPlayerAction(NetworkManager.playerTasks.sleep, {
			player : player.id,
			asset : dungeonAsset.id,
			hours : hours
		});
	}

	playerRentRoom( renterPlayer, player ){
		this.sendPlayerAction(NetworkManager.playerTasks.rentRoom, {
			player : player.id,
			renter : renterPlayer.id,
		});
	}

	playerBuyAction( gymPlayer, player, actionLearnableID ){
		this.sendPlayerAction(NetworkManager.playerTasks.buyAction, {
			player : player.id,
			gym : gymPlayer.id,
			actionLearnable : actionLearnableID
		});
	}

	playerToggleAction( gymPlayer, player, actionID ){
		this.sendPlayerAction(NetworkManager.playerTasks.toggleAction, {
			player : player.id,
			gym : gymPlayer.id,
			action : actionID,
		});
	}



	/* OUTPUT TASKS DM */
	dmRefreshAFK(){
		this.sendHostTask(NetworkManager.dmTasks.afk, this.afk);
	}

	dmAnimation( dungeonAsset, animation ){
		if( !game.is_host )
			return;
		this.sendHostTask(NetworkManager.dmTasks.animation, {
			dungeonAsset : dungeonAsset.id,
			animation : animation
		});
	}

	dmSendFullGame( target ){
		const fullGame = game.getSaveData();
		/*
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
				console.error(`CIRCULAR: ${l1} = ${l2} = ${object}`)
				console.error(object)
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
		*/
		if( this.debug )
			console.debug("JSON encoding", JSON.stringify(fullGame).length);
		// Appends stuff that should only be sent with the full game on init
		fullGame.chat_log = game.chat_log;
		fullGame.lib_actionLearnable = ActionLearnable.saveThese(Object.values(glib.getFull("ActionLearnable")), "mod");
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

	// All the args are strings
	dmPlaySoundOnPlayer(sender, target, kit, armor_slot, volume_multiplier = 1.0){
		this.sendHostTask(NetworkManager.dmTasks.playSoundOnPlayer, {
			kit : kit,
			sender : sender,
			target : target,
			armor_slot : armor_slot,
			volume_multiplier : volume_multiplier
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

	dmHitfx( caster, recipients, hitfx, armor_slot ){
		this.sendHostTask(NetworkManager.dmTasks.hitfx, {
			hitfx : hitfx.save(),
			caster : caster.id,
			recipients : recipients.map(el => el.id),
			armor_slot : armor_slot
		}); 
	}

	dmQuestAccepted( head, body ){
		this.sendHostTask(NetworkManager.dmTasks.questAccepted, {
			head : head,
			body: body,
		}); 
	}

	// IDs only
	dmRaiseInteractOnMesh( dungeonAssetId ){
		this.sendHostTask(NetworkManager.dmTasks.raiseInteractOnMesh, {
			dungeonAsset : dungeonAssetId
		}); 
	}

	dmRpOptionSelected( id ){
		this.sendHostTask(NetworkManager.dmTasks.dmRpOptionSelected, {
			id : id
		}); 
	}

	dmRope( player, seconds ){
		this.sendHostTask(NetworkManager.dmTasks.rope, {
			player : player.id,
			dur : seconds
		}); 
	}

	// Triggers the black screen visual
	dmBlackScreen(){
		this.sendHostTask(NetworkManager.dmTasks.blackScreen, {});
	}

	dmFloatingCombatText( amount, player, type, crit ){
		this.sendHostTask(NetworkManager.dmTasks.floatingCombatText, {
			amount : amount,
			player : player instanceof Player ? player.id : player,
			type : type,
			crit : crit
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
	playSoundOnPlayer : 'playSoundOnPlayer',		// {kit:(str)soundkitID, sender:senderUUID, target:targetUUID, armor_slot:(str)armorSlotHit, volume_multiplier:(float)=1} - 
	playSoundOnMesh : 'playSoundOnMesh',			// {dungeonAsset:(str)dungeonAssetuuid, url:(str)sound_url, volume:(float)volume, loop:(bool)loop[, id:(str)optional_id]}
	stopSoundOnMesh : 'stopSoundOnMesh',			// {dungeonAsset:(str)dungeonAsset_uuid, id:(str)url/id, fade:(int)fade_ms}
	raiseInteractOnMesh : 'raiseInteractOnMesh',	// {dungeonAsset:(str)dungeonAsset_uuid} - Triggers the mesh template onInteract function on a dungeon asset
	hitfx : 'hitfx',								// {fx:hitfx, caster:(str)casterID, recipients:(arr)recipients, armor_slot:(str)armor_slot} - Triggers a hitfx
	questAccepted : 'questAccepted',				// {head:(str)head_text, body:(str)body_text} - Draws the questStart info box. Also used for quest completed and other things
	dmRpOptionSelected : 'rpOptionSelected', 		// {id:(str)id} - An RP option has been selected, send it
	rope : 'rope',									// {player:(str)player_id, dur:(int)seconds} - Starts the turn timer rope for the player
	blackScreen : 'blackScreen',					// void - Triggers a black screen visual
	afk : 'afk',									// {id:(bool)afk...} - Sends AFK status to all players
	floatingCombatText : 'floatingCombatText',		// {amount:(int)amount, player:(str)player_id, type:(str)type, crit:(bool)crit}
};

// Player -> DM
NetworkManager.playerTasks = {

	toggleGear : 'toggleGear',			// {player:playerUUID, item:gearUUID}
	useAction : 'useAction',			// {action:actionUUID, targets:(arr)targetUUIDs}
	speak : 'speak',					// {player:playerUUID/"ooc"/"DM", text:text_to_say}
	interact : 'interact',				// {player:playerUUID, dungeonAsset:dungeonAssetUUID}
	loot : 'loot',						// {player:playerUUID, dungeonAsset:dungeonAssetUUID, item:itemUUID}
	lootPlayer : 'lootPlayer',			// {player:looterUUID, target:(str)targetUUID, item:(str)itemUUID}
	useRepairAsset : 'useRepairAsset',	// {player:casterUUID, target:(str)targetUUID, repairKit:(str)playerRepairAssetUUID, asset:(str)assetToRepairID}
	getFullGame : 'getFullGame',		// void - Request the full game from host. Useful if there's packet loss or desync
	deleteAsset : 'deleteAsset',		// {player:(str)owner_id, item:(str)assetID, amount:(int)stacks}
	tradeAsset : 'tradeAsset',			// {player:(str)sender_id, to:(str)sender_id, item:(str)assetID, amount=all}
	roleplayOption : 'roleplayOption',				// {player:playerUUID, option:(str)optionUUID}
	roleplay : 'roleplay',				// {player:(str)sender_id, roleplay:(str)roleplay_id}
	buyItem : 'buyItem',				// {player:(str)sender_id, shop:(str)shop_id, item:(str)shopitem_id, amount:(int)amount}
	sellItem : 'sellItem',				// {player:(str)sender_id, shop:(str)shop_id, asset:(str)asset_id, amount:(int)amount}
	exchangeGold : 'exchangeGold',		// {player:(str)sender_id}
	repairItemAtBlacksmith : 'repairItemAtBlacksmith',		// {player:(str)sender_id, blacksmithPlayer:(str)blacksmith, asset:(str)asset_id}
	sleep : 'sleep',									// {player:(str)sender_id, asset:(str)dungeon_asset_id, hours:(int)hours}
	rentRoom : 'rentRoom',							// {renter:(str)rental_merchant_player_id, player:(str)player_id}
	buyAction : 'buyAction',			// {player:(st)sender_id, gym:(str)gym_player_id, actionLearnable:(str)action_learnable_id}
	toggleAction : 'toggleAction',		// {player:(st)sender_id, gym:(str)gym_player_id, action:(str)action_id}
	toggleAFK : 'toggleAFK',			// {afk:(bool)afk}
};

export default NetworkManager;
