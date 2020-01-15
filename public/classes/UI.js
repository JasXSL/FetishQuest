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
import Shop from "./Shop.js";
import StaticModal from "./StaticModal.js";
import Modal from "./Modal.js";
import {default as Quest, QuestReward} from './Quest.js';

const NUM_ACTIONS = 18;



export default class UI{

	constructor(parent){
		
		const th = this;
		this.parent = parent;

		this.modal = new Modal(this);					// Variable modal. It's slower and should really only be used for dm tools and yes/no.
		this.staticModal = StaticModal;		// Static modal. These are created in index.html, and are shown/hidden instead of generated.
		this.initialized = false;

		this.board = $("#ui");
		this.players = $("#ui > div.players");
		this.friendly = $("#ui > div.players > div.left");
		this.hostile = $("#ui > div.players > div.right");
		this.action_selector = $("#ui > div.actionbar");
		this.ap_bar = $("div.stat.ap", this.action_selector);
		this.mp_bar = $("div.stat.mp", this.action_selector);
		this.actionbar_actions = $("> div.actions", this.action_selector);

		this.blackScreen = $("#blackScreen");

		this.text = $("#ui > div.middle > div.content");
		this.csl = $("#ui > div.middle > div.chat");
		this.gameIcons = $("#gameIcons");
		this.multiCastPicker = $("#multiCastPicker");
		this.roleplay = $("#roleplay");
		this.selected_rp = '';	// ID of selected roleplay option
		this.tooltip = $("#tooltip");
		this.loadingScreen = $("#loading_screen");
		this.loadingBar = $("> div.loadingBar > div.slider", this.loadingScreen);
		this.loadingStatusText = $("> p > span", this.loadingScreen);
		this.loadingMaxSteps = 0;	// Steps to load
		this.yourTurn = $("#ui > div.yourTurnBadge");
		this.yourTurnBorder = $("#yourTurnBorder");
		this.yourTurnTimer = false;
		this.yourTurnTimeLeft = 0;
		this.yourTurnSoundLoop = false;
		this.mapChat = $("#mapChat");
		this.fct = $("#fct");
		this.fctQue = [];
		this.fctTimer = false;

		

		this.endTurnButton = null;

		this.drawTimer = false;

		this._hold_actionbar = false;	// Workaround for actionbar update being on a timer. Prevents interacting with the action bar until the next draw.
		this._action_used = false;		// Since both click and drag can use an action, this prevents the action from being fired twice from instant casts

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

		this.csl.off('keydown').on('keydown', event => {
			event.stopImmediatePropagation();
			if( event.altKey ){

				if( event.key === "ArrowUp" ){
					if( this.consolePointer === 0 )
						this.addMessageToConsoleLog(this.csl.text());
					++this.consolePointer;
				}
				else if( event.key === "ArrowDown" )
					--this.consolePointer;
				else
					return false;

				this.consolePointer = Math.max(0, Math.min(this.previousConsoleCommands.length-1, this.consolePointer));
				this.csl.text(this.previousConsoleCommands[this.consolePointer]);

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
				if( this.modal.open === true && $("#modal > div.wrapper > div.content > div.inventory").length )
					this.modal.close();
				else{
					game.uiAudio( 'backpack' );
					this.drawPlayerInventory();
				}
			}
			else if( event.key === 'l' ){
				if( this.modal.open === true && $("#modal > div.wrapper > div.content > div.modalQuests").length )
					this.modal.close();
				else{
					this.drawQuests();
					game.uiAudio( 'toggle_quests' );
				}
			}
			else if( event.key === 'Escape' ){
				if( this.modal.open || this.staticModal.active ){
					
					game.uiClick();
					if( this.modal.open ){
						this.modal.close();
						return;
					}

					this.staticModal.close();
					
				}
			}


		});

		this.board.off('mouseup touchend').on('mouseup touchend', function(event){

			if( !th.mouseDown )
				return;

			th.mouseDown = false;
			this._action_used = false;

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
		this.board.toggleClass("bubbles", this.showBubbles());
	}
 
	// Takes the 3d canvases
	ini( map, fx ){

		if( this.initialized )
			return;		

		// Build the action bar
		let html = '';
		for( let i=0; i<NUM_ACTIONS; ++i )
			html += UI.Templates.actionButton;
		html += '<div data-id="end-turn" class="action button autoWidth">End Turn</div><span class="hidden">Spectating</span>';
		this.actionbar_actions.html(html);
		this.endTurnButton = $('> div[data-id="end-turn"]',this.actionbar_actions);
		this.spectatingText = $('> span', this.actionbar_actions);

		this.staticModal.ini();
		
		this.map = map;
		this.fx = fx;
		$("#renderer").html(map);
		$("#fx").html(fx);
		this.toggle(this.visible);

		this.initialized = true;
		this.draw();

	}

	showDMTools(){
		return !Boolean(+localStorage.hide_dm_tools) && game.is_host;
	}

	showBubbles(){
		return !Boolean(+localStorage.hide_bubbles);
	}

	destructor(){
		this.clear();
		this.modal.destructor();
	}


	// Toggles the UI overlay
	toggle( visible ){

		if( visible !== undefined )
			this.visible = Boolean(visible);
		else
			this.visible = !this.visible;
		localStorage.ui_visible = +this.visible;
		game.renderer.hblur.enabled = game.renderer.vblur.enabled = this.visible;
		this.board.toggleClass('hidden', !this.visible);
		$("[data-id=map]", this.gameIcons).toggleClass("highlighted", this.visible);
		$("#mainMenuToggle div[data-id=map]").toggleClass("highlighted", this.visible);
		
		this.mapChat.toggleClass("hidden", this.visible);

	}




	/* MAIN BOARD */
	// Updates everything
	draw(){

		if( !this.initialized )
			return;

		if( this.drawTimer )
			return;
		this.drawTimer = setTimeout(this.execDraw.bind(this), 30);

	}

	execDraw(){

		// Cache the players
		game.lockPlayersAndRun(() => {

			let time = Date.now();
			this._hold_actionbar = false;
			this.drawTimer = false;

			const times = [];
			let t = Date.now();

			this.drawPlayers();
			times.push(Date.now()-t);
			t = Date.now();

			this.drawGameIcons();
			times.push(Date.now()-t);
			t = Date.now();

			this.drawActionSelector();
			times.push(Date.now()-t);
			t = Date.now();

			this.drawRoleplay();
			times.push(Date.now()-t);
			t = Date.now();

			this.bindTooltips();
			times.push(Date.now()-t);

			//console.log("execDraw took", Date.now()-time, times);

		});
		

	}

	// Helper functions for below
	updateResourceDots( root, currentPoints, maxPoints ){

		const dots = $("> div.point", root);
		for( let i = 0; i<dots.length || i<maxPoints; ++i ){
			
			let div = dots[i];
			if( !div ){
				div = document.createElement('div');
				div.className = 'point';
				root.append(div);
			}
			$(div).toggleClass('filled', i < currentPoints).toggleClass("hidden", i >= maxPoints);

		}

	}


	// Draws action selector for a player
	drawActionSelector( player ){

		let time = Date.now();

		if( !player )
			player = game.getMyActivePlayer();

		// Hide the action buttons from start
		const buttons = $('> div.action:not([data-id="end-turn"])', this.actionbar_actions);
		buttons.toggleClass("hidden", true);
		this.spectatingText.toggleClass('hidden', Boolean(player));

		if( !player ){

			this.yourTurn.toggleClass('hidden', true);
			this.yourTurnBorder.toggleClass('hidden', true);
			this.endTurnButton.toggleClass('hidden', true);
			this.toggleRope(false);
			return;

		}
		

		let actions = player.getActions(), 
			th = this
		;

		const myTurn = game.getTurnPlayer().id === game.getMyActivePlayer().id || !game.battle_active;
		this.yourTurn.toggleClass('hidden', !myTurn || !game.battle_active);
		this.yourTurnBorder.toggleClass('hidden', !myTurn || !game.battle_active);

		if( !myTurn )
			this.toggleRope(false);

		
		// Update resources
		this.updateResourceDots(this.ap_bar, player.ap, player.getMaxAP());
		this.updateResourceDots(this.mp_bar, player.mp, player.getMaxMP());
		

		// Build end turn button and toggle visibility
		this.endTurnButton.toggleClass('hidden', !game.battle_active);

		// console.log("Init: ", Date.now()-time); time = Date.now(); 
		// label : true
		// makes sure stacking potions only show one icon
		const filters = {};
		// Charges
		actions = actions.filter(el => {
			if( !el.isVisible() || el.no_action_selector)
				return false;
			if( !filters[el.label] )
				filters[el.label] = true;
			else
				return false;
			return true;
		});
		// console.log("Init2: ", Date.now()-time); 

		time = Date.now();
		let castableActions = 0;
		for( let i=0; i<NUM_ACTIONS; ++i ){

			const button = $(buttons[i]);
			let action = actions[i];
			if( !action )
				continue;

			let castable = action.castable() && myTurn;
			castableActions += Boolean(castable);

			// Update class name
			this.constructor.setActionButtonContent(button, action, player);

			// Custom stuff
			const castableClass = (castable ? 'enabled' : 'disabled');
			button.toggleClass(castableClass, true);


		}


		// Update color here now that we know if there are any actions left
		// Colorize. No need if invis tho.
		time = Date.now();
		if( game.battle_active ){
			let etcolor = 'disabled';
			if( myTurn ){
				etcolor = 'enabled';
				// Any moves left?
				if( !castableActions )
					etcolor = 'highlighted';
				if( this._has_moves !== Boolean(castableActions) ){
					this._has_moves = Boolean(castableActions);
					if( !castableActions )
						game.uiAudio( 'no_moves' );
				}
			}
			this.endTurnButton.toggleClass('disabled enabled highlighted', false).toggleClass(etcolor, true);
		}
		//console.log("Updating colors", Date.now()-time);


		// Bind events
		time = Date.now();
		$("> div.action.button", this.actionbar_actions)
			.off('mousedown mouseover mouseout click touchstart touchmove')
			.on('mousedown mouseover mouseout click touchstart touchmove', function(event){

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
			else if( event.type === 'click' && !th._hold_actionbar ){
				
				event.preventDefault();
				event.stopImmediatePropagation();
				// Non directed targets are handled by mousedown
				if( !th._action_used && spell.castable(true) ){
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
		//console.log("Binding the events", Date.now()-time);

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

		let mpCost = spell.mp, apCost = spell.getApCost(),
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

		const th = this, players = game.getEnabledPlayers();


		const playerTemplate = $(
			'<div class="player">'+
				'<div class="content">'+
					'<div class="bg"></div>'+
					'<div class="stats">'+
						'<span class="name" style="color:#DFD">'+
							'<div class="button owner devtool" title="Set character owner">'+
								'<img src="media/wrapper_icons/id-card.svg" />'+
							'</div>'+
							'<div class="button own" title="Control this character">'+
								'<img src="media/wrapper_icons/gamepad.svg" />'+
							'</div>'+
							'<div class="button leader devtool">'+
								'<img src="media/wrapper_icons/crown.svg" />'+
							'</div>'+
							'<span>'+
								'<span class="turnArrow">&#9654; </span>'+
								'<span class="nameTag"></span>'+
								'<span class="turnArrow"> &#9664;</span>'+
							'</span>'+
						'</span>'+
						'<br />'+
						'<span class="resources">'+
							'<span class="chest resource"></span>'+
							'<span class="legs resource"></span>'+
							'<span class="arousal resource" title="Arousal.\nStuns at 100%."></span>'+
							'<span class="MP resource large" title="Mana Points"></span>'+
							'<span class="AP resource large" title="Action Points"></span>'+
							'<span class="HP resource large" title="Hit Points"></span>'+
						'</span>'+
					'</div>'+
				'</div>'+
				'<div class="topRight">'+
					'<div class="wrappers"></div>'+
					'<div class="charging"></div>'+
				'</div>'+
				'<div class="targetingStats"></div>'+
				'<div class="speechBubble hidden"><div class="arrow"></div><div class="content">HELLO!</div></div>'+
				'<div class="interactions">'+
					'<div class="interaction hidden" data-type="chat"><img src="media/wrapper_icons/chat-bubble.svg" /></div>'+
					'<div class="interaction hidden" data-type="gym"><img src="media/wrapper_icons/weight-lifting-up.svg" /></div>'+
					'<div class="interaction hidden" data-type="shop"><img src="media/wrapper_icons/hanging-sign.svg" /></div>'+
					'<div class="interaction hidden" data-type="repair"><img src="media/wrapper_icons/anvil-impact.svg" /></div>'+
					'<div class="interaction hidden" data-type="rent"><img src="media/wrapper_icons/bed.svg" /></div>'+
					'<div class="interaction hidden" data-type="loot"><img src="media/wrapper_icons/bindle.svg" /></div>'+
				'</div>'+
			'</div>'
		);

		// Build skeleton if needed
		let ids = [];
		let i =0;
		for( let p of players ){

			if( !(p instanceof Player) )
				console.error("Player #"+i+" is not a player:", p);
			++i;
			let el = $("div.player[data-id='"+esc(p.id)+"']", this.players);
			let tag = $('div.left', this.players);
			if( p.team !== 0 )
				tag = $("div.right", this.players);

			if( !el.length ){
				el = playerTemplate.clone();
				tag.append(el);
				$(el).attr('data-id', p.id);

				$("> div.speechBubble", el).on('click', event => {
					const targ = event.currentTarget;
					$(targ).toggleClass('hidden immediate', true);
					clearTimeout(targ.fadeTimer);
					event.stopImmediatePropagation();
					setTimeout(_ => {
						$(targ).toggleClass('immediate', false);
					}, 1);
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

		// Update the individual players
		for( let p of players ){
			this.drawPlayer(p);
			if( !p.isInvisible() ){
				if( p.team === 0 )
					++nr_friendly;
				else
					++nr_hostile;
			}
		}
		

		$("div.left", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_friendly > 10 ? 10 : nr_friendly));
		$("div.right", this.players).toggleClass('p1 p2 p3 p4 p5 p6 p7 p8 p9 p10', false).toggleClass('p'+(nr_hostile > 10 ? 10 : nr_hostile));

		$("div.player span.name div.owner", this.players).on('click', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			const modal = this.modal;
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
			localStorage.my_player = game.my_player;
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
				th.staticModal.set('player', $(this).attr('data-id'));

		});

	}

	drawPlayer(p){

		const tp = game.getTurnPlayer(),
			myTurn = tp && tp.id === p.id,
			el = $("div.player[data-id='"+esc(p.id)+"']", this.players),
			myActive = game.getMyActivePlayer(),
			friendly = p.team === 0
		;

		if( isNaN(el.attr('data-team')) )
			el.attr('data-team', 0);
		
		if( myTurn )
			el.toggleClass("active", true);

		const isMine = Boolean(~game.getMyPlayers().indexOf(p)),
			isMyActive = p === myActive,
			isNPC = !p.netgame_owner
		;
		
		el.toggleClass('mine', isMine);
		el.toggleClass('myActive', isMyActive);
		
		el.toggleClass('dead', p.hp <= 0);
		el.toggleClass('incapacitated', p.isIncapacitated());
		el.toggleClass("hidden", p.isInvisible());



		// Map up needed sub divs
		const contentEl = $("> div.content", el),
			statsEl = $('> div.stats', contentEl),
				nameEl = $('> span.name', statsEl),
					ownerEl = $('> div.owner', nameEl),
					ownEl = $('> div.own', nameEl),
					leaderEl = $('> div.leader', nameEl),
					nameDisplayEl = $('span.nameTag', nameEl),
				resourcesEl = $('> span.resources', statsEl),
					arousalEl = $('> span.arousal', resourcesEl),
					mpEl = $('> span.MP', resourcesEl),
					apEl = $('> span.AP', resourcesEl),
					hpEl = $('> span.HP', resourcesEl),
					chestEl = $('> span.chest', resourcesEl),
					legsEl = $('> span.legs', resourcesEl),
			bgEl = $('> div.bg', contentEl),
			topRightEl = $('> div.topRight', el),
				wrappersEl = $('> div.wrappers', topRightEl),
				chargingEl = $('> div.charging', topRightEl)
		;


		// Check if elements need to be reordered
		let cacheFriendly = +el.attr('data-team') === 0;
		if( friendly !== cacheFriendly ){

			const reverse = (i,li) => li.parentNode.prepend(li);
			nameEl.children().each(reverse);
			resourcesEl.children().each(reverse);
			el.attr('data-team', p.team);

		}


		// Check if image has changed
		const icon = p.getActiveIcon();
		if( bgEl.attr('data-image') !== icon && icon ){
			
			const image = new Image();
			image.onload = () => {
				if( p.getActiveIcon() === icon ){
					bgEl.css('background-image', 'url('+esc(icon)+')');
					bgEl.attr('data-image', icon);
				}
			};
			image.src = icon;
			
		}


		// Update resource buttons
		let ubDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.upperBody),
			lbDur = p.getAssetDurabilityPercentageBySlot(Asset.Slots.lowerBody);
		
		const 
			arousalDisabled = p.isArousalDisabled(),
			mpDisabled = p.isMPDisabled(),
			apDisabled = p.isAPDisabled(),
			hpDisabled = p.isHPDisabled(),
			arousalText = p.arousal+"/"+p.getMaxArousal(),
			apText = p.ap+"/"+p.getMaxAP(),
			mpText = p.mp+"/"+p.getMaxMP(),
			hpText = p.hp+"/"+p.getMaxHP()
		;
		arousalEl.toggleClass('hidden', arousalDisabled);
		mpEl.toggleClass('hidden', mpDisabled);
		hpEl.toggleClass('hidden', hpDisabled);
		apEl.toggleClass('hidden', apDisabled);
		
		if( !arousalDisabled && arousalEl.text() !== arousalText )
			arousalEl.text(arousalText);
		if( !apDisabled && apEl.text() !== apText )
			apEl.text(apText);
		if( !hpDisabled && hpEl.text() !== hpText )
			hpEl.text(hpText);
		if( !mpDisabled && mpEl.text() !== mpText )
			mpEl.text(mpText);

		// Armor
		chestEl.add(legsEl).toggleClass('hidden', p.isBeast());
		if( !p.isBeast() ){
			const ubAsset = p.getEquippedAssetsBySlots(Asset.Slots.upperBody);
			const lbAsset = p.getEquippedAssetsBySlots(Asset.Slots.lowerBody);
			const ubDmg = ubAsset.length ? ubAsset[0].getDmgTakenAdd() : Asset.protVal;
			const lbDmg = lbAsset.length ? lbAsset[0].getDmgTakenAdd() : Asset.protVal;

			const uText = Math.ceil(ubDur*100)+'%';
			const lText = Math.ceil(lbDur*100)+'%';

			chestEl.toggleClass('broken', !ubDur)
				.attr('title', 'Upper body armor durability.\n'+((Asset.protVal-ubDmg)*100)+'% Damage reduction');
			legsEl.toggleClass('broken', !lbDur)
				.attr('title', 'Lower body armor durability.\n'+((Asset.protVal-lbDmg)*100)+'% Damage reduction');

			if( chestEl.text() !== uText )
				chestEl.text(uText);
			if( legsEl.text() !== lText )
				legsEl.text(lText);
		}
		
		

		nameDisplayEl
			.toggleClass('mine', isMine)
			.toggleClass('npc', isNPC)
			.attr('style', 'color:'+esc(p.color))
		;
		nameEl.toggleClass('active', isMyActive);

		const name = p.getName()+(p.isAFK() ? ' [AFK]' : '');
		if( nameDisplayEl.text() !== name )
			nameDisplayEl.text(name);
		
		ownerEl.toggleClass('hidden', !game.is_host);
		ownEl.toggleClass('hidden', Boolean(game.getMyPlayers().length < 2 || isMyActive || !isMine));
		leaderEl.toggleClass('hidden', Boolean(
			p.team !== 0 || !game.net.id ||
			(!p.leader && !game.is_host)
		)).toggleClass('host', game.is_host).toggleClass("active", Boolean(p.leader));

		// Charged actions
		let chargedActions = p.isCasting();
		

		const chargedActionButtons = $('> div', chargingEl);
		chargedActionButtons.toggleClass('hidden', true);
		if( chargedActions ){

			const actionButtonTemplate = $(
				'<div class="chAction tooltipParent">'+
					'<span class="label"></span>'+
					'<div class="duration"></div>'+
					'<div class="tooltip"></div>'+
				'</div>'
			);
			
			// Helper function for escaping a player name
			const escPlayerName = pl => esc(pl.name);
			for( let i=0; i< chargedActions.length; ++i ){

				const a = chargedActions[i];
				let el = chargedActionButtons[i];
				if( !el ){
					el = actionButtonTemplate.clone();
					chargingEl.append(el);
				}
				el = $(el);

				const name = esc(a.name)+' at '+a.getChargePlayers().map(escPlayerName),
					tooltip = a.getTooltipText(),
					durEl = $('> div.duration', el),
					tooltipEl = $('> div.tooltip', el),
					labelEl = $('> span.label', el)
				;


				el.toggleClass('hidden', false);
				if( name !== labelEl.html() )
					labelEl.html(name);

				
				if( +durEl.text() !== a._cast_time )
					durEl.text(a._cast_time);
				if( tooltipEl.html() !== tooltip )
					tooltipEl.html(tooltip);
			}
			
		}



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

		$("> div.interactions", el).toggleClass('hidden', !myActive);

		if( myActive ){
			
			const showLoot = p.isLootableBy(myActive);
			$("div.interaction[data-type=loot]", el).toggleClass("hidden", !showLoot).off('click').on('click', event => {
				event.stopImmediatePropagation();
				this.drawContainerLootSelector(myActive, p);
			});

			const shops = game.getShopsByPlayer(p).filter(sh => game.shopAvailableTo(sh, myActive));
			const showShop = shops.length;
			$("div.interaction[data-type=shop]", el).toggleClass("hidden", !showShop).off('click').on('click', event => {
				event.stopImmediatePropagation();
				if(this.drawShopInspector(shops[0])){
					game.uiAudio( "shop_entered" );
				}
			});

			const showSmith = game.smithAvailableTo(p, myActive);
			$("div.interaction[data-type=repair]", el).toggleClass("hidden", !showSmith).off('click').on('click', event => {
				event.stopImmediatePropagation();
				if( this.drawSmithInspector(p) ){
					game.uiAudio( "smith_entered" );
				}
			});


			const showGym = game.gymAvailableTo(p, myActive);
			$("div.interaction[data-type=gym]", el).toggleClass("hidden", !showGym).off('click').on('click', event => {
				event.stopImmediatePropagation();
				this.staticModal.set('gym', p);
				game.uiAudio( "gym_entered" );
				
			});

			try{
				const showRent = game.roomRentalAvailableTo(p, myActive, true);
				$("div.interaction[data-type=rent]", el).toggleClass("hidden", !showRent).off('click').on('click', event => {
					event.stopImmediatePropagation();
					game.roomRentalUsed(p, myActive);
				});
			}catch(err){}
		}

		

		// Effect wrappers
		const wrappers = p.getWrappers().filter(el => el.name.length && el.icon && el.parent instanceof Player),
			wrapperButtons = $('> div', wrappersEl);
		
		const wrapperTemplate = $(
			'<div class="wrapper tooltipParent">'+
				'<div class="background"></div>'+
				'<div class="stacks"></div>'+
				'<div class="duration"></div>'+
				'<div class="tooltip"></div>'+
			'</div>'
		);

		wrapperButtons.toggleClass('hidden', true);

		for( let i =0; i<wrappers.length; ++i ){

			let wrapper = wrappers[i],
				el = wrapperButtons[i];
			
			if( !el ){
				el = wrapperTemplate.clone();
				wrappersEl.append(el);
			}
			el = $(el);

			el.toggleClass('detrimental beneficial hidden', false)
				.toggleClass(wrapper.detrimental ? 'detrimental' : 'beneficial', true)
				.attr('data-id', wrapper.id);

			const elIcon = $('> div.background', el),
				elStacks = $('> div.stacks', el),
				elDuration = $('> div.duration', el),
				elTooltip = $('> div.tooltip', el)
			;

			elIcon.toggleClass('hidden', !wrapper.icon);
			if( wrapper.icon && wrapper.icon !== elIcon.attr('data-icon') )
				elIcon.attr('style', 'background-image:url('+wrapper.getIconPath()+')').attr('data-icon', wrapper.icon);

			elStacks.toggleClass('hidden', wrapper.stacks < 2);
			if( wrapper.stacks > 1 && +elStacks.attr('data-stacks') !== +wrapper.stacks )
				elStacks.text('x'+wrapper.stacks).attr('data-stacks', wrapper.stacks);

			elDuration.toggleClass('hidden', wrapper._duration < 1);
			if( wrapper._duration > 0 && +elDuration.text() !== wrapper._duration )
				elDuration.text(wrapper._duration);
			
			const tooltip = 
				'<strong>'+esc(wrapper.name)+'</strong><br />'+
				'<em>'+
					(+wrapper.duration === -1 ? 
						'Permanent' :
						(+wrapper._duration)+' Turn'+(wrapper._duration>1 ? 's' : '')
					)+
					(wrapper.stacks > 1 ? ' | '+wrapper.stacks+' stack'+(wrapper.stacks !== 1 ? 's':'') : '' )+
				'</em><br />'+
				stylizeText(esc(wrapper.getDescription()));
			if( elTooltip.html() !== tooltip )
				elTooltip.html(tooltip);
			
		}

		
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

		let html = 
			'<div class="button'+(!this.visible ? ' highlighted' : '')+'" data-id="map" style="background-image:url(/media/wrapper_icons/treasure-map.svg);"></div>'+
			(player ? '<div class="button" data-id="inventory" style="background-image:url(/media/wrapper_icons/light-backpack.svg);"></div>' : '')+
			'<div class="button" data-id="quest" style="background-image:url(/media/wrapper_icons/bookmarklet.svg);"></div>'+
			'<div data-id="multiplayer" class="button" style="background-image: url(media/wrapper_icons/multiplayer.svg)"></div>'+
			'<div data-id="settings" class="button" style="background-image: url(media/wrapper_icons/auto-repair.svg)"></div>'+
			'<div data-id="mainMenu" class="button autoWidth">Game</div>'
		;
		this.gameIcons.html(html);
		this.toggle(this.visible);

		$("[data-id]", this.gameIcons).on('click', event => {

			const el = $(event.currentTarget);

			let id = $(el).attr("data-id");
			if( id === 'map' ){
				game.uiAudio( 'map_toggle' );
				this.toggle();
			}
			else if( id === 'quest' ){
				this.drawQuests();
				game.uiAudio( 'toggle_quests' );
			}
			else if( id === "mainMenu" ){
				game.uiAudio( 'menu_generic' );
				this.drawMainMenu();
			}
			else if( id === 'multiplayer' ){
				game.uiAudio( 'menu_generic' );
				this.drawNetSettings();
			}
			else if( id === 'inventory' ){
				game.uiAudio( 'backpack' );
				this.drawPlayerInventory();
			}
			else if( id === 'settings' ){
				game.uiAudio( 'menu_generic' );
				this.staticModal.set('settings');
			}
		});

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


	updateMute(){
		const mute = Boolean( !game.is_host && !game.getMyActivePlayer() && game.mute_spectators )
		this.board.toggleClass("mute", mute);
	}




	




	/* ACTION SELECTOR Helpers */
	// Send the action selection
	performSelectedAction(){

		this._hold_actionbar = true;
		this._action_used = true;
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

				
			const hit = Math.min(Math.max(Player.getHitChance(pl, t, action), 0), 100);
			//let dmgbon = Math.round(Math.max(0, Player.getBonusDamageMultiplier(pl, t, action.type, action.isDetrimentalTo(t))*100-100));
			const advantage = Player.getAdvantage( pl, t, action.type, action.isDetrimentalTo(t) );
			$("div.player[data-id='"+esc(t.id)+"'] div.targetingStats", this.players).html(
				!action.isDetrimentalTo(t) ?
					'Pick Target' :
					hit+'% Hit'+
					'<br />Advantage: '+(advantage > 0 ? '+': '')+Math.round(advantage)
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


		$("#execMultiCast", this.multiCastPicker).off('click').on('click', event => {
			if( $(event.currentTarget).hasClass('hidden') )
				return;
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

		this.modal.prepareSelectionBox();
		for( let item of inventory ){

			this.modal.addSelectionBoxItem( 
				(item.equipped ? '<strong>' : '')+esc(item.name)+(item.equipped ? '</strong>' : ''), 
				item.getTooltipText(), 
				esc(item.id),
				[Asset.RarityNames[item.rarity]],
				false
			);
		}
		this.modal.onSelectionBox(event => {
			
			let element = event.currentTarget,
				id = $(element).attr('data-id');
				
			if( asset )
				game.useRepairAsset(sender, target, asset.id, id);
			else
				this.addError("Todo: add non-asset armor repairs");

			this.modal.closeSelectionBox();
			
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




	/* Turn timer */
	async toggleRope( seconds ){

		this.yourTurnBorder.toggleClass("rope", Boolean(seconds));
		this.yourTurn.toggleClass("rope", Boolean(seconds));
		clearTimeout(this.yourTurnTimer);

		if( this.yourTurnSoundLoop ){
			this.yourTurnSoundLoop.stop(100);
			this.yourTurnSoundLoop = false;
		}

		if( +seconds ){
			this.yourTurn.toggleClass("rope", Boolean(seconds));
			this.yourTurnTimeLeft = seconds;
			const tick = () => {
				$("span.timeLeft", this.yourTurn).html(' ['+this.yourTurnTimeLeft+']');
				--this.yourTurnTimeLeft;
				if( this.yourTurnTimeLeft < 0 )
					clearInterval(this.yourTurnTimer);
			};
			tick();
			this.yourTurnTimer = setInterval(tick, 1000);

			// Play alert and start loop
			game.uiAudio( 'time_running_out', 0.5 );
			this.yourTurnSoundLoop = await game.audio_ui.play( 'media/audio/ui/clock.ogg', 0.25, true );

		}else{
			
			$("span.timeLeft", this.yourTurn).html('');
		}
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

		const line = '<div class="line '+esc(acn.join(' '))+'">'+txt+'</div>';
		if( ~acn.indexOf('playerChat') && game.initialized ){

			game.uiAudio( 'chat_message' );
			if( acn.indexOf('emote') === -1 ){
				let bubble = text.split(':');
				bubble.shift();
				this.addSpeechBubble(sender, stylizeText(bubble.join(':').trim()));
			}


			let l = $(line);
			this.mapChat.prepend(l);
			setTimeout(() => {
				l.toggleClass("fade", true);
				setTimeout(() => {
					l.remove();
				}, 2000);
			}, 10000);

		}
		
		this.text.append(line);
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
			modal = this.modal,
			modNames = await Mod.getNames(),
			sortedMods = await Mod.getModsOrdered()
		;

		html += '<h1 class="centered">FetishQuest</h1>';
		html += '<p class="centered"><strong>This game contains adult content. But you\'ve probably worked that out from the title already.</strong></p>';

		html += '<h3 class="centered">'+
			'This game is a work in progress. Please support its development on <a href="https://www.patreon.com/jasx_games" target="_blank">Patreon</a> to get access to the pre-testing beta branch!'+
		'</h3>';
		html += '<p class="centered">Follow development on <a href="https://discord.jasx.org" target="_blank">Discord</a>.</p><br />';

		html += '<p style="text-align:center">'+
			'<input type="button" class="green newGameButton" name="newGame" value="New Game" /><br />'+
			'<input type="button" name="credits" value="Credits" />'+
		'</p><br />';

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
					html += '<tr><td colspan=4>No mods installed</td></tr>';
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
		$("#modal input[name=credits]").on('click', () => this.drawCredits());
		
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
					this.modal.addNotice("Mod "+esc(m.name)+" installed!");
				}catch(err){
					alert("File failed to load: "+err);
				}
			};
			reader.readAsText(file);
		

		});
		
		this.bindTooltips();
		

	}


	drawCredits(){

		let html = '<div class="center">'+
			'<h1>Credits</h1>'+
			'<p>Concept/Programming/Models: JasX</p>'+
			'<p>Additional Models:</p>'+
			'Kitaro "Huskebutt" Kun<br />'+
			'<p>Art:</p>'+
			'<a href="http://www.furaffinity.net/gallery/gothwolf">GothWolf</a><br />'+
			'<a href="http://www.furaffinity.net/gallery/maddworld">Maddworld</a><br />'+
			'<p>Audio:</p>'+
			`https://freesound.org/people/GameDevC/sounds/422836/<br />
			https://freesound.org/people/LittleRobotSoundFactory/sounds/270401/<br />
			https://freesound.org/people/vacuumfan7072/sounds/394155/<br />
			https://freesound.org/people/FoolBoyMedia/sounds/352658/<br />
			https://freesound.org/people/InspectorJ/sounds/416179/<br />
			https://freesound.org/people/Adam_N/sounds/164661/<br />
			https://freesound.org/people/INNORECORDS/sounds/456899/<br />
			https://freesound.org/people/kyles/sounds/452104/<br />
			https://freesound.org/people/GoodListener/sounds/322855/<br />
			https://freesound.org/people/VKProduktion/sounds/231537/<br />
			https://freesound.org/people/Schoggimousse/sounds/443061/<br />
			https://freesound.org/people/kwahmah_02/sounds/275563/<br />
			https://freesound.org/people/Andy_Gardner/sounds/196713/<br />
			https://freesound.org/people/Nightwatcher98/sounds/407292/<br />
			https://freesound.org/people/Meepalicious/sounds/244808/<br />
			https://freesound.org/people/conleec/sounds/212094/<br />
			https://freesound.org/people/ivolipa/sounds/326313/<br />`+
		'</div>';
 
		this.modal.set(html);

	}


	drawNewGame(){

		// /media/characters/otter.jpg
		const gallery = [
			{name : 'Otter', size:5, 'icon':'/media/characters/otter_dressed.jpg', description: 'Art by GothWolf', icon_lowerBody:'/media/characters/otter_lb.jpg', icon_upperBody:'/media/characters/otter_ub.jpg', icon_nude:'/media/characters/otter_nude.jpg', 'species':'otter', class:'elementalist', tags:[stdTag.plTongue, stdTag.penis, stdTag.plFurry, stdTag.plTail, stdTag.plHair, stdTag.plEars, stdTag.plLongTail]},
			{name : 'Wolfess', size:5, 'icon':'/media/characters/wolf.jpg', 'species':'wolf', description:'Art by Maddworld', class:'monk', tags:[stdTag.plTongue, stdTag.vagina, stdTag.breasts, stdTag.plFurry, stdTag.plTail, stdTag.plHair, stdTag.plEars, stdTag.plLongTail]},
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
						'<input type="text" name="species" placeholder="Species" required /><br />'+
						'Size: <input type="range" name="size" min=0 max=10 /><br />'+
						'Class: <select name="class">';
						const classes = glib.getFull('PlayerClass');
						for( let c in classes ){
							
							if( !classes[c].isMonsterClass )
								html += '<option value="'+esc(c)+'">'+esc(classes[c].name)+'</option>';
								
						}
						html += '</select><br />';
						html += 'Tags (control+click to remove): <input type="button" class="addTag" value="Add Tag" /><br />';
						html += '<div class="tags"></div>';
						html += '<textarea name="description"></textarea>';
						
						html += 'Dressed: <input type="text" name="icon" placeholder="Dressed Art" /><br />'+
						'Nude: <input type="text" name="icon_nude" placeholder="Nude Art" /><br />'+
						'UpperBody: <input type="text" name="icon_upperBody" placeholder="UpperBody Art" /><br />'+
						'LowerBody: <input type="text" name="icon_lowerBody" placeholder="LowerBody Art" /><br />'
						;


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
		this.modal.set(html);

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
			$("#newGameForm input[name=icon_nude]").val(data.icon_nude);
			$("#newGameForm input[name=icon_upperBody]").val(data.icon_upperBody);
			$("#newGameForm input[name=icon_lowerBody]").val(data.icon_lowerBody);
			$("#newGameForm textarea[name=description]").val(data.description);
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


		$('#newGameForm').on('submit', event => {

			event.preventDefault();

			game.net.disconnect();
			const name = $("#newGameForm input.gameName").val().trim();
			const base = $("#newGameForm");
			const c = glib.get($("select[name=class]", base).val().trim(), 'PlayerClass');
			if( !c )
				return this.modal.addError("Class not found");
			const player = new Player({
				auto_learn : false,
				name : $("input[name=name]", base).val().trim() || 'Player',
				species : $("input[name=species]", base).val().trim().toLowerCase() || 'human',
				icon : $("input[name=icon]", base).val().trim(),
				icon_nude : $("input[name=icon_nude]", base).val().trim(),
				icon_upperBody : $("input[name=icon_upperBody]", base).val().trim(),
				icon_lowerBody : $("input[name=icon_lowerBody]", base).val().trim(),
				description : $("textarea[name=description]", base).val().trim(),
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
				this.modal.addError("Name is empty");
				return false;
			}

			Game.new(name, [player]);
			this.modal.close();
			return false;

		});

		$("#newGameForm input.addTag").on('click', () => addTag(''));

		this.bindTooltips();

	}


	// Netgame settings
	drawNetSettings(){

		let html = '<div class="infoBox centered">';
		if( game.net.isConnected() && game.initialized && game.is_host ){
			html += 'Share the invite code or direct invite URL to invite a player to your game:<br /><div class="netgameLink">'+esc(game.net.public_id)+'</div>';
			html += '<div class="netgameLink">'+esc('https://'+window.location.hostname+'/#net/'+game.net.public_id)+'</div>';
		}

		else if( !game.net.isConnected() && game.initialized && game.is_host ){
			html += '<h1>Put Session Online</h1>';
			html += '<p>If you want, you can put this session online and invite your friends.</p>';
			html += '<input type="button" class="blue" name="hostGame" value="Put This Session Online" /><br />';
		}

		if( game.net.isConnected() ){

			html += '<input type="button" class="red" name="disconnect" value="Disconnect" />';

			html += '<h3>Connected players</h3>';
			// Todo: Stylize
			for( let player of game.net.players )
				html+= '<div class="netgame player">'+esc(player.name)+'</div>';

			if( game.is_host ){
				html += '<label>Enable 75 sec turn time limit: <input type="checkbox" class="enableTurnTimer" '+(+localStorage.turnTimer ? 'checked' : '')+' /></label><br />';
				html += '<label>Mute spectators: <input type="checkbox" class="muteSpectators" '+(+localStorage.muteSpectators ? 'checked' : '')+' /></label><br />';
			}

		}

		html += '</div>';
		this.modal.set(html);

		$("#modal input[name=disconnect]").on('click', async () => {
			game.net.disconnect();
			this.drawMainMenu();
		});

		$("#modal input[name=hostGame]").on('click', async () => {
			await game.net.hostGame();
			this.drawNetSettings();
		});

		$("#modal input.enableTurnTimer").on('click', event => {
			localStorage.turnTimer = +$(event.currentTarget).is(':checked');
			game.onTurnTimerChanged();
		});
		$("#modal input.muteSpectators").on('click', event => {
			localStorage.muteSpectators = +$(event.currentTarget).is(':checked');
			game.mute_spectators = +localStorage.muteSpectators || 0;
			game.save();
		});

		this.bindTooltips();

	}


	

	// Quest explorer
	drawQuests(){
		let html = '', th = this;
		let quests = game.quests;
		let selectedQuest = quests[0];
		const me = game.getMyActivePlayer();

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

				const objectives = selectedQuest.getVisibleObjectives();
				html += '<ul>';
				for( let objective of objectives ){
					html += '<li class="objective'+(objective.isCompleted() ? ' completed ' : '')+'">'+
						esc(objective.name)+
						(objective.amount ? '<br />'+objective._amount+'/'+objective.amount : '')+
					'</li>';
				}
				html += '</ul>';
				if( !selectedQuest.hide_rewards ){
					html += '<hr />';
					html += '<h3>Rewards</h3>';

					const rewards = selectedQuest.getRewards();
					for( let reward of rewards ){

						const asset = reward.data;
						const type = reward.type;
						const viableToMe = me && reward.testPlayer(me);
						

						if( type === QuestReward.Types.Asset ){
							html += '<div class="item tooltipParent '+(!viableToMe ? 'disabled ' : '' )+Asset.RarityNames[asset.rarity]+'">';
								html += esc(asset.name)+(asset._stacks > 1 ? ' x'+asset._stacks : '');
								html += '<div class="tooltip">';
									html += asset.getTooltipText();
								html += '</div>';
							html += '</div>';
						}
						else{
							html += '<div class="item tooltipParent '+(!viableToMe ? 'disabled ' : '' )+' disabled actionReward">';
								html += esc(asset.name);
								html += '<div class="tooltip">';
									html += asset.getTooltipText();
								html += '</div>';
							html += '</div>';
						}
						
					}
				}
				if( selectedQuest.rewards_exp ){
					html += '<div class="item">'+selectedQuest.rewards_exp+' Exp</div>';
				}

			}
			html += '</div>';
		html += '</div>';
		this.modal.set(html);

		$("#modal div.modalQuests > div.left > div[data-id]").on('click', function(){
			let id = $(this).attr('data-id');
			localStorage.selected_quest = id;
			th.drawQuests();
		});

		this.bindTooltips();

	}

	// Player inspect
	// uuid can also be a player object

	drawAssetTradeTarget( asset, amount ){

		const player = asset.parent;
		const th = this;
		// Draw a list of acceptable targets
		const targets = game.getTeamPlayers( player.team ).filter(el => el.id !== player.id);
		const modal = this.modal;
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

	getGenericAssetButton( item, cost = 0, additionalClassName = '' ){
		let html = '';
		html += '<div class="item '+additionalClassName+' '+Asset.RarityNames[item.rarity]+' tooltipParent '+(item.equippable() ? 'equippable' : '')+(item.equipped ? ' equipped' : '')+(item.durability <= 0 ? ' broken' : '')+'" data-id="'+esc(item.id)+'">';
			html += '<img class="assetIcon" src="media/wrapper_icons/'+esc(item.icon)+'.svg" />';
			html += (item.equipped ? '<strong>' : '')+(item.stacking && item._stacks > 1 ? item._stacks+'x ' : '')+esc(item.name)+(item.equipped ? '<br />['+item.slots.map(el => el.toUpperCase()).join(' + ')+']</strong>' : '');
			// This item can be sold
			if( cost ){
				const coins = Player.calculateMoneyExhange(cost);
				html += '<div class="cost">';
				for( let i in coins ){
					const amt = coins[i];
					if( amt ){
						html += '<span style="color:'+Player.currencyColors[i]+';">'+amt+Player.currencyWeights[i].substr(0,1)+"</span> ";
					}
				}
				html += '</div>';
			}
			html += '<div class="tooltip">';
				html += item.getTooltipText();
			html += '</div>';
		html+= '</div>';
		return html;
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

			const slots = [
				{slot:Asset.Slots.upperBody, icon:'breastplate'},
				{slot:Asset.Slots.lowerBody, icon:'armored-pants'},
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
					html += this.getGenericAssetButton(item);
				}
				

				if( game.is_host )
					html+= '<br /><input type="button" value="+ Add Item" class="addInventory blue devtool" /><br /><br />';

				html+= '</div>';

			html += '</div>';


		
	
		
		
		this.modal.set(html);

		this.modal.onPlayerChange(player.id, () => {
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
				
				const modal = th.modal;
				modal.prepareSelectionBox();

				

				if( isHotbar )
					modal.addSelectionBoxItem( 'Unequip', '', 'unequip' );
				else if( asset.equippable() )
					modal.addSelectionBoxItem( 'Equip', '', 'equip' );

				if( asset.isConsumable() && asset.isUsable() && (!game.battle_active || (player === game.getTurnPlayer() && isHotbar)) ){
					modal.addSelectionBoxItem( 'Use', asset.use_action.getTooltipText(), 'use' );
				}

				if( 
					game.getTeamPlayers( player.team ).filter(el => el.id !== player.id).length && 
					(!game.battle_active || game.getTurnPlayer().id === player.id) 
				)
					modal.addSelectionBoxItem( 'Trade', game.battle_active ? '[3 AP]' : '', 'trade' );

				if( !game.battle_active )
					modal.addSelectionBoxItem( 'Destroy', false, 'destroy' );
				


				modal.onSelectionBox(function(){

					th.onTooltipMouseout();
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
							modal.close();
						else
							th.drawPlayerInventory();
						
					}
					else if( task == 'trade' ){

						if( game.battle_active ){
							if( player.ap < 3 ){
								this.modal.addError("Not enough AP");
								modal.closeSelectionBox();
								return;
							}
							else if( game.getTurnPlayer().id !== player.id ){
								modal.closeSelectionBox();
								this.modal.addError("Not your turn");
								return;
							}

						}

						if( asset.stacking && asset._stacks > 1 ){
							modal.makeSelectionBoxForm(
								'Amount to trade: <input type="number" style="width:4vmax" min=1 max='+(asset._stacks)+' step=1 value='+(parseInt(asset._stacks) || 1)+' /><input type="submit" value="Ok" />',
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
						// Delete from stack
						if( asset.stacking && asset._stacks >1 ){
							modal.makeSelectionBoxForm(
								'Amount to destroy: <input type="number" style="width:4vmax" min=1 max='+(asset._stacks)+' step=1 value='+(parseInt(asset._stacks) || 1)+' /><input type="submit" value="Ok" />',
								function(){
									const amount = Math.floor($("input:first", this).val());
									if( amount > 0 ){
										if(game.deletePlayerItem( player, id, parseInt(amount))){
											th.drawPlayerInventory();
											th.draw();
										}
									}
								}
							);
						}
						// Delete single
						else{
							modal.addSelectionBoxItem( "Are you sure?", '', 'delete' );
							modal.onSelectionBox(function(){
								const pid = $(this).attr("data-id");
								if( pid === 'delete' && game.deletePlayerItem( player, id) ){
									th.drawPlayerInventory();
									th.draw();
								}
								modal.closeSelectionBox();
							});
						}
					
						return;
					}

					modal.closeSelectionBox();


				});
				
			}

			th.onTooltipMouseout();
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
			
		this.modal.set(html);

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
				game.save();
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

	// Shop inspect
	drawShopInspector( shop ){


		const myPlayer = game.getMyActivePlayer();
		if( !(shop instanceof Shop) || !myPlayer )
			return;

		shop.loadState(game.state_shops[shop.label]);

		if( !game.shopAvailableTo(shop, myPlayer) )
			return;

		let html = '<h1 class="center">'+esc(shop.name)+'</h1>';

		html += '<h3 class="center">Your Money:<br />';
		const money = myPlayer.getMoney();
		if( !money )
			html += 'Broke';
		else{
			for( let i in Player.currencyWeights ){
				let asset = myPlayer.getAssetByLabel(Player.currencyWeights[i]);
				if( !asset )
					continue;
				const amt = parseInt(asset._stacks);
				if( amt ){
					html += '<span style="color:'+Player.currencyColors[i]+';"><b>'+amt+'</b>'+Player.currencyWeights[i]+"</span> ";
				}
			}
		}
		if( myPlayer.canExchange() )
			html += '<br /><br /><input type="button" name="exchange" value="Exchange" />';
		html += '</h3>';

		html += '<div class="shop inventory flexTwoColumns">';
			if( shop.buys ){
				html += '<div class="left full">';
					html += '<h2>Sell</h2>';
					html += '<div class="assets sell">';
					const assets = myPlayer.assets;
					for( let asset of assets ){
						if( asset.isSellable() ){
							const a = asset.clone();
							a.name = (asset.stacking ? '['+asset._stacks+'] ' : '[1] ')+' '+a.name;
							html += this.getGenericAssetButton(a, a.getSellCost(shop));
						}
					}
					html += '</div>';
				html += '</div>';
			}
			html += '<div class="right">';
				html += '<h2>Buy</h2>';
				html += '<div class="assets buy">';
				for( let item of shop.items ){
					const cost = item.getCost();
					if( !cost )
						continue;
					const asset = item.getAsset();
					if( !asset )
						continue;
					const remaining = item.getRemaining();
					if( remaining === 0 )
						continue;
					asset.name = (remaining !== -1 ? '['+remaining+']' : '&infin;')+" "+asset.name;
					asset.id = item.id;
					html += this.getGenericAssetButton(asset, cost, cost > money ? 'disabled' : '');
				}
				html += '</div>';
			html += '</div>';
		html += '</div>';
		
		this.modal.set(html);

		this.bindTooltips();

		$("#modal input[name=exchange]").on('click', event => {
			game.exchangePlayerMoney(myPlayer);
		});
		
		$("#modal div.assets.sell div.item").on('click', event => {
			const th = $(event.currentTarget),
				id = th.attr('data-id');
			const asset = myPlayer.getAssetById(id);
			if( !asset )
				return;
			const maxQuant = asset.stacking ? asset._stacks : 1;
			this.modal.makeSelectionBoxForm(
				'Amount to SELL: <input type="number" style="width:4vmax" min=1 max='+(maxQuant)+' step=1 value='+maxQuant+' /><input type="submit" value="Ok" />',
				function(){
					const amount = Math.floor($("input:first", this).val());
					if( !amount )
						return;
					game.sellAsset(shop.label, asset.id, amount, myPlayer.id);
				},
				false
			);
			
		});
		$("#modal div.assets.buy div.item").on('click', event => {
			const th = $(event.currentTarget),
				id = th.attr('data-id');
			const item = shop.getItemById(id);
			if( !item ){
				return;
			}
			const asset = item.getAsset();
			if( !asset )
				return;
			const cost = item.getCost();
			const gold = myPlayer.getMoney();
			if( cost > gold )
				return;
			let maxQuant = Math.floor(gold/cost);
			if( maxQuant > item.getRemaining() )
				maxQuant = item.getRemaining();
			this.modal.makeSelectionBoxForm(
				'Amount to BUY: <input type="number" style="width:4vmax" min=1 '+(maxQuant > 0 ? 'max='+(maxQuant) : 'max=100')+' step=1 value=1 /><input type="submit" value="Ok" />',
				function(){
					const amount = Math.floor($("input:first", this).val());
					if( !amount )
						return;
					game.buyAsset(shop.label, item.id, amount, myPlayer.id);
				},
				false
			);
		});
		
		this.modal.onShopChange(shop.id, () => {
			this.drawShopInspector(shop);
		});
		this.modal.onPlayerChange(myPlayer.id, () => {
			this.drawShopInspector(shop);
		});

		return true;
	}


	drawSmithInspector( smith ){
		
		const myPlayer = game.getMyActivePlayer();
		if( !myPlayer )
			return;

		let html = '<h1 class="center">Repair</h1>';
		html += '<h3 class="center">Your Money:<br />';
		const money = myPlayer.getMoney();
		if( !money )
			html += 'Broke';
		else{
			for( let i in Player.currencyWeights ){
				let asset = myPlayer.getAssetByLabel(Player.currencyWeights[i]);
				if( !asset )
					continue;
				const amt = parseInt(asset._stacks);
				if( amt ){
					html += '<span style="color:'+Player.currencyColors[i]+';"><b>'+amt+'</b>'+Player.currencyWeights[i]+"</span> ";
				}
			}
		}
		html += '</h3>';
		
		const repairable = myPlayer.getRepairableAssets();

		if( repairable.length ){
			html += '<div class="assets repair shop inventory">';
			for( let asset of repairable ){
				const cost = asset.getRepairCost(smith);
				html += this.getGenericAssetButton(asset, cost, cost > money ? 'disabled' : '');
			}
			html += '</div>';
		}else{
			html += '<div class="assets repair shop inventory"><h3 class="center">No broken items.</h3></div>';
		}

		this.modal.set(html);
		this.bindTooltips();

		$("#modal div.assets.repair div.item").on('click', event => {
			const targ = $(event.currentTarget);
			const id = targ.attr('data-id');
			game.repairBySmith(smith, myPlayer, id);
		});


		this.modal.onPlayerChange(myPlayer.id, () => {
			this.drawSmithInspector(smith);
			this.draw();
		});

		return true;
	}


	/* MODAL EDITORS */

	// Asset editor
	drawAssetEditor( asset, player ){

		const players = game.getEnabledPlayers();
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
					for( let player of players )
						html += '<option value="'+esc(player.id)+'" '+(a.parent.id === player.id ? 'selected' : '')+'>'+esc(player.name)+'</option>';
					html += '</select>'+
				'</div><br />';

			}


			html += '<div class="flexThreeColumns">';
				html += '<div>Unique ID:<br /><input type="text" name="label" value="'+esc(a.label)+'" /></div>';
				html += '<div>Name:<br /><input type="text" name="name" value="'+esc(a.name)+'" /></div>';
				html += '<div>Shortname:<br /><input type="text" name="shortname" value="'+esc(a.shortname)+'" /></div>';
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
		this.modal.set(html);

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
			a.shortname = $("input[name=shortname]", root).val().trim();
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
				this.staticModal.set('player', player);
			else
				this.drawPlayerAssetSelector(player);
			return false;
		});

		// todo: fix
		$("#saveAsset input.autogen").on('click', () => {

			let slots = [];
			$("input[name=slots]:checked").each(function(){ slots.push($(this).val()); });
			let level = +$("input[name=level]").val();
			let rarity = +$("input[name=rarity]").val();

			let wrapper = Asset.generateStatWrapper(level, slots.length, 0, rarity);
			$("textarea[name=wrappers]").val(JSON.stringify([wrapper.save(true)], null, 4));
			console.log("Setting val");
			updateEffectStats();

		});

		$("textarea[name=wrappers]").on('change', function(){
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

		$("input.back").on('click', () => {
			if( a.parent )
				this.staticModal.set('player', player);
			else
				this.drawPlayerAssetSelector(player);
		});

		$("#saveAsset input.generateRandom").on('click', () => {

			let ass = Asset.generate($("#saveAsset select[name=randSlot]").val(), +$("#saveAsset input[name=level]").val(), undefined, undefined, +$("#saveAsset input[name=rarity]").val() || 0);

			if(!ass)
				return;

			$("#saveAsset input[name=label]").val(ass.label);
			$("#saveAsset input[name=name]").val(ass.name);
			$("#saveAsset input[name=shortname]").val(ass.shortname);
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
		this.modal.prepareSelectionBox(keepPosition);
		for( let pl of players )
			this.modal.addSelectionBoxItem(pl.name, false, pl.id);
		
		this.modal.onSelectionBox(callback);
		
	}

	// Draws a loot selector for container. Container is a DungeonAsset OR Player
	drawContainerLootSelector( player, container, keepPosition = false ){

		// Returns an up to date container (the object pointers may change due to netcode)
		const getUpdatedContainer = function( container ){
			if( container instanceof Player )
				return game.getPlayerById(container.id);
			return game.dungeon.getActiveRoom().getAssetById(container.id);
		}

		if( !container )
			this.modal.closeSelectionBox();

		const playAnimation = container instanceof DungeonRoomAsset ? container._stage_mesh.userData.playAnimation : false;
		this.modal.prepareSelectionBox(keepPosition);


		const items = container.getLootableAssets();		// Both player and container have this method
		if( !items.length )
			return this.modal.closeSelectionBox();

		for( let item of items ){
			this.modal.addSelectionBoxItem(item.name+(item._stacks > 1 ? ' ['+(+item._stacks)+']' : ''), item.getTooltipText(), item.id, [Asset.RarityNames[item.rarity]]);
		}
		if( playAnimation )
			playAnimation("open");


		if( container instanceof Player )
			this.modal.onPlayerChange(player, () => this.drawContainerLootSelector(
				game.getPlayerById(player.id), 
				getUpdatedContainer(container), 
				true
			), true);
		else
			this.modal.onMapUpdate(() => this.drawContainerLootSelector(
				game.getPlayerById(player.id), 
				getUpdatedContainer(container), 
				true
			), true);
		

		this.modal.onSelectionBox(function(){

			let asset = $(this).attr('data-id');
			container.lootToPlayer(asset, player);			// Both player and DungeonRoomAsset have this method

		});
		this.modal.onSelectionBoxClose(() => {

			const c = getUpdatedContainer(container);
			if( playAnimation && c.isInteractive() )
				playAnimation("idle");
				
		});
		this.bindTooltips();

	}

	async toggleBlackScreen( fnAtMidpoint ){
		this.blackScreen.toggleClass("anim", true);
		await delay(3200);
		if( typeof fnAtMidpoint === "function" )
			fnAtMidpoint();
		this.blackScreen.toggleClass("anim", false);
	}


	/* Roleplay */
	drawRoleplay(){

		const roleplay = game.roleplay;

		if( roleplay._waiting )
			return;

		const div = this.roleplay;
		const stage = roleplay.getActiveStage();
		const player = game.getMyActivePlayer();
		if( !roleplay.completed && stage ){
			
			const portrait = stage.getPortrait();

			$("div.portrait", div)
				.css("background-image", portrait ? 'url('+esc(portrait)+')' : 'none');
			$('> div.left', div)
				.toggleClass('hidden', !portrait);

			const name = stage.getName();
			let html = '';
			if( name )
				html += '<span class="name">'+stylizeText(name)+'</span><br />';

			
			$("div.text", div).html(html+stylizeText(stage.getText()));
			
			html = '';
			let sel = false;
			for( let response of stage.options ){
				let s = response.id === this.selected_rp;
				if( s )
					sel = true;
				if( response.validate(game.getMyActivePlayer()) ){
					html += '<div class="option bg'+(s ? ' selected' : '')+'" data-id="'+esc(response.id)+'">'+stylizeText(response.getText())+'</div>';
				}
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
		else
			this.selected_rp = '';
		
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

		let left = 0, top = 0;
		
		if( parentElement ){
			
			const pe = $(parentElement);
			const pos = pe.offset();

			left = pos.left+pe.outerWidth()/2;
			top = pos.top;
			
		}
		this.setTooltipAtPoint(text, left, top);

	}

	setTooltipAtCursor( text ){
		this.setTooltipAtPoint(text, game.renderer.mouseAbs.x, game.renderer.mouseAbs.y);
	}

	setTooltipAtPoint( text, left, top ){

		this.tooltip
			.html(text)
			.toggleClass("hidden", !text)
		;
		
		const width = this.tooltip.outerWidth(),
			height = this.tooltip.outerHeight()
		;
		top -= height;

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


		$(".tooltipParent").each((idx,el) => {
			
			$(el).off('mouseover', el.mo)
				.off('mouseout', el.mu)
				.off('remove', el.mu)
			.on('mouseover', mo)
			.on('mouseout', mu)
			.on('remove', mu);
			el.mo = mo;
			el.mu = mu;
		});
			
		;

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
		if(!el.length)
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
		let message = this.csl.text().trim();
		if( !message )
			return;
		this.addMessageToConsoleLog(message);

		this.csl.text('');
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

			else if( task === 'afk' ){
				return game.toggleAFK();
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


	/* FLOATING COMBAT TEXT */
	// Gets a free combat text div. If it doesn't exist, create a new one.
	getFreeCombatText(){
		const base = this.fct;
		const free = $("div.text.free:first", base);
		if( !free.length ){
			const out = $('<div class="text">0</div>');
			base.append(out);
			return out;
		}
		return free;
	}

	floatingCombatText(amount, player, type = ''){

		if( amount !== undefined ){
			
			this.fctQue.push({
				amount : amount,
				player : player instanceof Player ? player.id : player,
				type : type
			});
			if( game.is_host && game.net.isConnected() )
				game.net.dmFloatingCombatText(amount, player.id, type);

		}
		if( this.fctTimer || !this.fctQue.length )
			return;

		const entry = this.fctQue.shift();
		amount = entry.amount;
		player = entry.player;
		type = entry.type;
		this.fctTimer = setTimeout(() => {
			this.fctTimer = false;
			this.floatingCombatText();
		}, 250);

		let plel = $("[data-id='"+esc(player)+"']", this.players);
		let left = 0.5, top = 0.5;
		if( plel.length ){
			const width = plel.outerWidth(),
				height = plel.outerHeight(),
				pos = plel.offset()	
			;
			left = (pos.left+width/2);
			top = (pos.top+height/2);
			left += Math.random()*(width*0.6)-width*0.3;
			top += Math.random()*(height*0.4)-height*0.2;
			left /= window.innerWidth;
			top /= window.innerHeight;
		}

		if( !isNaN(amount) && amount > 0 )
			amount = '+'+amount;

		const el = this.getFreeCombatText();
		el
			.toggleClass("hidden free", false)
			.text(amount)
			.attr('style', 'left:'+(left*100)+'%; top:'+(top*100)+'%')
			.toggleClass(type, true)
		;
		setTimeout(() => {
			el.toggleClass('hidden free', true).toggleClass(type, false);
		}, 3500);


	}



	// TEMPLATES
	// Sets the content of the button based on an action
	static setActionButtonContent( buttonElement, action, player ){

		const button = $(buttonElement);
		button[0].className = 
			'action button tooltipParent tooltipAbove '+
			(action.detrimental ? 'detrimental' : 'beneficial')+' '+
			(action.isAssetAction() ? ' item '+Asset.RarityNames[action.parent.rarity] : '')
		;

		// Update id
		button.attr('data-id', action.id);
			
		// Update icon
		const img = $('img', button),
			imgSrc = 'media/wrapper_icons/'+esc(action.getIcon())+'.svg';
		if( img.attr('src') !== imgSrc )
			img.attr('src', imgSrc);

		// Update charges
		let uses = false;	// false hides
		// This action is tied to an asset
		if( action.isAssetAction() && action.parent.charges !== -1 )
			uses = player.numAssetUses(action.parent.label, game.battle_active);	
		else if( action._charges > 1 )
			uses = action._charges;

		const usesEl = $('> div.uses', button);
		usesEl.toggleClass('hidden', !uses)
		if( +usesEl.text() !== uses )
			usesEl.text(uses);

		// Cooldown
		const cdEl = $('> div.cd > span', button);
		$('> div.cd', button).toggleClass('hidden', !action._cooldown);
		if( +cdEl.text !== +action._cooldown )
			cdEl.text(action._cooldown);

		// Tooltip
		const ttEl = $('> div.tooltip', button);
		ttEl.toggleClass('enabled disabled', false); // .toggleClass(castableClass, true);
		if( ttEl.html() !== action.getTooltipText() )
			ttEl.html(action.getTooltipText());

	}


};


UI.Templates = {
	actionButton : '<div class="action">'+
			'<img>'+
			'<div class="hotkey"></div>'+
			'<div class="uses"></div>'+
			'<div class="cd"><span></span></div>'+
			'<div class="tooltip actionTooltip"></div>'+
		'</div>',
	
};
