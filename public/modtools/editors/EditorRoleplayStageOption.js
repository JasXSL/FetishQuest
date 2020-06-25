import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';

import { RoleplayStageOption } from '../../classes/Roleplay.js';

const DB = 'roleplayStageOption',
	CONSTRUCTOR = RoleplayStageOption;

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

	// This is hardcoded, but it works because only RoleplayStage uses RoleplayStageOption and only in one field
	const parentRoleplayStage = modtools.mod.getAssetParent(DB, asset.label || asset.id);
	if( !parentRoleplayStage )
		return this.close();

	const parentRoleplay = modtools.mod.getAssetParent("roleplayStage", parentRoleplayStage.label || parentRoleplayStage.label);
	if( !parentRoleplay )
		return this.close();
	
	let html = '';
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';

		html += '<label>Go to stage: <select name="index" class="saveable">';
			html += '<option value="-1">-- END RP --</option>';
			for( let s of parentRoleplay.stages ){
				const stage = modtools.mod.getAssetById("roleplayStage", s);
				if( !stage )
					continue;
				// Try to fetch the text from said stage
				let text = '!! NO_TEXT !!';
				if( Array.isArray(stage.text) && stage.text.length ){
					
					const t = modtools.mod.getAssetById("texts", stage.text[0]);
					if( t )
						text = t.text;

				}
				html += '<option value="'+esc(stage.index)+'" '+(stage.index === dummy.index ? 'selected' : '')+'>'+esc('['+esc(stage.index || 0)+'] '+text)+'</option>';
			}
		html += '</select></label>';

		html += '<label>Text: <input type="text" name="text" class="saveable" value="'+esc(dummy.text)+'" /></label>';
		
		html += '<label>Output: <select name="chat" class="saveable">';
		for( let i in RoleplayStageOption.ChatType ){
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === dummy.chat[i] ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';

	html += '</div>';


	html += 'Game Actions: <div class="game_actions"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions", false, false));
	
	// Todo: options


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'text',
		asset => 'Go to '+asset.index,
		asset => asset.game_actions ? asset.game_actions.length+' Actions' : 'NO GAME ACTIONS',
		asset => {
			for( let i in RoleplayStageOption.ChatType ){
				if( asset.chat === RoleplayStageOption.ChatType[i] )
					return i+' chat';
			}
			return 'Unknown chat type';
		}
	], single, parented);
}


// Listing
/*
export function list(){


	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		text : true,
		chat : true,
		conditions : true,
		game_actions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RPStage'+Math.ceil(Math.random()*0xFFFFFFF),
	}));

};
*/
