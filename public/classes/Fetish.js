// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import GameAction from './GameAction.js';

export default class Fetish extends Generic{

	static getRelations(){ 
		return {
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.description = '';

		this.load(data);
	}

	save( full ){

		const out = {
			label : this.label,
			description : this.description,
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

}
