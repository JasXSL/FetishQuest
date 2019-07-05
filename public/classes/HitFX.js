import Generic from './helpers/Generic.js';
import libParticles from '../libraries/particles.js';
import * as THREE from '../ext/THREE.js'; 
import Player from './Player.js';
export default class HitFX extends Generic{
	
	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.stages = [];

		this._t_rand_offset = null;	// THREE.Vector2 Cache for randomizing
		this._s_rand_offset = null;	// THREE.Vector2 Cache for randomizing

		this.load(data);

	}

	load(data){
		this.g_autoload(data);
	}

	// Data that should be saved to drive
	save( full ){
		let out = {
			label : this.label,
			stages : Stage.saveThese(this.stages)
		};
		return out;
	}

	// Automatically invoked after g_autoload
	rebase(){
		this.stages = Stage.loadThese(this.stages, this);
	}

	// See Stage.run for args
	async run( ...args ){


		for( let stage of this.stages ){
			await stage.run( ...args );
			if( stage.hold ){
				this._s_rand_offset = null;
				this._t_rand_offset = null;
			}
		}

	}

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
		this.origin_rand = 0;				// percentage of portrait box
		this.destination = 'victim';
		this.dest_rand = 0;					// percentage of portrait box

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
	async run( attacker, victim, armor_slot, mute = false ){

		const webgl = game.renderer;

		const is_el = !(attacker instanceof Player);
				
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

				aEl = $("#ui div.player[data-id="+esc(attacker.id)+"]");
				vEl = $("#ui div.player[data-id="+esc(victim.id)+"]");
				
			}

			const attackerEl = this.origin === 'sender' || this.origin === 'attacker' ? aEl : vEl;
			const victimEl = this.destination === 'sender' || this.destination === 'attacker' ? aEl : vEl;

			const attackerPos = attackerEl.offset();
			const attackerHeight = attackerEl.outerHeight();
			const attackerWidth = attackerEl.outerWidth();
			
			const victimPos = victimEl.offset();
			const victimHeight = victimEl.outerHeight();
			const victimWidth = victimEl.outerWidth();

			if( !attackerPos ){
				console.error("Attacker pos was not defined", attackerPos, "attacker", attackerEl, "a", attacker, "v", victim);
			}

			this._start_pos.x = attackerPos.left+attackerWidth/2;
			this._start_pos.y = attackerPos.top+attackerHeight/2;
			this._end_pos.x = victimPos.left+victimWidth/2;
			this._end_pos.y = victimPos.top+victimHeight/2;

			if( !this.parent._t_rand_offset && this.dest_rand ){
				// Generate a new random position
				this.parent._t_rand_offset = new THREE.Vector2(
					Math.random()*victimWidth-victimWidth/2,
					Math.random()*victimHeight-victimHeight/2,
				);
			}
			if( !this.parent._s_rand_offset && this.origin_rand ){
				this.parent._s_rand_offset = new THREE.Vector2(
					Math.random()*attackerWidth-attackerWidth/2,
					Math.random()*attackerHeight-attackerHeight/2,
				);
			}

			if( this.origin_rand > 0 ){
				this._start_pos.x += this.parent._s_rand_offset.x*this.origin_rand;
				this._start_pos.y += this.parent._s_rand_offset.y*this.origin_rand;
			}
			if( this.dest_rand > 0 ){
				this._end_pos.x += this.parent._t_rand_offset.x*this.dest_rand;
				this._end_pos.y += this.parent._t_rand_offset.y*this.dest_rand;
			}

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
			
			/*
			setTimeout(() => {
				particles.stopEmit();
			}, this.emit_duration);

			
			setTimeout(() => {
				particles.destroy();
			}, this.emit_duration+this.fade_duration+5000);
			*/
			setTimeout(() => {
				particles.destroy();
			}, this.emit_duration);
		}

		if( this.css_fx ){

			let targ = victim;
			if( this.css_fx_targ !== 'victim' )
				targ = attacker;
			game.ui.setPlayerVisual(targ, this.css_fx);

		}


		let attached_instances = [];
		if( !mute ){
			for( let kit of this.sound_kits ){
				game.playFxAudioKitById(kit, attacker, victim, armor_slot ).then(data => {
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

					// Audio
					for( let instance of attached_instances ){

						instance.setPosition(
							(particles.p.x+start.x)*0.02,
							(particles.p.y+start.y)*0.02,
							-0.5,
						);

					}
					
				}
			})
			.start();
		

		if( this.hold )
			await delay(this.hold);

	}

}

export {Stage};
