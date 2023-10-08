// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import Asset from './Asset.js';

export default class PlayerIconState extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition
		};
	}

	// 
	static Layers = {
		FaceResting : 5,				// Resting reaction, such as orgasm
		FaceMild : 10,					// Mild reaction, such as mild pain or mild arousal
		FaceHeavy : 15,					// Heavy expression, such as heavy pain or heavy arousal
		CosmeticLower : 20,				// Cosmetics that go under armor
		ArmorLower : 25,				// 
		Handheld : 30,
		ArmorUpper : 35,
		ArmorCosmeticJewellery : 40,
		ArmorCosmeticLower : 45,
		ArmorCosmeticUpper : 50,
		Stains : 55,
	};

	static getLayerNameByNumber( nr ){
		for( let i in this.Layers ){
			if( this.Layers[i] === nr )
				return i;
		}
		return '';
	}

	static BlendMode = {
		SourceOver : 'source-over',
		Overlay : 'overlay',		// Good for shiny
		Multiply : 'multiply',		// Good for matte
	};

	static LAYER_MAX = 60;				// Max 50 layers per person
	static LAYER_MIN = 0;

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.icon = '';					// image
		this.conditions = [];			// conditions to show this
		this.layer = PlayerIconState.Layers.ArmorLower;					// Z index
		this.duration = 0;				// milliseconds. When set, turns this into a reaction, automatically removing itself when it expires.
										// Reactions are bound to text events.
										// Normal layers are checked on equipment change and when a wrapper is added or removed
		this.x = 0;						// X offset from left
		this.y = 0;						// Y offset from top
										// Note: The size of the image is based on the largest active image.
		this.slot = Asset.Slots.none;	// When set to anything but none, it will try to recolor it based on what you're wearing on that slot
		this.blendMode = PlayerIconState.BlendMode.SourceOver;
		this.opacity = 1.0;				// 
		
		this._triggered = 0;			// milliseconds when this was triggered if it's a reaction.

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			icon : this.icon,
			conditions : Condition.saveThese(this.conditions, full),
			layer : this.layer,
			duration : this.duration,
			x : this.x,
			y : this.y,
			slot : this.slot,
			blendMode : this.blendMode,
			opacity : this.opacity,
		};

		if( full ){
		}

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}

	canTrigger(){
		return Boolean(this.duration);
	}

	isTriggered(){
		return this._triggered && Date.now()-this._triggered < this.duration;
	}

	trigger(){
		if( !this.duration )
			this._triggered = Date.now();
	}

	validate( event, debug ){

		return Condition.all(this.conditions, event, debug);

	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

}
