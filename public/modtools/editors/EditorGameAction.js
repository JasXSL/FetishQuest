import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorEncounter from './EditorEncounter.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorQuest from './EditorQuest.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import * as EditorShop from './EditorShop.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorAction from './EditorAction.js';
import * as EditorText from './EditorText.js';
import * as EditorHitFX from './EditorHitFX.js';
import * as EditorPlayerTemplate from './EditorPlayerTemplate.js';
import * as EditorFaction from './EditorFaction.js';
import * as EditorDungeon from './EditorDungeon.js';



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
		if( !this.parent )
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
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				room : 0,
				badge : 0
			};

		console.log("Asset: ", asset);
		const dungeon = this.parent.asset.asset.parent.parent,
			room = this.parent.asset.asset.parent,
			roomAsset = this.parent.asset.asset,
			cache_rooms = []
		;
		for( let label of dungeon.rooms ){
			let r = window.mod.mod.getAssetById('dungeonRooms', label);
			if( r )
				cache_rooms.push(r);
		}

		html += '<div class="labelFlex">';
			// {index:(int)room_index, badge:(int)badge_type}
			html += '<label>Room: <select name="data::room" class="saveable">';
			for( let r of cache_rooms )
				html += '<option value="'+esc(r.index)+'" '+(r.index === asset.data.room ? 'selected' : '')+'>'+esc(r.name)+'</option>';
			html += '</select></label>';

			const badgeTypes  = {
				'Default' : 0,
				'Hide' : 1,
				'Default minus exit tracker' : 2
			};
			html += '<label>Badge: <select name="data::badge" class="saveable">';
			for( let label in badgeTypes )
				html += '<option value="'+esc(badgeTypes[label])+'" '+(badgeTypes[label] === asset.data.badge ? 'selected' : '')+'>'+esc(label)+'</option>';
			html += '</select></label>';

		html += '</div>';

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
			asset.data = {
				encounter : ''
			};
			
		html += 'Encounter: <div class="encounter"></div>';

		fnBind = () => {
			this.dom.querySelector("div.encounter").appendChild(EditorEncounter.assetTable(this, asset, "data::encounter", true));
		};

	}
	else if( type === Types.wrappers ){

		if( !Array.isArray(asset.data) )
			asset.data = [];

		html += 'Wrappers: <div class="wrappers"></div>';

		fnBind = () => {
			this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "data", false));
		};

	}
	else if( type === Types.loot ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				assets : [],
				min : 1,
				max : -1,
			};
		html += '<div class="labelFlex">';
			html += '<label title="Min assets to pick">Min: <input type="number" min=-1 step=1 name="data::min" class="saveable" value="'+esc(asset.data.min || 1)+'" /></label>';
			html += '<label title="Max assets to pick">Max: <input type="number" min=-1 step=1 name="data::max" class="saveable" value="'+esc(asset.data.max === undefined ? -1 : asset.data.max)+'" /></label>';
		html += '</div>';
		html += '<div class="assets"></div>';

		fnBind = () => {
			this.dom.querySelector("div.assets").appendChild(EditorAsset.assetTable(this, asset, "data::assets", false));
		};

	}
	else if( type === Types.autoLoot ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				val : 0.5
			};
		html += '<div class="labelFlex">';
			html += '<label>Loot quality: <input type="range" min=0.01 max=1 step=0.01 name="data::val" class="saveable" value="'+esc(asset.data.min || 0.5)+'" /></label>';
		html += '</div>';

	}
	else if( type === Types.exit ){

		// {dungeon:(str)dungeon_label, index:(int)landing_room=0, time:(int)travel_time_seconds=60}
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				index : 0,
				time : 60
			};

		html += 'Dungeon: <div class="dungeon"></div>';

		html += '<div class="labelFlex">';

		// HelperAsset because other mods are allowed here
		let dungeonAsset = asset.data.dungeon && HelperAsset.getAssetById('dungeons', asset.data.dungeon);
		if( dungeonAsset ){

			const cache_rooms = [];
			let indexExists = false;
			for( let room of dungeonAsset.rooms ){
				// room might be an object due to the main mod
				const r = typeof room === "object" ? room : HelperAsset.getAssetById('dungeonRooms', room);
				if( r ){
					cache_rooms.push(r);
					if( r.index === asset.data.index )
						indexExists = true;
				}
			}
			if( !indexExists )
				asset.data.index = 0;

			html += '<label>Room: <select class="saveable" name="data::index">';
			for( let r of cache_rooms )
				html += '<option value="'+esc(r.index || 0)+'" '+(r.index === asset.data.index ? 'selected' : '')+'>['+esc(r.index || 0)+'] '+esc(r.name || 'Unknown Room')+'</option>';
			html += '</label>';

		}
		
		
			html += '<label>Travel time in seconds: <input type=number min=0 step=1 value="'+esc(asset.data.time)+'" name="data::time" class="saveable" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));
		};



	}
	else if( type === Types.anim ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				anim : 'open'
			};
		html += '<div class="labelFlex">';
			html += '<label>Animation: <input type="text" name="data::anim" class="saveable" value="'+esc(asset.data.anim || '')+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.lever ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				id : 'myLever'
			};

		if( window.mod.mod.vars[asset.data.id] === undefined )
			window.mod.mod.vars[asset.data.id] = false;

		html += '<div class="labelFlex">';
			html += '<label>ID: <input type="text" name="data::id" class="saveable" value="'+esc(asset.data.id || '')+'" /></label>';
		html += '</div>';

		const preLabel = asset.data.id;
		fnBind = () => {
			const input = this.dom.querySelector("input[name='data::id']");
			input.addEventListener('change', () => {
				delete window.mod.mod.vars[preLabel];
				window.mod.mod.vars[input.value.trim()] = false;
			});
		};


	}
	else if( type === Types.quest ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				quest : ''
			};
		html += 'Quest: <div class="quest"></div>';

		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", true));
		};
	}
	else if( type === Types.questObjective ){
		// {quest:(str)label, objective:(str)label, type:(str "add"/"set")="add", amount:(int)amount=1}
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				type : 'add',
				amount : 1
			};
		
		html += '<div class="quest"></div>';
		

		html += '<div class="labelFlex">';

			// If quest exists: Fetch objectives
			const a = asset.data.quest && HelperAsset.getAssetById('quests', asset.data.quest);
			if( a ){

				html += '<label><select name="data::objective" class="saveable">';
				for( let objective of a.objectives ){
					if( objective && typeof objective === "object" )
						objective = objective.label;
					html += '<option value="'+esc(objective)+'" '+(objective === asset.data.objective ? 'selected' : '')+'>'+esc(objective)+'</option>';
				}
				html += '</select></label>';

			}

		
			html += '<label title="Action to perform">Action: <select name="data::type" class="saveable">';
				html += '<option value="add">Add</option>';
				html += '<option value="set" '+(asset.data.type === 'set' ? 'selected' : '')+'>Set</option>';
			html += '</select></label>';
			html += '<label title="Amount to add">Amount: <input type="number" step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount || 1)+'" /></label>';
		html += '</div>';
		

		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", true));
		};

	}
	else if( type === Types.addInventory ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				asset : '',
				amount : 1
			};

		html += 'Asset: <div class="asset"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="If unset, tied to the event target">Target player label: <input type="text" name="data::player" class="saveable" value="'+esc(asset.data.player || '')+'" /></label>';
			html += '<label title="Nr copies of the asset to give">Amount: <input type="number" min=1 step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount || 0)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "data::asset", true));
		};
		
	}
	else if( type === Types.toggleCombat ){
		if( !asset.data || typeof asset.data !== "object" )
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
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				rp : '',
			};
		html += 'Roleplay: <div class="roleplay"></div>';

		fnBind = () => {
			this.dom.querySelector("div.roleplay").appendChild(EditorRoleplay.assetTable(this, asset, "data::rp", true));
		};
	}
	else if( type === Types.finishQuest ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				quest : '',
				force : false
			};
		html += '<div class="labelFlex">';
			html += '<label>Force: <input type="checkbox" name="data::force" '+(asset.data.force ? 'checked' : '')+' class="saveable" /></label>';
		html += '</div>';

		html += 'Quest: <div class="quest"></div>';

		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", true));
		};
	}
	else if( type === Types.tooltip ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				text : ''
			};
		html += '<div class="labelFlex">';
			html += '<label>Text: <input type="text" name="data::text" value="'+(asset.data.text)+'" class="saveable" /></label>';
		html += '</div>';
	}
	else if( type === Types.shop ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				shop : ''
			};
			
		html += 'Player: <div class="player"></div>';
		html += 'Shop: <div class="shop"></div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
			this.dom.querySelector("div.shop").appendChild(EditorShop.assetTable(this, asset, "data::shop", true));
		};
		
	}
	else if( type === Types.gym ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
			
		html += 'Player: <div class="player"></div>';
		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};
	}
	else if( type === Types.playerAction ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				action : ''
			};
			
		html += 'Player: <div class="player"></div>';
		html += 'Action: <div class="action_edit"></div>';
		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
			this.dom.querySelector("div.action_edit").appendChild(EditorAction.assetTable(this, asset, "data::action", true));
		};
	}
	else if( type === Types.repairShop ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
			
		html += 'Player: <div class="player"></div>';
		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};
	}
	else if( type === Types.text ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				text : '',
			};
			
		html += 'Text: <div class="text"></div>';

		fnBind = () => {
			this.dom.querySelector("div.text").appendChild(EditorText.assetTable(this, asset, "data::text", true, true));
		};
	}
	else if( type === Types.hitfx ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				hitfx : '',
				caster_conds : [],
				target_conds : [],
				max_triggers : 1,
			};

		html += 'Hitfx: <div class="hitfx"></div>';
		html += 'Caster Conditions: <div class="caster_conds"></div>';
		html += 'Target Conditions: <div class="target_conds"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="0 = No max">Max triggers: <input type="number" min=0 step=1 name="data::max_triggers" class="saveable" value="'+esc(asset.data.max_triggers || 1)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.hitfx").appendChild(EditorHitFX.assetTable(this, asset, "data::hitfx", true));
			this.dom.querySelector("div.caster_conds").appendChild(EditorCondition.assetTable(this, asset, "data::caster_conds", false));
			this.dom.querySelector("div.target_conds").appendChild(EditorCondition.assetTable(this, asset, "data::target_conds", false));
		};

	}
	else if( type === Types.addPlayer ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				turn : -1
			};

		html += 'Player: <div class="player"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Turn: <input type="number" step=1 name="data::turn" class="saveable" value="'+esc(asset.data.turn)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};

	}
	else if( type === Types.addPlayerTemplate ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				next_turn : false
			};

		html += 'Player: <div class="player"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Next turn: <input type="checkbox" name="data::next_turn" class="saveable" '+(asset.data.next_turn ? 'checked' :'' )+' /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayerTemplate.assetTable(this, asset, "data::player", true));
		};

	}
	else if( type === Types.rentRoom ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				cost:0, 
				text:'', 
				success_text:'', 
				player:''
			};

			
		html += 'Player: <div class="player"></div>';
		html += 'Text: <div class="text"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Cost in copper: <input type="number" step=1 min=0 name="data::cost" class="saveable" value="'+esc(asset.data.cost)+'" /></label>';
			html += '<label>Success text: <input type="text" name="data::success_text" class="saveable" value="'+esc(asset.data.success_text)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
			this.dom.querySelector("div.text").appendChild(EditorText.assetTable(this, asset, "data::text", true, true));
		};
	}
	else if( type === Types.execRentRoom ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				renter:'',
				cost : '',
				success_text : ''
			};

		html += 'Renter: <div class="renter"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Cost in copper: <input type="number" step=1 min=0 name="data::cost" class="saveable" value="'+esc(asset.data.cost)+'" /></label>';
			html += '<label>Success text: <input type="text" name="data::success_text" class="saveable" value="'+esc(asset.data.success_text)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.renter").appendChild(EditorPlayer.assetTable(this, asset, "data::renter", true));
		};
		
	}
	else if( type === Types.sleep ){
		asset.data = {};
	}
	else if( type === Types.resetRoleplay ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				roleplay : '',
			};
			
		html += 'Roleplay: <div class="roleplay"></div>';

		fnBind = () => {
			this.dom.querySelector("div.roleplay").appendChild(EditorRoleplay.assetTable(this, asset, "data::roleplay", true));
		};
		
	}
	else if( type === Types.setDungeon ){
		// {dungeon:(str)dungeon, room:(int)index}
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {};

		html += 'Dungeon: <div class="dungeon"></div>';

		html += '<div class="labelFlex">';

		// HelperAsset because other mods are allowed here
		let dungeonAsset = asset.data.dungeon && HelperAsset.getAssetById('dungeons', asset.data.dungeon);
		if( dungeonAsset ){

			const cache_rooms = [];
			let indexExists = false;
			for( let room of dungeonAsset.rooms ){
				// room might be an object due to the main mod
				const r = typeof room === "object" ? room : HelperAsset.getAssetById('dungeonRooms', room);
				if( r ){
					cache_rooms.push(r);
					if( r.index === asset.data.index )
						indexExists = true;
				}
			}
			if( !indexExists )
				asset.data.index = 0;

			html += '<label>Room: <select class="saveable" name="data::room">';
			for( let r of cache_rooms )
				html += '<option value="'+esc(r.index || 0)+'" '+(r.index === asset.data.room ? 'selected' : '')+'>['+esc(r.index || 0)+'] '+esc(r.name || 'Unknown Room')+'</option>';
			html += '</select></label>';

		}

		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));
		};

	}
	else if( type === Types.addFaction ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				faction:'', 
				amount:5
			};
			
		html += 'Faction: <div class="faction"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Amount of rep: <input type="number" step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.faction").appendChild(EditorFaction.assetTable(this, asset, "data::faction", true));
		};

	}
	else if( type === Types.trade ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				asset:'', 
				amount:1, 
			};
			
		html += 'Asset: <div class="asset"></div>';
		html += 'From: <div class="from"></div>';
		html += 'To: <div class="to"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Amount of the item: <input type="number" step=1 min=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "data::asset", true));
			this.dom.querySelector("div.from").appendChild(EditorPlayer.assetTable(this, asset, "data::from", true));
			this.dom.querySelector("div.to").appendChild(EditorPlayer.assetTable(this, asset, "data::to", true));
		};

	}
	else if( type === Types.learnAction ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				conditions:[], 
				action:''
			};

		html += 'Player Conditions: <div class="player_conditions"></div>';
		html += 'Action: <div class="action_edit"></div>';

		fnBind = () => {
			this.dom.querySelector("div.player_conditions").appendChild(EditorCondition.assetTable(this, asset, "data::conditions", false));
			this.dom.querySelector("div.action_edit").appendChild(EditorAction.assetTable(this, asset, "data::action", true));
		};
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
	
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'label', 
		'type', 
		'desc', 
		'data'
	], single, parented, ignoreAsset);
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

