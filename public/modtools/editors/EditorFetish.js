import HelperAsset from './HelperAsset.js';

import Generic from '../../classes/helpers/Generic.js';
import Fetish from '../../classes/Fetish.js';

const DB = 'fetishes',
	CONSTRUCTOR = Fetish;

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
	html += '<p>This will let you create fetishes to tie conditions to. These fetishes will show up in game settings too.</p>';
	html += '<h2>When to make a Fetish?</h2>';
	html += '<p>It\'s subjective, but ask yourself "if someone doesn\'t have this fetish, will they likely be turned off by it?"<br />'+
		'If the answer is yes, then you should create a fetish for it. For an example, most people who aren\'t into tickling will likely be indifferent to their character being tickled or tickling another character. '+
		'However, guro is highly likely to be a turnoff for people who aren\'t into it, and as such should be a marked fetish. If you\'re dubious, just make it a fetish regardless.'+
	'</p><p>'+
		'Mild stuff is fine to add without marking it as a fetish. Low blows, pain, and minor wounds are part of the battle, but heavy wounds and permanent damage should be marked as a fetish. Especially if you\'re making a mod that caters to multiple fetishes. If you make a mod that heavily focuses on a specific fetish, it doesn\'t matter much as the player can just uninstall the mod if they don\'t like that particular fetish. Also generic tentacle sex is a staple of FetishQuest and doesn\'t need to be marked as a fetish.'+
	'</p><p>'+
		'Incorporation of the fetish should be done by creating \'fetish\' type conditions. If a specific ability directly involves a fetish, you tie the condition to the ability. Otherwise tie it to the text itself.'+
	'</p>'+
	'<h2>Naming</h2>'+
	'<p>'+
		'Use lowercase with _ instead of space. Such as "egg_laying". When in doubt, consult <a href="https://www.f-list.net/" target="_blank">f-list</a>! If your fetish can be considered "hard", add _hard to the end. Such as "insects" or "insects_hard". The first one would be limited to insects crawling on, biting, pinching a player etc. Hard would involve more extreme things like insects crawling inside you.'+
	'</p>';


	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <textarea name="description" class="saveable">'+esc(dummy.description, true)+'</textarea></label>';
	html += '</div>';

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
		'*description' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'fetish_'+Generic.generateUUID(),
		description : 'Describe your fetish here'
	}));

};

