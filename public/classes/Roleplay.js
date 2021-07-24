import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import GameAction from './GameAction.js';
import Game from './Game.js';
import Text from './Text.js';
export default class Roleplay extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			stages : RoleplayStage,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		this.desc = '';				// Editor description
		
		this.stage = '';
		this.persistent = false;	// If set to true, the stage is saved and continued from there. Otherwise if you close and re-open, it resets to 0
		this.completed = false;
		this.label = '';
		this.stages = [];			// Roleplay stages
		this.player = '';
		this.portrait = '';
		
		this.conditions = [];
		this.once = false;			// Roleplay doesn't retrigger after hitting a -1 option. Stored in the dungeon save.
		this.autoplay = true;

		this._waiting = false;		// Waiting to change stage
		this._targetPlayer = '';	// Can be set on roleplay stage to store the target, for use with texts and conditions

		this.load(data);

	}

	getActiveStage(){

		if( !this.stage )
			return this.stages[0];

		for( let stage of this.stages ){
			if( stage.id === this.stage )
				return stage;
		}
		return false;

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
			player : this.player,
			conditions : Condition.saveThese(this.conditions),
			once : this.once,
			portrait : this.portrait,
			_targetPlayer : this._targetPlayer
		};

		if( full ){
			out.autoplay = this.autoplay;
			out.desc = this.desc;
		}
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
		this.g_rebase();	// Super
		
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
		if( window.game && window.game !== true && this.label && game.is_host && glib && !glib.loading ){

			let state = game.state_roleplays[this.label];

			// Reset to default
			if( !state )
				state = {
					stage : 0,
					completed : false
				};

			if( this.persistent && state.hasOwnProperty("stage") && state.stage !== -1 )
				this.stage = state.stage;

			if( this.once && state.hasOwnProperty("completed") ){
				this.completed = state.completed;
			}

		}

		return this;

	}

	clone(parent){

		let out = new this.constructor(Roleplay.saveThis(this, true), parent);
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
	// If index is '' it's finished
	// If index is '_EXIT_' it's finished but completed isn't saved
	setStage( index, delay=false, player = false ){

		if( index === '' || index === '_EXIT_' ){

			if( this.once && index !== '_EXIT_' )
				this.completed = true;
			game.clearRoleplay(true);
			
		}
		else{
			
			let fn = () => {

				this.stage = index;
				const stage = this.getActiveStage();
				
				if( stage )
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

	onStart( player ){

		this._targetPlayer = '';
		const stage = this.getActiveStage();
		if( stage )
			stage.onStart( player );

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

	getText( player ){

		if( typeof this.stage === "string" )
			return this.stage;
		return this.stage.getText(player);

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
	game.speakAs( chat.sender.id, chat.getText( chat.sender ) );
	this.timer = setTimeout(() => {
		
		this.timer = false;
		RoleplayChatQueue.next();

	}, 1000);

};


export class RoleplayStage extends Generic{

	static getRelations(){ 
		return {
			text : Text,
			options : RoleplayStageOption,
			game_actions : GameAction,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		//this.index = 0;
		this.portrait = '';
		this.name = '';
		this.text = [];				// Text objects. When loading you can also make this a string and it auto converts into a roleplay
		this.options = [];
		this.player = '';			// Player label of the one who is speaking
		this.chat = RoleplayStageOption.ChatType.default;
		this.store_pl = false;		// Store player as parent._targetPlayer for use in conditions and texts
		this.shuffle_texts = RoleplayStage.Shuffle.NONE;	// Shuffles the text order

		this._iniPlayer = '';		// ID of player that triggered this stage
		this._textEvent = null;	// Caches the active text event so the text doesn't change randomly.
									// Not persistent between refreshes, but what can ya do.
		this.game_actions = [];			// GameActions to apply when encountering this stage

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
			//index : this.index,
			portrait : this.portrait,
			name : this.name,
			options : RoleplayStageOption.saveThese(this.options, full),
			player : this.player,
			chat : this.chat,
			_iniPlayer : this._iniPlayer,
			text : Text.saveThese(this.text, full),	// Needed for netcode
			shuffle_texts : this.shuffle_texts,
		};

		if( full ){
			
			out.store_pl = this.store_pl;
			out.game_actions = GameAction.saveThese(this.game_actions, full);
		}
		if( full !== "mod" ){
			
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super

		if( !this.id )
			this.id = Generic.generateUUID();
		
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
	async onStart( player ){

		this._textEvent = false;
		if( !player )
			player = game.getMyActivePlayer();

		if( player ){
			
			this._iniPlayer = player.id;
			if( this.store_pl )
				this.parent._targetPlayer = player.id;

		}

		const pl = this.getPlayer();
		if( pl && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output(pl, this);

		for( let act of this.game_actions ){
			await act.trigger(player, pl);
		}

		const tevt = this.getTextEvent();
		tevt.text.triggerVisuals(tevt);
		
	}

	isDefaultStage(){
		const firstStage = this.parent && this.parent.stages[0];
		if( !firstStage )
			return false;
		return firstStage === this || firstStage === this.id || firstStage.id === this.id; 
	}

	// Scans for the first viable text and returns an event with that object and the target player attached
	// If no texts pass filter, the last one is returned
	// TextPlayer is the NPC you are talking to in the RP. If it's missing it becomes the same as the target player.
	// Debug resets the currently selected text and tries to generate a new one
	getTextEvent( debug = false ){

		if( this._textEvent && !debug ){
			return this._textEvent;
		}
		const players = game.getTeamPlayers();
		const textPlayer = this.getPlayer();
		const evt = new GameEvent({
			sender:textPlayer,
			dungeon : game.dungeon,
			room : game.dungeon.getActiveRoom()
		});
		const initiating = this.getInitiatingPlayer();
		// Fallback in case you fail to add the player to the scene
		if( !textPlayer )
			evt.sender = players[0];

		let allTexts = this.text.slice();
		if( this.shuffle_texts === RoleplayStage.Shuffle.ALL )
			shuffle(allTexts);
		else if( this.shuffle_texts === RoleplayStage.Shuffle.ALL_BUT_LAST ){

			let last = allTexts.pop();
			shuffle(allTexts);
			allTexts.push(last);

		}

		for( let text of allTexts ){

			evt.text = text;
			evt.target = initiating;

			// If initiating player exists outside of the first stage, always use that 
			if( initiating && !this.isDefaultStage() ){

				if( text.validate(evt, debug) ){
					
					this._textEvent = evt;
					return evt;

				}
				continue;

			}

			// Even if it's the first stage, see if initiating player is valid first
			if( text.validate(evt, debug) ){
				
				this._textEvent = evt;
				return evt;

			}


			// Otherwise try all players, but prefer initiating
			for( let player of players ){
				
				if( player === initiating )
					continue;

				evt.target = player;
				if( text.validate(evt, debug) ){
					
					this._textEvent = evt;
					return evt;

				}

			}
		}

		evt.text = allTexts[allTexts.length-1];
		evt.target = initiating || players[0];
		this._textEvent = evt;
		return evt;

	}

	// Returns an unescaped string with the active text
	// convertMe will replace /me at the start with the name of the sender
	getText( convertMe = false ){
		
		const textEvt = this.getTextEvent();
		if( convertMe ){

			textEvt.text = textEvt.text.clone();
			textEvt.text.text = textEvt.text.text.replace('/me', '%S');
			
		}

		const textOutput = textEvt.text.run(textEvt, true);
		return textOutput;

	}

	

}

RoleplayStage.Shuffle = {
	NONE : 0,
	ALL : 1,
	ALL_BUT_LAST : 2,
};




export class RoleplayStageOption extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			game_actions : GameAction,
			index : RoleplayStageOptionGoto
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = [];			// Target index. An array of goto objects. Integers get converted to goto objects. The first valid one will be picked or an exit option will be created.
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
		this.g_rebase();	// Super

		if( !this.id )
			this.id = Generic.generateUUID();

	}


	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full)
		};

		if( full ){
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
			target : player,
			dungeon : game.dungeon,
			room : game.dungeon.getActiveRoom()
		});
		return Condition.all(this.conditions, evt);

	}

	getText( player ){

		if( !player )
			player = game.getMyActivePlayer();
		
		let text = new Text({text:this.text});
		// this.parent.getInitiatingPlayer()
		// Responses use your active player as sender, main text uses whoever got you to that stage
		return text.run(new GameEvent({sender:player, target:this.parent.getPlayer()}), true);

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
		Game.net.dmRpOptionSelected(this.id);

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
		
		// if none are valid, create a quick end rp
		return new RoleplayStageOptionGoto({}, this);

	}

}

RoleplayStageOption.ChatType = {
	default : 0,		// Output into chat. Use /me for emote
	none : 2,			// Don't output chat
};

export class RoleplayStageOptionGoto extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = '';
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
		this.g_rebase();	// Super
		
		if( !this.id )
			this.id = Generic.generateUUID();
		
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
