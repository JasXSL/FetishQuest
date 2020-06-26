import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAudioKit from './EditorAudioKit.js';
import stdTag from '../../libraries/stdTag.js';
import Action from '../../classes/Action.js';
import { TorusBufferGeometry } from '../../ext/THREE.js';


const DB = 'actions',
	CONSTRUCTOR = Action;

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
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input name="name" value="'+esc(dummy.name)+'" type="text" class="saveable" /></label>';
		html += '<label>Icon: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" /></label>';
		html += '<label>AP: <input name="ap" value="'+esc(dummy.ap)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="If AP cost is reduced by spells, this can set a min limit">AP min: <input name="min_ap" value="'+esc(dummy.min_ap)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>MP: <input name="mp" value="'+esc(dummy.mp)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="Can also be a formula">Cooldown: <input name="cooldown" value="'+esc(dummy.cooldown === null ? 1 : dummy.cooldown)+'" type="text" class="saveable" /></label>';
		html += '<label title="Cooldown to be set when battle starts">Init Cooldown: <input name="init_cooldown" value="'+esc(dummy.init_cooldown)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Hit Chance: <input name="hit_chance" value="'+esc(dummy.hit_chance)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="Allows this to be cast while a disable is in effect">Override disable lv: <input name="disable_override" value="'+esc(dummy.disable_override)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Cast time: <input name="cast_time" value="'+esc(dummy.cast_time)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Allow while charging: <input name="allow_when_charging" '+(dummy.allow_when_charging ? 'checked' : '')+' class="saveable" type="checkbox" /></label>';
		html += '<label>Charges: <input name="charges" value="'+esc(dummy.charges)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Min targets: <input name="min_targets" value="'+esc(dummy.min_targets)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Max targets: <input name="max_targets" value="'+esc(dummy.max_targets)+'" type="number" step=1 class="saveable" /></label>';

		html += '<label>Target: <select name="target_type" class="saveable">';
		for( let i in Action.TargetTypes )
			html += '<option value="'+esc(Action.TargetTypes[i])+'" '+(dummy.target_type === Action.TargetTypes[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label>Detrimental: <select name="detrimental" class="saveable">';
		for( let i in Action.Detrimental )
			html += '<option value="'+esc(Action.Detrimental[i])+'" '+(dummy.detrimental === Action.Detrimental[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		html += '<label>Allow detrimental self cast: <input name="allow_self" '+(dummy.allow_self ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';

		html += '<label>Type: <select name="type" class="saveable">';
		for( let i in Action.Types )
			html += '<option value="'+esc(Action.Types[i])+'" '+(dummy.type === Action.Types[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label>Range: <select name="ranged" class="saveable">';
		for( let i in Action.Range )
			html += '<option value="'+esc(Action.Range[i])+'" '+(dummy.ranged === Action.Range[i] ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';

		html += '<label title="Standard actions are applied to ALL players. Like attack/end turn.">'+
			'Standard: <input name="std" class="saveable" type="checkbox" '+(dummy.std ? 'checked' : '')+' />'+
		'</label>';
		html += '<label title="Do not show at all. End turn uses this.">Hidden: <input name="hidden" '+(dummy.hidden ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Do not show in ability inspect (punishments use this).">Semi hidden: <input name="semi_hidden" '+(dummy.semi_hidden ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Repair uses this.">Hide from action selector: <input name="no_action_selector" '+(dummy.no_action_selector ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label>Do not generate text: <input name="no_use_text" '+(dummy.no_use_text ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label>No Interrupt: <input name="no_interrupt" '+(dummy.no_interrupt ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Reset cooldown if interrupted">Reset Interrupt: <input name="reset_interrupt" '+(dummy.reset_interrupt ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Punishments use this">Hide if no viable targets: <input name="hide_if_no_targets" '+(dummy.hide_if_no_targets ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		

	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description)+'</textarea><br />';

	html += 'Wrappers: <br /><div class="wrappers"></div>';
	html += 'Riposte Wrappers: <br /><div class="riposte"></div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Aliases to use for texts. Useful when you want multiple actions with the same texts">Aliases: </span><br /><div name="alias">'+HelperTags.build(dummy.alias, "actions")+'</div>';

	html += 'Conditions: <br /><div class="conditions"></div>';
	html += '<span title="Conditions needed to be met for this to show in the ability bar">Show Conditions: </span><br /><div class="show_conditions"></div>';


	this.setDom(html);


	// Bind stuff

	// wrappers
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers"));
	this.dom.querySelector("div.riposte").appendChild(EditorWrapper.assetTable(this, asset, "riposte"));
	

	// conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.show_conditions").appendChild(EditorCondition.assetTable(this, asset, "show_conditions"));
	
	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});
	HelperTags.bind(this.dom.querySelector("div[name=alias]"), tags => {
		HelperTags.autoHandleAsset('alias', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented, ignoreAsset ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name', 'description'], single, parented, ignoreAsset);
}



// Listing
export function list(){



	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		description : true,
		std : true,
		icon : true,
		ranged : true,
		wrappers : true,
		riposte : true,
		ap : true,
		min_ap : true,
		mp : true,
		cooldown : true,
		init_cooldown : true,
		min_targets : true,
		max_targets : true,
		target_type : true,
		hit_chance : true,
		detrimental : true,
		type : true,
		hidden : true,
		semi_hidden : true,
		allow_self : true,
		no_use_text : true,
		no_action_selector : true,
		cast_time : true,
		charges : true,
		allow_when_charging : true,
		no_interrupt : true,
		reset_interrupt : true,
		hide_if_no_targets : true,
		disable_override : true,
		alias : true,
		tags : true,
		conditions : true,
		show_conditions : true,		
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'action'+Math.ceil(Math.random()*0xFFFFFFF),
		cooldown : 1
	}));

};

