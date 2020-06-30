import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorShopAsset from './EditorShopAsset.js';
import Shop from '../../classes/Shop.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'shops',
	CONSTRUCTOR = Shop;

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
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Buys: <input type="checkbox" class="saveable" name="buys" '+(dummy.buys ? 'checked' : '')+' /></label><br />';
	html += '</div>';

	html += 'Items: <div class="items"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.items").appendChild(EditorShopAsset.assetTable(this, asset, "items", false, true));


	HelperAsset.autoBind( this, asset, DB);





};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		buys : true,
		items : asset => {
			const out = [];
			for( let item of asset.items ){

				const a = window.mod.mod.getAssetById("shopAssets", item);
				if( a )
					out.push(a.asset);
					
			}
			return esc(out.join(', '));
		},
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'vendor_'+Generic.generateUUID(),
		name : 'New Shop'
	}));

};

