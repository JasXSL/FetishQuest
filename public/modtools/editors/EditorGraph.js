import HelperAsset from './HelperAsset.js';
import * as EditorRoleplay from './EditorRoleplay.js';

import Roleplay from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';
import RawNodes from '../../libraries/RawNodes.js';

// Setup everything
const DBS = {
	Roleplay : 'roleplay'
};

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		type = this.custom.type || 'Roleplay'
	;


	const asset = this.asset.asset || modtools.mod.getAssetById(DBS[type], id);
	const editorDiv = document.createElement("editor");
	editorDiv.classList.add('nodeEditor');

	const wrapper = document.createElement('div');
	wrapper.append(editorDiv);
	this.nodes = window.nodes = new RawNodes();
	this.nodes.connect(wrapper);
	this.setDom(wrapper);

	if( type === 'Roleplay' )
		EditorRoleplay.nodeBuild(asset, this.nodes);

	setTimeout(() => {
		this.nodes.panToFirst();
	}, 10);

};


export function begin(){

	


}
