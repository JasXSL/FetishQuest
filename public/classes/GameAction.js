// Similar to action, except this one is for permanent non-combat actions
// Generally tied to DungeonAsset and Roleplay
// Handles interactions
import Generic from './helpers/Generic.js';
import Condition from './Condition.js';
import Asset from './Asset.js';
import GameEvent from './GameEvent.js';
import Dungeon, { DungeonRoomAsset } from './Dungeon.js';
import Calculator from './Calculator.js';
import Quest, { QuestObjective } from './Quest.js';
import Roleplay, { RoleplayStageOption } from './Roleplay.js';
import Shop from './Shop.js';
import Player from './Player.js';
import Text from './Text.js';
import HitFX from './HitFX.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import StaticModal from './StaticModal.js';
import Encounter from './Encounter.js';
import { Wrapper } from './EffectSys.js';
import Collection from './helpers/Collection.js';
import Action from './Action.js';
import Game from './Game.js';
import Faction from './Faction.js';
import Book from './Book.js';

export default class GameAction extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			data : Collection,
			playerConds : Condition
		};
	}

	// Helper function since we're using collections
	getCollectionRelations( field ){

		if( field === 'data' ){
			if( !GameAction.TypeRelations()[this.type] )
				console.log("Note: Trying to get GameAction collection relations from type", this.type, "It may work, but if export data is missing, you know why");
			return GameAction.TypeRelations()[this.type] || {};
		}

	}

	constructor(data, parent){
		super(data, parent);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.desc = '';
		this.type = GameAction.types.door;
		this.data = new Collection({}, this);
		this.conditions = [];

		this.playerConds = [];	// Can be used to override the target. Picks all enabled players that match these conditions.

		this.load(data);
	}

	save( full ){

		const out = {
			id : this.id,
			type : this.type,
			conditions : Condition.saveThese(this.conditions, full),
			playerConds : Condition.saveThese(this.playerConds, full),
			desc : this.desc,	// Needed for asset interactions
		};

		if( full || GameAction.typesToSendOnline[this.type] ){
			
			out.data = full === 'mod' ? 
				deepClone(this.data) : 
				this.data.save(full)
			;

		}

		if( full === "mod" ){
			out.label = this.label;
			this.g_sanitizeDefaults(out);
		}
		


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
		// Workaround for changed saving
		// Todo: go through the existing assets and convert them in the editor to the correct format
		if( data && data.type === GameAction.types.encounters && Array.isArray(data.data) )
			data.data = {encounter : data.data};
		if( data && data.type === GameAction.types.wrappers && Array.isArray(data.data) )
			data.data = {wrappers : data.data};

		this.g_autoload(data);

	}

	rebase(){
		this.g_rebase();	// Super
		
		if( !this.id )
			this.g_resetID();

		if( this.data.constructor === Object || this.data.constructor === Array )
			this.data = deepClone(this.data);
		

		if( window.game ){
			
			// Loot is needed in netcode
			if( this.type === GameAction.types.loot ){
				
				// Looks like this after being put in world
				if( Array.isArray(this.data.genLoot) ){
					this.data.genLoot = Asset.loadThese(this.data.genLoot, this);
				}
				// Looks like this is a template
				else{
					this.data.loot = Asset.loadThese(this.data.loot, this);
				}
			}

			// Encounters are needed by netcode
			if( this.type === GameAction.types.encounters && game.is_host ){

				if( !Array.isArray(this.data.encounter) )
					console.error("Trying to load non-array to encounter type in interaction:", this);
				this.data.encounter = Encounter.loadThese(this.data.encounter, this);
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

		}


	}


	// polymorphs this into loot and saves
	convertToLoot(){

		if( !this.data )
			console.error("Data is missing from", this);


		if( this.type === this.constructor.types.loot && !Array.isArray(this.data.genLoot) ){

			this.data.min = parseInt(this.data.min) || 1;
			this.data.max = parseInt(this.data.max) || Infinity;

			let min = this.data.min < 0 ? Infinity : +this.data.min,
				max = this.data.max < 0 ? Infinity : +this.data.max,
				loot = this.data.loot
			;
			if( this.data.max < this.data.min )
				this.data.max = this.data.min;

			if( min > loot.length )
				min = loot.length;
			if( max > loot.length || max < 0 )
				max = loot.length;			


			let numItems = Math.floor(Math.random()*(max-min))+min;
			const out = [];
			for( let i =0; i < numItems && loot.length; ++i ){

				let n = Math.floor(Math.random()*loot.length);
				const asset = Asset.convertDummy(loot.splice(n, 1).shift(), this);
				asset.g_resetID();
				out.push(asset);

			}

			this.data = new Collection({
				genLoot : out
			}, this);
			

		}
		else if( this.type === this.constructor.types.autoLoot ){

			const value = isNaN(this.data.val) ? 0.5 : +this.data.val;
			const allowCosmetic = this.data.cosmetic;

			const dungeon = this.getDungeon();

			this.type = this.constructor.types.loot;
			this.data = new Collection({genLoot : []}, this);
			this.g_resetID();	// needed for netcode to work

			let money = 0;
			if( Math.random()/2 < value )
				money = Math.floor(Math.random()*Math.pow(value, 3)*1000);
			
			// weight of 0.5 adds equipment loot
			if( value >= 0.5 ){

				const players = game.getTeamPlayers();
				let nrLoot = 1+Math.floor(Math.random()*players.length);
				for( let i = 0; i < nrLoot; ++i ){

					let val = (value-0.5)*2;		// From 0 -> 1
					val = Math.max(0, val-0.2*i); 	// Subsequent loot rolls 20% lower
					val *= Asset.Rarity.LEGENDARY;
					// Generate a random piece of loot
					const loot = Asset.generate( 
						undefined, 	// Slot
						game.getAveragePlayerLevel(), 
						undefined, 	// Viable template
						undefined, 	// Viable materials
						undefined, // enforced rarity
						Math.floor(val), // Min rarity
						undefined,
						allowCosmetic
					);
					if( loot )
						this.data.genLoot.push(loot);
					
				}

			}

			// 0-2 consumables, or 1-3 if no gear
			let numBonus = Math.round(Math.pow(Math.random(),3)*2);
			let numConsumables = numBonus+!(value >= 0.5);
			let consumablesAdded = 0;
			for( let i=0; i<numConsumables; ++i ){
				let consumable = Asset.getRandomByRarity(dungeon.getConsumables());
				if( !consumable )
					break;
				consumable.g_resetID();
				this.data.genLoot.push(consumable.clone(this.parent));
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
					this.data.genLoot.push(asset);
				}
			}

			if( money ){

				let assets = Player.copperToAssets(money);
				for( let asset of assets )
					this.data.genLoot.push(asset);

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

		// only clone once
		if( !(this.data.rp instanceof Roleplay) )
			this.data.rp = Roleplay.loadThis(this.data.rp, this).clone();

		// Load state each time it's fetched
		this.data.rp.loadState();
		return this.data.rp;

	}

	getDataAsShop(){

		// This is called when loading a mod...
		if( this.data.shop instanceof Shop )
			return this.data.shop;

		let shop = Shop.loadThis(this.data.shop, this);
		if( typeof shop !== "object" ){
			console.error("Error, ", this.data.shop, "is not a valid shop in", this);
			return false;
		}
		/* State should be loaded when entering a cell with a shop. This shouldn't be needed
		if( game && typeof game === "object" )
			shop.loadState();
		*/
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

	// note: Use trigger instead externally
	// Runs the game action
	// Player is the target, sender is optional
	async exec( player, mesh, debug, sender ){

		const asset = this.parent;
		const types = GameAction.types;

		// Helper function for playing animation on this asset. Returns the animation played if any
		const playAnim = ( anim, targ ) => {

			if( !targ ){
				if( !mesh )
					console.error("Trying to call playAnim, but GameAction contained no mesh in game action", this);
				targ = mesh.userData.dungeonAsset;
			}
			else
				targ = game.dungeon.getActiveRoom().assets.filter(el => el.name === targ);

			if( !targ )
				return false;

			targ = toArray(targ);

			let succ = 0;
			for( let t of targ ){

				if( !t._stage_mesh )
					continue;

				if( t._stage_mesh.userData.playAnimation ){

					t._stage_mesh.userData.playAnimation(anim);
					Game.net.dmAnimation( t, anim );
					++succ;

				}

			}

			return succ;

		}


		if( this.type === types.encounters ){

			const encounter = Encounter.getRandomViable(Encounter.loadThese(this.data.encounter));

			game.startEncounter(player, encounter, !this.data.replace, mesh);
			this.remove();	// Prevent it from restarting
			asset?.updateInteractivity?.();	// After removing the action, update interactivity

		}
		else if( this.type === types.resetRoomEncounter ){

			let dungeon = this.data.dungeon;
			if( !dungeon )
				dungeon = game.dungeon.label;

			let room = this.data.room;
			if( !room )
				room = game.dungeon.active_room;

			// first off, remove it from game state
			let ds = game.state_dungeons.get(dungeon);
			if( !ds ){
				console.debug("Note: Dungeon ", dungeon, "has no save state yet");
				return true;
			}
			ds.rooms.unset('index_'+room);
			
			// This is the current dungeon, we'll have to track down said room and reset the state too
			if( dungeon === game.dungeon.label ){
				let lr = game.dungeon.getRoomByIndex(room);
				if( lr )
					lr.resetEncounter();
			}
			

		}

		else if( this.type === types.refreshPlayerVisibility )
			game.refreshPlayerVisibility();

		else if( this.type === types.refreshMeshes ){

			game.renderer.stage.onRefresh();
			Game.net.dmRefreshMeshes();
			
		}
		else if( this.type === types.removePlayer ){

			let playersToRemove = game.players.filter(el => el.label === this.data.player);
			if( !this.data.player )
				return false;
			for( let pr of playersToRemove )
				game.removePlayer(pr.id);
			
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

			game.addSeconds(seconds, this.data.force);			

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

			let dungeon = game.dungeon;
			if( this.data.dungeon ){
				dungeon = glib.get(this.data.dungeon, 'Dungeon').clone();
				dungeon.loadState();
			}
			let val = !dungeon.vars[this.data.id];
			if( this.type === types.dungeonVar ){

				const evt = new GameEvent({sender,target:player,dungeon:dungeon});

				// Vals starting with $$ are treated as string literals
				if( String(this.data.val).startsWith('$$') )
					val = String(this.data.val).substring(2);
				// Otherwise it's treated as a formula
				else
					val = Calculator.run(this.data.val, evt, dungeon.vars);
				
				let pre = dungeon.getVar(this.data.id);	
				// Handles setting on targets
				if( Array.isArray(this.data.targets) && this.data.targets.length ){
					
					if( !pre || typeof pre !== "object" )
						pre = {};

					let targs = Calculator.targetsToKeys(this.data.targets, evt, this.data.id);
					for( let t of targs ){
						pre[t] = this.getOperationVal(pre[t], val);
					}
					val = pre;

				}
				// Setting directly on var
				else{
					val = this.getOperationVal(pre, val);
				}

			}
			// Lever does animation automatically
			else{
				if( val )
					playAnim("open");
				else
					playAnim("close");
			}

			dungeon.setVar(this.data.id, val);
			
		}
		else if( this.type === types.setRpVar ){

			let rp = game.roleplay;
			if( rp.label === '' )	// Not in an RP
				return;
			let id = String(this.data.id).trim();
			let val = String(this.data.val).trim();
			if( !id || typeof val !== "string" )
				return;

			const evt = new GameEvent({
				sender:rp.getActiveStage().getPlayer() || player,
				target:player,
			});

			// Use $$ for string literal values
			if( val.startsWith('$$') )
				val = val.substring(2);
			// Anything else gets treated as a formula
			else
				val = Calculator.run(val, evt, {});

			let pre = rp._vars.get(id);
			// If this.data.targets is set, then we need to treat it as individual vars per player
			if( Array.isArray(this.data.targets) && this.data.targets.length ){

				let targs = Calculator.targetsToKeys(this.data.targets, evt, id);
				if( typeof pre !== "object" || !pre )
					pre = {};
				for( let t of targs ){

					pre[t] = this.getOperationVal(pre[t], val);

				}
				val = pre;

			}
			// Otherwise we need to set val based on the operation
			else{
				val = this.getOperationVal(pre, val);
			}

			if( debug )
				console.log("Setting RP var", id, "to", val);
			rp._vars.set(id, val);
			

		}
		else if( this.type === types.resetRpVar ){

			const rp = game.roleplay;
			let vars = [];
			if( !rp )
				return;

			let base = glib.get(game.roleplay.label, 'Roleplay');
			if( !base )
				return;

			if( this.data.var === undefined || String(this.data.var).trim() === '' )
				vars = rp._vars.keys();

			for( let k of vars ){

				if( base._vars.hasOwnProperty(k) ){
					rp._vars[k] = base._vars[k];
					if( typeof base._vars[k] === "object" )	// Object is ONLY used to store player : var pairs, so should be reset to a new object
						rp._vars[k] = {};
				}
				else
					rp._vars.unset(k);

			}
			game.saveRPState(rp);

		}
		
		else if( this.type === types.anim ){

			playAnim(this.data.anim, this.data.targ);

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
			game.setRoleplay(rp, false, player);

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
			for( let quest of quests ){

				let active = game.getQuestByLabel(quest);
				// We don't have this quest
				if( !active ){

					if( !this.data.force )
						continue;

					// Force finish this quest by starting it
					game.addQuest(quest, true);
					active = game.getQuestByLabel(quest);
					// Happens if you mistyped the label
					if( !active ){
						console.error("Quest missing from DB", quest);
						continue;
					}

				}

				if( active.isCompleted() || this.data.force )
					active.onFinish();

			}

		}

		else if( this.type === types.questObjective ){

			const quest = this.data.quest, 
				objective = this.data.objective, 
				type = this.data.type || "add",
				audioKit = this.data.audioKit	
			;
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

			// Remove if parent is a DungeonRoomAsset to prevent retrigger
			if( this.data?.killParentAsset && this.parent instanceof DungeonRoomAsset ){
				this.remove();
			}

			if( audioKit )
				game.playFxAudioKitById(audioKit, sender, player, undefined, true );

			obj.addAmount(amount, type === "set");
			game.save();
			game.ui.draw();
			
			game.renderer.stage.onRefresh();
			Game.net.dmRefreshMeshes();
			
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
			if( this.data.alert )
				game.ui.addText( player.getColoredName()+" received "+asset.name+".", undefined, player.id,  player.id, 'statMessage important' );
				
			let addedAssets;
			if( amount > 0 )
				addedAssets = pl.addAsset( asset, amount );	// note that this resets id
			else if( amount < 0 )
				pl.destroyAssetsByLabel(asset.label, Math.abs(amount));

			if( addedAssets && this.data.equip )
				addedAssets.map(el => pl.equipAsset(el.id, pl, true));

		}

		else if( this.type === types.openShop ){

			const shop = game.getShopHere(this.data.shop);
			if( !shop )
				throw 'Shop missing: '+this.data.shop;

			// open a shop locally
			if( player.netgame_owner === "DM" || !Game.net.isInNetgameHost() ){
				game.ui.openShopWindow(shop);
			}
			else
				Game.net.dmOpenShop(player, this.data.shop);

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

		else if( this.type === types.shop || this.type === types.repairShop || this.type === types.altar || this.type === types.bank || this.type === types.rentRoom || this.type === types.gym || this.type === types.transmog )
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

		else if( this.type === types.addFollower ){
			game.addFollower(this.data.player);
		}
		else if( this.type === types.remFollower ){
			game.stashFollower(this.data.player);
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
						options : [{text:'[Done]',chat:RoleplayStageOption.ChatType.none}]
					}
				]
			});
			game.setRoleplay(rp);
			game.renderer.drawActiveRoom();
			game.ui.draw();


		}
		else if( this.type === types.learnAction ){

			const action = Action.loadThis(this.data.action);
			const conds = Condition.loadThese(this.data.conditions || []);
			let viablePlayers = game.getTeamPlayers();
			for( let pl of viablePlayers ){

				const evt = new GameEvent({
					sender: player,
					target: pl,
					action : action,
				});
				if( !Condition.all(conds, evt) )
					continue;

				pl.addActionFromLibrary(action.label);

			}

		}

		else if( this.type === types.wrappers ){

			if( debug )
				console.log("Running wrapper GA", this, "player is", player);
			const wrappers = Wrapper.loadThese(this.data.wrappers);
			for( let wrapper of wrappers ){

				if( debug )
					console.log("--> Using", wrapper, "against", player);
				wrapper.useAgainst( player, player );

			}
		}

		else if( this.type === types.proceduralDungeon ){

			game.setProceduralDungeon( this.data );

		}

		else if( this.type === types.trap ){

			// Remove if parent is a DungeonRoomAsset to prevent retrigger
			if( this.parent instanceof DungeonRoomAsset )
				this.remove();

			// Didn't trigger
			if( Math.random() > this.data.chance )
				return false;

			// Use the game actions first
			if( Array.isArray(this.data.game_actions) ){

				const actions = GameAction.loadThese(this.data.game_actions);
				for( let action of actions ){
					// prevent recursion
					if( action.id !== this.id )
						action.trigger(player, mesh);

				}

			}

			// Find if we had an action attached
			let action = glib.get(this.data.action, 'Action');
			if( !(action instanceof Action) )
				return false;
			action = action.clone();

			// Create a "player" to act as the trap
			const attacker = new Player();
			attacker.name = this.data.name || 'Trap';
			attacker.level = game.getAveragePlayerLevel();
			//attacker.ap = attacker.mp = 100;
			attacker['bon'+action.type] = this.data.stat || 0;
			action.parent = attacker;
			

			// Pick targets
			let targets = [player];
			let players = game.getTeamPlayers();
			shuffle(players);

			for( let p of players ){
				
				if( targets.includes(p) )
					continue;
				targets.push(p);

			}

			

			const viable = action.getViableTargets();
			targets = targets.filter(p => viable.includes(p));

			// Not enough players for this trap
			if( targets.length < action.min_targets )
				return;

			if( action.max_targets > 0 )
				targets = targets.slice(0, action.max_targets);
			
			action.useOn(targets, false, '');

			game.ui.draw();
			game.ui.toggle(true);
			Game.net.dmToggleUI(true);

		}

		else if( this.type === types.book ){
			game.readBook(player, this.data.label);
		}

		else if( this.type === types.restorePlayerTeam ){
			
			let team = parseInt(this.data.team) || Player.TEAM_PLAYER;
			game.restorePlayerTeam(team);

		}
		else if( this.type === types.setPlayerTeam ){

			const evt = new GameEvent({});
			evt.sender = evt.target = player;
			const team = Calculator.run(this.data.team || 0, evt) || Player.TEAM_PLAYER;
			player.team = team;
			game.save();
			game.ui.draw();

		}

		else if( this.type === types.sliceRpTargets ){

			let start = parseInt(this.data.start) || 0;
			let end;
			let nrPlayers = parseInt(this.data.nrPlayers);
			if( !isNaN(nrPlayers) && nrPlayers > -1 )
				end = start+parseInt(nrPlayers);
			game.roleplay._targetPlayers = game.roleplay._targetPlayers.slice(start, end);

		}
		else if( this.type === types.sortRpTargets ){

			let iters = this.data.mathvars;
			if( !Array.isArray(iters) ){
				console.error("Iters is not an array in GameAction", this);
				return false;
			}

			let players = game.roleplay.getTargetPlayers().map(pl => {
				return {
					p : pl,
					vars : pl.appendMathVars(
						'ta_',
						{},
					)
				};
			});
			

			players = players.sort((a,b) => {

				// Go through sortable objects
				// {var : (str)mathVar, desc:(bool)descending}
				for( let iter of iters ){

					let field = iter.var;
					let desc = iter.desc;
					if( a.vars[field] === b.vars[field] )
						continue;

					let aLesser = a.vars[field] < b.vars[field];
					if( desc )
						return aLesser ? 1 : -1;
					return aLesser ? -1 : 1;

				}
				return 0;
				
			});

			game.roleplay.setTargetPlayers(players.map(pl => pl.p));

		}

		else if( this.type === types.setRain ){
			
			const rain = Calculator.run(this.data.amount, new GameEvent({
				sender : player,
				target : player,
			})) || 0;
			game.setRain(rain);

		}

		else{
			console.error("Game action triggered with unhandle type", this.type, this);
			return false;
		}

	}

	// Shared between dungeonVar and setRpVar to handle the viable math operations
	// Pre is the existing value, and val is the incoming value
	getOperationVal( pre, val ){

		let raw = val;	// Needed in case of a string val
		pre = +pre || 0;
		val = +val || 0;
		// Multiply by val (divide by using fractions)
		if( this.data.operation === "MUL" )
			return pre*val;
		// Add to val (subtract by using a negative number)
		if( this.data.operation === "ADD" )
			return pre+val;
		return raw;

	}

	// note: mesh should be the mesh you interacted with, or the player you interacted with (such as the player mapped to a roleplay text)
	// if checkConditionsEvt is passed, conditions will be checked with that event
	async trigger( player, mesh, debug, sender, checkConditionsEvt ){
		
		if( !player )
			player = game.getMyActivePlayer();

		let targets = [player];
		// Override target
		if( this.playerConds.length ){

			const evt = new GameEvent({
				sender : player,
				target : player,
				dungeon : game.dungeon,
				dungeonRoom : game.dungeon.getActiveRoom(),
			});
			let enabled = game.getEnabledPlayers();
			targets = enabled.filter(target => {
				
				evt.target = target;
				return Condition.all(this.playerConds, evt, debug);

			});

		}

		if( checkConditionsEvt && !Condition.all(this.conditions, checkConditionsEvt) )
			return 0;

		let successes = 0;
		for( let target of targets ){
			try{
				const att = await this.exec(target, mesh, debug, sender);
				if( att !== false )
					++successes;
			}catch(err){
				console.error(err);
			}
		}
		return successes;

	}

	getDungeon(){
		let p = this.parent;
		while( p ){
			p = p.parent;
			if( p instanceof Dungeon )
				return p;
		}
	}

	// Player can either be a single player validated against itself
	// Or it can be an event in which case it uses the event directly
	// Player is used in most cases
	validate(player, roomAsset, debug){

		let evt = player;
		if( !(player instanceof GameEvent) ){

			evt = new GameEvent({
				target: player,
				sender: player,
				dungeon : game.dungeon,
				room : game.dungeon.getActiveRoom(),
				dungeonRoomAsset : roomAsset,
				debug : this
			});

		}

		if( !Condition.all(this.conditions, evt, debug) )
			return false;
		
		return true;
	}




	// Static
	static getByType( actions = [], type = '' ){

		return actions.filter(el => el.type === type );

	}

	
	static getViable( actions = [], player = undefined, debug = false, validate = true, roomAsset = undefined ){
		if( !window.game )
			return actions;
		let out = [];
		for( let action of actions ){
	
			let valid = action.validate(player, roomAsset, debug);
			if( valid || !validate )
				out.push(action);
	
		}
		return out;
	}

	
}
GameAction.types = {
	encounters : "enc",				
	resetRoomEncounter : "resetRoomEncounter",
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
	openShop : "openShop",							// 
	gym : "gym",							// 
	playerAction : "playerAction",			// 
	repairShop : "repairShop",				// 
	altar : "altar",				// 
	bank  : "bank",
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
	trap : "trap",
	addCopper : 'addCopper',
	addTime : 'addTime',
	playerMarker : 'playerMarker',
	refreshPlayerVisibility : 'refreshPlayerVisibility',
	refreshMeshes : 'refreshMeshes',
	book : 'book',
	transmog : 'transmog',
	restorePlayerTeam : 'restorePlayerTeam',	// Shortcut to fully regen and wipe arousal from the player team
	setPlayerTeam : 'setPlayerTeam',
	removePlayer : 'removePlayer',
	sortRpTargets : 'sortRpTargets',
	sliceRpTargets : 'sliceRpTargets',
	resetRpVar : 'resetRpVar',					// Tries to reset RP vars of the current roleplay
	setRpVar : 'setRpVar',						// 
	addFollower : 'addFollower',
	remFollower : 'remFollower',
	setRain : 'setRain',
};

GameAction.TypeDescs = {
	[GameAction.types.encounters] : "{encounter:(arr)encounters, replace:(bool)replaceEncounter=false} - Picks a random encounter to start. If replace is true, it replaces the encounter. Otherwise it merges it.",
	[GameAction.types.resetRoomEncounter] : "{dungeon:(str)dungeon=CURRENT_DUNGEON, room:(int)index=CURRENT_ROOM} - Resets a room's encounter. A new one will be generated the next time you visit.",
	[GameAction.types.wrappers] : "{wrappers:(arr)wrappers} - Triggers all viable wrappers",
	[GameAction.types.loot] : "{loot:(arr)assets, min:(int)min_assets=0, max:(int)max_assets=-1}, Live: {genLoot:[asset, asset, asset...]} - Loot will automatically trigger \"open\" and \"open_idle\" animations when used on a dungeon room asset. When first opened, it gets converted to an array.",
	[GameAction.types.autoLoot] : "{val:(float)modifier, cosmetic:(bool)allowCosmetic} - This is replaced with \"loot\" when opened, and auto generated. Val can be used to determine the value of the chest. Lower granting fewer items. allowCosmetic also allows cosmetic items to be rolled in.",
	[GameAction.types.door] : "{index:(int)room_index, badge:(int)badge_type} - Door will automatically trigger \"open\" animation when successfully used. badge can be a value between 0 and 2 and sets the icon above the door. 0 = normal badge, 1 = hide badge, 2 = normal but with direction instead of exit",
	[GameAction.types.exit] : "{dungeon:(str)dungeon_label, index:(int)landing_room=0, time:(int)travel_time_seconds=60}",
	[GameAction.types.proceduralDungeon] : "{label:(str)label, templates:(arr)viable_templates}",
	[GameAction.types.anim] : '{anim:(str)animation, targ:(str)name=parentMesh} - If targs is unset and the GameAction has a mesh parent, that is used as a target',
	[GameAction.types.lever] : '{id:(str)id} - Does the same as dungeonVar except it toggles the var (id) true/false and handles "open", "open_idle", "close" animations',
	[GameAction.types.quest] : '{quest:(str/Quest)q} - Starts a quest',
	[GameAction.types.questObjective] : '{quest:(str)label, objective:(str)label, type:(str "add"/"set")="add", amount:(int)amount=1, killParentAsset:(bool)kill=false} - Adds or subtracts from an objective. killParentAsset will kill a dungeon room asset when the game action is used on one.',
	[GameAction.types.addInventory] : '{"player":(label)=evt_player, "asset":(str)label, "amount":(int)amount=1, "alert":(bool)notify=false, "equip":""} - Adds or removes inventory from a player. Equip can be empty (no equip) or "yes" to equip it.',
	[GameAction.types.toggleCombat] : '{on:(bool)combat, enc:(bool)make_encounter_hostile=true} - Turns combat on or off. If enc is not exactly false, it also makes the encounter hostile.',
	[GameAction.types.roleplay] : '{rp:(str/obj)roleplay} - A label or roleplay object',
	[GameAction.types.finishQuest] : '{quest:(str/arr)ids, force:(bool)force=false} - Allows handing in of one or many completed quests here. If force is true, it finishes the quest regardless of progress.',
	[GameAction.types.tooltip] : '{text:(str)text} 3d asset only - Draws a tooltip when hovered over. HTML is not allowed, but you can use \n for rowbreak',
	[GameAction.types.shop] : '{shop:(str)shop, player:(str)player_offering_shop} - Passive. Shop is tied to a player inside the shop object. Shop can NOT be an object due to multiplayer constraints.',
	[GameAction.types.openShop] : '{shop:(str)shop} - Tries to open a shop on the player that triggered the event',
	[GameAction.types.gym] : '{player:(str)player_offering, tags:(arr)tags} - Passive. Player is the player that should have the gym icon attached to them. Tags can be used to determine what skills should be trained there.',
	[GameAction.types.playerAction] : '{player:(str)label, action:(str)label} - Forces a player to use an action on event target. If player is unset, it\'s the supplied triggering player that becomes the caster',
	[GameAction.types.repairShop] : '{player:(str)label} - Marks a player as offering repairs & dyes',
	[GameAction.types.altar] : '{player:(str)label} - Marks a player as offering kink resets',
	[GameAction.types.bank] : '{player:(str)label} - Marks a player as offering bank services',
	[GameAction.types.text] : '{text:(str/obj)text} - Triggers a Text',
	[GameAction.types.hitfx] : '{hitfx:(obj/str/arr)hitfx, caster_conds:(arr)caster_conditions, target_conds:(arr)target_conds, max_triggers:(int)=all} - Triggers a hitfx',
	[GameAction.types.addPlayer] : '{player:(obj/str)monster, turn:(int)turn_offset=-1}',
	[GameAction.types.addPlayerTemplate] : '{player:(obj/str)template, nextTurn:(bool)=false} - If nextTurn is true, it adds the player on next turn instead of before the current player',
	[GameAction.types.rentRoom] : '{cost:(int)copper, text:(str)rp, success_text:(str)successfully_rented_text, player:(str)label} - Draws the rent a room icon on a target.',
	[GameAction.types.execRentRoom] : '{cost:(int)copper, success_text:(str)successfully_rented_text, renter:(str)renter_merchant_label} - Execs a room rental in this dungeon. This is generated automatically by above.',
	[GameAction.types.sleep] : '{actions:(arr)game_actions} -  Used on a mesh to attach a sleep picker to it.',
	[GameAction.types.resetRoleplay] : '{roleplay:(str)label} - Resets a roleplay. If no roleplay is provided and the gameEvent can parent up to a roleplay, it resets that one',
	[GameAction.types.setDungeon] : '{dungeon:(str)dungeon, room:(int)index} - Sets the dungeon. If you leave out dungeon, it targets your active dungeon',
	[GameAction.types.addFaction] : '{faction:(str)label, amount:(int)amount} - Adds or removes reputation',
	[GameAction.types.trade] : '{asset:(str)label, amount:(int)amount=1, from:(str)label/id, to:(str)label/id} - ID is checked first, then label. If either of from/to is unset, they use the event player.',
	[GameAction.types.learnAction] : '{conditions:(arr)conditions, action:(str)actionLabel} - This is run on all players on team 0 with sender being the GameAction player and target being each player. Use conditions to filter. Use targetIsSender condition for only the person who triggered it. Marks an action on a player as learned. If they have a free spell slot, it immediately activates it.',
	[GameAction.types.addCopper] : '{player:(label)=evt_player, amount:(int)copper} - Subtracts money from target.',
	[GameAction.types.addTime] : '{seconds:(int)seconds, force:(bool)force} - Force is only needed if the game story has freeze_time set',
	[GameAction.types.dungeonVar] : '{id:(str)id, val:(str)formula, targets:[], operation:(str)ADD/MUL/SET, dungeon:(str)label=CURRENT_DUNGEON} - Sets a variable in the currently active dungeon. Formulas starting with @@ will be treated as a string (and @@ removed). Targets can be included by using Calculator target notation. Not specifying a target sets the value directly. Operation lets you modify the value rather than overwriting it, ADD adds, MUL multiplies. Use negative value for subtract, use fractions for division.',
	//[GameAction.types.removeFromDungeonVar] : '{ids:(arr)ids, dungeon:(str)label, players:(arr)calculatorTargetConsts} - Uses the Calculator.Targets targets to remove players from one or more dvars',
	[GameAction.types.playerMarker] : '{x:(int)x_offset,y:(int)y_offset,z:(int)z_offset,scale:(float)scale} - Spawns a new player marker for player 0 in the encounter. Only usable when tied to an encounter which was started through a world interaction such as a mimic.',
	[GameAction.types.refreshPlayerVisibility] : 'void - Forces the game to refresh visibility of players.',
	[GameAction.types.refreshMeshes] : 'void - Calls the onRefresh method on all meshes in the active room',
	[GameAction.types.book] : '{label:(str)label} - Opens the book dialog',
	[GameAction.types.transmog] : '{player:(str)player_offering} - Lets a player offer transmogging',
	[GameAction.types.trap] : '{action:(str)action_label, game_actions:(arr)labels, chance:(float)=1.0, stat:(int)stat_offs, name:(str)trapName=trap} - If max targets -1 it can hit everyone. Always tries to trigger on the player that set off the trap. When a trap is triggered, a custom trap player is used with the average player level, stat being added or subtracted from the type used in the action (phys, corr, etc), and name specified in the action. Game actions are always triggered when the trap is triggered regardless of if it hit or not. They are ran with the sender and target being the person who triggered the trap.',
	[GameAction.types.removePlayer] : '{player:(str)playerLabel} - Removes a player from the game.',
	[GameAction.types.restorePlayerTeam] : '{team:(int)team=Player.TEAM_PLAYER} - Shortcut that fully restores HP and clears arousal from Player.TEAM_PLAYERS.',
	[GameAction.types.setPlayerTeam] : '{team=Player.TEAM_PLAYER} - Changes game action target team',
	[GameAction.types.sortRpTargets] : '{mathvars:[{var:(str)label, desc:(bool)desc=false}...]} - Sorts rpTargets based on mathvars. Only mathvars for ta_ are set',
	[GameAction.types.sliceRpTargets] : '{start:(int)=0, nrPlayers:(int)=-1} - Converts rpTargets to a subset of targets',
	[GameAction.types.resetRpVar] : '{var:(str)var=ALL} - Tries to reset a var in the active RP. If vars is empty, it resets all',
	[GameAction.types.setRpVar] : '{id:(str)varID, val:(str)formula, targets:[], operation:(str)ADD/MUL/SET} - Sets an RP var. Formulas starting with @@ will be treated as strings (and @@ removed). Targets can be included by using Calculator target notation. Not specifying a target sets the value directly. Operation lets you modify the value rather than overwriting it, ADD adds, MUL multiplies. Use negative value for subtract, use fractions for division.',
	[GameAction.types.addFollower] : '{player:(str)playerLabel} - Immediately adds a follower to your party by label.',
	[GameAction.types.remFollower] : '{player:(str)playerLabel} - Immediately removes a follower from your party by label.',
	[GameAction.types.setRain] : '{amount:(float)rain} - Sets rain between 0 (off) and 1 (pouring).',
	//[GameAction.types.removeFromRpVar] : '{ids:(arr)ids, players:(arr)calculatorTargetConsts} - Uses the Calculator.Targets targets to remove players from one or more rpvars',
	
};

// returns type : {[fieldName]:constructor}
GameAction.TypeRelations = function(){
	return {
		[GameAction.types.encounters] : {encounter:Encounter},
		[GameAction.types.resetRoomEncounter] : {},
		[GameAction.types.wrappers] : {wrappers:Wrapper},
		[GameAction.types.loot] : {loot:Asset},
		[GameAction.types.exit] : {dungeon:Dungeon},
		[GameAction.types.quest] : {quest:Quest},
		[GameAction.types.questObjective] : {quest:Quest, objective:QuestObjective},
		[GameAction.types.addInventory] : {player:Player, asset:Asset},
		[GameAction.types.roleplay] : {rp:Roleplay},
		[GameAction.types.finishQuest] : {quest:Quest},
		[GameAction.types.tooltip] : {text:Text},
		[GameAction.types.shop] : {shop:Shop, player:Player},
		[GameAction.types.openShop] : {shop:Shop},
		[GameAction.types.gym] : {player:Player},
		[GameAction.types.playerAction] : {player:Player, action:Action},
		[GameAction.types.repairShop] : {player:Player},
		[GameAction.types.altar] : {player:Player},
		[GameAction.types.bank] : {player:Player},
		[GameAction.types.text] : {text:Text},
		[GameAction.types.hitfx] : {hitfx:HitFX, caster_conds:Condition, target_conds:Condition},
		[GameAction.types.addPlayer] : {player:Player},
		[GameAction.types.addPlayerTemplate] : {player:PlayerTemplate},
		[GameAction.types.rentRoom] :  {player:Player},
		[GameAction.types.execRentRoom] : {renter:Player},
		[GameAction.types.sleep] : {actions:GameAction},
		[GameAction.types.resetRoleplay] : {roleplay:Roleplay},
		[GameAction.types.setDungeon] : {dungeon:Dungeon},
		[GameAction.types.addFaction] : {faction:Faction},
		[GameAction.types.trade] : {asset:Asset, from:Player, to:Player},
		[GameAction.types.learnAction] : {conditions:Condition, action:Action},
		[GameAction.types.addCopper] : {player:Player},
		[GameAction.types.book] : {label:Book},
		[GameAction.types.transmog] : {player:Player},
		[GameAction.types.trap] : {action:Action, game_actions:GameAction},
		[GameAction.types.removePlayer] : {player:Player},
		[GameAction.types.setPlayerTeam] :  {playerConds:Condition},
	};
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
	[GameAction.types.altar] : true,
	[GameAction.types.bank] : true,
	[GameAction.types.rentRoom] : true,
	[GameAction.types.gym] : true,
	[GameAction.types.transmog] : true,
};

// Action types that should run clientside
GameAction.typesAllowedClientside = {
	[GameAction.types.loot] : true,
	[GameAction.types.sleep] : true,
}; 


