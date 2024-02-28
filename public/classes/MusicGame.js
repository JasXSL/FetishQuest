import * as THREE from "../ext/THREE.js";
import { GLTFLoader } from "../ext/GLTFLoader.js";
import Stats from '../ext/stats.module.js';
//import { OrbitControls } from "../ext/OrbitControls.js";
/*
	Todo:
	- Animated bars
	- Horizontal bars based on bpm
	- Overdrive bar
	- Animate nut
	- hit indicator
	- long notes bar
	- fade in and out notes
	- score
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

	rendering = false;

	models = {};
	materials = {};

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
		this.models.track.material = new THREE.MeshBasicMaterial({
			map : bg,
			transparent : true,
			alphaTest : 0.1,
			side : THREE.DoubleSide,
		});

		this.models.volumetric_marker.visible = false;
		this.models.streak_mul.visible = false;
		this.models.streak_bar.visible = false;
		this.models.nut_bar.visible = false;

		

		this.startRender();

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
