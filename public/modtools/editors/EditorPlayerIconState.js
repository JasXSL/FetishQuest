import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import PlayerIconState from '../../classes/PlayerIconState.js';
import Asset from '../../classes/Asset.js';

const DB = 'playerIconStates',
	CONSTRUCTOR = PlayerIconState;

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
	html += '<div class="labelFlex">';
		html += '<label>URL: <br /><input type="text" name="icon" style="width:100%" class="saveable" value="'+esc(dummy.icon)+'" /></label><br />';
		html += '<label>Layer: <select name="layer" data-type="int" class="saveable">';
		for( let i = 0; i < PlayerIconState.LAYER_MAX; ++i ){

			let add = PlayerIconState.getLayerNameByNumber(i);
			if( add )
				add = ' ('+add+')';
			html += '<option value="'+i+'" '+(Math.trunc(dummy.layer) === i ? 'selected' : '')+'>'+i+add+'</option>';

		}
		html += '</select></label>';
		html += '<label>Duration: <input type="number" name="duration" step=1 min=0 class="saveable" value="'+esc(dummy.duration)+'" /></label>';
		html += '<label>X: <input type="number" name="x" step=1 min=0 class="saveable" value="'+esc(dummy.x)+'" /></label>';
		html += '<label>Y: <input type="number" name="y" step=1 min=0 class="saveable" value="'+esc(dummy.y)+'" /></label>';
		html += '<label>Armor Slot: <select name="slot" class="saveable">';
		for( let i in Asset.Slots )
			html += '<option value="'+Asset.Slots[i]+'" '+(dummy.slot === Asset.Slots[i] ? 'selected' : '')+'>'+i+'</option>';
		html += '</select></label>';
		html += '<label>Blend Mode: <select name="blendMode" class="saveable">';
		for( let i in PlayerIconState.BlendMode )
			html += '<option value="'+PlayerIconState.BlendMode[i]+'" '+(dummy.blendMode === PlayerIconState.BlendMode[i] ? 'selected' : '')+'>'+i+'</option>';
		html += '</select></label>';
		html += '<label>Opacity: <input type="number" step=0.01 min=0 max=1 class="saveable" name="opacity" value="'+esc(dummy.opacity)+'" /></label>';		
	html += '</div>';

	html += 'Conditions: <div class="conditions"></div>';
	
	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);

};

export function help(){

	let out = '';

	out += '<h3>Player icon states:</h3>'+
		'<p>Gives you a lot more control over character art by tying it to conditions.</p>';
		out += '<table>';
		out += 
			'<tr>'+
				'<td>URL</td>'+
				'<td>URL of the art. PNG or JPG.</td>'+
			'</tr>'+
			'<tr>'+
				'<td>Layer</td>'+
				'<td>Art layer. A higher layer nr goes in front of a lower layer nr. The list includes some suggestions, but you can use any of the layers you want.</td>'+
			'</tr>'+
			'<tr>'+
				'<td>Duration</td>'+
				'<td>'+
					'While 0, the character art will be redrawn on each UI redraw, and if the conditions match, it will draw the layer. Useful for permanent art like armor.<br />'+
					'If you set this to a value above 0, the conditions will be checked on text meta events. And if the conditions match the event, the art will be drawn for Duration milliseconds. Useful for temporary facial expressions.'+
				'</td>'+
			'</tr>'+
			'<tr>'+
				'<td>X/Y</td>'+
				'<td>The coordinate system is between top left and bottom right of the largest active image. You can save some memory by cropping clothing colorization layers before uploading them, and adjusting their position with the X/Y values.</td>'+
			'</tr>'+
			'<tr>'+
				'<td>Armor Slot</td>'+
				'<td>If you set this to an active armor slot, the whole layer will be colorized based on the armor color. I recommend making a full art layer for the armor where you leave this slot empty. Then creating a layer on top of with a mask and setting the armor slot on that.</td>'+
			'</tr>'+
			'<tr>'+
				'<td>Blend Mode</td>'+
				'<td>Used on masking layers (such as armor masks) to change the blending mode. Multiply is recommended for cloth/leather and Overlay is recommended for metal.</td>'+
			'</tr>'+			
			'<tr>'+
				'<td>Conditions</td>'+
				'<td>Conditions for when to draw this layer. See Duration for more info about when to use what conditions.</td>'+
			'</tr>'+
			'<tr>'+
				'<td>Opacity</td>'+
				'<td>Sets opacity from fully transparent to fully visible.</td>'+
			'</tr>'
		;

	out += '</table>';
	
	return out;

};

// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'icon',
		'layer', 
		'duration',
		'conditions'
	], single, true, undefined, undefined, true);
}

// Listing - Unused
export function list(){

	const fields = {
		'*url' : true,
		'*conditions' : true,
	};

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		icon : "Your URL here",
	}));

};

