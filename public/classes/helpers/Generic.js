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

}
