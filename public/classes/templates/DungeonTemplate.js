/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Condition from '../Condition.js';
import Encounter from '../Encounter.js';

class DungeonTemplate extends Generic{

	

	constructor(...args){
		super(...args);

		this.label = 'fort';	// Generic dark dungeon
		this.rooms = [];		// Viable room templates. Wrapped in DungeonSubtemplate
		this.encounters = [];	// Viable encounter templates. Wrapper in DungeonSubtemplate
		this.allowUp = true;		// Can generate rooms above 0 level
		this.allowDown = true;		// Can generate rooms below 0 level
		this.levers = true;
		
		this.load(...args);

	}

	save( full ){
		const out = {
			id : this.id,
			label : this.label,
			rooms : this.rooms,
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){

		this.rooms = DungeonTemplateSub.loadThese(this.rooms);
		this.encounters = DungeonTemplateSub.loadThese(this.encounters);

	}


	load(data){
		this.g_autoload(data);
	}

}

// Helper wrapper for conditions.
export class DungeonTemplateSub extends Generic{

	constructor(...args){
		super(...args);

		this.label = '';
		this.asset = '';
		this.conditions = [];

		this.load(...args);
	}

	save( full ){
		const out = {
			id : this.id,
			label : this.label,
			asset : this.asset && this.asset.save ? this.asset.save() : this.asset,
			conditions: Condition.saveThese(this.conditions),
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){

		this.conditions = Condition.loadThese(this.conditions);

	}
	
	load(data){
		this.g_autoload(data);
	}


}


export default DungeonTemplate;
