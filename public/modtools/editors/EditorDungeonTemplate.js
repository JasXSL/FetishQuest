import HelperAsset from './HelperAsset.js';
import Generic from '../../classes/helpers/Generic.js';
import DungeonTemplate from '../../classes/templates/DungeonTemplate.js';
import * as EditorDungeonRoom from './EditorDungeonRoom.js';

const DB = 'dungeonTemplates',
	CONSTRUCTOR = DungeonTemplate;

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
		html += '<label>Todo: <input type="number" min=-1 step=0.01 name="difficulty" class="saveable" value="'+esc(dummy.difficulty)+'" /></label>';
	html += '</div>';

	// Keep
	html += 'Viable Room Templates: <div class="rooms"></div>';


	this.setDom(html);

	

	// Bind linked objects
	this.dom.querySelector("div.rooms").appendChild(EditorDungeonRoom.assetTable(this, asset, "rooms", undefined, undefined, undefined, EditorDungeonRoom.filterOnlyOrphaned));

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*rooms' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'dTemp_'+Generic.generateUUID(),
	}));

};

export function help(){

	let out = '';
	out += '<h3>Todo</h3>'+
		'<p>Todo</p>';

	return out;

};

