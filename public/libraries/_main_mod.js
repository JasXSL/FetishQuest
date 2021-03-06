import stdTag from "./stdTag.js";
import Mod from '../classes/Mod.js';

import texts from './mainMod/texts.js';

console.log("Setting up mainMod");
import {getArray as getConds} from './mainMod/conditions.js';
import {getArray as getActions} from './mainMod/actions.js';
import {getArray as getPlayerClasses} from './mainMod/playerClasses.js';
import {getArray as getAudioKits} from './mainMod/audioKits.js';
import {getArray as getDungeonTemplates} from './mainMod/dungeonTemplates.js';
import {getArray as getEncounters} from './mainMod/encounters.js';
import {getArray as getPlayerTemplates} from './mainMod/playerTemplates.js';
import {getArray as getHitFX} from './mainMod/hitfx.js';
import {getArray as getAssets} from './mainMod/assets.js';
import {getArray as getAssetTemplates} from './mainMod/assetTemplates.js';
import {getArray as getWrappers} from './mainMod/wrappers.js';
import {getArray as getGameActions} from './mainMod/gameActions.js';
import {getArray as getPlayers} from './mainMod/players.js';
import {getArray as getRoleplays} from './mainMod/roleplays.js';
import {getArray as getEffects} from './mainMod/effects.js';
import {getArray as getQuests} from './mainMod/quests.js';
import {getArray as getShops} from './mainMod/shops.js';
import {getArray as getActionLearnable} from './mainMod/actionLearnable.js';
import {getArray as getFactions} from './mainMod/factions.js';
import chats from './mainMod/chats.js';

import dungeons from './mainMod/dungeons.js';
import Player from "../classes/Player.js";
import Action from "../classes/Action.js";

// This is a special mod 
const mod = new Mod(
	{
		id:"MAIN",
		name:"MAIN",
		author:"JasX",
		description:"This is a copy of main. Export into _main_mod.js",
		dungeons:dungeons,
		quests:getQuests(),
		vars:{},
		texts:texts.concat(chats),
		actions:getActions(),
		assets:getAssets(),
		audioKits:getAudioKits(),
		playerClasses:getPlayerClasses(),
		conditions:getConds(),
		playerTemplates:getPlayerTemplates(),
		assetTemplates:getAssetTemplates(),
		gameActions : getGameActions(),
		materialTemplates:[
			{label : "cotton",
				name : "Cotton",
				tags : [
					"as_cloth",
					"as_stretchy",
					"as_cotton"
				],
				"weight":400,
				"level":1,
				"durability_bonus":1,
			},
			{"label":"silk",
				"name":"Silk",
				"tags":[
					"as_cloth",
					"as_stretchy",
					"as_silk"
				],
				"weight":300,
				"level":3,
				"durability_bonus":1,
				primaryStats : {
					[Player.primaryStats.intellect] : 1
				},
			},
			{"label":"mageweave",
				"name":"Mageweave",
				"tags":[
					"as_cloth",
					"as_mageweave"
				],
				"weight":500,
				"level":8,
				"durability_bonus":1,
				primaryStats : {
					[Player.primaryStats.intellect] : 2
				},
			},
			{"label":"shadowcloth",
				"name":"Shadowcloth",
				"tags":[
					"as_cloth",
					"as_shadowcloth"
				],
				"weight":300,
				"level":14,
				"durability_bonus":1,
				primaryStats : {
					[Player.primaryStats.intellect] : 3
				},
			},

			{"label":"leather",
				"name":"Leather",
				"tags":[
					"as_leather"
				],
				"weight":2000,
				"level":1,
				"durability_bonus":1.25,
				primaryStats : {
					[Player.primaryStats.agility] : 1,
					[Player.primaryStats.intellect] : -1,
				},
			},
			{"label":"rawhide",
				"name":"Rawhide",
				"tags":[
					"as_leather",
					"as_rawhide"
				],
				"weight":3000,
				"level":3,
				"durability_bonus":1.5,
				primaryStats : {
					[Player.primaryStats.agility] : 1,
					[Player.primaryStats.intellect] : -1,
				},
			},
			{"label":"stretchhide",
				"name":"Stretch-hide",
				"tags":[
					"as_leather",
					"as_stretchy"
				],
				"weight":2000,
				"level":6,
				"durability_bonus":2,
				primaryStats : {
					[Player.primaryStats.agility] : 2,
					[Player.primaryStats.intellect] : -1,
				},
			},
			{"label":"mailCopper",
				"name":"Copper-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_copper"
				],
				"weight":7000,
				"level":3,
				"durability_bonus":2,
			},
			{"label":"mailSteel",
				"name":"Steel-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_steel"
				],
				"weight":5000,
				"level":6,
				"durability_bonus":2.5,
			},
			{"label":"mailMithril",
				"name":"Mithril-mail",
				"tags":[
					"as_mail",
					"as_metal",
					"as_mithril"
				],
				"weight":1000,
				"level":12,
				"durability_bonus":3,
				primaryStats : {
					[Player.primaryStats.agility] : 1,
				},
			},
			{"label":"plateCopper",
				"name":"Copper",
				"tags":[
					"as_plate",
					"as_metal",
					"as_hard",
					"as_copper"
				],
				"weight":9000,
				"level":5,
				"durability_bonus":2.5,
				primaryStats : {
					[Player.primaryStats.intellect] : -3,
					[Player.primaryStats.stamina] : 2,
				},
			},
			{"label":"plateSteel",
				"name":"Steel",
				"tags":[
					"as_plate",
					"as_metal",
					"as_hard",
					"as_steel"
				],
				"weight":8000,
				"level":10,
				"durability_bonus":3,
				primaryStats : {
					[Player.primaryStats.intellect] : -3,
					[Player.primaryStats.stamina] : 3,
				},
			},
			{"label":"plateSoftsilver",
				"name":"Softsilver",
				"tags":[
					"as_metal",
					"as_stretchy",
					"as_softsilver"
				],
				"weight":1500,
				"level":20,
				"durability_bonus":4,
				primaryStats : {
					[Player.primaryStats.intellect] : -2,
					[Player.primaryStats.stamina] : 3,
				},
			}
		],
		factions : getFactions(),
		dungeonTemplates:getDungeonTemplates(),
		effects:getEffects(),
		wrappers:getWrappers(),
		encounters : getEncounters(),
		hitFX : getHitFX(),
		players : getPlayers(),
		roleplay : getRoleplays(),
		shops: getShops(),
		actionLearnable : getActionLearnable()
	}
);

export default mod;