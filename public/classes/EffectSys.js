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
		this.rarity = 0;					// Used to colorize it when attached to armor. 0 = white, -1 = red, the rest use rarity colors from Asset
		this.tags = [];						// wr_ is prepended
		this.stacks = "1";					// Either a number or formula
		this.max_stacks = 1;
		this.name = "";
		this.icon = "";
		this.description = "";
		this.editor_desc = '';					// Short description for the editor
		this.detrimental = true;
		this.unique = false;					// When set, removes any existing effects with the same label from any other players, and adds their stacks
		this.trigger_immediate = false;			// Trigger immediate if it's a duration effect
		this.ext = false;						// Makes the timer count use in game time intead of combat arounds, and makes it persist outside of combat. Duration becomes time in seconds.
		this.asset = '';						// Bound to this asset id
		this.hidden = false;					// Hide effect from player box
		this.tick_on_turn_start = true;			// Tick on turn start
		this.tick_on_turn_end = false;			// Tick on turn end

		this.global = false;				// Host only: Applied to all players as passives whenever they're added to the game, provided conditions are matched

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
			hidden : this.hidden,
			duration : this.duration,
			ext : this.ext,
			rarity : this.rarity,
			unique : this.unique
		};
		

		if( full ){
			out.tick_on_turn_end = this.tick_on_turn_end;
			out.tick_on_turn_start = this.tick_on_turn_start;
			out.max_stacks = this.max_stacks;
			out.trigger_immediate = this.trigger_immediate;
			out.editor_desc = this.editor_desc;
			out.global = this.global;

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


		
	}

	load( data ){
		this.g_autoload(data);
	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super

		if( !isNaN(this.stacks) )
			this.stacks = parseInt(this.stacks);

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

	getCaster( allowParent = true ){

		const out = game.getPlayerById(this.caster);
		if( out || !allowParent )
			return out;
		return this.getPlayerParent();	// Used in traps since they don't add the "trap player" to the game

	}
	getStacks( sender, targ ){

		if( !sender )
			sender = this.getCaster();
		if( !targ )
			targ = this.getPlayerParent();

		return parseInt(Calculator.run(this.stacks, new GameEvent({sender:sender, target:targ, wrapper:this}))) || 1;

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

	getAction(){

		let target = this.getVictim();
		if( !target )
			return false;

		return target.getActionById(this.action);

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
				pl = game.roleplay.getTargetPlayers();
			}
			else
				pl = [player]; 
			
		}


		let successes = 0;
		for( let p of pl ){	

			// Ignore wrapper effect
			if( !(p instanceof Player) )
				console.error("Trying to use an action against non player", p, "wrapper", this);
			let blocked = p.getBlockedWrappers();
			if( blocked.includes(this.label) )
				continue;

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
				obj.stacks = this.getStacks(caster_player, player);	// If stacks is a formula, it's converted here and stored as an int

				if( this.ext )
					obj._added = game.time;

			}

			let caster = obj.getCaster(),
				victim = game.getPlayerById(obj.victim)
			;
			const testEvt = new GameEvent({
				sender:caster, 
				target:victim, 
				custom:{isChargeFinish}
			});
			if( !obj.testAgainst(testEvt, isTick) || !caster || !victim ){

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
				let toRemove = [];
				for( let wrapper of p.wrappers ){
					if( wrapper.label !== obj.label )
						continue;
					const byCaster = wrapper.caster === caster.id;
					if( !byCaster && !this.unique )
						continue;
					add_stacks += wrapper.getStacks();
					toRemove.push(wrapper);	// Store in an array so we don't remove from the array we're iterating

				}
				for( let wrapper of toRemove )
					wrapper.remove();

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
							action : this.getAction(),
						}).raise();
						continue;

					}
					
					// Successfully applied a stun
					new GameEvent({
						type : GameEvent.Types.stun,
						sender : caster,
						target: victim,
						wrapper : obj,
						action : this.getAction()
					}).raise();

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

		amount = +amount;
		this.stacks = parseInt(this.stacks) || 0;
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

	getVictim(){
		return game.getPlayerById(this.victim);
	}

	tick(){
		let a = game.getPlayerById(this.caster), t = this.getVictim();
		this.useAgainst( a, t, true );
	}

	remove( expired = false ){
		
		// Ugly way of preventing recursion
		if( this._expiring )
			return;
		this._expiring = true;

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
			sender : this.getCaster(false),
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

		/*
		Not sure why ticking shouldn't work on real timer effects. Removing this to see if it breaks something.
		if( this.ext )
			return;
		*/
		if( this.tick_on_turn_start ){
			this.tick();
		}

		if( this.duration < 1 )
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

	// Get wrappers labeled as kinks
	static getKinks(){
		return glib.getAllValues("Wrapper").filter(wrapper => wrapper.hasTag(stdTag.wrKink)).map(el => {
			return el.rebaseIfNeeded();
		});
	}

	static getGlobalWrappers(){
		return glib.getAllValues("Wrapper").filter(wrapper => wrapper.global).map(el => {
			return el.rebaseIfNeeded();
		});
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
Wrapper.TARGET_RP_TP = "RP_TP";				// RP Target players
Wrapper.TARGET_AOE_WPTEAM = "S_TEAM";		// AoE on paret wrapper parent's team. Useful in procs so you don't have to tunnel wrappers. The wrapper is the effect parent.
Wrapper.TARGET_AOE_NOT_WPTEAM = "O_TEAM";	// Inverse of above.

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
	aoe_wp_team : Wrapper.TARGET_AOE_WPTEAM,
	aoe_not_wp_team : Wrapper.TARGET_AOE_NOT_WPTEAM,
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
			conditions : Condition.saveThese(this.conditions, full),	// Needed for things like taunt etc
		};

		if( full ){
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

		if( [Effect.Types.runWrappers, Effect.Types.assetWrappers].includes(this.type) && this.data.wrappers ){
			this.data.wrappers = Wrapper.loadThese(toArray(this.data.wrappers), this);
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
		// Grapple needs to be manually added		
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
		// Automatically handles originalWrapper and sets event wrapper to the effect parent
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
			else if( ta === Wrapper.TARGET_AOE_WPTEAM && wrapper.getPlayerParent() ){
				tout = tout.concat(game.getTeamPlayers(wrapper.getPlayerParent()?.team) );
			}
			else if( ta === Wrapper.TARGET_AOE_NOT_WPTEAM && wrapper.getPlayerParent() ){
				tout = tout.concat(game.getPlayersNotOnTeam(wrapper.getPlayerParent()?.team) );
			}
			
			else if( ta === Wrapper.TARGET_RP_TP ){
				tout.push(...game.roleplay.getTargetPlayers());
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

		// Automatically get type from this.data.type first
		let attackType = this.data.type;
		let action = wrapper.getAction();
		if( !attackType && action )
			attackType = action.type;
		if( !attackType )
			attackType = Action.Types.physical;

		if( debug )
			console.debug("Allowed ", this, "to trigger", event, "against", tout);

		for( let t of tout ){

			// If the target is the sender, then it flipflops
			// ApplyWrapper already supports custom logic for targets
			let s = sender;
			if( t === sender ){
				s = target;
			}

			const sMajor = s.getMajorEffects();
			const tMajor = t.getMajorEffects();
			
			// Do damage or heal
			if( this.type === Effect.Types.damage ){

				let type = attackType;

				let e = GameEvent.Types.damageDone, e2 = GameEvent.Types.damageTaken;
				const calcEvt = new GameEvent({sender:s, target:t, wrapper:wrapper, effect:this});

				let amt = -Calculator.run(
					this.data.amount, 
					calcEvt
				);
				// Actual damage/healing, overkill/healing
				let actualAmount, overAmount;

				if( !this.no_stack_multi )
					amt *= wrapper.getStacks();


				if( s.isHealInverted() )
					amt = -Math.abs(amt);


				// Only affects damage/healing
				const crit = wrapper._crit;
				if( crit )
					amt *= 2*t.getCritTakenMod(s)*s.getCritDoneMod(t);

				// Healing
				if( amt > 0 ){

					amt = randRound(amt);
					amt *= s.getGenericAmountStatMultiplier( Effect.Types.globalHealingDoneMod, t );
					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalHealingTakenMod, s );
					// Major mending = +50% for sender
					if( sMajor & Effect.Major.Mending )
						amt *= 1.5;
					// Major blessing = +50% for target
					if( tMajor & Effect.Major.Blessing )
						amt *= 1.5;
					// Major defile = -50% for target
					if( tMajor & Effect.Major.Defile )
						amt *= 0.5;

					// Set event types
					e = GameEvent.Types.healingDone;
					e2 = GameEvent.Types.healingTaken;
					
					
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
						"nudity multi", t.getArmorDamageMultiplier(s, this),
						"sMajor", sMajor, "tMajor", tMajor
					);
					*/
					// Get target global damage point taken modifier

					// Amt is negative
					amt -= t.getGenericAmountStatPoints( Effect.Types.globalDamageTakenMod, s, action );
					
					// amt is negative when attacking, that's why we use - here
					amt -= s.getGenericAmountStatPoints( Effect.Types.globalDamageDoneMod, t, action );
					
					// Multipliers last
					amt *= Player.getBonusDamageMultiplier( s,t,type,wrapper.detrimental ); // Negative because it's damage
					amt *= s.getGenericAmountStatMultiplier( Effect.Types.globalDamageDoneMod, t, action );

					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalDamageTakenMod, s, action );
					amt *= t.getArmorDamageMultiplier( s, this );

					// Major aggression: +30% for sender
					if( sMajor & Effect.Major.Aggression )
						amt *= 1.3;
					// Major weakness: -30% for sender
					if( sMajor & Effect.Major.Weakness )
						amt *= 0.7;
					// Major defense: -30% for target 
					if( tMajor & Effect.Major.Defense )
						amt *= 0.7;
					// Major vulnerability: +30% for target 
					if( tMajor & Effect.Major.Vulnerability )
						amt *= 1.3;
					
					amt = randRound(amt);
					if( amt > 0 )
						amt = 0;

					//console.debug("amt", amt);

					// Calculate durability damage				
					if( type === Action.Types.physical ){

						let procChance = 10*s.getStatProcMultiplier(Action.Types.physical, false)*t.getStatProcMultiplier(Action.Types.physical, true);
						let ch = amt*procChance;
						ch = Math.abs(ch);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot )
							wrapperReturn.mergeFromPlayerDamageDurability(t, t.damageDurability(s, this, tot, "RANDOM", true));
						
						
					}

					// 30% chance per point of damage to remove 1 block of all types 
					if( type === Action.Types.arcane ){

						let chance = 30*s.getStatProcMultiplier(Action.Types.arcane, false)*t.getStatProcMultiplier(Action.Types.arcane, true)
						let ch = amt*chance;
						ch = Math.abs(ch);
						let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
						if( tot ){

							// Returns negative, which is why it's min
							let max = Math.min(
								t.addBlock( -tot )
							);
							if( max )
								game.ui.addText( t.getColoredName()+" lost "+Math.abs(max)+" block from arcane damage.", undefined, s.id, t.id, 'statMessage elemental' );

						}
							
					}

				}

				
					

				// Calculate arousal (allowed for both healing and damaging)
				if( type === Action.Types.corruption && t.arousal < t.getMaxArousal() ){

					// 30% chance per point of damage
					let procChance = 30*s.getStatProcMultiplier(Action.Types.corruption, false)*t.getStatProcMultiplier(Action.Types.corruption, true);
					let ch = Math.abs(amt*procChance);

					ch *= t.getGenericAmountStatMultiplier( Effect.Types.globalArousalTakenMod, s );
					// Major focus: -50% for target
					if( tMajor & Effect.Major.Focus )
						ch *= 0.5;
					// Major touch: +50% for sender
					if( sMajor & Effect.Major.Touch )
						ch *= 1.5;
					
					let tot = Math.floor(ch/100)+(Math.random()*100 < (ch%100));
					const start = t.arousal;

					if( start < t.getMaxArousal() ){

						t.addArousal(tot, true, undefined, s);
						tot = t.arousal-start;
						if( t.arousal !== start )
							game.ui.addText( t.getColoredName()+" gained "+Math.abs(tot)+" arousal from corruption.", undefined, s.id, t.id, 'statMessage arousal' );

					}

				}

				let noBlock;
				if( amt < 0 && this.data.no_block )
					noBlock = true;

				if( isNaN(amt) )
					console.error("NaN damage amount found in", this);

				let preHP = t.hp/t.getMaxHP();
				let exec = t.addHP(amt, s, this, type, noBlock, true);
				let died = exec.died;

				overAmount = amt;
				
				const changehp = exec.hp;
				const changeblk = exec.blk;
				amt = changehp+changeblk;
				actualAmount = amt;
				overAmount = Math.abs(overAmount-actualAmount);
				actualAmount = Math.abs(actualAmount);

				if( amt < 0 ){

					t.onDamageTaken(s, type, Math.abs(amt));
					s.onDamageDone(t, type, Math.abs(amt));

					let threat = amt * (!isNaN(this.data.threatMod) ? this.data.threatMod : 1);
					let leech = !isNaN(this.data.leech) ? Math.abs(Math.round(amt*this.data.leech)) : 0;
					

					t.addThreat( s.id, -threat );

					if( amt )
						game.ui.addText( t.getColoredName()+" took "+Math.abs(changehp)+(changeblk ? ' ['+Math.abs(changeblk)+']' : '')+" "+type+" damage"+(wrapper.name ? ' from '+wrapper.name : '')+(crit ? ' (CRITICAL)' :'')+".", undefined, s.id, t.id, 'statMessage damage'+(crit ? ' crit':'') );
					
					if( leech ){
						s.addHP(leech, s, this, type, false, true);
						game.ui.addText( s.getColoredName()+" leeched "+leech+" HP.", undefined, s.id, t.id, 'statMessage healing' );
						new GameEvent({
							type : GameEvent.Types.lifeSteal,
							sender : s,
							target : t,
							wrapper : wrapper,
							effect : this,
							custom : {
								amount : leech
							}
						});
					}

				}else if(amt){

					t.onHealingTaken(s, type, Math.abs(amt));
					s.onHealingDone(t, type, Math.abs(amt));
					game.ui.addText( t.getColoredName()+" gained "+changehp+" HP"+(changeblk ? ' +'+changeblk+' block' : '')+(wrapper.name ? ' from '+wrapper.name : '')+(crit ? ' (CRITICAL)' : '')+".", undefined, s.id, t.id, 'statMessage healing' );

				}


				// Damage/healing done
				let doneEvt = new GameEvent({
					type : e,
					sender : s,
					target : t,
					wrapper : wrapper,
					effect : this,
					custom : {
						amount : actualAmount,
						overAmount : overAmount,
						hpPre : preHP
					}
				});
				doneEvt.raise();
				
				// damage/healing taken
				const takenEvt = new GameEvent({
					type : e2,
					sender : s,
					target : t,
					wrapper : wrapper,
					effect : this,
					custom : {
						amount : actualAmount,
						overAmount : overAmount,
						hpPre : preHP
					}
				}).raise();

				// Re-raise as hpDamageTaken taken
				if( amt < 0 && changehp ){
					takenEvt.type = GameEvent.Types.hpDamageTaken;
					takenEvt.raise();
				}


				if( died )
					new GameEvent({
						type : GameEvent.Types.playerDefeated,
						sender : s,
						target : t,
						wrapper : wrapper,
						effect : this
					}).raise();
			}

			else if( this.type === Effect.Types.fullRegen ){

				t.fullRegen();

			}

			else if( this.type === Effect.Types.momentumNextTurn ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				if( !this.no_stack_multi )
					amt *= this.parent.getStacks();
				t.addIncomingMomentum(this.data.type, amt);
				
			}

			else if( this.type === Effect.Types.addMomentum ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({sender:s, target:t, wrapper:this.parent, effect:this
				}));
				if( !this.no_stack_multi )
					amt *= this.parent.getStacks();

				let type = Player.getValidMomentum(this.data.type);
				let pre = t.getMomentum(type);

				const changed = t.addMomentum(type, amt, true);	// array of [nrOff, nrDef, nrUti]

				let change = t.getMomentum(type)-pre;
				if( change )
					game.ui.addText( t.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" momentum"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage AP' );
					
				if( +this.data.leech && change < 0 ){

					change = 0;
					for( let i = 0; i < changed.length; ++i ){
						
						let nr = randRound(Math.abs(changed[nr])*this.data.leech);
						if( nr ){

							s.addMomentum(type, nr, true);
							change += nr;

						}

					}
					
					if( change )
						game.ui.addText( s.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" Momentum"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, t.id, s.id, 'statMessage AP' );

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
					amt *= wrapper.getStacks();
				amt = Math.floor(amt);
				game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" HP"+(wrapper.name ? ' from '+wrapper.name : '')+".", undefined, s.id, t.id, 'statMessage HP' );
				t.addHP(amt, s, this, attackType, false, true);
			}
			else if( this.type === Effect.Types.addBlock ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:wrapper, effect:this
					}).mergeUnset(event)
				);
				if( !this.no_stack_multi )
					amt *= wrapper.getStacks();

				let aa = Math.abs(amt);
				if( Math.random() < aa-Math.trunc(aa) )
					amt += amt < 0 ? -1 : 1;
				
				amt = parseInt(amt);
				//game.ui.addText( t.getColoredName()+" "+(amt > 0 ? 'gained' : 'lost')+" "+Math.abs(amt)+" HP"+(wrapper.name ? ' from '+wrapper.name : '')+".", undefined, s.id, t.id, 'statMessage HP' );
				t.addBlock(amt);

			}

			

			else if( this.type === Effect.Types.addArousal ){

				let amt = Calculator.run(
					this.data.amount, 
					new GameEvent({
						sender:s, target:t, wrapper:this.parent, effect:this
					}).mergeUnset(event)
				);

				if( amt > 0 ){

					amt *= t.getGenericAmountStatMultiplier( Effect.Types.globalArousalTakenMod, s );
					// Major focus: -50% for target
					if( tMajor & Effect.Major.Focus )
						ch *= 0.5;
					// Major touch: +50% for sender
					if( sMajor & Effect.Major.Touch )
						ch *= 1.5;

				}
				if( !this.no_stack_multi )
					amt *= this.parent.getStacks();


				let pre = t.arousal;
				t.addArousal(amt, true, undefined, s);
				let change = t.arousal-pre;
				
				if( change )
					game.ui.addText( t.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, s.id, t.id, 'statMessage arousal' );
				
				
				if( +this.data.leech ){

					pre = s.arousal;
					s.addArousal(-amt, true, undefined, s);
					let change = s.arousal-pre;
					if( change )
						game.ui.addText( s.getColoredName()+" "+(change > 0 ? 'gained' : 'lost')+" "+Math.abs(change)+" arousal"+(this.parent.name ? ' from '+this.parent.name : '')+".", undefined, t.id, s.id, 'statMessage arousal' );
					

				}
				
			}

			else if( 
				this.type === Effect.Types.setHP || 
				//this.type === Effect.Types.setAP || 
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
					/*
					else if( this.type === Effect.Types.setAP ){
						t.ap = amt;
						t.addAP(0);
					}
					*/
					else if( this.type === Effect.Types.setArousal ){
						t.arousal = amt;
						t.addArousal(0);
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
					amt *= wrapper.getStacks();
				t.addThreat(s.id, amt);
			}

			else if( this.type === Effect.Types.punishmentUsed )
				t.used_punish = true;

			// End turn
			else if( this.type === Effect.Types.endTurn ){

				t.endedTurn = true;
				game.end_turn_after_action = true;
				
			}


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


				for( let w of wrappers ){

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
							stacks = this.parent.getStacks();

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

					for( let w of wrappers ){

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
			else if( this.type === Effect.Types.addReroll ){
				
				const amt = Calculator.run(
					this.data.amount,
					new GameEvent({
						sender:s, target:t, wrapper:this.parent, effect:this
					})
				);
				t.consumeReroll( -amt );
				
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
					if(t.unequipAsset(asset.id, s)){
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
					t.unequipAsset(item.id, s, true);
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
						wr.hasTag(tags) &&
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
				t.consumeActionCharges(this.data.actions, this.data.charges, this.data.cd);
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
					amt *= wrapper.getStacks();
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
				game.attemptFleeFromCombat( s, this.data.force );
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
				if( this.data.relax === 'unblocked' )
					conds = ['targetButtUnblocked', 'targetMouthUnblocked', 'targetVaginaUnblocked'];
				else if( this.data.relax === "notHard" )
					conds = ['targetButtUnblockedAndNotHard','targetMouthUnblockedAndNotHard','targetVaginaUnblockedAndNotHard'];
				else if( this.data.relax === "all" )
					conds = [false, false, false];

				if( this.data.relax !== "all" )
					conds = Condition.loadThese(conds);
				const tags = [stdTag.wrBlockButt, stdTag.wrBlockMouth, stdTag.wrBlockGroin];
				for( let i =0; i<conds.length; ++i ){
					
					if( 
						(i !== 1 || !this.data.ignoreMouth) && 
						(!conds[i] || conds[i].test(tEvent)) 
					)viable.push(tags[i]);

				}


				console.log(viable, tEvent, conds);
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
					assets.map(asset => t.equipAsset(asset.id, s, true));

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
			
			if( evt.substring(0,8) !== "internal" ){

				const binding = GameEvent.on(evt, event => {
					this.trigger(event);
				});
				binding.parent = this;
				this._bound_events.push(binding);

			}

		}

	}
	unbindEvents(){
		const evts = this._bound_events.slice();
		for(let evt of evts)
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

		const ot = game.getPlayerById(this.parent.original_target);
		if( type === Wrapper.Targets.aoe )
			return game.getEnabledPlayers();
		if( type === Wrapper.Targets.target_aoe_not_wp_team )
			return game.getEnabledPlayers().filter(el => ot && el.team !== ot.team);
		if( type == Wrapper.Targets.target_aoe_not_wp_team )
			return ot ? game.getTeamPlayers(ot?.team) : [];
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
			amt *= this.parent.getStacks();
		return Math.ceil(amt);

	}

	// Checks if target is affecting a specific player
	affectingPlayer( player, debug ){

		if( !player )
			return false;

		if( !(player instanceof Player) ){
			console.error(player);
			throw 'Above is not a player';
		}

		if( !(player._ignore_check_effect instanceof Map) ){
			console.log(player);
		}

		// Ignore to prevent recursion
		if( player._ignore_check_effect.get(this) )
			return false;

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
			player._ignore_check_effect.set(this, true);
			// Check conditions
			const out = Condition.all(this.conditions, new GameEvent({
				sender : this.parent.parent,		// Sender in this case is the person who has the wrapper
				target : player,					// Target in this case is the target of the effect
				wrapper : this.parent,
				effect : this
			}));
			player._ignore_check_effect.set(this, false);
			return out;
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

	if( !this.Types[type] ){
		console.log("Type", type, "not found");
		return false;
	}
	return new Effect({
		type : type,
		data : {amount:bonus},
		events : [],
	});

};

// These are major hard-coded effects. They don't stack, but can be reused in many places. 
// They use bitwise to make it easier to have multiple wrappers active that apply the same effect, and with varying durations
// The primary purpose to doing it like this is to simplify buffs and debuffs for developers.
Effect.Major = {
	Aggression : 0x1,		// +30% damage done
	Defense : 0x2,			// -30% Damage taken
	Vulnerability : 0x4,	// +30% Damage taken
	Weakness : 0x8,			// -30% Damage done
	//Sensitivity : 0x10,		// +100% arousal taken
	Focus : 0x20,			// 32 | -50% arousal taken
	Defile : 0x40,			// 64 | -50% healing received
	Blessing : 0x80,		// 128 | +50% healing received
	Mending : 0x100,		// 256 | +50% healing done
	Momentum : 0x200,		// 512 | +1 momentum regen
	Lifesteal : 0x400,		// 1024 | +2 HP to any player attacking the target
	Accuracy : 0x800,		// 2048 | +30% hit chance
	Touch : 0x1000,			// 8192 | +50% arousal generated
	Laze : 0x2000,			// 81 -1 momentum regen
	Brawn : 0x4000, 		// +5 physical proficiency
	Corruption : 0x8000,	// +5 corruption proficiency
	Arcana : 0x10000,		// +5 arcane proficiency
	Stagger : 0x20000,		// -5 Physical avoidance.
	Sensitivity : 0x40000,	// -5 corruption avoidance.
	Conduit : 0x80000,		// 524288 | -5 Arcane avoidance.
	Clumsy : 0x100000,		// 1048576 | -30% hit chance
	Penetration : 0x200000,	// +50% armor penetration
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
	addMomentum : "addMomentum",
	addHP : "addHP",
	addBlock : "addBlock",
	preventBlockAutoFade : "preventBlockAutoFade",
	momentumRegen : "momentumRegen",
	momentumNextTurn : "momentumNextTurn",
	
	maxHP : 'maxHP',
	maxArousal : 'maxArousal',
	
	fullRegen : 'fullRegen',

	setHP : 'setHP',
	setArousal : 'setArousal',
	//setAP : 'setAP', // Todo: Need revamp
	
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
	critDmgDoneMod : 'critDmgDoneMod',
	critDmgTakenMod : 'critDmgTakenMod',

	globalArousalTakenMod : 'globalArousalTakenMod',
	gameAction : 'gameAction',
	addActionCharges : 'addActionCharges',		

	carryModifier : "carryModifier",	

	expMod : "expMod",

	svPhysical : 'svPhysical',				
	svArcane : 'svArcane',				
	svCorruption : 'svCorruption',			

	bonPhysical : 'bonPhysical',			
	bonArcane : 'bonArcane',	
	bonCorruption : 'bonCorruption',		

	physicalProcMultiplier : 'physicalProcMultiplier',
	arcaneProcMultiplier : 'arcaneProcMultiplier',
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

	preventWrappers : 'preventWrappers',

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

	actionRiposte : 'actionRiposte',
	actionCastTime : 'actionCastTime',
	preventBlock : 'preventBlock',
	summonAsset : 'summonAsset',
	globalArmorMod : 'globalArmorMod',
	globalArmorPen : 'globalArmorPen',
	clairvoyance : 'clairvoyance',
	untargetable : 'untargetable',
	majorEffect : 'majorEffect',
	addReroll : 'addReroll',
};

// Effect types that can be passive. Helps prevent recursion. Effects that don't have this set won't have their tags checked.
Effect.Passive = {

	[Effect.Types.none] : true,
	[Effect.Types.addExposedOrificeTag] : true,	// Needed for cocktopus
	[Effect.Types.globalHitChanceMod] : true,
	[Effect.Types.globalDamageTakenMod] : true,
	[Effect.Types.globalDamageDoneMod] : true,
	[Effect.Types.globalHealingDoneMod] : true,
	[Effect.Types.globalArmorPen] : true,
	[Effect.Types.globalArmorMod] : true,
	[Effect.Types.critDoneMod] : true,
	[Effect.Types.critTakenMod] : true,
	[Effect.Types.critDmgDoneMod] : true,
	[Effect.Types.critDmgTakenMod] : true,
	[Effect.Types.preventBlock] : true,
	[Effect.Types.preventBlockAutoFade] : true,
	[Effect.Types.momentumRegen] : true,
	
	[Effect.Types.globalHealingTakenMod] : true,
	[Effect.Types.globalArousalTakenMod] : true,
	[Effect.Types.carryModifier] : true,
	[Effect.Types.addTags] : true,
	[Effect.Types.addRandomTags] : true,
	[Effect.Types.expMod] : true,

	[Effect.Types.svPhysical] : true,
	[Effect.Types.svArcane] : true,
	[Effect.Types.svCorruption] : true,
	[Effect.Types.blockInterrupt] : true,
	[Effect.Types.maxHP] : true,
	[Effect.Types.maxAP] : true,
	[Effect.Types.maxArousal] : true,

	[Effect.Types.preventWrappers] : true,

	[Effect.Types.bonPhysical] : true,
	[Effect.Types.bonArcane] : true,
	[Effect.Types.bonCorruption] : true,

	[Effect.Types.physicalProcMultiplier] : true,
	[Effect.Types.arcaneProcMultiplier] : true,
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
	[Effect.Types.actionCastTime] : true,
	[Effect.Types.tieToRandomBondageDevice] : true,
	[Effect.Types.addWrapperMaxDuration] : true,
	[Effect.Types.css] : true,
	[Effect.Types.clairvoyance] : true,
	[Effect.Types.untargetable] : true,
	[Effect.Types.actionRiposte] : true,
	[Effect.Types.majorEffect] : true,
};

Effect.KnockdownTypes = {
	Forward : 0,
	Back : 1,
};


Effect.TypeDescs = {
	[Effect.Types.damage] : "{amount:(str)formula, type:(str)Action.Types.x, leech:(float)leech_multiplier, dummy_sender:false, heal_aggro:(float)multiplier=0.5, armor_pen:(int)perc=0, no_block:(bool)=false} - If type is left out, it can be auto supplied by an asset. dummy_sender will generate a blank player with level set to the player average. heal_aggro only works on negative amounts, and generates threat on all enemies equal to amount healed times heal_aggro. Armor pen is a whole number. no_block ignores block",
	[Effect.Types.endTurn] : "void - Ends turn",
	[Effect.Types.fullRegen] : "void - Fully restores a player",
	[Effect.Types.trace] : '{message:(str)message} - Creates a stack trace here',
	[Effect.Types.css] : "Applies CSS classes onto the target. {class:css_class}",
	[Effect.Types.hitfx] : "Trigger a hit effect on target. {id:effect_id[, origin:(str)targ_origin, destination:(str)targ_destination]}",
	[Effect.Types.damageArmor] : "{amount:(str)(nr)amount,slots:(arr)(str)types,max_types:(nr)max=ALL} - Damages armor. Slots are the target slots. if max_types is a number, it picks n types at random", 
	[Effect.Types.addMomentum] : "{amount:(str)(nr)amount, leech:(float)leech_multiplier, type:(int)type=random/all}, Adds or subtracts AP. Leech only works on subtract. If type isn't a valid identifier (0-2) then on subtract it returns your oldest momentum, and on add it adds random momentum.",						
	[Effect.Types.addArousal] : "{amount:(str)(nr)amount, leech:(float)leech_multiplier} - Adds arousal points",	
	[Effect.Types.addHP] : "{amount:(str)(nr)amount, leech.(float)leech_multiplier}, Adds HP. You probably want to use damage instead. This will affect HP without any comparison checks.",									
	[Effect.Types.momentumRegen] : '{amount:(str)(nr)amount, multiplier:(bool)isMultiplier=false} - Increases or decreases the amount of random momentum you gain each turn (not counting class momentum)',
	[Effect.Types.momentumNextTurn] : '{amount:(str)(nr)amount, type:(int)type=random} - Adds additional momentum to the momentum picker next turn',
	[Effect.Types.maxHP] : "{amount:(str)(nr)amount, multiplier:(bool)isMultiplier=false} - Increases max HP",								
	[Effect.Types.maxArousal] : "{amount:(str)(nr)amount, multiplier:(bool)isMultiplier=false} - Increases max arousal",								
	[Effect.Types.preventWrappers] : "{labels:(str/arr)wrapperLabels} - Wrappers with these labels will not be ADDED. Does not affect passives.",								

	[Effect.Types.addBlock] : "{amount:(str)formula} - Adds or subtracts block", 
	[Effect.Types.clairvoyance] : "void - Gives players more information about the victim when inspecting them",
	[Effect.Types.preventBlock] : "{} - Ignores block",
	[Effect.Types.preventBlockAutoFade] : "{} - Prevents block from fading at the start of your turn",
	
	[Effect.Types.setHP] : "{amount:(str)(nr)amount} - Sets HP value",						
	[Effect.Types.setArousal] : "{amount:(str)(nr)amount} - Sets arousal value",				
	//[Effect.Types.setAP] : "{amount:(str)(nr)amount} - Sets AP value",							
	
	[Effect.Types.expMod] : "{amount:(nr)multiplier} - Multiplier against experience gain",							
	
	[Effect.Types.interrupt] : "{force:false} - Interrupts all charged actions. If force is true, it also interrupts non-interruptable spells (useful for boss abilities).",							
	[Effect.Types.blockInterrupt] : "void - Prevents normal interrupt effects",							
	[Effect.Types.healInversion] : "void - Makes healing effects do damage instead",			
	[Effect.Types.globalHitChanceMod] : '{amount:(int)(float)(string)amount Modifies your hit chance with ALL types by percentage, multiplier:(bool)isMultiplier=false, casterOnly(bool)limit_to_caster=false, conditions:(arr)conditions} - If casterOnly is true, it only affects hit chance against the caster of the wrapper.',
	[Effect.Types.globalDamageTakenMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions} - If casterOnly is set, it only affects damage dealt from the caster of the parent wrapper', 
	[Effect.Types.globalArousalTakenMod] : '{amount:(int)(float)(string)multiplier, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions} - Only works on ADDing arousal. If casterOnly is set, it only affects arousal dealt from the caster of the parent wrapper', 
	[Effect.Types.globalDamageDoneMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions=[]} - If casterOnly is set, it only affects damage done to the caster of the parent wrapper. Conditions are checked with attacker vs target',
	[Effect.Types.globalArmorMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false} - Adds, subtracts, or multiplies protection value from armor',
	[Effect.Types.globalArmorPen] : '{amount:(int)points, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions} - If casterOnly is set, it only affects armor pen on the target by the caster.',
	
	[Effect.Types.globalHealingDoneMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions} - If casterOnly is set, it only affects damage done to the caster',
	[Effect.Types.globalHealingTakenMod] : '{amount:(int)(float)(string)amount, multiplier:(bool)isMultiplier=false, casterOnly:(bool)limit_to_caster=false, conditions:(arr)conditions} - If casterOnly is set, it only affects damage done to the caster',
	
	[Effect.Types.carryModifier] : '{amount:(nr)(string)amount, multiplier:(bool)isMultiplier=false} - Adds or multiplies target carrying capacity. Nonmultiplier is in grams',

	// These add or subtract critical hit chance
	[Effect.Types.critDoneMod] : '{amount:(float)(string)amount, casterOnly:(bool)limit_to_caster=false} - Increases chances of doing a critical hit. If casterOnly is set, it only affects crit chance for the cast. Note that this is ADDITIVE, so 0.25 = 25%',
	[Effect.Types.critTakenMod] : '{amount:(float)(string)amount, casterOnly:(bool)limit_to_caster=false} - Increases chance of taking a critical hit. If casterOnly is set, it only affects the caster critting on the target. ADDITIVE. 0.25 = +25% etc',
	[Effect.Types.critDmgDoneMod] : '{amount:(float)(string)multiplier, casterOnly:(bool)limit_to_caster=false} - Multiplies crit damage and healing done. If casterOnly is set, it only affects crits by the caster.',
	[Effect.Types.critDmgTakenMod] : '{amount:(float)(string)multiplier, casterOnly:(bool)limit_to_caster=false} - Multiplies crit damage and healing received. If casterOnly is set, it only affects crits by the caster.',

	
	[Effect.Types.gameAction] : '{action:(obj/arr)gameAction} - Lets you run one or many game actions',
	[Effect.Types.addActionCharges] : '{actions:(arr)actionLabels, amount:(nr/str)amount}',

	[Effect.Types.physicalProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the damage armor chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	[Effect.Types.corruptionProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the arousal proc chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	[Effect.Types.arcaneProcMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the AP damage chance. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	
	[Effect.Types.healAggroMultiplier] : '{amount:(float/str)multiplier, receive:undefined} - Multiplies the heal aggro against this value. If receive is TRUE it multiplies when you are the victim. FALSE multiplies when you are attacker. Anything else multiplies both times.',
	

	[Effect.Types.allowReceiveSpells] : '{conditions:(arr)conditions} - Filters what spells may target the affected player. Checked in Player',
	[Effect.Types.svPhysical] :  '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.svArcane] :  '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.svCorruption] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',

	[Effect.Types.bonPhysical] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
	[Effect.Types.bonArcane] : '{amount:(int)(str)amount, multiplier:(bool)is_multiplier}',
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

	[Effect.Types.activateCooldown] : '{actions:(str)(arr)actionLabels, charges=1, cd=false} - Consumes ability charges. If cd is true, it forces a cooldown activation even if the action doesn\'t have any charges',
	[Effect.Types.lowerCooldown] : '{actions:(str)(arr)actionLabels, amount:(int)amount=inf} - Lowers or resets cooldowns on the target by label. NOTE: This will not add more than 1 charge.',

	[Effect.Types.knockdown] : '{type:(int)type} - Prevents melee abilities. Use Effect.KnockdownTypes. If not an int it becomes boolean backwards of forwards.',
	[Effect.Types.grapple] : '{} - All this does is trigger the x was grappled by y text',
	[Effect.Types.daze] : 'void - Prevents the use of ranged abilities.',
	[Effect.Types.disable] : '{level:(int)disable_level=1, hide:(bool)hide_disabled_spells=false} - Prevents all spells and actions unless they have disable_override equal or higher than disable_level',
	[Effect.Types.disableActions] : '{conditions:(arr)conditions, hide:(bool)hide_disabled_spells=false} - Disables all spells that matches conditions',
	[Effect.Types.actionCastTime] : '{conditions:(arr)conditions, amount:(int)amount=1, set:(bool)=false, multiplier:(bool)is_multiplier=false} - Alters or sets the cast time of one or more actions. Actions affected are checked by conditions.',
	[Effect.Types.actionRiposte] : '{conditions:(arr)conditions, set:(bool)val=false, priority=0} - Overrides the default riposte-able flag on the action. Sorted by priority, then by time added. The effect target is both sender and target when validating the conditions.',
	
	[Effect.Types.repair] : '{amount:(int)(str)(float)amount, multiplier:(bool)is_multiplier, min:(int)minValue}',
	[Effect.Types.flee] : '{force:(bool)ignore_checks=false} - Custom action sent to server to flee combat',
	[Effect.Types.addThreat] : '{amount:(str/nr)amount} - Generates threat on the target',
	[Effect.Types.punishmentUsed] : 'void - Sets the punishment used flag on the target to prevent them from using further punishments',

	[Effect.Types.stun] : '{ignoreDiminishing:(bool)=false}',
	[Effect.Types.taunt] : '{victim:(bool)=false, melee:(bool)=undefined, grapple:(bool=false} - Grapple lets you mark it as a "fake" taunt not counting in isTaunted condition. If victim is true, it makes the caster taunted by the victim instead. Useful for when a player gets "marked", like in the cocktopus spell. If melee is true it only taunts melee spells, if false it only taunts ranged, if undefined it taunts both. NoTag can be used on taunts that don\'t count as taunts, like grapples.',

	[Effect.Types.addActions] : '{actions:(str/arr)actions} - Unlocks specified actions while you\'re under the effect of this',
	[Effect.Types.none] : 'Void. You probably only want to use this if you want an effect that adds tags but nothing else',
	[Effect.Types.addMissingFxTag] : '{tag:(str/arr)tags, max:(int)=1} - Adds one or more tags to this Effect that the target doesn\'t have.',
	[Effect.Types.tieToRandomBondageDevice] : '{_device:(str)DungeonAssetID} - _device is auto added. Ties the player to a random device that has the m_bondage tag. See stdTag.js for more info',
	[Effect.Types.addExposedOrificeTag] : '{relax:(str)undefined/"unblocked"/"notHard"/"all", ignoreMouth:(bool)ignore=false} - Adds a random one of stdTag.wrBlockGroin, wrBlockButt, wrBlockMouth as a tag to the effect based on conditions set by relax. Undefined relax checks for orifice exposed and not already blocked. notHard checks for not already blocked and not hard armor. unblocked checks only for unblocked. All does not check for anything except for presence of vagina for vaginal tag.',
	[Effect.Types.addTags] : '{tags:(arr/str)tags} - Adds tags to the effect itself.',
	[Effect.Types.addRandomTags] : '{tags:(arr)tag_objs, amount:(int)amount=1} - Adds a random set of tags from tag_objs. Tag objects consist of {tags:(arr/str)tags, conds:(arr)conditions}',
	[Effect.Types.summonAsset] : '{asset:(str)assetLabel, equip:(bool)autoEquip=true} - Creates an asset and puts it in the target inventory. If equip is set, it equips as well.',
	[Effect.Types.untargetable] : '{exceptions:(arr)actionLabels, beneficial:(bool)allowBeneficial=false, allow_aoe:(bool)=false} - Makes you untargetable by other players actions. If allowBeneficial is true, it allows you to be targeted by beneficial abilities. If allow AOE it allows you to be targeted by AoE.',
	[Effect.Types.majorEffect] : '{effect:(int)bitwise} - Sets a major effect. These are hard-coded effects that are made to simplify .',
	[Effect.Types.addReroll] : '{amount:(int)(str)amount} - Adds or subtracts reroll for this turn.',
};


export {Wrapper, Effect, WrapperReturn};