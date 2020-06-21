import Window from '../WindowManager.js';
import Condition from '../../classes/Condition.js';

// this = window
export default function(){

	//console.log("Adding text list", this, this.asset);

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

	this.dom.querySelectorAll('tr[data-id]').forEach(el => el.onclick = event => {
		window.mod.buildAssetEditor("conditions", event.currentTarget.dataset.id);
	});

	this.dom.querySelector('input.new').onclick = event => {
		
		const asset = new Condition({
			label : 'newCondition',
			type : Condition.Types.tag,
			data : {tags:[]}
		});

		window.mod.mod.conditions.push(asset.save("mod"));
		window.mod.setDirty(true);
		window.mod.buildAssetEditor("conditions", asset.id);

		Window.rebuildWindowsByTypeAndId("Database", "conditions");

	};

};



