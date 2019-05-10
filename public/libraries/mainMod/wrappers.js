import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import Condition from "../../classes/Condition.js";

const lib = {
	
	soak : {
		"target":"VICTIM",
		"max_stacks":3,
		"duration":2,
		"name":"Soak",
		"icon":"burst-blob",
		"description":"Soaked, elemental avoidance lowered by 2 per stack.",
		"detrimental":true,
		"add_conditions":[
			"senderNotDead",
			"targetNotDead"
		],
		"stay_conditions":[
			"senderNotDead",
			"targetNotDead"
		],
		"tags":[
			"wr_soaked"
		],
		"effects":[
			{
				"type":"svElemental",
				"data":{
				"amount":-2
				}
			}
		]
	},
	stun1turn : {
		"duration":1,
		"name":"Stun",
		"description":"Stunned",
		"icon":"stun",
		"detrimental":true,
		"add_conditions":[
			"senderNotDead",
			"targetNotDead"
		],
		"stay_conditions":[
			"senderNotDead",
			"targetNotDead"
		],
		"tags":[

		],
		"effects":[
			{
				"type":"stun"
			}
		],
	},
	corruptingOoze : {
		target : Wrapper.Targets.auto,
		max_stacks : 6,
		duration : 3,
		name : "Corrupting Ooze",
		icon : "gooey-molecule",
		description : "Corruption avoidance lowered.",
		detrimental : true,
		add_conditions : [
			"senderNotDead", "targetNotDead"
		],
		stay_conditions : [
			"senderNotDead","targetNotDead"
		],
		tick_on_turn_start : false,
		tick_on_turn_end : true,
		tags : [
			"wr_corrupting_ooze"
		],
		effects : [
			{
				type : Effect.Types.svCorruption,
				data:{
					amount:-1
				}
			},
			{
				type : Effect.Types.addStacks,
				data : {
					amount : 1
				}
			},
			{
				events : [
					GameEvent.Types.internalWrapperStackChange,
				],
				type: Effect.Types.runWrappers,
				label : "corrupting_ooze_proc",
				conditions : [
					{
						type : Condition.Types.wrapperStacks,
						data : {
							operation : ">",
							amount : 5
						}
					}
				],
				data : {
					wrappers : [
						{
							duration : 1,
							name : "Stun",
							description : "Stunned",
							icon : "stun",
							detrimental : true,
							add_conditions : [
								"senderNotDead","targetNotDead"
							],
							stay_conditions : [
								"senderNotDead","targetNotDead"
							],
							effects:[
								{
									type : Effect.Types.stun
								}
							],
							label : "stun1turn"
						}
					]
				}
			},
			{
				events : [
					GameEvent.Types.internalWrapperStackChange,
				],
				type : Effect.Types.removeParentWrapper,
				conditions : [
					{
						type : Condition.Types.wrapperStacks,
						data : {
							operation : ">",
							amount : 5
 						}
					}
				]
			}
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