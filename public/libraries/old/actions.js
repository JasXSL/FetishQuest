import Action from '../classes/Action.js';
import { Wrapper, Effect } from '../classes/EffectSys.js';
import stdTag from './stdTag.js';
import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import Asset from '../classes/Asset.js';

const out = [
	// STD

	// Attack
	{
		name : "Attack",
		description : "Deals 4 physical damage. Shares cooldown with Arouse on successful attacks.",
		ap : 2,
		cooldown : 1,
		label : 'stdAttack',
		show_conditions : ["inCombat"],
		tags : [
			stdTag.acDamage,
			stdTag.acPainful
		],
		wrappers : [
			{
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
				stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					},
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.addActionCharges,
						data : {
							actions : 'stdArouse',
							amount : -1
						}
					},
					"visTargTakeDamage"
				]
			}
		]
	},
	// Arouse
	{
		name : "Arouse",
		description : "Deals 4 corruption damage. Shares cooldown with Attack on successful attacks.",
		ap : 2,
		cooldown : 1,
		label : 'stdArouse',
		type : Action.Types.corruption,
		show_conditions : ["inCombat"],
		tags : [
			stdTag.acDamage,
			stdTag.acArousing
		],
		wrappers : [
			{
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
				stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					},
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.addActionCharges,
						data : {
							actions : 'stdAttack',
							amount : -1
						}
					},
					"visTargTakeDamageCorruption"
				]
			}
		]
	},
	// End Turn
	{
		label : "stdEndTurn",
		name : "End Turn",
		description : "End your turn.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		hidden : true,
		allow_when_charging : true,
		show_conditions : ["inCombat"],
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
						type : Effect.Types.endTurn,
					}
				]
			}
		]
	},
	// Escape
	{
		label : "stdEscape",
		name : "Escape",
		description : "Flee from combat.",
		ap : 0,
		cooldown : 1,
		detrimental : false,
		hidden : true,
		allow_when_charging : true,
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
						type : Effect.Types.flee,
					}
				]
			}
		]
	},

	// Dom punishment
	{
		label : "stdPunishDom",
		name : "Punish Dominant",
		description : "Use a dominant punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : ["notInCombat", "senderHasNotPunished"],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			{
				add_conditions : ["targetDead", "senderNotDead", "targetNotFriendly"],
				effects : [
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					},
					"visTargTakeDamageCorruption"
				],
				detrimental : false,
			}
		]
	},
	{
		label : "stdPunishSub",
		name : "Punish Submissive",
		description : "Use a submissive punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : ["notInCombat", "senderHasNotPunished"],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			{
				add_conditions : ["targetDead", "senderNotDead", "targetNotFriendly"],
				effects : [
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					},
					"visTargTakeDamageCorruption"
				],
				detrimental : false,
			}
		]
	},
	{
		label : "stdPunishSad",
		name : "Punish Sadistic",
		description : "Use a sadistic punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : ["notInCombat", "senderHasNotPunished"],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			{
				add_conditions : ["targetDead", "senderNotDead", "targetNotFriendly"],
				effects : [
					{
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					},
					"visTargTakeDamage"
				],
				detrimental : false,
			}
		]
	},











	// GENERIC CLASS SPELLS
	// lowBlow
	{
		level : 1,
		label : 'lowBlow',
		name : "Low Blow",
		description : "Fight dishonorably. Deals 5 damage and interrupts any active charged actions your opponent is readying.",
		ap : 3,
		cooldown : 3,
		tags : [
			stdTag.acDamage,
			stdTag.acPainful
		],
		show_conditions : ["inCombat"],
		wrappers : [
			{
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
				effects : [
					{
						type : Effect.Types.damage,
						data : {
							amount : 5,
						}
					},
					{
						type : Effect.Types.interrupt,
					},
					"visTargTakeDamage"
				]
			},
		]
	},



	// Elementalist class
		// iceBlast
		{
			level : 1,
			label : 'elementalist_iceBlast',
			name : "Ice Blast",
			ranged : true,
			description : "Blast your opponent with frost, dealing 6 elemental damage, plus 1 AP damage if your target is soaked.",
			ap : 2,
			mp : 1,
			type : Action.Types.elemental,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 6
							}
						},
						{
							type : Effect.Types.addAP,
							data : {
								amount : -1
							},
							conditions : [
								"targetSoaked"
							]
						},
						"visTargTakeDamageElemental"
					]
				},
			]
		},
		// healingSurge
		{
			level : 2,
			label : 'elementalist_healingSurge',
			name : "Healing Surge",
			description : "Restores 8 HP to your target. Also heals 2 HP at the start of their turn for 3 turns.",
			ap : 1,
			mp : 2,
			ranged : true,
			cooldown : 1,
			charges : 2,
			detrimental : false,
			type : Action.Types.elemental,
			tags : [
				stdTag.acHeal,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -8
							}
						},
						"visTargHeal"
					]
				},
				{
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Healing Surge",
					icon : "wave-crest.svg",
					description : "Healing at the start of each turn.",
					detrimental : false,
					tags : [],
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -2
							}
						}
					]
				},

			]
		},
		// waterSpout
		{
			level : 3,
			label : 'elementalist_waterSpout',
			name : "Water Spout",
			description : "Places a water spout under your target for 1 turn. The spout activates when the target uses an action, soaking them and reducing their elemental resistance by 2, and restores 1 MP to the caster. Stacks 3 times.",
			ap : 2,
			mp : 1,
			cooldown : 2,
			ranged : true,
			detrimental : true,
			type : Action.Types.elemental,
			tags : [
				stdTag.acDebuff,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					duration : 1,
					name : "Water Spout",
					icon : "droplet-splash.svg",
					description : "Actions will debuff the target and restore MP to the caster.",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.runWrappers,
							events : [GameEvent.Types.actionUsed],
							conditions : ["senderIsWrapperParent", "actionNotHidden"],
							data : {
								wrappers : [
									"soak"
								]
							},
							label : 'elementalistWaterSpout_proc'
						},
						{
							targets : [Wrapper.TARGET_CASTER],
							type : Effect.Types.addMP,
							events : [GameEvent.Types.actionUsed],
							conditions : ["senderIsWrapperParent", "actionNotHidden"],
							data : {
								amount : 1
							}
						},
						
					]
				},
				{
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects:[
						"visTargTakeDamageElemental"
					]
				}
			]
		},
		// Later: Earth pillar

	// Rogue class
		// Exploit
		{
			level : 1,
			label : 'rogue_exploit',
			name : "Exploit",
			description : "Deals 4 physical damage plus another 2 per slot of upperbody and/or lowerbody armor missing from your target.",
			ap : 2,
			mp : 0,
			type : Action.Types.physical,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "8-ta_lowerbody*2-ta_upperbody*2"
							}
						},
						"visTargTakeDamage"
					]
				},
			]
		},
		// Corrupting Poison
		{
			level : 2,
			label : 'rogue_corruptingPoison',
			name : "Corrupting Poison",
			description : "Inflicts your target with a corrupting poison, dealing 2 corruption damage at the start of their turn for 3 turns, and reduces corruption resist by 4.",
			ap : 2,
			mp : 2,
			type : Action.Types.physical,
			cooldown : 1,
			charges : 2,
			tags : [
				stdTag.acDamage,
				stdTag.acDebuff
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						"visTargTakeDamage"
					]
				},
				{
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Corrupting Poison",
					icon : "poison-bottle.svg",
					description : "Taking corruption damage each turn. Corruption resist reduced.",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 2,
								type : Action.Types.corruption
							}
						},
						{
							type : Effect.Types.svCorruption,
							data : {
								amount : -4
							},
						},
					]
				},
			]
		},
		// Dirty Tricks
		{
			level : 3,
			label : 'rogue_dirtyTricks',
			name : "Dirty Tricks",
			description : "Use a dirty trick on your target, doing 8 corruption damage. Has a 5% chance per corruption advantage to unequip their lower or upperbody armor.",
			ap : 2,
			mp : 3,
			type : Action.Types.corruption,
			cooldown : 3,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						},
						{
							type : Effect.Types.disrobe,
							data : {
								slots : [Asset.Slots.lowerbody, Asset.Slots.upperbody],
								numSlots : 1,
							},
							conditions : [{
								type : Condition.Types.rng,
								data : {
									chance : "5*(se_BonCorruption-ta_SvCorruption)"
								}
							}]
						},
						"visTargTakeDamageCorruption"
					]
				},
			]
		},


	// Cleric class
		// Smite
		{
			level : 1,
			label : 'cleric_smite',
			name : "Smite",
			description : "Smites your opponent for 4 holy damage, increased by 10% per corruption damage your target dealt last turn, up to 15 damage.",
			ap : 1,
			mp : 1,
			type : Action.Types.holy,
			cooldown : 1,
			ranged : true,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "4*(1+min(ta_damageDoneSinceLastCorruption*0.1,3.75))"
							}
						},
						"visTargTakeDamageHoly"
					]
				},
			]
		},

		// Chastise
		{
			level : 2,
			label : 'cleric_chastise',
			name : "Chastise",
			description : "Chastises up to 2 targets, dealing 3 holy damage every time they use a damaging action until the end of their next turn and reducing all their damage done by 1.",
			ap : 1,
			mp : 1,
			max_targets : 2,
			ranged : true,
			type : Action.Types.holy,
			cooldown : 2,
			tags : [
				stdTag.acDebuff,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Chastise",
					icon : "holy-hand-grenade.svg",
					description : "Using damaging actions deals 3 holy damage back to the caster. Damage done reduced by 1.",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							events : [GameEvent.Types.actionUsed],
							conditions : ["senderIsWrapperParent", "actionNotHidden", "actionDamaging"],
							data : {
								amount : 3,
							},
							label : 'cleric_chastise_proc'
						},
						{
							type : Effect.Types.globalDamageDoneMod,
							data : {
								amount : -1,
							},
						},
					]
				},
				{
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					detrimental : true,
					effects : [
						"visTargTakeDamageHoly"
					]
				}
			]
		},
		// Heal
		{
			level : 3,
			label : 'cleric_heal',
			name : "Heal",
			ranged : true,
			description : "Restores 4 HP, plus an additional 4 if your target's max health is less than 50%",
			ap : 2,
			mp : 2,
			type : Action.Types.holy,
			cooldown : 1,
			charges : 3,
			detrimental : false,
			tags : [
				stdTag.acHeal,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : ".",
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "-4-(ta_HP<(ta_MaxHP/2))*4"
							}
						},
						"visTargHeal"	
					]
				},
			]
		},


		// Paddling
		/* Good for later, since texts already exist
		{
			level : 1,
			label : 'cleric_paddling',
			name : "Paddling",
			description : "Summon a divine paddle to mete out justice on your target. Between 4 and 8 damage based on how many damaging actions your target did to you during the last round.",
			ap : 2,
			mp : 0,
			type : Action.Types.holy,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "4+min(se_TaDamagingReceivedSinceLast,2)*2"
							}
						},
						"visTargTakeDamageHoly"
					]
				},
			]
		},
		*/


	// Tentaclemancer class
		// Tentacle Whip
		{
			level : 1,
			label : 'tentaclemancer_tentacleWhip',
			name : "Tentacle Whip",
			description : "Deals 4 physical damage. 6 if your target is affected by corrupting ooze.",
			ap : 2,
			mp : 0,
			ranged : true,
			type : Action.Types.physical,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "4+ta_Tag_wr_corrupting_ooze*2"
							}
						},
						"visTargTakeDamage"
					]
				},
			]
		},
		// Corrupting ooze
		{
			level : 2,
			label : 'tentaclemancer_corruptingOoze',
			name : "Corrupting Ooze",
			description : "Adds a stack of corrupting ooze on your target. Corrupting ooze lowers their corruption resistance by 1 per stack, and at the start of the affected players turn an additional stack is added. If it goes over 5 stacks, the target gets stunned for 1 turn.",			
			ap : 1,
			mp : 2,
			type : Action.Types.corruption,
			cooldown : 0,
			ranged : true,
			tags : [
				stdTag.acDebuff,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				"corruptingOoze",
				{
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						"visTargTakeDamageCorruption"
					]
				},
			]
		},
		// Siphon Corruption
		{
			level : 3,
			label : 'tentaclemancer_siphonCorruption',
			name : "Siphon Corruption",
			description : "Consumes all charges of corrupting ooze on your target, dealing damage equal to 2x the amount of stacks consumed, and healing you for the same amount.",
			ap : 1,
			mp : 1,
			type : Action.Types.corruption,
			hit_chance : 90,
			cooldown : 3,
			ranged : true,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat([
						{
							type : Condition.Types.hasWrapper,
							data : {
								label : 'corruptingOoze',
								byCaster : true
							}
						}
					]), 
					effects : [
						{
							type : Effect.Types.damage,
							data : { amount : "ta_Wrapper_corruptingOoze*2" }
						},
						{
							targets : [Wrapper.TARGET_CASTER],
							type : Effect.Types.damage,
							data : { amount : "-se_Wrapper_corruptingOoze*2" }	// Sender and target have been reversed
						},
						{
							type : Effect.Types.removeWrapperByLabel,
							data : { label : "corruptingOoze", casterOnly : true }
						},
						"visTargTakeDamageCorruption"
					]
				},
			]
		},



	// Warrior class
		// revenge
		{
			level : 1,
			label : 'warrior_revenge',
			name : "Revenge",
			description : "Deals 2 damage to an opponent plus 2 for every damaging effect you were a victim of since your last turn.",
			ap : 2,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "2+se_damagingReceivedSinceLast*2",
								threatMod : 4,
							}
						},
						"visTargTakeDamage"
					]
				},
			]
		},
		// bolster
		{
			level : 2,
			label : 'warrior_bolster',
			name : "Bolster",
			description : "Reduces your damage taken by 2 for one turn and clears 20% of your arousal. Taking damage while this effect is active grants the caster 1 AP.",
			ap : 1,
			mp : 1,
			cooldown : 2,
			tags : [
				stdTag.acBuff
			],
			detrimental : false,
			target_type : Action.TargetTypes.self,
			show_conditions : ["inCombat"],
			wrappers : [
				{
					duration : 1,
					name : "Bolster",
					icon : "bolster.svg",
					description : "-2 damage taken from all attacks. Taking damage grants you AP.",
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						// Damage taken mod
						{
							type : Effect.Types.globalDamageTakenMod,
							data : {
								amount : -2
							}
						},
						// Arousal
						{
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.addArousal,
							data : {
								amount : -2
							}
						},
						// AP proc
						{
							type : Effect.Types.addAP,
							events : [GameEvent.Types.actionUsed],	// An action hit
							conditions : [
								"targetIsWrapperParent",
								"actionHit",
								"actionDamaging",
							],
							data : {
								amount : 1
							}
						},
						"visTargShield"
					]
				},
			]
		},
		// warrior_viceGrip
		{
			level : 3,
			label : 'warrior_viceGrip',
			name : "Vice Grip",
			description : "Grabs up to two targets and squeezes, dealing 4 damage and preventing them from attacking any other targets for 1 turn, and ends your turn.",
			ap : 3,
			mp : 0,
			cooldown : 2,
			max_targets : 2,
			tags : [
				stdTag.acTaunt,
				stdTag.acDamage,
			],
			detrimental : false,
			target_type : Action.TargetTypes.target,
			show_conditions : ["inCombat"],
			wrappers : [
				{
					duration : 1,
					name : "Squeeze",
					icon : "grab.svg",
					description : "Taunted by %caster.",
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					tags : [],
					effects : [
						// Do damage
						{
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.damage,
							data : {
								amount : 4,
								threatMod : 4
							}
						},
						{
							type : Effect.Types.taunt,
						},
						"visAddTargTakeDamage"
					]
				},
				{
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					target : Wrapper.TARGET_CASTER,
					effects : [
						{
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.endTurn
						},
					]
				}
			]
		},
		



	// Monk class
		// Roundkick
		{
			level : 1,
			label : 'monk_roundKick',
			name : "Round Kick",
			description : "A chi infused kick, dealing 8 physical damage to an enemy. Misses with this ability may allow your target to riposte, doing the same amount of damage back to you.",
			ap : 2,
			mp : 1,
			hit_chance : 70,
			cooldown : 1,
			detrimental : true,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						},
						"visTargTakeDamage"
					]
				}
			],
			riposte : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						},
						"visTargTakeDamage"
					]
				}
			]
		},
		// Disable
		{
			level : 2,
			label : 'monk_disablingStrike',
			name : "Disabling Strike",
			description : "Deals 3 damage and reduces your target's physical proficiency and resistance by 5 for 1 turn. Always hits.",
			ap : 1,
			mp : 1,
			cooldown : 3,
			detrimental : true,
			hit_chance : 9001,
			tags : [
				stdTag.acDamage,
				stdTag.acDebuff,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 3
							}
						},
						"visTargTakeDamage"
					]
				},
				{
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					detrimental : true,
					name : "Disabling Strike",
					description : '-5 Physical Proficiency and Resistance',
					icon : 'weaken.svg',
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					tags : [stdTag.acDebuff],
					effects : [
						{
							type : Effect.Types.bonPhysical,
							data : {
								amount : -5
							},
						},
						{
							type : Effect.Types.svPhysical,
							data : {
								amount : -5
							},
						},
					]
				},
			],
		},
		// Uplifting Strike
		{
			level : 3,
			label : 'monk_upliftingStrike',
			name : "Uplifting Strike",
			description : "Deals 3 damage to an enemy and heals the lowest HP party member for 2 HP per AP spent this turn.",
			ap : 1,
			mp : 2,
			cooldown : 2,
			hit_chance : 80,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 3
							}
						},
						"visTargTakeDamage"
					]
				},
				{
					target: Wrapper.TARGET_SMART_HEAL,
					duration : 0,
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "-se_apSpentThisTurn*2"
							}
						},
						"visTargHeal"
					]
				},
			],
		},

	//

	// NPC CLASSES
	//

	// IMP
		// Special delivery
		{
			label : 'imp_specialDelivery',
			name : "Special Delivery",
			description : "Jump on and try to cream on or in your target, doing 4 corruption damage and reduces the target's corruption resistance by 1 for 2 turns. Stacks up to 3 times.",
			ap : 2,
			mp : 2,
			cooldown : 3,
			detrimental : true,
			type : Action.Types.corruption,
			tags : [
				stdTag.acDamage,
				stdTag.acDebuff
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 2,
					max_stacks : 3,
					name : "Imp Cum",
					icon : "blood.svg",
					description : "Corruption resistance reduced by 1 per stack",
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast"]), 
					effects : [
						{
							conditions : ["eventIsWrapperAdded"],
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						},
						{
							type : Effect.Types.svCorruption,
							data : {
								amount : -1
							}
						},
						"visAddTargTakeDamageCorruption"
					]
				}
			]
		},
		// blow from below
		{
			label : 'imp_blowFromBelow',
			name : "Blow From Below",
			description : "Attacks up to 2 larger targets from below, doing 5 physical damage.",
			ap : 3,
			cooldown : 3,
			max_targets : 2,
			detrimental : true,
			type : Action.Types.physical,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast", "targetTaller"]), 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 5,
							}
						},
						"visTargTakeDamage"
					]
				}
			]
		},
		// Ankle Bite
		{
			label : 'imp_ankleBite',
			name : "Ankle Bite",
			description : "Bite your target's ankles, dealing 4 physical damage. Has a 10% chance to knock your target down for 1 turn.",
			ap : 2,
			mp : 0,
			cooldown : 1,
			detrimental : true,
			type : Action.Types.physical,
			tags : [
				stdTag.acDamage,
				stdTag.acDebuff
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast"]), 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						},
						"visTargTakeDamage"
					]
				},
				{
					label : 'knockdown',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Knockdown",
					icon : "falling.svg",
					detrimental : true,
					description : "Knocked down on your %knockdown",
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotKnockedDown","targetNotBeast","rand10"]), 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.knockdown,
						}
					]
				}
			]
		},
		// Demonic Pinch
		{
			label : 'imp_demonicPinch',
			name : "Demonic Pinch",
			description : "Pinch your target using magic, dealing 2-6 corruption damage.",
			ap : 1,
			mp : 2,
			cooldown : 1,
			detrimental : true,
			type : Action.Types.corruption,
			tags : [
				stdTag.acDamage,
				stdTag.acPainful
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast"]), 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : "1+ceil(random(5))",
							}
						},
						"visTargTakeDamageCorruption"
					]
				},
			]
		},
		


	// WHIPS
		// whip_legLash
		{
			label : 'whip_legLash',
			name : "Leg Lash",
			description : "Whips your target's legs, dealing 4 damage. Has a 20% chance of knocking your target down for 1 round.",
			ap : 2,
			cooldown : 5,
			max_targets : 1,
			detrimental : true,
			type : Action.Types.physical,
			tags : [
				stdTag.acDamage,
				stdTag.acPainful
			],
			add_conditions : ["senderHasWhip"],
			conditions : ["senderHasWhip"],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						},
						"visTargTakeDamage"
					]
				},
				{
					label : 'knockdown',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Knockdown",
					icon : "falling.svg",
					description : "Knocked down on your %knockdown",
					tags : [],
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotKnockedDown","targetNotBeast","rand20"]), 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.knockdown,
						}
					]
				}
			]
		},

		// whip_powerLash
		{
			label : 'whip_powerLash',
			name : "Powerlash",
			description : "Whips your target's genitals unless they're wearing hardened armor, dealing 8 damage and interrupting any charged actions.",
			ap : 2,
			cooldown : 6,
			max_targets : 1,
			detrimental : true,
			type : Action.Types.physical,
			tags : [
				stdTag.acDamage,
				stdTag.acInterrupt,
				stdTag.acPainful
			],
			conditions : ["senderHasWhip"],
			add_conditions : ["senderHasWhip"],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat([
						"targetNotBeast", 
						{
							conditions : [
								"targetLowerbodyNotHard", 
								{
									conditions: [
										"targetUpperbodyNotHard",
										"targetBreasts"
									]
								}
							]
						}
					]),
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 8,
							}
						},
						"interrupt",
						"visTargTakeDamage"
					]
				},
			]
		},
	//

	// Tentacle Fiend

		// Tentacle Milker
		{
			label : 'tentacle_fiend_tentacleMilker',
			name : "Tentacle Milker",
			description : "Latches a sucker to breasts or a penis, dealing 4 corruption damage and healing for the same amount.",
			ap : 2,
			mp : 3,
			cooldown : 3,
			detrimental : true,
			type : Action.Types.corruption,
			tags : [
				stdTag.acDamage,
				stdTag.acSelfHeal
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast", ["targetBreasts", "targetPenis"]]), 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : 4,
								leech : 1
							}
						},
						"visTargTakeDamage"
					]
				}
			]
		},

		// Tentacle Leg Wrap
		{
			label : 'tentacle_fiend_legWrap',
			name : "Leg Wrap",
			description : "Wraps tentacles around your target's legs, knocking them down for 1 turn.",
			ap : 1,
			cooldown : 6,
			detrimental : true,
			tags : [
				stdTag.acDebuff,
				stdTag.acNpcImportant
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					label : 'legWrap',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Leg Wrap",
					icon : "daemon-pull.svg",
					description : "Knocked down on your %knockdown, tentacles spreading your legs",
					trigger_immediate : true,
					tags : [stdTag.wrLegsSpread],
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotKnockedDown","targetNotBeast",
						{type:Condition.Types.apValue, data:{amount:2}, caster:true}
					]), 
					stay_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	],
					effects : [
						{
							type : Effect.Types.knockdown,
						},
						"visAddTargTakeDamage"
					]
				}
			]
		},

		// Injectacle
		{
			label : 'tentacle_fiend_injectacle',
			name : "Injectacle",
			description : "Injects a player not wearing lowerbody armor with tentacle goo, doing 4 corruption damage immediately and leaving tentacle goo behind. Tentacle goo deals 1 at the start of their turn in and lowers their corruption resist by 1 for 3 turns.",
			ap : 1,
			mp : 3,
			cooldown : 3,
			detrimental : true,
			type : Action.Types.corruption,
			tags : [
				stdTag.acDebuff,
				stdTag.acDamage
			],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					label : 'tentacleGoo',
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Tentacle Goo",
					icon : "death-juice.svg",
					description : "Injectected with tentacle goo, taking corruption damage at the start of your turn",
					detrimental : true,
					tags : [],
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast","targetNoLowerbody"]), 
					effects : [
						{
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.damage,
							data : {amount:4}
						},
						{
							type : Effect.Types.damage,
							data : {amount:1}
						},
						{
							type : Effect.Types.svCorruption,
							data : {amount:-1}
						},
						"visAddTargTakeDamageCorruption"
					]
				}
			]
		},

		// Tentatug
		{
			label : 'tentacle_fiend_tentatug',
			name : "Tentatug",
			description : "Tugs as your target's lowerbody armor, doing 2 cloth damage. Has a 30% chance to pull the piece off.",
			ap : 3,
			cooldown : 2,
			detrimental : true,
			type : Action.Types.physical,
			tags : [],
			show_conditions : ["inCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					tags : [],
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	].concat(["targetNotBeast","targetWearsLowerbody"]), 
					effects : [
						{
							type : Effect.Types.damageArmor,
							data : {amount:2,slots:Asset.Slots.lowerbody}
						},
						{
							type : Effect.Types.disrobe,
							data : {slots:Asset.Slots.lowerbody},
							conditions : ["rand30"]
						},
						"visTargTakeDamage"
					]
				}
			]
		},


		


	//



	// Consumables
		// Minor repair kit
		{
			label : 'minorRepairKit',
			name : "Minor Repair",
			description : "Restores 25% of a damaged item's durability (min 5).",
			ap : 0,
			cooldown : 0,
			max_targets : 1,
			detrimental : false,
			type : Action.Types.physical,
			tags : [],
			no_use_text : true,
			no_action_selector : true,
			conditions : ["targetHasRepairable"],
			show_conditions : ["notInCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.repair,
							data : {
								amount : 0.25,
								multiplier : true,
								min : 5
							}
						},
					]
				},
			]
		},

		// Repair kit
		{
			label : 'repairKit',
			name : "Armor Repair",
			description : "Restores 50% of a damaged item's durability (min 10).",
			ap : 0,
			cooldown : 0,
			detrimental : false,
			tags : [],
			no_use_text : true,
			no_action_selector : true,
			conditions : ["targetHasRepairable"],
			show_conditions : ["notInCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.repair,
							data : {
								amount : 0.50,
								multiplier : true,
								min : 10
							}
						},
					]
				},
			]
		},

		// Major repair kit
		{
			label : 'majorRepairKit',
			name : "Major Repair",
			description : "Fully restores a damaged item's durability.",
			ap : 0,
			cooldown : 0,
			detrimental : false,
			tags : [],
			no_use_text : true,
			no_action_selector : true,
			conditions : ["targetHasRepairable"],
			show_conditions : ["notInCombat"],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.repair,
							data : {
								amount : 1,
								multiplier : true,
							}
						},
					]
				},
			]
		},



		// Minor health potion
		{
			label : 'minorHealingPotion',
			name : "Minor Healing Potion",
			description : "Restores 8 HP to the user.",
			ap : 1,
			cooldown : 0,
			detrimental : false,
			tags : [
				stdTag.acHeal,
				stdTag.acItem
			],
			target_type : Action.TargetTypes.self,
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -8,
							}
						},
						"visTargHeal"
					]
				},
			]
		},
		// Healing potion
		{
			label : 'healingPotion',
			name : "Healing Potion",
			description : "Restores 15 HP to the user.",
			ap : 1,
			cooldown : 0,
			detrimental : false,
			tags : [
				stdTag.acHeal,
				stdTag.acItem
			],
			target_type : Action.TargetTypes.self,
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -15,
							}
						},
						"visTargHeal"
					]
				},
			]
		},
		// Major Healing potion
		{
			label : 'majorHealingPotion',
			name : "Major Healing Potion",
			description : "Restores 30 HP to the user.",
			ap : 1,
			cooldown : 0,
			detrimental : false,
			tags : [
				stdTag.acHeal,
				stdTag.acItem
			],
			target_type : Action.TargetTypes.self,
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -30,
							}
						},
						"visTargHeal"
					]
				},
			]
		},


		// Mana potion
		{
			label : 'manaPotion',
			name : "Mana Potion",
			description : "Restores 5 mana to the user.",
			ap : 1,
			cooldown : 0,
			detrimental : false,
			tags : [
				stdTag.acManaHeal,
				stdTag.acItem
			],
			target_type : Action.TargetTypes.self,
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.addMP,
							data : {
								amount : 5,
							}
						},
						"visTargHeal"
					]
				},
			]
		},
		// Major mana potion
		{
			label : 'majorManaPotion',
			name : "Major Mana Potion",
			description : "Restores 10 mana to the user.",
			ap : 1,
			cooldown : 0,
			detrimental : false,
			tags : [
				stdTag.acManaHeal,
				stdTag.acItem
			],
			target_type : Action.TargetTypes.self,
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						{
							type : Effect.Types.addMP,
							data : {
								amount : 10,
							}
						},
						"visTargHeal"
					]
				},
			]
		},


	// Debugging
		{
			level : 1,
			label : 'debug_charged_spell',
			name : "1t Charged",
			ranged : true,
			description : "Deals 10 holy damage.",
			ap : 2,
			mp : 3,
			type : Action.Types.holy,
			cooldown : 1,
			cast_time : 1,
			tags : [
				stdTag.acDamage,
			],
			wrappers : [
				{
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : ".",
					detrimental : false,
					add_conditions : [ 		"targetAlive", 		"senderNotDead", 		"targetNotDead" 	], 
					effects : [
						{
							type : Effect.Types.damage,
							data : {
								amount : -10
							}
						},
						"visTargTakeDamage"	
					]
				},
			]
		},
];


function getByLabel( label ){
	for( let asset of out ){
		if( asset.label === label )
			return asset;
	}
	return false;
}

export {getByLabel};
export default out;