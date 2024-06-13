import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorTutorialStep from './EditorTutorialStep.js';
import Generic from '../../classes/helpers/Generic.js';
import Asset from '../../classes/Asset.js';
import Tutorial from '../../classes/Tutorial.js';
import GameEvent from '../../classes/GameEvent.js';

const DB = 'tutorial',
	CONSTRUCTOR = Tutorial;

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
		html += '<label>Event: <select name="event" class="saveable">';
		for( let i in GameEvent.Types ){
			html += '<option value="'+esc(GameEvent.Types[i])+'" '+(dummy.event === GameEvent.Types[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';
	html += '</div>';

	html += 'Steps: <div class="steps"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.steps").appendChild(EditorTutorialStep.assetTable(this, asset, "steps"));


	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'event'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*event' : true,
		steps : asset => {
			let steps = asset.steps || [];
			return esc(steps.join(', '));
		},
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'tutorial_'+Generic.generateUUID()
	}));

};

// Returns a help text
export function help(){

	let out = '';

	return out;

};

