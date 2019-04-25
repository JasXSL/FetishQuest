import GameAction from "../../classes/GameAction.js";
import Condition from "../../classes/Condition.js";

const lib = {

	// Procedural bounty board
	procedural_bounty_board : {
		stages: [
			{
				index : 0,
				text : '[Dev Note] This is where you can do procedurally generated dungeons. Generating a new one will wipe any procedural dungeon in progress. This system will be changed in the future.',
				options : [
					{text:'[Generate New]', index:0, game_actions:['generateDungeon']},
					{text:'[Visit Dungeon]', index:-1, game_actions:['visitDungeon']},
					{text:'[Cancel]', index:-1},
				],
			}
		]
	},
 
	// MQ00
	first_quest_pickup: {
		stages: [
			{
				index: 0,
				text: "OI! Wake up ya damn drunk!",
				options: [
					{text: "What?",index: 1}
				]
			},
			{
				index: 1,
				text: "Yer friends left ya here after racking up a massive tab. And I've no idea how ya lost all yer clothes.",
				options: [
					{text: "What friends?",index: 2}
				]
			},
			{
				index: 2,
				text: "Look all I know is ye owe me money. But if ye have none, I may 'ave a job for ya!",
				options: [
					{text: "Ok?",index: 3}
				]
			},
			{
				index: 3,
				text: "To the west be a flooded cave. Problem is the sea creatures inhabiting it be migrating towards this here port.",
				options: [{text: "And you want me to take care of them?",index: 4}]
			},
			{
				index: 4,
				text: "Aye and go check out the cave while yer at it. Do this and I will write off your tab, maybe even throw in a little something from the lost 'n found box!",
				options: [{
					text: "Ok",
					index: -1,
					game_actions : [{
						type : GameAction.types.quest,
						data : {quest:"MQ00_YuugBeach"}
					}]
				}],
			}
		],
		player: "yuug_port_barkeep",
		persistent: true,
		conditions : [
			{type:Condition.Types.questAccepted, data:{quest:'MQ00_YuugBeach'}, inverse:true, targnr:0},
			{type:Condition.Types.questCompleted, data:{quest:'MQ00_YuugBeach'}, inverse:true, targnr:0},
		]
	},

	["MQ00_Boss"] : {

		player : 'MQ00_Boss',
		persistent : true,
		stages: [
			{
				index: 0,
				text: "The shrine is ready! Wait... Who are you?",
				options: [
					{text: "What is going on here?", index: 10},
					{text: "Uh, strippogram?", index: 1, conditions:['targetNaked']},		// Without clothes
					{text: "Uh, strippogram?", index: 2, conditions:['targetNotNaked']},	// With clothes
				]
			},
			{
				index: 1,
				text: "Without clothes?",
				options: [
					{text: "You got me there.", index: -1, game_actions:['startBattle']},
				]
			},
			{
				index: 2,
				text: "Then why do you smell of battle?",
				options: [
					{text: "Fair enough.", index: -1, game_actions:['startBattle']},
				]
			},
			{
				index: 10,
				text: "You would have me reveal my lord's intentions? I think not! Impy, attack!",
				options: [
					{text: "So be it", index: -1, game_actions:['startBattle']},
				]
			},
		],
		conditions : [
			"notInCombat",
			{type:Condition.Types.questObjectiveCompleted, data:{quest:'MQ00_YuugBeach', objective:'caveCleared'}, inverse:true, targnr:0},
		]
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