import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import Faction from '../../classes/Faction.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'factions',
	CONSTRUCTOR = Faction;

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
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="Between -300 (hostile) to 300 (exalted)">Initial Standing: <input type="number" name="standing" class="saveable" value="'+esc(dummy.standing)+'" step=1 /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="desc" class="saveable">'+esc(dummy.desc)+'</textarea>';

	this.setDom(html);

	HelperAsset.autoBind( this, asset, DB);





};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*name' : true,
		'*standing' : true,
		'*desc' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'faction_'+Generic.generateUUID(),
		name : 'New Faction'
	}));

};

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Faction:</h3>'+
		'<p>Factions aren\'t used much nowadays since the guilds now all have quests to unlock their gear. But these may be used in the future for repeatable quests. Players can check faction standings via conditions. Factions affect the game, not individual players. Factions can be added or subtracted from via a GameAction.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out +=
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your faction.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Initial Standing</td>'+
			'<td>What standing do player start the game with? -300 is considered hostile and 300 exalted.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe the faction.</td>'+
		'</tr>'		
	;
		

	out += '</table>';

	

	return out;

};

