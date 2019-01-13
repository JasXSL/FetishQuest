/*

	The modal is the overlay which has the player info, 3d dungeon map etc
	You can bind events on it to force refresh for an instance when user data is received to keep the UI up to date with the network

*/
export default class Modal{

	constructor(parent){

		this.parent = parent;
		this.bg = $("#modal");
		this.wrapper = $("#modal > div.wrapper");
		this.content = $("#modal > div.wrapper > div.content");
		this.closebutton = $("#modal > div.wrapper > input");
		this.selectionbox = $("div.selectionbox");
		this.notices = $("#notices");
		
		this.open = false;
		this._onPlayerChange = {};		// playerUUID : function
		this.onMapChange = [];			// callbacks
		this.selBoxOpened = Date.now();		// Prevents misclicks
		this._onSelectionBoxClose = null;
		this._onModalClose = null;

		this.bg.off('mousedown').on('mousedown', () => {
			this.close();
		});
		this.closebutton.off('click').on('click', () => {
			this.close();
		});

		this.wrapper.off('mousedown').on('mousedown', event => {
			event.stopImmediatePropagation();
			if( this.selBoxOpened+100 < Date.now() )
				this.closeSelectionBox();
		});

		$(document).off('click').on('click', () => {
			if( this.selBoxOpened+100 < Date.now() )
				this.closeSelectionBox();
		});

		this.selectionbox.off('click').on('click', event => {
			event.stopImmediatePropagation();
		});

	}

	
	/* PRIMARY FUNCTIONALITY */
	// If canvas is set, it sets up the canvas in a backdrop
	set( html, canvas ){

		// Close the selection box (the small selection tooltip)
		if( !canvas )
			this.closeSelectionBox();
		this.wipeEvents();
		this.content.html(html);
		this.bg.toggleClass("hidden", false).toggleClass('canvas', !!canvas);
		this.open = true;

		// If canvas is included, start rendering
		if( canvas ){
			this.content.prepend('<div class="CANVAS_HOLDER"></div>');
			$("> div.CANVAS_HOLDER", this.content).append(canvas);
		}

	}

	close(){

		if( typeof this._onModalClose === "function" )
			this._onModalClose();

		this.open = false;
		this.wipeEvents();
		this.bg.toggleClass("hidden", true);

	}

	

	/* NOTICES */
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



	/* EVENT BINDERS */
	// Needs to be called after set, since set and close wipes all events
	onPlayerChange(player, fn){
		this._onPlayerChange[player] = fn;
	}
	// The map has been changed
	onMapUpdate(fn){
		this.onMapChange.push(fn);
	}
	// The small selectionBox tooltip has been closed
	onSelectionBoxClose( callback ){
		this._onSelectionBoxClose = callback;
	}
	wipeEvents(){
		this._onPlayerChange = {};
		this.onMapChange = [];
	}


	/* EVENT HANDLERS */
	// Game update received from the netcode
	onGameUpdate( changes ){

		let playersChanged = {}, dungeonChanged;
		for( let c of changes ){

			if( !c.path )
				continue;

			// Many players can have changed
			if( c.path[0] === 'players' && game.players[c.path[1]] && this._onPlayerChange[game.players[c.path[1]].id] && !playersChanged[game.players[c.path[1]].id] ){
				playersChanged[game.players[c.path[1]].id] = true;	// makes sure onPlayerChange only gets called once per player
				this._onPlayerChange[game.players[c.path[1]].id]();		
			}
			
			if( c.path[0] === 'dungeon' )
				dungeonChanged = true;

		}

		if( dungeonChanged && !game.is_host )
			this.onMapChange.map(fn => fn());

	}
	

	/* VISUALS */	
	// Flashes the screen when an encounter starts
	battleVis(){
		this.bg.toggleClass("battleStart", true);
		setTimeout(() => {
			this.close();
			this.bg.toggleClass("battleStart", false);
		}, 2000);
	}


	/* SELECTION BOX (small option tooltip) */
	// Draws a hot menu (small tooltip) at the mouse location
	prepareSelectionBox( keepPosition ){

		this.selectionbox.html("").toggleClass('hidden', false);
		if( !keepPosition )
			this.selectionbox.css({left:game.renderer.mouseAbs.x, top:game.renderer.mouseAbs.y});
		this.selBoxOpened = Date.now();

	}
	// Adds an item to above menu, item is the name, tooltip gets put into a tooltip, and id gets put as data-id
	addSelectionBoxItem( item, tooltip, id, classes = [], escape = true ){
		let html = '';
		html += '<div data-id="'+esc(id)+'" class="item '+(tooltip ? ' tooltipParent ' : '')+classes.join(' ')+'">';
			if( escape )
				item = esc(item);
			html += item;

			if( tooltip )
				html += '<div class="tooltip">'+tooltip+'</div>';
		html += '</div>';
		this.selectionbox.append(html);
	}
	// Binds clicks to all items set above
	onSelectionBox( callback ){
		$("div.item", this.selectionbox).on('click', callback);
	}
	closeSelectionBox(){
		if( typeof this._onSelectionBoxClose === "function" ){
			this._onSelectionBoxClose();
			this._onSelectionBoxClose = null;
		}
		this.selectionbox.toggleClass('hidden', true);
	}

}
