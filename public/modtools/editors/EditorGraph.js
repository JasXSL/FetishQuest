import HelperAsset from './HelperAsset.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import * as EditorRoleplayStage from './EditorRoleplayStage.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';

import Roleplay from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';


const DB = 'roleplay',
	CONSTRUCTOR = Roleplay;

// Setup everything

const canvas = document.createElement('canvas');
canvas.classList.add('nodeEditor');
const g = new LGraph();
let gCanvas = new LGraphCanvas(canvas, g);
g.start();
window.graph = g; // debugging
document.body.height = "100%";

const EDITORS = {
	'Roleplay' : {
		DB : 'roleplay',
		blockTypes : {
			'stage' : EditorRoleplayStage.nodeBlock,
			'reply' : EditorRoleplayStageOption.nodeBlock,
		}
	}
};


// Single asset editor
export function asset(){

	LiteGraph.clearRegisteredTypes();

	const 
		modtools = window.mod,
		id = this.id,
		type = this.custom.type || 'Roleplay'
	;
	const meta = EDITORS[type];
	if( !meta )
		throw 'Graph editor type not found';

	const asset = this.asset.asset || modtools.mod.getAssetById(meta.DB, id);
	const wrapper = document.createElement('div');
	wrapper.append(canvas);

	const updateSize = () => {

		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		gCanvas.resize();

	};



	setTimeout(() => {
		updateSize();
	}, 10);
	this.onResize = updateSize;
	this.setDom(wrapper);

	for( let i in meta.blockTypes ){

		const fn = meta.blockTypes[i];
		Object.defineProperty(fn, "name", {value:i});
		LiteGraph.registerNodeType('ASSETS/'+i, fn);

	}
	

	if( type === 'Roleplay' ){

		// Create the base roleplay
		const fn = EditorRoleplay.nodeBlock;
		Object.defineProperty(fn, "roleplay", {value:"roleplay"});
		LiteGraph.registerNodeType('ignore/roleplay', fn);
		const node = LiteGraph.createNode("ignore/roleplay");
		node.pos = [200,200];
		g.add(node);
		node.onBuild(asset);

	}

	
	


};


export function begin(){

	


}
