const particles = {};
import * as THREE from '../ext/THREE.js';
import Proton from '../ext/three.proton.min.js';
import SPE from '../ext/SPE.min.js';
SPE.valueOverLifetimeLength = 4;

const loader = new THREE.TextureLoader();
const textures = {
	candleFlame : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/candleflame.png')})),
	flame : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/flame_particle.png')})),
	bubble : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/bubble.png')})),
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
	eye : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/eye.png')})),
	explosion : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/explosion.png')})),
	splat : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/splatpart_white.png')})),
	plus : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/plus.png')})),
	snowflakes : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/snowflakes.png')})),
	cursedStar : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/cursed_star.png')})),
	cowl : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/cowl.png')})),
	yinYang : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/yinyang.png')})),
	swirlOrb : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/swirl_orb.png')})),
	pulse : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/soundpulse.png')})),
	glowRing : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/glow_ring.png')})),
	holyRune : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/holy_rune.png')})),
	rock : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/rock.png')})),
	kiss : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/kiss.png')})),
	heart : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/heart.png')})),
	worms : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/worms.png')})),
	roots : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/roots.png')})),
	skitteringInsect : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/skittering_insect.png')})),
	stingingInsect : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/stinging_insect.png')})),
	coin : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/coin_particle.png')})),
	bone_shards : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/bone_shards.png')})),
	tentacles : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/tentacles.png')})),
	chains : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/chains.png')})),
	grab : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/grab.png')})),
	shoe : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/shoe.png')})),
	crosshair : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/crosshair.png')})),
	dice : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/dice.png')})),

};
for( let i in textures )
	textures[i].material.depthWrite = false;
textures.candleFlame.material.depthWrite = true;
textures.flame.material.depthWrite = true;
textures.smoke.material.depthWrite = true;

// MESHES
	particles.candleFlame = {
		texture : textures.candleFlame,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,0),
		size : 5,
		part_max_age : 0.5,
		velocity : 0,
		gravity : -0.25,
		color : "#FFFFAA",	
		opacity: [1,0],
	};

	particles.candleFlameLarge = {
		texture : textures.candleFlame,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,0),
		size : 10,
		part_max_age : 0.5,
		velocity : 0,
		gravity : -0.25,
		color : "#FFFFAA",	
		opacity: [1,0],
	};

	particles.torchFlame = {
	
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.05,
		count : 1,
		position : new Proton.SphereZone(0,0,0,3),
		size : 50,
		size_tween : [1,0.001],
		part_max_age : 0.5,
		velocity : 0.1,
		gravity : -2,
		color : "#FFFFFF",	
		opacity: [0,1,Proton.ease.easeFullSine],
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1]
	};

	particles.torchEmbers = {
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.5,
		count : 1,
		position : new Proton.SphereZone(0,0,0,20),
		size : 5,
		size_tween : [1,0.001],
		part_max_age : 0.5,
		velocity : 0,
		gravity : -6,
		color : "#FFFFFF",	
		opacity: 1,
		wiggle : 10,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.torchSmoke = {	
		texture : textures.smoke,
		blending : THREE.NormalBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,5),
		size : 200,
		size_tween : [0.2,1],
		part_max_age : 3,
		velocity : 0.001,
		gravity : -1,
		color : "#333333",	
		opacity: [0,0.1,Proton.ease.easeFullSine],
		wiggle : 1,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};


	particles.fireplaceFlame = {
				
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.05,
		count : 1,
		position : new Proton.SphereZone(0,0,0,10),
		size : 150,
		size_tween : [1,0.001],
		part_max_age : 0.5,
		velocity : 0.1,
		gravity : -8,
		color : ["#FFFFFF","#FFAAAA"],	
		opacity: [0,1,Proton.ease.easeFullSine],
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1]
	};

	particles.fireplaceEmbers = {
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.15,
		count : 1,
		position : new Proton.SphereZone(0,0,0,30),
		size : 15,
		size_tween : [1,0.001],
		part_max_age : 0.75,
		velocity : 0,
		gravity : -8,
		color : "#FFFFFF",	
		opacity: 1,
		wiggle : 10,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.fireplaceSmoke = {
				
		texture : textures.smoke,
		blending : THREE.NormalBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,20),
		size : 100,
		size_tween : [0.2,1],
		part_max_age : 3,
		velocity : 0.001,
		gravity : -0.5,
		color : "#333333",	
		opacity: [0,0.1,Proton.ease.easeFullSine],
		wiggle : 1,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.firebarrelFlame = {
				
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.05,
		count : 1,
		position : new Proton.SphereZone(0,0,0,3),
		size : 40,
		size_tween : [1,0.001],
		part_max_age : 0.5,
		velocity : 0.1,
		gravity : -4,
		color : ["#FFFFFF","#FFAAAA"],	
		opacity: [0,1,Proton.ease.easeFullSine],
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1]
	};

	particles.firebarrelEmbers = {
				
		texture : textures.flame,
		blending : THREE.AdditiveBlending,
		rate : 0.25,
		count : 1,
		position : new Proton.SphereZone(0,0,0,10),
		size : 10,
		size_tween : [1,0.001],
		part_max_age : 0.75,
		velocity : 0,
		gravity : -5,
		color : "#FFFFFF",	
		opacity: 1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],

	};

	particles.runeSparkles = {
		
		texture : textures.sparkle,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,50),
		size : 5,
		size_tween : [1,0.05],
		part_max_age : 1.5,
		velocity : 0,
		gravity : -2,
		color : ["#AA66FF", "#FFFFFF"],	
		opacity: 1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.waygateOrbs = {
		
		texture : textures.glowRing,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,100),
		size : 500,
		size_tween : [1,0],
		part_max_age : 1.5,
		velocity : 0,
		gravity : 0,
		color : ["#AA66FF", "#FFFFFF"],	
		opacity: [.05,1, Proton.ease.easeFullSine],
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.waygateSparkles = {
		
		texture : textures.sparkle,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,100),
		size : 60,
		size_tween : [1,0.1],
		part_max_age : 1.5,
		velocity : 500,
		gravity : 100,
		color : ["#AA66FF", "#FFFFFF"],	
		opacity: 1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.dustMotes = {
		
		texture : textures.sparkle,
		blending : THREE.NormalBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.BoxZone(0,0,0,500, 100, 500),
		size : 5,
		size_tween : [0,1, Proton.ease.easeFullSine],
		part_max_age : 3,
		velocity : 30,
		gravity : 0.25,
		color : "#FFFFFF",	
		opacity: 1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.steam = {
		
		texture : textures.smoke,
		blending : THREE.NormalBlending,
		rate : 0.2,
		count : 1,
		position : new Proton.BoxZone(0,0,0,500, 100, 500),
		size : 300,
		size_tween : [0,1, Proton.ease.easeFullSine],
		part_max_age : 10,
		velocity : 10,
		gravity : 0.0,
		color : "#FFFFFF",	
		opacity: 0.1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.01,0.01), 1, 1],
	};

	particles.questSparkles = {
		
		texture : textures.sparkle,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.BoxZone(0,0,0,100, 100, 100),
		size : 20,
		size_tween : [1,0.1],
		part_max_age : .5,
		velocity : 50,
		gravity : -15,
		color : "#FFFFAA",	
		opacity: 1,
		wiggle : 3,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

	particles.teslaCoil = {
		
		texture : textures.electricSpark,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.SphereZone(0,0,0,10),
		size : 80,
		size_tween : [0.05, 1],
		part_max_age : .2,
		velocity : 0,
		gravity : 0,
		color : ["#AA66FF", "#FFFFFF"],	
		opacity: 1,
		wiggle : 3,
		rotation : new Proton.Span(0, Math.PI*2),
	};

	particles.bubblesFull = {
		texture : textures.bubble,
		blending : THREE.AdditiveBlending,
		rate : 0.1,
		count : 1,
		position : new Proton.BoxZone(0,0,0, 1000,1000,1000),
		size : 15,
		size_tween : [0.2,1],
		part_max_age : 5,
		velocity : 0,
		gravity : -1,
		color : ["#FFFFFF"],	
		opacity: [0,1,Proton.ease.easeFullBridge],
		wiggle : 15,
		//rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};
	particles.bubblesDense = {
		texture : textures.bubble,
		blending : THREE.AdditiveBlending,
		rate : 0.2,
		count : 1,
		position : new Proton.BoxZone(0,0,0, 10,10,10),
		size : 15,
		size_tween : [0.2,1],
		part_max_age : 3,
		velocity : 5,
		gravity : -2,
		color : ["#FFFFFF"],	
		opacity: [0,1,Proton.ease.easeFullBridge],
		wiggle : 25,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};
	particles.bubblesGreen = {
		texture : textures.bubble,
		blending : THREE.NormalBlending,
		rate : 0.05,
		count : 2,
		position : new Proton.SphereZone(0,0,0, 10),
		size : 2,
		size_tween : [1,1],
		part_max_age : 1.5,
		velocity : 7,
		gravity : -.25,
		color : ["#33AA33"],	
		opacity: 1,
		wiggle : 25,
		rotation : [new Proton.Span(-0.1,0.1), 1, 1],
	};

//
particles.quest_stars = {
	texture : textures.star,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,10),
	size : 8,
	size_tween : [0.001,1],
	part_max_age : 0.5,
	velocity : new Proton.Span(20,75),
	color : "#AABBFF",	
	opacity: 1,
};

particles.hitfx_levelup = {
	texture : textures.levelup,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 1,
	velocity : 0,
	color : "#FFFFFF",	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

// SPELL FX
particles.hitfx_sparks = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 2,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(50,100),
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_sparks_big = {
			
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(60,120),
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_sparks_big_yellow = {
			
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(60,120),
	color : ["#FFFFAA","#FFFFEE"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_sparks_big_blue = {
			
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(60,120),
	color : ["#AADDFF","#DDEEFF"],	
	opacity: 1,
	gravity:2,
};

particles.hitfx_punch_bones = {
	texture : textures.bone_shards,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 10,
	size_tween : [0.001,1],
	part_max_age : .5,
	velocity : new Proton.Span(15,20),
	color : ["#DDDDDD","#FFFFFF"],	
	opacity: 1,
	gravity:1,
	rotation : [0, Math.PI],
};
particles.hitfx_punch_dice = {
	texture : textures.dice,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [0.001,1,Proton.ease.easeFullBridge],
	part_max_age : .3,
	velocity : new Proton.Span(30,50),
	color : ["#FFAAFF","#FFFFFF"],	
	opacity: 1,
	gravity:1,
	rotation : [0, Math.PI],
};

particles.hitfx_sparkles_static = {
	texture : textures.sparkle,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 5,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(1,5),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.5),
	velocity_type : 0,
	gravity : -0.2,
	color : ["#FFFFEE","#FFFFFF"],	
	opacity: 1,
};

particles.hitfx_sparkles_static_pink = {
	texture : textures.sparkle,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 5,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(1,5),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.5),
	velocity_type : 0,
	gravity : -0.2,
	color : ["#FFAAFF","#FFFFFF"],	
	opacity: 1,
};

particles.hitfx_sparkles_static_arcane = {
	texture : textures.holyRune,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 50,50,50),
	size : new Proton.Span(5,10),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.5),
	velocity_type : 0,
	gravity : 0,
	color : ["#AA00AA","#FFAAFF"],	
	opacity: 1,
};

particles.hitfx_holy_runes = {
	texture : textures.holyRune,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.BoxZone(0,0,0, 30,30,30),
	size : new Proton.Span(5,10),
	part_max_age : new Proton.Span(1,3),
	velocity : 0,
	velocity_type : 0,
	gravity : 0,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: [1,0],
};

particles.hitfx_sparkles_static_orb = {
	texture : textures.swirlOrb,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 5,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(1,5),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.5),
	velocity_type : 0,
	gravity : -0.2,
	color : ["#FFFFEE","#FFFFFF"],	
	opacity: 1,
};


particles.hitfx_hearts = {
	texture : textures.heart,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 8,
	position : new Proton.BoxZone(0,0,0, 30,30,30),
	size : new Proton.Span(2,4),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,1.5),
	velocity : 0,
	velocity_type : 0,
	gravity : -1,
	rotation : [0,Math.PI*2],
	color : ["#FFAAAA","#FFEEEE"],	
	opacity: [1],
};

// Multiple small crosshairs
particles.hitfx_crosshairs_red = {
	texture : textures.crosshair,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.BoxZone(0,0,0, 30,30,30),
	size : new Proton.Span(8,10),
	part_max_age : new Proton.Span(3,5),
	velocity : 0,
	velocity_type : 0,
	gravity : 0,
	color : ["#FFAAAA","#FF9999"],	
	opacity: [1,0],
};

particles.hitfx_holy_runes_blue = {
	texture : textures.holyRune,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.BoxZone(0,0,0, 30,30,30),
	size : new Proton.Span(5,10),
	part_max_age : new Proton.Span(1,3),
	velocity : 0,
	velocity_type : 0,
	gravity : 0,
	color : ["#AADDFF","#FFDDFF"],	
	opacity: [1,0],
};

particles.hitfx_sparkles_static_big = {
			
	texture : textures.sparkle,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 10,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(2,10),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.5),
	velocity_type : 0,
	gravity : -0.2,
	color : ["#FFFFEE","#FFFFFF"],	
	opacity: 1,

};

particles.hitfx_sparks_zap = {
	
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,0),
	size : 1,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(50,100),
	color : ["#AADDFF","#FFFFFF"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_zap = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,0),
	size : 10,
	size_tween : [0.001,1],
	part_max_age : 0.2,
	velocity : new Proton.Span(10,50),
	color : ["#33AAFF","#FFFFFF"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI)
};

particles.hitfx_zap_line = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.LineZone(0,0,0,50,0,0),
	size : new Proton.Span(5,10),
	size_tween : [1,0],
	part_max_age : 1,
	velocity : new Proton.Span(0,5),
	color : ["#FFFFFF","#AAFFFF"],	
	opacity: 1,
	gravity:0,
	rotation : new Proton.Span(0,Math.PI),
};


particles.hitfx_zap_cling = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.LineZone(-10,-20,-10,10,20,10),
	size : new Proton.Span(5,10),
	size_tween : [1,0],
	part_max_age : 1,
	velocity : new Proton.Span(0,5),
	color : ["#FFFFFF","#AAFFFF"],	
	opacity: 1,
	gravity:0,
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_zap_spread = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,25),
	size : new Proton.Span(3,5),
	size_tween : [1,0],
	part_max_age : 0.3,
	velocity : new Proton.Span(0,5),
	color : ["#FFFFFF","#AAFFFF"],	
	opacity: 1,
	gravity:1,
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_sparks_zap_large = {
	
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,5),
	size : 4,
	size_tween : [1,0.001],
	part_max_age : 0.5,
	velocity : new Proton.Span(100,150),
	color : ["#AADDFF","#FFFFFF"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_zap_large = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,10),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.3,
	velocity : new Proton.Span(40,80),
	color : ["#33AAFF","#FFFFFF"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI)
};

particles.hitfx_burst_green_large_drops = {
	
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,5),
	size : 4,
	size_tween : [1,0.001],
	part_max_age : 0.5,
	velocity : new Proton.Span(200,300),
	color : ["#66FF66","#AAFFAA"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_burst_purple_large_drops = {
	
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,5),
	size : 4,
	size_tween : [1,0.001],
	part_max_age : 0.5,
	velocity : new Proton.Span(200,300),
	color : ["#6600FF","#CCAAFF"],	
	opacity: 1,
	gravity:2,
};
particles.hitfx_burst_green_large = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,10),
	size : 30,
	size_tween : [0.5,1],
	part_max_age : .5,
	velocity : new Proton.Span(80,120),
	color : ["#66FF66","#003300"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI)
};
particles.hitfx_burst_purple_large = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,10),
	size : 30,
	size_tween : [0.5,1],
	part_max_age : .5,
	velocity : new Proton.Span(80,120),
	color : ["#6600FF","#110033"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI)
};


particles.hitfx_burst_arcane_sparkles = {
	
	texture : textures.sparkle,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,5),
	size : 5,
	size_tween : [1,0.001],
	part_max_age : 1,
	velocity : new Proton.Span(200,400),
	color : ["#FF66FF","#FFAAFF"],	
	opacity: 1,
	gravity:0.5,
};
particles.hitfx_burst_arcane_runes = {
	texture : textures.holyRune,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,50),
	size : 10,
	size_tween : [1,0.05],
	part_max_age : .5,
	velocity : new Proton.Span(0,50),
	color : ["#FF66FF","#FFFFFF"],	
	opacity: 1,
	gravity:2
};

particles.hitfx_burst_fire = {
	texture : textures.flame,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,10),
	size : [30,10],
	size_tween : [1,0.05],
	part_max_age : .5,
	velocity : new Proton.Span(0,150),
	color : ["#FFFF66","#FFFFFF"],	
	rotation : [0, Math.PI*2],
	opacity: 1,
	gravity:2
};




particles.hitfx_claws = {
	texture : textures.clawMarks,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.BoxZone(0,0,0,0,0,0),
	
	size : 12,
	size_tween : [0.2,1,Proton.ease.easeFullSine],
	part_max_age : 0.5,
	velocity : 0,
	color : ["#660000","#660000"],	
	opacity: [1,0],
	//gravity:2,
	rotation : Math.PI/2+0.5,
	tick : function(emitter){

		if( !emitter._startpos ){
			emitter._startpos = {x:emitter.p.x, y:emitter.p.y}
		}
		let ang = -Math.PI/4-emitter.currentEmitTime*2,
			rad = 70;
		emitter.p.x = Math.cos(ang)*rad+emitter._startpos.x-rad*.6;
		emitter.p.y = Math.sin(ang)*rad+emitter._startpos.y+rad*.6;
		
	}
};


particles.hitfx_smite = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,4),
	size : 10,
	size_tween : [0.001,1,Proton.ease.easeFullSine],
	part_max_age : .5,
	velocity : 1,
	velocity_type : 10,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
	gravity:-0.5,
	tick : function(emitter){
		if( !emitter._startpos ){
			emitter._startpos = {x:emitter.p.x, y:emitter.p.y}
		}
		let ang = -Math.PI/4-emitter.currentEmitTime*15,
			rad = 10;
		emitter.p.x = Math.cos(ang)*rad+emitter._startpos.x;
		emitter.p.y = Math.sin(ang)*rad+emitter._startpos.y+rad;
	}
};

particles.hitfx_repentance = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,4),
	size : 10,
	size_tween : [0.001,1,Proton.ease.easeFullSine],
	part_max_age : .5,
	velocity : 1,
	velocity_type : 10,
	color : ["#FFCCAA","#FFFFCC"],	
	opacity: 1,
	gravity:-0.5,
	tick : function(emitter){
		if( !emitter._startpos ){
			emitter._startpos = {x:emitter.p.x, y:emitter.p.y}
		}
		emitter.p.y = emitter._startpos.y+emitter.currentEmitTime*15;
	}
};

particles.hitfx_bite = {
	texture : textures.fangs,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.5,
	velocity : 0,
	color : ["#660000","#FFAAAA"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_shield = {
	texture : textures.shield,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#AADDFF","#DDEEFF"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};
particles.hitfx_grab = {
	texture : textures.grab,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#FFFFAA","#FFFFEE"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_eye = {
	texture : textures.eye,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#AADDFF","#DDEEFF"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};



particles.hitfx_throw_rock_sparks = {
	texture : textures.glowSphere,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 2,
	size_tween : [1,0],
	part_max_age : 0.5,
	velocity : new Proton.Span(10,20),
	color : ["#332211","#221100"],	
	opacity: 1,
	gravity:4,
};
particles.hitfx_throw_rock_center = {
	texture : textures.smoke,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [1,0],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#555555","#221100"],	
	opacity: 1,
	gravity:0.5,
};

particles.hitfx_throw_rock_impact_sparks = {
	texture : textures.glowSphere,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,0),
	size : 5,
	size_tween : [1,0],
	part_max_age : 0.5,
	velocity : new Proton.Span(40,50),
	color : ["#555555","#221100"],	
	opacity: 1,
	gravity:3,
};

particles.hitfx_throw_shoe_center = {
	texture : textures.shoe,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 15,
	size_tween : [1,0],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#FFAAFF","#FFAAFF"],	
	opacity: 1,
	gravity:0.5,
};


particles.hitfx_worm_bolt_worms = {
	texture : textures.worms,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : new Proton.Span(5,15),
	size_tween : [1,0],
	part_max_age : 1,
	velocity : new Proton.Span(0,30),
	color : ["#999999","#000000"],	
	opacity: 1,
	gravity:5,
	rotation : [0,Math.PI],
};

particles.hitfx_worm_bolt_hit = {
	texture : textures.worms,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,5),
	size : new Proton.Span(10,30),
	size_tween : [1,0.1],
	part_max_age : 1,
	velocity : new Proton.Span(50,100),
	gravity : 3,
	color : '#553300',	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,50],
	rotation : [new Proton.Span(-Math.PI, 0),new Proton.Span(0,Math.PI)],
};

particles.hitfx_poison_pink = {
	texture : textures.poison,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#FFDDFF","#FFDDFF"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_lock_yellow = {
	texture : textures.lock,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#FFFFAA","#FFFFEE"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_kiss = {
	texture : textures.kiss,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#FF6666","#FFEEEE"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_punch = {
	texture : textures.explosion,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,1),
	size : 30,
	size_tween : [0.001,1],
	part_max_age : 0.15,
	velocity : new Proton.Span(0,1),
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: [0,1],
	gravity:2,
};

particles.hitfx_sparks_smaller = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,0),
	size : 1.5,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(40,80),
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
	gravity:2,
};

particles.hitfx_punch_smaller = {
	texture : textures.explosion,
	blending : THREE.AdditiveBlending,
	rate : 0.025,
	count : 1,
	position : new Proton.SphereZone(0,0,0,1),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.15,
	velocity : new Proton.Span(0,1),
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: [0,1],
	gravity:2,
};

particles.hitfx_splat = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,2),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#FFFFFF","#EEFFEE"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};

particles.hitfx_glowing_ooze_white_splat = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 5,
	position : new Proton.SphereZone(0,0,0,20),
	size : 10,
	size_tween : [0.001,1],
	part_max_age : 1,
	velocity : new Proton.Span(0,1),
	color : ["#FFFFFF","#FFFFFF"],	
	opacity: [0.5,0],
	gravity:0.5,
	rotation : new Proton.Span(0,Math.PI*2)
};


particles.hitfx_splat_green = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,10),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#AAFFAA","#33AA33"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};

particles.hitfx_splat_purple = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 6,
	position : new Proton.SphereZone(0,0,0,20),
	size : 20,
	size_tween : [.5,0.001],
	part_max_age : 0.6,
	velocity : new Proton.Span(20,50),
	color : ["#DDAAFF","#330066"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};

particles.hitfx_splat_sparks = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 4,
	position : new Proton.SphereZone(0,0,0,1),
	size : 10,
	size_tween : [1,0.001],
	part_max_age : 0.4,
	velocity : new Proton.Span(50,100),
	gravity : 2,
	color : ['#EEFFEE', '#339933'],	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_crumbs = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,12),
	size : new Proton.Span(1,3),
	size_tween : [1,0.1],
	part_max_age : 0.6,
	velocity : new Proton.Span(0,30),
	gravity : 2,
	color : '#553300',	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : [0,new Proton.Span(0,Math.PI)],
};

particles.hitfx_debris = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,5),
	size : new Proton.Span(3,5),
	size_tween : [1,0.1],
	part_max_age : 1,
	velocity : new Proton.Span(50,100),
	gravity : 1,
	color : '#553300',	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : [0,new Proton.Span(0,Math.PI)],
};
particles.hitfx_debris_radius = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,20),
	size : new Proton.Span(3,5),
	size_tween : [1,0.1],
	part_max_age : 1,
	velocity : new Proton.Span(50,100),
	gravity : 1,
	color : '#553300',	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : [0,new Proton.Span(0,Math.PI)],
};

particles.hitfx_coins = {
	texture : textures.coin,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.SphereZone(0,0,0,20),
	size : new Proton.Span(3,5),
	//size_tween : [1,0.1],
	part_max_age : 0.5,
	velocity : new Proton.Span(50,100),
	gravity : 5,
	color : '#FFFF00',	
	opacity: [1,0],
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : [0,new Proton.Span(0,Math.PI)],
};

particles.hitfx_earth_shield = {
	texture : textures.rock,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.SphereZone(0,0,0,15),
	size : new Proton.Span(20,50),
	size_tween : [1, 0.01, Proton.ease.easeFullStairStep],
	part_max_age : 1,
	velocity : 0.2,
	gravity : 0,
	color : ['#553300','#333333'],	
	opacity: 1,
	rotation : [0,0,new Proton.Span(0,1)],
};


particles.hitfx_splat_red = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,10),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#FFAAAA","#AA3333"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};
particles.hitfx_splat_sparks_red = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 4,
	position : new Proton.SphereZone(0,0,0,1),
	size : 10,
	size_tween : [1,0.001],
	part_max_age : 0.4,
	velocity : new Proton.Span(50,100),
	gravity : 2,
	color : ['#FFEEEE', '#993333'],	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};
particles.hitfx_splat_sparks_dark_green = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 4,
	position : new Proton.SphereZone(0,0,0,1),
	size : 10,
	size_tween : [1,0.001],
	part_max_age : 0.4,
	velocity : new Proton.Span(50,100),
	gravity : 2,
	color : ['#336633', '#003300'],	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};


particles.hitfx_healing = {
	texture : textures.plus,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 3,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(3,6),
	size_tween : [0.001,1,Proton.ease.easeFullSine],
	part_max_age : new Proton.Span(1,1.5),
	velocity : 3,
	velocity_dir : [new Proton.Span(-1,1),new Proton.Span(-1,1),new Proton.Span(-1,1)],
	//velocity_type : 0,
	//gravity : -0.1,
	color : "#FFFFFF",	
	opacity: 1
};

particles.hitfx_healing_yellow = {
	texture : textures.plus,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(3,6),
	size_tween : [0.001,1,Proton.ease.easeFullSine],
	part_max_age : new Proton.Span(1,1.5),
	velocity : 3,
	velocity_dir : [new Proton.Span(-1,1),new Proton.Span(-1,1),new Proton.Span(-1,1)],
	//velocity_type : 0,
	//gravity : -0.1,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
};

particles.hitfx_healing_green = {
	texture : textures.plus,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 25,25,25),
	size : new Proton.Span(3,6),
	size_tween : [0.001,1,Proton.ease.easeFullSine],
	part_max_age : new Proton.Span(1,1.5),
	velocity : 3,
	velocity_dir : [new Proton.Span(-1,1),new Proton.Span(-1,1),new Proton.Span(-1,1)],
	//velocity_type : 0,
	//gravity : -0.1,
	color : ["#99FF99","#DDFFDD"],	
	opacity: 1,
};


particles.hitfx_healing_yellow_pillar = {
	texture : textures.sparkle,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,20),
	size : new Proton.Span(10,20),
	size_tween : [1,0.01],
	part_max_age : new Proton.Span(1,1.5),
	velocity : 3,
	velocity_dir : [0,0,3],
	//velocity_type : 0,
	gravity : -2,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: 1,
};


particles.hitfx_healingSurge = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,1),
	size : 40,
	size_tween : [0.001,1],
	part_max_age : 0.4,
	velocity : new Proton.Span(30,50),
	gravity : 2,
	color : '#AADDFF',	
	opacity: [1,0],
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};
particles.hitfx_healingSurge_dark = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,1),
	size : 40,
	size_tween : [0.001,1],
	part_max_age : 0.4,
	velocity : new Proton.Span(30,50),
	gravity : 2,
	color : '#003300',
	opacity: [1,0],
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};


particles.hitfx_fountain = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,2),
	size : new Proton.Span(10, 20),
	size_tween : [1,0.5],
	part_max_age : 0.6,
	velocity : new Proton.Span(0,30),
	color : ['#AADDFF'],	
	opacity: [1,0,Proton.ease.easeInCirc],
	force : [
		[0,-60,0, Proton.ease.easeInCirc],
		[0,10,0,Proton.ease.easeOutCirc]
	],
	//wiggle : [0,10],
	rotation : [new Proton.Span(0,0.5), 1, 1],
};


particles.hitfx_splat_blue = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.SphereZone(0,0,0,10),
	size : 20,
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(0,1),
	color : ["#AAAAFF","#3333AA"],	
	opacity: [0,1],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};
particles.hitfx_splat_sparks_blue = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 4,
	position : new Proton.SphereZone(0,0,0,1),
	size : 10,
	size_tween : [1,0.001],
	part_max_age : 0.4,
	velocity : new Proton.Span(50,100),
	gravity : 2,
	color : ['#EEEEFF', '#333399'],	
	opacity: 1,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_spark_line = {
	texture : textures.electricSpark,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 30,
	position : new Proton.LineZone(0,0,0,0,0,0),
	size : new Proton.Span(20,30),
	size_tween : [1,0.1],
	part_max_age : new Proton.Span(.5,1),
	velocity : new Proton.Span(0,2),
	velocity_type : 0,
	gravity : 0,
	color : ["#FF33FF", "#FFFFFF"],	
	opacity: [0,1,Proton.ease.easeFullSine],
	rotation : new Proton.Span(0,Math.PI),
	lineTargeted : true,
};
particles.hitfx_mist_line = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 30,
	position : new Proton.LineZone(0,0,0,0,0,0),
	size : new Proton.Span(20,30),
	size_tween : [1,0.1],
	part_max_age : new Proton.Span(.5,1),
	velocity : new Proton.Span(0,2),
	velocity_type : 0,
	gravity : 0,
	color : ["#FF33FF", "#FFFFFF"],	
	opacity: [0,1,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
	lineTargeted : true,
};
particles.hitfx_mist = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(50,100),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : "#FFFFFF",	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};
particles.hitfx_mist_blue = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(50,100),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : "#AAEEFF",	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};
particles.hitfx_mist_green = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(50,100),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,3),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : ["#99FF99", "#AAFFAA"],	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};
particles.hitfx_mist_green_target = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.BoxZone(0,0,0, 4,4,4),
	size : new Proton.Span(20,30),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : ["#AAFFAA","#DDFFFF"],	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};
particles.hitfx_mist_pink = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(20,75),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : ["#FFAAFF","#FFFFFF"],	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};

particles.hitfx_mist_yellow = {
	
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.BoxZone(0,0,0, 20,20,20),
	size : new Proton.Span(20,75),
	size_tween : [1,0.001],
	part_max_age : new Proton.Span(1,2),
	velocity : new Proton.Span(0,0.75),
	velocity_type : 0,
	gravity : -0.1,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: [0,.5,Proton.ease.easeFullSine],
	rotation : [0,Math.PI],
};


particles.hitfx_splat_discrete = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,1),
	size : new Proton.Span(1,3),
	size_tween : [0.001,1],
	part_max_age : 0.25,
	velocity : new Proton.Span(1,3),
	color : "#FFFFFF",	
	opacity: [0,.25, Proton.ease.easeFullBridge],
	gravity:2,
	rotation : new Proton.Span(0,Math.PI*2)
};


particles.hitfx_splat_sparks_discrete = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,2),
	size : 3,
	size_tween : [1,0.001],
	part_max_age : 0.4,
	velocity : new Proton.Span(25,50),
	gravity : 2,
	color : ['#FFFFFF', '#EEFFEE'],	
	opacity: 0.25,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_splat_sparks_discreter = {
	texture : textures.glowSphere,
	blending : THREE.AdditiveBlending,
	rate : 0.025,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : 2,
	size_tween : [1,0.001],
	part_max_age : 0.6,
	velocity : new Proton.Span(25,50),
	gravity : 3,
	color : ['#FFFFFF', '#EEFFEE'],	
	opacity: 0.25,
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_condensation = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.SphereZone(0,0,0,20),
	size : new Proton.Span(2,7),
	//size_tween : [1,0.001],
	part_max_age : 2,
	velocity : new Proton.Span(0,0.1),
	gravity : -0.1,
	color : ['#00AAFF', '#AACCFF'],	
	opacity: [1,0],
	wiggle : [0,10],
	rotation : new Proton.Span(0,Math.PI),
};

particles.hitfx_riptide = {
	texture : textures.glowRing,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 300,
	size_tween : [0,1],
	part_max_age : 1.5,
	velocity : 0,
	color : ["#3399FF","#FFFFFF"],	
	opacity: [0,0.25,Proton.ease.easeFullSine],
};

particles.hitfx_circle_of_harmony = {
	texture : textures.glowRing,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [0,1, Proton.ease.easeOutCirc],
	part_max_age : 1.5,
	velocity : 0,
	color : ["#33FF33","#AAFFAA"],	
	opacity: [0,1,Proton.ease.easeFullSine],
};

particles.hitfx_roots = {
	texture : textures.roots,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 3,
	position : new Proton.SphereZone(0,0,0,20),
	size : new Proton.Span(20,30),
	size_tween : [0,1, Proton.ease.easeOutCirc],
	part_max_age : 1,
	//velocity : new Proton.Span(0,0.1),
	gravity : 0,
	color : ['#FFFFFF', '#FFFFFF'],	
	opacity: [1,0, Proton.ease.easeInCirc],
	rotation : new Proton.Span(0,Math.PI),
};


particles.hitfx_tentacle_coat = {
	texture : textures.tentacles,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 1,
	position : new Proton.BoxZone(0,0,0,20,20,0),
	size : new Proton.Span(5,15),
	size_tween : [1,1.1],
	part_max_age : 3,
	//velocity : new Proton.Span(0,0.1),
	gravity : 0,
	color : ['#221133', '#110022'],	
	opacity: [.5,0, Proton.ease.easeInCirc],
	rotation : new Proton.Span(0,Math.PI),
};




particles.hitfx_chains = {
	texture : textures.chains,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.BoxZone(0,0,0,20,20,0),
	size : new Proton.Span(5,15),
	size_tween : [1,1.1],
	part_max_age : 1.5,
	//velocity : new Proton.Span(0,0.1),
	gravity : 0,
	color : ['#FFFFAA', '#FFFFEE'],	
	opacity: [1,0, Proton.ease.easeInCirc],
	rotation : new Proton.Span(0,Math.PI),
};


particles.hitfx_insect_dots = {
	texture : textures.glowSphere,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 5,
	position : new Proton.SphereZone(0,0,0,3),
	size : new Proton.Span(2,5),
	size_tween : [1,0.01, Proton.ease.easeOutCirc],
	part_max_age : 4,
	velocity : new Proton.Span(-15,15),
	gravity : 0,
	color : ['#111100', '#000000'],	
	opacity: 1,
	rotation : new Proton.Span(0,Math.PI),
};
particles.hitfx_skittering_swarm = {
	texture : textures.skitteringInsect,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.SphereZone(0,0,0,3),
	size : new Proton.Span(4,8),
	size_tween : [1,0.01, Proton.ease.easeOutCirc],
	part_max_age : 3,
	velocity : new Proton.Span(-15,15),
	gravity : 0,
	color : ['#553300', '#000000'],	
	opacity: 1,
	rotation : [5,0,0],
};
particles.hitfx_stinging_swarm = {
	texture : textures.stingingInsect,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.SphereZone(0,0,0,3),
	size : new Proton.Span(4,8),
	size_tween : [1,0.01, Proton.ease.easeOutCirc],
	part_max_age : 3,
	velocity : new Proton.Span(-15,15),
	gravity : 0,
	color : ['#553300', '#000000'],	
	opacity: 1,
	rotation : [5,0,0],
};

particles.hitfx_bone_shards = {
	texture : textures.bone_shards,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,3),
	size : new Proton.Span(10,20),
	size_tween : [1,.01, Proton.ease.easeOutCirc],
	part_max_age : .5,
	velocity : new Proton.Span(-15,15),
	gravity : 0,
	color : ['#DDDDDD', '#FFFFFF'],	
	opacity: 1,
	rotation : [5,0,0],
};
particles.hitfx_bone_shards_drop = {
	texture : textures.bone_shards,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,30),
	size : new Proton.Span(10,20),
	size_tween : [1,.01, Proton.ease.easeOutCirc],
	part_max_age : 2,
	velocity : 0,
	gravity : 2,
	color : ['#DDDDDD', '#FFFFFF'],	
	opacity: 1,
	rotation : [5,0,0],
};
particles.hitfx_bone_shards_big = {
	texture : textures.bone_shards,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,10),
	size : new Proton.Span(10,15),
	size_tween : [0.1,1, Proton.ease.easeOutCirc],
	part_max_age : .25,
	velocity : new Proton.Span(-200,200),
	gravity : 5,
	color : ['#666666', '#AAAAAA'],	
	opacity: 1,
	rotation : [5,0,0],
};

particles.hitfx_insect_dots_impact = {
	texture : textures.glowSphere,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 5,
	position : new Proton.SphereZone(0,0,0,15),
	size : new Proton.Span(2,5),
	size_tween : [1,0.01, Proton.ease.easeOutCirc],
	part_max_age : 4,
	velocity : new Proton.Span(-15,15),
	gravity : 0,
	color : ['#111100', '#000000'],	
	opacity: 1,
	rotation : new Proton.Span(0,Math.PI),
};
particles.hitfx_skittering_swarm_impact = {
	texture : textures.skitteringInsect,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.SphereZone(0,0,0,15),
	size : new Proton.Span(4,8),
	size_tween : [1,0.01, Proton.ease.easeOutCirc],
	part_max_age : 3,
	velocity : new Proton.Span(-5,5),
	gravity : 0,
	color : ['#553300', '#000000'],	
	opacity: 1,
	rotation : [5,0,0],
};

particles.hitfx_stinging_swarm_impact = {
	texture : textures.stingingInsect,
	blending : THREE.NormalBlending,
	rate : 0.05,
	count : 2,
	position : new Proton.SphereZone(0,0,0,15),
	size : new Proton.Span(1,6),
	size_tween : [0.01, 1, Proton.ease.easeFullBridge],
	part_max_age : 0.25,
	velocity : new Proton.Span(-5,5),
	gravity : 0,
	color : ['#553300', '#000000'],	
	opacity: 1,
	rotation : [5,0,0],
};



particles.hitfx_snow_sparks = {
			
	texture : textures.snowflakes,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,5),
	size : 15,
	size_tween : [1,0.05],
	part_max_age : 0.75,
	velocity : 5,
	gravity : 1,
	color : ['#FFFFFF', '#AAAAFF'],	
	opacity: [1,0],
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,10],
};

particles.hitfx_snow_sparks_impact = {
	texture : textures.snowflakes,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,1),
	size : 20,
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : new Proton.Span(50,100),
	gravity : 1,
	color : ['#FFFFFF', '#AAAAFF'],	
	opacity: [1,0],
	rotation : [new Proton.Span(-1,1), 1,1],
	wiggle : new Proton.Span(0,10),
};


particles.hitfx_snow_sparks_small = {
			
	texture : textures.snowflakes,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,2.5),
	size : 7.5,
	size_tween : [1,0.05],
	part_max_age : 0.75,
	velocity : 5,
	gravity : 1,
	color : ['#FFFFFF', '#AAAAFF'],	
	opacity: [1,0],
	rotation : [new Proton.Span(-0.5,0.5), 1,1],
	wiggle : [0,5],
};

particles.hitfx_snow_sparks_impact_small = {
	texture : textures.snowflakes,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 10,
	position : new Proton.SphereZone(0,0,0,1),
	size : 10,
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : new Proton.Span(25,50),
	gravity : 1,
	color : ['#FFFFFF', '#AAAAFF'],	
	opacity: [1,0],
	rotation : [new Proton.Span(-1,1), 1,1],
	wiggle : new Proton.Span(0,5),
};

particles.hitfx_sludge_siphon = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 5,
	position : new Proton.SphereZone(0,0,0,5),
	size : [15,30],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : -5,
	gravity : 2,
	color : ['#330066', '#330033'],	
	opacity: [0,1, Proton.ease.easeFullBridge],
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : [0,10]
};


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

particles.hitfx_flame_bolt = {
	texture : textures.flame,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : [5,15],
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : 5,
	gravity : -2,
	color : ['#FFFF99', '#FFFFFF'],	
	opacity: [1,0],
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : [0,10],
};



particles.hitfx_spit = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : [7,15],
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : 2.5,
	gravity : 1,
	color : ['#DDFFDD', '#FFFFFF'],	
	opacity: 0.25,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : [0,5],
};
particles.hitfx_spit_drops = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,1),
	size : [15,1,Proton.ease.easeInBack],
	size_tween : [1,0.05],
	part_max_age : 0.75,
	velocity : 2.5,
	gravity : 1,
	color : ['#DDFFDD', '#AAFFAA'],	
	opacity: 0.5,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : 10,
};
particles.hitfx_spit_impact = {
	texture : textures.splat,
	blending : THREE.NormalBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,0),
	size : [15,30],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : new Proton.Span(20, 40),
	gravity:1,
	color : ['#AAFFAA', '#DDFFDD'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : 10
};
particles.hitfx_spit_impact_residue = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 1,
	position : new Proton.SphereZone(0,0,0,30),
	size : [5,10],
	part_max_age : [2,3],
	velocity : 0,
	gravity:0.025,
	color : ['#DDFFDD', '#FFFFFF'],	
	opacity: [0.5,0],
	rotation : [new Proton.Span(0,Math.PI)],
};



particles.hitfx_sludge_bolt_white = {
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
	color : ['#FFFFFF', '#FFFFEE'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : [0,10],
};
particles.hitfx_sludge_bolt_impact_white = {
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
	color : ['#FFFFFF', '#FFFFEE'],	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
	wiggle : 10
};



particles.hitfx_sludge_bolt_proc = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [1,15],
	part_max_age : 2,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,0.15),
	color : ['#6633AA', '#552299'],	
	opacity: [1,0],
	rotation : new Proton.Span(0,Math.PI*2),
	wiggle : 10
};

particles.hitfx_sludge_bolt_black = {
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
	color : "#000000",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],

};
particles.hitfx_sludge_bolt_impact_black = {
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
	color : "#000000",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
};
particles.hitfx_sludge_bolt_proc_black = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [1,15],
	part_max_age : 2,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,0.15),
	color : "#000000",	
	opacity: [1,0],
	rotation : new Proton.Span(0,Math.PI*2),
};

particles.hitfx_sludge_bolt_blue = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : [5,10],
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : 2,
	gravity : 2,
	color : "#AADDFF",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],

};
particles.hitfx_sludge_bolt_impact_blue = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,0),
	size : [10,15],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : new Proton.Span(20, 40),
	gravity:2,
	color : "#AADDFF",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
};


particles.hitfx_sludge_bolt_green = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,4),
	size : [5,10],
	size_tween : [1,0.05],
	part_max_age : 0.5,
	velocity : 2,
	gravity : 2,
	color : "#AAFFAA",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],

};
particles.hitfx_sludge_bolt_impact_green = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 2,
	position : new Proton.SphereZone(0,0,0,0),
	size : [10,15],
	size_tween : [1,0.05],
	part_max_age : 1,
	velocity : new Proton.Span(20, 40),
	gravity:2,
	color : "#AAFFAA",	
	opacity: 1,
	rotation : [new Proton.Span(0,Math.PI), new Proton.Span(-Math.PI, Math.PI)],
};

particles.hitfx_wind = {
	texture : textures.smoke,
	blending : THREE.AdditiveBlending,
	rate : 0.05,
	count : 3,
	position : new Proton.SphereZone(0,0,0,15),
	size : [30,0],
	part_max_age : .25,
	velocity : new Proton.Span(0, 100),
	gravity: new Proton.Span(-1,2),
	color : "#FFFFFF",	
	opacity: [0,0.5, Proton.ease.easeFullBridge],
	rotation : [0,Math.PI*2],
};

particles.hitfx_hex_armor = {
	texture : textures.smoke,
	blending : THREE.AdditiveBlending,
	rate : 0.025,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [5,20],
	part_max_age : 1,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,1),
	color : "#551188",	
	opacity: [0,0.5, Proton.ease.easeFullBridge],
	rotation : [0,new Proton.Span(0,Math.PI*2)],
};
particles.hitfx_hex_armor_beam = {
	texture : textures.smoke,
	blending : THREE.AdditiveBlending,
	rate : 0.025,
	count : 3,
	position : new Proton.BoxZone(0,0,0,10,10,10),
	size : [5,20],
	part_max_age : 1,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,1),
	color : "#551188",	
	opacity: [0,0.5, Proton.ease.easeFullBridge],
	rotation : [0,new Proton.Span(0,Math.PI*2)],
};

particles.hitfx_glowing_ooze = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.025,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [1,5],
	part_max_age : 1,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,0.15),
	color : "#AADDFF",	
	opacity: [0,1, Proton.ease.easeFullBridge],
	rotation : [0,new Proton.Span(0,Math.PI*2)],
};

particles.hitfx_glowing_ooze_green = {
	texture : textures.splat,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [1,25],
	size_tween : [0.01, 1],
	part_max_age : 1,
	velocity : new Proton.Span(0, 1),
	gravity: new Proton.Span(0,0.15),
	color : "#AAFFAA",	
	opacity: [1,0],
	rotation : [0,new Proton.Span(0,Math.PI*2)],
};

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

particles.hitfx_bubbleShield = {
			
	texture : textures.swirlOrb,
	blending : THREE.AdditiveBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.SphereZone(0,0,0,0),
	size : 40,
	size_tween : [1,1.05],
	part_max_age : .5,
	velocity : 0,
	velocity_dir : new Proton.Vector3D(0, -1, 0),
	velocity_type : 0,
	color : ['#33FFFF', '#DDEEFF'],	
	opacity: [1,0],
	rotation_start : new Proton.Span(0,Math.PI),
	rotation_speed : new Proton.Span(0,Math.PI),

};
particles.hitfx_bubbleShieldMassive = {
			
	texture : textures.swirlOrb,
	blending : THREE.AdditiveBlending,
	rate : 0.01,
	count : 4,
	position : new Proton.LineZone(0,-200,0,0,200,0),
	size : 40,
	size_tween : [1,1.05],
	part_max_age : .5,
	velocity : 0,
	velocity_dir : new Proton.Vector3D(0, -1, 0),
	velocity_type : 0,
	color : ['#33FFFF', '#DDEEFF'],	
	opacity: [0.25,0],
	rotation_start : new Proton.Span(0,Math.PI),
	rotation_speed : new Proton.Span(0,Math.PI),

};



particles.hitfx_dark_star = {
	texture : textures.cursedStar,
	blending : THREE.NormalBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#110033","#000000"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};

particles.hitfx_cowl = {
	texture : textures.cowl,
	blending : THREE.NormalBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [0,1, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#110033","#000000"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
};


particles.hitfx_yin_yang = {
	texture : textures.yinYang,
	blending : THREE.NormalBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [1,0, Proton.ease.easeFullStairStep],
	part_max_age : 0.75,
	velocity : 0,
	color : ["#AAFFDD","#AAFFDD"],	
	opacity: [0,1,Proton.ease.easeFullBridge],
	rotation : [new Proton.Span(-.1,.1), true, true],
};


particles.hitfx_pulse = {
	texture : textures.pulse,
	blending : THREE.NormalBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [0,1],
	part_max_age : 1,
	velocity : 0,
	color : ["#FFFFFF","#DDEEFF"],	
	opacity: [1,0,Proton.ease.easeInCirc],
};
particles.hitfx_vibration = {
	texture : textures.pulse,
	blending : THREE.AdditiveBlending,
	rate : 0.02,
	count : 1,
	position : new Proton.PointZone(),
	size : 50,
	size_tween : [0,1],
	part_max_age : .2,
	velocity : 0,
	color : ["#FFFFFF","#FFFFFF"],	
	opacity: [1,0,Proton.ease.easeInCirc],
};

particles.hitfx_healing_pulse = {
	texture : textures.glowRing,
	blending : THREE.NormalBlending,
	rate : 0.1,
	count : 1,
	position : new Proton.PointZone(),
	size : 100,
	size_tween : [0.2,1],
	part_max_age : 0.5,
	velocity : 0,
	color : ["#FFFFAA","#FFFFFF"],	
	opacity: [1,0,Proton.ease.easeInCirc],
};


particles.hitfx_smoke = {
	texture : textures.smoke,
	blending : THREE.NormalBlending,
	rate : 0.025,
	count : 3,
	position : new Proton.BoxZone(0,0,0,20,40,20),
	size : [5,40],
	part_max_age : 1,
	velocity : new Proton.Span(0, 10),
	gravity: -1,
	color : "#666666",	
	opacity: [0,0.5, Proton.ease.easeFullBridge],
	rotation : [0,new Proton.Span(0,Math.PI*2)],
};

// Accepts an overrides object with params that should override the base
particles.get = function(id, mesh, overrides, startPos, endPos){

	if( !this[id] )
		return false;

	let p = {};
	// Make a shallow clone first
	for( let i in this[id] )
		p[i] = this[id][i];

	if( typeof overrides === 'object' ){

		let allowedOverrides = [
			'color', 'size', 'rotation', 'opacity', 'blending', 'gravity', 'velocity', 'size_tween', 'part_max_age'
		];
		for( let override of allowedOverrides ){

			const data = overrides[override];
			if( data ){
				p[override] = data;
			
				if( override === 'size_tween'){
					
					const d = toArray(data).slice();
					if( typeof d[2] === "string" ){
						const fn = Proton.ease[d[2]];
						if( typeof fn === "function" )
							d[2] = fn;
					}
					p[override] = d;

				}
				else if( override === 'part_max_age' && Array.isArray(data) )
					p[override] = new Proton.Span(...data);
					
			}
			// Note: Can't do spans right now. Might wanna figure out how to do them.

		}

	}


	if( p._emitters ){
		console.error("Missing conversion for", id);
		return new Proton.Emitter(undefined, mesh);
	}
	const emitter = new Proton.Emitter(undefined, mesh);
	emitter.rate = new Proton.Rate(parseInt(p.count) || 1, +p.rate || 0.1);
	emitter.addInitialize(new Proton.Mass(1));

	if( p.part_max_age ){
		emitter.addInitialize(new Proton.Life(p.part_max_age));
	}

	if( p.texture ){
		let texture = p.texture;
		if( p.blending ){

			const label = 'blend_'+p.blending;
			if( !texture.userData[label] ){
				
				texture.userData[label] = texture.clone();
				texture.userData[label].material = texture.userData[label].material.clone();
				texture.material.blending = p.blending;

			}

			texture = texture.userData[label];

		}
		emitter.addInitialize(new Proton.Body(texture));
	}
	
	if( p.position ){
		
		const pos = new Proton.Position(p.position);
		if( p.lineTargeted ){
			
			const targ = new THREE.Vector3();
			targ.copy(endPos);
			targ.sub(startPos);
			pos.zones[0].x2 = targ.x;
			pos.zones[0].y2 = targ.y;
			
		}

		emitter.addInitialize(pos);

	}
	
	if( p.size ){
		if( !Array.isArray(p.size) )
			p.size = [p.size];
		emitter.addInitialize(new Proton.Radius(p.size[0], p.size[1], p.size[2]));
	}
	
	if( p.velocity ){
		let dir = p.velocity_dir || new Proton.Vector3D(0,1,0);
		if( Array.isArray(dir) )
			dir = new Proton.Vector3D(dir[0], dir[1], dir[2]);
		emitter.addInitialize(new Proton.V(p.velocity, dir, p.velocity_type || 360));
	}

	if( p.force ){
		let forces = p.force;
		if( !Array.isArray(forces[0]) )
			forces = [forces];
		for( let force of forces ){
			const f = new Proton.Force(force[0], force[1], force[2], undefined, force[3]);
			emitter.addBehaviour(f);
		}
	}
	
	if( p.gravity ){
		emitter.addBehaviour(new Proton.Gravity(p.gravity));
	}
	

	if( p.color ){
		
		const color = toArray(p.color);
		const behavior = new Proton.Color(color[0], color[1], undefined, color[2]);
		emitter.addBehaviour(behavior);
	}
	
	//addBehaviour
	if( p.opacity ){

		const opacity = toArray(p.opacity);
		emitter.addBehaviour(new Proton.Alpha(opacity[0], opacity[1], undefined, opacity[2]));

	}
	
	if( p.size_tween ){
		emitter.addBehaviour(new Proton.Scale(p.size_tween[0], p.size_tween[1], undefined, p.size_tween[2]));
	}

	if( p.rotation ){
		if( !Array.isArray(p.rotation) )
			p.rotation = [p.rotation];
		// 1 value = SET
		// 2 values = Tween from A to B
		// 3 values = additive on A. The other 2 can be whatever, just not undefined
		emitter.addBehaviour(new Proton.Rotate(p.rotation[0], p.rotation[1], p.rotation[2]));	//
	}

	if( p.tick )
		emitter._tick = p.tick;
	

	/* Wiggle causes the particles to self destruct early some times, need to look into it
	if( p.wiggle )
		emitter.addBehaviour(new Proton.RandomDrift(p.wiggle, p.wiggle, p.wiggle, 0.05));
	*/

	emitter.emit();
	return emitter;



};

export default particles;
