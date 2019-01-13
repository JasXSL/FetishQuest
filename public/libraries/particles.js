const particles = {};
import * as THREE from '../ext/THREE.js';
import SPE from '../ext/SPE.min.js';


// Candleflame
particles.candleFlame = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/sprites/candleflame.png'),
		frames : new THREE.Vector2(8,4),
		loop : 1,
	},
	maxParticleCount : 100,
	_emitters : [
		{
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 )
			},
			velocity: {
				value: new THREE.Vector3(0, 2, 0),
				spread: new THREE.Vector3(0, 0, 0)
			},
			color : {
				value : new THREE.Color(0xFFFFAA),
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: 30
			},
			particleCount: 3
		}
	]
};

particles.torchFlame = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/flame_particle.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 3, 3, 3 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 30, 0),
				spread: new THREE.Vector3(0, 10, 0),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0xFFFFFF),
			},
			opacity: {
				value: [0,0.25,1,0.75,0]
			},
			size: {
				value: [70,0],
				randomise : true
			},
			wiggle : {
				value : 3
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 12
		}
	]
};

particles.torchEmbers = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/flame_particle.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 10, 10, 10 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 40, 0),
				spread: new THREE.Vector3(0, 10, 0),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0xFFFFFF),
			},
			opacity: {
				value: [0,0.25,1,0.75,0]
			},
			size: {
				value: [15,0],
				randomise : true
			},
			wiggle : {
				value : 10
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 2
		}
	]
};

particles.torchSmoke = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/smokeparticle.png'),
	},
	blending : THREE.NormalBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			maxAge: {
				value: 3
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 10, 10, 10 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 30, 0),
				spread: new THREE.Vector3(0, 10, 0),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0x333333),
			},
			opacity: {
				value: [0,0.1,0]
			},
			size: {
				value: [20,200],
				randomise : true
			},
			wiggle : {
				value : 10
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 30
		}
	]
};




particles.get = function(id){

	let p = this[id];
	let out = new SPE.Group({maxParticleCount:10});
	if( p ){
		out = new SPE.Group(p);
		if( p._emitters ){
			for( let e of p._emitters )
				out.addEmitter(new SPE.Emitter(e));
		}
	}
	
	return out;

};

export default particles;
