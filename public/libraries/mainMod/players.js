import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import Asset from "../../classes/Asset.js";

const lib = {
	yuug_port_barkeep: {
		name : "Barkeep",
		species : "dog",
		description : "A nice barkeep. This is a placeholder.",
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
		description : "A darkened figure emanating... dark magic.",
		icon : "",
		team : 1,
		size : 4,
		leveled : true,
		powered : true,
		sadistic : 0.7,
		dominant : 0.8,
		hetero : 0.5,
		intelligence : 0.8,
		stamina : 5,
		class : 'MQ00_Boss',
		assets : [
			'mq00_boss_robe',
		],
		inventory : [0],	// Which items should be equipped
		tags : [
			stdTag.vagina, stdTag.breasts, stdTag.plBigBreasts, stdTag.plScaly, stdTag.plTail, stdTag.plLongTail
		]
	}
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