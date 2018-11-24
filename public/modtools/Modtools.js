import {default as WebGL, Stage} from '../classes/WebGL.js';
import {default as libMeshes, LibMesh} from '../libraries/meshes.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/96/three.module.js';
import TransformControls from '../ext/TransformControls.js';
import Mod from '../classes/Mod.js';

export default class Modtools{

	constructor(){
		
		this.content = $("#content");
		this.renderer = new WebGL({
			width:window.innerWidth, 
			height:window.innerHeight,
			fullControls : true,
			enableGrid : true
		});
		this.mod = new Mod();

		this.drawModSelect();

	}


	// Mod selection
	async drawModSelect(){

		let html = '<h1>Select mod to edit</h1>';
		
		let games = await Mod.getNames();
		console.log("Mods", games);
		
		this.content.html(html);

	}


	// ModAssetSelect
	drawModAssetSelect(){

	}



}

/*
		let active_model, active_mesh;

		window.onload = () => {

			
			let drawChilds = function(){

				let out = '';
				for( let child of active_mesh.children ){
					if( !child.userData.EDITOR_PATH )
						continue;
					out += '<br />new LibMeshAttachment({';
					out += 
						`path:"${child.userData.EDITOR_PATH}",`+
						'position:new THREE.Vector3('+Math.round(child.position.x*100)/100+','+Math.round(child.position.y*100)/100+','+Math.round(child.position.z*100)/100+'),'+
						'rotation:new THREE.Vector3('+Math.round(child.rotation.x*1000)/10000+','+Math.round(child.rotation.y*10000)/10000+','+Math.round(child.rotation.z*10000)/10000+'),'+
						'scale:new THREE.Vector3('+Math.round(child.scale.x*100)/100+','+Math.round(child.scale.y*100)/100+','+Math.round(child.scale.z*100)/100+'),'
					;
					out += '}),';
				}
				$("#children").html(out); 
			};

			let control = new TransformControls( renderer.camera, renderer.renderer.domElement, () => {
				drawChilds();
			});
			control.setTranslationSnap(1);
			control.setRotationSnap(THREE.Math.degToRad(1));
			
			control.addEventListener( 'dragging-changed', function( event ){
				renderer.controls.enabled = !event.value;
			});
			renderer.scene.add(control);
			renderer.onRender = function(){
				control.update();
			};

			window.addEventListener('keydown', event => {
				if( event.key === "w" )
					control.setMode( "translate" );
				else if( event.key === "e" )
					control.setMode( "rotate" );
				else if( event.key === "r" )
					control.setMode( "scale" );
			});

			


			// Updates the active mesh
			let drawMesh = async function( load_model ){

				$("#anims").html("");
				renderer.resetStage();
				renderer.stage.enabled = true;
				console.log("Adding to stage", load_model);
				renderer.stage.addFromMeshLib(load_model).then(model => {

					// Model changed before promise resolved
					if( active_model !== load_model )
						return;

					renderer.stage.onObjStart(model);
					console.log("Starting", model);

					active_mesh = model;
					control.detach();

					for( let child of model.children ){
						if( child.userData && child.userData.EDITOR_DRAGGABLE ){
							child.userData.mouseover = () => {
								Stage.setMeshMatProperty(child, 'emissive', new THREE.Color(0x222222));
								renderer.renderer.domElement.style.cursor = "pointer";
							};
							child.userData.mouseout = () => {
								Stage.setMeshMatProperty(child, 'emissive', new THREE.Color(0));
								renderer.renderer.domElement.style.cursor = "auto";
							};
							child.userData.click = () => {
								control.detach();
								control.attach(child);
							};
						}
					}
					//control.attach(model);
					drawChilds();

					let out = '';
					if( model.type === "SkinnedMesh" ){
						
						let anims = model.geometry.animations;
						for( let anim of anims )
							out += '<input type="button" value="'+esc(anim.name)+'" />';

					}

					// Interacts
					if( model.userData.template.onInteract )
						out += '<input type="button" value="onInteract" />';

					$("#anims").html(out);
					$("#anims > input").on('click', function(){
						let val = $(this).val();
						if( val === 'onInteract' )
							active_model.onInteract.call(active_model, active_mesh);
						else
							active_mesh.userData.playAnimation($(this).val());
					});
					
				});
			};

			// Updates the select boxes
			let updateSelects = function(index){
				let path = [];
				$("#meshControls select").each(function(i){
					if(i > index)
						$(this).remove();
					else
						path.push($(this).val()[0]);
				});

				let meshes = libMeshes;
				let basePath = [];
				let i = "";
				for( i of path )
					meshes = meshes[i];
				
				// Draw the mesh
				if( meshes.constructor === LibMesh ){

					active_model = meshes;
					drawMesh(active_model);

				}
				// Draw a selector
				else{
					let select = '<select multiple name="'+path.length+'">';
					for( let m in meshes ){
						let obj = meshes[m];
						select += '<option value="'+m+'">'+(obj.constructor === LibMesh ? '[M] ' : '') + m+'</option>';
					}
					select += '</select>';
					select = $(select);
					$("#meshControls").append(select);


					select.on('change', function(){
						updateSelects(path.length);
					});
				}
				
				localStorage.meshEditorPath = JSON.stringify(path);

			}

			document.getElementById("meshCanvas").appendChild(renderer.renderer.domElement);
			let out = '';
			for( let i in libMeshes )
				out += '<option value="'+i+'">'+i+'</option>';
			$("#meshToTest").html(out);
			$("#meshToTest").on('change', function(){
				updateSelects(0);
			});

			let path = [];
			try{
				path = JSON.parse(localStorage.meshEditorPath);	
			}catch(err){path = ["Dungeon"];}

			for( let i in path ){
				let p = path[i];
				let el = $("#meshToTest");
				if( +i )
					el = $("select[name='"+i+"']");
				el.val(p);
				updateSelects(+i);
			}

			renderer.start();
			

		};	
*/