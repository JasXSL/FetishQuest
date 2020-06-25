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
		this.quests = [];		//x mod prefab quests
		this.vars = {};			//x default modvars. Modvars are stored in Game, these are just defaults
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
		this.dungeonTemplates = [];
		this.effects = [];
		this.dungeonRoomTemplates = [];	
		this.wrappers = [];
		this.dungeonEncounters = [];
		this.hitFX = [];
		this.roleplay = [];
		this.roleplayStage = [];
		this.roleplayStageOption = [];
		this.gameActions = [];
		this.shops = [];
		this.actionLearnable = [];
		this.factions = [];
		this.load(data);
	}

	clone(){
		return new this.constructor(JSON.parse(JSON.stringify(this.getSaveData())));
	}

	
	load( data ){
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
			quests : this.quests,
			vars : this.vars,
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
			dungeonRoomTemplates : this.dungeonRoomTemplates,
			wrappers : this.wrappers,
			dungeonEncounters : this.dungeonEncounters,
			players : this.players,
			hitFX : this.hitFX,
			roleplay : this.roleplay,
			roleplayStage : this.roleplayStage,
			roleplayStageOptions : this.roleplayStageOption,
			gameActions : this.gameActions,
			shops : this.shops,
			actionLearnable : this.actionLearnable,
			factions : this.factions,
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


	// Changes a label of an asset and updates any assets parented to it
	// For assets that are parented, this will update all labels accordingly
	updateChildLabels( type, preLabel, postLabel ){

		for( let i in this ){

			const db = this[i];
			if( !Array.isArray(db) )
				continue;

			for( let index in db ){

				const asset = db[index];
				if( asset && asset._mParent && asset._mParent.type === type && asset._mParent.label === preLabel )
					asset._mParent.label = postLabel;
				
			}

		}


	}




	// mod save goes to databse
	async save(){
		
		if( this.id === '__MAIN__' )
			return;

		const out = this.getSaveData();
		let ret = await Mod.db.mods.put(out);
		return ret;

	}

	async delete(){
		let ret = await Mod.db.mods.delete(this.id);
		return ret;
	}

}

Mod.db = new Dexie("mod");
Mod.db.version(1).stores({
	mods: 'id'
});

Mod.getNames = async function(){
	let names = {};	// id:name
	await Mod.db.mods.each(g => {
		let name = g.name;
		if(!name)
			name = "Unnamed";
		names[g.id] = name;
	});
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


