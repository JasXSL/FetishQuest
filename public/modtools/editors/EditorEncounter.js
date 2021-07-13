import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import GameEvent from '../../classes/GameEvent.js';
import Encounter from '../../classes/Encounter.js';
import * as EditorCondition from './EditorCondition.js';
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
		html += '<label title="Text to output when the encounter starts (string, not an asset)">Start text: <input type="text" name="startText" class="saveable" value="'+esc(dummy.startText)+'" /></label>';
		html += '<label title="In seconds, 0 = no respawn">Respawn time: <input type="number" step=1 min=0 name="respawn" class="saveable" value="'+esc(dummy.respawn)+'" /></label>';
		html += '<label title="Lets you increase or decrease difficulty, 1 = 100% more difficult">Difficulty Adjust: <input type="number" step=0.01 min=-0.95 name="difficulty_adjust" class="saveable" value="'+esc(dummy.difficulty_adjust)+'" /></label>';
	html += '</div>';


	html += '<span title="Players that MUST be in this event. If difficulty is not satisfied on start, it can add additional players from player_templates below">Players: </span><div class="players"></div>';
	html += '<span>Player Templates: </span><div class="player_templates"></div>';
	html += '<span title="Wrappers to apply when the encounter starts. auto target is the player who started the encounter, usually by entering a room or picking an RP option">Wrappers: </span><div class="wrappers"></div>';
	html += '<span title="Passive effects to apply to all players">Passives: </span><div class="passives"></div>';
	html += '<span>Conditions: </span><div class="conditions"></div>';
	html += '<span title="Game actions to run when the encounter starts">Start Game Actions: </span><div class="game_actions"></div>';
	html += '<span title="Game actions to run when the encounter starts">Finish Game Actions: </span><div class="completion_actions"></div>';
	
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

