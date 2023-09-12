import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorShopAsset from './EditorShopAsset.js';
import * as EditorAssetTemplate from './EditorAssetTemplate.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import Shop from '../../classes/Shop.js';
import Generic from '../../classes/helpers/Generic.js';
import Asset from '../../classes/Asset.js';

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Buys: <input type="checkbox" class="saveable" name="buys" '+(dummy.buys ? 'checked' : '')+' /></label><br />';
		html += '<label>Nr random armors to generate: <input type="number" step=1 min=0 class="saveable" name="gen_nr" value="'+esc(dummy.gen_nr)+'" /></label><br />';
		html += '<label>Min rarity: <select class="saveable" name="gen_rarity_min">';
		for( let i in Asset.Rarity ){
			html += '<option value="'+Asset.Rarity[i]+'" '+(dummy.gen_rarity_min === Asset.Rarity[i] ? 'selected' : '')+'>'+i+'</option>';
		}

		html += '</select></label><br />';
	html += '</div>';

	html += 'Items: <div class="items"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	html += 'Generated asset types: <div class="gen_assets"></div>';
	html += 'Generated asset materials: <div class="gen_mats"></div>';

	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.items").appendChild(EditorShopAsset.assetTable(this, asset, "items", false, true));
	this.dom.querySelector("div.gen_assets").appendChild(EditorAssetTemplate.assetTable(this, asset, "gen_assets"));
	this.dom.querySelector("div.gen_mats").appendChild(EditorMaterialTemplate.assetTable(this, asset, "gen_mats"));


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
		'*name' : true,
		'*buys' : true,
		items : asset => {
			const out = [];
			for( let item of asset.items ){

				const a = window.mod.getAssetById("shopAssets", item);
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

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Shop:</h3>'+
		'<p>Shops are places where you can buy and sell items (herp derp). Shops can have preset items and/or procedurally generated items. To tie a shop to a player, use a GameAction inside an Encounter.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the shop.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Buys</td>'+
			'<td>If unchecked, this shop only sells item, and will not buy your items.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Nr random armors to generate</td>'+
			'<td>How many random generated asset types to generate when met (and when stock expires).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min rarity</td>'+
			'<td>Min rarity of generated assets.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Items</td>'+
			'<td>ShopAsset items that should always be sold, provided they are in stock.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions needed to be met in order to visit this shop. This is per player.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Generated Asset Types</td>'+
			'<td>Asset Templates of items this merchant will sell.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Generated Asset Materials</td>'+
			'<td>Asset materials that the generated asset types can be. For an instance if you make a smith you might only add metal materials here.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

