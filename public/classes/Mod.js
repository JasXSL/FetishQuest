import Comparer from './Comparer.js';
import GameAction from './GameAction.js';
import Generic from './helpers/Generic.js';
import Text from './Text.js';
import { Effect, Wrapper } from './EffectSys.js';
import PlayerClass from './PlayerClass.js';
import Action from './Action.js';
import Asset from './Asset.js';
import Dungeon, { DungeonRoom, DungeonRoomAsset } from './Dungeon.js';
import Quest, { QuestReward, QuestObjective, QuestObjectiveEvent } from './Quest.js';
import PlayerTemplate, { PlayerTemplateLoot } from './templates/PlayerTemplate.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';
import DungeonTemplate, { DungeonTemplateSub } from './templates/DungeonTemplate.js';
import { AudioKit } from './Audio.js';
import Player from './Player.js';
import HitFX from './HitFX.js';
import Roleplay, { RoleplayStage, RoleplayStageOption, RoleplayStageOptionGoto } from './Roleplay.js';
import Shop, { ShopAsset, ShopAssetToken } from './Shop.js';
import ActionLearnable from './ActionLearnable.js';
import Faction from './Faction.js';
import Encounter, { EncounterEvent } from './Encounter.js';
import PlayerGalleryTemplate from './templates/PlayerGalleryTemplate.js';
import Condition from './Condition.js';
import Book, { BookPage } from './Book.js';
import Fetish from './Fetish.js';
import ArmorEnchant from './ArmorEnchant.js';
import AudioTrigger from './AudioTrigger.js';
import Collection from './helpers/Collection.js';
import LoadingTip from './LoadingTip.js';

/* DB Asset special fields: 
	_mParent : {type:libraryTableName, label:label/id} 
		Used to recursively delete children of one to many or one to one relations.
		Ex: roleplayStage always only has one parent roleplay

	_e : Built into every Generic object
	_ext : true -> Already extended (not saved)
	_h : hidden from main list
*/

// Ext is internal only
const specialSaveFields = [
	"_mParent",
	"_e",
	"_h",
];



export default class Mod extends Generic{

	constructor(data){
		super(data);

		this.version = 1;			// Version of the FQ modtools
		this.buildNr = 1;			// Build nr (incremented automatically when exported)

		// x = not yet implemented
		this.name = '';
		this.description = '';
		this.category = Mod.Category.Unsorted;
		this.author = '';
		this.dungeons = [];		//x mod prefab dungeons
		this.dungeonRooms = [];		//x mod prefab dungeons
		this.dungeonRoomAssets = [];		//x mod prefab dungeons
		this.quests = [];		//x mod prefab quests
		this.texts = [];		//x mod texts
		this.actions = [];		//x mod actions
		this.assets = [];		//x equipment prefabs
		this.audioKits = [];	//x AudioKit
		this.audioTriggers = [];
		this.playerClasses = [];	//x Custom player classes
		this.conditions = [];			//x Condition library
		this.fetishes = [];
		this.players = [];
		this.playerTemplates = [];		// NPC generator templates
		this.playerTemplateLoot = [];
		this.assetTemplates = [];		// Asset templates
		this.materialTemplates = [];	// AssetTemplate Material
		this.dungeonSubTemplates = [];
		this.dungeonTemplates = [];
		this.effects = [];
		this.wrappers = [];
		this.encounters = [];
		this.encounterEvents = [];
		this.hitFX = [];
		this.roleplay = [];
		this.roleplayStage = [];
		this.roleplayStageOption = [];
		this.roleplayStageOptionGoto = [];
		this.gameActions = [];
		this.shops = [];
		this.shopAssets = [];
		this.shopAssetTokens = [];
		this.actionLearnable = [];
		this.factions = [];
		this.questRewards = [];
		this.questObjectives = [];
		this.questObjectiveEvents = [];
		this.gallery = [];
		this.loadingTip = [];
		this.books = [];
		this.bookPages = [];
		this.armorEnchants = [];

		this.load(data);
	}

	clone(){
		return new this.constructor(JSON.parse(JSON.stringify(this.getSaveData())));
	}

	load( data ){
		
		// Legacy reasons, can remove in the future
		/*
		if( data && data.dungeonEncounters )
			data.encounters = data.dungeonEncounters;
		*/
		this.g_autoload(data);

		
	}

	rebase(){
		this.g_rebase();	// Super
		
		if( !Object.values(Mod.Category).includes(this.category))
			this.category = Mod.Category.Unsorted;
	}

	getSaveData(){
		
		const comparer = new Comparer();
		const out = {
			buildNr : this.buildNr,
			version : this.version,
			id : this.id,
			name : this.name,
			author : this.author,
			category : this.category,
			description : this.description,
			dungeons : this.dungeons,
			dungeonRooms : this.dungeonRooms,
			dungeonRoomAssets : this.dungeonRoomAssets,
			quests : this.quests,
			questRewards : this.questRewards,
			questObjectives : this.questObjectives,
			questObjectiveEvents : this.questObjectiveEvents,
			texts : this.texts,
			actions : this.actions,
			assets : this.assets,
			audioKits : this.audioKits,
			audioTriggers : this.audioTriggers,
			playerClasses : this.playerClasses,
			conditions : this.conditions,
			fetishes : this.fetishes,
			playerTemplates : this.playerTemplates,
			playerTemplateLoot :  this.playerTemplateLoot,
			assetTemplates : this.assetTemplates,
			materialTemplates: this.materialTemplates,
			dungeonTemplates: this.dungeonTemplates,
			effects : this.effects,
			wrappers : this.wrappers,
			encounterEvents : this.encounterEvents,
			encounters : this.encounters,
			players : this.players,
			hitFX : this.hitFX,
			roleplay : this.roleplay,
			roleplayStage : this.roleplayStage,
			roleplayStageOption : this.roleplayStageOption,
			roleplayStageOptionGoto : this.roleplayStageOptionGoto,
			gameActions : this.gameActions,
			shops : this.shops,
			shopAssets : this.shopAssets,
			shopAssetTokens : this.shopAssetTokens,
			actionLearnable : this.actionLearnable,
			factions : this.factions,
			dungeonSubTemplates : this.dungeonSubTemplates,
			gallery : this.gallery,
			loadingTip : this.loadingTip,
			bookPages : this.bookPages,
			books : this.books,
			armorEnchants : this.armorEnchants,
		};

		// When saved from the modtools, trim out any extended asset values that are equal to the same values in MAIN
		if( window.mod ){

			// Removes del except for in arrays
			const removeDel = obj => {

				if( typeof obj !== "object" )
					return obj;

				let keys = Object.keys(obj);
				for( let key of keys ){
					
					if( obj[key] === '__DEL__' )
						delete obj[key];
					else
						obj[key] = removeDel(obj[key]);

				}
				return obj;

			};

			const handleComparedArrays = (base, compared, debug) => {

				if( debug ){
					console.log("Comparing", base, compared);
					debugger;
				}
				const getId = c => {
					if( typeof c === "object" )
						return c.label || c.id;
					return c;
				};

				for( let i in compared ){

					// Not an array, HANDLE IT
					if( !Array.isArray(compared[i]) ){

						if( typeof compared[i] === "object" && typeof base[i] === "object" )
							compared[i] = handleComparedArrays(base[i], compared[i], debug);

						continue;
					}
					// If the base isn't a valid type, or is empty, accept compared as is
					if( !Array.isArray(base?.[i]) || !base[i].length )
						return compared;

					// Awe shiet, we have an array
					let removes = [], build = [], adds = new Map(), currents = new Map();	// Label : amount

					let baseI = base[i];
					if( !baseI )
						baseI = [];

					// Check how many of each entry we have in the compared output. An array may contain the same item multiple times.
					// Which is why we here calculate how many times it occurs
					for( let c of compared[i] ){
						c = getId(c);
						
						if( !adds.get(c) )	// Store the ID in adds
							adds.set(c, 0);

						adds.set(c, adds.get(c)+1);

					}

					// Next we check how many times it occurs in the parent asset
					for( let c of baseI ){
						c = getId(c);

						// This one exists both in the base (nonextended object), and in the output
						if( adds.get(c) ){

							adds.set(c, adds.get(c)-1);		// Remove it from newly added items

							// This item exists in both, so we mark it as such instead.
							if( !currents.get(c) )
								currents.set(c, 0);
							currents.set(c, currents.get(c)+1);
							continue;

						}

						// Otherwise if we don't have enough of this item in adds, it's a deletion
						removes.push(c);

					}

					// Check which ones are newly added
					for( let cur of compared[i] ){

						const c = getId(cur);
						
						// This item exists in both, so we decrease the currents counter and continue
						if( currents.get(c) ){

							currents.set(c, currents.get(c)-1);
							continue;

						}

						// This item only exists in the compared output, so we mark it as a newly added item
						build.push(cur);

					}

					// removes now contains the deleted items, and build the newly added ones
					if( debug )
						console.log("removes (__DEL__)", removes, "builds (out)", build, "adds", adds, "currents", currents);


					if(debug)
						console.log("Pre: ", compared[i].slice());
					compared[i] = removes.map(el => {
						return {'__DEL__' : el};
					}).concat(build);

					if( debug ){
						console.log("post", compared[i]);
					}
				}

			}

			// Run comparer on base items changed by mod
			// Iterate over each table in the mod
			for( let i in out ){

				if( !Array.isArray(out[i]) )
					continue;
				
				// We're going to make changes to this list, so shallow-clone the array
				out[i] = out[i].slice();
				const arr = out[i];
				
				//console.log(i, arr.length);
				// Iterate over each asset in the table
				for( let entry in arr ){

					const debug = /*i === 'encounters' && entry == 33*/ false;
					
					arr[entry] = deepClone(arr[entry]);	// make sure we're working on a clone

					const extension = arr[entry];
					// Only viable on extensions
					if( !extension._e )
						continue;

					// Remove unchanged data
					const base = window.mod.parentMod.getAssetById(i, extension._e, false);
					if( !base )
						continue;	// Todo: error?

					// Array comparator
					const comparison = comparer.compare(base, extension, undefined, undefined, undefined/*, debug*/);
					delete comparison.__MOD;

					// Do array compares of extended objects only. The rest we can accept as is.
					// This is because extension object arrays only contain {__DEL__} objects for deletions, and any newly added objects.
					if( extension._ext ){

						handleComparedArrays(base, comparison, debug);

						if( debug ){
							console.log("Comparison after handleComparedArrays", comparison);
							debugger;
						}
					}


					delete comparison._ext;
					removeDel(comparison);
					// mParent is allowed to be the same on both
					if( extension._mParent )
						comparison._mParent = extension._mParent;

					/*
					if( i === "dungeonRoomAssets" )
						console.log("base", base, "extension", extension,  "comparison", comparison);
					*/
					arr[entry] = comparison;

				}

			}

		}

		return out;
	}

	getExtensionFor( type, asset ){

		if( !Array.isArray(this[type]) )
			throw 'Trying to fetch an id from non array: '+type;

		for( let a of this[type] ){

			if( (asset.label && a._e === asset.label) || (asset.id && a._e === asset.id) )
				return a;

		}

	}



	// Note: allows to fetch by label if it exists
	getAssetById( type, id, extend = true ){

		if( !Array.isArray(this[type]) )
			throw 'Trying to fetch an id from non array: '+type;



		for( let asset of this[type] ){

			if( (asset.label && asset.label === id) || (asset.id && asset.id === id) ){

				if( extend ){

					let original;

					// Find an extension for this
					if( asset.__MOD ){

						let base = window.mod.mod.getExtensionFor(type, asset);
						
						if( base && base.id !== id && base.label !== id ){	// Prevent recursion

							// We want to return the asset that extends the original
							original = asset;
							asset = base;

						}

					}

					// Find the root of this
					else if( asset._e ){

						original = window.mod.parentMod.getAssetById( type, asset._e, true);

					}

					if( original && !asset._ext ){


						// Handles arrays with {__DEL__} objects and loads asset keys onto original
						original = Mod.mergeExtensionAssets(original, asset);
						//debugger
						//console.log("Loading", original, "onto", asset);
						// Fill out any unfilled fields from the parentMod asset
						
						// Need to load directly over the asset in library for _ext to work
						for( let i in original ){

							asset[i] = original[i];
							if( typeof asset[i] === 'object' )
								asset[i] = JSON.parse(JSON.stringify(asset[i]));

						}
						
						asset._ext = true;
						

					}

				}

				return asset;
			}

		}

	}

	// Updates an asset based on its ID
	setAssetById( type, newAsset ){
		
		if( !Array.isArray(this[type]) )
			throw 'Trying to fetch an id from non array: '+type;

		for( let i in this[type] ){

			const asset = this[type][i];
			if( asset.id === newAsset.id ){

				this[type][i] = newAsset;
				return;

			}

		}
	}


	// Deletes a single asset
	// Note: allows both label and id and _e, allowing you to technically delete "root" extensions this way by root id
	deleteAsset( type, id, onlyIfParented = false ){

		const yeetSubAssets = (subtype, asset, field ) => {

			let removeThese = asset[field] ? asset[field].slice() : [];

			// _e should be pointing towards root objects
			// get the base asset if possible
			if( asset._e )
				asset = mod.parentMod.getAssetById(type, asset._e, false);

			// If it's not an extension, you can trust the assets are what they say
			if( asset && asset[field] )
				removeThese = removeThese.concat(asset[field]);

			for( let a of removeThese )
				this.deleteAsset(subtype, a, onlyIfParented);

		};

		if( !Array.isArray(this[type]) )
			throw 'Trying to delete an id from non array: '+type;

		for( let i in this[type] ){

			const asset = this[type][i];
			if( asset.id === id || asset.label === id || asset._e === id ){

				if( onlyIfParented && !asset._h && !asset._mParent )
					continue;
				
				this.deleteChildrenOf( type, asset.id || asset.label );	// Delete any child objects recursively. getAssetById is needed to delete extensions
				
				// We deleted an extension, so we gotta delete whatever we were extending as well since they can have either the parent id or extending id
				if( asset._e )
					this.deleteChildrenOf( type, asset._e );
				
				this[type].splice(i, 1);

				// These are types that don't use _mParent for storage reasons, you'll need to manually remove assets here
				// Look in the editor at Editor<type>.assetTable where the parented argument is 2, those fields need manual removal
				// To save space, dungeonRoom doesn't use mParent for assets (it's a one to many relationship), we'll just need to add the assets manually for deletion
				if( type === "dungeonRooms" )
					yeetSubAssets('dungeonRoomAssets', asset, 'assets');

				// roomassets uses special conditions and game actions
				else if( type === "dungeonRoomAssets" ){

					yeetSubAssets('conditions', asset, 'conditions');
					yeetSubAssets('gameActions', asset, 'interactions');

				}
				else if( type === "roleplay" ){
					yeetSubAssets('roleplayStage', asset, 'stages');
				}
				else if( type === "roleplayStage" ){
					yeetSubAssets('texts', asset, 'text');
					yeetSubAssets('roleplayStageOption', asset, 'options');
				}
				else if( type === "roleplayStageOption" ){
					yeetSubAssets('roleplayStageOptionGoto', asset, 'index');
				}

				return true;

			}

		}

	}

	// Deletes any children and extensions of an asset and that one's children recursively
	deleteChildrenOf( type, id ){

		// Stores children that have been removed
		const removeChildren = {};	// Type: (arr)[asset1, asset2...]

		for( let i in this ){

			const db = this[i];
			if( !Array.isArray(db) )
				continue;

			// Filter out any children from the database
			this[i].map(asset => {

				// Find assets that should be deleted
				if( asset._mParent && asset._mParent.type === type && (asset._mParent.label == id || asset._mParent.id === id) ){

					if( !removeChildren[i] )
						removeChildren[i] = [];

					removeChildren[i].push(asset);
					return false;

				}

				return true;

			});

		}

		// Delete them
		//console.log(type, id, removeChildren);
		for( let i in removeChildren ){

			for( let a of removeChildren[i] ){

				//console.log("Removing grandchildren of", a);
				this.deleteAsset(i, a._e || a.label || a.id, true);

			}

		}

	}

	mergeMod( mod ){

		if( !(mod instanceof this.constructor) )
			throw 'Invalid mod';

		for( let i in this ){

			if( !Array.isArray(this[i]) || !Array.isArray(mod[i]) )
				continue;

			console.log("Merging", i);
			let inserts = 0, overwrites = 0;
			for( let asset of mod[i] ){
				try{
					if( this.mergeAsset(i, asset) )
						++overwrites;
					else
						++inserts;
				}
				catch(err){
					console.error(err);
				}
			}
			console.log("Inserts: ", inserts, "overwrites", overwrites);

		}

	}

	// Merges an asset into a member array of this, overwriting if a label or id exists 
	// Returns true if an item was overwritten
	mergeAsset( table, asset ){

		if( !Array.isArray(this[table]) )
			throw 'Table not found';

		if( typeof asset !== "object" )
			throw 'Invalid asset';

		if( !asset.id && !asset.label )
			throw 'Invalid asset, no label or id';

		let mergeBy = 'id';
		if( asset.label )
			mergeBy = 'label';

		const mergeData = asset[mergeBy];
		for( let i in this[table] ){

			const current = this[table][i];
			if( current[mergeBy] === mergeData ){
				console.log("Overwriting", this[table][i], "with", asset);
				this[table][i] = asset;
				return true;
			}

		}

		console.log("inserted asset", asset, asset._h);
		this[table].push(asset);

	}

	// Changes a label of an asset and updates any assets parented to it
	// For assets that are parented, this will update all labels accordingly
	// Also tries to change the label of the child if it's using the parentLabel>>childLabel syntax, and any references to that one in the parent
	updateChildLabels( baseObject, type, preLabel, postLabel ){

		// Scans an object 
		const replaceLabelRecursively = (base, oldLabel, newLabel) => {

			for( let i in base ){

				// Nested objects
				if( typeof base[i] === 'object' )
					replaceLabelRecursively(base[i], oldLabel, newLabel);

				else if( base[i] === oldLabel )
					base[i] = newLabel;

			}

		}

		for( let i in this ){

			const db = this[i];
			if( !Array.isArray(db) )
				continue;

			for( let index in db ){

				const asset = db[index];
				if( asset && asset._mParent && asset._mParent.type === type && asset._mParent.label === preLabel ){

					// Update the label too
					if( asset.label ){

						const old = asset.label;
						let spl = asset.label.split('>>');
						if( spl.length > 1 )
							spl[spl.length-2] = postLabel;

						asset.label = spl.join('>>');

						// Find where it was used in the parent and replace it
						console.log("Trying to replace", old, "with ", asset.label, "in", baseObject);
						replaceLabelRecursively(baseObject, old, asset.label);
						

					}
					asset._mParent.label = postLabel;

				}
				
			}

		}


	}

	
	// If an asset doesn't use _mParent, you'll have to do some manual list searching
	getListObjectParent( parentTable, parentField, id ){

		if( !Array.isArray(this[parentTable]) )
			throw "Trying to get a non existing table: "+parentTable;

		for( let obj of this[parentTable] ){

			if( 
				obj[parentField] === id ||
				(Array.isArray(obj[parentField]) && obj[parentField].includes(id) )
			)return this.getAssetById(parentTable, obj.id || obj.label);

		}

	}

	// Tries to get the parent asset using _mParent. Only works on assets that use _mParent 
	getAssetParent( type, id ){
		
		const asset = this.getAssetById(type, id);
		if( !asset || !asset._mParent )
			return;

		return this.getAssetById(
			asset._mParent.type, 
			asset._mParent.label
		);

	}

	// Resets an ID and inserts it
	insert( table, asset ){

		if( asset === undefined && typeof table === 'object' )
			console.error('You forgot to assign a table in insert');

		let newid = Generic.generateUUID();
		if( Mod.UseID.includes(table) )
			asset.id = newid;
		else{
			asset.label = newid;
			delete asset.id;
		}
		this.mergeAsset(table, asset);

		return newid;

	}

	// Deep clones an asset object and inserts. Returns the new asset
	deepCloneAsset( table, constructor, asset, isSub = false ){

		const 
			obj = new constructor(asset),
			useID = Mod.UseID.includes(table)
		;

		if( useID )
			obj.id = Generic.generateUUID();
		else{
			if( isSub )
				obj.label = Generic.generateUUID();	// Not graceful, but otherwise making clone of a clone of a clone... will create MASSIVE labels
			else 
				obj.label += '_'+Generic.generateUUID();
		}

		// If the constructor doesn't have a save method, it's likely a generic object. If you get recursion errors here the object should probably have a save method
		const out = obj.constructor.saveThis ? obj.constructor.saveThis(obj, "mod") : JSON.parse(JSON.stringify(obj));
		let tag = out.label;
		if( useID ){
			tag = out.id;
			delete out.label;
		}
		else
			delete out.id;

		if( asset._mParent )
			out._mParent = {
				type : asset._mParent.type,
				label : asset._mParent.label
			};
			
		if( asset._h )
			out._h = true;

		if( constructor.getRelations ){

			const rel = constructor.getRelations();
			for( let i in rel ){
				
				if( !out[i] )
					continue;

				const subConstructor = rel[i];
				const subTable = Mod.getTableNameByConstructor(subConstructor);
				const single = !Array.isArray(out[i]);
				let arr = out[i];
				if( single )
					arr = [arr];

				//console.log("Searching", arr, "in", subTable);

				for( let index in arr ){

					const subLabel = arr[index];
					// Legacy
					if( typeof subLabel === "object" ){
						
						arr[index] = JSON.parse(JSON.stringify(subLabel));
						continue;

					}

					// Get existing
					let sub = this.getAssetById(subTable, subLabel);
					//console.log("Found", sub);
					if( !sub )
						continue;

					// Deep clone only if the asset is parented
					if( sub._h || sub._mParent ){

						//console.log("Cloning", sub, "into", subTable);
						const created = this.deepCloneAsset(subTable, subConstructor, sub, true);

						if( sub._mParent )
							created._mParent = {
								type: table,
								label: tag
							};
						if( sub._h )
							created._h = true;

						arr[index] = created.label || created.id;

					}

				}
				
			}

		}
		
		console.trace("Created", out, out._h, "In", table, "from", asset);
		this.mergeAsset(table, out);
		return out;


	}


	// Un-nests legacy nested assets. HandleMissingLinks 1 = search for missing links, 2 = remove missing links. 
	runLegacyConversion( handleMissingLinks = 0 ){

		// Note: this only works on assets that have labels
		const parentCast = (parentLibrary, parent, field, subLibrary) => {

			if( !this[parentLibrary] )
				throw 'Library not found: '+parentLibrary;
			if( !this[subLibrary] )
				throw 'Library not found: '+subLibrary;

			if( typeof parent[field] === 'object' && !Array.isArray(parent[field]) )
				parent[field] = [parent[field]];

			// Special case as this has in the past been treated as either int or array
			if( parentLibrary === 'roleplayStageOption' && field === 'index' ){

				if( typeof parent[field] === 'number' )
					parent[field] = [{index:parent[field]}];

			}

			if( !Array.isArray(parent[field]) )
				return 0;

			let out = 0;
			parent[field] = parent[field].map(el => {

				// Ignore custom override delete objects
				if( typeof el !== 'object' || el.__DEL__ )
					return el;

				// Since this was a sub object, nothing else should have been pointing to it.
				// A lot of assets will have duplicate IDs when entered manually, so let's just reset all the ids
				let newid;

				if( Mod.UseID.includes(subLibrary) ){

					if( !el.id )
						el.id = el.label;
					if( !el.id )
						el.id = Generic.generateUUID();
					newid = el.id;
					
					delete el.label;
					el._h = 1;

				}
				else{

					if( !el.label )
						el.label = el.id;
					if( !el.label )
						el.label = Generic.generateUUID();
					newid = el.label;
					delete el.id;
					let parentid = parent.label;
					el._mParent = {type:parentLibrary, label:parentid};

				}

				if( el.label === '__LABEL__' ){

					el.dummy = el.label;
					el.label = el.name+'_'+(el._stacks || 1);
					newid = el.label;
					delete el._mParent;

				}
				
				let existing = this.getAssetById(subLibrary, newid, false);
				if( existing ){
					
					console.error('Note: Ignoring duplicate id '+newid+" into "+subLibrary+' EXISTING: ', existing, ' NEW IGNORED: ', el);
					// Unparent it if multiple assets are using it
					delete existing._mParent;
					delete existing._h;

				}
				else
					this[subLibrary].push(el);
				++out;
				return newid;

			});

			return out;
		};

		let gameActions = 0;
		// We'll have to do a special case conversion for gameactions
		for( let ga of this.gameActions ){

			if( ga.type === GameAction.types.roleplay ){
				
				if( ga.data && typeof ga.data.rp === "object" ){

					ga.data.rp.label = Generic.generateUUID();
					this.roleplay.push(ga.data.rp);
					ga.data.rp = ga.data.rp.label;
					delete ga.id;
					++gameActions;

				}

			}

		}
		if( gameActions ){
			console.log("Unrolled ", gameActions, "special cases of gameActions");
		}

		let unroll = {
			'dungeonRooms' : {
				'assets' : 'dungeonRoomAssets',
				'encounters' : 'encounters',
			},
			'dungeonRoomAssets' : {
				'conditions' : 'conditions',
				'interactions' : 'gameActions',
			},
			'roleplay' : {
				'stages' : 'roleplayStage',
				'conditions' : 'conditions',
			},
			'roleplayStage' : {
				'text' : 'texts',
				'options' :'roleplayStageOption',
				'game_actions' : 'gameActions',
			},
			'roleplayStageOption' : {
				'index' : 'roleplayStageOptionGoto',
				'game_actions' : 'gameActions',
				'conditions' : 'conditions',
			},
			'players' : {
				'assets' : 'assets',
				'passives' : 'wrappers'
			},
			'playerTemplates' : {
				'random_loot' : 'playerTemplateLoot'
			},
			'assets' : {
				'wrappers' : 'wrappers',
			},
			'actions' : {
				'wrappers' : 'wrappers',
				'riposte' : 'wrappers',
				'show_conditions' : 'conditions',
			},
			'wrappers' : {
				'effects' : 'effects',
				'stay_conditions' : 'conditions',
				'add_conditions' : 'conditions',
			},
			'quests' : {
				'objectives' : 'questObjectives',
				'rewards' : 'questRewards',
			},
			'questObjectives' : {
				'events' : 'questObjectiveEvents',
				'visibility_conditions' : 'conditions',
			},
			'questObjectiveEvents' : {
				'conditions' : 'conditions',
			},
			'texts' : {
				'conditions' : 'conditions',
			},
			'encounters' : {
				'game_actions' : 'gameActions',
				'passives' : 'wrappers',
				'wrappers' : 'wrappers',
			},
			'gameActions' : {
				'conditions' : 'conditions',
			},
			'actionLearnable' : {
				'conditions' : 'conditions'
			},
			'effects' : {
				'conditions' : 'conditions'
			},
			'conditions' : {
				'conditions' : 'conditions',
			},

		};

		// Gets the table we're unrolling
		for( let table in unroll ){

			// Extract the asset from this table
			let updates = {};
			for( let asset of this[table] ){

				// Loop over linked fields in the unrolled table
				for( let field in unroll[table] ){

					let subLibrary = unroll[table][field];							// Library we want to unroll the asset too
					let changes = parentCast(table, asset, field, subLibrary);		// Auto unroll
					// Log it
					if( !updates[subLibrary] )
						updates[subLibrary] = 0;
					updates[subLibrary] += changes; 

					// Find missing assets
					if( handleMissingLinks ){

						let assets = asset[field];		// The array containing the linked assets
						if( Array.isArray(assets) ){	// Might not be present to save storage space

							for( let sub of assets ){

								let find = this.getAssetById(subLibrary, sub);
								if( find )
									continue;
								
								console.log(
									"MISSING LINK", "["+table+"]["+(asset.label || asset.id)+"]["+field+"]", ">>"+sub+"<< not found in "+subLibrary,
									(asset._mParent || "No parent")
								);
								
								if( handleMissingLinks === 2 ){
									// Todo: Remove missing links
								}

							}

						}

					}

					

				}

				// Game actions and conditions will have custom data fields
				if( table === 'gameActions' ){

					let type = asset.type || 'door';

					// Unrolling loot
					if( type === 'loot' && asset.data && asset.data.loot ){

						if( !Array.isArray(asset.data.loot) )
							asset.data.loot = [asset.data.loot];

						let subLibrary = 'assets';
						let changes = parentCast(table, asset.data, 'loot', subLibrary);
						if( !updates[subLibrary] )
							updates[subLibrary] = 0;
						updates[subLibrary] += changes; 

					}

				}

			}

			for( let type in updates ){
				
				if( updates[type] )
					console.log("Updated ", updates[type], type, "in", table);

			}

		}


		for( let rp of this.roleplay ){

			if( !rp.stages )
				continue;

			let stages = rp.stages.map(el => this.getAssetById('roleplayStage', el, false));
			for( let stage of stages ){

				if( stage )
					delete stage.index;

				if( !stage || !stage.options )
					continue;

				for( let opt of stage.options ){

					opt = this.getAssetById('roleplayStageOption', opt, false);
					if( !opt || !opt.index )
						continue;

					opt.index = opt.index.map(el => {

						let goto = mod.mod.getAssetById('roleplayStageOptionGoto', el, false);
						if( !goto ){
							
							// Using the old format with just an array of ints
							if( !isNaN(el) ){

								goto = {
									id : Generic.generateUUID(),
									_h : 1,
									index: el
								};
								this.roleplayStageOptionGoto.push(goto);
								console.log("Converting old numeric goto", goto, "in", rp, stage, opt);

							}
							else
								console.error("Goto ", el, " not found in", rp, stage, opt);

						}

						if( !goto )
							return '';

						if( goto.index === undefined || isNaN(goto.index) || goto.index === "" )
							return goto.id;

						if( goto.index == -1 )
							goto.index = '';
						else if( goto.index == -2 )
							goto.index = '_EXIT_';
						else{

							for( let stage of stages ){

								if( stage.index == goto.index ){

									console.log("Updated", goto, "to", stage);
									goto.index = stage.id;
									return goto.id;

								}


							}
							
							console.error("Stage not found:", goto);

						}

						return goto.id;

					});
					
				}

			}

		}

		let fixedTexts = 0;
		// Fix text parenting
		for( let text of this.texts ){

			if( text.label ){

				text.id = text.label;
				delete text.label;
				++fixedTexts;

			}

		}

		if( fixedTexts )
			console.log("Fixed ", fixedTexts, "improper texts");
		if( handleMissingLinks )
			console.log("missing link search complete");

	}

	findArrayObjects(){
		// Detecting root level objects:
		for( let i in this ){
			if( !Array.isArray(this[i]) || i === 'audioKits' || i === 'hitFX' )
				continue;

			for( let root of this[i] ){
				
				for( let n in root ){
					if( Array.isArray(root[n]) ){
						
						for( let obj of root[n] ){
							
							if( typeof obj === 'object' ){
								console.log("Object detected", obj, "in", i, n);
							}

						}


					}
				}
			}

		}
	}

	findDuplicateGameActions(){

		this.dungeonRooms.map(el => {
			let assets = el.assets.map(d => mod.getAssetById('dungeonRoomAssets', d, false));
			let uas = {};
			for( let asset of assets ){
				if( !Array.isArray(asset.interactions) )
					continue;        
				for( let n of asset.interactions ){
					if( typeof n === "object" )
						throw 'Object detected';
					if( !uas[n] )
						uas[n] = 0;
					++uas[n];
				}
			}
			for( let i in uas ){
				if( uas[i] > 1 ){
					console.log("Duplicates detected of asset:", mod.getAssetById('gameActions', i), uas[i]-1, "in room", el);
				}
			}
		
		});
		
	}

	getAllTags(){

		const out = {};

		for( let i in this ){

			const block = this[i];
			if( !Array.isArray(block) )
				continue;
		
			for( let obj of block ){

				if( Array.isArray(obj?.tags) )
					obj.tags.map(tag => {
						out[tag] = true;
					});

			}
		
		}

		return Object.keys(out);

	}

	// Returns assets with mParent with missing parent assets
	findMissingParents(){

		for( let table in this ){

			if( !Array.isArray(this[table]) )
				continue;

			for( let asset of this[table] ){

				if( !asset._mParent )
					continue;

				if( !Array.isArray(this[asset._mParent.type]) ){
					console.log("["+table+"] Table ", asset._mParent.type," not found for parent in", asset);
					continue;
				}


				const ex = this.getAssetById(asset._mParent.type, asset._mParent.label);
				if( !ex )
					console.log(table, ">>", asset);


			}

		}

	}

	
	// Since I suck at coding, this will go through and fix bugs I've found
	fixIssues(){

		// The dungeon editor was incorrectly parenting unique gameActions tied to assets
		let fixedParents = mod.mod.dungeonRoomAssets.filter(el => {
			let ga = el.interactions;
			if( !ga || !ga.length )
				return false;
		
			let actions = ga.filter(a => {
				const asset = mod.getAssetById('gameActions', a, false);
				if( !asset )
					console.log("Missing asset", a, "in", el);
				else if( !asset._mParent )
					return false;
				else if( asset._mParent.label === 'REPLACE_ID' ){
					asset._mParent.type = 'dungeonRoomAssets';
					asset._mParent.label = el.id;
					return true;
				}
			});
			return actions.length;
		});
		if( fixedParents.length )
			console.log("Fixed ", fixedParents.length, "incorrectly parented dungeonRoomAsset gameActions");

		// Same thing with roleplayStageOption
		fixedParents = mod.mod.roleplayStageOption.filter(el => {
			let ga = el.game_actions;
			if( !ga || !ga.length )
				return false;
		
			let actions = ga.filter(a => {
				const asset = mod.getAssetById('gameActions', a, false);
				if( !asset ){
					console.log("Missing asset", a, "in", el, "(in roleplayStageOption)");
					return false;
				}
				if( !asset._mParent )
					return false;
				let label = el.label || el.id;
				if( asset._mParent.label !== label ){
					asset._mParent.type = 'roleplayStageOption';
					asset._mParent.label = label;
					return true;
				}
			});
			return actions.length;
		});
		if( fixedParents.length )
			console.log("Fixed ", fixedParents.length, "incorrectly parented roleplayStageOption gameActions");
		

		// Same thing with text conditions
		fixedParents = mod.mod.texts.filter(el => {
			let ga = el.conditions;
			if( !ga || !ga.length )
				return false;
		
			let actions = ga.filter(a => {
				const asset = mod.getAssetById('conditions', a, false);
				if( !asset ){
					console.log("Missing asset", a, "in", el);
					return false;
				}
				if( !asset._mParent )
					return false;
				let label = el.id;
				if( asset._mParent.label !== label ){
					asset._mParent.type = 'texts';
					asset._mParent.label = label;
					return true;
				}
			});
			return actions.length;
		});
		if( fixedParents.length )
			console.log("Fixed ", fixedParents.length, "incorrectly parented texts conditions");
				
		// Same thing with roleplayStageOption conditions
		fixedParents = mod.mod.roleplayStageOption.filter(el => {
			let ga = el.conditions;
			if( !ga || !ga.length )
				return false;

			let actions = ga.filter(a => {
				const asset = mod.getAssetById('conditions', a, false);
				if( !asset )
					console.log("Missing asset", a, "in", el);
				else if( !asset._mParent )
					return false;
				else{
					let label = el.label || el.id;
					if( asset._mParent.label !== label ){
						asset._mParent.type = 'roleplayStageOption';
						asset._mParent.label = label;
						return true;
					}
				}
			});
			return actions.length;
		});
		if( fixedParents.length )
			console.log("Fixed ", fixedParents.length, "incorrectly parented roleplayStageOption conditions");


	}

	// Gets data for the JSON exporter, including assets recursively
	// This doesn't handle recursion well. May wanna figure out a way to do that later.
	getExportData( constructor, table, labels = [] ){

		let out = {
			[table] : []
		};

		// Merge an out into this from a recursive call
		const mergeRecursive = inputOut => {

			// Merge it
			for( let subTable in inputOut ){

				if( !inputOut[subTable].length )
					continue;

				if( !out[subTable] )
					out[subTable] = [];
				
				// make sure an asset doesn't exist before adding it
				for( let asset of inputOut[subTable] ){
					
					if( !out[subTable].includes(asset) )
						out[subTable].push(asset);

				}

			}

		};

		for( let label of labels ){

			let asset = this.getAssetById(table, label);
			if( !asset )
				continue;

			out[table].push(asset);

			// Find subs
			if( constructor.getRelations ){
				
				const relations = constructor.getRelations();
				for( let i in relations ){

					// This item field is empty
					const relationField = asset[i];
					if( !relationField || (Array.isArray(relationField) && !relationField.length) )
						continue;

					const subTable = Mod.getTableNameByConstructor(relations[i]);

					// Collections need a getCollectionRelations method on the target classes
					if( relations[i] === Collection ){

						let tmpAsset = new constructor(asset);
						if( !tmpAsset.getCollectionRelations ){
							console.error("Unable to export", asset, constructor.name, "getCollectionRelations method missing from field ", i, ". See GameAction for an example.");
							continue;
						}
						const subs = tmpAsset.getCollectionRelations(i);
						if( typeof subs !== "object" ){
							// The getCollectionRelations method returned a non-object. It will, in many cases tho.
							console.log("Collection relations found for", constructor.name, "field", i, "This may be fine, but if you encounter missing data, look into it.");
							continue;
						}


						let collections = toArray(asset[i]);

						//console.log("Collections", collections, "subs", subs);
						// Cycle the collections
						for( let collection of collections ){

							// Iterate over the collection fields
							for( let subField in subs ){

								// Collection field not set
								if( !collection[subField] || (Array.isArray(collection[subField]) && !collection[subField].length) )
									continue;

								const collectionFieldConstructor = subs[subField];
								const expData = this.getExportData(
									collectionFieldConstructor, // Constructor
									Mod.getTableNameByConstructor(collectionFieldConstructor),
									toArray(collection[subField])
								);
								//console.log("expdata for", subs[subField], Mod.getTableNameByConstructor(collectionFieldConstructor), collection[subField], expData);
								mergeRecursive(expData);

							}

						}
						
					}
					// Get linked data for the related field array/object
					else
						mergeRecursive(this.getExportData(relations[i], subTable, toArray(asset[i])));

					

				}

			}

		}

		return out;
	}

	// mod save goes to databse
	async save( force ){
		
		if( this.id === '__MAIN__' )
			return;

		const out = this.getSaveData();

		const disable = false;
		
		console.log("Got savedata ", out);

		if( disable && !force ){
			console.log("Saving is temporarily disabled");
			return;
		}
		let ret = await Mod.db.mods.put(out);
		return ret;
		
	}

	async delete( conf = true ){


		if( conf && !confirm("Are you sure you want to delete the mod: "+this.name+"?") )
			return false;

		await Mod.db.mods.delete(this.id);
		return true;

	}

	async exportFile( toolVersion, updateBuild = true ){

		if( updateBuild )
			++this.buildNr;
		
		if( toolVersion )
			this.version = toolVersion;

		this.save();

		const data = this.getSaveData();


		const map = {
			keys : {},	// shortened version of: "oldKey" : "shortenedKey". Each key is unique, so you can technically flip it
			meshPaths : []	// Indexed of the old keys
		};

		let keyIndex = 0;

		// Clean up the mod on export
		for( let lib in data ){

			// Needs to have an object mapped for compression
			if( !Mod.LIB_TYPES[lib] || !Array.isArray(data[lib]) )
				continue;

			
			const defaults = new Mod.LIB_TYPES[lib]();							// Create a new object of the library asset type. Ex dungeonRooms -> DungeonRoom
			const keys = Object.keys(defaults).concat(specialSaveFields);		// Filter out keys that shouldn't be saved
			data[lib] = data[lib].map(asset => {

				if( typeof asset !== "object" )
					return asset;

				let aKeys = Object.keys(asset);		// Find keys in the db asset

				// Remove defaults
				for( let i of keys ){
					
					if( asset[i] === defaults[i] && i !== "label" && i !== "id" ) // Label defaults may cause problems since assets aren't rebased when linking
						delete asset[i];

				}

				// Remove unsupported
				for( let i of aKeys ){
					
					if( !keys.includes(i) )
						delete asset[i];

				}

				// Shorten numbers to 6 decimals
				for( let i in asset ){

					if( typeof asset[i] === 'number' )
						asset[i] = Math.round(asset[i]*1000000)/1000000;

				}

				// Run compression
				let out = {};
				for( let i in asset ){

					let newIndex = map.keys[i];
					// Convert all keys into short forms
					// This key label already exists in the map
					if( newIndex ){

						out[newIndex] = asset[i];

					}
					// We need to make a new one
					else{
						
						++keyIndex;
						newIndex = Base64.fromNumber(keyIndex);
						map.keys[i] = newIndex;
						out[newIndex] = asset[i];

					}

					// Special case for dungeonRoomAssets since these make up the bulk of most mods
					if( lib === 'dungeonRoomAssets' && i === 'model' ){

						let val = asset.model;
						const pos = map.meshPaths.indexOf(val);
						if( ~pos )
							out[newIndex] = pos;
						else{

							out[newIndex] = map.meshPaths.length;
							map.meshPaths.push(val);

						}

					}

				}


				
				return out;

			});


		}
		
		
		data._map = map;
		console.log(map, data);
		
		const zip = new JSZip();
		zip.file('mod.json', JSON.stringify(data));
		const content = await zip.generateAsync({
			type:"blob",
			compression : "DEFLATE",
			compressionOptions : {
				level: 9
			}
		});

		const a = document.createElement('a');
		const url = URL.createObjectURL(content);

		a.setAttribute('href', url);
		a.setAttribute('download', this.name.split(" ").join('_')+'_b'+(this.buildNr)+'.fqmod');

		document.body.appendChild(a);
		a.click();
		a.remove();

	}

	static unpackExportData( data ){

		// This is an older mod, return as is
		if( !data._map )
			return data;

		const keyMap = {},		// "oldKey" : "shortenedKey"
			meshPaths = data._map.meshPaths			// Array of mesh paths, indexes are stored in dungeonRoomAssets
		;

		// Flip key values in kv map
		for( let i in data._map.keys ){

			const v = data._map.keys[i];
			keyMap[v] = i;

		}

		// Clean up the mod on export
		for( let lib in data ){

			// Needs to have an object mapped for compression
			if( !Mod.LIB_TYPES[lib] || !Array.isArray(data[lib]) )
				continue;

			data[lib] = data[lib].map(asset => {

				if( typeof asset !== "object" )
					return asset;

				let out = {};

				// Unpack keys
				let aKeys = Object.keys(asset);
				for( let i of aKeys ){
					
					let realIndex = keyMap[i];
					out[realIndex] = asset[i];

					// Grab model from valmap by index
					if( lib === 'dungeonRoomAssets' && realIndex === 'model' )
						out[realIndex] = meshPaths[asset[i]];

				}

				
				return out;

			});


		}

		return data;

	}

	// Handles delete options
	static mergeExtensionAssets( original, extension ){

		let out = {};

		// Searches for an exact entry, entry.label, or entry.id
		const findInArray = (array, label) => {

			for( let i =0; i < array.length; ++i ){

				if( array[i] === label || (array[i] && (array[i].label === label || array[i].id === label)))
					return i;

			}

			return false;

		};

		// Handle arrays. If an array is present in extension but not original, it's accepted directly in the second loop
		for( let i in original ){

			if( i === '_e' || i === '__MOD' )
				continue;

			let og = original[i];
			const ext = extension[i];
			if( Array.isArray(og) && Array.isArray(ext) ){

				out[i] = og.slice();
				og = out[i];

				//console.log(i, out[i], ext);
				//debugger

				for( let e of ext ){

					if( e && e.hasOwnProperty('__DEL__') ){

						let pos = findInArray(og, e.__DEL__);
						//console.log("Found e.__DEL__", e.__DEL__, pos);
						if( pos !== false )
							og.splice(pos, 1);
						continue;

					}

					og.push(e);

				}

				//console.log("SET", og);
				
			}
			else if( typeof og === "object" && typeof ext === "object" ){

				out[i] = this.mergeExtensionAssets(original[i], ext);

			}
			else if( extension[i] )
				out[i] = extension[i]; 
			else
				out[i] = original[i];
			
		}


		// Load any custom extension things onto base
		for( let i in extension ){

			if( i === '_e' || i === '__MOD' )
				continue;

			if( !out.hasOwnProperty(i) ){

				out[i] = extension[i];

				// Might happen if a base array is deleted but the extension has deleted assets, in that case we need to purge deletions here
				if( Array.isArray(out[i]) ){

					out[i] = out[i].filter(el => 
						typeof el !== "object" || !el.hasOwnProperty('__DEL__')
					);

				}

			}

		}

		return out;

	}

	static getTableNameByConstructor( constructor ){

		for( let i in this.LIB_TYPES ){

			if( constructor === this.LIB_TYPES[i] )
				return i;
				
		}

	}

	static async getMainMod(){

		let fetches = await Promise.all([
			Mod.db.cache.get('main_build'),
			fetch('/build_date')
		]);
		const cVer = fetches[0] && fetches[0].data,
			dbVer = await fetches[1].json()
		;

		let mainMod;
		// We already have this one, try to fetch it
		if( dbVer && dbVer.success && dbVer.data === cVer ){
			
			mainMod = await Mod.db.cache.get('main_mod');
			mainMod = mainMod && mainMod.data;

		}
		
		// We don't have the main mod, fetch it and unzip it
		if( !mainMod ){

			console.log("Downloading main mod");
			// Load the main mod
			let data = await JSZipUtils.getBinaryContent('./libraries/MAIN.fqmod');
			data = await JSZip.loadAsync(data);

			const file = data.files['mod.json'];
			if( !file )
				throw 'Missing main mod file';

			mainMod = this.unpackExportData(JSON.parse(await file.async("text")));

			console.log(dbVer);
			// Store it
			if( dbVer && dbVer.data ){
				
				console.log("Storing mod build date", dbVer.data);
				Mod.db.cache.put({id:'main_build', data:dbVer.data});
				Mod.db.cache.put({id:'main_mod', data:mainMod});

			}
		}else
			console.log("Using cached main mod v", dbVer);

		return new this(mainMod);

	}

}

// Stores the constructors bound to the different fields
Mod.LIB_TYPES = {
	'fetishes' : Fetish,
	'conditions' : Condition,
	'effects' : Effect,
	'wrappers' : Wrapper,
	'playerClasses' : PlayerClass,
	'actions' : Action,
	'assets' : Asset,
	'shopAssetTokens' : ShopAssetToken, 
	'shopAssets' : ShopAsset,
	'shops' : Shop,
	'players' : Player,

	'dungeons' : Dungeon,
	'dungeonRooms' : DungeonRoom,
	'dungeonRoomAssets' : DungeonRoomAsset,
	'quests' : Quest,
	'questRewards' : QuestReward,	// Note that this was renamed to questRewards from questReward, not sure if this causes issues
	'questObjectives' : QuestObjective,
	'questObjectiveEvents' : QuestObjectiveEvent,

	'playerTemplates' : PlayerTemplate,
	'playerTemplateLoot' : PlayerTemplateLoot,
	'materialTemplates' : MaterialTemplate,
	'assetTemplates' : AssetTemplate,
	'actionLearnable' : ActionLearnable,
	'factions' : Faction,
	'books' : Book,
	'bookPages' : BookPage,
	'audioKits' : AudioKit,
	'audioTriggers' : AudioTrigger,
	'hitFX' : HitFX,
	'dungeonTemplates' : DungeonTemplate,
	'dungeonSubTemplates' : DungeonTemplateSub,
	'armorEnchants' : ArmorEnchant,

	'encounters' : Encounter,
	'encounterEvents' : EncounterEvent,
	'roleplay' : Roleplay,
	'roleplayStage' : RoleplayStage,
	'roleplayStageOption' : RoleplayStageOption,
	'roleplayStageOptionGoto' : RoleplayStageOptionGoto,
	'gameActions' : GameAction,
	'texts' : Text,
	'gallery' : PlayerGalleryTemplate,
	'loadingTip' : LoadingTip,
};


Mod.db = new Dexie("mod");
Mod.db.version(1).stores({mods: 'id'});
Mod.db.version(2).stores({
	mods: 'id,name,version'
}).upgrade(trans => {
	return trans.mods.toCollection().modify(entry => {
		entry.version = entry.version || '0.0.1';
		entry.name = entry.name || 'Unnamed Mod';
	});
});
Mod.db.version(3).stores({
	mods: 'id,name,version',
	cache : 'id'	// id : type, data : data
});

Mod.Category = {
	Unsorted : 'unsorted',
	Expansion : 'expansion',
	Texts : 'texts',
	Characters : 'characters',
	Monsters : 'monsters',
	Items : 'items',
};

// These tables use ID instead of labels because they're in a one to many relation
// Many to many relations use label
Mod.UseID = [
	'dungeonRoomAssets',
	'texts',
	'roleplayStage',
	'roleplayStageOption',
	'roleplayStageOptionGoto',
	'bookPages',
	'loadingTip'
];

Mod.getNames = async function( force ){

	if( this._cache_names && !force )
		return this._cache_names;
	
	let names = {};	// id:name
	await Mod.db.mods.each(g => {
		let name = g.name;
		if(!name)
			name = "Unnamed";
		names[g.id] = name;
	});
	this._cache_names = names;
	return names;

};

Mod.getAll = async function(){
	let out = [];	// id:name
	await Mod.db.mods.each(g => {
		out.push(new this(g));
	});
	return out;
};

Mod.getByID = async function( id ){

	let g = await Mod.db.mods.get(id);
	if(g)
		return new Mod(g);
	return false;

};

// Takes an event and tries to import a mod from the first file passed to the event
Mod.import = async function( event ){

	const file = event.target.files[0];
	if( !file )
		return;

	const zip = await JSZip.loadAsync(file);

	let mod;
	for( let path in zip.files ){

		if( path !== 'mod.json' )
			continue;

		const entry = zip.files[path];

		try{

			const raw = JSON.parse(await entry.async("text"));
			if( !raw.id || !raw.name )
				throw 'INVALID_ID';
			

			// Unpack raw
			mod = new Mod(this.unpackExportData(raw));

			const existing = await Mod.getByID(raw.id);
			if( existing ){

				if( !confirm("Mod already exists, are you sure you want to overwrite?") )
					return;

			}

			await mod.save();

			// Auto enable it
			let modLoadOrder = {};
			try{
				modLoadOrder = JSON.parse(localStorage.modLoadOrder);
			}catch(err){
				console.error("Mod load order error", err);
				modLoadOrder = {};
			}

			if( !modLoadOrder[mod.label] ){

				const length = Object.values(modLoadOrder).length;
				modLoadOrder[mod.label] = {idx:length, en:true, netgame:false};
				this.saveLoadOrder(modLoadOrder);

			}
			

		}catch(err){

			let reason = "JSON Error";
			if( err === "INVALID_ID" )
				reason = 'Required parameters missing';
			alert("This is not a valid mod file ("+reason+")");
			console.error(err);

		}


		break;

	}

	if( !mod )
		alert("Invalid mod file");

	return mod;

};

// Returns an array of objects sorted by load order: 
// {id:modUUID, name:modName, enabled:modIsEnabled, index:load_order_index(lower first)}
Mod.getModsOrdered = async function(){

	const modNames = await Mod.getNames();
	let modLoadOrder = {};
	const sortedMods = [];
	if( localStorage.modLoadOrder !== undefined ){
		try{
			modLoadOrder = JSON.parse(localStorage.modLoadOrder);
		}catch(err){
			console.error("Mod load order error", err);
			modLoadOrder = {};
		}
	}

	for( let mod in modNames ){
		if( !modLoadOrder[mod] )
			modLoadOrder[mod] = {en:true,idx:-1,netgame:true};
		sortedMods.push({id:mod, name:modNames[mod], enabled:modLoadOrder[mod].en, index:modLoadOrder[mod].idx, netgame:modLoadOrder[mod].netgame});
	}
	sortedMods.sort((a,b) => {
		if( a.index === -1 && b.index !== -1 )
			return 1;
		if( a.index !== -1 && b.index === -1 )
			return -1;
		if( a.index === b.index )
			return 0;
		return a.index < b.index ? -1 : 1;
	});
	return sortedMods;

}


// Stores the mod load order in localStorage
Mod.saveLoadOrder = async function( order ){
	localStorage.modLoadOrder = JSON.stringify(order);
}



