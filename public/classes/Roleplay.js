import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import GameAction from './GameAction.js';
import Game from './Game.js';
import Text from './Text.js';
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
		this.portrait = '';
		this.conditions = [];
		this.once = false;			// Roleplay doesn't retrigger after hitting a -1 option. Stored in the dungeon save.
		this.autoplay = true;

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
			portrait : this.portrait,
		};

		if( full )
			out.autoplay = this.autoplay;

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
		if( window.game && window.game !== true && this.label && game.state_roleplays[this.label] && glib && !glib.loading ){
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

	// Note:
	// If index is -1 it's finished
	// If index is -2 it's finished but completed isn't saved
	setStage( index, delay=false, player = false ){

		if( index < 0 ){
			if( this.once && index === -1 )
				this.completed = true;
			game.clearRoleplay(true);
		}
		else{
			let fn = () => {
				this.stage = index;

				const stage = this.getActiveStage();
				if( index > -1 && stage )
					stage.onStart(player);
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
	
	// Stage can either be a RoleplayStage or a string
	constructor( sender, stage ){
		
		this.sender = sender;
		this.stage = stage;

	}

	getText(){

		if( typeof this.stage === "string" )
			return this.stage;
		return this.stage.getText();

	}

}
RoleplayChatQueue.timer = false;
RoleplayChatQueue.queue = [];
RoleplayChatQueue.output = function( sender, stage ){
	
	this.queue.push(new RoleplayChatQueue(sender, stage));
	this.next();

};
RoleplayChatQueue.next = function(){

	if( this.timer )
		return;

	if( !this.queue.length )
		return;

	
	const chat = this.queue.shift();
	game.speakAs( chat.sender.id, chat.getText() );
	this.timer = setTimeout(() => {
		
		this.timer = false;
		RoleplayChatQueue.next();

	}, 1000);

};


export class RoleplayStage extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.index = 0;
		this.portrait = '';
		this.name = '';
		this.text = [];				// Text objects. When loading you can also make this a string and it auto converts into a roleplay
		this.options = [];
		this.player = '';			// Player label of the one who is speaking
		this.chat = RoleplayStageOption.ChatType.default;

		this._iniPlayer = '';		// ID of player that triggered this stage
		this._textEvent = null;	// Caches the active text event so the text doesn't change randomly.
									// Not persistent between refreshes, but what can ya do.

		this.load(data);

	}

	load(data){

		// RP-ify text only roleplays
		if( data && typeof data.text === "string" )
			data.text = [{text:data.text}];

		this.g_autoload(data);

	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			index : this.index,
			portrait : this.portrait,
			name : this.name,
			text: Text.saveThese(this.text, full),
			options : RoleplayStageOption.saveThese(this.options, full),
			player : this.player,
			chat : this.chat,
			_iniPlayer : this._iniPlayer,
		};

		if( full ){
			
			out.label = this.label;

		}
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

		this.text = Text.loadThese(this.text, this);
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

	// Player who triggered this stage
	getInitiatingPlayer(){
		return game.getPlayerById(this._iniPlayer);
	}

	getPlayer(){
		
		let pl = game.getPlayerByLabel(this.player);
		if( pl )
			return pl;

		return this.parent.getPlayer();

	}

	getPortrait(){
		if( this.portrait )
			return this.portrait;
		return this.parent.portrait;
	}

	getName(){
		if( this.name )
			return esc(this.name);
		const pl = this.getPlayer();
		if( pl )
			return pl.getColoredName();
		return '';
	}

	// When the stage is initially presented
	onStart( player ){

		this._textEvent = false;

		if( !player )
			player = game.getMyActivePlayer();

		if( player )
			this._iniPlayer = player.id;

		const pl = this.getPlayer();
		if( pl && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output(pl, this);
		
	}

	// Scans for the first viable text and returns an event with that object and the target player attached
	// If no texts pass filter, the last one is returned
	// TextPlayer is the NPC you are talking to in the RP. If it's missing it becomes the same as the target player.
	getTextEvent(){

		if( this._textEvent ){
			return this._textEvent;
		}
		const players = game.getTeamPlayers();
		const textPlayer = this.getPlayer();
		const evt = new GameEvent({sender:textPlayer});

		for( let text of this.text ){

			evt.text = text;
			for( let player of players ){

				if( !textPlayer )
					evt.sender = player;
				evt.target = player;
				if( text.validate(evt) ){
					
					this._textEvent = evt;
					return evt;

				}

			}
		}

		evt.text = this.text[this.text.length-1];
		evt.target = players[0];
		this._textEvent = evt;
		return evt;

	}

	// Returns an unescaped string with the active text
	getText(){
		
		const textEvt = this.getTextEvent();
		const textOutput = textEvt.text.run(textEvt, true);
		return textOutput;

	}

	

}

export class RoleplayStageOption extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.index = [];			// Target index. An array of goto objects or integers. Integers get converted to goto objects. The first valid one will be picked or an exit option will be created.
		this.text = '';
		this.chat = RoleplayStageOption.ChatType.default;			// Chat type
		this.conditions = [];
		this.game_actions = [];

		this.load(data);

	}

	load(data){
		if( data && data.index !== undefined && !Array.isArray(data.index) )
			data.index = toArray(data.index);
		this.g_autoload(data);
	}
	// Automatically invoked after g_autoload
	rebase(){
		
		if( !this.id )
			this.id = this.parent.id+'_'+this.index;
		this.conditions = Condition.loadThese(this.conditions, this);
		this.game_actions = GameAction.loadThese(this.game_actions, this);
		this.index = RoleplayStageOptionGoto.loadThese(this.index, this);

	}


	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full)
		};

		if( full ){
			out.label = this.label;
			out.index = RoleplayStageOptionGoto.saveThese(this.index, full);
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

	getText(){
		
		let text = new Text({text:this.text});
		return text.run(new GameEvent({sender:this.parent.getInitiatingPlayer(), target:this.parent.getPlayer()}), true);

	}

	async use( player ){

		if( !this.validate(player) )
			return false;
		
		

		const rp = this.getRoleplay();
		const pl = this.parent.getPlayer();
		if( player && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output( player, this );

		// Do this first to set the waiting flag
		game.ui.rpOptionSelected(this.id);
		game.net.dmRpOptionSelected(this.id);

		const goto = this.getIndex( player );

		rp.setStage(goto.index, true, player);
		
		// Do these last as they might force a UI draw, which might draw the wrong RP option
		for( let act of this.game_actions ){
			await act.trigger(player, pl);
		}

		return true;

	}

	// Where do we go to after pushing the button?
	getIndex( target ){

		for( let opt of this.index ){
			if( opt.validate(target) )
				return opt;
		}
		
		return new RoleplayStageOptionGoto({index : -1}, this);

	}

}

RoleplayStageOption.ChatType = {
	default : 0,		// Output into chat
	emote : 1,			// todo: implement
	none : 2,			// Don't output chat or emote
};

class RoleplayStageOptionGoto extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = -1;
		this.conditions = [];

		this.load(data);

	}

	load(data){
		if( !isNaN(data) )
			data = {index:data};
		this.g_autoload(data);
	}
	// Automatically invoked after g_autoload
	rebase(){
		
		if( !this.id )
			this.id = this.parent.id+'_'+this.index;
		this.conditions = Condition.loadThese(this.conditions, this);
		
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			index : this.index,
			conditions : Condition.saveThese(this.conditions, full)
		};

		
		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}
	
	validate( target ){

		let sender = this.parent.parent.getPlayer();
		if( !sender )
			sender = target;

		const evt = new GameEvent({
			sender : sender,
			target : target
		});
		return Condition.all(this.conditions, evt);

	}

}
