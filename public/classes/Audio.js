import Condition from "./Condition.js";
import stdTag from "../libraries/stdTag.js";
import Generic from "./helpers/Generic.js";

// Audio channel
class Audio{

	// When utilizing the music subsystem, these are the tracks we can use
	static Tracks = {
		ambient : 'ambient',
		combat : 'combat',
		encounter : 'encounter',
		encounterCombat : 'encounterCombat',
		rp : 'rp',
	};
	static TrackOrder = [
		this.Tracks.rp,
		this.Tracks.encounterCombat,
		this.Tracks.encounter,
		this.Tracks.combat,
		this.Tracks.ambient,
	];
	static TrackCombat = [
		this.Tracks.combat,
		this.Tracks.encounterCombat
	];

	static master;
	static masterGain;
	static begun = false;	// Set to true when begin has been called once. Prevents recursion
	static loading = true; 	// Stores a promise that resolves when it's loaded
	
	// Must be ogg, connected to /media/audio/reverb
	// Stores buffers
	static reverbs = {
		'alien' : null,
		'bathroom' : null,
		'chatter' : null,
		'church' : null,
		'forest' : null,
		'ghost' : null,
		'huge' : null,
		'large_chamber' : null,
		'mausoleum' : null,
		'room' : null,
		'sewer' : null,
		'upstairs' : null,
		'street' : null,
	};

	static setMasterVolume( volume = 1 ){
		this.masterGain.gain.setTargetAtTime(+volume, this.master.currentTime || 1, 0.001);
		localStorage.masterVolume = volume;
	}

	static reset(){
		this.master?.close();
		const master = new AudioContext();
		const masterGain = master.createGain();
		masterGain._name = 'MASTER';
		masterGain.connect(master.destination);

		this.master = master;
		this.masterGain = masterGain;
		
		if( !isNaN(localStorage.masterVolume) )
			this.setMasterVolume(+localStorage.masterVolume);
		else
			this.setMasterVolume(0.3);


	}

	static async _begin(){

		this.reset();

		// reverbs only need to load once per session, not game
		for( let i in this.reverbs ){
			this.reverbs[i] = AudioSound.getDecodedBuffer('/media/audio/reverb/'+i+'.ogg');
		}
		await Promise.all(Object.values(this.reverbs));
		for( let i in this.reverbs )
			this.reverbs[i].then(buffer => {
				this.reverbs[i] = buffer;
				
			});
			

	}

	// Allows you to check this.loading.then
	static begin(){

		if( this.begun )
			return;
		this.begun = true;
		this.loading = this._begin();
		return this.loading;	

	}

	// A channel has 2 paths to masterGain:
	// src -> (gain)dry -> (gain)gain -> (lowpass)lowpass -> (gain)duck -> master
	// src -> (gain)reverbInput -> (reverb)reverb -> (gain)reverbSpecificGain -> (gaint)wet -> (gain)gain -> (lowpass)lowpass -> (gain)duck -> master
	constructor( id, use3d = true, startVolume = 1.0 ){
		
		if( !Audio.begun )
			throw new Error('Call Audio.begin before creating a channel');

		const master = this.getMaster();
		const masterGain = this.getMastergain();

		// Channel gain
		this.gain = master.createGain();
		this.duckGain = master.createGain();

		// Channel lowpass
		this.lowpass = master.createBiquadFilter();
		this.lowpass.type = 'lowpass';
		this.lowpass.frequency.setTargetAtTime(24000, master.currentTime, 0);

		// Src input for unmodified signal
		this.dry = master.createGain();

		// Src input for all signals that should have reverb
		this.reverbInput = master.createGain();
		this.reverbInput._n = 'reverbInput';
		this.wet = master.createGain(); // output gain
		this.reverbGain = {}; 	// reverb wet gain : id -> gain node
		this.reverb = {};		// reverb convolver : id -> convolver 
		
		// Hook up entry points
		this.dry.connect(this.gain);	// dry -> gain
		this.dry._o = this.gain;
		this.dry._n = 'ch_dry';
		this.wet.connect(this.gain);
		this.wet._o = this.gain;
		this.wet._n = 'ch_wet';
		this.gain.connect(this.lowpass); // gain -> lowpass
		this.gain._o = this.lowpass;
		this.gain._n = 'ch_gain';
		
		this.lowpass.connect(this.duckGain); // lowpass -> master
		this.lowpass._o = this.duckGain;
		this.lowpass._n = 'ch_lowpass';

		this.duckGain.connect(masterGain);
		this.lowpass._o = masterGain;
		this.lowpass._n = 'ch_duckGain';

		this.musicActiveTrack = '';
		this.musicActiveObj = null;
		this.musicTracks = {};
		for( let i in Audio.Tracks )
			this.musicTracks[i] = null;

		this.hasReverb = false;
		this.combat = false;

		Audio.loading.then(() => {

			// Hook up all the reverbs to gain
			for( let i in Audio.reverbs ){

				this.reverb[i] = master.createConvolver();
				this.reverb[i].buffer = Audio.reverbs[i];
	
				this.reverbGain[i] = master.createGain();
				this.reverbGain[i].connect(this.wet);			// gain of reverb -> wet
				this.reverbGain[i]._o = this.wet;
				this.reverbGain[i]._n = 'reverb_'+i+'_gain';
				this.reverb[i].connect(this.reverbGain[i]);					// Reverb -> Gain or reverb
				this.reverb[i]._o = this.reverbGain[i];
				this.reverb[i]._n = 'reverb_'+i+'_reverb';

			}

		});

		this.use3d = use3d;
		this.volume = startVolume;
		this.id = id;
		if( !isNaN(localStorage[this.id+'Volume']) )
			this.volume = localStorage[this.id+'Volume'];
		this.setVolume(this.volume);

		this._onTrackChanged = [];

	}

	destructor(){
		this.setMusic({});
	}

	async play( url, volume = 1.0, loop = false, x = 0, y = 0, z = -1 ){

		await Audio.loading;

		let sound;
		try{
			sound = await new AudioSound({
				loop:loop,
				path : url,
				volume : volume,
				position : {
					x : x,
					y : y,
					z : z
				}
			}, this).load();
			
			sound.play();
		}catch(err){
			console.error("Unable to play", url, err);
		}
		return sound;
	}

	setLowpass( perc ){

		perc = perc*perc;
		this.lowpass.frequency.setTargetAtTime(20000*perc, this.getCurrentTime(), 0);

	}

	setWet( wet = 1.0 ){

		if( !this.hasReverb )
			wet = 0;
		const ct = this.getCurrentTime();
		this.wet.gain.setValueAtTime(wet, ct);
		this.dry.gain.setValueAtTime(1.0-wet, ct);

	}

	setCombat( on = false, refresh = false ){
		this.combat = on;
		if( refresh )
			this.playHighestPriority();
	}

	async setReverb( id ){

		await Audio.loading; // Make sure reverbs have loaded

		let re = this.reverbGain[id];
		for( let i in this.reverbGain )
			this.reverbGain[i].gain.setValueAtTime(0, this.getCurrentTime());

		this.reverbInput.disconnect();
		this.reverbInput._o = null;

		this.hasReverb = Boolean(re);
		// Set reverb
		if( re ){
			
			this.reverbInput.connect(this.reverb[id]); // wet connects to the reverb
			this.reverbInput._o = this.reverb[id];
			re.gain.setValueAtTime(1, this.getCurrentTime());

		}
		// No reverb, so wet has to be 0
		else
			this.setWet(0);

	}

	setVolume( volume = 1.0 ){
		this.volume = +volume || 0;
		this.gain.gain.setTargetAtTime(this.volume, this.getCurrentTime(), 0.001);
		localStorage[this.id+'Volume'] = this.volume;
	}

	getCurrentTime(){
		return this.getMaster().currentTime;
	}

	getMaster(){
		return Audio.master;
	}

	// Duck away this channel for this amount of ms
	duck( duration = 5000, toVal = 0.2, fadeIn = 1000, fadeOut = 4000){

		
		this.#tweenDuck(toVal, fadeIn);
		clearTimeout(this._duckTimer);
		this._duckTimer = setTimeout(() => {
			this.#tweenDuck(1.0, fadeOut);
		}, duration);

	}

	bindMusicChanged( fn ){
		if( typeof fn !== "function" || this._onTrackChanged.includes(fn) )
			return;
		this._onTrackChanged.push(fn);
	}

	unbindMusicChanged( fn ){
		let pos = this._onTrackChanged.indexOf(fn);
		if( pos === -1 )
			return;
		this._onTrackChanged.splice(pos, 1);
	}

	// Private method that tweens
	#tweenDuck(toVal, time){
		
		const curTime = this.getCurrentTime();
		this.duckGain.gain.setTargetAtTime(toVal, curTime, time/1000*2/10);
		
	}

	getMastergain(){
		return Audio.masterGain;
	}

	async attachMusic( track, audioMusic ){

		if( !this.musicTracks.hasOwnProperty(track) )
			throw new Error("Music track not found: "+track);

		if( this.musicTracks[track]?.label === audioMusic.label )
			return;

		this.musicTracks[track] = audioMusic.activate(this);
		this.musicTracks[track]._label = audioMusic.label; // Attach a _label to the promise, since we're storing a promise

		return this.musicTracks[track];

	}

	// same keys as Audio.Tracks, using labels
	async setMusic( obj ){

		for( let i in this.musicTracks ){
			
			if( this.musicTracks[i]?.label === obj[i] )
				continue;
			
			if( obj[i] )
				this.attachMusic(i, glib.get(obj[i], 'AudioMusic'));
			else
				this.musicTracks[i] = null;

		}

		this.playHighestPriority();

	}

	stopMusic( fadeMethod = '' ){
		return this.setActiveMusicTrack('', fadeMethod);		
	}

	// Checks the highest priority music and plays it unless it's already playing
	playHighestPriority(){
		
		let trackToPlay = '';
		for( let type of Audio.TrackOrder ){

			if( !this.musicTracks[type] )
				continue;
			if( !this.combat && Audio.TrackCombat.includes(type) )
				continue;
			
			trackToPlay = type;
			break;

		}

		this.setActiveMusicTrack(trackToPlay);

	}

	// Gets label of active track. Note that it may just be queued into a transition.
	getActiveTrackLabel(){
		return this.musicTracks[this.musicActiveTrack]?._label;
	}

	// empty fade method uses bar by default unless the AudioMusic object has fade set to a time in MS
	async setActiveMusicTrack( track = '', fadeMethod = '' ){

		this.musicActiveTrack = track; // Set up here so we can compare it later, but activeObj is set once it loads

		const curLabel = this.musicActiveObj?.label;

		// This track is already playing
		if( curLabel === this.musicTracks[track]?._label )
			return;

		// Wait for the track to load
		const nTrackPromise = this.musicTracks[track]; // This is a promise that resolves to the AudioMusic object
		const nTrack = await nTrackPromise;

		// The currently playing music has changed while we were loading
		if( nTrackPromise?._label !== this.getActiveTrackLabel() )
			return;

		// Stop the previous track if it exists
		let timeOffs = 0;
		if( this.musicActiveObj ){
			
			let minIntroTime = nTrack?.getIntroStartTime() || 0;
			let ft = parseInt(nTrack?.fade);
			if( this.musicActiveObj.fade_out )
				ft = this.musicActiveObj.fade_out; // Fade out settings takes priority

			// If fadeMethod is empty and the incoming track has fade set, we force fade
			if( !fadeMethod && ft )
				fadeMethod = 'fade';
			const isFade = fadeMethod === 'fade';
			if( isFade )
				minIntroTime = ft/1000 || 10.0;
			timeOffs = this.musicActiveObj.stop(fadeMethod, minIntroTime, false, true)-minIntroTime;
			if( isFade )
				timeOffs = this.getCurrentTime(); // start the new sound immediately

		}

		// a 0 timeoffs occurs when we stop a track that hasn't started, in that case we'll use the previously set entry time
		// This isn't graceful. Should probably rewrite this to keep the previous playing one until the new one starts....
		if( timeOffs > 0 )
			this._nextStart = timeOffs;
		// Also not graceful. But if the stopping point is in the past, we'll need to set it to NOW
		if( this.getCurrentTime() > this._nextStart ){
			this._nextStart = this.getCurrentTime();
		}

		if( nTrack ){
			//console.log("startingin", this._nextStart-this.getCurrentTime());
			nTrack.play(this._nextStart || this.getCurrentTime());
		}
		
		this.musicActiveObj = nTrack;
		for( let fn of this._onTrackChanged )
			fn(nTrack);

	}

};


class AudioSound{
	/*
		Data is an object that supports the following:
		volume : 0-1
		loop : looping
		path : url
		position : {x,y,z} - Values between 0 and 1 generally, with z being -1 by default
	*/
	constructor( data, parent ){
		if( !data )
			data = {};
		this.parent = parent;

		const master = this.getMaster();

		this.source = master.createBufferSource();
		this.volume = master.createGain();
		this.volume._n = 'snd_vol';
		this.startVolume = data.volume || 0.5;

		this.stopped = false;
		if( this.use3d() ){
			this.panner = master.createPanner({
				panningModel: "HRTF",
				distanceModel: 'linear',
			});
			this.panner._n = 'snd_panner';
			this.volume.connect(this.panner);
			this.volume._o = this.panner;
		}


		this.source.connect(this.volume);
		this.source._o = this.volume;
		this.source._n = 'snd_source';
		const dry = parent.dry;
		const wet = parent.reverbInput;
		if( this.use3d() ){
			this.panner.connect(dry);
			this.panner.connect(wet);
			this.panner._o = [dry, wet];
		}
		else{
			this.volume.connect(dry);
			this.volume.connect(wet);
			this.volume._o = [dry, wet];
		}
		this.buffer = null;

		if( data.position )
			this.setPosition(data.position.x, data.position.y, data.position.z );
		
		
		this.volume.gain.setValueAtTime(isNaN(data.volume) ? 1.0 : data.volume, this.getCurrentTime(), 0);
		this.source.loop = !!data.loop;
		this.path = data.path;

		// Metadata
		this.hit = data.hit;			// If the attack was hard, trigger an impact sound if hit is set

		this.loaded = false;
	}

	

	use3d(){
		return this.parent.use3d;
	}

	context(){
		return master;
	}

	setPosition( x=0, y = 0, z = 0 ){
		if( !this.panner )
			return;
		this.panner.positionX.setValueAtTime(x, this.getCurrentTime());
		this.panner.positionY.setValueAtTime(y, this.getCurrentTime());
		this.panner.positionZ.setValueAtTime(z, this.getCurrentTime());
	}


	// Fade is in seconds (float)
	setVolume( volume = 1, fade = 0 ){
		if( !fade )
			this.volume.gain.setValueAtTime(volume, this.getCurrentTime(), 0);
		else
			this.volume.gain.linearRampToValueAtTime(volume, this.getCurrentTime()+fade);
	}

	stop( time = 0 ){
		time = Math.max(1, time);
		this.volume.gain.linearRampToValueAtTime(0.001, this.getCurrentTime()+time/1000);
		this.source.stop(this.getCurrentTime()+time/1000);
		this.stopped = true;
	}

	play(){

		if( !this.loaded )
			return console.error("Trying to play unloaded sound", this);

		try{
			this.source.start(this.getCurrentTime());
		}catch(err){
			console.error("Failed to play audio", this, err);
		}

	}

	// Chainable
	async load(){

		const decoded = await AudioSound.getDecodedBuffer(this.path);
		this.buffer = this.source.buffer = decoded;
		this.loaded = true;
		return this;

	}

	getCurrentTime(){
		return this.parent.getCurrentTime();
	}

	getMaster(){
		return this.parent.getMaster();
	}

	static async getDecodedBuffer( file ){

		const response = await fetch(file);
		const buffer = await response.arrayBuffer();
		const decoded = await Audio.master.decodeAudioData(buffer);
		return decoded;

	}

}

// Kit that can play
class AudioKit extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}

	constructor( data ){
		super(data);
		this.label = '';
		this.follow_parts = false;		// Used in spellFX only. Follow the particle system tied to the hitfx stage triggering this
		this.sounds = [];				// {s:(AudioSound)sound, t:(int)predelay_ms}
		this.conditions = [];
		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

	save( full ){
		const out = {
			follow_parts : this.follow_parts,
			sounds : this.sounds,
		};
		if( full ){
			out.label = this.label;
			out.conditions = Condition.saveThese(this.conditions, full);
		}
		return out;
	}


	// SoundData acceps the same data as AudioSound
	addSound( soundData, sender = false, preDelay = 0 ){
		this.sounds.push({
			s : soundData,
			t : preDelay,
			se : sender
		});
	}

	addCondition( condition ){
		if( condition instanceof Condition )
			this.conditions.push(condition);
		else
			console.error("Non-condition received", condition);
	}

	playOnTarget( audioSound, target, armor_slot, volume_multiplier = 1.0 ){

		let offset = {x:0,y:0,z:-1};
		if( window.game )
			offset = game.ui.getPlayerAudioOffset(target);
		audioSound.setPosition(offset.x, offset.y, offset.z);
		audioSound.play();
		if( armor_slot && audioSound.hit && target ){

			let slots = target.getEquippedAssetsBySlots(armor_slot);
			if( !slots.length )
				return;
			let sound = '';
			let piece = slots[0];

			if( piece.hit_sound ){
				sound = randElem(piece.hit_sound.split(','));
			}
			// Automatic hit sounds can be added for plate and mail
			else if( piece.hasTag(stdTag.asPlate) )
				sound = 'hit_plate.ogg';
			else if( piece.hasTag(stdTag.asMail) )
				sound = 'hit_mail.ogg';

			if( !sound )
				return;
				
			setTimeout(() => audioSound.parent.play( 'media/audio/'+sound, 0.5*volume_multiplier, false, offset.x, offset.y, offset.z ), 50);

		}

	}

	// Accepts an Audio object which the sounds will be output to
	// Sender and target can be Player objects or DOM elements

	async play( audio, sender, target, armorHitSound, volume_multiplier = 1.0 ){

		// Preload and execute
		let promises = [];
		for( let sound of this.sounds )
			promises.push(new AudioSound(sound.s, audio).load());
		let loaded = await Promise.all(promises);
		for( let i in this.sounds ){

			let entry = this.sounds[i];
			let ta = target;
			if( entry.se )
				ta = sender;

			if( Array.isArray(ta) )
				ta = ta[0];

			if( !entry.t )
				this.playOnTarget(loaded[i], ta, armorHitSound, volume_multiplier);
			else
				setTimeout(() => {
					this.playOnTarget(loaded[i], ta, armorHitSound, volume_multiplier);
				}, entry.t);
				
		}
		return loaded;

	}

}


// Advanced alternative to AudioKit
// Note: bars set by users are 1-indexed, whereas internally 0 index is used
class AudioMusic extends Generic{

	static getRelations(){ 
		return {
		};
	}

	constructor( data ){
		super(data);

		this.parent = null;				// set in activate
		this.label = '';
		
		this.name = '';
		this.author = '';
		this.dl = '';					// Optional download link for the full song

		this.bpm = 100;
		this.vol = 0.5;
		this.fade = 0;					// When set to a time in MS, we'll perform a simple fade, and start this track immediately 
		this.fade_out = 0;				// When set to a time in MS, we'll perform a simple fade. Take priority over the incoming track's fade

		this.intro = '';
		this.intro_point = 1;			// nr of bars when the intro "hits"
		
		this.loop = '';
		this.in = 1;					// nr of bars. 1-indexed
		this.out = 1;					// <2 = use entire length
		this.transition_points = [];	// bar nrs that make for good transition points. 1-indexed
		
		this.outro = '';
		this.outro_point = 1;			// nr of bars when the outro "hits". 1-indexed
		
		this._buf_loop = null;
		this._buf_intro = null;
		this._buf_outro = null;
		
		this._gain_loop = null;
		this._gain_intro = null;
		this._gain_outro = null;

		this._snd_loop = null;
		this._snd_intro = null;
		this._snd_outro = null;

		this._loopTimer = null;
		this._cleanupTimer = null;

		this._started = 0;	// When the first bar of the composition played (including the intro)

		this._stopped = 0;	// time stopped
		
		this.load(data);
	}

	save( full ){
		const out = {
			label : this.label,
			dl : this.dl,
			name : this.name,
			author : this.author,
			loop : this.loop,
			bpm : this.bpm,
			vol : this.vol,
			intro : this.intro,
			intro_point : this.intro_point,
			in : this.in,
			out : this.out,
			outro : this.outro,
			outro_point : this.outro_point,
			fade : this.fade,
			fade_out : this.fade_out,
			transition_points : this.transition_points,
		};
		if( full ){
		}
		return out;
	}


	rebase(){
		this.g_rebase();	// Super
	}

	
	
	getMaster(){
		return this.parent.getMaster();
	}

	getCurrentTime(){
		return this.parent.getCurrentTime();
	}

	// Frees up memory
	deactivate(){
		this.reset();
		this._buf_loop = this._buf_intro = this._buf_outro = this._snd_loop = this._snd_intro = this._snd_outro = null;
	}

	async activate( channel ){

		this.parent = channel;

		const promises = [];
		if( !this._buf_loop )
			promises.push(AudioSound.getDecodedBuffer(this.loop).then(buf => this._buf_loop = buf));
		if( this.intro && !this._buf_intro )
			promises.push(AudioSound.getDecodedBuffer(this.intro).then(buf => this._buf_intro = buf));
		if( this.outro && !this._buf_outro )
			promises.push(AudioSound.getDecodedBuffer(this.outro).then(buf => this._buf_outro = buf));
		
		// Wait for buffers to load
		await Promise.all(promises);

		return this;

	}

	// 0-indexed
	getCurrentBarNumber(){

		const time = this.getCurrentTime(),
			delta = time-this._started,
			barDur = this.getBarTime()
		;
		return Math.floor(delta/barDur);

	}

	// tries to get a time when it's good to stop and let another track take over. returns an absolute time
	// if transition_points are set, it uses those
	// otherwise it falls back to the next bar
	// minTime can be used to set a minimum time ahead needed for the swap point, in general minTime should be a time that's divisible by our bar length
	getNextFadePoint( minTime = 0 ){

		if( !this.transition_points.length )
			return this.getNextBar()+minTime;

		const fullTime = this.getLoopEndTime()-this.getLoopStartTime(),
			curTime = this.getCurrentTime(),
			delta = (curTime - this._started)%fullTime	// Where we're at in the current loop
		;

		// Find the nearest transition point that's greater or equal to minTime
		let nearest = 0, nearestT = 0;
		for( let t of this.transition_points ){
			
			--t;	// convert to 0 indexed
			let timeInBlock = AudioMusic.barToTime(t, this.bpm)-delta;
			if( timeInBlock < 0 ){
				timeInBlock += fullTime;
			}
			if( !nearest || (timeInBlock >= minTime && timeInBlock < nearest) ){
				nearest = timeInBlock;
				nearestT = t+1;
			}

		}

		//console.debug("Next transition point in: ", nearest, "seconds, bar #", nearestT, "delta", delta, curTime, this._started);

		return nearest+curTime;

	}

	getNextBar(){

		const barDur = this.getBarTime();
		return this._started+this.getCurrentBarNumber()*barDur+barDur;

	}


	// Triggered just before each loop ends
	scheduleLoop(){

		const 
			time = this.getCurrentTime(),
			loopInPoint = this.getLoopStartTime(),
			loopOutPoint = this.getLoopEndTime(),
			loopDur = loopOutPoint-loopInPoint,
			stOffs = this._started+loopInPoint, // Makes the first trigger negative, allowing it to play immediately
			delta = time-stOffs,
			curLoops = Math.floor(delta/loopDur)
		;

		let nextStart = (curLoops+1)*loopDur-loopInPoint+stOffs;
		let nextTimer = nextStart+loopDur-time-0.8;


		// We stop here. 0.1 is a failsafe for float issues
		if( this._stopped && nextStart+0.1 > this._stopped )
			return;

		// we start playing at -1
		if( curLoops > -2 ){
			const mainLoop = this.getMaster().createBufferSource();
			mainLoop.buffer = this._buf_loop;
			mainLoop.connect(this._gain_loop);
			mainLoop.start(nextStart);
			this._snd_loop = mainLoop;
		}
		clearTimeout(this._loopTimer);
		this._loopTimer = setTimeout(() => this.scheduleLoop(), nextTimer*1000);

	}

	/* Stops playing. StopType can be: 
		''/'bar' : trigger the outro and stop at the next available bar. in this mode, fade can be used to set a min time before stopping
		'fade' : fades out smoothly, extra is the fade time in seconds.
		Returns stopTime
	*/ 
	stop( stopType = '', fade = 0, deactivateOnComplete = false, ignoreOutro = false ){
		
		const time = this.getCurrentTime();
		// This was scheduled but didn't play anything yet. We can yeet it immediately
		if( time < this._started ){
			this._snd_intro?.stop(time);
			this._snd_loop?.stop(time);
			this._snd_outro?.stop(time);
			this.reset();
			return 0;
		}

		let stopTime = time;
		fade = +fade || 0;
		let deactivateTimeout = 0;

		// If not fade, it's the smart one that plays the outro. Otherwise it just fades out.
		if( stopType !== 'fade' ){
			
			let outroTime = AudioMusic.barToTime(this.outro_point-1, this.bpm);
			// The next track has a longer intro, so we have to take care of that
			if( outroTime < fade )
				outroTime = this.getBarTime()*Math.ceil(fade/this.getBarTime());
			
			stopTime = this.getNextFadePoint(outroTime);
			//stopTime = nextBar+outroTime;

			// Need to play the outro
			if( this.outro && !ignoreOutro ){
				
				const outro = this.getMaster().createBufferSource();
				outro.connect(this._gain_outro);
				outro.buffer = this._buf_outro;
				outro.start(stopTime-this.getOutroStartTime());
				this._snd_outro = outro;
				deactivateTimeout = outro.buffer.duration + stopTime - outroTime - time;

			}
			else
				deactivateTimeout = stopTime-time;

			this._gain_loop.gain.setTargetAtTime(0, stopTime, this.getBarTime()*2*2/10);
			this._snd_loop.stop(stopTime+this.getBarTime()*2);
			

		}
		// bar fade will auto clean itself, since samples are removed on finish
		// but if fade is set, we need to manually stop all the samples when we're finished fading
		else{

			// the deactivate timer handles reset
			if( !deactivateOnComplete )
				this._cleanupTimer = setTimeout(() => {
					this.reset();
				}, fade*1000+1000);

			deactivateTimeout = fade+1;
			this._gain_loop.gain.setTargetAtTime(0.0, time, fade*2/10);
			this._gain_intro.gain.setTargetAtTime(0.0, time, fade*2/10);
			this._gain_outro.gain.setTargetAtTime(0.0, time, fade*2/10);

		}


		if( deactivateOnComplete ){
			
			this._deactivateTimeout = setTimeout(() => {
				this.deactivate();
			}, deactivateTimeout*1000);

		}

		this._stopped = stopTime;
		return stopTime;

	}

	// Stops all sounds and resets all settings
	reset(){
		clearTimeout(this._loopTimer);
		clearTimeout(this._cleanupTimer);
		clearTimeout(this._deactivateTimeout);
		clearTimeout(this._cleanupTimer);
	}

	play( startTime ){

		const master = this.getMaster();
		// Create new connections each time we play
		this._gain_intro = master.createGain();
		this._gain_intro.connect(this.parent.dry);
		this._gain_outro = master.createGain();
		this._gain_outro.connect(this.parent.dry);
		this._gain_loop = master.createGain();
		this._gain_loop.connect(this.parent.dry);

		this._stopped = 0;

		const time = this.getCurrentTime();
		this.reset();

		startTime = +startTime;
		if( isNaN(startTime) || startTime === 0 )
			startTime = 0;
		else
			startTime = startTime-time;


		this._started = time+startTime;

		// Play the intro if need be
		if( this.intro ){
			
			const intro = master.createBufferSource();
			intro.buffer = this._buf_intro;
			intro.connect(this._gain_intro);
			intro.start(time+startTime);
			this._snd_intro = intro;
			//console.log("Starting", this.label, "at", time+startTime);

		}

		//console.log("Play triggered on", this.label, "start time in", this._started-time, "startTime", startTime);

		this.scheduleLoop();

	}


	setCombat( combat ){
		
		combat = Boolean(combat);
		// Detect state change
		if( this.combat === combat )
			return;

		this.combat = combat;
		this.play();

	}

	load(data){
		this.g_autoload(data);
	}

	

	// Gets time of one bar
	getBarTime(){
		return 60*4/this.bpm;
	}

	getIntroStartTime(){
		return AudioMusic.barToTime(this.intro_point-1, this.bpm);
	}

	getOutroStartTime(){
		return AudioMusic.barToTime(this.outro_point-1, this.bpm);
	}

	getLoopStartTime(){
		let thisIn = this.in-1; // DAWs start at 1, so we'll use that for the front end. But the back end needs to start from 0
		if( thisIn < 1 )
			return 0;
		return AudioMusic.barToTime(thisIn, this.bpm);
	}
	getLoopEndTime(){
		let thisOut = this.out-1;
		if( thisOut < 1 )
			return this._snd_main.buffer.duration;
		return AudioMusic.barToTime(thisOut, this.bpm);
	}

	static barToTime( bar, bpm ){
		if( !bpm )
			throw new Error("You forgot the BPM again, idiot!");
		return bar*4*60/bpm;
	}
	
}



// Debug


let lastChannel = false;
window.testAudio = async soundKit => {
	window.setupTestAudio();
	
	let kit = glib.get(soundKit, 'AudioMusic');
	if( !window.game ){
		kit = mod.getAssetById('audioMusic', soundKit);
		if( kit )
			kit = new AudioMusic(kit);
	}
	if( !kit )
		throw new Error("Kit not found", soundKit);

	lastChannel = !lastChannel;
	let ch = Audio.Tracks.ambient;
	if( lastChannel )
		ch = Audio.Tracks.combat;
	
	await window.testMusic.attachMusic(ch, kit);
	window.testMusic.setActiveMusicTrack(ch);
	
	
	

};

window.setupTestAudio = function(){
	if( window.testMusic )
		return;
	window.testMusic = new Audio('test', false);
	console.log("Type testMusic into the console to access the music channel object");
}


export {AudioSound, AudioKit, AudioMusic};
export default Audio;

