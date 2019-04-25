// Similar to action, except this one affects the game itself.
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import Asset from './Asset.js';
import GameEvent from './GameEvent.js';
import Dungeon, { DungeonEncounter } from './Dungeon.js';
import Calculator from './Calculator.js';
import Quest from './Quest.js';
import Roleplay from './Roleplay.js';

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

		const out = {
			type : this.type,
			data : this.flattenData(full),
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

	flattenData( full ){

		const data = this.data;
		if( data === null || typeof data !== "object" )
			return {};
		if( typeof data.save === "function" )
			return data.save(full);

		const flatten = function(input){
			
			let out = {};
			if( Array.isArray(input) )
				out = [];

			for( let i in input ){

				out[i] = input[i];
				if( input[i] && typeof input[i].save === "function" )
					out[i] = input[i].save(full);
				else if( typeof input[i] === "object" )
					out[i] = flatten(input[i]);

			}

			return out;
		}

		const out = flatten(data);
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

		if( window.game ){
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

	}


	// polymorphs this into loot and saves
	convertToLoot(){

		if( this.type === this.constructor.types.loot && !Array.isArray(this.data) ){

			let min = isNaN(this.data.min) || this.data.min < 0 ? Infinity : +this.data.min,
				max = isNaN(this.data.max) || this.data.min < 0 ? Infinity : +this.data.max,
				loot = this.data.loot
			;
			if( this.data.max < this.data.min )
				this.data.max = this.data.min;

			if( min > loot.length )
				min = loot.length;
			if( max > loot.length )
				max = loot.length;			

			let numItems = Math.floor(Math.random()*(max+1-min))+min;
			const out = [];
			for( let i =0; i<numItems && loot.length; ++i ){
				let n = Math.floor(Math.random()*loot.length);
				out.push(Asset.convertDummy(loot.splice(n, 1).shift(), this));
			}
			this.data = out;

		}
		else if( this.type === this.constructor.types.autoLoot ){

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
					undefined, 	// Viable materials
					undefined, // enforced rarity
					(value-0.5)*8, // Min rarity
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

		}

		game.save();
		return this;

	}

	// note: mesh should be the mesh you interacted with, or the player you interacted with (such as the player mapped to a roleplay text)
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

			if( !game.canTransport() )
				return;
			game.onRoomChange();
			this.parent.parent.parent.goToRoom( player, this.data.index );
			playAnim("open");

		}

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

		else if( this.type === types.quest ){

			let quest = this.data.quest;
			if( typeof quest === "object" )
				quest = new Quest(quest);
			else
				quest = glib.get(quest, 'Quest');

			if( !quest )
				return console.error("Quest not found in game action", this);

			game.addQuest(quest);

		}

		else if( this.type === types.toggleCombat )
			game.toggleBattle(this.data.on);
		
		else if( this.type === types.generateDungeon){
			game.generateProceduralDungeon();
		}

		else if( this.type === types.visitDungeon ){
			game.gotoProceduralDungeon();
		}

		else if( this.type === types.roleplay ){
			let rp = this.data.rp;
			if( typeof rp === 'string' )
				rp = glib.get(rp, 'Roleplay');
			else if( typeof rp === 'object' )
				rp = new Roleplay(rp, game);
				
			if( typeof rp !== "object" )
				console.error("Error, ", this.data.rp, "is not a valid roleplay in", this);
			else
				game.setRoleplay(rp);
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
	loot : "loot",					// Staging: {assets:(arr)assets, min:(int)min_assets=0, max:(int)max_assets=-1}, Live: [asset, asset, asset...] - Loot will automatically trigger "open" and "open_idle" animations. When first opened, it gets converted to an array.
	autoLoot : "aLoot",				// {val:(float)modifier} - This is replaced with "loot" when opened, and auto generated. Val can be used to determine the value of the chest. Lower granting fewer items.
	door : "door",					// {index:(int)room_index, no_exit:(bool)no_exit} - Door will automatically trigger "open" animation when successfully used. no_exit will prevent the exit door icon from being added
	exit : "exit",					// {dungeon:(str)dungeon_label, index:(int)landing_room=0}
	anim : "anim",					// {anim:(str)animation}
	lever : "lever",				// {id:(str)id} - Does the same as dungeonVar except it toggles the var (id) true/false and handles "open", "open_idle", "close" animations
	quest : "quest",				// {quest:(str/Quest)q} - Offers a quest
	toggleCombat : "toggleCombat",	// {on:(bool)combat} - Turns combat on or off
	generateDungeon : "generateDungeon",	// {difficulty:(int)difficulty=#players} - Resets the active procedural dungeon and clears any procedural quests you've started
	visitDungeon : "visitDungeon",			// {} - Visits the current procedurally generated dungeon
	roleplay : "roleplay",					// {rp:(str/obj)roleplay} - A label or roleplay object
};


