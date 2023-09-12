import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorMaterialTemplate from './EditorMaterialTemplate.js';
import * as EditorWrapper from './EditorWrapper.js';

import Asset from '../../classes/Asset.js';
import stdTag from '../../libraries/stdTag.js';
import AssetTemplate from '../../classes/templates/AssetTemplate.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import Generic from '../../classes/helpers/Generic.js';


const DB = 'assetTemplates',
	CONSTRUCTOR = AssetTemplate;

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
		html += '<label>Shortname: <input name="shortname" value="'+esc(dummy.shortname)+'" type="text" class="saveable" /></label>';
		html += '<label>Level: <input name="level" value="'+esc(dummy.level)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label title="Size multiplier, 1 is about the size of a sweatshirt">Size: <input name="size" value="'+esc(dummy.size)+'" type="number" min=0 step=0.01 class="saveable" /></label>';
		html += '<label title="Overrides the material color if set">Base color name: <input name="color_tag_base" value="'+esc(dummy.color_tag_base)+'" type="text" class="saveable" /></label>';
		html += '<label title="Requires base color name to be set">Base color: <input name="color_base" value="'+esc(dummy.color_base)+'" type="color" class="saveable" /></label>';
		html += '<label>Indestructible: <input name="indestructible" value=1 type="checkbox" class="saveable" '+(dummy.indestructible ? 'checked' : '')+' /></label>';
		
		html += '<label title="Go to game icons.net and search for one such as https://game-icons.net/1x1/cathelineau/swordman.html and use that name (swordman)">'+
			'Icon: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" />'+
		'</label><br />';
		html += '<label title="Plate/mail tags are handled automatically, this can be used to override that and any sound set in MaterialTemplate">Hit sound: <input name="hit_sound" value="'+esc(dummy.hit_sound)+'" type="text" class="saveable" /></label>';

	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description)+'</textarea><br />';

	
	// Todo: Add the stats
	html += '<div class="labelFlex">';

	html += '</div>';
	
	html += '<div class="labelFlex">';
	for( let i in Action.Types )
		html += '<label>SV '+esc(i)+': <input name="svStats::'+esc(Action.Types[i])+'" value="'+esc(dummy.svStats[Action.Types[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
	for( let i in Action.Types )
		html += '<label>BON '+esc(i)+': <input name="bonStats::'+esc(Action.Types[i])+'" value="'+esc(dummy.bonStats[Action.Types[i]] || 0)+'" step=1 type="number" class="saveable" /></label>';
	html += '</div>';
	

	html += '<div class="arrayPicker" name="slots">';
	for( let i in Asset.Slots )
		html += '<label>'+esc(i)+' <input type="checkbox" value="'+esc(Asset.Slots[i])+'" '+(~dummy.slots.indexOf(Asset.Slots[i]) ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += 'Materials: <br /><div class="materials"></div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += 'Passives: <br /><div class="wrappers"></div>';

	this.setDom(html);


	// Bind stuff
	// wrappers
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers"));

	// Materials
	this.dom.querySelector("div.materials").appendChild(EditorMaterialTemplate.assetTable(this, asset, "materials"));

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name', 'description'], single);
}



// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		['*label'] : true,
		['*name'] : true,
		shortname : true,
		['*level'] : true,
		slots:true,
		['*materials'] : true,
		svStats : true,
		bonStats : true,
		description : true,
		tags : true,
		wrappers : true,
		size : true,
		icon : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'asset_'+Generic.generateUUID(),
		name : 'Adorned Thong',
		shortname : 'thong',
		level : 5,
		slots : [Asset.Slots.lowerBody],
		materials : ['cotton'],
		description : 'A thong adorned with a fine embroidery',
		tags : [stdTag.asThong, stdTag.asTight, stdTag.asWaistband, stdTag.asStretchy],
		icon : 'underwear',
	}));

};

export function help(){

	let out = '';
	out += '<h3>Asset Template:</h3>'+
		'<p>An asset template describes parameters to auto generate an item (usually armor). It\'s commonly used in Player Templates and Autoloot game actions.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of the asset.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Shortname</td>'+
			'<td>A short name for the asset. Such as shiny bodysuit could become "bodysuit".</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Level</td>'+
			'<td>Sets a minimum level for this to start showing up in the game.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Size</td>'+
			'<td>Sets a size compared to a full shirt. So if a bra is 20% the size of a full shirt, set it to 0.2. Used in weight calculations.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Base Color Name</td>'+
			'<td>Lets you force a color of the item. Generally you should set colors in Material Template instead.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Indestructible</td>'+
			'<td>This item cannot take durability damage.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Icon</td>'+
			'<td>Icon. You can use an icon name from game-icons.net</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hit sound</td>'+
			'<td>Path to sound that should play when hit. Generally you should leave this blank, as hit sounds are auto generated by material tags.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe what the item looks like.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>SV/BON</td>'+
			'<td>Lets you tune the sv (avoidance) and bon (proficiency) stats of the item. I recommend leaving all these at 0 and tuning it on materials instead.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Attachment slots</td>'+
			'<td>Pick what equipment slots the item takes up (if any).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Materials</td>'+
			'<td>Pick material templates this item can come as.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Add descriptive tags to the item. These are the tags starting with as_</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Passive wrappers the generated asset grants while equipped. I recommend leaving this empty, as stats will be auto generated.</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};


