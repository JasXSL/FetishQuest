import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';

import * as EditorText from './EditorText.js';
import Roleplay, { RoleplayStage, RoleplayStageOption } from '../../classes/Roleplay.js';

const DB = 'roleplayStage',
	CONSTRUCTOR = RoleplayStage;

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
		html += '<label title="Lets you override the name of the speaking player">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="A unique identifier number">Index: <input type="text" name="index" class="saveable" value="'+esc(dummy.index)+'" /></label>';
		html += '<label title="Label of player in encounter to tie it to, overrides RP parent">Player: <input type="text" name="player" class="saveable" value="'+esc(dummy.player)+'" /></label>';
		html += '<label title="A small headshot of the player, overrides RP parent">Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';
		html += '<label>Chat type: <select name="chat">';
		for( let i in RoleplayStageOption.ChatType )
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		
	html += '</div>';




	// Conditions
	html += '<span title="Text conditions are checked and the first valid text is used">Texts: </span><div class="text"></div>';


	html += 'Responses: <div class="options"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.text").appendChild(EditorText.assetTable(this, asset, "text", false, true));
	
	// Todo: options


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'index', 'text'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		index : true,
		player : true,
		portrait : true,
		chat : true,
		text : true,
		options : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RPStage'+Math.ceil(Math.random()*0xFFFFFFF),
	}));

};

