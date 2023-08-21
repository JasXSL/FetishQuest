import * as THREE from '../ext/THREE.js';
import AC from '../classes/AssetCache.js';

class LibMaterial{
	
	// Map properties are relative to /media/textures/
	constructor( settings, type ){

		this.type = type;
		if( type === "Water" ){
			this.material = settings;
			settings.waterNormals = this.getTexture(settings.waterNormals);
			settings.waterNormals.wrapS = settings.waterNormals.wrapT = THREE.RepeatWrapping;
		}
		else if( type === "Water2" ){
			this.material = settings;

			settings.normalMap0 = this.getTexture(settings.normalMap0);
			settings.normalMap1 = this.getTexture(settings.normalMap1);
			
		}
		// Textures can be an object also with "texture" being the URL, and any other thee texture properties setup
		else if( type === "MeshDepthMaterial" ){

			this.material = new THREE.MeshStandardMaterial(settings);
			this.material.userData.customDepthMaterial = new THREE.MeshDepthMaterial({
				map : this.getTexture(settings.map),
				depthPacking : THREE.RGBADepthPacking,
				alphaTest:0.5
			});

		}
		else{
			
			this.material = new THREE.MeshStandardMaterial(settings);

		}

		if( this.material.userData )
			this.material.userData.settings = settings;
		
	}

	getTexture( input ){

		let texture = input;
		let props = {};
		if( typeof texture === "object" ){

			props = texture;
			texture = texture.texture;
			delete props.texture;

		}

		let map = LibMaterial.texCache.fetch('media/textures/'+texture);
		map.wrapS = map.wrapT = THREE.RepeatWrapping;
		for( let prop in props ){
			map[prop] = props[prop];
		}
		
		return map;

	}
	
	// Fetches from cache and makes unique if need be 
	fetch(){
		return this.flatten();
	}

	flatten(){

		if( this.type === "Water" || this.type === "Water2" )
			return this;

		let mat = this.material.clone();
		mat.userData = this.material.userData;
		// Scan for materials to replace with loaders
		let maps = ['alphaMap','aoMap','bumpMap','displacementMap','emissiveMap','lightMap','map','metalnessMap','normalMap','roughnessMap'];
		for( let m of maps ){
			if( !mat[m] )
				continue;
			mat[m] = this.getTexture(this.material[m]);
			if( mat.userData.settings )
				mat.userData.settings[m] = mat[m];
		}

		return mat;

	}

}

LibMaterial.loader = new THREE.TextureLoader();
LibMaterial.texCache = new AC();
LibMaterial.texCache.fetchMissingAsset = function( path ){
	return LibMaterial.loader.load(path);
};


const cubeLoader = new THREE.CubeTextureLoader();
cubeLoader.setPath('media/textures/cubemaps/');
LibMaterial.cubeMaps = {
	bridge : cubeLoader.load(['posx.jpg','negx.jpg','posy.jpg','negy.jpg','posx.jpg','negx.jpg'])
};


LibMaterial.library = {
	Sprites : {
		ExitBadge : new LibMaterial({
			map : 'decals/exit.png',
			metalness : 0,
			roughness : 1,
			transparent : true,
			alphaTest : 0.5,
		}),
		LockedBadge : new LibMaterial({
			map : 'decals/locked.png',
			metalness : 0,
			roughness : 1,
			transparent : true,
			alphaTest : 0.5,
		}),
	},
	Decal : {
		SmolderingAsh : new LibMaterial({
			map : 'decals/smoldering_pile.png',
			emissive : new THREE.Color(0xFFFFFF),
			emissiveMap : 'decals/smoldering_pile_emissive.jpg',
			metalness : 0.4,
			roughness : 0.8,
			transparent : true,
			alphaTest : 0.5,
		}),
		RuneCirclePurple : new LibMaterial({
			map : 'decals/rune_circle.png',
			emissive : new THREE.Color(0xDD55FF),
			emissiveMap : 'decals/rune_circle.png',
			color : new THREE.Color(0xDD55FF),
			metalness : 0.4,
			roughness : 0.8,
			transparent : true,
			//alphaTest : 0.5,
		}),
	},
	Metal : {
		DarkGeneric : new LibMaterial({
			map : 'tileable/metal_med.jpg',
			metalness : 0.7,
			roughness : 0.5,
			name : 'DarkGeneric'
		}),
		Rust : new LibMaterial({
			map : 'tileable/metal_rust.jpg',
			metalness : 0.7,
			roughness : 0.5,
		}),
		Gold : new LibMaterial({
			color : new THREE.Color(0xFFFFAA),
			metalness : 0.65,
			roughness : 0.6,
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		Silver : new LibMaterial({
			color : new THREE.Color(0xDDDDFF),
			metalness : 0.65,
			roughness : 0.6,
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		Steel : new LibMaterial({
			color : new THREE.Color(0xAAAAAA),
			metalness : 0.9,
			roughness : 0.1,
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		Copper : new LibMaterial({
			color : new THREE.Color(0xDDAA66),
			metalness : 0.7,
			roughness : 0.5,
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		Chain : new LibMaterial({
			map : 'tileable/chain.png',
			transparent : true,
			alphaTest : 0.5,
			metalness : 0.8,
			roughness : 0.8,
			side : THREE.DoubleSide,
		}),
	},
	Solids : {
		Black : new LibMaterial({color:0, metalness:0,roughness:1}),
		Rubber : new LibMaterial({color:0x111111, metalness:0.2,roughness:0.5}),
		Brown : new LibMaterial({color:0x70634e, metalness:0,roughness:1}),
		GreenA : new LibMaterial({color:0x739b42, metalness:0,roughness:1}),
		GreenB : new LibMaterial({color:0x44a533, metalness:0,roughness:1}),
		GreenC : new LibMaterial({color:0x46661f, metalness:0,roughness:1}),
		YellowGlow : new LibMaterial({color:0xFFFFAA, metalness:0,roughness:1,emissive:0xFFFFAA}),
		Invisible : new LibMaterial({visible:false}),
		GreenArrow : new LibMaterial({color:new THREE.Color(0xAAFFAA), metalness:0,roughness:1,emissive:new THREE.Color(0x669966)}),
	},
	Glass : {
		Green : new LibMaterial({color:new THREE.Color(0x226622), metalness:0.3,roughness:0.4}),
		BlueTransparent : new LibMaterial({color:new THREE.Color(0x226699), metalness:0.3,roughness:0.3, opacity:0.5, transparent:true}),
		Brown : new LibMaterial({color:new THREE.Color(0x332200), metalness:0.3,roughness:0.4}),
		Purple : new LibMaterial({color:new THREE.Color(0x331155), metalness:0.3,roughness:0.4}),
		RedGlow : new LibMaterial({color:new THREE.Color(0xF0A0A0), metalness:0.2,roughness:0.3, emissive:new THREE.Color(0x400000)}),
		BlueGlow : new LibMaterial({color:new THREE.Color(0xA0C0F0), metalness:0.2,roughness:0.3, emissive:new THREE.Color(0x004060)}),
		PurpleGlow : new LibMaterial({
			color:new THREE.Color(0x331155), metalness:0.3,roughness:0.4,
			roughnessMap : 'tileable/glass_plane_r.jpg',
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		DemallineCrystal : new LibMaterial({
			color:new THREE.Color(0xFFAAFF), 
			metalness:0.6,roughness:0.2,
			emissive : new THREE.Color(0.3,0,0.3),
			roughnessMap : 'tileable/glass_plane_r.jpg',
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),
		BrownHighRes : new LibMaterial({
			color:new THREE.Color(0x332200), metalness:0.3,
			roughnessMap : 'tileable/glass_plane_r.jpg',
			normalMap : 'tileable/glass_plane_n.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
		}),

	},
	StoneTile : {
		DungeonWall : new LibMaterial({
			map : 'tileable/dungeon_wall.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		DungeonFloor : new LibMaterial({
			map : 'tileable/dungeon_floor.jpg',
			metalness : 0.4,
			roughness : 0.5
		}),
		BigBlocks : new LibMaterial({
			map : 'tileable/dungeon_brick_wall.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
		ChurchFloor : new LibMaterial({
			map : 'tileable/church_floor.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
		ChurchFloor2 : new LibMaterial({
			map : 'tileable/church_floor_2.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
		ChurchWall : new LibMaterial({
			map : 'tileable/church_wall.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
		StoneWall : new LibMaterial({
			map : 'tileable/stone_wall.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
		RoofShingles : new LibMaterial({
			map : 'tileable/roof_tiles.jpg',
			metalness : 0.4,
			roughness : 0.6
		}),
	},
	Marble : {
		Tiles : new LibMaterial({
			map : 'tileable/marble.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
	},
	Rock : {
		Wall : new LibMaterial({
			map : 'tileable/rock_wall.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		Floor : new LibMaterial({
			map : 'tileable/rock_floor.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		FloorRunes : new LibMaterial({
			map : 'tileable/rock_floor_runes.jpg',
			emissiveMap : 'tileable/rock_floor_runes_emissive.jpg',
			metalness : 0.4,
			roughness : 0.7,
			emissive : new THREE.Color(0xAAAAAA)
		}),
		Moss : new LibMaterial({
			map : 'tileable/moss_rock_better.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		Snow : new LibMaterial({
			map : 'tileable/snow_rock.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		Quartz : new LibMaterial({
			map : 'tileable/quartz.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
	},
	Brick : {
		DungeonBlack : new LibMaterial({
			map : 'tileable/dungeon_brick.jpg',
			metalness : 0.5,
			roughness : 0.4,
		}),
		Small : new LibMaterial({
			map : 'tileable/small_brick.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
		Tile : new LibMaterial({
			map : 'tileable/dungeon_brick_tile.jpg',
			metalness : 0.4,
			roughness : 0.7,
		}),
	},
	Wood : {
		Board : new LibMaterial({
			map : 'tileable/wood.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Crate : new LibMaterial({
			map : 'tileable/crate.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Logs : new LibMaterial({
			map : 'tileable/logs.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
		Cork : new LibMaterial({
			map : 'tileable/cork.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
		Firewood : new LibMaterial({
			map : 'tileable/firewood.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		Bark : new LibMaterial({
			map : 'tileable/bark.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		// todo
		BarkMoss : new LibMaterial({
			map : 'tileable/bogtree.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		Stump : new LibMaterial({
			map : 'decals/stump.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		Floor : new LibMaterial({
			map : 'tileable/wood_floor.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Reinforced : new LibMaterial({
			map : 'tileable/wood_iron_wall.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Floor2 : new LibMaterial({
			map : 'tileable/wood_floor_2.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Old : new LibMaterial({
			map : 'tileable/old_wood.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
	},
	Paper : {
		Torn : new LibMaterial({
			map : 'tileable/tornpaper.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}),
	},
	Candle : {
		Wax : new LibMaterial({
			color : 0xDDCCAA,
			metalness : 0.3,
			roughness : 0.6,
		}),
		Wick : new LibMaterial({
			color : 0x333333,
			metalness : 0.2,
			roughness : 0.8
		}),
	},
	Book : {
		Full : new LibMaterial({
			map : 'tileable/book_large.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
		Closed : new LibMaterial({
			map : 'tileable/book_small.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
		
	},
	Cloth : {
		Banner : {
			RaggedHand : new LibMaterial({
				map : 'tileable/banner_ragged.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
				side:THREE.DoubleSide
			}),
			Navy : new LibMaterial({
				map : 'tileable/banner_navy.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
				side:THREE.DoubleSide
			}),
			Cum : new LibMaterial({
				map : 'tileable/banner_cum.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
				side:THREE.DoubleSide
			}),
		},
		
		Rug : {
			Torn : new LibMaterial({
				map : 'tileable/rug_torn.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
			}),
			Hide : new LibMaterial({
					map : 'tileable/rug_hide.png',
					metalness : 0.3,
					roughness : 0.5,
					transparent : true,
					alphaTest : 0.5,
			}),
			White : new LibMaterial({
				map : 'tileable/rug_white.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
			}),
			Yellow : new LibMaterial({
				map : 'tileable/rug_yellow.png',
				metalness : 0.3,
				roughness : 0.5,
				transparent : true,
				alphaTest : 0.5,
			}),
		},
		
		Dark : new LibMaterial({
			map : 'tileable/dark_cloth.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		Thick : new LibMaterial({
			map : 'tileable/cloth_thick.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		Sheet : new LibMaterial({
			map : 'tileable/cloth_sheet.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),
		RedFelt : new LibMaterial({
			map : 'tileable/red_felt.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Green : new LibMaterial({
			map : 'tileable/cloth_green.jpg',
			metalness : 0.3,
			roughness : 0.8,
		}),

		DarkDoublesided : new LibMaterial({
			map : 'tileable/dark_cloth.jpg',
			metalness : 0.3,
			roughness : 0.8,
			side : THREE.DoubleSide
		}),
		Rope : new LibMaterial({
			map : 'tileable/dark_rope.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
		Yarn : new LibMaterial({
			map : 'tileable/yarn.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
	},
	Splat : {
		Blood : new LibMaterial({
			map : 'decals/bloodsplat.png',
			metalness : 0.3,
			roughness : 0.7,
			transparent : true,
			alphaTest : 0.5,
			side:THREE.DoubleSide
		}),
		HandprintsGreen : new LibMaterial({
			map : 'decals/handprints_green.png',
			metalness : 0.3,
			roughness : 0.7,
			transparent : true,
			alphaTest : 0.5,
			side:THREE.DoubleSide
		}),
		BloodDepth : new LibMaterial({
			map : 'decals/bloodsplat.png',
			transparent : true,
			alphaTest : 0.5,
		}, "MeshDepthMaterial"),
		Black : new LibMaterial({
			map : 'decals/bloodsplat.png',
			metalness : 0.3,
			roughness : 0.7,
			transparent : true,
			alphaTest : 0.5,
			color : 0x111111,
			side:THREE.DoubleSide
		}),
	},

	Structure : {
		CottageWall : new LibMaterial({
			map : 'tileable/cottagewall.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
		CottageWall2 : new LibMaterial({
			map : 'tileable/cottagewall_2.jpg',
			metalness : 0.3,
			roughness : 0.7,
		}),
		CottageRoof : new LibMaterial({
			map : 'tileable/straw_roof.jpg',
			metalness : 0.2,
			roughness : 0.7,
		}),
		StrawRoof : new LibMaterial({
			map : 'tileable/straw_roof_simple.jpg',
			metalness : 0.2,
			roughness : 0.7,
		}),
	},

	Land : {
		Yuug : new LibMaterial({
			map : 'land/yuug.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		YuugPortMid : new LibMaterial({
			map : 'land/yuug_port_mid.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachA : new LibMaterial({
			map : 'land/beach_a.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachB : new LibMaterial({
			map : 'land/beach_b.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachC : new LibMaterial({
			map : 'land/beach_c.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachD : new LibMaterial({
			map : 'land/beach_d.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachE : new LibMaterial({
			map : 'land/beach_e.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		BeachF : new LibMaterial({
			map : 'land/beach_f.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		MainroadA : new LibMaterial({
			map : 'land/woods_1.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		MainroadB : new LibMaterial({
			map : 'land/woods_2.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		MainroadC : new LibMaterial({
			map : 'land/woods_3.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		MainroadD : new LibMaterial({
			map : 'land/woods_4.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		MainroadE : new LibMaterial({
			map : 'land/woods_5.jpg',
			metalness : 0.1,
			roughness : 0.8,
		}),
		GrassGen_000 : new LibMaterial({
			map : 'land/grassgen_000.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		GrassGen_001 : new LibMaterial({
			map : 'land/grassgen_001.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		GrassGen_002 : new LibMaterial({
			map : 'land/grassgen_002.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		GrassGen_003 : new LibMaterial({
			map : 'land/grassgen_003.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		GrassGen_004 : new LibMaterial({
			map : 'land/grassgen_004.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		GrassGen_005 : new LibMaterial({
			map : 'land/grassgen_005.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_000 : new LibMaterial({
			map : 'land/frostground_000.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_001 : new LibMaterial({
			map : 'land/frostground_001.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_002 : new LibMaterial({
			map : 'land/frostground_002.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_003 : new LibMaterial({
			map : 'land/frostground_003.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_004 : new LibMaterial({
			map : 'land/frostground_004.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		SnowGen_005 : new LibMaterial({
			map : 'land/frostground_005.jpg',
			metalness : 0.1,roughness : 0.8,
		}),


		FarmpathNoPath : new LibMaterial({
			map : 'land/farmpath_no_path.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		FarmpathStraight : new LibMaterial({
			map : 'land/farmpath_straight.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		FarmpathStraightField : new LibMaterial({
			map : 'land/farmpath_straight_field.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		FarmpathT : new LibMaterial({
			map : 'land/farmpath_t.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		FarmpathX : new LibMaterial({
			map : 'land/farmpath_x.jpg',
			metalness : 0.1,roughness : 0.8,
		}),

		RiverBridge : new LibMaterial({
			map : 'land/river_bridge_d.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		RiverBridgePath : new LibMaterial({
			map : 'land/river_bridge_path_d.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		RiverPlateau : new LibMaterial({
			map : 'land/river_plateau.jpg',
			metalness : 0.1,roughness : 0.8,
		}),

		TownX : new LibMaterial({
			map : 'land/town_x.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		TownT : new LibMaterial({
			map : 'land/town_t.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		TownStraight : new LibMaterial({
			map : 'land/town_straight.jpg',
			metalness : 0.1,roughness : 0.8,
		}),
		TownBend : new LibMaterial({
			map : 'land/town_bend.jpg',
			metalness : 0.1,roughness : 0.8,
		}),

		SwampA : new LibMaterial({
			map : 'land/swamp_a.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),
		SwampB : new LibMaterial({
			map : 'land/swamp_b.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),
		SwampC : new LibMaterial({
			map : 'land/swamp_c.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),
		SwampD : new LibMaterial({
			map : 'land/swamp_d.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),

		SeafloorA : new LibMaterial({
			map : 'land/seafloor_a.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),
		SeafloorB : new LibMaterial({
			map : 'land/seafloor_b.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),
		SeafloorC : new LibMaterial({
			map : 'land/seafloor_c.jpg',
			metalness : 0.1,
			roughness : 0.6,
		}),

	},

	Water : {
		Ocean : new LibMaterial({
			waterNormals : 'land/waternormals_small.jpg',
			sunDirection: new THREE.Vector3(0,0.75,-0.25).normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 20,
			size : 1.5,
			alpha : .9,
			fog: false,
		}, "Water"),
		River : new LibMaterial({
			color : 0xDDEEFF,
			scale : 0.5,
			flowDirection : new THREE.Vector2(1,0),
			textureWidth: 512,
			textureHeight: 512,
			normalMap0 : 'land/waternormals_small.jpg',
			normalMap1 : 'land/waternormals_small.jpg',
		}, "Water2"),
		WaterRing : new LibMaterial({
			map : 'particles/glow_ring.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			depthWrite : false,
		}, "MeshDepthMaterial"),
	},

	Sign : {
		Store : new LibMaterial({
			map : 'tileable/sign_shop.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Blacksmith : new LibMaterial({
			map : 'tileable/sign_blacksmith.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Dojo : new LibMaterial({
			map : 'tileable/sign_dojo.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Port : new LibMaterial({
			map : 'tileable/sign_port_authority.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Tavern : new LibMaterial({
			map : 'tileable/sign_tavern.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		Warning : new LibMaterial({
			map : 'bakes/sign_warning.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
	},

	Nature : {
		Bush : new LibMaterial({
			map : 'tileable/bush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		BushTop : new LibMaterial({
			map : 'decals/bush_top.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		Grass : new LibMaterial({
			map : 'decals/grass_decal.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		BushA : new LibMaterial({
			map : 'decals/bush_a.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		Hedge : new LibMaterial({
			map : 'tileable/hedge.jpg',
			metalness : 0.3,
			roughness : 0.6
		}),
		HedgeAutumn : new LibMaterial({
			map : 'tileable/hedge_autumn.jpg',
			metalness : 0.3,
			roughness : 0.6
		}),
		HedgeBranch : new LibMaterial({
			map : 'decals/hedge_branch.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		BormStraw : new LibMaterial({
			map : 'decals/bormStraw.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushThicc : new LibMaterial({
			map : 'decals/bush_thicc.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushGrass : new LibMaterial({
			map : 'decals/grassbush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushTropical : new LibMaterial({
			map : 'decals/bush_tropical.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushPalm : new LibMaterial({
			map : 'decals/bush_palm.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushRedgrass : new LibMaterial({
			map : 'decals/grass_red.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),
		BushTree : new LibMaterial({
			map : 'decals/treebush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, 'MeshDepthMaterial'),

		FlowersA : new LibMaterial({
			map : 'decals/flowers_a.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		FlowersB : new LibMaterial({
			map : 'decals/flowers_b.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		GrassA : new LibMaterial({
			map : 'decals/grass_a.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		GrassB : new LibMaterial({
			map : 'decals/grass_b.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		GrassC : new LibMaterial({
			map : 'decals/grass_c.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		TreeA : new LibMaterial({
			map : 'decals/tree_a.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		TreeB : new LibMaterial({
			map : 'decals/tree_b.png',
			metalness : 0.3,roughness : 0.6,transparent : true,alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		TreeWinter : new LibMaterial({
			map : 'decals/shed_tree.png',
			metalness : 0.3,roughness : 0.6,transparent : true,alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		TreeWinterFrost : new LibMaterial({
			map : 'decals/frost_tree.png',
			metalness : 0.3,roughness : 0.6,transparent : true,alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		Spruce : new LibMaterial({
			map : 'decals/sprucebranches.png',
			metalness : 0.3,roughness : 0.6,transparent : true,alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		SpruceSnow : new LibMaterial({
			map : 'decals/sprucebranches_snow.png',
			metalness : 0.3,roughness : 0.6,transparent : true,alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		Mist : new LibMaterial({
			map : 'particles/smokeparticle.png',
			opacity : 0.1,
			metalness : 0.0,
			roughness : 1,
			transparent : true,
			emissive : new THREE.Color(0xFFFFFF),
			side : THREE.DoubleSide,
		}, "MeshDepthMaterial"),

		Vines : new LibMaterial({
			map : 'decals/vines.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),

		Seaweed : new LibMaterial({
			map : 'decals/seaweed.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),

		TreeVines : new LibMaterial({
			map : 'decals/hanging_vines.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		Bogtree : new LibMaterial({
			map : 'decals/bogtree_crown.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),

		CarrotBush : new LibMaterial({
			map : 'decals/carrot_bush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),

		RazzyBerryBush : new LibMaterial({
			map : 'tileable/berrybush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}, "MeshDepthMaterial"),
		RazzyBerryStem : new LibMaterial({
			map : 'bakes/razzyberries_d.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		RazzyBerryBerries : new LibMaterial({
			map : 'bakes/razzyberries_d.jpg',
			metalness : 0.3,
			roughness : 0.3,
		}),
		
		Soil : new LibMaterial({
			map : 'tileable/soil.jpg',
			metalness : 0.2,
			roughness : 0.7,
		}),

		Pumpkin : new LibMaterial({
			map : 'tileable/pumpkin.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),

		Seashell : new LibMaterial({
			map : 'tileable/seashell.jpg',
			metalness : 0.4,
			roughness : 0.6,
		}),
		Starfish : new LibMaterial({
			map : 'tileable/starfish.jpg',
			metalness : 0.4,
			roughness : 0.6,
		}),

		PalmRoof : new LibMaterial({
			map : 'decals/palm_roof.png',
			metalness : 0.2,
			roughness : 0.7,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide,
		}),

		

	},

	Poster : {
		MapFancy : new LibMaterial({
			map : 'tileable/map_fancy.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
		MapTorn : new LibMaterial({
			map : 'tileable/torn_map.png',
			metalness : 0.3,
			roughness : 0.5,
			transparent : true,
			alphaTest : 0.5,
		}),
	},

	Misc : {
		Bone : new LibMaterial({
			map : 'tileable/bone_seamless.jpg',
			metalness : 0.3,
			roughness : 0.6,
		}),
		TarotDeck : new LibMaterial({
			map : 'decals/tarotdeck.jpg',
			metalness : 0.3,
			roughness : 0.5,
		}),
		TentacleNest : new LibMaterial({
			map : 'tileable/tickle_tentacle_nest.jpg',
			roughnessMap : 'tileable/tickle_tentacle_nest_r.jpg',
			normalMap : 'tileable/tickle_tentacle_nest_n.jpg',
			metalness : 0.0,
			roughness : 0.75,
		}),
		
		
	},

	Bakes : {
		TentacleRing : new LibMaterial({
			map : 'bakes/tentacle_ring_d.jpg',
			roughnessMap : 'bakes/tentacle_ring_s.jpg',
			envMap : LibMaterial.cubeMaps.bridge,
			metalness : 0,
			roughness : 0.8,
		}),
		Lightacles : new LibMaterial({
			map : 'bakes/lightacle_d.jpg',
			emissiveMap : 'bakes/lightacle_glow.jpg',
			emissive : 0xFFFFFF,
			metalness : 0.3,
			roughness : 0.6,
		}),
	},
};


export {LibMaterial};
export default LibMaterial.library;
