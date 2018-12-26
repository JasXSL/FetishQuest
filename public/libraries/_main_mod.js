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
				"use_action":{
					"id":"ed48b83e-9671-8351-5ef9-fc6ca03350bf",
					"label":"minorRepairKit",
					"name":"Minor Repair",
					"description":"Restores 25% of a damaged item's durability (min 5).",
					"wrappers":[
						{
						"id":"f6798066-eafb-2738-ec0e-a3861a375dbf",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"05555fec-7b68-f9f7-ae15-65b9d1f044a2",
								"type":"repair",
								"data":{
									"amount":0.25,
									"multiplier":true,
									"min":5
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":0,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
						{
						"type":"hasRepairable",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"no_action_selector":true,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
						{
						"type":"notInCombat",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":true
				},
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
				"use_action":{
					"id":"0fae49c4-c1ff-54d0-5903-0f0adb6197c8",
					"label":"repairKit",
					"name":"Armor Repair",
					"description":"Restores 50% of a damaged item's durability (min 10).",
					"wrappers":[
						{
						"id":"41fd5589-f0e1-818a-9e46-af54518bd5a3",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"06601071-147f-cf31-b317-c8809a16e362",
								"type":"repair",
								"data":{
									"amount":0.5,
									"multiplier":true,
									"min":10
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":0,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
						{
						"type":"hasRepairable",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"no_action_selector":true,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
						{
						"type":"notInCombat",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":true
				},
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
				"use_action":{
					"id":"5713256c-88d9-40c1-1ff7-8d264c951743",
					"label":"majorRepairKit",
					"name":"Major Repair",
					"description":"Fully restores a damaged item's durability.",
					"wrappers":[
						{
						"id":"3ac3e678-05d4-4db7-505c-c89c7676b3aa",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"d33192ae-92d4-de35-0783-26538d35f785",
								"type":"repair",
								"data":{
									"amount":1,
									"multiplier":true
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":0,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"target",
					"tags":[
		
					],
					"ranged":false,
					"conditions":[
						{
						"type":"hasRepairable",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"no_action_selector":true,
					"cast_time":0,
					"charges":1,
					"allow_when_charging":false,
					"_cast_time":0,
					"_charges":1,
					"_cast_targets":[
		
					],
					"no_interrupt":false,
					"show_conditions":[
						{
						"type":"notInCombat",
						"data":{
		
						},
						"inverse":false,
						"targnr":-1,
						"caster":false,
						"anyPlayer":false,
						"conditions":[
		
						],
						"min":0,
						"max":0,
						"label":""
						}
					],
					"hide_if_no_targets":false,
					"semi_hidden":false,
					"level":1,
					"riposte":[
		
					],
					"no_use_text":true
				},
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
				"use_action":{
					"id":"43046135-723c-76ed-f7a6-ea36bc544711",
					"label":"minorHealingPotion",
					"name":"Minor Healing Potion",
					"description":"Restores 8 HP to the user.",
					"wrappers":[
						{
						"id":"bb88f73f-da70-b16c-d04d-2c0b2719a62a",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"ca6c2efb-4196-ee2c-26d2-52ecbb7b25b3",
								"type":"damage",
								"data":{
									"amount":-8,
									"type":"Physical"
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
							},
							{
								"id":"a33cad96-acd5-d1c9-434a-646a6c1ba033",
								"type":"visual",
								"data":{
									"class":"fxHeal"
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"self",
					"tags":[
						"ac_heal",
						"ac_item"
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
				"use_action":{
					"id":"09d20767-6f2f-b955-db77-5ac563c74089",
					"label":"healingPotion",
					"name":"Healing Potion",
					"description":"Restores 15 HP to the user.",
					"wrappers":[
						{
						"id":"5b45814b-98b4-de44-e43d-d9c478cf5e82",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"5afd532e-3b39-3db5-cfd7-6b53a965c612",
								"type":"damage",
								"data":{
									"amount":-15,
									"type":"Physical"
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
							},
							{
								"id":"a33cad96-acd5-d1c9-434a-646a6c1ba033",
								"type":"visual",
								"data":{
									"class":"fxHeal"
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"self",
					"tags":[
						"ac_heal",
						"ac_item"
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
				"use_action":{
					"id":"7b613bd0-54f3-ec43-9836-225d3c5234f3",
					"label":"majorHealingPotion",
					"name":"Major Healing Potion",
					"description":"Restores 30 HP to the user.",
					"wrappers":[
						{
						"id":"3c4ffd15-c89d-ba13-7706-0d3d221cb429",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"4a289960-0f25-452b-9b09-034f016b1af5",
								"type":"damage",
								"data":{
									"amount":-30,
									"type":"Physical"
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
							},
							{
								"id":"a33cad96-acd5-d1c9-434a-646a6c1ba033",
								"type":"visual",
								"data":{
									"class":"fxHeal"
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"self",
					"tags":[
						"ac_heal",
						"ac_item"
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
				"use_action":{
					"id":"d7c014a3-b4d5-f38b-5b6a-74a0ad924c07",
					"label":"manaPotion",
					"name":"Mana Potion",
					"description":"Restores 5 mana to the user.",
					"wrappers":[
						{
						"id":"10400727-1aae-03d9-2446-5027e36512c6",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"ff0ee4d7-723c-0dc7-f4f8-f914e58d51be",
								"type":"addMP",
								"data":{
									"amount":5
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
							},
							{
								"id":"a33cad96-acd5-d1c9-434a-646a6c1ba033",
								"type":"visual",
								"data":{
									"class":"fxHeal"
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"self",
					"tags":[
						"ac_mana_heal",
						"ac_item"
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
				"use_action":{
					"id":"1e638860-c157-d9f7-f754-6182d82770df",
					"label":"majorManaPotion",
					"name":"Major Mana Potion",
					"description":"Restores 10 mana to the user.",
					"wrappers":[
						{
						"id":"351872c4-3e09-986a-fa67-044cebd8f50b",
						"name":"",
						"description":"",
						"icon":"",
						"detrimental":true,
						"victim":"",
						"caster":"",
						"target":"VICTIM",
						"add_conditions":[
		
						],
						"stay_conditions":[
		
						],
						"effects":[
							{
								"id":"124e7bf8-429b-5263-d4e6-0f838503ce52",
								"type":"addMP",
								"data":{
									"amount":10
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
							},
							{
								"id":"a33cad96-acd5-d1c9-434a-646a6c1ba033",
								"type":"visual",
								"data":{
									"class":"fxHeal"
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
						"tags":[
		
						],
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
					"cooldown":0,
					"ap":1,
					"_cooldown":0,
					"min_targets":1,
					"max_targets":1,
					"hit_chance":90,
					"detrimental":false,
					"type":"Physical",
					"mp":0,
					"hidden":false,
					"target_type":"self",
					"tags":[
						"ac_mana_heal",
						"ac_item"
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
				"id":"0ef2cc7c-a0e5-922d-90e1-85fbb5333c77",
				"type":"visual",
				"data":{
					"class":"fxTakeDamage"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargTakeDamage"
			},
			{
				"id":"07e33cf6-4405-cecc-a1d3-e14e2a6c56bc",
				"type":"visual",
				"data":{
					"class":"fxHeal"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargHeal"
			},
			{
				"id":"fc9335d0-6b6d-e489-9c1a-be421beadf31",
				"type":"visual",
				"data":{
					"class":"fxShield"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargShield"
			},
			{
				"id":"00ede38d-d66e-ee34-956a-e41f6cf1270e",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageElemental"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargTakeDamageElemental"
			},
			{
				"id":"e87c11ae-ed55-08fb-9cdd-f1ef8c3e28db",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageHoly"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargTakeDamageHoly"
			},
			{
				"id":"af35cebd-47b0-98d8-fd98-eae64be4fdb6",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageCorruption"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperTick"
				],
				"label":"visTargTakeDamageCorruption"
			},
			{
				"id":"95a9c198-46c5-a722-bed1-80e1df0963ab",
				"type":"visual",
				"data":{
					"class":"fxTakeDamage"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargTakeDamage"
			},
			{
				"id":"67f3745f-a55b-dcae-37a8-5a6f87776f6d",
				"type":"visual",
				"data":{
					"class":"fxHeal"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargHeal"
			},
			{
				"id":"ea570fc5-f9fa-1750-4286-f27cc8929dfd",
				"type":"visual",
				"data":{
					"class":"fxShield"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargShield"
			},
			{
				"id":"f057f330-f678-d666-1fa8-ad167d8fdfaf",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageElemental"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargTakeDamageElemental"
			},
			{
				"id":"2ac9b301-a76b-2352-f35d-e6f4d5c1fa74",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageHoly"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargTakeDamageHoly"
			},
			{
				"id":"c5f4ae38-2674-2640-7b9a-4ed74ab6716d",
				"type":"visual",
				"data":{
					"class":"fxTakeDamageCorruption"
				},"targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"visAddTargTakeDamageCorruption"
			},
			{
				"id":"705ba188-9402-0da9-1bd0-fe84620d3f7b",
				"type":"interrupt","targets":[
					"VICTIM"
				],
				"events":[
					"internalWrapperAdded"
				],
				"label":"interrupt"
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
				"icon":"goo-skull",
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
		dungeonEncounters : getEncounters()
	}
);

export default mod;