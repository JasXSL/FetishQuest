import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAudioKit from './EditorAudioKit.js';
import * as EditorAction from './EditorAction.js';
import * as EditorGameAction from './EditorGameAction.js';
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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input name="name" value="'+esc(dummy.name)+'" type="text" class="saveable" /></label>';
		html += '<label title="a/an, use \'some\' for things like swimtrunks that are plural. Empty auto generates but fails at words like unicorn that start with a vowel but still use a.">Shortname Article: <input name="snpre" value="'+esc(dummy.snpre)+'" type="text" class="saveable" /></label>';
		html += '<label>Shortname: <input name="shortname" value="'+esc(dummy.shortname)+'" type="text" class="saveable" /></label>';
		html += '<label title="Include in chests and loot bags">Autoloot: <input name="genLoot" class="saveable" type="checkbox" '+(dummy.genLoot ? 'checked' : '')+' /></label>';
		
		html += '<label title="Name of dyed color (optional).">Dye name: <input name="color_tag" value="'+esc(dummy.color_tag)+'" type="text" class="saveable" /></label>';
		html += '<label title="Color of dye (optional). Only used if name exists.">Dye color: <input name="color" value="'+esc(dummy.color)+'" type="color" class="saveable" /></label>';
		html += '<label title="Base name of base color">Base Color name: <input name="color_tag_base" value="'+esc(dummy.color_tag_base)+'" type="text" class="saveable" /></label>';
		html += '<label title="Base color of item">Base color: <input name="color_base" value="'+esc(dummy.color_base)+'" type="color" class="saveable" /></label>';
		
		

		html += '<label title="When using label, set the name of the object to an object you want to polymorph this into. This is used to create stacks of another asset, such as gold.">Dummy Type: <select name="dummy" class="saveable">';
		for( let i in Asset.Dummies ){
			html += '<option value="'+esc(Asset.Dummies[i])+'" '+(Asset.Dummies[i] === dummy.dummy ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';
		html += '<label title="Use -1 to set it to average player level. -2 levels up automatically">Level: <input name="level" value="'+esc(dummy.level)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>Durability Bonus: <input name="durability_bonus" value="'+esc(dummy.durability_bonus)+'" step=1 type="number" class="saveable" /></label>';
		html += '<label>Stacking: <input name="stacking" class="saveable" type="checkbox" '+(dummy.stacking ? 'checked' : '')+' /></label>';
		html += '<label title="Durability doubled">Mastercrafted: <input name="mastercrafted" class="saveable" type="checkbox" '+(dummy.mastercrafted ? 'checked' : '')+' /></label>';
		html += '<label title="Weight is cut in half">Fitted: <input name="fitted" class="saveable" type="checkbox" '+(dummy.fitted ? 'checked' : '')+' /></label>';
		html += '<label title="Stacks of this to add when adding this particular asset. Useful in templates.">'+
			'Stacks to add: <input name="_stacks" class="saveable" type="number" min=1 step=1 value="'+(parseInt(dummy._stacks) || 1)+'" />'+
		'</label>';
		html += '<label title="0 = no use, -1 = infinite use">Charges: <input name="charges" value="'+esc(dummy.charges)+'" type="number" min=-1 step=1 class="saveable" /></label>';
		html += '<label>No auto consume: <input name="no_auto_consume" class="saveable" type="checkbox" '+(dummy.no_auto_consume ? 'checked' : '')+' /></label>';
		html += '<label>Soulbound: <input name="soulbound" class="saveable" type="checkbox" '+(dummy.soulbound ? 'checked' : '')+' /></label>';
		html += '<label>Colorable: <input name="colorable" class="saveable" type="checkbox" '+(dummy.colorable ? 'checked' : '')+' /></label>';
		html += '<label>Indestructible: <input name="indestructible" class="saveable" type="checkbox" '+(dummy.indestructible ? 'checked' : '')+' /></label>';
		html += '<label title="Destroys the item when unequipped">Rem on unequip: <input name="rem_unequip" class="saveable" type="checkbox" '+(dummy.rem_unequip ? 'checked' : '')+' /></label>';
		html += '<label title="Cannot be unequipped manually">No Unequip: <input name="no_unequip" class="saveable" type="checkbox" '+(dummy.no_unequip ? 'checked' : '')+' /></label>';
		html += '<label title="In random momentum. Use -1 for game default">Unequip cost: <input name="unequip_cost" class="saveable" type="number" step=1 value="'+esc(dummy.unequip_cost)+'" /></label>';
		html += '<label title="In random momentum. Use -1 for game default">Equip cost: <input name="equip_cost" class="saveable" type="number" step=1 value="'+esc(dummy.equip_cost)+'" /></label>';
		html += '<label title="Deleted after n seconds have passed in game, 0 disables">Expires: <input name="expires" value="'+esc(dummy.expires)+'" step=1 min=0 type="number" class="saveable" /></label>';
		html += '<label title="In copper. 0 = no sell">Monetary Value: <input name="basevalue" value="'+esc(dummy.basevalue)+'" step=1 min=0 type="number" class="saveable" /></label>';
		html += '<label>Weight (grams): <input name="weight" value="'+esc(dummy.weight)+'" step=1 min=0 type="number" class="saveable" /></label>';
		html += '<label title="Plate/mail tags are handled automatically, this can be used to override">Hit sound: <input name="hit_sound" value="'+esc(dummy.hit_sound)+'" type="text" class="saveable" /></label>';
		html += '<label title="Use the asset tooltip even if a use action is set">Force this desc: <input name="iuad" class="saveable" type="checkbox" '+(dummy.iuad ? 'checked' : '')+' /></label>';
		
	html += '</div>';

	html += 'Description: <br /><textarea name="description" class="saveable">'+esc(dummy.description, true)+'</textarea><br />';

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

	html += '<label title="Description is the context menu option">Game Actions: </label><div class="game_actions"></div>';

	html += 'Loot sound: <div class="loot_sound"></div>';


	this.setDom(html);


	// Bind stuff
	// equip_conditions
	this.dom.querySelector("div.equip_conditions").appendChild(EditorCondition.assetTable(this, asset, "equip_conditions"));

	// wrappers
	this.dom.querySelector("div.wrappers").appendChild(EditorWrapper.assetTable(this, asset, "wrappers", false, true));
	
	// loot sound
	this.dom.querySelector("div.loot_sound").appendChild(EditorAudioKit.assetTable(this, asset, "loot_sound", true));
	
	// Use action
	this.dom.querySelector("div.use_action").appendChild(EditorAction.assetTable(this, asset, "use_action", true));
	
	// Game actions
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions", false));


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
		wrappers : a => a.wrappers ? a.wrappers.length : 0,
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


export function help(){

	let out = '';
	out += '<h3>Asset:</h3>'+
		'<p>An asset is an inventory item.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>A unique label to access the asset by. WARNING: DO NOT CHANGE AFTER SETTING IT, OR RISK BROKEN LINKS!</td>'+
		'</tr>'+ 
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your asset.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Shortname Article</td>'+
			'<td>Only needed if the shortname violates the rule of "if it starts with a vowel, use \'an\'". Such as "a unicorn" which starts with a vowel but uses "a".</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Shortname</td>'+
			'<td>A short name. Such as if you make an asset called "thong of divinity", you could use "thong" as a shortname to shorten the sentences a bit when referred to in texts.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Autoloot</td>'+
			'<td>This item can show up in autoloot game actions.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Dye name / Dye color</td>'+
			'<td>Optional. If this item has been dyed from the start, enter the color name and color.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Base color name / Base color</td>'+
			'<td>Name of the color and color of the object.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Dummy type</td>'+
			'<td>Used to create stacks of items. When used, you set the name to the label of the object you want to polymorph it into. And then set stacks to add. For an instance if you want the item to represent 10 gold, set dummy type to label, name to "gold" and stacks to add to 10. Autoloot is currently not implemented.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Level</td>'+
			'<td>Level of item. Setting it to -1 will have it set to the player average level when the item is found in game. Using -2 sets it to ALWAYS be the holder\'s level.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Durability Bonus</td>'+
			'<td>Only used for items that can be damaged (clothes). Adds extra durability points to the item.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stacking</td>'+
			'<td>Item can stack. This should not be used for items that can be used or worn. Only in items that can safely stack, such as reagents or vendor trash.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Charges</td>'+
			'<td>If the asset has a use action, this is how many times it can be used. Use -1 for infinite. If you make an item with a use action and it can\'t be used, it\'s probably because you left this at 0.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>No auto consume</td>'+
			'<td>Normally charges are consumed even if the item action misses or fails. This prevents it from consuming charges if the action is a miss or fail.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Soulbound</td>'+
			'<td>Prevents you from trading the asset to other players.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Colorable</td>'+
			'<td>Allows players to dye the asset at a smith.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Indestructible</td>'+
			'<td>Prevents the item from taking damage from physical damage and other sources of armor damage.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Rem on unqeuip</td>'+
			'<td>Deletes the item when unequipped. Good for summoned armor and such.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>No Unequip</td>'+
			'<td>Item cannot be unequipped by the player. Wrappers can still unequip it.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Unequip/Equip cost</td>'+
			'<td>Sets the momentum cost of unequipping/equipping the item. -1 uses the default value.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Expires</td>'+
			'<td>Time in in game seconds before the item will self destruct. 0 disables.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Monetary value</td>'+
			'<td>Sell value in copper. Setting this to 0 disables selling.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Weight</td>'+
			'<td>Item weight in grams. Make an estimate.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hit sound</td>'+
			'<td>Path to a sound file for a special hit sound to play when the item is hit (armor). Leave empty to auto generate based on material tags.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Force this desc</td>'+
			'<td>By default, if you attach an action to the item, the item tooltip shows the action\'s tooltip. Checking force this desc uses the asset description instead.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe what the item looks like. You don\'t have to describe enchants as they are auto described based on the wrapper.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Icon</td>'+
			'<td>Item icon, you can use a name of an icon from game-icons.net</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Item slots</td>'+
			'<td>Where the item can equip to (if any).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Rarity</td>'+
			'<td>Item rarity.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Category</td>'+
			'<td>What category in your inventory the item should show up in.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Equip conditions</td>'+
			'<td>Conditions that need to be met by the wearer in order to equip the item in the first place.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Use tags starting with as_</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Passive wrappers to give the wearer while the item is worn.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Use Action</td>'+
			'<td>An action to trigger when the asset is used.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Game Actions</td>'+
			'<td>Game Actions to trigger when the asset is used from inventory. Note that this doesn\'t consume charges, only Use Action does.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Loot Sound</td>'+
			'<td>Sound to play when looting the item</td>'+
		'</tr>'
	;
		

	out += '</table>';
	return out;

};

