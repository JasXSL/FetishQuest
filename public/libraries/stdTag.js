// This is a library of standard tags used
export default {
	dead : 'g_dead',

	// Common status effects
	nude : 'pl_nude',

	// Commonly used for players, prepended by pl_
	// These can also be accompanied by a size, either small, big, huge. Ex big_breasts, huge_penis etc
	penis : 'pl_penis',		
	plBigPenis : 'pl_big_penis',		
	vagina : 'pl_vagina',
	breasts : 'pl_breasts',
	plBigBreasts : 'pl_big_breasts',
	butt : 'pl_butt',
	plBigButt : 'pl_big_butt',
	
	// Species tags for players
	plFurry : 'pl_furry',			// Player has fur
	plScaly : 'pl_scaly',			// Player has scales
	plTail : 'pl_tail',				// Player has tail
	plMuscular : 'pl_muscular',		// Player is muscular
	plHair : 'pl_hair',				// Player has hair
	plLongHair : 'pl_long_hair',	// Player has long hair
	plFangs : 'pl_fangs',			// Player has fangs
	plBeast : 'pl_beast',			// non-humanoid
	plTargetBeast : 'pl_target_beast',	// Only considered beast as a target, not sender. Use plBeast alongside this one.
	plTentacles : 'pl_tentacles',
	plTendrils : 'pl_tendrils',		// These are significantly smaller than tentacles. A single tendril generally won't be able to knock someone down, and is more tickly than thrusty.
	plCocktacle : 'pl_cocktacle',	// Player has at least 1 cock tipped tentacle
	plHorns : 'pl_horns',
	plHorn : 'pl_horn',
	plEars : 'pl_ears',
	plLongTail : 'pl_long_tail',
	plCircumcised : 'pl_circumcised',
	plImmobile : 'pl_immobile',		// Immobile
	plElectric : "pl_electric",
	plClaws : 'pl_claws',
	plTongue : 'pl_tongue',
	plNose : 'pl_nose',
	plEel : 'pl_eel',
	plFeathers : 'pl_feathers',
	plBeak : 'pl_beak',
	plOoze : 'pl_ooze',
	plSlimy : 'pl_slimy',
	plWorm : 'pl_worm',
	plLeech : 'pl_leech',
	plRodent : 'pl_rodent',
	plLagomorph : 'pl_lagomorph',
	

	plDemon : 'pl_demon',
	plUndead : 'pl_undead',
	plRattani : 'pl_rattani',
	

	plFeline : 'pl_feline',					// Cats
	plCanine : 'pl_canine',					// Wolves too for ease of use
	plVulpine : 'pl_vulpine',				// Foxes
	plMustelid : 'pl_mustelid',				// Weasels, otters go in here too
	plEquine : 'pl_equine',					// Horses, zebras etc
	plBovine : 'pl_bovine',					// Cows and such
	plAvian : 'pl_avian',					// Birbs
	plUrsine : 'pl_ursine',					// Bears
	plCervine : 'pl_cervine',				// Deer
	plSuine : 'pl_suine',					// pig basically
	plRodent : 'pl_rodent',					// Guinea pigs, hamsters etc go here too
	

	// NPC behavior
	plIgnoreAggro : 'pl_ignore_aggro',		// make a player only attack randomly 
	plNoGrapple : 'pl_no_grapple',				// Doesn't use grapple
	plAlwaysGrapple : 'pl_always_grapple',		// Always grappled when possible
	plNoFetish : 'pl_no_fetish',				// Don't generate fetishes on this player

	// Used for gameplay
	gpBoss : 'gp_boss',				// used on boss battles
	gpDisableArousal : 'gp_no_arousal',			// Prevents arousal
	gpDisableMomentum : 'gp_no_ap',				// Prevents you from getting momentum
	gpDisableMP : 'gp_no_mp',					// Prevents the use of actions that cost more than 0 MP
	gpDisableHP : 'gp_no_hp',					// Prevents taking damage and drawing HP
	gpDisableVictoryCondition : 'gp_no_victory_condition',		// Disregards this one's death status when it comes to calculating if a battle is over
	gpInvisible : 'gp_invisible',				// Doesn't draw in the UI and can't be targeted.
	gpSkipTurns : 'gp_skip_turns',				// Automatically skip turns
	gpNoBondageTarget : 'gp_no_bondage_targ',	// Can't be targeted by bondage device
	
	

	// Player behavior tags
	plDishonorable : "pl_dishonorable",


	// Action tags
	acBuff : 'ac_buff',
	acDebuff : 'ac_debuff',
	acHeal : 'ac_heal',
	acDamage : 'ac_damage',
	acPainful : 'ac_painful',
	acArousing : 'ac_arousing',

	acNpcImportant : 'ac_npc_important',			// NPCs will ALWAYS attack if an important action is available.
	acNpcFirst : 'ac_npc_first',					// NPCs will always this this first, but only when they'd normally attack. acNpcImportant goes first
	acNpcImportantLast : 'ac_npc_important_last',	// NPCs will try to cast this at the end of their turn if possible

	acNpcNoAttack : 'ac_npc_no_attack',					// Pass your turn if this is set
	acInterrupt : 'ac_interrupt',
	acItem : 'ac_item',							// Used an inventory item
	acManaHeal : 'ac_mana_heal',				// Restores mana
	acSelfHeal : 'ac_self_heal',				// Heals yourself
	acTaunt : 'ac_taunt',						// This is a taunt
	acFood : 'ac_food',							// 
	acManaDamage : 'ac_mana_damage',
	acDrink : 'ac_drink',
	acNpcIgnoreAggro : 'ac_npc_ignore_aggro',
	acFlavor : 'ac_flavor',						// These are flavor actions the AI can use at random
	acIce : 'ac_ice',
	acHoly : 'ac_holy',
	acFire : 'ac_fire',
	acAir : 'ac_air',
	acWet : 'ac_wet',
	acEarth : 'ac_earth',
	acElectric : 'ac_electric',
	acPotion : 'ac_potion',
	acLifesteal  : 'ac_lifesteal',
	

	// Common asset tags. These are appended with _<slot> ex as_tight_upperBody
	asUpperBody : 'as_upperBody',	// slots like these are automatically added while you're wearing items in those slots
	asLowerBody : 'as_lowerBody',

	asHard : 'as_hard',			// Hardened clothes, preventing gropes etc on top of the item
	asTight : 'as_tight',			// Tight clothing revealing what's underneath

	asSkirt : 'as_skirt',
	asThong : 'as_thong',
	asGroinSemiExposed : 'as_groin_semi_exposed',		// Groin semi exposed. Like if your thong leaves part of your mound or balls exposed
	asShiny : 'as_shiny',
	asPants : 'as_pants',					// Has legs attached to it, aka not briefs
	asStockings : 'as_stockings',
	asSlingBikini : 'as_sling_bikini',
	asShirt :'as_shirt',
	asStretchy : 'as_stretchy',
	asJeans : 'as_jeans',
	asPlate : 'as_plate',			// Plate armor
	asRobe : 'as_robe',
	asCrotchFlap : 'as_crotch_flap',		// There's a piece of cloth hanging in front of your crotch
	asButtFlap : 'as_butt_flap',			// There's a piece of cloth hanging in front of your butt
	asBodysuit : 'as_bodysuit',				// Designated for any piece of outfit that can't be "pulled down"
	asWaistband : 'as_waistband',			// Outfit has "waistband"
	asReagent : 'as_reagent',
	asCurrency : 'as_currency',
	asCanPullDown : 'as_can_pull_down',		// Can pull the garment down. Such as a strapless top or a thong 
	asCanPullUp : 'as_can_pull_up',			// Can pull the garment up. Such as a tube top, bra, skirt, or loincloth. 
	asWraps : 'as_wraps',					// Made by wrapping a long strip of the material around the area 
	asCleavage : 'as_cleavage',				// Pushes breasts together in a way where at least the top of the breasts are exposed
	asUnderboob : 'as_underboob',			// Bottom of breasts (if applicable) exposed
	asSideboob : 'as_sideboob',				// Sides of breasts (if applicable) exposed
	asExposedUpperBack : 'as_exposed_upper_back',		// Majority of your upper back is exposed
	asExposedLowerBack : 'as_exposed_lower_back',		// Majority of your lower back is exposed
	asExposedStomach : 'as_exposed_stomach',		// The majority of your stomach is exposed
	asHighRiding : 'as_high_riding',		// High riding things like the bodysuits or hip hugging bikini bottoms
	asGloves : 'as_gloves',
	asBoots : 'as_boots',
	asStockings : 'as_stockings',
	asBelt : 'as_belt',
	asNipplePiercings : 'as_nipple_piercings',
	asRingGag : 'as_ring_gag',
	asCollar : 'as_collar',
	asCockRing : 'as_cock_ring',
	asStrapon : 'as_strapon',
	asStealable : 'as_stealable',			// Can be stolen on wipe
	

	asLeather : 'as_leather',
	asCloth : 'as_cloth',
	asMail : 'as_mail',
	asPlate : 'as_plate',
	asCotton : 'as_cotton',
	asSilk : 'as_silk',
	asMageweave : 'as_mageweave',
	asShadowcloth : 'as_shadowcloth',
	asRawhide : 'as_rawhide',
	asMetal : 'as_metal',
	asSteel : 'as_steel',
	asCopper : 'as_copper',
	asMithril : 'as_mithril',
	asSoftsilver : 'as_softsilver',

	
	// Props
	asWhip : 'as_whip',
	asDildoSpear : 'as_dildo_spear',
	asStrapon : 'as_strapon',
	asPaddle : 'as_paddle',
	asRidingCrop : 'as_riding_crop',
	

	// Wrapper tags that are auto generated
	wrDuration : 'as_duration',		// Duration ability
	wrDetrimental : 'as_detrimental',	
	wrKnockdown : 'wr_knocked_down',
	wrDazed : 'wr_dazed',
	wrKnockdownBack : 'wr_knocked_down_back',
	wrKnockdownFront : 'wr_knocked_down_front',
	wrGrapple : 'wr_grapple',
	wrGrappling : 'wr_grappling',
	wrEncumbered : 'wr_encumbered',		// Player encumbered
	wrHogtied : 'wr_hogtied',
	wrPinned : 'wr_pinned',
	wrStd : 'wr_std',					// Standar effect. Such as exposed, mending, vulnerable etc.
	wrNoOrgasmMomentumLoss : 'wr_no_orgasm_momentum_loss',	// prevents the overwhelming orgasm wrapper from removing momentum

	wrKink : 'wr_kink',					// This is set on wrappers that should be treated as a kink
	wrEnchant : 'wr_enchant',			// Set on asset wrappers that should be considered as enchants

	// Used for long term wrappers 
	wrTentacleRide : 'wr_tentacle_ride',
	wrBlockGroin : 'wr_block_groin',			// Used to signify that something is blocking this part of the body. Usually a monster doing something to it.
	wrBlockButt : 'wr_block_butt',
	wrBlockMouth : 'wr_block_mouth',
	wrDefensive : 'wr_defensive',				// Put on defensive effects

	// Custom wrapper tags that can be added to wrappers
	wrSoaked : 'wr_soaked',				// Player is soaked
	wrLegsSpread : 'wr_legs_spread',
	wrTentacleRestrained : 'wr_tentacle_restrained',		// Restrained and lifted by tentacles
	wrBound : 'wr_bound',
	wrNoRiposte : 'wr_no_riposte',							// Prevents riposte
	wrBlockGrapple : 'wr_block_grapple',					// This wrapper overrides grapple
	wrFoodBuff : 'wr_foodbuff',								// Removes other wrappers with this tag on apply

	// Effects
	fxLatching : 'fx_latching',			// Put on a player latched onto another
	fxLatched : 'fx_latched',			// Put on a player that another is latching onto
	fxPouncing : 'fx_pouncing',			// Put on a player pouncing another
	fxPounced : 'fx_pounced',			// Put on a player that another is pounced onto
	
	// Game action
	// These are tags used on game actions to mark trainers
	gaWarrior : 'ga_warrior',
	gaCleric : 'ga_cleric',
	gaRogue : 'ga_rogue',
	gaTentaclemancer : 'ga_tentaclemancer',
	gaMonk : 'ga_monk',
	gaElementalist : 'ga_elementalist',
	gaNecromancer : 'ga_necromancer',
	gaArcanist : 'ga_arcanist',
	gaBard : 'ga_bard',

	// Turn tags
	ttButtExposed : 'tt_butt_exposed',
	ttGroinExposed : 'tt_groin_exposed',
	ttBreastsExposed : 'tt_breasts_exposed',
	ttWedgie : 'tt_wedgie',
	ttPussyWedgie : 'tt_pussy_wedgie',
	ttBentOver : 'tt_bent_over',
	ttBentOverTable : 'tt_bent_over_table',
	ttSpanked : 'tt_spanked',
	ttBreastsWedgie : 'tt_breasts_wedgie',
	ttSittingChair : 'tt_sitting_chair',
	ttPinnedChair : 'tt_pinned_chair',
	ttUsedRack : 'tt_used_rack',
	
	// Dungeon tags
	duDark : 'du_dark',					// Dark dungeon set
	duIndoor : 'du_indoor',					// Dark dungeon set
	duOutdoor : 'du_outdoor',					// Dark dungeon set
	duCorridor : 'du_corridor',			// Room is a corridor
	duRoom : 'du_room',					// Room is a room (not corridor)
	duTown : 'du_town',					// You're in a town/settlement
	duFriendly : 'du_friendly',			// The dungeon is mostly friendly


	// Mesh tags
	mPLAYER_MARKER : 'm_PLAYER_MARKER',			// Used to identify player marker meshes
	mMARKER_GROUP : 'm_MARKER_GROUP',			// Not used
	mTREASURE_MARKER : 'm_TREASURE_MARKER',		// Used to identify treasure locations for the procedural generator
	mLEVER_MARKER : 'm_LEVER_MARKER',			// Used to identify an interactive lever in the dungeon generator

	mLever :'m_lever',					// Lever
	mTrapdoor : 'm_trapdoor',
	mDoor  : 'm_door',
	mLadder : 'm_ladder',				
	mStool : 'm_stool',
	mChairBackless : 'm_chair_backless',
	mBench : 'm_bench',
	mBed : 'm_bed',
	mTable : 'm_table',
	mChair : 'm_chair',
	mShelf : 'm_shelf',
	mRug : 'm_rug',
	mBarTable : 'm_bar_table',
	mBarShelf : 'm_bar_shelf',
	mBarrel : 'm_barrel',
	mCrate : 'm_crate',
	mChest  : 'm_chest',
	mTankard : 'm_tankard',
	mWall : 'm_wall',					// At least 1 wall exists
	mStair : 'm_stair',			
	mHaybale : 'm_haybale',
	mRug : 'm_rug',
	mAltar : 'm_altar',
	mBanner : 'm_banner',
	mCart : 'm_cart',
	mRope : 'm_rope',
	mFireplace : 'm_fireplace',
	mFire : 'm_fire',
	mBottle : 'm_bottle',
	mBook : 'm_book',
	mBookshelf : 'm_bookshelf',
	mCandle : 'm_candle',
	mPaper : 'm_paper',
	mBowl : 'm_bowl',
	mTorch : 'm_torch',
	mBag : 'm_bag',
	mFence : 'm_fence',
	mStone : 'm_stone',
	mOar : 'm_oar',
	mSeashell : 'm_seashell',
	mStarfish : 'm_starfish',
	mGrass : 'm_grass',
	mSand : 'm_sand',
	mDirt : 'm_dirt',
	mMoss : 'm_moss',
	mSwamp : 'm_swamp',
	mWater : 'm_water',
	mBucket : 'm_bucket',
	mEmitter : 'm_emitter',
	mMerchantCart : 'm_merchant_cart',
	mBoulder : 'm_boulder',
	mTent : 'm_tent',
	mBush : 'm_bush',

	mGrassLong : 'm_grass_long',
	mTree : 'm_tree',
	mFlower : 'm_flower',
	mTreeStump : 'm_tree_stump',
	mStalagmite : 'm_stalagmite',
	mSoil : 'm_soil',
	mVines : 'm_vines',
	mShovel : 'm_shovel',
	mAxe : 'm_axe',
	mPitchfork : 'm_pitchfork',
	mPew : 'm_pew',
	mMist : 'm_mist',
	mTorture : 'm_torture',
	mFloorRock : 'm_floor_rock',
	mWallRock : 'm_floor_rock',
	mFloorStoneTile : 'm_floor_stone_tile',
	mWallStoneTile : 'm_wall_stone_tile',
	mFloorWood : 'm_floor_wood',
	mFloorSand : 'm_floor_sand',
	mFloorDirt : 'm_floor_dirt',
	mFloorGrass : 'm_floor_grass',
	mFloorMoss : 'm_floor_moss',
	mWallWood : 'm_wall_wood',
	mSeaweed : 'm_seaweed',
	mTentacles : 'm_tentacles',
	mHedge : 'm_hedge',
	mBormStraw : 'm_borm_straw',
	mSteam : 'm_steam',
	mDrawer : 'm_drawer',
	mSnow : 'm_snow',
	mWallChain : 'm_wall_chain',
	mRecordingCrystal : 'm_recording_crystal',
	mDildoArm : 'm_dildo_arm',		// Used for the dildo arm trap
	// Bondage tags are a bit special in that they're used by conditions
	// A bondage device should be marked by mBondage. It's then added to a pool of viable bondage devices in the dungeon
	// When a player is strapped to the device, they inherit all that device's tags prepended by bo_*
	// Ex: player gets put into stocks with tags ['m_bondage', 'm_stocks'], their getTags auto adds ['bo_m_shackles', 'bo_m_bondage']
	mBondage : 'm_bondage',
	mStocks : 'm_stocks',
	mStocksLegs : 'm_stocks_legs',
	mShackles : 'm_shackles',
	mBondageX : 'm_bondage_x',
	mBondageTable : 'm_bondage_table',
	mBondageRack : 'm_bondage_rack',
	mBondageSeat : 'm_bondage_seat',
	mBondageCollarSeat : 'm_bondage_collar_seat',
	mBondageSybian : "m_bondage_sybian",
	mBondageTree : "m_bondage_tree",
	


	mCoffin : 'm_coffin',

	// Meta tags for texts
	metaBattleStarted : 'me_battle_started',
	metaBattleEnded : 'me_battle_ended',

	metaPunch : 'me_punch',
	metaTickle : 'me_tickle',
	metaRub : 'me_rub',
	metaSqueeze : 'me_squeeze',
	metaSlap : 'me_slap',
	metaLick : 'me_lick',
	metaShock : 'me_shock',
	metaTelekinesis : 'me_telekinesis',
	metaStretch : 'me_stretch',
	metaGrind : 'me_grind',
	metaMilking : 'me_milking',
	metaGooey : 'me_gooey',
	metaInjection : 'me_injection',
	metaJiggle : 'me_jiggle',
	metaWhip : 'me_whip',
	metaBluntWeapon : 'me_blunt_weapon',
	metaPinch : 'me_pinch',
	metaPenetration : 'me_penetration',
	metaTwist : 'me_twist',
	metaWedgie : 'me_wedgie',
	metaBite : 'me_bite',
	metaPainful : 'me_painful',
	metaArousing : 'me_arousing',
	metaVeryPainful : 'me_very_painful',
	metaVeryArousing : 'me_very_arousing',
	metaLargeInsertion : 'me_large_insertion',
	metaVibration : 'me_vibration',
	metaSting : 'me_sting',
	metaSpit : 'me_spit',

	// Slot specific tags can be used if you need to have pleasure/pain etc on different points in a text
	metaPainfulButt : 'me_painful_butt',
	metaPainfulGroin : 'me_painful_groin',
	metaPainfulBreasts : 'me_painful_breasts',
	metaVeryPainfulButt : 'me_very_painful_butt',
	metaVeryPainfulGroin : 'me_very_painful_groin',
	metaVeryPainfulBreasts : 'me_very_painful_breasts',
	
	metaArousingfulButt : 'me_arousing_butt',
	metaArousingfulGroin : 'me_arousing_groin',
	metaArousingfulBreasts : 'me_arousing_breasts',
	metaVeryArousingButt : 'me_very_arousing_butt',
	metaVeryArousingGroin : 'me_very_arousing_groin',
	metaVeryArousingBreasts : 'me_very_arousing_breasts',
	
	metaPenetrationGroin : 'me_penetration_groin',
	metaPenetrationButt : 'me_penetration_butt',
	metaPenetrationMouth : 'me_penetration_mouth',



	metaSlotButt : 'me_slot_butt',
	metaSlotBreasts : 'me_slot_breasts',
	metaSlotPenis : 'me_slot_penis',
	metaSlotGroin : 'me_slot_groin',
	metaSlotVagina : 'me_slot_vagina',
	metaSlotNipples : 'me_slot_nipples',
	metaSlotMouth : 'me_slot_mouth',
	metaSlotBreast : 'me_slot_breast',
	metaSlotNipple : 'me_slot_nipple',
	metaSlotClit : 'me_slot_clit',
	metaSlotBalls : 'me_slot_balls',
	metaSlotFoot : 'me_slot_foot',
	metaSlotArmpit : 'me_slot_armpit',
	metaSlotClothes : 'me_slot_clothes',
	metaSlotFace : 'me_slot_face',
	metaSlotTaint : 'me_slot_taint',
	
	metaUsedTongue : 'me_used_tongue',
	metaUsedStrapon : 'me_used_strapon',
	metaUsedClaw : 'me_used_claw',
	metaUsedTentacles : 'me_used_tentacles',
	metaUsedWhip : 'me_used_whip',
	metaUsedFist : 'me_used_fist',
	metaUsedPenis : 'me_used_penis',
	metaUsedFinger : 'me_used_finger',
	metaUsedInsect : 'me_used_insect',
	metaUsedRack : 'me_used_rack',

	
	metaKick : 'me_kick',
	metaCold : 'me_cold',
	metaWet : 'me_wet',
	metaWiggle : 'me_wiggle',
	metaSuck : 'me_suck',
	metaHeadbutt : 'me_headbutt',
	metaUsedMouth : 'me_used_mouth',
	//meta : 'me_',

};
