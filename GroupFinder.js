/*
	output tasks:
	gf_pl : Listing - Player has changed or been added
	gf_pla : [Listing...] - Array of ALL listings
	gf_rem : id - Player has been removed
	gf_msg : {
		sender : (str)senderID,
		message : (str)message
	}
*/
class GroupFinder{

	constructor(){

		this.listings = {};	// socket id : listing
		this.io = null;

	}

	onDisconnect( socket ){

		this.removeListing(socket);

	}

	// Sets your listing
	set( socket, data ){

		if( !data )
			return this.onDisconnect(socket);
		
		if( !this.listings[socket.id] )
			this.listings[socket.id] = new Listing(socket);

		this.listings[socket.id].set(data);
		this.join(socket);
		this.io.to('_GF_').emit('gf_pl', this.listings[socket.id].getOut());
		socket.emit('gf_pla', this.getAll());

		console.log("SET :: Players in group finder: ", Object.keys(this.listings).length);
		
	}

	// Joins the player update room
	join( socket ){

		socket.join('_GF_');	// Join groupfinder for user push change

	}

	// Gets all current listings. Todo: May wanna paginate this if it ever gets popular.
	getAll(){

		return Object.values(this.listings).map(el => el.getOut());

	}

	// sends a direct message
	message( fromSocket, data ){

		if( typeof data !== "object" )
			return;

		const 
			from = this.listings[fromSocket.id],
			to = this.listings[data.id]
		;

		if( !data.message )
			return;

		let message = String(data.message).substr(256).trim();
		if( !message )
			return;

		if( !from || !to )
			return false;

		to.socket.emit("gf_msg", {
			message : message,
			sender : fromSocket.io
		});

	}

	// Removes your listing
	removeListing( socket ){

		socket.leave('_GF_');
		this.io.to('_GF_').emit('gf_rem', socket.id);
		delete this.listings[socket.id];

		console.log("REM :: Players in group finder: ", Object.keys(this.listings).length);

	}

}


class Listing{

	constructor( socket ){
		
		this.socket = socket;
		this.name = '';
		this.species = '';
		this.image = '';
		this.sex = '';
		this.prefers_sex = '';
		this.rp_style = '';
		this.mods = '';
		this.prefers_roles = '';
	}

	set( data ){

		this.name = String(data.name || '').substr(0, 128);
		this.species = String(data.species || '').substr(0, 128);
		this.image = String(data.image || '').substr(0, 256);
		this.sex = String(data.sex || '').substr(0, 64);
		this.prefers_sex = String(data.prefers_sex || '').substr(0, 64);
		this.rp_style = String(data.rp_style || '').substr(64);
		this.mods = String(data.mods || '').substr(128);

	}

	getOut(){

		return {
			id : this.socket.id,
			name : this.name,
			species : this.species,
			image : this.image,
			sex : this.sex,
			prefers_sex : this.prefers_sex,
			rp_style : this.rp_style,
			mods : this.mods,
			prefers_roles : this.prefers_roles
		}


	}

}




module.exports = {
	GroupFinder : GroupFinder
};

