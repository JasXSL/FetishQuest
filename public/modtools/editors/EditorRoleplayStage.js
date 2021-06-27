import HelperAsset from './HelperAsset.js';

import * as EditorText from './EditorText.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';
import Roleplay, { RoleplayStage, RoleplayStageOption } from '../../classes/Roleplay.js';

const DB = 'roleplayStage',
	CONSTRUCTOR = RoleplayStage;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = this.asset.asset || modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();

	let html = '';
	html += '<div class="labelFlex">';
		html += '<label title="Lets you override the name of the speaking player">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" autocomplete="chrome-off" /></label>';
		html += '<label title="A small headshot of the player, overrides RP parent">Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';
		html += '<label>Chat type: <select name="chat" class="saveable" name="chat">';
		for( let i in RoleplayStageOption.ChatType )
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		html += '<label title="Stores target for rpTarget conditions and %P in texts">Store target: <input type="checkbox" name="store_pl" class="saveable" '+(dummy.store_pl ? 'checked' : '')+' /></label>';
		html += '<label title="Shuffles the text order">Shuffle type: <select name="shuffle_texts" class="saveable">';
		for( let stype in RoleplayStage.Shuffle ){
			const n = RoleplayStage.Shuffle[stype];
			html += '<option value="'+n+'" '+(parseInt(n) === parseInt(asset.shuffle_texts) ? 'selected' : '')+'>'+stype+'</option>';
		}
		html += '</select></label>';
	html += '</div>';


	html += '<label title="Player in encounter to tie it to, overrides RP parent">Player: </label><div class="player"></div>';


	html += '<span title="Text conditions are checked and the first valid text is used">Texts: </span><div class="text"></div>';
	html += '<span title="Sender is the person who triggered this stage, target is the player tied to the RP if possible">Game Actions: </span><div class="game_actions"></div>';


	html += 'Responses: <div class="options"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.text").appendChild(EditorText.assetTable(this, asset, "text", false, 2));
	this.dom.querySelector("div.options").appendChild(EditorRoleplayStageOption.assetTable(this, asset, "options", false, 2));
	this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "player", true));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions"));
	


	HelperAsset.autoBind( this, asset, DB);

};


// Special onCreate function to update the number using the highest number of parent
/* Legacy
function onCreate( win, asset ){

	let parent = mod.getListObjectParent('roleplay', 'stages', asset.id);
	console.log("Parent", parent);
	if( !parent ||!Array.isArray(parent.stages) )
		return;

	console.log("Stages", parent.stages);
	let highest = -1;
	for( let stage of parent.stages ){

		const s = window.mod.getAssetById(DB, stage);
		let index = (s && parseInt(s.index)) || 0;
		if( index > highest )
			highest = index;

	}
	
	asset.index = highest+1;

};
*/

// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){

	// Set an optional onCreate callback
	//win.editorOnCreate = onCreate;

	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'id', 
		asset => {

			if( asset.text && asset.text.length ){
				const text = window.mod.getAssetById('texts', asset.text[0]);
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
		label : 'RPStage_'+Generic.generateUUID(),
	}));

};
*/

export function help(){

	let out = '';

	out += '<h3>RoleplayStage:</h3>'+
		'<p>Contains texts the NPC can output, responses, GameActions to run, and metadata.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Optional. Lets you override the name of the player or NPC name specified in the parent roleplay.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Portrait</td>'+
			'<td>Optional override image of the player or item you are talking to. Useful if you are talking to something like an item or adding narration. Overrides any portrait/player specified in the parent roleplay.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Chat type</td>'+
			'<td>Whether the text should be output in a speech bubble by the NPC.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Store target</td>'+
			'<td>Lets you store the person who brought you to this stage in the roleplay, and use that target for use in a %P text in future stages.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Shuffle type</td>'+
			'<td>When using multiple texts you can use this to shuffle their order. ALL_BUT_LAST allows you to set a default response if no above responses pass filter. An example is the scruffy bar patron who shuffles a rumor text when you ask him for rumors, and has a fallback if he has no viable ones.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player</td>'+
			'<td>Player you want the main player you are talking of to be. Overrides the parent roleplay player. Optional.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Texts</td>'+
			'<td>Texts that should be output by the NPC. You can use multiple ones and attach conditions to the texts. Unless shuffle is set, it will trigger the first viable. Make sure to have a fallback without conditions last.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Game Actions</td>'+
			'<td>GameActions to trigger when entering this stage.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Responses</td>'+
			'<td>Player response options. I suggest you set these up after creating all stages with NPC texts.</td>'+
		'</tr>'
	;
	out += '</table>';

	

	return out;

};

