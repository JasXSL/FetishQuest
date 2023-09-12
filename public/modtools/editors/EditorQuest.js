import HelperAsset from './HelperAsset.js';
import * as EditorQuestReward from './EditorQuestReward.js';
import * as EditorQuestObjective from './EditorQuestObjective.js';
import Generic from '../../classes/helpers/Generic.js';

import Quest from '../../classes/Quest.js';

const DB = 'quests',
	CONSTRUCTOR = Quest;

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Exp multiplier: <input type="number" min=0 step=0.01 name="exp_multiplier" class="saveable" value="'+esc(dummy.exp_multiplier)+'" /></label>';
		html += '<label>Hide Rewards: <input type="checkbox" class="saveable" name="hide_rewards" '+(dummy.hide_rewards ? 'checked' : '')+' /></label>';
		html += '<label title="Makes the money reward scale by players">Multiply Money: <input type="checkbox" class="saveable" name="multiply_money" '+(dummy.multiply_money ? 'checked' : '')+' /></label>';
		html += '<label title="Copies the reward assets so that every player gets one instead of only one">Multiply Reward: <input type="checkbox" class="saveable" name="multiply_reward" '+(dummy.multiply_reward ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description)+'</textarea>';

	html += 'Rewards: <div class="rewards"></div>';
	html += 'Objectives: <div class="objectives"></div>';
	html += '<span title="Allows you to create hand-ins by events instead of RP">Completion Objectives: </span><div class="completion_objectives"></div>';


	this.setDom(html);

	this.dom.querySelector("div.rewards").appendChild(EditorQuestReward.assetTable(this, asset, "rewards", false, true));
	this.dom.querySelector("div.objectives").appendChild(EditorQuestObjective.assetTable(this, asset, "objectives", false, true));
	this.dom.querySelector("div.completion_objectives").appendChild(EditorQuestObjective.assetTable(this, asset, "completion_objectives", false, true));

	HelperAsset.autoBind( this, asset, DB);





};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*name' : true,
		exp_multiplier : true,
		hide_rewards : true,
		multiply_money : true,
		multiply_reward : true,
		'*description' : true,
		rewards : true,
		objectives : true,
		completion_objectives : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'quest_'+Generic.generateUUID(),
		name : 'New Quest'
	}));

};

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Quest:</h3>'+
		'<p>Quests are tasks for the players to do.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>It\'s the name of the quest! Think of something creative!</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Exp Multiplier</td>'+
			'<td>Exp is based on nr of objectives completed. But this lets you multiply against that if you want to give more or less experience.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hide Rewards</td>'+
			'<td>Hides the quest rewards.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Multiply Money</td>'+
			'<td>Multiplies the money reward by nr of players and distributes it among the players. Recommended on.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Multiply Reward</td>'+
			'<td>When checked, any item rewards will be copied and given to all players instead of only the player that handed the quest in.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe the basic premise of the quest. You can add additional descriptions to the objectives.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Rewards</td>'+
			'<td>Attach assets, actions, or reputation to give the players. Can have conditions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Objectives</td>'+
			'<td>The objectives that need to be done to complete the quest.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Completion Objectives</td>'+
			'<td>Legacy. Do not use.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

