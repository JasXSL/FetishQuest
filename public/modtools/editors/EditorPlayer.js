import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Action from '../../classes/Action.js';
import Player from '../../classes/Player.js';
import * as EditorPlayerClass from './EditorPlayerClass.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorAction from './EditorAction.js';
import * as EditorRoleplay from './EditorRoleplay.js';
import * as EditorPlayerIconState from './EditorPlayerIconState.js';
import Generic from '../../classes/helpers/Generic.js';
import PlayerIconState from '../../classes/PlayerIconState.js';

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
		html += '<label title="If all images (including advanced) share the same path, you can set it here to save time. Ex if all your art URLs start with https://i.ibb.co/ then you put that here and you can skip that part in the art fields.">'+
			'Image base path: <input type="text" name="icon_base" class="saveable" value="'+esc(dummy.icon_base)+'" />'+
		'</label>'; 
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

	html += 'Advanced icon states: <div class="istates"></div>';
	html += '<div class="labelFlex">'+
			'<label>Import JSON <input type="file" class="importAdvancedIcons" accept=".json" /> Replace ALL: <input type="checkbox" class="replaceAll" /></label>'+
			'<label><input type="button" value="Export JSON" class="exportAdvancedIcons" /></label>'+
		'</div>'
	;

	html += 'PlayerClass: <div class="class"></div>';
	html += 'Tags: <div name="tags">'+HelperTags.build(dummy.tags)+'</div>';
	html += 'Actions: <div class="actions"></div>';
	html += 'Assets (press shift to equip): <div class="assets"></div>';
	html += 'Passives: <div class="passives"></div>';
	html += 'Follower RP: <div title="If this is a follower, set their roleplay here" class="follower"></div>';
	
	

	this.setDom(html);



	this.dom.querySelector("div.istates").appendChild(EditorPlayerIconState.assetTable(this, asset, "istates"));
	this.dom.querySelector("div.class").appendChild(EditorPlayerClass.assetTable(this, asset, "class", true));
	this.dom.querySelector("div.actions").appendChild(EditorAction.assetTable(this, asset, "actions"));
	this.dom.querySelector("div.assets").appendChild(EditorAsset.assetTable(this, asset, "assets", false));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.follower").appendChild(EditorRoleplay.assetTable(this, asset, "follower", true));
	
	this.dom.querySelector("input.importAdvancedIcons").onchange = event => {

		if( !event.target.files.length )
			return;
		const reader = new FileReader();
		reader.onload = rEvt => {

			event.target.value = "";

			const data = JSON.parse(rEvt.target.result);

			if( !Array.isArray(data) )
				throw 'Invalid JSON data. Not an array.';
			
			if( this.dom.querySelector("input.replaceAll").checked ){
				
				for( let istate of asset.istates ) {
					window.mod.mod.deleteAsset('playerIconStates', istate);
				}
				asset.istates = [];

			}

			if( !Array.isArray(asset.istates) )
				asset.istates = [];

			const replaceIntoIstates = istate => {

				if( !isNaN(istate.opacity) )
					istate.opacity = Math.round(istate.opacity*100)/100;
				const out = istate.save("mod");
				out._mParent = {type : DB, label : asset.label};
				window.mod.mod.mergeAsset("playerIconStates", out);
				if( !asset.istates.includes(istate.id) )
					asset.istates.push(istate.id);
				window.mod.setDirty(true);

			}

			for( let istate of data )
				replaceIntoIstates(new PlayerIconState(istate));


			this.dom.querySelector("div.istates").replaceChildren(EditorPlayerIconState.assetTable(this, asset, "istates"));



		};
		reader.readAsText(event.target.files[0]);

	};

	this.dom.querySelector("input.exportAdvancedIcons").onclick = () => {

		if( !Array.isArray(asset.istates) || !asset.istates.length )
			return;
		const out = asset.istates.map(el => mod.mod.getAssetById('playerIconStates', el)).filter(el => Boolean(el));
		const blob = new Blob([JSON.stringify(out, null, 4)], { type: "text/json" });
		const link = document.createElement("a");

		link.download = asset.label+".json";
		link.href = window.URL.createObjectURL(blob);
		link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

		const evt = new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: true,
		});

		link.dispatchEvent(evt);
		link.remove();

	};

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

// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Player:</h3>'+
		'<p>A player is an NPC or player character with fixed settings. Useful for NPCs or playable characters linked in Gallery. If you want to create random NPCs for random encounters, use a Player Template instead.</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Label</td>'+
			'<td>Unique ID for your character. DO NOT CHANGE AFTER SETTING UP.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Name</td>'+
			'<td>Name of your character.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Species Article</td>'+
			'<td>a/an depending on your species. Can be left blank to auto generate. Only needed for species that don\'t fit the rule of "a followed by a consonant, an followed by vowel". Ex: Unicorn, which should be "a unicorn", even though it starts with a vowel.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Species</td>'+
			'<td>Species of the character.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Voice</td>'+
			'<td>Currently not used, but can be used with Audio Triggers.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Pronoun he/him/his</td>'+
			'<td>Can be left empty and the game will guess based on character genitals. But this overrides it should you want to for any reason.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Dressed</td>'+
			'<td>URL to the character wearing full clothing. If your character should not be strippable (such as friendly NPCs), you only need this one. Note: Players and followers usually face right. NPCs and enemies usually face left.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Upper Body Armor</td>'+
			'<td>URL to the character wearing only upper body armor, bottomless basically.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Lower Body Armor</td>'+
			'<td>URL to the character wearing lower body armor. Topless basically.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Nude</td>'+
			'<td>URL to the character wearing no clothing.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Image Base Path</td>'+
			'<td>If all images (including advanced) share the same path, you can set it here to save time. Ex if all your art URLs start with https://i.ibb.co/ then you put that here and you can skip that part in the art fields.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>RP Portrait</td>'+
			'<td>URL to a small headshot of the character to be used in RPs, preferably facing right. Not required, but recommended if the character should ever be used in an RP (dialogue).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Art is AI generated</td>'+
			'<td>Marks the character art as AI generated. Not required, but a courtesy.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Team</td>'+
			'<td>Team of character. In general, team 0 is used for characters on the left (players/followers), and team 1 for enemies and NPCs. You can add multiple teams if you want to NPCs to be able to fight each other.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Size</td>'+
			'<td>Size of character. Where 0 would be something like a gnome, and 10 would be a giant. Average human is 5-6. It\'s not hugely important, but some abilities require shorter or taller targets.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Level</td>'+
			'<td>Level of player.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Level is offset from party</td>'+
			'<td>When checked, the character\'s level becomes an offset from the party average, so 1 becomes (party_average_level+1). Useful for enemies that should level with the party.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Power</td>'+
			'<td>Multiplied against all stats. So a power of 2 would be "as strong as 2 characters", and 0.5 would be "as strong as half a character". Generally you should leave this at 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>HP Multiplier</td>'+
			'<td>Multiplies against character base HP. Can be useful for bosses to give them more HP. This is also multiplied against power.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Armor</td>'+
			'<td>Used primarily for beasts, since humanoids get their armor from wearing clothes. Higher armor reduces damage taken by that amount. So 0.4 would reduce damage taken by 40%. Tentacrabs use 0.4, whereas squishier enemies like cocktopus has only 0.15</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Talkative</td>'+
			'<td>Chance of character talking if it finds viable optional chat texts when doing actions, between 0 and 1. If you want a character to run their mouth a lot, you\'d set this to 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Sadistic</td>'+
			'<td>How sadistic the character is. Mostly used for RP purposes. Between 0 and 1.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Dominant</td>'+
			'<td>How dominant your character is. Mostly used for RP purposes. Between 0 (submissive) and 1 (dominant).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Hetero</td>'+
			'<td>How hetero your character is. Plays a small roll in humanoid enemies picking targets. Between 0 (gay) and 1 (hetero). Use 0.5 for completely bisexual.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Emotive</td>'+
			'<td>Not used in the main game yet, but it affects the chance of Audio Triggers. Between 0 (no chance) and 1 (always).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Intelligence</td>'+
			'<td>Mostly used for RP currently, but may be used in the future for NPC AI complexity. Between 0 (worm) and 1 (godlike). Humanoid intelligence generally spans from 0.4 (idiot) to 0.6 (genius). Average human intelligence would be somewhere between 0.5 to 0.55.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Ignore spell slots</td>'+
			'<td>Use on NPCs to have them be able to use ALL their actions instead of using the action slots system. Do not use on player characters.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Remove on death</td>'+
			'<td>Deletes the character when it dies. Mainly used for minions summoned by bosses.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Stats</td>'+
			'<td>Leave everything at 0 for playable characters. For NPCs this allows you fine tune their proficiencies and avoidances.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Description</td>'+
			'<td>Describe your character.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Secret information</td>'+
			'<td>Information that is revealed when you use clairvoyance.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Advanced icon states</td>'+
			'<td>Lets you add additional character images, including colorable armor and facial expressions. If multiple states are valid on the same layer at the same time, the first one gets priority. When I made the test fox character I used the following order (all sharing the appropriate layers):<br/>'+
				'<ol>'+
					'<li>Sling Bikinis, using the material type and sling bikini conditions</li>'+
					'<li>Bodysuits, using the bodysuit and material type conditions</li>'+
					'<li>Cloth Bikini, using material, bikini, and briefs conditions for the relevant slots</li>'+
					'<li>Shirt / Panties, using the cloth conditions for the relevant slots</li>'+
					'<li>Breast / Crotchplate, using the hard conditions for the relevant slots</li>'+
					'<li>Leather Bikini, using only the targetWearsUpperBody and targetWearsLowerBody conditions as a fallback.</li>'+
				'</ol>'+
			'</td>'+
		'</tr>'+
		'<tr>'+
			'<td>PlayerClass</td>'+
			'<td>Player class of character. Can be left empty.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Tags</td>'+
			'<td>Tag your character. Make sure to use pl_beast if your character isn\'t a humanoid. pl_target_beast can be used instead for humanoid-ish enemies like skeletons. They\'ll be treated as humanoids when attacking, but as beasts when targeted.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Actions</td>'+
			'<td>Actions the character should know</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Assets</td>'+
			'<td>Assets the character should have in its inventory. Shift click to equip the item (if equippable).</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Passives</td>'+
			'<td>Passive wrappers that the character should always be affected by.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Follower RP</td>'+
			'<td>The follower system is still being developed. More info on this later.</td>'+
		'</tr>'
	;
		

	out += '</table>';

	

	return out;

};

