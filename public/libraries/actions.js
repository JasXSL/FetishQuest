import Action from '../classes/Action.js';
import { Wrapper, Effect } from '../classes/EffectSys.js';
import conditions from './conditions.js';
import effects from './effects.js';
import stdTag from './stdTag.js';
import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import wrappers from './wrappers.js';
import Asset from '../classes/Asset.js';

const cAND = (...args) => ConditionPackage.buildAND(...args);
const cOR =  (...args) => ConditionPackage.buildOR(...args);



const out = [
	// STD

	// Attack
	new Action({
		name : "Attack",
		description : "Deals 4 physical damage. Shares cooldown with Arouse on successful attacks.",
		ap : 2,
		cooldown : 1,
		label : 'stdAttack',
		show_conditions : [conditions.inCombat],
		tags : [
			stdTag.acDamage,
			stdTag.acPainful
		],
		wrappers : [
			new Wrapper({
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : conditions.collections.std, 
				stay_conditions : conditions.collections.std,
				effects : [
					new Effect({
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					}),
					new Effect({
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.addActionCharges,
						data : {
							actions : 'stdArouse',
							amount : -1
						}
					}),
					effects.visTargTakeDamage
				]
			})
		]
	}),
	// Arouse
	new Action({
		name : "Arouse",
		description : "Deals 4 corruption damage. Shares cooldown with Attack on successful attacks.",
		ap : 2,
		cooldown : 1,
		label : 'stdArouse',
		type : Action.Types.corruption,
		show_conditions : [conditions.inCombat],
		tags : [
			stdTag.acDamage,
			stdTag.acArousing
		],
		wrappers : [
			new Wrapper({
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : conditions.collections.std, 
				stay_conditions : conditions.collections.std,
				effects : [
					new Effect({
						type : Effect.Types.damage,
						data : {
							amount : 4
						}
					}),
					new Effect({
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.addActionCharges,
						data : {
							actions : 'stdAttack',
							amount : -1
						}
					}),
					effects.visTargTakeDamageCorruption
				]
			})
		]
	}),
	// End Turn
	new Action({
		label : "stdEndTurn",
		name : "End Turn",
		description : "End your turn.",
		ap : 0,
		cooldown : 0,
		detrimental : false,
		hidden : true,
		allow_when_charging : true,
		show_conditions : [conditions.inCombat],
		wrappers : [
			new Wrapper({
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [], 
				stay_conditions : [],
				effects : [
					new Effect({
						type : Effect.Types.endTurn,
					})
				]
			})
		]
	}),
	// Escape
	new Action({
		label : "stdEscape",
		name : "Escape",
		description : "Flee from combat.",
		ap : 0,
		cooldown : 1,
		detrimental : false,
		hidden : true,
		allow_when_charging : true,
		wrappers : [
			new Wrapper({
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : [], 
				stay_conditions : [],
				effects : [
					new Effect({
						type : Effect.Types.flee,
					})
				]
			})
		]
	}),

	// Dom punishment
	new Action({
		label : "stdPunishDom",
		name : "Punish Dominant",
		description : "Use a dominant punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : [conditions.notInCombat, conditions.senderHasNotPunished],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			new Wrapper({
				add_conditions : [conditions.targetDead, conditions.senderNotDead, conditions.targetNotFriendly],
				effects : [
					new Effect({
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					}),
					effects.visTargTakeDamageCorruption
				],
				detrimental : false,
			})
		]
	}),
	new Action({
		label : "stdPunishSub",
		name : "Punish Submissive",
		description : "Use a submissive punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : [conditions.notInCombat, conditions.senderHasNotPunished],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			new Wrapper({
				add_conditions : [conditions.targetDead, conditions.senderNotDead, conditions.targetNotFriendly],
				effects : [
					new Effect({
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					}),
					effects.visTargTakeDamageCorruption
				],
				detrimental : false,
			})
		]
	}),
	new Action({
		label : "stdPunishSad",
		name : "Punish Sadistic",
		description : "Use a sadistic punishment on a defeated enemy.",
		ap : 0,
		cooldown : 0,
		semi_hidden : true,
		detrimental : false,
		allow_when_charging : true,
		show_conditions : [conditions.notInCombat, conditions.senderHasNotPunished],
		hide_if_no_targets: true,
		wrappers : [
			// needs at least 1 wrapper for actions to work
			new Wrapper({
				add_conditions : [conditions.targetDead, conditions.senderNotDead, conditions.targetNotFriendly],
				effects : [
					new Effect({
						targets : [Wrapper.TARGET_CASTER],
						type : Effect.Types.punishmentUsed,
					}),
					effects.visTargTakeDamage
				],
				detrimental : false,
			})
		]
	}),











	// GENERIC CLASS SPELLS
	// lowBlow
	new Action({
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
		show_conditions : [conditions.inCombat],
		wrappers : [
			new Wrapper({
				target: Wrapper.TARGET_AUTO,
				duration : 0,
				name : "",
				icon : "",
				description : "",
				detrimental : true,
				add_conditions : conditions.collections.std, 
				effects : [
					new Effect({
						type : Effect.Types.damage,
						data : {
							amount : 5,
						}
					}),
					new Effect({
						type : Effect.Types.interrupt,
					}),
					effects.visTargTakeDamage
				]
			}),
		]
	}),



	// Elementalist class
		// iceBlast
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 6
							}
						}),
						new Effect({
							type : Effect.Types.addAP,
							data : {
								amount : -1
							},
							conditions : [
								conditions.targetSoaked
							]
						}),
						effects.visTargTakeDamageElemental
					]
				}),
			]
		}),
		// healingSurge
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : false,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -8
							}
						}),
						effects.visTargHeal
					]
				}),
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Healing Surge",
					icon : "wave-crest.svg",
					description : "Healing at the start of each turn.",
					detrimental : false,
					tags : [],
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -2
							}
						})
					]
				}),

			]
		}),
		// waterSpout
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					duration : 1,
					name : "Water Spout",
					icon : "droplet-splash.svg",
					description : "Actions will debuff the target and restore MP to the caster.",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.runWrappers,
							events : [GameEvent.Types.actionUsed],
							conditions : [conditions.senderIsWrapperParent, conditions.actionNotHidden],
							data : {
								wrappers : [
									wrappers.soak
								]
							},
							label : 'elementalistWaterSpout_proc'
						}),
						new Effect({
							targets : [Wrapper.TARGET_CASTER],
							type : Effect.Types.addMP,
							events : [GameEvent.Types.actionUsed],
							conditions : [conditions.senderIsWrapperParent, conditions.actionNotHidden],
							data : {
								amount : 1
							}
						}),
						
					]
				}),
				new Wrapper({
					detrimental : false,
					add_conditions : conditions.collections.std,
					effects:[
						effects.visTargTakeDamageElemental
					]
				})
			]
		}),
		// Later: Earth pillar

	// Rogue class
		// Exploit
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "8-ta_lowerbody*2-ta_upperbody*2"
							}
						}),
						effects.visTargTakeDamage
					]
				}),
			]
		}),
		// Corrupting Poison
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					effects : [
						effects.visTargTakeDamage
					]
				}),
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Corrupting Poison",
					icon : "poison-bottle.svg",
					description : "Taking corruption damage each turn. Corruption resist reduced.",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 2,
								type : Action.Types.corruption
							}
						}),
						new Effect({
							type : Effect.Types.svCorruption,
							data : {
								amount : -4
							},
						}),
					]
				}),
			]
		}),
		// Dirty Tricks
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						}),
						new Effect({
							type : Effect.Types.disrobe,
							data : {
								slots : [Asset.Slots.lowerbody, Asset.Slots.upperbody],
								numSlots : 1,
							},
							conditions : [new Condition({
								type : Condition.Types.rng,
								data : {
									chance : "5*(se_BonCorruption-ta_SvCorruption)"
								}
							})]
						}),
						effects.visTargTakeDamageCorruption
					]
				}),
			]
		}),


	// Cleric class
		// Smite
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "4*(1+min(ta_damageDoneSinceLastCorruption*0.1,3.75))"
							}
						}),
						effects.visTargTakeDamageHoly
					]
				}),
			]
		}),

		// Chastise
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Chastise",
					icon : "holy-hand-grenade.svg",
					description : "Using damaging actions deals 3 holy damage back to the caster. Damage done reduced by 1.",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							events : [GameEvent.Types.actionUsed],
							conditions : [conditions.senderIsWrapperParent, conditions.actionNotHidden, conditions.actionDamaging],
							data : {
								amount : 3,
							},
							label : 'cleric_chastise_proc'
						}),
						new Effect({
							type : Effect.Types.globalDamageDoneMod,
							data : {
								amount : -1,
							},
						}),
					]
				}),
				new Wrapper({
					add_conditions : conditions.collections.std, 
					detrimental : true,
					effects : [
						effects.visTargTakeDamageHoly
					]
				})
			]
		}),
		// Heal
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : ".",
					detrimental : false,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "-4-(ta_HP<(ta_MaxHP/2))*4"
							}
						}),
						effects.visTargHeal	
					]
				}),
			]
		}),


		// Paddling
		/* Good for later, since texts already exist
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "4+min(se_TaDamagingReceivedSinceLast,2)*2"
							}
						}),
						effects.visTargTakeDamageHoly
					]
				}),
			]
		}),
		*/


	// Tentaclemancer class
		// Tentacle Whip
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "4+ta_Tag_wr_corrupting_ooze*2"
							}
						}),
						effects.visTargTakeDamage
					]
				}),
			]
		}),
		// Corrupting ooze
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				wrappers.corruptingOoze,
				new Wrapper({
					add_conditions : conditions.collections.std, 
					effects : [
						effects.visTargTakeDamageCorruption
					]
				}),
			]
		}),
		// Siphon Corruption
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					add_conditions : conditions.collections.std.concat([
						new Condition({
							type : Condition.Types.hasWrapper,
							data : {
								label : 'corruptingOoze',
								byCaster : true
							}
						})
					]), 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : { amount : "ta_Wrapper_corruptingOoze*2" }
						}),
						new Effect({
							targets : [Wrapper.TARGET_CASTER],
							type : Effect.Types.damage,
							data : { amount : "-se_Wrapper_corruptingOoze*2" }	// Sender and target have been reversed
						}),
						new Effect({
							type : Effect.Types.removeWrapperByLabel,
							data : { label : "corruptingOoze", casterOnly : true }
						}),
						effects.visTargTakeDamageCorruption
					]
				}),
			]
		}),



	// Warrior class
		// revenge
		new Action({
			level : 1,
			label : 'warrior_revenge',
			name : "Revenge",
			description : "Deals 2 damage to an opponent plus 2 for every damaging effect you were a victim of since your last turn.",
			ap : 2,
			cooldown : 1,
			tags : [
				stdTag.acDamage,
			],
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "2+se_damagingReceivedSinceLast*2",
								threatMod : 4,
							}
						}),
						effects.visTargTakeDamage
					]
				}),
			]
		}),
		// bolster
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					duration : 1,
					name : "Bolster",
					icon : "bolster.svg",
					description : "-2 damage taken from all attacks. Taking damage grants you AP.",
					detrimental : false,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						// Damage taken mod
						new Effect({
							type : Effect.Types.globalDamageTakenMod,
							data : {
								amount : -2
							}
						}),
						// Arousal
						new Effect({
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.addArousal,
							data : {
								amount : -2
							}
						}),
						// AP proc
						new Effect({
							type : Effect.Types.addAP,
							events : [GameEvent.Types.actionUsed],	// An action hit
							conditions : [
								conditions.targetIsWrapperParent,
								conditions.actionHit,
								conditions.actionDamaging,
							],
							data : {
								amount : 1
							}
						}),
						effects.visTargShield
					]
				}),
			]
		}),
		// warrior_viceGrip
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					duration : 1,
					name : "Squeeze",
					icon : "grab.svg",
					description : "Taunted by %caster.",
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					tags : [],
					effects : [
						// Do damage
						new Effect({
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.damage,
							data : {
								amount : 4,
								threatMod : 4
							}
						}),
						new Effect({
							type : Effect.Types.taunt,
						}),
						effects.visAddTargTakeDamage
					]
				}),
				new Wrapper({
					detrimental : false,
					add_conditions : conditions.collections.std,
					target : Wrapper.TARGET_CASTER,
					effects : [
						new Effect({
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.endTurn
						}),
					]
				})
			]
		}),
		



	// Monk class
		// Roundkick
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						}),
						effects.visTargTakeDamage
					]
				})
			],
			riposte : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 8
							}
						}),
						effects.visTargTakeDamage
					]
				})
			]
		}),
		// Disable
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 3
							}
						}),
						effects.visTargTakeDamage
					]
				}),
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					detrimental : true,
					name : "Disabling Strike",
					description : '-5 Physical Proficiency and Resistance',
					icon : 'weaken.svg',
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					tags : [stdTag.acDebuff],
					effects : [
						new Effect({
							type : Effect.Types.bonPhysical,
							data : {
								amount : -5
							},
						}),
						new Effect({
							type : Effect.Types.svPhysical,
							data : {
								amount : -5
							},
						}),
					]
				}),
			],
		}),
		// Uplifting Strike
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 3
							}
						}),
						effects.visTargTakeDamage
					]
				}),
				new Wrapper({
					target: Wrapper.TARGET_SMART_HEAL,
					duration : 0,
					detrimental : false,
					add_conditions : conditions.collections.std, 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "-se_apSpentThisTurn*2"
							}
						}),
						effects.visTargHeal
					]
				}),
			],
		}),

	//

	// NPC CLASSES
	//

	// IMP
		// Special delivery
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 2,
					max_stacks : 3,
					name : "Imp Cum",
					icon : "blood.svg",
					description : "Corruption resistance reduced by 1 per stack",
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast]), 
					effects : [
						new Effect({
							conditions : [conditions.eventIsWrapperAdded],
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						}),
						new Effect({
							type : Effect.Types.svCorruption,
							data : {
								amount : -1
							}
						}),
						effects.visAddTargTakeDamageCorruption
					]
				})
			]
		}),
		// blow from below
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast, conditions.targetTaller]), 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 5,
							}
						}),
						effects.visTargTakeDamage
					]
				})
			]
		}),
		// Ankle Bite
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast]), 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						}),
						effects.visTargTakeDamage
					]
				}),
				new Wrapper({
					label : 'knockdown',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Knockdown",
					icon : "falling.svg",
					detrimental : true,
					description : "Knocked down on your %knockdown",
					add_conditions : conditions.collections.std.concat([conditions.targetNotKnockedDown,conditions.targetNotBeast,conditions.rand10]), 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.knockdown,
						})
					]
				})
			]
		}),
		// Demonic Pinch
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast]), 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : "1+ceil(random(5))",
							}
						}),
						effects.visTargTakeDamageCorruption
					]
				}),
			]
		}),
		


	// WHIPS
		// whip_legLash
		new Action({
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
			add_conditions : [conditions.senderHasWhip],
			conditions : [conditions.senderHasWhip],
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 4,
							}
						}),
						effects.visTargTakeDamage
					]
				}),
				new Wrapper({
					label : 'knockdown',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Knockdown",
					icon : "falling.svg",
					description : "Knocked down on your %knockdown",
					tags : [],
					add_conditions : conditions.collections.std.concat([conditions.targetNotKnockedDown,conditions.targetNotBeast,conditions.rand20]), 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.knockdown,
						})
					]
				})
			]
		}),

		// whip_powerLash
		new Action({
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
			conditions : [conditions.senderHasWhip],
			add_conditions : [conditions.senderHasWhip],
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					add_conditions : conditions.collections.std.concat([
						conditions.targetNotBeast, 
						cOR(
							conditions.targetLowerbodyNotHard, 
							cAND(
								conditions.targetUpperbodyNotHard,
								conditions.targetBreasts
							)
						),
					]),
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 8,
							}
						}),
						effects.interrupt,
						effects.visTargTakeDamage
					]
				}),
			]
		}),
	//

	// Tentacle Fiend

		// Tentacle Milker
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : "",
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast, [conditions.targetBreasts, conditions.targetPenis]]), 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : 4,
								leech : 1
							}
						}),
						effects.visTargTakeDamage
					]
				})
			]
		}),

		// Tentacle Leg Wrap
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					label : 'legWrap',
					target: Wrapper.TARGET_AUTO,
					duration : 1,
					name : "Leg Wrap",
					icon : "daemon-pull.svg",
					description : "Knocked down on your %knockdown, tentacles spreading your legs",
					trigger_immediate : true,
					tags : [stdTag.wrLegsSpread],
					add_conditions : conditions.collections.std.concat([conditions.targetNotKnockedDown,conditions.targetNotBeast,
						new Condition({type:Condition.Types.apValue, data:{amount:2}, caster:true})
					]), 
					stay_conditions : conditions.collections.std,
					effects : [
						new Effect({
							type : Effect.Types.knockdown,
						}),
						effects.visAddTargTakeDamage
					]
				})
			]
		}),

		// Injectacle
		new Action({
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
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					label : 'tentacleGoo',
					target: Wrapper.TARGET_AUTO,
					duration : 3,
					name : "Tentacle Goo",
					icon : "death-juice.svg",
					description : "Injectected with tentacle goo, taking corruption damage at the start of your turn",
					detrimental : true,
					tags : [],
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast,conditions.targetNoLowerbody]), 
					effects : [
						new Effect({
							events : [GameEvent.Types.internalWrapperAdded],
							type : Effect.Types.damage,
							data : {amount:4}
						}),
						new Effect({
							type : Effect.Types.damage,
							data : {amount:1}
						}),
						new Effect({
							type : Effect.Types.svCorruption,
							data : {amount:-1}
						}),
						effects.visAddTargTakeDamageCorruption
					]
				})
			]
		}),

		// Tentatug
		new Action({
			label : 'tentacle_fiend_tentatug',
			name : "Tentatug",
			description : "Tugs as your target's lowerbody armor, doing 2 cloth damage. Has a 30% chance to pull the piece off.",
			ap : 3,
			cooldown : 2,
			detrimental : true,
			type : Action.Types.physical,
			tags : [],
			show_conditions : [conditions.inCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					detrimental : true,
					tags : [],
					add_conditions : conditions.collections.std.concat([conditions.targetNotBeast,conditions.targetWearsLowerbody]), 
					effects : [
						new Effect({
							type : Effect.Types.damageArmor,
							data : {amount:2,slots:Asset.Slots.lowerbody}
						}),
						new Effect({
							type : Effect.Types.disrobe,
							data : {slots:Asset.Slots.lowerbody},
							conditions : [conditions.rand30]
						}),
						effects.visTargTakeDamage
					]
				})
			]
		}),


		


	//



	// Consumables
		// Minor repair kit
		new Action({
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
			conditions : [conditions.targetHasRepairable],
			show_conditions : [conditions.notInCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.repair,
							data : {
								amount : 0.25,
								multiplier : true,
								min : 5
							}
						}),
					]
				}),
			]
		}),

		// Repair kit
		new Action({
			label : 'repairKit',
			name : "Armor Repair",
			description : "Restores 50% of a damaged item's durability (min 10).",
			ap : 0,
			cooldown : 0,
			detrimental : false,
			tags : [],
			no_use_text : true,
			no_action_selector : true,
			conditions : [conditions.targetHasRepairable],
			show_conditions : [conditions.notInCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.repair,
							data : {
								amount : 0.50,
								multiplier : true,
								min : 10
							}
						}),
					]
				}),
			]
		}),

		// Major repair kit
		new Action({
			label : 'majorRepairKit',
			name : "Major Repair",
			description : "Fully restores a damaged item's durability.",
			ap : 0,
			cooldown : 0,
			detrimental : false,
			tags : [],
			no_use_text : true,
			no_action_selector : true,
			conditions : [conditions.targetHasRepairable],
			show_conditions : [conditions.notInCombat],
			wrappers : [
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.repair,
							data : {
								amount : 1,
								multiplier : true,
							}
						}),
					]
				}),
			]
		}),



		// Minor health potion
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -8,
							}
						}),
						effects.visTargHeal
					]
				}),
			]
		}),
		// Healing potion
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -15,
							}
						}),
						effects.visTargHeal
					]
				}),
			]
		}),
		// Major Healing potion
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -30,
							}
						}),
						effects.visTargHeal
					]
				}),
			]
		}),


		// Mana potion
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.addMP,
							data : {
								amount : 5,
							}
						}),
						effects.visTargHeal
					]
				}),
			]
		}),
		// Major mana potion
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					effects : [
						new Effect({
							type : Effect.Types.addMP,
							data : {
								amount : 10,
							}
						}),
						effects.visTargHeal
					]
				}),
			]
		}),


	// Debugging
		new Action({
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
				new Wrapper({
					target: Wrapper.TARGET_AUTO,
					duration : 0,
					name : "",
					icon : "",
					description : ".",
					detrimental : false,
					add_conditions : conditions.collections.std, 
					effects : [
						new Effect({
							type : Effect.Types.damage,
							data : {
								amount : -10
							}
						}),
						effects.visTargTakeDamage	
					]
				}),
			]
		}),
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