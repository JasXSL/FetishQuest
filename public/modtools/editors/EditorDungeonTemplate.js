import HelperAsset from './HelperAsset.js';
import Generic from '../../classes/helpers/Generic.js';
import DungeonTemplate from '../../classes/templates/DungeonTemplate.js';
import * as EditorDungeonSubtemplate from './EditorDungeonSubTemplate.js';
import * as EditorAudioMusic from './EditorAudioMusic.js';
import Audio from '../../classes/Audio.js';

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

		html += '<label title="Use a low value like less than 0.001. Use 0 for default.">Fog override: <input type="number" name="fog" min=0 max=1 class="saveable" value="'+esc(dummy.fog)+'" /></label>';
		html += '<label title="Indoors only. Hex code such as #AA33AA">Ambient light: <input type="text" name="dirLight" class="saveable" value="'+esc(dummy.dirLight)+'" /></label>';
		html += '<label>Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label>Ambiance volume <span class="valueExact"></span>: <input type="range" name="ambiance_volume" min=0 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';
		html += '<label>Saturation: <input type="number" name="sat" class="saveable" step=0.01 min=0 max=2 value="'+esc(dummy.sat)+'" /></label>';
		html += '<div class="labelFlex">';
			html += '<label>Reverb type: <select name="reverb" class="saveable">'+
				'<option value="none">None</option>'+
				'<option value="" '+(!dummy.reverb ? 'selected' : '')+'>Room Mesh</option>'
			;
			
			for( let i in Audio.reverbs )
				html += '<option value="'+i+'" '+(dummy.reverb === i ? 'selected' : '')+'>'+i+'</option>';
			html += '</select></label>';
			html += '<label title="PASS = use from room mesh">Reverb intensity <span class="valueExact zeroParent"></span>: <input type="range" name="reverbWet" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.reverbWet)+'" /></label>';
			html += '<label title="PASS = use from room mesh">Lowpass filter <span class="valueExact zeroParent"></span>: <input type="range" name="lowpass" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.lowpass)+'" /></label>';
			html += '<label><input type="button" class="testReverb" value="Test Audio" /></label>';
		html += '</div>';
	html += '</div>';

	// Keep
	html += 'Room Templates: <div class="rooms"></div>';
	html += 'Encounters: <div class="encounters"></div>';
	html += '<span title="">Ambient Music:</span> <div class="music"></div>';
	html += '<span title="">Combat Music:</span> <div class="music_combat"></div>';

	this.setDom(html);

	HelperAsset.bindTestReverb(
		this.dom.querySelector('select[name=reverb]'),
		this.dom.querySelector('input[name=reverbWet]'),
		this.dom.querySelector('input[name=lowpass]'),
		this.dom.querySelector('input.testReverb')
	);

	// Bind linked objects
	this.dom.querySelector("div.rooms").appendChild(EditorDungeonSubtemplate.assetTable(this, asset, "rooms", false, true, false, 'room'));
	this.dom.querySelector("div.encounters").appendChild(EditorDungeonSubtemplate.assetTable(this, asset, "encounters", false, true, false, 'encounter'));
	this.dom.querySelector("div.music").appendChild(EditorAudioMusic.assetTable(this, asset, "music", true));
	this.dom.querySelector("div.music_combat").appendChild(EditorAudioMusic.assetTable(this, asset, "music_combat", true));

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
			'<td>Fog Override</td>'+
			'<td>Adjusts the fog. Note: You won\'t see this changed in the editor. Set a value in the level editor to preview it, and copy it over to here.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ambient Light</td>'+
			'<td>Indoor only, adjusts the ambient light. Note: You won\'t see this changed in the editor. Set a value in the level editor to preview it, and copy it over to here.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ambiance</td>'+
			'<td>Sets a base ambient sound unless overridden by the cell.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ambiance volume</td>'+
			'<td>Sets volume of ambiance, between 0 and 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Saturation</td>'+
			'<td>Adjusts the scene saturation 1 is default and 0 grayscale. Note: You won\'t see this changed in the editor. Set a value in the level editor to preview it, and copy it over to here.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Reverb type</td>'+
			'<td>Sets a reverb type. Can be overridden in each cell.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ambient Music</td>'+
			'<td>Links ambient music. Can be overridden by encounters.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Combat Music</td>'+
			'<td>Links combat music. Can be overridden by encounters.</td>'+
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

