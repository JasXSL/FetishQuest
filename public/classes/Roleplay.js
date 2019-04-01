import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
export default class Roleplay extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.stage = 0;
		this.finished = false;
		this.label = '';
		this.title = '';
		this.stages = [];			// Roleplay stages
		this.allow_resume = false;
		this.player = '';

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
			allow_resume : this.allow_resume,
			title : this.title,
			player : this.player
		};

		if( full !== "mod" ){
			out.finished = this.finished;
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

		if( index === -1 )
			this.finished = true;
		else
			this.stage = index;

		const stage = this.getActiveStage();
		if( stage )
			stage.onStart();


	}

	getPlayer(){
		return game.getPlayerByLabel(this.player);
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
		this.conditions = [];
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
			conditions : Condition.saveThese(this.conditions, full),
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
		this.conditions = Condition.loadThese(this.conditions, this);

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

	validate( player ){

		if( !Condition.all(this.conditions, new GameEvent({
			sender : player
		})) )return false;

		return this.getOptions(player).length;
		
	}

	getPlayer(){
		
		let pl = game.getPlayerByLabel(this.player);
		if( pl )
			return pl;

		return this.parent.getPlayer();

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
		this.conditions = [];

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
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
		}
		
		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}

	getRoleplay(){

		return this.parent.parent;

	}

	// Automatically invoked after g_autoload
	rebase(){
		this.conditions = Condition.loadThese(this.conditions, this);
		
	}

	validate( player ){

		return Condition.all(this.conditions, new GameEvent({
			sender : player
		}));

	}

	use( player ){

		if( !this.validate(player) )
			return false;

		const rp = this.getRoleplay();

		const pl = this.parent.getPlayer();
		if( pl )
			game.speakAs( player.id, this.text );

		rp.setStage(this.index);
		
		return true;

	}

}

