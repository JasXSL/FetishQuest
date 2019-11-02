// Library of actions that should show up in the spell learning system.
// Tied to actions.js library
import C from './conditions.js';

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
	


	gen_lowBlow : {
		action : 'lowBlow',
		cost : 100,
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
