import HelperAsset from './HelperAsset.js';
import HelperTags from './HelperTags.js';
import Window from '../WindowManager.js';
import * as EditorAsset from './EditorAsset.js';
import * as EditorWrapper from './EditorWrapper.js';
import * as EditorAudioMusic from './EditorAudioMusic.js';
import { Effect, Wrapper } from '../../classes/EffectSys.js';
import Dungeon, { DungeonRoom, DungeonRoomAsset } from '../../classes/Dungeon.js';
import Generic from '../../classes/helpers/Generic.js';
import Audio from '../../classes/Audio.js';

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
		if( !asset._h && !asset._mParent )
			html += '<label>Label: <input type="text" name="label" class="saveable" value="'+esc(dummy.label)+'" /></label>';
		html += '<label>Name: <input type="text" name="name" class="saveable" value="'+esc(dummy.name)+'" /></label>';
		html += '<label title="-1 = auto">Difficulty: <input type="number" min=-1 step=0.01 name="difficulty" class="saveable" value="'+esc(dummy.difficulty)+'" /></label>';
		html += '<label title="Doesn\'t draw the back icon on doors">Free roam <input type="checkbox" class="saveable" name="free_roam" '+(dummy.free_roam ? 'checked' : '')+' /></label><br />';
		
		html += '<label title="Use a low value like less than 0.001. Use 0 for default.">Fog override: <input type="number" name="fog" min=0 max=1 class="saveable" value="'+esc(dummy.fog)+'" /></label>';
		html += '<label title="Indoors only. Hex code such as #AA33AA">Ambient light: <input type="text" name="dirLight" class="saveable" value="'+esc(dummy.dirLight)+'" /></label>';
		html += '<label>Ambiance: <input type="text" name="ambiance" class="saveable" value="'+esc(dummy.ambiance)+'" /></label>';
		html += '<label>Ambiance volume <span class="valueExact"></span>: <input type="range" name="ambiance_volume" min=0 max=1 step=0.1 class="saveable" value="'+esc(dummy.ambiance_volume)+'" /></label>';
		html += '<label>Saturation: <input type="number" name="sat" class="saveable" step=0.01 min=0 max=2 value="'+esc(dummy.sat)+'" /></label>';
		html += '<div class="labelFlex">';
			html += '<label>Reverb type: <select name="reverb" class="saveable">'+
				'<option value="none">None</option>'+
				'<option value="" '+(!dummy.reverb ? 'selected' : '')+'>Room Mesh</option>'
			;
			for( let i in Audio.reverbs )
				html += '<option value="'+i+'" '+(dummy.reverb === i ? 'selected' : '')+'>'+i+'</option>';
			html += '</select></label>';
			html += '<label title="PASS = use from room mesh">Reverb intensity <span class="valueExact zeroParent"></span>: <input type="range" name="reverbWet" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.reverbWet)+'" /></label>';
			html += '<label title="PASS = use from room mesh">Lowpass filter <span class="valueExact zeroParent"></span>: <input type="range" name="lowpass" min=0 max=1 step=0.01 class="saveable" value="'+esc(dummy.lowpass)+'" /></label>';
			html += '<label><input type="button" class="testReverb" value="Test Audio" /></label>';
		html += '</div>';

	html += '</div>';

	html += '<span title="">Ambient Music:</span> <div class="music"></div>';
	html += '<span title="">Combat Music:</span> <div class="music_combat"></div>';


	html += 'Vars (this is a key/value object that can be acted upon by game actions and used in conditions):<br />';
	html += '<textarea class="json" name="vars">'+esc(JSON.stringify(dummy.vars))+'</textarea><br />';

	// Keep
	html += 'Tags: <br /><div name="tags">'+HelperTags.build(dummy.tags)+'</div>';

	html += '<span title="Consumables you can find in chests here, other than assets marked as randomLoot">Unique consumables:</span> <div class="consumables"></div>';
	html += '<span title="">Passives:</span> <div class="passives"></div>';



	html += 'Rooms: <div class="rooms"></div>';


	this.setDom(html);

	new DungeonLayoutEditor(this, asset, this.dom.querySelector('div.rooms'));

	HelperAsset.bindTestReverb(
		this.dom.querySelector('select[name=reverb]'),
		this.dom.querySelector('input[name=reverbWet]'),
		this.dom.querySelector('input[name=lowpass]'),
		this.dom.querySelector('input.testReverb')
	);


	// Bind linked objects
	this.dom.querySelector("div.consumables").appendChild(EditorAsset.assetTable(this, asset, "consumables"));
	this.dom.querySelector("div.passives").appendChild(EditorWrapper.assetTable(this, asset, "passives"));
	this.dom.querySelector("div.music").appendChild(EditorAudioMusic.assetTable(this, asset, "music", true));
	this.dom.querySelector("div.music_combat").appendChild(EditorAudioMusic.assetTable(this, asset, "music_combat", true));

	// Todo: Bind rooms

	// Tags
	HelperTags.bind(this.dom.querySelector("div[name=tags]"), tags => {
		HelperTags.autoHandleAsset('tags', tags, asset);
	});

	HelperAsset.autoBind( this, asset, DB);


};



// Creates a table for this asset in another asset
export function assetTable( win, modAsset, name, single ){
	// Dungeons are never unique. Because it's gonna be a pain for modders to use otherwise.
	return HelperAsset.linkedTable( win, modAsset, name, CONSTRUCTOR, DB, ['label', 'name'], single, undefined, undefined, undefined, undefined, false);
}


// Listing
export function list(){

	this.setDom(HelperAsset.buildList(this, DB, CONSTRUCTOR, {
		'*label' : true,
		'*name' : true,
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
		consumables : []
	}));

};

export function help(){

	let out = '';
	out += '<h3>Common pitfalls!</h3>';
	out += '<ul>';
		out += '<li>Avoid adding new rooms to official dungeons. Your rooms may be overwritten in the future.</li>';
		out += '<li>Create your own "world" by making dungeons and adding portal objects like doors and direction arrows linked in the room 3d editor to your custom dungeon in order to extend the world.</li>';
	out += '</ul>';

	out += '<h3>Difficulty:</h3>'+
		'<p>Leave this at -1 for auto. This is left here for legacy purposes, in the future it may be used for something else.</p>';

	out += '<h3>Free roam:</h3>'+
		'<p>Removes all the "back" buttons on doors. Useful for dungeons with no defined start or end, such as when navigating the outdoor world.</p>';

	out += '<h3>Ambient music:</h3>'+
		'<p>Sets ambient music to play.</p>';
	out += '<h3>Combat music:</h3>'+
		'<p>Sets combat music to play.</p>';
	
	

	out += '<h3>Vars:</h3>'+
		'<p>JSON object of variables that can be set in the dungeon by things like levers or custom game actions.</p>';

	out += '<h3>Tags:</h3>'+
		'<p>These tags are added to all players when they\'re in the dungeon.</p>';

	out += '<h3>Default consumables:</h3>'+
		'<p>These are consumables that can be found in chests with autoloot in this dungeon. '+HelperAsset.helpLinkedList+'</p>';

	out += '<h3>Rooms:</h3>'+
		'<p>This is where you layout your dungeon rooms. The dropdown in the top right can be used to set the Z level of the dungeon. Click a direction arrow to add a new linked room. Ctrl+click to delete a room. But beware that this deletes any rooms connected to that one.</p>';	
	
	out += '<h3>Fog override:</h3>'+
		'<p>Lets you set a fog override value for all indoor cells. Try it in the dungeon room editor first, then copy the value over to here.</p>';	
	out += '<h3>Ambient light:</h3>'+
		'<p>Lets you override the default ambient light of 0x808080</p>';	
	out += '<h3>Saturation:</h3>'+
		'<p>Adjusts the saturation. 1 is default, 0 complete grayscale.</p>';	
	

	const url = 'https://'+window.location.hostname+'/media/audio/ambiance/';
	out += '<h3>Ambiance:</h3>'+
		'<p>URL to an ambiance you want to use, preferably ogg. You can find built in ones at <a href="'+url+'">'+url+'</a>. Leave empty to use dungeon ambient.</p>';
	out += '<h3>Ambiance volume:</h3>'+
		'<p>Volume of background audio, set to -1 to use dungeon ambiance volume.</p>';

	return out;

};


// Helper class
class DungeonLayoutEditor{


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
			const room = DungeonRoom.saveThis(new DungeonRoom({label:baseName, name:'entrance'}), "mod");
			room._mParent = {type:'dungeons', label:asset.label};
			HelperAsset.insertAsset( 'dungeonRooms',  room, this, false );
			asset.rooms = [baseName];
		
		}


		for( let roomLabel of this.asset.rooms ){

			let room = window.mod.getAssetById('dungeonRooms', roomLabel);
			if( !room ){
				console.error("Warning: Room asset not found", roomLabel);
				continue;
			}

			this.cache_rooms.push(room);

		}
		

		this.updateLevelSelector();

		this.cache_dungeon_levels = {};
		try{
			this.cache_dungeon_levels = JSON.parse(localStorage.editor_dungeon_levels);
		}catch(err){}

		this.setLevel(parseInt(this.cache_dungeon_levels["lv"+(this.asset.level || 0)]) || 0);

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

	// Updates the map for Z level
	setLevel( level ){

		this.active_level = level;

		this.getMeasurements();

		this.content.innerHTML = '';
		this.getRoomsOnLevel().map(room => this.buildRoom(room));
		this.updateLevelSelector();

		this.cache_dungeon_levels["lv"+(this.asset.level || 0)] = level;
		localStorage.editor_dungeon_levels = JSON.stringify(this.cache_dungeon_levels);

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

		x = x || 0;
		y = y || 0;
		z = z || 0;

		for( let r of this.cache_rooms ){

			let 
				rx = r.x || 0,
				ry = r.y || 0,
				rz = r.z || 0
			;

			if( rx === x && ry == y && rz === z )
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
		window.mod.mod.deleteAsset('dungeonRooms', room.label, true);

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
		html += '<span class="name'+(room._e ? ' extendedAsset' : '')+'">'+esc(roomAsset.name.substr(0, 8) || 'Unknown')+'</span>';

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
				parent_index:roomAsset.index || 0,
			});
			
			const pa = DungeonRoom.loadThis(room);
			pa.rebase();

			// Gotta map up the assets
			pa.assets = pa.assets.map(el => {
				
				if( typeof el === "string" )
					return new DungeonRoomAsset(mod.getAssetById('dungeonRoomAssets', el), room);
				return new DungeonRoomAsset(el, room);

			});

			let ra = pa.getRoomAsset();
			if( ra ){

				ra = ra.clone();
				ra.id = mod.mod.insert('dungeonRoomAssets', ra.save('mod'));
				r.addAsset(ra);

			}

			r.ambiance = pa.ambiance;
			r.ambiance_volume = pa.ambiance_volume;
			r.outdoors = pa.outdoors;
			r.dirLight = pa.dirLight;
			r.fog = pa.fog;

			r = DungeonRoom.saveThis(r, "mod");
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
			this.setRoomEditor(r.label);
		});

		// Bind click on the actual thing
		div.onclick = event => {

			if( event.ctrlKey || event.metaKey ){

				if( room._e ){

					if( confirm('Really delete your extensions?') ){

						window.mod.mod.deleteAsset('dungeonRooms', room.label);
						this.setLevel(this.active_level);

					}

					return;

				}else if( confirm("Really delete this room and any children?") ){

					let to_delete = [room];	// contains room objects to delete
					for( let r of this.cache_rooms ){

						if( this.roomHasAncestor(r, room.index) )
							to_delete.push(r);

					}

					console.log("room", to_delete);

					for( let r of to_delete )
						this.deleteRoom(r, false);

					this.setLevel(this.active_level);

					return;

				}

			}


			this.setRoomEditor(room.label);
		};

	}

	setRoomEditor( label ){

		// Bring up the room editor
		Window.getByType('dungeonRooms').map(el => el.remove());
		Window.getByType('dungeonAssets').map(el => el.remove());
		window.mod.buildAssetEditor("dungeonRooms", label);

	}


}


