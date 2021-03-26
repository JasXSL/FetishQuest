import Player from '../Player.js';
import Generic from '../helpers/Generic.js';


export default class PlayerGalleryTemplate extends Generic{

	constructor(...args){
		super(...args);
		this.label = '';
		this.player = null;
		this.load(...args);
	}

	load(data){
		this.g_autoload(data);
	}

	save( full ){
		return {
			label : this.label,
			player : this.player instanceof Player ? this.player.save(full) : this.player
		};
	}

	rebase(){
		this.player = Player.loadThis(this.player)
	}


}

