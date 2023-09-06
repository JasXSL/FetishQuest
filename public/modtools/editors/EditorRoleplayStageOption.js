import HelperAsset from './HelperAsset.js';

import * as EditorCondition from './EditorCondition.js';
import * as EditorGameAction from './EditorGameAction.js';
import * as EditorRoleplayStageOptionGoto from './EditorRoleplayStageOptionGoto.js';
import * as EditorRoleplayStage from './EditorRoleplayStage.js';
import * as EditorGraph from './EditorGraph.js';

import { RoleplayStageOption, RoleplayStageOptionGoto } from '../../classes/Roleplay.js';
import Generic from '../../classes/helpers/Generic.js';

export const DB = 'roleplayStageOption',
	CONSTRUCTOR = RoleplayStageOption,
	BLOCKTYPE = 'Reply'
;


export function nodeBlock( nodes ){

	nodes.addBlockType(BLOCKTYPE, {
		color:"#AFA", 
		width:'200px', 
		height:'50px', 
		onCreate : block => EditorGraph.onBlockCreate(block, DB, nodeBlockUpdate),
		onDelete : block => EditorGraph.onBlockDelete(block, DB, ['index']),
		onClick : (block, event) => EditorGraph.onBlockClick(DB, block, nodes),

	})
	.addInput('Gotos', 'Goto')
	.addInput('Direct', 'Stage');

}

// Connect our linked objects to target outputs
export function nodeConnect( asset, nodes ){

	EditorGraph.autoConnect( nodes, EditorRoleplayStageOptionGoto, "Goto", asset.index, BLOCKTYPE, asset.id, "Gotos" );
	EditorGraph.autoConnect( nodes, EditorRoleplayStage, "Stage", asset.direct, BLOCKTYPE, asset.id, "Direct", true );

}

export function nodeBuild( asset, nodes, root ){

	// Add the block
	const block = nodes.addBlock(BLOCKTYPE, asset.id, {x:asset._x, y:asset._y});
	nodeBlockUpdate(asset, block);

	// Add goto options
	EditorGraph.buildSubBlocks( nodes, asset.index, EditorRoleplayStageOptionGoto, root );
	// Note: direct is not needed because ALL stages are added in EditorRoleplay

}

export function nodeBlockUpdate( asset, block ){

	let out = '';
	out += '<div class="label important">';
		out += esc(asset.text || '[Continue]');
	out += '</div>';

	let properties = [];
	if( +asset.chat === RoleplayStageOption.ChatType.none )
		properties.push("SILENT");
	if( asset.shuffle )
		properties.push("SHUFFLE");
	if( asset.target_override && asset.target_override !== RoleplayStageOption.Target.sender )
		properties.push("Target: "+asset.target_override);
	if( properties.length ){
		out += '<div class="label unimportant">';
			out += esc(properties.join(", "));
		out += '</div>';
	}

	if( +asset.dice ){
		out += '<div class="label">';
			out += 'Roll '+Math.trunc(asset.dice);
		if( asset.dice_mod )
			out += '<br /><i>Mod: '+esc(asset.dice_mod)+'</i>';
		out += '</div>';
	}

	if( Array.isArray(asset.conditions) ){
		out += '<div class="label unimportant">';
			out += 'Conditions: '+esc(asset.conditions.join(", "));
		out += '</div>';
	}

	if( Array.isArray(asset.game_actions) ){
		out += '<div class="label unimportant">';
			out += esc(asset.game_actions.join(", "));
		out += '</div>';
	}

	
	block.setContent(out);

}


// Single asset editor
export function asset(){

	const 
		id = this.id,
		asset = this.asset.asset || mod.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset ){
		console.error("roleplayStageOption missing in window", this);
		return this.close();
	}

	let html = '';
	html += '<div class="labelFlex">';
	
		html += '<label>Text: <input type="text" name="text" class="saveable" value="'+esc(dummy.text)+'" /></label>';
		html += '<label>Output: <select name="chat" class="saveable">';
		for( let i in RoleplayStageOption.ChatType ){
			html += '<option value="'+esc(RoleplayStageOption.ChatType[i])+'" '+(dummy.chat === RoleplayStageOption.ChatType[i] ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';
		html += '<label>Shuffle Options: <input type="checkbox" name="shuffle" class="saveable" '+(dummy.shuffle ? 'checked' : '')+' /></label>';
		
		html += '<label>Target override: <select name="target_override" class="saveable">';
		for( let i in RoleplayStageOption.Target ){
			html += '<option value="'+esc(i)+'" '+(dummy.target_override === RoleplayStageOption.Target[i] ? 'selected' : '' )+'>'+esc(i)+'</option>';
		}
		html += '</select></label>';
		
		html += '<label>Dice Roll: <input type="number" step=1 min=0 name="dice" class="saveable" value="'+(dummy.dice || 0)+'" /></label>';
		html += '<label>Modifier: '+
			'<input type="text" name="dice_mod" class="saveable" value="'+esc(dummy.dice_mod)+'" />';
			html += '<div class="presets">Preset formulas for offensive/defensive checks:<br />'
			const presets = {
				ProPhys : 'se_BonPhysical-se_Lv',
				ProCorr : 'se_BonCorruption-se_Lv',
				ProArcane : 'se_BonArcane-se_Lv',
				DefPhys : 'se_SvPhysical-se_Lv',
				DefCorr : 'se_SvCorruption-se_Lv',
				DefArcane : 'se_SvArcane-se_Lv',
			};
			for( let label in presets )
				html += '<input type="button" value="'+label+'" data-formula="'+esc(presets[label])+'" />';
			html += '</div>';
		html += '</label>';

	html += '</div>';



	html += 'Goto Options: <div class="index"></div>';
	html += 'Goto Direct (Outliner only): <div class="direct"></div>';

	html += 'Game Actions: <div class="game_actions"></div>';
	html += 'Conditions: <div class="conditions"></div>';

	this.setDom(html);

	const modField = this.dom.querySelector("input[name=dice_mod]");
	this.dom.querySelectorAll("div.presets > input").forEach(el => el.onclick = event => {
		modField.value = event.currentTarget.dataset.formula;
		modField.dispatchEvent(new Event('change'));
	});

	// Conditions
	this.dom.querySelector("div.conditions").appendChild(EditorCondition.assetTable(this, asset, "conditions", false, false));
	this.dom.querySelector("div.game_actions").appendChild(EditorGameAction.assetTable(this, asset, "game_actions", false, false));
	this.dom.querySelector("div.index").appendChild(EditorRoleplayStageOptionGoto.assetTable(this, asset, "index", false, 2));
	this.dom.querySelector("div.direct").appendChild(EditorRoleplayStage.assetTable(this, asset, "direct", -1));


	HelperAsset.autoBind( this, asset, DB);

};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single, parented ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, [
		'id',
		'text',
		asset => {
			
			if( asset.index && asset.index.length ){ 

				return '-> '+asset.index.map(el => { 

					let data = mod.getAssetById('roleplayStageOptionGoto', el);
					let idx = '???';
					if( data ){
						idx = data.index;
						let stage = mod.getAssetById('roleplayStage', idx);
						if( stage ){
							idx = 's_'+stage.id;

							if( Array.isArray(stage.text) ){

								let text = mod.getAssetById('texts', stage.text[0]);
								if( text )
									idx = String(text.text).substr(0, 32)+'...';

							}

						}
					}
					return idx;

				}).join(' OR ');

			}
			return 'END';
		},
		asset => asset.game_actions ? asset.game_actions.length+' Actions' : 'NO GAME ACTIONS',
		asset => {
			for( let i in RoleplayStageOption.ChatType ){
				if( asset.chat === RoleplayStageOption.ChatType[i] )
					return i+' chat';
			}
			return 'Unknown chat type';
		}
	], single, parented);
}


export function help(){
	let out = '<h3>RoleplayStageOption</h3>';
	out += '<p>This is where you setup replies to roleplay NPC texts!</p>';

	out += '<h3>Fields</h3>';
	out += '<table>';
	out += 
		'<tr>'+
			'<td>Text</td>'+
			'<td>The text on the response button. You can use %S and %T here. Where %S is the player and %T the NPC. If you leave this empty, the game will set it to [Continue] and treat output as NONE.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Output</td>'+
			'<td>If set to default the player will output a chat bubble with the option text. Set it to none for options like [leave]</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Target Override</td>'+
			'<td>Lets you override who is considered the "target" for Conditions and dice roll modifier. By default, both target and sender are your active player.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Dice Roll</td>'+
			'<td>If nonzero, this becomes a dice roll option, and the players have to roll a d20 of at this value for success. Use the diceRoll* conditions in your goto options when routing the outcome.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Modifier</td>'+
			'<td>Mathematical formula that gives modifies the dice roll. Ex se_BonPhysical-se_Lv would give 1 to the player\'s dice roll per physical proficiency they have above their level. This value has its decimal places truncated. ta_ and se_ are both your active player unless overridden by Target Override.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Goto Options</td>'+
			'<td>Set a RoleplayStage target. The first viable one will be picked. This allows you to have a single response take the player to different Roleplay Stages based on conditions such as gender, stats, random chance etc.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Goto Direct</td>'+
			'<td>To speed things up, you can use directs instead of goto options. These will work the same as goto options with no conditions, and added to the end of the goto options list. This means that you\'ll never want to use more than one Goto Direct unless you also have shuffle enabled. Note: Goto direct can only be added to via the RP outliner.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>GameActions</td>'+
			'<td>Lets you trigger GameActions when the user selects this option.</td>'+
		'</tr>'+
		'<tr>'+
			'<td>Conditions</td>'+
			'<td>Allows you to set a condition for showing this option. Such as requiring a certain level of physical proficiency to intimidate etc. Target and sender are your active player by default. Target can be overridden by Target Override.</td>'+
		'</tr>'
	;
	out += '</table>';

	return out;
}

// Listing
/*
export function list(){


	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		text : true,
		chat : true,
		conditions : true,
		game_actions : true,
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'RPStage_'+Generic.generateUUID(),
	}));

};
*/
