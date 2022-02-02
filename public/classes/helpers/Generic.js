// This is a generic class that most other classes should extend
export default class Generic{

	constructor(data){

		this._rebased = false;
		this.id = this.g_guid();	// Random ID
		this._e = '';			// This extends an asset

	}

	// Auto loads and typecasts
	// If accept_all_nulls is true, all target nulls are set to the supplied value and not typecast or cloned
	g_autoload( data, debug = false ){

		if( !data )
			return;

		if(typeof data !== "object")
			data = {};

		// Game can't use NULL types in the netcode, because creating a new game object does a whole heap of stuff you don't want
		const n = this.constructor.name === "Game" ? this : new this.constructor();
		for(let i in data){

			if( this.hasOwnProperty(i) && typeof n[i] !== "function" && i !== "parent" ){
				// Special tag to delete an object property
				if( data[i] === '__DEL__' ){

					delete this[i];

				}
				else{

					this[i] = this.g_typecast(data[i], n[i], i );
					
				}

			}
		}

		if( typeof this.rebase === "function" && Generic.auto_rebase )
			this.rebase();

		if( !this.id )
			console.error("ID missing for asset", this);

	}

	g_rebase(){

		if( this.constructor.getRelations ){

			const rel = this.constructor.getRelations();
			for( let i in rel ){

				// Handle auto loading
				if( Array.isArray(this[i]) )
					this[i] = rel[i].loadThese(this[i], this);
				else
					this[i] = rel[i].loadThis(this[i], this);

			}

		}

	}

	g_findIdInArray( arr, id ){
		for( let o of arr ){
			if( o.id === id )
				return o;
		}
	}

	g_sameComplexType( a, b ){

		if( Array.isArray(a) && Array.isArray(b) ){
			return true;
		}
		if( typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b) && a !== null && b !== null ){
			return true;
		}
		return false;

	}

	g_typecast( from, to, ident ){

		// Use null or undefined for wild card.
		// If the current value is not the same type as the new value, just accept it
		if( to === null && (!this.g_sameComplexType(from, this[ident]) || !game.net_load) ){
			return from;
		}
		to = this[ident];	// Done checking the base value, now we want to check the CURRENT value
		

		if( Array.isArray(to) ){

			if( !Array.isArray(from) )
				return to;
			// Do smart id loading on an array
			if( window.game && game.net_load && typeof from[0] === "object" ){
				
				let out = [];
				for( let obj of from ){
					
					let o = this.g_findIdInArray( to, obj.id );
					// Dungeon object interactions don't convert to object types
					if( !o )
						o = obj;
					else{
						if( !o.load )
							console.error(o,"has no load method, the asset exists in", this);
						o.load(obj);
					}
					out.push(o);
				}
				return out;

			}

			return from.slice();
		}

		if( typeof to === "object" ){

			if( typeof from !== "object" ){
				if( from !== undefined )
					console.error("Trying to typecast object '"+ident+"', from", from, "to", to, "in", this);
				return {};
			}

			// Add
			if( window.game && game.net_load && to && typeof to.load === "function" ){
				to.load(from);
				return to;
			}

			
			// Overwrite
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
			return Boolean(from);

		

		console.error("Trying to typecast unknown type: "+ident , "from", typeof from, "to", typeof to);
		return from;

	}

	g_guid(){
		return Generic.generateUUID();
	}

	g_resetID(){
		this.id = this.g_guid();
		if( typeof this.onIdChanged === "function" )
			this.onIdChanged();
		return this;
	}

	// Removes default values from save data
	g_sanitizeDefaults( saveData ){

		// Special case for the editor, extended ones are sanitized when saved instead
		if( this._ext )
			return;

		const template = new this.constructor();
		for( let i in saveData ){
			let stored = template[i];
			if( stored === undefined )
				console.error(i, "was not in", template, "this property was added in save() but not the constructor! Did you remove a field from the constructor but forget to remove it in the save() function?");
			if( Array.isArray(stored) )
				stored = stored.map(el => el.save ? el.save("mod") : el);
			if( typeof stored === "object" && stored !== null && stored.save ){
				stored = stored.save("mod");
			}
			if( JSON.stringify(stored) === JSON.stringify(saveData[i]) )
				delete saveData[i];
		}

	}

	// Generic tag fetch. This can be overridden
	getTags(){

		if( !this.tags )
			return [];
		
		let out = [];
		for( let tag of this.tags )
			out.push(tag);

		return out;

	}
	
	// ...args is supplied as arguments to getTags, which can be overridden
	hasTag( tags, ...args ){
		if( !Array.isArray(this.tags) )
			return false;

		if( !Array.isArray(tags) )
			tags = [tags];
		
		let t = this.getTags.apply(this, [...args]);
		for( let tag of t ){
			if( tags.includes(tag) )
				return true;
		}
		return false;
	}

	clone( parent, full = true ){

		if( parent === undefined )
			parent = this.parent;
		else if( !parent )
			parent = undefined;

		return new this.constructor(this.constructor.saveThis(this, full), parent);

	}

	// Returns a library tied to this asset type if possible
	getLib(){
		return this.constructor.getLib();
	}


	// Cycles an input recursively and checks for .save methods and flattens where those are found
	static flattenObject( input ){

		if( input === null || typeof input !== "object" )
			return input;
		if( input && typeof input.save === "function" )
			return input.save(true);
		
		const out = {};
		for( let i in input ){
			if( Array.isArray(input[i]) )
				out[i] = this.flattenArray(input[i]);
			else
				out[i] = this.flattenObject(input[i]);
		}
		return out;

	}
	
	static flattenArray( arr ){

		const out = [];
		for( let obj of arr ){
			if( Array.isArray(obj) )
				out.push(this.flattenArray(obj));
			else
				out.push(this.flattenObject(obj));
		}
		return out;
		
	}

	// Tries to return a library tied to this asset
	static getLib(){
		return glib.getFull(this.name);
	};

	static loadThese( entries = [], parent ){

		let out = [];
		if( typeof entries === "string" )
			entries = [entries];
		if( (!Array.isArray(entries) && typeof entries !== "object") || entries === null ){
			console.error("Trying to batch load invalid assets:", entries);
			return;
		}

		for( let entry of entries ){
			let obj = this.loadThis(entry, parent);
			if( obj !== false )
				out.push(obj);
		}
		return out;

	}

	static loadThis( entry, parent ){

		if( typeof entry === "string" ){

			// Mod editor returns strings as is
			if( !window.game ){
				return entry;
			}

			let n = glib.get(entry, this.name);
			if( typeof n !== "object" )
				console.error("Found a none-object asset in library", this.name, ":", n, "entry was", entry, "parent was", parent);

			if( !n ){
				console.error("Item", entry, "not found in database of", this.name, "parent was", parent, "DB:", glib.getFull(this.name));
				return false;
			}
			delete entry.id;	// Assign a new ID if this was fetched from a template
			entry = n;

		}

		return new this(entry, parent);


	}

	static saveThis( el, full ){
		
		if( typeof el.save !== "function" ){

			if( !window.game && typeof el === "string" )
				return el;

			if( full === "mod" )
				return el;

			console.error(el, "full:", full);
			throw "Error: asset is missing save method ^";

		}

		const sd = el.save(full);
		if( full === "mod" && el._e )
			sd._e = el._e;

		return sd;

	}

	static saveThese( entries = [], full = false ){

		return entries.map(el => this.saveThis(el, full));

	}

	static generateUUID(){

		const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		let array = new Uint8Array(10);
		crypto.getRandomValues(array);
		array = array.map(x => validChars.charCodeAt(x % validChars.length));
		return String.fromCharCode.apply(null, array);

	}



}

// Flag set after library has loaded. This will allow cyclic dependencies for library assets
Generic.auto_rebase = false;



