import stdTag from "../stdTag.js";

import Condition from "../../classes/Condition.js";
import GameEvent from "../../classes/GameEvent.js";
import Asset from "../../classes/Asset.js";
import Action from "../../classes/Action.js";
import Game from "../../classes/Game.js";

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
	action_rogue_corruptingVial : {type:Condition.Types.actionLabel,data:{"label":"rogue_corruptingVial"},targnr:0},
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
	action_groper_sap_squeeze : {type:Condition.Types.actionLabel, data:{label:'groper_sap_squeeze'}, targnr:0},
	action_groper_sap_inject : {type:Condition.Types.actionLabel, data:{label:'groper_sap_inject'}, targnr:0},
	action_lamprey_slither : {type:Condition.Types.actionLabel, data:{label:'lamprey_slither'}, targnr:0},
	action_leech : {type:Condition.Types.actionLabel, data:{label:'leech'}, targnr:0},
	action_lamprey_shock : {type:Condition.Types.actionLabel, data:{label:'lamprey_shock'}, targnr:0},
	action_anemone_grab : {type:Condition.Types.actionLabel, data:{label:'anemone_grab'}, targnr:0},
	action_anemone_restrain : {type:Condition.Types.actionLabel, data:{label:'anemone_restrain'}, targnr:0},
	action_anemone_tickle : {type:Condition.Types.actionLabel, data:{label:'anemone_tickle'}, targnr:0},
	action_guardian_demon_consume : {type:Condition.Types.actionLabel, data:{label:'guardian_demon_consume'}, targnr:0},
	action_guardian_demon_grapple : {type:Condition.Types.actionLabel, data:{label:'guardian_demon_grapple'}, targnr:0},
	action_guardian_demon_impale : {type:Condition.Types.actionLabel, data:{label:'guardian_demon_impale'}, targnr:0},
	action_guardian_demon_expose : {type:Condition.Types.actionLabel, data:{label:'guardian_demon_expose'}, targnr:0},
	action_guardian_demon_remoteDelivery : {type:Condition.Types.actionLabel, data:{label:'guardian_demon_remoteDelivery'}, targnr:0},
	action_throw_rock : {type:Condition.Types.actionLabel, data:{label:'throwRock'}, targnr:0},
	
	action_sharktopus_attack : {type:Condition.Types.actionLabel, data:{label:'sharktopus_attack'}, targnr:0},
	action_sharktopus_arouse : {type:Condition.Types.actionLabel, data:{label:'sharktopus_arouse'}, targnr:0},

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

	senderIsBoss : {type:Condition.Types.tag, data:{tags:[stdTag.gpBoss]}, caster:true},
	targetIsBoss : {type:Condition.Types.tag, data:{tags:[stdTag.gpBoss]}},


	senderIsCocktopus : {type:Condition.Types.species, data:{species:['cocktopus']}, caster:true},
	senderIsTentacrab : {type:Condition.Types.species, data:{species:['tentacrab']}, caster:true},
	senderIsSkeleton : {type:Condition.Types.species, data:{species:['skeleton']}, caster:true},
	senderIsGroper : {type:Condition.Types.species, data:{species:['groper']}, caster:true},
	senderIsYuugPortVillager : {type:Condition.Types.playerLabel, data:{label:['yuug_port_peasant']}, caster:true},
	targetIsYuugPortVillager : {type:Condition.Types.playerLabel, data:{label:['yuug_port_peasant']}},
	senderIsImpicus : {type:Condition.Types.playerLabel, data:{label:['Impicus']}, caster:true},
	senderIsIxsplat : {type:Condition.Types.playerLabel, data:{label:['Ixsplat']}, caster:true},
	senderIsLamprey : {type:Condition.Types.species, data:{species:['lamprey']}, caster:true},
	senderIsAnemone : {type:Condition.Types.species, data:{species:['anemone']}, caster:true},

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
	actionHealing : {type:Condition.Types.actionTag,data:{tags:[stdTag.acHeal]}},
	wrapperIsStun : {"type":"wrapperHasEffect","data":{"filters":{"type":"stun"}}},
	targetWearsThong : {"type":"tag","data":{"tags":["as_thong"]}},
	targetWearsSkirt : {"type":"tag","data":{"tags":["as_skirt"]}},
	targetWearsSlingBikini : {"type":"tag","data":{"tags":["as_sling_bikini"]}},
	targetNoBodysuit : {"type":"tag","data":{"tags":["as_bodysuit"]},"inverse":true},
	targetWearsUpperBody : {"type":"tag","data":{"tags":["as_upperBody"]}},
	targetWearsLowerBody : {"type":"tag","data":{"tags":["as_lowerBody"]}},
	targetOneWearsLowerBody : {type:Condition.Types.tag,data:{"tags":[stdTag.asLowerBody]}, targnr:0},
	targetNoUpperBody : {"type":"tag","data":{"tags":["as_upperBody"]},"inverse":true},
	targetNoLowerBody : {"type":"tag","data":{"tags":["as_lowerBody"]},"inverse":true},
	senderWearsUpperBody : {"type":"tag","data":{"tags":["as_upperBody"]},"caster":true},
	senderWearsLowerBody : {"type":"tag","data":{"tags":["as_lowerBody"]},"caster":true},
	senderNoUpperBody : {"type":"tag","data":{"tags":["as_upperBody"]},"inverse":true,"caster":true},
	senderNoLowerBody : {"type":"tag","data":{"tags":["as_lowerBody"]},"inverse":true,"caster":true},
	targetUpperBodyNotHard : {"type":"tag","data":{"tags":["as_hard_upperBody"]},"inverse":true},
	targetUpperBodyHard : {"type":"tag","data":{"tags":["as_hard_upperBody"]}},
	targetLowerBodyNotHard : {"type":"tag","data":{"tags":["as_hard_lowerBody"]},"inverse":true},
	targetLowerBodyHard : {"type":"tag","data":{"tags":["as_hard_lowerBody"]}},
	targetUpperBodyStretchy : {"type":"tag","data":{"tags":["as_stretchy_upperBody"]}},
	targetLowerBodyStretchy : {"type":"tag","data":{"tags":["as_stretchy_lowerBody"]}},
	targetLowerBodyMetal : {"type":"tag","data":{"tags":["as_metal_lowerBody"]}},
	targetUpperBodyMetal : {"type":"tag","data":{"tags":["as_metal_upperBody"]}},
	targetLowerBodyWaistband : {"type":"tag","data":{"tags":["as_waistband_lowerBody"]}},
	targetOneLowerBodyWaistband : {type:Condition.Types.tag,data:{"tags":[stdTag.asWaistband]}, targnr:0},
	targetLowerBodyNotPants : {type:Condition.Types.tag, data:{tags:[stdTag.asPants+"_lowerBody"]}, inverse:true},

	targetLowerBodyCanPullDown : {type:Condition.Types.tag,data:{"tags":[stdTag.asCanPullDown+"_lowerBody"]}},
	targetUpperBodyCanPullDown : {type:Condition.Types.tag,data:{"tags":[stdTag.asCanPullDown+"_upperBody"]}},
	targetUpperBodyCanPullUp : {type:Condition.Types.tag,data:{"tags":[stdTag.asCanPullUp+"_upperBody"]}},


	targetClassTentaclemancer : {type:Condition.Types.playerClass, data:{label:"tentaclemancer"}},	

	targetButtExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerBody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttButtExposed]}}
	]},
	targetGroinExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerBody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttGroinExposed]}}
	]},
	targetPenisExposed : {conditions:[
		{conditions:[
			{type:Condition.Types.tag, data:{tags:[stdTag.asLowerBody]}, inverse:true},
			{type:Condition.Types.tag, data:{tags:[stdTag.ttGroinExposed]}}
		], min:1},
		{type:Condition.Types.tag,data:{tags:[stdTag.penis]}}
	], min:-1},
	targetVaginaExposed : {conditions:[
		{conditions:[
			{type:Condition.Types.tag, data:{tags:[stdTag.asLowerBody]}, inverse:true},
			{type:Condition.Types.tag, data:{tags:[stdTag.ttGroinExposed]}}
		], min:1},
		{type:Condition.Types.tag,data:{tags:[stdTag.vagina]}}
	], min:-1},
	targetUpperBodyExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asUpperBody]}, inverse:true},
		{type:"tag", data:{tags:[stdTag.ttBreastsExposed]}}
	]},
	targetBreastsExposed : {conditions:[
		{conditions:[
			{type:"tag", data:{tags:[stdTag.asUpperBody]}, inverse:true},
			{type:"tag", data:{tags:[stdTag.ttBreastsExposed]}}
		], min:1},
		{type:Condition.Types.tag,data:{tags:[stdTag.breasts]}}
	], min:-1},
	senderGroinExposed : {conditions:[
		{type:"tag", data:{tags:[stdTag.asLowerBody]}, inverse:true, caster:true},
		{type:"tag", data:{tags:[stdTag.ttGroinExposed]}, caster:true}
	]},
	

	senderDishonorable : {type:Condition.Types.tag,data:{"tags":[stdTag.plDishonorable]},"caster":true},

	// Damaged by this action
	targetArmorDamaged : {type:Condition.Types.slotDamaged},
	targetArmorNotDamaged : {type:Condition.Types.slotDamaged, inverse:true},
	targetUpperBodyDamaged : {type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.upperBody}},
	targetLowerBodyDamaged : {type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.lowerBody}},
	targetLowerBodyNotDamaged : {type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.lowerBody}, inverse:true},
	targetUpperBodyNotDamaged : {type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.upperBody}, inverse:true},
	targetArmorStripped : {type:Condition.Types.slotStripped},
	targetArmorNotStripped : {type:Condition.Types.slotStripped, inverse:true},
	targetUpperBodyStripped : {type:Condition.Types.slotStripped, data:{slot:Asset.Slots.upperBody}},
	targetUpperBodyNotStripped : {type:Condition.Types.slotStripped, data:{slot:Asset.Slots.upperBody}, inverse:true},
	targetLowerBodyStripped : {type:Condition.Types.slotStripped, data:{slot:Asset.Slots.lowerBody}},
	targetLowerBodyNotStripped : {type:Condition.Types.slotStripped, data:{slot:Asset.Slots.lowerBody}, inverse:true},
	targetArmorNotDamagedOrStripped : {conditions:[
		"targetArmorNotDamaged", "targetArmorNotStripped"
	], min:-1},
	// Checks if upperbody was damaged, or there was no other damage
	targetUpperBodyOrNoDamage : {conditions:[
		{type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.upperBody}},
		{type:Condition.Types.slotDamaged, inverse:true}
	], min:1},
	targetLowerBodyOrNoDamage : {conditions:[
		{type:Condition.Types.slotDamaged, data:{slot:Asset.Slots.lowerBody}},
		{type:Condition.Types.slotDamaged, inverse:true}
	], min:1},
	

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

	// Usable on events that have Text set. This generally only validates when used on a chat text condition. 
	// Don't use it in chatPlayerConditions as the chat player is not set in those, and target/sender are the same. 
	// Those are mainly for checking characteristics of a player.
	senderIsChatPlayer : {type:Condition.Types.targetIsChatPlayer, caster:true},
	targetIsChatPlayer : {type:Condition.Types.targetIsChatPlayer},
	
	targetNotKnockedDown : {"type":"tag","data":{"tags":["wr_knocked_down"]},"inverse":true},
	targetKnockedDown : {"type":"tag","data":{"tags":["wr_knocked_down"]}},
	targetKnockedDownBack : {"type":"tag","data":{"tags":["wr_knocked_down_back"]}},
	targetKnockedDownFront : {"type":"tag","data":{"tags":["wr_knocked_down_front"]}},
	targetNotGrappled : {type:"tag", data:{tags:[stdTag.wrGrapple]}, inverse:true},
	targetNotGrappledOrKnockedDown : {type:"tag", data:{tags:[stdTag.wrKnockdown, stdTag.wrGrapple]}, inverse:true},
	targetGrappledByMe : {type:Condition.Types.tag, data:{tags:[stdTag.wrGrapple], caster:true}},
	senderHasWhip : {"type":"tag","data":{"tags":["as_whip"]},"caster":true},
	targetHasWhip : {type:Condition.Types.tag,data:{"tags":[stdTag.asWhip]}},
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
	targetLongHair : {type:Condition.Types.tag,data:{"tags":[stdTag.plLongHair]}},
	
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
	
	senderInvis : {type:Condition.Types.tag,data:{"tags":[stdTag.gpInvisible]},caster:true},
	senderNotInvis : {type:Condition.Types.tag,data:{"tags":[stdTag.gpInvisible]},caster:true, inverse:true},

	eventIsActionUsed : {"type":"event","data":{"event":["actionUsed"]},"targnr":0},
	eventIsTextTrigger : {type:Condition.Types.event,data:{event:[GameEvent.Types.textTrigger]},"targnr":0},
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
	targetMuchTaller : {type:Condition.Types.sizeValue,data:{amount:"se_Size+1",operator:">"}},
	targetMuchShorter : {type:Condition.Types.sizeValue,data:{amount:"se_Size-1",operator:"<"}},
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
	roomBook : {type:Condition.Types.tag,data:{"tags":[stdTag.mBook]}},
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
	mq00_completed : {type:Condition.Types.questCompleted, data:{quest:'MQ00_YuugBeach'}},

	// Text conditions for chats
	// One or more breasts squeezed
	metaBreastFondle : {
		conditions : [
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotBreast, stdTag.metaSlotBreasts]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSqueeze, stdTag.metaRub]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaArousing, stdTag.metaVeryArousing]}},
		],
		min:-1,
	},
	metaVaginaFondle : {
		conditions : [
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotVagina]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSqueeze, stdTag.metaRub, stdTag.metaPenetration, stdTag.metaLick, stdTag.metaTickle]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaArousing, stdTag.metaVeryArousing]}},
		],
		min:-1,
	},
	metaGroinFondle : {
		conditions : [
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotVagina, stdTag.metaSlotPenis, stdTag.metaSlotGroin]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSqueeze, stdTag.metaRub, stdTag.metaPenetration, stdTag.metaLick, stdTag.metaTickle]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaArousing, stdTag.metaVeryArousing]}},
		],
		min:-1,
	},
	metaGroinPain : {
		conditions : [
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotVagina, stdTag.metaSlotPenis, stdTag.metaSlotGroin]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaPainful, stdTag.metaVeryPainful]}},
		],
		min:-1,
	},
	metaPainful : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaPainful, stdTag.metaVeryPainful]}},
	metaButtGrab : {
		conditions : [
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotButt]}},
			{type:Condition.Types.textMeta, data:{tags:[stdTag.metaSqueeze, stdTag.metaRub]}},
		],
		min:-1,
	},
	// One or more breast slots included in text meta
	metaBreastSlots : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotBreast, stdTag.metaSlotBreasts]}},
	metaPelvisSlots : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaSlotGroin, stdTag.metaSlotPenis, stdTag.metaSlotBalls, stdTag.metaSlotVagina, stdTag.metaSlotButt, stdTag.metaSlotTaint]}},
	// Came inside the target
	metaCameInside : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaInjection, stdTag.metaUsedPenis], all:true}},
	metaPenetratedWithPenis : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaPenetration, stdTag.metaUsedPenis], all:true}},
	metaUsedTentacle : {type:Condition.Types.textMeta, data:{tags:[stdTag.metaUsedTentacles]}},

	actionPhysical : {type:Condition.Types.actionType, data:{type:Action.Types.physical}},
	actionDetrimental : {type:Condition.Types.actionDetrimental},


	wrapperStacks3 : {type : Condition.Types.wrapperStacks, data : {amount : 3}},
	sq_sharktopus_gong_stacks : {type : Condition.Types.wrapperStacks, data : {amount : 'g_team_0*3'}},

	SQ_sharktopusCompleted : {type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_01'}},
	targetIsSQ_sharktopus_gong : {type:Condition.Types.playerLabel, data:{label:'SQ_sharktopus_gong'}},


	roomRentedActiveDungeon : {type:Condition.Types.dungeonVarMath, data:{vars:'room_last_rented', formula:'room_last_rented and (room_last_rented+'+Game.ROOM_RENTAL_DURATION+')>g_time'}},
	

};


// Checks if target has lowerbody clothes and/or upperbody clothes with breasts
lib.targetHasClothedErogenousZone = {conditions:[
	lib.targetWearsLowerBody,
	{conditions:[
		lib.targetWearsUpperBody,
		lib.targetBreasts
	], min:-1}
], min:1};
lib.targetHasExposedErogenousZone = {conditions:[
	lib.targetGroinExposed,
	lib.targetButtExposed,
	lib.targetBreastsExposed
], min:1};
lib.targetHasExposedMilkableZone = {conditions:[
	lib.targetPenisExposed,
	lib.targetBreastsExposed
], min:1};
lib.targetGroinOrBreastsExposed = {conditions:[
	lib.targetGroinExposed,
	lib.targetBreastsExposed
], min:1};
lib.targetPelvisExposed = {conditions:[
	lib.targetGroinExposed,
	lib.targetButtExposed
], min:1};

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
	{conditions:[lib.targetButtExposed, lib.targetLowerBodyNotHard]},
], min:-1};
lib.targetMouthUnblockedAndNotHard = {type:Condition.Types.tag, data:{tags:[stdTag.wrBlockMouth]}, inverse:true};
lib.targetVaginaUnblockedAndNotHard = {conditions:[
	{type:Condition.Types.tag, data:{tags:[stdTag.wrBlockGroin]}, inverse:true},
	{type:Condition.Types.tag, data:{tags:[stdTag.vagina]}},
	{conditions:[lib.targetGroinExposed, lib.targetLowerBodyNotHard]}
], min:-1};

lib.targetNotNaked = {conditions:[
	lib.targetWearsUpperBody,
	lib.targetWearsLowerBody
], min:1};
lib.targetNaked = {conditions:[
	lib.targetWearsUpperBody,
	lib.targetWearsLowerBody
], inverse:true, min:1};
lib.targetUpperBodyDamagedNotStripped = {conditions:[
	lib.targetUpperBodyDamaged,
	lib.targetUpperBodyNotStripped
], min:-1};
lib.targetLowerBodyDamagedNotStripped = {conditions:[
	lib.targetLowerBodyDamaged,
	lib.targetLowerBodyNotStripped
], min:-1};


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
	{min:-1, conditions:["targetWearsUpperBody", "targetBreasts"]},
	"targetWearsLowerBody"
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