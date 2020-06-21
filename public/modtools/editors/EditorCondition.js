import HelperAsset from './HelperAsset.js';
import Condition from '../../classes/Condition.js';

const DB = 'conditions';

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = Condition.loadThis(asset)
	;

	console.log(asset, dummy);

	if( !asset )
		return this.close();


	let html = '';

	html += 'Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /><br />';
	html += 'Description: <input type="text" name="desc" class="saveable" value="'+esc(dummy.desc)+'" /><br />';
	html += 'Type: <select class="saveable" name="type">';
		for( let i in Condition.Types ){
			html += '<option value="'+i+'" '+(i === dummy.type ? 'selected' : '')+'>'+esc(Condition.Types[i])+'</option>';
		}
	html += '</select><br />';
	html += 'Targ nr: <input type="number" class="saveable" name="targnr" min=-1 step=1 value="'+esc(dummy.targnr)+'" /><br />';
	

	html += '<label>Caster <input type="checkbox" class="saveable" name="caster" '+(dummy.caster ? 'checked' : '')+' /></label>';
	html += '<label>Inverse <input type="checkbox" class="saveable" name="inverse" '+(dummy.inverse ? 'checked' : '')+' /></label>';
	html += '<label>Any Player <input type="checkbox" class="saveable" name="anyPlayer" '+(dummy.anyPlayer ? 'checked' : '')+' /></label>';
	html += '<label>Debug <input type="checkbox" class="saveable" name="debug" '+(dummy.debug ? 'checked' : '')+' /></label>';

	html += '<div class="data">';
		html += '<span class="description"></span>';
		html += '<textarea class="json" name="data">'+esc(JSON.stringify(dummy.data))+'</textarea>';
	html += '</div>';

	html += '<hr />';
	html += 'Subconditions: (Advanced)';
	html += '<div class="subConditions">'+
		'<div class="conditions"></div>'+
		'Min: <input type="number" class="saveable" name="min" min=-1 step=1 value="'+esc(dummy.min)+'" /> '+
		'Max: <input type="number" class="saveable" name="max" min=-1 step=1 value="'+esc(dummy.max)+'" /> '+
	'</div>';

	this.setDom(html);

	// Set asset tables
	this.dom.querySelector("div.subConditions div.conditions").appendChild(assetTable(this, asset, "conditions"));


	// Updates the description
	const dataDesc = this.dom.querySelector("div.data > span.description"),
		typeSelect = this.dom.querySelector("select[name=type]");
	const updateDataDesc = () => {
		dataDesc.innerText = Condition.descriptions[typeSelect.value];
	};
	updateDataDesc();
	typeSelect.onchange = updateDataDesc;

	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name ){
	return HelperAsset.linkedTable( win, modAsset, name, Condition, 'conditions', ['id', 'label', 'desc']);
}


// Listing
export function list(){

	const db = window.mod.mod.conditions;

	let html = '<input type="button" class="new" value="New" />';
	
	html += '<table class="selectable autosize">';
	
	html += '<tr>';		
		html += '<th>Id</th>';
		html += '<th>Label</th>';
		html += '<th>Subconditions</th>';
		html += '<th>Min</th>';
		html += '<th>Max</th>';
		html += '<th>Type</th>';
		html += '<th>Data</th>';
		html += '<th>Caster</th>';
		html += '<th>Targnr</th>';
		html += '<th>Inverse</th>';
		html += '<th>AnyPlayer</th>';
		html += '<th>Debug</th>';
	html += '</tr>';		

	for( let asset of db ){
		const a = Condition.loadThis(asset);
		html += '<tr data-id="'+esc(a.id)+'">';		
			html += '<td>'+esc(a.id)+'</td>';
			html += '<td>'+esc(a.label)+'</td>';
			html += '<td>'+esc(a.conditions.map(el => el.label).join(', '))+'</td>';
			html += '<td>'+esc(a.min)+'</td>';
			html += '<td>'+esc(a.max)+'</td>';
			html += '<td>'+esc(a.type)+'</td>';
			html += '<td>'+esc(JSON.stringify(a.data))+'</td>';
			html += '<td>'+esc(a.caster ? 'YES' : '')+'</td>';
			html += '<td>'+esc(a.targnr)+'</td>';
			html += '<td>'+esc(a.inverse ? 'YES' : '')+'</td>';
			html += '<td>'+esc(a.anyPlayer ? 'YES' : '')+'</td>';
			html += '<td>'+esc(a.debug ? 'YES' : '')+'</td>';
		html += '</tr>';		
	}

	
	html += '</table>';
	this.setDom(html);

	HelperAsset.bindList(this, DB);

};

