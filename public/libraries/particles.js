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



particles.hitfx_sparks = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/glow_sphere.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.DISC,
			maxAge: {
				value: 0.25
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			acceleration : {
				value : new THREE.Vector3(0,-100,0)
			},
			velocity : {
				value: new THREE.Vector3(50, 50, 50),
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [0, 10],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 20
		}
	]
};


particles.hitfx_sparks_zap = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/glow_sphere.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.25
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 1, 1, 1 ),
				radius : 1
			},
			acceleration : {
				value : new THREE.Vector3(0,-50,0)
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xAADDFF),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [0, 10],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 100
		}
	]
};

particles.hitfx_zap = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/electric_spark.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 200,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.2
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 5, 5, 5 ),
			},
			velocity : {
				value: new THREE.Vector3(0,0,0),
				spread: new THREE.Vector3(50, 50, 50),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x33AAFF),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,1]
			},
			size: {
				value: [0, 60],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			particleCount: 50
		}
	]
};


particles.hitfx_punch = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/explosion.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.SPHERE,
			maxAge: {
				value: 0.15
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(1, 1, 1),
				spread: new THREE.Vector3(1, 1, 1),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,1]
			},
			size: {
				value: [0, 100],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 20
		}
	]
};

particles.hitfx_sparks_smaller = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/glow_sphere.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.DISC,
			maxAge: {
				value: 0.25
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			acceleration : {
				value : new THREE.Vector3(0,-50,0)
			},
			velocity : {
				value: new THREE.Vector3(25, 25, 25),
				spread: new THREE.Vector3(50, 50, 50),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [0, 5],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 20
		}
	]
};

particles.hitfx_punch_smaller = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/explosion.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.SPHERE,
			maxAge: {
				value: 0.15
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0.5, 0.5, 0.5),
				spread: new THREE.Vector3(1, 1, 1),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,1]
			},
			size: {
				value: [0, 50],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 20
		}
	]
};

particles.hitfx_splat = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/splatpart_white.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.SPHERE,
			maxAge: {
				value: 0.25
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(10, 0, 0),
				spread: new THREE.Vector3(50, 0, 0),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,-200)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
					new THREE.Color(0xEEFFEE),
				]
			},
			opacity: {
				value: [0,1]
			},
			size: {
				value: [0, 40],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 70
		}
	]
};

particles.hitfx_splat_sparks = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/splatpart_white.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.4
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
			},
			velocity : {
				value: new THREE.Vector3(10, 10, 10),
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, -100, 0),
			},
			wiggle : {
				spread : 10
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
					new THREE.Color(0xEEFFEE),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [5, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 80
		}
	]
};

particles.hitfx_splat_discrete = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/splatpart_white.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.25
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
			},
			velocity : {
				value: new THREE.Vector3(0, -5, 0),
				spread: new THREE.Vector3(15, 15, 15),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,-10)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,.25,0]
			},
			size: {
				value: [0, 30],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 70
		}
	]
};


particles.hitfx_splat_sparks_discrete = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/splatpart_white.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.4
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
			},
			velocity : {
				value: new THREE.Vector3(5, 5, 5),
				spread: new THREE.Vector3(25, 25, 25),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, -50, 0),
			},
			wiggle : {
				spread : 5
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
					new THREE.Color(0xEEFFEE),
				]
			},
			opacity: {
				value: [0.5,0.5]
			},
			size: {
				value: [5, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 80
		}
	]
};
particles.hitfx_splat_sparks_discreter = {
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/splatpart_white.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(30, 30, 30),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, -25, 0),
			},
			wiggle : {
				spread : 5
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
					new THREE.Color(0xEEFFEE),
				]
			},
			opacity: {
				value: [0.5,0.5]
			},
			size: {
				value: [7, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 10
		}
	]
};

particles.hitfx_snow_sparks = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/snowflakes.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -10, 0),
				spread: new THREE.Vector3(15, 15, 15),
				randomise : true,
			},
			color : {
				value : [new THREE.Color(0xFFFFFF),new THREE.Color(0xAAAAFF)]
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: [90, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 50
		}
	]
};

particles.hitfx_snow_sparks_impact = {
			
	texture: {
		value: new THREE.TextureLoader().load('/media/textures/particles/snowflakes.png'),
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 10, 10, 10 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -10, 0),
				spread: new THREE.Vector3(50, 50, 50),
				randomise : true,
			},
			color : {
				value : [new THREE.Color(0xFFFFFF),new THREE.Color(0xAAAAFF)]
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: [90, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 50
		}
	]
};


particles.get = function(id){

	let p = this[id];
	if( p ){
		const out = new SPE.Group(p);
		if( p._emitters ){
			for( let e of p._emitters )
				out.addEmitter(new SPE.Emitter(e));
		}
		return out;
	}
	
	return false;

};

export default particles;
