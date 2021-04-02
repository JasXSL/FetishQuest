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

const NUM_ACTIONS = 18;	// Max nr actions the UI can draw



export default class UI{

	constructor(parent){
		
		const th = this;
		this.parent = parent;

		this.modal = new Modal(this);					// Variable modal. It's slower and should really only be used for dm tools and yes/no.
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
		this.renderer = $("#renderer");

		this.dungeonProgress = $("#dungeonProgress");

		

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

				if( StaticModal.active && StaticModal.active.id === 'inventory' )
					StaticModal.close();
				else{
					game.uiAudio( 'backpack' );
					StaticModal.set('inventory');
				}

			}
			else if( event.key === 'l' ){

				if( StaticModal.active && StaticModal.active.id === 'quests' )
					StaticModal.close();
				else{
					StaticModal.set('quests');
					game.uiAudio( 'toggle_quests' );
				}

			}
			else if( event.key === 'Escape' ){

				if( this.action_selected )
					this.closeTargetSelector();

				if( this.modal.open || StaticModal.active ){
					
					game.uiClick();
					if( this.modal.open ){
						this.modal.close();
						return;
					}

					StaticModal.close();
					
				}

			}

			// Hotbar
			else if( +event.key && +event.key < 10 ){

				if( this.action_selected ){

					$('div.player[data-index='+event.key+']', this.players).mousedown().mouseup();

				}
				else{

					const button = this.actionbar_actions[0].children[event.key-1];
					if( button )
						$(button).mousedown().mouseup();

				}

			}

			// E ends turn
			else if( event.key === 'e' ){

				if( this.parent.isMyTurn() )
					this.endTurnButton.click();

			}

			else if( event.key === 'q' ){

				$("#execMultiCast").click();

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

		this.toggle(true);

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

		this.map = map;
		this.fx = fx;
		this.renderer.html(map);
		$("#fx").html(fx);
		this.toggleAll(this.visible);

		this.initialized = true;
		this.draw();

		


	}

	toggleAll( visible ){

		const hidden = !visible;
		this.board.toggleClass('hidden', hidden);
		this.gameIcons.toggleClass('hidden', hidden);
		this.fct.toggleClass('hidden', hidden);
		this.renderer.toggleClass('hidden', hidden);

		if( hidden ){

			this.blackScreen.toggleClass('hidden', hidden);
			this.multiCastPicker.toggleClass('hidden', hidden);
			this.roleplay.toggleClass('hidden', hidden);
			this.loadingScreen.toggleClass('hidden', hidden);
			this.yourTurnBorder.toggleClass('hidden', hidden);
			this.mapChat.toggleClass('hidden', hidden);
			this.dungeonProgress.toggleClass('hidden', hidden);

		}

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
		this.toggleAll(false);

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

			game.renderer.updatePlayerMarkers();

			this.drawProceduralTooltip();
			

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

	// Draws the procedural exploration percentage
	drawProceduralTooltip(){

		const dungeon = game.dungeon;
		const isProcedural = Boolean(dungeon.procedural);
		this.dungeonProgress.toggleClass("hidden", !isProcedural || game.battle_active);
		if( isProcedural && !game.battle_active ){

			const numExplored = dungeon.getNumExploredRooms();
			const numRooms = dungeon.rooms.length;
			const completed = numExplored === numRooms;

			this.dungeonProgress[0].innerText = completed ? 'Exploration Complete' : Math.floor(numExplored/numRooms*100)+'% Explored';
			this.dungeonProgress.toggleClass("completed", completed);

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
		for( let i=0; i < NUM_ACTIONS; ++i ){

			const button = $(buttons[i]);
			let action = actions[i];
			if( !action )
				continue;

			let castable = action.castable() && myTurn;
			castableActions += Boolean(castable);

			// Update class name
			this.constructor.setActionButtonContent(button, action, player, (i < 10 ? i+1 : false));

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
				'<div class="topLeft hidden"></div>'+
				
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
			nr_hostile = 0
		;

		
		// Update the individual players
		i = 0;
		for( let p of players ){

			const invis = p.isInvisible();
			this.drawPlayer(
				p, 
				(invis ? false : ++i)
			);
			if( !invis ){

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
		$('div.player', this.players).off('click').on('click', async function( event ){

			if( !th.action_selected && !th.block_inspect ){

				await StaticModal.set('player', $(this).attr('data-id'));

			}
		});

	}

	// Returns interaction types
	getViableInteractionsOnPlayer( p ){

		const myActive = game.getMyActivePlayer();
		let rr = false;
		try{
			rr = game.roomRentalAvailableTo(p, myActive, true);
		}catch(err){}

		let rps = game.getRoleplaysForPlayer( p );
		if( game.isInPersistentRoleplay() )
			rps = [];

		return {
			talk : rps.length,
			inspect : true,
			loot : myActive && p.isLootableBy(myActive),
			shop : myActive && game.getShopsByPlayer(p).filter(sh => game.shopAvailableTo(sh, myActive)).length,
			repair : myActive && game.smithAvailableTo(p, myActive),
			gym : myActive && game.gymAvailableTo(p, myActive),
			rent : myActive && rr,
		};

	}

	// Type correlates to a key in getViableInteractionsOnPlayer
	onPlayerInteractionUsed( type, p ){

		const myActive = game.getMyActivePlayer();
		if( type === 'loot' ){
			
			game._looted_players[p.id] = true;
			$("div.player[data-id='"+p.id+"'] div.interaction[data-type=loot]", this.players).toggleClass("highlight", false);
			this.drawContainerLootSelector(myActive, p);

		}
		else if( type === 'shop' ){

			const shops = game.getShopsByPlayer(p).filter(sh => game.shopAvailableTo(sh, myActive));
			StaticModal.set('shop', shops[0]);
			game.uiAudio( "shop_entered" );

		}
		else if( type === 'repair' ){

			StaticModal.set('smith', p);
			game.uiAudio( "smith_entered" );
			
		}
		else if( type === 'gym' ){
			StaticModal.set('gym', p);
			game.uiAudio( "gym_entered" );
		}
		else if( type === 'rent' ){
			game.roomRentalUsed(p, myActive);
		}
		else if( type === 'inspect' )
			StaticModal.set("player", p);
		else if( type === 'talk' ){

			const rp = game.getRoleplaysForPlayer(p).shift();
			if( rp )
				game.setRoleplay(rp);

		}

	}

	drawPlayer( p, index ){

		const tp = game.getTurnPlayer(),
			myTurn = tp && tp.id === p.id,
			el = $("div.player[data-id='"+esc(p.id)+"']", this.players),
			myActive = game.getMyActivePlayer(),
			friendly = p.team === 0
		;

		
		el.attr('data-index', index || -1);

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
				chargingEl = $('> div.charging', topRightEl),
			topLeftEl = $('> div.topLeft', el)
		;


		index = +index;
		if( !index || index > 9 )
			index = '';
		topLeftEl.text(index);

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
		const interactions = this.getViableInteractionsOnPlayer(p);

		$("> div.interactions", el).toggleClass('hidden', !myActive);

		$("div.interaction[data-type=chat]", el)
			.toggleClass("hidden", !interactions.talk).off('click').on('click', event => {

				event.stopImmediatePropagation();
				this.onPlayerInteractionUsed( "talk", p );

			});


		const showLoot = interactions.loot, lootDiv = $("div.interaction[data-type=loot]", el);
		lootDiv
			.toggleClass("hidden", !showLoot)
			.toggleClass("highlight", !game._looted_players[p.id])
			.off('click').on('click', event => {

				event.stopImmediatePropagation();
				this.onPlayerInteractionUsed( "loot", p );

			});

		
		const showShop = interactions.shop;
		$("div.interaction[data-type=shop]", el).toggleClass("hidden", !showShop).off('click').on('click', event => {
			
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "shop", p );

		});

		const showSmith = interactions.repair;
		$("div.interaction[data-type=repair]", el).toggleClass("hidden", !showSmith).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "repair", p );
		});


		const showGym = interactions.gym;
		$("div.interaction[data-type=gym]", el).toggleClass("hidden", !showGym).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "gym", p );
		});

		try{
			const showRent = interactions.rent;
			$("div.interaction[data-type=rent]", el).toggleClass("hidden", !showRent).off('click').on('click', event => {
				event.stopImmediatePropagation();
				this.onPlayerInteractionUsed( "rent", p );
			});
		}catch(err){}
	

		

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

			let duration = wrapper._duration;
			if( wrapper.ext )
				duration = wrapper._added+wrapper.duration-game.time;
			elDuration.toggleClass('hidden', duration < 1);
			if( duration > 0 && +elDuration.text() !== duration ){
				
				let dText = duration;
				if( wrapper.ext ){
					if( dText/(3600*24) > 1 )
						dText = Math.ceil(dText/(3600*24))+'d';
					else if( dText/3600 > 1 )
						dText = Math.ceil(dText/3600)+'h';
					else if( dText/60 > 1 )
						dText = Math.ceil(dText/60)+'m';
					else
						dText = dText+'s';
				}
				elDuration.text(dText);

			}
			
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
			'<div data-id="settings" class="button" style="background-image: url(media/wrapper_icons/auto-repair.svg)"></div>'+
			'<div data-id="help" class="button'+(localStorage.helpClicked ? '' : ' highlight')+'" style="background-image: url(media/wrapper_icons/help.svg)"></div>'+
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
				StaticModal.set('quests');
				game.uiAudio( 'toggle_quests' );
			}
			else if( id === "mainMenu" ){
				game.uiAudio( 'menu_generic' );
				StaticModal.set('mainMenu');
			}
			else if( id === 'inventory' ){
				game.uiAudio( 'backpack' );
				StaticModal.set('inventory');
			}
			else if( id === 'settings' ){
				game.uiAudio( 'menu_generic' );
				StaticModal.set('settings');
			}
			else if( id === 'help' ){
				
				game.uiAudio( 'menu_generic' );
				StaticModal.set('help');
				localStorage.helpClicked = 1;
				el.toggleClass('highlight', false);

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




	/* Events */
	onNewGame(){
		delete localStorage.helpClicked;
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

		$('div.player > div.topLeft', this.players).toggleClass('hidden', false);

		

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
		$('div.player > div.topLeft', this.players).toggleClass('hidden', true);

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
			ht += '<input type="button" value="[Q] Done" id="execMultiCast" />';

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
	// Player inspect
	// uuid can also be a player object
	drawAssetTradeTarget( asset, amount ){

		const player = asset.parent;
		// Draw a list of acceptable targets
		const targets = game.getTeamPlayers( player.team ).filter(el => el.id !== player.id);
		const modal = this.modal;
		modal.prepareSelectionBox( true );
		for( let target of targets )
			modal.addSelectionBoxItem( target.name, '', target.id );

		modal.onSelectionBox(function(){

			const pid = $(this).attr("data-id");
			if( game.tradePlayerItem( player.id, pid, asset.id, amount ) ){
				StaticModal.set('inventory');
			}
			modal.closeSelectionBox();

		});

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
			if( playAnimation && c && c.isInteractive() )
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

		// Detect a stage change due to synonyms in text
		const stageChanged = this._cache_rp_stage !== stage;
		this._cache_rp_stage = stage;

		

		// Roleplay exists
		if( !roleplay.completed && stage ){

			let html = '';

			// only update text is the stage has changed
			if( stageChanged ){
				
				const portrait = stage.getPortrait();

				$("div.portrait", div)
					.css("background-image", portrait ? 'url('+esc(portrait)+')' : 'none');
				$('> div.left', div)
					.toggleClass('hidden', !portrait);

				const name = stage.getName();
				if( name )
					html += '<span class="name">'+stylizeText(name)+'</span><br />';
				
				$("div.text", div).html(html+stylizeText(stage.getText(true)));
				
			}


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




	/* 3d MODELS */
	drawPlayerContextMenu( player ){
		
		// Player marker has been clicked
		const interactions = this.getViableInteractionsOnPlayer(player);
		this.modal.prepareSelectionBox();
		for( let i in interactions ){
			
			if( interactions[i] )
				this.modal.addSelectionBoxItem( ucFirst(i), '', i );

		}
		const th = this;
		this.modal.onSelectionBox(function(){
			
			th.modal.closeSelectionBox();
			const el = $(this);
			th.onPlayerInteractionUsed(el.attr('data-id'), player);

		});

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

	floatingCombatText(amount, player, type = '', crit = false ){

		if( amount !== undefined ){
			
			this.fctQue.push({
				amount : amount,
				player : player instanceof Player ? player.id : player,
				type : type,
				crit : crit
			});
			if( game.is_host && game.net.isConnected() )
				game.net.dmFloatingCombatText(amount, player.id, type, crit);

		}
		if( this.fctTimer || !this.fctQue.length )
			return;

		const entry = this.fctQue.shift();
		amount = entry.amount;
		player = entry.player;
		type = entry.type;
		crit = entry.crit;

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
			.toggleClass('crit', Boolean(crit))
		;
		setTimeout(() => {
			el.toggleClass('hidden free', true).toggleClass(type, false);
		}, 3500);


	}



	// TEMPLATES
	// Sets the content of the button based on an action
	static setActionButtonContent( buttonElement, action, player, hotkey ){

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

		const hotkeyEl = $('> div.hotkey', button);
		if( hotkey === undefined || hotkey === null || hotkey === false )
			hotkey = '';
		if( hotkeyEl.text !== hotkey )
			hotkeyEl.text(hotkey);

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
