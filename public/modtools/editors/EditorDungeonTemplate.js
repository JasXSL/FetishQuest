import HelperAsset from './HelperAsset.js';
import Generic from '../../classes/helpers/Generic.js';
import DungeonTemplate from '../../classes/templates/DungeonTemplate.js';
import * as EditorDungeonSubtemplate from './EditorDungeonSubTemplate.js';


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
		html += '<label>Allow up: <input type="checkbox" name="allowUp" class="saveable" '+(dummy.allowUp ? 'checked' : '')+' /></label>';
		html += '<label>Allow down: <input type="checkbox" name="allowDown" class="saveable" '+(dummy.allowDown ? 'checked' : '')+' /></label>';
		html += '<label>Levers: <input type="checkbox" name="levers" class="saveable" '+(dummy.levers ? 'checked' : '')+' /></label>';
	html += '</div>';

	// Keep
	html += 'Room Templates: <div class="rooms"></div>';
	html += 'Encounters: <div class="encounters"></div>';


	this.setDom(html);


	// Bind linked objects
	this.dom.querySelector("div.rooms").appendChild(EditorDungeonSubtemplate.assetTable(this, asset, "rooms", false, true, false, 'room'));
	this.dom.querySelector("div.encounters").appendChild(EditorDungeonSubtemplate.assetTable(this, asset, "encounters", false, true, false, 'encounter'));

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
		'*encounters' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'dTemp_'+Generic.generateUUID(),
	}));

};

export function help(){

	let out = '';
	out += '<h3>Here you can create dungeon templates for the procedural generator</h3>'+
		'<p></p>';

	return out;

};

