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
        isMonsterClass : false,
        actions : []
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
        isMonsterClass : false,
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
        isMonsterClass : false,
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
        isMonsterClass : false,
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
        isMonsterClass : false,
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
        isMonsterClass : false,
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
        isMonsterClass : false,
        actions : [
            "tentaclemancer_tentacleWhip",
            "tentaclemancer_corruptingOoze",
            "tentaclemancer_siphonCorruption"
        ]
    },
    "tentacle_fiend": {
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
        isMonsterClass : true,
        actions : [
            "tentacle_fiend_legWrap",
            "tentacle_fiend_tentacleMilker",
            "tentacle_fiend_injectacle",
            "tentacle_fiend_tentatug",
        ]
	},
	"shocktacle": {
        name : "Shocktacle",
        description : "",
        isMonsterClass : true,
        actions : [
            "tentacle_fiend_tentatug",
            "tentacle_ride",
            "shocktacle_zap",
        ]
    },
    "mimic": {
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
        isMonsterClass : true,
        actions : [
            "tentacle_fiend_legWrap",
            "tentacle_fiend_tentacleMilker",
            "tentacle_fiend_tentatug",
        ]
    },
    "imp": {
        name : "Imp",
        description : "",
        label : "imp",
        isMonsterClass : true,
        actions : [
            "imp_specialDelivery",
            "imp_blowFromBelow",
            "imp_ankleBite",
            "imp_demonicPinch",
            "whip_legLash",
			"whip_powerLash",
            "imp_claws",
            "low_blow"
        ]
    },
    guardian_demon_breaker : {
        name : "Breaker",
        description : "",
        isMonsterClass : true,
        actions : [
            "guardian_demon_consume",       // Lifts a grappled, exposed player off the ground, doing corruption damage and healing the caster based on target arousal
            "guardian_demon_impale",        // Impale a grappled and exposed player, doing 5 corruption damage and extending the grapple by 2 turns
            "guardian_demon_expose",        // Does 1 lowerbody cloth damage and exposes their lowerbody
            "guardian_demon_remoteDelivery",      // flings cum at your target, doing 
            "whip_legLash",
            "whip_powerLash",
        ]
    },
    cocktopus : {
        name : "Cocktopus",
        isMonsterClass : true,
        actions : [
            "tentacle_fiend_legWrap",
            "tentacle_fiend_tentatug",
            "tentacle_latch",
            "cocktopus_ink",
            "cocktopus_inkject",
        ]
    },
    tentacrab : {
        name : "Pincher",
        isMonsterClass : true,
        actions : [
            "crab_claw_pinch",
            "crab_claw_tug",
        ]
    },
    MQ00_Boss : {
        name : "Nethermancer",
        description : "",
        isMonsterClass : true,
        actions : [
            'imp_demonicPinch',
            'tentacle_pit', // tentacle_pit : Places a tentacle pit between the caster and players. Using a melee attack against the caster will trap the first player for 3 turns.
        ]
    },
    skeletonRattler : {
        name : "Rattler",
        description : "A regular skeleton with bony hands.",
        isMonsterClass : true,
        name_type : PlayerClass.NameType.Suffix,
        actions : [
            'skeleton_looseHand',
            'lowBlow',
            'boneRattle',           // Todo - tugs at your target's lower body armor and rattles, doing 3 corruption damage with a 30% chance of 1 armor damage
        ],
        stamina : 3,
    },
    skeletonMage : {
        name : "Mage",
        description : "Skeletal spells usually involve bones or milk, or both!",
        isMonsterClass : true,
        name_type : PlayerClass.NameType.Suffix,
        actions : [
            'skeleton_looseHand',
            'boneShards',           // Todo attack with bone shards, doing physical damage at a range
            'boneRattle',   
            'hexArmor',             // Todo Hexes target's armor, giving it a 40% chance to vibrate and add 1 arousal when they use a melee ability
        ],
        intellect : 2,
    },
    

    ghoulRavener : {
        name : "Ravener",
        description : "It hungers.",
        isMonsterClass : true,
        name_type : PlayerClass.NameType.Suffix,
        actions : [
            'pounce',       // Todo Grapples a player on the ground until they manually break free
            'ghoulMunch',   // Todo Munch on target's groin, doing armor damage or stealing health
            'ghoulSpit',    // Todo Spits goo at your target, doing elemental damage immediately and every round for 3 rounds
        ]
    },
    groper : {
        player_icon : '',
        name_type : PlayerClass.NameType.Suffix,
        name : "Lasher",
        isMonsterClass : true,
        description : 'This groper has a multitude of extra tendrils flailing about!',
        actions : [
            "tentacle_fiend_legWrap",
            "tentacle_fiend_tentatug",
            "groper_leg_spread",
            "groper_groin_lash",
            "groper_groin_grope"
        ]
    },
    groper_sapbeast : {
        name : "Sapbeast",
        player_icon : '',
        description : 'This groper has a couple of thicker sap-coated tendrils.',
        name_type : PlayerClass.NameType.Suffix,
        isMonsterClass : true,
        intellect : 2,
        actions : [
            "tentacle_fiend_legWrap",
            "groper_leg_spread",
            "groper_sap_squeeze",
            "groper_sap_inject",
        ]
    },
    groper_infested : {
        name : "Infested",
        player_icon : '',
        name_type : PlayerClass.NameType.Prefix,
        description : 'This groper seems to be half hollowed out and has a nest of skittering insects living in it!',
        isMonsterClass : true,
        stamina : -4,
        agility : 2,
        actions : [
            "groper_root",          // using melee attacks has a chance of stripping
            "groper_skittering_swarm",     // Todo: Covers a player in a skittering swarm for 2 turns, reducing physical proficiency and arouses at the start of each turn. Lasts 2 turns.
            "groper_stinging_swarm",      // Todo: Deals physical damage to all players
        ]
    },

    lamprey : {
        name : "Lamprey",
        isMonsterClass : true,
        actions : [
            "lamprey_slither",      // slither into a target's clothes, doing corruption damage
            "leech",        // Sucks on your target's exposed genitals, doing corruption damage and stealing HP
            "lamprey_shock",        // Does elemental damage and interrupts 
        ]
    },

    anemone : {
        name : "Tickler",
        isMonsterClass : true,
        powered: true,
        actions : [
            "anemone_grab",         // Grapple a player
            "anemone_tickle",       // Tickle a player for corruption damage and +1 arousal
            "anemone_restrain",     // Restrain a grabbed player, stunning them for 1 turn and lowering their svPhys/svCorruption
            "leech",                // Same as lamprey
        ]
    },

    sharktopus : {
        name : "Tentacler",
        isMonsterClass : true,
        actions : []
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
