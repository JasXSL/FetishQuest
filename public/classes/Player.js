import Generic from './helpers/Generic.js';
import Action from "./Action.js";
import Asset from "./Asset.js";
import stdTag from "../libraries/stdTag.js";

import { Wrapper, Effect } from './EffectSys.js';
import Bot from './Bot.js';
import PlayerClass from './PlayerClass.js';
import Calculator from './Calculator.js';
import GameEvent from './GameEvent.js';
import Dungeon from './Dungeon.js';

const BASE_HP = 60;
const BASE_MP = 10;
const BASE_AP = 10;
const BASE_AROUSAL = 10;

export default class Player extends Generic{

	constructor(data){

		super(data);

		this.label = '';					// Unique editor label
		this.netgame_owner_name = '';		// This is a custom thing that should only be relied on when adding a new player
		this.netgame_owner = '';			// ID corresponding to one from game.net.players
		this.name = "Adventurer";			// Name
		this.species = "";
		this.description = "";
		this.icon = "";				// URL
		this.actions = [];			// Action objects, use getActions since assets can also add actions
		this.assets = [];			// Asset objects, use getAssets
		this.inventory = [];		// NPC only. This is an array of numbers specifying which items above are equipped when entering the game.

		this.tags = [];				// Player tags, these are automatically prefixed with PL_, use getTags
		this.wrappers = [];			// Wrappers, use getWrappers
		this.auto_wrappers = [];	// Automatic wrappers such as encumbered
		this.hp = 60;				// 
		this.ap = 0;				// Action points, stacking up to 10 max, 3 awarded each turn
		this.team = 0;				// 0 = player
		this.size = 5;				// 0-10
		this.level = 1;				// 
		this.experience = 0;
		this.mp = 10;				// Secondary stat used for spells. Mana points.
		this.arousal = 0;
		this.leveled = false;		// Level is an offset of the player average level
		this.powered = false;		// Boost stats based on nr of players in the player team

		// Primary stats
		this.stamina = 0;			// Adds 2 HP per point
		this.agility = 0;				// Adds 1 AP per point
		this.intellect = 0;			// Adds 1 MP per point

		this.svPhysical = 0;
		this.svElemental = 0;
		this.svHoly = 0;
		this.svCorruption = 0;

		this.bonPhysical = 0;
		this.bonElemental = 0;
		this.bonHoly = 0;
		this.bonCorruption = 0;
		this.bot = null;
		this.used_punish = false;				// We have punished a target since the last battle ended or we left the room


		// Personality types
		this.sadistic = 0.5;					// Normal vs Sadistic
		this.dominant = 0.8;					// Dominant vs submissive
		this.hetero = 0.5;						// 0 = gay, 0.5 = bi, 1 = straight
		this.intelligence = 0.6;				// 0 = No intelligence, .1 = Mollusk, .2 = Animal, .4 = Child, .6 = Average human, .9 = Mastermind, 1 = Godlike
												/* Notes on intelligence:
													<= 0 = It has no intelligence and always attacks a random player, even friendly players
													< 0.2 = No longer attacks friends, but doesn't use the aggro system.
													>= 0.2 = Now able to use the aggro system, but only short term, wiping aggro at the end of their turn
													>= 0.4 = Can speak, now affected by the full aggro system
													>= 0.6 + Judging = Able to set traps, triggering at the start of a battle
													>= 0.8 = Now too smart for aggro, always picks targets carefully
												*/
		this.class = null;
		
		this._stun_diminishing_returns = 0;		// Rounds you can't be stunned

		this._turns = 0;						// Total turns played in combat
		this._turn_ap_spent = 0;				// AP spent on actions this turn
		this._threat = {};						// playerID : threatAmount

		// These are incoming damage
		this._damaging_since_last = {};			// playerID : {(str)dmageType:(int)nrDamagingAttacks} - nr damaging actions received since last turn. Not the actual damage.
		this._damage_since_last = {};			// playerID : {(str)damageType:(int)damage} - Total damage points player received since last turn.
		// Same as above, but DONE by this player
		this._d_damaging_since_last = {};			// playerID : {(str)dmageType:(int)nrDamagingAttacks} - nr damaging actions received since last turn. Not the actual damage.
		this._d_damage_since_last = {};			// playerID : {(str)damageType:(int)damage} - Total damage points player received since last turn.
		
		
		this._turn_tags = [];					// {tag:(str)tag, s:(Player)sender}... These are wiped whenever an action text is used
		
		this.color = '';						// Assigned by the game

		// Prevents recursion for encumbrance
		this._ignore_effects = null;			// Internal helper that prevents recursion
		this._difficulty = 1;					// Added from monster template, used in determining exp rewards
		this.load(data);
		
	}

	load(data){

		this.g_autoload(data);


		this.addDefaultActions();
		let w = this.getWrappers();
		w.map(wrapper => {
			wrapper.bindEvents();
		});


		// Apply constraints
		this.addHP(0);
		this.addMP(0);
		this.addAP(0);
		
	}

	// Automatically invoked after g_autoload
	rebase(){

		this.actions = Action.loadThese(this.actions, this);
		this.assets = Asset.loadThese(this.assets, this);
		this.wrappers = Wrapper.loadThese(this.wrappers, this);

		if( window.game )
			this.class = PlayerClass.loadThis(this.class, this);
		
		if( this.class === null )
			this.class = new PlayerClass();
		
		if( window.game && game.is_host )
			this.updateAutoWrappers();
		else
			this.auto_wrappers = Wrapper.loadThese(this.auto_wrappers, this);
	}

	// Data that should be saved to drive
	save( full ){
		this.updateAutoWrappers();
		const out = {
			name : this.name,
			icon : this.icon,
			actions : this.actions.map(el => el.save(full)),
			tags : this.tags,
			team : this.team,
			species : this.species,
			description : this.description,
			size : this.size,
			level : this.level,
			class : this.class.save(full),
			stamina : this.stamina,
			agility : this.agility,
			intellect : this.intellect,
			svPhysical : this.svPhysical,
			svElemental : this.svElemental,
			svHoly : this.svHoly,
			svCorruption : this.svCorruption,
			bonPhysical : this.bonPhysical,
			bonElemental : this.bonElemental,
			bonHoly : this.bonHoly,
			bonCorruption : this.bonCorruption,
			used_punish : this.used_punish,
			sadistic : this.sadistic,					// Normal vs Sadistic
			dominant : this.dominant,					// Dominant vs submissive
			hetero : this.hetero,						// 0 = gay, 0.5 = bi, 1 = straight
			intelligence : this.intelligence,
			powered : this.powered,
		};

		if( full ){
			out.leveled = this.leveled;
			out.label = this.label;
			out.inventory = this.inventory;
			if( full !== "mod" ){
				out._stun_diminishing_returns = this._stun_diminishing_returns;
				out.experience = this.experience;
				out._difficulty = this._difficulty;
				out._threat = this._threat;
				out._turn_ap_spent = this._turn_ap_spent;
				out._damaging_since_last = this._damaging_since_last;
				out._damage_since_last = this._damage_since_last;
				out._d_damaging_since_last = this._d_damaging_since_last;
				out._d_damage_since_last = this._d_damage_since_last;
				out._turns = this._turns;
			}

		}
		// Non player controlled inventories aren't sent
		if( full || !this.isNPC() ){
			out.assets = this.assets.map(el => el.save(full));
		}


		// Everything except mod
		if( full !== "mod" ){
			out.id = this.id;
			out.ap = this.ap;
			out.hp = this.hp;
			out.mp = this.mp;
			out.wrappers = this.wrappers.map(el => el.save(full));
			out.netgame_owner = this.netgame_owner;
			out.netgame_owner_name = this.netgame_owner_name;
			out.color = this.color;
			out.arousal = this.arousal;
		}
		else
			this.g_sanitizeDefaults(out);

		return out;
	}






	/* Metadata */

	// For these functions, type is an Action.Types value, if undefined, it counts ALL types
	// Returns how many damaging actions a player has used since this one's last turn
	damagingSinceLastByPlayer( player, type ){
		if( player && player.constructor === Player )
			player = player.id;
		if( !this._damaging_since_last[player] )
			return 0;
		let out = 0;
		for( let i in this._damaging_since_last[player] ){
			if( i === type || type === undefined )
				out += this._damaging_since_last[player][i];
		}
		return out;
	}
	damageSinceLastByPlayer( player, type ){
		if( player && player.constructor === Player )
			player = player.id;
		if( !this._damage_since_last[player] )
			return 0;
		let out = 0;
		for( let i in this._damage_since_last[player] )
			if( i === undefined || i === type )
			out += this._damage_since_last[player][i];
		return out;
	}
	damagingDoneSinceLastToPlayer( player, type ){
		if( player && player.constructor === Player )
			player = player.id;
		if( !this._d_damaging_since_last[player] )
			return 0;
		let out = 0;
		for( let i in this._d_damaging_since_last[player] ){
			if( i === type || type === undefined )
				out += this._d_damaging_since_last[player][i];
		}
		return out;
	}
	damageDoneSinceLastToPlayer( player, type ){
		if( player && player.constructor === Player )
			player = player.id;
		if( !this._d_damage_since_last[player] )
			return 0;
		let out = 0;
		for( let i in this._d_damage_since_last[player] )
			if( i === undefined || i === type )
			out += this._d_damage_since_last[player][i];
		return out;
	}
	// Calculates a total number for any of the above, allowing you to filter by type 
	// Use the object property as input, and it returns the sum
	datTotal( input, type ){
		let out = 0;
		for( let i in input ){
			for( let t in input[i] ){
				if( t === type || type === undefined )
					out += input[i][t];
			}
		}
		return out;
	}

	

	// When run from an effect, the effect needs to be present to prevent recursion 
	appendMathVars(prefix, vars, event){

		let isRoot = this._ignore_effects === null;
		if( isRoot )
			this._ignore_effects = [];

		if( event && event.effect )
			this._ignore_effects.push(event.effect);
		// Theres a recursion here when math is used in SV/Bon and to get SV/Bon you need math
		vars[prefix+'SvPhysical'] = this.getSV(Action.Types.physical);
		vars[prefix+'SvElemental'] = this.getSV(Action.Types.elemental);
		vars[prefix+'SvHoly'] = this.getSV(Action.Types.holy);
		vars[prefix+'SvCorruption'] = this.getSV(Action.Types.corruption);
		
		vars[prefix+'BonPhysical'] = this.getBon(Action.Types.physical);
		vars[prefix+'BonElemental'] = this.getBon(Action.Types.elemental);
		vars[prefix+'BonHoly'] = this.getBon(Action.Types.holy);
		vars[prefix+'BonCorruption'] = this.getBon(Action.Types.corruption);
		vars[prefix+'Lv'] = this.level;
		vars[prefix+'HP'] = this.hp;
		vars[prefix+'AP'] = this.ap;
		vars[prefix+'Team'] = this.team;
		vars[prefix+'Size'] = this.size;
		vars[prefix+'MaxHP'] = this.getMaxHP();
		vars[prefix+'MaxAP'] = this.getMaxAP();
		vars[prefix+'apSpentThisTurn'] = this._turn_ap_spent;

		vars[prefix+'ButtSize'] = this.getGenitalSizeValue(stdTag.butt);
		vars[prefix+'BreastSize'] = this.getGenitalSizeValue(stdTag.breasts);
		vars[prefix+'PenisSize'] = this.getGenitalSizeValue(stdTag.penis);

		let tags = this.getTags();
		for( let tag of tags )
			vars[prefix+'Tag_'+tag] = 1;

		// Get a total value
		vars[prefix+'damagingReceivedSinceLast'] = this.datTotal( this._damaging_since_last );
		vars[prefix+'damageReceivedSinceLast'] = this.datTotal( this._damage_since_last );
		vars[prefix+'damagingDoneSinceLast'] = this.datTotal( this._d_damaging_since_last );
		vars[prefix+'damageDoneSinceLast'] = this.datTotal( this._d_damage_since_last );
		for( let i in Action.Types ){
			let type = Action.Types[i];
			vars[prefix+'damagingReceivedSinceLast'+type] = this.datTotal( this._damage_since_last, type );
			vars[prefix+'damageReceivedSinceLast'+type] = this.datTotal( this._damage_since_last, type );
			vars[prefix+'damagingDoneSinceLast'+type] = this.datTotal( this._d_damaging_since_last, type );
			vars[prefix+'damageDoneSinceLast'+type] = this.datTotal( this._d_damage_since_last, type );
		}

		// We're the recipient, if a sender exists we can add how much damage the sender has done to us
		if( event && this === event.target && event.sender ){
			vars['se_TaDamagingReceivedSinceLast'] = this.damagingSinceLastByPlayer(event.sender);
			vars['se_TaDamageReceivedSinceLast'] = this.damageSinceLastByPlayer(event.sender);
		}

		for( let i in Asset.Slots ){
			let slot = Asset.Slots[i];
			vars[prefix+slot] = this.getEquippedAssetsBySlots(slot).length ? 1 : 0;
		}

		let wrappers = this.getWrappers();
		for(let wrapper of wrappers){
			if( wrapper.label )
				vars[prefix+'Wrapper_'+wrapper.label] = wrapper.stacks;
		}
		

		if( isRoot )
			this._ignore_effects = null;

		return vars;
	}

	getColoredName(){
		return '|c'+this.color+'|'+this.name+'|/c|';
	}

	// Statuses
	isDead(){
		return this.hp <= 0;
	}

	isNPC(){
		return !this.netgame_owner;
	}

	// Can't accept their turn
	isIncapacitated(){
		let stun = this.getActiveEffectsByType(Effect.Types.stun);
		return stun.length > 0;
	}

	// Returns taunting players unless there's a grappling player, in which case that's returned instead
	getTauntedOrGrappledBy(){
		
		let players = this.getGrappledBy();
		if( players.length )
			return players;
		return this.getTauntedBy();

	}

	getGrappledBy(){

		let grapples = this.getActiveEffectsByType(Effect.Types.grapple);
		let out = [];
		for( let effect of grapples ){
			let sender = effect.parent.getCaster();
			if( sender && out.indexOf(sender) === -1 )
				out.push(sender);
		}
		return out;

	}

	getTauntedBy(){

		let tauntEffects = this.getActiveEffectsByType(Effect.Types.taunt);
		if( !tauntEffects.length )
			return game.players;

		let out = [];
		for( let effect of tauntEffects ){
			let sender = effect.parent.getCaster();
			if( sender && out.indexOf(sender) === -1 )
				out.push(sender);
		}
		return out;

	}

	isBeast(){
		return this.hasTag(stdTag.plBeast);
	}



	// RP Tags

	// Searches tags for pl_<prefix>_huge/big/small and returns a synonym
	getSizeTag( prefix ){

		prefix = prefix.substr(3);
		let texts = [""];
		if( this.hasTag('pl_big_'+prefix) )
			texts = ["big", "large", "sizable"];
		else if( this.hasTag('pl_huge_'+prefix) )
			texts = ["huge", "enormous", "gigantic", "massive"];
		else if( this.hasTag('pl_small_'+prefix) )
			texts = ['small'];

		return texts[Math.floor(Math.random()*texts.length)];

	}
	getBreastSizeTag(){
		return this.getSizeTag(stdTag.breasts);
	}
	getPenisSizeTag(){
		return this.getSizeTag(stdTag.penis);
	}
	getButtSizeTag(){
		return this.getSizeTag(stdTag.butt);
	}

	// Returns a value where 0 = none, 1 = small, 2 = average, 3 = large, 4 = huge
	// Prefix should be either stdTag.breasts, stdTag.penis or stdTag.butt
	getGenitalSizeValue( prefix ){

		prefix = prefix.split('_');
		prefix.shift();
		prefix = prefix.join('_');

		if( this.hasTag('pl_huge_'+prefix) )
			return 4;
		if( this.hasTag('pl_big_'+prefix) )
			return 3;
		if( this.hasTag('pl_small_'+prefix) )
			return 1;
		if( this.hasTag('pl_'+prefix) )
			return 2;
		return 0;
	}

	// Overrides the generic definition for this
	getTags(){

		let out = {};
		if( this.hp <= 0 )
			out[stdTag.dead] = true;

		for( let tag of this.tags ){
			if( !tag.startsWith('pl_') )
				tag = 'pl_'+tag;
			out[tag.toLowerCase()] = true;
		}
		let assets = this.getAssetsEquipped();
		for( let asset of assets )
			asset.getTags().map(t => out[t.toLowerCase()] = true);
		let fx = this.getWrappers();
		for( let f of fx )
			f.getTags().map(t => out[t.toLowerCase()] = true);

		this._turn_tags.map(t => out[t.tag.toLowerCase()] = true);

		if( this.species )
			out['p_'+this.species.toLowerCase()] = true;

		if( window.game && game.dungeon instanceof Dungeon )
			game.dungeon.getTags().map(t => out[t.toLowerCase()] = true);

		return Object.keys(out);

	}

	// overrides generic class
	hasTagBy( tags, sender ){

		if( !Array.isArray(tags) )
			tags = [tags];

		// Start by checking turn tags
		for( let tt of this._turn_tags ){
			if( sender.id === tt.s.id && ~tags.indexOf(tt.tag) )
				return true;
		}

		// Next check the wrappers
		for( let wrapper of this.wrappers ){
			if( wrapper.caster === sender.id && wrapper.hasTag(tags) )
				return true;
		}
		
		return false;

	}

	getPronoun(pronoun){
		let out = 
			(this.hasTag('pl_penis') ? 1 : 0) |
			(this.hasTag('pl_vagina') ? 2 : 0) |
			(this.hasTag('pl_breasts') ? 4 : 0)
		;
		let pronouns = ['it', 'it', 'its'];
		if( out && out < 3 )
			pronouns = ['he', 'him', 'his'];
		else if( out === 6 )
			pronouns = ['she', 'her', 'her'];
		else if( out )
			pronouns = ['shi', 'hir', 'hir'];
		
		if( pronoun === 'he' )
			return pronouns[0];
		if( pronoun === 'him' )
			return pronouns[1];
		return pronouns[2];

	}

	// Sets tags and strips pl_ prefix
	// Chainable
	setTags( tags ){
		this.tags = [];
		for( let tag of tags ){
			tag = tag.split('_');
			if( tag[0] === 'pl' )
				tag.shift();
			this.tags.push(tag.join('_'));
		}
		return this;
	}


	

	


	/* Events */
	// happens to NPCs the first time they're placed in world from an encounter
	onPlacedInWorld(){

		for( let index of this.inventory ){
			if( this.assets[index] && this.assets[index].equippable() )
				this.equipAsset(this.assets[index]);
		}
		this.inventory = [];

		this.netgame_owner = '';

		if( this.leveled ){
			this.level += game.getHighestLevelPlayer();
			this.leveled = false;
		}
	}
	onTurnEnd(){
		for(let wrapper of this.wrappers)
			wrapper.onTurnEnd();
		for(let action of this.actions)
			action.onTurnEnd();
		if( this._stun_diminishing_returns > 0 )
			--this._stun_diminishing_returns;
		this._damaging_since_last = {};
		this._damage_since_last = {};
		++this._turns;
	}
	onTurnStart(){

		this._d_damaging_since_last = {};
		this._d_damage_since_last = {};

		// Wipe turnTags on start
		this._turn_tags = [];

		if( this.bot )
			this.bot.onTurnStart();

		

		for(let wrapper of this.wrappers)
			wrapper.onTurnStart();
		for(let action of this.actions)
			action.onTurnStart();
		
		if( this.arousal > 0 && this._turns%2 ){
			let sub = -this.getMaxArousal()/10;	// You lose 10% each turn
			let rem = Math.floor(sub);
			if( Math.random() < sub-rem )
				--rem;
			this.addArousal(rem);
		}

		this._turn_ap_spent = 0;
		let ap = 3+Math.floor((this.getMaxAP()-10)/10);
		// Add a chance to gain an extra AP based on 10% per point of AP above 10
		let agility = this.getMaxAP()%10*10;
		if(Math.random()<=(agility%100)/100)
			++ap;
		this.addAP(ap);
		
		// Do the same for MP
		let mp = 1+Math.floor((this.getMaxMP()-10)/10);
		let intelligence = this.getMaxMP()%10*10;
		if(Math.random()<=(intelligence%100)/100)
			++mp;
		this.addMP(mp);
		
	}
	onBattleStart(){
		this._turn_tags = [];
		this.ap = 0;
		this._threat = {};
		let actions = this.getActions();
		for(let action of actions)
			action.onBattleStart();
		this.arousal = 0;
	}
	onBattleEnd(){
		this.ap = 0;
		let actions = this.getActions();
		for(let action of actions)
			action.onBattleEnd();
		for( let wrapper of this.wrappers )
			wrapper.unbindEvents();
		this.wrappers = [];
		let wrappers = this.getWrappers();
		for(let wrapper of wrappers)
			wrapper.onBattleEnd();
		this._stun_diminishing_returns = 0;
		this._turns = 0;
		this.used_punish = false;
	}
	// Item broken, repaired, equipped, or removed
	onItemChange(){
		this.addHP(0);
		this.addAP(0);
	}

	onCellChange(){
		this.used_punish = true;
	}

	onDamagingAttackReceived( sender, type ){
		if(!this._damaging_since_last[sender.id])
			this._damaging_since_last[sender.id] = {};
		if(!this._damaging_since_last[sender.id][type])
			this._damaging_since_last[sender.id][type] = 0;
		
		++this._damaging_since_last[sender.id][type];
	}
	onDamagingAttackDone(target, type){
		if(!this._d_damaging_since_last[target.id])
			this._d_damaging_since_last[target.id] = {};
		if(!this._d_damaging_since_last[target.id][type])
			this._d_damaging_since_last[target.id][type] = 0;
		
		++this._d_damaging_since_last[target.id][type];
	}
	onDamageTaken( sender, type, amount = 0 ){
		if( isNaN(amount) )
			return;
		if(!this._damage_since_last[sender.id])
			this._damage_since_last[sender.id] = {};
		if(!this._damage_since_last[sender.id][type])
			this._damage_since_last[sender.id][type] = 0;
		
		this._damage_since_last[sender.id][type] += amount;
	}
	onDamageDone( target, type, amount = 0 ){
		if( isNaN(amount) )
			return;
		if(!this._d_damage_since_last[target.id])
			this._d_damage_since_last[target.id] = {};
		if(!this._d_damage_since_last[target.id][type])
			this._d_damage_since_last[target.id][type] = 0;
		this._d_damage_since_last[target.id][type] += amount;
	}

	onDeath( attacker, effect ){
		
		// Damage durability
		const assets = this.getAssetsEquipped(false);
		for( let asset of assets )
			asset.damageDurability( attacker, effect, Math.ceil(asset.getMaxDurability()*0.2) );

	}


	/* TurnTags */
	addTurnTags( tags, sender ){
		for( let tag of tags ){
			this.removeTurnTag(tag);
			this._turn_tags.push({tag:tag, s:sender});
		}
	}

	// returns a turnTag object if it exists
	getTurnTag( tag ){
		for( let ttObj of this._turn_tags ){
			if( ttObj.tag === tag )
				return ttObj;
		}
		return false;
	}

	removeTurnTag( tag ){
		for( let i in this._turn_tags ){
			if( this._turn_tags[i].tag === tag ){
				this._turn_tags.splice(i,1);
				return;
			}
		}
	}


	/* Assets */
	addAsset( asset ){
		if( !asset ){
			console.error("Invalid asset add", asset);
			return false;
		}
		this.assets.push(asset.clone(this));
		return true;
	}
	addLibraryAsset( label ){

		let asset = glib.getFull('Asset')[label];
		if( !asset ){
			console.error("Invalid library asset", label);
			return false;
		}
		asset.repair();
		return this.addAsset(asset);

	}
	getAssetById(id){
		for(let asset of this.assets){
			if(asset.id === id)
				return asset;
		}
		return false;
	}
	isAssetEquipped(id){
		let asset = this.getAssetById(id);
		if(!asset)
			return false;
		return asset.equipped;
	}
	getEquippedAssetsBySlots( slots, includeBroken ){
		if( !Array.isArray(slots) )
			slots = [slots];
		let assets = this.getAssetsEquipped(includeBroken);
		let out = [];
		for(let asset of assets){
			for( let slot of slots ){
				if( ~asset.slots.indexOf(slot) ){
					out.push(asset);
					break;
				}
			}
		}
		return out;
	}
	equipAsset( id, byPlayer ){
		let assets = this.getAssetsInventory();
		for(let asset of assets){
			if(asset.id === id){
				if( !asset.equippable() ){
					console.error("Item can not be equipped");
					return false;
				}

				// Special case for action slot
				const isActionAsset = ~asset.slots.indexOf(Asset.Slots.action);
				if( isActionAsset && !this.unequipActionAssetIfFull() )
					return false;
				if( !isActionAsset && !this.unequipAssetsBySlots(asset.slots) )
					return false;

				asset.equipped = true;
				this.onItemChange();
				if( game.battle_active && byPlayer )
					game.ui.addText( this.getColoredName()+" equips "+asset.name+".", undefined, this.id, this.id, 'statMessage important' );
				return true;

				
			}
		}
		return false;
	}
	unequipAsset( id, byPlayer ){

		let assets = this.getAssetsEquipped(true);
		for(let asset of assets){
			if(asset.id === id){
				asset.equipped = false;
				this.onItemChange();
				if( game.battle_active && byPlayer )
					game.ui.addText( this.getColoredName()+" unequips "+asset.name+".", undefined, this.id, this.id, 'statMessage important' );
				return asset;
			}
		}
		return true;

	}
	unequipAssetsBySlots( slots ){
		let equipped = this.getEquippedAssetsBySlots(slots, true);
		if(!equipped.length)
			return true;
		for( let e of equipped ){
			if(!this.unequipAsset(e.id))
				return false;
		}
		return true;
	}

	// Unequips the leftmost one if toolbelt is full
	unequipActionAssetIfFull(){
		let assets = this.getEquippedAssetsBySlots(Asset.Slots.action, true);
		if( assets.length < 3 )
			return true;
		return this.unequipAsset(assets[0].id);
	}

	// Returns equipped assets
	getAssetsEquipped( includeBroken ){
		let out = [];
		for(let asset of this.assets){
			if( asset === undefined )
				console.error("Undefined asset in", this);
			if( asset.equipped && (includeBroken || asset.durability > 0) )
				out.push(asset);
		}
		return out;
	}
	destroyAsset(id){
		for(let i in this.assets){
			let asset = this.assets[i]
			if(asset.id === id){
				this.assets.splice(i, 1);
				return true;
			}
		}
		return false;
	}
	// Transfers an asset to a player. Player is a player object
	transferAsset( id, player ){
		let asset = this.getAssetById(id);
		if( !asset )
			return false;
		this.unequipAsset(id);
		player.addAsset(asset);
		this.destroyAsset(id);
		if( Math.random() < 0.25 && asset.durability )
			player.equipAsset(id);
		return true;
	}

	// Returns a list of assets that have their durability damaged
	getRepairableAssets(){
		return this.assets.filter(asset => {
			return asset.durability < asset.getMaxDurability();
		});
	}

	// Returns non-equipped assets
	getAssetsInventory(){
		let out = [];
		for(let asset of this.assets){
			if(!asset.equipped)
				out.push(asset);
		}
		return out;
	}
	// Overwrite inventory items with defaults from database
	refetchInventory(){

		let lib = glib.getFull('Asset');
		for(let i in this.assets){

			let asset = this.assets[i];
			if( lib[asset.label] ){
				console.log("Overwriting ", asset.label);
				this.assets[i] = lib[asset.label].clone(this);
			}

		}

	}

	// By default it damages all worn items
	damageDurability( sender, effect, amount, slots ){

		let assets = [];
		// Pick a random slot to damage
		// Pick a slot at random
		if( slots === 'RANDOM' ){
			let viableAssets = this.getEquippedAssetsBySlots([Asset.Slots.lowerbody, Asset.Slots.upperbody]);
			if( !viableAssets.length )
				return;
			assets = [viableAssets[Math.floor(Math.random()*viableAssets.length)]];
		}
		else if( !Array.isArray(slots) ){
			slots = [Asset.Slots.lowerbody, Asset.Slots.upperbody];
			assets = this.getEquippedAssetsBySlots(slots);
		}
		
		amount = Math.round(amount);
		for( let asset of assets )
			asset.damageDurability( sender, effect, amount);

	}


	// returns between 0 and 1
	getAssetDurabilityPercentageBySlot( slot ){

		let asset = this.getEquippedAssetsBySlots(slot);
		if( !asset.length )
			return 0;
		asset = asset.shift();
		return asset.durability / asset.getMaxDurability();

	}

	// Encumbrance
	getCarryingCapacity(){
		return 40000+(this.getBon(Action.Types.physical)-this.level)*3000;
	}
	getCarriedWeight(){
		let out = 0;
		for(let asset of this.assets){
			let weight = asset.weight;
			out+= weight;
		}
		return out;
	}
	isEncumbered(){
		return this.getCarriedWeight() > this.getCarryingCapacity();
	}





	/* Leveling & Experience */
	getExperienceUntilNextLevel(){
		return Math.round(5+this.level+Math.pow(this.level,2.5));
	}

	// NPC kills award difficulty * level / 2
	getExperienceWorth(){
		return this._difficulty*this.level/2;
	}

	// adds experience and returns levels gained
	addExperience( points ){
		if( isNaN(points) ){
			console.error("Trying to add NaN experience");
			return false;
		}
		this.experience += Math.floor(points);
		if( this.level === Player.MAX_LEVEL )
			this.experience = 0;
		
		let startLevel = this.level;
		while( this.experience >= this.getExperienceUntilNextLevel() ){
			this.experience -= this.getExperienceUntilNextLevel();
			++this.level;
			if( this.level === Player.MAX_LEVEL ){
				this.experience = 0;
				break;
			}
		}
		game.ui.addText( this.getColoredName()+" gained "+points+" experience!", undefined, this.id, this.id, 'important statMessage' );

		let levelsGained = this.level-startLevel;
		if( levelsGained ){
			game.ui.addText( this.getColoredName()+" gained "+levelsGained+" level"+(levelsGained !== 1 ? 's' :'')+" and is now level "+this.level+"!", undefined, this.id, this.id, 'levelup' );
			this.addActionsForClass();
			game.playFxAudioKitById('levelup', this, this, undefined, true);
		}
		return levelsGained;
	}







	/* RESOURCES */
	addAP( amount ){

		if( isNaN(amount) ){
			console.error("AP amount is NaN", amount);
			return false;
		}
		this.ap += amount;
		this.ap = Math.max(0, Math.min(this.getMaxAP(), this.ap));

	}

	addMP( amount ){

		if( isNaN(amount) ){
			console.error("MP amount is NaN", amount);
			return false;
		}
		this.mp += amount;
		this.mp = Math.max(0, Math.min(this.getMaxMP(), this.mp));

	}

	addThreat( playerID, amount ){
		if( typeof playerID !== "string" ){
			console.error("Can't add non-string player threat, received:", playerID);
			return;
		}
		if( !this._threat.hasOwnProperty(playerID) )
			this._threat[playerID] = 0;
		this._threat[playerID] += amount;		
	}

	// min amount of 1
	getPlayerThreat( player ){
		let thr = 1;
		if( this._threat[player.id] > 0 )
			thr = this._threat[player.id];
		return thr;
	}

	// Returns true if the player died
	addHP( amount, sender, effect ){

		if( isNaN(amount) ){
			console.error("AP amount is NaN", amount);
			return false;
		}
		let wasDead = this.hasTag(stdTag.dead);
		this.hp += amount;
		this.hp = Math.max(0, Math.min(this.getMaxHP(), this.hp));
		if( this.hp === 0 && !wasDead ){
			this.onDeath( sender, effect );
			if( this.hp === 0 )
				return true;
		}

		return false;

	}

	addArousal( amount ){
		if( isNaN(amount) )
			return console.error("Invalid amount of arousal", amount);
		this.arousal += amount;
		this.arousal = Math.min(this.getMaxArousal(), Math.max(0, this.arousal));
	}


	fullRegen(){
		this.hp = this.getMaxHP();
	}

	getMaxHP(){
		return (BASE_HP+this.statPointsToNumber(Player.primaryStats.stamina))*this.getPoweredMultiplier();
	}
	getMaxAP(){
		return (BASE_AP+this.statPointsToNumber(Player.primaryStats.agility))*this.getPoweredMultiplier();

	}
	getMaxMP(){
		return (BASE_MP+this.statPointsToNumber(Player.primaryStats.intellect))*this.getPoweredMultiplier();
	}
	getMaxArousal(){
		return BASE_AROUSAL;
	}


	


	/* STATS */
	getPrimaryStats(){
		return {
			stamina : Math.floor((this.getGenericAmountStatPoints(Effect.Types.staminaModifier)+this.stamina)*this.getGenericAmountStatMultiplier(Effect.Types.staminaModifier)),
			agility : Math.floor((this.getGenericAmountStatPoints(Effect.Types.agilityModifier)+this.agility)*this.getGenericAmountStatMultiplier(Effect.Types.agilityModifier)),
			intellect : Math.floor((this.getGenericAmountStatPoints(Effect.Types.intellectModifier)+this.intellect)*this.getGenericAmountStatMultiplier(Effect.Types.intellectModifier)),
		};
	}

	// Takes a Player.primaryStats value and converts it to a number to add to HP/MP etc for this character
	statPointsToNumber( stat ){

		let stats = this.getPrimaryStats();
		let ps = Player.primaryStats;
		let val = stats[stat];
		if( isNaN(val) )
			return 0;

		if( stat === ps.stamina )
			return val*(this.class.primaryStat === stat ? 6 : 4);		// Stamina
		else if( stat == ps.agility )
			return Math.round(val*(this.class.primaryStat === stat ? 1.5 : 1));		// Stamina
		else if( stat == ps.intellect )
			return Math.round(val*(this.class.primaryStat === stat ? 1.5 : 1));		// Stamina
			

		return 0;
	}

	getPoweredMultiplier(){
		if( this.powered )
			return game.getTeamPlayers().length;
		return 1;
	}

	// Effect in these methods are only included to prevent recursion
	// SV Types
	getSV( type ){

		let grappled = 0;
		if( type === Action.Types.physical )
			grappled = this.getGrappledBy().length ? -4 : 0;

		return Math.floor(
			(
				this.getGenericAmountStatPoints('sv'+type)+
				this.level+
				this.class['sv'+type]+
				(!isNaN(this['sv'+type]) ? this['sv'+type] : 0)+
				grappled
			)*this.getGenericAmountStatMultiplier('sv'+type)
		);
	}

	// SV Bon types
	getBon( type ){

		let grappled = 0;
		if( type === Action.Types.physical )
			grappled = this.getGrappledBy().length ? -4 : 0;

		return Math.floor(
			(
				this.getGenericAmountStatPoints('bon'+type)+
				this.level+
				this.class['bon'+type]+
				(!isNaN(this['bon'+type]) ? this['bon'+type] : 0)+
				grappled
			)*this.getGenericAmountStatMultiplier('bon'+type)
		);

	}

	// Returns the sum of effect.data.amount of an effect with type, and that aren't multiplicative
	getGenericAmountStatPoints( type, player ){

		let w = this.getActiveEffectsByType(type),
			out = 0
		;
		for(let effect of w){
			if( effect.data.multiplier )
				continue;

			if( player && effect.data.casterOnly && player.id !== effect.parent.caster )
				continue;

			let n = Math.round(Calculator.run(
				effect.data.amount, 
				new GameEvent({sender:this, target:this, wrapper:effect.parent, effect:effect})
			));
			out+= n*effect.parent.stacks;
		}
		return out;
		
	}

	getGenericAmountStatMultiplier( type, player ){
		let w = this.getActiveEffectsByType(type),
			out = 1
		;
		for( let effect of w ){
			if( !effect.data.multiplier )
				continue;
			if( player && effect.data.casterOnly && player.id !== effect.parent.caster )
				continue;
			let n = Calculator.run(
				effect.data.amount, 
				new GameEvent({sender:this, target:this, wrapper:effect.parent, effect:effect})
			);
			out *= (n*effect.parent.stacks);
		}
		return out;
	}

	// Returns a multiplier against damage based on slots missing
	getNudityDamageMultiplier(){

		// Beasts are never nude
		if( this.isBeast() )
			return 1;

		let out = 1;
		let slots = [Asset.Slots.lowerbody, Asset.Slots.upperbody];
		for( let slot of slots ){
			let gear = this.getEquippedAssetsBySlots(slot);
			if( !gear.length )
				out += Asset.protVal;
			else
				out += gear[0].getDmgTakenAdd();
		}
		return out;

	}
	
	getCorruptionDamageMultiplier(){
		return 1+(this.arousal/this.getMaxArousal()/2);
	}
	
	




	/* Actions */
	addDefaultActions(){

		// Don't add default actions in the editor
		if( !window.game )
			return;

		let lib = glib.getFull('Action');
		let needed = [
			lib.stdEscape,
			lib.stdArouse,
			lib.stdAttack,
			lib.stdEndTurn,
			lib.stdPunishDom,
			lib.stdPunishSub,
			lib.stdPunishSad,
		];
		for( let n of needed ){

			if(!this.getActionByLabel(n.label))
				this.actions.unshift(n.clone(this));

		}

	}
	addActionFromLibrary( label ){

		let asset = glib.getFull('Action')[label];
		if( !asset ){
			console.error("Invalid library asset", label);
			return false;
		}
		return this.addAction(asset);

	}

	addAction( action, silent = false ){

		if( !action ){
			console.error("Invalid action add", action);
			return false;
		}
		if( this.getActionByLabel(action.label) ){
			console.error("Action already learned");
			return false;
		}
		let ac = action.clone(this);
		this.actions.push(ac);
		if( !ac.hidden && !silent )
			game.ui.addText( this.getColoredName()+" learned "+ac.name+"!", undefined, this.id, this.id, 'actionLearned' );
		return true;
	}


	removeActionById( id ){
		for( let i in this.actions ){
			let action = this.actions[i];
			if( action.id === id ){
				this.actions.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	// Tries to update actions from database, you should not do this if you've modified actions via the console or spell editor
	refetchActions(){

		let lib = glib.getFull('Action');
		for(let i in this.actions){

			let action = this.actions[i];
			if( lib[action.label] ){
				console.log("Rebasing action", action.label, "with", lib[action.label]);
				this.actions[i] = lib[action.label].clone(this);
			}
		}

	}

	getActionByLabel(label){

		let actions = this.getActions();
		for( let action of actions ){

			if(action.label === label)
				return action;

		}
		return false;

	}

	getActions( include_items = true ){
		
		let out = this.actions.slice();
		if( include_items ){

			for( let asset of this.assets ){
				let action = asset.use_action;
				if( asset.isConsumable() && (asset.equipped || !game.battle_active) )
					out.push(action);
			}

		}

		return out;

	}

	getActionById( id ){

		let actions = this.getActions();
		for( let action of actions ){

			if( action.id === id )
				return action;

		}
		return false;

	}

	useActionId( id, targets, netPlayer ){

		let action = this.getActionById(id);
		if( action )
			return action.useOn(targets, false, netPlayer);
		console.error("Action missing", id);
		return false;

	}

	useActionLabel( label, targets ){
		
		let action = this.getActionByLabel(label);
		if( action )
			return action.useOn(targets);
		return false;
		
	}

	// Adds viable high enough level actions for your class
	addActionsForClass(){
		
		let lib = this.class.getAvailableActions(this.level);
		for( let a of lib ){
			if( !this.getActionByLabel(a.label) ){
				this.addAction(a);
			}
		}

	}
	
	updateAutoWrappers(){
		this.auto_wrappers = [];
		if( this.isEncumbered() )
			this.auto_wrappers.push(new Wrapper({
				label : '_encumbered_',
				name : 'Encumbered',
				icon : 'encumbered.svg',
				description : 'You are carrying too much. All hit chance reduced by 50%',
				duration : -1,
				victim : this.id,
				caster : this.id,
				tags : [stdTag.wrEncumbered],
				effects : [
					new Effect({
						type : Effect.Types.globalHitChanceMod,
						data : {amount : -0.5}
					})
				]
			}, this));
	}

	// Activates cooldowns by labels
	activeCooldowns( labels ){
		if( !Array.isArray(labels) )
			labels = [labels];
		for( let label of labels ){
			let action = this.getActionByLabel(label);
			if( action )
				action.setCooldown();
		}
	}

	// Adds action charges by labels
	addActionCharges( labels, charges = 1 ){
		if( !Array.isArray(labels) )
			labels = [labels];
		for( let label of labels ){
			let action = this.getActionByLabel(label);
			if( action )
				action.consumeCharges(-charges);
		}
	}

	// returns an array of charged actions or false if none 
	isCasting(){
		let actions = this.getActions();
		let spells = [];
		for( let action of actions ){
			if( action._cast_time > 0 )
				spells.push(action);
		}
		if( spells.length )
			return spells;
		return false;
	}

	// Returns nr actions interrupted successfully
	interrupt( sender ){
		let actions = this.isCasting();
		if( !actions )
			return 0;
		let out = 0;
		for( let action of actions ){
			if( action.interrupt(sender) )
				++out;
		}
		return out;
	}



	/* Wrappers */
	getWrappers(){


		let out = this.wrappers;
		for( let asset of this.assets ){
			if( asset.equipped && asset.durability > 0 )
				out = out.concat(asset.wrappers);
		}

		return out.concat(this.auto_wrappers);

	}

	getActiveEffectsByType( type ){
		
		let out = [];
		let wrappers = this.getWrappers();
		for(let w of wrappers){
			for( let fx of w.effects ){
				if( fx.type === type && (!this._ignore_effects || this._ignore_effects.indexOf(fx) === -1) )
					out.push(fx);
			}
		}

		return out;

	}

	removeWrapper(wrapper){
		for(let i in this.wrappers){
			if( this.wrappers[i] === wrapper ){
				this.wrappers.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	addWrapper( wrapper ){

		this.wrappers.push(wrapper);
		let isStun = wrapper.getEffects({ type:Effect.Types.stun }).length;
		if( isStun && wrapper.duration > 0 )
			this._stun_diminishing_returns += wrapper._duration*3;
		
		if( isStun )
			this.interrupt( wrapper.getCaster() );

	}

	getActiveWrappersWithTag(...tags){
		return this.getWrappers().filter(wrapper => {
			return wrapper.hasTag(tags);
		});
	}
	


	

	// Bot
	autoPlay( force ){

		if( !this.isNPC() && !force )
			return;
		if( !this.bot ){
			console.log("Attaching a bot");
			this.bot = new Bot(this);
		}
		
		this.bot.play( force );

	}

	usePunishment( players, force ){
		if( !this.isNPC() && !force )
			return;
		if( !this.bot )
			this.bot = new Bot(this);
		this.bot.punish(players);
	}
	

}

Player.MAX_LEVEL = 20;

Player.primaryStats = {
	intellect : 'intellect',
	stamina : 'stamina',
	agility : 'agility'
};

Player.primaryStatsNames = {
	[Player.primaryStats.intellect] : 'magic',
	[Player.primaryStats.stamina] : 'stamina',
	[Player.primaryStats.agility] : 'agility',
};


// Returns a value where <= 0 = always miss, and >= 100 = always hit
Player.getHitChance = function( attacker, victim, action ){

	if( !action.detrimental )
		return 100;
	if( action.hit_chance > 100 )
		return 100;

	let modified = (attacker.getBon(action.type)-victim.getSV(action.type))*5+action.hit_chance;
	// Hit chance above 100 is set as "always hit"
	return modified;

};


// Returns a multiplier of 4% if you go over 100% hit chance
Player.getBonusDamageMultiplier = function( attacker, victim, stat, detrimental ){

	let tot = attacker.getBon(stat);
	if( detrimental )
		tot -= victim.getSV(stat);
	
	if( tot < 0 )
		tot = 0;

	// Add 25% bonus damage per additional player
	let multi = 1.0;
	if( this.team !== 0 )
		multi = 1+(game.getTeamPlayers().length-1)*0.25;

	return (1+tot*0.04)*multi;

};



