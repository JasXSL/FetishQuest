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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Allow up: <input type="checkbox" name="allowUp" class="saveable" '+(dummy.allowUp ? 'checked' : '')+' /></label>';
		html += '<label>Allow down: <input type="checkbox" name="allowDown" class="saveable" '+(dummy.allowDown ? 'checked' : '')+' /></label>';
		html += '<label>Levers: <input type="checkbox" name="levers" class="saveable" '+(dummy.levers ? 'checked' : '')+' /></label>';
		html += '<label>Random Encounters: <input type="checkbox" name="randomEncounters" class="saveable" '+(dummy.randomEncounters ? 'checked' : '')+' /></label>';
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
	out += '<h3>Proc. Dungeon:</h3>'+
		'<p>This lets you create procedural dungeons (exploration dungeons). In order to link a procedural dungeon to the world, create a door in the dungeon room and double click it to add a game action of type "proceduralDungeon", set the label to a unique label for your dungeon, and then link this dungeon template to the game action.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Allow up</td>'+
			'<td>Allows ladders going up. Usually used for underground dungeons, to allow cells above the entry level.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allow Down</td>'+
			'<td>Allows the generator to create rooms below the entry floor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Levers</td>'+
			'<td>Allows the dungeon to add levers to unlock doors. Mostly used for underground dungeons.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Random Encounters</td>'+
			'<td>Lets the generator create random encounters with dice rolls and such.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Room templates</td>'+
			'<td>Room template objects to use as the rooms. You will be able to attach conditions to these, like roomGroundLevel to only spawn on the room entry level, and roomBelowGroundLevel for caves and such.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Encounters</td>'+
			'<td>Encounters you may find in the dungeon. You are able to attach conditions to these, generally things like roomGroundLevel or roomBelowGroundLevel to decide which floors certain encounters can be in.</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};

