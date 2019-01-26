import Asset from "../../classes/Asset.js";
import Action from "../../classes/Action.js";
import stdTag from "../stdTag.js";

const lib = {
	sling_armor : {
		icon : 'sling',
		slots : [
			Asset.Slots.upperbody,
			Asset.Slots.lowerbody,
		],
		name : "Sling Armor",
		materials : [
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"mailCopper",
			"mailSteel",
			"mailMithril",
			"plateSoftsilver"
		],
		bonStats : {
			[Action.Types.physical] : 1
		},
		description : "An enchanted sling bikini. Easy to move around in.",
		tags : [
			stdTag.asThong, stdTag.asSlingBikini, stdTag.asBodysuit
		],
		size : 0.5
	},
	thong: {
		icon : 'underwear',
		slots : [Asset.Slots.lowerbody],
		name : "Thong",
		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"plateSoftsilver",
			"rawhide"
		],
		description : "The type of garment that goes between your buttcheeks.",
		tags : [
			stdTag.asThong, stdTag.asWaistband
		],
		size : 0.1
	},
	shirt : {
		icon : 'shirt',
		slots : [Asset.Slots.upperbody],
		name : "Shirt",
		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"rawhide"
		],
		description : "A shirt.",
		tags : [stdTag.asShirt],
		size : 1
	},
	breastplate : {
		icon : 'chest-armor',
		slots : [Asset.Slots.upperbody],
		name : "Breastplate",
		materials : [
			"plateCopper",
			"plateSoftsilver",
			"plateSteel"
		],
		svStats : {
			[Action.Types.physical] : 1
		},
		description : "A rather modest breastplate, covering only the top of your chest.",
		size : 0.6
	},
	crotchplate : {
		icon : 'armored-pants',
		slots : [Asset.Slots.lowerbody],
		name : "Crotchplate",
		materials : [
			"plateCopper",
			"plateSoftsilver",
			"plateSteel"
		],
		svStats : {
			[Action.Types.physical] : 1
		},
		description : "A rather modest crotchplate, covering only your groin and half your butt.",
		tags : [
			stdTag.asWaistband
		],
		size : 0.3
	},
	half_robe : {
		icon : 'robe',
		slots : [Asset.Slots.upperbody],
		name : "Half-robe",
		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth"
		],
		bonStats : {
			[Action.Types.elemental]:1
		},
		description : "A robe ending above your hips, with a cloth flap hanging down in front of your groin and rear.",
		tags : [
			stdTag.asRobe,
			stdTag.asCrotchFlap,
			stdTag.asButtFlap
		],
		size : 1.1
	},
	loincloth : {
		icon : 'loincloth',
		slots : [Asset.Slots.lowerbody],
		name : "Loincloth",
		materials : [
			"rawhide",
			"cotton",
			"silk",
			"shadowcloth"
		],
		bonStats : {
			[Action.Types.elemental]:1
		},
		description : "A loincloth covering your groin, with a thong underneath it.",
		tags : [
			stdTag.asRobe,
			stdTag.asCrotchFlap,
			stdTag.asButtFlap,
			stdTag.asThong,
			stdTag.asWaistband
		],
		size : 0.4
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
