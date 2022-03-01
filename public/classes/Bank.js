// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import GameAction from './GameAction.js';
import Asset from './Asset.js';

export default class Bank extends Generic{

	static getRelations(){ 
		return {
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.player = '';				// Player ID
		this.items = [];				// Asset objects

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			player : this.player,
			items : Asset.saveThese(this.items, full),
		};

		if( full ){
			
		}

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super


	}

	getFreeSlots(){
		return Bank.MAX_SLOTS-this.items.length;
	}

	// Takes an asset and moves it to the bank
	stash( asset, amount ){

		

	}

}

Bank.MAX_SLOTS = 32;


