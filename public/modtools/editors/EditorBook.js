import HelperAsset from './HelperAsset.js';

import * as EditorGameAction from './EditorGameAction.js';
import * as EditorBookPage from './EditorBookPage.js';
import Generic from '../../classes/helpers/Generic.js';
import Book from '../../classes/Book.js';

const DB = 'books',
	CONSTRUCTOR = Book;

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
	html += '</div>';

	html += 'Pages: <div class="pages"></div>';
	html += 'Game Actions: <div class="game_actions"></div>';

	this.setDom(html);

	this.dom.querySelector("div.pages").appendChild(EditorBookPage.assetTable(this, asset, "pages", false, true));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions"));

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
		'*pages' : asset => {return asset.pages.length;},
		'*game_actions' : asset => asset.game_actions.length,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'book_'+Generic.generateUUID(),
		name : 'New Book'
	}));

};


export function help(){

	let out = '';
	out += '<h3>Book:</h3>'+
		'<p>A book that can be read on the HUD. You can attach these via Game Actions. Commonly used on world items and inventory items.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Book title.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Pages</td>'+
			'<td>Adds pages to the book.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Game Actions</td>'+
			'<td>Game actions to perform when someone reads the book. Target is the player that read the book.</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};


