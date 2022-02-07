import HelperAsset from './HelperAsset.js';
import HitFX, { Stage } from '../../classes/HitFX.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'hitFX',
	CONSTRUCTOR = HitFX;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();


	let html = '';
	if( !asset._h && !asset._mParent )
		html += 'Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /><br />';
	html += 'Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /><br />';
	html += '<label title="When this FX is played in sequence, wait this nr of ms between them">Stagger: <input type="number" step=1 min=0 name="stagger" class="saveable" value="'+(parseInt(dummy.stagger) || 0)+'" /></label><br />';
	html += '<label title="When triggered from a text (spell), only play audio for the first target. Useful for AoE.">Once <input type="checkbox" class="saveable" name="once" '+(dummy.once ? 'checked' : '')+' /></label><br />';

	html += 'An array of stage objects that tracks various effects of each stage:<br />';
	html += '<pre>'+
`{
	css_fx : (str)effect='',			// optional - CSS effect to play. You can pick from :
										// fxTakeDamage, fxTakeDamageCorruption, fxTakeDamageElemental, fxTakeDamageHoly, fxHeal, fxStretch, fxShake, fxSqueeze, fxBuffBlue, fxBuffRed
	css_fx_targ : (str)='victim',		// CSS effect target. Either 'victim' or 'sender'
	particles : (str)='',				// Particle system name. See /libraries/particles.js
	emit_duration : (int)=200,			// Duration before stopping emitting in milliseconds
	fade_duration : (int)=2000,			// Time before removing the particle system from the stage after emit_duration ends. Should be greater than the particle max life.
	hold : (int)=0,						// Wait this amount of MS before doing the next step
	tween : (bool)=true,				// Tween from sender to targ 
	origin : (str)='victim',			// Where the particles should originate from. Either victim or sender
	origin_rand : (float)=use_pre,		/ percentage of portrait box size the sender start location should be. 1 means it can appear anywhere in the portrait box. Undefined means you use the start pos of the last stage object. Use "preEnd" to copy from the previously set end position. Useful for impacts after animating a bolt.
	destination : (str)='victim',		// Tween from origin to this if tween is true
	dest_rand : (float)=use_pre,		// percentage of portrait box where the particles should end up. 0 means exactly in the middle. Undefined means you use the previous stage object end position.
	start_offs : (obj)={x:0,y:0}		// Allows you to add an offset from the origin portrait where the effect should start. x/y are 3d coordinates, so you'll have to experiment
	end_offs : (obj)={x:0,:y:0}			// Same as above but for destination
	easing : (str)="Cubic.In",			// See TWEEN.js for information of what easing you can use
	sound_kits : [],					// Trigger these sound kits by label from AudioKit library
}`+
		'</pre>';
	html += '<textarea class="json" name="stages">'+esc(JSON.stringify(asset.stages || []))+'</textarea><br />';

	this.setDom(html);

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'desc'], single);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		"*label" : true,
		"*desc" : true,
		"once" : true,
	}));

	HelperAsset.bindList(this, DB, CONSTRUCTOR.loadThis({
		label : 'hitFX_'+Generic.generateUUID(),
		description : 'Describe your effect',
		stages : [
            new Stage({
				particles : 'hitfx_splat_sparks_red',
				emit_duration : 300,
				dest_rand : 0.25,
				tween : false,
				css_fx : 'fxHeal',
				sound_kits : ['potionUse'],
			})
        ]
	}));

};

