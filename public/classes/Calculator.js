/*

	Formula calculator. 
	Accepts customMathVars and automatically pulls customMathVars from Player sender and Player target if they exist.
	See Player.appendMathVars for a full list of mathVars

	You can also use the midvalue _Tag_ and _Wrapper_ ex: se_Tag_pl_penis, these will be either 1 or 0

*/
class Calculator{}


Calculator.run = function( formula, event, customMathVars ){
	// This is already a number
	if( !isNaN(formula) )
		return formula;

	if( typeof formula !== "string" ){
		console.error("This is not a formula (str/nr expected) ", formula, "Event", event);
		return false;
	}

	// Vars from game
	let vars = game.getMathVars();

	if( customMathVars && customMathVars.constructor === Object ){
		for( let i in customMathVars )
			vars[i] = customMathVars[i];
	}

	
	if( event.sender )
		event.sender.appendMathVars('se_', vars, event);
	if( event.target )
		event.target.appendMathVars('ta_', vars, event);
	
		// Run the calculation
	let out = 0;
	while(true){
		try{

			out = math.eval(formula, vars);

		}catch(err){
			let message = err.message;
			if( message.startsWith('Undefined symbol ') ){
				let symbol = message.split(' ');
				symbol.splice(0,2);
				if( symbol.length ){
					symbol = symbol.join(' ');
					// Tags are set to 0 if not found
					if( symbol.substr(2,5) === '_Tag_' ){
						vars[symbol] = 0;
						continue;
					}
					// Effect stacks are set to 0 if not found
					if( symbol.substr(2,9) === '_Wrapper_' ){
						vars[symbol] = 0;
						continue;
					}
				}
			}
			console.error("Failed to evaluate formula", formula, "vars", vars);
			console.error(err);
		}
		break;
	}
	return out;
};

export default Calculator;
