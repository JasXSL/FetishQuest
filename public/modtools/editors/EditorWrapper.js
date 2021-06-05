import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { Wrapper } from '../../classes/EffectSys.js';
import Generic from '../../classes/helpers/Generic.js';

import * as EditorEffect from './EditorEffect.js';
import * as EditorCondition from './EditorCondition.js';

const DB = 'wrappers',
	CONSTRUCTOR = Wrapper;

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
		html += '<label>Editor Description: <input type="text" name="editor_desc" class="saveable" value="'+esc(dummy.editor_desc)+'" /></label>';
		html += '<label title="Duration effects only">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="Name of an icon from game-icons.net">Icon: <input type="text" name="icon" class="saveable" value="'+esc(dummy.icon)+'" /></label>';
		html += '<label>Target: <select name="target" class="saveable">';
		for( let i in Wrapper.Targets )
			html += '<option value="'+esc(Wrapper.Targets[i])+'" '+(Wrapper.Targets[i] === dummy.target ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label>Duration: <input type="number" name="duration" class="saveable" value="'+esc(dummy.duration)+'" /></label>';
		html += '<label>Stacks: <input type="number" name="stacks" class="saveable" value="'+esc(dummy.stacks)+'" /></label>';
		html += '<label>Max Stacks: <input type="number" name="max_stacks" class="saveable" value="'+esc(dummy.max_stacks)+'" /></label>';

		html += '<label>Detrimental <input type="checkbox" class="saveable" name="detrimental" '+(dummy.detrimental ? 'checked' : '')+' /></label><br />';
		html += '<label>Trigger Immediate <input type="checkbox" class="saveable" name="trigger_immediate" '+(dummy.trigger_immediate ? 'checked' : '')+' /></label><br />';
		html += '<label>Tick on turn start <input type="checkbox" class="saveable" name="tick_on_turn_start" '+(dummy.tick_on_turn_start ? 'checked' : '')+' /></label><br />';
		html += '<label>Tick on turn end <input type="checkbox" class="saveable" name="tick_on_turn_end" '+(dummy.tick_on_turn_end ? 'checked' : '')+' /></label><br />';

		html += '<label title="If using game timer, the effect persists outside combat, and time becomes time as in game seconds">Use game timer <input type="checkbox" class="saveable" name="ext" '+(dummy.ext ? 'checked' : '')+' /></label><br />';

	html += '</div>';

	html += '<textarea class="saveable" name="description">'+esc(dummy.description)+'</textarea>';

	// Tags
	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	// Effects
	html += '<span>Effects: </span><br />';
	html += '<div class="effects"></div>';

	// Conditions
	html += '<span title="Conditions needed to be met when adding the wrapper">Add conditions: </span><br />';
	html += '<div class="add_conditions"></div>';
	html += '<span title="Conditions needed to be met for the wrapper to persist">Stay conditions: </span><br />';
	html += '<div class="stay_conditions"></div>';



	this.setDom(html);

	// Conditions
	this.dom.querySelector("div.add_conditions").appendChild(EditorCondition.assetTable(this, asset, "add_conditions"));
	this.dom.querySelector("div.stay_conditions").appendChild(EditorCondition.assetTable(this, asset, "stay_conditions"));

	// Effects
	this.dom.querySelector("div.effects").appendChild(EditorEffect.assetTable(this, asset, "effects"));


	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'editor_desc', 'effects'], single, parented);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*editor_desc' : true,
		'*target' : true,
		'*name' : true,
		'*description' : true,
		duration : true,
		stacks : true,
		'*detrimental' : true,
		trigger_immediate : true,
		max_stacks : true,
		icon : true,
		tick_on_turn_start : true,
		tick_on_turn_end : true,
		tags : true,
		effects : true,
		add_conditions : a => !a.add_conditions ? '' : a.add_conditions.map(el => el.label).join(', '),
		stay_conditions : a => !a.stay_conditions ?  '' : a.stay_conditions.map(el => el.label).join(', '),
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'wrapper_'+Generic.generateUUID(),
		editor_desc : 'Interrupts auto target',
		detrimental : true,
		effects : ['interrupt'],
		add_conditions : ['targetNotDead'],
		stay_conditions : ['targetNotDead'],
	}));

};

