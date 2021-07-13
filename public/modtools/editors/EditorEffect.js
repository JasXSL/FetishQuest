import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import GameEvent from '../../classes/GameEvent.js';
import Generic from '../../classes/helpers/Generic.js';

import * as EditorCondition from './EditorCondition.js';

const DB = 'effects',
	CONSTRUCTOR = Effect;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = this.asset.asset || modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();


	let html = '';
	html += '<div class="labelFlex">';
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /></label>';
		html += '<label>Type: <select name="type" class="saveable">';
		for( let i in Effect.Types )
			html += '<option value="'+esc(Effect.Types[i])+'" '+(Effect.Types[i] === dummy.type ? 'selected' : '')+'>'+esc(i)+'</option>';
		html += '</select></label>';
		html += '<label>Don\'t multiply by stacks <input type="checkbox" class="saveable" name="no_stack_multi" '+(dummy.no_stack_multi ? 'checked' : '')+' /></label><br />';
		html += '<label>Debug <input type="checkbox" class="saveable" name="debug" '+(dummy.debug ? 'checked' : '')+' /></label><br />';
	html += '</div>';


	html += 'Targets: <div class="arrayPicker" name="targets">';
	for( let i in Wrapper.Targets )
		html += '<label>'+esc(i)+' <input type="checkbox" value="'+esc(Wrapper.Targets[i])+'" '+(~dummy.targets.indexOf(Wrapper.Targets[i]) ? 'checked' : '')+' /></label>';
	html += '</div>';


	html += 'Events: <div class="arrayPicker" name="events">';
	for( let i in GameEvent.Types )
		html += '<label>'+esc(i)+' <input type="checkbox" value="'+esc(GameEvent.Types[i])+'" '+(~dummy.events.indexOf(GameEvent.Types[i]) ? 'checked' : '')+' /></label>';
	html += '</div>';

	html += '<pre class="wrap typeDesc"></pre><br />';
	html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea><br />';


	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += 'Conditions: <div class="conditions"></div>';


	this.setDom(html);


	// Describe what the json editor data should look like
	const typeSelect = this.dom.querySelector("select[name=type]");
	const updateTypeDesc = () => {
		
		const typeDesc = this.dom.querySelector("pre.typeDesc"),
			type = typeSelect.value;

		
		typeDesc.innerText = Effect.TypeDescs[type] || "Unknown type";		

	};
	updateTypeDesc();
	typeSelect.addEventListener("change", updateTypeDesc);
	



	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions"));

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);





};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'type'], single);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*desc' : true,
		'*type' : true,
		'*data' : true,
		tags : true,
		targets : true,
		events : true,
		debug : true,
		no_stack_multi : true,
		conditions : a => a.conditions ? a.conditions.map(el => el.label).join(', ') : '',
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'effect_'+Generic.generateUUID(),
		desc : 'Deals 1 damage to auto target inheriting action damage type',
		type : Effect.Types.damage,
		targets : [Wrapper.TARGET_AUTO],
		data : {
			amount : 1
		}
	}));

};

