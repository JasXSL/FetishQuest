import Text from '../../classes/Text.js';
import conditions from './conditions.js';
import audioKits from './audioKits.js';
import stdTag from '../stdTag.js';
import Asset from '../../classes/Asset.js';
const C = conditions;
const baseCond = ['actionHit', 'eventIsActionUsed'];

const lib = [
	{ text : "Ha! Fool!",
		conditions : ["eventIsEffectTrigger","action_tentacle_pit_proc"],
		chat : Text.Chat.required
	},
];

export default lib;