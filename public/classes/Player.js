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
import Roleplay from './Roleplay.js';

const BASE_HP = 50;
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
		this.icon = "";						// URL - Has to be HTTPS
		this.icon_upperBody = "";			// == || ==
		this.icon_lowerBody = "";			// == || ==
		this.icon_nude = "";				// == || ==

		this.leader = false;				// Party leader

		this.actions = [];			// Action objects, use getActions since assets can also add actions
		this.assets = [];			// Asset objects, use getAssets
		this.inventory = [];		// NPC only. This is an array of numbers specifying which items above are equipped when entering the game.
		this.tmp_actions = [];		// Actions applied this battle

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
		this.talkative = 0.1;					// How often they output combat chats. Multiplied by nr turns. So after 1 turn, 0.5 = 50% chance, 2 turns = 100% etc. Setting this to one overrides the limit of one chat per turn.
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
		
		this._used_chats = {};					// id : true - Chats used. Not saved or sent to netgame. Only exists in the local session to prevent NPCs from repeating themselves.
		this._last_chat = 0;					// Turn we last spoke on. 

		this._turn_tags = [];					// {tag:(str)tag, s:(Player)sender}... These are wiped whenever an action text is used
		
		this.color = '';						// Assigned by the game

		// Prevents recursion for encumbrance
		this._ignore_effects = null;			// Internal helper that prevents recursion
		this._difficulty = 1;					// Added from monster template, used in determining exp rewards
		this.load(data);
		
	}

	load(data){

		this.g_autoload(data);
		
		let w = this.getWrappers();
		w.map(wrapper => {
			wrapper.bindEvents();
		});

		if( !Array.isArray(window.game) )
			return;

		this.initialize();
		
	}

	// Automatically invoked after g_autoload
	rebase(){

		this.actions = Action.loadThese(this.actions, this);
		this.assets = Asset.loadThese(this.assets, this);
		this.wrappers = Wrapper.loadThese(this.wrappers, this);
		this.tmp_actions = Action.loadThese(this.tmp_actions, this);

		if( window.game )
			this.class = PlayerClass.loadThis(this.class, this);
		
		if( this.class === null )
			this.class = new PlayerClass();

		if( window.game && !game.is_host )
			this.auto_wrappers = Wrapper.loadThese(this.auto_wrappers, this);

	}

	// Data that should be saved to drive
	save( full ){

		if( window.game && game.is_host )
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
			leader : this.leader,
			talkative : this.talkative,
			tmp_actions : Action.saveThese(this.tmp_actions),
			label : this.label,
			icon_lowerBody : this.icon_lowerBody,
			icon_nude : this.icon_nude,
			icon_upperBody : this.icon_upperBody,
		};

		if( this.rp )
			out.rp = this.rp.save(full);

		if( full !== "mod" )
			out.experience = this.experience;

		// Assets are only sent if equipped, PC, or full
		out.assets = Asset.saveThese(this.assets.filter(el => full || el.equipped || !this.isNPC() || this.isDead()), full);

		if( full ){
			out.leveled = this.leveled;
			out.inventory = this.inventory;
			out.talkative = this.talkative;
			out.sadistic = this.sadistic;					// Normal vs Sadistic
			out.dominant = this.dominant;					// Dominant vs submissive
			out.hetero = this.hetero;						// 0 = gay, 0.5 = bi, 1 = straight
			out.intelligence = this.intelligence;
			out.powered = this.powered;
			if( full !== "mod" ){
				out._stun_diminishing_returns = this._stun_diminishing_returns;
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

	// Code that's run after the game has finished loading
	initialize(){
		// Apply constraints
		this.addHP(0);
		this.addMP(0);
		this.addAP(0);
		this.updateAutoWrappers();
		this.addDefaultActions();
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
	// prefix is usually se_ or ta_
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
		vars[prefix+'Arousal'] = this.arousal;
		vars[prefix+'Team'] = this.team;
		vars[prefix+'Size'] = this.size;
		vars[prefix+'MaxHP'] = this.getMaxHP();
		vars[prefix+'MaxAP'] = this.getMaxAP();
		vars[prefix+'MaxMP'] = this.getMaxMP();
		vars[prefix+'MaxArousal'] = this.getMaxArousal();
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
			vars.se_TaDamagingReceivedSinceLast = this.damagingSinceLastByPlayer(event.sender);
			vars.se_TaDamageReceivedSinceLast = this.damageSinceLastByPlayer(event.sender);
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

	isLootableBy( player ){
		return Boolean(player) && !game.battle_active && this.isDead() && this.getLootableAssets().length && this.team !== player.team;
	}

	// Can't accept their turn
	isIncapacitated(){
		let stun = this.getActiveEffectsByType(Effect.Types.stun);
		return stun.length > 0;
	}

	// Returns taunting players unless there's a grappling player, in which case that's returned instead
	getTauntedOrGrappledBy( debug ){
		
		let players = this.getGrappledBy();
		if( debug )
			console.debug("Grappled by ", players);
		if( players.length )
			return players;
		return this.getTauntedBy(debug);

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

	getTauntedBy( debug ){

		let tauntEffects = this.getActiveEffectsByType(Effect.Types.taunt);
		if( debug )
			console.debug("Taunt effects", tauntEffects);
		if( !tauntEffects.length )
			return game.players;

		let out = [];
		for( let effect of tauntEffects ){
			let sender = effect.parent.getCaster();
			if( effect.data && effect.data.victim )
				sender = effect.parent.parent;
			if( sender && out.indexOf(sender) === -1 )
				out.push(sender);
		}
		return out;

	}

	isBeast(){
		return this.hasTag(stdTag.plBeast);
	}





	// ICONS
	getActiveIcon(){
		
		const ub = this.hasTag(stdTag.asUpperBody),
			lb = this.hasTag(stdTag.asLowerBody)
		;
		if( !ub && !lb && this.icon_nude )
			return this.icon_nude;
		if( ub && !lb && this.icon_upperBody )
			return this.icon_upperBody;
		if( !ub && lb && this.icon_lowerBody )
			return this.icon_lowerBody;

		if( !this.icon )
			return 'media/characters/missing_art.jpg';
		return this.icon;

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
	getTags(wrapperReturn){

		let out = {};
		if( this.hp <= 0 )
			out[stdTag.dead] = true;

		for( let tag of this.tags ){
			if( !tag.startsWith('pl_') )
				tag = 'pl_'+tag;
			out[tag.toLowerCase()] = true;
		}

		// adds a tag to the name map
		const addTag = tag => out[tag.toLowerCase()] = true;

		let assets = this.getAssetsEquipped();
		if( wrapperReturn && wrapperReturn.armor_strips[this.id] ){
			for( let slot in wrapperReturn.armor_strips[this.id]){
				const a = wrapperReturn.armor_strips[this.id][slot];
				if( assets.indexOf(a) === -1 ){
					assets.push(a);
				}
			}
		}

		for( let asset of assets )
			asset.getTags().map(addTag);
		let fx = this.getWrappers();
		for( let f of fx )
			f.getTags().map(addTag);

		fx = this.getEffects();
		for( let f of fx )
			f.getTags().map(addTag);

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

		
		// Check wrapper tags
		const wrappers = this.getWrappers();
		for( let wrapper of wrappers ){
			if( wrapper.caster === sender.id && wrapper.hasTag(tags) )
				return true;
		}
		

		// Next check the effects
		const effects = this.getEffects();
		for( let effect of effects ){
			if( effect.parent.caster === sender.id && (effect.hasTag(tags)) )
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

		this.netgame_owner = '';
		if( this.leveled ){
			this.level += game.getHighestLevelPlayer();
			this.leveled = false;
		}

		this.assets = this.assets.map(el => Asset.convertDummy(el, this));
		for( let index of this.inventory ){
			if( this.assets[index] && this.assets[index].equippable() ){
				this.equipAsset(this.assets[index].id);
			}
		}
		this.inventory = [];

		for( let inv of this.assets )
			inv.onPlacedInWorld();

		this.addHP(Infinity);
		this.addMP(Infinity);
		this.arousal = 0;
		
	}
	onTurnEnd(){

		const wrappers = this.getWrappers();
		for(let wrapper of wrappers)
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

		
		const wrappers = this.getWrappers();
		for(let wrapper of wrappers)
			wrapper.onTurnStart();

		const actions = this.getActions();
		for(let action of actions)
			action.onTurnStart();
		
		if( this.arousal > 0 && this._turns%3 === 0 ){
			let sub = -this.getMaxArousal()/10;	// You lose 10% every 3 turns
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
		this._stun_diminishing_returns = 0;
		this._damaging_since_last = {};
		this._damage_since_last = {};
		this._last_chat = 0;

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
	// if fromStacks is true, it only iterates once and adds amount to stacks instead of asset._stacks
	addAsset( asset, amount = 1, fromStacks = false, no_equip = false, resetid = false ){
		if( !(asset instanceof Asset) ){
			console.error("Trying to add non-asset. Did you mean to use addLibraryAsset?");
			return false;
		}
		asset.equipped = false;

		asset.onPlacedInWorld();
		for( let i = 0; i<amount && (!fromStacks || i<1); ++i ){
			// Needs to be its own object
			const a = asset.clone(this);

			if( resetid )
				a.g_resetID();	// Buying stacks will bork everything otherwise

			const exists = this.getAssetByLabel(a.label);
			let n = a._stacks;
			if( fromStacks )
				n = amount;
			if( a.stacking && exists )
				exists._stacks += n;
			else{
				a._stacks = n;
				this.assets.push(a);
			}
			if( a.category === Asset.Categories.consumable ){
				
				if( this.getEquippedAssetsBySlots(Asset.Slots.action).length < 3 ){
					this.equipAsset(a.id);
				}

			}
			else if( this.isNPC() ){

				if( !no_equip && !game.battle_active && !this.getEquippedAssetsBySlots(a.slots).length && a.equippable() )
					this.equipAsset(a.id);

			}
		}
		this.raiseInvChange();
		return true;
	}
	raiseInvChange(){
		new GameEvent({type:GameEvent.Types.inventoryChanged, sender:this, target:this}).raise();
	}
	addLibraryAsset( label, amount = 1 ){

		let asset = glib.getFull('Asset')[label];
		if( !asset ){
			console.error("Invalid library asset", label);
			return false;
		}
		asset.g_resetID();
		asset.repair();
		asset.resetCharges();
		return this.addAsset(asset, amount);

	}
	getAssetById(id){
		for(let asset of this.assets){
			if(asset.id === id)
				return asset;
		}
		return false;
	}
	// useful for stackable items like currency
	getAssetByLabel( label ){
		for(let asset of this.assets){
			if( asset.label === label )
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
				asset.onEquip();
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

	// returns nr of assets of label, including stacks
	numAssets( label ){
		let out = 0;
		for(let asset of this.assets){
			if( asset.label === label ){
				out += asset.stacking ? asset._stacks : 1;
			}
		}
		return out;
	}

	// Returns nr of assets by label, including stacks and charges
	numAssetUses( label, equipped_only = false ){

		let assets = this.assets;
		if( equipped_only )
			assets = this.getAssetsEquipped();
		let out = 0;
		for(let asset of assets){
			if( asset.label === label ){
				let n = asset.stacking ? asset._stacks : 1;
				if( asset.charges > 1 ){
					n = (n-1)*asset.charges+asset._charges;
					console.log("Doing asset charges", asset.charges, n, asset);
				}
				else if( asset.charges === -1 )
					return -1;
				out += n;
			}
		}
		return out;
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
	destroyAsset(id, amount){
		if( id instanceof Asset )
			id = id.id;
		for(let i in this.assets){
			let asset = this.assets[i];
			if(asset.id === id){
				if( Math.floor(amount) && asset.stacking )
					asset._stacks -= amount;
				if( !amount || !this.assets[i].stacking || asset._stacks <= 0 )
					this.assets.splice(i, 1);
				this.raiseInvChange();
				return true;
			}
		}
		return false;
	}

	destroyAssetsByLabel( label, amount = 1 ){
		for( let asset of this.assets ){
			if( asset.label === label ){			
				let nrToRemove = !asset.stacking ? 1 : asset._stacks;
				if( nrToRemove > amount )
					nrToRemove = amount;
				this.destroyAsset(asset.id, amount);
				amount -= nrToRemove;
				if( amount < 1 )
					return;
			}
		}
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
				const stacks = this.assets[i]._stacks,
					equipped = this.assets[i].equipped;
				console.debug("Overwriting ", asset.label);
				this.assets[i] = lib[asset.label].clone(this);
				this.assets[i]._stacks = stacks;
				this.assets[i].equipped = equipped;

			}

		}

	}

	getLootableAssets(){
		return this.assets;
	}

	lootToPlayer( id, player ){

		let asset = this.getAssetById(id);
		if( !asset ){
			console.error("Asset not found", id, "in", this);
			return;
		}
		
		if( game.is_host && asset.loot_sound )
			game.playFxAudioKitById(asset.loot_sound, player, player, undefined, true );
		
		if( !game.is_host ){
			game.net.playerLootPlayer( player, this, asset );
			return;
		}

		asset.equipped = false;		// Make sure it's not equipped
		if( player.addAsset(asset) )
			this.destroyAsset(id);

		game.ui.addText( player.getColoredName()+" looted "+asset.name+" from "+this.getColoredName()+".", undefined, player.id,  player.id, 'statMessage important' );
		game.save();
		game.ui.draw();

	}

	// By default it damages all worn items
	// Returns an array of {armor_damage:{slot:damage}, armor_strips:{slot:true}}
	damageDurability( sender, effect, amount, slots, fText = false ){

		const out = {
			armor_damage : {},
			armor_strips : {}
		};
		let assets = [];
		// Pick a slot at random
		if( slots === 'RANDOM' ){
			let viableAssets = this.getEquippedAssetsBySlots([Asset.Slots.lowerBody, Asset.Slots.upperBody]);
			if( !viableAssets.length )
				return;
			assets = [viableAssets[Math.floor(Math.random()*viableAssets.length)]];
		}
		else{
			if( !Array.isArray(slots) )
				slots = [Asset.Slots.lowerBody, Asset.Slots.upperBody];
			assets = this.getEquippedAssetsBySlots(slots);
		}
		
		amount = Math.round(amount);
		for( let asset of assets ){
			let destroyed = asset.damageDurability( sender, effect, amount, fText );
			for( let slot of asset.slots ){
				out.armor_damage[slot] = amount;
				if( destroyed )
					out.armor_strips[slot] = asset;
			}
		}
		return out;

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
		return 35000+this.getPrimaryStats()[Player.primaryStats.stamina]*3000;
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

	// Currency
	// Returns currency value in copper
	getMoney(){
		let out = 0;
		for( let asset of this.assets ){
			if( asset.label === 'platinum' )
				out += asset._stacks*1000;
			else if( asset.label === 'gold' )
				out += asset._stacks*100;
			else if( asset.label === 'silver' )
				out += asset._stacks*10;
			else if( asset.label === 'copper' )
				out += asset._stacks;
		}
		return out;
	}

	consumeMoney( copper = 0 ){

		let total = this.getMoney();
		if( total < copper )
			return false;

		let costRemaining = copper;		// Remaining cost in copper we need to pay
		let consumeCopper = 0,			// Copper assets we need to remove
			consumeSilver = 0,			// Silver assets we need to remove
			consumeGold = 0,			// Gold assets we need to remove
			consumePlatinum = 0			// Plat assets we need to remove
		;
		let copperAsset = this.getAssetByLabel('copper'),
			silverAsset = this.getAssetByLabel('silver'),
			goldAsset = this.getAssetByLabel('gold')
		;
		// First see if we can handle it with just copper
		if( copperAsset && copperAsset._stacks >= copper ){
			consumeCopper = costRemaining;
			costRemaining = 0;
		}else{
			// Start by spending all copper
			if( copperAsset ){
				consumeCopper = copperAsset._stacks;
				costRemaining -= consumeCopper;
			}
			while( costRemaining > 0 ){
				// See if we still have any silver
				if( silverAsset && silverAsset._stacks > consumeSilver ){
					// Split a silver
					++consumeSilver;
					costRemaining -= 10;
				}else if( goldAsset && goldAsset._stacks > consumeGold ){
					// Split a gold
					++consumeGold;
					costRemaining -= 100;
				}
				else{
					// Split a platinum
					++consumePlatinum;
					costRemaining -= 1000;
				}
			}
		}

		const change = this.calculateMoneyExhange(Math.abs(costRemaining));
		consumeCopper -= change[3];
		consumeSilver -= change[2];
		consumeGold -= change[1];
		consumePlatinum -= change[0];

		//console.log("Consume: ", consumeCopper, "copper", consumeSilver, "silver", consumeGold, "gold", consumePlatinum, "plat." "Change in copper", Math.abs(costRemaining));
		
		if( consumeCopper < 0 ){
			const asset = glib.get('copper', 'Asset');
			asset._stacks = Math.abs(consumeCopper);
			this.addAsset(asset);
		}
		else if( consumeCopper > 0 )
			this.destroyAsset(copperAsset.id, consumeCopper);

		if( consumeSilver < 0 ){
			const asset = glib.get('silver', 'Asset');
			asset._stacks = Math.abs(consumeSilver);
			this.addAsset(asset);
		}
		else if( consumeSilver > 0 )
			this.destroyAsset(silverAsset.id, consumeSilver);
		
		if( consumeGold < 0 ){
			const asset = glib.get('gold', 'Asset');
			asset._stacks = Math.abs(consumeGold);
			this.addAsset(asset);
		}
		else if( consumeGold > 0 )
			this.destroyAsset(goldAsset.id, consumeGold);

		if( consumePlatinum < 0 ){
			const asset = glib.get('platinum', 'Asset');
			asset._stacks = Math.abs(consumePlatinum);
			this.addAsset(asset);
		}
		else if( consumePlatinum > 0 ){
			this.destroyAsset(this.getAssetByLabel('platinum').id, consumePlatinum);
		}
		return true;

	}

	// See Player.calculateMoneyExchange
	calculateMoneyExhange( input = 0 ){
		return Player.calculateMoneyExhange(input);
	}

	// Auto exchanges money assets to the fewest amounts of coins
	exchangeMoney(){
		const exchanged = this.calculateMoneyExhange(this.getMoney());
		let asset;
		if( asset = this.getAssetByLabel('platinum') )
			this.destroyAsset(asset);
		if( asset = this.getAssetByLabel('gold') )
			this.destroyAsset(asset);
		if( asset = this.getAssetByLabel('silver') )
			this.destroyAsset(asset);
		if( asset = this.getAssetByLabel('copper') )
			this.destroyAsset(asset);
		
		const labels = ['platinum', 'gold','silver','copper'];
		for( let i in exchanged ){
			const amt = exchanged[i];
			if( amt ){
				const label = labels[i];
				const a = glib.get(label, 'Asset');
				a._stacks = amt;
				this.addAsset(a);
			}
		}
		return true;
		
	}

	// Exchanges a copper amount into plat, gold etc and adds
	addCopperAsMoney( copper = 0 ){
		copper = parseInt(copper);
		if( copper < 1 )
			return;

		const exch = Player.calculateMoneyExhange(copper);
		for( let i in exch ){
			if( !exch[i] )
				continue;
			const asset = glib.get(Player.currencyWeights[i], 'Asset');
			asset._stacks = exch[i];
			this.addAsset(asset);
		}

	}

	canExchange(){
		const labels = Player.currencyWeights;
		for( let asset of this.assets ){
			if( ~labels.indexOf(asset.label) && asset._stacks >= 10 )
				return true;
		}
	}



	/* Leveling & Experience */
	getExperienceUntilNextLevel(){
		if( this.level === 1 )
			return 4;
		
		return Math.ceil(1+this.level*2+Math.pow(this.level,2.5));
	}

	// NPC kills
	getExperienceWorth(){
		return this._difficulty*this.level/4;
	}

	// adds experience and returns levels gained
	addExperience( points ){
		points = Math.round(points);
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

			game.renderer.playFX(this, this, 'levelup', undefined, true );			
		}
		return levelsGained;
	}







	/* RESOURCES */
	addAP( amount, fText = false ){

		if( isNaN(amount) ){
			console.error("AP amount is NaN", amount);
			return false;
		}
		const pre = this.ap;
		this.ap += amount;
		this.ap = Math.max(0, Math.min(this.getMaxAP(), this.ap));
		if( fText && this.ap-pre !== 0 )
			game.ui.floatingCombatText(this.ap-pre, this, "ap");
		
	}

	addMP( amount, fText = false ){

		if( isNaN(amount) ){
			console.error("MP amount is NaN", amount);
			return false;
		}
		const pre = this.mp;
		this.mp += amount;
		this.mp = Math.max(0, Math.min(this.getMaxMP(), this.mp));

		if( fText && this.mp-pre !== 0 )
			game.ui.floatingCombatText(this.mp-pre, this, "mp");

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
	addHP( amount, sender, effect, fText = false ){

		if( isNaN(amount) ){
			console.error("AP amount is NaN", amount);
			return false;
		}
		const pre = this.hp;
		let wasDead = this.hasTag(stdTag.dead);
		this.hp += amount;
		this.hp = Math.max(0, Math.min(this.getMaxHP(), this.hp));

		if( fText && this.hp-pre !== 0 )
			game.ui.floatingCombatText(this.hp-pre, this, "hp");

		if( this.hp === 0 && !wasDead ){
			this.onDeath( sender, effect );
			if( this.hp === 0 )
				return true;
		}

		return false;

	}

	addArousal( amount, fText = false ){

		if( this.isOrgasming() )
			return;
		if( isNaN(amount) )
			return console.error("Invalid amount of arousal", amount);
		const pre = this.arousal, max = this.getMaxArousal();
		this.arousal += amount;
		this.arousal = Math.min(max, Math.max(0, this.arousal));
		if( this.arousal === max && pre !== max ){
			glib.get("overWhelmingOrgasm", "Wrapper").useAgainst(this, this, false);
			game.save();
			game.ui.draw();
		}
		if( fText && this.arousal-pre !== 0 )
			game.ui.floatingCombatText(this.arousal-pre, this, "arousal");

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
		let val = stats[stat]+this.class[stat];
		if( isNaN(val) )
			return 0;

		if( stat === ps.stamina )
			return val*(this.class.primaryStat === stat ? 3 : 2);		// Stamina
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
		let slots = [Asset.Slots.lowerBody, Asset.Slots.upperBody];
		for( let slot of slots ){
			let gear = this.getEquippedAssetsBySlots(slot);
			if( !gear.length )
				out += Asset.protVal;
			else
				out += gear[0].getDmgTakenAdd();
		}
		return out;

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
				console.debug("Rebasing action", action.label, "with", lib[action.label]);
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
		out = out.concat(this.getTempActions());
		if( include_items ){

			for( let asset of this.assets ){
				let action = asset.use_action;
				if( asset.isConsumable() && (asset.equipped || !game.battle_active) )
					out.push(action);
			}

		}
		out.sort((a,b) => {
			const aConsumable = Boolean(a.parent.use_action);
			const bConsumable = Boolean(b.parent.use_action);
			const aName = aConsumable ? a.parent.name : a.name;
			const bName = bConsumable ? b.parent.name : b.name;
			
			// nonconsumable first
			if( aConsumable !== bConsumable )
				return bConsumable ? -1 : 1;
			// Lower cooldown second
			if( a.cooldown !== b.cooldown )
				return a.cooldown < b.cooldown ? -1 : 1;
			// Finally name
			return aName < bName ? -1 : 1;
		});
		
		return out;

	}

	getTempActions(){
		
		const ids = {};
		const scanned = {};
		for( let a of this.tmp_actions )
			ids[a.label] = true;

		const effects = this.getActiveEffectsByType(Effect.Types.addActions);
		for( let effect of effects ){
			const actions = Action.loadThese(effect.data.actions, this);
			for( let action of actions ){
				scanned[action.label] = true;
				if( !ids[action.label] ){
					ids[action.label] = true;
					action.g_resetID();
					this.tmp_actions.push(action);
				}
			}
		}
		// Remove missing ones
		for( let i =0; i<this.tmp_actions.length && this.tmp_actions.length; ++i ){
			const action = this.tmp_actions[i];
			if( !scanned[action.label] ){
				this.tmp_actions.splice(i, 1);
				--i;
			}
		}

		return this.tmp_actions;

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
	
	// Checks encumberance
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

	// Adds action cooldowns by labels
	addActionCooldowns( labels, amount ){
		if( !Array.isArray(labels) )
			labels = [labels];
		for( let label of labels ){
			let action = this.getActionByLabel(label);
			if( action )
				action.addCooldown(amount);
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
		
		return this.getEffects().filter(fx => {
			return (fx.type === type && (!this._ignore_effects || this._ignore_effects.indexOf(fx) === -1));
		});

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

		wrapper.parent = this;
		this.wrappers.push(wrapper);
		let isStun = wrapper.getEffects({ type:Effect.Types.stun });
		if( isStun.length && wrapper.duration > 0 && (!isStun[0].data || !isStun[0].data.ignoreDiminishing) ){
			this._stun_diminishing_returns += wrapper._duration*2;

		}
		
		if( isStun.length )
			this.interrupt( wrapper.getCaster() );

	}

	getActiveWrappersWithTag(...tags){
		return this.getWrappers().filter(wrapper => {
			return wrapper.hasTag(tags);
		});
	}

	// overWhelmingOrgasm triggered from max arousal
	isOrgasming(){
		const wrappers = this.getWrappers();
		for( let wrapper of wrappers ){
			if( wrapper.label === "overWhelmingOrgasm" ){
				return true;
			}
		}
	}
	
	// Filter is an object of key:value pairs
	/* Supports any simple data types, and the following complex:
		- Tags : Searches tags
		Filter can also be a string, in which case it checks label 
	
	getWrappersFiltered( filter = {} ){
		if( typeof filter !== "object" )
			filter = {label:filter};

		const wrappers = this.getWrappers();
		const simpleTypes = ["number","string","boolean"];
		const out = [];

		const testWrapper = wrapper => {
			for( let i in filter ){
				const val = filter[i],
					myVal = wrapper[i],
					type = typeof myVal
				;
				if( ~simpleTypes.indexOf(type) ){
					if(myVal !== val)
						return false;
				}
				else if( i === "tags" ){
					if(!wrapper.hasTag(val))
						return false;
				}
				else
					console.error("Unable to filter wrapper on", i, "not yet implemented", "Full filter was", filter);
			}
			return true;
		}

		for( let wrapper of wrappers ){
			if(testWrapper(wrapper))
				out.push(wrapper);
		}
		return out;
	}
	*/
	
	/* Effects */
	// Gets all effects (effects on other players may affect you if the target is you or AoE)
	getEffects(){

		let out = [];
		for( let player of game.players ){
			const wrappers = player.getWrappers();
			for( let wrapper of wrappers ){
				out = out.concat(wrapper.getEffectsForPlayer(this));
			}
		}
		return out;

	}	
	getDisabledLevel(){
		let level = 0;
		const effects = this.getActiveEffectsByType(Effect.Types.disable);
		for( let effect of effects ){
			let lv = effect.level;
			if( isNaN(lv) )
				lv = 1;
			if( lv > level )
				level = lv;
		}
		return level;
	}
	// Returns true if any of the disabled effects triggers it
	getDisabledHidden(){
		const effects = this.getActiveEffectsByType(Effect.Types.disable);
		for( let effect of effects ){
			if( effect.data.hide )
				return true;
		}
	}



	/* CHATS */
	onChatUsed( id ){
		this._used_chats[id] = true;
		this._last_chat = this._turns;
	}

	hasUsedChat( id ){
		return this._used_chats[id];
	}
	// Checks if this NPC has chatted too recently
	canOptionalChat(){
		
		if( this.talkative >= 1 )
			return true;
		let turnsSinceLastSpoke = this._turns-this._last_chat;
		return Math.random() < turnsSinceLastSpoke*this.talkative;

	}


	// Bot
	autoPlay( force ){

		if( !this.isNPC() && !force )
			return;
		if( !this.bot ){
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
	if( attacker.team !== 0 && attacker.level > 1 )
		multi = 1+(game.getTeamPlayers().length-1)*0.25;

	const out = (1+tot*0.1)*multi;
	return out;

};


// Exchanges copper into the fewest coins possible
// returns an array of [platinum, gold, silver, copper] after exchange. You can use Player.currencyWeights to map this to assets
Player.calculateMoneyExhange = function( input = 0 ){
	return [
		Math.floor(input/1000),
		Math.floor((input%1000)/100),
		Math.floor((input%100)/10),
		input%10
	];
};

Player.currencyWeights = [
	'platinum',
	'gold',
	'silver',
	'copper'
];
Player.currencyColors = [
	'#FFF',
	'#FF8',
	'#AAA',
	'#FA8'
];
