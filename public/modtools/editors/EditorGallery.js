import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorPlayer from './EditorPlayer.js';
import Generic from '../../classes/helpers/Generic.js';
import PlayerGalleryTemplate from '../../classes/templates/PlayerGalleryTemplate.js';



const DB = 'gallery',
	CONSTRUCTOR = PlayerGalleryTemplate;

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
	html += '</div>';

	html += 'Armor Tags: <div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += 'Player: <div class="player"></div>';
	
	this.setDom(html);

	this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "player", true));

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

	

};

export function help(){

	let out = '';

	out += '<h3>Gallery:</h3>'+
		'<p>Here you can add Players that should be included on the new game page gallery of template players.</p>';
	return out;

};

// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'label', 
		'player'
	], single);
}


// Listing
export function list(){


	const fields = {
		'*label' : true,
		'*player' : el => { 
			if( !el.player )
				return 'UNSET';
			return el.player && el.player.label ? el.player.label : el.player;
		},
	};

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'gallery_'+Generic.generateUUID(),
	}));

};

