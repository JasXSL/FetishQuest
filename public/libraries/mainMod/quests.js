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
			},
			{type:QuestReward.Types.Reputation, data:{faction:"yuug_necromancer", amount:25}}
		],
		multiply_reward : true,
		exp_multiplier : 2,
	},



	// Church quests
	// Necromancer quest
	["SQ_yuug_church_00"] : {
		name : 'Getting Some Exorcise',
		description : 'The priests of the Yuug Church have let me know about one of their members being kidnapped by a powerful demon. They have captured one demon\'s minions who they are holding prison beneath the Yuug Church. They want me to force the demon to reveal who kidnapped the priest and where he was taken.',
		objectives : [
			{
				label : 'confession',
				name : 'Demon Forced to Confess',
				amount : 1,
				completion_desc : 'I should take my findings back to the priests beneath the church.',
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_church_interrogation"},
							"targnr" : 0
						},
					],
				}]
			},
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'gold', _stacks:1},
			},
			{type:QuestReward.Types.Reputation, data:{faction:"yuug_clerics", amount:100}}
		],
		multiply_reward : true,
		exp_multiplier : 1,
	},

	["SQ_yuug_church_01"] : {
		name : 'The Divine Scepter',
		description : 'I have found the name of the demon, but he is too powerful to defeat alone. The priests have suggested I look for a relic known as "The Divine Scepter" that was stolen from the church recently. The Backdoor tavern in North West Yuug City might be a good place to start my search.',
		objectives : [
			{
				label : 'informationGathered',
				name : 'Scepter whereabouts discovered',
				amount : 1,
				completion_desc : 'I have found a raccoon named Cor in the backdoor tavern who has suggested the thieves might be hiding in the sewers beneath Yuug. I might have some luck entering through one of the many wells scattered around the city.',
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
				}],
			},
			{
				label : 'informationGathered',
				name : 'Scepter Recovered',
				amount : 1,
				completion_desc : 'It turns out Cor stole the scepter, but it seems to be sullied. I should bring it back to the church.',
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_church_ambush"},
							"targnr" : 0
						},
					],
				}],
			},
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'gold', _stacks:1},
				data : {label:Asset.Dummies.label, name:'divineScepter', _stacks:1},
			},
			{type:QuestReward.Types.Reputation, data:{faction:"yuug_clerics", amount:50}}
		],
		multiply_reward : true,
		exp_multiplier : 3,
	},

	["SQ_yuug_church_02"] : {
		name : 'A Subpreme Rescue',
		description : 'The priests have located the demon Malthereus hiding in a derelict cabin on the east side of Yuug City, outside the walls. I should locate and defeat him to free the prisoner!',
		objectives : [
			{
				label : 'malthereusDefeated',
				name : 'Malthereus Defeated',
				amount : 1,
				completion_desc : 'It turns out the missing priest had not been kidnapped, but in fact eloped with the demon. He gave me his church insignia to take back to the church.',
				events : [{
					action : QuestObjectiveEvent.Actions.add,
					data : {amount:1},
					conditions : [
						"eventIsEncounterDefeated",
						{
							"type" : Condition.Types.encounterLabel,
							"data" : {label:"yuug_church_malthereus"},
							"targnr" : 0
						},
					],
				}],
			},
		],
		rewards : [
			{
				type : QuestReward.Types.Asset,
				data : {label:Asset.Dummies.label, name:'gold', _stacks:1},
				// Todo: Rewards
			},
			{type:QuestReward.Types.Reputation, data:{faction:"yuug_clerics", amount:50}}
		],
		multiply_reward : true,
		exp_multiplier : 3,
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