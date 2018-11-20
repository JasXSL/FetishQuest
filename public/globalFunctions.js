// Globals
function esc( text, ignorenl2br ){
	text = String(text);
	const map = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#039;'
	};
	let out = text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
function ucFirst(a){
	return String(a).split(' ').map(el => el.substr(0,1).toUpperCase()+el.substr(1)).join(' ');
}

// returns a random item by weight, input are objects to pick one from, and weightFunc is called on each object
function weightedRand( input, weightFunc ){
	let totalWeight = 0, items = [];
	for( let a of input ){
		let weight = weightFunc(a);
		items.push({i:a,w:weight});
		totalWeight += weight;
	}

	let random = Math.random() * totalWeight;
	for( let i of items ) {
		if( random < i.w )
			return i.i;
		random -= i.w;
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

function randElem( input ){
	if( !Array.isArray(input) )
		throw "Can't randomize array, input is not an array";
	return input[Math.floor(Math.random()*input.length)];
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