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
import * as EditorDungeonTemplate from './EditorDungeonTemplate.js';
import * as EditorBook from './EditorBook.js';
import Generic from '../../classes/helpers/Generic.js';



import GameAction from '../../classes/GameAction.js';
import Dungeon, { DungeonRoom } from '../../classes/Dungeon.js';
import Player from '../../classes/Player.js';
import Calculator from '../../classes/Calculator.js';

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Type: <select name="type" class="saveable">';
		let types = Object.keys(GameAction.types).sort();
		for( let i of types )
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
				index : 0,
				badge : 0
			};

		const dungeon = this.parent.asset.asset.parent.parent,
			cache_rooms = []
		;

		for( let label of dungeon.rooms ){
			let r = window.mod.getAssetById('dungeonRooms', label);
			if( r )
				cache_rooms.push(r);
		}

		html += '<div class="labelFlex">';
			// {index:(int)room_index, badge:(int)badge_type}
			html += '<label>Room: <select name="data::index" data-type="int" class="saveable">';
			for( let r of cache_rooms )
				html += '<option value="'+esc(r.index)+'" '+(r.index === asset.data.index ? 'selected' : '')+'>'+esc(r.name)+'</option>';
			html += '</select></label>';

			const badgeTypes  = {
				'Default' : 0,
				'Hide' : 1,
				'Default minus exit tracker' : 2
			};
			html += '<label>Badge: <select name="data::badge" data-type="int" class="saveable">';
			for( let label in badgeTypes )
				html += '<option value="'+esc(badgeTypes[label])+'" '+(badgeTypes[label] === asset.data.badge ? 'selected' : '')+'>'+esc(label)+'</option>';
			html += '</select></label>';

		html += '</div>';

	}
	else if( type === Types.encounters ){

		// Converts legacy encounters
		if( Array.isArray(asset.data) )
			asset.data = {encounter:asset.data};
		
		if( !asset.data )
			asset.data = {encounter:[]};
		
			
		html += 'Encounters: <div class="encounters"></div>';
		html += '<label>Replace current encounter: <input type="checkbox" name="data::replace" class="saveable" '+( asset.data.replace ? 'checked' : '' )+' /></label>';
		html += '<br />';
		fnBind = () => {
			this.dom.querySelector("div.encounters").appendChild(EditorEncounter.assetTable(this, asset, "data::encounter", false));
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

		// Converts legacy wrappers
		if( Array.isArray(asset.data) )
			asset.data = {wrappers:asset.data};

		if( !asset.data )
			asset.data = {wrappers:[]};

		html += 'Wrappers: <div class="wrappers"></div>';

		fnBind = () => {
			this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "data::wrappers", false));
		};

	}
	else if( type === Types.loot ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				loot : [],
				min : 1,
				max : -1,
			};
		html += '<div class="labelFlex">';
			html += '<label title="Min assets to pick">Min: <input type="number" min=-1 step=1 name="data::min" class="saveable" value="'+esc(asset.data.min || 1)+'" /></label>';
			html += '<label title="Max assets to pick">Max: <input type="number" min=-1 step=1 name="data::max" class="saveable" value="'+esc(asset.data.max === undefined ? -1 : asset.data.max)+'" /></label>';
		html += '</div>';
		html += '<div class="loot"></div>';

		fnBind = () => {
			this.dom.querySelector("div.loot").appendChild(EditorAsset.assetTable(this, asset, "data::loot", false));
		};

	}
	else if( type === Types.autoLoot ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				val : 0.5
			};
		html += '<div class="labelFlex">';
			html += '<label>Loot quality <span class="valueExact"></span>: <input type="range" min=0.01 max=1 step=0.01 name="data::val" class="saveable" value="'+esc(asset.data.val || 0.5)+'" /></label>';
		html += '</div>';

	}
	else if( type === Types.exit ){

		// {dungeon:(str)dungeon_label, index:(int)landing_room=0, time:(int)travel_time_seconds=60}
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				dungeon : '',
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

			html += '<label>Room: <select class="saveable"  data-type="int" name="data::index">';
			for( let r of cache_rooms )
				html += '<option value="'+esc(r.index || 0)+'" '+(r.index === asset.data.index ? 'selected' : '')+'>['+esc(r.index || 0)+'] '+esc(r.name || 'Unknown Room')+'</option>';
			html += '</select></label>';

		}
		
		
			html += '<label>Travel time in seconds: <input type="number" min=0 step=1 value="'+esc(asset.data.time)+'" name="data::time" class="saveable" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));
		};



	}
	else if( type === Types.proceduralDungeon ){

		// {dungeon:(str)dungeon_label, index:(int)landing_room=0, time:(int)travel_time_seconds=60}
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				label : '',
				templates : []
			};

		html += 'Dungeon: <div class="dungeon"></div>';
		html += '<label title="Make up a unique label for this dungeon">Dungeon Label: <input type=text value="'+esc(asset.data.label)+'" name="data::label" class="saveable" /></label>';

		html += '<br />Templates: <br /><div class="templates"></div>';

		fnBind = () => {
			this.dom.querySelector("div.templates").appendChild(EditorDungeonTemplate.assetTable(this, asset, "data::templates", false));
		};



	}
	else if( type === Types.anim ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				anim : 'open',
				targ : ''
			};

		html += '<div class="labelFlex">';
			html += '<label>Animation: <input type="text" name="data::anim" class="saveable" value="'+esc(asset.data.anim || '')+'" /></label>';
			html += '<label title="Name of the asset(s) to trigger the animation on">Target (leave blank for parent mesh): <input type="text" name="data::targ" class="saveable" value="'+esc(asset.data.targ || '')+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.lever ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				id : 'myLever'
			};

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
				amount : 1,
			};
		
		html += '<div class="quest"></div>';
		

		html += '<div class="labelFlex">';

			// If quest exists: Fetch objectives
			const a = asset.data.quest && HelperAsset.getAssetById('quests', asset.data.quest);
			if( a ){

				html += '<label><select name="data::objective" class="saveable">';
				for( let objective of a.objectives ){

					let obj = HelperAsset.getAssetById('questObjectives', objective) || objective;
					if( obj && typeof obj === "object" )
						obj = obj.name;
					html += '<option value="'+esc(objective)+'" '+(objective === asset.data.objective ? 'selected' : '')+'>'+esc(obj)+'</option>';

				}
				html += '</select></label>';

				if( !asset.data.objective )
					asset.data.objective = a.objectives[0];

				if( typeof asset.data.objective === "object" )
					asset.data.objective = asset.data.objective.label;

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
				amount : 1,
				alert : false,
				equip : '',
			};

		html += 'Asset: <div class="asset"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="If unset, tied to the event target">Target player label: <input type="text" name="data::player" class="saveable" value="'+esc(asset.data.player || '')+'" /></label>';
			html += '<label title="Nr copies of the asset to give">Amount: <input type="number" min=1 step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount || 0)+'" /></label>';
			html += '<label title="Outputs a chat message">Notify chat: <input type="checkbox" name="data::alert" class="saveable" '+( asset.data.alert ? 'checked' : '' )+' /></label>';
			html += '<label title="Should it auto equip?">Equip: <select name="data::equip" class="saveable">'+
				'<option value="">No</option>'+
				'<option value="yes"'+(asset.data.equip === 'yes' ? ' checked' : '')+'>YES</option>'+
			'</select></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "data::asset", true));
		};
		
	}
	else if( type === Types.addCopper ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
				amount : 1
			};

		html += '<div class="labelFlex">';
			html += '<label title="If unset, tied to the event target">Target player label: <input type="text" name="data::player" class="saveable" value="'+esc(asset.data.player || '')+'" /></label>';
			html += '<label title="Copper to add, negative to subtract">Amount: <input type="number" step=1 name="data::amount" class="saveable" value="'+esc(asset.data.amount || 0)+'" /></label>';
		html += '</div>';
		
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
	else if( type == Types.addTime ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				seconds : 1
			};

		html += '<div class="labelFlex">';
			html += '<label title="Seconds to add">Seconds: <input type="number" step=1 name="data::seconds" class="saveable" value="'+esc(asset.data.seconds || 0)+'" /></label>';
		html += '</div>';	
	}
	else if( type == Types.sliceRpTargets ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				start : 0,
				numPlayers : -1
			};

		html += '<div class="labelFlex">';
			html += '<label title="Player to start with">Start: <input type="number" step=1 name="data::start" class="saveable" value="'+esc(asset.data.start || 0)+'" /></label>';
			html += '<label title="0 clears the list, -1 goes the end">Players to keep: <input type="number" step=1 name="data::numPlayers" class="saveable" value="'+esc(asset.data.numPlayers || 0)+'" /></label>';
		html += '</div>';	
	}
	else if( type == Types.sortRpTargets ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				mathvars : [],
				targets
			};
		if( !Array.isArray(asset.data.mathvars) )
			asset.data.mathvars = [];

		html += '<label title="Only global and t_ mathvars are supported">Sort on mathvars:</label>';
		html += '<div class="mathvars"></div>';	
		html += '<input type="button" value="Add Var" class="addVar" />';
		html += '<br />';


		fnBind = () => {

			const saveFields = () => {
				console.log("Saving");
				const rows = [...this.dom.querySelectorAll('div.mathvars > div.mathvar')];
				let out = [];
				for( let row of rows ){
					
					const v = row.querySelector('input[name=var]').value.trim(),
						desc = row.querySelector('input[name=desc]').checked
					;

					if( !v )
						continue;

					out.push({var:v, desc});
					
				}

				console.log("Compiled:", out);
				asset.data.mathvars = out;
				window.mod.setDirty();

			};

			const addField = (mathvar = '', desc = false) => {

				if( typeof mathvar !== "string" )
					mathvar = "";
					
				const field = this.dom.querySelector('div.mathvars');
				const sub = document.createElement('div');
				sub.classList.add('labelFlex', 'mathvar');
				field.append(sub);
				
				let label = document.createElement('label');
				label.title = 'Name of the mathvar to use. Try game.players[0].appendMathVars("ta_", {}) in a game console for a list.';
				let input = document.createElement('input');
				input.placeholder = 'Mathvar';
				input.name = 'var';
				input.value = mathvar;
				input.onchange = saveFields;
				label.append(input);
				sub.append(label);

				label = document.createElement('label');
				label.innerHTML = '<span>Descending</span>';
				input = document.createElement('input');
				input.type = 'checkbox';
				input.checked = desc;
				input.name = 'desc';
				input.onchange = saveFields;
				label.append(input);
				sub.append(label);
				sub.onclick = event => {
					if( !event.ctrlKey )
						return;
					sub.remove();
					saveFields();
				};

			};
			
			for( let v of asset.data.mathvars ){
				addField(v.var, v.desc);
			}

			this.dom.querySelector('input.addVar').onclick = addField;

		};

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
	else if( type === Types.transmog ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
			
		html += 'Player: <div class="player"></div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};
		
	}
	else if( type === Types.openShop ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				shop : ''
			};
		/*
		html += '<div class="labelFlex">';
			html += '<label>All players: <input type="checkbox" name="data::all" '+(asset.data.all ? 'checked' : '')+' class="saveable" /></label>';
		html += '</div>';
		*/
		html += 'Shop: <div class="shop"></div>';

		fnBind = () => {
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
	else if( type === Types.altar ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : '',
			};
			
		html += 'Player: <div class="player"></div>';
		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};
	}
	else if( type === Types.bank ){
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
		
		html += '<div class="labelFlex">';
			html += '<label>Text: <textarea name="data::text" class="saveable">'+esc(asset.data.text, true)+'</textarea></label>';
			html += '<label>Cost in copper: <input type="number" step=1 min=0 name="data::cost" class="saveable" value="'+esc(asset.data.cost)+'" /></label>';
			html += '<label>Success text: <input type="text" name="data::success_text" class="saveable" value="'+esc(asset.data.success_text)+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
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
		if( !asset.data )
			asset.data = {actions:[]};

		html += 'Game actions: <div class="actions"></div>';

		fnBind = () => {
			this.dom.querySelector("div.actions").appendChild(assetTable(this, asset, "data::actions", false));
		};

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

			html += '<label>Room: <select class="saveable"  data-type="int" name="data::room">';
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
	else if( type === Types.dungeonVar || type === Types.setRpVar ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				id : '',
				val : '',
				targets : [],
				operation : 'SET'
			};
		if( !Array.isArray(asset.data.targets) )
			asset.data.targets = [];

		const viableOps = ['SET','ADD','MUL'];
			
		html += 'This game action allows you to set vars to player arrays (see below). Simply set the value to a JSON array specifying the players you want to set on the var, ex ["Targets"].';
		if( type === Types.dungeonVar ){
			html += '<p>Dungeon (leave empty to use the active game dungeon)</p>';
			html += '<div class="dungeon"></div>';				
		}
		html += '<div class="labelFlex">';
			html += '<label title="ID of the var to set">ID (should ONLY contain alphanumeric characters and _): <input type="text" name="data::id" class="saveable" value="'+esc(asset.data.id || '')+'" /></label>';
			html += '<label>Value: Can be a formula. Don\'t forget the prefix such as rp_ or %rp_ or %d_<br />';
			html += '<input type="text" name="data::val" class="saveable" data-type="smart" value="'+esc(dummy.data.val || '')+'" /></label>';
			html += '<label>Operation: <select name="data::operation" class="saveable">';
			for( let op of viableOps )
				html += '<option value="'+op+'" '+(op === dummy.data.operation ? 'selected' : '')+'>'+op+'</option>';
			html += '</select></label>';
		html += '</div>';

		html += '<h3>Targets:</h3>';
		html += '<p>If you want to set the var on a specific player, you can do so here using Calculator target constants. See Cheat Sheet in the top menu for more info about target specific mathvars, or using rp_ vs %rp_.</p>';
	
		html += '<div class="targPlayers"></div>';	
		html += '<input type="button" value="Add Target" class="addTarget" />';
		html += '<br />';

		
		
		fnBind = () => {

			const saveTargetFields = () => {
				
				const rows = [...this.dom.querySelectorAll('div.targPlayers > input.player')];
				let out = [];
				for( let row of rows ){
					
					const v = row.value.trim();
					if( !v )
						continue;
					out.push(v);
					
				}

				asset.data.targets = out;
				window.mod.setDirty();

			};

			const addTargetField = (pl) => {

				if( typeof pl !== "string" )
					pl = '';

				const field = this.dom.querySelector('div.targPlayers');
				const sub = document.createElement('input');
				sub.value = pl;
				sub.setAttribute('list', 'datalist_mathTargs');

				sub.classList.add('player');
				field.append(sub);
				sub.onchange = saveTargetFields;

			};

			for( let p of asset.data.targets )
				addTargetField(p);
			
			if( type === Types.dungeonVar ){
				this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));
			}

			this.dom.querySelector('input.addTarget').onclick = addTargetField;

		};

	}
	else if( type === Types.resetRpVar ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				var : ''
			};
		html += '<div class="labelFlex">';
			html += '<label title="Empty resets all">Var to reset: <input type="text" name="data::var" class="saveable" value="'+esc(asset.data.var || '')+'" /></label>';
		html += '</div>';
	}
	else if( type === Types.playerMarker ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				x : 0, y : 0, z : 0,
				scale : 1.0
			};

		html += '<div class="labelFlex">';
			html += '<label title="X offset from chest">XYZ: '+
				'<input type="number" name="data::x" class="saveable" step=1 value="'+esc(asset.data.x || 0)+'" />'+
				'<input type="number" name="data::y" class="saveable" step=1 value="'+esc(asset.data.y || 0)+'" />'+
				'<input type="number" name="data::z" class="saveable" step=1 value="'+esc(asset.data.z || 0)+'" />'+
				'<input type="number" name="data::scale" class="saveable" value="'+esc(asset.data.scale || 0)+'" />'+
			'</label>';
		html += '</div>';
	}
	else if( type === Types.book ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				label : ''
			};

		html += '<div class="labelFlex"></div>';
		html += 'Book: <br /><div class="book"></div>';

		fnBind = () => {
			this.dom.querySelector("div.book").appendChild(EditorBook.assetTable(this, asset, "data::label", true, false));
		};

	}
	else if( type === Types.removePlayer ){
		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				player : ''
			};

		html += 'Player: <br /><div class="player"></div>';

		fnBind = () => {
			this.dom.querySelector("div.player").appendChild(EditorPlayer.assetTable(this, asset, "data::player", true));
		};

	}
	else if( type === Types.trap ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				min_targets : 1,
				max_targets : 1,
				action : '',
				chance : 1.0,
				stat : 0,
				name : 'Trap',
				game_actions : []
			};
		html += '<div class="labelFlex">'+
			'<label title="Name of the trap">Name: <input name="data::name" value="'+esc(asset.data.name || '')+'" class="saveable" /></label>'+
			'<label title="Between 0 and 1">Chance: <input name="data::chance" type="number" min=0 max=1 step=0.001 value="'+(isNaN(asset.data.chance) ? 1 : +asset.data.chance)+'" class="saveable" /></label>'+
			'<label title="Proficiency of the trap added to the action type such as phys, corrupt etc">Stat: <input name="data::stat" type="number" step=1 value="'+(asset.data.stat || 0)+'" class="saveable" /></label>'+
		'</div>';
		html += 'Action: <br /><div class="game_action"></div>';
		html += 'Game Actions: <br /><div class="game_actions"></div>';

		fnBind = () => {
			this.dom.querySelector("div.game_action").appendChild(EditorAction.assetTable(this, asset, "data::action", true));
			this.dom.querySelector("div.game_actions").appendChild(assetTable(this, asset, "data::game_actions", false));
		};

	}
	else if( type === Types.refreshPlayerVisibility || type === Types.refreshMeshes ){}	// No data

	else if( type == Types.restorePlayerTeam ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				team : Player.TEAM_PLAYER
			};

		html += '<div class="labelFlex">'+
			'<label title="Team, 0 = player, 1 = enemy, usually">Team: <input name="data::name" type="number" step=1 value="'+esc(asset.data.team || 0)+'" class="saveable" /></label>'+
		'</div>';

	}

	else if( type == Types.setPlayerTeam ){

		if( !asset.data || typeof asset.data !== "object" )
			asset.data = {
				playerConds : [],
				team : Player.TEAM_PLAYER
			};

		html += '<div class="labelFlex">'+
			'<label title="Team, 0 = player, 1 = enemy, usually. Can be a formula.">Team: <input name="data::name" value="'+esc(asset.data.team || 0)+'" class="saveable" /></label>'+
		'</div>';
		html += 'Player conditions: <br /><div class="playerConds"></div>';

		fnBind = () => {
			this.dom.querySelector("div.playerConds").appendChild(EditorCondition.assetTable(this, asset, "data::playerConds", false));
		};

	}

	else{


		// Fall back on JSON
		html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';
	}


	html += 'Conditions: <br />';
	html += '<div class="conditions"></div>';

	html += '<label title="Overrides the default target and runs the gameAction on any player that matches these conditions">Player conditions [advanced]</label><br />';
	html += '<div class="playerConds"></div>';


	this.setDom(html);


	fnBind();

	// Bind the various types


	// Describe what the json editor data should look like
	this.dom.querySelector("select[name=type]").addEventListener("change", event => {
		asset.data = {};
		asset.type = event.currentTarget.value;
		this.rebuild();
		HelperAsset.rebuildAssetLists(DB);
		event.stopImmediatePropagation();
	});

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.playerConds").appendChild(EditorCondition.assetTable(this, asset, "playerConds"));

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
		'*label' : true,
		'*desc' : true,
		'*type' : true,
		data : true,
		conditions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'gameAction_'+Generic.generateUUID(),
		desc : 'Teleports the users back to Yuug port',
		type : GameAction.types.setDungeon,
	}));

};

