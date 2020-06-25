import Generic from "./helpers/Generic.js";
import Condition from "./Condition.js";
import GameEvent from "./GameEvent.js";

// Wrapper for the library of learnable actions.
export default class ActionLearnable extends Generic{

	constructor(data){
		super(data);

		this.label = '';
		this.action = '';
		this.conditions = [];
		this.auto_learn = false;
		this.cost = -1;					// -1 is auto
		this.gen_only = false;			// this is only available to players generated by a template

		this.load(data);
	}

	

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions, this);
	}

	save( full ){

		const out = {
			label : this.label,
			action : this.action,
			conditions : Condition.saveThese(this.conditions, full),
			auto_learn : this.auto_learn,
			cost : this.cost,
			gen_only : this.gen_only
		};

		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;

	}

	validate( player, debug ){

		if( player.generated !== this.gen_only )
			return false; 
		const evt = new GameEvent({sender:player, target:player});
		return Condition.all(this.conditions, evt, debug);

	}
	
	// fetches the action from library
	getAction(){
		return glib.get(this.action, "Action");
	}

	getCost(){

		if( this.cost === -1 ){
			return 800;
		}
		return this.cost;

	}


	// Same as getAction but takes an array
	static getActions( actions ){
		return actions.map(a => a.getAction());
	}

}
