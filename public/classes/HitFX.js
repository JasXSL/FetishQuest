import Generic from './helpers/Generic.js';
import libParticles from '../libraries/particles.js';
import * as THREE from '../ext/THREE.js'; 
export default class HitFX extends Generic{
	
	constructor(data, parent){
		super(data);
		
		this.parent = parent;
		
		this.label = '';
		this.stages = [];

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

	async run( attacker, victim ){

		for( let stage of this.stages ){
			await stage.run( attacker, victim );
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

		// Todo: implement these
		this.origin = 'victim';
		this.origin_rand = false;
		this.destination = 'victim';
		this.dest_rand = false;

		this._system = null;				// Holds the particle system itself
		this._start_pos = new THREE.Vector3();
		this._end_pos = new THREE.Vector3();
		
		this.load(data);
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){

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
			css_fx : this.css_fx
		};
	}

	async run( attacker, victim ){

		const webgl = game.renderer;

		if( this.particles ){

			const particles = libParticles.get(this.particles);
			this._system = particles;

			if( !particles ){
				console.error("Particles not found", this.particles);
				return;
			}

			const aEl = $("#ui div.player[data-id="+esc(attacker.id)+"]");
			const vEl = $("#ui div.player[data-id="+esc(victim.id)+"]");
			
			const attackerEl = this.origin === 'attacker' ? aEl : vEl;
			const attackerPos = attackerEl.offset();
			const attackerHeight = attackerEl.outerHeight();
			const attackerWidth = attackerEl.outerWidth();
			const victimEl = this.victim === 'attacker' ? aEl : vEl;
			const victimPos = victimEl.offset();
			const victimHeight = victimEl.outerHeight();
			const victimWidth = victimEl.outerWidth();

			this._start_pos.x = attackerPos.left+attackerWidth/2;
			this._start_pos.y = attackerPos.top+attackerHeight/2;
			this._end_pos.x = victimPos.left+victimWidth/2;
			this._end_pos.y = victimPos.top+victimHeight/2;

			if( this.origin_rand ){
				this._start_pos.x += Math.random()*attackerWidth-attackerWidth/2;
				this._start_pos.y += Math.random()*attackerHeight-attackerHeight/2;
			}
			if( this.dest_rand ){
				this._end_pos.x += Math.random()*victimWidth-victimWidth/2;
				this._end_pos.y += Math.random()*victimHeight-victimHeight/2;
			}

			// raycast start and end
			const origin = webgl.raycastScreenPosition( this._start_pos.x, this._start_pos.y );
			const dest = webgl.raycastScreenPosition( this._end_pos.x, this._end_pos.y );
			
			this._start_pos = origin.point;
			this._end_pos = dest.point;
			this._start_pos.z = 5;
			this._end_pos.z = 5;
			

			webgl.fxScene.add(particles.mesh);
			particles.mesh.position.copy(this._start_pos);
			webgl.fxParticles.push(particles);

			// Tween the position
			const start = new THREE.Vector3();
			console.log(particles.emitters[0]);
			
			new TWEEN.Tween(start).to(this._end_pos.sub(this._start_pos), this.emit_duration).easing(TWEEN.Easing.Cubic.In)
				.onUpdate(() => {
					particles.emitters[0].position.value.x = start.x;
					particles.emitters[0].position.value.y = start.y;
					particles.emitters[0].position.value.z = start.z;
					particles.emitters[0].position.value = particles.emitters[0].position.value;
				})
				.start();
			

			setTimeout(() => {
				for( let emitter of particles.emitters )
					emitter.disable();
			}, this.emit_duration);
			setTimeout(() => {
				let pos = webgl.fxParticles.indexOf(particles);
				webgl.fxScene.remove(particles.mesh);
				if( ~pos )
					webgl.fxParticles.splice(particles, 1);
			}, this.emit_duration+this.fade_duration);

		}

		if( this.css_fx ){

			let targ = victim;
			if( this.css_fx_targ !== 'victim' )
				targ = attacker;
			game.ui.setPlayerVisual(targ, this.css_fx);

		}


		if( this.hold )
			await new Promise(res => 
				setTimeout(res, this.hold)
			);

	}

}

export {Stage};
