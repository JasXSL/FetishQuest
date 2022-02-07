import Generic from './helpers/Generic.js';
import libParticles from '../libraries/particles.js';
import * as THREE from '../ext/THREE.js'; 
import Player from './Player.js';
export default class HitFX extends Generic{

	static getRelations(){ 
		return {
			stages : Stage,
		};
	}
	
	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.stages = [];
		this.once = false;			// Used when triggering from a text to only play this effect on the first target
		this.desc = '';				// Description
		this.stagger = 0;			// When this effect is played in sequence, delay this effect by this nr of ms
		this._shared_start = null;	// Stores where the last stage with origin_rand was started
		this._shared_end = null;		// Stores where the last stage with dest_rand was started 

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){
		let out = {
			label : this.label,
			stages : Stage.saveThese(this.stages, full),
			once : this.once,
			stagger : this.stagger,
		};
		if( full )
			out.desc = this.desc;
		return out;
	}

	// Automatically invoked after g_autoload
	rebase(){
		this.g_rebase();	// Super
	}

	// See Stage.run for args
	// Handles stagger
	async run( ...args ){

		if( this.stagger )
			this.addStagger(...args);
		else
			return this.exec(...args);

	}

	// Executes the run
	async exec(...args){

		this._shared_start = this._shared_end = null;
		for( let stage of this.stages ){

			await stage.run( ...args );

		}

	}

	// Adds or runs the next stagger
	addStagger( ...args ){

		const self = this.constructor;
		let len = self.queue[this.label]?.length || 0;
		const arr = [...args];
		if( arr.length ){

			if( !self.queue[this.label] )
				self.queue[this.label] = [];
			self.queue[this.label].push(arr);
			// Already playing
			if( len )
				return;

		}

		// Play the next one
		
		const que = self.queue[this.label];
		let next = que[0];
		if( !next )
			return;

		this.exec(...next);
		
		if( que.length ){

			setTimeout(() => {
				que.shift();
				this.clone(this.parent).addStagger();	// Needed because only the first object handles timers
			}, this.stagger);

		}
			

	}


	static queue = {};		// hitfx_id : [(arr)args_for_call...]

	
}

class Stage extends Generic{

	constructor(data, parent){
		super(data);
		this.parent = parent;

		this.css_fx = '';
		this.css_fx_targ = 'victim';		// CSS effect target
		this.particles = '';				// Particle system name
		this.emit_duration = 100;			// Duration before stopping emitting
		this.fade_duration = 2000;			// Time before removing the particle system from the stage after emit_duration ends
		this.hold = 0;						// Wait this amount of MS before doing the next step
		
		this.tween = true;
		this.origin = 'victim';
		this.origin_rand = null;				// percentage of portrait box. An undefined value will use any previously generated value in the visual. Use "preEnd" to copy the previously set end position. Useful for bolt impacts.
		this.destination = 'victim';
		this.dest_rand = null;					// percentage of portrait box. An undefined value will use the same as origin_rand

		this.start_offs = new THREE.Vector3();
		this.end_offs = new THREE.Vector3();
		
		this.easing = "Cubic.In";

		this.sound_kits = [];				// Trigger these sound kits

		this._system = null;				// Holds the particle system itself
		this._start_pos = new THREE.Vector3();
		this._end_pos = new THREE.Vector3();
		
		this.load(data);
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
		this.sound_kits = this.sound_kits.slice();
		this.start_offs = new THREE.Vector3(this.start_offs.x || 0,this.start_offs.y || 0 ,this.start_offs.z||0);
		this.end_offs = new THREE.Vector3(this.end_offs.x||0,this.end_offs.y||0,this.end_offs.z||0);
	}

	save(){
		return {
			particles : this.particles,
			emit_duration : this.emit_duration,
			fade_duration : this.fade_duration,
			hold : this.hold,
			origin : this.origin,
			destination : this.destination,
			origin_rand : this.origin_rand,
			dest_rand : this.dest_rand,
			css_fx : this.css_fx,
			sound_kits : this.sound_kits,
			tween : this.tween,
			start_offs : {x:this.start_offs.x, y:this.start_offs.y, z:this.start_offs.z},
			end_offs : {x:this.end_offs.x, y:this.end_offs.y, z:this.end_offs.z},
			easing : this.easing,
		};
	}

	// Attacker and victim can also be DOM elements
	async run( attacker, victim, armor_slot, mute = false, num_players = 1, ignoreStagger = false ){

		const webgl = game.renderer;

		const is_el = !(attacker instanceof Player);

		const a = this.origin === 'sender' || this.origin === 'attacker' ? attacker : victim, 
			v = this.destination === 'sender' || this.destination === 'attacker' ? attacker : victim
		;
		
				
		if( this.particles ){

			const particles = libParticles.get(this.particles, undefined, true);
			this._system = particles;

			if( !particles ){
				console.error("Particles not found", this.particles);
				return;
			}

			let aEl, vEl;

			if( is_el ){

				aEl = $(attacker);
				vEl = $(victim);

			}
			else{

				aEl = $("#ui div.player[data-id='"+esc(attacker.id)+"']");
				vEl = $("#ui div.player[data-id='"+esc(victim.id)+"']");
				
			}


			const attackerEl = this.origin === 'sender' || this.origin === 'attacker' ? aEl : vEl;
			const victimEl = this.destination === 'sender' || this.destination === 'attacker' ? aEl : vEl;

			const attackerPos = attackerEl.offset();
			const attackerHeight = attackerEl.outerHeight();
			const attackerWidth = attackerEl.outerWidth();
			
			const victimPos = victimEl.offset();
			const victimHeight = victimEl.outerHeight();
			const victimWidth = victimEl.outerWidth();

			if( attackerPos && victimPos ){

				
				

				const hasDestRand = (!isNaN(this.dest_rand) && this.dest_rand !== null) || this.parent._shared_end === null;	// JS why is null a number?
				const hasOriginRand = (!isNaN(this.origin_rand) && this.origin_rand !== null) || this.parent._shared_start === null;	// JS why is null a number?
				
				// Use the previous one's end pos
				if( this.origin_rand === 'preEnd' ){
					this.parent._shared_start.copy(this.parent._shared_end);
				}


				// This stage wants to generate a new end pos
				if( hasDestRand ){
					// These are null at start. We always have to generate a position for the first stage
					if( this.parent._shared_end === null )
						this.parent._shared_end = new THREE.Vector2();

					// Reset start pos
					this.parent._shared_end.x = victimPos.left+victimWidth/2+(Math.random()*victimWidth-victimWidth/2)*(+this.dest_rand || 0);
					this.parent._shared_end.y = victimPos.top+victimHeight/2+(Math.random()*victimHeight-victimHeight/2)*(+this.dest_rand || 0);
				}
				// This stage wants to generate a new start pos
				if( hasOriginRand ){

					if( this.parent._shared_start === null )
						this.parent._shared_start = new THREE.Vector2();

					this.parent._shared_start.x = attackerPos.left+attackerWidth/2+(Math.random()*attackerWidth-attackerWidth/2)*(+this.origin_rand||0);
					this.parent._shared_start.y = attackerPos.top+attackerHeight/2+(Math.random()*attackerHeight-attackerHeight/2)*(+this.origin_rand||0);

				}

				// Copy from parent to this
				this._end_pos.x = this.parent._shared_end.x;
				this._end_pos.y = this.parent._shared_end.y;
				this._start_pos.x = this.parent._shared_start.x;
				this._start_pos.y = this.parent._shared_start.y;
				
				// Store the new start and end positions if needed
				if( hasOriginRand )
					this.parent._shared_start.set(this._start_pos.x, this._start_pos.y);
				if( hasDestRand )
					this.parent._shared_end.set(this._end_pos.x, this._end_pos.y);
				
				if( !this.tween )
					this._start_pos = this._end_pos.clone();

				this._start_pos.add(this.start_offs);
				this._end_pos.add(this.end_offs);


				// raycast start and end
				const origin = webgl.raycastScreenPosition( this._start_pos.x, this._start_pos.y );
				const dest = webgl.raycastScreenPosition( this._end_pos.x, this._end_pos.y );
				
				this._start_pos = origin.point;
				this._end_pos = dest.point;
				this._start_pos.z = 5;
				this._end_pos.z = 5;

				webgl.fx_proton.addEmitter(particles);
				particles.p.x = this._start_pos.x;
				particles.p.y = this._start_pos.y;
				particles.p.z = this._start_pos.z;

				setTimeout(() => {
					particles.destroy();
				}, this.emit_duration);
				
			}

		}

		if( this.css_fx ){

			let targ = victim;
			if( this.css_fx_targ !== 'victim' )
				targ = attacker;
			game.ui.setPlayerVisual(targ, this.css_fx);

		}


		let attached_instances = [];
		if( !mute ){

			const vMulti = 1./Math.pow(2, num_players);
			for( let kit of this.sound_kits ){
				
				game.playFxAudioKitById(kit, a, v, armor_slot, false, vMulti ).then(data => {
					const kit = data.kit;
					const instances = data.instances;
					if( kit.follow_parts )
						attached_instances = attached_instances.concat(instances);
				});
			}
		}
		
		// Handle tweening
		// Tween the position
		let easing = TWEEN.Easing;
		let spl = this.easing.split('.');
		while( spl.length )
			easing = easing[spl.shift()];

		const start = new THREE.Vector3(this._start_pos.x, this._start_pos.y, this._start_pos.z);


		new TWEEN.Tween(start).to(this._end_pos, this.emit_duration).easing(easing)
			.onUpdate(() => {

				const particles = this._system;
				if( particles ){

					// Particles
					particles.p.x = start.x;
					particles.p.y = start.y;
					particles.p.z = start.z;

				}

				// Audio
				for( let instance of attached_instances ){

					instance.setPosition(
						(particles.p.x+start.x)*0.02,
						(particles.p.y+start.y)*0.02,
						-0.5,
					);

				}

			})
			.start();
		

		if( this.hold )
			await delay(this.hold);

	}

}

export {Stage};
