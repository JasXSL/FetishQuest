const svgNS = 'http://www.w3.org/2000/svg';

export default class RawNodes{

	constructor(){

		this.ini = false;
		this.blocks = new Map(); 				// type -> id -> Block
		this.blockPrototypes = new Map();

		this.cIdx = 0;							// Create block index. Used to auto align non-aligned blocks
		this.bIdx = 0;							// Tracks the index of which block connections were added

		this.div = document.createElement('div');
		this.div.classList.add('rawNodesWrapper');
		this.div.tabIndex = 0;
		this.svgLines = document.createElementNS(svgNS, 'svg');
		this.svgLines.classList.add('lines');
		this.div.append(this.svgLines);

		this.divBlocks = document.createElement('div');
		this.divBlocks.classList.add('blocks');
		this.div.append(this.divBlocks);

		this.divRightClickMenu = document.createElement('div');
		this.divRightClickMenu.classList.add('rightClickMenu');
		this.div.append(this.divRightClickMenu);

		this.mouseChanged = false;
		this.mousedown = false;		// Tracks if mouse is held down
		this.clickTarg = null;
		this.selBlock = null;		// Aux handler to speed up dragging blocks
		this.selNode = false;		// Label of selected node when connecting or boolean true if dragging an output
		this.selNodeType = false;	// Type of node we're dragging

		// Where are we centering?
		this.x = 0;
		this.y = 0;

		this.lastX = 0;	// Last coordinate for a mousedown/mousemove event
		this.lastY = 0;

		this.zoom = 1.0;

		this.div.onmousedown = event => {
			
			this.closeContextMenu();
			this.mousedown = true;
			this.lastX = event.pageX;
			this.lastY = event.pageY;
			this.clickTarg = event.target;
			// Move a block
			if( event.target.classList.contains('header') ){

				const ds = event.target.parentNode.dataset;
				this.selBlock = this.getBlock(ds.type, ds.id);

			}
			// Click and drag a node
			else if( event.target.classList.contains('node') ){
				
				const isOutput = event.target.classList.contains("output");
				this.selBlock = this.getBlock(
					event.target.dataset.parentType, 
					event.target.dataset.id
				);
				this.selNodeType = event.target.dataset.type;
				if( isOutput )
					this.selNode = true;
				else
					this.selNode = event.target.dataset.label;

				// Starting to drag a single input. We need to detach any existing one.
				const conDef = this.selBlock._btype.getInput(this.selNode);
				if( !isOutput && conDef.single )
					this.detachAllFromBlockNode(this.selBlock, this.selNode);

				this.div.querySelectorAll("div.node").forEach(el => {
					
					if( 
						el.dataset.type !== this.selNodeType ||
						// output/input matching
						(isOutput && el.classList.contains("output")) ||
						(!isOutput && el.classList.contains("input")) ||
						// ignore inputs that are full
						(isOutput && el.classList.contains("single") && this.getBlockInputs(el.dataset.type, el.dataset.id, el.dataset.label).length) // todo: cehck if full
					)el.classList.add('disabled');

				});

			}
			// Select a connection
			else if( event.target.classList.contains('con') ){

				this.render();

			}

		};

		this.div.onmouseup = event => {

			this.mousedown = false;
			// We've dragged a connection
			if( this.selNode && event.target.classList.contains('node') && !event.target.classList.contains('disabled') ){

				// Assume we started with an output
				let origin = this.selBlock;
				let dest = this.getBlock(event.target.dataset.parentType, event.target.dataset.id);
				let destNode = event.target.dataset.label;
				// we started with an input
				if( this.selNode !== true ){

					let tmp = origin;
					origin = dest;
					dest = tmp;
					destNode = this.selNode;

				}

				origin.attach( dest.type, dest.id, destNode);

			}

			if( this.clickTarg === this.div )
				this.onPan();

			// clicked a line. need to refocus for things to work
			if( this.clickTarg?.classList.contains('con') )
				this.div.focus();

			this.div.querySelectorAll("div.node").forEach(el =>
				el.classList.remove('disabled')
			);

			this.selBlock = null;
			this.selNode = this.selNodeType = false;
			this.render();

			if( this.mouseChanged ){
				this.mouseChanged = false;
				this.raiseChangedEvent();
			}

		};

		this.div.onmousemove = event => {

			const x = event.pageX, y = event.pageY;
			let offsX = (x-this.lastX);
			let offsY = (y-this.lastY);
			this.lastX = x;
			this.lastY = y;

			if( !this.mousedown )
				return;

			// Dragging something
			if( this.clickTarg !== null ){

				// Moving the canvas
				if( this.clickTarg === this.div ){
					
					this.x += offsX;
					this.y += offsY;
					this.render();

				}
				// Dragging a line
				else if( this.selNode ){
					this.render();
					
				}
				// Dragging a block
				else if( this.selBlock ){

					this.selBlock.x += offsX/this.zoom;
					this.selBlock.y += offsY/this.zoom;
					this.render();
					this.mouseChanged = true;

				}

			}

		};

		this.div.onwheel = event => {

			event.preventDefault();
			let mag = 0.1;
			if( this.zoom <= 0.3 )
				mag = 0.05;
			if( this.zoom < 0.2 )
				mag = 0.025;

			if( event.deltaY < 0 )
				this.zoom += mag;
			else
				this.zoom -= mag;
			
			this.zoom = Math.min(1.5, Math.max(0.1, this.zoom));
			this.onPan();
			this.render();
			

		};

		this.div.oncontextmenu = event => {
			if( event.target !== this.div )
				return;
			this.drawContextMenu(event, this.div);
		};


	}

	// Right click menu
	drawContextMenu(event, element){
		event.preventDefault();

		const cl = element.classList;
		let opts = new Map(); // label -> function

		// Line
		if( cl.contains("con") ){
			
			opts.set("Delete", () => {

				const origin = this.getBlock(element.dataset.originType, element.dataset.originId);
				origin.detach(element.dataset.targId, element.dataset.targLabel);
				this.clickTarg = null;
				this.render();

			});

		}
		// Block
		else if( cl.contains("block") ){

			const block = this.getBlock(element.dataset.type, element.dataset.id);
			if( !block.noDelete )
				opts.set("Delete", () => {
					this.removeBlock(element.dataset.type, element.dataset.id);
				});

		}
		// Background
		else if( cl.contains("rawNodesWrapper") ){

			// noAdd
			this.blockPrototypes.forEach(ty => {
				
				if( !ty.noAdd ){

					const cbb = this.div.getBoundingClientRect();
					opts.set('+ <span style="color:'+ty.color+'">' + ty.name + '</span>', () => {

						this.addBlock(ty.name, undefined, {
							x : (this.lastX-this.x)/this.zoom-cbb.left,
							y : (this.lastY-this.y)/this.zoom-cbb.top,
						});

					});

				}

			});

			opts.set("Pan To Root", () => {
				this.panToFirst();
			});
			opts.set("Purge Positions", () => {
				this.resetPositions();
			});

		}
		else
			return;

		if( !opts.size )
			return;

		const children = [];
		opts.forEach((o, id) => {
			
			const div = document.createElement("div");
			children.push(div);
			div.classList.add("opt");
			div.innerHTML = id;
			div.onmousedown = () => {
				o();
			};

		});

		this.divRightClickMenu.replaceChildren(...children);
		this.divRightClickMenu.classList.remove("hidden");

		const cbb = this.div.getBoundingClientRect();
		const bb = this.divRightClickMenu.getBoundingClientRect();
		let left = this.lastX-cbb.left;
		let top = this.lastY-cbb.top;

		if( left+bb.width > cbb.width )
			left = cbb.width-bb.width;
		if( top+bb.height > cbb.height )
			top = cbb.height-bb.height;

		this.divRightClickMenu.style.left = left+'px';
		this.divRightClickMenu.style.top = top+'px';

	}

	closeContextMenu(){
		this.divRightClickMenu.classList.add("hidden");
	}


	render(){
		
		const rect = this.div.getBoundingClientRect();

		const blocks = this.getBlocksArray();
		for( let block of blocks ){

			block.div.style.left = (this.x+block.x*this.zoom)+'px';
			block.div.style.top = (this.y+block.y*this.zoom)+'px';
			block.div.style.transform = 'scale('+this.zoom+')';

		}

		this.svgLines.setAttribute('width', rect.width);
		this.svgLines.setAttribute('height', rect.height);
		

		while( this.svgLines.children.length ){
			this.svgLines.children[0].remove();
		}

		const left = this.div.offsetLeft, top = this.div.offsetTop;
		const radius = 7*this.zoom;

	
		for( let block of blocks ){

			if( block._btype.noOutput )
				continue;

			// start location relative to viewer
			const baseRect = block.outputNode.getBoundingClientRect();
			let baseLeft = baseRect.left-left+radius-rect.left,
				baseTop = baseRect.top-top+radius-rect.top
			;

			let n = {};
			for( let con of block.connections ){

				let targ = this.getBlock(con.targType, con.blockID);
				let targDiv = targ.inputNodes.get(con.parent.type).get(con.label);
				const targRect = targDiv.getBoundingClientRect();

				let targLeft = targRect.left-left+radius-rect.left,
					targTop = targRect.top-top+radius-rect.top
				;
				
				const line = document.createElementNS(svgNS,'path');
				line.dataset.originId = block.id;
				line.dataset.targId = targ.id;
				line.dataset.targLabel = con.label;
				line.dataset.originType = block.type;
				line.classList.add("con");

				if( 
					this.clickTarg &&
					this.clickTarg.classList.contains('con') &&
					line.dataset.originId === this.clickTarg.dataset.originId &&
					line.dataset.originType === this.clickTarg.dataset.originType &&
					line.dataset.targId === this.clickTarg.dataset.targId &&
					line.dataset.targLabel === this.clickTarg.dataset.targLabel
				){
					line.classList.add('sel');
				}
				line.setAttribute("d", "M "+baseLeft+" "+baseTop+" C "+(baseLeft-30)+" "+baseTop+", "+(targLeft+30)+" "+targTop+", "+targLeft+" "+targTop);
				line.setAttribute("stroke", block._btype.color);
				line.setAttribute("stroke-width", "3");
				line.setAttribute("fill", "transparent");
				line.oncontextmenu = event => {
					this.drawContextMenu(event, line);
				};
				this.svgLines.appendChild(line);

				const nr = document.createElementNS(svgNS, 'text');
				nr.setAttribute("fill", "#000");
				nr.setAttribute("font-size", 20*this.zoom);
				nr.textContent = targ.getInputIndex(con.label, block.id, true);
				nr.setAttribute('x', baseLeft+(targLeft-baseLeft)/2);
				nr.setAttribute('y', baseTop+(targTop-baseTop)/2);
				nr.setAttribute('text-anchor', 'middle');
				nr.setAttribute('font-weight', 'bold');
				nr.setAttribute('paint-order', 'stroke');
				nr.setAttribute('stroke-width', (5*this.zoom)+'px');
				nr.setAttribute('stroke', block._btype.color);
				nr.setAttribute('alignment-baseline', 'middle');

				this.svgLines.appendChild(nr);


			}

		}

		if( this.selNode && this.mousedown ){

			// Draw a line from node to cursor
			const sb = this.selBlock;
			let coords = sb.outputNode?.getBoundingClientRect();
			let flip = 1;
			// Dragging from an input to an output
			if( this.selNode !== true ){

				flip = -flip;
				coords = this.selBlock.inputNodes.get(this.selNodeType).get(this.selNode).getBoundingClientRect();

			}
			const offs = -30;
			const startLeft = coords.left+radius-rect.left;
			const startTop = coords.top+radius-rect.top;
			const endLeft = this.lastX-rect.left;
			const endTop = this.lastY-rect.top;
			

			// Draw the line
			const line = document.createElementNS(svgNS,'path');
			line.classList.add('drag');
			line.setAttribute("d", "M "+startLeft+" "+startTop+" C "+(startLeft+offs*flip)+" "+startTop+", "+(endLeft-offs*flip)+" "+endTop+", "+endLeft+" "+endTop);
			line.setAttribute("stroke", this.getBlockType(this.selNodeType).color);
			line.setAttribute("stroke-width", "4");
			line.setAttribute("fill", "transparent");
			
			this.svgLines.appendChild(line);

		}

	}

	connect( parentElement ){

		this.ini = true;
		parentElement.append(this.div);
		const size = this.div.getBoundingClientRect();
		this.x = size.width/2;
		this.y = size.height/2;
		this.render();
		
	}

	addBlockType( type, config ){

		if( this.blockPrototypes.has(type) )
			throw new Error("Block type already exists: "+type);

		if( !config || typeof config !== "object" )
			config = {};

		if( isNaN(config.x) || isNaN(config.y) )
			++this.cIdx;
		if( isNaN(config.x) )
			config.x = this.cIdx*25;
		if( isNaN(config.y) )
			config.x = this.cIdx*25;

		this.blocks.set(type, new Map());
		const out = new BlockType( type, config, this );
		this.blockPrototypes.set(type, out);
		return out;

	}

	addBlock( type, id, config ){

		const typeDef = this.blockPrototypes.get(type);
		if( !typeDef )
			throw new Error("No such type: "+type);
		if( !id )
			id = this.constructor.generateUUID();

		const out = new Block(type, id, config, typeDef, this);
		this.blocks.get(type).set(id, out);
		this.divBlocks.append(out.div);

		this.render();
		this.raiseChangedEvent();
		// onCreate last
		if( typeof typeDef.onCreate === 'function' )
			typeDef.onCreate(out);

		
		return out;

	}

	getBlockType( type ){
		return this.blockPrototypes.get(type);
	}

	removeBlock( type, id ){
		
		let cur = this.blocks.get(type).get(id);
		if( !cur )
			return;
		this.blocks.get(type).delete(id);
		this.blocks.forEach(ty => 
			ty.forEach(
				el => el.detach(cur)
			)
		);
		cur.div.remove();
		if( typeof cur._btype.onDelete === "function" )
			cur._btype.onDelete(cur);
		this.raiseChangedEvent(); // Changed last
		this.render();

	}

	// Detach all connections from a block node
	detachAllFromBlockNode( block, nodeLabel ){
		
		const blocks = this.getBlocksArray();
		for( let b of blocks ){
			b.detach(block, nodeLabel);
		}

	}

	getBlock( type, id ){

		const ty = this.blocks.get(type);
		if( !ty )
			throw new Error("Unable to get nonexisting block type: "+type);
		return ty.get(id);

	}

	// Gets blocks linked to a blocks input by label
	getBlockInputs( type, blockID, inputLabel, sort = true ){

		const blocks = this.getBlocksArray();
		let out = [];
		for( let el of blocks ){
			
			const link = el.getBlockConnection(type, blockID, inputLabel);
			if( link )
				out.push(link);
			
		}
		if( sort ){
			out.sort((a,b) => {
				return a.idx < b.idx ? -1 : 1;
			});
		}
		return out;

	}

	getBlocksArray(){

		let out = [];
		this.blocks.forEach(el => out.push(...Array.from(el.values())));
		return out;

	}

	static generateUUID(){
		const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let array = new Uint8Array(12);
		crypto.getRandomValues(array);
		array = array.map(x => validChars.charCodeAt(x % validChars.length));
		return String.fromCharCode.apply(null, array);
	}

	flatten(){

		const out = {};
		this.blocks.forEach((el, idx) => {
			out[idx] = [];
			el.forEach(el => {
				out[idx].push(el.flatten());
			});

		});

		return out;

	}

	raiseChangedEvent(){

		if( !this.ini )
			return;
		this.onChange();

	}

	// overwrite this with your custom logi
	onChange(){}

	// overwrite this
	onPan(){}

	resetPositions(){

		const blocks = this.getBlocksArray();
		for( let i = 0; i < blocks.length; ++i ){

			let block = blocks[i];
			block.x = block.y = 50*i;

		}
		this.render();
		this.raiseChangedEvent();

	}

	panToFirst(){

		const first = this.getBlocksArray()[0];
		const bb = this.div.getBoundingClientRect();
		const bw = first.div.getBoundingClientRect();
		this.x = bb.width/2-first.x-bw.width/2;
		this.y = bb.height/2-first.y-bw.height/2;
		this.render();		

	}

	getBidx(){
		return ++this.bIdx;
	}

}

// Block connected to RawNodes.blocks
export class Block{

	constructor( type, id, config, btype, parent ){

		if( !config || typeof config !== "object" )
			config = {};

		this.type = type;
		this.id = id;
		this.x = Math.trunc(config.x) || 0;
		this.y = Math.trunc(config.y) || 0;
		this.noDelete = Boolean(config.noDelete);

		this.connections = [];			// Blocks we're outputting to: BlockConnection objects
		
		this._btype = btype;				// Cache of blocktype object
		this.parent = parent;				// Set when added
		this.div = document.createElement('div');
		this.div.classList.add('block');
		this.div.dataset.type = this.type;
		this.div.dataset.id = this.id;

		this.div.style.borderColor = this._btype.color;
		this.div.style.color = this._btype.color;
		if( btype.width )
			this.div.style.width = btype.width;
		if( btype.height )
			this.div.style.minHeight = btype.height;

		this.div.oncontextmenu = event => {
			this.parent.drawContextMenu(event, this.div);
		};

		this.divHeader = document.createElement('div');
		this.divHeader.classList.add('header');
		this.divHeader.innerText = this.type + ' : ' + this.id;
		this.div.append(this.divHeader);

		this.divContent = document.createElement('div');
		this.divContent.classList.add('content');
		this.div.append(this.divContent);
		this.divContent.onclick = event => {
			if( typeof btype.onClick === "function" )
				btype.onClick(this, event);
		};

		// Input node divs
		this.inputNodes = new Map();

		// Draw the nodes
		let i = 0;
		this._btype.inputs.forEach(input => {
			
			const div = document.createElement('div');
			div.classList.add('node', 'input');
			div.dataset.type = input.type;
			div.dataset.id = this.id;
			div.dataset.parentType = this.type;
			div.dataset.label = input.label;
			div.style.top = (30+20*i)+'px';
			const btype = this.parent.getBlockType(input.type);
			if( !btype )
				throw new Error("Invalid block type found: "+input.type);
			div.style.borderColor = btype.color;

			if( input.single )
				div.classList.add("single");
			if( !this.inputNodes.has(input.type) )
				this.inputNodes.set(input.type, new Map());
			this.inputNodes.get(input.type).set(input.label, div);

			this.div.append(div);
			++i;

		});

		// Output node
		if( !this._btype.noOutput ){

			const div = document.createElement('div');
			this.outputNode = div;
			div.classList.add('node', 'output');
			div.dataset.type = this.type;
			div.dataset.id = this.id;
			div.dataset.parentType = this.type;
			div.style.borderColor = this._btype.color;
			this.div.append(div);

		}

	}

	setContent( html ){
		this.divContent.innerHTML = html;
	}

	flatten(){

		let out = {
			id : this.id,
			type : this.type,
			x : this.x,
			y : this.y,
		};

		this._btype.inputs.forEach(el => {

			let linkedIds = this.parent.getBlockInputs(this.type, this.id, el.label).map(input => input.parent.id);
			if( el.single )
				linkedIds = linkedIds[0];
			out[el.label] = linkedIds;

		});


		return out;

	}
	 
	getBlockConnection( type, blockID, label ){

		for( let con of this.connections ){
			
			if( con.targType === type && con.blockID === blockID && con.label === label )
				return con;
			
		}

	}

	getInputType( label ){
		
		return this._btype.getInput(label).type;

	}

	getInputIndex( label, blockID, undefinedIfLessThanTwo = false ){

		let connections = this.parent.getBlockInputs(this.type, this.id, label);
		if( undefinedIfLessThanTwo && connections.length < 2 )
			return;

		let n = 0;
		for( let con of connections ){
			
			if( con.parent.id === blockID )
				return n;
			++n;

		}

	}

	// Detach from a block and optionally a target label
	detach( block, label ){

		if( block instanceof this.constructor )
			block = block.id;

		let detached = 0;
		let out = [];
		// Filter out blocsk that match and create a new array
		for( let con of this.connections ){

			if( con.blockID === block && (label === undefined || con.label === label) ){
				++detached;
				continue;
			}
			out.push(con);

		}
		if( !detached )
			return;

		this.connections = out;
		this.parent.render();

		this.parent.raiseChangedEvent();

	}
	
	// Attach our output to an input
	attach( targType, id, label ){

		const targ = this.parent.getBlock(targType, id);
		if( !targ )
			throw new Error("Block not found: "+id);

		const input = targ._btype.getInput(label);
		if( !input )
			throw new Error("Input not found "+id);

		if( input.type !== this.type )
			throw new Error("Cannot connect to that type "+id);

		if( this.getBlockConnection(targ.id, label) )
			throw new Error("Already connected!");

		const con = new BlockConnection(targType, id, label, this, this.parent.getBidx());
		this.connections.push(con);

		this.parent.render();

		this.parent.raiseChangedEvent();

		return this;

	}

}

export class BlockConnection{

	constructor( targType, blockID, label, parent, idx ){

		this.targType = targType;
		this.blockID = blockID;			// Target block ID
		this.label = label;				// Target input label
		this.parent = parent;
		this.idx = idx;

	}

}




export class BlockType{

	constructor( name, config ){

		if( !config || typeof config !== "object" )
			config = {};
		this.name = name;
		this.color = config.color || '#EEE';
		this.width = config.width;
		this.height = config.height;
		this.noAdd = Boolean(config.noAdd);
		this.noOutput = Boolean(config.noOutput);
		this.onCreate = config.onCreate;
		this.onDelete = config.onDelete;
		this.onClick = config.onClick;
		this.inputs = new Map();		// label : Input
		this.parent = parent;

	}

	addInput( label, type, config ){

		const out = new Input(label, type, config, this);
		this.inputs.set(label, out);
		out.parent = this;
		return this;

	}

	getInput( label ){

		return this.inputs.get(label);

	}

}

export class Input{

	constructor( label, type, config, parent ){

		if( !config || typeof config !== 'object' )
			config = {};

		this.label = label;
		this.type = type;
		this.single = Boolean(config.single);
		this.parent = parent;

	}

}



