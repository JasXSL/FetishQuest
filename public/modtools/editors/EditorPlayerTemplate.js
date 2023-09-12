import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorAssetTemplate from './EditorAssetTemplate.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorPlayerTemplateLoot from './EditorPlayerTemplateLoot.js';
import PlayerTemplate from '../../classes/templates/PlayerTemplate.js';
import stdTag from '../../libraries/stdTag.js';
import Generic from '../../classes/helpers/Generic.js';



const DB = 'playerTemplates',
	CONSTRUCTOR = PlayerTemplate;

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
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Species: <input type="text" name="species" class="saveable" value="'+esc(dummy.species)+'" /></label>';
		html += '<label>Voice: <input type="text" name="voice" class="saveable" value="'+esc(dummy.voice)+'" list="datalist_voices" /></label>';
		html += '<label>Image: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" /></label>';
		html += '<label>Image Upper Body: <input name="icon_upperBody" value="'+esc(dummy.icon_upperBody)+'" type="text" class="saveable" /></label>';
		html += '<label>Image Lower Body: <input name="icon_lowerBody" value="'+esc(dummy.icon_lowerBody)+'" type="text" class="saveable" /></label>';
		html += '<label>Image Nude: <input name="icon_nude" value="'+esc(dummy.icon_nude)+'" type="text" class="saveable" /></label>';
		html += '<label title="Allows players to turn off AI art">Art is AI generated: <input type="checkbox" name="icon_ai" '+(dummy.icon_ai ? 'checked' : '')+' class="saveable"  /></label>';
		html += '<label title="Max actions this can have, -1 = infinite">Max Actions: <input name="max_actions" value="'+esc(dummy.max_actions)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>Min Level: <input name="min_level" value="'+esc(dummy.min_level)+'" type="number" min=1 step=1 class="saveable" /></label>';
		html += '<label>Max Level: <input name="max_level" value="'+esc(dummy.max_level)+'" type="number" min=1 step=1 class="saveable" /></label>';
		html += '<label title="Max nr of these that can be added per encounter. Less than one is infinite.">Max nr: <input name="max" value="'+esc(dummy.max)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label title="Varies +-50%">Carried copper: <input name="monetary_wealth" value="'+esc(dummy.monetary_wealth)+'" type="number" min=0 step=1 class="saveable" /></label>';
		html += '<label>Gear Quality <span class="valueExact"></span><br />Common <input name="gear_quality" value="'+esc(dummy.gear_quality)+'" type="range" min=0 step=0.01 max=1 class="saveable" /> Legendary</label>';
		html += '<label>Gear Chance: <span class="valueExact"></span><input name="gear_chance" value="'+esc(dummy.gear_chance)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label title="Left = tiny, mid = human, right = giant">Min Size: <span class="valueExact"></span><input name="min_size" value="'+esc(dummy.min_size)+'" type="range" min=0 step=1 max=10 class="saveable" /></label>';
		html += '<label title="Left = tiny, mid = human, right = giant">Max Size: <span class="valueExact"></span><input name="max_size" value="'+esc(dummy.max_size)+'" type="range" min=0 step=1 max=10 class="saveable" /></label>';
		html += '<label title="How many slots this fills up in the generator, and multiplies power against this.">Slots: <input name="slots" value="'+esc(dummy.slots)+'" type="number" min=1 step=1 class="saveable" /></label>';
		html += '<label title="Multiplies against all player stats. Primarily for toning players down with dangerous abilities">Power: <input name="power" value="'+esc(dummy.power)+'" type="number" min=0.1 step=0.1 class="saveable" /></label>';
		html += '<label title="Lets you adjust monster max HP">HP Multiplier: <input name="hpMulti" value="'+esc(dummy.hpMulti)+'" type="number" min=0.1 step=0.1 class="saveable" /></label>';
		html += '<label title="Percentage armor points. Used for armored beasts to allow for armor penetration.">Armor: <input name="armor" value="'+esc(dummy.armor)+'" type="number" step=1 class="saveable" /></label>';
		html += '<label title="Prevents equipping the gear. Useful for things like mimics that carry gear but can\'t wear it.">No equip: <input type="checkbox" name="no_equip" '+(dummy.no_equip ? 'checked' : '')+' class="saveable"  /></label>';

	html += '</div>';

	// Social skill
	html += '<div class="labelFlex">';
		html += '<label>Sadistic min <span class="valueExact"></span><input name="sadistic_min" value="'+esc(dummy.sadistic_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Sadistic max <span class="valueExact"></span><input name="sadistic_max" value="'+esc(dummy.sadistic_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Dominant min <span class="valueExact"></span><input name="dominant_min" value="'+esc(dummy.dominant_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Dominant max <span class="valueExact"></span><input name="dominant_max" value="'+esc(dummy.dominant_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Hetero min <span class="valueExact"></span><input name="hetero_min" value="'+esc(dummy.hetero_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Hetero max <span class="valueExact"></span><input name="hetero_max" value="'+esc(dummy.hetero_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Intelligence min <span class="valueExact"></span><input name="intelligence_min" value="'+esc(dummy.intelligence_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Intelligence max <span class="valueExact"></span><input name="intelligence_max" value="'+esc(dummy.intelligence_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Talkative min <span class="valueExact"></span><input name="talkative_min" value="'+esc(dummy.talkative_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Talkative max <span class="valueExact"></span><input name="talkative_max" value="'+esc(dummy.talkative_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
	html += '</div>';


	html += 'Stats: <div class="labelFlex">';

	// Stats:
		for( let i in Action.Types ){
			const t = Action.Types[i];
			html += '<label>sv '+esc(i)+': <input name="'+esc('sv::'+t)+'" value="'+esc(dummy.sv[t] || 0)+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Action.Types ){
			const t = Action.Types[i];
			html += '<label>bon '+esc(i)+': <input name="'+esc('bon::'+t)+'" value="'+esc(dummy.bon[t] || 0)+'" class="saveable" type="number" step=1 /></label>';
		}

		
	html += '</div>';

// Keep
	html += 'Description: <br /><textarea class="saveable" name="description">'+esc(dummy.description, true)+'</textarea><br />';

	html += 'Tags: <div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	
	html += 'Random unequipped loot: <div class="random_loot"></div>';
	html += 'Viable Gear: <div class="viable_gear"></div>';
	html += 'Viable Asset Materials: <div class="viable_asset_materials"></div>';
	html += 'Viable Asset Templates: <div class="viable_asset_templates"></div>';
	html += 'Viable Consumables: <div class="viable_consumables"></div>';
	html += 'Required Assets: <div class="required_assets"></div>';
	html += 'Required Actions: <div class="required_actions"></div>';
	html += 'Viable Classes: <div class="classes"></div>';
	html += 'Passives: <div class="passives"></div>';
	

	this.setDom(html);

	this.dom.querySelector("div.viable_gear").appendChild(EditorAsset.assetTable(this, asset, "viable_gear"));
	this.dom.querySelector("div.viable_asset_materials").appendChild(EditorMaterialTemplate.assetTable(this, asset, "viable_asset_materials"));
	this.dom.querySelector("div.viable_asset_templates").appendChild(EditorAssetTemplate.assetTable(this, asset, "viable_asset_templates"));
	this.dom.querySelector("div.viable_consumables").appendChild(EditorAsset.assetTable(this, asset, "viable_consumables"));
	this.dom.querySelector("div.required_assets").appendChild(EditorAsset.assetTable(this, asset, "required_assets"));
	this.dom.querySelector("div.required_actions").appendChild(EditorAction.assetTable(this, asset, "required_actions"));
	this.dom.querySelector("div.classes").appendChild(EditorPlayerClass.assetTable(this, asset, "classes"));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.random_loot").appendChild(EditorPlayerTemplateLoot.assetTable(this, asset, "random_loot"));
	

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

	

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name', 'species', 'description', 'classes'], single);
}


// Listing
export function list(){


	const fields = {
		'*label' : true,
		'*name' : true,
		icon : true,
		'*species' : true,
		'*description' : true,
		classes : true,
		max_actions : true,
		tags : true,
		min_level : true,
		max_level : true,
		monetary_wealth : true,
		gear_quality : true,
		sv : true,
		bon : true,
		viable_asset_materials : true,
		viable_asset_templates : true,
		viable_gear : true,
		gear_chance : true,
		min_size : true,
		max_size : true,
		'*slots' : true,
		viable_consumables : true,
		'*power' : true,
		sadistic_min : true,
		sadistic_max : true,
		dominant_min : true,
		dominant_max : true,
		hetero_min : true,
		hetero_max : true,
		intelligence_min : true,
		intelligence_max : true,
		talkative_min : true,
		talkative_max : true,
		required_assets : true,
		required_actions : true,
		'*hpMulti' : true,
		no_equip : true,
	};

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'playerTemplate_'+Generic.generateUUID(),
		name : 'Cock Goblin',
		description : 'A chest high green goblin with a massive donger.',
		species : "goblin",
		classes : ['warrior'],
		max_actions : 3,
		tags : [stdTag.plBigPenis, stdTag.penis, stdTag.plTongue, stdTag.plEars, stdTag.plTongue],
		min_level : 1,
		max_level : 10,
		monetary_wealth : 100,
		gear_quality : 0.2,
		viable_asset_materials : ['leather'],
		viable_asset_templates : ['loincloth'],
		gear_chance : 0.6,
		min_size : 4,
		max_size : 5,
		viable_consumables : ['minorHealingPotion'],
		sadistic_min : 0.1,
		sadistic_max : 1,
		dominant_min : 0.5,
		dominant_max : 1,
		hetero_min : 0,
		hetero_max : 1,
		intelligence_min : 0.4,
		intelligence_max : 0.5,
		talkative_min : 0.3,
		talkative_max : 1,
	}));

};

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Player Template:</h3>'+
		'<p>A player template is a template for a character that gets randomly generated when you encounter them. Used in most random encounters. For boss encounters you\'ll want to use Player assets instead.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>Unique label for your template. WARNING: DO NOT CHANGE AFTER SETTING OR YOU MAY END UP WITH BROKEN LINKS.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your template, such as Imp or Succubus.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Species</td>'+
			'<td>Name of the species, such as tiger or demon.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Voice</td>'+
			'<td>Not currently used by official content, but can be used to add combat grunts with Audio Triggers.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image</td>'+
			'<td>URL to character fully dressed. If your character can\'t be stripped, such as beasts, you only need this one.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Upper Body</td>'+
			'<td>URL to character wearing only upper body armor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Lower Body</td>'+
			'<td>URL to character wearing only lower body armor.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Nude</td>'+
			'<td>URL to character naked.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Art is AI generated</td>'+
			'<td>Check if the art is AI generated.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Actions</td>'+
			'<td>Max actions this character should be able to have.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min Level</td>'+
			'<td>Min level for this character to start appearing. Note that min and max level may be disregarded if no other valid templates are present in the encounter.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max Level</td>'+
			'<td>Max level for this character appearing.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max nr</td>'+
			'<td>Can be used to limit how many of this template can be included in a single encounter. Use -1 for unlimited.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Carried copper</td>'+
			'<td>Used to randomize money held. 1 plat = 1000 copper.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Gear Quality</td>'+
			'<td>Average equipment quality, from common to legendary.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Gear chance</td>'+
			'<td>Chance to generate gear. Note that this goes per slot.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Min size</td>'+
			'<td>Min character size. 0 being something like a gnome, and 10 being a giant.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Max size</td>'+
			'<td>Max character size.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Slots</td>'+
			'<td>Recommended way of making NPCs more or less powerful. The encounter generator allocates NPC slots based on nr of players, and a higher value will fill up more of these slots and gain power in the process. A lower value will make the monster weaker and spawn more monsters instead.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Power</td>'+
			'<td>Can be used to make a monster more difficult without taking up more slots. Mainly used for fine tuning enemies with dangerous abilities. Can be left at 1 most of the time.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>HP Multiplier</td>'+
			'<td>Increases or decreases max HP without affecting slots.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Armor</td>'+
			'<td>Mainly used for beasts, granting them an armor value. Between 0 and 1 where the nr equals to damage reduction. So 0.4 (like tentacrab) takes 40% less damage. Humanoids get their armor from clothes.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>No equip</td>'+
			'<td>NPC cannot equip items. Used by mimics since they generate gear but cannot equip it.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Sadistic min/max</td>'+
			'<td>Mainly used for RP and punishments if the NPC defeats the players.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Dominant min/max</td>'+
			'<td>Mainly used for RP and punishments if the NPC defeats the players.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hetero min/max</td>'+
			'<td>Plays a small role in which targets a humanoid prefers.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Intelligence</td>'+
			'<td>Currently only used for RP. In the future it may be tied to NPC AI complexity. 0 = worm, 1 = hive mind. Average human intelligence ranges between 0.4 and 0.6.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Talkative min/max</td>'+
			'<td>Chance of the NPC talking during combat (provided it has valid text lines).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stats</td>'+
			'<td>Allows you to set some baseline avoidances (sv) and proficiences (bon). Keep in mind that classes are also able to tune these. Can be negative.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe the NPC</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Tag your character. Use pl_beast for beasts, and pl_target_beast for things like skeletons that should attack like humanoids but be attacked like beasts.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Random unequipped loot</td>'+
			'<td>Items the NPC can carry, but will never equip.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Viable gear</td>'+
			'<td>Handheld items the NPC may equip.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Viable asset materials</td>'+
			'<td>Materials the character\'s assets can be.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Viable asset templates</td>'+
			'<td>Asset templates the character can generate and equip.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Viable consumables</td>'+
			'<td>Consumable items the NPC can have and equip.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Required Assets</td>'+
			'<td>Assets the character must have on them.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Required Actions</td>'+
			'<td>Normally, actinos are dictated in the Player Action table. But this allows you to give the NPC action that it MUST always have.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Viable Classes</td>'+
			'<td>Classes this NPC can be.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Passive wrappers this character must always have.</td>'+
		'</tr>'
		
		
	;
		

	out += '</table>';

	

	return out;

};


