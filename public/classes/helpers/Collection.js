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

	// Auto loads and typecasts
	// If accept_all_nulls is true, all target nulls are set to the supplied value and not typecast or cloned
	load( data ){

		if( !data )
			return;

		if(typeof data !== "object")
			data = {};

		for( let i in data )
			this[i] = data[i];

	}

	rebase(){}	// Not used, but still needed to work as Generic

	flatten( obj ){
		if( obj === undefined )
			obj = this;
		let out = {};
		if( Array.isArray(obj) )
			out = [];
		for( let i in obj ){
			if( typeof obj[i] === "object" )
				out[i] = this.flatten(obj[i]);
			else
				out[i] = obj[i];
		}
		return out;
	}

	save(){
		return this.flatten();
	}
	
	clone(){
		return new this.constructor(this.flatten());
	}


}


Collection.loadThis = function( entry ){

	if( typeof entry !== "object" )
		return console.error("Collections have no library!");
	return new this(entry);


}