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
import Action from './Action.js';

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
		/*
			Data special cases:
			conditions : If this key is present and is an array, it will be auto loaded into conditions
		*/

		this.caster = false;		// Validate against caster
		this.targnr = -1;			// -1 gets checked against ALL players, 0 gets checked against the first player and so forth
		this.inverse = false;		// Return true if the condition does NOT validate
		this.anyPlayer = false;		// Check against any player
		this.debug = false;

		this.load(data);
	}

	save( full ){
		let out = {
			id : this.id,
			type : this.type,
			data : Generic.flattenObject(this.data),
			inverse : this.inverse,
			targnr : this.targnr,
			caster : this.caster,
			anyPlayer : this.anyPlayer,
			conditions : this.conditions.map(el => el.save(full)),
			min : this.min,
			max : this.max,
		};

		if( full ){
			out.label = this.label;
			out.debug = this.debug;
		}
		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;

	}

	load(data){
		
		this.g_autoload(data);
		if( data && !this.conditions.length && !Condition.Types[this.type] )
			console.error("Invalid condition type loaded: ", String(this.type), " data received was ", data, "and parent was", this.parent);

		if( Array.isArray(this.data.conditions) ){
			this.data.conditions = Condition.loadThese(this.data.conditions);
		}

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
	compareValue( sender, target, value, debug = false ){

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

		if( debug )
			console.debug("Comparing ", value, "against", val, "using operator", operator);

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

		if( !debug )
			debug = this.debug;

		if( debug )
			console.trace("Condition DEBUG :: Testing", this, "with event", event);

		// This is a collection, validate subs instead
		if( this.conditions.length ){
			const out = this.validateSubs(event, debug);
			if( this.inverse )
				return !out;
			return out;
		}
		let targs = event.target,
			success = false,
			T = Condition.Types,
			s = event.sender
		;

		let eventWrapper = event.wrapper;
		if( this.data.originalWrapper && event.originalWrapper )
			eventWrapper = event.originalWrapper;

		if( !Array.isArray(targs) )
			targs = [targs];
		if( this.caster )
			targs = [event.sender];

		if( ~this.targnr )
			targs = [targs[this.targnr]];
		
		// Trying to target a nonexistend target
		if( targs[0] === undefined ){
			if( debug )
				console.debug("Condition DEBUG :: Targs is undefined");
			return false;
		}

		if( debug )
			console.debug("Condition DEBUG :: Targs", targs);
		


		// Check against all targeted players
		for( let t of targs ){

			// Check the types
			if( this.type === T.tag ){

				const tags = toArray(this.data.tags);
				const all = this.data.all;
				success = Boolean(all);

				for( let tag of tags ){

					let found = false;
					// Only tags applied by sender
					if( this.data.caster ){

						let tagTarg = t;
						if( this.caster )
							tagTarg = s;
						found = tagTarg && tagTarg.hasTagBy([tag], this.caster ? t : s);

					}
					// Any tag applied by anyone
					else
						found = t && t.hasTag([tag], event.wrapperReturn);
					
					// only need one successful tag
					if( found && !all ){
						success = true;
						break;
					}
					// Need all tags present
					else if( !found && all ){
						success = false;
						break;
					}

				}

			}
			else if( this.type === T.targetIsSender ){
				if(t && s && t.id === s.id)
					success = true;
			}
			// s might not always be the original sender of a wrapper (procs/AoE effects etc)
			// Use this to make it clear that you want the included wrapper's sender
			else if( this.type === T.targetIsWrapperSender ){

				const oCaster = eventWrapper && eventWrapper.getCaster();
				if( t && oCaster && t.id === oCaster.id )
					success = true;

			}
			else if( this.type === T.targetIsChatPlayer ){
				success = ( event.text && event.text._chatPlayer && event.text._chatPlayer.id === t.id );
			}
			else if( this.type === T.wrapperTag ){

				// Searches any attached wrapper for a tag
				return eventWrapper && eventWrapper.hasTag(this.data.tags);

			}
			else if( this.type === T.actionTag ){
				// Searches any attached action for a tag
				return event.action && event.action.hasTag(this.data.tags);
			}
			else if( this.type === T.sameTeam )
				success = s.team === t.team;

			else if( this.type === T.event ){

				const data = toArray(this.data.event);
				success = data.indexOf(event.type) !== -1 || (event.custom && event.custom.original && data.indexOf(event.custom.original.type) !== -1);

			}

			else if( this.type === T.charging ){
				
				const conds = this.data.conditions || [],
					charged = t.isCasting();
				if( charged ){
					for( let action of charged ){
						if( Condition.all(conds, new GameEvent({sender:s, target:t, action:action})) ){
							success = true;
							break;
						}
					}
				}

			}

			else if( this.type === T.actionLabel ){

				let data = this.data.label;

				if( !Array.isArray(data) )
					data = [data];

				if( event.action ){
					let labels = {[event.action.label] : true};
					if( !this.data.ignore_alias && Array.isArray(event.action.alias) ){
						for( let a of event.action.alias )
							labels[a] = true;
					}
					for( let l of data ){
						if( labels[l] ){
							success = true;
							break;
						}
					}
				}

			}
			else if( this.type === T.actionType ){
				const data = toArray(this.data.type);
				success = event.action && data.indexOf(event.action.type) !== -1; 
			}
			else if( this.type === T.effectLabel ){
				let data = this.data.label;
				if( !Array.isArray(data) )
					data = [data];
				success = event.effect && data.indexOf(event.effect.label) !== -1; 
			}
			else if( this.type === T.wrapperLabel ){

				let data = this.data.label;
				if( !Array.isArray(data) )
					data = [data];
				success = eventWrapper && data.indexOf(eventWrapper.label) !== -1; 

			}
			else if( this.type === T.playerLabel ){
				let data = toArr(this.data.label);
				success = t && data.indexOf(t.label) !== -1;
			}
			
			else if( this.type === T.species ){

				if( t ){
					let species = toArr(this.data.species);
					species = species.map(el => el.toLowerCase() );
					success = species.indexOf(t.species.toLowerCase()) > -1;
					if( debug )
						console.debug("TESTING SPECIES:: ", "data:", species, "target", t.species.toLowerCase());
				}
			}
			else if( this.type === T.playerClass ){

				let c = this.data.label;
				if( !Array.isArray(c) )
					c = [c];
				c = c.map(el => el.toLowerCase() );
				success = c.indexOf(t.class.label.toLowerCase()) > -1;

			}
			
			else if( this.type === T.actionResisted )
				success = !!event.custom.resist && (typeof this.data !== "object" || !Object.keys(this.data).length || (event.action && this.data.type === event.action.type)); 
			
			else if( this.type === T.actionDetrimental )
				success = event.action && event.action.detrimental;

			else if( this.type === T.rng ){

				let rng = Math.floor(Math.random()*100),
					val = Calculator.run(this.data.chance, event);
				success = rng < val;

			}
			else if( this.type === T.actionHidden ){
				success = event.action && event.action.hidden;
			}

			else if( this.type === T.isWrapperParent ){
				
				success = eventWrapper && t && eventWrapper.victim === t.id;

			}

			else if( this.type === T.isActionParent ){

				success = event.action && event.wrapper && event.wrapper.action && event.wrapper.action === event.action.id;

			}

			else if( this.type === T.wrapperStacks ){

				if( eventWrapper && (~['>','<','='].indexOf(this.data.operation) || !this.data.operation) ){

					let operation = "=";
					if( this.data.operation )
						operation = this.data.operation;
					let amount = Calculator.run(this.data.amount, new GameEvent({
						wrapper : eventWrapper,
					}));
					success = 
						(operation === "=" && eventWrapper.stacks === amount ) ||
						(operation === "<" && eventWrapper.stacks < amount ) ||
						(operation === ">" && eventWrapper.stacks > amount )
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
					if( debug )
						console.debug("Checking ", this.data, " against ", t, success, "sender id", event.sender.id);

				}
			}
			else if( this.type === T.hasEffect ){

				// Make sure sender exists if byCaster is set
				if( t && (!this.data.byCaster || event.sender) ){

					let label = this.data.label;
					if( !Array.isArray(label) )
						label = [label];

					let effects = t.getEffects();
					if( this.data.byCaster )
						effects = effects.filter( el => el.parent.caster === event.sender.id );

					for( let w of effects ){
						if(~label.indexOf(w.label)){
							success = true;
							break;
						}
					}
					if( debug )
						console.debug("Checking ", this.data, " against ", t, success, "sender id", event.sender.id);

				}
			}
			else if( this.type === T.hasEffectType ){

				// Make sure sender exists if byCaster is set
				if( t && (!this.data.byCaster || event.sender) ){

					const type = toArray(this.data.type);

					let effects = t.getEffects();
					if( this.data.byCaster )
						effects = effects.filter( el => el.parent.caster === event.sender.id );

					for( let w of effects ){
						if(~type.indexOf(w.type)){
							success = true;
							break;
						}
					}
					if( debug )
						console.debug("Checking ", this.data, " against ", t, success, "sender id", event.sender.id);

				}
			}

			else if( this.type === T.apValue ){
				success = t && this.compareValue(s, t, t.ap);
			}
			else if( this.type === T.mpValue )
				success = t && this.compareValue(s, t, t.mp);
			else if( this.type === T.hpValue )
				success = t && this.compareValue(s, t, t.hp);
			else if( this.type === T.sadism ){
				success = t && this.compareValue(s, t, t.sadistic);
			}
			else if( this.type === T.sizeValue )
				success = t && this.compareValue(s, t, t.size);
			else if( this.type === T.targetLevel )
				success = t && this.compareValue(s, t, t.level);
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
				if( typeof filters === "object" && eventWrapper ){
					if( !Array.isArray(filters) )
						filters = [filters];
					for( let filter of filters ){
						if( eventWrapper.getEffects(filter) ){
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

			else if( this.type === T.hasInventory )
				success = t && t.numAssets(this.data.label) >= this.data.amount;

			else if( this.type === T.questIs ){
				if( event.quest && typeof this.data === "object" )
					success = this.objIs(event.quest, this.data);
			}

			else if( this.type === T.actionOnCooldown ){
				const action = t.getActionByLabel(this.data.label);
				success = action && action._cooldown;
			}

			else if( this.type === T.slotDamaged ){
				if(
					t && 
					event.wrapperReturn &&
					event.wrapperReturn.armor_slots[t.id] &&
					Object.keys(event.wrapperReturn.armor_slots[t.id]).length
				){
					const s = event.wrapperReturn.armor_slots[t.id],
						slot = this.data.slot
					;
					success = !slot || s[slot];
				}
			}
			else if( this.type === T.slotStripped ){
				
				if(
					t && 
					event.wrapperReturn &&
					event.wrapperReturn.armor_strips[t.id] &&
					Object.keys(event.wrapperReturn.armor_strips[t.id]).length
				){
					const s = event.wrapperReturn.armor_strips[t.id],
						slot = this.data.slot
					;
					success = Boolean(!slot || s[slot]);
				}
			}
			else if( this.type === T.itemStolen ){
				
				if(
					t && 
					event.wrapperReturn &&
					event.wrapperReturn.steals[t.id]
				){
					success = true;
				}
			}

			else if( this.type === T.hasAsset ){
				
				const conds = toArray(this.data.conditions), 
					min = this.data.min || 1,
					assets = t.getAssets(),
					evt = new GameEvent({sender:s, target:t})
				;
				let n = 0;

				for( let asset of assets ){

					evt.asset = asset;
					if( Condition.all(conds, evt) ){
						n += evt._stacks || 1;
					}
					if( n >= min ){

						success = true;
						break;

					}

				}

			}

			else if( this.type === T.assetStealable ){

				success = event.asset && !event.asset.soulbound;

			}

			else if( this.type === T.dungeonIs ){
				if( event.dungeon && typeof this.data === "object" )
					success = this.objIs(event.dungeon, this.data);
			}

			else if( this.type === T.textMeta || this.type === T.textTurnTag ){

				if( event.text ){
					let tagsToScan = event.text.metaTags;
					if( this.type === T.textTurnTag )
						tagsToScan = event.text.turnTags;
					let find = this.data.tags;
					if( !Array.isArray(find) )
						find = [find];

					if( !tagsToScan )
						console.error("TagsToScan missing from", event, "in", this);
					
					const all = Boolean(this.data.all);
					find = find.map(tag => {
						if( typeof tag !== "string" )
							console.error("Non-string tag in", this);
						return tag.toLowerCase();
					});
					tagsToScan = tagsToScan.map(tag => {
						if( typeof tag !== "string" )
							console.error("Non-string tag in", event.text, "this was", this);
						return tag.toLowerCase()
					});
					success = all;
					for( let tag of find ){
						if( ~tagsToScan.indexOf(tag) ){
							if( !all ){
								success = true;
								break;
							}
						}else if( all ){
							success = false;
							break;
						}
					}
				}

			}

			else if( this.type === T.defeated ){
				if( !t || !t.isDead )
					console.error(t, "doesn't have an isDead function in event", event);
				success = t.isDead();
			}

			else if( this.type === T.encounterLabel ){
				const d = toArr(this.data.label);
				success = event.encounter && d.indexOf(event.encounter.label) > -1;
			}

			else if( this.type === T.questAccepted ){
				const d = toArray(this.data.quest);
				for( let quest of game.quests ){
					if( ~d.indexOf(quest.label) ){
						success = true;
						break;
					}
				}
			}
			else if( this.type === T.questCompleted ){
				const d = toArray(this.data.quest);
				for( let quest of d ){
					if( game.completed_quests[quest] ){
						success = true;
						break;
					}
				}
			}

			else if( this.type === T.questObjectiveCompleted ){

				// data is {quest:(str)quest_label, objective:(str)objective_label}
				const quest = this.data.quest,
					objective = this.data.objective
				;
				// Start by scanning picked up quests
				for( let q of game.quests ){
					if( q.label === quest && q.isObjectiveCompleted(objective) ){
						success = true;
						break;
					}
				}
				// Check completed cache
				if( !success )
					success = game.completed_quests[quest] && game.completed_quests[quest][objective];

			}

			else if( this.type === T.punishNotUsed )
				success = !t.used_punish;
			
			else if( this.type === T.dungeonVar ){

				let dungeon = event.dungeon.label;
				if( this.data.dungeon )
					dungeon = this.data.dungeon;
				success = window.game && game.state_dungeons[dungeon] && game.state_dungeons[dungeon].vars[this.data.id] === this.data.data;
				
			}
			else if( this.type === T.dungeonVarMath ){

				let dungeon = event.dungeon && event.dungeon.label;
				if( this.data.dungeon )
					dungeon = this.data.dungeon;

				let vars = this.data.vars,
					formula = this.data.formula
				;
				if( typeof vars === "string" )
					vars = [vars];

				if( Array.isArray(vars) && window.game ){
					const t = {};
					for( let v of vars ){
						t[v] = 0;
						if( game.state_dungeons[dungeon] && game.state_dungeons[dungeon].vars.hasOwnProperty(v) )
							t[v] = game.state_dungeons[dungeon].vars[v];
					}
					success = Calculator.run(formula, event, t);
				}

			}

			else if( this.type === T.formula ){
				success = Calculator.run(this.data.formula, event);
			}

			else if( this.type === T.numGamePlayersGreaterThan ){
				const team = parseInt(this.data.team),
					amount = this.data.amount
				;
				const players = game.getEnabledPlayers();
				let np = players.length;
				if( !isNaN(team) ){
					np = 0;
					for( let player of players ){
						if(
							(team === -1 && t.team === player.team) ||
							(team === -2 && t.team !== player.team) ||
							(player.team === team)
						)++np;
					}
				}
				success = np > amount;
			}

			else if( this.type === T.actionRanged ){
				success = event.action && event.action.ranged === Action.Range.Ranged;
			}
			else if( this.type === T.rainGreaterThan ){
				const rain = game.getRain(this.data.allowIndoor);
				let amt = +this.data.amount || 0;
				success = rain > amt;
			}

			else if( this.type === T.targetedSenderLastRound )
				success = Boolean(s._targeted_by_since_last[t.id]);

			

			else{
				game.ui.modal.addError("Unknown condition "+String(this.type));
				return false;
			}
			
			if( this.inverse )
				success = !success;

			if( !success && !this.anyPlayer ){
				if( debug )
					console.debug("Condition DEBUG :: FAIL to validate ALL players on type", this.type);
				return false;
			}
			else if( success && this.anyPlayer ){
				if( debug )
					console.debug("Condition DEBUG :: SUCCESS to validate ANY player from type", this.type);
				return true;
			}

		}

		if(debug)
			console.debug("Condition DEBUG :: loop ended, success:", !this.anyPlayer, "anyPlayer", this.anyPlayer);
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

		if( typeof el.save === "function" )
			return el.save(full);
		if( full === "mod" )
			return el;
		console.error(el);
		throw "Error, condition has no save method ^";
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
		
		if( typeof condition !== 'object' ){

			// Editor shouldn't convert into objects
			if( !window.game ){
				out.push(condition);
				continue;
			}
			// live game needs to convert into objects
			condition = glib.get(condition, this.name);

		}
		
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
	actionType : "actionType",	// 
	actionDetrimental : "actionDetrimental",	// 
	actionResisted : "actionResisted",			// 
	rng : "rng",								// 
	isWrapperParent : 'isWrapperParent',		// 
	isActionParent : 'isActionParent',
	actionHidden : 'actionHidden',				// 
	effectLabel : 'effectLabel',				// 
	wrapperLabel : 'wrapperLabel',
	wrapperStacks : 'wrapperStacks',			// 
	hasWrapper : 'hasWrapper',		// 
	hasEffect : 'hasEffect',		// 
	hasEffectType : 'hasEffectType',

	hasAsset : 'hasAsset',
	assetStealable : 'assetStealable',

	apValue : 'apValue', 			// 
	mpValue : 'mpValue', 			// 
	hpValue : 'hpValue', 			// 
	sizeValue : 'sizeValue',		// 
	genitalSizeValue : 'genitalSizeValue',		// 
	notInCombat : 'notInCombat',				// 
	hasRepairable : 'hasRepairable',			// 
	hasInventory : 'hasInventory',			// 
	questIs : 'questIs',						// 
	dungeonIs : 'dungeonIs',					// 
	team : 'team',								// 
	defeated : 'defeated',						// 
	punishNotUsed : 'punishNotUsed',			//  
	wrapperHasEffect : 'wrapperHasEffect',		// 
	dungeonVar : 'dungeonVar',
	dungeonVarMath : 'dungeonVarMath',
	targetIsSender : 'targetIsSender',
	targetIsChatPlayer : 'targetIsChatPlayer',
	targetIsWrapperSender : 'targetIsWrapperSender',
	hasFxTagBySender : 'hasFxTagBySender',		//
	species : 'species',
	encounterLabel : 'encounterLabel',			// label of event encounter
	questAccepted : 'questAccepted',			
	questCompleted : 'questCompleted',
	questObjectiveCompleted : 'questObjectiveCompleted',
	actionRanged : 'actionRanged',
	playerLabel : 'playerLabel',
	numGamePlayersGreaterThan : 'numGamePlayersGreaterThan',
	actionOnCooldown : 'actionOnCooldown',
	playerClass : 'playerClass',
	formula : 'formula',
	slotDamaged : 'slotDamaged',
	slotStripped : 'slotStripped',		
	itemStolen : 'itemStolen',
	textMeta : 'textMeta',
	textTurnTag : 'textTurnTag',		
	rain : 'rainGreaterThan',
	targetLevel : 'targetLevel',
	charging : 'charging',
	targetedSenderLastRound : 'targetedSenderLastRound',
	sadism : 'sadism',
};


// A note about wrappers:
/*
	Because you should be able to validate an active wrapper on a player, and also an attached wrapper such as in the WrapperAdded event.
	The event wrapper becomes the effect already applied that's checking for the event. And event.originalWrapper becomes the one already attached.
	The wrapper conditions let you set originalWrapper:true to target the original wrapper. This is the one that was added in WrapperAdded for an instance.
	If originalWrapper is not present. It uses event.wrapper instead, as that's the original and has not been overwritten.
*/
Condition.descriptions = {
	[Condition.Types.tag] : '{tags:(arr)(str)tag, caster:(bool)limit_by_sender, all=false} one or many tags, many tags are ORed unless all is true. If sender is true, it checks if the tag was a textTag or wrapperTag applied by the sender. If condition caster flag is set, it checks if caster received the tag from sender.',
	[Condition.Types.playerClass] : '{label:(arr)(str)label} Searches for label in target playerclass.',
	[Condition.Types.charging] : '{(arr)conditions:[]} Checks if the target is charging an action. You can limit the actions to check for by conditions. Empty array checks if ANY action is charged.',
	[Condition.Types.wrapperTag] : '{tags:(arr)(str)tag, originalWrapper:(bool)=false} one or more tags searched in any attached wrapper.',
	[Condition.Types.actionTag] : '{tags:(arr)(str)tag} one or more tags searched in any attached action',
	[Condition.Types.event] : '{event:(arr)(str)event} one or many event types, many types are ORed',
	[Condition.Types.actionLabel] : '{label:(arr)(str)label, ignore_alias:(bool)=false} Attached action label is in this array. If ignore_alias is true, it ignores alias checking',
	[Condition.Types.actionType] : '{type:(arr)(str)Action.Types.type} - Checks the type of an action tied to the event',
	[Condition.Types.actionDetrimental] : 'Data is void',
	[Condition.Types.actionResisted] : 'Data is optional, but can also be {type:(str)/(arr)Action.Type}',
	[Condition.Types.rng] : '{chance:(nr)(str)chance} number/str that outputs an int between 0 and 100%',
	[Condition.Types.isWrapperParent] : '{originalWrapper:(bool)false} - Target was the wrapper\'s parent. Used to check if a wrapper, effect, or action hit a player with an effect',
	[Condition.Types.isActionParent] : 'void - If event event.wrapper.action is the same as event.action.id',
	[Condition.Types.actionHidden] : 'void - Action exists and is hidden',
	[Condition.Types.effectLabel] : '{label:(arr)(str)label}',
	[Condition.Types.wrapperLabel] : '{label:(arr)(str)label, originalWrapper:(bool)=false}',
	[Condition.Types.wrapperStacks] : '{amount:(int)stacks, operation:(str)">" "<" "=", originalWrapper:(bool)=false} - Operation is = by default',
	[Condition.Types.hasWrapper] : '{label:(arr)(str)label, byCaster:(bool)byCaster=false}',
	[Condition.Types.hasEffect] : '{label:(arr)(str)label, byCaster:(bool)byCaster=false}',
	[Condition.Types.hasEffectType] : '{type:(arr)(str)type, byCaster:(bool)byCaster=false}',
	[Condition.Types.apValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.mpValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.hpValue] : '{amount:(int)amount, operation:(str)<>=} - Default >',
	[Condition.Types.sadism] : '{amount:(int)amount, operation:(str)<>=} - Default >. Checks target sadism value.',
	[Condition.Types.sizeValue] : 'Same as the other nValue conditions',
	[Condition.Types.genitalSizeValue] : '{amount:(int)amount, operation:(str)<>=, genital:stdTag.breasts/stdTag.penis/stdTag.butt} - Default >',
	[Condition.Types.notInCombat] : 'void - Combat isn\'t active',
	[Condition.Types.hasRepairable] : 'void - Has repairable items in their inventory',
	[Condition.Types.hasInventory] : '{label:(str)label, amount:(int)amount=1} - Has at least n amount of label in inventory',
	[Condition.Types.questIs] : 'obj - Compares properties of the event quest property to obj properties. Simple check of ===',
	[Condition.Types.dungeonIs] : 'obj - Compares properties of the event dungeon property to obj properties. Simple check of ===',
	[Condition.Types.team] : '{team:(int arr)team(s)}',
	[Condition.Types.defeated] : 'void - Player is defeated',
	[Condition.Types.punishNotUsed] : 'void - Player has not yet used a punishment since the end of the battle',
	[Condition.Types.wrapperHasEffect] : '{filters:(arr/obj)getEffectsSearchFilter, originalWrapper:(bool)=false} - Searches through filters and returns true if at least one matches',	
	[Condition.Types.dungeonVar] : '{id:(str)var_id, data:(var)data, dungeon:(str)label=_CURRENT_DUNGEON_} - Compares a dungeonVar to data with EXACT',	
	[Condition.Types.dungeonVarMath] : '{vars:(str/arr)var_ids, formula:(str)formula, dungeon:(str)label=_CURRENT_DUNGEON_} - Compares a dungeonVar to data via a math formula. vars have to contain all dVars included in the formula. If one is not set, it becomes 0.',	
	[Condition.Types.targetIsSender] : 'void - Checks if target and sender have the same id',	
	[Condition.Types.targetIsWrapperSender] : '{ originalWrapper:(bool)=false} - Sender might not always be the caster of a wrapper (ex checking effect targets). This specifies that you want the sender of the included wrapper in specific.',	
	[Condition.Types.species] : '{species:(str/arr)species} - Checks if target is one of the selected species. Case insensitive',	
	[Condition.Types.encounterLabel] : '{label:(str/arr)encounter_label} - Checks if the encounter label exists in data label array',	
	[Condition.Types.questAccepted] : '{quest:(str/arr)quest} - Checks if a quest has been started, regardless of completion status',	
	[Condition.Types.questCompleted] : '{quest:(str/arr)quest} - Checks if any of these quests are completed',	
	[Condition.Types.questObjectiveCompleted] : '{quest:(str)quest_label, objective:(str)objective_label} - Checks if a quest objective is done',
	[Condition.Types.actionRanged] : 'void : Checks if the action used was melee',
	[Condition.Types.playerLabel] : '{label:(str/arr)label} : Checks if the player label is this',
	[Condition.Types.numGamePlayersGreaterThan] : '{amount:(int)amount, team:(int)team=any} - Nr game players are greater than amount. If team is undefined, it checks all players. Use -1 for enemies and -2 for friendlies',
	[Condition.Types.actionOnCooldown] : '{label:(str)label} - Checks if an action is on cooldown for the target.',
	[Condition.Types.formula] : '{formula:(str)formula} - Runs a math formula with event being the event attached to the condition and returns the result',
	[Condition.Types.slotDamaged] : '{slot:(str)Asset.Slots.*=any} - Requires wrapperReturn in event. Indicates an armor piece was damaged by slot. ANY can be used on things like stdattack',
	[Condition.Types.slotStripped] : '{slot:(str)Asset.Slots.*=any} - Requires wrapperReturn in event. Indicates an armor piece was removed by slot. ANY can be used on things like stdattack',
	[Condition.Types.itemStolen] : '{} - Requires wrapperReturn in event. Checks if at least one item steal is present',
	
	[Condition.Types.hasAsset] : '{conditions:[], min:int=1} - Checks if the target has an asset filtered by conditions',
	[Condition.Types.assetStealable] : '{} - Requires asset in event. Checks whether asset can be stolen or not.',


	[Condition.Types.textMeta] : '{tags:(str/arr)tags, all:(bool)=false} - Requires Text in event. Checks if the text object has one or more meta tags. ORed unless ALL is set.',
	[Condition.Types.textTurnTag] : '{tags:(str/arr)tags, all:(bool)=false} - Requires Text in event. Checks if the text object has one or more turn tags. ORed unless ALL is set.',
	[Condition.Types.targetIsChatPlayer] : 'void - Requires Text in event. Checks if text._chatPlayer id is the same as target',
	[Condition.Types.rainGreaterThan] : '{val:(float)=0, allowIndoor:(bool)=false} - Checks if game.rain > val. If allowIndoor is set, it checks if it\'s raining outside as well',
	[Condition.Types.targetLevel] : '{amount:(int)=0, operation:(str = > <)="="} - Checks target player level',
	[Condition.Types.targetedSenderLastRound] : 'void - Target has successfully used a non-aoe action against sender since their last turn',
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

