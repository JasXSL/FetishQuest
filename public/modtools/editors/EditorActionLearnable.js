import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorAction from './EditorAction.js';
import ActionLearnable from '../../classes/ActionLearnable.js';


const DB = 'actionLearnable',
	CONSTRUCTOR = ActionLearnable;

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
		html += '<label title="Cost in copper, -1 auto generates">Cost: <input name="cost" value="'+esc(dummy.cost)+'" type="number" step=1 min=-1 class="saveable" /></label>';
		html += '<label>Auto learn: <input name="auto_learn" '+(dummy.auto_learn ? 'checked' : '')+' class="saveable" type="checkbox" /></label>';
	html += '</div>';

	html += 'Action: <br /><div class="actionPicker"></div>';
	html += 'Conditions: <br /><div class="conditions"></div>';
	
	this.setDom(html);


	// Bind stuff

	// Action
	this.dom.querySelector("div.actionPicker").appendChild(EditorAction.assetTable(this, asset, "action", true));

	// conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'action', 'auto_learn'], single);
}



// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		action : true,
		auto_learn : true,
		cost : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'action'+Math.ceil(Math.random()*0xFFFFFFF),
		action : 'lowBlow',
		auto_learn : false,
	}));

};

