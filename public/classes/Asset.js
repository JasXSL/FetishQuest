import Generic from './helpers/Generic.js';
import { Wrapper, Effect } from './EffectSys.js';
import Action from './Action.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import AssetTemplate from './templates/AssetTemplate.js';
import Player from './Player.js';
import Game from './Game.js';
import stdTag from '../libraries/stdTag.js';

export default class Asset extends Generic{
	
	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.icon = 'perspective-dice-six-faces-random';
		this.category = this.constructor.Categories.junk;
		this.name = "";
		this.description = "";
		this.slots = [];
		this.equipped = false;
		this.equip_conditions = [];
		this.tags = [];					// Prefixed with AS_, use getTags
		this.wrappers = [];				// Passive effects
		this.level = 1;
		this.durability_bonus = 0;
		this.durability = this.getMaxDurability();
		this.stacking = false;			// Setting this to true makes it non unique, but frees up space in your inventory
		
		this.charges = 0;				// Turns this item into a consumable. Use -1 for infinite
		this.use_action = null;			// Set to an Action along with charges above to enable use
		this.no_auto_consume = false;		// Prevents auto consume of charges
		this.rarity = this.constructor.Rarity.COMMON;
		this.loot_sound = '';				// Also equip and unequip sound. audioKit ID

		this.basevalue = 0;				// Store value in copper. 0 = no sell

		this.weight = 100;				// Weight in grams
		this._custom = false;			// Auto set when loaded from a custom library over a built in library
		this._stacks = 1;				// how many items this stack contains, requires stacking true
		this._charges = -1;				// How many charges remain. Setting to -1 will automatically set it to this.charges on load
		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			name : this.name,
			slots : this.slots,
			equipped : this.equipped,
			tags : this.tags,
			wrappers : this.wrappers.map(el => el.save(full)),
			label : this.label,
			description : this.description,
			level : this.level,
			durability_bonus : this.durability_bonus,
			durability : this.durability,
			weight : this.weight,
			charges : this.charges,
			use_action : this.use_action !== null ? this.use_action.save(full) : null,
			rarity : this.rarity,
			loot_sound : this.loot_sound,
			icon : this.icon,
			category : this.category,
			stacking : this.stacking,
			basevalue : this.basevalue,
			_stacks : this._stacks,
			_charges : this._charges,
		};

		if( full ){
			out.no_auto_consume = this.no_auto_consume;
		}

		if( full !== "mod" ){
			out.id = this.id;
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		this.wrappers = Wrapper.loadThese(this.wrappers, this);
		this.equip_conditions = Condition.loadThese(this.equip_conditions, this);
		this.use_action = Action.loadThis(this.use_action, this);
		if( this._charges === -1 )
			this._charges = this.charges;
	}

	clone(parent){

		let out = new this.constructor(this.save(true), parent);
		return out;

	}

	getName(){
		return this.name;
	}

	// Makes sure targets are setup properly for wrappers
	onEquip(){
		for( let wrapper of this.wrappers ){
			wrapper.caster = wrapper.victim = this.parent.id;
		}
	}

	// override for Generic gettags
	getTags(){

		if( !this.tags )
			return [];
		
		let pre = this.constructor.name.substr(0,2).toLowerCase();
		let out = [];
		for( let slot of this.slots ){
			if( typeof slot !== "string" )
				console.error("non-string slot detected in item", this);
			else{
				out.push(pre+'_'+slot.toLowerCase());
				for( let tag of this.tags ){
					out.push(tag.toLowerCase());
					out.push(tag.toLowerCase()+'_'+slot.toLowerCase());
				}
			}
		}
		return Array.from(new Set(out));

	}

	getMaxDurability(){
		return 10+this.durability_bonus;
	}

	equippable(){
		let verifyConds = Condition.all(this.equip_conditions, new Event({
			type : GameEvent.Types.none,
			sender : this.parent,
			target : this.parent,
			asset : this,
		}));
		return this.slots.length && verifyConds;
	}

	// Checks only if this is a consumable item
	isConsumable(){
		return (this._charges !== 0 || this.charges === -1) && Boolean(this.use_action);
	}

	isUsable(){
		return this.use_action && this.use_action.castable() && this.use_action.getViableTargets().length;
	}

	isDamageable(){
		return ~this.slots.indexOf(Asset.Slots.upperBody) || ~this.slots.indexOf(Asset.Slots.lowerBody);
	}

	isSellable(){
		return this.getSellCost() > 0;
	}
	getSellCost( shop ){
		if( this.basevalue < 1 )
			return 0;
		let out= this.basevalue/2;
		if( this.durability <= 0 )
			out = 1;
		else
			out *= (this.durability/this.getMaxDurability());
		out = Math.floor(out);
		if( out < 1 )
			out = 1;
		return Math.floor(out);
	}

	getRepairCost( smithPlayer ){
		const missingPoints = this.getMaxDurability()-this.durability;
		let cost = missingPoints*2*Math.pow(2, this.rarity);
		return Math.ceil(cost);
	}

	resetCharges(){
		this._charges = this.charges;
	}

	consumeCharges( charges=1 ){

		if( this.charges < 0 )
			return;
		
		for( let i =0; i<charges; ++i ){
			--this._charges;
			if( !this._charges ){
				this.parent.destroyAsset(this.id, 1);
				this.resetCharges();
			}
		}
	

	}

	// Returns true if the asset was destroyed
	damageDurability( sender, effect, amount, fText = false ){

		if( !this.isDamageable() )
			return;
		amount = parseInt(amount);
		if( isNaN(amount) )
			return false;
		let pre = this.durability;
		this.durability -= Math.floor(amount);
		if( this.durability <= 0 )
			this.durability = 0;

		let change = this.durability-pre;
		if( !change )
			return false;

		if( fText && change && this.parent instanceof Player )
			game.ui.floatingCombatText(change, this.parent, "armor");

		let txt = 'gained', cls = 'Mend';
		if( change < 0 ){
			txt = "lost";
			cls = "Damage";
		}
		game.ui.addText( this.parent.getColoredName()+"'s "+this.name+" "+txt+" "+Math.abs(change)+" durability.", undefined, this.parent.id, this.parent.id, 'statMessage cloth'+cls );

		if(pre > 0 && this.durability === 0 ){
			new GameEvent({
				type : GameEvent.Types.armorBroken,
				sender : sender,
				target : this.parent,
				action : effect.parent.parent,
				wrapper : effect.parent,
				effect : effect,
				asset : this
			}).raise();
			this.parent.onItemChange();
			game.playFxAudioKitById('armorBreak', sender, this.parent, undefined, true );
			game.ui.addText( this.parent.getColoredName()+"'s "+this.name+" broke!", undefined, this.parent.id, this.parent.id, 'statMessage important' );
			return true;
		}
		return false;
	}

	// returns a damage taken that can be added together with other armor. Goes up to Asset.protVal based on level/broken
	getDmgTakenAdd(){

		// only upperBody and lowerBody have this feature
		if( this.slots.indexOf(Asset.Slots.upperBody) === -1 && this.slots.indexOf(Asset.Slots.lowerBody) === -1 )
			return 0;

		// Item is broken, take 25% more damage
		if( this.durability <= 0 )
			return Asset.protVal;

		// Item is not in someone's inventory, this shouldn't be triggered, but return 0
		if( !(this.parent instanceof Player) )
			return 0;

		const player = this.parent;
		let levelDif = player.level-this.level;
		// Item is greater than player level or within 2 levels of the player
		if( levelDif <= 1 )
			return 0;
		
		// 5% more damage taken per level above 2 of the piece
		return Math.min(Asset.protVal, (levelDif-1)*0.05);
		
	}

	// Use whenever you're fetching an item from the library
	restore(){
		this.resetCharges();
		this.repair();
	}

	// Repairs the object. If points is a NaN value, it restores ALL durability points
	// Returns the amount of points gained
	repair( points ){

		let pre = this.durability;
		if( isNaN(points) )
			points = this.getMaxDurability();

		if( points < 0 )
			return 0;

		this.durability += points;
		if( this.durability > this.getMaxDurability() )
			this.durability = this.getMaxDurability();

		if( (pre === 0) != (this.durability !== 0) && this.parent && this.parent.onItemChange )
			this.parent.onItemChange();

		return this.durability-pre;

	}


	getRepairPointsFromUseAction( targetAsset, sender, target ){

		let wrappers = this.use_action.wrappers;
		let out = 0;
		for( let wrapper of wrappers ){
			let effects = wrapper.getEffects({
				type : Effect.Types.repair,
				targets : Wrapper.TARGET_AUTO,
				events : GameEvent.Types.internalWrapperTick
			});
			for( let effect of effects )
				out += effect.getRepairValue(targetAsset, sender,target);
		}
		return out;
	}

	randomizeDurability(){
		if( !this.isDamageable() )
			return;
		this.durability = 1+Math.floor(Math.random()*(this.getMaxDurability()-1));
	}

	getWeightReadable(){
		if( this.weight <= 10 )
			return 'Very Lightweight';
		else if( this.weight <= 100 )
			return 'Lightweight';
		else if( this.weight <= 1000 )
			return 'Fairly Lightweight';
		else if( this.weight <= 5000 )
			return 'Moderately Heavy';
		else if( this.weight <= 10000 )
			return 'Heavy';
		return 'Very Heavy';	
	}

	
	// Makes sure the asset is up to date
	// Called when added to a player's inventory or when a player is placed in world
	onPlacedInWorld(){
		if( this.level === -1 ){
			if( this.parent instanceof Player )
				this.level = this.parent.level;
			else
				this.level = game.getAveragePlayerLevel();
		}
	}

	// Gets tooltip text for UI
	getTooltipText(){
		
		const isConsumable = this.isConsumable(),
			isBreakable = ~this.slots.indexOf(Asset.Slots.upperBody) || ~this.slots.indexOf(Asset.Slots.lowerBody)
		;
		let html = '';
		// Usable items shows the action tooltip instead
		if( isConsumable )
			return this.use_action.getTooltipText(0, this.rarity);

		let apCost = this.equipped ? Game.UNEQUIP_COST : Game.EQUIP_COST;
		let dmgTaken = this.getDmgTakenAdd();

		html += '<strong class="'+(Asset.RarityNames[this.rarity])+'">'+esc(this.name)+'</strong><br />';
		if( dmgTaken && isBreakable ){
			if( this.durability )
				html += '<em style="color:#FAA">Low level item, '+Math.round((Asset.protVal-dmgTaken)*100)+'% damage reduction</em><br />';
			else
				html += '<em style="color:#FAA">Broken!</em><br />';
		}
		html += '<em class="sub">';
		if( game.battle_active && this.parent )
			html += '[<span style="color:'+(this.parent.ap >= apCost ? '#DFD' : '#FDD')+'">'+
				apCost+' AP to '+(this.equipped ? 'take off' : 'equip')+
			'</span>]<br />';

		if( this.equippable() )
			html += 'Lv '+(+this.level)+' | '+(+this.durability)+'/'+this.getMaxDurability()+' Durability | ';
		html += this.getWeightReadable()+' ';
		if( this.equippable() ){
			html += '| ';
			if(this.slots.length && !this.equipped)
				html+= '<strong>'+this.slots.map(el => el.toUpperCase()).join(' + ')+'</strong>';
			else if(this.slots.length)
				html+= 'Equipped <strong>'+this.slots.map(el => el.toUpperCase()).join(' + ')+'</strong>';
		}
		html += '</em><br />';

		html += esc(this.description);

		return html;
	}
	
}

Asset.protVal = 0.20;	// Max damage taken increase for not having this item equipped (lower/upperBody only)

// Automatically creates a stat wrapper
// Level is the level of the item, numSlots is how many item slots it covers
Asset.generateStatWrapper = function( level, numSlots, bonusStats, rarity = 0 ){

	if( level <= 0 ){
		return new Wrapper({
			name : 'statsAutoGen',
			detrimental : false,
			effects : []
		});
	}

	if( isNaN(bonusStats) )
		bonusStats = 0;

	let statPoints = rarity+bonusStats;
	statPoints *= numSlots;

	// Separate the stats into proficiency and primary
	let secondaryStats = Math.round(Math.random()*statPoints),
		primaryStats = statPoints-secondaryStats;
	
	// Get viable effects for secondary stats
	let viableEffects = [];
	for( let type in Action.Types )
		viableEffects.push('sv'+Action.Types[type], 'bon'+Action.Types[type]);

	shuffle(viableEffects);
	let selectedEffects = [];
	// Bunch them together so that the points get placed in max 3 seconary stats.
	for(let i =0; i<secondaryStats && i<3; ++i)
		selectedEffects.push(viableEffects[i]);

	// Randomize the points into the above 3 stats
	let selectedEffectNumbers = selectedEffects.map(() => 0);
	for( let i=0; i <secondaryStats; ++i){
		let r = Math.floor(Math.random()*selectedEffects.length);
		++selectedEffectNumbers[r];
	}
	
	// Add the effects
	let effects = [];
	for( let i =0; i<selectedEffectNumbers.length; ++i){
		if( selectedEffectNumbers[i] )
			effects.push(Effect.createStatBonus(selectedEffects[i], selectedEffectNumbers[i]));
	}


	// Generate the primary stats
	let pKeys = Object.keys(Player.primaryStats), stats = pKeys.map(() => 0);
	for( let i = 0; i< primaryStats; ++i)
		++stats[Math.floor(Math.random()*statPoints)];
	for( let i = 0; i<pKeys.length; ++i ){
		if( stats[i] )
			effects.push(Effect.createStatBonus(pKeys[i]+'Modifier', stats[i]));
	}
	
	return new Wrapper({
		duration : -1,
		name : 'statsAutoGen',
		detrimental : false,
		effects : effects,
		stay_conditions : [],
		add_conditions : []
	});

};

// Generates a custom item based on a slot
Asset.generate = function( slot, level, viable_asset_templates, viable_asset_materials, rarity, minRarity = 0 ){

	if( level === undefined )
		level = game.getAveragePlayerLevel();
	if( isNaN(level) ){
		console.error("Invalid level in randomizer "+String(level));
		return false;
	}
	level = Math.max(1,level);

	if( slot )
		slot = Asset.Slots[slot];

	if( isNaN(rarity) )
		rarity = Asset.rollRarity(minRarity);

	// Pick a random template
	let template = AssetTemplate.generateOutput( slot, level, viable_asset_templates, viable_asset_materials );
	if( !template ){
		//console.error("Unable to generate a viable template from", viable_asset_templates, viable_asset_materials);
		return false;
	}
	
	// Additional bonus stats
	let weightModifier = Math.random() < 0.2 ? 0.5 : 1,			// Fitted
		durabilityModifier = Math.random() < 0.2 ? 1.5 : 1		// Mastercrafted
	;

	let out = new Asset({
		category : this.Categories.armor,
		icon : template.icon,
		level : level,
		label : this.prototype.g_guid().substr(0,16),
		name : ucFirst(template.name.trim()),
		tags : template.tags,
		slots : template.slots,
		weight : template.weight*weightModifier,
		durability_bonus : Math.round(template.durability_bonus*durabilityModifier*template.slots.length),
		description : template.description,
		rarity : rarity,
		basevalue : Math.round(
			Math.pow(1.25, level)+template.slots.length*10+(20*Math.pow(3,rarity))+Math.round(template.weight*weightModifier/100)
		)
	});


	let addEffectToWrapper = function( wr, stype, snr ){
		for( let effect of wr.effects ){
			if( effect.type === stype ){
				effect.data.amount += snr;
				return;
			}
		}
		// Not found
		wr.effects.push(Effect.createStatBonus(stype, snr));
	};
	let wrapper = Asset.generateStatWrapper( level, template.slots.length, template.stat_bonus, rarity );
	for( let i in template.bonStats )
		addEffectToWrapper(wrapper, i, template.bonStats[i]);
	for( let i in template.svStats )
		addEffectToWrapper(wrapper, i, template.svStats[i]);
	for( let i in template.primaryStats )
		addEffectToWrapper(wrapper, i+'Modifier', template.primaryStats[i]);

	// Generate the description
	wrapper.effects.sort((a, b) => {
		let an = this.stringifyStat(a.type),
			bn = this.stringifyStat(b.type)
		;
		if( an.substr(3,1) === '.' && bn.substr(3,1) !== '.' )
			return 1;
		if( an.substr(3,1) !== '.' && bn.substr(3,1) === '.' )
			return -1;
		return an < bn ? -1 : 1 ;
	});
	let allStats = [];
	for( let effect of wrapper.effects )
		allStats.push((effect.data.amount > 0 ? "+" : '')+effect.data.amount+" "+this.stringifyStat(effect.type));
		
	out.description += "\n"+allStats.join(', ');
	let additionalDesc = [];
	if( weightModifier < 1 )
		additionalDesc.push("FITTED");
	if( durabilityModifier > 1 )
		additionalDesc.push("MASTERCRAFTED");
	if( additionalDesc.length )
		out.description += "\n"+additionalDesc.join(', ');

	out.wrappers = [wrapper];

	out.loot_sound = 'lootCloth';
	if( out.hasTag(stdTag.asPlate) )
		out.loot_sound = 'lootPlate';
	else if( out.hasTag(stdTag.asMail) )
		out.loot_sound = 'lootMail';
	else if( out.hasTag(stdTag.asLeather) )
		out.loot_sound = 'lootLeather';

	out.repair();
	return out;

};

// Stringifies a stat like svElemental etc into a more readable format. Also supports primary stats such as staminaModifier
Asset.stringifyStat = function( stat ){

	if( stat.substr(0,2) === 'sv' )
		return 'Res.'+stat.substr(2);
	if( stat.substr(0,3) === 'bon' )
		return 'Pro.'+stat.substr(3);
	if( stat.endsWith('Modifier') )
		return ucFirst(stat.substr(0,3));
	
	return stat;

};

// Returns an asset from input by asset rarity
Asset.getRandomByRarity = function( input = [] ){

	if( !input.length )
		return false;
	return weightedRand( input, asset => {
		return 100/Math.pow(4, asset.rarity);
	});


};

// Returns a rarity based on percentage
Asset.rollRarity = function( offset = 0 ){
	let total = 0;
	let rarities = shuffle(Object.values(Asset.Rarity).filter(n => n >= offset));
	for( let rarity of rarities )
		total += 100/Math.pow(3, rarity);
	let rand = Math.random()*total;
	let out = 0;
	for( let rarity of rarities ){
		let n = 100/Math.pow(3, rarity);
		out += n;
		if( rand <= out )
			return rarity;
	}
	return offset;
};

Asset.Slots = {
	none : "",
	upperBody : "upperBody",
	lowerBody : "lowerBody",
	trinket : "trinket",
	hands : "hands",
	action : "action",			// Goes into an action slot
};

Asset.Rarity = {
	COMMON : 0,
	UNCOMMON : 1,
	RARE : 2,
	EPIC : 3,
	LEGENDARY :4
};

Asset.RarityColors = [
	"#FFF",
	"#DFD",
	"#DEF",
	"#FDF",
	"#FFD",
];

Asset.RarityNames = [
	"common",
	"uncommon",
	"rare",
	"epic",
	"legendary"
];

Asset.Categories = {
	junk : 'junk',
	armor : 'armor',
	handheld : 'handheld',
	consumable : 'consumable',
	food : 'food',
	reagent : 'reagent',
	tool : 'tool',
	currency : 'currency',
};

Asset.CategoriesNames = {
	[Asset.Categories.junk] : 'Junk',
	[Asset.Categories.armor] : 'Armor',
	[Asset.Categories.handheld] : 'Handheld',
	[Asset.Categories.consumable] : 'Consumable',
	[Asset.Categories.food] : 'Food',
	[Asset.Categories.tool] : 'Tools',
	[Asset.Categories.reagent] : 'Reagent',
	[Asset.Categories.currency] : 'Currency',
};


// These are IDs that can be used which lets you transform this asset into a different one based on the label.
// You can't use these labels in asset templates
// Overwrites are fields that are overwritten in the transform
Asset.Dummies = {
	label : "__LABEL__",			// Use this and set label to polymorph into a clone of that object. 
									// Uses: name -> ID of library asset you want to polymorph this into
									// Overwrites: _stacks
	autoloot : "__AUTOLOOT__",		// (todo) Automatically generates a lootable item.
									// Overwrites: (none atm)

};

// Converts an asset if it's a dummy
Asset.convertDummy = function( asset, parent ){

	if( asset.label === Asset.Dummies.label ){

		const converted = glib.get(asset.name, 'Asset').clone(parent);
		if( !converted ){
			console.error("Asset conversion failed for dummy asset", asset);
			return;
		}
		converted._stacks = asset._stacks;
		converted.g_resetID();
		return converted;
	}

	if( asset.label === Asset.Dummies.autoloot ){
		console.error("Todo: auto generate a piece of loot");
		return;
	}

	// not a dummy, return what it was
	return asset;

};
