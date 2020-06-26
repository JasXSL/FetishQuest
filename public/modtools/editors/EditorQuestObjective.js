import HelperAsset from './HelperAsset.js';
import * as EditorQuestObjectiveEvent from './EditorQuestObjectiveEvent.js';
import * as EditorCondition from './EditorCondition.js';

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
		label : 'reward'+Math.ceil(Math.random()*0xFFFFFFF),
		type : QuestReward.Types.Asset
	}));

};
*/
