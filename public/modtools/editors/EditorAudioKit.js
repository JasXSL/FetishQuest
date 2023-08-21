import HelperAsset from './HelperAsset.js';
import { AudioKit } from '../../classes/Audio.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'audioKits',
	CONSTRUCTOR = AudioKit;

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
	html += '<label>Follow parts <input type="checkbox" class="saveable" name="follow_parts" '+(dummy.follow_parts ? 'checked' : '')+' /></label><br />';

	html += 'An array of sound objects, ex [{s:{volume:(float)vol, loop:(bool)looping, path:(str)url, position:{x,y,z}, hit:(bool)armor_hit_sound=false}, t:(int)predelay_ms, se:(bool)from_caster}...]<br />';
	html += '<ul>'+
			'<li>s : is an object detailing the sound: <ul>'+
				'<li>volume is between 0-1</li>'+
				'<li>loop details if the sound should loop</li>'+
				'<li>path is the URL of the sound</li>'+
				'<li>position is the position in 3d space, with xy being 0 being top left and 1 being bottom right. z -1 is away from the listener whereas 1 is behind. For spell particle visuals this value is set automatically and can be ignored.</li>'+
				'<li>hit, if true, will play the armor hit sound. Usually used for punches or other physical impacts against armor.</li>'+
			'</ul></li>'+
			'<li>t : adds a delay before playing the sound, in milliseconds</li>'+
			'<li>se : if true and the sound is tied to a spell, it\'s played from the caster</li>'+
		'</ul>';
	html += '<textarea class="json" name="sounds">'+esc(JSON.stringify(dummy.sounds))+'</textarea><br />';

	html += 'Conditions: <br />';
	html += '<div class="conditions"></div>';


	this.setDom(html);

	// Set asset tables
	this.dom.querySelector("div.conditions").appendChild(assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label'], single, false);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		"*label" : true,
		"follow_parts" : true,
		"sounds" : true,
		"conditions" : a => a.conditions ? a.conditions.map(el => el.label).join(', ') : '',
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'sound_'+Generic.generateUUID(),
		sounds : [
            {
                s : {
                    path : "media/audio/battle_finished.ogg",
                    volume : 0.5
                },
                t : 500,
                se : false
            }
        ]
	}));

};

