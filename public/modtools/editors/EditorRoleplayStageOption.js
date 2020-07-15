import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';

import { RoleplayStageOption, RoleplayStageOptionGoto } from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'roleplayStageOption',
	CONSTRUCTOR = RoleplayStageOption;

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

	// This is hardcoded, but it works because only RoleplayStage uses RoleplayStageOption and only in one field
	const parentRoleplayStage = modtools.mod.getAssetParent(DB, asset.label || asset.id);
	if( !parentRoleplayStage )
		return this.close();

	const parentRoleplay = modtools.mod.getAssetParent("roleplayStage", parentRoleplayStage.label || parentRoleplayStage.label);
	if( !parentRoleplay )
		return this.close();
	

	let html = '';
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';

		html += '<label>Text: <input type="text" name="text" class="saveable" value="'+esc(dummy.text)+'" /></label>';
		
		html += '<label>Output: <select name="chat" class="saveable">';
		for( let i in RoleplayStageOption.ChatType ){
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';

	html += '</div>';


	// Handle gotos
	const stages = parentRoleplay.stages.map(el => modtools.mod.getAssetById("roleplayStage", el));
	const buildStageSelect = (index, gotoIndex) => {
		let out = 'Stage: <select name="index::'+index+'::index" class="saveable">';
		out += '<option value="-1">-- END RP --</option>';
		for( let stage of stages ){
			// Try to fetch the text from said stage
			let text = '!! NO_TEXT !!';
			if( Array.isArray(stage.text) && stage.text.length ){

				const t = modtools.mod.getAssetById("texts", stage.text[0]);
				if( t )
					text = t.text;

			}
			out += '<option value="'+esc(stage.index)+'" '+(stage.index === gotoIndex ? 'selected' : '')+'>'+esc('['+esc(stage.index || 0)+'] '+text)+'</option>';
		}
		out += '</select>';
		return out;
	};
	

	dummy.index = RoleplayStageOptionGoto.loadThese(dummy.index, this);
	asset.index = RoleplayStageOptionGoto.saveThese(dummy.index, "mod");

	html += 'Go to:<div class="goto labelFlex">';
	let n = 0;
	for( let opt of dummy.index ){

		html += '<div class="option labelStyle">';
			html += buildStageSelect(n, opt.index);
			html += 'Conditions: <div class="optConds" data-index="'+n+'"></div>';
		html += '</div>';


		++n;
	}
	html += '</div>';

	html += '<div><input type="button" class="addGoto" value="Add Go To Option" /></div>';


	html += 'Game Actions: <div class="game_actions"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions", false, false));
	
	this.dom.querySelectorAll('div.optConds[data-index]').forEach(el => {
		const idx = parseInt(el.dataset.index);
		el.appendChild(EditorCondition.assetTable(this, asset, "index::"+idx+"::conditions", false, false));
	});

	this.dom.querySelectorAll('div.goto > div.option').forEach((el, idx) => {

		el.onclick = event => {
			
			if( event.ctrlKey && event.target === el ){
				
				event.stopImmediatePropagation();
				asset.index.splice(idx, 1);
				window.mod.setDirty(true);
				this.rebuild();
				
			}

		};
	});

	this.dom.querySelector('input.addGoto').onclick = event => {
		asset.index.push({index:-1});
		this.rebuild();
		window.mod.setDirty(true);
	};


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'text',
		asset => asset.index ? 'Go to '+asset.index.map(el => el.index === undefined ? -1 : el.index).join(' OR ') : 'NO GOTO',
		asset => asset.game_actions ? asset.game_actions.length+' Actions' : 'NO GAME ACTIONS',
		asset => {
			for( let i in RoleplayStageOption.ChatType ){
				if( asset.chat === RoleplayStageOption.ChatType[i] )
					return i+' chat';
			}
			return 'Unknown chat type';
		}
	], single, parented);
}


// Listing
/*
export function list(){


	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		text : true,
		chat : true,
		conditions : true,
		game_actions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RPStage_'+Generic.generateUUID(),
	}));

};
*/
