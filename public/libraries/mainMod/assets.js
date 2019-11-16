import Asset from "../../classes/Asset.js";
import stdTag from "../stdTag.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import Action from "../../classes/Action.js";

const lib = {

	platinum : {
		name : "Platinum",
		slots : [],
		category : Asset.Categories.currency,
		tags : [stdTag.asCurrency],
		description : "The most valuable standard unit of currency. Worth 10 gold.",
		weight : 20,
		charges : 0,
		rarity : 4,
		loot_sound : "coins_pickup",
		icon : 'metal-disc',
		stacking : true,
	},
	gold : {
		name : "Gold",
		slots : [],
		category : Asset.Categories.currency,
		tags : [stdTag.asCurrency],
		description : "A standard unit of currency. Worth 10 silver.",
		weight : 15,
		charges : 0,
		rarity : 3,
		loot_sound : "coins_pickup",
		icon : 'metal-disc',
		stacking : true,
	},
	silver : {
		name : "Silver",
		slots : [],
		category : Asset.Categories.currency,
		tags : [stdTag.asCurrency],
		description : "A standard unit of currency. Worth 10 copper.",
		weight : 10,
		charges : 0,
		rarity : 2,
		loot_sound : "coins_pickup",
		icon : 'metal-disc',
		stacking : true,
	},
	copper : {
		name : "Copper",
		slots : [],
		category : Asset.Categories.currency,
		tags : [stdTag.asCurrency],
		description : "A standard unit of currency. The smallest value.",
		weight : 9,
		charges : 0,
		rarity : 1,
		loot_sound : "coins_pickup",
		icon : 'metal-disc',
		stacking : true,
	},
	// {"name":"gold","label":"__LABEL__","_stacks":2}
	reallyHeavyTestItem : {
		name : "Heavy Test Item",
		slots : [],
		equipped : false,
		tags : [],
		wrappers : [],
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
			wrappers : [],
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
		basevalue : 100,
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
		description : "A simple leather whip, it has seen better days.\n+1 Physical Proficiency",
		weight : 1000,
		loot_sound : "whipPickup",
		icon : 'whip',
	},
	gropeRope : {
		category : Asset.Categories.handheld,
		name : "Groperope",
		slots : [Asset.Slots.hands],
		tags : [ stdTag.asWhip ],
		wrappers : [],
		basevalue : 500,
		description : "Adds the Groperope ability. Allowing you to deal 3 physical damage on an enemy every 3 turns.",
		weight : 750,
		loot_sound : "whipPickup",
		icon : 'lasso',
		rarity : 2,
		charges : -1,
		use_action : "gropeRope",
	},
	boneRod : {
		category : Asset.Categories.handheld,
		name : "Bone Rod",
		slots : [Asset.Slots.hands],
		tags : [ stdTag.asDildoSpear ],
		basevalue : 15,
		wrappers : [
			{
				detrimental : false,
				effects : [
					{
						type: Effect.Types.bonCorruption,
						data:{amount:1},
					}
				],
				trigger_immediate : false,
				duration : 0
			}
		],
		description : "A spear made of long bones all tied together. The tip is rounded off and has a soft surface.\n+1 Corruption Proficiency",
		weight : 1000,
		loot_sound : "lootSticks",
		icon : 'bone-mace',
	},



	minorRepairKit : {
		category : Asset.Categories.tool,
		name : "Minor Repair Kit",
		weight : 1000,
		basevalue : 50,
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
		basevalue : 100,
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
		basevalue : 500,
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
		basevalue : 180,
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
		basevalue : 500,
		ranged : Action.Range.None,
		category : Asset.Categories.consumable,
		name : "Healing Potion",
		weight : 300,
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
		basevalue : 1000,
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
		basevalue : 100,
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
		basevalue : 200,
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

	prettyRock : {
		category : Asset.Categories.junk,
		name :"Pretty Rock",
		basevalue : 1,
		weight : 100,
		charges : 1,
		use_action : "throwRock",
		rarity : 0,
		icon : 'stone',
		slots : [Asset.Slots.action],
		loot_sound : "loot_rock",
		ranged : Action.Range.Ranged,
		stacking : true,
	},

	food_RazzyBerry : {
		category : Asset.Categories.food,
		name : 'Razzyberry',
		description : 'Restores 2 mana and 5 HP. Only usable out of combat.',
		stacking : true,
		basevalue : 5,
		weight : 10,
		charges : 1,
		use_action : "foodRazzyberry",		// name not needed for use_action ones. it uses UA instead
		rarity : 0,
		loot_sound : "berryGrab",
		icon : 'grapes',
		ranged : Action.Range.None,
	},

	food_FriedFish : {
		category : Asset.Categories.food,
		name : 'Fried Fish',
		description : 'A port speciality.\nRestores 25 HP and 5 MP. Only usable out of combat.',
		stacking : false,
		basevalue : 120,
		weight : 200,
		charges : 1,
		use_action : "foodFriedFish",		// name not needed for use_action ones. it uses UA instead
		rarity : 1,
		loot_sound : "food_pickup",
		icon : 'fried-fish',
		ranged : Action.Range.None,
	},

	food_Ale : {
		category : Asset.Categories.food,
		name : 'Ale',
		description : 'A pint of ale from the Yuug breweries.\nRestores 10 HP but removes 2 MP.',
		stacking : false,
		basevalue : 35,
		weight : 400,
		charges : 1,
		use_action : "foodAle",		// name not needed for use_action ones. it uses UA instead
		rarity : 1,
		loot_sound : "lootPotion",
		icon : 'beer-stein',
		ranged : Action.Range.None,
	},

	whiteSwimtrunks : {
		name : "White Swimtrunks",
		category : Asset.Categories.armor,
		icon : 'underwear',
		slots : [Asset.Slots.lowerBody],
		equipped : false,
		basevalue : 50,
		tags : [
			stdTag.asTight,
			stdTag.asStretchy,
			stdTag.asCanPullDown
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
		basevalue : 300,
		category : Asset.Categories.armor,
		icon : 'robe',
		slots : [Asset.Slots.upperBody],
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

	cultist_robe : {
		name : "Cult Robe",
		basevalue : 100,
		category : Asset.Categories.armor,
		icon : 'robe',
		slots : [Asset.Slots.upperBody],
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
						data : {amount:1},
					},
				],
				duration : -1
			}
		],
		description : "A dull red flowing robe ending at your hips and flowing down to your knees. It has a tentacle embroidered on the chest.\n+1 Int, +1 Bon Corruption",
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
		slots : [Asset.Slots.upperBody],
		equipped : false,
		tags : [stdTag.asShirt,stdTag.asLeather,stdTag.asRawhide,stdTag.asCanPullDown],
		basevalue : 90,
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
		description : "A tattered rawhide leather shirt.\n+1 Physical Resistance",
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
		basevalue : 90,
		icon : 'underwear',
		slots : [Asset.Slots.lowerBody],
		equipped : false,
		tags : [stdTag.asThong,stdTag.asWaistband,stdTag.asLeather,stdTag.asRawhide,stdTag.asCanPullDown],
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
		description : "A tattered rawhide leather thong.\n+1 Physical Resistance",
		level : -1,
		durability_bonus : 2,
		durability : 10,
		weight : 300,
		rarity : 0,
		loot_sound : "lootLeather",
	},

	genericRattyVest : {
		name : "Ratty Vest",
		category : Asset.Categories.armor,
		basevalue : 5,
		icon : 'sleeveless-jacket',
		slots : [Asset.Slots.upperBody],
		tags : [stdTag.asCloth, stdTag.asCotton],
		wrappers : [],
		description : "A worn sailor's vest which has seen better days.",
		level : -1,
		durability : 5,
		weight : 200,
		rarity : 0,
		loot_sound : "lootCloth",
	},
	genericRattyShorts : {
		name : "Ratty Shorts",
		category : Asset.Categories.armor,
		basevalue : 5,
		icon : 'underwear-shorts',
		slots : [Asset.Slots.lowerBody],
		tags : [stdTag.asCloth, stdTag.asCotton],
		wrappers : [],
		description : "A worn pair of sailor's shorts which have seen better days.",
		level : -1,
		durability : 5,
		weight : 100,
		rarity : 0,
		loot_sound : "lootCloth",
	},

	yuug_portswood_silk_thong: {
		name : "Silk Thong",
		category : Asset.Categories.armor,
		basevalue : 600,
		icon : 'underwear',
		slots : [Asset.Slots.lowerBody],
		equipped : false,
		tags : [stdTag.asThong,stdTag.asWaistband,stdTag.asCloth,stdTag.asStretchy,stdTag.asSilk,stdTag.asCanPullDown],
		wrappers : [{
			effects : [
				{type : Effect.Types.intellectModifier,data : {amount:1}},
				{type : Effect.Types.staminaModifier,data : {amount:1}},
				{type : Effect.Types.bonCorruption,data : {amount:1}},
			],
			duration : -1
		}],
		description : "A thong made of red silk. Semi-transparent.\n+1 Int, +1 Sta, +1 Pro.Corruption\nMASTERCRAFTED",
		level : -1,
		durability_bonus : 2,
		durability : 12,
		weight : 30,
		rarity : 2,
		loot_sound : "lootCloth",
	},
	

	groperVine : {
		name : "Groper Vine",
		basevalue : 30,
		slots : [],
		category : Asset.Categories.reagent,
		tags : [stdTag.asReagent],
		description : "A sturdy vine taken from a groper.",
		weight : 500,
		rarity : 0,
		loot_sound : "loot_herb",
		icon : 'vine-whip',
		stacking : true,
	},

	sharkanium : {
		name : "Sharkanium",
		basevalue : 10000,
		slots : [],
		category : Asset.Categories.reagent,
		tags : [stdTag.asReagent],
		description : "A faintly glowing purple rock.",
		weight : 1000,
		rarity : 4,
		loot_sound : "loot_sharkanium",
		icon : 'ore',
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
