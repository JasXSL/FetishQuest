import PlayerClass from '../classes/PlayerClass.js';
import Player from '../classes/Player.js';

const out = [
	// A flat monster class
	new PlayerClass({
		label : 'none',
		name  : 'NONE'
	}),
	// Warrior
	new PlayerClass({
		label : 'warrior',
		name : 'Warrior',
		description : 'Standing toe to toe with their enemy, warriors enjoy both receiving and dealing out punishment. Good for sadomasochists.',
		isMonsterClass : false,
		primaryStat : Player.primaryStats.stamina,		// Grants 50% bonus to this stat effect
		actions : ['warrior_revenge', 'warrior_bolster', 'warrior_viceGrip'],
		// 2 bonus points, but can be countered by negative
		svPhysical : 3,
		svElemental : 0,
		svHoly : 0,
		svCorruption : -1,

		bonPhysical : 3,
		bonElemental : 0,
		bonHoly : 0,
		bonCorruption : -1
	}),
	// Monk
	new PlayerClass({
		label : 'monk',
		name : 'Monk',
		description : 'A lightweight martial artist who primarily deals damage, monks can also heal their friends and weaken enemeies. Good for exhibitionists.',
		primaryStat :  Player.primaryStats.agility,
		actions : ['monk_roundKick','monk_disablingStrike','monk_upliftingStrike'],
		svPhysical : 4,
		svElemental : -1,
		svHoly : 0,
		svCorruption : 1,

		bonPhysical : 3,
		bonElemental : -1,
		bonHoly : 0,
		bonCorruption : -2
	}),
	// Elementalist
	new PlayerClass({
		label : 'elementalist',
		name : 'Elementalist',
		description : 'An adept of the elemental ways, elementalists are good healers and damage dealers. Good for those into electrostim and breathplay.',
		primaryStat : Player.primaryStats.intellect,
		actions : ['elementalist_iceBlast','elementalist_healingSurge','elementalist_waterSpout'],

		svPhysical : 0,
		svElemental : 2,
		svHoly : 0,
		svCorruption : 0,

		bonPhysical : 0,
		bonElemental : 2,
		bonHoly : 0,
		bonCorruption : 0
	}),
	// Rogue
	new PlayerClass({
		label : 'rogue',
		name : 'Rogue',
		description : 'A stealthy class, there are no places a rogue can\'t enter, especially clothes. Rogues are good if you\'re into teasing and humiliation of your enemy.',
		primaryStat : Player.primaryStats.corruption,
		actions : ['rogue_exploit','rogue_corruptingPoison','rogue_dirtyTricks'],

		svPhysical : 1,
		svElemental : 0,
		svHoly : -2,
		svCorruption : 3,

		bonPhysical : 2,
		bonElemental : -1,
		bonHoly : -1,
		bonCorruption : 2
	}),
	// Cleric
	new PlayerClass({
		label : 'cleric',
		name : 'Cleric',
		description : 'Upholding the morals, clerics chastise their enemies and make highly potent healers. Clerics may interest players into chastity and bondage.',
		primaryStat : Player.primaryStats.stamina,
		actions : ['cleric_heal','cleric_chastise','cleric_smite'],
		
		svPhysical : 2,
		svElemental : 0,
		svHoly : 2,
		svCorruption : 2,

		bonPhysical : 0,
		bonElemental : 0,
		bonHoly : 2,
		bonCorruption : -4
	}),
	// Tentaclemancer
	new PlayerClass({
		label : 'tentaclemancer',
		name : 'Tentaclemancer',
		description : 'Tentaclemancers summon forth slithering assailants from the nether realms. Good if you enjoy tentacles.',
		primaryStat : Player.primaryStats.intellect,
		actions : ['tentaclemancer_tentacleWhip','tentaclemancer_corruptingOoze','tentaclemancer_siphonCorruption'],

		svPhysical : 0,
		svElemental : 2,
		svHoly : -2,
		svCorruption : 3,

		bonPhysical : 0,
		bonElemental : 0,
		bonHoly : -3,
		bonCorruption : 4
	}),




	// MONSTER CLASSES

	// tentacle fiend
	new PlayerClass({
		isMonsterClass : true,
		label : 'tentacle_fiend',
		name : 'Tentacle Fiend',
		primaryStat : Player.primaryStats.agility,
		actions : ['tentacle_fiend_legWrap','tentacle_fiend_tentacleMilker', 'tentacle_fiend_injectacle', 'tentacle_fiend_tentatug'],
	}),

	// mimic
	new PlayerClass({
		isMonsterClass : true,
		label : 'mimic',
		name : 'Mimic',
		primaryStat : Player.primaryStats.agility,
		actions : ['tentacle_fiend_legWrap','tentacle_fiend_tentacleMilker', 'tentacle_fiend_tentatug'],
	}),

	// Imp
	new PlayerClass({
		isMonsterClass : true,
		label : 'imp',
		name : 'Imp',
		primaryStat : Player.primaryStats.intellect,
		actions : ['imp_specialDelivery','imp_blowFromBelow', 'imp_ankleBite', 'imp_demonicPinch', 'whip_legLash', 'whip_powerLash'],
	}),

];


export default out;