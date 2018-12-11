import Generic from './helpers/Generic.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import Player from './Player.js';
import Asset from './Asset.js';
import stdTag from '../libraries/stdTag.js';
/*
	List of tags you can use:
	GENERIC
		%leftright - left or right at random
		%groin | %crotch - Synonym for groin/crotch
		%cum - Synonym for cum
		%couple - Synonym for couple, few, handful
		%thrusting - thrusting/pounding/humping
	TARGET PREFIXED - These are prefixed with 
			%T : Target 
			%T2... : Additional targets
			%S for sender
			%RtagName for turntag sender, ex %Rspanked - Targets the player that applied the "spanked" turntag. Make sure to use the proper TT conditions for these to work
		%T - Player name
		%Tbreast - Synonym for breast
		%Tpenis - Synonym for penis
		%Tbutt - Synonym for butt
		%Tpsize, %Tbsize, %Trsize - Grants a size tag for penis, breasts, rear in that order. Must be preceded by a space, which gets removed if the size is average.
		%Tvagina - Synonym for vagina
		%Tgenitals - Automatically pick a genital synonym. Herms get picked at random, so only use this if it doesn't matter which part was targeted.
		%TclothUpper - Upperbody armor name
		%TclothLower - Lowerbody armor name
		%Thead - Headgear name
		%Tgear - Mainhand name
		%Trace - Species name of player
		%Tgroin - Same as %groin
		%The, %Thim, %This - Player pronouns
		


*/
class Text extends Generic{

	constructor(...args){
		super(...args);

		this.text = '';
		this.conditions = [];
		this.alwaysAuto = false;		// Shows this text regardless of if dm writes texts is enabled
		this.numTargets = 1;			// How many targets this text is meant for. Not a condition because we need to sort on it
		this.debug = false;
		this.alwaysOutput = false;		// Ignores the text backlogging and outputs this text immediately
		this.turnTags = [];				// Sets tags that persist until the next text is received or the current turn ends
		this.audiokits = [];			// IDs of audio kits. Can also be a string, which gets cast to an array on load. You can also use soundkits as a synonym
		this.armor_slot = '';				// Trigger armor hit sound on this slot, use Asset.Slots
		this._tt_multiplier = 1;			// Set to true after rebase if at least one condition is of the type Condition.Types.textTag
		this.load(...args);
	}

	load(data){
		if( data.soundkits )
			data.audiokits = data.soundkits;
		if( typeof data.audiokits === "string" )
			data.audiokits = [data.audiokits];
		this.g_autoload(data);
		if( this.numTargets < 1 )
			this.numTargets = 1;
	}

	rebase(){
		this.conditions = Condition.loadThese(this.conditions, this);

		// Scan conditions for text tag conditions. These are used in weighting.
		for( let condition of this.conditions ){
			if( this.conditionHasTextTag(condition) )
				break;
		}

		for( let sound of this.audiokits ){
			if( !glib.audioKits[sound] )
				console.error("AudioKit not found", sound);
		}
	}

	save(full){
		return {
			text : this.text,
			conditions : Condition.saveThese(this.conditions),
			alwaysAuto : this.alwaysAuto,
			numTargets : this.numTargets,
			debug : this.debug,
			alwaysOutput : this.alwaysOutput,
			turnTags : this.turnTags,
			audiokits : this.audiokits,
			armor_slot : this.armor_slot,
		};
	}
	

	/* Checks if a condition involves a textTag, in which case it should get a higher priority */
	conditionHasTextTag( cond ){

		let isArr = Array.isArray(cond);
		if( !isArr )
			cond = [cond];

		for( let c of cond ){
			if( c.type === Condition.Types.textTag ){
				if( isArr )
					this._tt_multiplier = 2;
				else{
					this._tt_multiplier = 6;
					return true;
				}
			}
		}
		return false;
		
	}

	// Converts tags for a specific player
	targetTextConversion(input, prefix, player){

		if( !player || player.constructor !== Player )
			return input;

		
		input = input.split(prefix+'bsize').join(player.getBreastSizeTag());
		input = input.split(prefix+'psize').join(player.getPenisSizeTag());
		input = input.split(prefix+'rsize').join(player.getButtSizeTag());
		
		let synonyms = ['boob', 'tit', 'breast'];
		input = input.split(prefix+'breast').join(synonyms[Math.floor(Math.random()*synonyms.length)]);
		synonyms = ['penis', 'dong', 'cock', 'member'];
		input = input.split(prefix+'penis').join(synonyms[Math.floor(Math.random()*synonyms.length)]);
		synonyms = ['butt', 'rear', 'behind'];
		input = input.split(prefix+'butt').join(synonyms[Math.floor(Math.random()*synonyms.length)]);


		// These belong together
		synonyms = ['vagina', 'pussy', 'cunt'];
		input = input.split(prefix+'vagina').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		// Check if male here, otherwise we can reuse
		if( player.hasTag(stdTag.penis) )
			synonyms = ['penis', 'dong', 'cock', 'member'];
		input = input.split(prefix+'genitals').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		// Clothes
		let c = player.getEquippedAssetsBySlots([Asset.Slots.upperbody]);
		input = input.split(prefix+'clothUpper').join(c.length ? c[0].name : 'Outfit');
		
		c = player.getEquippedAssetsBySlots([Asset.Slots.lowerbody]);
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

	// Main entrypoint
	run( event, returnResult = false ){

		let text = this.text;
		text = text.split('%leftright').join(Math.random()<0.5 ? 'left' : 'right');
		let synonyms = ['groin', 'crotch'];
		text = text.split('%groin').join(synonyms[Math.floor(Math.random()*synonyms.length)]);
		text = text.split('%crotch').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		synonyms = ['cum', 'spunk', 'jizz'];
		text = text.split('%cum').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		synonyms = ['couple', 'few', 'handful'];
		text = text.split('%couple').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		synonyms = ['pounding', 'thrusting', 'humping'];
		text = text.split('%thrusting').join(synonyms[Math.floor(Math.random()*synonyms.length)]);

		
		if( event.target ){

			let t = event.target;
			if( !Array.isArray(event.target) )
				t = [t];
			for( let i = t.length-1; i>=0; --i ){

				let prefix = '%T';
				if( i )
					prefix = prefix+(i+1);	// %T2, %T3 etc
				text = this.targetTextConversion(text, prefix, t[i]);

				// Add any previous turntag senders
				for( let tag of t[i]._turn_tags ){
					let tText = tag.tag;
					let tSender = tag.s;
					text = this.targetTextConversion(text, "%R"+tText, tSender);
				}

				t[i]._turn_tags = [];
				t[i].addTurnTags(this.turnTags, event.sender);
				
			}

		}
		if( event.sender )
			text = this.targetTextConversion(text, '%S', event.sender);

		if( event.asset )
			text = text.split('%asset').join(event.asset.name);

		if( event.action )
			text = text.split('%action').join(event.action.name);

		if( returnResult )
			return text;
		
		let audio;
		if( this.audiokits.length ){
			let kits = shuffle(this.audiokits.slice());
			for( let kit of kits ){
				let kd = glib.audioKits[kit];
				if( !kd )
					continue;
				if( Condition.all(kd.conditions, event) )
					audio = {id:kit, slot:this.armor_slot};
				
			}
			
		}

		let targ = event.target;
		if( Array.isArray(event.target) )
			targ = event.target[0];
		game.ui.addText(
			text, 
			event.type, 
			event.sender ? event.sender.id : undefined,
			targ ? targ.id : undefined,
			'rpText',
			event.type === GameEvent.Types.actionUsed || this.alwaysOutput,
			audio
		);

	}

	// Validate conditions
	validate( event, debug ){

		let targets = Array.isArray(event.target) ? event.target : [event.target];
		if( targets.length < this.numTargets )
			return false;

		if( !debug )
			debug = this.debug;

		return Condition.all(this.conditions, event, debug );

	}

}

// Shuffles and triggers a random text from available texts
// Returns the text that triggered, if any
Text.getFromEvent = function( event ){

	let available = [];
	let texts = glib.texts;

	

	for( let text of texts ){
		if( (!game.dm_writes_texts || text.alwaysAuto) && text.validate(event) )
			available.push(text);
	}

	if( !available.length )
		return false ;

	return weightedRand( available, item => {
		let chance = item.conditions.length;
		chance *= Math.max(1,item.numTargets);
		chance *= item._tt_multiplier;
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
			t.splice(0,text.numTargets);
		}
		event = event.clone();
		event.target = t.slice();
	}


}

GameEvent.on(GameEvent.Types.all, event => {
	if( event.type === GameEvent.Types.actionUsed && event.action.no_use_text )
		return;
	Text.runFromLibrary(event);
});

export default Text;