import Text from '../../classes/Text.js';
import Asset from '../../classes/Asset.js';
import HelperTags from './HelperTags.js';
import Player from '../../classes/Player.js';
import stdTag from '../../libraries/stdTag.js';
import GameEvent from '../../classes/GameEvent.js';
import HelperAsset from './HelperAsset.js';
import * as EditorCondition from './EditorCondition.js';
import * as EditorAudioKit from './EditorAudioKit.js';
import * as EditorHitFX from './EditorHitFX.js';

const DB = 'texts',
	CONSTRUCTOR = Text
;

// Asset editor
export function asset(){

	const modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();

	// If a text is parented to something, it should fall outside of the main DB
	if( asset._mParent )
		dummy.en = asset.en = false;

	this.name = dummy.text.substr(0, 16)+'...';
	this.updateTitle();

	let html = '';

	html += 'Text:<br /><textarea class="large saveable" name="text">'+esc(dummy.text, true)+'</textarea><br />';
	html += '<span class="textPreview"></span><br /><br />';

	if( !asset._mParent )
		html += '<label>Enabled: <input type="checkbox" class="saveable" name="en" value="1" '+(dummy.en ? 'checked' : '')+' /></label><br />';
	html += 'Nr Targets: <input type="number" class="saveable" name="numTargets" min=-1 step=1 value="'+dummy.numTargets+'" /><br />';
	html += 'Weight <span class="valueExact"></span>: <input type="range" class="saveable" name="weight" min=0 max=10 step=1 value="'+dummy.weight+'" /><br />';

	html += 'Conditions: <div class="conditions"></div>';

	html += 'Condition templates:<div>'
		html += '<input type="button" value="Generic Action" class="template" />';
		html += '<input type="button" value="Any on Humanoid" class="template" />';
		html += '<input type="button" value="Beast on Humanoid" class="template" />';
		html += '<input type="button" value="Humanoid on Humanoid" class="template" />';
		html += '<input type="button" value="Humanoid on Beast" class="template" />';
	html += '</div>';

	html += 'Turn Tags: <div name="turnTags">'+HelperTags.build(dummy.turnTags)+'</div>';
	html += 'Meta Tags: <div name="metaTags">'+HelperTags.build(dummy.metaTags)+'</div>';

	html += 'Chat: <select name="chat" class="saveable">';
		html += '<option value="0">No</option>';
		html += '<option value="1" '+(dummy.chat === 1 ? 'selected' : '')+'>Optional</option>';
		html += '<option value="2" '+(dummy.chat === 2 ? 'selected' : '')+'>Required</option>';
	html += '</select>';

	// Things that should only show if this is a chat
	html += '<div class="chatSub hidden editorBox">';
		html += 'Chat Player Conditions: <div class="chatPlayerConditions"></div>';
		html += '<label>Reuse chat: <input type="checkbox" value="1" name="chat_reuse" /></label>';
	html += '</div>';

	// Things that should only show if this isn't a chat
	html += '<div class="nonchatSub editorBox">';
		html += 'Armor slot: <select name="armor_slot" class="saveable">';
			html += '<option value="">NONE</option>';
			for( let i in Asset.Slots )
				html += '<option value="'+i+'" '+(dummy.armor_slot === i ? 'selected' : '')+'>'+Asset.Slots[i]+'</option>';
		html += '</select><br />';

		html += 'Audio Kits:<br />';
		html += '<div class="audiokits"></div>';
		
		html += 'HitFX:<br />';
		html += '<div class="hitfx"></div>';
	html += '</div>';


	html += '<label>Debug: <input type="checkbox" class="saveable" name="debug" value="1" '+(dummy.debug ? 'checked' : '')+' /></label><br />';
	

	this.setDom(html);

	// Templating
	this.dom.querySelectorAll("input.template").forEach(el => el.onclick = event => {

		// All template conds, pressing a template removes all these and adds only the ones for that template
		const allConds = [
			'actionHit',
			'eventIsActionUsed',
			'targetNotBeast',
			'senderNotBeast',
			'senderBeast',
			'targetBeast'
		];
		// ActionHit and eventIsActionUsed are given
		const templates = {
			'Generic Action' : [],
			'Any on Humanoid' : ['targetNotBeast'],
			'Beast on Humanoid' : ['senderBeast', 'targetNotBeast'],
			'Humanoid on Humanoid' : ['senderNotBeast', 'targetNotBeast'],
			'Humanoid on Beast' : ['senderNotBeast', 'targetBeast'],
		};

		let type = el.value;
		if( !templates[type] )
			return;

		let tags = ['actionHit', 'eventIsActionUsed', ...templates[type]];

		// remove all tags
		if( Array.isArray(asset.conditions) ){
			asset.conditions = asset.conditions.filter(cond => {
				if( allConds.includes(cond) )
					return false;
				return true;
			});

		}
		else
			asset.conditions = [];
		
		// add new
		asset.conditions.push(...tags);
		window.mod.setDirty(true);
		this.rebuild();

	});

	// SUBTABLES
	// condition
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));
	this.dom.querySelector("div.chatPlayerConditions").appendChild(EditorCondition.assetTable(this, asset, "chatPlayerConditions"));

	// audiokits
	this.dom.querySelector("div.audiokits").appendChild(EditorAudioKit.assetTable(this, asset, "audiokits"));
	// HitFX
	this.dom.querySelector("div.hitfx").appendChild(EditorHitFX.assetTable(this, asset, "hitfx"));

	// Make the chat/chatSub divs toggle based on setting this to chat
	const chatSelector = this.dom.querySelector("select[name=chat]");
	const updateChatOptions = () => {
		const isChat = parseInt(chatSelector.value) > 0;
		this.dom.querySelector("div.chatSub").classList.toggle("hidden", !isChat);
		this.dom.querySelector("div.nonchatSub").classList.toggle("hidden", isChat);
	};
	chatSelector.onchange = updateChatOptions;
	updateChatOptions();

	// Text display
	// Updates the display underneath the text where you can see a real world example
	const textEditor = this.dom.querySelector("textarea[name=text]");
	const updateTextDisplay = () => {

		const pSettings = {
			name : 'Attacker',
			species : 'dog',
			color : '#FAA',
			tags : [stdTag.penis, stdTag.vagina, stdTag.breasts, stdTag.plBigPenis, stdTag.plBigButt, stdTag.plBigBreasts],
			assets : [
				new Asset({name:'Breastplate', slots:[Asset.Slots.upperBody], equipped:true}),
				new Asset({name:'Ornate Crotchplate', slots:[Asset.Slots.lowerBody], equipped:true}),
				new Asset({name:'Whip', slots:[Asset.Slots.hands], equipped:true}),
			]
		};
		const attacker = new Player(pSettings);

		pSettings.name = 'Victim';
		pSettings.species = 'otter';
		pSettings.color = '#AFA';

		const victim = new Player(pSettings);

		pSettings.name = 'RP Victim';
		const rp = new Player(pSettings);
		pSettings.name = 'RP Second Victim';
		const rp2 = new Player(pSettings);

		
		
		const converted = new Text(asset);
		converted.text = textEditor.value.trim();
		const out = converted.run( new GameEvent({
			sender : attacker,
			target : [victim],
			custom : {
				rpTargets : [rp, rp2]
			}
		}), true );
		
		this.dom.querySelector("span.textPreview").innerHTML = stylizeText(out);

	};
	updateTextDisplay();
	textEditor.onkeyup = updateTextDisplay;


	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=turnTags]"), tags => {
		HelperTags.autoHandleAsset('turnTags', tags, asset);
	});
	HelperTags.bind(this.dom.querySelector("div[name=metaTags]"), tags => {
		HelperTags.autoHandleAsset('metaTags', tags, asset);
	});


	HelperAsset.autoBind( this, asset, DB );



};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['id', 'text', "conditions"], single, parented);
}


// listing
export function list(){

	//console.log("Adding text list", this, this.asset);
	const out = document.createElement('template');

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		['*id'] : true,
		['*text'] : true,
		['*chat'] : true,
		['*en'] : true,
		debug : true,
		['*conditions'] : tx => tx.conditions ? tx.conditions.map(el => el.label ? el.label : el).join(', ') : '',
		chatPlayerConditions : tx => tx.chatPlayerConditions ? tx.chatPlayerConditions.map(el => el.label).join(', ') : '',
		audiokits : tx => tx.audiokits ? tx.audiokits.map(el => el.label).join(', ') : '',
		alwaysOutput : true,
		armor_slot : true,
		chat_reuse : true,
		hitfx : tx => tx.hitfx ? tx.hitfx.map(el => el.label).join(', ') : '',
		metaTags : tx => (tx.metaTags || []).join(', '),
		numTargets : true,
		turnTags : tx => (tx.turnTags || []).join(', '),
		weight : true
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		text : "%S spanks %T!"
	}));

};


// Returns a help text
export function help(){

	let out = '';

	out += '<h3>Text:</h3>'+
		'<p>Reserved modifiers, do not use the following two characters as part of your text: <strong>% @</strong></p>'+
		'<p>This is the text to output into the main combat log. You can use % tags to be replaced by things from the game. Here is a list:'+
			'<ul>'+
				'<li>%T - Replaced with the name of the target of the event. Also used as a prefix for other tags. If more than 1 target exists, %T selects the first one, use %T1, %T2 etc for target 2 and 3.</li>'+
				'<li>%S - Replaced with the name of the sender of the event. Also used as a prefix for other tags.</li>'+
				'<li>%P - Used only in roleplays. RP player. See roleplay help for more info.</li>'+
				'<li>%She/%The - Pronoun of sender/target: he, she, it etc</li>'+
				'<li>%Shim/%Thim - Pronoun: him, her, it, etc</li>'+
				'<li>%Shis/%This - Pronoun: his, her, its, etc</li>'+
				'<li>%RturnTag - Name of the player who applied a turnTag to the first target of the event. Such as %Rspanked.</li>'+
				'<li>%Tpsize, %Tbsize, %Trsize (%S also) - Gets the size of player penis, breasts, or butt respectively.</li>'+
				'<li>%Tgenitals (also %S) - Gets the name of a genital the player has. Such as vagina or penis.</li>'+
				'<li>%TclothUpper (also %S) - Gets the name of the piece of clothing the player wears on their upper body.</li>'+
				'<li>%TclothLower (also %S) - Gets the name of the piece of clothing the player wears on their lower body.</li>'+
				'<li>%Tgear (also %S) - Gets the name of what the player holds in their hands.</li>'+
				'<li>%Trace (also %S) - Gets the species of the player.</li>'+
			'</ul>'+
		'</p>';

	out += '<p>Additionally you can put a % sign before any of these words and they\'ll be replaced by a synonym on the same row.</p>';
	out += '<ul>';
	for( let arr of Text.SYNONYMS ){
		out += '<li>'+esc(arr.join(', '))+'</li>';
	}
	out += '</ul>';

	out += '<h3>Modifiers:</h3>';
	out += '<p>Some tags have additional modifiers you can use.</p>';
	out += '<table>'+
		'<tr>'+
			'<th>Modifier</th>'+
			'<th>Example</th>'+
			'<th>Output</th>'+
			'<th>Description</th>'+
		'</tr>'+
		'<tr>'+
			'<td>!</td>'+
			'<td>%!The</td>'+
			'<td>He</td>'+
			'<td>Turns the first character uppercase.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>a</td>'+
			'<td>%S is %SaRace wearing %SaClothUpper</td>'+
			'<td>Jas is a lynx wearing an oversized hauberk.</td>'+
			'<td>Adds the prefix defined with a species or asset followed by the asset name. Note that "some" will be removed entirely.</td>'+
		'</tr>'+
	'</table>';

	out += '<h3>Mathvars</h3>';
	out += 'You can also add mathvars to your text, using the following syntaxes:';
	out += '<table>'+
		'<tr>'+
			'<th>Syntax</th>'+
			'<th>Examples</th>'+
			'<th>Explanation</th>'+
		'</tr>'+
		'<tr>'+
			'<td>@@mathvar_TargetConst[separator]</td>'+
			'<td>'+
				'@@rp_favoriteColorLocal_favoriteColor_Target0<br />'+
				'@@rp_favoriteColorLocal_favoriteColor_Set[ and ]<br />'+
				'@@rp_favoriteColorLocal_timesTickled_SetSum<br />'+
				'@@rp_favoriteColorLocal_timesTickled_SetNum<br />'+
			'</td>'+
			'<td>'+
				'The first example will look in the roleplay labeled "favoriteLocalColor" for the rpVar "favoriteColor". If found, it returns the value set on the event target.<br />'+
				'The second example will look in the same roleplay for ALL players that are set on the "favoriteColor" rpVar. It returns all values separated by " and ".<br />'+
				'The third example appends the word Sum to the Calculator target const. It goes through the "timesTickled" rpVar and returns a sum for all players.<br />'+
				'The fourth example appends the word Num to the Calculator target const. It goes through the "timesTickled" rpVar and returns the nr of players that have a value that isn\'t empty "".<br />'+
			'</td>'+
		'</tr>'+
		'<tr>'+
			'<td>@mathvar</td>'+
			'<td>'+
				'@rp_favoriteColorLocal_test<br />'+
			'</td>'+
			'<td>'+
				'Returns the value for the rp_favoriteColorLocal_test mathvar.<br />'+
			'</td>'+
		'</tr>'+
		'<tr>'+
			'<td>@mathvar_index_Tag[separator]</td>'+
			'<td>'+
				'@rp_favoriteColorLocal_favoriteColor_0_T<br />'+
				'@rp_favoriteColorLocal_favoriteColor_A_Trace[ or ]<br />'+
			'</td>'+
			'<td>'+
				'The first example will look in the roleplay labeled "favoriteLocalColor" for the rpVar "favoriteColor". If found, and if at least one player is set (has a non-empty value), returns their name, similar to %T for target.<br />'+
				'The second example will look in the same roleplay var for ALL players, returning their species separated by " or ".<br />'+
			'</td>'+
		'</tr>'+
		
	'</table>';
	out += '<p>Note: You can target any mathVar with these, not just roleplay. Open up a console in game and run game.getMathVars() for a list of vars. See the cheat sheet for more information about Calculator target constants you can use.</p>';


	out += '<h3>Enabled:</h3>'+
		'<p>Unchecking makes this text not trigger.</p>';

	out += '<h3>Nr targets:</h3>'+
		'<p>Some attacks may have multiple targets, set the nr of targets your text are written for here. You can use -1 for any combination of players.</p>';
	

	out += '<h3>Weight:</h3>'+
		'<p>Sets how rare the text should be. The higher the less rare. You might want to increase weight for actions with a lot of prerequisites.</p>';



	out += '<h3>Conditions:</h3>'+
		'<p>Whereas you can tie text to any game events you want, they\'re most usually tied to an action by using 3 conditions:'+
			'<ul>'+
				'<li>eventIsActionUsed: Ties the text to an action used event</li>'+
				'<li>actionHit: Only trigger if the action hit</li>'+
				'<li>action_actionName: A condition specific to the action you want to use. See more in the Conditions help menu.</li>'+
			'</ul>'+
			'Make sure you include any conditions that are needed for your text to make sense. Such as if your text mentions a knocked down player, you should add the knocked down condition.<br />'+
			'You can make use of the condition template buttons to add some commonly used conditions automatically.'+
		'</p>';

	out += '<h3>Turn tags:</h3>'+
		'<p>Turn tags are special tags (all beginning with tt_) that are set on a player when they are a victim of a text. These tags last until the start of the target\'s next turn, or they are the target of another text. An example is the tt_bent_over turn tag that should be used if your text involved bending someone over. You can then make a text that requires a bent over player by adding a condition for that turn tag.</p>';

	out += '<h3>Meta tags:</h3>'+
		'<p>Meta tags are some simple tags starting with me_ that describe your attack. It\'s used in certain effects, but more commonly in monster taunts.</p>';


	out += '<h3>Chat:</h3>'+
		'<p>Allows you to set this text to be something an NPC says instead of an action happening.</p>';

	out += '<h3>HitFX/AudioKits:</h3>'+
		'<p>HitFX selects a visual effect to play when the text triggers. AudioKits is similar, but only plays audio.</p>';

	out += '<h3>Weight:</h3>'+
		'<p>Sets how rare the text should be. The higher the less rare. You might want to increase weight for actions with a lot of prerequisites.</p>';

	out += '<h3>Chat player conditions:</h3>'+
		'<p>Shows up on chats only. Allows an NPC to say something when an action happens that they are not directly involved in. For an instance if you want all imps to say something when a player receives a wedgie. Then you use the senderIsImp (sender or target doesn\'t matter) chat player condition, and the normal condition metaWedgie.</p>';
	
	out += '<h3>Debug:</h3>'+
		'<p>Leave this off unless you want to slow down the gameplay. This will cause the console to start outputting debug whenever an event is raised saying why your text didn\'t trigger.</p>';

	
	
	
	
	

	return out;

};
