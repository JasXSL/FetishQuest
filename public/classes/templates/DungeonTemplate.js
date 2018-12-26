/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import { DungeonEncounter } from '../Dungeon.js';

class DungeonTemplate extends Generic{
	constructor(...args){
		super(...args);

		this.label = 'dark';	// Generic dark dungeon
		this.rooms = [];		// Roomtemplates
		this.doors_hor = [];		// Doors are picked by the dungeon
		this.doors_down = [];
		this.doors_up = [];
		this.encounters = [];		// Viable encounters. Supports linkage.
		// Consumables you can find in this dungeon
		this.consumables = [
			'manaPotion', 'majorManaPotion',
			'minorHealingPotion', 'healingPotion', 'majorHealingPotion',
			'minorRepairKit', 'repairKit', 'majorRepairKit',
		];
		this.load(...args);

	}

	save( full ){
		const out = {
			label : this.label,
			rooms : this.rooms,
			doors_hor : this.doors_hor,
			doors_down : this.doors_down,
			encounters : DungeonEncounter.saveThese(this.encounters, full),
			consumables : this.consumables,
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){

		this.encounters = DungeonEncounter.loadThese(this.encounters, this);

	}

	// Returns a consumable in a weighted list
	getRandomConsumable(){

		let assetLib = glib.getFull("Asset");
		let assets = [];
		for( let c of this.consumables ){
			if( assetLib[c] )
				assets.push(assetLib[c]);
		}

		let out = Asset.getRandomByRarity(assets);
		return out;

	}

	load(data){
		this.g_autoload(data);
	}
}

class RoomTemplate extends Generic{
	constructor(...args){
		super(...args);
		
		this.label = '';
		this.basemeshes = [];		// Viable room basemeshes
		this.props = [];
		this.tags = [];
		this.containers = [];			// Viable containers for the room
		this.ambiance = 'media/audio/ambiance/dungeon.ogg';
		this.ambiance_volume = 0.2;

		this.load(...args);
	}

	save( full ){
		const out = {
			label : this.label,
			basemeshes : this.basemeshes,
			props : this.props,
			tags : this.tags,
			containers : this.containers,
			ambiance : this.ambiance,
			ambiance_volume : this.ambiance_volume,
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}


	load(data){
		this.g_autoload(data);
	}
}

export {RoomTemplate};
export default DungeonTemplate;
