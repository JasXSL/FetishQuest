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
		this.playerTemplates = [];		// NPC generator templates
		this.assetTemplates = [];		// Asset templates
		this.materialTemplates = [];	// AssetTemplate Material
		this.dungeonTemplates = [];
		this.effects = [];
		this.dungeonRoomTemplates = [];	
		this.wrappers = [];
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


