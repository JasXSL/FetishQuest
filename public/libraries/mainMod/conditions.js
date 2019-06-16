import stdTag from "../stdTag.js";

import Condition from "../../classes/Condition.js";
import GameEvent from "../../classes/GameEvent.js";

const lib = {
	
	action_stdAttack : {"type":"actionLabel","data":{"label":"stdAttack"},"targnr":0},
	action_stdArouse : {"type":"actionLabel","data":{"label":"stdArouse"},"targnr":0},
	action_stdPunishDom : {"type":"actionLabel","data":{"label":"stdPunishDom"},"targnr":0},
	action_stdPunishSad : {"type":"actionLabel","data":{"label":"stdPunishSad"},"targnr":0},
	action_stdPunishSub : {"type":"actionLabel","data":{"label":"stdPunishSub"},"targnr":0},
	action_tentacle_fiend_tentacleMilker : {"type":"actionLabel","data":{"label":"tentacle_fiend_tentacleMilker"},"targnr":0},
	action_tentacle_fiend_legWrap : {"type":"actionLabel","data":{"label":"tentacle_fiend_legWrap"},"targnr":0},
	action_tentacle_fiend_injectacle : {"type":"actionLabel","data":{"label":"tentacle_fiend_injectacle"},"targnr":0},
	action_tentacle_fiend_tentatug : {"type":"actionLabel","data":{"label":"tentacle_fiend_tentatug"},"targnr":0},
	action_tentacle_ride : {"type":"actionLabel","data":{"label":"tentacle_ride"},"targnr":0},
	action_shocktacle_zap : {"type":"actionLabel","data":{"label":"shocktacle_zap"},"targnr":0},
	action_imp_specialDelivery : {"type":"actionLabel","data":{"label":"imp_specialDelivery"},"targnr":0},
	action_imp_blowFromBelow : {"type":"actionLabel","data":{"label":"imp_blowFromBelow"},"targnr":0},
	action_imp_ankleBite : {"type":"actionLabel","data":{"label":"imp_ankleBite"},"targnr":0},
	action_imp_demonicPinch : {"type":"actionLabel","data":{"label":"imp_demonicPinch"},"targnr":0},
	action_imp_claws : {"type":"actionLabel","data":{"label":"imp_claws"},"targnr":0},
	action_whip_legLash : {"type":"actionLabel","data":{"label":"whip_legLash"},"targnr":0},
	action_whip_powerLash : {"type":"actionLabel","data":{"label":"whip_powerLash"},"targnr":0},
	action_minorHealingPotion : {"type":"actionLabel","data":{"label":"minorHealingPotion"},"targnr":0},
	action_majorHealingPotion : {"type":"actionLabel","data":{"label":"majorHealingPotion"},"targnr":0},
	action_healingPotion : {"type":"actionLabel","data":{"label":"healingPotion"},"targnr":0},
	action_manaPotion : {"type":"actionLabel","data":{"label":"manaPotion"},"targnr":0},
	action_majorManaPotion : {"type":"actionLabel","data":{"label":"majorManaPotion"},"targnr":0},
	action_lowBlow : {"type":"actionLabel","data":{"label":"lowBlow"},"targnr":0},
	action_warrior_viceGrip : {"type":"actionLabel","data":{"label":"warrior_viceGrip"},"targnr":0},
	action_warrior_bolster : {"type":"actionLabel","data":{"label":"warrior_bolster"},"targnr":0},
	action_warrior_revenge : {"type":"actionLabel","data":{"label":"warrior_revenge"},"targnr":0},
	action_rogue_exploit : {"type":"actionLabel","data":{"label":"rogue_exploit"},"targnr":0},
	action_rogue_corruptingPoison : {"type":"actionLabel","data":{"label":"rogue_corruptingPoison"},"targnr":0},
	action_rogue_dirtyTricks : {"type":"actionLabel","data":{"label":"rogue_dirtyTricks"},"targnr":0},
	action_cleric_paddling : {"type":"actionLabel","data":{"label":"cleric_paddling"},"targnr":0},
	action_cleric_smite : {"type":"actionLabel","data":{"label":"cleric_smite"},"targnr":0},
	action_cleric_chastise : {"type":"actionLabel","data":{"label":"cleric_chastise"},"targnr":0},
	action_cleric_heal : {"type":"actionLabel","data":{"label":"cleric_heal"},"targnr":0},
	action_tentaclemancer_tentacleWhip : {"type":"actionLabel","data":{"label":"tentaclemancer_tentacleWhip"},"targnr":0},
	action_tentaclemancer_corruptingOoze : {"type":"actionLabel","data":{"label":"tentaclemancer_corruptingOoze"},"targnr":0},
	action_tentaclemancer_siphonCorruption : {"type":"actionLabel","data":{"label":"tentaclemancer_siphonCorruption"},"targnr":0},
	action_monk_roundKick : {"type":"actionLabel","data":{"label":"monk_roundKick"},"targnr":0},
	action_monk_disablingStrike : {"type":"actionLabel","data":{"label":"monk_disablingStrike"},"targnr":0},
	action_monk_upliftingStrike : {"type":"actionLabel","data":{"label":"monk_upliftingStrike"},"targnr":0},
	action_elementalist_iceBlast : {"type":"actionLabel","data":{"label":"elementalist_iceBlast"},"targnr":0},
	action_elementalist_healingSurge : {"type":"actionLabel","data":{"label":"elementalist_healingSurge"},"targnr":0},
	action_elementalist_waterSpout : {"type":"actionLabel","data":{"label":"elementalist_waterSpout"},"targnr":0},
	action_tentacle_latch : {type:Condition.Types.actionLabel, data:{label:'tentacle_latch'}, targnr:0},
	action_cocktopus_ink : {type:Condition.Types.actionLabel, data:{label:'cocktopus_ink'}, targnr:0},
	action_skeleton_looseHand : {type:Condition.Types.actionLabel, data:{label:'skeleton_looseHand'}, targnr:0},
	action_skeleton_looseHand_tick : {type:Condition.Types.effectLabel, data:{label:'skeleton_looseHand'}, targnr:0},
	action_cocktopus_inkject : {type:Condition.Types.actionLabel, data:{label:'cocktopus_inkject'}, targnr:0},
	action_cocktopus_inkject_tick : {type:Condition.Types.effectLabel, data:{label:'cocktopus_inkject_tick'}, targnr:0},
	action_cocktopus_inkject_finish : {type:Condition.Types.effectLabel, data:{label:'cocktopus_inkject_expire'}, targnr:0},
	action_detach : {type:Condition.Types.actionLabel, data:{label:'detach'}, targnr:0},
	action_tentacle_pit : {type:Condition.Types.actionLabel, data:{label:'tentacle_pit'}, targnr:0},
	action_tentacle_pit_proc : {type:Condition.Types.effectLabel, data:{label:'tentacle_pit_proc'}, targnr:0},
	action_mq00_ward_boss : {type:Condition.Types.actionLabel, data:{label:'mq00_ward_boss'}, targnr:0},
	action_gropeRope : {type:Condition.Types.actionLabel, data:{label:'gropeRope'}, targnr:0},
	action_bondageStruggle : {type:Condition.Types.actionLabel, data:{label:'bondageStruggle'}, targnr:0},
	action_imp_groperopeHogtie : {type:Condition.Types.actionLabel, data:{label:'imp_groperopeHogtie'}, targnr:0},
	action_imp_newGroperope : {type:Condition.Types.actionLabel, data:{label:['imp_newGroperope_solo', 'imp_newGroperope_party']}, targnr:0},
	action_crab_claw_pinch : {type:Condition.Types.actionLabel, data:{label:'crab_claw_pinch'}, targnr:0},
	action_crab_claw_tug : {type:Condition.Types.actionLabel, data:{label:'crab_claw_tug'}, targnr:0},
	action_groper_leg_spread : {type:Condition.Types.actionLabel, data:{label:'groper_leg_spread'}, targnr:0},
	action_groper_groin_lash : {type:Condition.Types.actionLabel, data:{label:'groper_groin_lash'}, targnr:0},
	action_groper_groin_grope : {type:Condition.Types.actionLabel, data:{label:'groper_groin_grope'}, targnr:0},

	action_food_razzyberry : {type:Condition.Types.actionLabel,data:{label:"foodRazzyberry"},targnr:0},
	action_food_fried_fish : {type:Condition.Types.actionLabel,data:{label:"foodFriedFish"},targnr:0},
	action_food_ale : {type:Condition.Types.actionLabel,data:{label:"foodAle"},targnr:0},

	overWhelmingOrgasm_end : {type:Condition.Types.effectLabel, data:{label:'overWhelmingOrgasm_end'}},
	overWhelmingOrgasm_start : {type:Condition.Types.wrapperLabel, data:{label:'overWhelmingOrgasm'}},
	

	actionMelee : {type:Condition.Types.actionRanged, targnr:0, inverse:true},
	actionRanged : {type:Condition.Types.actionRanged, targnr:0},

	targetLatching : {type:Condition.Types.tag,data:{tags:[stdTag.fxLatching]}},
	senderLatching : {type:Condition.Types.tag,data:{tags:[stdTag.fxLatching]}, caster:true},
	senderLatchingToTarget : {type:Condition.Types.tag,data:{tags:[stdTag.fxLatched], caster:true}},
	
	senderBlockingMouth : {type:Condition.Types.tag,data:{tags:[stdTag.wrBlockMouth], caster:true}},
	senderBlockingButt : {type:Condition.Types.tag,data:{tags:[stdTag.wrBlockButt], caster:true}},
	senderBlockingGroin : {type:Condition.Types.tag,data:{tags:[stdTag.wrBlockGroin], caster:true}},

	senderIsBoss : {type:Condition.Types.tag, data:{tags:[stdTag.plBoss]}, caster:true},
	targetIsBoss : {type:Condition.Types.tag, data:{tags:[stdTag.plBoss]}},


	senderIsCocktopus : {type:Condition.Types.species, data:{species:['cocktopus']}, caster:true},
	senderIsTentacrab : {type:Condition.Types.species, data:{species:['tentacrab']}, caster:true},
	senderIsSkeleton : {type:Condition.Types.species, data:{species:['skeleton']}, caster:true},
	senderIsGroper : {type:Condition.Types.species, data:{species:['groper']}, caster:true},

	// There are at least 2 characters on team 0
	isCoop : {type:Condition.Types.numGamePlayersGreaterThan, data:{team:0, amount:1}},
	isSolo : {type:Condition.Types.numGamePlayersGreaterThan, data:{team:0, amount:1}, inverse:true},

	// Block tags signify that the slot is currently occupied
	targetHasUnblockedOrifice : {conditions:[
		{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockButt]}, inverse:true},
		{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockMouth]}, inverse:true},
		{conditions:[
			{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockGroin]}, inverse:true},
			{type:Condition.Types.tag, data:{tags:[stdTag.vagina]}},
		], min:-1},
	], min:1},

	targetIsSender : {type:Condition.Types.targetIsSender},
	targetNotSender : {type:Condition.Types.targetIsSender, inverse:true},
	targetIsWrapperSender : {type:Condition.Types.targetIsWrapperSender},
	targetNotWrapperSender : {type:Condition.Types.targetIsWrapperSender, inverse:true},

	targetNotTiedUp : {type:Condition.Types.tag, data:{tags:[stdTag.wrBound]}, inverse:true},
	senderNotTiedUp : {type:Condition.Types.tag, data:{tags:[stdTag.wrBound]}, inverse:true, caster:true},
	targetTiedUp : {type:Condition.Types.tag, data:{tags:[stdTag.wrBound]}},
	targetHogtied : {type:Condition.Types.tag, data:{tags:[stdTag.wrHogtied]}},

	targetSameTeam : {"type":"sameTeam"},
	targetOtherTeam : {"type":"sameTeam","inverse":true},
	actionNotHidden : {"type":"actionHidden","inverse":true},
	actionHit : {"type":"actionResisted","inverse":true,"targnr":0},
	actionResist : {"type":"actionResisted"},
	targetIsWrapperParent : {"type":"isWrapperParent","anyPlayer":true},
	senderIsWrapperParent : {"type":"isWrapperParent","caster":true,"anyPlayer":true},
	senderNotWrapperParent : {type:Condition.Types.isWrapperParent, caster:true, anyPlayer:true, inverse:true},

	actionDamaging : {"type":"actionTag","data":{"tags":["ac_damage"]}},
	wrapperIsStun : {"type":"wrapperHasEffect","data":{"filters":{"type":"stun"}}},
	targetWearsThong : {"type":"tag","data":{"tags":["as_thong"]}},
	targetWearsSkirt : {"type":"tag","data":{"tags":["as_skirt"]}},
	targetWearsSlingBikini : {"type":"tag","data":{"tags":["as_sling_bikini"]}},
	targetNoBodysuit : {"type":"tag","data":{"tags":["as_bodysuit"]},"inverse":true},
	targetWearsUpperbody : {"type":"tag","data":{"tags":["as_upperbody"]}},
	targetWearsLowerbody : {"type":"tag","data":{"tags":["as_lowerbody"]}},
	targetNoUpperbody : {"type":"tag","data":{"tags":["as_upperbody"]},"inverse":true},
	targetNoLowerbody : {"type":"tag","data":{"tags":["as_lowerbody"]},"inverse":true},
	senderWearsUpperbody : {"type":"tag","data":{"tags":["as_upperbody"]},"caster":true},
	senderWearsLowerbody : {"type":"tag","data":{"tags":["as_lowerbody"]},"caster":true},
	senderNoUpperbody : {"type":"tag","data":{"tags":["as_upperbody"]},"inverse":true,"caster":true},
	senderNoLowerbody : {"type":"tag","data":{"tags":["as_lowerbody"]},"inverse":true,"caster":true},
	targetUpperbodyNotHard : {"type":"tag","data":{"tags":["as_hard_upperbody"]},"inverse":true},
	targetUpperbodyHard : {"type":"tag","data":{"tags":["as_hard_upperbody"]}},
	targetLowerbodyNotHard : {"type":"tag","data":{"tags":["as_hard_lowerbody"]},"inverse":true},
	targetLowerbodyHard : {"type":"tag","data":{"tags":["as_hard_lowerbody"]}},
	targetUpperbodyStretchy : {"type":"tag","data":{"tags":["as_stretchy_upperbody"]}},
	targetLowerbodyStretchy : {"type":"tag","data":{"tags":["as_stretchy_lowerbody"]}},
	targetLowerbodyMetal : {"type":"tag","data":{"tags":["as_metal_lowerbody"]}},
	targetUpperbodyMetal : {"type":"tag","data":{"tags":["as_metal_upperbody"]}},
	targetLowerbodyWaistband : {"type":"tag","data":{"tags":["as_waistband_lowerbody"]}},

	targetClassTentaclemancer : {type:Condition.Types.playerClass, data:{label:"tentaclemancer"}},	

	targetButtExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerbody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttButtExposed]}}
	]},
	targetGroinExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerbody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttGroinExposed]}}
	]},
	targetBreastsExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asUpperbody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttBreastsExposed]}}
	]},
	senderGroinExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerbody]}, inverse:true, caster:true},
		{type:"tag", data:{tags:[stdTag.ttGroinExposed]}, caster:true}
	]},
	

	senderDishonorable : {type:Condition.Types.tag,data:{"tags":[stdTag.plDishonorable]},"caster":true},


	targetHasRepairable : {"type":"hasRepairable"},
	targetNotFriendly : {"type":"sameTeam","inverse":true},
	targetNotBeast : {"type":"tag","data":{"tags":["pl_beast"]},"inverse":true},
	targetBeast : {"type":"tag","data":{"tags":["pl_beast"]}},
	senderNotBeast : {conditions:[
		{type:Condition.Types.tag,data:{tags:[stdTag.plBeast]},inverse:true,caster:true},
		{type:Condition.Types.tag,data:{tags:[stdTag.plTargetBeast]},caster:true},
	]},
	senderBeast : {"type":"tag","data":{"tags":["pl_beast"]},"caster":true},
	senderHasTentacles : {"type":"tag","data":{"tags":["pl_tentacles"]},"caster":true},
	senderHasCocktacles : {type:Condition.Types.tag,data:{tags:[stdTag.plCocktacle]}, caster:true},

	
	targetNotKnockedDown : {"type":"tag","data":{"tags":["wr_knocked_down"]},"inverse":true},
	targetKnockedDown : {"type":"tag","data":{"tags":["wr_knocked_down"]}},
	targetKnockedDownBack : {"type":"tag","data":{"tags":["wr_knocked_down_back"]}},
	targetKnockedDownFront : {"type":"tag","data":{"tags":["wr_knocked_down_front"]}},
	targetNotGrappled : {type:"tag", data:{tags:[stdTag.wrGrapple]}, inverse:true},
	senderHasWhip : {"type":"tag","data":{"tags":["as_whip"]},"caster":true},
	senderHasStrapon : {type:Condition.Types.tag,data:{tags:[stdTag.asStrapon]},caster:true},
	targetSoaked : {"type":"tag","data":{"tags":["wr_soaked"]}},
	targetLegsSpread : {type:Condition.Types.tag,data:{tags:[stdTag.wrLegsSpread]}},
	targetLegsNotSpread : {type:Condition.Types.tag,data:{tags:[stdTag.wrLegsSpread]}, inverse:true},
	// Legs spread and lifted into the air by tentacles
	targetTentacleLiftSpread : {
		conditions : [
			{type:Condition.Types.tag,data:{tags:[stdTag.wrLegsSpread]}},
			{type:Condition.Types.tag,data:{tags:[stdTag.wrTentacleRestrained]}},
		],
		min : -1
	},

	targetHorns : {"type":"tag","data":{"tags":["pl_horns"]}},
	targetHorn : {"type":"tag","data":{"tags":[stdTag.plHorn]}},
	targetEars : {"type":"tag","data":{"tags":[stdTag.plEars]}},
	
	targetVagina : {"type":"tag","data":{"tags":["pl_vagina"]}},
	targetPenis : {"type":"tag","data":{"tags":["pl_penis"]}},
	targetBreasts : {"type":"tag","data":{"tags":["pl_breasts"]}},
	targetNotCircumcised : {"type":"tag","data":{"tags":["pl_circumcised"]},"inverse":true},
	senderTongue : {type:Condition.Types.tag,data:{tags:[stdTag.plTongue]}},
	
	targetButtLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_butt"}},
	targetBreastsLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_breasts"}},
	targetPenisLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_penis"}},
	senderVagina : {"type":"tag","data":{"tags":["pl_vagina"]},"caster":true},
	senderPenis : {"type":"tag","data":{"tags":["pl_penis"]},"caster":true},
	senderBreasts : {"type":"tag","data":{"tags":["pl_breasts"]},"caster":true},
	senderNotCircumcised : {"type":"tag","data":{"tags":["pl_circumcised"]},"inverse":true,"caster":true},
	senderButtLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_butt"},"caster":true},
	senderBreastsLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_breasts"},"caster":true},
	senderPenisLarge : {"type":"genitalSizeValue","data":{"amount":2,"genital":"pl_penis"},"caster":true},

	eventIsActionUsed : {"type":"event","data":{"event":["actionUsed"]},"targnr":0},
	eventIsActionCharged : {type:Condition.Types.event,data:{event:[GameEvent.Types.actionCharged]},"targnr":0},
	eventIsDiminishingResist : {"type":"event","data":{"event":"diminishingResist"}},
	eventIsWrapperAdded : {type:Condition.Types.event,data:{"event":GameEvent.Types.wrapperAdded}},
	eventIsRiposte : {"type":"event","data":{"event":"actionRiposte"}},
	eventIsEffectTrigger : {type:Condition.Types.event,data:{event:GameEvent.Types.effectTrigger}},
	eventIsInterrupt : {"type":"event","data":{"event":"interrupt"}},
	eventIsEncounterDefeated : {"type":"event","data":{"event":["encounterDefeated"]}},
	eventIsPlayerDefeated : {"type":"event","data":{"event":["playerDefeated"]}},
	eventIsDungeonExited : {"type":"event","data":{"event":["dungeonExited"]}},
	eventIsDungeonEntered : {"type":"event","data":{"event":["dungeonEntered"]}},
	
	targetTaller : {"type":"sizeValue","data":{"amount":"se_Size","operator":">"}},
	targetShorter : {"type":"sizeValue","data":{"amount":"se_Size","operator":"<"}},
	targetNotTaller : {type:"sizeValue",data:{amount:"se_Size",operator:"<"}, inverse:true},
	notInCombat : {"type":"notInCombat"},
	inCombat : {"type":"notInCombat","inverse":true},
	rand10 : {"type":"rng","data":{"chance":10}},
	rand20 : {"type":"rng","data":{"chance":20}},
	rand30 : {"type":"rng","data":{"chance":30}},
	rand40 : {"type":"rng","data":{"chance":40}},
	rand50 : {"type":"rng","data":{"chance":50}},
	rand60 : {"type":"rng","data":{"chance":60}},
	rand70 : {"type":"rng","data":{"chance":70}},
	rand80 : {"type":"rng","data":{"chance":80}},
	rand90 : {"type":"rng","data":{"chance":90}},

	roomTable : {"type":Condition.Types.tag,"data":{"tags":[stdTag.mTable]}},
	senderHasNotPunished : {"type":"punishNotUsed","caster":true},
	senderNotDead : {type:Condition.Types.defeated, inverse:true, caster:true},
	targetDead : {"type":"defeated"},
	targetNotDead : {"type":"defeated","inverse":true},
	senderPunishmentNotUsed : {"type":"punishNotUsed","caster":true},

	targetRidingOnMyTentacle : {type:Condition.Types.tag,data:{tags:[stdTag.wrTentacleRide], caster:true}},

	ttGroinExposed : {"type":"tag","data":{"tags":[stdTag.ttGroinExposed]}},
	ttGroinNotExposed : {type:"tag",data:{tags:[stdTag.ttGroinExposed]}, inverse:true},
	ttButtExposed : {"type":"tag","data":{"tags":[stdTag.ttButtExposed]}},
	ttButtNotExposed : {"type":"tag","data":{"tags":[stdTag.ttButtExposed]},"inverse":true},
	ttBreastsExposed : {"type":"tag","data":{"tags":[stdTag.ttGroinExposed]}},
	ttWedgie : {"type":"tag","data":{"tags":[stdTag.ttWedgie]}},
	ttPussyWedgie : {"type":"tag","data":{"tags":[stdTag.ttPussyWedgie]}},
	ttBentOver : {"type":"tag","data":{"tags":[stdTag.ttBentOver]}},
	ttBentOverTable : {"type":"tag","data":{"tags":[stdTag.ttBentOverTable]}},
	ttSpanked : {"type":"tag","data":{"tags":[stdTag.ttSpanked]}},
	ttNotSpanked : {"type":"tag","data":{"tags":[stdTag.ttSpanked]},"inverse":true},

	// Quest completion
	mq00_completed : {type:Condition.Types.questCompleted, data:{quest:'MQ00_YuugBeach'}}

};

// Checks if orifices are not occupied (blocked) and exposed
lib.targetButtExposedAndUnblocked = {conditions:[
	{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockButt]}, inverse:true},
	lib.targetButtExposed,
], min:-1};
lib.targetMouthExposedAndUnblocked = {type:Condition.Types.tag, data:{tags:[stdTag.wrBlockMouth]}, inverse:true};
lib.targetVaginaExposedAndUnblocked = {conditions:[
	{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockGroin]}, inverse:true},
	{type:Condition.Types.tag, data:{tags:[stdTag.vagina]}},
	lib.targetGroinExposed
], min:-1};
// Same but allows groin/butt if armor isn't hard
lib.targetButtUnblockedAndNotHard = {conditions:[
	{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockButt]}, inverse:true},
	{conditions:[lib.targetButtExposed, lib.targetLowerbodyNotHard]},
], min:-1};
lib.targetMouthUnblockedAndNotHard = {type:Condition.Types.tag, data:{tags:[stdTag.wrBlockMouth]}, inverse:true};
lib.targetVaginaUnblockedAndNotHard = {conditions:[
	{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockGroin]}, inverse:true},
	{type:Condition.Types.tag, data:{tags:[stdTag.vagina]}},
	{conditions:[lib.targetGroinExposed, lib.targetLowerbodyNotHard]}
], min:-1};

lib.targetNotNaked = {conditions:[
	lib.targetWearsUpperbody,
	lib.targetWearsLowerbody
], min:1};
lib.targetNaked = {conditions:[
	lib.targetWearsUpperbody,
	lib.targetWearsLowerbody
], inverse:true, min:1};

// Special cases where it needs to refer to itself
lib.targetHasUnblockedExposedOrifice = {conditions:[
	lib.targetButtExposedAndUnblocked,
	lib.targetMouthExposedAndUnblocked,
	lib.targetVaginaExposedAndUnblocked,
], min:1};
lib.targetHasUnblockedNotHardOrifice = {conditions:[
	lib.targetButtUnblockedAndNotHard,
	lib.targetMouthUnblockedAndNotHard,
	lib.targetVaginaUnblockedAndNotHard,
], min:1};

lib.skeleton_looseHand = {conditions:[
	{min:-1, conditions:["targetWearsUpperbody", "targetBreasts"]},
	"targetWearsLowerbody"
]};

const getArray = function(){
	const out = [];
	for( let i in lib ){
		lib[i].label = i;
		out.push(lib[i]);
	}
	return out;
}

const getKeys = function(){
	const out = {};
	for( let i in lib )
		out[i] = i;
	return out;
};

export {getArray, getKeys};
export default lib;