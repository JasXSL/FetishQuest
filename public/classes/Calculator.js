/*

	Formula calculator. 
	Accepts customMathVars and automatically pulls customMathVars from Player sender and Player target if they exist.
	See Player.appendMathVars for a full list of mathVars

	You can also use the midvalue _Tag_ and _Wrapper_ ex: se_Tag_pl_penis, these will be either 1 or 0

*/
import Player from './Player.js';

class Calculator{}

Calculator.debug = false;

// Custom function to set default
/*
math.import({
	def : function( value, defaultValue ){
		return isNaN(value) ? defaultValue : value;
	}
});
*/
// Undefined symbols will be replaced with 0
math.SymbolNode.onUndefinedSymbol = function(name){
    return 0;
};

Calculator.run = function( formula, event, customMathVars ){

	//if( this.debug )
	//	console.debug("Formula", formula, isNaN(formula));

	// This is already a number
	if( !isNaN(formula) )
		return +formula;

	if( typeof formula !== "string" ){
		console.error("This is not a formula (str/nr expected) ", formula, "Event", event);
		return false;
	}

	// Vars from game
	let vars = game.getMathVars();

	event.appendMathVars(vars);

	if( customMathVars && typeof customMathVars === "object" ){

		for( let i in customMathVars )
			vars[i] = customMathVars[i];

	}

	if( event.target && !event.target.appendMathVars )
		console.error("No mathVars in event target", event);

	let targ = event.target;
	if( Array.isArray(targ) )
		targ = targ[0];
	
	if( event.sender )
		event.sender.appendMathVars('se_', vars, event);
	if( targ ){
		if( !(targ instanceof Player) )
			console.error("Invalid target supplied to mathvars", event.target);
		targ.appendMathVars('ta_', vars, event);
	}
	if( event.action )
		event.action.appendMathVars('ac_', vars, event);
	
		// Run the calculation
	let out = 0;
	try{

		out = math.evaluate(formula, vars);
	}
	catch(err){
		console.error(err);
		out = 0;
	}

	if( this.debug )
		console.log("Calculated", formula, event, customMathVars, vars, '>>>>>', out);

	return out;
};

export default Calculator;
