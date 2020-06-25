import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';

import * as EditorText from './EditorText.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';
import Roleplay, { RoleplayStage, RoleplayStageOption } from '../../classes/Roleplay.js';
import Action from '../../classes/Action.js';

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
		html += '<label title="Lets you override the name of the speaking player">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="A unique identifier number">Index: <input type="number" step=1 name="index" class="saveable" value="'+esc(dummy.index)+'" /></label>';
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
	this.dom.querySelector("div.options").appendChild(EditorRoleplayStageOption.assetTable(this, asset, "options", false, true));
	


	HelperAsset.autoBind( this, asset, DB);

};


// Special onCreate function to update the number using the highest number of parent
function onCreate( win, asset ){

	if( !asset._mParent )
		return;

	const parent = window.mod.mod.getAssetById(asset._mParent.type, asset._mParent.label);
	if( !parent ||!Array.isArray(parent.stages) )
		return;

	let highest = 0;
	for( let stage of parent.stages ){
		const s = window.mod.mod.getAssetById(DB, stage);
		if( s && s.index > highest )
			highest = s.index;

	}
	
	asset.index = highest+1;

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){

	// Set an optional onCreate callback
	win.editorOnCreate = onCreate;

	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'index', 
		asset => {

			if( asset.text && asset.text.length ){
				const text = window.mod.mod.getAssetById('texts', asset.text[0]);
				if( text )
					return text.text;
			}
			return '!! NONE !!';
		},
		asset => asset.options && asset.options.length ? asset.options.length+' Responses' : 'MISSING RESPONSES'
	], single, parented);
}


// Listing
/*
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
*/
