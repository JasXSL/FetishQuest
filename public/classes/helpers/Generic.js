// This is a generic class that most other classes should extend
export default class Generic{

	constructor(data){
		this.id = this.g_guid();	// Random ID
	}

	g_autoload(data){
		if(typeof data !== "object")
			return;

		for(let i in data){
			if( this.hasOwnProperty(i) && typeof this[i] !== "function" && i !== "parent" ){
				this[i] = this.g_typecast(data[i], this[i], i);
			}
		}

		if( typeof this.rebase === "function" )
			this.rebase();

	}

	g_typecast( from, to, ident ){

		// Use null for wild card
		if( to === null || to === undefined )
			return from;

		if( Array.isArray(to) ){
			if( !Array.isArray(from) ){
				console.error("Trying to typecast array '"+ident+"', from", from, "to", to);
				return [];
			}
			return from.slice();
		}

		if( typeof to === "object" ){
			if( typeof from !== "object" ){
				console.error("Trying to typecast object '"+ident+"', from", from, "to", to);
				return {};
			}
			let out = {};
			for( let i in from )
				out[i] = from[i];
			return out;
		}

		if( typeof to === "number" ){
			if( isNaN(from) ){
				console.error("Trying to load NaN value "+ident+" to number ", from, "to", to);
				return 0;
			}
			return +from;
		}

		if( typeof to === "string" )
			return String(from);

		if( typeof to === "boolean" )
			return !!from;

		

		console.error("Trying to typecast unknown type: "+ident , "from", typeof from, "to", typeof to);
		return from;

	}

	g_guid(){
		let s4 = () => {
			return Math.floor((1 + Math.random()) * 0x10000)
			  .toString(16)
			  .substring(1);
		};
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		  s4() + '-' + s4() + s4() + s4();
	}

	g_resetID(){
		this.id = this.g_guid();
	}

	// Generic tag one
	getTags(){

		if( !this.tags )
			return [];
		
		let out = [];
		for( let tag of this.tags )
			out.push(tag.toLowerCase());

		return out;

	}
	  
	hasTag( tags ){

		if( !Array.isArray(this.tags) )
			return false;

		if( !Array.isArray(tags) )
			tags = [tags];

		let t = this.getTags();
		for( let tag of t ){
			if( ~tags.indexOf(tag) )
				return true;
		}
		return false;

	}

	clone( parent ){
		if( parent === undefined )
			parent = this.parent;
		else if( !parent )
			parent = undefined;
		return new this.constructor(this.save(true), parent);
	}

	// Returns a library tied to this asset type if possible
	getLib(){
		return this.constructor.getLib();
	}

}

// Tries to return a library tied to this asset
Generic.getLib = function(){
	return glib.getFull(this.name);
};

Generic.loadThese = function( entries = [], parent ){

	let out = [];
	if( !Array.isArray(entries) && typeof entries !== "object" ){
		console.error("Trying to batch load invalid assets:", entries);
		return;
	}

	for( let entry of entries ){
		let obj = this.loadThis(entry, parent);
		if( obj )
			out.push(obj);
	}
	return out;

}

Generic.loadThis = function( entry, parent ){

	if( typeof entry === "string" ){
		let n = glib.get(entry, this.name);
		if( !n ){
			console.error("Item", entry, "not found in database of", this.name, "parent was", parent, "DB:", glib.getFull(this.name));
			return false;
		}
		entry = n;
	}
	return new this(entry, parent);


}

Generic.saveThese = function( entries = [], full = false ){
	return entries.map(el => {
		if( typeof el.save !== "function" ){
			console.error(el, "has no save method");
			throw "Save function missing error";
		}
		el.save(full);
	});
}
