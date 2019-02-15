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
		else if( type === "MeshDepthMaterial" )
			this.material = new THREE.MeshDepthMaterial(depthMaterial);
		else
			this.material = new THREE.MeshStandardMaterial(settings);
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
	fetch( unique = false ){
		let out = LibMaterial.cache.fetch(this);
		if( unique && out.clone ){
			return out.clone();
		}
		return out;
	}

	flatten(){

		if( this.type === "Water" || this.type === "Water2" )
			return this;

		let mat = this.material.clone();

		// Scan for materials to replace with loaders
		let maps = ['alphaMap','aoMap','bumpMap','displacementMap','emissiveMap','lightMap','map','metalnessMap','normalMap','roughnessMap'];
		for( let m of maps ){
			if( !mat[m] )
				continue;
			mat[m] = this.getTexture(this.material[m]);
		}

		return mat;

	}

}

LibMaterial.loader = new THREE.TextureLoader();
LibMaterial.texCache = new AC();
LibMaterial.texCache.fetchMissingAsset = function( path ){
	return LibMaterial.loader.load(path);
};

LibMaterial.cache = new AC();
LibMaterial.cache.fetchMissingAsset = function( libMatEntry ){
	return libMatEntry.flatten();
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
	},
	Metal : {
		DarkGeneric : new LibMaterial({
			map : 'tileable/metal_med.jpg',
			metalness : 0.7,
			roughness : 0.5,
		}),
		Rust : new LibMaterial({
			map : 'tileable/metal_rust.jpg',
			metalness : 0.7,
			roughness : 0.5,
		}),
	},
	Solids : {
		Black : new LibMaterial({color:0, metalness:0,roughness:1}),
		Brown : new LibMaterial({color:0x70634e, metalness:0,roughness:1}),
		GreenA : new LibMaterial({color:0x739b42, metalness:0,roughness:1}),
		GreenB : new LibMaterial({color:0x44a533, metalness:0,roughness:1}),
		GreenC : new LibMaterial({color:0x46661f, metalness:0,roughness:1}),
		YellowGlow : new LibMaterial({color:0xFFFFAA, metalness:0,roughness:1,emissive:0xFFFFAA}),
		Invisible : new LibMaterial({visible:false}),
		GreenArrow : new LibMaterial({color:0xAAFFAA, metalness:0,roughness:1,emissive:0x669966}),
	},
	Glass : {
		Green : new LibMaterial({color:0x226622, metalness:0.3,roughness:0.4}),
		Brown : new LibMaterial({color:0x332200, metalness:0.3,roughness:0.4}),
		Purple : new LibMaterial({color:0x331155, metalness:0.3,roughness:0.4}),
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
		Floor : new LibMaterial({
			map : 'tileable/wood_floor.jpg',
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
		},
		
		Rug : {
			Torn : new LibMaterial({
				map : 'tileable/rug_torn.png',
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
		Rope : new LibMaterial({
			map : 'tileable/dark_rope.jpg',
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
		BloodDepth : new LibMaterial({
			map : 'decals/bloodsplat.png',
			transparent : true,
			alphaTest : 0.5,
			type : "MeshDepthMaterial"
		}),
	
	},

	Structure : {
		CottageWall : new LibMaterial({
			map : 'tileable/cottagewall.jpg',
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
		}, "Water2")
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
	},

	Nature : {
		Bush : new LibMaterial({
			map : 'tileable/bush.png',
			metalness : 0.3,
			roughness : 0.6,
			transparent : true,
			alphaTest : 0.5,
			side : THREE.DoubleSide
		}),
		Soil : new LibMaterial({
			map : 'tileable/soil.jpg',
			metalness : 0.2,
			roughness : 0.7,
		}),
	}
};





export {LibMaterial};
export default LibMaterial.library;
