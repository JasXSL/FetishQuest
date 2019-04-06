import Action from "../../classes/Action.js";
import stdTag from "../stdTag.js";
import { Wrapper, Effect } from "../../classes/EffectSys.js";
import Asset from "../../classes/Asset.js";
import GameEvent from "../../classes/GameEvent.js";
import Player from "../../classes/Player.js";
import C from './conditions.js';


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
		description : "Deals 2 corruption damage.",
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
							"amount": 2
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
		"hidden": true,
		"allow_when_charging": true,
		show_conditions : [
			"inCombat"
		],
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
						type : "endTurn"
					}
				]
			}
		]
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
		name : "Punish Dominant",
		icon : 'muscle-fat',
		description : "Use a dominant punishment on a defeated enemy.",
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
		name : "Punish Submissive",
		icon : 'kneeling',
		description : "Use a submissive punishment on a defeated enemy.",
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
		level: 1,
		icon : 'armor-punch',
		name : "Low Blow",
		description : "Fight dishonorably. Deals 5 damage and interrupts any active charged actions your opponent is readying.",
		ap : 3,
		cooldown : 3,
		tags : [
			"ac_damage",
			"ac_painful"
		],
		show_conditions : [
			"inCombat"
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
				effects : [
					{
						type : "damage",
						data : {
							"amount": 5
						}
					},
					{
						type : "interrupt"
					},
					
				]
			}
		]
	},

	// Elementalist
	elementalist_iceBlast: {
		level : 1,
		name : "Ice Blast",
		icon : 'ice-spell-cast',
		ranged: true,
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
		level: 2,
		name : "Healing Surge",
		icon : 'splashy-stream',
		description : "Restores 8 HP to your target. Also heals 2 HP at the start of their turn for 3 turns.",
		ap : 1,
		mp : 2,
		ranged: true,
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
							"amount": -8
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
							"amount": -2
						}
					}
				]
			}
		]
	},
	elementalist_waterSpout: {
		level : 3,
		name : "Water Spout",
		icon : 'splash',
		description : "Summons a water spout that soaks your target for 1 turn and lowers their elemental resistance by two. Whenever the target uses an action, the caster gains 1 MP.",
		ap : 2,
		mp : 1,
		cooldown : 2,
		ranged: true,
		detrimental : true,
		type : Action.Types.elemental,
		tags : [stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				duration : 1,
				name : "Water Spout",
				icon : "droplet-splash",
				description : "Soaked. Elemental resistance lowered by 2. Performing actions restores 1 MP to the caster.",
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

	// Rogue
	rogue_exploit: {
		level: 1,
		name : "Exploit",
		icon : 'hooded-assassin',
		description : "Deals 4 physical damage plus another 2 per slot of upperbody and/or lowerbody armor missing from your target.",
		ap : 2,
		mp : 0,
		type : "Physical",
		cooldown : 1,
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
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": "8-ta_lowerbody*2-ta_upperbody*2"
						}
					},
					
				]
			}
		]
	},
	rogue_corruptingPoison: {
		level: 2,
		name : "Corrupting Poison",
		icon : 'poison-bottle',
		description : "Inflicts your target with a corrupting poison, dealing 2 corruption damage at the start of their turn for 3 turns, and reduces corruption resist by 4.",
		ap : 2,
		mp : 2,
		type : "Physical",
		cooldown : 1,
		"charges": 2,
		tags : [
			"ac_damage",
			"ac_debuff"
		],
		show_conditions : [
			"inCombat"
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
				effects : [
					
				]
			},
			{
				target : "VICTIM",
				duration : 3,
				name : "Corrupting Poison",
				icon : "poison-bottle",
				description : "Taking corruption damage each turn. Corruption resist reduced.",
				detrimental : true,
				add_conditions : stdCond,
				stay_conditions : stdCond,
				effects : [
					{
						type : "damage",
						data : {
							"amount": 2,
							type : "Corruption"
						}
					},
					{
						type : "svCorruption",
						data : {
							"amount": -4
						}
					}
				]
			}
		]
	},
	rogue_dirtyTricks: {
		level: 3,
		name : "Dirty Tricks",
		icon : 'snatch',
		description : "Use a dirty trick on your target, doing 8 corruption damage. Has a 5% chance per corruption advantage to unequip their lower or upperbody armor.",
		ap : 2,
		mp : 3,
		type : "Corruption",
		cooldown : 3,
		tags : [
			"ac_damage"
		],
		show_conditions : [
			"inCombat"
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
				effects : [
					{
						type : "damage",
						data : {
							"amount": 8
						}
					},
					{
						type : "disrobe",
						data : {
							"slots": [
								"lowerbody",
								"upperbody"
							],
							"numSlots": 1
						},
						conditions : [
							{
								type : "rng",
								data : {
									"chance": "5*(se_BonCorruption-ta_SvCorruption)"
								}
							}
						]
					},
					
				]
			}
		]
	},

	// Cleric
	cleric_smite: {
		level: 1,
		name : "Smite",
		icon : 'fission',
		description : "Smites your opponent for 4 holy damage, increased by 10% per corruption damage your target dealt last turn, up to 15 damage.",
		ap : 1,
		mp : 1,
		type : Action.Types.holy,
		cooldown : 1,
		ranged: true,
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
							"amount": "4*(1+min(ta_damageDoneSinceLastCorruption*0.1,3.75))"
						}
					},
					
				]
			}
		]
	},
	cleric_chastise: {
		level: 2,
		name : "Chastise",
		icon : 'crossed-chains',
		description : "Chastises up to 2 targets, dealing 3 holy damage every time they use a damaging action until the end of their next turn and reducing all their damage done by 1.",
		ap : 1,
		mp : 1,
		max_targets : 2,
		ranged: true,
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
		level: 3,
		name : "Heal",
		icon : 'healing',
		ranged: true,
		description : "Restores 4 HP, plus an additional 4 if your target's max health is less than 50%",
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
							"amount": "-4-(ta_HP<(ta_MaxHP/2))*4"
						}
					},
					
				]
			}
		]
	},

	// Tentaclemancer
	tentaclemancer_tentacleWhip: {
		level: 1,
		name : "Tentacle Whip",
		icon : 'suckered-tentacle',
		description : "Deals 3 physical damage. 6 if your target is affected by corrupting ooze.",
		ap : 1,
		mp : 1,
		ranged: true,
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
		level: 2,
		name : "Corrupting Ooze",
		icon : 'gooey-molecule',
		description : "Adds a stack of corrupting ooze on your target. Corrupting ooze lowers their corruption resistance by 1 per stack, and at the start of the affected players turn an additional stack is added. If it goes over 5 stacks, the target gets stunned for 1 turn.",
		ap : 1,
		mp : 1,
		charges : 3,
		type : Action.Types.corruption,
		cooldown : 0,
		ranged: true,
		tags : [ stdTag.acDebuff],
		show_conditions : ["inCombat"],
		wrappers : [
			"corruptingOoze",
		]
	},
	tentaclemancer_siphonCorruption: {
		level: 3,
		name : "Siphon Corruption",
		icon : 'goo-skull',
		description : "Consumes all charges of corrupting ooze on your target, dealing damage equal to 2x the amount of stacks consumed, and healing you for the same amount.",
		ap : 1,
		mp : 1,
		type : Action.Types.corruption,
		hit_chance: 90,
		cooldown : 3,
		ranged: true,
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
							"amount": "-se_Wrapper_corruptingOoze*2"
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
		level: 1,
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
		level: 2,
		name : "Bolster",
		icon : 'surrounded-shield',
		description : "Reduces your damage taken by 2 for one turn and clears 20% of your arousal. Taking damage while this effect is active grants the caster 1 AP.",
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
						events : [
							"internalWrapperAdded"
						],
						type : "addArousal",
						data : {
							"amount": -2
						}
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
		level: 3,
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


	// Monk
	monk_roundKick: {
		"level": 1,
		name : "Round Kick",
		icon : 'high-kick',
		description : "A chi infused kick, dealing 8 physical damage to an enemy. Misses with this ability may allow your target to riposte, doing the same amount of damage back to you.",
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
							"amount": 8
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
							"amount": 8
						}
					},
					
				]
			}
		]
	},
	monk_disablingStrike: {
		level: 2,
		name : "Disabling Strike",
		icon : 'despair',
		description : "Deals 2 damage and reduces your target's physical proficiency and resistance by 5 for 1 turn. Always hits.",
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
				description : "-5 Physical Proficiency and Resistance",
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
		level: 3,
		name : "Uplifting Strike",
		icon : 'smoking-finger',
		description : "Deals 3 damage to an enemy and heals the lowest HP party member for 2 HP per AP spent this turn.",
		ap : 1,
		mp : 2,
		cooldown : 2,
		hit_chance: 80,
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
							"amount": 3
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
					"targetNotKnockedDown",
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
							"targetLowerbodyNotHard",
							{
								conditions : [
									"targetUpperbodyNotHard",
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
		description : "Jump on and try to cream on or in your target, doing 2 corruption damage and reduces the target's corruption resistance by 1 for 2 turns.",
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
				description : "Corruption resistance reduced by 1 per stack",
				add_conditions : stdCond.concat("targetNotBeast"),
				effects : [
					{
						events : [GameEvent.Types.internalWrapperAdded],
						type : Effect.Types.damage,
						data : {
							amount : 2
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
		description : "Bite your target's ankles, dealing 4 physical damage. Has a 10% chance to knock your target down for 1 turn.",
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
					"targetNotKnockedDown",
					"targetNotBeast",
					"rand10"
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
		ap : 1,
		mp : 2,
		cooldown : 1,
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
					{conditions : 
						["targetWearsLowerbody", "targetWearsUpperbody"]
					}
				),
				effects : [
					{
						type : "damageArmor",
						data : {
							"amount": 2,
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
					"targetNotKnockedDown",
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
							"targetNoLowerbody",
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
		description : "Tugs as your target's lowerbody armor, doing 2 cloth damage. Has a 30% chance to pull the piece off.",
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
					"targetWearsLowerbody"
				),
				effects : [
					{
						type : "damageArmor",
						data : {
							"amount": 2,
							"slots": "lowerbody"
						}
					},
					{
						type : "disrobe",
						data : {
							"slots": "lowerbody"
						},
						conditions : [
							"rand30"
						]
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
					"targetNotBeast"
				),
				stay_conditions : [
					"senderNotDead"
				],
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
		ranged : true,
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
		description : "Starts thrusting your big head tentacle into an exposed orifice of a latched target, doing 4 corruption damage every turn for 3 turns or until you are pulled off. After 3 turns, you ink inside your target, adding 10 arousal to them and doing 10 mana damage.",
		ap : 4,
		cooldown : 5,
		detrimental : true,
		type : Action.Types.corruption,
		tags : [ stdTag.acDamage, stdTag.acDebuff],
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
							amount : 3
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
					"targetNotBeast", "targetNotGrappled"
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


	// assets
	minorRepairKit: {
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


	minorHealingPotion: {
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



	// Food
	foodRazzyberry : {
		name : "%P%",		// %P% = parent
		description : "%P%",
		icon : '%P%',
		ap : 0,
		cooldown : 0,
		detrimental : false,
		tags : [
			"ac_mana_heal",
			"ac_item",
			"ac_food",
		],
		show_conditions : [
			"notInCombat"
		],
		target_type: "self",
		wrappers : [
			{
				target : "VICTIM",
				duration : 0,
				effects : [
					{
						type : "addMP",
						data : {
							amount: "ta_MaxMP"
						}
					},
				]
			}
		]
	},


	// Debug
	debug_charged_spell: {
		level: 1,
		name : "1t Charged",
		ranged: true,
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
