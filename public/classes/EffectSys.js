import Generic from './helpers/Generic.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import stdTag from '../libraries/stdTag.js';
import Action from './Action.js';
import Calculator from './Calculator.js';
import Player from './Player.js';
import Asset from './Asset.js';
import GameAction from './GameAction.js';
import Encounter from './Encounter.js';
import Game from './Game.js';

/*
	A wrapper is a container for multiple effects
	Wrappers can have a duration or one offs
*/
class Wrapper extends Generic{

	
	static getRelations(){
		return {
			add_conditions : Condition,
			stay_conditions : Condition,
			effects : Effect,
		};
	}

	// Parent is the owner of this wrapper, such as an action, asset, or player
	constructor(data, parent){
		super(data);

		this.parent = parent;
		this.label = '';					// A unique identifier
		this.target = Wrapper.TARGET_AUTO;	// target constants
		this.add_conditions = ["senderNotDead","targetNotDead"];			// Conditions needed to add
		this.stay_conditions = ["senderNotDead","targetNotDead"];			// Conditions needed to stay. These are checked at the end of turn end/start, and after an action is used
		this.effects = [];
		this.duration = 0;					// Use -1 for permanent
		
		this.tags = [];						// wr_ is prepended
		this.stacks = 1;
		this.max_stacks = 1;
		this.name = "";
		this.icon = "";
		this.description = "";
		this.editor_desc = '';					// Short description for the editor
		this.detrimental = true;
		this.trigger_immediate = false;			// Trigger immediate if it's a duration effect
		this.ext = false;						// Makes the timer count use in game time intead of combat arounds, and makes it persist outside of combat. Duration becomes time in seconds.
		this.asset = '';						// Bound to this asset id

		this.tick_on_turn_start = true;			// Tick on turn start
		this.tick_on_turn_end = false;			// Tick on turn end

		this.netPlayer = "";					// This should only be relied upon from instant effects

		// Stuff set when applied
		this.victim = "";				// Player UUID
		this.caster = "";				// Player UUID
		this.action = "";				// action UUID (not always applicable)
		this.original_target = "";		// Set on targeted actions, this is the one the action targeted. Usually the same as victim
		this._duration = 0;
		this._self_cast = false;		// This effect was placed on the caster by the caster
		this._crit = false;
		this._added = 0;				// Time in game seconds when this effect was added. Only for ext wrappers.

		this.load(data);
	}



	// Data that should be saved to drive
	save( full ){

		
		try{
			const out = {
				name : this.name,
				description : this.description,
				icon : this.icon,
				detrimental : this.detrimental,
				target : this.target,
				add_conditions : Condition.saveThese(this.add_conditions, full),
				stay_conditions : Condition.saveThese(this.stay_conditions, full),
				effects : Effect.saveThese(this.effects, full),
				tags : this.tags,
				label : this.label,
				duration : this.duration,
				ext : this.ext,
				
			};
			

			if( full ){
				out.tick_on_turn_end = this.tick_on_turn_end;
				out.tick_on_turn_start = this.tick_on_turn_start;
				out.max_stacks = this.max_stacks;
				out.trigger_immediate = this.trigger_immediate;
				out.editor_desc = this.editor_desc;

				if( full !== "mod" ){

					out._self_cast = this._self_cast;
					out.netPlayer = this.netPlayer;

				}

			}

			if( full !== "mod" ){
				
				out.asset = this.asset;
				out.id = this.id;
				out._duration = this._duration;
				out.victim = this.victim;
				out.caster = this.caster;
				out.stacks = this.stacks;
				out.action = this.action;
				if( this.ext )
					out._added = this._added;

			}
			else
				this.g_sanitizeDefaults(out);

			return out;

		}catch(err){
			console.error("Save error occurred in ", this);
			throw err;
		}

		
	}

	load( data ){
		this.g_autoload(data);
	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super

		//console.error("Add conditions", this.add_conditions);
		this.tags = this.tags.map(tag => tag.toLowerCase());
	}

	clone( parent, full = true ){
		
		if( parent === undefined )
			parent = this.parent;

		let out = new this.constructor(this.constructor.saveThis(this, full), parent);
		out.g_resetID();
		out.template_id = this.id;
		return out;

	}

	getCaster(){

		const out = game.getPlayerById(this.caster);
		if( out )
			return out;
		return this.parent;	// Used in traps since they don't add the "trap player" to the game

	}

	
	
	/* MAIN FUNCTIONALITY */
	// Tests if the wrapper can be used against a single target
	testAgainst( event, isTick, debug = false ){

		// Dungeon encounter passives don't need to check
		if( this.parent instanceof Encounter )
			return true;

		event.wrapper = this;
		let conditions = this.add_conditions;
		if( isTick )
			conditions = this.stay_conditions;

		if( this.target === Wrapper.TARGET_CASTER && event.target !== event.sender )
			return false;


		event.type = !isTick ? GameEvent.Types.internalWrapperAdded : GameEvent.Types.internalWrapperTick;
		return Condition.all(conditions, event, debug);

	}


	/*	Returns an object on success:
		See out
		caster_player = person who casted
		player = victim
		isTick = triggered through a turn tick
		isChargeFinish = used for conditions
		netPlayer = netgame owner, used for wrappers that require additional netgame input, such as repair
		crit = was critical hit
	*/
	useAgainst( caster_player, player, isTick, isChargeFinish = false, netPlayer = undefined, crit = false ){
		
		const out = new WrapperReturn();

		let pl = [game.getPlayerById(this.victim)];


		// If this effect isn't yet applied, we need to apply it against multiple players if target is an override
		if( !isTick ){
			
			if( this.target === Wrapper.TARGET_CASTER )
				pl = [caster_player]; //[this.parent.parent];
			else if( this.target === Wrapper.TARGET_AOE )
				pl = game.getEnabledPlayers();
			else if( this.target === Wrapper.TARGET_SMART_HEAL ){
				const smh = Wrapper.getSmartHealPlayer(caster_player);
				if( !smh )
					return false;	// No viable player
				pl = [smh];
			}
			else if( this.target === Wrapper.TARGET_RP_TP ){

				pl = [];
				const targ = game.getPlayerById(game.roleplay._targetPlayer);
				if( targ )
					pl = [targ];

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
				obj.action = this.parent instanceof Action ? this.parent.id : '';
				obj._crit = crit;

				if( this.ext )
					obj._added = game.time;

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

				// Get the modified max duration
				if( obj.duration > 0 ){

					let durOffs = 0;
					const extFX = p.getActiveEffectsByType(Effect.Types.addWrapperMaxDuration);
					for( let el of extFX ){
						
						if( el.data.casterOnly && el.parent.getCaster() !== caster_player )
							return;

						if( Array.isArray(el.data.conditions) ){

							const subEvt = new GameEvent({
								sender : caster_player,
								target : p,
								wrapper : obj
							});
							if( Condition.all(el.data.conditions, subEvt) )
								durOffs += el.data.amount;

						}

					}
					if( durOffs !== 0 )
						obj.duration = Math.max(1, obj.duration+durOffs);

				}
				

				obj._duration = obj.duration;
				const stunEffects = obj.getEffects({type : Effect.Types.stun}).filter(el => !el.data.ignoreDiminishing);
				if(stunEffects.length){

					obj._duration-=victim._stun_diminishing_returns;
					if( obj._duration <= 0 ){

						// Fully resisted stun
						new GameEvent({
							type : GameEvent.Types.diminishingResist,
							sender : caster,
							target : victim,
							wrapper : obj,
							action : this.parent && this.parent.constructor === Action ? this.parent : null,
						}).raise();
						continue;

					}

				}
				
				victim.addWrapper(obj, true);

				// Bind events
				obj.bindEvents();

				let evt = new GameEvent({
					type : GameEvent.Types.internalWrapperAdded,
					sender : caster,
					target : victim,
					wrapper : obj,
					action : this.parent && this.parent.constructor === Action ? this.parent : null,
				});
				for( let effect of obj.effects ){
					effect.trigger(evt, undefined, out);
				}
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
				for( let effect of obj.effects ){
					effect.trigger(evt, this, out);
				}
				

			}

			++successes;
			
		}

		// Ready to check stay conditions now
		Wrapper.checkAllStayConditions();
		return !successes ? false : out;

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

	addTime( amount = -1 ){
		if( this.duration < 1 )
			return;
		this._duration += amount;
		if( this._duration >= this.duration )
			this._duration = this.duration;
		if( this._duration <= 0 )
			this.remove( true );
	}

	tick(){
		let a = game.getPlayerById(this.caster), t = game.getPlayerById(this.victim);
		this.useAgainst( a, t, true );
	}

	remove( expired = false ){
		
		let target = game.getPlayerById(this.victim);



		const evt = new GameEvent({
			type : GameEvent.Types.wrapperExpired,
			wrapper : this,
			sender : this.getCaster(),
			target : target,
			action : this.parent && this.parent.constructor === Action ? this.parent : null,
		}).raise();

		if( expired ){

			evt.type = GameEvent.Types.wrapperExpired;
			evt.raise();
			evt.type = GameEvent.Types.internalWrapperExpired;
			for(let effect of this.effects)
				effect.trigger(evt);

		}

		evt.type = GameEvent.Types.internalWrapperRemoved;
		for(let effect of this.effects)
			effect.trigger(evt);
		
		if( target )
			target.removeWrapper(this);
		

		// After removing from player
		if( expired ){
			evt.type = GameEvent.Types.wrapperExpiredAfter;
			evt.raise();
			evt.type = GameEvent.Types.internalWrapperExpiredAfter;
			for(let effect of this.effects)
				effect.trigger(evt);
		}

		
		evt.type = GameEvent.Types.wrapperRemoved;
		evt.raise();

		this.unbindEvents();

	}

	getPlayerParent(){

		let p = this;
		while( p && p.parent && !(p instanceof Player))
			p = p.parent;
		
		return p;

	}

	getOriginalTarget(){

		// First check if original target has been marked (added automatically on added effects)
		if( this.original_target )
			return game.getPlayerById(this.original_target);

		if( this.victim )
			return game.getPlayerById(this.vbictim);
		// Passive effects don't have original target, so we can try to find a player parent
		return this.getPlayerParent();

	}

	checkStayConditions(){
		
		// For clothes
		if( !(this.parent instanceof Player))
			return;

		const evt = new GameEvent({
			sender : this.getCaster(),
			target : this.parent,
			wrapper : this,
			action : this.parent.constructor === Action ? this.parent : null,
		});

		if( !Condition.all(this.stay_conditions, evt )){
			
			if( Wrapper.debugStayConditions ){

				console.log("CACHES", game._caches);
				console.log("PLAYER TAGS: ", this.parent.getTags());
				Condition.all(this.stay_conditions, evt, true );	// Outputs debug
				console.log("Removed", this, "because stay conditions");

			}
			this.remove();

		}
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
		
		/*
		Don't add effect tags, some effects might be affecting a different player
		Removing this may have issues down the line, I'm not sure
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
			
			tags.push(...effect.tags);
			
		}
		*/

		return tags;

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
	getEffectsForPlayer( player, debug ){
		return this.effects.filter(ef => ef.affectingPlayer(player, debug));
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

		if( this.ext )
			return;

		if( this.tick_on_turn_start ){
			this.tick();
		}

		if(this.duration < 1)
			return;

		if( this._self_cast )
			this.addTime(-1);

	}
	onTurnEnd(){

		if( this.ext )
			return;

		if( this.tick_on_turn_end )
			this.tick();

		if(this.duration === -1)
			return;
		if( !this._self_cast )
			this.addTime(-1);

	}
	onBattleEnd(){

		if( this.ext )
			return;
		this._duration = 0;

	}

	onTimePassed(){
		if( !this.ext )
			return;

		if( this._added+this._duration < game.time ){
			this.remove(true);
		}

	}


	static getSmartHealPlayer( caster ){

		// Find the lowest HP party member of target
		let party = game.getPartyMembers(caster);
		party = party.filter(el => el.hp > 0);
		party.sort((a,b) => {
			const ahp = a.hp/a.getMaxHP(),
				bhp = b.hp/b.getMaxHP();
			if( ahp === bhp )
				return 0;
			return ahp < bhp ? -1 : 1;
		});
		if( !party.length )	// Fail because there's no viable target
			return false;
		return party[0];

	}

}

Wrapper.debugStayConditions = false;

// Checks stay conditions, raised on turn change and after an action is used
Wrapper.checkAllStayConditions = function(){
	const players = game.getEnabledPlayers();
	for( let player of players ){
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
Wrapper.TARGET_ORIGINAL = "ORIGINAL";		// Specifies the target of the action that triggered this. Same as AUTO except in SMART_HEAL. Can also be used in effect events to target the owner of the wrapper containing the event that triggered the effect. Also used in Used only in Effect.Types.hitfx currently to trigger on the targeted victim of a smart heal action.


Wrapper.Targets = {
	none : 'none',	// used in the editor to delete a target  
	auto : Wrapper.TARGET_AUTO,
	caster : Wrapper.TARGET_CASTER,
	aoe : Wrapper.TARGET_AOE,
	smart_heal : Wrapper.TARGET_SMART_HEAL,
	event_raiser : Wrapper.TARGET_EVENT_RAISER,
	event_targets : Wrapper.TARGET_EVENT_TARGETS,
	original_target : Wrapper.TARGET_ORIGINAL,
	rp_targplayer : Wrapper.TARGET_RP_TP,
};


/*
	An effect is tied to a wrapper and actually does something, either instantly or over time based on the wrapper
*/
class Effect extends Generic{

	// Parent is always a wrapper
	// Parent of parent varies. If the wrapper is applied to a player, parent.parent is the player
	
	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}

	constructor(data, parent){

		super(data);
		this.parent = parent;
		this.label = '';								// Optional, can be used for events
		this.conditions = [];							// Conditions when ticking
		this.type = "";
		this.data = {};									// Data has automatical type conversion for the following field IDs
														// "conditions" (if array) : Converted to an array of Conditions
		this.tags = [];
		this.targets = [Wrapper.TARGET_AUTO];					// Use Wrapper.TARGET_* flags for multiple targets
		this.events = [GameEvent.Types.internalWrapperTick];	// Limits triggers to certain events. Anything other than wrapper* functions require a duration wrapper parent
		this.no_stack_multi = false;
		this.debug = false;
		this.desc = '';

		this._bound_events = [];
		this.load(data);

	}

	save( full ){
		const out = {
			type : this.type,
			data : this.saveData(),
			tags : this.tags,
			targets : this.targets,
			label : this.label,
			no_stack_multi : this.no_stack_multi,
		};

		if( full ){
			out.conditions = Condition.saveThese(this.conditions, full);
			out.events = this.events;
			out.debug = this.debug;
			out.desc = this.desc;
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
		this.g_rebase();	// Super
		
		// Auto generate damage type from an ability
		if( this.parent && this.parent.parent && this.parent.parent.constructor === Action && this.type === Effect.Types.damage && typeof this.data === "object" && !this.data.type )
			this.data.type = this.parent.parent.type;

		if( !Effect.Types[this.type] )
			console.error("Unknown effect type", this.type, "in", this);

		if( [Effect.Types.runWrappers, Effect.Types.assetWrappers].includes(this.type) && Array.isArray(this.data.wrappers) ){
			this.data.wrappers = Wrapper.loadThese(this.data.wrappers, this);
		}
		
		// If an effect has a conditions data field, it's 
		if( Array.isArray(this.data.conditions) )
			this.data.conditions = Condition.loadThese(this.data.conditions, this);

		if( this.type === Effect.Types.gameAction && this.data.action ){

			if( !Array.isArray(this.data.action) )
				this.data.action = toArray(this.data.action);

			this.data.action = GameAction.loadThese(this.data.action);
		}

		// Unpack is required since it has nested objects
		if( this.type === Effect.Types.addRandomTags ){
			let n = 0;
			for( let obj of this.data.tags ){
				obj.id = ++n;
				if( obj.conds ){
					obj.conds = Condition.loadThese(obj.conds);
				}
			}
		}
		
	}

	clone(parent){
		let out = new this.constructor(Effect.saveThis(this, true), parent);
		out.g_resetID();
		return out;
	}

	// Override the default handler
	getTags(){

		let tags = this.tags.slice();

		if( this.type === Effect.Types.knockdown ){
			tags.push(stdTag.wrKnockdown);
			let type = stdTag.wrKnockdownFront;
			if( this.data.type === Effect.KnockdownTypes.Back )
				type = stdTag.wrKnockdownBack;
			tags.push(type);
		}
		else if( this.type === Effect.Types.daze )
			tags.push(stdTag.wrDazed);
		else if( this.type === Effect.Types.grapple )
			tags.push(stdTag.wrGrapple);
		
		return tags;


	}

	/* MAIN FUNCTIONALITY - This is where the magic happens */
	// template is the original effect if it was just added
	// otherwise it's parent
	// WrapperReturn lets you put data into the wrapper trigger return object 
	trigger( event, template, wrapperReturn, debug ){

		debug = debug || this.debug;

		const wrapper = this.parent;

		let evt = event.clone();
		evt.effect = this;
		evt.originalWrapper = evt.wrapper;
		evt.wrapper = wrapper;

		if( !(wrapperReturn instanceof WrapperReturn) )
			wrapperReturn = new WrapperReturn();

		if( !this.validateConditions(evt, this.label === 'tmp_debug' || debug) )
			return false;

		let sender = game.getPlayerById(this.parent.caster),
			target = game.getPlayerById(this.parent.victim)
		;
		if( !sender )
			sender = event.sender;
		if( !target && event.target ){
			target = event.target[0] || event.target;
		}
		if( !target )
			target = new Player();	// Create a dummy player if it's missing. This is useful for events like battle ended etc


		// Default to AoE
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
			else if( ta === Wrapper.TARGET_AOE ){
				tout = tout.concat(game.getEnabledPlayers());
			}
			else if( ta === Wrapper.TARGET_RP_TP ){
				const p = game.getPlayerById(game.roleplay._targetPlayer);
				if( p )
					tout.push(p);
			}
			else if( ta === Wrapper.TARGET_ORIGINAL )
				tout.push(this.parent.getOriginalTarget());
			else if( ta === Wrapper.TARGET_SMART_HEAL ){
				const smh = Wrapper.getSmartHealPlayer(sender);
				if( smh )
					tout.push(smh);
			}
		}

		if( this.data.dummy_sender )
			sender = new Player({level:game.getAveragePlayerLevel()});

		new GameEvent({
			type : GameEvent.Types.effectTrigger,
			sender : sender,
			target : tout,
			wrapper : wrapper,
			effect : this,
		}).raise();

		if( debug )
			console.debug("Allowed ", this, "to trigger", event);

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
				if( !type && wrapper.parent.constructor === Action )
					type = wrapper.parent.type;
				if( !type )
					type = Action.Types.physical;

				let e = GameEvent.Types.damageDone, e2 = GameEvent.Types.damageTaken;
				const calcEvt = new GameEvent({sender:s, target:t, wrapper:wrapper, effect:this});

				let amt = -Calculator.run(
					this.data.amount, 
					calcEvt
				);

				if( !this.no_stack_multi )
					amt *= wrapper.stacks;


				if( s.isHealInverted() )
					amt = -Math.abs(amt);


				// Only affects damage/healing
				const crit = wrapper._crit;
				if( crit )
					amt *= 2;

				// Healing
				if( amt > 0 ){

					amt = randRound(amt);
					amt *= s.getGenericAmountStatMultiplier( Effect.Types.globalHealingDoneMod, t );
					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalHealingTakenMod, s );

					// Set event types
					e = GameEvent.Types.healingDone;
					e2 = GameEvent.Types.healingTaken;
					
					
					
					// Holy arousal purging
					if( type === Action.Types.holy ){

						let procChance = 15*s.getStatProcMultiplier(Action.Types.holy, false)*t.getStatProcMultiplier(Action.Types.holy, true);
						// 15% chance per point of healing
						let ch = Math.abs(amt*procChance);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot > t.arousal )
							tot = t.arousal;
						if( t.isOrgasming() )
							tot = 0;
						if( tot && t.arousal ){
							t.addArousal(-tot, true);
							game.ui.addText( t.getColoredName()+" lost "+Math.abs(tot)+" arousal from holy healing.", undefined, s.id, t.id, 'statMessage arousal' );
							amt += tot*2;	// Holy healing converts arousal into HP
						}

					}

					let heal_aggro = 0.2;
					if( this.data.heal_aggro ){
						heal_aggro = Calculator.run(this.data.heal_aggro, calcEvt);
					}

					if( heal_aggro > 0 ){
						game.getPlayersNotOnTeam(s.team).map(pl => {
							pl.addThreat(s.id, amt*heal_aggro*s.getHealAggroMultiplier(false)*pl.getHealAggroMultiplier(true));
						});
					}

					
				}
				// Damage
				else{
					
					
					/*
					console.debug(
						s.name, "vs", t.name,
						"input", amt, 
						"bonus multiplier", Player.getBonusDamageMultiplier( s,t,type,this.parent.detrimental),
						"of which", s.getBon(type), "-", t.getSV(type),
						"global defensive mods", t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s ), t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s ),
						"global attack mods", s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t ), s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t ),
						"nudity multi", t.getNudityDamageMultiplier(),
					);
					*/
										
					

					// Get target global damage point taken modifier

					// Amt is negative
					amt -= t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s );
					
					// amt is negative when attacking, that's why we use - here
					amt -= s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t );
					
					// Multipliers last
					amt *= Player.getBonusDamageMultiplier( s,t,type,wrapper.detrimental ); // Negative because it's damage
					amt *= s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t );
					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s );
					amt *= t.getNudityDamageMultiplier();

					//console.debug("amt", amt);
					
					amt = randRound(amt);
					if( amt > 0 )
						amt = 0;

					// Calculate durability damage				
					if( type === Action.Types.physical ){

						let procChance = 10*s.getStatProcMultiplier(Action.Types.physical, false)*t.getStatProcMultiplier(Action.Types.physical, true);
						let ch = amt*procChance;
						ch = Math.abs(ch);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot )
							wrapperReturn.mergeFromPlayerDamageDurability(t, t.damageDurability(s, this, tot, "RANDOM", true));
						
						
					}

					// AP Damage
					if( type === Action.Types.elemental && t.ap ){
						
						// 10% chance per point of damage, max 1
						let procChance = 10*s.getStatProcMultiplier(Action.Types.elemental, false)*t.getStatProcMultiplier(Action.Types.elemental, true);
						let ch = Math.abs(amt*procChance);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot > t.ap )
							tot = t.ap;
						if( tot ){
							tot = Math.min(1, tot);
							t.addAP(-tot, true);
							game.ui.addText( t.getColoredName()+" lost "+Math.abs(tot)+" AP from elemental damage.", undefined, s.id, t.id, 'statMessage AP' );
						}

					}



				}

				

				// Calculate arousal (allowed for both healing and damaging)
				if( type === Action.Types.corruption && t.arousal < t.getMaxArousal() ){

					// 30% chance per point of damage
					let procChance = 30*s.getStatProcMultiplier(Action.Types.corruption, false)*t.getStatProcMultiplier(Action.Types.corruption, true);
					let ch = Math.abs(amt*procChance);

					ch *= t.getGenericAmountStatMultiplier( Effect.Types.globalArousalTakenMod, s );
					
					let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
					const start = t.arousal;

					if( start < t.getMaxArousal() ){

						t.addArousal(tot, true);
						tot = t.arousal-start;
						if( t.arousal !== start )
							game.ui.addText( t.getColoredName()+" gained "+Math.abs(tot)+" arousal from corruption.", undefined, s.id, t.id, 'statMessage arousal' );

					}

				}

				const preHP = t.hp;
				if( isNaN(amt) )
					console.error("NaN damage amount found in", this);
				let died = t.addHP(amt, s, this, true);
				const change = t.hp - preHP;

				if( amt < 0 ){

					t.onDamageTaken(s, type, Math.abs(change));
					s.onDamageDone(t, type, Math.abs(change));
					let threat = change * (!isNaN(this.data.threatMod) ? this.data.threatMod : 1);
					let leech = !isNaN(this.data.leech) ? Math.abs(Math.round(change*this.data.leech)) : 0;
					t.addThreat( s.id, -threat );
					if( change )
						game.ui.addText( t.getColoredName()+" took "+Math.abs(change)+" "+type+" damage"+(wrapper.name ? ' from '+wrapper.name : '')+(crit ? ' (CRITICAL)' :'')+".", undefined, s.id, t.id, 'statMessage damage'+(crit ? ' crit':'') );
					if( leech ){
						s.addHP(leech, s, this, true);
						game.ui.addText( s.getColoredName()+" leeched "+leech+" HP.", undefined, s.id, t.id, 'statMessage healing' );
					}

				}else if(change){
					game.ui.addText( t.getColoredName()+" gained "+change+" HP"+(wrapper.name ? ' from '+wrapper.name : '')+(crit ? ' (CRITICAL)' : '')+".", undefined, s.id, t.id, 'statMessage healing' );
				}



				new GameEvent({
					type : e,
					sender : s,
					target : t,
					wrapper : wrapper,
					effect : this,
				}).raise();
				

				new GameEvent({
					type : e2,
					sender : s,
					target : t,
					wrapper : wrapper,
					effect : this,
				}).raise();
				if( died )
					new GameEvent({
						type : GameEvent.Types.playerDefeated,
						sender : s,
						target : t,
						wrapper : wrapper,
						effect : this
					}).raise();
			}

			else if( this.type === Effect.Types.addAP ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				if( !this.no_stack_multi )
					amt *= this.parent.stacks;

				
				let pre = t.ap;
				t.addAP(amt, true);
				let change = t.ap-pre;
				if( change )
					game.ui.addText( t.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" AP"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage AP' );
					
				if( +this.data.leech ){

					pre = s.ap;
					s.addAP(-amt, true);
					change = s.ap-pre;
					if( change )
						game.ui.addText( s.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" AP"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, t.id, s.id, 'statMessage AP' );

				}

				

			}

			else if( this.type === Effect.Types.addMP ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this,
					}).mergeUnset(event)
				);
				if( !this.no_stack_multi )
					amt *= wrapper.stacks;

				let pre = t.mp;
				t.addMP(amt, true);
				let change = t.mp-pre;
				if( change )
					game.ui.addText( t.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" MP"+(wrapper.name ? ' from '+wrapper.name : '')+".", undefined, s.id, t.id, 'statMessage MP' );


				if( +this.data.leech ){

					pre = s.mp;
					s.addMP(-amt, true);
					let change = s.mp-pre;
					if( change )
						game.ui.addText( s.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" MP"+(wrapper.name ? ' from '+wrapper.name : '')+".", undefined, t.id, s.id, 'statMessage MP' );

				}

			}

			else if( this.type === Effect.Types.addHP ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				);
				if( !this.no_stack_multi )
					amt *= wrapper.stacks;
				amt = Math.floor(amt);
				game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" HP"+(wrapper.name ? ' from '+wrapper.name : '')+".", undefined, s.id, t.id, 'statMessage HP' );
				t.addHP(amt, s, this, true);
			}

			

			else if( this.type === Effect.Types.addArousal ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:this.parent, effect:this
					}).mergeUnset(event)
				);

				if( amt > 0 )
					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalArousalTakenMod, s );				

				if( !this.no_stack_multi )
					amt *= this.parent.stacks;


				let pre = t.arousal;
				t.addArousal(amt, true);
				let change = t.arousal-pre;
				
				if( change )
					game.ui.addText( t.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage arousal' );
				
				
				if( +this.data.leech ){

					pre = s.arousal;
					s.addArousal(-amt, true);
					let change = s.arousal-pre;
					if( change )
						game.ui.addText( s.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, t.id, s.id, 'statMessage arousal' );
					

				}
				
			}

			else if( 
				this.type === Effect.Types.setHP || 
				this.type === Effect.Types.setAP || 
				this.type === Effect.Types.setMP || 
				this.type === Effect.Types.setArousal
			){
				
				let amt = Math.floor(Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				));
				if( !isNaN(amt) ){

					if( this.type === Effect.Types.setHP ){
						t.hp = amt;
						t.addHP(0);
					}
					else if( this.type === Effect.Types.setAP ){
						t.ap = amt;
						t.addAP(0);
					}
					else if( this.type === Effect.Types.setArousal ){
						t.arousal = amt;
						t.addArousal(0);
					}
					else if( this.type === Effect.Types.setMP ){
						t.mp = amt;
						t.addMP(0);
					}

				}

			}


			else if( this.type === Effect.Types.addThreat ){
				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				);
				if( !this.no_stack_multi )
					amt *= wrapper.stacks;
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
					console.error("Effect data in wrapper ", wrapper, "tried to run wrappers, but wrappers are not defined in", this);
					return false;
				}
				
				for( let w of this.data.wrappers ){

					let wr = new Wrapper(w, wrapper.parent);
					let stacks = this.data.stacks;
					if( stacks ){

						stacks = Calculator.run(
							stacks, 
							new GameEvent({
								sender:s, 
								target:t, 
								wrapper:wrapper, 
								effect:this
							}).mergeUnset(event)
						);
						if( Math.random() < stacks-Math.floor(stacks) )
							++stacks;
						stacks = Math.floor(stacks);

						// Evaluated to 0, don't run this effect
						if( stacks === 0 || isNaN(stacks) )
							continue;	

						// Negative uses parent
						if( stacks < 0 )
							stacks = this.parent.stacks;

						wr.stacks = stacks;

					}
					wr.useAgainst(s, t, false);

				}

			}
			else if( this.type === Effect.Types.assetWrappers ){
				
				
				let wrappers = this.data.wrappers;
				if( !Array.isArray(wrappers) ){

					console.error("Effect data in wrapper ", wrapper, "tried to run wrappers, but wrappers are not defined in", this);
					return false;

				}

				const conds = this.data.conditions || [];
				const tmpEvt = new GameEvent({sender:s, target:t, dungeon:game.dungeon, room:game.dungeon.getActiveRoom()});

				// Check for viable assets
				let assets = t.assets.filter(el => {

					tmpEvt.asset = el;
					return (el.equipped || this.data.unequipped) && Condition.all(conds, tmpEvt);

				});

				if( this.data.random )
					shuffle(assets);

				
				let max = parseInt(this.data.max);
				if( max > 0 || this.data.max === undefined ){

					if( !max )
						max = 1;
					assets = assets.slice(0, max);

				}

				if( debug )
					console.debug("Attaching wrappers to asset >> Max", max, "viable assets", assets, ":");

				// Attach the asset wrappers to the player
				for( let asset of assets ){

					for( let w of this.data.wrappers ){

						let wr = new Wrapper(w, wrapper.parent);
						wr.asset = asset.id;
						wr.label = wr.label+'_'+asset.id;
						tmpEvt.asset = asset;
						if( wr.testAgainst(tmpEvt, false, debug) ){
							wr.useAgainst(s, t, false);
							if( debug )
								console.debug("used", wr, "against asset", asset, "owned by", t);
						}
						else if( debug )
							console.debug("Failed to validate conditions", tmpEvt.clone(), wr, "to", asset);

					}

				}

			}

			else if( this.type === Effect.Types.disrobe ){

				let slots = this.data.slots;
				if( typeof slots !== "string" && !Array.isArray(slots) )
					slots = [Asset.Slots.upperBody, Asset.Slots.lowerBody];
					
				if( !Array.isArray(slots) )
					slots = [slots];
				slots = wrapperReturn.getSlotPriorityByDamaged(t, slots);
				
				let max = this.data.numSlots;
				let equipped = t.getEquippedAssetsBySlots( slots, false );
				if( !equipped.length )
					return false;

				let remove = equipped;
				if( !isNaN(max) ){
					shuffle(equipped);
					remove = equipped.slice(0, max);
				}

				const stripData = {};	// data for wrapperReturn.addArmorStrips. Needs to correlate with player.damageDurability(...).armor_strips
				for( let asset of remove ){
					if(t.unequipAsset(asset.id)){
						if( asset.loot_sound )
							game.playFxAudioKitById(asset.loot_sound, s, t, undefined, true );
						game.ui.addText( t.getColoredName()+"'s "+asset.name+" was unequipped"+(wrapper.name ? ' by '+s.getColoredName() : '')+".", undefined, t.id, t.id, 'statMessage important' );
						for( let slot of asset.slots ){
							stripData[slot] = asset;
						}
					}
				}
				wrapperReturn.addArmorStrips(t, stripData);

			}

			else if( this.type === Effect.Types.steal ){

				const conds = this.data.conditions || [],
					numItems = this.data.numItems || 1,
					viable = [],
					assets = t.getAssets()
				;
				const evt = new GameEvent({wrapper:wrapper, effect:this, sender:s, target:t});
				for( let asset of assets ){
					
					evt.asset = asset;
					if( Condition.all(conds, evt) )
						viable.push(asset);

				}

				for( let i=0; i<numItems && viable.length; ++i ){

					const item = viable.splice(Math.floor(Math.random()*viable.length), 1)[0];
					s.addAsset(item, item._stacks, true);
					wrapperReturn.addSteal(t, item);
					t.destroyAsset(item.id);

				}

				
			}

			else if( this.type === Effect.Types.removeParentWrapper ){
				wrapper.remove();
			}

			else if( this.type === Effect.Types.removeWrapperByLabel ){

				let label = this.data.label;
				if( !Array.isArray(label) )
					label = [label];

				let wrappers = t.wrappers.slice();		// Use temporary wrappers only
				
				for( let wr of wrappers ){
					if(
						label.includes(wr.label) &&
						(!this.data.casterOnly || wr.caster === s.id)
					){
						wr.remove();					
					}
				}
			}

			else if( this.type === Effect.Types.removeWrapperByTag ){
				let tags = this.data.tag;
				if( !Array.isArray(tags) )
					tags = [tags];
				let wrappers = t.wrappers.slice();		// Use temporary wrappers only
				for( let wr of wrappers ){
					if(
						label.hasTag(tags) &&
						(!this.data.casterOnly || wr.caster === s.id)
					)wr.remove();					
				}
			}

			else if( this.type === Effect.Types.addStacks ){
				
				// {stacks:(int)(str)stacks=1, conditions:(arr)conditions(undefined=wrapper), casterOnly:(bool)=true}
				let wrappers = [wrapper];
				let stacks = this.data.stacks;
				let refreshTime = this.data.refreshTime;
				if( isNaN(stacks) )
					stacks = 1;

				if( refreshTime === undefined )
					refreshTime = stacks > -1;
				
				if( this.data.conditions ){
					wrappers = [];
					const conds = Condition.loadThese(this.data.conditions);
					let w = t.getWrappers();
					
					let casterOnly = this.data.casterOnly;
					if( casterOnly === undefined )
						casterOnly = true;

					for( let wr of w ){
						if( this.data.casterOnly && wr.caster !== s.id )
							continue;
						if( Condition.all(conds, new GameEvent({sender:s, target:t, wrapper:wr})) )
							wrappers.push(wr);
					}
				}

				for( let w of wrappers )
					w.addStacks(stacks, refreshTime);

			}

			else if( this.type === Effect.Types.addWrapperTime ){
				// {amount:(int)(str)amount, conditions:(arr)conditions(undefined=wrapper), casterOnly:(bool)=true}
				let wrappers = [wrapper];
				let time = this.data.amount;
				if( !time ){
					console.error("Invalid time in", this);
					return false;
				}
				time = Calculator.run(time, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				);

				if( this.data.conditions ){
					wrappers = [];
					const conds = Condition.loadThese(this.data.conditions);
					let w = t.getWrappers();
					
					let casterOnly = this.data.casterOnly;
					if( casterOnly === undefined )
						casterOnly = true;

					for( let wr of w ){
						if( this.data.casterOnly && wr.caster !== s.id )
							continue;
						if( Condition.all(conds, new GameEvent({sender:s, target:t, wrapper:wr})) )
							wrappers.push(wr);
					}
				}

				for( let w of wrappers )
					w.addTime(time);

			}

			

			else if( this.type === Effect.Types.activateCooldown ){
				t.consumeActionCharges(this.data.actions, this.data.charges);
			}

			else if( this.type === Effect.Types.addActionCharges ){
				t.addActionCharges(this.data.actions, Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				));
			}

			else if( this.type === Effect.Types.lowerCooldown ){
				t.addActionCooldowns(this.data.actions, isNaN(this.data.amount) ? -Infinity : parseInt(this.data.amount));
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
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				);
				if( ! this.no_stack_multi )
					amt *= wrapper.stacks;
				if( !amt )
					continue;

				// Check if slots exists in data, otherwise pick all slots
				let slots = this.data.slots;
				if( !slots )
					slots = [Asset.Slots.upperBody, Asset.Slots.lowerBody];
				if( !Array.isArray(slots) )
					slots = [slots];

				// Make sure these slots exist
				let viable = [];
				for( let slot of slots ){
					if( t.getEquippedAssetsBySlots(slot).length )
						viable.push(slot);
				}
				slots = viable;
				if( !slots )
					return false;

				// Pick a prioritized slot if possible
				slots = wrapperReturn.getSlotPriorityByStripped(t, slots);
				
				// If random, pick n from prioritized
				if( !isNaN(this.data.max_types) ){
					// Pick some at random
					shuffle(slots);
					slots = slots.slice(0,this.data.max_types);
				}

				

				let hit = t.damageDurability( s, this, amt, slots, true );
				wrapperReturn.mergeFromPlayerDamageDurability(t, hit);
			}

			else if( this.type === Effect.Types.flee ){
				game.attemptFleeFromCombat( s );
			}

			// Unlike the above one, this will present the caster with an asset picker of damaged gear on the target
			else if( this.type === Effect.Types.repair ){

				let np = wrapper.netPlayer;
				if( np )
					Game.net.dmDrawRepair(np, s, t, template.parent );
				else
					game.ui.drawRepair(s, t, template.parent );		// Supply the original effect since it has the proper parent. When cloned, parent always becomes the victim player
					
			}
			
			else if( this.type === Effect.Types.interrupt ){
				t.interrupt(s, this.data && this.data.force);
			}
			

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
				if( !Array.isArray(mTags) ){
					console.error("Trying to run addMissingFxTag, but data.tag is not set", this);
					return false;
				}
				const mapTag = tag => {
					if( typeof tag !== "string" )
						console.error("Found a non string tag in addMissingFxTag, tag was ", tag, "fx was", this);
					return tag;
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

			else if( this.type === Effect.Types.tieToRandomBondageDevice ){

				if( this.data._device )
					return;

				const viable = game.dungeon.getActiveRoom().getBondageAssets(true);
				if( !viable )
					throw 'Error: No viable bondage assets found in room';

				const asset = randElem(viable);
				this.data._device = asset.id;


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

			else if( this.type === Effect.Types.addTags ){
				let tags = this.data.tags;
				if( !Array.isArray(tags) )
					tags = [tags];
				for( let tag of tags )
					this.tags.push(tag);
			}

			else if( this.type === Effect.Types.addRandomTags ){

				if( !Array.isArray(this.data.tags) ){
					console.error("addRandomTags called on", this, "but no tags set");
					return false;
				}

				let viable = [];
				const tEvent = new GameEvent({target:t, sender:s});

				for( let tag of this.data.tags ){

					if( !tag.tags ){
						console.error("No tags set on", tag, "in", this);
						continue;
					}

					if( tag.conds ){
						let conds = tag.conds;
						if( !Array.isArray(conds) )
							conds = [conds];
						conds = Condition.loadThese(conds);
						if( !Condition.all(conds, tEvent) )
							continue;
					}
					let t = tag.tags;
					if( !Array.isArray(t) )
						t = [t];
					
					viable.push(t);

				}

				const amount = this.data.amount > 0 ? this.data.amount : 1;
				for( let i =0; i<amount && viable.length; ++i ){

					const entry = randElem(viable, true);
					for( let tag of entry )
						this.tags.push(tag);

				}


			}
			
			else if( this.type === Effect.Types.gameAction ){

				for( let action of this.data.action )
					action.trigger(t);

			}

			else if( this.type === Effect.Types.summonAsset ){

				let label = this.data.asset, 
					autoEquip = this.data.equip === undefined || this.data.equip
				;

				const assets = t.addLibraryAsset(label);
				if( assets && autoEquip )
					assets.map(asset => t.equipAsset(asset.id));

			}

			else if( this.type === Effect.Types.trace )
				console.trace(this.data.message, this);
			// LAST
			else if( typeof this.type !== "string" )
				console.error("Invalid effect", this.type);


		}

		return wrapperReturn;
		
	}





	/* EVENT */
	bindEvents(){

		this.unbindEvents();
		for(let evt of this.events){
			
			if( evt.substr(0,8) !== "internal" ){

				const binding = GameEvent.on(evt, event => {
					this.trigger(event);
				});
				binding.parent = this;
				this._bound_events.push(binding);

			}
		}

	}
	unbindEvents(){

		for(let evt of this._bound_events)
			GameEvent.off(evt);
		this._bound_events = [];

	}
	

	
	/* CONDITIONS */
	validateConditions( event, debug ){

		if( !debug )
			debug = this.debug;
		if( this.events.length && this.events.indexOf(event.type) === -1 ){
			if( debug )
				console.debug("Prevented ", this, "because", event.type, "not in", this.events, "event was", event);
			return false;
		}

		if( !Condition.all(this.conditions, event, debug) )
			return false;

		return true;

	}


	

	// Attempts to get a target by wrapper.target type
	getTargetsByType( type, event ){

		if( type === Wrapper.Targets.aoe )
			return game.getEnabledPlayers();
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
		return Generic.flattenObject(this.data);
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
		if( !this.no_stack_multi )
			amt *= this.parent.stacks;
		return Math.ceil(amt);

	}

	// Checks if target is affecting a specific player
	affectingPlayer( player, debug ){

		if( debug )
			console.debug("Target", this.targets, "parent", this.parent, player.id, this.parent.victim);
		
		// This makes it so that procs can work, otherwise there'd be an infinite loop. Passives should not use conditions that might generate cyclic checks, such as player tags.
		if( !Effect.Passive[this.type] )
			return false;
		if(
			// Auto target, checks if victim is id
			(~this.targets.indexOf(Wrapper.Targets.auto) && this.parent.victim === player.id) ||
			// Caster target, checks if caster is player id
			(~this.targets.indexOf(Wrapper.Targets.caster) && this.parent.caster === player.id) ||
			// AOE, affects everyone
			~this.targets.indexOf(Wrapper.Targets.aoe) ||
			// Bound to encounter
			this.parent.parent instanceof Encounter
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


// Standard wrapper return object
class WrapperReturn extends Generic{
	constructor(data){
		super();

		this.armor_slots = {}; 		// { player_id: {slot : amount} } - Armor damage
		this.armor_strips = {};		// { player_id: {slot : (obj)asset_stripped} } - Armor strips
		this.steals = {};			// { player_id: (arr)assets }

		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	// Merges data into this one
	merge( data ){

		if( typeof data !== "object" )
			return false;
		for( let i in data.armor_slots )
			this.addArmorDamage(i, data.armor_slots[i]);
		for( let i in data.armor_strips )
			this.addArmorStrips(i, data.armor_strips[i]);
		for( let i in data.steals )
			this.addSteal(i, data.steals[i]);
		
	}

	// Used on armor damage to see if a slot has been stripped on the player previously. And in that case favor that.
	getSlotPriorityByStripped(player, input = []){
		return this._getSlotPriority(player, input, this.armor_strips);
	}

	// Used on armor strips to see if a slot has been damaged on the player previously. And in that case favor that.
	getSlotPriorityByDamaged(player, input = []){
		return this._getSlotPriority(player, input, this.armor_slots);
	}

	// Local. Takes an input of slots, and returns the prioritized one if it exists. Otherwise it returns the original input array.
	_getSlotPriority(player, input, obj){

		if( typeof player === "object" )
			player = player.id;
		// Check if any of the slots are present in wrapperReturn, in that case do that
		const wr = obj[player];
		if( wr && Object.keys(wr).length ){
			const viable = Object.keys(wr);
			const sl = [];
			for( let slot of input ){
				if( ~viable.indexOf(slot) )
					sl.push(slot);
			}
			if( sl.length )
				input = sl;
		}
		return input;

	}

	// Merges the response from player.damageDurability response
	mergeFromPlayerDamageDurability(player, data){
		if( !data )
			return;
		this.addArmorStrips(player, data.armor_strips);
		this.addArmorDamage(player, data.armor_damage);
	}

	addArmorStrips(player, slots){
		if( typeof player === "object" )
			player = player.id;
		if( !this.armor_strips[player] )
			this.armor_strips[player] = {};
		for( let slot in slots )
			this.armor_strips[player][slot] = slots[slot];
	}

	addArmorDamage(player, data){
		if( typeof player === "object" )
			player = player.id;
		// Adds armor damage in the form of {slot:amount}
		for( let i in data ){
			if( !this.armor_slots[player] )
				this.armor_slots[player] = {};
			if( !this.armor_slots[player][i] )
				this.armor_slots[player][i] = 0;
			this.armor_slots[player][i] += data[i];
		}
	}

	// Accepts an array of items, or a single item
	addSteal( player, item ){

		item = toArray(item);
		if( typeof player === "object" )
			player = player.id;
		if( !this.steals[player] )
			this.steals[player] = [];
		this.steals[player] = this.steals[player].concat(item);

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
	trace : 'trace',
	damage : "damage",
	endTurn : "endTurn",
	css : "css",
	hitfx : "hitfx",
	damageArmor : "damageArmor",
	addAP : "addAP",
	addMP : "addMP",
	addHP : "addHP",
		
	setHP : 'setHP',
	setMP : 'setMP',
	setArousal : 'setArousal',
	setAP : 'setAP',
	
	addArousal : "addArousal",	
	interrupt : "interrupt",		
	blockInterrupt : "blockInterrupt",		
	globalHitChanceMod : 'globalHitChanceMod',
	globalDamageTakenMod : 'globalDamageTakenMod',
	globalDamageDoneMod : 'globalDamageDoneMod',
	globalHealingDoneMod : 'globalHealingDoneMod',
	globalHealingTakenMod : 'globalHealingTakenMod',

	critDoneMod : 'critDoneMod',
	critTakenMod : 'critTakenMod',

	globalArousalTakenMod : 'globalArousalTakenMod',
	gameAction : 'gameAction',
	addActionCharges : 'addActionCharges',		

	// Stamina
	staminaModifier : "staminaModifier",		
	// Agility
	agilityModifier : "agilityModifier",		
	// Intellect
	intellectModifier : "intellectModifier",	

	carryModifier : "carryModifier",	

	expMod : "expMod",

	svPhysical : 'svPhysical',				
	svElemental : 'svElemental',			
	svHoly : 'svHoly',						
	svCorruption : 'svCorruption',			

	bonPhysical : 'bonPhysical',			
	bonElemental : 'bonElemental',			
	bonHoly : 'bonHoly',					
	bonCorruption : 'bonCorruption',		

	physicalProcMultiplier : 'physicalProcMultiplier',
	elementalProcMultiplier : 'elementalProcMultiplier',
	holyProcMultiplier : 'holyProcMultiplier',
	corruptionProcMultiplier : 'corruptionProcMultiplier',

	healAggroMultiplier : 'healAggroMultiplier',

	runWrappers : "runWrappers",		
	assetWrappers : "assetWrappers",	

	disrobe : "disrobe",
	steal : "steal",

	addStacks : 'addStacks',				
	addWrapperTime : 'addWrapperTime',
	addWrapperMaxDuration : 'addWrapperMaxDuration',

	removeParentWrapper : 'removeParentWrapper',	
	removeWrapperByLabel : 'removeWrapperByLabel',	
	removeWrapperByTag : 'removeWrapperByTag',
	removeEffectWrapperByEffectTag : 'removeEffectWrapperByEffectTag',

	activateCooldown : 'activateCooldown',			
	lowerCooldown : 'lowerCooldown',			

	knockdown : 'knockdown',						
	grapple : 'grapple',						
	daze : 'daze',
	disable : 'disable',

	repair : 'repair',								
	flee : 'flee',									
	addThreat : 'addThreat',						
	punishmentUsed : 'punishmentUsed',			
	
	healInversion : 'healInversion',	

	stun : 'stun',									
	taunt : 'taunt',	
	addActions : 'addActions',	// handled in Player
	addMissingFxTag : 'addMissingFxTag',
	tieToRandomBondageDevice : 'tieToRandomBondageDevice',
	addExposedOrificeTag : 'addExposedOrificeTag',
	addTags : 'addTags',
	addRandomTags : 'addRandomTags',
	allowReceiveSpells : 'allowReceiveSpells',
	disableActions : 'disableActions',

	actionApCost : 'actionApCost',
	actionCastTime : 'actionCastTime',

	summonAsset : 'summonAsset',
		
};

// Effect types that can be passive. Helps prevent recursion. Effects that don't have this set won't have their tags checked.
Effect.Passive = {

	[Effect.Types.none] : true,
	[Effect.Types.addExposedOrificeTag] : true,	// Needed for cocktopus
	[Effect.Types.globalHitChanceMod] : true,
	[Effect.Types.globalDamageTakenMod] : true,
	[Effect.Types.globalDamageDoneMod] : true,
	[Effect.Types.globalHealingDoneMod] : true,
	[Effect.Types.critDoneMod] : true,
	[Effect.Types.critTakenMod] : true,
	[Effect.Types.globalHealingTakenMod] : true,
	[Effect.Types.globalArousalTakenMod] : true,
	[Effect.Types.staminaModifier] : true,
	[Effect.Types.agilityModifier] : true,
	[Effect.Types.intellectModifier] : true,
	[Effect.Types.carryModifier] : true,
	[Effect.Types.addTags] : true,
	[Effect.Types.addRandomTags] : true,
	[Effect.Types.expMod] : true,

	[Effect.Types.svPhysical] : true,
	[Effect.Types.svElemental] : true,
	[Effect.Types.svHoly] : true,
	[Effect.Types.svCorruption] : true,

	[Effect.Types.bonPhysical] : true,
	[Effect.Types.bonElemental] : true,
	[Effect.Types.bonHoly] : true,
	[Effect.Types.bonCorruption] : true,

	[Effect.Types.physicalProcMultiplier] : true,
	[Effect.Types.elementalProcMultiplier] : true,
	[Effect.Types.holyProcMultiplier] : true,
	[Effect.Types.corruptionProcMultiplier] : true,
	[Effect.Types.healAggroMultiplier] : true,
	[Effect.Types.knockdown] : true,
	[Effect.Types.grapple] : true,
	[Effect.Types.daze] : true,
	[Effect.Types.disable] : true,
	[Effect.Types.healInversion] : true,

	[Effect.Types.stun] : true,
	[Effect.Types.taunt] : true,
	[Effect.Types.addActions] : true,
	[Effect.Types.allowReceiveSpells] : true,
	[Effect.Types.disableActions] : true,
	[Effect.Types.actionApCost] : true,
	[Effect.Types.actionCastTime] : true,
	[Effect.Types.tieToRandomBondageDevice] : true,
	[Effect.Types.addWrapperMaxDuration] : true,
	[Effect.Types.css] : true,

};

Effect.KnockdownTypes = {
	Forward : 0,
	Back : 1,
};


Effect.TypeDescs = {
	[Effect.Types.damage] : "{amount:(str)formula, type:(str)Action.Types.x, leech:(float)leech_multiplier, dummy_sender:false, heal_aggro:(float)multiplier=0.5} - If type is left out, it can be auto supplied by an asset. dummy_sender will generate a blank player with level set to the player average. heal_aggro only works on negative amounts, and generates threat on all enemies equal to amount healed times heal_aggro",
	[Effect.Types.endTurn] : "void - Ends turn",
	[Effect.Types.trace] : '{message:(str)message} - Creates a stack trace here',
	[Effect.Types.css] : "Applies CSS classes onto the target. {class:css_class}",
	[Effect.Types.hitfx] : "Trigger a hit effect on target. {id:effect_id[, origin:(str)targ_origin, destination:(str)targ_destination]}",
	[Effect.Types.damageArmor] : "{amount:(str)(nr)amount,slots:(arr)(str)types,max_types:(nr)max=ALL} - Damages armor. Slots are the target slots. if max_types is a number, it picks n types at random", 
	[Effect.Types.addAP] : "{amount:(str)(nr)amount, leech.(float)leech_multiplier}, Adds AP",									
	[Effect.Types.addMP] : "{amount:(str)(nr)amount, leech.(float)leech_multiplier}, Adds MP",									
	[Effect.Types.addArousal] : "{amount:(str)(nr)amount, leech.(float)leech_multiplier} - Adds arousal points",	
	[Effect.Types.addHP] : "{amount:(str)(nr)amount, leech.(float)leech_multiplier}, Adds HP. You probably want to use damage instead. This will affect HP without any comparison checks.",									
				
	
	[Effect.Types.setHP] : "{amount:(str)(nr)amount} - Sets HP value",							
	[Effect.Types.setMP] : "{amount:(str)(nr)amount} - Sets MP value",							
	[Effect.Types.setArousal] : "{amount:(str)(nr)amount} - Sets arousal value",				
	[Effect.Types.setAP] : "{amount:(str)(nr)amount} - Sets AP value",							
	
	[Effect.Types.expMod] : "{amount:(nr)multiplier} - Multiplier against experience gain",							
	
	[Effect.Types.interrupt] : "{force:false} - Interrupts all charged actions. If force is true, it also interrupts non-interruptable spells (useful for boss abilities).",							
	[Effect.Types.blockInterrupt] : "void - Prevents normal interrupt effects",							
	[Effect.Types.healInversion] : "void - Makes healing effects do damage instead",			
	[Effect.Types.globalHitChanceMod] : '{amount:(int)(float)(string)amount Modifies your hit chance with ALL types by percentage, multiplier:(bool)isMultiplier=false }',
	[Effect.Types.globalDamageTakenMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage dealt from the caster', 
	[Effect.Types.globalArousalTakenMod] : '{amount:(int)(float)(string)multiplier, casterOnly:(bool)limit_to_caster=false} - Only works on ADDing arousal. If casterOnly is set, it only affects arousal dealt from the caster', 
	[Effect.Types.globalDamageDoneMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage done to the caster',
	
	[Effect.Types.globalHealingDoneMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage done to the caster',
	[Effect.Types.globalHealingTakenMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects damage done to the caster',
	
	[Effect.Types.carryModifier] : '{amount:(nr)(string)amount, multiplier:(bool)isMultiplier=false} - Adds or multiplies target carrying capacity. Nonmultiplier is in grams',

	// These add or subtract critical hit chance
	[Effect.Types.critDoneMod] : '{amount:(float)(string)amount, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects crit chance for the cast. Note that this is ADDITIVE, so 0.25 = 25%',
	[Effect.Types.critTakenMod] : '{amount:(float)(string)amount, casterOnly:(bool)limit_to_caster=false} - If casterOnly is set, it only affects the caster critting on the target. ADDITIVE. 0.25 = +25% etc',

	
	[Effect.Types.gameAction] : '{action:(obj/arr)gameAction} - Lets you run one or many game actions',
	[Effect.Types.addActionCharges] : 'addActionCharges',					// {amount:(nr/str)amount, }

	[Effect.Types.physicalProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the damage armor chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	[Effect.Types.corruptionProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the arousal proc chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	[Effect.Types.elementalProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the AP damage chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	[Effect.Types.holyProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the arousal wiping chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	
	[Effect.Types.healAggroMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the heal aggro against this value. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	

	[Effect.Types.allowReceiveSpells] : '{conditions:(arr)conditions} - Filters what spells may target the affected player. Checked in Player',
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

	[Effect.Types.runWrappers] : '{wrappers:(arr)wrappers, stacks:(int)=auto} - Runs wrappers. Auto target is victim, or caster if effect caster property is true. Stacks lets you override the stacks of the wrapper to run. -1 will use the same nr of stacks as the parent of this effect.',
	[Effect.Types.assetWrappers] : '{wrappers:(arr)wrappers, conditions:(arr)asset_conditions, max:(int)max_assets=1, random=true, unequipped=false} - Adds wrappers and attaches them to assets that pass conditions filters. Wrapper conditions are also checked before allowing them through. If unequipped is true, it also allows unequipped assets.',

	[Effect.Types.disrobe] : '{slots:(arr)(str)Asset.Slots.*, numSlots:(int)max_nr=all}',
	[Effect.Types.steal] : '{conditions:(arr)conditions, num_items:(str/int)nr_items_to_steal=1} - Steals one or many random items from your target. Conditions are run against an event with asset, wrapper, effect, sender, target',

	[Effect.Types.addStacks] : '{stacks:(int)(str)stacks=1, conditions:(arr)conditions(undefined=this.parent), casterOnly:(bool)=true, refreshTime=(bool)=auto} - If refreshTime is unset, it reset the time when adding, but not when removing stacks. If conditions is unset, it tries to affect the effect parent.',
	[Effect.Types.addWrapperTime] : '{amount:(int)(str)time, conditions:(arr)conditions(undefined=this.parent), casterOnly:(bool)true}',
	[Effect.Types.removeParentWrapper] : 'void - Removes the effect\'s parent wrapper',
	[Effect.Types.removeWrapperByLabel] : '{ label:(arr)(str)label, casterOnly:(bool)=false)}',
	[Effect.Types.removeWrapperByTag] : '{tag:(str/arr)tags}',
	[Effect.Types.removeEffectWrapperByEffectTag] : '{tag:(str/arr)tags} - Searches for _effects_ currently affecting you. And removes their wrappers if the effect has at least one of these tags.',
	[Effect.Types.addWrapperMaxDuration] : '{amount:(int)(str)time, conditions:(arr)conditions, casterOnly:(bool)=false} - Newly added wrappers that pass filter have their duration increased by this value (can be negative). This cannot be used to bring a duration below 0, and only works on effects with a duration of at least 1.',

	[Effect.Types.activateCooldown] : '{actions:(str)(arr)actionLabels, charges=1} - Consumes ability charges',
	[Effect.Types.lowerCooldown] : '{actions:(str)(arr)actionLabels, amount:(int)amount=inf} - Lowers or resets cooldowns on the target by label. NOTE: This will not add more than 1 charge.',

	[Effect.Types.knockdown] : '{type:(int)type} - Prevents melee abilities. Use Effect.KnockdownTypes. If not an int it becomes boolean backwards of forwards.',
	[Effect.Types.grapple] : '{}',
	[Effect.Types.daze] : 'void - Prevents the use of ranged abilities.',
	[Effect.Types.disable] : '{level:(int)disable_level=1, hide:(bool)hide_disabled_spells=false} - Prevents all spells and actions unless they have disable_override equal or higher than disable_level',
	[Effect.Types.disableActions] : '{conditions:(arr)conditions, hide:(bool)hide_disabled_spells=false} - Disables all spells that matches conditions',
	[Effect.Types.actionApCost] : '{conditions:(arr)conditions, amount:(int)amount=1, set:(bool)=false} - Alters or sets the AP cost of one or more actions. Actions affected are checked by conditions.',
	[Effect.Types.actionCastTime] : '{conditions:(arr)conditions, amount:(int)amount=1, set:(bool)=false, multiplier:(bool)is_multiplier=false} - Alters or sets the cast time of one or more actions. Actions affected are checked by conditions.',
	
	[Effect.Types.repair] : '{amount:(int)(str)(float)amount, multiplier:(bool)is_multiplier, min:(int)minValue}',
	[Effect.Types.flee] : 'void - Custom action sent to server to flee combat',
	[Effect.Types.addThreat] : '{amount:(str/nr)amount} - Generates threat on the target',
	[Effect.Types.punishmentUsed] : 'void - Sets the punishment used flag on the target to prevent them from using further punishments',

	[Effect.Types.stun] : '{ignoreDiminishing:(bool)=false}',
	[Effect.Types.taunt] : '{victim:(bool)=false, melee:(bool)=undefined} - If victim is true, it makes the caster taunted by the victim instead. Useful for when a player gets "marked", like in the cocktopus spell. If melee is true it only taunts melee spells, if false it only taunts ranged, if undefined it taunts both.',

	[Effect.Types.addActions] : '{actions:(str/arr)actions} - Unlocks specified actions while you\'re under the effect of this',
	[Effect.Types.none] : 'Void. You probably only want to use this if you want an effect that adds tags but nothing else',
	[Effect.Types.addMissingFxTag] : '{tag:(str/arr)tags, max:(int)=1} - Adds one or more tags to this Effect that the target doesn\'t have.',
	[Effect.Types.tieToRandomBondageDevice] : '{_device:(str)DungeonAssetID} - _device is auto added. Ties the player to a random device that has the m_bondage tag. See stdTag.js for more info',
	[Effect.Types.addExposedOrificeTag] : '{relax:(str)"notHard"/"all"} - Similar to above, but it checks availability and exposed status of stdTag.wrBlockGroin, wrBlockButt, wrBlockMouth, and adds one of them. Useful for latching that should occupy a slot. Checks for exposed by default, but you can also limit it to non-hard armor or no limits.',
	[Effect.Types.addTags] : '{tags:(arr/str)tags} - Adds tags to the effect itself.',
	[Effect.Types.addRandomTags] : '{tags:(arr)tag_objs, amount:(int)amount=1} - Adds a random set of tags from tag_objs. Tag objects consist of {tags:(arr/str)tags, conds:(arr)conditions}',
	[Effect.Types.summonAsset] : '{asset:(str)assetLabel, equip:(bool)autoEquip=true} - Creates an asset and puts it in the target inventory. If equip is set, it equips as well.',
};


export {Wrapper, Effect, WrapperReturn};