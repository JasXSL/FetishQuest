import HelperAsset from './HelperAsset.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import * as EditorRoleplayStage from './EditorRoleplayStage.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';
import * as EditorText from './EditorText.js';

import Roleplay from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'roleplay',
	CONSTRUCTOR = Roleplay;

// Setup everything

const EDITORS = {
	'Roleplay' : {
		DB : 'roleplay',
		blockTypes : {
			'Roleplay' : EditorRoleplay.nodeBlock,
			'Stage' : EditorRoleplayStage.nodeBlock,
			'Text' : EditorText.nodeBlock,
			'Reply' : EditorRoleplayStageOption.nodeBlock,
		}
	}
};

const OpenEditorOption = Vue.component('OpenEditorOption', {
	data : function(){
		return {};
	},
	methods : {
		onClick : event => {
			console.log(event);
		}
	},
	template : '<button @click.native="onClick">Edit</button>',
});


// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		type = this.custom.type || 'Roleplay'
	;
	const meta = EDITORS[type];
	if( !meta )
		throw 'Graph editor type not found';

	const asset = this.asset.asset || modtools.mod.getAssetById(meta.DB, id);
	const editorDiv = document.createElement("editor");
	editorDiv.classList.add('nodeEditor');

	const wrapper = document.createElement('div');
	wrapper.append(editorDiv);
	this.setDom(wrapper);

	
	const plugin = BaklavaJS.createBaklava(editorDiv);
	plugin.enableMinimap = true;
	window.editor = plugin;
	const editor = plugin.editor;
	const typePlugin = new BaklavaJS.PluginInterfaceTypes.InterfaceTypePlugin();
	editor.use(typePlugin);
	const optionPlugin = new BaklavaJS.PluginOptionsVue.OptionPlugin();
	editor.use(optionPlugin);
	plugin.registerOption("OpenEditorOption", OpenEditorOption);
	editor.methods = {
		onClick : event => {
			console.log("onclick");
		}
	};

	for( let i in meta.blockTypes ){
		editor.registerNodeType(i, meta.blockTypes[i](typePlugin));
	}
	if( type === 'Roleplay' ){

		// Create the base roleplay
		

	}

	
	


};


export function begin(){

	


}
