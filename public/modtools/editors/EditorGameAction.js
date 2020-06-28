import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorEncounter from './EditorEncounter.js';
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

	
	
	html += 'Data: <br /><pre class="wrap typeDesc">'+esc(GameAction.TypeDescs[dummy.type] || "Unknown type")+'</pre><br />';

	const type = dummy.type,
		Types = GameAction.types;

	// Function to call after setting DOM
	let fnBind = () => {};

	// Door editor if we can actually fetch the dungeon
	if( 
		type === Types.door && 
		objectHasPath(this, ['parent', 'asset', 'asset', 'parent', 'parent']) && 
		this.parent.asset.asset.parent.parent instanceof Dungeon 
	){

		const dungeon = this.parent.asset.asset.parent.parent,
			room = this.parent.asset.asset.parent,
			roomAsset = this.parent.asset.asset
		;
		console.log("Todo: Custom door editor for", dungeon, this);

	}
	else if( type === Types.encounters ){

		if( !Array.isArray(asset.data) )
			asset.data = [];
			
		html += 'Encounters: <div class="encounters"></div>';

		fnBind = () => {
			this.dom.querySelector("div.encounters").appendChild(EditorEncounter.assetTable(this, asset, "data", false));
		};

	}
	else if( type === Types.resetEncounter ){

		if( !asset.data )
			asset.data = {};
		// Todo: Bind
		html += 'Encounter: <div class="encounter" data-path="encounter"></div>';

		// Todo: Continue here

	}
	else if( type === Types.wrappers ){
		if( !Array.isArray(asset.data) )
			asset.data = [];
		// Todo: Bind
		html += 'Wrappers: <div class="wrappers"></div>';
	}
	else if( type === Types.loot ){
		if( typeof asset.data !== "object" )
			asset.data = {
				assets : [],
				min : 1,
				max : -1,
			};
		html += '<div class="labelFlex">';
			html += '<label title="Min assets to pick">Min: <input type="number" min=-1 step=1 name="data::min" class="saveable" value="'+esc(asset.data.min || 1)+'" /></label>';
			html += '<label title="Max assets to pick">Max: <input type="number" min=-1 step=1 name="data::max" class="saveable" value="'+esc(asset.data.max === undefined ? -1 : asset.data.max)+'" /></label>';
		html += '</div>';
		// Todo: Bind
		html += '<div class="assets"></div>';
	}
	else if( type === Types.autoLoot ){
		if( typeof asset.data !== "object" )
			asset.data = {
				val : 0.5
			};
		html += '<div class="labelFlex">';
			html += '<label>Loot quality: <input type="range" min=0.01 max=1 step=0.01 name="data::val" class="saveable" value="'+esc(asset.data.min || 0.5)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.exit ){
		console.log("Todo: Need to pick a dungeon, then redraw, then pick from rooms from that dungeon");
	}
	else if( type === Types.anim ){
		if( typeof asset.data !== "object" )
			asset.data = {
				anim : 'open'
			};
		html += '<div class="labelFlex">';
			html += '<label>Animation: <input type="text" name="data::anim" class="saveable" value="'+esc(asset.data.anim || '')+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.lever ){
		console.log("Todo: need to fetch dvars");
	}
	else if( type === Types.quest ){
		// Todo: Bind
		if( typeof asset.data !== "object" )
			asset.data = {
				quest : ''
			};
		html += 'Ques: <div class="quest"></div>';
	}
	else if( type === Types.questObjective ){
		/*
		if( typeof asset.data !== "object" || !asset.data.quest )
			asset.data = {
				quest : ''
				objective : '',
			};
			objective:(str)label, type:(str "add"/"set")="add", amount:(int)amount=1
		// Todo: bind
		html += '<div class="quest"></div>';
		*/
		// Todo: need to fetch objectives from the quest
	}
	else if( type === Types.addInventory ){
		// Todo: Bind
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
				asset : '',
				amount : 1
			};
		// Todo: bind
		html += 'Asset: <div class="asset"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="If unset, tied to the event target">Target player label: <input type="text" name="data::player" class="saveable" value="'+esc(asset.data.player || '')+'" /></label>';
			html += '<label title="Nr copies of the asset to give">Amount: <input type="number" min=1 step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount || 0)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.toggleCombat ){
		if( typeof asset.data !== "object" )
			asset.data = {
				on : true,
				enc : true
			};
		html += '<div class="labelFlex">';
			html += '<label>Combat on: <input type="checkbox" name="data::on" '+(asset.data.on ? 'checked' : '')+' class="saveable" /></label>';
			html += '<label>Save hostility state: <input type="checkbox" name="data::enc" '+(asset.data.enc ? 'checked' : '')+' class="saveable" /></label>';
		html += '</div>';
	}
	// No data, just set it to empty
	else if( type === Types.visitDungeon ){
		asset.data = {};
	}
	else if( type === Types.roleplay ){
		if( typeof asset.data !== "object" )
			asset.data = {
				rp : '',
			};
		// Todo: Bind
		html += 'Roleplay: <div class="roleplay"></div>';
	}
	else if( type === Types.finishQuest ){
		if( typeof asset.data !== "object" )
			asset.data = {
				quest : '',
				force : false
			};
		html += '<div class="labelFlex">';
			html += '<label>Force: <input type="checkbox" name="data::force" '+(asset.data.force ? 'checked' : '')+' class="saveable" /></label>';
		html += '</div>';
		// Todo: Bind
		html += 'Quest: <div class="quest"></div>';
	}
	else if( type === Types.tooltip ){
		if( typeof asset.data !== "object" )
			asset.data = {
				text : ''
			};
		html += '<div class="labelFlex">';
			html += '<label>Text: <input type="text" name="data::text" value="'+(asset.data.text)+'" class="saveable" /></label>';
		html += '</div>';
	}
	else if( type === Types.shop ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
				shop : ''
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
		html += 'Shop: <div class="shop"></div>';
	}
	else if( type === Types.gym ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
	}
	else if( type === Types.playerAction ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
				action : ''
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
		html += 'Action: <div class="action"></div>';
	}
	else if( type === Types.repairShop ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
	}
	else if( type === Types.text ){
		if( typeof asset.data !== "object" )
			asset.data = {
				text : '',
			};
		// Todo: bind
		html += 'Text: <div class="text"></div>';
	}
	else if( type === Types.hitfx ){
		if( typeof asset.data !== "object" )
			asset.data = {
				hitfx : '',
				caster_conds : [],
				target_conds : [],
				max_triggers : [],
			};
		// Todo: bind
		html += 'Hitfx: <div class="hitfx"></div>';
		html += 'Caster Conditions: <div class="hitfx"></div>';
		html += 'Target Conditions: <div class="hitfx"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Max triggers: <input type="number" min=1 step=1 name="data::max_triggers" class="saveable" value="'+esc(asset.data.max_triggers || 1)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.addPlayer ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
				turn : -1
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Turn: <input type="number" step=1 name="data::turn" class="saveable" value="'+esc(asset.data.turn)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.addPlayerTemplate ){
		if( typeof asset.data !== "object" )
			asset.data = {
				player : '',
				next_turn : false
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Next turn: <input type="checkbox" name="data::next_turn" class="saveable" '+(asset.data.next_turn ? 'checked' :'' )+' /></label>';
		html += '</div>';
	}
	else if( type === Types.rentRoom ){
		if( typeof asset.data !== "object" )
			asset.data = {
				cost:0, 
				text:'', 
				success_text:'', 
				player:''
			};
		// Todo: bind
		html += 'Player: <div class="player"></div>';
		html += 'Text: <div class="text"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Cost in copper: <input type="number" step=1 min=0 name="data::cost" class="saveable" value="'+esc(asset.data.cost)+'" /></label>';
			html += '<label>Success text: <input type="text" name="data::success_text" class="saveable" value="'+esc(asset.data.success_text)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.execRentRoom ){
		if( typeof asset.data !== "object" )
			asset.data = {
				renter:'',
				cost : '',
				success_text : ''
			};
		// Todo: bind
		html += 'Renter: <div class="renter"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Cost in copper: <input type="number" step=1 min=0 name="data::cost" class="saveable" value="'+esc(asset.data.cost)+'" /></label>';
			html += '<label>Success text: <input type="text" name="data::success_text" class="saveable" value="'+esc(asset.data.success_text)+'" /></label>';
		html += '</div>';
		
	}
	else if( type === Types.sleep ){
		asset.data = {};
	}
	else if( type === Types.resetRoleplay ){
		if( typeof asset.data !== "object" )
			asset.data = {
				roleplay : '',
			};
		// Todo: bind
		html += 'Roleplay: <div class="roleplay"></div>';
		
	}
	else if( type === Types.setDungeon ){
		// Todo: need to fetch a list of dungeons and then rooms etc
	}
	else if( type === Types.addFaction ){
		if( typeof asset.data !== "object" )
			asset.data = {
				faction:'', 
				amount:5
			};
		// Todo: bind
		html += 'Faction: <div class="faction"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Amount of rep: <input type="number" step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.trade ){
		if( typeof asset.data !== "object" )
			asset.data = {
				asset:'', 
				amount:1, 
				from:'', 
				to:''
			};
		// Todo: bind
		html += 'Asset: <div class="asset"></div>';
		html += 'Amount: <div class="amount"></div>';
		html += 'From: <div class="from"></div>';
		html += 'To: <div class="to"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Amount of the item: <input type="number" step=1 min=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.learnAction ){
		if( typeof asset.data !== "object" )
			asset.data = {
				conditions:[], 
				action:''
			};
		// Todo: bind
		html += 'Player Conditions: <div class="conditions"></div>';
		html += 'Action: <div class="action"></div>';
	}
	else{
		// Fall back on JSON
		html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';
	}


	html += 'Conditions: <br />';
	html += '<div class="conditions"></div>';


	this.setDom(html);


	fnBind();

	// Bind the various types


	// Describe what the json editor data should look like
	this.dom.querySelector("select[name=type]").addEventListener("change", event => {
		asset.data = false;
		asset.type = event.currentTarget.value;
		this.rebuild();
		HelperAsset.rebuildAssetLists(DB);
		event.stopImmediatePropagation();
	});

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

