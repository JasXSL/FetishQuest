import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Window from '../WindowManager.js';
import * as EditorAsset from './EditorAsset.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon, { DungeonRoom } from '../../classes/Dungeon.js';
import Generic from '../../classes/helpers/Generic.js';

const DB = 'dungeons',
	CONSTRUCTOR = Dungeon;

// Single asset editor
export function asset(){

	const 
		modtools = window.mod,
		id = this.id,
		asset = modtools.mod.getAssetById(DB, id),
		dummy = CONSTRUCTOR.loadThis(asset)
	;

	if( !asset )
		return this.close();


	let html = '';
	html += '<div class="labelFlex">';
		html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="-1 = auto">Difficulty: <input type="number" min=-1 step=0.01 name="difficulty" class="saveable" value="'+esc(dummy.difficulty)+'" /></label>';
		html += '<label title="Doesn\'t draw the back icon on doors">Free roam <input type="checkbox" class="saveable" name="free_roam" '+(dummy.free_roam ? 'checked' : '')+' /></label><br />';
	html += '</div>';

	html += 'Vars (this is a key/value object that can be acted upon by game actions and used in conditions):<br />';
	html += '<textarea class="json" name="vars">'+esc(JSON.stringify(dummy.vars))+'</textarea><br />';

	// Keep
	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += '<span title="Consumables you can find in chests here">Default consumables:</span> <div class="consumables"></div>';

	html += 'Rooms: <div class="rooms"></div>';


	this.setDom(html);

	new DungeonLayoutEditor(this, asset, this.dom.querySelector('div.rooms'));


	// Bind linked objects
	this.dom.querySelector("div.consumables").appendChild(EditorAsset.assetTable(this, asset, "consumables"));

	// Todo: Bind rooms

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);


};


// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		label : true,
		name : true,
		difficulty : true,
		free_roam : true,
		vars : true,
		tags : true,
		consumables : true,
		rooms : true
	}));

	HelperAsset.bindList(this, DB, new CONSTRUCTOR({
		label : 'dungeon_'+Generic.generateUUID(),
		name : 'New Dungeon',
		rooms : [],
		consumables : [
			'manaPotion', 'majorManaPotion',
			'minorHealingPotion', 'healingPotion',
			'minorRepairKit', 'repairKit'
		]
	}));

};


// Helper class
class DungeonLayoutEditor{



	// Todo: add a way to set the active level



	constructor( win, asset, element ){

		this.win = win;
		this.asset = asset;
		this.element = element;

		this.active_level = 0;	// Z height
		this.maxWidth = 0;		// Max size of the coordinate system

		this.cache_rooms = [];		// List of room objects

		element.style.width = '100%';
		element.style.display = 'inline-block';
		const pusher = document.createElement('div');
		pusher.style = 'margin-top:100%;';
		element.appendChild(pusher);

		// Add content div
		this.content = document.createElement('div');
		this.content.classList.toggle('dungeonDesigner', true);	
		element.appendChild(this.content);

		// Add selector
		this.levelSelector = document.createElement('div');
		this.levelSelector.classList.toggle('dungeonLevelSelector', true);	
		element.appendChild(this.levelSelector);


		// Check if we have an entrance
		if( !asset.rooms || !asset.rooms.length ){

			// Make sure there's a first room
			const baseName = asset.label+'>>ENTRANCE';
			const room = new DungeonRoom({label:baseName, name:'entrance'}).save("mod");
			room._mParent = {type:'dungeons', label:asset.label};
			HelperAsset.insertAsset( 'dungeonRooms',  room, this, false );
			asset.rooms = [baseName];
		
		}


		for( let roomLabel of this.asset.rooms ){

			const room = window.mod.mod.getAssetById('dungeonRooms', roomLabel);
			if( !room ){
				console.error("Warning: Room asset not found", roomLabel);
				continue;
			}

			this.cache_rooms.push(room);

		}
		

		this.setLevel(0);

		this.updateLevelSelector();

	}

	updateLevelSelector(){

		let minLevel = 0, maxLevel = 0;
		for( let room of this.cache_rooms ){
			if( room.z > maxLevel )
				maxLevel = room.z;
			if( room.z < minLevel )
				minLevel = room.z;
		}


		let html = '<select class="zSelector">';
			html += '<option value="0">-- Z Level --</option>';
		for( let i=minLevel; i <= maxLevel; ++i )
			html += '<option value="'+i+'" '+(i === this.active_level ? 'selected' : '')+'>'+i+'</option>';
		html += '</select>';
		this.levelSelector.innerHTML = html;

		const selector = this.levelSelector.querySelector('select');
		selector.onchange = () => {
			let val = parseInt(selector.value)||0;
			this.setLevel(val);
		};

	}

	// returns an array of room objects on the currently selected level
	getRoomsOnLevel(){

		return this.cache_rooms.filter(room => (room.z||0) === this.active_level);

	}

	// Recalculates X/Y
	getMeasurements(){

		let maxX = 0, minX = 0, maxY = 0, minY = 0;
		for( let room of this.cache_rooms ){
			if( room.x > maxX )
				maxX = room.x;
			if( room.x < minX )
				minX = room.x;
			if( room.y > maxY )
				maxY = room.y;
			if( room.y < minY )
				minY = room.y;
		}
		let dists = [maxX, maxY, Math.abs(minX), Math.abs(minY)];
		dists.sort();

		this.maxWidth = Math.max(dists.pop(),1);

	}

	setLevel( level ){

		this.active_level = level;

		this.getMeasurements();

		this.content.innerHTML = '';
		this.getRoomsOnLevel().map(room => this.buildRoom(room));
		this.updateLevelSelector();

	}

	getUnusedIndex(){

		let n = 0;
		for( let room of this.cache_rooms ){
			
			if( room.index > n )
				n = room.index;

		}
		return n+1;

	}

	roomExistsAtLocation( x, y, z ){

		for( let r of this.cache_rooms ){

			if( r.x === x && r.y == y && r.z === z )
				return true;

		}

	}

	getRoomByIndex( index ){
		for( let room of this.cache_rooms ){
			if( room.index === index )
				return room;
		}
	}

	roomHasAncestor( room, index ){

		while( room && room.parent_index ){

			if( room.parent_index === index )
				return true;

			room = this.getRoomByIndex(room.parent_index);

		}


	}

	deleteRoom( room, rebuild = true ){

		// Remove from this cache
		let index = this.cache_rooms.indexOf(room);
		if( ~index )
			this.cache_rooms.splice(index, 1);

		// Remove from asset labels
		index = this.asset.rooms.indexOf(room.label);
		if( ~index )
			this.asset.rooms.splice(index, 1);

		// Remove from database
		window.mod.mod.deleteAsset('dungeonRooms', room.label);

		if( rebuild )
			this.setLevel(this.active_level);

		window.mod.setDirty(true);

	}

	buildRoom( room ){
		
		// Calculate the smallest box and use that
		const size = 100.0/(this.maxWidth*2+1);

		const roomAsset = new DungeonRoom(room);
		// For now we can start at the zero location

		const div = document.createElement('div');
		div.dataset.index = roomAsset.index;
		div.style.width = div.style.height = size+'%';
		this.content.appendChild(div);

		// Position room
		let top = this.maxWidth-roomAsset.y,
			left = this.maxWidth+roomAsset.x
		;
		div.style.top = (top*size)+'%';
		div.style.left = (left*size)+'%';

		let html = '';
		html += '<span class="name">'+esc(roomAsset.name.substr(0, 8) || 'Unknown')+'</span>';

		const dir_offsets = {
			'top' : {y:1,l:'N'}, 
			'left' : {x:-1,l:'W'}, 
			'right' : {x:1,l:'E'}, 
			'bottom': {y:-1,l:'S'}, 
			'up' : {z:1,l:'U'}, 
			'down' : {z:-1, l:'D'}
		};

		
		
		for( let dir in dir_offsets ){

			let x = roomAsset.x+(dir_offsets[dir].x||0),
				y = roomAsset.y+(dir_offsets[dir].y||0),
				z = roomAsset.z+(dir_offsets[dir].z||0)
			;
			if( !this.roomExistsAtLocation(x, y, z) )
				html += '<span data-dir="'+dir+'" class="dir '+dir+'">'+dir_offsets[dir].l+'</span>';
		}

		div.innerHTML = html;

		// Bind new room buttons
		div.querySelectorAll('span.dir').forEach(el => el.onclick = event => {
			event.stopImmediatePropagation();

			const dir = el.dataset.dir;
			let x = roomAsset.x+(dir_offsets[dir].x||0),
				y = roomAsset.y+(dir_offsets[dir].y||0),
				z = roomAsset.z+(dir_offsets[dir].z||0)
			;
			
			const index = this.getUnusedIndex(),
				baseName = this.asset.label+'>>'+index;

			let r = new DungeonRoom({
				label:baseName, 
				name:'Room '+index, 
				x:x,
				y:y,
				z:z,
				index : index,
				parent_index:roomAsset.index,
			});
			
			const pa = DungeonRoom.loadThis(room);
			pa.rebase();
			const ra = pa.getRoomAsset();
			if( ra ){
				r.addAsset(ra);
			}

			r.ambiance = pa.ambiance;
			r.ambiance_volume = pa.ambiance_volume;
			r.outdoors = pa.outdoors;

			r = r.save("mod");
			r._mParent = {
				type:'dungeons', 
				label:this.asset.label
			};

			console.log("inserting room", r);
			HelperAsset.insertAsset( 'dungeonRooms', r, this, false );

			this.asset.rooms.push(baseName);
			this.cache_rooms.push(r);

			if( dir === 'up' )
				++this.active_level;
			else if( dir === 'down' )
				--this.active_level;

			this.setLevel(this.active_level);	// Refreshes this

		});

		// Bind click on the actual thing
		div.onclick = event => {

			if( event.ctrlKey && confirm("Really delete this room and any children?") ){

				let to_delete = [room];	// contains room objects to delete
				for( let r of this.cache_rooms ){

					if( this.roomHasAncestor(r, room.index) )
						to_delete.push(r);

				}

				for( let r of to_delete )
					this.deleteRoom(r, false);

				this.setLevel(this.active_level);

				return;
			}


			// Bring up the room editor
			Window.getByType('dungeonRooms').map(el => el.remove());
			Window.getByType('dungeonAssets').map(el => el.remove());

			window.mod.buildAssetEditor("dungeonRooms", room.label);

		};

	}


}


