import Action from "../../classes/Action.js";
import Player from "../../classes/Player.js";
import { Effect, Wrapper } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import stdTag from "../stdTag.js";

const lib = {
	interrupt : {
		type:Effect.Types.interrupt,
		//targets:[Wrapper.Targets.auto],
		events:[GameEvent.Types.internalWrapperAdded],
	},

	// Grants the 'detach' action to everyone. 
	// !! important, use with latch_self to properly set the tags on the caster
	// !! important, make sure the wrapper this is put into has fxLatched as a tag
	latch : {
		type : Effect.Types.addActions,
		targets:[Wrapper.Targets.aoe],
		events:[],
		conditions : ['targetNotSender'],
		data : {
			actions : ['detach']
		}
	},
	latch_self : {
		type : Effect.Types.none,
		tags : [stdTag.fxLatching],
		targets : [Wrapper.TARGET_CASTER],
	},

	// unlatches the target FROM all players it's latched to
	unlatch_target : {
		type : Effect.Types.removeEffectWrapperByEffectTag,
		//events:[GameEvent.Types.internalWrapperAdded],
		data : {tag:[stdTag.fxLatching]}
	},

	// Used to force the caster to only attack the victim of this wrapper
	selfTaunt : {
		type : Effect.Types.taunt,
		targets : [Wrapper.TARGET_CASTER],
		data : {victim:true}
	},
};




function getArray(){
	const out = [];
	for( let action in lib ){
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export {getArray};
export default lib;
