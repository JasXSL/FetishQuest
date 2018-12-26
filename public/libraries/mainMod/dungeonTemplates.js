import stdTag from "../stdTag.js";
import encounters from './encounters.js';

const lib = {
	dark : {
		label : "dark",
		tags : [stdTag.duDark],
		doors_hor : ["Dungeon.Door.Default"],
		doors_up : ["Dungeon.Door.Ladder"],
		doors_down : ["Dungeon.Door.Trapdoor"],
		encounters : [
			"imps",
			"tentacles"
		],
		rooms:[
			"darkChamber",
			"darkCorridor"
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
