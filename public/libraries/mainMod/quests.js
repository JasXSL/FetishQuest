import Quest, { QuestObjectiveEvent } from "../../classes/Quest.js";
import C from './conditions.js';
import Condition from "../../classes/Condition.js";

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
		rewards_assets : [],
		rewards_experience : 5,
		level : 1,
		
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