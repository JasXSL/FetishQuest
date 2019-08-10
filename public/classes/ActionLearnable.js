import Generic from "./helpers/Generic.js";
import Condition from "./Condition.js";

// Wrapper for the library of learnable actions.
export default class ActionLearnable extends Generic{

	constructor(data){
		super(data);

		this.label = '';
		this.action = '';
		this.conditions = [];
		this.auto_learn = false;


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
			conditions : Condition.saveThese(this.conditions),
			auto_learn : this.auto_learn
		};


		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;

	}
	

}
