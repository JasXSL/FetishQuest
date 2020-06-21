import Text from '../../classes/Text.js';
import Asset from '../../classes/Asset.js';
import HelperTags from './HelperTags.js';
import Player from '../../classes/Player.js';
import stdTag from '../../libraries/stdTag.js';
import GameEvent from '../../classes/GameEvent.js';
import HelperAsset from './HelperAsset.js';

// this = window
export default function(){

	const modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById("texts", id),
		dummy = Text.loadThis(asset)
	;

	console.log(dummy);

	if( !asset )
		return this.close();

	this.name = asset.text.substr(0, 16)+'...';
	this.updateTitle();

	let html = '';

	html += 'Text:<br /><input type="text" class="large saveable" value="'+esc(dummy.text)+'" name="text" /><br />';
	html += '<span class="textPreview"></span><br /><br />';

	html += '<label>Enabled: <input type="checkbox" class="saveable" name="en" value="1" '+(dummy.en ? 'checked' : '')+' /></label><br />';
	html += 'Nr Targets: <input type="number" class="saveable" name="numTargets" min=-1 step=1 value="'+dummy.numTargets+'" /><br />';
	html += 'Weight: <input type="range" class="saveable" name="weight" min=0 max=10 step=1 value="'+dummy.weight+'" /><br />';

	html += 'Conditions: <div>Todo: Conditions listing here</div>';
	html += 'Turn Tags: <div name="turnTags">'+HelperTags.build(dummy.turnTags)+'</div>';
	html += 'Meta Tags: <div name="metaTags">'+HelperTags.build(dummy.metaTags)+'</div>';

	html += 'Chat: <select name="chat" class="saveable">';
		html += '<option value="0">No</option>';
		html += '<option value="1" '+(dummy.chat === 1 ? 'selected' : '')+'>Optional</option>';
		html += '<option value="2" '+(dummy.chat === 2 ? 'selected' : '')+'>Required</option>';
	html += '</select>';

	// Things that should only show if this is a chat
	html += '<div class="chatSub hidden">'
		html += 'Chat Player Conditions: <div></div>';
		html += '<label>Reuse chat: <input type="checkbox" value="1" name="chat_reuse" /></label>';
	html += '</div>';

	// Things that should only show if this isn't a chat
	html += '<div class="nonchatSub">';
		html += 'Armor slot: <select name="armor_slot">';
			html += '<option value="">NONE</option>';
			for( let i in Asset.Slots )
				html += '<option value="'+i+'" '+(dummy.armor_slot === i ? 'selected' : '')+'>'+Asset.Slots[i]+'</option>';
		html += '</select><br />';
		html += '<div>Todo: Audio kits listing</div>';
		html += '<div>Todo: HitFX listing</div>';
	html += '</div>';


	html += '<label>Debug: <input type="checkbox" class="saveable" name="debug" value="1" '+(dummy.debug ? 'checked' : '')+' /></label><br />';
	

	this.setDom(html);


	// Text display
	// Updates the display underneath the text where you can see a real world example
	const textEditor = this.dom.querySelector("input[name=text]");
	const updateTextDisplay = () => {

		const attacker = new Player({
			name : 'Attacker',
			species : 'dog',
			color : '#FAA',
			tags : [stdTag.penis, stdTag.vagina, stdTag.breasts, stdTag.plBigPenis, stdTag.plBigButt, stdTag.plBigBreasts],
			assets : [
				new Asset({name:'Breastplate', slots:[Asset.Slots.upperBody], equipped:true}),
				new Asset({name:'Crotchplate', slots:[Asset.Slots.lowerBody], equipped:true}),
				new Asset({name:'Whip', slots:[Asset.Slots.hands], equipped:true}),
			]
		});
		const victim = new Player({
			name : 'Victim',
			species : 'cat',
			color : '#AFA',
			tags : [stdTag.penis, stdTag.vagina, stdTag.breasts, stdTag.plBigPenis, stdTag.plBigButt, stdTag.plBigBreasts],
			assets : [
				new Asset({name:'Leather Shirt', slots:[Asset.Slots.upperBody]}),
				new Asset({name:'Leather Thong', slots:[Asset.Slots.lowerBody]}),
				new Asset({name:'Whip', slots:[Asset.Slots.hands], equipped:true}),
			]
		});

		const converted = new Text(asset);
		converted.text = textEditor.value.trim();
		const out = converted.run( new GameEvent({
			sender : attacker,
			target : victim
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


	HelperAsset.autoBind( this, asset, "texts" );



};



