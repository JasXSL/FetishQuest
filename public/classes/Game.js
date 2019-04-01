import Player from './Player.js';
import Generic from './helpers/Generic.js';
import UI from './UI.js';
import Modal from './Modal.js';
import GameEvent from './GameEvent.js';
import Asset from './Asset.js';
import NetworkManager from './NetworkManager.js';
import {default as Dungeon, DungeonEncounter} from './Dungeon.js';
import WebGL from './WebGL.js';
import Text from './Text.js';
import Quest from './Quest.js';
import {default as Audio, setMasterVolume}  from './Audio.js';
import stdTag from '../libraries/stdTag.js';
import Roleplay from './Roleplay.js';

export default class Game extends Generic{



	constructor(name){
		super(name);

		this.name = name;
		if( !this.name )
			this.name = "Unnamed Adventure";
		this.players = [];
		this.renderer = new WebGL();
		this.ui = new UI(this);
		this.modal = new Modal(this);
		this.turn = 0;
		this.is_host = true;
		this.battle_active = false;
		this.initiative = [];				// Turn order
		this.initialized = false;
		this.dm_writes_texts = false;
		this.chat_log = [];					// Chat log
		this.net = new NetworkManager(this);
		this.dungeon = new Dungeon({}, this);					// if this is inside a quest, they'll share the same object
		this.encounter = new DungeonEncounter({completed:true}, this);		// if this is inside a dungeon, they'll be the same objects
		this.roleplay = new Roleplay({finished:true}, this);
		this.quests = [];								// Quest Objects of quests the party is on
		this.net_load = false;							// Currently loading from network

		// This is used to save states about dungeons you're not actively visiting, it gets loaded onto a dungeon after the dungeon loads
		// This lets you save way less data
		this.state_dungeons = {};		// label : (obj)dungeonstate - See the dungeon loadstate/savestate


		// Library of custom items
		this.libAsset = {};

		this.audio_fx = new Audio("fx");
		this.audio_ambient = new Audio('ambient', false);
		this.audio_music = new Audio('music', false);
		this.audio_ui = new Audio('ui', false);

		this.active_music_file = null;
		this.active_ambient_file = null;
		this.active_music = null;						// Only one song can play at a time
		this.active_ambient = null;						// Only one ambient track can play at once 

		this.save_timer = null;
		this.ignore_netgame = true;						// For above, set to false if there's a call is added to the timer without ignore

		this.my_player = localStorage.my_player;

		this.end_turn_after_action = false;				// When set, ends turn after the current action completes
	}

	destructor(){
		this.ui.destructor();
		this.net.destructor();
		this.renderer.destructor();
		this.setMusic();
		this.setAmbient();
	}





	/* LOADING/SAVING */

	// full = false filters out some data that shouldn't be sent to the netgame players
	getSaveData( full ){

		let out = {
			id : this.id,
			players : this.players.map(el => el.save(full)),
			turn : this.turn,
			battle_active : this.battle_active,
			initiative : this.initiative,	
			dungeon : this.dungeon.save(full),
			encounter : this.encounter.save(full),
			quests : this.quests.map(el => el.save(full)),
			roleplay : this.roleplay.save(full)
		};

		
		if( full ){
			out.libAsset = {};

			Object.values(this.libAsset).map(el => out.libAsset[el.label] = el.save(full));
			out.name = this.name;
			out.id = this.id;
			out.dm_writes_texts = this.dm_writes_texts;
			out.chat_log = this.chat_log;
			out.state_dungeons = this.state_dungeons;
		}
		return out;
	}

	// Async file save
	async save( ignoreNetGame ){

		if( !ignoreNetGame )
			this.ignore_netgame = false;

		clearTimeout(this.save_timer);
		return new Promise(res => {
			this.save_timer = setTimeout(() => {
				
				this.save_timer = null;
				res( this.execSave(false, this.ignore_netgame) );

			}, 100);
		});
		

		
	}

	async execSave( allowInsert, ignoreNetGame ){

		if( !this.initialized && !allowInsert ){
			game.modal.addError("Unable to save, game failed to intialize");
			return false;
		}

		if( !this.is_host ){
			return false;
		}


		// Wait for transporting to finish
		if( this.dungeon.transporting )
			return;

		if( !ignoreNetGame )
			this.net.sendGameUpdate();
		this.ignore_netgame = true;

		let out = this.getSaveData(true);

		localStorage.game = this.id;
		let ret;
		try{
			ret = await Game.db.games.put(out);
		}catch(err){
			console.error("Error in saving", err, out);
		}
		if( allowInsert ){
			this.initialized = true;
			this.load();	// Starts the actual game
		}

		
		return ret;
	}

	// Std load
	async load( data ){

		this.initialized = false;		// prevents text sounds from being played when a netgame loads
		this.g_autoload(data);

		// Custom ad-hoc libraries do not need to be rebased
		for( let i in this.libAsset )
			this.libAsset[i] = new Asset(this.libAsset[i]);
		
		await glib.autoloadMods();
		glib.setCustomAssets(this.libAsset);

		this.ui.draw();
		

		// Load the chat log
		let log = this.chat_log.slice();
		this.chat_log = [];
		for( let ch of log )
			this.ui.addText.apply(this.ui, ch);
		
		this.assignAllColors();

		this.initialized = true;

		this.ui.ini(this.renderer.renderer.domElement, this.renderer.fxRenderer.domElement);
		
		// Make sure a dungeon exists
		if( !this.dungeon || !this.dungeon.rooms.length )
			this.addRandomQuest();

		this.renderer.loadActiveDungeon();
		this.verifyLeader();

	}

	loadFromNet( data ){
		let turn = this.getTurnPlayer();
		this.net_load = true;
		this.g_autoload(data);
		this.net_load = false;
		let nt = this.getTurnPlayer();
		if( turn.id !== nt.id )
			this.onTurnChanged();
	}

	// Automatically invoked after g_autoload() in load()
	rebase(){

		
		this.quests = Quest.loadThese(this.quests, this);		
		this.dungeon = new Dungeon(this.dungeon, this);
		this.encounter = new DungeonEncounter(this.encounter, this);
		// Players last as they may rely on the above
		this.players = Player.loadThese(this.players, this);

		// Map Quests and Players
		// If our current encounter is in the current dungeon, then use the dungeon encounter object
		let encounter = this.dungeon.getStartedEncounterById(this.encounter.id);
		if( encounter )
			this.encounter = encounter;

		// Check if the players are from the encounter, in that case overwrite them
		for( let i in this.players ){
			let p = this.players[i];
			let pl = this.encounter.getPlayerById(p.id);
			if( pl )
				this.players[i] = pl;
		}

		this.roleplay = Roleplay.loadThis(this.roleplay, this);
		
		// Pick the ambiance
		this.updateAmbiance();

	}

	// Overwrites active spells with spells from the database
	refetchActions(){
		for(let p of this.players)
			p.refetchActions();
		this.save();
	}











	/* Custom "events" */
	onEncounterDefeated(){

		this.encounter.completed = true;
		// Players won the encounter
		let winners = this.getTeamPlayers(0);
		let expReward = 0;
		for( let p of this.encounter.players )
			expReward += p.getExperienceWorth();
		for( let p of winners )
			p.addExperience(Math.ceil(expReward));	
		this.save();

	}

	async onEncounterLost( winningTeam ){
		
		// Allow enemies to steal
		let losers = shuffle(this.getPlayersNotOnTeam(winningTeam)),
			armorSteal = losers.slice();

		this.encounter.completed = false;

		// allow enemies to punish
		await delay(2000);
		let winners = shuffle(this.getAlivePlayersInTeam(winningTeam));
		for( let winner of winners ){
			if( !this.dm_writes_texts && winner.isNPC() ){	// Async function, check before each call
				let l = armorSteal.shift();
				// Allow steal
				if( l && !winner.isBeast() ){
					let gear = l.getEquippedAssetsBySlots([Asset.Slots.lowerbody, Asset.Slots.upperbody], true);
					let item = shuffle(gear).shift();
					if( item && Math.random() < 0.5 ){
						l.transferAsset(item.id, winner);
						game.ui.addText( winner.getColoredName()+" STOLE "+l.getColoredName()+"'s "+item.name+"!", undefined, winner.id, l.id, 'statMessage important' );
					}
				}
				winner.usePunishment( losers );
				await delay(3000);
			}
		}
		await delay(2000);

		for( let player of this.players )
			player.fullRegen();

		// Only regenerate nondead
		for( let winner of winners )
			winner.fullRegen();
		
		this.removeEnemies();
		// Return to the dungeon entrance
		this.ui.draw();

		
		game.ui.addText( "The players wake up at the dungeon's entrance!", undefined, undefined, undefined, 'center' );
		this.dungeon.goToRoom(losers[0], 0);
		
			
	}

	onDungeonExit(){
		new GameEvent({type:GameEvent.Types.dungeonExited, dungeon:this.dungeon}).raise();
	}
	onDungeonEntered(){
		new GameEvent({type:GameEvent.Types.dungeonEntered, dungeon:this.dungeon}).raise();
	}
	// Draw quest completed message
	onQuestCompleted( quest ){
		
		if( !(quest instanceof Quest) )
			return;
		this.playFxAudioKitById('questCompleted', undefined, undefined, undefined, true);
		this.ui.questAcceptFlyout( 'Quest Completed:', quest.name );
		if( this.is_host && this.net.id )
			this.net.dmQuestAccepted( 'Quest Completed:', quest.name );

	}
	onQuestAccepted( quest ){

		this.ui.questAcceptFlyout( 'Quest Started:', quest.name );
		this.playFxAudioKitById('questPickup', undefined, undefined, undefined, true);
		if( this.is_host && this.net )
			this.net.dmQuestAccepted( 'Quest Started:', quest.name );

	}
	// Raised before a room changes
	onRoomChange(){
		this.removeEnemies();
		this.ui.draw();
		for( let player of this.players )
			player.onCellChange();
	}
	// This one is raised both on host and client.
	// It's only raised on coop after the turn is changed proper, if a player dies, they're likely skipped
	onTurnChanged(){
		if( this.playerIsMe(this.getTurnPlayer(), true) )
			this.uiAudio('your_turn', 1);
		else
			this.uiAudio('turn_changed');
	}








	/* AUDIO */
	// Plays a sound. armor_slot is only needed for when a "punch/hit" sound specific to the armor of the player should be played
	// Internal only lets you play the sound without sharing it with the other players (if DM)
	async playFxAudioKitById(id, ...args ){

		const glibAudio = glib.audioKits;
		let kit = glibAudio[id];
		if( !kit )
			return console.error("Audio kit missing", id);
		
		return this.playFxAudioKit.apply(this, [kit].concat(args));

	}
	async playFxAudioKit(kit, sender, target, armor_slot, global = false ){
		
		let sid, tid;
		if( sender )
			sid = sender.id;
		if( target )
			tid = target.id;

		if( this.is_host && global )
			this.net.dmPlaySoundOnPlayer(sid, tid, kit.save(), armor_slot);

		const out = await kit.play(this.audio_fx, sender, target, armor_slot);
		return {kit:kit, instances:out};

	}

	uiAudio( sound, volume = 0.5, element = null ){
		// Todo: element location
		this.audio_ui.play( 'media/audio/ui/'+sound+'.ogg', volume, false );
	}

	uiClick( element ){
		this.uiAudio('click', 0.5, element );
	}

	setMasterVolume( volume = 1.0 ){
		setMasterVolume(volume);
	}
	// Supply falsy url to fade out
	async setMusic( url, volume = 1.0, loop = false ){

		if( this.active_music )
			this.active_music.stop(3000);
		if( !url )
			return;
		
		this.active_music_file = url;
		let song = await this.audio_music.play( url, volume, loop );
		if( url !== this.active_music_file )
			song.stop(0);
		else
			this.active_music = song;
	}
	// Unlike music, ambiance won't restart if you supply a url that's already playing
	async setAmbient( url, volume = 1.0, loop = true ){

		if( url === this.active_ambient_file )
			return;
		if( this.active_ambient )
			this.active_ambient.stop(3000);
		if( !url )
			return;
		
		this.active_ambient_file = url;
		let song = await this.audio_ambient.play( url, volume, loop );
		if( url !== this.active_ambient_file )
			song.stop(0);
		else
			this.active_ambient = song;
	}
	// Sets ambiance to the current room
	updateAmbiance(){
		let room = this.dungeon.getActiveRoom();
		if( room && room.ambiance )
			this.setAmbient(room.ambiance, room.ambiance_volume);
	}









	/* CHAT */
	logChat(){
		if( !this.is_host )
			return;
		this.chat_log.push([...arguments]);
		while( this.chat_log.length > Game.LOG_SIZE )
			this.chat_log.shift();
		if( this.initialized )
			this.save(true);
	}
	// Generates a chat message in DM mode of if an attack hit or not
	dmHitMessage( action, hit ){
		if( !this.dm_writes_texts || action.hidden )
			return;
		game.ui.addText( hit ? '(Hit)' : '(Miss)', undefined, undefined, undefined, 'dmInternal');
	}

	// Generates a chat message in DM mode of if an attack was riposted or not
	dmRiposteMessage( action ){
		if( !this.dm_writes_texts || action.hidden )
			return;
		game.ui.addText( '(Riposte)', undefined, undefined, undefined, 'dmInternal');
	}

	// Output a chat message as a character or OOC. UUID can also be "DM"
	speakAs( uuid, text, isOOC ){

		if( uuid === "DM" && !this.is_host ){
			game.modal.addError("You are not the DM");
			return;
		}

		if( uuid === 'ooc' )
			isOOC = true;

		if( uuid !== "DM" && !isOOC && (!this.getPlayerById(uuid) || !this.playerIsMe(this.getPlayerById(uuid))) )
			return game.modal.addError("Player not yours: "+uuid);

		if( !this.is_host )
			return this.net.sendPlayerAction(NetworkManager.playerTasks.speak, {
				player : uuid,
				text : text
			});

		if( text.substr(0,4) === 'ooc ')
			text = text.substr(4);

		text = text.trim();

		// Special case for DM as DM chat isn't tunneled through NetworkManager
		if( isOOC && uuid === 'ooc' )
			uuid = 'DM';

		const player = this.getPlayerById(uuid);
		// We are host
		let pl = "DM";
		// This lets you  use the uuid as a name directly, useful for ooc
		if( isOOC )
			pl = uuid;
		else if( uuid !== "DM" ){
			pl = this.getPlayerById(uuid);
			if(!pl)
				return game.modal.addError("Can't speak as player. Uuid "+uuid+" not found");
			pl = pl.getColoredName();
		}
		
		let isEmote = false;
		if( text.startsWith("/me") ){
			isEmote = true;
			text = text.substr(3).trim();
		}

		// This sends the text from DM netgame
		game.ui.addText(
			(isOOC ? '(OOC) ' : '')+pl+(isEmote ? ' ' : ": ")+text,
			undefined, 
			uuid, 
			undefined, 
			"playerChat sided "+
				(player && player.team !== 0 ? ' enemy' : ' friend' )+
				(pl==="DM" ? ' dmChat' : '')+
				(isEmote ? ' emote' : '')+
				(isOOC ? ' ooc' : '')
		);

	}







	/* DUNGEON */
	setDungeon( dungeon, saveState = true ){

		if( dungeon === this.dungeon )
			return;
		if( !(dungeon instanceof Dungeon) )
			return console.error(dungeon, "is not a dungeon");
		let pre = this.dungeon;
		if( pre.id !== this.id ){
			this.onDungeonExit();
			if( this.dungeon.label !== '_procedural_' && saveState )
				this.state_dungeons[this.dungeon.label] = this.dungeon.saveState();
		}
		this.dungeon = dungeon;
		this.dungeon.loadState(this.state_dungeons[this.dungeon.label]);
		this.updateAmbiance();
		this.onDungeonEntered();
		this.net.purgeFromLastPush(["dungeon"],["encounter"]);
		this.save();
		this.renderer.loadActiveDungeon();
	}
	/*
	// Dungeon
	generateDungeon(...args){
		const dungeon = Dungeon.generate(...args);
		dungeon.label = '_procedural_';
		this.setDungeon(dungeon);
		console.log("Setting dungeon", dungeon);
		this.state_dungeons._procedural_ = {};
		return this.dungeon;
	}

	*/





	/* QUEST */
	addRandomQuest( type, difficultyMultiplier = 1 ){
		// Todo: Remove this later
		this.quests = [];

		const dungeonType = [Dungeon.Shapes.Random, Dungeon.Shapes.SemiLinear][Math.round(Math.random())];
		const cells = 6+Math.floor(Math.random()*7);
		const dungeon = Dungeon.generate(
			cells, 
			undefined, 
			{
				difficulty:game.getTeamPlayers(0).length*difficultyMultiplier,
				shape : dungeonType,
				depth : -1,
			});
		if( !dungeon )
			return game.modal.addError("Unable to generate a dungeon");

		dungeon.label = '_procedural_';
		let quest = Quest.generate( type, dungeon, difficultyMultiplier);
		if( !quest )
			return false;

		// Todo: Remove this later
		this.addQuest(quest);
		this.setDungeon(dungeon);
		
		
	}
	addQuest(quest){
		if( this.quests.length > 5 )
			return this.modal.addError("Quest log is full.");
		if( !(quest instanceof Quest) )
			return this.modal.addError("Quest is not a Quest object");
		this.quests.push(quest);
		this.onQuestAccepted(quest);
		this.save();
	}
	removeQuest(questID){
		let quest = this.getQuestById(questID);
		if( !quest )
			return false;
		let pos = this.quests.indexOf(quest);
		if( pos === -1 )
			return false;
		this.quests.splice(pos, 1);
		this.save();
	}
	getQuestById(questID){
		for( let quest of this.quests ){
			if( quest.id === questID )
				return quest;
		}
		return false;
	}
		



	/* PLAYERS */

	// Add a player by data
	// If data is a Player object, it uses that directly
	addPlayer(data){

		let p = data;
		if( !p || !(p instanceof Player) )
			p = new Player(data);
		p.color = '';
		this.players.push(p);

		// Add before the current player
		if( this.battle_active ){
			
			this.initiative.splice(this.turn, 0, p.id);
			++this.turn;

		}

		this.assignAllColors();
		this.verifyLeader();

		if( this.initialized )
			this.save();
			
		this.ui.draw();
		return p;

	}

	// Remove a player by id
	removePlayer( id ){

		const isTurn = id === this.getTurnPlayer().id;

		for(let i in this.players){

			if(this.players[i].id === id){


				this.players.splice(i,1);
				if( this.battle_active ){

					for( let t in this.initiative ){

						if( this.initiative[t] === id ){

							this.initiative.splice(t, 1);
							break;

						}

					}

				}
				this.verifyLeader();
				if( isTurn && this.battle_active )
					this.advanceTurn();
				this.save();

				return true;
			}

		}

		return false;
	}

	// Removes all players not on team 0
	removeEnemies( deadOnly ){

		let p = this.players.slice();
		for( let pl of p ){

			if( pl.team !== 0 && (!deadOnly || pl.isDead()) )
				this.removePlayer(pl.id);

		}

	}

	// Makes sure there's a party leader
	verifyLeader(){
		let leaders = 0;
		for( let player of this.players ){
			if( player.leader && player.team === 0 )
				++leaders;
		}
		if( leaders )
			return;
		
		leaders = this.getTeamPlayers();
		if( leaders.length ){
			leaders[0].leader = true;
			game.save();
		}
	}

	// Gets all players on a team
	getTeamPlayers( team = 0 ){

		return this.players.filter(pl => pl.team === team);

	}

	getPlayersNotOnTeam( team = 0 ){
		return this.players.filter(pl => pl.team !== team);
	}

	// Gets the highest level player on a team, or if team is NaN, everyone
	getHighestLevelPlayer( team = 0 ){
		let out = 1;
		for( let player of this.players ){
			if( player.team === team || isNaN(team) )
				out = Math.max(out, player.level);
		}
		return out;
	}

	// Gets averate player level by team, or if team is NaN, everyone
	getAveragePlayerLevel( team = 0 ){
		let out = 0, divisor = 0;
		for( let player of this.players ){
			if( player.team === team || isNaN(team) ){
				out+=player.level;
				++divisor;
			}
		}
		if( !divisor )
			return 1;
		return Math.ceil(out/divisor);
	}

	// Gets party members of a player by Player object
	getPartyMembers( player ){

		let out = [];
		for( let p of this.players ){

			if( player.team === p.team )
				out.push(p);

		}
		return out;

	}

	// Checks if a Player object exists
	playerExists( player ){

		return this.getPlayerById(player.id);

	}

	// Gets a player by ID
	getPlayerById(id){

		for( let p of this.players ){

			if( p.id === id )
				return p;

		}
		return false;

	}

	getPlayerByLabel( label ){

		if( ! label )
			return false;
		for( let p of this.players ){

			if( p.label === label )
				return p;

		}
		return false;

	}

	
	
	// Gets the index of a Player object in this.players
	getPlayerIndex( player ){

		for( let i in this.players ){

			if( this.players[i] === player )
				return i;

		}
		return 0;

	}

	getAlivePlayersInTeam( team = 0 ){
		return this.getTeamPlayers(team).filter(pl => !pl.isDead());
	}

	// Checks if a player is owned by the netgame player. ExcludeDM can be used to ignore DM ownership
	playerIsMe( player, excludeDM = false ){

		if( this.is_host && !excludeDM )
			return true;

		return player.netgame_owner === this.net.id || (this.is_host && player.netgame_owner === 'DM');

	}

	turnPlayerIsMe(){
		return this.playerIsMe(this.getTurnPlayer());
	}

	// Gets my first player if I own one
	getMyActivePlayer(){

		const owned = this.getMyPlayers();
		for( let p of owned ){
			if( p.id === this.my_player )
				return p;
		}
		
		// Might be undefined
		this.my_player = null;
		if( owned[0] && !owned.netgame_owner ){
			this.my_player = owned[0].id;
			localStorage.my_player = owned[0].id;
		}
		return owned[0];
		
	}

	// Gets all players owned by me
	getMyPlayers(){

		return this.players.filter(el => {
			return this.playerIsMe(el, true);
		});

	}
	
	// Assigns a unique color to a player
	assignNewPlayerColor(player){

		let colors = [
			'#DFD','#FDD','#DDF','#FFD','#FDF','#DFF',
			'#FFF','#EDF','#DEF','#FED','#FDE','#DDD'
		];

		let taken = [];
		for(let p of this.players){
			if( p !== player && p.color !== '' )
				taken.push(p.color);
		}

		for( let color of colors ){
			if(taken.indexOf(color) === -1){
				player.color = color;
				return;
			}
		}
		player.color = '#EEE';

	}

	// Assigns unique colors to all players
	assignAllColors(){
		for( let pl of this.players )
			this.assignNewPlayerColor(pl);
	}

	// Equips an item to a player from inventory by Player, Asset.id
	equipPlayerItem( player, id ){

		let apCost = player.isAssetEquipped(id) ? Game.UNEQUIP_COST : Game.EQUIP_COST;
		if( game.battle_active ){
			

			if( player !== game.getTurnPlayer() ){
				game.modal.addError("Not your turn");
				console.error("not your turn error");
				return false;
			}
			if( player.ap < apCost ){
				game.modal.addError("Not enough AP");
				return false;
			}
		}

		if(!game.playerIsMe(player)){
			game.modal.addError("not your player");
			return false;
		}

		if( !this.is_host ){
			this.net.sendPlayerAction(NetworkManager.playerTasks.toggleGear, {
				player : player.id,
				item : id
			});
			return true;
		}

		if( !player.isAssetEquipped(id) ){
			if( !player.equipAsset(id, true) )
				return false;
		}
		else{
			if( !player.unequipAsset(id, true) )
				return false;
		}

		if( game.battle_active )
			player.addAP(-apCost);

		this.save();
		return true;

	}

	// Trades a player item
	tradePlayerItem( fromPlayer, toPlayer, id ){

		if( typeof fromPlayer === 'string' )
			fromPlayer = this.getPlayerById(fromPlayer);
		if( typeof toPlayer === "string" )
			toPlayer = this.getPlayerById(toPlayer);

		if( !fromPlayer || !toPlayer )
			return this.modal.addError("Player not found");
		if( !this.playerIsMe(fromPlayer) )
			return this.modal.addError("Not your player");
		if( fromPlayer.team !== toPlayer.team )
			return this.modal.addError("Invalid target");
			if( fromPlayer.id === toPlayer.id )
			return this.modal.addError("Can't trade with yourself");
		if( this.battle_active )
			return this.modal.addError("Can't trade in combat");
		

		const asset = fromPlayer.getAssetById(id);
		if( !asset )
			return this.modal.addError("Asset not found");

		if( !this.is_host ){
			this.net.playerTradeAsset(fromPlayer, toPlayer, asset);
			return;
		}

		if( asset.loot_sound )
			this.playFxAudioKitById(asset.loot_sound, fromPlayer, toPlayer, undefined, true );
		
		game.ui.addText( fromPlayer.getColoredName()+" hands "+toPlayer.getColoredName()+" their "+asset.name+"!", undefined, fromPlayer.id, toPlayer.id, 'statMessage important' );
		

		toPlayer.addAsset(asset);
		fromPlayer.destroyAsset(asset.id);
		game.ui.draw();
		this.save();
		return true;

	}

	// Deletes a player item by Player, Asset.id
	deletePlayerItem( player, id ){

		if(!game.playerIsMe(player)){
			game.modal.addError("not your player");
			return false;
		}

		const asset = player.getAssetById(id);
		if( !asset )
			return this.modal.addError("Asset not found");

		if( !this.is_host ){
			this.net.playerDeleteAsset(player, asset);
			return;
		}

		if( player.destroyAsset(id) ){
			this.save();
			return true;
		}
		return false;

	}

	// Deletes a player action by Player, Action.id
	deletePlayerAction( player, id ){

		if(!game.playerIsMe(player)){
			game.modal.addError("not your player");
			return false;
		}

		if( player.removeActionById(id) ){
			this.save();
			return true;
		}
		return false;

	}

	// Replaces all inventory and actions from the base library
	rebaseAllPlayers(){

		for(let p of this.players){

			p.refetchInventory();
			p.refetchActions();

		}
		this.save();

	}







	/* ENCOUNTER */
	// Start an encounter
	startEncounter( player, encounter, merge = false ){


		if( !encounter )
			return;
		
		// Merge should reset the encounter status
		if( merge ){
			this.encounter.completed = false;
			this.encounter.started = false;
		}else{
			// override the encounter
			this.encounter = encounter;
		}

		// Always prepare
		encounter.prepare();
		
		const started = this.encounter.started;
		this.encounter.started = true;


		// Update visible players
		this.removeEnemies(merge);
		for( let pl of encounter.players ){
			pl.netgame_owner = '';
			game.addPlayer(pl);
			// Merge the new players into the encounter
			if( merge )
				this.encounter.players.push(pl);
		}
		
		// Encounter isn't finished, start a battle 
		if( !this.encounter.completed ){
			
			if( !started ){

				let rp = this.encounter.getRP(player);
				if( !rp )
					rp = new Roleplay({finished:true}, this);
				this.setRoleplay(rp);

			}
		

			if( !encounter.friendly ){
				this.toggleBattle(true);
			}
			for( let wrapper of encounter.wrappers )
				wrapper.useAgainst( encounter.players[0], player );

		}


		if( encounter.startText && !started ){
			let text = new Text({text : encounter.startText});
			text.run(new GameEvent({
				sender : encounter.players[0],
				target : player,
				type : GameEvent.Types.encounterStarted,
				encounter : this.encounter
			}));
		}


		


		// Purge is needed after each overwrite
		game.save();
		this.ui.draw();
		
	}

	// Starting new encounters in a room that already has encounters needs to merge it into the main encounter
	mergeEncounter( player, encounter ){
		this.startEncounter(player, encounter, true);
	}

	






	/* COMBAT */
	// Turns battle on or off
	toggleBattle( on ){

		let pre = this.battle_active;
		if( on === undefined )
			this.battle_active = !this.battle_active;
		else
			this.battle_active = !!on;

		if( this.battle_active === pre )
			return;

		if( this.battle_active ){

			this.ui.battleVis();
			this.renderer.battleVis();
			
			// Battle just started, roll for initiative
			let initiative = this.players.map(el => {
				el.onBattleStart();
				// For now, there's no speed stat
				return {
					p : el,
					i : Math.random()
				};
			});

			initiative.sort((a,b) => {

				if( a.i === b.i )
					return 0;

				return a.i > b.i ? -1 : 1;

			});
			this.turn = -1;
			this.initiative = initiative.map(el => {
				return el.p.id;
			});

			new GameEvent({
				type : GameEvent.Types.battleStarted
			}).raise();
			this.advanceTurn();

		}
		else{

			for( let pl of this.players )
				pl.onBattleEnd();

			new GameEvent({
				type : GameEvent.Types.battleEnded
			}).raise();

		}

		this.save();
		this.ui.draw();
		this.renderer.onBattleStateChange();

	}

	// Toggles DM mode
	toggleAutoMode(){

		this.dm_writes_texts = !this.dm_writes_texts;
		this.save();
		this.ui.draw();

	}

	// Gets current turn player
	getTurnPlayer(){
		
		if( !this.battle_active )
			return false;
		return this.getPlayerById(this.initiative[this.turn]);

	}

	// Returns an array of team numbers standing
	teamsStanding(){
		let standing = [];
		for( let p of this.players ){
			
			if( !p.isDead() && standing.indexOf(p.team) === -1 )
				standing.push(p.team);

		}
		return standing;
	}

	// Checks if battle has ended
	checkBattleEnded(){

		if( !this.battle_active )
			return true;

		// Checks if at least one player of each team is standing
		let standing = this.teamsStanding();
		if( standing.length > 1 )
			return false;

		if( !this.encounter.finished ){

			let evt = GameEvent.Types.encounterLost;
			if( standing[0] !== undefined && standing[0] === 0 ){
				this.onEncounterDefeated();
				evt = GameEvent.Types.encounterDefeated;
			}
			else 
				this.onEncounterLost(standing[0]);

			new GameEvent({type:evt, encounter:this.encounter, dungeon:this.encounter.getDungeon()}).raise();

		}

		// Players won
		if( standing[0] !== undefined && standing[0] === 0 ){
			
			// Restore 40% HP and MP at the end of the battle
			this.getTeamPlayers(0).map(pl => {
				pl.addHP(Math.ceil(pl.getMaxHP()*0.4));
				pl.addMP(Math.ceil(pl.getMaxMP()*0.4));
			});

			let lootbags = [];
			// add loot from enemies
			for( let pl of this.players ){

				if( pl.hp <= 0 && pl.team !== 0 ){
					let assets = pl.assets;
					if( assets.length ){
						lootbags.push(assets);
						pl.assets = [];
					}
				}

			}

			this.dungeon.getActiveRoom().addLootBags(lootbags);
			
		}

		// Battle ended
		this.toggleBattle( false );	// Saves if there's a change
		return true;
		
	}

	// Wipes turn tags (tags set on players until the next attack text is added), ignorePlayers are players that should be ignored
	wipeTurnTags( ignorePlayers ){
		for( let p of this.players ){
			if( ignorePlayers.indexOf(p) === -1 )
				p._turn_tags = [];
		}
	}

	// Advances turn
	advanceTurn(){

		for( let i=0; i<this.players.length; ++i ){

			this.end_turn_after_action = false;
			let pl = this.getTurnPlayer();
			if( pl && !pl.isDead() )
				pl.onTurnEnd();

			++this.turn;
			if( this.turn >= this.initiative.length )
				this.turn = 0;

			let npl = this.getTurnPlayer();
			if( !npl || npl.isDead() )
				continue;
			
			new GameEvent({
				type : GameEvent.Types.turnChanged,
				sender : pl,
				target : npl
			}).raise();

			this.ui.captureActionMessage = true;
			npl.onTurnStart();
			this.ui.flushMessages();
			
			if( npl.isIncapacitated() || npl.isDead() )
				continue;

			if( this.end_turn_after_action )
				continue;

			if( !this.dm_writes_texts )
				setTimeout(() => {
					if( npl === this.getTurnPlayer() )
						npl.autoPlay();
				}, 1000);
			
			if( this.playerIsMe(npl, true) && npl.id !== this.my_player ){
				this.my_player = npl.id;
				localStorage.my_player = npl.id;
				this.ui.draw();
			}
				
			this.onTurnChanged();
			break;

		}

		this.save();
		this.ui.draw();
		

	}

	// Checks if end_turn_after_action is set and advances turn if it is
	checkEndTurn(){
		if( this.end_turn_after_action )
			this.advanceTurn();
		
	}

	// Fully regenerates HP of all players
	fullRegen(){

		for( let p of this.players )
			p.fullRegen();
		this.save();
		this.ui.draw();

	}

	// Use an action
	// netPlayer is needed when received by the DM after a player uses this method; so that certain effects like repair can be relayed
	useActionOnTarget( action, targets, player, netPlayer ){

		if( !player )
			player = this.getTurnPlayer();

		if( this.battle_active && this.getTurnPlayer() !== player ){
			console.error("not your turn error");
			return game.modal.addError("Not your turn");
		}

		if( !game.playerIsMe(player) )
			return game.modal.addError("Not your player");

		// Convert player to array, and none to []
		if( targets.constructor === Player )
			targets = [targets];
		else if( !targets )
			targets = [];
		
		if( !Array.isArray(targets) )
			return console.error("Unknown target type (array or Player expected)", targets);

		if( !this.is_host ){
			this.net.playerUseAction(player, action, targets);
			return true;
		}else
			this.ui.captureActionMessage = true;
		

		let att = player.useActionId( action.id, targets, netPlayer );
		this.save();
		this.ui.draw();
		this.ui.flushMessages();
		this.checkEndTurn();
		return att;

	}


	attemptFleeFromCombat( player ){

		if( !this.battle_active )
			return;

		let chance = 50;
		// Each AP benefit the party has over their opponents grant 2% bonus chance, starting at 50%
		for( let p of this.players ){
			let add = p.ap;
			if( p.isDead() )
				add = 0;
			if( p.team !== player.team )
				add = -add;
			chance += add*2;
		}

		if( Math.random()*100 < chance )
			return this.execFleeFromCombat( player );
		player.addAP(-2);
		this.ui.addText( player.getColoredName()+" calls for a retreat, but the party fails to escape!", undefined, player.id, player.id );

	}

	execFleeFromCombat( player ){

		this.ui.addText( player.getColoredName()+" calls for a retreat, the party succeeds in escaping!", undefined, player.id, player.id );
		this.toggleBattle(false);
		this.dungeon.goToRoom( player, this.dungeon.previous_room );	// Saves

	}



	// Roleplay
	useRoleplayOption( senderPlayer, option_id ){

		const opt = this.roleplay.getActiveStage().getOptionById(option_id);
		if( !opt ){
			console.error("Opt not found", option_id);
			return false;
		}
		
		if( !this.is_host ){
			this.ui.addError("Todo: Netcode roleplay");
			return false;
		}

		if( opt.use(senderPlayer) ){
			
			this.ui.drawRoleplay();
			this.save();

		}
		else
			console.error(senderPlayer, "is unable to use the option", opt);

	}

	setRoleplay( rp ){

		this.roleplay = rp.clone(this);

		this.ui.draw();
		if( this.roleplay.stages.length )
			this.ui.toggle(true);

	}


	/* ASSETS */
	useRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID){

		if( !this.playerIsMe(senderPlayer) )
			return this.modal.addError("Not your player");

		if( !this.is_host )
			return this.net.playerUseRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID);

		let kitAsset = senderPlayer.getAssetById(repairKitID);
		let targetAsset = targetPlayer.getAssetById(assetID);
		if( !kitAsset )
			return this.modal.addError("Repair kit not found");
		if( !targetAsset )
			return this.modal.addError("Target asset not found");

		this.execRepairWithAsset(senderPlayer, targetPlayer, kitAsset, targetAsset);

	}

	// Executes a repair with assets
	execRepairWithAsset( senderPlayer, targetPlayer, kitAsset, targetAsset ){

		let repairAmount = kitAsset.getRepairPointsFromUseAction( targetAsset, senderPlayer, targetPlayer );
		
		if( !repairAmount )
			return console.error("No repair points in use action of asset", kitAsset);

		if( targetAsset.durability >= targetAsset.getMaxDurability() )
			return console.error("Item already repaired", targetAsset);

		let points = targetAsset.repair(repairAmount);
		kitAsset.consumeCharges(1);
		this.save();

		game.ui.addText( senderPlayer.getColoredName()+" restores "+points+" durability to "+targetPlayer.getColoredName()+"'s "+targetAsset.name+".", undefined, senderPlayer.id, targetPlayer.id, 'statMessage cloth Mend' );
		this.playFxAudioKitById('repair', senderPlayer, targetPlayer, undefined, true);
		this.ui.draw();

	}



	/* GAME-LIBRARY MANAGEMENT 
		The game library is separate from GameLib in that it handles ad-hoc DM created assets and NPCs
		Assets in this library are pushed into glib when a game is loaded
	*/

	// Adds an asset to a library by Asset.constructor
	// This is primarily useful for custom assets or actions you want to reuse
	addToLibrary( asset ){

		let library = this.getLibrary( asset );
		if( !library )
			return false;
		
		this.removeFromLibrary( asset );
		library[asset.label] = asset;

		glib.rebase();
		return true;

	}

	// Removes an asset from a library by Asset.constructor
	removeFromLibrary( asset ){

		let library = this.getLibrary(asset);
		if( !library )
			return false;

		delete library[asset.label];
		glib.setCustomAssets(library);

	}

	// Helper for the above methods Returns a library of only custom items
	// Asset can be an object or string
	getLibrary( asset ){

		if( !asset ){
			console.error("Invalid library", asset);
			return false;
		}

		if( typeof asset !== "string" )
			asset = asset.constructor.name;

		if( asset === "Asset" )
			return this.libAsset;

		console.error("No local library implemented yet for", asset.constructor.name);
		return false;

	}

}

Game.active = [];
Game.db = new Dexie("game");
Game.db.version(1).stores({
	games: 'id'
});

Game.EQUIP_COST = 4;
Game.UNEQUIP_COST = 2;
Game.LOG_SIZE = 300;

Game.load = async () => {
	
	if( game instanceof Game )
		game.destructor();

	game = new Game();

	let hash = window.location.hash;
	if( hash.charAt(0) === '#' )
		hash = hash.substr(1);
	hash = hash.split('/');

	const hashTask = hash.shift();
	if( hashTask === 'net' ){
		const gameID = hash.shift();
		let html = '<form id="joinOnlineGame">'+
			'<h1>Join Online Game</h1>'+
			'Nickname: <input type="text" value="'+esc(game.net.getStandardNick() || 'Anonymous #'+Math.floor(Math.random()*9999))+'">'+
			'<input type="submit" value="Join" />'+
		'</form>';
		game.modal.set(html);
		$("#joinOnlineGame").on('submit', event => {
			event.preventDefault();
			event.stopImmediatePropagation();
			const nick = $("#joinOnlineGame input[type=text]").val().trim();
			if( !nick )
				return game.modal.addError("Please enter a proper nickname");
			game.net.joinGame(gameID, nick);
			game.modal.close();
		});
		game.ui.draw();
		return;
	}

	if(localStorage.game){
		try{
			let g = await Game.db.games.get(localStorage.game);
			if(g)
				return game.load(g);
		}catch(err){
			console.error(err);
		}
	}

	game.ui.drawMainMenu();

};

// Create a new game
Game.new = async (name, players) => {
	if( game )
		game.destructor();
	game = new Game(name);

	if( Array.isArray(players) ){
		for( let player of players )
			game.addPlayer(player);
	}
	game.initialized = true;
	await game.execSave( true );
};

// Converts the current game into a netgame
Game.joinNetGame = () => {
	
	game.is_host = false;
	game.name = '_Netgame_';

};

Game.delete = async id => {
	await Game.db.games.delete(id);
	if( game.id === id ){
		Game.load();
	}
};


// Bind events
GameEvent.on(GameEvent.Types.playerDefeated, event => {
	game.checkBattleEnded();
	// Check if event player is in the current encounter
	if( ~game.encounter.players.indexOf(event.target) ){
		event.encounter = game.encounter;
		event.dungeon = game.encounter.getDungeon();
	}
});


// ALL event capture. Must be below the playerDefeated binding above
GameEvent.on(GameEvent.Types.all, event => {
	for( let quest of game.quests )
		quest.onEvent(event);
});

Game.getNames = async () => {

	let names = {};	// id:name
	await Game.db.games.each(g => {
		let name = g.name;
		if(!name)
			name = "Unnamed";
		names[g.id] = name;
	});
	return names;

}

