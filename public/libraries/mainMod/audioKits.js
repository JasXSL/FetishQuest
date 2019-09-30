const lib = {
    "battleStart": {
        label : "battleStart",
        sounds : [
            {
                s : {
                    path : "media/audio/battle_start.ogg",
                    volume : 0.5
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "battleFinished": {
        label : "battleFinished",
        sounds : [
            {
                s : {
                    path : "media/audio/battle_finished.ogg",
                    volume : 0.5
                },
                t : 500,
                se : false
            }
        ],
        
    },
    "knockout": {
        label : "knockout",
        sounds : [
            {
                s : {
                    path : "media/audio/knockout.ogg",
                    volume : 0.5
                },
                t : 250,
                se : false
            }
        ],
        
    },
    "spellFail": {
        label : "spellFail",
        sounds : [
            {
                s : {
                    path : "media/audio/spell_fail.ogg",
                    volume : 0.3
                },
                t : 0,
                se : true
            }
        ],
        
    },
    punchGeneric: {
        label : "punchGeneric",
        sounds : [
            {
                s : { path : "media/audio/swing_small.ogg", volume : 0.2 },
                se : true
            },
            {
                s : { path : "media/audio/basic_punch.ogg", volume : 0.5, hit: true },
                t : 100,
            }
        ],
    },
    throwGenericSender : {
        sounds : [{
            s : { path : "media/audio/swing_small.ogg", volume : 0.3 },
            se : true
        }],
    },
    throwRockImpact : {
        sounds : [{
            s : { path : "media/audio/rock_hit.ogg", volume : 0.3 }
        }],
    },
    slapGeneric: {
        label : "slapGeneric",
        sounds : [
            {
                s : { path : "media/audio/swing_small.ogg", volume : 0.2 },
                se : true
            },
            {
                s : { path : "media/audio/slap.ogg", volume : 0.5, hit:true },
                t : 100,
            }
        ],
    },
    slapNoSwing: {
        sounds : [
            {
                s : { path : "media/audio/slap.ogg", volume : 0.5 },
            },
        ],
    },
    tickleGeneric: {
        sounds : [
            {
                s : { path : "media/audio/tickle.ogg",volume : 0.2 },
            }
        ],
    },
    enrage: {
        sounds : [
            {
                s : { path : "media/audio/enrage.ogg",volume : 0.5 },
            }
        ],
    },
    earthShield: {
        sounds : [
            {
                s : { path : "media/audio/earth_shield.ogg",volume : 0.3 },
            }
        ],
    },
    riptide: {
        sounds : [
            {
                s : { path : "media/audio/riptide.ogg",volume : 0.4 },
            }
        ],
    },

    circleOfHarmony : {
        sounds : [
            {
                s : { path : "media/audio/circle_of_harmony.ogg",volume : 0.4 },
            }
        ],
    },
    roots : {
        sounds : [
            {
                s : { path : "media/audio/roots.ogg",volume : 0.4 },
            }
        ],
    },
    skitteringSwarm : {
        sounds : [
            {
                s : { path : "media/audio/skittering_swarm.ogg",volume : 0.4 },
            }
        ],
    },
    stingingSwarm : {
        sounds : [
            {
                s : { path : "media/audio/stinging_swarm.ogg",volume : 0.4 },
            }
        ],
    },

    waterCharged: {
        sounds : [
            {
                s : { path : "media/audio/water_charge.ogg",volume : 0.3 },
            }
        ],
    },

    
    "squeezeGeneric": {
        label : "squeezeGeneric",
        sounds : [
            {
                s : {
                    path : "media/audio/squeeze_hands.ogg",
                    volume : 0.5
                },
                t : 0,
                se : false
            }
        ],
        
    },
    stretchGeneric: {
        sounds : [
            {
                s : {path : "media/audio/cloth_stretch.ogg",volume : 0.5},
            }
        ],
        
    },
    rummage: {
        sounds : [
            {
                s : {path : "media/audio/rummage.ogg",volume : 0.5},
            }
        ],
    },
    whipPickup: {
        sounds : [
            {
                s : {path : "media/audio/whip_pickup.ogg",volume : 0.5},
            }
        ],
    },
    "thrustCum": {
        label : "thrustCum",
        sounds : [
            {
                s : {
                    path : "media/audio/thrust_cum.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    slowThrusts: {
        sounds : [
            {
                s : {
                    path : "media/audio/slow_thrusts.ogg",
                    volume : 0.4
                },
            }
        ],
    },
    clawRip: {
        sounds : [
            {
                s : {
                    path : "media/audio/claw_rip.ogg",
                    volume : 0.4
                },
            }
        ],
    },
    "biteGeneric": {
        label : "biteGeneric",
        sounds : [
            {
                s : {
                    path : "media/audio/bite.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    pinchGeneric: {
        sounds : [
            {
                s : {path : "media/audio/pinch.ogg",volume : 0.4},
            }
        ], 
    },
    "poisonGeneric": {
        label : "poisonGeneric",
        sounds : [
            {
                s : {
                    path : "media/audio/poison.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "holyGeneric": {
        label : "holyGeneric",
        sounds : [
            {
                s : {
                    path : "media/audio/holy_generic.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "holyChastise": {
        label : "holyChastise",
        sounds : [
            {
                s : {
                    path : "media/audio/chastise.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "holySmite": {
        label : "holySmite",
        sounds : [
            {
                s : {
                    path : "media/audio/smite.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    holyResurrection : {
        sounds : [
            {
                s : {path : "media/audio/resurrection.ogg",volume : 0.6}
            }
        ],
        
    },
    holyAOE : {
        sounds : [
            {
                s : {path : "media/audio/holy_aoe.ogg",volume : 0.5}
            }
        ],
        
    },
    penance : {
        sounds : [
            {
                s : {path : "media/audio/penance.ogg",volume : 0.25}
            }
        ],
        
    },
    holyCharged : {
        sounds : [
            {
                s : {path : "media/audio/holy_charged.ogg",volume : 0.25}
            }
        ],
        
    },
    "monkKick": {
        label : "monkKick",
        sounds : [
            {
                s : {
                    path : "media/audio/swing_small.ogg",
                    volume : 0.2
                },
                t : 0,
                se : true
            },
            {
                s : {
                    path : "media/audio/monk_roundkick_hit.ogg",
                    "hit": true,
                    volume : 0.5
                },
                t : 100,
                se : false
            }
        ],
        
    },
    interrupt : {
        sounds : [
            {
                s : {path : "media/audio/interrupt.ogg",volume : 1}
            }
        ],
    },
    "darkPunch": {
        label : "darkPunch",
        sounds : [
            {
                s : {
                    path : "media/audio/swing_small.ogg",
                    volume : 0.2
                },
                t : 0,
                se : true
            },
            {
                s : {
                    path : "media/audio/dark_punch.ogg",
                    volume : 0.5,
                    "hit": true
                },
                t : 100,
                se : false
            }
        ],
        
    },
    healingPunch: {
        sounds : [
            {
                s : {path : "media/audio/swing_small.ogg",volume : 0.2},
                t : 0, 
                se : true
            },
            {
                s : {path : "media/audio/healing_punch.ogg",volume : 0.5,hit: true},
                t : 100,
                se : false
            }
        ],
    },
    monkMeditate: {
        sounds : [
            {
                s : {path : "media/audio/monk_meditate.ogg",volume : 0.4},
            }
        ],
    },
    coldBlast_cast : {
        follow_parts : true,
        sounds : [
            {
                s : { path : "media/audio/cold_blast.ogg",volume : 0.5 },
                se : true
            }
        ],
    },
    coldBlast_hit : {
        sounds : [
            {
                s : { path : "media/audio/ice_hit.ogg",volume : 0.5 },
                se : false
            }
        ],
    },
    "waterHealing": {
        label : "waterHealing",
        sounds : [
            {
                s : {
                    path : "media/audio/water_healing.ogg",
                    volume : 0.5
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "waterSpell": {
        label : "waterSpell",
        sounds : [
            {
                s : {
                    path : "media/audio/water_spell.ogg",
                    volume : 0.5
                },
                t : 0,
                se : false
            }
        ],
        
    },
    waterSplash: {
        sounds : [{
            s : {path : "media/audio/water_splash.ogg",volume : 0.5},
        }],
    },
    whipGeneric: {
        sounds : [
            {
                s : { path : "media/audio/whip_swing.ogg", volume : 1 },
                t : 0,
                se : true
            },
            {
                s : { path : "media/audio/whip_snap.ogg", volume : 0.5, hit: true },
                t : 300,
                se : false
            }
        ],
    },
    "tentacleWhip": {
        label : "tentacleWhip",
        sounds : [
            {
                s : {
                    path : "media/audio/tentacle_lash_pre.ogg",
                    volume : 0.5
                },
                t : 0,
                se : true
            },
            {
                s : {
                    path : "media/audio/tentacle_lash_post.ogg",
                    volume : 0.75,
                    "hit": true
                },
                t : 10,
                se : false
            }
        ],
        
    },
    "tentacleTwist": {
        label : "tentacleTwist",
        sounds : [
            {
                s : {
                    path : "media/audio/tentacle_twist_better.ogg",
                    volume : 0.75
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "tentacleStretch": {
        label : "tentacleStretch",
        sounds : [
            {
                s : {
                    path : "media/audio/tentacle_stretch_better.ogg",
                    volume : 0.75,
                    "hit": true
                },
                t : 0,
                se : false
            }
        ],
        
    },
    tentacleStretchWhip: {
        sounds : [
            {
                s : {
                    path : "media/audio/tentacle_lash_pre.ogg",
                    volume : 0.5
                },
                t : 0,
                se : true
            },
            {
                s : {
                    path : "media/audio/tentacle_stretch_better.ogg",
                    volume : 0.75
                },
                t : 50,
                se : false
            },
            {
                s : {
                    path : "media/audio/whip_snap.ogg",
                    volume : 0.75,
                    "hit": true
                },
                t : 600,
                se : false
            }
        ],
        
    },
    tentacleZap: {
        sounds : [
            {
                s : {path : "media/audio/tentacle_zap.ogg",volume : 0.4},
            }
        ],
    },
    tentacleMultipleThrusts: {
        sounds : [
            {
                s : {path : "media/audio/tentacle_thrust_multi.ogg",volume : 0.5},
            }
        ],
    },
    "tentacleSuction": {
        label : "tentacleSuction",
        sounds : [
            {
                s : {
                    path : "media/audio/tentacle_suction.ogg",
                    volume : 0.5
                },
                t : 0,
                se : false
            }
        ],
        
    },
    tentacleSuctionFollow : {
        follow_parts : true,
        sounds : [
            {
                s : {path : "media/audio/tentacle_suction.ogg",volume : 0.5},
                se : false
            }
        ],
        
    },
    darkMagic : {
        follow_parts : true,
        sounds : [
            {
                s : {path : "media/audio/dark_magic.ogg",volume : 0.5},
                se : false
            }
        ],
    },
    darkTentacleGrab : {
        follow_parts : true,
        sounds : [
            {
                s : {path : "media/audio/dark_tentacle_grab.ogg",volume : 0.5},
                se : false
            }
        ],
    },
    gooRub: {
        sounds : [
            {
                s : {path : "media/audio/goo_rub.ogg",volume : 0.3},
            }
        ],
    },
    gooSplat : {
        sounds : [
            {
                s : {path : "media/audio/goo_impact.ogg",volume : 0.5},
            }
        ],
    },
    steal : {
        sounds : [
            {
                s : {path : "media/audio/steal.ogg",volume : 0.5},
            }
        ],
    },

    tripwire_hit : {
        sounds : [
            {
                s : {path : "media/audio/tripwire_hit.ogg",volume : 0.5},
            }
        ],
    },
    
    tripwire_set : {
        sounds : [
            {
                s : {path : "media/audio/tripwire_set.ogg",volume : 0.3},
            }
        ],
    },

    grease : {
        sounds : [
            {
                s : {path : "media/audio/grease.ogg",volume : 0.3},
            }
        ],
    },
    infusion : {
        sounds : [
            {
                s : {path : "media/audio/infusion.ogg",volume : 0.3},
            }
        ],
    },
    slimeWard : {
        sounds : [
            {
                s : {path : "media/audio/slimeward.ogg",volume : 0.3},
            }
        ],
    },
    
    monkHeal : {
        sounds : [
            {
                s : {path : "media/audio/monk_heal.ogg",volume : 0.5},
            }
        ],
    },
    "squishTiny": {
        label : "squishTiny",
        sounds : [
            {
                s : {
                    path : "media/audio/tiny_squish.ogg",
                    volume : 0.25
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "squishLong": {
        label : "squishLong",
        sounds : [
            {
                s : {
                    path : "media/audio/good_squish_long.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "warriorShield": {
        label : "warriorShield",
        sounds : [
            {
                s : {
                    path : "media/audio/warrior_shield.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    potionUse: {
        sounds : [{
            s : {path : "media/audio/potion_use.ogg",volume : 0.4},
            t : 0,
            se : false
        }],
    },
    glassBreak: {
        sounds : [{
            s : {path : "media/audio/glass_break.ogg",volume : 0.4},
            t : 0,
            se : false
        }],
    },
    gong: {
        sounds : [{
            s : {path : "media/audio/gong.ogg",volume : 0.4},
            t : 0,
            se : false
        }],
    },
    levelup: {
        sounds : [{
            s : {path : "media/audio/fq_levelup.ogg",volume : 0.5},
        }],
    },
    "questCompleted": {
        label : "questCompleted",
        sounds : [
            {
                s : {
                    path : "media/audio/questhandin.ogg",
                    volume : 0.7
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "questPickup": {
        label : "questPickup",
        sounds : [
            {
                s : {
                    path : "media/audio/quest_pickup.ogg",
                    volume : 0.7
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "repair": {
        label : "repair",
        sounds : [
            {
                s : {
                    path : "media/audio/item_repair.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    shopRepair: {
        sounds : [
            {s : {path : "media/audio/armor_repair.ogg",volume : 0.4}}
        ],
    },

    "armorBreak": {
        label : "armorBreak",
        sounds : [
            {
                s : {
                    path : "media/audio/cloth_rip.ogg",
                    volume : 0.6
                },
                t : 200,
                se : false
            }
        ],
        
    },
    "lootRepairKit": {
        label : "lootRepairKit",
        sounds : [
            {
                s : {
                    path : "media/audio/repair_kit.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "lootPotion": {
        label : "lootPotion",
        sounds : [
            {
                s : {
                    path : "media/audio/potion_pickup.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "lootPlate": {
        label : "lootPlate",
        sounds : [
            {
                s : {
                    path : "media/audio/plate_pickup.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "lootMail": {
        label : "lootMail",
        sounds : [
            {
                s : {
                    path : "media/audio/mail_pickup.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "lootLeather": {
        label : "lootLeather",
        sounds : [
            {
                s : {
                    path : "media/audio/leather_pickup.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    "lootCloth": {
        label : "lootCloth",
        sounds : [
            {
                s : {
                    path : "media/audio/cloth_pickup.ogg",
                    volume : 0.4
                },
                t : 0,
                se : false
            }
        ],
        
    },
    coins_pickup : {
        sounds : [
            {
                s : {
                    path : "media/audio/coins_pickup.ogg",
                    volume : 0.4
                },
            }
        ],
    },
    coins_pickup : {
        sounds : [
            {
                s : {
                    path : "media/audio/coins_pickup.ogg",
                    volume : 0.4
                },
            }
        ],
    },
    loot_herb : {
        sounds : [
            {
                s : {
                    path : "media/audio/herb_pickup.ogg",
                    volume : 0.4
                },
            }
        ],
    },
    loot_sharkanium : {
        sounds : [{
            s : {path : "media/audio/sharkanium_pickup.ogg",volume : 0.4},
        }],
    },
    loot_rock : {
        sounds : [{
            s : {path : "media/audio/rock_pickup.ogg",volume : 0.4},
        }],
    },
    loot_gem : {
        sounds : [{
            s : {path : "media/audio/gem_pickup.ogg",volume : 0.4},
        }],
    },

    buy_item : {
        sounds : [{
            s : {path: "media/audio/buy.ogg", volume: 0.4},
        }],
    },
    exchange : {
        sounds : [{
            s : {path: "media/audio/sell.ogg", volume: 0.4},
        }],
    },
    sell_item : {
        sounds : [{
            s : {path: "media/audio/exchange.ogg", volume: 0.4},
        }],
    },


    berryGrab : {
        sounds : [
            {
                s : {
                    path : "media/audio/berry_grab.ogg",
                    volume : 0.4
                }
            }
        ],
        
    },
    berryHeal : {
        sounds : [
            {
                s : {
                    path : "media/audio/manaberry.ogg",
                    volume : 0.4
                }
            }
        ],
        
    },

    drink_generic : {
        sounds : [{
            s : {path : "media/audio/drink_generic.ogg",volume : 0.4}
        }],
    },
    eat_generic : {
        sounds : [{
            s : {path : "media/audio/eat_generic.ogg",volume : 0.4}
        }],
    },
    food_pickup : {
        sounds : [{
            s : {path : "media/audio/food_pickup.ogg",volume : 0.4}
        }],
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

