import stdTag from "../stdTag.js";
// Player templates
import PT from './playerTemplates.js';
import GameAction from "../../classes/GameAction.js";
import { DungeonEncounter } from "../../classes/Dungeon.js";
import Condition from "../../classes/Condition.js";
import {Wrapper, Effect} from "../../classes/EffectSys.js";
import Roleplay, { RoleplayStageOption } from "../../classes/Roleplay.js";
import GameEvent from "../../classes/GameEvent.js";



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
			"tentacrab",
		],
		wrappers : [],
		startText : '',
		conditions : [],
		respawn : 260000
	},
	beach_full : {
		player_templates : [
			"cocktopus",
			"tentacrab",
			"anemone",
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
	underwater : {
		player_templates : [
			"cocktopus",
			"anemone",
			"lamprey",
		],
		wrappers : [],
		startText : '',
		conditions : [],
		respawn : 260000
	},
	large_demons : {
		player_templates : [
			"guardian_demon",
		],
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
					label : 'mq00_intro',
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
					label : 'mq00_finish',
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
			},
			// Shop
			{
				type : GameAction.types.shop,
				data : {shop:'yuug_port_tavern', player:'yuug_port_barkeep'},
			}
		]
	},

	yuug_port_authority : {
		players: ["yuug_port_portmaster"],
		friendly : true,
		game_actions : [{
			type : GameAction.types.roleplay,
			data : {rp:{
				label: 'yuug_portmaster_intro',
				stages : [
					{
						index: 0,
						text: 'Looking for a job? Check the bounty board on the wall to your left.',
						options : [
							{text:'Thanks', index:-1}
						],
					}
				],
				once:true,
				persistent : true,
				player : 'yuug_port_portmaster'
			}}
		}]
	},

	yuug_port_blacksmith : {
		players: ["yuug_port_blacksmith"],
		friendly : true,
		game_actions : [
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label: 'yuug_port_blacksmith',
					stages : [
						{
							index: 0,
							text: "Welcome 'ta Bob's bits. We mostly sell seafarer's gear, but I could probably mend any armor ya need fixing!",
							options : [
								{text:'Thanks', index:-1}
							],
						}
					],
					once: true,
					persistent : true,
					player : 'yuug_port_blacksmith'
				}}
			},
			{
				type : GameAction.types.repairShop,
				data : {player:'yuug_port_blacksmith'}
			}
		]
	},

	yuug_portswood_caravan_npcs : {
		players: ["yuug_portswood_merchant"],
		friendly : true,
		game_actions : [
			// RP intro
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'yuug_portswood_merchant',
					stages : [
						{
							index: 0,
							text: 'Greetings brave traveler! Come see Foyash for the best deals around, yes!',
							options : [
								{text:'What kind of deals?', index:1},
								{text:'Ok', index:-1},
							],
						},
						{
							index: 1,
							text: 'Foyash sells potions and drinks for thirsty travelers. We also have this luxurious silk thong! It will surely look splendid on you! Yes yes!',
							options : [
								{text:'I\'ll keep that in mind', index:-1},
							],
						}
					],
					persistent : true,
					once : true,
					player : 'yuug_portswood_merchant'
				}}
			},
			// Shop
			{
				type : GameAction.types.shop,
				data : {shop:'yuug_portswood_merchant', player:'yuug_portswood_merchant'},
			}
		]
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
								{text: "Never mind, I don't have time for this.",index: -1},
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
									text: "I got you the three groper vines you asked for.", 
									index: 2, 
									conditions:[
										{type:Condition.Types.questObjectiveCompleted, data:{quest:"SQ_goboat", objective:"roperVines"}}
									],
									game_actions:[
										{type: GameAction.types.finishQuest, data : {quest:'SQ_goboat'}},
									]
								},
								{
									text: "I have a single groper vine for you.", 
									index: 1, 
									conditions:[
										{type:Condition.Types.questObjectiveCompleted, data:{quest:"SQ_goboat", objective:"roperVines"}, inverse:true},
										{type:Condition.Types.hasInventory, data:{label:"groperVine", amount:1}},
									],
									game_actions:[
										{type: GameAction.types.questObjective, data : {quest:"SQ_goboat", objective:"roperVines", type:"add", amount:1}},
										{type: GameAction.types.addInventory, data : {asset:'groperVine', amount:-1}}
									]
								},
								{text: "Nevermind.", index: -1},
							]
						},
						{
							index: 1,
							text: "Thank you!",
							options: [
								{text:'[Return]', index:0, chat:RoleplayStageOption.ChatType.none}
							]
						},
						{
							index: 2,
							text: "Yes you have! Here is a little something for your trouble! Come back in an hour or two and I let you use the boat!",
							options: [{text:'Thanks', index:-1}]
						},
					],
					conditions : [
						{type:Condition.Types.questAccepted, data:{quest:'SQ_goboat'}, targnr:0},
					]
				}}
			},
			// Once the boat is done
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'gobot_boat_done',
					player : 'Slurt',
					once:true,
					persistent : true,
					stages: [
						{
							index: 0,
							text: "Oh hi! My boat is done! Borrow it at your leasure!",
							options: [
								{text: "Thanks!", index : -1},
							]
						},
					],
					conditions:[
						{type:Condition.Types.questCompleted, data:{quest:"SQ_goboat"}},
						{type:Condition.Types.formula,data:{"formula":"g_time-q_SQ_goboat__time>3600"}}
					]
				}}
			}
		]
	},

	yuug_portswood_isle_east : {
		players: ["yuug_portswood_isle_otter", "Broper", "SQ_sharktopus_camp_cultist"],
		// Enable conditions
		player_conditions : {
			yuug_portswood_isle_otter : [
				{type:Condition.Types.questObjectiveCompleted, data:{'quest':'SQ_sharktopus_01','objective':'fishedInPortswoodIsle'}, inverse:true},
			],
			Broper : [
				{type:Condition.Types.questObjectiveCompleted, data:{'quest':'SQ_sharktopus_01','objective':'fishedInPortswoodIsle'}, inverse:true},
			],
			SQ_sharktopus_camp_cultist : [
				{type:Condition.Types.questObjectiveCompleted, data:{'quest':'SQ_sharktopus_01','objective':'fishedInPortswoodIsle'}},
			]
		},
		passives : [
			{effects:[
				{
					type:Effect.Types.gameAction,
					data : {action:{
						type : GameAction.types.roleplay,
						data : {rp:{
							stages: [
								{
									id: 's_0',
									index: 0,
									text: "You find a rusty key on the defeated cultist!",
									options: [{id:'done', text: "[Done]",index: -1, chat:RoleplayStageOption.ChatType.none}]
								},
							],
						}}
					}},
					events : [
						GameEvent.Types.playerDefeated,
					],
					conditions : [
						{type:Condition.Types.playerLabel, data:{label:'SQ_sharktopus_camp_cultist'}}
					]
				}
			]}
		],
		friendly : true,
		game_actions : [
			// SQ_sharktopus
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_00',
					player: "yuug_portswood_isle_otter",
					conditions : [
						{type:Condition.Types.questAccepted, data:{quest:'SQ_sharktopus_00'}, inverse:true, targnr:0},
						{type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_00'}, inverse:true, targnr:0},
					],
					stages: [
						{
							index: 0,
							text: "Well hello there! We don't usually get visitors out here!",
							options: [
								{text: "What is this place?",index: 10},
								{text: "[Ignore him]",index: -1, chat:RoleplayStageOption.ChatType.none}
							]
						},
						{
							index: 10,
							text: "This is my little camp. Help yourself to a drink. If you wanna help out, I could also use a favor.",
							options: [
								{text: "Sure what is it?",index: 20},
								{text: "Maybe later.",index: -1}
							]
						},
						{
							index: 20,
							text: "I was out fishing on the other end of the island when I caught something really big! I was just about to reel it in when some gropers came out of the woodwork!",
							options: [
								{text: "Go on...",index: 30},
								{text: "Never mind, I don't have time for this.",index: -1}
							]
						},
						{
							index: 30,
							text: "I did the only reasonable thing and dropped my rod and ran! Could you try locating my fishing rod?",
							options: [
								{text: "Sure! Doesn't sound that hard.",index: 40, game_actions:[
									{type:GameAction.types.quest, data:{quest:'SQ_sharktopus_00'}}
								]},
								{text: "No thanks.",index: -1}
							]
						},
						{
							index: 40,
							text: "Sweet!",
							options: [
								{text: "[Done]",index: -1, chat:RoleplayStageOption.ChatType.none}
							]
						},
					],
				}}
			},
			// SQ_sharktopus_handin
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_00_handin',
					player: "yuug_portswood_isle_otter",
					conditions : [
						{type:Condition.Types.questObjectiveCompleted, data:{quest:'SQ_sharktopus_00', objective:'fishingRodFound'}, targnr:0},
						{type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_00'}, inverse:true, targnr:0},
					],
					stages: [
						{
							index: 0,
							text: "My fishing rod, thank you!",
							options: [
								{text: "Here you go!", index: 1, game_actions:[
									{type:GameAction.types.finishQuest, data:{'quest':'SQ_sharktopus_00'}}
								]},
								{text: "[Ignore him]",index: -1}
							]
						},
						{
							index: 1,
							text: "I don't suppose you want to borrow my rod and try and catch the big one for me?",
							options: [
								{text: "Sure, why not?",index: 10, game_actions:[
									{type:GameAction.types.quest, data:{'quest':'SQ_sharktopus_01'}}
								]},
								{text: "Maybe later.",index: -1}
							]
						},
						{
							index: 10,
							text: "Awesome! Take this rod and head out east to try your luck!",
							options: [
								{text: "[Done]",index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
				}}
			},
			// Offer sharktopus_01 if cancelled previous dialog
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_01_offer',
					player: "yuug_portswood_isle_otter",
					conditions : [
						{type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_00'}, targnr:0},
						{type:Condition.Types.questCompleted, data:{quest:'SQ_sharktopus_01'}, inverse:true, targnr:0},
						{type:Condition.Types.questAccepted, data:{quest:'SQ_sharktopus_01'}, inverse:true, targnr:0},
					],
					stages: [
						{
							index: 0,
							text: "Changed your mind about fishing for me?",
							options: [
								{text: "Yeah, let's do it!",index: 10, game_actions:[
									{type:GameAction.types.quest, data:{'quest':'SQ_sharktopus_01'}}
								]},
								{text: "Nope.",index: -1}
							]
						},
						{
							index: 10,
							text: "Awesome! Take this rod and head out east to try your luck!",
							options: [
								{text: "[Done]",index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
				}}
			},
			// Cultist dialog
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_01_cultist',
					player: "SQ_sharktopus_camp_cultist",
					persistent : true,
					once : true,
					conditions : [
						{type:Condition.Types.questObjectiveCompleted, data:{'quest':'SQ_sharktopus_01','objective':'fishedInPortswoodIsle'}},
					],
					stages: [
						{
							index: 0,
							text: "Ah you must be the one who hurt our great beast. You must be mighty indeed! I will take pleasure in breaking you!",
							options: [
								{text: "[Attack]",index: -1, chat:RoleplayStageOption.ChatType.none, game_actions : [
									{type:GameAction.types.questObjective, data:{'quest':'SQ_sharktopus_01','objective':'returnToIsland'}},
									'startBattle'
								]},
							]
						},
					],
				}}
			},
		]
	},

	yuug_portswood_lake_east : {
		players: [],
		friendly : true,
		game_actions : [
			// SQ_sharktopus
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_01_water',
					once:true,
					persistent:true,
					conditions : [
						{type:Condition.Types.questAccepted, data:{quest:'SQ_sharktopus_01'}, targnr:0},
						{type:Condition.Types.questObjectiveCompleted, data:{quest:'fishedInPortswoodIsle'}, inverse:true, targnr:0},
					],
					stages: [
						{
							index: 0,
							text: "This looks like a nice spot to fish!",
							options: [
								{text: "[Cast lure]", index: -1, game_actions:[
									{type:GameAction.types.questObjective, data:{quest:'SQ_sharktopus_01', objective:'fishedInPortswoodIsle'}},
									'splashVisual',
									{type:GameAction.types.door, data:{index:14}}
								], chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
				}}
			},
		]
	},
	yuug_portswood_lake_capsize : {
		players: [],
		friendly : true,
		game_actions : [
			// SQ_sharktopus
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_01_capsize',
					player: "SQ_sharktopus_01_capsize",
					once:true,
					persistent:true,
					stages: [
						{
							index: 0,
							text: "You hook something massive! The boat tips over and you fall into the lake!",
							options: [
								{text: "[Done]", index: -1, chat:RoleplayStageOption.ChatType.none}
							]
						},
					],
				}}
			},
		]
	},

	SQ_sharktopus_boss : {
		players : ['SQ_sharktopus_gong', 'SQ_sharktopus_boss'],
		wrappers : [
			{	// Initial submerge is different in that it also stuns
				label : 'shark_submerge',
				tags : [stdTag.gpInvisible, stdTag.gpSkipTurns, stdTag.gpBoss],
				detrimental : false,
				duration : -1,
				target : Wrapper.TARGET_AOE,
				add_conditions : [{type:Condition.Types.playerLabel, data:{label:'SQ_sharktopus_boss'}}],
			}
		]
	},
	SQ_sharktopus_water_warning : {
		friendly : true,
		game_actions : [
			// SQ_sharktopus
			{
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'SQ_sharktopus_01_basement',
					once:true,
					persistent:true,
					stages: [
						{
							index: 0,
							text: "There's barely any light in this area! And it seems to be flooded to your waist!",
							options: [
								{text: "[Press on]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
				}}
			},
		]
	},
	

	// NPCS outside the tavern
	yuug_port : {
		players : ['yuug_port_peasant'],
		friendly : true,
		game_actions : [
			{
				conditions : ['targetBreasts'],
				type : GameAction.types.roleplay,
				data : {rp:{
					label : 'yuug_port',
					player : 'yuug_port_peasant',
					persistent : true,
					once : true,
					stages: [
						{
							index: 0,
							text: "Hey you! Nice tits!",
							options: [
								{text: "Thanks.", index: 1},
								// Strong
								{text: "Fuck off.", index: 2, conditions:[{type:Condition.Types.formula, data:{formula:"(ta_BonPhysical-ta_Lv)>1"}, caster:true}]},
								// Weak
								{text: "Fuck off.", index: 3, conditions:[{type:Condition.Types.formula, data:{formula:"(ta_BonPhysical-ta_Lv)>1"}, inverse:true, caster:true}]},								
								{text: "[Fight Him]", index: -1, game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
								{text: "[Just Leave]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 1,
							text: "Don't suppose I may 'ave a squeeze?",
							options: [
								{text: "Fine.", index: 10, conditions:['targetBreasts'], game_actions:[{
									type:GameAction.types.playerAction,
									data:{
										action:'breast_squeeze',
										player:'yuug_port_peasant',
									}
								}]},
								{text: "[Fight Him]", index: -1,game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
								{text: "[Just Leave]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
						{
							index: 10,
							text: "Thank ye kindly ma'am.",
							options: [
								{text: "[Leave]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},

						{
							index: 2,
							text: "Alright ye win, ye win. Have a good one!",
							options : [
								{text: "[Fight Him Anyway]", index: -1,game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
								{text: "[Just Leave]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},

						{
							index: 3,
							text: "Aw there's no need fer that luv. Come on. Give us one!",
							options : [
								{text: "Fine.", index: 10, conditions:['targetBreasts'], game_actions:[{
									type:GameAction.types.playerAction,
									data:{
										action:'breast_squeeze',
										player:'yuug_port_peasant',
									}
								}]},
								{text: "[Fight Him]", index: -1,game_actions:['startBattle'], index:-1, chat:RoleplayStageOption.ChatType.none},
								{text: "[Just Leave]", index: -1, chat:RoleplayStageOption.ChatType.none},
							]
						},
					],
					conditions : ["notInCombat"]
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
					},
					'selfTaunt'
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
					label: 'mq00_boss',
					player : 'MQ00_Boss',
					portrait : '/media/characters/li_zurd_portrait.jpg',
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


	debug_shop : {
		players: ['Slurt'],
		friendly : true,
		game_actions : [
			{
				type : GameAction.types.shop,
				data : {shop:'debugShop', player:'Slurt'}
			}
		]
	},
	debug_player_conditions : {
		players : ['Slurt','Impicus'],
		friendly : true,
		player_conditions : {
			Slurt : [{type:Condition.Types.numGamePlayersGreaterThan, data:{value:1}}],
			Impicus : [{type:Condition.Types.numGamePlayersGreaterThan, data:{value:1}, inverse:true}],
		}
	},
	debug_passives : {
		players : ['Slurt'],
		friendly : true,
		passives : [
			{
				// If it has a passive modifier, conditions need to be set here.
				//add_conditions : [{type:Condition.Types.team, data:{team:0}}],
				detrimental:false,
				effects : [
					// Deals 2 damage when a friendly player uses an action
					{
						// If it has an event trigger, conditions need to be set here
						conditions : [{type:Condition.Types.team, data:{team:0}, caster:true}],
						type:Effect.Types.damage, 
						data:{amount:2, dummy_sender:true}, 
						events : [GameEvent.Types.actionUsed],
						targets:[Wrapper.TARGET_EVENT_RAISER],
					}
				],
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
