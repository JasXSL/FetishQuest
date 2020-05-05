import Asset from "../../classes/Asset.js";
import Action from "../../classes/Action.js";
import stdTag from "../stdTag.js";
import Player from "../../classes/Player.js";

const lib = {
	sling_armor : {
		icon : 'sling',
		slots : [
			Asset.Slots.upperBody,
			Asset.Slots.lowerBody,
		],
		name : "Sling Armor",
		shortname : 'Sling Armor',
		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"mailCopper",
			"mailSteel",
			"mailMithril",
			"plateSoftsilver",
			"stretchhide"
		],
		description : "A stretchy outfit that's essentially two strings over your shoulder coming together at your groin and a thong shape at the back. Leaves a bit of the sides of your groin exposed.",
		tags : [
			stdTag.asThong, stdTag.asSlingBikini, stdTag.asBodysuit, stdTag.asGroinSemiExposed
		],
		size : 0.5
	},
	thong: {
		icon : 'underwear',
		slots : [Asset.Slots.lowerBody],
		name : "Thong",
		shortname : 'Thong',
		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"plateSoftsilver",
			"rawhide",
			"plateSteel",
			"plateCopper",
			"mailCopper",
			"mailSteel",
			"mailMithril",
			"stretchhide"
		],
		description : "The type of garment that goes between your buttcheeks.",
		tags : [
			stdTag.asThong, stdTag.asWaistband, stdTag.asCanPullDown,
		],
		size : 0.1
	},
	shirt : {
		icon : 'shirt',
		slots : [Asset.Slots.upperBody],
		name : "Shirt",
		shortname : 'Shirt',

		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"rawhide",
		],
		description : "A shirt.",
		tags : [stdTag.asShirt, stdTag.asCanPullUp],
		size : 0.8
	},
	tank_top : {
		icon : 'shirt',
		slots : [Asset.Slots.upperBody],
		name : "Tank Top",
		shortname : 'Tank Top',

		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"rawhide",
			"mailCopper",
			"mailSteel",
			"mailMithril"
		],
		description : "A tight tank top. Favored by tigers and vegetarians across the world.",
		tags : [stdTag.asShirt, stdTag.asCanPullUp],
		size : 0.4
	},
	chestwraps : {
		icon : 'shirt',
		slots : [Asset.Slots.upperBody],
		name : "Chestwraps",
		shortname : 'Chestwraps',

		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth"
		],
		description : "A shirt.",
		tags : [stdTag.asShirt, stdTag.asCanPullUp, stdTag.asWraps, stdTag.asCanPullDown],
		size : 0.4
	},
	bodysuit : {
		icon : 'sleeveless-top',
		slots : [Asset.Slots.upperBody, Asset.Slots.lowerBody],
		name : "Bodysuit",
		shortname : 'Bodysuit',

		materials : [
			"mageweave",
			"shadowcloth",
			"leather",
			"stretchhide",
			"plateSoftsilver"
		],
		description : "A a tight piece of clothing with shoulder straps. It has a fairly visible cleavage and covered back. It comes together at the hips and wraps down across your groin, leaving your legs exposed.",
		tags : [stdTag.asTight, stdTag.asBodysuit],
		size : 0.8,
		level : 5,
	},
	thong_bodysuit : {
		icon : 'sleeveless-top',
		slots : [Asset.Slots.upperBody, Asset.Slots.lowerBody],
		name : "Thong Bodysuit",
		shortname : 'Bodysuit',
		materials : [
			"mageweave",
			"shadowcloth",
			"leather",
			"stretchhide",
			"plateSoftsilver"
		],
		description : "A a tight piece of clothing with shoulder straps. It has a fairly visible cleavage and exposed back. It wraps down over your groin and forming a thong shape joining together at your hips, leaving your legs exposed. Leave a bit of the sides of your groin exposed.",
		tags : [stdTag.asTight, stdTag.asBodysuit, stdTag.asThong, stdTag.asGroinSemiExposed],
		size : 0.6,
		level : 7
	},
	

	breastplate : {
		icon : 'chest-armor',
		slots : [Asset.Slots.upperBody],
		name : "Breastplate",
		shortname : 'Breastplate',

		materials : [
			"plateCopper",
			"plateSoftsilver",
			"plateSteel"
		],
		description : "A rather modest breastplate, covering only the top of your chest.",
		size : 0.6
	},
	bikiniTop : {
		icon : 'bow-tie',
		slots : [Asset.Slots.upperBody],
		name : "Bikini Top",
		shortname : 'Top',

		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth",
			"leather",
			"plateSoftsilver",
			"rawhide",
			"plateSteel",
			"plateCopper",
			"mailCopper",
			"mailSteel",
			"mailMithril",
			"stretchhide"
		],
		description : "A rather modest breastplate, covering only the top of your chest.",
		size : 0.6
	},
	crotchplate : {
		icon : 'armored-pants',
		slots : [Asset.Slots.lowerBody],
		name : "Crotchplate",
		shortname : 'Crotchplate',

		materials : [
			"plateCopper",
			"plateSoftsilver",
			"plateSteel"
		],
		description : "A rather modest crotchplate, covering only your groin and half your butt.",
		tags : [
			stdTag.asWaistband
		],
		size : 0.3
	},
	half_robe : {
		icon : 'robe',
		slots : [Asset.Slots.upperBody],
		name : "Half-robe",
		shortname : 'Half-robe',

		materials : [
			"cotton",
			"silk",
			"mageweave",
			"shadowcloth"
		],
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
		slots : [Asset.Slots.lowerBody],
		name : "Loincloth",
		shortname : 'Loincloth',
		materials : [
			"rawhide",
			"cotton",
			"silk",
			"shadowcloth"
		],
		description : "A loincloth covering your groin, with a thong underneath it.",
		tags : [
			stdTag.asRobe,
			stdTag.asCrotchFlap,
			stdTag.asButtFlap,
			stdTag.asThong,
			stdTag.asWaistband,
			stdTag.asCanPullDown,
		],
		size : 0.4
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
