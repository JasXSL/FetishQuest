// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import Generic from './helpers/Generic.js';

export default class Tutorial extends Generic{

	static initialized = false;
	static active = false;
	static queue = [];
	static widget;
	

	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}

	static reset(){
		let keys = Object.keys(localStorage);
		for( let key of keys ){
			if( key.startsWith('tut_') )
				localStorage.removeItem(key);
		}
	}

	static hasCompletedStep( id ){
		return Boolean(localStorage['tut_'+id]);
	}

	static setStepCompleted( id ){
		localStorage['tut_'+id] = true;
	}

	static saveQueue(){
		localStorage['tut_QUE'] = JSON.stringify(this.queue);
		localStorage['tut_ACTIVE'] = this.active || '';
	}

	static addStages( ...ids ){
		this.queue.push(...ids);
		this.saveQueue();
		this.advance();
	}

	static drawActiveStep(){
		
		if( !this.active )
			return;

		const step = glib.get(id, 'TutorialStep');
		

	}

	static advance( force = false ){

		if( !this.queue.length )
			return;

		if( this.active && !force )
			return;

		if( this.active )
			this.clear();
		
		const id = this.queue.shift();
		this.active = id;
		this.widget.classList.toggle("hidden", false);

		// Only save on force (clicked by a user)
		this.saveQueue();

		this.drawActiveStep();
		
	}


	static clear(){
		this.active = false;
		this.widget.classList.toggle("hidden", true);
		this.saveQueue();
	}

	static init(){
		
		this.widget = document.getElementById("tutorialWidget");
		this.queue = JSON.parse(localStorage['tut_QUE'] || '[]');
		this.active = localStorage['tut_ACTIVE'] || false;
		this.drawActiveStep();
		
	}

	static onEvent( event ){

		// todo

	}

	constructor(data, parent){
		super(...arguments);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.steps = [];				// Doesn't need to convert
		this.conditions = [];
		this.event = GameEvent.Types.gameStart;

		this.load(data);
	}

	// These are run entirely locally from DB and never saved in the game itself. It uses localStorage to track which ones are completed.
	save( full ){

		const out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full),
			label : this.label,
			steps : this.steps.slice(),
			event : this.event,
		};

		if( full ){
		}

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}

	setCompleted(){

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


class TutorialStep extends Generic{

	constructor(data, parent){
		super(...arguments);

		this.parent = parent;
		this.text = '';
		this.querySelector = '';

		this.load(data);
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();
	}



}
