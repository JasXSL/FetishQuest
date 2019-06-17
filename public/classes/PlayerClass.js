import Generic from "./helpers/Generic.js";


export default class PlayerClass extends Generic{


	constructor(...args){
		super(...args);

		this.label = 'none';
		this.name = '';
		this.isMonsterClass = false;
		this.actions = [];			// labels for library abilities this class should have. Abilities will be auto added based on levels
		this.description = '';
		this.primaryStat = 'none';		// Increases the effect of a primary stat by 50%

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

	// Returns all available actions for level, or ALL if level is a NaN value
	getAvailableActions( level ){
		if(isNaN(level))
			level = Infinity;

		let out = [];
		let lib = glib.getFull("Action");
		for( let i in lib ){
			let a = lib[i];
			if( a.level <= level && ~this.actions.indexOf(a.label) )
				out.push(a);
		}

		return out;
	}


}


