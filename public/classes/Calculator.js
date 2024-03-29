/*

	Formula calculator. 
	Accepts customMathVars and automatically pulls customMathVars from Player sender and Player target if they exist.
	See Player.appendMathVars for a full list of mathVars

	You can also use the midvalue _Tag_ and _Wrapper_ ex: se_Tag_pl_penis, these will be either 1 or 0

*/
import GameAction from './GameAction.js';
import Player from './Player.js';
import Text from './Text.js';

class Calculator{
	static debug = false;
	static Targets = {
		Targets : 'Targets',	// Appends all targets from event
		Sender : 'Sender',		// Appends sender from event
		Target : 'Target',		// Followed by a number, such as Target0, Target1, to specify specific targets. If a target doesn't exist, it's ignored.
		RpTarget : 'RpTarget',		// Followed by a number, such as RpTarget0, RpTarget1, to specify specific rp targets. If a target doesn't exist, it's ignored.
		RpTargets : 'RpTargets',		// Appends all rp targets.
		Set : 'Set',					// Appends all targets already on the mathvar with a non false value
		Team : 'Team',			// Followed by a number, such as Team0, Team1 etc, to specify all enabled players on a team
	};

	static ini(){
		
		// Undefined symbols will be replaced with 0
		math.SymbolNode.onUndefinedSymbol = function(name){
			return 0;
		};
		// Custom function to set default
		/*
		math.import({
			def : function( value, defaultValue ){
				return isNaN(value) ? defaultValue : value;
			}
		});
		*/


	}

	static getParser(vars, event){

		const parser = math.parser();
		parser.set('debug', data => {
			console.trace("Math debug", data);
			return data;
		});
		parser.set('shuffle', data => {
			shuffle(data._data);
			return data._data;
		});
		// Dummy method that creates and runs a game action to setDvar
		parser.set('setDvar', async (dLabel, varName, varVal, targets, operation) => {
			if( typeof varVal === "object" && !Array.isArray(varVal) )
				varVal = varVal._data;

			// Only SET is allowed for arrays
			if( Array.isArray(varVal) )
				operation = "SET";

			if( targets )	
				targets = toArray(targets);
			
			const action = new GameAction({
				type : GameAction.types.dungeonVar,
				data : {
					id:varName, 
					val:varVal, 
					operation, 
					dungeon:dLabel,
					targets
				}
			});
			try{
				await action.exec(event.target, undefined, undefined, event.sender);
			}catch(err){
				console.error("Calculator error in setDvar", err);
				console.error("dLabel", dLabel, "varName", varName, "varVal", varVal);
			}

		});

		parser.set('setRpVar', async (varName, varVal, targets, operation) => {
			if( typeof varVal === "object" && !Array.isArray(varVal) )
				varVal = varVal._data;

			// Only SET is allowed for arrays
			if( Array.isArray(varVal) )
				operation = "SET";

			if( targets )	
				targets = toArray(targets);
			
			const action = new GameAction({
				type : GameAction.types.setRpVar,
				data : {
					id:varName, 
					val:varVal, 
					operation, 
					targets
				}
			});
			try{
				await action.exec(event.target, undefined, undefined, event.sender);
			}catch(err){
				console.error("Calculator error in setDvar", err);
				console.error("dLabel", dLabel, "varName", varName, "varVal", varVal);
			}
		});

		parser.set('rpTargsShuffle', () => {
			game.roleplay.shuffleTargetPlayers();
		});
		// Remove players from the rp targs list by index or by 
		parser.set('rpTargsRemove', (idx) => {
			idx = toArray(idx);
			game.roleplay.removeTargetPlayersByIndex(idx);

		});
		// Moves an RP targ from one index to another. You may use negative numbers here.
		parser.set('rpTargsMove', (oldIdx, newIdx) => {
			game.roleplay.moveTargetPlayer(oldIdx, newIdx);
		});
		

		if( vars && typeof vars === "object" ){
			for( let v in vars )
				parser.set(v, vars[v]);
			
		}

		return parser;
	}
	


	static targetsToKeys(targArray, event, mathVar){

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
				else if( itm === Calculator.Targets.Set ){

					let targs = game.getMathVars(event)[mathVar];
					if( targs && typeof targs === "object" ){
						for( let i in targs ){
							if( targs[i])
								out.push(i);
						}
					}

				}
				else if( itm === Calculator.Targets.RpTargets )
					out.push(...game.roleplay._targetPlayers);
				else if( itm === Calculator.Targets.Sender && event.sender )
					out.push(event.sender.id);
				else if( itm.startsWith(Calculator.Targets.Team) && event.target ){
					
					let team = parseInt(itm.substring(Calculator.Targets.Team.length));
					const all = game.getEnabledPlayers();
					for( let pl of all ){
						
						if( pl.team === team )
							out.push(pl.id);

					}

				}
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

	// Takes a token like "rp_label_var_Target is your species" returns an array where the first entry is the var rp_label_var_Target and the rest everything after [@var, trail]
	static tokenizeAtVar( input ){

		let pos = this.getFirstNonVarChar(input);
		let replace = input;
		if( ~pos ){
			replace = input.substring(0, pos);
			input = input.substring(pos);
		}
		else
			input = '';
		return [replace, input];

	};

	// Handles custom mathvar types
	static appendMathVar( key, val, input, event ){

		// Player specific subkeys
		if( typeof val === 'object' && !Array.isArray(val) ){

			for( let i in val ){

				input[key+'_'+i] = val[i];
			}


		}
		// Always include the full value. Since some code counts on there being a publicly accessible object
		input[key] = val;


	}


	static getFirstNonVarChar( input ){
		
		// Takes a string and returns the first character that isn't alphanumeric or _
		let allowedChars = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		for( let i = 0; i < input.length; ++i ){
			if( !allowedChars.includes(input[i]) )
				return i;
		}
		return -1;

	}

	// Gets an @@evt_myEvt_myVar_PlayerConst etc (with trailing text, such as from a text split by @@), and converts it to a number or string.
	// If tag doesn't start with @@ it returns tag as is
	// If returnUndefined is true, it allows keys that aren't present
	// neverEscape is primarily used for texts, and prevents wrapping the output in quotes (which is needed for formulas, but not texts)
	// It MUST be false if the output is supposed to be used in a formula, because it adds quotation marks.
	// Texts should definitely set a default tho, so it doesn't add useless quotations
	static getValueByAtVar( tag, event, mathVarList, returnUndefined = false, neverEscape = false, noStyling = false ){

		tag = String(tag);
		if( !tag.startsWith('@@') )
			return tag;
		tag = tag.substring(2); // Remove '@@'

		tag = Calculator.tokenizeAtVar(tag); // break out the @@ var, splitting it into the [tag, tail] 
		let trail = tag[1];
		tag = tag[0];

		const sum = tag.endsWith("Sum");
		const num = tag.endsWith("Num");
		if( sum || num )
			tag = tag.substring(0, tag.length-3);

		let separator;
		let sep = this.getAtTokenSeparator(trail);
		if( sep[0] )
			separator = sep[0];
		trail = sep[1];

		// V index can use a second separator. Better shift it off here, to prevent it from sticking around in the text if the conversion fails
		let separator2 = '';
		let sep2 = this.getAtTokenSeparator(trail);
		if( sep2[0] )
			separator2 = sep2[0];
		trail = sep2[1];



		// Split the player var by _
		let replace = tag.split('_');
		// The last entry is the Calculator target const
		let last = replace.pop();

		let targVar = '';	// used in Set_<targvar> to get data about the players who have data set, like @@rp_label_var_Set_Trace[ and ]
		if( replace[replace.length-1] === "Set" ){
			
			targVar = last;
			last = replace.pop();
			if( !separator ) // Separator MUST be used when using Set_<targVar> because it has to be treated as a string
				separator = ' and ';

		}

		// Merge the rest back to a string
		replace = replace.join('_');

		let players = this.targetsToKeys([last], event, replace);

		let vals = [];
		// Iterate over the targets and combine the values from the mathvars
		for( let pl of players ){
			
			let vTag = replace + '_' + pl; // This works because any object type d/rpVars are unrolled with the ID of the player appended
			if( returnUndefined || mathVarList.hasOwnProperty(vTag) ){
				
				let val = mathVarList[vTag];
				if( val === undefined )
					val = '';

				// For Set_T, Set_Trace etc, where we're requesting info about the player rather than the var
				if( targVar ){

					if( !val ) // If val is falsy in a targVar request, we MUST skip it
						continue;

					val = Text.targetTextConversion(
						'%'+targVar, // Full text
						'T', // Prefix we're looking for
						window.game?.getPlayerById(pl), 
						event,
						noStyling,	// Don't colorize text
					) + (separator2 ? separator2 + val : ''); // Second separator makes this a <key><separator><val> instead of just <key>

				}

				vals.push(val);

			}

		}


		if( num )
			vals = [vals.length];
		else if( sum )
			vals = [numberToText(vals.reduce((pre, cur) => {
				if( !isNaN(cur) )
					return pre+cur;
			}, 0))];

		let out = vals.join(separator || " and ");
		// Setting defaultSeparator means we always want 
		if( !neverEscape && isNaN(out) )
			out = "'"+out+"'";
		return out+trail;

	};

	// Tries to get a bracket enclosed separator from a trail when using @/@@ vars. Returns an array with the separator, and the rest of the trail
	// Say you pass 'rp_name_test_Set[ and ]' into tokenizeAtVar, that would split it into ['rp_name_test_Set', '[ and ]']
	// You then pass the '[ and ]' into this function and receive ' and '
	static getAtTokenSeparator( trail ){

		if( trail.charAt(0) !== '[' )
			return [undefined, trail];
		let end = trail.indexOf(']');
		let out = trail.substring(1, end);
		trail = trail.substring(end+1);
		//console.log("out", JSON.stringify(out), "trail", JSON.stringify(trail));
		return [out, trail];

	}

	// Supplying a JSON array to a formula will treat it as an array of constants to be feched, and causes an array to be returned
	// Useful when you want to set a dvar or rpvar to a player ID
	static run( formula, event, customMathVars ){

		if( this.debug )
			console.debug("Formula", formula, "event", event, "mathvars", customMathVars);

		
		// This is already a number
		if( !isNaN(formula) ){
			return +formula;
		}

		if( typeof formula !== "string" ){
			console.error("Got formula", formula, "event", event);
			throw new Error("Non formula located (string expected)");
		}


		// First off, compile mathvars
		// Vars from game
		let vars = game.getMathVars(event);
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

		// Let's replace keys
		formula = formula.split('%rp').join('rp_'+game.roleplay.label);
		formula = formula.split('%d').join('d_'+game.dungeon.label);

		// Let's take a look at the formula
		// We use @@ to get a player var
		let spl = formula.split("@@");
		let converted = [spl.shift()];
		for( let c of spl ){

			let cmp = this.getValueByAtVar(
				'@@'+c, 
				event, 
				vars, 
				false, // returnUndefined
				false, // defaultSeparator
				true	// noStyling
			);
			converted.push(cmp);


		}
		formula = converted.join('');

			// Run the calculation
		let out = 0;
		try{
			const parser = this.getParser(vars, event);
			out = parser.evaluate(formula);
		}
		catch(err){
			console.error(err);
			out = 0;
		}

		if( this.debug )
			console.debug("Calculated", formula, event, customMathVars, vars, '>>>>>', out);

		return out;
	};

}

Calculator.ini();

export default Calculator;
