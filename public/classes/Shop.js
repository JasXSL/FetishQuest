// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Asset from './Asset.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import Player from './Player.js';

export default class Shop extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.items = [];				// ShopAsset
		this.conditions = [];
		this.buys = true;

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			label : this.label,
			name : this.name,
			items : ShopAsset.saveThese(this.items, full),
			conditions : Condition.saveThese(this.conditions, full),
			buys : this.buys,
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

	loadState(){

		const data = game.state_shops[this.label];
		if( !(data instanceof ShopSaveState) )
			return;
		
		const items = data.items.slice();
		for( let item of items ){
			const cur = this.getItemById(item.id);
			if( !cur )
				data.items.splice(data.items.indexOf(item));
			else{
				cur.loadState(item);
			}
		}
	}

	saveState(){
		return new ShopSaveState({
			items : this.items.map(el => el.saveState())
		});
	}
	
	isAvailable(player){
		return Condition.all(this.conditions, new GameEvent({
			sender : player,
			target : player,
		}));
	}

}

export class ShopSaveState extends Generic{
	constructor(data, parent){
		super();

		this.parent = parent;
		this.items = [];
		
		this.load(data);
	}

	save( full ){
		const out = {
			items : ShopAssetSaveState.saveThese(this.items)
		};
		return out;
	}

	load( data ){
		this.g_autoload(data);
	}

	getItemById( id ){
		for( let item of this.items ){
			if( item.id === id )
				return item;
		}
	}

	rebase(){
		this.items = ShopAssetSaveState.loadThese(this.items, this);
	}
}

export class ShopAsset extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;		// Either a roleplay or dungeon asset
		this.label = '';
		this.asset = null;			// String or object. Use getAsset
		this.cost = -1;				// -1 uses the items own cost. This is the cost in copper.
		this.amount = -1;			// Max amount sold by the vendor
		this.restock_rate = 260000;	// About once every 3 days
		this.conditions = [];
		this.tokens = [];			// ShopAssetToken, trade custom assets instead of money

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
			asset : this.asset && this.asset.save ? this.asset.save(full) : this.asset,
			cost : this.cost,
			amount : this.amount,
			restock_rate : this.restock_rate,
			conditions : Condition.saveThese(this.conditions, full),
			tokens : ShopAssetToken.saveThese(this.tokens, full),
		};


		if( full !== "mod" ){}
		else{
			out.label = this.label;
			this.g_sanitizeDefaults(out);
		}
		return out;
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions);
		this.asset = Asset.loadThis(this.asset, this);
		this.tokens = ShopAssetToken.loadThese(this.tokens, this);
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
		const out = this.asset.clone();
		out.g_resetID();
		out.onPlacedInWorld();
		return out;
	}

	loadState( data ){

		if( !(data instanceof ShopAssetSaveState) )
			return;
		this._amount_bought = data._amount_bought;
		this._time_bought = data._time_bought;
		if( game.time-this._time_bought > this.restock_rate && this.restock_rate > 0 ){
			this._time_bought = 0;
			this._amount_bought = 0;
			game.saveShopState(this.parent);
		}

	}

	saveState(){
		return new ShopAssetSaveState({
			id : this.id,
			_amount_bought : this._amount_bought,
			_time_bought : this._time_bought
		});
	}

	onPurchase( amount ){
		amount = parseInt(amount);
		if( isNaN(amount) || amount < 1 )
			return;
		this._amount_bought += amount;
		if( !this._time_bought )
			this._time_bought = game.time;
	}

	affordableByPlayer( player ){

		if( !(player instanceof Player) )
			throw 'Trying to check item affordable by nonplayer';

		const money = player.getMoney();
		if( money < this.getCost() )
			return false;

		for( let token of this.tokens ){

			if( player.numAssets(token.asset.label) < token.amount )
				return false;

		}
		
		return true;

	}

}

export class ShopAssetToken extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;

		this.label = '';
		this.asset = null;			// String or Asset
		this.amount = 1;

		this.load(data);
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){

		this.asset = Asset.loadThis(this.asset, this);

	}

	save( full ){

		const out = {
			id : this.id,
			asset : this.asset && this.asset.save ? this.asset.save(full) : this.asset,
			amount : this.amount,
		};

		if( full !== "mod" ){}
		else{

			out.label = this.label;
			this.g_sanitizeDefaults(out);

		}

		return out;

	}

}


class ShopAssetSaveState extends Generic{
	constructor(data, parent){
		super();

		this.parent = parent;
		this.id = '';
		this._amount_bought = 0;
		this._time_bought = 0;

		
		this.load(data);
	}

	save( full ){
		const out = {
			id : this.id,
			_amount_bought : this._amount_bought,
			_time_bought : this._time_bought,
		};
		return out;
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){}


}
