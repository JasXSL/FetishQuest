import HelperAsset from './HelperAsset.js';

import * as EditorText from './EditorText.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';
import Roleplay, { RoleplayStage, RoleplayStageOption } from '../../classes/Roleplay.js';
import * as EditorGraph from './EditorGraph.js';
import Text from '../../classes/Text.js';

export const DB = 'roleplayStage',
	CONSTRUCTOR = RoleplayStage,
	BLOCKTYPE = 'Stage';
;

	
export function nodeBlock( nodes ){

	const checkHasSubAsset = (asset, type, id) => {
		return type === 'texts' && asset.text?.includes(id);
	};

	nodes.addBlockType(BLOCKTYPE, {
		color:"#FFA", 
		width : '400px',
		height:"50px",
		onCreate : block => {
			// Special function to check for linked assets that should cause a redraw when modified
			block._hasSubAsset = checkHasSubAsset;
			EditorGraph.onBlockCreate(block, DB, nodeBlockUpdate);
		},
		onDelete : block => EditorGraph.onBlockDelete(block, DB, ['options']),
		onClick : (block, event) => EditorGraph.onBlockClick(DB, block, nodes),
	})
		.addInput('Replies', 'Reply')
	;

}

export function nodeBuild( asset, nodes, root ){

	// Add the block
	const block = nodes.addBlock(BLOCKTYPE, asset.id, {x:asset._x, y:asset._y});
	nodeBlockUpdate(asset, block);
	
	// add the roleplay stage options
	EditorGraph.buildSubBlocks( nodes, asset.options, EditorRoleplayStageOption, root );
	
	
}

// Connect our linked objects to target outputs
export function nodeConnect( asset, nodes ){

	EditorGraph.autoConnect( nodes, EditorRoleplayStageOption, "Reply", asset.options, "Stage", asset.id, "Replies" );

}


export function nodeBlockUpdate( asset, block ){

	const texts = asset.text || [];

	// Todo: these should open an editor, and there should be an add button
	let out = '<div class="texts">';
	for( let id of texts ){

		const text = window.mod.mod.getAssetById('texts', id);
		out += '<div class="text label important" style="font-weight:normal" data-id="'+esc(text.id)+'">';
			out += esc(text.text);
			if( Array.isArray(text.conditions) && text.conditions.length )
				out += '<div class="label unimportant">'+esc(text.conditions.join(', '))+'</div>';
		out += '</div>';

	}
	out += '</div>';
	out += '<input type="button" class="addText" value="+ New Text" />';

	if( asset.portrait || asset.name || asset.player ){

		out += '<div class="label">';
		if( asset.portrait )
			out += 'Portrait: "'+esc(asset.portrait)+'" ';
		if( asset.name )
			out += 'Name: "'+esc(asset.name)+'" ';
		if( asset.player )
			out += 'Player: "'+esc(window.mod.getAssetById("players", asset.player)?.name)+'" ';
		out += '</div>';

	}

	

	if( asset.leave )
		out += '<div class="label">[Leave]</div>';

	if( asset.chat === RoleplayStageOption.ChatType.none )
		out += '<div class="label">NO Chat</div>';

	if( asset.store_pl )
		out += '<div class="label">Store player: '+RoleplayStage.getStoreTypeLabel(asset.store_pl)+'</div>';

	if( asset.shuffle_texts )
		out += '<div class="label">Shuffle texts: '+RoleplayStage.getShuffleTypeLabel(asset.shuffle_texts)+'</div>';

	if( Array.isArray(asset.game_actions) )
		out += '<div class="label">Game actions: '+esc(asset.game_actions.join(', '))+'</div>';

	if( asset.target && asset.target !== RoleplayStage.Target.auto )
		out += '<div class="label">Target override: '+esc(asset.target)+'</div>';

	block.setContent(out);

	// Custom event bindings
	block.divContent.querySelectorAll('div.texts div.text').forEach(el => el.onclick = event => {
		event.stopImmediatePropagation();

		const id = event.currentTarget.dataset.id;
		window.mod.buildAssetEditor("texts", id);

	});

	block.divContent.querySelector('input.addText').onclick = event => {
		event.stopImmediatePropagation();

		let a = new Text();
		a = Text.saveThis(a, "mod");
		a._h = 1;

		HelperAsset.insertAsset( 'texts', a, undefined, true, {} );
		if( !asset.text )
			asset.text = [];
		asset.text.push(a.id);

		nodeBlockUpdate(asset, block);

	};

}

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
		html += '<label title="Lets you override the name of the speaking player">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" autocomplete="chrome-off" /></label>';
		html += '<label title="A small headshot of the player, overrides RP parent">Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';
		html += '<label title="Auto add a [Leave] option">Leave: <input type="checkbox" name="leave" class="saveable" '+(dummy.leave ? 'checked' : '')+' /></label>';
		
		html += '<label>Chat type: <select name="chat" class="saveable" name="chat">';
		for( let i in RoleplayStageOption.ChatType )
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label title="Stores target for rpTarget conditions and %P in texts">'+
			'Store target: '+
			'<select name="store_pl" class="saveable">'
		;
		for( let i in RoleplayStage.StoreType ){
			let n = RoleplayStage.StoreType[i];
			html += '<option value="'+n+'" '+(parseInt(n) === parseInt(dummy.store_pl) ? 'selected' : '')+'>'+
				esc(i)+
			'</option>';
		}
		html += '</select></label>';

		html += '<label title="Shuffles the text order">Shuffle type: <select name="shuffle_texts" class="saveable">';
		for( let stype in RoleplayStage.Shuffle ){
			const n = RoleplayStage.Shuffle[stype];
			html += '<option value="'+n+'" '+(parseInt(n) === parseInt(asset.shuffle_texts) ? 'selected' : '')+'>'+stype+'</option>';
		}
		html += '</select></label>';

		html += '<label title="Sets target for texts/game actions">Text/GA Target: <select name="target" class="saveable">';
		for( let type in RoleplayStage.Target ){
			const n = RoleplayStage.Target[type];
			html += '<option value="'+n+'" '+(n === asset.target ? 'selected' : '')+'>'+type+'</option>';
		}
		html += '</select></label>';

	html += '</div>';


	html += '<label title="Player in encounter to tie it to, overrides RP parent">Player: </label><div class="player"></div>';


	html += '<span title="Text conditions are checked and the first valid text is used">Texts: </span><div class="text"></div>';
	html += '<span title="Sender is the person who triggered this stage, target is the player tied to the RP if possible">Game Actions: </span><div class="game_actions"></div>';


	html += 'Responses: <div class="options"></div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.text").appendChild(EditorText.assetTable(this, asset, "text", false, 2));
	this.dom.querySelector("div.options").appendChild(EditorRoleplayStageOption.assetTable(this, asset, "options", false, 2));
	this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "player", true));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions"));
	


	HelperAsset.autoBind( this, asset, DB);

};


// Special onCreate function to update the number using the highest number of parent
/* Legacy
function onCreate( win, asset ){

	let parent = mod.getListObjectParent('roleplay', 'stages', asset.id);
	console.log("Parent", parent);
	if( !parent ||!Array.isArray(parent.stages) )
		return;

	console.log("Stages", parent.stages);
	let highest = -1;
	for( let stage of parent.stages ){

		const s = window.mod.getAssetById(DB, stage);
		let index = (s && parseInt(s.index)) || 0;
		if( index > highest )
			highest = index;

	}
	
	asset.index = highest+1;

};
*/

// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){

	// Set an optional onCreate callback
	//win.editorOnCreate = onCreate;

	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'id', 
		asset => {

			if( asset.text && asset.text.length ){
				const text = window.mod.getAssetById('texts', asset.text[0]);
				if( text )
					return text.text;
			}
			return '!! NONE !!';
		},
		asset => asset.leave ? 'LEAVE' : '',
		asset => asset.options?.length ? asset.options.length+' Responses' : 'MISSING RESPONSES'
	], single, parented);
}


// Listing
/*
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		index : true,
		player : true,
		portrait : true,
		chat : true,
		text : true,
		options : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RPStage_'+Generic.generateUUID(),
	}));

};
*/

export function help(){

	let out = '';

	out += '<h3>RoleplayStage:</h3>'+
		'<p>Contains texts the NPC can output, responses, GameActions to run, and metadata.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Optional. Lets you override the name of the player or NPC name specified in the parent roleplay. %T here will target the player who brought you to this RP stage. %P will target the first roleplay target.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Portrait</td>'+
			'<td>Optional override image of the player or item you are talking to. Useful if you are talking to something like an item or adding narration. Overrides any portrait/player specified in the parent roleplay. %T will use the icon of the player who brought you to this stage. %P will target the first roleplay target.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Chat type</td>'+
			'<td>Whether the text should be output in a speech bubble by the NPC.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Store target</td>'+
			'<td>Each RP has an array of players considered targets of the RP. This option lets you alter this list. IGNORE does nothing. SET overwrites it with the player who brought you to this stage. ADD adds the player who brought you to this stage. REM removes the player who brought you to this stage. SHUFFLE shuffles the existing list.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Shuffle type</td>'+
			'<td>When using multiple texts you can use this to shuffle their order. ALL_BUT_LAST allows you to set a default response if no above responses pass filter. An example is the scruffy bar patron who shuffles a rumor text when you ask him for rumors, and has a fallback if he has no viable ones.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Text/GA Target</td>'+
			'<td>Who should be considered target of the RP text and game actions? Auto = player who took you to this stage in the roleplay.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player</td>'+
			'<td>Player you want the main player you are talking of to be. Overrides the parent roleplay player. Optional.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Texts</td>'+
			'<td>Texts that should be output by the NPC. You can use multiple ones and attach conditions to the texts. Unless shuffle is set, it will trigger the first viable. Make sure to have a fallback without conditions last. In an RP, the target %T is the person who brought you to that stage of the RP, %S is the NPC you are talking to, if any. When using store target, you can use %P to target the stored player. %T is the NPC responding, and %S the player who picked the option.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Game Actions</td>'+
			'<td>GameActions to trigger when entering this stage.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Responses</td>'+
			'<td>Player response options. I suggest you set these up after creating all stages with NPC texts.</td>'+
		'</tr>'
	;
	out += '</table>';

	

	return out;

};

