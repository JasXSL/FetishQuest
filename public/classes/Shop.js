// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Asset from './Asset.js';
import Condition from './Condition.js';
import GameEvent from './GameEvent.js';
import Player from './Player.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';

export default class Shop extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			items : ShopAsset,
		};
	}

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.items = [];				// ShopAsset
		this.conditions = [];

		this.gen_nr = 0;				// Amount of generated assets to add
		this.gen_rarity_min = Asset.Rarity.UNCOMMON;
		this.gen_assets = [];			// Asset templates
		this.gen_mats = [];				// Material templates
		
		this._time_generated = 0;		// Time loot was auto generated
		this._generated_assets = [];	// Custom generated gear

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
			_generated_assets : ShopAsset.saveThese(this._generated_assets, full),
		};

		if( full ){
			
			out.gen_nr = this.gen_nr;
			out.gen_rarity_min = this.gen_rarity_min;
			out.gen_assets = this.gen_assets;
			out.gen_mats = this.gen_mats;
			
		}

		if( full !== "mod" ){}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
		this._generated_assets = ShopAsset.loadThese(this._generated_assets, this);
	}

	getItemById( id ){

		const items = this.getItems();
		for( let item of items ){
			if( item.id === id )
				return item;
		}

	}

	generateItems(){

		this._time_generated = game.time;
		this._level_generated = game.getHighestLevelPlayer();

		this._generated_assets = [];
		for( let i = 0; i < this.gen_nr; ++i ){

			const asset = Asset.generate(
				undefined, // Slot
				undefined, 
				this.gen_assets, 
				this.gen_mats, 
				undefined, 
				this.gen_rarity_min
			);

			console.trace("Gen", asset);
			if( !asset )
				continue;

			const id = Generic.generateUUID();
			const add = new ShopAsset({
				id : id,
				label : id,
				amount : 1,
				restock_rate : 0,
				asset : asset,
			}, this);

			
			this._generated_assets.push(add);

		}

	}

	loadState(){

		if( !game.is_host )
			return;

		let needSave = false;	// If we need to save state due to an item being restocked
		const data = game.state_shops[this.label];

		this._generated_assets = [];
		this._time_generated = 0;
		this._level_generated = 0;

		if( data instanceof ShopSaveState ){
			
			const items = data.items.slice();
			for( let item of items ){

				const cur = this.getItemById(item.id);
				if( !cur )
					data.items.splice(data.items.indexOf(item));
				else{
					if( cur.loadState(item) )
						needSave = true;
				}

			}

			this._time_generated = data.time_generated;
			this._generated_assets = ShopAsset.loadThese(data.generated_assets, this);
			this._level_generated = data.level_generated;

		}

		// Restock every 3 days
		if( this.gen_nr && (
			!this._time_generated || 
			game.time-this._time_generated > 260000 ||
			game.getHighestLevelPlayer() >= this._level_generated+3
		) ){	// Every 3 days or every 3 levels

			console.trace("Generating new items");
			this.generateItems();
			needSave = true;

		}

		if( needSave )
			game.saveShopState(this);

	}

	saveState(){

		if( !game.is_host )
			return;
		return new ShopSaveState({
			level_generated : this._level_generated,
			time_generated : this._time_generated,
			generated_assets : ShopAsset.saveThese(this._generated_assets, this),
			items : this.items.map(el => el.saveState())
		});

	}


	isAvailable(player){
		return Condition.all(this.conditions, new GameEvent({
			sender : player,
			target : player,
		}));
	}

	// Returns an array of unique tokens used in this store
	getTokenAssets(){

		const out = new Map();
		for( let item of this.items ){

			for( let token of item.tokens )
				out.set(token.asset.label, token.asset);

		}
		return Array.from(out.values());

	}

	getItems(){
		return this.items.concat(this._generated_assets);
	}

}

export class ShopSaveState extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;
		this.items = [];				// SaveStates
		this.generated_assets = [];		// Actual assets (since they're generated on the fly)
		this.time_generated = 0;
		
		this.load(data);
	}

	save( full ){

		const out = {
			items : ShopAssetSaveState.saveThese(this.items, full),
			generated_assets : ShopAsset.saveThese(this.generated_assets),
			time_generated : this.time_generated
		};
		return out;
		
	}

	load( data ){
		this.g_autoload(data);
	}

	unsetAsset( asset ){

		if( asset instanceof ShopAsset )
			asset = asset.id;

		for( let i = 0; i < this.items.length; ++i ){

			if( this.items[i].id === asset ){

				this.items.splice(i, 1);
				return true;

			}

		}

	}

	getItemById( id ){
		
		for( let item of this.items ){
			if( item.id === id )
				return item;
		}

	}

	rebase(){
		this.g_rebase();	// Super
		this.items = ShopAssetSaveState.loadThese(this.items, this);
		this.generated_assets = ShopAsset.loadThese(this.generated_assets, this);
	}
}

export class ShopAsset extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			asset : Asset,
			tokens : ShopAssetToken,
		};
	}

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
			asset : this.asset && this.asset.save ? Asset.saveThis( this.asset, full) : this.asset,
			cost : this.cost,
			amount : this.amount,
			restock_rate : this.restock_rate,
			conditions : Condition.saveThese(this.conditions, full),
			tokens : ShopAssetToken.saveThese(this.tokens, full),
		};


		if( full !== "mod" ){
			out._amount_bought = this._amount_bought;
		}
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
		this.g_rebase();	// Super
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
		out.restore();
		return out;
	}

	// Returns true if data was altered
	loadState( data ){

		if( !(data instanceof ShopAssetSaveState) )
			return;
		this._amount_bought = data._amount_bought;
		this._time_bought = data._time_bought;
		if( game.time-this._time_bought > this.restock_rate && this.restock_rate > 0 ){
			
			this._time_bought = 0;
			this._amount_bought = 0;
			return true;

		}

	}

	saveState(){

		const out = new ShopAssetSaveState({
			id : this.id,
			_amount_bought : this._amount_bought,
			_time_bought : this._time_bought,
		});
		return out;

	}

	onPurchase( amount ){

		amount = parseInt(amount);
		if( isNaN(amount) || amount < 1 )
			return;
		this._amount_bought += amount;
		if( !this._time_bought )
			this._time_bought = game.time;

		console.log("Bought", this, this._amount_bought);

	}

	affordableByPlayer( player, amount = 1 ){

		if( !(player instanceof Player) )
			throw 'Trying to check item affordable by nonplayer';

		const money = player.getMoney();
		if( money < this.getCost()*amount )
			return false;

		for( let token of this.tokens ){

			if( player.numAssets(token.asset.label) < token.amount*amount )
				return false;

		}
		
		return true;

	}

}

export class ShopAssetToken extends Generic{

	static getRelations(){ 
		return {
			asset : Asset,
		};
	}

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
		this.g_rebase();	// Super
	}

	save( full ){

		const out = {
			id : this.id,
			asset : this.asset && this.asset.save ? Asset.saveThis(this.asset, full) : this.asset,
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

	rebase(){
		this.g_rebase();	// Super
	}


}
