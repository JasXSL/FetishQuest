const particles = {};
import * as THREE from '../ext/THREE.js';
import Proton from '../ext/three.proton.min.js';
import SPE from '../ext/SPE.min.js';
SPE.valueOverLifetimeLength = 4;

const loader = new THREE.TextureLoader();
const textures = {
	candleFlame : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/sprites/candleflame.png')})),
	flame : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/flame_particle.png')})),
	smoke : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/smokeparticle.png')})),
	glowSphere : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/glow_sphere.png')})),
	sparkle : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/sparkle.png')})),
	electricSpark : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/electric_spark.png')})),
	star : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/star.png')})),
	clawMarks : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/claw_marks.png')})),
	fangs : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/fangs.png')})),
	shield : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/shield.png')})),
	levelup : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/levelup.png')})),
	
	poison : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/poison.png')})),

	lock : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/lock.png')})),
	explosion : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/explosion.png')})),
	splat : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/splatpart_white.png')})),
	plus : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/plus.png')})),
	snowflakes : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/snowflakes.png')})),
	cursedStar : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/cursed_star.png')})),
	yinYang : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/yinyang.png')})),
	swirlOrb : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/swirl_orb.png')})),
};
for( let i in textures )
	textures[i].material.depthWrite = false;

// MESHES
	particles.candleFlame = {
				
		texture: {
			value: textures.candleFlame,
			frames : new THREE.Vector2(8,4),
			loop : 1,
		},
		maxParticleCount : 10,
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
		maxParticleCount : 10,
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
		maxParticleCount : 2,
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
		maxParticleCount : 30,
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
		maxParticleCount : 20,
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
		maxParticleCount : 4,
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
		maxParticleCount : 30,
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
		maxParticleCount : 4,
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

//

// SPELL FX
particles.hitfx_sparks = {
			
	texture: {
		value: textures.glowSphere,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 20,
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
	maxParticleCount : 50,
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
	maxParticleCount : 20,
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

particles.hitfx_sparkles_static_big = {
			
	texture: {
		value: textures.sparkle,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 60,
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
				value : new THREE.Vector3(0,0,0),
				spread : new THREE.Vector3(5,5,5)
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
			particleCount: 60
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
	maxParticleCount : 50,
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
	maxParticleCount : 50,
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
	maxParticleCount : 250,
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
	maxParticleCount : 10,
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

particles.hitfx_levelup = {
	texture: {
		value: textures.levelup,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 10,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 1.5
			},
			position : {
				value : new THREE.Vector3(),
				spread : new THREE.Vector3()
			},
			color : {
				value : new THREE.Color(0xFFFFFF)
			},
			opacity: {
				value: [0,1,1,1,0]
			},
			size: {
				value: [300, 100, 100,100,0]
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
	maxParticleCount : 3,
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
	maxParticleCount : 4,
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
	maxParticleCount : 20,
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
	maxParticleCount : 20,
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
	maxParticleCount : 20,
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
	maxParticleCount : 70,
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
	maxParticleCount : 80,
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

particles.hitfx_crumbs = {
	texture: {
		value: textures.splat,
	},
	blending : THREE.NormalBlending,
	maxParticleCount : 30,
	_emitters : [
		{
			type : SPE.distributions.BOX,
			maxAge: {
				value: 0.4
			},
			position: {
				value: new THREE.Vector3(0, 0, 0),
				spread: new THREE.Vector3( 10, 10, 10 ),
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
					new THREE.Color(0x553300),
					new THREE.Color(0x553300),
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
				value : 0,
				spread : Math.PI
			},
			particleCount: 30
		}
	]
};



particles.hitfx_splat_red = {
	texture: {
		value: textures.splat,
	},
	blending : THREE.AdditiveBlending,
	maxParticleCount : 70,
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
	maxParticleCount : 80,
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
	maxParticleCount : 50,
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
	maxParticleCount : 70,
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
	maxParticleCount : 121,
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
	maxParticleCount : 70,
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
	maxParticleCount : 80,
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
	maxParticleCount : 40,
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
	maxParticleCount : 10,
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
	maxParticleCount : 30,
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
	maxParticleCount : 70,
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
	maxParticleCount : 80,
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
	maxParticleCount : 10,
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
	maxParticleCount : 50,
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
	maxParticleCount : 50,
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
	maxParticleCount : 300,
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

// DONE
particles.hitfx_sludge_bolt = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : [15,30],
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : 5,
	gravity : 2,
	color : ['#330066', '#330033'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : [0,10],
};
particles.hitfx_sludge_bolt_drops = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,1),
	size : [30,1,Proton.ease.easeInBack],
	size_tween : [1,0.05],
	part_max_age : 0.75,
	velocity : 5,
	gravity : 2,
	color : ['#330066', '#330033'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : 10,
};
particles.hitfx_sludge_bolt_impact = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,0),
	size : [30,60],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : new Proton.Span(50, 100),
	gravity:2,
	color : ['#330066', '#330033'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : 10
};
particles.hitfx_sludge_bolt_impact_residue = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,30),
	size : [5,10],
	part_max_age : [2,3],
	velocity : 0,
	gravity:0.025,
	color : ['#6633AA', '#330033'],	
	opacity: [1,0],
	rotation : [new Proton.Span(0,Math.PI)],
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
	maxParticleCount : 200,
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
	maxParticleCount : 200,
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

// Done
particles.hitfx_darkOrb = {
			
	texture : textures.swirlOrb,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,10),
	size : [15,30],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : 10,
	velocity_dir : new Proton.Vector3D(0, -1, 0),
	velocity_type : 0,
	color : ['#220044', '#000000'],	
	opacity: 0.5,
	rotation_start : new Proton.Span(0,Math.PI),
	rotation_speed : new Proton.Span(0,Math.PI),

};




particles.hitfx_dark_star = {
	texture: {
		value: textures.cursedStar,
	},
	blending : THREE.NormalBlending,
	maxParticleCount : 4,
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
	maxParticleCount : 4,
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

particles.get = function(id, debug = false){

	const p = this[id];
	if( debug && p ){

		const emitter = new Proton.Emitter();
		emitter.rate = new Proton.Rate(parseInt(p.count) || 1, +p.rate || 0.1);
		emitter.addInitialize(new Proton.Mass(1));

		if( p.texture ){
			let texture = p.texture;
			if( p.blending ){
				texture = texture.clone();
				texture.material = texture.material.clone();
				texture.material.blending = p.blending;
			}
			emitter.addInitialize(new Proton.Body(texture));
		}
		if( p.position ){
			emitter.addInitialize(new Proton.Position(p.position));
		}
		if( p.size ){
			if( !Array.isArray(p.size) )
				p.size = [p.size];
			emitter.addInitialize(new Proton.Radius(p.size[0], p.size[1], p.size[2]));
		}
		if( p.part_max_age ){
			emitter.addInitialize(new Proton.Life(p.part_max_age));
		}
		if( p.velocity ){
			const dir = p.velocity_dir || new Proton.Vector3D(0,1,0);
			emitter.addInitialize(new Proton.V(p.velocity, dir, p.velocity_type || 360));
		}
		if( p.gravity ){
			emitter.addBehaviour(new Proton.Gravity(p.gravity));
		}
		

		if( p.color ){
			const behavior = new Proton.Color(p.color);
			emitter.addBehaviour(behavior);
		}

		//addBehaviour
		if( p.opacity ){
			if( !Array.isArray(p.opacity) )
				p.opacity = [p.opacity];
			emitter.addBehaviour(new Proton.Alpha(p.opacity[0], p.opacity[1], undefined, p.opacity[2]));
		}

		if( p.size_tween ){
			emitter.addBehaviour(new Proton.Scale(p.size_tween[0], p.size_tween[1], undefined, p.size_tween[2]));
		}

		if( p.rotation ){
			// 1 value = SET
			// 2 values = Tween from A to B
			// 3 values = additive on A. The other 2 can be whatever, just not undefined
			emitter.addBehaviour(new Proton.Rotate(p.rotation[0], p.rotation[1], p.rotation[2]));	//
		}

		if( p.wiggle )
			emitter.addBehaviour(new Proton.RandomDrift(p.wiggle, p.wiggle, p.wiggle, 0.05));


		emitter.emit();
		return emitter;


	}

	/*
	let p = this[id];
	if( p ){
		const out = new SPE.Group(p);
		if( p._emitters ){
			for( let e of p._emitters )
				out.addEmitter(new SPE.Emitter(e));
		}
		return out;
	}
	*/
	
	return false;

};

export default particles;
