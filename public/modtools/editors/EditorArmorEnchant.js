import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorWrapper from './EditorWrapper.js';
import Shop from '../../classes/Shop.js';
import Generic from '../../classes/helpers/Generic.js';
import ArmorEnchant from '../../classes/ArmorEnchant.js';
import Asset from '../../classes/Asset.js';

const DB = 'armorEnchants',
	CONSTRUCTOR = ArmorEnchant
;

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <input type="text" name="description" class="saveable" value="'+esc(dummy.description)+'" /></label>';
		html += '<label>Rarity: <select name="rarity" class="saveable">';
		for( let i in Asset.RarityNames ){
			html += '<option value="'+i+'" '+(i == dummy.rarity ? 'selected' : '')+'>'+esc(Asset.RarityNames[i])+'</option>';
		}
		html += '</select></label>';
		html += '<label><input type="checkbox" name="curse" class="saveable" '+(dummy.curse ? 'checked' : '')+' /> Is curse</label>';

	html += '</div>';

	html += 'Wrapper: <div class="wrapper"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.wrapper").appendChild(EditorWrapper.assetTable(this, asset, "wrapper", true));


	HelperAsset.autoBind( this, asset, DB);





};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*description' : true,
		wrapper : true,
		'*conditions' : true,
		'*rarity' : true,
		'*curse' : true
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'enchant_'+Generic.generateUUID(),
		description : 'Describe your enchant'
	}));

};

export function help(){

	let out = '';
	out += '<h3>Armor Enchant:</h3>'+
		'<p>This is a helper table to describe what wrappers may be used for generated armor, and rarity.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Description</td>'+
			'<td>Internal description only visible in the editor. Helps you search for specific enchants.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Rarity</td>'+
			'<td>Rarity of enchant. More rare are usually more powerful.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Is curse</td>'+
			'<td>Check if this is a detrimental enchant.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Wrapper</td>'+
			'<td>Passive to add to the player wearing the item the enchant is attached to.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions that must be met to apply it. Asset is present in the condition event. asset_lowerBody / asset_upperBody is commonly used to limit certain effects from stacking on both upper and lower body armor.</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};



