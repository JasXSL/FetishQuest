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
import Player from '../classes/Player.js';
import GameEvent from '../classes/GameEvent.js';
import Text from '../classes/Text.js';
import Generic from '../classes/helpers/Generic.js';
import Condition from '../classes/Condition.js';
import Action from '../classes/Action.js';
import { Wrapper, Effect } from '../classes/EffectSys.js';
import PlayerTemplate from '../classes/templates/PlayerTemplate.js';
import AssetTemplate, { MaterialTemplate } from '../classes/templates/AssetTemplate.js';
import { default as DungeonTemplate, RoomTemplate } from '../classes/templates/DungeonTemplate.js';
import { AudioKit } from '../classes/Audio.js';
import Dungeon, { DungeonRoom, DungeonRoomAsset, DungeonEncounter, DungeonRoomAssetInteraction } from '../classes/Dungeon.js';

const meshLib = LibMesh.getFlatLib();


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
		const renderer = this.renderer;
		const control = new TransformControls( renderer.camera, renderer.renderer.domElement, () => {});
		this.control = control;
		control.setTranslationSnap(1);
		control.setRotationSnap(THREE.Math.degToRad(1));
		control.addEventListener( 'dragging-changed', function( event ){
			renderer.controls.enabled = !event.value;
		});
		let controlTimer = null;
		control.addEventListener( 'objectChange', event => {
			clearTimeout(controlTimer);
			controlTimer = setTimeout(() => {
				const mesh = event.target.object;
				if( !mesh )
					return;
				const dungeonAsset = mesh.userData.dungeonAsset;
				dungeonAsset.absolute = true;
				dungeonAsset.x = Math.round(mesh.position.x*100)/100;
				dungeonAsset.y = Math.round(mesh.position.y*100)/100;
				dungeonAsset.z = Math.round(mesh.position.z*100)/100;
				dungeonAsset.scaleX = Math.round(mesh.scale.x*100)/100;
				dungeonAsset.scaleY = Math.round(mesh.scale.y*100)/100;
				dungeonAsset.scaleZ = Math.round(mesh.scale.z*100)/100;
				dungeonAsset.rotX = Math.round(mesh.rotation.x*100)/100;
				dungeonAsset.rotY = Math.round(mesh.rotation.y*100)/100;
				dungeonAsset.rotZ = Math.round(mesh.rotation.z*100)/100;
				if( this.onControlChanged )
					this.onControlChanged(event);
			}, 100);
		});

		this.onControlChanged = null;	// lets you bind a change function to the 3d editor transform controls

		renderer.controls.saveState();

		renderer.scene.add(control);
		renderer.onRender = function(){
			control.update();
		};


		// Transform controls
		$(window).on('keydown', event => {
			if( event.target !== document.body )
				return;
			if( event.key === "w" )
				control.setMode( "translate" );
			else if( event.key === "e" )
				control.setMode( "rotate" );
			else if( event.key === "r" )
				control.setMode( "scale" );
			else if( event.key === "z" ){
				this.renderer.controls.reset();
			}
			else if( event.key === "q" )
				control.setSpace( control.space === "local" ? "world" : "local" );
			
			else if( event.key === "s" && event.ctrlKey ){
				if( typeof this.fnQuickSave === "function" )
					this.fnQuickSave();
				event.preventDefault();
			}
			else if( event.key === "l" && event.ctrlKey ){
				if( typeof this.fnQuickLoad === "function" )
					this.fnQuickLoad();
				event.preventDefault();
			}

			else if( event.key === 'Control' ){
				control.setTranslationSnap( 100 );
				control.setRotationSnap( THREE.Math.degToRad( 15 ) );
			}
			
		});

		$(window).on('keyup',  event => {

			if( event.key === 'Control' ){
				control.setTranslationSnap( null );
				control.setRotationSnap( null );
			}

		});
		
		this.mod = new Mod();
		this.main_mod = MAIN_MOD;
		this.modal = new Modal();

		// Used by the editor quicksave function
		this.fnQuickSave = undefined;
		this.fnQuickLoad = undefined;
		this.modal._onModalClose = () => {
			this.fnQuickSave = undefined;
			this.fnQuickLoad = undefined;
		};

		this.datalists = $("#datalists");

		this.searchTimer = null;								// Timer for searching in tables

		this.searchFilters = {};
		try{
			this.searchFilters = JSON.parse(localStorage.devSearchFilters);
		}catch(err){ this.searchFilters = {}; }
		
		window.addEventListener("hashchange", () => this.navigate(), false);


		// Helpers for dungeon editor
		this.dungeon_active_room = null;		// DungeonRoom
		this.dungeon_active_asset = null;		// DungeonRoomAsset


		$("#jsonEditor, #jsonEditor div.buttons > input.cancel").on('click', () => {
			$("#jsonEditor").toggleClass("hidden", true);
		});
		$("#jsonEditor > div").on('click', event => {
			event.stopImmediatePropagation();
		});
		$("#jsonEditor div.buttons > input.validate").off('click').on('click', () => {
			try{
				const area = $("#jsonEditor textarea");
				let t = JSON.parse(area.val());
				area.val(JSON.stringify(t, null, 3));
			}catch(err){
				alert(err);
			}
		});

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
			conditions = '',
			actions = '',
			wrappers = '',
			effects = '',
			materialTemplates = '',
			assetTemplates = '',
			classes = '',
			assets = '',
			roomTemplates = '',
			playerTemplates = '',
			encounters = '',
			players = ''
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
			conditions += '<option value="'+esc(cond)+'"/>';
		
		const actionLib = glib.getFull('Action');
		for( let action in actionLib )
			actions += '<option value="'+esc(action)+'"/>';

		const wrapperLib = glib.getFull('Wrapper');
		for( let wrapper in wrapperLib )
			wrappers += '<option value="'+esc(wrapper)+'"/>';

		const effectLib = glib.getFull('Effect');
		for( let effect in effectLib )
			effects += '<option value="'+esc(effect)+'"/>';

		const matLib = glib.getFull('MaterialTemplate');
		for( let i in matLib )
			materialTemplates += '<option value="'+esc(i)+'"/>';

		const assetTempLib = glib.getFull('AssetTemplate');
		for( let i in assetTempLib )
			assetTemplates += '<option value="'+esc(i)+'"/>';
		
		const classLib = glib.getFull('PlayerClass');
		for( let i in classLib )
			classes += '<option value="'+esc(i)+'"/>';

		const assetLib = glib.getFull('Asset');
		for( let i in assetLib )
			assets += '<option value="'+esc(i)+'"/>';

		const roomTempLib = glib.getFull('RoomTemplate');
		for( let i in roomTempLib )
			roomTemplates += '<option value="'+esc(i)+'"/>';
		
		const playerTempLib = glib.getFull('PlayerTemplate');
		for( let i in playerTempLib )
			playerTemplates += '<option value="'+esc(i)+'"/>';

		const encounterLib = glib.getFull('DungeonEncounter');
		for( let i in encounterLib )
			encounters += '<option value="'+esc(i)+'"/>';
		const playerLib = glib.getFull('Player');
		for( let i in playerLib )
			players += '<option value="'+esc(i)+'"/>';

		this.datalists.html(
			'<datalist id="tagsFull"><select>'+tagFullSel+'</select></datalist>'+
			'<datalist id="tagsTT"><select>'+tagTtSel+'</select></datalist>'+
			'<datalist id="soundKits"><select>'+soundKits+'</select></datalist>'+
			'<datalist id="conditions"><select>'+conditions+'</select></datalist>'+
			'<datalist id="actions"><select>'+actions+'</select></datalist>'+
			'<datalist id="wrappers"><select>'+wrappers+'</select></datalist>'+
			'<datalist id="effects"><select>'+effects+'</select></datalist>'+
			'<datalist id="materialTemplates"><select>'+materialTemplates+'</select></datalist>'+
			'<datalist id="assetTemplates"><select>'+assetTemplates+'</select></datalist>'+
			'<datalist id="classes"><select>'+classes+'</select></datalist>'+
			'<datalist id="assets"><select>'+assets+'</select></datalist>'+
			'<datalist id="roomTemplates"><select>'+roomTemplates+'</select></datalist>'+
			'<datalist id="playerTemplates"><select>'+playerTemplates+'</select></datalist>'+
			'<datalist id="encounters"><select>'+encounters+'</select></datalist>'+
			'<datalist id="players"><select>'+players+'</select></datalist>'
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
				'<td>'+(mod.audiokits ? mod.audiokits.length : 0)+'</td>'+
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

		$("#newMod").on('click', async () => {

			glib = new GameLib();
			this.mod = new Mod({
				name : 'Unnamed Mod'
			});
			await this.mod.save();
			this.setPage(this.mod.id);

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
		const mod = this.mod;

		let html = '<h1>Editing '+esc(mod.name)+'</h1>';
		html += '<div id="modGenericInfo" class="flexTwoColumns">'+
			'<div class="left"><form id="genericSettings">'+
				'Name: <input type="text" name="name" value="'+esc(mod.name)+'" /> '+
				'Authors: <input type="text" name="author" value="'+esc(mod.author)+'" /><br />'+
				'Description:<br />'+
				'<textarea name="description">'+esc(mod.description)+'</textarea><br />'+
				'<input type="submit" value="Save" />'+
				'<input type="button" value="Copy" id="cloneMod" />'+
				'<input type="button" value="Delete" id="deleteMod" />'+
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
			'<div class="button" data-id="players">Players</div>'+
			'<div class="button" data-id="encounters">Encounters</div>'+
			'<div class="button" data-id="playerClasses">Classes</div>'+
			'<div class="button" data-id="actions">Actions</div>'+
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

		$("#deleteMod").on('click', async () => {
			if( !confirm('Are you sure you want to delete this mod? You may want to back it up first.') )
				return;
			await this.mod.delete();
			this.setPage('');
		});

		$("#cloneMod").on('click', async () => {

			glib = new GameLib();
			this.mod = this.mod.clone();
			this.mod.g_resetID();
			this.mod.name += ' [Clone]';
			await this.mod.save();
			this.setPage(this.mod.id);

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

		
		$("div.modButtons div.button[data-id]").on('click', function(){
			const id = $(this).attr('data-id');
			if( typeof th['mml_'+id] === 'function' ){
				localStorage.devMML = id;
				th['mml_'+id]();
			}
		});

		
		if( localStorage.devMML && typeof th['mml_'+localStorage.devMML] === "function" )
			this['mml_'+localStorage.devMML]();
		else
			this.mml_texts();

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






	/*
		ModMenuList Creates a searchable table
		sfType should correspond to mml_<type>
		headers is an array of table heads
		table is an array of all the assets to populate the table with
		fnAssetTds is a function that gets run on each asset and should return an array of values to put into each table cell
		fnInsert is a function that should generate a new asset for insertion
	*/
	mml_generic( sfType, headers = [], table, fnAssetTds, fnInsert ){

		const wrapper = $("div.assetList");
		let html = '<br /><h3>'+esc(sfType)+'</h3>'+
			'<input type="button" id="insertAsset" value="Insert" /><br />'+
			'<table class="editor listing clickable searchable">';
			html += '<tr>';
			for( let header of headers )
				html += '<th>'+header+'</th>';
			html += '</tr>';

		for( let i in table ){

			const asset = table[i];
			const tds = fnAssetTds(asset);
			html += '<tr data-index="'+esc(i)+'">';
			for( let td of tds )
				html += '<td>'+esc(td)+'</td>';
			html += '</tr>';

		}
		html += '</table>';


		wrapper.html(html);
		this.mmlMakeSearchable(sfType);

		// Attach the editor
		let th = this;
		$("table.editor tr[data-index]").on('click', function(){
			const index = +$(this).attr('data-index');
			const asset = table[index];
			th['editor_'+sfType](asset);
		});

		$("#insertAsset").on('click', async () => {
			
			const asset = fnInsert();
			asset.add_conditions = ['senderNotDead','targetNotDead'];
			asset.stay_conditions = ['senderNotDead','targetNotDead'];
			
			table.push(asset);
			
			this['editor_'+sfType](asset);
			await this.mod.save();
			this['mml_'+sfType]();

		});


	}



	// ModMenuList Helpers for above
	mml_texts(){

		this.mml_generic( 
			'texts', 
			['Text','Action','Weight','Conditions','TurnTags','HitSlot','Audio','aAuto','nTarg','aOut','Debug'],
			this.mod.texts,
			text => {
				// This can be removed later, it's legacy
				if( text.soundkits ){
					text.audiokits = text.soundkits;
					delete text.soundkits;
				}
				if( !Array.isArray(text.audiokits) )
					text.audiokits = [text.audiokits];

				return [
					text.text,
					Array.isArray(text.conditions) ? 
						text.conditions.map(el => {
							if( typeof el === "object" ){
								if( el.type === Condition.Types.actionLabel ){
									let data = el.data;
									if( typeof data === "string" )
										data = [data];
									if( !Array.isArray(data) )
										return false;
									return data.map(d => {
										d = d.split('_');
										if( d.shift() !== "action" )
											return false;
										return d.join('_');
									}).filter(d => d).join(', ');
								}
							}

							if( typeof el === "string" ){
								el = el.split('_');
								if(el.shift() !== "action")
									return false;
								return el.join('_');
							}

							return false;
						})
						.filter(el => el)
						.join(', ') : 
						'',
					text.weight,
					(text.conditions ? text.conditions.map(el => typeof el === "string" ? el : 'Custom').join(', ') : ''),
					(text.turnTags ? text.turnTags.map(el => el) : ''),
					(text.armor_slot ? text.armor_slot : ''),
					(text.audiokits ? text.audiokits.map(el => typeof el === "string" ? el : 'Custom') : ''),
					(text.alwaysAuto ? 'X' : ''),
					(isNaN(text.numTargets) ? 1 : +text.numTargets),
					(text.alwaysOutput ? 'X' : ''),
					(text.debug ? 'X' : ''),
				];
			},
			() => {
				return {text:"Insert your text here"};
			}
		);

	}

	mml_conditions(){

		this.mml_generic( 
			'conditions', 
			['Label','Type','IsCol.','Interac.','TargNr','Sender','Inverse','Any Player'],
			this.mod.conditions,
			asset => {
				return [
					asset.label,
					asset.type,
					(Array.isArray(asset.conditions) && asset.conditions.length ? 'X' : ''),
					(asset.data ? JSON.stringify(asset.data) : '{}'),
					(+asset.targnr ? asset.targnr : -1),
					(asset.sender ? 'X' : ''),
					(asset.inverse ? 'X' : ''),
					(asset.anyPlayer ? 'X' : ''),
				];
			},
			() => {
				let asset = new Condition({label:Generic.generateUUID().substr(0,8), type:Condition.Types.event}).save("mod");
				asset.min = 1;
				asset.max = -1;
				return asset;
			}
		);

	}

	// Todo Later (need 3d editor)
	mml_quests(){
		console.log("Todo: Quests");
	}

	mml_dungeons(){
		this.mml_generic( 
			'dungeons', 
			['Label','Name','#Rooms'],
			this.mod.dungeons,
			asset => {
				return [
					asset.label,
					asset.name,
					(Array.isArray(asset.rooms) ? asset.rooms.length : 0),
				];
			},
			() => {
				let asset = new Dungeon({label:'New Dungeon'}).save("mod");
				return asset;
			}
		);
	}

	mml_playerClasses(){
		this.mml_generic( 
			'playerClasses', 
			['Label','Name','pStat','#Actions'],
			this.mod.playerClasses,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.primaryStat,
					(Array.isArray(asset.actions) ? asset.actions.length : 0),
				];
			},
			() => {
				let asset = new Action({label:'UNKNOWN_CLASS'}).save("mod");
				return asset;
			}
		);
	}

	mml_actions(){
		this.mml_generic( 
			'actions', 
			['Label','Name','AP','MP','CT','CH','CD','Detri','Hidden','Hit','lv','maxTa','minTa','Ranged','Targ','Type'],
			this.mod.actions,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.ap,
					asset.mp,
					asset.cast_time,
					asset.charges,
					asset.cooldown,
					asset.detrimental ? 'X' : '',
					asset.hidden ? 'X' : '',
					asset.hit_chance,
					asset.level,
					asset.max_targets,
					asset.min_targets,
					asset.ranged ? 'X' : '',
					asset.target_type,
					asset.type,
				];
			},
			() => {
				let asset = new Action({label:'UNKNOWN_ACTION'}).save("mod");
				asset.show_conditions = ['inCombat'];
				return asset;
			}
		);
	}
	

	mml_wrappers(){
		this.mml_generic( 
			'wrappers', 
			['Label','Name','Description','Target',"Dur","Detr","Icon","Stacks"],
			this.mod.wrappers,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.description,
					asset.target,
					asset.duration,
					asset.detrimental ? 'X' : '',
					asset.icon,
					asset.max_stacks,
				];
			},
			() => {
				let asset = new Wrapper({label:'UNKNOWN_WRAPPER'}).save("mod");
				return asset;
			}
		);
	}

	mml_effects(){
		this.mml_generic( 
			'effects', 
			['Label','Type','Targets'],
			this.mod.effects,
			asset => {
				return [
					asset.label,
					asset.type,
					Array.isArray(asset.targets) ? asset.targets.join(', ') : '',
				];
			},
			() => {
				let asset = new Effect({label:'UNKNOWN_EFFECT'}).save("mod");
				return asset;
			}
		);
	}

	mml_assets(){
		this.mml_generic( 
			'assets', 
			['Label','Name','Lv','DurBon','Rarity','Slots','Wt'],
			this.mod.assets,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.level,
					asset.durability_bonus,
					asset.rarity,
					Array.isArray(asset.slots) ? asset.slots.join(', ') : '',
					asset.weight
				];
			},
			() => {
				let asset = new Asset({label:'UNKNOWN_ASSET'}).save("mod");
				return asset;
			}
		);
	}
	

	mml_playerTemplates(){
		this.mml_generic( 
			'playerTemplates', 
			['Label','Name','Difficulty','Species','Classes','MaxAct','MinSize','MaxSize','MinLevel','MaxLevel','Primary','Bon','SV'],
			this.mod.playerTemplates,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.difficulty,
					asset.species,
					asset.classes,
					asset.max_actions,
					asset.min_size,
					asset.max_size,
					asset.min_level,
					asset.max_level,
					typeof asset.primary_stats === "object" ? Object.entries(asset.primary_stats).map(ar => ar[0]+':'+ar[1]).join(', ') : '',
					typeof asset.bon === "object" ? Object.entries(asset.bon).map(ar => ar[0]+':'+ar[1]).join(', ') : '',
					typeof asset.sv === "object" ? Object.entries(asset.sv).map(ar => ar[0]+':'+ar[1]).join(', ') : '',
				];
			},
			() => {
				let asset = new PlayerTemplate({label:'UNKNOWN_TEMPLATE'}).save("mod");
				return asset;
			}
		);
	}
	

	mml_assetTemplates(){
		this.mml_generic( 
			'assetTemplates', 
			['Label','Name','Slots','Materials','SV','Bon','Size','Tags'],
			this.mod.assetTemplates,
			asset => {
				return [
					asset.label,
					asset.name,
					Array.isArray(asset.slots) ? asset.slots.join(', ') : '!NONE!',
					Array.isArray(asset.materials) ? asset.materials.join(', ') : '!NONE!',
					JSON.stringify(asset.svStats),
					JSON.stringify(asset.bonStats),
					asset.size,
					Array.isArray(asset.tags) ? asset.tags.join(', ') : '!NONE!',
				];
			},
			() => {
				let asset = new AssetTemplate({label:'UNKNOWN_TEMPLATE'}).save("mod");
				return asset;
			}
		);
	}

	
	mml_dungeonTemplates(){
		this.mml_generic( 
			'dungeonTemplates', 
			['Label','Rooms','Doors_Hor','Doors_Down','Doors_Up','Encounters','Consumables'],
			this.mod.dungeonTemplates,
			asset => {
				return [
					asset.label,
					Array.isArray(asset.rooms) ? asset.rooms.join(', ') : '!NONE!',
					Array.isArray(asset.doors_hor) ? asset.doors_hor.join(', ') : '!NONE!',
					Array.isArray(asset.doors_down) ? asset.doors_down.join(', ') : '!NONE!',
					Array.isArray(asset.doors_up) ? asset.doors_up.join(', ') : '!NONE!',
					Array.isArray(asset.encounters) ? asset.encounters.length : '!NONE!',
					Array.isArray(asset.consumables) ? asset.consumables.join(', ') : 'Default',					
				];
			},
			() => {
				let asset = new DungeonTemplate({label:'UNKNOWN_TEMPLATE'}).save("mod");
				return asset;
			}
		);
	}

	mml_dungeonRoomTemplates(){
		
		this.mml_generic( 
			'dungeonRoomTemplates', 
			['Label','RoomMeshes','Props','Tags','Containers','Ambiance','Volume'],
			this.mod.dungeonRoomTemplates,
			asset => {
				return [
					asset.label,
					Array.isArray(asset.basemeshes) ? asset.basemeshes.join(', ') : '!NONE!',
					Array.isArray(asset.props) ? asset.props.join(', ') : '!NONE!',
					Array.isArray(asset.tags) ? asset.tags.join(', ') : '!NONE!',
					Array.isArray(asset.containers) ? asset.containers.join(', ') : '!NONE!',
					asset.ambiance,
					+asset.ambiance_volume					
				];
			},
			() => {
				let asset = new RoomTemplate({label:'UNKNOWN_TEMPLATE'}).save("mod");
				return asset;
			}
		);
	}

	mml_materialTemplates(){
		this.mml_generic( 
			'materialTemplates', 
			['Label','Name','Tags','Weight','Lv','DurMult','statBon'],
			this.mod.materialTemplates,
			asset => {
				return [
					asset.label,
					asset.name,
					Array.isArray(asset.tags) ? asset.tags.join(', ') : '!NONE!',
					asset.weight,
					asset.level,
					asset.durability_bonus,
					//JSON.stringify(asset.svBons),
					//JSON.stringify(asset.bonBons),
					asset.stat_bonus,
				];
			},
			() => {
				let asset = new MaterialTemplate({label:'UNKNOWN_TEMPLATE'}).save("mod");
				return asset;
			}
		);
	}


	mml_audiokits(){

		this.mml_generic( 
			'audiokits', 
			['Label','Sounds','Conditions'],
			this.mod.audioKits,
			asset => {
				return [
					asset.label,
					Array.isArray(asset.sounds) ? asset.sounds.length : 0,
					Array.isArray(asset.conditions) ? asset.conditions.length : 0,
				];
			},
			() => {
				let asset = new AudioKit({label:'UNKNOWN_KIT'}).save("mod");
				return asset;
			}
		);
	}

	mml_encounters(){

		this.mml_generic( 
			'encounters', 
			['Label','#Pl','#PlTemplates', '#Wrappers'],
			this.mod.dungeonEncounters,
			asset => {
				return [
					asset.label,
					Array.isArray(asset.players) ? asset.players.length : 0,
					Array.isArray(asset.player_templates) ? asset.player_templates.length : 0,
					Array.isArray(asset.wrappers) ? asset.wrappers.length : 0,
				];
			},
			() => {
				let asset = new DungeonEncounter({label:'UNKNOWN_ENCOUNTER'}).save("mod");
				return asset;
			}
		);
	}


	mml_players(){

		this.mml_generic( 
			'players', 
			['Label','Name','Team'],
			this.mod.players,
			asset => {
				return [
					asset.label,
					asset.name,
					asset.team
				];
			},
			() => {
				let asset = new Player({label:'NEW_PLAYER'}).save("mod");
				return asset;
			}
		);

	}








	




	// EDITORS
	editor_generic( sfType, asset, library, formData, onSave ){

		let html = '<form id="assetForm">';
			html += formData;
			html += '<input type="submit" value="Save" />';
			html += '<input type="button" value="Save Copy" id="assetSaveCopy" />';
			html += '<input type="button" value="Delete" id="assetDelete" />';
		html += '</form>';

		this.modal.set(html);
		this.bindFormHelpers( false );

		const save = async () => {
			onSave(asset);
			await this.mod.save();
			this['mml_'+sfType]();
			this.modal.addNotice("SAVED!");
		};

		const load = () => {
			this.modal.addNotice("Loaded.");
			this['editor_'+sfType](asset);
		};

		$("#assetSaveCopy").on('click', async () => {
			asset = JSON.parse(JSON.stringify(asset));
			library.push(asset);
			await save(asset);
			this['editor_'+sfType](asset);
			const dom = $("#assetSaveCopy");
			dom.val("Saved!");
			setTimeout(() => dom.val("Save Copy"), 1000);
		});

		$("#assetDelete").on('click', async () => {
			if( !confirm('Are you sure you want to delete this?') )
				return;
			for( let t in library ){
				if( library[t] === asset ){
					library.splice(t, 1);
					await this.mod.save();
					this['mml_'+sfType]();
					this.modal.close();
					return;
				}
			}
		});

		$("#assetForm").on('submit', async event => {
			event.preventDefault();
			await save();
			this.modal.close();
		});

		this.fnQuickSave = save;
		this.fnQuickLoad = load;

	}

	editor_texts( text = {} ){

		// Helper function

		// Updates the display underneath the text where you can see a real world example
		const updateTextDisplay = () => {

			const attacker = new Player({
				name : 'Attacker',
				species : 'dog',
				color : '#FAA',
				tags : [stdTag.penis, stdTag.vagina, stdTag.breasts, stdTag.plBigPenis, stdTag.plBigButt, stdTag.plBigBreasts],
				assets : [
					new Asset({name:'Breastplate', slots:[Asset.Slots.upperbody], equipped:true}),
					new Asset({name:'Crotchplate', slots:[Asset.Slots.lowerbody], equipped:true}),
					new Asset({name:'Whip', slots:[Asset.Slots.hands], equipped:true}),
				]
			});
			const victim = new Player({
				name : 'Victim',
				species : 'cat',
				color : '#AFA',
				tags : [stdTag.penis, stdTag.vagina, stdTag.breasts, stdTag.plBigPenis, stdTag.plBigButt, stdTag.plBigBreasts],
				assets : [
					new Asset({name:'Leather Shirt', slots:[Asset.Slots.upperbody]}),
					new Asset({name:'Leather Thong', slots:[Asset.Slots.lowerbody]}),
					new Asset({name:'Whip', slots:[Asset.Slots.hands], equipped:true}),
				]
			});
			const converted = new Text(text);
			converted.text = $("#assetForm input[name=text]").val().trim();
			const out = converted.run( new GameEvent({
				sender : attacker,
				target : victim
			}), true );
			

			$("#textPreview").html(stylizeText(out));

		}

		let tUpdateTimer;

		let html = 'Text: <input type="text" name="text" value="'+esc(text.text)+'" style="display:block;width:100%" />';
			html += 'Preview: <span id="textPreview"></span><br /><br />';
			html += 'Nr Players: <input type="number" min=1 step=1 name="numTargets" value="'+(+text.numTargets || 1)+'" /><br />';
			html += 'Conditions: '+this.formConditions(text.conditions)+'<br />';
			html += 'Weight: <input type="range" min=1 max=10 step=1 name="weight" value="'+(+text.weight || 1)+'" /><br />';

			html += this.presetConditions({
				'HumOnHum' : ['targetNotBeast','actionHit','senderNotBeast','eventIsActionUsed'],
				'AnyOnHum' : ['targetNotBeast','actionHit','eventIsActionUsed'],
				'MonOnHum' : ['targetNotBeast','actionHit','eventIsActionUsed','senderBeast'],
				'GenAction' : ['actionHit','eventIsActionUsed'],
			});
			html += '<br />';
			html += '<br />';
			html += 'TextTags: '+this.formTags(text.turnTags, 'turnTags', 'tagsTT')+'<br />';
			html += 'Armor Slot: '+this.formArmorSlot(text.armor_slot)+'<br />';
			html += 'Audio: '+this.formSoundKits(text.audiokits)+'<br />';
			html += '<span title="Always output this text even if DM mode is enabled">Always Auto</span>: <input type="checkbox" value="1" name="alwaysAuto" '+(text.alwaysAuto ? 'checked' : '')+' /><br />';
			html += '<span title="Status texts are grouped and output after an action text is output. This bypasses that.">Always Out</span>: <input type="checkbox" value="1" name="alwaysOutput" '+(text.alwaysOutput ? 'checked' : '')+' /><br />';
			html += '<span title="Outputs debugging info when this text conditions are checked">Debug</span>: <input type="checkbox" value="1" name="debug" '+(text.debug ? 'checked' : '')+' /><br />';

		this.editor_generic('texts', text, this.mod.texts, html, saveAsset => {
			const form = $("#assetForm");
			saveAsset.text = $("input[name=text]", form).val();
			saveAsset.numTargets = +$("input[name=numTargets]", form).val();
			saveAsset.weight = +$("input[name=weight]", form).val();
			saveAsset.alwaysAuto = $("input[name=alwaysAuto]", form).is(':checked');
			saveAsset.alwaysOutput = $("input[name=alwaysOutput]", form).is(':checked');
			saveAsset.debug = $("input[name=debug]", form).is(':checked');
			saveAsset.turnTags = this.compileTags();
			saveAsset.armor_slot = this.compileArmorSlot();
			saveAsset.audiokits = this.compileSoundKits();
			saveAsset.conditions = this.compileConditions();
		});
		updateTextDisplay();

		html = '';
		html += '<hr /><h2>Legend</h2>';
		html += '<p>Texts can use special placeholders, starting with a percent sign. These will be replaced in the actual text. If a tag is in singular form (such as %Tbreast) just add an S after it to make it multiple. Ex: %Tbreasts. Or %Tbreast\'s if you want a breast subject etc.</p>';
		html += '<h3>Targeted</h3>';
		html += '<p>These are prefixed with %T for target, %S for sender of an action. Advanced: In multi target texts you can use %T2 for player 2, %T3 etc. If using TextTags (special tags set by texts until target receives another text), you can use %RtagName, such as %Rbent_over. And that will target the player that bent the target over.</p>';
		html += '<p>In the examples below, only %T will be used for reference.</p>';
		html += '<table>'+
			'<tr><td>%T</td><td>Target name</td></tr>'+
			'<tr><td>%Tbreast</td><td>Synonym for breast</td></tr>'+
			'<tr><td>%Tpenis</td><td>Synonym for penis</td></tr>'+
			'<tr><td>%Tbutt</td><td>Synonym for butt</td></tr>'+
			'<tr><td>%Tpsize</td><td>Target penis size.</td></tr>'+
			'<tr><td>%Tbsize</td><td>Target breast size.</td></tr>'+
			'<tr><td>%Trsize</td><td>Target rear (butt) size.</td></tr>'+
			'<tr><td>%Tvagina</td><td>Synonym for vagina.</td></tr>'+
			'<tr><td>%Tgenitals</td><td>Automatically picks a genital the target has between their legs, ex for males it\'s the same as %Tpenis. If a herm, it\'s picked at random. Good to use for texts that make sense against all sexes.</td></tr>'+
			'<tr><td>%TclothUpper</td><td>Replaced with target upperbody armor name. Make sure to use with a condition such as targetWearsUpperbody for this to make sense.</td></tr>'+
			'<tr><td>%TclothLower</td><td>Replaced with target lowerbody armor name. Make sure to use with a condition such as targetWearsLowerbody for this to make sense.</td></tr>'+
			'<tr><td>%Thead</td><td>Replaced with target head armor name. Make sure to use with an appropriate condition.</td></tr>'+
			'<tr><td>%Tgear</td><td>Replaced with whatever target is wearing in their hands. Make sure to use with an appropriate condition.</td></tr>'+
			'<tr><td>%Trace</td><td>Replaced with target race.</td></tr>'+
			'<tr><td>%Tgroin</td><td>Same as %groin.</td></tr>'+
			'<tr><td>%The</td><td>Replaced with he, she, shi, or it based on target sex.</td></tr>'+
			'<tr><td>%Thim</td><td>Replaced with him, her, hir, or its based on target sex.</td></tr>'+
			'<tr><td>%This</td><td>Replaced with his, her, hir, or its based on target sex.</td></tr>'+
		'</table>';

		html += '<h3>Generic</h3>';
		html += '<p>These are generic synonym tags. They\'re not targeted but can be used to vary your text a bit each time it\'s shown.</p>';
		html += '<table>'+
			'<tr><td>%leftright</td><td>Replaced with left or right at random.</td></tr>'+
			'<tr><td>%groin</td><td>Replacfed with a synonym for groin</td></tr>'+
			'<tr><td>%crotch</td><td>Same as above</td></tr>'+
			'<tr><td>%cum</td><td>Synonym for cum</td></tr>'+
			'<tr><td>%couple</td><td>Synonym for a couple, a few, etc.</td></tr>'+
			'<tr><td>%thrusting</td><td>Synonym for thrusting (sexually), such as pounding/humping.</td></tr>'+
		'</table>';

		$("#assetForm").after(html);

		// Text update
		$("#assetForm input[name=text]").on('input change', () => {
			clearTimeout(tUpdateTimer);
			tUpdateTimer = setTimeout(() => {
				updateTextDisplay();
			}, 250); 
		});
		
		
	}


	editor_conditions( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_conditionName.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Type: '+this.formConditionTypes(asset.type)+'<br />';
			html += 'Data: <input type="text" name="data" class="json" value="'+(asset.data && typeof asset.data !== "string" ? esc(JSON.stringify(asset.data)) : esc(asset.data))+'" /><br />';
			html += '<span title="If multiple players are in the event, only one needs this">AnyPlayer</span>: <input type="checkbox" value="1" name="anyPlayer" '+(asset.anyPlayer ? 'checked' : '')+' /><br />';
			html += '<span title="Target sender of an event instead of targets">Sender</span>: <input type="checkbox" value="1" name="caster" '+(asset.caster ? 'checked' : '')+' /><br />';
			html += '<span title="Returns TRUE if condition is NOT valid">Inverse</span>: <input type="checkbox" value="1" name="inverse" '+(asset.inverse ? 'checked' : '')+' /><br />';
			html += '<span title="Target to check against, -1 for ALL">TargNr</span>: <input type="number" min=-1 step=1 value="'+(isNaN(asset.targnr) ? -1 : +asset.targnr)+'" name="targnr" /><br />';
			
			html += '<hr />';
			html += '<p>Note: Using a subcondition turns this into a collection, and data above will be ignored.</p>';
			html += 'Subconditions: '+this.formConditions(asset.conditions)+'<br />';
			html += '<br />';
			html += '<p>For AND, use -1 for both values. For OR use 1 for min and -1 for max.</p>';
			html += '<span title="Use -1 for infinity">Min Subconditions: <input type="number" name="min" step=1 min=-1 value="'+(isNaN(asset.min) ? 1 : +asset.min)+'"  /></span><br />';
			html += '<span title="Use -1 for infinity">Max Subconditions: <input type="number" name="max" step=1 min=-1 value="'+(isNaN(asset.max) ? -1 : +asset.max)+'"  /></span><br />';
			
		this.editor_generic('conditions', asset, this.mod.conditions, html, saveAsset => {
			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.type = this.compileConditionTypes();
			saveAsset.data = $("input[name=data]", form).val().trim();
			try{
				saveAsset.data = JSON.parse(saveAsset.data);
			}catch(err){}
			saveAsset.anyPlayer = $("input[name=anyPlayer]", form).is(':checked');
			saveAsset.caster = $("input[name=caster]", form).is(':checked');
			saveAsset.inverse = $("input[name=inverse]", form).is(':checked');
			saveAsset.targnr = +$("input[name=targnr]", form).val();
			saveAsset.conditions = this.compileConditions();
			saveAsset.min = +$("input[name=min]", form).val();
			saveAsset.max = +$("input[name=max]", form).val();
		});

	}


	editor_playerClasses( asset = {} ){
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Primary Stat: '+this.inputPrimaryStat(asset.primaryStat)+'<br />';
			html += '<textarea name="description">'+esc(asset.description)+'</textarea>';
			html += 'Actions: '+this.formActions(asset.actions)+'<br />';
			html += '<span title="Lists it separately">MonsterClass</span>: <input type="checkbox" value="1" name="isMonsterClass" '+(asset.isMonsterClass ? 'checked' : '')+' /><br />';
			const stats = Action.Types;
			for( let i in stats )
				html += 'Bon '+stats[i]+': <input type="number" name="bon'+stats[i]+'" step=1 min=-1 value="'+(+asset['bon'+stats[i]] || 0)+'"  /><br />';
			for( let i in stats )
				html += 'SV '+stats[i]+': <input type="number" name="sv'+stats[i]+'" step=1 min=-1 value="'+(+asset['sv'+stats[i]] || 0)+'"  /><br />';
			
		this.editor_generic('playerClasses', asset, this.mod.playerClasses, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=label]", form).val().trim();
			saveAsset.primaryStat = $("select[name=primaryStat]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.actions = this.compileAction();
			saveAsset.isMonsterClass = $("input[name=isMonsterClass]", form).val().trim();

			for( let i in stats ){
				const stat = stats[i];
				saveAsset['bon'+stat] = +$("input[name=bon"+stat+"]", form).val().trim();
				saveAsset['sv'+stat] = +$("input[name=sv"+stat+"]", form).val().trim();
			}

		});
	}


	editor_actions( asset = {} ){
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';

			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Type: '+this.inputActionType(asset.type)+'<br />';
			html += 'Target Type: '+this.inputTargetType(asset.target_type, 'target_type')+'<br />';
			html += '<label>Detrimental: <input type="checkbox" name="detrimental" '+(asset.detrimental ? 'checked' : '')+' /></label><br />';
			html += '<label>Ranged: <input type="checkbox" name="ranged" '+(asset.ranged ? 'checked' : '')+' /></label><br />';
			html += '<textarea name="description">'+esc(asset.description)+'</textarea><br />';
			html += 'Level: <input required type="number" min=1 step=1 name="level" value="'+esc(asset.level)+'" /><br />';
			html += 'AP: <input required type="number" min=0 step=1 name="ap" value="'+esc(asset.ap)+'" />';
			html += 'MP: <input required type="number" min=0 step=1 name="mp" value="'+esc(asset.mp)+'" /><br />';
			html += 'Hit Chance: <input required type="number" min=0 step=1 name="hit_chance" value="'+esc(asset.hit_chance)+'" /><br />';
			html += 'Cast Time: <input required type="number" min=0 step=1 name="cast_time" value="'+esc(asset.cast_time)+'" /><br />';
			html += 'Cooldown: <input required type="number" min=0 step=1 name="cooldown" value="'+esc(asset.cooldown)+'" /><br />';
			html += 'Charges: <input required type="number" min=1 step=1 name="charges" value="'+esc(asset.charges)+'" /><br />';
			html += 'Min Targets: <input required type="number" min=1 step=1 name="min_targets" value="'+esc(asset.min_targets)+'" /><br />';
			html += 'Max Targets: <input required type="number" min=1 step=1 name="max_targets" value="'+esc(asset.max_targets)+'" /><br />';

			html += '<span title="Conditions required to learn this.">Add Conditions:</span> '+this.formConditions(asset.add_conditions, 'addConditions')+'<br />';
			html += '<span title="Conditions to cast.">Conditions:</span> '+this.formConditions(asset.conditions, 'conditions')+'<br />';
			html += '<span title="Conditions to cast and show it in the cast bar.">Show Conditions:</span> '+this.formConditions(asset.show_conditions, 'showConditions')+'<br />';
			
			html += '<label>Allow when charging: <input type="checkbox" name="allow_when_charging" '+(asset.allow_when_charging ? 'checked' : '')+' /></label><br />';
			html += '<label>Hidden: <input type="checkbox" name="hidden" '+(asset.hidden ? 'checked' : '')+' /></label><br />';
			html += '<label>Hide if no targets: <input type="checkbox" name="hide_if_no_targets" '+(asset.hide_if_no_targets ? 'checked' : '')+' /></label><br />';
			html += '<label>No action selector: <input type="checkbox" name="no_action_selector" '+(asset.no_action_selector ? 'checked' : '')+' /></label><br />';
			html += '<label>No Interrupt: <input type="checkbox" name="no_interrupt" '+(asset.no_interrupt ? 'checked' : '')+' /></label><br />';
			html += '<label>No Use Text: <input type="checkbox" name="no_use_text" '+(asset.no_use_text ? 'checked' : '')+' /></label><br />';
			html += '<label>Semi hidden: <input type="checkbox" name="semi_hidden" '+(asset.semi_hidden ? 'checked' : '')+' /></label><br />';
			
			html += 'Tags: '+this.formTags(asset.tags)+'<br />';
			html += 'Wrappers: '+this.formWrappers(asset.wrappers, 'wrappers')+'<br />';
			html += 'Riposte: '+this.formWrappers(asset.riposte, 'riposte')+'<br />';

		this.editor_generic('actions', asset, this.mod.actions, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=label]", form).val().trim();
			saveAsset.type = $("select[name=actionType]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.target_type = $("select[name=target_type]", form).val().trim();
			saveAsset.detrimental = $("input[name=detrimental]", form).is(':checked');
			saveAsset.ranged = $("input[name=ranged]", form).is(':checked');
			saveAsset.level = +$("input[name=level]", form).val();
			saveAsset.ap = +$("input[name=ap]", form).val();
			saveAsset.mp = +$("input[name=mp]", form).val();
			saveAsset.hit_chance = +$("input[name=hit_chance]", form).val();
			saveAsset.cast_time = +$("input[name=cast_time]", form).val();
			saveAsset.cooldown = +$("input[name=cooldown]", form).val();
			saveAsset.charges = +$("input[name=charges]", form).val();
			saveAsset.min_targets = +$("input[name=min_targets]", form).val();
			saveAsset.max_targets = +$("input[name=max_targets]", form).val();

			saveAsset.add_conditions = this.compileConditions('addConditions');
			saveAsset.conditions = this.compileConditions('conditions');
			saveAsset.show_conditions = this.compileConditions('showConditions');
			

			saveAsset.allow_when_charging = $("input[name=allow_when_charging]", form).is(':checked');
			saveAsset.hidden = $("input[name=hidden]", form).is(':checked');
			saveAsset.hide_if_no_targets = $("input[name=hide_if_no_targets]", form).is(':checked');
			saveAsset.no_action_selector = $("input[name=no_action_selector]", form).is(':checked');
			saveAsset.no_interrupt = $("input[name=no_interrupt]", form).is(':checked');
			saveAsset.no_use_text = $("input[name=no_use_text]", form).is(':checked');
			saveAsset.semi_hidden = $("input[name=semi_hidden]", form).is(':checked');

			saveAsset.tags = this.compileTags();
			saveAsset.wrappers = this.compileWrappers('wrappers');
			saveAsset.riposte = this.compileWrappers('riposte');			

		});
	}


	editor_wrappers( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Description:<br /><textarea name="description">'+esc(asset.description)+'</textarea><br />';
			html += 'Target Type: '+this.inputWrapperTargetType(asset.target, 'target')+'<br />';
			html += '<label>Detrimental: <input type="checkbox" name="detrimental" '+(asset.detrimental ? 'checked' : '')+' /></label><br />';
			html += 'Duration: <input required type="number" min=-1 step=1 name="duration" value="'+esc(asset.duration)+'" /><br />';
			html += '<label>Trigger immediate (duration only): <input type="checkbox" name="trigger_immediate" '+(asset.trigger_immediate === undefined || asset.trigger_immediate ? 'checked' : '')+' /></label><br />';
			html += 'Icon: <input type="text" name="icon" value="'+esc(asset.icon)+'" /><br />';
			html += '<em>Icons provided by <a href="https://game-icons.net" target="_blank">game-icons.net</a> - Simply go there, find the icon you want and copy the name from the URL. EX if you want to use: https://game-icons.net/delapouite/originals/ancient-screw.html then enter ancient-screw in the above field</em><br />';
			html += 'Max Stacks: <input required type="number" min=1 step=1 name="max_stacks" value="'+esc(asset.max_stacks)+'" /><br />';
			html += 'Tags: '+this.formTags(asset.tags)+'<br />';

			html += '<span title="Conditions required to add this wrapper.">Add Conditions:</span> '+this.formConditions(asset.add_conditions, 'add_conditions')+'<br />';
			html += '<span title="Conditions needed to remain.">Stay Conditions:</span> '+this.formConditions(asset.stay_conditions, 'stay_conditions')+'<br />';
			html += 'Effects: '+this.formEffects(asset.effects, 'effects')+'<br />';

			html += '<label>Tick on turn start: <input type="checkbox" name="tick_on_turn_start" '+(asset.tick_on_turn_start === undefined || asset.tick_on_turn_start ? 'checked' : '')+' /></label><br />';
			html += '<label>Tick on turn end: <input type="checkbox" name="tick_on_turn_end" '+(asset.tick_on_turn_end ? 'checked' : '')+' /></label><br />';

		this.editor_generic('wrappers', asset, this.mod.wrappers, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.target = $("select[name=target]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.detrimental = $("input[name=detrimental]", form).is(':checked');
			saveAsset.trigger_immediate = $("input[name=trigger_immediate]", form).is(':checked');
			saveAsset.tick_on_turn_start = $("input[name=tick_on_turn_start]", form).is(':checked');
			saveAsset.tick_on_turn_end = $("input[name=tick_on_turn_end]", form).is(':checked');
			saveAsset.duration = +$("input[name=duration]", form).val();
			saveAsset.icon = $("input[name=icon]", form).val().trim();
			saveAsset.max_stacks = +$("input[name=max_stacks]", form).val();

			saveAsset.add_conditions = this.compileConditions('add_conditions');
			saveAsset.stay_conditions = this.compileConditions('stay_conditions');
			saveAsset.tags = this.compileTags();
			saveAsset.effects = this.compileEffects('effects');

		});
	}


	editor_effects( asset = {} ){
		
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Type: '+this.inputEffectType(asset.type, 'type')+'<br />';
			html += 'Data: <input required class="json" type="text" name="data" value="'+esc(JSON.stringify(asset.data))+'" /><br />';
			html += 'Events: '+this.formEvents(asset.events, 'events')+'<br />';
			html += 'Targets: '+this.formWrapperTargetTypes(asset.targets, 'targets')+'<br />';
			html += 'Conditions: '+this.formConditions(asset.conditions, 'conditions')+'<br />';
			


		this.editor_generic('effects', asset, this.mod.effects, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.data = {};
			try{ saveAsset.data = JSON.parse($("input[name=data]", form).val().trim()); }catch(err){}
			saveAsset.events = this.compileEvents('events');
			saveAsset.type = $('select[name=type]', form).val();
			saveAsset.targets = this.compileWrapperTargetTypes('targets');
			saveAsset.conditions = this.compileConditions('conditions');

		});

	}


	editor_assets( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Description: <textarea name="description">'+esc(asset.description)+'</textarea><br />';
			html += 'Slots: '+this.formAssetSlots(asset.slots)+'<br />';
			html += 'Tags: '+this.formTags(asset.tags)+'<br />';
			html += 'Use action: '+this.inputAction(typeof asset.use_action !== "string" ? JSON.stringify(asset.use_action) : asset.use_action)+'<br />';
			html += 'Passive wrappers: '+this.formWrappers(asset.wrappers)+'<br />';
			html += 'Weight: <input required type="number" min=0 step=1 name="weight" value="'+esc(asset.weight)+'" /><br />';
			html += 'Charges: <input required type="number" min=0 step=1 name="charges" value="'+esc(asset.charges)+'" /><br />';
			html += 'Durability Bonus: <input required type="number" min=0 step=1 name="durability_bonus" value="'+esc(asset.durability_bonus)+'" /><br />';
			html += 'Level: <input required type="number" min=0 step=1 name="level" value="'+esc(asset.level)+'" /><br />';
			html += 'Rarity: <input required type="number" min=0 step=1 max=4 name="rarity" value="'+esc(asset.rarity)+'" /><br />';
			html += 'Charges: <input required type="number" min=-1 step=1 name="charges" value="'+esc(asset.charges)+'" /><br />';
			html += 'Loot Sound: <input type="text" name="loot_sound" value="'+esc(asset.loot_sound)+'" /><br />';
			html += '<label>No auto consume: <input type="checkbox" name="no_auto_consume" '+(asset.no_auto_consume ? 'checked' : '')+' /></label><br />';
			

		this.editor_generic('assets', asset, this.mod.assets, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.slots = this.compileAssetSlots();
			saveAsset.tags = this.compileTags();
			saveAsset.use_action = {};
			try{ saveAsset.use_action = JSON.parse($("input[name=action]", form).val().trim()); }catch(err){}
			saveAsset.wrappers = this.compileWrappers();
			saveAsset.weight = +$("input[name=weight]", form).val();
			saveAsset.charges = +$("input[name=charges]", form).val();
			saveAsset.durability_bonus = +$("input[name=durability_bonus]", form).val();
			saveAsset.level = +$("input[name=level]", form).val();
			saveAsset.rarity = +$("input[name=rarity]", form).val();
			saveAsset.charges = +$("input[name=charges]", form).val();
			saveAsset.loot_sound = $("input[name=loot_sound]", form).val().trim();
			saveAsset.no_auto_consume = $("input[name=no_auto_consume]", form).is(':checked');

		});

	}

	editor_playerTemplates( asset = {} ){
		
		if( typeof asset.sv !== "object" )
			asset.sv = {};
		if( typeof asset.bon !== "object" )
			asset.bon = {};
		if( typeof asset.primary_stats !== "object" )
			asset.primary_stats = {};
		

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Description: <textarea name="description">'+esc(asset.description)+'</textarea><br />';
			html += 'Icon: <input type="text" name="icon" value="'+esc(asset.icon)+'" /><br />';
			html += 'Species: <input type="text" name="species" value="'+esc(asset.species)+'" /><br />';
			html += 'Viable classes: '+this.formClasses(asset.classes, 'classes')+'<br />';


			html += 'Difficulty: <input required type="number" min=0.01 step=0.01 name="difficulty" value="'+esc(asset.difficulty)+'" /><br />';
			html += 'Max Actions: <input required type="number" min=-1 step=1 name="max_actions" value="'+esc(asset.max_actions)+'" /><br />';
			html += '<label title="Chance of having gear">Gear Chance: <input required type="range" min=0 step=0.01 max=1 name="gear_chance" value="'+esc(asset.gear_chance)+'" /></label><br />';

			html += 'Min Level: <input required type="number" min=0 step=1 name="min_level" value="'+esc(asset.min_level)+'" /><br />';
			html += 'Max Level: <input required type="number" min=0 step=1 name="max_level" value="'+esc(asset.max_level)+'" /><br />';

			html += 'Min Size: <input required type="range" min=0 step=1 max=4 name="min_size" value="'+esc(asset.min_size)+'" /><br />';
			html += 'Max Size: <input required type="range" min=0 step=1 max=4 name="max_size" value="'+esc(asset.max_size)+'" /><br />';


			html += 'Viable asset templates: '+this.formAssetTemplates(asset.viable_asset_templates, 'viable_asset_templates')+'<br />';
			html += 'Viable asset materials: '+this.formMaterialTemplates(asset.viable_asset_materials, 'viable_asset_materials')+'<br />';
			html += 'Viable consumables: '+this.formAssets(asset.viable_consumables, 'viable_consumables')+'<br />';
			html += 'Viable gear: '+this.formAssets(asset.viable_gear, 'viable_gear')+'<br />';
			html += 'Required assets: '+this.formAssets(asset.required_assets, 'required_assets')+'<br />';
			
			html += 'Primary stats:<br />';
			for( let stat in Player.primaryStats )
				html += Player.primaryStats[stat]+': <input required type="number" step=1 name="'+Player.primaryStats[stat]+'" value="'+(asset.primary_stats[Player.primaryStats[stat]] || 0)+'" /> ';

			html += '<br />SV:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="sv_'+Action.Types[stat]+'" value="'+(asset.sv[Action.Types[stat]] || 0)+'" /> ';
			
			html += '<br />Bon:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="bon_'+Action.Types[stat]+'" value="'+(asset.bon[Action.Types[stat]] || 0)+'" /> ';
			

		html += '<br />Tags: '+this.formTags(asset.tags, 'tags')+'<br />';

		html += 'Personality traits:<br />';
		html += '<label>Sadistic: '+
			'Min: <input type="range" min=0 step=0.01 max=1 name="sadistic_min" value="'+esc(asset.sadistic_min)+'" /> '+
			'Max: <input type="range" min=0 step=0.01 max=1 name="sadistic_max" value="'+esc(asset.sadistic_max)+'" />'+
		'</label><br />';
		html += '<label>Dominant: '+
			'Min: <input type="range" min=0 step=0.01 max=1 name="dominant_min" value="'+esc(asset.dominant_min)+'" /> '+
			'Max: <input type="range" min=0 step=0.01 max=1 name="dominant_max" value="'+esc(asset.dominant_max)+'" />'+
		'</label><br />';
		html += '<label>Heterosexuality: '+
			'Min: <input type="range" min=0 step=0.01 max=1 name="hetero_min" value="'+esc(asset.hetero_min)+'" /> '+
			'Max: <input type="range" min=0 step=0.01 max=1 name="hetero_max" value="'+esc(asset.hetero_max)+'" />'+
		'</label><br />';
		html += '<label>Intelligence: '+
			'Min: <input type="range" min=0 step=0.01 max=1 name="intelligence_min" value="'+esc(asset.intelligence_min)+'" /> '+
			'Max: <input type="range" min=0 step=0.01 max=1 name="intelligence_max" value="'+esc(asset.intelligence_max)+'" />'+
		'</label><br />';


		this.editor_generic('playerTemplates', asset, this.mod.playerTemplates, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.icon = $("input[name=icon]", form).val().trim();
			saveAsset.species = $("input[name=species]", form).val().trim();
			saveAsset.classes = this.compileClasses('classes');
			saveAsset.difficulty = +$("input[name=difficulty]", form).val().trim();
			saveAsset.max_actions = +$("input[name=max_actions]", form).val().trim();
			saveAsset.gear_chance = +$("input[name=gear_chance]", form).val().trim();
			saveAsset.min_level = +$("input[name=min_level]", form).val().trim();
			saveAsset.max_level = +$("input[name=max_level]", form).val().trim();
			saveAsset.min_size = +$("input[name=min_size]", form).val().trim();
			saveAsset.max_size = +$("input[name=max_size]", form).val().trim();
			saveAsset.viable_asset_templates = this.compileAssetTemplates('viable_asset_templates');
			saveAsset.viable_asset_materials = this.compileMaterialTemplates('viable_asset_materials');
			saveAsset.viable_consumables = this.compileAssets('viable_consumables');
			saveAsset.viable_gear = this.compileAssets('viable_gear');
			saveAsset.required_assets = this.compileAssets('required_assets');
			saveAsset.tags = this.compileTags('tags');
			saveAsset.primary_stats = {};
			for( let stat in Player.primaryStats )
				saveAsset.primary_stats[Player.primaryStats[stat]] = +$("input[name="+Player.primaryStats[stat]+"]", form).val().trim();
			saveAsset.sv = {};
			saveAsset.bon = {};
			for( let stat in Action.Types ){
				saveAsset.sv[Action.Types[stat]] = +$("input[name=sv_"+Action.Types[stat]+"]", form).val().trim();
				saveAsset.bon[Action.Types[stat]] = +$("input[name=bon_"+Action.Types[stat]+"]", form).val().trim();
			}
			saveAsset.sadistic_min = +$("input[name=sadistic_min]", form).val().trim();
			saveAsset.sadistic_max = +$("input[name=sadistic_max]", form).val().trim();

			saveAsset.dominant_min = +$("input[name=dominant_min]", form).val().trim();
			saveAsset.dominant_max = +$("input[name=dominant_max]", form).val().trim();

			saveAsset.hetero_min = +$("input[name=hetero_min]", form).val().trim();
			saveAsset.hetero_max = +$("input[name=hetero_max]", form).val().trim();

			saveAsset.intelligence_min = +$("input[name=intelligence_min]", form).val().trim();
			saveAsset.intelligence_max = +$("input[name=intelligence_max]", form).val().trim();


		});

	}

	editor_assetTemplates( asset = {} ){
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Description: <textarea name="description">'+esc(asset.description)+'</textarea><br />';
			html += 'Size: <input required type="number" name="size" value="'+esc(asset.size)+'" /><br />';

			html += 'Slots: '+this.formAssetSlots(asset.slots)+'<br />';
			html += 'Tags: '+this.formTags(asset.tags)+'<br />';
			
			html += 'Materials: '+this.formMaterialTemplates(asset.materials)+'<br />';

			
			html += '<br />SV:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="sv_'+Action.Types[stat]+'" value="'+(asset.svStats[Action.Types[stat]] || 0)+'" /> ';
			
			html += '<br />Bon:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="bon_'+Action.Types[stat]+'" value="'+(asset.bonStats[Action.Types[stat]] || 0)+'" /> ';
		
			
		this.editor_generic('assetTemplates', asset, this.mod.assetTemplates, html, saveAsset => {

			const form = $("#assetForm");

			saveAsset.svStats = {};
			saveAsset.bonStats = {};
			for( let stat in Action.Types ){
				saveAsset.svStats[Action.Types[stat]] = +$("input[name=sv_"+Action.Types[stat]+"]", form).val().trim();
				saveAsset.bonStats[Action.Types[stat]] = +$("input[name=bon_"+Action.Types[stat]+"]", form).val().trim();
			}

			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.size = +$("input[name=size]", form).val().trim();
			saveAsset.slots = this.compileAssetSlots();
			saveAsset.tags = this.compileTags();
			saveAsset.materials = this.compileMaterialTemplates();

		});

	}

	editor_dungeonTemplates( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			
			html += 'Rooms: '+this.formDungeonRoomTemplates(asset.rooms, 'rooms')+'<br />';
			html += 'Doors Horizontal: '+this.formMeshes(asset.doors_hor,'doors_hor')+'<br />';
			html += 'Doors Down: '+this.formMeshes(asset.doors_down,'doors_down')+'<br />';
			html += 'Doors Up: '+this.formMeshes(asset.doors_up,'doors_up')+'<br />';
			html += 'Viable Encounters: '+this.formEncounters(asset.encounters,'encounters')+'<br />';
			html += 'Consumables: '+this.formAssets(asset.consumables,'consumables')+'<br />';
			
		this.editor_generic('dungeonTemplates', asset, this.mod.dungeonTemplates, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.rooms = this.compileDungeonRoomTemplates('rooms');
			saveAsset.doors_hor = this.compileMeshes('doors_hor');
			saveAsset.doors_down = this.compileMeshes('doors_down');
			saveAsset.doors_up = this.compileMeshes('doors_up');
			saveAsset.encounters = this.compileEncounters('encounters');
			saveAsset.consumables = this.compileAssets('consumables');
			
		});

	}

	editor_dungeonRoomTemplates( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			
			html += 'Room Meshes: '+this.formMeshes(asset.basemeshes, 'basemeshes')+'<br />';
			html += 'Props: '+this.formMeshes(asset.props,'props')+'<br />';
			html += 'Containers: '+this.formMeshes(asset.containers,'containers')+'<br />';
			html += 'Tags: '+this.formTags(asset.tags,'tags')+'<br />';
			
			html += 'Ambiance: <input type="text" name="ambiance" value="'+esc(asset.ambiance)+'" /><br />';
			html += 'Volume: <input type="range" min=0 max=1 step=0.01 name="ambiance_volume" value="'+esc(asset.ambiance_volume)+'" /><br />';
			
			
		this.editor_generic('dungeonRoomTemplates', asset, this.mod.dungeonRoomTemplates, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.ambiance = $("input[name=ambiance]", form).val().trim();
			saveAsset.ambiance_volume = +$("input[name=ambiance_volume]", form).val().trim();

			saveAsset.basemeshes = this.compileMeshes('basemeshes');
			saveAsset.props = this.compileMeshes('props');
			saveAsset.containers = this.compileMeshes('containers');
			saveAsset.tags = this.compileTags('tags');
			
		});

	}

	editor_materialTemplates( asset = {} ){
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Tags: '+this.formTags(asset.tags,'tags')+'<br />';
			html += 'Weight (Grams): <input type="number" min=0 step=1 name="weight" value="'+esc(asset.weight)+'" /><br />';
			html += 'Min Level: <input type="number" min=0 step=1 name="level" value="'+esc(asset.level)+'" /><br />';
			html += 'Durability Multiplier: <input type="number" min=0 step=0.01 name="durability_bonus" value="'+esc(asset.durability_bonus)+'" /><br />';
			html += 'Bonus stats: <input type="number" min=0 step=1 name="stat_bonus" value="'+esc(asset.stat_bonus)+'" /><br />';
			/*
			html += '<br />SV:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="sv_'+Action.Types[stat]+'" value="'+(asset.svBons[Action.Types[stat]] || 0)+'" /> ';
			
			html += '<br />Bon:<br />';
			for( let stat in Action.Types )
				html += Action.Types[stat]+': <input required type="number" step=1 name="bon_'+Action.Types[stat]+'" value="'+(asset.bonBons[Action.Types[stat]] || 0)+'" /> ';
			*/
			
			
		this.editor_generic('materialTemplates', asset, this.mod.materialTemplates, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.tags = this.compileTags('tags');
			saveAsset.weight = +$("input[name=weight]", form).val().trim();
			saveAsset.level = +$("input[name=level]", form).val().trim();
			saveAsset.durability_bonus = +$("input[name=durability_bonus]", form).val().trim();
			saveAsset.stat_bonus = +$("input[name=stat_bonus]", form).val().trim();
			/*
			for( let stat in Action.Types ){
				saveAsset.svBons[Action.Types[stat]] = +$("input[name=sv_"+Action.Types[stat]+"]", form).val().trim();
				saveAsset.bonBons[Action.Types[stat]] = +$("input[name=bon_"+Action.Types[stat]+"]", form).val().trim();
			}
			*/
			
		});

	}

	editor_audiokits( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Sounds: '+this.formSoundkitSubs(asset.sounds, 'sounds')+'<br />';
			html += 'Conditions: '+this.formConditions(asset.conditions, 'conditions')+'<br />';

		this.editor_generic('audiokits', asset, this.mod.audioKits, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.conditions = this.compileConditions('conditions');
			saveAsset.sounds = this.compileSoundkitSubs('sounds');
			

		});


	}

	editor_encounters( asset = {} ){

		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Player Templates: '+this.formPlayerTemplates(asset.player_templates, 'player_templates')+'<br />';
			html += 'Specific Players: '+this.formPlayers(asset.players)+'<br />';
			html += 'Wrappers (auto target is player who started the event): <br />'+this.formWrappers(asset.wrappers, 'wrappers')+'<br />';
			html += 'Start Text (uses the same placeholders as action texts): <input type="text" value="'+esc(asset.text || '')+'" name="startText" /><br />';
			html += 'Conditions: '+this.formConditions(asset.conditions, 'conditions')+'<br />'; 
			
		this.editor_generic('encounters', asset, this.mod.dungeonEncounters, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.startText = $("input[name=startText]", form).val().trim();
			
			saveAsset.players = this.compilePlayers();
			saveAsset.player_templates = this.compilePlayerTemplates('player_templates');
			saveAsset.wrappers = this.compileWrappers('wrappers');
			saveAsset.conditions = this.compileConditions('conditions');
			
		});


	}


	
	editor_dungeons( asset = {} ){

		const th = this;
		if( !Array.isArray(asset.rooms) )
			asset.rooms = [];

		const dungeon = new Dungeon(asset);
		dungeon.rooms = [];
		for( let room of asset.rooms ){
			const r = new DungeonRoom(room, dungeon);
			r.encounters = room.encounters;
			if( !Array.isArray(r.encounters) )
				r.encounters = [];
			dungeon.rooms.push(r);
		}
		
		let html = '<p>Labels are unique to the game. Consider prefixing it with your mod name like mymod_NAME.</p>';
			html += 'Label: <input required type="text" name="label" value="'+esc(asset.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(asset.name)+'" /><br />';
			html += 'Tags: '+this.formTags(asset.tags, 'tags')+'<br />';
			html += 'Consumables: '+this.formAssets(dungeon.consumables, 'consumables')+'<br />';
			html += 'Dungeon Vars: '+this.formDungeonVars(dungeon.vars)+'<br />';

		// Helper functions
		function setDungeonRoomByIndex(index, z = 0){

			// Get map scale
			let xyScale = 2;
			let zHeight = 0, zDepth = 0;
			for( let room of dungeon.rooms ){
				if(room.z === z){
					if( Math.abs(room.x) > xyScale )
						xyScale = Math.abs(room.x);
					if( Math.abs(room.y) > xyScale )
						xyScale = Math.abs(room.y);
				}
				if( room.z > zHeight )
					zHeight = room.z;
				if( room.z < zDepth )
					zDepth = room.z;
			}
			xyScale*=2;
			xyScale+=1;
			xyScale = Math.max(3, xyScale);

			// Room map
			let html = '';
			let editor_room = dungeon.rooms[0];
			for( let room of dungeon.rooms ){
				if( room.z !== z )
					continue;

				if( room.index === index )
					editor_room = room;
				let x = (0.5+room.x/xyScale)*50+'vw';
				let y = (0.5-room.y/xyScale)*50+'vw';
				let width = 50/xyScale;
				
				const dirs = [
					{dir:DungeonRoom.Dirs.West, style:'left:0;top:50%;transform:translateY(-50%)', arrow:'⇦'},
					{dir:DungeonRoom.Dirs.East, style:'right:0; top:50%; transform:translateY(-50%)', arrow:'⇨'},
					{dir:DungeonRoom.Dirs.North, style:'left:50%; top:0; transform:translateX(-50%)', arrow:'⇧'},
					{dir:DungeonRoom.Dirs.South, style:'left:50%; bottom:0; transform:translateX(-50%)', arrow:'⇩'},
					{dir:DungeonRoom.Dirs.Up, style:'left:50%; top:20%; transform:translateX(-50%)', arrow:'⇞'},
					{dir:DungeonRoom.Dirs.Down, style:'left:50%; bottom:20%; transform:translateX(-50%)', arrow:'⇟'},
				];
				
				let allAdjacent = room.getAdjacentBearings();
				html += '<div '+
					'data-x="'+room.x+'" data-y="'+room.y+'" '+
					'class="room'+(room.index === index ? ' selected' : '')+'" '+
					'style="width:'+width+'vw;height:'+width+'vw;left:'+x+';top:'+y+';" '+
					'data-index="'+esc(room.index)+'">';
				for( let dir of dirs ){

					let d = room.getRoomBearingCoords(dir.dir);
					let adjacent = dungeon.getRoomAt(room.x+d[0],room.y+d[1],room.z+d[2]);
					if( !adjacent || adjacent.parent_index === room.index || room.parent_index === adjacent.index ){
						html += '<input type="button" '+
							(allAdjacent[dir.dir] ? 'data-adjacent="'+(allAdjacent[dir.dir].index)+'" ' : '')+
							'data-dir="'+dir.dir+'" '+
							'class="addRoom'+(allAdjacent[dir.dir] ? ' disabled' : '')+'" '+
							'style="'+dir.style+'" '+
							'value="'+(allAdjacent[dir.dir] ? dir.arrow : '+'+dir.arrow )+'" />';					
					}
				}
				html += '<div class="name" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%)">'+esc(room.name || 'Unknown')+'</div>';
				html += '</div>';
			}

			html += 'Z: <input type="number" step=1 value="'+esc(z)+'" id="zHeight" />';
			$("#modal div.dungeonMap").html(html);



			// ROOM EDITOR & 3D
			

			// Find the active room and draw the cell settings and 3d editor
			for( let room of dungeon.rooms ){
				if( room.index === index ){

					// Cell settings
					html = 'Room ID: <input type="number" disabled value='+esc(room.index)+' /><br />'+
						'Room Name: <input name="roomName" value="'+esc(room.name)+'" type="text" /><br />'+
						'Room Encounters: '+th.formEncounters(room.encounters, 'encounters')+'<br />'+
						'Room tags: '+th.formTags(room.tags, 'roomTags')+'<br />'+
						'Room Ambiance: <input name="roomAmbiance" type="text" value="'+esc(room.ambiance)+'" /><br />'+
						'Room Ambiance Volume: <input name="roomAmbianceVolume" type="range" min=0 max=1 step=0.05 value="'+esc(room.ambiance_volume)+'" /><br />'+
						'<label>Outdoors: <input type="checkbox" name="roomOutdoors" '+(room.outdoors ? 'checked' : '')+' /></label><br />';
					$("#modal div.cellSettings").html(html);

					th.drawRoomEditor(room);
					th.drawRoomAssetEditor( room.getRoomAsset() );
					th.bindDungeonFormHelpers();

					break;
				}
			}




			// Bind stuff
			// Room in map clicked
			$("div.room[data-index]").on('click', function( event ){

				const index = +$(this).attr('data-index');
				if( event.ctrlKey ){
					for( let room of dungeon.rooms ){
						if( room.index === index && room.index !== 0 ){
							
							let subs = room.getChildren();
							if(confirm("Really delete this room and "+subs.length+" child-cells?")){
								subs.push(room);
								for( let sub of subs ){
									for( let i in dungeon.rooms ){
										if( dungeon.rooms[i] === sub ){
											dungeon.rooms.splice(i,1);
											break;
										}
									}
								}
								setDungeonRoomByIndex(0,0);
							}
							return;

						}
					}
					return;
				}
				setDungeonRoomByIndex(index);

			});
			
			// Go to room button clicked
			$("div.room input[data-adjacent]").on('click', function(){
				let id = +$(this).attr('data-adjacent');
				for( let room of dungeon.rooms ){
					if( room.index === id ){
						setDungeonRoomByIndex(id, room.z);
						return;
					}
				}
			});
			// Add new room button
			$("div.room input.addRoom:not(.disabled)").on('click', function(){
				const dir = $(this).attr('data-dir');
				const index = +$(this).parent().attr('data-index');
				let highest = 0;
				for( let room of dungeon.rooms ){
					if( room.index > highest )
						highest = room.index;
				}
				for( let room of dungeon.rooms ){
					if( room.index === index ){

						let newRoom = room.clone(dungeon);
						newRoom.assets = [];
						newRoom.index = highest+1;
						newRoom.parent_index = index;
						newRoom.name = 'New Room';
							
						let dirOffset = newRoom.getRoomBearingCoords(dir);
						newRoom.x += dirOffset[0];
						newRoom.y += dirOffset[1];
						newRoom.z += dirOffset[2];
						dungeon.rooms.push(newRoom);

						console.log("Adding room", newRoom);

						setDungeonRoomByIndex(newRoom.index, newRoom.z);
						return;
					}
				}
			});
			// Z height input
			$("#zHeight").on('change', function(){
				setDungeonRoomByIndex(index, +$(this).val());
			});

			th.bindDungeonFormHelpers();


			// Helper function that binds the room form
			function rebindRoom(){

				$("#modal div.cellSettings input:not(.addTagHere):not(.json)").off('change').on('change', function(event){

					const room = editor_room;
					const dom = $(this);
					const name = dom.attr('name');
					const val = dom.val();

					if( name === "roomName" ){
						room.name = val;
						$("#modal div.room[data-index="+room.index+"] div.name").html(esc(val));
					}
					if( name === "roomAmbiance" )
						room.ambiance = val;
					if( name === "roomAmbianceVolume" )
						room.ambiance_volume = +val;
					if( name === "roomOutdoors" )
						room.outdoors = dom.is(':checked');
					if( name === "tag" ){
						// Recompile tags
						room.tags = th.compileTags('roomTags');
					}

				});
			}
			rebindRoom();
		}

		

		// SAVE
		this.editor_generic('dungeons', asset, this.mod.dungeons, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.tags = this.compileTags('tags');
			saveAsset.rooms = dungeon.rooms.map(el => el.save("mod"));
			saveAsset.consumables = this.compileAssets("consumables");
			saveAsset.vars = this.compileDungeonVars();
			
		});

		// Set stuff outside the form
		html = '';
		html += '<div class="flexTwoColumns roomWrap">';
			html += '<div class="dungeonMap"></div>';
			html += '<div class="cellSettings" style="padding:0 1vmax"></div>';
		html += '</div>';

		// Canvas in here
		html += '<div class="flexTwoColumns editorWrap">';
			html += '<div class="editor" style="flex:40%">'+
				'<div class="cellEditor"></div>'+
				'<div class="legend" style="position:absolute;bottom:0; left:0; font-size:0.7vmax;">Q: Toggle world/local | W: Translate | E: Rotate | R: Scale | Ctrl: Snap | Ctrl+S: Quick Save | Ctrl+L: Quick Load</div>'+
			'</div>';
			html += '<div class="assetEditor" style="flex:40%">Asset editor</div>';
		html += '</div>';
		html += '<br />';
		$("#modal > div.wrapper > div.content").append(html);


		// Find the entrance, if it doesn't exist, create it
		for( let room of dungeon.rooms ){
			if( room.index === 0 )
				return setDungeonRoomByIndex(0, room.z);
		}
		dungeon.rooms.push(new DungeonRoom({name:'Entrance',x:0,y:0,index:0}, dungeon));


		setDungeonRoomByIndex(0, 0);

	}

	// Use this instead of bindFormHelpers for dungeon, since it needs to rely on change events.
	// This is because the room/asset properties need to be able to change ad hoc
	bindDungeonFormHelpers(){

		const room = this.dungeon_active_room;
		const asset = this.dungeon_active_asset;
		const th = this;
		this.bindFormHelpers(function(type, element){

			console.log(type, element);
			if( $(element).hasClass('encounters') )
				room.encounters = th.compileEncounters('encounters');

			if( $(element).hasClass('roomTags') ){
				room.tags = th.compileTags('roomTags');
			}
			

			// Interaction conditions for individual assets
			if( $(element).hasClass('interaction_conditions') ){
				const cond = $(element).closest('div.interaction');
				if( !cond.length )
					return;
				const index = cond.index();
				// Conditions changed
				if( type === "Conditions" ){
					asset.interactions[index].conditions = th.compileConditions("interaction_conditions", cond);
				}
			}

		});

	}

	// Helper to draw the 3d room editor
	async drawRoomEditor( room ){

		this.dungeon_active_room = room;

		// Make sure the room asset exists
		let roomAsset = room.getRoomAsset();
		if( !roomAsset ){
			roomAsset = new DungeonRoomAsset({
				model : 'Dungeon.Room.R6x6',
				room : true
			}, room);
			room.addAsset(roomAsset);
		}

		// vw vh
		this.renderer.setSize(0.5,0.5);
		const el = this.renderer.renderer.domElement;
		el.tabIndex = -1;
		el.addEventListener('click', () => {
			if( document.activeElement.blur )
				document.activeElement.blur();
		});
		$("#modal div.cellEditor").html(el);
		
		
		let stage = new Stage(room, this.renderer, true);
		this.renderer.resetStage( stage );
		this.renderer.start();
		await stage.draw();
		

		const control = this.control;
		const renderer = this.renderer;
		control.detach();

		// Set mouseover events
		for( let child of stage.group.children ){

			if( child.userData && child.userData.template && !child.userData.template.isRoom ){

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
					this.drawRoomAssetEditor(child.userData.dungeonAsset);
				};

			}
			
		}

	}

	// Handles the asset editor to the right of the viewport
	drawRoomAssetEditor( asset ){

		this.dungeon_active_asset = asset;

		const th = this;
		const room = asset.parent;
		let html = '';
		let meshToAdd, meshToAddModel;
		const div = $("#modal div.assetEditor");
		const RAD_TO_DEG = 57.2958;
		const DEG_TO_RAD = 1.0/57.2958;

		// Any forms and such here will modify the asset argument, and the asset argument will be saved when the dungeon saves

		// Skeleton
		html += '<div class="addAsset" >';

			html += '<div id="meshControls">';
				html += '<select id="meshToTest" multiple></select>';
			html += '</div>';

			html += '<input style="position:absolute;top:0; right:0;" type="button" id="addMeshToScene" disabled value="Add to Scene" />';

		html += '</div>';

		html += '<div class="missingDoors">';
		html += '</div><br />';

		// Room asset selector
		if( asset.isRoom() ){
			
			html += '<strong>Pick base room asset</strong><br />';
			html += '<select name="roomAssetPath">';
			LibMesh.iterate((mesh, path) => {
				if( mesh.isRoom )
					html += '<option value="'+esc(path)+'" '+(path === asset.model ? 'selected' : '')+'>'+esc(path)+'</option>';
			});
			html += '</select>';

		}
		// Generic asset selector
		else{
			html += 'Name: <input type="text" class="updateMesh" name="name" value="'+esc(asset.name)+'" /> <br />';
			html += '<strong>Position:</strong><br />';
			html += 'X <input type="number" step=1 name="x" class="updateMesh" style="width:6vmax" value="'+esc(asset.x)+'" /> ';
			html += 'Y <input type="number" step=1 name="y" class="updateMesh" style="width:6vmax" value="'+esc(asset.y)+'" /> ';
			html += 'Z <input type="number" step=1 name="z" class="updateMesh" style="width:6vmax" value="'+esc(asset.z)+'" /> <br />';

			html += '<strong>Rotation:</strong><br />';
			html += 'X <input type="number" step=0.1 name="rotX" class="updateMesh" style="width:6vmax" value="'+esc(Math.round(asset.rotX*RAD_TO_DEG*10)/10)+'" /> ';
			html += 'Y <input type="number" step=0.1 name="rotY" class="updateMesh" style="width:6vmax" value="'+esc(Math.round(asset.rotY*RAD_TO_DEG*10)/10)+'" /> ';
			html += 'Z <input type="number" step=0.1 name="rotZ" class="updateMesh" style="width:6vmax" value="'+esc(Math.round(asset.rotZ*RAD_TO_DEG*10)/10)+'" /> <br />';

			html += '<strong>Scale:</strong><br />';
			html += 'X <input type="number" step=0.01 name="scaleX" class="updateMesh" style="width:6vmax" value="'+esc(asset.scaleX)+'" /> ';
			html += 'Y <input type="number" step=0.01 name="scaleY" class="updateMesh" style="width:6vmax" value="'+esc(asset.scaleY)+'" /> ';
			html += 'Z <input type="number" step=0.01 name="scaleZ" class="updateMesh" style="width:6vmax" value="'+esc(asset.scaleZ)+'" /> <br />';
	
			html += '<div class="assetDataEditor"><input type="button" value="Add Interaction" class="addInteraction" /><div class="assetData"></div></div>';

			html += '<input type="button" value="Delete" class="deleteSelectedAsset" />';

			// Bind the updates
			this.onControlChanged = event => {

				const mode = event.target.getMode();
				if( mode === 'scale' ){
					$("input[name=scaleX]", div).val(asset.scaleX);
					$("input[name=scaleY]", div).val(asset.scaleY);
					$("input[name=scaleZ]", div).val(asset.scaleZ);
				}
				else if( mode === 'rotate' ){
					$("input[name=rotX]", div).val(Math.round(asset.rotX*RAD_TO_DEG*10)/10);
					$("input[name=rotY]", div).val(Math.round(asset.rotY*RAD_TO_DEG*10)/10);
					$("input[name=rotZ]", div).val(Math.round(asset.rotZ*RAD_TO_DEG*10)/10);
				}
				else if( mode === 'translate' ){
					$("input[name=x]", div).val(asset.x);
					$("input[name=y]", div).val(asset.y);
					$("input[name=z]", div).val(asset.z);
				}

			};


		}

		div.html(html);

		// Room
		$("select[name=roomAssetPath]", div).on('change', function(){
			asset.model = $(this).val();
			th.drawRoomEditor(asset.parent);
		});

		const updateMissingDoors = function(){
			let html = '';
			let missingDoors = [];
			let direct = room.getDirectConnections();

			for( let r of direct ){
				if( !room.getDoorLinkingTo( r.index ) )
					missingDoors.push("["+r.index+"] "+esc(r.name));
			}
			if( room.index === 0 && !room.getDoorLinkingTo(-1) )
				missingDoors.push("[-1] EXIT");
			if( missingDoors.length )
				html += '<b>Missing doors:</b><br />'+missingDoors.join('<br />');
			$("div.missingDoors").html(html);
		}
		updateMissingDoors();


		// Asset
		// Updates the select boxes
		const updateSelects = function(index){
			let path = [];
			$("#meshControls select").each(function(i){
				if(i > index)
					$(this).remove();
				else
					path.push($(this).val()[0]);
			});

			let meshes = libMeshes;
			let i = "";
			for( i of path )
				meshes = meshes[i];

			$("#addMeshToScene").prop("disabled", true);
			
			// Set this as mesh to add
			if( meshes.constructor === LibMesh ){
				$("#addMeshToScene").prop("disabled", false);
				meshToAdd = path.join('.');
				meshToAddModel = meshes;
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

		// Updates the asset data editor form
		const updateAssetDataEditor = function(){

			const addInteraction = function(interaction){

				const types = DungeonRoomAssetInteraction.types,
					type = interaction.type,
					room = interaction.parent.parent
				;
				let html = '<div class="interaction condWrapper" style="display:block" data-id="'+esc(interaction.id)+'">';
				html += '<select name="interaction_type">';
				for( let t in types )
					html += '<option value="'+esc(types[t])+'"'+(interaction.type === types[t] ? ' selected' : '')+'>'+t+'</option>';
				html += '</select><br />';
				html += 'Repeats: <input style="width:9vw" type="number" min=-1 step=1 name="interaction_repeats" value="'+esc(isNaN(interaction.repeats) ? -1 : interaction.repeats)+'" /><br />';
				html += 'Break on: <select name="interaction_break">'+
					'<option value="">None</option>'+
					'<option value="success" '+(interaction.break === 'success' ? 'selected' : '')+'>Success</option>'+
					'<option value="fail" '+(interaction.break === 'fail' ? 'selected' : '')+'>Fail</option>'+
				'</select><br />';
				
				if( type === types.dungeonVar ){
					html += 'Todo: Dungeon vars <br />';
				}
				else if( type === types.encounters )
					html += th.formEncounters(interaction.data, 'interaction_data');
				else if( type === types.anim )
					html += '<input type="text" placeholder="Animation" value="'+esc(interaction.data.anim)+'" name="interaction_data" />';
				else if( type === types.door ){
					html += 'Door target: <select name="asset_room">';
					for( let r of room.parent.rooms )
						html += '<option value="'+esc(r.index)+'" '+(interaction.data.index === r.index ? 'selected' : '')+'>'+esc(r.name)+'</option>';
					html += '</select>';
				}
				else if( type === types.exit ){
					html += 'Todo: Dungeon exit';
				}
				else if( type === types.loot )
					html += th.formAssets(interaction.data, 'interaction_data');
				
				else if( type === types.wrappers )
					html += th.formWrappers(interaction.data, 'interaction_data');
				else if( type === types.autoLoot )
					html += '<input type="range" min=0 max=1 step=0.01 value="'+(+interaction.data.val)+'" name="interaction_data">';
				else if( type === types.lever )
					html += 'ID: <input name="interaction_data" value="'+esc(interaction.data.id || 'lever_'+interaction.id.substr(0,8))+'" />';
				
				html += '<br />';
				html += th.formConditions(interaction.conditions, 'interaction_conditions');

				html += '</div>';
				return html;

			}

			const bindInteractions = function(){

				const types = DungeonRoomAssetInteraction.types;
				const base = $("#modal div.assetEditor div.assetDataEditor div.assetData div.interaction");

				// Changed a form value (th.formX goes below)
				$("input, select", base).off('change').on('change', function(){

					const name = $(this).attr('name'),
						div = $(this).closest("div.interaction"),
						id = div.attr("data-id"),
						interaction = asset.getInteractionById(id),
						itype = interaction.type,
						val = $(this).val()	
					;

					// Interaction type has changed
					if( name === "interaction_type" ){

						const itype = $(this).val();
						interaction.type = itype;
						if( !interaction )
							return console.error("Interaction missing", id);
						
						// Todo: Dvar
						if( itype === types.dungeonVar )
							interaction.data = [];
						if( itype === types.autoLoot )
							interaction.data = {val:0.25};
						if( itype === types.door )
							interaction.data = {index:1};
						if( itype === types.anim )
							interaction.data = {anim:"open"};
						if( itype === types.encounters )
							interaction.data = [];
						if( itype === types.exit )
							interaction.data = {};
						if( itype === types.loot )
							interaction.data = [];
						if( itype === types.lever )
							interaction.data = {id:""};
						

						div.replaceWith(addInteraction(interaction));
						bindInteractions();

					}

					else if( name === "interaction_repeats" )
						interaction.repeats = +$(this).val();
					
					else if( name === "interaction_break" )
						interaction.break = $(this).val() || null;

					else if( itype === types.dungeonVar ){
						console.log("Todo: dungeon vars");
					}
					else if( itype === types.anim )
						interaction.data.anim = val;
					else if( itype === types.autoLoot )
						interaction.data.val = +val;
					else if( itype === types.door )
						interaction.data.index = Math.round(val);
					else if( itype === types.exit )
						console.log("Todo: exit");
					else if( itype === types.lever )
						interaction.data.id = val;
					
					
					updateMissingDoors();

				});


				// 
				th.bindDungeonFormHelpers();

				// Changes to form helpers have to be bound here because of bindFormHelpers
				$("div.interaction_data input, div.interaction_data select", base).on('change', function(){
					const wrapper = $(this).closest('div.interaction_data'),
						div = wrapper.closest('div.interaction'),
						id = div.attr("data-id"),
						interaction = asset.getInteractionById(id),
						itype = interaction.type
					;
					
					if( itype === types.wrappers )
						interaction.data = th.compileWrappers("interaction_data");
					else if( itype === types.loot )
						interaction.data = th.compileAssets("interaction_data");
					else if( itype === types.encounters )
						interaction.data = th.compileEncounters("interaction_data");

				});

				// Handle the base forms like wrappers. These are unbound in bindFormHelpers
				$("div.interaction_data > input[type=button]", base).on('click', () => {
					setTimeout(bindInteractions, 10);
				});

				base.on('click', function(event){
					
					if( event.ctrlKey ){
						
						let index = $(this).index();
						asset.interactions.splice(index, 1);
						updateAssetDataEditor();

					}

				});

			}
			let html = '';
			for( let action of asset.interactions )
				html += addInteraction(action);
			
			$("div.assetDataEditor div.assetData", div).html(html);

			bindInteractions();
			$("div.assetDataEditor input.addInteraction", div).off('click').on('click', function(){
				const interaction = new DungeonRoomAssetInteraction({}, asset);
				asset.interactions.push(interaction);
				$("div.assetDataEditor div.assetData", div).append(addInteraction(interaction));
				bindInteractions();
			});


		}
		updateAssetDataEditor();


		// Add the new mesh selector
		let out = '';
		for( let i in libMeshes )
			out += '<option value="'+i+'">'+i+'</option>';
		$("#meshToTest").html(out);
		$("#meshToTest").on('change', function(){
			updateSelects(0);
		});

		// Mesh inputs changed
		$("input.updateMesh", div).on('change', () => {
			asset._stage_mesh.position.x = asset.x = +$("input[name=x]", div).val();
			asset._stage_mesh.position.y = asset.y = +$("input[name=y]", div).val();
			asset._stage_mesh.position.z = asset.z = +$("input[name=z]", div).val();

			asset._stage_mesh.rotation.x = asset.rotX = +$("input[name=rotX]", div).val()*DEG_TO_RAD;
			asset._stage_mesh.rotation.y = asset.rotY = +$("input[name=rotY]", div).val()*DEG_TO_RAD;
			asset._stage_mesh.rotation.z = asset.rotZ = +$("input[name=rotZ]", div).val()*DEG_TO_RAD;

			asset._stage_mesh.scale.x = asset.scaleX = +$("input[name=scaleX]", div).val();
			asset._stage_mesh.scale.y = asset.scaleY = +$("input[name=scaleY]", div).val();
			asset._stage_mesh.scale.z = asset.scaleZ = +$("input[name=scaleZ]", div).val();
			asset.name = $("input[name=name]", div).val();
			
			
		});

		$("select[name=type]", div).on('change', () => {

			const el = $("select[name=type]", div);
			asset.type = el.val();
			updateAssetDataEditor();

		});

		// Add to scene button
		$("#addMeshToScene").on('click', () => {
			if( !meshToAdd )
				return;
			let att = [];
			for( let i in meshToAddModel.attachments )
				att.push(i);
			asset.parent.addAsset( new DungeonRoomAsset({
				model : meshToAdd,
				attachments : att,
				absolute : true
			}, asset.parent) );
			this.drawRoomEditor(asset.parent);
		});
		

	}

	editor_players( asset = {} ){

		const a = new Player(asset);
		let html = '';
			html += 'Label: <input required type="text" name="label" value="'+esc(a.label)+'" /><br />';
			html += 'Name: <input required type="text" name="name" value="'+esc(a.name)+'" /><br />';
			html += 'Species: <input required type="text" name="species" value="'+esc(a.species)+'" /><br />';
			html += 'Description: <textarea name="description">'+esc(a.description)+'</textarea><br />';
			html += 'Art: <input type="text" name="icon" value="'+esc(a.icon)+'" /><br />';
			html += 'Actions: '+this.formActions(a.actions)+'<br />';
			html += 'Assets (alt click to equip): '+this.formAssets(a.assets)+'<br />';
			html += 'Tags: '+this.formTags(a.tags)+'<br />';
			html += 'Team (0=players, 1=enemies): <input type="number" min=0 step=1 name="team" value="'+esc(a.team)+'" /><br />';
			html += 'Size: <input type="range" min=0 step=1 max=10 name="size" value="'+esc(a.size)+'" /><br />';
			html += 'Level (if leveled, this is an offset): <input type="number" step=1 name="level" value="'+esc(a.level)+'" /><br />';
			html += 'Leveled (if leveled, level becomes an offset from the highest level player): <input type="checkbox" name="leveled" '+(a.leveled ? 'checked':'')+' /><br />';
			html += 'Bonus Stamina: <input type="number" step=1 name="stamina" value="'+esc(a.stamina)+'" /><br />';
			html += 'Bonus Intellect: <input type="number" step=1 name="intellect" value="'+esc(a.intellect)+'" /><br />';
			html += 'Bonus Agility: <input type="number" step=1 name="agility" value="'+esc(a.agility)+'" /><br />';
			
			for( let r in Action.Types )
				html += Action.Types[r]+' Resist: <input type="number" step=1 name="sv'+Action.Types[r]+'" value="'+esc(a['sv'+Action.Types[r]])+'" /><br />';

			for( let r in Action.Types )
				html += Action.Types[r]+' Proficiency: <input type="number" step=1 name="bon'+Action.Types[r]+'" value="'+esc(a['bon'+Action.Types[r]])+'" /><br />';
		
			html += 'Sadistic: <input type="range" step=0.1 min=0 max=1 name="sadistic" value="'+esc(a.sadistic)+'" /><br />';
			html += 'Dominant: <input type="range" step=0.1 min=0 max=1 name="dominant" value="'+esc(a.dominant)+'" /><br />';
			html += 'Heterosexual: <input type="range" step=0.1 min=0 max=1 name="hetero" value="'+esc(a.hetero)+'" /><br />';
			html += 'Intelligence: <input type="range" step=0.1 min=0 max=1 name="intelligence" value="'+esc(a.intelligence)+'" /><br />';
			
			
			html += 'Class: '+this.inputClass(asset.class)+'<br />';

			
		this.editor_generic('players', asset, this.mod.players, html, saveAsset => {

			const form = $("#assetForm");
			saveAsset.label = $("input[name=label]", form).val().trim();
			saveAsset.name = $("input[name=name]", form).val().trim();
			saveAsset.species = $("input[name=species]", form).val().trim();
			saveAsset.description = $("textarea[name=description]", form).val().trim();
			saveAsset.icon = $("input[name=icon]", form).val().trim();
			saveAsset.actions = this.compileAction();
			saveAsset.assets = this.compileAssets();
			saveAsset.tags = this.compileTags();
			saveAsset.team = +$("input[name=team]", form).val().trim();
			saveAsset.size = +$("input[name=size]", form).val().trim();
			saveAsset.level = +$("input[name=level]", form).val().trim();
			saveAsset.leveled = $("input[name=leveled]", form).is(':checked');
			saveAsset.stamina = +$("input[name=stamina]", form).val().trim();
			saveAsset.intellect = +$("input[name=intellect]", form).val().trim();
			saveAsset.agility = +$("input[name=agility]", form).val().trim();
			for( let r in Action.Types ){
				const ty = Action.Types[r];
				saveAsset['sv'+ty] = +$("input[name=sv"+ty+"]", form).val().trim();
				saveAsset['bon'+ty] = +$("input[name=bon"+ty+"]", form).val().trim();
			}
			saveAsset.sadistic = +$("input[name=sadistic]", form).val().trim();
			saveAsset.dominant = +$("input[name=dominant]", form).val().trim();
			saveAsset.hetero = +$("input[name=hetero]", form).val().trim();
			saveAsset.intelligence = +$("input[name=intelligence]", form).val().trim();

			saveAsset.inventory = [];
			let index = 0;
			$("#assetForm div.assets input[name=asset].equipped").each(function(){
				if( !$(this).val().trim() )
					return;
				saveAsset.inventory.push(index);
				++index;
			});
			
			saveAsset.class = $("input[name=class]", form).val().trim();
			try{
				saveAsset.class = JSON.parse(saveAsset.class);
			}catch(err){}
			
			
			
		});

		const bind = function(){
			console.log("binding alt");
			$("#assetForm div.assets input[name=asset]").on('click', function(event){
				console.log(event);
				if( !event.altKey )
					return;
				$(this).toggleClass("equipped");
			});
		};

		console.log(a);
		// Colorize
		for( let index of a.inventory )
			$("#assetForm div.assets input[name=asset]").eq(index).toggleClass("equipped", true);
		
		this.bindFormHelpers(() => {
			setTimeout(bind, 10);
		});
		bind();
	}




















	// FORM HELPERS
	// See the individual bind methods for which ones support the onChange callback
	formHelperOnChange( type, el ){
		if( typeof this._formHelperChangedFunction === "function" )
			this._formHelperChangedFunction(type, el);
	}
	bindFormHelpers( onChange ){

		// Binds JSOn as well
		// Has to go above bindConditions since that one binds control clicks
		const th = this;
		$("#modal input.json").off('click').on('click', function(event){
			if( event.shiftKey ){
				if( $(this).is('input') ){
					th.drawJsonEditorFor( this );
				}
				return;
			}
		});

		if( onChange !== undefined )
			this._formHelperChangedFunction = onChange;

		this.bindTags();
		this.bindSoundKits();
		this.bindConditions();
		this.bindActions();
		this.bindWrappers();
		this.bindEffects();
		this.bindWrapperTargetTypes();
		this.bindEvents();
		this.bindAssetSlots();
		this.bindClasses();
		this.bindAssetTemplates();
		this.bindMaterialTemplates();
		this.bindAssets();
		this.bindDungeonRoomTemplates();
		this.bindMeshes();
		this.bindPlayerTemplates();
		this.bindSoundkitSubs();
		this.bindEncounters();
		this.bindPlayers();
		this.bindDungeonVars();
	}

	// Draws a JSON editor for an element
	drawJsonEditorFor( element ){
		let text = $(element).val().trim();
		if( !text )
			text = "{}";
		try{
			text = JSON.parse(text);
		}catch(err){
			console.error("JSON error", err);
		}

		if( typeof text !== "string" )
			text = JSON.stringify(text, null, 3);

		const area = $("#jsonEditor textarea");
		area.val(text);

		const pos = $(element).offset();
		$("#jsonEditor > div").css({'top':pos.top, 'left':pos.left});
		$("#jsonEditor").toggleClass("hidden", false);
		$("#jsonEditor div.buttons > input.save").off('click').on('click', () => {
			let val = $("#jsonEditor textarea").val();
			try{
				val = JSON.parse(val);
				val = JSON.stringify(val);
			}catch(err){}
			$(element).val(val);
			$("#jsonEditor").toggleClass("hidden", true);
		});

	}





	// Tags (bindable)
	bindTags(){
		let th = this;
		$("#modal input.addTagHere").off('click').on('click', function(){
			const dList = $(this).parent().attr('data-list');
			$(this).parent().append(th.inputTags("", dList));
			th.bindFormHelpers();
		});

		$("input[name=tag]").off('change').on('change', function(){
			th.formHelperOnChange("Tags", $(this).parent());
		});
	}

	inputTags( tag = '', dataList = 'tagsFull' ){
		return '<input type="text" name="tag" value="'+esc(tag)+'" list="'+dataList+'" />';
	}

	// Compiles text tags into an array
	compileTags( cName = 'tags' ){
		const base = $('#modal div.'+cName+' input[name=tag]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	formTags( tags = [], cName = 'tags', dataList = 'tagsFull' ){
		let out = '<div class="'+cName+'" data-list="'+dataList+'">';
		out += '<input type="button" class="addTagHere" value="Add Tag" />';
		for( let tag of tags )
			out+= this.inputTags(tag, dataList);
		out += '</div>';
		return out;
	}


	// Condition types
	compileConditionTypes( cName = 'conditionType' ){
		return $("#assetForm div."+cName+" > select").val();
	}
	formConditionTypes( type = '', cName = 'conditionType' ){
		const lib = Condition.Types;
		let out = '<div class="'+cName+'">';
			out += '<select name="conditionType">';
			for( let i in lib )
				out += '<option title="'+esc(Condition.descriptions[lib[i]])+'" value="'+lib[i]+'" '+(lib[i] === type ? 'selected' : '')+'>'+i+'</option>';
			out += '</select>';
		out += '</div>';
		return out;
	}


	// Single stats
	inputPrimaryStat( stat, name = 'primaryStat' ){
		let out = '<select name="'+esc(name)+'">';
		for( let i in Player.primaryStats )
			out += '<option value="'+i+'" '+(stat === i ? 'selected' : '')+'>'+i+'</option>';
		out += '</select>';
		return out;
	}

	// Action target types
	inputTargetType( type, name = 'targetType' ){
		let out = '<select name="'+esc(name)+'">';
		for( let i in Action.TargetTypes )
			out += '<option value="'+i+'" '+(type === i ? 'selected' : '')+'>'+i+'</option>';
		out += '</select>';
		return out;
	}

	inputActionType( type, name = 'actionType' ){
		let out = '<select name="'+esc(name)+'">';
		for( let i in Action.Types )
			out += '<option value="'+Action.Types[i]+'" '+(type === Action.Types[i] ? 'selected' : '')+'>'+Action.Types[i]+'</option>';
		out += '</select>';
		return out;
	}

	inputEffectType( type, name = 'effectType' ){
		let out = '<select name="'+esc(name)+'">';
		for( let i in Effect.Types )
			out += '<option title="'+esc(Effect.TypeDescs[i])+'" value="'+Effect.Types[i]+'" '+(type === Effect.Types[i] ? 'selected' : '')+'>'+Effect.Types[i]+'</option>';
		out += '</select>';
		return out;
	}






	// CONDITIONS (Bindable)
	bindConditions( ){
		let th = this;
		// Add/Change Type
		$("#modal div.condPanel span").off('click')
			.on('click', function(event){
				const el = $(this);
				if( el.hasClass('add') ){
					el.parent().parent().append(th.inputConditions(""));
				}
				else if( el.hasClass('addOr') ){
					el.parent().parent().append(th.formConditions([{}], 'subConditions', true));
				}
				else if( el.hasClass('convertToAnd') ){
					$('> span', el.parent()).toggleClass('hlt', false);
					el.toggleClass('hlt', true);
				}
				else if( el.hasClass('convertToOr') ){
					$('> span', el.parent()).toggleClass('hlt', false);
					el.toggleClass('hlt', true);				
				}
				
				th.formHelperOnChange("Conditions", el.closest("div.condWrapper"));
				th.bindFormHelpers();
				//
			});

		// Control & shift click
		$("#modal div.condWrapper.subConditions, #modal div.condWrapper > input[name=condition]:not(.json)").off('click');
		$("#modal div.condWrapper.subConditions, #modal div.condWrapper > input[name=condition]").on('click', function(event){
			if( !event.ctrlKey )
				return;

			event.stopImmediatePropagation();
			th.formHelperOnChange("Conditions", $(this).closest("div.condWrapper"));
			$(this).remove();
			return false;
		});
		$("#modal div.condWrapper > input[name=condition]").on('change', function(event){
			th.formHelperOnChange("Conditions", $(this).closest("div.condWrapper"));
		});
		// Templates
		$("div.presetConditions > input").off('click').on('click', function(){

			const cName = $(this).parent().attr('data-cname');
			const conds = JSON.parse($(this).attr('data-conds'));
			const baselevel = $("#modal div.condWrapper."+cName+" > input[name=condition]");

			for( let cond of conds ){
				if( typeof cond !== "string" )
					cond = JSON.stringify(cond);
				if( baselevel.filter((_,el) => $(el).val() === cond).length )
					continue;

				th.formHelperOnChange("Conditions", baselevel.closest("div.condWrapper"));
				$("#modal div.condWrapper."+cName).append(th.inputConditions(cond));
			}

		});
	
	}

	compileConditionElement( base ){

		console.log("Compiling conditions under", base);
		const isOr = base.hasClass('subConditions') && $('span.convertToOr',base).hasClass('hlt');
		const out = {
			conditions : [],
			min : isOr ? 1 : -1
		};

		$('>',base).each((index, value) => {
			const el = $(value);
			if( el.is('input[name=condition]') ){
				let base = el.val().trim(), val = base;
				try{
					base = JSON.parse(base);
					val = base;
				}catch(err){}
				if( val )
					out.conditions.push(val);
			}
			else if( el.is('div.subConditions') ){
				out.conditions.push(this.compileConditionElement(el));
			}
		});
		return out;

	}

	// cName can also be a dom element
	compileConditions( cName = 'conditions', parent ){

		const base = $('div.'+cName, parent);
		return this.compileConditionElement(base).conditions;
		
	}

	inputConditions( cond = '' ){
		
		if( typeof cond !== 'string' )
			cond = JSON.stringify(cond);
		return '<input type="text" class="json" name="condition" value="'+esc(cond)+'" list="conditions" />';

	}

	formConditions( conds = [], cName = 'conditions', isOr = false ){

		let out = '<div class="condWrapper '+cName+'">';
		out += '<div class="condPanel">'+
			'<span class="add">+Cond</span> '+
			'<span class="addOr">+Logic</span> '+
			(cName === 'subConditions' ? 
				' | '+
				'<span class="convertToAnd '+(!isOr ? 'hlt' : '')+'">AND</span>'+
				'<span class="convertToOr '+(isOr ? 'hlt' : '')+'">OR</span>' 
			: '')+
		'</div>';
		for( let cond of conds ){
			if( Array.isArray(cond) )
				cond = {conditions:cond};
			if( Array.isArray(cond.conditions) && cond.conditions.length ){
				out += this.formConditions(cond.conditions, 'subConditions', cond.min != -1);
			}
			else
				out+= this.inputConditions(cond);
		}
		out += '</div>';
		return out;

	}

	// Builds preset condition buttons
	// Accepts an object with label : [conditions...]
	presetConditions( buttons = {}, cName = 'conditions' ){
		let out = 'Collections: <div class="presetConditions" data-cname="'+esc(cName)+'">';
		for( let i in buttons )
			out += '<input type="button" value="'+i+'" data-conds="'+esc(JSON.stringify(buttons[i]))+'" />';
		out += '</div>';
		return out;
	}







	// Events (bindable)
	inputEvent( type ){
		let out = '<select name="event">';
		for( let i in GameEvent.Types )
			out += '<option title="'+esc(GameEvent.TypeDescs[i])+'" value="'+GameEvent.Types[i]+'" '+(type === GameEvent.Types[i] ? 'selected' : '')+'>'+GameEvent.Types[i]+'</option>';
		out += '</select>';
		return out;
	}
	bindEvents(){
		let th = this;
		$("#modal input.addEventHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputEvent(""));
				th.bindFormHelpers();
			});
	}

	compileEvents( cName = 'events' ){
		const base = $('#modal div.'+cName+' select[name=event]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formEvents( names = [], cName = 'events' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addEventHere" value="Add Event" />';
		for( let name of names )
			out+= this.inputEvent(name);
		out += '</div>';
		return out;

	}



	// DungeonVars (bindable)
	inputDungeonVar( key, val ){
		if( typeof val === "object" )
			val = JSON.stringify(val);
		return '<div class="_dvar">'+
			'<input type="text" name="dungeonVar_key" value="'+esc(key)+'" />'+
			'<input type="text" class="json" name="dungeonVar_val" value="'+esc(val)+'" />'+
		'</div>';
	}

	bindDungeonVars(){
		let th = this;
		$("#modal input.addDungeonVarHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputDungeonVar("key","val"));
				th.bindFormHelpers();
				th.formHelperOnChange();
			});
	}

	compileDungeonVars( cName = 'dvars' ){
		const base = $('#modal div.'+cName+' div._dvar');
		const out = {};
		base.each((index, value) => {
			const el = $(value);
			let key = $("input[name=dungeonVar_key]").val().trim();
			let val = $("input[name=dungeonVar_val]", el).val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( key )
				out[key] = val;
		});
		return out;
	}

	formDungeonVars( vars = {}, cName = 'dvars' ){

		if( typeof vars != "object" )
			vars = {};
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addDungeonVarHere" value="Add DungeonVar" />';
		for( let i in vars )
			out+= this.inputDungeonVar(i, vars[i]);
		out += '</div>';
		return out;

	}




	// Events (bindable)
	inputPlayer( data ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="player" value="'+esc(data)+'" list="players" />';
	}

	bindPlayers(){
		let th = this;
		$("#modal input.addPlayerHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputPlayer(""));
				th.bindFormHelpers();
				th.formHelperOnChange();
			});
	}

	compilePlayers( cName = 'players' ){
		const base = $('#modal div.'+cName+' input[name=player]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formPlayers( names = [], cName = 'players' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addPlayerHere" value="Add Player" />';
		for( let name of names )
			out+= this.inputPlayer(name);
		out += '</div>';
		return out;

	}



	// Encounter (bindable)
	inputEncounter( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="encounter" value="'+esc(data)+'" list="encounters" />';
	}

	bindEncounters(){
		let th = this;
		$("#modal input.addEncounterHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputEncounter(""));
				th.bindFormHelpers();
			});

		// No off needed for json fields
		$("#modal input[name=encounter]").off('change').on('change', function(){
			th.formHelperOnChange("Encounters", $(this).parent());
		});
	}

	compileEncounters( cName = 'encounters' ){
		const base = $('#modal div.'+cName+' input[name=encounter]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}
			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formEncounters( names = [], cName = 'encounters' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addEncounterHere" value="Add Encounter" />';
		for( let name of names )
			out+= this.inputEncounter(name);
		out += '</div>';
		return out;

	}

	
	// AssetSlots (bindable)
	inputAssetSlot( slot ){
		let out = '<select name="assetSlot">';
		for( let i in Asset.Slots )
			out += '<option value="'+Asset.Slots[i]+'" '+(slot === Asset.Slots[i] ? 'selected' : '')+'>'+Asset.Slots[i]+'</option>';
		out += '</select>';
		return out;
	}
	bindAssetSlots(){
		let th = this;
		$("#modal input.addAssetSlotHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputAssetSlot(""));
				th.bindFormHelpers();
			});
	}

	compileAssetSlots( cName = 'assetSlots' ){
		const base = $('#modal div.'+cName+' select[name=assetSlot]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	formAssetSlots( names = [], cName = 'assetSlots' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addAssetSlotHere" value="Add Asset Slot" />';
		for( let name of names )
			out+= this.inputAssetSlot(name);
		out += '</div>';
		return out;

	}



	// DungeonRoomTemplates (bindable)
	inputDungeonRoomTemplate( data ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="dungeonRoomTemplate" value="'+esc(data)+'" list="roomTemplates" />';
	}
	
	bindDungeonRoomTemplates(){
		let th = this;
		$("#modal input.addDungeonRoomTemplateHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputDungeonRoomTemplate(""));
				th.bindFormHelpers();
			});
	}

	compileDungeonRoomTemplates( cName = 'dungeonRoomTemplates' ){
		const base = $('#modal div.'+cName+' input[name=dungeonRoomTemplate]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}
			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formDungeonRoomTemplates( names = [], cName = 'dungeonRoomTemplates' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addDungeonRoomTemplateHere" value="Add Room Template" />';
		for( let name of names )
			out+= this.inputDungeonRoomTemplate(name);
		out += '</div>';
		return out;

	}



	// Mesh (bindable)
	inputMesh( data ){
		
		let out = '<select name="mesh">';
		for( let mesh of meshLib )
			out += '<option value="'+esc(mesh)+'" '+(data === mesh ? 'selected' : '')+'>'+esc(mesh)+'</option>';
		out += '</select>';
		return out;

	}

	bindMeshes(){
		let th = this;
		$("#modal input.addMeshHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputMesh(""));
				th.bindFormHelpers();
			});
	}

	compileMeshes( cName = 'meshes' ){
		const base = $('#modal div.'+cName+' select[name=mesh]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formMeshes( names = [], cName = 'meshes' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addMeshHere" value="Add Mesh" />';
		for( let name of names )
			out+= this.inputMesh(name);
		out += '</div>';
		return out;

	}




	// PlayerTemplate (bindable)
	inputPlayerTemplate( data ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="playerTemplate" value="'+esc(data)+'" list="playerTemplates" />';
	}

	bindPlayerTemplates(){
		let th = this;
		$("#modal input.addPlayerTemplateHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputPlayerTemplate(""));
				th.bindFormHelpers();
			});
	}

	compilePlayerTemplates( cName = 'playerTemplates' ){
		const base = $('#modal div.'+cName+' input[name=playerTemplate]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}
			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formPlayerTemplates( names = [], cName = 'playerTemplates' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addPlayerTemplateHere" value="Add Player Template" />';
		for( let name of names )
			out+= this.inputPlayerTemplate(name);
		out += '</div>';
		return out;

	}



	inputSoundkitSub( data ){
		if( typeof data !== "object" )
			data = {};
		if( typeof data.s !== "object" )
			data.s = {};
		return '<div class="soundkitPack">URL: <input type="text" name="soundkit_url" value="'+esc(data.s.path)+'" />'+
			'Volume: <input type="range" min=0 max=1 step=0.01 name="soundkit_vol" value="'+esc(data.s.volume)+'" />'+
			'Sender: <input type="checkbox" name="soundkit_sender" '+(data.se ? 'checked':'')+' />'+
			'Predelay MS: <input type="number" min=0 step=1 name="soundkit_predelay" value="'+esc(data.t)+'" />'+
		'</div>';
	}

	bindSoundkitSubs(){
		let th = this;
		$("#modal input.addSoundkitSubHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputSoundkitSub(""));
				th.bindFormHelpers();
			});
	}

	compileSoundkitSubs( cName = 'soundkitSubs' ){
		const base = $('#modal div.'+cName+' div.soundkitPack');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const obj = {
				s : {
					path : $("input[name=soundkit_url]", el).val(),
					volume : +$("input[name=soundkit_vol]", el).val(),
				},
				se : $("input[name=soundkit_sender]", el).is(':checked'),
				t : +$("input[name=soundkit_predelay]", el).val(),
			};
			if( obj.s.path )
				out.push(obj);
		});
		return out;
	}

	formSoundkitSubs( names = [], cName = 'soundkitSubs' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addSoundkitSubHere" value="Add Sound" />';
		for( let name of names )
			out+= this.inputSoundkitSub(name);
		out += '</div>';
		return out;

	}


	



	// Wrapper target (bindable)
	inputWrapperTargetType( type, name = 'wrapperTT' ){
		let out = '<select name="'+esc(name)+'">';
		for( let i in Wrapper.Targets )
			out += '<option value="'+Wrapper.Targets[i]+'" '+(type === Wrapper.Targets[i] ? 'selected' : '')+'>'+i+'</option>';
		out += '</select>';
		return out;
	}

	bindWrapperTargetTypes(){
		let th = this;
		$("#modal input.addWrapperTTHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputWrapperTargetType(""));
				th.bindFormHelpers();
			});
	}

	compileWrapperTargetTypes( cName = 'wrapperTTs' ){
		const base = $('#modal div.'+cName+' select[name=wrapperTT]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}
			if( val && val !== "none" )
				out.push(val);
		});
		return out;
	}

	formWrapperTargetTypes( names = [], cName = 'wrapperTTs' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addWrapperTTHere" value="Add Wrapper Target" />';
		for( let name of names )
			out+= this.inputWrapperTargetType(name);
		out += '</div>';
		return out;

	}










	
	// Wrappers (Bindable)
	bindWrappers(){
		let th = this;
		$("#modal input.addWrapperHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputWrapper(""));
				th.bindFormHelpers();
			});
	}

	compileWrappers( cName = 'wrappers' ){
		const base = $('#modal div.'+cName+' input[name=wrapper]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputWrapper( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="wrapper" value="'+esc(data)+'" list="wrappers" />';
	}

	formWrappers( names = [], cName = 'wrappers' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addWrapperHere" value="Add Wrapper" />';
		for( let name of names )
			out+= this.inputWrapper(name);
		out += '</div>';
		return out;

	}






	// Classes (Bindable)
	bindClasses(){
		let th = this;
		$("#modal input.addClassHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputClass(""));
				th.bindFormHelpers();
			});
	}

	compileClasses( cName = 'classes' ){
		const base = $('#modal div.'+cName+' input[name=class]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputClass( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="class" value="'+esc(data)+'" list="classes" />';
	}

	formClasses( names = [], cName = 'classes' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addClassHere" value="Add Class" />';
		for( let name of names )
			out+= this.inputClass(name);
		out += '</div>';
		return out;

	}

	



	// Asset templates (Bindable)
	bindAssetTemplates(){
		let th = this;
		$("#modal input.addAssetTemplateHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputAssetTemplate(""));
				th.bindFormHelpers();
			});
	}

	compileAssetTemplates( cName = 'assetTemplates' ){
		const base = $('#modal div.'+cName+' input[name=assetTemplate]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputAssetTemplate( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="assetTemplate" value="'+esc(data)+'" list="assetTemplates" />';
	}

	formAssetTemplates( names = [], cName = 'assetTemplates' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addAssetTemplateHere" value="Add Asset Template" />';
		for( let name of names )
			out+= this.inputAssetTemplate(name);
		out += '</div>';
		return out;

	}





	// Matierial templates (Bindable)
	bindMaterialTemplates(){
		let th = this;
		$("#modal input.addMaterialTemplateHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputMaterialTemplate(""));
				th.bindFormHelpers();
			});
	}

	compileMaterialTemplates( cName = 'materialTemplates' ){
		const base = $('#modal div.'+cName+' input[name=materialTemplate]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputMaterialTemplate( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="materialTemplate" value="'+esc(data)+'" list="materialTemplates" />';
	}

	formMaterialTemplates( names = [], cName = 'materialTemplates' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addMaterialTemplateHere" value="Add Material Template" />';
		for( let name of names )
			out+= this.inputMaterialTemplate(name);
		out += '</div>';
		return out;

	}






	// Matierial templates (Bindable)
	bindAssets(){
		let th = this;
		$("#modal input.addAssetHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputAsset(""));
				th.bindFormHelpers();
				th.formHelperOnChange("Assets", $(this).parent());
			});
	}

	compileAssets( cName = 'assets' ){
		const base = $('#modal div.'+cName+' input[name=asset]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputAsset( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="asset" value="'+esc(data)+'" list="assets" />';
	}

	formAssets( names = [], cName = 'assets' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addAssetHere" value="Add Asset" />';
		for( let name of names )
			out+= this.inputAsset(name);
		out += '</div>';
		return out;

	}








	// Effects (bindable)
	bindEffects(){
		let th = this;
		$("#modal input.addEffectHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputEffect(""));
				th.bindFormHelpers();
			});
	}

	compileEffects( cName = 'effects' ){
		const base = $('#modal div.'+cName+' input[name=effect]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			let val = el.val().trim();
			try{
				val = JSON.parse(val);
			}catch(err){}

			if( val )
				out.push(val);
		});
		return out;
	}

	inputEffect( data = '' ){
		if( typeof data === "object" )
			data = JSON.stringify(data);
		return '<input type="text" class="json" name="effect" value="'+esc(data)+'" list="effects" />';
	}

	formEffects( names = [], cName = 'effects' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addEffectHere" value="Add Effects" />';
		for( let name of names )
			out+= this.inputEffect(name);
		out += '</div>';
		return out;

	}	









	// ARMOR SLOTS - NO BIND
	compileArmorSlot(){
		const base = $('#modal select[name=armorSlot]');
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
		$("#modal input.addSoundKitHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputSoundKit(""));
			});
	}

	compileSoundKits( cName = 'soundKits' ){
		const base = $('#modal div.'+cName+' input[name=soundKit]');
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

		if( !Array.isArray(kits) )
			kits = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addSoundKitHere" value="Add SoundKit" />';
		for( let kit of kits )
			out+= this.inputSoundKit(kit);
		out += '</div>';
		return out;

	}





	// Actions (Bindable)
	bindActions(){
		let th = this;
		$("#modal input.addActionHere").off('click')
			.on('click', function(){
				$(this).parent().append(th.inputAction(""));
			});
	}

	compileAction( cName = 'actions' ){
		const base = $('#assetForm div.'+cName+' input[name=action]');
		const out = [];
		base.each((index, value) => {
			const el = $(value);
			const val = el.val().trim();
			if( val )
				out.push(val);
		});
		return out;
	}

	inputAction( name = '' ){
		return '<input type="text" class="json" name="action" value="'+esc(name)+'" list="actions" />';
	}

	formActions( names = [], cName = 'actions' ){

		if( !Array.isArray(names) )
			names = [];
		let out = '<div class="'+cName+'">';
		out += '<input type="button" class="addActionHere" value="Add Action" />';
		for( let name of names )
			out+= this.inputAction(name);
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

			

			renderer.start();
			

		};	
*/