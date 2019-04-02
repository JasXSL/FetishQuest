import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";

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