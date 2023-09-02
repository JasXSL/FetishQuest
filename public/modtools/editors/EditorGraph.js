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

	
	this.nodes = window.nodes = new RawNodes();
	

	if( type === 'Roleplay' )
		EditorRoleplay.nodeBuild(asset, this.nodes);

	const wrapper = document.createElement('div');
	this.nodes.connect(wrapper);
	this.setDom(wrapper);

	setTimeout(() => {
		this.nodes.panToFirst();
	}, 1);

};

export function onBlockCreate( block, db, cb ){

	cb(window.mod.getAssetById(db, block.id), block);

}

export function onBlockDelete( block, db, ignoreDelete = [] ){

	window.mod.mod.deleteAsset(db, block.id, undefined, ignoreDelete);

}


// Creates blocks based on sub links of an asset, including any unconnected items with _h the same as rootAsset (can't only check _h due to legacy RPs)
export function buildSubBlocks( nodes, fieldAssets, editor, rootAsset ){

	// Start by fetching from _h (new RPs will have this, old won't). This is so you can save unlinked blocks and still have them show in the editor.
	const assets = window.mod.mod.getAssetsByH(editor.DB, rootAsset.id);
	// Create a cache of IDs
	const ids = assets.map(el => el.id);

	if( Array.isArray(fieldAssets) ){
		// Add any assets from baseAsset's baseField unless they already exist in assets
		for( let id of fieldAssets ){
			if( !ids.includes(id) )
				assets.push(window.mod.mod.getAssetById(editor.DB, id));
		}
	}
	for( let a of assets )
		editor.nodeBuild( a, nodes, rootAsset );

}

// outputEditor : Editor module for the output type. Needed for recursion
// outputType : node editor output block type
// inputType : node editor input block type 
// inputId : id of asset to connect to
// inputNodeLabel : label of node on input to connect to
// outputIds : ids of mod DB linked to outputEditor that should be connected to input
// Todo: Smarter recursion prevention
export function autoConnect( nodes, outputEditor, outputType, outputIds, inputType, inputId, inputNodeLabel, noRecurse ){

	for( let outputid of outputIds ){

		const outputBlock = nodes.getBlock(outputType, outputid);
		outputBlock.attach(inputType, inputId, inputNodeLabel);

		const dbAsset = window.mod.mod.getAssetById(outputEditor.DB, outputid);
		if( dbAsset && outputEditor.nodeConnect && !noRecurse ){
			outputEditor.nodeConnect(dbAsset, nodes);
		}

	}
	

}


export function begin(){

	


}
