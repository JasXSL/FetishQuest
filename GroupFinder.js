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
		return true;

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
		return true;
		
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
			to = this.listings[data.to]
		;

		if( !data.message )
			return;

		let message = String(data.message).substr(0, 256).trim();
		if( !message )
			return;

		if( !from || !to )
			return false;

		if( Date.now()-from.last_msg < 800 )
			return false;

		from.last_msg = Date.now();

		to.socket.emit("gf_msg", {
			message : message,
			sender : fromSocket.id
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
		this.image = '';
		this.is = '';
		this.wants = '';
		this.last_msg = 0;
		
	}

	set( data ){

		if( typeof data !== "object" )
			return;

		this.name = String(data.name || '').substr(0, 64);
		this.image = String(data.image || '').substr(0, 256);
		this.is = String(data.is || '').substr(0, 512);
		this.wants = String(data.wants || '').substr(0, 512);

	}

	getOut(){

		return {
			id : this.socket.id,
			name : this.name,
			image : this.image,
			is : this.is,
			wants : this.wants,
		};


	}

}




module.exports = {
	GroupFinder : GroupFinder
};

