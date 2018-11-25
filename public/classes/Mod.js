import Generic from './helpers/Generic.js';

export default class Mod extends Generic{

	constructor(data){
		super(data);

		// x = not yet implemented
		this.name = '';
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

	
	load( data ){
		this.g_autoload(data);
	}

	rebase(){
	}

	save( full ){
		const out = {
			id : this.id,

		};
		// Not really gonna need a full because these are never output to webplayers
		return out;
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

Mod.getByID = async function( id ){
	let g = await Mod.db.mods.get(id);
	if(g)
		return new Mod(g);
	return false;
};


