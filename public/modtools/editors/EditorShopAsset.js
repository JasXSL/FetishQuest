// This editor is purely parented to EditorShop
import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorAsset from './EditorAsset.js';
import { ShopAsset } from '../../classes/Shop.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'shopAssets',
	CONSTRUCTOR = ShopAsset;

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
		html += '<label title="Cost in copper. -1 auto generates.">Cost: <input type="number" min=-1 step=1 name="cost" class="saveable" value="'+esc(dummy.cost)+'" /></label>';
		html += '<label title="Amount to stock, -1 for infinite">Amount: <input type="number" min=-1 step=1 name="amount" class="saveable" value="'+esc(dummy.amount)+'" /></label>';
		html += '<label title="Time in seconds in game time">Restock Rate: <input type="number" min=0 step=1 name="restock_rate" class="saveable" value="'+esc(dummy.restock_rate)+'" /></label>';
	html += '</div>';

	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "asset", true));
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));


	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'asset',
		'cost'
	], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*asset': true,
		'*cost': true,
		'*amount': true,
		'*restock_rate': true,
		conditions: true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'vendorAsset_'+Generic.generateUUID(),
		name : 'New Asset'
	}));

};

