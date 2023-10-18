import Condition from "./Condition.js";
import stdTag from "../libraries/stdTag.js";
import Generic from "./helpers/Generic.js";



// Audio channel
class Audio{

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

	static async _begin(){

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
	// src -> (gain)dry -> (gain)gain -> (lowpass)lowpass -> master
	// src -> (gain)reverbInput -> (reverb)reverb -> (gain)reverbSpecificGain -> (gaint)wet -> (gain)gain -> (lowpass)lowpass -> master
	constructor( id, use3d = true ){
		
		if( !Audio.begun )
			throw new Error('Call Audio.begin before creating a channel');

		const master = this.getMaster();
		const masterGain = this.getMastergain();

		// Channel gain
		this.gain = master.createGain();

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
		this.lowpass.connect(masterGain); // lowpass -> master
		this.lowpass._o = masterGain;
		this.lowpass._n = 'ch_lowpass';

		this.hasReverb = false;

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
		this.volume = 1.0;
		this.id = id;
		if( !isNaN(localStorage[this.id+'Volume']) )
			this.volume = localStorage[this.id+'Volume'];
		this.setVolume(this.volume);

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

	getMastergain(){
		return Audio.masterGain;
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


export {AudioSound, AudioKit};
export default Audio;

