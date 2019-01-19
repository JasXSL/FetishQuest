import stdTag from "./stdTag.js";
import Mod from '../classes/Mod.js';

import texts from './mainMod/texts.js';
import {getArray as getConds} from './mainMod/conditions.js';
import {getArray as getActions} from './mainMod/actions.js';
import {getArray as getPlayerClasses} from './mainMod/playerClasses.js';
import {getArray as getAudioKits} from './mainMod/audioKits.js';
import {getArray as getDungeonTemplates} from './mainMod/dungeonTemplates.js';
import {getArray as getEncounters} from './mainMod/encounters.js';
import {getArray as getPlayerTemplates} from './mainMod/playerTemplates.js';
import {getArray as getHitFX} from './mainMod/hitfx.js';
import dungeons from './mainMod/dungeons.js';

// This is a special mod 
const mod = new Mod(
	{
		id:"MAIN_MOD",
		name:"MAIN_EDIT",
		author:"JasX",
		description:"This is a copy of main. Export into _main_mod.js",
		dungeons:dungeons,
		quests:[],
		vars:{},
		texts:texts,
		actions:getActions(),
		assets:[
			{
				"name":"Skirt and Thong Outfit",
				"slots":[
					"lowerbody"
				],
				"equipped":false,
				"tags":[
					"as_skirt",
					"as_thong",
					"as_shiny",
					"as_stockings"
				],
				"wrappers":[
					{
						"id":"c2a6a041-3776-f047-74a4-f911b625582f",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":false,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
						{
							"id":"6efc4201-5367-da01-7ee1-ea8d6affc1a0",
							"type":"staminaModifier",
							"data":{
								"amount":3
							},
							"conditions":[
		
							],
							"targets":[
								"VICTIM"
							],
							"events":[
								"internalWrapperTick"
							],
							"label":""
						}
						],
						"_duration":0,
						
						"stacks":1,
						"tick_on_turn_end":false,
						"tick_on_turn_start":true,
						"label":"",
						"_self_cast":false,
						"max_stacks":1,
						"netPlayer":"",
						"trigger_immediate":false,
						"duration":0
					}
				],
				"label":"shinyWhiteThong",
				"description":"A short skirt, some wooly stockings and a shiny white thong. +3 Stamina",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":50,
				"charges":0,
				"use_action":{
					"id":"0b1f1229-d37d-a443-5801-4312f64fb51f",
					"label":"",
					"name":"",
					"description":"",
					"wrappers":[
		
					],
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":true,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
		
					],
					"no_action_selector":false,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
		
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":false
				},
				"rarity":0,
				"loot_sound":"",
				"no_auto_consume":false
			},
			{
				"name":"Heavy Test Item",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"reallyHeavyTestItem",
				"description":"This thing weighs 100kg",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":100000,
				"charges":0,
				"use_action":{
					"id":"c0ee8463-709a-0f03-eadc-ee91e61c72ca",
					"label":"",
					"name":"",
					"description":"",
					"wrappers":[
		
					],
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":true,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
		
					],
					"no_action_selector":false,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
		
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":false
				},
				"rarity":0,
				"loot_sound":"",
				"no_auto_consume":false
			},
			{
				"name":"Simple Whip",
				"slots":[
					"hands"
				],
				"equipped":false,
				"tags":[
					"as_whip"
				],
				"wrappers":[
					{
						"id":"2e0b2a94-33b2-4458-5476-0f0305a551ed",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":false,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
						{
							"id":"9a06cf82-cc5d-a19c-70aa-898519e2f320",
							"type":"bonPhysical",
							"data":{
								"amount":1
							},
							"conditions":[
		
							],
							"targets":[
								"VICTIM"
							],
							"events":[
								"internalWrapperTick"
							],
							"label":""
						}
						],
						"_duration":0,
						
						"stacks":1,
						"tick_on_turn_end":false,
						"tick_on_turn_start":true,
						"label":"",
						"_self_cast":false,
						"max_stacks":1,
						"netPlayer":"",
						"trigger_immediate":false,
						"duration":0
					}
				],
				"label":"simpleWhip",
				"description":"A simple leather whip.\n+1 Physical Proficiency",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":750,
				"charges":0,
				"use_action":{
					"id":"0787f067-1ce5-596e-8e69-1cd2e7df391a",
					"label":"",
					"name":"",
					"description":"",
					"wrappers":[
		
					],
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":true,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
		
					],
					"no_action_selector":false,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
		
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":false
				},
				"rarity":0,
				"loot_sound":"",
				"no_auto_consume":false
			},
			{
				"name":"Minor Repair Kit",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"minorRepairKit",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":1000,
				"charges":1,
				"use_action":"minorRepairKit",
				"rarity":0,
				"loot_sound":"lootRepairKit",
				"no_auto_consume":true
			},
			{
				"name":"Repair Kit",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"repairKit",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":1000,
				"charges":1,
				"use_action":"repairKit",
				"rarity":1,
				"loot_sound":"lootRepairKit",
				"no_auto_consume":true
			},
			{
				"name":"Major Repair Kit",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"majorRepairKit",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":1000,
				"charges":1,
				"use_action":"majorRepairKit",
				"rarity":2,
				"loot_sound":"lootRepairKit",
				"no_auto_consume":true
			},
			{
				"name":"Minor Healing Potion",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"minorHealingPotion",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":500,
				"charges":1,
				"use_action":"minorHealingPotion",
				"rarity":0,
				"loot_sound":"lootPotion",
				"no_auto_consume":false
			},
			{
				"name":"Healing Potion",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"healingPotion",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":500,
				"charges":1,
				"use_action":"healingPotion",
				"rarity":1,
				"loot_sound":"lootPotion",
				"no_auto_consume":false
			},
			{
				"name":"Major Healing Potion",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"majorHealingPotion",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":500,
				"charges":1,
				"use_action":"majorHealingPotion",
				"rarity":2,
				"loot_sound":"lootPotion",
				"no_auto_consume":false
			},
			{
				"name":"Mana Potion",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"manaPotion",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":500,
				"charges":1,
				"use_action":"manaPotion",
				"rarity":1,
				"loot_sound":"lootPotion",
				"no_auto_consume":false
			},
			{
				"name":"Major Mana Potion",
				"slots":[
		
				],
				"equipped":false,
				"tags":[
		
				],
				"wrappers":[
		
				],
				"label":"majorManaPotion",
				"description":"",
				"level":1,
				"durability_bonus":0,
				"durability":10,
				"weight":500,
				"charges":1,
				"use_action":"majorManaPotion",
				"rarity":2,
				"loot_sound":"lootPotion",
				"no_auto_consume":false
			}
		],
		audioKits:getAudioKits(),
		playerClasses:getPlayerClasses(),
		conditions:getConds(),
		playerTemplates:getPlayerTemplates(),
		assetTemplates:[
			{
				"label":"sling_armor",
				"slots":[
					"upperbody",
					"lowerbody"
				],
				"name":"Sling Armor",
				"materials":[
					"silk",
					"mageweave",
					"shadowcloth",
					"leather",
					"mailCopper",
					"mailSteel",
					"mailMithril",
					"plateSoftsilver"
				],
				"svStats":{
		
				},
				"bonStats":{
					"Physical":1
				},
				"description":"An enchanted sling bikini. Easy to move around in.",
				"tags":[
					"as_thong",
					"as_sling_bikini",
					"as_bodysuit"
				],
				"size":0.5
			},
			{
				"label":"thong",
				"slots":[
					"lowerbody"
				],
				"name":"Thong",
				"materials":[
					"cotton",
					"silk",
					"mageweave",
					"shadowcloth",
					"leather",
					"plateSoftsilver",
					"rawhide"
				],
				"svStats":{
		
				},
				"bonStats":{
		
				},
				"description":"The type of garment that goes between your buttcheeks.",
				"tags":[
					"as_thong",
					"as_waistband"
				],
				"size":0.1
			},
			{
				"label":"shirt",
				"slots":[
					"upperbody"
				],
				"name":"Shirt",
				"materials":[
					"cotton",
					"silk",
					"mageweave",
					"shadowcloth",
					"leather",
					"rawhide"
				],
				"svStats":{
		
				},
				"bonStats":{
		
				},
				"description":"A shirt.",
				"tags":[
					"as_shirt"
				],
				"size":1
			},
			{
				"label":"breastplate",
				"slots":[
					"upperbody"
				],
				"name":"Breastplate",
				"materials":[
					"plateCopper",
					"plateSoftsilver",
					"plateSteel"
				],
				"svStats":{
					"Physical":1
				},
				"bonStats":{
		
				},
				"description":"A rather modest breastplate, covering only the top of your chest.",
				"tags":[
		
				],
				"size":0.6
			},
			{
				"label":"crotchplate",
				"slots":[
					"lowerbody"
				],
				"name":"Crotchplate",
				"materials":[
					"plateCopper",
					"plateSoftsilver",
					"plateSteel"
				],
				"svStats":{
					"Physical":1
				},
				"bonStats":{
		
				},
				"description":"A rather modest crotchplate, covering only your groin and half your butt.",
				"tags":[
					"as_waistband"
				],
				"size":0.3
			},
			{
				"label":"half_robe",
				"slots":[
					"upperbody"
				],
				"name":"Half-robe",
				"materials":[
					"cotton",
					"silk",
					"mageweave",
					"shadowcloth"
				],
				"svStats":{
		
				},
				"bonStats":{
					"Elemental":1
				},
				"description":"A robe ending above your hips, with a cloth flap hanging down in front of your groin and rear.",
				"tags":[
					"as_robe",
					"as_crotch_flap",
					"as_butt_flap"
				],
				"size":1.1
			},
			{
				"label":"loincloth",
				"slots":[
					"lowerbody"
				],
				"name":"Loincloth",
				"materials":[
					"rawhide",
					"cotton",
					"silk",
					"shadowcloth"
				],
				"svStats":{
		
				},
				"bonStats":{
					"Elemental":1
				},
				"description":"A loincloth covering your groin, with a thong underneath it.",
				"tags":[
					"as_robe",
					"as_crotch_flap",
					"as_butt_flap",
					"as_thong",
					"as_waistband"
				],
				"size":0.4
			}
		],
		materialTemplates:[
			{
				"label":"cotton",
				"name":"Cotton",
				"tags":[
					"as_cloth",
					"as_stretchy",
					"as_cotton"
				],
				"weight":400,
				"level":1,
				"durability_bonus":1,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"silk",
				"name":"Silk",
				"tags":[
					"as_cloth",
					"as_stretchy",
					"as_silk"
				],
				"weight":300,
				"level":3,
				"durability_bonus":1,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":1
			},
			{
				"label":"mageweave",
				"name":"Mageweave",
				"tags":[
					"as_cloth",
					"as_mageweave"
				],
				"weight":500,
				"level":8,
				"durability_bonus":1,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":2
			},
			{
				"label":"shadowcloth",
				"name":"Shadowcloth",
				"tags":[
					"as_cloth",
					"as_shadowcloth"
				],
				"weight":300,
				"level":14,
				"durability_bonus":1,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":3
			},
			{
				"label":"leather",
				"name":"Leather",
				"tags":[
					"as_leather"
				],
				"weight":2000,
				"level":1,
				"durability_bonus":1.25,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"rawhide",
				"name":"Rawhide",
				"tags":[
					"as_leather",
					"as_rawhide"
				],
				"weight":3000,
				"level":3,
				"durability_bonus":1.5,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":1
			},
			{
				"label":"stretchhide",
				"name":"Stretch-hide",
				"tags":[
					"as_leather",
					"as_stretchy"
				],
				"weight":2000,
				"level":6,
				"durability_bonus":2,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":2
			},
			{
				"label":"mailCopper",
				"name":"Copper-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_copper"
				],
				"weight":7000,
				"level":3,
				"durability_bonus":2,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"mailSteel",
				"name":"Steel-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_steel"
				],
				"weight":5000,
				"level":6,
				"durability_bonus":2.5,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"mailMithril",
				"name":"Mithril-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_mithril"
				],
				"weight":1000,
				"level":12,
				"durability_bonus":3,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"plateCopper",
				"name":"Copper",
				"tags":[
					"as_plate",
					"as_metal",
					"as_hard",
					"as_copper"
				],
				"weight":9000,
				"level":5,
				"durability_bonus":2.5,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"plateSteel",
				"name":"Steel",
				"tags":[
					"as_plate",
					"as_metal",
					"as_hard",
					"as_steel"
				],
				"weight":8000,
				"level":10,
				"durability_bonus":3,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":0
			},
			{
				"label":"plateSoftsilver",
				"name":"Softsilver",
				"tags":[
					"as_metal",
					"as_stretchy",
					"as_softsilver"
				],
				"weight":1500,
				"level":15,
				"durability_bonus":4,
				"svBons":{
		
				},
				"bonBons":{
		
				},
				"stat_bonus":1
			}
		],
		dungeonTemplates:getDungeonTemplates(),
		effects:[
			{
				type:"interrupt",
				targets:["VICTIM"],
				events:["internalWrapperAdded"],
				label:"interrupt"
			}
		],
		dungeonRoomTemplates:[
			{
				"label":"darkChamber",
				"tags":[
					"du_dark",
					"du_room"
				],
				"basemeshes":[
					"Dungeon.Room.R10x10",
					"Dungeon.Room.R6x6"
				],
				"containers":[
					"Generic.Containers.ChestInteractive"
				],
				"props":[
					"Generic.Containers.Barrel",
					"Generic.Containers.Crate",
					"Generic.Containers.CrateOpen",
					"Farm.Furniture.TableCorner",
					"Farm.Furniture.TableOneChair",
					"Farm.Furniture.TableTwoBenches",
					"Farm.Furniture.ShelfContainers",
					"Farm.Furniture.ShelfProps",
					"Dungeon.Doodads.BannerAnimated",
					"Farm.Furniture.Bench",
					"Dungeon.Furniture.RugTorn",
					"Generic.Emitters.WallSconce"
				]
			},
			{
				"label":"darkCorridor",
				"tags":[
					"du_dark",
					"du_room"
				],
				"basemeshes":[
					"Dungeon.Room.R10x10RL",
					"Dungeon.Room.R6x10"
				],
				"containers":[
					"Generic.Containers.ChestInteractive"
				],
				"props":[
					"Generic.Emitters.TorchHolder",
					"Dungeon.Furniture.RugTorn",
					"Dungeon.Doodads.BannerAnimated",
					"Farm.Furniture.ShelfContainers",
					"Farm.Furniture.ShelfProps"
				]
			}
		],
		wrappers:[
			{
				"target":"VICTIM",
				"max_stacks":3,
				"duration":2,
				"name":"Soak",
				"icon":"burst-blob",
				"description":"Soaked, elemental resistance lowered by 2 per stack.",
				"detrimental":true,
				"label":"soak",
				"add_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"stay_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"tags":[
					"wr_soaked"
				],
				"effects":[
					{
						"type":"svElemental",
						"data":{
						"amount":-2
						}
					}
				]
			},
			{
				"duration":1,
				"name":"Stun",
				"description":"Stunned",
				"icon":"stun",
				"detrimental":true,
				"add_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"stay_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"tags":[
		
				],
				"effects":[
					{
						"type":"stun"
					}
				],
				"label":"stun1turn"
			},
			{
				"target":"VICTIM",
				"max_stacks":6,
				"duration":3,
				"name":"Corrupting Ooze",
				"icon":"gooey-molecule",
				"description":"Corruption resistance lowered.",
				"detrimental":true,
				"label":"corruptingOoze",
				"add_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"stay_conditions":[
					"senderNotDead",
					"targetNotDead"
				],
				"tick_on_turn_start":false,
				"tick_on_turn_end":true,
				"tags":[
					"wr_corrupting_ooze"
				],
				"effects":[
					{
						"type":"svCorruption",
						"data":{
						"amount":-1
						}
					},
					{
						"type":"addStacks",
						"data":{
						"amount":1
						}
					},
					{
						"type":"runWrappers",
						"label":"corrupting_ooze_proc",
						"conditions":[
						{
							"events":[
								"internalWrapperStackChange",
								"internalWrapperTick"
							],
							"type":"wrapperStacks",
							"data":{
								"operation":">",
								"amount":5
							}
						}
						],
						"data":{
						"wrappers":[
							{
								"duration":1,
								"name":"Stun",
								"description":"Stunned",
								"icon":"stun",
								"detrimental":true,
								"add_conditions":[
									"senderNotDead",
									"targetNotDead"
								],
								"stay_conditions":[
									"senderNotDead",
									"targetNotDead"
								],
								"tags":[
		
								],
								"effects":[
									{
									"type":"stun"
									}
								],
								"label":"stun1turn"
							}
						]
						}
					},
					{
						"events":[
						"internalWrapperStackChange",
						"internalWrapperTick"
						],
						"type":"removeParentWrapper",
						"conditions":[
						{
							"type":"wrapperStacks",
							"data":{
								"operation":">",
								"amount":5
							}
						}
						]
					}
				]
			}
		],
		dungeonEncounters : getEncounters(),
		hitFX : getHitFX(),
	}
);

export default mod;