// This editor is purely parented to EditorShop
import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorShopAssetToken from './EditorShopAssetToken.js';
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

	html += 'Alt currency: <div class="tokens"></div>';
	
	

	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "asset", true));
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.tokens").appendChild(EditorShopAssetToken.assetTable(this, asset, "tokens"));


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

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Shop Asset:</h3>'+
		'<p>This sets up an item that may be sold in a store.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Item</td>'+
			'<td>The Asset to be sold.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Cost</td>'+
			'<td>Cost of the asset in copper. Use -1 to auto generate.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Amount</td>'+
			'<td>Max nr to sell before running out of stock.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Restock rate</td>'+
			'<td>Time in in-game seconds before getting new stock in.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Alt currency</td>'+
			'<td>Select Shop Tokens to accept instead/in addition to gold.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions that need to be met before selling this item to a player. Checked against the player viewing the shop as a target for the condition event.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

