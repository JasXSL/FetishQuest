import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorAssetTemplate from './EditorAssetTemplate.js';
import * as EditorWrapper from './EditorWrapper.js';
import PlayerTemplate, { PlayerTemplateLoot } from '../../classes/templates/PlayerTemplate.js';
import stdTag from '../../libraries/stdTag.js';
import Generic from '../../classes/helpers/Generic.js';



const DB = 'playerTemplateLoot',
	CONSTRUCTOR = PlayerTemplateLoot;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	console.log(asset, dummy);

	if( !asset )
		return this.close();

	let html = '';

	html += 'Asset: <div class="asset"></div>';


	html += '<div class="labelFlex">';
		html += '<label>Min: <input type="number" name="min" min=0 max=1000 step=1 class="saveable" value="'+esc(dummy.min)+'" /></label>';
		html += '<label>Max: <input type="number" name="max" min=0 max=1000 step=1 class="saveable" value="'+esc(dummy.max)+'" /></label>';
		html += '<label>Chance (0-1): <input type="number" name="chance" min=0 max=1 step=0.001 class="saveable" value="'+esc(dummy.chance)+'" /></label>';
	html += '</div>';


	this.setDom(html);


	this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "asset", true));
	

	HelperAsset.autoBind( this, asset, DB);

	

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['asset', 'min', 'max', 'chance'], single, true);
}


// Listing
export function list(){


	const fields = {
		'*asset' : true,
		'*min' : true,
		'*max' : true,
		'*chance' : true,
	};

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'playerTemplate_'+Generic.generateUUID()
	}));

};

