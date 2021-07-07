import Text from './Text.js';
import Mod from './Mod.js';
import Generic from './helpers/Generic.js';

// Maps lib_types to caches used only in outputs
const CACHE_MAP = {
	'assets' : '_cache_assets'
};

const load_order = [
	'fetishes',
	'conditions',
	'effects',
	'wrappers',
	'playerClasses',
	'audioKits',
	'hitFX',
	'actions',
	'assets',
	'shopAssetTokens',
	'shopAssets',
	'shops',
	'players',
	'playerTemplateLoot',
	'playerTemplates',
	
	'materialTemplates',
	'assetTemplates',

	'factions',
	'bookPages',
	'books',
	
	'roleplayStageOptionGoto',
	'roleplayStageOption',
	'roleplayStage',
	'roleplay',

	'gameActions',
	'actionLearnable',
	'encounters',

	'dungeonSubTemplates',
	'dungeonTemplates',
	'dungeonRoomAssets',
	'dungeonRooms',
	'dungeons',

	'questObjectiveEvents',
	'questObjectives',
	'questRewards',
	'quests',
	'gallery',
	
];

/*
	This is the content library which handles all the assets
*/
export default class GameLib{

	constructor(){
		this._main_mod;
		this._custom_assets = {};
		this._allow_clone = false;	// used to allow cyclic linkage. Set to true after mods have loaded
		this.reset();
	}

	reset(){
		this.conditions = {};			//x Condition library
		this.playerClasses = {};
		this.dungeons = {};
		this.dungeonRooms = {};
		this.dungeonRoomAssets = {};
		this.quests = {};
		this.questObjectiveEvents = {},
		this.questObjectives = {},
		this.questRewards = {},
		this.actions = {};
		this.assets = {};
		this.shopAssetTokens = {};
		this.shopAssets = {};
		this.shops = {};
		this.playerTemplates = {};
		this.playerTemplateLoot = {};
		this.assetTemplates = {};
		this.audioKits = {};
		this.materialTemplates = {};	// AssetTemplate Material
		this.dungeonSubTemplates = {};
		this.dungeonTemplates = {};
		this.effects = {};
		this.fetishes = {};
		this.wrappers = {};
		this.encounters = {};
		this.players = {};
		this.hitFX = {};
		this.roleplay = {};
		this.roleplayStage = {};
		this.roleplayStageOption = {};
		this.roleplayStageOptionGoto = {};
		this.gameActions = {};
		this.actionLearnable = {};
		this.factions = {};
		this.books = {};
		this.bookPages = {};
		this._cache_assets = {};
		this.texts = {};				// The texts array gets throw into an object for easier fetching
		this.gallery = {};				// Player gallery
	}

	async loadMainMod(){

		if( !this._main_mod )
			this._main_mod = await Mod.getMainMod();

	}

	async ini(){
		
		await this.autoloadMods();

	}

	// Loads a mod db array onto one of this objects
	loadModOnto( db, obj, constructor, useID = false ){

		let overrides = [];	// Objects that should extend existing data
		for( let asset of db ){
			
			if( asset._e ){

				overrides.push(asset);
				continue;

			}

			let index = asset.label;
			if( useID )
				index = asset.id;

			if( obj === undefined )
				console.error(db, obj, constructor, useID);

			obj[index] = new constructor(asset);

		}

		for( let override of overrides ){

			const editId = override._e;
			if( !obj[editId] ){
				
				console.error("Missing base asset for", override, "check mod load order. Tried finding it in", obj);
				continue;

			}

			if( useID )
				delete override.id;
			else
				delete override.label;	// Use the original label, everything else is overwritten

			override = Mod.mergeExtensionAssets(obj[editId], override);	// Handle arrays since they have {__DEL__} objects
			obj[editId].load(override);

		}

		if( !constructor )
			console.error("Missing constructor in", db, obj, constructor);

		// Handle caches
		if( constructor.name === "Asset" ){

			this._cache_assets = {};
			for( let i in this.assets )
				this._cache_assets[i] = this.assets[i];

		}


	}

	// Loads mods into the library
	loadMods( mods = [] ){

		this.loading = true;
		// prevent auto rebasing while loading
		Generic.auto_rebase = false;
		console.log("Loading in ", mods.length, "mods");

		for( let mod of mods ){
			
			for( let k of load_order ){
				
				if( Array.isArray(mod[k]) ){

					this.loadModOnto(mod[k], this[k], Mod.LIB_TYPES[k], Mod.UseID.includes(k));

				}

			}
			
			// Texts can be last, it's not linked to anything other than conditions
			// But they need to be mapped to an object
			if( Array.isArray(mod.texts) ){

				let overrides = [];

				for( let text of mod.texts ){

					if( text._e ){
						
						overrides.push(text);
						continue;

					}
					const t = new Text(text);
					if( text._h )
						t.en = false;		// Hidden texts (hooked up to an object such as an RP stage) should always be disabled by default

					let label = t.label || t.id;	// Labels can be used. These are only used when a text is used as a custom sub object, such as in a roleplay
					this.texts[label] = t;

				}

				// Handle text overrides as well
				for( let text of overrides ){

					const existing = this.texts[text._e];
					if( existing ){

						text = Mod.mergeExtensionAssets(existing, text);	// Handle {__DEL__} objects
						existing.load(text);

					}
				}

			}

		}

		// Allow auto rebasing now that mods have loaded
		Generic.auto_rebase = true;

		console.log("Loading custom game assets");
		this.rebase();

		console.log("Connecting links");

		let n =  0;
		const all = load_order.slice();
		all.push('texts');
		for( let i of all ){

			let lib = this[i];
			for( let iter in lib ){
				if( lib[iter].rebase && !lib[iter]._rebased ){
					lib[iter].rebase();
					++n;
				}
			}

		}

		console.log(n, "assets prepared");
		this._allow_clone = true;
		this.loading = false;
		console.debug("MODS FINISHED LOADING. LIBRARY:", this);
		

	}

	

	// Tries to auto load enabled mods
	async autoloadMods(){

		let hasMainOverride = false;	// If a mod is named MAIN, we won't load the MAIN mod
		
		let mods = await Mod.getModsOrdered();
		mods = mods.filter(el => {
			if( el.enabled && (el.netgame || !game.is_host || !game.net.isConnected()) ){
				if( el.id === "MAIN" )
					hasMainOverride = true;

				return true;
			}
		});

		let promises = [];
		for( let mod of mods )
			promises.push(Mod.getByID(mod.id));
			
		mods = await Promise.all(promises);
		
		mods = mods.filter(el => el);

		if( !hasMainOverride ){
			
			await this.loadMainMod();
			mods.unshift(this._main_mod);

		}
		else{
			console.log("You are now using an alternate MAIN mod");
		}

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

			console.error("Asset", label, "not found in", Object.keys(lib), "constructor was ", constructorName);
			return false;

		}

		if( !this._allow_clone )
			return lib[label];

		// Rebase if not already rebased. This is needed for wrappers in wrappers to work.
		let obj = lib[label];
		if( !obj._rebased && obj.rebase )
			obj.rebase();
		return obj.clone();

	}

	getAllKeys( cName ){
		const all = this.getFull(cName);
		if( all )
			return Object.keys(all);
	}

	getFull( cName ){

		for( let i in Mod.LIB_TYPES ){

			if( cName === Mod.LIB_TYPES[i].name ){

				if( CACHE_MAP[i] )
					return this[CACHE_MAP[i]];
				return this[i];

			}

		}
		
		console.error("Asset type", cName, "not in library");

	}

	

}