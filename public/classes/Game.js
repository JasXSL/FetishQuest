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
import Mod from './Mod.js';
import MAIN_MOD from '../libraries/_main_mod.js';
import GameLib from './GameLib.js';

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
		this.encounter = new DungeonEncounter({}, this);		// if this is inside a dungeon, they'll be the same objects
		this.quests = [];								// Quest Objects of quests the party is on
		this.lib = new GameLib();

		// Library of custom items
		this.libAsset = [];
		this.libAction = [];

		this.audio_fx = new Audio("fx");
		this.audio_ambient = new Audio('ambient', false);
		this.audio_music = new Audio('music', false);

		this.active_music_file = null;
		this.active_ambient_file = null;
		this.active_music = null;						// Only one song can play at a time
		this.active_ambient = null;						// Only one ambient track can play at once 

		this.mods_enabled = [];							// __MAIN__ is always added

		this.end_turn_after_action = false;				// When set, ends turn after the current action completes
	}

	destructor(){
		this.ui.destructor();
		this.net.destructor();
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
			quests : this.quests.map(el => el.save(full))
		};

		
		if( full ){
			out.libAsset = this.libAsset.map(el => el.save(full));
			out.libAction = this.libAction.map(el => el.save(full));
			out.name = this.name;
			out.id = this.id;
			out.dm_writes_texts = this.dm_writes_texts;
			out.chat_log = this.chat_log;
		}
		return out;
	}

	// Async file save
	async save( allowInsert, ignoreNetGame ){

		if( !this.initialized && !allowInsert ){
			game.ui.addError("Unable to save, game failed to intialize");
			return false;
		}

		if( !this.is_host )
			return false;


		if( !ignoreNetGame )
			this.net.sendGameUpdate();

		let out = this.getSaveData(true);
		localStorage.game = this.id;
		let ret = await Game.db.games.put(out);
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
		this.libAsset = this.libAsset.map(el => new Asset(el));
		this.libAction = this.libAction.map(el => new Action(el));

		await this.assembleLibrary();

		this.ui.draw();
		

		// Load the chat log
		let log = this.chat_log.slice();
		this.chat_log = [];
		for( let ch of log )
			this.ui.addText.apply(this.ui, ch);
		
		this.assignAllColors();

		this.initialized = true;

		this.ui.ini();
		
		// Make sure a dungeon exists
		if( !this.dungeon || !this.dungeon.rooms.length )
			this.addRandomQuest();

		this.renderer.loadActiveDungeon();

	}

	// Automatically invoked after g_autoload() in load()
	rebase( forcePlayers ){

		this.players = this.players.map(el => {
			if( el.constructor !== Player || forcePlayers )
				return new Player(el);
			return el;
		});
		this.quests = Quest.loadThese(this.quests, this);		
		this.dungeon = new Dungeon(this.dungeon, this);
		this.encounter = new DungeonEncounter(this.encounter, this);


		// Map Quests, Dungeons, and Players
		// If our current dungeon is a quest dungeon, set it to the quest dungeon object
		this.referenceQuestDungeon();

		// If our current encounter is in the current dungeon, then use the dungeon encounter object
		let encounter = this.dungeon.getEncounterById(this.encounter.id);
		if( encounter )
			this.encounter = encounter;

		// Check if the players are from the encounter, in that case overwrite them
		for( let i in this.players ){
			let p = this.players[i];
			let pl = this.encounter.getPlayerById(p.id);
			if( pl )
				this.players[i] = pl;
		}
		
		// Pick the ambiance
		this.updateAmbiance();

	}

	// Overwrites active spells with spells from the database
	refetchActions(){
		for(let p of this.players)
			p.refetchActions();
		this.save();
	}

	// Builds the library
	async assembleLibrary(){
		let mods = [MAIN_MOD];
		this.lib.loadMods(mods);
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

	}

	async onEncounterLost( winningTeam ){
		console.log("The players died");

		// Allow enemies to steal
		let losers = shuffle(this.getPlayersNotOnTeam(winningTeam)),
			armorSteal = losers.slice();

		this.encounter.started = false;
		this.encounter.completed = false;

		// allow enemies to punish
		await delay(2000);
		let winners = shuffle(this.getAlivePlayersInTeam(winningTeam));
		for( let winner of winners ){
			if( !this.dm_writes_texts && winner.auto_play ){	// Async function, check before each call
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
		new GameEvent({type:GameEvent.Types.dungeonExited, dungeon:this.dungeon, quest:this.dungeon.getQuest()}).raise();
	}
	onDungeonEntered(){
		new GameEvent({type:GameEvent.Types.dungeonEntered, dungeon:this.dungeon, quest:this.dungeon.getQuest()}).raise();
	}
	// Draw quest completed message
	onQuestCompleted( quest ){
		if( !(quest instanceof Quest) )
			return;
		this.ui.addNotice("Quest completed: "+esc(quest.name)+"!");
		this.playFxAudioKitById('questCompleted', undefined, undefined, undefined, true);
	}
	onQuestAccepted( quest ){
		this.playFxAudioKitById('questPickup', undefined, undefined, undefined, true);
	}
	// Raised before a room changes
	onRoomChange(){
		this.removeEnemies();
		this.ui.draw();
		for( let player of this.players )
			player.onCellChange();
	}



	/* AUDIO */
	// Plays a sound. armor_slot is only needed for when a "punch/hit" sound specific to the armor of the player should be played
	// Internal only lets you play the sound without sharing it with the other players (if DM)
	playFxAudioKitById(id, sender, target, armor_slot, global = false ){
		let kit = glibAudio[id];
		if( !kit )
			return console.error("Audio kit missing", id);
		kit.play(this.audio_fx, sender, target, armor_slot);
		let sid, tid;
		if( sender )
			sid = sender.id;
		if( target )
			tid = target.id;
		if( this.is_host && global )
			this.net.dmPlaySoundOnPlayer(sid, tid, id, armor_slot);

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
			this.save(false, true);
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
			game.ui.addError("You are not the DM");
			return;
		}

		if( uuid === 'ooc' )
			isOOC = true;

		if( uuid !== "DM" && !isOOC && (!this.getPlayerById(uuid) || !this.playerIsMe(this.getPlayerById(uuid))) )
			return game.ui.addError("Player not yours: "+uuid);

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

		// We are host
		let pl = "DM";
		// This lets you  use the uuid as a name directly, useful for ooc
		if( isOOC )
			pl = uuid;
		else if( uuid !== "DM" ){
			pl = this.getPlayerById(uuid);
			if(!pl)
				return game.ui.addError("Can't speak as player. Uuid "+uuid+" not found");
			pl = pl.name;
		}
		
		// This sends the text from DM netgame
		game.ui.addText(
			(isOOC ? '(OOC) ' : '')+pl+": "+text,
			undefined, 
			uuid, 
			undefined, 
			"playerChat"+(pl==="DM" ? ' dmChat' : '')+
			(isOOC ? ' ooc' : '')
		);

	}


	/* DUNGEON */
	setDungeon( dungeon ){
		if( dungeon === this.dungeon )
			return;
		if( !(dungeon instanceof Dungeon) )
			return console.error(dungeon, "is not a dungeon");
		let pre = this.dungeon;
		if( pre.id !== this.id )
			this.onDungeonExit();
		this.dungeon = dungeon;
		this.referenceQuestDungeon();
		this.onDungeonEntered();
		this.net.purgeFromLastPush(["dungeon"],["encounter"]);
		this.save();
		this.renderer.loadActiveDungeon();
	}
	
	// Dungeon
	generateDungeon(...args){
		this.setDungeon(Dungeon.generate(...args));
		return this.dungeon;
	}

	// Returns the quest our dungeon is tied to (if any)
	getDungeonQuest(){
		for( let quest of this.quests ){
			if( quest.dungeon.id === this.dungeon.id )
				return quest;
		}
		return false;
	}
	// Switches the current dungeon to a quest's dungeon if they share the same id
	referenceQuestDungeon(){
		// See if dungeon can be fetched from a quest
		for( let quest of this.quests ){
			if( quest.dungeon.id === this.dungeon.id )
				this.dungeon = quest.dungeon;
		}
	}

	setDungeonFromWorld( path ){
		let base = glibWorld;
		let pa = path.split('.');
		while( pa.length ){
			base = base[pa.shift()];
			if( typeof base !== "object" ){
				console.error("World dungeon not found", path, "in", glibWorld);
				return false;
			}
		}
		this.setDungeon(base.clone());
	}


	/* QUEST */
	addRandomQuest(...args){
		// Todo: Remove this later
		this.quests = [];

		let quest = Quest.generate(...args);
		if( !quest )
			return false;
		// Todo: Remove this later
		this.addQuest(quest);
		this.setDungeon(quest.dungeon);
	}
	addQuest(quest){
		if( this.quests.length > 5 )
			return this.ui.addError("Quest log is full.");
		if( !(quest instanceof Quest) )
			return this.ui.addError("Quest is not a Quest object");
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
		if( this.initialized )
			this.save();
		this.ui.draw();
		return p;

	}

	// Remove a player by id
	removePlayer( id ){

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
				this.save();

				return true;
			}

		}

		return false;
	}

	// Removes all players not on team 0
	removeEnemies(){

		let p = this.players.slice();
		for( let pl of p ){

			if( pl.team !== 0 )
				this.removePlayer(pl.id);

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

	// Checks if a player is controlled by the netgame player. ExcludeDM can be used to ignore DM ownership
	playerIsMe( player, excludeDM = false ){

		if( this.is_host && !excludeDM )
			return true;

		return player.netgame_owner === this.net.id;

	}

	turnPlayerIsMe(){
		return this.playerIsMe(this.getTurnPlayer());
	}

	// Gets my first player if I own one
	getMyFirstPlayer(){

		let owned = this.getMyPlayers();
		if( owned.length )
			return owned[0];
		return false;

	}

	// Gets all players owned by me
	getMyPlayers(){

		return this.players.filter(el => {
			return this.playerIsMe(el);
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
				game.ui.addError("Not your turn");
				return false;
			}
			if( player.ap < apCost ){
				game.ui.addError("Not enough AP");
				return false;
			}
		}

		if(!game.playerIsMe(player)){
			game.ui.addError("not your player");
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

	// Deletes a player item by Player, Asset.id
	deletePlayerItem( player, id ){

		if(!game.playerIsMe(player)){
			game.ui.addError("not your player");
			return false;
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
			game.ui.addError("not your player");
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
		console.log("Players rebased");

	}







	/* ENCOUNTER */
	// Start an encounter
	startEncounter( player, encounter ){

		if( !encounter.active || encounter.started || encounter.completed || !this.getAlivePlayersInTeam().length )
			return;

		this.encounter = encounter;
		this.encounter.started = true;
		encounter.started = true;

		// Check encounter here
		if( encounter.players ){
			// Purge previous enemies
			this.removeEnemies();
			for( let pl of encounter.players ){
				pl.auto_play = true;
				//pl.addHP(Infinity);
				game.addPlayer(pl);
			}
		}

		this.toggleBattle(true);
		game.modal.battleVis();
		if( encounter.startText ){
			let text = new Text({text : encounter.startText});
			text.run(new GameEvent({
				sender : encounter.players[0],
				target : player,
				type : GameEvent.Types.encounterStarted,
				encounter : this.encounter
			}));
		}

		for( let wrapper of encounter.wrappers ){
			wrapper.useAgainst( encounter.players[0], player );
		}

		// Purge is needed after each overwrite
		this.net.purgeFromLastPush(["encounter"]);		
		game.save();
		this.ui.draw();
		
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

		if( this.encounter.active && !this.encounter.finished ){

			let evt = GameEvent.Types.encounterLost;
			if( standing[0] !== undefined && standing[0] === 0 ){
				this.onEncounterDefeated();
				evt = GameEvent.Types.encounterDefeated;
			}
			else 
				this.onEncounterLost(standing[0]);
			new GameEvent({type:evt, encounter:this.encounter}).raise();

		}

		// Players won
		if( standing[0] !== undefined && standing[0] === 0 ){
			
			// Restore 40% HP and MP at the end of the battle
			this.getTeamPlayers(0).map(pl => {
				pl.addHP(Math.ceil(pl.max_hp*0.4));
				pl.addMP(Math.ceil(pl.max_mp*0.4));
			});

			// add loot from enemies
			for( let pl of this.players ){

				if( pl.hp <= 0 && pl.team !== 0 ){
					let assets = pl.assets;
					if( assets.length ){
						this.dungeon.getActiveRoom().addLootBag(assets);
						pl.assets = [];
					}
				}

			}
			
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
			return game.ui.addError("Not your turn");

		if( !game.playerIsMe(player) )
			return game.ui.addError("Not your player");

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
		this.encounter.started = false;
		this.toggleBattle(false);
		this.dungeon.goToRoom( player, this.dungeon.previous_room );	// Saves

	}



	/* ASSETS */
	useRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID){

		if( !this.playerIsMe(senderPlayer) )
			return this.ui.addError("Not your player");

		if( !this.is_host )
			return this.net.playerUseRepairAsset( senderPlayer, targetPlayer, repairKitID, assetID);

		let kitAsset = senderPlayer.getAssetById(repairKitID);
		let targetAsset = targetPlayer.getAssetById(assetID);
		if( !kitAsset )
			return this.ui.addError("Repair kit not found");
		if( !targetAsset )
			return this.ui.addError("Target asset not found");

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



	/* LIBRARY MANAGEMENT */
	/*
	// Adds an asset to a library by Asset.constructor
	// This is primarily useful for custom assets or actions you want to reuse
	addToLibrary( asset ){

		let library = this.getLibrary( asset );
		if( !library )
			return false;
		this.removeFromLibrary( asset );
		library.push(asset);
		return true;

	}

	// Removes an asset from a library by Asset.constructor
	removeFromLibrary( asset ){
		let library = this.getLibrary(asset);
		if( !library )
			return false;

		for(let i in library){
			if( library[i].label === asset.label ){
				library.splice(i,1);
				return true;
			}
		}
		return false;
	}

	// Returns a library of only custom items
	// You probably want to use getFullLibrary instead
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
		if( asset === "Action" )
			return this.libAction;
		if( asset === "Text" )
			return this.libText;

		console.error("No library implemented yet for", asset.constructor.name);
		return false;
	}

	// Converts a library into an object where id becomes the object key
	objectizeLibrary( arr ){
		let out = {};
		for( let item of arr ){
			out[item.label] = item;
		}
		return out;
	}

	// Returns a library where custom items are overwriting library items
	getFullLibrary( type ){

		let out = {};

		// Fetch an asset
		if( type === "Asset" ){
			for( let a of glibAsset )
				out[a.label] = a;
			let sub = this.getLibrary("Asset");
			for( let a of sub ){
				out[a.label] = a;
				a._custom = true;
			}
		}

		else if( type === "Action" ){
			for( let a of glibAction )
				out[a.label] = a;
			let sub = this.getLibrary("Action");
			for( let a of sub ){
				out[a.label] = a;
				a._custom = true;
			}
		}

		else if( type === "Text" )
			out = glibText;

		else if( type === "AssetTemplate" )
			out = glibAssetTemplate;
		
		else if( type === "PlayerClass" )
			out = this.objectizeLibrary(glibPlayerClass);
		else if( type === "PlayerTemplate" )
			return this.objectizeLibrary(glibPlayerTemplate);
		else if( type === "DungeonTemplate" )
			return this.objectizeLibrary(glibDungeonTemplate);
		else if( type == "Condition" )
			return glibCondition;
		else{
			console.error("No such library", type);
			return false;
		}
		return out;

	}
	*/
	



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
	
	if( game )
		game.destructor();

	game = new Game();
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
Game.new = async name => {
	if( game )
		game.destructor();
	game = new Game(name);

	await game.assembleLibrary();
	
	let clib = game.getFullLibrary('PlayerClass');
	// Add template characters
	let player = new Player({
		name : 'Wolfess',
		species : 'wolf',
		description : 'A female wolf template character. A good template for a female character. Click Edit Player or Delete.',
		icon : '/media/characters/wolf.jpg',
		class : clib.monk.save(true),
	});
	player.setTags([stdTag.plFurry, stdTag.vagina, stdTag.breasts, stdTag.plFangs, stdTag.plHair, stdTag.plLongHair, stdTag.plTail]).addActionsForClass();
	game.addPlayer(player);

	player = new Player({
		name : 'Otter',
		species : 'otter',
		description : 'A male otter template character. A good template for a male character. Click Edit Player or Delete.',
		icon : '/media/characters/otter.jpg',
		class : clib.elementalist.save(true),
	});
	player.setTags([stdTag.plFurry, stdTag.penis, stdTag.plHair, stdTag.plTail]).addActionsForClass();
	game.addPlayer(player);

	game.initialized = true;
	await game.save( true );
};

// Converts the current game into a netgame
Game.joinNetGame = () => {
	
	game.is_host = false;
	game.name = '_Netgame_';

};

Game.delete = async id => {
	return Game.db.games.delete(id);
};


// Bind events
GameEvent.on(GameEvent.Types.playerDefeated, event => {
	game.checkBattleEnded();
	// Check if event player is in the current encounter
	if( ~game.encounter.players.indexOf(event.target) ){
		event.encounter = game.encounter;
		event.quest = game.encounter.getQuest();
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

