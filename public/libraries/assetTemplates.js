/*
	ARMOR Asset templates for the procedural generator
*/
import {default as AssetTemplate, Materials } from '../classes/templates/AssetTemplate.js';
import Action from '../classes/Action.js';
import stdTags from '../libraries/stdTag.js';
import Asset from '../classes/Asset.js';


const Assets = [];
let m = Materials;
Assets.push(new AssetTemplate({
	name : 'Sling Armor',
	description : 'An enchanted sling bikini. Easy to move around in.',
	slots : [Asset.Slots.upperbody, Asset.Slots.lowerbody],
	materials : [m.silk,m.mageweave,m.shadowcloth,m.leather,m.mailCopper,m.mailSteel,m.mailMithril,m.plateSoftsilver],
	svStats : {},
	bonStats : {[Action.Types.physical] : 1},
	tags : [stdTags.asThong,stdTags.asSlingBikini,stdTags.asBodysuit],
	size : 0.5,
}));
Assets.push(new AssetTemplate({
	name : 'Thong',
	description : 'The type of garment that goes between your buttcheeks.',
	slots : [Asset.Slots.lowerbody],
	tags : [stdTags.asThong,stdTags.asWaistband],
	materials : [m.cotton,m.silk,m.mageweave,m.shadowcloth,m.leather,m.plateSoftsilver,m.rawhide],
	svStats : {},
	bonStats : {},
	size:0.1,
}));
Assets.push(new AssetTemplate({
	name : 'Shirt',
	description : 'A shirt.',
	slots : [Asset.Slots.upperbody],
	tags : [stdTags.asShirt],
	materials : [m.cotton,m.silk,m.mageweave,m.shadowcloth,m.leather,m.rawhide],
	svStats : {},
	bonStats : {},
}));
Assets.push(new AssetTemplate({
	name : 'Breastplate',
	description : "A rather modest breastplate, covering only the top of your chest.",
	slots : [Asset.Slots.upperbody],
	tags : [],
	materials : [m.plateCopper,m.plateSoftsilver,m.plateSteel],
	svStats : {[Action.Types.physical] : 1},
	bonStats : {},
	size : 0.6,
}));
Assets.push(new AssetTemplate({
	name : 'Crotchplate',
	description : "A rather modest crotchplate, covering only your groin and half your butt.",
	slots : [Asset.Slots.lowerbody],
	tags : [stdTags.asWaistband],
	materials : [m.plateCopper,m.plateSoftsilver,m.plateSteel],
	svStats : {[Action.Types.physical] : 1},
	bonStats : {},
	size : 0.3
}));
Assets.push(new AssetTemplate({
	name : 'Half-robe',
	description : "A robe ending above your hips, with a cloth flap hanging down in front of your groin and rear.",
	slots : [Asset.Slots.upperbody],
	tags : [stdTags.asRobe,stdTags.asCrotchFlap,stdTags.asButtFlap],
	materials : [m.cotton,m.silk,m.mageweave,m.shadowcloth],
	bonStats : {[Action.Types.elemental] : 1},
	size : 1.1,
}));
Assets.push(new AssetTemplate({
	name : 'Loincloth',
	description : "A loincloth covering your groin, with a thong underneath it.",
	slots : [Asset.Slots.lowerbody],
	tags : [stdTags.asRobe,stdTags.asCrotchFlap,stdTags.asButtFlap,stdTags.asThong,stdTags.asWaistband],
	materials : [m.rawhide,m.cotton,m.silk,m.shadowcloth],
	bonStats : {[Action.Types.elemental] : 1},
	size : 0.4,
}));













/* CONSUMABLES */




export {Materials};
export default Assets;
