import Text from './Text.js';
import Mod from './Mod.js';
import Generic from './helpers/Generic.js';
import Game from './Game.js';
import stdTag from '../libraries/stdTag.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
// Maps lib_types to caches used only in outputs
const CACHE_MAP = {
	'assets' : '_cache_assets'
};

// Rebases on fetch rather than automatically
const NO_REBASE = [
	'dungeonSubTemplates',
	'dungeonTemplates',
	'dungeonRoomAssets',
	'dungeonRooms',
	'dungeons',
	'gameActions',
	'roleplay',
	'roleplayStage',
	'roleplayStageOption',
	'roleplayStageOptionGoto',
	'conditions',
	'effects',
	'wrappers',
	'encounters',
	'playerIconState',
];

const load_order = [
	'fetishes',
	'conditions',
	'effects',
	'wrappers',
	'playerClasses',
	'audioKits',
	'audioMusic',
	'audioTriggers',
	'hitFX',
	'actions',
	'assets',
	'shopAssetTokens',
	'shopAssets',
	'shops',
	'playerIconStates',
	'players',
	'playerTemplateLoot',
	'playerTemplates',
	
	'materialTemplates',
	'assetTemplates',

	'factions',
	'story',
	'bookPages',
	'books',
	'armorEnchants',
	
	'roleplayStageOptionGoto',
	'roleplayStageOption',
	'roleplayStage',
	'roleplay',

	'gameActions',
	'actionLearnable',
	'encounterEvents',
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
	'loadingTip',
	
];

/*
	This is the content library which handles all the assets
*/
export default class GameLib{

	constructor(){
		this._main_mod;
		this._custom_assets = {};
		this._allow_clone = false;	// used to allow cyclic linkage. Set to true after mods have loaded
		this._cache_tags = [];		// Cache of all tags used
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
		this.audioMusic = {};
		this.audioTriggers = {};
		this.materialTemplates = {};	// AssetTemplate Material
		this.dungeonSubTemplates = {};
		this.dungeonTemplates = {};
		this.effects = {};
		this.fetishes = {};
		this.wrappers = {};
		this.encounterEvents = {};
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
		this.story = {};
		this.playerIconStates = {};
		this.books = {};
		this.bookPages = {};
		this.armorEnchants  = {};
		this._cache_assets = {};
		this.texts = {};				// The texts array gets throw into an object for easier fetching
		this._texts = new Map();		// Texts are mapped event, actionLabel. If Action isn't applicable, use ''. If the text is a chat, and no event is defined, it automatically goes into GameEvent.Types.textTrigger 
		this.gallery = {};				// Player gallery
		this.loadingTip = {};
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

		const tagCache = {};
		Object.values(stdTag).map(el => tagCache[el] = true);

		console.log("Loading in ", mods.length, "mods");

		for( let mod of mods ){
			
			mod.getAllTags().map(el => tagCache[el] = true);

			for( let k of load_order ){
				
				if( Array.isArray(mod[k]) ){

					this.loadModOnto(mod[k], this[k], Mod.getLibTypes()[k], Mod.UseID.includes(k));

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

		this._cache_tags = Object.keys(tagCache);

		// Allow auto rebasing now that mods have loaded
		Generic.auto_rebase = true;

		console.log("Loading custom game assets");
		this.rebase();

		console.log("Connecting links");
		const t = Date.now();

		let n =  0;
		const all = load_order.slice();
		all.push('texts');
		for( let i of all ){

			//let begin = n;
			if( NO_REBASE.includes(i) )
				continue;

			let lib = this[i];

			for( let iter in lib ){
				if( lib[iter].rebase && !lib[iter]._rebased ){
					lib[iter].rebase();
					++n;
				}
			}
			//console.log(n-begin, "x", i);

		}

		console.log("Connecting links took", Date.now()-t, "ms");


		// These are conditions that are heavy and should be added from the back
		const condsHeavy = {
			'tag' : true,
			'hasWrapper' : true,
			'hasEffect' : true,
			'hasEffectType' : true,
			'genitalSizeValue' : true,
			'hasInventory' : true,
			'dungeonVarMath' : true,
			'formula' : true,
			'hasAsset' : true,

		};

		let failedTexts = [];

		// Handle texts
		this._texts = new Map();
		for( let i in this.texts ){
			const text = this.texts[i];
			if( !text.en )
				continue;

			let evtType = '', actionLabel = '', fail = false;
			let newConditionsArray = [];
			for( let condition of text.conditions ){
			
				if( condition.type === Condition.Types.event && !text.chat ){ // Skip adding the event type conditions unless it's a chat. Chats are the only ones allowed to have an extra event condition, which is checked against the origitnal event.
					
					if( evtType != "" ){
						console.error("Found double event conditions in text", text);
						fail = true;
						break;
					}

					// Legacy fix
					if( Array.isArray(condition.data.event) && condition.data.event.length === 1 )
						condition.data.event = condition.data.event[0];

					if( Array.isArray(condition.data.event) ){
						fail = true;
						console.error("Multi event text conditions are no longer supported for speed reasons. Keep two copies of this text instead with different events: ", text);
						break;
					}

					if( !GameEvent.Types[condition.data.event] ){
						console.error("Unrecognized event found in text: ", text);
						fail = true;
						break;
					}

					evtType = condition.data.event;

				}
				else if( condition.type === Condition.Types.actionLabel && !condition.conditions.length ){

					if( actionLabel ){
						console.error("Found double action conditions in text", text);
						fail = true;
						break;
					}
					
					// Legacy fix
					if( Array.isArray(condition.data.label) && condition.data.label.length === 1 )
						condition.data.label = condition.data.label[0];

					if( Array.isArray(condition.data.label) ){
						fail = true;
						console.error("Multi action text conditions aren't supported. Use action aliases instead. Revise the following text: ", text, "condition", condition);
						break;
					}

					if( typeof condition.data.label !== "string" ){
						console.error("Non-string action label in", text);
						fail = true;
						break;
					}

					actionLabel = condition.data.label;
					if( condition.data.ignore_alias )
						newConditionsArray.unshift(condition); // This is an ugly workaround, because the new storage system allows all aliasing by default. But it always checks all conditions before allowing a text.
	
				}
				else if( condsHeavy[condition.type] )
					newConditionsArray.push(condition);
				else
					newConditionsArray.unshift(condition);
	
			}

			// Chats are forced into the textTrigger event path.
			if( text.chat )
				evtType = GameEvent.Types.textTrigger;

			if( !text.chat && evtType === GameEvent.Types.textTrigger ){
				console.error("textTrigger event type is reserved for chat");
				fail = true;
			}

			if( fail || !evtType ){
				failedTexts.push(text.id);
				if( !evtType )
					console.error("Texts not tied to a parent MUST have an event condition directly under it! Revise the following text: ", text);
				continue;
			}


			text.conditions = newConditionsArray;
			
			if( !this._texts.has(evtType) )
				this._texts.set(evtType, new Map());
			let lib = this._texts.get(evtType);
			if( !lib.has(actionLabel) )
				lib.set(actionLabel, []);
			lib = lib.get(actionLabel);
			lib.push(text);


		}

		console.log("Failed texts:", JSON.stringify(failedTexts));

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
			if( el.enabled && (el.netgame || !game.is_host || !Game.net.isInNetgame()) ){
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
	get( label, constructorName, clone = true ){

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
		if( !clone )
			return obj;
		return obj.clone();

	}

	getAllKeys( cName ){
		const all = this.getFull(cName);
		if( all )
			return Object.keys(all);
	}

	getAllValues( cName ){
		return Object.values(this.getFull(cName));
	}

	// Returns all assets
	getFull( cName ){

		const lt = Mod.getLibTypes();
		for( let i in lt ){

			if( cName === lt[i].name ){

				if( CACHE_MAP[i] )
					return this[CACHE_MAP[i]];
				return this[i];

			}

		}
		
		console.error("Asset type", cName, "not in library");

	}



	// Library helpers
	getAllTags(){

		return this._cache_tags;

	}
	

}