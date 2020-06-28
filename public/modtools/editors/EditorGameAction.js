import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import GameAction from '../../classes/GameAction.js';
import Dungeon, { DungeonRoom } from '../../classes/Dungeon.js';

const DB = 'gameActions',
	CONSTRUCTOR = GameAction;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = this.asset.asset || modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();

	let html = '';
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Type: <select name="type" class="saveable">';
		for( let i in GameAction.types )
			html += '<option value="'+esc(GameAction.types[i])+'" '+(GameAction.types[i] === dummy.type ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
	html += '</div>';

	
	// Door editor if we can actually fetch the dungeon
	if( 
		dummy.type === GameAction.types.door && 
		objectHasPath(this, ['parent', 'asset', 'asset', 'parent', 'parent']) && 
		this.parent.asset.asset.parent.parent instanceof Dungeon 
	){

		const dungeon = this.parent.asset.asset.parent.parent,
			room = this.parent.asset.asset.parent,
			roomAsset = this.parent.asset.asset
		;
		console.log("Todo: Custom door editor for", dungeon, this);

	}

	html += 'Data: <br /><pre class="wrap typeDesc"></pre><br />';
	html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';

	html += 'Conditions: <br />';
	html += '<div class="conditions"></div>';


	this.setDom(html);


	// Describe what the json editor data should look like
	const typeSelect = this.dom.querySelector("select[name=type]");
	const updateTypeDesc = () => {
		
		const typeDesc = this.dom.querySelector("pre.typeDesc"),
			type = typeSelect.value;

		typeDesc.innerText = GameAction.TypeDescs[type] || "Unknown type";		

	};
	updateTypeDesc();
	typeSelect.addEventListener("change", updateTypeDesc);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'type', 'desc'], single, parented, ignoreAsset);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		desc : true,
		type : true,
		data : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'gameAction'+Math.ceil(Math.random()*0xFFFFFFF),
		desc : 'Teleports the users back to Yuug port',
		type : GameAction.types.setDungeon,
		data : {
			dungeon : 'yuug_port',
			room : 0
		}
	}));

};

