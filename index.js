let port = 7175;
if( process.env.PORT )
	port = +process.env.PORT;

const basicAuth = require('express-basic-auth');
const Express = require('express');
let app = Express();
const server = require('http').Server(app);
const Game = require('./Game');
const serveIndex = require('serve-index');
const ImageProxy = require('./ImageProxy');
const multer = require('multer');
const upload = multer({dest : __dirname+'/temp/'});
const fs = require('fs').promises;

const io = require('socket.io')(server);
server.listen(port);
console.debug("Server online on port", port);

if( process.env.PASS ){
	console.log("This app is now password protected");
	app.use(basicAuth({
		challenge : true,
		users: {'patreon':process.env.PASS}
	}));
}

try{

	const Repo = require('./mod_repo/ModRepo');
	Repo.init();
	app.use('/mods', upload.single('file'), async (req, res) => {

		if( !Repo.ini ){

			res.json({success:false, data:{error:'__INITIALIZING__'}});
			return;

		}

		let out = {};
		try{

			const r = new Repo(req, res);
			out = await r.run();

			if( r.download && r.downloadName ){

				res.download(r.download, r.downloadName);
				return;

			}

		}catch(err){
			out.success = false;
			out.err = err;
		}

		res.json(out);
	});
		
}catch(err){
	console.log("Mod repo was not detected", err);
	app.use('/mods', async (req, res) => {
		res.json({success:false, data:{error:'__UNSUPPORTED__'}});
	});
}

process.on('unhandledRejection', (reason, p) => {
	console.log("Unhandled rejection at", p, "reason", reason);
});

const textureDir = __dirname+'/public/media/textures';
const ambianceDir = __dirname+'/public/media/audio/ambiance';
app.use('/modtools2.html', (req, res) => {
	res.redirect('/modtools.html');
});
app.use('/media/textures', Express.static(textureDir), serveIndex(textureDir, {icons:true}));
app.use('/media/audio/ambiance', Express.static(ambianceDir), serveIndex(ambianceDir, {icons:true}));
app.use('/imgproxy', ImageProxy);
app.use('/build_date', async (req, res) => {

	let version = '';
	let success = false;
	try{
		const stat = await fs.stat(__dirname+'/public/libraries/MAIN.fqmod');
		version = stat.mtime;
		success = true;
	}catch(err){
		version = err.message;
	}

	res.json({success:success, data:version});

});
app.use(Express.static(__dirname+'/public'));



Game.io = io;

io.on('connection', socket => {
	
	socket.emit('_id_', socket.id);

	socket.on('host', (data, callback) => {

		
		if( typeof callback !== "function" )
			return;
		
		socket.leaveAll();
		
		if( socket._game )
			socket._game.onPlayerLeft(socket.id);
		
		let game = Game.create(socket);
		callback(game.id);
		
		
	});

	// Join a game
	// Data should be an object with {name:displayName, room:roomID}
	socket.on('join', (data, callback) => {
		if( typeof callback !== "function" )
			return;

		socket.leaveAll();				// Leave all rooms
		Game.onDisconnect(socket);		// Remove me from all games
		callback(Game.join(socket, data));
	});

	socket.on('disconnect', () => {
		Game.onDisconnect(socket);
	});

	// Relays a player task to the host, data should be task:task, data:data
	socket.on('playerTask', data => {

		if( !socket._game )
			return;

		socket._game.host.emit('playerTask', {
			player : socket.id,
			data : data
		});

	});

	// Sends a game update to all players
	socket.on('gameUpdate', data => {
		if( !socket._game )
			return;
		socket._game.emit('gameUpdate', data);
	});
	
	// Relays a dm task to a player, data should be player:player, task:task, data:data. if player is unset, it sends to all
	socket.on('dmTask', data => {

		if( !socket._game || socket.id !== socket._game.host.id || !data )
			return;

		// Send to entire game
		if( !data.player ){
			socket._game.emit('dmTask', data);
			return;
		}

		let player = socket._game.getPlayer(data.player); 
		// Send to a single player
		if( player ){
			delete data.player;
			player.emit('dmTask', data);
		}
		
	});
	
	
});



