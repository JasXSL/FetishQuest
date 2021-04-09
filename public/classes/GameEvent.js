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
		this.wrapper = null;			// Note that this is overridden by the active wrapper when validating Effect triggers. 
		this.originalWrapper = null;	// Set during validation of Effect.trigger when the original event has a wrapper attached to it.
		this.effect = null;
		this.asset = null;
		this.quest = null;
		this.encounter = null;			
		this.dungeon = null;
		this.room = null;			
		this.dungeonRoomAsset = null;
		this.wrapperReturn = null;		// See WrapperReturn @ EffectSys.js
		this.text = null;				// Text object
		this.custom = {};		// Custom data related to the event	
		this.debug = null;		// Can be used for debugging
		this.load(data);

	}

	load(data){
		
		this.g_autoload(data, true);

	}

	rebase(){

		for( let i in this.custom ){
			if( this.custom[i] && typeof this.custom[i].clone === "function" ){
				this.custom[i] = this.custom[i].clone();
			}
		}

	}

	clone(){
		return new this.constructor(this);
	}

	// Chainable
	raise(){

		// Run the event
		for(let binding of GameEvent.bindings){
			
			if( binding.type === this.type || binding.type === GameEvent.Types.all ){
				binding.fn(this);
			}

		}
		return this;

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

GameEvent.reset = function(){
	this.bindings = [];
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
	wrapperExpired : 'wrapperExpired',		
	wrapperExpiredAfter : 'wrapperExpiredAfter',		
	turnChanged : 'turnChanged',		
	playerDefeated : 'playerDefeated',	
	diminishingResist : 'diminishingResist',
	effectTrigger : 'effectTrigger',		
	armorBroken : 'armorBroken',		

	// These are only raised internally within a wrapper/effect
	internalWrapperAdded : 'internalWrapperAdded',
	internalWrapperRemoved : 'internalWrapperRemoved',		// Always raised regardless of how the effect is removed
	internalWrapperExpired : 'internalWrapperExpired',		// The effect expired naturally
	internalWrapperExpiredAfter : 'internalWrapperExpiredAfter',		// Same as above but triggered after removing from player
	internalWrapperTick : 'internalWrapperTick',	
	internalWrapperStackChange : 'internalWrapperStackChange',
	
	battleStarted : 'battleStarted',
	battleEnded : 'battleEnded',
	playerFirstTurn : 'playerFirstTurn',	// Special case raised on each player's first turn in order to tie chats to it

	encounterDefeated : 'encounterDefeated',
	encounterLost : 'encounterLost',		
	assetUsed : 'assetUsed',				
	inventoryChanged : 'inventoryChanged',		
	encounterEnemyDefeated : 'encounterEnemyDefeated',		

	encounterStarted : 'encounterStarted',	
	
	dungeonExited : 'dungeonExited',		
	dungeonEntered : 'dungeonEntered',		
	
	rpStage : 'rpStage',	// Roleplay stage changed		
	textTrigger : 'textTrigger',			
};

GameEvent.TypeDescs = {
	[GameEvent.Types.none] : 'Can be used internally',	
	[GameEvent.Types.all] : 'Varied, raised on every event',
	[GameEvent.Types.damageDone] : 'sender, target, action, wrapper',			//* 
	[GameEvent.Types.damageTaken] : 'sender, target, action, wrapper',
	[GameEvent.Types.healingDone] : '',
	[GameEvent.Types.healingTaken] : '',
	[GameEvent.Types.interrupt] : 'A charged action was interrupted',			// 
	[GameEvent.Types.inventoryChanged] : 'Inventory has changed',			// 
	[GameEvent.Types.actionCharged] : 'Used a charged action',	// 
	[GameEvent.Types.actionUsed] : 'target(is an array of targets here) {resist:true(on resist)}. Note that when this is used in an event check, a wrapper and effect is added by the checker',			//* 
	[GameEvent.Types.actionRiposte] : 'target is the player that cast the original spell, sender is the original victim',
	[GameEvent.Types.wrapperAdded] : 'Duration effects only, sender, target, action, wrapper',		//* , 
	[GameEvent.Types.wrapperRemoved] : 'Duration effects only. sender, target, action, wrapper',	//* 
	[GameEvent.Types.wrapperExpired] : 'Duration effects only. sender, target, action, wrapper',	//* 
	[GameEvent.Types.wrapperExpiredAfter] : 'Duration effects only. sender, target, action, wrapper',	//* 
	[GameEvent.Types.wrapperTick] : 'Duration ticks and trigger immediates',		//* , == || ==
	[GameEvent.Types.turnChanged] : 'Sender is the previous player, Target is the new player',		//* 
	[GameEvent.Types.playerDefeated] : 'Player was defeated, sender was the player that defeated target, action might be included, wrapper is included',	// 
	[GameEvent.Types.diminishingResist] : 'target resisted sender\'s wrapper due to diminishing returns',		// 
	[GameEvent.Types.effectTrigger] : 'Raised when an effect has been triggered',				// 
	[GameEvent.Types.armorBroken] : 'An armor piece has been broken. Sender is the player that triggered the break, Target is the player who wears it',		// 

	// These are only raised internally within a wrapper/effect
	[GameEvent.Types.internalWrapperAdded] : 'Duration effects only, sender, target, action, wrapper. Custom: {isChargeFinish:(bool)isChargeFinish}',		// 
	[GameEvent.Types.internalWrapperRemoved] : 'Duration effects only. sender, target, action, wrapper',	// *
	[GameEvent.Types.internalWrapperExpired] : 'Wrapper expired naturally.',	// *
	[GameEvent.Types.internalWrapperExpiredAfter] : 'Wrapper expired naturally. Raised after removing from player',	// *
	[GameEvent.Types.internalWrapperTick] : 'Duration ticks and trigger immediates',		// *, == || ==
	[GameEvent.Types.internalWrapperStackChange] : 'Raised when a stack changes through an effect. Combine with add/tick. For now, sender/target correspond to the affected wrapper, not the person who raised the event',		// 
	
	[GameEvent.Types.battleStarted] : 'Battle has started. This event is raised by and against all players.',
	[GameEvent.Types.battleEnded] : 'Battle has ended. This event is raised by and against all players.',
	[GameEvent.Types.playerFirstTurn] : 'Player has started their first turn. Raised with sender being the player whose turn it is, and targets being all enabled enemies',

	[GameEvent.Types.encounterDefeated] : 'encounter, Raised when the players defeat an encounter. Generally you want to attach a .quest to it with the quest checking a condition',			// 
	[GameEvent.Types.encounterEnemyDefeated] : 'Raised for each defeated enemy in an encounter. Sender is the first player on the winning team, but should not be relied on. This event already checks that they were hostile.',			// 
	[GameEvent.Types.encounterLost] : 'encounter, Same as encounterDefeated but players lost',					// 
	[GameEvent.Types.assetUsed] : 'Asset used',							// 

	[GameEvent.Types.encounterStarted] : 'encounter, Currently only used for the encounter start text',				// 
	
	[GameEvent.Types.dungeonExited] : 'Raised with the dungeon being the dungeon you just left',					// 
	[GameEvent.Types.dungeonEntered] : 'Raised with the dungeon being the dungeon you just entered',					// 
	[GameEvent.Types.textTrigger] : 'Raised when a text is triggered.',			

};



