import UI from './UI.js';
import Player from './Player.js';
import Asset from './Asset.js';
import Action from './Action.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import { QuestReward } from './Quest.js';
import Shop from './Shop.js';
import Mod from './Mod.js';
import Game from './Game.js';
import { Wrapper } from './EffectSys.js';

export default class StaticModal{

	// StaticModal works off of tabs. Even if your modal doesn't use tab, one "tab" is created, but is just not shown.
	constructor(id, title ){

		this.id = id;
		this.dom = 
			$('<div id=\"'+esc(this.id)+'\" class="hidden">'+
				'<div class="header">'+
					'<h1>'+esc(title)+'</h1>'+
					'<div class="close"><h1>X</h1></div>'+
				'</div>'+
				'<div class="modalMain bgMarble cmContent"></div>'+
				'<div class="cmTabs"></div>'+
			'</div>');
		this.onDraw = () => {};

		this.headerContainer = $('> div.header', this.dom);
		this.contentContainer = $('> div.modalMain', this.dom);
		this.tabContainer = $('> div.cmTabs', this.dom);
		this.closeButton = $('> div.header > div.close', this.dom);

		this.drawn = false;			// Set to true after the first draw
		this.drawing = false;		// Actively updating the dom

		this.activeTab = 'default';
		this.tabs = {};
		this.refreshOn = [];	// Array of sub objects [{path:(arr)path, fn:(opt)fn}...]. Checked when game data changes to have a callback.
		this.args = [];			// Args of the last time this was opened

		this.closeButton.on('click', event => {
			game.uiClick(event.target);
			this.close();
		});

	}

	// returns a tab content dom object by label
	getTabDom( label ){

		if( !label )
			label = 'default';

		return this.tabs[label] && this.tabs[label].content;

	}

	getTabLabelDom( label ){

		if( !label )
			label = 'default';

		return this.tabs[label] && this.tabs[label].label;

	}

	setActiveTab(label){
		
		const obj = this.tabs[label];
		if( !obj )
			throw 'Tab not found: '+label;

		$("> div.cmTab", this.tabContainer).toggleClass("active", false);
		$("> div.cmTabContent", this.contentContainer).toggleClass("hidden", true);

		obj.content.toggleClass("hidden", false);
		obj.label.toggleClass("hidden", false).toggleClass("active", true);
		this.activeTab = label;
		this.constructor.onTabChanged();

	}

	toggleTab( label, visible = false ){

		const button = this.tabs[label].label;
		if( button )
			this.tabs[label].label.toggleClass("hidden", !visible);

	}

	setProperties(fn){
		fn.call(this);
		return this;
	}

	addTab(label, fn){

		if( !label )
			label = 'default';

		this.tabs[label] = {
			content : $('<div class="cmTabContent" data-id="'+esc(label)+'">'+fn()+'</div>'),
			label : $('<div class="cmTab bgMarble" data-id="'+esc(label)+'">'+esc(label)+'</div>'),
		};
		this.contentContainer.append(this.tabs[label].content);
		this.tabContainer.append(this.tabs[label].label);

		if( Object.keys(this.tabs).length === 1 || label === this.constructor.tabs[this.id] ){
			this.activeTab = label;
		}

		this.setActiveTab(this.activeTab);

		this.tabContainer.toggleClass('hidden', Object.keys(this.tabs).length < 2 );

		this.tabs[label].label.on('click', () => {
			game.uiAudio( "tab_select" );
			this.setActiveTab(label);
		});

		return this;
	}
	
	// Override this with a function that should be run when activated
	setDraw(method){
		this.onDraw = method;
		return this;
	}
	
	close( force ){
		this.constructor.close( force );
	}

	async refresh( clean = false ){

		if( this.drawing )
			return false;

		this.drawing = true;
		const out = await this.onDraw.apply(this, clean ? [] : this.args);
		this.drawn = true;
		this.drawing = false;

		return out;

	}

	addRefreshOn( path, fn ){

		this.refreshOn.push({path:path, fn:fn});
		return this;

	}

	setTitle( text ){
		this.headerContainer[0].querySelector('h1').innerText = text;
	}






	// STATIC

	// Sets the active modal
	static async set( id, ...args ){

		this.close();
		if( !id )
			return true;

		const obj = this.lib[id];
		if( !obj )
			throw 'Modal not found: '+id;
		
		obj.dom.toggleClass("hidden", false);
		
		this.main.toggleClass("hidden", false);
		this.active = obj;
		
		obj.args = [...args];
		const out = await this.refreshActive();

		return out;

	}

	static setWithTab( id, tab, ...args){

		
		this.set(id, ...args);
		if( this.active )
			this.active.setActiveTab(tab);

	}

	// newID is to prevent recursion
	static close( force ){

		if( !game.initialized && !force ){

			// Special case to let you go back to the main menu
			if( this.active && this.active.id === 'newGame' ){
				this.close(true);
				this.set('mainMenu');
			}

			return;
		}

		this.active = null;
		// Close everything
		if( this.main )
			this.main.toggleClass("hidden", true);
		Object.values(this.lib).map(modal => modal.dom.toggleClass("hidden", true));

	}

	static async refreshActive(){

		if( !this.active )
			return;

		const out = await this.active.refresh();
		game.ui.bindTooltips();

		// Special case for main menu when you have no active game
		if( this.active.id === 'mainMenu' )
			this.active.closeButton.toggleClass('hidden', !game.initialized);

		return out;

	}

	static onGameUpdate( data ){

		if( !this.active )
			return;

		const hasBranch = tree => {

			let cur = data;
			for( let branch of tree ){
				
				cur = cur[branch];
				if( cur === undefined ){
					return false;
				}

			}
			return true;
		};

		for( let tree of this.active.refreshOn ){

			if( hasBranch(tree.path) ){
				if( !tree.fn )
					this.refreshActive();
				else
					tree.fn.call(this.active, tree.path);
				return;
			}

		}
		
	}

	// Chainable
	static add( staticModal ){

		this.lib[staticModal.id] = staticModal;
		staticModal.parent = this;
		this.main.append(staticModal.dom);
		return staticModal;

	}

	static onTabChanged(){
		
		if( !this.active )
			return;
		this.tabs[this.active.id] = this.active.activeTab;
		localStorage.staticModalTabs = JSON.stringify(this.tabs);
		
	}

	// Only gets called once when the DOM loads. Bulids all the modal bases
	static ini(){

		if( this.built )
			return;
		this.built = true;

		this.tabs = {};
		this.main = $("#customModals");

		try{this.tabs = JSON.parse(localStorage.staticModalTabs);}catch(err){}
		this.main.on('mousedown touchstart', event => {
			// Special case so you don't accidentally click outside the box when making a new game and the game isn't initialized
			if( event.target === this.main[0] && (game.initialized || this.active.id !== 'newGame') ){
				this.close();
			}
		});


		// Sleep select
		this.add(new this("sleepSelect", "Rest"))
			.addTab("default", () => {
				return '<img class="bedIcon" src="media/wrapper_icons/bed.svg" />'+
					'<span class="title">How long would you like to sleep?</span><br />'+
					'<input type="range" min=1 max=24 value=1 /><br />'+
					'<input type="button" class="sleep" value="Sleep 1 Hour &#129130; 10 PM" />'+
					'<input type="button" class="cancel" value="Cancel" />';
			})
			.setProperties(function(){

				this.sleepButton = $("input.sleep", this.dom);
				this.range = $("input[type=range]", this.dom);
				this.input = $("input", this.dom);
				this.cancel = $("input.cancel", this.dom);

			})
			.setDraw(function( player, mesh ){

				const sleepButton = this.sleepButton,
					range = this.range
				;
				this.input.off('click');
				
				const updateButton = () => {
					const n = +range.val();
					let currentHour = Math.floor(game.time%86400/3600)+n,
						pm = 'AM';
					if( currentHour > 23 )
						currentHour -= 24;
					if( currentHour >= 12 ){
						pm = 'PM';
						currentHour -= 12;
					}
					if( currentHour === 0 ){
						currentHour = 12;
						pm = pm === 'PM' ? 'Noon' : 'Midnight';
					}
					sleepButton.val('Sleep '+n+" hour"+(n === 1 ? '' : 's')+" \u2794 "+currentHour+" "+pm);

				};
				range.on('input', updateButton);
				updateButton();
				sleepButton.on('click', () => {
					game.sleep( game.getMyActivePlayer(), mesh.userData.dungeonAsset, +range.val() );
					this.close();
				});
				this.cancel.on('click', () => this.close());

			});


		// Gym
		this.add(new this("gym", "Gym"))
			.addRefreshOn(["players"])
			.addTab("Actions", () => {
				return `
					<div class="slots titleSpan">
						<span>Active</span>
						<div class="slotsWrapper"></div>
					</div>
					<div style="display:flex; width:100%; justify-content:space-between">
						<div class="left titleSpan">
							<span>Available</span>
							<div class="available"></div>
						</div>
						<div class="right titleSpan">
							<span>Learnable</span>
							<div class="purchasable"></div>
						</div>
					</div>`;
			})
			.addTab("Talents", () => {
				return 'Todo: Passives';
			})
			.setProperties(function(){

				const actives = this.actives = this.getTabDom('Actions');
				
				let html = '';
				for( let i=0; i < Player.MAX_ACTION_SLOTS; ++i )
					html += UI.Templates.actionButton;
				$("div.slots > div.slotsWrapper", actives).html(html);



				this.activeButtons = $("div.slots > div.slotsWrapper > div.action", actives);
				this.purchasable = $("div.right > div.purchasable", actives);
				this.available = $("div.left > div.available", actives);

			})
			.setDraw(function( gymPlayer ){

				const player = game.getMyActivePlayer();
				if( !player )
					return;

				this.activeButtons.toggleClass("detrimental disabled", false);
				
				// Active actions
				const numSlots = player.getNrActionSlots();
				for( let i = 0; i<Player.MAX_ACTION_SLOTS; ++i ){

					const el = $(this.activeButtons[i]);
					el.toggleClass('button', true);

					let action = player.getActionAtSlot(i);

					// We have an action in this slot
					if( action )
						UI.setActionButtonContent(el, action, player, i+3);
					else{

						const slotUnlocked = i < numSlots;
						el.toggleClass("tooltipParent", false).toggleClass('disabled', !slotUnlocked);
						let content = '';
						if( !slotUnlocked ){

							const lv = Player.getLevelForActionSlot(i);
							content = 'Lv. '+lv;

						}
						// Use the uses div to show when the slot is locked
						$('div.uses', el).html(content);

						
					}
					el.toggleClass('empty', !action);

				}

				// Inactive learned actions
				const inactive = player.getInactiveActions(),
					learnable = player.getUnlockableActions();

				let inactiveEls = $("> div.action", this.available),
					learnableEls = $("> div.learnable", this.purchasable);
				
				// Append icons if need be
				for( let i=inactiveEls.length; i<inactive.length; ++i )
					this.available.append(UI.Templates.actionButton);
				for( let i=learnableEls.length; i<learnable.length || i<1; ++i ){
					this.purchasable.append('<div class="learnable"><span class="name"></span>'+UI.Templates.actionButton+'</div>');
				}
				inactiveEls = $("> div.action", this.available);
				learnableEls = $("> div.learnable > div.action", this.purchasable);

				inactiveEls.toggleClass("hidden", true);
				$("> div.learnable", this.purchasable).toggleClass("hidden", true);

				for( let i =0; i<inactive.length; ++i ){

					const el = inactiveEls[i],
						abil = inactive[i];
					UI.setActionButtonContent(el, abil, player);
					

				}

				for( let i =0; i<learnable.length; ++i ){

					const el = learnableEls[i],
						abil = learnable[i].getAction(),
						parent = $(el).parent();
						
					UI.setActionButtonContent(el, abil, player);

					let html = esc(abil.getName());
					const coins = Player.calculateMoneyExhange(learnable[i].getCost());
					html += ': <span class="cost">';
					for( let i in coins ){
						const amt = coins[i];
						if( amt ){
							html += '<span style="color:'+Player.currencyColors[i]+';">'+amt+Player.currencyWeights[i].substr(0,1)+"</span> ";
						}
					}
					html += '</span>';
					
					parent
						.toggleClass("disabled", player.getMoney() < learnable[i].getCost())
						.attr('data-id', learnable[i].label)
						.toggleClass('hidden empty', false)
					;

					$("> span", parent).html(html);


				}

				if( !learnable.length ){
					const el = $('> div.learnable:first', this.purchasable);
					el.toggleClass('hidden', false).toggleClass("disabled empty", true);
					$("> span", el).html('No unlearned actions. Check back later!');
					$("> div.action", el).toggleClass("hidden", true);
				}
				

				// Bind stuff
				this.activeButtons.off('click').on('click', event => {
					
					const el = $(event.currentTarget),
						id = el.attr('data-id');
					if( el.is('.empty') )
						return;

					game.toggleAction(gymPlayer, player, id);
					game.uiAudio( "spell_disable" );

				});

				inactiveEls.off('click').on('click', event => {
					const el = $(event.currentTarget),
						id = el.attr('data-id');

					game.toggleAction(gymPlayer, player, id);
					game.uiAudio( "spell_enable" );

				});

				$("> div.learnable:not(.disabled)", this.purchasable).off('click').on('click', event => {
					
					const el = $(event.currentTarget),
						id = el.attr('data-id');

					if( el.is('disabled') )
						return;

					game.learnAction( gymPlayer, player, id );
					

				});


			});

		// Quest
		this.add(new this("quests", "Quests"))
			.addRefreshOn(["quests"])
			.addRefreshOn(["proceduralDiscovery"])
			.addTab("Quests", () => {
				return `
					<div class="left"></div>
					<div class="right"></div>
				`;
			})
			.addTab("Exploration", () => {
				return `
					<p class="center">Exploration dungeons are scattered around the world. Fully exploring these will award Cartographs that the Cartographers United Magistrate might be interested in. These dungeons are repopulated every now and then.</p>
					<div class="explorationStatus"></div>
				`;
			})
			.setProperties(function(){

				const main = this.main = this.getTabDom('Quests');
				this.right = $("div.right", main);
				this.left = $("div.left", main);

				const exploration = this.getTabDom('Exploration')[0];
				this.exploration = {
					status : exploration.querySelector('div.explorationStatus')
				};
				
			})
			.setDraw(async function(){

				let html = '', th = this;
				let quests = game.quests;
				let selectedQuest = quests[0];
				const me = game.getMyActivePlayer();

				for( let quest of quests ){
					if( quest.id === localStorage.selected_quest )
						selectedQuest = quest;
				}

				for( let quest of quests ){

					html += '<div data-id="'+esc(quest.id)+'" class="'+(quest === selectedQuest ? ' selected ' : '')+(quest.isCompleted() ? ' completed ' : '')+'">'+
						(quest === selectedQuest ? '&#10148; ' :'')+(quest.difficulty > 1 ? '['+quest.difficulty+'] ' : '')+quest.name+(quest.isCompleted() ? ' (Completed)' : '')+
					'</div>';

				}

				this.left.html(html);
				
				html = '';


				if( !quests.length )
					html += 'You have no active quests.';
				else{
					html += '<h1>'+esc(selectedQuest.name)+'</h1>';
					
					html += '<p>'+stylizeText(selectedQuest.description)+'</p>';

					for( let objective of selectedQuest.objectives ){
						if( objective.isCompleted() && objective.completion_desc )
							html += '<p>'+stylizeText(objective.completion_desc)+'</p>';
					}
					

					const objectives = selectedQuest.getVisibleObjectives();

					for( let objective of objectives ){

						const completed = objective.isCompleted();
						html += '<div class="objective'+(completed ? ' completed ' : '')+'">'+
							(completed ? '&#10003;' : '&#8226;')+' '+esc(objective.name);

						if( !objective.isCompleted() )
							html += ' - '+objective._amount+'/'+objective.amount;
						html += '</div>';

					}
					
					
					html += '<div class="assets inventory"></div>';


					if( selectedQuest.rewards_exp )
						html += '<div class="item">'+selectedQuest.rewards_exp+' Exp</div>';
					

				}

				this.right.html(html);

				if( selectedQuest && !selectedQuest.hide_rewards ){

					const inv = this.right[0].querySelector('div.assets.inventory');
					const rewards = selectedQuest.getRewards();
					const assets = rewards.filter(el => el.type === QuestReward.Types.Asset || el.type === QuestReward.Types.Action);
					for( let reward of assets ){

						const asset = reward.data;
						const viableToMe = me && reward.testPlayer(me);
						inv.appendChild(await StaticModal.getGenericAssetButton(asset, 0, !viableToMe ? 'disabled' : ''));
						
					}

				}

				$("> div[data-id]", this.left).on('click', function(){
					
					let id = $(this).attr('data-id');
					localStorage.selected_quest = id;
					StaticModal.refreshActive();

				});


				// Exploration tab

				// Gets or creates an exploration div
				const getEntry = label => {
					
					let el = this.exploration.status.querySelector('div[data-label=\''+label+'\']');
					if( !el ){
						
						el = document.createElement('div');
						this.exploration.status.append(el);
						el.classList.add('dungeon', 'progressBar');
						el.dataset.label = label;

						const bar = document.createElement('div');
						el.append(bar);
						bar.classList.add('bar');
						bar.style = 'width:0%';

						const content = document.createElement('div');
						content.classList.add('content');
						el.append(content);

					}
					return el;

				};

				for( let label in game.proceduralDiscovery ){

					const 
						data = game.proceduralDiscovery[label],
						perc = data.perc,
						div = getEntry(label),
						bar = div.querySelector('div.bar'),
						content = div.querySelector('div.content')
					;

					content.innerText = labelToName(label)+' '+Math.floor(perc*100)+'%';
					div.classList.toggle('red', perc < 1);
					bar.style = 'width:'+(perc*100)+'%';


				}


			});


		// Game settings
		this.add(new this("settings", "Settings"))
			.addRefreshOn(["players"])
			.addRefreshOn(["battle_active"])
			.addTab("Gameplay", () => {
				return `
					Difficulty: <input type="range" min=0 max=10 step=1 value=5 name="difficulty" />		
				`;
			})
			.addTab("DM", () => {
				return `
					<div class="option button" data-action="toggleDMTools"><input type="checkbox" /><span> Show DM Tools</span></div>
					<div class="option button" data-action="addPlayer">+ Add Player</div>
					<div class="option button" data-action="fullRegen">Restore HPs</div>
					<div class="option button" data-action="toggleBattle">Start Battle</div>
				`;
			})
			.addTab("Video", () => {
				return `
					<div class="option button" data-action="enableBubbles"><input type="checkbox" /><span> Bubble Chat</span></div>
					<div class="option button" data-action="enableShadows"><input type="checkbox" /><span> Shadows (Experimental, requires refresh)</span></div>
					<div class="option button" data-action="enableAA"><input type="checkbox" /><span> Antialiasing</span></div>
					<div class="option cacheLevel" style="margin-top:1vmax" title="Makes returning to previously visited areas faster, but increases memory use.">
						<input type="range" style="width:50%; vertical-align:top" min=10 max=100 step=10 /><span></span> Cache Levels
					</div>
				`;
			})
			.addTab("Audio", () => {
				return `
					<strong>Main Volume:</strong> <input type="range" min=0 max=100 step=1 name="masterSoundVolume" /><br />
					Ambient: <input type="range" min=0 max=100 step=1 name="ambientSoundVolume" />
					Music: <input type="range" min=0 max=100 step=1 name="musicSoundVolume" /><br />
					FX: <input type="range" min=0 max=100 step=1 name="fxSoundVolume" />
					UI: <input type="range" min=0 max=100 step=1 name="uiSoundVolume" /><br />
				`;
			})
			.addTab("Online", () => {
				
				return `
					<div class="connected center">
						<p class="description">Share the invite code or direct invite URL to invite a player to your game:</p>
						<div class="netgameLink a"></div>
						<div class="netgameLink b"></div>
						<input type="button" class="red disconnect" value="Disconnect" />
						<div class="connectedPlayers"></div>
						<label>Enable 75 sec turn time limit: <input type="checkbox" class="enableTurnTimer" /></label><br />
						<label>Mute spectators: <input type="checkbox" class="muteSpectators" /></label><br />
					</div>
					<div class="disconnected">
						<p class="description">If you want, you can put this session online and invite your friends.</p>
						<input type="button" class="blue hostgame" value="Put This Session Online" />
					</div>
				`;

			})
			.setProperties(function(){
				
				const ui = game.ui;

				

				this.gameplay = {
					difficulty : $("input[name=difficulty]", this.getTabDom("Gameplay"))
				};

				this.dm = {
					toggle : $("div[data-action=toggleDMTools]", this.getTabDom("DM")),
					addPlayer : $("div[data-action=addPlayer]", this.getTabDom("DM")),
					fullRegen : $("div[data-action=fullRegen]", this.getTabDom("DM")),
					toggleBattle : $("div[data-action=toggleBattle]", this.getTabDom("DM")),
				};

				this.video = {
					enableBubbles : $("div[data-action=enableBubbles]", this.getTabDom("Video")),
					enableShadows : $("div[data-action=enableShadows]", this.getTabDom("Video")),
					enableAA : $("div[data-action=enableAA]", this.getTabDom("Video")),
					cacheLevel : $("div.cacheLevel input", this.getTabDom("Video")),
					cacheLevelSpan : $("div.cacheLevel span", this.getTabDom("Video")),
				};

				const netgame = this.getTabDom("Online")[0];
				this.netgame = {
					connected : netgame.querySelector('div.connected'),
					disconnected : netgame.querySelector('div.disconnected'),
					connectedDesc : netgame.querySelector('div.connected p.description'),
					disconnectedDesc : netgame.querySelector('div.disconnected p.description'),
					netgameLinkA : netgame.querySelector('div.connected div.netgameLink.a'),
					netgameLinkB : netgame.querySelector('div.connected div.netgameLink.b'),
					hostButton : netgame.querySelector('input.hostgame'),
					disconnectButton : netgame.querySelector('input.disconnect'),
					connectedPlayers : netgame.querySelector('div.connectedPlayers'),
					enableTurnTimer : netgame.querySelector('input.enableTurnTimer'),
					muteSpectators : netgame.querySelector('input.muteSpectators'),
				};
				

				// Bind events
				
				// Gameplay
				this.gameplay.difficulty.on('input', event => {
					game.difficulty = +$(event.currentTarget).val();
				});

				// DM
				this.dm.toggle.on('click', event => {
					localStorage.hide_dm_tools = +ui.showDMTools();
					ui.board.toggleClass("dev", ui.showDMTools());
					$("input", event.currentTarget).prop("checked", ui.showDMTools());
				});
				this.dm.addPlayer.on('click', event => {
					
					const player = Player.loadThis({
						name:'Unknown Player', 
						class:'none',
						level : game.getHighestLevelPlayer(),
					});
					this.constructor.setWithTab('player', 'Edit', player);

				});
				this.dm.fullRegen.on('click', event => {
					game.fullRegen();
				});
				this.dm.toggleBattle.on('click', event => {
					game.toggleBattle();
				});
				
				// Video
				this.video.enableBubbles.on('click', event => {

					const hide = Boolean(!+localStorage.hide_bubbles)
					localStorage.hide_bubbles = +hide;
					$("input", event.currentTarget).prop("checked", !hide);
					ui.board.toggleClass("bubbles", !hide);

				});
				this.video.enableAA.on('click', event => {

					const show = Boolean(!+localStorage.aa)
					localStorage.aa = +show;
					$("input", event.currentTarget).prop("checked", show);
					game.renderer.aa.enabled = show;

				});
				this.video.enableShadows.on('click', event => {

					const show = Boolean(!+localStorage.shadows)
					localStorage.shadows = +show;
					$("input", event.currentTarget).prop("checked", show);

					game.ui.modal.set(
						'<p>This setting requires a browser refresh. Would you like to refresh now?</p>'+
						'<input type="button" value="Yes" class="yes" />'+	
						'<input type="button" value="No" />'
					);

					$("#modal input[type=button]").on('click', event => {
						const targ = $(event.currentTarget);
						if( targ.is('.yes') )
							window.location.reload();
						this.ui.modal.close();
					});

				});
				this.video.cacheLevel.on('input', event => {
					const val = parseInt($(event.currentTarget).val()) || 50;
					localStorage.cache_level = val;
					this.video.cacheLevelSpan.text(val);
				});

				// Audio
				$("input", this.getTabDom("Audio")).on('input', event => {
					
					const el = $(event.currentTarget),
						val = +el.val(),
						name = el.attr("name").split('SoundVolume').shift();

					if( name === 'master' )
						game.setMasterVolume(val/100 || 0);
					else
						game['audio_'+name].setVolume(val/100 || 0);

				});


			})
			.setDraw(function(){

				const ui = game.ui;

				$("input", this.dm.toggle).prop('checked', ui.showDMTools());
				this.dm.toggleBattle.text(game.battle_active ? 'End Battle' : 'Start Battle').toggleClass('hidden',  game.teamsStanding().length < 2);

				
				$("input", this.video.enableBubbles).prop('checked', !+localStorage.hide_bubbles);
				$("input", this.video.enableShadows).prop('checked', Boolean(+localStorage.shadows));
				$("input", this.video.enableAA).prop('checked', Boolean(+localStorage.aa));
				const cacheLevel = parseInt(localStorage.cache_level) || 50;
				this.video.cacheLevel.val(cacheLevel);
				this.video.cacheLevelSpan.text(cacheLevel);
				
				this.gameplay.difficulty.val(Math.round(game.difficulty) || 5);

				const knobs = ['ambient','fx','music','ui'];
				const audio = this.getTabDom("Audio");
				for( let knob of knobs ){
					$("input[name="+knob+"SoundVolume]", audio).val(Math.round(game['audio_'+knob].volume*100));
				}
				$("input[name=masterSoundVolume]", audio).val(Math.round(game.getMasterVolume()*100));


				// Netgame
				const isConnected = game.net.isConnected();


				// Not connected
				if( isConnected ){

					const isHosting = game.initialized && game.is_host;
					if( isHosting ){

						this.netgame.netgameLinkA.innerText = game.net.public_id;
						this.netgame.netgameLinkB.innerText = 'https://'+window.location.hostname+'/#net/'+game.net.public_id;

					}

					let divs = [];
					for( let player of game.net.players ){

						const div = document.createElement('div');
						div.classList.add('netgame', 'player');
						div.innerText = player.name;
						divs.push(div);

					}
					this.netgame.connectedPlayers.replaceChildren(...divs);

					// LocalStorage stores strings, so we can't store true/false
					this.netgame.enableTurnTimer.checked = Boolean(+localStorage.turnTimer);
					this.netgame.muteSpectators.checked = Boolean(+localStorage.muteSpectators);

				}

				this.netgame.disconnected.classList.toggle('hidden', isConnected);
				this.netgame.connected.classList.toggle('hidden', !isConnected);

				// First load
				if( !this.drawn ){

					this.netgame.hostButton.addEventListener('click', async event => {

						await game.net.hostGame();
						this.refresh();

					});

					this.netgame.disconnectButton.addEventListener('click', event => {
						
						game.net.disconnect();
						this.refresh();

					});

					this.netgame.enableTurnTimer.addEventListener('click', event => {
						
						localStorage.turnTimer = +event.currentTarget.checked;
						game.onTurnTimerChanged();

					});
					this.netgame.muteSpectators.addEventListener('click', event => {

						localStorage.muteSpectators = +event.currentTarget.checked;
						game.mute_spectators = +localStorage.muteSpectators || 0;
						game.save();

					});

					game.net.bind('*', () => this.refresh());

				}


				this.toggleTab('DM', game.is_host);


			});
		

		// Player display
		this.add(new this("player", "Player"))
			.addRefreshOn(['players'])

			.addTab("Character", () => {
				return `

					<h2 class="name"></h2>
					<em class="subName"></em>
					
					<p class="description"></p>

					<div class="right cmContentBlock bgMarble">
						<div class="image"></div>
						<div class="expBar">
							<div class="progressBar">
								<div class="bar" style="width:0%;"><!-- Set width here base on percentage --></div>
								<span class="content"><!-- Progress bar text here --></span>
							</div>
						</div>
						<div class="equipment inventory"></div>
						<div class="primaryStats flexThreeColumns"></div>
						<div class="secondaryStats flexAuto"></div>
					</div>
				`;

			})
			// Stats & Stats
			.addTab("Edit", () => {


				return `
					<div class="scroll">

						<div class="top centered randomizer">
							<select name="randomize_type"></select>
							<input type="button" class="blue" value="Generate" id="randomizePlayer" />
						</div>

						<form id="playerEditor">
							<input type="text" name="name" placeholder="Player Name" style="font-size:2vmax" /><br />
							<input type="text" name="species" placeholder="Species" /><br />
							<select name="class"></select><br />
							Level:<br /><input type="number" name="level" min=1 step=1 /><br />
							<div>Size:<br /><input type="range" name="size" min=0 max=10 step=1 /></div>
							Image Dressed:<br /><input type="text" name="icon" placeholder="Image URL" /><br />
							Image UpperBody:<br /><input type="text" name="icon_upperBody" placeholder="Image URL" /><br />
							Image LowerBody:<br /><input type="text" name="icon_lowerBody" placeholder="Image URL" /><br />
							Image Naked:<br /><input type="text" name="icon_nude" placeholder="Image URL" /><br />

							<div class="flexThreeColumns">
								<div>HP<br /><input type="number" name="hp" placeholder="HP" min=0 step=1 /></div>
								<div>AP<br /><input type="number" name="ap" placeholder="AP" min=0 step=1 /></div>
								<div>MP<br /><input type="number" name="mp" placeholder="MP" min=0 step=1 /></div>
								<div>Arousal<br /><input type="number" name="arousal" placeholder="Arousal" min=0 step=1 /></div>
								<div>Team<br /><input type="number" name="team" placeholder="Team" min=0 step=1 /></div>
							</div>
							Tags<br /><textarea name="tags"></textarea>
							Description<br /><textarea name="description"></textarea>
							<div class="flexThreeColumns">
								<div>Stamina<br /><input type="number" name="stamina" step=1 /></div>
								<div>Agility<br /><input type="number" name="agility" step=1 /></div>
								<div>Intellect<br /><input type="number" name="intellect" step=1 /></div>
							</div>
							<h3>Avoidance:</h3>
							<div class="flexFourColumns secondaryStat sv">
								<div class="physical">Physical <input type="number" step=1 /></div>
								<div class="corruption">Corruption <input type="number" step=1 /></div>
								<div class="elemental">Elemental <input type="number" step=1 /></div>
								<div class="holy">Holy <input type="number" step=1 /></div>
							</div>
							<h3>Proficiency:</h3>
							<div class="flexFourColumns secondaryStat bon">
								<div class="physical">Physical <input type="number" step=1 /></div>
								<div class="corruption">Corruption <input type="number" step=1 /></div>
								<div class="elemental">Elemental <input type="number" step=1 /></div>
								<div class="holy">Holy <input type="number" step=1 /></div>
							</div>
							<input type="submit" value="Save" />
							<input type="button" value="Delete Player" class="red deletePlayer" />
						</form>
						<hr />
						<h3>Actions</h3>
						<div class="actions"></div>
						<input type="button" value="+ Learn Action" class="addAction blue devtool" />
					</div>
					<div class="right cmContentBlock bgMarble">
						<div class="image"></div>
					</div>
				`;
			})
			.setProperties(function(){

				const cDom = this.getTabDom('Character');

				this.randomizerOption = null;	// Last picked option in the randomizer

				this.character = {
					name : $("> h2.name", cDom),
					subName : $("> em.subName", cDom),
					description : $("> p.description", cDom),
					devtool : $("> div.devtool", cDom),

					right : $("> div.right", cDom),
					image : $("> div.right > div.image", cDom),
					expBar : $("> div.right > div.expBar", cDom),
					expBarBar : $("> div.right > div.expBar > div.progressBar div.bar", cDom),
					expBarText : $("> div.right > div.expBar > div.progressBar span.content", cDom),
					equipment : $("> div.right > div.equipment", cDom),
					primaryStats : $("> div.right > div.primaryStats", cDom),
					secondaryStats : $("> div.right > div.secondaryStats", cDom),
				};

				const dDom = this.getTabDom('Edit');
				this.edit = {
					actions : $('div.actions', dDom),
					addAction : $('input.addAction', dDom),
					form : $('#playerEditor', dDom),
					formName : $('#playerEditor input[name=name]', dDom),
					formSpecies : $('#playerEditor input[name=species]', dDom),
					formClass : $('#playerEditor select[name=class]', dDom),
					formLevel : $('#playerEditor input[name=level]', dDom),
					formSize : $('#playerEditor input[name=size]', dDom),
					formDressed : $('#playerEditor input[name=icon]', dDom),
					formNude : $('#playerEditor input[name=icon_nude]', dDom),
					formUpperBody : $('#playerEditor input[name=icon_upperBody]', dDom),
					formLowerBody : $('#playerEditor input[name=icon_lowerBody]', dDom),
					formHP : $('#playerEditor input[name=hp]', dDom),
					formAP : $('#playerEditor input[name=ap]', dDom),
					formMP : $('#playerEditor input[name=mp]', dDom),
					formArousal : $('#playerEditor input[name=arousal]', dDom),
					formTeam : $('#playerEditor input[name=team]', dDom),
					formTags : $('#playerEditor textarea[name=tags]', dDom),
					formDescription : $('#playerEditor textarea[name=description]', dDom),
					formStamina : $('#playerEditor input[name=stamina]', dDom),
					formAgility : $('#playerEditor input[name=agility]', dDom),
					formIntellect : $('#playerEditor input[name=intellect]', dDom),
					formSecondaryStat : $('#playerEditor div.secondaryStat', dDom),
					formDeletePlayer : $('#playerEditor input.deletePlayer', dDom),
					image : $('> div.right > div.image', dDom),
					randomizer : $('div.randomizer',  dDom),
					randomizerSelect : $('div.randomizer > select', dDom),
					randomizerButton : $('div.randomizer > input', dDom),

				};

				// Draws an action selector. Returns the ID clicked on (if you do)
				this.edit.drawPlayerActionSelector = (player, callback) => {
								
					let html = '';
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
					html += '</div>';
					
					game.ui.modal.set(html);

					// Events
					$("#modal div.list.item[data-id]").on('click', async function(){

						let id = $(this).attr('data-id');
						game.ui.modal.close();
						callback(id);

					});


					game.ui.bindTooltips();

				};


				

			})
			.setDraw(async function( player ){

				
				// Character tab
					// Toggle the whole bottom bar
					// If you add a second tab that non-DM can see, you'll want to only toggle the label itself
					this.getTabLabelDom('Edit').parent().toggleClass('hidden', !game.ui.showDMTools());

					if( !(player instanceof Player) )
						player = game.getPlayerById(player);

					if( !player )
						return false;

					// Character panel
					const cDivs = this.character;
					cDivs.name.text(player.name);
					cDivs.subName.html('Lv '+player.level+' '+esc(player.species)+' '+esc(player.class.name));
					this.character.expBar[0].classList.toggle('hidden', player.team !== Player.TEAM_PLAYER);
					this.character.expBarBar[0].style = 'width:'+Math.max(0, Math.min(100, player.experience/player.getExperienceUntilNextLevel()*100))+'%';
					this.character.expBarText[0].innerText = player.experience+'/'+player.getExperienceUntilNextLevel()+' EXP';

					cDivs.description.html(
						'<strong>About:</strong><br />'+
						esc(player.description || 'No description')+'<br />'+
						(player.class ?
							'<br /><strong>'+esc(player.class.name)+'</strong><br />'+
							esc(player.class.description)
							: '')
					);
					
					cDivs.image.css('background-image', 'url(\''+esc(player.getActiveIcon())+'\')');

					// Equipment
					const slots = [
						Asset.Slots.lowerBody,
						Asset.Slots.upperBody,
						Asset.Slots.action,
						Asset.Slots.hands
					];
					
					const existing_assets = {};	// id:true

					const eq = cDivs.equipment[0];
					eq.innerHTML = '';
					for( let slot of slots ){

						const assets = player.getEquippedAssetsBySlots(slot, true);
						for( let asset of assets ){

							if( existing_assets[asset.id] )
								continue;
							existing_assets[asset.id] = true;

							const div = await StaticModal.getGenericAssetButton(asset, undefined, undefined, true);
							div.classList.toggle('equipmentSlot', true);
							eq.appendChild(div);

							if( game.is_host ){

								div.addEventListener('click', event => {
									if( event.shiftKey ){
										StaticModal.setWithTab( 'assetLibrary', 'Editor', player, asset );

									}
								});

							}
							
						}
						
					}


					let html = '';
					let stats = player.getPrimaryStats();
					for( let stat in stats ){

						let title = 'HP';
						let amount = player.statPointsToNumber(stat);
						if( stat === Player.primaryStats.agility )
							title = 'AP';
						else if( stat === Player.primaryStats.intellect )
							title = 'MP';
						else
							amount *= Player.STAMINA_MULTI;
						html += '<div class="tag tooltipParent" title="Increases '+title+' by '+amount+'.">'+
								'<span>'+(stats[stat] > 0 ? '+' : '')+stats[stat]+' '+ucFirst(stat.substr(0,3))+'</span>'+
								'<div class="tooltip">'+title+' '+(amount >= 0 ? 'increased' : 'decreased')+' by '+amount+'</div>'+
							'</div>';

					}
					cDivs.primaryStats.html(html);


					html = '';
					const s = Object.values(Action.Types).map(el => ucFirst(el)).sort();
					const myPlayer = game.getMyActivePlayer() || new Player();
					for( let stat of s ){
						const val = player.getSV(stat)-myPlayer.getBon(stat);
						let color = val > 0 ? 'green' : 'red';
						if( val === 0 )
							color = '';
						html += '<div class="tag tooltipParent '+color+'">'+
							'<span>'+(val > 0 ? '+' : '')+val+' '+esc(stat.substr(0,4))+'</span>'+
							'<div class="tooltip"><em>'+
								'This is the character\'s avoidance compared to your active character\'s proficiency. Red means you have a higher hit chance and efficiency. Green means a lower hit chance.</em><br />Raw: '+player.getBon(stat)+' bon / '+player.getSV(stat)+' sv</div>'+
						'</div>';
					}
					cDivs.secondaryStats.html(html);


				// DM Tab
					const dDivs = this.edit;
					html = '';

					dDivs.image.css('background-image', 'url(\''+esc(player.getActiveIcon())+'\')');
					dDivs.formDeletePlayer.toggleClass('hidden', !game.getPlayerById(player.id));
					

					// Form
					dDivs.formName.val(player.name);
					dDivs.formSpecies.val(player.species);
					dDivs.formLevel.val(parseInt(player.level) || 1);
					dDivs.formSize.val(parseInt(player.size) || 5);
					dDivs.formDressed.val(player.icon);
					dDivs.formNude.val(player.icon_nude);
					dDivs.formUpperBody.val(player.icon_upperBody);
					dDivs.formLowerBody.val(player.icon_lowerBody);
					dDivs.formHP.val(parseInt(player.hp) || 10);
					dDivs.formAP.val(parseInt(player.ap) || 0);
					dDivs.formMP.val(parseInt(player.mp) || 0);
					dDivs.formArousal.val(parseInt(player.arousal) || 0);
					dDivs.formTeam.val(parseInt(player.team) || 0);
					dDivs.formTags.val(player.tags.map(tag => tag.startsWith('pl_') ? tag.substr(3) : tag ).join(' '));
					dDivs.formDescription.val(player.description);
					dDivs.formStamina.val(parseInt(player.stamina) || 0);
					dDivs.formAgility.val(parseInt(player.agility) || 0);
					dDivs.formIntellect.val(parseInt(player.intellect) || 0);

					// Draw the class form
					let clib = Object.values(glib.getFull('PlayerClass'));
					clib.sort((a,b) => {
						if(a.label === 'none')
							return -1;
						else if(b.label === 'none')
							return 1;
						if( a.monster_only && !b.monster_only )
							return 1;
						else if( !a.monster_only && b.monster_only )
							return -1;
						return a.name < b.name ? -1 : 1;
					});
					for( let c of clib )
						html += '<option value="'+esc(c.label)+'">'+(c.monster_only ? '[M] ':'')+esc(c.name)+'</option>';
					dDivs.formClass.html(html);
					dDivs.formClass.val(player.class.label);

					

					// Draw the secondary stat form
					const secondary = dDivs.formSecondaryStat;
					for(let i in Action.Types){

						const t = Action.Types[i];
						$("> div."+i+" > input", secondary[0]).val(parseInt(player['sv'+t]) || 0);
						$("> div."+i+" > input", secondary[1]).val(parseInt(player['bon'+t]) || 0);

					}

					

					// Draw the randomizer
					html = '<option value="_RANDOM_">-RANDOM-</option>';
					const libtemplates = Object.values(glib.getFull('PlayerTemplate'));
					libtemplates.sort((a,b) => a.name < b.name ? -1 : 1);
					for( let t of libtemplates )
						html += '<option value="'+esc(t.label)+'" '+(this.randomizerOption === t.label ? 'selected' : '')+'>'+esc(t.name)+'</option>';
					dDivs.randomizerSelect.html(html);
					dDivs.randomizer.toggleClass('hidden', Boolean(game.getPlayerById(player.id)));
			

					// actions
					let actions = player.getActions( false, true, false );
					html = '';
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
					dDivs.actions.html(html);


					// Events
					// Add action
					dDivs.addAction.off('click').on('click', () => {
						this.edit.drawPlayerActionSelector(player, id => {

							if( player.addActionFromLibrary(id) ){

								game.save();
								this.refresh();

							}

						});
					});
					// Delete action
					$("> div.action:not(.noDelete)", dDivs.actions).off('click').on('click', event => {

						// Todo: change confirm
						if( confirm('Really unlearn?') && game.deletePlayerAction( player, $(event.currentTarget).attr('data-id')) ){
							this.refresh();
							game.ui.draw();
						}

					});
					// Icon changed
					dDivs.formDressed.off('change').on('change', () => {
						dDivs.image.css('background-image', 'url(\''+esc(dDivs.formDressed.val().trim())+'\')');
					});
					dDivs.form.off('submit').on('submit', event => {
			
						event.stopImmediatePropagation();
						event.preventDefault();
						
						player.name = dDivs.formName.val().trim();
						player.species = dDivs.formSpecies.val().trim();
						player.description = dDivs.formDescription.val().trim();
						player.icon = dDivs.formDressed.val().trim();
						player.icon_upperBody = dDivs.formUpperBody.val().trim();
						player.icon_lowerBody = dDivs.formLowerBody.val().trim();
						player.icon_nude = dDivs.formNude.val().trim();
						player.hp = parseInt(dDivs.formHP.val())||10;
						player.ap = parseInt(dDivs.formAP.val())||0;
						player.mp = parseInt(dDivs.formMP.val())||0;
						player.arousal = parseInt(dDivs.formArousal.val())||0;
			
						player.stamina = parseInt(dDivs.formStamina.val())||0;
						player.agility = parseInt(dDivs.formAgility.val())||0;
						player.intellect = parseInt(dDivs.formIntellect.val())||0;
						
						player.level = parseInt(dDivs.formLevel.val())||0;
						player.size = parseInt(dDivs.formSize.val())||0;
						player.team = parseInt(dDivs.formTeam.val())||0;
			
						let cName = dDivs.formClass.val().trim();
						let cl = glib.get(cName, 'PlayerClass');
						if( cl ){
							player.class = cl;
							player.addActionsForClass();
						}
						player.tags = dDivs.formTags.val().split(' ').filter(el => {
							if(!el.trim())
								return false;
							return true;
						}).map(el => {
							if( !el.toLowerCase().startsWith('pl_') )
								el = 'pl_'+el.toLowerCase();
							return el;	
						});
						
						for(let i in Action.Types){

							const t = Action.Types[i];
							player['sv'+t] = parseInt($("> div."+i+" > input", secondary[0]).val()) || 0;
							player['bon'+t] = parseInt($("> div."+i+" > input", secondary[1]).val()) || 0;
	
						}
			
						if( player.hp > player.getMaxHP() )
							player.hp = player.getMaxHP();
						if( player.ap > player.getMaxAP() )
							player.ap = player.getMaxAP();
						if( player.mp > player.getMaxMP() )
							player.mp = player.getMaxMP();
						
						
						if( !game.playerExists(player) ){
							game.addPlayer(player);
							player.onPlacedInWorld();
						}
			
						game.save();
						game.ui.draw();
						this.close();
			
						return false;
			
					});

					dDivs.formDeletePlayer.off('click').on('click', () => {

						// Todo: change confirm to use modal
						if( !confirm('Really delete?') )
							return;
						
						game.removePlayer(player.id);
						game.ui.draw();
						this.close();
						
					});

					
					dDivs.randomizerButton.off('click').on('click', () => {
						
						let type = dDivs.randomizerSelect.val();
						let allowed;
						if( type !== '_RANDOM_' )
							allowed = [type];
			
						let pl = PlayerTemplate.generate(parseInt(dDivs.formLevel.val()) || 1, allowed);
						if( pl ){
							let data = pl.save(true);
							this.randomizerOption = type;
							delete pl.id;
							player.load(data);
							this.refresh();
						}
						else
							console.error("Unable to generate a player template with those conditions");
			
					});

					
					
			


			});

		// Shop
		this.add(new this("shop", "Shop"))
			.addRefreshOn(["players"])
			.addTab("Buy", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
							<br /><input type="button" name="exchange" value="Exchange" />
						</div>
						<div class="altCurrency center inventory"></div>
					</div>
					<div class="shop inventory"></div>
					<div class="shop empty hidden">Sold out!</div>
				`;
			})
			.addTab("Sell", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
							<br /><input type="button" name="exchange" value="Exchange" />
						</div>
					</div>
					<div class="shop inventory"></div>
					<div class="shop empty hidden">No sellable items!</div>
				`;
			})
			.setProperties(function(){

				const buyPage = this.getTabDom('Buy')[0],
					sellPage = this.getTabDom('Sell')[0]
				;

				this.headers = [
					buyPage.querySelector('div.myMoney'),
					sellPage.querySelector('div.myMoney')
				];
				
				this.buyInventory = buyPage.querySelector('div.shop.inventory');
				this.sellInventory = sellPage.querySelector('div.shop.inventory');

				this.buyEmpty = buyPage.querySelector('div.shop.empty');
				this.sellEmpty = sellPage.querySelector('div.shop.empty');


			})
			.setDraw(async function( shop ){

				const 
					myPlayer = game.getMyActivePlayer()
				;



				if( !(shop instanceof Shop) || !myPlayer )
					throw 'Invalid shop or player';

				shop.loadState(game.state_shops[shop.label]);

				if( !game.shopAvailableTo(shop, myPlayer) )
					return;

				// Titles
				this.setTitle(shop.name);
				



				// My money
				const updateWallet = async baseElement => {

					// Exchange button
					const exchangeButton = baseElement.querySelector('input[name=exchange]');
					exchangeButton.classList.toggle('hidden', !myPlayer.canExchange());
					if( !exchangeButton._bound ){

						exchangeButton.addEventListener('click', event => {
							game.exchangePlayerMoney(myPlayer);
						});
						exchangeButton._bound = true;

					}


					// Update coins
					const currencyDiv = baseElement.querySelector('span.coins');
					for( let i in Player.currencyWeights ){

						const currency = Player.currencyWeights[i];

						let sub = currencyDiv.querySelector('span[data-currency=\''+currency+'\']');
						if( !sub ){

							sub = document.createElement('span');
							sub.dataset.currency = currency;
							sub.style = 'color:'+Player.currencyColors[i];
							currencyDiv.append(sub);
							currencyDiv.append(document.createTextNode(' '));

						}

						sub.classList.toggle('hidden', true);

						const asset = myPlayer.getAssetByLabel(Player.currencyWeights[i]);
						if( !asset )
							continue;

						const amt = parseInt(asset._stacks);
						if( !amt )
							continue;

						sub.classList.toggle('hidden', false);
						sub.innerHTML = '<b>'+amt+'</b> '+Player.currencyWeights[i];

					}


					// Update tokens (alt currency)
					const tokenBase = baseElement.querySelector('div.altCurrency');

					// only buy shows tokens
					if( tokenBase ){

						const tokens = shop.getTokenAssets();
						let divs = [];
						for( let i = 0; i < tokens.length; ++i ){

							const token = tokens[i];
							let div = await StaticModal.getGenericAssetButton(token, myPlayer.numAssets(token.label), '', 'compact');
							divs.push(div);
							
						}
						tokenBase.replaceChildren(...divs);

					}

				};
				for( let footer of this.headers )
					await updateWallet(footer);




				// Assets for sale
				const handleSellAssetClick = event => {

					const th = $(event.currentTarget),
						id = th.attr('data-id');
						
					const item = shop.getItemById(id);
					if( !item )
						return;
					
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

					game.ui.modal.makeSelectionBoxForm(
						'Amount to BUY: <input type="number" style="width:4vmax" min=1 '+(maxQuant > 0 ? 'max='+(maxQuant) : 'max=100')+' step=1 value=1 /><input type="submit" value="Ok" />',
						function(){
							const amount = Math.floor($("input:first", this).val());
							if( !amount )
								return;
							game.buyAsset(shop.label, item.id, amount, myPlayer.id);
						},
						false
					);

				};
				let newDivs = [];
				let availableAssets = 0;
				for( let item of shop.items ){

					const cost = item.getCost();
					const asset = item.getAsset();
					if( !asset )
						continue;

					const remaining = item.getRemaining();
					if( remaining === 0 )
						continue;
					
					asset.name = (remaining !== -1 ? '['+remaining+']' : '&infin;')+" "+asset.name;
					asset.id = item.id;

					const affordable = item.affordableByPlayer(myPlayer);

					++availableAssets;

					const button = await StaticModal.getGenericAssetButton(
						asset, 
						cost, 
						!affordable ? 'disabled' : '',
						false
					);
					button.addEventListener('click', handleSellAssetClick);
					newDivs.push(button);

					// Alt currency
					const costDiv = button.querySelector('div.cost');
					for( let token of item.tokens ){

						const div = document.createElement('div');
						div.classList.add('token');

						const svg = await token.asset.getImgElement();
						div.append(svg);

						const quant = document.createElement('div');
						div.append(quant);
						quant.innerText = 'x'+token.amount;
						
						costDiv.append(div);

					}
					
				}
				

				this.buyInventory.replaceChildren(...newDivs);
				this.buyEmpty.classList.toggle('hidden', Boolean(availableAssets));
				this.buyInventory.classList.toggle('hidden', !availableAssets);
				




				// Assets the vendor is buying
				const handleBuyAssetClick = event => {

					const th = event.currentTarget,
						id = th.dataset.id,
						asset = myPlayer.getAssetById(id)
					;

					if( !asset )
						return;

					const maxQuant = asset.stacking ? asset._stacks : 1;
					game.ui.modal.makeSelectionBoxForm(
						'Amount to SELL: <input type="number" style="width:4vmax" min=1 max='+(maxQuant)+' step=1 value='+maxQuant+' /><input type="submit" value="Ok" />',
						function(){

							const amount = Math.floor($("input:first", this).val());
							if( !amount )
								return;
							game.sellAsset(shop.label, asset.id, amount, myPlayer.id);

						},
						false
					);

				};
				newDivs = [];
				availableAssets = 0;
				for( let asset of myPlayer.assets ){

					if( !asset.isSellable() )
						continue;

						
					const a = asset.clone();
					a.name = (asset.stacking ? '['+asset._stacks+'] ' : '[1] ')+' '+a.name;

					const div = await StaticModal.getGenericAssetButton(a, a.getSellCost(shop));
					newDivs.push(div);
					div.addEventListener('click', handleBuyAssetClick);

					++availableAssets;

				}
				this.sellInventory.replaceChildren(...newDivs);
				this.sellEmpty.classList.toggle('hidden', Boolean(availableAssets));
				this.sellInventory.classList.toggle('hidden', !availableAssets);


			});
		// Smith
		this.add(new this("smith", "Smith"))
			.addRefreshOn(["players"])
			.addTab("Smith", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
							<br /><input type="button" name="exchange" value="Exchange" />
						</div>
					</div>
					<div class="assets repair shop inventory container"></div>
					<div class="assets repair shop inventory empty">
						<h3>No broken items.</h3>
					</div>
				`;
			})
			.setProperties(function(){
				
				const smith = this.getTabDom('Smith')[0];
				this.money = smith.querySelector('div.myMoney');
				this.assets = smith.querySelector('div.repair.container');
				this.empty = smith.querySelector('div.repair.empty');

			})
			.setDraw(async function( smith ){

				const myPlayer = game.getMyActivePlayer();
				if( !myPlayer )
					throw 'You have no active player';
				if( !smith )
					throw 'Invalid smith';

				// Update coins
				const currencyDiv = this.money.querySelector('span.coins');
				for( let i in Player.currencyWeights ){

					const currency = Player.currencyWeights[i];

					let sub = currencyDiv.querySelector('span[data-currency=\''+currency+'\']');
					if( !sub ){

						sub = document.createElement('span');
						sub.dataset.currency = currency;
						sub.style = 'color:'+Player.currencyColors[i];
						currencyDiv.append(sub);
						currencyDiv.append(document.createTextNode(' '));

					}

					sub.classList.toggle('hidden', true);

					const asset = myPlayer.getAssetByLabel(Player.currencyWeights[i]);
					if( !asset )
						continue;

					const amt = parseInt(asset._stacks);
					if( !amt )
						continue;

					sub.classList.toggle('hidden', false);
					sub.innerHTML = '<b>'+amt+'</b> '+Player.currencyWeights[i];

				}
	

				// Output repairable
				const handleRepairableClick = event => {
					
					const id = event.currentTarget.dataset.id;
					game.repairBySmith(smith, myPlayer, id);

				};

				const repairable = myPlayer.getRepairableAssets();
				this.empty.classList.toggle("hidden", Boolean(repairable.length));
				this.assets.classList.toggle("hidden", !repairable.length);

				const money = myPlayer.getMoney();
				const divs = [];				
				for( let asset of repairable ){

					const cost = asset.getRepairCost(smith);
					const div = await StaticModal.getGenericAssetButton(asset, cost, cost > money ? 'disabled' : '');
					divs.push(div);
					div.addEventListener('click', handleRepairableClick);
					
				}
				this.assets.replaceChildren(...divs);

			});

		// Main menu
		this.add(new this("mainMenu", "FetishQuest"))
			.addTab("Main Menu", () => {
				return `
					<p class="centered subtitle">
						<strong>This game contains adult content. But you\'ve probably worked that out from the title already.</strong><br />
						Follow development on <a href="https://discord.jasx.org" target="_blank">Discord</a>.<br />
						If you like the game, consider becoming a <a href="https://www.patreon.com/jasx_games" target="_blank">Patron</a>!
					</p>

					<p style="text-align:center">
						<input type="button" class="green newGameButton" name="newGame" value="New Game" />
					</p>
					<hr />
					<div class="loadGame">
						<p>
							<strong>LOAD</strong>
						</p>
						<div class="gameSaves"></div><br />
						<p class="subtitle">Ctrl+click to delete</p>
					</div>
				`;
			})
			.addTab("Mods", () => {
				return `
					<table class="editor">
						<tr class="head">
							<th>Name</th>
							<th>Enabled</th>
							<th>Netgame</th>
							<th>Load Order</th>
						</tr>
						<tr class="noMods hidden">
							<td colspan=4>No mods installed</td>
						</tr>
					</table>
					<br />
					Install Mod: <input type="file" class="modFile" />
				`;
			})
			.addTab("Online", () => {
				return `
					<h3>Join Existing Online Game</h3>
					<form class="joinGame">
						<input type="text" placeholder="Nickname" name="nickname" style="width:auto" />
						<input type="text" placeholder="Game ID" name="gameID" style="width:auto" />
						<input type="submit" value="Join Online Game"  />
					</form>
				`;
			})
			.addTab("Credits", () => {
				return `
					<div class="center">
					<h1>Credits</h1>
					<p>Concept/Programming/Models: JasX</p>
					<p>Additional Models:</p>
					Kitaro "Huskebutt" Kun<br />
					<p>Art:</p>
					<a href="http://www.furaffinity.net/gallery/gothwolf">GothWolf</a><br />
					<a href="http://www.furaffinity.net/gallery/maddworld">Maddworld</a><br />
					<p>Audio:</p>
					https://freesound.org/people/GameDevC/sounds/422836/<br />
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
					https://freesound.org/people/ivolipa/sounds/326313/<br />
					https://freesound.org/people/humanoide9000/sounds/505426/<br />
				</div>
				`;
			})
			.setProperties(function(){
				
				const 
					mainMenu = this.getTabDom('Main Menu')[0],
					mods = this.getTabDom('Mods')[0],
					online = this.getTabDom('Online')[0]
				;

				this.newGameButton = mainMenu.querySelector('input.newGameButton');
				this.gameSaves = mainMenu.querySelector('div.gameSaves');
				this.loadGame = mainMenu.querySelector('div.loadGame');
				this.modsTable = mods.querySelector('table.editor');
				this.loadMod = mods.querySelector('input.modFile');
				this.joinGameForm = online.querySelector('form.joinGame');

			})
			.setDraw(async function(){

				
				// Show game saves
				const handleGameClick = event => {
					
					const id = event.currentTarget.dataset.id;

					if( event.ctrlKey ){

						if( confirm('Really delete this game?') ){

							const isActiveGame = id === game.id;
							Game.delete(id).then(() => {
								this.refresh();
								if( isActiveGame ){
									game.ui.destructor();
								}
							});

						}

						return false;

					}

					game.net.disconnect();
					localStorage.game = id;
					Game.load();
					this.close(true);

				};

				const divs = [];
				let names = await Game.getNames(true);	// refreshes mod name cache
				for( let id in names ){

					let name = names[id];
					const div = document.createElement('div');
					div.classList.add('gameListing');
					div.dataset.id = id;
					div.innerText = name;

					div.addEventListener('click', handleGameClick);

					divs.push(div);

				}
				this.gameSaves.replaceChildren(...divs);
				this.loadGame.classList.toggle('hidden', !Object.keys(names).length);



				// Mods
				const sortedMods = await Mod.getModsOrdered();
				for( let i in sortedMods )
					sortedMods[i].index = +i;

				const createCheckbox = (base, cname, checked) => {

					const td = document.createElement('td');
					base.append(td);
					const checkbox = document.createElement('input');
					td.append(checkbox);
					checkbox.type = 'checkbox';
					checkbox.classList.add(cname);
					if( checked )
						checkbox.checked = true;

					checkbox.addEventListener('change', () => {

						clearTimeout(this._saveLoadOrder);
						this._saveLoadOrder = setTimeout(saveLoadOrder, 3000);

					});

				};

				const saveLoadOrder = () => {

					// Save order
					const 
						order = {},
						mods = this.modsTable.querySelectorAll('tr.mod')
					;

					mods.forEach((el, idx) => {

						const 
							id = el.dataset.mod,
							en = el.querySelector('input.enableMod').checked,
							net = el.querySelector('input.netgame').checked
						;
						order[id] = {idx:idx, en:en, netgame:net};

					});
					
					Mod.saveLoadOrder(order);
					glib.autoloadMods();
		
				};

				const handleModOrderButtonClick = event => {

					const 
						targ = event.currentTarget,
						up = targ.classList.contains('moveUp'),
						row = targ.closest("tr")
					;
					if( up && row.previousSibling )
						row.previousSibling.before(row);
					else if( !up && row.nextSibling )
						row.nextSibling.after(row);
					
					clearTimeout(this._saveLoadOrder);
					this._saveLoadOrder = setTimeout(saveLoadOrder, 3000);

				};

				this.modsTable.querySelectorAll('tr.mod').forEach(el => el.remove());
				for( let mod of sortedMods ){
				
					let td;
					const tr = document.createElement('tr');
					tr.classList.add('mod');
					tr.dataset.mod = mod.id;
					this.modsTable.append(tr);
					
					td = document.createElement('td');
					td.innerText = mod.name;
					tr.append(td);
					
					createCheckbox(tr, 'enableMod', mod.enabled);
					createCheckbox(tr, 'netgame', mod.netgame);

					td = document.createElement('td');
					tr.append(td);

					let button = document.createElement('input');
					td.append(button);
					button.type = 'button';
					button.value = 'Up';
					button.classList.add('moveUp');
					button.addEventListener('click', handleModOrderButtonClick);

					button = document.createElement('input');
					td.append(button);
					button.type = 'button';
					button.value = 'Down';
					button.classList.add('moveDown');
					button.addEventListener('click', handleModOrderButtonClick);

					tr.addEventListener('click', async event => {

						if( !event.ctrlKey )
							return;

						const m = await Mod.getByID(mod.id);
						if( !m )
							return;

						const del = await m.delete(true);
						if( del )
							this.refresh();

					});
					
				}
				this.modsTable.querySelector('tr.noMods').classList.toggle('hidden', Boolean(sortedMods.length));

				

				// First run
				if( !this.drawn ){

					this.newGameButton.addEventListener('click', event => {
						StaticModal.set('newGame');
					});

					this.joinGameForm.addEventListener('submit', event => {

						event.stopImmediatePropagation();
						game.net.joinGame(
							this.joinGameForm.querySelector("input[name=gameID]").value, 
							this.joinGameForm.querySelector("input[name=nickname]").value
						).then(() => this.refresh());
						return false;

					});

					this.loadMod.addEventListener('change', async event => {
						
						const mod = await Mod.import(event);
						if( !mod )
							return;

						this.refresh();
						game.ui.modal.addNotice("Mod "+esc(mod.name)+" installed!");
						this.loadMod.value = '';

					});

					this.loadMod.setAttribute("accept", ".fqmod");


				}


			});
		
		
		// New game
		this.add(new this("newGame", "New Game"))
			.addTab("New Game", () => {
				return `
					<div class="newGame"><form class="newGameForm">

						<input type="text" class="gameName" value="Unnamed Adventure" /><br />
						<div class="flexTwoColumns">
							<div class="left">
								<input type="text" class="autoSave" name="name" placeholder="Character Name" required /><br />
								<input type="text" class="autoSave" name="species" placeholder="Species" required /><br />
								Class: <div class="class"><!-- Class listing goes here --></div>
								Size: <input type="range" class="autoSave" name="size" min=0 max=10 /><br />
								Tags (control+click to remove): <input type="button" class="addTag" value="Add Tag" /><br />
								<div class="tags"></div>
								<textarea name="description" class="autoSave"></textarea>
								Dressed: <input type="text" class="small reloadIcon autoSave" name="icon" placeholder="Dressed Art" /><br />
								Nude: <input type="text" class="small reloadIcon autoSave" name="icon_nude" placeholder="Nude Art" /><br />
								UpperBody: <input type="text" class="small reloadIcon autoSave" name="icon_upperBody" placeholder="UpperBody Art" /><br />
								LowerBody: <input type="text" class="small reloadIcon autoSave" name="icon_lowerBody" placeholder="LowerBody Art" /><br />
							</div>
							<div class="right">
								<div style="text-align:center">
									<div class="portrait"></div>
								</div>
								<h3>Templates</h3>
								<div class="gallery"><!-- Gallery entries here --></div>
							</div>
						</div>

						<hr />

						<input type="submit" value="Start Game" />

					</form></div>
					<div class="hidden datalists">
						<datalist id="newGameTags"><select><!-- Tag options here --></select></datalist>
					</div>
				`;
			})
			.setProperties(function(){
				
				const dom = this.getTabDom('New Game')[0];

				this.cData = {
					form : dom.querySelector('form.newGameForm'),
					portrait : dom.querySelector('div.portrait'),
					name : dom.querySelector('input[name=name]'),
					species : dom.querySelector('input[name=species]'),
					size : dom.querySelector('input[name=size]'),
					class : dom.querySelector('div.class'),
					addTagButton : dom.querySelector('input.addTag'),
					tags : dom.querySelector('div.tags'),
					description : dom.querySelector('textarea[name=description]'),
					dressed : dom.querySelector('input[name=icon]'),
					nude : dom.querySelector('input[name=icon_nude]'),
					upperBody : dom.querySelector('input[name=icon_upperBody]'),
					lowerBody : dom.querySelector('input[name=icon_lowerBody]'),
					gameName : dom.querySelector('input.gameName')
				};
				this.gallery = dom.querySelector('div.gallery');
				this.tagList = document.getElementById('newGameTags');

				// Set up static things that should be set by the game
				const classes = glib.getFull('PlayerClass');
				for( let c in classes ){
					
					const obj = classes[c];
					if( !obj.monster_only ){

						const label = document.createElement('label');
						this.cData.class.append(label);
						label.innerText = obj.name+" ";
						
						const radio = document.createElement('input');
						radio.type = 'radio';
						radio.name = 'playerClass';
						radio.classList.add('playerClass', 'hidden', 'autoSave');
						radio.value = c;
						label.append(radio);


					}
					
				}
				this.cData.classLabels = this.cData.class.querySelectorAll('label');
				this.cData.classInputs = this.cData.class.querySelectorAll('input');

				for( let tag in stdTag ){

					const spl = stdTag[tag].split('_');
					if( spl[0] === 'pl' ){

						spl.shift();
						const option = document.createElement('option');
						option.value = spl.join('_');
						this.tagList.append(option);

					}

				}

			})
			.setDraw(async function(){

				this.player = new Player();


				

				// Updates the class labels
				const updateClass = () => {

					this.cData.classInputs.forEach(input => {

						const checked = input.value === this.player.class.label;
						input.checked = checked;
						input.parentNode.classList.toggle('selected', checked);

					});

				};
				
				const reloadIcon = () => {
					this.cData.portrait.style = 'background-image:url('+esc(this.player.icon)+')';
				};

				// Updates fields from player
				const updateFields = () => {

					reloadIcon();
					this.cData.name.value = this.player.name;
					this.cData.species.value = this.player.species;
					this.cData.size.value = this.player.size;
					
					updateClass();

					this.cData.description.value = this.player.description;
					this.cData.dressed.value = this.player.icon;
					this.cData.nude.value = this.player.icon_nude;
					this.cData.upperBody.value = this.player.icon_upperBody;
					this.cData.lowerBody.value = this.player.icon_lowerBody;

					this.cData.tags.replaceChildren();
					for( let tag of this.player.tags )
						this.addTag(tag);


				};

				// Updates player from fields
				const updatePlayer = () => {

					this.player.icon = this.cData.dressed.value.trim();
					this.player.icon_nude = this.cData.nude.value.trim();
					this.player.icon_upperBody = this.cData.upperBody.value.trim();
					this.player.icon_lowerBody = this.cData.lowerBody.value.trim();
					this.player.description = this.cData.description.value.trim();
					this.player.size = +this.cData.size.value || 0;
					this.player.species = this.cData.species.value.trim();
					this.player.name = this.cData.name.value;

					this.cData.classInputs.forEach(input => {
						if( input.checked )
							this.player.class = glib.get(input.value, 'PlayerClass');
					});
					
					this.player.tags = [];
					for( let tagDom of this.cData.tags.children ){

						const tag = tagDom.value.trim().toLowerCase();
						if( tag )
							this.player.tags.push('pl_'+tag);

					}
				};

				const loadTemplate = label => {

					const template = glib.get(label, 'PlayerGalleryTemplate');
					this.player.load(template.player);
					this.player.g_resetID();

				};

				
				// Update default characters
				// Template characters
				const onGalleryClick = event => {
					
					loadTemplate(event.target.dataset.label);
					updateFields();

				};
				const gallery = glib.getFull('PlayerGalleryTemplate');
				let divs = [];
				for( let i in gallery ){

					const item = gallery[i],
						div = document.createElement('div')
					;
					div.classList.add('galleryEntry', 'button');
					div.dataset.label = i;
					div.style = 'background-image:url('+esc(item.player.icon)+')';
					div.addEventListener('click', onGalleryClick);
					divs.push(div);

				}
				this.gallery.replaceChildren(...divs);



				
				// First build
				if( !this.drawn ){

					// Autosave static forms
					const onAutosaveChange = () => {
						updatePlayer();
						updateClass();	
					};
					this.cData.form.querySelectorAll(".autoSave").forEach(el => el.addEventListener('change', onAutosaveChange));

					// Tag helpers
					this.onTagClick = event => {

						if( !event.ctrlKey )
							return;
						event.currentTarget.remove();
						updatePlayer();
						
					};
					this.addTag = tag => {
						
						if( typeof tag !== "string" )
							tag = '';

						tag = tag.split('_');
						tag.shift();
						tag = tag.join('_');
						const input = document.createElement('input');
						input.type = 'text';
						input.value = tag;
						input.name = 'tag';
						input.classList.add('tag');
						input.setAttribute('list', 'newGameTags');
						input.addEventListener('change', onAutosaveChange);
						input.addEventListener('click', this.onTagClick);
						this.cData.tags.append(input);

					};
					this.cData.addTagButton.addEventListener('click', this.addTag);

					this.cData.form.querySelectorAll('.reloadIcon').forEach(el => el.addEventListener('change', reloadIcon));

					this.cData.form.addEventListener('submit', event => {
						event.stopImmediatePropagation();
						event.preventDefault();

						const name = this.cData.gameName.value.trim();
						if( !name ){

							game.ui.modal.addError("Name is empty");
							return;

						}
			
						const pl = this.player.clone();
						pl.auto_learn = false;
						pl.netgame_owner_name = 'DM';
						pl.netgame_owner = 'DM';


						Game.new(name, [pl]);
						this.close( true );
					});

				}
				


				// Load a default template and update fields
				loadTemplate(this.gallery.children[0].dataset.label);
				updateFields();

			});


		// Inventory
		this.add(new this("inventory", "Inventory"))
			.addRefreshOn(["players"])
			.addTab("Inventory", () => {
				return `
					<div class="inventory flexTwoColumns">
						<div class="left">

							<h3>Equipment</h3>
							<div class="equipment"><!-- Worn assets here --></div>
							
							<h3>Toolbelt</h3>
							<div class="toolbelt"><!-- Toolbelt assets here --></div>
							<br />
							<div class="progressBar weight">
								<div class="bar" style="width:0%;"><!-- Set width here base on percentage --></div>
								<span class="content"><!-- Progress bar text here --></span>
							</div>

						</div>

						<div class="right">
							<div class="inventory mainInventory">
								<!-- Inventory assets here -->
							</div>
							<br /><input type="button" value="+ Add Item" class="addInventory blue devtool" />
						</div>
					</div>
				`;
			})
			.setProperties(function(){
				
				const main = this.getTabDom('Inventory')[0];

				this.main = {
					equipment : main.querySelector('div.equipment'),
					toolbelt : main.querySelector('div.toolbelt'),
					weight : main.querySelector('div.weight'),
					weightBar : main.querySelector('div.weight div.bar'),
					weightContent : main.querySelector('div.weight span.content'),
					mainInventory : main.querySelector('div.mainInventory'),
					addInventory : main.querySelector('input.addInventory'),
				};

				// Can bind this here since it's a static item
				this.main.addInventory.addEventListener('click', () => {
					StaticModal.setWithTab('assetLibrary', 'Library', game.getMyActivePlayer());
				});

								

			})
			.setDraw(async function(){

				const player = game.getMyActivePlayer();
				if( !player )
					return;


				this.main.weightBar.style = 'width:'+Math.max(0, Math.min(100, player.getCarriedWeight()/player.getCarryingCapacity()*100))+'%';
				this.main.weightContent.innerText = (Math.floor(player.getCarriedWeight()/100)/10)+'/'+Math.floor(player.getCarryingCapacity()/1000)+'kg';
				const encumbered = player.getCarriedWeight() > player.getCarryingCapacity();
				this.main.weight.classList.toggle('red', encumbered);
				this.main.weight.classList.toggle('yellow', !encumbered);


				// Handle inventory asset click
				const onAssetClick = event => {

					const 
						element = event.currentTarget, 
						ui = game.ui,
						th = this
					;
					let id = element.dataset.id;
					let asset = player.getAssetById(id);
					

					if( event.shiftKey  && game.is_host ){

						if( asset )
							StaticModal.setWithTab( 'assetLibrary', 'Editor', player, asset );

					}
					// Toggle equip / use
					else if( asset ){

						const isHotbar = element.classList.contains('equipmentSlot');

						const modal = game.ui.modal;
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
							(!game.battle_active || game.getTurnPlayer().id === player.id) &&
							!asset.soulbound
						)
							modal.addSelectionBoxItem( 'Trade', game.battle_active ? '[3 AP]' : '', 'trade' );

						if( !game.battle_active )
							modal.addSelectionBoxItem( 'Destroy', false, 'destroy' );
						


						modal.onSelectionBox(function(){

							ui.onTooltipMouseout();
							let element = this;
							const task = element.dataset.id;

							if( (task === 'unequip' || task === 'equip') && asset.equippable() && game.equipPlayerItem(player, id) ){
								
								if( asset.loot_sound )
									game.playFxAudioKitById(asset.loot_sound, player, player );
								th.refresh();
								ui.draw();
								
							}
							else if( task === 'use' ){

								let action = asset.use_action;
								let targets = action.getViableTargets();
								if( !targets.length )
									return;

								ui.action_selected = action;
								ui.targets_selected = [];

								if( action.castable(true) ){
									ui.targets_selected = [];
									ui.drawTargetSelector();
								}

								if( action.targetable() )
									th.close();
								else
									th.refresh();
								
							}
							else if( task == 'trade' ){

								if( game.battle_active ){

									if( player.ap < 3 ){

										modal.addError("Not enough AP");
										modal.closeSelectionBox();
										return;

									}
									else if( game.getTurnPlayer().id !== player.id ){

										modal.closeSelectionBox();
										modal.addError("Not your turn");
										return;

									}

								}

								if( asset.stacking && asset._stacks > 1 ){

									modal.makeSelectionBoxForm(
										'Amount to trade: <input type="number" style="width:4vmax" min=1 max='+(asset._stacks)+' step=1 value='+(parseInt(asset._stacks) || 1)+' /><input type="submit" value="Ok" />',
										function(){

											const amount = Math.floor( this.querySelector('input').value );
											if( !amount )
												return;
											ui.drawAssetTradeTarget(asset, amount);

										}
									);
									return;

								}
								ui.drawAssetTradeTarget(asset);
								return;

							}
							else if( task === 'destroy' ){

								modal.prepareSelectionBox( true );
								// Delete from stack
								if( asset.stacking && asset._stacks >1 ){

									modal.makeSelectionBoxForm(
										'Amount to destroy: <input type="number" style="width:4vmax" min=1 max='+(asset._stacks)+' step=1 value='+(parseInt(asset._stacks) || 1)+' /><input type="submit" value="Ok" />',
										function(){

											const amount = Math.floor( this.querySelector('input').value );
											if( amount > 0 ){
												if(game.deletePlayerItem( player, id, parseInt(amount))){
													th.refresh();
													ui.draw();
												}
											}

										}
									);

								}
								// Delete single
								else{

									modal.addSelectionBoxItem( "Are you sure?", '', 'delete' );
									modal.onSelectionBox(function(){

										const pid = this.dataset.id;
										if( pid === 'delete' && game.deletePlayerItem( player, id) ){
											th.refresh();
											ui.draw();
										}
										modal.closeSelectionBox();

									});

								}
							
								return;
							}

							modal.closeSelectionBox();


						});
						
					}

					ui.onTooltipMouseout();

				};


				// Create equipment slots
				const slots = [
					{slot:Asset.Slots.upperBody, icon:'breastplate'},
					{slot:Asset.Slots.lowerBody, icon:'armored-pants'},
					{slot:Asset.Slots.hands, icon:'crossed-swords'}
				];
				const createEquipSlot = async (slot, fallback) => {

					const asset = player.getEquippedAssetsBySlots(slot, true)[0];

					const div = document.createElement('div');
					div.classList.add('equipmentSlot', 'item', 'tooltipParent');
					if( asset )
						div.classList.add(Asset.RarityNames[asset.rarity]);
					if(asset && asset.durability <= 0 )
						div.classList.add('broken');

					div.dataset.slot = slot;
					

					if( asset ){

						div.dataset.id = asset.id || '';

						const img = await asset.getImgElement();
						div.append(img);

						const tooltip = document.createElement('div');
						div.append(tooltip);
						tooltip.classList.add('tooltip');
						tooltip.innerHTML = asset.getTooltipText();

					}
					else{
						
						const img = document.createElement('img');
						div.append(img);
						img.classList.add('bg', 'template');
						img.src = fallback;

					}

					div.addEventListener('click', onAssetClick);

					return div;


				};
				let divs = [];
				for( let slot of slots )
					divs.push(await createEquipSlot(slot.slot, 'media/wrapper_icons/'+slot.icon+'.svg'));
				this.main.equipment.replaceChildren(...divs);

				divs = [];
				for( let i =0; i<3; ++i )
					divs.push(await createEquipSlot(Asset.Slots.action, 'media/wrapper_icons/potion-ball.svg'));
				this.main.toolbelt.replaceChildren(...divs);


				// Create listing
				let inv = [];
				for(let asset of player.assets)
					inv.push(asset);

				// Sort by category
				inv = inv.filter(el => !el.equipped).sort((a,b) => {
					if( a.category !== b.category ){
						return a.category < b.category ? -1 : 1;
					}
					if(a.name === b.name)
						return 0;
					return a.name < b.name ? -1 : 1;
				});

				divs = [];
				const mainInv = this.main.mainInventory;
				let cat;
				for( let item of inv ){

					if( !cat || item.category !== cat ){

						cat = item.category;
						const title = document.createElement('h3');
						divs.push(title);
						title.classList.add('category');
						title.innerText = Asset.CategoriesNames[cat];
						
					}

					const div = await StaticModal.getGenericAssetButton(item);
					divs.push(div);
					
				}
				mainInv.replaceChildren(...divs);

				
				mainInv.querySelectorAll('div.item[data-id]').forEach(el => el.addEventListener('click', onAssetClick));

				
				
			});
		// Asset editor
		this.add(new this("assetLibrary", "Asset Library"))
			.addTab("Library", () => {
				return `
					<div class="inventory tooltipShrink">
						<h3 class="title"></h3>
						<div class="listing"></div>
						<input type="button" class="create green" value="Create" />
						<input type="button" class="back red" value="Back" />
					</div>
				`;
			})
			.addTab("Editor", () => {
				return `
					<div class="inventory"><form class="saveAsset">
						<div class="centered">
							<input type="button" class="generateRandom yellow" value="Randomize As:" /> 
							<select name="randSlot"><!-- Randomizer slot here --></select>
							<div class="parentInfo"><!-- Enabled when this item is owned -->
								<div class="centered">
									Owner : <select name="owner"><!-- Player names here --></select>
								</div>
							</div>
						</div>

						<div class="flexThreeColumns">

							<div>Unique ID:<br /><input type="text" name="label" /></div>
							<div>Name:<br /><input type="text" name="name" /></div>
							<div>Shortname:<br /><input type="text" name="shortname" /></div>
							<div>Level:<br /><input type="number" min=-1 step=1 name="level" /></div>
							<div>Durability Bonus:<br /><input type="number" min=0 step=1 name="durability_bonus" /></div>
							<div>Weight in grams:<br /><input type="number" min=0 step=1 name="weight" /></div>
							<div>Rarity:<br /><input type="number" min=0 step=1 max=4 name="rarity" /></div>
							<div>Durability:<br /><input type="number" min=0 step=1 name="durability" /></div>
							<div>Loot Sound:<br /><input type="text" name="loot_sound" /></div>
							<div>Icon:<br /><input type="text" name="icon" /></div>
							<div>Hit sound:<br /><input type="text" name="hit_sound" /></div>
							<div>Type:<br /><select name="category"><!-- Category listing here --></select></div>
									
							<label><input type="checkbox" name="colorable" value="1" /> Tintable</label><br />
				
						</div>

						<div class="flexTwoColumns">
							<div>
								Dye:<br /><input type="text" style="width:auto" name="color_tag" />
								<input type="color" name="color" />
							</div>
							<div>
								Base color:<br /><input type="text" style="width:auto" name="color_tag_base" />
								<input type="color" name="color_base" />
							</div>
						</div>

						Slots:
						<div class="slots"><!-- Slots here --></div>
						<br />
						Description:<br />
						<textarea name="description"><!-- Description here --></textarea><br />
						Tags: <br />
						<textarea name="tags"></textarea><br />
						<br />
						Effects JSON - <input type="button" class="autogen yellow" value="Auto Generate Stats for Level" /><br />
						Quick Stats: <span class="quickStats"></span>
						<textarea name="wrappers" style="width:100%; height:20vh;"><!-- Wrapper editor here --></textarea><br />

						<input type="submit" value="Save" class="green"> 						
						
					</form></div>
				`;
			})
			.setProperties(function(){
				
				const library = this.getTabDom('Library')[0];
				const editor = this.getTabDom('Editor')[0];

				this.library = {
					title : library.querySelector('h3.title'),
					listing : library.querySelector('div.listing'),
					create : library.querySelector('input.create'),
					back : library.querySelector('input.back'),
				};
				this.editor = {
					form : editor.querySelector('form.saveAsset'),
				};

				const getEl = query => this.editor.form.querySelector(query);

				// Create the random slots array
				const randslot = this.editor.form.querySelector('select[name=randSlot]');
				const equipSlots = this.editor.form.querySelector('div.slots');
				for( let i in Asset.Slots ){

					if( Asset.Slots[i] === Asset.Slots.none )
						continue;

					let opt = document.createElement('option');
					randslot.append(opt);
					opt.value = opt.innerText = i;

					opt = document.createElement('label');
					equipSlots.append(opt);
					opt.innerText = i+' ';
					const checkbox = document.createElement('input');
					opt.prepend(checkbox);
					checkbox.type = 'checkbox';
					checkbox.name = 'slots';
					checkbox.value = Asset.Slots[i];
					
				}
				
				const catslot = this.editor.form.querySelector('select[name=category]');
				for( let cat in Asset.Categories ){
					
					const opt = document.createElement('option');
					catslot.append(opt);
					opt.value = cat;
					opt.innerText = Asset.CategoriesNames[cat];

				}



				this._player = null;
				this._asset = null;

				// Static events
				this.library.back.addEventListener('click', () => {
					StaticModal.set('player', this._player);
				});
				this.library.create.addEventListener('click', () => {

					StaticModal.setWithTab('assetLibrary', 'Editor', undefined, new Asset());

				});


				// Saves an asset
				this.editor.form.addEventListener('submit', event => {
					event.stopImmediatePropagation();
					event.preventDefault();

					const root = this.editor.form;
					

					const a = this._asset;
		
					a.label = getEl("input[name=label]").value.trim();
					a.name = getEl("input[name=name]").value.trim();
					a.shortname = getEl("input[name=shortname]").value.trim();
					a.level = parseInt(getEl("input[name=level]").value) || 0;
					a.durability_bonus = parseInt(getEl("input[name=durability_bonus]").value) || 0;
					a.weight = parseInt(getEl("input[name=weight]").value) || 0;
					a.rarity = parseInt(getEl("input[name=rarity]").value) || 0;
					a.loot_sound = getEl("input[name=loot_sound]").value;
					a.category = getEl("select[name=category]").value;
					a.icon = getEl("input[name=icon]").value;
					a.colorable = getEl("input[name=colorable]").checked;
					a.color = getEl("input[name=color]").value;
					a.color_base = getEl("input[name=color_base]").value;
					a.color_tag = getEl("input[name=color_tag]").value;
					a.color_tag_base = getEl("input[name=color_tag_base]").value;
					a.hit_sound = getEl("input[name=hit_sound]").value;
					
					if( a.parent )
						a.durability = parseInt(getEl("input[name=durability]").value) || 0;
					
					
					a.slots = [];
					root.querySelectorAll('input[name=slots]').forEach(el => {
						if( el.checked )
							a.slots.push(el.value);
					});
					
					a.description = getEl("textarea[name=description]").value.trim();
					a.tags = getEl("textarea[name=tags]").value.trim().split(' ').filter(el => el !== "").map(el => 'as_'+el.toLowerCase());
					
					try{
						const wrappers = JSON.parse(getEl("textarea[name=wrappers]").value.trim());
						a.wrappers = wrappers.map(el => {
							const out = new Wrapper(el, a.parent);
							out.victim = a.parent.id;
							return out;
						});
					}catch(err){
						console.error("Unable to save, invalid JSON: ", err);
						return false;
					}
		
					if( a.parent ){
		
						a.repair(0);	// Makes sure durability doesn't go above max
						let owner = getEl("select[name=owner]").value;
						let newOwner = game.getPlayerById(owner);
						if( owner !== a.parent.id && newOwner ){

							// Creates a clone
							newOwner.addAsset(a);
							// Remove form old owner
							a.parent.destroyAsset(a.id);
						}
						
					}
		
					// If custom isn't set (on new/randomized assets, this isn't set), add it to library
					if( !a._custom ){

						a._custom = true;
						game.addToLibrary(a);

					}

					game.save();
					if( a.parent )
						StaticModal.set('inventory');
					else
						StaticModal.setWithTab('assetLibrary', 'Library', game.getMyActivePlayer());

				});

				// Draws the stats in a human readable format
				this.updateEffectStats = () => {
					try{


						let wrappers = JSON.parse(getEl("textarea[name=wrappers]").value.trim()).map(el => new Wrapper(el));
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
						getEl("span.quickStats").innerHTML = out;

					}catch(err){
						console.error(err);
					}
				};

				// Auto stats generator button
				getEl("input.autogen").addEventListener('click', () => {

					let slots = [];
					this.editor.form.querySelectorAll("input[name=slots]:checked").forEach(el => slots.push(el.value));

					let rarity = parseInt(getEl("input[name=rarity]").value) || 0;
		
					let wrapper = Asset.generateStatWrapper(slots.length, 0, rarity);
					getEl("textarea[name=wrappers]").value = JSON.stringify([wrapper.save("mod")], null, 4);
					this.updateEffectStats();
		
				});

				// Wrapper JSON validator
				getEl("textarea[name=wrappers]").addEventListener('change', event => {
					
					let val = event.currentTarget.value.trim();
					try{

						val = JSON.parse(val);
						event.currentTarget.value = JSON.stringify(val, null, 4);
						this.updateEffectStats();

					}catch(err){

						let nr = +err.message.split(' ').pop();
						if( !isNaN(nr) ){

							event.currentTarget.focus();
							event.currentTarget.selectionEnd = event.currentTarget.selectionStart = nr;

						}
						alert(err);

					}

				});



				getEl("input.generateRandom").addEventListener('click', () => {

					let ass = Asset.generate(
						getEl("select[name=randSlot]").value,
						parseInt(getEl("input[name=level]").value) || 0, 
						undefined, 
						undefined, 
						parseInt(getEl("input[name=rarity]").value) || 0
					);

					if(!ass)
						return;
					
					this._asset = ass;
					ass._generated = false;	// Make it insert on save

					this.refresh(true);	// Do a clean refresh, we don't need args
		
				});
				


			})
			.setDraw(async function( player, asset ){

				

				if( player instanceof Player )
					this._player = player;
								
				if( !this._player )
					return;
					
				if( asset instanceof Asset )
					this._asset = asset;

				// Don't set _custom on the asset because it's needed for saving
				if( !(this._asset instanceof Asset) )
					this._asset = new Asset();

				asset = this._asset;

				// Update library
				const handleAssetClick = event => {

					let id = event.currentTarget.dataset.id,
						assetObj = lib[id]
					;
					if(event.ctrlKey){

						if( !event.currentTarget.classList.contains('custom') ){
							
							game.ui.modal.addError("Can't delete a built in asset");
							return false;

						}

						game.removeFromLibrary(assetObj);
						this.refresh();
						game.ui.setTooltip();
						game.save();

					}

					else if( event.shiftKey ){

						let obj = assetObj;
						// Shift clicking a built in asset makes a copy
						if( !event.currentTarget.classList.contains('custom') ){

							obj = obj.clone();
							// Generate a new ID and label
							obj.g_resetID();
							obj.label = obj.id;

						}
							
						StaticModal.setWithTab('assetLibrary', 'Editor', player, obj);						
						game.ui.setTooltip();

					}

					else if(player.addLibraryAsset(id)){

						
						game.save();
						StaticModal.set('inventory');
						game.ui.draw();
						game.ui.setTooltip();

					}

				};

				let lib = glib.getFull('Asset');
				let divs = [];
				for( let id in lib ){

					let asset = lib[id];
					const div = await StaticModal.getGenericAssetButton(asset);
					div.dataset.id = asset.label;
					if( asset._custom )
						div.classList.add('custom');
					divs.push(div);
					div.addEventListener('click', handleAssetClick);

				}
				this.library.listing.replaceChildren(...divs);

				// Update the fields
				if( asset ){

					const a = asset;

					const getFields = qs => this.editor.form.querySelectorAll(qs);
					const getField = qs => this.editor.form.querySelector(qs);

					getField('input[name=label]').value = a.label;
					getField('input[name=name]').value = a.name;
					getField('input[name=shortname]').value = a.shortname;
					getField('input[name=level]').value = parseInt(a.level) || 1;
					getField('input[name=durability_bonus]').value = parseInt(a.durability_bonus) || 0;
					getField('input[name=weight]').value = parseInt(a.weight) || 0;
					getField('input[name=rarity]').value = parseInt(a.rarity) || 0;

					getField('input[name=durability]').parentNode.classList.toggle('hidden', !a.parent);
					getField('input[name=durability]').value = parseInt(a.durability) || 0;

					getField('input[name=loot_sound]').value = a.loot_sound;
					getField('input[name=icon]').value = a.icon;
					getField('input[name=hit_sound]').value = a.hit_sound;

					getFields('select[name=category] option').forEach(el => el.selected = (a.category === el.value));

					getField('input[name=colorable]').checked = Boolean(a.colorable);
					getField('input[name=color_tag]').value = a.color_tag;
					getField('input[name=color]').value = a.color;
					getField('input[name=color_tag_base]').value = a.color_tag_base;
					getField('input[name=color_base]').value = a.color_base;
					
					getFields('input[name=slots]').forEach(el => {
						
						const val = Asset.Slots[el.value];
						el.checked = Boolean(~a.slots.indexOf(val));

					});
					
					getField('textarea[name=description]').value = a.description;
					getField('textarea[name=tags]').value = a.tags.map(el => el.substr(3)).join(' ');

					getField('textarea[name=wrappers]').value = JSON.stringify(a.wrappers.map(el => el.save("mod")), null, 4);


					getField('div.parentInfo').classList.toggle('hidden', !a.parent);
					if( a.parent ){
						
						const players = game.getEnabledPlayers();
						let divs = [];
						for( let player of players ){
							
							const div = document.createElement('option');
							divs.push(div);
							div.value = player.id;
							if( a.parent.id === player.id )
								div.selected = true;
							div.innerText = player.name;
							
						}
						getField('select[name=owner]').replaceChildren(...divs);

					}

					this.updateEffectStats();

				}

			});
		// Help
		this.add(new this("help", "Help"))
			.addRefreshOn(["players"])
			.addTab("Inventory", () => {
				return `
					<h3>Map Controls</h3>
					<table>
						<tr>
							<td>Click+drag</td>
							<td>Rotate map</td>
						</tr>
						<tr>
							<td>RightClick+drag</td>
							<td>Zoom</td>
						</tr>
						<tr>
							<td>Mousewheel</td>
							<td>Zoom</td>
						</tr>
					</table>

					<h3>Hotkeys</h3>
					<table>
						<tr>
							<td>Space</td>
							<td>Toggle combat UI</td>
						</tr>
						<tr>
							<td>i</td>
							<td>Toggle inventory</td>
						</tr>
						<tr>
							<td>l</td>
							<td>Toggle quest log</td>
						</tr>
						<tr>
							<td>1-9</td>
							<td>Use action</td>
						</tr>
						<tr>
							<td>e</td>
							<td>End turn</td>
						</tr>
						<tr>
							<td>q</td>
							<td>Select multi target</td>
						</tr>
					</table>
				`;
			})
			.setProperties(function(){
				

			})
			.setDraw(async function(){

				
			});

	}


	// Tools:
	static async getGenericAssetButton( item, cost = 0, additionalClassName = '', hideText = false ){

		const compact = hideText === 'compact';
		if( compact )
			additionalClassName += ('compact '+additionalClassName).trim();
		
		if( additionalClassName )
			additionalClassName = additionalClassName.split(' ');

		const div = document.createElement('div');
		div.classList.add(
			'item',  
			Asset.RarityNames[item.rarity], 
			'tooltipParent'
		);

		if( additionalClassName && additionalClassName.length )
			div.classList.add(...additionalClassName);
		if( item.equippable() )
			div.classList.add('equippable');
		if( item.equipped )
			div.classList.add('equipped');
		if( item.durability <= 0 )
			div.classList.add('broken');

		div.dataset.id = item.id;

		let sub = await item.getImgElement();
		div.append(sub);

		if( !hideText ){

			sub = document.createElement('span');
			sub.innerHTML = 
				(item.equipped ? '<strong>' : '')+
				(item.stacking && item._stacks > 1 ? item._stacks+'x ' : '')+
				esc(item.name)+
				(item.equipped ? ' ['+item.slots.map(el => el.toUpperCase()).join(' + ')+']</strong>' : '')
			;
			div.append(sub);

		}

		if( !compact ){

			sub = document.createElement('div');
			sub.classList.toggle('cost', true);

			const coins = Player.calculateMoneyExhange(cost);

			for( let i in coins ){

				const amt = coins[i];
				if( amt ){

					sub.innerHTML += 
						'<span style="color:'+Player.currencyColors[i]+';">'+
							amt+
							Player.currencyWeights[i].substr(0,1)+
						"</span> "
					;

				}

			}
			div.prepend(sub);

		}
		else{

			sub = document.createElement('div');
			sub.classList.toggle('quant', true);
			sub.innerHTML = cost;
			div.append(sub);

		}

		sub = document.createElement('div');
		sub.classList.toggle('tooltip');
		sub.innerHTML = item.getTooltipText();
		div.append(sub);

		return div;

	}



}

StaticModal.lib = {};
StaticModal.built = false;
StaticModal.main = null;
StaticModal.active = null;