import Generic from './helpers/Generic.js';
import {Wrapper, Effect, WrapperReturn} from './EffectSys.js';
import GameEvent from './GameEvent.js';
import Player from './Player.js';
import stdTag from '../libraries/stdTag.js';
import Condition from './Condition.js';
import Asset from './Asset.js';
import Calculator from './Calculator.js';

class Action extends Generic{

	// Map the relational asset types
	static getRelations(){ 
		return {
			wrappers : Wrapper,
			riposte : Wrapper,
			passives : Wrapper,
			conditions : Condition,
			show_conditions : Condition,
			cpassives : Wrapper,
			interrupt_wrappers : Wrapper,
			std_conds : Condition
		};
	}
	
	/* Loading & Saving */
	constructor(data, parent){
		super(data);

		// Parent is a Player OR Asset
		this.parent = parent;
		this.label = "";			// Same as name but not changing
		this.std = false;			// Standard action that all players should know
		this.name = "";				// can be %P% to use parent name
		this.description = "";		// Can be %P% to use parent description
		this.icon = '';				// Can be %P% to use parent icon
		this.ranged = Action.Range.Melee;			// This is a ranged attack
		this.wrappers = [];				// Effect wrappers needed to cast the spell
		this.passives = [];				// Wrappers that are added passively to any player that has this action equipped
		this.cpassives = [];			// Wrappers that are added passively while casting this action
		this.interrupt_wrappers = [];	// Wrappers that are added when this is interrupted
		this.max_wrappers = 0;		// Max nr of wrappers to apply, 0 = undefined
		this.ripostable = false;	// Use isRipostable. This action can be riposted.
		this.riposte = [];			// Replaces wrappers to be run on riposte with these. Otherwise uses same as wrappers. Requires ripostable. Riposte is sent from the target to attacker
		
		// The 0,1,2 maps to Player.MOMENTUM.* values
		this.mom0 = 0;	// Offensive momentum
		this.mom1 = 0;	// Defensive momentum
		this.mom2 = 0;	// Utility momentum



		this.cooldown = null;					// Turns needed to add a charge. Setting this to 0 will make charges infinite. Can be a math formula. Use getCooldown()
		this.init_cooldown = 0;					// Cooldown to be set when a battle starts.
		this.min_targets = 1;
		this.max_targets = 1;
		this.target_type = Action.TargetTypes.target;
		this.hit_chance = 90;		// 90% hit chance before SV/BON
		this.detrimental = 1;					
		this.type = Action.Types.physical;			// Custom damage type
		this.hidden = false;					// Hidden action
		this.semi_hidden = false;				// Only show in the action selector
		this.tags = [];
		this.conditions = [];					// Conditions run against all targets regardless of wrapper
		this.show_conditions = [];				// Same as above, but if these aren't met, the spell will not be visible in the spell selector
												// This is checked against all enabled players, and at least one check has to be viable
												// You generally want this to be "inCombat"
		this.std_conds = [];					// Only checked if standard, conditions to be checked before adding a standard action to a player. Saves on data.
		this.allow_self = false;				// If detrimental and "target" cast, this has to be set to allow self cast
		this.no_use_text = false;				// Disable use texts.
		this.no_action_selector = false;		// Hide from combat action selector
		this.cast_time = 0;						// Set to > 0 to make this a charged spell needing this many turns to complete
		this.ct_taunt = false;					// Taunt can override the charge target
		this.charges = 1;						// Max charges for the action. Ignored if cooldown is 0
		this.charges_start = -1;				// Start charges. -1 = this.charges
		this.charges_perm = false;				// Charges do not re-add after cooldown.
		this.allow_when_charging = false;		// Allow this to be cast while using a charged action
		this.no_interrupt = false;				// Charged action is not interruptable unless override is set
		this.reset_interrupt = false;			// Reset cooldown when interrupted
		this.hide_if_no_targets = false;		// hide this from the action picker if there's no viable targets
		this.disable_override = 0;				// Level of disable override.
		this.alias = [];						// Aliases to use for texts. Useful when you want multiple actions with the same texts
		this.ignore_wrapper_conds = false;		// Ignores wrapper conditions and allows it to cast without any valid wrapper conditions

		this.can_crit = false;					// This ability can critically hit
		this.crit_formula = '';					// Custom crit chance. Requires can_crit to be set
		this.no_clairvoyance = false;			// This shouldn't be inspectable with clarivoyance
		this.group = '';						// Group this action on the action bar with others

		// User stuff
		this._cooldown = 0;			// Turns remaining to add a charge.
		this._cast_time = 0;		// Turns remaining to cast this if cast_time > 0
		this._charges = 1;			// Charges remaining for this action. A charge is added each time the cooldown triggers
		this._cast_targets = [];		// UUIDs of players a charge spell is aimed at
		this._cache_cooldown = false;		// Since this.cooldown can be a math formula, this lets you cache the cooldown to prevent lag. Wiped on turn start.
		this._crit = false;
		this._slot = -1;						// Action slot. -1 if deactivated. If autolearn is enabled on the player, this is ignored.
		
		// Auto generated if loaded from a player library
		this._custom = false;
		
		
		this.load(data);
	}
	
	save( full ){
		
		let out = {
			label : this.label,
			std : this.std,
			name : this.name,
			description : this.description,
			wrappers : Wrapper.saveThese(this.wrappers, full),
			cpassives : Wrapper.saveThese(this.cpassives, full),
			passives : Wrapper.saveThese(this.passives, full),
			cooldown : this.cooldown,
			mom0 : this.mom0,
			mom1 : this.mom1,
			mom2 : this.mom2,
			min_targets : this.min_targets,
			max_targets : this.max_targets,
			hit_chance : this.hit_chance,
			detrimental : this.detrimental,
			type : this.type,
			hidden : this.hidden,
			target_type : this.target_type,
			tags : this.tags,
			ranged : this.ranged,
			ripostable : this.ripostable,
			conditions : Condition.saveThese(this.conditions, full),
			no_action_selector : this.no_action_selector,
			cast_time : this.cast_time,
			ct_taunt : this.ct_taunt,
			charges : this.charges,
			charges_perm : this.charges_perm,
			allow_when_charging : this.allow_when_charging,
			no_interrupt : this.no_interrupt,
			show_conditions : Condition.saveThese(this.show_conditions, full),
			hide_if_no_targets : this.hide_if_no_targets,
			semi_hidden : this.semi_hidden,
			icon : this.icon,
			disable_override : this.disable_override,
			reset_interrupt : this.reset_interrupt,
			allow_self : this.allow_self,
			_slot : this._slot,
			ignore_wrapper_conds : this.ignore_wrapper_conds,
			can_crit : this.can_crit,
			no_clairvoyance : this.no_clairvoyance,
			group : this.group
		};

		// Everything but mod
		if( full !== "mod" ){

			out.id = this.id;
			out._cooldown = this._cooldown;
			out._cast_time = this._cast_time;
			out._charges = this._charges;
			out._cast_targets = this._cast_targets;

		}

		if( full ){

			out.alias = this.alias;
			out.riposte = Wrapper.saveThese(this.riposte, full);
			out.interrupt_wrappers = Wrapper.saveThese(this.interrupt_wrappers, full);
			out.no_use_text = this.no_use_text;	
			out.init_cooldown = this.init_cooldown;
			out.max_wrappers = this.max_wrappers;
			out.crit_formula = this.crit_formula;
			out.std_conds = Condition.saveThese(this.std_conds, full);
			out.charges_start = this.charges_start;

		}
		if( full === "mod" )
			this.g_sanitizeDefaults(out);
		return out;
	}

	load(data){

		this.g_autoload(data);
		if( !Action.typeExists(this.type) )
			this.type = Action.Types.physical;

		if( this.max_charges === -1 )
			this.charges = -1;

	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super

		if( typeof this.cooldown !== "string" && isNaN(parseInt(this.cooldown)) )
			this.cooldown = 0;
		if( typeof this.cooldown !== "string" )
			this.cooldown = parseInt(this.cooldown);

	}

	getPlayerParent(){

		let pa = this.parent;
		while( pa && !(pa instanceof Player) ){
			pa = pa.parent;
		}
		return pa;
		
	}

	clone(parent){

		// This rebases by cloning the wrappers as well
		let out = new this.constructor(Action.saveThis(this, true), parent);
		return out;

	}



	appendMathVars( prefix, vars, event ){

		vars[prefix+'Off'] = this.getMomentumCost(Player.MOMENTUM.Off);
		vars[prefix+'Def'] = this.getMomentumCost(Player.MOMENTUM.Def);
		vars[prefix+'Uti'] = this.getMomentumCost(Player.MOMENTUM.Uti);
		vars[prefix+'CT'] = this.getCastTime();
		vars[prefix+'CD'] = this.getCooldown();

	}

	/* Conditions */
	getConditions(){
		return [...this.conditions,...this.show_conditions];
	}

	isVisible(){

		if( this.hidden )
			return false;

		if( this.hide_if_no_targets && !this.getViableTargets().length )
			return false;

		const pp = this.getPlayerParent();
		if( pp && pp.getDisabledLevel() > this.disable_override && pp.getDisabledHidden() )
			return false;


		// Validate visibility conditions against all players
		const en = game.getEnabledPlayers(),
			evt = new GameEvent({
				sender : pp,
				action : this,
				dungeon : game.dungeon,
				room : game.dungeon.getActiveRoom(),
			});
		for( let player of en ){
			
			evt.target = player;
			if( 
				Condition.all(this.show_conditions, evt) &&
				!this.getDisabledEffectsAgainst(player, true).length
			)return true;

		}

	}

	// Returns effects that disable this against a player
	getDisabledEffectsAgainst( player, hide_only = false, debug = false ){

		const parent = this.getPlayerParent();
		if( !parent )
			return [];
		const effects = parent.getDisableActionEffects();
		const evt = new GameEvent({
			sender : this.getPlayerParent(),
			target : player,
			action : this
		});
		
		const out = new Map();
		for( let effect of effects ){

			const conds = effect.data.conditions;
			if( Condition.all(conds, evt, debug) && (effect.data.hide || !hide_only) )
				out.set(effect, true);

		}
		return Array.from(out.keys());

	}

	// Tests a label against this one's aliases
	testLabel( label ){
		const names = {[this.label] : true};
		for( let alias of this.alias )
			names[alias] = true;
		return names[label];
	}

	canCrit(){
		return this.can_crit;
	}

	getCritChance( target ){

		if( !this.canCrit() )
			return 0;

		const sender = this.getPlayerParent();
		if( this.crit_formula )
			return Calculator.run(this.crit_formula, new GameEvent({sender:sender, target:target}));

		return sender.getCritDoneChance(target);

	}




	/* Events */
	onTurnEnd(){
		
	}

	onTurnStart(){

		this._cache_cooldown = false;

		// Handle cooldown
		if( this._cooldown )
			this.addCooldown(-1, true);

		// Handle charged spells
		if( this._cast_time ){

			let targs = this.getChargePlayers();
			if( !targs.length )
				this.interrupt();

			else if( --this._cast_time == 0 ){
				
				// Cast finished
				this.useOn(targs, true);
				this._cast_targets = [];

			}

		}
		
	}

	

	onBattleEnd(){

		this._cooldown = 0;
		this.resetCharges();
		this._cast_time = 0;

	}

	onBattleStart(){

		this._cache_cooldown = false;
		this.onBattleEnd();

		if( this.init_cooldown ){

			this.resetCharges();
			this._cooldown = this.init_cooldown+1;

		}

	}



	/* Checks */
	isAssetAction(){
		return this.parent instanceof Asset;
	}

	targetable(){
		return this.target_type !== Action.TargetTypes.self && this.target_type !== Action.TargetTypes.aoe;
	}

	getCooldown(){
		
		if( !isNaN(this.cooldown) )
			return +this.cooldown;

		if( this._cache_cooldown === false ){

			const pl = this.getPlayerParent() || game.players[0];
			this._cache_cooldown = parseInt(Calculator.run(this.cooldown, new GameEvent({sender:pl, target:pl})))||1;

		}

		return this._cache_cooldown;

	}

	/* Base functions */
	// Automatically sets cooldown if needed
	setCooldown( force = false ){

		// We're already at max capacity, can't put one here
		if( this._charges >= this.charges ){

			this._cooldown = 0;
			return;

		}
		// We're already on a cooldown, but we can restart it if force is set
		if( this._cooldown && !force )
			return;
		// Set the cooldown
		this._cooldown = this.getCooldown();

	}

	// Adds or subtracts from cooldown
	addCooldown( amount = -1, fromTurnStart = false ){

		if( this.getCooldown() === -1 )
			return;

		this._cooldown += amount;
		if( this._cooldown <= 0 && this._charges < this.charges && (!fromTurnStart || !this.charges_perm) )
			this.consumeCharges(-1);
		else if( this._cooldown <= 0 )
			this._cooldown = 0;

		if( this._cooldown > this.getCooldown() )
			this._cooldown = this.getCooldown();

	}

	// consumes charges and updates the cooldown if needed
	consumeCharges( charges = 1, forceCooldown = false ){

		// If there's no cooldown at all, the charge system is ignored
		if( this.getCooldown() <= 0 && charges > 0 )
			return;

		// Subtract a charge
		this._charges = Math.min(Math.max(0, this._charges-charges), this.charges);
		this.setCooldown(forceCooldown);

	}

	resetCharges(){
		
		this._charges = this.charges_start;
		if( this._charges === -1 )
			this._charges = this.charges;

	}

	hasEnoughCharge(){
		return this._charges > 0;
	}

	// Ends a charged cast
	interrupt( sender, force = false ){

		const pp = this.getPlayerParent();
		if( this.no_interrupt && !force )
			return false;

		// Not casting
		if( !this._cast_time )
			return false;
		
		if( !force && pp.isInterruptProtected() )
			return false;

		this._cast_time = 0;
		this._cast_targets = [];
		const interruptEvent = new GameEvent({
			type : GameEvent.Types.interrupt,
			sender : sender,
			target : pp,
			action : this,
		});
		interruptEvent.raise();
		
		console.log("interrupt wrappers", this, this.interrupt_wrappers);
		for( let wr of this.interrupt_wrappers ){

			if( !(wr instanceof Wrapper) )
				continue;
			console.log("Using", wr, "from", sender, "to", pp);
			wr.useAgainst(sender, pp);

		}
		
		game.ui.addText( pp.getColoredName()+"'s "+this.name+" was interrupted!", undefined, sender ? sender.id : undefined, pp.id, 'statMessage' );
		game.playFxAudioKitById('interrupt', sender, pp, undefined, true );
		if( this.reset_interrupt )
			this.consumeCharges(-1);

			
		pp.rebindWrappers();

		return true;

	}

	// Returns an array of Player objects
	getViableTargets( isChargeFinish = false, debug = false ){
		
		let parent = this.getPlayerParent();

		if( debug )
			console.debug("Testing", this);

		let pl = game.getEnabledPlayers();
		if( this.detrimental && !isChargeFinish && this.target_type !== Action.TargetTypes.aoe ){

			pl = this.getPlayerParent().getTauntedBy(this.ranged, true, debug);
			if( !pl.includes(this.getPlayerParent()) )	// Self should always be included
				pl.push(this.getPlayerParent());

			if( debug )
				console.debug("Getting taunted by:", pl);

		}

		let targets = [];
		if( this.target_type === Action.TargetTypes.self ){
			if( debug )
				console.debug("It's a self cast");
			pl = [this.getPlayerParent()];
		}

		const allowSelfCast = (
			!this.isDetrimentalTo(parent) || 
			this.target_type === Action.TargetTypes.aoe || 
			this.target_type === Action.TargetTypes.self || 
			this.allow_self
		);

		for( let p of pl ){

			if( debug )
				console.debug("Testing against", p, ". Pass detrimental self-cast blocker: ", allowSelfCast);
			if( 
				(p !== parent || allowSelfCast) && 
				p.checkActionFilter(parent, this) && 
				!this.getDisabledEffectsAgainst(p).length &&
				this.testGlobalConditions(p, isChargeFinish, debug) &&
				(this.ignore_wrapper_conds || this.getViableWrappersAgainst(p, isChargeFinish, debug).length) && 
				p.hasTargetableForAction(this)
			)targets.push(p);

			else if( debug ){

				console.debug("Pass FAILED: ",
					(p !== parent || allowSelfCast),
					p.checkActionFilter(parent, this),
					!this.getDisabledEffectsAgainst(p).length,
					this.testGlobalConditions(p, isChargeFinish, debug),
					(this.ignore_wrapper_conds || this.testWrapperConditions(p, isChargeFinish, debug).length),
					"player was", p
				);

			}

		}
		return targets;

	}

	getConditionEvent( player, isChargeFinish ){
		return new GameEvent({
			type : GameEvent.Types.actionUsed,
			sender : this.getPlayerParent(),
			target : player,
			action : this,
			dungeon : game.dungeon,
			dungeonRoom : game.dungeon.getActiveRoom(),
			custom : {
				isChargeFinish : isChargeFinish
			}
		});
	}

	testGlobalConditions( player, isChargeFinish = false, debug = false ){

		// Can't target invisible players unless it's yourself
		if( player !== this.getPlayerParent() && player.isInvisible() )
			return [];

		const evt = this.getConditionEvent(player, isChargeFinish);
		const conds = this.getConditions();
		const check = Condition.all(conds, evt, debug);
		return check;
		
	}

	testWrapperConditions( player, isChargeFinish = false, debug = false ){

		const evt = this.getConditionEvent(player, isChargeFinish);
		let viable = [];
		for( let w of this.wrappers ){

			let test = w.testAgainst(evt, false, debug);
			if( test )
				viable.push(w);

		}
		return viable;

	}

	// Gets an array of wrappers that have their conditions met against Player player, and also checks action conditions
	getViableWrappersAgainst( player, isChargeFinish = false, debug = false ){

		// Global conditions
		if( !this.testGlobalConditions(player, isChargeFinish, debug) )
			return [];
		
		return this.testWrapperConditions(player, isChargeFinish, debug );

	}

	// Returns AP cost by type
	getMomentumCost( type ){

		let field = 'mom'+String(type);
		if( !this.hasOwnProperty(field) )
			throw 'Invalid AP type '+String(type);
		return this[field];

	}

	// returns an array where each element corresponds to its Player.MOMENTUM index
	getMomentumCostArray(){
		return [
			this.getMomentumCost(Player.MOMENTUM.Off),
			this.getMomentumCost(Player.MOMENTUM.Def),
			this.getMomentumCost(Player.MOMENTUM.Uti),
		];
	}

	// Returns the combined amount of AP
	getTotalMomentumCost(){
		return this.mom0+this.mom1+this.mom2;
	}

	isRipostable(){
		
		const pl = this.getPlayerParent();
		const evt = new GameEvent({sender:pl, target:pl, action:this});
		const effects = pl.getActiveEffectsByType(Effect.Types.actionRiposte).filter(effect => {
			const conditions = toArray(effect.data.conditions);
			const success = Condition.all(conditions, evt);
			if( !success )
				console.log(conditions, "failed with", evt);
			return success;
		});
		if( !effects.length )
			return this.ripostable;

		
		effects.sort((a, b) => {
			
			let aPri = a.data.priority || 0;
			let bPri = b.data.priority || 0;
			if( aPri === bPri )
				return 0;
			return aPri > bPri ? -1 : 1;

		});
		return Boolean(effects[0].data.set);

	}

	getRiposteWrappers(){
		
		if( this.riposte.length )
			return this.riposte;
			
		return this.wrappers;

	}

	getCastTime(){
		
		const pl = this.getPlayerParent();
		let out = this.cast_time;
		const evt = new GameEvent({sender:pl, target:pl, action:this});
		
		// Hidden can't have cast time altered
		if( pl && !this.hidden ){

			const effects = pl.getActiveEffectsByType(Effect.Types.actionCastTime);
			let add = 0, multi = 1;

			for( let effect of effects ){

				const conditions = toArray(effect.data.conditions);
				if( Condition.all(conditions, evt) ){

					const amt = Calculator.run(effect.data.amount, new GameEvent({sender:pl, target:pl, action:this}));
					if( effect.data.set ) 
						out = amt;
					else if( effect.data.multiplier )
						multi *= amt;
					else
						add += amt;

				}

			}

			out = Math.round(out * multi + add);

		}

		if( isNaN(out) )
			out = 0;
			
		return Calculator.run(out, evt);

	}

	// Checks if all conditions are met to cast this at anyone. If log is true, it'll output an error message on fail, explaining why it failed
	castable( log, isChargeFinish = false, debug = false ){

		let err = msg => {
			if( log )
				game.ui.modal.addError(msg);
			return false;
		}

		const pl = this.getPlayerParent(); 
		if( !pl ){
			if( debug )
				console.log("Fail: No player parent");
			return false;
		}

		// Check if we have enough AP
		if( 
			game.battle_active && 
			!isChargeFinish && 
			(
				this.getMomentumCost(Player.MOMENTUM.Def) > pl.getMomentum(Player.MOMENTUM.Def) ||
				this.getMomentumCost(Player.MOMENTUM.Off) > pl.getMomentum(Player.MOMENTUM.Off) ||
				this.getMomentumCost(Player.MOMENTUM.Uti) > pl.getMomentum(Player.MOMENTUM.Uti)
			)
		)return err("Not enough momentum for action");

		if( this.getViableTargets(isChargeFinish, debug).length < this.min_targets )
			return err("No viable targets for "+this.name);

		if( pl && !pl.isActionEnabled(this) )
			return err("Can't use this action right now");

		

		// Charges are not checked when a charged action finishes
		if( !this.hasEnoughCharge() && !isChargeFinish ){
			if( log )
				console.error("Tried to use", this);
			return err("Can't use that yet");
		}

		if( pl.isCasting() && !this.allow_when_charging )
			return err("You are charging an action");

		if( !game.isTurnPlayer(pl) && game.battle_active )
			return err("Not your turn");

		// Stuff that should not affect hidden actions
		if( !this.hidden ){
			
			if( pl.getDisabledLevel() > this.disable_override )
				return err("Can't use that right now");

			// Charge finish are unaffected by knockdowns or daze
			if( this.ranged === Action.Range.Melee && pl.hasTag(stdTag.wrKnockdown) && !isChargeFinish )
				return err("Can't use while knocked down");

			if( this.ranged === Action.Range.Ranged && pl.hasTag(stdTag.wrDazed) && !isChargeFinish )
				return err("Can't use while dazed");

			if( pl && pl.isIncapacitated() )
				return err("You are incapacitated");
			
		}

		return true;

	}

	// Consumes our momentum cost from a player
	applyMomentumCostTo(pl){
		for( let type of Player.MOMENTUM_TYPES ){

			const cost = this.getMomentumCost(type);
			if( cost )
				pl.addMomentum(type, -cost, false);

		}
	}


	// Uses this action on array targets. 
	useOn( targets, isChargeFinish = false, netPlayer ){
		const pp = this.getPlayerParent();
		
		if( !this.castable(true, isChargeFinish) )
			return;

		let sender = this.getPlayerParent();

		if( !this.hidden )
			++sender._turn_action_used;

		targets = toArray(targets);

		// Enforced target types
		if( this.target_type === Action.TargetTypes.aoe )
			targets = this.getViableTargets();
			
		if( this.target_type === Action.TargetTypes.self )
			targets = [sender];

		// make sure the supplied targets are enough
		if( this.target_type !== Action.TargetTypes.aoe && (targets.length > this.max_targets || targets.length < this.min_targets) ){
			game.ui.modal.addError("Too few or too many targets selected");
			console.error("Attempted to use", targets, "on action", this);
			return false;
		}

		// Charged actions
		if( this.getCastTime() > 0 && !isChargeFinish ){

			this._cast_time = this.getCastTime();
			this._cast_targets = targets.map(t => t.id);
			
			this.applyMomentumCostTo(sender);

			sender._turn_ap_spent += this.getTotalMomentumCost();
			this.consumeCharges();
			new GameEvent({
				type : GameEvent.Types.actionCharged,
				sender : sender,
				target : targets,
				action : this,
			}).raise();
			sender.rebindWrappers();
			return true;

		}

		if( !this.hidden )
			game.renderer.playFX(pp, pp, glib.get('actionUsed', 'HitFX'), undefined, true);

		let hits = [], wrapperReturn = new WrapperReturn();
		for( let target of targets ){

			// Needs to be cached for texts
			// note that since this only affects the base attack, you should be safe to assume there's only one target
			this._crit = Math.random() < this.getCritChance( target );

			if( this.target_type === Action.TargetTypes.target ){
				target.onAware(pp);
				pp.onAware(target);
			}
				

			// Check if it hit
			if( this.isDetrimentalTo(target) ){

				let chance = Math.random()*100,
					hit = Player.getHitChance(sender, target, this)
				;

				// miss
				if( chance > hit ){

					// Riposte
					chance = Math.random()*100;
					hit = Player.getHitChance(target, sender, this);
					if( chance <= hit && this.isRipostable() && target.canRiposte() ){

						let riposte = this.getRiposteWrappers();
						for( let r of riposte )
							wrapperReturn.merge(r.useAgainst(target, sender, false));

						target.onRiposteDone(sender);
						sender.onRiposteReceived(target);

						// Handle damaging attack stats inverse
						if( this.hasTag(stdTag.acDamage) ){

							sender.onDamagingAttackReceived(target, this.type);
							target.onDamagingAttackDone(sender, this.type);

						}
						if( this.hasTag(stdTag.acHeal) ){

							sender.onHealingAttackReceived(target, this.type);
							target.onHealingAttackDone(sender, this.type);

						}

						new GameEvent({
							type : GameEvent.Types.actionRiposte,
							sender : target,
							target : [sender],
							action : this,
							wrapperReturn : wrapperReturn,
						}).raise();

					}else{

						new GameEvent({
							type : GameEvent.Types.actionUsed,
							sender : sender,
							target : [target],
							action : this,
							custom : {
								resist : true
							}
						}).raise();
						sender.onMissDone(target);
						target.onMissReceived(sender);

					}

					continue;

				}

			}

			const maxWrappers = this.max_wrappers;
			let successes = 0;
			for( let wrapper of this.wrappers ){

				// caster_player, player, isTick, isChargeFinish = false, netPlayer = undefined, crit = false
				const data = wrapper.useAgainst(sender, target, false, isChargeFinish, netPlayer, this._crit);
				wrapperReturn.merge(data);
				if( data ){
					++successes;

					if( successes >= maxWrappers && maxWrappers )
						break;

				}
			}

			if( successes )
				hits.push(target);

			// Add damaging since last
			if( this.hasTag(stdTag.acDamage) && successes ){

				target.onDamagingAttackReceived(sender, this.type);
				sender.onDamagingAttackDone(target, this.type);

			}

			if( this.hasTag(stdTag.acHeal) && successes ){

				target.onHealingAttackReceived(sender, this.type);
				sender.onHealingAttackDone(target, this.type);

			}


			if( successes && this.target_type === Action.TargetTypes.target ){

				sender.onTargetedActionUsed(target);
				target.onTargetedActionReceived(sender);

			}

			if( this.getCastTime() )
				sender.rebindWrappers();

				
		}

		if( hits.length ){
			
			let evt = new GameEvent({
				type : GameEvent.Types.actionUsed,
				sender : sender,
				target : hits,
				action : this,
				wrapperReturn : wrapperReturn,
			});
			
			evt.raise();

			if( this._crit ){

				for( let n = 0; n<hits.length; ++n ){

					setTimeout(() => {
						game.playFxAudioKitById(
							this.type === Action.Types.corruption ? 'crit_arouse' : 'crit_attack', 
							sender, 
							hits[n], 
							undefined, 
							true, 
							1.0
						);
					}, 1+n*200);

				}

			}

		}

		// If this is an asset:
		// Always consume charges, even on fail
		if( this.isAssetAction() && !this.parent.no_auto_consume )
			this.parent.consumeCharges();

		if( !isChargeFinish ){

			this.applyMomentumCostTo(sender);
			sender._turn_ap_spent += this.getTotalMomentumCost();
			this.consumeCharges();

		}

		// Always raise this on the player parent
		if( !pp.onActionUsed )
			console.trace("Action", this, "has no valid parent");
		pp.onActionUsed(this, hits);

		return hits.length;

	}

	// Gets tooltip text for the UI
	// ignoreMomentum = Don't show momentum. Used mostly on potions.
	getTooltipText( ignoreMomentum, rarity=0 ){

		const name = this.getName(),
			desc = this.getDesc()
		;

		let html = '<strong class="'+(Asset.RarityNames[rarity])+'">'+esc(name)+'</strong><br />';

		const ct = this.getCastTime();

		html+= '<div class="stats">';
			html += '<span style="color:'+Action.typeColor(this.type)+'">'+this.type+'</span>';
			if( this.ranged !== Action.Range.None )
				html += '<span style="color:'+(this.ranged ? '#AAD' : '#CCC')+';">'+(this.ranged ? 'Ranged' : 'Melee')+'</span>';
			if( this.getCooldown() && this.charges > 1 )
				html += '<span style="color:#FDF">'+this.charges+' Charges</span>';
			if( this.getCooldown() )
				html += '<span style="color:#FFD">'+this.getCooldown()+' Round Cooldown</span>';
			if( this.isAssetAction() )
				html += '<span style="color:#FFF">'+this.parent.getWeightReadable()+'</span>';
			if( ct )
				html += '<span style="color:#FDD"><strong>Charged '+ct+' turn'+(ct !== 1 ? 's' : '')+'</strong></span>';
			if( !ignoreMomentum ){

				for( let i = 0; i < Player.MOMENTUM_TYPES.length; ++i ){

					const t = Player.MOMENTUM_TYPES[i];
					const cost = this.getMomentumCost(t);
					if( cost )
						html += '<span style="color:'+Player.MOMENTUM_COLORS[i]+'">'+cost+' '+Player.MOMENTUM_NAMES_SHORT[i]+'</span>';

				}

			}
			
			if( this.detrimental )
				html += '<span style="color:#FFF">'+(this.hit_chance < 100 ? this.hit_chance+' Base Hit Chance' : 'Always hits')+'</span>';
		html += '</div>';
		html += esc(desc);
		return html;
	}

	getName(){
		return this.name.split('%P%').join(this.parent ? this.parent.name : 'Unknown');
	}

	getDesc(){
		return this.description.split('%P%').join(this.parent ? this.parent.description : 'Unknown');
	}

	getIcon(){
		let out = this.icon;
		if( out === '%P%' )
			out = this.parent.icon;
		return out;
	}

	isSelfCast(){
		return this.target_type === Action.TargetTypes.self;
	}

	// Gets target Player objects this is charged at
	getChargePlayers(){

		const ctargets = this._cast_targets.map(el => game.getPlayerById(el));

		// This can be taunted. Should generally just be used on actions without conditions
		if( this.ct_taunt ){

			let overrides = [];
			let taunts = this.getPlayerParent().getTauntedBy(this.ranged, false);

			// If the original target is taunting, add that
			for( let pl of taunts ){
				if( ctargets.includes(pl) )
					overrides.push(pl);
			}

			// Add additional taunts if that wasn't enough
			if( ctargets.length > overrides.length ){
				for( let pl of taunts ){
					if( !overrides.includes(pl) ){
						overrides.push(pl);
						if( ctargets.length === overrides.length )
							break;
					}
				}
			}


			if( overrides.length )
				return overrides;

		}

		return ctargets.filter(el => Boolean(el));		// Might want to check if conditions are still valid


	}

	isDetrimentalTo( player ){

		const pp = this.getPlayerParent();
		if( parseInt(this.detrimental) === Action.Detrimental.team && pp )
			return pp.team !== player.team;

		return ( parseInt(this.detrimental) === Action.Detrimental.yes );

	}
	

}

Action.Detrimental = {
	team : 2,		// Other team player is detrimental, own team is beneficial
	yes : 1,		// Detrimental
	no : 0			// Beneficial
};


Action.Range = {
	Melee : 0,
	Ranged : 1,
	None : -1,			// Doesn't count as either ranged or melee
};


Action.TargetTypes = {
	target : "target",		// Pick target(s) yourself
	aoe : "aoe",			// Hit all valid players
	self : "self",			// Autocast self
};


// SV/BON types
Action.Types = {
	physical : "Physical",			// Primary used body to hurt effects
	corruption : "Corruption",		// Primary sexy effects
	arcane : "Arcane",				// Anything that doesn't fit in the top two categories
};

// used by Player
Action.TypeFlags = {
	[Action.Types.physical] : 0x1,
	[Action.Types.corruption] : 0x2,
	[Action.Types.arcane] : 0x4,
}

Action.TypeDescriptions = {
	[Action.Types.physical] : 'Physical damage has a chance of damaging armor durability.',
	[Action.Types.arcane] : 'Arcane damage has a chance to remove extra blocking before dealing damage.',
	[Action.Types.corruption] : 'Corruption damage has a chance to arouse the target.',
};

Action.typeColor = function(type){
	let colors = {
		[Action.Types.physical] : '#FDD',
		[Action.Types.arcane] : '#DFF',
		[Action.Types.corruption] : '#FDF',
	};
	if( colors[type] )
		return colors[type];
	return '#FFF';
};

Action.typeExists = function(type){
	for(let i in this.Types){
		if( this.Types[i] === type )
			return true;
	}
	return false;
}




export default Action;