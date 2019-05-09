const debug = true;

export default class Comparer{

	constructor(){}


	compare( a, b, isArrayChange, parent ){

		if( typeof a !== "object" || a === null || typeof b !== "object" || b === null || typeof a !== typeof b || (Array.isArray(a) && !Array.isArray(b)) )
			return b;

		if( Array.isArray(b) ){
			// One of these has changed state, need to send all
			let nrChanges = 0;
			let out = [];

			// Netcode should never be exposed to mixed arrays.
			// First handle simple complex arrays
			if( typeof b[0] === "object" ){
				
				// Then handle object arrays. All objects must have an ID
				for( let i in b ){

					// if an ID has changed, we need to push the whole thing since that's how the loading works on the receiving end
					if( a[i] && a[i].id && b[i] && b[i].id && a[i].id !== b[i].id ){
						++nrChanges;
						out.push(b[i]);
						continue;
					}

					const comp = this.compare(a[i], b[i], true, b);
					const len = Object.keys(comp).length;
					out.push(comp);
					if( 
						(!comp.id && !len) || // This one has no ID (generally disallowed, but failsafe)
						(comp.id && len > 1) || // It does have an ID plus at least 1 changed value
						(comp.id && (!a[i].id || comp.id !== a[i].id)) 	// It has an ID and the ID is not the same (reorder)
					)++nrChanges;
				}
				
				// a.length !== b.length here only checks for REMOVED items. Added items are automatically added when running compare
				if( nrChanges || (a.length !== b.length) )
					return out;

				return false;
			}

			if( a.length !== b.length )
				return b;

			for( let i in b ){
				if( a[i] !== b[i] )
					return b;
			}
			return false;

		}
		

		// Get all keys in A and B once into an array
		let keys = {};
		let arr = Object.keys(a).concat(Object.keys(b));
		for( let n of arr )
			keys[n] = true;
		keys = Object.keys(keys);

		// This is the output
		const out = {};

		// Loop through all the keys
		for( let i of keys ){
			
			if( i === "completed_quests" ){
				console.log("Comparing", a[i], b[i]);
			}

			// This is an object type
			if( (typeof a[i] === "object" || typeof b[i] === "object") && b[i] !== null && a[i] !== null ){

				// Object is an array
				if( Array.isArray( a[i] ) || Array.isArray( b[i] ) ){
					
					let changes = this.compare(a[i], b[i], false, b);

					if( changes )
						out[i] = changes;
					

				}
				// Object is an object
				else{

					const o = this.compare(a[i], b[i], false, b);
					// This property has been deleted. This is generally not good form, so don't design things around that
					// But this catch is needed for debugging, like when you wipe save progress
					if( o === undefined ){
						console.error("Object property deletion detected, this is poor design and should be avoided other than for debugging.");
						return true;
					}

					if( o === true ){
						out[i] = b[i];
					}
					else if( o === null )
						console.error("Got null comparing", a[i], "with", b[i], a, b);
					else if( Object.keys(o).length )
						out[i] = o;

				}
			}
			// Compare the values directly
			else if( a[i] !== b[i] )
				out[i] = b[i];
				
		}

		if( typeof b === "object" && isArrayChange ){
			out.id = b.id;
			if( !b.id )
				console.error("Every object put in an array sent to netcode MUST have an ID. Missing from", b, "previous asset here was", a, "parent", parent);
		}

		return out;

	}

}

