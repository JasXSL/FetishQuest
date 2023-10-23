import HelperAsset from './HelperAsset.js';
import { AudioMusic } from '../../classes/Audio.js';
import Generic from '../../classes/helpers/Generic.js';
import Regions from '../../ext/wavesurfer/regions.esm.js';
import WaveSurfer from '../../ext/wavesurfer/wavesurfer.esm.js';

const DB = 'audioMusic',
	CONSTRUCTOR = AudioMusic;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();


	let html = '';

	html += '<div class="labelFlex">';
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>URL <input type="text" class="saveable" name="url" value="'+esc(dummy.url)+'" /></label>';
		html += '<label>Track Name <input type="text" class="saveable" name="name" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Author <input type="text" class="saveable" name="author" value="'+esc(dummy.author)+'" /></label>';
		html += '<label>Loop <input type="checkbox" class="saveable" name="loop" '+(dummy.loop ? 'checked' : '')+' /></label><br />';
		html += '<label>Volume <input type="number" min=0 max=1 step=0.01 class="saveable" name="vol" value="'+(+dummy.vol || 0)+'" /></label><br />';
		html += '<label>BPM <input type="number" min=10 max=300 step=1 class="saveable" name="bpm" value="'+(+dummy.bpm || 0)+'" /></label><br />';
		html += '<label title="Bars">In: <input type="number" min=-1 step=1 class="saveable" name="in" value="'+(parseInt(dummy.in) || 0)+'" /></label><br />';
		html += '<label title="Bars">Out: <input type="number" min=-1 step=1 class="saveable" name="out" value="'+(parseInt(dummy.out) || 0)+'" /></label><br />';
	html += '</div>';

	html += '<div class="audioRender main"></div>';
	html += '<input type="button" value="Play/Pause" class="mainPlay" />';
	html += '<label>Loop <input type="checkbox" class="mainLoop" /></label>';

	html += '<div class="labelFlex">';
		html += '<label>Combat URL <input type="text" class="saveable" name="url_combat" value="'+esc(dummy.url_combat)+'" /></label><br />';
		html += '<label>Combat Track Name <input type="text" class="saveable" name="name_combat" value="'+esc(dummy.name_combat)+'" /></label>';
		html += '<label>Combat Author <input type="text" class="saveable" name="author_combat" value="'+esc(dummy.author_combat)+'" /></label>';
		html += '<label>Combat Volume <input type="number" min=0 max=1 step=0.01 class="saveable" name="vol_combat" value="'+(+dummy.vol_combat || 0)+'" /></label><br />';
		html += '<label>Combat BPM <input type="number" min=10 max=300 step=1 class="saveable" name="bpm_combat" value="'+(+dummy.bpm_combat || 0)+'" /></label><br />';
		html += '<label title="Bars">Combat In: <input type="number" min=-1 step=1 class="saveable" name="in_combat" value="'+(parseInt(dummy.in_combat) || 0)+'" /></label><br />';
		html += '<label title="Bars">Combat Out: <input type="number" min=-1 step=1 class="saveable" name="out_combat" value="'+(parseInt(dummy.out_combat) || 0)+'" /></label><br />';
	html += '</div>';

	html += '<div class="audioRender combat"></div>';
	
	//html += 'Conditions: <br />';
	//html += '<div class="conditions"></div>';


	this.setDom(html);

	const 
		domUrl = this.dom.querySelector("input[name=url]"),
		domIn = this.dom.querySelector("input[name=in]"),
		domOut = this.dom.querySelector("input[name=out]"),
		domPlay = this.dom.querySelector("input.mainPlay"),
		domLoop = this.dom.querySelector("input.mainLoop")
	;

	const bpmToTime = (bar, bpm) => {
		return bar*4*60/bpm;
	}

	const redrawRegions = () => {
		
		let start = bpmToTime(Math.max(+domIn.value, 0), dummy.bpm);
		let end = +domOut.value;
		if( end < 1 )
			end = this._wsa.getDuration();
		else
			end = bpmToTime(end, dummy.bpm);

		console.log(start, end);

		const color = 'rgba(0,50,0,.25)';
		this._wsaRegion.setOptions({
			start : start, 
			end : end, 
			color : color
		});
		

	};

	this._wsa = WaveSurfer.create({
		container: '.audioRender.main',
		waveColor: '#4F4A85',
		progressColor: '#383351',
		url: dummy.url,
	});
	this._wsa.on('ready', () => {
		setTimeout(redrawRegions, 1); // Library is busted
	});

	let regions = this._wsa.registerPlugin(Regions.create());
	this._wsaRegion = regions.addRegion({
		start :0,
		end: 10,
		content: 'Loop points',
		drag: false,
		resize: false,
	});
	regions.on('region-out', () => {
		
		if( domLoop.checked )
			this._wsaRegion.play();
		
	});
	

	domIn.onchange = domOut.onchange = () => redrawRegions();
	domPlay.onclick = () => {
		if( this._wsa.isPlaying() )
			this._wsa.stop();
		else
			this._wsa.play();
	};
	
	window.wsa = this._wsa;
	console.log(window.wsa);

	// Set asset tables
	//this.dom.querySelector("div.conditions").appendChild(assetTable(this, asset, "conditions"));

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label'], single, false);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		"*label" : true,
		"name" : true,
		"url" : true,
		"name_combat" : true,
		"url_combat" : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'track_'+Generic.generateUUID(),
	}));

};

