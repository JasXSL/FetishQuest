import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import Asset from "../../classes/Asset.js";

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
		powered : true,
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
			stdTag.plBoss, stdTag.plTongue,
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
		powered : true,
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
		
		class : 'imp',
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

	

	Ixsplat : {
		name : "Ixsplat",
		species : "imp",
		description : "A larger than average imp with a big dick.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		powered : true,
		sadistic : 0.7,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.5,
		stamina : 8,
		intellect : 3,
		class : 'imp',
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
			stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plTongue, stdTag.plBigPenis, stdTag.plBoss
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
		powered : true,
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
		class : 'imp',
		talkative : 0.5,
		actions : [
			"imp_ankleBite",
			"imp_specialDelivery",
			"tentaclemancer_tentacleWhip",
		],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plTongue, stdTag.plBigPenis, stdTag.plBoss
		],
		assets : ["genericRawhideThong"],
		inventory : [0],
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
		powered : true,
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