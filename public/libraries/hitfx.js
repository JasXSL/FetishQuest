import {default as HitFX, Stage} from '../classes/HitFX.js';
const out = {};

let id = 'punch';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		particles : 'hitfx_sparks',
		emit_duration : 100,
	}, out[id]),
	new Stage({
		particles : 'hitfx_punch',
		emit_duration : 100,
	}, out[id]),
	
);


id = 'ice_blast';
out[id] = new HitFX({label : id});
out[id].stages.push(
	new Stage({
		origin : 'attacker',
		particles : 'hitfx_snow_sparks',
		emit_duration : 500,
		hold : 500
	}, out[id]),
	new Stage({
		particles : 'hitfx_snow_sparks_impact',
		emit_duration : 100,
		css_fx : 'fxTakeDamageElemental'
	}, out[id]),
);



export default out;
