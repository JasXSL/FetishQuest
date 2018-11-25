/*
	This is the content library which handles all the assets
*/
export default class GameLib{

	constructor(){

		this.dungeons = {};
		this.quests = {};
		this.playerClasses = {};
		this.actions = {};
		this.assets = {};
		this.playerTemplates = {};
		this.assetTemplates = {};
		this.audioKits = {};
		this.conditions = {};			//x Condition library
		this.materialTemplates = {};	// AssetTemplate Material
		this.dungeonTemplates = {};
		this.dungeonRoomTemplates = {};
		this.effects = {};
		this.wrappers = {};

		this.texts = [];


	}

	// Loads mods into the library
	loadMods( mods = [] ){

		

	}

	// Adds from game specific custom library
	addCustomPlayers(){

	}

	addCustomAssets(){

	}



	get(){

	}

}