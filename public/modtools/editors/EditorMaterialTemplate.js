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
		html += '<label>BON '+esc(i)+': <input name="bonBons::'+esc(Action.Types[i])+'" value="'+esc(dummy.svBons[Action.Types[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
	for( let i in Player.primaryStats )
		html += '<label>'+esc(i)+': <input name="primaryStats::'+esc(Player.primaryStats[i])+'" value="'+esc(dummy.primaryStats[Player.primaryStats[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
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
		primaryStats : true,
		tags: true,
		
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'material_'+Generic.generateUUID(),
		name : 'My Material',
	}));

};

