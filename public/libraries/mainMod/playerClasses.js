import Action from "../../classes/Action.js";
import Player from "../../classes/Player.js";
import PlayerClass from "../../classes/PlayerClass.js";

/*
    4 primary points for each class
    7 secondary points for each class
*/

const lib = {
    "none": {
        name : "NONE",
        svPhysical : 0,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : 0,
        description : "",
        label : "none",
        monster_only : false,
    },
    "warrior": {
        name : "Warrior",
        svPhysical : 4,
        svElemental : 2,
        svHoly : 0,
        svCorruption : -1,
        bonPhysical : 3,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : -1,
        stamina : 4,
        agility : 1,
        intellect : -1,
        description : "Standing toe to toe with their enemy, warriors enjoy both receiving and dealing out punishment. Good for sadomasochists.",
        label : "warrior",
        monster_only : false,
        actions : [
            "warrior_revenge",
            "warrior_bolster",
            "warrior_viceGrip"
        ]
    },
    "monk": {
        name : "Monk",
        svPhysical : 4,
        svElemental : -1,
        svHoly : 0,
        svCorruption : 2,
        bonPhysical : 4,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : -2,
        stamina : 1,
        agility : 2,
        description : "A lightweight martial artist who primarily deals damage, monks can also heal their friends and weaken enemeies. Good for exhibitionists.",
        label : "monk",
        monster_only : false,
        actions : [
            "monk_roundKick",
            "monk_disablingStrike",
            "monk_upliftingStrike"
        ]
    },
    "elementalist": {
        name : "Elementalist",
        svPhysical : 0,
        svElemental : 2,
        svHoly : 0,
        svCorruption : 1,
        bonPhysical : 0,
        bonElemental : 4,
        bonHoly : 0,
        bonCorruption : 0,
        intellect : 2,
        stamina : 1,
        description : "An adept of the elemental ways, elementalists are good healers and damage dealers. Good for those into electrostim and breathplay.",
        label : "elementalist",
        monster_only : false,
        actions : [
            "elementalist_iceBlast",
            "elementalist_healingSurge",
            "elementalist_waterSpout"
        ]
    },
    "rogue": {
        name : "Rogue",
        svPhysical : 2,
        svElemental : 0,
        svHoly : -2,
        svCorruption : 3,
        bonPhysical : 2,
        bonElemental : -1,
        bonHoly : -1,
        bonCorruption : 4,
        description : "A stealthy class, there are no places a rogue can't enter, especially clothes. Rogues are good if you're into teasing and humiliation of your enemy.",
        label : "rogue",
        monster_only : false,
        agility : 3,
        actions : [
            "rogue_exploit",
            "rogue_corruptingPoison",
            "rogue_sneakAttack"
        ]
    },
    "cleric": {
        name : "Cleric",
        svPhysical : 2,
        svElemental : 0,
        svHoly : 2,
        svCorruption : 3,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 4,
        bonCorruption : -4,
        stamina : 1,
        agility : 1,
        intellect : 1,
        description : "Upholding the morals, clerics chastise their enemies and make highly potent healers. Clerics may interest players into chastity and bondage.",
        label : "cleric",
        monster_only : false,
        actions : [
            "cleric_heal",
            "cleric_chastise",
            "cleric_smite"
        ]
    },
    "tentaclemancer": {
        name : "Tentaclemancer",
        svPhysical : 2,
        svElemental : 2,
        svHoly : -4,
        svCorruption : 4,
        bonPhysical : 2,
        bonElemental : 0,
        bonHoly : -3,
        bonCorruption : 4,
        stamina : 2,
        intellect : 1,
        description : "Tentaclemancers summon forth slithering assailants from the nether realms. Good if you enjoy tentacles.",
        label : "tentaclemancer",
        monster_only : false,
        actions : [
            "tentaclemancer_tentacleWhip",
            "tentaclemancer_corruptingOoze",
            "tentaclemancer_siphonCorruption"
        ]
    },



    tentacle_fiend: {
        name : "Tentacle Fiend",
        svPhysical : 0,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : 0,
        description : "",
        label : "tentacle_fiend",
        monster_only : true,
	},
	shocktacle : {
        name : "Shocktacle",
        description : "",
        monster_only : true,
    },
    mimic : {
        name : "Mimic",
        svPhysical : 0,
        svElemental : 0,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : 0,
        description : "",
        label : "mimic",
        monster_only : true,
    },
    impScavenger : {
        name : "Scavenger",
        name_type : PlayerClass.NameType.Suffix,
        description : "An ordinary imp.",
        label : "imp",
        monster_only : true,
    },
    impTrickster : {
        name : "Trickster",
        name_type : PlayerClass.NameType.Suffix,
        description : "An imp that moves more gracefully than normal imps.",
        label : "imp",
        monster_only : true,
    },
    impMage : {
        name : "Mage",
        name_type : PlayerClass.NameType.Suffix,
        description : "An imp with glowing purple runes tattooed on its body.",
        label : "imp",
        monster_only : true,
    },


    goblinScavenger : {
        name : "Scavenger",
        name_type : PlayerClass.NameType.Suffix,
        description : "Adept at survival and utilizing their environment.",
        monster_only : true,
    },
    goblinShaman : {
        name : "Shaman",
        name_type : PlayerClass.NameType.Suffix,
        description : "A being skilled in the primal arts.",
        monster_only : true,
    },


    guardian_demon_breaker : {
        name : "Breaker",
        description : "",
        monster_only : true,
    },
    cocktopus : {
        name : "Cocktopus",
        monster_only : true,
    },
    worm : {
        name : "Burrower",
        monster_only : true,
        actions : [
            // Todo: Add actions
        ]
    },
    tentacrab : {
        name : "Pincher",
        monster_only : true,
    },
    MQ00_Boss : {
        name : "Nethermancer",
        description : "",
        monster_only : true,
    },
    skeletonRattler : {
        name : "Rattler",
        name_type : PlayerClass.NameType.Suffix,
        description : "A regular skeleton with bony hands.",
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
        stamina : 3,
    },
    skeletonMage : {
        name : "Mage",
        name_type : PlayerClass.NameType.Suffix,
        description : "Skeletal spells usually involve bones or milk, or both!",
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
        intellect : 2,
    },
    
    necromancer : {
        name : 'Necromancer',
        description : 'A shadowy summoner of the undead.',
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
        intellect : 2,
    },

    ghoulRavener : {
        name : "Ravener",
        description : "It hungers.",
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
    },
    groper : {
        name_type : PlayerClass.NameType.Suffix,
        name : "Lasher",
        monster_only : true,
        description : 'This groper has a multitude of extra tendrils flailing about!',
    },
    groper_sapbeast : {
        name : "Sapbeast",
        description : 'This groper has a couple of thicker sap-coated tendrils.',
        name_type : PlayerClass.NameType.Suffix,
        monster_only : true,
        intellect : 2,
    },
    groper_infested : {
        name : "Infested",
        name_type : PlayerClass.NameType.Prefix,
        description : 'This groper seems to be half hollowed out and has a nest of skittering insects living in it!',
        monster_only : true,
        stamina : -4,
        agility : 2,
    },

    lamprey : {
        name : "Lamprey",
        monster_only : true,
    },

    anemone : {
        name : "Tickler",
        monster_only : true,
    },

    sharktopus : {
        name : "Tentacler",
        monster_only : true,
    },

    outlaw_brute : {
        name : 'Brute',
        description : 'A barbaric fighter with an intimidating presence!',
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,

        svPhysical : 3,
		svElemental : 2,
		svHoly : 0,
		svCorruption : 0,

		bonPhysical : 3,
		bonElemental : -2,
		bonHoly : -2,
		bonCorruption : -2,

		stamina : 4,
		intellect : -1,
		agility : 2,
    },

    outlaw_rogue : {
        name : 'Rogue',
        description : 'A stealthy, nimble fighter!',
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
        svPhysical : 1,
		svElemental : 0,
		svHoly : 0,
		svCorruption : 3,

		bonPhysical : 2,
		bonElemental : -2,
		bonHoly : -2,
		bonCorruption : 2,

		stamina : 1,
		intellect : 1,
		agility : 2,
    },

    outlaw_tentaclemancer : {
        name : 'Tentaclemancer',
        description : 'A tentacle summoner!',
        monster_only : true,
        name_type : PlayerClass.NameType.Suffix,
        svPhysical : -2,
		svElemental : 2,
		svHoly : -2,
		svCorruption : 3,

		bonPhysical : -2,
		bonElemental : 0,
		bonHoly : -2,
		bonCorruption : 3,

		stamina : -2,
		intellect : 3,
		agility : -1,
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
