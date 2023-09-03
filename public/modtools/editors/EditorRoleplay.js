import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStage from './EditorRoleplayStage.js';
import * as EditorRoleplayStageOption from './EditorRoleplayStageOption.js';
import * as EditorRoleplayStageOptionGoto from './EditorRoleplayStageOptionGoto.js';
import * as EditorGraph from './EditorGraph.js';

import Roleplay from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';


export const DB = 'roleplay',
	CONSTRUCTOR = Roleplay,
	BLOCKTYPE = 'Roleplay'
;

export function nodeBuild( asset, nodes ){

	const blockTypes = {
		Stage : EditorRoleplayStage,
		Reply : EditorRoleplayStageOption,
		Goto : EditorRoleplayStageOptionGoto,
	};

	// Register the base roleplay type. Must be first.
	nodes.addBlockType(BLOCKTYPE, {
		color : "#FAA",
		width : '300px',
		height : '200px',
		noAdd : true,
		noOutput : true,
		onClick : (block, event) => EditorGraph.onBlockClick(DB, block, nodes),
	})
	.addInput('FirstStage', 'Stage', {single:true});

	// Register the needed subtypes
	for( let i in blockTypes )
		blockTypes[i].nodeBlock(nodes);

	

	const rootBlock = nodes.addBlock(BLOCKTYPE, asset.id, {
		x:asset._x, 
		y:asset._y, 
		noDelete:true
	});
	nodeBlockUpdate(asset, rootBlock);

	nodes.onChange = () => nodeCompile(asset, nodes);

	// Create the blocks
	const stages = asset.stages || [];
	const stageObjs = []; // cache
	let firstStage;
	for( let stage of stages ){
		
		const stageAsset = mod.getAssetById('roleplayStage', stage);
		stageObjs.push(stageAsset);
		EditorRoleplayStage.nodeBuild(stageAsset, nodes, asset); // recursive
		if( !firstStage )
			firstStage = stageAsset;

	}


	// link the RP to the first stage
	if( firstStage )
		nodes.getBlock("Stage", firstStage.id).attach(rootBlock.type, rootBlock.id, "FirstStage");
	
	for( let stage of stageObjs )
		EditorRoleplayStage.nodeConnect(stage, nodes);



}

export function nodeCompile( asset, nodes ){

	const mod = window.mod.mod;
	let isDirty = false;
	const buildMissingAsset = (db, id, x, y) => {

		const saveAsset = mod.getAssetById(db, id);
		
		// update
		if( saveAsset && asset._x === x && asset._y === y )
			return saveAsset;

		isDirty = true;

		// Already exists, but x/y has been changed
		if( saveAsset ){

			saveAsset._x = x;
			saveAsset._y = y;

			return saveAsset;
		}

		const obj = {
			id,
			_h : asset.id,
			_x : x,
			_y : y,
		};
		mod.mergeAsset(db, obj);
		return obj;

	};
	const setAssetLinks = (dbAsset, field, replace) => {

		if( compareArrays(dbAsset[field], replace) )
			return;
		isDirty = true;
		dbAsset[field] = replace;

	};

	// node aliases for DB
	const flat = nodes.flatten();

	const rp = flat.Roleplay[0];
	if( asset._x !== rp.x || asset._y !== rp.y ){

		asset._x = rp.x;
		asset._y = rp.y;
		isDirty = true;

	}

	// :: Stage -> stages ::
	// First compile the stages. Order matters here.
	const fsid = flat.Roleplay.FirstStage;
	let stages = flat.Stage.filter(el => el.id !== fsid);
	// Make sure the stage connected to the RP goes first
	if( fsid )
		stages.unshift(fsid);
	for( let stage of stages ){

		const dbAsset = buildMissingAsset("roleplayStage", stage.id, stage.x, stage.y);
		setAssetLinks(dbAsset, "options", stage.Replies);

	}
	asset.stages = stages.map(el => el.id);

	// :: Reply -> roleplayStageOption
	for( let re of flat.Reply ){

		const dbAsset = buildMissingAsset("roleplayStageOption", re.id, re.x, re.y);
		setAssetLinks(dbAsset, "index", re.Gotos);
		setAssetLinks(dbAsset, "direct", re.Direct);

	}

	// :: Goto -> roleplayStageOptionGoto
	for( let goto of flat.Goto ){
		
		const dbAsset = buildMissingAsset("roleplayStageOptionGoto", goto.id, goto.x, goto.y);
		if( dbAsset.index !== goto.Stage ){

			dbAsset.index = goto.Stage;
			isDirty = true;

		}

		
	}

	if( isDirty )
		window.mod.setDirty(true);
	

	
}

export function nodeBlockUpdate( asset, block ){

	let out = '<div class="label important">';
		out += esc(asset.label);
	out += '</div>';
	if( asset.desc )
		out += '<div class="label">'+esc(asset.desc)+'</div>';
	let properties = [];
	if( asset.persistent )
		properties.push("PERSISTENT");
	if( asset.once )
		properties.push("ONCE");
	if( asset.autoplay )
		properties.push("AUTO PLAY" + (asset.apOnce ? ' ONCE' : ''));
	if( asset.persistent )
		properties.push("VARS PERSIST");
	if( asset.portrait )
		properties.push("Portrait: "+esc(asset.portrait));

	out += '<div class="label unimportant">'+esc(properties.join(', '))+'</div>';
	

	if( asset.player )
		out += '<div class="label unimportant">Player: '+esc(window.mod.getAssetById("players", asset.player)?.label)+'</div>';

	if( Array.isArray(asset.conditions) ){
		out += '<i>Conditions:</i><br />';
		out += '<div class="label unimportant">'+esc(asset.conditions.join(', '))+'</div>';
	}
	if( Array.isArray(asset.playerConds) ){
		out += '<i>PlayerConds:</i><br />';
		out += '<div class="label unimportant">'+esc(asset.playerConds.join(', '))+'</div>';
		out += '<label>Min players: '+esc(asset.minPlayers)+', Max players: '+esc(asset.maxPlayers)+'</label>';

	}
	if( Array.isArray(asset.gameActions) ){
		out += '<i>Game Actions:</i><br />';
		out += '<div class="label unimportant">'+esc(asset.gameActions.join(', '))+'</div>';
	}

	if( typeof asset.vars === "object" && Object.keys(asset.vars).length )
		out += '<div class="label unimportant">Vars: '+esc(JSON.stringify(asset.vars))+'</div>';


	block.setContent(out);

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label title="This is only shown in the editor">Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label title="A small headshot of the player">Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';

		html += '<label title="Preserves stage when reopened">Persistent <input type="checkbox" class="saveable" name="persistent" '+(dummy.persistent ? 'checked' : '')+' /></label><br />';
		html += '<label title="Can only be opened once">Once <input type="checkbox" class="saveable" name="once" '+(dummy.once ? 'checked' : '')+' /></label>';
		html += '<label title="Autoplay">Auto Play <input type="checkbox" class="saveable" name="autoplay" '+(dummy.autoplay ? 'checked' : '')+' /></label>';
		html += '<label title="">Auto Play Once (req auto play) <input type="checkbox" class="saveable" name="apOnce" '+(dummy.apOnce ? 'checked' : '')+' /></label>';
		html += '<label title="Makes RP vars save when you exit the RP, and they can be used in formulas. See cheat sheet.">rpVars persistent <input type="checkbox" class="saveable" name="vars_persistent" '+(dummy.vars_persistent ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += '<label title="Player in encounter to tie it to">Player: </label><div class="player"></div>';

	html += 'Stages: <div class="stages"></div>';

	html += '<input type="button" value="Outliner" class="rpNodeEditor" /><br />';


	// Conditions
	html += 'Conditions: <div class="conditions"></div>';

	html += '<p>Advanced</p>';
	html += 'Player conditions: <div class="playerConds"></div>';
	html += '<label title="Min players that need to pass player conditions. -1 = all players on the player team must match">Min Players: <input type="number" step=1 min=-1 name="minPlayers" class="saveable" value="'+(parseInt(dummy.minPlayers) || 0)+'" /></label>';
	html += '<label title="Max players that will be stored as rpTargets. -1 = infinit">Max Players: <input type="number" step=1 min=-1 name="maxPlayers" class="saveable" value="'+(parseInt(dummy.maxPlayers) || 0)+'" /></label>';

	html += '<br /><label title="These are run on the player that triggered the RP. Generally you only want to use these to sort the RpTargets list. Use GameActions in a stage otherwise">'+
		'Game Actions: '+
	'</label>'+
	'<div class="gameActions"></div>';

	html += 'Vars (this is a key/value object that can be acted upon by game actions). These can only be acted upon and found in mathVars while this roleplay is active. When used in mathvars they get prefixed with rp_<br />';
	html += '<textarea class="json" name="vars">'+esc(JSON.stringify(dummy.vars))+'</textarea><br />';



	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	this.dom.querySelector("div.playerConds").appendChild(EditorCondition.assetTable(this, asset, "playerConds", false, false));
	this.dom.querySelector("div.stages").appendChild(EditorRoleplayStage.assetTable(this, asset, "stages", false, 2));
	this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "player", true));
	this.dom.querySelector("div.gameActions").appendChild(EditorGameAction.assetTable(this, asset, "gameActions", false));
	this.dom.querySelector("input.rpNodeEditor").onclick = () => {
		window.mod.buildNodeEditor(
			this.id,
			{}, 			// data
			this, 
			{type:BLOCKTYPE}				// Custom
		);
		
	};
	
	HelperAsset.autoBind( this, asset, DB);

};



// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'title', 'desc'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*title' : true,
		'*desc' : true,
		'*player' : true,
		portrait : true,
		'*persistent' : true,
		'*once' : true,
		'*autoplay' : true,
		stages : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RP_'+Generic.generateUUID(),
		title : 'New Roleplay',
		autoplay : true,
		once : true,
		persistent : true,
	}));

};


// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Roleplay:</h3>'+
		'<p>Roleplay is the dialog popup with multiple options you may encounter. In order to trigger a roleplay, you need to tie it to a game action.</p>';

	out += '<h3>Tying a roleplay to an NPC in a cell</h3>';
	out += '<p>In order to attach a roleplay to a player in a cell, you need to first create an encounter for that cell, and add the player. Then create a game action in that encounter of the Roleplay type, and select your roleplay.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Description</td>'+
			'<td>Only visited in the mod tools, helpful note about the roleplay</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Portrait</td>'+
			'<td>Optional override image of the player or item you are talking to. Useful if you are talking to something like an item or adding narration.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Persistent</td>'+
			'<td>Players cannot leave the RP, take actions, or interact with the world while the RP is active.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Once</td>'+
			'<td>Only starts the RP once.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Auto Play</td>'+
			'<td>Automatically play the RP (used when tying the RP to an encounter).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player</td>'+
			'<td>Player you want the main player you are talking of to be. This can be overridden in stages. Optional.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stages</td>'+
			'<td>These are the different stages of the roleplay. Including the NPC text and any options the player may pick. I suggest you create the stages with only NPC text first, then go back and link them together.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions needed for the RP to start. You can also put conditions in the GameAction that triggers it. Sender is any player set in the player field. Target is the player who instigated the RP.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player conditions</td>'+
			'<td>When set, the game will check these conditions against a shuffled list of all enabled players. With event target being said player. Including NPCs, so use the targetOnPlayerTeam condition if you only want to check the party. These players will be tied to the %P %P2... text labels instead of the player instigating the RP. The order of this list is random.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min Players</td>'+
			'<td>Minimum players that need to pass player conditions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Players</td>'+
			'<td>Max players to save as rp targets. -1 is infinite. Should be equal or greater to minPlayers otherwise. Note that maxPlayers doesn\'t prevent the RP from starting if the nr of valid players is greater. It just limits how many players are included in the RP as targets.</td>'+
		'</tr>'
		
	;
		

	out += '</table>';

	

	return out;

};
