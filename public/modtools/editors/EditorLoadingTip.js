import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import Generic from '../../classes/helpers/Generic.js';
import LoadingTip from '../../classes/LoadingTip.js';

const DB = 'loadingTip',
	CONSTRUCTOR = LoadingTip;

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
		html += '<label>Tip: <br /><input type="text" name="text" style="width:100%" class="saveable" value="'+esc(dummy.text)+'" /></label>';
	html += '</div>';

	html += 'Conditions: <div class="conditions"></div>';
	
	this.setDom(html);

	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);

};

export function help(){

	let out = '';

	out += '<h3>Loading tips:</h3>'+
		'<p>Tips that show up on your loading screen. Conditions have all the players on the player team as targets.</p>';
	return out;

};

// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'text', 
		'conditions'
	], single);
}

// Listing
export function list(){

	const fields = {
		'*text' : true,
		'*conditions' : true,
	};

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		text : "Reduce enemy health to 0 while keeping yours above 0. Works every time.",
	}));

};

