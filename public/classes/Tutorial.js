// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import Generic from './helpers/Generic.js';

/*
	Note: Tutorials are currently clientside, meaning if you don't have a mod enabled, coop players won't see them.
*/

export default class Tutorial extends Generic{

	static initialized = false;
	static active = false;
	static queue = [];
	static widget;
	static interval;

	static getRelations(){ 
		return {
			conditions : Condition,
			steps : TutorialStep, // Needs to be set here or it's not going to clone correctly in the editor
		};
	}

	static getIgnoreAutoLink(){
		return {
			steps : true, // Don't auto-link steps
		}
	}

	static reset(){
		
		let keys = Object.keys(localStorage);
		for( let key of keys ){
			if( key.startsWith('tut_') )
				localStorage.removeItem(key);
		}
		this.queue = [];
		this.active = false;
		this.clear();

	}

	static enabled(){
		return Boolean(!+localStorage.disable_tutorials);
	}

	static setEnabled( enabled ){
		localStorage.disable_tutorials = +!enabled;
		if( !enabled )
			this.clear(false);
		else
			this.drawActiveStep();
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

	static addStages( ids ){

		ids = ids.filter( el => {
			return !this.hasCompletedStep(el) && !this.queue.includes(el) && el !== this.active;
		});
		
		if( !ids.length )
			return;

		this.queue.push(...ids);

		this.saveQueue();
		this.advance();

	}

	static drawActiveStep(){
		
		if( !this.active )
			return;


		const step = glib.get(this.active, 'TutorialStep');
		// This tip is not in our library
		if( !step ){
			this.advance(true);
			return;
		}

		// Find the dom element
		const el = step.getTargetElement();
		
		if( !el || el.offsetParent === null ){
			this.advance(true);
			return;
		}

		this.widget.querySelector("div.content").innerText = step.text;
		this.widget.classList.toggle("hidden", false);
		this.widget.querySelector('div.arrow').classList.toggle('hidden', !step.arrow);

		// Position it
		const dimensions = el.getBoundingClientRect();
		const widgetDimensions = this.widget.getBoundingClientRect();

		let left = dimensions.left+dimensions.width/2-widgetDimensions.width/2;
		let top = dimensions.top-widgetDimensions.height;

		if( left + widgetDimensions.width > window.innerWidth )
			left = window.innerWidth - widgetDimensions.width;
		if( top + widgetDimensions.height > window.innerHeight )
			top = window.innerHeight - widgetDimensions.height;
		if( top < 0 )
			top = 0;
		if( left < 0 )
			left = 0;
		this.widget.style.top = top+'px';
		this.widget.style.left = left+'px';

		clearInterval(this.interval);
		this.interval = setInterval( () => {
			this.drawActiveStep();
		}, 1000);
		

	}

	static advance( force = false ){

		if( this.active && !force )
			return;

		if( this.active )
			this.clear();
		
		// Find the next non-completed step
		while( this.queue.length ){
			const id = this.queue.shift();
			if( !this.hasCompletedStep(id) ){
				this.active = id;
				break;
			}
		}

		
		this.saveQueue();
		
		// Failed to find a valid step
		if( !this.active )
			return;

		game.ui.bindOnNextDraw(this.drawActiveStep.bind(this)); // Wait for the UI to update, since elements may be hidden due to the update limit
		

	}


	// if not manual, we're only hiding it for now, and not clearing active. This is used when turning off tooltips.
	static clear( manual = true ){

		clearInterval(this.interval);
		if( manual )
			this.active = false;
		this.widget.classList.toggle("hidden", true);
		this.saveQueue();
	}

	// should be run only once
	static init(){
		
		this.widget = document.getElementById("tutorialWidget");
		this.queue = JSON.parse(localStorage['tut_QUE'] || '[]');
		this.active = localStorage['tut_ACTIVE'] || false;
		this.widget.onclick = this.onWidgetClick.bind(this);
		this.drawActiveStep();
		this.advance(); // Just in case there's a buffer

	}

	static onWidgetClick( e ){

		window.game.uiClick();
		if( this.active )
			this.setStepCompleted(this.active);
		this.advance(true);

	}

	static onEvent( event ){
		if( !this.enabled() )
			return;

		const arr = glib.tutorial.get(event.type);
		if( !arr )
			return;

		for( let tutorial of arr ){
			if( tutorial.validate(event) ){
				this.addStages(tutorial.steps);
			}
		}

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

	

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

	isCompleted(){
		for( let step of this.steps ){
			if( !this.constructor.hasCompletedStep(step) )
				return false;
		}
		return true;
	}

	validate( evt ){

		if( evt.type !== this.event )
			return false;

		if( this.isCompleted() )
			return false;

		return Condition.all(this.conditions, evt);

	}

}


export class TutorialStep extends Generic{

	constructor(data, parent){
		super(...arguments);

		this.parent = parent;
		this.text = '';
		this.querySelector = '';
		this.arrow = true;

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			text : this.text,
			querySelector : this.querySelector,
			arrow : this.arrow,
		};

		if( full ){
		}

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}

	getTargetElement(){
		return document.querySelector(this.querySelector);
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();
	}



}
