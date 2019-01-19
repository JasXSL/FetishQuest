import Generic from './helpers/Generic.js';

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
			hitFX : this.hitFX
		};
		return out;
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
			modLoadOrder[mod] = {en:true,idx:-1};
		sortedMods.push({id:mod, name:modNames[mod], enabled:modLoadOrder[mod].en, index:modLoadOrder[mod].idx});
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


