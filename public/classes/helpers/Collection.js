// This is an alternative to Generic in which data is a "collection"
// It should not be used in an array
// It's used where properties are dynamically generated

export default class Collection{
	
	constructor( data ){
		this.load(data);
	}

	get( id ){
		return this[id];
	}

	set( id, val ){
		this[id] = val;
	}

	unset( id ){
		if( typeof this[id] !== "function" )
			delete this[id];
	}

	findIdInArray( id, arr ){
		for( let o of arr ){
			if( o && o.id && o.id === id )
				return o;
		}
	}

	// Auto loads and typecasts
	// If accept_all_nulls is true, all target nulls are set to the supplied value and not typecast or cloned
	load( data ){

		if( !data )
			return;

		if(typeof data !== "object")
			data = {};


		for( let i in data ){

			if( data[i] === '__DEL__')
				delete this[i];
			else{

				// A netgame player needs to load over existing
				if( window.game && !game.is_host ){

					// Handle array loads
					if( Array.isArray(this[i]) && Array.isArray(data[i]) ){

						let newArray = [];
						for( let o of data[i] ){

							let add = this.findIdInArray(o.id, this[i]);
							if( !add || typeof add.load !== "function" )
								add = o;
							else
								add.load(o);
								
							newArray.push(add);

						}

						this[i] = newArray;
						
						continue;

					}


					if( this[i] && typeof this[i].load === "function" ){
						
						this[i].load(data[i], this);	// "this" might not lead to correct parenting here
						continue;
						
					}

				}
				
				this[i] = data[i];

			}

		}

	}

	rebase(){
		this.g_rebase();	// Super
	}	// Not used, but still needed to work as Generic

	keys(){
		
		const out = [];
		for( let i in this )
			out.push(i);
		return out;

	}

	flatten( obj, full = false ){

		if( obj === undefined )
			obj = this;

		// Assets that have the save method use that
		if( obj && obj !== this && typeof obj.save === "function" ){
			return obj.save(full);
		}

		let out = {};
		if( Array.isArray(obj) )
			out = [];

		for( let i in obj ){
			if( typeof obj[i] === "object" )
				out[i] = this.flatten(obj[i], full);
			else
				out[i] = obj[i];
		}

		return out;

	}

	save(full){
		return this.flatten(undefined, full);
	}
	
	clone(){
		return new this.constructor(this.flatten());
	}

	convertToSubCollections(){
		for( let i in this ){
			if( typeof this[i] !== "function" )
				this[i] = new Collection(this[i], this);
		}
	}

	// Helper function that Sanitizes a basic object. Note that these can't contain arrays
	static sanitizeBasic( obj ){

		if( typeof obj !== "object" )
			return {};

		const keys = Object.keys(obj);
		for( let key of keys ){

			const data = obj[key];
			if( typeof data === "object" )
				obj[key] = this.sanitizeBasic(data);

			if( data === '__DEL__' )
				delete obj[key];

		}
		return obj;

	}

	// Helper function for basic objects. They support nested objects, but NOT arrays.
	static flattenBasic( obj ){

		if( typeof obj !== "object" )
			return obj;

		const out = {};
		for( let i in obj ){
			
			const data = obj[i];
			if( typeof data === "object" )
				out[i] = this.flattenBasic(data);
			else
				out[i] = data;
			
		}

		return out;

	}

}


Collection.loadThis = function( entry, parent ){

	if( typeof entry !== "object" )
		return console.error("Collections have no library!");
	return new this(entry, parent);


}
