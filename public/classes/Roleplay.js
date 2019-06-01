import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import GameAction from './GameAction.js';
import { DungeonEncounter } from './Dungeon.js';
import Game from './Game.js';
export default class Roleplay extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.stage = 0;
		this.persistent = false;	// If set to true, the stage is saved and continued from there. Otherwise if you close and re-open, it resets to 0
		this.completed = false;
		this.label = '';
		this.title = '';
		this.stages = [];			// Roleplay stages
		this.player = '';
		this.conditions = [];
		this.once = false;			// Roleplay doesn't retrigger after hitting a -1 option. Stored in the dungeon save.
		
		this._waiting = false;		// Waiting to change stage

		this.load(data);

	}

	getActiveStage(){
		for( let stage of this.stages ){
			if( stage.index === this.stage )
				return stage;
		}
		return false;
	}

	getViableStages( player ){
		return this.stages.filter(stage => stage.validate(player));
	}

	validate( player ){
		return this.getViableStages( player ).length;
	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			label : this.label,
			stages : RoleplayStage.saveThese(this.stages, full),
			persistent : this.persistent,
			title : this.title,
			player : this.player,
			conditions : Condition.saveThese(this.conditions),
			once : this.once,
		};

		if( full !== "mod" ){
			out.completed = this.completed;
			out.stage = this.stage;
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		
		this.stages = RoleplayStage.loadThese(this.stages, this);
		this.conditions = Condition.loadThese(this.conditions, this);

		if( this.once && !this.label )
			console.error("ONCE roleplay doesn't have a label", this);

		if( this.hasGameParent() ){
			this.loadState();
		}		
	}

	// This is false if the roleplay is in the library
	hasGameParent(){
		let parent = this.parent;
		while( parent ){
			if( parent instanceof Game )
				return true;
			parent = parent.parent;
		}
	}

	loadState(){
		// When loaded from a game, grab from state
		if( window.game && window.game !== true && this.label && game.state_roleplays[this.label] ){
			const state = game.state_roleplays[this.label];
			if( this.persistent && state.hasOwnProperty("stage") && state.stage !== -1 )
				this.stage = state.stage;
			if( this.once && state.hasOwnProperty("completed") )
				this.completed = state.completed;
		}
	}

	clone(parent){

		let out = new this.constructor(this.save(true), parent);
		return out;

	}


	getNextIndex(){

		let i = -1;
		for( let stage of this.stages ){
			if( stage.index > i )
				i = stage.index;
		}
		return i+1;

	}

	setStage( index, delay=false ){

		if( index === -1 ){
			if( this.once )
				this.completed = true;
			game.clearRoleplay(true);
		}
		else{
			let fn = () => {
				this.stage = index;

				const stage = this.getActiveStage();
				if( index > -1 && stage )
					stage.onStart();
				game.ui.rpOptionSelected('');
				game.ui.draw();
				this._waiting = false;
				game.saveRPState(this);
				game.save();
			};
			if( delay ){
				this._waiting = true;
				setTimeout(fn, 1000);
			}
			else
				fn();
		}

		if( this.persistent || this.once ){
			game.saveRPState(this);
		}
		
	}

	getPlayer(){
		return game.getPlayerByLabel(this.player);
	}

	onStart(){
		const stage = this.getActiveStage();
		if( stage )
			stage.onStart();
	}

	validate( player, debug ){
		const evt = new GameEvent({
			sender : player,
			target : player,
			roleplay : this
		});
		return Condition.all(this.conditions, evt, debug);
	}

}

// queued chats
class RoleplayChatQueue{
	
	constructor( sender, text, type ){
		
		this.sender = sender;
		this.text = text;
		this.type = type || RoleplayStageOption.ChatType.default;

	}

}
RoleplayChatQueue.timer = false;
RoleplayChatQueue.queue = [];
RoleplayChatQueue.output = function( sender, text, type ){
	
	this.queue.push(new RoleplayChatQueue(sender, text, type));
	this.next();

};
RoleplayChatQueue.next = function(){

	if( this.timer )
		return;

	if( !this.queue.length )
		return;

	
	const chat = this.queue.shift();
	game.speakAs( chat.sender.id, chat.text );
	this.timer = setTimeout(() => {
		this.timer = false;
		RoleplayChatQueue.next();
	}, 1000);

};


export class RoleplayStage extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = 0;
		this.icon = '';
		this.name = '';
		this.text = '';
		this.options = [];
		this.player = '';			// Player label
		this.chat = RoleplayStageOption.ChatType.default;

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			label : this.label,
			index : this.index,
			icon : this.icon,
			name : this.name,
			text: this.text,
			options : RoleplayStageOption.saveThese(this.options, full),
			player : this.player,
			chat : this.chat,
		};

		if( full ){}
		if( full !== "mod" ){
			
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){

		if( !this.id ){
			this.id = this.parent.id+'_'+this.index;
		}

		this.options = RoleplayStageOption.loadThese(this.options, this);
		

	}

	getOptions( player ){
		return this.options.filter(opt => opt.validate(player));
	}

	getOptionById( id ){
		for( let option of this.options ){
			if( option.id === id )
				return option;
		}
	}

	getPlayer(){
		
		let pl = game.getPlayerByLabel(this.player);
		if( pl )
			return pl;

		return this.parent.getPlayer();

	}

	getName(){
		if( this.name )
			return esc(this.name);
		const pl = this.getPlayer();
		if( pl )
			return pl.getColoredName();
		return '';
	}

	onStart( player ){

		if( !player )
			player = game.getMyActivePlayer();

		const pl = this.getPlayer();
		if( pl && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output(pl, this.text, this.chat);
		
	}

}

export class RoleplayStageOption extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = 0;			// Target index
		this.text = '';
		this.chat = RoleplayStageOption.ChatType.default;			// Chat type
		this.conditions = [];
		this.game_actions = [];

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}
	// Automatically invoked after g_autoload
	rebase(){
		
		if( !this.id )
			this.id = this.parent.id+'_'+this.index;
		this.conditions = Condition.loadThese(this.conditions, this);
		this.game_actions = GameAction.loadThese(this.game_actions, this);
		
	}


	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full)
		};

		if( full ){
			out.index = this.index;
			out.chat = this.chat;
			out.game_actions = GameAction.saveThese(this.game_actions, full);
		}
		
		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}

	getRoleplay(){

		return this.parent.parent;

	}

	
	validate( player ){

		const evt = new GameEvent({
			sender : player,
			target : player
		});
		return Condition.all(this.conditions, evt);

	}

	use( player ){

		if( !this.validate(player) )
			return false;
		
		

		const rp = this.getRoleplay();
		const pl = this.parent.getPlayer();
		if( player && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output( player, this.text, this.chat );

		for( let act of this.game_actions )
			act.trigger(player, pl);

		game.ui.rpOptionSelected(this.id);
		game.net.dmRpOptionSelected(this.id);
		rp.setStage(this.index, true);
		
		return true;

	}

}

RoleplayStageOption.ChatType = {
	default : 0,		// Output into chat
	emote : 1,			// todo: implement
	none : 2,			// Don't output chat or emote
};

