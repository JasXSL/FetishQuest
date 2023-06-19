import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'players',
	CONSTRUCTOR = Player;

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
		html += '<label title="Sets a/an. Leave empty to auto generate. Only needed for words like unicorn because the u sounds like a consonant">Species article: <input type="text" name="spre" class="saveable" value="'+esc(dummy.spre)+'" /></label>';
		html += '<label>Species: <input type="text" name="species" class="saveable" value="'+esc(dummy.species)+'" /></label>';
		html += '<label>Voice: <input type="text" name="voice" class="saveable" value="'+esc(dummy.voice)+'" list="datalist_voices" /></label>';
		html += '<label title="Leave empty to autogenerate">Pronoun he: <input name="he" value="'+esc(dummy.he)+'" type="text" class="saveable" style="width:3em" /></label>';
		html += '<label title="Leave empty to autogenerate">Pronoun him: <input name="him" value="'+esc(dummy.him)+'" type="text" class="saveable" style="width:3em" /></label>';
		html += '<label title="Leave empty to autogenerate">Pronoun his: <input name="his" value="'+esc(dummy.his)+'" type="text" class="saveable" style="width:3em" /></label>';
		
		html += '<label>Image Dressed: <input type="text" name="icon" class="saveable" value="'+esc(dummy.icon)+'" /></label>';
		html += '<label>Image Upper Body Armor: <input type="text" name="icon_upperBody" class="saveable" value="'+esc(dummy.icon_upperBody)+'" /></label>';
		html += '<label>Image Lower Body Armor: <input type="text" name="icon_lowerBody" class="saveable" value="'+esc(dummy.icon_lowerBody)+'" /></label>';
		html += '<label>Image Nude: <input type="text" name="icon_nude" class="saveable" value="'+esc(dummy.icon_nude)+'" /></label>'; 
		html += '<label>RP Portrait: <input type="text" name="portrait" class="saveable" value="'+esc(dummy.portrait)+'" /></label>';
		html += '<label title="Check this if you used an AI to generate the art">Art is AI generated: <input type="checkbox" name="icon_ai" '+(dummy.icon_ai ? 'checked' : '')+' class="saveable"  /></label>';
		html += '<label title="0 = player team">Team: <input type="number" step=1 min=0 name="team" class="saveable" value="'+esc(dummy.team)+'" /></label>';
		html += '<label title="0-10 where 5 is average human and 10 giant">Size: <input type="number" step=1 min=0 max=10 name="size" class="saveable" value="'+esc(dummy.size)+'" /></label>';
		html += '<label>Level: <input type="number" step=1 name="level" class="saveable" value="'+esc(dummy.level)+'" /></label>';
		html += '<label title="If checked, Level is instead the offset from party average level">Level is offset from party: <input type="checkbox" name="leveled" '+(dummy.leveled ? 'checked' : '')+' class="saveable"  /></label>';
		html += '<label title="Used for NPCs. Difficulty multiplier, higher increases stats. -1 means automatic">Power: <input type="number" step=0.01 min=-1 name="power" class="saveable" value="'+esc(dummy.power)+'" /></label>';
		html += '<label title="Lets you increase or decrease max HP without having to apply passives. Negative value sets a FIXED value">HP Multiplier: <input type="number" step=0.01 min=0.01 name="hpMulti" class="saveable" value="'+esc(dummy.hpMulti)+'" /></label>';
		
		html += '<label title="Used primarily for beast NPCs. Adds &quot;armor&quot; percentage, whole number">Armor: <input type="number" step=1 name="armor" class="saveable" value="'+esc(dummy.armor)+'" /></label>';
		
		html += '<label title="Used for NPCs. Chance of speaking in combat.">Talkative: <input type="number" step=0.01 min=0 max=1 name="talkative" class="saveable" value="'+esc(dummy.talkative)+'" /></label>';
		html += '<label title="Used for NPCs and affects punishments and using arouse vs attack">Sadistic: <input name="sadistic" value="'+esc(dummy.sadistic)+'" type="number" step=0.01 min=0 max=1 class="saveable" /></label>';
		html += '<label title="Used for NPCs and affects punishments">Dominant: <input name="dominant" value="'+esc(dummy.dominant)+'" type="number" step=0.01 min=0 max=1 class="saveable" /></label>';
		html += '<label title="Used for NPCs and affects punishments & to some degree who it will attack. 0.5 = no preference">Hetero: <input name="hetero" value="'+esc(dummy.hetero)+'" type="number" step=0.01 min=0 max=1 class="saveable" /></label>';
		html += '<label title="Chance to use AudioTriggers">Emotive: <input name="emotive" value="'+esc(dummy.emotive)+'" type="number" step=0.01 min=0 max=1 class="saveable" /></label>';
		html += '<label title="Will be used for AI later. 0.6 = human, 0.3 animal, 1 = mastermind">Intelligence: <span class="value"></span><input name="intelligence" value="'+esc(dummy.intelligence)+'" type="number" step=0.01 min=0 max=1 class="saveable" /></label>';

		html += '<label title="Player have ALL actions activated. NPCs use this.">Ignore spell slots: <input type="checkbox" name="auto_learn" '+(dummy.auto_learn ? 'checked' : '')+' class="saveable"  /></label>';
		html += '<label title="Deletes the player immediately upon dying. Useful for summoned enemies.">Remove on death: <input type="checkbox" name="remOnDeath" '+(dummy.remOnDeath ? 'checked' : '')+' class="saveable"  /></label>';

	html += '</div>';


	html += 'Stats: <div class="labelFlex">';

	// Stats:
		for( let i in Action.Types ){
			const label = "sv"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}
		for( let i in Action.Types ){
			const label = "bon"+Action.Types[i];
			html += '<label>'+esc(label)+': <input name="'+esc(label)+'" value="'+esc(dummy[label])+'" class="saveable" type="number" step=1 /></label>';
		}

	html += '</div>';

	html += 'Description: <br /><textarea class="saveable" name="description">'+esc(dummy.description, true)+'</textarea><br />';
	html += 'Secret information: <br /><textarea class="saveable" style="min-height:1vmax" name="secret">'+esc(dummy.secret, true)+'</textarea><br />';

	html += 'PlayerClass: <div class="class"></div>';
	html += 'Tags: <div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += 'Actions: <div class="actions"></div>';
	html += 'Assets (press shift to equip): <div class="assets"></div>';
	html += 'Passives: <div class="passives"></div>';
	html += 'Follower RP: <div title="If this is a follower, set their roleplay here" class="follower"></div>';
	

	this.setDom(html);



	this.dom.querySelector("div.class").appendChild(EditorPlayerClass.assetTable(this, asset, "class", true));
	this.dom.querySelector("div.actions").appendChild(EditorAction.assetTable(this, asset, "actions"));
	this.dom.querySelector("div.assets").appendChild(EditorAsset.assetTable(this, asset, "assets", false));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.follower").appendChild(EditorRoleplay.assetTable(this, asset, "follower", true));
	

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	// Handles a removal from the inventory array (the one that tracks worn items
	const handleInventorySplice = index => {

		// Remove from inventory list
		const pos = asset.inventory.indexOf(index);
		if( ~pos )
			asset.inventory.splice(index, 1);

	};

	// Override the click handler
	// Note: This functionality relies on the whole page being rebuilt when an asset is added or removed. If you change this in the future you'll need to change this bit of code.
	this.dom.querySelectorAll("div.assets tr[data-id]").forEach((el, index) => {
		
		if( dummy.inventory.includes(index) )
			el.classList.toggle("equipped", true);

		const defaultListener = el.linkedTableListener;	// Get the listener from HelperAsset
		el.onclick = event => {
			event.stopImmediatePropagation();
			
			// Toggle equipped
			if( event.shiftKey ){

				el.classList.toggle("equipped");

				// Add to array
				if( el.classList.contains("equipped") ){
					
					if( !Array.isArray(asset.inventory) )
						asset.inventory = [];
					asset.inventory.push(index);
					

				}
				else
					handleInventorySplice(index);

				modtools.setDirty(true);
				HelperAsset.rebuildAssetLists(DB);

				return;

			}
			
			if( event.ctrlKey || event.metaKey ){

				// Remove from Player.inventory as well
				handleInventorySplice(index);

				// Anything greater needs to be shifted down by 1 because we deleted an asset
				for( let i in asset.inventory ){
					if( asset.inventory[i] > index )
						--asset.inventory[i];
				}

			}

			// Do default
			if( defaultListener )
				defaultListener(event);


		};
	});

	HelperAsset.autoBind( this, asset, DB);

	

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name', 'description'], single);
}


// Listing
export function list(){



	const fields = {
		'*label' : true,
		'*name' : true,
		'*species' : true,
		'*description' : true,
		icon : true,
		icon_upperBody : true,
		icon_lowerBody : true,
		icon_nude : true,
		auto_learn : true,

		'*team' : true,
		size: true,
		'*level' : true,
		'*leveled' : true,
		
		remOnDeath : true,
		talkative : true,
		sadistic : true,
		dominant : true,
		hetero : true,
		intelligence : true,

		class : true,

		actions : true,
		assets : true,
		inventory : true,
		tags : true,
		passives : true,
		hpMulti : true,

	};

	for( let i in Action.Types )
		fields["sv"+Action.Types[i]] = true;
		

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, fields));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'player_'+Generic.generateUUID(),
		name : 'New Player',
		description : 'Describe your player here',
	}));

};

