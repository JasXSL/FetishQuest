import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import GameEvent from '../../classes/GameEvent.js';
import Encounter from '../../classes/Encounter.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorEncounterEvent from './EditorEncounterEvent.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorPlayerTemplate from './EditorPlayerTemplate.js';
import Generic from '../../classes/helpers/Generic.js';


const DB = 'encounters',
	CONSTRUCTOR = Encounter;

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
		html += '<label>Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Friendly <input type="checkbox" class="saveable" name="friendly" '+(dummy.friendly ? 'checked' : '')+' /></label><br />';
		html += '<label title="Overrides the default game over effects. Make sure to combine this with an encounterLost event">Override game over <input type="checkbox" class="saveable" name="wipe_override" '+(dummy.wipe_override ? 'checked' : '')+' /></label><br />';
		html += '<label title="Text to output when the encounter starts (string, not an asset)">Start text: <input type="text" name="startText" class="saveable" value="'+esc(dummy.startText)+'" /></label>';
		html += '<label title="In seconds, 0 = no respawn">Respawn time: <input type="number" step=1 min=0 name="respawn" class="saveable" value="'+esc(dummy.respawn)+'" /></label>';
		html += '<label title="Lets you increase or decrease difficulty, 1 = 100% more difficult">Difficulty Adjust: <input type="number" step=0.01 min=-0.95 name="difficulty_adjust" class="saveable" value="'+esc(dummy.difficulty_adjust)+'" /></label>';
	html += '</div>';


	html += '<span title="Players that MUST be in this event. If difficulty is not satisfied on start, it can add additional players from player_templates below">Players: </span><div class="players"></div>';
	html += '<span>Player Templates: </span><div class="player_templates"></div>';
	html += '<span>'+
		'Wrappers: '+
		'</span>'+
		'<div class="wrappers"></div>'
	;
	html += '<span title="Passive effects to apply to all players">Passives: </span><div class="passives"></div>';
	html += '<span>Conditions: </span><div class="conditions"></div>';
	html += '<span title="Game actions to run when the encounter starts">Start/Passive Game Actions: </span><div class="game_actions"></div>';
	html += '<span title="Lets you easily bind game actions to events">Event Bindings: </span><div class="events"></div>';
	html += '<span title="Game actions to run when the encounter ends">Finish Game Actions: </span><div class="completion_actions"></div>';
	
	// Collections can contain sub arrays. Build one for each player
	html += '<span title="Conditions for each player in order for it to show up">Player Conditions: </span><div class="player_conditions">';
		if( !asset.player_conditions )
			asset.player_conditions = {};
		for( let player of dummy.players )
			html += esc(player)+': <div data-label="'+esc(player)+'"></div>';	
	html += '</div>';

	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.events").appendChild(EditorEncounterEvent.assetTable(this, asset, "events"));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions"));
	this.dom.querySelector("div.completion_actions").appendChild(EditorGameAction.assetTable(this, asset, "completion_actions"));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers"));
	this.dom.querySelector("div.player_templates").appendChild(EditorPlayerTemplate.assetTable(this, asset, "player_templates"));
	this.dom.querySelector("div.players").appendChild(EditorPlayer.assetTable(this, asset, "players"));

	// Handle collection with multiple assets
	this.dom.querySelectorAll("div.player_conditions > div[data-label]").forEach(el => {

		const player = el.dataset.label;
		el.appendChild(EditorCondition.assetTable(this, asset, "player_conditions::"+player));

	});


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'description'], single);
}

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
			'<td>Only visited in the mod tools, helpful note for editing</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Friendly</td>'+
			'<td>Makes the encounter not automatically trigger combat upon starting it.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Override game over</td>'+
			'<td>On game over, players are not regenerated or taken to the dungeon entrance. Use with Event Binding with the encounterLost event type. Note that you need to regenerate player HP or they might become softlocked.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Start text</td>'+
			'<td>Outputs RP text into chat when the encounter starts.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Respawn time</td>'+
			'<td>Time before this encounter respawns. 0 = never respawn.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Difficulty Adjust</td>'+
			'<td>Increase or decrease difficulty. 0.5 = half difficulty, 1.0 = double, 0 = normal.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Players</td>'+
			'<td>Players that should be in the encounter. These are always added.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player Templates</td>'+
			'<td>Generated players that should be in the encounter. These are auto generated. May not show up if Players total power exceeds what would automatically be generated.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Wrappers</td>'+
			'<td>Wrappers to apply to all players when the encounter starts. Sender is the player that triggered the encounter.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Passive wrappers that are counted for all players that match conditions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions required to be met for the encounter to start.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Start/Passive Game Actions</td>'+
			'<td>Game actions that are run when the encounter starts. Put shops and intro roleplays here.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Event Bindings</td>'+
			'<td>Lets you bind game actions to happen when specific events are raised.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Finish game actions</td>'+
			'<td>Game actions that are run when the players defeat the encounter. This could be done through Event Bindings too, but it\'s here for legacy and quality of life reasons.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Player Conditions</td>'+
			'<td>Conditions needed to be met for the different Players in the encounter to show up. No conditions always allows the player.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*desc' : true,
		'*friendly':true, startText:true, respawn:true, difficulty_adjust:true,
		players: true,
		player_templates : true,
		wrappers : true,
		passives : true,
		conditions : true,
		game_actions : true,
		completion_actions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'encounter_'+Generic.generateUUID(),
		desc : 'Describe your encounter',
	}));

};

