import Generic from './helpers/Generic.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import stdTag from '../libraries/stdTag.js';
import Action from './Action.js';
import Calculator from './Calculator.js';
import Player from './Player.js';
import Game from './Game.js';

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
		this.add_conditions = [];				// 
		this.stay_conditions = [];
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
		this._duration = 0; 
		this._self_cast = false;		// This effect was placed on the caster by the caster


		this.load(data);
	}

	// Data that should be saved to drive
	save( full ){
		const out = {
			id : this.id,
			name : this.name,
			description : this.description,
			icon : this.icon,
			detrimental : this.detrimental,
			victim : this.victim,
			caster : this.caster,
			target : this.target,
			add_conditions : Condition.saveThese(this.add_conditions, full),
			stay_conditions : Condition.saveThese(this.stay_conditions, full),
			effects : this.effects.map(el => el.save(full)),
			_duration : this._duration,
			tags : this.tags,
			stacks : this.stacks,
		};

		if( full ){
			out.tick_on_turn_end = this.tick_on_turn_end;
			out.tick_on_turn_start = this.tick_on_turn_start;
			out.label = this.label;
			out._self_cast = this._self_cast;
			out.max_stacks = this.max_stacks;
			out.netPlayer = this.netPlayer;
			out.trigger_immediate = this.trigger_immediate;
			out.duration = this.duration;
		}

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
		this.effects = this.effects.map(el => {
			if( typeof el !== "object" )
				console.error("Invalid Effect loaded to Wrapper: ", el);
			return new Effect(el, this);
		});	

		this.tags = this.tags.slice();
	}

	clone(parent){
		let out = new this.constructor(this.save(true), parent);
		out.g_resetID();
		out.template_id = this.id;
		//out.effects = out.effects.map(el => el.clone(out));
		//console.log("Cloned effects", out.effects);
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

	useAgainst( caster_player, player, isTick, isChargeFinish = false, netPlayer ){
		
		let pl = [game.getPlayerById(this.victim)];
		
		// If this effect isn't yet applied, we need to apply it against multiple players if target is an override
		if( !isTick ){
			
			if( this.target === Wrapper.TARGET_CASTER )
				pl = [this.parent.parent];
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
			// This was just added, and not a tick
			if( !isTick ){

				// Need to clone and setup victim and caster
				obj = this.clone(p);	// Parent becomes a player, since the player now directly owns the wrapper
				obj.victim = p.id;
				obj.caster = caster_player.id;
				obj.netPlayer = netPlayer;

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

				// Remove any existing effects with the same label
				for( let wrapper of p.wrappers ){
					if( wrapper.label === obj.label && wrapper.caster === caster.id ){
						let stacks = wrapper.stacks;
						wrapper.remove();
						obj.stacks += stacks;
						obj.stacks = Math.max(1, Math.min(obj.stacks, obj.max_stacks));
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
				
			}

			// Run immediate
			if( !obj.duration || isTick || obj.trigger_immediate ){

				let evt = new GameEvent({
					type : GameEvent.Types.internalWrapperTick,
					sender : caster,
					target : victim,
					wrapper : obj,
				});
				for( let effect of obj.effects )
					effect.trigger(evt, this);

				// raise a global event
				evt.type = GameEvent.Types.wrapperTick;
				evt.raise();

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
			new GameEvent({
				type : GameEvent.Types.internalWrapperStackChange,
				sender : game.getPlayerById(this.caster),
				target : game.getPlayerById(this.target),
				wrapper : this,
			});
		}
		if( this.stacks <= 0 )
			this.remove();
	}

	tick(){
		let a = game.getPlayerById(this.caster), t = game.getPlayerById(this.victim);
		this.useAgainst( a, t, true );
	}

	remove(){
		let target = game.getPlayerById(this.victim);
		let evt = new GameEvent({
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




	/* UI */
	// Returns the texture path to the icon
	getIconPath(){
		return 'media/wrapper_icons/'+esc(this.icon);
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
		let knockdown = '';
		for( let effect of this.effects ){
			if( effect.type === Effect.Types.knockdown ){
				knockdown = effect.data.forwards ? 'stomach' : 'back';
			}
		}

		out = out.split('%knockdown').join(knockdown);
		out = out.split('%caster').join(this.getCaster().name);
		out = out.split('%target').join(this.parent.name);

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
				tags.push(effect.data.forwards ? stdTag.wrKnockdownFront : stdTag.wrKnockdownBack);
			}
			else if( effect.type === Effect.Types.daze )
				tags.push(stdTag.wrDazed);
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
			this.remove();
		}

	}
	onTurnEnd(){

		if( this.tick_on_turn_end )
			this.tick();

		if(this.duration === -1)
			return;
		if( !this._self_cast && --this._duration <= 0){
			this.remove();
		}

	}
	onBattleEnd(){
		this._duration = 0;
	}

}

Wrapper.TARGET_AUTO = "VICTIM";				// Generated by Action. When used in a duration effect, it's the victim.
Wrapper.TARGET_CASTER = "CASTER";			// Always viable.
Wrapper.TARGET_AOE = "AOE";					// Validate against all players
Wrapper.TARGET_SMART_HEAL = "SMART_HEAL";	// Targets the lowest HP viable player
Wrapper.TARGET_EVENT_RAISER = "EVENT_RAISER";	// Used only for Effect.Types.runWrappers, targets the player that raised the event that triggered the effect
Wrapper.TARGET_EVENT_TARGETS = "EVENT_TARGETS";	// Used only for Effect.Types.runWrappers, targets the player(s) that were the targets of the event that triggered the effect



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
		this.targets = [Wrapper.TARGET_AUTO];					// Use Wrapper.TARGET_* flags for multiple targets
		this.events = [GameEvent.Types.internalWrapperTick];	// Limits triggers to certain events. Anything other than wrapper* functions require a duration wrapper parent
		
		this._bound_events = [];
		this.load(data);

	}

	save( full ){
		const out = {
			id : this.id,
			type : this.type,
			data : this.saveData(),
		};
		if( full ){
			out.conditions = Condition.saveThese(this.conditions, full);
			out.targets = this.targets;
			out.events = this.events;
			out.label = this.label;
		}
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
			console.error("Unknown effect type", this.type);

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
		let custom = {};	// Custom data to push to the event
		


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
				else{
					
					/*
					console.log(
						"input", amt, 
						"bonus multiplier", Player.getBonusDamageMultiplier( s,t,this.data.type,Math.abs(amt),this.parent.detrimental),
						"global defensive mods", t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s ), t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s ),
						"global attack mods", s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t ), s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t ),
						"nudity multi", t.getNudityDamageMultiplier(),
						"corruption multi", t.getCorruptionDamageMultiplier()
					);
					*/
					
					amt *= Player.getBonusDamageMultiplier( s,t,this.data.type,Math.abs(amt),this.parent.detrimental ); // Negative because it's damage
					
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
						game.ui.addText( t.getColoredName()+" gained "+Math.abs(tot)+" arousal from corruption damage.", undefined, s.id, t.id, 'statMessage arousal' );

					}

				}

				
				
				let died = t.addHP(amt);
				
				if( amt < 0 ){
					let threat = amt * (!isNaN(this.data.threatMod) ? this.data.threatMod : 1);
					let leech = !isNaN(this.data.leech) ? Math.abs(Math.round(amt*this.data.leech)) : 0;
					t.addThreat( s.id, -threat );
					game.ui.addText( t.getColoredName()+" took "+Math.abs(amt)+" "+this.data.type+" damage"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage damage' );
					if( leech ){
						s.addHP(leech);
						game.ui.addText( s.getColoredName()+" leeched "+leech+" HP.", undefined, s.id, t.id, 'statMessage healing' );
					}
				}else{
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
				game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage arousal' );
				t.addArousal(amt);
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

			// Visual FX
			else if( this.type === Effect.Types.visual )
				game.ui.setPlayerVisual(t, this.data.class);

			else if( this.type === Effect.Types.runWrappers ){
				let wrappers = this.data.wrappers;
				if( !Array.isArray(wrappers) ){
					console.error("Effect data in wrapper ", this.parent, "tried to run wrappers, but wrappers are not defined in", this);
					return;
				}
				
				//console.log("Running wrappers", this.data.wrappers, "on", t);
				for( let w of this.data.wrappers ){

					let wrapper = new Wrapper(w, this.parent.parent);
					wrapper.useAgainst(s, t, false);

				}

			}

			else if( this.type === Effect.Types.disrobe ){

				let slots = this.data.slots;
				if( typeof slots !== "string" && !Array.isArray(slots) )
					return;
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
				let wrappers = t.wrappers;		// Use temporary wrappers only
				for( let wrapper of wrappers ){
					if(
						~label.indexOf(wrapper.label) &&
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
				if( typeof this.data.forwards !== "boolean" ){
					this.data.forwards = Math.random() < 0.5 ? true : false;
				}
				if( !this.data.ini ){
					game.ui.addText( t.getColoredName()+" was knocked down on their "+(this.data.forwards ? 'stomach' : 'back')+".", undefined, t.id, t.id, 'statMessage' );
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

			// LAST
			else if( typeof this.type !== "string" )
				console.error("Invalid effect", this.type);


		}

		new GameEvent({
			type : GameEvent.Types.effectTrigger,
			sender : sender,
			target : tout,
			wrapper : this.parent,
			effect : this,
			custom : custom
		}).raise();
		
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
	

}

Effect.createStatBonus = function( type, bonus ){
	return new Effect({
		type : type,
		data : {amount:bonus}
	});
};


// These are the actual effect types that the game runs off of
Effect.Types = {
	damage : "damage",		// {amount:(str)formula, type:(str)Action.Types.x, leech:(float)leech_multiplier} - If type is left out, it can be auto supplied by an asset
	endTurn : "endTurn",
	visual : "visual",							// CSS Visual on target. {class:css_class}
	damageArmor : "damageArmor",							// {amount:(str)(nr)amount,slots:(arr)(str)types,max_types:(nr)max=ALL} - Damages armor. Slots are the target slots. if max_types is a number, it picks n types at random  
	addAP : "addAP",										// {amount:(str)(nr)amount}, Adds AP
	addMP : "addMP",										// {amount:(str)(nr)amount}, Adds MP
	addArousal : "addArousal",								// {amount:(str)(nr)amount} - Adds arousal points
	interrupt : "interrupt",								// void - Interrupts all charged actions
	globalHitChanceMod : 'globalHitChanceMod',				// Modifies your hit chance with ALL types by percentage {amount:(float)(string)amount}
	globalDamageTakenMod : 'globalDamageTakenMod',			// {amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier, casterOnly:(bool)limit_to_caster} - If casterOnly is set, it only affects damage dealt from the caster
	globalDamageDoneMod : 'globalDamageDoneMod',			// == || ==
	
	addActionCharges : 'addActionCharges',					// {amount:(nr/str)amount, }

	// Stamina
	staminaModifier : "staminaModifier",					// Adds or subtracts max HP by 2 per point {amount:(int)amount}
	// Agility
	agilityModifier : "agilityModifier",					// Adds or subtracts max AP by 1 per point {amount:(int)amount}
	// Intellect
	intellectModifier : "intellectModifier",				// Adds or subtracts max MP by 1 per point {amount:(int)amount}

	svPhysical : 'svPhysical',					// {amount:(int)(str)amount, multiplier:(bool)is_multiplier}, Save vs physical damage/arousal. Grants a 5% chance to resist a spell type based on the caster's level
	svElemental : 'svElemental',				// 
	svHoly : 'svHoly',						// 
	svCorruption : 'svCorruption',				// Generally magically pleasuring attacks

	bonPhysical : 'bonPhysical',				// Bonus hit chance in physical combat, this value is added to your level
	bonElemental : 'bonElemental',				// 
	bonHoly : 'bonHoly',						// 
	bonCorruption : 'bonCorruption',			// 

	runWrappers : "runWrappers",					// Runs wrappers. Auto target is victim, or caster if effect caster property is true. {wrappers:(arr)wrappers} 

	disrobe : "disrobe",						// {slots:(arr)(str)Asset.Slots.*, numSlots:(int)max_nr=all}

	addStacks : 'addStacks',						// {stacks:(int)(str)stacks, effect:(str)effectWrapper(undefined=this.parent), casterOnly:(bool)=true, refreshTime=(bool)=auto} - If refreshTime is unset, it reset the time when adding, but not when removing stacks
	removeParentWrapper : 'removeParentWrapper',	// void - Removes the effect's parent wrapper
	removeWrapperByLabel : 'removeWrapperByLabel',	// { label:(arr)(str)label, casterOnly:(bool)=false)}

	activateCooldown : 'activateCooldown',			// {actions:(str)(arr)actionLabels} - Activates cooldowns for learned abilities with actionLabels

	knockdown : 'knockdown',						// {forwards:(bool)fwd} - If forwards is true, it's on stomach, false = back, nonboolean will be randomized when the effect event runs
	daze : 'daze',									// void

	repair : 'repair',								// {amount:(int)(str)(float)amount, multiplier:(bool)is_multiplier, min:(int)minValue}
	flee : 'flee',									// void - Custom action sent to server to flee combat
	addThreat : 'addThreat',								// {amount:(str/nr)amount} - Generates threat on the target
	punishmentUsed : 'punishmentUsed',				// void - Sets the punishment used flag on the target to prevent them from using further punishments

	stun : 'stun',									// void
	taunt : 'taunt',								// void

};



export {Wrapper, Effect};