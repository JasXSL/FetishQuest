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
		
		this.game_actions = [];			// Game actions to run when the encounter starts / passive things like RP
		this.completion_actions = [];	// Game actions to run when the encounter completes
		this.events = [];				// EncounterEvent, lets you bind encounters to events

		this.respawn = 0;			// Time to respawn
		this.difficulty_adjust = 0;	// Offsets from difficulty. Can be useful when adding a friendly NPC

		this.time_started = -1;

		this.load(data);
	}

	// Converts the template into a fixed encounter, generating players etc
	// Chainable
	prepare(){

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

		if( this.started )
			return;


		this.time_started = game.time;

		// Checks if we actually have any templates to add
		let hasTemplates = Boolean(this.player_templates[0]);	
		if( hasTemplates ){
		
			let usedMonsters = {};	// label : nrUses
			const level = game.getAveragePlayerLevel();

			let maxSlots = game.getTeamPlayers().length + (Math.random() < 0.75);	// Team size is min players, plus one extra most of the time
			if( maxSlots > 5 )
				maxSlots = 5;		// Don't generate more than 5 enemies

			// Gets viable monsters we can put in
			const getViableMonsters = () => {

				let out = this.player_templates;
				// Filter by gender settings
				const gameGenders = window.game && game.genders || 0;
				if( gameGenders ){

					// First off, let's try to filter by gender. Beasts are always allowed.
					out = this.player_templates.filter(pl => {
						return (
							(
								gameGenders&pl.getGameGender() || pl.isBeast()				// Check gender
							) &&
							(
								this.players.length || Math.max(1, pl.slots) <= maxSlots	// Check slots
							)
						)
					});

				}

				// None passed filter, allow all through
				if( !out.length )
					out = this.player_templates;

				// Filter by level
				out = out.filter(p => 
					p.min_level <= level && p.getMaxLevel() >= level
				);
				// None matched filters, allow all through. Not graceful, but it's on the modder to make sure the encounter has monsters for a full level range
				if( !out.length )
					out = this.player_templates;

				// Filter by max uses. This allows you to return a [] in which case you'll want to buff up the last monster
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
				pl._slots = Math.max(1, Math.min(mTemplate.slots, maxSlots));
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

		let totalSlots = 0;
		for( let player of this.players ){
			
			player.g_resetID();
			totalSlots += player._slots || 1;

		}

		
		let average = difficulty/totalSlots;
		
		for( let player of this.players ){
			if( player.power > 0 )
				player.power *= average*(player._slots||1);
		}
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

		// Run world placement event on all players
		for( let player of this.players ){

			player.generated = true;
			player.onPlacedInWorld();

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
			out.players = Player.saveThese(this.players, full);
			out.label = this.label;
			out.player_templates = PlayerTemplate.saveThese(this.player_templates, full);
			out.conditions = Condition.saveThese(this.conditions, full);
			out.respawn = this.respawn;
			out.difficulty_adjust = this.difficulty_adjust;
			out.wipe_override = this.wipe_override;
			out.events = EncounterEvent.saveThese(this.events, full);

		}
		out.friendly = this.friendly;
		out.game_actions = GameAction.saveThese(this.game_actions, full);
		out.completion_actions = GameAction.saveThese(this.completion_actions, full);
		out.passives = Wrapper.saveThese(this.passives, full);

		out.player_conditions = this.player_conditions;
		if( this.player_conditions && this.player_conditions.save )
			out.player_conditions = this.player_conditions.save(full);
		
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





}


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




