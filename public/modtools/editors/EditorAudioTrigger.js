import HelperAsset from './HelperAsset.js';
import Generic from '../../classes/helpers/Generic.js';
import AudioTrigger from '../../classes/AudioTrigger.js';
import * as editorAudioKit from './EditorAudioKit.js';
import * as editorCondition from './EditorCondition.js';

const DB = 'audioTriggers',
	CONSTRUCTOR = AudioTrigger;

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

	html += '<label>Priority: <input type="number" step=1 name="priority" class="saveable" value="'+(parseInt(dummy.priority)||0)+'" /></label><br />';
	html += '<label title="Percent chance of triggering. Multiplied against player emotive.">Trig: <input type="number" step=1 min=0 name="freq" class="saveable" value="'+(parseInt(dummy.freq)||0)+'" /></label><br />';
	html += 'Sounds: <br /><div class="sounds"></div>';
	html += 'Conditions: <br /><div class="conditions"></div>';


	this.setDom(html);

	// Set asset tables
	this.dom.querySelector("div.conditions").appendChild(editorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.sounds").appendChild(editorAudioKit.assetTable(this, asset, "sounds"));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label'], single);
}


// Returns a help text
export function help(){

	let out = '';

	out += '<h3>AudioTrigger:</h3>'+
		'<p>Audiotriggers are mainly used to create combat grunts. They contain lists of audio kits and when the conditions are met, one is played at random. Each player is limited to play 1 audio kit every 500ms.</p>';

	out += '<p>For most of these, you\'ll want to use the conditions eventIsTextTrigger, targetVoice_x (when victim) or senderVoice_x (when attacker), and any relevant meta condition such as metaVeryPainful. But you can toy with these freely, like adding a disgust reaction to trigger on metaGooey.</p>';
	out += '<p>For now, all you need to add one to the player editor dropdown is to make a voice condition that targets this voice.</p>';
	

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Priority</td>'+
			'<td>Any number. Higher priority triggers are considered first. Mostly used for pain=1, critical pain=2</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Trig</td>'+
			'<td>Percent chance of triggering, a whole number. Multiplied against a player\'s emotive setting.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Sounds</td>'+
			'<td>List of viable soundkits. When triggered, one will be picked at random.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions. Works the same way as text conditions.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		"*label" : true,
		"conditions" : a => a.conditions ? a.conditions.map(el => el.label).join(', ') : '',
		"sounds" : a => a.sounds ? a.sounds.map(el => el.label).join(', ') : '',
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'audioTrigger_'+Generic.generateUUID(),
	}));

};

