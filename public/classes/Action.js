import Generic from './helpers/Generic.js';
import {Wrapper, Effect} from './EffectSys.js';
import GameEvent from './GameEvent.js';
import Player from './Player.js';
import stdTag from '../libraries/stdTag.js';
import Condition from './Condition.js';
import Asset from './Asset.js';

class Action extends Generic{
	
	/* Loading & Saving */
	constructor(data, parent){
		super(data);

		// Parent is a Player OR Asset
		this.parent = parent;
		this.label = "";			// Same as name but not changing
		this.name = "";
		this.description = "";
		this.ranged = false;		// This is a ranged attack
		this.wrappers = [];			// Effect wrappers needed to cast the spell
		this.riposte = [];			// Wrappers that are triggered when an ability misses. Riposte is sent from the target to attacker
		this.ap = 1;
		this.mp = 0;
		this.cooldown = 0;						// Turns needed to add a charge. Setting this to 0 will make charges infinite
		this.min_targets = 1;
		this.max_targets = 1;
		this.target_type = Action.TargetTypes.target;
		this.hit_chance = 90;		// 90% hit chance before SV/BON
		this.detrimental = true;
		this.type = Action.Types.physical;			// Custom damage type
		this.level = 1;								// Level required to use this action
		this.hidden = false;					// Hidden action
		this.semi_hidden = false;				// Only show in the action selector
		this.tags = [];
		this.add_conditions = [];				// ADD conditions. These aren't saved, because they're only used for NPCs
		this.conditions = [];					// Conditions run against all targets regardless of wrapper
		this.show_conditions = [];				// Same as above, but if these aren't met, the spell will not be visible in the spell selector
												// You generally want this to be "inCombat"
		this.no_use_text = false;				// Disable use texts.
		this.no_action_selector = false;		// Hide from combat action selector
		this.cast_time = 0;						// Set to > 0 to make this a charged spell needing this many turns to complete
		this.charges = 1;						// Max charges for the action. Ignored if cooldown is 0
		this.allow_when_charging = false;		// Allow this to be cast while using a charged action
		this.no_interrupt = false;				// Charged action is not interruptable
		this.hide_if_no_targets = false;		// hide this from the action picker if there's no viable targets
		this.icon = '';

		// User stuff
		this._cooldown = 0;			// Turns remaining to add a charge
		this._cast_time = 0;		// Turns remaining to cast this if cast_time > 0
		this._charges = 1;			// Charges remaining for this action. A charge is added each time the cooldown triggers
		this._cast_targets = [];		// UUIDs of players a charge spell is aimed at

		// Auto generated if loaded from a player library
		this._custom = false;
		
		this.load(data);
	}
	
	save( full ){
		
		let out = {
			label : this.label,
			name : this.name,
			description : this.description,
			wrappers : this.wrappers.map(el => el.save(full)),
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
			charges : this.charges,
			allow_when_charging : this.allow_when_charging,
			no_interrupt : this.no_interrupt,
			show_conditions : this.show_conditions.map(el => el.save(full)),
			hide_if_no_targets : this.hide_if_no_targets,
			semi_hidden : this.semi_hidden,
			icon : this.icon
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
			out.level = this.level;
			out.riposte = this.riposte.map(el => el.save(full));
			out.no_use_text = this.no_use_text;	
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
		this.wrappers = Wrapper.loadThese(this.wrappers, this);
		this.riposte = Wrapper.loadThese(this.riposte, this);
		this.show_conditions = Condition.loadThese(this.show_conditions, this);
		this.conditions = Condition.loadThese(this.conditions, this);
		
		this.add_conditions = Condition.loadThese(this.add_conditions, this);
	}

	getPlayerParent(){

		if( this.isAssetAction() )
			return this.parent.parent;
		return this.parent;

	}

	clone(parent){

		// This rebases by cloning the wrappers as well
		let out = new this.constructor(this.save(true), parent);
		return out;

	}



	/* Conditions */
	getConditions(){
		return this.conditions.concat(this.show_conditions);
	}
	isVisible(){

		if( this.hide_if_no_targets && !this.getViableTargets().length )
			return false;

		return !this.hidden && Condition.all(this.show_conditions, new GameEvent({
			sender : this.getPlayerParent(),
			target : this.getPlayerParent(),
			action : this,
		}));

	}



	/* Events */
	onTurnEnd(){
		
	}

	onTurnStart(){

		// Handle cooldown
		if( this._cooldown ){
			
			--this._cooldown;
			if( this._cooldown <= 0 && this._charges < this.charges ){
				++this._charges;
				if( this._charges < this.charges )
					this.setCooldown();
			}
		}

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
		this.onBattleEnd();
	}



	/* Checks */
	isAssetAction(){
		return this.parent instanceof Asset;
	}


	/* Base functions */
	// Automatically sets cooldown if needed
	setCooldown( force = false ){
		// We're already at max capacity, can't put one here
		if( this._charges >= this.charges )
			return;
		// We're already on a cooldown, but we can restart it if force is set
		if( this._cooldown && !force )
			return;
		// Set the cooldown
		this._cooldown = this.cooldown;
	}

	// consumes charges and updates the cooldown if needed
	consumeCharges( charges = 1 ){

		// If there's no cooldown at all, the charge system is ignored
		if( this.cooldown <= 0 )
			return;

		// Subtract a charge
		this._charges = Math.max(0, this._charges-charges);
		this.setCooldown();

	}

	hasEnoughCharge(){
		return this.cooldown <= 0 || this._charges > 0;
	}

	// Ends a charged cast
	interrupt( sender ){

		if( this.no_interrupt )
			return false;

		// Not casting
		if( !this._cast_time )
			return false;
		
		let pp = this.getPlayerParent();
		this._cast_time = 0;
		this._cast_targets = [];
		new GameEvent({
			type : GameEvent.Types.interrupt,
			sender : sender,
			target : this.getPlayerParent(),
			action : this,
		}).raise();
		game.ui.addText( pp.getColoredName()+"'s "+this.name+" was interrupted!", undefined, sender ? sender.id : undefined, pp.id, 'statMessage' );
		return true;

	}

	// Returns an array of Player objects
	getViableTargets( isChargeFinish = false ){
		
		let parent = this.getPlayerParent();
		let pl = game.players;
		if( this.detrimental && !isChargeFinish )
			pl = this.getPlayerParent().getTauntedOrGrappledBy();
		let targets = [];
		if( this.target_type === Action.TargetTypes.self )
			pl = [this.getPlayerParent()];

		for( let p of pl ){

			if( (p !== parent || !this.detrimental) && this.getViableWrappersAgainst(p, isChargeFinish).length )
				targets.push(p);
			
		}
		return targets;

	}

	// Gets an array of wrappers that have their conditions met against Player player
	getViableWrappersAgainst( player, isChargeFinish = false ){

		let evt = new GameEvent({
			type : GameEvent.Types.actionUsed,
			sender : this.getPlayerParent(),
			target : player,
			action : this,
			custom : {
				isChargeFinish : isChargeFinish
			}
		});

		// Global conditions
		if( !Condition.all(this.getConditions(), evt) )
			return [];

		let viable = [];
		for( let w of this.wrappers ){

			let test = w.testAgainst(evt, false);
			if( test )
				viable.push(w);

		}
		return viable;

	}

	// Checks if all conditions are met to cast this at anyone. If log is true, it'll output an error message on fail, explaining why it failed
	castable( log, isChargeFinish = false ){

		let err = msg => {
			if( log )
				game.modal.addError(msg);
			return false;
		}

		// AP was consumed immediately
		if( this.ap > this.getPlayerParent().ap && game.battle_active && !isChargeFinish )
			return err("Not enough AP for action");

		// MP is not consumed immediately on charged action start, but you still need to have it
		if( this.mp > this.getPlayerParent().mp )
			return err("Not enough MP for action");

		if( this.getViableTargets(isChargeFinish).length < this.min_targets )
			return err("No viable targets");

		// Charges are not checked when a charged action finishes
		if( !this.hasEnoughCharge() > 0 && !isChargeFinish )
			return err("Can't use that yet");

		if( this.getPlayerParent().isCasting() && !this.allow_when_charging )
			return err("You are charging an action");


		// Stuff that should not affect hidden actions
		if( !this.hidden ){

			// Charge finish are unaffected by knockdowns or daze
			if( !this.ranged && this.getPlayerParent().hasTag(stdTag.wrKnockdown) && !isChargeFinish )
				return err("Can't use while knocked down");

			if( this.ranged && this.getPlayerParent().hasTag(stdTag.wrDazed) && !isChargeFinish )
				return err("Can't use while dazed");

		}

		return true;

	}

	// Uses this action on array targets. 
	useOn( targets, isChargeFinish = false, netPlayer ){

		if( !this.castable(true, isChargeFinish) )
			return;

		let sender = this.getPlayerParent();

		if( !Array.isArray(targets) )
			targets = [targets];

		// Enforced target types
		if( this.target_type === Action.TargetTypes.aoe )
			targets = this.getViableTargets();
			
		if( this.target_type === Action.TargetTypes.self )
			targets = [sender];

		
		// Handle taunt on charge finish
		/*
		let viable = this.getViableTargets(),
			taunts = this.getPlayerParent().getTauntedOrGrappledBy();
		if( 
			isChargeFinish && 
			this.target_type !== Action.TargetTypes.aoe && 
			this.target_type !== Action.TargetTypes.self && 
			taunts !== game.players // getTauntedBy returns game.players if you're not taunted
		){
			let targs = [];
			for( let target of targets ){
				let pos = viable.indexOf(target);
				// This player is already taunting, so add it
				if( ~pos ){
					targs.push(target);
					viable.splice(pos, 1);
				}
				// Player is not taunting. Target a taunting player instead if possible.
				else{
					// Shuffle taunts
					shuffle(taunts);
					while( taunts.length ){
						let pl = taunts.shift();
						if( targs.indexOf(pl) === -1 )
							targs.push(pl);
					}
				}
			}
			targets = targs;
		}
		*/

		// make sure the supplied targets are enough
		if( targets.length > this.max_targets || targets.length < this.min_targets ){
			game.modal.addError("Too few or too many targets selected");
			return false;
		}

		// Charged actions
		if( this.cast_time > 0 && !isChargeFinish ){
			this._cast_time = this.cast_time;
			this._cast_targets = targets.map(t => t.id);
			// AP and charges are consumed immediately, but MP is consumed when it succeeds
			sender.addAP(-this.ap);
			sender._turn_ap_spent += this.ap;
			this.consumeCharges();
			new GameEvent({
				type : GameEvent.Types.actionCharged,
				sender : sender,
				target : targets,
				action : this,
			}).raise();
			return true;
		}

		let hits = [];
		for( let target of targets ){

			
			// Check if it hit
			if( this.detrimental ){

				let chance = Math.random()*100,
					hit = Player.getHitChance(sender, target, this)
				;

				if( chance > hit ){

					// Riposte
					chance = Math.random()*100;
					hit = Player.getHitChance(target, sender, this);
					if( chance <= hit && this.riposte.length ){

						for( let r of this.riposte )
							r.useAgainst(target, sender, false);
						
						new GameEvent({
							type : GameEvent.Types.actionRiposte,
							sender : target,
							target : [sender],
							action : this,
						}).raise();

						game.dmRiposteMessage(this);

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
						game.dmHitMessage(this, false);
					}

					continue;

				}

			}

			let successes = 0;
			for( let wrapper of this.wrappers )
				successes += wrapper.useAgainst(sender, target, false, isChargeFinish, netPlayer);

			if( successes )
				hits.push(target);

			// Add damaging since last
			if( this.hasTag(stdTag.acDamage) && successes ){
				target.onDamagingAttackReceived(sender, this.type);
				sender.onDamagingAttackDone(target, this.type);
			}

			game.dmHitMessage(this, successes);
				
		}
		
		if( hits.length ){
			
			let evt = new GameEvent({
				type : GameEvent.Types.actionUsed,
				sender : this.getPlayerParent(),
				target : hits,
				action : this,
			});
			evt.raise();
			if( this.isAssetAction() && !this.parent.no_auto_consume )
				this.parent.consumeCharges();

		}
		

		this.getPlayerParent().addMP(-this.mp);
		if( !isChargeFinish ){
			this.getPlayerParent().addAP(-this.ap);
			this.getPlayerParent()._turn_ap_spent += this.ap;
			this.consumeCharges();
		}
		return hits.length;

	}

	// Gets tooltip text for the UI
	getTooltipText( apOverride ){
		let html = '<h3>'+esc(this.name)+'</h3>';

		let ap = this.ap;
		if( !isNaN(apOverride) )
			ap = apOverride;

		html+= '<div class="stats">';
			html += '<span style="color:'+Action.typeColor(this.type)+'">'+this.type+'</span>';
			html += '<span style="color:'+(this.ranged ? '#AAD' : '#CCC')+';">'+(this.ranged ? 'Ranged' : 'Melee')+'</span>';
			if( this.cooldown && this.charges > 1 )
				html += '<span style="color:#FDF">'+this.charges+' Charges</span>';
			if( this.cooldown )
				html += '<span style="color:#FFD">'+this.cooldown+' Round Cooldown</span>';
			if( this.cast_time )
				html += '<span style="color:#FDD"><strong>Charged '+this.cooldown+' turn'+(this.cooldown !== 1 ? 's' : '')+'</strong></span>';
			if( ap )
				html += '<span style="color:#DFD">'+this.ap+' AP</span>';
			if( this.mp )
				html += '<span style="color:#DEF">'+this.mp+' MP</span>';
			if( this.detrimental )
				html += '<span style="color:#FFF">'+(this.hit_chance < 100 ? this.hit_chance+' Base Hit Chance' : 'Always hits')+'</span>';
		html += '</div>';
		html += esc(this.description);
		return html;
	}

	isSelfCast(){
		return this.target_type === Action.TargetTypes.self;
	}

	// Gets target Player objects this is charged at
	getChargePlayers(){
		return this._cast_targets
		.map(el => game.getPlayerById(el))
		.filter(el => !!el && !el.isDead());
	}


	

}



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