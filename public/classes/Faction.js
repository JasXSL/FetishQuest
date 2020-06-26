import Generic from './helpers/Generic.js';

export default class Faction extends Generic{

	constructor(data, parent){
		super(data);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.desc = '';
		this.standing = 0;

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			label : this.label,
			name : this.name,
			desc : this.desc,
			standing : this.standing,
		};

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		
	}

}

Faction.Standings = {
	exalted : 300,
	honored : 200,
	friendly : 100,
	neutral : 0,
	disliked : 100,
	hated : -200,
	hostile : -300,
};
