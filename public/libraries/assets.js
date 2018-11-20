import Asset from '../classes/Asset.js';
import { Wrapper, Effect } from '../classes/EffectSys.js';
import stdTag from './stdTag.js';
import {getByLabel as getAction} from './actions.js';

const out = [
	new Asset({
		label : "shinyWhiteThong",
		name : "Skirt and Thong Outfit",
		description : "A short skirt, some wooly stockings and a shiny white thong. +3 Stamina",
		slots : [Asset.Slots.lowerbody],
		tags : [stdTag.asSkirt,stdTag.asThong,stdTag.asShiny,stdTag.asStockings],					// Prefixed with AS_ and casted to uppercase, use getTags
		weight : 50,
		wrappers : [
			new Wrapper({
				effects : [
					new Effect({
						type : Effect.Types.staminaModifier,
						data : {
							amount : 3
						}
					})
				],
				detrimental : false,
			})
		],
	}),

	new Asset({
		label : 'reallyHeavyTestItem',
		name : 'Heavy Test Item',
		description : 'This thing weighs 100kg',
		weight : 100000,
		slots : [],
	}),


	/* PROPS */
	new Asset({
		label : 'simpleWhip',
		name : 'Simple Whip',
		description : 'A simple leather whip.\n+1 Physical Proficiency',
		slots : [Asset.Slots.hands],
		tags : [stdTag.asWhip],
		weight : 750,
		wrappers : [
			new Wrapper({
				effects : [
					new Effect({
						type : Effect.Types.bonPhysical,
						data : {
							amount : 1
						}
					})
				],
				detrimental : false,
			})
		],
	}),


	/* CONSUMABLE */
	// Minor Repair kit
	new Asset({
		label : 'minorRepairKit',
		name : 'Minor Repair Kit',
		no_auto_consume : true,
		loot_sound : 'lootRepairKit',
		tags : [],
		weight : 1000,
		charges : 1,
		use_action : getAction('minorRepairKit')
	}),
	new Asset({
		label : 'repairKit',
		name : 'Repair Kit',
		loot_sound : 'lootRepairKit',
		no_auto_consume : true,
		tags : [],
		weight : 1000,
		charges : 1,
		rarity : Asset.Rarity.UNCOMMON,
		use_action : getAction('repairKit')
	}),
	new Asset({
		label : 'majorRepairKit',
		loot_sound : 'lootRepairKit',
		name : 'Major Repair Kit',
		no_auto_consume : true,
		tags : [],
		weight : 1000,
		charges : 1,
		rarity : Asset.Rarity.RARE,
		use_action : getAction('majorRepairKit')
	}),



	// Minor healing potion
	new Asset({
		label : 'minorHealingPotion',
		name : 'Minor Healing Potion',
		loot_sound : 'lootPotion',
		tags : [],
		weight : 500,
		charges : 1,
		use_action : getAction('minorHealingPotion')
	}),

	// Healing potion
	new Asset({
		label : 'healingPotion',
		name : 'Healing Potion',
		loot_sound : 'lootPotion',
		tags : [],
		weight : 500,
		charges : 1,
		rarity : Asset.Rarity.UNCOMMON,
		use_action : getAction('healingPotion')
	}),

	// Major healing potion
	new Asset({
		label : 'majorHealingPotion',
		name : 'Major Healing Potion',
		loot_sound : 'lootPotion',
		tags : [],
		weight : 500,
		charges : 1,
		rarity : Asset.Rarity.RARE,
		use_action : getAction('majorHealingPotion')
	}),


	// Mana potion
	new Asset({
		label : 'manaPotion',
		name : 'Mana Potion',
		loot_sound : 'lootPotion',
		tags : [],
		weight : 500,
		charges : 1,
		rarity : Asset.Rarity.UNCOMMON,
		use_action : getAction('manaPotion')
	}),

	// Major healing potion
	new Asset({
		label : 'majorManaPotion',
		name : 'Major Mana Potion',
		loot_sound : 'lootPotion',
		tags : [],
		weight : 500,
		charges : 1,
		rarity : Asset.Rarity.RARE,
		use_action : getAction('majorManaPotion')
	}),

];



export default out;
