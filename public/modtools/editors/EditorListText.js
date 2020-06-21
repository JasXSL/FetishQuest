import Text from '../../classes/Text.js';
import Window from '../WindowManager.js';

// this = window
export default function(){

	//console.log("Adding text list", this, this.asset);

	const db = window.mod.mod.texts;

	let html = '<input type="button" class="new" value="New" />';
	
	html += '<table class="selectable autosize">';
	
	html += '<tr>';		
		html += '<th>Id</th>';
		html += '<th>Chat</th>';
		html += '<th>Enabled</th>';
		html += '<th>Debug</th>';
		html += '<th>Conditions</th>';
		html += '<th>Chat P Conds</th>';
		html += '<th>Audio Kits</th>';
		html += '<th>Always Output</th>';
		html += '<th>Armor Slot</th>';
		html += '<th>Chat Reuse</th>';
		html += '<th>Hitfx</th>';
		html += '<th>Meta Tags</th>';
		html += '<th>Num Targs</th>';
		html += '<th>Text</th>';
		html += '<th>TurnTags</th>';
		html += '<th>Weight</th>';
	html += '</tr>';		

	for( let asset of db ){
		const tx = Text.loadThis(asset);
		html += '<tr data-id="'+esc(tx.id)+'">';		
			html += '<td>'+esc(tx.id)+'</td>';
			html += '<td>'+esc(tx.chat)+'</td>';
			html += '<td>'+esc(tx.en ? 'YES' : '')+'</td>';
			html += '<td>'+esc(tx.debug ? 'YES' : '')+'</td>';
			html += '<td>'+esc(tx.conditions.map(el => el.label).join(', '))+'</td>';
			html += '<td>'+esc(tx.chatPlayerConditions.map(el => el.label).join(', '))+'</td>';
			html += '<td>'+esc(tx.audiokits.map(el => el.label).join(', '))+'</td>';
			html += '<td>'+esc(tx.alwaysOutput ? 'YES' : '')+'</td>';
			html += '<td>'+esc(tx.armor_slot)+'</td>';
			html += '<td>'+esc(tx.chat_reuse ? 'YES' : '')+'</td>';
			html += '<td>'+esc(tx.hitfx.map(el => el.label).join(', '))+'</td>';
			html += '<td>'+esc(tx.metaTags.join(', '))+'</td>';
			html += '<td>'+esc(tx.numTargets)+'</td>';
			html += '<td>'+esc(tx.text)+'</td>';
			html += '<td>'+esc(tx.turnTags.join(', '))+'</td>';
			html += '<td>'+esc(tx.weight)+'</td>';
		html += '</tr>';		
	}

	
	html += '</table>';
	this.setDom(html);

	this.dom.querySelectorAll('tr[data-id]').forEach(el => el.onclick = event => {
		window.mod.buildAssetEditor("texts", event.currentTarget.dataset.id);
	});

	this.dom.querySelector('input.new').onclick = event => {
		
		const text = new Text({
			text : 'New Text'
		});
		window.mod.mod.texts.push(text.save("mod"));
		window.mod.setDirty(true);
		window.mod.buildAssetEditor("texts", text.id);

		Window.rebuildWindowsByTypeAndId("Database", "texts");

	};

};



