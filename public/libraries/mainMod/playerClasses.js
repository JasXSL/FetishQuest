import Action from "../../classes/Action.js";
import Player from "../../classes/Player.js";

const lib = {
    "none": {
        name : "NONE",
        primaryStat : "none",
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
        primaryStat : "stamina",
        svPhysical : 3,
        svElemental : 0,
        svHoly : 0,
        svCorruption : -1,
        bonPhysical : 3,
        bonElemental : 0,
        bonHoly : 0,
        bonCorruption : -1,
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
        primaryStat : "agility",
        svPhysical : 4,
        svElemental : -1,
        svHoly : 0,
        svCorruption : 1,
        bonPhysical : 3,
        bonElemental : -1,
        bonHoly : 0,
        bonCorruption : -2,
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
        primaryStat : "intellect",
        svPhysical : 0,
        svElemental : 2,
        svHoly : 0,
        svCorruption : 0,
        bonPhysical : 0,
        bonElemental : 2,
        bonHoly : 0,
        bonCorruption : 0,
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
        primaryStat : "undefined",
        svPhysical : 1,
        svElemental : 0,
        svHoly : -2,
        svCorruption : 3,
        bonPhysical : 2,
        bonElemental : -1,
        bonHoly : -1,
        bonCorruption : 2,
        description : "A stealthy class, there are no places a rogue can't enter, especially clothes. Rogues are good if you're into teasing and humiliation of your enemy.",
        label : "rogue",
        isMonsterClass : false,
        actions : [
            "rogue_exploit",
            "rogue_corruptingPoison",
            "rogue_dirtyTricks"
        ]
    },
    "cleric": {
        name : "Cleric",
        primaryStat : "stamina",
        svPhysical : 2,
        svElemental : 0,
        svHoly : 2,
        svCorruption : 2,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : 2,
        bonCorruption : -4,
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
        primaryStat : "intellect",
        svPhysical : 0,
        svElemental : 2,
        svHoly : -2,
        svCorruption : 3,
        bonPhysical : 0,
        bonElemental : 0,
        bonHoly : -3,
        bonCorruption : 4,
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
        primaryStat : "agility",
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
        primaryStat : Player.primaryStats.intellect,
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
        primaryStat : "agility",
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
        primaryStat : Player.primaryStats.intellect,
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
        ]
    },
    guardian_demon_breaker : {
        name : "Breaker",
        primaryStat : Player.primaryStats.stamina,
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
        primaryStat : Player.primaryStats.agility,
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
        primaryStat : Player.primaryStats.stamina,
        isMonsterClass : true,
        actions : [
            "crab_claw_pinch",
            "crab_claw_tug",
        ]
    },
    MQ00_Boss : {
        name : "Nethermancer",
        primaryStat : Player.primaryStats.intellect,
        description : "",
        isMonsterClass : true,
        actions : [
            'imp_demonicPinch',
            'tentacle_pit', // tentacle_pit : Places a tentacle pit between the caster and players. Using a melee attack against the caster will trap the first player for 3 turns.
        ]
    },
    skeleton : {
        name : "",
        primaryStat : Player.primaryStats.agility,
        description : "",
        isMonsterClass : true,
        actions : [
            'skeleton_looseHand',
            'lowBlow'
        ]
    },
    groper : {
        name : "Shambler",
        primaryStat : Player.primaryStats.stamina,
        isMonsterClass : true,
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
        primaryStat : Player.primaryStats.intellect,
        isMonsterClass : true,
        intellect : 2,
        actions : [
            "tentacle_fiend_legWrap",
            "tentacle_fiend_tentatug",
            "groper_leg_spread",
            "groper_sap_squeeze",
            "groper_sap_inject",
        ]
    },

    lamprey : {
        name : "Lamprey",
        primaryStat : Player.primaryStats.agility,
        isMonsterClass : true,
        actions : [
            "lamprey_slither",      // slither into a target's clothes, doing corruption damage
            "leech",        // Sucks on your target's exposed genitals, doing corruption damage and stealing HP
            "lamprey_shock",        // Does elemental damage and interrupts 
        ]
    },

    anemone : {
        name : "Tickler",
        primaryStat : Player.primaryStats.stamina,
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
        primaryStat : Player.primaryStats.stamina,
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
