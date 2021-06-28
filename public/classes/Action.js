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
		this.riposte = [];			// Wrappers that are triggered when an ability misses. Riposte is sent from the target to attacker
		this.ap = 1;
		this.min_ap = 0;			// When reduced by effects, this is the minimum AP we can go to 
		this.mp = 0;
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
		this.allow_self = false;				// If detrimental and "target" cast, this has to be set to allow self cast
		this.no_use_text = false;				// Disable use texts.
		this.no_action_selector = false;		// Hide from combat action selector
		this.cast_time = 0;						// Set to > 0 to make this a charged spell needing this many turns to complete
		this.ct_taunt = false;					// Taunt can override the charge target
		this.charges = 1;						// Max charges for the action. Ignored if cooldown is 0
		this.allow_when_charging = false;		// Allow this to be cast while using a charged action
		this.no_interrupt = false;				// Charged action is not interruptable unless override is set
		this.reset_interrupt = false;			// Reset cooldown when interrupted
		this.hide_if_no_targets = false;		// hide this from the action picker if there's no viable targets
		this.disable_override = 0;				// Level of disable override.
		this.alias = [];						// Aliases to use for texts. Useful when you want multiple actions with the same texts
		

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
			ap : this.ap,
			min_targets : this.min_targets,
			max_targets : this.max_targets,
			hit_chance : this.hit_chance,
			detrimental : this.detrimental,
			type : this.type,
			mp : this.mp,
			hidden : this.hidden,
			target_type : this.target_type,
			tags : this.tags,
			ranged : this.ranged,
			conditions : Condition.saveThese(this.conditions, full),
			no_action_selector : this.no_action_selector,
			cast_time : this.cast_time,
			ct_taunt : this.ct_taunt,
			charges : this.charges,
			allow_when_charging : this.allow_when_charging,
			no_interrupt : this.no_interrupt,
			show_conditions : Condition.saveThese(this.show_conditions, full),
			hide_if_no_targets : this.hide_if_no_targets,
			semi_hidden : this.semi_hidden,
			icon : this.icon,
			disable_override : this.disable_override,
			reset_interrupt : this.reset_interrupt,
			min_ap : this.min_ap,
			allow_self : this.allow_self,
			_slot : this._slot,
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

	// Only stdAttack and stdArouse can crit
	canCrit(){

		return this.testLabel('stdAttack') || this.testLabel('stdArouse');

	}





	/* Events */
	onTurnEnd(){
		
	}

	onTurnStart(){

		

		this._cache_cooldown = false;

		// Handle cooldown
		if( this._cooldown )
			this.addCooldown(-1);


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
		this._charges = this.charges;
		this._cast_time = 0;
	}

	onBattleStart(){
		this._cache_cooldown = false;
		this.onBattleEnd();
		if( this.init_cooldown ){
			this._charges = 0;
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
	addCooldown( amount = -1 ){

		if( this.getCooldown() === -1 )
			return;

		this._cooldown += amount;
		if( this._cooldown <= 0 && this._charges < this.charges ){
			this.consumeCharges(-1);
		}
		if( this._cooldown > this.getCooldown() )
			this._cooldown = this.getCooldown();

	}

	// consumes charges and updates the cooldown if needed
	consumeCharges( charges = 1 ){


		// If there's no cooldown at all, the charge system is ignored
		if( this.getCooldown() <= 0 && charges > 0 )
			return;

		// Subtract a charge
		this._charges = Math.min(Math.max(0, this._charges-charges), this.charges);
		this.setCooldown();

	}

	hasEnoughCharge(){
		return this.getCooldown() <= 0 || this._charges > 0;
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
		
		for( let wr of this.interrupt_wrappers ){
			if( !(wr instanceof Wrapper) )
				continue;
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

			pl = this.getPlayerParent().getTauntedOrGrappledBy(this.ranged, true, debug);
			if( debug )
				console.debug("Getting taunted or grappled by:", pl);

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
				this.getViableWrappersAgainst(p, isChargeFinish, debug).length 
			)targets.push(p);
			else if( debug ){
				console.debug("Pass FAILED: ",
					(p !== parent || allowSelfCast),
					p.checkActionFilter(parent, this),
					!this.getDisabledEffectsAgainst(p).length,
					this.getViableWrappersAgainst(p, isChargeFinish, debug).length
				);
			}

		}
		return targets;

	}

	// Gets an array of wrappers that have their conditions met against Player player
	getViableWrappersAgainst( player, isChargeFinish = false, debug = false ){

		// Can't target invisible players unless it's yourself
		if( player !== this.getPlayerParent() && player.isInvisible() )
			return [];

		let evt = new GameEvent({
			type : GameEvent.Types.actionUsed,
			sender : this.getPlayerParent(),
			target : player,
			action : this,
			custom : {
				isChargeFinish : isChargeFinish
			}
		});

		const conds = this.getConditions();
		const check = Condition.all(conds, evt, debug);
		// Global conditions
		if( !check )
			return [];
		

		let viable = [];
		for( let w of this.wrappers ){

			let test = w.testAgainst(evt, false, debug);
			if( test )
				viable.push(w);

		}
		return viable;

	}

	getApCost(){
		const pl = this.getPlayerParent();
		let out = this.ap;
		const evt = new GameEvent({sender:pl, target:pl, action:this});
		
		// Hidden can't have AP cost altered
		if( pl && !this.hidden ){

			const effects = pl.getActiveEffectsByType(Effect.Types.actionApCost);
			for( let effect of effects ){

				const conditions = toArray(effect.data.conditions);
				if( Condition.all(conditions, evt) ){

					const amt = Calculator.run(effect.data.amount, new GameEvent({sender:pl, target:pl, action:this}));
					if( effect.data.set ) 
						out = amt;
					else
						out += amt;

				}

			}

		}

		if( isNaN(out) )
			out = 1;
			
		out = Math.max(this.min_ap, out);
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
			return false;
		}
		// AP was consumed immediately
		if( this.getApCost() > this.getPlayerParent().ap && game.battle_active && !isChargeFinish )
			return err("Not enough AP for action");

		// MP is not consumed immediately on charged action start, but you still need to have it
		if( this.mp > this.getPlayerParent().mp )
			return err("Not enough MP for action");

		

		if( this.getViableTargets(isChargeFinish, debug).length < this.min_targets )
			return err("No viable targets");

		if( pl && !pl.isActionEnabled(this) )
			return err("Can't use this action right now");

		

		// Charges are not checked when a charged action finishes
		if( !this.hasEnoughCharge() && !isChargeFinish ){
			if( log )
				console.error("Tried to use", this);
			return err("Can't use that yet");
		}

		if( this.getPlayerParent().isCasting() && !this.allow_when_charging )
			return err("You are charging an action");

		if( game.getTurnPlayer().id !== this.getPlayerParent().id && game.battle_active )
			return err("Not your turn");

		// Stuff that should not affect hidden actions
		if( !this.hidden ){
			
			if( pl.getDisabledLevel() > this.disable_override )
				return err("Can't use that right now");

			// Charge finish are unaffected by knockdowns or daze
			if( this.ranged === Action.Range.Melee && this.getPlayerParent().hasTag(stdTag.wrKnockdown) && !isChargeFinish )
				return err("Can't use while knocked down");

			if( this.ranged === Action.Range.Ranged && this.getPlayerParent().hasTag(stdTag.wrDazed) && !isChargeFinish )
				return err("Can't use while dazed");

			if( pl && pl.isIncapacitated() )
				return err("You are incapacitated");
			
		}

		return true;

	}

	// Uses this action on array targets. 
	useOn( targets, isChargeFinish = false, netPlayer ){

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
		if( this.cast_time > 0 && !isChargeFinish ){

			this._cast_time = this.cast_time;
			this._cast_targets = targets.map(t => t.id);
			// AP and charges are consumed immediately, but MP is consumed when it succeeds
			sender.addAP(-this.getApCost());
			sender._turn_ap_spent += this.getApCost();
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


		let hits = [], wrapperReturn = new WrapperReturn();
		for( let target of targets ){

			// Needs to be cached for texts
			// note that since this only affects the base attack, you should be safe to assume there's only one target
			this._crit = this.canCrit() && Math.random() < sender.getCritDoneChance(target);
			

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
					if( chance <= hit && this.riposte.length && target.canRiposte() ){

						for( let r of this.riposte )
							wrapperReturn.merge(r.useAgainst(target, sender, false));
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
					}

					continue;

				}

			}

			let maxWrappers = this.max_wrappers;
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

			if( successes && this.target_type === Action.TargetTypes.target ){

				sender.onTargetedActionUsed(target);
				target.onTargetedActionReceived(sender);

			}

			if( this.cast_time )
				sender.rebindWrappers();

				
		}

		if( hits.length ){
			
			const pp = this.getPlayerParent();
			let evt = new GameEvent({
				type : GameEvent.Types.actionUsed,
				sender : pp,
				target : hits,
				action : this,
				wrapperReturn : wrapperReturn,
			});
			
			evt.raise();

			if( this._crit ){

				for( let n = 0; n<hits.length; ++n ){

					setTimeout(() => {
						game.playFxAudioKitById(
							this.testLabel('stdAttack') ? 'crit_attack' : 'crit_arouse', 
							pp, 
							hits[n], 
							undefined, 
							true, 
							1.0
						);
					}, 1+n*200);

				}

			}

		}

		// Always consume charges, even on fail
		if( this.isAssetAction() && !this.parent.no_auto_consume )
			this.parent.consumeCharges();

		this.getPlayerParent().addMP(-this.mp);
		if( !isChargeFinish ){
			this.getPlayerParent().addAP(-this.getApCost());
			this.getPlayerParent()._turn_ap_spent += this.getApCost();
			this.consumeCharges();
		}

		return hits.length;

	}

	// Gets tooltip text for the UI
	getTooltipText( apOverride, rarity=0 ){

		const name = this.getName(),
			desc = this.getDesc()
		;

		let html = '<strong class="'+(Asset.RarityNames[rarity])+'">'+esc(name)+'</strong><br />';

		let ap = this.getApCost();
		if( !isNaN(apOverride) )
			ap = apOverride;

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
			if( this.cast_time )
				html += '<span style="color:#FDD"><strong>Charged '+this.cast_time+' turn'+(this.cast_time !== 1 ? 's' : '')+'</strong></span>';
			if( ap )
				html += '<span style="color:#DFD">'+ap+' AP</span>';
			if( this.mp )
				html += '<span style="color:#DEF">'+this.mp+' MP</span>';
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
			let taunts = this.getPlayerParent().getTauntedOrGrappledBy(this.ranged, false);

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
	physical : "Physical",
	elemental : "Elemental",
	holy : "Holy",
	corruption : "Corruption",
};

Action.TypeDescriptions = {
	[Action.Types.physical] : 'Physical attacks have a chance of damaging armor durability.',
	[Action.Types.elemental] : 'Elemental attacks have a chance of damaging enemy AP.',
	[Action.Types.holy] : 'Holy healing has a chance to consume the target\'s arousal, increasing the healing effect.',
	[Action.Types.corruption] : 'Corruption effects have a chance to arouse the target, increasing their corruption damage taken.',
};

Action.typeColor = function(type){
	let colors = {
		[Action.Types.physical] : '#FDD',
		[Action.Types.elemental] : '#DFF',
		[Action.Types.holy] : '#FFD',
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