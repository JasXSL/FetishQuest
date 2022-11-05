import Generic from "./helpers/Generic.js";
import Collection from "./helpers/Collection.js";
import Player from "./Player.js";
import { Wrapper } from "./EffectSys.js";
import PlayerTemplate from "./templates/PlayerTemplate.js";
import Condition from "./Condition.js";
import GameAction from "./GameAction.js";
import Dungeon, { DungeonRoom } from "./Dungeon.js";
import GameEvent from "./GameEvent.js";



/*
	An encounter starts a battle
	It has players and can have wrappers applied when it starts

*/
export default class Encounter extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			players : Player,
			wrappers : Wrapper,
			passives : Wrapper,
			player_templates : PlayerTemplate,
			player_conditions : Collection,
			game_actions : GameAction,
			completion_actions : GameAction,
			events : EncounterEvent,

		};
	}

	// Helper function since we're using collections
	getCollectionRelations( field ){

		if( field === 'player_conditions' ){
			
			let out = {};
			for( let i in this.player_conditions )
				out[i] = Condition;

			return out;
			
		}

	}

	constructor(data, parent){
		super(data);

		this.parent = parent;		// Parent varies, but usually trickles up to a quest or game
		this.label = '';
		this.desc = '';
		this.friendly = false;		// Don't start a battle when starting this encounter
		this.started = false;			// Encounter has started (only set on Game clone of this)
		this.wipe_override = false;		// Prevents the default actions from happening if the players lose. Make sure to combine this with an event that captures player loss.
		this.completed = 0;			// Encounter completed (only set on Game clone of this)
		this.players = [];			// Players that MUST be in this event. On encounter start, this may be filled with player_templates to satisfy difficulty
		this.player_templates = [];		// 
		this.player_conditions = new Collection({}, this);	// player_label {id:(arr)conditions}
		this.wrappers = [];			// Wrappers to apply when starting the encounter. auto target is the player that started the encounter
		this.passives = [];			// Use add_conditions to filter out the player(s) the passive should affect
		this.startText = '';		// Text to trigger when starting
		this.conditions = [];
		this.isEvt = false;			// This encounter is a random event. Currently only used in the procedural dungeon generator.
		this.evtWeight = 1.0;		// Weight number. Higher will appear more frequently.

		this.game_actions = [];			// Game actions to run when the encounter starts / passive things like RP
		this.completion_actions = [];	// Game actions to run when the encounter completes
		this.events = [];				// EncounterEvent, lets you bind encounters to events

		this.respawn = 0;			// Time to respawn
		this.difficulty_adjust = 0;	// Offsets from difficulty. Can be useful when adding a friendly NPC

		this.time_started = -1;

		this.load(data);
	}

	getDifficulty(){

		const dungeon = this.getDungeon();
		let difficulty = 1;
		if( dungeon )
			difficulty = dungeon.getDifficulty();
		else
			difficulty = game.getTeamPlayers().length;
		difficulty += this.difficulty_adjust;
		if( difficulty < 0.1 )
			difficulty = 0.1;
			
		difficulty = difficulty+Math.random()*0.25;		// Difficulty may vary by 25%
		return difficulty;

	}

	// Converts the template into a fixed encounter, generating players etc
	// Player power is handled in onPlacedInWorld
	// Chainable
	prepare( force ){

		if( this.started && !force )
			return;


		this.time_started = game.time;
		// Checks if we actually have any templates to add
		let hasTemplates = Boolean(this.player_templates[0]);	
		let totalSlots = game.getTeamPlayers().length-0.25 + Math.random();
		if( totalSlots > 4 )
		totalSlots = 4;		// Don't generate more than 5 enemies

		if( hasTemplates ){
		
			let usedMonsters = {};	// label : nrUses
			const level = game.getAveragePlayerLevel();

			let maxSlots = totalSlots;	// Team size is min players, plus one extra most of the time
			
			
			// Gets viable monsters we can put in
			const getViableMonsters = () => {

				let out = this.player_templates, 
					filter
				;

				// PRIORITY 1: Gender
				const gameGenders = window.game && game.genders || 0;
				if( gameGenders ){

					// First off, let's try to filter by gender. Beasts are always allowed.
					out = this.player_templates.filter(pl => {
						return (
							gameGenders&pl.getGameGender() || pl.isBeast()				// Check gender
						)
					});

				}
				// None passed filter, allow all through
				if( !out.length )
					out = this.player_templates;


				// PRIORITY 2: Level
				filter = out.filter(p => 
					p.min_level <= level && p.getMaxLevel() >= level
				);
				// At least one monster fit level. Otherwise revert to the previous filter, as level isn't hugely important.
				if( filter.length )
					out = filter;

				// PRIORITY 3: SLOTS - This isn't hugely important. It may result in weaker strong monsters, but that's fine.
				// Filter by slots
				filter = out.filter(pl => this.players.length || Math.max(1, pl.slots) <= maxSlots);
				// Only override out with this filter if at least one passed. 
				if( filter.length )
					out = filter;

				
				// FINAL: Max uses - If nothing above passed filter, we can return an empty array
				// In the case of an empty array, the existing monsters get buffed
				out = out.filter(p => {
					let nr = parseInt(usedMonsters[p.label]) || 0;
					return p.max < 1 || nr < p.max;
				});
				
				return out;

			};
			while( maxSlots > 0 ){

				let viableMonsters = getViableMonsters();
				let mTemplate = randElem(viableMonsters);

				// Might happen if you have a limit to nr of player types
				if( !viableMonsters.length )
					break;

				// Generate a player to push
				const pl = mTemplate.generate(level);
				pl.generated = true;	// Set generated so it can be removed when leaving the area, regardless of allegiance
				pl._slots = mTemplate.slots;
				if( mTemplate.slots === -1 )
					pl._slots = maxSlots;
				pl.power *= pl._slots;
				this.players.push(pl);
				maxSlots -= pl._slots;
				usedMonsters[mTemplate.label] = usedMonsters[mTemplate.label]+1 || 1;

			}

			// Fallback, just use the first monster
			if( !this.players.length ){

				console.error("Didn't find a viable template for encounter. Had to fallback.");
				const mTemplate = this.player_templates[0];
				const pl = mTemplate.generate(level);
				pl.generated = true;
				this.players.push(pl);

			}
		
		}

		for( let player of this.players )
			player.g_resetID();

		this.onModified();
		return this;

	}


	// Whenever the encounter is placed in world, regardless of if it just started or not
	// This is always triggered after the encounter starts, otherwise player effects won't work (since they need game.players populated)
	// If just_started is true, it means the encounter just started
	onPlacedInWorld( just_started = true ){

		// Bind passives
		for( let wrapper of this.passives )
			wrapper.bindEvents();

		for( let evt of this.events )
			evt.bind();

		// Don't reset HP and such if it was already started
		if( !just_started )
			return;

		// Run world placement event on all players to get them to max hp etc
		for( let player of this.players ){

			player.generated = true;
			player.onPlacedInWorld();

		}

	}

	rebalance(){

		// Difficulty adjust
		// Average by the ratio of NPCs vs PCs. Then multiply their power by that.
		let sumSlots = 0;
		// Only enabled players should affect the power calculations
		const myPlayers = this.players.map(el => el.id);
		const en = game.getEnabledPlayers().filter(el => myPlayers.includes(el.id));
		for( let pl of en ){
			console.log(pl.label, pl.power);
			sumSlots += pl._slots || pl.power || 1;
		}
		if( sumSlots <= 0 )
			sumSlots = 1;

		const difficulty = this.getDifficulty();
		let average = difficulty/sumSlots;	// Modifier if we go above difficulty
		
		for( let player of en ){
			if( player.power > 0 )
				player.power *= average;
			player.onRebalanced();
		}

	}

	onRemoved(){
		for( let wrapper of this.passives )
			wrapper.unbindEvents();
		for( let evt of this.events )
			evt.unbind();
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
		
		this.player_conditions = Collection.loadThis(this.player_conditions);
		for( let i in this.player_conditions ){
			this.player_conditions[i] = Condition.loadThese(this.player_conditions[i], this);
		}
		
	}

	save( full ){

		const out = {};
		if( full ){
			
			out.startText = this.startText;
			out.wrappers = Wrapper.saveThese(this.wrappers, full);
			out.label = this.label;
			out.player_templates = PlayerTemplate.saveThese(this.player_templates, full);
			out.conditions = Condition.saveThese(this.conditions, full);
			out.respawn = this.respawn;
			out.difficulty_adjust = this.difficulty_adjust;
			out.wipe_override = this.wipe_override;
			out.events = EncounterEvent.saveThese(this.events, full);
			out.isEvt = this.isEvt;
			out.evtWeight = this.evtWeight;

		}

		// Players are needed in the current encounter for services to work
		if( full || this === window.game?.encounter )
			out.players = Player.saveThese(this.players, full);

		out.friendly = this.friendly;
		out.game_actions = GameAction.saveThese(this.game_actions, full);
		out.completion_actions = GameAction.saveThese(this.completion_actions, full);
		out.passives = Wrapper.saveThese(this.passives, full);

		out.player_conditions = this.player_conditions;
		if( this.player_conditions && this.player_conditions.save ){
			out.player_conditions = this.player_conditions.save(full);
		}
		
		if( full !== "mod" ){
			out.id = this.id;
			out.completed = this.completed;
			out.started = this.started;
			out.time_started = this.time_started;
		}
		else{
			out.desc = this.desc;
			this.g_sanitizeDefaults(out);
		}
		// Not really gonna need a full because these are never output to webplayers
		return out;

	}
	
	validate( event, debug ){

		if( !event )
			event = new GameEvent({});
		return Condition.all(this.conditions, event, debug);

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
	getViableActions( targetPlayer, validate = false, debug = false ){
		return GameAction.getViable(this.game_actions, targetPlayer, debug, validate);
	}

	// Gets roleplay ACTIONs
	// player is the Player who offers the RP. GameAction is validated against that player. The RP itself should be validated later against the game active player
	getRoleplays( player, validate = true, debug = false ){

		// GameAction is validated against the player
		const actions = this.getViableActions(player, validate, debug);
		if( debug )
			console.log("getViableActions ->", actions);
		return actions.filter(action => {

			if( action.type !== GameAction.types.roleplay )
				return false;

			const rp = action.getDataAsRoleplay();
			if( !rp )
				return false;
			if( !validate )
				return true;
			return true;

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

	// Gets kink reset altars
	getAltars( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.altar);
	}

	// Gets kink reset altars
	getBanks( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.bank);
	}

	// Get transmog actions
	getTransmogs( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.transmog);
	}

	// Gets gym actions
	getGyms( targetPlayer ){
		const actions = this.getViableActions( targetPlayer );
		return actions.filter(action => action.type === GameAction.types.gym);
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

		if( !this.completed && completed ){

			for( let action of this.completion_actions )
				action.trigger(game.players[0]);

		}
		
		this.completed = completed;
		if( this.completed === true )
			this.completed = game.time;
		
		this.onModified();

	}

	// Updates saved dungeon state
	onModified(){

		const dungeon = this.getDungeon(), room = this.getRoom();
		if( room && dungeon )
			dungeon.roomModified(room);

	}







	// Static
	// Gets the first viable encounter
	static getFirstViable( arr, event ){
		
		if( !arr.length )
			return false;

		// Prefer one with a proper level range
		const level = game.getAveragePlayerLevel();
		let valid = arr.filter(el => {

			if( !Array.isArray(el.player_templates) )
				console.error("El player templates is not an array, arr was:", arr, "el was", el);

			if( !el.player_templates.length )
				return true;

			for( let pt of el.player_templates ){

				if( pt.min_level <= level && (pt.max_level < 0 || pt.max_level >= level) )
					return true;

			}

		});
		// None in level range. Allow all D:
		if( !valid.length ){

			valid = arr;
			console.debug("Note: No monsters in level range for in encounter list", arr, "allowing all through");

		}

		for( let enc of valid ){
			
			if( enc.validate(event, true) ){

				enc.g_resetID();
				return enc.clone(enc.parent);

			}

		}
		return false;

	}
	static getRandomViable( arr, event ){

		const entries = arr.slice();
		shuffle(entries);
		return this.getFirstViable(entries, event);

	};

	// returns all library encounters tagged as procedural event
	static getAllProcEvtEncounters(){

		return glib.getAllValues('Encounter').filter(el => el.isEvt).map(el => el.rebaseIfNeeded());

	}
}

// Dummy encounter. Used if no encounters passed filter, or if an encounter is complete when leaving and returning to a dungeon.
Encounter.ENCOUNTER_NONE = '_BLANK_';
// Default encounter. Used to indicate that the encounter hasn't been generated yet.
Encounter.ENCOUNTER_UNDEFINED = '_UNDEFINED_';


export class EncounterEvent extends Generic{

	static getRelations(){ 
		return {
			actions: GameAction
		};
	}

	constructor(data, parent){
		super(data);

		this.parent = parent;		// Parent varies, but usually trickles up to a quest or game
		this.label = '';
		this.desc = '';
		this.eventType = GameEvent.Types.none;
		this.actions = [];							// GameActions to run
		this.maxTriggers = -1;						// Max times this event can trigger. -1 = inf
		this.maxActions = -1;						// Max actions that can be triggered in the actions array
		this.onSender = true;						// Trigger on sender
		this.debug = false;
		this._triggers = 0;
		this._binding = null;

		this.load(data);
	}


	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

	save( full ){

		const out = {
			label : this.label
		};
		if( full ){
			
			out.eventType = this.eventType;
			out.actions = GameAction.saveThese(this.actions, full);
			out.maxTriggers = this.maxTriggers;
			out.maxActions = this.maxActions;
			out.onSender = this.onSender;
			out.debug = this.debug;

		}


		if( full !== "mod" ){
			
			out.id = this.id;
			if( full )
				out._triggers = this._triggers;
			
		}
		else{
			out.desc = this.desc;
			this.g_sanitizeDefaults(out);
		}
		// Not really gonna need a full because these are never output to webplayers
		return out;

	}

	onTrigger(event){

		if( this.maxTriggers > -1 && this._triggers >= this.maxTriggers )
			return;

		let trigs = 0;
		for( let action of this.actions ){

			if( !action.validate(event, this.debug) )
				continue;

			let targs = toArray(event.sender);
			if( !this.onSender )
				targs = toArray(event.target);
			
			if( this.debug )
				console.log("Running encounterTrigger ", this, " on ", targs);
			for( let t of targs )
				action.trigger(t, event, this.debug);

			if( ++trigs >= this.maxTriggers && this.maxTriggers > -1 )
				break;

		}

		++this._triggers;
		if( this._triggers >= this.maxTriggers && this.maxTriggers > -1 )
			this.unbind();

	}
	
	bind(){

		this.unbind();
		this._binding = GameEvent.on(this.eventType, event => this.onTrigger(event));

	}

	unbind(){

		if( !this._binding )
			return;

		GameEvent.off(this._binding);
		this._binding = null;

	}

}




