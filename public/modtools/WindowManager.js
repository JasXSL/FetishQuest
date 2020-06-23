const MIN_WIDTH = 300, MIN_HEIGHT = 200;

/*

	This has two modes: Floating and maximized
	Only one window can be drawn when it's maximized, the rest are minimized. Single click in the tray to swap between the windows.
	Not having a maximized window puts it into floating mode, where all windows are floating

*/

// Recursive, kinda
export default class Window{




	// id is a unique id, type is the type of asset (or window), parent is the parent window. Closing the parent also closes any children.
	// build is the build function
	constructor( id, type, name, icon, asset, build, parent ){

		this.id = id;
		this.type = type;
		this.icon = icon;
		this.asset = asset;
		this.build = build;
		this.name = name;
		this.dom = document.createElement("div");
		this.dom.classList.add("window", type.toLowerCase().split(" ").join("_"));
		this.dom.dataset.id = this.uniqid();
		this.parent = parent;
		
		this.minimized = false;

		this.dom.innerHTML = 
			'<div class="title">'+
				(icon ? '<img class="icon" src="/media/wrapper_icons/'+esc(icon)+'.svg" />' : '' )+
				'<span class="title"></span>'+
				'<div class="buttons">'+
					'<input type="button" value="_" class="minimize" />'+
					'<input type="button" value="&#x25FB;" class="maximize" />'+
					'<input type="button" value="X" class="close" />'+
				'</div>'+
			'</div>'+
			'<div class="content"></div>'+
			'<div class="resizer"></div>'
		;

		

		this.content = this.dom.querySelector("div.content");
		this.title = this.dom.querySelector("div.title");
		this.resizer = this.dom.querySelector("div.resizer");

		this.updateTitle();

		
		// Drag operation in progress
		this.dragging = false;
		// Offset from top left where we started the drag operation
		this.dragStart = {
			x : 0,
			y : 0
		};
		// Window position
		this.position = {
			x : 0,
			y : 0,
		};

		// Make draggable
		this.title.onmousedown = evt => {
			evt.preventDefault();

			if( this.minimized ){

				// We're in maximized swapping mode
				if( Window.hasMaximized() ){
					this.toggleMaximize(true);
				}

				return;
			}
			

			if( this.isMaximized() )
				return;

			const rect = this.dom.getBoundingClientRect();
			this.dragStart.x = evt.clientX-rect.left;
			this.dragStart.y = evt.clientY-rect.top;
			this.dragging = true;
		};


		this.title.ondblclick = evt => {
			evt.preventDefault();

			// If we're in maximized swapping mode, single click swaps
			if( Window.hasMaximized() && this.minimized )
				return;

			this.toggleMaximize(!this.minimized ? undefined : false);
		};
		
		// Resizing
		this.size = {
			w : MIN_WIDTH,
			h : MIN_HEIGHT
		};

		this.resizing = false;
		this.resizer.onmousedown = evt => {
			if( this.minimized )
				return;
			this.resizing = true;
		};

		document.addEventListener("mouseup", evt => {
			if( !this.resizing && !this.dragging )
				return;
			
			if( this.resizing ){
				Window.saveMeta(this);
				Window.onWindowResized(this);
			}
			else
				Window.onWindowMoved(this);
			this.resizing = this.dragging = false; 
			
		});

		document.addEventListener("mousemove", evt => {

			const bounding = this.dom.getBoundingClientRect(),
				top = bounding.top,
				left = bounding.left,
				width = bounding.right-left,
				height = bounding.bottom-top
			;

			if( this.dragging ){
					
				this.position.x = Math.min(Math.max(evt.clientX-this.dragStart.x, 10-width), window.innerWidth-10);
				this.position.y = Math.min(Math.max(evt.clientY-this.dragStart.y, 0), window.innerHeight-10);

				this.updatePosition();

			}
			if( this.resizing ){

				
				let evtLeft = Math.max(evt.clientX, 10),
					evtTop = Math.max(Math.min(evt.clientY, window.innerHeight), window.innerHeight*0.1)
				;

				this.size.h = Math.max(evtTop-top, MIN_HEIGHT);
				this.size.w = Math.max(evtLeft-left, MIN_WIDTH);

				this.updateSize();

			}

		});

		
		this.dom.addEventListener("mousedown", evt => {
			if( this.minimized )
				return;
			this.bringToFront();
		});


		// Button bindings
		this.title.querySelectorAll("div.buttons > input").forEach(el => {
			el.onmousedown = evt => evt.stopImmediatePropagation();
			el.onclick = evt => {

				evt.stopImmediatePropagation();
				const button = evt.currentTarget;
				if( button.classList.contains("minimize") )
					this.toggleMinimize();
				else if( button.classList.contains("maximize") )
					this.toggleMaximize();
				else if( button.classList.contains("close") )
					this.remove();

			};
		});


	}

	rebuild(){
		this.build();
	}

	reset(){

		if( this.isMaximized() )
			this.toggleMaximize();
		if( this.minimized )
			this.toggleMinimize(false);

		this.size.w = MIN_WIDTH;
		this.size.h = MIN_HEIGHT;
		this.center();
		Window.onWindowResized();	// Moved is handled by center

	}

	// Updates position based on position and offset
	updatePosition(){

		if( this.isMaximized() || this.minimized )
			return;

		this.dom.style.left = this.position.x+'px';
		this.dom.style.top = this.position.y+'px';

	}

	updateSize(){
		this.dom.style.width = this.size.w+"px";
		this.dom.style.height = this.size.h+"px";
	}

	center(){

		this.updateSize();	// Updates size before position

		// Center
		const rect = this.dom.getBoundingClientRect(),
			width = rect.right-rect.left,
			height = rect.bottom-rect.top
		;

		this.position.x = window.innerWidth/2-width/2;
		this.position.y = window.innerHeight/2-height/2;
		
		this.updatePosition();
		Window.onWindowMoved(this);

	}

	isMaximized(){
		return this.dom.classList.contains("maximized");
	}

	isHidden(){
		return this.dom.classList.contains("hidden");
	}

	getZindex(){
		return parseInt(this.dom.style.zIndex) || 0;
	}

	// Returning to a floating draggable state
	makeFloating(){

		if( this.minimized || this.isMaximized() )
			return;
		this.updateSize();
		this.updatePosition();

	}

	// Maximize changes the DOM
	toggleMaximize( force, ignoreFront ){

		const minimized = this.minimized;
		if( !ignoreFront )
			this.bringToFront();

		this.toggleMinimize(false, ignoreFront);
		
		if( (!this.isMaximized() || minimized || force) && force !== false ){

			Window.minimizeAll();
			this.toggleMinimize(false, ignoreFront);
			this.dom.classList.toggle("maximized", true);
			this.dom.style.removeProperty("top");
			this.dom.style.removeProperty("left");
			this.dom.style.removeProperty("width");
			this.dom.style.removeProperty("height");
			
		}
		else{
			this.dom.classList.toggle("maximized", false);
			this.makeFloating();
		}

		Window.onWindowMaximized(this);


	}

	toggleMinimize( minimize, ignoreFront ){

		if( minimize === undefined )
			this.minimized = !this.minimized;
		else
			this.minimized = Boolean(minimize);

		if( this.minimized ){
			this.dom.style.removeProperty("top");
			this.dom.style.removeProperty("left");
			this.dom.style.removeProperty("width");
			this.dom.style.removeProperty("height");
			// Move to minimization tray
			Window.minimizeContainer.appendChild(this.dom);
		}
		else{
			// Move out of minimization tray
			Window.windowContainer.appendChild(this.dom);
			this.makeFloating();
			if( !ignoreFront )
				this.bringToFront();
		}

		Window.onWindowMinimized(this);
		
	}

	setDom( html ){

		this.content.innerHTML = html;

	}

	updateTitle(){

		const name = this.name, type = this.type, id = this.id;
		this.title.querySelector("span.title").innerHTML = (name ? 
			esc(type) + ' &gt; ' + esc(name) +' ('+esc(id)+')' :
			esc(type) + ' &gt; ' + esc(id)
		);

	}

	// Returns a unique id for this type and 
	uniqid(){
		return this.type.split(" ").join("_")+"::"+this.id.split(" ").join("_");
	}
	
	// Todo: remove any children recursively
	remove(){
		this.dom.parentNode.removeChild(this.dom);
		Window.remove(this);
	}

	close(){ this.remove(); }

	bringToFront( force ){

		if( Window.front === this && !force )
			return;

		// Force is only set when loading a state, you can ignore minimize while doing so
		if( this.minimized && !force )
			this.toggleMinimize();

		++Window.zIndex;
		this.dom.style.zIndex = Window.zIndex;
		Window.front = this;
		Window.onWindowToFront(this);

	}

	


	// Custom events
	static onWindowOpened( win ){}
	static onWindowClosed(win){}
	static onWindowMoved(win){}
	static onWindowResized(win){}
	static onWindowToFront(win){}
	static onWindowMaximized(win){}		// Raised both on minimize an unminimize
	static onWindowMinimized(win){}		// Raised both of maximize and unmaximize

	// Creates a window if it doesn't exist and returns it
	// If it does exist, it returns existing
	static create( id, type, name, icon, onSpawn, asset, parent ){

		const w = new this(id, type, name, icon, asset, onSpawn, parent);
		const uid = w.uniqid();

		const existing = this.get(uid);
		if( existing ){
			existing.bringToFront();
			return existing;
		}
		this.pages.set(uid, w);
		this.windowContainer.append(w.dom);
		w.rebuild();
		w.bringToFront();
		
		const settings = this.meta[w.type.split(" ").join("_")];
		if( settings ){
			w.size = settings.s;
			w.makeFloating();
		}

		// Positions relative to the top level window of this type
		const lastOf = this.getLastOfType(type, w);
		if( lastOf ){
			w.position.x = Math.min(lastOf.position.x+25, window.innerWidth-10);
			w.position.y = Math.min(lastOf.position.y+25, window.innerHeight-10);
			w.updatePosition();
		}
		else
			w.center();

		this.onWindowOpened(w);

		return w;

	}

	// Use remove on the object instead of this one
	static remove( win ){

		this.pages.delete(win.uniqid());
		this.onWindowClosed(win);

	}

	static get( uniqid ){
		return this.pages.get(uniqid);
	}

	static getByTypeAndId( type, id ){
		for( let page of this.pages.values() ){
			if( page.type === type && id === id )
				return page;
		}
	}

	static rebuildWindowsByTypeAndId( type, id ){

		for( let win of this.pages.values() ){

			if( type === win.type && id === win.id )
				win.rebuild();

		}

	}

	// Saves window information for this window's type
	static saveMeta( win ){

		this.meta[win.type.split(' ').join('_')] = {
			s : win.size
		};

		clearTimeout(this._metaSave);
		this._metaSave = setTimeout(() => {

			localStorage.editor_window_meta = JSON.stringify(this.meta);

		}, 100);

	}


	static closeAll(){
		for( let win of this.pages.values() ){
			win.remove();
		}
	}
	static resetAll(){
		for( let win of this.pages.values() ){
			win.reset();
		}
	}
	static minimizeAll(){
		for( let win of this.pages.values() ){
			win.toggleMinimize(true, true);
		}
	}

	// If a window is open, it minimizes all, otherwise it unminimizes all
	static toggleMinimizeAll(){

		if( this.hasUnminimized() ){
			this.minimizeAll();
			return;
		}

		for( let win of this.pages.values() ){
			win.toggleMaximize(false, true);
			win.toggleMinimize(false, true);
		}

	}

	// Has a currently maximized window
	static hasMaximized(){
		for( let page of this.pages.values() ){
			if( !page.minimized && page.isMaximized() )
				return page;
		}
	}

	static hasUnminimized(){

		for( let page of this.pages.values() ){
			if( !page.minimized )
				return true;
		}

	}




	// MENU

	// x can also be a dom element to position it from the bottom left
	static setMenu( x, y ){

		if( !this._menu )
			this._menu = document.getElementById("menuRollout");

		this._menu.innerHTML = "";
		this._menu.classList.toggle("hidden", false);

		if( x instanceof HTMLElement ){

			const bounding = x.getBoundingClientRect();
			x = bounding.left;
			y = bounding.bottom;

		}

		this._menu.style.left = parseInt(x)+'px';
		this._menu.style.top = parseInt(y)+'px';

	}

	static addMenuOption( id, label, onClick ){

		if( !this._menu )
			throw 'Unable to add menu option, menu not opened';
		
		const el = document.createElement("div");
		el.dataset.id = id;
		el.innerText = label;
		el.onclick = event => {
			event.stopImmediatePropagation();
			event.preventDefault();

			if( typeof onClick === "function" )
				onClick();

			this.closeMenu();
		};

		this._menu.appendChild(el);

	}

	static closeMenu(){
		if( this._menu )
			this._menu.classList.toggle("hidden", true);
	}

	// Gets the last highlighted window of type
	static getLastOfType( type, ignore ){

		let zindex = -1, out = undefined;
		for( let win of this.pages.values() ){

			if( win === ignore || win.type !== type )
				continue;

			const z = win.getZindex();
			if( z > zindex ){
				out = win;
				zindex = z;
			}

		}

		return out;

	}


}

Window.windowContainer = null;
Window.minimizeContainer = null;
Window.front = null;	// Front window

Window.zIndex = 0;	// Increased every time a child is brought to front
Window.pages = new Map();
/* 
	type => {
		s : {int w, int h} -- Height
	}
*/
Window.meta = {};
try{
	Window.meta = JSON.parse(localStorage.editor_window_meta);
}catch(e){}

document.addEventListener("click", () => {
	Window.closeMenu();
});

