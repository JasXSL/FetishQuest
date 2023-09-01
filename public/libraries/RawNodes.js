/*
	Todo: 
	- Make sure inputs set to single will only accept one connection
	- Multi inputs should show index based on the order
	- Size setting for block types
	- Zooming
	- Adding blocks
	- Deleting blocks
	- Events
	- Mini map?
	- Draw arrow lines for inputs with multiple nodes showing the order

*/
const svgNS = 'http://www.w3.org/2000/svg';

export default class RawNodes{

	constructor(){

		this.blocks = new Map(); 				// type -> id -> Block
		this.blockPrototypes = new Map();

		this.cIdx = 0;

		this.div = document.createElement('div');
		this.div.classList.add('rawNodesWrapper');
		this.div.tabIndex = 0;
		this.svgLines = document.createElementNS(svgNS, 'svg');
		this.svgLines.classList.add('lines');
		this.div.append(this.svgLines);

		this.divBlocks = document.createElement('div');
		this.divBlocks.classList.add('blocks');
		this.div.append(this.divBlocks);


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

		this.div.onmousedown = event => {
			
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

				this.div.querySelectorAll("div.node").forEach(el => {
					
					if( 
						el.dataset.type !== this.selNodeType ||
						(isOutput && el.classList.contains("output")) ||
						(!isOutput && el.classList.contains("input"))
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

			// clicked a line. need to refocus for things to work
			if( this.clickTarg.classList.contains('con') )
				this.div.focus();

			this.div.querySelectorAll("div.node").forEach(el =>
				el.classList.remove('disabled')
			);

			this.selBlock = null;
			this.selNode = this.selNodeType = false;
			this.render();

		};

		this.div.onmousemove = event => {

			if( !this.mousedown )
				return;

			// Dragging something
			if( this.clickTarg !== null ){

				const x = event.pageX, y = event.pageY;
				if( x === this.lastX && y === this.lastY ) // No change
					return;

				let offsX = x-this.lastX;
				let offsY = y-this.lastY;
				this.lastX = x;
				this.lastY = y;
				
				// Moving the canvas
				if( this.clickTarg === this.div ){
					
					this.x += offsX;
					this.y += offsY;
					this.render();

				}
				// Dragging a line
				else if( this.selNode ){
					this.render();
					// Todo: highlight nodes we can drag it to
				}
				// Dragging a block
				else if( this.selBlock ){

					this.selBlock.x += offsX;
					this.selBlock.y += offsY;
					this.render();

				}

			}

		};

		this.div.onkeydown = event => {
		
			const ct = this.clickTarg;
			if( event.key === 'Delete' && ct.classList.contains('con') ){

				const origin = this.getBlock(ct.dataset.originType, ct.dataset.originId);
				origin.detach(ct.dataset.targId, ct.dataset.targLabel);
				this.clickTarg = null;
				this.render();

			}
	
		};

	}

	render(){
		
		const rect = this.div.getBoundingClientRect();
		let midX = rect.width/2+this.x;
		let midY = rect.height/2+this.y;

		
		const blocks = this.getBlocksArray();
		for( let block of blocks ){

			block.div.style.left = (midX+block.x)+'px';
			block.div.style.top = (midY+block.y)+'px';

		}

		this.svgLines.setAttribute('width', rect.width);
		this.svgLines.setAttribute('height', rect.height);
		

		while( this.svgLines.children.length ){
			this.svgLines.children[0].remove();
		}

		const left = this.div.offsetLeft, top = this.div.offsetTop;
		const radius = 7;
	
		for( let block of blocks ){

			// start location relative to viewer
			const baseRect = block.outputNode.getBoundingClientRect();
			let baseLeft = baseRect.left-left+radius,
				baseTop = baseRect.top-top+radius
			;

			for( let con of block.connections ){

				let targ = this.getBlock(con.targType, con.blockID);
				let targDiv = targ.inputNodes.get(con.parent.type).get(con.label);
				const targRect = targDiv.getBoundingClientRect();

				let targLeft = targRect.left-left+radius,
					targTop = targRect.top-top+radius
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
				this.svgLines.appendChild(line);

			}

		}

		if( this.selNode && this.mousedown ){

			// Draw a line from node to cursor
			const sb = this.selBlock;
			let coords = sb.outputNode.getBoundingClientRect();
			let flip = 1;
			// Dragging from an input to an output
			if( this.selNode !== true ){

				flip = -flip;
				coords = this.selBlock.inputNodes.get(this.selNodeType).get(this.selNode).getBoundingClientRect();

			}
			const offs = -30;
			const startLeft = coords.left+radius;
			const startTop = coords.top+radius;
			const endLeft = this.lastX;
			const endTop = this.lastY;
			

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

	getDiv(){
		return this.div;
	}

	addBlockType( type, color ){

		if( this.blockPrototypes.has(type) )
			throw new Error("Block type already exists: "+type);

		this.blocks.set(type, new Map());
		const out = new BlockType( type, color, this );
		this.blockPrototypes.set(type, out);
		return out;

	}

	addBlock( type, id, x = 0, y = 0 ){

		const typeDef = this.blockPrototypes.get(type);
		if( !typeDef )
			throw new Error("No such type: "+type);
		if( !id )
			id = this.constructor.generateUUID();

		const out = new Block(type, id, x, y, typeDef, this);
		this.blocks.get(type).set(id, out);
		
		this.divBlocks.append(out.div);
		this.render();
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

		this.render();

	}

	getBlock( type, id ){

		const ty = this.blocks.get(type);
		if( !ty )
			throw new Error("Unable to get nonexisting block type: "+type);
		return ty.get(id);

	}

	// Gets blocks linked a blocks input by label
	getBlockInputs( blockID, inputLabel ){

		const blocks = this.getBlocksArray();
		let out = [];
		for( let el of blocks ){
			
			const link = el.getBlockConnection(blockID, inputLabel);
			if( link )
				out.push(link);
			
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

}

// Block connected to RawNodes.blocks
export class Block{

	constructor( type, id, x, y, btype, parent ){

		this.type = type;
		this.id = id;
		this.x = Math.trunc(x) || 0;
		this.y = Math.trunc(y) || 0;
		this.connections = [];			// Blocks we're outputting to: BlockConnection objects
		
		this._btype = btype;				// Cache of blocktype object
		this.parent = parent;				// Set when added
		this.div = document.createElement('div');
		this.div.classList.add('block');
		this.div.dataset.type = this.type;
		this.div.dataset.id = this.id;
		this.div.style.borderColor = this._btype.color;
		this.div.style.color = this._btype.color;

		this.divHeader = document.createElement('div');
		this.divHeader.classList.add('header');
		this.divHeader.innerText = this.type + ' : ' + this.id;
		this.div.append(this.divHeader);

		this.divContent = document.createElement('div');
		this.divContent.classList.add('content');
		this.div.append(this.divContent);



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
			
			if( !this.inputNodes.has(input.type) )
				this.inputNodes.set(input.type, new Map());
			this.inputNodes.get(input.type).set(input.label, div);

			this.div.append(div);
			++i;

		});

		// Output node
		const div = document.createElement('div');
		this.outputNode = div;
		div.classList.add('node', 'output');
		div.dataset.type = this.type;
		div.dataset.id = this.id;
		div.dataset.parentType = this.type;
		div.style.borderColor = this._btype.color;
		this.div.append(div);

	}

	setContent( html ){
		this.divContent.innerHTML = html;
	}

	flatten(){

		let out = {
			id : this.id,
			type : this.type,
		};

		this._btype.inputs.forEach(el => {

			out[el.label] = this.parent.getBlockInputs(this.id, el.label).map(input => input.parent.id);

		});


		return out;

	}
	 
	getBlockConnection( blockID, label ){

		for( let con of this.connections ){
			
			if( con.blockID === blockID && con.label === label )
				return con;
			
		}

	}

	getInputType( label ){
		
		return this._btype.getInput(label).type;

	}

	// Detach from a block and optionally a target label
	detach( block, label ){

		if( block instanceof this.constructor )
			block = block.id;

		let out = [];
		// Filter out blocsk that match and create a new array
		for( let con of this.connections ){

			if( con.blockID === block && (label === undefined || con.label === label) )
				continue;
			out.push(con);

		}
		this.connections = out;
		this.parent.render();

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

		const con = new BlockConnection(targType, id, label, this);
		this.connections.push(con);

		this.parent.render();

		return this;

	}

}

export class BlockConnection{

	constructor( targType, blockID, label, parent ){

		this.targType = targType;
		this.blockID = blockID;			// Target block ID
		this.label = label;				// Target input label
		this.parent = parent;

	}

}




export class BlockType{

	constructor( name, color, parent ){

		this.name = name;
		this.color = color || '#EEE';
		this.inputs = new Map();		// label : Input
		this.parent = parent;

	}

	addInput( label, type, single ){

		const out = new Input(label, type, single);
		this.inputs.set(label, out);
		out.parent = this;
		return this;

	}

	getInput( label ){

		return this.inputs.get(label);

	}

}

export class Input{

	constructor( label, type, single = false ){

		this.label = label;
		this.type = type;
		this.single = Boolean(single);
		parent = this.parent;

	}

}



