import GameAction from "../../classes/GameAction.js";
import Condition from "../../classes/Condition.js";
import { RoleplayStageOption } from "../../classes/Roleplay.js";
import C from './conditions.js';

const lib = {

	// Procedural bounty board
	procedural_bounty_board : {
		stages: [
			{
				index : 0,
				chat : RoleplayStageOption.ChatType.none,
				text : '[Dev Note] This is where you can do procedurally generated dungeons. Generating a new one will wipe any procedural dungeon in progress. This system will be changed in the future.',
				options : [
					{text:'[Generate New]', index:0, game_actions:['generateDungeon'], chat:RoleplayStageOption.ChatType.none},
					{text:'[Visit Dungeon]', index:-1, game_actions:['visitDungeon'], chat:RoleplayStageOption.ChatType.none},
					{text:'[Cancel]', index:-1, chat:RoleplayStageOption.ChatType.none},
				],
			}
		]
	},
 
	conditional_rp_test : {
		player : 'narrator',
		stages : [
			{
				index : 0,
				text : [
					{text:'Nice bulge, %T!', conditions:[C.targetPenis, C.targetWearsLowerBody]},
					{text:'This is a fallback!'}
				],
				options : [
					{text:'Thanks', index:1},
				]
			},
			{
				index : 1,
				text : [
					{text:'[Narrator sticks a coin in %T\'s %TclothLower.]', conditions:[C.targetPenis, C.targetWearsLowerBody]},
					{text:'No need to disrobe now!'}
				],
				options : [
					{text:'[End]', index:-1, chat:RoleplayStageOption.ChatType.none},
				]
			},

		]
	}

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