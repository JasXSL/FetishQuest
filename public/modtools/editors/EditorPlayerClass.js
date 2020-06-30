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
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="Lets you append or prepend the class name. Useful for NPCs.">Name type: <select name="name_type" class="saveable">';
		for( let i in PlayerClass.NameType )
			html += '<option value="'+esc(PlayerClass.NameType[i])+'" '+(PlayerClass.NameType[i] === dummy.name_type ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		html += '<label title="Not selectable on character creation screen">Monster class: <input type="checkbox" name="monster_only" '+(dummy.monster_only ? 'checked' : '')+' class="saveable"  /></label>';

	// Stats:
		for( let i in Action.Types ){
			const label = "sv"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Action.Types ){
			const label = "bon"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Player.primaryStats ){
			const label = Player.primaryStats[i];
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
		label : true,
		name : true,
		name_type : true,
		description : true,
		monster_only : true,
	};
	for( let i in Action.Types )
		fields["sv"+Action.Types[i]] = true;
	for( let i in Player.primaryStats )
		fields[Player.primaryStats[i]] = true;
		

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'class_'+Generic.generateUUID(),
		name : 'Custom Class',
		desc : 'This is my custom class',
	}));

};

