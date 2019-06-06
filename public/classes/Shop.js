// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Asset from './Asset.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';

export default class Shop extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.items = [];
		this.conditions = [];
		this.player = '';				// label of player to attach the shop to
		this.buys = true;
		this.sells = true;

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			label : this.label,
			name : this.name,
			items : ShopAsset.saveThese(this.items, full),
			player : this.player,
			conditions : Condition.saveThese(this.conditions, full),
			buys : this.buys,
			sells : this.sells,
		};

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.items = ShopAsset.loadThese(this.items, this);
		this.conditions = Condition.loadThese(this.conditions);
	}

	getItemById( id ){
		for( let item of this.items ){
			if( item.id === id )
				return item;
		}
	}

	// Todo: called when shop window is opened
	loadState(){

		const data = game.state_shops[this.label];
		if( !data )
			return;
		
		if( data.items ){
			for( let item of this.items )
				item.loadState(data.items[item.id]);
		}
	}

	saveState(){
		
		const itemState = {};
		for( let asset of this.items )
			itemState[asset.id] = asset.saveState();

		return {
			items : itemState
		};
	}
	
	isAvailable(player){
		return Condition.all(this.conditions, new GameEvent({
			sender : player,
			target : player,
		}));
	}

}

export class ShopAsset extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;		// Either a roleplay or dungeon asset
		this.asset = null;			// String or object. Use getAsset
		this.cost = -1;				// -1 uses the items own cost. This is the cost in copper.
		this.amount = -1;			// Max amount sold by the vendor
		this.restock_rate = 260000;	// About once every 3 days
		this.conditions = [];

		// State (saved in game)
		this._amount_bought = 0;			
		this._time_bought = 0;

		if( data && !data.id )
			console.error("ShopAsset loaded without id", this);
		
		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			asset : this.asset,
			cost : this.cost,
			amount : this.amount,
			restock_rate : this.restock_rate,
			conditions : Condition.saveThese(this.conditions, full),
		};


		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}

	

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions);
	}

	getCost(){
		if( this.cost === -1 )
			return this.getAsset().basevalue;
		return this.cost;
	}

	getRemaining(){
		if( this.amount < 0 )
			return -1;
		return this.amount-this._amount_bought;
	}

	isAvailable(player){
		return Condition.all(this.conditions, new GameEvent({
			sender : player,
			target : player,
		}));
	}

	getAsset(){
		const out = Asset.loadThis(this.asset);
		out.g_resetID();
		return out;
	}

	loadState(data){
		if( !data )
			return;
		if( data._amount_bought )
			this._amount_bought = data._amount_bought;
		if( data._time_bought )
			this._time_bought = data._time_bought;
	}

	saveState(){
		return {
			_amount_bought : this._amount_bought,
			_time_bought : this._time_bought
		};
	}

	onPurchase( amount ){
		amount = parseInt(amount);
		if( isNaN(amount) || amount < 1 )
			return;
		this._amount_bought += amount;
		if( !this._time_bought )
			this._time_bought = game.time;
	}

}