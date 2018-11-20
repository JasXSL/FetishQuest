import {Effect} from '../classes/EffectSys.js';
import visuals from './visuals.js';
import GameEvent from '../classes/GameEvent.js';
const out = {
	visTargTakeDamage : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.damage}
	}),
	visTargHeal : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.heal}
	}),
	visTargShield : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.shield}
	}),
	visTargTakeDamageElemental : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.damageElemental}
	}),
	visTargTakeDamageHoly : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.damageHoly}
	}),
	visTargTakeDamageCorruption : new Effect({
		type : Effect.Types.visual,
		data : {class:visuals.damageCorruption}
	}),

	visAddTargTakeDamage : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.damage}
	}),
	visAddTargHeal : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.heal}
	}),
	visAddTargShield : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.shield}
	}),
	visAddTargTakeDamageElemental : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.damageElemental}
	}),
	visAddTargTakeDamageHoly : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.damageHoly}
	}),
	visAddTargTakeDamageCorruption : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.visual,
		data : {class:visuals.damageCorruption}
	}),


	interrupt : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.interrupt,
		data : {}
	}),
	
};



export default out;
