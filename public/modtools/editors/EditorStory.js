import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorDungeon from './EditorDungeon.js';
import * as EditorAssetTemplate from './EditorAssetTemplate.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import * as EditorGameAction from './EditorGameAction.js';
import Faction from '../../classes/Faction.js';
import Generic from '../../classes/helpers/Generic.js';
import Story from '../../classes/Story.js';


const DB = 'story',
	CONSTRUCTOR = Story;

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
		html += '<label>Icon: <input type="text" name="icon" class="saveable" value="'+esc(dummy.icon)+'" /></label>';
		html += '<label>Max Nr Player Options: <input type="number" name="max_nr_player_options" min=0 step=1 class="saveable" value="'+esc(dummy.max_nr_player_options)+'" /></label>';
		html += '<label>Min Nr Player Options: <input type="number" name="min_nr_player_options" min=1 step=1 class="saveable" value="'+esc(dummy.min_nr_player_options)+'" /></label>';
		html += '<label>Max Level: <input type="number" name="max_level" min=1 step=1 class="saveable" value="'+esc(dummy.max_level)+'" /></label>';
		html += '<label>Allow Gallery: <input type="checkbox" name="allow_gallery" class="saveable" value=1 '+(dummy.allow_gallery ? 'checked' : '')+' /></label>';
		html += '<label>Freeze Time: <input type="checkbox" name="freze_time" class="saveable" value=1 '+(dummy.freeze_time ? 'checked' : '')+' /></label>';
		html += '<label>Unleveled equipment: <input type="checkbox" name="leveled_gear" class="saveable" value=1 '+(dummy.leveled_gear ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="desc" class="saveable">'+esc(dummy.desc)+'</textarea>';

	html += '<br />Selectable main characters: <div class="player_options"></div>';
	html += '<br />NPCs to add on game start: <div class="npcs"></div>';

	html += '<br />Allowed asset templates: <div class="allowed_templates_armor"></div>';
	html += '<br />Allowed material templates: <div class="allowed_templates_material"></div>';
	html += '<br />Start game actions: <div class="game_actions"></div>';

	html += '<br />Starting area: <div class="start_dungeon"></div>';
	
	const dungeon = mod.getAssetById('dungeons', dummy.start_dungeon);
	if( dungeon ){

		html += '<label>Start Room: <select name="start_cell" class="saveable">';
		for( let label of dungeon.rooms ){
			
			const room = mod.getAssetById('dungeonRooms', label);
			html += '<option value="'+esc(label)+'" '+(label === dummy.start_cell ? 'selected'  : '')+'>'+esc(room.name)+'</option>';

		}
		html += '</label>';

	}
	this.setDom(html);

	this.dom.querySelector("div.player_options").appendChild(EditorPlayer.assetTable(this, asset, "player_options"));
	this.dom.querySelector("div.npcs").appendChild(EditorPlayer.assetTable(this, asset, "npcs"));
	this.dom.querySelector("div.start_dungeon").appendChild(EditorDungeon.assetTable(this, asset, "start_dungeon", true));

	this.dom.querySelector("div.allowed_templates_armor").appendChild(EditorAssetTemplate.assetTable(this, asset, "allowed_templates_armor"));
	this.dom.querySelector("div.allowed_templates_material").appendChild(EditorMaterialTemplate.assetTable(this, asset, "allowed_templates_material"));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions"));


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
		'*desc' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'story_'+Generic.generateUUID(),
		name : 'New Story'
	}));

};


// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Story:</h3>'+
		'<p>Stories are entry points into the game. They get put on the main menu.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your story.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Icon</td>'+
			'<td>Link to an image file used as a background for the main menu entry. Recommended min size is 512x256.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Nr Player Options</td>'+
			'<td>Maximum nr of player characters for this story. Capped at 4.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min Nr Player Options</td>'+
			'<td>Min nr of player characters for this campaign.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Level</td>'+
			'<td>Sets player max level.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allow Gallery</td>'+
			'<td>Allow gallery and custom characters to be picked. Otherwise, only players in selectable main characters are allowed.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Freeze Time</td>'+
			'<td>Prevents the day cycle from passing other than from game actions with force set.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Unleveled Equipment</td>'+
			'<td>Removes levels from equipment.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe your story. Keep it short. One to two sentences works best.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Selectable Main Characters</td>'+
			'<td>Player assets for characters you should be able to select. Makes the most sense with Allow Gallery disabled.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>NPCs to add on game start</td>'+
			'<td>NPC "followers" to add to the player team on game start. Useful if you want an AI character to accompany you</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allowed asset templates</td>'+
			'<td>Asset templates allowed in random loot. Only affects autoGen loot, not NPCs or shops.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allowed material templates</td>'+
			'<td>Material templates allowed in random loot. Only affects autoGen loot, not NPCs or shops.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Start game actions</td>'+
			'<td>Game actions to run once when the game starts</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};
