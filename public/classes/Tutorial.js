// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Condition from './Condition.js';
import Game from './Game.js';
import GameEvent from './GameEvent.js';
import { NetworkPlayer } from './NetworkManager.js';
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
		Game.net.playerGetSupportedTuts(); // Need to renegotiate our tutorials

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
		Game.net.playerToggleTutorials(enabled);

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

	// viableNetPlayers is true if it should run on all players. If it's an array, it should only run on those players. A "DM" entry in the array means to run locally.
	static addStages( ids, viableNetPlayers = true ){

		const hostingNetgame = Game.net.isInNetgameHost();

		// If true, it means run on ALL players
		if( viableNetPlayers === true && hostingNetgame )
			viableNetPlayers = Game.net.getTutorialPlayers();


		// First run on myself locally
		if( viableNetPlayers === true || viableNetPlayers.includes('DM') ){
			const myIds = ids.filter( el => {
				return !this.hasCompletedStep(el) && !this.queue.includes(el) && el !== this.active;
			});
			if( myIds.length ){
				this.queue.push(...myIds);
				this.saveQueue();
				this.advance();
			}
		}

		if( hostingNetgame ){
			// Then check the netplayers
			for( let netPlayer of viableNetPlayers ){
				if( netPlayer instanceof NetworkPlayer )
					netPlayer.runTutorialSteps(ids);
			}

		}

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
		let arrow = step.arrow;
		let el = step.getTargetElement();
		if( !el || el.offsetParent === null ){ // Fall back to main menu if target isn't found
			el = document.getElementById('gameIcons');
			arrow = false;
		}

		this.widget.querySelector("div.content").innerText = step.text;
		this.widget.classList.toggle("hidden", false);
		this.widget.querySelector('div.arrow').classList.toggle('hidden', !arrow);

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

		const enabled = this.enabled();
		if( !Game.net.isInNetgameHost() && !enabled )
			return;

		const arr = glib._tutorial.get(event.type);
		if( !arr )
			return;

		

		for( let tutorial of arr ){

			const valid = tutorial.validate(event);
			if( valid === false )
				continue;
			this.addStages(tutorial.steps, valid);

		}

	}

	constructor(data, parent){
		super(...arguments);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.steps = [];				// Doesn't need to convert
		this.conditions = [];
		this.event = GameEvent.Types.gameStart;

		this._conditions = [];			// Check these. As they'll have the myActivePlayer condition broken out
		this._playerSpecific = false;			// Set to true when a myActivePlayer condition is present, in which case it's only run against active players
		this._playerSpecificSender = false;		// Specifies that the above setting should be checked for the sender instead of target

		this.load(data);
	}

	// These are run entirely locally from DB and never saved in the game itself. It uses localStorage to track which ones are completed.
	save( full ){

		const out = {
			
			label : this.label,
			steps : this.steps.slice(),
			
		};


		if( full ){
			out.id = this.id;
			out.conditions = Condition.saveThese(this.conditions, full);
			out.event = this.event;
		}
		// Sending to netgame
		else{
			out.steps = this.steps.map( el => glib.get('TutorialStep', el) );
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

		this._conditions = [];
		for( let cond of this.conditions ){

			if( cond.type === Condition.Types.targetIsMyActivePlayer ){
				this._playerSpecific = true;
				this._playerSpecificSender = cond.caster;
			}
			else
				this._conditions.push(cond);

		}

	}

	isCompleted(){

		const netgameHost = Game.net.isInNetgameHost();
		let players;
		if( netgameHost )
			players = Game.net.getTutorialPlayers();

		// See if we have at least one incomplete step
		for( let step of this.steps ){

			if( !this.constructor.hasCompletedStep(step) )
				return false;

			// we're hosting a netgame, so we'll need to check all the players that have tutorials enabled
			if( netgameHost && players && players.length ){

				for( let player of players ){
					if( player.tut.includes(step) )
						return false;
				}

			}


		}

		

		return true;

	}

	// Returns an array of netplayers, or true if we're not in a netgame
	// Always returns false on failure
	validate( evt ){

		if( evt.type !== this.event )
			return false;

		if( this.isCompleted() )
			return false;

		if( !Condition.all(this._conditions, evt) )
			return false;

		// Check which players to run against
		if( this._playerSpecific ){

			let targArr = toArray(evt.target);
			if( this._playerSpecificSender )
				targArr = toArray(evt.sender);

			targArr = targArr.filter(el => el.netgame_owner).map(el => el.id);

			let out = [];
			// The netplayer MUST be included as an event target in order to run
			const players = Game.net.getTutorialPlayers();
			for( let player of players ){
				
				if( targArr.includes(player.active) )
					out.push(player);

			}


			// A special case is needed for the host
			const hostPlayer = game.getMyActivePlayer();
			if( hostPlayer && targArr.includes(hostPlayer.id) )
				out.push('DM');

			if( !out.length )
				return false;

			return out;

		}

		return true;


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
