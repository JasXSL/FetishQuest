import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStageOptionGoto from './EditorRoleplayStageOptionGoto.js';

import { RoleplayStageOption, RoleplayStageOptionGoto } from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'roleplayStageOption',
	CONSTRUCTOR = RoleplayStageOption;

// Single asset editor
export function asset(){

	const 
		id = this.id,
		asset = this.asset.asset || mod.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset ){
		console.error("roleplayStageOption missing in window", this);
		return this.close();
	}

	let html = '';
	html += '<div class="labelFlex">';
	
		html += '<label>Text: <input type="text" name="text" class="saveable" value="'+esc(dummy.text)+'" /></label>';
		html += '<label>Output: <select name="chat" class="saveable">';
		for( let i in RoleplayStageOption.ChatType ){
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';

	html += '</div>';



	html += 'Goto Options: <div class="index"></div>';

	html += 'Game Actions: <div class="game_actions"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions", false, false));
	this.dom.querySelector("div.index").appendChild(EditorRoleplayStageOptionGoto.assetTable(this, asset, "index", false, 2));
	


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'text',
		asset => {
			
			if( asset.index && asset.index.length ){ 

				return 'Go to '+asset.index.map(el => { 
					let data = mod.getAssetById('roleplayStageOptionGoto', el);
					let idx = '???';
					if( data )
						idx = isNaN(data.index) ? -1 : parseInt(data.index);
					return idx;
				}).join(' OR ');

			}
			return 'END';
		},
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


export function help(){
	let out = '';
	out += '<p>This is a player response to a roleplay stage. When a player responds, gameActions are triggered and they are sent to the first viable stage set in Goto Options. If no option is viable, it ends the RP. This means if you want this option to end the RP, you can leave Goto Options empty!</p>';

	return out;
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
		label : 'RPStage_'+Generic.generateUUID(),
	}));

};
*/
