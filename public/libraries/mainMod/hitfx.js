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


id = 'boneRattle';
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
		css_fx : 'fxSqueeze',
		sound_kits : ['boneRattle'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch_bones',
		emit_duration : 100,
		dest_rand : 0.5,
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


id = 'rummage';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxShake',
		sound_kits : ['rummage'],
	}, out[id]),
);

id = 'whipPickup';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxShake',
		sound_kits : ['whipPickup'],
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


id = 'slapSqueeze';
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
		hold : 300,
	}, out[id]),
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['squeezeGeneric'],
	}, out[id]),
);

id = 'scratchItch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['scratchItch'],
	}, out[id]),
);

id = 'scratchItchSqueeze';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
	}, out[id]),
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['scratchSqueeze'],
	}, out[id]),
);


id = 'whipSqueeze';
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
		hold : 300,
	}, out[id]),
	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['squeezeGeneric'],
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

id = 'pinchStretch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_smaller',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		sound_kits : ['pinchGeneric'],
		css_fx : 'fxTakeDamage',
		hold: 100
	}, out[id]),
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['stretchGeneric'],
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

id = 'shove';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['shove'],
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
		start_offs : {x:50,y:-100,z:0},
		end_offs : {x:50,y:-100,z:0},
		particles : 'hitfx_claws',
		emit_duration : 200,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['clawRip'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false
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
		emit_duration : 200,
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

id = 'stretchWhip';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['stretchWhip'],
		hold : 400
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamage',
	}, out[id]),
);

id = 'stretchPunch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['stretchPunch'],
		hold : 400
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

id = 'darkOrb';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxBuffBlue',
		sound_kits : ['darkMagic'],
		particles : 'hitfx_darkOrb',
		emit_duration : 300,
		dest_rand : 0,
		tween : false
	}, out[id]),
);
id = 'tentacleGrab';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['darkTentacleGrab'],
		particles : 'hitfx_sludge_bolt_proc_black',
		fade_duration : 3000,
		emit_duration : 100,
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 100,
	}, out[id]),
);

id = 'elementalHitSparksNoSound';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_zap',
		emit_duration : 200,
		dest_rand : 0.5,
		css_fx : 'fxTakeDamageElemental',
		tween : false,
	}, out[id]),
);

id = 'tentacleZap';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_zap',
		emit_duration : 200,
		dest_rand : 0.5,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_zap',
		emit_duration : 200,
		dest_rand : 0.5,
		tween : false,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['tentacleZap'],
	}, out[id]),
);


id = 'lampreyShock';
out[id] = new HitFX({label : id, once:true,});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks_zap_large',
		emit_duration : 400,
		dest_rand : 0,
		tween : false,
		origin : 'sender',
		destination : 'sender',
	}, out[id]),
	new Stage({
		particles : 'hitfx_zap_large',
		emit_duration : 400,
		dest_rand : 0,
		tween : false,
		sound_kits : ['tentacleZap'],
		origin : 'sender',
		destination : 'sender',
	}, out[id]),
);

id = 'big_green_burst';
out[id] = new HitFX({label : id, once:true,});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_burst_green_large_drops',
		emit_duration : 400,
		dest_rand : 0,
		tween : false,
		origin : 'sender',
		destination : 'sender',
	}, out[id]),
	new Stage({
		particles : 'hitfx_burst_green_large',
		emit_duration : 400,
		dest_rand : 0,
		tween : false,
		sound_kits : ['gooSplat'],
		origin : 'sender',
		destination : 'sender',
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
		particles : 'hitfx_splat_green',
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

id = 'tentacleWhipDouble';
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
		hold : 250, 
	}, out[id]),

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

id = 'tentacleWhipSqueeze';
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
		hold : 250, 
	}, out[id]),

	new Stage({
		css_fx : 'fxSqueeze',
		sound_kits : ['tentacleTwist'],
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
		emit_duration : 200,
		tween : false,
	}, out[id]),
);

id = 'poisonVial';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['poisonGeneric','glassBreak'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_pink',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 200,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_poison_pink',
		emit_duration : 200,
		tween : false,
	}, out[id]),
);

id = 'poisonVialDrink';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 200,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['poisonGeneric','potionUse'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_pink',
		emit_duration : 400,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 200,
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

id = 'monkMeditate';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		sound_kits : ['monkMeditate'],
		particles : 'hitfx_mist_green_target',
		emit_duration : 400,
		dest_rand : 0.5,
		tween : true,
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

id = 'resurrect';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 1200,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['holyResurrection'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_yellow',
		emit_duration : 800,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing_yellow_pillar',
		emit_duration : 1200,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_big_yellow',
		emit_duration : 600,
		tween : false,
	}, out[id]),
);


id = 'aoeHeal';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 600,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['holyAOE'],
		origin : 'sender',
		destination : 'sender',
		css_fx_targ : 'sender',
		once : true,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist_yellow',
		origin : 'sender',
		destination : 'sender',
		emit_duration : 300,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_healing_pulse',
		emit_duration : 300,
		tween : false,
		origin : 'sender',
		destination : 'sender',
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_big_yellow',
		emit_duration : 300,
		tween : false,
		origin : 'sender',
		destination : 'sender',
	}, out[id]),
);

id = 'holyRunes';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 600,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['penance'],
		once : true,
	}, out[id]),
	new Stage({
		particles : 'hitfx_holy_runes',
		emit_duration : 300,
		tween : false,
	}, out[id])
);

id = 'holyCharged';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 400,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['holyCharged'],
		once : true,
	}, out[id]),
);




id = 'levelup';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_levelup',
		emit_duration : 200,
		tween : false,
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparkles_static_big',
		emit_duration : 400,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['levelup'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparks_big_yellow',
		emit_duration : 1000,
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

id = 'tentacleTickle';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		sound_kits : ['tickleGeneric'],
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discreter',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		sound_kits : ['squishTiny'],
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
	new Stage({emit_duration:500, particles:'hitfx_sludge_bolt_drops', origin:'attacker'}),
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
	new Stage({
		particles : 'hitfx_sludge_bolt_impact_residue',
		emit_duration : 100,
	}, out[id]),
);

id = 'sludgeBoltBlack';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt_black',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_impact_black',
		emit_duration : 100,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['gooSplat'],
	}, out[id]),
);

id = 'sludgeBoltBlue';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt_blue',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow', 'ghoulSpit'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_impact_blue',
		emit_duration : 100,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['cumSplat'],
	}, out[id]),
);

id = 'sludgeBoltGreen';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt_green',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow', 'ghoulSpit'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_impact_green',
		emit_duration : 100,
		css_fx : 'fxTakeDamageElemental',
		sound_kits : ['cumSplat'],
	}, out[id]),
);


id = 'sludgeBoltWhite';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt_white',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sludge_bolt_impact_white',
		emit_duration : 100,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['gooSplat'],
	}, out[id]),
);

id = 'siphonMilk';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_sludge_bolt_white',
		emit_duration : 500,
		sound_kits : ['waterCharged'],
		hold:500,
	}, out[id]),
	new Stage({
		css_fx : 'fxHeal',
	})
);

id = 'siphonMilkReverse';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		destination : 'sender',
		particles : 'hitfx_sludge_bolt_white',
		emit_duration : 500,
		sound_kits : ['waterCharged'],
		hold:500,
	}, out[id]),
	new Stage({
		css_fx : 'fxHeal',
	})
);

id = 'ghoulSpit';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({emit_duration:500, particles:'hitfx_spit_drops', origin:'attacker'}),
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_spit',
		emit_duration : 500,
		hold : 500,
		sound_kits : ['tentacleSuctionFollow', 'ghoulSpit'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_spit_impact',
		emit_duration : 100,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['cumSplat'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_spit_impact_residue',
		emit_duration : 100,
	}, out[id]),
);


id = 'throwStone';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({emit_duration:500, particles:'hitfx_throw_rock_sparks', origin:'attacker'}), // todo
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_throw_rock_center', // Todo
		emit_duration : 500,
		hold : 500,
		sound_kits : ['throwGenericSender'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_throw_rock_impact_sparks',	// Todo
		emit_duration : 100,
		css_fx : 'fxTakeDamage',
		sound_kits : ['throwRockImpact'],
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

id = 'sludgeBlack';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sludge_bolt_proc_black',
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

id = 'enrage';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_debris',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffRed',
		sound_kits : ['enrage'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_bite',
		emit_duration : 100,
		tween : false,
	}, out[id])
);

id = 'steal';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_debris',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffRed',
		sound_kits : ['steal'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_coins',
		emit_duration : 300,
		tween : false,
	}, out[id])
);


id = 'tripwire_set';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxBuffBlue',
		sound_kits : ['tripwire_set'],
		origin : 'sender',
		destination : 'sender',
		css_fx_targ : 'sender',
	}, out[id]),
);

id = 'tripwire_hit';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxTakeDamage',
		sound_kits : ['tripwire_hit'],
		particles : 'hitfx_sparks',
	}, out[id]),
);


id = 'roots';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_debris',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['roots'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_roots',
		emit_duration : 100,
		tween : false,
	}, out[id])
);



id = 'earthShield';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_debris',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['earthShield'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_earth_shield',
		emit_duration : 300,
		tween : false,
	}, out[id])
);

id = 'hexArmor';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_hex_armor',
		emit_duration : 500,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamage',
		sound_kits : ['hexArmor'],
	}, out[id]),
);

id = 'glowingOoze';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_glowing_ooze',
		emit_duration : 500,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['gooRub'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);
id = 'glowingOozeGreen';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_glowing_ooze_green',
		emit_duration : 500,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['gooRub'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_sparkles_static',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);

id = 'glowingOozeSplat';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_glowing_ooze_white_splat',
		emit_duration : 500,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['gooRub'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);

id = 'skitteringSwarm';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_insect_dots',
		emit_duration : 500,
		sound_kits : ['skitteringSwarm'],
		origin : 'attacker',
	}, out[id]),
	new Stage({
		particles : 'hitfx_skittering_swarm',
		emit_duration : 500,
		origin : 'attacker',
		hold : 500,
	}, out[id]),
	new Stage({
		particles : 'hitfx_insect_dots_impact',
		emit_duration : 500,
		css_fx : 'fxTakeDamageCorruption',
	}, out[id]),
	new Stage({
		particles : 'hitfx_skittering_swarm_impact',
		emit_duration : 500,
	}, out[id]),
);

id = 'stingingSwarm';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_insect_dots',
		emit_duration : 500,
		sound_kits : ['skitteringSwarm'],
		origin : 'attacker',
	}, out[id]),
	new Stage({
		particles : 'hitfx_stinging_swarm',
		emit_duration : 500,
		origin : 'attacker',
		hold : 500,
	}, out[id]),
	new Stage({
		particles : 'hitfx_insect_dots_impact',
		emit_duration : 500,
		css_fx : 'fxTakeDamage',
		sound_kits : ['stingingSwarm'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_stinging_swarm_impact',
		emit_duration : 500,
	}, out[id]),
);

id = 'boneShards';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_insect_dots',
		emit_duration : 500,
		sound_kits : ['boneShards'],
		origin : 'attacker',
	}, out[id]),
	new Stage({
		particles : 'hitfx_bone_shards',
		emit_duration : 500,
		origin : 'attacker',
		hold : 500,
	}, out[id]),
	new Stage({
		css_fx : 'fxTakeDamage',
	}, out[id])
);

id = 'slimeBone';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_insect_dots',
		emit_duration : 500,
		sound_kits : ['boneShards'],
		origin : 'attacker',
	}, out[id]),
	new Stage({
		particles : 'hitfx_bone_shards',
		emit_duration : 500,
		origin : 'attacker',
		hold : 500,
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_discrete',
		emit_duration : 200,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['squishLong'],
	}, out[id]),
);

id = 'summonBones';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_insect_dots_impact',
		emit_duration : 500,
		sound_kits : ['animateBones'],
		origin : 'attacker',
		destination : 'attacker',
	}, out[id]),
	new Stage({
		particles : 'hitfx_bone_shards_big',
		emit_duration : 500,
		origin : 'attacker',
		destination : 'attacker',
	}, out[id]),
);


id = 'water_cast';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_condensation',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['waterCharged'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 100,
		tween : false,
	}, out[id]),

	
);

id = 'riptide';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['riptide'],
		origin : 'sender',
		destination : 'sender',
		css_fx_targ : 'sender',
		once : true,
	}, out[id]),
	new Stage({
		particles : 'hitfx_riptide',
		emit_duration : 300,
		tween : false,
		origin : 'sender',
		destination : 'sender',
		css_fx_targ : 'sender',
		once : true,
	}, out[id]),
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		dest_rand : 0.25,
		origin : 'sender',
		destination : 'sender',
		css_fx_targ : 'sender',
		once : true,
	}, out[id]),
);


id = 'circleOfHarmony';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_mist',
		emit_duration : 300,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['circleOfHarmony'],
		once : true,
	}, out[id]),
	new Stage({
		particles : 'hitfx_circle_of_harmony',
		emit_duration : 300,
		tween : false,
		once : true,
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


id = 'healingSurgeSilent';
start = {y:100}, end = {y:-50};
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		start_offs : start,
		end_offs : end,
		css_fx : 'fxHeal',
	}, out[id]),
	new Stage({
		particles : 'hitfx_healingSurge',
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
		start_offs : {},
		end_offs : {},
	}, out[id]),
	new Stage({
		particles : 'hitfx_healingSurge',
		emit_duration : 300,
		tween : false,
		start_offs : {},
		end_offs : {},
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

id = 'drink_generic';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_splat_sparks_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['drink_generic'],
	}, out[id]),
	new Stage({
		particles : 'hitfx_splat_blue',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
	}, out[id]),
);

id = 'eat_generic';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_crumbs',
		emit_duration : 300,
		dest_rand : 0.25,
		tween : false,
		css_fx : 'fxHeal',
		sound_kits : ['eat_generic'],
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

id = 'gong';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_pulse',
		emit_duration : 500,
		tween : false,
		css_fx : 'fxBuffBlue',
		sound_kits : ['gong'],
	}, out[id]),
);

id = 'vibrationHit';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_vibration',
		emit_duration : 500,
		tween : false,
		css_fx : 'fxTakeDamageCorruption',
		sound_kits : ['vibrationHit'],
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
