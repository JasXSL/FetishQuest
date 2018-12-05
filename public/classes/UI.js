import Player from "./Player.js";
import GameEvent from "./GameEvent.js";
import Action from './Action.js';
import Game from './Game.js';
import Asset from "./Asset.js";
import {Wrapper, Effect} from './EffectSys.js';
import NetworkManager from './NetworkManager.js';
import PlayerTemplate from "./templates/PlayerTemplate.js";
import stdTag from "../libraries/stdTag.js";
import Mod from './Mod.js';

export default class UI{

	constructor(parent){
		
		this.parent = parent;
		this.board = $("#content");
		this.players = $("#content > div.players");
		this.friendly = $("#content > div.players > div.left");
		this.hostile = $("#content > div.players > div.right");
		this.dm_tools = $("#dm_tools");
		this.action_selector = $("#content > div.action_selector");
		this.text = $("#content div.text > div.content");
		this.console = $("#content > div.middle > div.chat");
		this.mainMenu = $("#mainMenuButton");
		this.masterVolume = $("#audioToggle");
		this.netgamePlayers = $("#netgamePlayers");
		this.netgameToggle = $("#netgameToggle");
		this.notices = $("#notices");
		this.gameIcons = $("#gameIcons");

		this.previousConsoleCommands = [];
		try{
			this.previousConsoleCommands = JSON.parse(localStorage.previousConsoleCommands);
			if( !Array.isArray(this.previousConsoleCommands) )
				this.previousConsoleCommands = [];
		}catch(err){}
		this.consolePointer = 0;

		// Targeting
		this.action_player = null;
		this.action_selected = null;
		this.targets_selected = [];

		this.captureActionMessage = false;	// Lets you caption statMessage classed message until the next non stat messaged one appears 
		this.capturedMessages = [];

		this.console.off('keydown').on('keydown', event => {
			if( event.altKey ){

				if( event.key === "ArrowUp" ){
					if( this.consolePointer === 0 )
						this.addMessageToConsoleLog(this.console.text());
					++this.consolePointer;
				}
				else if( event.key === "ArrowDown" )
					--this.consolePointer;
				else
					return false;

				this.consolePointer = Math.max(0, Math.min(this.previousConsoleCommands.length-1, this.consolePointer));
				this.console.text(this.previousConsoleCommands[this.consolePointer]);

				return false;
			}
			if( event.key !== "Enter" )
				return true;
			this.onConsoleMessage();
			return false;
		});
		this.mainMenu.off('click').on('click', event => {
			this.drawMainMenu();
		});
		this.netgameToggle.off('click').on('click', () => {
			this.drawNetSettings();
		});

	}

	ini(){

		let th = this;
		function updateVolumeIcon(){
			th.masterVolume.css({
				'background-image' : localStorage.masterVolume > 0 ? 'url(media/wrapper_icons/speaker.svg)' : 'url(media/wrapper_icons/speaker-off.svg)'
			});
		}

		let volume = 0;
		if( !isNaN(localStorage.masterVolume) )
			volume = +localStorage.masterVolume;
		$('#masterSoundVolume', this.masterVolume)
			.val(Math.round(volume*100))
			.off('input').on('input', function(event){
				let preVolume = +localStorage.masterVolume;
				game.setMasterVolume($(this).val()/100);
				if( +localStorage.masterVolume > 0 !== preVolume > 0 )
					updateVolumeIcon();
			});

		// Channels
		$('#ambientSoundVolume', this.masterVolume)
			.val(Math.round(game.audio_ambient.volume*100))
			.off('input').on('input', function(event){
				game.audio_ambient.setVolume($(this).val()/100);
			});
		$('#fxSoundVolume', this.masterVolume)
			.val(Math.round(game.audio_fx.volume*100))
			.off('input').on('input', function(event){
				game.audio_fx.setVolume($(this).val()/100);
			});
		$('#musicSoundVolume', this.masterVolume)
			.val(Math.round(game.audio_music.volume*100))
			.off('input').on('input', function(event){
				game.audio_music.setVolume($(this).val()/100);
			});

		this.masterVolume.off('click').on('click', event => {
			let el = $("> div", this.masterVolume);
			el.toggleClass('visible');
			event.stopImmediatePropagation();
			if( el.hasClass('visible') ){
				window.addEventListener('click', event => {
					$("> div", this.masterVolume).toggleClass('visible', false);
				}, {once:true});
			}
		});
		$('div.rollout', this.masterVolume).on('click', event => event.stopImmediatePropagation());

		updateVolumeIcon();

	}

	destructor(){
		this.clear();
	}





	/* ERRORS/NOTICES */
	addError( text, isNotice ){
		let out = $('<div class="item'+(isNotice ? ' notice' : '')+'">'+esc(text)+'</div>');
		out.on('click', function(){
			this.remove();
		});
		setTimeout(() => {
			out.toggleClass('fadeOut', true);
			setTimeout(() => {
				out.remove();
			}, 3000);
		}, 6000);
		this.notices.append(out);
	}
	addNotice( text ){
		this.addError(text, true);
	}







	/* MAIN BOARD */
	// Updates everything
	draw(){

		this.drawPlayers();
		this.drawTools();
		this.drawNetgamePlayers();
		this.drawGameIcons();
		if( !game.battle_active )
			this.closeActionSelector();

	}

	// Draws action selector for a player
	drawActionSelector( player ){

		let actions = player.getActions(), 
			th = this,
			html = ''
		;

		// Draw stat bars
		html += '<div class="stat ap">';
		for( let i = 0; i< player.getMaxAP(); ++i)
			html += '<div class="point '+(i < player.ap ? 'filled' : '')+'"></div>';
		html += '</div>';
		
		html += '<div class="stat mp">';
		for( let i = 0; i< player.getMaxMP(); ++i)
			html += '<div class="point '+(i < player.mp ? 'filled' : '')+'"></div>';
		html += '</div>';
		
		// label : nr
		let existing = {};
		actions = actions.filter(el => {
			if( existing[el.label] ){
				++existing[el.label];
				return false;
			}
			existing[el.label] = 1;
			return true;
		});

		for( let action of actions ){

			if( !action.isVisible() || action.no_action_selector )
				continue;

			let castable = action.castable();
			html+= '<div class="action tooltipParent '+(castable ? 'enabled' : 'disabled')+'" data-id="'+esc(action.id)+'">'+
				esc(action.name);
			// This action is tied to an asset
			if( action.isAssetAction() )
				html += ' x'+existing[action.label];
			else if( action._charges > 1 )
				html += ' x'+action._charges;
			

			html += (action._cooldown > 0 ? '<div class="CD"><span>'+action._cooldown+'</span></div>' : '')+
				'<div class="tooltip actionTooltip">'+
					action.getTooltipText()+
				'</div>'+
			'</div>';

		}
		html += '<div class="action" data-id="cancel">Cancel</div>';

		this.action_selector.html(html).toggleClass("hidden", false);

		// Bind events
		$("div.action", this.action_selector).on('click', function(){
			
			let id = $(this).attr("data-id");
			if( id === "cancel" )
				th.closeActionSelector();
			else{
				
				let spell = player.getActionById(id);
				if( !spell )
					return game.ui.addError("No such spell found", id, "on", player);

				if( spell.castable(true) ){
					th.targets_selected = [];
					th.drawTargetSelector( spell, player );
				}
			}

		}).on('mouseover', function(){

			let id = $(this).attr("data-id");
			let spell = player.getActionById(id); 
			if( id === "cancel" || !spell )
				return;
			
			let mpCost = spell.mp, apCost = spell.ap,
				mp = player.mp, ap = player.ap
			;

			
			if( apCost ){
				let start = Math.max(apCost, ap);
				for( let i = start-apCost; i<start; ++i )
					$("div.stat.ap div.point", this.action_selector).eq(i).toggleClass('highlighted', true);
			}
			if( mpCost ){
				let start = Math.max(mpCost, mp);
				for( let i = start-mpCost; i<start; ++i )
					$("div.stat.mp div.point", this.action_selector).eq(i).toggleClass('highlighted', true);
			}

			

		}).on('mouseout', () => {
			$("div.stat div.point", this.action_selector).toggleClass('highlighted', false);
		});


	}

	// Players on the board
	drawPlayers(){

		let tp = game.getTurnPlayer(),
			th = this
		;

		// Build skeleton if needed
		let ids = [];
		let i =0;
		for( let p of game.players ){

			if( !(p instanceof Player) )
				console.error("Player #"+i+" is not a player:", p);
			++i;
			let el = $("div.player[data-id='"+esc(p.id)+"']", this.players);
			let tag = $('div.left', this.players);
			if( p.team !== 0 )
				tag = $("div.right", this.players);

			if( !el.length ){
				let div = '<div class="player" data-id="'+p.id+'">'+
					'<div class="actionDrawer">'+
							'<div class="action" data-type="actions">Actions</div>'+
							'<div class="action" data-type="endTurn">End Turn</div>'+
					'</div>'+
					'<div class="content">'+
						'<div class="bg" style="background-image:url('+esc(p.icon)+')" data-image="'+esc(p.icon)+'"></div>'+
						'<div class="stats"></div>'+
					'</div>'+
					'<div class="topRight">'+
						'<div class="wrappers"></div>'+
						'<div class="charging"></div>'+
					'</div>'+
					'<div class="targetingStats"></div>'+
				'</div>';

				let el = $(div);
				tag.append(el);
				// PLAYER PORTRAIT CLICK
				el.on('click', function(){

					// Players are in action selection mode
					if( $(this).hasClass("castTarget") ){
						
						if( th.targets_selected.length >= th.action_selected.max_targets )
							return;
						th.targets_selected.push(game.getPlayerById($(this).attr('data-id')));
						th.drawTargetSelector(th.action_selected);
						return;

					}

					// Remove a selected player
					if( $(this).hasClass("targetSelected") ){

						let pl = game.getPlayerById($(this).attr('data-id'));
						for( let i in th.targets_selected ){
							if( th.targets_selected[i] === pl ){
								th.targets_selected.splice(i, 1);
								th.drawTargetSelector(th.action_selected);
								return;
							}
						}
					}

					th.drawPlayerInspector($(this).attr('data-id'));

				});

			}
			// Team has changed
			else if( p.team === 0 !== el.parent().hasClass('left') )
				el.appendTo(tag);


			ids.push(p.id);
			el.toggleClass("active", false);		// Clear turns

		}



		// Remove players that have been removed
		$("div.player[data-id]", this.players).each(function(){
			if( ids.indexOf($(this).attr('data-id')) === -1 )
				$(this).remove();
		});


		let nr_friendly = 0,
			nr_hostile = 0;

		// Update the content
		for( let p of game.players ){
			
			let myTurn = tp && tp.id === p.id,
				el = $("div.player[data-id='"+esc(p.id)+"']", this.players)
			;

			if( myTurn )
				el.toggleClass("active", true);

			
			let ownerName = "";
			for( let np of game.net.players ){
				if( np.id === p.netgame_owner ){
					ownerName = np.name;
					break;
				}
			}
			el.toggleClass('mine', p.netgame_owner === game.net.id);

			el.toggleClass('dead', p.hp <= 0);
			el.toggleClass('incapacitated', p.isIncapacitated());

			// Check if image has changed
			let imgdiv = $('div.bg[data-image]', el);
			if( imgdiv.attr('data-image') !== p.icon )
				imgdiv.attr('data-image', p.icon).css({'background-image':'url('+esc(p.icon)+')'});
		
			let ubDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.upperbody),
				lbDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.lowerbody);
			
			let rb_entries = [];
			
				//'<span class="arousal resource">'+()+'</span> '+	Todo: Add arousal resource
			rb_entries.push('<span class="arousal resource" title="Arousal.\n+'+Math.round(p.arousal/p.getMaxArousal()*50)+'% corruption damage taken">'+
				Math.round(p.arousal/p.getMaxArousal()*100)+'%'+
			'</span>');
			if( !p.isBeast() ){
				rb_entries.push(
					'<span class="chest resource '+(ubDur > 0 ? '' : 'broken')+'" title="Upperbody armor durability.'+
						(ubDur <= 0 ? '\n+25% Damage taken for missing upperbody.' : '')+
					'">'+
						Math.ceil(ubDur*100)+'%'+
					'</span>'
				);
				rb_entries.push(
					'<span class="legs resource '+(lbDur > 0 ? '' : 'broken')+'" title="Lowerbody armor durability.'+
						(lbDur <= 0 ? '\n+25% Damage taken for missing lowerbody.' : '')+
					'">'+
					Math.ceil(lbDur*100)+'%</span>'
				);
			}
			rb_entries.push('<span class="MP resource large" title="Mana Points">'+p.mp+'/'+p.getMaxMP()+'</span>');
			rb_entries.push('<span class="AP resource large" title="Action Points">'+p.ap+'/'+p.getMaxAP()+'</span>');
			rb_entries.push('<span class="HP resource large" title="Hit Points">'+p.hp+'/'+p.getMaxHP()+'</span>');
			if( p.team !== 0 )
				rb_entries.reverse();

			$("div.content > div.stats", el).html(
				'<span class="name" style="color:'+esc(p.color)+'">'+
					'<strong>'+esc(p.name)+'</strong>'+
					(ownerName ? ' <em>('+esc(ownerName)+')</em>' : '')+
				'</span><br />'+
				rb_entries.join('')
			);
			$("div.actionDrawer", el).toggleClass('hidden', (!myTurn && game.battle_active) || !game.playerIsMe(p) || p.isDead());
			$("div.player[data-id] div.actionDrawer div.action[data-type=endTurn]").toggleClass('hidden', !game.battle_active);

			// Charged actions
			let chargedActions = p.isCasting();
			let ch = '';
			if( chargedActions ){
				
				for( let a of chargedActions ){
					ch += '<div class="chAction tooltipParent">';
					ch += esc(a.name)+' at '+a.getChargePlayers().map(pl => esc(pl.name));
					ch += '<div class="duration">'+a._cast_time+'</div>';
					ch += '<div class="tooltip">'+a.getTooltipText()+'</div>';
					ch += '</div>';
				}
				
			}
			$("> div.topRight > div.charging", el).html(ch);

			// Effect wrappers
			let o = '';
			let wrappers = p.getWrappers();
			wrappers = wrappers.filter(el => el.name.length && el._duration !== 0);
			for( let wrapper of wrappers ){
				o += '<div class="wrapper tooltipParent '+(wrapper.detrimental ? 'detrimental' : 'beneficial')+'" data-id="'+esc(wrapper.id)+'">';
				if( wrapper.icon )
					o+= '<div class="background" style="background-image:url('+wrapper.getIconPath()+')"></div>';
				if( wrapper.stacks > 1 )
					o+= '<div class="stacks">x'+wrapper.stacks+'</div>';
				if( wrapper._duration > 0 )
					o+= '<div class="duration">'+wrapper._duration+'</div>';
				
				o+= '<div class="tooltip">'+
					'<strong>'+esc(wrapper.name)+'</strong><br />'+
					'<em>'+
						(+wrapper._duration)+' Turn'+(wrapper._duration>1 ? 's' : '')+
						(wrapper.stacks > 1 ? ' | '+wrapper.stacks+' stack'+(wrapper.stacks !== 1 ? 's':'') : '' )+
					'</em><br />'+
					esc(wrapper.getDescription())+
				'</div>';
				o += '</div>';
			}
			$("> div.topRight > div.wrappers", el).html(o);

			// Change this later to check for the DM's character
			if( p.team === 0 )
				++nr_friendly;
			else
				++nr_hostile;
		}

		$("div.left", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_friendly > 10 ? 10 : nr_friendly));
		$("div.right", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_hostile > 10 ? 10 : nr_hostile));

		// PLAYER TURN ROLLOUT
		$("div.player[data-id] div.actionDrawer div.action[data-type]").off('click').on('click', function(event){

			// Victim
			let player = game.getPlayerById($(this).closest('div.player[data-id]').attr('data-id'));

			event.stopImmediatePropagation();
			let action = $(this).attr('data-type');
			th.closeActionSelector();

			if( action === "actions" )
				th.drawActionSelector(player);
			else if( action === "endTurn" )
				game.useActionOnTarget(player.getActionByLabel('stdEndTurn'), player, player);

		});

	}

	// Netgame players on the bottom
	drawNetgamePlayers(){
		
		let html = '';
		if( game.net.isConnected() ){
			for( let player of game.net.players )
				html+= '<div class="player">'+esc(player.name)+'</div>';
		}

		this.netgamePlayers.html(html);
	}

	// Bottom menu
	drawGameIcons(){
		let th = this;
		let html = 
			'<div class="button" data-id="map" style="background-image:url(/media/wrapper_icons/treasure-map.svg);"></div>'+
			'<div class="button" data-id="quest" style="background-image:url(/media/wrapper_icons/bookmarklet.svg);"></div>'
		;
		this.gameIcons.html(html);

		$("[data-id]", this.gameIcons).on('click', function(){
			let id = $(this).attr("data-id");
			if( id === 'map' )
				th.drawMap();
			else if( id === 'quest' )
				th.drawQuests();
		});
		
	}

	// DM Tools
	drawTools(){

		let th = this;
		if( !game.is_host ){

			this.dm_tools.hide();
			return;

		}

		let html = 
			'<div class="option button" data-action="generateDungeon">Random Dungeon</div>'+
			'<div class="option button" data-action="addPlayer">+ Add Player</div>'+
			'<div class="option button" data-action="fullRegen">Restore HPs</div>'+
			'<div class="option button '+(game.dm_writes_texts ? 'active' : 'inactive')+'" data-action="dmTexts">'+(game.dm_writes_texts ? 'DM Mode' : 'Auto Mode')+'</div>';
		// If there's more than one team standing, then draw the start battle
		if( game.teamsStanding().length > 1 )
			html += '<div class="option button '+(game.battle_active ? 'active' : 'inactive')+'" data-action="toggleBattle">'+
				(game.battle_active ? 'End Battle' : 'Start Battle')+
			'</div>';

		this.dm_tools.html(html).show();

		// Bind events
		$("div.option[data-action]", this.dm_tools).off('click').on('click', function(){

			let action = $(this).attr('data-action');
			if( action == "addPlayer" )
				th.drawPlayerEditor();
			else if( action == "toggleBattle" )
				game.toggleBattle();
			else if( action === "fullRegen" )
				game.fullRegen();
			else if( action === "dmTexts" )
				game.toggleAutoMode();
			else if( action === "generateDungeon" ){
				game.addRandomQuest();
				alert("A random dungeon quest has been generated with "+game.dungeon.rooms.length+" cells and difficulty "+game.dungeon.difficulty);
				
			}
				

		});

	}




	/* ACTION SELECTOR Helpers */
	// Send the action selection
	performSelectedAction(){
		let success = game.useActionOnTarget(
			this.action_selected, 
			this.targets_selected,
			this.action_player
		);
		this.action_selected = this.action_player = null;
		this.targets_selected = [];
		this.closeActionSelector();
		if( success ){
			this.draw();
			return true;
		}
		return false;
	}
	// Updates the players with hit chances etc
	// pl defaults to turn player
	drawTargetSelector( action, pl ){

		let html = '';

		// If pl is not set, use turn player default if a battle is active
		if( !pl )
			pl = this.parent.getTurnPlayer();
		// If no battle is active, try to pull it from cache (set last time drawTargetSelector was called)
		if( !pl )
			pl = this.action_player;
		this.action_player = pl;


		this.action_selected = action;
		$("div.player", this.players).toggleClass("castTarget targetSelected", false);
		let viableTargets = action.getViableTargets();

		// Self cast
		if( action.target_type === Action.TargetTypes.self ){
			this.targets_selected = [pl];
			this.performSelectedAction();
			return;
		}

		// AoE cast
		if( action.target_type === Action.TargetTypes.aoe ){
			this.targets_selected = action.getViableTargets();
			this.performSelectedAction();
			return;
		}

		// Auto perform the action if we have one target, and only one viable player is present or only one player is allowed for the attack
		if( (action.max_targets === 1 || viableTargets.length === 1) && this.targets_selected.length ){
			if( this.performSelectedAction() )
				return true;
			return false;
		}
			
		
		for( let t of viableTargets ){
			if( ~this.targets_selected.indexOf(t) )
				$("div.player[data-id='"+esc(t.id)+"']", this.players).toggleClass("targetSelected", true);
			else
				$("div.player[data-id='"+esc(t.id)+"']", this.players).toggleClass("castTarget", true);

				
			let hit = Math.max(Player.getHitChance(pl, t, action), 0);
			$("div.player[data-id='"+esc(t.id)+"'] div.targetingStats", this.players).html(
				hit+'% Hit'
			);
			
		}

		let mid = 'target';
		if( action.max_targets > 1 && viableTargets.length > 1 ){
			mid = (+action.min_targets)+" to "+(+action.max_targets)+' targets';
			if( action.max_targets <= action.min_targets )
				mid = (+action.min_targets)+' targets';
		}

		let enabled = this.targets_selected.length >= action.min_targets;

		html += '<span style="flex:100%">Select '+mid+' for \''+esc(action.name)+'\'</span>';
		let missingTargets = action.min_targets-this.targets_selected.length;
		if( action.max_targets > 1 && viableTargets.length > 1 )
			html += '<div class="action '+(enabled ? 'enabled' : 'disabled')+'" data-id="exec">'+
				(!enabled ? missingTargets+' More Target'+(missingTargets === 1 ? '': 's') : 'Perform Action')+
			'</div>';
		html += '<div class="action" data-id="cancel">Cancel</div>';
		this.action_selector.toggleClass("hidden", false).toggleClass("targetSelector", true).html(html);
		$("div.action[data-id=cancel]", this.action_selector).on('click', () => {
			this.closeActionSelector();
			if( this.battle_active )
				this.drawActionSelector(pl);
		});
		$("div.action.enabled[data-id=exec]", this.action_selector).on('click', () => {
			this.performSelectedAction();
		});
		

	}
	closeActionSelector(){

		this.action_selector.toggleClass("hidden", true).toggleClass("targetSelector", false);
		$("div.player", this.players).toggleClass("castTarget targetSelected", false);
		this.action_selected = null;

	}




	/* REPAIR HELPER */
	// Repairs through an effect wrapper. Wrapper is the wrapper that triggered this.
	drawRepair( sender, target, action ){
		
		let asset;
		if( action && action.isAssetAction() )
			asset = action.parent;

		let inventory = target.getRepairableAssets();

		game.modal.prepareSelectionBox();
		for( let item of inventory ){
			game.modal.addSelectionBoxItem( 
				esc(item.name), 
				item.getTooltipText(), 
				esc(item.id),
				[Asset.RarityNames[item.rarity]]
			);
		}
		game.modal.onSelectionBox(event => {
			
			let element = event.target,
				id = $(element).attr('data-id');
			if( asset )
				game.useRepairAsset(sender, target, asset.id, id);
			else
				this.addError("Todo: add non-asset armor repairs");

			game.modal.closeSelectionBox();
			
		});

	}


	/* CONSOLE (ctrl+up) LOG */
	addMessageToConsoleLog(message){
		if( this.previousConsoleCommands.length && !this.previousConsoleCommands[0].trim() ){
			this.previousConsoleCommands.shift();
		}
		this.previousConsoleCommands.unshift(message);
		if( this.previousConsoleCommands.length > 100 )
			this.previousConsoleCommands.pop();
		localStorage.previousConsoleCommands = JSON.stringify(this.previousConsoleCommands);
	}






	/* CHAT */
	// Flushes queued message
	flushMessages(){
		this.captureActionMessage = false;
		let messages = this.capturedMessages.slice();
		this.capturedMessages = [];	// prevents stack heap
		for( let args of messages )
			this.addText.apply(this, args);
	}
	// Prints a message
	// audioObj can be an object with {id:(str)soundKitId, slot:(str)armorSlot}
	addText( text, evtType, attackerID, targetID, additionalClassName, disregardCapture, audioObj ){

		let gTypes = GameEvent.Types;
		if( this.captureActionMessage && !disregardCapture ){
			this.capturedMessages.push([...arguments]);
			return;
		}

		if( typeof audioObj === "object" && game.initialized && audioObj.id )
			game.playFxAudioKitById(
				audioObj.id, 
				game.getPlayerById(attackerID), 
				game.getPlayerById(targetID), 
				audioObj.slot
			);


		this.parent.logChat.apply(this.parent, [...arguments]);

		let acn = additionalClassName;
		if( typeof acn !== "string" )
			acn = [];
		else
			acn = acn.split(' ');

		if( acn.indexOf('dmInternal') === -1 )
			game.net.sendHostTask(NetworkManager.dmTasks.sendText, {
				text : text,
				evtType : evtType,
				attackerID : attackerID,
				targetID : targetID,
				acn : additionalClassName,
				audio : audioObj
			});

		let target = this.parent.getPlayerById(targetID),
			sender = this.parent.getPlayerById(attackerID);
		if( ~[gTypes.turnChanged, gTypes.battleEnded, gTypes.encounterStarted].indexOf(evtType) )
			acn.push('center');
		else if( ~[gTypes.battleStarted].indexOf(evtType ) )
			acn.push('center', 'battleStarted');
		// RP texts (the big ones) have teams swapped 
		else if( ~acn.indexOf('rpText') && sender ){
			if( sender.team !== 0 )
				acn.push('enemy');
			else
				acn.push('friend');
			acn.push('sided');
		}
		else if( target ){
			if( target.team !== 0 )
				acn.push('enemy');
			else
				acn.push('friend');
			acn.push('sided');
		}

		

		let txt = stylizeText(text);
		if( ~acn.indexOf('sided') )
			txt = '<div class="sub">'+txt+'</div>';

		
		this.text.append('<div class="line '+esc(acn.join(' '))+'">'+txt+'</div>');
		while($("> div", this.text).length > Game.LOG_SIZE)
			$("> div:first", this.text).remove();
		this.text.scrollTop(this.text.prop("scrollHeight"));

	}
	clear(){
		this.text.html('');
	}






	/* MODAL INSPECTS */

	async drawMainMenu(){

		let html = '<div class="mainMenu flexTwoColumns">',
			modal = this.parent.modal,
			modNames = await Mod.getNames(),
			sortedMods = await Mod.getModsOrdered()
		;

		for( let i in sortedMods )
			sortedMods[i].index = +i;
			
			html += '<div class="left">';

				html += '<input type="button" class="green" name="newGame" value="New Game" /><br />';
				let names = await Game.getNames();
				if( Object.keys(names).length ){

					html += '<h3>Load Game</h3>';
					for(let id in names){
						let name = names[id];
						html+= '<div class="gameListing" data-id="'+esc(id)+'">'+esc(name)+'</div>';
					}
				}

				if( !game.net.isConnected() )
					html += '<hr /><form id="joinGame">'+
						'<input type="text" placeholder="Nickname" name="nickname" style="width:auto" value="'+esc(game.net.getStandardNick())+'" />'+
						'<input type="text" placeholder="Game ID" name="gameID" style="width:auto" />'+
						'<input type="submit" value="Join Online Game"  />'+
					'</form>';
				
			
			html += '</div>';

			html += '<div class="right">';

				html += '<h3>Mod Order</h3>';
				html += '<table class="editor"><tr><th>Name</th><th>Enabled</th><th>Load Order</th></tr>';
				if( !Object.keys(modNames).length )
					html += '<tr><td colspan=3>No mods installed</td></tr>';
				for( let mod of sortedMods ){
					
					html += '<tr data-mod="'+esc(mod.id)+'">';
						html += '<td>'+esc(mod.name)+'</td>';
						html += '<td><input type="checkbox" class="enableMod" '+(mod.enabled ? 'checked' : '')+' /></td>';
						html += '<td><input type="button" value="Up" class="moveUp" /><input type="button" value="Down" class="moveDown" /></td>';
					html += '</tr>';

				}
				html += '</table>';

				html += 'Install Mod: <input type="file" id="modFile" />';

			html += '</div>';
			

		html += '</div>';
		
		

		let th = this;
		modal.set(html);

		function saveLoadOrder(){
			// Save order
			const order = {};
			$("#modal div.right table tr[data-mod]").each((idx, el) => {
				order[$(el).attr('data-mod')] = {idx:idx, en:$("input.enableMod", el).is(':checked')};
			});
			Mod.saveLoadOrder(order);
			glib.autoloadMods();

		}

		$("tr[data-mod] input.moveUp, tr[data-mod] input.moveDown").on('click', event => {
			const targ = $(event.target);
			const up = targ.hasClass('moveUp');
			const row = targ.closest("tr");
			if( up && !row.prev().is('tr:first') )
				row.insertBefore(row.prev());
			else if(!up)
				row.insertAfter(row.next());
			saveLoadOrder();
		});

		$("tr[data-mod] input.enableMod").on('change', saveLoadOrder);

		$("#modal input[name=newGame]").on('click', () => {
			let html = '<h1>Pick a name for your new game</h1>'+
				'<form id="newGameForm">'+
					'<input type="text" class="gameName" value="Unnamed Adventure" /><br />'+
					'<input type="submit" value="Start Game">'+
				'</form>'
			;
			modal.set(html);
			$('#newGameForm').on('submit', () => {

				game.net.disconnect();
				let name = $("input.gameName").val().trim();
				if( !name ){
					game.ui.addError("Name is empty");
					return false;
				}

				Game.new(name);
				modal.close();
				return false;

			});
		});
		
		$("#modal div.gameListing[data-id]").on('click', function(event){

			let id = $(this).attr('data-id');
			if( event.ctrlKey ){
				if( confirm('Really delete this game?') )
					Game.delete(id).then(() => {
						th.drawMainMenu();
					});

				return false;
			}
			game.net.disconnect();
			localStorage.game = id;
			Game.load();
			modal.close();

		});

		
		$("#joinGame").on('submit', event => {
			event.stopImmediatePropagation();
			game.net.joinGame($("#joinGame input[name=gameID]").val(), $("#joinGame input[name=nickname]").val()).then(() => this.drawMainMenu());
			return false;
		});
		
		$("#modFile").on('change', event => {
			const file = event.target.files[0];
			if( !file )
				return;
			if( file.type.toLowerCase() !== 'application/json' ){
				alert("Invalid file type "+file.type+". Needs to be JSON");
				return;
			}
			
			const reader = new FileReader();
			reader.onload = async e => {
				try{
					const m = new Mod(JSON.parse(e.target.result));
					if( modNames[m.id] && !confirm("This mod already exists. Overwrite?") )
						return;
					await m.save();
					this.drawMainMenu();
					this.addNotice("Mod "+esc(m.name)+" installed!");
				}catch(err){
					alert("File failed to load: "+err);
				}
			};
			reader.readAsText(file);
		

		});
		
		

	}


	// Netgame settings
	drawNetSettings(){

		let html = '';
		if( game.net.isConnected() && game.initialized && game.is_host )
			html += 'Invite players with this ID:<br /><strong style="user-select:text;">'+esc(game.net.public_id)+'</strong><br /><br />';
		else if( !game.net.isConnected() && game.initialized && game.is_host )
			html += '<input type="button" class="blue" name="hostGame" value="Put This Session Online" /><br />';

		if( game.net.isConnected() )
			html += '<input type="button" class="red" name="disconnect" value="Disconnect" />';

		game.modal.set(html);

		$("#modal input[name=disconnect]").on('click', async () => {
			game.net.disconnect();
			this.drawMainMenu();
		});

		$("#modal input[name=hostGame]").on('click', async () => {
			await game.net.hostGame();
			this.drawNetSettings();
		});

	}


	// 3d map browser
	drawMap(){
		let rend = game.renderer;
		game.modal.set('', rend.renderer.domElement);
	}

	// Quest explorer
	drawQuests(){
		let html = '', th = this;
		let quests = game.quests;
		let selectedQuest = quests[0];
		for( let quest of quests ){
			if( quest.id === localStorage.selected_quest )
				selectedQuest = quest;
		}
		html += '<div class="modalQuests">';
			html += '<div class="left">';
			if( !quests.length )
				html += '<div class="selected">No active quests</div>';
			else{
				for( let quest of quests )
					html += '<div data-id="'+esc(quest.id)+'" class="'+(quest === selectedQuest ? ' selected ' : '')+(quest.isCompleted() ? ' completed ' : '')+'">'+
						'['+quest.level+'] '+quest.name+(quest.isCompleted() ? ' (Completed)' : '')+
					'</div>';
			}
			html += '</div>';
			html += '<div class="right">';
			if( !quests.length )
				html += 'You have no active quests.';
			else{
				html += '<h1>'+esc(selectedQuest.name)+'</h1>';
				html += '<p>'+esc(selectedQuest.description)+'</p>';
				html += '<br /><h3>Objectives</h3>';
				for( let objective of selectedQuest.objectives ){
					html += '<div class="objective'+(objective.isCompleted() ? ' completed ' : '')+'">'+
						esc(objective.name)+
						(objective.amount ? ' - '+objective._amount+'/'+objective.amount : '')+
					'</div>';
				}
				html += '<hr />';
				html += '<h3>Rewards</h3>';
				for( let asset of selectedQuest.rewards_assets ){
					html += '<div class="item tooltipParent '+Asset.RarityNames[asset.rarity]+'">';
						html += esc(asset.name);
						html += '<div class="tooltip">';
							html += asset.getTooltipText();
						html += '</div>';
					html += '</div>';
				}
				if( selectedQuest.rewards_exp ){
					html += '<div class="item">'+selectedQuest.rewards_exp+' Exp</div>';
				}

			}
			html += '</div>';
		html += '</div>';
		game.modal.set(html);

		$("#modal div.modalQuests > div.left > div[data-id]").on('click', function(){
			let id = $(this).attr('data-id');
			localStorage.selected_quest = id;
			th.drawQuests();
		});

	}

	// Player inspect
	// uuid can also be a player object
	drawPlayerInspector( uuid ){

		let player = uuid,
			th = this
		;
		if( typeof uuid === "string" )
			player = game.getPlayerById(uuid);
		if( !player || player.constructor !== Player )
			return;

		let html = '<div class="playerInspector">';

			html += '<div class="left">'+
				'<h3>'+esc(player.name)+'</h3>'+
				'<em>Lv '+player.level+' '+esc(player.species)+' '+esc(player.class.name)+'</em>'+
				'<p class="stats">'+
					player.hp+'/'+player.getMaxHP()+' HP | '+
					player.ap+'/'+player.getMaxAP()+' AP | '+
					player.mp+'/'+player.getMaxMP()+' MP | '+
					player.experience+'/'+player.getExperienceUntilNextLevel()+' EXP'+
				'</p>'+
				'<em>'+esc(player.description)+'</em><br />'+
				'<br />'+(game.is_host ? '<input type="button" class="editPlayer yellow" value="Edit Player" /> ' : '');
				
				if(game.is_host)
					html += '<input type="button" class="red" value="Delete" />';
				html += '<br />';


				// Draw actions
				html += '<h3>Actions</h3>';
				html += '<div class="actions">';
				let actions = player.getActions( false );
				for( let ability of actions ){
					if( ability.hidden || ability.semi_hidden )
						continue;
					html+= '<div class="action tooltipParent'+(ability.label.substr(0,3) === 'std' ? ' noDelete' : '')+'" data-id="'+esc(ability.id)+'">';
						html+= esc(ability.name);
						html+= '<div class="tooltip actionTooltip">';
							html += ability.getTooltipText();
						html += '</div>';
					html+= '</div>';
				}
				html += '</div>';

				if( game.is_host )
					html += '<input type="button" value="+ Learn Action" class="addAction blue" />';
				
				html += '<br /><br />';



				// Draw inventory
				html += '<h3>Inventory</h3>';
				html += '<em>Carrying '+(Math.floor(player.getCarriedWeight()/100)/10)+'/'+Math.floor(player.getCarryingCapacity()/1000)+'kg</em><br />';
				html+= '<div class="inventory">';
				let inv = [];
				for(let asset of player.assets)
					inv.push(asset);
				inv.sort((a,b) => {
					if(a.equipped && !b.equipped)
						return -1;
					if(b.equipped && !a.equipped)
						return 1;
					if(a.name === b.name)
						return 0;
					return a.name < b.name ? -1 : 1;
				});
				for(let item of inv){
					if( !item.equipped )
						html += '<br />';
					html += '<div class="item '+Asset.RarityNames[item.rarity]+' tooltipParent '+(item.equippable() ? 'equippable' : '')+(item.equipped ? ' equipped' : '')+(item.durability <= 0 ? ' broken' : '')+'" data-id="'+esc(item.id)+'">';
					html += (item.equipped ? '<strong>' : '')+esc(item.name)+(item.equipped ? '<br />['+item.slots.map(el => el.toUpperCase()).join(' + ')+']</strong>' : '');
						html += '<div class="tooltip">';
							html += item.getTooltipText();
						html += '</div>';
					html+= '</div>';
				}
				html+= '</div>';

				if( game.is_host )
					html+= '<input type="button" value="+ Add Item" class="addInventory blue" /><br /><br />';

			html += '</div>';

			// Right side
			html += '<div class="right">'+
				// Image
				'<img src="'+esc(player.icon)+'" class="inspect_icon" />';
				html += '<h3 style="text-align:center">Primary Stats</h3>';
				let stats = player.getPrimaryStats();
				html += '<div class="flexThreeColumns">';
				for( let stat in stats ){
					let isPrimary = stat === player.class.primaryStat;
					let title = 'HP';
					let amount = player.statPointsToNumber(stat);
					if( stat === Player.primaryStats.agility )
						title = 'AP';
					else if( stat === Player.primaryStats.intellect )
						title = 'MP';
					html += '<div class="tag'+( isPrimary ? ' primaryStat' : '' )+'" title="Increases '+title+' by '+amount+'.'+(isPrimary ? '\n'+esc(player.class.name)+' primary stat.': '')+'">'+
							ucFirst(stat)+' '+stats[stat]+
						'</div>';
				}
				html += '</div>';

				html += '<h3 style="text-align:center">Proficiency</h3>';
				html += '<div class="flexAuto">';
				let s = [];
				for( let stat in Action.Types ){
					let st = Action.Types[stat];
					s.push({type:st, val:player.getBon(st, true, true)});
				}
				s.sort((a,b) => {
					if(a.val > b.val)
						return -1;
					if( b.val > a.val )
						return 1;
					return a.type < b.type ? -1 : 1;
				});
				for( let stat of s )
					html += '<div class="tag" title="'+esc(Action.TypeDescriptions[stat.type])+'">'+stat.val+' '+esc(stat.type.substr(0,6))+(stat.type.length>6 ? '.' : '')+'</div>';
				html += '</div>';

				html += '<h3 style="text-align:center">Resistance</h3>';
				html += '<div class="flexAuto">';
				s = [];
				for( let stat in Action.Types ){
					let st = Action.Types[stat];
					s.push({type:st, val:player.getSV(st, true)});
				}
				s.sort((a,b) => {
					if(a.val > b.val)
						return -1;
					if( b.val > a.val )
						return 1;
					return a.type < b.type ? -1 : 1;
				});
				for( let stat of s )
					html += '<div class="tag" title="Grants you a chance to resist detrimental '+esc(stat.type)+' effects based on the caster\'s '+esc(stat.type)+' proficiency.">'+stat.val+' '+esc(stat.type.substr(0,6))+(stat.type.length>6 ? '.' : '')+'</div>';
				html += '</div>';
				

				// Tags
				html += '<h3>Active Tags</h3>';
				html += '<div class="flexAuto">';
					let tags = Array.from(new Set(player.getTags())).sort();
					for( let tag of tags )
						html += '<div class="tag">'+esc(tag)+'</div>';
				html += '</div>';
			html += '</div>';


		html += '</div>';
		
		this.parent.modal.set(html);
		this.parent.modal.onPlayerChange(player.id, () => this.drawPlayerInspector(player.id));

		// Bind events
		$("#modal input.editPlayer").on('click', () => {
			th.drawPlayerEditor(player);
		});

		$("#modal input[value=Delete]").on('click', () => {
			if( !confirm('Really delete?') )
				return;
			game.removePlayer(player.id);
			th.draw();
			game.modal.close();
		});

		$("#modal input.addInventory").on('click', () => {
			this.drawPlayerAssetSelector(player);
		});

		$("#modal input.addAction").on('click', () => {
			this.drawPlayerActionSelector(player);
		});

		$("#modal div.item[data-id]").on('click', function(event){
			
			let id = $(this).attr('data-id');
			let asset = player.getAssetById(id);

			if( event.ctrlKey && game.is_host ){
				if( confirm('Really delete?') && game.deletePlayerItem( player, id) ){
					th.drawPlayerInspector( uuid );
					th.draw();
				}
			}
			else if( event.shiftKey  && game.is_host ){
				if( asset )
					th.drawAssetEditor( asset, player );
			}
			// Toggle equip / use
			else{

				// Clicking an item in inventory triggers a local sound
				if( asset && asset.loot_sound )
					game.playFxAudioKitById(asset.loot_sound, player, player );

				if( asset && asset.usable() && (!game.battle_active || player === game.getTurnPlayer()) ){

					let action = asset.use_action;
					let targets = action.getViableTargets();
					if( !targets.length )
						return;

					th.drawTargetSelector( action, player );
					game.modal.close();

				}

				if( asset && asset.equippable() && game.equipPlayerItem(player, id) ){
					th.drawPlayerInspector( uuid );
					th.draw();
				}
				
			}
		});

		$("#modal div.action[data-id]").on('click', function(event){
			if( event.ctrlKey ){
				if( $(this).hasClass('noDelete') )
					return;
				if( confirm('Really unlearn?') && game.deletePlayerAction( player, $(this).attr('data-id')) ){
					th.drawPlayerInspector( uuid );
					th.draw();
				}
			}
		});
	

	}

	// Asset library, allows you to add assets to a player 
	drawPlayerAssetSelector( player ){

		let html = '',
			th = this
		;

		let lib = glib.getFull('Asset');
		html+= '<div class="inventory tooltipShrink">';
			html += '<h3>Add Item to '+esc(player.name)+'</h3>';
		for( let id in lib ){
			let asset = lib[id];
			html += '<div class="list item tooltipParent'+(asset._custom ? ' custom' : '')+'" data-id="'+esc(id)+'">';
				html += esc(asset.name);
				html += '<div class="tooltip">';
					html += asset.getTooltipText();
				html += '</div>';
			html += '</div>';
		}
		html += '<br /><input type="button" class="create green" value="Create" />'+' <input type="button" class="back red" value="Back" />';
		html += '</div>';
			
		game.modal.set(html);

		// Item clicked
		$("#modal div.list.item[data-id]").on('click', async function(event){

			let id = $(this).attr('data-id'),
				asset = lib[id]
			;
			if(event.ctrlKey){

				if( !$(this).hasClass('custom') ){
					alert("Can't delete a built in asset");
					return false;
				}

				th.parent.removeFromLibrary(asset);
				th.drawPlayerAssetSelector(player);
				th.parent.save();

			}

			else if( event.shiftKey ){

				th.drawAssetEditor(asset, player);

			}

			else if(player.addLibraryAsset(id)){
				await game.save();
				th.drawPlayerInspector(player.id);
				th.draw();
			}

		});

		$("#modal input.back").on('click', () => {
			this.drawPlayerInspector(player.id);
		});

		$("#modal input.create").on('click', () => this.drawAssetEditor(undefined, player));

	}

	// Action library, allows you to add actions to a player
	drawPlayerActionSelector( player ){

		let html = '',
			th = this
		;

		let libActions = glib.getFull('Action'); 
		html+= '<div class="inventory tooltipShrink">';
			html += '<h3>Learn Action for '+esc(player.name)+'</h3>';
		for( let id in libActions ){
			let asset = libActions[id];
			if( player.getActionByLabel(asset.label) )
				continue;
			
			html += '<div class="list item tooltipParent" data-id="'+esc(id)+'">';
				html += esc(asset.name);
				html += '<div class="tooltip actionTooltip">';
					html += asset.getTooltipText();
				html += '</div>';
			html += '</div>';
		}
			html+= '<br /><input type="button" class="back red" value="Back" />';
		html += '</div>';
		
		this.parent.modal.set(html);

		// Events
		$("#modal div.list.item[data-id]").on('click', async function(){

			let id = $(this).attr('data-id');
			if( player.addActionFromLibrary(id) ){
				await game.save();
				th.drawPlayerInspector(player.id);
			}

		});

		$("#modal input.back").on('click', () => {
			this.drawPlayerInspector(player.id);
		});

	}






	/* MODAL EDITORS */
	// Player editor
	drawPlayerEditor( player ){

		if( !player ){
			player = new Player();
			player.level = game.getHighestLevelPlayer();
		}
		
		let th = this;

		let html = 
			'<form id="playerEditor">';

				// Draw randomizer only for new players
				if( !game.getPlayerById(player.id) ){
					html+= '<div class="top centered">';
						html += '<select name="randomize_type">';
							html += '<option value="_RANDOM_">-RANDOM-</option>';
							let libtemplates = Object.values(glib.getFull('PlayerTemplate'));
							libtemplates.sort((a,b) => a.name < b.name ? -1 : 1);
							for( let t of libtemplates )
								html += '<option value="'+esc(t.label)+'">'+esc(t.name)+'</option>';
						html += '</select>';
						html += '<input type="button" class="blue" value="Generate" id="randomizePlayer" />';
					html += '</div>';
				}

				html += '<div class="playerInspector">';
					html += '<div class="left">';

					if( game.net.isConnected() ){
						html += 'Owner:<br /><select name="netgame_owner">';
							html += '<option value="">- NONE -</option>';
							for( let np of game.net.players )
								html += '<option value="'+esc(np.id)+'" '+(np.id === player.netgame_owner ? 'selected' : '')+'>'+esc(np.name)+'</option>';
						html += '</select><br />';
					}
					html += 
						'Name:<br /><input type="text" name="name" placeholder="Player Name" value="'+esc(player.name)+'" /><br />'+
						'Species:<br /><input type="text" name="species" value="'+esc(player.species)+'" /><br />'+
						'Class:<br /><select name="class"><option value="">'+esc(player.class.name)+' (Unchanged)</option>';
						let clib = Object.values(glib.getFull('PlayerClass'));
						clib.sort((a,b) => {
							if(a.label === 'none')
								return -1;
							else if(b.label === 'none')
								return 1;
							if( a.isMonsterClass && !b.isMonsterClass )
								return 1;
							else if( !a.isMonsterClass && b.isMonsterClass )
								return -1;
							return a.name < b.name ? -1 : 1;
						});
						for( let c of clib )
							html += '<option value="'+esc(c.label)+'">'+(c.isMonsterClass ? '[M] ':'')+esc(c.name)+'</option>';
						
					html += '</select><br />'+
						'Level:<br /><input type="number" name="level" min=1 step=1 value='+(+player.level)+' /><br />'+
						'<div class="flexTwoColumns">'+
							'<div>Size:<br /><input type="range" name="size" value="'+(+player.size)+'" min=0 max=4 step=1 /></div>'+
							'<div style="margin-top:1.75vmax"><label><input type="checkbox" name="auto_play" value=1 '+(player.auto_play ? 'checked' : '')+' /> Auto Play</label></div>'+
						'</div>'+
						'Image:<br /><input type="text" name="icon" placeholder="Image URL" value="'+esc(player.icon)+'" /><br />'+
						'<div class="flexThreeColumns">'+
							'<div>HP<br /><input type="number" name="hp" placeholder="HP" min=0 step=1 value='+(+player.hp)+' /></div>'+
							'<div>AP<br /><input type="number" name="ap" placeholder="AP" min=0 step=1 value='+(+player.ap)+' /></div>'+
							'<div>MP<br /><input type="number" name="mp" placeholder="MP" min=0 step=1 value='+(+player.mp)+' /></div>'+
							'<div>Arousal<br /><input type="number" name="arousal" placeholder="Arousal" min=0 step=1 value='+player.arousal+' /></div>'+
							'<div>BASE HP<br /><input type="number" name="max_hp" min=1 step=1 value='+(+player.max_hp)+' /></div>'+
							'<div>BASE AP<br /><input type="number" name="max_ap" min=1 step=1 value='+(+player.max_ap)+' /></div>'+
							'<div>BASE MP<br /><input type="number" name="max_mp" min=1 step=1 value='+(+player.max_mp)+' /></div>'+
							'<div>Max Arousal<br /><input type="number" name="max_arousal" min=1 step=1 value='+player.max_arousal+' /></div>'+
							'<div>Team<br /><input type="number" name="team" placeholder="Team" min=0 step=1 value='+(+player.team)+' /></div>'+
							'<div></div>'+
							'<div></div>'+
						'</div>'+
						'Tags<br /><textarea name="tags">'+esc(player.tags.join(' '))+'</textarea>'+
						'Description<br /><textarea name="description">'+esc(player.description)+'</textarea>'+
					'</div>'+

					'<div class="right">'+
						'<img class="player_icon_preview" src="'+esc(player.icon)+'" />'+
						'<div class="flexThreeColumns">'+
							'<div>Stamina<br /><input type="number" name="stamina" step=1 value='+(+player.stamina)+' /></div>'+
							'<div>Agility<br /><input type="number" name="agility" step=1 value='+(+player.agility)+' /></div>'+
							'<div>Intellect<br /><input type="number" name="intellect" step=1 value='+(+player.intellect)+' /></div>'+
						'</div>'+
						'<h3>Resistance:</h3>'+

						'<div class="flexThreeColumns">'
						;

						for(let i in Action.Types){
								let t = Action.Types[i];
							html += '<div title="'+t+'">'+(t.length > 5 ? t.substr(0,4)+'.' : t)+' <input type="number" name="sv'+t+'" step=1 style="width:4vmax;padding:0 0.25vmax;" value="'+(+player['sv'+t])+'" /></div>';
						}
						html += '</div>';

						html += '<h3>BON Stats:</h3>';

						html += '<div class="flexThreeColumns">';
						for(let i in Action.Types){
							let t = Action.Types[i];
							html += '<div title="'+t+'">'+(t.length > 5 ? t.substr(0,4)+'.' : t)+' <input type="number" name="bon'+t+'" step=1 value="'+(+player['bon'+t])+'" style="width:4vmax;padding:0 0.25vmax;" /></div>';
						}
						html += '</div>';

						html += '<h3>Ability Preview:</h3>';
						for( let action of player.getActions() ){
							if( action.hidden || action.semi_hidden )
								continue;
							html += '<div class="action tooltipParent">'+esc(action.name);
								html += '<div class="tooltip actionTooltip">';
									html += action.getTooltipText();
								html += '</div>';
							html += '</div>';
						}

						html += '<h3>Asset Preview:</h3><div class="inventory">';
						for( let asset of player.assets ){
							html += '<div class="item tooltipParent">'+esc(asset.name);
								html += '<div class="tooltip">';
									html += esc(asset.description);
								html += '</div>';
							html += '</div>';
						}
						html += '</div>';
						
					html += '</div>'+
				'</div>';
				html+= '<div style="text-align:center"><input type="submit" value="Save" /> <input type="button" class="cancelEdit red" value="Cancel" /></div>';
			html+= '</form>';

		game.modal.set(html);

		// Events
		$("#modal input[name=icon]").on('change', function(){
			$("#modal img.player_icon_preview").attr('src',$(this).val());
		});
		$("#playerEditor").on('submit', function(event){

			event.stopImmediatePropagation();

			player.name = $("#modal input[name=name]").val().trim();
			player.species = $("#modal input[name=species]").val().trim();
			player.description = $("#modal textarea[name=description]").val().trim();
			player.icon = $("#modal input[name=icon]").val().trim();
			player.max_hp = +$("#modal input[name=max_hp]").val();
			player.max_ap = +$("#modal input[name=max_ap]").val();
			player.max_mp = +$("#modal input[name=max_mp]").val();
			player.max_arousal = +$("#modal input[name=max_arousal]").val();
			player.auto_play = $("#modal input[name=auto_play]").prop('checked');
			player.hp = +$("#modal input[name=hp]").val();
			player.ap = +$("#modal input[name=ap]").val();
			player.mp = +$("#modal input[name=mp]").val();
			player.arousal = +$("#modal input[name=arousal]").val();

			player.stamina = +$("#modal input[name=stamina]").val();
			player.agility = +$("#modal input[name=agility]").val();
			player.intellect = +$("#modal input[name=intellect]").val();
			
			player.level = +$("#modal input[name=level]").val();
			player.size = +$("#modal input[name=size]").val();

			let cName = $('#modal select[name=class]').val().trim();
			if( cName ){
				let lib = glib.getFull('PlayerClass');
				let cl = lib[cName];
				if( cl ){
					player.class = cl;
					player.addActionsForClass();
				}
			}
			

			$("#modal input").filter(function(){ 
				let n = $(this).attr('name');
				if( !n )
					return false;
				return n.substr(0,3) === 'bon' || n.substr(0,2) === 'sv';
			}).each(function(){
				player[$(this).attr('name')] = Math.floor($(this).val());
			});

			if( game.net.isConnected() && game.is_host ){
				player.netgame_owner = $("#modal select[name=netgame_owner]").val();
				player.netgame_owner_name = game.net.getPlayerNameById(player.netgame_owner);
			}

			if( player.hp > player.getMaxHP() )
				player.hp = player.getMaxHP();
			if( player.ap > player.getMaxAP() )
				player.ap = player.getMaxAP();
			if( player.mp > player.getMaxMP() )
				player.mp = player.getMaxMP();
			
			player.team = +$("#modal input[name=team]").val();
			player.tags = $("#modal textarea[name=tags]").val().split(' ').filter(el => {
				if(!el.trim())
					return false;
				return true;
			});
			if( !game.playerExists(player) )
				game.addPlayer(player);

			game.save();
			th.draw();
			th.drawPlayerInspector(player);

			return false;

		});
		$("#randomizePlayer").on('click', () => {
			
			let type = $("#playerEditor select[name=randomize_type]").val();
			let allowed;
			if( type !== '_RANDOM_' )
				allowed = [type];

			let pl = PlayerTemplate.generate(+$("#playerEditor input[name=level]").val(), allowed);
			if( pl ){
				let data = pl.save(true);
				delete pl.id;
				player.load(data);
				this.drawPlayerEditor(player);
			}
			else
				console.error("Unable to generate a player template with those conditions");

		});

		$("#playerEditor input.cancelEdit").on('click', () => {
			if( game.getPlayerById(player.id) )
				this.drawPlayerInspector(player);
			else
				game.modal.close();
		});

	}

	// Asset editor
	drawAssetEditor( asset, player ){

		let a = asset;
		if( !a ){
			a = new Asset();
			a.level = game.getHighestLevelPlayer();
		}
		else if( !asset._custom && !asset.parent ){
			a = asset.clone();	// Clone the base asset
			asset = undefined;	// Make sure it gets inserted into the library
		}

		let html = '<div class="inventory"><form id="saveAsset">';
			html+= '<div class="centered">'+
				'<input type="button" class="generateRandom yellow" value="Randomize As:" /> <select name="randSlot">';
			for( let i in Asset.Slots ){
				if( i === 'none' )
					continue;
				html += '<option value="'+i+'">'+i+'</option>';
			}
			html+= '</select></div><br />';

			// This item is owned
			if( a.parent ){
					html += '<div class="centered">';
					html += 'Owner : <select name="owner">';
					for( let player of game.players )
						html += '<option value="'+esc(player.id)+'" '+(a.parent.id === player.id ? 'selected' : '')+'>'+esc(player.name)+'</option>';
					html += '</select>'+
				'</div><br />';

			}


			html += '<div class="flexThreeColumns">';
				html += '<div>Unique ID:<br /><input type="text" name="label" value="'+esc(a.label)+'" /></div>';
				html += '<div>Name:<br /><input type="text" name="name" value="'+esc(a.name)+'" /></div>';
				html += '<div>Level:<br /><input type="number" min=1 step=1 name="level" value="'+(+a.level)+'" /></div>';
				html += '<div>Durability Bonus:<br /><input type="number" min=0 step=1 name="durability_bonus" value="'+(+a.durability_bonus)+'" /></div>';
				html += '<div>Weight in grams:<br /><input type="number" min=0 step=1 name="weight" value="'+(+a.weight)+'" /></div>';
				html += '<div>Rarity:<br /><input type="number" min=0 step=1 max=4 name="rarity" value="'+(+a.rarity)+'" /></div>';
				if( a.parent )
					html += '<div>Durability:<br /><input type="number" min=0 step=1 name="durability" value="'+(+a.durability)+'" /></div>';
			html += '</div>';
			
			
			html += 'Slots:<br />';
			for( let i in Asset.Slots ){
				if( Asset.Slots[i] === Asset.Slots.none )
					continue;
				html += '<label><input type="checkbox" name="slots" value="'+Asset.Slots[i]+'" '+(~a.slots.indexOf(Asset.Slots[i]) ? 'checked' : '')+' />'+i+'</label>';
			}
			html += '<br />';
			html += 'Description:<br />';
			html += '<textarea name="description">'+esc(a.description, true)+'</textarea><br />';
			html += 'Tags: <br />';
			html += '<textarea name="tags">'+esc(a.tags.map(el => el.substr(3)).join(' '), true)+'</textarea><br />';
			html += '<br />';
			html += 'Effects JSON - <input type="button" class="autogen yellow" value="Auto Generate Stats for Level" /><br />';
			html += 'Quick Stats: <span class="quickStats"></span>';
			html += '<textarea name="wrappers" style="width:100%; height:20vh;">'+esc(JSON.stringify(a.wrappers.map(el => el.save(true)), null, 4), true)+'</textarea><br />';

			html += '<input type="submit" value="Save" class="green"> <input type="button" class="back red" value="Back" />';
		html+= '</form></div>';
		this.parent.modal.set(html);

		let updateEffectStats = () => {
			try{
				let wrappers = JSON.parse($("#saveAsset textarea[name=wrappers]").val().trim()).map(el => new Wrapper(el));
				let stats = {};
				for( let i in Action.Types ){
					stats['sv'+Action.Types[i]] = 0;
					stats['bon'+Action.Types[i]] = 0;
				}

				for( let i in Player.primaryStats )
					stats[i+'Modifier'] = 0;

				for( let wrapper of wrappers ){

					for( let effect of wrapper.effects ){

						if( stats.hasOwnProperty(effect.type) && effect.data && !isNaN(effect.data.amount) )
							stats[effect.type] += effect.data.amount;

					}

				}

				let out = '';
				for(let i in stats ){
					if( stats[i] )
						out += '<div class="quickStat">'+stats[i]+' '+Asset.stringifyStat(i)+'</div>';
				}
				$("#saveAsset span.quickStats").html(out);
			}catch(err){}
		};

		updateEffectStats();

		$("#saveAsset").on('submit', () => {
			let root = $("#saveAsset");

			a.label = $("input[name=label]", root).val().trim();
			a.name = $("input[name=name]", root).val().trim();
			a.level = +$("input[name=level]", root).val();
			a.durability_bonus = +$("input[name=durability_bonus]", root).val();
			a.weight = +$("input[name=weight]", root).val();
			a.rarity = +$("input[name=rarity]", root).val();
			if( a.parent ){
				a.durability = +$("input[name=durability]", root).val();
			}
			
			a.slots = [];
			$("input[name=slots]:checked", root).each(function(){ a.slots.push($(this).val()); });
			
			a.description = $("textarea[name=description]", root).val().trim();
			a.tags = $("textarea[name=tags]", root).val().trim().split(' ').filter(el => el !== "").map(el => 'as_'+el);
			try{
				a.wrappers = JSON.parse($("textarea[name=wrappers]", root).val().trim()).map(el => new Wrapper(el, a.parent));
			}catch(err){
				console.error("Unable to save, invalid JSON: ", err);
				return false;
			}

			if( a.parent ){
				a.repair(0);	// Makes sure durability doesn't go above max
				let owner = $("select[name=owner]", root).val();
				let newOwner = game.getPlayerById(owner);
				if( owner !== a.parent.id && newOwner ){
					// Creates a clone
					newOwner.addAsset(a);
					// Remove form old owner
					a.parent.destroyAsset(a.id);
				}
			}

			if( !asset )
				this.parent.addToLibrary(a);

			game.save();
			if( a.parent )
				this.drawPlayerInspector(player.id);
			else
				this.drawPlayerAssetSelector(player);
			return false;
		});

		$("#saveAsset input.autogen").on('click', () => {

			let slots = [];
			$("#saveAsset input[name=slots]:checked").each(function(){ slots.push($(this).val()); });
			let level = +$("#saveAsset input[name=level]").val();
			let wrapper = Asset.generateStatWrapper(level, slots.length);
			$("#saveAsset textarea[name=wrappers]").val(JSON.stringify([wrapper.save(true)], null, 4));
			updateEffectStats();

		});

		$("#saveAsset textarea[name=wrappers]").on('change', function(){
			let val = $(this).val().trim();
			try{
				val = JSON.parse(val);
				$(this).val(JSON.stringify(val, null, 4));
				updateEffectStats();
			}catch(err){
				let nr = +err.message.split(' ').pop();
				if( !isNaN(nr) ){
					this.focus();
					this.selectionEnd = this.selectionStart = nr;
				}
				alert(err);
			}
		});

		$("#saveAsset input.back").on('click', () => {
			if( a.parent )
				this.drawPlayerInspector(player);
			else
				this.drawPlayerAssetSelector(player);
		});

		$("#saveAsset input.generateRandom").on('click', () => {

			let ass = Asset.generate($("#saveAsset select[name=randSlot]").val(), +$("#saveAsset input[name=level]").val());

			if(!ass)
				return;

			$("#saveAsset input[name=label]").val(ass.label);
			$("#saveAsset input[name=name]").val(ass.name);
			$("#saveAsset textarea[name=description]").val(ass.description);
			$("#saveAsset input[name=level]").val(ass.level);
			$("#saveAsset input[name=durability_bonus]").val(ass.durability_bonus);
			$("#saveAsset input[name=weight]").val(ass.weight);
			$("#saveAsset input[name=rarity]").val(ass.rarity);
			$("#saveAsset input[name=durability]").val(ass.getMaxDurability());
			ass.durability = ass.getMaxDurability();
			
			$("#saveAsset input[name=slots]").each(function(){
				$(this).prop('checked', ass.slots.indexOf($(this).attr('value')) !== -1);
			});
			$("#saveAsset textarea[name=tags]").val(ass.tags.map(el => el.substr(3)).join(' '));
			$("#saveAsset textarea[name=wrappers]").val(JSON.stringify(ass.wrappers.map(el => el.save(true)), null, 4));
			
			updateEffectStats();

		});

	}
	






	/* MODAL Selectionbox */
	// Draws a selector box with my players. If keepPosition is falsy, it uses the mouse position
	drawMyPlayerSelector( callback, keepPosition ){

		let players = game.getMyPlayers().filter(p => p.team === 0);
		game.modal.prepareSelectionBox(keepPosition);
		for( let pl of players )
			game.modal.addSelectionBoxItem(pl.name, false, pl.id);
		
		game.modal.onSelectionBox(callback);
		
	}

	// Draws a loot selector for container. Container is a DungeonAsset
	drawContainerLootSelector( container ){

		let th = this;
		let playAnimation = container._stage_mesh.userData.playAnimation;

		let players = game.getMyPlayers();
		if( !players.length )
			return false;

		game.modal.prepareSelectionBox();
		for( let item of container.loot )
			game.modal.addSelectionBoxItem(item.name, item.getTooltipText(), item.id, [Asset.RarityNames[item.rarity]]);

		if( playAnimation )
			playAnimation("open");
		game.modal.onSelectionBox(function(){
			let asset = $(this).attr('data-id');
			th.drawMyPlayerSelector(function(){
				container.lootToPlayer(asset, game.getPlayerById($(this).attr('data-id')));
				game.modal.closeSelectionBox();
			}, true);
		});
		game.modal.onSelectionBoxClose(() => {
			if( playAnimation && container.isInteractive() )
				playAnimation("idle");
		});

	}

	

	

	

	
	/* VFX */
	// Sets a visual FX on a player
	setPlayerVisual( player, fx ){

		if( typeof player === "string" )
			player = game.getPlayerById(player);

		if(!player)
			return;

		game.net.sendHostTask(NetworkManager.dmTasks.sendVisual, {
			player : player.id,
			fx : fx
		});

		
		let el = $('div.player[data-id=\''+esc(player.id)+'\']', this.players);
		if(!el)
			return;

		let classes = el.attr('class').split(/\s+/);
		for( let c of classes ){

			if( c.substr(0, 2) === "fx" )
				el.toggleClass(c, false);

		}

		setTimeout(() => {
			el.toggleClass(fx, true);	
		}, 50);

	}




	/* EVENTS */
	// Handles slash commands
	onConsoleMessage(){

		this.consolePointer = 0;
		let message = this.console.text().trim();
		if( !message )
			return;
		this.addMessageToConsoleLog(message);

		this.console.text('');
		let isSlashCommand = message.substr(0,1) === '/';
		if( isSlashCommand ){
			message = message.substr(1);
			let spl = message.split(' ');

			// See if this was a player task
			let start = spl.join(' ').toLowerCase();
			for(let player of this.parent.players ){
				if( start.startsWith(player.name.toLowerCase()+" ") ){

					let name = player.name;
					spl = spl.join(' ').substr(name.length+1).trim().split(' ');
					let task = spl.shift();

					// No task, just say
					spl.unshift(task);
					this.parent.speakAs(player.id, spl.join(' '));
					
					return;

				}
			}


			// Custom task
			let task = spl.shift().toLowerCase();

			// Roll task, <a>, <b> or <b>, or void for 1d20
			if( task === "r" || task == "pr" ){
				let a = 1, b = 20;
				if( !isNaN(spl[0]) )
					b = Math.floor(spl[0]);
				if( !isNaN(spl[1]) ){
					a = b;
					b = Math.floor(spl[1]);
				}

				let result = 0;
				if( a > b )
					result = a;
				else
					result = Math.floor(Math.random()*(b-a)+a);

				// Public roll
				if( task == "pr" ){
					this.addText("The DM's roll between "+a+" and "+b+" yielded |s|"+result+"|/s|", undefined, undefined, undefined, 'dmChat ooc');
					return;
				}
				
				// publish it to you
				this.addText("Roll between "+a+" and "+b+" yielded |s|"+result+"|/s|", undefined, undefined, undefined, 'dmInternal');
				return;

			}
			
			if( task == "auto" ){
				this.parent.getTurnPlayer().autoPlay(true);
				return;
			}

			if( task == "clear" ){
				game.chat_log = [];
				game.save();
				this.clear();
				return;
			}

			if( task == "error" ){
				return this.addError(spl.join(' '));
			}
			if( task == "notice" ){
				return this.addNotice(spl.join(' '));
			}
			
			this.addText("Unknown command", undefined, undefined, undefined, "dmInternal");
		
		}
		else{

			let speaker = 'DM';
			if( !game.is_host )
				speaker = game.getMyFirstPlayer().id;
			
			if( message.substr(0,4).toLowerCase() === 'ooc ' || !speaker )
				speaker = 'ooc';

			this.parent.speakAs(speaker, message);
		}

		

	}


	/* SFX */
	getPlayerAudioOffset( player ){

		let out = {x:0,y:0,z:-1};
		if( !player )
			return out;
			
		let element = $('div.player[data-id='+esc(player.id)+']', this.players);
		if( element.length ){
			let pos = element.offset(),
				width = element.width(),
				height = element.height()
			;
			let x = (pos.left+width/2)/window.innerWidth,
				y = (pos.top+height/2)/window.innerHeight
			;
			out.x = x*2-1;
			out.y = y*2-1;
		}
		return out;
	}

}
