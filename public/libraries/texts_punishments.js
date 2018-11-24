import Text from '../classes/Text.js';

import libCond from './conditions.js';
const C = libCond;
import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import Asset from '../classes/Asset.js';
import T from './stdTag.js';

const cAND = (...args) => ConditionPackage.buildAND(...args);
const cOR =  (...args) => ConditionPackage.buildOR(...args);


const out = [];
let domCond = new Condition({type : Condition.Types.actionLabel, data:{label:'stdPunishDom'}, targnr:0}); 
let subCond = new Condition({type : Condition.Types.actionLabel, data:{label:'stdPunishSub'}, targnr:0}); 
let sadCond = new Condition({type : Condition.Types.actionLabel, data:{label:'stdPunishSad'}, targnr:0}); 


// Humanoid attacker/victim conditions
const humanAVConds = [
	C.targetNotBeast,
	C.eventIsActionUsed,
	C.senderNotBeast,
];
// Humanoid victim conditions
const humanVConds = [
	C.targetNotBeast,
	C.eventIsActionUsed,
];


// DOMINANT
	out.push(new Text({
		text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Trsize %Tbutt before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, C.senderPenis, C.roomTable),
	}));
	out.push(new Text({
		text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Tvagina before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, C.senderPenis, C.roomTable, C.targetVagina),
	}));

	out.push(new Text({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Trsize %Tbutt...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, C.senderPenis, C.ttBentOver),
	}));
	out.push(new Text({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Tvagina...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, C.senderPenis, C.ttBentOver, C.targetVagina),
	}));
	
	out.push(new Text({
		text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's arms from behind and forcing %Shis %Spsize %Spenis iside %T's %Trsize %Tbutt. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, C.senderPenis),
	}));
	out.push(new Text({
		text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's hips and forcing %Shis %Spsize %Spenis iside %T's %Tvagina. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, C.senderPenis, C.targetVagina),
	}));
	out.push(new Text({
		text : "%S pushes the defeated %Trace to the ground and seats %Shimself on %T's face. %S begins riding %T's face...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, C.senderVagina),
	}));
	


// SUBMISSIVE
	out.push(new Text({
		text : "%S used a SUBMISSIVE text against %T!",
		//soundkits : 'punchGeneric',
		conditions : humanAVConds.concat(subCond)
	}));



// SADISTIC
	out.push(new Text({
		text : "%S bends the defeated %Trace over a table. Raising %Shis palm high in the air, the %Srace starts forcefully slapping %T's %Trsize %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver, T.ttBentOverTable, T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, C.roomTable),
	}));
	out.push(new Text({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S a turn. %S continues the punishment, vigorously spanking the %Trace's already punished %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver, T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, C.ttBentOver, C.ttSpanked),
	}));
	out.push(new Text({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S a turn. %S raises %Shis palm and starts vigorously spanking the %Trace's %Trsize exposed %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver,T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, C.ttBentOver, C.ttNotSpanked),
	}));





export default out;