import UI from './UI.js';
import Player from './Player.js';
import Asset from './Asset.js';
import Action from './Action.js';

export default class StaticModal{

	// StaticModal works off of tabs. Even if your modal doesn't use tab, one "tab" is created, but is just not shown.
	constructor(id, title){

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

	refresh(){
		this.onDraw.apply(this, this.args);
	}

	addRefreshOn( path, fn ){

		this.refreshOn.push({path:path, fn:fn});
		return this;

	}







	// STATIC

	// Sets the active modal
	static set( id, ...args ){

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
		return this.refreshActive();
		

	}

	static close(){
		this.active = null;
		// Close everything
		this.main.toggleClass("hidden", true);
		Object.values(this.lib).map(modal => modal.dom.toggleClass("hidden", true));
	}

	static refreshActive(){

		if( !this.active )
			return;
		
		const out = this.active.refresh();
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
		this.main.on('click', event => {
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
					this.toggleCustomModals(false);
				});
				this.cancel.on('click', () => this.toggleCustomModals(false));

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

					let action = player.getActiveActionByIndex(i);
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

				// Bind events
				
				// Gameplay
				this.gameplay.difficulty.on('input', event => {
					console.log("Todo: Set difficulty to ", +$(event.currentTarget).val());	
				});

				// DM
				this.dm.toggle.on('click', event => {
					localStorage.hide_dm_tools = +ui.showDMTools();
					ui.board.toggleClass("dev", ui.showDMTools());
					$("input", event.currentTarget).prop("checked", ui.showDMTools());
				});
				this.dm.addPlayer.on('click', event => {
					ui.drawPlayerEditor();
					this.close();
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
				


				const knobs = ['ambient','fx','music','ui'];
				const audio = this.getTabDom("Audio");
				for( let knob of knobs ){
					$("input[name="+knob+"SoundVolume]", audio).val(Math.round(game['audio_'+knob].volume*100));
				}
				$("input[name=masterSoundVolume]", audio).val(Math.round(game.getMasterVolume()*100));

				this.toggleTab('DM', game.is_host);


			});
		

		// Player display
		this.add(new this("player", "Player"))
			.addRefreshOn(['players'])
			// Icon, description, worn items, experience
			.addTab("Character", () => {
				return `

					<h2 class="name"></h2>
					<em class="subName"></em>
					
					<p class="description"></p>
					<div class="devtool">
						<input type="button" class="editPlayer yellow" value="Edit Player" />
						<input type="button" class="red devtool" value="Delete" />
					</div>

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
			.addTab("DM", () => {
				return 'Todo: DM tab';
			})
			.setProperties(function(){

				const cDom = this.getTabDom('Character');
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

			})
			.setDraw(function( player ){

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
				let html = '';
				const slots = [
					Asset.Slots.lowerBody,
					Asset.Slots.upperBody,
					Asset.Slots.action,
					Asset.Slots.hands
				];
				const existing_assets = {};	// id:true
				for( let slot of slots ){

					const assets = player.getEquippedAssetsBySlots(slot, true);
					for( let asset of assets ){

						if( existing_assets[asset.id] )
							continue;
						existing_assets[asset.id] = true;

						html += '<div class="equipmentSlot '+(asset ? Asset.RarityNames[asset.rarity] : '')+(asset && asset.durability <= 0 ? ' broken' : '')+' item tooltipParent item">'+
							'<img class="bg" src="media/wrapper_icons/'+asset.icon+'.svg" />'+
							'<div class="tooltip">'+asset.getTooltipText()+'</div>'+
						'</div>';

					}
					
				}
				cDivs.equipment.html(html);


				html = '';
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


			});

	}


}

StaticModal.lib = {};
StaticModal.built = false;
StaticModal.main = null;
StaticModal.active = null;
