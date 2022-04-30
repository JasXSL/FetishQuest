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

	if( !event )
		console.error("You forgot to supply an event to Calculate.targetToKeys, numbnuts!");

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
		}

		// Makes unique
		let build = {};
		for( let pl of out )
			build[pl] = 1;
		return Object.keys(build);
	}catch(err){
		console.error(err);
		return [];
	}


};

// Handles custom mathvar types
Calculator.appendMathVar = function( key, val, input ){

	// Player specific subkeys
	if( typeof val === 'object' ){

		for( let i in val )
			input[key+'_'+i] = val[i];

	}
	// Simple insert
	else{
		input[key] = val;
	}

}

// Takes a string and returns the first character that isn't alphanumeric or _
Calculator.allowedChars = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
Calculator.getFirstNonVarChar = function( input ){
	
	for( let i = 0; i < input.length; ++i ){
		if( !this.allowedChars.includes(input[i]) )
			return i;
	}
	return -1;

}

// Gets an @@evt_myEvt_myVar_PlayerConst etc tag and returns an array of values from mathvars
// If tag does not start with @@, it returns mathVarList[tag]
// Otherwise returns an object of {playerId:value}
// If returnUndefined is true, it allows keys to be set to undefined
Calculator.getValuesByAtVar = function( tag, event, mathVarList, returnUndefined = false ){

	tag = String(tag);
	if( !tag.startsWith('@@') )
		return mathVarList[tag];
	
	tag = tag.substring(2);
	let out = {};
	// Split the player var by _
	let replace = tag.split('_');
	// The last entry is the Calculator target const
	let last = replace.pop();
	// Merge the rest back to a string
	replace = replace.join('_');

	// Find the targets
	let players = this.targetsToKeys([last], event);
	// Iterate over the targets and combine the values from the mathvars
	for( let pl of players ){
		
		let vTag = replace + '_' + pl;
		if( returnUndefined || mathVarList.hasOwnProperty(vTag) )
			out[pl] = mathVarList[vTag];

	}
	return out;

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
	

	let targ = event.target;
	if( Array.isArray(targ) )		// we can only get vars from target 0
		targ = targ[0];

	// Player mathvars aren't available in JSON constants since they're only setup to handle one target
	if( targ && !targ.appendMathVars )
		console.error("No mathVars in event target", event);
		
	if( event.sender )
		event.sender.appendMathVars('se_', vars, event);
	if( targ ){
		if( !(targ instanceof Player) )
			console.error("Invalid target supplied to mathvars", event.target);
		targ.appendMathVars('ta_', vars, event);
	}
	if( event.action )
		event.action.appendMathVars('ac_', vars, event);


	// Let's take a look at the formula
	// We use @@ to get a player var
	let spl = formula.split("@@");
	let converted = [spl.shift()];
	for( let c of spl ){

		// Find the end of the player var
		let pos = this.getFirstNonVarChar(c);
		let replace = c;
		if( ~pos ){
		 	replace = c.substring(0, pos-1);
			c = c.substring(pos);
		}
		else
			c = '';

		let objs = this.getValuesByAtVar('@@'+replace, event, vars);
		console.log("Getting", replace, objs);
		let nrOut = 0;
		for( let i in objs ){
			if( !isNaN(objs[i]) )
				nrOut += objs[i];
		}
		c = nrOut + c;
		converted.push(c);

	}
	formula = converted.join('');


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
