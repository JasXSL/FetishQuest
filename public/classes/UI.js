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
import * as THREE from '../ext/THREE.js';
import { DungeonRoomAsset } from "./Dungeon.js";

export default class UI{

	constructor(parent){
		
		const th = this;
		this.parent = parent;
		this.board = $("#ui");
		this.players = $("#ui > div.players");
		this.friendly = $("#ui > div.players > div.left");
		this.hostile = $("#ui > div.players > div.right");
		this.action_selector = $("#ui > div.actionbar");
		this.text = $("#ui div.text > div.content");
		this.console = $("#ui > div.middle > div.chat");
		this.gameIcons = $("#gameIcons");
		this.netgamePlayers = $("#netgamePlayers");
		this.multiCastPicker = $("#multiCastPicker");
		this.roleplay = $("#roleplay");
		this.selected_rp = '';	// ID of selected roleplay option
		this.tooltip = $("#tooltip");
		this.loadingScreen = $("#loading_screen");
		this.loadingBar = $("> div.loadingBar > div.slider", this.loadingScreen);
		this.loadingStatusText = $("> p > span", this.loadingScreen);
		this.loadingMaxSteps = 0;	// Steps to load
		this.yourTurn = $("#ui > div.yourTurnBadge");

		// Active player has viable moves
		this._has_moves = false;
		this.visible = localStorage.ui_visible === undefined ? true : Boolean(+localStorage.ui_visible);	// main UI layer visible

		this.previousConsoleCommands = [];
		try{
			this.previousConsoleCommands = JSON.parse(localStorage.previousConsoleCommands);
			if( !Array.isArray(this.previousConsoleCommands) )
				this.previousConsoleCommands = [];
		}catch(err){}
		this.consolePointer = 0;

		// Targeting
		this.action_selected = null;
		this.targets_selected = [];

		this.captureActionMessage = false;	// Lets you caption statMessage classed message until the next non stat messaged one appears 
		this.capturedMessages = [];
		this.arrowHeld = false;				// Set when you pick an ability and determines if you're using drag and drop or not
		this.mouseDown = false;
		this.touch_start = new THREE.Vector2(0,0);	// Coordinates where touch was started (touchscreen only)
		this.touch_update = new THREE.Vector2(0,0);	// Last touch update positoin
		this.block_inspect = false;					// prevents left click inspect

		this.console.off('keydown').on('keydown', event => {
			event.stopImmediatePropagation();
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

		$(document).off('keydown').on('keydown', event => {

			if( event.target !== document.body )
				return;
			if( event.key === ' '){
				game.uiAudio( 'map_toggle' );
				this.toggle();
			}
			else if( event.key === 'i' ){
				if( game.modal.open === true && $("#modal > div.wrapper > div.content > div.inventory").length )
					game.modal.close();
				else{
					game.uiAudio( 'backpack' );
					this.drawPlayerInventory();
				}
			}
			else if( event.key === 'l' ){
				if( game.modal.open === true && $("#modal > div.wrapper > div.content > div.modalQuests").length )
					game.modal.close();
				else{
					this.drawQuests();
					game.uiAudio( 'toggle_quests' );
				}
			}
			else if( event.key === 'Escape' && game.modal.open ){
				game.uiClick();
				game.modal.close();
			}


		});

		this.board.off('mouseup touchend').on('mouseup touchend', function(event){

			if( !th.mouseDown )
				return;

			th.mouseDown = false;

			if( event.touches && event.touches.length ){
				return;
			}

			if( ($(event.target).is('div.action.spellSelected') && !th.arrowHeld) ){
				return;
			}

			// Handle using an action on a player
			if( 
				th.action_selected && 
				event.target.id !== 'execMultiCast' && 
				($(event.target).attr('data-id') !== th.action_selected.id || th.arrowHeld)
			){

				let selectedPlayers = $(event.target);
				if( !selectedPlayers.length || !selectedPlayers.is('div.player[data-id]') )
					selectedPlayers = $("div.player.highlighted", th.players);

				if( selectedPlayers.length ){
					th.playerMouseUp(selectedPlayers[0]);
				}

				if( th.action_selected.max_targets < 2 || !selectedPlayers.length )
					th.closeTargetSelector();
				else{
					game.renderer.toggleArrow();
				}
				if( event.cancelable )
					event.preventDefault();
			}


		});

		this.board.off('mousedown touchstart').on('mousedown touchstart', function(event){
			th.mouseDown = true;
		});

		this.board.toggleClass("dev", this.showDMTools());

	}

	// Takes the 3d canvases
	ini( map, fx ){

		this.map = map;
		this.fx = fx;
		$("#renderer").html(map);
		$("#fx").html(fx);
		this.toggle(this.visible);

	}

	showDMTools(){
		return !Boolean(+localStorage.hide_dm_tools);
	}

	destructor(){
		this.clear();
	}


	// Toggles the UI overlay
	toggle( visible ){

		if( visible !== undefined )
			this.visible = !!visible;
		else
			this.visible = !this.visible;
		localStorage.ui_visible = +this.visible;
		game.renderer.hblur.enabled = game.renderer.vblur.enabled = this.visible;
		this.board.toggleClass('hidden', !this.visible);
		$("[data-id=map]", this.gameIcons).toggleClass("highlighted", this.visible);
		$("#mainMenuToggle div[data-id=map]").toggleClass("highlighted", this.visible);

	}




	/* MAIN BOARD */
	// Updates everything
	draw(){

		this.drawPlayers();
		this.drawGameIcons();
		this.drawActionSelector();
		this.drawRoleplay();
		this.bindTooltips();

	}

	// Draws action selector for a player
	drawActionSelector( player ){

		if( !player )
			player = game.getMyActivePlayer();


		if( !player ){
			this.action_selector.html('Spectating');
			this.yourTurn.toggleClass('hidden', true);
			return;
		}

		let actions = player.getActions(), 
			th = this,
			html = ''
		;

		const myTurn = game.getTurnPlayer().id === game.getMyActivePlayer().id || !game.battle_active;
		this.yourTurn.toggleClass('hidden', !myTurn || !game.battle_active);


		// Resources
		html += '<div class="resources">';
			html += '<div class="stat ap">';
			for( let i = 0; i< player.getMaxAP(); ++i)
				html += '<div class="point '+(i < player.ap ? 'filled' : '')+'"></div>';
			html += '</div>';

			html += '<div class="stat mp">';
			for( let i = 0; i< player.getMaxMP(); ++i)
				html += '<div class="point '+(i < player.mp ? 'filled' : '')+'"></div>';
			html += '</div>';

		html += '</div>';

		html += '<div class="actions">';
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

		let castableActions = 0;
		for( let action of actions ){

			if( !action.isVisible() || action.no_action_selector )
				continue;

			let castable = action.castable() && myTurn;
			castableActions += !!castable;

			const castableClass = (castable ? 'enabled' : 'disabled');

			html+= '<div class="'+
				'action button tooltipParent tooltipAbove '+
				(action.detrimental ? 'detrimental' : 'beneficial')+' '+
				castableClass+' '+
				(action.isAssetAction() ? ' item '+Asset.RarityNames[action.parent.rarity] : '')+
				'" data-id="'+esc(action.id)+'">'
			;

			html += '<img src="media/wrapper_icons/'+esc(action.getIcon())+'.svg" />';

			// This action is tied to an asset
			if( action.isAssetAction() ){
				html += '<div class="uses">'+existing[action.label]+'</div>';
			}
			else if( action._charges > 1 )
				html += '<div class="uses">'+action._charges+'</div>';
			

			html += (action._cooldown > 0 ? '<div class="CD"><span>'+action._cooldown+'</span></div>' : '')+
				'<div class="tooltip actionTooltip '+castableClass+'">'+
					action.getTooltipText()+
				'</div>'+
			'</div>';

		}

		if( game.battle_active ){
			let etcolor = 'disabled';
			if( myTurn ){
				etcolor = 'enabled';
				// Any moves left?
				if( !castableActions ){
					etcolor = 'highlighted';
				}
				if( this._has_moves !== Boolean(castableActions) ){
					this._has_moves = Boolean(castableActions);
					if( !castableActions ){
						game.uiAudio( 'no_moves' );
					}
				}
			}
			html += '<div data-id="end-turn" class="action button autoWidth '+etcolor+'">End Turn</div>';
		}

		html += '</div>';

		this.action_selector.html(html);

		// Bind events
		$("div.action", this.action_selector).on('mousedown mouseover mouseout click touchstart touchmove', function(event){

			let id = $(this).attr("data-id");
			let spell = player.getActionById(id);
			const enabled = $(this).is('.enabled');


			const targetable = spell && spell.targetable();

			if( event.type === 'touchstart' || event.type === 'touchmove' ){
				const type = event.type;
				event = event.touches[0];
				event.type = type;
			}


			// Drag mouseover
			if( event.type === 'touchmove' && th.action_selected && targetable ){

				let pre = th.touch_update.clone();
				th.touch_update.x = event.screenX;
				th.touch_update.y = event.screenY;
				const oDist = th.touch_start.distanceTo(pre);
				const nDist = th.touch_start.distanceTo(th.touch_update);
				if( oDist > 45 !== nDist > 45 ){
					if( nDist > 45 ){
						th.dragStart( this, true );
					}else{
						th.drawSpellCosts(spell);
					}
				}

				// Scan player elements
				$("div.player.castTarget", th.players).each((id, el) => {

					const pos = $(el).offset();
					const size = {x:$(el).outerWidth(), y:$(el).outerHeight()};
					const highlighted = (
						th.touch_update.x > pos.left && th.touch_update.x < pos.left+size.x &&
						th.touch_update.y > pos.top && th.touch_update.y < pos.top+size.y
					);
					$(el).toggleClass('highlighted', highlighted);

				});

			}

			if( th.action_selected && th.action_selected.id === spell.id && (event.type === 'mousedown' || event.type === 'touchstart') )
				return;

			if( th.action_selected && th.action_selected.id !== spell.id && (event.type === 'mouseover' || event.type === 'mouseout') )
				return;

			

			// End turn override
			if( id === "end-turn" ){

				if( event.type === 'click'){
					th.action_selected = game.getTurnPlayer().getActionByLabel('stdEndTurn');
					th.targets_selected = [game.getTurnPlayer()];
					th.performSelectedAction();
				}
				return;

			}
			
			if( (event.type === 'mousedown' || event.type === 'touchstart') && enabled ){

				th.closeTargetSelector();
				th.action_selected = spell;
				th.targets_selected = [];
				game.uiClick();

				if( targetable )
					$(this).toggleClass('spellSelected', true);

				if( spell.max_targets > 1 && targetable ){
					th.updateMultiCast();
				}

				if( event.type === 'touchstart' ){
					th.touch_start.x = event.screenX;
					th.touch_start.y = event.screenY;
					th.touch_update.copy(th.touch_start);
				}

				th.drawTargetSelector();

			}

			// Single clicked the element
			else if( event.type === 'click' ){
				
				event.preventDefault();
				event.stopImmediatePropagation();
				if( spell.castable(true) ){
					th.targets_selected = [];
					th.drawTargetSelector();
				}

			}

			else if( event.type === 'mouseover' && enabled )
				th.drawSpellCosts(spell);
			else if( event.type === 'mouseout' && enabled ){

				if( th.action_selected && targetable ){
					th.dragStart( this, th.mouseDown );
				}
				th.drawSpellCosts();
				

			}

		});


	}


	// Started dragging a spell
	dragStart( element, mousedown ){

		this.arrowHeld = mousedown;
		const pos = $(element).offset();
		game.renderer.toggleArrow( true, pos.left+$(element).outerWidth()/2, pos.top+$(element).outerHeight()/2 );
		this.drawTargetSelector();

	}

	drawSpellCosts( spell ){
		
		const player = game.getMyActivePlayer();
		
		if( !spell )
			spell = this.action_selected;

		if( !spell ){
			$("div.stat div.point", this.action_selector).toggleClass('highlighted', false);
			return;
		}

		let mpCost = spell.mp, apCost = spell.ap,
			mp = player.mp, ap = player.ap
		;
		if( !game.battle_active )
			apCost = 0;
		
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

	}


	// Players on the board
	drawPlayers(){

		const th = this;

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
				let div = '<div class="player" data-id="'+esc(p.id)+'">'+
					'<div class="content">'+
						'<div class="bg"></div>'+
						'<div class="stats"></div>'+
					'</div>'+
					'<div class="topRight">'+
						'<div class="wrappers"></div>'+
						'<div class="charging"></div>'+
					'</div>'+
					'<div class="targetingStats"></div>'+
					'<div class="speechBubble hidden"><div class="arrow"></div><div class="content">HELLO!</div></div>'+
					'<div class="interactions">'+
						'<div class="interaction hidden" data-type="chat"><img src="media/wrapper_icons/chat-bubble.svg" /></div>'+
						'<div class="interaction hidden" data-type="loot"><img src="media/wrapper_icons/bindle.svg" /></div>'+
					'</div>'+
				'</div>';

				let el = $(div);
				tag.append(el);

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

		// Update the individual players
		for( let p of game.players ){
			this.drawPlayer(p);
			if( p.team === 0 )
				++nr_friendly;
			else
				++nr_hostile;
		}
		

		$("div.left", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_friendly > 10 ? 10 : nr_friendly));
		$("div.right", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_hostile > 10 ? 10 : nr_hostile));

		$("div.player span.name div.owner", this.players).on('click', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			const modal = game.modal;
			modal.prepareSelectionBox();
			const options = [];

			const player = game.getPlayerById($(event.target).closest('div.player').attr('data-id'));
			if( ! player )
				return;

			options.push({id:'',name:'NPC'});
			options.push({id:'DM',name:'YOU'});
			for( let player of game.net.players ){
				if( player.name !== 'DM' )
					options.push(player);
			}

			for( let opt of options )
				modal.addSelectionBoxItem( opt.name, false, opt.id );

			modal.onSelectionBox(event => {
				modal.closeSelectionBox();
				const id = $(event.target).attr('data-id');
				player.netgame_owner = id;
				player.netgame_owner_name = game.net.getPlayerNameById(id);
				th.draw();
				game.save();
			});

		});

		$("div.player span.name div.own", this.players).on('click', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			game.my_player = $(event.target).closest('div.player').attr('data-id');
			this.draw();
			game.save();
		});

		$("div.player span.name div.leader", this.players).on('click', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			const player = game.getPlayerById($(event.target).closest('div.player').attr('data-id'));
			if( player ){
				player.leader = !player.leader;
				game.verifyLeader();
				this.draw();
				game.save();
			}

		});

		// Hover
		$("div.player", this.players).off('mouseover mouseout').on('mouseover mouseout', function( event ){

			const el = $(this);

			if( event.type === 'mouseover' ){
				if( el.hasClass('castTarget') ){
					const pos = el.offset();
					const left = pos.left + el.outerWidth()/2;
					const top = pos.top+el.outerHeight()/2;

					if( th.action_selected )
						game.renderer.setArrowTarget(left, top);
					
					el.toggleClass("highlighted", true);
				}
			}
			else{
				el.toggleClass("highlighted", false);
				if( th.action_selected )
					game.renderer.setArrowTarget();
			}
			

		});

		// click
		// PLAYER PORTRAIT CLICK
		$('div.player', this.players).off('click').on('click', function( event ){

			if( !th.action_selected && !th.block_inspect )
				th.drawPlayerInspector($(this).attr('data-id'));

		});

	}

	drawPlayer(p){

		const tp = game.getTurnPlayer(),
			myTurn = tp && tp.id === p.id,
			el = $("div.player[data-id='"+esc(p.id)+"']", this.players)
		;

		if( myTurn )
			el.toggleClass("active", true);

		const isMine = !!(~game.getMyPlayers().indexOf(p));
		const isMyActive = p === game.getMyActivePlayer();
		const isNPC = !p.netgame_owner;
		
		el.toggleClass('mine', isMine);
		el.toggleClass('myActive', isMyActive);
		
		el.toggleClass('dead', p.hp <= 0);
		el.toggleClass('incapacitated', p.isIncapacitated());

		

		// Check if image has changed
		let imgdiv = $('div.bg', el);
		const icon = p.getActiveIcon();
		if( imgdiv.attr('data-image') !== icon && icon ){
			
			const image = new Image();
			image.onload = () => {
				if( p.getActiveIcon() === icon ){
					imgdiv.css('background-image', 'url('+esc(icon)+')');
					imgdiv.attr('data-image', icon);
				}
			};
			image.src = icon;
			
		}

		let ubDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.upperbody),
			lbDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.lowerbody);
		
		let rb_entries = [];
		rb_entries.push('<span class="arousal resource" title="Arousal.\n+'+Math.round(p.arousal/p.getMaxArousal()*50)+'% corruption damage taken">'+
			Math.round(p.arousal/p.getMaxArousal()*100)+'%'+
		'</span>');
		if( !p.isBeast() ){
			const ubAsset = p.getEquippedAssetsBySlots(Asset.Slots.upperbody);
			const lbAsset = p.getEquippedAssetsBySlots(Asset.Slots.lowerbody);
			const ubDmg = ubAsset.length ? ubAsset[0].getDmgTakenAdd() : 0;
			const lbDmg = lbAsset.length ? lbAsset[0].getDmgTakenAdd() : 0;

			rb_entries.push(
				'<span class="chest resource '+(ubDur > 0 ? '' : 'broken')+'" title="Upperbody armor durability.'+
					(ubDmg ? '\n+'+(ubDmg*100)+'% Damage taken.' : '')+
				'">'+
					Math.ceil(ubDur*100)+'%'+
				'</span>'
			);
			rb_entries.push(
				'<span class="legs resource '+(lbDur > 0 ? '' : 'broken')+'" title="Lowerbody armor durability.'+
					(lbDmg ? '\n+'+(lbDmg*100)+'% Damage taken.' : '')+
				'">'+
				Math.ceil(lbDur*100)+'%</span>'
			);
		}
		rb_entries.push('<span class="MP resource large" title="Mana Points">'+p.mp+'/'+p.getMaxMP()+'</span>');
		rb_entries.push('<span class="AP resource large" title="Action Points">'+p.ap+'/'+p.getMaxAP()+'</span>');
		rb_entries.push('<span class="HP resource large" title="Hit Points">'+p.hp+'/'+p.getMaxHP()+'</span>');
		if( p.team !== 0 )
			rb_entries.reverse();

		let tags = ['',''];
		if( isMine )
			tags = ['<strong>','</strong>'];
		if( isMyActive )
			tags = ['<strong>\u25B6 ',''+' \u25C0</strong>'];
		if( isNPC )
			tags = ['<em>','</em>'];

		let controls = ''+
			(game.is_host ? '<div class="button owner devtool" title="Set character owner"><img src="media/wrapper_icons/id-card.svg" /></div>' : '' )+
			(game.getMyPlayers().length > 1 && !isMyActive && isMine ? '<div class="button own" title="Control this character"><img src="media/wrapper_icons/gamepad.svg" /></div>' : '' )
		;

		let leader = '';
		if( p.team === 0 && game.net.id ){
			if( !game.is_host && p.leader )
				leader = '<img class="leader" src="media/wrapper_icons/crown.svg" /> ';
			else if(game.is_host){
				leader = '<div class="button leader devtool '+(p.leader ? 'selected' : '')+'" title="Only party leaders can interact with doors. One leader is required.">'+
					'<img src="media/wrapper_icons/crown.svg" />'+
				'</div>';
			}
		}
		$("div.content > div.stats", el).html(
			'<span class="name" style="color:'+esc(p.color)+'">'+
				(p.team === 0 ? controls : '')+
				leader+
				'<span>'+tags[0]+esc(p.name)+tags[1]+'</span>'+
				(p.team !== 0 ? controls : '')+
			'</span><br />'+
			rb_entries.join('')
		);

		// Charged actions
		let chargedActions = p.isCasting();
		let ch = '';
		if( chargedActions ){
			
			// Helper function for escaping a player name
			const escPlayerName = pl => esc(pl.name);
			for( let a of chargedActions ){
				ch += '<div class="chAction tooltipParent">';
				ch += esc(a.name)+' at '+a.getChargePlayers().map(escPlayerName);
				ch += '<div class="duration">'+a._cast_time+'</div>';
				ch += '<div class="tooltip">'+a.getTooltipText()+'</div>';
				ch += '</div>';
			}
			
		}
		$("> div.topRight > div.charging", el).html(ch);



		// Interactions
		let rps = game.getRoleplaysForPlayer( p );
		if( game.isInPersistentRoleplay() )
			rps = [];

		$("div.interaction[data-type=chat]", el).toggleClass("hidden", !rps.length).off('click').on('click', event => {
			const rp = game.getRoleplaysForPlayer(p).shift();
			event.stopImmediatePropagation();
			if( rp )
				game.setRoleplay(rp);
		});

		const showLoot = p.isLootableBy(game.getMyActivePlayer());
		$("div.interaction[data-type=loot]", el).toggleClass("hidden", !showLoot).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.drawContainerLootSelector(game.getMyActivePlayer(), p);
		});
		

		// Effect wrappers
		let o = '';
		let wrappers = p.getWrappers();
		wrappers = wrappers.filter(el => el.name.length && el._duration !== 0 && el.parent instanceof Player);
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
					(+wrapper.duration === -1 ? 
						'Permanent' :
						(+wrapper._duration)+' Turn'+(wrapper._duration>1 ? 's' : '')
					)+
					(wrapper.stacks > 1 ? ' | '+wrapper.stacks+' stack'+(wrapper.stacks !== 1 ? 's':'') : '' )+
				'</em><br />'+
				stylizeText(esc(wrapper.getDescription()))+
			'</div>';
			o += '</div>';
		}
		$("> div.topRight > div.wrappers", el).html(o);

		
	}

	// Mouseup on a player
	playerMouseUp( el ){
		
		if( !this.action_selected )
			return;

		$("div.player.castTarget", this.players).toggleClass("highlighted", false);

		this.block_inspect = true;
		setTimeout(() => this.block_inspect = false, 100);

		this.arrowHeld = false;
		// Players are in action selection mode
		if( $(el).is(".castTarget") ){
			
			if( this.targets_selected.length >= this.action_selected.max_targets )
				return false;

			this.targets_selected.push(game.getPlayerById($(el).attr('data-id')));
			this.drawTargetSelector();
			return false;

		}

		// Remove a selected player
		if( $(el).hasClass("targetSelected") ){

			let pl = game.getPlayerById($(el).attr('data-id'));
			for( let i in this.targets_selected ){

				if( this.targets_selected[i] === pl ){

					this.targets_selected.splice(i, 1);
					this.drawTargetSelector();
					return false;

				}

			}

			return false;
		}

	}

	// bottom main menu
	drawGameIcons(){

		const player = game.getMyActivePlayer();

		let th = this;
		let html = 
			'<div class="button'+(!this.visible ? ' highlighted' : '')+'" data-id="map" style="background-image:url(/media/wrapper_icons/treasure-map.svg);"></div>'+
			(player ? '<div class="button" data-id="inventory" style="background-image:url(/media/wrapper_icons/light-backpack.svg);"></div>' : '')+
			'<div class="button" data-id="quest" style="background-image:url(/media/wrapper_icons/bookmarklet.svg);"></div>'+
			'<div class="button" data-id="audioToggle" style="background-image: url(media/wrapper_icons/speaker.svg)">'+
				'<div class="rollout">'+
					'Ambient:'+
					'<input type="range" min=0 max=100 step=1 id="ambientSoundVolume" /><br />'+
					'Music:'+
					'<input type="range" min=0 max=100 step=1 id="musicSoundVolume" /><br />'+
					'FX:'+
					'<input type="range" min=0 max=100 step=1 id="fxSoundVolume" /><br />'+
					'UI:'+
					'<input type="range" min=0 max=100 step=1 id="uiSoundVolume" /><br />'+
					'Master:'+
					'<input type="range" min=0 max=100 step=1 id="masterSoundVolume" />'+
				'</div>'+
			'</div>'+
			'<div data-id="multiplayer" class="button" style="background-image: url(media/wrapper_icons/multiplayer.svg)"></div>'+
			( game.is_host ?
				'<div data-id="DM" class="button" style="background-image: url(media/wrapper_icons/auto-repair.svg)"></div>' : 
				''
			)+
			'<div data-id="mainMenu" class="button autoWidth">Game</div>'
		;
		this.gameIcons.html(html);
		this.toggle(this.visible);

		const masterVolume = $("[data-id=audioToggle]", this.gameIcons);

		


		$("[data-id]", this.gameIcons).on('click', function(event){

			let id = $(this).attr("data-id");
			if( id === 'map' ){
				game.uiAudio( 'map_toggle' );
				th.toggle();
			}
			else if( id === 'quest' ){
				th.drawQuests();
				game.uiAudio( 'toggle_quests' );
			}
			else if( id === "mainMenu" ){
				game.uiAudio( 'menu_generic' );
				th.drawMainMenu();
			}
			else if( id === 'multiplayer' ){
				game.uiAudio( 'menu_generic' );
				th.drawNetSettings();
			}
			else if( id === 'inventory' ){
				game.uiAudio( 'backpack' );
				th.drawPlayerInventory();
			}
			else if( id === 'audioToggle' ){

				let el = $("> div", this);
				el.toggleClass('visible');
				event.preventDefault();
				event.stopImmediatePropagation();
				if( el.hasClass('visible') ){
					window.addEventListener('click', event => {
						$("> div", this).toggleClass('visible', false);
					}, {once:true});
				}

			}
			else if( id === 'DM' ){
				game.uiAudio( 'menu_generic' );
				th.drawDMTools();
			}
		});

		function updateVolumeIcon(){
			masterVolume.css({
				'background-image' : localStorage.masterVolume > 0 ? 'url(media/wrapper_icons/speaker.svg)' : 'url(media/wrapper_icons/speaker-off.svg)'
			});
		}

		let volume = 0;
		if( !isNaN(localStorage.masterVolume) )
			volume = +localStorage.masterVolume;
		$('#masterSoundVolume', masterVolume)
			.val(Math.round(volume*100))
			.off('input').on('input', function(event){
				let preVolume = +localStorage.masterVolume;
				game.setMasterVolume($(this).val()/100);
				if( +localStorage.masterVolume > 0 !== preVolume > 0 )
					updateVolumeIcon();
			});
		// Channels
		$('#ambientSoundVolume', masterVolume)
			.val(Math.round(game.audio_ambient.volume*100))
			.off('input').on('input', function(event){
				game.audio_ambient.setVolume($(this).val()/100);
			});
		$('#fxSoundVolume', masterVolume)
			.val(Math.round(game.audio_fx.volume*100))
			.off('input').on('input', function(event){
				game.audio_fx.setVolume($(this).val()/100);
			});
		$('#musicSoundVolume', masterVolume)
			.val(Math.round(game.audio_music.volume*100))
			.off('input').on('input', function(event){
				game.audio_music.setVolume($(this).val()/100);
			});
		$('#uiSoundVolume', masterVolume)
			.val(Math.round(game.audio_ui.volume*100))
			.off('input').on('input', function(event){
				game.audio_ui.setVolume($(this).val()/100);
			});

		
		$('div.rollout', masterVolume).on('click', event => event.stopImmediatePropagation());

		updateVolumeIcon();

		$("#mainMenuToggle > div").off('click').on('click', function(){
			let id = $(this).attr("data-id");
			if( id === 'toggle' ){
				th.gameIcons.toggleClass('visible');
			}
			else if( id === 'map' ){
				game.uiAudio( 'map_toggle' );
				th.toggle();
			}

		});

	}

	// DM Tools
	drawDMTools(){

		let hideTools = !this.showDMTools();
		
		const th = this;
		let html = 
			'<div class="option button '+(hideTools ? 'inactive' : 'active')+'" data-action="toggleDMTools">'+(hideTools ? 'Show' : 'Hide')+' DM Tools</div>'+
			//'<div class="option button" data-action="generateDungeon">Generate Dungeon</div>'+
			'<div class="option button" data-action="addPlayer">+ Add Player</div>'+
			'<div class="option button" data-action="fullRegen">Restore HPs</div>'
			//'<div class="option button '+(game.dm_writes_texts ? 'active' : 'inactive')+'" data-action="dmTexts">'+(game.dm_writes_texts ? 'Exit DM Mode' : 'Enter DM Mode')+'</div>'
		;
		// If there's more than one team standing, then draw the start battle
		if( game.teamsStanding().length > 1 )
			html += '<div class="option button '+(game.battle_active ? 'active' : 'inactive')+'" data-action="toggleBattle">'+
				(game.battle_active ? 'End Battle' : 'Start Battle')+
			'</div>';

		game.modal.set('<div class="dm_tools">'+html+'</div>');

		// Bind events
		$("#modal div.option[data-action]").off('click').on('click', function(){

			let action = $(this).attr('data-action');
			if( action == "addPlayer" )
				th.drawPlayerEditor();
			else if( action == "toggleBattle" ){
				game.toggleBattle();
				th.drawDMTools();
			}
			else if( action === "fullRegen" )
				game.fullRegen();
			//else if( action === "dmTexts" )
			//	game.toggleAutoMode();
			/*
			else if( action === "generateDungeon" ){
				game.addRandomQuest();
				alert("A random dungeon quest has been generated with "+game.dungeon.rooms.length+" cells and difficulty "+game.dungeon.difficulty);
				
			}
			*/
			else if( action === 'toggleDMTools' ){
				localStorage.hide_dm_tools = +th.showDMTools();
				th.board.toggleClass("dev", th.showDMTools());
				th.drawDMTools();
			}
				

		});

	}



	




	/* ACTION SELECTOR Helpers */
	// Send the action selection
	performSelectedAction(){
		game.useActionOnTarget(
			this.action_selected, 
			this.targets_selected,
			game.getMyActivePlayer()
		);
		this.action_selected = null;
		this.targets_selected = [];

		this.draw();
		this.closeTargetSelector();

		return false;
	}
	// Updates the players with hit chances etc
	// pl defaults to turn player
	drawTargetSelector(){

		const pl = game.getMyActivePlayer();
		const action = this.action_selected;
		if( !action )
			return;

		if( !this.visible )
			this.toggle(true);

		this.updateMultiCast();
		
		$("div.player", this.players).toggleClass("castTarget targetSelected", false);
		const viableTargets = action.getViableTargets();

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

				
			let hit = Math.min(Math.max(Player.getHitChance(pl, t, action), 0), 100);
			let dmgbon = Math.round(Math.max(0, Player.getBonusDamageMultiplier(pl, t, action.type, action.detrimental)*100-100));

			$("div.player[data-id='"+esc(t.id)+"'] div.targetingStats", this.players).html(
				hit >= 100 && !action.detrimental ?
					'Pick Target' :
					hit+'% Hit'+(dmgbon ? '<br />+'+dmgbon+'% Dmg' : '')
			);
			
		}

		

	}

	closeTargetSelector( clearAction = true ){

		$("div.action", this.action_selector).toggleClass('spellSelected', false);
		game.renderer.toggleArrow();
		this.arrowHeld = false; 
		$("div.player", this.players).toggleClass("castTarget targetSelected", false);
		if( clearAction )
			this.action_selected = false;
		this.multiCastPicker.toggleClass('hidden', true);
		this.drawSpellCosts();

	}

	updateMultiCast(){

		const spell = this.action_selected;

		if( spell.max_targets <= 1 )
			return;

		let currentTargets = this.targets_selected.length;
		let ht = 'Pick '+(+spell.min_targets)+' to '+(+spell.max_targets)+' targets.<br />';
		if( currentTargets < spell.min_targets )
			ht += 'Need '+(spell.min_targets-currentTargets)+' more';
		else
			ht += '<input type="button" value="Done" id="execMultiCast" />';
		this.multiCastPicker.html(ht).toggleClass('hidden', false);


		$("#execMultiCast", this.multiCastPicker).on('click', () => {
			this.performSelectedAction();
			return;
		});

	}



	/* REPAIR HELPER */
	// Repairs through an effect wrapper. Wrapper is the wrapper that triggered this.
	drawRepair( sender, target, action ){
		
		let asset;
		if( action && action.isAssetAction() )
			asset = action.parent;

		const inventory = target.getRepairableAssets();
		inventory.sort((a,b) => {
			if( a.equipped && !b.equipped )
				return -1;
			if( b.equipped && !a.equipped )
				return 1;
			if( a.level > b.level )
				return -1;
			if( b.level > a.level )
				return 1;
			if( a.name === b.name )
				return 0;
			return a.name < b.name ? -1 : 1;
		});

		game.modal.prepareSelectionBox();
		for( let item of inventory ){

			game.modal.addSelectionBoxItem( 
				(item.equipped ? '<strong>' : '')+esc(item.name)+(item.equipped ? '</strong>' : ''), 
				item.getTooltipText(), 
				esc(item.id),
				[Asset.RarityNames[item.rarity]],
				false
			);
		}
		game.modal.onSelectionBox(event => {
			
			let element = event.currentTarget,
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

	addSpeechBubble( player, text ){

		const div = $("div.player[data-id='"+player.id+"'] div.speechBubble", this.players);
		if( !div.length )
			return;
		clearTimeout(div[0].fadeTimer);
		div[0].fadeTimer = setTimeout(() => {
			div.toggleClass("hidden", true);
		}, 6000);
		div.toggleClass("hidden", false);
		$("> div.content", div).html(text);

	}

	// Prints a message
	// audioObj can be an object with {id:(str)soundKitId, slot:(str)armorSlot}
	addText( text, evtType, attackerID, targetID, additionalClassName, disregardCapture ){

		let gTypes = GameEvent.Types;
		if( this.captureActionMessage && !disregardCapture ){
			this.capturedMessages.push([...arguments]);
			return;
		}

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
			});

		

		let target = this.parent.getPlayerById(targetID),
			sender = this.parent.getPlayerById(attackerID);

		if( ~[gTypes.battleEnded, gTypes.encounterStarted].indexOf(evtType) )
			acn.push('center');
		else if( ~[gTypes.battleStarted].indexOf(evtType ) )
			acn.push('center', 'battleStarted');
		// RP texts (the big ones) have teams swapped 
		else if( ~acn.indexOf('rpText') && sender && evtType !== GameEvent.Types.turnChanged ){
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

		if( evtType === gTypes.turnChanged )
			acn.push('turnChange');

		let txt = stylizeText(text);
		if( ~acn.indexOf('sided') )
			txt = '<div class="sub">'+txt+'</div>';

		if( ~acn.indexOf('playerChat') && game.initialized ){
			game.uiAudio( 'chat_message' );
			if( acn.indexOf('emote') === -1 ){
				let bubble = text.split(':');
				bubble.shift();
				this.addSpeechBubble(sender, stylizeText(bubble.join(':').trim()));
			}
		}
	
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

		let html = '',
			modal = game.modal,
			modNames = await Mod.getNames(),
			sortedMods = await Mod.getModsOrdered()
		;

		html += '<h1 class="centered">FetishQuest</h1>';
		html += '<p class="centered">This game contains adult content. But you\'ve probably worked that out from the title already.</p>';

		html += '<p class="centered">This is a pre-alpha work in progress. Please consider supporting it on <a href="https://www.patreon.com/jasx_games" target="_blank">Patreon</a>.</p>';
		html += '<p class="centered">Follow development on <a href="http://discord.jasx.org" target="_blank">Discord</a>.</p>';

		html += '<p style="text-align:center"><input type="button" class="green newGameButton" name="newGame" value="New Game" /></p><br />';

		html += '<hr />';

		html += '<div class="mainMenu flexTwoColumns">';

			for( let i in sortedMods )
				sortedMods[i].index = +i;
				
			html += '<div class="left">';

				
				let names = await Game.getNames();
				if( Object.keys(names).length ){

					html += '<h3>Load Game</h3>';
					for(let id in names){
						let name = names[id];
						html+= '<div class="gameListing" data-id="'+esc(id)+'">'+esc(name)+'</div>';
					}
					html += '<p class="subtitle">Ctrl+click to delete</p>';
				}

				
				
			
			html += '</div>';

			html += '<div class="right">';

				html += '<h3>Mods</h3>';
				html += '<table class="editor"><tr><th>Name</th><th>Enabled</th><th>Netgame</th><th>Load Order</th></tr>';
				if( !Object.keys(modNames).length )
					html += '<tr><td colspan=3>No mods installed</td></tr>';
				for( let mod of sortedMods ){
					
					html += '<tr data-mod="'+esc(mod.id)+'">';
						html += '<td>'+esc(mod.name)+'</td>';
						html += '<td><input type="checkbox" class="enableMod" '+(mod.enabled ? 'checked' : '')+' /></td>';
						html += '<td><input type="checkbox" class="netgame" '+(mod.netgame ? 'checked' : '')+' /></td>';
						html += '<td><input type="button" value="Up" class="moveUp" /><input type="button" value="Down" class="moveDown" /></td>';
					html += '</tr>';

				}
				html += '</table>';

				html += 'Install Mod: <input type="file" id="modFile" />';

				if( !game.net.isConnected() )
					html += '<hr /><h3>Join Existing Online Game</h3><form id="joinGame">'+
						'<input type="text" placeholder="Nickname" name="nickname" style="width:auto" value="'+esc(game.net.getStandardNick())+'" />'+
						'<input type="text" placeholder="Game ID" name="gameID" style="width:auto" />'+
						'<input type="submit" value="Join Online Game"  />'+
					'</form>';

			html += '</div>';
			

		html += '</div>';
		
		

		let th = this;
		modal.set(html);

		function saveLoadOrder(){
			// Save order
			const order = {};
			$("#modal div.right table tr[data-mod]").each((idx, el) => {
				order[$(el).attr('data-mod')] = {idx:idx, en:$("input.enableMod", el).is(':checked'), netgame:$("input.netgame", el).is(':checked')};
			});
			Mod.saveLoadOrder(order);
			glib.autoloadMods();

		}

		$("tr[data-mod] input.moveUp, tr[data-mod] input.moveDown").on('click', event => {
			const targ = $(event.currentTarget);
			const up = targ.hasClass('moveUp');
			const row = targ.closest("tr");
			if( up && !row.prev().is('tr:first') )
				row.insertBefore(row.prev());
			else if(!up)
				row.insertAfter(row.next());
			saveLoadOrder();
		});

		$("tr[data-mod] input.enableMod, tr[data-mod] input.netgame").on('change', saveLoadOrder);

		$("#modal input[name=newGame]").on('click', () => this.drawNewGame());
		
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
		
		this.bindTooltips();
		

	}


	drawNewGame(){

		const gallery = [
			{name : 'Otter', size:5, 'icon':'/media/characters/otter.jpg', 'species':'otter', class:'elementalist', tags:[stdTag.penis, stdTag.plFurry, stdTag.plTail, stdTag.plHair, stdTag.plEars, stdTag.plLongTail]},
			{name : 'Wolfess', size:5, 'icon':'/media/characters/wolf.jpg', 'species':'wolf', class:'monk', tags:[stdTag.vagina, stdTag.breasts, stdTag.plFurry, stdTag.plTail, stdTag.plHair, stdTag.plEars, stdTag.plLongTail]},
		];

		let html = '<div class="newGame">'+
			'<h1>New Game</h1>'+
			'<form id="newGameForm">'+
				'<input type="text" class="gameName" value="Unnamed Adventure" /><br />'+
				'<div class="flexTwoColumns">'+
					'<div class="left">'+
						'<h3>Character</h3>'+
						'<div style="text-align:center"><div class="portrait"></div></div>'+
						'<input type="text" name="name" placeholder="Character Name" required /><br />'+
						'<input type="text" name="icon" placeholder="Character Art" /><br />'+
						'<input type="text" name="species" placeholder="Species" required /><br />'+
						'Size: <input type="range" name="size" min=0 max=10 /><br />'+
						'Class: <select name="class">';
						const classes = glib.getFull('PlayerClass');
						for( let c in classes )
							html += '<option value="'+esc(c)+'">'+esc(classes[c].name)+'</option>';
						html += '</select><br />';
						html += 'Tags (control+click to remove): <input type="button" class="addTag" value="Add Tag" /><br />';
						html += '<div class="tags"></div>';
					html += '</div>'+
					'<div class="right"><h3>Gallery</h3>';
					for( let item of gallery )
						html += '<div class="galleryEntry button" data-data="'+esc(JSON.stringify(item))+'" style="background-image:url('+esc(item.icon)+')"></div>';
					html += '</div>'+
				'</div>'+
				'<hr />'+
				'<input type="submit" value="Start Game">'+
			'</form>'
		;
		html += '<div id="datalist" class="hidden">';
			html += '<datalist id="tags"><select>';
			for( let tag in stdTag ){
				const spl = stdTag[tag].split('_');
				if( spl[0] === 'pl' ){
					spl.shift();
					html += '<option value="'+esc(spl.join('_'))+'" />';
				}
			}
			html += '</select></datalist>';
		html += '</div>';

		html += '</div>';
		game.modal.set(html);

		const reloadIcon = () => {
			$("#newGameForm div.portrait").css('background-image', 'url('+esc($("#newGameForm input[name=icon]").val().trim())+')');
		};

		const addTag = tag => {
			tag = tag.split('_');
			tag.shift();
			tag = tag.join('_');
			$("#newGameForm div.tags").append('<input type="text" value="'+esc(tag)+'" name="tag" class="tag" list="tags" />');
			$("#newGameForm input.tag").off('click').on('click', function(event){
				if( event.ctrlKey )
					$(this).remove();
			});
		};

		$("#newGameForm div.galleryEntry").on('click', event => {
			const el = $(event.currentTarget);
			const data = JSON.parse(el.attr('data-data'));
			$("#newGameForm input[name=name]").val(data.name);
			$("#newGameForm input[name=icon]").val(data.icon);
			$("#newGameForm select[name=class]").val(data.class);
			$("#newGameForm input[name=species]").val(data.species);
			$("#newGameForm input[name=size]").val(data.size || 0);
			$("#newGameForm div.tags").html('');
			for( let tag of data.tags )
				addTag(tag);
			reloadIcon();
		});

		$("#newGameForm input[name=icon]").on('change', reloadIcon);
		$("#newGameForm input.addTag").on('change', reloadIcon);

		$("#newGameForm div.galleryEntry:first").click();


		$('#newGameForm').on('submit', () => {

			game.net.disconnect();
			const name = $("input.gameName").val().trim();
			const base = $("#newGameForm");
			const c = glib.get($("select[name=class]").val().trim(), 'PlayerClass');
			if( !c )
				return game.modal.addError("Class not found");
			const player = new Player({
				name : $("input[name=name]", base).val().trim() || 'Player',
				species : $("input[name=species]", base).val().trim().toLowerCase() || 'human',
				icon : $("input[name=icon]", base).val().trim(),
				size : +$("input[name=size]", base).val().trim() || 0,
				class : c.save(true),
				netgame_owner_name : 'DM',
				netgame_owner : 'DM'
			});

			
			const tags = [];
			$("div.tags input.tag", base).each((idx, el) => {
				const val = $(el).val().trim();
				if( val )
					tags.push('pl_'+val);
			});
			player.setTags(tags).addActionsForClass();
			

			if( !name ){
				game.modal.addError("Name is empty");
				return false;
			}

			Game.new(name, [player]);
			game.modal.close();
			return false;

		});

		$("#newGameForm input.addTag").on('click', () => addTag(''));

		this.bindTooltips();

	}


	// Netgame settings
	drawNetSettings(){

		let html = '';
		if( game.net.isConnected() && game.initialized && game.is_host ){
			html += 'Share the invite code or direct invite URL to invite a player to your game:<br /><div class="netgameLink">'+esc(game.net.public_id)+'</div>';
			html += '<div class="netgameLink">'+esc('https://'+window.location.hostname+'/#net/'+game.net.public_id)+'</div>';
		}

		else if( !game.net.isConnected() && game.initialized && game.is_host ){
			html += '<div class="infoBox">';
				html += '<h1>Put Session Online</h1>';
				html += '<p>If you want, you can put this session online and invite your friends.</p>';
				html += '<input type="button" class="blue" name="hostGame" value="Put This Session Online" /><br />';
			html += '</div>';
		}
		if( game.net.isConnected() ){
			html += '<input type="button" class="red" name="disconnect" value="Disconnect" />';

			html += '<h3>Connected players</h3>';
			// Todo: Stylize
			for( let player of game.net.players )
				html+= '<div class="netgame player">'+esc(player.name)+'</div>';

		}

		game.modal.set(html);

		$("#modal input[name=disconnect]").on('click', async () => {
			game.net.disconnect();
			this.drawMainMenu();
		});

		$("#modal input[name=hostGame]").on('click', async () => {
			await game.net.hostGame();
			this.drawNetSettings();
		});

		this.bindTooltips();

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
						(quest.difficulty > 1 ? '['+quest.difficulty+'] ' : '')+quest.name+(quest.isCompleted() ? ' (Completed)' : '')+
					'</div>';
			}
			html += '</div>';
			html += '<div class="right">';
			if( !quests.length )
				html += 'You have no active quests.';
			else{
				html += '<h1>'+esc(selectedQuest.name)+'</h1>';
				html += '<p>'+stylizeText(selectedQuest.description)+'</p>';
				html += '<br /><h3>Objectives</h3>';
				for( let objective of selectedQuest.objectives ){
					html += '<div class="objective'+(objective.isCompleted() ? ' completed ' : '')+'">'+
						esc(objective.name)+
						(objective.amount ? ' - '+objective._amount+'/'+objective.amount : '')+
					'</div>';
				}
				html += '<hr />';
				html += '<h3>Rewards</h3>';
				for( let asset of selectedQuest.rewards ){
					html += '<div class="item tooltipParent '+Asset.RarityNames[asset.rarity]+'">';
						html += esc(asset.name)+(asset._stacks > 1 ? ' x'+asset._stacks : '');
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

		this.bindTooltips();

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
				(player.level < Player.MAX_LEVEL ? this.buildProgressBar(player.experience+'/'+player.getExperienceUntilNextLevel()+' EXP', player.experience/player.getExperienceUntilNextLevel()) : '')+
				'<em>'+esc(player.description)+'</em><br />'+
				'<br />'+(game.is_host ? '<input type="button" class="editPlayer yellow devtool" value="Edit Player" /> ' : '');
				
				if(game.is_host)
					html += '<input type="button" class="red devtool" value="Delete" />';
				html += '<br />';
				

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

				html += '<h3 style="text-align:center">Avoidance</h3>';
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
					html += '<input type="button" value="+ Learn Action" class="addAction blue devtool" />';

				

			html += '</div>';

			// Right side
			html += '<div class="right">'+
				// Image
				'<img src="'+esc(player.icon)+'" class="inspect_icon" />';
				
				// Tags
				html += '<div class="devtool">';
					html += '<h3>Active Tags</h3>';
					html += '<div class="flexAuto">';
						let tags = Array.from(new Set(player.getTags())).sort();
						for( let tag of tags )
							html += '<div class="tag">'+esc(tag)+'</div>';
					html += '</div>';
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

		$("#modal input.addAction").on('click', () => {
			this.drawPlayerActionSelector(player);
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
	
		this.bindTooltips();

	}

	drawAssetTradeTarget( asset, amount ){

		const player = asset.parent;
		const th = this;
		// Draw a list of acceptable targets
		const targets = game.getTeamPlayers( player.team ).filter(el => el.id !== player.id);
		const modal = game.modal;
		modal.prepareSelectionBox( true );
		for( let target of targets )
			modal.addSelectionBoxItem( target.name, '', target.id );
		modal.onSelectionBox(function(){
			const pid = $(this).attr("data-id");
			if( game.tradePlayerItem( player.id, pid, asset.id, amount ) ){
				th.drawPlayerInventory();
			}
			modal.closeSelectionBox();
		});

	}

	// Draws inventory for active player
	drawPlayerInventory(){
		const player = game.getMyActivePlayer();
		const th = this;
		if( !player )
			return;

		// Draw inventory
		let html = '';
		html+= '<div class="inventory flexTwoColumns">';

			let slots = [
				{slot:Asset.Slots.upperbody, icon:'breastplate'},
				{slot:Asset.Slots.lowerbody, icon:'armored-pants'},
				{slot:Asset.Slots.hands, icon:'crossed-swords'}
			];

			// Equipment
			html += '<div class="left">';

				html += this.buildProgressBar(
					(Math.floor(player.getCarriedWeight()/100)/10)+'/'+Math.floor(player.getCarryingCapacity()/1000)+'kg', 
					player.getCarriedWeight()/player.getCarryingCapacity(), 
					player.getCarriedWeight() > player.getCarryingCapacity() ? 'red' : 'yellow'
				)+
				'<br />';

				html += '<h3>Equipment</h3>';
			for( let slot of slots ){
				const asset = player.getEquippedAssetsBySlots(slot.slot, true)[0];
				html += '<div class="equipmentSlot '+(asset ? Asset.RarityNames[asset.rarity] : '')+(asset && asset.durability <= 0 ? ' broken' : '')+' item tooltipParent item" data-slot="'+slot.slot+'" data-id="'+esc(asset ? asset.id : '')+'">'+
					(asset ? 
						'<img class="bg" src="media/wrapper_icons/'+asset.icon+'.svg" /><div class="tooltip">'+asset.getTooltipText()+'</div>' : 
						'<img class="bg template" src="media/wrapper_icons/'+slot.icon+'.svg" />'
					)+
				'</div>';
			}
				html += '<h3>Toolbelt</h3>';

			for( let i =0; i<3; ++i ){
				const asset = player.getEquippedAssetsBySlots(Asset.Slots.action, true)[i];
				html += '<div class="equipmentSlot '+(asset ? Asset.RarityNames[asset.rarity] : '' )+(asset && asset.durability <= 0 ? ' broken' : '')+' item tooltipParent item" data-slot="'+Asset.Slots.action+'" data-id="'+esc(asset ? asset.id : '')+'">'+
					(asset ? 
						'<img class="bg" src="media/wrapper_icons/'+asset.icon+'.svg" /><div class="tooltip">'+asset.getTooltipText()+'</div>' : 
						'<img class="bg template" src="media/wrapper_icons/potion-ball.svg" />'
					)+
				'</div>';
			}


			html += '</div>';

			// listing
			html += '<div class="right">';

				let inv = [];
				for(let asset of player.assets)
					inv.push(asset);
				inv = inv.filter(el => !el.equipped).sort((a,b) => {
					if( a.category !== b.category ){
						return a.category < b.category ? -1 : 1;
					}
					if(a.name === b.name)
						return 0;
					return a.name < b.name ? -1 : 1;
				});
				let cat = '';
				for(let item of inv){
					if( !cat || item.category !== cat ){
						cat = item.category;
						html += '<h3 class="category">'+esc(Asset.CategoriesNames[cat])+'</h3>';
					}
					html += '<div class="item '+Asset.RarityNames[item.rarity]+' tooltipParent '+(item.equippable() ? 'equippable' : '')+(item.equipped ? ' equipped' : '')+(item.durability <= 0 ? ' broken' : '')+'" data-id="'+esc(item.id)+'">';
						html += '<img class="assetIcon" src="media/wrapper_icons/'+esc(item.icon)+'.svg" />';
						html += (item.equipped ? '<strong>' : '')+(item.stacking && item._stacks > 1 ? item._stacks+'x ' : '')+esc(item.name)+(item.equipped ? '<br />['+item.slots.map(el => el.toUpperCase()).join(' + ')+']</strong>' : '');
						html += '<div class="tooltip">';
							html += item.getTooltipText();
						html += '</div>';
					html+= '</div>';
				}
				

				if( game.is_host )
					html+= '<br /><input type="button" value="+ Add Item" class="addInventory blue devtool" /><br /><br />';

				html+= '</div>';

			html += '</div>';


		
	
		
		
		game.modal.set(html);

		game.modal.onPlayerChange(player.id, () => {
			this.drawPlayerInventory();
		});


		$("#modal div.item[data-id]").on('click', function(event){
			
			let id = $(this).attr('data-id');
			let asset = player.getAssetById(id);

			if( event.shiftKey  && game.is_host ){
				if( asset )
					th.drawAssetEditor( asset, player );
			}
			// Toggle equip / use
			else if( asset ){

				const isHotbar = $(this).hasClass('equipmentSlot');
				
				const modal = game.modal;
				modal.prepareSelectionBox();

				

				if( isHotbar )
					modal.addSelectionBoxItem( 'Unequip', '', 'unequip' );
				else if( asset.equippable() )
					modal.addSelectionBoxItem( 'Equip', '', 'equip' );

				if( asset.isConsumable() && asset.isUsable() && (!game.battle_active || (player === game.getTurnPlayer() && isHotbar)) ){
					modal.addSelectionBoxItem( 'Use', asset.use_action.getTooltipText(), 'use' );
				}

				if( !game.battle_active ){
					if( game.getTeamPlayers( player.team ).filter(el => el.id !== player.id).length )
						modal.addSelectionBoxItem( 'Trade', 'Trade this item to another player.', 'trade' );
					modal.addSelectionBoxItem( 'Destroy', 'Destroy this item.', 'destroy' );
				}


				modal.onSelectionBox(function(){
					let element = $(this);
					const task = element.attr('data-id');

					if( (task === 'unequip' || task === 'equip') && asset.equippable() && game.equipPlayerItem(player, id) ){
						
						if( asset.loot_sound )
							game.playFxAudioKitById(asset.loot_sound, player, player );
						th.drawPlayerInventory();
						th.draw();
						
					}
					else if( task === 'use' ){

						let action = asset.use_action;
						let targets = action.getViableTargets();
						if( !targets.length )
							return;

						th.action_selected = action;
						th.targets_selected = [];

						if( action.castable(true) ){
							th.targets_selected = [];
							th.drawTargetSelector();
						}

						if( action.targetable() )
							game.modal.close();
						else
							th.drawPlayerInventory();
						
					}
					else if( task == 'trade' ){

						if( asset.stacking && asset._stacks > 1 ){
							modal.makeSelectionBoxForm(
								'Amount to trade: <input type="number" style="width:4vmax" min=1 max='+(asset._stacks)+' step=1 value=1 /><input type="submit" value="Ok" />',
								function(){
									const amount = Math.floor($("input:first", this).val());
									if( !amount )
										return;
									th.drawAssetTradeTarget(asset, amount);
								}
							);
							return;
						}
						th.drawAssetTradeTarget(asset);
						return;

					}
					else if( task === 'destroy' ){

						modal.prepareSelectionBox( true );
						modal.addSelectionBoxItem( "Are you sure?", '', 'delete' );
						modal.addSelectionBoxItem( "Cancel", '', 'cancel' );
						modal.onSelectionBox(function(){
							const pid = $(this).attr("data-id");
							if( pid === 'delete' && game.deletePlayerItem( player, id) ){
								th.drawPlayerInventory();
								th.draw();
							}
							modal.closeSelectionBox();
						});
						return;
					}

					modal.closeSelectionBox();


				});
				
			}
		});



		$("#modal input.addInventory").on('click', () => {
			this.drawPlayerAssetSelector();
		});

		this.bindTooltips();
		
	}

	// Asset library, allows you to add assets to a player 
	drawPlayerAssetSelector(){

		let html = '',
			th = this
		;
		const player = game.getMyActivePlayer();

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

				game.removeFromLibrary(asset);
				th.drawPlayerAssetSelector();
				th.parent.save();

			}

			else if( event.shiftKey ){

				th.drawAssetEditor(asset, player);

			}

			else if(player.addLibraryAsset(id)){
				await game.save();
				th.drawPlayerInventory();
				th.draw();
			}

		});

		$("#modal input.back").on('click', () => {
			this.drawPlayerInventory();
		});

		$("#modal input.create").on('click', () => this.drawAssetEditor(undefined, player));

		this.bindTooltips();

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

		this.bindTooltips();

	}






	/* MODAL EDITORS */
	// Player editor
	drawPlayerEditor( player ){

		if( !player ){
			player = new Player({}, game);
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

							// Debug
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
							'<div>Size:<br /><input type="range" name="size" value="'+(+player.size)+'" min=0 max=10 step=1 /></div>'+
						'</div>'+
						'Image:<br /><input type="text" name="icon" placeholder="Image URL" value="'+esc(player.icon)+'" /><br />'+
						'<div class="flexThreeColumns">'+
							'<div>HP<br /><input type="number" name="hp" placeholder="HP" min=0 step=1 value='+(+player.hp)+' /></div>'+
							'<div>AP<br /><input type="number" name="ap" placeholder="AP" min=0 step=1 value='+(+player.ap)+' /></div>'+
							'<div>MP<br /><input type="number" name="mp" placeholder="MP" min=0 step=1 value='+(+player.mp)+' /></div>'+
							'<div>Arousal<br /><input type="number" name="arousal" placeholder="Arousal" min=0 step=1 value='+player.arousal+' /></div>'+
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
						'<h3>Avoidance:</h3>'+

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
			if( !game.playerExists(player) ){
				game.addPlayer(player);
				player.onPlacedInWorld();
			}

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

		this.bindTooltips();

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
				html += '<div>Loot Sound:<br /><input type="text" min=0 step=1 name="loot_sound" value="'+esc(a.loot_sound)+'" /></div>';
				html += '<div>Icon:<br /><input type="text" min=0 step=1 max=4 name="icon" value="'+esc(a.icon)+'" /></div>';
				html += '<div><select name="category">';
				for( let cat in Asset.Categories )
					html += '<option value="'+esc(cat)+'" '+(a.category === cat ? 'selected' : '')+'>'+esc(Asset.CategoriesNames[cat])+'</option>';
				html += '</select></div>';

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
			a.loot_sound = $("input[name=loot_sound]", root).val();
			a.category = $("select[name=category]", root).val();
			a.icon = $("input[name=icon]", root).val();
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
			$("#saveAsset input[name=loot_sound]").val(ass.loot_sound);
			$("#saveAsset select[name=category]").val(ass.category);
			$("#saveAsset input[name=icon]").val(ass.icon);
			ass.durability = ass.getMaxDurability();
			
			$("#saveAsset input[name=slots]").each(function(){
				$(this).prop('checked', ass.slots.indexOf($(this).attr('value')) !== -1);
			});
			$("#saveAsset textarea[name=tags]").val(ass.tags.map(el => el.substr(3)).join(' '));
			$("#saveAsset textarea[name=wrappers]").val(JSON.stringify(ass.wrappers.map(el => el.save(true)), null, 4));
			
			updateEffectStats();

		});

		this.bindTooltips();

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

	// Draws a loot selector for container. Container is a DungeonAsset OR Player
	drawContainerLootSelector( player, container ){

		let playAnimation = container instanceof DungeonRoomAsset ? container._stage_mesh.userData.playAnimation : false;

		game.modal.prepareSelectionBox();
		const items = container.getLootableAssets();		// Both player and container have this method
		for( let item of items ){
			game.modal.addSelectionBoxItem(item.name+(item._stacks > 1 ? ' ['+(+item._stacks)+']' : ''), item.getTooltipText(), item.id, [Asset.RarityNames[item.rarity]]);
		}
		if( playAnimation )
			playAnimation("open");
		
		game.modal.onSelectionBox(function(){

			let asset = $(this).attr('data-id');
			container.lootToPlayer(asset, player);			// Both player and DungeonRoomAsset have this method
			game.modal.closeSelectionBox();
			
		});
		game.modal.onSelectionBoxClose(() => {
			if( playAnimation && container.isInteractive() )
				playAnimation("idle");
		});
		this.bindTooltips();

	}

	



	/* Roleplay */
	drawRoleplay(){

		const roleplay = game.roleplay;
		const div = this.roleplay;
		const stage = roleplay.getActiveStage();
		const player = game.getMyActivePlayer();
		if( !roleplay.completed && stage ){
			
			$("div.portrait", div).html(stage.icon ? '<img src="media/characters/'+esc(stage.icon)+'.png"' : '');
			$('> div.left', div).toggleClass('hidden', !stage.icon);
			$("div.text", div).html('<span class="name">'+stylizeText(stage.getName())+'</span><br />'+esc(stage.text));
			let html = '';
			let sel = false;
			for( let response of stage.options ){
				let s = response.id === this.selected_rp;
				if( s )
					sel = true;
				if( response.validate(game.getMyActivePlayer()) )
					html += '<div class="option bg'+(sel ? ' selected' : '')+'" data-id="'+esc(response.id)+'">'+esc(response.text)+'</div>';
			}
			
			$("div.responses", div).html(html);
			if( !sel ){
				this.selected_rp = '';
				$("div.responses div.option[data-id]").on('click', event => {
					const el = $(event.target);
					game.useRoleplayOption(game.getMyActivePlayer(), el.attr('data-id'));
				});
			}

		}
		
		div.toggleClass('hidden', roleplay.completed || !player || player.team !== 0);
		
	}
	rpOptionSelected( id ){
		this.selected_rp = id;
		this.drawRoleplay();
	}




	/* Tooltip */
	setTooltip( parentElement ){

		let text = $("> .tooltip", parentElement)[0];

		if( text ){
			text = $(text.outerHTML);
			text.toggleClass("tooltip", false);
		}
		else 
			text = '';

		this.tooltip
			.html(text)
			.toggleClass("hidden", !parentElement)
		;
		if( parentElement ){
			
			const pe = $(parentElement);
			const pos = pe.offset(),
				width = this.tooltip.outerWidth(),
				height = this.tooltip.outerHeight();

			let left = pos.left-width/2+pe.outerWidth()/2,
				top = pos.top-height;

			const bottomPixel = top, rightPixel = left+width;
			const wh = window.innerHeight, ww = window.innerWidth;

			if( rightPixel > ww )
				left += (ww-rightPixel);
			if( bottomPixel > wh )
				top += (wh-bottomPixel);
			if( left < 0 )
				left = 0;
			if( top < 0 )
				top = 0;

			this.tooltip.css({
				left : left+"px",
				top : top+"px",
			});

		}
	}

	onTooltipMouseover(event){
		this.setTooltip(event.currentTarget);
	}

	onTooltipMouseout(){
		this.setTooltip();
	}

	bindTooltips(){

		const mo = event => this.onTooltipMouseover(event),
			mu = event => this.onTooltipMouseout(event)
		;


		$(".tooltipParent")
			.off('mouseover', mo)
			.off('mouseout', mu)
			.on('mouseover', mo)
			.on('mouseout', mu);

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

	battleVis(){
		setTimeout(() => {
			this.toggle(true);
		}, 1000);
	}

	questAcceptFlyout( title, body ){

		const el = $("#questAccept");
		$(".title", el).html(esc(title));
		$(".questName", el).html(esc(body));
		el.toggleClass('hidden', false);		
		game.renderer.playFX(el,el,"questStart");
		clearTimeout(this._hide_quest_accept);
		this._hide_quest_accept = setTimeout(() => {
			el.toggleClass('hidden', true);
		}, 3000);

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
			
			else if( task == "auto" ){
				game.getTurnPlayer().autoPlay(true);
				return;
			}

			else if( task == "clear" ){
				game.chat_log = [];
				game.save();
				this.clear();
				return;
			}

			else if( task == "error" ){
				return this.addError(spl.join(' '));
			}
			else if( task == "notice" ){
				return this.addNotice(spl.join(' '));
			}
			
			else if( task === "me" ){
				this.sendChat('/'+message);
			}
			else
				this.addText("Unknown command", undefined, undefined, undefined, "dmInternal");

		}
		else{
			this.sendChat(message);
		}

		

	}

	sendChat( message ){

		let speaker = game.getMyActivePlayer();
		if( game.is_host && (!speaker || message.toLowerCase().startsWith("dm ")) )
			speaker = 'DM';
		else if( speaker )
			speaker = speaker.id;
		
		if( message.substr(0,4).toLowerCase() === 'ooc ' || !speaker )
			speaker = 'ooc';

		this.parent.speakAs(speaker, escapeStylizeText(message));	// this is done serverside on the DM too
	}


	/* SFX */
	// Player can also be a dom element
	getPlayerAudioOffset( player ){

		let out = {x:0,y:0,z:-1};
		if( !player )
			return out;
			
		let element = player;
		// Some events might put the player in an array
		if( Array.isArray(element) )
			element = element[0];
		if( player instanceof Player )
			element = $('div.player[data-id='+esc(player.id)+']', this.players);

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


	/* Helpers */
	// percent is a float between 0 and 1
	buildProgressBar( text, percent = 0.0, cname = '' ){
		return '<div class="progressBar '+esc(cname)+'">'+
			'<div class="bar" style="width:'+(+percent*100)+'%;"></div>'+
			'<span class="content">'+esc(text)+'</span>'+
		'</div>';
	}


	/* Loading bar */
	toggleLoadingBar( maxSteps ){
		
		this.loadingScreen.toggleClass("hidden", !maxSteps);

		if( maxSteps > 0 ){
			this.loadingMaxSteps = +maxSteps;
			this.setLoadingBarValue( 0 );
		}
		else{
			this.loadingBar.css({width:0});
		}

	}

	setLoadingBarValue( val ){
		
		if( !this.loadingMaxSteps )
			return;
		val = +val || 0;
		const perc = val/this.loadingMaxSteps;
		this.loadingStatusText.html('('+val+'/'+this.loadingMaxSteps+')');
		this.loadingBar.css({'width': perc*100+'%'});

	}

}
