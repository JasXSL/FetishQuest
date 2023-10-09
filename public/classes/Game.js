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
import Quest, { QuestObjective } from './Quest.js';
import {default as Audio, AudioKit, setMasterVolume}  from './Audio.js';
import Roleplay from './Roleplay.js';
import { Wrapper } from './EffectSys.js';
import GameAction from './GameAction.js';
import Collection from './helpers/Collection.js';
import Shop, { ShopSaveState } from './Shop.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import Condition from './Condition.js';

import Faction from './Faction.js';
import Encounter from './Encounter.js';
import StaticModal from './StaticModal.js';
import * as THREE from '../ext/THREE.js';
import ModRepo from './ModRepo.js';
import Book from './Book.js';
import { Logger } from './Logger.js';
import AudioTrigger from './AudioTrigger.js';
import Story from './Story.js';

let VibHub = false;
import('./VibHub.js').then(v => {
	VibHub = v;
	Game.VibHub = VibHub;		// Set by VibHub.js
	console.log("Got VibHub");
}).catch(err => {});

export default class Game extends Generic{


	constructor( name, story ){
		super(name);

		this.name = name;
		if( !this.name )
			this.name = "Unnamed Adventure";
		this.players = [];
		this.renderer = new WebGL();
		this.ui = new UI(this);

		this.turn = 0;
		this.initiative = [];				// Turn order. Contains TEAMS

		this.is_host = true;
		this.battle_active = false;
		this.initialized = false;			// might happen multiple times from the load function
		this.full_initialized = false;		// Only happens once
		this.chat_log = [];					// Chat log
		this.dungeon = new Dungeon({}, this);					// if this is inside a quest, they'll share the same object
		this.encounter = new Encounter({completed:true}, this);		// if this is inside a dungeon, they'll be the same objects
		this.roleplay = new Roleplay({completed:true}, this);
		this.quests = [];								// Quest Objects of quests the party is on. 
		this.net_load = false;							// Currently loading from network
		this.time = 3600*10;							// Time in seconds. Game starts at 10 in the morning of the first day
		
		this.story = story || new Story();				// Should be a story object

		// This is used to save states about dungeons you're not actively visiting, it gets loaded onto a dungeon after the dungeon loads
		// This lets you save way less data
		this.state_dungeons = new Collection();			// label : (obj)dungeonstate - See the dungeon loadstate/savestate. Dungeon stage is fetched from a method in Dungeon
		this.completed_quests = new Collection();		// label : {objective_label:true,__time:(int)time_completed}
		this.state_roleplays = new Collection();		// label : (collection){completed:(bool), stage:(int)} - These are fetched by the Dungeon object. They're the same objects here as they are in dungeon._state
		this.procedural = [];							// Dungeon objects
		this.proceduralDiscovery = new Collection();	// label : {perc:(float)exploredPercentage}
		this.state_shops = new Collection();			// label : (obj)shopState
		this.books_read = new Collection();				// label : {}
		this.difficulty = 0;							// Scale between -3 and 3. Alters enemy level 
		this.genders = 0;								// Prefer these genders when generating template NPCs. See Game.Genders
		this.factions = [];								// Faction objects
		this.totTurns = 0;								// Total turns performed since battle started
		this.modRepo = new ModRepo();
		this.followers = [];							// Player objects. Followers in stasis.

		// Library of custom items
		this.libAsset = {};

		this.audio_fx = new Audio("fx");
		this.audio_ambient = new Audio('ambient', false);
		this.audio_music = new Audio('music', false);
		this.audio_ui = new Audio('ui', true);
		this.audio_voice = new Audio('voice', true);

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

		this.end_turn_after_action = false;				// When set, a player has marked to end their turn, and we need to check if everyone on their team has ended.

		this.rain_next_refresh = 0;						// When to randomize rain status next time
		this.rain_started = 0;							// Time when the rain started
		this.rain_start_val = 0;						// Value of last rain so we can tween
		this.rain = 0.0;								// Level to fade to (over 2 minutes). between 0 and 1

		this._combat_changed = 0;						// Host only. Game time when combat was last toggled

		this.hotkeys = [1,2,3,4,5,6,7,8,9,0];

		this._bot_timer = false;						// Timeout handling bot play
		this._db_save_timer = null;						// Timer to store on HDD		
		this._caches = 0;								// Level of depth of cache requests we're at
		this._looted_players = {};						// local only, contains id : true for players looted in this room
		this._refreshMeshesOnGameData = false;			// Used in online games to refresh meshes when receiving game data from host
	}

	destructor(){

		this.renderer.destructor();
		this.ui.destructor();
		Game.net.destructor();
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

			this.checkBattleEnded(event.sender);
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

			AudioTrigger.handleEvent(event);

			if(	VibHub?.onEvent )
				VibHub.onEvent(event);

			this.getEnabledPlayers().forEach(pl => {
				if( pl.bot )
					pl.bot.handleEvent(event);
			});

			// Route to a special player event for S/T. Used to trigger temporary PlayerIconStates like facial expressions
			if( event.type === GameEvent.Types.textTrigger ){
				
				const cl = event.clone();
				const s = event.sender, t = toArray(event.target);
				for( let targ of t ){
					// Don't raise on self
					if( targ === s )
						continue;
					targ.onTextTrigger(cl);
				}
				
			}

		});

		// Things that needs ALL players initialized to run, since we might fetch non-rebased wrappers if we don't do it until all players have loaded
		this.players.map(pl => {
			pl.addDefaultActions();
		});

		// Run story game actions
		for( let ga of this.story.game_actions )
			ga.trigger( game.players[0], undefined, false, game.players[0], true );
		this.story.game_actions = []; // Wipe the game actions after running them
		/*
		Todo: Uncomment when chrome unfucks their console
		window.onerror = error => {
			this.onError(error);
		};
		*/
	}

	onError(error){

		error = error.split('Uncaught ');
		error.shift();
		error = error.join('Uncaught ');
		this.ui.modal.addError(error);
		console.error("Uncaught", error);

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
			dungeon : Dungeon.saveThis(this.dungeon, full),
			encounter : Encounter.saveThis(this.encounter, full),
			quests : Quest.saveThese(this.quests, full),
			roleplay : Roleplay.saveThis(this.roleplay, full),
			completed_quests : this.completed_quests.save(),	// A shallow clone is enough. Collection.
			time : this.time,
			rain : this.rain,
			factions : Faction.saveThese(this.factions, full),
			proceduralDiscovery : this.proceduralDiscovery.save(full),
			books_read : this.books_read.save(full),
			difficulty : this.difficulty,
			genders : this.genders,
			story : this.story.save(full),
		};
	
		if( full ){

			out.state_shops = this.state_shops.save(full);
			out.libAsset = {};
			out.rain_next_refresh = this.rain_next_refresh;
			out.rain_start_val = this.rain_start_val;
			out.rain_started = this.rain_started;
			out.followers = Player.saveThese(this.followers, full);
			
			out.procedural = Dungeon.saveThese(this.procedural, full);
			out.state_dungeons = this.state_dungeons.save(full);
			out.state_roleplays = this.state_roleplays.save();
			out.totTurns = this.totTurns;
			Object.values(this.libAsset).map(el => out.libAsset[el.label] = el.save(full));
			out.name = this.name;
			out.id = this.id;
			out.chat_log = this.chat_log;
			out._combat_changed = this._combat_changed;

		}
		else{
			
			// Send a dummy version of followers for condition reasons
			out.followers = this.followers.map(el => {
				return {id:el.id, label : el.label};
			});
			out.mute_spectators = this.mute_spectators;

			// Send a lighter version of state dungeons with only the thing netgame players need
			// Currently only the vars are needed as they affect conditions in other dungeons
			let sd = new Collection();
			for( let i in this.state_dungeons ){

				const st = this.state_dungeons[i];
				if( st.vars && Object.keys(st.vars).length ){
					sd[i] = new Collection({
						id : st.id,
						vars : st.vars
					});
				}

			}
			out.state_dungeons = sd.save();

			// Send a lighter version of state roleplay since players will need the completion status of each RP
			// This is so it can properly show/hide the roleplay icon
			let sr = new Collection();
			for( let i in this.state_roleplays ){

				const rp = this.state_roleplays[i];
				if( rp.completed ){

					sr[i] = new Collection({completed: true});

				}


			}
			out.state_roleplays = sr.save();

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
		return this.constructor.saveToDB(data);
	}

	async execSave( allowInsert, ignoreNetGame, debug ){

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
			Game.net.sendGameUpdate();
		this.ignore_netgame = true;

		localStorage.game = this.id;

		const sd = this.getSaveData(true);
		// First insert
		if( allowInsert ){
			await this.saveToDB(sd);
			this.initialize();
			this.load();
		}
		// Save
		else{
			clearTimeout(this._db_save_timer);
			this._db_save_timer = setTimeout(() => {
				this.lockPlayersAndRun(() => {
					this.saveToDB(sd);
				});
			}, 3000);
		}

		//console.log("Save took", Date.now()-time);

		
	}

	// Std load
	async load( data ){

		console.log("Loading game");
		this.initialized = false;		// prevents text sounds from being played when a netgame loads
		this.g_autoload(data);
		console.log("Game save loaded");

		// Custom ad-hoc libraries do not need to be rebased
		for( let i in this.libAsset )
			this.libAsset[i] = new Asset(this.libAsset[i]);

		// Auto wrappers need all players loaded before generating
		if( this.is_host ){
			this.players.map(pl => {
				pl.initialize();	// Updates actions and such
			});
		}

		
		
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
		this.ui.ini(this.renderer.renderer.domElement, this.renderer.fxRenderer.domElement, this.renderer.iconRenderer.domElement);
		
		

		// Make sure a dungeon exists
		/*
		if( !this.dungeon || !this.dungeon.rooms.length )
			this.addRandomQuest();
		*/
		if( this.dungeon.label ){

			console.log("Setting up renderer");
			//this.dungeon.loadState(); -- Shouldn't be done here. Since it'll wipe the completed events.
			this.renderer.loadActiveDungeon();
			this.ui.setMinimapLevel(this.dungeon.getActiveRoom().z);
			
		}
		this.verifyLeader();

		

		this.encounter.onPlacedInWorld( false );	// Sets up event bindings and such

		this.refreshPlayerVisibility();
		console.log("Game loaded");

	}

	loadFromNet( data ){
		
		const mute_pre = this.mute_spectators && !this.getMyActivePlayer();
		const time_pre = this.time;
		let turn = this.turn;
		this.net_load = true;
		this.g_autoload(data);
		this.net_load = false;
		let nt = this.turn;
		if( turn !== nt )
			this.onTurnChanged();
			
		this.dungeon.loadState();	// Technically there shouldn't be state here, since state will already be loaded on the host dungeon.
		// Not sure if this is needed

		// Handle mute state change
		if( mute_pre !== (this.mute_spectators && this.getMyActivePlayer()) )
			this.ui.updateMute();

		if( this.time !== time_pre )
			this.onTimeChanged();

		if( this._refreshMeshesOnGameData ){
			
			this._refreshMeshesOnGameData = false;
			this.renderer.stage.onRefresh();

		}


	}

	// Automatically invoked after g_autoload() in load()
	rebase(){
		this.g_rebase();	// Super

		// States need priority in the load order
		
		this.state_dungeons = Collection.loadThis(this.state_dungeons);
		for( let i in this.state_dungeons ){
			this.state_dungeons[i] = new DungeonSaveState(this.state_dungeons[i]);
		}
		
		// shops have 3 layers of recursive collections
		this.state_shops = Collection.loadThis(this.state_shops);
		for( let i in this.state_shops )
			this.state_shops[i] = ShopSaveState.loadThis(this.state_shops[i], this);
		
		this.books_read = Collection.loadThis(this.books_read);

		this.quests = Quest.loadThese(this.quests, this);		
		this.dungeon = new Dungeon(this.dungeon, this);
		this.encounter = new Encounter(this.encounter, this);
		// Players last as they may rely on the above
		this.players = Player.loadThese(this.players, this);
		this.completed_quests = Collection.loadThis(this.completed_quests);
		this.factions = Faction.loadThese(this.factions);
		this.followers = Player.loadThese(this.followers);
		this.story = Story.loadThis(this.story);
		

		this.state_roleplays = Collection.loadThis(this.state_roleplays);
		for( let i in this.state_roleplays ){
			if( typeof this.state_roleplays[i] !== 'function' ){
				this.state_roleplays[i] = Collection.loadThis(this.state_roleplays[i], this);

				// Try to load subs
				let stages = this.state_roleplays[i].get('stages');
				if( !stages )
					continue;

				stages = Collection.loadThis(stages, this.state_roleplays[i]);
				this.state_roleplays[i].set('stages', stages);

				const keys = stages.keys();
				for( let id of keys ){
					
					const st = Collection.loadThis(stages.get(id), stages);
					stages.set(id, st);

					let opts = st.get("options");
					if( !opts )
						continue;

					opts = Collection.loadThis(opts, st);
					st.set("options", opts);
					

					const okeys = opts.keys();
					for( let oid of okeys )
						opts.set(oid, Collection.loadThis(opts.get(oid), opts));

				}

			}
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

	isHostLoaded(){
		if( !Game.net.isInNetgame() || this.is_host )
			return true;

		return this.load_perc >= 1.0;
		
	}

	setRoomsLoaded( rooms ){

		this.ui.updateLoadingBar(rooms);

		// These are needed because they cache the nr of loaded cells for when a player joins
		if( this.is_host ){

			Game.net.dmCellsLoaded( rooms );
			this.ui.updateLoadingBar();

		}
		else
			Game.net.playerCellsLoaded(rooms);


	}
	
	// Tells the netplayer if we're in a menu
	setInMenu( menu ){

		if( this.is_host ){

			Game.net.dmSetInMenu( menu );
			this.ui.onMenuStatusChanged();

		}
		else
			Game.net.playerSetInMenu( menu );

	}



	// Config
	isGenderEnabled( genders ){

		if( !this.genders )
			return true;
		return (this.genders&genders) === genders;

	}

	getMaxLevel(){
		
		return this.story.max_level;

	}

	isGearLeveled(){
		return this.story.leveled_gear;
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
				if( l && !winner.isBeast() && Math.random() < 0.5 ){

					let stealable = l.getStealableAssets();
					
					let item = shuffle(stealable).shift();
					if( item ){
						
						l.transferAsset(item.id, winner, winner);
						game.ui.addText( winner.getColoredName()+" STOLE "+item._stacks+"x "+item.name+" from "+l.getColoredName()+"!", undefined, winner.id, l.id, 'statMessage important' );

					}

				}
				winner.usePunishment( losers );
				await delay(3000);

			}
		}
		await delay(2000);

		this.restoreNonDeadPlayers();
		this.restorePlayerTeam( Player.TEAM_PLAYER );
		
		// Return to the dungeon entrance
		this.ui.draw();
		
		game.ui.addText( "The players wake up at the dungeon's entrance!", undefined, undefined, undefined, 'center' );
		this.dungeon.goToRoom(losers[0], 0);
	}

	restoreNonDeadPlayers(){

		for( let player of this.players ){
		
			if( !player.isDead() ){

				player.fullRegen();
				player.arousal = 0;

			}

		}

	}

	// Removes arousal and fully regens the player team
	restorePlayerTeam( team ){

		team = parseInt(team) || Player.TEAM_PLAYER;

		for( let player of this.players ){
			
			if( player.team === team ){

				player.fullRegen();
				player.arousal = 0;

			}

		}

	}

	// Raised after each save, both on host and client
	onGameUpdate( data ){
		
		this.ui.modal.onGameUpdate(data);
		StaticModal.onGameUpdate(data);

	}

	onDungeonExit(){
		new GameEvent({type:GameEvent.Types.dungeonExited, dungeon:this.dungeon}).raise();
	}
	onDungeonEntered(){

		this._looted_players = {};	// Reset looted players
		new GameEvent({
			type:GameEvent.Types.dungeonEntered, 
			dungeon:this.dungeon,
			sender : game.getMyActivePlayer(),		// Don't rely on players in this event
			target :game.getMyActivePlayer(),
		}).raise();
		this.ui.setMinimapLevel(this.dungeon.getActiveRoom().z);

	}
	// Draw quest completed message
	onQuestCompleted( quest ){
		
		if( !(quest instanceof Quest) )
			return;

		this.playFxAudioKitById('questCompleted', undefined, undefined, undefined, true);
		this.ui.questAcceptFlyout( 'Quest Completed:', quest.name );
		if( Game.net.isInNetgameHost() )
			Game.net.dmQuestAccepted( 'Quest Completed:', quest.name );

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
		if( Game.net.isInNetgameHost() )
			Game.net.dmQuestAccepted( 'Quest Started:', quest.name );

	}
	// A quest objective value has changed. QuestObjective can be either a label or a QuestObjective object
	onObjectiveChanged( questObjective, amount ){

		if( !(questObjective instanceof QuestObjective) )
			questObjective = this.getQuestObjectiveByLabel(questObjective);
		
		if( !questObjective )
			return;

		if( amount === undefined )
			amount = questObjective._amount;

		this.ui.questObjectiveFlyout(questObjective, amount);
		this.renderer.drawActiveRoom(); // Update active room
		if( this.is_host )
			Game.net.dmQuestObjectiveChanged(questObjective.label, amount);

	}
	// Raised before a room changes
	onRoomChange(){

		this.clearRoleplay(true);
		this.ui.draw();
		for( let player of this.players )
			player.onCellChange();
		this.addSeconds(30);

		// Also lives in netcode
		if( StaticModal.active && StaticModal.active.closeOnCellMove )
			StaticModal.close();
					
	}
	onAfterRoomChange(){

		const evt = new GameEvent({
			type : GameEvent.Types.roomChanged,
			dungeon : this.dungeon,
			room : this.dungeon.getActiveRoom(),
			sender : this.getMyActivePlayer(),
			target : this.getTeamPlayers()
		});
		evt.raise();

		// Update exploration
		if( this.dungeon.procedural ){

			this.discoverProceduralDungeon(this.dungeon.label);

			const disc = this.proceduralDiscovery.get(this.dungeon.label),
				explored = this.dungeon.getNumExploredRooms()/this.dungeon.rooms.length
			;
			
			if( explored != disc.perc )
				disc.perc = explored;

		}

		this.ui.onAfterRoomChange();

		game.save();

	}
	// This one is raised both on host and client.
	// It's only raised on coop after the turn is changed proper, if a player dies, they're likely skipped
	onTurnChanged(){

		const tp = this.isMyTurn();
		if( tp )
			this.uiAudio('your_turn', 1);
		else
			this.uiAudio('turn_changed');

	}
	// force can be set to a float to force the rain value
	onTimeChanged( delta = 0 ){
		
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
		
		this.renderer.updateWeather();
		this.updateAmbiance();			// Handle rain sounds and updates the room

		if( this.is_host ){

			this.updateProceduralStates();
			this.players.map(player => player.onTimePassed(delta));
			this.ui.draw();

		}

	}

	// Asset isn't present when received from the netgame atm
	onInventoryAdd( player, asset ){

		if( !(player instanceof Player) )
			return;


		if( player === this.getMyActivePlayer() )
			this.ui.gameIconPop('inventory');

		if( Game.net.isInNetgameHost() && player.netgame_owner !== 'DM' ){
			
			Game.net.dmInventoryAdd(player, asset);

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
		val = Math.min(1,Math.max(0, val));
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
	addSeconds( seconds, force ){

		if( this.story.freeze_time && !force )
			return;

		let pre = this.time;
		seconds = +seconds || 0;
		this.time += parseInt(seconds);
		this.onTimeChanged(this.time-pre);

	}
	addMinutes(minutes, force){
		minutes = +minutes || 0;
		this.addSeconds(minutes*60, force);
	}
	addHours(hours, force){
		hours = +hours || 0;
		this.addSeconds(hours*3600, force);
	}
	addDays(days, force){
		days = +days || 0;
		this.addSeconds(days*3600*24, force);
	}
	
	// Returns a string like afternoon etc
	// Hours defaults to current time
	getApproxTimeOfDay( hours ){

		let times = [
			{start:2, val:"night"},
			{start:5, val:"early morning"},
			{start:8, val:"morning"},
			{start:11, val:"noon"},
			{start:14, val:"afternoon"},
			{start:17, val:"late afternoon"},
			{start:20, val:"evening"},
			{start:23, val:"midnight"},
		];

		let block = times[times.length-1];
		
		if( hours === undefined )
			hours = this.getHoursOfDay();
		
		for( let i = 0; i < times.length; ++i ){

			let slot = times[i];
			if( hours < slot.start ){

				if( i )
					block = times[i-1];
				break;

			}

		}
		return block.val;

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

			Game.net.playerSleep(player, dungeonAsset, duration);
			return false;

		}
		
		Game.net.dmBlackScreen();
		// Has a callback for when the screen is fully black
		this.ui.toggleBlackScreen(() => {

			this.addHours(duration);
			const pl = game.getTeamPlayers();
			for( let p of pl ){

				p.addHP(20*duration);
				p.addArousal(-5*duration);
				//p.addMP(5*duration);
				this.save();
				this.ui.draw();

			}
			for( let interaction of sleepInteractions ){

				let actions = interaction.data.actions;
				if( Array.isArray(actions) ){
					
					actions = GameAction.loadThese(actions);
					for( let action of actions )
						action.trigger(player, dungeonAsset);

				}

			}

			// Trigger event here
			new GameEvent({
				type:GameEvent.Types.sleep, 
				sender:player, 
				target:this.getEnabledPlayers(), 
				custom:{duration:duration}
			}).raise();

			// Handle rested bonus
			const baseDur = duration*3600;
			
			
			for( let p of pl ){

				// Reset turn tags
				p.resetTurnTags();

				// Handle rested bonus
				let existing = p.getWrapperByLabel('_RESTED_');
				if( existing )
					existing.remove();
				
				const lib = glib.get('_RESTED_', 'Wrapper').clone();
				if( lib ){

					lib.useAgainst(p, p, false);

					let time = Math.min(36000, baseDur + (existing ? existing._duration : 0));
					existing = p.getWrapperByLabel('_RESTED_');
					existing._duration = existing.duration = time;

				}

			}

			this.ui.draw();

			

		});
		this.ui.addText("You rest for "+duration+" hour"+(duration !== 1 ? 's' : '')+".", "sleep", player.id, player.id, 'sleep');
		
		

	}







	// Useful for console debugging, returns current dungeon vars
	getActiveDungeonVars(){
		let out = {};
		this.dungeon.appendMathVars(out, new GameEvent());
		return out;
	}

	// Returns math vars for the game
	getMathVars( event ){
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

		const rps = Roleplay.getPersistent();
		rps.push(this.roleplay);
		for( let rp of rps )
			rp.appendMathVars(out, event);
		
		// Dungeon vars
		const dungeons = glib.getFull('Dungeon');
		for( let d in dungeons )
			dungeons[d].appendMathVars(out, event);
		

		return out;
	}


	/* FETISHES */
	getFetishSettings(){
		try{
			return JSON.parse(localStorage._fetishes);
		}catch(err){
			return {};
		}
	}
	hasFetish( label ){

		const f = this.getFetishSettings()[label];
		return f === undefined || f;

	}
	toggleFetish( label, on ){

		on = Boolean(on);
		const f = this.getFetishSettings();
		f[label] = on;
		localStorage._fetishes = JSON.stringify(f);

	}


	/* AUDIO */
	// Plays a sound. armor_slot is only needed for when a "punch/hit" sound specific to the armor of the player should be played
	// Internal only lets you play the sound without sharing it with the other players (if DM)
	async playFxAudioKitById(id, ...args ){

		let kit = glib.audioKits[id];
		if( !window.game )
			kit = AudioKit.loadThis(window.mod.getAssetById('audioKits', id, true));
		
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
			Game.net.dmPlaySoundOnPlayer(sid, tid, kit.save(), armor_slot, vol_multi);

		const out = await kit.play(this.audio_fx, sender, target, armor_slot, vol_multi);
		return {kit:kit, instances:out};

	}
	async playVoiceAudioKit(kit, sender, target, armor_slot, global = false, vol_multi = 1.0 ){
		
		if( typeof kit === "string" )
			kit = glib.audioKits[kit];

		if( !kit )
			throw 'Audio kit missing';

		let sid, tid;
		if( sender )
			sid = sender.id;
		if( target )
			tid = target.id;

		if( this.is_host && global )
			Game.net.dmPlaySoundOnPlayer(sid, tid, kit.save(), armor_slot, vol_multi, 'voice');

		const out = await kit.play(this.audio_voice, sender, target, armor_slot, vol_multi);
		return {kit:kit, instances:out};

	}

	uiAudio( sound, volume = 0.5, element = null ){

		let x = 0, y = 0;
		if( element ){

			const rect = element.getBoundingClientRect();
			x = ((rect.width/2+rect.left)/window.innerWidth)/2-.25;
			y = ((rect.height/2+rect.top)/window.innerHeight)/2-.25;

		}
		
		return this.audio_ui.play( 'media/audio/ui/'+sound+'.ogg', volume, false, x, y );

	}

	uiClick( element ){
		this.uiAudio('click', 0.5, element );
	}

	uiSelect( element ){
		this.uiAudio('endturn_down', 0.25, element );
	}
	uiSelectUp( element ){
		this.uiAudio('endturn_up', 0.25, element );
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

		
		let player;
		if( uuid instanceof Player ){
			player = uuid;
			uuid = player.id;
		}
		else
			player = this.getPlayerById(uuid);

		if( 
			uuid !== "DM" && 
			!isOOC && 
			!this.playerIsMe(player) &&
			!this.is_host // Host always allowed
		){
			throw "Player not yours";
		}
		if( !this.is_host )
			return Game.net.sendPlayerAction(NetworkManager.playerTasks.speak, {
				player : uuid,
				text : text
			});

		if( text.substr(0,4) === 'ooc ')
			text = text.substr(4);

		text = text.trim();

		// Special case for DM as DM chat isn't tunneled through NetworkManager
		if( isOOC && uuid === 'ooc' )
			uuid = 'DM';

		// We are host
		let pl = "DM";
		// This lets you  use the uuid as a name directly, useful for ooc
		if( isOOC )
			pl = uuid;
		else if( uuid !== "DM" ){
			pl = player;
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
	// room can be an ID ora n index
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

		let roomAsset = dungeon.getRoomByLabel(room);
		if( !roomAsset )
			roomAsset = dungeon.getRoomByIndex(room);
		if( !roomAsset )
			roomAsset = dungeon.rooms[0];
		
		room = roomAsset.index;

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
		Game.net.purgeFromLastPush(["dungeon"],["encounter"]);
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

	// Checks procedural dungeon progress and removes dungeons that have timed out
	updateProceduralStates(){

		if( !this.is_host )
			return;

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

	getIndexOfProceduralDungeonByLabel( label ){
		for( let i = 0; i< this.procedural.length; ++i ){

			if( label === this.procedural[i].label )
				return i;

		}
		return false;
	}

	removeProceduralDungeonState( dungeon ){
		
		if( dungeon instanceof Dungeon )
			dungeon = dungeon.label;
		
		let index = this.getIndexOfProceduralDungeonByLabel(dungeon);
		if( index === false )
			return;
		

		this.procedural.splice(index);
		this.state_dungeons.unset(dungeon);
		this.discoverProceduralDungeon(dungeon);

	}

	// Current procedural dungeon fully explored
	onProceduralFullyExplored(){

		
		this.playFxAudioKitById('explorationCompleted', undefined, undefined, undefined, true);
		const name = labelToName(game.dungeon.label);
		this.ui.questAcceptFlyout( 'Exploration Complete: ', name );

		if( this.is_host && Game.net.id )
			Game.net.dmQuestAccepted( 'Exploration Complete:', name );

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
		new GameEvent({
			type:GameEvent.Types.explorationComplete,
			sender: game.players[0],
			target:players
		}).raise();

	}

	canTransport( addError = true ){

		if( this.isInPersistentRoleplay() ){
			if( addError )
				throw("Can't transport right now");
			return false;
		}
		return true;

	}

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
	getQuestObjectiveByLabel( label ){

		for( let quest of this.quests ){

			let out = quest.getObjectiveByLabel(label);
			if( out )
				return out;

		}

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

	onEndTurn( t ){

		this.playFxAudioKitById('endTurn', t, t, undefined, true);
		this.autoUpdateSelectedPlayer();
		
	}

	// Add a player by data
	// If data is a Player object, it uses that directly
	addPlayer(data, nextTurn = false ){

		let p = data;
		
		const fromLib = typeof data === "string" || data === glib.players[data?.label];
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

		const team = p.team;
		if( this.battle_active && !this.initiative.includes(team) ){

			// Insert at next turn
			if( nextTurn ){
				this.initiative.splice(this.turn+1, 0, team);
			}
			// Insert at current turn and move turn marker ahead, meaning it goes before the active team
			else{
				this.initiative.splice(this.turn, 0, team);
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

	// Checks if the combat is stuck because the active team has no alive players, and in that case advances turn
	currentTeamHasPlayers(){

		let team = this.initiative[this.turn];
		if( team === undefined )
			return true;
		
		let active = this.getEnabledPlayers();
		for( let pl of active ){
			if( pl.team === team && !pl.isDead() )
				return true;
		}
		return false;

	}

	// Remove a player by id
	// If fromEncounter is true, it also removes it from the current encounter
	removePlayer( id, fromEncounter = true ){

		if( id instanceof Player )
			id = id.id;

		let removes = 0;

		for( let i in this.players ){

			if( this.players[i].id === id ){

				this.players[i].onRemoved();
				this.players.splice(i,1);
				this.verifyLeader();
				if( this.battle_active && !this.currentTeamHasPlayers() )
					this.advanceTurn();	// Handles checking if battle is over etc
				this.save();
				this.ui.draw();
				
				++removes;
				break;

			}

		}

		if( fromEncounter ){

			for( let i in this.encounter.players ){

				if( this.encounter.players[i].id === id ){

					this.encounter.players.splice(i, 1);
					++removes;
					break;

				}

			}
			
		}


		return removes;
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

	// Gets all enabled players on a team
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
		// Able to get follower clones this way too
		for( let p of this.players ){

			if( p.label === 'fo_'+label )
				return p;

		}
		
		return false;

	}

	isMyTurn(){
		const ap = this.getMyActivePlayer();
		if( !ap )
			return false;
		return this.initiative[this.turn] === ap.team && !ap.endedTurn;
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

		return player.netgame_owner === Game.net.id || (this.is_host && player.netgame_owner === 'DM');

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

	// Toggles equip on an item to a player from inventory by Player, Asset.id
	equipPlayerItem( player, id, force = false ){

		const asset = player.getAssetById(id);
		if( !asset )
			throw 'Asset not found';
		
		let apCost = player.isAssetEquipped(id) ? asset.getUnequipCost() : asset.getEquipCost();
		if( game.battle_active ){
			
			if( !game.isTurnPlayer(player) )
				throw("Not your turn");

			const plMom = player.getMomentum();
			if( plMom < apCost )
				throw("Not enough AP");
			
		}

		if( this.isInRoleplay() )
			throw "Can't change equipment during a dialog.";

		if( !player.canEquip(id) && !asset.equipped )
			throw "Can't equip that right now";

		if(!game.playerIsMe(player))
			throw("Not your player");

		if( !this.is_host ){
			Game.net.sendPlayerAction(NetworkManager.playerTasks.toggleGear, {
				player : player.id,
				item : id
			});
			return true;
		}

		// Equip
		if( !player.isAssetEquipped(id) ){
			if( !player.equipAsset(id, player) )
				return false;
		}
		// Unequip
		else{
			if( !player.unequipAsset(id, player, undefined, force) )
				return false;
		}

		if( game.battle_active )
			player.addMomentum(-1, -apCost); // remove random momentum

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
		if( this.battle_active && !force )
			throw("Can't trade in combat");

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
			Game.net.playerTradeAsset(fromPlayer, toPlayer, asset, amount);
			return;
		}

		if( asset.loot_sound )
			this.playFxAudioKitById(asset.loot_sound, fromPlayer, toPlayer, undefined, true );
		
		let text = fromPlayer.getColoredName()+" hands "+toPlayer.getColoredName()+(!asset.stacking ? " their " : " "+amount+"x ")+asset.name+"!";
		this.ui.addText( text, undefined, fromPlayer.id, toPlayer.id, 'statMessage important' );
		
		const assetWrappers = fromPlayer.getAssetWrappers(asset.id).map(el => {
			el = el.clone();
			// Prepare asset for move
			el.victim = toPlayer.id;
			el.parent = toPlayer;
			return el;
		});
		const inserts = toPlayer.addAsset(asset, amount, true);	// Note that this will reset ID
		for( let wrapper of assetWrappers )
			toPlayer.addWrapper(wrapper);
		
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
			Game.net.playerDeleteAsset(player, asset, amount);
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
	
	refreshPlayerVisibility(){
		
		const conds = this.encounter.player_conditions;
		// Toggle hide/show of players
		for( let i in conds ){

			const pl = this.getPlayerByLabel(i);
			if( !pl )
				continue;
			pl.disabled = !Condition.all(conds[i], new GameEvent({target:pl, sender:pl}));

		}
		this.ui.draw();

	}




	/* Followers */
	// unlocks a new follower
	addFollower( player, addImmediate = true ){

		if( typeof player === "string" )
			player = glib.get(player, 'Player');

		if( !(player instanceof Player) )
			throw 'Trying to add non player follower';

		if( !player.isFollower() ){
			throw 'Player is not a follower';
		}
		const stashed = this.getStashedFollower(player.label);
		if( stashed ){
			player = stashed;
			this.removeStashedFollower(stashed);
		}
		// add to game players
		this.addPlayer(player);
		player.onPlacedInWorld();
		player.team = 0; // Join player team 
		player.label = 'fo_'+player.label; // fo is prepended to label. Player label conditions will check both with fo_ and non fo_

		// Stash it immediately
		if( !addImmediate )
			this.stashFollower(player.id);
		this.ui.draw();

	}

	stashFollower( id ){

		let player = this.getPlayerById(id);
		if( !player )
			return false;

		this.followers.push(player);
		this.removePlayer(player.id);

	}

	getStashedFollower( label ){

		for( let f of this.followers ){

			if( f.label === label )
				return f;

		}

	}

	removeStashedFollower( player ){

		if( !(player instanceof Player) )
			throw 'Need to supply a Player object to removeStashedFollower';

		let pos = this.followers.indexOf(player);
		if( ~pos )
			this.followers.splice(pos, 1);

	}





	/* ENCOUNTER */
	// Start an encounter
	// If the encounter was started by clicking a mesh, it's included as a THREE object
	startEncounter( player, encounter, merge = false, mesh = false ){

		if( !encounter )
			return;

		if( typeof encounter === 'string' )
			encounter = glib.get(encounter, 'Encounter');
		if( !(encounter instanceof Encounter) )
			throw 'Attempting to start missing encounter';

		if( this.encounter )
			this.encounter.onRemoved();
		
		// Merge should reset the encounter status
		if( merge ){

			this.encounter.setCompleted(false);
			this.encounter.started = false;
			// For now, merge removes previous game actions, to prevent one time things to trigger again
			// In the future, there should probably be a gameAction setting like "saveOnMerge"
			this.encounter.game_actions = encounter.game_actions.slice();

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


		// Check before prepare since prepare sets the time
		const time_started = this.encounter.time_started;

		// Always prepare, never just go. This needs to be run AFTER this.encounter due to getPlayersEnabled being needed for scaling
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

				let adata;
				if( action.type === GameAction.types.roleplay )
					adata = action.getDataAsRoleplay();

				if( 
					(	// Ignore RP if not autoplay
						action.type === GameAction.types.roleplay && 
						(
							!adata.autoplay ||
							(adata.apOnce && this.state_roleplays.get(adata.label))
						) 
					) ||
					(	// Ignore trap if area already visited
						action.type === GameAction.types.trap &&
						time_started !== -1
					)
				)continue;

				action.trigger(player);

			}

			for( let pl of this.players ){
				for( let wrapper of encounter.wrappers ){
					
					let wr = wrapper.clone();
					wr.useAgainst( player, pl );

				}
			}

		}
	

		
		encounter.onPlacedInWorld( !started );	// This has to go after, since players need to be put in world for effects and conditions to work

		this.refreshPlayerVisibility();

		if( !started )
			encounter.rebalance();

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

		this.updateShops();

		// Always set proc evt encounters to completed to prevent repeats
		if( encounter.isEvt )
			this.encounter.setCompleted(true);

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

		//const log = new Logger('Game.js -> toggleBattle');

		if( this.battle_active ){

			this.totTurns = 0;

			//log.log('Start A');
			this.encounter.setCompleted(false);
			this.ui.battleVis();
			this.renderer.battleVis();
			//log.log('Start B');


			// Battle just started, randomize initiative
			this.initiative = [];
			for( let player of this.players ){
				if( !this.initiative.includes(player.team) )
					this.initiative.push(player.team);
				player.onBattleStart();
			}
			shuffle(this.initiative);
			new GameEvent({
				type : GameEvent.Types.battleStarted,
				sender : game.players[0],
				target : game.players[0]
			}).raise();


			this.advanceTurn();

		}
		else{

			//log.log('End A');
			for( let pl of this.players )
				pl.onBattleEnd();

			//log.log('End B');

			new GameEvent({
				type : GameEvent.Types.battleEnded,
				sender : game.players[0],
				target : game.players[0]
			}).raise();

		}

		this._combat_changed = this.time;

		//log.log('Tail A');

		this.save();
		this.ui.draw();

		//log.log('Tail B');

		this.renderer.onBattleStateChange();

		//log.log('Tail C');


	}

	// Gets current turn player
	isTurnPlayer( player ){
	
		if( !this.battle_active || !player )
			return false;

		return !player.endedTurn && player.team === this.initiative[this.turn];

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
	// Sender may not always be present, but is usually the person who caused the playerDefeated event
	checkBattleEnded( sender ){

		if( !this.battle_active )
			return true;

		// Checks if at least one player of each team is standing
		let standing = this.teamsStanding();
		if( standing.length > 1 )
			return false;


		// Players won
		if( standing[0] !== undefined && standing[0] === 0 ){
			
			// Restore 25% HP and MP at the end of the battle
			this.getTeamPlayers(0).map(pl => pl.onBattleWon());

		}

		// Battle ended
		this.toggleBattle( false );	// Saves if there's a change

		// Needs to go after battle ended due to gameActions that restart the battle immediately
		if( !this.encounter.completed ){

			let evt = GameEvent.Types.encounterLost;
			if( standing[0] !== undefined && standing[0] === 0 ){

				this.onEncounterDefeated();
				evt = GameEvent.Types.encounterDefeated;

			}
			else if( !this.encounter.wipe_override )
				this.onEncounterLost(standing[0]);

			new GameEvent({
				type:evt, 
				encounter:this.encounter, 
				dungeon:this.encounter.getDungeon(), 
				target:game.players, 
				sender:sender
			}).raise();

		}

		return true;
		
	}

	// Wipes turn tags (tags set on players until the next attack text is added), ignorePlayers are players that should be ignored
	wipeTurnTags( ignorePlayers ){
		for( let p of this.players ){
			if( ignorePlayers.indexOf(p) === -1 )
				p._turn_tags = [];
		}
	}

	isMyPlayer( player ){

		if( typeof player === 'string' )
			player = this.getPlayerById(player);
		return this.getMyPlayers().includes(player);
		
	}

	// Sets your active player
	setMyPlayer( id ){
		this.my_player = id;
		localStorage.my_player = id;
		this.ui.draw();
		this.save();
	}

	getTurnPlayers(){
		return this.getTeamPlayers(this.initiative[this.turn])
	}

	async autoPlay(){

		let players = this.getTurnPlayers().filter(pl => {
			return pl.isNPC() && !pl.endedTurn;
		});
		shuffle(players);

		if( players.length ){

			const time = await players[0].autoPlay();
			clearTimeout(this._bot_timer);
			let timer = 1000;
			if( time > 0 )
				timer = time;
			this._bot_timer = setTimeout(this.autoPlay.bind(this), timer);

		}

	}

	// Advances turn
	advanceTurn(){

		let turnPlayers = this.getTurnPlayers();
		for( let pl of turnPlayers ){
			
			if( !pl.isDead() && !pl.disabled )
				pl.onTurnEnd();

		}

		for( let i = 0; i < this.initiative.length; ++i ){

			this.end_turn_after_action = false;
			++this.turn;
			++this.totTurns;
			if( this.turn >= this.initiative.length )
				this.turn = 0;

			if( !this.currentTeamHasPlayers() )
				continue;

			turnPlayers = this.getTurnPlayers();
			new GameEvent({
				type : GameEvent.Types.turnChanged,
				sender : turnPlayers[0], // Don't rely on this. Sender can't be an array tho, so we're putting this here as a dummy.
				target : turnPlayers
			}).raise();
			const others = this.getPlayersNotOnTeam(this.initiative[this.turn]);	// Not sure why player first turn is raised with everyone not on the team as a target. Maybe one day I'll find out.

			this.autoUpdateSelectedPlayer(); // Needs to go here because onTurnStart relies on it

			for( let pl of turnPlayers ){
				
				if( pl.isDead() || pl.disabled ){
					pl.endedTurn = true;
					continue;
				}

				this.ui.captureActionMessage = true;
				
				pl.onTurnStart();
				// pl._turns are added on turn end
				if( !pl._turns ){

					let evt = new GameEvent({
						type : GameEvent.Types.playerFirstTurn,
						sender : pl,
						target : others,
					});
					evt.raise();
					
				}

			}

			Wrapper.checkAllStayConditions();
			this.ui.flushMessages();
			this.onTurnChanged();
			this.addSeconds(30);
			
			// Todo: pl.isSkipAllTurns needs to be handled in AI
			// Todo: Handle AI with prepAutoPlay(npl);

			break;
		}

		clearTimeout(this._bot_timer);
		this._bot_timer = setTimeout(this.autoPlay.bind(this), 1000);
		this.save();
		this.ui.draw();
		
	}

	// Tries to change control to a viable turn player
	// Todo: Needs to be run on netcode too
	autoUpdateSelectedPlayer(){

		if( !this.battle_active )
			return;

		const active = game.getMyActivePlayer();
		if( this.isTurnPlayer(active) )
			return;

		const players = this.getTurnPlayers();
		for( let pl of players ){
			if( this.isMyPlayer(pl) && this.isTurnPlayer(pl) ){
				this.setMyPlayer(pl.id);
				break;
			}
		}

	}

	// Checks if end_turn_after_action is set and advances turn if it is
	checkEndTurn(){

		let players = this.getTurnPlayers();
		for( let player of players ){
			if( !player.endedTurn )
				return false;
		}
		this.advanceTurn();
		return true;

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
			throw 'Player not found';

		if( this.battle_active && !this.isTurnPlayer(player) )
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

			Game.net.playerUseAction(player, action, targets);
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

	attemptFleeFromCombat( player, force ){

		if( !this.battle_active )
			return;

		let chance = 50;

		if( force )
			chance = 100;
		else
			chance += 5*player.getMomentum(Player.MOMENTUM.Def);

		if( Math.random()*100 < chance )
			return this.execFleeFromCombat( player );

		player.addMomentum(Player.MOMENTUM.Def, -2);
		this.ui.addText( player.getColoredName()+" calls for a retreat, but the party fails to escape!", undefined, player.id, player.id );

	}

	execFleeFromCombat( player ){

		this.ui.addText( player.getColoredName()+" calls for a retreat, the party succeeds in escaping!", undefined, player.id, player.id );
		this.toggleBattle(false);
		this.dungeon.goToRoom( player, this.dungeon.previous_room );	// Saves

	}

	rerollMomentum( player, type, to ){
		
		if( !this.playerIsMe(player) )
			throw "Not your player";

		if( isNaN(type) )
			throw 'Invalid type';

		if( player.reroll < 1 )
			throw 'Out of rerolls';

		// Not host
		if( !this.is_host )
			return Game.net.playerRerollMomentum(player, type, to);

		// Only host below this point
		const rolledTo = player.rerollMomentum(type, to);
		if( rolledTo === false ) // Note: May be 0, type check is a must
			throw 'Invalid momentum';

		let added = [0,0,0];
		added[rolledTo] = 1;

		const isMyActive = player === this.getMyActivePlayer();
		// Not my player, send it to the player
		if( !isMyActive )
			Game.net.dmDrawMomentumGain(player, added);
		// My player, draw the UI
		else
			this.ui.drawMomentumGain(...added);
		

		if( player.consumeReroll() )
			++player.tReroll;
		
		this.save();
		this.ui.draw();
		
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
			Game.net.playerRoleplayOption(senderPlayer, option_id);
			return false;
		}

		if( opt.use(senderPlayer) ){

			this.ui.drawRoleplay();
			this.save();

		}
		else
			console.error(senderPlayer, "is unable to use the option", opt);

	}

	setRoleplay( rp, force = false, player = undefined ){

		if( this.isInPersistentRoleplay() && !rp.persistent && !force )
			return;

		if( !this.is_host ){
			Game.net.playerRoleplay( game.getMyActivePlayer(), rp );
			return;
		}

		if( typeof rp === "string" )
			rp = glib.get(rp, 'Roleplay');

		const pl = rp.validate(player);
		if( !pl && !force ){
			//console.error("No players passed filters for rp", rp, "using player", player);
			return;
		}

		this.roleplay.onClose();

		this.roleplay = rp.clone(this);
		this.roleplay.stage = '';
		this.roleplay.onStart( pl );

		this.ui.draw();
		if( this.roleplay.stages.length )
			this.ui.toggle(true);

		this.save();

	}

	clearRoleplay( force = false ){

		this.roleplay.onClose();
		this.setRoleplay(new Roleplay({completed:true}, this), force);
		this.ui.draw();

	}

	isInPersistentRoleplay(){
		return !this.roleplay.completed && this.roleplay.persistent;
	}

	isInRoleplay(){
		return !this.roleplay.completed;
	}

	// Gets all available noncompleted roleplays for a player
	getRoleplaysForPlayer( player, debug = false ){

		const out = [];
		const roleplays = this.encounter.getRoleplays(player, true, debug);
		for( let ga of roleplays ){

			const rp = ga.getDataAsRoleplay();
			if( !rp )
				continue;

			const pl = rp.getPlayer();
			if( debug )
				console.log(pl, player, pl.id === player.id, rp.completed);
			if( pl.id === player.id && !rp.completed && rp.validate(game.getMyActivePlayer(), debug) )
				out.push(rp);

		}
		return out;

	}

	// Searches if a roleplay is present and available to a player
	getAvailableRoleplayForPlayerById( player, id ){

		if( player instanceof Player )
			player = player.id;

		const roleplays = this.encounter.getRoleplays(player);
		for( let ga of roleplays ){

			const rp = ga.getDataAsRoleplay();
			if( !rp )
				continue;
			if( rp.id === id && !rp.completed && !rp.completed && rp.validate(this.getPlayerById(player)) )
				return rp;

		}

	}

	saveRPState( roleplay ){

		if( !roleplay.canSaveState() )
			return;
		
		if( !roleplay.label ){
			console.error("Unable to save roleplay with out label", roleplay);
			return;
		}

		if( !this.state_roleplays[roleplay.label] )
			this.state_roleplays[roleplay.label] = new Collection({}, this);

		const cache = this.state_roleplays[roleplay.label];
		if( !cache.get('stages') )
			cache.set('stages', new Collection({}, cache));
		const stages = cache.get('stages');

		if( roleplay.persistent )
			cache.set('stage', roleplay.stage);
		if( roleplay.once )
			cache.set('completed', roleplay.completed);
		if( roleplay.vars_persistent )
			cache.set('vars', roleplay._vars.save(true));

		for( let stage of roleplay.stages ){
			
			for( let opt of stage.options ){
				
				if( !opt.canSaveState() )
					continue;

				let st = stages.get(stage.id);
				if( !st ){
					st = new Collection({}, stages);
					stages.set(stage.id, st);
				}

				let opts = st.get('options');
				if( !opts ){
					opts = new Collection({}, st);
					st.set('options', opts);
				}
				
				let option = opts.get(opt.id);
				if( !option ){

					option = new Collection({}, opts);
					opts.set(opt.id, option);

				}

				option.set('_roll', opt._roll);
				option.set('_mod', opt._mod);
				
			}
			

		}

	}

	wipeRPState( label ){
		if( this.state_roleplays[label] ){
			delete this.state_roleplays[label];
			this.save();
		}
	}


	/* Adds a book to read state, and sends the data to the netcode player if need be */
	/* Host only */
	readBook( player, book ){

		if( !this.is_host )
			return;

		if( !(book instanceof Book) )
			book = glib.get(book, 'Book');

		if( !(player instanceof Player) )
			throw 'Invalid player';
			
		if( !book )
			throw 'Book not found';

		// Always add to library
		this.books_read.set(book.label, {
			name : book.name,
		});
		this.save();

		let actions = book.game_actions.slice();
		for( let action of actions ){
			
			if( !(action instanceof GameAction) )
				continue;
			
			if( !action.validate(player) )
				continue;

			action.trigger(player);

		}

		const isMyActivePlayer = player === game.getMyActivePlayer();
		if( !isMyActivePlayer && (!Game.net.isInNetgameHost() || !player.netgame_owner) )
			return;

		if( isMyActivePlayer ){

			this.ui.openBook(book);
			return;
		}

		Game.net.dmGetLargeAsset(player.netgame_owner, 'book', book.save());

	}



	/* ASSETS */
	useRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID){

		if( !this.playerIsMe(senderPlayer) )
			throw("Not your player");

		if( !this.is_host )
			return Game.net.playerUseRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID);

		let kitAsset = senderPlayer.getAssetById(repairKitID);
		let targetAsset = targetPlayer.getAssetById(assetID);
		if( !kitAsset )
			throw "Repair kit not found";
		if( !targetAsset )
			throw "Target asset not found";

		this.execRepairWithAsset(senderPlayer, targetPlayer, kitAsset, targetAsset);

	}

	useAssetGameAction( assetGameAction ){
		
		if( !(assetGameAction instanceof GameAction) )
			throw 'Game action not found';

		let player = assetGameAction;
		while( player && player.parent ){

			player = player.parent;
			if( player instanceof Player )
				break;

		}

		if( !player )
			throw 'Player not found for useAssetGameAction';


		if( !this.is_host ){

			Game.net.playerUseAssetGameAction(player, assetGameAction);
			return;

		}	

		

		assetGameAction.trigger(player);

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
	// Encounter can be used to check a different encounter than the active one
	getShopsByPlayer( player, filter = false, encounter = false ){

		if( !encounter )
			encounter = this.encounter;

		// Get GameActions
		const shops = encounter.getShops();
		if( !player )
			return;

		const mp = this.getMyActivePlayer();
		if( filter && !mp )
			return [];

		const out = [];
		for( let shopAction of shops ){

			if( !(shopAction instanceof GameAction) )
				continue;

			const shop = shopAction.getDataAsShop();
			if( !shop )
				continue;

			if( shopAction.data.player === player.label ){

				// looks kinda funny, but shopAvailableTo throws an error if it fails to validate
				try{
					if( filter && (!shopAction.validate(mp) || !this.shopAvailableTo(shop, mp, encounter)) )
						throw '';
				}catch(err){
					continue;
				}
				out.push(shop);

			}

		}
		return out;

	}

	// Returns game actions
	getRepairShopByPlayer( player, encounter = false ){
		if( !encounter )
			encounter = this.encounter;
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

	getAltarByPlayer( player, encounter = false ){
		if( !encounter )
			encounter = this.encounter;
		const altars = encounter.getAltars(player);
		if( !player )
			return;
		const out = [];
		for( let altar of altars ){
			if( altar.data.player === player.label )
				out.push(altar);
		}
		return out;
	}

	getBankByPlayer( player, encounter = false ){
		if( !encounter )
			encounter = this.encounter;
		const banks = encounter.getBanks(player);
		if( !player )
			return;
		const out = [];
		for( let bank of banks ){
			if( bank.data.player === player.label )
				out.push(bank);
		}
		return out;
	}

	// Returns game actions
	getGymsByPlayer( player, target, encounter = false ){
		if( !encounter )
			encounter = this.encounter;
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
	getTransmogByPlayer( player, encounter = false ){
		if( !encounter )
			encounter = this.encounter;
		const ga = encounter.getTransmogs(player);
		if( !player )
			return;
		const out = [];
		for( let a of ga ){
			if( a.data.player === player.label )
				out.push(a);
		}
		return out;
	}

	


	// Returns game actions
	getRoomRentalByPlayer( player, encounter = false ){

		if( !encounter )
			encounter = this.encounter;
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
	getShopHere( label, encounter = false ){
		
		let players = this.getEnabledPlayers();
		if( encounter )
			players = encounter.players;

		for( let player of players ){

			let shops = this.getShopsByPlayer(player, undefined, encounter);
			for( let shop of shops ){
				if( shop.label === label )
					return shop;
			}

		}

	}

	getAllShopsHere( encounter = false ){

		let players = this.getEnabledPlayers();
		if( encounter )
			players = encounter.players;
		
		let out = [];
		for( let player of players )
			out.push(...this.getShopsByPlayer(player, undefined, encounter));

		return out;

	}

	// Updates all shops in the current area
	updateShops(){

		const shops = this.getAllShopsHere();
		// Figure this out next
		for( let shop of shops )
			shop.loadState();

	}

	// Checks if a shop object is available to a player
	shopAvailableTo( shop, player, encounter = false ){
		
		if( this.battle_active ){
			//console.error("Battle in progress");
			return false;
			
		}

		if( !(shop instanceof Shop) )
			throw "Shop is not a shop";

		if( !(player instanceof Player) )
			throw "Player is not a player";

		// Checks conditions
		if( !shop.isAvailable(player) )
			throw "Shop is not available to your active player";

		// Checks if vendor is here
		if( !this.getShopHere(shop.label, encounter) ){
			throw 'Vendor not found in current area';
		}
		return true;

	}

	// Checks if a smith object is available to a player
	smithAvailableTo( smithPlayer, player, encounter = false ){

		if( this.battle_active )
			return false;

		if( !(smithPlayer instanceof Player) )
			throw "Smith is not a player";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const smiths = this.getRepairShopByPlayer(smithPlayer, encounter);
		for( let smith of smiths ){
			if( smith.validate(player) )
				return true;
		}
		return false;
	}

	// Checks if an altar object is available to a player
	altarAvailableTo( altarPlayer, player, encounter = false ){

		if( this.battle_active )
			return false;

		if( !(altarPlayer instanceof Player) )
			throw "Altar invalid type";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const altars = this.getAltarByPlayer(altarPlayer, encounter);
		for( let altar of altars ){
			if( altar.validate(player) )
				return true;
		}
		return false;
	}

	// Checks if a bank is available to a player
	bankAvailableTo( bankPlayer, player, encounter = false ){

		if( this.battle_active )
			return false;

		if( !(bankPlayer instanceof Player) )
			throw "Bank invalid type";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const banks = this.getBankByPlayer(bankPlayer, encounter);
		for( let bank of banks ){
			if( bank.validate(player) )
				return true;
		}
		return false;
	}

	// Checks if a transmog object is available to a player
	transmogAvailableTo( transmogPlayer, player, encounter = false ){

		if( this.battle_active )
			return false;

		if( !(transmogPlayer instanceof Player) )
			throw "Transmog player is not a player";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const out = this.getTransmogByPlayer(transmogPlayer, encounter);
		for( let a of out ){
			if( a.validate(player) )
				return true;
		}
		return false;
	}

	transmogrify( transmogrifier, player, baseAsset, copyFrom ){

		if( !(player instanceof Player) )
			player = this.getPlayerById(player);

		if( !(transmogrifier instanceof Player) )
			transmogrifier = this.getPlayerById(transmogrifier);

		if( !transmogrifier )
			throw 'Transmogrifier not found';

		if( !player )
			throw 'Player not found';
		
		if( !this.transmogAvailableTo(transmogrifier, player) )
			throw 'Transmogrifier not available';

		baseAsset = player.getAssetById(baseAsset);
		copyFrom = player.getAssetById(copyFrom);
		if( !baseAsset )
			throw 'Invalid base asset in transmog';
		if( !copyFrom )
			throw 'Invalid copy from asset in transmog';

		const cost = baseAsset.getSellCost();
		if( player.getMoney() < cost )
			throw 'Insufficient funds';
		
		if( copyFrom.soulbound )
			throw 'Unable to transmog soulbound items';

		if( !baseAsset.checkTransmogViability(copyFrom) )
			throw 'These items cannot be transmogged like that';

		if( !player.getEquippedAssetsBySlots(Asset.SlotsTransmoggable).includes(baseAsset) )
			throw 'Invalid transmog item';

		if( !this.is_host ){
			Game.net.playerTransmogrify(transmogrifier, player, baseAsset, copyFrom);
			return;
		}

		baseAsset.transmogrifyFrom(copyFrom);
		player.destroyAsset(copyFrom.id, 1);
		player.consumeMoney(cost);

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		this.playFxAudioKitById("transmogrifyExec", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" transmogrified an item.", "transmog", player.id, player.id, 'transmog');

	}

	// Checks if a room renter is available to a player
	roomRentalAvailableTo( renterPlayer, player, encounter = false ){

		if( this.battle_active )
			throw 'Battle in progress';

		if( !(renterPlayer instanceof Player) )
			throw "Renter is not a player";

		if( !(player instanceof Player) )
			throw 'Invalid player';

		if( !player.isLeader() )
			throw 'Player is not a party leader';

		const renters = this.getRoomRentalByPlayer(renterPlayer, encounter);
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
			Game.net.playerRentRoom( renterPlayer, player );
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
							text:"Sure I'll take it.",
							conditions : [{type:Condition.Types.formula, data:{formula:'ta_Money>='+cost}}],
							game_actions : [{type:GameAction.types.execRentRoom, data:{copper:cost, success_text:ga.data.success_text, renter:renterPlayer.label}}]
						},
						{
							text:"Sorry I don't have enough money.",
							conditions : [{type:Condition.Types.formula, data:{formula:'ta_Money<'+cost}}],
						},
						{text:"No thank you."},
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
			return Game.net.playerRepairItemAtBlacksmith(smithPlayer, player, asset);
		}
		// Ok finally we can do it
		player.consumeMoney(cost);
		asset.repair();
		game.save();

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		this.playFxAudioKitById("shopRepair", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" gets an item repaired.", "repair", player.id, player.id, 'repair');

	}

	// hexColor is a color including #, or use an empty string if you want to remove the dye
	dyeBySmith( smithPlayer, player, assetID, hexColor, allowError = true ){
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
		if( typeof hexColor !== 'string' || (hexColor && !/^#[0-9A-F]{6}$/i.test(hexColor)) )
			return out("Invalid color picked");
		
		const asset = player.getAssetById(assetID);
		if( !asset )
			return out("Asset not found");
		if( !asset.colorable )
			return out("Invalid asset");
		if( !hexColor && !asset.color_tag )
			return out("Asset not dyed");
		
		const cost = 100;
		if( player.getMoney() < cost )
			return out("Insufficient funds");

		if( !this.is_host ){
			return Game.net.playerDyeItemAtBlacksmith(smithPlayer, player, asset, hexColor);
		}

		let text = " gets an item dyed.";
		if( hexColor ){

			// Ok finally we can do it
			player.consumeMoney(cost);
			asset.color = hexColor;
			asset.color_tag = ntc.name(asset.color)[1];
			this.playFxAudioKitById("buy_item", player, player, undefined, true);

		}
		// Remove dye
		else{
			asset.color = '';
			asset.color_tag = '';
			text = ' removes the dye from an item.';
		}

		game.save();

		this.playFxAudioKitById("armorDye", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+text, "dye", player.id, player.id, 'dye');

	}

	toggleAssetBanked( bankPlayer, asset, amount, player, deposit ){
		
		if( typeof player !== "object" )
			player = this.getPlayerById(player);

		if( typeof player !== "object" )
			player = this.getPlayerById(player);

		if( !player )
			throw "Player missing";

		if( this.battle_active )
			throw "Battle in progress";

		// Netcode
		if( !this.is_host ){
			Game.net.playerBankItem(bankPlayer, asset, amount, player, deposit);
			return;
		}

		if( !(bankPlayer instanceof Player) )
			throw "Bank not found";

		if( typeof asset === "object" )
			asset = asset.id;

		asset = player.getAssetById(asset, !deposit);				// Try in inventory

		if( !asset )
			throw 'Asset not found';

		amount = parseInt(amount);
		const maxAmount = asset && asset.stacking ? asset._stacks : 1;

		if( amount > maxAmount )
			throw "Asset not found on player";
		
		if( isNaN(amount) || amount < 1 )
			throw "Invalid amount";

		if( !this.bankAvailableTo(bankPlayer, player) )
			throw "Bank is not available";
		
		// All done
		if( deposit )
			player.moveAssetToBank(asset, amount);
		else
			player.moveAssetFromBank(asset, amount);

		this.save();
		this.playFxAudioKitById(asset.loot_sound, player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" made a "+(deposit ? 'deposit' : 'withdrawal'), "purchase", player.id, player.id, 'purchase');

	}

	shuffleKinksByAltar( altarPlayer, player, allowError = true ){
		const out = text => {
			if( allowError )
				throw text;
		};
		if( !(altarPlayer instanceof Player ) )
			return out("Altar player invalid type");
		if( !(player instanceof Player) )
			return out("Player invalid type");
		if( !this.altarAvailableTo(altarPlayer, player) )
			return out("Altar not available to you");
		
		if( player.getMoney() < Game.ALTAR_COST )
			return out("Insufficient funds");

		if( !this.is_host ){
			return Game.net.playerUseAltar(altarPlayer, player);
		}

		// Ok finally we can do it
		player.consumeMoney(Game.ALTAR_COST);
		player.shuffleKinks();

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		this.playFxAudioKitById("holyGeneric", player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" is blessed with random kinks!", "altar", player.id, player.id, 'altar');
		this.save();

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
			Game.net.playerSellItem(shop, asset, amount, player);
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
			Game.net.playerBuyItem(shop, asset, amount, player);
			return;
		}
		
		shop.loadState();
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

		player.addAsset(a, amount, undefined, undefined, true);	// Note that this resets ID and returns the new object
		asset.onPurchase(amount);
		this.saveShopState(shop);
		this.save();
		this.ui.draw();

		this.playFxAudioKitById("buy_item", player, player, undefined, true);
		if( a.loot_sound )
			this.playFxAudioKitById(a.loot_sound, player, player, undefined, true);
		this.ui.addText(player.getColoredName()+" purchased "+amount+"x "+a.getName(), "purchase", player.id, player.id, 'purchase');
		
	}

	exchangePlayerMoney( myPlayer, bank ){

		if( !(myPlayer instanceof Player) )
			myPlayer = this.getPlayerById(myPlayer);
		if( !myPlayer )
			throw "You have no player";
		
		if( !this.is_host ){
			Game.net.playerExchangeGold(myPlayer, bank);
			return;
		}
		
		this.ui.addText(myPlayer.getColoredName()+" exchanged their coins.", "purchase", myPlayer.id, myPlayer.id, 'purchase');
		this.playFxAudioKitById("exchange", myPlayer, myPlayer, undefined, true);
		myPlayer.exchangeMoney( bank );
		this.save();
	}

	saveShopState(shop){
		this.state_shops.set(shop.label, shop.saveState());
	}
	

	

	// Check if a player is offering a gym to the target
	gymAvailableTo( gymPlayer, player, encounter = false ){

		if( this.battle_active )
			return false;

		if( !(gymPlayer instanceof Player) )
			throw "GymPlayer is not a player";
			
		if( !(player instanceof Player) )
			throw "Player is not a player";

		const gyms = this.getGymsByPlayer(gymPlayer, player, encounter);
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

		if( !action.validate(player, this.getGymsByPlayer(gymPlayer)[0]) )
			throw "That action can't be learned by you";

		if( player.getMoney() < action.getCost() )
			throw "Insufficient funds";

		// If netcode, send to host & return
		if( !this.is_host ){
			Game.net.playerBuyAction(gymPlayer, player, learnable);
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
	toggleAction( player, actionID ){

		if( this.battle_active )
			throw 'Battle active'

		if( !(player instanceof Player) )
			throw 'Invalid player';

		if( !this.is_host ){
			Game.net.playerToggleAction(player, actionID);
			return;
		}

		if( player.toggleAction(actionID) )
			this.save();

	}

	// Tries to search all players for an item by id
	getPlayerAsset( id ){
		
		for( let player of this.players ){

			const asset = player.getAssetById(id, -1);
			if( asset )
				return asset;

		}

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



	/* Utility shortcuts */
	// Quickly adds a wrapper by a library label to player. If sender isn't specified, it uses target
	utilAddWrapper( target, wrapper, sender, crit = false ){

		if( !sender )
			sender = target;

		glib.get(wrapper, 'Wrapper').useAgainst(sender, target, false, false, undefined, crit);

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
Game.db.version(1).stores({games:'id'});
Game.db.version(2).stores({
	games: 'id',
	chars : 'id',
}).upgrade(trans => {});



Game.EQUIP_COST = 4;
Game.UNEQUIP_COST = 1;
Game.LOG_SIZE = parseInt(localStorage.log_size) || 800;
Game.ROOM_RENTAL_DURATION = 3600*24;
Game.MAX_SLEEP_DURATION = 24;			// Hours
Game.ALTAR_COST = 100;	// 1 gold

Game.Genders = {
	Male : 0x1,
	Female : 0x2,
	Other : 0x4
};

Game.init = function(){

	window.addEventListener('hashchange', () => this.onHashChange());
	Game.net = new NetworkManager();

};

// returns true if netgame was detected
Game.onHashChange = function(){

	const hash = getHash();

	const hashTask = hash.shift();
	if( hashTask === 'net' ){

		const gameID = hash.shift();
		if( this._hashid === gameID )
			return;

		this._hashid = gameID;

		let html = '<form id="joinOnlineGame">'+
			'<h1>Join Online Game</h1>'+
			'Nickname: <input type="text" value="'+esc(Game.net.getStandardNick() || 'Anonymous #'+Math.floor(Math.random()*9999))+'">'+
			'<input type="submit" value="Join" />'+
		'</form>';
		game.ui.modal.set(html);
		$("#joinOnlineGame").on('submit', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			const nick = $("#joinOnlineGame input[type=text]").val().trim();
			if( !nick )
				return game.ui.modal.addError("Please enter a proper nickname");
			Game.net.joinGame(gameID, nick);
			game.ui.modal.onSelectionBoxClose();	// Prevent messing with the URL
			game.ui.modal.close();

		});
		game.ui.modal.onSelectionBoxClose(() => {
			window.location.hash = '';
		});

		game.ui.draw();
		return true;

	}
	else
		this._hashid = '';


};

Game.load = async function(){
	
	StaticModal.ini();

	if( game instanceof Game )
		game.destructor();

	game = new Game();
	if( this.onHashChange() )
		return;

	if(localStorage.game){
		try{
			let g = await Game.getDataByID(localStorage.game);
			if(g)
				return game.load(g);
		}catch(err){
			console.error(err);
		}
	}

	StaticModal.set('mainMenu');

};

Game.saveToDB = async function( data ){
	try{
		await Game.db.games.put(data);
	}catch(err){
		console.error("Error in saving", err);
	}
};

Game.getDataByID = async function( id ){
	return Game.db.games.get(id);
};

// Get save files names
Game.getNames = async function(){

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
Game.new = async function( name, players, story ){

	if( game )
		game.destructor();
	game = new Game(name, story);

	if( Array.isArray(players) ){

		for( let player of players ){

			player.g_resetID();
			game.addPlayer(player);
			player.onPlacedInWorld();

		}

	}
	
	await game.execSave( true );
	let cell = story.start_cell || 0;
	game.setDungeon( story.start_dungeon, cell );
	game.ui.onNewGame();

};

// Converts the current game into a netgame
Game.joinNetGame = function(){
	
	game.is_host = false;
	game.name = '_Netgame_';
	game.ui.updateDMTools();

};

Game.delete = async function( id ){

	await Game.db.games.delete(id);
	if( game.id === id )
		Game.load();

};

