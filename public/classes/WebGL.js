/*
	This is the primary WebGL library
	It has a main class, and a Stage tied to it
	The main class has stuff like the base grid, base lighting and debugging
	The Stage is an object which is a reflection of a DungeonRoom
*/
import * as THREE from '../ext/THREE.js';
import {EffectComposer} from '../ext/EffectComposer.js';
import { ColorifyShader } from '../ext/ColorifyShader.js';
import { CopyShader } from '../ext/CopyShader.js';
import { FXAAShader } from '../ext/FXAAShader.js';
import { VerticalBlurShader } from '../ext/VerticalBlurShader.js';
import { HorizontalBlurShader } from '../ext/HorizontalBlurShader.js';
import { ShaderPass } from '../ext/ShaderPass.js';
import { RenderPass } from '../ext/RenderPass.js';
import {OrbitControls} from '../ext/OrbitControls.js';
import {AudioSound} from './Audio.js';
import { LibMaterial } from '../libraries/materials.js';
import {Sky} from '../ext/Sky.js';
import JDLoader from '../ext/JDLoader.min.js';
import HitFX from './HitFX.js';
import Proton from '../ext/three.proton.min.js';
import libMesh from '../libraries/meshes.js';
import stdTag from '../libraries/stdTag.js';
import Player from './Player.js';
import { DungeonRoomAsset, DungeonRoomMarker } from './Dungeon.js';
import Stats from '../ext/stats.module.js';
import Game from './Game.js';
import {GammaCorrectionShader} from '../ext/GammaCorrectionShader.js';
import { ACESFilmicToneMappingShader } from '../ext/ACESFilmicToneMappingShader.js';
import { HueSaturationShader } from '../ext/HueSaturationShader.js';


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
			shadows : localStorage.shadows === undefined ? false : Boolean(+localStorage.shadows),
			aa : localStorage.aa === undefined ? false : Boolean(+localStorage.aa),
			fps : localStorage.fps === undefined || !window.game ? false : Boolean(+localStorage.fps),
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

		// Icon renderer (such as dice roll)
		this.iconScene = new THREE.Scene();
		this.iconCam = new THREE.PerspectiveCamera( viewAngle, 1, nearClipping, farClipping);
		this.iconCam.position.z = 100; // Top down view
		this.iconCam.lookAt(new THREE.Vector3());
		this.iconRenderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
		this.iconRenderer.setPixelRatio(1);
		this.iconRenderer.setSize(813,813);
		this.iconRenderer.domElement.style = '';
		this.initIconRenderer();
		

		this.iconRendererTimer = false;
		this.iconRendererActive = true;


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
		pLight.name = 'pLight';
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

		this.stats = new Stats();
		this.stats.showPanel(0);
		document.body.appendChild(this.stats.dom);
		this.toggleFPS(conf.fps);


		this.renderer = new THREE.WebGLRenderer({});
		this.renderer.toneMapping = THREE.LinearToneMapping;
		this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

		
		if( conf.shadows ){
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		}

		// Effects
		this.composer = new EffectComposer(this.renderer);

		this.composer.addPass( new RenderPass(this.scene, this.camera) );
		
		// BLUR
		this.hblur = new ShaderPass(HorizontalBlurShader);
		this.hblur.uniforms.h.value = 0.0025;
		this.composer.addPass( this.hblur );
		this.vblur = new ShaderPass(VerticalBlurShader);
		this.vblur.uniforms.v.value = 0.0025;
		this.composer.addPass( this.vblur );

		
		
		// Red thingy when combat starts?
		this.colorShader = new ShaderPass(ColorifyShader);
		this.colorShader.uniforms.color.value = new THREE.Color(2,1,1);
		this.colorShader.enabled = false;
		this.composer.addPass(this.colorShader);
		

		

		
		this.hueSaturation = new ShaderPass(HueSaturationShader);
		this.hueSaturation.uniforms.saturation.value = 0.3;
		this.composer.addPass(this.hueSaturation);
		

		this.toneMapping = new ShaderPass(ACESFilmicToneMappingShader);
		this.composer.addPass(this.toneMapping);

		this.gammaCorrection = new ShaderPass(GammaCorrectionShader);
		this.composer.addPass(this.gammaCorrection);

		// Antialiasing
		this.aa = new ShaderPass(FXAAShader); 
		this.aa.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * window.devicePixelRatio );
		this.aa.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * window.devicePixelRatio );
		this.aa.enabled = conf.aa;
		this.composer.addPass(this.aa);

		// Copy pass
		const copypass = new ShaderPass(CopyShader);
		copypass.renderToScreen = true;
		this.composer.addPass( copypass );


		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		//this.controls = new OrbitControls(this.fxCam, this.fxRenderer.domElement);

		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.3;
		this.controls.rotateSpeed = 0.4;
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
			event.preventDefault();
			
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
		
		const mouseMove = event => this.onMouseMove(event);
		this.bind(document.body, 'mousemove', mouseMove);
		this.bind(document.body, 'touchmove', mouseMove);
		this.bind(document.body, 'touchstart', mouseMove);
		this.bind(document.body, 'touchend', mouseMove);
		
		
		// outdoor skybox
		let sky = new Sky();
		this.sky = sky;
		sky.visible = false;
		sky.scale.setScalar( 100000 );
		this.scene.add(sky);
		
		// Add Sun Helper
		const sunSphere = new THREE.Mesh(
			new THREE.SphereGeometry( 1000, 16, 8 ),
			new THREE.MeshBasicMaterial( { color: 0xffffff } )
		);
		sunSphere.visible = false;
		this.scene.add( sunSphere );
		this.sunSphere = sunSphere;
		
		this.ambientLight = new THREE.AmbientLight(0xFFFFFF);
		this.ambientLight.intensity = 2.0;
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
		light.name = 'light';
		light.position.y = 1000;
		light.position.z = 1000;
		light.castShadow = true;
		this.dirLight = light;
		this.dirLight.intensity = 4;
		this.scene.add(light);


		this.lightningLight = new THREE.AmbientLight(0xFFFFFF, 3.0*Math.PI);
		this.lightningLight.name = 'lightning';
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
		this.dungeonGroup = new THREE.Group();	// Stores the whole current dungeon 
		this.dungeonGroup.name = 'DUNGEON';
		this.scene.add(this.dungeonGroup);


		// CACHES
		// AssetCache is the full cache of items
		this.assetCache = new THREE.Group(); 
		this.assetCache.name = 'CACHE';
		this.assetCache.visible = false;

		//this.scene.add(this.assetCache);		//
		
		// currentCache stores objects used in the current dungeon
		this.currentCache = [];					// Stores the cached assets we're currently using in the active dungeon. Needed because putting an item from this.assetCache into a scene rips it out of this.assetCache. We use it this to put items back.

		this.cache_rain = 0;				// value of rain between 0 (no rain) and 1 (heavy rain) in the last cell. 
											// If this has changed on cell entry, redraw rain.

		$(window).on('resize', () => {
			this.updateSize();
		});
		this.updateSize();
		
		this._last_rc = 0;					// MS last raycast

		// Player markers
		this.playerMarkers = [];	// Holds playermarker objects, these are added on the fly and not removed. Opting instead to overwrite them on a room change

		this.render();

		// Needs to load this or fx particles will break for some reason
		this.toggleArrow(true);
		setTimeout(() => this.toggleArrow());


	}

	destructor(){

		$(window).off('resize');
		this.stage?.destructor();
		this.renderer.dispose();
		

	}

	bind( target, evt, func ){

		target.addEventListener(evt, func, {passive:true});
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

	updateSize( width, height ){
		width = width || Math.round(window.innerWidth*this.width);
		height = height || Math.round(window.innerHeight*this.height);
		
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
		this.aa.material.uniforms[ 'resolution' ].value.x = 1 / ( width * window.devicePixelRatio );
		this.aa.material.uniforms[ 'resolution' ].value.y = 1 / ( height * window.devicePixelRatio );

	}

	toggleOutdoors( outdoors ){
		
		let light = this.dirLight;
		this.sky.visible = Boolean(outdoors);
		if( !outdoors ){

			light.position.x = 0;
			light.position.y = 1000;
			light.position.z = 100;

			let color = new THREE.Color();
			color.r = color.g = color.b = .5;
			if( this.stage && this.stage.room.getDirLight() ){

				color.set(this.stage.room.getDirLight());

			}
			this.dirLight.color.copy(color);

		}

	}

	setOutdoorTime( hours ){

		this.updateFog( hours );

		// Clock should start at 0.75 because 0.0 is morning
		hours = hours/24 - 0.25;
		if( hours < 0 )
			hours += 1.0;
		
		const daytime = 1.0/24*10;	// 06-16
		if( hours < daytime )
			hours = Math.sin(hours*Math.PI*1.2)*.4;
		else
			hours = Math.cos(hours*Math.PI/1.2 + Math.PI/2 + Math.PI/6)*.6+1;

		const inclination = 0;

		let azimuth = hours;

		const sky = this.sky;
		const distance = 100000;
		const uniforms = sky.material.uniforms;
		uniforms.turbidity.value = 1;
		uniforms.rayleigh.value = 0.6;

		uniforms.mieCoefficient.value = 0.05;
		uniforms.mieDirectionalG.value = 0.9;

		const theta = Math.PI * ( inclination - 0.5 );
		const phi = 2 * Math.PI * ( azimuth - 0.5 );

		const position = uniforms.sunPosition.value;
		
		position.x = distance * Math.cos( phi );
		position.y = distance * Math.sin( phi ) * Math.sin( theta );
		position.z = distance * Math.sin( phi ) * Math.cos( theta );


		this.dirLight.position.copy( position ).normalize().multiplyScalar(CAM_DIST);
		if( hours > 0.5 ){
			this.dirLight.position.y = -this.dirLight.position.y;
		}

		this.sunSphere.position.copy( position );
		//this.dirLightHelper.update();

		
		
	}

	toggleFPS( on ){
		this.stats.dom.classList.toggle('hidden', !on);
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
			this.updateFog( game.getHoursOfDay() );

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

	// Updates fog and saturation
	updateFog( currentHour ){

		
		const rain = window.game ? game.getRain() : 0;
		this.scene.fog.density = !rain ? this.stage.room.getFog() || 0.0001 : this.stage.room.getFog() + 0.0001+rain*0.0008;
		
		this.hueSaturation.uniforms.saturation.value = this.stage.room.getSaturation()-1.0;

		if( this.stage.room.outdoors ){

			let swatches = [
				[10,20,50],
				[20,40,100],
				[20,40,100],
				[20,40,100],
				[20,40,100],
				[10,20,50],
				[50,40,8],
				[118,124,130],
				[150,150,176],
				[161,190,196],
				[175,203,208],
				[186,213,217],
				[195,221,224],
				[195,221,224],
				[195,221,224],
				[195,221,224],
				[195,221,224],
				[195,221,224],
				[213,218,220],
				[183,190,150],
				[144,110,40],
				[100,80,30],
				[0,0,0],
				[10,20,50]
			];


			const 
				nextHour = currentHour+1 >= 24 ? currentHour-Math.floor(currentHour) : currentHour+1,
				percBetween = currentHour-Math.floor(currentHour)
			;


			const a = swatches[Math.floor(currentHour)], b = swatches[Math.floor(nextHour)];
			this.scene.fog.color.r =  ((b[0]-a[0])*percBetween+a[0])/255;
			this.scene.fog.color.g = ((b[1]-a[1])*percBetween+a[1])/255;
			this.scene.fog.color.b = ((b[2]-a[2])*percBetween+a[2])/255;

		

			this.dirLight.color.r = this.scene.fog.color.r;
			this.dirLight.color.g = this.scene.fog.color.g;
			this.dirLight.color.b = this.scene.fog.color.b;

		}
		else{

			// Use fog from ambient light, or white
			let color = new THREE.Color(0xFFFFFF);
			if( this.stage.room && this.stage.room.getDirLight() )
				color.set(this.stage.room.getDirLight());
			this.scene.fog.color.copy(color);

		}
		

	}

	/* Main */
	render(){
		
		requestAnimationFrame( () => this.render() );

		this.stats.begin();
		this.execRender();
		this.stats.end();

	}

	// Scene rendering function - This is where the magic happens
	execRender(){

		const time = Date.now();
		let delta = this.clock.getDelta();
		TWEEN.update();
		if( this.stage && !this._loadingRoom )
			this.stage.render(delta);

		this.proton.update();
		this.fx_proton.update();
		if( this.arrowVisible )
			this.updateArrow();
		this.fxRenderer.render( this.fxScene, this.fxCam );

		
		// RC runs at 30 FPS
		if( time-this._last_rc > 33 && (!window.game || game === true || !game.ui.visible) && this.stage && this.stage.group ){

			const intersecting = [];	// Meshes being raycasted onto


			this._last_rc = time;
			this.raycaster.setFromCamera( this.mouse, this.camera );
			
			const meshes = 
				this.stage.group.children.filter(el => !el.userData.dungeonAsset?.room)
				.concat(this.playerMarkers.filter(el => el))
			;
			let objCache = [];

			let intersects = this.raycaster.intersectObjects( meshes, true )
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

					if(!(el && el.object && el.object.visible && el.object.userData && typeof el.object.userData.mouseover === "function"))
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

			this.intersecting = intersecting;


		}
		
		if( this.iconRendererActive )
			this.iconRenderer.render(this.iconScene, this.iconCam);

		this.playerMarkerFrame();
		

		if( this.onRender )
			this.onRender();

		
		if( USE_FX )
			this.composer.render();
		else
			this.renderer.render( this.scene, this.camera);

	}

	// User data that sh ould be scrubbed when putting back into global cache
	scrubUserData( mesh ){

		// They may have a few userdata thigs that must be scrubbed.
		const ud = mesh.userData;
		// Hovertexts must be forcefully deleted from memory
		if( ud.hoverTexts ){

			for( let i in ud.hoverTexts ){
				
				const text = ud.hoverTexts[i];
				this.destroyModel(mesh);
				mesh.remove(text);

			}
		}

		delete ud.hoverTexts;
		delete ud.dungeonAsset;

	}
	
	// Returns all items from this.currentCache to this.assetCache
	returnCurrentCache(){

		// Move all assets from the dungeon cache to full cache
		this.currentCache.map(mesh => {
			
			this.scrubUserData(mesh);
			this.cacheModel(mesh);

		});
		this.currentCache = [];

	}

	// Dungeon stage cache
	async loadActiveDungeon(){

		if( DISABLE_DUNGEON )
			return;

		if( !game.dungeon )
			return;
		
			
		// Already loading hold your horses
		if( this.loading ){
			this.load_after_load = true;
			return false;
		}

		this.clearPlayerMarkers();
				
		this.loading = true;

		// Destroy all items
		this.stages.map(s => {

			s.destructor();
			this.destroyStageAssets(s); // Note: This makes sure any assets that should be returned to the cache are done so before deleting the rest.

		});

		this.stages = [];

		game.ui.toggleLoadingBar(game.dungeon.rooms.length);

		// Checks the max amount of non-unique meshes needed in each cell.
		let i = 0;
		for( let room of game.dungeon.rooms ){
			
			let stage = new Stage( room, this );
			this.stages.push(stage);
			this.dungeonGroup.add(stage.group);

			await stage.preload(true); // Loads meshes
			//this.execRender( true );
			stage.toggle(false);

			game.setRoomsLoaded(++i);
			game.dungeon.onRoomLoaded(room);
			if( this.load_after_load )
				break;

		}

		

			
		this.loading = false;
		this.cache_active_room = -1;
		this.drawActiveRoom();

		// Cancel
		if( this.load_after_load ){
			this.load_after_load = false;
			return this.loadActiveDungeon();
		}

		
		
		this.dungeonGroup.add(this.stage.group);
		/* Can put stuff here to do when the loading is finished */

		this.updatePlayerMarkers();
	
		this.pruneCache();	// Prune after a load

		game.dungeon.onLoaded();

	}

	async drawActiveRoom(){

		if( this.loading )
			return;

		let room = game.dungeon.getActiveRoom();
		let roomChanged = room.id !== this.cache_active_room;
		let pre = this.stage;
		this._loadingRoom = true; // Pause the renderer

		// Turn the current room off first, since it returns the cache
		if( pre && roomChanged )
			pre.toggle(false);

		for( let r of this.stages ){

			if( !r.room )
				console.error("R doesnt' have a room", r, "Stages", this.stages);

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

			this.stage.toggle(true);
			this.roomEnterCameraTween();

		}
		this.updateFog( game.getHoursOfDay() );
		
		this._loadingRoom = false;

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


	/* Icon renderer */
	async initIconRenderer(){
		
		const scene = this.iconScene;
		this.iconLight = new THREE.DirectionalLight();
		this.iconLight.name = 'pLight';
		this.iconLight.position.z = 200;
		this.iconLight.position.y = -50;
		this.iconLight.position.x = -50;
		this.iconLight.lookAt(new THREE.Vector3());
		scene.add(this.iconLight);

		const icons = {};
		this.iconScene.userData.icons = icons;
		
		// Import stuff
		const dice = await this.getAssetFromCache( new DungeonRoomAsset({
			model : 'Generic.Shapes.UiD20',
		}), true);
		icons.d20 = dice;
		dice.scale.set(200,200,200);
		dice.rotation.set(-0.15,-Math.PI/10,0);
		dice.userData.startRot = new THREE.Euler().copy(dice.rotation);
		this.iconScene.add(dice);

		dice.traverse(el => {
			if( el.isMesh ){
				el.userData.emissive = new THREE.Color().copy(el.material.emissive);
			}
		});

		this.resetIconRenderer();

	}

	resizeIconRenderer( el ){

		const size = el.getBoundingClientRect();
		this.iconRenderer.setSize(size.width, size.width);

	}

	resetIconRenderer(){
		
		this.iconRendererActive = false;
		for( let i in this.iconScene.userData.icons ){
			this.iconScene.userData.icons[i].visible = false;
		}

	}

	iconDiceRollStart(){

		this.iconRendererActive = true; // start rendering
		const dice = this.iconScene.userData.icons.d20;
		dice.visible = true;
		
		dice.traverse(el => {
			if( el.isMesh ){
				el.material.emissive.set(el.userData.emissive);
			}
		});

		console.log(dice.rotation);
		let start = new THREE.Vector3();
		start.setFromEuler(dice.rotation);
		let dir = new THREE.Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1);
		dir['xyz'.charAt(Math.floor(Math.random()*3))] = 0;
		dir = dir.normalize().multiplyScalar(Math.PI*2);
		dir.add(start);
		dice.userData?.rotationTween?.stop();
		dice.userData?.returnTween?.stop();
		dice.userData.rotationTween = new TWEEN.Tween(start)
			.to(dir, 250)
			.repeat(Infinity)
			.onUpdate(() => {
				dice.rotation.setFromVector3(start);
			})
			.start()
		;
	}
	iconDiceRollStop(){
		
		const dice = this.iconScene.userData.icons.d20;
		
		dice.userData?.rotationTween?.stop();
		dice.userData?.returnTween?.stop();
		const start = new THREE.Vector3().setFromEuler(dice.rotation);
		const end = new THREE.Vector3().setFromEuler(dice.userData.startRot);
		dice.userData.returnTween = new TWEEN.Tween(start)
			.to(end, 400)
			.easing(TWEEN.Easing.Bounce.Out)
			.onUpdate(() => {
				dice.rotation.setFromVector3(start);
			})
			.start()
		;

	}
	iconDiceRollTransform( color ){

		const dice = this.iconScene.userData.icons.d20;

		dice.userData?.scaleTween?.stop();
		
		const startSize = new THREE.Vector3(200,200,200);
		const editing = startSize.clone();
		const stopSize = new THREE.Vector3(1,1,1);

		dice.userData.scaleTween = new TWEEN.Tween(editing)
			.to(stopSize, 300)
			.easing(TWEEN.Easing.Circular.In)
			.onUpdate(() => {
				dice.scale.copy(editing);
			})
			.chain(
				new TWEEN.Tween(editing)
				.onStart(() => {
					dice.traverse(el => {
						if( el.isMesh ){
							el.material.emissive.set(color);
						}
					});
				})
				.to(startSize, 400)
				.easing(TWEEN.Easing.Bounce.Out)
				.onUpdate(() => {
					dice.scale.copy(editing);
				})
			)
			.start();

		;

	}


	/* CACHE */
	// Gets an asset from cache, or creates a new one if necessary
	async getAssetFromCache( asset, unique ){

		if( !(asset instanceof DungeonRoomAsset) )
			throw 'Trying to load non DungeonAsset';

		const path = asset.model;

		// Try to find this in cache, no caching allowed for editor
		if( !unique && window.game ){
			
			for( let asset of this.assetCache.children ){

				// Not checking current_cache works because THREE rips the asset out of there when added to the scene
				// But if you start doing this in parallel you'll need to start checking for current_cache
				if( path !== asset.userData._c_path )
					continue;

				// Put this item on the current dungeon cache
				this.currentCache.push(asset);
				// return the cached asset
				return asset;

			}
			
		}

		// Not found or unique
		const model = asset.getModel();
		const out = await model.flatten(unique);

		// Add to both caches unless unique
		// THREE automatically pulls it out of the cache when used
		if( !unique )
			this.cacheModel(out, path);
		else
			out.userData.__UNIQUE__ = true;

		return out;

	}

	destroyStageAssets( stage ){

		this.returnCurrentCache(); // makes sure we don't bust anything that's cached

		if( !(stage instanceof Stage) )
			throw 'Trying to destroy nonstage';

		for( let asset of stage.group.children )		
				this.destroyModel(asset);


	}

	// removes a model entirely from memory
	destroyModel( model ){

		if( !model )
			return;

		model.traverse(el => {

			if( !el.isMesh )
				return;

			if( el.userData.particles )
				el.userData.particles.map(p => p.destroy());
			// Materials are always unique. Geometries and textures are always shared.
			// textures have an exception where ._dispose can be set to force dispose it
			// This should be enough to prevent memory leaks
			toArray(model.material)
				.map(mat => {

					for( let i in el ){

						let sub = el[i];
						if( sub && (Array.isArray(sub) || sub.isTexture) ){
	
							sub = toArray(sub);
							for( let tx of sub ){
	
								if( tx && tx.isTexture && tx._dispose )
									tx.dispose();
	
							}
	
						}
	
					}
					
					mat.dispose();
				});
			

		});

	}

	cacheModel( model, path ){

		if( path )
			model.userData._c_path = path;
		else if( !model.userData._c_path ){
			console.error("Path missing from model", model);
			return;	// Can't cache items without a path
		}

		this.assetCache.add(model);
		this.currentCache.push(model);

	}

	pruneCache(){

		const cache_level = Math.max(10, (parseInt(localStorage.cache_level) || 100))*10;
		const children = this.assetCache.children;
		while( children.length > cache_level ){
			
			this.assetCache.remove(children[children.length-1]);
			this.destroyModel(children[children.length]);

		}

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
		const obj = await libMesh().Generic.Marker.Player.flatten(true);
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
		obj.name = 'MARKER';

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

	onMarkerLoad( marker ){

		if( marker.userData.marker.tween )
			marker.userData.marker.tween.stop();

		const targ = marker.userData.marker.dungeonAsset.y;
		const pos = {y : targ + 100};
		marker.userData.marker.tween = new TWEEN.Tween(pos).to({y:targ}, 300).easing(TWEEN.Easing.Bounce.Out)
		.onUpdate(() => {
			marker.position.y = pos.y;
		})
		//.onComplete(() => this.arrowTween.tween=null)
		.start();

		marker.visible = true;

	}

	// Attach a player to a marker from cache. This also updates.
	// If marker is empty, we'll have to create a new one and add it to cache.
	async attachPlayerToMarker( player, dungeonAsset, marker ){

		if( !dungeonAsset )
			return;

		if( !marker )
			marker = await this.createPlayerMarker();

		// Gonna have to rebuild some stuff
		// Need to use ID because of netgame
		if( 
			!marker.userData.marker.player || 
			marker.userData.marker.player.id !== player.id || 
			!marker.userData.marker.dungeonAsset ||
			marker.userData.marker.dungeonAsset.id !== dungeonAsset.id 
		){

			marker.userData.marker.player = player;
			marker.userData.marker.dungeonAsset = dungeonAsset;
			marker.visible = false;

			// Position
			marker.position.set(dungeonAsset.x, dungeonAsset.y, dungeonAsset.z);
			marker.scale.set(dungeonAsset.scaleX, dungeonAsset.scaleY, dungeonAsset.scaleZ);

			delete marker.userData.baseScale;
			

			// Canvas
			// Texture URL has changed
			const iconCanvas = await player.getActiveIcon();

			const canvas = marker.userData.marker.texture;
			const context = canvas.getContext('2d');
			this.constructor.drawCover(context, iconCanvas, canvas.height, canvas.width, undefined, undefined, 1.33);
			this.onMarkerLoad(marker);
			marker.material[0].map.needsUpdate = true;
			
			const ring = marker.material[2];
			ring.color.set(player.color);
			ring.color.r = Math.pow(ring.color.r, 3);
			ring.color.g = Math.pow(ring.color.g, 3);
			ring.color.b = Math.pow(ring.color.b, 3);
			marker.material[2].emissive.set(0.1,0.1,0.1);

		}		

		marker.material[0].color.set(player.isDead() ? 0xFF1111 : 0xFFFFFF); 

		if( !marker.visible )
			this.onMarkerLoad(marker);

	}

	// Prevents you from running the _updatePlayerMarkers multiple times, always wait until the previous one finishes before launching the next
	async updatePlayerMarkers(){

		if( this._updating_markers ){
			this._update_next_markers = true;
			return;
		}
		this._updating_markers = true;

		await this._updatePlayerMarkers();

		this._updating_markers = false;

		if( this._update_next_markers ){
			this._update_next_markers = false;
			this.updatePlayerMarkers();
		}

	}

	async _updatePlayerMarkers(){

		if( !window.game || this.loading || game.dungeon.transporting )
			return;

		// Viable marker positions
		const room = game.dungeon.getActiveRoom();
		if( !room )
			return;
			
		const generics = room.getGenericMarkers();

		let markerIndex = 0;	// Tracks what marker to add to
		const players = game.getEnabledPlayers();
		let needStateSave = false;

		const promises = [];

		for( let player of players ){
			
			// Draw only enemies that are generated. Friendly NPCs are technically enemies.
			if( !player.generated || player.team === Player.TEAM_PLAYER )
				continue;

			// First try to see if we've stored a marker for this player by id
			let marker = room.getStoredPlayerMarkerAsDungeonRoomAsset(player.id);

			// Try to get a specific marker for this label if it exists
			if( !marker ){
				marker = room.getPlayerMarker(player.label);
			}

			// Didn't exist, try getting a generic one
			if( !marker ){

				// No free generic markers, skip this. Maybe later add an error for the developer?
				if( !generics.length ){
					console.error("No generics free for", player, "did you forget to add player markers here?", room, room.getGenericMarkers(), room.assets.slice());
					continue;
				}

				marker = generics.shift();
				room.storePlayerMarker(player.id, {x:marker.x, y:marker.y, z:marker.z}, marker.scaleY);
				needStateSave = true;

			}

			promises.push(
				this.attachPlayerToMarker(player, marker, this.playerMarkers[markerIndex])
			);
			++markerIndex;
			//debugger;

		}

		await Promise.all(promises);

		if( needStateSave )
			game.dungeon.roomModified(room);

		
		// Hide unused markers
		for( ; markerIndex < this.playerMarkers.length; ++markerIndex ){
			if( this.playerMarkers[markerIndex] )
				this.playerMarkers[markerIndex].visible = false;
		}
		

	}







	/* EVENTS */
	onMouseMove( event, debug ){

		const now = Date.now();
		if( this.__lastMove && now - this.__lastMove < 33 )
			return;

		this.__lastMove = now;

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
		event.preventDefault();
		for( let obj of this.intersecting ){
			
			if( obj.userData && typeof obj.userData.dblclick === "function" ){
				
				if( obj.userData.dblclick.call(obj, obj) )
					break;

			}
			
		}

	}

	onMouseClick( event ){
		event.preventDefault();
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

		// No auto rebase in editor, so disable cloning
		if( window.game )
			visObj = visObj.clone(this);

		if( !Array.isArray(recipients) )
			recipients = [recipients];

		for( let recipient of recipients )
			visObj.run(caster, recipient, armor_slot, mute, recipients.length);
		
		if( global && game.is_host ){
			Game.net.dmHitfx(caster, recipients, visObj, armor_slot);
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

	raycastScreenPosition( x, y, width, height ){
		
		if( !width )
			width = window.innerWidth;
		if( !height )
			height = window.innerHeight;
		const vec = new THREE.Vector2( x, y);
		vec.x = ( x / width ) * 2 - 1;
		vec.y = - ( y / height ) * 2 + 1;
		const out = this.raycastArrow(vec);
		return out;

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
			geo.applyMatrix4( new THREE.Matrix4().makeTranslation( 0, -4, 0 ) );

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
		let asset = room.getRoomAsset()._stage_mesh;


		const box = new THREE.Vector3(), 
			b = new THREE.Box3().setFromObject(asset);
			b.getSize(box);

		const max = Math.max(box.x, box.y, box.z);
		let posY = max*1.2, 
			posZ = max*.6;

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
		this.controls.target.y = game.dungeon.getActiveRoom().outdoors ? 0 : 100;
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
		this.group.name = room.name || 'ROOM'+room.index;
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
		this.toggle(false);
		this.parent.dungeonGroup.remove(this.group);
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

		// Should be handled by Dungeon since players won't be updated until after the room has loaded
		//this.parent.updatePlayerMarkers();

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

		this.removeAllParticleSystems();
		this.tweens = [];
		this.mixers = [];
		// Return our cached items
		this.parent.returnCurrentCache();

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

	// Raised on all meshes to check their door status and update labels
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
			if( sprite )
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
		if( window.game )
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

		if( obj.userData.template )
			obj.userData.template.onRefresh( dungeonAsset, obj );
	
		obj.visible = !dungeonAsset.isHidden();
	

	}

	// calls the onRefresh method on all meshes
	onRefresh(){

		for( let asset of this.group.children )
			this.onObjRefresh(asset);

	}

	/* Primary actions */
	// Adds from libraries/meshes.js, returns the library object that was added
	async addFromMeshLib(asset, unique){

		const obj = await this.parent.getAssetFromCache( asset, unique );
		this.add(obj);
		
		return obj;

	}

	// Adds from a dungeon asset
	async addDungeonAsset( asset, fast ){

		const unique = asset.isInteractive() || this.isEditor;
		const c = await this.addFromMeshLib(asset, unique);
		// Scrubbing goes first
		this.parent.scrubUserData(c);

		// We always need to set some metadata here. But can skip any generative stuff.
		asset.setStageMesh(c); // needed for 

		if( !c.name )
			c.name = asset.name || asset.model;
		c.userData.dungeonAsset = asset;

		// :: PRELOAD END ::
		// This is used when preloading. We don't need to go byeond here since it gets readded on cell entry
		if( fast && !unique )
			return;
		
		
		c.userData.hoverTexts = {};

		
		// Must be done before labels are created in order for them to take rotation into consideration
		this.updatePositionByAsset( asset );
		

		// Calculate a bounding box before attaching anything to the mesh
		const bb = new THREE.Box3();
		c.traverse(el => {
			if( el.geometry )
				el.geometry.computeBoundingBox();
		});
		c.userData.boundingBox = bb;
		bb.setFromObject(c);			// Note: THREE.js bounding box calculation is BROKEN, may be fixed in a future update

		// Create labels
		// Door
		if( window.game && asset.isDoor() && !this.isEditor ){
		
			let linkedRoom = game.dungeon.getRoomByIndex(asset.getDoorTarget(true));

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

		this.onObjStart(c);

	}

	// Updates a mesh transforms by the dungeon asset
	// lets you add a rotation in radians
	updatePositionByAsset( asset ){
		
		const c = asset._stage_mesh;

		let sMulti = 1.0;
		if( c.userData.meshScale )
			sMulti = c.userData.meshScale;

		// Position it
		c.position.x = asset.x;
		c.position.y = asset.y;
		c.position.z = asset.z;
		c.rotation.x = asset.rotX;
		c.rotation.y = asset.rotY;
		c.rotation.z = asset.rotZ;
		c.scale.x = asset.scaleX*sMulti;
		c.scale.y = asset.scaleY*sMulti;
		c.scale.z = asset.scaleZ*sMulti;
	
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
			if( mesh.userData?.dungeonAsset?.id === dungeonAsset.id )
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


	// Fast is used to just make sure it's in cache. 
	async preload( fast ){

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

			// Don't add player tags, they're generated
			if( window.game && asset.hasTag(stdTag.mPLAYER_MARKER) )
				continue;

			// Don't try to do this in parallel or you'll freeze the browser
			await this.addDungeonAsset(asset, fast);
		
		}

	}

	// Primary draw method
	/* STAGE MANAGEMENT  */
	// Creates or updates a stage with room, then returns that room. If room is unset, it uses the current dungeon room 
	// Chainable
	async draw(){

		const room = this.room;

		await this.preload();

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
		
		this.onRefresh();

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

			this.parent.proton.removeEmitter(sys);
			this.particles.splice(index,1);

		}
	}
	removeAllParticleSystems(){

		for( let sys of this.particles )
			this.parent.proton.removeEmitter(sys);
		this.particles = [];

	}


	/* Animation Mixers */
	addMixersRecursive( obj ){
		
		if( obj.userData.mixer ){

			this.addMixer(obj.userData.mixer);
			let idle = obj.userData?.dungeonAsset?.idle_anim;
			if( !idle )
				idle = 'idle';
			obj.userData.playAnimation(idle);
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

				
				camera.matrixWorldInverse = new THREE.Matrix4().copy(camera.matrixWorld).invert();
				//camera.matrixWorldInverse.getInverse(  );
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
			let txout = [];	// Sets a limit of 10 characters per row
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
			if( txout.length-1 > len )
				len = txout.length-1;

			for( let i = 0; i < txout.length; ++i ){

				tx = txout[txout.length-1-i];
				let fontSize = 40-len*4;
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

	/*
		Special case labels:
		_OUT_ Exit badge
		_LOCKED_ Lock icon
	*/
	createIndicatorForMesh(label, text, mesh, scale = 1){

		
		let map = new THREE.CanvasTexture(this.createIndicatorCanvas(text));
		if( text === '_OUT_' )
			map = LibMaterial.library.Sprites.ExitBadge.fetch().map;
		else if( text === '_LOCKED_' )
			map = LibMaterial.library.Sprites.LockedBadge.fetch().map;

		let material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true, alphaTest:0.5, depthTest:false } );
		let sprite = new THREE.Sprite( material );
		sprite.renderOrder = 1;
		sprite.name = text;

		
		
		sprite.scale.set(
			180*scale,
			180*scale,
			1
		);

		
		const box = mesh.userData.boundingBox;
		let min = box.min, max = box.max;
		let x = min.x+(max.x-min.x)/2;
		let y = max.y+50;
		let z = min.z+(max.z-min.z)/2;
		sprite.position.set(x,y,z);

		sprite.visible = false;
		mesh.userData.hoverTexts[label] = sprite;
		this.parent.scene.add(sprite);
		mesh.attach(sprite);
		
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

	let mats = [];
	mesh.traverse(el => {
		if( el.material )
			mats = mats.concat(el.material);
	});

	if( !mats.length )
		return;

	for( let m of mats ){

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
				game.ui.setTooltipAtCursor(tooltip.data.text.split('\\n').join('<br />'));
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