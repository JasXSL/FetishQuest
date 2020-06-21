import Text from '../../classes/Text.js';

// this = window
export default function(){

	const modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById("texts", id),
		dummy = Text.loadThis(asset)
	;

	if( !asset )
		return this.close();

	this.name = asset.text.substr(0, 16)+'...';
	this.updateTitle();



	let html = 'Todo: Text editor';

	this.setDom(html);

	console.log("Todo: Text editor", asset, this);


};



