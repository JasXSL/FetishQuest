// Top level maps
import {default as Dungeon, DungeonRoom,DungeonRoomAsset,DungeonEncounter} from '../classes/Dungeon.js';

const library = {
	World : {},			// World map
	Place : {},			// Place on world map such as a forest or town
	Dungeon : {},		// A traditional dungeon
};
export default library;


// Yuug
library.World.Yuug = {
	name : 'Yuug',
	tags : [],
	rooms : [
		{
			outdoors : true,
			zoom : 700,
			discovered : true,
			assets : [
				// Main
				{
					absolute : true,
					model : 'Land.Yuug.Yuug',
					type : DungeonRoomAsset.Types.Room,
					data : {},
					attachments : [0],
					locked : false,	
				},
				// Capital
				{
					absolute : true,
					model : 'Land.Yuug.Capital',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Capital',
					},
					attachments : [0],
					locked : true,	
				},
				// Wallburg
				{
					absolute : true,
					model : 'Land.Yuug.Wallburg',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Wallburg',
					},
					locked : true,	
				},
				// Westwood
				{
					absolute : true,
					model : 'Land.Yuug.Westwood',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Westwood',
					},
					locked : true,	
				},
				// Eastwood
				{
					absolute : true,
					model : 'Land.Yuug.Eastwood',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Eastwood',
					},
					locked : true,	
				},
				// Southwood
				{
					absolute : true,
					model : 'Land.Yuug.Southwood',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Southwood',
					},
					locked : true,	
				},
				// MidwayFarm
				{
					absolute : true,
					model : 'Land.Yuug.MidwayFarm',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Midway Farm',
					},
					locked : true,	
				},
				// Cottaga
				{
					absolute : true,
					model : 'Land.Yuug.Cottaga',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Cottaga',
					},
					locked : true,	
				},
				// Eaststead
				{
					absolute : true,
					model : 'Land.Yuug.Eaststead',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Eaststead',
					},
					locked : true,	
				},
				// Wallway Farm
				{
					absolute : true,
					model : 'Land.Yuug.WallwayFarm',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Wallway Farm',
					},
					locked : true,	
				},
				// EastwoodFarm
				{
					absolute : true,
					model : 'Land.Yuug.EastwoodFarm',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Eastwood Farm',
					},
					locked : true,	
				},
				// Seawatch
				{
					absolute : true,
					model : 'Land.Yuug.Seawatch',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Seawatch',
					},
					locked : true,	
				},

				// AbandonedCottage
				{
					absolute : true,
					model : 'Land.Yuug.AbandonedCottage',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Abandoned Cottage',
					},
					locked : true,	
				},
				// WestwallFarm
				{
					absolute : true,
					model : 'Land.Yuug.WestwallFarm',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Westwall Farm',
					},
					locked : true,	
				},
				// Port
				{
					absolute : true,
					model : 'Land.Yuug.Port',
					type : DungeonRoomAsset.Types.Exit,
					data : {
						label : 'Yuug Port',
					},
					locked : true,	
				},
				// Wall
				{
					absolute : true,
					model : 'Land.Yuug.Wall',
					type : DungeonRoomAsset.Types.Prop,
				},
			],
			ambiance : 'media/audio/ambiance/dungeon.ogg',
			ambiance_volume : 0.2,
		},
	],
};

library.Place.Yuug = {};
library.Place.Yuug.Port = {
	name : 'Yuug Port',
	tags : [],
	rooms : [
		{
			outdoors : true,
			discovered : false,
			assets : [
				{
					absolute : true,
					model : 'Land.Yuug.Port.LandMid',
					type : DungeonRoomAsset.Types.Room,
					data : {},
				},
				// Water
				{
					absolute : true,
					model : 'Land.Yuug.Ocean',
					type : DungeonRoomAsset.Types.Prop,
					data : {},
				},
				// Docks
				{
					absolute : true,
					model : 'Land.Yuug.Port.JettyMid',
					type : DungeonRoomAsset.Types.Prop,
					absolute : true,
					data : {},
				},
			],
			ambiance : 'media/audio/ambiance/dungeon.ogg',
			ambiance_volume : 0.2,
		},
	]
};

