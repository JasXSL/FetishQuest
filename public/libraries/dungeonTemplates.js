import {default as Dungeon, RoomTemplate as RoomTemplate} from '../classes/templates/DungeonTemplate.js';
import stdTag from './stdTag.js';
import {kits as monsterKits} from './playerTemplates.js';

const propKits = {
	dungeon_room : [
		"Generic.Containers.Barrel",
		"Generic.Containers.Crate",
		"Generic.Containers.CrateOpen",
		"Farm.Furniture.TableCorner",
		"Farm.Furniture.TableOneChair",
		"Farm.Furniture.TableTwoBenches",
		"Farm.Furniture.ShelfContainers",
		"Farm.Furniture.ShelfProps",
		"Dungeon.Doodads.BannerAnimated",		
		"Farm.Furniture.Bench",
		"Dungeon.Furniture.RugTorn",
		"Generic.Emitters.WallSconce",
	],
	dungeon_corridor : [
		"Generic.Emitters.TorchHolder",
		"Dungeon.Furniture.RugTorn",
		"Dungeon.Doodads.BannerAnimated",
		"Farm.Furniture.ShelfContainers",
		"Farm.Furniture.ShelfProps",
	],
	dungeon_containers : [
		'Generic.Containers.ChestInteractive'
	],
};


let rooms = {};
// Start with rooms
rooms.darkChamber = new RoomTemplate({
	label : 'darkChamber',
	tags : [stdTag.duDark,stdTag.duRoom],
	basemeshes : [
		"Dungeon.Room.R10x10",
		"Dungeon.Room.R6x6",
	],
	containers : propKits.dungeon_containers,
	props : propKits.dungeon_room
});
rooms.darkCorridor = new RoomTemplate({
	label : 'darkCorridor',
	tags : [stdTag.duDark,stdTag.duRoom],
	basemeshes : [
		"Dungeon.Room.R10x10RL",
		"Dungeon.Room.R6x10",
	],
	containers : propKits.dungeon_containers,
	props : propKits.dungeon_corridor
});




let dungeons = [];
dungeons.push(new Dungeon({
	label : 'dark',
	// Todo: Need a door going up, and one going down also
	tags : [stdTag.duIndoor],
	doors_hor : ["Dungeon.Door.Default"],
	doors_up : ["Dungeon.Door.Ladder"],
	doors_down : ["Dungeon.Door.Trapdoor"],
	monster_types : [
		// Allow demons and tentacles to coexist
		monsterKits.demons.concat(monsterKits.tentacles)
	],
	rooms : [
		rooms.darkChamber,
		rooms.darkCorridor
	],
}));



export default dungeons;
