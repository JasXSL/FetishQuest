import HelperAsset from './HelperAsset.js';
import PlayerClass from '../../classes/PlayerClass.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'playerClasses',
	CONSTRUCTOR = PlayerClass;

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
		html += '<label title="Lets you append or prepend the class name. Useful for NPCs.">Name type: <select name="name_type" class="saveable">';
		for( let i in PlayerClass.NameType )
			html += '<option value="'+esc(PlayerClass.NameType[i])+'" '+(PlayerClass.NameType[i] === dummy.name_type ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		html += '<label title="Not selectable on character creation screen">Monster class: <input type="checkbox" name="monster_only" '+(dummy.monster_only ? 'checked' : '')+' class="saveable"  /></label>';
		
		html += '<label title="One of these momentum are guaranteed on turn start.">Momentum type: <select name="momType" data-type="int" class="saveable">';
		for( let i in Player.MOMENTUM )
			html += '<option value="'+esc(Player.MOMENTUM[i])+'" '+(Player.MOMENTUM[i] === dummy.momType ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

	// Stats:
		for( let i in Action.Types ){
			const label = "sv"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Action.Types ){
			const label = "bon"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}

	html += '</div>';

	html += 'Description: <br /><textarea class="saveable" name="description">'+esc(dummy.description)+'</textarea><br />';

	this.setDom(html);

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name', 'description'], single);
}


// Listing
export function list(){


	const fields = {
		'*label' : true,
		'*name' : true,
		name_type : true,
		'*description' : true,
		monster_only : true,
	};
	for( let i in Action.Types )
		fields["sv"+Action.Types[i]] = true;
		
		

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'class_'+Generic.generateUUID(),
		name : 'Custom Class',
		desc : 'This is my custom class',
	}));

};

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Player Class:</h3>'+
		'<p>A player class is mainly used for the 3 starting archetypes for player, and for NPC templates to give them different actions visa the Player Action table. It also allows you to modify character stats.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the class.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Name type</td>'+
			'<td>Mainly used for NPCs, appends or prepends the class name to their character name.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Monster class</td>'+
			'<td>Do not show up in the player class selector in the main menu character editor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Momentum type</td>'+
			'<td>Lets you set a guaranteed momentum type to gain every turn. Setting it to all picks one at random.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>sv (avoidance), bon (proficiency)</td>'+
			'<td>Lets you tune the character stats.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Class description. Appended to the character description.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

