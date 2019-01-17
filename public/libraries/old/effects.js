import {Effect} from '../classes/EffectSys.js';
import visuals from './visuals.js';
import GameEvent from '../classes/GameEvent.js';
const out = {


	interrupt : new Effect({
		events : [GameEvent.Types.internalWrapperAdded],
		type : Effect.Types.interrupt,
		data : {}
	}),
	
};



export default out;
