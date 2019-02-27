import Generic from './helpers/Generic.js';
export default class Roleplay extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.stage = 0;
		this.finished = true;
		this.label = '';
		this.stages = [];			// Roleplay stages

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
			stages : RoleplayStage.saveThese(this.stages),
			stage : this.stage,
			finished : this.finished,
		};

		if( full !== "mod" ){
			
		}
		else
			this.g_sanitizeDefaults(out);

		
		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		
		this.stages = RoleplayStage.loadThese(this.stages);

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
			options : this.options.map(el => el.save(full))
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


}

class RoleplayStageOption extends Generic{

	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.index = 0;			// Target index
		this.text = '';

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){

		let out = {
			id : this.id,
			text : this.text
		};

		if( full ){
			out.index = this.index;
		}
		
		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}

	// Automatically invoked after g_autoload
	rebase(){
		
	}


}

