const particles = {};
import * as THREE from '../ext/THREE.js';
import Proton from '../ext/three.proton.min.js';
import SPE from '../ext/SPE.min.js';
SPE.valueOverLifetimeLength = 4;

const loader = new THREE.TextureLoader();
const textures = {
	candleFlame : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/candleflame.png')})),
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
	pulse : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/soundpulse.png')})),
	glowRing : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/glow_ring.png')})),
	holyRune : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/holy_rune.png')})),
	rock : new THREE.Sprite(new THREE.SpriteMaterial({transparent:true, color:0xFFFFFF, map:loader.load('/media/textures/particles/rock.png')})),
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

particles.get = function(id, mesh, debug = false){

	const p = this[id];
	if( p ){

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
