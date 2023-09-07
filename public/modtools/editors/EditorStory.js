import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorDungeon from './EditorDungeon.js';
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
		html += '<label>Allow Gallery: <input type="checkbox" name="allow_gallery" class="saveable" value=1 '+(dummy.allow_gallery ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="desc" class="saveable">'+esc(dummy.desc)+'</textarea>';

	html += '<br />Selectable main characters: <div class="player_options"></div>';
	html += '<br />NPCs to add on game start: <div class="npcs"></div>';

	html += '<br />Starting area: <div class="start_dungeon"></div>';
	
	

	this.setDom(html);

	this.dom.querySelector("div.player_options").appendChild(EditorPlayer.assetTable(this, asset, "player_options"));
	this.dom.querySelector("div.npcs").appendChild(EditorPlayer.assetTable(this, asset, "npcs"));
	this.dom.querySelector("div.start_dungeon").appendChild(EditorDungeon.assetTable(this, asset, "start_dungeon", true));


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

