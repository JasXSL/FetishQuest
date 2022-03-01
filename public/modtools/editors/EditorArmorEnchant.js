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

