import Action from "../../classes/Action.js";
import stdTag from "../stdTag.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
//import Asset from "../../classes/Asset.js";
import GameEvent from "../../classes/GameEvent.js";
//import Player from "../../classes/Player.js";
import C from './conditions.js';
import Condition from "../../classes/Condition.js";
import Asset from "../../classes/Asset.js";


// Standard wrapper conditions
const stdCond = ["senderNotDead","targetNotDead"];

const lib = {
	stdAttack: {
		icon : 'punch',
		name : "Attack",
		description : "Deals 3 physical damage.",
		ap : 3,
		cooldown : 0,
		show_conditions : [
			"inCombat"
		],
		tags : [
			"ac_damage",
			"ac_painful"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 3
						}
					},
					
				]
			}
		]
	},
	stdArouse: {
		name : "Arouse",
		icon : 'hearts',
		description : "Deals 3 corruption damage.",
		ap : 3,
		cooldown : 0,
		type : "Corruption",
		show_conditions : [
			"inCombat"
		],
		tags : [
			"ac_damage",
			"ac_arousing"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 3
						}
					},
					
				]
			}
		]
	},
	stdEndTurn : {
		name : "End Turn",
		description : "End your turn.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		hidden: true,
		allow_when_charging: true,
		ranged : Action.Range.None,
		target_type : Action.TargetTypes.self,
		show_conditions : [
			"inCombat"
		],
		wrappers : ["endTurn"]
	},
	stdEscape: {
		name : "Escape",
		description : "Flee from combat.",
		ap : 0,
		cooldown : 1,
		detrimental : false,
		"hidden": true,
		"allow_when_charging": true,
		wrappers : [
			{
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [],
				stay_conditions : [],
				effects : [
					{
						type : "flee"
					}
				]
			}
		]
	},
	stdPunishDom: {
		name : "Punish Top",
		icon : 'muscle-fat',
		description : "Top-punish a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden: true,
		detrimental : false,
		allow_when_charging: true,
		show_conditions : [
			"notInCombat",
			"senderHasNotPunished"
		],
		hide_if_no_targets : true,
		wrappers : [
			{
				add_conditions : [
					"targetDead",
					"senderNotDead",
					"targetNotFriendly"
				],
				effects : [
					{
						targets : [
							"CASTER"
						],
						type : "punishmentUsed"
					},
					
				],
				detrimental : false
			}
		]
	},
	stdPunishSub: {
		name : "Punish Bottom",
		icon : 'kneeling',
		description : "Bottom-punish a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden: true,
		detrimental : false,
		allow_when_charging: true,
		show_conditions : [
			"notInCombat",
			"senderHasNotPunished"
		],
		hide_if_no_targets: true,
		wrappers : [
			{
				add_conditions : [
					"targetDead",
					"senderNotDead",
					"targetNotFriendly",
					"senderNotBeast"
				],
				effects : [
					{
						targets : [
							"CASTER"
						],
						type : "punishmentUsed"
					},
					
				],
				detrimental : false
			}
		]
	},
	stdPunishSad: {
		name : "Punish Sadistic",
		icon : 'slavery-whip',
		description : "Use a sadistic punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		"semi_hidden": true,
		detrimental : false,
		"allow_when_charging": true,
		show_conditions : [
			"notInCombat",
			"senderHasNotPunished"
		],
		"hide_if_no_targets": true,
		wrappers : [
			{
				add_conditions : [
					"targetDead",
					"senderNotDead",
					"targetNotFriendly"
				],
				effects : [
					{
						targets : [
							"CASTER"
						],
						type : "punishmentUsed"
					},
					
				],
				detrimental : false
			}
		]
	},

	lowBlow: {
		icon : 'armor-punch',
		name : "Pummel",
		description : "Pummel your target's weak spot. Deals 3 physical damage and interrupts any active charged actions your opponent is readying.",
		ap : 2,
		cooldown : 4,
		tags : [stdTag.acDamage,stdTag.acPainful,stdTag.acInterrupt],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.Targets.auto,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{type : Effect.Types.damage,data : {"amount": 3}},
					{type : Effect.Types.interrupt},
				]
			}
		]
	},

	// Elementalist
	elementalist_iceBlast: {
		name : "Ice Blast",
		icon : 'ice-spell-cast',
		ranged: Action.Range.Ranged,
		description : "Blast your opponent with frost, dealing 6 elemental damage, plus 1 AP damage if your target is soaked.",
		ap : 2,
		mp : 1,
		type : Action.Types.elemental,
		cooldown : 1,
		tags : ["ac_damage"],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 6
						}
					},
					{
						type : "addAP",
						data : {
							"amount": -1
						},
						conditions : [
							"targetSoaked"
						]
					},
					
				]
			}
		]
	},
	elementalist_healingSurge: {
		name : "Healing Surge",
		icon : 'splashy-stream',
		description : "Restores 6 HP to your target and heals 2 HP at the start of their turn for 3 turns. Effect is increased by 30% if there's water nearby.",
		ap : 1,
		mp : 2,
		ranged : Action.Range.Ranged,
		cooldown : 1,
		charges: 2,
		detrimental : false,
		type : Action.Types.elemental,
		tags : ["ac_heal"],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "-6*(1+0.3*((g_rain+se_Tag_m_water)>0))"
						}
					},
					
				]
			},
			{
				target : "VICTIM",
				duration : 3,
				name : "Healing Surge",
				icon : "wave-crest",
				description : "Healing at the start of each turn.",
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "-2*(1+0.3*((g_rain+se_Tag_m_water)>0))"
						}
					}
				]
			}
		]
	},
	elementalist_waterSpout: {
		name : "Water Spout",
		icon : 'splash',
		description : "Summons a water spout that soaks your target for 1 turn and lowers their elemental avoidance by two. Whenever the target uses an action, the caster gains 1 MP.",
		ap : 2,
		mp : 0,
		cooldown : 2,
		ranged : Action.Range.Ranged,
		detrimental : true,
		type : Action.Types.elemental,
		tags : [stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 1,
				name : "Water Spout",
				icon : "droplet-splash",
				description : "Soaked. Elemental avoidance lowered by 2. Performing actions restores 1 MP to the caster.",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				tags : [stdTag.wrSoaked],
				effects : [
					{
						type : Effect.Types.svElemental,
						data : {
							amount : -2
						}
					},
					{
						targets : ["CASTER"],
						type : Effect.Types.addMP,
						events : [GameEvent.Types.actionUsed],
						conditions : ["senderIsWrapperParent","actionNotHidden"],
						data : {
							amount: 1
						}
					}
				]
			},
			{
				detrimental : false,
				add_conditions : stdCond,
				effects : [
					
				]
			}
		]
	},
	
	elementalist_earthShield : {
		name : "Earth Shield",
		icon : 'stone-tablet',
		description : "Grants your target 3 stacks of earth shield for 3 turns. Each stack reduces damage taken by 1. Taking damage removes 1 stack. Also blocks most interrupt effects on your target.",
		ap : 1,
		mp : 2,
		cooldown : 3,
		ranged : Action.Range.Ranged,
		detrimental : false,
		type : Action.Types.elemental,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				max_stacks : 3,
				stacks : 3,
				duration : 3,
				name : "Earth Shield",
				icon : "stone-tablet",
				description : "Damage taken reduced by 1 per stack.",
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				tags : [],
				effects : [
					{
						type : Effect.Types.globalDamageTakenMod,
						data : {amount : -1}
					},
					{
						events : [GameEvent.Types.damageTaken],
						conditions : ["targetIsWrapperParent"],
						type : Effect.Types.addStacks,
						data : {stacks:-1},
					},
					{
						type : Effect.Types.blockInterrupt
					}
				]
			}
		]
	},
	elementalist_discharge : {
		name : "Discharge",
		icon : 'electrical-crescent',
		ranged: Action.Range.Ranged,
		description : "Deals 4 elemental damage to all enemies. Soaked enemies take double damage and are interrupted.",
		ap : 2,
		mp : 2,
		type : Action.Types.elemental,
		cooldown : 1,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		target_type : Action.TargetTypes.aoe,
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetOtherTeam"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": "4*(ta_Tag_"+stdTag.wrSoaked+"+1)"}
					},
					{
						type : Effect.Types.interrupt,
						conditions : ["targetSoaked"]
					},
				]
			}
		]
	},
	elementalist_riptide : {
		name : "Riptide",
		icon : 'big-wave',
		ranged: Action.Range.Ranged,
		description : "Summons a riptide after 2 turns, healing all friendly players for 3 HP and 1 MP instantly and every turn for 3 turns. Also soaks all enemies for 3 turns, decreasing their elemental avoidance by 2.",
		ap : 4,
		mp : 2,
		cast_time : 2,
		type : Action.Types.elemental,
		cooldown : 7,
		tags : [],
		show_conditions : ["inCombat"],
		target_type : Action.TargetTypes.aoe,
		detrimental : false,
		reset_interrupt : true,
		wrappers : [
			{
				name : 'Riptide',
				icon : 'big-wave',
				description : 'Soaked. -2 elemental avoidance.',
				detrimental : true,
				duration : 3,
				add_conditions : stdCond.concat("targetOtherTeam"),
				tags : [stdTag.wrSoaked],
				effects : [
					{
						type : Effect.Types.svElemental,
						data : {"amount": -2}
					}
				]
			},
			{
				name : 'Riptide',
				icon : 'big-wave',
				description : 'Restores 3 HP and 1 MP at the start of your turn.',
				detrimental : false,
				duration : 3,
				add_conditions : stdCond.concat("targetSameTeam"),
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded, GameEvent.Types.internalWrapperTick],
						type : Effect.Types.addMP,
						data : {"amount": 1}
					},
					{
						events : [GameEvent.Types.internalWrapperAdded, GameEvent.Types.internalWrapperTick],
						type : Effect.Types.damage,
						data : {"amount": -3}
					},
				]
			}
		]
	},


	// Rogue
	rogue_exploit: {
		name : "Exploit",
		icon : 'hooded-assassin',
		description : "Deals 3 corruption damage plus another 2 per slot of upper and/or lower body armor missing from your target. Has a 4% chance per corruption advantage to unequip a random piece of clothing from your target.",
		ap : 2,
		mp : 0,
		type : Action.Types.corruption,
		cooldown : 1,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": "7-ta_lowerBody*2-ta_upperBody*2"}
					},
					{
						type : Effect.Types.disrobe,
						data : {"numSlots": 1},
						conditions : [{
							type : Condition.Types.rng,
							data : {"chance": "4*(se_BonCorruption-ta_SvCorruption)"}
						}]
					},
				]
			}
		]
	},
	rogue_corruptingVial : {
		name : "Corrupting Vial",
		icon : 'poison-bottle',
		description : "Inflicts your target with a corrupting poison, dealing 2 corruption damage at the start of their turn for 3 turns, and reduces corruption resist by 2. If used on yourself it instead restores 2 HP each turn.",
		ap : 2,
		mp : 2,
		type : Action.Types.corruption,
		cooldown : 1,
		charges: 2,
		tags : ["ac_damage","ac_debuff"],
		show_conditions : ["inCombat"],
		detrimental : Action.Detrimental.team,
		wrappers : [
			{
				duration : 3,
				name : "Corrupting Vial",
				icon : "poison-bottle",
				description : "Taking corruption damage each turn. Corruption resist reduced by 2.",
				detrimental : true,
				add_conditions : stdCond.concat("targetNotSender"),
				stay_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": 2}
					},
					{
						type : Effect.Types.svCorruption,
						data : {"amount": -2}
					}
				]
			},
			{
				duration : 3,
				name : "Corrupting Vial",
				icon : "poison-bottle",
				description : "Healing each turn.",
				detrimental : false,
				add_conditions : stdCond.concat("targetIsSender"),
				stay_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": -2}
					}
				]
			}
		]
	},
	
	rogue_sneakAttack : {
		name : "Sneak Attack",
		icon : 'cloak-dagger',
		description : "Deals 4 corruption damage. Only usable on enemies that didn't target you on their last turn, and only once per target and turn.",
		ap : 2,
		cooldown : 0,
		tags : ["ac_damage"],
		show_conditions : ["inCombat"],
		type : Action.Types.corruption,
		wrappers : [
			{
				duration : 0,
				name : "Corrupting Vial",
				icon : "poison-bottle",
				description : "Taking corruption damage each turn. Corruption resist reduced by 2.",
				detrimental : true,
				add_conditions : stdCond.concat("targetNotSender", "notTargetedBySenderLastRound", "notSneakAttackedBySender"),
				stay_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": 4}
					}
				]
			},
			{
				label : 'sneak_attack_cd',
				duration : 1,
				detrimental : false,
				add_conditions : stdCond.concat("targetNotSender", "notTargetedBySenderLastRound", "notSneakAttackedBySender"),
				stay_conditions : stdCond,
				tags : ['sneak_attack'],
			}
		]
	},

	rogue_comboBreaker :{
		name : "Combo Breaker",
		icon : 'halt',
		description : "Interrupts and deals 10 corruption damage to an enemy who is actively charging an action.",
		ap : 1,
		cooldown : 4,
		tags : ["ac_damage", "acInterrupt"],
		show_conditions : ["inCombat"],
		type : Action.Types.corruption,
		wrappers : [
			{
				add_conditions : stdCond.concat("targetChargingAction"),
				duration : 0,
				effects : [
					{type:Effect.Types.interrupt},
					{
						type:Effect.Types.damage,
						data:{amount:10}
					}
				]
			}
		]
	},

	// Todo: Need visual for summoning it
	rogue_tripwire :{
		name : "Tripwire",
		icon : 'tripwire',
		description : "Sets up a tripwire for 2 turns. The next opponent to use a melee attack is knocked down and loses 3 avoidance of all types for 1 turn.",
		ap : 1,
		mp : 0,
		cooldown : 2,
		tags : ["ac_debuff"],
		show_conditions : ["inCombat"],
		type : Action.Types.corruption,
		target_type : Action.TargetTypes.aoe,
		wrappers : [
			{
				// Hidden debuff
				label : 'tripwire',
				detrimental : false,
				add_conditions : stdCond.concat("targetOtherTeam"),
				duration : 2,
				effects : [
					{
						events : [GameEvent.Types.actionUsed],
						conditions : ["actionMelee", "actionDetrimental", "senderIsWrapperParent"],
						type : Effect.Types.runWrappers,
						data : {wrappers:[
							{
								label : 'Tripped',
								name : 'Tripped',
								icon : 'tripwire',
								duration:2,
								description : 'Knocked down, -3 to all avoidances',
								detrimental : true,
								effects:[
									{type:Effect.Types.svCorruption, data:{amount:-3}},
									{type:Effect.Types.svHoly, data:{amount:-3}},
									{type:Effect.Types.svElemental, data:{amount:-3}},
									{type:Effect.Types.svPhysical, data:{amount:-3}},
									{type:Effect.Types.knockdown}
								]
							},
							{
								target : Wrapper.TARGET_AOE,
								effects : [
									{type:Effect.Types.removeWrapperByLabel, data:{label:'tripwire', casterOnly:true}}
								]
							}
						]}
					},
				]
			}
		]
	},

	// Todo: Visual
	rogue_steal : {
		name : "Steal",
		icon : 'snatch',
		description : "Steals a random item from your target.",
		ap : 2,
		mp : 0,
		hit_chance : 60,
		type : Action.Types.physical,
		cooldown : 4,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat('targetHasStealableAsset'),
				effects : [
					{type : Effect.Types.steal, data : {}},
				]
			}
		]
		// Todo: Conditions
	},



	// Cleric
	cleric_smite: {
		name : "Smite",
		icon : 'fission',
		description : "Smites your opponent for 4 holy damage, increased by 10% per corruption damage your target dealt last turn, up to 8 damage.",
		ap : 1,
		mp : 1,
		type : Action.Types.holy,
		cooldown : 1,
		ranged : Action.Range.Ranged,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "4*(1+min(ta_damageDoneSinceLastCorruption*0.1,2))"
						}
					},
					
				]
			}
		]
	},
	cleric_chastise: {
		name : "Chastise",
		icon : 'crossed-chains',
		description : "Chastises up to 2 targets, dealing 3 holy damage every time they use a damaging action until the end of their next turn and reducing all their damage done by 1.",
		ap : 1,
		mp : 1,
		max_targets : 2,
		ranged : Action.Range.Ranged,
		type : Action.Types.holy,
		cooldown : 2,
		tags : [stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 1,
				name : "Chastise",
				icon : "holy-hand-grenade",
				description : "Using damaging actions deals 3 holy damage back to the caster. Damage done reduced by 1.",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						events : [
							"actionUsed"
						],
						conditions : [
							"senderIsWrapperParent",
							"actionNotHidden",
							"actionDamaging"
						],
						data : {
							"amount": 3
						},
						label : "cleric_chastise_proc"
					},
					{
						type : "globalDamageDoneMod",
						data : {
							"amount": -1
						}
					}
				]
			},
		]
	},
	cleric_heal: {
		name : "Heal",
		icon : 'healing',
		ranged : Action.Range.Ranged,
		description : "Restores 6 HP, plus an additional 4 if your target's max health is less than 50%",
		ap : 2,
		mp : 1,
		type : Action.Types.holy,
		cooldown : 1,
		charges: 3,
		detrimental : false,
		tags : [ stdTag.acHeal],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : ".",
				detrimental : false,
				add_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "-6-(ta_HP<(ta_MaxHP/2))*4"
						}
					},
					
				]
			}
		]
	},
	cleric_reserection : {
		name : "Reserection",
		icon : 'fomorian',
		ranged : Action.Range.Ranged,
		description : "Restores a defeated player to 50% of their max HP.",
		ap : 5,
		mp : 5,
		cast_time : 3,
		type : Action.Types.holy,
		cooldown : 8,
		charges: 1,
		detrimental : false,
		tags : [ stdTag.acHeal],
		show_conditions : ["inCombat"],
		reset_interrupt : true,
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : ".",
				detrimental : false,
				add_conditions : ["targetDead"],
				effects : [
					{
						type : Effect.Types.setHP,
						data : {"amount": "ta_MaxHP/2"}
					},
				]
			}
		]
	},
	cleric_penance : {
		name : "Penance",
		icon : 'pentagram-rose',
		ranged : Action.Range.None,
		description : "Makes your healing spells deal damage for the remainder of this turn.",
		ap : 0,
		mp : 0,
		type : Action.Types.holy,
		cooldown : 4,
		detrimental : false,
		tags : [],
		target_type : Action.TargetTypes.self,
		show_conditions : ["inCombat"],
		wrappers : [
			{
				name : 'Penance',
				description : 'Your healing effects do damage this turn.',
				icon : 'pentagram-rose',
				duration : 1,
				tick_on_turn_start : false,
				tick_on_turn_end : true,
				detrimental : false,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.healInversion
					},
				]
			}
		]
	},
	cleric_radiant_heal : {
		name : "Radiant Heal",
		icon : 'holy-symbol',
		ranged : Action.Range.Ranged,
		reset_interrupt : true,
		description : "Restores 10 HP to all friendly players.",
		ap : 3,
		mp : 3,
		type : Action.Types.holy,
		cooldown : 2,
		cast_time : 1,
		charges: 1,
		detrimental : false,
		tags : [ stdTag.acHeal ],
		show_conditions : ["inCombat"],
		target_type : Action.TargetTypes.aoe,
		wrappers : [
			{
				detrimental : false,
				add_conditions : stdCond.concat("targetSameTeam"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": -10}
					}
				]
			}
		]
	},
	/* Todo
	cleric_gag :{
		name : "Gag",
		icon : 'mute',
		description : "Gags your target for 2 turns, preventing them from using most ranged attacks.",
		ap : 1,
		mp : 1,
		cooldown : 4,
		hit_chance : 9001,
		tags : ["ac_debuff"],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				add_conditions : stdCond,
				duration : 2,
				effects : [
					{type:Effect.Types.daze},
				]
			}
		]
		// todo: conditions & effects
	},
	*/

	// Tentaclemancer
	tentaclemancer_tentacleWhip: {
		name : "Tentacle Whip",
		icon : 'suckered-tentacle',
		description : "Deals 3 physical damage. 6 if your target is affected by corrupting ooze.",
		ap : 1,
		mp : 1,
		ranged : Action.Range.Ranged,
		type : Action.Types.physical,
		cooldown : 1,
		tags : [ stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "3+ta_Tag_wr_corrupting_ooze*2"
						}
					},
					
				]
			}
		]
	},
	tentaclemancer_corruptingOoze: {
		name : "Corrupting Ooze",
		icon : 'gooey-molecule',
		description : "Adds a stack of corrupting ooze on your target, adding 1 arousal. Corrupting ooze also lowers their corruption avoidance by 1 per stack, and at the start of the affected players turn an additional stack is added. If it goes over 5 stacks, the target gets stunned for 1 turn.",
		ap : 1,
		mp : 1,
		charges : 3,
		type : Action.Types.corruption,
		cooldown : 0,
		ranged : Action.Range.Ranged,
		tags : [ stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			"corruptingOoze",
		]
	},
	tentaclemancer_siphonCorruption: {
		name : "Siphon Corruption",
		icon : 'goo-skull',
		description : "Consumes all charges of corrupting ooze on your target, dealing damage equal to 2x the amount of stacks consumed, and healing you for half the amount.",
		ap : 1,
		mp : 1,
		type : Action.Types.corruption,
		hit_chance: 90,
		cooldown : 3,
		ranged : Action.Range.Ranged,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				add_conditions : stdCond.concat(
					{
						type : "hasWrapper",
						data : {
							label : "corruptingOoze",
							"byCaster": true
						}
					}
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": "ta_Wrapper_corruptingOoze*2"
						}
					},
					{
						targets : [
							"CASTER"
						],
						type : "damage",
						data : {
							"amount": "-se_Wrapper_corruptingOoze"
						}
					},
					{
						type : "removeWrapperByLabel",
						data : {
							label : "corruptingOoze",
							"casterOnly": true
						}
					},
					
				]
			}
		]
	},


	
	// Warrior
	warrior_revenge: {
		name : "Revenge",
		icon : 'shield-bash',
		description : "Deals 2 damage to an opponent plus 2 for every damaging effect you were a victim of since your last turn.",
		ap : 2,
		cooldown : 1,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "2+se_damagingReceivedSinceLast*2",
							"threatMod": 4
						}
					},
					
				]
			}
		]
	},
	warrior_bolster: {
		name : "Bolster",
		icon : 'surrounded-shield',
		description : "Reduces your damage taken by 2 for one turn and clears 10% of your arousal. Taking damage while this effect is active grants the caster 1 AP.",
		ap : 1,
		mp : 1,
		cooldown : 2,
		tags : [stdTag.acBuff],
		detrimental : false,
		target_type: Action.TargetTypes.self,
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 1,
				name : "Bolster",
				icon : "bolster",
				description : "-2 damage taken from all attacks. Taking damage grants you AP.",
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "globalDamageTakenMod",
						data : {
							"amount": -2
						}
					},
					{
						events : ["internalWrapperAdded"],
						type : "addArousal",
						data : {"amount": -1}
					},
					{
						type : "addAP",
						events : [
							"actionUsed"
						],
						conditions : [
							"targetIsWrapperParent",
							"actionHit",
							"actionDamaging"
						],
						data : {
							"amount": 1
						}
					},
				]
			}
		]
	},
	warrior_viceGrip: {
		name : "Vice Grip",
		icon : 'grab',
		description : "Grabs up to two targets and squeezes, dealing 4 damage and preventing them from attacking any other targets for 1 turn, and ends your turn.",
		ap : 3,
		mp : 0,
		cooldown : 2,
		max_targets : 2,
		tags : [ stdTag.acTaunt, stdTag.acDamage ],
		detrimental : true,
		target_type: "target",
		show_conditions : [
			"inCombat"
		],
		wrappers : [
			{
				duration : 1,
				name : "Squeeze",
				icon : "grab",
				description : "Taunted by %caster.",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						events : [
							"internalWrapperAdded"
						],
						type : "damage",
						data : {
							"amount": 4,
							"threatMod": 4
						}
					},
					{
						type : "taunt"
					},
					
				]
			},
			{
				detrimental : false,
				add_conditions : stdCond,
				target : "CASTER",
				effects : [
					{
						events : [
							"internalWrapperAdded"
						],
						type : "endTurn"
					}
				]
			}
		]
	},
	warrior_masochism: {
		name : "Masochism",
		icon : 'enrage',
		description : "Work your masochism up, restoring 10% of your max HP and adding 1 arousal. Counts as a damaging effect.",
		ap : 1,
		mp : 1,
		cooldown : 2,
		charges : 3,
		max_targets : 1,
		tags : [ stdTag.acDamage, stdTag.acHeal ],
		detrimental : false,
		target_type: Action.TargetTypes.self,
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : false,
				add_conditions : stdCond,
				effects : [
					{type:Effect.Types.damage, data:{amount:"-ta_MaxHP*0.1"}},
					{type:Effect.Types.addArousal, data:{amount:1}},
				]
			}
		]
	},
	warrior_injuryToInsult : {
		name : "Injury to Insult",
		icon : 'claw-hammer',
		description : "Deals 7 physical damage to all enemies taunted by you.",
		ap : 3,
		mp : 0,
		cooldown : 4,
		max_targets : 1,
		tags : [ stdTag.acDamage ],
		detrimental : true,
		target_type: Action.TargetTypes.aoe,
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetTauntedBySender"),
				effects : [
					{type:Effect.Types.damage, data:{amount:7}}
				]
			}
		]
	},
	warrior_infuriate : {
		name : "Infuriate",
		icon : 'gluttony',
		description : "For the remainder of your turn, Physical Attack costs 1 AP and restores 2 HP. It also enrages your victim, taunting them and increasing their damage done by 25% for one turn. This effect stacks.",
		ap : 0,
		mp : 0,
		cooldown : 6,
		max_targets : 1,
		tags : [],
		detrimental : false,
		target_type: Action.TargetTypes.self,
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 1,
				icon : 'gluttony',
				name : 'Infuriate',
				description : 'Physical attack costs 1 AP and restores 2 HP. Also enrages and taunts the target.',
				detrimental : false,
				add_conditions : stdCond,
				tick_on_turn_end : true,
				effects : [
					{type:Effect.Types.setActionApCost, data:{
						amount:1,
						conditions : ["action_stdAttack"]
					}},
					{
						events : [GameEvent.Types.actionUsed],
						conditions : ["actionHit", "action_stdAttack", "senderIsWrapperParent"],
						type : Effect.Types.runWrappers,
						targets : [Wrapper.TARGET_EVENT_TARGETS],
						data : {wrappers:[
							{
								max_stacks : 10,
								duration : 1,
								icon : 'gluttony',
								name : 'Enraged',
								description : 'Taunted. +25% damage and healing done per stack.',
								detrimental : true,
								add_conditions : stdCond,
								effects: [
									{
										type : Effect.Types.taunt
									},
									{
										type : Effect.Types.globalDamageDoneMod,
										data:{amount:1.25, multiplier:true}
									}
								]
							}
						]}
					},
					{
						events : [GameEvent.Types.actionUsed],
						conditions : ["actionHit", "action_stdAttack", "senderIsWrapperParent"],
						type : Effect.Types.damage,
						data : {amount:-2}
					}
				]
			}
		]
	},
	


	// Monk
	monk_roundKick: {
		"level": 1,
		name : "Round Kick",
		icon : 'high-kick',
		description : "A chi infused kick, dealing 7 physical damage to an enemy. Misses with this ability may allow your target to riposte, doing the same amount of damage back to you.",
		ap : 2,
		mp : 1,
		hit_chance: 70,
		cooldown : 1,
		detrimental : true,
		tags : [ stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 7
						}
					},
					
				]
			}
		],
		riposte: [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 7
						}
					},
					
				]
			}
		]
	},
	monk_disablingStrike: {
		name : "Disabling Strike",
		icon : 'despair',
		description : "Deals 2 damage and reduces your target's physical proficiency and avoidance by 5 for 1 turn. Always hits.",
		ap : 1,
		mp : 1,
		cooldown : 3,
		detrimental : true,
		hit_chance: 9001,
		tags : [stdTag.acDamage, stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 2
						}
					},
					
				]
			},
			{
				target : "VICTIM",
				duration : 1,
				detrimental : true,
				name : "Disabling Strike",
				description : "-5 Physical Proficiency and avoidance",
				icon : "weaken",
				add_conditions : stdCond,
				stay_conditions : stdCond,
				tags : [
					"ac_debuff"
				],
				effects : [
					{
						type : "bonPhysical",
						data : {
							"amount": -5
						}
					},
					{
						type : "svPhysical",
						data : {
							"amount": -5
						}
					}
				]
			}
		]
	},
	monk_upliftingStrike: {
		name : "Uplifting Strike",
		icon : 'smoking-finger',
		description : "Deals 2 damage to an enemy and heals the lowest HP party member for 2 HP per AP spent this turn.",
		ap : 1,
		mp : 2,
		cooldown : 2,
		hit_chance: 100,
		tags : [stdTag.acDamage, stdTag.acNpcImportantLast],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 2
						}
					},
				]
			},
			{
				target : "SMART_HEAL",
				duration : 0,
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "-se_apSpentThisTurn*2"
						}
					},
					{
						type : Effect.Types.hitfx,
						data : {
							id : 'monkHealSmallTargeted',
							origin : Wrapper.Targets.original_target
						}
					}
				]
			}
		]
	},
	monk_meditate : {
		name : "Meditate",
		icon : 'meditation',
		description : "Enter a meditative state, restoring 1MP immediately and at the start of your turn for 5 turns. This effect falls off if you take damage.",
		ap : 2,
		cooldown : 4,
		hit_chance: 100,
		detrimental : false,
		target_type : Action.TargetTypes.self,
		tags : [stdTag.acManaHeal],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'monk_meditation',
				name : 'Meditation',
				icon : 'meditation',
				description : 'Restoring 1 MP at the start of your turn. Breaks on damage.',
				duration : 5,
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				trigger_immediate : true,
				effects : [
					{
						type : Effect.Types.addMP,
						data : {"amount": 1}
					},
					{
						events : [GameEvent.Types.damageTaken],
						conditions : ["targetIsWrapperParent"],
						type : Effect.Types.removeParentWrapper
					}
				]
			}
		]
	},
	monk_lowKick : {
		name : "Low Kick",
		icon : 'van-damme-split',
		description : "Knocks all enemies down for 1 turn, dealing 8 damage and interrupting them.",
		ap : 2,
		cooldown : 6,
		hit_chance: 80,
		detrimental : true,
		target_type : Action.TargetTypes.aoe,
		tags : [stdTag.acDamage, stdTag.acInterrupt, stdTag.acPainful],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				add_conditions : stdCond.concat('targetOtherTeam'),
				effects : [
					{
						type : Effect.Types.damage,
						data : {amount: 8}
					},
					{type : Effect.Types.interrupt}
				]
			},
			{
				label : "knockdown",
				duration : 1,
				name : "Knockdown",
				icon : "falling",
				detrimental : true,
				description : "Knocked down on your %knockdown",
				add_conditions : stdCond.concat("targetNotGrappledOrKnockedDown", "targetOtherTeam"),
				stay_conditions : stdCond,
				effects : [
					{
						events : ["internalWrapperAdded"],
						type : Effect.Types.knockdown
					}
				]
			}
		]
	},
	monk_circleOfHarmony : {
		name : "Circle of Harmony",
		icon : 'divided-spiral',
		description : "Increases all avoidances by 8 for 3 turns. This effect is removed when you use a detrimental action.",
		ap : 0,
		mp : 1,
		cooldown : 5,
		detrimental : false,
		target_type : Action.TargetTypes.self,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 3,
				name : "Circle of Harmony",
				icon : "divided-spiral",
				detrimental : false,
				description : "+8 To all avoidances. Removed when you use a detrimental action.",
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						events : [GameEvent.Types.actionUsed],
						conditions : ["senderIsWrapperParent","actionDetrimental"],
						type : Effect.Types.removeParentWrapper
					},
					{type : Effect.Types.svCorruption,data : {amount:8}},
					{type : Effect.Types.svElemental,data : {amount:8}},
					{type : Effect.Types.svHoly,data : {amount:8}},
					{type : Effect.Types.svPhysical,data : {amount:8}},
				]
			}
		]
	},



	// Item specific
	whip_legLash: {
		name : "Leg Lash",
		icon : 'whiplash',
		description : "Whips your target's legs, dealing 4 damage. Has a 20% chance of knocking your target down for 1 round.",
		ap : 2,
		cooldown : 5,
		max_targets : 1,
		detrimental : true,
		type : Action.Types.physical,
		tags : [ stdTag.acDamage, stdTag.acPainful ],
		add_conditions : ["senderHasWhip"],
		conditions : ["senderHasWhip"],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				add_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 4
						}
					},
					
				]
			},
			{
				label : "knockdown",
				target : "VICTIM",
				duration : 1,
				name : "Knockdown",
				icon : "falling",
				description : "Knocked down on your %knockdown",
				add_conditions : stdCond.concat(
					"targetNotGrappledOrKnockedDown",
					"targetNotBeast",
					"rand20"
				),
				stay_conditions : stdCond,
				effects : [
					{
						type : "knockdown"
					}
				]
			}
		]
	},
	whip_powerLash: {
		name : "Powerlash",
		icon : 'slavery-whip',
		description : "Whips your target's genitals unless they're wearing hardened armor, dealing 8 physical damage and interrupting any charged actions.",
		ap : 2,
		cooldown : 6,
		max_targets : 1,
		detrimental : true,
		type : Action.Types.physical,
		tags : [ stdTag.acDamage, stdTag.acInterrupt, stdTag.acPainful],
		conditions : ["senderHasWhip"],
		add_conditions : ["senderHasWhip"],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				add_conditions : stdCond.concat(
					"targetNotBeast",
					{
						conditions : [
							"targetLowerBodyNotHard",
							{
								conditions : [
									"targetUpperBodyNotHard",
									"targetBreasts"
								],
								min : -1
							}
						]
					}
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": 8
						}
					},
					"interrupt",
					
				]
			}
		]
	},



	// NPC

	// Imp
	imp_specialDelivery: {
		name : "Special Delivery",
		icon : 'blood',
		description : "Jump on and try to cream on or in your target, doing 4 corruption damage and reduces the target's corruption avoidance by 1 for 2 turns.",
		ap : 2,
		mp : 2,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [ stdTag.acDamage, stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 2,
				name : "Imp Cum",
				icon : "blood",
				description : "Corruption avoidance reduced by 1 per stack",
				add_conditions : stdCond.concat("targetNotBeast"),
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					},
					{
						type : "svCorruption",
						data : {
							"amount": -1
						}
					},
					
				]
			}
		]
	},
	imp_blowFromBelow: {
		name : "Blow From Below",
		icon : 'fist',
		description : "Attacks up to 2 larger targets from below, doing 5 physical damage.",
		ap : 3,
		cooldown : 3,
		max_targets : 2,
		detrimental : true,
		tags : [ stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				add_conditions : stdCond.concat(
					"targetNotBeast",
					"targetTaller"
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": 5
						}
					},
					
				]
			}
		]
	},
	imp_ankleBite: {
		name : "Ankle Bite",
		icon : 'mouth-watering',
		description : "Bite your target's ankles, dealing 4 physical damage. Has a 20% chance to knock your target down for 1 turn.",
		ap : 2,
		mp : 0,
		cooldown : 1,
		detrimental : true,
		tags : [ stdTag.acDamage, stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				add_conditions : stdCond.concat(
					"targetNotBeast"
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": 4
						}
					},
					
				]
			},
			{
				label : "knockdown",
				target : "VICTIM",
				duration : 1,
				name : "Knockdown",
				icon : "falling",
				detrimental : true,
				description : "Knocked down on your %knockdown",
				add_conditions : stdCond.concat(
					"targetNotGrappledOrKnockedDown",
					"targetNotBeast",
					"rand20"
				),
				stay_conditions : stdCond,
				effects : [
					{
						events : ["internalWrapperAdded"],
						type : "knockdown"
					}
				]
			}
		]
	},
	imp_demonicPinch: {
		name : "Demonic Pinch",
		icon : 'hand-ok',
		description : "Pinch your target using magic, dealing 2-6 physical damage.",
		ap : 2,
		mp : 3,
		cooldown : 2,
		detrimental : true,
		tags : [ stdTag.acDamage, stdTag.acPainful],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				add_conditions : stdCond.concat(
					"targetNotBeast"
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": "1+ceil(random(5))"
						}
					},
					
				]
			}
		]
	},
	imp_claws: {
		name : "Imp Claws",
		icon : 'barbed-nails',
		description : "Assault your target's clothes for 2 cloth damage, has a 10% chance of unequipping a random clothing item on your target.",
		ap : 3,
		mp : 0,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond.concat(
					"targetNotBeast",
					"targetNotNaked"
				),
				effects : [
					{
						type : "damageArmor",
						data : {
							"amount": 2,
							max_types : 1
						}
					},
					{
						type : "disrobe",
						data : {
							numSlots : 1
						},
						conditions : ["rand10"]
					},
					
				]
			}
		]
	},
	

	// imp_groperopeHogtie - Hogties a player, adding X stacks and preventing all spells except struggle. At the end of the players turn it does corruption damage. Affected players gain a struggle ability that lets you remove 1 stack at the cost of 2 AP.
	imp_groperopeHogtie : {
		name : "Groperope Hogtie",
		icon : 'lasso',
		description : "Hogties a humanoid target, adding 3 stacks of hogtie and blocking all other actions than struggle free. At the end of their turn, they take 5 corruption damage.",
		ap : 3,
		mp : 0,
		cooldown : 100,
		detrimental : true,
		tags : [stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'groperope_hogtie',
				name : 'Groperope',
				icon : 'lasso',
				description : 'Hogtied and stimulated by a sentient rope. Taking corruption damage at the end of your turn. Physical avoidance reduced by 5',
				target : Wrapper.TARGET_AUTO,
				duration : -1,
				detrimental : true,
				stacks : 3,
				max_stacks : 3,
				tags : [stdTag.wrBound, stdTag.wrHogtied],
				add_conditions : stdCond.concat("targetNotBeast", "targetNotTiedUp"),
				stay_conditions : ["senderNotDead"],
				tick_on_turn_start : false,			// Tick on turn start
				tick_on_turn_end : true,
				effects : [
					{
						type : Effect.Types.disable,
						data : {level:1, hide:true}
					},
					{
						type : Effect.Types.damage,
						data : {
							amount : 5,
							type : Action.Types.corruption,	
						},
						no_stack_multi : true
					},
					{
						type : Effect.Types.svPhysical,
						data: {amount:-5},
						no_stack_multi : true
					},
					'bondageStruggleEnable'	
				]
			}
		]
	},
	imp_newGroperope_party : {
		name : "New Groperope",
		icon : 'paper',
		description : "Fetches a new Groperope unless interrupted.",
		ap : 3,
		mp : 5,
		cast_time : 1,
		cooldown : 4,
		detrimental : false,
		show_conditions : ["inCombat", "isCoop"],
		target_type : Action.TargetTypes.self,
		tags : [],
		wrappers : [
			{
				label : 'newGroperope',
				target : Wrapper.TARGET_AUTO,
				detrimental : false,
				add_conditions : stdCond.concat(
					{type:Condition.Types.actionOnCooldown, data:{label:'imp_groperopeHogtie'}, caster:true}
				),
				effects : [
					{
						type : Effect.Types.addActionCharges,
						data : {actions:'imp_groperopeHogtie', amount:1}
					},	
				]
			}
		]
	},
	imp_newGroperope_solo : {
		name : "New Groperope",
		icon : 'paper',
		description : "Fetches a new Groperope unless interrupted.",
		ap : 3,
		mp : 5,
		cast_time : 1,
		cooldown : 7,
		detrimental : false,
		show_conditions : ["inCombat", "isSolo"],
		target_type : Action.TargetTypes.self,
		tags : [],
		wrappers : [
			{
				label : 'newGroperope',
				target : Wrapper.TARGET_AUTO,
				detrimental : false,
				add_conditions : stdCond.concat(
					{type:Condition.Types.actionOnCooldown, data:{label:'imp_groperopeHogtie'}, caster:true}
				),
				effects : [
					{
						type : Effect.Types.addActionCharges,
						data : {actions:'imp_groperopeHogtie', amount:1}
					},	
				]
			}
		]
	},




	// Tentacle fiend
	tentacle_fiend_tentacleMilker: {
		name : "Tentacle Milker",
		icon : 'leeching-worm',
		description : "Latches a sucker to breasts or a penis, dealing 4 corruption damage and healing for the same amount.",
		ap : 2,
		mp : 3,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [ stdTag.acDamage, stdTag.acSelfHeal],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : "",
				add_conditions : stdCond.concat(
					"targetNotBeast",
					{
						conditions:[
							"targetBreasts",
							"targetPenis"
						],
					}
				),
				effects : [
					{
						type : "damage",
						data : {
							"amount": 4,
							"leech": 1
						}
					},
					
				]
			}
		]
	},
	tentacle_fiend_legWrap : {
		name : "Leg Wrap",
		icon : 'daemon-pull',
		description : "Wraps tentacles around your target's legs, knocking them down for 1 turn.",
		ap : 1,
		cooldown : 6,
		detrimental : true,
		tags : [ stdTag.acDebuff, stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : "legWrap",
				target : "VICTIM",
				duration : 1,
				name : "Leg Wrap",
				icon : "daemon-pull",
				description : "Knocked down on your %knockdown, tentacles spreading your legs",
				"trigger_immediate": true,
				tags : [
					"wr_legs_spread"
				],
				add_conditions : stdCond.concat(
					"targetNotGrappledOrKnockedDown",
					"targetNotBeast",
					{
						type : "apValue",
						data : {
							"amount": 2
						},
						"caster": true
					}
				),
				stay_conditions : stdCond,
				effects : [
					{
						type : "knockdown"
					},
					
				]
			}
		]
	},
	tentacle_fiend_injectacle: {
		name: "Injectacle",
		icon : 'death-juice',
		description: "Injects a player's exposed butt or vagina with tentacle goo, doing 4 corruption damage immediately and leaving tentacle goo behind. Tentacle goo deals 1 at the start of their turn in and lowers their corruption resist by 1 for 3 turns.",
		ap: 1,
		mp: 3,
		cooldown: 3,
		detrimental: true,
		type: Action.Types.corruption,
		tags: [ stdTag.acDebuff, stdTag.acDamage,],
		show_conditions: ["inCombat"],
		wrappers: [
			{
				label: "tentacleGoo",
				target: Wrapper.TARGET_AUTO,
				duration: 3,
				name: "Tentacle Goo",
				icon: "death-juice",
				description: "Injectected with tentacle goo, taking corruption damage at the start of your turn",
				detrimental: true,
				add_conditions: stdCond.concat(
					"targetNotBeast",
					{
						conditions : [
							"targetNoLowerBody",
							{conditions:["ttGroinExposed", "targetVagina"], min:-1},
							"ttButtExposed",
						]
					}
				),
				effects : [
					{
						events: [GameEvent.Types.internalWrapperAdded],
						type: "damage",
						data: {"amount": 4}
					},
					{
						type: "damage",
						data: {"amount": 1}
					},
					{
						type: Effect.Types.svCorruption,
						data: {"amount": -1}
					},
					
				]
			}
		]
	},
	tentacle_fiend_tentatug: {
		name : "Tentatug",
		icon : 'plate-claw',
		description : "Tugs as your target's armor, doing 2 cloth damage. Has a 30% chance to pull a random outfit piece off.",
		ap : 3,
		cooldown : 2,
		detrimental : true,
		tags : [],
		show_conditions : [
			"inCombat"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				detrimental : true,
				add_conditions : stdCond.concat(
					"targetNotBeast",
					"targetNotNaked"
				),
				effects : [
					{
						type : Effect.Types.damageArmor,
						data : {
							"amount": 2,
							"max_types": 1
						}
					},
					{
						type : "disrobe",
						data : {"num_slots": 1},
						conditions : ["rand30"]
					},
					
				]
			}
		]
	},

	tentacle_latch : {
		name : "Latch",
		icon : 'suckered-tentacle',
		description : "Latches onto your target for 2 turns. While latched, you gain +2 physical proficiency and can only attack the target you are latched to.",
		ap : 2,
		cooldown : 4,
		detrimental : true,
		tags : [stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				name : 'Latch',
				icon : 'suckered-tentacle',
				description : '%S has latched onto you and is gaining +2 physical proficiency.',
				target : Wrapper.TARGET_AUTO,
				duration : -1,
				detrimental : true,
				tags : [stdTag.fxLatched],
				add_conditions : stdCond.concat(
					"targetNotBeast", {type:Condition.Types.hasEffect, data:{label:'latch_self'}, inverse:true, caster:true}
				),
				stay_conditions : ["senderNotDead"],
				effects : [
					'selfTaunt',
					{
						type : Effect.Types.bonPhysical,
						targets : [Wrapper.TARGET_CASTER],
						data : {
							amount : 2
						},
					},
					'latch',
					'latch_self'
				]
			}
		]
	},
	cocktopus_ink : {
		name : "Ink",
		icon : 'gooey-eyed-sun',
		description : "Squirt oily ink at your target, dealing 4 elemental damage and reducing all their proficiencies by 1 for 1 turn.",
		ap : 2,
		mp : 2,
		cooldown : 2,
		detrimental : true,
		ranged : Action.Range.Ranged,
		type : Action.Types.elemental,
		tags : [ stdTag.acDamage, stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 1,
				name : "Ink",
				icon : "gooey-eyed-sun",
				description : "All proficiencies reduced by 1",
				add_conditions : stdCond,
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					},
					{type : Effect.Types.bonCorruption,data : {amount : -1}},
					{type : Effect.Types.bonElemental,data : {amount : -1}},
					{type : Effect.Types.bonHoly,data : {amount : -1}},
					{type : Effect.Types.bonPhysical,data : {amount : -1}},
				]
			}
		]
	},
	cocktopus_inkject : {
		name : "Headtacle",
		icon : 'giant-squid',
		description : "Starts thrusting your big head tentacle into a latched target, doing 5 corruption damage every turn for 3 turns or until you are pulled off. After 3 turns, you ink inside your target, adding 10 arousal to them and doing 10 mana damage.",
		ap : 4,
		cooldown : 5,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [ stdTag.acDamage, stdTag.acDebuff, stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 3,
				name : "Headtacle",
				icon : "giant-squid",
				description : "%S is humping you with its big headtacle.",
				add_conditions : stdCond.concat('targetHasUnblockedNotHardOrifice','senderLatchingToTarget'),
				stay_conditions : stdCond.concat('senderLatchingToTarget'),
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						data : {relax:'notHard'},
						type : Effect.Types.addExposedOrificeTag,
					},
					{
						label : 'cocktopus_inkject_tick',
						events : [
							GameEvent.Types.internalWrapperTick
						],
						type : Effect.Types.damage,
						data : {
							amount : 5
						}
					},
					{
						label : 'cocktopus_inkject_expire',
						events : [
							GameEvent.Types.internalWrapperExpired,
						],
						conditions : [],
						type : Effect.Types.addMP,
						data : {
							amount : -10
						}
					},
					{
						events : [
							GameEvent.Types.internalWrapperExpired,
						],
						conditions : [],
						type : Effect.Types.addArousal,
						data : {
							amount : 10
						}
					},
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.stun,
						data : {ignoreDiminishing:true}
					},
				]
			}
		]
	},

	tentacle_ride : {
		name : "Tentaride",
		icon : 'rock',
		description : "Lifts your target off the ground, grappling them for 2 turns.",
		ap : 5,
		cooldown : 8,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'knockdown',
				target : Wrapper.TARGET_AUTO,
				duration : 2,
				detrimental : true,
				name : "Tentacle Ride",
				icon : "rock",
				description : "Lifted onto a tentacle, grappled.",
				trigger_immediate : true,
				add_conditions : stdCond.concat(
					"targetNotBeast", "targetNotGrappledOrKnockedDown"
				),
				tags : [stdTag.wrTentacleRide],
				effects : [
					{
						type : Effect.Types.grapple,
					},
					
				]
			}
		]
	},
	shocktacle_zap : {
		name : "Zap",
		icon : 'electric-whip',
		description : "Shock a player with a tentacle, dealing 4 elemental damage.",
		ap : 2,
		cooldown : 1,
		mp : 4,
		detrimental : true,
		type : Action.Types.elemental,
		tags : [
			stdTag.acDamage
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					},
					
				]
			}
		]
	},

	groper_leg_spread : {
		name : "Leg Spread",
		icon : 'foot-trip',
		description : "Spreads your target's legs for 2 turns, reducing physical and corruption avoidance by 3.",
		ap : 2,
		cooldown : 3,
		detrimental : true,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				icon : 'foot-trip',
				name : 'Leg Spread',
				description : 'Legs spread. -3 physical and corruption avoidance.',
				duration : 2,
				detrimental : true,
				tags : [stdTag.wrLegsSpread],
				add_conditions : stdCond.concat("targetNotBeast","targetLegsNotSpread"),
				effects : [
					{
						type : Effect.Types.svPhysical,
						data : {"amount": -3}
					},
					{
						type : Effect.Types.svCorruption,
						data : {"amount": -3}
					}
				]
			}
		]
	},
	groper_groin_lash : {
		name : "Groper Lash",
		icon : 'whiplash',
		description : "Lashes your target, dealing 5 physical damage and interrupting. Only usable on targets with their legs spread.",
		ap : 3,
		cooldown : 4,
		detrimental : true,
		tags : [
			stdTag.acPainful,
			stdTag.acDamage
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast","targetLegsSpread"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": 5}
					},
					{
						type : Effect.Types.interrupt
					}
				]
			}
		]
	},
	groper_groin_grope : {
		name : "Roper Grope",
		icon : 'spiral-tentacle',
		description : "Tentacle-gropes your target's groin, dealing 5 corruption damage. Only usable on targets with their legs spread.",
		ap : 2,
		cooldown : 2,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [
			stdTag.acArousing,
			stdTag.acDamage
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast","targetLegsSpread"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": 5}
					}
				]
			}
		]
	},
	groper_root : {
		name : "Roper Root",
		icon : 'plant-roots',
		description : "Entangles your target's clothes, adding a 25% chance of stripping a random item on them when they use a melee attack on their next turn.",
		ap : 3,
		cooldown : 4,
		detrimental : true,
		duration : 1,
		type : Action.Types.physical,
		tags : [stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				name : 'Entangle',
				description : 'Using a melee attack has a 30% chance of stripping you.',
				icon : 'plant-roots',
				duration : 1,
				detrimental : true,
				add_conditions : stdCond.concat('targetNotNaked'),
				stay_conditions : stdCond.concat('targetNotNaked'),
				effects : [
					{
						events : [GameEvent.Types.actionUsed],
						conditions : ["senderIsWrapperParent", "actionMelee", "rand30", "targetNotSender"],
						type : Effect.Types.disrobe,
						data : {slots:[Asset.Slots.upperBody, Asset.Slots.lowerBody], numSlots:1}
					}
				]
			}
		]
	},
	groper_skittering_swarm : {
		name : "Skittering Swarm",
		icon : 'earwig',
		description : "Covers your target in a skittering swarm for 2 turns, reducing physical proficiency by 2 and adds 1 arousal at the start of their turn.",
		ap : 2,
		mp : 3,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'skitteringSwarm',
				name : 'Skittering Swarm',
				description : '-2 physical proficiency, arousing.',
				icon : 'earwig',
				duration : 2,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						label : 'skitteringSwarm',
						events : [GameEvent.Types.internalWrapperTick],
						type : Effect.Types.addArousal,
						data : {amount:1}
					},
					{
						type: Effect.Types.bonPhysical,
						data : {amount: -2},
					}
				]
			}
		]
	},
	groper_stinging_swarm : {
		name : "Stinging Swarm",
		icon : 'wasp-sting',
		description : "Deals 3 physical damage to all enemies.",
		ap : 3,
		mp : 2,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.physical,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		target_type : Action.TargetTypes.aoe,
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetOtherTeam"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {amount:3}
					}
				]
			}
		]
	},

	groper_sap_squeeze : {
		name : "Sap Squeeze",
		icon : 'curled-tentacle',
		description : "Squeezes your target with sap, dealing 3 physical damage and leaving sap behind, reducing their physical avoidance by 1 for 2 turns. Stacks up to 3 times.",
		ap : 2,
		mp : 2,
		cooldown : 1,
		detrimental : true,
		type : Action.Types.physical,
		tags : [
			stdTag.acPainful,
			stdTag.acDamage,
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				icon : 'curled-tentacle',
				name : 'Sap Squeeze',
				description : '-1 Physical Avoidance per stack',
				duration : 2,
				max_stacks : 3,
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.svPhysical,
						data : {"amount": -1}
					},
					{
						events : [GameEvent.Types.internalWrapperAdded],
						type : Effect.Types.damage,
						data : {"amount": 3}
					}
				]
			}
		]
	},
	groper_sap_inject : {
		name : "Sap Inject",
		icon : 'bamboo-fountain',
		description : "Injects a target affected by leg spread by sticky sap, doing 8 corruption damage and leaving thick sticky sap behind for 2 turns, increasing the target's corruption avoidance by 5.",
		ap : 2,
		mp : 4,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [
			stdTag.acArousing,
			stdTag.acDamage,
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat('targetNotBeast',"targetLegsSpread"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {"amount": 8}
					}
				]
			},
			{
				icon : 'bamboo-fountain',
				name : 'Sap Injection',
				description : '+5 Corruption Avoidance',
				duration : 2,
				detrimental : false,
				add_conditions : stdCond.concat("targetNotBeast","targetLegsSpread"),
				stay_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.svCorruption,
						data : {"amount": 5}
					}
				]
			}
		]
	},

	// Crab
	crab_claw_pinch : {
		name : "Claw Pinch",
		icon : 'crossed-claws',
		description : "Jumps onto and pinches a player with your claws, dealing 5 physical damage.",
		ap : 2,
		cooldown : 3,
		mp : 3,
		detrimental : true,
		type : Action.Types.physical,
		tags : [
			stdTag.acDamage,
			stdTag.acPainful
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 5
						}
					},
				]
			}
		]
	},
	crab_claw_tug : {
		name : "Claw Tug",
		icon : 'claws',
		description : "Latches onto and tugs at your target's clothes, doing 1 cloth damage and has a 20% chance of removing a random piece of clothing.",
		ap : 2,
		cooldown : 2,
		mp : 1,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond.concat("targetNotNaked"),
				effects : [
					{
						type : Effect.Types.damageArmor,
						data : {
							amount : 1
						}
					},
					{
						type : Effect.Types.disrobe,
						data : {
							numSlots : 1
						},
						conditions : ["rand20"]
					},
				]
			}
		]
	},


	// Skeleton
	skeleton_looseHand: {
		icon : 'skeletal-hand',
		name : "Loose Hand",
		description : "Detach your hand inside your target's clothing and fondle their goods, adding 1 arousal every turn for 3 turns.",
		ap : 1,
		cooldown : 3,
		tags : [stdTag.acArousing],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'skeleton_looseHand',
				target : Wrapper.Targets.auto,
				icon : 'skeletal-hand',
				name : 'Loose Hand',
				description : 'Being fondled by a loose skeletal hand',
				duration : 3,
				detrimental : true,
				add_conditions : stdCond.concat("skeleton_looseHand"),
				stay_conditions : stdCond.concat({conditions : [
					{conditions:[{type:Condition.Types.tag, data:{tags:'skeletal_hand_ub'}}, "targetWearsUpperBody"], min:-1},
					{conditions:[{type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}, "targetWearsLowerBody"], min:-1},
				]}),
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						data : {tags:[
							{tags:'skeletal_hand_ub', conds:[{
								conditions : ["targetWearsUpperBody", "targetBreasts"],
								min : -1
							}]},
							{tags:'skeletal_hand_lb', conds:['targetWearsLowerBody']}
						]},
						type : Effect.Types.addRandomTags,
					},
					{
						label : 'skeleton_looseHand',
						events : [GameEvent.Types.internalWrapperAdded, GameEvent.Types.internalWrapperTick],
						type : Effect.Types.addArousal, 
						data : {"amount": 1}
					},
				]
			}
		]
	},


	// Lamprey
	lamprey_slither : {
		name : "Slither",
		icon : 'suckered-tentacle',
		description : "Slithers into your target's clothes, doing 5 corruption damage.",
		ap : 2,
		cooldown : 2,
		mp : 0,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				add_conditions : stdCond.concat(["targetHasClothedErogenousZone"]),
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 5
						}
					},
				]
			}
		]
	},
	leech : {
		name : "Leech",
		icon : 'leeching-worm',
		description : "Deals 4 corruption damage to an exposed target and heals you for the same amount.",
		ap : 2,
		mp : 3,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [ stdTag.acDamage, stdTag.acSelfHeal],
		show_conditions : stdCond.concat(["inCombat"]),
		wrappers : [
			{
				add_conditions : stdCond.concat(["targetNotBeast", "targetGroinOrBreastsExposed"]),
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							"amount" : 4,
							"leech" : 1
						}
					},
				]
			}
		]
	},
	lamprey_shock : {
		name : "Bioelectrogenesis",
		icon : 'chain-lightning',
		description : "Shocks all enemy players, dealing 4 elemental damage and interrupting.",
		ap : 3,
		cooldown : 4,
		mp : 4,
		detrimental : true,
		type : Action.Types.elemental,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		target_type : Action.TargetTypes.aoe,
		wrappers : [
			{
				add_conditions : stdCond.concat("targetOtherTeam"),
				duration : 0,
				detrimental : true,
				effects : [
					{
						type : Effect.Types.damage,
						data : {amount : 4}
					},
					{type:Effect.Types.interrupt}
				]
			}
		]
	},



	// Anemone
	anemone_grab : {
		name : "Grab",
		icon : 'daemon-pull',
		description : "Grab a hold of a player with your tendrils, grappling them for 3 turns.",
		ap : 4,
		cooldown : 6,
		detrimental : true,
		type : Action.Types.physical,
		tags : [stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 3,
				detrimental : true,
				name : "Grabbed",
				icon : "daemon-pull",
				description : "Caught in %S's tendrils!",
				trigger_immediate : true,
				add_conditions : stdCond.concat("targetNotBeast", "targetNotGrappledOrKnockedDown"),
				tags : [stdTag.wrTentacleRide],
				effects : [
					{type : Effect.Types.grapple},
				]
			}
		]
	},
	anemone_restrain : {
		name : "Restrain",
		icon : 'quicksand',
		description : "Spreads your grappled target's limbs, stunning them for 2 turns and reducing their phys and corruption resistance by 2.",
		ap : 2,
		cooldown : 7,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 2,
				detrimental : true,
				name : "Restrained",
				icon : "quicksand",
				description : "Caught in an anemone's tendrils, stunned. -2 Physical and corruption resist!",
				trigger_immediate : true,
				add_conditions : stdCond.concat("targetGrappledByMe"),
				tags : [stdTag.wrTentacleRestrained],
				effects : [
					{type : Effect.Types.stun},
					{type : Effect.Types.svCorruption, data:{amount:-2}},
					{type : Effect.Types.svPhysical, data:{amount:-2}},
				]
			}
		]
	},
	anemone_tickle : {
		name : "Tickle",
		icon : 'floating-tentacles',
		description : "Tickles your grappled target, doing 3 corruption damage and adding 1 arousal.",
		ap : 2,
		cooldown : 1,
		mp : 0,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDamage],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				add_conditions : stdCond.concat(["targetGrappledByMe"]),
				detrimental : true,
				effects : [
					{
						type : Effect.Types.damage,
						data : {amount : 3}
					},
					{
						type: Effect.Types.addArousal,
						data : {amount : 1}
					}
				]
			}
		]
	},


	// Guardian demon
	guardian_demon_grapple : {
		name : "Grapple",
		icon : 'monster-grasp',
		description : "Grapples your target for 3 turns.",
		ap : 4,
		cooldown : 6,
		detrimental : true,
		type : Action.Types.physical,
		tags : [stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				label : 'guardian_demon_grapple',
				target : Wrapper.TARGET_AUTO,
				duration : 3,
				detrimental : true,
				name : "Grappled",
				icon : "monster-grasp",
				description : "Caught by %S!",
				trigger_immediate : true,
				add_conditions : stdCond.concat("targetNotBeast", "targetNotGrappledOrKnockedDown"),
				tags : [stdTag.wrGrapple],
				effects : [
					{type : Effect.Types.grapple},
					'selfTaunt'
				]
			}
		]
	},
	guardian_demon_consume : {
		name : "Consume",
		icon : 'mouth-watering',
		description : "Snack on your grappled and exposed shorter target's genitals, dealing 3 corruption damage and healing the caster for an amount equal to the target's arousal.",
		ap : 2,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDamage, stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast", "targetShorter", "targetGrappledByMe", "targetPelvisExposed"),
				effects : [
					{type : Effect.Types.damage, data:{amount:3}},
					{type : Effect.Types.damage, data:{amount:"-se_Arousal"}, targets:[Wrapper.TARGET_CASTER]}
				]
			}
		]
	},
	guardian_demon_impale : {
		name : "Impale",
		icon : 'heart-stake',
		description : "Impales a grappled and exposed shorter target on yourself, doing 4 corruption damage and extending the grapple by 1 turn.",
		ap : 2,
		cooldown : 3,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDamage, stdTag.acNpcImportant],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast", "targetGrappledByMe", "targetShorter", "targetPelvisExposed"),
				effects : [
					{type : Effect.Types.damage, data:{amount:4}},
					{type : Effect.Types.addWrapperTime, data:{amount:1, conditions:[{
						id : 'a',
						type : Condition.Types.wrapperLabel,
						data : {label:'guardian_demon_grapple'}
					}]}}
				]
			}
		]
	},
	guardian_demon_expose : {
		name : "Expose",
		icon : 'pelvis-bone',
		description : "Exposes up to two targets' pelvic areas for 1 turn. Has a 10% chance of tugging the armor off.",
		ap : 2,
		cooldown : 2,
		max_targets : 2,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				name : 'Exposed',
				description : 'Groin and butt exposed!',
				icon : 'pelvis-bone',
				duration : 1,
				tick_on_turn_end : true,
				tick_on_turn_start : false,
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast", "targetWearsLowerBody"),
				tags : [
					stdTag.ttButtExposed, stdTag.ttGroinExposed
				],
				effects : [
					{type : Effect.Types.disrobe, data:{slots:Asset.Slots.lowerBody}, conditions:["rand10"], events : [GameEvent.Types.internalWrapperAdded],}
				]
			}
		]
	},
	guardian_demon_remoteDelivery: {
		name : "Remote Delivery",
		icon : 'blood',
		description : "Fling cum and telekinetically alter its trajectory, doing 4 corruption damage and reducing the target's corruption avoidance by 2 for 2 turns.",
		ap : 1,
		mp : 3,
		cooldown : 2,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [stdTag.acDamage, stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 2,
				name : "Demon Cum",
				icon : "blood",
				description : "Corruption avoidance reduced by 2",
				add_conditions : stdCond.concat("targetNotBeast"),

				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						type : Effect.Types.damage,
						data : {amount : 4}
					},
					{
						type : Effect.Types.svCorruption,
						data : {"amount": -2}
					},
					
				]
			}
		]
	},

	// sharktopus
	// shark-bite



	// mq boss
	tentacle_pit : {
		name : "Tentacle Pit",
		icon : 'vortex',
		description : "Surrounds the caster with a tentacle pit for 1 turn. Anyone using a melee attack against you will be caught by the pit and stunned for 3 turns.",
		ap : 2,
		cooldown : 3,
		mp : 1,
		detrimental : false,
		target_type : Action.TargetTypes.self,
		type : Action.Types.corruption,
		tags : [
			stdTag.acDamage,
			stdTag.acNpcImportant
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 1,
				name : "Dark Pit",
				icon : "vortex",
				description : "The caster is surrounded by a dark pit. It would be wise not to get near.",
				detrimental : false,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						label : 'tentacle_pit_proc',
						type : Effect.Types.runWrappers,
						targets : [Wrapper.TARGET_EVENT_RAISER],
						events : [GameEvent.Types.actionUsed],			// Any action has been used in the game
						conditions : [
							"targetIsWrapperParent",		// Target of said action was the recipient of this wrapper
							"actionMelee",					// Action was melee
							"senderNotWrapperParent",		// Caster of action was not the sender of this wrapper
						],
						data : {
							wrappers : [
								{
									duration : 3,
									name : "Tentacle Pit",
									icon : "noodle-ball",
									detrimental : true,
									description : "Held up by tentacles and stunned.",
									add_conditions : stdCond,
									stay_conditions : stdCond,
									tags : [stdTag.wrLegsSpread, stdTag.wrTentacleRestrained],
									effects : [
										{
											events : [GameEvent.Types.internalWrapperAdded],
											type : Effect.Types.stun
										}
									]
								},
								// Remove 
								{
									target : Wrapper.TARGET_CASTER,
									detrimental : false,
									effects : [{
										type : Effect.Types.removeWrapperByLabel,
										data : {label:'tentacle_pit'}
									}]
								}
							]
						}
					},
				]
			}
		]
	},
	mq00_ward_boss : {
		name : 'Ward',
		icon : 'shield-reflect',
		description : 'Surrounds your master with a shield, reducing all damage taken by 3 for 2 turns.',
		ap : 1,
		mp : 3,
		cooldown: 2,
		ranged : Action.Range.Ranged,
		detrimental : false,
		type : Action.Types.corruption,
		tags : [
			stdTag.acNpcImportant,
			stdTag.acBuff
		],
		show_conditions : ["inCombat"],
		wrappers : [{
			duration : 2,
			name : "Ward",
			icon : "shield-reflect",
			description : "All damage taken reduced by 3.",
			detrimental : false,
			add_conditions : stdCond.concat("targetIsBoss"),
			stay_conditions : stdCond.concat("senderNotDead"),	// checks if the caster isn't dead, imp in this case
			effects : [
				{
					type : Effect.Types.globalDamageTakenMod,
					data : {amount:-3},
				}
			],
		}],
	},


	// SQ sharktopus boss
	sharktopus_attack : {
		icon : 'punch',
		name : "Sharktopus Attack",
		description : "Deals 3 physical damage to 2 players.",
		ap : 4,
		cooldown : 0,
		max_targets : 2,
		show_conditions : ["inCombat"],
		tags : [stdTag.acDamage, stdTag.acPainful],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 3
						}
					},
				]
			}
		]
	},
	sharktopus_arouse : {
		name : "Sharktopus Arouse",
		icon : 'hearts',
		description : "Deals 3 corruption damage to 2 players.",
		ap : 4,
		cooldown : 0,
		type : Action.Types.corruption,
		max_targets : 2,
		show_conditions : ["inCombat"],
		tags : [stdTag.acDamage, stdTag.acArousing],
		wrappers : [
			{
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 3
						}
					},
				]
			}
		]
	},
	sharktopus_submerge : {
		name : "Sharktopus Submerge",
		icon : 'shark-fin',
		description : "Submerges, becoming permanently untargetable.",
		ap : 0,
		cooldown : 9,
		detrimental : false,
		target_type : Action.TargetTypes.self,
		show_conditions : ["inCombat",{type:Condition.Types.hasWrapper, data:{label:'sharktopus_submerge'}, inverse:true}],
		tags : [stdTag.acDamage, stdTag.acArousing, stdTag.acNpcImportant],
		wrappers : [
			{
				label : 'sharktopus_submerge',
				detrimental : false,
				duration : -1,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				tags : [stdTag.gpInvisible],
			},
			{
				// Show the gong
				target : Wrapper.TARGET_AOE,
				add_conditions : [{type:Condition.Types.playerLabel, data:{label:'SQ_sharktopus_gong'}}],
				detrimental : false,
				effects : [
					{
						type : Effect.Types.removeWrapperByLabel,
						data : {label:"perma_invis"}
					}
				]
			},
			"endTurn"
		]
	},


	// Rat in yuug port
	breast_squeeze : {
		name : 'Breast Squeeze',
		icon : 'grab',
		description : 'Fondles a player\'s breasts. Arousing.',
		ap : 0,
		cooldown : 1,
		mp : 0,
		detrimental : true,
		type : Action.Types.corruption,
		show_conditions : ["notInCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.addArousal,
						data : {amount : 3}
					},
				]
			}
		],
		
	},

	// Generic helper spells
	// Removes a latched player
	detach : {
		name : "Detach",
		icon : 'throwing-ball',
		description : "Dislodge a target latching onto something.",
		ap : 2,
		cooldown : 1,
		mp : 0,
		hit_chance : 70,
		detrimental : true,
		type : Action.Types.physical,
		tags : [],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : true,
				add_conditions : stdCond.concat('targetLatching'),
				effects : [
					'unlatch_target'
				]
			}
		]
	},
	// Removes a stack of a wrapper with stdTag.wrBound
	bondageStruggle : {
		name : "Work the Ropes",
		icon : 'imprisoned',
		description : "Struggle to break a tied up player free!",
		ap : 2,
		cooldown : 0,
		mp : 0,
		hit_chance : 100,
		detrimental : false,
		type : Action.Types.physical,
		disable_override : 1,
		wrappers : [
			{
				target : Wrapper.TARGET_AUTO,
				duration : 0,
				detrimental : false,
				effects : ['bondageStruggle'],
				add_conditions : [
					"targetTiedUp",
					{conditions:[
						'targetIsSender',
						'senderNotTiedUp'
					]},
				]
			}
		]
	},



	


	// assets
	minorRepairKit: {
		ranged : Action.Range.Melee,
		name : "Minor Repair",
		icon : 'sewing-needle',
		description : "Restores 25% of a damaged item's durability (min 5).",
		ap : 0,
		cooldown : 0,
		max_targets : 1,
		detrimental : false,
		no_use_text : true,
		no_action_selector : true,
		conditions : ["targetHasRepairable"],
		show_conditions : ["notInCombat"],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "repair",
						data : {
							"amount": 0.25,
							"multiplier": true,
							"min": 5
						}
					}
				]
			}
		]
	},
	repairKit: {
		ranged : Action.Range.Melee,
		name : "Armor Repair",
		icon : 'sewing-needle',
		description : "Restores 50% of a damaged item's durability (min 10).",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [],
		no_use_text: true,
		no_action_selector: true,
		conditions : [
			"targetHasRepairable"
		],
		show_conditions : [
			"notInCombat"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "repair",
						data : {
							"amount": 0.5,
							"multiplier": true,
							"min": 10
						}
					}
				]
			}
		]
	},
	majorRepairKit: {
		ranged : Action.Range.Melee,
		name : "Major Repair",
		icon : 'sewing-needle',
		description : "Fully restores a damaged item's durability.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [],
		"no_use_text": true,
		"no_action_selector": true,
		conditions : [
			"targetHasRepairable"
		],
		show_conditions : [
			"notInCombat"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "repair",
						data : {
							"amount": 1,
							"multiplier": true
						}
					}
				]
			}
		]
	},

	throwRock : {
		icon : 'stone',
		name : "Throw Rock",
		description : "Throw a small rock, doing no damage but adding 2 threat.",
		ap : 1,
		cooldown : 0,
		show_conditions : ["inCombat"],
		tags : ["ac_painful"],
		hit_chance : 70,
		wrappers : [
			{
				target : "VICTIM",
				detrimental : true,
				add_conditions : stdCond,
				effects : [
					{
						type : Effect.Types.addThreat,
						data : {"amount": 3}
					}
				]
			}
		]
	},

	minorHealingPotion: {
		ranged : Action.Range.None,
		name : "Minor Healing Potion",
		icon : 'potion-ball',
		description : "Restores 8 HP to the user.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_heal",
			"ac_item"
		],
		target_type: "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "damage",
						data : {
							"amount": -8
						}
					},
					
				]
			}
		]
	},
	healingPotion: {
		ranged : Action.Range.None,
		name : "Healing Potion",
		icon : 'potion-ball',
		description : "Restores 15 HP to the user.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_heal",
			"ac_item"
		],
		"target_type": "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "damage",
						data : {
							"amount": -15
						}
					},
					
				]
			}
		]
	},
	majorHealingPotion: {
		ranged : Action.Range.None,
		name : "Major Healing Potion",
		icon : 'potion-ball',
		description : "Restores 30 HP to the user.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_heal",
			"ac_item"
		],
		"target_type": "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "damage",
						data : {
							"amount": -30
						}
					},
					
				]
			}
		]
	},
	manaPotion: {
		ranged : Action.Range.None,
		name : "Mana Potion",
		icon : 'spiral-bottle',
		description : "Restores 5 mana to the user.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_mana_heal",
			"ac_item"
		],
		"target_type": "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "addMP",
						data : {
							"amount": 5
						}
					},
					
				]
			}
		]
	},
	majorManaPotion: {
		ranged : Action.Range.None,
		name : "Major Mana Potion",
		icon : 'spiral-bottle',
		description : "Restores 10 mana to the user.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_mana_heal",
			"ac_item"
		],
		"target_type": "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "addMP",
						data : {
							"amount": 10
						}
					},
					
				]
			}
		]
	},

	gropeRope : {
		icon : 'lasso',
		name : "Groperope",
		description : "Deals 3 physical damage against a humanoid, generates a large amount of threat.",
		ap : 1,
		cooldown : 4,
		show_conditions : ["inCombat"],
		tags : [
			stdTag.acDamage,
			stdTag.acPainful,
		],
		wrappers : [
			{
				target : "VICTIM",
				detrimental : true,
				add_conditions : stdCond.concat("targetNotBeast"),
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 3
						}
					},
					{
						type : Effect.Types.addThreat,
						data : {
							amount:20
						}
					}
				]
			}
		]
	},

	// Food
	foodRazzyberry : {
		ranged : Action.Range.None,
		name : "%P%",		// %P% = parent
		description : "%P%",
		icon : '%P%',
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			stdTag.acHeal,
			stdTag.acManaHeal,
			stdTag.acItem,
			stdTag.acFood,
		],
		show_conditions : ["notInCombat"],
		target_type: "self",
		wrappers : [
			{
				effects : [
					{type : Effect.Types.addMP,data : {amount: 2}},
					{type : Effect.Types.damage,data : {amount: -5}},
				]
			}
		]
	},
	foodFriedFish : {
		ranged : Action.Range.None,
		name : "%P%",		// %P% = parent
		description : "%P%",
		icon : '%P%',
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			stdTag.acHeal,
			stdTag.acManaHeal,
			stdTag.acItem,
			stdTag.acFood,
		],
		show_conditions : ["notInCombat"],
		target_type: "self",
		wrappers : [
			{
				effects : [
					{type : Effect.Types.addMP,data : {amount: 5}},
					{type : Effect.Types.damage,data : {amount: -25}},
				]
			}
		]
	},
	foodAle : {
		ranged : Action.Range.None,
		name : "%P%",		// %P% = parent
		description : "%P%",
		icon : '%P%',
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			stdTag.acHeal,
			stdTag.acManaDamage,
			stdTag.acItem,
			stdTag.acFood,
			stdTag.acDrink,
		],
		show_conditions : ["notInCombat"],
		target_type: "self",
		wrappers : [
			{
				effects : [
					{type : Effect.Types.addMP,data : {amount: -2}},
					{type : Effect.Types.damage,data : {amount: -10}},
				]
			}
		]
	},


	// Debug
	debug_charged_spell: {
		name : "1t Charged",
		ranged : Action.Range.Ranged,
		description : "Deals 10 holy damage.",
		ap : 2,
		mp : 3,
		type : "Holy",
		cooldown : 1,
		"cast_time": 1,
		tags : [
			"ac_damage"
		],
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				name : "",
				icon : "",
				description : ".",
				detrimental : false,
				add_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": -10
						}
					},
					
				]
			}
		]
	}
};

function getArray(){
	const out = [];
	for( let action in lib ){
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export {getArray};
export default lib;
