import Generic from './helpers/Generic.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import Player from './Player.js';
import Asset from './Asset.js';
import stdTag from '../libraries/stdTag.js';
import HitFX from './HitFX.js';

/*
	List of tags you can use:
	GENERIC
		%leftright - left or right at random
		%frontback

	TARGET PREFIXED - These are prefixed with 
			%T : Target 
			%T2... : Additional targets
			%S for sender
			%P for RP player (if it exists, _targetPlayers). Use %P2 %P3 etc for additional RP players
			%RtagName for turntag sender, ex %Rspanked - Targets the player that applied the "spanked" turntag. Make sure to use the proper TT conditions for these to work
		%T - Player name
		%Tpsize, %Tbsize, %Trsize - Grants a size tag for penis, breasts, rear in that order. Must be preceded by a space, which gets removed if the size is average.
		%Tgenitals - Automatically pick a genital synonym. Herms get picked at random, so only use this if it doesn't matter which part was targeted.
		
		%TclothUpper - UpperBody armor name
		%TclothLower - LowerBody armor name
		%Thead - Headgear name
		%Tgear - Mainhand name
		using an a after T ex TaGear will be replaced with a/an <outfit>

		%Trace - Species name of player
		%The, %Thim, %This - Player pronouns
		
	Also see SYNONYMS below for additional synonyms. Just slap a % before either of them and it'll work.

*/
// These are generic synonyms that can be used with %synonym for either of these labels, such as %groin works the same as %crotch
const SYNONYMS = [
	['cum', 'spunk', 'jizz'],
	['couple of', 'few', 'handful of'],
	['pounding', 'thrusting', 'humping'],
	['firmly', 'rigidly', 'thoroughly'],
	['firm', 'tight', 'rigid', 'thorough'],
	['quickly', 'rapidly', 'speedily', 'hastily'],
	['rapid', 'quick', 'hasty', 'swift'],
	['breast', 'boob', 'tit', 'breast'],
	['penis', 'dong', 'cock', '!member'],
	['vagina', 'pussy', 'cunt'],
	['butt', 'rear', 'behind'],
	['groin', 'crotch'],
	['around', 'about'],
	['start', 'begin'],
	['into', 'inside'],
	['rapidly','hastily','promptly','swiftly'],
	['slither','slip','slink','wiggle'],
	['rough','hard'],
	['slightly', 'a little', 'somewhat'],
	["big", "large"],
	['glob', 'wad', 'blob'],
	['flings','launches','lobs','slings'],
	['sticky', 'syrupy', 'viscous'],
	['letting', 'allowing'],
	['splattering', 'splashing'],
	['jostle', 'shake', 'rattle'],
	['jostling', 'shaking', 'rattling'],
	["wiggling", "squirming", "wriggling"],
	["bulge","package"],
	["stomach", "belly", "tummy"],
];
/*
const A_EXCEPTIONS = {
	'a' : [
		'unicorn',
		'eukaryot',
		'unite',
		'unique',
		'onesie',
		'use',
		'union',
		'universit',
		'unit',
		'univers',
		'uniform',
		'utilit',
		'urin',
		'euphor',
		'utopi',
		'urethra',
		'ewe',
		'euphemis',
		'usurp',
		'usab',
		'utensi',
		'ukulele',
		'unar',
	],
	'an' : [
		'hour', 
		'heir',
		'honour',
	]
};*/

class Text extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
			chatPlayerConditions : Condition,
			hitfx : HitFX,
		};
	}

	constructor(...args){
		super(...args);

		this.text = '';
		this.conditions = [];
		this.numTargets = 1;			// How many targets this text is meant for. Not a condition because we need to sort on it. Use -1 for ANY
		this.debug = false;
		this.alwaysOutput = false;		// Ignores the text backlogging and outputs this text immediately
		this.turnTags = [];				// Sets tags that persist until the next text is received or the current turn ends
		this.metaTags = [];				// Meta tags supplied in the textTrigger event
		this.audiokits = [];			// IDs of audio kits. Can also be a string, which gets cast to an array on load. You can also use soundkits as a synonym
		this.hitfx = [];				// hit effects
		this.armor_slot = '';				// Trigger armor hit sound on this slot, use Asset.Slots
		this.weight = 1;					// Lets you modify the weight of the text, higher weights are shown more often.
											// If you use a value of or greater than 1000 (use Text.WEIGHT_REQUIRED)
		this.chat = 0;					// 0 = no chat, 1 = casual chat (has a built in cooldown), 2 = required chat
		this.chat_reuse = false;		// If a chat and this is set, the chat can be triggered multiple times in a session
		this.chatPlayerConditions = [];	// These conditions are run on each player to see if they can say this. Only usable when chat is true
										// Both target and sender are the same player. You generally want at least "targetIsX" in here when using a text.
		this.en = true;					// enabled for use in event based text triggers

		this._chatPlayer = null;		// Cache of the chat player tied to this. Only set on a successful chat
		this._cache_event = null;		// Cache of event type supplied in conditions. Should speed things up.
		this._cache_action = null;		// Cache of the action involved, since most texts are tied to an action.
		this._cache_crit = null;		// Set to true if it requires crit, false if it should not be a crit. remains null for either or

		this.load(...args);
	}

	load(data){

		if( !data )
			return;
		
		if( data.soundkits )
			data.audiokits = data.soundkits;
		
		if( typeof data.audiokits === "string" )
			data.audiokits = [data.audiokits];

		this.g_autoload(data);
		if( this.numTargets < 1 && this.numTargets !== -1 )
			this.numTargets = 1;

	}

	rebase(){
		this.g_rebase();	// Super
		
		for( let sound of this.audiokits ){

			if( !glib.audioKits[sound] )
				console.error("AudioKit not found", sound, "in", this);

		}

		
		for( let condition of this.conditions ){
			
			if( condition.type === Condition.Types.event ){
				this._cache_event = {};
				let evts = toArray(condition.data.event);
				for( let n of evts)
					this._cache_event[n] = true;
			}
			else if( condition.type === Condition.Types.actionLabel && !condition.conditions.length ){

				this._cache_action = {};
				let actions = toArray(condition.data.label);
				for( let n of actions )
					this._cache_action[n] = true;

			}
			else if( condition.type === Condition.Types.actionCrit ){
				this._cache_crit = !condition.inverse;
			}

		}

	}

	save(full){
		const out = {
			id : this.id,
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full),
		};

		// Not sure why this is here since texts should allow labels
		// Disabling it for now, but re-enable it if you get problems
		//if( full === "mod" && this.label )
		//	out.label = this.label;

		if( full ){

			out.hitfx = HitFX.saveThese(this.hitfx, full);
			out.numTargets = this.numTargets;
			out.debug = this.debug;
			out.alwaysOutput = this.alwaysOutput;
			out.turnTags = this.turnTags;
			out.audiokits = this.audiokits;
			out.armor_slot = this.armor_slot;
			out.weight = this.weight;
			out.chat = this.chat;
			out.chatPlayerConditions = Condition.saveThese(this.chatPlayerConditions, full);
			out.metaTags = this.metaTags;
			out.en = this.en;
			out.chat_reuse = this.chat_reuse;

		}
		if( full === "mod" )
			this.g_sanitizeDefaults(out);

		return out;
	}
	
	// Inputs is an array of objects {se : (str)search, re : (str/arr)replace}. Prefixes should not have percentage signs. They're automatically handled along with ! for uppercase
	// If replace is an array or a function, it picks random elements for each one
	textReplace( inputs = [], originalText = '' ){

		const replaceCustom = (text, search, replace, uc = false) => {

			let val = Array.isArray(replace) ? randElem(replace) : replace();
			if( uc )
				val = ucFirst(val, true);

			return text.replace(search, val);

		};

		for( let input of inputs ){

			const search = input.se,
				replace = input.re
			;
			if( Array.isArray(replace) || typeof replace === "function" ){

				// A bit pricier since we can have multiple synonyms
				while( originalText.includes('%'+search) )
					originalText = replaceCustom(originalText, '%'+search, replace);
				while( originalText.includes('%!'+search) )
					originalText = replaceCustom(originalText, '%'+search, replace, true);
				
				continue;
			}
			originalText = originalText.replaceAll('%'+search, replace);
			originalText = originalText.replaceAll('%!'+search, ucFirst(replace, true));

		}
		return originalText;

	}

	// Converts tags for a specific player
	targetTextConversion( input, prefix, player, event ){

		if( !player || player.constructor !== Player )
			return input;

		let replacements = [
			{se:prefix+'bsize', re:player.getBreastSizeTag()},
			{se:prefix+'psize', re:player.getPenisSizeTag()},
			{se:prefix+'rsize', re:player.getButtSizeTag()},
		];
		
		let synonyms = ['vagina', 'pussy', 'cunt'];
		// Check if male here, otherwise we can reuse
		if( player.hasTag(stdTag.penis) )
			synonyms = ['penis', 'dong', 'cock', 'member'];
		replacements.push({
			se: prefix+'genitals',
			re: synonyms
		});

		// Clothes
		let c = player.getEquippedAssetsBySlots([Asset.Slots.upperBody]);		
		let slotName = c.length ? c[0].getShortName().toLowerCase() : 'Outfit';
		// If an item was just stripped in the event (usually Action use), you can use that one here
		if( !c.length && event.wrapperReturn && event.wrapperReturn.armor_strips[player.id] && event.wrapperReturn.armor_strips[player.id][Asset.Slots.upperBody] )
			c.push(event.wrapperReturn.armor_strips[player.id][Asset.Slots.upperBody]);
		replacements.push(
			{se: prefix+'clothUpper', re: slotName},
			{se: prefix+'aClothUpper', re: (c.length ? c[0].getArticle() : 'an') +' '+slotName}
		);

		// Same as above but lowerBody
		c = player.getEquippedAssetsBySlots([Asset.Slots.lowerBody]);
		slotName = c.length ? c[0].getShortName().toLowerCase() : 'Outfit';	
		if( !c.length && event.wrapperReturn && event.wrapperReturn.armor_strips[player.id] && event.wrapperReturn.armor_strips[player.id][Asset.Slots.lowerBody] )
			c.push(event.wrapperReturn.armor_strips[player.id][Asset.Slots.lowerBody]);
		replacements.push(
			{se: prefix+'clothLower', re: slotName},
			{se: prefix+'aClothLower', re: (c.length ? c[0].getArticle() : 'an') +' '+slotName}
		);

		c = player.getEquippedAssetsBySlots([Asset.Slots.hands]);
		slotName = c.length ? c[0].getShortName().toLowerCase() : 'gear';
		replacements.push(
			{se: prefix+'gear', re: slotName},
			{se: prefix+'aGear', re: (c.length ? c[0].getArticle() : 'a')+' '+slotName},
		);

		slotName = player.species ? player.species : 'combatant';
		replacements.push(
			{se: prefix+'race', re: slotName},
			{se: prefix+'aRace', re: (player.spre && player.species ? player.spre : 'a')+' '+slotName},
		);

		synonyms = ['groin', 'crotch'];
		replacements.push({ se: prefix+'groin', re: synonyms });

		let items = [];
		if( event.wrapperReturn && event.wrapperReturn.steals[player.id] ){
			
			for( let item of event.wrapperReturn.steals[player.id] ){

				let text = '';
				if( item._stacks > 1 )
					text += item._stacks+'x ';
				items.push(text+item.getName());

			}

		}
		replacements.push({ se:prefix+'itemsStolenFrom', re: items.join(', ')});

		let pronouns = ['he', 'him', 'his'];
		for( let p of pronouns )
			replacements.push({ se: prefix+p, re: player.getPronoun(p) });

		// Exec replacements
		input = this.textReplace(replacements, input);

		// needs to be last
		// Colored name doesn't use the textReplace because it should always be capitalized, and it adds pipes to the start and end
		input = input.split('%'+prefix).join(player.getColoredName());

		
		return input;
	}

	// Takes replaces all occurences of a %synonym with a random one from synonyms 
	// Only useful for direct synonyms. Not usable when the tag is not the synonym, like %leftright
	_replaceArray(text, synonyms){

		const acceptable = synonyms.map(s => s.charAt(0) === '!' ? s.substring(1) : s);
		const outputs = synonyms.filter(s => s.charAt(0) !== '!');

		const repl = (synonym, uc) => {

			let pre = '%';
			if( uc )
				pre = '%!';

			if( synonym.charAt(0) === '!' )
				synonym = synonym.substring(1);

			let esc = (pre+synonym).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
			let spl = text.split(new RegExp('('+esc+')', 'g'));
			for( let i in spl ){

				let t = spl[i];
				if( t.startsWith(pre) ){

					t = t.substring(pre.length);
					if( acceptable.includes(t) ){

						let synonym = randElem(outputs);
						if( uc )
							synonym = ucFirst(synonym, true);
						spl[i] = synonym;

					}

				}

			}
			text = spl.join('');

		};

		for( let synonym of synonyms ){
			repl(synonym, true);
			repl(synonym, false);
		}
		return text;
	}

	// Main entrypoint
	run( event, returnResult = false ){

		const preText = event.text;
		const onReturn = () => {
			event.text = preText;
		};
		event.text = this;
		// if it's not a chat, tie this text to the event
		
		

		// Helper functions
		let text = this.text;
		text = this.textReplace([
			// These two are picked ONCE per text
			{se: 'leftright', re: (Math.random()<0.5 ? 'left' : 'right')},
			{se: 'frontback', re: (Math.random()<0.5 ? 'front' : 'back')},
			// These are picked each time it's used in text
			{se: 'rleftright', re: ['left', 'right']},
			{se: 'rfrontback', re: ['front', 'back']},
			{se: 'TOD', re:window.game?.getApproxTimeOfDay() || 'morning'},
		], text);
		

		for( let block of SYNONYMS )
			text = this._replaceArray(text, block);
			
		if( event.target ){

			let t = toArray(event.target);
			
			for( let i = t.length-1; i>=0; --i ){

				let prefix = 'T';
				if( i )
					prefix = prefix+(i+1);	// %T2, %T3 etc
				text = this.targetTextConversion(text, prefix, t[i], event);

				// Add any previous turntag senders
				for( let tag of t[i]._turn_tags ){

					let tText = tag.tag;
					let tSender = tag.s;
					text = this.targetTextConversion(text, "R"+tText, tSender, event);

				}

				t[i]._turn_tags = [];
				t[i].addTurnTags(this.turnTags, event.sender);
				
			}

		}
		if( event.sender )
			text = this.targetTextConversion(text, 'S', event.sender, event);

		const rpPlayers = window.game?.roleplay?.getTargetPlayers() || event.custom.rpTargets;
		if( rpPlayers?.length ){
			
			// Needs to go in reverse order due to greater first
			for( let i = rpPlayers.length-1; i >= 0; --i ){
				let label = 'P';
				if( i )
					label += (i+1);
				text = this.targetTextConversion(text, label, rpPlayers[i], event);
			}

		}

		if( event.asset )
			text = this.textReplace([{ se: 'asset', re: event.asset.name}], text);

		if( event.action )
			text = this.textReplace([{ se: 'action', re: event.action.getName()}], text);

		if( returnResult ){
			onReturn();	// Restore modified event values
			return text;
		}

		this.triggerVisuals(event);


		let targ = event.target;
		if( Array.isArray(event.target) )
			targ = event.target[0];
		
		if( this.chat && this._chatPlayer && game.battle_active ){	// only allow NPC chats in combat. Otherwise RP might cause weird results.

			if( !this.chat_reuse )
				this._chatPlayer.onChatUsed(this.id);
			game.speakAs( this._chatPlayer.id, text, false );


		}
		else{

			game.ui.addText(
				text, 
				event.type, 
				event.sender ? event.sender.id : undefined,
				targ ? targ.id : undefined,
				'rpText',
				~[GameEvent.Types.actionUsed, GameEvent.Types.actionCharged, GameEvent.Types.actionRiposte].indexOf(event.type) || this.alwaysOutput,
			);

			
			// Raise a text trigger event
			this.raiseTextTriggerEvent(event);	

		}

		onReturn();	// Restore modified event values

		
	}

	raiseTextTriggerEvent( originalEvent ){

		const originalType = originalEvent.type,
			originalText = originalEvent.text,
			originalCustom = originalEvent.custom
		;
		// Make sure to stash the original first
		originalEvent.custom.original = originalEvent.clone();

		originalEvent.type = GameEvent.Types.textTrigger;
		originalEvent.text = this;
		if( !originalEvent.custom )
			originalEvent.custom = {};

		originalEvent.raise();
		
		originalEvent.type = originalType;
		originalEvent.text = originalText;
		originalEvent.custom = originalCustom;

	}

	// triggers FX and audio kits
	triggerVisuals( event ){

		for( let kit of this.audiokits ){

			let kd = glib.audioKits[kit];
			if( !kd )
				continue;

			if( Condition.all(kd.conditions, event) ){
				game.playFxAudioKitById(
					kit, 
					event.sender, 
					event.target, 
					this.armor_slot,
					true
				);

			}

		}
		
		
		let targs = event.target;
		if( !Array.isArray(targs) )
			targs = [targs];

		if( event.type === GameEvent.Types.actionCharged )
			targs = [event.sender];
		

		let i = 0;
		for( let fx of this.hitfx ){

			for( let targ of targs ){
				
				setTimeout(() => game.renderer.playFX(event.sender, targ, fx, this.armor_slot, true), ++i*200);
				if( fx.once )
					break;
					
			}

		}
	}

	// Helper for _cache_action
	testAliases( event ){
		
		if( !event.action && (!event.custom.original || !event.custom.original.action) )
			return false;

		let names = [];
		if( event.action )
			names = names.concat(event.action.label, event.action.alias);
		if( event.custom.original && event.custom.original.action )
			names = names.concat(event.custom.original.action.label, event.custom.original.action.alias);

		for( let name of names ){
			
			if( this._cache_action[name] )
				return true;

		}
		return false;

	}

	// Validate conditions
	// event is the event that should get tested
	// debug enables debug output
	// chatPlayer is a Player object that's used in AI speech bubbles
	validate( event, debug, chatPlayer ){

		//console.trace(this);
		//debugger;
		if( !debug )
			debug = this.debug;

		if( debug )
			console.debug("Validating", this, "against", event, chatPlayer);

		if( this._cache_action && !this.testAliases(event) ){

			if( debug )
				console.debug("FAIL because this._cache_action");
			return false;

		}

		

		if( this._cache_crit !== null ){
			if( !event.action || event.action._crit !== this._cache_crit ){
				if( debug )
					console.debug("FAIL because this._cache_crit");
				return false;
			}
		}

		const original = event.custom.original;
		if( 
			this._cache_event && !this._cache_event[event.type] &&
			(!original || !this._cache_event[original.type])
		){
			if( debug )
				console.debug("FAIL because this._cache_event:", this._cache_event, "tried finding", event.type, "original", original && original.type);
			return false;
		}

		

		// Temporarily set. The proper set is after cloning in Text.getFromEvent
		if( event.text )
			event.text._chatPlayer = chatPlayer;	

		if( this.chat && !chatPlayer ){
			if( debug )
				console.debug("FAIL because chat player missing");
			return false;
		}

		if( this.chat && !chatPlayer.canOptionalChat() ){
			if( debug )
				console.debug("FAIL because chatPlayer can't optional chat");
			return false;
		}

		// Chat already used by this player
		if( this.chat && chatPlayer._used_chats[this.id] ){

			if( debug )
				console.debug("FAIL because chat already used by player");
			return false;

		}

		

		let targets = Array.isArray(event.target) ? event.target : [event.target];
		if( targets.length < this.numTargets ){
			if( debug )
				console.debug("FAIL because not enough targets");
			return false;
		}



		// If this is a chat, we need to check who said it by validating chat player conditions
		if( this.chat && this.chatPlayerConditions.length ){
			
			// Cloning an event is slow AF, so use caching instead
			const 
				preSender = event.sender,
				preTarget = event.target,
				preText = event.text
			;
			event.sender = event.target = chatPlayer;
			event.text = this;
			
			const check = Condition.all(this.chatPlayerConditions, event, debug);
			event.sender = preSender;
			event.target = preTarget;
			event.text = preText;
			if( !check )
				return false;

		}

		if( !Condition.all(this.conditions, event, debug ) )
			return false;

		if( debug )
			console.debug("SUCCESS: ", this, "evt", event.clone());
		return true;

	}

}

Text.WEIGHT_REQUIRED = 1000;
Text.SYNONYMS = SYNONYMS;
// Shuffles and triggers a random text from available texts
// Returns the text that triggered, if any
Text.getFromEvent = function( event, debug = false ){

	let available = [];
	let texts = glib._texts;
	const preText = event.text;		// Caching and restoring values is much faster than cloning


	let testAgainst = [false];	// This is only used on chats
	if( event.type === GameEvent.Types.textTrigger )
		testAgainst = game.getEnabledPlayers();

	const chat = event.type === GameEvent.Types.textTrigger;

	const doDebug = debug === true;

	let maxnr = 1;
	for( let text of texts ){

		event.text = text;				// Needed for validation
		const debug = text.debug;

		for( let p of testAgainst ){

			// Text disabled (should live here because RP can run text.validate on disabled texts)
			if( !text.en ){
				if( debug )
					console.debug("Ignored ", text, "because disabled");
				continue;
			}
			if( Boolean(text.chat) !== chat ){
				if( debug )
					console.debug("Ignored ", text, "because not valid chat", Boolean(text.chat), chat);
				continue;
			}

			// p is the chat player we're testing
			if( chat && p && ((!p._debug_chat && !p.isNPC()) || p.hasUsedChat(text.id)) ){

				if( debug )
					console.debug("Ignored ", text, "because player", p, "is nonexistant, a PC or has used that chat");
				continue;

			}

			if( !text.validate(event, doDebug, p) ){

				if( chat && text.debug )
					console.log("Validation failed on evt", event.clone(), "for text", text);
				continue;

			}
			
			// Not sure why ID here is required, cloning is a bit slow
			const id = text.id;
			text = text.clone();	// Clone it so we can set chat player
			text.id = id;			// ID isn't saved on text (regenerated each load). So when cloning we have to re-apply it
			if( p )
				text._chatPlayer = p;
			
			available.push(text);
			if( text.numTargets > maxnr )
				maxnr = text.numTargets;

			
		}

	}

	// Restore value
	event.text = preText;

	if( !available.length && chat ){
		return false;
	}

	const required = [], normal = [], zeroes = [];

	available = available.filter(el => el.numTargets === maxnr || el.numTargets === -1);

	if( chat ){

		for( let text of available ){

			if( text.chat === this.Chat.required )
				required.push(text);

		}

		if( required.length )
			available = required;

	}else{

		for( let text of available ){

			if( text.weight >= this.WEIGHT_REQUIRED )
				required.push(text);
			else if( text.weight <= 0 )
				zeroes.push(text);
			else
				normal.push(text);

		}

		if( required.length )
			available = required;
		else if( normal.length )
			available = normal;
		else
			available = zeroes;

	}


	return weightedRand( available, item => {

		let chance = item.conditions.length;
		chance *= Math.max(1,item.numTargets);
		chance *= item.weight;
		if( chance < 0.01 )
			chance = 0.01;
		return chance;

	});

};

Text.actionFallbackText = new Text({
	text : "%S used %action on %T..."
});
Text.actionChargeFallbackText = new Text({
	text : "%S charges %action at %T..."
});

Text.runFromLibrary = function( event, debug = false ){

	game.lockPlayersAndRun(() => {
		
		// Note: shallow clone
		const evt = event.clone();
		evt.target = toArray(evt.target);

		// Each event needs a target. This is a fallback.
		if( !evt.target.length )
			evt.target = [game.players[0]];

		evt.target = evt.target.slice();
		let t = evt.target;
		// Try to trigger a text on each player
		while( t.length ){

			let text = this.getFromEvent( evt, debug );
			// No text for this person
			if( !text ){

				// Action used needs to have a text, we'll create a template one
				if( evt.type === GameEvent.Types.actionUsed && evt.action && !evt.action.hidden ){
					Text.actionFallbackText.run(event);
					console.error("Had to use a fallback for ", evt);
				}
				if( evt.type === GameEvent.Types.actionCharged && evt.action && !evt.action.hidden )
					Text.actionChargeFallbackText.run(evt);
				t.shift();

			}else{

				text.run(evt);
				
				let nt = text.numTargets;
				if( nt === -1 )
					nt = t.length;
				t.splice(0,nt);

				// Only allows one text per action
				if( text.chat )
					break;

			}

		}

		if( this.CheckAllPlayerChatEvents.includes(event.type) || this.IndividualTargetsEvents.includes(event.type) ){
			
			const targetsOnly = this.IndividualTargetsEvents.includes(event.type);

			// Players that should count as sender
			const players = targetsOnly ? [event.sender] : game.getEnabledPlayers();
			const targets = game.getEnabledPlayers();
			const evt = event.clone();
			evt.type = GameEvent.Types.textTrigger;
			if( !evt.custom )
				evt.custom = {};
			evt.custom.original = event.clone();
			evt.custom.original.text = null;		// The code above will attach a text to this, we'll need to remove it

			for( let player of players ){

				let preSender = evt.sender, preTarget = evt.target;
				evt.sender = player;
				evt.raise();
				
				const pl = targets.slice();
				shuffle(pl);
				for( let t of pl ){

					if( t === player )
						continue;

					evt.target = t;
					const text = this.getFromEvent(evt);
					if( text ){

						text.run(evt);
						break;

					}

				}

				// Restore original sender
				evt.sender = preSender;
				evt.target = preTarget;

			}
			
		}


	});

}

// Weight templates
Text.Weights = {
	default : 1,
	high : 2,
	max : 6
};

Text.Chat = {
	none : 0,
	optional : 1,
	required : 2,
};

// Events that should check all players for chats
Text.CheckAllPlayerChatEvents = [
	GameEvent.Types.battleEnded,
	GameEvent.Types.battleStarted,
];

// Similar to above, but doesn't change the sender, only running with sender against each individual player until a working text is found
Text.IndividualTargetsEvents = [
	GameEvent.Types.playerFirstTurn
];

export default Text;