import GameAction from "../../classes/GameAction.js";

const lib = {

	// Loot kits
	loot_RazzyBerries : {
		type : GameAction.types.loot,
		data : {
			min:1, max:3,
			loot: ['food_RazzyBerry','food_RazzyBerry','food_RazzyBerry'],
		},
	},
	startBattle : {
		type : GameAction.types.toggleCombat,
		data : {
			on : true
		},
	},

	// Procedural dungeons
	generateDungeon : {
		type : GameAction.types.generateDungeon,
	},
	visitDungeon : {
		type : GameAction.types.visitDungeon,
	},
	proceduralRP : {
		type : GameAction.types.roleplay,
		data : {
			rp : 'procedural_bounty_board'
		}
	},



	// Quests

	// SQ_sharktopus
	SQ_sharktopus_fishing_rod : {
		type : GameAction.types.questObjective,
		data : {
			quest : 'SQ_sharktopus_00',
			objective : 'fishingRodFound',
		}
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
