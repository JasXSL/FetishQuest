import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';

import { QuestObjectiveEvent } from '../../classes/Quest.js';

const DB = 'questObjectiveEvents',
	CONSTRUCTOR = QuestObjectiveEvent;

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
		html += '<label>Type: <select name="action" class="saveable">';
		for( let i in QuestObjectiveEvent.Actions )
			html += '<option value="'+esc(QuestObjectiveEvent.Actions[i])+'" '+(QuestObjectiveEvent.Actions[i] === dummy.action ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
	html += '</div>';


	html += '<pre class="wrap typeDesc"></pre><br />';
	html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';
	
	html += '<span title="Event conditions">Conditions: </span><div class="conditions"></div>';

	this.setDom(html);




	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	// Describe what the json editor data should look like
	const typeSelect = this.dom.querySelector("select[name=action]");
	const updateTypeDesc = () => {
		
		const typeDesc = this.dom.querySelector("pre.typeDesc"),
			type = typeSelect.value;

		typeDesc.innerText = QuestObjectiveEvent.ActionsDescs[type] || "Unknown type";		

	};
	updateTypeDesc();
	typeSelect.addEventListener("change", updateTypeDesc);

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'action',
		'data'
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
		label : 'reward_'+Generic.generateUUID(),
		type : QuestReward.Types.Asset
	}));

};
*/
