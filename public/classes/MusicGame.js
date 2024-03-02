import * as THREE from "../ext/THREE.js";
import { GLTFLoader } from "../ext/GLTFLoader.js";
import Stats from '../ext/stats.module.js';
//import { OrbitControls } from "../ext/OrbitControls.js";
/*
	Visuals:
	- Nut bar should glow when filled
	- Nut should be animated when active
	- Animate text on streak display
	- Horizontal bars based on BPM
	- Volumetric hit detector with particles
	- Note nubs should move
	- Long notes bar
	- Score display (multiply by 100)
	- Make the scroll mesh shorter
	- Show key bindings

	Gameplay:
	- Load a chart asset
	- Start/stop button for testing
	- Bind keys
	- 

*/


export default class MusicGame{

	static loader = new GLTFLoader();
	static textureLoader = new THREE.TextureLoader();
	scene = null;
	camera = null;
	renderer = null;
	ambientLight = null;
	directionalLight = null;
	axesHelper = null;

	canvas_nut_bar = null;
	canvas_streak_bar = null;
	canvas_streak_mul = null;

	rendering = false;

	models = {};
	materials = {};


	// Gameplay vars
	score = 0;
	misses = 0;
	strikes = 0;
	nut = 1000; // A full nut block grants 400 nut
	nut_active = false;
	nut_last = 0;	// Last nut before adding nut

	streak = 0;
	streak_progress = 0;



	last_streak_hit = 0;
	last_nut_hit = 0;

	static NOTES_PER_STREAK = 10;
	static MAX_STREAK = 3;
	static MAX_NUT = 1000;

	constructor(){}
	destructor(){}
	async init(){

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		this.camera.position.set(0,5.55,2.1);
		this.camera.lookAt(0,3,0);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
		this.renderer.setSize( window.innerWidth, window.innerHeight );

		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
		this.scene.add(this.ambientLight);

		this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.directionalLight.position.set(0,10,0);
		this.scene.add( this.directionalLight );

		this.axesHelper = new THREE.AxesHelper(5);
		this.scene.add(this.axesHelper);


		window.addEventListener('resize', this.onWindowResize.bind(this));

		const modelKit = await this.constructor.loadModel('media/models/musicgame/models.glb');
		this.scene.add(modelKit);

		for( let model of modelKit.children )
			this.models[model.name] = model;


		// Add rendering stats
		this.stats = new Stats();
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );

		// Load an environment map
		this.materials._envMap = await this.constructor.loadTexture('media/models/musicgame/envmap.jpg');
		this.materials._envMap.mapping = THREE.EquirectangularReflectionMapping;
		// Load the textures
		const textureKits = {
			flute : {
				d : 'flute_d.jpg',
				e : 'flute_e.jpg',
				n : 'flute_n.jpg',
				orm : 'flute_orm.jpg'
			},
			hitmarker : {
				d : 'musicnub_d.jpg',
				n : 'musicnub_n.jpg',
				orm : 'musicnub_orm.jpg'
			},
			nut : {
				d : 'nut_d.jpg',
			},
			nut_bar : {
				d : 'ui_block_d.jpg',
				n : 'ui_block_n.jpg',
				orm : 'ui_block_orm.jpg'
			}
		};

		const promises = [];
		for( let id in textureKits ){
			
			const kit = textureKits[id];
			for( let i in kit ){

				kit[i] = this.constructor.loadTexture('media/models/musicgame/'+kit[i]);
				promises.push(kit[i]);

			}

		}
		await Promise.all(promises);

		// Load the materials
		for( let id in textureKits ){
			
			const kit = textureKits[id];
			let mat = {};
			if( kit.d )
				mat.map = await kit.d;
			if( kit.e )
				mat.emissiveMap = await kit.e;
			if( kit.n )
				mat.normalMap = await kit.n;
			if( kit.orm ){
				mat.roughnessMap = await kit.orm;
				mat.aoMap = await kit.orm;
				mat.metalnessMap = await kit.orm;
				mat.metalness = 1.0;
			}
			mat.envMap = this.materials._envMap;
			this.materials[id] = new THREE.MeshStandardMaterial(mat);

		}

		const bg = await this.constructor.loadTexture('media/models/musicgame/note_sheet.png');

		// Set materials on the proper meshes
		this.models.flute.material = this.materials.flute;
		this.models.hitmarker.children[0].material = this.materials.hitmarker;
		this.models.hitmarker.children[1].material = this.materials.hitmarker;
		this.models.nut.material = this.materials.nut;
		this.models.nut_bar_bg.material = this.materials.nut_bar;
		this.models.streak_mul_bg.material = this.materials.nut_bar;
		this.models.track.material = new THREE.MeshStandardMaterial({
			map : bg,
			transparent : true,
			alphaTest : 0.1,
			side : THREE.DoubleSide,
		});

		this.models.volumetric_marker.visible = false;


		this.buildBarCanvas('nut_bar', 64, 512);
		this.buildBarCanvas('streak_bar', 32, 256);

		const c = document.createElement('canvas');
		c.width = 512;
		c.height = 512;
		this.canvas_streak_mul = c;
		const texture = new THREE.CanvasTexture(c);
		texture.center.set(0.5,0.5);
		texture.repeat.set( -1, 1 );
		texture.rotation = Math.PI;
		this.models.streak_mul.material = new THREE.MeshStandardMaterial({
			map : texture,
			emissiveMap : texture,
			emissive : 0xFFFFFF,
			transparent : true,
			alphaTest : 0.1,
		});

		this.updateStreak(true); // Updates streak and streak bar
		this.updateNut(true);
		this.startRender();

	}

	onNoteHit(){

		this.score += this.streak;

		if( this.streak < this.constructor.MAX_STREAK ){
			
			++this.streak_progress;
			if( this.streak_progress >= this.constructor.NOTES_PER_STREAK ){
				++this.streak;
				this.streak_progress = 0;
				this.last_streak_hit = 0;
			}
			else if( !this.nut_active )
				this.last_streak_hit = Date.now();
			this.updateStreak(true);

		}

	}

	onMiss(){

		++this.misses;
		this.resetStreak();

	}

	onStrike(){

		++this.strikes;
		this.resetStreak();

	}

	// Finished playing a nut block
	onNutBlockFinish( perc ){

		let total = Math.ceil(perc*this.constructor.MAX_NUT*0.4);
		this.nut_last = this.nut;
		this.nut = Math.min(this.constructor.MAX_NUT, this.nut+total);
		this.updateNut(true);
		this.last_nut_hit = Date.now();

	}

	resetStreak(){

		this.streak_progress = this.streak = 0;
		this.last_streak_hit = 0;
		this.updateStreak(true);

	}

	updateStreak( force = false ){

		const npsm1 = this.constructor.NOTES_PER_STREAK-1;
		let perc = this.streak_progress/npsm1;

		if( this.last_streak_hit ){
			let prePerc = Math.max(0,(this.streak_progress-1)/npsm1);
			if( prePerc >= 0 ){

				let time = (Date.now()-this.last_streak_hit)/250;
				if( time <= 1 ){
					time = 1.0-Math.pow(1.0-time, 2);
					perc = (perc-prePerc)*time+prePerc;
				}
				else
					this.last_streak_hit = 0;

			}
		}
		else if( !force )
			return;

		const ctx = this.canvas_streak_mul.getContext('2d');
		const grd = ctx.createLinearGradient(0, 0, this.canvas_streak_mul.width, 0);
		let start = 'rgb(150,150,150)', end = 'rgb(255,255,255)', text = 'rgb(50,50,50)';
		let label = 'x1';

		ctx.clearRect(0,0, this.canvas_streak_mul.width, this.canvas_streak_mul.height);

		if( this.streak > 2 ){
			perc = 1.0;
			label = 'x4';
			start = 'rgb(255,150,255)';
			end = 'rgb(255,240,255)';
		}
		else if( this.streak > 1 ){
			label = 'x3';
			start = 'rgb(150,200,255)';
			end = 'rgb(240,255,255)';
		}
		else if( this.streak > 0 ){
			label = 'x2';
			start = 'rgb(150,255,150)';
			end = 'rgb(240,255,240)';
		}

		grd.addColorStop(0, start);
		grd.addColorStop(0.5, end);
		grd.addColorStop(1, start);
		ctx.fillStyle = grd;
		ctx.fillRect(0,0,this.canvas_streak_mul.width, this.canvas_streak_mul.height);
		
		ctx.font = '400px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = text;
		ctx.fillText(label, this.canvas_streak_mul.width/2, this.canvas_streak_mul.height/2);
		
		this.drawBar(this.canvas_streak_bar, perc, start, end);

		this.models.streak_bar.material.map.needsUpdate = true;
		this.models.streak_mul.material.map.needsUpdate = true;

	}

	updateNut( force = false ){

		let emissive = 0.7;
		if( this.nut_active || this.nut >= this.constructor.MAX_NUT ){
			const dur = 1e3;
			emissive = Math.sin((Date.now()%dur)*Math.PI*2/dur)*0.5 + 0.5;
			emissive = emissive*0.5 + 0.5;
		}
		this.models.nut_bar.material.emissive.set(emissive,emissive,emissive);


		if( this.nut_active ){
			
		}

		let perc = this.nut/this.constructor.MAX_NUT;
		if( this.last_nut_hit ){
			let time = (Date.now()-this.last_nut_hit)/250;
			if( time <= 1 ){
				time = 1.0-Math.pow(1.0-time, 2);
				const pre = this.nut_last/this.constructor.MAX_NUT;
				perc = (perc-pre)*time+pre;
			}
			else
				this.last_nut_hit = 0;
		}
		else if( !force )
			return;

		this.drawBar(this.canvas_nut_bar, perc);
		this.models.nut_bar.material.map.needsUpdate = true;

	}

	buildBarCanvas( label, width, height ){

		const c = document.createElement('canvas');
		c.width = width;
		c.height = height;
		this['canvas_'+label] = c;
		const tex = new THREE.CanvasTexture(c);
		this.models[label].material = new THREE.MeshStandardMaterial({
			map : tex,
			emissiveMap : tex,
			emissive : new THREE.Color(.7,.7,.7),
			transparent : true,
			alphaTest : 0.1
		});
		this.drawBar(c, 0.25);
		return c;

	}

	drawBar( canvas, perc, startColor = 'rgb(255,255,150)', endColor = 'rgb(255,255,240)' ){
		
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0,0, canvas.width, canvas.height);
		const grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
		grd.addColorStop(0, startColor);
		grd.addColorStop(0.5, endColor);
		grd.addColorStop(1, startColor);
		ctx.fillStyle = grd;
		ctx.fillRect(0,0,canvas.width,canvas.height*perc, '#FFFFAA');

	}

	onWindowResize(){

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( window.innerWidth, window.innerHeight );

	}

	startRender(){
		if( this.rendering )
			return;
		this.rendering = true;
		this.render();
	}

	render(){

		if( !this.rendering )
			return;

		this.updateStreak();
		this.updateNut();

		this.renderer.render(this.scene, this.camera);
		requestAnimationFrame(this.render.bind(this));
		this.stats.update();

	}

	static async loadTexture(path){
		return new Promise( res => {
			this.textureLoader.load(path, texture => {
				texture.colorSpace = THREE.SRGBColorSpace;
				texture.flipY = false;
				res(texture);
			});
		});
	}


	static async loadModel(path){

		return new Promise(res => {
			this.loader.load(path, gltf => res(gltf.scene), undefined, err => console.error(err));
		});

	}

}
