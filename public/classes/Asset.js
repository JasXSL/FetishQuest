import Generic from './helpers/Generic.js';
import { Wrapper, Effect } from './EffectSys.js';
import Action from './Action.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import AssetTemplate from './templates/AssetTemplate.js';
import Player from './Player.js';
import Game from './Game.js';
import stdTag from '../libraries/stdTag.js';
import GameAction from './GameAction.js';

export default class Asset extends Generic{
	
	// Dyable colors. Custom colors and material colors are available.
	static COLORS = {
		none : '',
		white : "#FFFFFF",
		black : "#000000",
		grey : "#999999",
		yellow : "#FFFF00",
		orange : "#FF9900",
		lime : "#99FF00",
		green : "#00FF00",
		cyan : "#00FFFF",
		blue : "#0000FF",
		purple : "#9900FF",
		pink : "#FF00FF",
		red : "#FF0000",
	};

	// Map the relational asset types
	static getRelations(){ 
		return {
			equip_conditions : Condition,
			wrappers : Wrapper,
			use_action : Action,
			game_actions : GameAction,
			actives : Wrapper,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.dummy = '';	// use Asset.Dummies.x to set this as a dummy object. See Asset.Dummies for more info.
		this.icon = 'perspective-dice-six-faces-random';
		this.category = this.constructor.Categories.junk;
		this.name = "";
		this.shortname = "";
		this.snpre = "";				// Whether A/AN/SOME should be prefixed before the shortname in ?definite? form. If not set, it tries to automatically assume a/an based on the initial character
		this.description = "";
		this.slots = [];
		this.equipped = false;
		this.equip_conditions = [];		// Todo: Implement this?
		this.tags = [];					// Prefixed with AS_, use getTags
		this.wrappers = [];				// Passive effects
		this.actives = [];				// Active wrappers with timers etc
		this.level = 1;
		this.durability_bonus = 0;
		this.durability = this.getMaxDurability();
		this.stacking = false;			// Setting this to true makes it non unique, but frees up space in your inventory
		this.colorable = false;			// Can be recolored (Todo)
		this.color_tag = '';
		this.color_tag_base = '';		// Base color name
		this.color = "#FFFFFF";		// Currently dyed color
		this.color_base = "#FFFFFF";		// Base color of the item
		this.hit_sound = '';			// Hit sound from punch etc attacks. You can use commas to pick one at random
		this.fitted = false;			// Use half the weight
		this.mastercrafted = false;		// Use twice the durability

		this.charges = 0;				// Turns this item into a consumable. Use -1 for infinite
		this.use_action = null;			// Set to an Action along with charges above to enable use
		this.no_auto_consume = false;		// Prevents auto consume of charges
		this.game_actions = [];			// Can only be used from inventory. Uses the description of the game action as a label in the context menu.
		this.rarity = this.constructor.Rarity.COMMON;
		this.loot_sound = '';				// Also equip and unequip sound. audioKit ID
		this.soulbound = false;			// Prevent stealing and trading
		this.basevalue = 0;				// Store value in copper. 0 = no sell
		this.expires = 0;				// Lets an item expire, deleting it after time has passed in game.
		this.rem_unequip = false;		// Remove this on unequip
		this.indestructible = false;	// This item is indestructible
		this.inBank = false;			// This item is in the bank

		this.weight = 100;				// Weight in grams
		this._custom = false;			// Auto set when loaded from a custom library over a built in library
		this._stacks = 1;				// how many items this stack contains, requires stacking true
		this._charges = -1;				// How many charges remain. Setting to -1 will automatically set it to this.charges on load
		this._created = 0;				// Time when this was acquired
		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let ua = this.use_action;
		if( ua && ua.save )
			ua = Action.saveThis(ua, full);

		let out = {
			name : this.name,
			slots : this.slots,
			equipped : this.equipped,
			tags : this.tags,
			wrappers : Wrapper.saveThese(this.wrappers, full),
			label : this.label,
			description : this.description,
			level : this.level,
			durability_bonus : this.durability_bonus,
			durability : this.durability,
			weight : this.weight,
			charges : this.charges,
			use_action : ua,
			rarity : this.rarity,
			loot_sound : this.loot_sound,
			icon : this.icon,
			category : this.category,
			stacking : this.stacking,
			basevalue : this.basevalue,
			_stacks : this._stacks,
			_charges : this._charges,
			soulbound : this.soulbound,
			shortname : this.shortname,
			expires : this.expires,
			rem_unequip : this.rem_unequip,
			colorable : this.colorable,
			color : this.color,
			color_base : this.color_base,
			color_tag : this.color_tag,
			color_tag_base : this.color_tag_base,
			hit_sound : this.hit_sound,
			snpre : this.snpre, 
			game_actions: GameAction.saveThese(this.game_actions, full),
			fitted : this.fitted,
			mastercrafted : this.mastercrafted,
			actives : Wrapper.saveThese(this.actives, full),
			indestructible : this.indestructible,
			inBank : this.inBank
		};


		if( full ){
			out.dummy = this.dummy;
			out.no_auto_consume = this.no_auto_consume;
		}

		if( full !== "mod" ){
			out.id = this.id;
			out._created = this._created;
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	onBattleEnd(){
	}


	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super
		
		if( this._charges === -1 )
			this._charges = this.charges;
			
	}

	clone(parent){

		let out = new this.constructor(Asset.saveThis(this, true), parent);
		return out;

	}

	getName(){
		return this.name;
	}

	getShortName(){
		if( !this.shortname )
			return this.getName();
		return this.shortname;
	}

	getArticle(){

		if( this.snpre ){

			if( this.snpre === 'some' )
				return '';
			return this.snpre;
			
		}
		return 'aeiou'.includes(this.shortname.charAt(0).toLowerCase()) ? 'an' : 'a';

	}

	getUseActionById( id ){

		for( let action of this.game_actions ){

			if( action.id === id )
				return action;

		}

	}

	// Makes sure targets are setup properly for wrappers
	onEquip(){
		for( let wrapper of this.wrappers ){
			wrapper.caster = wrapper.victim = this.parent.id;
		}
	}

	onTimePassed(){

		if( this.expires && game.time-this._created > this.expires && this.parent instanceof Player ){

			if( this.equipped )
				game.ui.addText( this.parent.getColoredName()+"'s "+this.name+" fades away!", undefined, this.parent.id, this.parent.id, 'statMessage important' );

			this.parent.destroyAsset(this.id);

		}
	}

	// override for Generic gettags
	getTags(){

		if( !this.tags )
			return [];
		
		const pre = "as"; // Prefix for tags
		let out = [];
		for( let slot of this.slots ){


			if( typeof slot !== "string" )
				console.error("non-string slot detected in item", this);
			else{
				
				out.push(pre+'_'+slot);
				const color = this.getColorTag();
				if( color )
					out.push('as_'+slot+'_'+color);
				for( let t of this.tags ){
					out.push(t);
					out.push(t+'_'+slot);
				}

			}

		}
		return Array.from(new Set(out));

	}

	getMaxDurability(){
		return Math.ceil(10+this.durability_bonus) * (this.mastercrafted ? 2 : 1);
	}

	equippable(){

		let verifyConds = Condition.all(this.equip_conditions, new GameEvent({
			type : GameEvent.Types.none,
			sender : this.parent,
			target : this.parent,
			asset : this,
			dungeon : game.dungeon,
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

		if( this.indestructible )
			return false;

		const dmgSlots = [
			Asset.Slots.upperBody,
			Asset.Slots.upperBodyCosmetic,
			Asset.Slots.lowerBody,
			Asset.Slots.lowerBodyCosmetic,
			Asset.Slots.jewelleryCosmetic,
		];
		for( let slot of dmgSlots ){

			if( this.slots.includes(slot) )
				return true;

		}
		return false;

	}

	isSellable(){
		return this.getSellCost() > 0;
	}
	// Note: shop might not always be present
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

	// Returns true if the asset was destroyed. false if no damage was given, undefined if damaged but not destroyed
	damageDurability( sender, effect, amount, fText = false ){

		if( !this.isDamageable() )
			return false;

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
		
	}

	// Returns points of armor based on Asset.defaultArmorPoints
	getArmorPoints(){

		// Non-damageable shouldn't draw
		if( !this.isDamageable() )
			return 0;

		// Item is broken, provide no protection
		if( this.durability <= 0 )
			return 0;

		// Item is not in someone's inventory, this shouldn't happen triggered, but be a catch here regardless and return 0
		if( !(this.parent instanceof Player) )
			return 0;

		const player = this.parent;
		let levelDif = Math.max(0, player.level-1-this.level);

		// Returns a value between Asset.defaultArmorPoints and 0
		return Math.max(Asset.defaultArmorPoints-levelDif*5, 0);
		
	}

	isLowLevel(){

		let player = game.getMyActivePlayer();
		if( !player )
			return false;
		return player.level-1-this.level > 0;

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

	getWeight(){
		return Math.floor(this.weight * (this.fitted ? 0.5 : 1));
	}

	getWeightReadable(){
		if( this.getWeight() <= 10 )
			return 'Very Lightweight';
		else if( this.getWeight() <= 100 )
			return 'Lightweight';
		else if( this.getWeight() <= 1000 )
			return 'Fairly Lightweight';
		else if( this.getWeight() <= 5000 )
			return 'Moderately Heavy';
		else if( this.getWeight() <= 10000 )
			return 'Heavy';
		return 'Very Heavy';	
	}

	
	// Makes sure the asset is up to date
	// Called when added to a player's inventory or when a player is placed in world
	onPlacedInWorld(){

		if( !this._created )
			this._created = game.time;

		if( this.level === -1 ){

			if( this.parent instanceof Player )
				this.level = this.parent.level;
			else
				this.level = game.getAveragePlayerLevel();

		}

	}

	getColorTag(){
		if( this.color_tag )
			return this.color_tag;
		return this.color_tag_base;
	}
	getColor(){
		if( this.color_tag )
			return this.color;
		return this.color_base;
	}
	

	// Creates a tooltip img element
	async getImgElement(){

		if( !this._icon ){

			let data = Asset.imageCache[this.icon];
			if( !data ){

				if( !this.icon )
					data = document.createElement('svg');
				else{

					data = await fetch('media/wrapper_icons/'+this.icon+'.svg');
					data = await data.text();

					const template = document.createElement('template');
					template.innerHTML = data;

					data = template.content.childNodes[0];	// Store raw SVG

				}

				data.style = '';
				data.classList.add('assetIcon');

				Asset.imageCache[this.icon] = data;	// Store it in cache

			}
			
			this._icon = data.cloneNode(true);	// Clone a special one just for this asset
			
		}

		// Only recolor on change
		const color = this.getColor();
		if( color !== this._icon._color ){
		
			for( let i =0; i< this._icon.children.length; ++i )
				this._icon.children[i].setAttribute('fill', color);

		}
		this._icon._color = color;

		return this._icon.cloneNode(true);	// Clone is needed because a DOM element can only live in one place at a time

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


		html += '<strong class="'+(Asset.RarityNames[this.rarity])+'">'+esc(this.name)+'</strong><br />';
		// Low level indicator (only affects upper/lowerbody since they're the only ones that give protection
		if( 
			this.isLowLevel() && 
			(this.slots.includes(Asset.Slots.upperBody) || this.slots.includes(Asset.Slots.lowerBody)) 
		){

			if( this.durability )
				html += '<em style="color:#FAA">Low level, armor reduced</em><br />';
			else
				html += '<em style="color:#FAA">Broken!</em><br />';

		}
		
		html += '<em class="sub">';
		if( game.battle_active && this.parent )
			html += '[<span style="color:'+(this.parent.ap >= apCost ? '#DFD' : '#FDD')+'">'+
				apCost+' AP to '+(this.equipped ? 'take off' : 'equip')+
			'</span>]<br />';

		if( this.equippable() ){

			let lv = parseInt(this.level) || 0;
			if( lv < 0 )
				lv = game.getAveragePlayerLevel()+Math.abs(lv)-1;
			
			html += 'Lv '+lv+' | ';
			
			if( this.isDamageable() )
				html += (+this.durability)+'/'+this.getMaxDurability()+' Durability | ';

		}
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

		html += '<div class="assetWrappers">';
		for( let wrapper of this.wrappers ){
			if( wrapper.description ){
				
				let color = '#FAA';
				if( wrapper.rarity > 0 )
					color = Asset.RarityColors[wrapper.rarity];

				html += '<br /><span style="color:'+color+'">'+esc(wrapper.description)+'</span>';

			}
		}
		html += '</div>';

		return html;
	}

	// Takes an item's appearance and adds it onto this
	transmogrifyFrom( asset ){

		if( !(asset instanceof Asset) )
			throw 'Invalid asset passed to transmog';

		
		this.icon = asset.icon;
		this.name = asset.name;
		this.shortname = asset.shortname;
		this.snpre = asset.snpre;
		this.description = asset.description;
		this.tags = asset.tags.slice();					// Prefixed with AS_, use getTags
		this.colorable = asset.colorable;			// Can be recolored (Todo)
		this.color_tag = asset.color_tag;
		this.color_tag_base = asset.color_tag_base;		// Base color name
		this.color = asset.color;		// Currently dyed color
		this.color_base = asset.color_base;		// Base color of the item
		this.hit_sound = asset.hit_sound;			// Hit sound from punch etc attacks. You can use commas to pick one at random
		this.loot_sound = asset.loot_sound;				// Also equip and unequip sound. audioKit ID
		this._icon = null;

	}

	checkTransmogViability( asset ){

		if( asset.id === this.id )
			return false;

		if( asset.slots.length !== this.slots.length )
			return false;

		if( !asset.equippable() || !this.equippable() )
			return false;

		if( asset.soulbound )
			return false;

		// Make sure it has the same slots
		for( let slot of this.slots ){
			if( !asset.slots.includes(slot) )
				return false;
		}

		return true;

	}

	getEnchants(){
		return this.wrappers.filter(wr => wr.hasTag(stdTag.wrEnchant));
	}

	updateStatsAutoGen(){
		
		const statNames = Object.values(Action.Types);
		const hasStat = type => {
			for( let n of statNames ){
				if( type === 'sv'+n || type === 'bon'+n )
					return true;
			}
		};
		let stats = {};	// Type:val
		let names;	// wrapper containing the description
		for( let wrapper of this.wrappers ){

			if( wrapper.name === 'statsAutoGen' )
				names = wrapper;

			if( wrapper.name === 'statsEnchant' ){
				
				for( let effect of wrapper.effects ){

					if( hasStat(effect.type) ){

						if( !stats[effect.type] )
							stats[effect.type] = 0;
						stats[effect.type] += parseInt(effect.data.amount);

					}

				}

			}

		}

		if( !Object.keys(stats).length )
			return;

		if( !names ){
			// Create a wrapper to store the unified stat texts
			names = new Wrapper({
				name : 'statsAutoGen',
				detrimental : false,
				effects : [],
				rarity : 1
			});
			this.wrappers.unshift(names);
		}

		let rows = [];
		for( let type in stats ){
			
			let val = parseInt(stats[type]);
			if( !val )
				continue;

			let pre = ' Pro.'+type.substring(3);
			if( type.startsWith("sv") )
				pre = ' Res.'+type.substring(2);
			rows.push((stats[type] > 0 ? '+'+val : val)+pre);
			
		}
		names.description = rows.join("\n");
			

	}
	
}

Asset.defaultArmorPoints = 15;	// This is the default armor value of assets

Asset.imageCache = {};	// icon : svg data



// Automatically creates a stat wrapper
// Level is the level of the item, numSlots is how many item slots it covers
Asset.getRandomEnchant = function( asset, curse, player ){

	const isStat = Math.random() < 0.6;	// Stat is 60%

	if( curse || !isStat ){

		const existing = asset.getEnchants().map(el => el.label);

		const evt = new GameEvent({
			sender : player || game.players[0],
			target : player || game.players[0],
			asset : asset
		});
		const allEnchants = glib.getAllValues('ArmorEnchant').filter(enc => {
			return (
				enc.rarity <= asset.rarity &&	// Rarity requirement 
				Boolean(enc.curse) === Boolean(curse) && // Match curse status
				Condition.all(enc.conditions, evt) && // Check conditions
				!existing.includes(enc.label)	// Avoid duplicates
			);
		});

		if( allEnchants.length ){
			
			let enchant = randElem(allEnchants);
			let wrapper = enchant.wrapper.clone().g_resetID();
			wrapper.rarity = enchant.rarity || 1;
			if( curse )
				wrapper.rarity = -1;
			if( !wrapper.hasTag(stdTag.wrEnchant) )
				wrapper.tags.push(stdTag.wrEnchant);

			return wrapper;

		}
	}

	// If not stat, or no enchant is found, pick a random stat
	
	// Adds 2 to a random stat
	let stat = randElem(Object.values(Action.Types));
	if( Math.random() < 0.5 )
		stat = 'sv'+stat;
	else
		stat = 'bon'+stat;

	const out = new Wrapper({
		duration : -1,
		name : 'statsEnchant',
		detrimental : false,
		effects : [Effect.createStatBonus(stat, 3)],
		tags : [stdTag.wrEnchant],
		rarity : 1,
	});


	out.add_conditions = [];
	out.stay_conditions = [];
	return out;

};

// Generates a custom item based on a slot
Asset.generate = function( slot, level, viable_asset_templates, viable_asset_materials, rarity, minRarity, player ){

	minRarity = minRarity || 0;

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
	let template = AssetTemplate.generateOutput( slot, level, viable_asset_templates, viable_asset_materials);
	if( !template ){
		//console.error("Unable to generate a viable template from", viable_asset_templates, viable_asset_materials);
		return false;
	}

	const fitted = Math.random() < 0.2;
	const mastercrafted = Math.random() < 0.2;
	
	let out = new Asset({
		category : this.Categories.armor,
		icon : template.icon,
		level : level,
		label : this.prototype.g_guid().substr(0,16),
		name : ucFirst(template.name.trim()),
		shortname : ucFirst(template.shortname.trim()),
		tags : template.tags,
		slots : template.slots,
		weight : template.weight,
		durability_bonus : template.durability_bonus*template.slots.length,
		description : template.description,
		fitted : fitted,
		mastercrafted : mastercrafted,
		rarity : rarity,
		basevalue : Math.round(
			Math.pow(1.25, level)+
			template.slots.length*10+
			(20*Math.pow(3,rarity))+
			Math.round(template.weight/100)
		),
		colorable : template.colorable,
		color_tag_base : template.color_tag_base, 
		color_base : template.color_base,
		hit_sound : template.hit_sound
	});

	// Add stats from template
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
	let wrapper = new Wrapper({
		name : 'statsAutoGen',
		detrimental : false,
		effects : [],
		// tags : [stdTag.wrEnchant], - This is technically not an enchant
	});
	for( let i in template.bonStats )
		addEffectToWrapper(wrapper, i, template.bonStats[i]);
	for( let i in template.svStats )
		addEffectToWrapper(wrapper, i, template.svStats[i]);

	out.wrappers = [wrapper]
		.concat(Wrapper.loadThese(template.wrappers, out))
	;

	let existingEnchants = out.wrappers.filter(el => el.hasTag(stdTag.wrEnchant)).length;
	let cursed = Math.random() < 0.25;
	for( let i = existingEnchants; i < out.rarity+cursed; ++i ){
		const enchant = this.getRandomEnchant(out, false, player);
		if( enchant )
			out.wrappers.push(enchant);
	}
	if( cursed ){
		const enchant = this.getRandomEnchant(out, true, player);
		if( enchant )
			out.wrappers.push(enchant);
	}

	out.loot_sound = 'lootCloth';
	if( out.hasTag(stdTag.asPlate) )
		out.loot_sound = 'lootPlate';
	else if( out.hasTag(stdTag.asMail) )
		out.loot_sound = 'lootMail';
	else if( out.hasTag(stdTag.asLeather) )
		out.loot_sound = 'lootLeather';

	for( let wrapper of out.wrappers ){
		wrapper.add_conditions = [];
		wrapper.stay_conditions = [];
	}

	out.updateStatsAutoGen();

	out.repair();
	return out;

};

// Stringifies a stat like svPhys etc into a more readable format.
Asset.stringifyStat = function( stat ){

	if( stat.substr(0,2) === 'sv' )
		return 'Res.'+stat.substr(2);
	if( stat.substr(0,3) === 'bon' )
		return 'Pro.'+stat.substr(3);
	
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
		total += 100/Math.pow(10, rarity);
	let rand = Math.random()*total;
	let out = 0;
	for( let rarity of rarities ){
		let n = 100/Math.pow(10, rarity);
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
	hands : "hands",
	action : "action",			// Toolbelt
	// These two are primarily cosmetic, but can have durability. Should not cover genitals. Can be things like a belt or gloves.
	upperBodyCosmetic : "upperBodyCosmetic",	
	lowerBodyCosmetic : "lowerBodyCosmetic",
	jewelleryCosmetic : "jewelleryCosmetic",
};
Asset.SlotsTransmoggable = [Asset.Slots.upperBody, Asset.Slots.lowerBody];
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
	book : 'book',
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
	[Asset.Categories.book] : 'Book',
};


// These are labels that can be used which lets you transform this asset into a different one.
// For legacy reasons this works when set as a label, but you should use the asset.dummy property for this instead
// You can't use these labels in asset templates
// Overwrites are fields that are overwritten in the transform
Asset.Dummies = {
	none : '',
	label : "__LABEL__",			// Uses: name -> ID of library asset you want to polymorph this into
									// Overwrites: _stacks
	autoloot : "__AUTOLOOT__",		// (todo) Automatically generates a lootable item.
									// Overwrites: (none atm)

};

// Converts an asset if it's a dummy
Asset.convertDummy = function( asset, parent ){

	const l = asset.dummy || asset.label;

	if( l === Asset.Dummies.label ){

		const converted = glib.get(asset.name, 'Asset').clone(parent);
		if( !converted ){
			console.error("Asset conversion failed for dummy asset", asset);
			return;
		}
		converted._stacks = asset._stacks;
		converted.g_resetID();
		return converted;
	}

	if( l === Asset.Dummies.autoloot ){
		console.error("Todo: auto generate a piece of loot");
		return;
	}

	// not a dummy, return what it was
	return asset;

};

