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
	MQ00_Boss : {
		name : "Li Zurd",
		species : "lizard",
		description : "A darkened figure emanating... dark magic. She's wearing a crimson robe.",
		icon : "/media/characters/li_zurd_dressed.jpg",
		icon_upperbody : "/media/characters/li_zurd_dressed.jpg",
		icon_lowerbody : "/media/characters/li_zurd_naked.jpg",
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
			stdTag.plBoss,
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
		class : 'imp',
		actions : [
			'imp_specialDelivery',
			'mq00_ward_boss'
		],
		assets : [],
		inventory : [],	// Which items should be equipped
		tags : [
			stdTag.penis, stdTag.plHorn, stdTag.plTail
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