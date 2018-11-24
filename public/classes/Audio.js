import Condition from "./Condition.js";
import stdTag from "../libraries/stdTag.js";
import Generic from "./helpers/Generic.js";

const master = new AudioContext();
const masterGain = master.createGain();
masterGain.connect(master.destination);

function setMasterVolume( volume = 1 ){
	masterGain.gain.setTargetAtTime(+volume, master.currentTime || 1, 0.001);
	localStorage.masterVolume = volume;
}

if( !isNaN(localStorage.masterVolume) )
	setMasterVolume(+localStorage.masterVolume);
else
	setMasterVolume(0);



// Audio channel
class Audio{
	constructor( id, use3d = true ){
		if( !AudioContext )
			console.error("Browser doesn't support audio");
		// Gain is last
		this.gain = master.createGain();
		this.gain.connect(masterGain);
		this.use3d = use3d;
		this.volume = 1.0;
		this.id = id;
		if( !isNaN(localStorage[this.id+'Volume']) )
			this.volume = localStorage[this.id+'Volume'];
		this.setVolume(this.volume);
	}

	async play( url, volume = 1.0, loop = false, x = 0, y = 0, z = -1 ){
		let sound = await new AudioSound({
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

		return sound;
	}

	setVolume( volume = 1.0 ){
		this.volume = volume;
		this.gain.gain.setTargetAtTime(+volume, master.currentTime, 0.001);
		localStorage[this.id+'Volume'] = volume;
	}


};


class AudioSound{
	/*
		Data is an object that supports the following:
		volume : 0-1
		loop : looping
		path : url
		position : {x,y,z} - Values between 0 and 1 generally, with z being -1 by default
		use_head : false,
	*/
	constructor( data, parent ){
		if( !data )
			data = {};
		this.parent = parent;

		let use3d = parent.use3d;
		this.source = master.createBufferSource();
		this.volume = master.createGain();
		this.stopped = false;
		this.use_head = data.use_head;
		if( use3d ){
			this.panner = master.createPanner({
				panningModel: "HRTF",
				distanceModel: 'linear',
			});
			
		}


		this.source.connect(this.volume);
		if( use3d ){
			this.panner.connect(parent.gain);
			this.volume.connect(this.panner);
		}
		else{
			this.volume.connect(parent.gain);
		}
		this.buffer = null;

		if( data.position )
			this.setPosition(data.position.x, data.position.y, data.position.z );
		
		this.volume.gain.setValueAtTime(isNaN(data.volume) ? 1.0 : data.volume, this.currentTime(), 0);
		this.source.loop = !!data.loop;
		this.path = data.path;

		// Metadata
		this.hit = data.hit;			// If the attack was hard, trigger an impact sound if hit is set

		this.loaded = false;
	}

	context(){
		return master;
	}

	setPosition( x=0, y = 0, z = 0 ){
		if( !this.panner )
			return;
		this.panner.setPosition(x,y,z);
	}

	currentTime(){
		return master.currentTime;
	}

	setVolume( volume = 1 ){
		this.volume.gain.setValueAtTime(volume, this.currentTime(), 0);
	}

	stop( time = 0 ){
		time = Math.max(1, time);
		this.volume.gain.exponentialRampToValueAtTime(0.001, this.currentTime()+time/1000);
		this.source.stop(this.currentTime()+time/1000);
		this.stopped = true;
	}

	play(){

		if( !this.loaded )
			return console.error("Trying to play unloaded sound", this);
		this.source.start(this.currentTime());

	}

	load(){
		let th = this;
		return new Promise((res,rej) => {
			const request = new XMLHttpRequest();
			request.open("GET", this.path, true);
			request.responseType = "arraybuffer";
			request.onload = function(e){
				master.decodeAudioData(this.response, function onSuccess(buffer){
					th.buffer = buffer;
					th.source.buffer = th.buffer;
					th.loaded = true;
					res(th);
				}, function onFailure() {
					rej("Decoding the audio buffer failed");
				});
			};
			request.send();
		});
	}

}

// Kit that can play
class AudioKit extends Generic{

	constructor( data ){
		super(data);
		this.label = '';
		this.sounds = [];		// {s:(AudioSound)sound, t:(int)predelay_ms}
		this.conditions = [];
		this.load(data);
	}

	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions);
	}

	save(complete){
		return {
			label : this.label,
			sounds : this.sounds,
			conditions : Condition.saveThese(this.conditions)
		};
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

	playOnTarget( audioSound, target, armor_slot ){
		let offset = game.ui.getPlayerAudioOffset(target);
		audioSound.setPosition(offset.x, offset.y, offset.z);
		audioSound.play();
		if( armor_slot && audioSound.hit ){
			let slots = target.getEquippedAssetsBySlots(armor_slot);
			if( !slots.length )
				return;
			let sound = '';
			let piece = slots[0];
			if( piece.hasTag(stdTag.asPlate) )
				sound = 'hit_plate.ogg';
			else if( piece.hasTag(stdTag.asMail) )
				sound = 'hit_mail.ogg';
			if( !sound )
				return;
			setTimeout(() => audioSound.parent.play( 'media/audio/'+sound, 0.5, false, offset.x, offset.y, offset.z ), 50)
		}
	}

	// Accepts an Audio object which the sounds will be output to
	async play( audio, sender, target, armorHitSound ){
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

			if( !entry.t )
				this.playOnTarget(loaded[i], ta, armorHitSound);
			else
				setTimeout(() => {
					this.playOnTarget(loaded[i], ta, armorHitSound);
				}, entry.t);
		}
	}

}


export {AudioSound, AudioKit, setMasterVolume};
export default Audio;

