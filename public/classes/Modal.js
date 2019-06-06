/*

	The modal is the overlay which has the player info, 3d dungeon map etc
	You can bind events on it to force refresh for an instance when user data is received to keep the UI up to date with the network

*/
export default class Modal{

	constructor(parent){

		this.id = Math.random();

		this.parent = parent;
		this.bg = $("#modal");
		this.wrapper = $("#modal > div.wrapper");
		this.content = $("#modal > div.wrapper > div.content");
		this.closebutton = $("#modal > div.wrapper > input");
		this.selectionbox = $("div.selectionbox");
		this.notices = $("#notices");
		
		this.open = false;
		this._onPlayerChange = {};		// playerUUID : function
		this._onShopChange = {};		// playerUUID : function
		this.onMapChange = [];			// callbacks
		this.selBoxOpened = Date.now();		// Prevents misclicks
		this._onSelectionBoxClose = null;
		this._onModalClose = null;

		this.bg.off('mousedown touchstart').on('mousedown touchstart', event => {
			event.stopImmediatePropagation();
			this.close();
		});
		this.closebutton.off('click touchstart').on('click touchstart', event => {
			event.stopImmediatePropagation();
			this.close();
		});

		this.wrapper.off('mousedown touchstart').on('mousedown touchstart', event => {
			event.stopImmediatePropagation();
			if( this.selBoxOpened+250 < Date.now() )
				this.closeSelectionBox();
		});

		$(document).off('click touchstart').on('click touchstart', () => {
			if( this.selBoxOpened+250 < Date.now() ){
				this.closeSelectionBox();
			}
		});

		this.selectionbox.off('click touchstart').on('click touchstart', event => {
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
	onShopChange(shop, fn){
		this._onShopChange[shop] = fn;
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
		this._onShopChange = {};
		this.onMapChange = [];
	}


	/* EVENT HANDLERS */
	// Game update received from the netcode
	onGameUpdate( changes ){

		if( changes.players ){
			for( let p of changes.players ){
				if( 
					Object.keys(p).length > 1 && 
					this._onPlayerChange[p.id]
				)this._onPlayerChange[p.id]();
			}
		}

		if( changes.state_shops ){
			this.onShopChange(changes.state_shops);
		}

		if( changes.dungeon && !game.is_host ){
			this.onMapChange.map(fn => fn());
		}

	}
	
	// Changes is the generic object which holds the shops
	onShopUpdate( changes ){
		for( let i in this._onShopChange ){
			if( changes[i] )
				this._onShopChange[i]();
		}
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

		this.positionSelectionBox();

	}

	// Macro that prepares and setups a selection box with one form
	makeSelectionBoxForm( html = '', callback = false, keepPosition = true ){
		this.prepareSelectionBox(keepPosition);
		this.addSelectionBoxItem( 
			'<form>'+html+'</form>', 
			'', '', ['form'], false 
		);
		const th = this;
		$("div.item", this.selectionbox).off('click');
		$("form", this.selectionbox).on('submit', function(event){
			event.preventDefault();
			event.stopImmediatePropagation();
			if( callback ){
				th.closeSelectionBox();
				callback.call(this, event);
				
			}
		});
		
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

	positionSelectionBox(){
		const pe = this.selectionbox;
		const pos = pe.offset(),
			width = pe.outerWidth(),
			height = pe.outerHeight();

		let left = pos.left,
			top = pos.top;

		const bottomPixel = top+height, rightPixel = left+width;
		const wh = window.innerHeight, ww = window.innerWidth;

		if( rightPixel > ww )
			left += (ww-rightPixel);
		if( bottomPixel > wh )
			top += (wh-bottomPixel);
		if( left < 0 )
			left = 0;
		if( bottomPixel < 0 )
			left = 0;

		this.selectionbox.css({
			left : left+"px",
			top : top+"px",
		});
	}

}
