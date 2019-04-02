const debug = true;

export default class Comparer{

	constructor(){}

	arrayChanged( a, b ){
		if( !Array.isArray(a) || !Array.isArray(b) || a.length !== b.length )
			return true;
		for( let i in a ){
			if( a[i] !== b[i] )
				return true;
		}
		return false;
	}

	compare( a, b ){

		if( typeof a !== "object" || a === null )
			return b;

		let keys = {};
		let arr = Object.keys(a).concat(Object.keys(b));
		for( let n of arr )
			keys[n] = true;
		keys = Object.keys(keys);

		const out = {};

		for( let i of keys ){
			
			// This is an object type
			if( (typeof a[i] === "object" || typeof b[i] === "object") && b[i] !== null && a[i] !== null ){

				// Object is an array
				if( Array.isArray( a[i] ) || Array.isArray( b[i] ) ){

					if( typeof a[i][0] !== "object" ){
						if( this.arrayChanged(a[i], b[i]) )
							out[i] = b[i].slice();

					}
					// Object array. Every object needs an ID
					else{

						let tupleA = {}, tupleB = {};
						for( let n of a[i] ){
							if( (!n || !n.id) && debug )
								console.error("Object", n, "has no id in object", a, "array", a[i]);
							tupleA[n.id] = n;
						}

						for( let n of b[i] ){

							if( (!n || !n.id) && debug )
								console.error("Object", n, "has no id in object", b, "array", b[i], "a was", a[i]);
							tupleB[n.id] = n;
							
						}
						
						
						let ou = [], nrChanged = 0;
						// Build the current values
						for( let n in tupleB ){
							const aa = tupleA[n], ab = tupleB[n];
							let comp = this.compare(aa, ab);
							nrChanged += Object.keys(comp).length;
							comp.id = n;
							ou.push(comp);		// All objects need to be inside for ordering to work
						}

						if( nrChanged || out.length != a[i].length )
							out[i] = ou;
					}
				}
				// Object is an object
				else{

					const o = this.compare(a[i], b[i]);
					if( o === undefined || o === null )
						console.error("Got null or undefined comparing", a[i], "with", b[i], a, b);
					if( Object.keys(o).length )
						out[i] = o;

				}
			}
			// Compare the values. But if the base object doesn't have an ID, you have to send the whole thing
			else if( a[i] !== b[i] || !b.id )
				out[i] = b[i];
				
		}

		return out;

	}

}

