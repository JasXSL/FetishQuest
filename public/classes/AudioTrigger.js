import { AudioKit } from "./Audio.js";
import Condition from "./Condition.js";
import Generic from "./helpers/Generic.js";


// Kit that can play
export default class AudioTrigger extends Generic{

	static queue = [];		// 
	static last = {};		// id : last trig

	static getRelations(){ 
		return {
			conditions : Condition,
			sounds : AudioKit
		};
	}

	constructor( data ){
		super(data);
		this.label = '';
		this.priority = 1;			// Higher priorities are validated first
		this.freq = 50;				// Percent chance of triggering. Multiplied against player emotive.
		this.sounds = [];			// AudioKits, when triggering, this is picked at random
		this.conditions = [];		// Conditions to trigger it
		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

	save( full ){
		const out = {};
		if( full ){
			out.freq = this.freq;
			out.priority = this.priority;
			out.sounds = AudioKit.saveThese(this.sounds, full);
			out.label = this.label;
			out.conditions = Condition.saveThese(this.conditions, full);
		}
		return out;
	}

	test( event, debug ){

		return Condition.all(this.conditions, event, debug);

	}

	static getPredelayFromEvent( event ){

		let fail = 400;
		let text = event.text;
		if( !text )
			text = event.custom?.original?.text;
		if( !text )
			return fail;
		
		
		for( let fx of text.hitfx ){

			if( fx.hit )
				return fx.hit;

		}

		return fail;

	}


	static trigger( trigger, event ){
		
		const preQ = this.queue.length;
		const targs = toArray(event.target);
		for( let t of targs ){

			if( !t )
				continue;

			const now = Date.now();
			const last = this.last[t.id] || 0;
			// Max 500ms freq per player
			if( now-last < 500 )
				continue;

			let chance = trigger.freq*t.emotive/100.0;
			if( Math.random() > chance )
				continue;

			this.last[t.id] = now;
			this.queue.push(new AudioTriggerQueue(
				trigger, event.sender, t, this.getPredelayFromEvent(event)
			));

		}

		if( !preQ )
			this.handleQueue();

	}

	static handleQueue(){

		if( !this.queue.length )
			return;

		const qItem = this.queue[0];
		const kit = randElem(qItem.kit.sounds);
		const predelay = qItem.predelay || 1;

		setTimeout(() => {
			game.playVoiceAudioKit(
				kit, 
				qItem.sender,
				qItem.target, 
				undefined, 	// Hit slot
				true // Global
			);
		}, predelay);
		

		setTimeout(() => {

			this.queue.shift();
			this.handleQueue();

		}, 100+Math.random()*100);

	}


	static handleEvent( event ){

		const viable = [];
		const all = glib.getFull('AudioTrigger');
		for( let i in all ){

			const kit = all[i];
			if( kit.test(event) )
				viable.push(kit);

		}

		viable.sort((a,b) => {

			if( a.priority === b.priority )
				return 0;
			return a.priority > b.priority ? -1 : 1;

		});
		for( let kit of viable )
			this.trigger(kit, event);

	}

	// Gets all voice types by cycling through the conditions
	// Could be done in a better way at some point?
	static getAllLabels(){

		const out = {};
		const full = glib.getFull('Condition');
		for( let i in full ){

			const cond = full[i];
			if( cond.type === Condition.Types.voice ){

				let voices = toArray(cond.data?.label);
				for( let v of voices ){
					if( v )
						out[v] = true;
				}

			}

		}
		return Object.keys(out);

	}

}

class AudioTriggerQueue{

	constructor( kit, sender, target, predelay = 100 ){

		this.kit = kit;
		this.target = target;
		this.sender = sender;
		this.predelay = predelay;

	}

}


