import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import Asset from "../../classes/Asset.js";
import { Effect, Wrapper } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import GameAction from "../../classes/GameAction.js";
import Condition from "../../classes/Condition.js";

const lib = {
	yuug_port_barkeep: {
		name : "Barkeep",
		species : "dog",
		description : "A nice barkeep. Todo.",
		icon : "",
		team : 1,
		size : 6,
		leveled : true,
		sadistic : 0.6,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.6,
	},
	yuug_port_blacksmith: {
		name : "Bob",
		species : "horse",
		description : "Bob is a large horse man wearing an apron. He runs Bob's bits. The seafarer gear store in Yuug.",
		icon : "",
		team : 1,
		size : 7,
		leveled : true,
		sadistic : 0.3,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.5,
	},
	yuug_port_portmaster : {
		name : "Portmaster",
		species : "shark",
		description : "A shark who runs the port office. Todo.",
		icon : "",
		team : 1,
		size : 6,
		leveled : true,
		sadistic : 0.6,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.6,
	},
	yuug_port_peasant : {
		name : "Dirty Sailor",
		species : "rat",
		description : "A scrawny rat-man.",
		icon : "",
		team : 1,
		size : 3,
		leveled : true,
		talkative : 0.8,
		sadistic : 0.5,
		dominant : 0.8,
		hetero : 1,
		intelligence : 0.4,
		stamina : -6,
		intellect : -2,
		agility : -2,
		svPhysical : -2,
        svElemental : 1,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : -2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 0,
		class : 'none',
		assets : [
			'genericRattyVest',
			{"name":"silver","label":"__LABEL__","_stacks":1},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		actions : ['lowBlow','breast_squeeze'],
		inventory : [0],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plFurry, stdTag.plDishonorable, stdTag.plHair, stdTag.plTail, stdTag.plEars, stdTag.plLongTail
		]
	},

	yuug_farmer : {
		name : "Farmer",
		species : "border collie",
		description : "A border collie.",
		icon : "",
		team : 1,
		size : 5,
		leveled : true,
		sadistic : 0.4,
		dominant : 0.6,
		hetero : 0.6,
		intelligence : 0.5,
	},

	yuug_city_gymleader : {
		name : "Chad",
		species : "rhino",
		description : "A large muscular rhino.",
		icon : "",
		team : 1,
		size : 7,
		leveled : true,
		sadistic : 0.8,
		dominant : 0.9,
		hetero : 0.5,
		intelligence : 0.5,
	},
	yuug_city_gym_trainee : {
		name : "Virgil",
		species : "sloth",
		description : "A scrawny looking sloth sitting in a corner staring down at a mug he's holding.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		sadistic : 0.0,
		dominant : 0.0,
		hetero : 0.8,
		intelligence : 0.6,
	},

	yuug_city_greasy_backdoor_receptionist : {
		name : "Rose",
		species : "brown bear",
		description : "A well fed brown bear lady wearing a flowery dress.",
		icon : "",
		team : 1,
		size : 6,
		leveled : true,
		sadistic : 0.2,
		dominant : 0.5,
		hetero : 0.5,
		intelligence : 0.6,
	},
	yuug_city_greasy_backdoor_tavern : {
		name : "Welt",
		species : "brown bear",
		description : "A large brawny bear man wearing a dirty apron.",
		icon : "",
		team : 1,
		size : 7,
		leveled : true,
		sadistic : 0.2,
		dominant : 0.5,
		hetero : 0.5,
		intelligence : 0.5,
	},
	yuug_premium_inn_receptionist : {
		name : "Veroniquette",
		species : "cat",
		description : "A female cat with bright white fur and an oversized blonde hairdo. Wearing a cream colored dress with puffy arms.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		sadistic : 0.8,
		dominant : 0.6,
		hetero : 0.8,
		intelligence : 0.5,
	},
	yuug_city_barker : {
		name : "Barker",
		species : "dalmatian",
		description : "A dalmatian standing near the city gates, visitors seem to gather around him.",
		icon : "",
		team : 1,
		size : 5,
		leveled : true,
		sadistic : 0.2,
		dominant : 0.2,
		hetero : 0.2,
		intelligence : 0.6,
	},

	MQ00_Boss : {
		name : "Li Zurd",
		species : "lizard",
		description : "A darkened figure emanating... dark magic. She's wearing a crimson robe.\nArt by Maddworld.",
		icon : "/media/characters/li_zurd_dressed.jpg",
		icon_upperBody : "/media/characters/li_zurd_dressed.jpg",
		icon_lowerBody : "/media/characters/li_zurd_naked.jpg",
		icon_nude : "/media/characters/li_zurd_naked.jpg",
		team : 1,
		size : 4,
		leveled : true,
		power : -1,
		sadistic : 0.7,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.8,
		stamina : 0,
		svPhysical : -2,
        svElemental : 0,
        svHoly : -2,
        svCorruption : 3,
        bonPhysical : -4,
        bonElemental : -2,
        bonHoly : -4,
        bonCorruption : -2,
		class : 'MQ00_Boss',
		assets : [
			'mq00_boss_robe',
			'minorHealingPotion',
			'manaPotion',
		],
		actions : [
			'imp_demonicPinch',
            'tentacle_pit'
		],
		inventory : [0,1,2],	// Which items should be equipped
		tags : [
			stdTag.gpBoss, stdTag.plTongue,
			stdTag.vagina, stdTag.breasts, stdTag.plBigBreasts, stdTag.plScaly, stdTag.plTail, stdTag.plLongTail, stdTag.asStrapon
		]
	},
	MQ00_Minion : {
		name : "Impy",
		species : "imp",
		description : "An imp connected via a leash to Li's belt.",
		icon : "",
		team : 1,
		size : 2,
		leveled : true,
		power : -1,
		sadistic : 0.7,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.4,
		stamina : -6,

		svPhysical : -1,
        svElemental : -1,
        svHoly : -4,
        svCorruption : 3,
        bonPhysical : -2,
        bonElemental : -2,
        bonHoly : -4,
		bonCorruption : 2,
		
		class : 'impScavenger',
		actions : [
			'imp_specialDelivery',
			'mq00_ward_boss'
		],
		assets : [],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plHorn, stdTag.plTail, stdTag.plTongue
		]
	},

	yuug_portswood_merchant : {
		name : "Foyash",
		species : "fox",
		description : "A fox who sells merchandise to weary travelers going between Yuug City and Port.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		sadistic : 0.1,
		dominant : 0.4,
		hetero : 0.3,
		intelligence : 0.6,
	},

	
	yuug_portswood_isle_otter : {
		name : "Otto",
		species : "otter",
		description : "An ordinary otter.",
		icon : "/media/characters/otter.jpg",
		team : 1,
		size : 5,
		leveled : true,
		sadistic : 0.1,
		dominant : 0.4,
		hetero : 0.3,
		intelligence : 0.4,
	},
	Broper : {
		name : "Broper",
		species : "groper",
		description : "A smaller than average groper. It seems pretty tame and is following Otto around.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		sadistic : 0.1,
		dominant : 0.4,
		hetero : 0.3,
		intelligence : 0.4,
		class : 'none',
	},
	SQ_sharktopus_camp_cultist : {
		name : "Cultist",
		species : "ferret",
		description : "A toned male ferret. He's got a mean look in his eyes.",
		icon : "",
		team : 1,
		size : 5,
		leveled : true,
		power : -1,
		sadistic : 0.8,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.6,
		stamina : 0,
		intellect : 0,
		agility : 1,
		class : 'none',
		svPhysical : 2,
        svElemental : -4,
        svHoly : -6,
        svCorruption : -3,
        bonPhysical : 2,
        bonElemental : -2,
        bonHoly : -4,
		bonCorruption : 0,
		talkative : 0.3,		
		actions : [
			'lowBlow',
			'whip_powerLash',
			'tentaclemancer_tentacleWhip',
		],
		tags : [
			stdTag.penis, stdTag.plFurry, stdTag.plTail, stdTag.plTongue, stdTag.plBigPenis, stdTag.gpBoss, stdTag.plClaws, stdTag.plEars, stdTag.plLongTail
		],
		assets : [
			'simpleWhip',
			'cultist_robe',
			'healingPotion',
			'genericRawhideThong',
			{"name":"silver","label":"__LABEL__","_stacks":23},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0,1,2,3],
	},
	SQ_sharktopus_boss : {
		name : "Shark Beast",
		species : "sharktopus",
		description : "A large grotesque mix between a shark and and octopus.",
		icon : "/media/characters/tfiend.jpg",
		team : 1,
		size : 7,
		leveled : true,
		power : -1,
		sadistic : 0.5,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.4,
		stamina : 10,
		intellect : 0,
		agility : 0,
		class : 'none',
		svPhysical : 0,
        svElemental : 1,
        svHoly : -4,
        svCorruption : 1,
        bonPhysical : 2,
        bonElemental : 2,
        bonHoly : -4,
		bonCorruption : 1,	
		actions : [
			'sharktopus_attack',		// Todo - Write texts. Disable other actions when submerged.
			'sharktopus_arouse',		// Todo - Write texts. Disable other actions when submerged.
			'sharktopus_submerge',
		],
		tags : [
			stdTag.gpBoss, stdTag.plTentacles, stdTag.plBeast
		],
		assets : [
			"sharkanium"
		],
		passives : [
			{
				duration:-1,
				label : 'disableAttackArouse',
				detrimental : false,
				effects : [
					{
						type : Effect.Types.disableActions,
						data : {
							conditions : [
								// Disable if
								{conditions:[
									// 
									{conditions:[
										// Stdattack/arouse AND invis
										{type:Condition.Types.actionLabel, data:{label:['stdAttack','stdArouse']}},
										'senderInvis',
									], min:-1},
									// OR 
									{conditions:[
										// sharktopus_attack/arouse AND NOT invis
										{type:Condition.Types.actionLabel, data:{label:['sharktopus_attack','sharktopus_arouse']}},
										'senderNotInvis',
									], min:-1},
								], min:1}
							]
						}
					}
				]
			}
		],
	},
	SQ_sharktopus_gong : {
		name : "Gong",
		species : "Inanimate Object",
		description : "An ornate gong sitting on top of a pedestal.",
		icon : "",
		team : 1,
		size : 1,
		leveled : true,
		class : 'none',
		svPhysical : -10,
		tags : [stdTag.gpSkipTurns, stdTag.plBeast, stdTag.gpDisableArousal, stdTag.gpDisableMP, stdTag.gpDisableAP, stdTag.gpDisableVictoryCondition, stdTag.gpDisableHP],
		passives : [
			{
				duration:-1,
				name : "Ring the gong",
				description : "Only targetable by physical attacks.",
				icon : "carillon",
				detrimental : false,
				effects: [
					{type:Effect.Types.allowReceiveSpells, data:{conditions:['actionPhysical','actionDetrimental']}},
					{
						label : 'gong_proc',
						type : Effect.Types.runWrappers,
						targets : [Wrapper.TARGET_CASTER],
						events : [GameEvent.Types.actionUsed],			// Any action has been used in the game
						conditions : [
							"targetIsWrapperParent",		// Target of said action was the recipient of this wrapper
						],
						data:{
							wrappers : [
								{
									label : 'sq_sharktopus_gong',
									duration : 3,
									name : "Reverberation",
									icon : "vibrating-ball",
									detrimental : false,
									description : "The gong is vibrating, something stirs under the water!",
									max_stacks : 100,
									effects : [
										{
											label : 'sq_sharktopus_gong_spawn',
											events : [GameEvent.Types.internalWrapperAdded],
											type:Effect.Types.gameAction, 
											data:{action:{
												type : GameAction.types.addPlayer,
												data : {
													player : 'SQ_sharktopus_mini_lamprey'
												},
											}},
											conditions : [
												{type:Condition.Types.numGamePlayersGreaterThan, data:{amount:5, team:1}, inverse:true},
												{type:Condition.Types.hasWrapper, data:{'label':['sq_sharktopus_turn_rang']}, inverse:true}
											],
										},
										{
											label : 'sq_sharktopus_gong_hide',
											events : [GameEvent.Types.internalWrapperStackChange],
											type:Effect.Types.runWrappers, 
											targets : [Wrapper.TARGET_CASTER],
											data:{wrappers:[
												{
													label : 'perma_invis',
													duration : -1,
													detrimental : false,
													tags : [stdTag.gpInvisible],
												},
												{
													label : 'shark_reveal',
													target : Wrapper.TARGET_AOE,
													detrimental : false,
													add_conditions : [{type:Condition.Types.playerLabel, data:{label:'SQ_sharktopus_boss'}}],
													effects:[
														{
															type:Effect.Types.removeWrapperByLabel, 
															data:{label:'sharktopus_submerge'},
														},
														{
															type:Effect.Types.activateCooldown,
															data:{actions:['sharktopus_submerge']}
														}
													]
												}
											]},
											conditions : ['sq_sharktopus_gong_stacks'],
										},
										{
											events : [GameEvent.Types.internalWrapperStackChange],
											type:Effect.Types.removeWrapperByLabel, 
											data:{label:'sq_sharktopus_gong'},
											conditions : ['sq_sharktopus_gong_stacks'],
										},
									]
								},
								{
									label : 'sq_sharktopus_turn_rang',
									duration : 1,
									detrimental : false,
								}
							]
						}
					}
				],
			}
		],
	},

	SQ_sharktopus_mini_lamprey : {
		name : "Juvenile Lamprey",
		species : "lamprey",
		description : "A smaller version of a lamprey.",
		icon : "",
		team : 1,
		size : 1,
		leveled : true,
		power : -1,
		sadistic : 0.3,
		dominant : 0.5,
		hetero : 0.5,
		intelligence : 0.1,
		stamina : -8,
		agility : -4,
		remOnDeath : true,

		svPhysical : -4,
        svElemental : -1,
        svHoly : -2,
        svCorruption : -2,
        bonPhysical : -4,
        bonElemental : 0,
        bonHoly : -4,
		bonCorruption : -2,
		
		class : 'lamprey',
		actions : [],
		assets : [],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.plBeast,
			stdTag.plElectric,
			stdTag.plEel,
		]
	},



	// NECROMANCERS
	necro_entrance : {
		name : "Malleus",
		species : "crow",
		description : "A crow covered in bone charms, charged with guarding the entrance of the Yuug necromancers guid.",
		icon : "",
		level : 0,
		team : 1,
		size : 5,
		leveled : true,
		sadistic : 0.7,
		dominant : 0.6,
		hetero : 0.6,
		intelligence : 0.6,
		talkative : 0.3,
		stamina : -2,
		intellect : 2,
		agility : -2,
		svPhysical : -2,
        svElemental : 2,
        svHoly : 0,
        svCorruption : 2,
        bonPhysical : -2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 2,
		class : 'necromancer',
		assets : [
			'genericNecromancerRobe',
			'genericCottonThong',
			{"name":"silver","label":"__LABEL__","_stacks":5},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0, 1],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plHair, stdTag.plBigPenis,
		]
	},
	necro_bar : {
		name : "Keyleigh",
		species : "dalmatian",
		description : "A larger than average dalmatian, standing at average height with a big butt and ample bosom. Runs the Underbar in the Yuug necromancers guild.",
		icon : "",
		team : 1,
		size : 6,
		level : 0,
		leveled : true,
		sadistic : 0.5,
		dominant : 0.6,
		hetero : 0.2,
		intelligence : 0.6,
		talkative : 0.8,
		stamina : -2,
		intellect : 2,
		agility : -2,
		svPhysical : -2,
        svElemental : 2,
        svHoly : 0,
        svCorruption : 2,
        bonPhysical : -2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 2,
		class : 'necromancer',
		assets : [
			'genericNecromancerRobe',
			'genericCottonThong',
			{name:"platinum", label:"__LABEL__", "_stacks":1},
			{name:"gold", label:"__LABEL__", "_stacks":12},
			{"name":"silver","label":"__LABEL__","_stacks":5},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0, 1],	// Which items should be equipped
		tags : [
			stdTag.breasts, stdTag.vagina, stdTag.plTongue, stdTag.plHair, stdTag.plBigBreasts, stdTag.plBigButt,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail, stdTag.penis, stdTag.plBigPenis
		]
	},
	necro_bouncer : {
		name : "Lumbar",
		species : "pitbull",
		description : "A large muscular male pitbull, guarding the entrance to the deep catacombs below the Yuug necromancers guild.",
		icon : "",
		team : 1,
		size : 7,
		level : 0,
		leveled : true,
		sadistic : 0.7,
		dominant : 0.9,
		hetero : 0.2,
		intelligence : 0.4,
		talkative : 0.1,
		stamina : 2,
		intellect : 0,
		agility : 2,
		svPhysical : 2,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 0,
		class : 'necromancer',
		assets : [
			'genericNecromancerRobe',
			'genericCottonThong',
			{"name":"silver","label":"__LABEL__","_stacks":5},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0, 1],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plHair, stdTag.plBigPenis,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail
		]
	},
	necro_trainer : {
		name : "Glutus",
		species : "hyena",
		description : "A toned hyena.",
		icon : "",
		team : 1,
		size : 5,
		level : 0,
		leveled : true,
		sadistic : 0.6,
		dominant : 0.5,
		hetero : 0.5,
		intelligence : 0.6,
		talkative : 0.9,
		stamina : 0,
		intellect : 1,
		agility : 2,
		svPhysical : 2,
        svElemental : -2,
        svHoly : 0,
        svCorruption : 2,
        bonPhysical : 2,
        bonElemental : -2,
        bonHoly : -2,
        bonCorruption : 0,
		class : 'necromancer',
		assets : [
			'genericNecromancerRobe',
			'genericCottonThong',
			{"name":"gold","label":"__LABEL__","_stacks":3},
			{"name":"silver","label":"__LABEL__","_stacks":5},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0, 1],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plHair, stdTag.plBigPenis,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail
		]
	},
	necro_fox : {
		name : "Fibula",
		species : "fox",
		description : "A fox lady with ragged dirty fur.",
		icon : "",
		team : 0,
		size : 4,
		level : 0,
		leveled : true,
		sadistic : 0.2,
		dominant : 0.2,
		hetero : 0.5,
		intelligence : 0.5,
		talkative : 0.9,
		stamina : 2,
		intellect : 1,
		agility : 0,
		svPhysical : -2,
        svElemental : -2,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : -2,
        bonHoly : -2,
        bonCorruption : 4,
		class : 'necromancer',
		assets : [
			'genericNecromancerRobe',
			'foxCottonPanties',
		],
		inventory : [0, 1],	// Which items should be equipped
		tags : [
			stdTag.vagina, stdTag.plTongue, stdTag.plHair, stdTag.breasts, stdTag.plBigBreasts,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail, stdTag.plLongTail
		]
	},
	necro_blobula : {
		name : "Count Blobula",
		species : "ooze",
		description : "A massive bubbling ooze with flailing tendrils.",
		icon : "",
		team : 1,
		size : 9,
		leveled : true,
		power : -1,
		sadistic : 0.3,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.2,
		stamina : 10,
		intellect : 0,
		agility : 0,
		class : 'none',
		svPhysical : 0,
        svElemental : 1,
        svHoly : -1,
        svCorruption : 1,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 0,
		bonCorruption : 0,	
		actions : [
			'count_blobula_massive_burst',	// Todo: Text, test
			'slime_coat',					// Todo: Text, test 
		],
		tags : [
			stdTag.gpBoss, stdTag.plTentacles, stdTag.plBeast, stdTag.plOoze
		],
		assets : [],
		passives : [],
	},
	necro_construct : {
		name : "Bone Construct",
		species : "skeleton",
		description : "A massive bone construct with multiple sets of arms and legs.",
		icon : "",
		team : 1,
		size : 9,
		leveled : true,
		power : -1,
		sadistic : 0.8,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.3,
		stamina : 10,
		intellect : 0,
		agility : 0,
		class : 'none',
		svPhysical : 2,
        svElemental : 0,
        svHoly : -3,
        svCorruption : 0,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : 0,
		bonCorruption : 0,	
		actions : [
			'necro_construct_summon_bystander',
			'necro_construct_spread',
			'boneShards'
		],
		tags : [
			stdTag.gpBoss, stdTag.plTargetBeast, stdTag.plUndead
		],
		assets : ['sharkanium'],
		passives : [],
	},
	necro_construct_bystander : {
		name : "Opportunistic Skeleton",
		species : "skeleton",
		description : "A normal skeleton, it seems to be creeping along the walls.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		power : -1,
		sadistic : 0.2,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.3,
		stamina : -6,
		intellect : -4,
		agility : -3,
		class : 'none',
		svPhysical : -3,
        svElemental : 0,
        svHoly : -6,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 0,
		bonCorruption : 2,	
		actions : [],
		tags : [
			stdTag.plTargetBeast, stdTag.plUndead
		],
		assets : [],
		passives : [
			{
				effects : [{
					type : Effect.Types.disableActions,
					data : {conditions:[
						{type:Condition.Types.actionLabel, data:{label:['stdAttack','stdArouse']}},
						{type:Condition.Types.hasWrapper, data:{label:'construct_spread'}, inverse:true}
					]},
				}]
			}
		],
		remOnDeath : true,
	},
	necro_construct_slave : {
		name : "Illium",
		species : "cow",
		description : "A large-breasted cow lady, she's strapped to some kind of milking device.",
		icon : "",
		team : 1,
		size : 5,
		level : 0,
		leveled : true,
		sadistic : 0.2,
		dominant : 0.2,
		hetero : 0.5,
		intelligence : 0.5,
		talkative : 0.1,
		stamina : 2,
		intellect : 0,
		agility : 0,
		svPhysical : -4,
        svElemental : -2,
        svHoly : -2,
        svCorruption : -2,
        bonPhysical : -5,
        bonElemental : -5,
        bonHoly : -5,
        bonCorruption : -5,
		class : 'none',
		assets : [],
		inventory : [],	// Which items should be equipped
		actions : [
			'necro_construct_slave_milk'
		],
		tags : [
			stdTag.vagina, stdTag.plTongue, stdTag.plHair, stdTag.breasts, stdTag.plBigBreasts,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail, stdTag.plLongTail, stdTag.plHorns,
			stdTag.gpDisableVictoryCondition
		],
		passives : [
			{
				effects : [{
					type : Effect.Types.disableActions,
					data : {conditions:[
						{type:Condition.Types.actionLabel, data:{label:['stdAttack','stdArouse']}, caster:true}
					]},
				}]
			}
		],
	},

	Ixsplat : {
		name : "Ixsplat",
		species : "imp",
		description : "A larger than average imp with a big dick.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		power : -1,
		sadistic : 0.7,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.5,
		stamina : 8,
		intellect : 3,
		class : 'impScavenger',
		svPhysical : 1,
        svElemental : -1,
        svHoly : -3,
        svCorruption : 1,
        bonPhysical : 1,
        bonElemental : -2,
        bonHoly : -4,
		bonCorruption : 1,
		talkative : 0.8,		
		actions : [
			"imp_claws",
			"imp_demonicPinch",
			"imp_groperopeHogtie",
			"imp_newGroperope_party",
			"imp_newGroperope_solo",
		],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plTongue, stdTag.plBigPenis, stdTag.gpBoss
		],
		assets : ['gropeRope', "genericRawhideShirt"],
		inventory : [0,1],
	},
	Impicus : {
		name : "Impicus",
		species : "imp",
		description : "A particularly ugly imp with a penchant for tentacles.",
		icon : "",
		team : 1,
		size : 3,
		leveled : true,
		power : -1,
		sadistic : 0.3,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.4,
		stamina : 5,
		intellect : -4,
		agility : 2,
		svPhysical : -1,
        svElemental : 0,
        svHoly : -5,
        svCorruption : 2,
        bonPhysical : -2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 3,
		class : 'impMage',
		talkative : 0.5,
		actions : [
			"imp_ankleBite",
			"imp_specialDelivery",
			"tentaclemancer_tentacleWhip",
		],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plTongue, stdTag.plBigPenis, stdTag.gpBoss
		],
		assets : ["genericRawhideThong"],
		inventory : [0],
	},



	// Clerics guild
	// Todo: writeme
	yuug_church_cleric_a : {
		name : "",
		species : "",
		description : "",
		icon : "",
		team : 1,
		size : 7,
		level : 0,
		leveled : true,
		sadistic : 0.7,
		dominant : 0.9,
		hetero : 0.2,
		intelligence : 0.4,
		talkative : 0.1,
		stamina : 2,
		intellect : 0,
		agility : 2,
		svPhysical : 2,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 0,
		class : 'cleric',
		assets : [
			'goldweaveThong',
			{"name":"silver","label":"__LABEL__","_stacks":5},
			{"name":"copper","label":"__LABEL__","_stacks":13},
		],
		inventory : [0],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plHair, stdTag.plBigPenis,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail
		]
	},

	// Todo: writeme
	yuug_church_cleric_b : {
		name : "",
		species : "pitbull",
		description : "",
		icon : "",
		team : 1,
		size : 7,
		level : 0,
		leveled : true,
		sadistic : 0.7,
		dominant : 0.9,
		hetero : 0.2,
		intelligence : 0.4,
		talkative : 0.1,
		stamina : 2,
		intellect : 0,
		agility : 2,
		svPhysical : 2,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 0,
		class : 'cleric',
		assets : [
			'goldweaveThong',
		],
		inventory : [0],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plTongue, stdTag.plHair, stdTag.plBigPenis,
			stdTag.plFurry, stdTag.plEars, stdTag.plTail
		]
	},


	yuug_church_interrogation : {
		// Todo: name me
		name : "",
		species : "demon",
		description : "A large muscular demon with a horn on his head and a large dangling member.",
		icon : "",
		team : 1,
		size : 8,
		leveled : true,
		power : -1,
		sadistic : 0.8,
		dominant : 1,
		hetero : 0.5,
		intelligence : 0.6,
		stamina : 15,
		intellect : 2,
		agility : -1,
		class : 'none',
		svPhysical : 2,
        svElemental : 0,
        svHoly : -4,
        svCorruption : 2,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : 0,
		bonCorruption : 0,	
		actions : [
			'guardian_demon_grapple',
			'guardian_demon_impale',
			'guardian_demon_expose',
			'lowBlow'
		],
		tags : [
			stdTag.gpBoss, stdTag.plDemon, stdTag.penis, stdTag.plBigPenis, stdTag.plMuscular, stdTag.plHorn, stdTag.plTongue
		],
		assets : [],
		passives : [],
	},



	// Goblin involved in the boat quest
	Slurt : {
		name : "Slurt",
		species : "goblin",
		description : "A goblin. Todo.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		power : -1,
		sadistic : 0.3,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.5,
		stamina : 0,
		intellect : -4,
		agility : 2,
		svPhysical : -1,
        svElemental : 0,
        svHoly : -5,
        svCorruption : 2,
        bonPhysical : -2,
        bonElemental : 0,
        bonHoly : -2,
        bonCorruption : 2,
		class : 'none',
		actions : [],
		inventory : [],	// Which items should be equipped
		tags : [stdTag.penis, stdTag.plTongue, stdTag.plBigPenis],
		assets : ["genericRawhideThong"],
		inventory : [0],
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