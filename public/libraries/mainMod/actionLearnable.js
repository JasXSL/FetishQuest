// Library of actions that should show up in the spell learning system.
// Tied to actions.js library
import C from './conditions.js';
import Condition from '../../classes/Condition.js';

const lib = {

	elementalist_iceBlast : {
		action : 'elementalist_iceBlast',
		conditions : ["targetClassElementalist", "targetLevel1"],
		auto_learn : true,
	},
	elementalist_healingSurge : {
		action : 'elementalist_healingSurge',
		conditions : ["targetClassElementalist", "targetLevel2"],
		auto_learn : true,
	},
	elementalist_waterSpout : {
		action : 'elementalist_waterSpout',
		conditions : ["targetClassElementalist", "targetLevel3"],
		auto_learn : true,
	},
	elementalist_earthShield : {
		action : 'elementalist_earthShield',
		conditions : ["targetClassElementalist"],
		cost : 300,
	},
	elementalist_discharge : {
		action : 'elementalist_discharge',
		conditions : ["targetClassElementalist"],
	},
	elementalist_riptide : {
		action : 'elementalist_riptide',
		conditions : ["targetClassElementalist"],
	},


	rogue_exploit : {
		action : 'rogue_exploit',
		conditions : ["targetClassRogue", "targetLevel1"],
		auto_learn : true,
	},
	rogue_corruptingVial : {
		action : 'rogue_corruptingVial',
		conditions : ["targetClassRogue", "targetLevel2"],
		auto_learn : true,
	},
	rogue_sneakAttack : {
		action : 'rogue_sneakAttack',
		conditions : ["targetClassRogue", "targetLevel3"],
		auto_learn : true,
	},
	rogue_comboBreaker : {
		action : 'rogue_comboBreaker',
		conditions : ["targetClassRogue"],
		cost : 300,
	},
	rogue_tripwire : {
		action : 'rogue_tripwire',
		conditions : ["targetClassRogue"]
	},
	rogue_steal : {
		action : 'rogue_steal',
		conditions : ["targetClassRogue"]
	},


	cleric_smite : {
		action : 'cleric_smite',
		conditions : ["targetClassCleric", "targetLevel2"],
		auto_learn : true,
	},
	cleric_chastise : {
		action : 'cleric_chastise',
		conditions : ["targetClassCleric", "targetLevel3"],
		auto_learn : true,
	},
	cleric_heal : {
		action : 'cleric_heal',
		conditions : ["targetClassCleric", "targetLevel1"],
		auto_learn : true,
	},
	cleric_reserection : {
		action : 'cleric_reserection',
		conditions : ["targetClassCleric"]
	},
	cleric_penance : {
		action : 'cleric_penance',
		conditions : ["targetClassCleric"],
		cost : 300,
	},
	cleric_radiant_heal : {
		action : 'cleric_radiant_heal',
		conditions : ["targetClassCleric"],
	},
	

	tentaclemancer_tentacleWhip : {
		action : 'tentaclemancer_tentacleWhip',
		conditions : ["targetClassTentaclemancer", "targetLevel1"],
		auto_learn : true,
	},
	tentaclemancer_corruptingOoze : {
		action : 'tentaclemancer_corruptingOoze',
		conditions : ["targetClassTentaclemancer", "targetLevel2"],
		auto_learn : true,
	},
	tentaclemancer_siphonCorruption : {
		action : 'tentaclemancer_siphonCorruption',
		conditions : ["targetClassTentaclemancer", "targetLevel3"],
		auto_learn : true,
	},
	tentaclemancer_infusion : {
		action : 'tentaclemancer_infusion',
		conditions : ["targetClassTentaclemancer"]
	},
	tentaclemancer_grease : {
		action : 'tentaclemancer_grease',
		conditions : ["targetClassTentaclemancer"]
	},
	tentaclemancer_slimeWard : {
		action : 'tentaclemancer_slimeWard',
		conditions : ["targetClassTentaclemancer"],
		cost : 300,

	},

	warrior_revenge : {
		action : 'warrior_revenge',
		conditions : ["targetClassWarrior", "targetLevel3"],
		auto_learn : true,
	},
	warrior_bolster : {
		action : 'warrior_bolster',
		conditions : ["targetClassWarrior", "targetLevel2"],
		auto_learn : true,
	},
	warrior_viceGrip : {
		action : 'warrior_viceGrip',
		conditions : ["targetClassWarrior", "targetLevel1"],
		auto_learn : true,
	},
	warrior_masochism : {
		action : 'warrior_masochism',
		conditions : ["targetClassWarrior"],
		cost : 300,
	},
	warrior_injuryToInsult : {
		action : 'warrior_injuryToInsult',
		conditions : ["targetClassWarrior"],
	},
	warrior_infuriate : {
		action : 'warrior_infuriate',
		conditions : ["targetClassWarrior"],
	},




	monk_roundKick : {
		action : 'monk_roundKick',
		conditions : ["targetClassMonk", "targetLevel1"],
		auto_learn : true,
	},
	monk_disablingStrike : {
		action : 'monk_disablingStrike',
		conditions : ["targetClassMonk", "targetLevel2"],
		auto_learn : true,
	},
	monk_upliftingStrike : {
		action : 'monk_upliftingStrike',
		conditions : ["targetClassMonk", "targetLevel3"],
		auto_learn : true,
	},
	monk_meditate : {
		action : 'monk_meditate',
		conditions : ["targetClassMonk"],
		cost : 300,
	},
	monk_lowKick : {
		action : 'monk_lowKick',
		conditions : ["targetClassMonk"],
	},
	monk_circleOfHarmony : {
		action : 'monk_circleOfHarmony',
		conditions : ["targetClassMonk"],
	},


	necro_slimeBone : {
		action : 'slimeBone',
		cost : 0,
		conditions : [
			{type:Condition.Types.questCompleted, data:{quest:'necro_crypt'}},
			{conditions:['targetClassTentaclemancer', 'targetClassElementalist'], min:1}
		],
	},
	necro_improvedHexArmor : {
		action : 'improvedHexArmor',
		cost : 0,
		conditions : [
			{type:Condition.Types.questCompleted, data:{quest:'necro_crypt'}},
			{conditions:['targetClassTentaclemancer', 'targetClassElementalist'], min:1}
		],
	},

	// Low blow is available to all humanoids
	gen_lowBlow : {
		action : 'lowBlow',
		cost : 100,
		conditions : ['targetNotBeast'],
	},
	gen_rest : {
		action : 'rest',
		cost : 1,
		conditions : ['targetOnPlayerTeam']
	},





	// NPC whips:
	gen_whip_legLash : {
		gen_only : true,
		action : 'whip_legLash',
		conditions : ['targetNotBeast', "targetHasWhip"],
	},
	whip_powerLash : {
		gen_only : true,
		action : 'whip_powerLash',
		conditions : ['targetNotBeast', "targetHasWhip"],
	},



	// Players generated by player templates
	// tentacle_fiend
	tentacle_fiend_legWrap : {
		gen_only : true,
		action : 'tentacle_fiend_legWrap',
		conditions : ['targetClassTentacleFiend'],
	},
	tentacle_fiend_tentacleMilker : {
		gen_only : true,
		action : 'tentacle_fiend_tentacleMilker',
		conditions : ['targetClassTentacleFiend'],
	},
	tentacle_fiend_tentatug : {
		gen_only : true,
		action : 'tentacle_fiend_tentatug',
		conditions : ['targetClassTentacleFiend'],
	},
	tentacle_fiend_slime_wad : {
		gen_only : true,
		action : 'tentacle_fiend_slime_wad',
		conditions : ['targetClassTentacleFiend'],
	},

	// shocktacle
	shocktacle_tentacle_fiend_tentatug : {
		gen_only : true,
		action : 'tentacle_fiend_tentatug',
		conditions : ['targetClassShocktacle'],
	},
	shocktacle_tentacle_ride : {
		gen_only : true,
		action : 'tentacle_ride',
		conditions : ['targetClassShocktacle'],
	},
	shocktacle_zap : {
		gen_only : true,
		action : 'shocktacle_zap',
		conditions : ['targetClassShocktacle'],
	},
	

	// mimic
	mimic_tentacle_fiend_legWrap : {
		gen_only : true,
		action : 'tentacle_fiend_legWrap',
		conditions : ['targetClassMimic'],
	},
	mimic_tentacle_fiend_tentacleMilker : {
		gen_only : true,
		action : 'tentacle_fiend_tentacleMilker',
		conditions : ['targetClassMimic'],
	},
	mimic_tentacle_fiend_tentatug : {
		gen_only : true,
		action : 'tentacle_fiend_tentatug',
		conditions : ['targetClassMimic'],
	},


	// Imp shared
	shared_imp_specialDelivery : {
		gen_only : true,
		action : 'imp_specialDelivery',
		conditions : [{conditions:['targetClassImpScavenger', 'targetClassImpTrickster'], min:1, max:-1}],
	},
	shared_imp_blowFromBelow : {
		gen_only : true,
		action : 'imp_blowFromBelow',
		conditions : [{conditions:['targetClassImpScavenger', 'targetClassImpTrickster'], min:1, max:-1}],
	},
	shared_imp_ankleBite : {
		gen_only : true,
		action : 'imp_ankleBite',
		conditions : [{conditions:['targetClassImpScavenger', 'targetClassImpTrickster'], min:1, max:-1}],
	},
	shared_imp_claws : {
		gen_only : true,
		action : 'imp_claws',
		conditions : [{conditions:['targetClassImpScavenger', 'targetClassImpTrickster'], min:1, max:-1}],
	},
	impTrickster_itchingPowder : {
		gen_only : true,
		action : 'itchingPowder',
		conditions : ['targetClassImpTrickster'],
	},
	
	impMage_hexArmor : {
		gen_only : true,
		action : 'hexArmor',
		conditions : ['targetClassImpMage'],
	},
	impMage_imp_demonicPinch : {
		gen_only : true,
		action : 'imp_demonicPinch',
		conditions : ['targetClassImpMage'],
	},
	impMage_guardian_demon_remoteDelivery : {
		gen_only : true,
		action : 'guardian_demon_remoteDelivery',
		conditions : ['targetClassImpMage'],
	},


	goblinScavenger_imp_ankleBite : {
		gen_only : true,
		action : 'imp_ankleBite',
		conditions : ['targetClassGoblinScavenger'],
	},
	goblinScavenger_imp_blowFromBelow : {
		gen_only : true,
		action : 'imp_blowFromBelow',
		conditions : ['targetClassGoblinScavenger'],
	},


	// Guardian demon
	guardian_demon_consume : {
		gen_only : true,
		action : 'guardian_demon_consume',
		conditions : ['targetClassGuardianDemonBreaker'],
	},
	guardian_demon_impale : {
		gen_only : true,
		action : 'guardian_demon_impale',
		conditions : ['targetClassGuardianDemonBreaker'],
	},
	guardian_demon_expose : {
		gen_only : true,
		action : 'guardian_demon_expose',
		conditions : ['targetClassGuardianDemonBreaker'],
	},
	guardian_demon_remoteDelivery : {
		gen_only : true,
		action : 'guardian_demon_remoteDelivery',
		conditions : ['targetClassGuardianDemonBreaker'],
	},

	// Cocktopus
	cocktopus_tentacle_fiend_legWrap : {
		gen_only : true,
		action : 'tentacle_fiend_legWrap',
		conditions : ['targetClassCocktopus'],
	},
	cocktopus_tentacle_fiend_tentatug : {
		gen_only : true,
		action : 'tentacle_fiend_tentatug',
		conditions : ['targetClassCocktopus'],
	},
	cocktopus_tentacle_latch : {
		gen_only : true,
		action : 'tentacle_latch',
		conditions : ['targetClassCocktopus'],
	},
	cocktopus_inkject : {
		gen_only : true,
		action : 'cocktopus_inkject',
		conditions : ['targetClassCocktopus'],
	},
	cocktopus_ink : {
		gen_only : true,
		action : 'cocktopus_ink',
		conditions : ['targetClassCocktopus'],
	},
			

	// Tentacrab
	crab_claw_pinch : {
		gen_only : true,
		action : 'crab_claw_pinch',
		conditions : ['targetClassTentacrab'],
	},
	crab_claw_tug : {
		gen_only : true,
		action : 'crab_claw_tug',
		conditions : ['targetClassTentacrab'],
	},


	// Skeleton shared
	shared_skeleton_looseHand : {
		gen_only : true,
		action : 'skeleton_looseHand',
		conditions : [{conditions:['targetClassSkeletonRattler','targetClassSkeletonMage'], min:1, max:-1}],
	},
	shared_boneRattle : {
		gen_only : true,
		action : 'boneRattle',
		conditions : [{conditions:['targetClassSkeletonRattler','targetClassSkeletonMage'], min:1, max:-1}],
	},
	skeletonMage_boneShards : {
		gen_only : true,
		action : 'boneShards',
		conditions : ['targetClassSkeletonMage'],
	},
	skeletonMage_hexArmor : {
		gen_only : true,
		action : 'hexArmor',
		conditions : ['targetClassSkeletonMage'],
	},


	// Necromancer
	necromancer_boneShards : {
		gen_only : true,
		action : 'boneShards',
		conditions : ['targetClassNecromancer'],
	},
	necromancer_hexArmor : {
		gen_only : true,
		action : 'hexArmor',
		conditions : ['targetClassNecromancer'],
	},
	necromancer_slimeBone : {
		gen_only : true,
		action : 'slimeBone',
		conditions : ['targetClassNecromancer'],
	},
	

	// Ghouls
	ghoulRavener_pounce : {
		gen_only : true,
		action : 'pounce',
		conditions : ['targetClassGhoulRavener'],
	},
	ghoulMunch : {
		gen_only : true,
		action : 'ghoulMunch',
		conditions : ['targetClassGhoulRavener'],
	},
	ghoulSpit : {
		gen_only : true,
		action : 'ghoulSpit',
		conditions : ['targetClassGhoulRavener'],
	},


	// Groper
	shared_groper_tentacle_fiend_legWrap : {
		gen_only : true,
		action : 'tentacle_fiend_legWrap',
		conditions : [{conditions:['targetClassGroper', 'targetClassGroperSapbeast'], min:1, max:-1}],
	},
	shared_groper_leg_spread : {
		gen_only : true,
		action : 'groper_leg_spread',
		conditions : [{conditions:['targetClassGroper', 'targetClassGroperSapbeast'], min:1, max:-1}],
	},
	groper_groin_lash : {
		gen_only : true,
		action : 'groper_groin_lash',
		conditions : ['targetClassGroper'],
	},
	groper_groin_grope : {
		gen_only : true,
		action : 'groper_groin_grope',
		conditions : ['targetClassGroper'],
	},

	groper_sap_squeeze : {
		gen_only : true,
		action : 'groper_sap_squeeze',
		conditions : ['targetClassGroperSapbeast'],
	},
	groper_sap_inject : {
		gen_only : true,
		action : 'groper_sap_inject',
		conditions : ['targetClassGroperSapbeast'],
	},
	
	groper_root : {
		gen_only : true,
		action : 'groper_root',
		conditions : ['targetClassGroperInfested'],
	},
	groper_skittering_swarm : {
		gen_only : true,
		action : 'groper_skittering_swarm',
		conditions : ['targetClassGroperInfested'],
	},
	groper_stinging_swarm : {
		gen_only : true,
		action : 'groper_stinging_swarm',
		conditions : ['targetClassGroperInfested'],
	},



	// Lamprey
	lamprey_slither : {
		gen_only : true,
		action : 'lamprey_slither',
		conditions : ['targetClassLamprey'],
	},
	lamprey_leech : {
		gen_only : true,
		action : 'leech',
		conditions : ['targetClassLamprey'],
	},
	lamprey_shock : {
		gen_only : true,
		action : 'lamprey_shock',
		conditions : ['targetClassLamprey'],
	},
	

	// Anemone
	anemone_grab : {
		gen_only : true,
		action : 'anemone_grab',
		conditions : ['targetClassAnemone'],
	},
	anemone_tickle : {
		gen_only : true,
		action : 'anemone_tickle',
		conditions : ['targetClassAnemone'],
	},
	anemone_restrain : {
		gen_only : true,
		action : 'anemone_restrain',
		conditions : ['targetClassAnemone'],
	},
	anemone_leech : {
		gen_only : true,
		action : 'leech',
		conditions : ['targetClassAnemone'],
	},
	

	// Outlaw brute
	outlaw_brute_warrior_revenge : {
		gen_only : true,
		action : 'warrior_revenge',
		conditions : ['targetClassOutlawBrute'],
	},
	outlaw_brute_warrior_viceGrip : {
		gen_only : true,
		action : 'warrior_viceGrip',
		conditions : ['targetClassOutlawBrute'],
	},
	outlaw_brute_guardian_demon_expose : {
		gen_only : true,
		action : 'guardian_demon_expose',
		conditions : ['targetClassOutlawBrute'],
	},
	outlaw_brute_guardian_demon_grapple : {
		gen_only : true,
		action : 'guardian_demon_grapple',
		conditions : ['targetClassOutlawBrute'],
	},
	outlaw_brute_guardian_demon_impale : {
		gen_only : true,
		action : 'guardian_demon_impale',
		conditions : ['targetClassOutlawBrute'],
	},

	outlaw_rogue_breast_squeeze : {
		gen_only : true,
		action : 'breast_squeeze',
		conditions : ['targetClassOutlawRogue'],
	},
	outlaw_rogue_imp_blowFromBelow : {
		gen_only : true,
		action : 'imp_blowFromBelow',
		conditions : ['targetClassOutlawRogue'],
	},

	outlaw_rogue_rogue_exploit : {
		gen_only : true,
		action : 'rogue_exploit',
		conditions : ['targetClassOutlawRogue'],
	},

	outlaw_rogue_rogue_sneakAttack : {
		gen_only : true,
		action : 'rogue_sneakAttack',
		conditions : ['targetClassOutlawRogue'],
	},

	outlaw_rogue_itchingPowder : {
		gen_only : true,
		action : 'itchingPowder',
		conditions : ['targetClassOutlawRogue'],
	},


	outlaw_tentaclemancer_tentacle_pit : {
		gen_only : true,
		action : 'tentacle_pit',
		conditions : ['targetClassOutlawTentaclemancer'],
	},
	outlaw_tentaclemancer_hexArmor : {
		gen_only : true,
		action : 'hexArmor',
		conditions : ['targetClassOutlawTentaclemancer'],
	},
	outlaw_tentaclemancer_imp_demonicPinch : {
		gen_only : true,
		action : 'imp_demonicPinch',
		conditions : ['targetClassOutlawTentaclemancer'],
	},
	outlaw_tentaclemancer_tentaclemancer_grease : {
		gen_only : true,
		action : 'tentaclemancer_grease',
		conditions : ['targetClassOutlawTentaclemancer'],
	},
	outlaw_tentaclemancer_tentaclemancer_tentacleWhip : {
		gen_only : true,
		action : 'tentaclemancer_tentacleWhip',
		conditions : ['targetClassOutlawTentaclemancer'],
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
