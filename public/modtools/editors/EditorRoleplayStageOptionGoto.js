import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';

import * as EditorCondition from './EditorCondition.js';
import Roleplay, { RoleplayStageOptionGoto } from '../../classes/Roleplay.js';

const DB = 'roleplayStageOptionGoto',
	CONSTRUCTOR = RoleplayStageOptionGoto;

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

	// Gets an index, defaulting to def
	const getIndex = (idx, def) => {
		if( isNaN(idx) )
			return def;
		return parseInt(idx);
	}

	console.log("Mod:", mod);

	// Find parent mod
	let stageOption = mod.getListObjectParent('roleplayStageOption', 'index', id);
	if( !stageOption )
		console.error("Unable to find parent of roleplayStageOptionGoto", asset);
	let stage = mod.getListObjectParent('roleplayStage', 'options', stageOption.id);
	if( !stage )
		console.error("Unable to find parent of roleplayStageOption", stage.id);
	let stageIdx = getIndex(stage.index, 0);
	let rp = mod.getListObjectParent('roleplay', 'stages', stage);
	if( !rp && stage._e )
		rp = mod.getListObjectParent('roleplay', 'stages', stage._e);

	if( !rp )
		console.error("Unable to find parent of roleplayStage", stage);

	let stages = rp.stages.map(el => mod.getAssetById('roleplayStage', el));

	console.log("Stages:", stages);

	let html = '';
	let index = getIndex(dummy.index, -1);
	html += '<div class="labelFlex">';
		html += '<label title="">Go to: <select name="index" class="saveable">';
			html += '<option value="-1">- END RP -</option>';
		for( let s of stages ){

			let text = s.text ? mod.getAssetById('texts', s.text[0]) : '???';
			let idx = getIndex(s.index, 0);
			if( idx === stageIdx )
				continue;
			html += '<option value="'+idx+'" '+(idx === index ? 'selected' : '')+'>'+idx+' '+esc((text.text || '').substr(0, 16)+'...')+'</option>';

		}
		html += '<select></label>';
	html += '</div>';

	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "text", false, false));
	
	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){

	// Set an optional onCreate callback
	//win.editorOnCreate = onCreate;

	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'index', 
		'conditions'
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
