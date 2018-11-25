import Text from './Text.js';
import Condition from './Condition.js';
import { Effect, Wrapper } from './EffectSys.js';
import PlayerClass from './PlayerClass.js';
import Action from './Action.js';
import Asset from './Asset.js';
import Dungeon from './Dungeon.js';
import Quest from './Quest.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';
import DungeonTemplate, { RoomTemplate } from './templates/DungeonTemplate.js';
import { AudioKit } from './Audio.js';


const LIB_TYPES = {
	'conditions' : Condition,
	'effects' : Effect,
	'wrappers' : Wrapper,
	'playerClasses' : PlayerClass,
	'actions' : Action,
	'assets' : Asset,

	'dungeons' : Dungeon,
	'quests' : Quest,

	'playerTemplates' : PlayerTemplate,
	'materialTemplates' : MaterialTemplate,
	'assetTemplates' : AssetTemplate,
	'audioKits' : AudioKit,
	'dungeonRoomTemplates' : RoomTemplate,
	'dungeonTemplates' : DungeonTemplate,
};

/*
	This is the content library which handles all the assets
*/
export default class GameLib{

	constructor(){

		this.conditions = {};			//x Condition library
		this.playerClasses = {};
		this.dungeons = {};
		this.quests = {};
		this.actions = {};
		this.assets = {};
		this.playerTemplates = {};
		this.assetTemplates = {};
		this.audioKits = {};
		this.materialTemplates = {};	// AssetTemplate Material
		this.dungeonTemplates = {};
		this.dungeonRoomTemplates = {};
		this.effects = {};
		this.wrappers = {};

		

		this.texts = [];


	}

	// Loads a mod db array onto one of this objects
	loadModOnto( db, obj, constructor ){
		for( let asset of db )
			obj[asset.label] = new constructor(asset);
	}

	// Loads mods into the library
	loadMods( mods = [] ){

		console.log("Loading mods", mods);
		const load_order = [
			'conditions',
			'effects',
			'wrappers',
			'playerClasses',
			'actions',
			'assets',

			'dungeons',
			'quests',

			'playerTemplates',
			'materialTemplates',
			'assetTemplates',
			'audioKits',
			'dungeonRoomTemplates',
			'dungeonTemplates',
		];
		

		for( let mod of mods ){
			
			for( let k of load_order ){
				if( Array.isArray(mod[k]) )
					this.loadModOnto(mod[k], this[k], LIB_TYPES[k]);
			}
			
			// Texts can be last, it's not linked to anything other than conditions
			if( mod.texts )
				this.texts = this.texts.concat(mod.texts.map(el => new Text(el)));

		}
		console.log("MODS FINISHED LOADING. LIBRARY:", this);

	}

	// Adds from game specific custom library
	addCustomPlayers(){

	}

	addCustomAssets(){

	}

	// Gets by asset constructor name
	get( label, constructorName ){

		for( let i in LIB_TYPES ){
			if( constructorName === LIB_TYPES[i].name )
				return this[i][label];
		}

	}

	getLibraryByConstructorName( cName ){
		for( let i in LIB_TYPES ){
			if( cName === LIB_TYPES[i].name )
				return this[i];
		}
	}

}