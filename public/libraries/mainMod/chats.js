import Text from '../../classes/Text.js';
//import conditions from './conditions.js';
//import audioKits from './audioKits.js';
//import stdTag from '../stdTag.js';
//import Asset from '../../classes/Asset.js';
//const C = conditions;
const baseCond = ['actionHit', 'eventIsActionUsed'];

const lib = [
	{ text : "Ha! Fool!",
		conditions : ["eventIsEffectTrigger","action_tentacle_pit_proc","senderIsChatPlayer"],
		chat : Text.Chat.required,
	},


	// Yuug port villager
	{ text : "Hah! I still got to squeeze yer tits!",
		conditions : ["senderIsYuugPortVillager","actionHit","metaBreastFondle","senderIsChatPlayer"],
		chat : Text.Chat.required,
	},
	{ text : "Breasts be nice an' all, but that is nice and soft too!",
		conditions : ["senderIsYuugPortVillager","actionHit","metaGroinFondle","senderIsChatPlayer","targetVagina"],
		chat : Text.Chat.optional,
	},
	{ text : "Just softening 'em up a bit!",
		conditions : ["senderIsYuugPortVillager","actionHit","metaBreastSlots","action_lowBlow","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Big 'n round, just the way I like!",
		conditions : ["senderIsYuugPortVillager","actionHit","metaButtGrab","senderIsChatPlayer","targetButtLarge"],
		chat : Text.Chat.optional,
	},
	{ text : "Oof!",
		id : 'oof',
		conditions : ["targetIsYuugPortVillager","actionHit","targetIsChatPlayer","metaGroinPain"],
		chat : Text.Chat.required,
	},


	// Impicus
	{ text : "Enjoy gift from Impicus!",
		conditions : ["senderIsImpicus","actionHit","metaCameInside","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Nice and squishy for Impicus!",
		conditions : ["senderIsImpicus","actionHit","metaPenetratedWithPenis","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Impicus best tentaclemancer!",
		conditions : ["senderIsImpicus","actionHit","metaUsedTentacle","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Take my tentacles!",
		conditions : ["senderIsImpicus","actionHit","metaUsedTentacle","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	
	// Ixsplat
	{ text : "First, we tie you up nice and good...",
		conditions : ["senderIsIxsplat","actionHit","action_imp_groperopeHogtie","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "All tied up... Feels good?",
		conditions : ["senderIsIxsplat","actionHit","action_imp_groperopeHogtie","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Gonna need more rope...",
		conditions : ["senderIsIxsplat","eventIsActionCharged","action_imp_newGroperope","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
	{ text : "Less clothes, better test results!",
		conditions : ["senderIsIxsplat","actionHit","targetArmorStripped","senderIsChatPlayer"],
		chat : Text.Chat.optional,
	},
];

export default lib;