/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import { DungeonRoom } from '../Dungeon.js';
import Encounter from '../Encounter.js';

class DungeonTemplate extends Generic{

	

	constructor(...args){
		super(...args);

		this.label = 'fort';	// Generic dark dungeon
		this.rooms = [];		// Viable room templates
		this.encounters = [];	// Viable encounter templates
		this.allowUp = true;		// Can generate rooms above 0 level
		this.allowDown = true;		// Can generate rooms below 0 level
		this.levers = true;
		
		this.load(...args);

	}

	save( full ){
		const out = {
			label : this.label,
			rooms : this.rooms,
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){

		this.rooms = DungeonRoom.loadThese(this.rooms);
		this.encounters = Encounter.loadThese(this.encounters);

	}


	load(data){
		this.g_autoload(data);
	}

}


export default DungeonTemplate;
