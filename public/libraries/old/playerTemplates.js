import PlayerTemplate from '../classes/templates/PlayerTemplate.js';
import stdTag from './stdTag.js';
import Player from '../classes/Player.js';
import Action from '../classes/Action.js';

const out = [];
// Tentacle fiends
out.push(new PlayerTemplate({
	label : 'lesser_tentacle_fiend',
	name : 'Lesser Tentacle Fiend',
	icon : '',
	classes : ['tentacle_fiend'],
	max_actions : 1,
	tags : [stdTag.plBeast, stdTag.plTentacles],
	min_level : 1,
	max_level : 5,
	difficulty : 0.6,
	submissive_max : 0,
	primary_stats : {
		[Player.primaryStats.stamina] : -4,
		[Player.primaryStats.agility] : 2
	},
	sv : {
		[Action.Types.elemental] : -2,
		[Action.Types.holy] : -4,
	},
	bon : {
		[Action.Types.corruption] : 2
	},
	viable_asset_materials : [],
	min_size : 0,
	max_size : 1,
	intelligence_min : 0.2,
	intelligence_max : 0.3,
}));
out.push(new PlayerTemplate({
	label : 'tentacle_fiend',
	name : 'Tentacle Fiend',
	icon : '',
	difficulty : 0.75,
	classes : ['tentacle_fiend'],
	max_actions : 2,
	tags : [stdTag.plBeast, stdTag.plTentacles],
	min_level : 4,
	max_level : 10,
	primary_stats : {
		[Player.primaryStats.agility] : 2
	},
	sv : {
		[Action.Types.elemental] : -2,
		[Action.Types.holy] : -4,
	},
	bon : {
		[Action.Types.corruption] : 3,
	},
	viable_asset_materials : [],
	submissive_max : 0,
	intelligence_min : 0.2,
	intelligence_max : 0.3,
}));
out.push(new PlayerTemplate({
	label : 'greater_tentacle_fiend',
	name : 'Greater Tentacle Fiend',
	icon : '',
	classes : ['tentacle_fiend'],
	max_actions : 4,
	tags : [stdTag.plBeast, stdTag.plTentacles],
	min_level : 8,
	max_level : 15,
	primary_stats : {
		[Player.primaryStats.stamina] : 3,
		[Player.primaryStats.agility] : 4
	},
	sv : {
		[Action.Types.elemental] : -2,
		[Action.Types.holy] : -4,
	},
	bon : {
		[Action.Types.corruption] : 4,
		[Action.Types.physical] : 2
	},
	viable_asset_materials : [],
	min_size : 2,
	max_size : 3,
	submissive_max : 0,
	intelligence_min : 0.3,
	intelligence_max : 0.4,
}));




// Imps
out.push(new PlayerTemplate({
	label : 'stunted_imp',
	name : 'Stunted Imp',
	icon : '',
	classes : ['imp'],
	description : 'A short imp with a pointed tail and little horns.',
	species : 'Imp',
	max_actions : 1,
	tags : [stdTag.penis, stdTag.plHorns, stdTag.plTail],
	min_level : 1,
	max_level : 10,
	difficulty : 0.5,
	primary_stats : {
		[Player.primaryStats.agility] : 1,
		[Player.primaryStats.stamina] : -6,
	},
	sv : {
		[Action.Types.elemental] : -2,
		[Action.Types.holy] : -4,
		[Action.Types.physical] : -1,
	},
	bon : {
		[Action.Types.corruption] : 1,
	},
	viable_consumables : [],
	viable_asset_materials : ['cotton'],
	viable_asset_templates : ['Thong','Shirt','Loincloth'],
	min_size : 0,
	max_size : 0,
	sadistic_min : 0.5,
	sadistic_max : 1,
	dominant_min : 0.8,
	dominant_max : 1,
	hetero_min : 0,
	hetero_max : 1,
	intelligence_min : 0.4,
	intelligence_max : 0.5,
}));
out.push(new PlayerTemplate({
	label : 'imp',
	name : 'Imp',
	icon : '',
	classes : ['imp'],
	description : 'A short imp with a pointed tail and little horns.',
	species : 'Imp',
	max_actions : 2,
	tags : [stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plBigPenis],
	min_level : 3,
	max_level : 10,
	difficulty : 0.8,
	primary_stats : {
		[Player.primaryStats.agility] : 1,
		[Player.primaryStats.stamina] : -4,
		[Player.primaryStats.intellect] : 2,
	},
	sv : {
		[Action.Types.holy] : -4,
	},
	bon : {
		[Action.Types.corruption] : 3
	},
	viable_asset_templates : ['Thong','Shirt','Half-robe','Loincloth'],
	viable_asset_materials : ['cotton', 'leather', 'rawhide'],
	viable_gear : ['simpleWhip'],
	viable_consumables : ['minorHealingPotion'],
	min_size : 0,
	max_size : 1,
	sadistic_min : 0.5,
	sadistic_max : 1,
	dominant_min : 0.8,
	dominant_max : 1,
	hetero_min : 0,
	hetero_max : 1,
	intelligence_min : 0.4,
	intelligence_max : 0.6,
}));
out.push(new PlayerTemplate({
	label : 'darkImp',
	name : 'Dark Imp',
	icon : '',
	classes : ['imp'],
	description : 'A short imp with a pointed tail and little horns, this one is emanating a dark aura and has a sizable member.',
	species : 'Imp',
	max_actions : 3,
	tags : [stdTag.penis, stdTag.plHorns, stdTag.plTail, stdTag.plBigPenis],
	min_level : 6,
	max_level : 15,
	difficulty : 1,
	primary_stats : {
		[Player.primaryStats.agility] : 2,
		[Player.primaryStats.intellect] : 4,
	},
	sv : {
		[Action.Types.holy] : -4,
	},
	bon : {
		[Action.Types.corruption] : 5,
	},
	viable_asset_templates : ['Thong','Shirt','Half-robe','Loincloth'],
	viable_asset_materials : ['rawhide', 'shadowcloth'],
	viable_consumables : ['minorHealingPotion', 'healingPotion'],
	min_size : 0,
	max_size : 1,
	sadistic_min : 0.5,
	sadistic_max : 1,
	dominant_min : 0.8,
	dominant_max : 1,
	hetero_min : 0,
	hetero_max : 1,
	intelligence_min : 0.4,
	intelligence_max : 0.6,
}));


// mimic
out.push(new PlayerTemplate({
	label : 'mimic',
	name : 'Mimic',
	icon : '',
	classes : ['mimic'],
	description : 'A treasure full of tentacles and teeth.',
	species : 'Mimic',
	max_actions : 3,
	tags : [stdTag.plBeast, stdTag.plTentacles, stdTag.plImmobile],
	primary_stats : {
		[Player.primaryStats.agility] : 1,
		[Player.primaryStats.stamina] : 2,
	},
	sv : {
		[Action.Types.corruption] : 4,
		[Action.Types.elemental] : 1,
		[Action.Types.holy] : -1,
		[Action.Types.physical] : 1,
	},
	bon : {
		[Action.Types.corruption] : 2,
	},
	viable_asset_materials : [],
	viable_asset_templates : [],
	min_size : 3,
	max_size : 3,
	submissive_max : 0,
	intelligence_min : 0.2,
	intelligence_max : 0.2,
}));


let kits = {};
kits.demons = [
	'stunted_imp',
	'imp',
	'darkImp',
];
kits.tentacles = [
	'lesser_tentacle_fiend',
	'tentacle_fiend',
	'greater_tentacle_fiend',
];


export {kits};
export default out;
