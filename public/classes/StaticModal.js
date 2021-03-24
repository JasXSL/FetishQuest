import UI from './UI.js';
import Player from './Player.js';
import Asset from './Asset.js';
import Action from './Action.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import { QuestReward } from './Quest.js';
import Shop from './Shop.js';

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

		this.drawn = false;			// Set to true after the first draw
		this.drawing = false;		// Actively updating the dom

		this.activeTab = 'default';
		this.tabs = {};
		this.refreshOn = [];	// Array of sub objects [{path:(arr)path, fn:(opt)fn}...]. Checked when game data changes to have a callback.
		this.args = [];			// Args of the last time this was opened

		$("> div.header > div.close", this.dom).on('click', event => {
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
	
	close(){
		this.constructor.set();
	}

	async refresh(){

		if( this.drawing )
			return false;

		this.drawing = true;
		const out = await this.onDraw.apply(this, this.args);
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

	static close(){
		this.active = null;
		// Close everything
		this.main.toggleClass("hidden", true);
		Object.values(this.lib).map(modal => modal.dom.toggleClass("hidden", true));
	}

	static async refreshActive(){

		if( !this.active )
			return;

		const out = await this.active.refresh();
		game.ui.bindTooltips();
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
			if( event.target === this.main[0] )
				this.close();
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
					<div class="slots"></div>
					<div style="display:flex; width:100%; justify-content:space-between">
						<div class="left">
							Unlocked:
							<div class="available"></div>
						</div>
						<div class="right">
							Purchase:
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
				for( let i=0; i<6; ++i )
					html += UI.Templates.actionButton;
				$("> div.slots", actives).html(html);

				this.activeButtons = $("> div.slots > div.action", actives);
				this.purchasable = $("div.right > div.purchasable", actives);
				this.available = $("div.left > div.available", actives);

			})
			.setDraw(function( gymPlayer ){

				const player = game.getMyActivePlayer();
				if( !player )
					return;

				this.activeButtons.toggleClass('hidden', true).toggleClass("detrimental", false);
				
				// Active actions
				const numSlots = player.getNrActionSlots();
				for( let i = 0; i<numSlots; ++i ){

					const el = $(this.activeButtons[i]);
					el.toggleClass("hidden", false).toggleClass('button', true);

					let action = player.getActionAtSlot(i);
					if( action )
						UI.setActionButtonContent(el, action, player);
					else
						el.toggleClass("tooltipParent", false);
					
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
			.addTab("Quests", () => {
				return `
					<div class="left"></div>
					<div class="right"></div>
				`;
			})
			.setProperties(function(){

				const main = this.main = this.getTabDom('Quests');
				this.right = $("div.right", main);
				this.left = $("div.left", main);
				
			})
			.setDraw(function(){

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

				if( !selectedQuest.hide_rewards ){

					const inv = this.right[0].querySelector('div.assets.inventory');
					const rewards = selectedQuest.getRewards();
					const assets = rewards.filter(el => el.type === QuestReward.Types.Asset || el.type === QuestReward.Types.Action);
					for( let reward of assets ){

						const asset = reward.data;
						const viableToMe = me && reward.testPlayer(me);
						inv.appendChild(game.ui.getGenericAssetButton(asset, 0, !viableToMe ? 'disabled' : ''));
						
					}

				}

				$("> div[data-id]", this.left).on('click', function(){
					
					let id = $(this).attr('data-id');
					localStorage.selected_quest = id;
					StaticModal.refreshActive();

				});

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

					ui.modal.set(
						'<p>This setting requires a browser refresh. Would you like to refresh now?</p>'+
						'<input type="button" value="Yes" class="yes" />'+	
						'<input type="button" value="No" />'
					);

					$("#modal input[type=button]").on('click', event => {
						const targ = $(event.currentTarget);
						if( targ.is('.yes') )
							window.location.reload();
						ui.modal.close();
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
						<div class="expBar"></div>
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
			.setDraw(function( player ){

				
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
					cDivs.expBar.html(
						player.level < Player.MAX_LEVEL ? 
							game.ui.buildProgressBar(player.experience+'/'+player.getExperienceUntilNextLevel()+' EXP', player.experience/player.getExperienceUntilNextLevel()) : 
							''
					);
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

							const div = game.ui.getGenericAssetButton(asset, undefined, undefined, true);
							div.classList.toggle('equipmentSlot', true);
							eq.appendChild(div);

							if( game.is_host ){

								div.addEventListener('click', event => {
									if( event.shiftKey )
										game.ui.drawAssetEditor( asset, player );
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
					const tokenBase = baseElement.querySelector('div.altCurrency'),
						tokenElements = baseElement.querySelectorAll('div.altCurrency > div')
					;

					// only buy shows tokens
					if( tokenBase ){

						tokenElements.forEach(el => el.classList.toggle('hidden', true));

						const tokens = shop.getTokenAssets();
						for( let i = 0; i < tokens.length; ++i ){

							const token = tokens[i];
							let div = tokenElements[i];
							if( !div || div.dataset.id !== token.id ){

								const created = await StaticModal.getGenericAssetButton(token, myPlayer.numAssets(token.label), '', 'compact');
								// Already exists, replace
								if( div )
									div.parentNode.replaceChild(div, created);
								// Doesn't exist, add
								else
									tokenBase.append(created);

								div = created;

							}
							
							div.classList.toggle('hidden', false);

						}

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
		// 

		

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