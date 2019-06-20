import Text from '../../classes/Text.js';
//import conditions from './conditions.js';
//import audioKits from './audioKits.js';
//import stdTag from '../stdTag.js';
//import Asset from '../../classes/Asset.js';
//const C = conditions;
const baseCond = ['actionHit', 'eventIsActionUsed'];

const lib = [
	{ text : "Ha! Fool!",
		conditions : ["eventIsEffectTrigger","action_tentacle_pit_proc"],
		chat : Text.Chat.required
	},


	// Yuug port villager
	{ text : "Hah! I still got to squeeze yer tits!",
		conditions : ["senderIsYuugPortVillager","actionHit","eventIsTextTrigger","metaBreastFondle"],
		chat : Text.Chat.optional
	},
	{ text : "Breasts be nice an' all, but that is nice and soft too!",
		conditions : ["senderIsYuugPortVillager","actionHit","eventIsTextTrigger","metaVaginaFondle"],
		chat : Text.Chat.optional
	},
	{ text : "Just softening 'em up a bit!",
		conditions : ["senderIsYuugPortVillager","actionHit","eventIsTextTrigger","metaBreastSlots","action_lowBlow"],
		chat : Text.Chat.optional
	},



];

export default lib;