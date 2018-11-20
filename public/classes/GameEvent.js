/*

	GameEvent are events used by the game itself (separate from JS UI events)
	They contain metadata and their primary purpose is to be used with conditions
	But they can also be bound to be used whenever they're raised by type anywhere in the code

*/
import Generic from './helpers/Generic.js';

export default class GameEvent extends Generic{

	constructor(data){
		super(data);		
		this.type = null;

		// These are values that can be set
		this.sender = null;
		this.target = null;		// Can be an array
		this.action = null;
		this.wrapper = null;
		this.effect = null;
		this.asset = null;
		this.quest = null;
		this.encounter = null;
		this.custom = {};		// Custom data related to the event	
		this.load(data);

	}

	load(data){
		
		this.g_autoload(data);

	}

	clone(){
		return new this.constructor(this);
	}

	raise(){

		// Run the event
		for(let binding of GameEvent.bindings){
			
			if( binding.type === this.type || binding.type === GameEvent.Types.all )
				binding.fn(this);

		}
	}

}


// Short wrapper class for binding global events
class EventBinding{
	constructor(type, fn){
		this.type = type;
		this.fn = fn;
	}
}

GameEvent.bindings = [];
GameEvent.on = function(type, fn){
	
	if( typeof fn !== "function" )
		console.error("Trying to bind invalid event type");

	let binding = new EventBinding(type, fn);
	GameEvent.bindings.push(binding);

	return binding;

};
GameEvent.off = function(binding){

	let pos = GameEvent.bindings.indexOf(binding);
	if( ~pos )
		GameEvent.bindings.splice(pos, 1);

};


GameEvent.Types = {
	none : 'none',						// Can be used internally
	all : 'all',						//* Varied, raised on every event
	damageDone : 'damageDone',			//* sender, target, action, wrapper
	damageTaken : 'damageTaken',		//* sender, target, action, wrapper
	healingDone : 'healingDone',		// 
	healingTaken : 'healingTaken',		// 
	interrupt : 'interrupt',			// A charged action was interrupted
	actionCharged : 'actionCharged',	// Used a charged action
	actionUsed : 'actionUsed',			//* target(is an array of targets here) {resist:true(on resist)}. Note that when this is used in an event check, a wrapper and effect is added by the checker
	actionRiposte : 'actionRiposte',	//* target is the player that cast the original spell, sender is the original victim
	wrapperAdded : 'wrapperAdded',		//* Duration effects only, sender, target, action, wrapper, 
	wrapperRemoved : 'wrapperRemoved',	//* Duration effects only. sender, target, action, wrapper
	wrapperTick : 'wrapperTick',		//* Duration ticks and trigger immediates, == || ==
	turnChanged : 'turnChanged',		//* Sender is the previous player, Target is the new player
	playerDefeated : 'playerDefeated',	// Player was defeated, sender was the player that defeated target, action might be included, wrapper is included
	diminishingResist : 'diminishingResist',		// target resisted sender's wrapper due to diminishing returns
	effectTrigger : 'effectTrigger',				// Raised when an effect has been triggered
	armorBroken : 'armorBroken',		// An armor piece has been broken. Sender is the player that triggered the break, Target is the player who wears it

	// These are only raised internally within a wrapper/effect
	internalWrapperAdded : 'internalWrapperAdded',		// Duration effects only, sender, target, action, wrapper. Custom: {isChargeFinish:(bool)isChargeFinish}
	internalWrapperRemoved : 'internalWrapperRemoved',	// *Duration effects only. sender, target, action, wrapper
	internalWrapperTick : 'internalWrapperTick',		// *Duration ticks and trigger immediates, == || ==
	internalWrapperStackChange : 'internalWrapperStackChange',		// Raised when a stack changes through an effect. Combine with add/tick. For now, sender/target correspond to the affected wrapper, not the person who raised the event
	
	battleStarted : 'battleStarted',
	battleEnded : 'battleEnded',
	encounterDefeated : 'encounterDefeated',			// encounter, Raised when the players defeat an encounter. Generally you want to attach a .quest to it with the quest checking a condition
	encounterLost : 'encounterLost',					// encounter, Same as above but players lost
	assetUsed : 'assetUsed',							// Asset used

	encounterStarted : 'encounterStarted',				// encounter, Currently only used for the encounter start text
	
	dungeonExited : 'dungeonExited',					// Raised with the dungeon being the dungeon you just left
	dungeonEntered : 'dungeonEntered',					// Raised with the dungeon being the dungeon you just entered
};




