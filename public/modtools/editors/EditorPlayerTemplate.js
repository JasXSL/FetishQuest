import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorAssetTemplate from './EditorAssetTemplate.js';
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
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Species: <input type="text" name="species" class="saveable" value="'+esc(dummy.species)+'" /></label>';
		html += '<label>Image: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" /></label>';
		html += '<label title="Max actions this can have, -1 = infinite">Max Actions: <input name="max_actions" value="'+esc(dummy.max_actions)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>Min Level: <input name="min_level" value="'+esc(dummy.min_level)+'" type="number" min=1 step=1 class="saveable" /></label>';
		html += '<label>Max Level: <input name="max_level" value="'+esc(dummy.max_level)+'" type="number" min=1 step=1 class="saveable" /></label>';
		html += '<label title="Varies +-50%">Carried copper: <input name="monetary_wealth" value="'+esc(dummy.monetary_wealth)+'" type="number" min=0 step=1 class="saveable" /></label>';
		html += '<label>Gear Quality - Common <input name="gear_quality" value="'+esc(dummy.gear_quality)+'" type="range" min=0 step=0.01 max=1 class="saveable" /> Legendary</label>';
		html += '<label>Gear Chance: <input name="gear_chance" value="'+esc(dummy.gear_chance)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label title="Left = tiny, mid = human, right = giant">Min Size: <input name="min_size" value="'+esc(dummy.min_size)+'" type="range" min=0 step=1 max=5 class="saveable" /></label>';
		html += '<label title="Left = tiny, mid = human, right = giant">Max Size: <input name="max_size" value="'+esc(dummy.max_size)+'" type="range" min=0 step=1 max=5 class="saveable" /></label>';
		html += '<label title="1 = average, 2 = about the same as 2 monsters">Difficulty: <input name="difficulty" value="'+esc(dummy.difficulty)+'" type="number" min=0.1 step=0.1 class="saveable" /></label>';
		html += '<label title="Multiplies against all stats">Power: <input name="power" value="'+esc(dummy.power)+'" type="number" min=0.1 step=0.1 class="saveable" /></label>';
		html += '<label title="Prevents equipping the gear. Useful for things like mimics that carry gear but can\'t wear it.">No equip: <input type="checkbox" name="no_equip" '+(dummy.no_equip ? 'checked' : '')+' class="saveable"  /></label>';

	html += '</div>';

	// Social skill
	html += '<div class="labelFlex">';
		html += '<label>Sadistic min <input name="sadistic_min" value="'+esc(dummy.sadistic_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Sadistic max <input name="sadistic_max" value="'+esc(dummy.sadistic_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Dominant min <input name="dominant_min" value="'+esc(dummy.dominant_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Dominant max <input name="dominant_max" value="'+esc(dummy.dominant_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Hetero min <input name="hetero_min" value="'+esc(dummy.hetero_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Hetero max <input name="hetero_max" value="'+esc(dummy.hetero_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Intelligence min <input name="intelligence_min" value="'+esc(dummy.intelligence_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Intelligence max <input name="intelligence_max" value="'+esc(dummy.intelligence_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Talkative min <input name="talkative_min" value="'+esc(dummy.talkative_min)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
		html += '<label>Talkative max <input name="talkative_max" value="'+esc(dummy.talkative_max)+'" type="range" min=0 step=0.01 max=1 class="saveable" /></label>';
	html += '</div>';


	html += 'Stats: <div class="labelFlex">';

	// Stats:
		for( let i in Action.Types ){
			const t = Action.Types[i];
			html += '<label>'+esc(i)+': <input name="'+esc('sv::'+t)+'" value="'+esc(dummy.sv[t] || 0)+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Action.Types ){
			const t = Action.Types[i];
			html += '<label>'+esc(i)+': <input name="'+esc('bon::'+t)+'" value="'+esc(dummy.bon[t] || 0)+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Player.primaryStats ){
			const t = Player.primaryStats[i];
			html += '<label>'+esc(i)+': <input name="'+esc('primary_stats::'+t)+'" value="'+esc(dummy.primary_stats[t] || 0)+'" class="saveable" type="number" step=1 /></label>';
		}
		
	html += '</div>';

// Keep
	html += 'Description: <br /><textarea class="saveable" name="description">'+esc(dummy.description)+'</textarea><br />';

	html += 'Tags: <div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += 'Viable Gear: <div class="viable_gear"></div>';
	html += 'Viable Asset Materials: <div class="viable_asset_materials"></div>';
	html += 'Viable Asset Templates: <div class="viable_asset_templates"></div>';
	html += 'Viable Consumables: <div class="viable_consumables"></div>';
	html += 'Required Assets: <div class="required_assets"></div>';
	html += 'Required Actions: <div class="required_actions"></div>';
	html += 'Viable Classes: <div class="classes"></div>';
	

	this.setDom(html);


	this.dom.querySelector("div.viable_gear").appendChild(EditorAsset.assetTable(this, asset, "viable_gear"));
	this.dom.querySelector("div.viable_asset_materials").appendChild(EditorMaterialTemplate.assetTable(this, asset, "viable_asset_materials"));
	this.dom.querySelector("div.viable_asset_templates").appendChild(EditorAssetTemplate.assetTable(this, asset, "viable_asset_templates"));
	this.dom.querySelector("div.viable_consumables").appendChild(EditorAsset.assetTable(this, asset, "viable_consumables"));
	this.dom.querySelector("div.required_assets").appendChild(EditorAsset.assetTable(this, asset, "required_assets"));
	this.dom.querySelector("div.required_actions").appendChild(EditorAction.assetTable(this, asset, "required_actions"));
	this.dom.querySelector("div.classes").appendChild(EditorPlayerClass.assetTable(this, asset, "required_actions"));
	

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
		primary_stats : true,
		sv : true,
		bon : true,
		viable_asset_materials : true,
		viable_asset_templates : true,
		viable_gear : true,
		gear_chance : true,
		min_size : true,
		max_size : true,
		'*difficulty' : true,
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

