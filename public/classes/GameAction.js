// Similar to action, except this one affects the game itself.
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import Asset from './Asset.js';
import GameEvent from './GameEvent.js';


export default class GameAction extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.type = "dvar";
		this.data = null;
		this.break = null;		// Use "success" "fail" here to break on success or fail
		this.repeats = -1;
		this.conditions = [];

		this.load(data);
	}

	save( full ){

		let data = this.data;
		if( Array.isArray(data) ){
			data = data.map(el => {
				return el && el.save ? el.save(full) : el;
			});
		}
		if( data === null )
			data = {};

		if( data.save )
			data = data.save(full);

		const out = {
			type : this.type,
			data : JSON.parse(JSON.stringify(data)),
			break : this.break,
			repeats : this.repeats,
			conditions : Condition.saveThese(this.conditions, full)
		};

		if( full === "mod" )
			out.label = this.label;
		else{
			out.id = this.id;
		}

		return out;
	}


	remove(){
		for( let i in this.parent.interactions ){
			if( this.parent.interactions[i] === this ){
				this.parent.interactions.splice(i, 1);
				return true;
			}
		}
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions);

		// make sure data is escaped
		if( typeof this.data === "object" ){
			for( let i in this.data ){
				if( this.data[i] && this.data[i].save ){
					this.data[i] = this.data[i].save(true);
				}
			}
		}

		if( this.type === GameAction.types.loot ){
			if( typeof this.data !== "object" )
				console.error("Trying to load non-object to loot type in interaction:", this);
			this.data.loot = Asset.loadThese(this.data.loot);
		}
		if( this.type === GameAction.types.encounters ){
			if( !Array.isArray(this.data) )
				console.error("Trying to load non-array to encounter type in interaction:", this);
			this.data = DungeonEncounter.loadThese(this.data);
		}

	}


	// polymorphs this into loot and saves
	convertToLoot(){

		if( this.type !== this.constructor.types.autoLoot )
			return;

		const value = isNaN(this.data.val) ? 0.5 : +this.data.val;
		const dungeon = this.getDungeon();

		this.type = this.constructor.types.loot;
		this.data = [];
		this.g_resetID();	// needed for netcode to work
		
		// weight of 0.5 adds loot
		if( value >= 0.5 ){

			// Generate a random piece of loot
			const loot = Asset.generate( 
				undefined, 	// Slot
				game.getAveragePlayerLevel(), 
				undefined, 	// Viable template
				undefined 	// Viable materials
			);
			if( loot )
				this.data.push(loot);
				
		}

		// 0-2 consumables, or 1-3 if no gear
		let numBonus = Math.round(Math.pow(Math.random(),3)*2);
		let numConsumables = numBonus+!(value >= 0.5);
		for( let i=0; i<numConsumables; ++i ){
			let consumable = Asset.getRandomByRarity(dungeon.consumables);
			if( !consumable )
				break;
			consumable.g_resetID();
			this.data.push(consumable.clone(this.parent));
		}

		game.save();

	}

	async trigger( player, mesh ){
		

		const asset = this.parent;
		const types = GameAction.types;


		// Helper function for playing animation on this asset. Returns the animation played if any
		function playAnim( anim ){
			if( !mesh.userData.playAnimation )
				return;
			game.net.dmAnimation( asset, anim );
			return mesh.userData.playAnimation(anim);

		}


		if( this.type === types.encounters ){

			game.mergeEncounter(player, DungeonEncounter.getRandomViable(DungeonEncounter.loadThese(this.data)));
			this.remove();	// Prevent it from restarting
			asset.updateInteractivity();	// After removing the action, update interactivity

		}

		else if( this.type === types.door && !isNaN(this.data.index) ){

			game.onRoomChange();
			this.parent.parent.parent.goToRoom( player, this.data.index );
			playAnim("open");

		}

		// Todo: Dungeon exit
		else if( this.type === types.exit ){
			
			game.onDungeonExit();
			const dungeon = glib.get(this.data.dungeon, 'Dungeon');
			if( !dungeon )
				return game.modal.addError("Dungeon not found");
			const load = game.setDungeon(dungeon);
			if( !isNaN(this.data.index) ){
				game.dungeon.previous_room = game.dungeon.active_room = +this.data.index;
				//await game.dungeon.goToRoom( player, +this.data.index );
			}
			await load;
		}

		else if( this.type === types.dungeonVar ){

			const vars = this.getDungeon().vars;
			vars[this.data.id] = Calculator.run(this.data.data, new GameEvent({}), vars);
			game.save();

		}
		else if( this.type === types.anim ){
			playAnim(this.data.anim);
		}

		else if( this.type === types.loot ){
			game.ui.drawContainerLootSelector( player, this.parent );
		}

		else if( this.type === types.lever ){

			const v = this.data.id;
			const vars = this.getDungeon().vars;
			vars[v] = !vars[v];
			game.save();
			if( vars[v] )
				playAnim("open");
			else
				playAnim("close");

		}

	}

	getDungeon(){
		let p = this.parent;
		while( p ){
			p = p.parent;
			if( p instanceof Dungeon )
				return p;
		}
	}

	validate(){
		if( this.transporting )
			return false;
		if( !Condition.all(this.conditions, new GameEvent({
			dungeon : this.parent.parent.parent,
			room : this.parent.parent,
			dungeonRoomAsset : this.parent
		})) )return false;
		
		return true;
	}

	
}
GameAction.types = {
	encounters : "enc",				// (arr)encounters - Picks one at random
	wrappers : "wra",				// (arr)wrappers
	dungeonVar : "dvar",			// {id:(str)id, val:(var)val} - Can use a math formula
	loot : "loot",					// {assets:(arr)assets, min:(int)min_assets=0, max:(int)max_assets=-1} - Loot will automatically trigger "open" and "open_idle" animations
	autoLoot : "aLoot",				// {val:(float)modifier} - This is replaced with "loot" when opened, and auto generated. Val can be used to determine the value of the chest. Lower granting fewer items.
	door : "door",					// {index:(int)room_index, no_exit:(bool)no_exit} - Door will automatically trigger "open" animation when successfully used. no_exit will prevent the exit door icon from being added
	exit : "exit",					// {dungeon:(str)dungeon_label, index:(int)landing_room=0}
	anim : "anim",					// {anim:(str)animation}
	lever : "lever",				// {id:(str)id} - Does the same as dungeonVar except it toggles the var (id) true/false and handles "open", "open_idle", "close" animations
};


