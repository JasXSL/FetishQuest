/*
	This is the primary WebGL library
	It has a main class, and a Stage tied to it
	The main class has stuff like the base grid, base lighting and debugging
	The Stage is an object which is a reflection of a DungeonRoom
*/
import * as THREE from '../ext/THREE.js';
import {default as EffectComposer, ShaderPass, RenderPass, HorizontalBlurShader, VerticalBlurShader, CopyShader, ColorifyShader, FXAAShader} from '../ext/EffectComposer.js';
import OrbitControls from '../ext/OrbitControls.js';
import {AudioSound} from './Audio.js';
import { LibMaterial } from '../libraries/materials.js';
import Sky from '../ext/Sky.js';
import JDLoader from '../ext/JDLoader.min.js';
import HitFX from './HitFX.js';
import Proton from '../ext/three.proton.min.js';
import libMesh from '../libraries/meshes.js';
import stdTag from '../libraries/stdTag.js';
import Player from './Player.js';

window.g_THREE = THREE;

const DISABLE_DUNGEON = false;
//const DISABLE_DUNGEON = true;
const USE_FX = true;

// Enables a grid for debugging asset positions
const CAM_DIST = 1414;

class WebGL{

	constructor(config){

		if( typeof config !== "object" )
			config = {};

		const conf = {
			aa : localStorage.aa === undefined ? true : Boolean(+localStorage.aa),
			shadows : localStorage.shadows === undefined ? false : +localStorage.shadows
		};
		
		this.events = [];		// Events that should be unbound

		this.width = 1.0;		// vw
		this.height = 1.0;		// vh

		// Optional event bindings
		this.onRender = undefined;

		const width = window.innerWidth * this.width,
			height = Math.round(window.innerHeight*this.height),
			viewAngle = 50,
			nearClipping = 10,
			farClipping = 100000;
		
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( viewAngle, width / height, nearClipping, farClipping );
		this.cameraTween = new TWEEN.Tween();

		this.dungeons = {};	// dungeon_id : {time:(int)timestamp, stages:(arr)stages}
		this.dungeonsGroup = new THREE.Group();
		this.scene.add(this.dungeonsGroup);

		// SPELL EFFECTS / ARROW
		this.fxScene = new THREE.Scene();
		this.fxCam = new THREE.PerspectiveCamera( viewAngle, width/height, nearClipping, farClipping);
		this.fxCam.position.z = 100;
		this.fxCam.position.y = -10;
		this.fxCam.lookAt(new THREE.Vector3());
		this.fxRenderer = new THREE.WebGLRenderer({alpha:true});
		this.fxRenderer.setPixelRatio(1);
		this.fxRenderer.shadowMap.enabled = true;
		this.fxRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
		
		
		this.fxArrow = null;
		
		this.fxPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000,10000), new THREE.ShadowMaterial());
		this.fxRaycastPlane = this.fxPlane.clone();
		this.fxRaycastPlane.material = new THREE.MeshBasicMaterial();
		this.fxRaycastPlane.material.visible = false;
		this.fxScene.add(this.fxRaycastPlane);

		this.fxPlane.receiveShadow = true;
		this.fxPlane.material.opacity = 0.25;

		this.fxScene.add(this.fxPlane);

		const pLight = new THREE.DirectionalLight();
		this.fxScene.add(pLight);
		pLight.shadow.mapSize.width = pLight.shadow.mapSize.height = 1024;
		pLight.lookAt(new THREE.Vector3());
		pLight.position.z = 110;

		pLight.castShadow = true;
		pLight.shadow.camera.near = 1;    // default
		pLight.shadow.camera.far = 200;     // default
		
		const dist = 75;
		this.fxLight = pLight;
		pLight.shadow.camera.left = -dist;     // default
		pLight.shadow.camera.right = dist;     // default
		pLight.shadow.camera.top = dist;     // default
		pLight.shadow.camera.bottom = -dist;     // default

		this.arrowVisible = false;
		this.arrowBase = new THREE.Vector2();
		this.arrowTarget = null;
		this.arrowTween = {
			tween:null,
			x : 0,
			y : 0,
			val : 0
		};
		this.updateArrow();
		setTimeout(() => this.toggleArrow(false), 1000);

		//const chelper = new THREE.CameraHelper(pLight.shadow.camera);
		//this.fxScene.add(chelper);


		this.renderer = new THREE.WebGLRenderer({
			//antialias : conf.aa,
			//logarithmicDepthBuffer: true
		});
		
		if( conf.shadows ){
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		}

		// Effects
		this.composer = new EffectComposer( this.renderer );
		this.composer.addPass( new RenderPass(this.scene, this.camera) );
		this.hblur = new ShaderPass(HorizontalBlurShader);
		this.hblur.uniforms.h.value = 0.0025;
		this.composer.addPass( this.hblur );
		this.vblur = new ShaderPass(VerticalBlurShader);
		this.vblur.uniforms.v.value = 0.0025;
		this.composer.addPass( this.vblur );

		this.aa = new ShaderPass(FXAAShader); 
		this.aa.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * window.devicePixelRatio );
		this.aa.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * window.devicePixelRatio );
		this.aa.enabled = conf.aa;
		this.composer.addPass(this.aa);
		
		this.colorShader = new ShaderPass(ColorifyShader);
		this.colorShader.uniforms.color.value = new THREE.Color(2,1,1);
		this.colorShader.enabled = false;
		this.composer.addPass(this.colorShader);
		
		const copypass = new ShaderPass(CopyShader);
		copypass.renderToScreen = true;
		this.composer.addPass( copypass );


		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		//this.controls = new OrbitControls(this.fxCam, this.fxRenderer.domElement);
		
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.3;
		this.controls.rotateSpeed = 0.2;
		if( !config.fullControls ){
			this.controls.enablePan = false;
			this.controls.maxDistance = 2000;
			this.controls.minDistance = 500;
			this.controls.maxPolarAngle = Math.PI/3+0.2;
		}
		this.controls.update();

		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.mouseAbs = new THREE.Vector2();
		this.intersecting = [];	// Currently intersecting objects

		this.mouseDownPos = {x:0,y:0};
		const touchStart = event => {
			this.onMouseMove(event);
			this.mouseDownPos.x = event.offsetX;
			this.mouseDownPos.y = event.offsetY;
			
		};
		const touchEnd = event => {
			this.onMouseMove(event);
			const a = new THREE.Vector2(this.mouseDownPos.x, this.mouseDownPos.y);
			const b = new THREE.Vector2(event.offsetX,event.offsetY);
			if( a.distanceTo(b) > 5 )
				return;
			this.onMouseClick(event);
		};

		this.renderer.domElement.addEventListener('dblclick', event => this.onDblClick(event));
		this.renderer.domElement.addEventListener('mousedown', event => touchStart(event));
		this.renderer.domElement.addEventListener('touchstart', event => touchStart(event));
		this.renderer.domElement.addEventListener('mouseup', event => touchEnd(event));
		this.renderer.domElement.addEventListener('touchend', event => touchEnd(event));
		
		this.bind(document, 'mousemove', event => this.onMouseMove(event));
		this.bind(document, 'touchmove', event => this.onMouseMove(event));
		this.bind(document, 'touchstart', event => this.onMouseMove(event));
		this.bind(document, 'touchend', event => this.onMouseMove(event));
		
		// outdoor skybox
		let sky = new Sky();
		this.sky = sky;
		sky.visible = false;
		sky.scale.setScalar( 100000 );
		this.scene.add(sky);
		
		// Add Sun Helper
		const sunSphere = new THREE.Mesh(
			new THREE.SphereBufferGeometry( 1000, 16, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xffffff } )
		);
		sunSphere.visible = false;
		this.scene.add( sunSphere );
		this.sunSphere = sunSphere;
		
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.4);
		this.scene.add(this.ambientLight);



		this.center = new THREE.Object3D();
		this.scene.add(this.center);


		// fog
		this.scene.fog = new THREE.FogExp2(0xd5dbdf, 0.0003);

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize( width, height );
		this.loading = false;
		this.load_after_load = false;		// Set if a load was attempted while it was already loading

		this.camera.position.y = 1200;
		this.camera.lookAt(0,0,0);

		if( config.enableGrid ){
			let helper = new THREE.AxesHelper(100);
			helper.position.y = 100;
			this.scene.add(helper);

			let grid = new THREE.GridHelper(1000, 10);
			grid.position.y = 10;
			this.scene.add(grid);
		}
		let light = new THREE.DirectionalLight(0xFFFFFF, 0.6);
		light.position.y = 1000;
		light.position.z = 1000;
		light.castShadow = true;
		this.dirLight = light;
		this.scene.add(light);


		this.lightningLight = new THREE.DirectionalLight(0xFFFFFF, 3.0);
		this.lightningLight.castShadow = true;
		this.lightningLight.shadow.mapSize.width = this.lightningLight.shadow.mapSize.height = 256;
		this.lightningLight.position.z = this.lightningLight.position.x = -1000;
		this.lightningLight.position.y = 1000;
		this.lightningLight.visible = false;
		this.scene.add(this.lightningLight);

		let helper = new THREE.DirectionalLightHelper(light, 1000);
		//this.scene.add(helper);
		this.dirLightHelper = helper;
		light.target = this.center;
		light.shadow.mapSize.width = light.shadow.mapSize.height = 512;  // default
		light.shadow.camera.near = 500;    // default
		light.shadow.camera.far = 2000;     // default
		light.shadow.camera.left = -700;     // default
		light.shadow.camera.right = 700;     // default
		light.shadow.camera.top = 700;     // default
		light.shadow.camera.bottom = -700;     // default

		//Create a helper for the shadow camera (optional)
		helper = new THREE.CameraHelper( light.shadow.camera );
		//this.scene.add( helper );
		
		let bg = new THREE.Mesh(new THREE.PlaneGeometry(10000,10000), new THREE.MeshStandardMaterial({color:0x222222}));
		bg.rotation.x = -Math.PI/2;
		bg.receiveShadow = true;
		//this.scene.add(bg);
		bg.position.y -= 10;
		this.table = bg;
		
		this.clock = new THREE.Clock();

		const proton = new Proton();
		this.proton = proton;
		this.fx_proton = new Proton();
		//add renderer
		proton.addRender(new Proton.SpriteRender(this.scene));
		this.fx_proton.addRender(new Proton.SpriteRender(this.fxScene));

		// These are the props
		this.stage = null;					// Current stage object
		this.stages = [];					// Stores all stages for a dungeon
		this.cache_active_room = null;		// ID of active room for room detection

		this.cache_rain = 0;				// value of rain between 0 (no rain) and 1 (heavy rain) in the last cell. 
											// If this has changed on cell entry, redraw rain.

		$(window).off('resize').on('resize', () => {
			this.updateSize();
		});
		this.updateSize();
		

		// Player markers
		this.playerMarkers = [];	// Holds playermarker objects, these are added on the fly and not removed. Opting instead to overwrite them on a room change

		this.render();

		// Needs to load this or fx particles will break for some reason
		this.toggleArrow(true);
		setTimeout(() => this.toggleArrow());


	}

	destructor(){
		for( let event of this.events ){
			event.targ.removeEventListener(event.evt, event.func);
		}
	}

	bind( target, evt, func ){
		target.addEventListener(evt, func);
		this.events.push({
			targ : target,
			evt : evt,
			func : func
		});
	}

	setSize( width, height ){

		this.width = width || 1.0;
		this.height = height || 0.8;
		this.updateSize();

	}

	updateSize(){
		let width = Math.round(window.innerWidth*this.width),
			height = Math.round(window.innerHeight*this.height);
		
		this.renderer.setSize(width, height);
		this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		this.composer.setSize(this.renderer.domElement.width, this.renderer.domElement.height);
		
		this.renderer.domElement.style.width = Math.ceil(width);
		this.renderer.domElement.style.height = Math.ceil(height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.fxRenderer.setSize(width, height);
		this.fxCam.aspect = width/height;
		this.fxCam.updateProjectionMatrix();
		//this.aa.uniforms.resolution.value.set(width, height)
	}

	toggleOutdoors( outdoors ){
		
		let light = this.dirLight;
		this.sky.visible = !!outdoors;
		if( !outdoors ){
			light.position.y = 1000;
			light.position.z = 1000;
		}

	}

	setOutdoorTime( hours ){

		// Delay nighttime
		if( hours > 12 ){
			hours = 12+Math.pow((hours-12)/12, 2)*12;
		}

		const effectController = {
			turbidity: 10,
			rayleigh: 2,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.8,
			luminance: 1,
			inclination: hours >= 12 ? (hours-12)/12 : hours/12, // elevation / inclination
			azimuth: hours >= 12 ? 0.25 : 0.75, // Going up or down,
			sun: ! true
		};

		const sky = this.sky;
		const distance = 100000;
		const uniforms = sky.material.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.rayleigh.value = effectController.rayleigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

		const theta = Math.PI * ( effectController.inclination - 0.5 );
		const phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

		const position = uniforms.sunPosition.value;
		
		
		position.x = distance * Math.cos( phi );
		position.y = distance * Math.sin( phi ) * Math.sin( theta );
		position.z = distance * Math.sin( phi ) * Math.cos( theta );
		this.dirLight.position.copy( position ).normalize().multiplyScalar(CAM_DIST);
		this.sunSphere.position.copy( position );
		this.dirLightHelper.update();

		this.updateFog();

	}

	
	/* Updates the weather renderer if needed */
	updateWeather( force ){
		if( this.loading )
			return;
		if( !window.game )
			return;
		const proton = this.proton;
		let rain = game.getRain();
		if( !isNaN(force) )
			rain = force;

			
		// No need to change
		if( rain !== this.cache_rain || force ){

			this.cache_rain = rain;
			
			if( this.weather_rainDrops ){
				this.weather_rainDrops.destroy();
				this.weather_rainDrops = undefined;
			}
			if( this.weather_fog ){
				this.weather_fog.destroy();
				this.weather_fog = undefined;
			}
			if( this.weather_rainSplats ){
				for( let emitter of this.weather_rainSplats )
					emitter.destroy();
				this.weather_rainSplats = undefined;
			}

			const loader = new THREE.TextureLoader();
			

			const buildRain = function(){
				const mat = new THREE.SpriteMaterial({
					map : loader.load('/media/textures/particles/rain.png'),
					transparent : true,
					alphaTest : 0.1,
					color : 0xFFFFFF
				});
				let emitter = new Proton.Emitter();
				// Number of emission / how often to emit in s
				emitter.rate = new Proton.Rate(new Proton.Span(Math.ceil(10*rain), Math.ceil(20*rain)), new Proton.Span(.01));
				let sprite = new THREE.Sprite(mat);
				//addInitialize
				emitter.addInitialize(new Proton.Mass(1));
				emitter.addInitialize(new Proton.Body(sprite));
				emitter.addInitialize(new Proton.Position(new Proton.BoxZone(0,0,0, 1000,0,1000)));
				// Size of particle, x/y
				emitter.p.y = 800;
				emitter.addInitialize(new Proton.Radius(1, 30));
				emitter.addInitialize(new Proton.Life(0.5));
				emitter.addInitialize(new Proton.V(-1800, new Proton.Vector3D(0, 1, 0), 0));
				//addBehaviour
				emitter.emit();
				return emitter;
			};

			/*
			const buildRainPools = function(){
				
				const mat = new THREE.SpriteMaterial({
					map : loader.load('/media/textures/particles/rainsplat.png'),
					transparent : true,
					color : 0xFFFFFF
				});
				const sprite = new THREE.Sprite(mat);

				// Every 100+50
				let out = [];
				for( let x = 0; x<10; ++x ){
					for( let y = 0; y<10; ++y ){
						
						let emitter = new Proton.Emitter();
						// Number of emission / how often to emit in s
						emitter.rate = new Proton.Rate(1, (1-rain*0.8)*0.25);
						//addInitialize
						emitter.addInitialize(new Proton.Mass(1));
						emitter.addInitialize(new Proton.Body(sprite));
						emitter.addInitialize(new Proton.Position(new Proton.BoxZone(0,0,0, 100,0,100)));
						// Size of particle, x/y
						emitter.p.y = 50;
						emitter.p.x = -500+x*100+50;
						emitter.p.z = -500+y*100+50;
						emitter.addInitialize(new Proton.Radius(1, 30));
						emitter.addInitialize(new Proton.Life(new Proton.Span(0.1, 1)));
						emitter.addInitialize(new Proton.V(0, new Proton.Vector3D(0, 1, 0), 0));
						//addBehaviour
						emitter.addBehaviour(new Proton.Alpha(0, 2));
						emitter.addBehaviour(new Proton.Scale(.001, new Proton.Span(0.25, 0.8)));
						emitter.emit();
						out.push(emitter);
					}
				}
				return out;

			};
			*/
			if( rain > 0 ){
				this.weather_rainDrops = buildRain();
				//this.weather_rainSplats = buildRainPools();
				//add emitter
				proton.addEmitter(this.weather_rainDrops);
				/*
				for( let emitter of this.weather_rainSplats)
					proton.addEmitter(emitter);
				*/
			}
			this.updateFog(rain);

		}

		// Position the splats regardless
		/*
		const caster = new THREE.Raycaster();
		// Always update rain pools if needed
		if( rain > 0 && this.weather_rainSplats ){
			let base = this.stage.room.getRoomAsset();
			if( base && base._stage_mesh ){
				const stage = base._stage_mesh;
				for( let i in this.weather_rainSplats ){
					const emitter = this.weather_rainSplats[i];
					caster.set(
						new THREE.Vector3(emitter.p.x, 800, emitter.p.z), 
						new THREE.Vector3(0, -1, 0)
					);
					const sect = caster.intersectObject(stage)[0];
					if( sect ){
						emitter.p.y = sect.point.y+5;
					}
				}
			}
		}*/

		// Thunder / lightning
		if( rain >= 0.66 && !this.lightningTimer ){
			this.lightningTimer = setTimeout(() => this.triggerLightning(), 1000);
		}else if( rain < 0.66 ){
			clearTimeout(this.lightningTimer);
		}
		

	}

	async triggerLightning(){

		this.lightningTimer = setTimeout(() => this.triggerLightning(), 10000+Math.random()*60000);

		// Trigger flash
		const rain = game.getRain();
		if( rain >= 0.85 ){
			this.lightningLight.visible = true;
			await delay(Math.ceil(50+Math.random()*150));
			this.lightningLight.visible = false;
			await delay(Math.ceil(500+Math.random()*3000));
		}
		// Play sound
		if( !window.game )
			game.audio_ambient.play( '/media/audio/ambiance/lightning_'+Math.floor(Math.random()*4)+'.ogg', Math.pow(rain,4), false );
		
	}

	updateFog( override ){
		if(!window.game)
			return;

		const rain = isNaN(override) ? game.getRain() : override;
		this.scene.fog.density = !rain ? 0 : 0.0001+rain*0.0008;
		
		let swatches = [
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[18,9,8],
			[118,124,130],
			[160,170,176],
			[181,190,196],
			[195,203,208],
			[206,213,217],
			[215,221,224],
			[215,221,224],
			[215,221,224],
			[215,221,224],
			[215,221,224],
			[215,221,224],
			[213,218,220],
			[183,190,194],
			[144,142,145],
			[3,5,7],
			[0,0,0],
			[0,0,0]
		];

		const secOfDay = game.time%(3600*24),
			currentHour = Math.floor(secOfDay/3600),
			nextHour = Math.ceil(secOfDay/3600) === 24 ? 0 : Math.ceil(secOfDay/3600),
			percBetween = (secOfDay-currentHour*3600)/3600
		;

		const a = swatches[currentHour], b = swatches[nextHour];
		this.scene.fog.color.r = ((b[0]-a[0])*percBetween+a[0])/255;
		this.scene.fog.color.g = ((b[1]-a[1])*percBetween+a[1])/255;
		this.scene.fog.color.b = ((b[2]-a[2])*percBetween+a[2])/255;

	}

	/* Main */
	render(){
		this.execRender();
		requestAnimationFrame( () => this.render() );
	}

	// Scene rendering function - This is where the magic happens
	execRender(){

		let delta = this.clock.getDelta();
		TWEEN.update();
		if( this.stage )
			this.stage.render(delta);

		this.proton.update();
		this.fx_proton.update();
		if( this.arrowVisible )
			this.updateArrow();
		this.fxRenderer.render( this.fxScene, this.fxCam );

		const intersecting = [];	// Meshes being raycasted onto
		if( !window.game || game === true || !game.ui.visible ){

			this.raycaster.setFromCamera( this.mouse, this.camera );
			let objCache = [];
			let intersects = this.raycaster.intersectObjects( this.scene.children, true )
				.map(el => {
					if( !this.stage )
						return false;
					// This one has its own mouseover handler, return that
					if( el.object.userData.mouseover )
						return el;
					// Objects named HITBOX use the root item unless it has its own mouseover handler
					if( el.object.name === 'HITBOX' )
						el.object = this.stage.getMeshStageParent(el.object);
					return el;
				}).filter(el => {
					if(!(el && el.object && el.object.userData && typeof el.object.userData.mouseover === "function"))
						return false;
					if( ~objCache.indexOf(el.object) )
						return false;
					objCache.push(el.object);
					return true;	
				});

			// Raycaster
			// Mouseover
			for( let obj of intersects ){

				intersecting.push(obj.object);

				if( obj.object.userData._mouseover )
					break;
				obj.object.userData.mouseover.call(obj.object, obj.object);
				obj.object.userData._mouseover = true;

			}
			// Mouseout
			for( let obj of this.intersecting ){
				if( obj.userData._mouseover && intersecting.indexOf(obj) === -1 ){
					obj.userData._mouseover = false;
					if( typeof obj.userData.mouseout === "function" )
						obj.userData.mouseout.call(obj, obj);
				}
			}

		}

		this.playerMarkerFrame();
		

		if( this.onRender )
			this.onRender();

		this.intersecting = intersecting;

		
		
		this.controls.update();

		if( USE_FX && window.game )
			this.composer.render();
		else
			this.renderer.render( this.scene, this.camera);
	}
	
	cacheActiveDungeon(){

		if( game.dungeon.label === "_procedural_" || !window.game )
			return;

		if( !this.dungeons[game.dungeon.label] )
			this.dungeons[game.dungeon.label] = {stages:this.stages};
		this.dungeons[game.dungeon.label].time = Date.now();
		
		this.pruneCache();

	}

	// Returns nr cached cells minus the current dungeon
	getNrCachedCells(){
		// Save 50 cells in cache
		let nCells =0;
		for( let i in this.dungeons ){
			if( i !== game.dungeon.label )
				nCells += this.dungeons[i].stages.length;
		}
		return nCells;
	}

	getOldestCachedDungeon(){
		let time = false, out = null;
		for( let i in this.dungeons ){
			const t = this.dungeons[i].time;
			if( time === false || t < time ){
				time = t;
				out = i;
			}
		}
		return out;
	}

	pruneCache(){

		const cache_level = parseInt(localStorage.cache_level) || 50;
		while( this.getNrCachedCells() > cache_level && Object.keys(this.dungeons).length > 1 ){

			this.uncacheDungeon(this.getOldestCachedDungeon());

		}
		

	}

	uncacheDungeon( id ){

		if( !this.dungeons[id] )
			return;
		for( let stage of this.dungeons[id].stages ){
			this.dungeonsGroup.remove(stage.group);
		}
		delete this.dungeons[id];

	}

	// Dungeon stage cache
	async loadActiveDungeon(){

		if( DISABLE_DUNGEON )
			return;

		if( !game.dungeon )//|| game.dungeon.id === this.cache_dungeon )
			return;
		
			
		// Already loading hold your horses
		if( this.loading ){
			this.load_after_load = true;
			return false;
		}

		this.clearPlayerMarkers();
				
		this.loading = true;
		this.stages.map(s => s.destructor());
		this.stages = [];

		game.ui.toggleLoadingBar(game.dungeon.rooms.length);

		// This dungeon is cached
		if( this.dungeons[game.dungeon.label] ){

			this.stages = this.dungeons[game.dungeon.label].stages;
			this.stages.forEach(stage => {
				// Dungeon room objects change when entered, and I'm not sure why it's like that, but it do
				stage.room = game.dungeon.getRoomById(stage.room.id);

			});
			await delay(100);

		}
		// not cached
		else{

			let i = 0;
			for( let room of game.dungeon.rooms ){

				let stage = new Stage( room, this );
				this.stages.push(stage);
				this.dungeonsGroup.add(stage.group);
				await stage.draw();
				this.execRender( true );
				stage.toggle(false);
				game.ui.setLoadingBarValue(++i);
				if( this.load_after_load )
					break;

			}
			
		}

		this.loading = false;
		this.cache_active_room = -1;
		this.drawActiveRoom();
		if( this.load_after_load ){
			this.load_after_load = false;
			return this.loadActiveDungeon();
		}
		else
			this.cacheActiveDungeon();

		game.ui.toggleLoadingBar();

	}

	async drawActiveRoom(){

		if( this.loading )
			return;

		let room = game.dungeon.getActiveRoom();
		let roomChanged = room.id !== this.cache_active_room;
		let pre = this.stage;

		for( let r of this.stages ){

			if( !r.room )
				console.error("R doesnt' have a room flag", r);
			if( r.room.id === room.id ){

				if( !game.is_host )
					r.room = room;				// Needed for netcode
				this.stage = r;
				this.cache_active_room = room.id;
				await r.draw();
				break;

			}

		}

		// Weird, couldn't find the stage
		if( !this.stage ){
			console.error("Stage not found", room.id);
			return;
		}

		if( roomChanged ){
			if( pre )
				pre.toggle(false);
			this.stage.toggle(true);
			this.roomEnterCameraTween();
		}
		this.updateFog();

	}

	// This is used in the editor to replace the active room
	resetStage( replace ){

		if( this.stage )
			this.stage.destructor();
	
		if( this.stage )
			this.scene.remove(this.stage.group);

		let stage = replace;
		if( !stage )
			stage = new Stage(undefined, this);
		this.stage = stage;
		this.stage.group.position.y = 0;
		this.scene.add(stage.group);

	}

	// Adds an object to the stage, can be chained
	add( mesh ){
		this.stage.add(mesh);
		return this;
	}







	/* PLAYER MARKERS */
	clearPlayerMarkers(){
		
		for( let marker of this.playerMarkers )
			marker.visible = false;

	}

	onPlayerMarkerMouseover(){

		game.renderer.renderer.domElement.style.cursor = "pointer";
		this.material[2].emissive.copy(this.material[2].color);
		if( !this.userData.baseScale )
			this.userData.baseScale = this.scale.x;
		this.scale.x = this.scale.y = this.scale.z = this.userData.baseScale*1.1;

	}
	onPlayerMarkerMouseout(){

		game.renderer.renderer.domElement.style.cursor = "default";
		this.material[2].emissive.set(0.1,0.1,0.1);
		if( this.userData.baseScale )
			this.scale.x = this.scale.y = this.scale.z = this.userData.baseScale;

	}
	onPlayerMarkerClick(){

		const mesh = this;
		game.ui.drawPlayerContextMenu(mesh.userData.marker.player);

	}

	// Creates a new player marker and adds it to the cache
	async createPlayerMarker(){
		
		// Add a dummy so you don't overload
		this.playerMarkers.push(false);
		const obj = await libMesh().Generic.Marker.Player.flatten([], true);
		for( let i in this.playerMarkers ){
			if( this.playerMarkers[i] === false ){
				this.playerMarkers[i] = obj;
				break;
			}
		}

		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;

		obj.userData.marker = {
			player : null,
			dungeonAsset : null,
			texture : canvas,
			url : '',
			loading : false,
		};
		obj.material[0] = new THREE.MeshBasicMaterial({
			map : new THREE.CanvasTexture(canvas)
		});

		obj.material[2] = new THREE.MeshStandardMaterial({
			color : new THREE.Color(0xFFFFFF),
			metalness : 0.6,
			roughness : 0.4,
			emissive : new THREE.Color(0x333333)
		});

		obj.userData.mouseover = this.onPlayerMarkerMouseover.bind(obj);
		obj.userData.mouseout = this.onPlayerMarkerMouseout.bind(obj);
		obj.userData.click = this.onPlayerMarkerClick.bind(obj);

		this.scene.add(obj);
		return obj;

	}

	// Run on each frame
	playerMarkerFrame(){

		const cam = this.camera,
			camX = cam.position.x,
			camZ = cam.position.z;
		for( let marker of this.playerMarkers ){
			
			// It's still loading
			if( !marker )
				continue;
			marker.rotation.y = Math.atan2( camX - marker.position.x, camZ - marker.position.z );

		}

	}

	// Attach a player to a marker. This also updates.
	// If marker is empty, we'll have to create a new one.
	async attachPlayerToMarker( player, dungeonAsset, marker ){
		

		if( !dungeonAsset || !dungeonAsset._stage_mesh )
			return;

		if( !marker )
			marker = await this.createPlayerMarker();

		// Gonna have to rebuild some stuff
		if( marker.userData.marker.player !== player || marker.userData.marker.dungeonAsset !== dungeonAsset ){

			marker.userData.marker.player = player;
			marker.userData.marker.dungeonAsset = player;
			marker.visible = false;

			// Position
			marker.position.copy(dungeonAsset._stage_mesh.position);
			marker.scale.copy(dungeonAsset._stage_mesh.scale);

			delete marker.userData.baseScale;

			// Canvas
			// Texture URL has changed
			const url = player.getActiveIcon();
			if( url !== marker.userData.marker.url ){

				const canvas = marker.userData.marker.texture;
				marker.userData.marker.url = url;
				const context = canvas.getContext('2d');
				const image = new Image();
				image.addEventListener('load', e => {

					this.constructor.drawCover(context, image, canvas.height, canvas.width, undefined, undefined, 1.33);
					marker.material[0].map.needsUpdate = true;
					marker.userData.marker.loading = false;
					marker.visible = true;

				}, false);
				image.crossOrigin = "Anonymous";
				image.src = '/imgproxy/?image='+encodeURIComponent(url);
				marker.userData.marker.loading = true;
				marker.visible = false;

			}
			else if( !marker.userData.marker.loading )
				marker.visible = true;
			marker.material[0].color.set(player.isDead() ? 0xFF1111 : 0xFFFFFF); 
			const ring = marker.material[2];
			ring.color.set(player.color);
			ring.color.r = Math.pow(ring.color.r, 3);
			ring.color.g = Math.pow(ring.color.g, 3);
			ring.color.b = Math.pow(ring.color.b, 3);
			marker.material[2].emissive.set(0.1,0.1,0.1);

		}
		
	}

	async updatePlayerMarkers(){

		if( !window.game || this.loading || game.dungeon.transporting )
			return;

		// Viable marker positions
		const room = game.dungeon.getActiveRoom();
		if( !room )
			return;
			
		const generics = room.getGenericMarkers();

		let markerIndex = 0;	// Tracks what marker to add to
		const players = game.getEnabledPlayers();
		for( let player of players ){
			
			// Draw only enemies that are generated. Friendly NPCs are technically enemies.
			if( !player.generated || player.team === Player.TEAM_PLAYER )
				continue;

			// First try to get a specific marker if it exists
			let marker = room.getPlayerMarker(player.label);
			// Didn't exist, try getting a generic one
			if( !marker ){

				// No free generic markers, skip this. Maybe later add an error for the developer?
				if( !generics.length ){
					console.error("No generics free");
					continue;
				}
				marker = generics.shift();

			}


			this.attachPlayerToMarker(player, marker, this.playerMarkers[markerIndex]);
			++markerIndex;

		}
		
		// Hide unused markers
		for( ; markerIndex < this.playerMarkers.length; ++markerIndex )
			this.playerMarkers[markerIndex].visible = false;
		

	}







	/* EVENTS */
	onMouseMove( event, debug ){

		const offset = $(this.renderer.domElement).offset();
		if( event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove' )
			event = event.changedTouches[0];

		// Then refer to 
		//var x = evt.pageX - offset.left;
		this.mouseAbs.x = event.clientX;
		this.mouseAbs.y = event.clientY;
		this.mouse.x = ( (event.clientX-offset.left) / (this.renderer.domElement.width/window.devicePixelRatio) ) * 2 - 1;
		this.mouse.y = - ( (event.clientY-offset.top) / (this.renderer.domElement.height/window.devicePixelRatio) ) * 2 + 1;

	}

	onDblClick(event){

		for( let obj of this.intersecting ){
			
			if( obj.userData && typeof obj.userData.dblclick === "function" ){
				
				if( obj.userData.dblclick.call(obj, obj) )
					break;

			}
			
		}

	}

	onMouseClick( event ){

		for( let obj of this.intersecting ){
			
			if( obj.userData && typeof obj.userData.click === "function" ){
				
				if( obj.userData.click.call(obj, obj) )
					break;

			}
			
		}
	}

	// battle state has changed
	onBattleStateChange(){
		if( this.stage )
			this.stage.onBattleStateChange();
	}

	flipColorShader( on = false ){
		this.colorShader.enabled = !!on;
	}

	// Battle started
	battleVis(){

		clearInterval(this._battle_vis_timer);
		let nr = 0;
		this.flipColorShader(true);
		this._battle_vis_timer = setInterval(() => {
			this.flipColorShader(nr%2);
			++nr;
			if( nr >= 7 )
				clearInterval(this._battle_vis_timer);
		}, 150);
		
	}


	/* FX LAYER */
	playFX( caster, recipients, visual, armor_slot, global = false, mute = false ){

		let visObj = visual;
		if( !(visual instanceof HitFX) ){
			visObj = glib.get(visual, 'HitFX');
			if( !visObj || !visObj.save ){
				console.error("Visual missing", visual);
				return;
			}
		}
		visObj = visObj.clone(this);

		if( !Array.isArray(recipients) )
			recipients = [recipients];
		
		for( let recipient of recipients )
			visObj.run(caster, recipient, armor_slot, mute, recipients.length);
		
		if( global && game.is_host ){
			game.net.dmHitfx(caster, recipients, visObj, armor_slot);
		}

		
	}


	// Target arrow
	// x y are in document coordinates
	toggleArrow( on = false, x = 0, y = 0 ){

		if( on ){
			this.fxPlane.visible = true;
		}
		const vec = new THREE.Vector2( x, y);

		const offset = $(this.fxRenderer.domElement).offset();
		vec.x = ( (x-offset.left) / this.fxRenderer.domElement.width ) * 2 - 1;
		vec.y = - ( (y-offset.top) / this.fxRenderer.domElement.height ) * 2 + 1;

		const coords = this.raycastArrow(vec);
		if( !coords ){
			this.arrowVisible = false;
			console.error("No viable mouse coordinates for ", vec.x, vec.y);
		}
		else
			this.arrowBase = new THREE.Vector2(coords.point.x, coords.point.y);

		this.arrowVisible = !!on;
		if( !on )
			this.arrowTarget = null;
		this.fxArrow.visible = this.arrowVisible;
		// Particles will break if these remain on without an arrow
		this.fxLight.visible = this.fxPlane.visible = this.arrowVisible;
		

	}


	setArrowTarget( x, y ){
		
		if( this.arrowTween.tween )
			this.arrowTween.tween.stop();

		if( x === undefined ){
			this.arrowTarget = null;
			this.arrowTween.tween = new TWEEN.Tween(this.arrowTween).to({val:0}, 200).easing(TWEEN.Easing.Sinusoidal.Out)
			.onUpdate(() => {
				let coords = this.raycastArrow(this.mouse);
				if( !coords )
					return;
					
				coords = coords.point;
				coords.x += (this.arrowTween.x-coords.x)*this.arrowTween.val;
				coords.y += (this.arrowTween.y-coords.y)*this.arrowTween.val;
				this.updateArrow( coords );
			})
			.onComplete(() => this.arrowTween.tween=null)
			.start();
		}
		else{

			const vec = new THREE.Vector2( x, y);
			const offset = $(this.fxRenderer.domElement).offset();
			vec.x = ( (x-offset.left) / this.fxRenderer.domElement.width ) * 2 - 1;
			vec.y = - ( (y-offset.top) / this.fxRenderer.domElement.height ) * 2 + 1;
			this.arrowTarget = vec;

			let to = this.raycastArrow(vec);
			if( !to )
				return;
			to = to.point;
			this.arrowTween.x = to.x;
			this.arrowTween.y = to.y;

			this.arrowTween.tween = new TWEEN.Tween(this.arrowTween).to({val:1}, 200).easing(TWEEN.Easing.Sinusoidal.Out).onUpdate(() => {

				let coords = this.raycastArrow(this.mouse);
				if( !coords )
					return;
				coords = coords.point;
				coords.x += (to.x-coords.x)*this.arrowTween.val;
				coords.y += (to.y-coords.y)*this.arrowTween.val;
				this.updateArrow( coords );

			})
			.onComplete(() => this.arrowTween.tween = null)
			.start();

		}

	}

	raycastScreenPosition( x, y ){
		const vec = new THREE.Vector2( x, y);
		vec.x = ( x / window.innerWidth ) * 2 - 1;
		vec.y = - ( y / window.innerHeight ) * 2 + 1;
		return this.raycastArrow(vec);
	}

	raycastArrow( coords ){

		if( !coords )
			coords = this.arrowTarget;

		if( !coords )
			coords = this.mouse;

		if( !coords )
			return;

		const ray = new THREE.Raycaster();
		ray.setFromCamera( coords, this.fxCam );
		return ray.intersectObjects( [this.fxRaycastPlane], true )[0];

	}

	updateArrow( pos ){

		if( !this.arrowBase )
			return;
		
		const origin = this.arrowBase;

		let intersects = pos;
		if( !pos ){

			if( this.arrowTween.tween )
				return;
			intersects = this.raycastArrow();
			if( intersects )
				intersects = intersects.point;

		}
		if( !this.fxArrow ){

			const loader = new THREE.TextureLoader();
			const mloader = new JDLoader();

			this.fxArrow = new THREE.Group();
			this.fxArrow.castShadow = true;
			this.fxArrow.visible = false;
			
			
			mloader.load('media/models/ui/arrow_path.JD', model => {

				let texture = loader.load('media/textures/sprites/arrow_block.png');
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.side = THREE.DoubleSide;
				const mat = new THREE.MeshBasicMaterial({
					map:texture, 
					transparent:true, 
					alphaTest : 0.25,
					shadowSide : THREE.FrontSide,
				});

				const geo = model.objects[0].geometry;
				const mesh = new THREE.Mesh(
					geo, mat
				);
				mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
					depthPacking : THREE.RGBADepthPacking,
					map : texture,
					alphaTest : 0.25,
				});
				mesh.name = 'path';
				this.fxArrow.add(mesh);
				mesh.scale.x = 0.2;
				mesh.castShadow = true;

			});
			

			const geo = new THREE.PlaneGeometry(10,8);
			geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -4, 0 ) );

			const texture = loader.load('media/textures/sprites/arrow.png');
			texture.side = THREE.DoubleSide;

			const mat = new THREE.MeshBasicMaterial({map:texture, transparent:true, alphaTest:0.5, shadowSide:THREE.FrontSide});
			const arrow = new THREE.Mesh(geo, mat);

			arrow.position.y = 15;
			arrow.rotation.x = -0.4;
			arrow.name = 'arrow';
			arrow.castShadow = true;
			arrow.customDepthMaterial = new THREE.MeshDepthMaterial({
				depthPacking : THREE.RGBADepthPacking,
				map : texture,
				alphaTest : 0.5
			});
			this.fxArrow.add(arrow);
			this.fxScene.add(this.fxArrow);

		}

		if( !intersects )
			return;

		if( this.fxArrow.children.length < 2 )
			return;

		const point = new THREE.Vector2(intersects.x, intersects.y);
		this.fxArrow.position.x = origin.x;
		this.fxArrow.position.y = origin.y;
		
		const arrow = this.fxArrow.children[0];
		const line = this.fxArrow.children[1];

		
		const dist = point.distanceTo(origin);
		const shortened = dist-5;
		line.material.map.repeat.y = shortened/5;
		if( !line.userData.offs )
			line.userData.offs = 0;
		line.userData.offs += 0.02;
		line.material.map.offset.y = line.userData.offs;
		

		arrow.position.y = dist;
		line.scale.y = shortened/100;
		const radians = Math.atan2(point.y - origin.y, point.x - origin.x)-Math.PI/2;
		this.fxArrow.rotation.z = radians;
		
		
	}




	

	// Tweens the camera after entering a new room
	// Chainable
	roomEnterCameraTween(){

		let room = game.dungeon.getActiveRoom();
		let asset = room.getRoomAsset();
		let mesh = asset.getModel();
		
		let size = Math.max(mesh.width,mesh.height);
		let posY = size*220/Math.pow(1.05, size), 
			posZ = size*80/Math.pow(1.05, size);
		this.camera.position.y = posY*1.1;
		this.camera.position.z = posZ*1.1;
		this.camera.position.x = 0;
		if( room.zoom ){
			posY = room.zoom;
			posZ = room.zoom;
			this.camera.position.y = posY;
			this.camera.position.z = posZ;
			this.camera.position.x = posZ*0.5;
		}
		
		this.camera.lookAt(0,0,0);
		this.controls.update();
		this.cameraTween.stop();
		this.cameraTween = new TWEEN.Tween(this.camera.position).to({y:posY, z:posZ}, 500).easing(TWEEN.Easing.Sinusoidal.Out)
			.onUpdate(() => {
				this.controls.update();
			})
			.start();
		return this;
	}





	// Helpers
	/**
	 * Originally by Ken Fyrstenberg Nilsen
	 * drawCover(context, image [, x, y, width, height [,offsetX, offsetY]])
	 * Draws a texture onto a canvas using CSS COVER
	 * If image and context are only arguments rectangle will equal canvas
	*/
	static drawCover(ctx, img, w, h, offsetX, offsetY, scalex = 1, scaley = 1) {

		let x = 0, y = 0;

		// default offset is center
		offsetX = typeof offsetX === "number" ? offsetX : 0.5;
		offsetY = typeof offsetY === "number" ? offsetY : 0.5;

		// keep bounds [0.0, 1.0]
		if (offsetX < 0) offsetX = 0;
		if (offsetY < 0) offsetY = 0;
		if (offsetX > 1) offsetX = 1;
		if (offsetY > 1) offsetY = 1;

		let iw = img.width,
			ih = img.height,
			r = Math.min(w / iw, h / ih),
			nw = iw * r * scalex,   // new prop. width
			nh = ih * r * scaley,   // new prop. height
			cx, cy, cw, ch, ar = 1;

		// decide which gap to fill    
		if (nw < w) ar = w / nw;                             
		if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
		nw *= ar;
		nh *= ar;

		// calc source rectangle
		cw = iw / (nw / w);
		ch = ih / (nh / h);

		cx = (iw - cw) * offsetX;
		cy = (ih - ch) * offsetY;

		// make sure source rectangle is valid
		if (cx < 0) cx = 0;
		if (cy < 0) cy = 0;
		if (cw > iw) cw = iw;
		if (ch > ih) ch = ih;

		// fill image in dest. rectangle
		ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);

	}

}










/*
	Stage is a reflection of a DungeonRoom which neatly ties the room together along with any
	- Tweens
	- Particles
	- Animation mixers
*/
class Stage{

	constructor( room, parent, isEditor = false ){
		this.parent = parent;
		this.group = new THREE.Group();
		this.enabled = false;
		this.tweens = [];		// Library of tweens active in this scene 
		this.particles = [];	// Particles active in the scene
		this.mixers = [];		// Animation mixers
		this.sounds = [];		// [{id:(str)soundID, mesh:THREE.Mesh, sound:AudioSound}]
		this.water = [];		// Meshes
		this.isEditor = isEditor;	// Whether this was loaded through the editor or live
		this.room = room;			// DungeonRoom

	}
	destructor(){
		this.onTurnOff();
		this.toggle(false);
	}

	toggle( on ){
		this.enabled = on;
		if( !on )
			this.onTurnOff();
		else
			this.onTurnOn();
		this.group.visible = Boolean(on);
	}

	onTurnOn(){

		for( let obj of this.group.children )
			this.onObjStart(obj);

		if( this.room && this.room.outdoors ){
			this.parent.toggleOutdoors(true);
			let time = window.game ? game.getHoursOfDay() : 10;
			this.parent.setOutdoorTime(time);
		}
		else
			this.parent.toggleOutdoors(false);
		this.parent.updateWeather();

		this.parent.updatePlayerMarkers();

	}

	onTimeChanged(){
		if( this.room && this.room.outdoors ){
			this.parent.setOutdoorTime(game.getHoursOfDay());
		}
		this.parent.updateWeather();
	}

	onTurnOff(){

		this.stopAllSounds();
		for( let tween of this.tweens )
			this.removeTween(tween);
		for( let p of this.particles )
			p.destroy();
		this.particles = [];
		this.tweens = [];
		this.mixers = [];

	}

	// Triggered on each (mesh) object when the room is drawn
	onObjStart( obj ){

		let dungeonAsset = obj.userData.dungeonAsset;
		if( !this.enabled )
			return;

		
		// needs to be placed after the mixers and auto
		if( typeof obj.userData.template.onStagePlaced === "function" ){
			obj.userData.template.onStagePlaced(dungeonAsset, obj);
		}

		this.addTweensRecursive(obj);
		this.addParticlesRecursive(obj);
		this.addMixersRecursive(obj);
		this.addWaterRecursive(obj);
		this.addSoundLoopsRecursive(obj);
		
		if( typeof obj.userData.template.afterStagePlaced === "function" )
			obj.userData.template.afterStagePlaced(dungeonAsset, obj);

	}

	// Triggered when a door is changed
	onDoorRefresh( c ){

		let asset = c.userData.dungeonAsset;
		let linkedRoom = !this.isEditor ? game.dungeon.getRoomByIndex(asset.getDoorTarget()) : false;
		//let tagAlwaysVisible = (asset.isExit() && !asset.isLocked() &&) || (linkedRoom && (linkedRoom.index === game.dungeon.previous_room || !linkedRoom.discovered || linkedRoom.index === asset.parent.parent_index));
		let tagAlwaysVisible = false;
		const interaction = asset.getDoorInteraction(),
			alwaysHide = interaction && interaction.data.badge === 1,
			locked = asset.isLocked();

		let sprites = c.userData.hoverTexts;
		for( let i in sprites )
			sprites[i].visible = false;

		let sprite = sprites.bearing;
		if( sprite )
			sprite.material.opacity = 1;
		

		if( locked ){
			sprite = sprites.locked;
		}
		else if( asset.isExit() ){
			if( !asset.name ) 
				sprite = sprites.exit;
			tagAlwaysVisible = true;
		}
		else if( sprite && linkedRoom ){
			sprite.material.opacity = 0;
			if( !linkedRoom.discovered ){
				tagAlwaysVisible = true;
				sprite.material.opacity = 1;
			}
		}

		if( sprite && locked )
			sprite.material.opacity = 0;
		
		if( linkedRoom && linkedRoom.index === game.dungeon.previous_room ){

			if( game.battle_active ){
				sprite = sprites.run;
				tagAlwaysVisible = true;
			}
			else if( sprites.back ){
				sprites.back.visible = !alwaysHide;
				sprites.back.opacity = 1;
			}
		}

		if( linkedRoom && linkedRoom.index === asset.parent.parent_index && !game.battle_active && !interaction.data.badge && !this.room.parent.free_roam ){

			tagAlwaysVisible = true;
			sprite = sprites.out;
			sprite.material.opacity = 1;

		}

		if( sprite ){
			sprite.visible = !alwaysHide;

			// Fade tween (Needed for the tags)
			let tweenVal = {i:1};
			c.userData.tween = new TWEEN.Tween(tweenVal).to({i:0}, 250).easing(TWEEN.Easing.Sinusoidal.Out).onUpdate(obj => {

				if( !tagAlwaysVisible && !alwaysHide )
					sprite.material.opacity = obj.i;
				let intensity = Math.floor(0x22*obj.i);
				this.setMeshMatProperty(c, 'emissive', new THREE.Color((intensity<<16)|(intensity<<8)|intensity));

			}).onComplete(() => {
				this.setMeshMatProperty(c, 'emissive', new THREE.Color(0), true);
			});
			c.userData.mouseover = () => {
				c.userData.tween.stop();

				if( !tagAlwaysVisible && !alwaysHide ){
					sprite.visible = true;
					sprite.material.opacity = 1;
				}
				this.setMeshMatProperty(c, 'emissive', new THREE.Color(0x222222));
				this.parent.renderer.domElement.style.cursor = "pointer";
			};
			c.userData.mouseout = () => {
				c.userData.tween.stop();
				c.userData.tween._object.i = 1;
				c.userData.tween.start();
				this.parent.renderer.domElement.style.cursor = "auto";
			};
		}

	}

	// Triggered when an asset is changed
	onObjRefresh( obj ){

		let dungeonAsset = obj.userData.dungeonAsset;
		dungeonAsset.updateInteractivity();
		// Update the room tags
		if( window.game && dungeonAsset.isDoor() )
			this.onDoorRefresh(obj);


		// Interactive object
		if( dungeonAsset.isInteractive() ){

			// Bind hover unless already bound
			if( !obj.userData.mouseover )
				this.constructor.bindGenericHover(obj);

			obj.userData.click = mesh => {
				const player = game.getMyActivePlayer(),
					dungeonAsset = mesh.userData.dungeonAsset,	// Do it this way becaues dungonAsset upstream might have changed in netcode
					room = dungeonAsset.parent
				;
				game.dungeon.assetClicked(player, room, dungeonAsset, mesh);
			};
		}
		
	

	}

	/* Primary actions */
	// Adds from libraries/meshes.js, returns the library object that was added
	async addFromMeshLib(asset, attachments, unique){

		if( !asset.flatten )
			console.error("Asset can't flatten", asset, "in", this);
		let obj = await asset.flatten(attachments, unique);
		this.add(obj);
		
		return obj;

	}

	// Adds from a dungeon asset
	async addDungeonAsset( asset ){


		const libEntry = asset.getModel();
		const attachmentIndexes = asset.attachments;
		if( !libEntry.flatten )
			console.error("Found invalid model in asset", asset);
		const c = await this.addFromMeshLib(libEntry, attachmentIndexes, asset.isInteractive() || this.isEditor);

		
		c.userData.dungeonAsset = asset;
		c.userData.hoverTexts = {};
		asset.setStageMesh(c);
		if( !c.name )
			c.name = asset.name || asset.model;

		

		// Create labels
		// Door
		if( window.game && asset.isDoor() && !this.isEditor ){
		
			let linkedRoom = game.dungeon.getRoomByIndex(asset.getDoorTarget());

			this.createIndicatorForMesh('locked', '_LOCKED_', c, 0.4);
			if( asset.isExit() && !asset.name ){
				this.createIndicatorForMesh('exit', 'Exit', c);
			}
			else{
				if( !linkedRoom && !asset.name )
					console.error("Required linked room missing, ", linkedRoom, "searched for index", asset.getDoorTarget(), "from", asset, "in", game.dungeon);
				this.createIndicatorForMesh('run', "Run", c);
				this.createIndicatorForMesh('back', "", c);
				this.createIndicatorForMesh('out', "_OUT_", c, 0.4);
				const name = asset.name ? asset.name : this.room.getBearingLabel(this.room.getAdjacentBearing( linkedRoom ));
				this.createIndicatorForMesh('bearing', name, c);
			}
		
		}


		this.updatePositionByAsset( asset );

		this.onObjStart(c);

	}

	updatePositionByAsset( asset ){

		const room = this.room;
		const roomAsset = room.getRoomAsset();
		let roomModel;
		if( roomAsset )
			roomModel = roomAsset.getModel();

		const c = asset._stage_mesh;
		let meshTemplate = asset.getModel();			// Library entry

		// Position it
		c.position.x = asset.x;
		c.position.y = asset.y;
		c.position.z = asset.z;
		c.rotation.x = asset.rotX;
		c.rotation.y = asset.rotY;
		c.rotation.z = asset.rotZ;
		c.scale.x = asset.scaleX;
		c.scale.y = asset.scaleY;
		c.scale.z = asset.scaleZ;
	
	}

	// Adds a mesh to stage, or many
	add(...models){
		for( let model of models )
			model.userData._stage = this;
		this.group.add(...models);
	}

	// Removes a mesh from stage or many
	remove(...models){
		this.group.remove(...models);
	}

	// Run at each Rendering frame
	render( delta ){

		let lPos = new THREE.Vector3().copy(this.parent.dirLight.position).normalize();
		if( !this.enabled )
			return;


		for( let mixer of this.mixers )
			mixer.update( delta );

		for( let water of this.water ){
			if( water.material.uniforms.time ){
				water.material.uniforms.time.value += delta;
				water.material.uniforms.sunDirection.value.copy( lPos );
			}
		}

		this.updateSoundPositions();

	}


	// Returns a mesh based on DungeonAsset in stage.
	findAsset( dungeonAsset ){
		for( let mesh of this.group.children ){
			if( mesh.userData.dungeonAsset.id === dungeonAsset.id )
				return mesh;
		}
	}

	// Takes a mesh and propagates parent until it reaches the object directly under this.group
	getMeshStageParent( mesh ){
		let p = mesh;
		while( p ){
			// Found the base
			if( p.parent === this.group )
				return p;
			p = p.parent;
		}
		// Not even in the stage
		return false;
	}


	// Primary draw method
	/* STAGE MANAGEMENT  */
	// Creates or updates a stage with room, then returns that room. If room is unset, it uses the current dungeon room 
	// Chainable
	async draw( ){

		const room = this.room;

		// Add assets
		for( let asset of room.assets ){

			let existing = this.findAsset( asset );
			if( existing ){

				// In the netcode, the tied in dungeonAsset may change, so we'll have to reset it
				//if( !game.is_host ){
				asset._stage_mesh = existing;
				existing.userData.dungeonAsset = asset;
				//}

				existing.visible = !asset.isHidden();

				continue;
			}

			// Don't try to do this in parallel or you'll freeze the browser
			await this.addDungeonAsset(asset);
		
		}



		// Remove assets that have been removed from the room
		for( let ch of this.group.children ){

			if( ch.userData.dungeonAsset && !room.assetExists(ch.userData.dungeonAsset) )
				this.remove(ch);

		}

		for( let asset of this.group.children )
			this.onObjRefresh(asset);


	}











	/* Battle state change */
	onBattleStateChange(){
		
		for( let asset of this.group.children )
			this.onObjRefresh(asset);

	}

	/* These are auto handled when using addFromMeshLib */

	/* Particles */
	// Adds particles from a mesh recursively
	addParticlesRecursive( obj ){

		if( Array.isArray(obj.userData.particles) ){
			for( let psys of obj.userData.particles)
				this.addParticleSystem(psys);
		}

		for( let c of obj.children )
			this.addParticlesRecursive(c);

	}
	addParticleSystem(sys){
		if( ~this.particles.indexOf(sys) )
			return;
		this.parent.proton.addEmitter(sys);
		this.particles.push(sys);
	}
	removeParticleSystem(sys){
		let index = this.particles.indexOf(sys);
		if( ~index ){
			sys.destroy();
			this.particles.splice(index,1);
		}
	}


	/* Animation Mixers */
	addMixersRecursive(obj){
		
		if( obj.userData.mixer ){

			this.addMixer(obj.userData.mixer);
			obj.userData.playAnimation('idle');
			//let skeleton = new THREE.SkeletonHelper( obj );
			//this.add( skeleton );

		}
		for( let c of obj.children )
			this.addMixersRecursive(c);

	}
	addMixer(mixer){
		if( ~this.mixers.indexOf(mixer) )
			return;
		this.mixers.push(mixer);
	}
	removeMixer(mixer){
		let index = this.mixers.indexOf(mixer);
		if( ~index )
			this.mixers.splice(index,1);
	}


	/* Audio */
	addSoundLoopsRecursive(obj){
		
		if( Array.isArray(obj.userData.soundLoops) ){
			for( let loop of obj.userData.soundLoops )
				this.playSound( obj, loop.url, loop.volume || 0.5, true, loop.url);
		}
		for( let c of obj.children )
			this.addSoundLoopsRecursive(c);

	}

	/* Water */
	addWaterRecursive(obj){
		
		if( obj.userData._is_water )
			this.addWater(obj);
		for( let c of obj.children )
			this.addWaterRecursive(c);

	}
	addWater(model){
		if( ~this.water.indexOf(model) )
			return;
		this.water.push(model);
	}
	removeWater(model){
		let index = this.water.indexOf(model);
		if( ~index )
			this.water.splice(index,1);
	}


	/* Tweens */
	addTweensRecursive( obj ){
		if( obj.userData.tweens ){

			const loop = ( o, i ) => {
				let tween = obj.userData.tweens[i];
				this.removeTween(tween);	// Remove the last tween
				tween = o();				// Generate a new one
				obj.userData.tweens[i] = tween;		// Set it to the new one
				this.addTween(tween);				// Add it to the scene
				tween.onComplete(() => loop(o, i));	// on complete, call this again
			};

			for( let i in obj.userData.tweens ){

				// Converts tween objects to tweens

				// active tweens
				let tween = obj.userData.tweens[i];
				// Tween is a function, this is used for lights and such where the tween values are random each loop
				if( typeof tween === "function" ){
					loop(tween, i);
				}
				else
					this.addTween(tween);
			}
		}
		for( let c of obj.children )
			this.addTweensRecursive(c);
	}
	addTween(tween){
		this.tweens.push(tween);
	}
	removeTween(tween){
		
		let index = this.tweens.indexOf(tween);
		if( ~index ){
			tween.stop();
			this.tweens.splice(index,1);
		}

	}
	

	/* Audio */
	updateSoundPositions( debug ){

		for( let s of this.sounds ){
			if( s.sound instanceof AudioSound ){
				let pos = s.mesh.position.clone();
				let camera = this.parent.camera;

				camera.matrixWorldInverse.getInverse( camera.matrixWorld );
				pos.applyMatrix4( camera.matrixWorldInverse );
				let falloff = 800;
				s.sound.setPosition(pos.x/falloff,pos.y/falloff,pos.z/falloff);
			}
		}
	}
	playSound( mesh, url, volume, loop, id){
		if( typeof id !== "string" )
			id = url;
		
		this.stopSound(mesh, id);

		const soundController = window.game ? game.audio_fx : mod.audio_fx;
		if( !soundController )
			return;
		let reg = {
			mesh : mesh,
			id : id,
			sound : soundController.play(url, volume, loop).then(audio => {
				reg.sound = audio;

				this.updateSoundPositions();
			})
		};
		this.sounds.push(reg);

	}

	stopSound( mesh, id, fade = 0 ){

		// Callback for getting the sound
		const stop = s => {
			if( s )
				s.stop(fade);
		};

		for( let i in this.sounds ){
			let sound = this.sounds[i];
			if( sound.id === id && sound.mesh === mesh ){
				Promise.resolve(sound.sound).then(stop);
				this.sounds.splice(i, 1);
			}
		}

	}
	
	stopAllSounds(){
		let sounds = this.sounds.slice();
		for( let s of sounds ){
			this.stopSound(s.mesh,s.id);
		}
	}





	/* Tools */
	/* TOOLS */
	// Creates an arrow indicator to go above a door
	createIndicatorCanvas(text){
		const canvas = document.createElement('canvas');
		canvas.width = 256;
		canvas.height = 256;
		const ctx = canvas.getContext("2d");
		ctx.save();
		
		if( text.length ){
			let tx = text.split(' ');
			let txout = [];
			while( tx.length ){
				let t = tx.shift();
				let block = txout[txout.length-1]+" "+t;
				block = block.trim();
				if( block.length > 10 )
					txout.push(t);
				else
					txout[txout.length-1] = block;
			}
			let longest = 0;
			for( let t of txout ){
				if( t.length > longest )
					longest = t.length;
			}
			let len = Math.max(0, longest-10);

			for( let i=0; i<txout.length; ++i ){
				tx = txout[txout.length-1-i];
				let fontSize = 40-len*3;
				ctx.font = fontSize+"px Arial";
				ctx.strokeStyle = "white";
				ctx.textAlign = "center";
				ctx.lineWidth = 2;
				ctx.fillStyle = "black";
				ctx.strokeText(tx,canvas.width/2, canvas.height/2-fontSize*(i+1));
				ctx.fillText(tx,canvas.width/2, canvas.height/2-fontSize*(i+1));
				ctx.restore();
			}
			
		}
		
		ctx.beginPath();
		ctx.moveTo(canvas.width/2-20, canvas.height/2-20);
		ctx.lineTo(canvas.width/2+20, canvas.height/2-20);
		ctx.lineTo(canvas.width/2,canvas.height/2-5);
		ctx.closePath();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 4;
		ctx.fillStyle = "black";
		ctx.stroke();
		ctx.fill();
		return canvas;
	}

	createIndicatorForMesh(label, text, mesh, scale = 1){

		let map = new THREE.CanvasTexture(this.createIndicatorCanvas(text));
		if( text === '_OUT_' )
			map = LibMaterial.library.Sprites.ExitBadge.fetch().map;
		else if( text === '_LOCKED_' )
			map = LibMaterial.library.Sprites.LockedBadge.fetch().map;

		let material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true, alphaTest:0.5 } );
		let sprite = new THREE.Sprite( material );
		sprite.name = text;
		sprite.scale.set(180*scale,180*scale,1);

		if( Object.keys(mesh.userData.hoverTexts).length )
			sprite.position.copy(mesh.userData.hoverTexts[Object.keys(mesh.userData.hoverTexts).shift()].position);
		else{
			let box = new THREE.Box3().setFromObject( mesh );
			let min = box.min, max = box.max;
			let x = min.x+(max.x-min.x)/2;
			let y = box.max.y+50;
			let z = min.z+(max.z-min.z)/2;
			sprite.position.set(x,y,z);
		}
		sprite.visible = false;
		mesh.userData.hoverTexts[label] = sprite;
		mesh.add(sprite);
		return sprite;
	}

	// Sets a material property on a mesh
	setMeshMatProperty( ...args ){
		this.constructor.setMeshMatProperty(...args);
	}


}

// Sets a material property on all materials of a mesh
// if reset is true, it tries to reset to the default value if found
Stage.setMeshMatProperty = function( mesh, id, value, reset = false ){
	
	if( !mesh ){
		console.error("Unable to set material on", mesh);
		return;
	}
	let mat = mesh.material;

	if( !mat )
		return;
	if( !Array.isArray(mat) )
		mat = [mat];

	for( let m of mat ){
		let val = value;
		if( reset && m.userData.settings && m.userData.settings[id] ){
			val = m.userData.settings[id];
			if( val.clone && !(val instanceof THREE.Texture) )
				val = val.clone();
		}

		m[id] = val;
	}

};

// Adds generic hover visuals to a mesh
Stage.bindGenericHover = function( mesh ){

	const dungeonAsset = mesh.userData.dungeonAsset;
	const tooltip = dungeonAsset.getTooltipInteraction();

	let c = mesh;
	c.userData.mouseover = () => {
		Stage.setMeshMatProperty(c, 'emissive', new THREE.Color(0x222222));
		Stage.setMeshMatProperty(c, 'emissiveMap', false, false);
		if( window.game ){
			game.renderer.renderer.domElement.style.cursor = "pointer";
			if( tooltip ){
				game.ui.setTooltipAtCursor(tooltip.data.text);
			}
		}
	};
	c.userData.mouseout = () => {
		Stage.setMeshMatProperty(c, 'emissive', new THREE.Color(0), true);
		Stage.setMeshMatProperty(c, 'emissiveMap', false, true);
		if( window.game ){
			game.renderer.renderer.domElement.style.cursor = "auto";
			if( tooltip ){
				game.ui.setTooltipAtCursor('');
			}
		}
	};
	
};



export {Stage};
export default WebGL;