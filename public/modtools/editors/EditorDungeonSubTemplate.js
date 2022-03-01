import HelperAsset from './HelperAsset.js';
import Generic from '../../classes/helpers/Generic.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorDungeonRoom from './EditorDungeonRoom.js';
import * as EditorEncounter from './EditorEncounter.js';
import {DungeonTemplateSub} from '../../classes/templates/DungeonTemplate.js';

const DB = 'dungeonSubTemplates',
	CONSTRUCTOR = DungeonTemplateSub;

/*
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
	html += '</div>';
*/

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;
		
	if( !asset || !this.custom || !(["room", "encounter"].includes(this.custom)) ){
		return this.close();
	}

	let html = '';
	// Keep
	if( this.custom === 'room' )
		html += 'Room: <div class="asset"></div>';
	else
		html += 'Encounter: <div class="asset"></div>';
	

	html += 'Conditions: <div class="conditions"></div>';


	this.setDom(html);


	// Bind linked objects
	
	if( this.custom === 'room' )
		this.dom.querySelector("div.asset").appendChild(EditorDungeonRoom.assetTable(this, asset, "asset", true));
	else
		this.dom.querySelector("div.asset").appendChild(EditorEncounter.assetTable(this, asset, "asset", true));

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset, windowData ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['asset', 'conditions'], single, parented, ignoreAsset, windowData, true );
};


// Listing
export function list(){

	// Not used
	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*asset' : true,
		'*conditions' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'dSub_'+Generic.generateUUID(),
	}));

};

export function help(){

	let out = '';
	out += '<h3>Todo</h3>'+
		'<p></p>';

	return out;

};

