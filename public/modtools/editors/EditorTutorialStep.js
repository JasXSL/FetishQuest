import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorTutorialStep from './EditorTutorialStep.js';
import Generic from '../../classes/helpers/Generic.js';
import Asset from '../../classes/Asset.js';
import Tutorial, { TutorialStep } from '../../classes/Tutorial.js';
import GameEvent from '../../classes/GameEvent.js';

const DB = 'tutorialStep',
	CONSTRUCTOR = TutorialStep;

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
		html += '<label>Text: <input type="text" name="text" class="saveable" value="'+esc(dummy.text)+'" /></label>';
		html += '<label>Query selector: <input type="text" name="querySelector" class="saveable" value="'+esc(dummy.querySelector)+'" /></label>';
		html += '<label>Arrow: <input type="checkbox" name="arrow" value=1 class="saveable" '+(dummy.arrow ? 'checked' : '')+' /></label>';
	html += '</div>';
	this.setDom(html);


	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['id', 'text', 'querySelector'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'id' : true,
		'*text' : true,
		'*querySelector' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({}));

};

// Returns a help text
export function help(){

	let out = '';

	return out;

};

