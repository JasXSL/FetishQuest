/*

	GameEvent are events used by the game itself (separate from JS UI events)
	They contain metadata and their primary purpose is to be used with conditions
	But they can also be bound to be used whenever they're raised by type anywhere in the code

*/
import Generic from './helpers/Generic.js';

export default class GameEvent extends Generic{

	static debugAll = false;
	static idx = 0;

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
		this.gameAction = null;
		this.dungeonRoomAsset = null;
		this.wrapperReturn = null;		// See WrapperReturn @ EffectSys.js
		this.roleplayStageOption = null;
		this.text = null;				// Text object
		this.custom = {};		// Custom data related to the event	
		this.debug = null;		// Can be used for debugging
		this.load(data);

	}

	load(data){
		
		this.g_autoload(data);

	}

	rebase(){
		this.g_rebase();	// Super
		
		if( Array.isArray(this.target) )
			this.target = this.target.slice();
		for( let i in this.custom ){
			if( this.custom[i] && typeof this.custom[i].clone === "function" ){
				this.custom[i] = this.custom[i].clone();
			}
		}

	}
	// note: this is only a shallow clone
	clone(){
		let out = new this.constructor(this);
		return out;
	}

	// Chainable
	raise(){

		if( this.constructor.debugAll )
			console.log("EVT: ", this.clone());

		GameEvent.bindings
			.filter(binding => binding.type === this.type || binding.type === GameEvent.Types.all)
			.map(binding => {
				binding.fn(this);
			});

		return this;

	}

	// Starts with evt_ and tries to add mutable characteristics from custom
	appendMathVars(input){
		
		for( let i in this.custom ){

			let val = this.custom[i];
			let type = typeof val;
			if( ['string', 'number', 'boolean'].includes(type) )
				input['evt_'+i] = val;

		}

	}

	// Merges any unset values in this event to values of another
	mergeUnset( event ){

		for( let i in event ){

			if( this[i] === null )
				this[i] = event[i];
			// Special case for custom since it's never null
			else if( i === "custom" ){

				for( let c in event[i] ){

					if( !this.custom.hasOwnProperty(c) )
						this.custom[c] = event[i][c];

				}

			}

		}
		return this;

	}

}


// Short wrapper class for binding global events
class EventBinding{
	constructor( type, fn, idx ){
		
		this.type = type;
		this.fn = fn;
		this.idx = idx;

	}
}

GameEvent.bindings = [];
GameEvent.on = function(type, fn){
	
	if( typeof fn !== "function" )
		console.error("Trying to bind invalid event type");

	let binding = new EventBinding(type, fn, ++this.idx);
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
	hpDamageTaken : 'hpDamageTaken',		
	lifeSteal : 'lifeSteal',			
	healingDone : 'healingDone',		
	healingTaken : 'healingTaken',		
	interrupt : 'interrupt',			
	actionCharged : 'actionCharged',
	actionUsed : 'actionUsed',
	actionRiposte : 'actionRiposte',
	reroll : 'reroll',
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
	armorEquipped : 'armorEquipped',		
	armorUnequipped : 'armorUnequipped',		
	downedProtection : 'downedProtection',		

	stdAttCombo : 'stdAttCombo',

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
	blockExpired : 'blockExpired',
	blockAdded : 'blockAdded',
	blockSubtracted : 'blockSubtracted',
	blockBroken : 'blockBroken',
	dungeonExited : 'dungeonExited',		
	dungeonEntered : 'dungeonEntered',
	roomChanged : 'roomChanged',			// Whenever you change room
	
	rpStage : 'rpStage',	// Roleplay stage changed		
	textTrigger : 'textTrigger',
	explorationComplete : 'explorationComplete',	
	sleep : 'sleep',		
	stun : 'stun',
	orgasm : 'orgasm', 	// Quicker way of checking wrapper added and wrapper overwhelming orgasm
	
};

// Event data fields can be read in math vars by using evt_<var>. Ex shielding enchant checks for healingDone and adds block equal to "evt_overAmount"
GameEvent.TypeDescs = {
	[GameEvent.Types.none] : 'Can be used internally',	
	[GameEvent.Types.all] : 'Varied, raised on every event',
	[GameEvent.Types.damageDone] : '{amount:(int)amount, overAmount:(int)overKill} sender, target, action, wrapper',			//* 
	[GameEvent.Types.lifeSteal] : '{amount:(int)amount} sender, target, action, wrapper. Sender is the player who stole health. Target is the victim. Doesn\'t proc from major lifesteal.',			//* 
	[GameEvent.Types.damageTaken] : '{amount:(int)amount, overAmount:(int)overKill} sender, target, action, wrapper. Includes block damage.',
	[GameEvent.Types.hpDamageTaken] : '{amount:(int)amount, overAmount:(int)overKill, hpPre:(float)targ_hp_ratio_before_damage} sender, target, action, wrapper. Excludes block damage.',
	[GameEvent.Types.healingDone] : '{amount:(int)amount, overAmount:(int)overHeal, hpPre:(float)targ_hp_ratio_before_heal}',
	[GameEvent.Types.healingTaken] : '{amount:(int)amount, overAmount:(int)overHeal, hpPre:(float)targ_hp_ratio_before_heal}',
	[GameEvent.Types.sleep] : '{duration:(int)hours}',
	[GameEvent.Types.interrupt] : 'A charged action was interrupted',			// 
	[GameEvent.Types.inventoryChanged] : 'Inventory has changed',			// 
	[GameEvent.Types.actionCharged] : 'Used a charged action',	// 
	[GameEvent.Types.actionUsed] : 'target(is an array of targets here) {resist:true(on resist)}. Note that when this is used in an event check, a wrapper and effect is added by the checker',			//* 
	[GameEvent.Types.actionRiposte] : 'target is the player that cast the original spell, sender is the original victim',
	[GameEvent.Types.reroll] : 'target is the player who rerolled',

	[GameEvent.Types.stdAttCombo] : 'Raised when any of the standard 3 attacks (attack, arouse, shock) has been used, custom.amount = nr times in a row any of the 3 has been used. Sender is the player who pulled off the combo. Target is an array of any targets hit. Raised even if you miss.',
	
	[GameEvent.Types.downedProtection] : 'Raised when a player enters downed protection (caps HP to 1 until next turn). Sender is the player who did damage, target is the player who received the protection.',

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
	[GameEvent.Types.armorUnequipped] : 'An armor piece has been unequipped. Sender is the player that triggered the unequip, Target is the player who wore it',		// 
	[GameEvent.Types.armorEquipped] : 'An armor piece has been equipped. Sender is the player that triggered the equip, Target is the player who wore it',		// 

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

	[GameEvent.Types.stun] : 'Target was stunned by sender',							// 

	[GameEvent.Types.encounterStarted] : 'encounter, Currently only used for the encounter start text',				// 
	
	[GameEvent.Types.dungeonExited] : 'Raised with the dungeon being the dungeon you just left',					// 
	[GameEvent.Types.dungeonEntered] : 'Raised with the dungeon being the dungeon you just entered',					// 
	[GameEvent.Types.textTrigger] : 'Raised when a text is triggered.',			
	[GameEvent.Types.explorationComplete] : 'Raised when a procedural dungeon is fully explored.',			
	[GameEvent.Types.blockExpired] : '{evt_amount:(int)amount} Raised when block expires.',			
	[GameEvent.Types.blockAdded] : '{evt_amount:(int)amount} Raised when block is added.',			
	[GameEvent.Types.blockSubtracted] : '{evt_amount:(int)amount} Raised when block is subtracted.',			
	[GameEvent.Types.blockBroken] : 'sender, target. Block has been broken (not expired).',			
	[GameEvent.Types.orgasm] : 'sender, target. Target has orgasmed.',			

};



