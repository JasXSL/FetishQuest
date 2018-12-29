/*

	Conditions rely on events to validate, using data from class GameEvent
	Conditions are ANDed in arrays [cond, AND cond]
	You can use OR by wrapping them in array [cond, AND [cond, OR cond]]
	This is only one level deep

*/
import Generic from './helpers/Generic.js';
import Calculator from './Calculator.js';
import GameEvent from './GameEvent.js';
import stdTag from '../libraries/stdTag.js';
export default class Condition extends Generic{
	
	// Parent varies based on the object that created this
	constructor( data, parent ){
		super(data);
		this.parent = parent;

		// If this.conditions is not empty, it becomes a multi condition and the data below is disregarded
		// It works this way because an array child of a Generic class needs to be only ONE class. Otherwise you'll confuse the netcode.
		this.label = '';
		this.conditions = [];		// Sub 
		this.min = 1;				// min conditions
		this.max = -1;		// max conditions

		this.type = "";				// Type of condition
		this.data = {};				// Condition data, variable type, but must be json encodable
		this.caster = false;		// Validate against caster
		this.targnr = -1;			// -1 gets checked against ALL players, 0 gets checked against the first player and so forth
		this.inverse = false;		// Return true if the condition does NOT validate
		this.anyPlayer = false;		// Check against any player

		this.load(data);
	}

	save( full ){
		let out = {
			type : this.type,
			data : this.data,
			inverse : this.inverse,
			targnr : this.targnr,
			caster : this.caster,
			anyPlayer : this.anyPlayer,
			conditions : this.conditions.map(el => el.save(full)),
			min : this.min,
			max : this.max
		};

		if( full )
			out.label = this.label;

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;

	}

	load(data){
		
		this.g_autoload(data);
		if( data && !this.conditions.length && !Condition.Types[this.type] )
			console.error("Invalid condition type loaded: ", String(this.type), " data received was ", data, "and parent was", this.parent);

	}

	rebase(){
		// Load subs
		this.conditions = Condition.loadThese(this.conditions, this);

		if( this.min === -1 )
			this.min = Infinity;
		if( this.max === -1 )
			this.max = Infinity;

		// This lets you set min to infinity to have an AND
		if( this.min > this.conditions.length )
			this.min = this.conditions.length;
		if( this.max > this.conditions.length )
			this.max = this.conditions.length;
	}

	clone( parent ){

		let out = new this.constructor(this.save(true), parent);
		return out;

	}

	// Runs a standard value comparison
	// This relies on this.data having an amount property, which gets run through the Calculator
	// Allowed operators are = > < >= <=
	compareValue( sender, target, value ){

		let allowed_operators = ["=",">","<",">=","<="];
		let val = Calculator.run(this.data.amount, new GameEvent({
			sender : sender,
			target : target
		}));

		if( val === false ){
			console.error("invalid data in condition", this);
			return false;
		}
		let operator = this.data.operator;
		if( this.data.operator === undefined )
			operator = ">";
		if( allowed_operators.indexOf(operator) === -1 )
			return false;

		return (
			(operator === "=" && value == val) ||
			(operator === ">" && value > val) ||
			(operator === "<" && value < val) ||
			(operator === ">=" && value >= val) ||
			(operator === "<=" && value <= val)	
		);

	}

	// Checks through argsObj and tests if the values are the same as tested's corresponding values
	objIs( tested, argsObj ){
		for( let i in argsObj ){
			if( tested[i] != argsObj[i] )
				return false;
		}
		return true;
	}
	
	// Tests the condition
	test( event, debug ){

		// This is a collection, validate subs instead
		if( this.conditions.length )
			return this.validateSubs(event, debug);

		let targs = event.target,
			success = false,
			T = Condition.Types,
			s = event.sender
		;

		if( !Array.isArray(targs) )
			targs = [targs];
		if( this.caster )
			targs = [event.sender];

		if( ~this.targnr )
			targs = [targs[this.targnr]];
		
		// Trying to target a nonexistend target
		if( targs[0] === undefined )
			return false;

		if( debug )
			console.log("Condition DEBUG :: Testing", this, "against targs", targs, "with event", event);


		// Check against all targeted players
		for( let t of targs ){

			// Check the types
			if( this.type === T.tag ){
				// Only tags applied by sender
				if( this.data.sender ){
					let tagTarg = t;
					if( this.caster )
						tagTarg = s;
					success = tagTarg && tagTarg.hasTagBy(this.data.tags, this.caster ? t : s);
				}
				// Any tag applied by anyone
				else
					success = t && t.hasTag(this.data.tags, this.data.sender);
			}
			else if( this.type === T.wrapperTag ){
				// Searches any attached wrapper for a tag
				return event.wrapper && event.wrapper.hasTag(this.data.tags);
			}
			else if( this.type === T.actionTag ){
				// Searches any attached action for a tag
				return event.action && event.action.hasTag(this.data.tags);
			}
			else if( this.type === T.sameTeam )
				success = s.team === t.team;
			else if( this.type === T.event ){
				let data = this.data.event;
				if( !Array.isArray(data) )
					data = [data];
				success = data.indexOf(event.type) !== -1;
			}
			else if( this.type === T.actionLabel ){
				let data = this.data.label;
				if( !Array.isArray(data) )
					data = [data];
				success = event.action && data.indexOf(event.action.label) !== -1; 
			}
			else if( this.type === T.effectLabel ){
				let data = this.data.label;
				if( !Array.isArray(data) )
					data = [data];
				success = event.effect && data.indexOf(event.effect.label) !== -1; 
			}
			
			
			
			else if( this.type === T.actionResisted )
				success = !!event.custom.resist && (typeof this.data !== "object" || !Object.keys(this.data).length || (event.action && this.data.type === event.action.type)); 
			
			else if( this.type === T.actionDetrimental )
				success = event.action && event.action.detrimental;

			else if( this.type === T.rng ){

				let rng = Math.floor(Math.random()*100),
					val = Calculator.run(this.data.chance, event);
				//console.log("RNG", rng, "val", val);
				success = rng < val;

			}
			else if( this.type === T.actionHidden ){
				success = event.action && event.action.hidden;
			}

			else if( this.type === T.isWrapperParent ){
				success = event.wrapper && event.wrapper.parent === t;
			}

			else if( this.type === T.wrapperStacks ){
				if( event.wrapper && !isNaN(this.data.amount) && (~['>','<','='].indexOf(this.data.operation) || !this.data.operation) ){
					let operation = "=";
					if( this.data.operation )
						operation = this.data.operation;
					success = 
						(operation === "=" && event.wrapper.stacks === this.data.amount ) ||
						(operation === "<" && event.wrapper.stacks < this.data.amount ) ||
						(operation === ">" && event.wrapper.stacks > this.data.amount )
					;
				}
			}

			else if( this.type === T.hasWrapper ){
				if( t && (!this.data.byCaster || event.sender) ){

					let label = this.data.label;
					if( !Array.isArray(label) )
						label = [label];

					let wrappers = t.getWrappers();
					if( this.data.byCaster )
						wrappers = wrappers.filter( el => el.caster === event.sender.id );

					for( let w of wrappers ){
						if(~label.indexOf(w.label)){
							success = true;
							break;
						}
					}

				}
			}

			else if( this.type === T.apValue ){
				success = t && this.compareValue(s, t, t.ap);
			}
			else if( this.type === T.mpValue )
				success = t && this.compareValue(s, t, t.mp);
			else if( this.type === T.hpValue )
				success = t && this.compareValue(s, t, t.hp);
			else if( this.type === T.sizeValue )
				success = t && this.compareValue(s, t, t.size);
			else if( this.type === T.genitalSizeValue ){
				let gen = this.data.genital;
				if( !t || [stdTag.breasts, stdTag.butt, stdTag.penis].indexOf(gen) === -1 )
					success = false;
				else{
					let size = t.getGenitalSizeValue(gen);
					success = this.compareValue(s, t, size);
				}
			}

			// Cycle through effects
			else if( this.type === T.wrapperHasEffect ){
				let filters = this.data.filters;
				if( typeof filters === "object" && event.wrapper ){
					if( !Array.isArray(filters) )
						filters = [filters];
					for( let filter of filters ){
						if( event.wrapper.getEffects(filter) ){
							success = true;
							break;
						}
					}
				}
			}

			else if( this.type === T.team ){
				let teams = this.data.team;
				if( !Array.isArray(teams) )
					teams = [teams];
				success = teams.indexOf(t.team) !== -1; 
			}

			else if( this.type === T.notInCombat )
				success = !game.battle_active;
			
			else if( this.type === T.hasRepairable )
				success = t.getRepairableAssets().length;

			else if( this.type === T.questIs ){
				if( event.quest && typeof this.data === "object" )
					success = this.objIs(event.quest, this.data);
			}

			else if( this.type === T.dungeonIs ){
				if( event.dungeon && typeof this.data === "object" )
					success = this.objIs(event.dungeon, this.data);
			}

			else if( this.type === T.defeated )
				success = t.isDead();
			
			
			else if( this.type === T.punishNotUsed )
				success = !t.used_punish;
			
			else if( this.type === T.dungeonVar ){
				success = event.dungeon && event.dungeon.vars[this.data.id] === this.data.data;
			}

			else{
				game.ui.addError("Unknown condition "+String(this.type));
				return false;
			}
			
			if( this.inverse )
				success = !success;

			if( !success && !this.anyPlayer ){
				if( debug )
					console.log("Condition DEBUG :: FAIL to validate ALL players on type", this.type);
				return false;
			}
			else if( success && this.anyPlayer ){
				if( debug )
					console.log("Condition DEBUG :: SUCCESS to validate ANY player from type", this.type);
				return true;
			}

		}

		if(debug)
			console.log("Condition DEBUG :: loop ended, success:", !this.anyPlayer, "anyPlayer", this.anyPlayer);
		return !this.anyPlayer;

	}

	validateSubs( event, debug ){

		let successes = 0;
		for( let cond of this.conditions ){

			let success = cond.test(event, debug);

			if( success )
				++successes;

			// This package only has a min condition, so we can return here
			if( successes >= this.min && this.max >= this.conditions.length )
				return true;

			// Too many valid conditions
			if( successes > this.max )
				return false;

		}

		return successes >= this.min && successes <= this.max;

	}

}

// Exports conditions, handles arrays and ConditionPackages
Condition.saveThese = function( conditions, full ){
	let out = conditions.map(el => {
		if( Array.isArray(el) )
			el = ConditionPackage.buildOR(...el);
		return el.save(full);
	});
	return out;
};

// Returns whether all conditions and condArrays validated
Condition.all = function( conditions, event, debug ){

	if( !Array.isArray(conditions) )
		conditions = [conditions];

	if( !conditions.length )
		return true;

	// The root condition array is ALWAYS ANDed
	for( let cond of conditions ){
		
		if( !(cond instanceof Condition) ){
			console.error("Condition type is invalid", cond, "expected Condition");
			return false;
		}

		if( !cond.test(event, debug) )
			return false;

		
	}

	return true;

}

// Use this when storing multiple conditions in a class, as it'll handle Packages and arrays for you
Condition.loadThese = function( conditions, parent ){

	let out = [];
	if( !Array.isArray(conditions) ){
		console.error("Trying to load undefined conditions", conditions);
	}
	for( let condition of conditions ){
		
		if( Array.isArray(condition) ){
			let c = ConditionPackage.buildOR(...condition);
			out.push(c);
			c.parent = parent;
			continue;
		}

		let pre = condition;
		// Try to convert it
		if( typeof condition !== 'object')
			condition = glib.get(condition, this.name);
		
		if( typeof condition !== 'object'){
			console.error("Trying to load invalid condition", pre);
			continue;
		}

		out.push(new Condition(condition, parent));

	}
	return out;

}


Condition.Types = {
	tag : "tag",					// 
	wrapperTag : "wrapperTag",		// 
	actionTag : "actionTag",		// 
	sameTeam : "sameTeam",
	event : "event",				// 
	actionLabel : "actionLabel",	// 
	actionDetrimental : "actionDetrimental",	// 
	actionResisted : "actionResisted",			// 
	rng : "rng",								// 
	isWrapperParent : 'isWrapperParent',		// 
	actionHidden : 'actionHidden',				// 
	effectLabel : 'effectLabel',				// 
	wrapperStacks : 'wrapperStacks',			// 
	hasWrapper : 'hasWrapper',		// 
	apValue : 'apValue', 			// 
	mpValue : 'mpValue', 			// 
	hpValue : 'hpValue', 			// 
	sizeValue : 'sizeValue',		// 
	genitalSizeValue : 'genitalSizeValue',		// 
	notInCombat : 'notInCombat',				// 
	hasRepairable : 'hasRepairable',			// 
	questIs : 'questIs',						// 
	dungeonIs : 'dungeonIs',					// 
	team : 'team',								// 
	defeated : 'defeated',						// 
	punishNotUsed : 'punishNotUsed',			//  
	wrapperHasEffect : 'wrapperHasEffect',		// 
	dungeonVar : 'dungeonVar',
};

Condition.descriptions = {
	[Condition.Types.tag] : '{tags:(arr)(str)tag, sender:(bool)limit_by_sender} one or many tags, many tags are ORed. If sender is true, it checks if the tag was a textTag or wrapperTag applied by the sender. If condition caster flag is set, it checks if caster received the tag from sender.',
	[Condition.Types.wrapperTag] : '{tags:(arr)(str)tag} one or more tags searched in any attached wrapper',
	[Condition.Types.actionTag] : '{tags:(arr)(str)tag} one or more tags searched in any attached action',
	[Condition.Types.event] : '{event:(arr)(str)event} one or many event types, many types are ORed',
	[Condition.Types.actionLabel] : '{label:(arr)(str)label} Data is one or many action labels',
	[Condition.Types.actionDetrimental] : 'Data is void',
	[Condition.Types.actionResisted] : 'Data is optional, but can also be {type:(str)/(arr)Action.Type}',
	[Condition.Types.rng] : '{chance:(nr)(str)chance} number/str that outputs an int between 0 and 100%',
	[Condition.Types.isWrapperParent] : 'void - Target was the wrapper\'s parent. Used to check if a wrapper, effect, or action hit a player with an effect',
	[Condition.Types.actionHidden] : 'void - Action exists and is hidden',
	[Condition.Types.effectLabel] : '{label:(arr)(str)label}',
	[Condition.Types.wrapperStacks] : '{amount:(int)stacks, operation:(str)">" "<" "="} - Operation is = by default',
	[Condition.Types.hasWrapper] : '{label:(arr)(str)label, byCaster:(bool)byCaster}',
	[Condition.Types.apValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.mpValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.hpValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.sizeValue] : 'Same as the other nValue conditions',
	[Condition.Types.genitalSizeValue] : '{amount:(int)amount, operation:(str)<>=, genital:stdTag.breasts/stdTag.penis/stdTag.butt} - Default >',
	[Condition.Types.notInCombat] : 'void - Combat isn\'t active',
	[Condition.Types.hasRepairable] : 'void - Has repairable items in their inventory',
	[Condition.Types.questIs] : 'obj - Compares properties of the event quest property to obj properties. Simple check of ===',
	[Condition.Types.dungeonIs] : 'obj - Compares properties of the event dungeon property to obj properties. Simple check of ===',
	[Condition.Types.team] : '{team:(int arr)team(s)}',
	[Condition.Types.defeated] : 'void - Player is defeated',
	[Condition.Types.punishNotUsed] : 'void - Player has not yet used a punishment since the end of the battle',
	[Condition.Types.wrapperHasEffect] : '{filters:(arr/obj)getEffectsSearchFilter} - Searches through filters and returns true if at least one matches',	
	[Condition.Types.dungeonVar] : '{id:(str)var_id, data:(var)data} - Compares a dungeonVar to data',	
};


// helper for building packages
const ConditionPackage = {};
ConditionPackage.buildOR = function(...conditions){
	return new Condition({
		conditions : conditions,
	});
};
ConditionPackage.buildAND = function(...conditions){
	return new Condition({
		conditions : conditions,
		min : Infinity
	});
};


export {ConditionPackage};

