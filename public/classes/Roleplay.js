import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import GameAction from './GameAction.js';
import Game from './Game.js';
import Text from './Text.js';
import Collection from './helpers/Collection.js';
import Calculator from './Calculator.js';
import Player from './Player.js';
import { Effect } from './EffectSys.js';
export default class Roleplay extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			playerConds : Condition,
			stages : RoleplayStage,
			gameActions : GameAction,
			closeActions : GameAction,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		this.desc = '';				// Editor description
		
		this.stage = '';			// Active stage (game only)
		this.persistent = false;	// If set to true, the stage is saved and continued from there. Otherwise if you close and re-open, it resets to 0
		this.completed = false;		// Completed or not (game only)
		this.label = '';
		this.stages = [];			// Roleplay stages
		this.player = '';
		this.portrait = '';			// Supports gameicon. If empty, it'll try fetching portrait from the player object
		
		this.conditions = [];
		this.once = false;			// Roleplay doesn't retrigger after hitting a -1 option. Stored in the dungeon save.
		this.autoplay = true;		// Auto start when tied to an encounter gameAction
		this.apOnce = false;		// Use with autoplay to only make it autoplay once
		this.vars_persistent = false;	// Makes rpVars persistent and show up in global mathvars
		this.playerConds = [];		// When not empty, all enabled players will be shuffled and these conditions are checked against all.
		this.minPlayers = 1;		// With playerConds set: Minimum players that must be validated. Use -1 for ALL players on the player team.
		this.maxPlayers = -1;		// -1 = infinite
		this.gameActions = [];		// Ran after building the targetPlayers list. The main purpose of having this here is to allow sorting players BEFORE starting the RP.
		this.closeActions = [];		// Ran whenever the RP is closed. Can be useful to remove characters in expEvts.

		this.vars = new Collection({}, this);	// Like dungeonvars, but tied to an RP. Loaded onto by state. 
		this._vars = null;	// Vars we're working on

		this._waiting = false;		// Waiting to change stage
		this._targetPlayers = [];	// Set automatically when the roleplay starts, containing the instigators. 
									// Can also be set on roleplay stage to store the target, for use with texts and conditions
		this.load(data);

	}

	getActiveStage(){

		if( this.stage === '0' )	// Netcode will convert to string. This is a legacy fix.
			this.stage = 0;

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

		let vars = this._vars;
		if( !(vars instanceof Collection) )
			vars = Collection.loadThis(vars);

		let out = {
			id : this.id,
			label : this.label,
			stages : RoleplayStage.saveThese(this.stages, full),
			persistent : this.persistent,
			player : this.player,
			conditions : Condition.saveThese(this.conditions, full),
			playerConds : Condition.saveThese(this.playerConds, full),
			once : this.once,
			portrait : this.portrait,
			_targetPlayers : this._targetPlayers,
			_vars : vars.save(full),
		};

		if( full ){
			out.vars = this.vars.save(full);
			out.autoplay = this.autoplay;
			out.apOnce = this.apOnce;
			out.desc = this.desc;
			out.minPlayers = this.minPlayers;
			out.maxPlayers = this.maxPlayers;
			out.gameActions = GameAction.saveThese(this.gameActions, full);
			out.closeActions = GameAction.saveThese(this.closeActions, full);
			out.vars_persistent = this.vars_persistent;
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

		this.vars = Collection.loadThis(this.vars, this);
		if( !this._vars )
			this._vars = this.vars.clone();
		else
			this._vars = Collection.loadThis(this.vars, this);

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
				state = new Collection({
					stage : 0,
					completed : false,
					stages : new Collection()
				});

			// Game hasn't loaded yet
			if( !(state instanceof Collection) )
				return;
				
			if( this.vars_persistent && state.hasOwnProperty('vars') ){
				for( let i in state.vars )
					this._vars[i] = state.vars[i];
			}

			if( this.persistent && state.hasOwnProperty("stage") && state.stage !== -1 )
				this.stage = state.stage;

			if( this.once && state.hasOwnProperty("completed") ){
				this.completed = state.completed;
			}

			const cStages = state.get("stages");
			if( cStages instanceof Collection ){

				for( let stage of this.stages ){

					const cStage = cStages.get(stage.id);
					if( !cStage )
						continue;

					const cOpts = cStage.get("options");
					if( cOpts instanceof Collection ){

						for( let opt of stage.options ){

							const cOpt = cOpts.get(opt.id);
							if( !cOpt )
								continue;

							let v = cOpt.get('_roll');
							if( v !== undefined )
								opt._roll = v;
							v = cOpt.get('_mod');
							if( v !== undefined )
								opt._mod = v;

						}

					}

				}

			}


		}

		return this;

	}

	clone(parent){

		let out = new this.constructor(Roleplay.saveThis(this, true), parent);
		return out;

	}


	appendMathVars( input, event ){

		input['rp_targs'] = this._targetPlayers.length;

		let v = this._vars;
		for( let i in v )
			Calculator.appendMathVar('rp_'+this.label+'_'+i, v[i], input, event);
		
	}

	// Returns an array of Player objects of this._targetPlayers found in the game player list
	getTargetPlayers(){
		return this._targetPlayers.map(el => game.getPlayerById(el)).filter(el => el);
	}

	// Accepts an array of player objects or ids
	setTargetPlayers( players ){

		this._targetPlayers = players.map(el => {
			if( typeof el === 'string' )
				return el;
			return el.id;
		});

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
			this.stage = '';
			game.clearRoleplay(true);
			
		}
		else{
			
			// This is where it's actually triggering
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

		game.saveRPState(this);
		
	}

	// 
	canSaveState(){
		if( this.persistent || this.once || this.vars_persistent || this.apOnce )
			return true;

		for( let stage of this.stages ){
			
			for( let opt of stage.options ){

				if( opt.canSaveState() )
					return true;

			}
			
		}

		return false;
	}

	getPlayer(){

		if( !this.player )
			return false;
		let att = game.getPlayerByLabel(this.player);
		if( att )
			return att;
		return glib.get(this.player, 'Player');

	}

	onStart( players ){

		this._targetPlayers = [];
		if( Array.isArray(players) )
			this._targetPlayers = players.map(el => {
				if( typeof el === 'string' )
					return el;
				return el.id;
			});

		const evt = new GameEvent({sender:this.getPlayer(), target:players, roleplay:this});
		// Run gameActions
		for( let action of this.gameActions ){
			action.trigger(
				players, 
				undefined, 			// mesh
				false, 				// Debug
				this.getPlayer(),	// Sender
				evt					// Forces a conditions check
			);
		}
		
		const stage = this.getActiveStage();
		if( stage )
			stage.onStart( players );

	}

	onClose(){

		const pl = this.getPlayer();
		const evt = new GameEvent({sender:pl, target:pl, roleplay:this});
		// Run gameActions
		for( let action of this.closeActions ){
			action.trigger(
				pl, 
				undefined, 			// mesh
				false, 				// Debug
				pl,					// Sender
				evt					// Forces a conditions check
			);
		}



	}

	// On success, returns an array of target players. Otherwise, returns false.
	validate( player, debug ){

		const sender = this.getPlayer();
		const evt = new GameEvent({
			sender : sender,
			target : player,
			roleplay : this,
			dungeon : game.dungeon,
			room : game.dungeon.getActiveRoom(),
		});
		if( !Condition.all(this.conditions, evt, debug) )
			return false;

		let targs = [];
		if( player )
			targs.push(player);

		let out = [];
		// PlayerConditions set. We'll need to pick targets, otherwise just return player
		if( this.playerConds.length && (this.minPlayers !== 0 && !isNaN(this.minPlayers)) ){

			if( this.minPlayers < 0 )
				targs = game.getTeamPlayers();
			else 
				targs = game.getEnabledPlayers();
			targs = shuffle(targs);
			

			let maxPlayers = this.maxPlayers;

			for( let targ of targs ){

				evt.target = targ;
				if( Condition.all(this.playerConds, evt, debug) )
					out.push(targ);

				// Can end early if we have enough players.
				// But if minPlayers are set, we need to check EVERY player
				if( maxPlayers > -1 && out.length >= maxPlayers && this.minPlayers >= 0 )
					break;

			}

			if( this.minPlayers >= 0 && out.length < this.minPlayers )
				return false;
			
			if( this.minPlayers < 0 && out.length < targs.length )
				return false;


		}
		else if( player )	// Clear throws an issue without this if, since player is undefined on rp clear
			out = [player];

		return out;

	}

	// Returns an array of var_persistent RPs
	static getPersistent(){

		let out = [];
		let all = this.getLib();
		for( let i in all ){
			let rp = all[i];
			if( rp.vars_persistent ){
				// If not already loaded
				if( !rp.hasGameParent() ){
					// Create a mini clone just for vars
					rp = new Roleplay({
						label : rp.label,
						vars : rp._vars
					});	
					rp.loadState();
				}
				out.push(rp);
			}
		}
		return out;

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
		return this.stage.getText(player, true);

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
	game.speakAs( chat.sender, chat.getText( chat.sender ) );
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
		this.store_pl = RoleplayStage.StoreType.IGNORE;		// Alter the parent._targetPlayers for use in conditions and texts
		this.shuffle_texts = RoleplayStage.Shuffle.NONE;	// Shuffles the text order
		this.game_actions = [];			// GameActions to apply when encountering this stage
		this.target = RoleplayStage.Target.auto;			// Selects who is considered the "target" when reaching this stage
		this.leave = false;				// Automatically adds an option for [Leave]

		// local
		this._iniPlayer = '';		// ID of player that triggered this stage. If there are multiple players, the first one is picked.
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
			//index : this.index,
			portrait : this.portrait,
			name : this.name,
			options : RoleplayStageOption.saveThese(this.options, full),
			player : this.player,
			chat : this.chat,
			_iniPlayer : this._iniPlayer,
			text : Text.saveThese(this.text, full),	// Needed for netcode
			shuffle_texts : this.shuffle_texts,
			leave : this.leave,
		};

		if( full ){
			out.target = this.target;
			out.store_pl = this.store_pl;
			out.leave = this.leave;
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

	// Selected can be an ID of the selected option. We never hide the selected option since we need to show what a player successfully clicked
	getOptions( player, selected ){

		if( !this.options.length && window.game && !this.leave ){
			this.options.push(new RoleplayStageOption({
				text : '[Done]',
				chat : RoleplayStageOption.ChatType.none,
			}, this));
		}
		// Create leave option
		if( this.leave && !this.getOptionById("leave") && window.game ){

			this.options.push(new RoleplayStageOption({
				id : 'leave',
				text : '[Leave]',
				chat : RoleplayStageOption.ChatType.none,
			}, this));

		}
		return this.options.filter(opt => opt.id === selected || opt.validate(player));
	}

	getOptionById( id ){
		for( let option of this.options ){
			if( option.id === id )
				return option;
		}
	}

	// Player or players who triggered this stage
	getInitiatingPlayer(){

		let ptp = this.parent.getTargetPlayers();
		if( this.target === RoleplayStage.Target.firstRpTarget )
			return ptp[0];
		if( this.target === RoleplayStage.Target.rpTargets )
			return ptp;
		return game.getPlayerById(this._iniPlayer);

	}
	
	getPlayer(){
		
		if( this.player ){
			// Try from stage first
			let pl = game.getPlayerByLabel(this.player);
			if( pl )
				return pl;
			// If that doesn't work, try from library
			pl = glib.get(this.player, 'Player');
			if( pl )
				return pl;
		}
		return this.parent.getPlayer();

	}

	getPortrait(){

		const ini = this.getInitiatingPlayer();
		const pl = this.getPlayer();
		const rpTarg = this.parent.getTargetPlayers()[0];


		let portrait = this.parent.portrait;
		if( pl instanceof Player && pl.portrait )
			portrait = pl.portrait;

		if( this.portrait )
			portrait = this.portrait;
		if( this.portrait.toLowerCase() === 'none' )
			portrait = '';
		
		if( portrait === '%T' ){
			
			portrait = ini?.portrait;
			if( !portrait )
				portrait = ini?.icon || '';

		}
		else if( portrait === '%P' ){
			
			portrait = rpTarg?.portrait;
			if( !portrait )
				portrait = rpTarg?.icon || '';

		}
		
		if( !portrait.includes('/') && portrait )
			portrait = '/media/wrapper_icons/'+portrait+'.svg';
		return portrait;

	}

	getName(){

		const ini = this.getInitiatingPlayer();
		const rpTarg = this.parent.getTargetPlayers()[0];
		if( this.name === '%T' )
			return ini?.getColoredName() || '';
		else if( this.name === '%P' )
			return rpTarg?.getColoredName() || '';
		else if( this.name )
			return esc(this.name);
		const pl = this.getPlayer();
		if( pl )
			return pl.getColoredName();
		return '';
		
	}

	// When the stage is initially presented
	async onStart( players ){

		players = toArray(players);

		this._textEvent = false;
		// Ugly workaround
		if( !players )
			players = [game.getMyActivePlayer()];

		// Actions that act on event target
		if( players.length ){
			
			this._iniPlayer = players[0].id;
			const spl = this.store_pl;
			const st = RoleplayStage.StoreType;
			if( spl ){	// Any non-true value is accepted

				if( spl === st.SET )
					this.parent._targetPlayers = [players[0].id];
				else if( spl === st.ADD || spl == st.REM ){

					let pos = this.parent._targetPlayers.indexOf(players[0].id);
					if( ~pos && st.REM )
						this.parent._targetPlayers.splice(pos, 1);
					else if( pos === -1 && st.ADD )
						this.parent._targetPlayers.push(players[0].id);

				}
				else if( spl === st.PURGE )
					this.parent._targetPlayers = [];
				else if( spl === st.SHIFT )
					this.parent._targetPlayers.shift();
				else if( spl === st.SHUFFLE ){

					shuffle(this.parent._targetPlayers);

				}

			}

		}

		// Actions to run on the NPC who is speaking
		const pl = this.getPlayer();
		if( pl && this.chat !== RoleplayStageOption.ChatType.none )
			RoleplayChatQueue.output(pl, this);

		// Actions that act on target specified by this.target
		const iniPlayers = toArray(this.getInitiatingPlayer());
		for( let p of iniPlayers ){

			const evt = new GameEvent({sender:pl, target:p, roleplay:this});
			for( let act of this.game_actions )
				await act.trigger(p, undefined, false, pl, evt);

		}

		const tevt = this.getTextEvent();
		tevt.text.triggerVisuals(tevt);
		tevt.text.raiseTextTriggerEvent(tevt);

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

RoleplayStage.getShuffleTypeLabel = function( shuffleType ){

	shuffleType = Math.trunc(shuffleType);
	for( let i in this.Shuffle ){

		if( this.Shuffle[i] === shuffleType )
			return i;

	}
}

RoleplayStage.StoreType = {
	IGNORE : 0,
	SET : 1,
	SHUFFLE : 2,
	ADD : 3,
	REM : 4,
	PURGE : 5,
	SHIFT : 6,
};

RoleplayStage.getStoreTypeLabel = function( storeType ){

	storeType = parseInt(storeType);
	if( !storeType )
		storeType = RoleplayStage.StoreType.IGNORE;
	for( let i in this.StoreType ){
		if( this.StoreType[i] === storeType ){
			return i;
		}
	}
};

// Who should be considered the target for texts and game actions
RoleplayStage.Target = {
	auto : 'auto',					// Use auto target (the player who brought you to the stage)
	rpTargets : 'rpTargets',		// Use RP targets
	firstRpTarget: 'firstRpTarget',	// Use the first RP target
};




export class RoleplayStageOption extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			game_actions : GameAction,
			index : RoleplayStageOptionGoto,
		};
	}

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.direct = [];			// These connect to stages directly. They're appended at the end of the index array
		this.index = [];			// Target index. An array of goto objects. Integers get converted to goto objects. The first valid one will be picked or an exit option will be created.
		this.text = '';
		this.chat = this.constructor.ChatType.default;			// Chat type
		this.conditions = [];
		this.game_actions = [];
		this.target_override = this.constructor.Target.sender;
		this.shuffle = false;				// Shuffles goto options
		this.fail_text = '';		// Can be used to replace the text if you fail a dice roll
		this.dice = 0;				// Turns this into a d20 roll option
		this.dice_mod = '';			// Math formula for dice roll
		this.reroll = RoleplayStageOption.Rerolls.visit;	// Can reroll every time the RP is opened, but only once per RP. 

		// Last roll stats
		this._mod = 0;				// player modifier i
		this._roll = 0;				// Value rolled
		this.load(data);

	}

	load( data ){

		// Legacy conversion
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

	lastRollSuccess(){

		if( this._roll === 1 )
			return false;

		return this._roll+this._mod >= this.dice;

	}

	lastRollCritFail(){
		return this._roll === 1;
	}

	lastRollCritSuccess(){
		return this._roll === 20;
	}

	isRolled(){
		return this._roll > 0;
	}

	rollDice( player ){
		
		const roll = Math.ceil(Math.random()*20);
		if( roll === 1 )
			this._crit = -1;
		else if( roll === 20 )
			this._crit = 1;

		this._roll = roll;
		this._mod = this.getDiceModifier(player);
		
	}

	getDiceModifier( player ){

		if( !(player instanceof Player) )
			return 0;

		if( !this.dice_mod )
			return 0;

		return Math.trunc(Calculator.run(
			this.dice_mod,
			new GameEvent({
				sender : player,
				target : this.getTargets(player),
			})
		)) + Math.floor(player.getGenericAmountStatPoints(Effect.Types.luck));

	}
	
	canSaveState(){
		return (this.dice && this.reroll === RoleplayStageOption.Rerolls.never && this._roll);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full),
			dice : this.dice,
			dice_mod : this.dice_mod,
			target_override : this.target_override,
			reroll : this.reroll
		};

		if( full ){
			out.direct = this.direct.slice();
			out.index = RoleplayStageOptionGoto.saveThese(this.index, full);
			out.chat = this.chat;
			out.game_actions = GameAction.saveThese(this.game_actions, full);
			out.shuffle = this.shuffle;
			out.fail_text = this.fail_text;
		}
		
		if( full !== "mod" ){
			out._roll = this._roll;
			out._mod = this._mod;
		}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}

	getRoleplay(){

		return this.parent.parent;

	}

	
	validate( player ){

		if( this.reroll !== RoleplayStageOption.Rerolls.always && this._roll )
			return false;

		const evt = new GameEvent({
			sender : player,
			target : this.getTargets(player),
			dungeon : game.dungeon,
			room : game.dungeon.getActiveRoom()
		});
		return Condition.all(this.conditions, evt);

	}

	// Get what should be considered targets for conditions and dice mod
	getTargets( activePlayer ){

		let out = [];
		const tp = this.getRoleplay().getTargetPlayers();
		if( this.target_override === RoleplayStageOption.Target.firstRpTarget && tp.length )
			out = [tp[0]];
		else if( this.target_override === RoleplayStageOption.Target.rpTargets )
			out = tp;
		else if( this.target_override === RoleplayStageOption.Target.rpPlayer )
			out = [this.parent.getPlayer()];

		// Default, use active player
		if( !out.length )
			out.push(activePlayer);

		return out;

	}

	getText( player, allowFailText = false ){

		if( !player )
			player = game.getMyActivePlayer();
		
		let tx = this.text;
		if( this.fail_text && this.isRolled() && !this.lastRollSuccess() && allowFailText )
			tx = this.fail_text;

		let text = new Text({
			text : tx || '[Continue]'
		});
		// this.parent.getInitiatingPlayer()
		// Responses use your active player as sender, main text uses whoever got you to that stage
		return text.run(new GameEvent({sender:player, target:this.parent.getPlayer()}), true);

	}

	async use( player ){

		if( !this.validate(player) )
			return false;
		

		const rp = this.getRoleplay();
		const pl = this.parent.getPlayer();

		const canChat = player && this.chat !== RoleplayStageOption.ChatType.none && this.text;
		if( canChat && !this.dice ) // Dice rolls need to wait until the roll is done to output the player response
			RoleplayChatQueue.output( player, this );

		// Do this first to set the waiting flag
		game.ui.rpOptionSelected(this.id);
		Game.net.dmRpOptionSelected(this.id);

		const goto = this.getIndex( player );

		if( this.dice ){

			game.ui.drawRoleplay();
			Game.net.dmDiceRoll(this.dice, this._roll, this._mod);
			await game.ui.rollDice(this.dice, this._roll, this._mod);
			
			if( canChat )
				RoleplayChatQueue.output( player, this );

		}

		rp.setStage(goto.index, true, player);
		
		// Do these last as they might force a UI draw, which might draw the wrong RP option
		for( let act of this.game_actions ){
			await act.trigger(player, undefined, false, pl);
		}

		return true;

	}

	// Where do we go to after pushing the button?
	getIndex( target ){

		if( this.dice )
			this.rollDice(target);

		let index = this.index.slice();
		for( let id of this.direct ){
			index.push(new RoleplayStageOptionGoto({
				index : id
			}, this));
		}

		if( this.shuffle )
			shuffle(index);

		for( let opt of index ){

			if( opt.validate(target, this) )
				return opt;

		}
		
		// if none are valid, create a quick end rp
		return new RoleplayStageOptionGoto({}, this);

	}

}

RoleplayStageOption.Rerolls = {
	visit : 'visit',		// Cannot reroll until the RP is closed and opened again. Default behavior.
	always : 'always',		// Can always reroll if failed
	never : 'never',		// Can never reroll. Makes it persistent.
};

RoleplayStageOption.Target = {
	sender : 'sender', 					// Default. Target is same as sender in dice modifier and conditions
	firstRpTarget : 'firstRpTarget',	// Use the first rp target
	rpTargets : 'rpTargets',			// Use all RP targets in conditions. First RP target in dice modifier.
	rpPlayer : 'rpPlayer',				// (NPC) of the current RP stage.
};

RoleplayStageOption.ChatType = {
	default : 0,		// Output into chat. Use /me for emote
	none : 2,			// Don't output chat
};

RoleplayStageOption.getChatTypeLabel = function(cType){
	for( let i in this.ChatType ){
		if( this.ChatType[i] === cType )
			return i;
	}
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
	
	validate( target, stageOption ){

		let sender = this.parent.parent.getPlayer();
		if( !sender )
			sender = target;

		const evt = new GameEvent({
			sender : sender,
			target : target,
			roleplayStageOption : stageOption,
		});

		return Condition.all(this.conditions, evt);

	}

}
