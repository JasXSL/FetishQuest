import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAudioKit from './EditorAudioKit.js';
import * as EditorAction from './EditorAction.js';
import Asset from '../../classes/Asset.js';
import stdTag from '../../libraries/stdTag.js';
import Generic from '../../classes/helpers/Generic.js';


const DB = 'assets',
	CONSTRUCTOR = Asset;

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
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input name="name" value="'+esc(dummy.name)+'" type="text" class="saveable" /></label>';
		html += '<label>Shortname: <input name="shortname" value="'+esc(dummy.shortname)+'" type="text" class="saveable" /></label>';
		html += '<label title="When using label, set the name of the object to an object you want to polymorph this into. This is used to create stacks of another asset, such as gold.">Dummy Type: <select name="dummy" class="saveable">';
		for( let i in Asset.Dummies ){
			html += '<option value="'+esc(Asset.Dummies[i])+'" '+(Asset.Dummies[i] === dummy.dummy ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';
		html += '<label>Level: <input name="level" value="'+esc(dummy.level)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>Durability Bonus: <input name="durability_bonus" value="'+esc(dummy.durability_bonus)+'" step=1 type="number" class="saveable" /></label>';
		html += '<label>Stacking: <input name="stacking" class="saveable" type="checkbox" '+(dummy.stacking ? 'checked' : '')+' /></label>';
		html += '<label title="Stacks of this to add when adding this particular asset. Useful in templates.">'+
			'Stacks to add: <input name="_stacks" class="saveable" type="number" min=1 step=1 value="'+(parseInt(dummy._stacks) || 1)+'" />'+
		'</label>';
		html += '<label title="0 = no use, -1 = infinite use">Charges: <input name="charges" value="'+esc(dummy.charges)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>No auto consume: <input name="no_auto_consume" class="saveable" type="checkbox" '+(dummy.no_auto_consume ? 'checked' : '')+' /></label>';
		html += '<label>Soulbound: <input name="soulbound" class="saveable" type="checkbox" '+(dummy.soulbound ? 'checked' : '')+' /></label>';
		html += '<label title="In copper. 0 = no sell">Monetary Value: <input name="basevalue" value="'+esc(dummy.basevalue)+'" step=1 min=0 type="number" class="saveable" /></label>';
		html += '<label>Weight (grams): <input name="weight" value="'+esc(dummy.weight)+'" step=1 min=0 type="number" class="saveable" /></label>';
	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description)+'</textarea><br />';

	html += '<span title="Go to game icons.net and search for one such as https://game-icons.net/1x1/cathelineau/swordman.html and use that name (swordman)">'+
		'Icon: <input name="icon" value="'+esc(dummy.icon)+'" type="text" class="saveable" />'+
	'</span><br />';

	html += '<div class="arrayPicker" name="slots">';
	for( let i in Asset.Slots )
		html += '<label>'+esc(i)+' <input type="checkbox" value="'+esc(Asset.Slots[i])+'" '+(~dummy.slots.indexOf(Asset.Slots[i]) ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += 'Rarity: <select name="rarity" class="saveable">';
		for( let cat in Asset.Rarity )
			html += '<option value="'+esc(Asset.Rarity[cat])+'" '+(dummy.rarity === Asset.Rarity[cat] ? 'selected' :'')+'>'+esc(cat)+'</option>';
	html += '</select><br />';

	html += 'Category: <select name="category" class="saveable">';
		for( let cat in Asset.Categories )
			html += '<option value="'+esc(cat)+'" '+(dummy.category === cat ? 'selected' :'')+'>'+esc(cat)+'</option>';
	html += '</select><br />';

	html += 'Equip Conditions: <br /><div class="equip_conditions"></div>';

	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += 'Passives: <br /><div class="wrappers"></div>';


	html += 'Use Action: <div class="use_action"></div>';

	html += 'Loot sound: <div class="loot_sound"></div>';


	this.setDom(html);


	// Bind stuff
	// equip_conditions
	this.dom.querySelector("div.equip_conditions").appendChild(EditorCondition.assetTable(this, asset, "equip_conditions"));

	// wrappers
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers"));
	
	// loot sound
	this.dom.querySelector("div.loot_sound").appendChild(EditorAudioKit.assetTable(this, asset, "loot_sound", true));
	
	// Use action
	this.dom.querySelector("div.use_action").appendChild(EditorAction.assetTable(this, asset, "use_action", true));


	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
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
		shortname : true,
		['*level'] : true,
		['*rarity'] : true,
		['*category'] : true,
		['*description'] : true,
		slots: true,
		icon : true,
		equip_conditions: true,
		tags : true,
		wrappers : a => a.wrappers.length,
		durability_bonus : true,
		stacking : true,
		charges : true,
		use_action : true,
		no_auto_consume : true,
		loot_sound : true,
		soulbound : true,
		basevalue : true,
		weight: true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'asset_'+Generic.generateUUID(),
		name : 'Epic Purple Thong',
		shortname : 'thong',
		level : 20,
		rarity : Asset.Rarity.EPIC,
		category : Asset.Categories.armor,
		description : 'A purple thong that looks epic but does nothing.',
		slots : Asset.Slots.lowerBody,
		icon : 'underwear',
		tags : [stdTag.asThong, stdTag.asTight, stdTag.asWaistband, stdTag.asMageweave],
		loot_sound : 'lootCloth',
		basevalue : 690,
		weight : 25,
	}));

};

