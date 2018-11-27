import {default as WebGL, Stage} from '../classes/WebGL.js';
import {default as libMeshes, LibMesh} from '../libraries/meshes.js';
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/96/three.module.js';
import TransformControls from '../ext/TransformControls.js';
import Mod from '../classes/Mod.js';
import GameLib from '../classes/GameLib.js';
import MAIN_MOD from '../libraries/_main_mod.js';
import Modal from '../classes/Modal.js';
import stdTag from '../libraries/stdTag.js';
import Asset from '../classes/Asset.js';

export default class Modtools{

	constructor(){
		
		this.content = $("#content");
		this.backButton = $("#gameIcons div[data-id=back]");
		this.renderer = new WebGL({
			width:window.innerWidth, 
			height:window.innerHeight,
			fullControls : true,
			enableGrid : true
		});
		this.mod = new Mod();
		this.main_mod = MAIN_MOD;
		this.modal = new Modal();

		this.datalists = $("#datalists");

		this.searchTimer = null;								// Timer for searching in tables

		this.searchFilters = {};
		try{
			this.searchFilters = JSON.parse(localStorage.devSearchFilters);
		}catch(err){ this.searchFilters = {}; }
		
		window.addEventListener("hashchange", () => this.navigate(), false);

		this.navigate();

	}

	async navigate(){
		let hash = window.location.hash.substr(1).trim().split('/');
		if( !hash[0] )
			hash = [];
		let mod = hash[0];

		let mods = await Mod.getAll();

		for( let m of mods ){
			if( m.id === mod ){
				this.mod = m;
				this.drawModMenu();
				return;
			}
		}
		
		this.drawModSelect();
		
	}

	setPage( hash ){
		window.location.hash = hash;
		this.navigate();
	}

	refreshDataLists(){

		let tagFullSel = '', 
			tagTtSel = '',
			soundKits = '',
			conditions = ''
		;
		for( let t in stdTag ){
			const tag = stdTag[t];
			const opt = '<option value="'+tag+'" />';
			if( t.substr(0,2) === 'tt' )
				tagTtSel += opt;
			tagFullSel += opt;
		}

		const kits = glib.getFull('AudioKit');
		for( let kit in kits )
			soundKits += '<option value="'+esc(kit)+'" />';

		const conds = glib.getFull('Condition');
		for( let cond in conds )
			conditions += '<option value="'+esc(cond)+'">';
		
		this.datalists.html(
			'<datalist id="tagsFull"><select>'+tagFullSel+'</select></datalist>'+
			'<datalist id="tagsTT"><select>'+tagTtSel+'</select></datalist>'+
			'<datalist id="soundKits"><select>'+soundKits+'</select></datalist>'+
			'<datalist id="conditions"><select>'+conditions+'</select></datalist>'
		);

	}

	getSearchFilter( type, field ){
		if( !this.searchFilters[type] )
			return '';
		if( !this.searchFilters[type][field] )
			return '';
		return this.searchFilters[type][field];
	}

	setSearchFilter( type, field, val ){
		if( !this.searchFilters[type] )
			this.searchFilters[type] = {};
		this.searchFilters[type][field] = val;
		localStorage.devSearchFilters = JSON.stringify(this.searchFilters);
	}

	// Mod selection
	async drawModSelect(){

		this.backButton.hide();
		let html = '<h1>Select mod to edit</h1>';
		
		let mods = await Mod.getAll();

		html += '<div class="newMod"><input type="button" value="New Mod" id="newMod" /><input type="button" value="Clone Official" id="cloneOfficial" /></div>';
		
		html += '<h3>Installed Mods</h3>';
		html += '<table id="modList" class="editor clickable"><tr>'+
				'<th>Name</th>'+
				'<th>ID</th>'+
				'<th>Actions</th>'+
				'<th>Templ.</th>'+
				'<th>Assets</th>'+
				'<th>Audio</th>'+
				'<th>Cond.</th>'+
				'<th>Dungeon</th>'+
				'<th>Effect</th>'+
				'<th>Classes</th>'+
				'<th>Quests</th>'+
				'<th>Texts</th>'+
				'<th>Wrappers</th>'+
			'</tr>';

		for( let mod of mods ){
			html += '<tr data-mod="'+esc(mod.id)+'">'+
				'<td><strong>'+esc(mod.name)+'</strong></td>'+
				'<td>'+esc(mod.id)+'</td>'+
				'<td>'+mod.actions.length+'</td>'+
				'<td>'+
					mod.assetTemplates.length+'a, '+
					mod.dungeonRoomTemplates.length+'dr, '+
					mod.dungeonTemplates.length+'d, '+
					mod.playerTemplates.length+'p, '+
					mod.materialTemplates.length+'m'+
				'</td>'+
				'<td>'+mod.assets.length+'</td>'+
				'<td>'+mod.audiokits.length+'</td>'+
				'<td>'+mod.conditions.length+'</td>'+
				'<td>'+mod.dungeons.length+'</td>'+
				'<td>'+mod.effects.length+'</td>'+
				'<td>'+mod.playerClasses.length+'</td>'+
				'<td>'+mod.quests.length+'</td>'+
				'<td>'+mod.texts.length+'</td>'+
				'<td>'+mod.wrappers.length+'</td>'+
			'</tr>';
		}

		html += '</table>';

		this.content.html(html);

		let th = this;
		$("#modList tr[data-mod]").on('click', function(){
			const id = $(this).attr('data-mod');
			for( let mod of mods ){
				if( mod.id === id ){
					th.setPage(mod.id);
					return;
				}
			}
		});

		$("#newMod").on('click', () => {

			console.log("Creating new mod");

		});
		$("#cloneOfficial").on('click', async () => {

			glib = new GameLib();
			this.mod = this.main_mod.clone();
			this.mod.g_resetID();
			this.mod.name = 'New Main Clone';
			await this.mod.save();
			this.setPage(this.mod.id);

		});

	}

	// mod main menu
	async drawModMenu(){

		this.backButton.show().on('click', () => this.setPage(""));

		glib.loadMods([this.main_mod, this.mod]);
		this.refreshDataLists();
		let mod = this.mod;

		let html = '<h1>Editing '+esc(mod.name)+'</h1>';
		html += '<div id="modGenericInfo" class="flexTwoColumns">'+
			'<div class="left"><form id="genericSettings">'+
				'Name: <input type="text" name="name" value="'+esc(mod.name)+'" /> '+
				'Authors: <input type="text" name="author" value="'+esc(mod.author)+'" /><br />'+
				'Description:<br />'+
				'<textarea name="description">'+esc(mod.description)+'</textarea><br />'+
				'<input type="submit" value="Save" />'+
			'</form></div>'+
			'<div class="right">'+
				'<input type="button" value="Export File" id="exportFile" /> '+
				'<input type="button" value="Export Screen" id="exportScreen" />'+
			'</div>'+
		'</div>';
		html += '<hr />';

		html += '<div class="buttons modButtons">'+
			'<div class="button" data-id="texts">Texts</div>'+
			'<div class="button" data-id="conditions">Conditions</div>'+
			'<div class="button" data-id="quests">Quests</div>'+
			'<div class="button" data-id="dungeons">Dungeons</div>'+
			'<div class="button" data-id="playerClasses">Classes</div>'+
			'<div class="button" data-id="action">Action</div>'+
			'<div class="button" data-id="wrappers">Wrappers</div>'+
			'<div class="button" data-id="effects">Effects</div>'+
			'<div class="button" data-id="assets">Assets</div>'+
			'<div class="button" data-id="playerTemplates">Player Templates</div>'+
			'<div class="button" data-id="assetTemplates">Asset Templates</div>'+
			'<div class="button" data-id="dungeonTemplates">Dungeon Templates</div>'+
			'<div class="button" data-id="dungeonRoomTemplates">Room Templates</div>'+
			'<div class="button" data-id="materialTemplates">Material Templates</div>'+
			'<div class="button" data-id="audiokits">Audio Kits</div>'+
		'</div>';

		html += '<div class="assetList"></div>';

		this.content.html(html);

		const th = this;
		$("#modGenericInfo").on('submit', function(){
			const el = $(this);
			mod.name = name = $("input[name=name]", el).val().trim();
			mod.author = $("input[name=author]", el).val().trim();
			mod.description = $("textarea[name=description]", el).val().trim();
			
			$("input[type=submit]", el).val('Saving...');
			mod.save().then(() => {
				$("input[type=submit]", el).val('Saved!');
			});
			return false;
		});

		

		$("#exportFile").on('click', () => {
			const file = new Blob([JSON.stringify(mod.getSaveData())], {type: 'text/plain'}); 
 
			const a = document.createElement("a"),
                url = URL.createObjectURL(file);
			a.href = url;
			a.download = mod.name+'.json';
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 0); 
		});
		$("#exportScreen").on('click', () => {
			this.modal.set('<textarea style="width:100%;height:100%">'+esc(JSON.stringify(mod.getSaveData()))+'</textarea>');
		});

		const assetList = $("div.assetList");
		$("div.modButtons div.button[data-id]").on('click', function(){
			const id = $(this).attr('data-id');
			if( typeof th['mml_'+id] === 'function' ){
				th['mml_'+id](assetList);
				
			}
		});
		this.mml_texts(assetList);

	}


	// Makes a table.editor.searchable searchable
	mmlMakeSearchable( sfType = '' ){

		const header = $("table.editor.searchable");
		const topRow = $("tr:first", header);
		const elements = $("> th", topRow);
		const numElements = elements.length;

		let html = '<tr class="search">';
		for( let i=0; i<numElements; ++i ){
			html += '<td contenteditable>'+(this.getSearchFilter(sfType, $(elements[i]).text().trim()))+'</td>';
		}
		html += '</tr>';
		topRow.after(html);
		
		let th = this;
		$("tr.search td", header).on('input', function(){
			clearTimeout(th.searchTimer);
			th.searchTimer = setTimeout(() => {
				th.mmlPerformSearch( sfType );
			}, 500);
		});

		this.mmlPerformSearch( sfType );

	}

	mmlPerformSearch( sfType ){
		const searchable = [];
		$("table.editor.searchable tr.search td").each((v,el) => searchable.push($(el).text().trim().toLowerCase()));
		$("table.editor.searchable th").each((index,el) => {
			this.setSearchFilter( sfType, $(el).text().trim(), searchable[index] );
		});
		
		$("table.editor.searchable tr[data-index]").each((v,el) => {

			const tds = $('> td', el);
			let i = 0;
			for( let td of tds ){

				// Accept all here
				const searchFor = searchable[i++];
				if( !searchFor )
					continue;
				
				// search here
				const text = $(td).text().toLowerCase().trim();
				if( text.indexOf(searchFor) === -1 ){
					$(el).hide();
					return;
				}
					
			}

			$(el).show();

		});

	}

	// ModMenuList Helpers for above
	mml_texts(wrapper){

		let texts = this.mod.texts;
		const sfType = 'texts';

		let html = '<br /><h3>Texts</h3><table class="editor listing clickable textEditor searchable">';
			html += '<tr>';
				html += '<th>Text</th>';
				html += '<th>Conditions</th>';
				html += '<th>turnTags</th>';
				html += '<th>armor_slot</th>';
				html += '<th>Audio</th>';
				html += '<th>aAuto</th>';
				html += '<th>nTarg</th>';
				html += '<th>aOut</th>';
				html += '<th>Debug</th>';
			html += '</tr>';

		let i = 0;
		for( let text of texts ){

			// This can be removed later, it's legacy
			if( text.soundkits ){
				text.audiokits = text.soundkits;
				delete text.soundkits;
			}
			if( !Array.isArray(text.audiokits) )
				text.audiokits = [text.audiokits];

			html += '<tr data-index="'+(i++)+'">';

				html += '<td>'+esc(text.text)+'</td>';
				html += '<td>'+text.conditions.map(el => typeof el === "string" ? esc(el) : 'Custom').join(', ')+'</td>';
				html += '<td>'+(text.turnTags ? text.turnTags.map(el => esc(el)) : '')+'</td>';	
				html += '<td>'+(text.armor_slot ? esc(text.armor_slot) : '')+'</td>';
				html += '<td>'+(text.audiokits ? text.audiokits.map(el => typeof el === "string" ? esc(el) : 'Custom') : '')+'</td>';
				html += '<td>'+(text.alwaysAuto ? 'X' : '')+'</td>';
				html += '<td>'+(isNaN(text.numTargets) ? 1 : +text.numTargets)+'</td>';
				html += '<td>'+(text.alwaysOutput ? 'X' : '')+'</td>';
				html += '<td>'+(text.debug ? 'X' : '')+'</td>';

			html += '</tr>';

		}

		html += '</table>';


		wrapper.html(html);
		this.mmlMakeSearchable(sfType);

		let th = this;
		$("table.textEditor tr[data-index]").on('click', function(){
			const index = +$(this).attr('data-index');
			const text = texts[index];

			let html = '<form id="assetForm">';
				html += 'Text: <input type="text" name="text" value="'+esc(text.text)+'" /><br />';
				html += 'Nr Players: <input type="number" min=1 step=1 name="numTargets" value="'+(+text.numTargets || 1)+'" /><br />';
				html += 'Conditions: '+th.formConditions(text.conditions)+'<br />';
				html += 'TextTags: '+th.formTags(text.turnTags, 'turnTags', 'tagsTT')+'<br />';
				html += 'Armor Slot: '+th.formArmorSlot(text.armor_slot)+'<br />';
				html += 'Audio: '+th.formSoundKits(text.audiokits)+'<br />';
				html += '<span title="Always output this text even if DM mode is enabled">Always Auto</span>: <input type="checkbox" value="1" name="alwaysAuto" '+(text.alwaysAuto ? 'checked' : '')+' /><br />';
				html += '<span title="Status texts are grouped and output after an action text is output. This bypasses that.">Always Out</span>: <input type="checkbox" value="1" name="alwaysOutput" '+(text.alwaysOutput ? 'checked' : '')+' /><br />';
				html += '<span title="Outputs debugging info when this text conditions are checked">Debug</span>: <input type="checkbox" value="1" name="debug" '+(text.debug ? 'checked' : '')+' /><br />';

				html += '<input type="submit" value="Save" />';
				html += '<input type="button" value="Save Copy" />';
				html += '<input type="button" value="Delete" />';
			html += '</form>';

			th.modal.set(html);
			th.bindFormHelpers();

			$("#assetForm").on('submit', () => {

				const form = $("#assetForm");
				text.text = $("input[name=text]", form).val();
				text.numTargets = +$("input[name=numTargets]", form).val();
				text.alwaysAuto = $("input[name=alwaysAuto]", form).is(':checked');
				text.alwaysOutput = $("input[name=alwaysOutput]", form).is(':checked');
				text.debug = $("input[name=debug]", form).is(':checked');
				text.turnTags = th.compileTags();
				text.armor_slot = th.compileArmorSlot();
				text.audiokits = th.compileSoundKits();
				

				console.log("assetForm onSubmit", text);
				return false;
			});

		});

	}

	mml_conditions(wrapper){

	}

	mml_quests(wrapper){

	}

	mml_dungeons(wrapper){

	}
	mml_playerClasses(wrapper){

	}
	mml_action(wrapper){

	}
	mml_wrappers(wrapper){

	}
	mml_effects(wrapper){

	}
	mml_assets(wrapper){

	}
	mml_playerTemplates(wrapper){

	}
	mml_assetTemplates(wrapper){

	}
	mml_dungeonTemplates(wrapper){

	}
	mml_dungeonRoomTemplates(wrapper){

	}
	mml_materialTemplates(wrapper){

	}
	mml_audiokits(wrapper){

	}





	// FORM HELPERS
	bindFormHelpers(){
		this.bindTags();
		this.bindSoundKits();
		this.bindConditions();
	}

	// Tags (bindable)
	bindTags(){
		let th = this;
		$("#assetForm input.addTagHere").off('click').on('click', function(){
			const dList = $(this).parent().attr('data-list');
			$(this).parent().append(th.inputTags("", dList));
		});
	}

	inputTags( tag = '', dataList = 'tagsFull' ){
		return '<input type="text" name="tag" value="'+esc(tag)+'" list="'+dataList+'" />';
	}

	// Compiles text tags into an array
	compileTags( cName ){
		const base = $('#assetForm div.'+cName+' input[name=tag]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	formTags( tags = [], cName = '', dataList = 'tagsFull' ){
		let out = '<div class="'+cName+'" data-list="'+dataList+'">';
		out += '<input type="button" class="addTagHere" value="Add Tag" />';
		for( let tag of tags )
			out+= this.inputTags(tag, dataList);
		out += '</div>';
		return out;
	}





	// CONDITIONS (Bindable)
	bindConditions(){
		let th = this;
		$("#assetForm div.condPanel span").off('click')
			.on('click', function(event){
				const el = $(this);
				if( el.hasClass('add') ){
					el.parent().parent().append(th.inputConditions(""));
				}
				else if( el.hasClass('addAnd') ){
					el.parent().parent().append(th.formConditions([{}], 'subConditions', false));
				}
				else if( el.hasClass('addOr') ){
					el.parent().parent().append(th.formConditions([{}], 'subConditions', true));
				}
				else if( el.hasClass('convertToAnd') ){
					
				}
				else if( el.hasClass('convertToOr') ){
					
				}
				
				th.bindConditions();
				//
			});

			$("#assetForm div.condWrapper.subConditions, #assetForm div.condWrapper > input[name=condition]").off('click').on('click', function(event){
				if( !event.ctrlKey )
					return;
				event.stopImmediatePropagation();
				$(this).remove();
				return false;
			});
	}

	compileConditions( cName = 'conditions' ){
		const base = $('#assetForm div.'+cName+' input[name=condition]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	inputConditions( cond = '' ){
		
		if( typeof cond !== 'string' )
			cond = JSON.stringify(cond);
		return '<input type="text" name="condition" value="'+esc(cond)+'" list="conditions" />';

	}

	formGetHeaders( isRoot = false, isOr = false ){
		let out = '';
		out += '<div class="condPanel">'+
			'<span class="add">+</span> '+
			'<span class="addAnd">+AND</span> '+
			'<span class="addOr">+OR</span>'+
			(!isRoot ? 
				' | '+
				'<span class="convertToAnd '+(!isOr ? 'hlt' : '')+'">AND</span>'+
				'<span class="convertToOr '+(isOr ? 'hlt' : '')+'">OR</span>' 
			: '')+
		'</div>';
		return out;
	}

	formConditions( conds = [], cName = 'conditions', isOr = false ){

		// TODO:
		/*
			Needs to be able to handle sub-conditions and arrays
			Convert arrays to objects
		*/
		console.log("Getting formConditions", conds);
		let out = '<div class="condWrapper '+cName+'">';
		out+= this.formGetHeaders(true, isOr);
		for( let cond of conds ){
			if( Array.isArray(cond) )
				cond = {conditions:cond};
			if( Array.isArray(cond.conditions) && cond.conditions.length ){
				out += this.formConditions(cond.conditions, 'subConditions');
			}
			else
				out+= this.inputConditions(cond);
		}
		out += '</div>';
		return out;

	}

	

	// ARMOR SLOTS - NO BIND
	compileArmorSlot(){
		const base = $('#assetForm select[name=armorSlot]');
		return base.val();
	}

	formArmorSlot( slot ){
		let out = '<select name="armorSlot">';
		for( let t in Asset.Slots )
			out += '<option value="'+Asset.Slots[t]+'" '+(slot === t ? 'selected' : '')+'>'+t+'</option>';
		out += '</select>';
		return out;
	}



	// SOUND KITS (Bindable)
	bindSoundKits(){
		let th = this;
		$("#assetForm input.addSoundKitHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputSoundKit(""));
			});
	}

	compileSoundKits( cName = 'soundKits' ){
		const base = $('#assetForm div.'+cName+' input[name=soundKit]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	inputSoundKit( kit = '' ){
		return '<input type="text" name="soundKit" value="'+esc(kit)+'" list="soundKits" />';
	}

	formSoundKits( kits = [], cName = 'soundKits' ){
		
		console.log("kits", kits);
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addSoundKitHere" value="Add SoundKit" />';
		for( let kit of kits )
			out+= this.inputSoundKit(kit);
		out += '</div>';
		return out;

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