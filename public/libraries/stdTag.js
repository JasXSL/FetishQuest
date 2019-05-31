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

	// Used for gameplay
	plBoss : 'pl_boss',				// used on boss battles

	// Player behavior tags
	plDishonorable : "pl_dishonorable",


	// Action tags
	acBuff : 'ac_buff',
	acDebuff : 'ac_debuff',
	acHeal : 'ac_heal',
	acDamage : 'ac_damage',
	acPainful : 'ac_painful',
	acArousing : 'ac_arousing',
	acNpcImportant : 'ac_npc_important',		// NPCs will prioritize these over other spells
	acInterrupt : 'ac_interrupt',
	acItem : 'ac_item',							// Used an inventory item
	acManaHeal : 'ac_mana_heal',				// Restores mana
	acSelfHeal : 'ac_self_heal',				// Heals yourself
	acTaunt : 'ac_taunt',						// This is a taunt


	// Common asset tags. These are appended with _<slot> ex as_tight_upperbody
	asUpperbody : 'as_upperbody',	// slots like these are automatically added while you're wearing items in those slots
	asLowerbody : 'as_lowerbody',

	asTight : 'as_tight',			// Tight close
	asHard : 'as_hard',			// Hardened clothes, preventing gropes etc on top of the item
	asTight : 'as_tight',			// Tight clothing revealing what's underneath

	asSkirt : 'as_skirt',
	asThong : 'as_thong',
	asShiny : 'as_shiny',
	asStockings : 'as_stockings',
	asSlingBikini : 'as_sling_bikini',
	asShirt :'as_shirt',
	asStretchy : 'as_stretchy',
	asShorts : 'as_shorts',
	asJeans : 'as_jeans',
	asPlate : 'as_plate',			// Plate armor
	asRobe : 'as_robe',
	asCrotchFlap : 'as_crotch_flap',		// There's a piece of cloth hanging in front of your crotch
	asButtFlap : 'as_butt_flap',			// There's a piece of cloth hanging in front of your butt
	asBodysuit : 'as_bodysuit',				// Designated for any piece of outfit that can't be "pulled down"
	asWaistband : 'as_waistband',			// Outfit has "waistband"
	asReagent : 'as_reagent',
	
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
	
	asStrapon : 'as_strapon',
	

	// Wrapper tags that are auto generated
	wrDuration : 'as_duration',		// Duration ability
	wrDetrimental : 'as_detrimental',	
	wrKnockdown : 'wr_knocked_down',
	wrDazed : 'wr_dazed',
	wrKnockdownBack : 'wr_knocked_down_back',
	wrKnockdownFront : 'wr_knocked_down_front',
	wrGrapple : 'wr_grapple',
	wrEncumbered : 'wr_encumbered',		// Player encumbered
	wrHogtied : 'wr_hogtied',
	
	// Used for long term wrappers 
	wrTentacleRide : 'wr_tentacle_ride',
	wrBlockGroin : 'wr_block_groin',			// Used to signify that something is blocking this part of the body. Usually a monster doing something to it.
	wrBlockButt : 'wr_block_butt',
	wrBlockMouth : 'wr_block_mouth',
	
	// Custom wrapper tags that can be added to wrappers
	wrSoaked : 'wr_soaked',				// Player is soaked
	wrLegsSpread : 'wr_legs_spread',
	wrTentacleRestrained : 'wr_tentacle_restrained',		// Restrained and lifted by tentacles
	wrBound : 'wr_bound',

	// Effects
	fxLatching : 'fx_latching',			// Put on a player latched onto another
	fxLatched : 'fx_latched',			// Put on a player that another is latching onto

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

	
	// Dungeon tags
	duDark : 'du_dark',					// Dark dungeon set
	duIndoor : 'du_indoor',					// Dark dungeon set
	duOutdoor : 'du_outdoor',					// Dark dungeon set
	duCorridor : 'du_corridor',			// Room is a corridor
	duRoom : 'du_room',					// Room is a room (not corridor)



	// Mesh tags
	mLever :'m_lever',					// Lever
	mTrapdoor : 'm_trapdoor',
	mLadder : 'm_ladder',				
	mStool : 'm_stool',
	mBench : 'm_bench',
	mTable : 'm_table',
	mChair : 'm_chair',
	mShelf : 'm_shelf',
	mRug : 'm_rug',
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
	
};
