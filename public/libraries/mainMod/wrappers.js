import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";
import Action from "../../classes/Action.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
import GameEvent from "../../classes/GameEvent.js";
import Condition from "../../classes/Condition.js";
const stdCond = ["senderNotDead","targetNotDead"];

const lib = {
	
	soak : {
		target: Wrapper.TARGET_AUTO,
		max_stacks : 1,
		duration : 2,
		name : "Soak",
		icon : "burst-blob",
		description : "Soaked, elemental avoidance lowered by 2.",
		detrimental : true,
		add_conditions :stdCond,
		stay_conditions :stdCond,
		tags: [ stdTag.wrSoaked ],
		effects :[
			{
				type: Effect.Types.svElemental,
				data:{"amount":-2}
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
				events : [GameEvent.Types.internalWrapperAdded],
				type : Effect.Types.addArousal,
				data : {amount : 1}
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
	},
	overWhelmingOrgasm : {
		target : Wrapper.Targets.auto,
		duration : 2,
		name : "Orgasm",
		icon : "shining-heart",
		description : "-10 corruption avoidance, stunned.",
		detrimental : true,
		add_conditions : ["senderNotDead", "targetNotDead"],
		stay_conditions : ["senderNotDead","targetNotDead"],
		tags : [],
		effects : [
			{
				type : Effect.Types.stun,
				data:{ignoreDiminishing:true}
			},
			{
				type : Effect.Types.svCorruption,
				data:{amount:-10}
			},
			{
				label : 'overWhelmingOrgasm_end',
				events : [GameEvent.Types.internalWrapperExpiredAfter],
				type : Effect.Types.addArousal,
				data : {
					amount : "-ta_MaxArousal"
				}
			},
			{
				events : [GameEvent.Types.internalWrapperExpiredAfter],
				type : Effect.Types.runWrappers,
				data : {
					wrappers : [{
						label : 'afterglow',
						icon : 'rear-aura',
						name : 'Afterglow',
						description : 'Unable to generate arousal.',
						duration : 2,
						detrimental :  false,
						tags : ['pl_'+stdTag.gpDisableArousal]
					}]
				}
			},
		]
	},

	stdUseBondageDevice : {
		duration : 6,
		name : "Tied Up",
		icon : "manacles",
		description : "You have been tied up to a nearby device.",
		detrimental : true,
		add_conditions : stdCond.concat('targetNotTiedUp'),
		stay_conditions : stdCond,
		tags : [stdTag.wrBound, stdTag.wrNoRiposte],
		effects : [
			{
				type : Effect.Types.disable,
				data : {level:1, hide:true}
			},
			'bondageStruggleDurationEnable',
			'attachToBondageDevice'
		]
	},

	endTurn : {
		detrimental : false,
		add_conditions : [],
		stay_conditions : [],
		effects : ["endTurn"]
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