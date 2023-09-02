import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';

import * as EditorCondition from './EditorCondition.js';
import Roleplay, { RoleplayStageOptionGoto } from '../../classes/Roleplay.js';

const DB = 'roleplayStageOptionGoto',
	CONSTRUCTOR = RoleplayStageOptionGoto;


export function nodeBlock( nodes ){

	nodes.addBlockType("Goto", {color:"#AFF", width:'100px'})
		.addInput('Stage', 'Stage', {single:true})
	;

}


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

	// Find parent mod
	let stageOption = mod.getListObjectParent('roleplayStageOption', 'index', id);
	if( !stageOption )
		console.error("Unable to find parent of roleplayStageOptionGoto", asset);

	console.log("Parent stageOption ", stageOption);
	let stage = mod.getListObjectParent('roleplayStage', 'options', stageOption.id);
	if( !stage && stageOption._e )
		stage = mod.getListObjectParent('roleplayStage', 'options', stageOption._e);
	if( !stage )
		console.error("Unable to find stage of roleplayStageOptionGoto", dummy, "id", stageOption.id);

	let rp = mod.getListObjectParent('roleplay', 'stages', stage.id);
	if( !rp && stage._e )
		rp = mod.getListObjectParent('roleplay', 'stages', stage._e);
	if( !rp )
		console.error("Unable to find parent of roleplayStage", stage);

	let stages = rp.stages.map(el => mod.getAssetById('roleplayStage', el));


	let html = '';
	html += '<div class="labelFlex">';
		html += '<label title="">Go to: <select name="index" class="saveable">';
			html += '<option value="">- END RP -</option>';
			html += '<option value="_EXIT_" '+(dummy.index === '_EXIT_' ? 'selected' : '')+'>- END But do not set finished -</option>';
		for( let s of stages ){

			let text = s.text ? mod.getAssetById('texts', s.text[0]) : '???';
			html += '<option value="'+esc(s._e || s.id)+'" '+(s.id === dummy.index ? 'selected' : '')+'>['+esc(s._e || s.id)+'] '+esc((text.text || '').substr(0, 64)+'...')+'</option>';

		}
		html += '<select></label>';
	html += '</div>';

	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	
	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){

	// Set an optional onCreate callback
	//win.editorOnCreate = onCreate;

	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'id',
		asset => {

			let idx = asset.index;
			let stage = mod.getAssetById('roleplayStage', idx);
			if( stage ){
				idx = 's_'+stage.id;

				console.log("Stage ", stage);
				if( Array.isArray(stage.text) ){

					let text = mod.getAssetById('texts', stage.text[0]);
					console.log("Text: ", text);
					if( text?.text )
						idx = text.text.substr(0, 128)+'...';

				}

			}

			return idx;
					
		}, 
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

export function help(){
	let out = '<h3>RoleplayStageOptionGoto</h3>';
	out += '<p>Lets you select a stage in the roleplay to go to, and set conditions for that option to trigger.</p>';
	out += '<p>In conditions, target is the player who selected the response, and sender is the RP player of the current stage. If no sender is present, it uses the same as target.</p>';
	

	return out;
}
