import Player from '../Player.js';
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import Action from '../Action.js';
import GameEvent from '../GameEvent.js';
import Condition from '../Condition.js';


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

		this.sadistic_min = 0;
		this.sadistic_max = 1;
		this.dominant_min = 0;					// Dominant vs submissive
		this.dominant_max = 1;					// Dominant vs submissive
		this.hetero_min = 0;						// 0 = gay, 0.5 = bi, 1 = straight
		this.hetero_max = 1;						// 0 = gay, 0.5 = bi, 1 = straight
		this.intelligence_min = 0.6;				// Starts off at human level
		this.intelligence_max = 0.6;
		this.required_assets = [];				// labels of assets that MUST be on this character
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

			sadistic_min : this.sadistic_min,
			sadistic_max : this.sadistic_max,
			dominant_min : this.dominant_min,
			dominant_max : this.dominant_max,
			intelligence_min : this.intelligence_min,
			intelligence_max : this.intelligence_max,
			required_assets : this.required_assets
		};
	}

	rebase(){
	}

	// Generates a new player from this template
	generate( level ){

		let libClasses = glib.getFull('PlayerClass'),
			libActions = glib.getFull('Action')
		;

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
		if( !isNaN(level) )
			player.level = Math.min(Math.max(level, this.min_level), this.max_level);

		player.sadistic = rand1(this.sadistic_min, this.sadistic_max);
		player.dominant = rand1(this.dominant_min, this.dominant_max);
		player.hetero = rand1(this.hetero_min, this.hetero_max);
		player.intelligence = rand1(this.intelligence_min, this.intelligence_max);

		player.size = Math.floor(Math.random()*(this.max_size+1-this.min_size))+this.min_size;
		player.size = Math.min(Math.max(0, player.size), 4);
		player.team = 1;
		shuffle(this.classes);
		shuffle(this.viable_asset_materials);
		shuffle(this.viable_asset_templates);
		shuffle(this.viable_gear);
		for( let c of this.classes ){
			if( libClasses[c] ){
				player.class = libClasses[c];
				break;
			}
		}

		
		let libAssets = glib.getFull('Asset');
		for( let asset of this.required_assets ){
			let item = libAssets[asset];
			if( !item )
				continue;
			player.addAsset(item);
			item.equipped = true;
		}

		// pick assets
		if( this.viable_asset_templates.length ){

			for( let template of this.viable_asset_templates ){

				let asset = Asset.generate(undefined, level-2, template, this.viable_asset_materials);
				if( !asset )
					continue;
				if( player.getEquippedAssetsBySlots(asset.slots).length )
					continue;

				
				asset.randomizeDurability();
				asset.equipped = true;
				player.addAsset(asset);

				if( Math.random() < 0.25 )
					break;

			}

		}

		// Add a random prop
		if( !player.getEquippedAssetsBySlots([Asset.Slots.hands]).length && Math.random() < this.gear_chance ){
			for(let template of this.viable_gear){

				if( libAssets[template] ){

					let asset = libAssets[template];
					asset.equipped = true;
					player.addAsset(asset);

				}

			}
		}

		// Might have up to 3 items, 10% chance of each
		let items = this.viable_consumables.map(el => libAssets[el]).filter(el => !!el);
		for( let i =0; i<3; ++i ){
			if( Math.random()>0.1 )
				continue;
			
			let item = Asset.getRandomByRarity(items);
			if( item )
				player.addAsset(item);
			
		}

		
		let viableActions = [];
		for( let a of player.class.actions ){
			if( libActions[a] && libActions[a].level <= player.level ){
				
				let evt = new GameEvent({
					target : player,
					sender : player,
					action : libActions[a]
				});
				if( Condition.all(libActions[a].add_conditions, evt) )
					viableActions.push(libActions[a]);

			}
		}

		shuffle(viableActions);

		if( this.max_actions > 0 )
			viableActions = viableActions.slice(0, this.max_actions);

		viableActions.sort((a,b) => {
			if( a.level === b.level )
				return a.name < b.name ? -1 : 1;
			return a.level < b.level ? -1 : 1;
		});
		for( let action of viableActions )
			player.addAction(action, true);

		
		// Primary stats
		for( let i in this.primary_stats ){
			player[i] = this.primary_stats[i];
		}
		for( let i in this.sv )
			player['sv'+i] = this.sv[i];
		for( let i in this.bon )
			player['bon'+i] = this.bon[i];

		// Lower level monsters have a stat penalty up to level 6
		let penalty = Math.min(level-6, 0);
		for( let i in Player.primaryStats )
			player[i] += penalty;
		for( let i in Action.Types ){
			player['sv'+Action.Types[i]] += penalty;
			player['bon'+Action.Types[i]] += penalty;
		}

		player.fullRegen();

		return player;

	}



}

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

