import HelperAsset from './HelperAsset.js';

import Generic from '../../classes/helpers/Generic.js';
import Book, { BookPage } from '../../classes/Book.js';

const DB = 'bookPages',
	CONSTRUCTOR = BookPage;

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
		html += '<label>Text: <br /><textarea name="text" class="saveable">'+esc(dummy.text, true)+'</textarea></label>';
	html += '</div>';

	this.setDom(html);

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['id', 'text'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*id' : true,
		'*text' : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'bookPage_'+Generic.generateUUID(),
		text : 'Once upon a time...'
	}));

};

