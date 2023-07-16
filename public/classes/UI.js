import Player from "./Player.js";
import GameEvent from "./GameEvent.js";
import Action from './Action.js';
import Game from './Game.js';
import Asset from "./Asset.js";
import NetworkManager from './NetworkManager.js';
import * as THREE from '../ext/THREE.js';
import { DungeonRoomAsset } from "./Dungeon.js";
import StaticModal from "./StaticModal.js";
import Modal from "./Modal.js";
import Book from "./Book.js";
import { Effect } from "./EffectSys.js";
import Encounter from "./Encounter.js";
import Bot from "./Bot.js";

const NUM_ACTIONS = 18;	// Max nr actions the UI can draw
const NUM_SUBS = 5;		// Max actions per group

const playerTemplate = $(
	'<div class="player">'+
		'<div class="content">'+
			'<div class="bg"></div>'+
			'<div class="stats">'+
				'<span class="name" style="color:#DFD">'+
					'<div class="focus tooltipParent">'+
						'<div class="tooltip center">Unaware of your active player, hit chance increased. Awareness is added when you use a directed action against a target, or they use one on you.</div>'+
					'</div>'+
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
					'<span class="armor resource thin" title="Damage reduction from armor." >'+
						'<div class="bg" style="background-image:url(media/wrapper_icons/shield-echoes.svg)"></div><span></span>'+
					'</span>'+
					'<span class="chest resource thin">'+
						'<div class="bg" style="background-image:url(media/wrapper_icons/shirt.svg)"></div><span></span>'+
					'</span>'+
					'<span class="legs resource thin">'+
						'<div class="bg" style="background-image:url(media/wrapper_icons/trousers.svg)"></div><span></span>'+
					'</span>'+
					'<span class="arousal resource" title="Arousal">'+
						'<div class="bg" style="background-image:url(media/wrapper_icons/pierced-heart.svg)"></div><span></span>'+
					'</span>'+
					'<span class="AP resource tooltipParent" title="Action Points">'+
						'<div class="bg" style="background-image:url(media/wrapper_icons/jump-across.svg)"></div><span></span>'+
						'<div class="tooltip center">'+
							'<span class="colorOffensive">0 Offensive</span> | '+
							'<span class="colorDefensive">0 Defensive</span> | '+
							'<span class="colorUtility">0 Utility</span>'+
						'</div>'+
					'</span>'+
					'<span class="HP resource large" title="Hit Points" >'+
						'<span></span>'+
					'</span>'+
				'</span>'+
			'</div>'+
		'</div>'+
		'<div class="topRight">'+
			'<div class="wrappers"></div>'+
			'<div class="charging"></div>'+
		'</div>'+
		'<div class="topLeft hidden"></div>'+
		'<div class="targetingStats"></div>'+

		'<div class="netgameStatus hidden">'+
			'<div class="loadingPerc hidden">'+
				'<img src="media/wrapper_icons/empty-hourglass.svg" />'+
				'<span>0%</span>'+
			'</div>'+
			'<div class="inMenu tooltipParent hidden">'+
				'<img src="media/wrapper_icons/auto-repair.svg" />'+
				'<div class="tooltip">Player is currently in a menu</div>'+
			'</div>'+
		'</div>'+

		'<div class="shields">'+
			'<div class="shield" title="Blocking incoming damage">'+
				'<div class="bg" style="background-image:url(media/wrapper_icons/bordered-shield.svg)"></div>'+
				'<span class="val">10</span>'+
			'</div>'+
		'</div>'+

		'<div class="speechBubble hidden"><div class="arrow"></div><div class="content">HELLO!</div></div>'+

		'<div class="interactions">'+
			'<div class="interaction hidden" data-type="chat"><img src="media/wrapper_icons/chat-bubble.svg" /></div>'+
			'<div class="interaction hidden" data-type="gym"><img src="media/wrapper_icons/weight-lifting-up.svg" /></div>'+
			'<div class="interaction hidden" data-type="shop"><img src="media/wrapper_icons/hanging-sign.svg" /></div>'+
			'<div class="interaction hidden" data-type="transmog"><img src="media/wrapper_icons/gold-nuggets.svg" /></div>'+
			'<div class="interaction hidden" data-type="repair"><img src="media/wrapper_icons/anvil-impact.svg" /></div>'+
			'<div class="interaction hidden" data-type="altar"><img src="media/wrapper_icons/sword-altar.svg" /></div>'+
			'<div class="interaction hidden" data-type="bank"><img src="media/wrapper_icons/bank.svg" /></div>'+
			'<div class="interaction hidden" data-type="rent"><img src="media/wrapper_icons/bed.svg" /></div>'+
			'<div class="interaction hidden" data-type="loot"><img src="media/wrapper_icons/bindle.svg" /></div>'+
		'</div>'+
	'</div>'
);


export default class UI{

	constructor(parent){
		
		const th = this;
		this.parent = parent;

		this.modal = new Modal(this);					// Variable modal. It's slower and should really only be used for dm tools and yes/no.
		this.initialized = false;

		this.board = $("#ui");
		this.content = $("#content");
		this.players = $("#ui > div.players");
		this.friendly = $("#ui > div.players > div.left");
		this.hostile = $("#ui > div.players > div.right");
		this.action_selector = $("#ui > div.actionbar");
		this.resourceBar = $("div.resources", this.action_selector);
		this.actionbar_actions = $("> div.actions", this.action_selector);
		this.rerolls = $("> div.reroll", this.action_selector);
			this.rerollsSpan = $("> span", this.rerolls);

		this.blackScreen = $("#blackScreen");

		this.momentumGain = $("#ui > div.momentumGain");
		this.middle = $("#ui > div.middle");
		this.text = $("> div.content", this.middle);
		this.csl = $("> div.chat", this.middle);
		this.gameIcons = $("#gameIcons");
		this.multiCastPicker = $("#multiCastPicker");
		this.roleplay = $("#roleplay");
		this.selected_rp = '';	// ID of selected roleplay option
		this.tooltip = $("#tooltip");
		this.loadingScreen = $("#loading_screen");

		this.myLoadingBar = $("div.mine > div.loadingBar > div.slider", this.loadingScreen);
		this.myLoadingStatusText = $("div.mine > p > span", this.loadingScreen);
		this.hostLoadingWrapper = $("div.host", this.loadingScreen);
		this.hostLoadingBar = $("div.loadingBar > div.slider", this.hostLoadingWrapper);
		this.hostLoadingStatusText = $("p > span", this.hostLoadingWrapper);
		this.loadingTip = $("div.tip", this.loadingScreen);

		this.grappleWrapper = $("> div.grapples", this.board);
		this.grappleLines = $();

		this.loadingMaxSteps = 0;	// Steps to load
		this.yourTurn = $("#ui > div.yourTurnBadge");
		this.yourTurnBorder = $("#yourTurnBorder");
		this.mapChat = $("#mapChat");
		this.fct = $("#fct");
		this.fctQue = [];
		this.fctTimer = false;
		this.renderer = $("#renderer");

		this.dungeonProgress = $("#dungeonProgress");

		this.book = $("#book");
		this.bookPageA = $("div.page.A", this.book);
		this.bookPageB = $("div.page.B", this.book);
		this.bookPageNrA = $("div.pageNr.A", this.book);
		this.bookPageNrB = $("div.pageNr.B", this.book);
		this.bookNavA = $("div.nav.A", this.book);
		this.bookNavB = $("div.nav.B", this.book);
		this.bookClose = $("div.close", this.book);

		this.miniMap = $("#miniMap");
		this.miniMapTop = $("> div.top", this.miniMap);
		this.miniMapNav = $("> div.nav", this.miniMapTop);
		this.miniMapMinimize = $("> div.minimize", this.miniMapTop);
		this.miniMapZ = $("> div.zLevel", this.miniMapTop);
		this.miniMapContent = $("> div.content", this.miniMap);
		this.minimap_current_z = 0;
		
		this.momentum_gain = [];	// Cache of momentum icons

		this.endTurnButton = null;

		this.drawTimer = false;

		this._hold_actionbar = false;	// Workaround for actionbar update being on a timer. Prevents interacting with the action bar until the next draw.
		this._action_used = false;		// Since both click and drag can use an action, this prevents the action from being fired twice from instant casts

		// Active player has viable moves
		this._has_moves = false;
		this.visible = localStorage.ui_visible === undefined ? true : Boolean(parseInt(localStorage.ui_visible));	// main UI layer visible

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

		this.pgi = {};	// "popped" game icons

		this.csl.off('keydown').on('keydown', event => {
			if( event.altKey || event.ctrlKey ){

				if( event.key === "ArrowUp" ){
					if( this.consolePointer === 0 )
						this.addMessageToConsoleLog(this.csl.text());
					++this.consolePointer;
				}
				else if( event.key === "ArrowDown" )
					--this.consolePointer;
				else
					return true;	// Allow default ctrl behavior

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

			if( event.shiftKey || event.ctrlKey )
				return;

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
			else if( event.key === 'w' ){

				game.uiClick(this.miniMapMinimize[0]);
				this.toggleMiniMap();

			}

			// TAB
			else if( event.keyCode === 9 && this.action_selected ){

				event.preventDefault();
				const player = game.getMyActivePlayer();
				if( !player )
					return;

				player.setActiveActionGroupLabel( this.action_selected.group, 1);	// Setting to 1 adds one
				this.drawActionSelector();
				// Timeout is needed due to the click+drag direct system

				const pre = this.getActiveActionButton();
				const first = $("> div.action:not(.hidden):first", pre.parent());
				first.mousedown().click();
				this.bindTooltips();

			}

			// Hotbar
			else if( +event.key && +event.key < 10 ){

				if( this.action_selected ){

					$('div.player[data-index='+event.key+']', this.players).mousedown().mouseup();

				}
				else{

					const button = this.actionbar_actions[0].children[event.key-1].children[0];
					if( button ){
						
						$(button).mousedown().mouseup();
						button.parentNode.classList.toggle('popout', true);

					}

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
			else if( event.key === 'c' ){

				if( StaticModal.active && StaticModal.active.id === 'mainMenu' && StaticModal.active.activeTab === 'Group Finder' )
					StaticModal.close();
				else
					StaticModal.setWithTab('mainMenu', 'Group Finder');

				game.uiAudio( "tab_select", 0.5, event.target );

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

		this.updateDMTools();
		this.board.toggleClass("bubbles", this.showBubbles());

		const closeBook = () => {
			this.book.toggleClass('hidden', true);
			game.uiAudio( 'book_close' );
		};

		this.book.off('click').on('click', event => {
			
			if( event.target === event.currentTarget )
				closeBook();
			
		});
		this.bookClose.off('click').on('click', () => {
			closeBook();
		});

		this.miniMapMinimize.off('click').on('click', () => {

			game.uiClick(this.miniMapMinimize[0]);
			this.toggleMiniMap();

		});
		this.miniMapNav.off('click').on('click', event => {
			
			game.uiClick(this.miniMapNav[0]);
			this.changeMinimapLevel(
				event.currentTarget.innerText === '+' ? 1 : -1
			);

		});

		
		this.resourceBar.off('click').on('click', event => {

			if( !event.target.classList.contains("swap") || !event.target.parentElement.classList.contains("on")  )
				return;

			const ap = game.getMyActivePlayer();
			if( !ap )
				return;
			
			// Type of momentum we're rerolling
			let idx = Math.trunc(event.target.parentElement.dataset.i);
			if( ap.reroll < 1 )
				return;
			
			const to = Math.trunc(event.target.dataset.i);
			game.rerollMomentum(ap, idx, to); 

		});

		this.toggleMiniMap(Boolean(localStorage.mini_map));

	}

	updateDMTools(){
		this.board.toggleClass("dev", this.showDMTools());
	}
 
	// Takes the 3d canvases
	ini( map, fx ){

		this.toggle(this.visible);

		if( this.initialized )
			return;		

		// Build the action bar
		let html = '';
		for( let i=0; i<NUM_ACTIONS; ++i )
			html += UI.Templates.getActionButtonGroup();
		
		html += '<div data-id="end-turn" class="action button autoWidth"><div class="bg"></div><span>END TURN</span></div><span class="spectating">Spectating</span>';
		this.actionbar_actions.html(html);
		this.endTurnButton = $('> div[data-id="end-turn"]',this.actionbar_actions);
		this.spectatingText = $('> span', this.actionbar_actions);

		this.map = map;
		this.fx = fx;
		this.renderer.html(map);
		$("#fx").html(fx);
		this.toggleAll(true);

		this.initialized = true;
		this.draw();

		$(window).on('resize', () => {
			this.drawGrapples();
		});		


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
		return !Boolean(+localStorage.hide_dm_tools) && window?.game?.is_host;
	}

	showBubbles(){
		return !Boolean(+localStorage.hide_bubbles);
	}

	destructor(){

		$(window).off('resize');
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
			
			this.updateMiniMap();

			this.drawGrapples();

			//console.log("execDraw took", Date.now()-time, times);

		});
		

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

	// Returns a jquery object of the action button bound to this.action_selected
	getActiveActionButton(){
		return $("> div.actionGroup > div[data-id='"+esc(this.action_selected.id)+"']:not(.hidden)", this.actionbar_actions);
	}

	// Draws action selector for a player
	drawActionSelector( player ){

		let time = Date.now();

		if( !player )
			player = game.getMyActivePlayer();

		// Hide the action buttons from start
		const buttons = $("> div.actionGroup", this.actionbar_actions); // Get the groups
		this.action_selector.toggleClass('spectating', !player);

		if( !(player instanceof Player) ){

			this.yourTurn.toggleClass('hidden', true);
			this.yourTurnBorder.toggleClass('hidden', true);
			this.endTurnButton.toggleClass('hidden', true);
			return;

		}
		

		let actions = player.getActions('e'), 
			th = this
		;

		const myTurn = game.isMyTurn() || !game.battle_active;
		this.yourTurn.toggleClass('hidden', !myTurn || !game.battle_active);
		this.yourTurnBorder.toggleClass('hidden', !myTurn || !game.battle_active);

		

		// Update resource bar
		this.rerolls[0].classList.toggle("hidden", player.reroll < 1);
		this.rerollsSpan[0].innerText = player.reroll;
		

		// Update momentum bar
		this.resourceBar[0].classList.toggle("re", player.reroll > 0);
		let dots = $("> div.point", this.resourceBar);
		let ln = dots.length;
		const maxPoints = player.getMaxMomentum();
		const currentPoints = player.getMomentum();
		

		// Add more dots if need be
		for( let i = 0; i < maxPoints-ln; ++i ){

			let div = document.createElement('div');
			div.className = 'point';
			div.dataset.i = -1;
			div.dataset.idx = i+ln;
			this.resourceBar.append(div);

			let sub = document.createElement('div');
			sub.classList.add("swap", "point");
			div.append(sub);
			sub = document.createElement('div');
			sub.classList.add("swap", "point");
			div.append(sub);

			dots = dots.add(div);

		}

		// Hide unused (Can be used later when the amount of momentum isn't hardcoded)
		for( let i = 0; i < dots.length; ++i )
			dots[i].classList.toggle("hidden", i >= maxPoints);
		
		const 
			off = player.getMomentum(Player.MOMENTUM.Off),
			def = player.getMomentum(Player.MOMENTUM.Def),
			uti = player.getMomentum(Player.MOMENTUM.Uti)
		;

		const momTypes = ['off','def','uti'];
		// Fill in
		let n = 0;
		for( let i = 0; i < maxPoints; ++i ){

			let type = Player.MOMENTUM.Off;
			if( i >= off )
				type = Player.MOMENTUM.Def;
			if( i >= off+def )
				type = Player.MOMENTUM.Uti;
			if( i >= off+def+uti )
				type = -1;

			let pre = Math.trunc(dots[i].dataset.i);

			const cList = dots[i].classList;
			dots[i].dataset.i = type;


			// Animate a sweep
			if( pre !== type ){

				cList.remove(...momTypes);
				dots[i].classList.toggle('on', type !== -1);
				if( ~type ){

					++n;

					cList.toggle('ch', false);
					setTimeout(() => {
						cList.toggle('ch', true);
					}, n*25);
					// Update subselector
					const ch = dots[i].children;
					ch[0].classList.remove(...momTypes)
					ch[1].classList.remove(...momTypes);
					ch[0].classList.add(momTypes[(type+1)%3]);
					ch[0].dataset.i = (type+1)%3;
					ch[1].classList.add(momTypes[(type+2)%3]);
					ch[1].dataset.i = (type+2)%3;

					dots[i].classList.add(momTypes[type]);

				}

			}
			

			


		}


		

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

		// cast actions into arrays with grouped actions ex [[stdatt,stdarr,stdshock],[action2],[action3]]
		let actionsGrouped = [];
		// Returns an index to add an action to, or boolean false if you should add new
		const getGroupIndex = ac => {
			
			if( ac.group === "" )
				return false;

			for( let i = 0; i < actionsGrouped.length; ++i ){

				if( actionsGrouped[i][0].group === ac.group )
					return i;

			}
			return false;

		}

		for( let action of actions ){

			let idx = getGroupIndex(action);
			if( idx === false )
				actionsGrouped.push([action]);
			else
				actionsGrouped[idx].push(action);

		}

		time = Date.now();
		let castableActions = 0;
		for( let i=0; i < NUM_ACTIONS; ++i ){

			const group = buttons[i];
			let sActions = actionsGrouped[i];	// sub actions
			const subs = $('> div.action', group);

			group.classList.toggle("hidden", !sActions);
			if( !sActions )
				continue;		// No actions here
			
			let labelActive = player.getActiveActionGroupLabel(sActions[0].group);
			for( let s = 0; s < NUM_SUBS; ++s ){

				const button = $(subs[s]);
				let action = sActions[s];
				button.toggleClass("hidden", !action);
				if( !action )
					continue;

				let castable = action.castable() && myTurn;/* && */;
				castableActions += Boolean(castable && action.label !== 'stdClairvoyance');

				// Update class name
				this.constructor.setActionButtonContent(button, action, player, (i < 10 ? i+1 : false));

				// Custom stuff
				
				const castableClass = (castable ? 'enabled' : 'disabled');
				button.toggleClass(castableClass, true);

				if( action.label === labelActive ){
					group.prepend(button[0]);
				}
				
			}


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

		// Clicking the active button
		$("> div.actionGroup > div.action.button:first-child, > div.action.button", this.actionbar_actions)
			.off('mousedown click touchstart touchmove')
			.on('mousedown click touchstart touchmove', function(event){

				let id = $(this).attr("data-id");
				let spell = player.getActionById(id);
				const enabled = $(this).is('.enabled');
				const targetable = spell && spell.targetable();

				if( event.type === 'touchstart' || event.type === 'touchmove' ){
					const type = event.type;
					event = event.touches[0];
					event.type = type;
				}


				// Drag
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

				// End turn override
				if( id === "end-turn" ){

					if( event.type === 'click'){

						th.action_selected = player.getActionByLabel('stdEndTurn');
						th.targets_selected = [player];
						game.uiAudio("endturn_down", 0.5, this);
						th.performSelectedAction();

					}
					else if( event.type === 'mousedown' || event.type === 'touchstart' )
						game.uiAudio("endturn_up", 0.5, this);
					return;

				}
				
				if( (event.type === 'mousedown' || event.type === 'touchstart') && enabled ){

					//th.closeTargetSelector();
					th.action_selected = spell;

					th.targets_selected = [];
					game.uiClick(event.target);

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

			});

		// Handle clicking on grouped off-actions
		$("> div.actionGroup > div.action.button:not(:first-child)", this.actionbar_actions)
			.off('mousedown click touchstart touchmove')
			.on('mousedown touchstart', function(event){

				if( !th.__no_move ){
					
					let id = $(this).attr("data-id");
					let spell = player.getActionById(id);
					
					// Get the index of the spell
					player.setActiveActionGroupLabel(
						spell.group, 
						spell.label
					);

					// Run this again to redraw with the correct order
					th.drawActionSelector(player);
					th.bindTooltips();

					th.__no_move = true;	// Without this, this will cause a click to fire immediately since we're swapping position
					game.save();

					// Let the draw happen first, then clone this event onto the new main
					setTimeout(() => {
						th.__no_move = false;
						this.parentNode.children[0].dispatchEvent(new MouseEvent(event.type));
						this.parentNode.children[0].dispatchEvent(new MouseEvent("mouseout"));
					}, 1);

				}

			});

		// hover actions last or they won't work
		$("div.action.button", this.actionbar_actions)
			.off('mouseover mouseout')
			.on('mouseover mouseout', function(event){

				let id = $(this).attr("data-id");
				let spell = player.getActionById(id);

				if( th.action_selected && th.action_selected.id !== spell.id )
					return;

				if( event.type === 'mouseover' )
					th.drawSpellCosts(spell);

				else if( event.type === 'mouseout' ){

					if( th.action_selected && spell && spell.targetable() )
						th.dragStart( this, th.mouseDown );
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
		
		const dots = $("> div.point", this.resourceBar);
		
		if( !spell ){
			dots.toggleClass('highlighted', false);
			return;
		}

		// Generates an array. We'll subtract from this one as we go
		let costs = spell.getMomentumCostArray();
		if( !game.battle_active )
			costs = [0,0,0];
		
			
		const maxPoints = player.getMaxMomentum();
		for( let i = 0; i < maxPoints; ++i ){
			
			const currentType = Math.trunc(dots[i].dataset.i);
			const cost = costs[currentType];
			const highlighted = cost > 0;
			if( highlighted )
				--costs[currentType];
			dots[i].classList.toggle('highlighted', highlighted);

		}

	}


	// Players on the board
	drawPlayers(){

		const th = this, players = game.getEnabledPlayers();

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
			for( let player of Game.net.players ){
				if( player.name !== 'DM' )
					options.push(player);
			}

			for( let opt of options )
				modal.addSelectionBoxItem( opt.name, false, opt.id );

			modal.onSelectionBox(event => {
				modal.closeSelectionBox();
				const id = $(event.target).attr('data-id');
				player.netgame_owner = id;
				player.netgame_owner_name = Game.net.getPlayerNameById(id);
				th.draw();
				game.save();
			});

		});

		$("div.player span.name div.own", this.players).on('click', event => {

			event.preventDefault();
			event.stopImmediatePropagation();
			const id = $(event.target).closest('div.player').attr('data-id');
			game.setMyPlayer(id);

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

			if( !th.action_selected && !th.block_inspect && event.currentTarget._longpressTimer !== true ){

				await StaticModal.set('player', $(this).attr('data-id'));

			}

		});

		// Handle long press on player
		$('div.player', this.players)
			.off('mousedown').on('mousedown', event => {

				const el = event.currentTarget;
				clearTimeout(el._longpressTimer);
				el._longpressTimer = setTimeout(() => {
					
					const id = el.dataset.id;
					if( game.isMyPlayer(id) )
						game.setMyPlayer(id);
					el._longpressTimer = true;

				}, 500);
			}).off('mouseup').on('mouseup', event => {

				const el = event.currentTarget;

				// Successful switch
				if( this._longpressTimer === true ){
					setTimeout(() => el._longpressTimer = false, 10);
					return;
				}

				// Failed switch
				clearTimeout(el._longpressTimer);

			});

		

	}

	// Returns interaction types
	// Encounter can be used to check a specific encounter instead of the current one
	getViableInteractionsOnPlayer( p, encounter = false ){

		const myActive = game.getMyActivePlayer();
		let rr = false;
		try{
			rr = game.roomRentalAvailableTo(p, myActive, encounter);
		}catch(err){}

		let rps = game.getRoleplaysForPlayer( p );
		if( game.isInPersistentRoleplay() )
			rps = [];

		return {
			talk : rps.length || p.isFollower(),
			inspect : true,
			loot : myActive && p.isLootableBy(myActive),
			shop : myActive && game.getShopsByPlayer(p, true, encounter).length,
			transmog : myActive && game.transmogAvailableTo(p, myActive, encounter),
			repair : myActive && game.smithAvailableTo(p, myActive, encounter),
			altar : myActive && game.altarAvailableTo(p, myActive, encounter),
			bank : myActive && game.bankAvailableTo(p, myActive, encounter),
			gym : myActive && game.gymAvailableTo(p, myActive, encounter),
			rent : myActive && rr,
		};

	}

	openShopWindow( shop ){

		StaticModal.set('shop', shop);
		game.uiAudio( "shop_entered" );

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
			this.openShopWindow(shops[0]);

		}
		else if( type === 'bank' ){

			StaticModal.set('bank', p);
			game.uiAudio( "bank" );
			
		}
		else if( type === 'repair' ){

			StaticModal.set('smith', p);
			game.uiAudio( "smith_entered" );
			
		}
		else if( type === 'altar' ){

			StaticModal.set('altar', p);
			game.uiAudio( "altar" );
			
		}
		else if( type === 'transmog' ){

			StaticModal.set('transmog', p);
			game.uiAudio( "enter_transmogrify" );
			
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

			let rp = game.getRoleplaysForPlayer(p).shift();
			if( !rp && p.isFollower() )
				rp = p.follower;

			if( rp )
				game.setRoleplay(rp, false, myActive);

		}

	}

	drawGrapples(){

		let preR = this.grappleLines.filter('.r');
		this.grappleLines.toggleClass('r', false);	// Turns off reserved
		const players = game.getEnabledPlayers();

		let n = 0;
		for( let p of players ){

			const el = $("div.player[data-id='"+esc(p.id)+"']", this.players),
				grapples = p.getActiveEffectsByType(Effect.Types.grapple),		// We are the victim
				taunts = p.getActiveEffectsByType(Effect.Types.taunt).filter(fx => !fx.data.grapple)
			;
			grapples.push(...taunts);
			// prevents duplicates
			let senders = {
				taunts : {},
				grapples : {}
			};

			for( let i = 0; i < grapples.length; ++i ){

				const effect = grapples[i];
				const isTaunt = effect.type === Effect.Types.taunt;

				let sender = effect.parent.getCaster();
				if( !sender || sender.id === p.id )
					continue;

				let field = isTaunt ? 'taunts' : 'grapples';
				if( senders[field][sender.id] )
					continue;

				let startDiv = el;
				let endDiv = $("div.player[data-id='"+esc(sender.id)+"']", this.players);
				if( !endDiv.length )
					continue;
	
				senders[field][sender.id] = true;

				let div = this.grappleLines[n];
				++n;

				if( !div ){

					div = document.createElement('div');		// Create a new grapple line
					div.classList.toggle('grapple', true);
					this.grappleLines = this.grappleLines.add(div);
					this.grappleWrapper.append(div);
					
				}

	
				div.classList.toggle('taunt', isTaunt);
				div.classList.toggle('r', true);	// Reserve the div
				div.classList.toggle('hidden', false);	// Reserve the div
				const rectA = startDiv[0].getBoundingClientRect();
				const rectB = endDiv[0].getBoundingClientRect();
				
				const start = new THREE.Vector2(
					p.team === Player.TEAM_PLAYER ? rectA.right : rectA.left, 
					rectA.top+rectA.height/2
				);
				const end = new THREE.Vector2(
					sender.team === Player.TEAM_PLAYER ? rectB.right : rectB.left, 
					rectB.top+rectB.height/2
				);
				
				const dist = start.distanceTo(end);
				const angle = Math.atan2((start.y-end.y),(start.x-end.x))*(180/Math.PI);
	
				div.style.width = dist+'px';
				div.style.left = ((end.x+start.x)/2 - dist/2)+'px';
				div.style.top = ((end.y-start.y)/2+start.y)+'px';
				div.style.transform = 'rotate('+(angle)+'deg)';
				
			}

		}

		this.grappleLines.not('.r').each((idx, el) => {

			if( preR.has(el) ){
				el.classList.toggle('r', true);
				el.classList.toggle('fade', true);
				setTimeout(() => {
					el.classList.toggle('hidden', true);
					el.classList.toggle('r', false);
					el.classList.toggle('fade', false);
				}, 250);
			}

		});

	}

	drawPlayer( p, index ){

		const myTurn = game.isTurnPlayer(p),
			el = $("div.player[data-id='"+esc(p.id)+"']", this.players),
			myActive = game.getMyActivePlayer(),
			friendly = p.team === 0
		;

		
		el.attr('data-index', index || -1);

		if( isNaN(el.attr('data-team')) )
			el.attr('data-team', 0);
		
		if( myTurn )
			el.toggleClass("active", true);

		const isMine = game.isMyPlayer(p),
			isMyActive = p === myActive,
			isNPC = !p.netgame_owner
		;
		
		el.toggleClass('mine', isMine);
		el.toggleClass('myActive', isMyActive);
		
		el.toggleClass('dead', p.isDead());
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
					focusEl = $('div.focus', nameEl),
				resourcesEl = $('> span.resources', statsEl),
					arousalEl = $('> span.arousal', resourcesEl),
					arousalElSpan = $('> span', arousalEl),
					apEl = $('> span.AP', resourcesEl),
					apElSpan = $('> span', apEl),
					apElTooltip = $('> div.tooltip', apEl),
						apElTooltipOff = $('span.colorOffensive', apElTooltip),
						apElTooltipDef = $('span.colorDefensive', apElTooltip),
						apElTooltipUti = $('span.colorUtility', apElTooltip),
					hpEl = $('> span.HP', resourcesEl),
					hpElSpan = $('> span', hpEl),
					armorEl = $('> span.armor', resourcesEl),
					armorElSpan = $('> span', armorEl),
					chestEl = $('> span.chest', resourcesEl),
					chestElSpan = $('> span', chestEl),
					legsEl = $('> span.legs', resourcesEl),
					legsElSpan = $('> span', legsEl),
			bgEl = $('> div.bg', contentEl),
			shieldsEl = $('> div.shields', el),
				shieldEl = $('> div.shield', shieldsEl),
			
			topRightEl = $('> div.topRight', el),
				wrappersEl = $('> div.wrappers', topRightEl),
				chargingEl = $('> div.charging', topRightEl),
			topLeftEl = $('> div.topLeft', el),
			netgameStatus = $('> div.netgameStatus', el)
		;

		netgameStatus.toggleClass('hidden', (!Game.net.isInNetgame() || !p.netgame_owner));
		

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
					bgEl.css('background-image', 'url('+esc(image.src)+')');
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
			apDisabled = p.isMomentumDisabled(),
			hpDisabled = p.isHPDisabled(),
			arousalText = p.arousal+"<span class=\"small\">/"+p.getMaxArousal()+"</span>",
			apText = p.getMomentum()+"<span class=\"small\">/"+p.getMaxMomentum()+"</span>",
			hpText = p.hp+"<span class=\"small\">/"+p.getMaxHP()+"</span>"
		;
		arousalEl.toggleClass('hidden', arousalDisabled);
		hpEl.toggleClass('hidden', hpDisabled);
		apEl.toggleClass('hidden', apDisabled);
		
		if( !arousalDisabled && arousalElSpan.text() !== arousalText )
			arousalElSpan.html(arousalText);
		if( !apDisabled && apElSpan.text() !== apText )
			apElSpan.html(apText);
		if( !hpDisabled && hpElSpan.text() !== hpText )
			hpElSpan.html(hpText);
		apElTooltipOff[0].innerText = p.getMomentum(Player.MOMENTUM.Off)+" Offense";
		apElTooltipDef[0].innerText = p.getMomentum(Player.MOMENTUM.Def)+" Defense";
		apElTooltipUti[0].innerText = p.getMomentum(Player.MOMENTUM.Uti)+" Utility";
		

		hpEl.toggleClass('warn', p.hp <= p.getMaxHP()*0.3);

		// Awareness
		focusEl[0].classList.toggle('hidden', Boolean(p.isAware(myActive)));

		// Armor
		chestEl.add(legsEl).toggleClass('hidden', p.isTargetBeast());
		if( !p.isTargetBeast() ){

			const uText = Math.ceil(ubDur*100)+'%';
			const lText = Math.ceil(lbDur*100)+'%';

			chestEl.toggleClass('hidden', !ubDur)
				.attr('title', 'Upper body armor durability');
			legsEl.toggleClass('hidden', !lbDur)
				.attr('title', 'Lower body armor durability');

			if( chestElSpan.text() !== uText )
				chestElSpan.text(uText);
			if( legsElSpan.text() !== lText )
				legsElSpan.text(lText);
		}

		const armorValueRaw = Math.round(p.getArmorPoints(false));
		const armorValueModified = Math.round((1-p.getArmorDamageMultiplier(myActive))*100);
		armorEl.toggleClass('broken', armorValueModified <= 0).attr('title', armorValueRaw+"% unmodified damage reduction");
		armorElSpan.text(armorValueModified+"%");
		
		nameDisplayEl
			.toggleClass('mine', isMine)
			.toggleClass('npc', isNPC)
			.attr('style', 'color:'+esc(p.color))
		;
		nameEl.toggleClass('active', isMyActive);


		const name = p.getName();
		if( nameDisplayEl.text() !== name )
			nameDisplayEl.text(name);
		
		ownerEl.toggleClass('hidden', !game.is_host);
		ownEl.toggleClass('hidden', Boolean(game.getMyPlayers().length < 2 || isMyActive || !isMine));
		leaderEl.toggleClass('hidden', Boolean(
			p.team !== 0 || !Game.net.id ||
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


		// Blocking. Looks kinda weird, but is needed for the animations to work
		const blocking = p.getBlock();
		const blockDisabled = p.isBlockDisabled();

		shieldEl.toggleClass('disabled', blockDisabled);

		if( !blocking && shieldEl.hasClass("spawn") )
			shieldEl.toggleClass('die', true);
		
		if( blocking )
			shieldEl.toggleClass('die', false);
			
		$("> span", shieldEl).text(blocking);

		setTimeout(() => {
			shieldEl.toggleClass('spawn', Boolean(blocking));;
		}, 10);
		
		

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

		const showAltar = interactions.altar;
		$("div.interaction[data-type=altar]", el).toggleClass("hidden", !showAltar).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "altar", p );
		});

		const showBank = interactions.bank;
		$("div.interaction[data-type=bank]", el).toggleClass("hidden", !showBank).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "bank", p );
		});

		const showTransmog = interactions.transmog;
		$("div.interaction[data-type=transmog]", el).toggleClass("hidden", !showTransmog).off('click').on('click', event => {
			event.stopImmediatePropagation();
			this.onPlayerInteractionUsed( "transmog", p );
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
		const wrappers = p.getWrappers().filter(el => !el.hidden && el.name.length && el.icon && el.parent instanceof Player),
			wrapperButtons = $('> div', wrappersEl);
		
		wrapperButtons.toggleClass('hidden', true);

		wrappers.sort((a, b) => {

			if( myActive ){

				const ca = a.getCaster(), cb = b.getCaster();
				let da, db;
				
				// Enemy effects are first since they're the most important
				da = ca?.team !== myActive.team;
				db = cb?.team !== myActive.team;
				if( da !== db )
					return da ? -1 : 1;

				// My own effects are second
				da = ca === myActive; 
				db = cb === myActive;
				if( da !== db )
					return da ? -1 : 1;

			}
			// Finally sort by duration
			return a._duration > b._duration ? -1 : 1;

		});

		if( p.team !== Player.TEAM_PLAYER )
			wrappers.reverse();

		for( let i =0; i<wrappers.length; ++i ){

			let wrapper = wrappers[i],
				el = wrapperButtons[i],
				caster = wrapper.getCaster()
			;
			
			if( !el ){
				el = $(UI.Templates.wrapper);
				wrappersEl.append(el);
			}
			UI.setWrapperIconContent(el, wrapper, p, caster);
			
		}


		// Visuals
		const visuals = p.getActiveEffectsByType(Effect.Types.css).map(el => el.data.class).filter(el => typeof el === "string" && el);
		let classList = Array.from(el[0].classList).filter(el => el.startsWith('passive'));
		// Find removed visuals
		for( let c of classList ){

			let sub = c.substr(7);
			if( !visuals.includes(sub) )
				el[0].classList.toggle(c, false);

		}
		// Find newly added
		for( let c of visuals )
			el[0].classList.toggle('passive'+c, true);

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

		const 
			map = $('div.button[data-id=map]', this.gameIcons),
			inventory = $('div.button[data-id=inventory]', this.gameIcons),
			quest = $('div.button[data-id=quest]', this.gameIcons),
			settings = $('div.button[data-id=settings]', this.gameIcons),
			help = $('div.button[data-id=help]', this.gameIcons),
			mainMenu = $('div.button[data-id=mainMenu]', this.gameIcons)
		;

		inventory.toggleClass('hidden', !player);
		map.toggleClass('highlighted', !this.visible);
		help.toggleClass('highlight', !localStorage.helpClicked);

		this.toggle(this.visible);

		if( !this._gameIconsDrawn ){
			
			this._gameIconsDrawn = true;
			$("[data-id]", this.gameIcons).off('click').on('click', event => {

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

	}


	updateMute(){
		const mute = Boolean( !game.is_host && !game.getMyActivePlayer() && game.mute_spectators )
		this.board.toggleClass("mute", mute);
	}


	gameIconPop( icon ){

		icon = esc(icon);
		
		const tt = $("div[data-id='"+icon+"']", this.gameIcons);
		tt.toggleClass('pop', true);
		
		clearTimeout(this.pgi[icon]);
		this.pgi[icon] = setTimeout(() => tt.toggleClass('pop', false), 50);

	}


	onMenuStatusChanged(){

		for( let player of game.players ){

			// Hiding should take place on the parent in drawPlayer
			if( !player.netgame_owner )
				continue;

			$("div.player[data-id='"+esc(player.id)+"'] div.netgameStatus > div.inMenu", this.players).toggleClass('hidden', !Game.net.in_menu[player.netgame_owner]);

		}

	}

	onAfterRoomChange(){

		const z = game.dungeon.getActiveRoom().z;
		if( this.miniMapZ !== z ){
			this.setMinimapLevel(z);
		}

	}

	// Draws momentum gained icons that spawn in the middle of the screen and then go down.
	// Helper function
	_animateMomentumGain( idx, type ){

		const icon = this.momentum_gain[idx];
		icon.classList.toggle('on', true);
		const files = ["off","def","uti"];
		game.uiAudio('momentum_'+files[type], 0.2, icon);

	}

	drawMomentumGain( numOff = 0, numDef = 0, numUti = 0 ){

		let i; const incNum = numOff+numDef+numUti;
		if( !incNum )
			return;

		const needed = incNum-this.momentum_gain.length;
		// Create some new icons
		for( i = 0; i < needed; ++i ){

			const icon = document.createElement('div');
			icon.classList.add('momentumIcon');
			this.momentumGain[0].append(icon);
			this.momentum_gain.push(icon);

		}

		const momTypes = Player.MOMENTUM_NAMES_SHORT;
		
		let start = Math.floor(incNum/2);
		if( !(incNum%2) )
			start -= 0.5;
		const leftStart = -10*start;
		for( i = 0; i < incNum; ++i ){

			let n = Player.MOMENTUM.Off;
			if( i >= numDef+numOff )
				n = Player.MOMENTUM.Uti;
			else if( i >= numOff )
				n = Player.MOMENTUM.Def;

			const icon = this.momentum_gain[i];
			icon.classList.toggle('on', false);
			icon.classList.remove(...momTypes);
			icon.classList.add(momTypes[n]);
			icon.style.marginLeft = (leftStart+10*i)+'vmax';
			setTimeout(this._animateMomentumGain.bind(this), 100*(i+1), i, n);

		} 


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

		this.content.toggleClass('casting', true);
		this.setTooltip( this.getActiveActionButton()[0], true );
			
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

		this.content.toggleClass('casting', false);
		this.setTooltip( undefined, true );
		$('> div', this.actionbar_actions).toggleClass('popout', false);
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
				this.modal.addError("Todo: add non-asset armor repairs");

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

	handleItemLinks( parentElement ){
		
		parentElement.querySelectorAll("span.ilToUpdate").forEach(el => {

			let id = el.dataset.il;
			el.classList.toggle("ilToUpdate", false);
			const asset = game.getPlayerAsset(id);
			if( asset ){
				console.log("Found", asset);
				let sub = el.querySelector('span');
				sub.innerText = asset.name;
				sub.style.color = Asset.RarityColors[asset.rarity];
				el.querySelector('div.tooltip').innerHTML = asset.getTooltipText();

			}
			else
				el.innerText = 'Unknown item';

		});

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
			Game.net.sendHostTask(NetworkManager.dmTasks.sendText, {
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
			this.handleItemLinks(l[0]);
			this.mapChat.prepend(l[0]);
			setTimeout(() => {
				l.toggleClass("fade", true);
				setTimeout(() => {
					l.remove();
				}, 2000);
			}, 10000);

		}
		
		let div = $(line)[0];
		this.text.append(div);
		this.handleItemLinks(div);
		while($("> div", this.text).length > Game.LOG_SIZE)
			$("> div:first", this.text).remove();
		this.text.scrollTop(this.text.prop("scrollHeight"));
		this.bindTooltips();

		
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

				$("div.portrait > div.bg", div)
					.css("background-image", portrait ? 'url('+esc(portrait)+')' : 'none');
				$('> div.left', div)
					.toggleClass('hidden', !portrait);

				const name = stage.getName();

				if( name && name !== "none" )
					html += '<span class="name">'+stylizeText(name)+'</span><br />';

				$("div.text", div).html(html+stylizeText(stage.getText(true)));
				
			}


			html = '';
			let sel = false;
			const options = stage.getOptions(game.getMyActivePlayer());
			for( let response of options ){
				let s = response.id === this.selected_rp;
				if( s )
					sel = true;
				html += '<div class="option bg'+(s ? ' selected' : '')+'" data-id="'+esc(response.id)+'">'+stylizeText(response.getText())+'</div>';
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



	/* Book */
	// Page is a full fold, covering 2 pages in total
	openBook( book, page ){

		if( page === undefined ){

			game.uiAudio( 'book_open' );
			page = 0;

		}
		else{
			const sounds = 'abdc';
			game.uiAudio( 'book_page_flip_'+sounds[Math.floor(Math.random()*sounds.length)] );
		}
		if( !(book instanceof Book) )
			throw 'Book not found!';

		const 
			pageA = book.pages[page*2],
			pageB = book.pages[page*2+1]
		;

		this.bookPageA.html(pageA ? esc(pageA.text) : '');
		this.bookPageB.html(pageB ? esc(pageB.text) : '');
		
		this.bookPageNrA.html(page*2+1);
		this.bookPageNrB.html(pageB ? page*2+2 : '');

		this.book.toggleClass('hidden', false);

		this.bookNavA
			.toggleClass('hidden', page <= 0)
			.off('click').on('click', () => {
				this.openBook(book, page-1);
			});
		this.bookNavB
			.toggleClass('hidden', !book.pages[page*2+2])
			.off('click').on('click', () => {
				this.openBook(book, page+1);
			});

	}




	/* Tooltip */
	setTooltip( parentElement, force = false ){

		if( this.__tt_force && !force )
			return;

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

			let y = +pe.attr('data-tty');
			if( y )
				top -= y*pe.outerHeight();
			
		}
		this.setTooltipAtPoint(text, left, top);
		this.__tt_force = force && Boolean(parentElement);

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

	onTooltipMouseover( event ){
		this.setTooltip(event.currentTarget);
	}

	onTooltipMouseout(){
		this.setTooltip();
	}


	// Add tooltipParent class to anything that should have a tooltip, and .tooltip directly under it with content. Call this function to rebind
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

		Game.net.sendHostTask(NetworkManager.dmTasks.sendVisual, {
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
				game.autoPlay();
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
			// Have a random player you control (including friendly NPCs if you're the DM) pick a random RP option
			else if( task === "rp" ){
				Bot.randRP();
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


	/* Mini map */
	updateMiniMap(){

		let d = game.dungeon;
		const disc = d.getDiscoveredZ();
		let z = Math.abs(disc.max-disc.min)+1;
		// Update the level
		const curZ = this.minimap_current_z;

		this.miniMapTop.toggleClass('flat', (z < 2))
		this.miniMapZ.text((curZ-disc.min+1)+'/'+z).toggleClass('hidden', (z<2));

		let children = [];
		// Get explored rooms on this floor
		let exploredRooms = d.getDiscoveredRooms().filter(el => el.z === curZ);
		let minX, minY, maxX, maxY;
		for( let room of exploredRooms ){

			if( room.x > maxX || maxX === undefined )
				maxX = room.x;
			if( room.x < minX || minX === undefined )
				minX = room.x;
			if( room.y > maxY || maxY === undefined )
				maxY = room.y;
			if( room.y < minY || minY === undefined )
				minY = room.y;

		}

		const getRoomAtCoordinate = (x,y) => {
			for( let room of exploredRooms ){
				if( room.x === x && room.y === y )
					return room;
			}
		};

		// Sets minimum size
		let scale = Math.max(
			6,
			Math.abs(maxX-minX+1),
			Math.abs(maxY-minY+1)
		);

		for( let y = 0; y < scale; ++y ){
			
			for( let x = 0; x < scale; ++x ){

				const room = getRoomAtCoordinate(minX+x, maxY-y);

				let div = document.createElement('div');
				children.push(div);
				div.classList.add('cell');
				const size = 1.0/scale*98;
				div.style = 'width:'+size+'%; height:'+size+'%';

				let exitMarker = document.createElement('img');
				exitMarker.src = '/media/wrapper_icons/exit-door.svg';
				div.append(exitMarker);

				let shopMarker = document.createElement('img');
				shopMarker.src = '/media/wrapper_icons/hanging-sign.svg';
				div.append(shopMarker);

				let talkMarker = document.createElement('img');
				talkMarker.src = '/media/wrapper_icons/conversation.svg';
				div.append(talkMarker);

				if( !room ){
					div.classList.add('empty');
					continue;
				}
				if( room.id === game.dungeon.getActiveRoom().id )
					div.classList.add('current');

				let services = {};
				// Populate services with services that exist in this room
				if( room.encounters instanceof Encounter ){

					for( let pl of room.encounters.players ){
						
						let sub = this.getViableInteractionsOnPlayer(pl, room.encounters);
						for( let i in sub ){
							if( sub[i] )
								services[i] = true;
						}

					}

				}

				exitMarker.classList.toggle('hidden', !room.getExitDoor());
				shopMarker.classList.toggle('hidden', !( services.shop || services.repair || services.gym || services.altar || services.rent || services.talk ));
				talkMarker.classList.toggle('hidden', !(services.talk));
			}

		}

		this.miniMapContent[0].replaceChildren(...children);


	}
	// Change Z level of minimap
	changeMinimapLevel( dir = 1 ){

		const disc = game.dungeon.getDiscoveredZ();
		this.minimap_current_z = Math.min(disc.max, Math.max(disc.min, this.minimap_current_z+dir)) || 0;
		this.updateMiniMap();

	}
	setMinimapLevel( level ){

		this.minimap_current_z = level || 0;
		this.updateMiniMap();

	}
	toggleMiniMap( on ){

		let cur = Boolean(localStorage.mini_map);
		if( on === undefined )
			cur = !cur;
		else
			cur = Boolean(on);
		
		if( !cur )
			delete localStorage.mini_map;
		else
			localStorage.mini_map = "ON";

		this.miniMap.toggleClass('on', cur);
		
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
			element = $('div.player[data-id=\''+esc(player.id)+'\']', this.players);

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

			Game.net.load_status[Game.net.getMyLoadStatusID()] = 0;
			Game.net.load_status['DM'] = 0;
			this.loadingMaxSteps = +maxSteps;
			this.updateLoadingBar();

			this.hostLoadingWrapper.toggleClass( 'hidden', Boolean(game.is_host) );

			let tips = shuffle(glib.getAllValues('LoadingTip'));
			const evt = new GameEvent({
				sender:game.getMyActivePlayer(), 
				target:game.getTeamPlayers(), 
				dungeon:game.dungeon, 
				room: game.dungeon.getActiveRoom()
			});
			for( let tip of tips ){
				
				if( tip.validate(evt) ){

					this.loadingTip.text(tip.text);
					break;

				}

			}

		}
		else{

			this.myLoadingBar.css({width:0});
			this.hostLoadingBar.css({width:0});

		}

	}

	updateLoadingBar(){
		
		if( !this.loadingMaxSteps )
			return;

		let val = parseInt(Game.net.getMyLoadStatus()) || 0;
		let perc = val/this.loadingMaxSteps;
		this.myLoadingStatusText.html('('+val+'/'+this.loadingMaxSteps+')');
		this.myLoadingBar.css({'width': perc*100+'%'});

		let dmVal = parseInt(Game.net.getDMLoadStatus()) || 0;
		perc = dmVal/this.loadingMaxSteps;
		this.hostLoadingStatusText.html('('+dmVal+'/'+this.loadingMaxSteps+')');
		this.hostLoadingBar.css({'width': perc*100+'%'});

		if( val >= this.loadingMaxSteps && dmVal >= this.loadingMaxSteps )
			this.toggleLoadingBar();

		for( let player of game.players ){

			// This isn't a player
			if( !player.netgame_owner )
				continue;

			val = parseInt(Game.net.load_status[player.netgame_owner]);
			if( isNaN(val) )
				val = this.loadingMaxSteps;
			perc = Math.round(val/this.loadingMaxSteps*100);
			const status = $("div.player[data-id='"+player.id+"'] > div.netgameStatus > div.loadingPerc > span", this.players);
			status.parent().toggleClass('hidden', val >= this.loadingMaxSteps)
			status.text(perc+'%');

		}

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
			if( Game.net.isInNetgameHost() )
				Game.net.dmFloatingCombatText(amount, player.id, type, crit);

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
	// ignoreStats will hide cd/charges 
	static setActionButtonContent( buttonElement, action, player, hotkey, ignoreStats ){

		let aType = '';
		if( action.type === Action.Types.physical )
			aType = 'phys ';
		else if( action.type === Action.Types.arcane )
			aType = 'arc ';
		else if( action.type === Action.Types.corruption )
			aType = 'corr ';
		

		const button = $(buttonElement);
		button[0].className = 
			'action button tooltipParent tooltipAbove '+aType+
			(action.detrimental ? 'detrimental' : 'beneficial')+' '+
			(action.isAssetAction() ? ' item '+Asset.RarityNames[action.parent.rarity] : '')
		;

		// Update id
		button.attr('data-id', action.id);
			
		// Update icon
		const img = $('> img', button),
			imgSrc = 'media/wrapper_icons/'+esc(action.getIcon())+'.svg';
		if( img.attr('src') !== imgSrc )
			img.attr('src', imgSrc);

		// Update charges
		let uses = false;	// false hides
		// This action is tied to an asset
		if( action.isAssetAction() && action.parent.charges !== -1 )
			uses = player.numAssetUses(action.parent.label, game.battle_active);	
		else if( action._charges !== 1 )
			uses = action._charges;

		const usesEl = $('> div.uses', button);
		usesEl.toggleClass('hidden', uses === false || Boolean(ignoreStats));
		usesEl.toggleClass('red', uses < 1);
		usesEl.text("x"+uses);

		// Cooldown
		const cdEl = $('> div.cd > span', button);
		$('> div.cd', button).toggleClass('hidden', !action._cooldown || Boolean(ignoreStats));
		if( +cdEl.text !== +action._cooldown )
			cdEl.text(action._cooldown);

		const hotkeyEl = $('> div.hotkey', button);
		if( hotkey === undefined || hotkey === null || hotkey === false )
			hotkey = '';
		if( hotkeyEl.text !== hotkey )
			hotkeyEl.text(hotkey);

		const mm = button[0].querySelector('div.missingMom');
		mm.classList.toggle("hidden", Boolean(ignoreStats));
		if( !ignoreStats ){
			// missing momentum
			const types = [
				Player.MOMENTUM.Off,
				Player.MOMENTUM.Def,
				Player.MOMENTUM.Uti,
			];

			let missingDivs = [];
			for( let type of types ){

				const cost = action.getMomentumCost(type);
				const held = player.getMomentum(type);

				for( let i = 0; i < cost; ++i ){

					const div = document.createElement('div');
					if( i < held )
						div.classList.add('fill');
					missingDivs.push(div);
					const bg = document.createElement('div');
					bg.classList.add('bg');
					div.append(bg);
					div.classList.add(Player.MOMENTUM_NAMES_SHORT[type]);
					
				}

			}
			mm.replaceChildren(...missingDivs);
		}

		// Tooltip
		const ttEl = $('> div.tooltip', button);
		ttEl.toggleClass('enabled disabled', false); // .toggleClass(castableClass, true);
		if( ttEl.html() !== action.getTooltipText() )
			ttEl.html(action.getTooltipText());

	}

	static setWrapperIconContent( wrapperElement, wrapper, target, caster ){

		let el = $(wrapperElement);
		const myActive = game.getMyActivePlayer();
		el.toggleClass('detrimental beneficial hidden', false)
			.toggleClass(wrapper.detrimental ? 'detrimental' : 'beneficial', true)
			.toggleClass('small', myActive && caster && caster !== myActive && caster?.team === myActive.team )
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

			let time = duration;
			if( wrapper.ext )
				time = fuzzyTimeShort(duration);
			elDuration.text(time);
		}

		let durText = 'Permanent';
		if( duration > 0 ){
			
			
			durText = '';
			if( caster )
				durText += '<span style="color:'+esc(caster.color)+'">'+esc(caster.name)+'</span> | ';
			durText += duration+' Turn'+(duration > 1 ? 's' : '');
			if( wrapper.ext )
				durText = fuzzyTimeShort(duration);

		}
		
		let tooltip = 
			'<strong>'+esc(wrapper.name)+'</strong><br />'+
			'<em>'+
				durText+
				(wrapper.stacks > 1 ? ' | '+wrapper.stacks+' stack'+(wrapper.stacks !== 1 ? 's':'') : '' );
		if( wrapper.asset ){

			const asset = target.getAssetById(wrapper.asset);
			if( asset )
				tooltip += ' | Attached to '+asset.name;

		}

		tooltip += '</em><br />'+
			stylizeText(wrapper.getDescription());	// Stylize escapes
		if( elTooltip.html() !== tooltip )
			elTooltip.html(tooltip);


	}

};


UI.Templates = {
	actionButton : '<div class="action" data-tty=0.5>'+
			'<img>'+
			'<div class="hotkey"></div>'+
			'<div class="uses"></div>'+
			'<div class="cd"><span></span><img src="media/wrapper_icons/hourglass.svg" /></div>'+
			'<div class="tooltip actionTooltip"></div>'+
			'<div class="missingMom"></div>'+	// Missing momentum
		'</div>',
	getActionButtonGroup : function(){

		let out = '<div class="actionGroup">';
		for( let i = 0; i < NUM_SUBS; ++i )
			out += UI.Templates.actionButton;
		out += '</div>';
		return out;

	},
	wrapper : 
		'<div class="wrapper tooltipParent">'+
			'<div class="background"></div>'+
			'<div class="stacks"></div>'+
			'<div class="duration"></div>'+
			'<div class="tooltip"></div>'+
		'</div>'
	
};
