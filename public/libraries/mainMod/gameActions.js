import GameAction from "../../classes/GameAction.js";
import Condition from "../../classes/Condition.js";
import { RoleplayStageOption } from "../../classes/Roleplay.js";

const lib = {

	// Loot kits
	loot_RazzyBerries : {
		type : GameAction.types.loot,
		data : {
			min:1, max:3,
			loot: ['food_RazzyBerry','food_RazzyBerry','food_RazzyBerry'],
		},
	},
	loot_Stones : {
		type : GameAction.types.loot,
		data : {
			min:1, max:2,
			loot: ['prettyRock','prettyRock'],
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

	splashVisual : {
		type : GameAction.types.hitfx,
		data : {
			hitfx : 'waterSpout',
			max_triggers : 1,
		}
	},



	// Quests

	// SQ_sharktopus
	SQ_sharktopus_fishing_rod : {
		type : GameAction.types.roleplay,
		conditions : [
			{type:Condition.Types.questAccepted, data:{quest:'SQ_sharktopus_00'}, targnr:0},
			{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_00', objective:'fishingRodFound'}, inverse:true, targnr:0},
		],
		data : {rp:{
			label : 'SQ_sharktopus_00_rod',
			stages: [
				{
					index: 0,
					text: "This must be the otter's fishing rod!",
					options: [
						{text: "[Take it]", index: -1, game_actions:[
							{type:GameAction.types.questObjective, data:{quest:'SQ_sharktopus_00', objective:'fishingRodFound'}},
						], chat:RoleplayStageOption.ChatType.none},
					]
				},
			],
		}}
	},
	SQ_sharktopus_blood : {
		type : GameAction.types.tooltip,
		data : {
			text : 'Black ooze.',
		},
		conditions : [
			{type:Condition.Types.questAccepted, data:{quest:'SQ_sharktopus_01'}, targnr:0},
			{type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_01'}, inverse:true, targnr:0},
		]
	}

	
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
