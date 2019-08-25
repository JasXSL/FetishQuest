import Generic from "./helpers/Generic.js";


export default class PlayerClass extends Generic{


	constructor(...args){
		super(...args);

		this.label = 'none';
		this.name = '';
		this.isMonsterClass = false;
		this.actions = [];				// Used only for NPCs. Players should instead use ActionLearnable.
		this.description = '';
		this.primaryStat = 'none';		// Increases the effect of a primary stat by 50%
		this.player_icon = '';			// TODO: If the player doesn't have an icon, use the class icon instead
		this.name_type = PlayerClass.NameType.None;		// Lets you append or prepend the class name to the player's name. Useful for player templates with many classes.

		// 10 points total, these are floats, and add 10% per point from leveling, rounded up
		this.svPhysical = 0;
		this.svElemental = 0;
		this.svHoly = 0;
		this.svCorruption = 0;

		this.bonPhysical = 0;
		this.bonElemental = 0;
		this.bonHoly = 0;
		this.bonCorruption = 0;

		this.stamina = 0;
		this.intellect = 0;
		this.agility = 0;

		this.load(...args);
	}

	load(data){
		
		this.g_autoload(data);
	}

	save( full ){
		const out = {
			name : this.name,
			primaryStat :  this.primaryStat,
			svPhysical : this.svPhysical,
			svElemental : this.svElemental,
			svHoly : this.svHoly,
			svCorruption : this.svCorruption,
			bonPhysical : this.bonPhysical,
			bonElemental : this.bonElemental,
			bonHoly : this.bonHoly,
			bonCorruption : this.bonCorruption,
			description : this.description,
			stamina : this.stamina,
			intellect : this.intellect,
			agility : this.agility,
			player_icon : this.player_icon,
			name_type : this.name_type
		};
		if( full ){
			out.label = this.label;
			out.isMonsterClass = this.isMonsterClass;
			out.actions = this.actions;
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


