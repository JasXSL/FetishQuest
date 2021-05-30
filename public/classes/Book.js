// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import GameAction from './GameAction.js';

export default class Book extends Generic{

	static getRelations(){ 
		return {
			game_actions : GameAction,
			pages : BookPage
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.game_actions = [];
		this.pages = [];

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			label : this.label,
			name : this.name,
			pages : BookPage.saveThese(this.pages, full),
		};

		if( full ){
			out.game_actions = GameAction.saveThese(this.game_actions, full);
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

}

export class BookPage extends Generic{

	static getRelations(){ 
		return {
			
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.text = '';

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			text : this.text
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
		this.g_rebase();	// Super


	}


}