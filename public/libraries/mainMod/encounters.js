import stdTag from "../stdTag.js";
// Player templates
import PT from './playerTemplates.js';

const lib = {
	imps : {
		player_templates : [
			"imp",
			"darkImp",
			"stunted_imp"
		],
		wrappers : [],
		startText : '',
		conditions : [],
	},
	tentacles : {
		player_templates : [
			"tentacle_fiend",
			"lesser_tentacle_fiend",
			"shocktacle",
			"greater_tentacle_fiend",
		],
		wrappers : [],
		startText : '',
		conditions : [],
	},
	beach : {
		player_templates : [
			"cocktopus",
			"tentacrab"
		],
		wrappers : [],
		startText : '',
		conditions : [],
	},

	// YUUG
	yuug_port_tavern_npcs : {
		players: ["yuug_port_barkeep"],
		friendly : true,
		rp : ["first_quest_pickup"]
	},


	// MQ00
	["MQ00_Boss"] : {
		players: [
			'MQ00_Boss',
		],
		friendly : true,
		rp : ["MQ00_Boss"]
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
