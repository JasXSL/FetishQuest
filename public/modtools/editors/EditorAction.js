import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorWrapper from './EditorWrapper.js';
import Action from '../../classes/Action.js';
import Generic from '../../classes/helpers/Generic.js';


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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input name="name" value="'+esc(dummy.name)+'" type="text" class="saveable" /></label>';
		html += '<label>Icon: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" /></label>';
		html += '<label>M.Off: <input name="mom0" value="'+esc(dummy.mom0)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>M.Def: <input name="mom1" value="'+esc(dummy.mom1)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>M.Uti: <input name="mom2" value="'+esc(dummy.mom2)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="Can also be a formula">Cooldown: <input name="cooldown" value="'+esc(dummy.cooldown === null ? 1 : dummy.cooldown)+'" type="text" class="saveable" /></label>';
		html += '<label title="Cooldown to be set when battle starts">Init Cooldown: <input name="init_cooldown" value="'+esc(dummy.init_cooldown)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Hit Chance: <input name="hit_chance" value="'+esc(dummy.hit_chance)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="Allows this to be cast while a disable is in effect">Override disable lv: <input name="disable_override" value="'+esc(dummy.disable_override)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Cast time: <input name="cast_time" value="'+esc(dummy.cast_time)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label>Allow while charging: <input name="allow_when_charging" '+(dummy.allow_when_charging ? 'checked' : '')+' class="saveable" type="checkbox" /></label>';
		html += '<label title="If checked, taunts can override the charge target">Taunt override charge: <input name="ct_taunt" '+(dummy.ct_taunt ? 'checked' : '')+' class="saveable" type="checkbox" /></label>';
		html += '<label title="Allows this action to be riposted. Uses wrappers if the riposte table is empty">Ripostable: <input name="ripostable" '+(dummy.ripostable ? 'checked' : '')+' class="saveable" type="checkbox" /></label>';
		html += '<label title="Lets you group multiple actions together. Mostly used for standard. Max 5">Group: <input name="group" value="'+esc(dummy.group)+'" type="text" class="saveable" /></label>';
		
		html += '<label>Charges: <input name="charges" value="'+esc(dummy.charges)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="-1 = full">Start Charges: <input name="charges_start" value="'+esc(dummy.charges_start)+'" type="number" step=1 class="saveable" /></label>';
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
		html += '<label title="Makes nr of charges finite">Permanent Charges: <input name="charges_perm" '+(dummy.charges_perm ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Reset cooldown if interrupted">Reset Interrupt: <input name="reset_interrupt" '+(dummy.reset_interrupt ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Punishments use this">Hide if no viable targets: <input name="hide_if_no_targets" '+(dummy.hide_if_no_targets ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Lets you still use the ability if no targets pass wrapper filters">Cast if no viable wrapper: <input name="ignore_wrapper_conds" '+(dummy.ignore_wrapper_conds ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Allows this ability to critically hit">Can crit: <input name="can_crit" '+(dummy.can_crit ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Hides this ability from clairvoyance">No clairvoyance: <input name="no_clairvoyance" '+(dummy.no_clairvoyance ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		
		html += '<label title="Max wrappers to apply, wrappers applied from top to bottom, 0 = no limit">Max wrappers: <input name="max_wrappers" value="'+esc(dummy.max_wrappers)+'" type="number" step=1 min=0 class="saveable" /></label>';

	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description)+'</textarea><br />';

	html += 'Wrappers: <br /><div class="wrappers"></div>';
	html += 'Riposte Wrappers: <br /><div class="riposte"></div>';
	html += '<span title="Note: Does not work on actions added by wrappers for recursion reasons">Passives:</span> <br /><div class="passives"></div>';
	html += '<span title="Triggered with sender being the player who interrupted, target being the player with this action">Interrupt wrappers:</span> <br /><div class="interrupt_wrappers"></div>';
	html += '<span title="Passives added while the spell is being cast (multi-turn cast)">Cast passives:</span> <br /><div class="cpassives"></div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += '<span title="Aliases to use for texts. Useful when you want multiple actions with the same texts">Aliases: </span><br /><div name="alias">'+HelperTags.build(dummy.alias, "actions")+'</div>';

	html += '<div class="critFormula">Alternate crit formula: <br /><textarea name="crit_formula" class="saveable">'+
		esc(dummy.crit_formula)+
	'</textarea></div>';


	html += 'Conditions: <br /><div class="conditions"></div>';
	html += '<span title="Conditions needed to be met for this to show in the ability bar">Show Conditions: </span><br /><div class="show_conditions"></div>';
	html += '<div class="stdConditions '+(dummy.std ? '' : 'hidden')+'"><span title="Conditions to add this to a player">STD Conditions: </span><br /><div class="std_conds"></div></div>';
	
	
	this.setDom(html);

	const critInput = this.dom.querySelector('input[name=can_crit]');
	const refreshCritFormula = () => this.dom.querySelector('div.critFormula').classList.toggle('hidden', !critInput.checked);
	refreshCritFormula();
	critInput.addEventListener('change', refreshCritFormula);

	// Bind stuff

	// wrappers
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers"));
	this.dom.querySelector("div.riposte").appendChild(EditorWrapper.assetTable(this, asset, "riposte"));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.interrupt_wrappers").appendChild(EditorWrapper.assetTable(this, asset, "interrupt_wrappers"));
	this.dom.querySelector("div.cpassives").appendChild(EditorWrapper.assetTable(this, asset, "cpassives"));
	

	// conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.show_conditions").appendChild(EditorCondition.assetTable(this, asset, "show_conditions"));
	this.dom.querySelector("div.std_conds").appendChild(EditorCondition.assetTable(this, asset, "std_conds"));
	
	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});
	HelperTags.bind(this.dom.querySelector("div[name=alias]"), tags => {
		HelperTags.autoHandleAsset('alias', tags, asset);
	});

	const stdCheck = this.dom.querySelector('input[name=std]');
	stdCheck.addEventListener('change', () => {
		this.dom.querySelector("div.stdConditions").classList.toggle('hidden', !stdCheck.checked);
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
		['*label'] : true,
		['*name'] : true,
		['*description'] : true,
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
		['*alias'] : true,
		tags : true,
		conditions : true,
		show_conditions : true,		
		can_crit : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'action_'+Generic.generateUUID(),
		cooldown : 1,
		show_conditions : ['inCombat']
	}));

};

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Actions:</h3>'+
		'<p>Spells and attacks are all actions. To link an action to a player or NPC template, use the Player Action asset type.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label. If you\'re making a mod, I suggest appending a short handle to your mod to prevent overriding other mods. Ex if your mod is Spank Mod, then prepend sm_ to your label.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Icon</td>'+
			'<td>An icon, supports icon names from game-icons.net or a URL</td>'+
		'</tr>'+
		'<tr>'+
			'<td>M.Off/Def/Uti</td>'+
			'<td>Offensive, defensive, and utility momentum cost.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Cooldown</td>'+
			'<td>Action cooldown.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Init Cooldown</td>'+
			'<td>Adds this cooldown to the ability on battle start. Usually used for bosses that need to let the players have at least 1 turn to charge before using something special.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hit chance</td>'+
			'<td>Base hit chance in whole percent.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Override disable lv</td>'+
			'<td>When using the disable spells effect, this action will override up to this level. Mainly used for boss fights or things like bondage devices.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Cast Time</td>'+
			'<td>Adds a charge time to this ability, in caster turns. Remember to add an actionCharged text for it.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allow while charging</td>'+
			'<td>Lets you use this action while already casting another.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Taunt override charge</td>'+
			'<td>If the action is charged, taunt allows you to override the original target.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ripostable</td>'+
			'<td>Action can be riposted on miss.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Group</td>'+
			'<td>Groups the action on the action bar. Legacy feature for standard attacks.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Charges</td>'+
			'<td>Lets you have multiple charges of the ability.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Start Charges</td>'+
			'<td>Lets you set how many charges to start a battle with. -1 = same as charges field.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min Targets</td>'+
			'<td>Minimum targets for this action (only if target is set to target).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Targets</td>'+
			'<td>Max amount of targets (only if target is set to target).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Target</td>'+
			'<td>Target of the action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Detrimental</td>'+
			'<td>Whether it\'s detrimental or beneficial.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Allow Detrimental Self Cast</td>'+
			'<td>By default, you can\'t use detrimental actions on yourself. This overrides that.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Type</td>'+
			'<td>Action damage/healing stat.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Range</td>'+
			'<td>Range of the ability. None is used for self cast.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Standard</td>'+
			'<td>When checked, ALL players start with this action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hidden</td>'+
			'<td>Hides the action. AFAIK it\'s only used for end turn, since its button is handled differently.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Semi Hidden</td>'+
			'<td>Hides the action from the ability selector and clairvoyance. Punishments use this.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hide from action selector</td>'+
			'<td>Special case. Currently only used by Repair since repair item actions are used from inventory instead of the action bar.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Do not generate text</td>'+
			'<td>Doesn\'t try to output a text when used.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>No Interrupt</td>'+
			'<td>Immune to the interrupt effect (stun can still interrupt).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Permanent Charges</td>'+
			'<td>Cooldown never starts. The charges you start with are the ones you get unless added to via an effect.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Reset Interrupt</td>'+
			'<td>Normally if you get interrupted while casting, the action still goes on cooldown. If checked, you may use the action again immediately.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hide if no viable targets</td>'+
			'<td>Hide the action from the action bar if there are no viable targets. Punishments use this.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Cast if no viable wrapper</td>'+
			'<td>If no wrappers pass conditions against any players, allow it to be used anyway.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Can Crit</td>'+
			'<td>Allows the action to critically hit.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>No clairvoyance</td>'+
			'<td>Action is not shown when using clairvoyance on the owner.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Wrappers</td>'+
			'<td>When using multiple wrappers, this lets you set a max nr of wrappers to apply. 0 = no maximum</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe your action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Wrappers</td>'+
			'<td>Wrappers to apply to any viable targets (wrapper conditions are checked before applying).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Riposte Wrappers</td>'+
			'<td>Wrappers to apply to the caster when riposted. Requires Ripostable checked.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Grants the owner these passives while the action is slotted.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Interrupt Wrappers</td>'+
			'<td>Wrappers to apply to the caster if the action is interrupted. Requires a positive Cast Time.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Cast Passives</td>'+
			'<td>Passives to apply to the owner while casting the action. Requires a positive Cast Time.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Action tags, starting with "ac_" See below for tag definitions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Aliases</td>'+
			'<td>Lets you set one or many aliases to use the same texts as another action. Ex if you set an alias stdAttack, then you use the same texts as the Attack action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Alternate crit formula</td>'+
			'<td>Requires Can Crit checked. Lets you write a custom crit formula. Chance is on a scale from 0-1 where 1 = 100%.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Conditions to use the action.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Show Conditions</td>'+
			'<td>Conditions for the action to show in the action bar.</td>'+
		'</tr>'
	;
	out += '</table>';

	out += '<h3>ac_tags</h3>';
	out += '<p>Here is a list of ac_ tags you should put on your actions for NPCs to use it correctly. You can use the other ones not mentioned here, but they currently don\'t have any effect.</p>';
	out += '<table>'
		'<tr>'+
			'<td>ac_buff</td>'+
			'<td>Action is a buff.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_debuff</td>'+
			'<td>Action is a debuff.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_heal</td>'+
			'<td>Action heals.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_npc_important</td>'+
			'<td>When set, NPCs will always prioritize using this action when they can.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_npc_first</td>'+
			'<td>Cast this first if possible. If ac_npc_important is set, it casts first of all important actions. Otherwise it uses any important actions and then this.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_npc_important_last</td>'+
			'<td>Only works consistently for free actions. If no other actions can be cast, then this will be used.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_npc_no_attack</td>'+
			'<td>Mislabeled, actually a pl_ tag. Do not use.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_interrupt</td>'+
			'<td>Action has an interrupt effect, such as Pummel.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_item</td>'+
			'<td>Use when the action is linked to an item such as a healing potion.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_mana_heal</td>'+
			'<td>Action restores momentum. Mainly used on mana potions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_self_heal</td>'+
			'<td>Whether it\'s a self heal.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_taunt</td>'+
			'<td>Action is a taunt.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_mana_damage</td>'+
			'<td>Action damages momentum.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>ac_npc_ignore_aggro</td>'+
			'<td>NPCs will use this on random targets, ignoring aggro from tanks etc.</td>'+
		'</tr>'+		
	'</table>';
	

	return out;

};
