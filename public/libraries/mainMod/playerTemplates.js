import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import Asset from "../../classes/Asset.js";

const lib = {
	lesser_tentacle_fiend : {
		name : "Lesser Tentacle Fiend",
		icon : "/media/characters/lesser_tentacle_fiend.jpg",
		species : "",
		description : "",
		classes : [
			"tentacle_fiend"
		],
		max_actions : 1,
		tags : [
			"pl_beast",
			"pl_tentacles",
			stdTag.plCocktacle,
		],
		min_level : 1,
		max_level : 5,
		primary_stats : {
			"stamina":-4,
			"agility":2
		},
		sv : {
			"Elemental":-2,
			"Holy":-4
		},
		bon : {
			"Corruption":2
		},
		gear_chance : 0.5,
		min_size : 0,
		max_size : 1,
		difficulty : 1,
		sadistic_min : 0,
		sadistic_max : 1,
		dominant_min : 0,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.2,
		intelligence_max : 0.3,
	},
	tentacle_fiend: {
		name : "Tentacle Fiend",
		icon : "/media/characters/tentacle_fiend.jpg",
		species : "",
		description : "",
		classes : [
			"tentacle_fiend"
		],
		max_actions : 2,
		tags : [
			"pl_beast",
			"pl_tentacles",
			stdTag.plCocktacle,
		],
		min_level : 3,
		max_level : 8,
		primary_stats : {
			"agility":2
		},
		sv : {
			"Elemental":-2,
			"Holy":-4
		},
		bon : {
			"Corruption":3
		},
		viable_asset_materials : [

		],
		viable_asset_templates : [

		],
		viable_gear : [

		],
		gear_chance : 0.5,
		min_size : 1,
		max_size : 3,
		difficulty : 1,
		viable_consumables : [

		],
		sadistic_min : 0,
		sadistic_max : 1,
		dominant_min : 0,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.2,
		intelligence_max : 0.3,
		required_assets : [

		]
	},
	greater_tentacle_fiend : {
		name : "Greater Tentacle Fiend",
		icon : "/media/characters/greater_tentacle_fiend.jpg",
		species : "",
		description : "",
		classes : ["tentacle_fiend"],
		max_actions : 3,
		tags : [stdTag.plBeast, stdTag.plTentacles, stdTag.plCocktacle,],
		min_level : 6,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.stamina]:1,
			[Player.primaryStats.agility]:2
		},
		sv : {
			[Action.Types.elemental]:-2,
			[Action.Types.holy]:-4,
			[Action.Types.corruption]:2,
		},
		bon : {
			[Action.Types.corruption]:2,
			[Action.Types.physical]:2
		},
		viable_asset_materials : [],
		viable_asset_templates : [],
		viable_gear : [],
		gear_chance : 0.5,
		min_size : 2,
		max_size : 3,
		difficulty : 1,
		viable_consumables : [],
		sadistic_min : 0,
		sadistic_max : 1,
		dominant_min : 0,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.3,
		intelligence_max : 0.4,
		required_assets : []
	},
	shocktacle : {
		name : "Shocktacle",
		icon : "",
		species : "tentacle monster",
		description : "A collection of wriggling blue tentacles, with a long thick flatter one in the center.",
		classes : [
			"shocktacle"
		],
		max_actions : 3,
		tags : [
			stdTag.plBeast,
			stdTag.plTentacles,
			stdTag.plElectric,
			stdTag.plCocktacle,
		],
		min_level : 4,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.intellect]:2
		},
		sv : {
			[Action.Types.elemental]:4,
			[Action.Types.corruption]:2,
			[Action.Types.physical]:-2,
		},
		bon : {
			[Action.Types.corruption]:1,
			[Action.Types.elemental]:3,
		},
		viable_asset_materials : [],
		viable_asset_templates : [],
		viable_gear : [],
		gear_chance : 0.5,
		min_size : 2,
		max_size : 3,
		difficulty : 1,
		viable_consumables : [],
		sadistic_min : 1,
		sadistic_max : 1,
		dominant_min : 1,
		dominant_max : 1,
		intelligence_min : 0.2,
		intelligence_max : 0.3,
		required_assets : []
	},
	stunted_imp : {
		name : "Stunted Imp",
		icon : "",
		species : "Imp",
		description : "A short imp with a pointed tail and little horns.",
		classes : [
			"imp"
		],
		monetary_wealth : 10,
		max_actions : 1,
		tags : [
			"pl_penis",
			"pl_horns",
			"pl_tail",
			stdTag.plDishonorable,
			stdTag.plTongue,
			stdTag.plDemon,
		],
		min_level : 1,
		max_level : 5,
		primary_stats : {
			"intellect":0,
			"stamina":-4,
			"agility":1
		},
		sv : {
			"Physical":-1,
			"Elemental":-2,
			"Holy":-4,
			"Corruption":0
		},
		bon : {
			"Physical":0,
			"Elemental":0,
			"Holy":0,
			"Corruption":1
		},
		viable_asset_materials : [
			"cotton"
		],
		viable_asset_templates : [
			"thong",
			"shirt",
			"loincloth"
		],
		viable_gear : [

		],
		gear_chance : 0.5,
		min_size : 0,
		max_size : 0,
		difficulty : 1,
		viable_consumables : [

		],
		sadistic_min : 0.5,
		sadistic_max : 1,
		dominant_min : 0.8,
		dominant_max : 1,

		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.4,
		intelligence_max : 0.5,
		required_assets : [

		]
	},

	lamprey : {
		name : "Lamprey",
		icon : "",
		species : "lamprey",
		description : "A slimy eel-like creature with a sucker for a mouth. Doesn't have any teeth, and opts instead to feed on other fluids.",
		classes : ["lamprey"],
		max_actions : 2,
		tags : [
			stdTag.plBeast,
			stdTag.plElectric,
			stdTag.plEel,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 2,
			[Player.primaryStats.stamina] : -5,
		},
		sv : {
			[Action.Types.elemental]:2,
			[Action.Types.physical]:-2,
		},
		bon : {
			[Action.Types.corruption]:2,
			[Action.Types.elemental]:2,
			[Action.Types.physical]:-2,
		},
		min_size : 1,
		max_size : 1,
		difficulty : 1,
		sadistic_min : 0,
		sadistic_max : 0.5,
		dominant_min : 1,
		dominant_max : 1,
		intelligence_min : 0.1,
		intelligence_max : 0.2
	},
	anemone : {
		name : "Anemone",
		icon : "",
		species : "anemone",
		description : "A mass of wiggly tentacles growing out of hardened vents growing from the bottom of a body of water. Most tips are coated with small wiggly tendrils, but some have suction cups on them.\n\nAn enemy anemone if you will.",
		classes : ["anemone"],
		max_actions : 4,
		tags : [
			stdTag.plBeast,
			stdTag.plTentacles,
			stdTag.plImmobile,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 2,
			[Player.primaryStats.stamina] : 2,
		},
		sv : {
			[Action.Types.elemental]:2,
			[Action.Types.physical]:1,
			[Action.Types.corruption]:1,
		},
		bon : {
			[Action.Types.corruption]:2,
			[Action.Types.physical]:1,
		},
		min_size : 4,
		max_size : 5,
		difficulty : 1,
		sadistic_min : 0,
		sadistic_max : 1,
		dominant_min : 1,
		dominant_max : 1,
		intelligence_min : 0.1,
		intelligence_max : 0.2
	},
	sharktopus : {
		name : "Sharktopus",
		icon : "",
		species : "shark...thing",
		description : "An unholy abomination which looks like a mix between an octopus and a shark. It stands tall and imposing.",
		classes : ["sharktopus"],
		max_actions : 3,
		tags : [
			stdTag.plBeast,
			stdTag.plTentacles
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 2,
			[Player.primaryStats.intellect] : -2,
			[Player.primaryStats.stamina] : 5,
		},
		sv : {
			[Action.Types.elemental]:2,
			[Action.Types.physical]:2,
			[Action.Types.corruption]:2,
			[Action.Types.holy]:-2,
		},
		bon : {
		},
		min_size : 7,
		max_size : 7,
		difficulty : 1,
		sadistic_min : 0.5,
		sadistic_max : 0.6,
		dominant_min : 1,
		dominant_max : 1,
		intelligence_min : 0.3,
		intelligence_max : 0.4
	},
	
	imp : {
		name : "Imp",
		icon : "",
		species : "Imp",
		description : "A short imp with a pointed tail and little horns.",
		classes : [
			"imp"
		],
		monetary_wealth : 20,
		max_actions : 2,
		tags : [
			"pl_penis",
			"pl_horns",
			"pl_tail",
			"pl_big_penis",
			stdTag.plDishonorable,
			stdTag.plTongue,
			stdTag.plDemon,
		],
		min_level : 3,
		max_level : 10,
		primary_stats : {
			"intellect":2,
			"stamina":0,
			"agility":1
		},
		sv : {
			"Physical":0,
			"Elemental":0,
			"Holy":-4,
			"Corruption":0
		},
		bon : {
			"Physical":0,
			"Elemental":0,
			"Holy":0,
			"Corruption":3
		},
		viable_asset_materials : [
			"cotton",
			"leather",
			"rawhide"
		],
		viable_asset_templates : [ 
			"thong",
			"shirt",
			"half_robe",
			"loincloth"
		],
		viable_gear : [
			"simpleWhip"
		],
		gear_chance : 0.5,
		min_size : 0,
		max_size : 1,
		difficulty : 1,
		viable_consumables : [
			"minorHealingPotion"
		],
		sadistic_min : 0.5,
		sadistic_max : 1,
		dominant_min : 0.8,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.4,
		intelligence_max : 0.6,
		required_assets : [

		]
	},
	darkImp : {
		name : "Dark Imp",
		icon : "",
		species : "Imp",
		description : "A short imp with a pointed tail and little horns, this one is emanating a dark aura and has a sizable member.",
		classes : [
			"imp"
		],
		monetary_wealth : 50,
		max_actions : 3,
		tags : [
			"pl_penis",
			"pl_horns",
			"pl_tail",
			"pl_big_penis",
			stdTag.plDishonorable,
			stdTag.plTongue,
			stdTag.plDemon,
		],
		min_level : 5,
		max_level : 15,
		primary_stats : {
			"intellect":4,
			"stamina":2,
			"agility":2
		},
		sv : {
			"Physical":0,
			"Elemental":0,
			"Holy":-4,
			"Corruption":0
		},
		bon : {
			"Physical":0,
			"Elemental":0,
			"Holy":0,
			"Corruption":5
		},
		viable_asset_materials : [
			"rawhide",
			"shadowcloth"
		],
		viable_asset_templates : [
			"thong",
			"shirt",
			"half_robe",
			"loincloth"
		],
		viable_gear : [

		],
		gear_chance : 0.5,
		min_size : 0,
		max_size : 1,
		difficulty : 1,
		viable_consumables : [
			"minorHealingPotion",
			"healingPotion"
		],
		sadistic_min : 0.5,
		sadistic_max : 1,
		dominant_min : 0.8,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.4,
		intelligence_max : 0.6,
		required_assets : []
	},
	mimic : {
		name : "Mimic",
		icon : "",
		species : "Mimic",
		description : "A treasure full of tentacles and teeth.",
		classes : [
			"mimic"
		],
		max_actions : 3,
		tags : [
			"pl_beast",
			"pl_tentacles",
			"pl_immobile"
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			"agility":1,
			"stamina":2
		},
		sv : {
			"Corruption":4,
			"Elemental":1,
			"Holy":-1,
			"Physical":1
		},
		bon : {
			"Corruption":2
		},
		viable_asset_materials : ['*'],
		viable_asset_templates : ['*'],
		gear_chance : 0.5,
		min_size : 3,
		max_size : 3,
		difficulty : 1,
		viable_consumables : ['majorManaPotion','majorHealingPotion','repairKit'],
		powered : true,
		sadistic_min : 0,
		sadistic_max : 1,
		dominant_min : 0,
		dominant_max : 1,
		hetero_min:0,
		hetero_max:1,
		intelligence_min : 0.2,
		intelligence_max : 0.2,
		required_assets : [],
		monetary_wealth : 500,
		gear_quality : 0.5,
		no_equip : true,
	},

	guardian_demon : {
		name : "Guardian Demon",
		icon : "",
		species : "demon",
		description : "A lumbering muscular demon with a big horn on its head, and a large swinging dong.",
		classes : ["guardian_demon_breaker"],
		monetary_wealth : 40,
		powered : true,
		max_actions : 5,
		tags : [
			stdTag.penis,
			stdTag.plHorn,
			stdTag.plBigPenis,
			stdTag.plDishonorable,
			stdTag.plTongue,
			stdTag.plDemon,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.intellect] : -1,
			[Player.primaryStats.stamina] : 4,
			[Player.primaryStats.agility] : 0, 
		},
		sv : {
			[Action.Types.physical] : 2,
			[Action.Types.elemental] : -2,
			[Action.Types.holy] : -4,
			[Action.Types.corruption] : 0,
		},
		bon : {
			[Action.Types.physical] : 2,
			[Action.Types.elemental] : -2,
			[Action.Types.holy] : -4,
			[Action.Types.corruption] : 2,
		},
		required_actions : [
			'guardian_demon_grapple'
		],
		viable_asset_materials : [
			"cotton",
			"leather",
			"rawhide",
			"plateCopper",
			"plateSteel"
		],
		viable_asset_templates : [ 
			"thong",
			"shirt",
			"loincloth",
			"tank_top",
			"chestwraps",
			"breastplate",
			"crotchplate",
		],
		viable_gear : ["simpleWhip"],
		gear_chance : 0.5,
		min_size : 7,
		max_size : 8,
		difficulty : 1,
		viable_consumables : ["healingPotion","manaPotion"],
		sadistic_min : 0.25,
		sadistic_max : 1,
		dominant_min : 0.8,
		dominant_max : 1,
		hetero_min:0.5,
		hetero_max:0.5,
		intelligence_min : 0.4,
		intelligence_max : 0.5,
		required_assets : []
	},

	cocktopus : {
		name : "Cocktopus",
		icon : "/media/characters/cocktopus.jpg",
		species : "Cocktopus",
		description : "Though technically a squid, the cocktopus is a rubbery ocean dweller. Nobody is certain why it seems interested in arousing beings, as it primarily feeds on fish. But adventurers best beware of the large phallus on its head and two ribbed bullet shaped tentacles.",
		classes : [
			"cocktopus"
		],
		max_actions : 3,
		tags : [
			stdTag.plBeast,
			stdTag.plTentacles,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 2,
			[Player.primaryStats.stamina] : -4
		},
		sv : {
			[Action.Types.corruption] : 2,
			[Action.Types.elemental] : 2,
			[Action.Types.holy] : -1,
			[Action.Types.physical] : -1,
		},
		bon : {
			[Action.Types.corruption] : 2,
			[Action.Types.elemental] : 1,
			[Action.Types.holy] : -3,
			[Action.Types.physical] : -1,
		},
		gear_chance : 0,
		min_size : 1,
		max_size : 2,
		difficulty : 1,
		viable_consumables : [],
		intelligence_min : 0.1,
		intelligence_max : 0.15,
	},

	groper : {
		name : "Groper",
		icon : "",
		species : "Groper",
		description : "A tree monster with viny tentacles. Dangerous during mating season. Sadly their mating season lasts all year.",
		classes : ["groper","groper_sapbeast","groper_infested"],
		max_actions : 4,
		tags : [
			stdTag.plBeast,
			stdTag.plTentacles,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : -2,
			[Player.primaryStats.stamina] : 2,
			[Player.primaryStats.intellect] : -3,
		},
		sv : {
			[Action.Types.corruption] : 2,
			[Action.Types.elemental] : 0,
			[Action.Types.holy] : 0,
			[Action.Types.physical] : 2,
		},
		bon : {
			[Action.Types.corruption] : 0,
			[Action.Types.elemental] : 0,
			[Action.Types.holy] : -6,
			[Action.Types.physical] : 0,
		},
		min_size : 6,
		max_size : 8,
		difficulty : 1,
		required_assets : ["groperVine"],
		intelligence_min : 0.1,
		intelligence_max : 0.15,
	},

	tentacrab : {
		name : "Tentacrab",
		icon : "/media/characters/crabby.jpg",
		species : "tentacrab",
		description : "A fiercely territorial crab with little tentacles on its back.",
		classes : [
			"tentacrab"
		],
		max_actions : 2,
		tags : [
			stdTag.plBeast,
			stdTag.plClaws,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : -2,
			[Player.primaryStats.stamina] : -2
		},
		sv : {
			[Action.Types.corruption] : -2,
			[Action.Types.elemental] : 2,
			[Action.Types.holy] : -2,
			[Action.Types.physical] : 3,
		},
		bon : {
			[Action.Types.corruption] : -1,
			[Action.Types.elemental] : 1,
			[Action.Types.holy] : -3,
			[Action.Types.physical] : 0,
		},
		gear_chance : 0,
		min_size : 0,
		max_size : 1,
		difficulty : 1,
		viable_consumables : [],
		intelligence_min : 0.1,
		intelligence_max : 0.15,
	},

	skeleton : {
		name : "Skeleton",
		icon : "",
		species : "skeleton",
		description : "A rattling skeleton.",
		classes : ["skeletonRattler"],
		monetary_wealth : 1,
		max_actions : 2,
		tags : [
			stdTag.plBeast,
			stdTag.plTargetBeast,	// This allows it to be only considered a beast as a target, not as sender
			stdTag.plUndead,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 1,
			[Player.primaryStats.stamina] : -5,
			[Player.primaryStats.intellect] : -5
		},
		sv : {
			[Action.Types.corruption] : 2,
			[Action.Types.elemental] : 0,
			[Action.Types.holy] : -2,
			[Action.Types.physical] : 1,
		},
		bon : {
			[Action.Types.corruption] : 0,
			[Action.Types.elemental] : 0,
			[Action.Types.holy] : -5,
			[Action.Types.physical] : 1,
		},
		viable_gear : [
			"boneRod"
		],
		gear_chance : 0.3,
		min_size : 4,
		max_size : 5,
		difficulty : 1,
		viable_consumables : [],
		intelligence_min : 0.2,
		intelligence_max : 0.4,
	},

	ghoul : {
		name : "Ghoul",
		icon : "",
		species : "ghoul",
		description : "An undead creature seeking to feed upon the fluids of the living.",
		classes : ["ghoulRavener"],
		monetary_wealth : 1,
		max_actions : 3,
		tags : [
			stdTag.plBeast,
			stdTag.plTargetBeast,	// This allows it to be only considered a beast as a target, not as sender
			stdTag.plUndead,
		],
		min_level : 1,
		max_level : 20,
		primary_stats : {
			[Player.primaryStats.agility] : 3,
			[Player.primaryStats.stamina] : -1,
			[Player.primaryStats.intellect] : -2
		},
		sv : {
			[Action.Types.corruption] : 1,
			[Action.Types.elemental] : 2,
			[Action.Types.holy] : -4,
			[Action.Types.physical] : 0,
		},
		bon : {
			[Action.Types.corruption] : 2,
			[Action.Types.elemental] : 0,
			[Action.Types.holy] : -5,
			[Action.Types.physical] : 0,
		},
		gear_chance : 0.25,
		min_size : 3,
		max_size : 5,
		difficulty : 1,
		viable_consumables : [],
		intelligence_min : 0.2,
		intelligence_max : 0.3,
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