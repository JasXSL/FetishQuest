import HelperAsset from './HelperAsset.js';
import * as EditorQuestObjectiveEvent from './EditorQuestObjectiveEvent.js';
import * as EditorCondition from './EditorCondition.js';
import Generic from '../../classes/helpers/Generic.js';

import Quest, { QuestReward, QuestObjective } from '../../classes/Quest.js';

const DB = 'questObjectives',
	CONSTRUCTOR = QuestObjective;

// Single asset editor
export function asset(){

	const  
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	console.log("Asset", asset);

	if( !asset )
		return this.close();

		
	let html = '';
	html += '<div class="labelFlex">';
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" disabled value="'+esc(dummy.label)+'"></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Amount Needed: <input type="text" name="amount" class="saveable" value="'+esc(dummy.amount)+'" /></label>';
		html += '<label>Amount To Start With: <input type="text" name="_amount" class="saveable" value="'+esc(dummy._amount)+'" /></label>';
	html += '</div>';

	html += '<span title="Text added to the quest description after this objective is completed">Completion desc: </span><br /><textarea name="completion_desc" class="saveable">'+esc(dummy.completion_desc)+'</textarea>';

	html += '<span title="Events that should increase this objective amount">Events: </span><div class="events"></div>';
	html += '<span title="Conditions needed to be met for this objective to show in the log">Visibility Conditions: </span><div class="visibility_conditions"></div>';

	this.setDom(html);




	this.dom.querySelector("div.visibility_conditions").appendChild(EditorCondition.assetTable(this, asset, "visibility_conditions"));
	this.dom.querySelector("div.events").appendChild(EditorQuestObjectiveEvent.assetTable(this, asset, "events", false, true));

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'name',
		asset => asset.amount > 1 ? 'x'+parseInt(asset.amount) : 'Once',
		asset => asset.events ? asset.events.length+' events' : 'NO EVENTS',
	], single, parented);
}

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Quest Objectives:</h3>'+
		'<p>Tied to quests. Quest objectives generally must be completed in order to finish a quest.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the objective.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Amount Needed</td>'+
			'<td>Can be used if you need to perform a task N times. Such as "kill 3 gropers". Otherwise leave at 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Amount to start with</td>'+
			'<td>Can be used to set a default value. Such as if an NPC gives you an item and tells you to find other items just like that. You can start with 1 since you were given 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Completion Desc</td>'+
			'<td>This text is appended to the quest description when this objective is completed.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Events</td>'+
			'<td>I suggest using encounter completion game actions and RPs to progress quests. But if you absolutely want to create a generic quest such as "kill 5 gropers", you have to use an event. You\'d typically create an event, then add conditions such as "eventIsPlayerDefeated" and "targetIsGroper".</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Visibility Conditions</td>'+
			'<td>Can be used to set when a condition should be shown in the quest log.</td>'+
		'</tr>'
		
	;
		

	out += '</table>';

	

	return out;

};


// Listing
/*
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		type : true,
		data : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'reward_'+Generic.generateUUID(),
		type : QuestReward.Types.Asset
	}));

};
*/
