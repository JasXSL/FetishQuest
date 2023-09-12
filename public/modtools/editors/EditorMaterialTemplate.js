import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { MaterialTemplate } from '../../classes/templates/AssetTemplate.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';


const DB = 'materialTemplates',
	CONSTRUCTOR = MaterialTemplate;
	import Generic from '../../classes/helpers/Generic.js';

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	// Make sure asset has a thingy
	for( let i in dummy ){

		if( !asset.hasOwnProperty(i) ){

			if( Array.isArray(dummy[i]) )
				asset[i] = [];
			else if( typeof dummy[i] === "object" )
				asset[i] = {};
			else
				asset[i] = dummy[i];

		}

	}

	delete asset.primaryStats;	// Remove legacy

	if( !asset )
		return this.close();

	let html = '';
	html += '<div class="labelFlex">';
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input name="name" value="'+esc(dummy.name)+'" type="text" class="saveable" /></label>';
		html += '<label>Base color name: <input name="color_tag_base" value="'+esc(dummy.color_tag_base)+'" type="text" class="saveable" /></label>';
		html += '<label>Base color: <input name="color_base" value="'+esc(dummy.color_base)+'" type="color" class="saveable" /></label>';
		html += '<label>Tintable: <input name="colorable" '+(dummy.colorable ? 'checked' : '')+' type="checkbox" class="saveable" /></label>';
		html += '<label title="Average weight of a shirt of this material, in grams">Weight: <input name="weight" value="'+esc(dummy.weight)+'" type="number" min=0 step=1 class="saveable" /></label>';
		html += '<label title="Min level">Level: <input name="level" value="'+esc(dummy.level)+'" type="number" min=0 step=1 class="saveable" /></label>';
		html += '<label>Durability Bonus Multiplier: <input name="durability_bonus" value="'+esc(dummy.durability_bonus)+'" type="number" min=0 step=0.01 class="saveable" /></label>';
		html += '<label title="Add bonus points to the stat generator">Stat bonus: <input name="stat_bonus" value="'+esc(dummy.stat_bonus)+'" type="number" min=0 step=1 class="saveable" /></label>';
		html += '<label title="Plate/mail tags are handled automatically, this can be used to override">Hit sound: <input name="hit_sound" value="'+esc(dummy.hit_sound)+'" type="text" class="saveable" /></label>';
	html += '</div>';

	
	html += '<div class="labelFlex">';
	for( let i in Action.Types )
		html += '<label>SV '+esc(i)+': <input name="svBons::'+esc(Action.Types[i])+'" value="'+esc(dummy.svBons[Action.Types[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
	for( let i in Action.Types )
		html += '<label>BON '+esc(i)+': <input name="bonBons::'+esc(Action.Types[i])+'" value="'+esc(dummy.bonBons[Action.Types[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
	html += '</div>';
	
	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	this.setDom(html);

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single);
}



// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*name' : true,
		weight : true,
		level : true,
		stat_bonus : true,
		durability_bonus : true,
		tags : true,
		svBons : true,
		bonBons: true,
		tags: true,
		
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'material_'+Generic.generateUUID(),
		name : 'My Material',
	}));

};


export function help(){

	let out = '';
	out += '<h3>Material Template:</h3>'+
		'<p>Physical materials that can be applied to different types of equipment. These are always tied to an Asset Template.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the material. Will be prepended to the asset name.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Base color name</td>'+
			'<td>Name the color of the item.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Base color</td>'+
			'<td>Select a the color.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tintable</td>'+
			'<td>Check if the material can be dyed at a blacksmith.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Weight</td>'+
			'<td>Assume the material was attached to an item the size of a shirt. How much would it weigh in grams? For metal I suggest 5000-7000.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Level</td>'+
			'<td>Minimum player level for this material to show up in world.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Durability Bonus Multiplier</td>'+
			'<td>Multiplies against durability. Heavy armor in general can have a value of 2. But it\'s up to you.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stat bonus</td>'+
			'<td>Can be used to add bonus enchants. Leave at 0 for most materials.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hit sound</td>'+
			'<td>Leave empty. This is auto generated.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>SV/BON</td>'+
			'<td>Avoidance/Proficiency adjust. I suggest keeping it small, and using negatives. Such as Steel granting 3 sv physical but -2 sv arcane.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Add material tags starting with "as_", such as as_steel, as_metal, as_hard etc.</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};


