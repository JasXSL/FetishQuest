import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Condition from '../../classes/Condition.js';
import Generic from '../../classes/helpers/Generic.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorEncounter from './EditorEncounter.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorQuest from './EditorQuest.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import * as EditorShop from './EditorShop.js';
import * as EditorPlayer from './EditorPlayer.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorEffect from './EditorEffect.js';
import * as EditorAction from './EditorAction.js';
import * as EditorText from './EditorText.js';
import * as EditorHitFX from './EditorHitFX.js';
import * as EditorPlayerTemplate from './EditorPlayerTemplate.js';
import * as EditorFaction from './EditorFaction.js';
import * as EditorDungeon from './EditorDungeon.js';
import * as EditorDungeonTemplate from './EditorDungeonTemplate.js';
import * as EditorFetish from './EditorFetish.js';
import Action from '../../classes/Action.js';
import Asset from '../../classes/Asset.js';
import GameEvent from '../../classes/GameEvent.js';
import stdTag from '../../libraries/stdTag.js';
import { Effect } from '../../classes/EffectSys.js';
import Game from '../../classes/Game.js';
import Player from '../../classes/Player.js';

const DB = 'conditions',
	CONSTRUCTOR = Condition;

// Single asset editor
export function asset(){
	const 
		modtools = window.mod,
		id = this.id,
		asset = this.asset.asset || modtools.mod.getAssetById(DB, id);
		
	if( !asset.type )
		asset.type = Condition.Types.actionLabel;

	const dummy = Condition.loadThis(asset);

	if( !asset )
		return this.close();


	let html = '';

	if( !asset._h && !asset._mParent )
		html += 'Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /><br />';
	html += 'Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /><br />';
	html += 'Type: <select class="saveable" name="type">';
	let typeNames = Object.keys(Condition.Types);
	typeNames.sort();
	for( let type of typeNames ){
		html += '<option value="'+type+'" '+(type === dummy.type ? 'selected' : '')+'>'+esc(Condition.Types[type])+'</option>';
	}
	html += '</select><br />';
	html += 'Targ nr: <input type="number" class="saveable" name="targnr" min=-1 step=1 value="'+esc(dummy.targnr)+'" /><br />';
	

	html += '<label>Caster <input type="checkbox" class="saveable" name="caster" '+(dummy.caster ? 'checked' : '')+' /></label>';
	html += '<label>Inverse <input type="checkbox" class="saveable" name="inverse" '+(dummy.inverse ? 'checked' : '')+' /></label>';
	html += '<label>Any Player <input type="checkbox" class="saveable" name="anyPlayer" '+(dummy.anyPlayer ? 'checked' : '')+' /></label>';
	html += '<label>Debug <input type="checkbox" class="saveable" name="debug" '+(dummy.debug ? 'checked' : '')+' /></label>';



	html += '<br /><br /><span class="description">'+esc(Condition.descriptions[dummy.type] || "Unknown type")+'</span><br />';


	const buildActionTypeSelect = (name, current, allowAny = true) => {

		let out = '<select name="'+name+'" class="saveable">';
		if( allowAny )
			out += '<option value="">- ANY -</option>';
		for( let i in Action.Types )
			out += '<option value="'+Action.Types[i]+'" '+(current === Action.Types[i] ? 'selected' : '')+'>'+i+'</option>';
		out += '</select>';
		return out;

	};

	const buildActionRangeSelect = (name, current) => {

		let out = '<select name="'+name+'" class="saveable">';
		for( let i in Action.Range )
			out += '<option value="'+Action.Range[i]+'" '+(current === Action.Range[i] ? 'selected' : '')+'>'+i+'</option>';
		out += '</select>';
		return out;

	};

	const buildMathOperators = (name, current) => {

		let operators = ['>','<','='];
		let out = '<select class="saveable" name="'+name+'">';
		for( let op of operators )
			out += '<option value="'+esc(op)+'" '+(current === op ? 'selected' : '')+'>'+esc(op)+'</option>';
		out += '</select>';

		return out;

	};

	const setDefaultData = defaultData => {
		
		if( typeof asset.data !== 'object' )
			asset.data = defaultData;

		// Automatically typecast optional arrays to arrays
		for( let i in defaultData ){

			if( Array.isArray(defaultData[i]) && !Array.isArray(asset.data[i]) ){

				if( asset.data[i] == undefined )
					asset.data[i] = [];
				else
					asset.data[i] = [asset.data[i]];

			}

			if( !asset.data.hasOwnProperty(i) )
				asset.data[i] = defaultData[i];

		}

	};

	// For any thing that uses {amount:(int)amount, operation:(str)operation}. You can use this
	const buildDefaultValueFields = withPerc => {

		const dd = {
			amount : 0, 
			operation: '>'
		};
		if( withPerc )
			dd.perc = false;
		setDefaultData(dd);
		

		let html = '';
		html += '<div class="labelFlex">';
			html += '<label title="">Value: <input type="text" name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
			html += '<label>'+buildMathOperators('data::operation', asset.data.operation)+'</label>';
			if( withPerc )
				html += '<label>Percentage <input type="checkbox" name="data::perc" class="saveable" '+(asset.data.perc ? 'checked' : '')+' /></label>';
		html += '</div>';
		return html;

	};

	const createSingleSelect = (name, options, current, type) => {

		let html = '<select name="'+name+'" '+(type ? 'data-type="'+type+'"' : '')+' class="saveable">';
		for( let i in options )
			html += '<option value="'+esc(options[i])+'" '+(options[i] === current ? 'selected': '')+'>'+esc(i)+'</option>';
		html += '</select>';
		return html;

	};

	const createMultiSelect = (field, options, groupEl, buttonEl) => {

		const storeMultiSelect = () => {

			let all = {};
			const selects = this.dom.querySelectorAll(groupEl+' > select');
			for( let select of selects )
				all[select.value] = true;
			asset.data[field] = Object.keys(all);
			mod.setDirty(true);

		};

		const onMultiSelectClicked = event => {

			if( event.ctrlKey || event.metaKey ){
				
				event.currentTarget.parentNode.removeChild(event.currentTarget);
				storeMultiSelect();

			}

		}; 

		const addMultiSelect = val => {
			
			let out = document.createElement('select');
			out.classList.add('field');
			for( let i in options )
				out.innerHTML += '<option value="'+options[i]+'" '+(options[i] === val ? 'selected' : '')+'>'+i+'</option>'; 
			out.onclick = onMultiSelectClicked;
			out.onchange = storeMultiSelect;
			this.dom.querySelector(groupEl).append(out);

			//storeMultiSelect(); -- Probably not needed since it sets dirty?

		};

		for( let a of asset.data[field] )
			addMultiSelect(a);

		if( !asset.data[field].length )
			addMultiSelect();
		

		this.dom.querySelector(buttonEl).onclick = addMultiSelect;

		

	}

	const createMultiFreetext = (field, groupEl, buttonEl, type = 'text') => {

		const storeMultiSelect = () => {

			let all = {};
			const selects = this.dom.querySelectorAll(groupEl+' > input.text');
			for( let select of selects )
				all[select.value] = true;
			asset.data[field] = Object.keys(all);
			mod.setDirty(true);

		};

		const onMultiSelectClicked = event => {

			if( event.ctrlKey || event.metaKey ){
				
				event.currentTarget.parentNode.removeChild(event.currentTarget);
				storeMultiSelect();

			}

		}; 

		const addMultiSelect = val => {
			
			if( typeof val !== "string" )
				val = '';

			let out = document.createElement('input');
			out.type = type;
			out.classList.add('text');
			out.value = val;

			out.onclick = onMultiSelectClicked;
			out.onchange = storeMultiSelect;
			this.dom.querySelector(groupEl).append(out);
			storeMultiSelect();

		};

		for( let a of asset.data[field] )
			addMultiSelect(a);

		if( !asset.data[field].length )
			addMultiSelect('');
		
		this.dom.querySelector(buttonEl).onclick = addMultiSelect;

	}
	

	let fnBind = () => {};
	const types = Condition.Types;
	let type = dummy.type;

	if( type === types.actionCrit ){}
	else if( type === types.actionDetrimental ){}
	else if( type === types.actionHidden ){}
	else if( type === types.actionLabel ){

		setDefaultData({
			label : [],
			ignore_alias : false
		});
		
		html += 'Actions: <div class="label"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="">Ignore Alias: <input type="checkbox" value="1" name="data::ignore_alias" class="saveable" '+(asset.data.ignore_alias ? 'checked' : '')+' /></label>';
		html += '</div>';
		fnBind = () => {
			this.dom.querySelector("div.label").appendChild(EditorAction.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.actionGroup ){

		setDefaultData({
			group:""
		});
		
		html += '<div class="labelFlex">';
			html += '<label title="">Group: <input type="text" value="'+esc(asset.data.group)+'" name="data::group" class="saveable" /></label>';
		html += '</div>';

	}
	else if( type === types.actionOnCooldown ){

		setDefaultData({
			label : '',
		});
		html += 'Actions: <div class="label"></div>';
		fnBind = () => {
			this.dom.querySelector("div.label").appendChild(EditorAction.assetTable(this, asset, "data::label", true));
		};

	}
	else if( type === types.actionRanged ){}
	else if( type === types.lastActionRange ){

		setDefaultData({
			range : Action.Range.Melee,
		});
		html += buildActionRangeSelect('data::range', asset.data.range);

	}
	else if( type === types.actionResisted ){

		setDefaultData({
			type : Action.Types.arcane,
		});
		
		html += buildActionTypeSelect('data::type', asset.data.type, true);

	}
	else if( type === types.actionTag || type === types.roomTag || type === types.gameActionDataTags ){

		setDefaultData({
			tags : [],
		});

		html += '<div name="tags">'+HelperTags.build(asset.data.tags)+'</div>';

		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
				HelperTags.autoHandleAsset('data::tags', tags, asset);
			});
		};

	}
	else if( type === types.assetTag ){

		setDefaultData({
			tags : [],
			all : false,
		});

		html += '<div name="tags">'+HelperTags.build(asset.data.tags)+'</div>';
		html += '<div class="labelFlex">';
			html += '<label>Require all: <input type="checkbox" name="data::all" class="saveable" '+(asset.data.all ? 'checked' : '')+' /></label>';
		html += '</div>';

		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
				HelperTags.autoHandleAsset('data::tags', tags, asset);
			});
		};

	}
	else if( type === types.assetLabel ){

		setDefaultData({
			label : [],
		});

		html += 'Assets: <div class="label"></div>';

		fnBind = () => {
			this.dom.querySelector("div.label").appendChild(EditorAsset.assetTable(this, asset, "data::label", false));
		};

	}

	else if( type === types.mathVarCompare ){

		setDefaultData({
			label : '',
			val : '',
		});

		html += '<div class="labelFlex">';
			html += '<label title="MathVar to check. See Cheat Sheet for more info">'+
				'MathVar: <input type="text" value="'+esc(asset.data.label)+'" name="data::label" class="saveable" />'+
			'</label>';
			html += '<label title="Value to compare">'+
				'Value: <input type="text" value="'+esc(asset.data.val)+'" name="data::val" class="saveable" />'+
			'</label>';
			html += '<p>Note: You probably want target nr set to when using @@ target tags, as you can use that to check all targets at once. See Cheat Sheet for more info.</p>';
			html += '<p>Note: Type is not checked, it uses a simple JS == check.</p>';
			html += '<p>Note: This is mostly used for checking string mathvars. If you want to compare numbers, use the formula condition type.</p>';
			
		html += '</div>';


	}

	else if( type === types.actionType || type === types.lastActionType ){
		
		setDefaultData({
			type : '',
		});
		html += buildActionTypeSelect('data::type', asset.data.type, true);
		
	}
	else if( type === types.momentumValue ){

		setDefaultData({
			amount : 0,
			type : Player.MOMENTUM.All,
		});
		html += buildDefaultValueFields(true);

		html += '<select data-type="int" class="saveable" name="data::type">';
		for( let i in Player.MOMENTUM )
			html += '<option value="'+Player.MOMENTUM[i]+'" '+(asset.data.type === Player.MOMENTUM[i] ? 'selected' : '')+'>'+i+'</option>';
		html += '</select>';

	}
	else if( type === types.eventCustomAmount ){
		html += buildDefaultValueFields(); 
		html += '<label>Event custom field: <input name="data::field" value="'+esc(asset.data.field || '')+'" class="saveable" placeholder="amount" /></label>';
	}
	else if( type === types.blockValue ){
		html += buildDefaultValueFields();
	}
	else if( type === types.assetEquipped ){}
	else if( type === types.assetSlot ){

		setDefaultData({
			slot : [],
			all : false
		});

		html += '<div class="labelFlex">'+
				'<span class="slots"></span>'+
				'<input type="button" value="Add Viable Slot" class="addSlot" />'+
		'</div>';
		html += '<div class="labelFlex">';
			html += '<label>Require all: <input type="checkbox" name="data::all" class="saveable" '+(asset.data.all ? 'checked' : '')+' /></label>';
		html += '</div>';

		fnBind = () => { 

			createMultiSelect('slots', Asset.Slots, 'span.slots', 'input.addSlot');

		};

	}
	else if( type === types.assetStealable ){}
	else if( type === types.charging ){
		setDefaultData({
			conditions : [],
		});

		html += 'Action Conditions: <div class="conditions"></div>';
		fnBind = () => {
			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "data::conditions", false));
		};

	}
	else if( type === types.firstOnTeam ){
		setDefaultData({
			conditions : [],
		});

		html += 'Target Conditions: <div class="conditions"></div>';
		fnBind = () => {
			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "data::conditions", false));
		};

	}
	else if( type === types.copperValue ){
		html += buildDefaultValueFields();
	}
	else if( type === types.defeated ){}
	else if( type === types.isControlled ){}
	//else if( type === types.dungeonIs ){} Uses JSON to compare two direct objects
	else if( type === types.dungeonVar ){

		setDefaultData({id:'', data:'', dungeon:''});

		// Start by adding a dungeon picker
		html += 'Dungeon: <div class="dungeon"></div>';
		
		// Then generate a dropdown from that
		let dungeon = mod.getAssetById('dungeons', asset.data.dungeon);
		if( dungeon && dungeon.vars ){

			if( !asset.data.id )
				asset.data.id = Object.keys(dungeon.vars)[0];

			html += '<div class="labelFlex">';

				html += '<label>dVar: <select name="data::id" class="saveable">';
				for( let i in dungeon.vars )
					html += '<option value="'+esc(i)+'" '+(asset.data.id === i ? 'selected' : '')+'>'+esc(i)+'</option>';
				html += '</select></label>';

				html += '<label>Value: <input class="jsonify" name="data::data" value="'+esc(asset.data.data)+'" /></label>';

			html += '</div>';

		}
		else if( !dungeon ){

			html += '<p>Checking in active dungeon instead of specific dungeon</p>';
			html += '<label>Dvar: <input class="saveable" name="data::id" value="'+esc(asset.data.id)+'" /></label>';
			html += '<label>Value: <input class="jsonify" name="data::data" value="'+esc(asset.data.data)+'" /></label>';

		}

		fnBind = () => {

			this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));
			const val = this.dom.querySelector('input.jsonify');
			if( val )
				val.addEventListener('change', event => {

					let v;
					try{ v = JSON.parse(val.value); }
					catch(err){ v = val.value; }
					asset.data.data = v;

				});

		};

	}
	else if( type === types.location ){

		setDefaultData({dungeon:'', room:-1});

		// Start by adding a dungeon picker
		html += 'Dungeon: <div class="dungeon"></div>';
		
		// Then generate a dropdown from that
		let dungeon = mod.getAssetById('dungeons', asset.data.dungeon);
		if( dungeon ){

			html += '<div class="labelFlex">';

				html += '<label>Room: <select name="data::room" class="saveable">';
					html += '<option value="-1">- ANY -</option>';
				for( let r of dungeon.rooms ){

					const room = mod.getAssetById('dungeonRooms', r);
					if( !room )
						continue;
					html += '<option value="'+esc(room.index)+'" '+(parseInt(asset.data.room) === parseInt(room.index) ? 'selected' : '')+'>'+esc(room.name)+'</option>';

				}
				html += '</select></label>';
			html += '</div>';

		}
		else if( !dungeon ){

			html += '<p>Room picker shows after you select a dungeon</p>';

		}

		fnBind = () => {

			this.dom.querySelector("div.dungeon").appendChild(EditorDungeon.assetTable(this, asset, "data::dungeon", true));

		};

	}
	//else if( type === types.dungeonVarMath ){}	// Too complicated to do an editor. Use JSON
	else if( type === types.effectLabel ){
		setDefaultData({
			label : []
		});
		html += 'Effects: <div class="effect"></div>';
		fnBind = () => {
			this.dom.querySelector("div.effect").appendChild(EditorEffect.assetTable(this, asset, "data::label", false));
		};
	}
	else if( type === types.encounterLabel ){
		setDefaultData({
			label : []
		});
		html += 'Encounters: <div class="encounter"></div>';
		fnBind = () => {
			this.dom.querySelector("div.encounter").appendChild(EditorEncounter.assetTable(this, asset, "data::label", false));
		};
	}
	else if( type === types.event ){
		setDefaultData({
			event : [],
		});

		html += '<div class="labelFlex">'+
				'<span class="events"></span>'+
				'<input type="button" value="Add Viable Event" class="addEvent" />'+
		'</div>';

		fnBind = () => {

			createMultiSelect('event', GameEvent.Types, 'span.events', 'input.addEvent');

		};
	}
	else if( type === types.formula ){

		setDefaultData({formula:''});
		html += 'Formula (not JSON): <textarea class="saveable" name="data::formula">'+esc(asset.data.formula)+'</textarea>';

	}
	else if( type === types.genitalSizeValue ){

		// stdTag.breasts/stdTag.penis/stdTag.butt
		setDefaultData({amount:0, operation:'>', genital:stdTag.penis});

		html += '<div class="labelFlex">';
			html += '<label>Genital: <select name="data::genital" class="saveable">';
			let viableGenitals = [stdTag.penis, stdTag.breasts, stdTag.butt];
			for( let g of viableGenitals )
				html += '<option value="'+g+'" '+(asset.data.genital === g ? 'selected' : '')+'>'+g+'</option>';
			html += '</select></label>';

			html += '<label>Size: <select name="data::genital" class="saveable size">';
			let sizeNames = ['none', 'small', 'average', 'large', 'huge'];
			for( let i = 0; i < sizeNames.length; ++i )
				html += '<option value="'+i+'" '+(asset.data.amount == i ? 'selected' : '')+'>'+sizeNames[i]+'</option>';
			html += '</select></label>';
			html += '<label>'+buildMathOperators('data::operation', asset.data.operation)+'</label>';
		html += '</div>';

		fnBind = () => {
			const size = this.dom.querySelector('select.size');
			size.addEventListener('change', () => {
				asset.data.amount = parseInt(size.value) || 0;
			});
		};

	}
	else if( type === types.hasActiveConditionalPlayer ){

		setDefaultData({
			conditions : [],
			min : 1
		});
		html += 'Conditions: <div class="conditions"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Min nr matching players: <input type="number" name="data::min" step=1 min=1 class="saveable" value="'+(parseInt(asset.data.min) || 1)+'" /></label>';
			html += '<label title="Includes followers that have been unlocked but are not active. For multiplayer, this only works on labels.">'+
				'Include stashed followers: <input type="checkbox" name="data::stashedFollowers" value=1 class="saveable" '+(asset.data.stashedFollowers ? 'checked' : '')+' />'+
			'</label>';
		html += '</div>';
		fnBind = () => {
			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "data::conditions", false));
		};

	}
	else if( type === types.hasAsset ){

		setDefaultData({
			conditions : [],
			min : 1
		});
		html += '<div class="labelFlex">';
			html += '<label>Min nr of the asset: <input type="number" name="data::min" step=1 min=1 class="saveable" value="'+(parseInt(asset.data.min) || 1)+'" /></label>';
		html += '</div>';
		html += 'Conditions: <div class="conditions"></div>';
		fnBind = () => {
			this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "data::conditions", false));
		};

	}
	else if( type === types.hasEffect ){

		setDefaultData({
			label : [],
			byCaster : false
		});

		
		html += 'Effects: <div class="label"></div>';
		html += '<div class="labelFlex">';
			html += '<label>By event sender: <input type="checkbox" name="data::byCaster" class="saveable" '+(asset.data.byCaster ? 'checked' : '')+'" /></label>';
		html += '</div>';
		fnBind = () => {
			this.dom.querySelector("div.label").appendChild(EditorEffect.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.hasEffectType ){

		setDefaultData({
			type : [],
			byCaster : false
		});

		html += '<div>'+
			'<span class="types"></span>'+
			'<input type="button" value="Add Viable Type" class="addType" />'+
		'</div>'+
		'<div class="labelFlex">'+
			'<label>By event sender: <input type="checkbox" name="data::byCaster" class="saveable" '+(asset.data.byCaster ? 'checked' : '')+' /></label>'+
		'</div>';
		fnBind = () => {
			createMultiSelect('type', Effect.Types, 'span.types', 'input.addType');
		};

	}
	else if( type === types.hasFreeBondageDevice ){}
	else if( type === types.hasInventory ){

		setDefaultData({
			label : '',
			amount : 1
		});
		html += 'Asset: <div class="asset"></div>';

		html += '<div class="labelFlex">'+
			'<label>Min nr: <input type="number" name="data::amount" class="saveable" value="'+(parseInt(asset.data.amount)||1)+'" /></label>'+
		'</div>';

		fnBind = () => {
			this.dom.querySelector("div.asset").appendChild(EditorAsset.assetTable(this, asset, "data::label", true));
		};

	}
	else if( type === types.hasRepairable ){}
	else if( type === types.hasWrapper ){

		setDefaultData({
			label : [],
			byCaster : false
		});

		html += 'Wrappers: <div class="wrappers"></div>';
		html += '<div class="labelFlex">'+
			'<label>By event sender: <input type="checkbox" name="data::byCaster" class="saveable" '+(asset.data.byCaster ? 'checked' : '')+' /></label>'+
		'</div>';
		fnBind = () => {
			this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.hourRange ){

		setDefaultData({
			min : 0,
			max : 24
		});

		html += '<div class="labelFlex">'+
			'<label title="Clock is between 00 and 24, you can use fractions">Min hour: <input type="number" name="data::min" min=0 max=24 class="saveable" value="'+(parseInt(asset.data.min)||0)+'" /></label>'+
			'<label title="Clock is between 00 and 24, you can use fractions">Max nr: <input type="number" name="data::max" min=0 max=24 class="saveable" value="'+(parseInt(asset.data.max)||0)+'" /></label>'+
		'</div>';

	}
	else if( type === types.hpValue ){
		html += buildDefaultValueFields(true);
	}
	else if( type === types.arousalValue ){
		html += buildDefaultValueFields(true);
	}
	else if( type === types.isActionParent ){}
	else if( type === types.isRoleplayPlayer ){ 

		html += '<div class="labelFlex">';
			html += '<label title="Use -1 for any index">Index: <input type="number" name="data::index" step=1 min=-1 class="saveable" value="'+(parseInt(asset.data.index) || -1)+'" /></label>';
		html += '</div>';

	}
	else if( type === types.isWrapperParent ){

		setDefaultData({
			originalWrapper : false
		});
		html += '<div class="labelFlex">';
			html += '<label title="When checking effect conditions, the event wrapper is always the effect\'s parent. If the event has a wrapper already, it gets put as original wrapper.">'+
				'Use original wrapper: <input type="checkbox" name="data::originalWrapper" class="saveable" '+(asset.data.originalWrapper ? 'checked' : '')+' />'+
			'</label>';
		html += '</div>';

	}
	else if( type === types.itemStolen ){}
	else if( type === types.numRpTargets ){
		html += buildDefaultValueFields();
	}
	else if( type === types.notInCombat ){}
	else if( type === types.numGamePlayersGreaterThan ){

		setDefaultData({
			amount : 1,
			team : 0,
			controlled : false
		});

		html += '<div class="labelFlex">'+
			'<label title="">Amount: <input type="number" name="data::amount" class="saveable" value="'+(parseInt(asset.data.amount)||0)+'" /></label>'+
			'<label title="Enter a value that is not a number to check ALL players">Team: <input type="text" name="data::team" class="saveable dataTeam" value="'+(isNaN(asset.data.team) ? "undefined" : parseInt(asset.data.team))+'" /></label>'+
			'<label title="Only count player owned characters">PC Only: <input type="checkbox" name="data::controlled" class="saveable" '+(asset.data.controlled ? 'checked' : '')+' /></label>'+
		'</div>';

		fnBind = () => {
			const input = this.dom.querySelector("input.dataTeam");
			input.addEventListener('change', () => {

				setTimeout(() => {
					if( isNaN(input.value) )
						asset.data.team = 'U';
					else
						asset.data.team = parseInt(input.value);
				}, 1);

			});
		};

	}
	else if( type === types.playerClass ){

		setDefaultData({
			label : []
		});

		html += 'Class: <div class="class"></div>';

		fnBind = () => {
			this.dom.querySelector("div.class").appendChild(EditorPlayerClass.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.playerLabel ){

		setDefaultData({
			label : []
		});

		html += 'Player: <div class="label"></div>';
		fnBind = () => {
			this.dom.querySelector("div.label").appendChild(EditorPlayer.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.voice ){

		setDefaultData({
			label : []
		});

		html += '<div name="voice">'+HelperTags.build(asset.data.label, 'audioTriggers')+'</div>';
		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=voice]"), tags => {
				HelperTags.autoHandleAsset('data::label', tags, asset);
			});
		};

	}
	else if( type === types.punishNotUsed ){}
	else if( type === types.questAccepted ){

		setDefaultData({
			quest : []
		});

		html += 'Quest: <div class="quest"></div>';
		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", false));
		};

	}
	else if( type === types.questCanHandIn ){

		setDefaultData({
			quest : []
		});

		html += 'Quest: <div class="quest"></div>';
		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", false));
		};

	}
	else if( type === types.questCompleted ){

		setDefaultData({
			quest : []
		});

		html += 'Quest: <div class="quest"></div>';
		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", false));
		};

	}
	else if( type === types.isGenderEnabled ){
		
		setDefaultData({
			genders : Game.Genders.Male,
		});

		html += '<div class="labelFlex">';
		for( let gender in Game.Genders ){
			const g = Game.Genders[gender];
			html += '<label>'+gender+': <input type="checkbox" value='+g+' name="data::genders" class="saveable bitwise" '+(asset.data.genders & g ? 'checked' : '')+' /></label>';
		}
		html += '</div>';

	}
	else if( type === types.targetGenderEnabled ){
		
		setDefaultData({
		});

		html += '<div class="labelFlex">';
		html += '</div>';

	}
	//else if( type === types.questIs ){} JSON only
	else if( type === types.questObjectiveCompleted ){

		setDefaultData({
			quest : '',
			objective : '',
		});

		html += 'Quest: <div class="quest"></div>';

		const q = mod.getAssetById('quests', asset.data.quest);
		if( q ){
			
			let obj = q.objectives;
			if( !Array.isArray(q.objectives) )
				obj = q.objectives;

			if( !obj.includes(asset.data.objective) )
				asset.data.objective = obj[0];

			let objectives = obj.map(el => mod.getAssetById('questObjectives', el)).filter(el => el);
			if( objectives.length && !asset.data.objective )
				asset.data.objective = objectives[0].label;
			

			html += 'Objective: <select name="data::objective" class="saveable">';
			for( let objective of objectives )
				html += '<option value="'+esc(objective.label)+'" '+(objective.label === asset.data.objective ? 'selected' : '')+'>'+esc(objective.name)+'</option>';
			html += '</select>';

		}


		fnBind = () => {
			this.dom.querySelector("div.quest").appendChild(EditorQuest.assetTable(this, asset, "data::quest", true));
		};

	}
	else if( type === types.rainGreaterThan ){
		
		setDefaultData({
			val : 0,
			allowIndoor : false
		});

		html += '<div class="labelFlex">'+
			'<label title="">Value between 0 and 1: <input type="number" min=0 max=1 name="data::val" class="saveable" value="'+(+asset.data.val || 0)+'" /></label>'+
			'<label title="">Allow indoors: <input type="checkbox" value="1" name="data::allowIndoor" class="saveable" '+(asset.data.allowIndoor ? 'checked' : '')+' /></label>'+
		'</div>';

	}
	else if( type === types.rng ){
		setDefaultData({
			chance : 50
		});

		html += '<div class="labelFlex">'+
			'<label title="Can be a formula">Chance: <input type="text" name="data::chance" class="saveable" value="'+esc(asset.data.chance)+'" /></label>'+
		'</div>';

	}
	else if( type === types.roomIsOutdoors ){}
	else if( type === types.roomZ ){
		setDefaultData({
			min : -1,
			max : -1
		});

		html += '<div class="labelFlex">'+
			'<label title="Enter \'inf\' for negative infinity">Min Z height: <input type="text" name="data::min" class="saveable" value="'+esc(asset.data.min)+'" /></label>'+
			'<label title="Enter \'inf\' for positive infinity">Max Z height: <input type="text" name="data::max" class="saveable" value="'+esc(asset.data.max)+'" /></label>'+
		'</div>';
	}
	else if( type === types.sadism ){
		html += buildDefaultValueFields();
	}
	else if( type === types.dom ){
		html += buildDefaultValueFields();
	}
	else if( type === types.intelligence ){
		html += buildDefaultValueFields();
	}
	else if( type === types.hetero ){
		html += buildDefaultValueFields();
	}
	else if( type === types.sameTeam ){}
	else if( type === types.sizeValue ){
		html += buildDefaultValueFields();
	}
	else if( type === types.slotDamaged || type === types.slotStripped ){

		setDefaultData({
			slot : ''
		});

		let sl = {
			'any' : '',
			'Armor' : 'ARM'
		};
		for( let i in Asset.Slots ){
			if( i !== 'none' )
				sl[i] = Asset.Slots[i];
		}
		html += '<div class="labelFlex">';
			html += createSingleSelect('data::slot', sl, asset.data.slot);
		html += '</div>';

	}
	else if( type === types.species ){

		setDefaultData({
			species : []
		});

		html += '<div>'+
			'<span class="specs"></span>'+
			'<input type="button" value="Add Species" class="addSpec" />'+
		'</div>';

		fnBind = () => {
			createMultiFreetext('species', 'span.specs', 'input.addSpec');
		};

	}
	else if( type === types.tag ){

		setDefaultData({
			tags : [],
			caster : false,
			all : false
		});
		
		html += '<div name="tags">'+HelperTags.build(asset.data.tags)+'</div>';

		html += '<div class="labelFlex">'+
			'<label title="">Only applied by sender: <input type="checkbox" value="1" name="data::caster" class="saveable" '+(asset.data.caster ? 'checked' : '')+' /></label>'+
			'<label title="">Require ALL: <input type="checkbox" value="1" name="data::all" class="saveable" '+(asset.data.all ? 'checked' : '')+' /></label>'+
		'</div>';

		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
				HelperTags.autoHandleAsset('data::tags', tags, asset);
			});
		};

	}
	else if( type === types.targetIsChatPlayer ){}
	else if( type === types.targetIsChatPlayerTeam ){}
	else if( type === types.targetIsRpPlayer ){
		html += '<h3>Deprecated. Use isRoleplayPlayer instead</h3>';
	}
	else if( type === types.targetIsSender ){}
	else if( type === types.targetIsTurnPlayer ){}
	else if( type === types.targetIsWrapperSender ){
		setDefaultData({
			originalWrapper : false
		});
		html += '<div class="labelFlex">';
			html += '<label>Use original wrapper: <input type="checkbox" name="data::originalWrapper" class="saveable" '+(asset.data.originalWrapper ? 'checked' : '')+'" /></label>';
		html += '</div>';
	}
	else if( type === types.targetLevel ){
		html += buildDefaultValueFields();
	}
	else if( type === types.targetedSenderLastRound ){}
	else if( type === types.team ){

		setDefaultData({
			team : []
		});

		html += '<div>'+
			'<span class="teams"></span>'+
			'<input type="button" value="Add Team" class="addTeam" />'+
		'</div>';

		fnBind = () => {
			createMultiFreetext('team', 'span.teams', 'input.addTeam');
		};

	}
	else if( type === types.textMeta || type === types.textTurnTag ){

		setDefaultData({
			tags : [],
			originalWrapper : -1,
			all : false
		});
		
		html += '<div name="tags">'+HelperTags.build(asset.data.tags)+'</div>';

		html += '<div class="labelFlex">'+
			'<label title="">Original wrapper: '+createSingleSelect('data::originalWrapper', {'Both':-1,'Yes':1,'No':0}, -1, 'smart')+'</label>'+
			'<label title="">Require ALL: <input type="checkbox" value="1" name="data::all" class="saveable" '+(asset.data.all ? 'checked' : '')+' /></label>'+
		'</div>';

		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
				HelperTags.autoHandleAsset('data::tags', tags, asset);
			});
		};

	}
	//else if( type === types.wrapperHasEffect ){} // Too complex since it's depth search.
	else if( type === types.wrapperLabel ){

		setDefaultData({
			label : [],
			originalWrapper : false,
		});
		html += 'Wrappers: <div class="wrappers"></div>';
		html += '<div class="labelFlex">';
			html += '<label>Use original wrapper: <input type="checkbox" name="data::originalWrapper" class="saveable" '+(asset.data.originalWrapper ? 'checked' : '')+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.fetish ){

		setDefaultData({
			label : [],
		});
		html += 'Fetishes: <div class="fetishes"></div>';

		fnBind = () => {
			this.dom.querySelector("div.fetishes").appendChild(EditorFetish.assetTable(this, asset, "data::label", false));
		};

	}
	else if( type === types.wrapperStacks ){

		setDefaultData({
			amount:1, 
			operation:"=", 
			originalWrapper:false, 
			label:''
		});

		html += 'Wrappers: <div class="wrappers"></div>';
		html += '<div class="labelFlex">';
			html += '<label title="">Value (Can be formula): <input type="text" name="data::amount" class="saveable" value="'+esc(asset.data.amount)+'" /></label>';
			html += '<label>'+buildMathOperators('data::operation', asset.data.operation)+'</label>';
			html += '<label>Use original wrapper: <input type="checkbox" name="data::originalWrapper" class="saveable" '+(asset.data.originalWrapper ? 'checked' : '')+'" /></label>';
		html += '</div>';

		fnBind = () => {
			this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "data::label", true));
		};

	}
	else if( type === types.wrapperTag ){

		setDefaultData({
			tags : [],
			originalWrapper : -1,
		});
		
		html += '<div name="tags">'+HelperTags.build(asset.data.tags)+'</div>';
		html += '<div class="labelFlex">'+
			'<label>Use original wrapper: <input type="checkbox" name="data::originalWrapper" class="saveable" '+(asset.data.originalWrapper ? 'checked' : '')+'" /></label>'+
		'</div>';

		fnBind = () => {
			HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
				HelperTags.autoHandleAsset('data::tags', tags, asset);
			});
		};

	}
	else if( type === types.dungeonTemplateRoomHasEncounter ){

		setDefaultData({
			label : [],
		});
		html += 'Encounters: <div class="encounters"></div>';

		fnBind = () => {
			this.dom.querySelector("div.encounters").appendChild(EditorEncounter.assetTable(this, asset, "data::label", false));
		};

	}
	

	else{
		html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea>';

		fnBind = () => {};

	}


	html += '<hr />';
	html += 'Targ override conditions: (Advanced)';
	html += '<div class="targOverride">';
		html += '<div class="targs"></div>';
	html += '</div>';
	html += 'Subconditions: (Advanced)';
	html += '<div class="subConditions">'+
		'<div class="conditions"></div>'+
		'Min: <input type="number" class="saveable" name="min" min=-1 step=1 value="'+esc(dummy.min)+'" /> '+
		'Max: <input type="number" class="saveable" name="max" min=-1 step=1 value="'+esc(dummy.max)+'" /> '+
	'</div>';

	this.setDom(html);

	fnBind();

	// Set asset tables
	this.dom.querySelector("div.subConditions div.conditions").appendChild(assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.targOverride div.targs").appendChild(assetTable(this, asset, "targs"));

	// Describe what the json editor data should look like
	this.dom.querySelector("select[name=type]").addEventListener("change", event => {
		asset.data = {};
		asset.type = event.currentTarget.value;
		this.rebuild();
		HelperAsset.rebuildAssetLists(DB);
		event.stopImmediatePropagation();
	});


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset ){
	return HelperAsset.linkedTable( win, modAsset, name, Condition, 'conditions', ['label', 'desc'], single, parented, ignoreAsset);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, "conditions", CONSTRUCTOR, {
		"*label" : true,
		"*desc" : true,
		"conditions" : a => a.conditions ? a.conditions.map(el => el.label).join(', ') : '',
		"min" : true,
		"max" : true,
		"*type" : true,
		"data" : true,
		"caster" : true,
		"targnr" : true,
		"inverse" : true,
		"anyPlayer" : true,
		"debug" : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'newCondition_'+Generic.generateUUID(),
		type : Condition.Types.tag,
		data : {tags:[]}
	}));

};


// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Conditions:</h3>'+
		'<p>Conditions are the cornerstone of the FQ system. The majority of assets interact with conditions somehow. The end goal of a condition is to validate to true or false. All conditions are validated against a GameEvent. See classes/GameEvent.js in the source code for a list.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label. If you\'re making a mod, I suggest appending a short handle to your mod to prevent overriding other mods. Ex if your mod is Spank Mod, then prepend sm_ to your label.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Optional description explaining your condition. This is only used in the editor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Type</td>'+
			'<td>Condition type.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Targ nr</td>'+
			'<td>In events with multiple targets, the condition is only checked against the nth player. -1 requires ALL event players to pass the condition. I recommend using -1 for all conditions that involve players. 0 if target isn\'t important, such as when checking action label or quest progress.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Caster</td>'+
			'<td>Check the condition against the event sender instead of target. Reverses target and caster. If multiple targets are present, the condition is checked against all target/caster pairs.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Inverse</td>'+
			'<td>Flips the outcome, returning true if the condition is false and vice versa.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Any Player</td>'+
			'<td>In events with multiple targets, the condition only has to validate against one target to return true.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Debug</td>'+
			'<td>Outputs debug info in the console. This may lead to a lot of spam, so keep it off unless you\'re working on developing the source code.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Condition specific data</td>'+
			'<td>Linkers and parameters will be added depending on the type of condition you picked. Note that changing type wipes this data.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Targ Override</td>'+
			'<td>If at least one condition is set here, the condition will run against ALL enabled game players that match Targ Override conditions. Note that you can\'t include a condition with a targ condition of its own here to prevent recursion. Can be useful if you need to check a condition against predetermined players, such as non-enemies.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Subconditions</td>'+
			'<td>If at least one condition is set here, the condition turns into a condition set. Any condition data set above is then disregarded, and it will check a package of conditions. This can be used to combine conditions such as wears a thong OR naked OR butt exposed.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min/Max</td>'+
			'<td>Used with subconditions to set the min or max amount of conditions that need to be validated for the condition set to be considered true. Use -1 for ALL.</td>'+
		'</tr>'	
		
	;
		

	out += '</table>';

	

	return out;

};

