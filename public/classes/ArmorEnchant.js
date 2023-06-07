// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import { Wrapper } from './EffectSys.js';
import Condition from './Condition.js';

export default class ArmorEnchant extends Generic{

	static getRelations(){ 
		return {
			wrapper : Wrapper,
			conditions : Condition
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.description = '';
		this.wrapper = '';				// Linked to wrappers
		this.conditions = [];
		this.rarity = 0;				// Min rarity for this to show up.
		this.curse = false;				// Sets this as a curse

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			label : this.label,
			description : this.description,
			conditions : Condition.saveThese(this.conditions, full),
			wrapper : Wrapper.saveThis(this.wrapper, full),
			rarity : this.rarity,
			curse : this.curse,
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

