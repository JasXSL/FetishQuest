import * as THREE from '../../ext/THREE.js';
import {default as HitFX, Stage} from '../../classes/HitFX.js';
const out = {};

let id = 'punch';
let start = {y:100}, end = {y:-50};
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['punchGeneric'],
	}, out[id]),
);


id = 'punchDouble';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		hold : 200,
		css_fx : 'fxTakeDamage',
		sound_kits : ['punchGeneric'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['punchGeneric'],
	}, out[id]),
);


id = 'slap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['slapGeneric'],
	}, out[id]),
);



id = 'questStart';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'quest_stars',
		emit_duration : 3000,
		tween : false
	}, out[id]),
);


id = 'pinch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		sound_kits : ['pinchGeneric'],
		css_fx : 'fxTakeDamage',
		
	}, out[id]),
);

id = 'doubleSlap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch_smaller',
		emit_duration : 100,
		hold : 250,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['slapGeneric'],
	}, out[id]),

	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['slapNoSwing'],
	}, out[id]),
);

id = 'stretch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['stretchGeneric'],
	}, out[id]),
);

id = 'squeeze';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['squeezeGeneric'],
	}, out[id]),
);


id = 'claws';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		start_offs : {x:50,y:-100,z:0},
		end_offs : {x:50,y:-100,z:0},
		particles : 'hitfx_claws',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['clawRip'],
	}, out[id]),
);


id = 'smite';
start = end = {x:-40,y:30};
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_big',
		emit_duration : 100,
		end_offs : start,
		start_offs : start,
		tween : false
	}, out[id]),
	new Stage({
		start_offs : {x:50,y:-100,z:0},
		end_offs : {x:50,y:-100,z:0},
		particles : 'hitfx_smite',
		emit_duration : 100,
		end_offs : start,
		start_offs : start,
		tween : false,
		css_fx : 'fxTakeDamageHoly',
		sound_kits : ['holySmite'],
	}, out[id]),
);


id = 'biteGeneric';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_bite',
		emit_duration : 100,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['biteGeneric'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		tween : false,
	}, out[id]),
);


id = 'tentacleStretch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['tentacleTwist'],
	}, out[id]),
);

id = 'tentacleStretchWhip';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['tentacleStretchWhip'],
		hold : 400
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
	}, out[id]),
);

id = 'tentacleSqueeze';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['tentacleTwist'],
	}, out[id]),
);

id = 'tentacleZap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		sound_kits : ['tentacleZap'],
		css_fx : 'fxTakeDamageElemental',
	}, out[id]),
);


id = 'tentacleSqueezeZap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxSqueeze',
		hold : 300,
		sound_kits : ['tentacleTwist'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		sound_kits : ['tentacleZap'],
		css_fx : 'fxTakeDamageElemental',
	}, out[id]),
);

id = 'tentacleWhipZap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_zap',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		sound_kits : ['tentacleWhip','tentacleZap'],
		css_fx : 'fxTakeDamageElemental',
	}, out[id]),
);



id = 'tentacleSuck';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxSqueeze',
		sound_kits : ['tentacleSuction'],
	}, out[id]),
);

id = 'tentacleWhip';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['tentacleWhip'],
	}, out[id]),

);


id = 'slowThrusts';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 600,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['slowThrusts'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 600,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
);


id = 'slowThrustsCum';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 300,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['thrustCum'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 300,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 400,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
);


id = 'slowThrustsTentacle';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 500,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['tentacleMultipleThrusts'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 500,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
);

id = 'slowThrustsTentacleDiscrete';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 500,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['tentacleMultipleThrusts'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		hold : 500,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
);

id = 'tentacleRub';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['gooRub'],
	}, out[id]),
);

id = 'squishTiny';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_discreter',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['squishTiny'],
	}, out[id]),
);

id = 'squishLong';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['squishLong'],
	}, out[id]),
);

id = 'poisonPink';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['poisonGeneric'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_pink',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_poison_pink',
		emit_duration : 400,
		tween : false,
	}, out[id]),
);

id = 'chastise';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_big',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxTakeDamageHoly',
		sound_kits : ['holyChastise'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_yellow',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_lock_yellow',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);



id = 'darkPunch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 200,
		tween : false,
		dest_rand : 0.25,
		css_fx : 'fxTakeDamage',
		sound_kits : ['darkPunch'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_dark_star',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);

id = 'healingPunch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 200,
		tween : false,
		dest_rand : 0.25,
		css_fx : 'fxTakeDamage',
		sound_kits : ['healingPunch'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_yin_yang',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);



id = 'holyHeal';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['holyGeneric'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_yellow',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing_yellow',
		emit_duration : 200,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_big_yellow',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);


id = 'monkHeal';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ["monkHeal"],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing',
		emit_duration : 200,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_yin_yang',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);

id = 'monkHealSmallTargeted';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_mist_green_target',
		origin : 'sender',
		emit_duration : 300,
		hold : 300,
		easing : 'Linear.None'
	}, out[id]),
	new Stage({
		css_fx : 'fxHeal',
		sound_kits : ["monkHeal"],
		particles : 'hitfx_mist',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);




id = 'whip';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['whipGeneric'],
	}, out[id]),
);

id = 'whipDouble';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch_smaller',
		emit_duration : 100,
		hold : 400,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['whipGeneric'],
	}, out[id]),

	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['whipGeneric'],
	}, out[id]),
);

id = 'tickle';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		sound_kits : ['tickleGeneric'],
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
);


id = 'ice_blast';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_snow_sparks',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['coldBlast_cast'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_snow_sparks_impact',
		emit_duration : 100,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['coldBlast_hit'],
	}, out[id]),
);


id = 'sludgeBoltPurple';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_impact',
		emit_duration : 100,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['gooSplat'],
	}, out[id]),
);



id = 'siphonCorruption';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		destination : 'sender',
		particles : 'hitfx_sludge_siphon',
		emit_duration : 500,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['tentacleSuction'],
		easing : "Quadratic.Out"
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_proc',
		emit_duration : 100,
	}, out[id]),
	
);

id = 'sludgePurple';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sludge_bolt_proc',
		fade_duration : 3000,
		emit_duration : 100,
		sound_kits : ['tentacleSuction'],
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 100,
	}, out[id]),
	
);




id = 'potionRed';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_red',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['potionUse'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_red',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);

id = 'potionBlue';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['potionUse'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);


id = 'healingSurge';
start = {y:100}, end = {y:-50};
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		start_offs : start,
		end_offs : end,
		css_fx : 'fxHeal',
		sound_kits : ['waterHealing'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_healingSurge',
		emit_duration : 300,
		dest_rand : 0.25,
		start_offs : start,
		end_offs : end,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		dest_rand : 0.25,
		start_offs : start,
		end_offs : end,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing',
		emit_duration : 300,
		dest_rand : 0.25,
		start_offs : start,
		end_offs : end,
	}, out[id]),
);


id = 'waterSpout';
out[id] = new HitFX({label : id});
start = end = {y:150};
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['waterSpell'],
		start_offs : start,
		end_offs : end,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healingSurge',
		emit_duration : 300,
		tween : false,
		start_offs : start,
		end_offs : end,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		tween : false,
		start_offs : start,
		end_offs : end,
	}, out[id]),
	new Stage({
		particles : 'hitfx_fountain',
		emit_duration : 300,
		tween : false,
		start_offs : start,
		end_offs : end,
	}, out[id]),
);



// Razzyberry
id = 'razzyberry';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['berryHeal'],
	}, out[id]),
	
	new Stage({
		particles : 'hitfx_splat_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);




// 
id = 'bolster';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_shield',
		emit_duration : 100,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['warriorShield'],
		hold : 100
	}, out[id]),
	new Stage({
		start_offs : {z:0.5},
		end_offs : {z:0.5},
		particles : 'hitfx_sparks',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);


function getArray(){
	const o = [];
	for( let obj in out ){
		const l = out[obj];
		l.label = obj;
		o.push(l.save("mod"));
	}
	return o;
};

export {getArray};
export default out;
