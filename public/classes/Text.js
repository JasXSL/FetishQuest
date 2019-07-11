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

	TARGET PREFIXED - These are prefixed with 
			%T : Target 
			%T2... : Additional targets
			%S for sender
			%RtagName for turntag sender, ex %Rspanked - Targets the player that applied the "spanked" turntag. Make sure to use the proper TT conditions for these to work
		%T - Player name
		%Tpsize, %Tbsize, %Trsize - Grants a size tag for penis, breasts, rear in that order. Must be preceded by a space, which gets removed if the size is average.
		%Tgenitals - Automatically pick a genital synonym. Herms get picked at random, so only use this if it doesn't matter which part was targeted.
		%TclothUpper - UpperBody armor name
		%TclothLower - LowerBody armor name
		%Thead - Headgear name
		%Tgear - Mainhand name
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
	['breast', 'boob', 'tit', 'breast', 'teat'],
	['penis', 'dong', 'cock', 'member'],
	['vagina', 'pussy', 'cunt'],
	['butt', 'rear', 'behind'],
	['groin', 'crotch'],
	['around', 'about'],
	['start', 'begin'],
	['into', 'inside'],
	['rapidly','hastily','promptly','swiftly'],
	['slither','slip','slink','wiggle'],
	['rough','hard'],
];

class Text extends Generic{

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
		this.chat = 0;					// 0 = no chat, 1 = casual chat (has a built in cooldown), 2 = required chat
		this.chatPlayerConditions = [];	// These conditions are run on each player to see if they can say this. Only usable when chat is true
										// Both target and sender are the same player. You generally want at least "targetIsX" in here when using a text.

		this._chatPlayer = null;		// Cache of the chat player tied to this. Only set on a successful chat

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
		this.conditions = Condition.loadThese(this.conditions, this);
		this.chatPlayerConditions = Condition.loadThese(this.chatPlayerConditions, this);
		for( let sound of this.audiokits ){
			if( !glib.audioKits[sound] )
				console.error("AudioKit not found", sound, "in", this);
		}
		this.hitfx = HitFX.loadThese(this.hitfx);
	}

	save(full){
		return {
			text : this.text,
			conditions : Condition.saveThese(this.conditions, full),
			numTargets : this.numTargets,
			debug : this.debug,
			alwaysOutput : this.alwaysOutput,
			turnTags : this.turnTags,
			audiokits : this.audiokits,
			armor_slot : this.armor_slot,
			weight : this.weight,
			hitfx : HitFX.saveThese(this.hitfx),
			chat : this.chat,
			chatPlayerConditions : Condition.saveThese(this.chatPlayerConditions),
			metaTags : this.metaTags,
		};
	}
	

	// Converts tags for a specific player
	targetTextConversion(input, prefix, player, event){

		if( !player || player.constructor !== Player )
			return input;

		
		input = input.split(prefix+'bsize').join(player.getBreastSizeTag());
		input = input.split(prefix+'psize').join(player.getPenisSizeTag());
		input = input.split(prefix+'rsize').join(player.getButtSizeTag());
		
		
		let synonyms = ['vagina', 'pussy', 'cunt'];
		// Check if male here, otherwise we can reuse
		if( player.hasTag(stdTag.penis) )
			synonyms = ['penis', 'dong', 'cock', 'member'];
		input = input.split(prefix+'genitals').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		// Clothes
		let c = player.getEquippedAssetsBySlots([Asset.Slots.upperBody]);			
		// If an item was just stripped in the event (usually Action use), you can use that one here
		if( !c.length && event.wrapperReturn && event.wrapperReturn.armor_strips[player.id] && event.wrapperReturn.armor_strips[player.id][Asset.Slots.upperBody] )
			c.push(event.wrapperReturn.armor_strips[player.id][Asset.Slots.upperBody]);
		
		input = input.split(prefix+'clothUpper').join(c.length ? c[0].name : 'Outfit');
		
		// Same as above but lowerBody
		c = player.getEquippedAssetsBySlots([Asset.Slots.lowerBody]);
		if( !c.length && event.wrapperReturn && event.wrapperReturn.armor_strips[player.id] && event.wrapperReturn.armor_strips[player.id][Asset.Slots.lowerBody] )
			c.push(event.wrapperReturn.armor_strips[player.id][Asset.Slots.lowerBody]);
		input = input.split(prefix+'clothLower').join(c.length ? c[0].name : 'Outfit');
		
		c = player.getEquippedAssetsBySlots([Asset.Slots.head]);
		input = input.split(prefix+'head').join(c.length ? c[0].name : 'Headpiece');

		c = player.getEquippedAssetsBySlots([Asset.Slots.hands]);
		input = input.split(prefix+'gear').join(c.length ? c[0].name : 'Gear');

		input = input.split(prefix+'race').join(player.species ? player.species.toLowerCase() : 'combatant');

		synonyms = ['groin', 'crotch'];
		input = input.split(prefix+'groin').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		let pronouns = ['he', 'him', 'his'];
		for( let p of pronouns )
			input = input.split(prefix+p).join(player.getPronoun(p));

		// needs to be last
		input = input.split(prefix).join(player.getColoredName());

		return input;
	}

	// Takes replaces all occurences of a %synonym with a random one from synonyms 
	// Only useful for direct synonyms. Not usable when the tag is not the synonym, like %leftright
	_replaceArray(text, synonyms){
		for( let synonym of synonyms ){
			let esc = ("%"+synonym).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
			let spl = text.split(new RegExp('('+esc+')', 'g'));
			for( let i in spl ){
				let t = spl[i];
				if( t.startsWith("%") ){
					t = t.substring(1);
					if( ~synonyms.indexOf(t) ){
						spl[i] = randElem(synonyms);
					}
				}
			}
			text = spl.join('');
		}
		return text;
	}

	// Main entrypoint
	run( event, returnResult = false ){

		// Helper functions
		let text = this.text;
		text = text.split('%leftright').join(Math.random()<0.5 ? 'left' : 'right');
		for( let block of SYNONYMS )
			text = this._replaceArray(text, block);
			
		if( event.target ){

			let t = event.target;
			if( !Array.isArray(event.target) )
				t = [t];
			for( let i = t.length-1; i>=0; --i ){

				let prefix = '%T';
				if( i )
					prefix = prefix+(i+1);	// %T2, %T3 etc
				text = this.targetTextConversion(text, prefix, t[i], event);

				// Add any previous turntag senders
				for( let tag of t[i]._turn_tags ){
					let tText = tag.tag;
					let tSender = tag.s;
					text = this.targetTextConversion(text, "%R"+tText, tSender, event);
				}

				t[i]._turn_tags = [];
				t[i].addTurnTags(this.turnTags, event.sender);
				
			}

		}
		if( event.sender )
			text = this.targetTextConversion(text, '%S', event.sender, event);

		if( event.asset )
			text = text.split('%asset').join(event.asset.name);

		if( event.action )
			text = text.split('%action').join(event.action.getName());

		if( returnResult )
			return text;
		
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
		for( let fx of this.hitfx ){
			for( let targ of targs ){
				game.renderer.playFX(event.sender, targ, fx, this.armor_slot, true);
				if( fx.once )
					break;
			}
		}

		let targ = event.target;
		if( Array.isArray(event.target) )
			targ = event.target[0];
		
		if( this.chat ){
			if( this._chatPlayer ){
				this._chatPlayer.onChatUsed(this.id);
				game.speakAs( this._chatPlayer.id, text, false );
			}
		}
		else{

			game.ui.addText(
				text, 
				event.type, 
				event.sender ? event.sender.id : undefined,
				targ ? targ.id : undefined,
				'rpText',
				event.type === GameEvent.Types.actionUsed || this.alwaysOutput,
			);

			
			// Raise a text trigger event
			const evt = event.clone();
			evt.type = GameEvent.Types.textTrigger;
			evt.text = this;
			if( !evt.custom )
				evt.custom = {};
			evt.custom.original = event;
			
			evt.raise();
					
		}

	}

	// Validate conditions
	validate( event, debug, chatPlayer ){

		if( this.debug )
			console.debug("Validating", this, "against", event);

		// Temporarily set. The proper set is after cloning in Text.getFromEvent
		if( event.text )
			event.text._chatPlayer = chatPlayer;	

		// Chat already used by this player
		if( this.chat && chatPlayer && chatPlayer._used_chats[this.id] )
			return false;

		let targets = Array.isArray(event.target) ? event.target : [event.target];
		if( targets.length < this.numTargets )
			return false;

		// If this is a chat, we need to check who said it by validating chat player conditions
		if( this.chat && this.chatPlayerConditions.length ){
			const evt = event.clone();
			evt.sender = evt.target = chatPlayer;
			evt.text = this;
			if( !Condition.all(this.chatPlayerConditions, evt) )
				return false;
		}

		

		if( !debug )
			debug = this.debug;

		if(!Condition.all(this.conditions, event, debug ))
			return false;

		return true;

	}

}

Text.SYNONYMS = SYNONYMS;
// Shuffles and triggers a random text from available texts
// Returns the text that triggered, if any
Text.getFromEvent = function( event ){

	let available = [];
	let texts = glib.texts;


	let testAgainst = [false];	// This is only used on chats
	if( event.type === GameEvent.Types.textTrigger )
		testAgainst = game.players;

	const chat = event.type === GameEvent.Types.textTrigger;

	// max nr targets text available
	let maxnr = 1;
	for( let text of texts ){
		for( let p of testAgainst ){
			if( 
				Boolean(text.chat) === chat && 
				(!text.chat || !event.sender || !event.sender.hasUsedChat(text.id) ) &&
				text.validate(event, false, p) &&
				(Boolean(text.chat) === Boolean(event.type === GameEvent.Types.textTrigger))
			){
				const id = text.id;
				text = text.clone();
				text.id = id;			// ID isn't saved on text (regenerated each load). So when cloning we have to re-apply it
				if( p )
					text._chatPlayer = p;
				available.push(text);
				if( text.numTargets > maxnr )
					maxnr = text.numTargets;
			}
		}
	}

	if( !available.length )
		return false ;
		
	available = available.filter(el => el.numTargets === maxnr || el.numTargets === -1);

	if( chat ){
		const required = [];
		for( let text of available ){
			if( text.chat === this.Chat.required )
				required.push(text);
		}
		if( required.length )
			available = required;
		else if( !event.sender.canOptionalChat() )		//  If there's no required chats available, make sure the player can chat already
			available = [];
	}

	return weightedRand( available, item => {
		let chance = item.conditions.length;
		chance *= Math.max(1,item.numTargets);
		chance *= item.weight;
		return chance;
	});

};

Text.actionFallbackText = new Text({
	text : "%S used %action on %T..."
});
Text.actionChargeFallbackText = new Text({
	text : "%S charges %action at %T..."
});

Text.runFromLibrary = function( event ){

	let t = event.target;
	if( !Array.isArray(t) )
		t = [t];
	t = t.slice();

	// Try to trigger a text on each player
	while( t.length ){

		let text = this.getFromEvent( event );

		// No text for this person
		if( !text ){
			// Action used needs to have a text, we'll create a template one
			if( event.type === GameEvent.Types.actionUsed && event.action && !event.action.hidden )
				Text.actionFallbackText.run(event);
			if( event.type === GameEvent.Types.actionCharged && event.action && !event.action.hidden )
				Text.actionChargeFallbackText.run(event);
			t.shift();
		}else{
			text.run(event);
			let nt = text.numTargets;
			if( nt === -1 )
				nt = t.length;
			t.splice(0,nt);
			// Only allows one text per action
			if( text.chat )
				break;
		}

		event = event.clone();
		event.target = t.slice();

	}


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

GameEvent.on(GameEvent.Types.all, event => {
	if( event.type === GameEvent.Types.actionUsed && event.action.no_use_text )
		return;
	Text.runFromLibrary(event);
});

export default Text;