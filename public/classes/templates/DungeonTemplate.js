/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Asset from '../Asset.js';
import Encounter from '../Encounter.js';

class DungeonTemplate extends Generic{
	constructor(...args){
		super(...args);

		this.label = 'fort';	// Generic dark dungeon
		this.rooms = [];		// Viable room templates
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

	rebase(){}


	load(data){
		this.g_autoload(data);
	}
}

export default DungeonTemplate;
