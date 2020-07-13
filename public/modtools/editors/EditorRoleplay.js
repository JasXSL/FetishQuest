import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorRoleplayStage from './EditorRoleplayStage.js';
import Roleplay from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';


const DB = 'roleplay',
	CONSTRUCTOR = Roleplay;

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
		html += '<label title="This is only shown in the editor">Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Title: <input type="text" name="title" class="saveable" value="'+esc(dummy.title)+'" /></label>';
		html += '<label title="A small headshot of the player">Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';

		html += '<label title="Preserves stage when reopened">Persistent <input type="checkbox" class="saveable" name="persistent" '+(dummy.persistent ? 'checked' : '')+' /></label><br />';
		html += '<label title="Can only be opened once">Once <input type="checkbox" class="saveable" name="once" '+(dummy.once ? 'checked' : '')+' /></label><br />';
		html += '<label title="Autoplay">Auto Play <input type="checkbox" class="saveable" name="autoplay" '+(dummy.autoplay ? 'checked' : '')+' /></label><br />';
	html += '</div>';

	html += '<label title="Player in encounter to tie it to">Player: </label><div class="player"></div>';

	html += 'Stages: <div class="stages"></div>';


	// Conditions
	html += 'Conditions: <div class="conditions"></div>';



	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));

	this.dom.querySelector("div.stages").appendChild(EditorRoleplayStage.assetTable(this, asset, "stages", false, true));

	this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "player", true));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'title', 'desc'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*title' : true,
		'*desc' : true,
		'*player' : true,
		portrait : true,
		'*persistent' : true,
		'*once' : true,
		'*autoplay' : true,
		stages : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RP_'+Generic.generateUUID(),
		title : 'New Roleplay',
		autoplay : true,
		once : true,
		persistent : true,
	}));

};

