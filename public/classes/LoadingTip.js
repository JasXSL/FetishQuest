// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Condition from './Condition.js';
import Generic from './helpers/Generic.js';

export default class LoadingTip extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition
		};
	}

	constructor(data, parent){
		super(...arguments);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.text = '';
		this.conditions = [];

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions),
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

	validate( evt ){

		return Condition.all(this.conditions, evt);

	}

}
