import {default as Audio, AudioKit} from '../classes/Audio.js';

const out = {
	_collections : {},	// You can put arrays of collections here

};
const basePath = 'media/audio/';
let kit;

// UI

// turnChanged
	kit = new AudioKit();
	kit.addSound({path : basePath+'turn_changed.ogg', volume : 0.2});
	out.turnChanged = kit;

// battleStart
	kit = new AudioKit();
	kit.addSound({path : basePath+'battle_start.ogg', volume : 0.5});
	out.battleStart = kit;

// battleFinished
	kit = new AudioKit();
	kit.addSound({path : basePath+'battle_finished.ogg', volume : 0.5}, false, 500);
	out.battleFinished = kit;

// knockout
	kit = new AudioKit();
	kit.addSound({path : basePath+'knockout.ogg', volume : 0.5}, false, 250);
	out.knockout = kit;

// spellFail
	kit = new AudioKit();
	kit.addSound({path : basePath+'spell_fail.ogg', volume : 0.3}, true, 0);
	out.spellFail = kit;



// punchGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'swing_small.ogg', volume : 0.2}, true);
	kit.addSound({path : basePath+'basic_punch.ogg', volume : 0.5, hit:true}, false, 100);
	out.punchGeneric = kit;

// slapGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'swing_small.ogg', volume : 0.2}, true);
	kit.addSound({path : basePath+'slap.ogg', volume : 0.5}, false, 100);
	out.slapGeneric = kit;

// tickleGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'tickle.ogg', volume : 0.2});
	out.tickleGeneric = kit;

// squeezeGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'squeeze_hands.ogg', volume : 0.5});
	out.squeezeGeneric = kit;

// stretchGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'cloth_stretch.ogg', volume : 0.5});
	out.stretchGeneric = kit;


// thrustCum
	kit = new AudioKit();
	kit.addSound({path : basePath+'thrust_cum.ogg', volume : 0.4});
	out.thrustCum = kit;


// slowThrusts
	kit = new AudioKit();
	kit.addSound({path : basePath+'slow_thrusts.ogg', volume : 0.4});
	out.slowThrusts = kit;

// biteGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'bite.ogg', volume : 0.4});
	out.biteGeneric = kit;

// pinchGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'pinch.ogg', volume : 0.4});
	out.pinchGeneric = kit;


// poisonGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'poison.ogg', volume : 0.4});
	out.poisonGeneric = kit;



// holyGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'holy_generic.ogg', volume : 0.4});
	out.holyGeneric = kit;

// holyChastise
	kit = new AudioKit();
	kit.addSound({path : basePath+'chastise.ogg', volume : 0.4});
	out.holyChastise = kit;

// monkKick
	kit = new AudioKit();
	kit.addSound({path : basePath+'swing_small.ogg', volume : 0.2}, true);
	kit.addSound({path : basePath+'monk_roundkick_hit.ogg', hit:true, volume : 0.5}, false, 100);
	out.monkKick = kit;

// darkPunch
	kit = new AudioKit();
	kit.addSound({path : basePath+'swing_small.ogg', volume : 0.2}, true);
	kit.addSound({path : basePath+'dark_punch.ogg', volume : 0.5, hit:true}, false, 100);
	out.darkPunch = kit;


// healingPunch
	kit = new AudioKit();
	kit.addSound({path : basePath+'swing_small.ogg', volume : 0.2}, true);
	kit.addSound({path : basePath+'healing_punch.ogg', volume : 0.5, hit:true}, false, 100);
	out.healingPunch = kit;


// coldBlast
	kit = new AudioKit();
	kit.addSound({path : basePath+'cold_blast.ogg', volume : 0.5});
	out.coldBlast = kit;


// waterHealing
	kit = new AudioKit();
	kit.addSound({path : basePath+'water_healing.ogg', volume : 0.5});
	out.waterHealing = kit;

// waterSpell
	kit = new AudioKit();
	kit.addSound({path : basePath+'water_spell.ogg', volume : 0.5});
	out.waterSpell = kit;



// WHIP PROP
// whipGeneric
	kit = new AudioKit();
	kit.addSound({path : basePath+'whip_swing.ogg', volume : 0.5}, true);
	kit.addSound({path : basePath+'whip_snap.ogg', volume : 0.5, hit:true}, false, 300);
	out.whipGeneric = kit;

// whipDouble
kit = new AudioKit();
	kit.addSound({path : basePath+'whip_swing.ogg', volume : 0.5}, true);
	kit.addSound({path : basePath+'whip_snap.ogg', volume : 0.5, hit:true}, false, 300);
	kit.addSound({path : basePath+'whip_swing.ogg', volume : 0.5}, true, 400);
	kit.addSound({path : basePath+'whip_snap.ogg', volume : 0.2, hit:true}, false, 600);
	out.whipDouble = kit;

















// TENTACLES

// tentacleWhip
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_lash_pre.ogg', volume : 0.5}, true, 0);
	kit.addSound({path : basePath+'tentacle_lash_post.ogg', volume : 0.75, hit:true}, false, 10);
	out.tentacleWhip = kit;

// tentacleTwist
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_twist_better.ogg', volume : 0.75});
	out.tentacleTwist = kit;

// tentacleStretch
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_stretch_better.ogg', volume : 0.75, hit:true});
	out.tentacleStretch = kit;

// tentacleStretchWhip
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_lash_pre.ogg', volume : 0.5}, true, 0);	
	kit.addSound({path : basePath+'tentacle_stretch_better.ogg', volume : 0.75}, false, 50);
	kit.addSound({path : basePath+'whip_snap.ogg', volume : 0.75, hit:true}, false, 600);
	out.tentacleStretchWhip = kit;

// tentacleMultipleThrusts
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_thrust_multi.ogg', volume : 0.5});
	out.tentacleMultipleThrusts = kit;

// tentacleSuction
	kit = new AudioKit();
	kit.addSound({path : basePath+'tentacle_suction.ogg', volume : 0.5});
	out.tentacleSuction = kit;

// gooRub
	kit = new AudioKit();
	kit.addSound({path : basePath+'goo_rub.ogg', volume : 0.3});
	out.gooRub = kit;

// squishTiny
	kit = new AudioKit();
	kit.addSound({path : basePath+'tiny_squish.ogg', volume : 0.25});
	out.squishTiny = kit;


// squishLong
	kit = new AudioKit();
	kit.addSound({path : basePath+'good_squish_long.ogg', volume : 0.4});
	out.squishLong = kit;




// Classes
// warriorShield
	kit = new AudioKit();
	kit.addSound({path : basePath+'warrior_shield.ogg', volume : 0.4});
	out.warriorShield = kit;






// Potions
// potionUse
	kit = new AudioKit();
	kit.addSound({path : basePath+'potion_use.ogg', volume : 0.4});
	out.potionUse = kit;


// Player status
// levelup
	kit = new AudioKit();
	kit.addSound({path : basePath+'levelup.ogg', volume : 0.7});
	out.levelup = kit;

// questCompleted
	kit = new AudioKit();
	kit.addSound({path : basePath+'questhandin.ogg', volume : 0.7});
	out.questCompleted = kit;
// questPickup
	kit = new AudioKit();
	kit.addSound({path : basePath+'quest_pickup.ogg', volume : 0.7});
	out.questPickup = kit;

// repair
	kit = new AudioKit();
	kit.addSound({path : basePath+'item_repair.ogg', volume : 0.4});
	out.repair = kit;

// armorBreak
	kit = new AudioKit();
	kit.addSound({path : basePath+'cloth_rip.ogg', volume : 0.6}, false, 200);
	out.armorBreak = kit;


// LOOT SOUNDS
// lootRepairKit
	kit = new AudioKit();
	kit.addSound({path : basePath+'repair_kit.ogg', volume : 0.4});
	out.lootRepairKit = kit;

// lootPotion
	kit = new AudioKit();
	kit.addSound({path : basePath+'potion_pickup.ogg', volume : 0.4});
	out.lootPotion = kit;

// lootPlate
	kit = new AudioKit();
	kit.addSound({path : basePath+'plate_pickup.ogg', volume : 0.4});
	out.lootPlate = kit;

// lootMail
	kit = new AudioKit();
	kit.addSound({path : basePath+'mail_pickup.ogg', volume : 0.4});
	out.lootMail = kit;

// lootLeather
	kit = new AudioKit();
	kit.addSound({path : basePath+'leather_pickup.ogg', volume : 0.4});
	out.lootLeather = kit;

// lootCloth
	kit = new AudioKit();
	kit.addSound({path : basePath+'cloth_pickup.ogg', volume : 0.4});
	out.lootCloth = kit;


export default out;