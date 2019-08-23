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
	rogue_dirtyTricks : {
		action : 'rogue_dirtyTricks',
		conditions : ["targetClassRogue", "targetLevel3"],
		auto_learn : true,
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
	},
	warrior_injuryToInsult : {
		action : 'warrior_injuryToInsult',
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
