// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import Asset from './Asset.js';
import GameEvent from './GameEvent.js';
import Dungeon, { DungeonRoomAsset } from './Dungeon.js';
import Calculator from './Calculator.js';
import Quest from './Quest.js';
import Roleplay, { RoleplayStageOption } from './Roleplay.js';
import Shop from './Shop.js';
import Player from './Player.js';
import Text from './Text.js';
import HitFX from './HitFX.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import StaticModal from './StaticModal.js';
import Encounter from './Encounter.js';
import { Wrapper } from './EffectSys.js';

export default class GameAction extends Generic{

	constructor(data, parent){
		super();

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.desc = '';
		this.type = GameAction.types.door;
		this.data = null;
		this.conditions = [];

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			type : this.type,
			conditions : Condition.saveThese(this.conditions, full)
		};


		if( full === "mod" ){
			out.label = this.label;
			out.desc = this.desc;
			this.g_sanitizeDefaults(out);
		}
		if( full || GameAction.typesToSendOnline[this.type] ){
			out.data = this.flattenData(full);
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
				this.parent.onModified();
				return true;
			}
		}
	}

	load( data ){

		this.g_autoload(data);

	}

	rebase(){

		if( !this.id )
			this.g_resetID();

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
			
			
			// Loot is needed in netcode
			if( this.type === GameAction.types.loot ){
				
				if( typeof this.data !== "object" || this.data === null )
					console.error("Trying to load non-object to loot type in interaction:", this);

				// Looks like this after being put in world
				if( Array.isArray(this.data) )
					this.data = Asset.loadThese(this.data);
				// Looks like this as a template
				else
					this.data.loot = Asset.loadThese(this.data.loot);
				
			}

			// Encounters are needed by netcode
			if( this.type === GameAction.types.encounters && game.is_host ){
				if( !Array.isArray(this.data) )
					console.error("Trying to load non-array to encounter type in interaction:", this);
				this.data = Encounter.loadThese(this.data);
			}

			// RP is needed in netcode
			if( this.type === GameAction.types.roleplay ){
				
				if( !this.data || !this.data.rp ){
					console.error("Data doesn't have .rp in object", this);
					return;
				}
				this.data.rp = this.getDataAsRoleplay();
				
			}

			// Shop is needed in netcode
			if( this.type === GameAction.types.shop ){
				this.data.shop = this.getDataAsShop();
			}

			

			


			/*
			These shouldn't be needed because they're not needed by netcode
			if( this.type === GameAction.types.learnAction )
				this.data.conditions = Condition.loadThese(this.data.conditions);
			if( this.type === GameAction.types.addPlayer )
				this.data.player = this.getDataAsPlayer();
			if( this.type === GameAction.types.addPlayerTemplate )
				this.data.player = this.getDataAsPlayerTemplate();
			if( this.type === GameAction.types.text )
				this.data.text = this.getDataAsText();
			*/

		}


	}


	// polymorphs this into loot and saves
	convertToLoot(){

		if( !this.data )
			console.error("Data is missing from", this);

		if( this.type === this.constructor.types.loot && !Array.isArray(this.data) ){

			let min = isNaN(this.data.min) || this.data.min < 0 ? Infinity : +this.data.min,
				max = isNaN(this.data.max) || this.data.min < 0 ? Infinity : +this.data.max,
				loot = this.data.loot
			;
			if( this.data.max < this.data.min )
				this.data.max = this.data.min;

			if( min > loot.length )
				min = loot.length;
			if( max > loot.length || max < 0 )
				max = loot.length;			


			let numItems = Math.floor(Math.random()*(max+1-min))+min;


			const out = [];
			for( let i =0; i<numItems && loot.length; ++i ){
				let n = Math.floor(Math.random()*loot.length);
				const asset = Asset.convertDummy(loot.splice(n, 1).shift(), this);
				asset.g_resetID();
				out.push(asset);
			}
			this.data = out;

		}
		else if( this.type === this.constructor.types.autoLoot ){

			const value = isNaN(this.data.val) ? 0.5 : +this.data.val;

			const dungeon = this.getDungeon();

			this.type = this.constructor.types.loot;
			this.data = [];
			this.g_resetID();	// needed for netcode to work

			let money = 0;
			if( Math.random()/2 < value )
				money = Math.floor(Math.random()*Math.pow(value, 3)*1000);
			
			// weight of 0.5 adds loot
			if( value >= 0.5 ){

				// Generate a random piece of loot
				const loot = Asset.generate( 
					undefined, 	// Slot
					game.getAveragePlayerLevel(), 
					undefined, 	// Viable template
					undefined, 	// Viable materials
					undefined, // enforced rarity
					Math.floor((value-0.5)*2*Asset.Rarity.LEGENDARY), // Min rarity
				);
				if( loot )
					this.data.push(loot);
					
			}

			// 0-2 consumables, or 1-3 if no gear
			let numBonus = Math.round(Math.pow(Math.random(),3)*2);
			let numConsumables = numBonus+!(value >= 0.5);
			let consumablesAdded = 0;
			for( let i=0; i<numConsumables; ++i ){
				let consumable = Asset.getRandomByRarity(dungeon.consumables);
				if( !consumable )
					break;
				consumable.g_resetID();
				this.data.push(consumable.clone(this.parent));
				++consumablesAdded;
			}
			
			if( consumablesAdded < numConsumables ){
				let copperAmount = Math.floor(value*500*(Math.random()*0.5+0.5)*(numConsumables-consumablesAdded));	// numConsumabes-consumablesAdded is either 1 or 2
				let split = Player.calculateMoneyExhange(copperAmount);
				for( let i in split ){
					if( !split[i] )
						continue;
					const asset = glib.get(Player.currencyWeights[i], 'Asset');
					asset._stacks = split[i];
					this.data.push(asset);
				}
			}

			if( money ){

				let assets = Player.copperToAssets(money);
				for( let asset of assets )
					this.data.push(asset);

			}

		}
		else
			return this;

		if( this.parent instanceof DungeonRoomAsset ){
			this.parent.onModified();
		}

		game.save();
		return this;

	}

	
	// Converts data to roleplay
	getDataAsRoleplay(){
		let rp = Roleplay.loadThis(this.data.rp, this);
		if( typeof rp !== "object" ){
			console.error("Error, ", this.data.rp, "is not a valid roleplay in", this);
			return false;
		}
		rp = rp.clone();
		rp.loadState();
		return rp;
	}

	getDataAsShop(){
		let shop = Shop.loadThis(this.data.shop, this);
		if( typeof shop !== "object" ){
			console.error("Error, ", this.data.shop, "is not a valid shop in", this);
			return false;
		}
		if( game && typeof game === "object" )
			shop.loadState(game.state_shops[shop.label]);
		return shop;
	}

	getDataAsText(){
		return Text.loadThis(this.data.text, this);
	}

	getDataAsPlayer(){
		if( typeof this.data.player === 'string' ){
			return glib.get(this.data.player, 'Player');
		}
		return Player.loadThis(this.data.player, this);
	}
	getDataAsPlayerTemplate(){
		return PlayerTemplate.loadThis(this.data.player, this);
	}
	
	getParentRoleplay(){
		
		let p = this;
		while( p.parent && !(p.parent instanceof Roleplay) ){
			p = p.parent;
		}
		return p;
	
	}

	getParentEncounter(){
		
		let p = this;
		while( p.parent && !(p.parent instanceof Encounter) ){
			p = p.parent;
		}
		return p;
	
	}

	// note: mesh should be the mesh you interacted with, or the player you interacted with (such as the player mapped to a roleplay text)
	async trigger( player, mesh ){
		
		const asset = this.parent;
		const types = GameAction.types;


		// Helper function for playing animation on this asset. Returns the animation played if any
		function playAnim( anim ){
			if( !mesh || !mesh.userData || !mesh.userData.playAnimation )
				return;
			game.net.dmAnimation( asset, anim );
			return mesh.userData.playAnimation(anim);

		}


		if( this.type === types.encounters ){

			game.mergeEncounter(player, Encounter.getRandomViable(Encounter.loadThese(this.data)));
			this.remove();	// Prevent it from restarting
			asset.updateInteractivity();	// After removing the action, update interactivity

		}
		else if( this.type === types.resetEncounter ){

			let enc = this.data.encounter;
			if( !enc )
				enc = this.getParentEncounter();
			if( !enc )
				return false;

			if( enc.label )
				enc = enc.label;

			

		}

		else if( this.type === types.door ){
			if( !this.data ){
				console.error("Trying to trigger a door with no data", this);
				return;
			}

			if( isNaN(this.data.index) )
				this.data.index = 0;

			if( !game.canTransport() )
				return;
			
			game.dungeon.goToRoom( player, this.data.index );
			playAnim("open");

		}
		
		else if( this.type === types.addTime ){

			const seconds = parseInt(this.data.seconds);
			if( !seconds ){
				console.error(this);
				throw 'Invalid amounts of seconds to add in GameAction';
			}

			game.addSeconds(seconds);			

		}
		else if( this.type === types.exit ){
			
			game.onDungeonExit();
			const dungeon = glib.get(this.data.dungeon, 'Dungeon');
			if( !dungeon )
				return game.ui.modal.addError("Dungeon not found");
			const room = !isNaN(parseInt(this.data.index)) ? parseInt(this.data.index) : 0;
			const load = game.setDungeon(dungeon, room);
			const time = Math.floor(this.data.time) || 60;
			game.addSeconds(time);

			await load;
		}

		else if( this.type === types.dungeonVar || this.type === types.lever ){

			const dungeon = game.dungeon;
			
			let val = !dungeon.vars[this.data.id];
			if( this.type === types.dungeonVar )
				val = Calculator.run(this.data.val, new GameEvent({sender:player,target:player,dungeon:dungeon}), dungeon.vars);
			else{
				if( val )
					playAnim("open");
				else
					playAnim("close");
			}

			dungeon.setVar(this.data.id, val);
			
		}
		else if( this.type === types.anim ){
			playAnim(this.data.anim);
		}

		else if( this.type === types.loot ){
			game.ui.drawContainerLootSelector( player, this.parent );
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

		else if( this.type === types.toggleCombat ){
			let makeHostile = this.data.enc !== false;
			if( makeHostile ){
				game.makeEncounterHostile();
			}
			game.toggleBattle(this.data.on);
		}


		else if( this.type === types.roleplay ){

			const rp = this.getDataAsRoleplay();
			if( rp.completed && rp.once )
				return false;
			rp.completed = false;
			if( rp.validate(player) ){
				game.setRoleplay(rp);
			}

		}
		else if( this.type === types.resetRoleplay ){
			
			let roleplay = this.data.roleplay;
			if( !roleplay )
				roleplay = this.getParentRoleplay();
			if( !roleplay )
				return;
			if( roleplay.label )
				roleplay = roleplay.label;
			game.wipeRPState(roleplay);

		}

		else if( this.type === types.addFaction ){
			game.addFactionStanding(this.data.faction, this.data.amount);
		}

		else if( this.type === types.finishQuest ){

			let quests = toArr(this.data.quest);
			for( let quest of game.quests ){

				if( quests.indexOf(quest.label) === -1 )
					continue;

				if( quest.isCompleted() || this.data.force )
					quest.onFinish();
					
			}

		}

		else if( this.type === types.questObjective ){

			const quest = this.data.quest, 
				objective = this.data.objective, 
				type = this.data.type || "add";
			let amount = parseInt(this.data.amount) || 1;
			const active = game.getQuestByLabel(quest);
			if( !active ){
				console.error("Trying to add to quest objective on unaccepted quest", quest, this);
				return;
			}
			const obj = active.getObjectiveByLabel(objective);
			if( !obj ){
				console.error("Objective not found in quest", objective, active);
				return;
			}

			obj.addAmount(amount, type==="set");
			game.save();
			game.ui.draw();
			game.renderer.drawActiveRoom();
			
		}

		else if( this.type === types.addInventory ){

			let pl = player;
			if( this.data.player )
				pl = game.getPlayerByLabel(this.data.player);

			if( !pl ){
				console.error("Player not found", pl);
				return;
			}
			let asset = Asset.loadThis(this.data.asset);
			if( ! asset ){
				console.error("Asset not found", this.data.asset);
				return;
			}
			
			asset.restore();

			const amount = isNaN(parseInt(this.data.amount)) ? 1 : parseInt(this.data.amount);
			console.log("Adding ", asset, amount, pl);
			if( amount > 0 )
				pl.addAsset( asset, amount );
			else if( amount < 0 )
				pl.destroyAssetsByLabel(asset.label, Math.abs(amount));
		}



		else if( this.type === types.addCopper ){

			let pl = player;
			if( this.data.player )
				pl = game.getPlayerByLabel(this.data.player);

			if( !pl ){
				console.error("Player not found", pl);
				return;
			}

			const amount = isNaN(parseInt(this.data.amount)) ? 1 : parseInt(this.data.amount);
			if( amount > 0 )
				pl.addCopperAsMoney(amount);
			else
				pl.consumeMoney(Math.abs(amount));

		}

		else if( this.type === types.shop || this.type === types.repairShop || this.type === types.rentRoom || this.type === types.gym )
			return;

		else if( this.type === types.playerAction ){
			let caster = game.getPlayerByLabel(this.data.player);
			if( !this.data.player )
				caster = player;
			if( caster instanceof Player ){
				caster.useActionLabel(this.data.action, [player]);
			}
		}
		else if( this.type === types.text ){
			const tx = this.getDataAsText();
			tx.run(new GameEvent({}));	// Todo: Extend this with ability to set sender/target, and such
		}
		else if( this.type === types.hitfx ){
			const evt = new GameEvent({}, this);
			const casters = game.getEnabledPlayers().filter(player => {
				evt.target = evt.sender = player;
				return ( !Array.isArray(this.data.caster_conds) || Condition.all(this.data.caster_conds, evt) );
			});
			const targets = game.getEnabledPlayers().filter(player => {
				evt.target = evt.sender = player;
				return ( !Array.isArray(this.data.target_conds) || Condition.all(this.data.target_conds, evt) );
			});
			let fx = this.data.hitfx;
			if( !Array.isArray(fx) )
				fx = [fx];
			
			let trigs = 0;
			for( let f of fx ){
				f = HitFX.loadThis(f);
				for( let caster of casters ){
					game.renderer.playFX(caster, targets, f, undefined, true, false);
					if( this.data.max_triggers && ++trigs >= this.data.max_triggers ){
						break;
					}
				}
			}

		}

		else if( this.type === types.setDungeon ){
			
			let dungeon = this.data.dungeon,
				room = this.data.room || 0;
			if( dungeon )
				game.setDungeon(dungeon, room);
			else
				game.dungeon.goToRoom( player, room );

		}

		else if( this.type === types.trade ){

			const findPlayer = labelOrId => {
				let out = game.getPlayerById(labelOrId);
				if( !out )
					out = game.getPlayerByLabel(labelOrId);
				return out;
			};

			let from = findPlayer(this.data.from), 
				to = findPlayer(this.data.to)
			;
			if( !this.data.from )
				from = player;
			if( !this.data.to )
				to = player;

			if( !from || !to )
				return false;

			let asset = from.getAssetByLabel(this.data.asset);
			let amount = parseInt(this.data.amount) || 1;
			if( !amount || !asset )
				return;

			if( asset._stacks < amount )
				amount = asset._stacks;

			game.tradePlayerItem( from, to, asset.id, amount, true );


		}

		else if( this.type === types.sleep ){
			if( player.isLeader() )
				StaticModal.set('sleepSelect', player, mesh);
		}

		else if( this.type === types.addPlayer ){
			const player = this.getDataAsPlayer().clone().g_resetID();
			player.onPlacedInWorld();
			player.generated = true;	// Makes sure it gets removed
			game.addPlayer(player, this.data.nextTurn);
		}
		else if( this.type === types.addPlayerTemplate ){
			game.addPlayerFromTemplate(this.getDataAsPlayerTemplate(), this.data.nextTurn);
		}

		else if( this.type === types.execRentRoom ){
			const cost = this.data.copper || 0;
			if( player.getMoney() < cost )
				return;
			player.consumeMoney(cost);
			// Set the dungeon var
			game.dungeon.setVar('room_last_rented', game.time);

			game.playFxAudioKitById("buy_item", player, player, undefined, true);
			const rp = new Roleplay({
				label : 'room_rental_complete',
				player : this.data.renter,
				stages : [
					{
						text : this.data.success_text || 'Thank you, enjoy your stay!',
						options : [{index:-1, text:'[Done]',chat:RoleplayStageOption.ChatType.none}]
					}
				]	
			});
			game.setRoleplay(rp);
			game.renderer.drawActiveRoom();
			game.ui.draw();

		}
		else if( this.type === types.learnAction ){

			console.log("Todo: learnAction");

		}

		else if( this.type === types.wrappers ){

			const wrappers = Wrapper.loadThese(this.data);
			for( let wrapper of wrappers )
				wrapper.useAgainst( player, player );

		}

		else if( this.type === types.proceduralDungeon ){

			game.setProceduralDungeon( this.data );

		}

		else{
			console.error("Game action triggered with unhandle type", this.type, this);
			return false;
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

	validate(player, debug){

		if( !Condition.all(this.conditions, new GameEvent({
			target: player,
			sender: player,
			dungeon : this.parent.parent.parent,
			room : this.parent.parent,
			dungeonRoomAsset : this.parent,
			debug : this
		}), debug) )return false;
		
		return true;
	}

	
}
GameAction.types = {
	encounters : "enc",				
	resetEncounter : "resetEnc",
	wrappers : "wra",
	dungeonVar : "dvar",
	loot : "loot",
	autoLoot : "aLoot",				// 
	door : "door",					// 
	exit : "exit",					// 
	proceduralDungeon : "proceduralDungeon",					// 
	anim : "anim",					// 
	lever : "lever",				// 
	quest : "quest",				// 
	questObjective : "questObjective",		// 
	addInventory : "addInventory",			// 
	toggleCombat : "toggleCombat",			// 
	roleplay : "roleplay",					// 
	finishQuest : "finishQuest",			// 
	tooltip : "tooltip",					// 
	shop : "shop",							// 
	gym : "gym",							// 
	playerAction : "playerAction",			// 
	repairShop : "repairShop",				// 
	text : "text",							// 
	hitfx : "hitfx",						// 
	addPlayer : "addPlayer",				// 
	addPlayerTemplate : "addPlayerTemplate",	// 
	rentRoom : "rentRoom",					// 
	execRentRoom : "execRentRoom",			// 
	sleep : "sleep",						// 
	resetRoleplay : "resetRoleplay",		// 
	setDungeon : "setDungeon",				// 
	addFaction : "addFaction",				// 
	trade : "trade",						// 
	learnAction : "learnAction",			// 
	addCopper : 'addCopper',
	addTime : 'addTime',
};

GameAction.TypeDescs = {
	[GameAction.types.encounters] : "(arr)encounters - Picks a random encounter to start",
	[GameAction.types.resetEncounter] : "{encounter:(str)label} - If encounter is not defined, it tries to find the closest encounter parent and reset that one",
	[GameAction.types.wrappers] : "(arr)wrappers - Triggers all viable wrappers",
	[GameAction.types.loot] : "{loot:(arr)assets, min:(int)min_assets=0, max:(int)max_assets=-1}, Live: [asset, asset, asset...] - Loot will automatically trigger \"open\" and \"open_idle\" animations when used on a dungeon room asset. When first opened, it gets converted to an array.",
	[GameAction.types.autoLoot] : "{val:(float)modifier} - This is replaced with \"loot\" when opened, and auto generated. Val can be used to determine the value of the chest. Lower granting fewer items.",
	[GameAction.types.door] : "{index:(int)room_index, badge:(int)badge_type} - Door will automatically trigger \"open\" animation when successfully used. badge can be a value between 0 and 2 and sets the icon above the door. 0 = normal badge, 1 = hide badge, 2 = normal but with direction instead of exit",
	[GameAction.types.exit] : "{dungeon:(str)dungeon_label, index:(int)landing_room=0, time:(int)travel_time_seconds=60}",
	[GameAction.types.proceduralDungeon] : "{label:(str)label, templates:(arr)viable_templates}",
	[GameAction.types.anim] : '{anim:(str)animation} - Usable on a dungeon room asset',
	[GameAction.types.lever] : '{id:(str)id} - Does the same as dungeonVar except it toggles the var (id) true/false and handles "open", "open_idle", "close" animations',
	[GameAction.types.quest] : '{quest:(str/Quest)q} - Starts a quest',
	[GameAction.types.questObjective] : '{quest:(str)label, objective:(str)label, type:(str "add"/"set")="add", amount:(int)amount=1} - Adds or subtracts from an objective',
	[GameAction.types.addInventory] : '{"player":(label)=evt_player, "asset":(str)label, "amount":(int)amount=1} - Adds or removes inventory from a player',
	[GameAction.types.toggleCombat] : '{on:(bool)combat, enc:(bool)make_encounter_hostile=true} - Turns combat on or off. If enc is not exactly false, it also makes the encounter hostile.',
	[GameAction.types.roleplay] : '{rp:(str/obj)roleplay} - A label or roleplay object',
	[GameAction.types.finishQuest] : '{quest:(str/arr)ids, force:(bool)force=false} - Allows handing in of one or many completed quests here. If force is true, it finishes the quest regardless of progress.',
	[GameAction.types.tooltip] : '{text:(str)text} 3d asset only - Draws a tooltip when hovered over. HTML is not allowed, but you can use \n for rowbreak',
	[GameAction.types.shop] : '{shop:(str)shop, player:(str)player_offering_shop} - Passive. Shop is tied to a player inside the shop object. Shop can NOT be an object due to multiplayer constraints.',
	[GameAction.types.gym] : '{player:(str)player_offering} - Passive. Player is the player that should have the gym icon attached to them. ',
	[GameAction.types.playerAction] : '{player:(str)label, action:(str)label} - Forces a player to use an action on event target. If player is unset, it\'s the supplied triggering player that becomes the caster',
	[GameAction.types.repairShop] : '{player:(str)label} - Marks a player as offering repairs',
	[GameAction.types.text] : '{text:(str/obj)text} - Triggers a Text',
	[GameAction.types.hitfx] : '{hitfx:(obj/str/arr)hitfx, caster_conds:(arr)caster_conditions, target_conds:(arr)target_conds, max_triggers:(int)=all} - Triggers a hitfx',
	[GameAction.types.addPlayer] : '{player:(obj/str)monster, turn:(int)turn_offset=-1}',
	[GameAction.types.addPlayerTemplate] : '{player:(obj/str)template, nextTurn:(bool)=false} - If nextTurn is true, it adds the player on next turn instead of before the current player',
	[GameAction.types.rentRoom] : '{cost:(int)copper, text:(str)rp, success_text:(str)successfully_rented_text, player:(str)label} - Draws the rent a room icon on a target.',
	[GameAction.types.execRentRoom] : '{cost:(int)copper, success_text:(str)successfully_rented_text, renter:(str)renter_merchant_label} - Execs a room rental in this dungeon. This is generated automatically by above.',
	[GameAction.types.sleep] : '{} - Used on a mesh to attach a sleep picker to it.',
	[GameAction.types.resetRoleplay] : '{roleplay:(str)label} - Resets a roleplay. If no roleplay is provided and the gameEvent can parent up to a roleplay, it resets that one',
	[GameAction.types.setDungeon] : '{dungeon:(str)dungeon, room:(int)index} - Sets the dungeon. If you leave out dungeon, it targets your active dungeon',
	[GameAction.types.addFaction] : '{faction:(str)label, amount:(int)amount} - Adds or removes reputation',
	[GameAction.types.trade] : '{asset:(str)label, amount:(int)amount=1, from:(str)label/id, to:(str)label/id} - ID is checked first, then label. If either of from/to is unset, they use the event player.',
	[GameAction.types.learnAction] : '{conditions:(arr)conditions, action:(str)actionLabel} - This is run on all players on team 0. Use conditions to filter. Marks an action on a player as learned. If they have a free spell slot, it immediately activates it.',
	[GameAction.types.addCopper] : '{player:(label)=evt_player, amount:(int)copper} - Subtracts money from target.',
	[GameAction.types.addTime] : '{seconds:(int)seconds}',
	[GameAction.types.dungeonVar] : '{id:(str)id, val:(str)formula} - Sets a variable in the currently active dungeon',
};

// These are types where data should be sent to netgame players
GameAction.typesToSendOnline = {
	[GameAction.types.roleplay] : true,
	[GameAction.types.door] : true,
	[GameAction.types.loot] : true,
	[GameAction.types.dungeonVar] : true,
	[GameAction.types.lever] : true,
	[GameAction.types.tooltip] : true,
	[GameAction.types.shop] : true,
	[GameAction.types.repairShop] : true,
	[GameAction.types.rentRoom] : true,
	[GameAction.types.gym] : true,
};


GameAction.getViable = function( actions = [], player = undefined, debug = false, validate = true ){
	let out = [];
	for( let action of actions ){

		let valid = action.validate(player, debug);
		if( valid || !validate )
			out.push(action);

	}
	return out;
}
