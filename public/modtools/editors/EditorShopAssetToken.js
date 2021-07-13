// This editor is purely parented to EditorShop
import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorAsset from './EditorAsset.js';
import { ShopAsset, ShopAssetToken } from '../../classes/Shop.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'shopAssetTokens',
	CONSTRUCTOR = ShopAssetToken;

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

	html += 'Item: <div class="asset"></div>';

	html += '<div class="labelFlex">';
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label title="Cost">Cost: <input type="number" min=1 step=1 name="amount" class="saveable" value="'+esc(dummy.amount)+'" /></label>';
	html += '</div>';

	this.setDom(html);

	this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "asset", true));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'label',
		'asset',
		'amount'
	], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label': true,
		'*asset': true,
		'*amount': true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'vendorAssetToken_'+Generic.generateUUID(),
		amount : 1
	}));

};

