import {default as VH, VhProgram, VhStage, VhRandObject} from 'https://vibhub.io/cdn/vh-socket.js';
import Game from "./Game.js";
import GameEvent from './GameEvent.js';
import stdTag from '../libraries/stdTag.js';

class VibHub extends VH{

	constructor( ...args ){
		super(...args);

		this.io = false;
		this.device_online = false;
		this.device_id = localStorage.vibHub_device || '';
		this.device = null;

		this.port_front = parseInt(localStorage.vibHub_port_front) || 1;
		this.port_back = parseInt(localStorage.vibHub_port_back) || 2;

		this.begin().then(() => {
			
			console.log("VibHub connected");
			if( this.device_id )
				this.setDevice(this.device_id);

		}).catch(err => console.error(err));

	}


	// A device connected to this app has come online or been added
	onDeviceOnline( id, socket_id ){

		console.log("A device called", id, "has come online, id: ", socket_id);
		this.device_online = true;

	}

	// A device connected to this app has gone offline
	onDeviceOffline( id, socket_id ){

		console.log("A device called", id, "has gone offline, id:", socket_id);
		this.device_online = false;

	}

	// Message received from a modified VibHub device
	onCustomMessage( id, sid, data ){

		if( !Array.isArray(data) )
			return;

		let task = data.shift(),
			val = data.shift()
		;
		console.log("Message received. Id:", id, "SID:", sid, "Task", task, "Val", val);

	}

	onEvent( gameEvent ){


		if( gameEvent.type === GameEvent.Types.textTrigger && gameEvent.text ){


			//console.log(gameEvent);
			if( !window.game || !game.playerIsMe( toArray(gameEvent.target)[0], true ) )
				return;
			
			
			const text = gameEvent.text;
			//console.log("Accepted, checking", text.metaTags);

			let ports = [];
			if( 
				~text.metaTags.indexOf(stdTag.metaSlotGroin) ||
				~text.metaTags.indexOf(stdTag.metaSlotPenis) ||
				~text.metaTags.indexOf(stdTag.metaSlotBalls) ||
				~text.metaTags.indexOf(stdTag.metaSlotClit) ||
				~text.metaTags.indexOf(stdTag.metaSlotVagina) ||
				~text.metaTags.indexOf(stdTag.metaSlotTaint)
			)ports.push(this.port_front);
			
			if( ~text.metaTags.indexOf(stdTag.metaSlotButt) )
				ports.push(this.port_back);

			if( !ports.length )
				return;

			let program;
			if( ~text.metaTags.indexOf(stdTag.metaSqueeze) )
				program = VibHub.Programs.Squeeze;

			else if( ~text.metaTags.indexOf(stdTag.metaTickle) )
				program = VibHub.Programs.Tickle;

			else if( 
				~text.metaTags.indexOf(stdTag.metaGrind) ||
				~text.metaTags.indexOf(stdTag.metaWedgie) ||
				~text.metaTags.indexOf(stdTag.metaStretch) 
			)program = VibHub.Programs.Grind;

			else if( ~text.metaTags.indexOf(stdTag.metaVeryPainful) )
				program = VibHub.Programs.PainHeavy;
			
			else if( ~text.metaTags.indexOf(stdTag.metaPainful) )
				program = VibHub.Programs.Pain;
				
			else if( ~text.metaTags.indexOf(stdTag.metaVeryArousing) )
				program = VibHub.Programs.PleasureHeavy;
				
			else if( ~text.metaTags.indexOf(stdTag.metaArousing) )
				program = VibHub.Programs.Pleasure;
			
			if( !program )
				return;

			program.setPorts(ports);
			console.log("Sending program with ports", ports, program);
			
			this.device.sendProgram(program);

		}
		

	}

	async setDevice( id ){

		localStorage.vibHub_device = this.device_id = id;
		await this.wipeDevices();
		this.device = await this.addDevice( id );

	}

}


VibHub.Programs = {};
VibHub.Programs.Pain = new VhProgram(0, 0);
	VibHub.Programs.Pain.addStage(
		new VhStage({intensity:255, duration:0}),
		new VhStage({intensity:255, duration:100}),
		new VhStage({intensity:0, duration:2000}),
	);

VibHub.Programs.PainHeavy = new VhProgram(0, 0);
	VibHub.Programs.PainHeavy.addStage(
		new VhStage({intensity:255, duration:0}),
		new VhStage({intensity:255, duration:1000}),
		new VhStage({intensity:100, duration:1000}),
		new VhStage({intensity:0, duration:5000}),
	);

VibHub.Programs.Pleasure = new VhProgram(0, 0);
	VibHub.Programs.Pleasure.addStage(
		new VhStage({intensity:50, duration:0}),
		new VhStage({intensity:150, duration:100, yoyo:true, repeats:5}),
		new VhStage({intensity:0, duration:1000}),
	);

VibHub.Programs.PleasureHeavy = new VhProgram(0, 0);
	VibHub.Programs.PleasureHeavy.addStage(
		new VhStage({intensity:100, duration:0}),
		new VhStage({intensity:180, duration:250, yoyo:true, repeats:5}),
		new VhStage({intensity:180, duration:1000, yoyo:true, repeats:1}),
		new VhStage({intensity:0, duration:1000}),
	);

VibHub.Programs.Tickle = new VhProgram(0, 0);
	VibHub.Programs.Tickle.addStage(
		new VhStage({intensity:100, duration:0}),
		new VhStage({intensity:255, duration:100, repeats:15}),
		new VhStage({intensity:0, duration:500}),
	);

VibHub.Programs.Grind = new VhProgram(0, 0);
	VibHub.Programs.Grind.addStage(
		new VhStage({intensity:100, duration:0}),
		new VhStage({intensity:200, duration:500, repeats:3, yoyo:true}),
		new VhStage({intensity:0, duration:2000})
	);

VibHub.Programs.Squeeze = new VhProgram(0, 0);
	VibHub.Programs.Squeeze.addStage(
		new VhStage({intensity:100, duration:0}),
		new VhStage({intensity:180, duration:500, repeats:1, yoyo:true}),
		new VhStage({intensity:220, duration:2000, repeats:1, yoyo:true}),
		new VhStage({intensity:0, duration:500}),
	);


export default new VibHub( "FetishQuest" );
