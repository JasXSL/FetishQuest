import HelperAsset from './HelperAsset.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorCondition from './EditorCondition.js';
import Generic from '../../classes/helpers/Generic.js';

import Quest, { QuestReward, QuestObjective } from '../../classes/Quest.js';

const DB = 'questRewards',
	CONSTRUCTOR = QuestReward;

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
		html += '<label>Type: <select name="type" class="saveable">';
		for( let i in QuestReward.Types )
			html += '<option value="'+esc(QuestReward.Types[i])+'" '+(QuestReward.Types[i] === dummy.type ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
	html += '</div>';

	// JSON reward type
	html += '<pre class="wrap typeDesc"></pre>';
	html += '<textarea data-rewardType="'+QuestReward.Types.Reputation+'" class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';

	// Alternative reward types
	html += '<span data-rewardType="'+QuestReward.Types.Asset+'" class="hidden">Asset Reward: <div class="data_asset"></div></span>';
	html += '<span data-rewardType="'+QuestReward.Types.Action+'" class="hidden">Action Reward: <div class="data_action"></div></span>';

	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);





	// Describe what the json editor data should look like
	const typeSelect = this.dom.querySelector("select[name=type]");
	const updateTypeDesc = save => {
		
		const typeDesc = this.dom.querySelector("pre.typeDesc"),
			type = typeSelect.value;

		typeDesc.innerText = QuestReward.TypeDescs[type] || "Unknown type";	
		
		this.dom.querySelectorAll('[data-rewardType]').forEach(el => el.classList.toggle('hidden', true));
		const editor = this.dom.querySelector('[data-rewardType='+type+']') || this.dom.querySelector('textarea[name=data]');
		if( !editor )
			return;

		// The select was changed, purge the data
		if( save ){

			if( type !== QuestReward.Types.Reputation )
				editor.querySelectorAll('tr[data-id]').forEach(el => el.remove());
			else
				editor.value = '{}';

			dummy.data = {};
			asset.data = {};
			
		}

		editor.classList.toggle("hidden", false);

	};
	updateTypeDesc();
	typeSelect.addEventListener("change", () => updateTypeDesc(true));

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.data_asset").appendChild(EditorAsset.assetTable(this, asset, "data", true, false, dummy.type !== QuestReward.Types.Asset));
	this.dom.querySelector("div.data_action").appendChild(EditorAction.assetTable(this, asset, "data", true, false, dummy.type !== QuestReward.Types.Action));


	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		asset => {
			if( typeof asset.data === "string" )
				return asset.data;
			
			if( asset.type === QuestReward.Types.Reputation && asset.data && asset.data.faction )
				return JSON.stringify(asset.data);
			
			return '???';
				
		}, 
		'type'
	], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*type' : true,
		'*data' : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'reward_'+Generic.generateUUID(),
		type : QuestReward.Types.Asset
	}));

};

