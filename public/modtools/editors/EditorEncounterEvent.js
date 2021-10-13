import HelperAsset from './HelperAsset.js';
import { EncounterEvent } from '../../classes/Encounter.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorPlayerTemplate from './EditorPlayerTemplate.js';
import Generic from '../../classes/helpers/Generic.js';
import GameEvent from '../../classes/GameEvent.js';


const DB = 'encounterEvents',
	CONSTRUCTOR = EncounterEvent;

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Event Type: <select class="saveable" name="eventType">';
		for( let i in GameEvent.Types ){
			let val = GameEvent.Types[i];
			html += '<option value="'+esc(val)+'" '+(dummy.eventType === val ? 'selected' : '')+'>'+esc(i)+'</option>';
		}
		html += '</select></label><br />';
		html += '<label title="Max times this event can trigger, -1 = inf">Max Triggers: <input type="number" name="maxTriggers" step=1 min=-1 class="saveable" value="'+esc(dummy.maxTriggers)+'" /></label>';
		html += '<label title="Max actions that can trigger (from top to bottom), -1 = inf">Max Actions: <input type="number" name="maxActions" step=1 min=-1 class="saveable" value="'+esc(dummy.maxActions)+'" /></label>';
	html += '</div>';


	html += '<span>Actions: </span><div class="actions"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.actions").appendChild(EditorGameAction.assetTable(this, asset, "actions"));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'description'], single);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*eventType' : true,
		'*desc' : true,
		maxTriggers:true, 
		maxActions:true,
		'*actions':true,

	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'encEvt_'+Generic.generateUUID(),
		desc : 'Editordesc',
	}));

};

