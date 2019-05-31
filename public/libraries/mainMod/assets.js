import Asset from "../../classes/Asset.js";
import stdTag from "../stdTag.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import Action from "../../classes/Action.js";

const lib = {

	gold : {
		name : "Gold",
		slots : [],
		category : Asset.Categories.currency,
		tags : ["as_currency"],
		description : "A standard unit of currency.",
		weight : 6,
		charges : 0,
		rarity : 1,
		loot_sound : "",	// todo: loot sound
		icon : 'metal-disc',
		stacking : true,
	},
	// {"name":"gold","label":"__LABEL__","_stacks":2}

	shinyWhiteThong : {
		name : "Skirt and Thong Outfit",
		slots : [
			"lowerbody"
		],
		equipped : false,
		tags : [
			"as_skirt",
			"as_thong",
			"as_shiny",
			"as_stockings"
		],
		wrappers : [
			{
				"id":"c2a6a041-3776-f047-74a4-f911b625582f",
				name : "",
				description : "",
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
					label : ""
				}
				],
				"_duration":-1,
				
				"stacks":1,
				"tick_on_turn_end":false,
				"tick_on_turn_start":true,
				label : "",
				"_self_cast":false,
				"max_stacks":1,
				"netPlayer":"",
				"trigger_immediate":false,
				"duration":-1
			}
		],
		description : "A short skirt, some wooly stockings and a shiny white thong. +3 Stamina",
		level : 1,
		durability_bonus : 0,
		durability : 10,
		weight : 50,
		charges : 0,
		use_action : {
			"id":"0b1f1229-d37d-a443-5801-4312f64fb51f",
			label : "",
			name : "",
			description : "",
			wrappers : [

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
			tags : [

			],
			"conditions":[

			],
			"no_action_selector":false,
			"cast_time":0,
			charges : 1,
			allow_when_charging : false,
			_cast_time : 0,
			_charges : 1,
			_cast_targets : [

			],
			no_interrupt : false,
			show_conditions : [

			],
			hide_if_no_targets : false,
			semi_hidden : false,
			level : 1,
			riposte : [

			],
			"no_use_text":false
		},
		rarity : 0,
		loot_sound : "",
		no_auto_consume : false
	},
	reallyHeavyTestItem : {
		name : "Heavy Test Item",
		slots : [

		],
		equipped : false,
		tags : [

		],
		wrappers : [

		],
		description : "This thing weighs 100kg",
		level : 1,
		durability_bonus : 0,
		durability : 10,
		weight : 100000,
		charges : 0,
		use_action : {
			"id":"c0ee8463-709a-0f03-eadc-ee91e61c72ca",
			label : "",
			name : "",
			description : "",
			wrappers : [

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
			tags : [

			],
			"conditions":[

			],
			"no_action_selector":false,
			"cast_time":0,
			charges : 1,
			allow_when_charging : false,
			_cast_time : 0,
			_charges : 1,
			_cast_targets : [

			],
			no_interrupt : false,
			show_conditions : [

			],
			hide_if_no_targets : false,
			semi_hidden : false,
			level : 1,
			riposte : [

			],
			"no_use_text":false
		},
		rarity : 0,
		loot_sound : "",
		no_auto_consume : false
	},


	// Weapons
	simpleWhip : {
		category : Asset.Categories.handheld,
		name : "Simple Whip",
		slots : [Asset.Slots.hands],
		tags : [ stdTag.asWhip ],
		wrappers : [
			{
				detrimental : false,
				effects : [
					{
						type:"bonPhysical",
						data:{
							amount:1
						},
					}
				],
				trigger_immediate : false,
				duration : 0
			}
		],
		description : "A simple leather whip.\n+1 Physical Proficiency",
		weight : 750,
		loot_sound : "",
		icon : 'whip',
	},
	gropeRope : {
		category : Asset.Categories.handheld,
		name : "Groperope",
		slots : [Asset.Slots.hands],
		tags : [ stdTag.asWhip ],
		wrappers : [],
		description : "Adds the Groperope ability. Allowing you to deal 3 physical damage on an enemy every 3 turns.",
		weight : 750,
		loot_sound : "",
		icon : 'lasso',
		rarity : 2,
		charges : -1,
		use_action : "gropeRope",
	},
	



	minorRepairKit : {
		category : Asset.Categories.tool,
		name : "Minor Repair Kit",
		weight : 1000,
		charges : 1,
		use_action : "minorRepairKit",
		rarity : 0,
		loot_sound : "lootRepairKit",
		no_auto_consume : true,
		icon : 'sewing-needle',
	},
	repairKit : {
		category : Asset.Categories.tool,
		name : "Repair Kit",
		weight : 1000,
		charges : 1,
		use_action : "repairKit",
		rarity : 1,
		loot_sound : "lootRepairKit",
		icon : 'sewing-needle',
		no_auto_consume : true
	},
	majorRepairKit : {
		category : Asset.Categories.tool,
		name : "Major Repair Kit",
		weight : 1000,
		charges : 1,
		use_action : "majorRepairKit",
		rarity : 2,
		loot_sound : "lootRepairKit",
		icon : 'sewing-needle',
		no_auto_consume : true
	},
	minorHealingPotion : {
		category : Asset.Categories.consumable,
		name : "Minor Healing Potion",
		weight : 500,
		charges : 1,
		use_action : "minorHealingPotion",
		rarity : 0,
		icon : 'potion-ball',
		loot_sound : "lootPotion",
		slots : [Asset.Slots.action],
		ranged : Action.Range.None,
	},
	healingPotion : {
		ranged : Action.Range.None,
		category : Asset.Categories.consumable,
		name : "Healing Potion",
		weight : 500,
		charges : 1,
		use_action : "healingPotion",
		rarity : 1,
		icon : 'potion-ball',
		slots : [Asset.Slots.action],
		loot_sound : "lootPotion",
	},
	majorHealingPotion : {
		category : Asset.Categories.consumable,
		name : "Major Healing Potion",
		weight : 500,
		charges : 1,
		use_action : "majorHealingPotion",
		rarity : 2,
		icon : 'potion-ball',
		slots : [Asset.Slots.action],
		loot_sound : "lootPotion",
		ranged : Action.Range.None,
	},
	manaPotion : {
		category : Asset.Categories.consumable,
		name :"Mana Potion",
		weight : 500,
		charges : 1,
		use_action : "manaPotion",
		rarity : 1,
		icon : 'spiral-bottle',
		slots : [Asset.Slots.action],
		loot_sound : "lootPotion",
		ranged : Action.Range.None,
	},
	majorManaPotion : {
		category : Asset.Categories.consumable,
		name : "Major Mana Potion",
		weight : 500,
		charges : 1,
		use_action : "majorManaPotion",
		rarity : 2,
		icon : "spiral-bottle",
		slots : [Asset.Slots.action],
		loot_sound : "lootPotion",
		ranged : Action.Range.None,
	},

	food_RazzyBerry : {
		category : Asset.Categories.food,
		name : 'Razzyberry',
		description : 'Restores 2 mana. Only usable out of combat.',
		weight : 10,
		charges : 1,
		use_action : "foodRazzyberry",		// name not needed for use_action ones. it uses UA instead
		rarity : 0,
		loot_sound : "berryGrab",
		icon : 'grapes',
		ranged : Action.Range.None,
	},

	whiteSwimtrunks : {
		name : "White Swimtrunks",
		category : Asset.Categories.armor,
		icon : 'underwear',
		slots : [Asset.Slots.lowerbody],
		equipped : false,
		tags : [
			stdTag.asTight,
			stdTag.asStretchy,
		],
		wrappers : [
			{
				effects : [{
					type : Effect.Types.agilityModifier,
					data : {amount:1},
				}],
				duration : -1
			}
		],
		description : "Tight swimtrunks made of a white stretchy material that becomes see-through when wet.\n+1 Agility.",
		level : -1,
		durability : 10,
		weight : 50,
		rarity : 1,
		loot_sound : "lootCloth"
	},

	mq00_boss_robe : {
		name : "Crimson Robe",
		category : Asset.Categories.armor,
		icon : 'robe',
		slots : [Asset.Slots.upperbody],
		equipped : false,
		tags : [
			stdTag.asStretchy,
			stdTag.asRobe,
			stdTag.asSkirt,
		],
		wrappers : [
			{
				effects : [
					{
						type : Effect.Types.intellectModifier,
						data : {amount:1},
					},
					{
						type : Effect.Types.bonCorruption,
						data : {amount:2},
					},
				],
				duration : -1
			}
		],
		description : "A crimson flowing robe reaching down to your knees. It has a tentacle embroidered on the chest.\n+1 Int, +2 Bon Corruption",
		level : -1,
		durability : 10,
		weight : 50,
		rarity : 1,
		loot_sound : "lootCloth",
	},

	genericRawhideShirt : {
		name : "Rawhide Shirt",
		category : Asset.Categories.armor,
		icon : 'shirt',
		slots : [Asset.Slots.upperbody],
		equipped : false,
		tags : [stdTag.asShirt,stdTag.asLeather,stdTag.asRawhide],
		wrappers : [
			{
				effects : [
					{
						type : Effect.Types.svPhysical,
						data : {amount:1},
					},
				],
				duration : -1
			}
		],
		description : "A tattered rawhide leather shirt.\n+1 Physical Resitsance",
		level : -1,
		durability_bonus : 2,
		durability : 10,
		weight : 3000,
		rarity : 0,
		loot_sound : "lootLeather",
	},
	genericRawhideThong : {
		name : "Rawhide Thong",
		category : Asset.Categories.armor,
		icon : 'underwear',
		slots : [Asset.Slots.lowerbody],
		equipped : false,
		tags : [stdTag.asThong,stdTag.asWaistband,stdTag.asLeather,stdTag.asRawhide],
		wrappers : [
			{
				effects : [
					{
						type : Effect.Types.svPhysical,
						data : {amount:1},
					},
				],
				duration : -1
			}
		],
		description : "A tattered rawhide leather thong.\n+1 Physical Resitsance",
		level : -1,
		durability_bonus : 2,
		durability : 10,
		weight : 300,
		rarity : 0,
		loot_sound : "lootLeather",
	},

	groperVine : {
		name : "Groper Vine",
		slots : [],
		category : Asset.Categories.reagent,
		tags : [stdTag.asReagent],
		description : "A sturdy vine taken from a groper.",
		weight : 500,
		rarity : 0,
		loot_sound : "",	// todo: loot sound
		icon : 'vine-whip',
		stacking : true,
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
