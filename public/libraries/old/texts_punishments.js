import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import T from './stdTag.js';

const out = [];
let domCond = {type : Condition.Types.actionLabel, data:{label:'stdPunishDom'}, targnr:0}; 
let subCond = {type : Condition.Types.actionLabel, data:{label:'stdPunishSub'}, targnr:0}; 
let sadCond = {type : Condition.Types.actionLabel, data:{label:'stdPunishSad'}, targnr:0}; 


// Humanoid attacker/victim conditions
const humanAVConds = [
	"targetNotBeast",
	"eventIsActionUsed",
	"senderNotBeast",
];


// DOMINANT
	out.push({
		text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Trsize %Tbutt before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, "senderPenis", "roomTable"),
	});
	out.push({
		text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Tvagina before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, "senderPenis", "roomTable", "targetVagina"),
	});

	out.push({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Trsize %Tbutt...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, "senderPenis", "ttBentOver"),
	});
	out.push({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Tvagina...",
		soundkits : 'slowThrusts',
		turnTags : [T.ttBentOver, T.ttBentOverTable],
		conditions : humanAVConds.concat(domCond, "senderPenis", "ttBentOver", "targetVagina"),
	});
	
	out.push({
		text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's arms from behind and forcing %Shis %Spsize %Spenis iside %T's %Trsize %Tbutt. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, "senderPenis"),
	});
	out.push({
		text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's hips and forcing %Shis %Spsize %Spenis iside %T's %Tvagina. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, "senderPenis", "targetVagina"),
	});
	out.push({
		text : "%S pushes the defeated %Trace to the ground and seats %Shimself on %T's face. %S begins riding %T's face...",
		soundkits : 'slowThrusts',
		conditions : humanAVConds.concat(domCond, "senderVagina"),
	});
	


// SUBMISSIVE
	out.push({
		text : "%S used a SUBMISSIVE text against %T!",
		//soundkits : 'punchGeneric',
		conditions : humanAVConds.concat(subCond)
	});



// SADISTIC
	out.push({
		text : "%S bends the defeated %Trace over a table. Raising %Shis palm high in the air, the %Srace starts forcefully slapping %T's %Trsize %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver, T.ttBentOverTable, T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, "roomTable"),
	});
	out.push({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S a turn. %S continues the punishment, vigorously spanking the %Trace's already punished %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver, T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, "ttBentOver", "ttSpanked"),
	});
	out.push({
		text : "%R"+T.ttBentOver+" pins %T's arms behind %This back, allowing %S a turn. %S raises %Shis palm and starts vigorously spanking the %Trace's %Trsize exposed %Tbutt...",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver,T.ttSpanked],
		conditions : humanAVConds.concat(sadCond, "ttBentOver", "ttNotSpanked"),
	});





export default out;