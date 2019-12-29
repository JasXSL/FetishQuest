import Player from '../Player.js';
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import Action from '../Action.js';
import GameEvent from '../GameEvent.js';
import Condition from '../Condition.js';
import PlayerClass from '../PlayerClass.js';


class PlayerTemplate extends Generic{

	constructor(...args){
		super(...args);
		this.label = '';
		this.name = "";
		this.icon = "";
		this.species = "";
		this.description = "";
		this.classes = []; 		// One of these
		this.max_actions = -1;
		this.tags = [];
		this.min_level = 1;
		this.max_level = 20;
		this.monetary_wealth = 0;				// Copper. Varies by 50%
		this.gear_quality = 0.2;				// Quality of gear generated
		this.primary_stats = {};
		this.sv = {};
		this.bon = {};
		this.viable_asset_materials = [];		// materials from AssetTemplate
		this.viable_asset_templates = [];		// AssetTemplate from asset template library
		this.viable_gear = [];					// Viable prop assets. Only one of these can be active
		this.gear_chance = 0.5;					// Chance of having gear
		this.min_size = 1;
		this.max_size = 3;
		this.difficulty = 1;
		this.viable_consumables = [];			// Viable consumable assets this can spawn with
		this.powered = false;
		this.sadistic_min = 0;
		this.sadistic_max = 1;
		this.dominant_min = 0;					// Dominant vs submissive
		this.dominant_max = 1;					// Dominant vs submissive
		this.hetero_min = 0;						// 0 = gay, 0.5 = bi, 1 = straight
		this.hetero_max = 1;						// 0 = gay, 0.5 = bi, 1 = straight
		this.intelligence_min = 0.6;				// Starts off at human level
		this.intelligence_max = 0.6;
		this.required_assets = [];				// labels of assets that MUST be on this character
		this.required_actions = [];				// labels of actions that MUST be on this character
		this.no_equip = false;					// Prevents equip of the gear. Useful for things like mimics.
		this.load(...args);
	}

	load(data){
		this.g_autoload(data);
	}

	save( full ){
		return {
			label : this.label,
			name : this.name,
			icon : this.icon,
			species : this.species,
			description : this.description,
			classes : this.classes,
			max_actions : this.max_actions,
			required_actions : this.required_actions,
			tags : this.tags,
			min_level : this.min_level,
			max_level : this.max_level,
			primary_stats : this.primary_stats,
			sv : this.sv,
			bon : this.bon,
			viable_asset_materials : this.viable_asset_materials,
			viable_asset_templates : this.viable_asset_templates,
			viable_gear : this.viable_gear,
			gear_chance : this.gear_chance,
			min_size : this.min_size,
			max_size : this.max_size,
			difficulty : this.difficulty,
			viable_consumables : this.viable_consumables,
			monetary_wealth : this.monetary_wealth,
			gear_quality : this.gear_quality,
			sadistic_min : this.sadistic_min,
			sadistic_max : this.sadistic_max,
			dominant_min : this.dominant_min,
			dominant_max : this.dominant_max,
			intelligence_min : this.intelligence_min,
			intelligence_max : this.intelligence_max,
			required_assets : this.required_assets,
			powered : this.powered,
			no_equip : this.no_equip,
		};
	}

	rebase(){
	}

	// Generates a new player from this template
	generate( level ){

		let libClasses = glib.getFull('PlayerClass'),
			libActions = glib.getFull('Action')
		;

		if( isNaN(level) )
			level = game.getAveragePlayerLevel();

		// Generates a random value between min and max and between 0 and 1 
		function rand1( min, max ){
			return Math.min(Math.max(0, Math.random()*(max-min)+min), 1);
		}


		let player = new Player();
		player.name = this.name;
		player.icon = this.icon;
		player.description = this.description;
		player.species = this.species;
		player.tags = this.tags.map(el => {
			return el.split('_').slice(1).join('_')
		});
		player.level = Math.min(Math.max(level, this.min_level), this.max_level);


		player.sadistic = rand1(this.sadistic_min, this.sadistic_max);
		player.dominant = rand1(this.dominant_min, this.dominant_max);
		player.hetero = rand1(this.hetero_min, this.hetero_max);
		player.intelligence = rand1(this.intelligence_min, this.intelligence_max);

		player.size = Math.floor(Math.random()*(this.max_size+1-this.min_size))+this.min_size;
		player.size = Math.min(Math.max(0, player.size), 10);
		player.team = 1;
		player.powered = this.powered;
		shuffle(this.classes);

		if( this.viable_asset_materials[0] === '*' )
			this.viable_asset_materials = glib.getAllKeys('MaterialTemplate');
		if( this.viable_asset_templates[0] === '*' )
			this.viable_asset_templates = glib.getAllKeys('AssetTemplate');

		shuffle(this.viable_asset_materials);
		shuffle(this.viable_asset_templates);
		shuffle(this.viable_gear);
		for( let c of this.classes ){

			const cl = libClasses[c];
			if( cl ){
				player.class = cl;

				if( cl.name_type !== PlayerClass.NameType.None ){
					if( cl.name_type === PlayerClass.NameType.Suffix )
						player.name += ' '+cl.name;
					else
						player.name = cl.name + ' ' + player.name;
				}

				break;
			}
		}

		
		let libAssets = glib.getFull('Asset');
		for( let asset of this.required_assets ){
			let item = libAssets[asset];
			if( !item )
				continue;
			item.restore();
			player.addAsset(item, undefined, undefined, true);
			if( !this.no_equip )
				item.equipped = true;
		}

		let gearLevelOffset = -2;
		if( this.gear_quality >= 0.5 )
			gearLevelOffset = 0;
		else if( this.gear_quality > 0.25 )
			gearLevelOffset = -1;

		let minRarity = 0;

		if( this.gear_quality >= 1 )
			minRarity = 3;
		else if( this.gear_quality >= 0.75 )
			minRarity = 2;
		else if( this.gear_quality >= 0.5 )
			minRarity = 1;

		// pick assets
		let numAdded = 0;
		if( this.viable_asset_templates.length ){

			for( let template of this.viable_asset_templates ){

				let asset = Asset.generate(undefined, level+gearLevelOffset, template, this.viable_asset_materials, undefined, minRarity);
				
				if( !asset )
					continue;
				if( player.getEquippedAssetsBySlots(asset.slots).length )
					continue;
				asset.restore();
				asset.randomizeDurability();
				player.addAsset(asset, undefined, undefined, true);
				if( !this.no_equip ){
					player.equipAsset(asset.id);
				}
				++numAdded;
				if( Math.random() < 0.25 || numAdded > 1 )
					break;

			}

		}

		// Add a random prop
		if( !player.getEquippedAssetsBySlots([Asset.Slots.hands]).length && Math.random() < this.gear_chance ){
			for(let template of this.viable_gear){

				if( libAssets[template] ){

					let asset = libAssets[template];
					asset.restore();
					player.addAsset(asset, undefined, undefined, true);
					if( !this.no_equip )
						player.equipAsset(asset.id);

				}

			}
		}

		// Might have up to 3 items, 10% chance of each
		let items = this.viable_consumables.map(el => libAssets[el]).filter(el => !!el);
		for( let i =0; i<3; ++i ){
			if( Math.random()>0.1 )
				continue;
			
			let item = Asset.getRandomByRarity(items);
			if( item ){
				item.restore();
				player.addAsset(item);
				if( !this.no_equip )
					player.equipAsset(item.id);
			}
		}

		// Dosh!
		// Amount of money varies by +-50% 
		let copper = Math.floor(this.monetary_wealth*(Math.random()+0.5));
		const copperAsset = glib.get('copper', 'Asset');
		copperAsset.g_resetID();
		copperAsset._stacks = copper;
		player.addAsset(copperAsset);
		player.exchangeMoney();
		
		let maxActions = this.max_actions-this.required_actions.length;
		if( maxActions < 0 )
			maxActions = 0;

		let viableActions = [];
		for( let a of player.class.actions ){
			if( !libActions[a] )
				continue;
				
			let evt = new GameEvent({
				target : player,
				sender : player,
				action : libActions[a]
			});
			if( Condition.all(libActions[a].add_conditions, evt) )
				viableActions.push(libActions[a]);

		}

		shuffle(viableActions);

		if( this.max_actions > 0 )
			viableActions = viableActions.slice(0, this.max_actions);

		viableActions = viableActions.concat(Action.loadThese(this.required_actions));

		viableActions.sort((a,b) => {
			if( a.level === b.level )
				return a.name < b.name ? -1 : 1;
			return a.level < b.level ? -1 : 1;
		});
		for( let action of viableActions )
			player.addAction(action, true);

		
		// Primary stats
		for( let i in this.primary_stats ){
			player[i] = this.primary_stats[i] || 0;
		}

		const penalty = Math.min(level-4, 0);

		for( let i in this.sv )
			player['sv'+i] = this.sv[i];
		for( let i in this.bon )
			player['bon'+i] = this.bon[i]+penalty;

		// Lower level monsters have a primary stat penalty up to level 3
		for( let i in Player.primaryStats )
			player[i] += penalty;

		player.fullRegen();

		return player;

	}



}

// 1s is 1x money multiplier

PlayerTemplate.generate = function( level, labels ){
	
	let lib = Object.values(glib.getFull('PlayerTemplate'));

	let viable = [];
	for( let t of lib ){
		if( t.min_level <= level && t.max_level >= level && (!Array.isArray(labels) || ~labels.indexOf(t.label)) )
			viable.push(t);
	}

	if( !viable.length )
		return false;

	shuffle(viable);
	return viable.shift().generate(level);

};

export default PlayerTemplate;

