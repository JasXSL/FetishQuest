import Generic from "./helpers/Generic.js";
import Player from "./Player.js";


export default class PlayerClass extends Generic{

	constructor(...args){
		super(...args);

		this.label = 'none';
		this.name = '';
		this.monster_only = false;
		// Todo: delete this and make it actionlearnable for NPCs too
		this.description = '';
		this.name_type = PlayerClass.NameType.None;		// Lets you append or prepend the class name to the player's name. Useful for player templates with many classes.

		// 10 points total, these are floats, and add 10% per point from leveling, rounded up
		this.svPhysical = 0;
		this.svArcane = 0;
		this.svCorruption = 0;
		
		this.momType = Player.MOMENTUM.Off;				// Gain 1 extra momentum of this type at the start of your turn. Can be -1 to turn off.

		this.bonPhysical = 0;
		this.bonArcane = 0;
		this.bonCorruption = 0;
		this.load(...args);
	}

	load(data){
		
		this.g_autoload(data);
	}

	save( full ){
		const out = {
			label : this.label,	// Needed for class conditions
			name : this.name,
			svPhysical : this.svPhysical,
			svArcane : this.svArcane,
			svCorruption : this.svCorruption,
			bonPhysical : this.bonPhysical,
			bonArcane : this.bonArcane,
			bonCorruption : this.bonCorruption,
			description : this.description,
			name_type : this.name_type
		};
		if( full ){
			out.monster_only = this.monster_only;
		}

		if( full !== "mod" ){
			
		}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}



}

PlayerClass.NameType = {
	None : 0,
	Suffix : 1,
	Prefix : 2,
};


