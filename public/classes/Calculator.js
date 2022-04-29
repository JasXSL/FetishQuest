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

Calculator.Targets = {
	Targets : 'Targets',	// Appends all targets from event
	Sender : 'Sender',		// Appends sender from event
	Target : 'Target',		// Followed by a number, such as Target0, Target1, to specify specific targets. If a target doesn't exist, it's ignored.
	RpTarget : 'RpTarget',		// Followed by a number, such as RpTarget0, RpTarget1, to specify specific rp targets. If a target doesn't exist, it's ignored.
	RpTargets : 'RpTargets',		// Appends all rp targets.
};

Calculator.targetsToKeys = function(targArray, event){
	// Try/catch is needed or debugging will be a pain
	try{
		let targs = event.target ? toArray(event.target) : [];
		let out = [];
		for( let item of targArray ){
			let itm = String(item);

			if( itm === Calculator.Targets.Targets ){
				out.push(...targs.map(el => el.id));
			}
			else if( itm === Calculator.Targets.RpTargets )
				out.push(...game.roleplay._targetPlayers);
			else if( itm === Calculator.Targets.Sender && event.sender )
				out.push(event.sender.id);
			else if( itm.startsWith(Calculator.Targets.Target) && event.target ){

				let nr = parseInt(itm.substring(Calculator.Targets.Target.length));
				if( !isNaN(nr) && targs[nr] )
					out.push(targs[nr].id);

			}
			else if( itm.startsWith(Calculator.Targets.RpTarget) && event.target ){

				let nr = parseInt(itm.substring(Calculator.Targets.RpTarget.length));
				if( !isNaN(nr) && targs[nr] )
					out.push(game.roleplay._targetPlayers[nr]);

			}
			else if( vars.hasOwnProperty(itm) )
				out.push(itm);
		}

		return out;
	}catch(err){
		console.error(err);
		return [];
	}


};

// Supplying a JSON array to a formula will treat it as an array of constants to be feched, and causes an array to be returned
// Useful when you want to set a dvar or rpvar to a player ID
Calculator.run = function( formula, event, customMathVars ){

	if( this.debug )
		console.debug("Formula", formula, isNaN(formula));

	
	// This is already a number
	if( !isNaN(formula) )
		return +formula;

	if( typeof formula !== "string" ){
		console.error("This is not a formula (str/nr expected) ", formula, "Event", event);
		return false;
	}


	// First off, compile mathvars
	// Vars from game
	let vars = game.getMathVars();
	event.appendMathVars(vars);
	if( customMathVars && typeof customMathVars === "object" ){
		for( let i in customMathVars )
			vars[i] = customMathVars[i];
	}
	

	// Next, checks if it's an array of JSON constants
	try{
		let json = JSON.parse(formula);
		if( Array.isArray(json) ){
			return this.targetsToKeys(json, event);
		}
	}catch(err){
	}


	// Player mathvars aren't available in JSON constants since they're only setup to handle one target
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
