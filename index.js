let port = 7175;
if( process.env.PORT )
	port = +process.env.PORT;
let useModRepo = true;
if( process.env.NO_MOD_REPO )
	useModRepo = false;

import basicAuth from 'express-basic-auth';

import Express from 'express';
import {Server} from 'http';
import Game from './Game.js';
import serveIndex from 'serve-index';
import ImageProxy from './ImageProxy.js';
import multer from 'multer';
import fs from 'fs/promises';
import {GroupFinder as gf} from './GroupFinder.js';
import {Server as sio} from 'socket.io';
import {default as Repo} from './mod_repo/ModRepo.js';


const app = Express();
const server = new Server(app);
const io = new sio({
	maxHttpBufferSize : 1e7, // 10mbyte (10 000 000 bytes)
});
const upload = multer({dest : import.meta.dirname+'/temp/'});
const GroupFinder = new gf();
server.listen(port);
console.debug("Server online on port", port);

function debug(...args){
	//console.log(...args);
}

if( process.env.PASS ){
	console.log("This app is now password protected");
	app.use(basicAuth({
		challenge : true,
		users: {'patreon':process.env.PASS}
	}));
}

if( useModRepo ){

	try{

		Repo.init();
		app.use('/mods', upload.single('file'), async (req, res) => {

			if( !Repo.ini ){

				res.json({
					success:false, 
					data:{
						error:'__INITIALIZING__'
					}
				});
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

}

process.on('unhandledRejection', (reason, p) => {
	console.log("Unhandled rejection at", p, "reason", reason);
});

const textureDir = import.meta.dirname+'/public/media/textures';
const ambianceDir = import.meta.dirname+'/public/media/audio/ambiance';
Express.static.mime.define({'application/wasm' : ['wasm']});
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
		const stat = await fs.stat(import.meta.dirname+'/public/libraries/MAIN.fqmod');
		version = stat.mtime;
		success = true;
	}catch(err){
		version = err.message;
	}

	res.json({success:success, data:version});

});
app.use(Express.static(import.meta.dirname+'/public'));



Game.io = io;
GroupFinder.io = io;

io.on('connection', socket => {
	
	socket.emit('_id_', socket.id);
	socket.onAny((evt, ...args) => {
		debug("Socket received", evt, args, "from", socket.id);
	});
	socket.on('host', (data, callback) => {

		if( typeof callback !== "function" )
			return;
		
		// Remove them from existing games
		Game.onDisconnect(socket);
			
		if( socket._game )
			socket._game.onPlayerLeft(socket.id);

		debug("Socket creating a game", socket.id);
		let game = Game.create(socket);
		callback(game.id);
		
		
	});

	// Join a game
	// Data should be an object with {name:displayName, room:roomID}
	socket.on('join', (data, callback) => {

		if( typeof callback !== "function" )
			return;

		debug("Socket joined game: ", socket.id);
		Game.onDisconnect(socket);		// Remove me from all games
		callback(Game.join(socket, data));

	});

	// Leave a game
	socket.on('leave', (data, callback) => {
		debug("Leave command received", socket.id);
		Game.onDisconnect(socket);
		if( typeof callback === 'function' )
			callback(true);
	});

	socket.on('disconnect', () => {
		debug("Socket disconnected on its own", socket.id);
		Game.onDisconnect(socket);
		GroupFinder.onDisconnect(socket);
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

	// Sets your listing in the groupfinder. If data is empty it removes instead.
	socket.on('setGroupFinder', (data, callback) => {

		const att = GroupFinder.set(socket, data);
		if( typeof callback === 'function' )
			callback(att);

	});

	// Expects data: {id:(str)recipient_id, message:(str)message}
	socket.on('gf_msg', data => {
		GroupFinder.message(socket, data);
	});
	
	
});



