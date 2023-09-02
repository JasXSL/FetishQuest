import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStageOptionGoto from './EditorRoleplayStageOptionGoto.js';

import { RoleplayStageOption, RoleplayStageOptionGoto } from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'roleplayStageOption',
	CONSTRUCTOR = RoleplayStageOption;


export function nodeBlock( nodes ){

	nodes.addBlockType("Reply", {
		color:"#AFA", 
		width:'200px', 
		height:'50px', 
		onCreate : block => {
			console.log("Created reply block", block);
	}})
	.addInput('Gotos', 'Goto');

}


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
		html += '<label>Shuffle Options: <input type="checkbox" name="shuffle" class="saveable" '+(dummy.shuffle ? 'checked' : '')+' /></label>';

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
		'id',
		'text',
		asset => {
			
			if( asset.index && asset.index.length ){ 

				return '-> '+asset.index.map(el => { 

					let data = mod.getAssetById('roleplayStageOptionGoto', el);
					let idx = '???';
					if( data ){
						idx = data.index;
						let stage = mod.getAssetById('roleplayStage', idx);
						if( stage ){
							idx = 's_'+stage.id;

							if( Array.isArray(stage.text) ){

								let text = mod.getAssetById('texts', stage.text[0]);
								if( text )
									idx = String(text.text).substr(0, 32)+'...';

							}

						}
					}
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
	let out = '<h3>RoleplayStageOption</h3>';
	out += '<p>This is where you setup replies to roleplay NPC texts!</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Text</td>'+
			'<td>The text on the response button. You can use %S and %T here. Where %S is the player and %T the NPC. If you leave this empty, the game will set it to [Continue] and treat output as NONE.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Output</td>'+
			'<td>If set to default the player will output a chat bubble with the option text. Set it to none for options like [leave]</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Goto Options</td>'+
			'<td>Set a RoleplayStage target. The first viable one will be picked. This allows you to have a single response take the player to different Roleplay Stages based on conditions such as gender, stats, random chance etc.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>GameActions</td>'+
			'<td>Lets you trigger GameActions when the user selects this option.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Allows you to set a condition for showing this option. Such as requiring a certain level of physical proficiency to intimidate etc.</td>'+
		'</tr>'
	;
	out += '</table>';

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
