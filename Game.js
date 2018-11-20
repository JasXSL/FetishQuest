const uuidv4 = require('uuid/v4');

class Game{

	constructor( hostSocket ){

		this.id = uuidv4();
		this.host = hostSocket;
		this.players = [];
		this.addPlayer(hostSocket, "DM");

	}

	getPlayerArray(){
		let out = [];
		for( let player of this.players ){
			let data = {id:player.id, name:player._name};
			if( player === this.host )
				data.name = 'DM';
			out.push(data);
		}
		return out;
	}

	getRoomId(){
		return 'game_'+this.id;
	}

	emit(type, data){
		Game.io.to(this.getRoomId()).emit(type, data);
	}


	addPlayer(socket, name){

		this.players.push(socket);
		
		socket.join(this.getRoomId());
		
		
		socket._game = this;
		socket._name = name;

		// Timeout fixes a bug in socket.io
		setTimeout(() => {
			this.emit(Game.Tasks.playerJoined, {
				id : socket.id,
				name : socket._name,
				players : this.getPlayerArray()
			});
		}, 10);
		
	}

	onHostLeft(){
		for( let player of this.players ){

			this.emit(Game.Tasks.hostLeft);
			if( player.id !== this.host.id ){
				player.disconnect();
			}
			
		}
	}

	onPlayerLeft( socket ){
		for( let i in this.players ){
			let player = this.players[i];
			if( player.id === socket.id ){
				this.players.splice(i, 1);
				this.emit(Game.Tasks.playerLeft, {id:socket.id});
			}
		}
	}

	getPlayer(id){
		
		for( let player of this.players ){
			if( id === player.id )
				return player;
		}
		return false;
	}

}

Game.Tasks = {
	hostLeft : 'hostLeft',				// void
	playerLeft : 'playerLeft',			// {id:playerID}
	playerJoined : 'playerJoined',		// {id:playerID, name:(str)playerAssets, players:playerArray}
}


Game.io = null;	// Set by index
Game.games = [];

Game.onDisconnect = function(socket){

	// Need to search through games to splice the index
	for( let i in Game.games ){
		let game = Game.games[i];
		let index = game.players.indexOf(socket);
		if( ~index ){
			if( game.host === socket ){
				// Shut down the game
				game.onHostLeft();
				Game.games.splice(i, 1);
				return;
			}
			return game.onPlayerLeft(socket);
		}
	}
	
};

Game.create = function(socket){

	this.onDisconnect(socket);
	let g = new Game(socket);
	Game.games.push(g);
	return g;

}

Game.join = function(socket, data){

	
	if( typeof data !== "object" )
		return false;
		
	if( typeof data.name !== "string" || !data.name.trim().length || data.name.trim().toUpperCase() === "DM" )
		return false;
		
	if( typeof data.room !== "string" )
		return false;

	for( let game of Game.games ){
		if( game.id === data.room ){
			game.addPlayer(socket, data.name.trim().substr(0,16));
			return true;
		}
	}
	return false;
}

module.exports = Game;
