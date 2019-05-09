import Generic from './helpers/Generic.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import stdTag from '../libraries/stdTag.js';
import Action from './Action.js';
import Calculator from './Calculator.js';
import Player from './Player.js';
import Asset from './Asset.js';

/*
	A wrapper is a container for multiple effects
	Wrappers can have a duration or one offs
*/
class Wrapper extends Generic{

	// Parent is the owner of this wrapper, such as an action, asset, or player
	constructor(data, parent){
		super(data);

		this.parent = parent;
		this.label = '';					// A unique identifier
		this.target = Wrapper.TARGET_AUTO;	// target constants
		this.add_conditions = [];			// Conditions needed to add
		this.stay_conditions = [];			// Conditions needed to stay. These are checked at the end of turn end/start, and after an action is used
		this.effects = [];
		this.duration = 0;
		this.tags = [];						// wr_ is prepended
		this.stacks = 1;
		this.max_stacks = 1;
		this.name = "";
		this.icon = "";
		this.description = "";
		this.detrimental = true;
		this.trigger_immediate = false;			// Trigger immediate if it's a duration effect
		
		this.tick_on_turn_start = true;			// Tick on turn start
		this.tick_on_turn_end = false;			// Tick on turn end

		this.netPlayer = "";					// This should only be relied upon from instant effects

		// Stuff set when applied
		this.victim = "";				// Player UUID
		this.caster = "";				// Player UUID
		this.original_target = "";		// Set on targeted actions, this is the one the action targeted. Usually the same as victim
		this._duration = 0; 
		this._self_cast = false;		// This effect was placed on the caster by the caster


		this.load(data);
	}


	// Data that should be saved to drive
	save( full ){
		const out = {
			name : this.name,
			description : this.description,
			icon : this.icon,
			detrimental : this.detrimental,
			target : this.target,
			add_conditions : Condition.saveThese(this.add_conditions, full),
			stay_conditions : Condition.saveThese(this.stay_conditions, full),
			effects : this.effects.map(el => el.save(full)),
			tags : this.tags,
			label : this.label,
		};

		if( full ){
			out.tick_on_turn_end = this.tick_on_turn_end;
			out.tick_on_turn_start = this.tick_on_turn_start;
			out.max_stacks = this.max_stacks;
			out.trigger_immediate = this.trigger_immediate;
			out.duration = this.duration;
			if( full !== "mod" ){
				out._self_cast = this._self_cast;
				out.netPlayer = this.netPlayer;
			}

		}

		if( full !== "mod" ){
			out.id = this.id;
			out._duration = this._duration;
			out.victim = this.victim;
			out.caster = this.caster;
			out.stacks = this.stacks;
		}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}

	load( data ){
		this.g_autoload(data);
	}

	// Automatically invoked after g_autoload
	rebase(){
		//console.error("Add conditions", this.add_conditions);
		this.add_conditions = Condition.loadThese(this.add_conditions, this);
		this.stay_conditions = Condition.loadThese(this.stay_conditions, this);
		this.effects = Effect.loadThese(this.effects, this);

		this.tags = this.tags.slice();
	}

	clone(parent){
		let out = new this.constructor(this.save(true), parent);
		out.g_resetID();
		out.template_id = this.id;
		return out;
	}

	getCaster(){
		return game.getPlayerById(this.caster);
	}

	
	/* MAIN FUNCTIONALITY */
	// Tests if the wrapper can be used against a single target
	testAgainst( event, isTick, debug = false ){

		event.wrapper = this;
		let conditions = this.add_conditions;
		if( isTick )
			conditions = this.stay_conditions;

		if( this.target === Wrapper.TARGET_CASTER && event.target !== event.sender )
			return false;


		event.type = !isTick ? GameEvent.Types.internalWrapperAdded : GameEvent.Types.internalWrapperTick;
		return Condition.all(conditions, event, debug);

	}

	useAgainst( caster_player, player, isTick, isChargeFinish = false, netPlayer = undefined ){
		
		let pl = [game.getPlayerById(this.victim)];
		
		// If this effect isn't yet applied, we need to apply it against multiple players if target is an override
		if( !isTick ){
			
			if( this.target === Wrapper.TARGET_CASTER )
				pl = [caster_player]; //[this.parent.parent];
			else if( this.target === Wrapper.TARGET_AOE )
				pl = game.players;
			else if( this.target === Wrapper.TARGET_SMART_HEAL ){
				// Find the lowest HP party member of target
				let party = game.getPartyMembers(caster_player);
				party = party.filter(el => el.hp > 0);
				party.sort((a,b) => {
					if( a.hp === b.hp )
						return 0;
					return a.hp < b.hp ? -1 : 1;
				});
				if( !party.length )	// Fail because there's no viable target
					return 0;
				pl = [party[0]];
			}
			else
				pl = [player]; 
			
		}


		let successes = 0;
		for( let p of pl ){	

			let obj = this;
			if( !obj.label )
				obj.label = this.parent.label;
			// This was just added, and not a tick
			if( !isTick ){

				// Need to clone and setup victim and caster
				obj = this.clone(p);	// Parent becomes a player, since the player now directly owns the wrapper
				obj.victim = p.id;
				obj.caster = caster_player.id;
				obj.netPlayer = netPlayer;
				obj.original_target = player.id;

			}

			let caster = obj.getCaster(),
				victim = game.getPlayerById(obj.victim)
			;
			if( !obj.testAgainst(new GameEvent({sender:caster, target:victim, custom:{isChargeFinish:isChargeFinish}}), isTick) || !caster || !victim ){

				if( isTick )
					this.rebase();
				continue;

			}


			// Add
			if( obj.duration && !isTick ){

				if( p === caster_player )
					obj._self_cast = true;

				let add_stacks = 0;

				// Remove any existing effects with the same label
				for( let wrapper of p.wrappers ){
					if( wrapper.label === obj.label && wrapper.caster === caster.id ){
						add_stacks = wrapper.stacks;
						wrapper.remove();
					}
				}

				obj._duration = obj.duration;		
				if(obj.getEffects({
					type : Effect.Types.stun
				}).length){
					obj._duration-=victim._stun_diminishing_returns;
					if( obj._duration <= 0 ){
						// Fully resisted stun
						new GameEvent({
							type : GameEvent.Types.diminishingResist,
							sender : caster,
							target : victim,
							wrapper : obj,
							action : this.parent.constructor === Action ? this.parent : null,
						}).raise();
						continue;
					}
				}
				
				victim.addWrapper(obj);

				// Bind events
				obj.bindEvents();

				let evt = new GameEvent({
					type : GameEvent.Types.internalWrapperAdded,
					sender : caster,
					target : victim,
					wrapper : obj,
					action : this.parent.constructor === Action ? this.parent : null,
				});
				for(let effect of obj.effects)
					effect.trigger(evt);
				

				evt.type = GameEvent.Types.wrapperAdded;
				evt.raise();

				if( add_stacks ){
					obj.addStacks(add_stacks);
				}
				
			}

			// Run immediate
			if( !obj.duration || isTick || obj.trigger_immediate ){

				let evt = new GameEvent({
					type : GameEvent.Types.wrapperTick,
					sender : caster,
					target : victim,
					wrapper : obj,
				}).raise();
				
				evt.type = GameEvent.Types.internalWrapperTick;
				for( let effect of obj.effects )
					effect.trigger(evt, this);

				

			}
			++successes;
			
		}
		return successes;

	}

	addStacks( amount, refreshTime ){
		if( isNaN(amount) )
			return;
		this.stacks += amount;

		if( refreshTime )
			this._duration = this.duration;
		if( this.stacks > this.max_stacks ){
			this.stacks = this.max_stacks;
		}
		if( this.stacks <= 0 )
			this.remove();
		else{
			const evt = new GameEvent({
				type : GameEvent.Types.internalWrapperStackChange,
				sender : game.getPlayerById(this.caster),
				target : game.getPlayerById(this.target),
				wrapper : this,
			});
			for(let effect of this.effects)
				effect.trigger(evt);
		}
	}

	tick(){
		let a = game.getPlayerById(this.caster), t = game.getPlayerById(this.victim);
		this.useAgainst( a, t, true );
	}

	remove( expired = false ){
		
		let target = game.getPlayerById(this.victim);

		if( expired ){

			const evt = new GameEvent({
				type : GameEvent.Types.wrapperExpired,
				wrapper : this,
				sender : this.getCaster(),
				target : this.parent
			}).raise();
			evt.type = GameEvent.Types.internalWrapperExpired;
			for(let effect of this.effects)
				effect.trigger(evt);

		}

		const evt = new GameEvent({
			type : GameEvent.Types.internalWrapperRemoved,
			sender : game.getPlayerById(this.caster),
			target : target,
			wrapper : this,
			action : this.parent.constructor === Action ? this.parent : null,
		});
		for(let effect of this.effects)
			effect.trigger(evt);
		
		
		this.unbindEvents();
		if( target )
			target.removeWrapper(this);
		evt.type = GameEvent.Types.wrapperRemoved;
		evt.raise();

	}

	checkStayConditions(){
		
		if( !Condition.all(this.stay_conditions, new GameEvent({
			sender : this.getCaster(),
			target : this.parent,
			wrapper : this,
			action : this.parent.constructor === Action ? this.parent : null,
		})) )this.remove();

	}



	/* UI */
	// Returns the texture path to the icon
	getIconPath(){
		const icon = this.icon.split('.svg').shift();
		return 'media/wrapper_icons/'+esc(icon)+'.svg';
	}

	// Gets the object description, allows for some % values
	// These are escaped
	/*
		%knockdown = stomach | back
		%caster = caster name
		%target = target name
	*/
	getDescription(){
		let out = this.description;
		let knockdown = 'stomach';
		for( let effect of this.effects ){
			if( effect.type === Effect.Types.knockdown ){
				if( effect.data.type === Effect.KnockdownTypes.Back )
					knockdown = "back";
			}
		}

		const caster = this.getCaster() || new Player();
		const parent = this.parent || new Player();

		if( !caster.getColoredName )
			console.error("Caster colored name missing", caster);
		if( !parent.getColoredName )
			console.error("Parent getColoredName missing", parent);
		out = out.split('%knockdown').join(knockdown);
		out = out.split('%caster').join(caster.getColoredName());
		out = out.split('%target').join(parent.getColoredName());
		out = out.split('%S').join(caster.getColoredName());
		out = out.split('%T').join(parent.getColoredName());

		return out;

	}

	// Overrides Generic method
	getTags(){

		let tags = this.tags.slice();
		if( this.duration )
			tags.push(stdTag.wrDuration);
		if( this.detrimental )
			tags.push(stdTag.wrDetrimental);
		
		for( let effect of this.effects ){
			if( effect.type === Effect.Types.knockdown ){
				tags.push(stdTag.wrKnockdown);
				let type = stdTag.wrKnockdownFront;
				if( effect.data.type === Effect.KnockdownTypes.Back )
					type = stdTag.wrKnockdownBack;
				tags.push(type);
			}
			else if( effect.type === Effect.Types.daze )
				tags.push(stdTag.wrDazed);
			else if( effect.type === Effect.Types.grapple )
				tags.push(stdTag.wrGrapple);
			
		}

		let out = [];
		for( let tag of tags )
			out.push(tag.toLowerCase());

		return out;

	}
	


	/* Effects */
	// Filters effects, data is a filtering object where you can use:
	/*
		label : (arr/str)viable_labels,
		type : (arr/str)viable_types,
		targets : (arr/str)viable_targets,
		events : (arr/str)viable_events
	*/
	getEffects( data = {} ){
		if( typeof data !== "object" ){
			console.error("Invalid data for getEffects", data);
			return [];
		}
		function valSearch(dataVal, elArr){

			if( !Array.isArray(dataVal) )
				dataVal = [dataVal];
			
			for( let v of dataVal ){
				if( ~elArr.indexOf(v) )
					return true;
			}
			return false;

		}

		return this.effects.filter(el => {
			if( data.label && !valSearch(data.label, [el.label]) )
				return false;
			if( data.type && !valSearch(data.type, [el.type]) )
				return false;
			if( data.targets && !valSearch(data.targets, el.targets) )
				return false;
			if( data.events && !valSearch(data.events, el.events) )
				return false;
			return true;
		});
	}

	// Filters effects based on target player
	getEffectsForPlayer( player ){
		return this.effects.filter(ef => ef.affectingPlayer(player));
	}

	/* Events */
	// Handles effect events when the wrapper is added/removed
	bindEvents(){
		for(let effect of this.effects)
			effect.bindEvents();
	}
	unbindEvents(){
		for(let effect of this.effects)
			effect.unbindEvents();
	}

	onTurnStart(){

		if( this.tick_on_turn_start )
			this.tick();

		if(this.duration === -1)
			return;
		
		if( this._self_cast && --this._duration <= 0){
			this.remove( true );
		}

	}
	onTurnEnd(){

		if( this.tick_on_turn_end )
			this.tick();

		if(this.duration === -1)
			return;
		if( !this._self_cast && --this._duration <= 0){
			this.remove( true );
		}

	}
	onBattleEnd(){
		this._duration = 0;
	}

}

// Checks stay conditions, raised on turn change and after an action is used
Wrapper.checkAllStayConditions = function(){
	for( let player of game.players ){
		const wrappers = player.getWrappers();
		for( let wrapper of wrappers )
			wrapper.checkStayConditions();
	}
};

Wrapper.TARGET_AUTO = "VICTIM";				// Generated by Action. When used in a duration effect, it's the victim.
Wrapper.TARGET_CASTER = "CASTER";			// Always viable.
Wrapper.TARGET_AOE = "AOE";					// Validate against all players
Wrapper.TARGET_SMART_HEAL = "SMART_HEAL";	// Targets the lowest HP viable player
Wrapper.TARGET_EVENT_RAISER = "EVENT_RAISER";	// Used only for Effect.Types.runWrappers, targets the player that raised the event that triggered the effect
Wrapper.TARGET_EVENT_TARGETS = "EVENT_TARGETS";	// Used only for Effect.Types.runWrappers, targets the player(s) that were the targets of the event that triggered the effect
Wrapper.TARGET_ORIGINAL = "ORIGINAL";		// Used only in effects. Specifies the target of the action that triggered this. Same as AUTO except in SMART_HEAL

Wrapper.Targets = {
	none : 'none',	// used in the editor to delete a target  
	auto : Wrapper.TARGET_AUTO,
	caster : Wrapper.TARGET_CASTER,
	aoe : Wrapper.TARGET_AOE,
	smart_heal : Wrapper.TARGET_SMART_HEAL,
	event_raiser : Wrapper.TARGET_EVENT_RAISER,
	event_targets : Wrapper.TARGET_EVENT_TARGETS,
	original_target : Wrapper.TARGET_ORIGINAL
};


/*
	An effect is tied to a wrapper and actually does something, either instantly or over time based on the wrapper
*/
class Effect extends Generic{

	// Parent is always a wrapper
	// Parent of parent varies. If the wrapper is applied to a player, parent.parent is the player
	constructor(data, parent){

		super(data);
		this.parent = parent;
		this.label = '';								// Optional, can be used for events
		this.conditions = [];							// Conditions when ticking
		this.type = "";
		this.data = {};
		this.tags = [];
		this.targets = [Wrapper.TARGET_AUTO];					// Use Wrapper.TARGET_* flags for multiple targets
		this.events = [GameEvent.Types.internalWrapperTick];	// Limits triggers to certain events. Anything other than wrapper* functions require a duration wrapper parent
		
		this._bound_events = [];
		this.load(data);

	}

	save( full ){
		const out = {
			type : this.type,
			data : this.saveData(),
			tags : this.tags,
			targets : this.targets,
			label : this.label
		};

		if( full ){
			out.conditions = Condition.saveThese(this.conditions, full);
			out.events = this.events;
		}

		if( full !== "mod" ){
			out.id = this.id;
		}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}

	load(data){
		this.g_autoload(data);
	}

	// Automatically invoked after g_autoload
	rebase(){
		
		// Auto generate damage type from an ability
		if( this.parent && this.parent.parent && this.parent.parent.constructor === Action && this.type === Effect.Types.damage && typeof this.data === "object" && !this.data.type )
			this.data.type = this.parent.parent.type;

		if( !Effect.Types[this.type] )
			console.error("Unknown effect type", this.type, "in", this);

		if( this.type === Effect.Types.runWrappers && Array.isArray(this.data.wrappers) )
			this.data.wrappers = Wrapper.loadThese(this.data.wrappers, this);

		this.conditions = Condition.loadThese(this.conditions, this);		
	}

	clone(parent){
		let out = new this.constructor(this.save(true), parent);
		out.g_resetID();
		return out;
	}



	/* MAIN FUNCTIONALITY - This is where the magic happens */
	// template is the original effect if it was just added
	// otherwise it's parent
	trigger( event, template ){

		let evt = event.clone();
		evt.effect = this;
		evt.wrapper = this.parent;

		if( !this.validateConditions(evt) )
			return;
	
		let sender = game.getPlayerById(this.parent.caster),
			target = game.getPlayerById(this.parent.victim)
		;
		let tout = [];
		for( let ta of this.targets ){
			if( ta === Wrapper.TARGET_AUTO ){
				tout.push(target);
			}
			else if( ta === Wrapper.TARGET_CASTER )
				tout.push(sender);
			else if( ta === Wrapper.TARGET_EVENT_RAISER && event.sender )
				tout.push(event.sender);
			else if( ta === Wrapper.TARGET_EVENT_TARGETS && event.target )
				tout = tout.concat(event.target);
		}

		new GameEvent({
			type : GameEvent.Types.effectTrigger,
			sender : sender,
			target : tout,
			wrapper : this.parent,
			effect : this,
		}).raise();

		for( let t of tout ){

			// If the target is the sender, then it flipflops
			// ApplyWrapper already supports custom logic for targets
			let s = sender;
			if( t === sender ){
				s = target;
			}
			
			// Do damage or heal
			if( this.type === Effect.Types.damage ){

				let type = this.data.type;
				if( !type && this.parent.parent.constructor === Action )
					type = this.parent.parent.type;
				
				let e = GameEvent.Types.damageDone, e2 = GameEvent.Types.damageTaken;
				let amt = -Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;

				// Healing
				if( amt > 0 ){

					e = GameEvent.Types.healingDone;
					e2 = GameEvent.Types.healingTaken;
					// Holy arousal purging
					if( type === Action.Types.holy ){

						// 30% chance per point of healing
						let ch = Math.abs(amt*30);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot && t.arousal ){

							t.addArousal(-tot);
							game.ui.addText( t.getColoredName()+" lost "+Math.abs(tot)+" arousal from holy healing.", undefined, s.id, t.id, 'statMessage arousal' );
							amt += tot;	// Holy healing converts arousal into HP

						}

					}

					
				}
				// Damage
				else{
					
					/*
					console.debug(
						"input", amt, 
						"bonus multiplier", Player.getBonusDamageMultiplier( s,t,this.data.type,this.parent.detrimental),
						"global defensive mods", t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s ), t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s ),
						"global attack mods", s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t ), s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t ),
						"nudity multi", t.getNudityDamageMultiplier(),
						"corruption multi", t.getCorruptionDamageMultiplier()
					);
					*/
					
					
					amt *= Player.getBonusDamageMultiplier( s,t,this.data.type,this.parent.detrimental ); // Negative because it's damage
					
					// Get target global damage point taken modifier
					// Amt is negative
					amt -= t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s );
					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s );

					// amt is negative when attacking, that's why we use - here
					amt -= s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t );
					amt *= s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t );

					amt *= t.getNudityDamageMultiplier();
					// Corruption bonus is added here
					if( type === Action.Types.corruption )
						amt *= t.getCorruptionDamageMultiplier();

					
					let base = Math.floor(amt);
					// Dangling point gets randomized
					if( Math.random() <= amt-base )
						++base;
					amt = base;
					if( amt > 0 )
						amt = 0;

					// Calculate durability damage				
					if( type === Action.Types.physical ){

						let ch = amt*10;
						ch = Math.abs(ch);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot )
							t.damageDurability(s, this, tot, "RANDOM");
							
					}

					// AP Damage
					if( type === Action.Types.elemental && t.ap ){
						// 10% chance per point of damage, max 1
						let ch = Math.abs(amt*10);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot ){
							tot = Math.min(1, tot);
							t.addAP(-tot);
							game.ui.addText( t.getColoredName()+" lost "+Math.abs(tot)+" AP from elemental damage.", undefined, s.id, t.id, 'statMessage AP' );
						}
					}

				}

				// Calculate arousal (allowed for both healing and damaging)
				if( type === Action.Types.corruption && t.arousal < t.getMaxArousal() ){

					// 20% chance per point of damage
					let ch = Math.abs(amt*20);
					let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
					if( tot ){

						t.addArousal(tot);
						game.ui.addText( t.getColoredName()+" gained "+Math.abs(tot)+" arousal from corruption.", undefined, s.id, t.id, 'statMessage arousal' );

					}

				}

				
				
				let died = t.addHP(amt, s, this);
				if( amt < 0 ){

					t.onDamageTaken(s, this.data.type, Math.abs(amt));
					s.onDamageDone(t, this.data.type, Math.abs(amt));
					let threat = amt * (!isNaN(this.data.threatMod) ? this.data.threatMod : 1);
					let leech = !isNaN(this.data.leech) ? Math.abs(Math.round(amt*this.data.leech)) : 0;
					t.addThreat( s.id, -threat );
					game.ui.addText( t.getColoredName()+" took "+Math.abs(amt)+" "+this.data.type+" damage"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage damage' );
					if( leech ){
						s.addHP(leech);
						game.ui.addText( s.getColoredName()+" leeched "+leech+" HP.", undefined, s.id, t.id, 'statMessage healing' );
					}

				}else if(amt > 0){
					game.ui.addText( t.getColoredName()+" gained "+amt+" HP"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage healing' );
				}



				new GameEvent({
					type : e,
					sender : s,
					target : t,
					wrapper : this.parent,
					effect : this,
				}).raise();
				

				new GameEvent({
					type : e2,
					sender : s,
					target : t,
					wrapper : this.parent,
					effect : this,
				}).raise();
				if( died )
					new GameEvent({
						type : GameEvent.Types.playerDefeated,
						sender : s,
						target : t,
						wrapper : this.parent,
						effect : this
					}).raise();
			}

			else if( this.type === Effect.Types.addAP ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;
				game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" AP"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage AP' );
				t.addAP(amt);
			}

			else if( this.type === Effect.Types.addMP ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;
				game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" MP"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage MP' );
				t.addMP(amt);
			}

			else if( this.type === Effect.Types.addArousal ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;
				let pre = t.arousal;
				t.addArousal(amt);
				amt = t.arousal-pre;
				
				if( amt )
					game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage arousal' );
				
			}


			else if( this.type === Effect.Types.addThreat ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;
				t.addThreat(s.id, amt);
			}

			else if( this.type === Effect.Types.punishmentUsed )
				t.used_punish = true;

			// End turn
			else if( this.type === Effect.Types.endTurn )
				game.end_turn_after_action = true;


			else if( this.type === Effect.Types.hitfx ){

				let origin = [s], destination = [t];
				if( this.data.origin )
					origin = this.getTargetsByType( this.data.origin, event );
				if( this.data.destination )
					destination = this.getTargetsByType( this.data.destination, event );
				for( let dest of destination ){
					for( let o of origin )
						game.renderer.playFX( o, dest, this.data.id, undefined, true );
				}

			}
			else if( this.type === Effect.Types.runWrappers ){
				let wrappers = this.data.wrappers;
				if( !Array.isArray(wrappers) ){
					console.error("Effect data in wrapper ", this.parent, "tried to run wrappers, but wrappers are not defined in", this);
					return;
				}
				
				for( let w of this.data.wrappers ){

					let wrapper = new Wrapper(w, this.parent.parent);
					wrapper.useAgainst(s, t, false);

				}

			}

			else if( this.type === Effect.Types.disrobe ){

				let slots = this.data.slots;
				if( typeof slots !== "string" && !Array.isArray(slots) )
					slots = [Asset.Slots.upperbody, Asset.Slots.lowerbody];
					
				if( !Array.isArray(slots) )
					slots = [slots];
				let max = this.data.numSlots;
				let equipped = t.getEquippedAssetsBySlots( slots, false );
				if( !equipped.length )
					return;

				let remove = equipped;
				if( !isNaN(max) ){
					shuffle(equipped);
					remove = equipped.slice(0, max);
				}
				for( let asset of remove ){
					if(t.unequipAsset(asset.id)){
						if( asset.loot_sound )
							game.playFxAudioKitById(asset.loot_sound, s, t, undefined, true );
						game.ui.addText( t.getColoredName()+"'s "+asset.name+" was unequipped"+(this.parent.name ? ' by '+s.getColoredName() : '')+".", undefined, t.id, t.id, 'statMessage important' );
					}
				}

			}

			else if( this.type === Effect.Types.removeParentWrapper ){
				this.parent.remove();
			}

			else if( this.type === Effect.Types.removeWrapperByLabel ){
				let label = this.data.label;
				if( !Array.isArray(label) )
					label = [label];
				let wrappers = t.wrappers.slice();		// Use temporary wrappers only
				for( let wrapper of wrappers ){
					if(
						~label.indexOf(wrapper.label) &&
						(!this.data.casterOnly || wrapper.caster === s.id)
					)wrapper.remove();					
				}
			}

			else if( this.type === Effect.Types.removeWrapperByTag ){
				let tags = this.data.tag;
				if( !Array.isArray(tags) )
					tags = [tags];
				let wrappers = t.wrappers.slice();		// Use temporary wrappers only
				for( let wrapper of wrappers ){
					if(
						label.hasTag(tags) &&
						(!this.data.casterOnly || wrapper.caster === s.id)
					)wrapper.remove();					
				}
			}

			else if( this.type === Effect.Types.addStacks ){
				// {stacks:(int)(str)stacks, effect:(str)effectLabel(undefined=this.parent), casterOnly:(bool)=true}
				let wrappers = [this.parent];
				let stacks = this.data.stacks;
				let refreshTime = this.data.refreshTime;
				if( isNaN(stacks) )
					stacks = 1;

				if( refreshTime === undefined )
					refreshTime = stacks > -1;
				
				if( this.data.effectName ){
					wrappers = [];
					let w = t.getWrappers();
					let casterOnly = this.data.casterOnly;
					if( casterOnly === undefined )
						casterOnly = true;

					for( let wr of w ){
						if( wr.label === this.data.effectName && (!this.data.casterOnly || wr.caster === s.id) )
							wrappers.push(wr);
					}
				}

				for( let w of wrappers )
					w.addStacks(stacks, refreshTime);

			}

			else if( this.type === Effect.Types.activateCooldown ){
				t.activeCooldowns(this.data.actions);
			}

			else if( this.type === Effect.Types.addActionCharges ){
				t.addActionCharges(this.data.actions, Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				})));
			}

			else if( this.type === Effect.Types.knockdown ){
				if( isNaN(this.data.type) )
					this.data.type = Math.floor(Math.random()*2);
				if( !this.data.ini ){
					let text = "knocked down on their "+(this.data.type === Effect.KnockdownTypes.Forward ? 'stomach' : 'back');
					game.ui.addText( t.getColoredName()+" was "+text+".", undefined, t.id, t.id, 'statMessage' );
					this.data.ini = true;
				}
			}

			else if( this.type === Effect.Types.grapple ){
				if( !this.data.ini ){
					game.ui.addText( t.getColoredName()+" was grappled!", undefined, t.id, t.id, 'statMessage' );
					this.data.ini = true;
				}
			}

			else if( this.type === Effect.Types.damageArmor ){
				// {amount:(str)(nr)amount,slots:(arr)(str)types,max_types:(nr)max=ALL}
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				amt *= this.parent.stacks;
				if( !amt )
					continue;

				let slots = this.data.slots;
				if( !slots )
					slots = [Asset.Slots.upperbody, Asset.Slots.lowerbody];
				if( !Array.isArray(slots) )
					slots = [slots];

				if( !isNaN(this.data.max_types) ){
					// Pick some at random
					shuffle(slots);
					slots = slots.slice(0,this.data.max_types);
				}

				let assets = t.getEquippedAssetsBySlots(slots);
				for( let asset of assets )
					asset.damageDurability(s, this, amt);

			}

			else if( this.type === Effect.Types.flee ){
				game.attemptFleeFromCombat( s );
			}

			// Unlike the above one, this will present the caster with an asset picker of damaged gear on the target
			else if( this.type === Effect.Types.repair ){
				let np = this.parent.netPlayer;
				if( np )
					game.net.dmDrawRepair(np, s, t, template.parent );
				else
					game.ui.drawRepair(s, t, template.parent );		// Supply the original effect since it has the proper parent. When cloned, parent always becomes the victim player
			}
			
			else if( this.type === Effect.Types.interrupt )
				t.interrupt(s);

			else if( this.type === Effect.Types.removeEffectWrapperByEffectTag ){

				
				let effects = t.getEffects();
				for( let effect of effects ){
					if( effect.hasTag(this.data.tag) ){
						effect.parent.remove();
						effects = t.getEffects();
					}
				}

			}

			else if( this.type === Effect.Types.addMissingFxTag ){

				const tags = t.getTags();
				let mTags = this.data.tag;
				if( typeof mTags === "string" )
				mTags = [mTags];
				if( !Array.isArray(mTags) )
					return console.error("Trying to run addMissingFxTag, but data.tag is not set", this);
					
				const mapTag = tag => {
					if( typeof tag !== "string" )
						console.error("Found a non string tag in addMissingFxTag, tag was ", tag, "fx was", this);
					return tag.toLowerCase();
				};
				mTags = mTags.map(mapTag);
				let viable = [];
				
				for( let tag of mTags ){
					if( tags.indexOf(tag) === -1 )
						viable.push(tag);
				}
				shuffle(viable);
				const max = this.data.max > 0 ? +this.data.max : 1;
				viable = viable.slice(0, max);
				this.tags = this.tags.concat(viable);

			}

			else if( this.type === Effect.Types.addExposedOrificeTag ){

				const tEvent = new GameEvent({
					target : t
				});
				const viable = [];
				// These 2 should match each other
				let conds = ['targetButtExposedAndUnblocked','targetMouthExposedAndUnblocked','targetVaginaExposedAndUnblocked'];
				if( this.data.relax === "notHard" )
					conds = ['targetButtUnblockedAndNotHard','targetMouthUnblockedAndNotHard','targetVaginaUnblockedAndNotHard'];
				else if( this.data.relax === "all" )
					conds = [false, false, false];
				conds = Condition.loadThese(conds);
				const tags = [stdTag.wrBlockButt, stdTag.wrBlockMouth, stdTag.wrBlockGroin];
				for( let i =0; i<conds.length; ++i ){
					if( !conds[i] || conds[i].test(tEvent) )
						viable.push(tags[i]);
				}
				this.tags.push(randElem(viable));

			}

			// LAST
			else if( typeof this.type !== "string" )
				console.error("Invalid effect", this.type);


		}

		
		
	}





	/* EVENT */
	bindEvents(){
		for(let evt of this.events){
			if( evt.substr(0,8) !== "internal" )
				this._bound_events.push(GameEvent.on(evt, event => this.trigger(event)));
		}
	}
	unbindEvents(){
		for(let evt of this._bound_events)
			GameEvent.off(evt);
	}
	

	
	/* CONDITIONS */
	validateConditions( event ){

		if( this.events.length && this.events.indexOf(event.type) === -1 )
			return false;

		// If the condition is an array, it's ORed
		// That should do for now
		for( let condition of this.conditions ){

			if( !Condition.all(condition, event) )
				return false;

		}

		return true;

	}

	

	/* Utilities */
	flattenArray( arr ){
		let out = [];
		for( let obj of arr ){
			if( Array.isArray(obj) )
				out.push(this.flattenArray(obj));
			else
				out.push(this.flattenObject(obj));
		}
		return out;
	}

	flattenObject( input ){
		if( !input || typeof input.save !== "function" )
			return input;
		return input.save(true);
	}

	// Attempts to get a target by wrapper.target type
	getTargetsByType( type, event ){

		if( type === Wrapper.Targets.aoe )
			return game.players;
		if( type === Wrapper.Targets.caster )
			return [game.getPlayerById(this.parent.caster)];
		if( type === Wrapper.Targets.event_raiser )
			return [event.sender];
		if( type === Wrapper.Targets.event_targets )
			return [event.target];
		if( type === Wrapper.Targets.original_target ){
			return [game.getPlayerById(this.parent.original_target)];
		}
		// Anything else returns the victim
		return [game.getPlayerById(this.parent.victim)];
	}

	// Exports effect data in a JSON safe way
	saveData(){
		let out = {};
		for( let i in this.data ){
			if( Array.isArray(this.data[i]) )
				out[i] = this.flattenArray(this.data[i]);
			else
				out[i] = this.flattenObject(this.data[i]);
		}
		return out;
	}

	// Helper function for getting a repair value. Used in Asset.js
	getRepairValue(asset, s,t){

		let amt = Calculator.run(
			this.data.amount, 
			new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
		}));
		if( this.data.multiplier )
			amt *= asset.getMaxDurability();
		if( amt < this.data.min )
			amt = this.data.min;
		amt *= this.parent.stacks;
		return Math.ceil(amt);

	}

	// Checks if target is affecting a specific player
	affectingPlayer( player ){
		if(
			(~this.targets.indexOf(Wrapper.Targets.auto) && this.parent.victim === player.id) ||
			(~this.targets.indexOf(Wrapper.Targets.caster) && this.parent.caster === player.id) ||
			~this.targets.indexOf(Wrapper.Targets.aoe)
		){
			// Check conditions
			return Condition.all(this.conditions, new GameEvent({
				sender : this.parent.parent,		// Sender in this case is the person who has the wrapper
				target : player,					// Target in this case is the target of the effect
				wrapper : this.parent,
				effect : this
			}));
		}
		return false;
	}
	

}

Effect.createStatBonus = function( type, bonus ){
	return new Effect({
		type : type,
		data : {amount:bonus}
	});
};


// These are the actual effect types that the game runs off of
Effect.Types = {
	none : 'none',
	damage : "damage",
	endTurn : "endTurn",
	//visual : "visual",
	hitfx : "hitfx",
	damageArmor : "damageArmor",
	addAP : "addAP",			
	addMP : "addMP",			
	addArousal : "addArousal",	
	interrupt : "interrupt",				
	globalHitChanceMod : 'globalHitChanceMod',
	globalDamageTakenMod : 'globalDamageTakenMod',
	globalDamageDoneMod : 'globalDamageDoneMod',
	
	addActionCharges : 'addActionCharges',		

	// Stamina
	staminaModifier : "staminaModifier",		
	// Agility
	agilityModifier : "agilityModifier",		
	// Intellect
	intellectModifier : "intellectModifier",	

	svPhysical : 'svPhysical',				
	svElemental : 'svElemental',			
	svHoly : 'svHoly',						
	svCorruption : 'svCorruption',			

	bonPhysical : 'bonPhysical',			
	bonElemental : 'bonElemental',			
	bonHoly : 'bonHoly',					
	bonCorruption : 'bonCorruption',		

	runWrappers : "runWrappers",			

	disrobe : "disrobe",					

	addStacks : 'addStacks',				
	removeParentWrapper : 'removeParentWrapper',	
	removeWrapperByLabel : 'removeWrapperByLabel',	
	removeWrapperByTag : 'removeWrapperByTag',
	removeEffectWrapperByEffectTag : 'removeEffectWrapperByEffectTag',

	activateCooldown : 'activateCooldown',			

	knockdown : 'knockdown',						
	grapple : 'grapple',						
	daze : 'daze',									

	repair : 'repair',								
	flee : 'flee',									
	addThreat : 'addThreat',						
	punishmentUsed : 'punishmentUsed',				

	stun : 'stun',									
	taunt : 'taunt',	
	addActions : 'addActions',	// handled in Player
	addMissingFxTag : 'addMissingFxTag',
	addExposedOrificeTag : 'addExposedOrificeTag',
};

Effect.KnockdownTypes = {
	Forward : 0,
	Back : 1,
};


Effect.TypeDescs = {
	[Effect.Types.damage] : "{amount:(str)formula, type:(str)Action.Types.x, leech:(float)leech_multiplier} - If type is left out, it can be auto supplied by an asset",
	[Effect.Types.endTurn] : "void - Ends turn",
	//[Effect.Types.visual] : "CSS Visual on target. {class:css_class}",
	[Effect.Types.hitfx] : "Trigger a hit effect on target. {id:effect_id[, origin:(str)targ_origin, destination:(str)targ_destination]}",
	[Effect.Types.damageArmor] : "{amount:(str)(nr)amount,slots:(arr)(str)types,max_types:(nr)max=ALL} - Damages armor. Slots are the target slots. if max_types is a number, it picks n types at random", 
	[Effect.Types.addAP] : "{amount:(str)(nr)amount}, Adds AP",										// 
	[Effect.Types.addMP] : "{amount:(str)(nr)amount}, Adds MP",										// 
	[Effect.Types.addArousal] : "{amount:(str)(nr)amount} - Adds arousal points",								// 
	[Effect.Types.interrupt] : "void - Interrupts all charged actions",								// 
	[Effect.Types.globalHitChanceMod] : 'Modifies your hit chance with ALL types by percentage {amount:(float)(string)amount}',
	[Effect.Types.globalDamageTakenMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage dealt from the caster', 
	[Effect.Types.globalDamageDoneMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage done to the caster',
	
	[Effect.Types.addActionCharges] : 'addActionCharges',					// {amount:(nr/str)amount, }

	// Stamina
	[Effect.Types.staminaModifier] : '{amount:(int)amount}',
	// Agility
	[Effect.Types.agilityModifier] : '{amount:(int)amount}',
	// Intellect
	[Effect.Types.intellectModifier] : '{amount:(int)amount}',

	[Effect.Types.svPhysical] :  '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.svElemental] :  '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.svHoly] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.svCorruption] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',

	[Effect.Types.bonPhysical] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.bonElemental] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.bonHoly] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.bonCorruption] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',

	[Effect.Types.runWrappers] : '{wrappers:(arr)wrappers} - Runs wrappers. Auto target is victim, or caster if effect caster property is true. ',

	[Effect.Types.disrobe] : '{slots:(arr)(str)Asset.Slots.*, numSlots:(int)max_nr=all}',

	[Effect.Types.addStacks] : '{stacks:(int)(str)stacks, effect:(str)effectWrapper(undefined=this.parent), casterOnly:(bool)=true, refreshTime=(bool)=auto} - If refreshTime is unset, it reset the time when adding, but not when removing stacks',
	[Effect.Types.removeParentWrapper] : 'void - Removes the effect\'s parent wrapper',
	[Effect.Types.removeWrapperByLabel] : '{ label:(arr)(str)label, casterOnly:(bool)=false)}',
	[Effect.Types.removeWrapperByTag] : '{tag:(str/arr)tags}',
	[Effect.Types.removeEffectWrapperByEffectTag] : '{tag:(str/arr)tags} - Searches for _effects_ currently affecting you. And removes their wrappers if the effect has at least one of these tags.',

	[Effect.Types.activateCooldown] : '{actions:(str)(arr)actionLabels} - Activates cooldowns for learned abilities with actionLabels',

	[Effect.Types.knockdown] : '{type:(int)type} - Use Effect.KnockdownTypes. If not an int it becomes boolean backwards of forwards',
	[Effect.Types.grapple] : '{}',
	[Effect.Types.daze] : 'void',

	[Effect.Types.repair] : '{amount:(int)(str)(float)amount, multiplier:(bool)is_multiplier, min:(int)minValue}',
	[Effect.Types.flee] : 'void - Custom action sent to server to flee combat',
	[Effect.Types.addThreat] : '{amount:(str/nr)amount} - Generates threat on the target',
	[Effect.Types.punishmentUsed] : 'void - Sets the punishment used flag on the target to prevent them from using further punishments',

	[Effect.Types.stun] : '{ignoreDiminishing:(bool)=false}',
	[Effect.Types.taunt] : '{victim:(bool)} - If victim is true, it makes the victim the target of the taunt. Useful for when a player gets "marked", like in the cocktopus spell.',

	[Effect.Types.addActions] : '{actions:(str/arr)actions} - Unlocks specified actions while you\'re under the effect of this',
	[Effect.Types.none] : 'Void. You probably only want to use this if you want an effect that adds tags but nothing else',
	[Effect.Types.addMissingFxTag] : '{tag:(str/arr)tags, max:(int)=1} - Adds one or more tags to this Effect that the target doesn\'t have.',
	[Effect.Types.addExposedOrificeTag] : '{relax:(str)"notHard"/"all"} - Similar to above, but it checks availability and exposed status of stdTag.wrBlockGroin, wrBlockButt, wrBlockMouth, and adds one of them. Useful for latching that should occupy a slot. Checks for exposed by default, but you can also limit it to non-hard armor or no limits.',

};


export {Wrapper, Effect};