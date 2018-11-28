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

			console.log("Creating new mod");
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
			['Text','Conditions','TurnTags','HitSlot','Audio','aAuto','nTarg','aOut','Debug'],
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



	// Todo: Find similarities in this, and make a generic mma to lower the amount of code needed for the rest of these assets



	mml_conditions(){

		this.mml_generic( 
			'conditions', 
			['Label','Type','IsCol.','Data','TargNr','Sender','Inverse','Any Player'],
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
				let asset = new Condition({label:Generic.generateUUID().substr(0,8), type:Condition.Types.event}).save(true);
				asset.min = 1;
				asset.max = -1;
				return asset;
			}
		);

	}

	mml_quests(){
		console.log("Todo: Quests");
	}

	mml_dungeons(){
		console.log("Todo: Dungeons");
	}
	mml_playerClasses(){

	}
	mml_action(){

	}
	mml_wrappers(){

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






	// EDITORS
	editor_generic( sfType, asset, library, formData, onSave ){

		let html = '<form id="assetForm">';
			html += formData;
			html += '<input type="submit" value="Save" />';
			html += '<input type="button" value="Save Copy" id="assetSaveCopy" />';
			html += '<input type="button" value="Delete" id="assetDelete" />';
		html += '</form>';

		this.modal.set(html);
		this.bindFormHelpers();

		const save = async () => {
			onSave(asset);
			await this.mod.save();
			this['mml_'+sfType]();
			this.modal.close();
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

		$("#assetForm").on('submit', () => {
			save();
			this.mod.save();
			return false;
		});

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
			saveAsset.alwaysAuto = $("input[name=alwaysAuto]", form).is(':checked');
			saveAsset.alwaysOutput = $("input[name=alwaysOutput]", form).is(':checked');
			saveAsset.debug = $("input[name=debug]", form).is(':checked');
			saveAsset.turnTags = this.compileTags();
			saveAsset.armor_slot = this.compileArmorSlot();
			saveAsset.audiokits = this.compileSoundKits();
			saveAsset.conditions = this.compileConditions();
		});
		updateTextDisplay();

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
			html += 'Type: '+this.formConditionTypes()+'<br />';
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










	// FORM HELPERS
	bindFormHelpers(){

		// Binds JSOn as well
		// Has to go above bindConditions since that one binds control clicks
		const th = this;
		$("#assetForm input.json").off('click').on('click', function(){
			if( event.shiftKey ){
				if( $(this).is('input') ){
					th.drawJsonEditorFor( this );
				}
				return;
			}
		});


		this.bindTags();
		this.bindSoundKits();
		this.bindConditions();

		

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




	// CONDITIONS (Bindable)
	bindConditions(){
		let th = this;
		// Add/Change Type
		$("#assetForm div.condPanel span").off('click')
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
				
				th.bindFormHelpers();
				//
			});

		// Control & shift click
		$("#assetForm div.condWrapper.subConditions, #assetForm div.condWrapper > input[name=condition]:not(.json)").off('click');
		$("#assetForm div.condWrapper.subConditions, #assetForm div.condWrapper > input[name=condition]").on('click', function(event){
			if( !event.ctrlKey )
				return;

			event.stopImmediatePropagation();
			$(this).remove();
			return false;
		});

		// Templates
		$("div.presetConditions > input").off('click').on('click', function(){

			const cName = $(this).parent().attr('data-cname');
			const conds = JSON.parse($(this).attr('data-conds'));
			const baselevel = $("#assetForm div.condWrapper."+cName+" > input[name=condition]");

			for( let cond of conds ){
				if( typeof cond !== "string" )
					cond = JSON.stringify(cond);
				if( baselevel.filter((_,el) => $(el).val() === cond).length )
					continue;

				$("#assetForm div.condWrapper."+cName).append(th.inputConditions(cond));
			}

		});
	
	}

	compileConditionElement( base ){

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

	compileConditions( cName = 'conditions' ){

		const base = $('#assetForm div.'+cName);
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

		if( !Array.isArray(kits) )
			kits = [];
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