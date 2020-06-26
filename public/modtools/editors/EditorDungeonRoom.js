import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorAsset from './EditorAsset.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon, { DungeonRoom } from '../../classes/Dungeon.js';

const DB = 'dungeonRooms',
	CONSTRUCTOR = DungeonRoom;

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

	//this.index = 0; - Needs to be handled by dungeon editor
	//this.parent_index = 0; - Needs to be handled by dungeon editor
	/*
	Handled by dungeon editor
	this.x = 0;
	this.y = 0;
	this.z = 0;
	*/

	// Todo: Handle in the 3d editor
	//this.assets = [];			// First asset is always the room. These are DungeonRoomAssets


	let html = '';
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Outdoors <input type="checkbox" class="saveable" name="outdoors" '+(dummy.outdoors ? 'checked' : '')+' /></label><br />';
		html += '<label title="Lets you change the loading zoom, 0 for auto">Zoom: <input type="number" min=0 step=1 name="zoom" class="saveable" value="'+esc(dummy.zoom)+'" /></label>';
		html += '<label>Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label>Ambiance volume: <input type="range" name="ambiance_volume" min=0 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';
	html += '</div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Picks the first viable one when you enter, stays with it until respawn is triggered">Encounters:</span> <div class="encounters"></div>';
	

	this.setDom(html);



	// Bind linked objects
	this.dom.querySelector("div.encounters").appendChild(EditorAsset.assetTable(this, asset, "encounters"));

	// Todo: Bind rooms

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented, ignoreAsset);
}


// Listing
/*
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		difficulty : true,
		free_roam : true,
		vars : true,
		tags : true,
		consumables : true,
		rooms : true
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'dungeon'+Math.ceil(Math.random()*0xFFFFFFF),
		name : 'New Dungeon',
	}));

};
*/

