/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import stdTag from '../../libraries/stdTag.js';

class AssetTemplate extends Generic{
	constructor(data){
		super(data);

		this.label = '';
		this.slots = [Asset.Slots.upperbody];
		this.name = "";
		this.materials = ['cotton'];	// Available material labels
		this.svStats = {};
		this.bonStats = {};
		this.description = "";
		this.tags = [];
		this.size = 1.0;					// Size multiplier, used in weight calculations

		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	save(full ){
		return {
			label : this.label,
			slots : this.slots,
			name : this.name,
			materials : this.materials,
			svStats : this.svStats,
			bonStats : this.bonStats,
			description : this.description,
			tags : this.tags,
			size : this.size,
		};
	}

	// Automatically invoked after g_autoload
	rebase(){
		
	}

	// Checks if it has one of these materials
	getMaterialIntersect( materials ){

		if( !Array.isArray(materials) )
			return this.materials;

		let out = [];
		for( let mat of this.materials ){
			if( materials.indexOf(mat) )
				out.push(mat);
		}
		return out;

	}

	testLevel(level){
		for( let mat of this.materials ){
			if( !mat )
				return false;
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

		let viableMats = this.getMaterialIntersect(allowed_materials).filter(el => el.level <= level);
		let mat = viableMats[Math.floor(Math.random()*viableMats.length)];
		
		return new AssetOutput({
			name : mat.name + ' '+this.name,
			slots : this.slots,
			svStats : mergeStats('sv',this.svStats, mat.svBons),
			bonStats : mergeStats('bon',this.bonStats, mat.bonBons),
			description : this.description,
			tags : this.tags.concat(mat.tags.map(el => el)),
			durability_bonus : mat.durability_bonus,
			weight : Math.round(mat.weight*this.slots.length*this.size),
			stat_bonus : mat.stat_bonus,
		});

	}

}


// Flattened item template
class AssetOutput extends Generic{
	constructor(data){
		super(data);
		this.slots = [Asset.Slots.upperbody];
		this.name = "";
		this.svStats = {};
		this.bonStats = {};
		this.description = "";
		this.tags = [];
		this.durability_bonus = 0;
		this.weight = 0;
		this.stat_bonus = 0;
		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}
	// Automatically invoked after g_autoload
	rebase(){
	}
	
}

// Creates an assetoutput
AssetTemplate.generateOutput = function( slot, level, viable_asset_templates, viable_asset_materials ){

	let lib = game.getFullLibrary( "AssetTemplate" );

	level = Math.max(1,level);
	let candidates = [];
	for( let asset of lib ){

		// Check if slot was preset
		if( (slot && asset.slots.indexOf(slot) === -1) || !asset.testLevel(level) )
			continue;
		// If viabl_asset_templates is an array, make sure it's in there
		if( Array.isArray(viable_asset_templates) && viable_asset_templates.indexOf(asset.name) === -1 )
			continue;
		// make sure it has an allowed material
		if( Array.isArray(viable_asset_materials) && !asset.getMaterialIntersect(viable_asset_materials).length )
			continue;

		candidates.push(asset);

	}

	if( !candidates.length )
		return false;

	let item = candidates[Math.floor(Math.random()*candidates.length)];
	return item.flatten(level, viable_asset_materials);

}




class Material extends Generic{
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
		};
	}

}


const Materials = {

	// Cloth
	'cotton' : new Material({
		name : 'Cotton',
		tags:[stdTag.asCloth,stdTag.asStretchy,stdTag.asCotton],
	}),
	'silk' : new Material({
		name : 'Silk',
		tags:[stdTag.asCloth,stdTag.asStretchy,stdTag.asSilk],
		level : 3,
		stat_bonus : 1,
		weight : 300,
	}),
	'mageweave' : new Material({
		name : 'Mageweave',
		tags:[stdTag.asCloth, stdTag.asMageweave],
		level : 8,
		stat_bonus : 2,
		weight : 500,
	}),
	'shadowcloth' : new Material({
		name : 'Shadowcloth',
		tags:[stdTag.asCloth, stdTag.asShadowcloth],
		level : 14,
		stat_bonus : 3,
		weight : 300
	}),


	// Leather
	'leather' : new Material({
		name:'Leather', 
		tags:[stdTag.asLeather], 
		level : 1, 
		weight : 2000,
		durability_bonus : 1.25,
	}),
	'rawhide' : new Material({
		name:'Rawhide', 
		tags:[stdTag.asLeather,stdTag.asRawhide], 
		level : 3, 
		weight : 3000,
		durability_bonus : 1.5,
		stat_bonus:1,
	}),
	'stretchhide' : new Material({
		name:'Stretch-hide', 
		tags:[stdTag.asLeather,stdTag.asStretchy], 
		level : 6,
		weight : 2000,
		durability_bonus : 2,
		stat_bonus : 2,
	}),

	

	// Mail types
	'mailCopper' : new Material({
		name:'Copper-mail', 
		tags:[stdTag.asMail, stdTag.asMetal, stdTag.asCopper], 
		level : 3, 
		weight : 7000,
		durability_bonus : 2
	}),
	'mailSteel' : new Material({
		name:'Steel-mail', 
		tags:[stdTag.asMail, stdTag.asMetal, stdTag.asSteel], 
		level : 6, 
		weight : 5000,
		durability_bonus : 2.5
	}),
	'mailMithril' : new Material({
		name:'Mithril-mail', 
		tags:[stdTag.asMail, stdTag.asMetal, stdTag.asMithril], 
		level : 12, 
		weight : 1000,
		durability_bonus : 3
	}),

	// Plate
	'plateCopper' : new Material({
		name:'Copper', 
		tags:[stdTag.asPlate, stdTag.asMetal,stdTag.asHard, stdTag.asCopper], 
		level : 5, 
		weight : 9000,
		durability_bonus : 2.5
	}),
	'plateSteel' : new Material({
		name:'Steel', 
		tags:[stdTag.asPlate, stdTag.asMetal,stdTag.asHard, stdTag.asSteel], 
		level : 10, 
		weight : 8000,
		durability_bonus : 3
	}),
	'plateSoftsilver' : new Material({
		name:'Softsilver', 
		tags:[stdTag.asMetal,stdTag.asStretchy,stdTag.asSoftsilver], 
		level : 15, 
		weight : 1500,
		durability_bonus : 4,
		stat_bonus : 1
	}),
};




export {Materials, Material};
export default AssetTemplate;
