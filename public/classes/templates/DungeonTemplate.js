/*
	This is a template used in the asset generator
*/
import Generic from '../helpers/Generic.js';
import Condition from '../Condition.js';
import Encounter from '../Encounter.js';

class DungeonTemplate extends Generic{

	static getRelations(){ 
		return {
			rooms : DungeonTemplateSub,
			encounters : DungeonTemplateSub
		};
	}

	constructor(...args){
		super(...args);

		this.label = 'fort';	// Generic dark dungeon
		this.rooms = [];		// Viable room templates. Wrapped in DungeonSubtemplate
		this.encounters = [];	// Viable encounter templates. Wrapper in DungeonSubtemplate
		this.allowUp = true;		// Can generate rooms above 0 level
		this.allowDown = true;		// Can generate rooms below 0 level
		this.levers = true;
		this.randomEncounters = false;	// Pick encounters at random instead of picking one

		this.dirLight = '';			// If a room doesn't have dirLight, it can use the dungeon one
		this.fog = 0;				// If a room doesn't have fog, it can use from the dungeon instead
		this.ambiance = 'media/audio/ambiance/dungeon.ogg';
		this.ambiance_volume = 0.2;
		this.lowpass = 0;			// Lowpass filter. Lower value cuts off high frequencies. -1 uses from cell mesh
		this.reverb = '';			// Reverb. Empty uses from cell mesh.
		this.reverbWet = 0;			// Reverb mix. Between 0 (no reverb) and 1 (full). -1 uses from cell mesh
		this.sat = 1.3;				// Base saturation for dungeon

		this.music = '';			// label of an asset, never turned to an object
		this.music_combat = '';		// label of an asset, never turned to an object

		this.load(...args);

	}

	save( full ){
		const out = {
			id : this.id,
			label : this.label,
			rooms : DungeonTemplateSub.saveThese(this.rooms, full),
			encounters : DungeonTemplateSub.saveThese(this.encounters, full),
			randomEncounters : this.randomEncounters,
			dirLight : this.dirLight,
			fog : this.fog,
			ambiance : this.ambiance,
			ambiance_volume : this.ambiance_volume,
			lowpass : this.lowpass,
			reverb : this.reverb,
			reverbWet : this.reverbWet,
			music : this.music,
			music_combat : this.music_combat,
			sat : this.sat,
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){
		this.g_rebase();	// Super
		
	}


	load(data){
		this.g_autoload(data);
	}

}

// Helper wrapper for conditions.
export class DungeonTemplateSub extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition
		};
	}

	constructor(...args){
		super(...args);

		this.label = '';
		this.asset = '';
		this.conditions = [];

		this._asset = null;

		this.load(...args);
	}

	save( full ){
		const out = {
			id : this.id,
			label : this.label,
			asset : this.asset && this.asset.save ? this.asset.save() : this.asset,
			conditions: Condition.saveThese(this.conditions, full),
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}

	rebase(){
		this.g_rebase();	// Super
	}
	
	load(data){
		this.g_autoload(data);
	}

	getAsRoom(){
		
		if( !this._asset )
			this._asset = glib.get(this.asset, 'DungeonRoom');
		return this._asset;

	}

	getAsEncounter(){
		
		if( !this._asset )
			this._asset = glib.get(this.asset, 'Encounter');
		return this._asset;

	}

}


export default DungeonTemplate;
