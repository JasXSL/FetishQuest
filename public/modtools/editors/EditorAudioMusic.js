import HelperAsset from './HelperAsset.js';
import { AudioMusic } from '../../classes/Audio.js';
import Generic from '../../classes/helpers/Generic.js';
import Regions from '../../ext/wavesurfer/regions.esm.js';
import Timeline from '../../ext/wavesurfer/timeline.esm.js';
import WaveSurfer from '../../ext/wavesurfer/wavesurfer.esm.js';
import Multitrack from '../../ext/wavesurfer/multitrack.js';


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

		html += '<label>Track Name <input type="text" class="saveable" name="name" value="'+esc(dummy.name)+'" /></label>';
		html += '<label>Author <input type="text" class="saveable" name="author" value="'+esc(dummy.author)+'" /></label>';
		html += '<label>Volume <input type="number" min=0 max=1 step=0.01 class="saveable" name="vol" value="'+(+dummy.vol || 0)+'" /></label>';
		html += '<label>BPM <input type="number" min=10 max=300 step=1 class="saveable redraw" name="bpm" value="'+(+dummy.bpm || 0)+'" /></label>';
		html += '<label title="Use simple crossfade when swapping TO this track. This is the fade time in milliseconds.">Simple Fade In <input type="number" min=0 step=1 class="saveable" name="fade" value="'+(parseInt(dummy.fade) || 0)+'" /></label>';
		html += '<label title="Use simple crossfade when swapping FROM this track. This is the fade time in milliseconds. Overrides any IN fade set.">Simple Fade Out <input type="number" min=0 step=1 class="saveable" name="fade_out" value="'+(parseInt(dummy.fade_out) || 0)+'" /></label>';
		
	html += '</div><div class="labelFlex">';	

		html += '<label>Loop URL <input type="text" class="saveable redraw" name="loop" value="'+esc(dummy.loop)+'" /></label>';
		html += '<label title="Bars">In: <input type="number" min=-1 step=1 class="saveable redraw" name="in" value="'+(parseInt(dummy.in) || 0)+'" /></label><br />';
		html += '<label title="Bars">Out: <input type="number" min=-1 step=1 class="saveable redraw" name="out" value="'+(parseInt(dummy.out) || 0)+'" /></label><br />';
	html += '</div><div class="labelFlex">';	
		
		html += '<label>Transition Points: <div class="transitionPoints"></div><input type="button" class="addTransitionPoint" value="+ Add" /></label>';
	
	html += '</div><div class="labelFlex">';	

		html += '<label>Intro URL <input type="text" class="saveable redraw" name="intro" value="'+esc(dummy.intro)+'" /></label>';
		html += '<label title="Bars">In: <input type="number" min=1 step=1 class="saveable redraw" name="intro_point" value="'+(parseInt(dummy.intro_point) || 0)+'" /></label><br />';

	html += '</div><div class="labelFlex">';	

		html += '<label>Outro URL <input type="text" class="saveable redraw" name="outro" value="'+esc(dummy.outro)+'" /></label>';
		html += '<label title="Bars">Out: <input type="number" min=1 step=1 class="saveable redraw" name="outro_point" value="'+(parseInt(dummy.outro_point) || 0)+'" /></label><br />';

	html += '</div>';

	html += '<div class="audioRender main"></div>';
	html += '<input type="button" value="Play/Pause" class="mainPlay" />';
	
	//html += 'Conditions: <br />';
	//html += '<div class="conditions"></div>';


	this.setDom(html);

	
	const 
		domIn = this.dom.querySelector("input[name=in]"),
		domOut = this.dom.querySelector("input[name=out]"),
		domOutroPoint = this.dom.querySelector("input[name=outro_point]"),
		domIntroPoint = this.dom.querySelector("input[name=intro_point]"),
		domBpm = this.dom.querySelector("input[name=bpm]"),
		domPlay = this.dom.querySelector("input.mainPlay"),
		domLoop = this.dom.querySelector("input[name=loop]"),
		domIntro = this.dom.querySelector("input[name=intro]"),
		domOutro = this.dom.querySelector("input[name=outro]"),
		domAddTransitionPoints = this.dom.querySelector("input.addTransitionPoint"),
		domTransitionPoints = this.dom.querySelector("div.transitionPoints")
	;

	// Helper for the viewer
	let loopFile, introFile, outroFile, loading;
	this._multitrack = null;

	const height = 64;
	const waveColor = '#DDFFDD';
	

	// Draws the multitrack viewer
	const drawViewer = async () => {

		const introTime = AudioMusic.barToTime(domIntroPoint.value-1 || 0, +domBpm.value);
		const outroTime = AudioMusic.barToTime(domOutroPoint.value-1 || 0, +domBpm.value);
		const loopStart = AudioMusic.barToTime(domIn.value-1 || 0, +domBpm.value);
		const loopEnd = AudioMusic.barToTime(domOut.value-1 || 0, +domBpm.value);

		// If a file is changed, restart
		if( domIntro.value !== introFile || domLoop.value !== loopFile || domOutro.value !== outroFile ){

			loopFile = domLoop.value;
			introFile = domIntro.value;
			outroFile = domOutro.value;

			if( this._multitrack )
				this._multitrack.destroy();

			// Need all 3 for it to function
			if( !loopFile || !introFile || !outroFile )
				return;

			const tracks = [
				{
					id: 0,
					draggable : false,
					startPosition : introTime-loopStart,
					url : loopFile,
					envelope : false,
					options : {
						height,
						waveColor
					},
					markers : [] // Todo: these need to be populated
				}
			];

			if( introFile )
				tracks.push({
					id : 1,
					url : introFile,
					startPosition : 0,
					draggable : false,
					envelope : false,
					options : {
						height,
						waveColor
					},
					markers : []
				});

			if( outroFile )
				tracks.push({
					id : 2,
					url : outroFile,
					startPosition : loopEnd-outroTime,
					draggable : false,
					envelope : false,
					options : {
						height,
						waveColor
					},
					markers : [
						{
							time : outroTime,
							color : 'rgba(255,100,100,.25)',
							drag : false,
						}
					]
				});

			// Disable the play button until we load
			domPlay.disabled = true;
			domPlay.onclick = false;
			this._multitrack = Multitrack.create(
				tracks,
				{
					container : document.querySelector('.audioRender.main'),
					trackBackground : '#232323',
					dragBounds : true,
				}
			);
			loading = new Promise(res => {
				this._multitrack.once('canplay', () => {

					domPlay.disabled = false;
					domPlay.onclick = () => {
						this._multitrack.isPlaying() ? this._multitrack.pause() : this._multitrack.play();
					};
					res();

				});
			});
			
		}

		await loading;

		const loopMarkerPlugin = this._multitrack.wavesurfers[0].plugins[0];
		loopMarkerPlugin.clearRegions();

		// Loop
		let idx = this._multitrack.tracks.findIndex(el => el.id === 0);
		this._multitrack.tracks[idx].startPosition = introTime-loopStart;
		

		// intro
		idx = this._multitrack.tracks.findIndex(el => el.id === 1);
		if( ~idx ){
			
			const plugin = this._multitrack.wavesurfers[idx].plugins[0];
			plugin.clearRegions();
			plugin.addRegion({
				start : introTime,
				color : '#AAFFAA',
				resize : false,
				drag : false,
			});

		}

		// outro
		idx = this._multitrack.tracks.findIndex(el => el.id === 2);
		if( ~idx ){
			
			const plugin = this._multitrack.wavesurfers[idx].plugins[0];
			plugin.clearRegions();
			plugin.addRegion({
				start : outroTime,
				color : '#FFAAAA',
				resize : false,
				drag : false,
			});
			this._multitrack.tracks[idx].startPosition = loopEnd-outroTime;

		}

		console.log(this._multitrack);
		this._multitrack.rendering.setContainerOffsets();

		//const outMarkerRegion = this._multitrack.wavesurfers[2].plugins[0].regions[0];
		

		// Rebuild transition points
		for( let bar of dummy.transition_points ){
			let time = AudioMusic.barToTime(bar-1, +domBpm.value);
			loopMarkerPlugin.addRegion({
				start : time,
				color : 'rgba(255,100,100,.25)',
				resize : false,
				drag : false,
			});
		}
		loopMarkerPlugin.addRegion({
			content : 'IN',
			color : '#AAFFAA',
			start : loopStart,
			drag : false,
		});
		loopMarkerPlugin.addRegion({
			content : 'OUT',
			color : '#FFAAAA',
			start : loopEnd,
			drag : false,
		});
		

		
	};

	drawViewer();

	// Bind events
	this.dom.querySelectorAll('.redraw').forEach(element => element.onchange = drawViewer);



	// Transition point editor
	// Handles the transition points input
	const compileTransitionPoints = () => {

		const ch = [...domTransitionPoints.children];
		const out = [];
		for( let child of ch ){
			let v = parseInt(child.value);
			if( !isNaN(v) && !out.includes(v) )
				out.push(v);
		}
		out.sort((a,b) => a < b ? -1 : 1);
		if( toArray(asset.transition_points).join(',') !== out.join(',') ){
			
			asset.transition_points = out;
			dummy.transition_points = out.slice();
			modtools.setDirty(true);
			drawViewer();
			
		}

	};
	const onTransitionPointClick = event => {
		event.preventDefault();
		event.stopImmediatePropagation();
		if( !event.ctrlKey )
			return;
		
		event.currentTarget.remove();
		compileTransitionPoints();

	};
	const addTransitionPoint = val => {

		const input = document.createElement("input");
		input.type = 'number';
		input.min = 1;
		input.step = 1;
		input.dataset.idx = domTransitionPoints.children.length;
		input.value = val;
		input.onclick = onTransitionPointClick;
		input.onchange = compileTransitionPoints;
		domTransitionPoints.append(input);

	};
	domAddTransitionPoints.onclick = addTransitionPoint;
	for( let tp of dummy.transition_points )
		addTransitionPoint(tp);
	
	window.wsa = this._wsa;

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

