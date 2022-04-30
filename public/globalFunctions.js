// Globals
function esc( text, ignorenl2br ){
	text = String(text);
	const map = {
	  //'&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#039;'
	};
	//let out = text.replace(/[&<>"']/g, function(m) { return map[m]; });
	let out = text.replace(/[<>"']/g, function(m) { return map[m]; });
	if( !ignorenl2br )
		out = out.split("\n").join('<br />');
	return out;
}
function shuffle(a){
	for( let i = a.length - 1; i > 0; i-- ){
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
function ucFirst(a, single = false){
	if( single )
		return String(a).charAt(0).toUpperCase()+String(a).substring(1);
	return String(a).split(' ').map(el => el.substr(0,1).toUpperCase()+el.substr(1)).join(' ');
}

function getHash(){
	
	let hash = window.location.hash;
	if( hash.charAt(0) === '#' )
		hash = hash.substr(1);
	hash = hash.split('/');
	return hash;

}

// returns a random item by weight, input are objects to pick one from, and weightFunc is called on each object
function weightedRand( input, weightFunc, returnIndex = false ){

	let totalWeight = 0, items = [];
	for( let a of input ){

		let weight = weightFunc(a);
		items.push({i:a,w:weight});
		totalWeight += weight;

	}

	let random = Math.random() * totalWeight;
	for( let i = 0; i < items.length; ++i ) {

		let item = items[i];
		if( random < item.w ){

			if( returnIndex )
				return i;
			return item.i;
			
		}
		random -= item.w;
		
	}
	return false;

}

function delay(ms = 1000){
	return new Promise(res => {setTimeout(res, ms);});
}

function objectRandElem(obj){
	let keys = Object.keys(obj);
	return obj[keys[Math.floor(Math.random()*keys.length)]];
}

// Searches an object to see if it has a path
function objectHasPath( obj, path = [] ){

	while( path.length ){

		obj = obj[path.shift()];
		if( !obj )
			return false;

	}
	
	return true;

}

// returns the sum of all values
function objectSum( obj ){
	let out = 0;
	for( let i in obj )
		out+= obj[i];
	return out;
}

function randElem( input ){
	if( !Array.isArray(input) )
		throw "Can't randomize array, input is not an array";
	return input[Math.floor(Math.random()*input.length)];
}

// Generic function that clones an object. Useful in loops so you don't need to define multiple functions
// relies on obj having a clone method
function clone( obj, parent ){
	if( !Array.isArray(obj) )
		return obj.clone(parent);

	return obj.map(el => el.clone(parent));
	
}

// Attempts to deep clone an object. Note that this won't clone arrays in arrays. But can clone objects in arrays and objects in objects
function deepClone( obj ){

	if( typeof obj !== 'object' ){
		console.error("Attempted to clone", obj);
		throw 'Invalid obj passed to deepClone';
	}

	let out = {};
	for( let i in obj ){

		const item = obj[i];
		if( Array.isArray(item) ){

			let arr = [];
			for( let asset of item ){

				if( typeof asset === 'object' )
					arr.push(deepClone(asset));
				else
					arr.push(asset);

			}
			out[i] = arr;

		}
		else if( typeof item === 'object' )
			out[i] = deepClone(item);
		else
			out[i] = item;
			

	}
	return out;

}


// Takes array values and builds an object of {val:true...}
function valsToKeys( input = [] ){
	if( !Array.isArray(input) )
		return {};
	let out = {};
	for( let v of input )
		out[v] = true;
	return out;
}


// Takes a float and floors it, if there's a remainder, it might be add 1 to the floored value based on the remainder as percentage
function randRound( val = 0 ){
	let fract = Math.abs(val)-Math.abs(Math.trunc(val));
	if( fract > Math.random() )
		val += val >= 0 ? 1 : -1;
	return Math.round(val);
}

// Turns a label like yuug_deep_forest into a name like Yuug Deep Forest
function labelToName( label ){
	return label.split(/[_\s]+/).map(el => ucFirst(el)).join(' ');
}

// Converts one or more vars into an array if it's not already. Note: An undefined or null first arg will return an empty array
function toArray(...args){
	if( args[0] === undefined || args[0] === null )
		return [];
	if( !Array.isArray(args[0]) || args.length > 1 )
		return [...args];
	return args[0];
}
const toArr = toArray;

// Turns color tags into HTML
/*
	|s| text |/s| = strong
	|em| text |/em| = italic
	|c#color|text|/c|
*/
function escapeStylizeText(text){
	text = String(text);
	return text.split('|').join('\\|');
}

function stylizeText( txt ){

	txt = esc(txt);
	txt = txt.split('|s|').join('<strong>').split('|/s|').join('</strong>')
		.split('|em|').join('<em>').split('|/em|').join('</em>')
	;
	// Update color
	txt = txt.split('|c');
	let out = txt.shift();
	for( let t of txt ){
		let a = t.split('|');
		let color = a.shift();
		a = '<span style="color:'+esc(color)+'">'+a.join('|').split('|/c|').join('</span>');
		out+=a;
	}
	out = out.split('\\|').join('|');

	let text = out.split("$ITM");
	out = text.shift();
	for( let t of text ){

		let a = t.split('$');
		let url = a.shift();
		a = '<span data-il="'+esc(url)+'" class="ilToUpdate tooltipParent itemLink"><span>ITEM</span><div class="tooltip"></div></span>';
		out+=a;

	}
	// $ITM9dk9BMUgxe$

	return out;

}

function fuzzyTime( unix_time_ms ){

	let dif = Date.now()-unix_time_ms;
	const positive = dif >= 0;
	let out = '';
	if( !positive ){

		out = 'In ';
		dif = Math.abs(dif);

	}

	dif = Math.floor(dif/1000);
	
	let slots = [
		{u:'year', v:3600*24*365},
		{u:'month', v:3600*24*30},
		{u:'week', v:3600*24*7},
		{u:'day', v:3600*24},
		{u:'hour', v:3600},
		{u:'minute', v:60}
	];

	let unit = 'second';
	for( let slot of slots ){

		if( dif >= slot.v ){
	
			unit = slot.u;
			dif /= slot.v;
			break;

		}

	}

	dif = Math.floor(dif);
	
	out += dif + ' ' + unit + (dif !== 1 ? 's' : '');
	
	if( positive )
		out += ' ago';

	return out;

}

function fuzzyTimeShort( seconds ){

	let slots = [
		{u:'w', v:3600*24*7},
		{u:'d', v:3600*24},
		{u:'h', v:3600},
		{u:'m', v:60},
		{u:'s', v:0}
	];

	for( let slot of slots ){

		if( seconds >= slot.v ){
	
			return Math.floor(seconds/slot.v) + slot.u;

		}

	}

}

function fuzzyFileSize( size_in_bytes ){
	
	let dif = size_in_bytes;
	let slots = [
		{u:'gb', v:1000000000},
		{u:'mb', v:1000000},
		{u:'kb', v:1000},
	];

	let unit = 'b';
	for( let slot of slots ){

		if( dif >= slot.v ){
	
			unit = slot.u;
			dif /= slot.v;
			break;

		}

	}
	
	dif = Math.floor(dif*10)/10;

	return dif + unit;


}


// handles up to 100
function numberToText( nr = 0 ){

	nr = Math.floor(Math.abs(nr));
	if( !nr )
		return 'zero';

	if( nr >= 100 )
		return String(nr);

	// Handle the 10s since they have different words
	if( nr >= 10 && nr <= 19 )
		return ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"][nr-10];

	let out = '';
	let tens = Math.floor(nr/10);
	if( tens > 1 ){
		 out += [
			 "twenty", "thirty", "fourty", "fifty", "sixty", "seventy", "eighty", "ninety"
		][tens-2] + " ";		
	}
	let base = nr%10;
	if( base ){
		out += ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][base-1];
	}

	return out;


}

// Gracefully copy pasted from stack overflow
Base64 = {

    _Rixits :
	//   0       8       16      24      32      40      48      56     63
	//   v       v       v       v       v       v       v       v      v
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/",
    // You have the freedom, here, to choose the glyphs you want for 
    // representing your base-64 numbers. The ASCII encoding guys usually
    // choose a set of glyphs beginning with ABCD..., but, looking at
    // your update #2, I deduce that you want glyphs beginning with 
    // 0123..., which is a fine choice and aligns the first ten numbers
    // in base 64 with the first ten numbers in decimal.

    // This cannot handle negative numbers and only works on the 
    //     integer part, discarding the fractional part.
    // Doing better means deciding on whether you're just representing
    // the subset of javascript numbers of twos-complement 32-bit integers 
    // or going with base-64 representations for the bit pattern of the
    // underlying IEEE floating-point number, or representing the mantissae
    // and exponents separately, or some other possibility. For now, bail
    fromNumber : function(number) {
        if (isNaN(Number(number)) || number === null ||
            number === Number.POSITIVE_INFINITY)
            throw "The input is not valid";
        if (number < 0)
            throw "Can't represent negative numbers now";

        let rixit; // like 'digit', only in some non-decimal radix 
        let residual = Math.floor(number);
        let result = '';
        while (true) {
            rixit = residual % 64
            // console.log("rixit : " + rixit);
            // console.log("result before : " + result);
            result = this._Rixits.charAt(rixit) + result;
            // console.log("result after : " + result);
            // console.log("residual before : " + residual);
            residual = Math.floor(residual / 64);
            // console.log("residual after : " + residual);

            if (residual == 0)
                break;
            }
        return result;
    },

    toNumber : function(rixits) {
        let result = 0;
        // console.log("rixits : " + rixits);
        // console.log("rixits.split('') : " + rixits.split(''));
        rixits = rixits.split('');
        for (let e = 0; e < rixits.length; e++) {
            // console.log("_Rixits.indexOf(" + rixits[e] + ") : " + 
                // this._Rixits.indexOf(rixits[e]));
            // console.log("result before : " + result);
            result = (result * 64) + this._Rixits.indexOf(rixits[e]);
            // console.log("result after : " + result);
        }
        return result;
    }
}



async function copyTextToClipboard( text ) {

	if( !navigator.clipboard )
		throw 'Browser too old.';

	return navigator.clipboard.writeText(text);

}
