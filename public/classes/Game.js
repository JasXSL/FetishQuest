import Player from './Player.js';
import Generic from './helpers/Generic.js';
import UI from './UI.js';
import Modal from './Modal.js';
import GameEvent from './GameEvent.js';
import Asset from './Asset.js';
import NetworkManager from './NetworkManager.js';
import {default as Dungeon, DungeonSaveState} from './Dungeon.js';
import WebGL from './WebGL.js';
import Text from './Text.js';
import Quest from './Quest.js';
import {default as Audio, setMasterVolume}  from './Audio.js';
import Roleplay from './Roleplay.js';
import { Wrapper } from './EffectSys.js';
import GameAction from './GameAction.js';
import Collection from './helpers/Collection.js';
import Shop, { ShopSaveState } from './Shop.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import Condition from './Condition.js';
import VibHub from './VibHub.js';
import Faction from './Faction.js';
import Encounter from './Encounter.js';
import StaticModal from './StaticModal.js';
import * as THREE from '../ext/THREE.js';

export default class Game extends Generic{

	constructor(name){
		super(name);

		this.name = name;
		if( !this.name )
			this.name = "Unnamed Adventure";
		this.players = [];
		this.renderer = new WebGL();
		this.ui = new UI(this);
		this.turn = 0;
		this.is_host = true;
		this.battle_active = false;
		this.initiative = [];				// Turn order
		this.initialized = false;			// might happen multiple times from the load function
		this.full_initialized = false;		// Only happens once
		this.chat_log = [];					// Chat log
		this.net = new NetworkManager(this);
		this.dungeon = new Dungeon({}, this);					// if this is inside a quest, they'll share the same object
		this.encounter = new Encounter({completed:true}, this);		// if this is inside a dungeon, they'll be the same objects
		this.roleplay = new Roleplay({completed:true}, this);
		this.quests = [];								// Quest Objects of quests the party is on. 
		this.net_load = false;							// Currently loading from network
		this.time = 3600*10;							// Time in seconds. Game starts at 10 in the morning of the first day

		// This is used to save states about dungeons you're not actively visiting, it gets loaded onto a dungeon after the dungeon loads
		// This lets you save way less data
		this.state_dungeons = new Collection();			// label : (obj)dungeonstate - See the dungeon loadstate/savestate. Dungeon stage is fetched from a method in Dungeon
		this.completed_quests = new Collection();		// label : {objective_label:true,__time:(int)time_completed}
		this.state_roleplays = new Collection();		// label : (collection){completed:(bool), stage:(int)} - These are fetched by the Dungeon object. They're the same objects here as they are in dungeon._state
		this.procedural = [];							// Dungeon objects
		this.proceduralDiscovery = new Collection();	// label : {perc:(float)exploredPercentage}
		this.state_shops = new Collection();			// label : (obj)shopState
		this.difficulty = 5;							// Scale between 0 and 10. Below 5 and it reduces damage taken by 15% per tier. Above 5 and it reduces damage done by 15% per tier.
		this.factions = [];

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
		this.active_rain = null;
		this.active_rain_file = null;

		this.save_timer = null;
		this.ignore_netgame = true;						// For above, set to false if there's a call is added to the timer without ignore

		this.mute_spectators = +localStorage.muteSpectators || 0;	// Shouldn't be saved, but sent to net
		this.my_player = localStorage.my_player;

		this.end_turn_after_action = false;				// When set, ends turn after the current action completes

		this.rain_next_refresh = 0;						// When to randomize rain status next time
		this.rain_started = 0;							// Time when the rain started
		this.rain_start_val = 0;						// Value of last rain so we can tween
		this.rain = 0.0;								// Level to fade to (over 2 minutes)

		this.hotkeys = [1,2,3,4,5,6,7,8,9,0];

		this._turn_timer = false;						// Timeout handling end of turn
		this._db_save_timer = null;						// Timer to store on HDD		
		this._caches = 0;								// Level of depth of cache requests we're at

		this._looted_players = {};						// local only, contains id : true for players looted in this room

	}

	destructor(){

		this.renderer.destructor();
		this.ui.destructor();
		this.net.destructor();
		this.renderer.destructor();
		this.setMusic();
		this.setAmbient();
		this.setRainSound();
		GameEvent.reset();

	}

	initialize(){

		if( this.full_initialized )
			return;
		this.full_initialized = true;
		// Bind events
		GameEvent.on(GameEvent.Types.playerDefeated, event => {
			this.checkBattleEnded();
			// Check if event player is in the current encounter
			if( ~this.encounter.players.indexOf(event.target) ){
				event.encounter = this.encounter;
				event.dungeon = this.encounter.getDungeon();
			}
		});
		// ALL event capture. Must be below the playerDefeated binding above
		GameEvent.on(GameEvent.Types.all, event => {

			for( let quest of this.quests )
				quest.onEvent(event);

			if( event.type !== GameEvent.Types.actionUsed || !event.action.no_use_text )
				Text.runFromLibrary(event.clone());

			VibHub.onEvent(event);

		});

		window.onerror = (...args) => this.onError(...args);

	}

	onError(...args){
		args[0] = args[0].split('Uncaught ');
		args[0].shift();
		args[0] = args[0].join('Uncaught ');
		this.ui.modal.addError(args[0]);
	}


	/* LOADING/SAVING */

	// full = false filters out some data that shouldn't be sent to the netgame players
	getSaveData( full ){

		let out = {
			id : this.id,
			players : Player.saveThese(this.players, full),
			turn : this.turn,
			battle_active : this.battle_active,
			initiative : this.initiative.slice(),	
			dungeon : this.dungeon.save(full),
			encounter : this.encounter.save(full),
			quests : this.quests.map(el => el.save(full)),
			roleplay : this.roleplay.save(full),
			completed_quests : this.completed_quests.save(),	// A shallow clone is enough
			time : this.time,
			state_shops : this.state_shops.save(full),
			rain : this.rain,
			factions : Faction.saveThese(this.factions, full),
			proceduralDiscovery : this.proceduralDiscovery.save(full)
		};

		out.state_dungeons = this.state_dungeons.save(full);
		out.state_roleplays = this.state_roleplays.save();

		
		if( full ){
			out.libAsset = {};
			out.rain_next_refresh = this.rain_next_refresh;
			out.rain_start_val = this.rain_start_val;
			out.rain_started = this.rain_started;
			out.difficulty = this.difficulty;
			out.procedural = Dungeon.saveThese(this.procedural, full);

			Object.values(this.libAsset).map(el => out.libAsset[el.label] = el.save(full));
			out.name = this.name;
			out.id = this.id;
			out.chat_log = this.chat_log;
		}
		else{
			out.mute_spectators = this.mute_spectators;
		}

		return out;
	}

	// Async file save
	save( ignoreNetGame ){

		if( !ignoreNetGame )
			this.ignore_netgame = false;

		clearTimeout(this.save_timer);

		this.save_timer = setTimeout(() => {
			
			this.save_timer = null;
			this.execSave(false, this.ignore_netgame);
			
		}, 100);
		
	}

	async saveToDB( data ){
		try{
			await Game.db.games.put(data);
		}catch(err){
			console.error("Error in saving", err);
		}
	}

	async execSave( allowInsert, ignoreNetGame ){

		let time = Date.now();
		if( !this.initialized && !allowInsert ){
			console.error("ini error");
			this.ui.modal.addError("Unable to save, game failed to intialize");
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

		localStorage.game = this.id;

		// First insert
		if( allowInsert ){
			await this.saveToDB(this.getSaveData(true));
			this.initialize();
			this.load();
		}
		// Save
		else{
			clearTimeout(this._db_save_timer);
			this._db_save_timer = setTimeout(() => {
				this.lockPlayersAndRun(() => {
					this.saveToDB(this.getSaveData(true));
				});
			}, 3000);
		}

		//console.log("Save took", Date.now()-time);

		
	}

	// Std load
	async load( data ){

		this.initialized = false;		// prevents text sounds from being played when a netgame loads
		this.g_autoload(data);

		// Custom ad-hoc libraries do not need to be rebased
		for( let i in this.libAsset )
			this.libAsset[i] = new Asset(this.libAsset[i]);

		// Auto wrappers need all players loaded before generating
		if( this.is_host )
			this.players.map(pl => pl.initialize());

		
		
		//await glib.autoloadMods();
		glib.setCustomAssets(this.libAsset);

		this.ui.draw();
		if( !this.roleplay.persistent && this.is_host && this.full_initialized )
			this.clearRoleplay();

		// Load the chat log
		let log = this.chat_log.slice();
		this.chat_log = [];
		for( let ch of log )
			this.ui.addText.apply(this.ui, ch);
		
		this.assignAllColors();
		this.initialized = true;
		this.initialize();

		this.ui.ini(this.renderer.renderer.domElement, this.renderer.fxRenderer.domElement);
		
		

		// Make sure a dungeon exists
		/*
		if( !this.dungeon || !this.dungeon.rooms.length )
			this.addRandomQuest();
		*/
		if( this.dungeon.label ){
			this.dungeon.loadState();
			this.renderer.loadActiveDungeon();
		}
		this.verifyLeader();

		this.encounter.onPlacedInWorld( false );	// Sets up event bindings and such

	}

	loadFromNet( data ){

		const mute_pre = this.mute_spectators && !this.getMyActivePlayer();
		const time_pre = this.time;
		let turn = this.getTurnPlayer();
		this.net_load = true;
		this.g_autoload(data, true);
		this.net_load = false;
		let nt = this.getTurnPlayer();
		if( turn.id !== nt.id )
			this.onTurnChanged();
		this.dungeon.loadState();

		// Handle mute state change
		if( mute_pre !== (this.mute_spectators && this.getMyActivePlayer()) )
			this.ui.updateMute();

		if( this.time !== time_pre )
			this.onTimeChanged();

	}

	// Automatically invoked after g_autoload() in load()
	rebase(){

		this.state_dungeons = Collection.loadThis(this.state_dungeons);
		for( let i in this.state_dungeons ){
			this.state_dungeons[i] = new DungeonSaveState(this.state_dungeons[i]);
		}
		
		this.quests = Quest.loadThese(this.quests, this);		
		this.dungeon = new Dungeon(this.dungeon, this);
		this.encounter = new Encounter(this.encounter, this);
		// Players last as they may rely on the above
		this.players = Player.loadThese(this.players, this);
		this.completed_quests = Collection.loadThis(this.completed_quests);
		this.factions = Faction.loadThese(this.factions);
		
		// shops have 3 layers of recursive collections
		this.state_shops = Collection.loadThis(this.state_shops);
		for( let i in this.state_shops )
			this.state_shops[i] = new ShopSaveState(this.state_shops[i], this);
		

		this.state_roleplays = Collection.loadThis(this.state_roleplays);
		for( let i in this.state_roleplays ){
			if( typeof this.state_roleplays[i] !== 'function' )
				this.state_roleplays[i] = Collection.loadThis(this.state_roleplays[i], this);
		}

		this.procedural = Dungeon.loadThese(this.procedural);
		this.proceduralDiscovery = Collection.loadThis(this.proceduralDiscovery);

		// Map Quests and Players
		// If our current encounter is in the current dungeon, then use the dungeon encounter object
		let encounter = this.dungeon.getStartedEncounterById(this.encounter.id);
		if( encounter ){
			this.encounter = encounter;
		}

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

	// Wipes completed and active quests, and dungeon history
	clearQuestAndDungeonHistory(){
		this.quests = [];
		this.completed_quests = new Collection();
		this.state_dungeons = new Collection();
		this.save();
	}

	clearRoleplayHistory(){
		this.state_roleplays = new Collection();
	}

	toggleAFK(){
		// game.net.isPlayerAFK(this.netgame_owner)
		if( !this.net.isConnected() )
			return false;
		
		this.net.playerToggleAFK();

	}










	/* Custom "events" */
	onEncounterDefeated(){

		this.encounter.setCompleted(true);
		// Players won the encounter
		let winners = this.getTeamPlayers(0);
		let expReward = 0;
		for( let p of this.encounter.players ){

			if( p.team !== Player.TEAM_PLAYER ){ 
				
				new GameEvent({
					type : GameEvent.Types.encounterEnemyDefeated,
					sender : winners[0],
					target : p,
					encounter : this.encounter,
					dungeon : this.dungeon,
					room : this.dungeon.getActiveRoom(),
				}).raise();
				expReward += p.getExperienceWorth();

			}

		}
		for( let p of winners )
			p.addExperience(Math.ceil(expReward));
		this.save();

	}

	async onEncounterLost( winningTeam ){
		
		// Allow enemies to steal
		let losers = shuffle(this.getPlayersNotOnTeam(winningTeam)),
			armorSteal = losers.slice();

		this.encounter.setCompleted(false);

		// allow enemies to punish
		await delay(2000);
		let winners = shuffle(this.getAlivePlayersInTeam(winningTeam));
		for( let winner of winners ){
			if( winner.isNPC() ){	// Async function, check before each call

				let l = armorSteal.shift();
				// Allow steal
				if( l && !winner.isBeast() ){

					let gear = l.getEquippedAssetsBySlots([Asset.Slots.lowerBody, Asset.Slots.upperBody], true);
					let item = shuffle(gear).shift();
					if( item && Math.random() < 0.5 && !item.soulbound ){
						l.transferAsset(item.id, winner);
						game.ui.addText( winner.getColoredName()+" STOLE "+l.getColoredName()+"'s "+item.name+"!", undefined, winner.id, l.id, 'statMessage important' );
					}

				}
				winner.usePunishment( losers );
				await delay(3000);

			}
		}
		await delay(2000);

		for( let player of this.players ){
			if( player.team === 0 || !player.isDead() ){
				player.fullRegen();
				player.arousal = 0;
			}
		}
		
		// Return to the dungeon entrance
		this.ui.draw();
		
		game.ui.addText( "The players wake up at the dungeon's entrance!", undefined, undefined, undefined, 'center' );
		this.dungeon.goToRoom(losers[0], 0);
		
			
	}

	// Raised after each save, both on host and client
	onGameUpdate(data){
		this.ui.modal.onGameUpdate(data);
		StaticModal.onGameUpdate(data);
	}

	onDungeonExit(){
		new GameEvent({type:GameEvent.Types.dungeonExited, dungeon:this.dungeon}).raise();
	}
	onDungeonEntered(){

		this._looted_players = {};	// Reset looted players
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

		const objectives = {
			__time : this.time,
		};
		for( let objective of quest.objectives )
			objectives[objective.label] = objective._amount;
		
		this.completed_quests.set(quest.label, objectives);
	

		this.save();
		

	}
	// Only put visuals here, use addQuest for data
	onQuestAccepted( quest ){

		this.ui.questAcceptFlyout( 'Quest Started:', quest.name );
		this.playFxAudioKitById('questPickup', undefined, undefined, undefined, true);
		this.ui.gameIconPop('quest');
		if( this.is_host && this.net )
			this.net.dmQuestAccepted( 'Quest Started:', quest.name );

	}
	// Raised before a room changes
	onRoomChange(){

		this.clearRoleplay();
		this.removeGeneratedPlayers();
		this.ui.draw();
		for( let player of this.players )
			player.onCellChange();
		this.addSeconds(30);

		// Update exploration
		if( this.dungeon.procedural ){

			this.discoverProceduralDungeon(this.dungeon.label);

			const disc = this.proceduralDiscovery.get(this.dungeon.label),
				explored = this.dungeon.getNumExploredRooms()/this.dungeon.rooms.length
			;
			
			if( explored != disc.perc )
				disc.perc = explored;

		}
		
	}
	// This one is raised both on host and client.
	// It's only raised on coop after the turn is changed proper, if a player dies, they're likely skipped
	onTurnChanged(){
		const tp = this.getTurnPlayer();
		if( this.playerIsMe(tp, true) )
			this.uiAudio('your_turn', 1);
		else
			this.uiAudio('turn_changed');

		this.setTurnTimer();

	}
	// force can be set to a float to force the rain value
	onTimeChanged( force ){
		
		const rainChance = 0.1;

		// Weather
		if( this.time >= this.rain_next_refresh ){

			// Generate new weather
			const isRaining = Math.random() < rainChance;	// 20% chance of rain
			if( isRaining )
				this.setRain(Math.random()*0.9+0.1);
			else
				this.setRain();

		}
		
		this.updateProceduralStates();

		this.renderer.updateWeather();
		this.updateAmbiance();			// Handle rain sounds and updates the room

		this.players.map(player => player.onTimePassed());

	}

	// Asset isn't present when received from the netgame atm
	onInventoryAdd( player, asset ){

		if( !(player instanceof Player) )
			return;


		if( player === this.getMyActivePlayer() )
			this.ui.gameIconPop('inventory');

		if( this.net.isHostingNetgame() && player.netgame_owner !== 'DM' ){
			console.log("Sending to ", player, "asset", asset);
			this.net.dmInventoryAdd(player, asset);
		}
		

	}

	onPlayerLevelup( player, levelsGained = 1 ){
		game.ui.addText( player.getColoredName()+" gained "+levelsGained+" level"+(levelsGained !== 1 ? 's' :'')+" and is now level "+player.level+"!", undefined, player.id, player.id, 'levelup' );
		
		game.renderer.playFX(player, player, 'levelup', undefined, true, Boolean(this.levelUpVisTimeout) );	
		if( !this.levelUpVisTimeout )
			this.levelUpVisTimeout = setTimeout(() => this.levelUpVisTimeout = null, 1000);
		
	}

	setRain( val = 0 ){

		if( isNaN(val) )
			return;
		// min 5 min between updates, max 2h
		this.rain_next_refresh = game.time + Math.floor(300+Math.random()*3600*2);
		this.rain_started = this.time;
		this.rain_start_val = this.rain;
		this.rain = val;
		this.updateAmbiance();
		if( this.renderer.stage )
			this.renderer.stage.onTimeChanged();

	}



	/* TIME */
	addSeconds(seconds){
		seconds = +seconds||0;
		this.time += parseInt(seconds);
		this.onTimeChanged();
	}
	addMinutes(minutes){
		minutes = +minutes || 0;
		this.addSeconds(minutes*60);
	}
	addHours(hours){
		hours = +hours || 0;
		this.addSeconds(hours*3600);
	}
	addDays(days){
		days = +days || 0;
		this.addSeconds(days*3600*24);
	}
	

	// returns a value between 0 and 1 from midnight to midnight
	getDayPercentage(){
		const day = 3600*24;
		return (this.time%day)/day;
	}
	getHoursOfDay(){
		return this.getDayPercentage()*24;
	}
	// Sleep players
	sleep( player, dungeonAsset, duration ){

		if( !player.isLeader() )
			return false;
		if( !dungeonAsset || !dungeonAsset.interactions.length )
			return false;
		const sleepInteractions = dungeonAsset.interactions.filter(e => e.type === GameAction.types.sleep);
		if( !sleepInteractions.length ){
			console.error("Sleep interaction not found");
			return false;
		}
		duration = parseInt(duration);
		if( isNaN(duration) || duration < 1 )
			return false;

		if( !this.is_host ){
			this.net.playerSleep(player, dungeonAsset, duration);
			return false;
		}
		
		this.net.dmBlackScreen();
		this.ui.toggleBlackScreen(() => {
			this.addHours(duration);
			const pl = game.getTeamPlayers();
			for( let p of pl ){
				p.addHP(20*duration);
				p.addArousal(-5*duration);
				p.addMP(5*duration);
				this.save();
				this.ui.draw();
			}
		});
		this.ui.addText("You rest for "+duration+" hour"+(duration !== 1 ? 's' : '')+".", "sleep", player.id, player.id, 'sleep');
		
	}


	/* Turn timer */
	onTurnTimerChanged(){
		if( !this.turnTimerEnabled() )
			this.endTurnTimer();
		else if( !this._turn_timer )
			this.setTurnTimer();
	}

	endTurnTimer(){
		clearTimeout(this._turn_timer);
		this._turn_timer = false;
	}

	turnTimerEnabled(){

		if( !this.is_host )
			return false;
		const tt = +localStorage.turnTimer,
			tp = this.getTurnPlayer();
		return ( tt && this.net.isConnected() && this.battle_active && tp && !tp.isNPC() );

	}
	
	setTurnTimer(){

		if( !this.turnTimerEnabled() )
			return;

		this.endTurnTimer();
		this._turn_timer = setTimeout(() => {
			
			if( this.isMyTurn() )
				game.ui.toggleRope(15);
			
			this.net.dmRope(this.getTurnPlayer(), 15);
			
			this._turn_timer = setTimeout(() => {
				this.advanceTurn();
			}, 15000);

		}, 60000);

	}

	// Returns math vars for the game
	getMathVars(){
		const out = {
			'g_rain' : game.getRain(),			// Current rain (float)
			'g_sod' : game.time%(3600*24),		// Seconds of day (int)
			'g_time' : game.time,
		};
		// All quests
		const all = glib.getFull('Quest');
		for( let q in all ){
			out['q_'+q+'__time'] = this.completed_quests[q] && this.completed_quests[q].__time || 0;
		}

		// g_team_n = nrPlayers
		const teams = {};
		let maxTeam = 0;
		const players = this.getEnabledPlayers();
		for( let player of players ){
			const t = 't_'+player.team;
			if( !teams[t] )
				teams[t] = 1;
			else
				++teams[t];
			if( player.team > maxTeam )
				maxTeam = player.team;
		}
		for( let i=0; i<maxTeam+1 || i<2; ++i )
			out['g_team_'+i] = teams['t_'+i] || 0;

		// fac_<factionLabel> = standing
		const fac = Object.values(glib.getFull('Faction'));
		for( let f of fac )
			out['fac_'+f.label] = f.standing;
		for( let f of this.factions )
			out['fac_'+f.label] = f.standing;

		return out;
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
	async playFxAudioKit(kit, sender, target, armor_slot, global = false, vol_multi = 1.0 ){
		
		let sid, tid;
		if( sender )
			sid = sender.id;
		if( target )
			tid = target.id;

		if( this.is_host && global )
			this.net.dmPlaySoundOnPlayer(sid, tid, kit.save(), armor_slot, vol_multi);

		const out = await kit.play(this.audio_fx, sender, target, armor_slot, vol_multi);
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
	getMasterVolume(){
		return +localStorage.masterVolume || 0;
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
		this.updateAmbiance();	// Handles volume shift for rain
	}

	async setRainSound(url, volume = 1.0, loop = true){
		if( url === this.active_rain_file ){
			return;
		}

		if( this.active_rain )
			this.active_rain.stop(5000);
		this.active_rain_file = url;

		if( url ){
			const song = await this.audio_ambient.play( url, volume, loop );
			if( url !== this.active_rain_file ){
				song.stop(3000);
			}
			else{
				this.active_rain = song;
				const vol = 0.25+(this.rain*0.75);
				song.setVolume(vol, 1);
			}
		}

	}

	// Sets ambiance to the current room
	async updateAmbiance(){

		const rain = this.getRain();
		let room = this.dungeon.getActiveRoom();
		if( room && room.ambiance )
			this.setAmbient(room.ambiance, room.ambiance_volume);

		if( this.active_ambient )
			this.active_ambient.setVolume(this.active_ambient.startVolume*(1-(rain-.01)));
		
		let rainSound = '';
		if( rain > 0 )
			rainSound = 'rain_light';
		if( rain > 0.33 )
			rainSound = 'rain_moderate';
		if( rain > 0.75 )
			rainSound = 'rain_heavy';
		const file = rainSound ? '/media/audio/ambiance/'+rainSound+'.ogg' : false;
		this.setRainSound(file, 0.01, true);
		

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
	// Output a chat message as a character or OOC. UUID can also be "DM"
	speakAs( uuid, text, isOOC ){

		if( uuid === "DM" && !this.is_host )
			throw "You are not the DM";

		if( uuid === 'ooc' )
			isOOC = true;

		if( uuid !== "DM" && !isOOC && ((!this.getPlayerById(uuid) && !game.is_host) || !this.playerIsMe(this.getPlayerById(uuid))) )
			throw "Player not yours";

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
				throw("Player UUID not found");
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
	setDungeon( dungeon, room = 0, resetSaveState = false, difficulty = -1 ){

		if( dungeon === this.dungeon )
			return;
		
		if( typeof dungeon === "string" )
			dungeon = glib.get(dungeon, 'Dungeon');
		if( !(dungeon instanceof Dungeon) )
			return console.error(dungeon, "is not a dungeon");

		let pre = this.dungeon;
		if( pre.id !== this.id ){
			this.onDungeonExit();
		}
		this.dungeon = dungeon;
		this.dungeon.previous_room = this.dungeon.active_room = room;
		if( resetSaveState ){
			this.dungeon.resetRoleplays();
			this.dungeon.resetState();
		}else{
			this.dungeon.loadState();
		}
		this.dungeon.difficulty = difficulty;
		this.updateAmbiance();
		this.onDungeonEntered();
		this.dungeon.onEntered();
		this.net.purgeFromLastPush(["dungeon"],["encounter"]);
		this.save();
		this.renderer.loadActiveDungeon();

	}

	// Sets the dungeon to a procedural one. Data corresponds to proceduralDungeon data in GameAction
	setProceduralDungeon( data = {} ){

		const label = data.label;
		if( !label )
			throw 'Trying to set procedural dungeon without label';

		let dungeon = this.getProceduralDungeon( label );

		if( !dungeon ){

			let kit = data.templates;
			if( Array.isArray(kit) )
				kit = randElem(kit);

			dungeon = Dungeon.generate(16, kit, data.settings);
			dungeon.label = label;
			dungeon.g_resetID();

			this.procedural.push(dungeon);
			this.updateProceduralStates();

		}
		this.setDungeon(dungeon);


	}

	getProceduralDungeon( label ){

		for( let dungeon of this.procedural ){

			if( dungeon.label === label )
				return dungeon;

		}

		return false;

	}

	// Discovers a procedural dungeon if not already discovered
	discoverProceduralDungeon( label ){

		if( this.proceduralDiscovery.get(label) )
			return;
		this.proceduralDiscovery.set(label, {perc:0});

	}

	updateProceduralStates(){

		let needSave = false;
		const week = 3600*24*7;
		// Procedural
		for( let d of this.procedural ){
			
			if( this.time-d.procedural > week ){

				this.removeProceduralDungeonState(d);
				needSave = true;

			}

			// Add if we haven't discovered this yet
			if( !this.proceduralDiscovery.get(d.label) )
				this.discoverProceduralDungeon(d.label);

		}

		if( needSave )
			this.save();
		
	}


	removeProceduralDungeonState( dungeon ){
		
		
		let index = this.procedural.indexOf(dungeon);
		if( index === -1 )
			return;
		this.procedural.splice(index);
		this.state_dungeons.unset(dungeon.label);

	}

	// Current procedural dungeon fully explored
	onProceduralFullyExplored(){

		
		this.playFxAudioKitById('explorationCompleted', undefined, undefined, undefined, true);
		const name = labelToName(game.dungeon.label);
		this.ui.questAcceptFlyout( 'Exploration Complete: ', name );

		if( this.is_host && this.net.id )
			this.net.dmQuestAccepted( 'Exploration Complete:', name );

		const players = this.getTeamPlayers(Player.TEAM_PLAYER);
		const numRooms = this.dungeon.rooms.length;
		let rewards = Math.floor(numRooms/10) || 1;
		if( numRooms > 10 && (numRooms%10)/10 < Math.random() )
			++rewards;

		this.addFactionStanding('cartographers', 10);
		players.map(player => player.addExperience(game.getAveragePlayerLevel()*2));
		
		for( let player of players ){
			
			player.addLibraryAsset("cartograph", rewards);
			this.ui.addText( 
				player.getColoredName()+" acquired Cartograph"+(rewards > 1 ? ' x'+rewards : '')+".", 
				undefined, 
				player.id, 
				player.id, 
				'statMessage important' 
			);

		}
		this.save();

	}

	canTransport( addError = true ){

		if( this.isInPersistentRoleplay() ){
			if( addError )
				throw("Can't transport right now");
			return false;
		}
		return true;

	}

	/*
	generateProceduralDungeon(){

		const existing = this.getQuestByLabel('_procedural_');
		if( existing )
			this.removeQuest(existing.id);
		this.removeProceduralDungeonState();
		this.removeQuestCompletion('_procedural_');

		//this.addRandomQuest(); Todo: re-enable when done

	}
	*/

	makeEncounterHostile(){
		this.encounter.friendly = false;
		this.dungeon.getActiveRoom().makeEncounterHostile();
	}


	/* QUEST */
	addQuest( quest, silent = false ){

		if( typeof quest === "string" )
			quest = glib.get(quest, "Quest");
		if( !(quest instanceof Quest) )
			throw("Quest is not a Quest object");
			
		this.quests.push(quest);
		quest.onAccepted();

		if( !silent )
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
	// Gets an active quest by label
	getQuestByLabel( label ){
		for( let quest of this.quests ){
			if( quest.label === label )
				return quest;
		}
	}
	removeQuestCompletion( label ){
		this.completed_quests.unset(label);
	}


	/*  FACTIONS  */
	addFactionStanding( label, standing = 0 ){

		standing = parseInt(standing);
		if( isNaN(standing) )
			throw 'Trying to add non-numerical faction';

		let faction = this.getFaction(label);
		if( !faction )
			throw "Faction not found "+label;
		
		
		if( this.factions.indexOf(faction) === -1 ){
			faction = faction.clone();
			this.factions.push(faction);
		}

		faction.standing += standing;
		this.save();

	}
	getFaction( label ){

		for( let f of this.factions ){
			if( f.label === label )
				return f;
		}

		return glib.get(label, 'Faction');

	}



	/* PLAYERS */

	getEnabledPlayers(){
		return this.players.filter(el => !el.disabled);
	}

	// Add a player by data
	// If data is a Player object, it uses that directly
	addPlayer(data, nextTurn = false ){

		let p = data;
		
		const fromLib = typeof data === "string";
		if( fromLib )
			p = glib.get(data, 'Player');

		if( !p || !(p instanceof Player) )
			p = new Player(data);

		p.color = '';
		p.initialize();
		this.players.push(p);


		if( fromLib )
			p.onPlacedInWorld();

		if( !p.auto_learn ){
			
			if( p.level < 1 )
				p.level = 1;
			p.addActionsForClass(true);

		}

		// Add before the current player
		if( this.battle_active ){
			
			// Insert at next turn
			if( nextTurn ){
				this.initiative.splice(this.turn+1, 0, p.id);
			}
			// Insert at current turn and move turn marker ahead, meaning it goes before the active player
			else{
				this.initiative.splice(this.turn, 0, p.id);
				++this.turn;
			}
		}

		this.assignAllColors();
		this.verifyLeader();

		if( this.initialized )
			this.save();
			
		this.ui.draw();
		return p;

	}

	// Adds a player form player template
	addPlayerFromTemplate( template, nextTurn = false ){

		if( typeof template === "string" )
			template = glib.get(template, 'PlayerTemplate');
		if( !(template instanceof PlayerTemplate) )
			return;
		const player = template.generate();
		if( player )
			return this.addPlayer(player, nextTurn);

	}

	// Remove a player by id
	removePlayer( id ){

		if( id instanceof Player )
			id = id.id;

		const isTurn = id === this.getTurnPlayer().id;

		for(let i in this.players){

			if(this.players[i].id === id){


				this.players[i].onRemoved();
				this.players.splice(i,1);
				if( this.battle_active ){

					for( let t in this.initiative ){

						if( this.initiative[t] === id ){

							this.initiative.splice(t, 1);
							if( t <= this.turn ){
								--this.turn;
							}
							break;

						}

					}

				}
				this.verifyLeader();
				if( isTurn && this.battle_active )
					this.advanceTurn();
				this.save();

				this.ui.draw();
				return true;
			}

		}

		return false;
	}

	// Removes all generated players
	removeGeneratedPlayers( deadOnly = false ){

		let p = this.players.slice();
		for( let pl of p ){

			if( (pl.generated && (!deadOnly || pl.isDead())) || pl.remOnDeath )
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
			if( this.initialized )
				game.save();
		}
	}

	// Gets all players on a team
	getTeamPlayers( team = 0 ){

		return this.getEnabledPlayers().filter(pl => pl.team === team);

	}

	getPlayersNotOnTeam( team = 0 ){
		return this.getEnabledPlayers().filter(pl => pl.team !== team);
	}

	// Gets the highest level player on a team, or if team is NaN, everyone
	getHighestLevelPlayer( team = 0 ){
		let out = 1;
		const players = this.getEnabledPlayers();
		for( let player of players ){
			if( player.team === team || isNaN(team) )
				out = Math.max(out, player.level);
		}
		return out;
	}

	// Gets averate player level by team, or if team is NaN, everyone
	getAveragePlayerLevel( team = 0 ){
		let out = 0, divisor = 0;
		const players = this.getEnabledPlayers();
		for( let player of players ){
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
		const players = this.getEnabledPlayers();
		for( let p of players ){

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

	isMyTurn(){
		const ap = this.getMyActivePlayer();
		if( !ap )
			return false;
		return this.getTurnPlayer().id === ap.id;
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

		if( !player )
			return false;

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

		return this.getEnabledPlayers().filter(el => {
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
			

			if( player !== game.getTurnPlayer() )
				throw("Not your turn");

			if( player.ap < apCost )
				throw("Not enough AP");
			
		}

		if(!game.playerIsMe(player))
			throw("Not your player");

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
	tradePlayerItem( fromPlayer, toPlayer, id, amount = 1, force = false ){

		if( typeof fromPlayer === 'string' )
			fromPlayer = this.getPlayerById(fromPlayer);
		if( typeof toPlayer === "string" )
			toPlayer = this.getPlayerById(toPlayer);

		if( !fromPlayer || !toPlayer )
			throw("Player not found");
		if( !this.playerIsMe(fromPlayer) && !force )
			throw("Not your player");
		if( fromPlayer.team !== toPlayer.team && !force )
			throw("Invalid target");
		if( fromPlayer.id === toPlayer.id )
			throw("Can't trade with yourself");
		if( this.battle_active && this.getTurnPlayer().id !== fromPlayer.id && !force )
			throw("Not your turn");
		if( this.battle_active && fromPlayer.ap < 3 && !force )
			throw("Not enough AP");

		const asset = fromPlayer.getAssetById(id);
		if( !asset )
			throw("Asset not found");

		if( asset.soulbound )
			throw 'Asset is soulbound';

		if( amount > 1 && !asset.stacking )
			throw("Trying to trade stack of nonstacking item");
		if( asset.stacking && (amount > asset._stacks || amount < 1) )
			throw("Invalid quantity");
		

		if( !this.is_host ){
			this.net.playerTradeAsset(fromPlayer, toPlayer, asset, amount);
			return;
		}

		if( asset.loot_sound )
			this.playFxAudioKitById(asset.loot_sound, fromPlayer, toPlayer, undefined, true );
		
		let text = fromPlayer.getColoredName()+" hands "+toPlayer.getColoredName()+(!asset.stacking ? " their " : " "+amount+"x ")+asset.name+"!";
		this.ui.addText( text, undefined, fromPlayer.id, toPlayer.id, 'statMessage important' );
		
		toPlayer.addAsset(asset, amount, true);
		fromPlayer.destroyAsset(asset.id, amount);
		if( this.battle_active )
			fromPlayer.addAP(-3);	

		this.ui.draw();
		this.save();

		

		return true;

	}

	// Deletes a player item by Player, Asset.id
	deletePlayerItem( player, id, amount = 1 ){

		if(!game.playerIsMe(player))
			throw("not your player");

		const asset = player.getAssetById(id);
		if( !asset )
			throw("Asset not found");

		if( !this.is_host ){
			this.net.playerDeleteAsset(player, asset, amount);
			return;
		}

		if( player.destroyAsset(id, amount) ){
			this.save();
			return true;
		}
		return false;

	}

	// Deletes a player action by Player, Action.id
	deletePlayerAction( player, id ){

		if(!game.playerIsMe(player))
			throw("not your player");

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

	// Same as above, but only replaces std actions
	rebaseAllPlayersStd(){
		for( let p of this.players ){
			p.refetchActions(true);
		}
	}

	// Temporarily enables caches on players to speed things up
	lockPlayersAndRun( fn ){

		let cached = this._caches;
		if( !cached )
			this._caches = true;

		const out = fn();
		if( !cached ){
			this._caches = false;
			for( let player of this.players )
				player.uncache();
		}
		return out;

	}	
	
	






	/* ENCOUNTER */
	// Start an encounter
	// If the encounter was started by clicking a mesh, it's included as a THREE object
	startEncounter( player, encounter, merge = false, mesh = false ){

		if( !encounter )
			return;

		if( this.encounter )
			this.encounter.onRemoved();
		
		// Merge should reset the encounter status
		if( merge ){

			this.encounter.setCompleted(false);
			this.encounter.started = false;

		}else{
			// override the encounter
			this.encounter = encounter;
		}

		if( !player )
			player = this.getMyActivePlayer();
		if( !player )
			player = this.getTeamPlayers()[0];
		if( !player )
			player = this.players[0];

		// Always prepare, never just go
		encounter.prepare();

		
		const started = this.encounter.started;
		this.encounter.started = true;
		const completed = this.encounter.completed;

		const markerActions = GameAction.getByType(encounter.game_actions, GameAction.types.playerMarker);
		const room = this.dungeon.getActiveRoom();

		// Update visible players
		this.removeGeneratedPlayers(merge);	// Removes from the Game player list
		for( let pl of encounter.players ){

			pl.netgame_owner = '';
			this.addPlayer(pl);
			// Merge the new players into the encounter
			if( merge ){
				
				this.encounter.players.push(pl);
				const marker = markerActions.shift();
				if( mesh && marker ){

					// Create a custom player marker
					const pos = new THREE.Vector3(marker.data.x, marker.data.y, marker.data.z)
						.multiplyScalar(mesh.scale.y)
						.add(mesh.position)
					;
					room.storePlayerMarker( pl.id, {x:pos.x, y:pos.y, z:pos.z}, mesh.scale.y*marker.data.scale );

				}


			}

		}
		
		// Encounter isn't finished
		if( !this.encounter.completed ){
			

			this.clearRoleplay();

			// Game actions
			const viable = GameAction.getViable(this.encounter.game_actions, player);
			for( let action of viable ){

				if( 
					action.type === GameAction.types.roleplay && 
					!action.getDataAsRoleplay().autoplay 
				)continue;
				action.trigger(player);

			}

			for( let wrapper of encounter.wrappers )
				wrapper.useAgainst( encounter.players[0], player );


		}

		

		

		
		encounter.onPlacedInWorld( !started );	// This has to go after, since players need to be put in world for effects and conditions to work

		if( !encounter.friendly && !completed )
			this.toggleBattle(true);

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
		this.save();
		this.ui.draw();


		
	}

	// Starting new encounters in a room that already has encounters needs to merge it into the main encounter
	mergeEncounter( player, encounter, mesh ){
		this.startEncounter(player, encounter, true, mesh);
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
				type : GameEvent.Types.battleStarted,
			}).raise();
			this.advanceTurn();

		}
		else{

			this.endTurnTimer();
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

	// Gets current turn player
	getTurnPlayer(){
		
		if( !this.battle_active )
			return false;
		return this.getPlayerById(this.initiative[this.turn]);

	}

	// Returns an array of team numbers standing
	teamsStanding(){
		let standing = [];
		const players = this.getEnabledPlayers();
		for( let p of players ){
			
			if( !p.isDead() && !p.isNonRequiredForVictory() && standing.indexOf(p.team) === -1 )
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

		if( !this.encounter.completed ){

			let evt = GameEvent.Types.encounterLost;
			if( standing[0] !== undefined && standing[0] === 0 ){
				this.onEncounterDefeated();
				evt = GameEvent.Types.encounterDefeated;
			}
			else 
				this.onEncounterLost(standing[0]);

			new GameEvent({type:evt, encounter:this.encounter, dungeon:this.encounter.getDungeon(), target:game.players}).raise();

		}

		// Players won
		if( standing[0] !== undefined && standing[0] === 0 ){
			
			// Restore 25% HP and MP at the end of the battle
			this.getTeamPlayers(0).map(pl => pl.onBattleWon());

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


		this.endTurnTimer();

		const th = this;
		const prepAutoPlay = function( npl ){
			setTimeout(() => {
				if( npl === th.getTurnPlayer() )
					npl.autoPlay();
			}, 1000);
		};


		const players = this.players;
		for( let i=0; i<players.length; ++i ){

			this.end_turn_after_action = false;
			let pl = this.getTurnPlayer();
			if( pl && !pl.isDead() && !pl.disabled )
				pl.onTurnEnd();

			++this.turn;
			if( this.turn >= this.initiative.length )
				this.turn = 0;

			let npl = this.getTurnPlayer();
			if( !npl || npl.disabled || npl.isDead() )
				continue;
			
			new GameEvent({
				type : GameEvent.Types.turnChanged,
				sender : pl,
				target : npl
			}).raise();

			this.ui.captureActionMessage = true;
			npl.onTurnStart();
			Wrapper.checkAllStayConditions();
			this.ui.flushMessages();
			
			if( npl.isIncapacitated() || npl.isSkipAllTurns() )
				continue;

			if( this.end_turn_after_action )
				continue;

			prepAutoPlay(npl);
			
			if( this.playerIsMe(npl, true) && npl.id !== this.my_player ){
				this.my_player = npl.id;
				localStorage.my_player = npl.id;
				this.ui.draw();
			}
				
			this.onTurnChanged();
			this.addSeconds(Math.round(30.0/players.length));
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

		if( this.battle_active && this.getTurnPlayer() !== player )
			throw "Not your turn";

		if( !game.playerIsMe(player) )
			throw("Not your player");

		// Convert player to array, and none to []
		if( targets.constructor === Player )
			targets = [targets];
		else if( !targets )
			targets = [];
		
		if( !Array.isArray(targets) )
			return console.error("Unknown target type (array or Player expected)", targets);

		targets = targets.filter(targ => !targ.isInvisible());

		if( !this.is_host ){
			this.net.playerUseAction(player, action, targets);
			return true;
		}else
			this.ui.captureActionMessage = true;
		
		// Can't use caching here, or some texts will fail
		const att = player.useActionId( action.id, targets, netPlayer )
	
		Wrapper.checkAllStayConditions();

		this.save();
		this.ui.draw();
		this.ui.flushMessages();
		this.checkEndTurn();

		return att;

	}


	attemptFleeFromCombat( player ){

		if( !this.battle_active )
			return;

		const players = this.getEnabledPlayers();
		let chance = 50;
		// Each AP benefit the party has over their opponents grant 2% bonus chance, starting at 50%
		for( let p of players ){
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

		if( this.roleplay._waiting )
			return false;

		if( !this.roleplay.getActiveStage() )
			return false;

		const opt = this.roleplay.getActiveStage().getOptionById(option_id);
		if( !opt ){
			console.error("Opt not found", option_id);
			return false;
		}

		if( !this.is_host ){
			this.net.playerRoleplayOption(senderPlayer, option_id);
			return false;
		}

		if( opt.use(senderPlayer) ){

			this.ui.drawRoleplay();
			this.save();

		}
		else
			console.error(senderPlayer, "is unable to use the option", opt);

	}

	setRoleplay( rp, force = false ){

		if( this.isInPersistentRoleplay() && !rp.persistent && !force )
			return;

		if( !this.is_host ){
			game.net.playerRoleplay( game.getMyActivePlayer(), rp );
			return;
		}
		this.roleplay = rp.clone(this);
		this.roleplay.stage = 0;
		this.roleplay.onStart();

		this.ui.draw();
		if( this.roleplay.stages.length )
			this.ui.toggle(true);

		this.save();

	}

	clearRoleplay( force = false ){
		this.setRoleplay(new Roleplay({completed:true}, this), force);
		this.ui.draw();
	}

	isInPersistentRoleplay(){
		return !this.roleplay.completed && this.roleplay.persistent;
	}

	// Gets all available noncompleted roleplays for a player
	getRoleplaysForPlayer( player, debug = false ){

		const out = [];
		const roleplays = this.encounter.getRoleplays(player, true, debug);
		for( let ga of roleplays ){

			const rp = ga.getDataAsRoleplay();
			if( !rp )
				continue;
			rp.loadState();
			const pl = rp.getPlayer();
			if( pl.id === player.id && !rp.completed && rp.validate(game.getMyActivePlayer(), debug) )
				out.push(rp);

		}
		return out;

	}

	// Searches if a roleplay is present and available to a player
	getAvailableRoleplayForPlayerById( player, id ){
		const roleplays = this.encounter.getRoleplays(player);
		for( let ga of roleplays ){
			const rp = ga.getDataAsRoleplay();
			if( !rp )
				continue;
			if( rp.id === id && !rp.completed && !rp.completed && rp.validate(player) )
				return rp;
		}
	}

	saveRPState( roleplay ){
		if( !roleplay.persistent && !roleplay.once )
			return;
		if( !roleplay.label ){
			console.error("Unable to save roleplay with out label", roleplay);
			return;
		}
		if( !this.state_roleplays[roleplay.label] )
			this.state_roleplays[roleplay.label] = new Collection({}, this);
		const cache = this.state_roleplays[roleplay.label];
		if( roleplay.persistent )
			cache.stage = roleplay.stage;
		if( roleplay.once )
			cache.completed = roleplay.completed;
	}

	wipeRPState( label ){
		if( this.state_roleplays[label] ){
			delete this.state_roleplays[label];
			this.save();
		}
	}




	/* ASSETS */
	useRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID){

		if( !this.playerIsMe(senderPlayer) )
			throw("Not your player");

		if( !this.is_host )
			return this.net.playerUseRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID);

		let kitAsset = senderPlayer.getAssetById(repairKitID);
		let targetAsset = targetPlayer.getAssetById(assetID);
		if( !kitAsset )
			throw "Repair kit not found";
		if( !targetAsset )
			throw "Target asset not found";

		this.execRepairWithAsset(senderPlayer, targetPlayer, kitAsset, targetAsset);

	}

	// Executes a repair with assets
	execRepairWithAsset( senderPlayer, targetPlayer, kitAsset, targetAsset ){

		let repairAmount = kitAsset.getRepairPointsFromUseAction( targetAsset, senderPlayer, targetPlayer );
		
		if( !repairAmount )
			throw "No repair points in use action of asset";

		if( targetAsset.durability >= targetAsset.getMaxDurability() )
			throw "Item already repaired";

		let points = targetAsset.repair(repairAmount);
		kitAsset.consumeCharges(1);
		this.save();

		game.ui.addText( senderPlayer.getColoredName()+" restores "+points+" durability to "+targetPlayer.getColoredName()+"'s "+targetAsset.name+".", undefined, senderPlayer.id, targetPlayer.id, 'statMessage cloth Mend' );
		this.playFxAudioKitById('repair', senderPlayer, targetPlayer, undefined, true);
		this.ui.draw();

	}

	// Returns Shop objects attached to an NPC
	// Doesn't do any filtering, so remember to check shopAvailableTo
	getShopsByPlayer( player ){
		const encounter = this.encounter;
		const shops = encounter.getShops();
		if( !player )
			return;
		const out = [];
		for( let shopAction of shops ){
			const shop = shopAction.getDataAsShop();
			if( !shop )
				continue;
			if( shopAction.data.player === player.label ){
				out.push(shop);
			}
		}
		return out;
	}

	// Returns game actions
	getRepairShopByPlayer( player ){
		const encounter = this.encounter;
		const smiths = encounter.getSmiths(player);
		if( !player )
			return;
		const out = [];
		for( let smith of smiths ){
			if( smith.data.player === player.label )
				out.push(smith);
		}
		return out;
	}

	// Returns game actions
	getGymsByPlayer( player, target ){
		const encounter = this.encounter;
		const gyms = encounter.getGyms(target);
		if( !player )
			return;
		const out = [];
		for( let gym of gyms ){
			if( gym.data.player === player.label )
				out.push(gym);
		}
		return out;
	}


	// Returns game actions
	getRoomRentalByPlayer( player ){
		const encounter = this.encounter;
		const renters = encounter.getRenters();
		if( !player )
			return;
		const out = [];
		for( let renter of renters ){
			// Check if already rented
			let dvar = 'room_last_rented';
			if( 
				renter.data.player === player.label && (
					!this.state_dungeons[this.dungeon.label] ||
					!this.state_dungeons[this.dungeon.label].vars[dvar] ||
					this.state_dungeons[this.dungeon.label].vars[dvar] + Game.ROOM_RENTAL_DURATION < this.time	// Might want to use a condition instead?
				)
			){
				out.push(renter);
			}
		}
		return out;
	}

	// Checks each players and returns it if one of them has a shop by label
	getShopHere( label ){
		
		const players = this.getEnabledPlayers();
		for( let player of players ){

			let shops = this.getShopsByPlayer(player);
			for( let shop of shops ){
				if( shop.label === label )
					return shop;
			}

		}

	}

	// Checks if a shop object is available to a player
	shopAvailableTo( shop, player ){
		
		if( this.battle_active )
			throw 'Battle in progress';

		if( !(shop instanceof Shop) )
			throw "Shop is not a shop";

		if( !(player instanceof Player) )
			throw "Player is not a player";

		// Checks conditions
		if( !shop.isAvailable(player) )
			throw "Shop is not available to your active player";

		// Checks if vendor is here
		if( !this.getShopHere(shop.label) ){
			throw 'Vendor not found in current area';
		}
		return true;

	}

	// Checks if a smith object is available to a player
	smithAvailableTo( smithPlayer, player ){

		if( this.battle_active )
			return false;

		if( !(smithPlayer instanceof Player) )
			throw "Smith is not a player";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const smiths = this.getRepairShopByPlayer(smithPlayer);
		for( let smith of smiths ){
			if( smith.validate(player) )
				return true;
		}
		return false;
	}

	// Checks if a smith object is available to a player
	roomRentalAvailableTo( renterPlayer, player ){

		if( this.battle_active )
			throw 'Battle in progress';

		if( !(renterPlayer instanceof Player) )
			throw "Renter is not a player";

		if( !(player instanceof Player) )
			throw 'Invalid player';

		if( !player.isLeader() )
			throw 'Player is not a party leader';

		const renters = this.getRoomRentalByPlayer(renterPlayer);
		for( let renter of renters ){
			if( renter.validate(player) )
				return true;
		}
		return false;
	}

	roomRentalUsed( renterPlayer, player ){

		if( !player.isLeader() )
			throw 'Only the leader can do that';

		if( !this.roomRentalAvailableTo(renterPlayer, player) )
			throw 'Action unavailable to active player';	

		if( !this.is_host ){
			this.net.playerRentRoom( renterPlayer, player );
			return;
		}

		const ga = this.getRoomRentalByPlayer(renterPlayer).filter(el => el.validate(player))[0];

		const cost = ga.data.cost || 0;
		const rp = new Roleplay({
			label : 'room_rental',
			player : renterPlayer.label,
			stages : [
				{
					text : ga.data.text || "Want to rent a room? It's "+Player.copperToReadable(cost)+" a night!",
					options : [
						{
							index:-1, text:"Sure I'll take it.",
							conditions : [{type:Condition.Types.formula, data:{formula:'ta_Money>='+cost}}],
							game_actions : [{type:GameAction.types.execRentRoom, data:{copper:cost, success_text:ga.data.success_text, renter:renterPlayer.label}}]
						},
						{
							index:-1, text:"Sorry I don't have enough money.",
							conditions : [{type:Condition.Types.formula, data:{formula:'ta_Money<'+cost}}],
						},
						{index:-1, text:"No thank you."},
					]
				}
			]	
		});
		this.setRoleplay(rp);	
		
		
	}

	repairBySmith( smithPlayer, player, assetID, allowError = true ){
		const out = text => {
			if( allowError )
				throw text;
		};
		if( !(smithPlayer instanceof Player ) )
			return out("smithPlayer is not a player");
		if( !(player instanceof Player) )
			return out("player is not a player");
		if( !this.smithAvailableTo(smithPlayer, player) )
			return out("Smith not available to you");
		
		const asset = player.getAssetById(assetID);
		if( !asset )
			return out("Asset not found");
		if( !asset.isDamageable() )
			return out("Invalid asset");
		if( asset.durability >= asset.getMaxDurability() )
			return out("Item not damaged");
		
		const cost = asset.getRepairCost(smithPlayer);
		if( player.getMoney() < cost )
			return out("Insufficient funds");

		if( !this.is_host ){
			return this.net.playerRepairItemAtBlacksmith(smithPlayer, player, asset);
		}
		// Ok finally we can do it
		player.consumeMoney(cost);
		asset.repair();
		game.save();

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		this.playFxAudioKitById("shopRepair", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" gets an item repaired.", "repair", player.id, player.id, 'repair');

	}

	sellAsset(shop, asset, amount, player){

		if( !(shop instanceof Shop) )
			shop = glib.get(shop, 'Shop');
		if( typeof player !== "object" )
			player = this.getPlayerById(player);

		if( !player )
			throw "Player missing";

		if( this.battle_active )
			throw "Battle in progress";

		if( !shop.buys )
			throw "Cannot sell to this shop";

		// Netcode
		if( !this.is_host ){
			this.net.playerSellItem(shop, asset, amount, player);
			return;
		}


		if( typeof asset === "object" )
			asset = asset.id;
		asset = player.getAssetById(asset);
		amount = parseInt(amount);
		const maxAmount = asset && asset.stacking ? asset._stacks : 1;

		if( !shop )
			throw "Shop not found";

		if( !shop.buys )
			throw "Shop doesn't buy items";

		if( !asset )
			throw "Asset not found on player";

		if( amount > maxAmount )
			throw "Asset not found on player";
		
		if( isNaN(amount) || amount < 1 )
			throw "Invalid amount";

		if( !this.shopAvailableTo(shop, player) )
			throw "Shop is not available";
		
		// All done
		const earning = asset.getSellCost(shop)*amount;
		player.destroyAsset(asset.id, amount);
		player.addCopperAsMoney(earning);
		this.save();

		this.playFxAudioKitById("sell_item", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" sold "+amount+"x "+asset.getName(), "purchase", player.id, player.id, 'purchase');
		
	}

	// Shop is a label, asset is an ID of an item in shop, amount is nr items to buy, player is the buying player
	buyAsset( shop, asset, amount, player ){

		// Find a shop in active stage
		if( !(shop instanceof Shop) )
			shop = this.getShopHere(shop);

		if( !shop ){
			throw "Shop not found";
		}

		if( this.battle_active )
			throw "Battle in progress";

		if( isNaN(amount) || amount < 1 )
			throw "Invalid amount";

		// netcode
		if( !this.is_host ){
			this.net.playerBuyItem(shop, asset, amount, player);
			return;
		}
		
		shop.loadState(this.state_shops[shop.label]);
		if( typeof asset === "object" )
			asset = asset.id;
		asset = shop.getItemById(asset);

		if( typeof player !== "object" )
			player = this.getPlayerById(player);

		if( !(player instanceof Player) )
			throw 'Non Player instance received';
		
		amount = parseInt(amount);
		

		if( !asset )
			throw "Asset not found in shop";
		
		if( !player )
			throw "Player missing";
		
		if( !this.shopAvailableTo(shop, player) )
			throw "Shop is not available";
		
		if( !asset.isAvailable(player) )
			throw "Asset is not available";

		const remaining = asset.getRemaining();
		if( ~remaining && remaining < amount )
			throw "Amount not available";

		const cost = asset.getCost()*amount,
			a = asset.getAsset()
		;
		if( !asset.affordableByPlayer(player, amount) )
			throw "Insufficient funds";

		if( !a )
			throw "Asset missing from DB";

		// Everything should be good to go
		a.g_resetID();
		a.restore();

		if( cost )
			player.consumeMoney(cost);

		for( let token of asset.tokens )
			player.destroyAssetsByLabel(token.asset.label, token.amount*amount);

		player.addAsset(a, amount, undefined, undefined, true);
		asset.onPurchase(amount);
		this.saveShopState(shop);
		this.save();
		this.ui.draw();

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		if( a.loot_sound )
			this.playFxAudioKitById(a.loot_sound, player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" purchased "+amount+"x "+a.getName(), "purchase", player.id, player.id, 'purchase');
		
	}

	exchangePlayerMoney(myPlayer){

		if( !(myPlayer instanceof Player) )
			myPlayer = this.getPlayerById(myPlayer);
		if( !myPlayer )
			throw "You have no player";
		
		if( !this.is_host ){
			this.net.playerExchangeGold(myPlayer);
			return;
		}
		
		this.ui.addText(myPlayer.getColoredName()+" exchanged their coins.", "purchase", myPlayer.id, myPlayer.id, 'purchase');
		this.playFxAudioKitById("exchange", myPlayer, myPlayer, undefined, true);
		myPlayer.exchangeMoney();
		this.save();
	}

	saveShopState(shop){
		this.state_shops.set(shop.label, shop.saveState());
	}
	

	

	// Check if a player is offering a gym to the target
	gymAvailableTo( gymPlayer, player ){

		if( this.battle_active )
			return false;

		if( !(gymPlayer instanceof Player) )
			throw "GymPlayer is not a player";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const gyms = this.getGymsByPlayer(gymPlayer, player);
		for( let gym of gyms ){
			if( gym.validate(player) )
				return true;
		}
		return false;

	}

	learnAction( gymPlayer, player, learnable ){

		if( !this.gymAvailableTo(gymPlayer, player) )
			throw 'Gym not available';

		// Check if learnable exists and is valid
		const action = glib.get(learnable, 'ActionLearnable');
		if( !action )
			throw "Action not found";

		if( !(player instanceof Player) )
			throw "Invalid player";

		if( player.getLearnedActionByLabel(action.action) ) 
			throw "Action alreday unlocked";

		if( !action.validate(player) )
			throw "That action can't be learned by you";

		if( player.getMoney() < action.getCost() )
			throw "Insufficient funds";

		// If netcode, send to host & return
		if( !this.is_host ){
			this.net.playerBuyAction(gymPlayer, player, learnable);
			return;
		}

		if( !player.addActionFromLibrary(action.action) )
			return;
		
		player.consumeMoney(action.getCost());
		this.playFxAudioKitById("buy_item", player, player, undefined, true);

		this.save();
		return true;

	}

	// Activates or deactivates an action
	toggleAction( gymPlayer, player, actionID ){

		if( !this.gymAvailableTo(gymPlayer, player) )
			throw 'Gym not available';

		if( !(player instanceof Player) )
			throw 'Invalid player';

		if( !this.is_host ){
			this.net.playerToggleAction(gymPlayer, player, actionID);
			return;
		}

		if( player.toggleAction(actionID) )
			this.save();

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




	/* WEATHER */
	getRain( allowIndoor ){

		if( !this.dungeon || !this.dungeon.getActiveRoom() )
			return 0;
		if( !this.dungeon.getActiveRoom().outdoors && !allowIndoor )
			return 0;

		let rain = this.rain;
		// Fade over 2 min
		let started = this.rain_started, startVal = this.rain_start_val;

		// Tween
		if( this.time-started < 120 ){
			let perc = (this.time-started)/120;
			rain = (rain-startVal)*perc+startVal;
		}
		return rain;
	}

}

Game.active = [];
Game.db = new Dexie("game");
Game.db.version(1).stores({
	games: 'id'
});
Game.VibHub = VibHub;		// Set by VibHub.js

Game.EQUIP_COST = 4;
Game.UNEQUIP_COST = 2;
Game.LOG_SIZE = 800;
Game.ROOM_RENTAL_DURATION = 3600*24;
Game.MAX_SLEEP_DURATION = 24;			// Hours

Game.load = async () => {
	
	StaticModal.ini();

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
		game.ui.modal.set(html);
		$("#joinOnlineGame").on('submit', event => {
			event.preventDefault();
			event.stopImmediatePropagation();
			const nick = $("#joinOnlineGame input[type=text]").val().trim();
			if( !nick )
				return game.ui.modal.addError("Please enter a proper nickname");
			game.net.joinGame(gameID, nick);
			game.ui.modal.close();
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

	StaticModal.set('mainMenu');

};

// Get save files names
Game.getNames = async () => {

	let names = {};	// id:name
	await Game.db.games.each(g => {
		let name = g.name;
		if(!name)
			name = "Unnamed";
		names[g.id] = name;
	});
	return names;

};

// Create a new game
Game.new = async (name, players) => {

	if( game )
		game.destructor();
	game = new Game(name);

	if( Array.isArray(players) ){

		for( let player of players ){

			player.g_resetID();
			game.addPlayer(player);

		}

	}
	
	await game.execSave( true );
	game.setDungeon( 'yuug_port', 1 );
	game.ui.onNewGame();

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

