import GameAction from "../../classes/GameAction.js";
import Condition from "../../classes/Condition.js";

const lib = {

	// Procedural bounty board
	procedural_bounty_board : {
		stages: [
			{
				index : 0,
				text : '[Dev Note] This is where you can do procedurally generated dungeons. Generating a new one will wipe any procedural dungeon in progress. This system will be changed in the future.',
				options : [
					{text:'[Generate New]', index:0, game_actions:['generateDungeon']},
					{text:'[Visit Dungeon]', index:-1, game_actions:['visitDungeon']},
					{text:'[Cancel]', index:-1},
				],
			}
		]
	},
 

};


function getArray() {
	const out = [];
	for (let action in lib) {
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export { getArray };
export default lib;