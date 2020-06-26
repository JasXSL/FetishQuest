import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorAsset from './EditorAsset.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon from '../../classes/Dungeon.js';

const DB = 'dungeons',
	CONSTRUCTOR = Dungeon;

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
		html += '<label title="-1 = auto">Difficulty: <input type="number" min=-1 step=0.01 name="difficulty" class="saveable" value="'+esc(dummy.difficulty)+'" /></label>';
		html += '<label title="Doesn\'t draw the back icon on doors">Free roam <input type="checkbox" class="saveable" name="free_roam" '+(dummy.free_roam ? 'checked' : '')+' /></label><br />';
	html += '</div>';

	html += 'Vars (this is a key/value object that can be acted upon by game actions and used in conditions):<br />';
	html += '<textarea class="json" name="vars">'+esc(JSON.stringify(dummy.vars))+'</textarea><br />';

	// Keep
	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += '<span title="Consumables you can find in chests here">Default consumables:</span> <div class="consumables"></div>';
	
	html += 'Rooms: <div class="rooms">';
	
	html += 'Todo: RoomEditor here';
	
	html += '</div>';


	this.setDom(html);



	// Bind linked objects
	this.dom.querySelector("div.consumables").appendChild(EditorAsset.assetTable(this, asset, "consumables"));

	// Todo: Bind rooms

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single);
}


// Listing
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

