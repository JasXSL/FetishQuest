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
		this.dungeon = null;
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
	none : 'none',						
	all : 'all',						
	damageDone : 'damageDone',			
	damageTaken : 'damageTaken',		
	healingDone : 'healingDone',		
	healingTaken : 'healingTaken',		
	interrupt : 'interrupt',			
	actionCharged : 'actionCharged',	
	actionUsed : 'actionUsed',			
	actionRiposte : 'actionRiposte',	
	wrapperAdded : 'wrapperAdded',		
	wrapperRemoved : 'wrapperRemoved',	
	wrapperTick : 'wrapperTick',		
	turnChanged : 'turnChanged',		
	playerDefeated : 'playerDefeated',	
	diminishingResist : 'diminishingResist',
	effectTrigger : 'effectTrigger',		
	armorBroken : 'armorBroken',		

	// These are only raised internally within a wrapper/effect
	internalWrapperAdded : 'internalWrapperAdded',
	internalWrapperRemoved : 'internalWrapperRemoved',
	internalWrapperTick : 'internalWrapperTick',	
	internalWrapperStackChange : 'internalWrapperStackChange',
	
	battleStarted : 'battleStarted',
	battleEnded : 'battleEnded',
	encounterDefeated : 'encounterDefeated',
	encounterLost : 'encounterLost',		
	assetUsed : 'assetUsed',				

	encounterStarted : 'encounterStarted',	
	
	dungeonExited : 'dungeonExited',		
	dungeonEntered : 'dungeonEntered',		
};

GameEvent.TypeDescs = {
	[GameEvent.Types.none] : 'Can be used internally',	
	[GameEvent.Types.all] : 'Varied, raised on every event',
	[GameEvent.Types.damageDone] : 'sender, target, action, wrapper',			//* 
	[GameEvent.Types.damageTaken] : 'sender, target, action, wrapper',
	[GameEvent.Types.healingDone] : '',
	[GameEvent.Types.healingTaken] : '',
	[GameEvent.Types.interrupt] : 'A charged action was interrupted',			// 
	[GameEvent.Types.actionCharged] : 'Used a charged action',	// 
	[GameEvent.Types.actionUsed] : 'target(is an array of targets here) {resist:true(on resist)}. Note that when this is used in an event check, a wrapper and effect is added by the checker',			//* 
	[GameEvent.Types.actionRiposte] : 'target is the player that cast the original spell, sender is the original victim',
	[GameEvent.Types.wrapperAdded] : 'Duration effects only, sender, target, action, wrapper',		//* , 
	[GameEvent.Types.wrapperRemoved] : 'Duration effects only. sender, target, action, wrapper',	//* 
	[GameEvent.Types.wrapperTick] : 'Duration ticks and trigger immediates',		//* , == || ==
	[GameEvent.Types.turnChanged] : 'Sender is the previous player, Target is the new player',		//* 
	[GameEvent.Types.playerDefeated] : 'Player was defeated, sender was the player that defeated target, action might be included, wrapper is included',	// 
	[GameEvent.Types.diminishingResist] : 'target resisted sender\'s wrapper due to diminishing returns',		// 
	[GameEvent.Types.effectTrigger] : 'Raised when an effect has been triggered',				// 
	[GameEvent.Types.armorBroken] : 'An armor piece has been broken. Sender is the player that triggered the break, Target is the player who wears it',		// 

	// These are only raised internally within a wrapper/effect
	[GameEvent.Types.internalWrapperAdded] : 'Duration effects only, sender, target, action, wrapper. Custom: {isChargeFinish:(bool)isChargeFinish}',		// 
	[GameEvent.Types.internalWrapperRemoved] : 'Duration effects only. sender, target, action, wrapper',	// *
	[GameEvent.Types.internalWrapperTick] : 'Duration ticks and trigger immediates',		// *, == || ==
	[GameEvent.Types.internalWrapperStackChange] : 'Raised when a stack changes through an effect. Combine with add/tick. For now, sender/target correspond to the affected wrapper, not the person who raised the event',		// 
	
	[GameEvent.Types.battleStarted] : 'battleStarted',
	[GameEvent.Types.battleEnded] : 'battleEnded',
	[GameEvent.Types.encounterDefeated] : 'encounter, Raised when the players defeat an encounter. Generally you want to attach a .quest to it with the quest checking a condition',			// 
	[GameEvent.Types.encounterLost] : 'encounter, Same as encounterDefeated but players lost',					// 
	[GameEvent.Types.assetUsed] : 'Asset used',							// 

	[GameEvent.Types.encounterStarted] : 'encounter, Currently only used for the encounter start text',				// 
	
	[GameEvent.Types.dungeonExited] : 'Raised with the dungeon being the dungeon you just left',					// 
	[GameEvent.Types.dungeonEntered] : 'Raised with the dungeon being the dungeon you just entered',					// 
};



