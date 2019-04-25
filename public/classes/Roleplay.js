import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import GameAction from './GameAction.js';
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

	validate(){
		return this.getViableStages().length;
	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			label : this.label,
			stages : RoleplayStage.saveThese(this.stages, full),
			persistent : this.persistent,
			title : this.title,
			player : this.player,
			conditions : Condition.saveThese(this.conditions),
		};

		if( full !== "mod" ){
			out.completed = this.completed;
			out.stage = this.stage;
			out.id = this.id;
			
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		
		this.stages = RoleplayStage.loadThese(this.stages, this);
		this.conditions = Condition.loadThese(this.conditions, this);

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

	setStage( index ){

		if( index === -1 ){
			if( this.persistent )
				this.completed = true;
			game.clearRoleplay();
		}
		else
			this.stage = index;

		const stage = this.getActiveStage();
		if( index > -1 && stage )
			stage.onStart();

	}

	getPlayer(){
		return game.getPlayerByLabel(this.player);
	}

	onStart(){
		this.getActiveStage().onStart();
	}

	validate( player ){
		const evt = new GameEvent({
			sender : player,
			target : player,
			roleplay : this
		});
		return Condition.all(this.conditions, evt);
	}

}


class RoleplayStage extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = 0;
		this.icon = '';
		this.name = '';
		this.text = '';
		this.options = [];
		this.player = '';			// Player label

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
			return esc(name);
		const pl = this.getPlayer();
		if( pl )
			return pl.getColoredName();
		return '';
	}

	onStart( player ){

		if( !player )
			player = game.getMyActivePlayer();

		const pl = this.getPlayer();
		if( pl )
			game.speakAs( pl.id, this.text );

	}

}

class RoleplayStageOption extends Generic{

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
		if( pl )
			game.speakAs( player.id, this.text );

		for( let act of this.game_actions )
			act.trigger(player, pl);

		rp.setStage(this.index);
		
		return true;

	}

}

RoleplayStageOption.ChatType = {
	default : 0,		// Output into chat
	emote : 1,			// todo: implement
	none : 2,			// Don't output chat or emote
};

