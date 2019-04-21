/*
	This is the primary WebGL library
	It has a main class, and a Stage tied to it
	The main class has stuff like the base grid, base lighting and debugging
	The Stage is an object which is a reflection of a DungeonRoom
*/
import * as THREE from '../ext/THREE.js';
import {default as EffectComposer, ShaderPass, RenderPass, HorizontalBlurShader, VerticalBlurShader, CopyShader, ColorifyShader} from '../ext/EffectComposer.js';
import OrbitControls from '../ext/OrbitControls.js';
import {AudioSound} from './Audio.js';
import { LibMaterial } from '../libraries/materials.js';
import Sky from '../ext/Sky.js';
import JDLoader from '../ext/JDLoader.min.js';
import HitFX from './HitFX.js';

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
			aa : localStorage.antialiasing === undefined ? true : !!localStorage.antialiasing,
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


		this.fxScene = new THREE.Scene();
		this.fxCam = new THREE.PerspectiveCamera( viewAngle, width/height, nearClipping, farClipping);
		this.fxCam.position.z = 100;
		this.fxCam.position.y = -10;
		this.fxCam.lookAt(new THREE.Vector3());
		this.fxRenderer = new THREE.WebGLRenderer({alpha:true});
		this.fxRenderer.setPixelRatio(1);
		this.fxRenderer.shadowMap.enabled = true;
		this.fxRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.fxParticles = [];		// Particle groups
		
		
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
		this.toggleArrow(false);

		const chelper = new THREE.CameraHelper(pLight.shadow.camera);
		//this.fxScene.add(chelper);


		this.renderer = new THREE.WebGLRenderer({
			antialias : conf.aa,
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

		/*
		this.aa = new SMAAPass(window.innerWidth*this.renderer.getPixelRatio(), window.innerHeight*this.renderer.getPixelRatio());
		this.aa.enabled = conf.aa;
		this.composer.addPass(this.aa);
		*/
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

		// These are the props
		this.stage = null;					// Current stage object
		this.stages = [];					// Stores all stages for a dungeon
		this.cache_dungeon = null;			// ID of active dungeon
		this.cache_active_room = null;		// ID of active room for room detection

		$(window).off('resize').on('resize', () => {
			this.updateSize();
		});
		this.updateSize();
		

		this.render();


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

		for( let f of this.fxParticles )
			f.tick(delta);
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
				obj.object.userData.mouseover.call(obj, obj);
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

		if( this.onRender )
			this.onRender();

		this.intersecting = intersecting;

		
		this.controls.update();

		if( USE_FX && window.game )
			this.composer.render();
		else
			this.renderer.render( this.scene, this.camera);
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
		
		
		this.loading = true;
		this.stages.map(s => s.destructor());
		this.stages = [];
		this.cache_dungeon = game.dungeon.id;
		for( let room of game.dungeon.rooms ){
			let stage = new Stage( room, this );
			this.stages.push(stage);
			this.scene.add(stage.group);
			await stage.draw();
			this.execRender( true );
			stage.toggle(false);
			if( this.load_after_load )
				break;
		}

		this.loading = false;

		this.cache_active_room = -1;
		this.drawActiveRoom();
		if( this.load_after_load ){
			this.load_after_load = false;
			return this.loadActiveDungeon();
		}

		

	}

	async drawActiveRoom(){

		if( this.loading )
			return;

		let room = game.dungeon.getActiveRoom();
		let roomChanged = room.id !== this.cache_active_room;
		let pre = this.stage;

		for( let r of this.stages ){
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
	}

	resetStage( replace ){

		if( this.stage )
			this.stage.destructor();
	
		if( this.precache_stage ){
			this.scene.remove(this.precache_stage);
			this.precache_stage = null;
		}
		let stage = replace;
		if( !stage )
			stage = new Stage(undefined, this);
		this.stage = stage;
		this.stage.group.position.y = 0;
		this.scene.add(stage.group);

	}

	setPrecacheStage( stage ){
		this.removePrecacheStage();
	}

	removePrecacheStage(){
		if( this.precache_stage ){
			this.scene.remove(this.precache_stage);
		}
	}

	// Adds an object to the stage, can be chained
	add( mesh ){
		this.stage.add(mesh);
		return this;
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
	playFX( caster, recipients, visual, armor_slot, global = false ){

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
			visObj.run(caster, recipient, armor_slot);
		
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
		this.room = room;
	}
	destructor(){
		this.onTurnOff();
		if( this.parent && this.parent.scene )
			this.parent.scene.remove(this.group);
	}

	toggle( on ){
		this.enabled = on;
		if( !on )
			this.onTurnOff();
		else
			this.onTurnOn();
		this.group.visible = !!on;
	}

	onTurnOn(){
		for( let obj of this.group.children )
			this.onObjStart(obj);

		if( this.room && this.room.outdoors ){
			this.parent.toggleOutdoors(true);
			this.parent.setOutdoorTime(15);
		}
		else
			this.parent.toggleOutdoors(false);
	}

	onTurnOff(){
		this.stopAllSounds();
		for( let tween of this.tweens )
			this.removeTween(tween);
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
		if( typeof obj.userData.template.onStagePlaced === "function" )
			obj.userData.template.onStagePlaced(dungeonAsset, obj);

		this.addTweensRecursive(obj);
		this.addParticlesRecursive(obj);
		this.addMixersRecursive(obj);
		this.addWaterRecursive(obj);
		this.addSoundLoopsRecursive(obj);
		


		if( dungeonAsset ){

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
			
			dungeonAsset.updateInteractivity();
		}

		if( typeof obj.userData.template.afterStagePlaced === "function" )
			obj.userData.template.afterStagePlaced(dungeonAsset, obj);

	}


	onDoorRefresh( c ){

		let asset = c.userData.dungeonAsset;
		let linkedRoom = !this.isEditor ? game.dungeon.rooms[asset.getDoorTarget()] : false;
		//let tagAlwaysVisible = (asset.isExit() && !asset.isLocked() &&) || (linkedRoom && (linkedRoom.index === game.dungeon.previous_room || !linkedRoom.discovered || linkedRoom.index === asset.parent.parent_index));
		let tagAlwaysVisible = false;

		let sprites = c.userData.hoverTexts;
		for( let i in sprites )
			sprites[i].visible = false;


		let sprite = sprites.bearing;
		if( sprite )
			sprite.material.opacity = 1;
		
		if( asset.isExit() ){
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

		if( sprite && asset.isLocked() )
			sprite.material.opacity = 0;
		
		if( linkedRoom && linkedRoom.index === game.dungeon.previous_room ){

			if( game.battle_active ){
				sprite = sprites.run;
				tagAlwaysVisible = true;
			}
			else if( sprites.back ){
				sprites.back.visible = true;
				sprites.back.opacity = 1;
			}
		}

		if( linkedRoom && linkedRoom.index === asset.parent.parent_index && !game.battle_active && !asset.getDoorInteraction().data.no_exit ){
			tagAlwaysVisible = true;
			sprite = sprites.out;
			sprite.material.opacity = 1;
		}

		if( sprite ){
			sprite.visible = true;

			// Fade tween (Needed for the tags)
			let tweenVal = {i:1};
			c.userData.tween = new TWEEN.Tween(tweenVal).to({i:0}, 250).easing(TWEEN.Easing.Sinusoidal.Out).onUpdate(obj => {

				if( !tagAlwaysVisible )
					sprite.material.opacity = obj.i;
				let intensity = Math.floor(0x22*obj.i);
				this.setMeshMatProperty(c, 'emissive', new THREE.Color((intensity<<16)|(intensity<<8)|intensity));

			}).onComplete(() => {
				this.setMeshMatProperty(c, 'emissive', new THREE.Color(0), true);
			});
			c.userData.mouseover = () => {
				c.userData.tween.stop();

				if( !tagAlwaysVisible ){
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


	onObjRefresh( obj ){

		let dungeonAsset = obj.userData.dungeonAsset;

		// Update the room tags
		if( dungeonAsset.isDoor() )
			this.onDoorRefresh(obj);

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
	async addDungeonAsset(asset){

		const room = this.room;
		const roomAsset = room.getRoomAsset();
		let roomModel;
		if( roomAsset )
			roomModel = roomAsset.getModel();

		const libEntry = asset.getModel();
		const attachmentIndexes = asset.attachments;
		if( !libEntry.flatten )
			console.error("Found invalid model in asset", asset);
		const c = await this.addFromMeshLib(libEntry, attachmentIndexes, asset.isInteractive() || this.isEditor);

		let meshTemplate = asset.getModel();			// Library entry
		c.userData.dungeonAsset = asset;
		c.userData.hoverTexts = {};
		asset._stage_mesh = c;
		if( !c.name )
			c.name = asset.name || asset.model;

		// Create labels
		// Door
		if( asset.isDoor() && !this.isEditor ){
		
			
			let linkedRoom = game.dungeon.rooms[asset.getDoorTarget()];
			if( asset.isExit() && !asset.name ){
				this.createIndicatorForMesh('exit', 'Exit', c);
			}
			else{
				if( !linkedRoom && !asset.name )
					console.error("Required linked room missing, ", linkedRoom);
				this.createIndicatorForMesh('run', "Run", c);
				this.createIndicatorForMesh('back', "", c);
				this.createIndicatorForMesh('out', "_OUT_", c, 0.4);
				const name = asset.name ? asset.name : room.getBearingLabel(room.getAdjacentBearing( linkedRoom ));
				this.createIndicatorForMesh('bearing', name, c);
			}
		
		}


		
		// Position it
		if( asset.absolute ){
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
		else{
			//console.debug("Adding", asset, "x", asset.x, "y", asset.y, "rotatedWidth", asset.getRotatedWidth(), "rotatedHeight", asset.getRotatedHeight());
			let width = asset.getRotatedWidth(), height = asset.getRotatedHeight();
			let x = asset.x*100, y = asset.y * 100;
			if( !asset.isRoom() ){
				if( width > 2 )
					x += Math.floor((width-1)/2)*100;
				if( height > 2 )
					y += Math.floor((height-1)/2)*100;
				if( width%2 )
					x -= 50;
				if( height%2 )
					y -= 50;
			}

			c.position.x = x;
			c.position.z = y;
			c.rotation.y = -asset.rotZ/360*Math.PI*2;

			// Handle wall insets
			if( roomModel && roomModel.wall_indentation && meshTemplate.use_wall_indentation ){
				let coords = room.getBearingCoords(Math.floor(asset.rotZ/90));
				c.position.x += coords[0]*roomModel.wall_indentation*meshTemplate.wall_indentation;
				c.position.z += coords[1]*roomModel.wall_indentation*meshTemplate.wall_indentation;
			}
		}

		this.onObjStart(c);

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

		for( let psys of this.particles )
			psys.tick( delta );
		
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


	// Returns a mesh based on DungeonAsset in stage. If stage is unset, it uses the current stage
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

		let room = this.room;

		// Add assets
		for( let asset of room.assets ){

			let existing = this.findAsset( asset );
			if( existing ){
				// In the netcode, the tied in dungeonAsset may change, so we'll have to reset it
				if( !game.is_host ){
					asset._stage_mesh = existing;
					existing.userData.dungeonAsset = asset;
				}
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
		this.particles.push(sys);
	}
	removeParticleSystem(sys){
		let index = this.particles.indexOf(tween);
		if( ~index )
			this.particles.splice(index,1);
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
		if( text === '_OUT_' ){
			map = LibMaterial.library.Sprites.ExitBadge.fetch().map;
		}
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
	
	let mat = mesh.material;
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

	let c = mesh;
	c.userData.mouseover = () => {
		Stage.setMeshMatProperty(c, 'emissive', new THREE.Color(0x222222));
		Stage.setMeshMatProperty(c, 'emissiveMap', false, false);
		if( game )
			game.renderer.renderer.domElement.style.cursor = "pointer";
	};
	c.userData.mouseout = () => {
		Stage.setMeshMatProperty(c, 'emissive', new THREE.Color(0), true);
		Stage.setMeshMatProperty(c, 'emissiveMap', false, true);
		if( game )
			game.renderer.renderer.domElement.style.cursor = "auto";
	};
	
};



export {Stage};
export default WebGL;