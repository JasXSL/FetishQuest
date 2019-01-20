import {default as HitFX, Stage} from '../../classes/HitFX.js';
const out = {};

let id = 'punch';
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


id = 'tentacleStretch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		css_fx : 'fxStretch',
		sound_kits : ['tentacleTwist'],
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


function getArray(){
	const o = [];
	for( let obj in out ){
		const l = out[obj];
		l.label = obj;
		o.push(l);
	}
	return o;
};

export {getArray};
export default out;
