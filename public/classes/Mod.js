import Generic from './helpers/Generic.js';

// Note that DB assets can have a special _mParent : {type:libraryType, label:label/id} 
// which is used to recursively delete children of one to many or one to one relations.
// These _mParent assets are special in that they only appear in the parent editor, and is never listed anywhere
// Ex: roleplayStage always only has one parent roleplay

export default class Mod extends Generic{

	constructor(data){
		super(data);

		// x = not yet implemented
		this.name = '';
		this.description = '';
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
	}

	getSaveData(){
		
		const out = {
			id : this.id,
			name : this.name,
			author : this.author,
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
			gameActions : this.gameActions,
			shops : this.shops,
			shopAssets : this.shopAssets,
			shopAssetTokens : this.shopAssetTokens,
			actionLearnable : this.actionLearnable,
			factions : this.factions,
			dungeonSubTemplates : this.dungeonSubTemplates,
			gallery : this.gallery,
		};

		return out;
	}

	// Note: allows to fetch by label if it exists
	getAssetById( type, id ){

		if( !Array.isArray(this[type]) )
			throw 'Trying to fetch an id from non array: '+type;

		for( let asset of this[type] ){

			if( asset.label === id || asset.id === id )
				return asset;

		}

	}

	// Deletes a single asset
	// Note: allows both label and id
	deleteAsset( type, id ){

		if( !Array.isArray(this[type]) )
			throw 'Trying to delete an id from non array: '+type;

		for( let i in this[type] ){

			const asset = this[type][i];
			if( asset.id === id || asset.label === id ){
				
				this[type].splice(i, 1);
				this.deleteChildrenOf( type, id );	// Delete any child objects recursively
				return true;

			}

		}

	}

	// Deletes any children of an asset and that one's children recursively
	deleteChildrenOf( type, id ){

		const removeChildren = {};	// Type: (arr)[id1, id2...]

		for( let i in this ){

			const db = this[i];
			if( !Array.isArray(db) )
				continue;

			this[i] = this[i].filter(asset => {

				if( asset && asset._mParent && asset._mParent.type === type && (asset._mParent.label == id || asset._mParent.id === id) ){

					if( !removeChildren[i] )
						removeChildren[i] = [];
					removeChildren[i].push(asset.label || asset.id);
					return false;

				}

				return true;

			});

		}

		for( let i in removeChildren ){

			for( let id of removeChildren[i] )
				this.deleteChildrenOf(i, id);

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

	// Tries to get the parent asset using _mParent
	getAssetParent( type, id ){
		
		const asset = this.getAssetById(type, id);
		if( !asset || !asset._mParent )
			return;

		return this.getAssetById(
			asset._mParent.type, 
			asset._mParent.label
		);

	}

	


	// mod save goes to databse
	async save(){
		
		if( this.id === '__MAIN__' )
			return;

		const out = this.getSaveData();
		let ret = await Mod.db.mods.put(out);
		return ret;

	}

	async delete( conf = true ){


		if( conf && !confirm("Are you sure you want to delete the mod: "+this.name+"?") )
			return false;

		await Mod.db.mods.delete(this.id);
		return true;

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


