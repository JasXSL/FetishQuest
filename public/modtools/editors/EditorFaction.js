import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import Faction from '../../classes/Faction.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'factions',
	CONSTRUCTOR = Faction;

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
		html += '<label title="Between -300 (hostile) to 300 (exalted)">Initial Standing: <input type="number" name="standing" class="saveable" value="'+esc(dummy.standing)+'" step=1 /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="desc" class="saveable">'+esc(dummy.desc)+'</textarea>';

	this.setDom(html);

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
		'*standing' : true,
		'*desc' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'faction_'+Generic.generateUUID(),
		name : 'New Faction'
	}));

};

