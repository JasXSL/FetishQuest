import UI from './UI.js';

// Todo: Event bindings for modals to refresh etc

export default class StaticModal{

	// StaticModal works off of tabs. Even if your modal doesn't use tab, one "tab" is created, but is just not shown.
	constructor(id, title){

		this.id = id;
		this.dom = 
			$('<div id=\"'+esc(this.id)+'\" class="hidden">'+
				'<div class="header"><h1>'+esc(title)+'</h1></div>'+
				'<div class="modalMain bgMarble cmContent"></div>'+
				'<div class="cmTabs"></div>'+
			'</div>');
		this.onDraw = () => {};

		this.headerContainer = $('> div.header', this.dom);
		this.contentContainer = $('> div.modalMain', this.dom);
		this.tabContainer = $('> div.cmTabs', this.dom);

		this.tabs = {};
		

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

		this.tabContainer.toggleClass('hidden', Object.keys(this.tabs).length < 2 );
		
		obj.content.toggleClass("hidden", false);
		obj.label.toggleClass("hidden", false);

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
		if( Object.keys(this.tabs).length === 1 ){
			this.setActiveTab(label);
		}

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
		game.ui.bindTooltips();
		this.main.toggleClass("hidden", false);

		return obj.onDraw.call(obj, ...args);

	}

	static close(){
		// Close everything
		this.main.toggleClass("hidden", true);
		Object.values(this.lib).map(modal => modal.dom.toggleClass("hidden", true));
	}

	// Chainable
	static add( staticModal ){

		this.lib[staticModal.id] = staticModal;
		this.main.append(staticModal.dom);
		return staticModal;

	}

	// Only gets called once when the DOM loads. Bulids all the modal bases
	static ini(){

		if( this.built )
			return;
		this.built = true;

		this.main = $("#customModals");


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
			.addTab("actives", () => {
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
			.addTab("passives", () => {
				return 'Todo: Passives';
			})
			.setProperties(function(){

				const actives = this.actives = this.getTabDom('actives');
				
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
						.toggleClass('hidden', false)
					;

					$("> span", parent).html(html);


				}

				if( !learnable.length ){
					const el = $('> div.learnable:first', this.purchasable);
					el.toggleClass('hidden', false).toggleClass("disabled", true);
					$("> span", el).html('Check back later.');
					$("> div.action", el).toggleClass("hidden", true);
				}
				

				// Bind stuff
				this.activeButtons.off('click').on('click', event => {
					
					const el = $(event.currentTarget),
						id = el.attr('data-id');
					game.toggleAction(gymPlayer, player, id);

				});

				inactiveEls.off('click').on('click', event => {
					const el = $(event.currentTarget),
						id = el.attr('data-id');


					game.toggleAction(gymPlayer, player, id);

				});

				$("> div.learnable:not(.disabled)", this.purchasable).off('click').on('click', event => {
					
					const el = $(event.currentTarget),
						id = el.attr('data-id');

					game.learnAction( gymPlayer, player, id );
					

				});


			});


		
		

	}


}

StaticModal.lib = {};
StaticModal.built = false;
StaticModal.main = null;
