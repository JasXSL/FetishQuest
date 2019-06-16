import Quest, { QuestObjectiveEvent } from "../../classes/Quest.js";
//import C from './conditions.js';
import Condition from "../../classes/Condition.js";
import Asset from "../../classes/Asset.js";

const lib = {
	["MQ00_YuugBeach"] : {
		name : 'A Moist Cave',
		description : 'The barkeep at the Yuug port tavern has instructed me to clear a flooded cave west of the port, as well as any naughty sea creatures on the way there.',
		objectives : [
			{
				label : 'caveCleared',
				name : 'Cave Cleared',
				amount : 1,
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"MQ00_Boss"},
							"targnr" : 0
						},
					],
				}]
			}
		],
		rewards : [
			{label:Asset.Dummies.label, name:'gold', _stacks:1},		// polymorph into a gold library object with 2 stacks
			'whiteSwimtrunks',
		],
		multiply_reward : true,
	},



	// Goblin boat quest
	["SQ_goboat"] : {
		name : 'A goblin and his boat',
		description : 'A goblin in Yuug Portswood is building a boat and needs roper vines to keep the wood together.',
		objectives : [
			{
				label : 'roperVines',
				name : 'Groper Vines Handed to Slurt',
				amount : 3,
				events : []
			}
		],
		rewards : [
			{label:Asset.Dummies.label, name:'gold', _stacks:2},
		],
		multiply_reward : true,
		exp_multiplier : 0.5,
	}

};


function getArray() {
	const out = [];
	for (let action in lib) {
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export { getArray };
export default lib;