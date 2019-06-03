import stdTag from "../stdTag.js";
// Player templates
import PT from './playerTemplates.js';
import GameAction from "../../classes/GameAction.js";
import { DungeonEncounter } from "../../classes/Dungeon.js";
import Condition from "../../classes/Condition.js";
import {Wrapper, Effect} from "../../classes/EffectSys.js";
import { RoleplayStageOption } from "../../classes/Roleplay.js";



const lib = {
	imps : {
		player_templates : [
			"imp",
			"darkImp",
			"stunted_imp"
		],
		wrappers : [],
		startText : '',
		conditions : [],
		respawn : 260000
	},
	tentacles : {
		player_templates : [
			"tentacle_fiend",
			"lesser_tentacle_fiend",
			"shocktacle",
			"greater_tentacle_fiend",
		],
		wrappers : [],
		startText : '',
		conditions : [],
	},
	beach : {
		player_templates : [
			"cocktopus",
			"tentacrab"
		],
		wrappers : [],
		startText : '',
		conditions : [],
		respawn : 260000
	},
	groper : {
		player_templates : [
			"groper"
		],
		wrappers : [],
		startText : '',
		conditions : [],
		respawn : 260000
	},

	// YUUG
	yuug_port_tavern_npcs : {
		players: ["yuug_port_barkeep"],
		friendly : true,
		game_actions : [
			// MQ00 offer
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id : 'mq00_intro',
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
				}}
			},
			// MQ00 handin
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id : 'mq00_finish',
					player : 'yuug_port_barkeep',
					persistent : true,
					stages: [
						{
							index: 0,
							text: "Ye reek of death. Did ya clean out the cave as asked?",
							options: [
								{text: "Yes, evil cultist and all!", index: 1},
								{text: "All cleared cap'n, may I have my reward?", index: 2},
							]
						},
						{
							index: 1,
							text: "Cultist eh? I dunno about that, but maybe someone else here does. In either case, here's a little something from the lost 'n found box!",
							options: [{text:'Thanks', index:-1, game_actions:[{
								type: GameAction.types.finishQuest,
								data : {quest:'MQ00_YuugBeach'}
							}]}]
						},
						{
							index: 2,
							text: "Alright alright. Here ya go. A few coins and a little something from the ol lost 'n found box!",
							options: [{text:'Thanks', index:-1, game_actions:[{
								type: GameAction.types.finishQuest,
								data : {quest:'MQ00_YuugBeach'}
							}]}]
						},
						
					],
					conditions : [
						{type:Condition.Types.questObjectiveCompleted, data:{quest:'MQ00_YuugBeach', objective:'caveCleared'}, targnr:0},
						{type:Condition.Types.questCompleted, data:{quest:'MQ00_YuugBeach'}, inverse:true, targnr:0},
					]
				}}
			}
		]
	},

	yuug_port_authority : {
		players: ["yuug_port_portmaster"],
		friendly : true,
		game_actions : [{
			type : GameAction.types.roleplay,
			data : {rp:{
				id: 'yuug_portmaster_intro',
				stages : [
					{
						index: 0,
						text: 'Looking for a job? Check the bounty board on the wall to your left.',
						options : [
							{text:'Thanks', index:-1}
						],
					}
				],
				persistent : true,
				player : 'yuug_port_portmaster'
			}}
		}]
	},


	yuug_portswood_goblin : {
		players: ["Slurt"],
		friendly : true,
		game_actions : [
			// SQ_goboat offer
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id : 'SQ_goboat_intro',
					player: "Slurt",
					conditions : [
						{type:Condition.Types.questAccepted, data:{quest:'SQ_goboat'}, inverse:true, targnr:0},
						{type:Condition.Types.questCompleted, data:{quest:'SQ_goboat'}, inverse:true, targnr:0},
					],
					stages: [
						{
							index: 0,
							text: "Oh hello! Want a job?",
							options: [
								{text: "What kind of job?",index: 1},
								{text: "Not now.",index: -1}
							]
						},
						{
							index: 1,
							text: "I am building a boat to go fishing in this lake here. But some gropers chased me off while gathering materials.",
							options: [
								{text: "Go on...",index: 2},
								{text: "Nevermind, I don't have time for this.",index: -1},
							]
						},
						{
							index: 2,
							text: "Let's solve two problems at once. Kill some gropers and bring me their vines. Ok?",
							options: [
								{text: "Alright",index: -1, game_actions : [{
									type : GameAction.types.quest,
									data : {quest:"SQ_goboat"}
								}]},
								{text: "Maybe later.",index: -1},
							]
						},
					],
				}}
			},
			// SQ Goboat after accepted
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id : 'SQ_goboat_finish',
					player : 'Slurt',
					stages: [
						{
							index: 0,
							text: "Oh hi!",
							options: [
								{
									text: "I have the groper vines you asked for.", 
									index: 1, 
									conditions:[
										{type:Condition.Types.hasInventory, data:{label:"groperVine", amount:3}}
									],
									game_actions:[
										{type: GameAction.types.questObjective, data : {quest:"SQ_goboat", objective:"roperVines", type:"add", amount:3}},
										{type: GameAction.types.finishQuest, data : {quest:'SQ_goboat'}},
										{type: GameAction.types.addInventory, data : {asset:'groperVine', amount:-3}}
									]
								},
								{text: "Nevermind.", index: -1},
							]
						},
						{
							index: 1,
							text: "Yes! These will work! Come back in a few days and I might let you use the boat!",
							options: [{text:'Thanks', index:-1}]
						},
					],
					conditions : [
						{type:Condition.Types.questAccepted, data:{quest:'SQ_goboat'}, targnr:0},
					]
				}}
			}
		]
	},

	mimic : {
		startText : 'A mimic springs from the chest, grabbing hold of %T\'s ankles and pulling %Thim to the ground!',
		active : true,
		wrappers : [
			{
				label : 'legWrap',
				target: Wrapper.TARGET_AUTO,		// Auto is the person who started the encounter
				duration : 3,
				name : "Leg Wrap",
				icon : "daemon-pull.svg",
				description : "Knocked down on your %knockdown, tentacles spreading your legs.",
				trigger_immediate : true,
				tags : [stdTag.wrLegsSpread],
				add_conditions : ["targetNotKnockedDown","targetNotBeast","senderNotDead", "targetNotDead"], 
				effects : [
					{
						type : Effect.Types.knockdown,
						data: {
							type : Effect.KnockdownTypes.Back
						}
					}
				]
			}
		],
		player_templates : ['mimic']
	},

	// Impicus in yuug portswood cave
	yuug_portswood_cave_impicus : {
		players : ['Impicus'],
		friendly : true,
		
		game_actions : [
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id: 'yuug_portswood_cave_impicus',
					label : 'yuug_portswood_cave_impicus',
					player : 'Impicus',
					persistent : true,
					once : true,
					stages: [
						{
							index: 0,
							text: "How you get past my tentacly fiends!?",
							options: [
								{text: "With tons of lube.", index: 10},
								// Fake
								{text: "They fell to my might!", index: 11, conditions:[{type:Condition.Types.formula, data:{formula:"(ta_BonPhysical-ta_Lv)>3"}, inverse:true, caster:true}]},
								// Real
								{text: "They fell to my might!", index: 12, conditions:[{type:Condition.Types.formula, data:{formula:"(ta_BonPhysical-ta_Lv)>3"}, caster:true}]},
								{text: "One tentaclemancer to another: You're out of your league.", index: 13, conditions:["targetClassTentaclemancer"]},
							]
						},
						{
							index: 10,
							text: "Then you prepared for what I do to you!",
							options: [
								{text: "[Begin Battle]", index: -1, game_actions:['startBattle'], chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 11,
							text: "Hah! You weak. Me can take you!",
							options: [
								{text: "[Begin Battle]", index: -1, game_actions:['startBattle'], chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 12,
							text: "Hm yes. You do look very strong. We do not need fight if you let me go.",
							options: [
								{text: "Fine you can go", index: -1},
								{text: "No I'd rather fight", index: -1, game_actions:['startBattle'], chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 13,
							text: "Oh uh. Impicus see now. Impicus will study harder. Maybe we can battle when we more even!",
							options: [
								{text: "Fine, come back when you're stronger", index: -1, game_actions:[{type:GameAction.types.dungeonVar, data:{id:"impicus_trained",val:true}}]},
								{text: "No I'll deal with you now", index: -1, game_actions:['startBattle'], chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
					conditions : ["notInCombat"]
				}}
			}
		]
	},
	yuug_portswood_cave_ixsplat : {
		players : ['Ixsplat'],
		friendly : true,
		game_actions : [
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id: 'yuug_portswood_cave_ixsplat',
					label : 'yuug_portswood_cave_ixsplat',
					player : 'Ixsplat',
					persistent : true,
					once : true,
					stages: [
						{
							index: 0,
							text: "Ah ha! A test subject!",
							options: [
								{text: "What exactly are we testing?", index: 10},
								{text: "[Just Attack]", game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 10,
							text: "My wondrous groperope! A lovely rope made of groper vines, with a life of its own!",
							options: [
								{text: "Sounds exciting!", index: 100},
								{text: "[Just Attack]", game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 100,
							text: "Yes! Now stand still while I whip you!",
							options: [
								{text: "[Begin Battle]", game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
					conditions : ["notInCombat"]
				}}
			}
		]
	},


	// MQ00
	MQ00_Boss : {
		players: [
			'MQ00_Boss',
			'MQ00_Minion',
		],
		friendly : true,
		game_actions : [
			// Boss talk
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					id: 'mq00_boss',
					player : 'MQ00_Boss',
					persistent : true,
					stages: [
						{
							index: 0,
							text: "The shrine is ready! Soon the master fate will take place! Wait... Who are you?",
							options: [
								{text: "The what with the what now?", index: 10},
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
							index: 10,
							text: "Foolish mortal! The master will consume you!",
							options: [
								{text: "[Attack]", index: -1, game_actions:['startBattle'], chat:RoleplayStageOption.ChatType.none},
							]
						},

						{
							index: 2,
							text: "Then why do you smell of battle?",
							options: [
								{text: "Isometric exercise! Care to join me?", index: 10},
							]
						},
					],
					conditions : [
						"notInCombat",
						{type:Condition.Types.questObjectiveCompleted, data:{quest:'MQ00_YuugBeach', objective:'caveCleared'}, inverse:true, targnr:0},
					]
				}}
			}
		]
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
