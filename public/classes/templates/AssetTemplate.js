/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import stdTag from '../../libraries/stdTag.js';
import { Wrapper } from '../EffectSys.js';

class AssetTemplate extends Generic{
	constructor(data){
		super(data);

		this.label = '';
		this.slots = [Asset.Slots.upperBody];
		this.name = "";
		this.shortname = "";
		this.materials = ['cotton'];	// Available material labels
		this.svStats = {};
		this.bonStats = {};
		this.description = "";
		this.tags = [];
		this.wrappers = [];
		this.level = 0;
		this.size = 1.0;					// Size multiplier, used in weight calculations
		this.icon = 'perspective-dice-six-faces-random';
		this.hit_sound = '';
		this.indestructible = false;
		
		this.color_tag_base = '';			// If set, overrides the material. Should be the name of the color.
		this.color_base = '#FFFFFF';		// Requires tag base to be set

		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	save( full ){
		return {
			shortname : this.shortname,
			label : this.label,
			slots : this.slots,
			name : this.name,
			materials : this.materials,
			svStats : this.svStats,
			bonStats : this.bonStats,
			description : this.description,
			tags : this.tags,
			size : this.size,
			icon : this.icon,
			wrappers : this.wrappers,
			level : this.level,
			hit_sound : this.hit_sound,
			color_tag_base : this.color_tag_base,
			color_base : this.color_base,
			indestructible : this.indestructible
		};
	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super
	}

	// Returns objects of materials
	getMats(){
		let out = [];
		let lib = MaterialTemplate.getLib();
		for( let mat of this.materials ){
			if( lib[mat] )
				out.push(lib[mat]);
		}
		return out;
	}


	// Checks if it has one of these materials (materials are strings), if materials isn't an array, allow ALL
	getMaterialIntersect( materials, level ){

		if( !Array.isArray(materials) )
			return this.materials;

		let mats = this.getMats();
		let out = [];
		for( let mat of mats ){
			if( ~materials.indexOf(mat.label) && (!level || mat.level <= level) )
				out.push(mat.label);
		}
		return out;

	}

	testLevel(level){

		if( this.level > level )
			return false;
			
		let mats = this.getMats();
		for( let mat of mats ){
			if( mat.level <= level )
				return true;
		}
		return false;
	}

	
	// Returns an AssetOutput object based on level
	flatten( level, allowed_materials ){

		level = Math.max(1,level);
		let mergeStats = function( prefix, a, b ){
			let out = {};
			for( let i in a ){
				if( a[i] !== 0 )
					out[prefix+i] = a[i];
			}

			for( let i in b ){
				if( b[i] === 0)
					continue;
				if( !out.hasOwnProperty(prefix+i) )
					out[prefix+i] = b[i];
				else
					out[prefix+i] += b[i];
			}
			return out;

		};

		let mats = MaterialTemplate.getLib();

		let viableMats = this.getMaterialIntersect(allowed_materials)
			.map(el => mats[el])
			.filter(el => el.level <= level);
		

		

		let mat = viableMats[Math.floor(Math.random()*viableMats.length)];
		let hitSound = this.hit_sound;
		if( !hitSound )
			hitSound = mat.hit_sound;

		return new AssetOutput({
			name : mat.name + ' '+this.name,
			shortname : this.shortname,
			slots : this.slots,
			svStats : mergeStats('sv',this.svStats, mat.svBons),
			bonStats : mergeStats('bon',this.bonStats, mat.bonBons),
			description : this.description,
			tags : this.tags.concat(mat.tags.map(el => el)),
			durability_bonus : mat.durability_bonus,
			weight : Math.round(mat.weight*this.slots.length*this.size),
			stat_bonus : mat.stat_bonus,
			icon : this.icon,
			wrappers : this.wrappers, 		// Raw data
			colorable : mat.colorable,
			color_tag_base : this.color_tag_base || mat.color_tag_base,
			color_base : this.color_tag_base ? this.color_base : mat.color_base,
			hit_sound : hitSound,
			indestructible : this.indestructible
		});

	}

}


// Flattened item template
class AssetOutput extends Generic{
	constructor(data){
		super(data);
		this.slots = [Asset.Slots.upperBody];
		this.name = "";
		this.shortname = ""; 
		this.svStats = {};
		this.bonStats = {};
		this.description = "";
		this.tags = [];
		this.durability_bonus = 0;
		this.weight = 0;
		this.stat_bonus = 0;
		this.icon = '';
		this.wrappers = [];
		this.colorable = true;
		this.color_tag_base = 'white';
		this.color_base = '#FFFFFF';
		this.hit_sound = '';
		this.indestructible = false;
		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}
	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super
	}
	
}

// Creates an assetoutput
AssetTemplate.generateOutput = function( slot, level, viable_asset_templates, viable_asset_materials, allowCosmetic = false ){

	let lib = Object.values(glib.getFull( "AssetTemplate" ));
	level = Math.max(1,level);

	if( typeof viable_asset_templates === "string" )
		viable_asset_templates = [viable_asset_templates];

	const aTemplates = game.story.allowed_templates_armor;
	const mTemplates = game.story.allowed_templates_material;
	if( !viable_asset_templates && aTemplates.length )
		viable_asset_templates = aTemplates;
	if( !viable_asset_materials && mTemplates.length )
		viable_asset_materials = mTemplates;

	const baseSlots = [
		Asset.Slots.upperBody,
		Asset.Slots.lowerBody,
		Asset.Slots.hands,
	];
	let candidates = [];
	for( let asset of lib ){

		// Check if slot was preset
		if( 
			(slot && !asset.slots.includes(slot)) || 
			!asset.testLevel(level) ||
			(!allowCosmetic && !asset.slots.some(el => baseSlots.includes(el)))
		)
			continue;
		
		// If viabl_asset_templates is an array, make sure it's in there
		if( Array.isArray(viable_asset_templates) && viable_asset_templates.indexOf(asset.label) === -1 )
			continue;
		// make sure it has an allowed material
		if( Array.isArray(viable_asset_materials) && !asset.getMaterialIntersect(viable_asset_materials, level).length )
			continue;
		candidates.push(asset);

	}


	if( !candidates.length )
		return false;

	let item = candidates[Math.floor(Math.random()*candidates.length)];
	return item.flatten(level, viable_asset_materials);

}




class MaterialTemplate extends Generic{
	constructor(data){
		super(data);

		this.label = '';
		this.name = "";
		this.tags = [];
		this.weight = 400;			// Weight of an average chestpiece
		this.level = 1;
		this.durability_bonus = 1;		// Multiplier. Actual durability is based on level.
		this.svBons = {};	// type : bon 
		this.bonBons = {}; // == || ==
		this.stat_bonus = 0;		// Adds additional stat points to generator
		this.colorable = true;
		this.color_tag_base = 'white';
		this.color_base = '#FFFFFF';
		this.hit_sound = '';

		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	save(full){
		return {
			label : this.label,
			name : this.name,
			tags : this.tags,
			weight : this.weight,
			level : this.level,
			durability_bonus : this.durability_bonus,
			svBons : this.svBons,
			bonBons : this.bonBons,
			stat_bonus : this.stat_bonus,
			colorable : this.colorable,
			color_tag_base : this.color_tag_base,
			color_base : this.color_base,
			hit_sound : this.hit_sound
		};
	}

}


export {MaterialTemplate};
export default AssetTemplate;
