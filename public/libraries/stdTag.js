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
	plTail : 'pl_tail',				// Player has tail
	plMuscular : 'pl_muscular',		// Player is muscular
	plHair : 'pl_hair',				// Player has hair
	plLongHair : 'pl_long_hair',	// Player has long hair
	plFangs : 'pl_fangs',			// Player has fangs
	plBeast : 'pl_beast',			// non-humanoid
	plTentacles : 'pl_tentacles',
	plHorns : 'pl_horns',
	plCircumcised : 'pl_circumcised',
	plImmobile : 'pl_immobile',		// Immobile
	plElectric : "pl_electric",

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
	
	

	// Wrapper tags that are auto generated
	wrDuration : 'as_duration',		// Duration ability
	wrDetrimental : 'as_detrimental',	
	wrKnockdown : 'wr_knocked_down',
	wrDazed : 'wr_dazed',
	wrKnockdownBack : 'wr_knocked_down_back',
	wrKnockdownFront : 'wr_knocked_down_front',
	wrEncumbered : 'wr_encumbered',		// Player encumbered
	
	// Custom wrapper tags that can be added to wrappers
	wrSoaked : 'wr_soaked',				// Player is soaked
	wrLegsSpread : 'wr_legs_spread',
	

	// Turn tags, these are special case in that they're only added and removed from texts and turns changing. They're not visible
	// Theyre's also in a separate list from the other tags, so they don't need a prefix
	ttButtExposed : 'butt_exposed',
	ttGroinExposed : 'groin_exposed',
	ttBreastsExposed : 'breasts_exposed',
	ttWedgie : 'wedgie',
	ttPussyWedgie : 'pussy_wedgie',
	ttBentOver : 'bent_over',
	ttBentOverTable : 'bent_over_table',
	ttSpanked : 'spanked',

	// Dungeon tags
	duDark : 'du_dark',					// Dark dungeon set
	duIndoor : 'du_dark',					// Dark dungeon set
	duOutdoor : 'du_dark',					// Dark dungeon set
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
	

};
