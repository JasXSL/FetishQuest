const particles = {};
import * as THREE from '../ext/THREE.js';
import SPE from '../ext/SPE.min.js';
SPE.valueOverLifetimeLength = 4;

const loader = new THREE.TextureLoader();
const textures = {
	candleFlame : loader.load('/media/textures/sprites/candleflame.png'),
	flame : loader.load('/media/textures/particles/flame_particle.png'),
	smoke : loader.load('/media/textures/particles/smokeparticle.png'),
	glowSphere : loader.load('/media/textures/particles/glow_sphere.png'),
	sparkle : loader.load('/media/textures/particles/sparkle.png'),
	electricSpark : loader.load('/media/textures/particles/electric_spark.png'),
	star : loader.load('/media/textures/particles/star.png'),
	clawMarks : loader.load('/media/textures/particles/claw_marks.png'),
	fangs : loader.load('/media/textures/particles/fangs.png'),
	shield : loader.load('/media/textures/particles/shield.png'),
	
	poison : loader.load('/media/textures/particles/poison.png'),

	lock : loader.load('/media/textures/particles/lock.png'),
	explosion : loader.load('/media/textures/particles/explosion.png'),
	splat : loader.load('/media/textures/particles/splatpart_white.png'),
	plus : loader.load('/media/textures/particles/plus.png'),
	snowflakes : loader.load('/media/textures/particles/snowflakes.png'),
	cursedStar : loader.load('/media/textures/particles/cursed_star.png'),
	yinYang : loader.load('/media/textures/particles/yinyang.png'),

};


// Candleflame
particles.candleFlame = {
			
	texture: {
		value: textures.candleFlame,
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
		value: textures.flame,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 20,
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
			particleCount: 8
		}
	]
};

particles.torchEmbers = {
			
	texture: {
		value: textures.flame,
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
		value: textures.smoke,
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


particles.fireplaceFlame = {
			
	texture: {
		value: textures.flame,
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
				spread: new THREE.Vector3( 20, 20, 20 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 120, 0),
				spread: new THREE.Vector3(0, 20, 0),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0xFFFFFF),
			},
			opacity: {
				value: [0,0.25,0.75,0]
			},
			size: {
				value: [160,0],
				randomise : true
			},
			wiggle : {
				value : 3
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 20
		}
	]
};

particles.fireplaceEmbers = {
			
	texture: {
		value: textures.flame,
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
				spread: new THREE.Vector3( 50, 50, 10 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 120, 0),
				spread: new THREE.Vector3(0, 20, 0),
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
			particleCount: 4
		}
	]
};

particles.fireplaceSmoke = {
			
	texture: {
		value: textures.smoke,
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
				spread: new THREE.Vector3( 30, 30, 10 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 60, 0),
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
				value: [20,400],
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

particles.firebarrelFlame = {
			
	texture: {
		value: textures.flame,
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
				value: new THREE.Vector3(0, 80, 0),
				spread: new THREE.Vector3(0, 10, 0),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0xFFFFFF),
			},
			opacity: {
				value: [0,0.25,0.75,0]
			},
			size: {
				value: [80,0],
				randomise : true
			},
			wiggle : {
				value : 3
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 20
		}
	]
};

particles.firebarrelEmbers = {
			
	texture: {
		value: textures.flame,
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
				spread: new THREE.Vector3( 10, 10, 3 ),
				randomise: true
			},
			velocity: {
				value: new THREE.Vector3(0, 80, 0),
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
				value: [10,0],
				randomise : true
			},
			wiggle : {
				value : 10
			},
			rotation : {
				angle : Math.PI,
				angleSpread : Math.PI,
			},
			particleCount: 4
		}
	]
};




particles.hitfx_sparks = {
			
	texture: {
		value: textures.glowSphere,
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
particles.hitfx_sparks_big = {
			
	texture: {
		value: textures.glowSphere,
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
			particleCount: 50
		}
	]
};
particles.hitfx_sparks_big_yellow = {
			
	texture: {
		value: textures.sparkle,
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
				spread: new THREE.Vector3( 0, 0, 0 ),
			},
			acceleration : {
				value : new THREE.Vector3(0,0,0)
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(100, 100, 50),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFEE),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [5,1,20,1],
				randomise : true
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sparkles_static = {
			
	texture: {
		value: textures.sparkle,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				spread: new THREE.Vector3( 25, 25, 25 ),
			},
			acceleration : {
				value : new THREE.Vector3(0,5,0),
				spread : new THREE.Vector3(0,5,0)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFEE),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [20,5,10,1],
			},
			wiggle : {
				spread : 10,
			},
			particleCount: 20
		}
	]
};


particles.hitfx_sparks_zap = {
			
	texture: {
		value: textures.glowSphere,
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
		value: textures.electricSpark,
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


particles.quest_stars = {
			
	texture: {
		value: textures.star,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
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
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			color : {
				value : new THREE.Color(0xAABBFF)
			},
			opacity: {
				value: 1
			},
			size: {
				value: [0, 20],
			},
			particleCount: 100
		}
	]
};


particles.hitfx_claws = {
	texture: {
		value: textures.clawMarks,
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
				position : new THREE.Vector3(0, -100, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
			},
			velocity : {
				value : new THREE.Vector3(0,-100,0),
			},
			rotation : {
				angle : Math.PI/4,
				axis : new THREE.Vector3(0,0,1)
			},
			color : {
				value : [
					new THREE.Color(0x660000),
					new THREE.Color(0x220000),
				]
			},
			opacity: {
				value: [0,1,0]
			},
			size: {
				value: [20, 60, 20],
			},
			particleCount: 50
		}
	]
};

particles.hitfx_smite = {
	texture: {
		value: textures.glowSphere,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 400,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.2
			},
			velocity : {
				value : new THREE.Vector3(80,40,0),
			},
			rotation : {
				angle : Math.PI*1.5,
				axis : new THREE.Vector3(0,0,1)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFEE),
				]
			},
			opacity: {
				value: [0,1,1]
			},
			
			size: {
				value: [10, 40, 0],
			},
			particleCount: 150
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.3
			},
			velocity : {
				value : new THREE.Vector3(80,80,40),
			},
			rotation : {
				angle : Math.PI,
				axis : new THREE.Vector3(0,0,1)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFEE),
				]
			},
			drag : {
				value : 10
			},
			opacity: {
				value: [0,1,1]
			},
			size: {
				value: [10, 40, 0],
			},
			particleCount: 100
		}
	]
};


particles.hitfx_bite = {
	texture: {
		value: textures.fangs,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 1,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.3
			},
			position : {
				value : new THREE.Vector3(),
				spread : new THREE.Vector3()
			},
			color : {
				value : [
					new THREE.Color(0x660000),
					new THREE.Color(0xFFAAAA),
				]
			},
			opacity: {
				value: [0,1,1,1,0]
			},
			size: {
				value: [300, 50, 50]
			},
			particleCount: 1
		}
	]
};

particles.hitfx_shield = {
	texture: {
		value: textures.shield,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 15,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.75
			},
			position : {
				value : new THREE.Vector3(),
				spread : new THREE.Vector3()
			},
			color : {
				value : [
					new THREE.Color(0xAADDFF),
					new THREE.Color(0xDDEEFF),
				]
			},
			opacity: {
				value: [0,1,1,1,0]
			},
			size: {
				value: [300, 80, 80,80,0]
			},
			particleCount: 10
		}
	]
};

particles.hitfx_poison_pink = {
	texture: {
		value: textures.poison,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 15,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.75
			},
			position : {
				value : new THREE.Vector3(),
				spread : new THREE.Vector3()
			},
			color : {
				value : [
					new THREE.Color(0xFFDDFF),
					new THREE.Color(0xFFEEFF),
				]
			},
			opacity: {
				value: [0,1,1,1,0]
			},
			size: {
				value: [200, 80, 90,80,0]
			},
			particleCount: 3
		}
	]
};

particles.hitfx_lock_yellow = {
	texture: {
		value: textures.lock,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 15,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFEE),
				]
			},
			opacity: {
				value: [0,1,1,1,0]
			},
			size: {
				value: [200, 80,90,80,0]
			},
			particleCount: 4
		}
	]
};

particles.hitfx_punch = {
	texture: {
		value: textures.explosion,
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
		value: textures.glowSphere,
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
		value: textures.explosion,
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
		value: textures.splat,
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
		value: textures.splat,
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



particles.hitfx_splat_red = {
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.SPHERE,
			direction : -1,
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
					new THREE.Color(0xFFAAAA),
				]
			},
			opacity: {
				value: [1,1]
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
particles.hitfx_splat_sparks_red = {
	texture: {
		value: textures.splat,
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
					new THREE.Color(0xFFAAAA),
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

particles.hitfx_healing = {
	texture: {
		value: textures.plus,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 20,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 25, 25, 25 ),
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(10, 10, 10),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, 20, 0),
			},
			wiggle : {
				spread : 5
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [15, 0],
				spread : 1,
				randomise : true
			},
			particleCount: 20
		}
	]
};

particles.hitfx_healing_yellow = {
	texture: {
		value: textures.plus,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.8
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 15, 15, 15 ),
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(10, 10, 10),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, 20, 0),
				spread : new THREE.Vector3(0,10)
			},
			wiggle : {
				spread : 10
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
				value: [15, 0],
				spread : 1,
				randomise : true
			},
			particleCount: 50
		}
	]
};

particles.hitfx_healingSurge = {
	texture: {
		value: textures.splat,
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
				spread: new THREE.Vector3( 1, 1, 1 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(50, 50, 50),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,-50)
			},
			color : {
				value : [
					new THREE.Color(0xAADDFF),
				]
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: [0, 60],
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

particles.hitfx_fountain = {
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.6
			},
			position: {
				spread: new THREE.Vector3( 3, 3, 3 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, 100, 0),
				spread: new THREE.Vector3(15, 0, 15),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,-150)
			},
			color : {
				value : [
					new THREE.Color(0xAADDFF),
				]
			},
			opacity: {
				value: [1,1,0]
			},
			size: {
				value: [30, 50],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			particleCount: 41
		},
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
				value: new THREE.Vector3(0, 100, 0),
				spread: new THREE.Vector3(50, 0, 50),
				randomise : true,
			},
			acceleration : {
				value: new THREE.Vector3(0, -150, 0),
			},
			wiggle : {
				spread : 10
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [10, 1],
				randomise : true
			},
			angle : {
				value : [0,Math.PI*4],
				spread : Math.PI
			},
			particleCount: 80
		}
	]
};


particles.hitfx_splat_blue = {
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.SPHERE,
			direction : -1,
			maxAge: {
				value: 0.25
			},
			position: {
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
					new THREE.Color(0xAADDFF),
				]
			},
			opacity: {
				value: [1,1]
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
particles.hitfx_splat_sparks_blue = {
	texture: {
		value: textures.splat,
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
					new THREE.Color(0xAADDFF),
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



particles.hitfx_mist = {
	texture: {
		value: textures.glowSphere,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 14, 14, 14 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(0, 0, 0),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,10)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,0.25,0]
			},
			size: {
				value: [20, 150],
				randomise : true
			},
			wiggle:{
				spread: 1
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 40
		}
	]
};

particles.hitfx_mist_green_target = {
	texture: {
		value: textures.glowSphere,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 500,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 5, 5, 5 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(5, 5, 5),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0xAAFFAA),
					new THREE.Color(0xDDFFFF),
				]
			},
			opacity: {
				value: [0,0.1,0]
			},
			size: {
				value: [50,70],
				randomise : true
			},
			wiggle:{
				spread: 1
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 500
		}
	]
};

particles.hitfx_mist_pink = {
	texture: {
		value: textures.glowSphere,
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
				spread: new THREE.Vector3( 14, 14, 14 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3(0, 0, 0),
				randomise : true,
			},
			acceleration : {
				value : new THREE.Vector3(0,25)
			},
			color : {
				value : [
					new THREE.Color(0xFFAAFF),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,0.25,0]
			},
			size: {
				value: [20, 150],
				randomise : true
			},
			wiggle:{
				spread: 1
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 10
		}
	]
};

particles.hitfx_mist_yellow = {
	texture: {
		value: textures.glowSphere,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 100,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 14, 14, 14 ),
				radius : 1
			},
			acceleration : {
				value : new THREE.Vector3(0,10)
			},
			color : {
				value : [
					new THREE.Color(0xFFFFAA),
					new THREE.Color(0xFFFFFF),
				]
			},
			opacity: {
				value: [0,0.25,0]
			},
			size: {
				value: [20, 150],
				randomise : true
			},
			wiggle:{
				spread: 1
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			particleCount: 30
		}
	]
};


particles.hitfx_splat_discrete = {
	texture: {
		value: textures.splat,
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
		value: textures.splat,
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
		value: textures.splat,
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
		value: textures.snowflakes,
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
		value: textures.snowflakes,
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



particles.hitfx_sludge_siphon = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 500,
	_emitters : [
		{
			direction:-1,
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 2, 2, 2 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -10, 0),
				spread: new THREE.Vector3(15, 15, 15),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x330066),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [0,0.5,1,0.25]
			},
			size: {
				value: 50,
				spread : 50,
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 200
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.75
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -20, 0),
				spread: new THREE.Vector3(5, 5, 5),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x330066),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [30, 5, 15, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sludge_bolt = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
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
				value : [
					new THREE.Color(0x330066),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [90, 1],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.75
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -20, 0),
				spread: new THREE.Vector3(5, 5, 5),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x330066),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [30, 5, 15, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sludge_bolt_impact = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
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
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x330066),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [120, 1],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 20, 20, 20 ),
				radius : 1
			},
			acceleration : {
				value: new THREE.Vector3(0, -1, 0),
				spread : new THREE.Vector3(0,3,0)
			},
			color : {
				value : [
					new THREE.Color(0x6633AA),
					new THREE.Color(0x330033)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [30],
				spread : 10,
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 1,
				randomise : true
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sludge_bolt_proc = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 2
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 30, 30, 30 ),
				radius : 1
			},
			acceleration : {
				value: new THREE.Vector3(0, -0.5, 0),
				spread : new THREE.Vector3(0,1.5,0)
			},
			color : {
				value : [
					new THREE.Color(0x6633AA),
					new THREE.Color(0x552299)
				]
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: 30,
				spread : 30,
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 1,
				randomise : true
			},
			particleCount: 300
		}
	]
};

particles.hitfx_sludge_bolt_black = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
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
				value : [
					new THREE.Color(0x000000),
					new THREE.Color(0x111111)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [90, 1],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.75
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 0, 0, 0 ),
				radius : 1
			},
			velocity : {
				value: new THREE.Vector3(0, -20, 0),
				spread: new THREE.Vector3(5, 5, 5),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x000000),
					new THREE.Color(0x111111)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [30, 5, 15, 1],
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sludge_bolt_impact_black = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
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
				spread: new THREE.Vector3(100, 100, 100),
				randomise : true,
			},
			color : {
				value : [
					new THREE.Color(0x000000),
					new THREE.Color(0x111111)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [120, 1],
				randomise : true
			},
			angle : {
				value : [0,Math.PI],
				spread : Math.PI
			},
			wiggle : {
				spread : 10
			},
			particleCount: 100
		},
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1.5
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 20, 20, 20 ),
				radius : 1
			},
			acceleration : {
				value: new THREE.Vector3(0, -1, 0),
				spread : new THREE.Vector3(0,3,0)
			},
			color : {
				value : [
					new THREE.Color(0x000000),
					new THREE.Color(0x111111)
				]
			},
			opacity: {
				value: [1,1]
			},
			size: {
				value: [30],
				spread : 10,
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 1,
				randomise : true
			},
			particleCount: 100
		}
	]
};

particles.hitfx_sludge_bolt_proc_black = {
			
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 300,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 2
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 30, 30, 30 ),
				radius : 1
			},
			acceleration : {
				value: new THREE.Vector3(0, -0.5, 0),
				spread : new THREE.Vector3(0,1.5,0)
			},
			color : {
				value : [
					new THREE.Color(0x000000),
					new THREE.Color(0x111111)
				]
			},
			opacity: {
				value: [1,0]
			},
			size: {
				value: 30,
				spread : 30,
				randomise : true
			},
			angle : {
				value : 0,
				spread : Math.PI
			},
			wiggle : {
				spread : 1,
				randomise : true
			},
			particleCount: 300
		}
	]
};


particles.hitfx_dark_star = {
	texture: {
		value: textures.cursedStar,
	},
	blending : THREE.NormalBlending,
	maxParticleCount : 15,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			color : {
				value : [
					new THREE.Color(0x110033),
					new THREE.Color(0x000000),
				]
			},
			opacity: {
				value: [0,1,1,0]
			},
			size: {
				value: [200, 80,90,80,0]
			},
			angle : {
				value : [0, Math.PI]
			},
			particleCount: 4
		}
	]
};

particles.hitfx_yin_yang = {
	texture: {
		value: textures.yinYang,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 15,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.5
			},
			color : {
				value : [
					new THREE.Color(0xAAFFDD),
					new THREE.Color(0xDDFFDD),
				]
			},
			opacity: {
				value: [0,1,1,0]
			},
			size: {
				value: [200, 80,90,80,0]
			},
			angle : {
				value : [0, Math.PI]
			},
			particleCount: 4
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
