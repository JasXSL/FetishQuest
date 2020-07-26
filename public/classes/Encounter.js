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

	constructor(data, parent){
		super(data);

		this.parent = parent;		// Parent varies, but usually trickles up to a quest or game
		this.label = '';
		this.desc = '';
		this.friendly = false;		// Don't start a battle when starting this encounter
		this.started = false;		// Encounter has started (only set on Game clone of this)
		this.completed = 0;			// Encounter completed (only set on Game clone of this)
		this.players = [];			// Players that MUST be in this event. On encounter start, this may be filled with player_templates to satisfy difficulty
		this.player_templates = [];		// 
		this.player_conditions = new Collection({}, this);	// player_label {id:(arr)conditions}
		this.wrappers = [];			// Wrappers to apply when starting the encounter. auto target is the player that started the encounter
		this.passives = [];			// Use add_conditions to filter out the player(s) the passive should affect
		this.startText = '';		// Text to trigger when starting
		this.conditions = [];
		this.game_actions = [];		// Game actions to run when the encounter starts
		this.time_completed = 0;
		this.respawn = 0;			// Time to respawn
		this.difficulty_adjust = 0;	// Offsets from difficulty. Can be useful when adding a friendly NPC

		this.load(data);
	}

	// Converts the template into a fixed encounter, generating players etc
	prepare(){


		const dungeon = this.getDungeon();
		let difficulty = 1;
		if( dungeon )
			difficulty = dungeon.getDifficulty();
		else
			difficulty = game.getTeamPlayers().length;


		difficulty += this.difficulty_adjust;

		if( this.started )
			return;

		// Run before an encounter is launched. If we're using templates, we should generate the NPCs here
		difficulty = difficulty+Math.random()*0.5;

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
			const maxPlayers = Math.min(difficulty+1, 6);
			while( dif < difficulty && this.players.length < maxPlayers ){

				shuffle(viableMonsters);
				let success = false;
				// Find a monster to add
				for( let mTemplate of viableMonsters ){

					// Generate a player to push
					const pl = mTemplate.generate(
						Math.min(mTemplate.max_level, Math.max(level, mTemplate.min_level))
					);
					pl.generated = true;	// Set generated so it can be removed when leaving the area, regardless of allegiance
					let power = pl.power;
					// Powered, make sure it stops here
					if( power < 0 )
						power = difficulty-dif;
					// We can increase or lower the difficulty of this monster if it's not the last monster and isn't custom powered
					else if( power >= 1  ){

						if( this.players.length+1 < Math.floor(maxPlayers) ){
							if( Math.random() < 0.5 )
								power /= 2;
							pl.power = power;
						}
						// Last player should match the remainder
						else{

							power = difficulty-dif;

							// Not enough power left to create a new player, append the remainder to an existing one
							if( power < 0.25 ){

								randElem(this.players).power += power;
								dif = difficulty;
								
								break;
							}
							// Can add a player
							else{
								
								pl.power = Math.max(power, 0.25);
							}
						}

					}
					

					// This one is viable
					if( mTemplate.difficulty*power+dif <= difficulty ){

						this.players.push(pl);
						const amt = mTemplate.difficulty*power*(mTemplate.power === -1 ? game.getTeamPlayers().length : 1);
						dif += amt;
						success = true;
						break;

					}else
						console.log("Skipped because", mTemplate.difficulty, "*", power, "+", dif + ">"+difficulty);

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
				pl.generated = true;
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

		// Bind passives
		for( let wrapper of this.passives )
			wrapper.bindEvents();

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
			out.wrappers = Wrapper.saveThese(this.wrappers, full);
			out.players = Player.saveThese(this.players, full);
			out.label = this.label;
			out.player_templates = PlayerTemplate.saveThese(this.player_templates, full);
			out.conditions = Condition.saveThese(this.conditions, full);
			out.respawn = this.respawn;
			out.difficulty_adjust = this.difficulty_adjust;
		}
		out.friendly = this.friendly;
		out.game_actions = GameAction.saveThese(this.game_actions, full);
		out.passives = Wrapper.saveThese(this.passives, full);
		out.player_conditions = this.player_conditions.save(full);
		
		if( full !== "mod" ){
			out.id = this.id;
			out.completed = this.completed;
			out.started = this.started;
		}
		else{
			out.desc = this.desc;
			this.g_sanitizeDefaults(out);
		}
		// Not really gonna need a full because these are never output to webplayers
		return out;
	}
	
	validate( event ){

		if( !event )
			event = new GameEvent({});
		return Condition.all(this.conditions, event);

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
	getViableActions( targetPlayer, validate = false ){
		return GameAction.getViable(this.game_actions, targetPlayer, false, validate);
	}

	// Gets roleplay ACTIONs
	getRoleplays( player, validate = true ){

		const actions = this.getViableActions(player, validate);
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
		
		this.completed = completed;
		if( this.completed === true )
			this.completed = game.time;
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

	}
	static getRandomViable( arr, event ){
		const entries = arr.slice();
		shuffle(entries);
		return this.getFirstViable(entries, event);
	};





}





