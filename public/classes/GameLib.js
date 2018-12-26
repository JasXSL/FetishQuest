import Text from './Text.js';
import Condition from './Condition.js';
import { Effect, Wrapper } from './EffectSys.js';
import PlayerClass from './PlayerClass.js';
import Action from './Action.js';
import Asset from './Asset.js';
import Dungeon, {DungeonEncounter} from './Dungeon.js';
import Quest from './Quest.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';
import DungeonTemplate, { RoomTemplate } from './templates/DungeonTemplate.js';
import { AudioKit } from './Audio.js';
import MAIN_MOD from '../libraries/_main_mod.js';
import Mod from './Mod.js';


const LIB_TYPES = {
	'conditions' : Condition,
	'effects' : Effect,
	'wrappers' : Wrapper,
	'playerClasses' : PlayerClass,
	'actions' : Action,
	'assets' : Asset,

	'dungeons' : Dungeon,
	'quests' : Quest,

	'playerTemplates' : PlayerTemplate,
	'materialTemplates' : MaterialTemplate,
	'assetTemplates' : AssetTemplate,
	'audioKits' : AudioKit,
	'dungeonRoomTemplates' : RoomTemplate,
	'dungeonTemplates' : DungeonTemplate,
	'dungeonEncounters' : DungeonEncounter,
};

// Maps lib_types to caches used only in outputs
const CACHE_MAP = {
	'assets' : '_cache_assets'
};

/*
	This is the content library which handles all the assets
*/
export default class GameLib{

	constructor(){
		this._custom_assets = {};
		this.reset();
	}

	reset(){
		this.conditions = {};			//x Condition library
		this.playerClasses = {};
		this.dungeons = {};
		this.quests = {};
		this.actions = {};
		this.assets = {};
		this.playerTemplates = {};
		this.assetTemplates = {};
		this.audioKits = {};
		this.materialTemplates = {};	// AssetTemplate Material
		this.dungeonTemplates = {};
		this.dungeonRoomTemplates = {};
		this.effects = {};
		this.wrappers = {};
		this.dungeonEncounters = {};

		this._cache_assets = {};
		this.texts = [];
	}


	async ini(){
		await this.autoloadMods();
	}

	// Loads a mod db array onto one of this objects
	loadModOnto( db, obj, constructor ){
		for( let asset of db )
			obj[asset.label] = new constructor(asset);
	}

	// Loads mods into the library
	loadMods( mods = [] ){

		const load_order = [
			'conditions',
			'effects',
			'wrappers',
			'playerClasses',
			'actions',
			'assets',
			'playerTemplates',
			'dungeons',
			'quests',

			'materialTemplates',
			'assetTemplates',
			
			'audioKits',
			'dungeonEncounters',
			'dungeonRoomTemplates',
			'dungeonTemplates',
		];
		

		for( let mod of mods ){
			
			for( let k of load_order ){
				if( Array.isArray(mod[k]) )
					this.loadModOnto(mod[k], this[k], LIB_TYPES[k]);
			}
			
			// Texts can be last, it's not linked to anything other than conditions
			if( mod.texts )
				this.texts = this.texts.concat(mod.texts.map(el => new Text(el)));

		}

		// Builds caches
		this.rebase();

		console.log("MODS FINISHED LOADING. LIBRARY:", this);

	}

	

	// Tries to auto load enabled mods
	async autoloadMods(){
		let mods = await Mod.getModsOrdered();
		mods = mods.filter(el => el.enabled);
		let promises = [];
		for( let mod of mods )
			promises.push(Mod.getByID(mod.id));
		mods = await Promise.all(promises);
		
		mods = mods.filter(el => el);
		mods.unshift(MAIN_MOD);
		this.reset();
		return this.loadMods(mods);
	}

	

	// Rebuild caches
	rebase(){

		this._cache_assets = {};
		for( let i in this.assets )
			this._cache_assets[i] = this.assets[i];
		for( let i in this._custom_assets ){
			this._cache_assets[i] = this._custom_assets[i];
			this._cache_assets[i]._custom = true;
		}
	}

	// Adds from game specific custom library
	setCustomAssets( assets ){

		if( typeof assets !== "object" )
			assets = {};

		this._custom_assets = assets;
		
		this.rebase();
		
	}

	// Gets by asset constructor name
	get( label, constructorName ){

		let lib = this.getFull(constructorName);
		if( !lib )
			return;
		
		if( !lib[label] ){
			console.error("Asset", label, "not found in", lib, "constructor was ", constructorName);
			return false;
		}
		return lib[label].clone();

	}

	

	getFull( cName ){
		for( let i in LIB_TYPES ){
			if( cName === LIB_TYPES[i].name ){
				if( CACHE_MAP[i] )
					return this[CACHE_MAP[i]];
				return this[i];
			}
		}
		console.error("Asset type", cName, "not in library");
	}

}