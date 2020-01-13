import Quest, { QuestObjectiveEvent, QuestReward } from "../../classes/Quest.js";
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
			{
				type : QuestReward.Types.Asset,
				data: {label:Asset.Dummies.label, name:'gold', _stacks:1},		// polymorph into a gold library object with 2 stacks
			},
			{
				type : QuestReward.Types.Asset,
				data : 'whiteSwimtrunks',
			}
		],
		multiply_reward : true,
		exp_multiplier : 2
	},



	// Goblin boat quest
	["SQ_goboat"] : {
		name : 'A goblin and his boat',
		description : 'A goblin in Yuug Portswood is building a boat and needs groper vines to keep the wood together. Gropers can be found allover the woods.',
		objectives : [
			{
				label : 'roperVines',
				name : 'Groper Vines Handed to Slurt',
				amount : 3,
				events : []
			}
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'gold', _stacks:2}
			}
		],
		multiply_reward : true,
		exp_multiplier : 0.5,
	},


	// Necromancer quest
	["necro_crypt"] : {
		name : 'Move your dead bones',
		description : 'An experiment beneath the Yuug Necromancer guild has gone wrong due to a strange crystal. If I can clear out the area, the necromancer trainer in the sanctum will surely give me a reward.',
		objectives : [
			{
				label : 'boneConstruct',
				name : 'Bone Construct Defeated',
				amount : 1,
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_necromancer_construct"},
							"targnr" : 0
						},
					],
				}]
			},
			{
				label : 'sewerExperiment',
				name : 'Sewer Experiment Purged',
				amount : 1,
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_necromancer_blob_boss"},
							"targnr" : 0
						},
					],
				}]
			},
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'gold', _stacks:2},
			}
		],
		multiply_reward : true,
		exp_multiplier : 2,
	},

	// Rod
	["SQ_sharktopus_00"] : {
		name : 'An Otter\'s Rod',
		description : 'An otter in Yuug Portswood Isle has asked you to locate his missing fishing rod somewhere on the island.',
		objectives : [
			{
				label : 'fishingRodFound',
				name : 'Fishing rod found',
				amount : 1,
				events : []
			}
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'silver', _stacks:2},
			}
		],
		multiply_reward : true,
		exp_multiplier : 0.1,
	},
	["SQ_sharktopus_01"] : {
		name : 'Gone Fishing',
		hide_rewards : true,
		description : 'The otter in Yuug Portswood Isle has given you his fishing rod to try and catch the big one that got away. He suggested to try in the waters east of the isle.',
		objectives : [
			{
				label : 'fishedInPortswoodIsle',
				name : 'Fished in the waters east of Portswood Isle.',
				amount : 1,
			},
			{
				label : 'returnToIsland',
				name : 'An aquatic beast pulled you into the water, return to the island to talk to the otter!',
				amount : 1,
				visibility_conditions : [
					{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_01', objective:'fishedInPortswoodIsle'}}
				]
			},
			{
				label : 'defeatTheCultist',
				name : 'The otter is nowhere to be seen, but there\'s a hostile person at his camp, I should take it down and search for more clues!',
				amount : 1,
				visibility_conditions : [
					{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_01', objective:'returnToIsland'}}
				],
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_portswood_isle_east"},
							"targnr" : 0
						},
					],
				}]
			},
			{
				label : 'defeatTheBeast',
				name : 'I found a key on the figure, I should track down the monster and put an end to it!',
				amount : 1,
				visibility_conditions : [
					{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_01', objective:'defeatTheCultist'}}
				],
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"SQ_sharktopus_boss"},
							"targnr" : 0
						},
					],
				}]
			},
			{
				label : 'stuffTheBeast',
				name : 'The monster is quite grisly, maybe the Yuug Port tavernkeeper would be interested in a trophy!',
				amount : 1,
				visibility_conditions : [
					{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_01', objective:'defeatTheBeast'}}
				]
			},
		],
		rewards : [
			{data:{label:Asset.Dummies.label, name:'food_FriedFish', _stacks:2}},
			{data:{label:Asset.Dummies.label, name:'food_Ale', _stacks:2}},
			{data:"healingPotion"}
		],
		multiply_reward : true,
		exp_multiplier : 4,
	},

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