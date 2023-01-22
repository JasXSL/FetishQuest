import UI from './UI.js';
import Player from './Player.js';
import Asset from './Asset.js';
import Action from './Action.js';
import PlayerTemplate from './templates/PlayerTemplate.js';
import { QuestReward } from './Quest.js';
import Shop from './Shop.js';
import Mod from './Mod.js';
import Game from './Game.js';
import { Effect, Wrapper } from './EffectSys.js';
import { GfPlayer } from './NetworkManager.js';
import GameEvent from './GameEvent.js';
import Condition from './Condition.js';
import AudioTrigger from './AudioTrigger.js';
import stdTag from '../libraries/stdTag.js';

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
		this.closeOnCellMove = false;

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

		this.tabs[label].label.on('click', event => {
			game.uiAudio( "tab_select", 0.5, event.target );
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

	setCloseOnCellMove( close ){
		this.closeOnCellMove = Boolean(close);
		return this;
	}




	// STATIC

	// Sets the active modal
	static async set( id, ...args ){

		this.close( false, true );
		if( !id )
			return true;

		const obj = this.lib[id];
		if( !obj )
			throw 'Modal not found: '+id;
		
		game.setInMenu(1); // If you want you can differentiate between menus here later by assigning a numeric ID to each menu

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
	static close( force, sendUpdate = true ){

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
		game.ui.setTooltip();
		Object.values(this.lib).map(modal => modal.dom.toggleClass("hidden", true));

		if( sendUpdate )
			game.setInMenu(0);	

	}

	static async refreshActive(){

		if( !this.active )
			return;

		const out = await this.active.refresh();
		game.ui.bindTooltips();

		// might still not have because of async
		if( !this.active )
			return;

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


	// This is where everything is built
	// Only gets called once when the DOM loads. Builds all the modal bases
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

		$('#groupFinder').off('click').on('click', event => {

			this.setWithTab('mainMenu', 'Group Finder');
			game.uiAudio( "tab_select", 0.5, event.target );

		});	
	
		const self = this;


		// Handle group finder auto join
		// This is set in StaticModal
		if( localStorage.gfAutoJoin )
			Game.net.joinGroupFinder();
		
		// Helper for the bottom right badge
		const refreshMasterBadge = () => {

			const isInGroupFinder = Game.net.isInGroupFinder();

			// Update the global button
			let newNotes = 0;
			const players = Game.net.getGroupFinderPlayers();
			for( let player of players )
				newNotes += player.unread;

			// Bottom right button

			const button = document.getElementById('groupFinder');
			const count = document.querySelector('#groupFinder > div.newItems');
			const bubble = document.getElementById('lastMessage');
			const bubbleText = document.querySelector('#lastMessage > div.content');
			button.classList.toggle('grey', !isInGroupFinder);
			button.classList.toggle('newItems', Boolean(newNotes));
			count.classList.toggle('hidden', (!newNotes && !players.length));
			count.innerText = newNotes || players.length;
			
			// Gets last message
			let lastMessage = Game.net.getGroupFinderLastMessage();
			const fadeTime = 100000;	// How long to show the message bubble
			const fadesIn = lastMessage ? fadeTime-(Date.now()-lastMessage.time) : -1;
			const showMessage = lastMessage && lastMessage.parent.unread && fadesIn > 0;
			bubble.classList.toggle('hidden', !showMessage);
			
			clearTimeout(bubble._timeout);
			if( showMessage ){

				bubble.classList.toggle('instant', false);
				bubbleText.textContent = lastMessage.parent.name.substr(0, 12)+": "+lastMessage.message.substr(0,32)+"...";
				bubble._timeout = setTimeout(() => bubble.classList.toggle('hidden', true), fadesIn);
				$(bubble).off('click').on('click', event => {
					event.stopImmediatePropagation();
					clearTimeout(bubble._timeout);
					bubble.classList.toggle('hidden', true);
					bubble.classList.toggle('instant', true);
				});	

			}

			document.title = (newNotes ? '('+newNotes+') ' : '')+'FetishQuest';


		};
		Game.net.bind('gf', refreshMasterBadge);
		Game.net.bind('disconnect', refreshMasterBadge);


		// Sleep select
		this.add(new this("sleepSelect", "Rest"))
			.setCloseOnCellMove(true)
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
			.setCloseOnCellMove(true)
			.addRefreshOn(["players"])
			.addTab("Actions", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
						</div>
					</div>
					<div style="display:flex; width:100%; justify-content:space-between">
						<div class="left titleSpan">
							<span>Learned</span>
							<div class="available"></div>
						</div>
						<div class="right titleSpan">
							<span>Not Learned</span>
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

				this.money = $('div.myMoney', actives)[0];
				this.purchasable = $("div.right > div.purchasable", actives);
				this.available = $("div.left > div.available", actives);

			})
			.setDraw(function( gymPlayer ){

				const player = game.getMyActivePlayer();
				if( !player )
					return;

				self.generateWallet(this.money);

				// Inactive learned actions
				const inactive = player.actions.filter(action => {
					return !action.std && !action.hidden && !action.semi_hidden;
				}),
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
					UI.setActionButtonContent(el, abil, player, undefined, true);
					

				}

				for( let i =0; i<learnable.length; ++i ){

					const el = learnableEls[i],
						abil = learnable[i].getAction(),
						parent = $(el).parent();
						
					UI.setActionButtonContent(el, abil, player, undefined, true);

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
					
					
					html += '<div class="assets inventory inv"></div>';
					html += '<div class="assets inventory actions"></div>';


					if( selectedQuest.rewards_exp )
						html += '<div class="item">'+selectedQuest.rewards_exp+' Exp</div>';
					

				}

				this.right.html(html);

				if( selectedQuest && !selectedQuest.hide_rewards ){

					const inv = this.right[0].querySelector('div.assets.inv');
					const act = this.right[0].querySelector('div.assets.actions');
					const rewards = selectedQuest.getRewards();
					let assets = rewards.filter(el => el.type === QuestReward.Types.Asset && (!me || el.testPlayer(me)));
					let actions = rewards.filter(el => el.type === QuestReward.Types.Action && (!me || el.testPlayer(me)));
					for( let reward of assets ){

						const asset = reward.data;
						inv.appendChild(await StaticModal.getGenericAssetButton(asset, 0));

					}

					for( let reward of actions ){

						let asset = reward.data;
						const tmp = document.createElement('template');
						tmp.innerHTML = UI.Templates.actionButton;
						let div = tmp.content.firstChild;
						div.classList.toggle('action', true);
						act.appendChild(div);
						UI.setActionButtonContent(div, asset, me || game.players[0]);

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
					Difficulty: <input type="range" min=-5 max=5 step=1 value=0 name="difficulty" />		
					Preferred enemy sex: <div class="preferredGender labelFlex"></div>
				`;
			})
			.addTab("DM", () => {
				return `
					<div class="option button" data-action="toggleDMTools"><input type="checkbox" /><span> Show DM Tools</span></div>
					<div class="option button" data-action="addPlayer">+ Add Player</div>
					<div class="option button" data-action="importPlayer">Import Player<input class="charImport hidden" accept=".fqchar" type="file" /></div>
					<div class="option button" data-action="fullRegen">Restore HPs</div>
					<div class="option button" data-action="toggleBattle">Start Battle</div>
				`;
			})
			.addTab("Video", () => {
				return `
					<div class="option button" data-action="enableAI"><input type="checkbox" title="Toggle AI generated NPC art." /><span> AI Art</span></div>
					<div class="option button" data-action="enableBubbles"><input type="checkbox" /><span> Bubble Chat</span></div>
					<div class="option button" data-action="enableShadows"><input type="checkbox" /><span> Shadows (Experimental, requires refresh)</span></div>
					<div class="option button" data-action="enableAA"><input type="checkbox" /><span> Antialiasing</span></div>
					<div class="option button" data-action="enableFpsMeter"><input type="checkbox" /><span> FPS Meter</span></div>
					<div class="option cacheLevel" style="margin-top:1vmax" title="Makes returning to previously visited areas faster, but increases memory use.">
						<input type="range" style="width:50%; vertical-align:top" min=10 max=100 step=10 /><span></span> Cache Levels
					</div>
					<div class="option logLevel" style="margin-top:1vmax" title="Nr of combat texts to log">
						<input type="range" style="width:50%; vertical-align:top" min=100 max=1000 step=100 /><span></span> Combat Log Size
					</div>
				`;
			})
			.addTab("Audio", () => {
				return `
					<strong>Main Volume:</strong> <input type="range" min=0 max=100 step=1 name="masterSoundVolume" /><br />
					Ambient: <input type="range" min=0 max=100 step=1 name="ambientSoundVolume" />
					Voice: <input type="range" min=0 max=100 step=1 name="voiceSoundVolume" />
					Music: <input type="range" min=0 max=100 step=1 name="musicSoundVolume" /><br />
					FX: <input type="range" min=0 max=100 step=1 name="fxSoundVolume" />
					UI: <input type="range" min=0 max=100 step=1 name="uiSoundVolume" /><br />
				`;
			})
			.addTab("Online", () => {
				
				return `
					<div class="connected center">
						<p class="description hideIfNotHost">Players can join  your game with the following URL:</p>
						<div class="netgameLink b hideIfNotHost"></div>
						<input type="button" class="red disconnect" value="Leave Game" />
						<div class="connectedPlayers"></div>
						<label class="hideIfNotHost">Mute spectators: <input type="checkbox" class="muteSpectators" /></label><br />
					</div>
					<div class="disconnected">
						<p class="description">If you want, you can put this session online and invite your friends.</p>
						<input type="button" class="blue hostgame" value="Put This Session Online" />
					</div>
				`;

			})
			.setProperties(function(){
				
				const ui = game.ui;
				const gameplay = this.getTabDom('Gameplay');
				this.gameplay = {
					difficulty : $("input[name=difficulty]", gameplay),
					gender : $("div.preferredGender", gameplay)
				};

				const dm = this.getTabDom('DM');
				this.dm = {
					toggle : $("div[data-action=toggleDMTools]", this.getTabDom("DM")),
					addPlayer : $("div[data-action=addPlayer]", this.getTabDom("DM")),
					fullRegen : $("div[data-action=fullRegen]", this.getTabDom("DM")),
					toggleBattle : $("div[data-action=toggleBattle]", this.getTabDom("DM")),
					importPlayer : dm[0].querySelector('div[data-action=importPlayer]'),
					importPlayerInput : dm[0].querySelector('input.charImport'),
				};

				this.video = {
					enableBubbles : $("div[data-action=enableBubbles]", this.getTabDom("Video")),
					enableShadows : $("div[data-action=enableShadows]", this.getTabDom("Video")),
					enableAA : $("div[data-action=enableAA]", this.getTabDom("Video")),
					enableFpsMeter : $("div[data-action=enableFpsMeter]", this.getTabDom("Video")),
					cacheLevel : $("div.cacheLevel input", this.getTabDom("Video")),
					logLevel : $("div.logLevel input", this.getTabDom("Video")),
					cacheLevelSpan : $("div.cacheLevel span", this.getTabDom("Video")),
					logLevelSpan : $("div.logLevel span", this.getTabDom("Video")),
					enableAI : $("div[data-action=enableAI]", this.getTabDom("Video"))
				};

				const netgame = this.getTabDom("Online")[0];
				this.netgame = {
					connected : netgame.querySelector('div.connected'),
					disconnected : netgame.querySelector('div.disconnected'),
					connectedDesc : netgame.querySelector('div.connected p.description'),
					disconnectedDesc : netgame.querySelector('div.disconnected p.description'),
					netgameLinkB : netgame.querySelector('div.connected div.netgameLink.b'),
					hostButton : netgame.querySelector('input.hostgame'),
					disconnectButton : netgame.querySelector('input.disconnect'),
					connectedPlayers : netgame.querySelector('div.connectedPlayers'),
					muteSpectators : netgame.querySelector('input.muteSpectators'),
				};
				

				// Bind events
				
				// Gameplay
				this.gameplay.difficulty.on('input', event => {
					game.difficulty = +$(event.currentTarget).val();
					game.save();
				});

				// DM
				this.dm.toggle.on('click', event => {
					localStorage.hide_dm_tools = +game.ui.showDMTools();
					game.ui.updateDMTools();
					$("input", event.currentTarget).prop("checked", game.ui.showDMTools());
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
				this.video.enableAI.on('click', event => {

					const hide = Boolean(!+localStorage.disable_ai);
					localStorage.disable_ai = +hide;

					console.log($("input", event.currentTarget));
					$("input", event.currentTarget).prop("checked", !hide);
					Player.checkEnableAI();
					game.ui.draw();

				});
				this.video.enableAA.on('click', event => {

					const show = Boolean(!+localStorage.aa)
					localStorage.aa = +show;
					$("input", event.currentTarget).prop("checked", show);
					game.renderer.aa.enabled = show;

				});
				this.video.enableFpsMeter.on('click', event => {

					event.preventDefault();
					const show = !(+localStorage.fps);
					localStorage.fps = +show;
					$("input", event.currentTarget).prop("checked", show);
					game.renderer.toggleFPS(show);

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
						game.ui.modal.close();
					});

				});
				this.video.cacheLevel.on('input', event => {
					const val = parseInt($(event.currentTarget).val()) || 50;
					localStorage.cache_level = val;
					this.video.cacheLevelSpan.text(val);
				});
				this.video.logLevel.on('input', event => {
					const val = parseInt($(event.currentTarget).val()) || 100;
					localStorage.log_size = val;
					this.video.logLevelSpan.text(val);
					Game.LOG_SIZE = val;
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

				this.dm.importPlayer.addEventListener('click', () => {
					this.dm.importPlayerInput.click();
				});

				this.dm.importPlayerInput.addEventListener('change', async event => {

					try{

						const player = await Player.importFile(event);
						if( !player )
							throw 'Invalid player file';

						game.addPlayer(player);

					}
					catch(err){
						game.ui.modal.addError('Failed to import: '+err);
					}

					this.dm.importPlayerInput.value = '';

				});

				// Handle labels
				for( let i in Game.Genders )
					this.gameplay.gender[0].innerHTML += '<label><input type="checkbox" value="'+Game.Genders[i]+'" /> '+i+'</label>';					
				const genderInputs = [...this.gameplay.gender[0].querySelectorAll('input')];
				this.gameplay.genderInputs = genderInputs;
				const onGenderInputChanged = () => {
					let out = 0;
					genderInputs.forEach(el => {
						if( el.checked )
							out = out | parseInt(el.value);
					});
					game.genders = out;
					game.save();
				};
				for( let i of genderInputs )
					i.addEventListener('change', onGenderInputChanged);

			})
			.setDraw(function(){

				const ui = game.ui;

				$("input", this.dm.toggle).prop('checked', ui.showDMTools());
				this.dm.toggleBattle.text(game.battle_active ? 'End Battle' : 'Start Battle').toggleClass('hidden',  game.teamsStanding().length < 2 && !game.battle_active);

				
				$("input", this.video.enableBubbles).prop('checked', !+localStorage.hide_bubbles);
				$("input", this.video.enableAI).prop('checked', !+localStorage.disable_ai);
				$("input", this.video.enableShadows).prop('checked', Boolean(+localStorage.shadows));
				$("input", this.video.enableAA).prop('checked', Boolean(+localStorage.aa));
				$("input", this.video.enableFpsMeter).prop('checked', Boolean(+localStorage.fps));
				const cacheLevel = parseInt(localStorage.cache_level) || 50;
				this.video.cacheLevel.val(cacheLevel);
				this.video.cacheLevelSpan.text(cacheLevel);
				
				this.video.logLevel.val(Game.LOG_SIZE);
				this.video.logLevelSpan.text(Game.LOG_SIZE);

				
				for( let i of this.gameplay.genderInputs)
					i.checked = (!game.genders || game.genders&parseInt(i.value));

				this.gameplay.difficulty.val(Math.round(game.difficulty) || 0);

				const knobs = ['ambient','fx','music','ui','voice'];
				const audio = this.getTabDom("Audio");
				for( let knob of knobs ){
					$("input[name="+knob+"SoundVolume]", audio).val(Math.round(game['audio_'+knob].volume*100));
				}
				$("input[name=masterSoundVolume]", audio).val(Math.round(game.getMasterVolume()*100));

				
				this.gameplay.difficulty.prop('disabled', !game.is_host);
				this.gameplay.genderInputs.map(el => el.disabled = !game.is_host);
				// Netgame
				const isConnected = Game.net.isInNetgame();
				if( isConnected ){

					const isHosting = game.initialized && game.is_host;
					if( isHosting ){

						this.netgame.netgameLinkB.innerText = 'https://'+window.location.hostname+'/#net/'+Game.net.public_id;

					}

					let divs = [];
					for( let player of Game.net.players ){

						const div = document.createElement('div');
						div.classList.add('netgame', 'player');
						div.innerText = player.name;
						divs.push(div);

					}
					this.netgame.connectedPlayers.replaceChildren(...divs);

					// LocalStorage stores strings, so we can't store true/false
					this.netgame.muteSpectators.checked = Boolean(+localStorage.muteSpectators);

					this.netgame.connected.classList.toggle('host', isHosting);

				}

				this.netgame.disconnected.classList.toggle('hidden', isConnected);
				this.netgame.connected.classList.toggle('hidden', !isConnected);
				

				// First load
				if( !this.drawn ){

					this.netgame.hostButton.addEventListener('click', async event => {

						await Game.net.hostGame();
						this.refresh();

					});

					this.netgame.disconnectButton.addEventListener('click', async event => {
						
						await Game.net.leaveNetgame();
						this.refresh();

					});
					this.netgame.muteSpectators.addEventListener('click', event => {

						localStorage.muteSpectators = +event.currentTarget.checked;
						game.mute_spectators = +localStorage.muteSpectators || 0;
						game.save();

					});

					Game.net.bind('*', (data, evt) => {
						this.refresh();
					});

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
					
					<div class="content">
						<p class="description"></p>
						<div class="export">
							<input type="button" value="Export" class="exportPlayer" />
						</div>
					</div>
					<div class="right cmContentBlock bgMarble">
						<div class="image"></div>
						<div class="expBar">
							<div class="progressBar">
								<div class="bar" style="width:0%;"><!-- Set width here base on percentage --></div>
								<span class="content"><!-- Progress bar text here --></span>
							</div>
						</div>
						<div class="equipment inventory"></div>
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
							<input type="text" name="spre" placeholder="Article a/an/some" style="width:18%" />
							<input type="text" name="species" placeholder="Species" style="width:80%" /><br />
							<input type="text" name="voice" placeholder="Voice" list="voices" style="width:33%" />
							<input type="text" name="he" placeholder="He pronoun" style="width:20%" />
							<input type="text" name="him" placeholder="Him pronoun" style="width:20%" />
							<input type="text" name="his" placeholder="His pronoun" style="width:20%" /><br />
							<select name="class"></select><br />
							Level:<br /><input type="number" name="level" min=1 step=1 /><br />
							<div>Size:<br /><input type="range" name="size" min=0 max=10 step=1 /></div>
							Image Dressed:<br /><input type="text" class="playerIcon" name="icon" placeholder="Image URL" /><br />
							Image Bottomless:<br /><input type="text" class="playerIcon" name="icon_upperBody" placeholder="Image URL" /><br />
							Image Topless:<br /><input type="text" class="playerIcon" name="icon_lowerBody" placeholder="Image URL" /><br />
							Image Naked:<br /><input type="text" class="playerIcon" name="icon_nude" placeholder="Image URL" /><br />

							<div class="flexThreeColumns">
								<div>HP<br /><input type="number" name="hp" placeholder="HP" min=0 step=1 /></div>
								<div>AP<br /><input type="number" name="ap" placeholder="AP" min=0 step=1 /></div>
								<div>MP<br /><input type="number" name="mp" placeholder="MP" min=0 step=1 /></div>
								<div>Arousal<br /><input type="number" name="arousal" placeholder="Arousal" min=0 step=1 /></div>
								<div>Team<br /><input type="number" name="team" placeholder="Team" min=0 step=1 /></div>
							</div>
							Tags (control+click to remove): <input type="button" class="addTag" value="Add Tag" /><br />
							<div class="tags flexFourColumns"></div>

							Description<br /><textarea name="description"></textarea>
							
							<div class="center">Non-sadistic <input type="range" name="sadistic" min=0 max=1 step=0.1 style="width:40%" /> Sadistic</div>
							<div class="center">Sub <input type="range" name="dominant" min=0 max=1 step=0.1 style="width:40%" /> Dom</div>
							<div class="center">Gay <input type="range" name="hetero" min=0 max=1 step=0.1 style="width:40%" /> Hetero</div>

							Kinks:
							<div class="kinks center">
								<select class="kinks" name="kinks"></select>
								<select class="kinks" name="kinks"></select>
							</div>

							<p><em>Note: When creating a player character you should leave these stats at 0, stats are derived from the class.</em></p>
							<h3>Avoidance:</h3>
							<div class="flexFourColumns secondaryStat sv">
								<div class="physical">Physical <input type="number" step=1 /></div>
								<div class="corruption">Corruption <input type="number" step=1 /></div>
								<div class="arcane">Arcane <input type="number" step=1 /></div>
							</div>
							<h3>Proficiency:</h3>
							<div class="flexFourColumns secondaryStat bon">
								<div class="physical">Physical <input type="number" step=1 /></div>
								<div class="corruption">Corruption <input type="number" step=1 /></div>
								<div class="arcane">Arcane <input type="number" step=1 /></div>
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
						`+this.generatePlayerLayerPreviewButtons()+`
					</div>
					<div class="hidden datalists"></div>
				`;
			})
			.setProperties(function(){

				const cDom = this.getTabDom('Character');
				

				this.randomizerOption = null;	// Last picked option in the randomizer

				this.character = {
					name : $("> h2.name", cDom),
					subName : $("> em.subName", cDom),
					description : $("> div.content > p.description", cDom),
					devtool : $("> div.devtool", cDom),

					right : $("> div.right", cDom),
					image : $("> div.right > div.image", cDom),
					expBar : $("> div.right > div.expBar", cDom),
					expBarBar : $("> div.right > div.expBar > div.progressBar div.bar", cDom),
					expBarText : $("> div.right > div.expBar > div.progressBar span.content", cDom),
					equipment : $("> div.right > div.equipment", cDom),
					secondaryStats : $("> div.right > div.secondaryStats", cDom),
					exportPlayer : $('input.exportPlayer', cDom),
				};

				const dDom = this.getTabDom('Edit');
				this.edit = {
					actions : $('div.actions', dDom),
					addAction : $('input.addAction', dDom),
					form : $('#playerEditor', dDom),
					formName : $('#playerEditor input[name=name]', dDom),
					formVoice : $('#playerEditor input[name=voice]', dDom),
					formSpre : $('#playerEditor input[name=spre]', dDom),
					formHe : $('#playerEditor input[name=he]', dDom),
					formHim : $('#playerEditor input[name=him]', dDom),
					formHis : $('#playerEditor input[name=his]', dDom),
					formSpecies : $('#playerEditor input[name=species]', dDom),
					formClass : $('#playerEditor select[name=class]', dDom),
					formLevel : $('#playerEditor input[name=level]', dDom),
					formSize : $('#playerEditor input[name=size]', dDom),
					formIcons : $("#playerEditor input.playerIcon", dDom),
					formDressed : $('#playerEditor input[name=icon]', dDom),
					formNude : $('#playerEditor input[name=icon_nude]', dDom),
					formUpperBody : $('#playerEditor input[name=icon_upperBody]', dDom),
					formLowerBody : $('#playerEditor input[name=icon_lowerBody]', dDom),
					formHP : $('#playerEditor input[name=hp]', dDom),
					formAP : $('#playerEditor input[name=ap]', dDom),
					formMP : $('#playerEditor input[name=mp]', dDom),
					formArousal : $('#playerEditor input[name=arousal]', dDom),
					formTeam : $('#playerEditor input[name=team]', dDom),
					formDescription : $('#playerEditor textarea[name=description]', dDom),
					formSadistic : $('#playerEditor input[name=sadistic]', dDom),
					formDominant : $('#playerEditor input[name=dominant]', dDom),
					formHetero : $('#playerEditor input[name=hetero]', dDom),
					formSecondaryStat : $('#playerEditor div.secondaryStat', dDom),
					formDeletePlayer : $('#playerEditor input.deletePlayer', dDom),
					image : $('> div.right > div.image', dDom),
					randomizer : $('div.randomizer',  dDom),
					randomizerSelect : $('div.randomizer > select', dDom),
					randomizerButton : $('div.randomizer > input', dDom),
					kinksSelects : $('select.kinks', dDom),
					tags : $('div.tags', dDom),
					tagList : $('div.datalists', dDom),
					layersDiv : $('> div.right > div.layers',dDom)
				};

				// Draws an action selector. Returns the ID clicked on (if you do)
				this.edit.drawPlayerActionSelector = (player, callback) => {
								
					let html = '';
					let libActions = Object.values(glib.getFull('Action'))
						.filter(el => el.name !== '%P%'); 

					libActions.sort((a, b) => {
						return a.name < b.name ? -1 : 1;
					});

					html+= '<div class="inventory tooltipShrink">';
						html += '<h3>Learn Action for '+esc(player.name)+'</h3>';
					for( let asset of libActions ){

						let id = asset.label;
						if( player.getActionByLabel(asset.label) )
							continue;
						
						
						html += '<div class="list item tooltipParent third" data-id="'+esc(id)+'">';
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


				this.onTagClick = event => {

					if( !event.ctrlKey && !event.metaKey )
						return;
					event.currentTarget.parentNode.remove();
					
				};
				this.addTag = tag => {
						
					if( typeof tag !== "string" )
						tag = '';

					tag = tag.split('_');
					tag.shift();
					tag = tag.join('_');
					const div = document.createElement("div");
					const input = document.createElement('input');
					input.type = 'text';
					input.value = tag;
					input.name = 'tag';
					input.classList.add('tag');
					input.setAttribute('list', 'newGameTags');
					input.addEventListener('click', this.onTagClick);
					div.append(input);
					this.edit.tags[0].append(div);
					
				};
				dDom[0].querySelector("input.addTag").addEventListener('click', this.addTag);

			})
			.setDraw(async function( player ){
				
				
				// Character tab
					// Toggle the whole bottom bar
					// If you add a second tab that non-DM can see, you'll want to only toggle the label itself
					this.getTabLabelDom('Edit').parent().toggleClass('hidden', !game.ui.showDMTools());
					const isEditor = this.activeTab === 'Edit';
					if( !game.ui.showDMTools() && isEditor )
						this.setActiveTab('Character');

					if( !(player instanceof Player) )
						player = game.getPlayerById(player);

					if( !player )
						return false;

					const isMyPlayer = game.getMyPlayers().includes(player);
					const hasClairvoyance = isMyPlayer || player.getActiveEffectsByType(Effect.Types.clairvoyance).length > 0;
					this.character.exportPlayer.toggleClass('hidden', Boolean(player.isNPC()));
					
					// Character panel
					const cDivs = this.character;
					cDivs.name.text(player.name);
					cDivs.subName.html('Lv '+Math.max(0, player.getLevel())+' '+esc(player.species)+' '+esc(player?.class?.name));
					this.character.expBar[0].classList.toggle('hidden', player.team !== Player.TEAM_PLAYER);
					this.character.expBarBar[0].style = 'width:'+Math.max(0, Math.min(100, player.experience/player.getExperienceUntilNextLevel()*100))+'%';
					this.character.expBarText[0].innerText = player.experience+'/'+player.getExperienceUntilNextLevel()+' EXP';

					let desc = '<strong>About:</strong><br />';
					desc += esc(player.description || 'No description')+'<br />';
					if( player.class )
						desc += '<br /><strong>'+esc(player.class.name)+'</strong><br />'+esc(player.class.description);

					desc += '<div class="clairvoyance hidden">'+
						'<hr />'+
						'<div class="actions"></div>'+
						'<div class="kinks"></div>'+
					'</div>';

					cDivs.description.html(desc);

					
					// Should draw some extra information about this player
					const clairActions = player.getClairvoyanceActions();
					const clairvoyance = cDivs.description[0].querySelector('div.clairvoyance');
					if( hasClairvoyance ){

						const adiv = clairvoyance.querySelector('div.actions');
						for( let action of clairActions ){

							const tmp = document.createElement('template');
							tmp.innerHTML = UI.Templates.actionButton;
							let div = tmp.content.firstChild;
							div.classList.toggle('action', true);
							adiv.appendChild(div);
							UI.setActionButtonContent(div, action, player);

						}

						const cdiv = clairvoyance.querySelector("div.kinks");
						let kinks = player.getKinks();
						for( let kink of kinks ){
							
							let div = $(UI.Templates.wrapper)[0];
							UI.setWrapperIconContent(div, kink, player, player);
							cdiv.appendChild(div);

						}


						let additional = document.createElement('template');
						let html = '';

						

						const getLowHighLabel = (input, labels) => {
							if( !labels )
								labels = ['None', 'Minor', 'Lesser', 'Average', 'Greater', 'Major', 'Completely'];
							
							return labels[Math.floor(input*6)];								
						};
						html += 'Sadism: <strong>'+getLowHighLabel(player.sadistic)+'</strong><br />';
						if( !player.isBeast() ){

							html += 'Dominant: <strong>'+getLowHighLabel(player.dominant)+'</strong><br />';
							html += 'Hetero: <strong>'+getLowHighLabel(player.hetero)+'</strong><br />';
							html += 'Tactics: <strong>'+getLowHighLabel(player.intelligence)+'</strong><br />';

						}


						additional.innerHTML = html;
						clairvoyance.append(additional.content);

					}
					clairvoyance.classList.toggle('hidden', !hasClairvoyance);

					cDivs.image.css('background-image', 'url(\''+esc(player.getActiveIcon())+'\')');

					// Equipment
					const slots = [
						Asset.Slots.lowerBody,
						Asset.Slots.upperBody,
						Asset.Slots.hands,
						Asset.Slots.lowerBodyCosmetic,
						Asset.Slots.upperBodyCosmetic,
						Asset.Slots.jewelleryCosmetic,
						//Asset.Slots.action,
						
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
					const s = Object.values(Action.Types).map(el => ucFirst(el)).sort();
					const myPlayer = game.getMyActivePlayer() || new Player();
					for( let stat of s ){
						
						const val = myPlayer.getBon(stat)-player.getSV(stat);
						let color = val > 0 ? 'green' : 'red';
						if( val === 0 )
							color = '';
						html += '<div class="tag tooltipParent '+color+'">'+
							'<span>'+(val > 0 ? '+' : '')+val+' '+esc(stat.substr(0,4))+'</span>'+
							'<div class="tooltip"><em>'+
								'This is your active character\'s proficiency vs this player\'s avoidance. Green means you have a higher hit chance and efficiency. Red means a lower hit chance.</em><br />Raw: '+player.getBon(stat)+' bon / '+player.getSV(stat)+' sv</div>'+
						'</div>';

					}
					cDivs.secondaryStats.html(html);
				//





				// DM Tab
					const dDivs = this.edit;
					let tmpPlayer = new Player({
						icon : player.icon,
						icon_lowerBody : player.icon_lowerBody,
						icon_upperBody : player.icon_upperBody,
						icon_nude : player.icon_nude,
					});
					html = '';

					// Handles the preview layers in the editor
					self.bindPlayerLayerPreviewButtons(dDivs.image, dDivs.layersDiv, tmpPlayer);

					

					dDivs.formDeletePlayer.toggleClass('hidden', !game.getPlayerById(player.id));
					
					dDivs.tagList.html(
						this.constructor.getTagDatalistHtml()+
						this.constructor.getVoiceDatalistHtml()
					);

					// Form
					dDivs.formName.val(player.name);
					dDivs.formVoice.val(player.voice);
					dDivs.formSpecies.val(player.species);
					dDivs.formSpre.val(player.spre);
					dDivs.formHe.val(player.he);
					dDivs.formHim.val(player.him);
					dDivs.formHis.val(player.his);
					dDivs.formLevel.val(parseInt(player.level) || 1);
					dDivs.formSize.val(parseInt(player.size) || 5);
					dDivs.formDressed.val(player.icon);
					dDivs.formNude.val(player.icon_nude);
					dDivs.formUpperBody.val(player.icon_upperBody);
					dDivs.formLowerBody.val(player.icon_lowerBody);
					dDivs.formHP.val(parseInt(player.hp) || 0);
					dDivs.formArousal.val(parseInt(player.arousal) || 0);
					dDivs.formTeam.val(parseInt(player.team) || 0);
					dDivs.formDescription.val(player.description);
					dDivs.formSadistic.val(+player.sadistic || 0);
					dDivs.formDominant.val(+player.dominant || 0);
					dDivs.formHetero.val(+player.hetero || 0);

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

					dDivs.tags[0].replaceChildren();
					for( let tag of player.tags )
						this.addTag(tag);

					// Draw the secondary stat form
					const secondary = dDivs.formSecondaryStat;
					for(let i in Action.Types){

						const t = Action.Types[i];
						$("> div."+i+" > input", secondary[0]).val(parseInt(player['sv'+t]) || 0);
						$("> div."+i+" > input", secondary[1]).val(parseInt(player['bon'+t]) || 0);

					}

					

					// Draw the randomizer
					html = '<option value="_RANDOM_">-RANDOM NPC-</option>';
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


					// Draw kink selects
					const active = player.getKinks();
					let allKinks = Wrapper.getKinks();
					for( let i = 0; i < 2; ++i ){

						let blankKink = document.createElement("option");
						blankKink.innerText = '- NONE -';
						blankKink.value = '';
						let kinks = [
							blankKink
						];
						
						let cur = active[i];
						for( let kink of allKinks ){

							let el = document.createElement("option");
							el.value = kink.label;
							el.innerText = kink.name;
							el.title = kink.description;

							if( cur?.label === kink.label ){
								el.selected = true;
							}
							kinks.push(el);

						}
						
						this.edit.kinksSelects[i].replaceChildren(...kinks);

					}



					// Puts form data to the player
					const savePlayer = () =>{

						player.generated = false;		// Make sure the player remains when leaving the cell
						player.name = dDivs.formName.val().trim();
						player.voice = dDivs.formVoice.val().trim();
						player.species = dDivs.formSpecies.val().trim().toLowerCase();
						player.spre = dDivs.formSpre.val().trim().toLowerCase();
						player.he = dDivs.formHe.val().trim().toLowerCase();
						player.him = dDivs.formHim.val().trim().toLowerCase();
						player.his = dDivs.formHis.val().trim().toLowerCase();
						player.description = dDivs.formDescription.val().trim();
						player.icon = dDivs.formDressed.val().trim();
						player.icon_upperBody = dDivs.formUpperBody.val().trim();
						player.icon_lowerBody = dDivs.formLowerBody.val().trim();
						player.icon_nude = dDivs.formNude.val().trim();
						player.hp = parseInt(dDivs.formHP.val())||1;
						player.arousal = parseInt(dDivs.formArousal.val())||0;

						player.sadistic = Math.max(0, Math.min(1, +dDivs.formSadistic.val())) || 0;
						player.dominant = Math.max(0, Math.min(1, +dDivs.formDominant.val())) || 0;
						player.hetero = Math.max(0, Math.min(1, +dDivs.formHetero.val())) || 0;

						player.tags = [];
						for( let tagDom of dDivs.tags[0].children ){

							const tag = tagDom.children[0].value.trim().toLowerCase();
							if( tag )
								player.tags.push('pl_'+tag);

						}
						
						player.level = parseInt(dDivs.formLevel.val())||1;
						player.size = parseInt(dDivs.formSize.val())||0;
						player.team = parseInt(dDivs.formTeam.val())||0;

						player.removeKinks();
						if( this.edit.kinksSelects[0].value )
							player.addPassive(this.edit.kinksSelects[0].value);
						if( this.edit.kinksSelects[1].value )
							player.addPassive(this.edit.kinksSelects[1].value);
						
			
						const preClass = player.class;

						let cName = dDivs.formClass.val().trim();
						let cl = glib.get(cName, 'PlayerClass');
						
						
						for(let i in Action.Types){

							const t = Action.Types[i];
							player['sv'+t] = parseInt($("> div."+i+" > input", secondary[0]).val()) || 0;
							player['bon'+t] = parseInt($("> div."+i+" > input", secondary[1]).val()) || 0;
	
						}
			
						if( player.hp > player.getMaxHP() )
							player.hp = player.getMaxHP();
						
						
						// Todo: Save kinks
						

						// INSERT player
						if( !game.playerExists(player) ){

							if( player.team === Player.TEAM_PLAYER )
								player.auto_learn = false;
							
							game.addPlayer(player);
							player.onPlacedInWorld();

						}

						if( cl ){
							player.class = cl;

							if( cl.label !== preClass.label )
								player.addActionsForClass();

						}

						player.addTagSynonyms();
			
						game.save();
						game.ui.draw();

					};



					// Events
					// Add action
					dDivs.addAction.off('click').on('click', () => {
						
						this.edit.drawPlayerActionSelector(player, id => {

							if( player.addActionFromLibrary(id) ){

								savePlayer();
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
					dDivs.formIcons.off('change').on('change', event => {

						let name = event.currentTarget.name;
						tmpPlayer[name] = event.currentTarget.value;
						self.updatePlayerLayerPreview(dDivs.image, dDivs.layersDiv, tmpPlayer);

					});

					
					dDivs.form.off('submit').on('submit', event => {
			
						event.stopImmediatePropagation();
						event.preventDefault();
						savePlayer();
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
							let data = Player.saveThis(pl, true);
							this.randomizerOption = type;
							delete pl.id;
							player.load(data);
							this.refresh();
						}
						else
							console.error("Unable to generate a player template with those conditions");
			
					});

					this.character.exportPlayer.off('click').on('click', () => {
						player.exportFile();
					});
					

			});

		// Shop
		this.add(new this("shop", "Shop"))
			.setCloseOnCellMove(true)
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
					myPlayer = game.getMyActivePlayer(),
					th = this
				;

				this.shop = shop;

				if( !(this.shop instanceof Shop) || !myPlayer )
					throw 'Invalid shop or player';

				try{
					game.shopAvailableTo(this.shop, myPlayer);
				}catch(err){
					
					this.close();
					//console.error(err);
					return;

				}

				// Titles
				this.setTitle(this.shop.name);
				this.toggleTab('Sell', this.shop.buys);
				if( this.activeTab === 'Sell' && !this.shop.buys )
					this.setActiveTab('Buy');


				// My money
				
				for( let footer of this.headers )
					await StaticModal.updateWallet(footer, this.shop);

				


				// Assets for sale
				const handleSellAssetClick = event => {

					const targ = $(event.currentTarget),
						id = targ.attr('data-id');
						
					const item = this.shop.getItemById(id);
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
							game.buyAsset(th.shop.label, item.id, amount, myPlayer.id);
						},
						false
					);

				};

				const testEvt = new GameEvent({sender:myPlayer, target:myPlayer});
				let newDivs = [];
				let availableAssets = 0;
				const items = this.shop.getItems();
				for( let item of items ){

					const cost = item.getCost();
					const asset = item.getAsset();
					if( !asset )
						continue;

					const remaining = item.getRemaining();
					if( remaining === 0 )
						continue;
					
					if( !Condition.all(item.conditions, testEvt) )
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

					const targ = event.currentTarget,
						id = targ.dataset.id,
						asset = myPlayer.getAssetById(id)
					;

					if( !asset )
						return;
					
					const maxQuant = asset.stacking ? asset._stacks : 1;
					const sell = function( evt ){

						let amount = maxQuant;
						if( evt ){

							amount = Math.floor($("input:first", this).val());
							if( !amount )
								return;

						}
						game.sellAsset(th.shop.label, asset.id, amount, myPlayer.id);

					};

					// Quick sell whole stack
					if( event.shiftKey )
						sell();
					else{
						game.ui.modal.makeSelectionBoxForm(
							'Amount to SELL: <input type="number" style="width:4vmax" min=1 max='+(maxQuant)+' step=1 value='+maxQuant+' /><input type="submit" value="Ok" />',
							sell,
							false
						);
					}

				};
				newDivs = [];
				availableAssets = 0;
				const assets = myPlayer.getAssets();
				for( let asset of assets ){

					if( !asset.isSellable() )
						continue;

					const a = asset.clone();
					a.name = (asset.stacking ? '['+asset._stacks+'] ' : '[1] ')+' '+a.name;

					const div = await StaticModal.getGenericAssetButton(a, a.getSellCost(this.shop));
					newDivs.push(div);
					div.addEventListener('click', handleBuyAssetClick);

					++availableAssets;

				}
				this.sellInventory.replaceChildren(...newDivs);
				this.sellEmpty.classList.toggle('hidden', Boolean(availableAssets));
				this.sellInventory.classList.toggle('hidden', !availableAssets);


			})
		;
		// Bank
		this.add(new this("bank", "Bank"))
			.setCloseOnCellMove(true)
			.addRefreshOn(["players"])
			.addTab("Deposit", () => {
				return `
					<div class="center"><input type="button" name="exchange" value="Exchange Coins" /></div>
					<div class="bank inventory"></div>
					
					<div class="empty hidden" style="min-width:25vmax">Inventory empty.</div>

				`;
			})
			.addTab("Withdraw", () => {
				return `
					<h3 class="quant center" style="margin:0">Holding <span></span>/`+Player.BANK_SLOTS+`</h3>
					<div class="center"><input type="button" class="bank" name="exchange" value="Exchange Coins" /></div>
					<div class="bank inventory"></div>
					<div class="empty hidden" style="min-width:25vmax">No banked items.</div>
				`;
			})
			.setProperties(function(){
				const depositPage = this.getTabDom('Deposit')[0],
					withdrawPage = this.getTabDom('Withdraw')[0]
				;

				this.depositInventory = depositPage.querySelector("div.bank.inventory");
				this.depositEmpty = depositPage.querySelector("div.empty");
				this.withdrawInventory = withdrawPage.querySelector("div.bank.inventory");
				this.withdrawEmpty = withdrawPage.querySelector("div.empty");
				this.withdrawHolding = withdrawPage.querySelector("h3.quant > span");
				this.exchangeBank = withdrawPage.querySelector("input[name=exchange]");
				this.exchangeInv = depositPage.querySelector("input[name=exchange]");
				
				
			})
			.setDraw(async function( bankPlayer ){

				const 
					myPlayer = game.getMyActivePlayer(),
					th = this
				;
				if( !myPlayer )
					throw 'Player not found';

				// Handles both deposit and withdraw
				const handleAssetClick = event => {

					const targ = event.currentTarget,
						id = targ.dataset.id,
						deposit = targ.classList.contains("deposit"),
						asset = myPlayer.getAssetById(id, !deposit)
					;

					if( !asset )
						return;
					
					const maxQuant = asset.stacking ? asset._stacks : 1;
					const swap = function( evt ){

						let amount = maxQuant;
						if( evt ){

							amount = Math.floor($("input:first", this).val());
							if( !amount )
								return;

						}
						
						game.toggleAssetBanked( bankPlayer, asset, amount, myPlayer, deposit );
						
					};

					// Quick bank whole stack
					if( event.shiftKey )
						swap();
					else{
						game.ui.modal.makeSelectionBoxForm(
							'Amount to '+(deposit ? 'deposit' : 'withdraw')+': <input type="number" style="width:4vmax" min=1 max='+(maxQuant)+' step=1 value='+maxQuant+' /><input type="submit" value="Ok" />',
							swap,
							false
						);
					}

				};
				
				let newDivs = [];
				let num = 0;
				let assets = myPlayer.getAssets();
				for( let asset of assets ){

					const div = await StaticModal.getGenericAssetButton(asset, undefined, 'deposit');
					newDivs.push(div);
					div.addEventListener('click', handleAssetClick);
					++num;

				}
				this.depositInventory.replaceChildren(...newDivs);
				this.depositEmpty.classList.toggle("hidden", Boolean(num));

				// Draw withdraw
				newDivs = [];
				num = 0;
				assets = myPlayer.getAssets(true);
				for( let asset of assets ){

					const a = asset.clone();
					a.name = (asset.stacking ? '['+asset._stacks+'] ' : '[1] ')+' '+a.name;

					const div = await StaticModal.getGenericAssetButton(a, undefined, 'withdraw');
					newDivs.push(div);
					div.addEventListener('click', handleAssetClick);
					++num;

				}
				this.withdrawInventory.replaceChildren(...newDivs);
				this.withdrawEmpty.classList.toggle("hidden", Boolean(num));
				this.withdrawHolding.innerText = num;


				const handleExchange = event => {

					const targ = event.target,
						bank = event.target.classList.contains("bank")
					;
					game.exchangePlayerMoney(myPlayer, bank);

				};

				this.exchangeBank.classList.toggle('hidden', !myPlayer.canExchange(true));
				this.exchangeBank.onclick = handleExchange;
				this.exchangeInv.classList.toggle('hidden', !myPlayer.canExchange());
				this.exchangeInv.onclick = handleExchange;


			})
		;
		// Smith
		this.add(new this("smith", "Smith"))
			.setCloseOnCellMove(true)
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
					<div class="dyeOverlay cmContentBlock center hidden">
						<div class="inventory"></div>
						<form class="saveDye">
							<label class="colorName"></label><br />
							<input type="color" class="colorPicker" /><br />
							<input type="submit" class="save" value="Dye Armor [1 Gold]" /><br />
							<input type="button" class="remove hidden" value="Remove Dye" />
							<input type="button" class="cancel" value="Cancel" />
						</form>
					</div>
				`;
			})
			.setProperties(function(){
				
				const smith = this.getTabDom('Smith')[0];
				this.money = smith.querySelector('div.myMoney');
				this.assets = smith.querySelector('div.repair.container');
				this.empty = smith.querySelector('div.repair.empty');
				this.selectedAsset = null;

				this.dyeOverlay = smith.querySelector('div.dyeOverlay');
				this.dyeForm = smith.querySelector('div.dyeOverlay form.saveDye');
				this.dyeAssetWrapper = smith.querySelector('div.dyeOverlay > div.inventory');
				this.dyesColorPicker = smith.querySelector('div.dyeOverlay > form.saveDye > input.colorPicker');
				this.dyesSaveButton = smith.querySelector('div.dyeOverlay > form.saveDye > input.save');
				this.dyesRemoveButton = smith.querySelector('div.dyeOverlay > form.saveDye > input.remove');
				this.dyesCancelButton = smith.querySelector('div.dyeOverlay > form.saveDye > input.cancel');
				this.dyesColorName = smith.querySelector('div.dyeOverlay > form.saveDye > label.colorName');
				
				this.dyesCancelButton.addEventListener('click', () => {
					this.dyeOverlay.classList.toggle('hidden', true);
				});
				
				
			})
			.setDraw(async function( smith ){

				const myPlayer = game.getMyActivePlayer();
				if( !myPlayer )
					throw 'You have no active player';
				if( !smith )
					throw 'Invalid smith';

				self.generateWallet(this.money.querySelector('span.coins'));

				await StaticModal.updateWallet(this.money);
	

				// Output repairable
				const handleRepairableClick = event => {
					
					const assetId = event.currentTarget.dataset.id;
					const asset = myPlayer.getAssetById(assetId);
					if( !asset )
						return;

					game.uiClick(event.currentTarget);

					const modal = game.ui.modal;
					modal.prepareSelectionBox();
					if( asset.isDamaged() ){

						modal.addSelectionBoxItem( 
							'Repair', 
							'Repair this item', 
							'repairItem',
							[],// classes?
							false
						);

					}

					if( asset.colorable ){

						modal.addSelectionBoxItem( 
							'Dye', 
							'Dye this item', 
							'dyeItem',
							[],// classes?
							false
						);

					}

					modal.onSelectionBox(async event => {
			
						let element = event.currentTarget,
							id = $(element).attr('data-id')
						;
						game.uiClick(element);
						if( id === 'repairItem' )
							game.repairBySmith(smith, myPlayer, assetId);
						else if( id === 'dyeItem' ){

							const dummyAsset = asset.clone();
							const div = await StaticModal.getGenericAssetButton(dummyAsset, 100);	// 100 is the cost of dye
							this.dyeAssetWrapper.replaceChildren(div);
							this.dyeOverlay.classList.toggle("hidden", false);
							this.dyesRemoveButton.classList.toggle("hidden", !asset.color_tag);
							this.dyesColorPicker.value = dummyAsset.getColor();
							this.dyesColorName.innerText = dummyAsset.getColorTag();
							this.dyesColorPicker.onchange = async () => {
								dummyAsset.color = this.dyesColorPicker.value;
								dummyAsset.color_tag = ntc.name(dummyAsset.color)[1];
								this.dyesColorName.innerText = dummyAsset.getColorTag(); 
								this.dyeAssetWrapper.replaceChildren(await StaticModal.getGenericAssetButton(dummyAsset, 100));
								game.uiSelectUp(div);
							};

							this.dyesRemoveButton.onclick = () => {
								game.dyeBySmith(smith, myPlayer, assetId, '');
								this.dyeOverlay.classList.toggle('hidden', true);
							};

							this.dyeForm.onsubmit = event => {
								event.preventDefault();
								game.dyeBySmith(smith, myPlayer, assetId, dummyAsset.color);
								this.dyeOverlay.classList.toggle('hidden', true);
							};

						}

						modal.closeSelectionBox();
						
					});

					/*
					
					*/


				};

				const repairable = myPlayer.getAssets().filter(el => (el.isDamaged() && el.isDamageable()) || el.colorable);
				this.empty.classList.toggle("hidden", Boolean(repairable.length));
				this.assets.classList.toggle("hidden", !repairable.length);

				//const money = myPlayer.getMoney();
				const divs = [];				
				for( let asset of repairable ){

					const cost = asset.getRepairCost(smith);
					let classes = [];
					if( asset.isDamaged() )
						classes.push("damaged");

					const div = await StaticModal.getGenericAssetButton(
						asset, 
						asset.isDamaged() ? cost : undefined, 
						classes.join(' ')
					);
					divs.push(div);
					div.addEventListener('click', handleRepairableClick);
					
				}
				this.assets.replaceChildren(...divs);

			});

		// Altar
		this.add(new this("altar", "Altar"))
			.setCloseOnCellMove(true)
			.addRefreshOn(["players"])
			.addTab("Altar", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
						</div>
					</div>
					<h3 class="center">In exchange for a donation, the gods may randomize your kinks!</h3>
					<div class="center"><input type="button" name="shuffle" value="Shuffle Kinks (5 gold)" /></div>
					<p class="center">Your current kinks</p>
					<div class="center kinks"></div>
				`;
			})
			.setProperties(function(){
				
				const altar = this.getTabDom('Altar')[0];
				this.money = altar.querySelector('div.myMoney');
				this.button = altar.querySelector('input[name=shuffle]');
				this.kinks = altar.querySelector('div.kinks');

			})
			.setDraw(async function( altarPlayer ){

				const myPlayer = game.getMyActivePlayer();
				if( !myPlayer )
					throw 'You have no active player';

				self.generateWallet(this.money);


				await StaticModal.updateWallet(this.money);
	
				const money = myPlayer.getMoney();

				this.button.onclick = () => {
					
					if( money < 500 ){
						game.ui.modal.addError("Insufficient funds");
						return false;
					}
					
					game.shuffleKinksByAltar(altarPlayer, myPlayer);

				};
				
				let kinks = myPlayer.getKinks();
				let divs = [];
				for( let kink of kinks ){
					
					let div = $(UI.Templates.wrapper)[0];
					UI.setWrapperIconContent(div, kink, myPlayer, player);
					divs.push(div);

				}
				this.kinks.replaceChildren(...divs);
				

			});

		// Transmog
		this.add(new this("transmog", "Transmogrification"))
			.setCloseOnCellMove(true)
			//.addRefreshOn(["players"])
			.addTab("Transmogrification", () => {
				return `
					<div class="myMoney">
						<div>
							<span class="title">My Money:</span>
							<span class="coins"></span>
							<br /><input type="button" name="exchange" value="Exchange" />
						</div>
					</div>
					<div class="transmogViable center" style="margin:2vmax 0">Pick an equipped item to transmogrify:</div>
					<div class="assets transmog shop inventory container"></div>
					<div class="noEquippedAssets hidden">No transmogrifiable items equipped.</div>
					<div class="noTargetAssets hidden">No viable equipment to copy appearance from.</div>
					<div class="targetViable center hidden" style="margin-top:2vmax">Pick an item to copy appearance from. This item will be destroyed.</div>
					<div class="assets transmogTarget shop inventory container"></div>
					<div class="finalInstruction center" style="margin-top:2vmax;">
						Resulting item:
					</div>
					<div class="assets finalTarget shop inventory container center"></div>
					<div class="finalButton center">
						<input type="button" value="Transmogrify!" />
					</div>
				`;
			})
			.setProperties(function(){
				
				const base = this.getTabDom('Transmogrification')[0];
				this.money = base.querySelector('div.myMoney');
				this.assets = base.querySelector('div.transmog.container');
				this.noEquippedAssets = base.querySelector('div.noEquippedAssets');
				this.noTargetAssets = base.querySelector('div.noTargetAssets');
				this.transmogViable = base.querySelector('div.transmogViable');
				this.transmogTarget = base.querySelector('div.transmogTarget');
				this.targetViable = base.querySelector('div.targetViable');
				this.finalInstruction = base.querySelector('div.finalInstruction');
				this.itemPreview = base.querySelector('div.finalTarget');
				this.finalButton = base.querySelector('div.finalButton');

			})
			.setDraw(async function( transmogger ){

				const myPlayer = game.getMyActivePlayer();
				if( !myPlayer )
					throw 'You have no active player';
				if( !transmogger )
					throw 'Invalid transmogger';

				// Update coins
				const currencyDiv = this.money.querySelector('span.coins');
				StaticModal.generateWallet(currencyDiv);
				await StaticModal.updateWallet(this.money, undefined, this);
	
				const money = myPlayer.getMoney();
				const divs = [];		
				
				// Updates stage in the transmog process, 0 = pick target, 1 = pick from, 2 = confirm
				const updateStage = stage => {

					// Picking equipped item
					if( stage === 0 ){

						this.noTargetAssets.classList.toggle('hidden', true);
						this.targetViable.classList.toggle('hidden', true);
						this.transmogTarget.replaceChildren();

					}

					if( stage === 0 || stage === 1 ){

						this.finalInstruction.classList.toggle('hidden', true);
						this.itemPreview.classList.toggle('hidden', true);
						this.finalButton.classList.toggle('hidden', true);

					}

				};


				const viableEquipped = myPlayer.getEquippedAssetsBySlots(Asset.SlotsTransmoggable, true);

				const handleMainAssetClick = async event => {
					
					let asset = myPlayer.getAssetById(event.currentTarget.dataset.id);
					if( !asset )
						return;

					game.uiClick(event.target);
					updateStage(1);

					const handleTargetAssetClick = async event => {

						let targ = myPlayer.getAssetById(event.currentTarget.dataset.id);
						if( !targ )
							return;

						game.uiClick(event.target);
						updateStage(2);

						for( let ch of this.transmogTarget.children )
							ch.classList.toggle('selected', ch.dataset.id === targ.id );

						const dummy = asset.clone();
						dummy.transmogrifyFrom(targ);
						dummy.equipped = false;

						this.itemPreview.replaceChildren(await StaticModal.getGenericAssetButton(dummy));

						this.finalInstruction.classList.toggle('hidden', false);
						this.finalButton.classList.toggle('hidden', false);
						this.itemPreview.classList.toggle('hidden', false);

						this.finalButton.onclick = () => {
							try{
								game.transmogrify(transmogger, myPlayer, asset.id, targ.id);
								game.uiClick(event.target);
								this.close();
							}catch(err){
								game.ui.modal.addError(err);
							}
						};

						game.ui.bindTooltips();

					};

					for( let ch of this.assets.children )
						ch.classList.toggle('selected', ch.dataset.id === asset.id );
						
					let viableTargets = myPlayer.getAssets().filter(el => el.checkTransmogViability(asset));

					this.noTargetAssets.classList.toggle('hidden', Boolean(viableTargets.length));
					this.targetViable.classList.toggle('hidden', !viableTargets.length);

					let subdivs = [];
					for( let targ of viableTargets ){
						
						if( !(targ instanceof Asset) )
							continue;

						const div = await StaticModal.getGenericAssetButton(targ);
						subdivs.push(div);
						div.addEventListener('click', handleTargetAssetClick);

					}
					this.transmogTarget.replaceChildren(...subdivs);

					game.ui.bindTooltips();

				};
				
				this.noEquippedAssets.classList.toggle('hidden', Boolean(viableEquipped.length));
				this.transmogViable.classList.toggle('hidden', !viableEquipped.length);
				

				updateStage(0);

				let used_assets = [];
				for( let asset of viableEquipped ){

					if( !(asset instanceof Asset) )
						continue;
					if( used_assets.includes(asset) )
						continue;
					used_assets.push(asset);
					const cost = asset.getSellCost();
					const div = await StaticModal.getGenericAssetButton(asset, cost, cost > money ? 'disabled' : '');
					divs.push(div);
					div.addEventListener('click', handleMainAssetClick);
					
				}
				this.assets.replaceChildren(...divs);

			});

		// Main menu
		this.add(new this("mainMenu", "FetishQuest"))
			.addTab("Main Menu", () => {
				return `
					<p class="centered" style="font-size:1.5vmax">
						This game contains adult content.<br />
						<span style="font-weight:bold; color:#FAA;">Browser 3D acceleration enabled is required.</span>
					</p>
					<p style="text-align:center">
							<input type="button" class="green newGameButton" name="newGame" value="New Game" />
					</p>
					<div class="loadGame">
						<div class="gameSaves"></div><br />
						<p class="subtitle" style="font-size:1.25vmax">Ctrl+click to Delete a save, Shift+Click to Export</p>
						<input type="file" class="loadGame" accept=".fqsav" />
					</div>
					<hr />
					<p class="centered">
						Support Development<br />
						<a href="https://github.com/JasXSL/FetishQuest" target="_blank"><img class="portalLogo" src="/media/ui/GitHub-Mark-Light-120px-plus.png" /></a>
						<a href="https://discord.jasx.org" target="_blank"><img class="portalLogo" src="/media/ui/discord.png" /></a>
						<br />
						<a class="crypto button" href="algorand://VZMKLLC5PJ6F456YFA2VAB6UVCPRMLLE6NPFMIQ5TOWG3PROKIHNL6F7DE" style="background:#3EDBD2">Algorand</a>
						<a class="crypto button" href="dogecoin:DMJvmu94hcskwBz11aqqzmXnKQErKQjxgo" style="background:#855">Dogecoin</a>
						<a class="crypto button" href="bitcoin:bc1qlkml7q7lzlfd28hsdfp89dm2p7sazv56649zwk" style="background:#F7931A">Bitcoin</a>
						<a class="crypto button" data-href="0x58d235B218a872b31A806DbdE6a1fCeC708d5C45" style="background:#ff4724">BAT</a>
						<a class="crypto button" href="https://www.patreon.com/jasx_games" target="_blank">Patreon</a>
						
					</p>
				`;
			})
			.addTab("Group Finder", () => {
				return `
					<div class="notJoined">
						<form class="gfCharacterForm">
							<label>
								Character Name:<br />
								<input type="text" placeholder="Name" name="name" maxlength=64 style="font-size:3vmax" required />
							</label><br />
							<label>
								Character image: <br />
								<em>Supports shitpost.to (recommended), lensdump, e621, gyazo, reddit, discord, twitter, etc. Join the <a href="https://discord.jasx.org" target="_blank">discord</a> if you need more.</em><br />
								<input type="text" placeholder="Character Image" name="image" maxlength=128 />
							</label><br />
							<label>
								Your description: What do you want to play as? Species? Gender? Roles?<br />
								<textarea name="is"></textarea>
							</label><br />
							<label>
								Who do you want to play with? Species, gender, any particular roles? Mods? Do you want to RP? Any fetish in particular you want to focus on? What content do you want to do?<br />
								<textarea name="wants"></textarea>
							</label><br/>
							<label>
								Auto-join group finder on load <input type="checkbox" name="autojoin" />
							</label>
							<label>
								<input type="submit" value="Join Group Finder" />
							</label>
						</form>
					</div>
					<div class="joined hidden">
						<div class="gfBG">
							<div class="gfHeader">
								<h2 class="myname">
									<span>Charname</span><br />
									<input type="button" value="Disconnect" />
									<img class="icon" />
								</h2>
							</div>
						</div><br />
						<div class="listing"></div>
					</div>
					<div class="chat hidden">
						<div class="header" style="background-image:url('/media/textures/tileable/church_floor_2.jpg')">
							<div class="name">CharName Here</div>
							<div class="button gameInvite hidden">Invite to Game</div>
						</div>

						<div class="charDesc bgMarble">
							<h3>About</h3>
							<p class="about"></p>
							<h3>Looking For</h3>
							<p class="wants"></p>
						</div>
						<div class="bodywrap">
							<div class="body"></div>
						</div>
						
						<div class="input" contenteditable></div>
						<div class="playerDisconnected hidden">Player Disconnected</div>
						<div class="close button">Close</div>
					</div>
				`;
			})
			.addTab("Fetishes", () => {
				return `
					<table class="fetishes editor">
						<tr class="head">
							<th>On</th>
							<th>Name</th>
							<th>Description</th>
						</tr>
					</table>
					<br />
					<p>Note that mod fetishes depend on the modder setting up Fetish Conditions properly. This isn't a catch-all. Also just because a fetish exists in this list doesn't mean it's in the official game.</p>
				`;
			})
			/*
			.addTab("Multiplayer", () => {
				return `
					<h3>Join Existing Online Game</h3>
					<form class="joinGame">
						<input type="text" placeholder="Nickname" name="nickname" style="width:auto" />
						<input type="text" placeholder="Game ID" name="gameID" style="width:auto" />
						<input type="submit" value="Join Online Game"  />
					</form>
				`;
			})
			*/
			.addTab("My Mods", () => {
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
					<p class="subtitle">Make your own mod with <a href="modtools.html">the devtools</a>!</p>
				`;
			})
			.addTab("Mod DB", () => {
				return `
					<div class="search">
						<form class="searchForm">
							<input type="text" class="search" placeholder="Search mods" />
							<input type="submit" value="Search" />
						</form>
					</div>
					<div class="searchResults"></div>
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
					<a href="https://www.furaffinity.net/user/carduelis/" target="_blank">Carduelis</a><br />
					<a href="http://www.furaffinity.net/gallery/gothwolf" target="_blank">GothWolf</a><br />
					<a href="http://www.furaffinity.net/gallery/maddworld" target="_blank">Maddworld</a><br />
					<p>Audio:</p>
					https://freesound.org/people/Abolla<br /> 
					https://freesound.org/people/Adam_N<br /> 
					https://freesound.org/people/Andy_Gardner<br /> 
					https://freesound.org/people/Anthousai<br /> 
					https://freesound.org/people/Atkom<br /> 
					https://freesound.org/people/Benboncan<br /> 
					https://freesound.org/people/Bertsz<br />
					https://freesound.org/people/BiancaBothaPure<br /> 
					https://freesound.org/people/BlueDelta<br /> 
					https://freesound.org/people/Cheddababy<br /> 
					https://freesound.org/people/CosmicEmbers<br />
					https://freesound.org/people/Dave%20Welsh<br /> 
					https://freesound.org/people/EdgardEdition<br /> 
					https://freesound.org/people/EminYILDIRIM<br />
					https://freesound.org/people/Fasolt<br /> 
					https://freesound.org/people/Faulkin<br /> 
					https://freesound.org/people/FoolBoyMedia<br /> 
					https://freesound.org/people/Fugeni<br /> 
					https://freesound.org/people/GaelanW<br />
					https://freesound.org/people/GameDevC<br /> 
					https://freesound.org/people/GoodListener<br /> 
					https://freesound.org/people/Halleck<br /> 
					https://freesound.org/people/INNORECORDS<br /> 
					https://freesound.org/people/InspectorJ<br /> 
					https://freesound.org/people/Iridiuss<br />
					https://freesound.org/people/JustInvoke<br />
					https://freesound.org/people/LG<br /> 
					https://freesound.org/people/LittleRobotSoundFactory<br />
					https://freesound.org/people/MarcMatthewsMusic<br /> 
					https://freesound.org/people/Meepalicious<br /> 
					https://freesound.org/people/Millavsb<br /> 
					https://freesound.org/people/Nakhas<br />
					https://freesound.org/people/Nightwatcher98<br /> 
					https://freesound.org/people/Pfannkuchn<br /> 
					https://freesound.org/people/PhilSavlem<br /> 
					https://freesound.org/people/Rob_Marion<br />
					https://freesound.org/people/Rocktopus<br /> 
					https://freesound.org/people/Schoggimousse<br /> 
					https://freesound.org/people/Snapper4298<br /> 
					https://freesound.org/people/Syna-Max<br /> 
					https://freesound.org/people/Timbre<br /> 
					https://freesound.org/people/Timmeh515<br />
					https://freesound.org/people/VKProduktion<br /> 
					https://freesound.org/people/Zuzek06<br />
					https://freesound.org/people/adamgryu<br /> 
					https://freesound.org/people/adcbicycle<br /> 
					https://freesound.org/people/akemov/sounds<br /> 
					https://freesound.org/people/alebrujo<br /> 
					https://freesound.org/people/altfuture<br /> 
					https://freesound.org/people/andersmmg<br />
					https://freesound.org/people/arpeggio1980<br /> 
					https://freesound.org/people/bajko<br /> 
					https://freesound.org/people/conleec<br /> 
					https://freesound.org/people/dobroide<br /> 
					https://freesound.org/people/draftcraft<br /> 
					https://freesound.org/people/duckduckpony<br /> 
					https://freesound.org/people/dynamique<br /> 
					https://freesound.org/people/ejfortin<br /> 
					https://freesound.org/people/florianreichelt<br />
					https://freesound.org/people/gsb1039<br />
					https://freesound.org/people/hantorio<br /> 
					https://freesound.org/people/hinzebeat<br /> 
					https://freesound.org/people/humanoide9000<br /> 
					https://freesound.org/people/ivolipa<br /> 
					https://freesound.org/people/jorickhoofd<br />
					https://freesound.org/people/kwahmah_02<br /> 
					https://freesound.org/people/kyles<br /> 
					https://freesound.org/people/lawnjelly<br /> 
					https://freesound.org/people/lefthandwinnie<br /> 
					https://freesound.org/people/lmr9<br />
					https://freesound.org/people/lostphosphene<br /> 
					https://freesound.org/people/natemarler<br /> 
					https://freesound.org/people/newlocknew<br />
					https://freesound.org/people/olver<br />
					https://freesound.org/people/opticaillusions<br />
					https://freesound.org/people/potentjello<br /> 
					https://freesound.org/people/priesjensen<br /> 
					https://freesound.org/people/qubodup<br /> 
					https://freesound.org/people/sergeeo/<br />
					https://freesound.org/people/susiq12<br /> 
					https://freesound.org/people/suspensiondigital<br /> 
					https://freesound.org/people/univ_lyon3<br />
					https://freesound.org/people/vacuumfan7072<br /> 
					https://freesound.org/people/volivieri<br />
					https://freesound.org/people/vr/<br />
					https://freesound.org/people/3bagbrew<br /> 
					<p>Textures</p>
					https://www.deviantart.com/gurumedit/<br />
					https://www.videvo.net/profile/videvo/<br />
					https://www.flickr.com/photos/lenabem-anna<br />
					<p>Made with <a href="https://threejs.org/" target="_blank">THREE.js</a></p>
				</div>
				`;
			})
			.setProperties(function(){

				const 
					mainMenu = this.getTabDom('Main Menu')[0],
					mods = this.getTabDom('My Mods')[0],
					//online = this.getTabDom('Multiplayer')[0],
					modDB = this.getTabDom('Mod DB')[0],
					fetishes = this.getTabDom('Fetishes')[0],
					groupFinder = this.getTabDom('Group Finder')[0]
				;

				const copies = mainMenu.querySelectorAll('a.crypto[data-href]');
				copies.forEach(el => {
					el.onclick = () => {
						
						copyTextToClipboard(el.dataset.href);
						if( !el.preVal )
							el.preVal = el.innerText;
						clearTimeout(el.timeout);
						el.innerText = 'Copied!';
						el.timeout = setTimeout(() => {
							el.innerText = el.preVal;
						}, 2000);

					};
				});

				this.newGameButton = mainMenu.querySelector('input.newGameButton');
				this.gameSaves = mainMenu.querySelector('div.gameSaves');
				this.loadGame = mainMenu.querySelector('div.loadGame');
				this.loadGameInput = mainMenu.querySelector('input.loadGame');
				this.modsTable = mods.querySelector('table.editor');
				this.loadMod = mods.querySelector('input.modFile');
				//this.joinGameForm = online.querySelector('form.joinGame');
				this.modSearchForm = modDB.querySelector('form.searchForm');
				this.modSearchInput = this.modSearchForm.querySelector('input.search');
				this.modSearchResults = modDB.querySelector('div.searchResults');
				this.fetishes = fetishes.querySelector('table.fetishes');

				this.groupFinder = {
					header : groupFinder.querySelector('div.gfHeader'),
					gfBG : groupFinder.querySelector('div.gfBG'),
					myName : groupFinder.querySelector('div.gfHeader .myname span'),
					myIcon : groupFinder.querySelector('div.gfHeader img.icon'),
					joined : groupFinder.querySelector('div.joined'),
					notJoined : groupFinder.querySelector('div.notJoined'),

					characterForm : groupFinder.querySelector('form.gfCharacterForm'),
					characterName : groupFinder.querySelector('form.gfCharacterForm input[name=name]'),
					characterImage : groupFinder.querySelector('form.gfCharacterForm input[name=image]'),
					characterIs : groupFinder.querySelector('form.gfCharacterForm textarea[name=is]'),
					characterWants : groupFinder.querySelector('form.gfCharacterForm textarea[name=wants]'),
					characterAutoJoin : groupFinder.querySelector('form.gfCharacterForm input[name=autojoin]'),

					listing : groupFinder.querySelector('div.joined > div.listing'),
					disconnect : groupFinder.querySelector('div.joined div.gfHeader input[type=button]'),
					
					chat : groupFinder.querySelector('div.chat'),
					chatHeader : groupFinder.querySelector('div.chat div.header'),
					chatHeaderName : groupFinder.querySelector('div.chat div.header div.name'),
					chatBody : groupFinder.querySelector('div.chat div.body'),
					chatBodyWrap : groupFinder.querySelector('div.chat div.bodywrap'),
					chatCharAbout : groupFinder.querySelector('div.chat p.about'),
					chatCharWants : groupFinder.querySelector('div.chat p.wants'),
					chatInput : groupFinder.querySelector('div.chat div.input'),
					chatClose : groupFinder.querySelector('div.chat div.close'),
					chatPlayerDisconnected : groupFinder.querySelector('div.chat div.playerDisconnected'),
					chatGameInvite : groupFinder.querySelector('div.chat div.gameInvite'),
				};

			})
			.setDraw(async function( arg0 ){
				
				// Show game saves
				const handleGameClick = async event => {
					
					const id = event.currentTarget.dataset.id,
						text = event.currentTarget.innerText;

					if( event.ctrlKey || event.metaKey ){

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

					else if( event.shiftKey ){


						game.ui.modal.addNotice('Exporting...');
						const zip = new JSZip();
						
						zip.file('save.json', JSON.stringify(await Game.getDataByID(id)));
						const content = await zip.generateAsync({
							type:"blob",
							compression : "DEFLATE",
							compressionOptions : {
								level: 9
							}
						})
						
						const a = document.createElement('a');
						const url = URL.createObjectURL(content);

						a.setAttribute('href', url);
						a.setAttribute('download', text+'.fqsav');

						document.body.appendChild(a);
						a.click();
						a.remove();

						
						game.ui.modal.addNotice('Game exported!');

						return;

					}

					Game.net.leaveNetgame();
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

					if( Game.net.isInNetgameHost() )
						Game.net.dmSendFullGame();
		
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

						if( !event.ctrlKey && !event.metaKey )
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


				// Fetishes
				let rows = [];
				const fs = Object.values(glib.getFull('Fetish'));
				let active = game.getFetishSettings();
				const onFetishClick = event => {
					event.preventDefault();

					const fetish = event.currentTarget.dataset.label;
					game.toggleFetish(fetish, !game.hasFetish(fetish));
					this.refresh();

				};

				let th = document.createElement('tr');
				rows.push(th);
				th.innerHTML = '<th>Enabled</th><th>Name</th><th>Description</th>';

				for( let f of fs ){

					let tr = document.createElement('tr');
					rows.push(tr);
					tr.dataset.label = f.label;

					const label = f.label;

					let td = document.createElement('td');
					tr.appendChild(td);
					let input = document.createElement('input');
					td.appendChild(input);
					input.type = 'checkbox';
					if( active[label] )
						input.checked = true;
					
					td = document.createElement('td');
					tr.appendChild(td);
					td.innerText = labelToName(label);

					td = document.createElement('td');
					tr.appendChild(td);
					td.innerText = labelToName(f.description);

					tr.addEventListener('click', onFetishClick);
					
				}
				this.fetishes.replaceChildren(...rows);

				const refreshChat = event => {

					const id = typeof event === "string" ? event : event.currentTarget.dataset.id;
					const targ = Game.net.getGroupFinderPlayerById(id);

					this.groupFinder.chatPlayerDisconnected.classList.toggle('hidden', Boolean(targ));
					this.groupFinder.chatInput.classList.toggle('hidden', !targ);

					

					if( !targ )
						return;

					// Player changed
					if( this.groupFinder.chat.dataset.id !== id ){
						
						this.groupFinder.chatBody.replaceChildren();
						this.groupFinder.chatCharAbout.innerText = targ.is;
						this.groupFinder.chatCharWants.innerText = targ.wants;

					}

					
					targ.unread = 0;

					if( typeof event !== "string" ){
						setTimeout(() => {
							this.groupFinder.chatInput.focus();
						}, 10);
					}
					this.groupFinder.chat.classList.toggle('hidden', false);
					this.groupFinder.chatHeader.style.backgroundImage = 'url(\''+esc(targ.getImage())+'\')';
					this.groupFinder.chatHeaderName.innerText = targ.name;
					this.groupFinder.chatGameInvite.classList.toggle('hidden', !Game.net.isInNetgameHost());

					this._gf_chat = id;

					const body = this.groupFinder.chatBody;
					let ch = targ.chat.slice();
					ch.reverse();

					let existing = [];
					for( let c of ch ){
						
						existing.push(c.id);	// Make a cache of existing IDs so we can delete pruned messages

						// Message already added
						if( body.querySelector('div.message[data-id=\''+c.id+'\']') )
							continue;

						let div = document.createElement('div');
						div.classList.add('message');
						div.dataset.id = c.id;

						if( c.message.startsWith('!!GAMEINVITE!!') ){

							let text = '<strong><i>You invited '+esc(targ.name)+' to your game!</i></strong>';
							if( !c.self ){

								let url = c.message.substr(14, 36);	// Note: Change this if you ever decide to stop using uuidv4
								text = '<div class="gameInvite button bgMarble">'+
									'<strong>'+esc(targ.name)+' has invited you to join their game!</strong><br />'+
									'<i class="subtitle">Click to Join</i>'+
								'</div>';
								div.classList.add('gameInvite');

								div.addEventListener('click', event => {
									window.location.hash = '#net/'+url;								
								});

							}

							
							div.innerHTML = text;

						}else{

							let name = "YOU";
							// They sent to us
							if( !c.self ){

								div.classList.add('right');
								name = targ.name;

							}
							const d = new Date();
							let time = String(d.getHours()).padStart(2, '0')+':'+String(d.getMinutes()).padStart(2, '0');
							div.innerHTML = '<div class="sub"><i class="time">'+time+'</i> <strong>'+esc(name)+'</strong>: '+esc(c.message)+'</div>';

						}
						body.append(div);

					}

					// Remove nonexisting
					const divs = Array.from(body.querySelectorAll('div.message'));
					for( let div of divs ){

						if( !existing.includes(div.dataset.id) )
							div.remove();

					}

					const bodyWrap = this.groupFinder.chatBodyWrap;
					bodyWrap.scrollTo(0, bodyWrap.scrollHeight);


				};


				const refreshPlayers = () => {

					const players = Game.net.getGroupFinderPlayers();
					const base = this.groupFinder.listing;

					// Hide if no players
					if( !players.length )
						base.innerHTML = '<div class="npo">No players online.</div>';
					else if( base.querySelector('div.npo') )
						base.innerHTML = '';

					
					for( let player of players ){

						const unreadMessages = player.unread;

						let div = base.querySelector('div[data-id=\''+player.id+'\']');
						if( !div ){

							div = document.createElement('div');
							div.dataset.id = player.id;
							div.classList.add('player', 'tooltipParent');
							div.innerHTML = 
								'<div class="bg"></div>'+
								'<div class="name"></div>'+
								'<div class="tooltip">'+
									'<h3 style="margin:0">About</h3>'+
									'<p class="about" style="margin:0">About</p>'+
									'<h3 style="margin:0">Looking For</h3>'+
									'<p class="wants" style="margin:0">Wants</p>'+
								'</div>'
							;
							base.appendChild(div);

							// Clicked the player
							div.addEventListener('click', event => {
								game.uiClick(event.target);
								refreshChat(event);
								refreshPlayers();
								refreshMasterBadge();
							});

						}

						// Update the divs
						div.classList.toggle('highlighted', Boolean(unreadMessages));
						div.querySelector('div.bg').style.backgroundImage = 'url('+esc(player.getImage())+')';
						div.querySelector('div.name').innerText = player.name + (unreadMessages ? ' ['+unreadMessages+']' : '');
						div.querySelector('div.tooltip > p.about').innerText = player.is;
						div.querySelector('div.tooltip > p.wants').innerText = player.wants;

					}

					// Sort the divs
					let els = Array.from(base.querySelectorAll('div.player'));
					els = els.map(el => {

						let pl = Game.net.getGroupFinderPlayerById(el.dataset.id);
						if( !pl ){
							base.removeChild(el);
							return false;
						}
						return {
							pl : pl,
							el : el
						};

					})
					.filter(el => el)
					.sort((a, b) => {

						if( Boolean(a.pl.unread) !== Boolean(b.pl.unread) )
							return a.pl.unread ? -1 : 1;
						return 0;

					})
					.map(el => {
						base.appendChild(el.el);
						return el;
					});

					const myPlayer = Game.net._gfChar;
					this.groupFinder.myName.innerText = myPlayer.name.trim();
					this.groupFinder.gfBG.style.backgroundImage = myPlayer.image ? "url('"+myPlayer.image+"')" : '';
					this.groupFinder.myIcon.src = myPlayer.image;
					this.groupFinder.myIcon.classList.toggle('hidden', !myPlayer.image);


				};


				if( this._gf_chat )
					refreshChat(this._gf_chat);
				
				// Groupfinder any run
				const isInGroupFinder = Game.net.isInGroupFinder();
				this.groupFinder.joined.classList.toggle('hidden', !isInGroupFinder);
				this.groupFinder.notJoined.classList.toggle('hidden', isInGroupFinder);

				// Groupfinder connected
				if( isInGroupFinder )
					refreshPlayers();

				refreshMasterBadge();
				

				

				// First run
				if( !this.drawn ){

					this.newGameButton.addEventListener('click', event => {
						StaticModal.set('newGame');
					});

					/*
					this.joinGameForm.addEventListener('submit', event => {

						event.stopImmediatePropagation();
						Game.net.joinGame(
							this.joinGameForm.querySelector("input[name=gameID]").value, 
							this.joinGameForm.querySelector("input[name=nickname]").value
						).then(() => this.refresh());
						return false;

					});
					*/
					this.loadMod.addEventListener('change', async event => {
						
						const mod = await Mod.import(event);
						if( !mod )
							return;

						this.refresh();
						game.ui.modal.addNotice("Mod "+esc(mod.name)+" installed!");
						this.loadMod.value = '';

					});

					this.loadMod.setAttribute("accept", ".fqmod");

					this.loadGameInput.addEventListener('change', async event => {

						const file = event.target.files[0];
						if( !file )
							return;

						const zip = await JSZip.loadAsync(file);

						for( let path in zip.files ){

							if( path !== 'save.json' )
								continue;

							const entry = zip.files[path];

							try{

								const raw = JSON.parse(await entry.async("text"));
								const existing = await Game.getDataByID(raw.id);
								if( existing ){

									if( !confirm("Game ID already exists, are you sure you want to overwrite?") )
										return;


								}

								await Game.saveToDB(raw);
								this.loadGameInput.value = "";
							
								Game.net.leaveNetgame();
								localStorage.game = raw.id;
								Game.load();
								this.close(true);


							}catch(err){

								let reason = "JSON Error";
								if( err === "INVALID_ID" )
									reason = 'Required parameters missing';
								alert("This is not a valid game file ("+reason+")");
								console.error(err);

							}


							break;

						}

					});

					const onModDownloadClick = event => {

						clearTimeout(event.target._timeout);
						event.target.value = 'Downloading...';
						event.target._timeout = setTimeout(() => {
							event.target.value = event.target._value;
						}, 3000);
						game.modRepo.downloadMod(event.target.dataset.mod);

					};

					const searchMods = async () => {

						const results = await game.modRepo.search(this.modSearchInput.value);

						let html = '';
						for( let mod of results.results ){
							
							html += '<div class="mod">';

								html += '<h3>'+esc(mod.name)+'</h3>';
								html += '<p class="subtitle">By '+esc(mod.creatorName)+', last updated '+fuzzyTime(new Date(mod.date_updated).getTime())+'.</p>';
								html += '<p class="subtitle">'+
									'In '+esc(mod.category)+' - '+
									'Build '+(parseInt(mod.build_nr) || 1)+' - '+
									'FQ '+(parseInt(mod.fq_version) || 1)
								'</p>';
								html += '<p class="desc">'+esc(mod.description.trim())+'</p>';

								html += '<input type="button" data-mod="'+esc(mod.token)+'" value="Download ('+fuzzyFileSize(parseInt(mod.filesize) || 1)+')">';
								
							html += '</div>';

						}

						this.modSearchResults.innerHTML = html;

						this.modSearchResults.querySelectorAll("input[data-mod]").forEach(el => {
							el._value = el.value;
							el.onclick = onModDownloadClick;	
						});

					};

					this.modSearchForm.addEventListener('submit', event => {
						event.preventDefault();

						// Perform search
						searchMods();

					});

					searchMods();


					// Groupfinder ONCE
					const baseChar = new GfPlayer();
					baseChar.loadFromLocalStorage();
					this.groupFinder.characterName.value = baseChar.name;
					this.groupFinder.characterImage.value = baseChar.image;
					this.groupFinder.characterIs.value = baseChar.is;
					this.groupFinder.characterWants.value = baseChar.wants;
					this.groupFinder.characterAutoJoin.checked = Boolean(localStorage.gfAutoJoin);

					this.groupFinder.chatClose.addEventListener('click', event => {

						game.uiClick(event.target);
						this.groupFinder.chatBody.replaceChildren();
						this._gf_chat = false;
						this.groupFinder.chat.classList.toggle('hidden', true);

					});

					this.groupFinder.chatInput.addEventListener('keydown', event => {

						if( event.key === 'Enter' ){

							event.preventDefault();

							if( !Game.net.canGroupFinderMessage() )
								return;

							const text = event.target.innerText.trim();
							event.target.innerText = '';

							const ch = Game.net.getGroupFinderPlayerById(this._gf_chat);
							if( text && ch )
								Game.net.sendGroupFinderMessage(ch, text);
							return;

						}

					});

					this.groupFinder.characterForm.addEventListener('submit', async event => {
						event.preventDefault();

						let 
							name = this.groupFinder.characterName.value.trim(),
							image = this.groupFinder.characterImage.value.trim(),
							is = this.groupFinder.characterIs.value.trim(),
							wants = this.groupFinder.characterWants.value.trim()
						;
						if( !name ){

							game.ui.modal.addError('Please enter a name');
							return;

						}

						if( image && !image.startsWith('https://') ){
							
							game.ui.modal.addError('Image must be https or empty');
							return;

						}

						const ch = new GfPlayer({
							name : name,
							image : image,
							is : is,
							wants : wants
						});
						ch.saveToLocalStorage();

						localStorage.gfAutoJoin = this.groupFinder.characterAutoJoin.checked ? '1' : ''; 

						try{

							game.uiClick(event.target);
							await Game.net.joinGroupFinder();
							this.refresh(true);	
											

						}catch(err){
							console.error(err);
						}



					});

					this.groupFinder.disconnect.addEventListener('click', async event => {

						game.uiClick(event.target);
						await Game.net.leaveGroupFinder();
						this.refresh();

					});

					this.groupFinder.chatGameInvite.addEventListener('click', async event => {

						if( !Game.net.canGroupFinderMessage() )
							return;

						const ch = Game.net.getGroupFinderPlayerById(this._gf_chat);
						if( ch )
							Game.net.sendGroupFinderMessage(ch, '!!GAMEINVITE!!'+Game.net.public_id);

					});

					const doRefresh = () => this.refresh();
					Game.net.bind('gf', doRefresh);
					Game.net.bind('disconnect', doRefresh);

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
								<input type="text" class="autoSave" style="font-size:2vmax" name="name" placeholder="Character Name" required /><br />
								Species: <br /><input type="text" class="autoSave" style="width:auto" name="species" placeholder="Species" required /><br />
								Class: <div class="class"><!-- Class listing goes here --></div>
								Size: <br />
								<div class="center">Tiny <input type="range" style="width:60%" class="autoSave" name="size" min=0 max=10 /> Giant</div>
								Tags (control+click to remove): <input type="button" class="addTag" value="Add Tag" /><br />
								<div class="tags"></div>
								<textarea name="description" class="autoSave"></textarea>
								Dressed: <input type="text" class="small reloadIcon autoSave" name="icon" placeholder="Dressed Art" /><br />
								Bottomless: <input type="text" class="small reloadIcon autoSave" name="icon_upperBody" placeholder="UpperBody Art" /><br />
								Topless: <input type="text" class="small reloadIcon autoSave" name="icon_lowerBody" placeholder="LowerBody Art" /><br />
								Nude: <input type="text" class="small reloadIcon autoSave" name="icon_nude" placeholder="Nude Art" /><br />
								<div class="center">Sub <input type="range" style="width:60%" class="autoSave" name="dominant" min=0 max=1 step=0.1 /> Dom</div>
								<div class="center">Gay <input type="range" style="width:60%" class="autoSave" name="hetero" min=0 max=1 step=0.1 /> Het</div>
							</div>
							<div class="right">
								<div class="portrait">
									<div class="image"></div>
									`+this.generatePlayerLayerPreviewButtons()+`
								</div>
								<h3>Templates</h3>
								<div class="gallery"><!-- Gallery entries here --></div>
							</div>
						</div>

						<hr />

						<input type="submit" value="Start Game" />

					</form></div>
					<div class="hidden datalists"></div>
				`;
			})
			.setProperties(function(){
				
				const dom = this.getTabDom('New Game')[0];

				this.cData = {
					form : dom.querySelector('form.newGameForm'),
					image : dom.querySelector('div.image'),
					name : dom.querySelector('input[name=name]'),
					species : dom.querySelector('input[name=species]'),
					size : dom.querySelector('input[name=size]'),
					dominant : dom.querySelector('input[name=dominant]'),
					hetero : dom.querySelector('input[name=hetero]'),
					class : dom.querySelector('div.class'),
					addTagButton : dom.querySelector('input.addTag'),
					tags : dom.querySelector('div.tags'),
					description : dom.querySelector('textarea[name=description]'),
					dressed : dom.querySelector('input[name=icon]'),
					nude : dom.querySelector('input[name=icon_nude]'),
					upperBody : dom.querySelector('input[name=icon_upperBody]'),
					lowerBody : dom.querySelector('input[name=icon_lowerBody]'),
					gameName : dom.querySelector('input.gameName'),
					layersDiv : dom.querySelector('div.right div.layers'),
				};
				this.gallery = dom.querySelector('div.gallery');
				this.tagList = dom.querySelector('div.datalists');

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

				

			})
			.setDraw(async function(){

				this.player = new Player();

				this.tagList.innerHTML = this.constructor.getTagDatalistHtml();
				
				const cdImage = this.cData.image, cdLayers = this.cData.layersDiv;

				// Updates the class labels
				const updateClass = () => {

					this.cData.classInputs.forEach(input => {

						const checked = input.value === this.player.class.label;
						input.checked = checked;
						input.parentNode.classList.toggle('selected', checked);

					});

				};


				
				const reloadIcon = () => {
					self.updatePlayerLayerPreview(cdImage, cdLayers, this.player);
				};


				// Updates fields from player
				const updateFields = () => {

					this.cData.name.value = this.player.name;
					this.cData.species.value = this.player.species;
					this.cData.size.value = this.player.size;
					this.cData.hetero.value = this.player.hetero;
					this.cData.dominant.value = this.player.dominant;
					
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
					reloadIcon();

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

						if( !event.ctrlKey && !event.metaKey )
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

						pl.species = pl.species.toLowerCase();
						pl.spre = 'a';
						if( 
							!['unicorn', 'ewe'].includes(pl.species) && 
							'aeiou'.includes(pl.species.charAt(0)) 
						)pl.spre = 'an';

						Game.new(name, [pl]);
						this.close( true );
					});

				}

				// Load a default template and update fields
				loadTemplate(this.gallery.children[0].dataset.label);
				updateFields();

				self.bindPlayerLayerPreviewButtons(cdImage, cdLayers, this.player);


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

							<h3>Cosmetic</h3>
							<div class="cosmetic"><!-- Cosmetic assets here --></div>

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
			.addTab("Actions", () => {
				return `
					<div class="slots titleSpan">
						<span>Active</span>
						<div class="slotsWrapper"></div>
					</div>
					<div class="titleSpan">
						<span>Available</span>
						<div class="available"></div>
					</div>`;
			})
			
			.addTab("Library", () => {
				return `
					<p>This is your party's shared recollection of stories.</p>
					<div class="library flexAuto">
						<div class="noBooks">You have not read any books yet</div>
						<div class="books hidden"></div>
					</div>
				`;
			})
			.setProperties(function(){
				
				const main = this.getTabDom('Inventory')[0];

				const actives = this.actives = this.getTabDom('Actions');

				let html = '';
				for( let i=0; i < Player.MAX_ACTION_SLOTS; ++i )
					html += UI.Templates.actionButton;
				$("div.slots > div.slotsWrapper", actives).html(html);

				this.actions = {
					activeButtons : $("div.slots > div.slotsWrapper > div.action", actives),
					available : $("div.titleSpan > div.available", actives),
				};

				this.main = {
					equipment : main.querySelector('div.equipment'),
					toolbelt : main.querySelector('div.toolbelt'),
					cosmetic : main.querySelector('div.cosmetic'),
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


				const library = this.getTabDom('Library')[0];
				this.library = {
					noBooks : library.querySelector('div.noBooks'),
					books : library.querySelector('div.books')
				};
								

			})
			.setDraw(async function(){

				const player = game.getMyActivePlayer();
				if( !player )
					return;

				// Actions
					this.toggleTab('Actions', player === game.getMyActivePlayer());
					this.actions.activeButtons.toggleClass("detrimental disabled", false);
					
					// Active actions
					const numSlots = player.getNrActionSlots();
					for( let i = 0; i<Player.MAX_ACTION_SLOTS; ++i ){

						const el = $(this.actions.activeButtons[i]);
						el.toggleClass('button', true);

						let action = player.getActionAtSlot(i);

						// We have an action in this slot
						if( action )
							UI.setActionButtonContent(el, action, player, i+2, true);
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
					const inactive = player.getInactiveActions();

					let inactiveEls = $("> div.action", this.actions.available);
					
					// Append icons if need be
					for( let i=inactiveEls.length; i<inactive.length; ++i ){
						this.actions.available.append(UI.Templates.actionButton);
					}
					inactiveEls = $("> div.action", this.actions.available);
					inactiveEls.toggleClass("hidden", true);

					for( let i =0; i<inactive.length; ++i ){

						const el = inactiveEls[i],
							abil = inactive[i];
						UI.setActionButtonContent(el, abil, player);

					}

					// Bind stuff
					this.actions.activeButtons.off('click').on('click', event => {
						
						const el = $(event.currentTarget),
							id = el.attr('data-id');
						if( el.is('.empty') )
							return;

						game.toggleAction(player, id);
						game.uiAudio( "spell_disable" );

					});

					inactiveEls.off('click').on('click', event => {
						const el = $(event.currentTarget),
							id = el.attr('data-id');

						game.toggleAction(player, id);
						game.uiAudio( "spell_enable" );

					});

				//
				
				
				// Inventory

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
							else if( player.canEquip(asset) )
								modal.addSelectionBoxItem( 'Equip', '', 'equip' );

							if( asset.isConsumable() && asset.isUsable() && (!game.battle_active || (game.isTurnPlayer(player) && isHotbar)) ){
								modal.addSelectionBoxItem( 'Use', asset.use_action.getTooltipText(), 'use' );
							}

							const game_actions = asset.game_actions.filter(el => el.validate(player));
							for( let i in game_actions ){

								const a = game_actions[i];
								modal.addSelectionBoxItem(a.desc, false, 'GA:'+a.id);

							}
							

							if( 
								game.getTeamPlayers( player.team ).filter(el => el.id !== player.id).length && 
								!game.battle_active &&
								!asset.soulbound
							)
								modal.addSelectionBoxItem( 'Trade', game.battle_active ? '[3 AP]' : '', 'trade' );

							modal.addSelectionBoxItem( 'Link', false, 'link' );

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
								else if( task === 'link' ){
									game.ui.sendChat( "/me highlights $ITM"+asset.id+"$" );
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

										if( player.getMomentum(Player.MOMENTUM.Uti) < 3 ){

											modal.addError("Not enough utility momentum");
											modal.closeSelectionBox();
											return;

										}
										else if( game.isTurnPlayer(player) ){

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
								else if( task.startsWith('GA:') ){
									game.useAssetGameAction( asset.getUseActionById(task.substring(3)));
								}

								modal.closeSelectionBox();


							});
							
						}

						ui.onTooltipMouseout();

					};


					// Create equipment slots
					let slots = [
						{slot:Asset.Slots.upperBody, icon:'breastplate'},
						{slot:Asset.Slots.lowerBody, icon:'armored-pants'},
						{slot:Asset.Slots.hands, icon:'crossed-swords'}
					];
					const createEquipSlot = async (slot, fallback, index = 0) => {

						const asset = player.getEquippedAssetsBySlots(slot, true)[index];

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
						divs.push(await createEquipSlot(Asset.Slots.action, 'media/wrapper_icons/potion-ball.svg', i));
					this.main.toolbelt.replaceChildren(...divs);

					slots = [
						{slot:Asset.Slots.upperBodyCosmetic, icon:'gauntlet'},
						{slot:Asset.Slots.lowerBodyCosmetic, icon:'leg-armor'},
						{slot:Asset.Slots.jewelleryCosmetic, icon:'big-diamond-ring'}
					];
					divs = [];
					for( let slot of slots )
						divs.push(await createEquipSlot(slot.slot, 'media/wrapper_icons/'+slot.icon+'.svg'));
					this.main.cosmetic.replaceChildren(...divs);

					// Create listing
					let inv = [];
					const assets = player.getAssets();
					for(let asset of assets)
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

						let cNames = [];	// Additional classNames
						if( game.battle_active && player.canEquip(item) )
							cNames.push('reequip');

						const div = await StaticModal.getGenericAssetButton(item, undefined, cNames.join(' '));
						divs.push(div);
						
					}
					mainInv.replaceChildren(...divs);

					
					mainInv.querySelectorAll('div.item[data-id]').forEach(el => el.addEventListener('click', onAssetClick));

				// 

				// Library
				const booksRead = game.books_read.keys();
				this.library.noBooks.classList.toggle('hidden', Boolean(booksRead.length));
				this.library.books.classList.toggle('hidden', !booksRead.length);
				
				// Update books
				let children = [];
				booksRead.sort();
				for( let key of booksRead ){
					
					let child = document.createElement('div');
					let name = game.books_read[key].name;
					child.classList.add('book', 'button');
					children.push(child);
					child.innerText = name;

					child.addEventListener('click', () => {

						if( !game.is_host ){

							Game.net.playerGetLargeAsset(player, 'book', key);
							return;

						}
							
						game.readBook(player, key);


					});

				}
				this.library.books.replaceChildren(...children);
				
			});
		// Asset editor
		this.add(new this("assetLibrary", "Asset Library"))
			.addTab("Library", () => {
				return `
					<div class="inventory tooltipShrink">
						<input type="button" class="create green" value="Create" />
						<div class="listing"></div>
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
							<label><input type="checkbox" name="cursed" value="1" /> Force curse</label><br />
				
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
					listing : library.querySelector('div.listing'),
					create : library.querySelector('input.create'),
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
				this.library.create.addEventListener('click', () => {

					this._asset = null;
					StaticModal.setWithTab('assetLibrary', 'Editor');

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
					a.tags = getEl("textarea[name=tags]").value.trim().split(' ').filter(el => el !== "").map(el => 'as_'+el);
					
					try{
						const wrappers = JSON.parse(getEl("textarea[name=wrappers]").value.trim());
						a.wrappers = wrappers.map(el => {

							const out = new Wrapper(el, a.parent);
							if( a.parent )
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

						let out = '';
						for( let wrapper of wrappers ){
		
							if( wrapper.description )
								out += '<div class="quickStat">'+esc(wrapper.description)+'</div>';
								
						}
						getEl("span.quickStats").innerHTML = out;

					}catch(err){
						console.error(err);
					}
				};



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
						parseInt(getEl("input[name=rarity]").value) || 0,
						undefined,
						undefined,
						undefined,
						getEl("input[name=cursed]").checked
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
				if( !(this._asset instanceof Asset) ){

					this._asset = new Asset();
					this._asset.level = game.getAveragePlayerLevel();

				}

				asset = this._asset;

				// Clicked an asset
				const handleAssetClick = event => {

					let id = event.currentTarget.dataset.id,
						assetObj = glib.get(id, 'Asset')
					;
					if( event.ctrlKey || event.metaKey ){

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

					else if( player.addLibraryAsset(id) ){

						game.save();
						StaticModal.set('inventory');
						game.ui.draw();
						game.ui.setTooltip();

					}

				};

				let lib = Object.values(glib.getFull('Asset'));
				lib.sort((a, b) => {
					
					if( a._custom !== b._custom )
						return a._custom ? -1 : 1;
					
					return a.name < b.name ? -1 : 1;

				});
				let divs = [];
				for( let asset of lib ){

					const div = await StaticModal.getGenericAssetButton(asset);
					div.dataset.id = asset.label;
					div.classList.add('third');
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

					getField('textarea[name=wrappers]').value = JSON.stringify(Wrapper.saveThese(a.wrappers, "mod"), null, 4);


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
			.addTab("Gameplay", () => {
				return `
					<h3>Map Controls</h3>
					<p>Click the map icon or hit space to view the map.</p>
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

					<h3>Combat</h3>
					<ul>
						<li>Click and drag an action from the bottom bar onto the character you want to target.</li>
						<li>You can also click once on the action and then again on the target.</li>
						<li>Some actions may be grouped, such as arouse/attack/wild magic.</li>
						<li>When picking a target, you'll see a percent chance to hit, and an advantage. The more advantage, the more damage you do. The hit chance is based on your proficiency in a damage type vs enemy avoidance to that type.</li>
						<li>The green dots above your action bar are stamina.</li>
						<li>The blue dots above your action bar are mana.</li>
						<li>You can use as many actions as you want in a turn as long as you have enough resources, and the action isn't on cooldown.</li>
						<li>See the stats tab for more in-depth.</li>
					</ul>

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
						<tr>
							<td>w</td>
							<td>Toggle mini map</td>
						</tr>
						<tr>
							<td>C</td>
							<td>Toggle group finder</td>
						</tr>
						<tr>
							<td>TAB</td>
							<td>Switch between grouped actions while one of its actions are selected. Such as Attack/Arouse/Shock.</td>
						</tr>
					</table>
				`;
			})
			.addTab("Online Game", () => {
				return `
					<h3>Setup</h3>
					<ol>
						<li>Load the game you want to put online.</li>
						<li>Enter the settings menu (cog), and select the Online tab.</li>
						<li>Click "Put this session online", and wait a few seconds while your game is put online.</li>
						<li>Send the provided link to the person you want to invite.</li>
					</ol>
					<h3>Creating a Player</h3>
					<p>Note: When playing with someone you know, they can create their own character and export it as an fqchar file by clicking their character portrait and scrolling to the bottom of their inspect window. They can then send you that fqchar file and the DM can pick the settings menu Import Player option to import it.</p>
					<ol>
						<li>Go to the DM tab of the settings menu.</li>
						<li>Click "+ Add Player"</li>
						<li>Enter their name in the "unknown player" field. Do not hit Generate, as this generates a random enemy.</li>
						<li>Article can be left empty as it's auto generated. Some species where the rule of vowel = "an", consonant = "a" doesn't make sens, such as "a unicorn" (starts with a vowel but uses a) will need you to manually enter "a" as the article.</li>
						<li>Species should be the exact species, such as "snow leopard".</li>
						<li>Voice is a work in progress, ignore it for now.</li>
						<li>Pronouns are optional, but can be changed if the auto pronouns don't match your preferred ones.</li>
						<li>For class, pick one not starting with [M], classes starting with [M] are monster classes.</li>
						<li>Level is your player level, can usually be left as is.</li>
						<li>Size is the player size. Middle is average humanoid, all the way left is something like a football, and all the way to the right something like a dragon. I suggest leaving it centered with one tick left or right if you want to be shorter or taller than average.</li>
						<li>Image dressed = Character art when the player is dressed.</li>
						<li>Image bottomless [optional] = Character art where the player has no lower body armor</li>
						<li>Image topless [optional] = Character art where the player has no upper body armor</li>
						<li>Image naked [optional] = Character art where the player is naked</li>
						<li>Leave HP/AP/MP/Arousal as they are. They can be used by the DM once the character is created to change resources on the fly.</li>
						<li>Leave team at 0 for the character to be on the player team. Use 1 or higher to make them an enemy.</li>
						<li>Tags: Hit add tag and add any tags from the list that match your character. The species tag is more generic than the species manually marked. So if your character species is "husky", you may want to add the "canine" tag.</li>
						<li>Description: Write anything you want about the character.</li>
						<li>Sadistic/Dom/Het sliders: Primarily used by NPCs to change their behavior. But feel free to set these for player as a reminder whenever roleplaying.</li>
						<li>Kinks: Leave as none to auto generate. Each humanoid always has two kinks. Or you can manually set them if you prefer.</li>
						<li>Leave avoidance/proficiency at 0, as the player stats are derived from their class. But a DM has the option to tweak proficiencies and avoidancies here if they really want that level of character customization.</li>
						<li>Click save to add your new character. Actions are added automatically.</li>
						<li>Wait for a coop player to join.</li>
						<li>Close the menu and hover over the player, click the small ID card button and select the name of the player who should control it.</li>
						<li>If a player controls multiple character, a video game controller shows up when they hover over it, and allows them to select their active character.</li>
						<li>Click the crown icon to grant that player permissions to interact with doors.</li>
					</ol>
				`;
			})
			.addTab("Stats", () => {
				return `
					<h3>Resources</h3>
					<table>
						<tr>
							<td>Hit points</td>
							<td>The large numnber on your character bar. When it reaches 0, you are defeated.</td>
						</tr>
						<tr>
							<td>Stamina</td>
							<td>The green dots on your action bar. You gain 40% back at the start of your turn.</td>
						</tr>
						<tr>
							<td>Mana</td>
							<td>The blue dots on your action bar. You gain 1 mana every 3 turns.</td>
						</tr>
						<tr>
							<td>Arousal</td>
							<td>The pink number on your character portrait. At max arousal you orgasm, losing all AP and gaining reduced AP regen and hit chance for 2 turns.</td>
						</tr>
						<tr>
							<td>Armor Durability</td>
							<td>You have two armor slots that affect damage taken, upp and lower body. Their durability is shown as the pants/shirt icons on your character. Broken armor does not give any benefits to the wearer.</td>
						</tr>
						<tr>
							<td>Armor</td>
							<td>Shown as a small shield icon on the character. Reduces all damage taken by that percent. Humanoids gain armor by wearing clothes, beasts have innate armor.</td>
						</tr>						
					</table>

					<h3>Damage Types</h3>
					<p>Each action has a type, either Physical, Corruption, or Arcane. Damage taken is based on the attacker's proficiency in the attack type, and the victim's avoidance of said type. In addition, each type has a secondary effect:</p>
					<table>
						<tr>
							<td>Physical</td>
							<td>Has a chance to damage armor.</td>
						</tr>
						<tr>
							<td>Corruption</td>
							<td>Has a chance to arouse.</td>
						</tr>
						<tr>
							<td>Arcane</td>
							<td>Has a chance to remove 1 block of all types.</td>
						</tr>
					</table>

					<h3>Damage Range</h3>
					<p>Each ability can either be no range, melee, or ranged.</p>
					<table>
						<tr>
							<td>No Range</td>
							<td>Usually tied to abilities targeting the caster.</td>
						</tr>
						<tr>
							<td>Melee</td>
							<td>Can be used whenever not knocked down.</td>
						</tr>
						<tr>
							<td>Ranged</td>
							<td>Can be used whenever not dazed.</td>
						</tr>
					</table>

					<h3>Block</h3>
					<p>Some actions may grant block, attaching a shield to the character portrait. The player will block said amount of damage when receiving it. Block falls off at the start of your next turn. If you apply block to another player, they gain block until their second turn starts.</p>

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

	static async generateWallet( currencyDiv ){

		const myPlayer = game.getMyActivePlayer();

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

	}

	static async updateWallet(baseElement, shop, win){

		const myPlayer = game.getMyActivePlayer();
		// Exchange button
		const exchangeButton = baseElement.querySelector('input[name=exchange]');
		if( exchangeButton ){
			exchangeButton.classList.toggle('hidden', !myPlayer.canExchange());
			if( !exchangeButton._bound ){

				exchangeButton.addEventListener('click', event => {
					game.exchangePlayerMoney(myPlayer);
					if( win )
						win.refresh();
				});
				exchangeButton._bound = true;

			}
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


		if( shop ){

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

		}

	};

	// Creates buttons to be put into the player preview window. Used in the player editor, and on a new game.
	static generatePlayerLayerPreviewButtons(){

		return `
		<div class="layers artLayers">
			<div class="button selected" data-layer="dressed">Dressed</div>
			<div class="button" data-layer="upperBody">Bottomless</div>
			<div class="button" data-layer="lowerBody">Topless</div>
			<div class="button" data-layer="nude">Nude</div>
		</div>`;

	}

	static updatePlayerLayerPreview( imageDiv, layersDiv, player ){

		let slot = $('> div.button', layersDiv).filter('.selected');
		if( !slot.length )
			slot = 'dressed';
		else
			slot = slot.attr('data-layer');
		
		const tags = {
			'dressed' : [stdTag.asUpperBody, stdTag.asLowerBody],
			'upperBody' : [stdTag.asUpperBody],
			'lowerBody' : [stdTag.asLowerBody],
			'nude' : [],
		};

		// Create a temporary player to get the actual art
		let tmpChar = new Player({
			icon : player.icon,
			icon_upperBody : player.icon_upperBody,
			icon_lowerBody : player.icon_lowerBody,
			icon_nude : player.icon_nude,
		});
		tmpChar._cache_tags = tags[slot];	// Uses the cache or pl_ will be auto added
		$(imageDiv).css('background-image', 'url(\''+esc(tmpChar.getActiveIcon(true))+'\')');

	}

	// Binds updates for when clicking the player preview player buttons, and draws the image immediately
	static bindPlayerLayerPreviewButtons( imageDiv, layersDiv, player ){

		$('> div.button', layersDiv).off('click').on('click', event => {

			let btn = event.currentTarget;
			$("> div.button", layersDiv).toggleClass('selected', false);
			btn.classList.toggle('selected', true);
			this.updatePlayerLayerPreview(imageDiv, layersDiv, player);

		});
		this.updatePlayerLayerPreview(imageDiv, layersDiv, player);

	}

	// Creates player preview

	// startsWith is the type of tag, or set it to false if you want to allow all tags
	// shorten will remove the "type_" part
	static getTagDatalistHtml( startsWith = 'pl', shorten = true ){
		let out = '<datalist id="newGameTags"><select>';

		let viable = glib.getAllTags();
		
		for( let tag of viable ){

			const spl = tag.split('_');
			if( !startsWith || spl[0] === startsWith ){

				if( shorten )
					spl.shift();
				out+= '<option value="'+esc(spl.join('_'))+'"></option>';

			}

		}
		out += '</select></datalist>';
		return out;
	}

	static getVoiceDatalistHtml(){
		let out = '<datalist id="voices"><select>';

		let viable = AudioTrigger.getAllLabels();
		for( let v of viable )
			out+= '<option value="'+esc(v)+'"></option>';
		out += '</select></datalist>';
		return out;
	}
	

}

StaticModal.lib = {};
StaticModal.built = false;
StaticModal.main = null;
StaticModal.active = null;