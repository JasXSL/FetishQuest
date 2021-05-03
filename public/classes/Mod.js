import Comparer from './Comparer.js';
import GameAction from './GameAction.js';
import Generic from './helpers/Generic.js';

/* DB Asset special fields: 
	_mParent : {type:libraryTableName, label:label/id} 
		Used to recursively delete children of one to many or one to one relations.
		Ex: roleplayStage always only has one parent roleplay

	_e : Built into every Generic object
	_ext : true -> Already extended (not saved)
	_h : hidden from main list
*/

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
		this.playerClasses = [];	//x Custom player classes
		this.conditions = [];			//x Condition library
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

		this.load(data);
	}

	clone(){
		return new this.constructor(JSON.parse(JSON.stringify(this.getSaveData())));
	}

	load( data ){
		
		// Legacy reasons, can remove in the future
		if( data && data.dungeonEncounters )
			data.encounters = data.dungeonEncounters;
		this.g_autoload(data);

		
	}

	rebase(){
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
			playerClasses : this.playerClasses,
			conditions : this.conditions,
			playerTemplates : this.playerTemplates,
			playerTemplateLoot :  this.playerTemplateLoot,
			assetTemplates : this.assetTemplates,
			materialTemplates: this.materialTemplates,
			dungeonTemplates: this.dungeonTemplates,
			effects : this.effects,
			wrappers : this.wrappers,
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
		};

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

		const handleComparedArrays = (base, compared) => {

			const getId = c => {
				if( typeof c === "object" )
					return c.label || c.id;
				return c;
			};

			for( let i in compared ){

				// Not an array, HANDLE IT
				if( !Array.isArray(compared[i]) ){

					if( typeof compared[i] === "object" && typeof base[i] === "object" )
						compared[i] = handleComparedArrays(base[i], compared[i]);

					continue;
				}

				// Awe shiet, we have an array
				let removes = [], build = [], adds = new Map(), currents = new Map();	// Label : amount
				// Check how many of each entry we have
				for( let c of compared[i] ){
					c = getId(c);
					
					if( !adds.get(c) )
						adds.set(c, 0);

					adds.set(c, adds.get(c)+1);

				}
				// Check which ones have been removed
				for( let c of base[i] ){
					c = getId(c);

					if( adds.get(c) ){

						adds.set(c, adds.get(c)-1);

						if( !currents.get(c) )
							currents.set(c, 0);
						currents.set(c, currents.get(c)+1);
						continue;

					}

					removes.push(c);

				}
				// Check which ones are newly added
				for( let cur of compared[i] ){
					const c = getId(cur);
					
					if( currents.get(c) ){

						currents.set(c, currents.get(c)-1);
						continue;

					}
					build.push(cur);

				}

				console.log(removes, build, adds, currents);


				compared[i] = removes.map(el => {
					return {'__DEL__' : el};
				}).concat(build);

			}

		}

		// Run comparer on items changed by mod
		for( let i in out ){

			if( !Array.isArray(out[i]) )
				continue;
			
			// We're going to make changes to this list, so shallow-clone the array
			out[i] = out[i].slice();
			const arr = out[i];
			
			for( let entry in arr ){

				const clone = {};
				for( let i in arr[entry] ){

					if( i !== '_ext' )
						clone[i] = arr[entry][i];

				}
				arr[entry] = clone;

				const extension = arr[entry];
				if( !extension._e )
					continue;

				// Remove unchanged data
				const base = window.mod.parentMod.getAssetById(i, extension._e, false);
				if( !base )
					continue;	// Todo: error?

				// Array comparator
				const comparison = comparer.compare(base, extension);
				delete comparison.__MOD;
				handleComparedArrays(base, comparison);

				removeDel(comparison);
				// mParent is allowed to be the same on both
				if( extension._mParent )
					comparison._mParent = extension._mParent;

				arr[entry] = comparison;

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
	deleteAsset( type, id ){

		//console.log("Delete", type, id);

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
				this.deleteAsset(subtype, a);

		};

		if( !Array.isArray(this[type]) )
			throw 'Trying to delete an id from non array: '+type;

		for( let i in this[type] ){

			const asset = this[type][i];
			if( asset.id === id || asset.label === id || asset._e === id ){
				
				//console.log("Found it!", type, asset);
				this.deleteChildrenOf( type, id );	// Delete any child objects recursively. getAssetById is needed to delete extensions
				
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
				this.deleteAsset(i, a._e || a.label || a.id);

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



	// Un-nests legacy nested assets
	runLegacyConversion(){

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

				if( typeof el !== 'object' )
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

		for( let table in unroll ){

			let updates = {};
			for( let asset of this[table] ){

				// Unroll direct fields
				for( let field in unroll[table] ){

					let subLibrary = unroll[table][field];
					let changes = parentCast(table, asset, field, subLibrary);
					if( !updates[subLibrary] )
						updates[subLibrary] = 0;
					updates[subLibrary] += changes; 

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

}

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
			
			mod = new Mod(raw);
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



