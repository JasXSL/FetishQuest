import { Wrapper, Effect } from '../classes/EffectSys.js';
import stdTag from './stdTag.js';

import conditions from './conditions.js';
import Condition from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
const wrappers = {}
wrappers.soak = {
	target: Wrapper.TARGET_AUTO,
	max_stacks : 3,
	duration : 2,
	name : "Soak",
	icon : "burst-blob.svg",
	description : "Soaked, elemental resistance lowered by 2 per stack.",
	detrimental : true,
	label : 'soak',
	add_conditions : conditions.collections.std, 
	stay_conditions : conditions.collections.std, 
	tags : [stdTag.wrSoaked],
	effects : [
		{
			type : Effect.Types.svElemental,
			data : {
				amount : -2
			}
		},
	]
};

wrappers.stun1turn = {
	duration : 1,
	name : "Stun",
	description : 'Stunned',
	icon : 'stun.svg',
	detrimental : true,
	add_conditions : conditions.collections.std,
	stay_conditions : conditions.collections.std,
	tags : [],
	effects : [
		{
			type : Effect.Types.stun,
		},
	]
};


wrappers.corruptingOoze = {
	target: Wrapper.TARGET_AUTO,
	max_stacks : 6,
	duration : 3,
	name : "Corrupting Ooze",
	icon : "goo-skull.svg",
	description : "Corruption resistance lowered.",
	detrimental : true,
	label : 'corruptingOoze',
	add_conditions : conditions.collections.std, 
	stay_conditions : conditions.collections.std, 
	tick_on_turn_start : false,
	tick_on_turn_end : true,
	tags : [
		'wr_corrupting_ooze'
	],
	effects : [
		{
			type : Effect.Types.svCorruption,
			data : {
				amount : -1
			}
		},
		{
			type : Effect.Types.addStacks,
			data : {
				amount : 1
			}
		},
		{
			type : Effect.Types.runWrappers,
			label : 'corrupting_ooze_proc',
			conditions : [
				{
					events : [GameEvent.Types.internalWrapperStackChange, GameEvent.Types.internalWrapperTick],
					type : Condition.Types.wrapperStacks,
					data : {
						operation : ">",
						amount : 5
					}
				}
			],
			data : {wrappers:[wrappers.stun1turn]}
		},
		{
			events : [GameEvent.Types.internalWrapperStackChange, GameEvent.Types.internalWrapperTick],
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
		},
	]
};


export default wrappers;