import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { Wrapper } from '../../classes/EffectSys.js';
import Generic from '../../classes/helpers/Generic.js';

import * as EditorEffect from './EditorEffect.js';
import * as EditorCondition from './EditorCondition.js';
import Asset from '../../classes/Asset.js';

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Editor Description: <input type="text" name="editor_desc" class="saveable" value="'+esc(dummy.editor_desc)+'" /></label>';
		html += '<label title="Duration effects only">Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="Name of an icon from game-icons.net">Icon: <input type="text" name="icon" class="saveable" value="'+esc(dummy.icon)+'" /></label>';
		html += '<label>Target: <select name="target" class="saveable">';
		for( let i in Wrapper.Targets )
			html += '<option value="'+esc(Wrapper.Targets[i])+'" '+(Wrapper.Targets[i] === dummy.target ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label>Duration: <input type="number" name="duration" class="saveable" value="'+esc(dummy.duration)+'" /></label>';
		html += '<label title="can be a formula">Stacks: <input type="text" name="stacks" class="saveable" value="'+esc(dummy.stacks)+'" /></label>';
		html += '<label>Max Stacks: <input type="number" name="max_stacks" class="saveable" value="'+esc(dummy.max_stacks)+'" /></label>';
		html += '<label title="Only used for armor enchants, sets the color of the enchant. Enchants added through Armor Enchant assets have this auto assigned.">';
		html += 'Rarity: <select name="rarity" class="saveable">';
			html += '<option value="-1">Curse</option>';
		for( let cat in Asset.Rarity )
			html += '<option value="'+esc(Asset.Rarity[cat])+'" '+(dummy.rarity === Asset.Rarity[cat] ? 'selected' :'')+'>'+esc(cat)+'</option>';
		html += '</select><br />';
		html += '</label>';

		html += '<label title="Only one of these effects can be active. Existing ones from any sender will be removed and stacks taken from it upon application.">'+
			'Unique <input type="checkbox" class="saveable" name="unique" '+(dummy.unique ? 'checked' : '')+' />'+
		'</label><br />';
		html += '<label>Detrimental <input type="checkbox" class="saveable" name="detrimental" '+(dummy.detrimental ? 'checked' : '')+' /></label><br />';
		html += '<label>Hidden <input type="checkbox" class="saveable" name="hidden" '+(dummy.hidden ? 'checked' : '')+' /></label><br />';
		html += '<label>Trigger Immediate <input type="checkbox" class="saveable" name="trigger_immediate" '+(dummy.trigger_immediate ? 'checked' : '')+' /></label><br />';
		html += '<label>Tick on turn start <input type="checkbox" class="saveable" name="tick_on_turn_start" '+(dummy.tick_on_turn_start ? 'checked' : '')+' /></label><br />';
		html += '<label>Tick on turn end <input type="checkbox" class="saveable" name="tick_on_turn_end" '+(dummy.tick_on_turn_end ? 'checked' : '')+' /></label><br />';
		html += '<label title="Added to all players as passive when placed in world, if conditions match">Global <input type="checkbox" class="saveable" name="global" '+(dummy.global ? 'checked' : '')+' /></label><br />';

		html += '<label title="If using game timer, the effect persists outside combat, and time becomes time as in game seconds">Use game timer <input type="checkbox" class="saveable" name="ext" '+(dummy.ext ? 'checked' : '')+' /></label><br />';

	html += '</div>';

	html += '<textarea class="saveable" name="description">'+esc(dummy.description, true)+'</textarea>';

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



export function help(){

	let out = '';
	out += '<h3>Wrapper:</h3>'+
		'<p>A wrapper is a collection of effects to run immediately, ticking, on events, or passively. Basically it\'s an instant effect or a buff/debuff.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Editor Description</td>'+
			'<td>This is only visible in the mod, a short description of the effect that you can use in search.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the wrapper. Only required if you want the ability to show a buff icon on the victim.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Icon</td>'+
			'<td>Icon of the wrapper. Only required if you want the ability to show a buff icon on the victim. Can use a name from game-icons.net</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Target</td>'+
			'<td>Target to apply it to. Most of the time you can use auto. But in actions that should hit a target but also the caster, caster is commonly used.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Duration</td>'+
			'<td>Duration of the wrapper in rounds (from turn star to turn start). Use -1 for "until the battle ends".</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stacks</td>'+
			'<td>Stacks to apply. Many effect values multiply by wrapper stacks.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max stacks</td>'+
			'<td>Max stacks of this wrapper the target can have from each caster.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Rarity</td>'+
			'<td>Used only when building enchants. Decides the color of the toltip text when inspecting armor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Unique</td>'+
			'<td>By default you can have one wrapper by label per caster. This removes the "per caster" clause.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Detrimental</td>'+
			'<td>Mark if this is a detrimental (negative) wrapper for the target.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hidden</td>'+
			'<td>Hides it from the player box. I\'m not sure why this is needed since you can leave name/icon blank to accomplish the same.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Trigger Immediate</td>'+
			'<td>If the duration is 0, it will always trigger immediate. But duration effects such as DoTs will only trigger on turn start/end. This will cause the effects to trigger immediately when the wrapper is applied, in addition to on tick.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tick on turn start</td>'+
			'<td>Triggers the non passive effects on victim turn start</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tick on turn end</td>'+
			'<td>Triggers the non passive effects on victim turn end</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Global</td>'+
			'<td>When a player is added to the world, they will be affected by this wrapper immediately if they pass conditions. Useful if you want to create custom rules for the whole game.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Use game timer</td>'+
			'<td>Normally, duration is measured in rounds. If this is checked, the wrapper will persist based on the in game clock (any action passes the world time in FQ). The duration then becomes in whole in game seconds. This also allows the wrapper to persist beyond battle end.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe the wrapper</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Adds tags to the victim while the wrapper is on them.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Effects</td>'+
			'<td>Effects tied to the wrapper. These are what actually do things to the player.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Add conditions</td>'+
			'<td>Conditions that have to be met for the wrapper to be applied to the victim.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stay conditions</td>'+
			'<td>Conditions that have to be met for the wrapper to stay on the victim.</td>'+
		'</tr>'
		

	;
		

	out += '</table>';
	return out;

};
