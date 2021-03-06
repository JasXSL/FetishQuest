import Text from '../../classes/Text.js';
import stdTag from '../stdTag.js';
import Asset from '../../classes/Asset.js';
import GameEvent from '../../classes/GameEvent.js';
import Condition from '../../classes/Condition.js';
const baseCond = ['actionHit', 'eventIsActionUsed'];
const anyOnHumCond = baseCond.concat('targetNotBeast');
const humOnHumCond = anyOnHumCond.concat('senderNotBeast');
const humOnAnyCond = baseCond.concat('senderNotBeast');

import C from './conditions.js';
import H from './hitfx.js';

const lib = [
	// Turn changed
	{ text : "%T's turn!",
		conditions : [
			{type:Condition.Types.event,data:{"event":GameEvent.Types.turnChanged}},
			{type:Condition.Types.tag, data:{tags:'pl_'+stdTag.gpSkipTurns}, inverse:true}
		],
		alwaysOutput:true,
	},
	// battle started
	{ text : "Battle Started!",
		conditions : [
			{"type":"event","data":{"event":"battleStarted"}}
		],
		audiokits : ["battleStart"],
		metaTags : [stdTag.metaBattleStarted],
	},
	// battle finished
	{ text : "The battle has finished...",
		conditions : [
			{"type":"event","data":{"event":"battleEnded"}}
		],
		audiokits : ["battleFinished"],
		metaTags : [stdTag.metaBattleEnded],
	},
	// player defeated
	{ text : "%T was defeated!",
		conditions : [
			{"type":"event","data":{"event":"playerDefeated"}}
		],
		audiokits : ["knockout"]
	},
	// miss
	{ text : "%S tries to use %action on %T, but fails!",
		conditions : ["eventIsActionUsed","actionResist"],
		audiokits : ["spellFail"]
	},
	// Stun resist
	{ text : "%T resisted the stun portion of the attack!",
		conditions : ["eventIsDiminishingResist","wrapperIsStun"],
		audiokits : ["spellFail"]
	},

	// Overwhelming orgasm
	{ text : "%T succumbs to %This arousal!",
		conditions : ["targetBeast", "eventIsWrapperAdded","overWhelmingOrgasm_start"],
		hitfx : ["squishLong"]
	},
	{ text : "%T feels a wave of pleasure wash across %This %Tgenitals, succumbing to %This arousal!",
		conditions : ["targetNotBeast", "eventIsWrapperAdded","overWhelmingOrgasm_start"],
		hitfx : ["squishLong"]
	},
	{ text : "%T recovers from %This arousal!",
		conditions : ["eventIsEffectTrigger","overWhelmingOrgasm_end"],
	},

	// rest
	
	{ text : "%S rests!",
		"conditions":baseCond.concat("action_rest"),
		hitfx : [],
		metaTags : [],
	},

	// STDAttack
	{ text : "%S throws a punch at %T!",
		"conditions":humOnAnyCond.concat("action_stdAttack"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch],
	},
	{ text : "%S throws a rough jab at %T's side, leaving the %Trace to catch %This breath!",
		"conditions":humOnHumCond.concat("action_stdAttack"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch],
	},

	{ text : "%S slaps %T's %butt, jiggling %This %Trsize buttcheeks around!",
		"conditions": humOnHumCond.concat('action_stdAttack', "action_not_crit",'targetButtLarge',"targetLowerBodyOrNoDamage"),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSlap],		
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %breasts!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetBreasts", "targetKnockedDownBack", "targetTaller",'targetUpperBodyOrNoDamage',
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["doubleSlap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreasts, stdTag.metaSlap],
	},
	{ text : "%S raises a palm into the air and brings it swatting down across %T's %Tbsize %breasts!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetBreasts", "targetNotTaller", 'targetUpperBodyOrNoDamage', "targetUpperBodyNotHard"]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreasts, stdTag.metaSlap],
	},
	{ text : "%S swats an open palm up across %T's %Tbsize %breasts!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetBreasts", "targetTaller", 'targetUpperBodyOrNoDamage', "targetUpperBodyNotHard"]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreasts, stdTag.metaSlap],
	},
	{ text : "%S throws a rigid slap across %T's %Tbsize %breasts, jiggling them around in %This %TclothUpper!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetBreasts", 'targetUpperBodyOrNoDamage', "targetUpperBodyStretchy", "targetBreastsLarge"]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreasts, stdTag.metaSlap],
	},
	
	{ text : "%S throws a slap up across %T's %groin!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetLowerBodyOrNoDamage" ]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaSlap],
	},
	{ text : "%S throws a hard punch right at %T's solar plexus, knocking the wind out of the %Trace!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetUpperBodyOrNoDamage" ]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch],
	},
	{ text : "%S gets behind %T and flattens %Shis hand, jabbing it hard up between %T's buttcheeks!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetLowerBodyOrNoDamage", "targetButtExposedOrThong"]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch, stdTag.metaSlotButt],
	},
	
	{ text : "%S jumps onto the knocked down %Trace's stomach, throwing two teasing slaps across %T's %groin!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetKnockedDownBack", "targetTaller",'targetLowerBodyOrNoDamage',
			"targetLowerBodyNotHard"
		]),
		hitfx : ["doubleSlap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaSlap],
	},
	{ text : "%S leaps on top of the helpless %Trace, straddling %Thim and wiggling %Shis fingers menacingly above %T's breasts before swooping in, catching the %Trace's nipples and proceeding to tweak them between finger and thumb!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetBreasts", "targetKnockedDownBack", "targetTaller",'targetUpperBodyOrNoDamage', 
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaStretch],
	},
	{ text : "%S leaps on top of the helpless %Trace, straddling %Thim and wiggling %Shis fingers menacingly above %T's %groin before swooping in, catching the %Trace's bulge and proceeding to tweak it between finger and thumb!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetPenis", "targetKnockedDownBack", "targetTaller",'targetLowerBodyOrNoDamage',"targetLowerBodyNotHard", "targetWearsLowerBody"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaStretch],
	},
	{ text : "%S jumps on top of %T, straddling %Thim and starts slapping %This %Trsize %butt!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetKnockedDownFront", "targetTaller",'targetLowerBodyOrNoDamage',"targetLowerBodyNotHard"]),
		weight : Text.Weights.high,
		hitfx : ["doubleSlap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSlap],
	},
	{ text : "%S jumps on top of %T, straddling %Thim and grabbing a hold of the back of %This %TclothLower, tugging firmly and giving the %Trace a wedgie!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetKnockedDownFront", "targetTaller","targetLowerBodyDamaged","targetLowerBodyNotHard"]),
		weight : Text.Weights.high,
		hitfx : ["stretch"],
		turnTags : [stdTag.ttWedgie],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaWedgie],
	},
	
	{ text : "%S takes advantage of an opening in %T's defences, skillfully darting in and gently pinching the %Trace's nipples before quickly tugging %This teats back until they slip free, plucking the sensitive nubs!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetBreasts", "targetKnockedDownBack", "targetTaller",'targetUpperBodyOrNoDamage',
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaStretch],
	},
	{ text : "%S takes advantage of an opening in %T's defences, skillfully darting in and firmly pinching the front of the %Trace's %TclothLower before quickly tugging back until it slips free!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetPenis", "targetKnockedDownBack", "targetTaller",'targetLowerBodyOrNoDamage',"targetLowerBodyNotHard", "targetWearsLowerBody"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaStretch],
	},
	{ text : "%S takes advantage of an opening in %T's defences, skillfully darting in and gently pinching the %Trace's foreskin before quickly tugging back until it slips free, plucking %This sensitive %penis!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetKnockedDownBack", "targetTaller",'targetLowerBodyOrNoDamage',"targetPenisExposed", "targetNotCircumcised"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotPenis, stdTag.metaStretch],
	},
	{ text : "%S picks up a book uses it whack %T across %This %Trsize %butt!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "roomBook"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlap, stdTag.metaSlotButt],
	},

	{ text : "%S slips %Shis hands in under the sides of %T's %TclothLower from the front and pulls out, damaging the piece in the process!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetPenis", "targetTaller", "targetLowerBodyDamaged", "targetLowerBodyNotPants", "targetLowerBodyNotHard"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotGroin, stdTag.metaSlotClothes],
	},
	{ text : "%S gets a good grip on %T's %TclothLower, tugging it backwards and giving the %Trace a harsh smack across %This %Trsize %butt!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetLowerBodyStretchy", "targetLowerBodyOrNoDamage"]),
		hitfx : ["stretchWhip"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotButt, stdTag.metaSlotClothes, stdTag.metaSlap],
	},
	{ text : "%S grabs both of %T's arms and stretches them out before slamming his knee up against the %Trace's %groin!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_crit", "targetNotTaller"]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S jumps onto the knocked down %Trace and puts %Thim in a chokehold! %T eventually struggles free, but is forced to catch %This breath!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetKnockedDownFront"]),
		hitfx : ["stretch"],
		metaTags : [],
	},
	{ text : "%S slips behind %T, putting %Thim into a chokehold! %T manages to break free after a few moments, but is left catching %This breath!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "action_not_crit", "targetNotTaller"]),
		hitfx : ["stretch"],
		metaTags : [],
	},
	
	
	
	

	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a hold of %This nipples and tugs at them!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBreasts","targetKnockedDownBack","targetTaller","targetBreastsExposed",'targetUpperBodyOrNoDamage'),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaStretch],
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, pinching a firm hold of %This nipples, twisting them while stretching them out!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetBreasts","targetKnockedDownBack","targetTaller","targetBreastsExposed",'targetUpperBodyOrNoDamage'),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaStretch],
	},
	{ text : "%S pinches a hold of %T's nipples and pulls backwards!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBreasts","targetUpperBodyNotHard",'targetUpperBodyOrNoDamage'),
		audiokits : ["pinchGeneric"],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaStretch],
	},
	{ text : "%S pinches a hold of the front of %T's %TclothLower and pulls backwards, exposing %This %Tgenitals!",
		conditions : humOnHumCond.concat("action_stdAttack","targetLowerBodyNotHard",'targetLowerBodyOrNoDamage', "targetWearsLowerBody", "targetNotBeast"),
		audiokits : ["pinchGeneric"],
		hitfx : ["stretch"],
		turnTags : [stdTag.ttGroinExposed],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaStretch],
	},
	{ text : "%S rams %Shis knee up at %T's %butt!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", 'targetLowerBodyOrNoDamage'),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","roomTable", 'targetLowerBodyOrNoDamage'),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSlap],
	},
	{ text : "%S suddenly grabs %T from behind, pulling %Thim back a step and charging forward together towards a nearby table. %S pushes the %Trace's upper body down onto its surface, bending %Thim over the edge. A hand on %This back pins %T there as another firmly swats back and forth across %This %Trsize presented %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","roomTable", 'targetLowerBodyOrNoDamage'),
		hitfx : ["slap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSlap],
	},
	
	{ text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes them %firmly!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit", 'targetLowerBodyOrNoDamage']),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSqueeze],
	},
	{ text : "%S grabs hold of %T's %Trsize buttcheeks and spreads them apart as %She squeezes them %firmly!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetButtExposed", 'targetLowerBodyOrNoDamage']),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSqueeze],
	},
	{ text : "%S manages to grab a firm hold of %T's %Tpsize %penis through %This stretchy %TclothLower, and in one move clamps down and twists it!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_crit", 'targetLowerBodyOrNoDamage', "targetPenis"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotPenis, stdTag.metaSqueeze],
	},
	{ text : "%S manages to grab a firm hold of %T's %leftright nipple through %This stretchy %TclothUpper, and in one move clamps down and twists it!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_crit", 'targetUpperBodyOrNoDamage', "targetBreasts", "targetUpperBodyStretchy"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipple, stdTag.metaSqueeze],
	},
	{ text : "%S manages to grab a firm hold of %T's exposed %leftright nipple, and in one move clamps down and twists it!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_crit", "targetBreastsExposed"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipple, stdTag.metaSqueeze],
	},
	{ text : "%S manages to grab a firm hold of %T's %Tpsize %penis, and in one move clamps down and twists it!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_crit", "targetPenisExposed"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotPenis, stdTag.metaSqueeze],
	},
	{ text : "%S manages to slips %Shis hands into %T's %TclothLower from behind, grabbing a hold of the %Trace's buttcheeks and spreading them firmly!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit", "targetLowerBodyNotPants", "targetWearsLowerBody"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSqueeze, stdTag.metaStretch],
	},
	

	{ text : "%S grabs a hold of %T's %Tbsize %leftright %breast and squeezes down %firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetBreasts", "targetUpperBodyNotHard", 'targetUpperBodyOrNoDamage'),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreast, stdTag.metaSqueeze],
	},
	{ text : "%S slaps a spread hand onto %T's %Tbsize %leftright %breast, taking hold of it and squeezing down %firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit", "targetBreasts", "targetUpperBodyNotHard", 'targetUpperBodyOrNoDamage'),
		hitfx : ["slapSqueeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBreast, stdTag.metaSqueeze],
	},
	{ text : "%S slaps a spread hand onto %T's %Tpsize bulge, taking hold of it and squeezing down %firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit", "targetPenis", "targetLowerBodyNotHard", 'targetLowerBodyOrNoDamage', "targetWearsLowerBody"),
		hitfx : ["slapSqueeze"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotGroin, stdTag.metaSqueeze],
	},

	{ text : "%S pinches down on %T's %leftright nipple and twists it!",
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetBreasts", "targetUpperBodyNotHard", 'targetUpperBodyOrNoDamage'),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotNipple, stdTag.metaTwist],
	},
	{ text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetLowerBodyHard", 'targetLowerBodyOrNoDamage']),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaPunch],
	},
	{ text : "%S lands a fearsome blow onto %T's %groin, but most of its force is absorbed by %This %TclothLower.",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetLowerBodyHard", 'targetLowerBodyOrNoDamage']),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaPunch],
	},
	{ text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetUpperBodyHard", 'targetUpperBodyOrNoDamage']),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaPunch],
	},
	{ text : "%S throws a mighty punch squarely towards the front and center of %T's %TclothUpper. It hits, but %T weathers the attack as it fails to break through.",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetUpperBodyHard", 'targetUpperBodyOrNoDamage']),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaPunch],
	},
	{ text : "%S grabs a firm hold around the T-junction at the back of %T's %TclothLower and twists hard, forcing the front of it to uncomfortably constrict against %This %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit","targetLowerBodyNotHard", 'targetLowerBodyOrNoDamage', "targetWearsThong"]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaWedgie, stdTag.metaPainful],
	},
	{ text : "%S grabs a hold of and firmly spreads %T's buttcheeks before surprising the %Trace with a knee to %This %Tbsize %butt, burying it between %This buttcheeks!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_crit", 'targetLowerBodyOrNoDamage', "targetButtExposedOrThong"]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%S grabs %T by the waistband of %This %TclothLower and tugs %Thim close, then quickly grabs a hold of %T's bulge firmly and gives it a harsh squeeze!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", 'targetLowerBodyOrNoDamage', "targetPenis", "targetLowerBodyWaistband"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaPainful, stdTag.metaSqueeze],
	},

	{ text : "%S shoves %T backwards, causing %Thim to fall %butt-first onto a small stalagmite poking out of the ground!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack", "targetLowerBodyNotHard", "targetLowerBodyOrNoDamage", "targetWearsLowerBody", "roomStalagmite"]),
		hitfx : ["shove"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaPainful],
	},

	{ text : "%S grabs at the back strings of %T's %TclothLower while %The's knocked down and tugs %firmly upwards, causing the strings to dig into %This %breasts and %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetKnockedDownFront", "targetWearsSlingBikini"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaStretch, stdTag.metaWedgie],
	},



	// Hogtied
	{ text : "%S slips behind the hogtied %Trace and spanks %This %Trsize exposed %butt a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetHogtied", 'targetLowerBodyOrNoDamage'),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlap, stdTag.metaPainful],
	},

	// Bondage devices
	{ text : "%S takes advantage of %T's vulnerable position and slaps %This %Tbsize %leftright %breast!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetTiedUp", "targetUpperBodyOrNoDamage", "targetBreasts"),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S takes advantage of %T's vulnerable position and clamps down on %This nipples, twisting them while firmly tugging backwards!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetTiedUp", "targetUpperBodyOrNoDamage", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPinch, stdTag.metaTwist, stdTag.metaStretch, stdTag.metaPainful, stdTag.metaSlotNipples],
	},
	{ text : "%S takes advantage of %T being restrained, and clamps %Shis hand down on the %Trace's vulnerable %groin, squeezing it firmly!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetTiedUp", "targetLowerBodyOrNoDamage", "targetLowerBodyNotHard"),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S grabs at the waistline of the restrained %Trace's %TclothLower from the front, giving a firm tug up!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "targetTiedUp", "targetLowerBodyDamaged", "targetLowerBodyNotHard", "targetLowerBodyWaistband"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaPainful, stdTag.metaSlotClothes, stdTag.metaWedgie],
	},
	{ text : "%S grabs a hold of %T's waistline from behind, lifting %Thim up the plank at the back of the contraption %The's strapped to before letting go, allowing %T to fall %groin first onto the wooden seat!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "targetLowerBodyOrNoDamage", "targetLowerBodyWaistband", "targetBoundCollarSeat", "action_crit"),
		hitfx : ["stretch","punch"],
		metaTags : [stdTag.metaStretch, stdTag.metaPainful, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
	},

	// stocks
	{ text : "%S takes advantage of %T being tied up and throws a couple of rough slaps across %This %Trsize vulnerable %butt!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundStocks", "targetLowerBodyOrNoDamage"),
		hitfx : ["doubleSlap"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaSlap],
	},
	{ text : "%S takes advantage of %T's situation and grabs a firm hold of the waistline of %This %TclothLower! %S rapidly yanks up, lifting the %Trace's %Trsize %butt into the air!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "targetBoundStocks", "targetLowerBodyOrNoDamage", "targetLowerBodyWaistband"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaWedgie],
	},
	{ text : "%S grabs a hold of %T's head while %The is restrained! The %Srace grabs a hold of %Shis %Spsize %penis and uses it to roughly slap the %Trace across the face a couple of times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "targetBoundStocks", "senderPenisLarge"),
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotFace, stdTag.metaSlap, stdTag.metaUsedPenis],
	},
	
	// Rack
	{ text : "%S teasingly tugs at the wheel attached to the bottom of the table %T is strapped to, painfully stretching %This body!",
		turnTags:[stdTag.ttUsedRack],
		conditions : humOnHumCond.concat("action_stdAttack", "targetBoundRack"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaStretch, stdTag.metaUsedRack],
	},

	// targetBoundTable
	{ text : "%S hops onto the %T's stomach and pinches a firm hold of %This nipples, freely tugging and twisting at them while the %Trace is unable to fight back!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundTable", "targetUpperBodyOrNoDamage"),
		hitfx : ["pinchStretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaStretch, stdTag.metaSlotNipples, stdTag.metaPinch],
	},
	{ text : "%S walks up above %T, grabs a firm hold of the shoulders of %This %TclothUpper and tugs with gusto, chafing it up firmly between %This legs!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundTable", "targetWearsSlingBikini"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaPainful, stdTag.metaStretch, stdTag.metaWedgie],
	},

	// Sybian
	{ text : "%S grabs at the flexible rubber dong sticking out of the machine that %Trace is strapped to and firmly bends it down forwards! %S rapidly lets go, causing it to twang painfully up across %T's %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetBoundSybian"),
		weight : Text.Weights.high,
		hitfx : ["tentacleStretchWhip"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaPunch, stdTag.metaSlotGroin],
	},
	{ text : "%S flexes the rubber dong sticking out of the machine that %Trace is strapped forwards and lets it twang up across the %Trace's %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundSybian"),
		weight : Text.Weights.high,
		hitfx : ["tentacleStretchWhip"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch, stdTag.metaSlotGroin],
	},
	{ text : "%S flexes the rubber dong sticking out of the machine that %Trace is strapped backwards and lets it twang up between the %Trace's buttcheeks!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundSybian", "targetButtExposedOrThong"),
		weight : Text.Weights.high,
		hitfx : ["tentacleStretchWhip"],
		metaTags : [stdTag.metaPainful, stdTag.metaPunch, stdTag.metaSlotButt],
	},
	

	

	// dishonorable
	{ text : "%S shoves %T from behind, bending %Thim over a table and bites %This %Trsize %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","roomTable","senderDishonorable", 'targetLowerBodyOrNoDamage'),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaBite, stdTag.metaPainful],
	},
	{ text : "%S takes advantage of %T being tied up and bites the %Trace's %Trsize %butt!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundStocks", "targetLowerBodyOrNoDamage", "senderDishonorable"),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaPainful, stdTag.metaBite, stdTag.metaSlap],
	},
	{ text : "%S grabs a nearby tankard in one hand and snatches the waistband of %T's %TclothLower, tugging it out from the front! Before the %Trace can react, the %Srace pours the frothy remnants of the drink down the garment!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetLowerBodyOrNoDamage", "senderDishonorable", "roomTankard", "targetLowerBodyWaistband", "targetLowerBodyStretchy"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWet],
	},
	{ text : "%S grabs a nearby tankard and places %Shimself over the knocked down %Trace, before %T can react, the %Srace pours the cold remnants of the drink down onto %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetLowerBodyOrNoDamage", "senderDishonorable", "roomTankard", "targetKnockedDown"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWet],
	},
	{ text : "%S grabs a nearby tankard and tosses its frothy contents out over %T's %Tbsize %breasts!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit", "targetUpperBodyOrNoDamage", "senderDishonorable", "roomTankard", "targetBreasts"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaWet],
	},
	{ text : "%S grabs a nearby bottle and slips behind %T! Before the %Trace can react, %S thrusts the bottle neck first up between %T's buttcheeks!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit", "targetLowerBodyOrNoDamage", "senderDishonorable", "roomBottle", "targetWearsThong"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaVeryPainful],
	},
	{ text : "%S grabs a nearby bottle and swings it at %T, smacking across %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit", "targetLowerBodyOrNoDamage", "senderDishonorable", "roomBottle", "targetLowerBodyNotHard"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaVeryPainful],
	},
	{ text : "%S seizes the opportunity of %T being bent over and rams %Shis knee up into the %Trace's %groin!",
		turnTags:[],
		armor_slot : 'lowerBody',
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","ttBentOver", "senderDishonorable"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S gets behind %T and reaches %Shis hand up between the %Trace's legs and into %This %TclothLower, pinching %This taint and giving it a rapid tug!",
		turnTags:[],
		armor_slot : 'lowerBody',
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetLowerBodyNotPants", "targetWearsLowerBody", "targetPenis"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotTaint, stdTag.metaPinch],
	},
	{ text : "%S gets behind %T and reaches %Shis hand up between the %Trace's legs, giving a quick pinch to the exposed sides of %This %TclothLower!",
		turnTags:[],
		armor_slot : 'lowerBody',
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetWearsSemiExposedGroin", "targetVagina", "targetTaller"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotVagina, stdTag.metaPinch],
	},
	{ text : "%S gets behind %T and reaches %Shis hand up between the %Trace's legs, giving a quick pinch to the exposed sides of %This balls!",
		turnTags:[],
		armor_slot : 'lowerBody',
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetWearsSemiExposedGroin", "targetPenis", "targetTaller"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPainful, stdTag.metaSlotBalls, stdTag.metaPinch],
	},
	{ text : "As %T is getting off the ground, %S jumps into the air, hitting %T's upper back and slamming %This %Tbsize %breasts against the ground!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetBreasts", "targetKnockedDownFront", "senderIsImp"),
		hitfx : ["punch"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreasts],
	},
	{ text : "As %T is getting off the ground, %S hops onto a table and launches %Shimself at %T, hitting %This upper back and slamming %This %Tbsize %breasts against the ground!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetBreasts", "targetKnockedDownFront", "senderIsImp", "roomTable"),
		hitfx : ["punch"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreasts],
	},
	{ text : "%S quickly climbs the table that %T is bent over, jumping into the air and landing butt-first onto %T's upper back, slamming %This %Tbsize %breasts against the table!",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack", "senderDishonorable", "targetBreasts", "senderIsImp", "ttBentOverTable"),
		hitfx : ["punch"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreasts],
	},
	{ text : "%S grabs a handful of straw from a nearby hay bale and stuffs it down the front of %T's %TclothLower!",
		conditions : humOnHumCond.concat(["action_stdAttack", "action_not_crit", "targetWearsLowerBody", "roomHaybale", "targetLowerBodyOrNoDamage"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaTickle],
	},
	




	// tentacles
	{ text : "%S lashes across %T with its tentacles!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasTentacles"),
		hitfx : ['tentacleWhip'],
		metaTags : [stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaWhip],
	},
	{ text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasTentacles","targetBreasts","targetUpperBodyNotHard", 'targetUpperBodyOrNoDamage'),
		hitfx : ['tentacleStretch'],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaStretch, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S wraps tentacles around the knocked down %Trace's wrists and ankles, tugging them both firmly behind %This back while pushing %This upper body upwards, painfully stretching at %This joints while exposing %This %Tbsize %breasts!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderHasTentacles","targetKnockedDownBack", "targetBreasts",
		]),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S loops %Shis tendrils around %T's nipples with amazing accuracy, latching onto them before tugging them outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasTentacles","targetBreasts","targetUpperBodyNotHard", 'targetUpperBodyOrNoDamage'),
		hitfx : ['tentacleStretch'],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaStretch, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S loops %Shis tendrils around %T's %Tpsize %penis with amazing accuracy, latching onto %This foreskin before tugging it outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasTentacles","targetPenisExposed",'targetLowerBodyOrNoDamage'),
		hitfx : ['tentacleStretch'],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaStretch, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips a couple of tendrils around %T's exposed %breasts, firmly squeezing them!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderHasTentacles","targetBreasts","targetBreastsExposed", 'targetUpperBodyOrNoDamage']),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S's tentacles shoot out towards %T's exposed %breasts, almost completely wrapping both of them within their coils. The tips of the %Srace's tendrils cruelly flicks at %This nipples as its spiralling grasp tightens firmly, squeezing %This %breasts!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_crit","senderHasTentacles","targetBreasts","ttBreastsExposed", 'targetUpperBodyOrNoDamage']),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaUsedTentacles],

	},
	{ text : "%S's tentacles shoot out towards %T's %Tpsize exposed %penis, completely wrapping it within their coils. The tips of the %Srace's tendrils cruelly flicks at the front of %This %penis as its spiralling grasp tightens firmly!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_crit","senderHasTentacles","targetPenisExposed"]),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaUsedTentacles],

	},

	{ text : "%S slips a couple of tendrils around %T's exposed %breasts, firmly squeezing them!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderHasTentacles","targetBreasts","targetBreastsExposed", 'targetUpperBodyOrNoDamage']),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaUsedTentacles],

	},
	{ text : "%S lashes its thin tendrils around %T's exposed nipples! Before %T can react, %S wiggles the tendrils at %Shis end, sending a wave across the tentacles. A moment later, the waves reach the %Trace's breasts, flicking the tendrils off painfully.",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_crit","senderIsGroper","targetBreasts","targetBreastsExposed", 'targetUpperBodyOrNoDamage']),
		hitfx : ['tentacleWhipSqueeze'],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaSqueeze, stdTag.metaStretch, stdTag.metaPainful, stdTag.metaUsedTentacles],

	},

	

	{ text : "%S slips a couple of tendrils around %T's exposed nipples, and starts jiggling %This %Tbsize %breasts around!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderHasTentacles","targetBreasts","targetBreastsExposed", 'targetUpperBodyOrNoDamage']),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaJiggle, stdTag.metaUsedTentacles],
	},

	{ text : "%S lashes %T's %Trsize %butt with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderHasTentacles", 'targetLowerBodyOrNoDamage']),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlap, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderHasTentacles", 'targetLowerBodyOrNoDamage']),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlap, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S aims a thick tentacle up at %T from behind! The tentacle rams up between the %Trace's exposed buttcheeks with enough force that %The staggers forwards!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_crit","senderHasTentacles", 'targetLowerBodyOrNoDamage', "targetWearsThong"]),
		hitfx : ["tentacleWhip", "punch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlap, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},
	{ text : "%S sends two tendrils slithering up %T's legs, the pair coming together where %This thighs meet. They coiling around each other before prying their way between %This folds, slipping part-way inside %This %vagina and stretching its entrance!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_crit","senderHasTentacles","targetVagina",
			{
				conditions : [
					"targetNoLowerBody",
					"targetGroinExposed"
				]
			}
		]),
		hitfx : ["tentacleStretch"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaStretch, stdTag.metaPenetration, stdTag.metaPainful, stdTag.metaUsedTentacles],
	},

	{ text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles", "ttWedgie", "targetWearsLowerBody", 'targetLowerBodyDamaged'
		]),
		hitfx : ["tentacleStretch"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotClothes, stdTag.metaStretch, stdTag.metaUsedTentacles],
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([ 
			"action_stdAttack", "action_not_crit", "senderHasTentacles", "targetUpperBodyHard", "targetBreasts", "targetUpperBodyDamaged"
		]),
		hitfx : ["tentacleWhip"],		
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaWhip, stdTag.metaUsedTentacles],
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasTentacles","targetLowerBodyHard", "targetLowerBodyDamaged"
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaUsedTentacles],
	},
	{ text : "%S flicks %T's %groin with a tentacle, lashing the front of %This %TclothLower around!",
		armor_slot : Asset.Slots.lowerBody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles","targetLowerBodyNotHard","targetWearsLowerBody","targetPenis", "targetLowerBodyOrNoDamage",
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaJiggle, stdTag.metaPainful],
	},
	{ text : "%S whaps a thick tentacle up across %T's %groin!",
		armor_slot : Asset.Slots.lowerBody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles", "targetLowerBodyOrNoDamage",
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S whaps a thick tentacle up across %T's %Tbsize %breasts, staggering the %Trace backwards!",
		armor_slot : Asset.Slots.upperBody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles", "targetUpperBodyOrNoDamage", "targetBreasts"
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S whaps a thick tentacle up across %T's %Trsize %butt, staggering the %Trace forwards!",
		armor_slot : Asset.Slots.lowerBody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles", "targetLowerBodyOrNoDamage",
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerBodyNotHard","targetWearsLowerBody","targetPenis", "targetLowerBodyOrNoDamage"
		]),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaJiggle, stdTag.metaPainful],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %penis before firmly constricting %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles","targetWearsLowerBody","targetPenis", "targetLowerBodyOrNoDamage",
		]),
		hitfx : ['tentacleSqueeze'],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaSqueeze, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %penis and constricting it!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasTentacles","targetWearsLowerBody","targetPenis", "targetLowerBodyOrNoDamage"
		]),
		metaTags : [stdTag.metaSlotPenis, stdTag.metaSqueeze, stdTag.metaUsedTentacles, stdTag.metaPainful],
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S smacks %T's %Tpsize exposed %penis with a tentacle!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit", 
			"senderHasTentacles",
			{
				conditions : [
					"targetNoLowerBody",
					"targetGroinExposed"
				]
			},
			"targetPenis", "targetLowerBodyOrNoDamage"
		]),
		hitfx : ['tentacleWhip'],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},

	// Cocktopus
	{ text : "%S lashes %Shis bulbed tentacle across %T's %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderIsCocktopus", "targetLowerBodyOrNoDamage"
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	// Latched
	{ text : "%S latches %Shis tentacles around %T's %Tbsize %breasts, constricting them hard!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts", "targetUpperBodyOrNoDamage"
		]),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaSqueeze, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches %Shis tentacles around %T's nipples and starts tugging outwards!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts", "targetUpperBodyOrNoDamage"
		]),
		hitfx : ["tentacleStretch"],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches onto %T's back and starts whipping %This %Trsize %butt with its bulbous tentacles!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderIsCocktopus","senderLatchingToTarget", "targetLowerBodyOrNoDamage",
		]),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches its tentacles around %T's neck and constricts!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderIsCocktopus","senderLatchingToTarget"
		]),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaUsedTentacles],
	},
	{ text : "%S latches onto %T's back and lashes %This %Tbsize %breasts a %few times from behind!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderIsCocktopus","senderLatchingToTarget",
			"targetBreasts", "targetUpperBodyOrNoDamage",
		]),
		armor_slot : "upperBody",
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches onto %T's legs and smacks %Shis bulbous tentacle across %This %groin a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderIsCocktopus","senderLatchingToTarget","targetLowerBodyOrNoDamage",
		]),
		armor_slot : "lowerBody",
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches onto %T's %Trsize %butt and gives it a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderIsCocktopus","senderLatchingToTarget","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaBite, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "%S latches onto %T's %Tbsize %leftright %breast and gives %This nipple a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderIsCocktopus","senderLatchingToTarget","targetUpperBodyOrNoDamage",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaSlotNipple, stdTag.metaBite, stdTag.metaUsedTentacles, stdTag.metaPainful],
	},

	// Crab
	{ text : "%S punches %T's %leftright leg with %Shis claw!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsTentacrab"),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful],
	},
	{ text : "%S punches %T's %Trsize %leftright buttcheek with %Shis claw!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsTentacrab","targetLowerBodyOrNoDamage",),
		metaTags : [stdTag.metaSlotButt, stdTag.metaPunch, stdTag.metaPainful],
		hitfx : ["punch"]
	},
	{ text : "%S throws a claw punch at %T!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsTentacrab"),
		metaTags : [stdTag.metaPunch, stdTag.metaPainful],
		hitfx : ["punch"]
	},
	{ text : "%S reaches %Shis claws up between %T's legs and pinches %This %groin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsTentacrab"),
		metaTags : [stdTag.metaPinch, stdTag.metaPainful],
		hitfx : ["pinch"],
		armor_slot : Asset.Slots.lowerBody
	},
	{ text : "%S reaches up and pinches a firm hold of the front of %T's %TclothLower, stretching the piece down and exposing the %Trace's %Tgenitals!",
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsTentacrab"),
		turnTags : [stdTag.ttGroinExposed],
		metaTags : [stdTag.metaPinch, stdTag.metaUsedClaw, stdTag.metaSlotGroin],
		hitfx : ["pinch"],
		armor_slot : Asset.Slots.lowerBody
	},

	// Lamprey
	{ text : "%S latches its sucker mouth onto %T's %butt and clamps down %firmly!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetLowerBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotButt],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S pinches its sucker mouth onto %T's nose!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetArmorNotDamagedOrStripped"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches its sucker mouth onto %T's %groin and pinches down %firmly!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_crit","senderIsLamprey", "targetLowerBodyNotHard", "targetLowerBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotGroin],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches its sucker mouth onto %T's clit and pinches down %firmly!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_crit","senderIsLamprey", "targetLowerBodyOrNoDamage", "targetVaginaExposed"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotClit],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches its sucker mouth onto %T's %Tbsize %leftright %breast and clamps down %firmly!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_crit","senderIsLamprey", "targetUpperBodyNotHard", "targetBreasts", "targetUpperBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotBreast],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches its sucker mouth onto the bottom of %T's %Tbsize %leftright %breast and pinches it!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetUpperBodyNotHard", "targetBreasts", "targetUpperBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotBreast],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches onto %T and pinches %This %leftright nipple!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetUpperBodyNotHard", "targetBreasts", "targetUpperBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotNipple],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches onto %T, pinches %This %leftright nipple, and tries to swim away. Stretching it out in the process!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetUpperBodyNotHard", "targetBreasts", "targetUpperBodyOrNoDamage"),
		metaTags : [stdTag.metaBite, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotNipple],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S wraps its body around and squeezes down on %T's %Tbsize %leftright %breast!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsLamprey", "targetUpperBodyNotHard", "targetBreasts", "targetUpperBodyOrNoDamage"),
		metaTags : [stdTag.metaSqueeze, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotBreast],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S wraps its body around and squeezes down on %T's %Tpsize %groin!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_crit","senderIsLamprey", "targetLowerBodyNotHard", "targetPenis", "targetLowerBodyOrNoDamage"),
		metaTags : [stdTag.metaSqueeze, stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotGroin],
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S slips into %T's %TclothLower and starts swimming rapidly, stretching the piece out and exposing %This %groin!",
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsLamprey", "targetLowerBodyNotHard", "targetLowerBodyDamaged"),
		weight : Text.Weights.high,
		turnTags : [stdTag.ttGroinExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S slips into %T's %TclothLower and starts swimming down rapidly, tugging the piece off!",
		conditions : anyOnHumCond.concat("action_stdAttack", "senderIsLamprey", "targetLowerBodyNotHard", "targetLowerBodyStripped", "targetLowerBodyCanPullDown"),
		weight : Text.Weights.high,
		turnTags : [stdTag.ttGroinExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S slips into %T's %TclothUpper and starts swimming rapidly, stretching the piece up and exposing %This %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_stdAttack", "senderIsLamprey", "targetBreasts", "targetUpperBodyNotHard", "targetUpperBodyCanPullUp", "targetUpperBodyDamaged"),
		weight : Text.Weights.high,
		turnTags : [stdTag.ttBreastsExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaSlotClothes, stdTag.metaSlotBreasts],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S wraps around %T's butt-string and starts swimming away, %firmly stretching %This %TclothLower!",
		conditions : anyOnHumCond.concat("action_stdAttack", "senderIsLamprey", "targetWearsThong"),
		weight : Text.Weights.high,
		turnTags : [stdTag.ttButtExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
		hitfx : ["tentacleStretch"]
	},

	// Anemone
	{ text : "%S starts tugging at %T's ankles, painfully stretching them apart!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsAnemone", "targetGrappledByMe"),
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaSlotClothes, stdTag.metaSlotGroin, stdTag.metaPainful],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S hoops a tentacle around the back of %T's %TclothLower and tugs at the same time as it pushes %This hips forward, exposing %This %butt!",
		turnTags : [stdTag.ttButtExposed],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsAnemone", "targetGrappledByMe", "targetLowerBodyDamaged", "targetLowerBodyCanPullDown"),
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotButt],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S hoops a tentacle around the front of %T's %TclothLower and gives a hard yank down, exposing %This %Tgenitals!",
		turnTags : [stdTag.ttGroinExposed],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsAnemone", "targetGrappledByMe", "targetLowerBodyDamaged", "targetWearsThong"),
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S slips two tendrils around %T's nipples from behind at the same time as it pushes a thicker one against %This back, stretching the %Trace's %Tbsize %breasts out to the sides!",
		turnTags : [stdTag.ttButtExposed],
		conditions : anyOnHumCond.concat("action_stdAttack", "action_crit","senderIsAnemone", "targetGrappledByMe", "targetBreastsExposed"),
		metaTags : [stdTag.metaStretch, stdTag.metaPainful, stdTag.metaSlotBreasts, stdTag.metaSlotNipples],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S wraps a tentacle around %T's hair and pulls back, forcing the %Trace's head up!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsAnemone", "targetGrappledByMe", "targetLongHair"),
		metaTags : [stdTag.metaStretch, stdTag.metaWet, stdTag.metaPainful],
		hitfx : ["tentacleStretch"]
	},
	{ text : "%S takes advantage of %T's position and gives %This %Trsize %butt a %few %hard tentacle lashings!",
		conditions : anyOnHumCond.concat("action_stdAttack", "action_not_crit","senderIsAnemone", "targetGrappledByMe"),
		metaTags : [stdTag.metaWet, stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaUsedTentacles],
		hitfx : ["tentacleWhip"]
	},
	

	// Whips
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %butt!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasWhippingProp","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace's %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasWhippingProp","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This chest!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasWhip","targetUpperBodyOrNoDamage",
		]),
		armor_slot : Asset.Slots.upperBody,
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotBreasts],
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This %leftright %breast!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasWhip","targetBreasts","targetUpperBodyOrNoDamage",
		]),
		armor_slot : Asset.Slots.upperBody,
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotBreast],
	},
	{ text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %breasts!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasWhip","targetBreasts","targetUpperBodyNotHard","targetUpperBodyOrNoDamage",
		]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaWhip, stdTag.metaSqueeze, stdTag.metaUsedWhip, stdTag.metaSlotBreasts],
	},
	{ text : "%S takes advantage of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %Trsize %butt!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasWhippingProp","targetKnockedDownFront","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["whipDouble"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	{ text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %butt!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","ttBentOver","senderHasWhippingProp","targetLowerBodyOrNoDamage",),
		weight : Text.Weights.high,
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	{ text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across both of the %Trace's %Trsize buttcheeks!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","ttBentOver","senderHasWhippingProp","targetLowerBodyOrNoDamage",),
		weight : Text.Weights.high,
		hitfx : ["whipDouble"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace across %This %groin!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_crit","senderHasWhippingProp","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedWhip, stdTag.metaSlotButt],
	},
	

	// paddle
	{ text : "%S gets behind %T and brings %This %Sgear down across %T's exposed buttcheeks!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasPaddle","targetLowerBodyOrNoDamage","targetButtExposedOrThong"),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S gets behind %T firmly swats %This the %Trace's %Trsize %butt with %Shis %Sgear!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasPaddle","targetLowerBodyOrNoDamage"),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S gets behind %T firmly swipes %Shis %Sgear up at the %Trace's %Trsize %butt from below!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","senderHasPaddle","targetLowerBodyOrNoDamage", "targetTaller"),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaSlotButt],
	},

	// Bondage
	{ text : "%S gets behind the restrained %Trace and lashes %Shis %Sgear across %This %Trsize %butt!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_not_crit","targetBoundStocks","senderHasWhippingProp","targetLowerBodyOrNoDamage"),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S gets behind %T while %The's restrained and bent forwards! The %Srace raises %This %Sgear high in the air before swatting it down, clapping painfully against both %T's exposed buttcheeks!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack", "action_crit","targetBoundStocks","senderHasPaddle","targetLowerBodyOrNoDamage","targetButtExposedOrThong"),
		hitfx : ["whipDouble"],
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaSlotButt],
	},


	// DildoSpear
	{ text : "%S whacks %T across %This %Trsize %butt with %Shis %Sgear!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "action_not_crit","senderHasDildoSpear","targetLowerBodyOrNoDamage",
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	
	
	



	// stdArouse
	{ text : "%S tickles %T!",
		conditions : baseCond.concat([
			"action_stdArouse", "senderBeast"
		]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaTickle],
	},
	{ text : "%S tickles %T!",
		conditions : baseCond.concat([
			"action_stdArouse","targetBeast"
		]),
		metaTags : [stdTag.metaTickle],
		hitfx : ["tickle"]
	},
	{ text : "%S grabs a hold of and rubs %T's %butt!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaSlotButt],
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This %groin!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit"
		]),
		metaTags : [stdTag.metaRub, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %breasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaSlotBreasts, stdTag.metaArousing],
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit","targetBreasts","targetUpperBodyHard"
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaSlotBreasts, stdTag.metaArousing],
	},
	{ text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %breasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit","targetBreasts","targetKnockedDownFront","targetTaller"
		]),
		metaTags : [stdTag.metaRub, stdTag.metaSlotBreasts, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %breasts before jiggling them around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{conditions :[
				"targetUpperBodyNotHard",
				"targetBreastsExposed"
			]}
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaArousing, stdTag.metaSqueeze],
	},

	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbsize %leftright %breast and gives it a %few rapid licks!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "targetBreasts", "targetKnockedDownBack", "targetTaller", "targetBreastsExposed"
		]),
		metaTags : [stdTag.metaLick, stdTag.metaSlotBreast, stdTag.metaArousing, stdTag.metaSqueeze],
		hitfx : ["squeeze"]
	},
	{ text : "%S slips between the larger %Trace's legs and licks across %This %groin!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetMuchTaller", "senderIsImp"]),
		metaTags : [stdTag.metaLick, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips between the larger %Trace's legs, pushes %Shis mouth up across %T's %groin and starts licking, paying extra attention to the sides not covered by %This %TclothLower!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetTaller", "senderIsImp", "targetVagina", "targetWearsSemiExposedGroin"]),
		metaTags : [stdTag.metaLick, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squishTiny"]
	},

	{ text : "%S slips underneath the knocked down %Trace's legs and lifts %This hips off the ground before shoving %Shis head down at %This %groin, starting to furiously lick at it!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetMuchTaller", "senderIsImp", "targetKnockedDownBack", "targetVagina", "targetLowerBodyNotHard"]),
		metaTags : [stdTag.metaLick, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squishLong"]
	},

	{ text : "%S jumps onto the knocked down %Trace's back, squeezes a firm hold of %T's %Trsize buttcheeks and jiggles them around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit","targetKnockedDownFront","targetTaller",
			{conditions:[
				"targetWearsThong",
				"targetNoLowerBody"
			]}
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaJiggle, stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaSqueeze],
	},
	{ text : "%S reaches down towards %T's bulge and teasingly squeezes it!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit","targetWearsLowerBody","targetPenis","targetShorter"
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "%S takes advantage of %T being bent over and fondles %This %groin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","ttBentOver"),
		weight : Text.Weights.high,
		metaTags : [stdTag.metaRub, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},

	{ text : "%S manages to grab a hold of %T's %Tpsize %penis through %This stretchy %TclothLower, rubbing it against the fabric!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "targetWearsLowerBody", "targetLowerBodyStretchy", "targetPenis"),
		metaTags : [stdTag.metaRub, stdTag.metaSlotGroin, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S slips behind %T, wrapping %Shis arms around the %Trace's waist before thrusting inside %This %rear %rapidly! The %Srace manages to thrust for a little bit before letting go, pushing %T away from %Shim!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "targetButtExposed", "targetNotTaller", "senderPenis"),
		metaTags : [stdTag.metaUsedPenis, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaPenetration],
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips behind %T, wrapping %Shis arms around the %Trace's waist before thrusting inside %This %vagina %rapidly! The %Srace manages to thrust for a little bit before letting go, pushing %T away from %Shim!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "targetVaginaExposed", "targetNotTaller", "senderPenis"),
		metaTags : [stdTag.metaUsedPenis, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration],
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips behind %T and grabs at the back of %This %TclothLower, tugging it aside and wrapping %Shis arms around the %Trace's waist before thrusting %Shis %Spsize %penis inside %T's %vagina %rapidly!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "targetVagina", "targetWearsThong", "targetNotTaller", "senderPenis"),
		metaTags : [stdTag.metaUsedPenis, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration],
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S gropes %T's exposed %groin, teasingly running his hand across the %Trace's length while %Shis other hand cups %T's balls!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "targetPenisExposed"),
		metaTags : [stdTag.metaSlotPenis, stdTag.metaSlotBalls, stdTag.metaArousing, stdTag.metaRub],
		hitfx : ["squeeze"]
	},

	{ text : "%S slips behind %T, putting %Thim into a chokehold before reaching around %Shis free hand, slipping it over the %Trace's %groin and rubbing it for a few moments before %T eventually manages to break free!",
		conditions : humOnHumCond.concat([ "action_stdArouse", "action_not_crit", "targetNotTaller"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaRub],
	},

	

	{ text : "%S slinks %Shis hand inside %T's %TclothLower and rigidly fondles %This %penis!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetPenis", "targetWearsLowerBody"
		]),
		metaTags : [stdTag.metaRub, stdTag.metaSlotPenis, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S wraps %Shis hand around %T's %penis and gives it a couple of rapid strokes!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetPenis", "targetPenisExposed"
		]),
		metaTags : [stdTag.metaRub, stdTag.metaSlotPenis, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S slinks %Shis hand into %T's %TclothLower and pushes a finger into the %Trace's %vagina, wriggling it around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVagina", "targetWearsLowerBody"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFinger],
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips a finger around the back-string of %T's %TclothLower and tugs the groin-covering aside before pushing two fingers up inside the %Trace's %vagina, thrusting them in and out of the %Trace a %few times in rapid succession!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVagina", "targetWearsThong"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFinger],
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips behind %T and pushes two fingers up inside the %Trace's %vagina, thrusting them in and out of the %Trace a %few times in rapid succession!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVagina", "targetVaginaExposed"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFinger],
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips a finger up inside the %Trace's exposed %vagina, wriggling it around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVagina", "targetVaginaExposed"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFinger],
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips a finger up inside the %Trace's exposed %butt, wriggling it around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetButtExposed"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaUsedFinger],
		hitfx : ["squishTiny"]
	},
	{ text : "%S takes advantage of %Shis smaller size and slips between %T's legs, forcing %Shis entire hand up the %Trace's exposed %vagina, churning it around briefly!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVaginaExposed", "targetMuchTaller"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFist],
		hitfx : ["squishTiny"]
	},
	{ text : "%S, the smaller %Srace manages to get behind %T and tug at %This butt-string, exposing %This %vagina before shoving %Shis entire hand inside, churning it around briefly!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "targetVagina", "targetMuchTaller", "targetWearsThong"
		]),
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedFist],
		hitfx : ["squishTiny"]
	},



	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %penis inside the %Trace's %vagina and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","ttBentOver","targetVagina","senderPenis"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},

	{ text : "%S grabs a hold of the knocked down %Trace's legs, lifting them into the air before shoving %Shis %Spsize %penis inside %T's %vagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetKnockedDownBack","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},
	{ text : "%S grabs a hold of the knocked down %Trace's hips, lifting %This %Trsize %butt into the air before shoving %Shis %Spsize %penis inside %T's %vagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetKnockedDownBack","targetVaginaExposed","senderPenis"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},

	{ text : "%S raises %T's hips into the air and forces %Shis %Spsize %penis towards the %Trace's %Trsize %butt, grinding back and forth between %This exposed buttcheeks!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetKnockedDown","senderPenisExposed","targetButtExposedOrThong"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaArousing],
	},
	{ text : "%S slips some fingers up between %T's buttcheeks and gives the string of %This %TclothLower a few scratches!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetWearsThong"),
		hitfx : ["scratchItch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedFinger, stdTag.metaArousing],
	},
	{ text : "%S grabs at %T's %Tbsize %breasts and shoves %Shis face between them, shaking %Shis head about!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBreasts","targetUpperBodyNotHard"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaArousing],
	},
	{ text : "%S grabs at %T's hips and shoves %Shis face into the %Trace's %groin, shaking %Shis head about!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetPenis","targetLowerBodyNotHard","targetTaller"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing],
	},


	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %penis inside the %Trace's %Trsize %butt and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","ttBentOver","senderPenis","targetNoLowerBody","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},

	{ text : "%S jumps onto the table and grabs a hold of %T's face, shoving %Shis %Spsize %penis inside and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","ttBentOverTable","senderPenis"),
		weight : Text.Weights.max,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotMouth, stdTag.metaUsedPenis, stdTag.metaArousing],
	},

	{ text : "%S slips %Shis hand between %T's legs and forces a finger up the %Trace's %groin, wiggling it inside %Thim!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_crit", "targetGroinExposed", "targetVagina"]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaUsedFinger, stdTag.metaVeryArousing],
	},
	{ text : "%S slips %Shis hand behind %T and tickles the %Trace's %butt!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetButtExposed"]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedFinger, stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S slips %Shis hand up between %T's legs and tickles %This %groin!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetLowerBodyNotHard"]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedFinger, stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S slips %Shis long and index finger up between %T's legs and quickly tickles at the exposed sides not covered by the %Trace's %TclothLower!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetWearsSemiExposedGroin", "targetVagina", "targetTaller"]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedFinger, stdTag.metaArousing, stdTag.metaTickle],
	},

	{ text : "%S grabs a straw from a nearby hay bale and slips it between %T's legs, tickling the exposed sides of %This %vagina!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetWearsSemiExposedGroin", "targetVagina", "roomHaybale"]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S grabs a straw from a nearby hay bale and slips it between %T's legs, tickling %This exposed clit!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetVaginaExposed", "roomHaybale"]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotClit, stdTag.metaArousing, stdTag.metaTickle],
	},
	

	{ text : "%S grabs a hold of the %leftright string of %T's %TclothUpper and starts shaking it, jiggling the %Trace's %Tbsize %breast %around!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_not_crit", "targetVagina", "targetTaller", "targetWearsSlingBikini"]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSlotBreast, stdTag.metaJiggle, stdTag.metaArousing],
	},

	{ text : "%S slips behind %T's and surprises the %Trace by stuffing %Shis %Spsize %penis up into %This %vagina, landing a %few thrusts!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_crit", "targetGroinExposed", "targetVagina", "senderPenis"]),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},
	{ text : "%S slips behind %T's and surprises the %Trace by stuffing %Shis %Spsize %penis up into %This %Trsize %butt, landing a %few thrusts!",
		conditions : humOnHumCond.concat(["action_stdArouse", "action_crit", "targetButtExposed", "senderPenis"]),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing],
	},

	{ text : "%S slips %Shis hand between %T's legs and rubs %This exposed clit!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "targetNoLowerBody", "targetVagina"
		]),
		metaTags : [stdTag.metaSlotClit, stdTag.metaUsedFinger, stdTag.metaVeryArousing],
		hitfx : ["squishTiny"]
	},

	{ text : "%S get behind %T and lashes %Shis long demonic tongue up across %T's %groin, pushing it firmly against the %Trace as %She slides it back and up between %This buttcheeks, leaving sticky saliva behind!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "targetTaller", "senderTongue", "targetWearsThong", "senderIsImp"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTongue, stdTag.metaArousing, stdTag.metaSlotButt],
	},

	{ text : "%S shoves %T from behind, bending %Thim over a table before slipping %Shis %Spsize %penis inside the %Trace's %vagina, landing a %few thrusts!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","roomTable","senderDishonorable","targetVagina"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedPenis, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S shoves %T from behind, bending %Thim over a table before slipping %Shis %Spsize %penis inside the %Trace's %Trsize %butt, landing a %few firm thrusts!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","roomTable","senderDishonorable","targetButtExposed"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},


	{ text : "%T jumps onto the knocked down %Trace's back and grabs %This wrist, pinning them behind %This back. %S immediately %starts %roughly %thrusting %Shis %Spsize %penis into %T's %rear, keeping the %Trace pressed down to the ground!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "targetButtExposed", "targetKnockedDownFront"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},

	
	

	// Dishonorable
	{ text : "%S licks %Shis hand and slips it inside %T's %TclothLower from the front, rubbing the sticky saliva into it and tickling the %Trace's %groin in the process!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderTongue", "senderDishonorable", "targetWearsLowerBody"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTongue, stdTag.metaArousing],
	},
	{ text : "%S sticks %Shis long and index fingers in %Shis mouth, coating it in demonic saliva! Before %T can react, the %Srace slips behind %Thim, tugs the bottom of %This %TclothLower aside and jabs the wet fingers up into %T's %vagina, wiggling the fingers around inside %Thim!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "senderTongue", "senderDishonorable", "targetWearsThong", "senderIsImp", "targetTaller"
		]),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaVeryArousing, stdTag.metaGooey, stdTag.metaUsedFinger],
	},
	{ text : "%S sticks %Shis long and index fingers in %Shis mouth, coating it in demonic saliva! Before %T can react, the %Srace slips behind %Thim and jabs the wet fingers up into %T's %vagina, wiggling the fingers around inside %Thim!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "senderTongue", "senderDishonorable", "targetWearsThong", "senderIsImp", "targetTaller"
		]),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaVeryArousing, stdTag.metaGooey, stdTag.metaUsedFinger],
	},
	{ text : "%S licks %Shis hand, coating it in demonic saliva before prodding it up between %T's legs, taking extra care to rub it into the exposed sides of the %Trace's %vagina not covered by %This %TclothLower!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderTongue", "senderDishonorable", "targetWearsSemiExposedGroin", "targetVagina", "senderIsImp"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedFinger, stdTag.metaArousing],
	},
	{ text : "%S licks %Shis hand and slips it inside %T's %TclothLower from the front, cupping the %Trace's package and rubbing sticky saliva allover it!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderTongue", "senderDishonorable", "targetWearsLowerBody", "targetPenis"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTongue, stdTag.metaArousing],
	},
	{ text : "%S sticks %Shis finger in %Shis mouth and coats it with saliva before jabbing it towards %T's %TclothLower, slipping it in from the side! The %Srace quickly prods a slimy finger up beneath the larger %Trace's foreskin, tickling the tip of %This %Tpsize %penis!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "action_crit", "senderTongue", "senderDishonorable", "targetWearsLowerBody", "targetPenis", "targetNotCircumcised"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaUsedTongue, stdTag.metaVeryArousing, stdTag.metaGooey],
	},
	
	{ text : "%S grabs a nearby bottle and slips behind %T! Before the %Trace can react, %S thrusts the bottle's head up between %T's buttcheeks and into %This %Trsize %butt!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "senderDishonorable", "roomBottle", "targetButtExposed"),
		hitfx : ["punch", "squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaPenetration],
	},
	{ text : "%S grabs a nearby bottle and slips behind %T! Before the %Trace can react, %S thrusts the bottle's head up between %T's legs and into %This %vagina!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "senderDishonorable", "roomBottle", "targetVaginaExposed"),
		hitfx : ["punch", "squishTiny"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaArousing, stdTag.metaPenetration],
	},

	{ text : "%S takes advantage of %T's vulnerable position and runs %This tongue over the %Trace's %rear, slipping %Shis tongue inside of %T's %butt and wiggling it around!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "senderIsImp", "ttBentOverTable", "targetButtExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTongue],
	},
	{ text : "%S takes advantage of %T's vulnerable position and runs %This tongue over the %Trace's %groin, slipping %Shis tongue inside of %T's %vagina and wiggling it around!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit", "senderIsImp", "ttBentOverTable", "targetVaginaExposed"),
		hitfx : ["squishTiny"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTongue],
	},
	{ text : "%S grabs at %T's hips and lifts %This %butt into the air! The %Srace slips %Shis %Spsize %penis between the %Trace's legs and starts grinding it against %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "senderIsImp", "targetVagina", "targetLowerBodyNotHard", "targetKnockedDownFront", "senderPenis"),
		hitfx : ["squishTiny"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaUsedPenis],
	},



	{ text : "%S grabs at %T's hips and lifts %This %butt into the air before plunging %Shis head down between the %Trace's legs and starts licking rapidly at %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "senderIsImp", "targetVagina", "targetLowerBodyNotHard", "targetKnockedDownFront"),
		hitfx : ["squishTiny"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick],
	},
	{ text : "%S grabs a hold of %T's ankles and lifts %This legs into the air before plunging %Shis head down between the %Trace's legs, licking rapidly at %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "senderIsImp", "targetVagina", "targetLowerBodyNotHard", "targetKnockedDownBack"),
		hitfx : ["squishTiny"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick],
	},


	


	// Hogtied
	{ text : "%S slips behind the hogtied %Trace and spreads %This legs, shoving %Shis %Spsize %penis inside the %Trace's %Trsize %butt and thrusting a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","targetVagina","targetGroinExposed","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips behind the hogtied %Trace, tugging the back of %T's %TclothLower down and spreading %This legs. %S immediately shoves %Shis %Spsize %penis inside the %Trace's %Trsize %butt and starts %firmly pounding %T's %Trsize %butt!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","senderPenis", "targetLowerBodyWaistband", "targetLowerBodyNotHard"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedPenis, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S crouches by the hogtied %Trace and grabs a hold of %This head, shoving %Shis %Spsize %penis inside and thrusting a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaUsedPenis, stdTag.metaArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and rubs %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetHogtied"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaRub, stdTag.metaArousing],
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and forces a finger up inside %T's %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","targetVagina","targetGroinExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down across the hogtied %Trace's %Trsize %butt and forces a finger up inside, wiggling it around!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","targetButtExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and forces a finger inside %T's %TclothLower and up inside %This %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","targetVagina","targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down the hogtied %Trace's %TclothLower and forces a finger up inside %This %Trsize %butt, wiggling it around!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetHogtied","targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and wraps it around %T's %Tpsize %penis, giving it a %few rapid tugs!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "targetHogtied","targetPenis","targetLowerBodyWaistband"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaVeryArousing, stdTag.metaRub],
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and wraps it around %T's %Tpsize %penis. The %Srace tugs %T's foreskin backwards and starts stroking %This %penis up and down across the inside of %This %TclothLower!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "targetHogtied","targetPenis","targetLowerBodyWaistband","targetNotCircumcised"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaVeryArousing, stdTag.metaRub],
	},



	// Bondage machines
	// Table
	{ text : "%S hops onto the table %T is tied to and forces %Shis %Spsize %penis inside %This %vagina, humping the bound %Trace for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable","targetVaginaExposed", "senderPenis"),
		hitfx : ["slowThrusts"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S hops onto the table %T is tied to, slips the bottom of %T's %TclothLower to the side and forces %Shis %Spsize %penis inside %This %vagina, humping the bound %Trace for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable","targetVagina", "senderPenis", "targetWearsThong"),
		hitfx : ["slowThrusts"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S hops onto the table %T is tied to and pushes %Shis head up between the %Trace's legs, rapidly licking across %This exposed %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable","targetVagina", "targetWearsLowerBody", "targetLowerBodyNotHard", "targetTaller"),
		hitfx : ["squishLong"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaLick, stdTag.metaArousing, stdTag.metaUsedTongue],
	},
	{ text : "%S takes advantage of %T's restraints and tickles %This feet!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotFoot, stdTag.metaTickle, stdTag.metaUsedFinger],
	},
	{ text : "%S takes advantage of %T's restraints and tickles %This vulnerable %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaTickle, stdTag.metaUsedFinger],
	},
	{ text : "%S takes advantage of %T's restraints and prods both %Shis index fingers against the exposed sides of %T's %groin not covered by %This %TclothLower! A short moment later, the %Srace starts quickly tickling the area!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable", "targetVagina", "targetWearsSemiExposedGroin"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaTickle, stdTag.metaUsedFinger],
	},
	
	{ text : "%S hops onto the table %T is tied to and forces %Shis %Spsize %penis inside the %Trace's mouth, grabbing a hold of %This head before thrusting a few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundTable", "senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaPenetration, stdTag.metaUsedPenis],
	},
	{ text : "%S hops onto %T's stomach and grabs a firm hold of the %Trace's %TclothUpper before tugging it out of the way and exposing %This %Tbsize %leftright %breast! The %Srace %quickly plants %Shis mouth across %T's nipple and starts sucking %firmly!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "targetBoundTable", "senderDishonorable", "targetBreasts", "targetUpperBodyNotHard", "senderIsImp"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedMouth, stdTag.metaSuck, stdTag.metaSlotNipple, stdTag.metaArousing],
	},
	{ text : "%S hops onto %T's stomach and %quickly plants %Shis mouth across %T's %leftright nipple and starts sucking %firmly!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "targetBoundTable", "targetBreastsExposed", "senderIsImp"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedMouth, stdTag.metaSuck, stdTag.metaSlotNipple, stdTag.metaArousing],
	},
	



	// Stocks
	{ text : "%S slips behind %T and forces %Shis %Spsize %penis inside %This %vagina, humping the bound %Trace from behind!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","targetVaginaExposed","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S slips behind %T and forces %Shis %Spsize %penis inside %This %Trsize %butt, humping the bound %Trace from behind!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","targetButtExposed","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S gets behind %T and tugs the bottom of %This %TclothLower aside before plunging %Shis %Spsize %penis inside %This %vagina! %S grabs a firm hold of %T's hips before starting to rapidly pound the tied down %Trace!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","targetWearsThong","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S gets behind %T and tugs the bottom of %This %TclothLower aside before plunging %Shis %Spsize %penis inside %This %Trsize %butt! %S grabs a firm hold of %T's hips before starting to rapidly pound the tied down %Trace!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","targetWearsThong","senderPenis"),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaUsedPenis],
	},
	{ text : "%S slips in between %T's legs, taking advantage of %This position! The %Srace tugs the bottom of %T's %TclothLower aside and slinks %Shis tongue inside %T's %vagina, wriggling it about inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","senderDishonorable", "targetMuchTaller", "targetVagina", "targetWearsThong"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaLick],
	},
	{ text : "%S slips in between %T's legs, taking advantage of %This position! The %Srace quickly slinks %Shis tongue inside %T's %vagina, wriggling it about inside %Thim for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundStocks","senderDishonorable", "targetMuchTaller", "targetVagina"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaLick],
	},
	{ text : "%S slinks up behind %T and grabs a firm hold of %This exposed buttcheeks, surprising the strapped down %Trace by sliding %Shis long tongue up between them!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundStocks","senderIsImp", "targetButtExposedOrThong"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaLick, stdTag.metaUsedTongue],
	},
	{ text : "%S slips underneath %T, surprising the restrained %Trace by rapidly licking %T %groin with %Shis large soggy tongue!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetBoundStocks","senderIsGhoul"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick, stdTag.metaUsedTongue, stdTag.metaWet],
	},

	// targetBoundSybian
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace grabs a firm hold of %T's hips and pushes %Thim down %butt first onto it, forcing %Thim all the way down to its base!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundSybian","targetButtExposed"),
		hitfx : ["squishLong", "vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaVibration],
	},
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace grabs a firm hold of %T's hips and pushes %Thim down %groin first onto it, forcing %Thim all the way down to its base!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundSybian","targetVaginaExposed"),
		hitfx : ["squishLong", "vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaVibration],
	},
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace tugs %T's %TclothLower aside and forces %Thim down %butt first onto the device, all the way to its base!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundSybian","targetLowerBodyNotHard", "targetWearsLowerBody"),
		hitfx : ["squishLong", "vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaVibration],
	},
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace tugs %T's %TclothLower aside and forces %Thim down %groin first onto the device, all the way to its base!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundSybian","targetLowerBodyNotHard", "targetWearsLowerBody", "targetVagina"),
		hitfx : ["squishLong", "vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaVibration],
	},
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace pushes %T back and down towards it, making it bend and slip up between the %Trace's buttcheeks, tickling between them!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetButtExposedOrThong"),
		hitfx : ["vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaVibration],
	},
	{ text : "%S flicks the flexible appendage attached to %T's device and flicks it up between %This buttcheeks!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetButtExposedOrThong"),
		hitfx : ["whip", "vibrationHit"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaVibration],
	},
	{ text : "%S hops up behind %T and grabs at the front of %This %TclothLower, tugging up %firmly while pushing %This %groin down against the vibrating appendage firmly tickling %This nether regions!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetLowerBodyNotHard","targetVagina"),
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaVibration, stdTag.metaTickle],
	},
	{ text : "%S grasps a hold of %T's hair from the front and starts tugging down, forcing the %Trace to bend forward on the vibrating piece of the chair, focusing the vibrations across %This clit!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetVagina", "targetLongHair", "senderDishonorable"),
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaSlotClit, stdTag.metaArousing, stdTag.metaVibration, stdTag.metaTickle],
	},
	{ text : "%S grasps a hold of %T's hair from the back and places a foot on %This %Trsize %butt, shoving %This %groin into the vibrating piece of the bondage equipment while simultaneously arching %This chest upwards!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetVagina", "targetLongHair", "senderDishonorable"),
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaVibration, stdTag.metaTickle],
	},
	{ text : "%S grasps a hold of %T's hair from the back and places a foot on %This %Trsize %butt, causing the vibrating piece of the bondage equipment to sandwich up between %This buttcheeks!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetVagina", "targetLongHair", "senderDishonorable"),
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaSlotClit, stdTag.metaArousing, stdTag.metaVibration, stdTag.metaTickle],
	},


	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace pushes %T down and forwards towards it, making it bend as it slips between %This legs, tickling %This %groin!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetLowerBodyNotHard", "targetVagina"),
		hitfx : ["vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaVibration],
	},
	{ text : "%S flips a switch on the device %T is sat on, causing its rubbery appendage to start vibrating furiously! The %Srace pushes %T down and forwards towards it, making it bend as it's mashed against the front of %This %TclothLower where it tickles %T's %groin!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetBoundSybian","targetLowerBodyNotHard","targetWearsLowerBody"),
		hitfx : ["vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaVibration],
	},
	{ text : "%S hops onto the back of the device %T is sat on and lays %Shis %Spsize %penis flat onto the vibrating bit! The %Srace then grabs a firm hold of %T's hips before pushing %This hips down, allowing the heavy vibrations to spread through %Shis %Spenis up across %T's %vagina!",
		conditions : humOnHumCond.concat("action_stdArouse", "targetBoundSybian","targetWearsLowerBody", "targetLowerBodyNotHard", "senderPenis", "senderIsImp"),
		hitfx : ["vibrationHit"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaVibration],
	},
	{ text : "%S hops onto the back of the device %T is sat on and slips %Shis %Spsize %penis up into the %Trace's %vagina! The %Srace grabs at %T's hips and slides %Thim all the way down on %Shis shaft before seating %Shimself firmly on the vibrating contraption, allowing the vibrations to travel through %Shis %penis into the %Trace for a while before letting %Thim off!",
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetBoundSybian","targetVaginaExposed", "senderPenis"),
		hitfx : ["squishLong"],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaVibration, stdTag.metaUsedPenis, stdTag.metaPenetration],
	},


	// sybian in arena
	{ text : "%S manages to grab a hold of %T's hair and gives it a firm tug down, forcing the %Trace to bend forwards and mashing %This breasts against a vibrating chair!",
		conditions : humOnHumCond.concat("action_stdArouse", "roomSybian", "targetBreasts", "targetLongHair", "senderDishonorable", "targetTaller"),
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaArousing, stdTag.metaVibration],
	},
	
	

	// Restrained table
	{ text : "%S walks up towards %T's head and forces %Shis %Sgear inside %This mouth, grinding it against %This cheek a while before pulling it out!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasDildoSpear", "targetBoundTable"
		]),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaArousing, stdTag.metaSlotMouth, stdTag.metaPenetration],
	},

	// Restrained X
	{ text : "%S sneaks up behind the X shaped contraption that %T is bound to and forces %Shis %gear up inside the %Trace's vulnerable %vagina, allowing %Shim free reign to thrust it with varying degrees of force and angle!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", "targetBoundX", "targetVaginaExposed"
		]),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},
	{ text : "%S sneaks up behind the X shaped contraption that %T is bound to and forces %Shis %gear up inside the %Trace's %Trsize vulnerable %butt, allowing %Shim free reign to thrust it with varying degrees of force and angle!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", "targetBoundX", "targetButtExposed"
		]),
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaPenetration],
	},



	// Generic restrained
	{ text : "%S slips %Shis hand down between the restrained %Trace's legs and forces a finger inside %T's %TclothLower and up inside %This %Trsize %butt, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTiedUp","targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down between the restrained %Trace's legs and forces a finger inside %T's %TclothLower and up inside %This %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTiedUp","targetVagina","targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedFinger, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips %Shis hand down between the restrained %Trace's legs and wraps it around %T's %Tpsize %penis, giving it a %few rapid tugs!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTiedUp","targetPenis","targetLowerBodyWaistband"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaVeryArousing, stdTag.metaRub],
	},
	{ text : "%S slips %Shis hand inside the restrained %Trace's %TclothLower and wraps it around %T's %Tpsize %penis. The %Srace tugs %T's foreskin backwards and starts stroking %This %penis up and down across the fabric!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTiedUp","targetPenis","targetLowerBodyWaistband","targetNotCircumcised"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaVeryArousing, stdTag.metaRub],
	},
	{ text : "%S slips %Shis hand down between the restrained %Trace's legs and rubs %Shis fingers across %T's vulnerable %crotch!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTiedUp"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S slips %Shis head down between the restrained %Trace's legs and starts licking across %This vulnerable %crotch!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "targetTiedUp", "targetTaller"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick],
	},
	{ text : "%S takes advantage of %T being restrained and reaches at the %Trace's sides, tickling up across %This upper body and under %This armpits!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTiedUp"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S surprises the restrained %Trace by grabbing a hold of %This %leftright ankle and rapidly licking %T's foot, tickling it with %Shis soggy tongue!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTiedUp","senderIsGhoul"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotFoot, stdTag.metaTickle, stdTag.metaLick, stdTag.metaUsedTongue, stdTag.metaWet],
	},
	{ text : "%S slips down %T's feet and starts rapidly tickling them, taking advantage of the %Trace being restrained and unable to fight back!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTiedUp"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotFoot, stdTag.metaTickle, stdTag.metaUsedFinger],
	},
	{ text : "%S slithers %Shis long tongue around the restrained %Trace, wrapping it %firmly around %This %Tbsize %leftright %breast and coating it in demonic saliva!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit", "targetTiedUp", "senderIsImp", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotBreast, stdTag.metaUsedTongue, stdTag.metaSqueeze, stdTag.metaLick],
	},
	{ text : "%S grabs a hold of the front straps of the restrained %Trace's %TclothLower and tugs them to the side, exposing %T's breasts before giving %This nipples a %few %rapid tickles!",
		turnTags:[stdTag.ttBreastsExposed],
		conditions : humOnHumCond.concat("action_stdArouse", "targetBoundTable", "targetBreasts", "targetWearsSlingBikini", "senderDishonorable"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaUsedFinger, stdTag.metaTickle, stdTag.metaSlotNipple, stdTag.metaArousing],
	},


	// stdArouse - Tentacles
	{ text : "%S slips a couple of tendrils up between %T's legs, rubbing across %This %groin!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasTentacles",
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S slips a multitude of thin tendrils up between %T's legs, tickling the parts of %T's %vagina not covered by %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasTentacles", "targetVagina", "targetWearsSemiExposedGroin"
		]),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S slips a tendril up between %T's buttcheeks, tickling between them!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderHasTentacles",
			{conditions: [
				"targetWearsThong",
				"targetButtExposed",
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaTickle],
	},
	{ text : "%S pushes a thick a tendril up between %T's buttcheeks, grinding up and down between them!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit", "senderHasTentacles","targetButtExposedOrThong"
		]),
		weight : Text.Weights.high,
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaRub],
	},
	{ text : "%S slips some wiggly tentacles up between %T's legs and tickles the %Trace's inner thighs!",
		conditions : anyOnHumCond.concat("action_stdArouse","action_not_crit","senderHasTentacles"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaTickle],
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %vagina and thrusting a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","senderHasCocktacles","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %vagina, and the other into %This %Trsize %butt. Pumping rhythmically in and out of %T!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit", "senderHasTentacles","targetVagina","targetNoLowerBody"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaSlotButt],
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %butt where it thrusts a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","senderHasCocktacles",
			{conditions:[
				"targetNoLowerBody",
				"ttButtExposed"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %vagina!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetLegsSpread","targetGroinExposed","targetVagina","senderHasCocktacles"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %vagina, rapidly thrusting inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetLegsSpread","targetWearsThong","targetVagina","senderHasCocktacles"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %butt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetLegsSpread","targetKnockedDownFront","targetButtExposed","senderHasCocktacles",
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S takes advantage of %T being knocked down and surprises %Thim with a slimy cock-tipped tentacle slipping inside %This mouth, squirming around and tickling %This cheeks!",

		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasTentacles","targetLegsSpread","targetKnockedDownFront","senderHasCocktacles",
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	
	{ text : "%S surprises %T with a thick tentacle shoved into %This mouth! The tentacle thrusts a couple of times, leaving a gooey residue behind.",

		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasTentacles"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %butt and lands some rapid thrusts, making %This %butt somewhat sticky!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetWearsLowerBody"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle wraps around %This %Tpsize %penis and starts rubbing its slime all over it!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaSqueeze, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaGooey],
	},
	{ text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %vagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetWearsLowerBody","targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %vagina and lands some rapid thrusts inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetWearsThong","targetVagina","targetLowerBodyNotHard"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle wraps around %This %Tpsize %penis and lands some rapid tugs!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsThong","targetPenis","targetLowerBodyNotHard"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasTentacles","targetWearsLowerBody","targetWearsThong"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaGooey],
	},
	{ text : "%S latches a thick tentacle with suction cups onto %T's %groin and performs a few rapid tugs and prods at %This %TclothLower!",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderHasTentacles","targetWearsLowerBody","targetLowerBodyNotHard","ttGroinNotExposed"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S latches two thick tentacles with suction cups onto %T's %breasts and performs a few rapid tugs and prods at %This %TclothUpper!",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderHasTentacles","targetWearsUpperBody","targetUpperBodyNotHard","targetBreasts"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles", "action_not_crit","targetWearsLowerBody","ttPussyWedgie"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub, stdTag.metaTickle],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %vagina and leaving a little slimy residue behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","ttPussyWedgie","targetWearsLowerBody"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub, stdTag.metaTickle],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling %This %groin!",
		conditions : anyOnHumCond.concat(["action_stdArouse", "action_not_crit","senderHasTentacles"]),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaTickle],
	},
	{ text : "%S wraps a tentacle around %T's %Tpsize %penis, allowing a small tendril to slip under %This foreskin, tickling the tip of %This %penis!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles",
			{conditions : ["targetNoLowerBody","ttGroinExposed"]},
			"targetPenis",
			"targetNotCircumcised"
		]),
		weight : Text.Weights.high,
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaRub, stdTag.metaTickle],
	},

	{ text : "%S slips a leafy vine into the front of %T's %TclothLower, tickling %This %groin!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderIsGroper","targetLowerBodyWaistband"]),
		hitfx : ['tentacleTickle'],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips a leafy vine down the back of %T's %TclothLower, pushing it down between %This buttcheeks and tickling %This %butt!",
		conditions : anyOnHumCond.concat(["action_stdAttack", "action_not_crit","senderIsGroper","targetLowerBodyWaistband"]),
		hitfx : ['tentacleTickle'],
		metaTags : [stdTag.metaSlotButt, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips a thick wet tentacle up between %T's legs, seeking its way in from the side right behind the %Trace's balls. The wet wiggly nubs tickle up across %T's genitals as it slithers forth, pushing %This bulge out a bit!",
		conditions : anyOnHumCond.concat("action_stdArouse", "senderHasTentacles","targetWearsLowerBody","targetLowerBodyStretchy","targetLowerBodyNotPants","targetPenis"),
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub, stdTag.metaSlotBalls],
	},
	{ text : "%S slips a thick wet tentacle up between %T's legs, seeking its way in from the side. The wet wiggly nubs tickle up across %T's %Trsize %butt as the tentacle slithers upwards, pushing in between %This buttcheeks!",
		conditions : anyOnHumCond.concat("action_stdArouse", "senderHasTentacles","targetWearsLowerBody","targetLowerBodyStretchy","targetLowerBodyNotPants"),
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S slips a thick wet tentacle up between %T's legs, seeking its way in from the side. The wet wiggly nubs tickle up across %T's %vagina as the tentacle continue upwards across %This stomach!",
		conditions : anyOnHumCond.concat("action_stdArouse", "senderHasTentacles","targetWearsLowerBody","targetLowerBodyStretchy","targetLowerBodyNotPants", "targetVagina"),
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaRub],
	},
	
	{ text : "%S slips a thick wet tentacle up between %T's legs, seeking its way in from the side, the wet wiggly nubs tickling the %Trace as they slither upwards, pushing deep into %This %Trsize %butt before sliding back out!",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_crit", "senderHasTentacles","targetWearsLowerBody","targetLowerBodyStretchy","targetLowerBodyNotPants"),
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips a thick wet tentacle up between %T's legs! Seeking its way in from the side, the wet wiggly nubs tickle the %Trace as they slither upwards, pushing deep inside before sliding back out!",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_crit", "senderHasTentacles","targetWearsLowerBody","targetLowerBodyStretchy","targetLowerBodyNotPants"),
		hitfx : ["slowThrustsTentacleDiscrete"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaPenetration],
	},
	
	

	// Restrained by and legs spread by tentacles
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %vagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaUsedStrapon, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %butt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTentacleLiftSpread","senderHasStrapon","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaSlotButt, stdTag.metaUsedStrapon, stdTag.metaVeryArousing, stdTag.metaPenetration],

	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This nipples!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTentacleLiftSpread","targetBreasts","targetUpperBodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze'],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %penis!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squeeze'],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTentacleLiftSpread","targetLowerBodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze'],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaRub],
	},
	{ text : "%S takes advantage of %T being restrained and licks across %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTentacleLiftSpread","senderTongue"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny'],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick],
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis strapon into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTentacleLiftSpread","senderHasStrapon"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaUsedStrapon],
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis %penis into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "targetTentacleLiftSpread","senderPenis"),
		hitfx : ['slowThrusts'],
		weight : Text.Weights.high,
		metaTags : [stdTag.metaSlotMouth, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaUsedPenis],
	},
	{ text : "%S slips in between %T's legs and forces a finger inside the %Trace's %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny'],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedFinger],
	},
	{ text : "%S takes advantage of %T being restrained and starts rapidly licking %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_not_crit","targetTentacleLiftSpread","targetGroinExposed","senderTongue"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny'],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaLick],
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %penis inside the %Trace's %vagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTentacleLiftSpread","senderPenis","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedPenis],
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %penis inside the %Trace's %butt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse", "action_crit","targetTentacleLiftSpread","senderPenis","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedPenis],
	},
	

	// Lamprey
	{ text : "%S %slithers up between %T's legs and wiggles its slimy body across %This %groin.",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaGooey, stdTag.metaWiggle],
	},
	{ text : "%S latches its sucker mouth onto the front of %T's %TclothLower and starts wiggling its head around rapidly, tickling the %Trace's %Tgenitals.",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey", "targetWearsLowerBody", "targetLowerBodyNotHard", "targetPenis"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S darts up behind %T and wiggles into the back of %This %TclothLower, prodding up and wiggling its head around rapidly, tickling the %Trace's %Trsize %butt.",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey", "targetWearsLowerBody", "targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S darts up at %T and prods into the front of %This %TclothLower, wiggling its head around rapidly and tickling the %Trace's %groin.",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey", "targetWearsLowerBody", "targetLowerBodyNotHard"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S slips underneath %T's %leftright foot, tickling it with %Shis body.",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S %slithers between %T's legs and wiggles its slimy body up between %This buttcheeks, tickling between them.",
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsLamprey", {conditions:["targetButtExposed", "targetWearsThong"]}),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S %slithers between %T's %Tbsize %breasts and starts doing a figure 8 motion, tickling them in the process!",
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsLamprey", "targetBreastsExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotBreasts, stdTag.metaArousing, stdTag.metaWet, stdTag.metaWiggle],
	},
	{ text : "%S latches its sucker onto %T's %leftright nipple and shakes its head around briefly!",
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsLamprey", "targetBreastsExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotBreast, stdTag.metaArousing, stdTag.metaWet, stdTag.metaSuck, stdTag.metaJiggle],
	},

	// Crab
	{ text : "%S slips between %T's legs and reaches up, grinding %Shis claw against the %Trace's %groin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsTentacrab"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaRub, stdTag.metaUsedClaw],
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %groin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsTentacrab"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %Trsize %butt!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsTentacrab"),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling between %This buttcheeks!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse", "action_not_crit","senderIsTentacrab", {conditions:["targetWearsThong","targetButtExposed"]}),
		hitfx : ["tickle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips between %T's legs and reaches up, prodding %Shis claw part-way into the %Trace's %vagina!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse", "action_crit","senderIsTentacrab", "targetVagina", "targetGroinExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaUsedClaw],
	},


	// Cocktopus
	{ text : "%S tickles %T's %groin with %Shis ribbed bulb tentacle!",
		conditions : anyOnHumCond.concat(["action_stdArouse", "action_not_crit","senderIsCocktopus",]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips %Shis ribbed bulb tentacle between %T's buttcheeks, stroking it up and down!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","action_not_crit",
			{conditions:[
				'targetButtExposed',
				'targetWearsThong',
			]}
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaRub, stdTag.metaUsedTentacles],
	},
	// Cocktopus while latched
	{ text : "%S slips %Shis ribbed bulb tentacle inside %T's %TclothLower from behind, stroking down between the %Trace's buttcheeks and giving %This %vagina a %few tickles!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody', "targetVagina"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaRub, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips into %T's %TclothLower and forces %Shis ribbed bulb tentacle up inside %This %vagina, wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderIsCocktopus","action_crit",
			'targetWearsLowerBody', "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTentacles],
	},
	{ text : "%S slips into %T's %TclothLower and forces %Shis ribbed bulb tentacle up inside %This %Trsize %butt, wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderIsCocktopus","action_crit",
			'targetWearsLowerBody'
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaUsedTentacles],
	},
	{ text : "%S wraps a tentacle around %T's %Tbsize %leftright %breast and tickles %This nipple with a ribbed tentacle.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody', 'targetBreasts'
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotBreast, stdTag.metaSlotNipple, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaTickle, stdTag.metaSqueeze],
	},
	{ text : "%S lashes tendrils around %T's nipples, pulling %This %Tbsize %breasts together and thrusting %Shis head-tentacle up and down between them a %few times.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetBreasts', "targetBreastsExposed"
		]),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaStretch],
	},
	{ text : "%S pushes one of its ribbed bulbous tentacles into %T's mouth, rubbing it into %This %leftright cheek.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotMouth, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaPenetration],
	},
	{ text : "%S latches onto %T's %butt and forces one bulbous tentacle inside the %Trace's %Trsize %butt, and the other inside %This %vagina thrusting a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderIsCocktopus","action_crit",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedTentacles, stdTag.metaPenetration],
	},
	{ text : "%S latches around %T's legs forces both %Shis ribbed bulbous tentacles up into the %Trace's %vagina, swirling them around inside of the %Trace!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderIsCocktopus","action_crit",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaUsedTentacles, stdTag.metaPenetration],
	},
	{ text : "%S squeezes down firmly on %T's %Trsize buttcheeks!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderIsCocktopus","senderLatchingToTarget",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSqueeze, stdTag.metaUsedTentacles],
	},


	// WHIPS
	{ text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %groin!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasWhip","targetVagina","targetNotKnockedDown"
		]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaUsedWhip, stdTag.metaGrind],
	},
	
	{ text : "%S slips %Shis %Sgear between %T's buttcheeks, grinding it back and forth!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_not_crit","senderHasWhip","targetVagina",
			{conditions : 
				["targetWearsThong","targetButtExposed"]
			}
		]),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaArousing, stdTag.metaUsedWhip, stdTag.metaGrind],
	},


	// Dildo spears
	{ text : "%S prods %Shis %Sgear at %T's %Trsize %butt, rapidly stroking it up and down between the %Trace's buttcheeks!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasDildoSpear", 'targetButtExposedOrThong'
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaArousing, stdTag.metaSlotButt],
	},
	{ text : "%S surprises %T by thrusting %Shis %Sgear at %T's %Trsize %butt, shoving it deep inside before pulling it out!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", 'targetButtExposed'
		]),
		hitfx : ['squishLong'],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaPenetration],
	},
	{ text : "%S surprises %T by thrusting %Shis %Sgear at %T from behind, shoving it deep inside %This %vagina before pulling it out!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", 'targetGroinExposed', "targetVagina"
		]),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},
	{ text : "%S manages to grab a firm hold around the back of %T's %TclothLower, tugging it aside and forcing %Shis %Sgear up inside the %Trace's %Trsize %butt, landing a couple of rapid thrusts inside %Thim before yanking it out!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", "targetWearsThong"
		]),
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaPenetration],
	},
	{ text : "%S manages to grab a firm hold around the bottom of %T's %TclothLower, tugging it aside and forcing %Shis %Sgear up inside the %Trace's %vagina, landing a couple of rapid thrusts inside %Thim before yanking it out!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "action_crit","senderHasDildoSpear", "targetWearsThong", "targetVagina"
		]),
		hitfx : ['slowThrusts'],
		metaTags : [stdTag.metaBluntWeapon, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},















	// action_bondageStruggleDuration
	{ text : "%S struggles against %Shis restraints!",
		conditions : anyOnHumCond.concat("action_bondageStruggleDuration", "targetIsSender"),
		hitfx : ["stretch"]
	},
	{ text : "%S struggles against %T's restraints!",
		conditions : anyOnHumCond.concat("action_bondageStruggleDuration", "targetNotSender"),
		hitfx : ["stretch"]
	},


	// action_stdUseBondageDevice
	{ text : "%S shoves %T into a bondage seat, clamping the cold metal collar around the %Trace's neck!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundCollarSeat"),
		hitfx : ["shove"]
	},
	{ text : "%S knocks %T onto a bondage table, clamping the cold metal chains around the %Trace's wrists and ankles!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundRack"),
		hitfx : ["shove"]
	},
	{ text : "%S knocks %T onto a bondage table, clamping the cold metal chains around the %Trace's wrists and ankles!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundTable"),
		hitfx : ["shove"]
	},
	{ text : "%S shoves %T from behind, making the %Trace stumble head first into a pillory! %S quickly snaps down the latch, locking %T's head and arms into place!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundStocks"),
		hitfx : ["shove"]
	},
	{ text : "%S shoves %T from behind, making the %Trace stumble forward into a pillory and stocks! %S quickly snaps down the latch, locking %T's head, arms and feet into place!", 
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundStocksLegs"),
		hitfx : ["shove"]
	},
	{ text : "%S shoves %T backwards, right into a torture device resembling an X! The %Srace quickly snaps the cold iron cuffs around the %Trace's ankles and wrists!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundX"),
		hitfx : ["shove"]
	},
	{ text : "%S shoves %T onto a seat adorned with a rubbery dildo! Before the %Trace can react, %S clamps %This ankles onto the bottom of the seat!",
		conditions : anyOnHumCond.concat("action_stdUseBondageDevice", "targetBoundSybian"),
		hitfx : ["shove"]
	},
	















	// DEFEATS

	// stdPunishDom
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Trsize %butt before shoving %Shis %Spsize %penis inside! %S begins forcefully pounding %T...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %vagina before shoving %Shis %Spsize %penis inside! %S begins forcefully pounding %T...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable","targetVagina"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %penis inside, %S starts %thrusting into %T's %Trsize %butt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver"),
		hitfx : ["slowThrusts"],
		weight : Text.Weights.high,

	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %penis inside, %S starts %thrusting into %T's %vagina...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver","targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's arms from behind and forces %Shis %Spsize %penis inside %T's %Trsize %butt. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's hips and forces %Shis %Spsize %penis inside %T's %vagina. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","targetVagina"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S pushes the defeated %Trace to the ground and seats %Shimself on %T's face. %S begins riding %T's face...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderVagina"),
		hitfx : ["slowThrusts"]
	},



	// stdPunishSub
	{ text : "%S used a SUBMISSIVE text against %T!",
		conditions : humOnHumCond.concat("action_stdPunishSub"),
	},



	// stdPunishSad
	{ text : "%S bends the defeated %Trace over a table. Raising %Shis palm high in the air, the %Srace starts forcefully slapping %T's %Trsize %butt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","roomTable"),
		hitfx : ["doubleSlap"],
		weight : Text.Weights.high
	},
	{ text : "%S pins the defeated %Trace's arms behind %This back and bends %Thim forwards. Raising %Shis palm high in the air, %S starts forcefully slapping %T's %Trsize %butt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","targetNotTaller"),
		hitfx : ["doubleSlap"],
		weight : Text.Weights.high
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S a turn. %S continues the punishment, vigorously spanking the %Trace's already punished %butt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","ttBentOver","ttSpanked"),
		weight : Text.Weights.high,
		hitfx : ["doubleSlap"]
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S a turn. %S raises %Shis palm and starts vigorously spanking the %Trace's %Trsize exposed %butt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","ttBentOver","ttNotSpanked"),
		weight : Text.Weights.high,
		hitfx : ["doubleSlap"]
	},















	// NPC ACTIONS

	// tentacle_fiend_tentacleMilker
	{ text : "%S slips suction cup tipped tentacles inside %T's %TclothUpper, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		hitfx : ["tentacleSuck"],
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetBreasts","targetWearsUpperBody"
		]),
		metaTags : [stdTag.metaSlotNipples, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaMilking],
	},
	{ text : "%S assaults %T with suction cup tipped tentacles, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetBreasts","targetNoUpperBody"
		]),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaSlotNipples, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaMilking],
	},
	{ text : "%S slips a hollow tentacle inside %T's %TclothLower, enveloping %This %penis and coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetWearsLowerBody"
		]),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaMilking],
	},
	{ text : "%S envelops %T's %penis with a hollow tentacle, coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetNoLowerBody"
		]),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaSlotPenis, stdTag.metaArousing, stdTag.metaUsedTentacles, stdTag.metaMilking],
	},


	// tentacle_fiend_legWrap
	{ text : "%S hoops tentacles around %T's ankles, pulling %Thim to the ground and spreading %This legs!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_legWrap",
		]),
		metaTags : [stdTag.metaUsedTentacles],
	},


	// tentacle_fiend_injectacle
	{ text : "%S's thick tentacle slips into %T's %Tbsize %butt and lands some rapid thrusts before flooding %T's %butt with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetButtExposed",
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaInjection, stdTag.metaVeryArousing],
	},
	{ text : "%S's thick tentacle slips into %T's %vagina, landing some rapid thrusts before flooding it with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina"
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaInjection, stdTag.metaVeryArousing],
	},
	{ text : "Two of %S's tentacles slither up between %T's legs, one pushing into %This %Trsize %butt, the other slightly larger one into %This %vagina. The tentacles start thrusting into %T in sync, eventually shooting a sizable amount sticky liquid inside %Thim!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetVagina",
			{conditions:[
				"targetNoLowerBody", 
				{conditions:[
					"ttGroinExposed",
					"ttButtExposed"
				], min:-1}
			]},
			"targetNoLowerBody",
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotButt, stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaInjection, stdTag.metaVeryArousing],
	},
	{ text : "%S takes advantage of %T's legs being restrained, shoves a thick tentacle into %This %vagina and starts thrusting rapidly. Some time later the tentacle finally slows down, squirting a large enough wad of sticky goo into %T that some of it immediately squirts out!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina",
			"targetLegsSpread"
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaInjection, stdTag.metaVeryArousing],
	},


	// tentacle_fiend_tentatug : Todo Meta tags
	{ text : "%S latches tentacles onto %T's %TclothLower, tugging at the piece.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug", "targetLowerBodyDamagedNotStripped"
		])
	},
	{ text : "%S latches tentacles onto %T's %TclothLower, tugging the piece right off.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug", "targetLowerBodyStripped"
		])
	},
	{ text : "%S latches tentacles onto %T's %TclothUpper, tugging the piece right off.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug", "targetUpperBodyStripped"
		])
	},
	
	{ text : "%S latches tentacles around the sides of %T's %TclothLower, tugging up and out, giving %T a wedgie!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsLowerBody","targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"),
		turnTags:[stdTag.ttWedgie]
	},
	{ text : "%S latches tentacles from the side into %T's %TclothLower and out through the other side, grabbing a tight hold before tugging backwards!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsLowerBody", "targetLowerBodyNotPants", "targetLowerBodyOrNoDamage"),
		turnTags:[]
	},
	{ text : "%S latches tentacles around the bottom of %T's %TclothLower and give a hard tug down, exposing %This %Tgenitals!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong", "targetLowerBodyDamagedNotStripped"),
		turnTags:[stdTag.ttGroinExposed]
	},
	{ text : "%S latches tentacles around the back of %T's %TclothLower and tugs down, exposing %This %butt!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetNoBodysuit", "targetLowerBodyDamagedNotStripped"),
		turnTags:[stdTag.ttButtExposed]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, chafing into %This %vagina!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong","targetVagina", "targetLowerBodyDamagedNotStripped"),
		turnTags:[stdTag.ttPussyWedgie, stdTag.ttWedgie]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, making %This junk flop free!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug","targetWearsThong","targetPenis", "targetLowerBodyDamagedNotStripped"
		]),
		turnTags:[stdTag.ttGroinExposed]
	},
	{ text : "%S's tentacles wrap around the bottom of %T's %TclothLower and tugs down before letting go and allowing the piece to snap onto %T's %groin!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug","targetWearsSlingBikini", "targetLowerBodyDamagedNotStripped"
		])
	},	
	{ text : "%S slips inside %T's %TclothLower and begins pushing out at it from inside.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S slips inside %T's %TclothUpper and begins pushing out at it from inside.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsUpperBody", "targetUpperBodyDamagedNotStripped"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's legs and wraps a tendril around %T's butt-string, tugging down and exposing %This %Tgenitals.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsThong", "targetLowerBodyDamagedNotStripped"
		]),
		turnTags:[stdTag.ttGroinExposed],
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's back and slips some tentacles over %This shoulders, grabbing a hold of %This %TclothUpper and tugging upwards, exposing %This %Tbsize %breasts!",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetBreasts", "targetUpperBodyNotHard", "targetUpperBodyDamagedNotStripped"
		]),
		turnTags:[stdTag.ttBreastsExposed],
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches tentacles onto the front of %T's %TclothUpper, tugging at the piece.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles onto the front of %T's %TclothUpper, rapidly stretching it from side to side.",
		hitfx : ["tentacleStretch"],
		turnTags:[stdTag.ttBreastsExposed],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles onto the front of %T's %TclothUpper, stretching %thoroughly and causing the %Trace to stumble forwards.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles around the front strings of %TclothUpper, stretching them out before letting them come to a rest between the %Trace's %Tbsize %breasts.",
		hitfx : ["tentacleStretch"],
		turnTags : [stdTag.ttBreastsExposed],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetBreasts", "targetWearsSlingBikini", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles onto the back of %T's %TclothUpper, stretching backwards and squishing the %Trace's %Tbsize %breasts.",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetBreasts", "targetUpperBodyNotHard", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S's tentacles wrap around the front straps of %T's %TclothLower and tugs back before letting go, allowing the piece to snap painfully onto %T's %Tbsize %breasts!",
		hitfx : ["tentacleStretchWhip"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug","targetWearsSlingBikini","targetBreasts", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles around the bottom of %T's %TclothUpper, stretches upwards and exposes the %Trace's %Tbsize %breasts.",
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetBreasts", "targetUpperBodyCanPullUp", "targetUpperBodyDamagedNotStripped"])
	},
	{ text : "%S latches tentacles around the top of %T's %TclothUpper and pulls down, exposing the %Trace's %Tbsize %breasts.",
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat(["action_tentacle_fiend_tentatug", "targetBreasts", "targetUpperBodyCanPullDown", "targetUpperBodyDamagedNotStripped"])
	},


	// action_tentacle_ride
	{ text : "%S slips a thick tentacle between %T's legs, lifting %Thim off the ground!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat("action_tentacle_ride"),
		metaTags : [stdTag.metaUsedTentacles],
	},


	// // action_slime_wad
	{ text : "%S slips a thick gooey tentacle into %T's %TclothLower and breaks it off, leaving a wad of goo behind!",
		hitfx : ["glowingOozeSplat"],
		conditions : baseCond.concat("action_slime_wad"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaGooey],
	},
	// ^proc
	{ text : "The gooey wad in %T's %TclothLower starts rapidly vibrating, tickling the %Trace's %groin!",
		hitfx : ["tentacleRub"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
	},
	{ text : "The gooey wad in %T's %TclothLower prods a sticky protrusion up into the %Trace's %vagina!",
		hitfx : ["tentacleRub"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc", "targetVagina"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaSlotVagina],
	},
	{ text : "The gooey wad in %T's %TclothLower prods a sticky protrusion up into the %Trace's %rSize %butt!",
		hitfx : ["tentacleRub"],
		conditions : baseCond.concat("eventIsEffectTrigger", "action_slime_wad_proc"),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaPenetration, stdTag.metaSlotButt],
	},
	{ text : "The gooey wad encloses %T's %groin and starts wobbling around in %This %TclothLower!",
		hitfx : ["tentacleSqueeze"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc", "targetPenis"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaSqueeze, stdTag.metaSlotGroin],
	},
	{ text : "The gooey wad in %T's %TclothLower slips around %T's %Tpsize %penis and squeezes down on it!",
		hitfx : ["tentacleSqueeze"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc", "targetPenis"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaSqueeze, stdTag.metaSlotPenis],
	},
	{ text : "The gooey wad in %T's %TclothLower slips a piece beneath %T's foreskin and starts jiggling rapidly, tickling the %Trace!",
		hitfx : ["tentacleTickle"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc", "targetPenis", "targetNotCircumcised"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaSlotPenis],
	},
	{ text : "The goo in %T's %TclothLower encapsules %This balls and protrudes little wiggly nubs, using them to tickle the %Trace!",
		hitfx : ["tentacleTickle"],
		conditions : ["eventIsEffectTrigger", "action_slime_wad_proc", "targetPenis"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaTickle, stdTag.metaSlotBalls],
	},
	
	








	// action_groper_leg_spread
	{ text : "%S wraps its tendrils around %T's legs, spreading them wide apart!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat("action_groper_leg_spread"),
		metaTags : [stdTag.metaUsedTentacles],
	},

	// action_groper_groin_lash - Renamed to Groper Lash
	{ text : "%S flicks a tendril right across %T's exposed %groin!",
		hitfx : ["whip"],
		conditions : baseCond.concat("action_groper_groin_lash"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	{ text : "%S flicks a tendril right across %T's exposed %groin, whipping %This %penis around!",
		hitfx : ["whip"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetPenis", "targetLowerBodyNotHard"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotPenis, stdTag.metaPainful],
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lashes painfully twice across %This %Trsize %butt!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lands a rapid lash across %This %Trsize left buttcheek, briefly followed by another painful snap across %This right, jiggling %This %butt around!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard", "targetButtLarge"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's restrained legs, the tendril lashes painfully twice across %T's back!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetUpperBodyNotHard"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaPainful],
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lashes painfully up across the %Trace's %groin, briefly constricting into %This %vagina before retracting!",
		hitfx : ["tentacleWhipSqueeze"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard", "targetVagina"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotGroin, stdTag.metaVeryPainful, stdTag.metaGrind],
	},
	{ text : "%S flicks a tendril right across %T's exposed %groin, whipping %This %penis around!",
		hitfx : ["whip"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetPenis", "targetLowerBodyNotHard"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotPenis, stdTag.metaPainful],
	},

	
	
	// action_groper_groin_grope
	{ text : "%S flicks a tendril up between %T's legs, squeezing %This %groin!",
		hitfx : ["whipSqueeze"],
		conditions : baseCond.concat("action_groper_groin_grope"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "%S flicks a tendril up between %T's legs, tickling %This %Tgenitals!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetGroinExposed"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaTickle, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "%S flicks a tendril up between %T's legs, slipping up into %This %Trsize %butt and tickling %Thim on the inside!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetButtExposed"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaTickle, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},
	{ text : "%S flicks a tendril up between %T's legs, slipping up into %This %vagina and tickling %Thim on the inside!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetVagina", "targetGroinExposed"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaTickle, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaPenetration],
	},


	// groper_root
	{ text : "Vines shoot from the ground, latching onto %T's outfit!",
		conditions : baseCond.concat("action_groper_root"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaSlotClothes],
		hitfx : ["roots"],
	},

	// groper_skittering_swarm
	{ text : "%S hurls a group of insects at %T, coating the %Trace with little skittering bugs!",
		conditions : baseCond.concat("action_groper_skittering_swarm"),
		metaTags : [],
		hitfx : ["skitteringSwarm"],
	},
	{ text : "An insect manages to skitter across the bottom of %T's foot, tickling the %Trace!",
		conditions : ["eventIsEffectTrigger", "action_groper_skittering_swarm_tick"],
		metaTags : [stdTag.metaTickle, stdTag.metaSlotFoot, stdTag.metaUsedInsect],
	},
	{ text : "An insect slips into %T's %TclothLower, skittering across %This %Tgenitals!",
		conditions : ["eventIsEffectTrigger", "action_groper_skittering_swarm_tick", "targetWearsLowerBody"],
		metaTags : [stdTag.metaTickle, stdTag.metaSlotGroin, stdTag.metaUsedInsect, stdTag.metaArousing],
	},
	{ text : "An insect slips down between %T's %Trsize buttcheeks, tickling the %Trace's %butt as it skitters across!",
		conditions : ["eventIsEffectTrigger", "action_groper_skittering_swarm_tick"],
		metaTags : [stdTag.metaTickle, stdTag.metaSlotButt, stdTag.metaUsedInsect, stdTag.metaArousing],
	},
	{ text : "An insect slips into %T's %TclothUpper and seeks its way up %This armpit, tickling the %Trace as it skitters across!",
		conditions : ["eventIsEffectTrigger", "action_groper_skittering_swarm_tick", "targetWearsUpperBody"],
		metaTags : [stdTag.metaTickle, stdTag.metaUsedInsect, stdTag.metaSlotArmpit],
	},
	{ text : "An insect slips into %T's %TclothUpper and starts crawling across %This %leftright %breast, tickling %This nipple!",
		conditions : ["eventIsEffectTrigger", "action_groper_skittering_swarm_tick", "targetWearsUpperBody", "targetBreasts"],
		metaTags : [stdTag.metaTickle, stdTag.metaSlotNipple, stdTag.metaUsedInsect, stdTag.metaArousing],

	},

	// groper_stinging_swarm
	{ text : "A swarm of stinging insects erupt from %S, assaulting its enemies!",
		conditions : baseCond.concat("action_groper_stinging_swarm"),
		metaTags : [],
		hitfx : ["stingingSwarm"],
		numTargets : -1
	},

	


	// action_groper_sap_squeeze
	{ text : "%S wraps a sap-coated tendril around %T's torso constricting %This %Tbsize %breasts!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetBreasts"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotBreasts],
	},
	{ text : "%S wraps a sap-coated tendril around %T's %Trsize buttcheeks and firmly constricts, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S wraps a sap-coated tendril around %T's %Trsize %groin and firmly constricts, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetPenis"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips a sap-coated tendril up between %T's legs and wrapping itself around %This waist. The tendril constricts %thoroughly, coating the %Trace's pelvic area with a sticky sap!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips a sap-coated tendril up between %T's legs, wrapping itself around %This waist. The tendril constricts, painfully grinding between the %Traces's buttcheeks and partially into %This %vagina, coating the area with a sticky sap!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina", "targetNoLowerBody"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaGrind, stdTag.metaSlotVagina],
	},
	{ text : "%S hoops a sap-coated tendril around %T's %Tbsize %breasts, constricting firmly and leaving a sticky residue on them!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetBreasts", "targetUpperBodyNotHard"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotBreasts],
	},
	{ text : "%S wraps a sap-coated tendril around %T's head, constricting into %This mouth and briefly gagging the %Trace before letting go and leaving a sweet sticky sap behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotMouth],
	},
	{ text : "%S slips its sap-coated root of a tentacle down into the back of %T's %TclothLower, slipping the bumpy appendage down between %This %Trsize buttcheeks and tickling up across the %Trace's %vagina before firmly constricting both, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina"),
		metaTags : [stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotButt, stdTag.metaGrind, stdTag.metaSlotVagina],
	},
	
	{ text : "%S wraps a sap-coated tendril around %T and constricts, leaving a sticky sap behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : baseCond.concat("action_groper_sap_squeeze"),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaGooey],
	},

	// action_groper_sap_inject
	{ text : "%S shoves its thick sticky tendril into %T's exposed %vagina, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetGroinExposed"),
		metaTags : [stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	{ text : "%S shoves its thick sticky tendril into %T's %TclothLower and up %This %vagina, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetWearsLowerBody"),
		metaTags : [stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	{ text : "%S shoves its thick sticky tendril into %T's exposed %butt, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetGroinExposed"),
		metaTags : [stdTag.metaSlotButt, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	{ text : "%S shoves its thick sticky tendril into %T's %TclothLower and up %This %butt, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetWearsLowerBody"),
		metaTags : [stdTag.metaSlotButt, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	{ text : "%S shoves its thick sticky tendril into %T's mouth, flailing about wildly as the tendril coats it with a sweet sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject"),
		metaTags : [stdTag.metaSlotMouth, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	{ text : "%S slips its thick tendril down the back of %T's %TclothLower, grinding the bumpy root of a tentacle between %This buttcheeks and across the %Trace's %vagina a %few times before finally probing inside and %This %vagina and flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetWearsLowerBody"),
		metaTags : [stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaVeryArousing],		
	},
	
	
	



	// action_shocktacle_zap
	{ text : "%S wraps charged tentacles around %T's %Tbsize %breasts, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyNotHard"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotBreasts, stdTag.metaSqueeze],
	},
	{ text : "%S wraps charged tentacles around %T's nipples, constricting and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyNotHard"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotNipples, stdTag.metaSqueeze],
	},
	{ text : "%S wraps a charged tentacle around %T's %groin, squeezing down and sending an electric shock through %This %penis!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetPenis", {conditions:[
			"targetGroinExposed", "targetLowerBodyStretchy"
		]}),
		weight : Text.Weights.high,
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotPenis, stdTag.metaSqueeze],
	},
	{ text : "%S wraps charged tentacles around %T's %Trsize buttcheeks, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerBodyNotHard"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaSqueeze],
	},
	{ text : "%S whaps %T's %Trsize %butt with an electrified tentacle, shocking the %Trace!",
		hitfx : ["tentacleWhipZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaSqueeze],
	},
	{ text : "%S latches electrified tendrils around %T's %TclothUpper, sending pulses into the metal and shocking %This %Tbsize %breasts!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyMetal"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotBreasts],
	},
	{ text : "%S latches electrified tendrils onto %T's %TclothLower, sending pulses into the metal and shocking %This %Tgenitals!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerBodyMetal"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotGroin],
	},
	{ text : "%S electrifies the tentacle currently lifting %T off the ground, sending electric pulses into %This %groin!",
		hitfx : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetRidingOnMyTentacle"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotGroin],
	},
	{ text : "%S prods %T's rear with an electrified tentacle slipping it inside %Thim and shocking %This %butt!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetButtExposed"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaPenetration],
	},
	{ text : "%S prods %T's %groin with an electrified tentacle slipping it inside %Thim and shocking %This %vagina!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetGroinExposed", "targetVagina"),
		metaTags : [stdTag.metaShock, stdTag.metaPainful, stdTag.metaUsedTentacles, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},
	



	// imp_specialDelivery
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %penis into %T's mouth, humping at an overwhelming speed until %She shoots a large squirt of demonic jizz down %T's throat.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotMouth, ],		
	},
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %penis into %T's mouth, humping at an overwhelming speed! A few moments later, the %Srace pulls out, shooting a long streak of demonic jizz across %T's face.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery",
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaPenetration, stdTag.metaSlotFace],
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horn and shoves %Shis %Spsize %penis in %T's mouth. The small imp starts thrashing the %penis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorn"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotMouth],		
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horns and shoves %Shis %Spsize %penis in %T's mouth. The small imp starts thrashing the %penis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorns"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotMouth],		
	},
	{ text : "%S manages to grasp a %firm hold of %T's long hair and quickly yanks %This head down towards %Shis %groin, forcing %Shis %Spsize %penis into %T's mouth. The small imp starts thrashing the %penis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetLongHair"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotMouth],		
	},
	{ text : "%S tugs at %T's hips from behind, causing the %Trace to fall backwards towards the %Srace! %S quickly slams %Shis %Spsize %penis up into %T's %vagina and catches a hold of %This hair, holding %Thim firmly in place as %The tries to struggle free! A %few moments of squirming later, the %Srace's %penis twitches briefly before unleashing a load of sticky demon %cum into %T, and briefly thereafter letting %Ther go.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetLongHair", "targetVaginaExposed", "targetStanding"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],		
	},
	{ text : "%S grasps a hand around the butt-string of %T's %TclothLower and yanks backwards, causing the %Trace to fall backwards as the %Srace skillfully jabs %Shis %Spsize %penis up into %T's %vagina, catching a hold of %This hair! %S holds %Thim firmly in place as %The tries to struggle free! A %few moments of squirming later, the %Srace's %penis twitches briefly before unleashing a load of sticky demon %cum into %T, and briefly thereafter letting %Thim go.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetLongHair", "targetVaginaExposed", "targetWearsThong", "targetStanding"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],		
	},
	
	{ text : "%S jumps and latches onto %T's %Trsize %butt and shoves %Shis %Spsize %penis into %This %vagina! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],		
	},
	{ text : "%S jumps and latches onto %T's %Trsize %butt and shoves %Shis %Spsize %penis inside! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotButt],		
	},
	{ text : "%S jumps onto %T, latching %Shis legs around the %Trace's chest and grabbing a firm hold of %This nipples, squishing %Shis %Spsize %penis between %T's %Tbsize %breasts. The %Srace begins rapidly humping, eventually reaching climax, shooting %Shis load into %T's face!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaSqueeze, stdTag.metaGooey, stdTag.metaSlotNipples, stdTag.metaSlotBreasts, stdTag.metaSlotFace],
	},
	{ text : "%S jumps onto the knocked down %Trace slipping %Shis %Spsize %penis between %T's %Tbsize %breasts, pushes them together and starts rapidly thrusting. A short while later %S pulls back, shooting a long streak of demonic cum across %T's %breasts!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaSqueeze, stdTag.metaGooey, stdTag.metaSlotBreasts, stdTag.metaSlotFace],
	},
	{ text : "%S surprises the knocked down %Trace by squatting near %This face and shoving %Shis %Spsize %penis in %This mouth. The %Srace pumps a few times before forcing a large squirt of demon cum inside %T's mouth!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack"
		]),
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotMouth],	
	},
	{ text : "%S surprises the knocked down %Trace by lifting %This hips and shoving %Shis %Spsize %penis into %This %vagina. The %Srace starts humping rapidly, eventually reaching climax and flooding %T with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],	
	},
	{ text : "%S squats by %T's %Trsize %butt and slips %Shis %Spsize %penis inside. The %Srace starts rapidly humping, eventually reaching climax and flooding %T's %butt with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownFront","targetButtExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotButt],
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %penis into %This %vagina. %S starts rapidly humping, eventually reaching climax and flooding %T's %vagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetGroinExposed","targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %penis into %This %butt. %S starts rapidly humping, eventually reaching climax and flooding %T's %butt with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotButt],
	},
	// Bondage
	{ text : "%S hops onto the strapped down %Trace and shoves %Shis %penis into %This %vagina, humping freely into %Thim, eventually reaching climax and flooding %T's %vagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundTable","targetVaginaExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],
	},
	{ text : "%S hops onto the strapped down %Trace, slips the bottom of %This %TclothLower aside and shoves %Shis %penis into %This %vagina, humping freely into %Thim until %She eventually reaches climax, flooding %T's %vagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundTable","targetWearsThong"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotVagina],
	},
	{ text : "%S hops up between the strapped down %Trace's legs and shoves %Shis %penis up inside %This %Trsize %butt! With %T pacified, the %Srace allows %Shimself to pound the %Trace's %butt carelessly and thoroughly, eventually reaching climax and flooding %T's %butt with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundTable","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.metaInjection, stdTag.metaSlotButt],
	},
	{ text : "%S hops onto the strapped down %Trace, laying %This %Tpsize %penis between %This %Tbsize %breasts before acquiring a firm grasp of %T's nipples and forcing %This %breasts together! The %Srace takes full advantage of %T's exposed situation and starts humping wildly, eventually reaching climax and spraying %Shis demonic %cum across the %Trace's face and %breasts!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundTable",{conditions:["targetBreastsExposed", "targetWearsSlingBikini"], min:1}),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaSlotBreasts],
	},
	{ text : "%S jumps onto %T from behind and shoves %Shis %Spsize %penis into the %Trace's %Trsize %butt. %S takes full advantage of %T's vulnerable position and starts rapidly and carelessly humping! A little while later, %S reaches climax, shooting %Shis demonic load deep into the %Trace!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundStocks","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaInjection],
	},
	{ text : "%S jumps onto %T from behind and shoves %Shis %Spsize %penis into the %Trace's %vagina. %S takes full advantage of %T's vulnerable position and starts rapidly and carelessly humping! A little while later, %S reaches climax, filling the %Trace up with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundStocks","targetVaginaExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaInjection],
	},
	{ text : "%S slips %T's %TclothLower aside and hops onto %This %Trsize exposed %butt, shoving %Shis %Spsize %penis into the %Trace's %vagina! %S takes full advantage of %T's vulnerable position and starts rapidly and carelessly humping! A little while later, %S reaches climax, filling the %Trace up with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundStocks","targetWearsThong"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaSlotButt, stdTag.metaPenetration, stdTag.metaInjection],
	},
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %penis into the %Trace's mouth. %S takes full advantage of %T's restraints and starts rapidly and carelessly humping! A little while later, %S reaches climax, filling the %Trace's mouth up with demonic %cum!",
		conditions : humOnHumCond.concat("targetTiedUp","action_imp_specialDelivery"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaArousing, stdTag.metaUsedPenis, stdTag.metaSlotMouth, stdTag.metaPenetration, stdTag.metaInjection],
	},
	{ text : "%S hops up behind %T on the collared seat and tugs the %Trace's %TclothLower aside before grabbing a %firm hold of %This hips! %S uses the grip to tug %Shimself forward, positioning %Shis %Spsize %penis so it slowly slides up inside %T's %vagina as %She shuffles forward and forcing %T up onto %Shis lap! Upon sliding all the way to its base, %S's %penis briefly twitches before unleashing a large splash of sticky demonic goo inside the %Trace!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundCollarSeat","targetWearsThong", "targetMuchTaller", "senderIsImp", "targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaInjection],
	},
	{ text : "%S hops up behind %T on the collared seat and grabs a %firm hold of %This hips! %S uses the grip to tug %Shimself forward, positioning %Shis %Spsize %penis so it slowly slides up inside %T's %vagina as %She shuffles forward and forcing %T up onto %Shis lap! Upon sliding all the way to its base, %S's %penis briefly twitches before unleashing a large splash of sticky demonic goo inside the %Trace!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetBoundCollarSeat", "targetVaginaExposed", "targetMuchTaller", "senderIsImp"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaUsedPenis, stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaInjection],
	},




	// imp_blowFromBelow
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking across %This %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S gracefully jumps up sideways into the air and extends %Shis arms, landing a double-fisted punch at %T's %groin, while at the same time extending %Shis legs to kick across %T2's!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
			"targetLowerBodyOrNoDamage"
		]),
		numTargets : 2,
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},

	{ text : "%S slips between %T's legs and throws a slap upwards, smacking across %This %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking the %Trace's %Trsize %leftright buttcheek!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S slips between %T's legs and throws a punch at each of the %Trace's %Trsize buttcheeks!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S slips between %T's legs and throws a couple of slaps across the front of %T's %TclothLower, smacking %This %penis around!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetPenis","targetLowerBodyStretchy"
		]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaVeryPainful, stdTag.metaSlotPenis],
	},
	{ text : "%S slips between %T's legs and forces %Shis fist up into the %Trace's %vagina, thrusting a few times!",
		conditions : humOnHumCond.concat(["action_imp_blowFromBelow","targetVagina","targetGroinExposed"]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaPainful, stdTag.metaUsedFist, stdTag.metaPenetration],
	},
	{ text : "%S slips between %T and %T2's legs and forces %Shis fist up into both of their %vaginas, thrusting a few times!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"],
		metaTags : [stdTag.metaPenetration, stdTag.metaPainful, stdTag.metaUsedFist, stdTag.metaPenetration],
	},
	{ text : "%S slips between %T and %T2's legs and rams %Shis fist into both of their groins!",
		numTargets:2,
		armor_slot:"lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaUsedFist],
	},
	{ text : "%S slips underneath %T throws a rapid jab at %This %groin! The %Srace rapidly spins around, also burying %Shis fist in %T2's %groin",
		numTargets:2,
		armor_slot:"lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaUsedFist],
	},
	{ text : "%S slips underneath %T and %T2, giving a hard smack across both of their %butts!",
		numTargets:2,
		conditions : humOnHumCond.concat(["action_imp_blowFromBelow", "targetTaller"]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S slinks up towards %T and grabs a hold of %This hips, cocks %Shis head backwards and rams it right into %T's %groin!",
		conditions : humOnHumCond.concat(["action_imp_blowFromBelow", "targetTaller"]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaHeadbutt, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips behind %T and %T2, throwing a %hard slap up between both their legs!",
		numTargets:2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips underneath %T and throws a thorough slap across %This %butt!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast, jiggling it around!",
		armor_slot:"upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyHard"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S slips underneath %T and throws a few rapid slaps across %This %breasts!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["doubleSlap"],
		metaTags : [stdTag.metaSlap, stdTag.metaVeryPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S grabs a hold of and spreads %T's legs while %The's still bent over the table, followed briefly by the %Srace ramming %Shis knee up into %T's %groin!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_imp_blowFromBelow","ttBentOverTable"),
		weight : Text.Weights.high,
		hitfx : ["punch"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaVeryPainful],
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast and %T2's %T2bsize %breast, jiggling them both around!",
		"numTargets":2,
		"armor_slot":"upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotBreast],
	},
	// Bondage
	{ text : "%S slips underneath the restrained %Trace and throws a couple of teasing jabs at %T's vulnerable %groin!",
		numTargets : 1,
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(
			"action_imp_blowFromBelow", "targetWearsLowerBody",
			{conditions:["targetBoundStocks", "targetBoundX"], min:1}
		),
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips underneath the restrained %Trace and throws a couple of teasing slaps at the front of %This %TclothLower!",
		numTargets : 1,
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(
			"action_imp_blowFromBelow", "targetWearsLowerBody",
			{conditions:["targetBoundStocks", "targetBoundX"], min:1}
		),
		hitfx : ["punchDouble"],
		metaTags : [stdTag.metaPunch, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S slips underneath %T and forces %This fist up inside the larger %Trace's %vagina! %S takes full advantage of %T's restraints, using %This fist to churn around inside %Thim for a moment!",
		numTargets : 1,
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat("action_imp_blowFromBelow", "targetMuchTaller", {conditions:["targetBoundStocks", "targetBoundX"], min:1}, "targetVaginaExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaPenetration, stdTag.metaPainful, stdTag.metaSlotVagina, stdTag.metaUsedFist],
	},



	// action_imp_claws
	{ text : "%S wraps %Shis claws around %T's %TclothUpper, ripping the piece straight off!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetUpperBodyStripped"),
		hitfx : ["claws"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S wraps %Shis claws around %T's %TclothLower, ripping the piece straight off!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyStripped"),
		hitfx : ["claws"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slips %Shis claws around %T's butt-string yanks down hard, pulling the %Trace's %TclothLower off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong", "targetLowerBodyStripped", "targetLowerBodyCanPullDown"
		),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slips %Shis claws around the bottom of %T's %TclothLower, stretching down and exposing the %Trace!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerBodyDamaged", "targetLowerBodyCanPullDown", "targetLowerBodyNotPants"
		),
		turnTags : [stdTag.ttGroinExposed, stdTag.ttButtExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slips %Shis claws around the shoulder straps of %T's %TclothLower and yanks down, letting it fall off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsSlingBikini", "targetArmorStripped"
		),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slinks in between %T's legs and wraps %Shis claws around the front of the %Trace's %TclothLower! With a quick tug, the %Srace yanks the piece straight off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetMuchTaller", "targetLowerBodyStripped", "targetLowerBodyCanPullDown"
		),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	
	{ text : "%S slips %Shis claws under %T's waistband from behind, tugging upwards %firmly!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slips %Shis claws around %T's butt-string grabbing a firm hold of it and giving it a hard yank!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S slips %Shis claws under %T's waistband from the front, giving it a hard tug upwards!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttPussyWedgie],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaWedgie, stdTag.metaSlotGroin],
	},
	{ text : "%S grabs a firm hold of %T's %TclothUpper from behind, pulling it backwards and causing the piece to constrict %This %Tbsize %breasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetUpperBodyNotHard", "targetBreasts", "targetWearsUpperBody", "targetUpperBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttBreastsWedgie],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaWedgie, stdTag.metaSlotBreasts],
	},
	{ text : "%S wraps %Shis claws around the front strings of %T's %TclothUpper, giving it a hard yank out and letting it set back on the side, exposing the %Trace's %Tbsize %breasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetBreasts", "targetWearsSlingBikini", "targetUpperBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotBreasts],
	},
	{ text : "%S grabs the middle of %T's %TclothUpper with %Shis claws and gives it a hard yank down, exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetBreasts", "targetUpperBodyCanPullDown", "targetUpperBodyDamagedNotStripped"),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotBreasts],
	},
	{ text : "%S grabs the middle of %T's %TclothUpper with %Shis claws and pulls back!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetUpperBodyDamagedNotStripped"),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotBreasts],
	},
	{ text : "%S grasps %Shis claws around the bottom of %T's %TclothUpper and firmly yanks up, exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetBreasts", "targetUpperBodyCanPullUp", "targetUpperBodyDamagedNotStripped"),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotBreasts],
	},
	{ text : "%S grabs around the front strings of %T's %TclothLower near %This %groin, giving it a hard yank down, exposing the %Trace's %groin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetWearsSlingBikini", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
	},
	{ text : "%S wraps %Shis claws around the front of %T's %TclothLower and gives it a hard yank down, exposing the %Trace's %groin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotGroin],
	},
	{ text : "%S grabs at the back of %T's %TclothLower with %Shis claws and gives it a hard yank down, exposing the %Trace's %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttButtExposed],
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes, stdTag.metaSlotButt],
	},





	// imp_ankleBite
	{ text : "%S jumps at %T's legs and starts chewing on %This ankle!",
		conditions : anyOnHumCond.concat([
			"action_imp_ankleBite",
		]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite],
	},
	{ text : "%S bites at %T's %leftright ankle, catching the %Trace off guard! As the %Trace stumbles backwards, %S manages to grab a firm hold of %T's hips, suplexing %Thim to the ground!",
		conditions : anyOnHumCond.concat(["action_imp_ankleBite","targetKnockedDownBack"]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite],
	},
	{ text : "%S bites at %T's %leftright ankle, causing the %Trace to go off balance! With a quick nudge, %S pushes %T butt-first to the ground!",
		conditions : anyOnHumCond.concat(["action_imp_ankleBite","targetKnockedDownBack"]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite],
	},
	{ text : "%S bites at %T's %leftright ankle, causing the %Trace to go off balance! With a quick whap across %T's %Trsize %butt, %T stumbles face first to the ground!",
		conditions : anyOnHumCond.concat(["action_imp_ankleBite","targetKnockedDownFront"]),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite],
	},
	
	


	// imp_demonicPinch
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetNotBeast"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards in %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetWearsLowerBody","targetPenis","targetNotCircumcised"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaSlotPenis],
	},
	{ text : "%S casts a spell! Suddenly %T feels something clamp down around %This %Tpsize %penis and start moving it in a circular motion, stroking it against the inside of %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaPinch, stdTag.metaArousing, stdTag.metaSlotPenis],
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards and jiggling %This %Tpsize %penis around!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetGroinExposed","targetPenis","targetNotCircumcised"
		]),
		weight : Text.Weights.high,
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotPenis, stdTag.metaJiggle],
	},
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This clit!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetVagina"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotClit],
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This %leftright nipple!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetBreasts"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotNipple],
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This nipples and starts jiggling %This %Tbsize %breasts around in %This %TclothUpper!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetBreasts","targetWearsUpperBody"
		]),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaJiggle],
	},
	{ text : "%S casts a spell, making an invisible force pinch down on the bottom of %T's %leftright breast!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S casts a spell, causing invisible fingers to pinch %T's %vagina!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetVagina"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotVagina],
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's %leftright nipple, twisting it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotNipple],
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, twisting both!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaTwist],
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, stretching them both outwards!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotNipples, stdTag.metaSlotBreasts],
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's %leftright ear, tugging at it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetEars"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful],
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's nose!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful],
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's taint!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetPenis"),
		hitfx : ["pinch"],
		metaTags : [stdTag.metaTelekinesis, stdTag.metaPainful, stdTag.metaSlotTaint],
	},
	

	// action_imp_groperopeHogtie
	{ text : "%S lashes %Shis enchanted groperope around %T. The rope immediately wraps around and restrains the %Trace, leaving %Thim on the ground as it begins to grind against %This sensitive areas!",
		conditions : anyOnHumCond.concat("action_imp_groperopeHogtie"),
		hitfx : ["stretch"],
	},

	// action_bondageStruggle
	{ text : "%S struggles against %Shis restraints!",
		conditions : anyOnHumCond.concat("action_bondageStruggle", "targetIsSender"),
		hitfx : ["stretch"]
	},
	{ text : "%S struggles against %T's restraints!",
		conditions : anyOnHumCond.concat("action_bondageStruggle", "targetNotSender"),
		hitfx : ["stretch"]
	},
	
	// action_imp_newGroperope
	{ text : "%S rummages around, searching for another enchanted groperope!",
		conditions : ["eventIsActionCharged","action_imp_newGroperope"],
		hitfx : ["rummage"]
	},
	{ text : "%S finds another enchanted groperope!",
		conditions : baseCond.concat("action_imp_newGroperope"),
		hitfx : ["whipPickup"]
	},
	

	// tentacle_latch
	{ text : "%S jumps at %T and latches onto %Thim!",
		conditions : anyOnHumCond.concat("action_tentacle_latch"),
		hitfx : ["tentacleSqueeze"]
	},

	// Detach
	{ text : "%S tugs %T off %This victim!",
		conditions : baseCond.concat("action_detach"),
		hitfx : ["tentacleStretch"]
	},

	// cocktopus_ink
	{ text : "%S squirts an oily ink across %T's face!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey],
	},
	{ text : "%S squirts a large wad of oily ink across %T's %breasts!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink", "targetBreasts"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotBreasts],
	},
	{ text : "%S squirts a large wad of oily ink across %T's %groin!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotGroin],
	},
	{ text : "%S squirts a large wad of oily ink across %T's %butt!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotButt],
	},
	{ text : "%S slips down the front of %T's %TclothLower and ejects a fair amount of ink, soaking into the piece!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink", "targetWearsLowerBody", "senderLatchingToTarget"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "%S slips down the back of %T's %TclothLower and ejects a fair amount of ink, soaking into the piece!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink", "targetWearsLowerBody", "senderLatchingToTarget", "targetNotThong"),
		hitfx : ["sludgeBoltBlack"],
		metaTags : [stdTag.metaGooey, stdTag.metaArousing, stdTag.metaSlotButt],
	},


	// cocktopus_inkject
	{ text : "%S latches around %T's head and starts prodding %This mouth with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingMouth"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches around %T's hips and starts prodding %This %butt with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingButt", "targetNoLowerBody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches around %T's %butt and starts prodding %This %vagina with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingGroin", "targetNoLowerBody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S slithers into %T's %TclothLower and starts prodding %This %butt with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingButt", "targetWearsLowerBody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S slithers into %T's %TclothLower and starts prodding %This %vagina with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingGroin", "targetWearsLowerBody"),
		hitfx : ["tentacleSqueeze"]
	},

	// /\ tick
	{ text : "%S shoves its big headtacle deep inside %T's %vagina!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S shoves its big head-tentacle inside %T's %vagina and stirs it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S launches multiple rapid thrusts into %T's %vagina with its large head-tentacle!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S shoves its big headtacle deep inside %T's %butt!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S shoves its big head-tentacle deep inside %T's %butt and wiggles it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S launches multiple rapid thrusts into %T's %Trsize %butt with its large head-tentacle!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S shoves its big headtacle deep down %T's throat!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingMouth"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotMouth, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S starts thrusting %Shis big head-tentacle into %T's mouth!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingMouth"],
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotMouth, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},



	// /\ Finish
	{ text : "%S latches tight onto %T's %Trsize %butt and forces %Shis big head-tentacle up inside the %Trace's %vagina, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingGroin"],
		hitfx : ["sludgeBlack"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaGooey, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S latches tight onto %T's hips and forces %Shis big head-tentacle up inside the %Trace's %Trsize %butt, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingButt"],
		hitfx : ["sludgeBlack"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},
	{ text : "%S latches tight around the back of %T's head and shoves %Shis big head-tentacle inside %T's throat, flooding it with enough black oily liquid that %The is forced to swallow some!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingMouth"],
		hitfx : ["sludgeBlack"],
		metaTags : [stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaSlotMouth, stdTag.metaVeryArousing, stdTag.metaLargeInsertion],
	},

	// crab_claw_pinch
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %Trsize %butt with %Shis claws!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw, stdTag.metaSlotButt],
	},
	{ text : "%S pinches %T's %leftright foot!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw],
	},
	{ text : "%S jumps at %T's face, pinching %This nose!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw],
	},
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %groin with a claw!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw, stdTag.metaSlotGroin],
	},
	{ text : "%S jumps at %T and pinches a hold of %This nipples, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetUpperBodyNotHard"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw, stdTag.metaSlotNipples],
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Tbsize %breasts, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetBreasts", "targetUpperBodyNotHard"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw, stdTag.metaSlotBreasts],
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Trsize %butt, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetLowerBodyNotHard"]),
		hitfx : ['pinch'],
		metaTags : [stdTag.metaPinch, stdTag.metaPainful, stdTag.metaUsedClaw, stdTag.metaSlotButt],
	},

	// crab_claw_tug
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothLower!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothUpper!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsUpperBody", "targetUpperBodyDamagedNotStripped"]),
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T from behind, pinching a hold of the bottom of %This %TclothUpper, making the piece slide down and exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsUpperBody", "targetBreasts", "targetUpperBodyCanPullDown", "targetUpperBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T from behind, pinches a hold of %This %TclothLower and tugs down, exposing %This %Tgenitals!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsThong", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T from behind, pinches a hold of the back of %This %TclothLower and tugs down, exposing %This %butt!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsThong", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttButtExposed],
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T and pinches a hold of the strings of %This %TclothUpper, tugging down and exposing the %Trace's %breasts!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsSlingBikini", "targetBreasts", "targetUpperBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This outfit!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug"]),
		hitfx : ['stretch'],
		metaTags : [stdTag.metaPinch, stdTag.metaSlotClothes, stdTag.metaStretch],
	},

	// breast_squeeze
	{ text : "%S plants %Shis hands over %T's %Tbsize %breasts, giving them a firm squeeze momentarily, before planting his face between them and shaking it about!",
		conditions : anyOnHumCond.concat([{type:Condition.Types.actionLabel, data:{label:'breast_squeeze'}}]),
		hitfx : ['squeeze'],
		metaTags : [stdTag.metaSqueeze, stdTag.metaSlotBreasts, stdTag.metaArousing],
	},
	

	// whip_legLash
	{ text : "%S lashes %Shis whip across %T's legs!",
		conditions : baseCond.concat([
			"action_whip_legLash"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaPainful],
	},
	{ text : "%S lashes %Shis whip across %T's %leftright thigh!",
		conditions : anyOnHumCond.concat([
			"eventIsActionUsed","action_whip_legLash",
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaPainful],
	},


	// whip_powerLash
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerBodyNotHard"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %breasts, whapping them around!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotBreasts, stdTag.metaJiggle],
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %leftright %breast, whapping it around!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotBreast, stdTag.metaJiggle],
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking multiple times across %This %breasts!",
		armor_slot : Asset.Slots.upperBody,
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts"
		]),
		hitfx : ["whipDouble"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotBreasts],
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T's %groin, smacking %This bulge around!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerBodyStretchy","targetPenis"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T's %groin, smacking %This %penis around!",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetGroinExposed","targetPenis"
		]),
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotPenis],
	},
	{ text : "%S surprises %T bent over by lashing %Shis %Sgear from below up across the %Trace's %groin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat([
			"action_whip_powerLash","targetVagina","targetWearsLowerBody","ttBentOver"
		]),
		weight : Text.Weights.high,
		hitfx : ["whip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedWhip, stdTag.metaVeryPainful, stdTag.metaSlotGroin],
	},


	// mq00_ward_boss
	{ text : "%S casts a ward on %T.",
		 conditions : baseCond.concat("action_mq00_ward_boss"),
		 hitfx : ['bolster']
	},



	// Skeleton hand
	{ text : "%S slips %Shis bony hand into %T's %TclothUpper and detaches it! The hand slinks down onto %This %Tbsize %leftright %breast and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetBreasts", {type:Condition.Types.tag, data:{tags:'skeletal_hand_ub'}}),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotBreast],
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand grabs a firm hold of the %Trace's %Trsize %butt and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotButt],
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand grabs a firm hold of the %Trace's %Trsize %penis and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetPenis", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotPenis],
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand immediately finds %This %vagina and starts stroking it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetVagina", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotVagina],
	},
	

	// boneRattle
	{ text : "%S wraps its bony fingers around %T's %groin and starts to rapidly rattle it!",
		conditions : anyOnHumCond.concat("action_boneRattle"),
		hitfx : ["boneRattle"],
		metaTags : [stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "%S prods its bony fingers up between %T's buttcheeks and starts rapidly rattling, tickling %T!",
		conditions : anyOnHumCond.concat("action_boneRattle", {conditions:["targetButtExposed", "targetWearsThong"], min:1}),
		hitfx : ["boneRattle"],
		metaTags : [stdTag.metaArousing, stdTag.metaSlotButt, stdTag.metaTickle],
	},
	

	// boneShards
	{ text : "%S summons a swarm of bone shards, sending them flying across %T!",
		conditions : baseCond.concat("action_boneShards"),
		hitfx : ["boneShards"],
		metaTags : [stdTag.metaPainful],
	},
	{ text : "%S summons a swarm of bone shards behind %T, sending them bouncing across %T's %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_boneShards"),
		hitfx : ["boneShards"],
		metaTags : [stdTag.metaPainful, stdTag.metaSting, stdTag.metaSlotButt],
	},


	// hexArmor
	{ text : "%S casts a spell at %T, causing %This outfit to shimmer with a dark purple haze!",
		conditions : baseCond.concat("action_hexArmor"),
		hitfx : ["hexArmor"],
		metaTags : [],
	},

	// hexArmor_tick
	{ text : "%S's action causes the hex to activate and starts energetically vibrating %This %TclothLower!",
		conditions : ["eventIsEffectTrigger", "action_hexArmor_tick", "targetWearsLowerBody"],
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaVibration, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "%S's action activates the hex, causing %This %TclothUpper to start vibrating heavily against %This %Tbsize %breasts!",
		conditions : ["eventIsEffectTrigger", "action_hexArmor_tick", "targetWearsUpperBody", "targetBreasts"],
		hitfx : ["vibrationHit"],
		metaTags : [stdTag.metaVibration, stdTag.metaSlotBreasts, stdTag.metaArousing],
	},

	// slimeBone
	{ text : "%S summons a slimy bone beneath %T, the bone shoots up into the %Trace's exposed %Tvagina, prodding deep inside %Thim before sliding back out!",
		conditions : baseCond.concat("action_slime_bone"),
		hitfx : ["slimeBone"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaSlotVagina],
	},
	{ text : "%S summons a slimy bone beneath %T, the bone shoots up into the %Trace's %Trsize exposed %butt, prodding deep inside %Thim before sliding back out!",
		conditions : baseCond.concat("action_slime_bone"),
		hitfx : ["slimeBone"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaSlotButt],
	},
	{ text : "%S summons a slimy bone beneath %T, the bone shoots up into the %Trace's exposed %Tvagina, rattling around briefly before sliding back out!",
		conditions : baseCond.concat("action_slime_bone"),
		hitfx : ["slimeBone"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaSlotVagina],
	},
	{ text : "%S summons a slimy bone beneath %T, the bone shoots up into the %Trace's exposed %Trsize %butt, rattling around briefly before sliding back out!",
		conditions : baseCond.concat("action_slime_bone"),
		hitfx : ["slimeBone"],
		metaTags : [stdTag.metaVeryArousing, stdTag.metaPenetration, stdTag.metaSlotButt],
	},






	// Ghoul


	// pounceBreak
	{ text : "%S shoves %T off %This victim!",
		conditions : baseCond.concat("action_pounceBreak"),
		hitfx : ["shove"],
		metaTags : [],
	},

	// ghoulSpit
	{ text : "%S spits a watery green liquid at %T!",
		conditions : baseCond.concat("action_ghoulSpit"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSpit, stdTag.metaGooey],
	},
	{ text : "%S spits a watery green liquid right in %T's face!",
		conditions : anyOnHumCond.concat("action_ghoulSpit"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSpit, stdTag.metaGooey],
	},
	{ text : "%S spits a watery green liquid across %T's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_ghoulSpit", "targetBreasts"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSpit, stdTag.metaGooey, stdTag.metaSlotBreasts],
	},
	{ text : "%S spits a watery green liquid across %T's %Tbsize %butt!",
		conditions : anyOnHumCond.concat("action_ghoulSpit"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSpit, stdTag.metaGooey, stdTag.metaSlotButt],
	},
	{ text : "%S spits a watery green liquid across %T's %groin!",
		conditions : anyOnHumCond.concat("action_ghoulSpit"),
		hitfx : ["ghoulSpit"],
		metaTags : [stdTag.metaSpit, stdTag.metaGooey, stdTag.metaSlotGroin],
	},

	// ghoulMunch
	{ text : "%S envelops the front of %T's %TclothLower in its toothless maw and slides %Shis tongue across it!",
		conditions : anyOnHumCond.concat("action_ghoulMunch", "targetWearsLowerBody"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaGooey, stdTag.metaLick, stdTag.metaSlotGroin],
	},
	{ text : "%S envelops %T's %vagina with its toothless maw and prods its tongue inside, sucking firmly while stroking inside the %Trace with %Shis gooey appendage!",
		conditions : anyOnHumCond.concat("action_ghoulMunch", "targetGroinExposed", "targetVagina"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotVagina, stdTag.metaUsedTongue, stdTag.metaPenetration],
	},
	{ text : "%S envelops %T's %penis and balls with its toothless maw and wraps %Shis tongue around it, sucking firmly while stroking it up and down with %Shis gooey appendage!",
		conditions : anyOnHumCond.concat("action_ghoulMunch", "targetGroinExposed", "targetPenis"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotPenis, stdTag.metaUsedTongue, stdTag.metaPenetration, stdTag.metaSlotBalls],
	},
	{ text : "%S slips %Shis long tongue around %T's butt-string and into %This %Trsize %butt, allowing the slimy appendage to thrash around inside the %Trace!",
		conditions : anyOnHumCond.concat("action_ghoulMunch", "targetWearsThong"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotButt, stdTag.metaUsedTongue, stdTag.metaPenetration],
	},
	
	




	// pounce
	{ text : "%S pounces on %T, knocking %Thim to the floor!",
		conditions : anyOnHumCond.concat("action_pounce"),
		hitfx : ["claws"],
		metaTags : [],
	},
	{ text : "%S grabs around %T's waist, suplexing %Thim to the floor!",
		conditions : anyOnHumCond.concat("action_pounce", "targetShorter"),
		hitfx : ["claws"],
		metaTags : [],
	},

	





	// action_lamprey_slither
	{ text : "%S slithers into %T's %TclothUpper and wiggles its slimy body between %This %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetBreasts", "targetWearsUpperBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaGooey, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotBreasts, stdTag.metaJiggle],
	},
	{ text : "%S slithers into %T's %TclothUpper and wraps its slimy body around %This %Tbsize %leftright %breast, wiggling it %around!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetBreasts", "targetWearsUpperBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaGooey, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotBreast, stdTag.metaJiggle],
	},
	{ text : "%S slithers into %T's %TclothUpper and tickles the %Trace's %leftright nipple with its slimy body!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetBreasts", "targetWearsUpperBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaGooey, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotNipple, stdTag.metaTickle],
	},
	{ text : "%S slithers into %T's %TclothLower and wiggles across the %Trace's %vagina!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetVagina", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaGooey, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotVagina, stdTag.metaTickle],
	},
	{ text : "%S slips inside %T's %TclothLower from the back, sliding between %This buttcheeks and across %This %vagina, tickling the area in the process!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetVagina", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotVagina, stdTag.metaTickle, stdTag.metaSlotButt],
	},
	{ text : "%S slips inside %T's %TclothLower from the back, sliding between %This buttcheeks and tickling across %This balls!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetPenis", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotBalls, stdTag.metaTickle],
	},
	
	{ text : "%S slips inside %T's %TclothLower from the front, wriggling %about %rapidly and tickling %This genitals!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetPenis", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotBalls, stdTag.metaSlotPenis, stdTag.metaTickle],
	},
	{ text : "%S slips inside %T's %TclothLower from the front, wriggling %about %rapidly and tickling %This %vagina!",
		conditions : anyOnHumCond.concat("action_lamprey_slither", "targetVagina", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaWiggle, stdTag.metaArousing, stdTag.metaSlotVagina, stdTag.metaTickle],
	},
	{ text : "%S %slithers down into %T's %TclothLower and excretes an oily slime as it wiggles its slimy body across %This %groin.",
		conditions : anyOnHumCond.concat("action_lamprey_slither","senderIsLamprey", "targetWearsLowerBody", "targetLowerBodyWaistband"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaGooey, stdTag.metaWiggle],
	},
	{ text : "%S %slithers down into %T's %TclothLower and excretes an oily slime as it wiggles its slimy body across %This %groin, up between %This buttcheeks, and out the back.",
		conditions : anyOnHumCond.concat("action_lamprey_slither","senderIsLamprey", "targetWearsLowerBody", "targetLowerBodyWaistband"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaSlotGroin, stdTag.metaArousing, stdTag.metaGooey, stdTag.metaWiggle, stdTag.metaSlotButt],
	},
	
	
	// action_leech
	{ text : "%S %slithers up between %T's legs and pushes part-way into %This %vagina. It starts stroking its sucker mouth across the inside, tickling the %Trace!",
		conditions : anyOnHumCond.concat("action_leech","senderIsLamprey", "targetVaginaExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaWiggle, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaTickle, stdTag.metaPenetration],
	},
	{ text : "%S %slithers up between %T's legs and latches its mouth across %This %vagina, %firmly sucking on it!",
		conditions : anyOnHumCond.concat("action_leech","senderIsLamprey", "targetVaginaExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaSuck],
	},
	{ text : "%S %slithers up between %T's legs and envelops %This %penis with its mouth as it begins %firmly sucking on it!",
		conditions : anyOnHumCond.concat("action_leech","senderIsLamprey", "targetPenisExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotPenis, stdTag.metaSuck],
	},
	{ text : "%S %slithers up between %T's %Tbsize %breasts and hoops around the %leftright one before latching its mouth onto %This nipple! The %Srace squeezes down and starts sucking.",
		conditions : anyOnHumCond.concat("action_leech","senderIsLamprey", "targetBreastsExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaArousing, stdTag.metaSlotNipple, stdTag.metaSlotBreast, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril up between %T's %Tbsize %breasts and hoops around the %leftright one before latching a sucker onto %This nipple! The %Srace squeezes down and starts sucking!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetBreastsExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotNipple, stdTag.metaSlotBreast, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril inside %T's %TclothUpper and hoops around the %Trace's %Tbsize %leftright %breast before latching a sucker onto %This nipple! The %Srace squeezes down and starts sucking!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetBreasts"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotNipple, stdTag.metaSlotBreast, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril inside %T's %TclothLower and hoops around the %Trace's %Tpsize %penis before latching a sucker onto it! The %Srace squeezes down and starts sucking!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetPenis", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotPenis, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril around the %Trace's %Tpsize %penis before latching a sucker onto it! The %Srace squeezes down and starts sucking!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetPenisExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotPenis, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril tipped with a suction cup up between %T's legs and into %Thim! The suction cup latches onto the side of the %Trace's %vagina and sliding back and forth!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetVaginaExposed"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaSuck],
	},
	{ text : "%S %slithers a tendril tipped with a suction cup up into %T's %TclothLower where it finds the %Trace's %vagina! The tendril %slithers inside as and latches the suction cup onto the side, sliding back and forth!",
		conditions : anyOnHumCond.concat("action_leech", "senderHasTentacles", "targetVagina", "targetWearsLowerBody"),
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaWet, stdTag.metaUsedTentacles, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration, stdTag.metaSuck],
	},
	


	// Anemone
	{ text : "%S latches its sucker tentacles onto %T's nipples and starts forcefully sucking!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetBreastsExposed"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaArousing, stdTag.metaSlotNipples, stdTag.metaSuck, stdTag.metaMilking],
	},
	{ text : "%S slithers its sucker tentacles into %T's %TclothUpper and latches them onto %T's nipples, briefly tugging at them before starting forcefully sucking!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetBreasts", "targetWearsUpperBody"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaArousing, stdTag.metaSlotNipples, stdTag.metaSuck, stdTag.metaMilking],
	},
	{ text : "%S slithers a large hollow tentacle into %T's %TclothLower and envelops %T's %penis, briefly tugging before starting forcefully sucking at it!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetPenis", "targetWearsUpperBody"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotPenis, stdTag.metaSuck, stdTag.metaMilking],
	},
	{ text : "%S slithers a large hollow tentacle onto %T's exposed %penis, briefly tugging before starting forcefully sucking at it!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetPenisExposed"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotPenis, stdTag.metaSuck, stdTag.metaMilking],
	},
	{ text : "%S slithers two sucker tentacles into %T's %TclothLower and wiggles them into %This %vagina. The suction cups latch on inside the %Trace and %start sliding around in a spiral motion!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetVagina", "targetWearsLowerBody"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaSuck, stdTag.metaUsedTentacles, stdTag.metaPenetration],
	},
	{ text : "%S slithers two sucker tentacles up inside %T's %vagina. The suction cups latch on inside the %Trace and %start sliding around in a spiral motion!",
		conditions : anyOnHumCond.concat("action_leech","senderIsAnemone", "targetVaginaExposed"),
		hitfx : ["tentacleSuck"],
		metaTags : [stdTag.metaWet, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaSuck, stdTag.metaUsedTentacles, stdTag.metaPenetration],
	},
	



	

	// action_lamprey_shock
	{ text : "%S discharges a powerful electric wave from its body!",
		conditions : anyOnHumCond.concat("action_lamprey_shock"),
		numTargets : -1,
		hitfx : ["lampreyShock", "elementalHitSparksNoSound"],	// self
		metaTags : [stdTag.metaShock, stdTag.metaVeryPainful],
	},

	// action_anemone_grab
	{ text : "%S wraps its tendrils around %T's arms and legs and pulls %Thim in with %This back towards the anemone!",
		conditions : anyOnHumCond.concat("action_anemone_grab"),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaWet, stdTag.metaSqueeze],
	},

	// action_anemone_restrain
	{ text : "%S restrains %T's wrists, ankles and hips and pushes %Thim away slightly before spreading the %Trace's limbs!",
		conditions : anyOnHumCond.concat("action_anemone_restrain"),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaWet, stdTag.metaSqueeze],
	},

	// action_anemone_tickle
	{ text : "%S slips one of its wiggly tendrils between %T's legs and tickles %This %groin!",
		conditions : anyOnHumCond.concat("action_anemone_tickle"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "%S sneaks a tentacle behind %T and presses it up firmly, allowing the small tendrils attached to the tip to rapidly tickle %This %groin!",
		conditions : anyOnHumCond.concat("action_anemone_tickle"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "%S slips one of its wiggly tendrils down the front of %T's %TclothLower, allowing the little tendrils attached to the tip to tickle the %Trace's %groin!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", "targetLowerBodyWaistband"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "%S slips one of its tentacles between %T's legs and up %into %This %vagina, where the small tendrils attached to the tips immediately starts tickling %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", "targetVaginaExposed"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},
	{ text : "%S slips one of its tentacles behind %T and up %into %This %Trsize %butt, where the small tendrils attached to the tips immediately starts tickling %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", "targetButtExposed"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaPenetration],
	},
	{ text : "%S prods a tentacle up between %T's buttcheeks, allowing the small tendrils attached to it to tickle in between!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", {conditions:["targetButtExposed", "targetWearsThong"]}),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotButt],
	},
	{ text : "%S prods a tentacle down between %T's buttcheeks and forwards across %This %groin, stroking it back and forth and allowing the small tendrils attached to it to tickle the %Trace thoroughly!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", {conditions:["targetButtExposed", "targetWearsThong"]}),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotButt, stdTag.metaSlotGroin],
	},
	{ text : "%S wraps a tentacle around %T's %leftright %breast, holding it firmly in place as it lets the tip with small tendrils attached hoop around %This nipple, tickling it rapidly!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", "targetBreastsExposed"),
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotNipple],
	},
	{ text : "%S prods tickly tentacles up underneath %T's armpits, tickling the %Trace!",
		conditions : anyOnHumCond.concat("action_anemone_tickle"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle],
	},
	{ text : "%S prods tickly tentacles up against %T's stomach, tickling it %thoroughly!",
		conditions : anyOnHumCond.concat("action_anemone_tickle", "targetNoUpperBody"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle],
	},
	{ text : "%S %slips some tentacles beneath %T, rapidly tickling the bottom of %This feet!",
		conditions : anyOnHumCond.concat("action_anemone_tickle"),
		hitfx : ["tentacleTickle"],
		metaTags : [stdTag.metaWet, stdTag.metaTickle],
	},
	
	
	// guardian_demon_grapple
	{ text : "%S grabs a hold of %T's arms, lifting %Thim into the air!",
		conditions : anyOnHumCond.concat("action_guardian_demon_grapple", "targetShorter"),
		hitfx : ["squeeze"],
		metaTags : [],
	},
	{ text : "%S grabs a hold of %T's hips from behind, lifting %Thim into the air!",
		conditions : anyOnHumCond.concat("action_guardian_demon_grapple", "targetShorter"),
		hitfx : ["squeeze"],
		metaTags : [],
	},
	{ text : "%S grabs a hold of %T's wrists and pins them behind %This back while wrapping another arm around the %Trace's torso from behind, lifting %Thim off the ground!",
		conditions : anyOnHumCond.concat("action_guardian_demon_grapple", "targetShorter"),
		hitfx : ["squeeze"],
		metaTags : [],
	},
	{ text : "%S grabs a hold of %T's wrists and pins them behind %This back!",
		conditions : anyOnHumCond.concat("action_guardian_demon_grapple"),
		hitfx : ["squeeze"],
		metaTags : [],
	},

	// guardian_demon_remoteDelivery
	{ text : "%S makes arcane gestures as %She flings a wad of hot demonic cum towards %T, guiding its trajectory straight into the %Trace's face with a splash!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotFace],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of demonic cum towards %T, manipulating its trajectory splashing straight across %T's mouth, some of the hot liquid making it inside!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotMouth, stdTag.metaInjection],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of hot demonic cum down and towards %T, guiding its trajectory straight up across the %Trace's %groin with a splash!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotGroin],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of hot demonic cum towards %T, guiding its trajectory straight across the %Trace's %Trsize %butt with a splash!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotButt],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of hot demonic cum towards %T, guiding its trajectory straight across the %Trace's %Tbsize %breasts with a splash!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery", "targetBreasts"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotBreasts],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of demonic cum towards %T, guiding its trajectory down between %This legs and quickly shooting the hot liquid up across the %Trace's %vagina, causing some of the it to splat up inside %Thim!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery", "targetVaginaExposed"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotVagina, stdTag.metaInjection, stdTag.metaArousing],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of demonic cum around %T, guiding its trajectory down behind %Thim before quickly shooting back up across between the %Trace's buttcheeks, causing some of the hot liquid to splat up inside %This %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery", "targetButtExposed"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotButt, stdTag.metaInjection, stdTag.metaArousing],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of demonic cum towards %T, guiding its trajectory around %Thim and straight down the back of the %Trace's %TclothLower, making %This %Trsize %butt sticky with the hot liquid!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery", "targetLowerBodyWaistband"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotButt, stdTag.metaSlotClothes],
	},
	{ text : "%S makes arcane gestures as %She flings a wad of demonic cum high into the air towards %T, guiding it rapidly down the front of the %Trace's %TclothLower, coating %This %groin with the hot and sticky liquid!",
		conditions : anyOnHumCond.concat("action_guardian_demon_remoteDelivery", "targetLowerBodyWaistband"),
		hitfx : ["sludgeBoltWhite"],
		metaTags : [stdTag.metaGooey, stdTag.metaSlotGroin, stdTag.metaSlotClothes, ],
	},
	
	// guardian_demon_consume
	{ text : "%S flips the grappled %Trace upside down and buries %Shis face in %T's %groin, drooling heavily as %She starts to munch at %T's %vagina with %Shis lips!",
		conditions : anyOnHumCond.concat("action_guardian_demon_consume", "targetVaginaExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedMouth, stdTag.metaSlotVagina, stdTag.metaArousing],
	},
	{ text : "%S flips the grappled %Trace upside down and buries %Shis face in %T's %groin, shoving %Shis large tongue into %This %vagina and thrashing it around inside %Thim!",
		conditions : anyOnHumCond.concat("action_guardian_demon_consume", "targetVaginaExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedTongue, stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing],
	},
	{ text : "%S flips the grappled %Trace upside down and envelops %This %Tpsize %penis with %Shis mouth, wrapping %Shis big tongue around it and squeezing it %firmly!",
		conditions : anyOnHumCond.concat("action_guardian_demon_consume", "targetPenisExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedTongue, stdTag.metaSlotPenis, stdTag.metaVeryArousing],
	},
	{ text : "%S flips the grappled %Trace upside down and envelops %This %Tpsize %penis with %Shis mouth, surprising %T by slipping the tip of %Shis tongue beneath %T's foreskin, tickling %This sensitive tip!",
		conditions : anyOnHumCond.concat("action_guardian_demon_consume", "targetPenisExposed", "targetNotCircumcised"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedTongue, stdTag.metaSlotPenis, stdTag.metaVeryArousing],
	},
	{ text : "%S flips the grappled %Trace upside down facing away from the %Srace and pushes %Shis face between %T's %Trsize buttcheeks, spreading demonic drool between them! Suddenly the %Srace shoves %Shis long tongue inside %T's %butt, wiggling the slimy appendage around inside %Thim!",
		conditions : anyOnHumCond.concat("action_guardian_demon_consume", "targetButtExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedTongue, stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing, stdTag.metaGooey],
	},
	

	// guardian_demon_impale
	{ text : "%S lifts %T by the hips and slams %Thim down %butt first onto %Shis %Spsize %penis, burying it deep enough that the %Trace's stomach bulges %slightly!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetButtExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotButt],
	},
	{ text : "%S lifts %T by the hips and slams %Thim down onto %Shis %Spsize %penis, burying it deep enough into the %Trace's %vagina that %This stomach bulges %slightly!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetVaginaExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotVagina],
	},
	{ text : "%S lifts %T by the hips and flips %Thim upside down, lowering %Thim face first towards %Shis %Spsize %penis and forcing it deep down %T's throat!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotMouth],
	},
	{ text : "%S grabs a firm hold of %T's knees, spreads %This legs wide and begins slowly pulling the %Trace down %butt first onto the %Srace's %Spsize %penis, eventually pulling %T all the way down onto it!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetButtExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotButt],
	},
	{ text : "%S grabs a firm hold of %T's knees, spreading %This legs wide and straddles %Thim with %This %vagina on top of the %Srace's %Spsize %penis! The demon starts tugging the %Trace's legs down, forcing %Shis %penis up inside %T as %The slides all the way down its length!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetVaginaExposed"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotVagina],
	},
	{ text : "%S drops %T on the ground around facing away from %Shim! As %T tries to stand %Thimself up, the %Srace surprises %Thim by jabbing %Shis %Spsize %penis up the %Trace's %Trsize %butt and quickly bending backwards, leaving %T impaled on the large appendage!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetButtExposed", "targetMuchShorter"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotButt],
	},
	{ text : "%S drops %T on the ground around facing away from %Shim! As %T tries to stand %Thimself up, the %Srace surprises %Thim by jabbing %Shis %Spsize %penis up the %Trace's %vagina and quickly bending backwards, leaving %T impaled on the large appendage!",
		conditions : anyOnHumCond.concat("action_guardian_demon_impale", "targetVaginaExposed", "targetMuchShorter"),
		hitfx : ["squishLong"],
		metaTags : [stdTag.metaUsedPenis, stdTag.metaPenetration, stdTag.acPainful, stdTag.acArousing, stdTag.metaSlotVagina],
	},

	// guardian_demon_expose
	{ text : "%S grabs a hold of %T's %TclothLower and tugs it out of the way!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs the waistband of %T's %TclothLower from the front and tugs down, leaving the piece half way down %This thighs!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyWaistband", "targetLowerBodyCanPullDown"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs the waistband of %T's %TclothLower from the back and tugs down, leaving the piece half way down %This thighs!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyWaistband", "targetLowerBodyCanPullDown"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs the sides of %T's %TclothLower and briefly yanks up, followed by the %Srace tugging the piece down to %T's knees!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyWaistband", "targetLowerBodyCanPullDown"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S wraps %Shis hand around %T's butt string and gives it a hard yank down, tugging %This %TclothLower down to %This knees!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyCanPullDown", "targetWearsThong"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs at the shoulders of %T's %TclothLower and tugs it out to the sides, letting the piece fall down to %This ankles!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetWearsSlingBikini"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs between %T's legs and get a firm hold around the bottom of %T's %TclothLower, squishing it in %Shis hand and tugging it to the side!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyNotPants"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs between %T's legs and get a firm hold around the bottom of %T's %TclothLower, tugging the piece half way down %This thighs!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyNotPants", "targetLowerBodyCanPullDown"),
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	
	// ^ double hit
	{ text : "%S grabs a hold of %T's %TclothLower and %T2's %T2clothLower and tugs them out of the way!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose"),
		numTargets : 2,
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs the back of %T's %TclothLower and %T2's %T2clothLower and tugs down, leaving them half-way down their thighs!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyWaistband", "targetLowerBodyCanPullDown"),
		numTargets : 2,
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S wraps %Shis hand around %T and %T2's butt strings and gives them a hard yank down, tugging the pieces down to their knees!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyCanPullDown", "targetWearsThong"),
		numTargets : 2,
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs between %T and %T2's legs and gets a firm hold of %T's %TclothLower and %T2's %T2clothLower, squishing them in %Shis hands and tugging both to the side!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyNotPants"),
		numTargets : 2,
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},
	{ text : "%S grabs between %T's legs and get a firm hold around the bottom of %T's %TclothLower, tugging the piece half way down %This thighs! The %Srace rapidly spins around and manages to accomplish the same maneuver on %T2's %T2clothLower!",
		conditions : anyOnHumCond.concat("action_guardian_demon_expose", "targetLowerBodyNotPants", "targetLowerBodyCanPullDown"),
		numTargets : 2,
		hitfx : ["stretch"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotClothes],
	},


	// Potions
	{ text : "%S chugs a small bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_minorHealingPotion",
		],
		hitfx : ["potionRed"]
	},
	{ text : "%S chugs a bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_healingPotion",
		],
		hitfx : ["potionRed"]
	},
	{ text : "%S chugs a large bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_majorHealingPotion",
		],
		hitfx : ["potionRed"]
	},
	{ text : "%S chugs a bottle of blue liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_manaPotion",
		],
		hitfx : ["potionBlue"]
	},
	{ text : "%S chugs a large bottle of blue liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_majorManaPotion",
		],
		hitfx : ["potionBlue"]
	},



	{text : "The gong attracts a Juvenile Lamprey!",
		hitfx : ["waterSpout"],
		conditions : ["eventIsEffectTrigger", {type:Condition.Types.effectLabel, data:{ label : "sq_sharktopus_gong_spawn"}}]
	},
	{text : "The shark monster emerges from the water!",
		audiokits : ["waterSplash"],
		conditions : ["eventIsEffectTrigger", {type:Condition.Types.effectLabel, data:{ label : "sq_sharktopus_gong_hide"}}]
	},
	{ text : "With a loud splash, %S submerges itself into the murky water!",
		conditions : ["actionHit","eventIsActionUsed",{type:Condition.Types.actionLabel, data:{label:"sharktopus_submerge"}}],
		audiokits : ["waterSplash"]
	},
	

	

	// Count blobula
	// action_count_blobula_massive_burst
	{ text : "%S starts bubbling violently, preparing to unleash a massive burst!",
		conditions : ["eventIsActionCharged","action_count_blobula_massive_burst"],
		numTargets : -1,
		audiokits : ["waterSplash"]
	},
	{ text : "%S unleashes a large burst of slime, splattering across all %Shis enemies!",
		conditions : baseCond.concat("action_count_blobula_massive_burst"),
		metaTags : [stdTag.metaGooey],
		hitfx : ['big_green_burst'],
		numTargets : -1
	},

	// action_slime_coat
	{ text : "%S flings a wad of undulating slime, splattering across %T!",
		conditions : baseCond.concat("action_slime_coat"),
		metaTags : [stdTag.metaGooey],
		hitfx : ['sludgeBoltGreen']
	},

	// action_climb_flotsam
	{ text : "%S climbs on top of a box floating in the water!",
		conditions : baseCond.concat("action_climb_flotsam"),
		metaTags : [],
		hitfx : ['rummage']
	},

	// action_activate_electrodes
	{ text : "%S activates the electrodes, shocking everything in contact with the water!",
		conditions : baseCond.concat("action_activate_electrodes"),
		numTargets : -1,
		hitfx : ["lampreyShock", "elementalHitSparksNoSound"],	// self
		metaTags : [stdTag.metaShock, stdTag.metaVeryPainful],
	},



	// Necro construct
	// action_necro_construct_summon_bystander
	{ text : "%S summons a scrawny skeleton that immediately retreats to a nearby wall!",
		conditions : baseCond.concat("action_necro_construct_summon_bystander"),
		hitfx : ["summonBones"],
		metaTags : [],
	},
	// action_necro_construct_spread
	{ text : "%S wraps %Shis many bony arms around %T's arms and legs! Lifting the %Trace into the air and spreading %This limbs!",
		conditions : baseCond.concat("action_necro_construct_spread"),
		hitfx : ["stretch"],
		metaTags : [],
	},
	// action_necro_construct_slave_milk
	{ text : "The device strapped to %S's %Sbsize %breasts activates, siphoning milk to %T!",
		conditions : baseCond.concat("action_necro_construct_slave_milk"),
		hitfx : ["siphonMilk"],
		metaTags : [],
	},
	


	// Itching powder
	{ text : "%S manages to slip a handful of itching powder down the front of %T's %TclothLower!",
		conditions : anyOnHumCond.concat("action_itching_powder"),
		hitfx : ["tickle"],
		metaTags : [],
	},
	{ text : "%S scratches the front of %Shis %SclothLower, providing momentary relief!",
		conditions : anyOnHumCond.concat("action_scratch_itch", "targetWearsLowerBody"),
		hitfx : ["scratchItch"],
		metaTags : [],
	},
	{ text : "%S scratches %Shis %groin, providing momentary relief!",
		conditions : anyOnHumCond.concat("action_scratch_itch", "targetNoLowerBody"),
		hitfx : ["scratchItch"],
		metaTags : [],
	},
	
	




	// GENERIC ACTIONS

	// lowBlow
	{ text : "%S throws a punch at %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreast, stdTag.metaPunch],
	},
	{ text : "%S throws a punch at %T's %Tbsize %leftright %breast, jiggling it around in %This %TclothUpper!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperBodyStretchy"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreast, stdTag.metaPunch],
	},
	{ text : "%S throws a punch at %T's %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetNotBeast"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotGroin, stdTag.metaPunch],
	},
	{ text : "%S grabs a hold of %T's nipples through %This %TclothUpper, giving them both a painful twist while tugging them out!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperBodyNotHard","targetWearsUpperBody"
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotNipples, stdTag.metaTwist],
	},
	{ text : "%S grabs a hold of %T's %groin, painfully squeezing between %This legs!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetLowerBodyNotHard","targetWearsLowerBody",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotGroin, stdTag.metaPunch],
	},
	{ text : "%S catches %T unaware, throwing a hard punch at its weak spot!",
		conditions : baseCond.concat([
			"action_lowBlow","targetBeast"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaPunch],
	},

	// ^skeleton
	{ text : "%S throws a punch with its bony hand, hitting %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_lowBlow","targetBreasts","senderIsSkeleton"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotBreast, stdTag.metaPunch],
	},
	{ text : "%S throws a punch with its bony hand, hitting %T right in %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_lowBlow","targetBreasts","senderIsSkeleton"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaVeryPainful, stdTag.metaSlotGroin, stdTag.metaPunch],
	},
	






	// PLAYER CLASS ACTIONS


	// WARRIOR
	// warrior_viceGrip
	{ text : "%S grabs a firm hold of %T's %groin and squeezes down hard!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S grabs at %T!",
		conditions : baseCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze]
	},
	{ text : "%S grabs a firm hold of %T's %leftright %breast and squeezes down hard!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetBreasts"
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S grabs a firm hold of %T's %penis and firmly squeezes down on it!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetPenis",
			{conditions:[
				"targetGroinExposed","targetNoLowerBody"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotPenis],
		
	},
	{ text : "%S grabs a firm hold of %T's %butt and squeezes down firmly!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotButt],
		
	},
	{ text : "%S grabs a firm hold of %T and %T2's groins and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		audiokits : ["squeezeGeneric"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S grabs a firm hold of %T and %T2's butts and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotButt],
		
	},
	{ text : "%S grabs a firm hold of one of %T and %T2's %breasts each and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetBreasts"
		]),
		hitfx : ["squeeze"]	,
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotBreast],	
	},

	// warrior_bolster
	{ text : "%S readies %Thimself for combat!",
		conditions : baseCond.concat([
			"action_warrior_bolster",
		]),
		hitfx : ["bolster"]
	},


	// warrior_revenge
	{ text : "%S retaliates, striking %T hard!",
		conditions : baseCond.concat([
			"action_warrior_revenge","targetBeast"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful],
	},
	{ text : "%S counters %T with a rapid jab to %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetBreasts"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotBreast],
	},
	{ text : "%S counters %T with a rapid jab to the %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetNotBeast"
		]),
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%S counters %T with a rapid jab at %This %Trsize %leftright buttcheek!",
		conditions : [
			"action_warrior_revenge","targetNotBeast"
		],
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%S counters %T with a rapid jab to the stomach!",
		conditions : [
			"action_warrior_revenge","targetNotBeast"
		],
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful],
	},

	// warrior_injuryToInsult
	{ text : "%S takes advantage of %Shis enraged opponents, throwing punches at all of them!",
		conditions : baseCond.concat([
			"action_warrior_injuryToInsult"
		]),
		numTargets : -1,
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful],
	},

	// warrior_masochism
	{ text : "%S slaps %Shis own butt, reveling in the pain!",
		conditions : baseCond.concat([
			"action_warrior_masochism",
		]),
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotButt],
		hitfx : ["slap"]
	},

	// warrior_infuriate
	{ text : "%S unleashes %Shis inner rage!",
		conditions : baseCond.concat([
			"action_warrior_infuriate",
		]),
		metaTags : [],
		hitfx : ["enrage"]
	},




	// ROGUE
	// action_rogue_exploit
	{ text : "%S exploits an opening in %T's defenses, tickling %This %groin!",
		conditions : anyOnHumCond.concat([
			"action_rogue_exploit"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S exploits an opening in %T's defenses!",
		conditions : baseCond.concat([
			"action_rogue_exploit","targetBeast"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S slips some fingers up %T's %vagina, wiggling them around briefly!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetNoLowerBody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs, tickling %This clit!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetGroinExposed","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs and grabs a hold of %T's %Tpsize %penis, giving it a couple of rapid tugs!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetGroinExposed","targetPenis"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S exploits an opening in %T's defenses, grabs a hold of and rubs %This exposed nipples!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetBreastsExposed","targetNotBeast"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S exploits an opening in %T's defenses, grabs a hold of and jiggles %This %Tbsize exposed %breasts around!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetBreastsExposed","targetBreasts"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S exploits an opening in %T's defenses, rubbing %This nipples!",
		conditions : anyOnHumCond.concat([
			"action_rogue_exploit","targetUpperBodyNotHard","targetBreasts"
		]),
		hitfx : ["squeeze"]
	},


	// action_rogue_corruptingVial
	{ text : "%S chugs a small vial!",
		conditions : baseCond.concat([
			"action_rogue_corruptingVial", "targetIsSender"
		]),
		hitfx : ["poisonVial"]
	},
	{ text : "%S throws a vial at %T, causing a warm feeling to course throughout %This body!",
		conditions : baseCond.concat([
			"action_rogue_corruptingVial", "targetNotSender"
		]),
		hitfx : ["poisonVialDrink"]
	},

	// action_rogue_steal
	{ text : "%S stole %TitemsStolenFrom from %T!",
		conditions : baseCond.concat("action_rogue_steal"),
		hitfx : ["steal"]
	},


	// action_rogue_tripwire
	{ text : "%S lays down a tripwire!",
		conditions : baseCond.concat("action_rogue_tripwire"),
		numTargets : -1,
		hitfx : ["tripwire_set"]
	},
	{ text : "%T gets caught in %S's tripwire and falls down!",
		conditions : ["action_rogue_tripwire_proc", "eventIsWrapperAdded"],
		hitfx : ["tripwire_hit"]
	},


	// rogue_comboBreaker
	{ text : "%S sneaks up on %T while %The's distracted and tickles %Thim, breaking the %Trace's concentration!",
		conditions : baseCond.concat("action_rogue_comboBreaker"),
		hitfx : ["tickle"]
	},
	{ text : "%S sneaks up on the distracted %Trace and sticks %Shis hand down %T's %TclothLower, shoving a finger into %This %vagina and breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetVagina", "targetWearsLowerBody"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaUsedFinger],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on the distracted %Trace and sticks %Shis hand down %T's %TclothLower, rapidly tickling %This clit and breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetVagina", "targetWearsLowerBody"),
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotClit, stdTag.metaUsedFinger],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on the distracted %Trace and surprises %T's by shoving a two fingers into into %This %vagina and %Shis pinky up into %This %Trsize %butt, breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetVaginaExposed"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaUsedFinger, stdTag.metaSlotButt],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on the distracted %Trace and surprises %T's by shoving %Shis fist into into %T's %vagina, breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetVaginaExposed", "targetMuchTaller"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaUsedFist],
		hitfx : ['squishTiny']
	},

	{ text : "%S sneaks up behind %T! Taking advantage of %Thim being distracted, %S forcefully shoves %Shis %Spsize %penis up into the %Trace's %vagina, causing %Thim to lose concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetVaginaExposed", "senderPenisExposed"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotVagina, stdTag.metaUsedPenis],
		hitfx : ['squishLong']
	},
	{ text : "%S sneaks up behind %T! Taking advantage of %Thim being distracted, %S forcefully shoves %Shis %Spsize %penis up into the %Trace's %Trsize %butt, causing %Thim to lose concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetButtExposed", "senderPenisExposed"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaUsedPenis],
		hitfx : ['squishLong']
	},
	{ text : "%S sneaks up on the distracted %Trace and sticks %Shis hand down %T's %TclothLower, shoving a finger into %This %Trsize %butt and breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetWearsLowerBody"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaUsedFinger],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on the distracted %Trace and tickles %T's balls, breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetPenisExposed"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaUsedFinger],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on the distracted %Trace and tickles %T's balls, breaking %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", "targetPenisExposed"),
		metaTags : [stdTag.metaPenetration, stdTag.metaVeryArousing, stdTag.metaSlotButt, stdTag.metaUsedFinger],
		hitfx : ['squishTiny']
	},
	{ text : "%S sneaks up on %T while the %Trace is distracted and prods %Shis finger up in between them, sliding it up and down rapidly enough that %T loses %This concentration!",
		conditions : humOnHumCond.concat("action_rogue_comboBreaker", {conditions:["targetWearsThong", "targetButtExposed"], min:1}),
		metaTags : [stdTag.metaTickle, stdTag.metaArousing, stdTag.metaSlotButt, stdTag.metaUsedFinger],
		hitfx : ['tickle']
	},
		



	// rogue_sneakAttack
	{ text : "%S sneaks up behind %T and surprises the %Trace with a thorough tickling!",
		conditions : baseCond.concat("action_rogue_sneakAttack"),
		metaTags : [stdTag.metaTickle, stdTag.metaUsedFinger],
		hitfx : ["tickle"]
	},

	{ text : "%S sneaks up behind %T and shoves %Shis hand up between %This legs, briefly giving %This %groin a squeeze before sliding the hand back and up across the %Trace's %Trsize %butt!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack"),
		metaTags : [stdTag.metaRub, stdTag.metaSlotGroin, stdTag.metaSlotButt, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks up behind %T, squeezes a firm hold of %This buttcheeks, and jiggles them around rapidly!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", {conditions:["targetWearsThong", "targetButtExposed"], min:1}),
		metaTags : [stdTag.metaSqueeze, stdTag.metaJiggle, stdTag.metaSlotButt, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks up behind %T, squeezes a firm hold of %This %Tbsize %breasts, and jiggles them around rapidly!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetUpperBodyNotHard", "targetBreasts"),
		metaTags : [stdTag.metaSqueeze, stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks up behind %T and reaches at %This nipples, pinches a hold of them between %Shis thumb and index finger and rubs them playfully!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetUpperBodyNotHard", "targetBreasts"),
		metaTags : [stdTag.metaSqueeze, stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaArousing],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks up behind %T and grabs a hold of the front straps of %This %TclothLower, tugging them out to the side and exposing the %Trace's %Trsize %breasts! Before %T can react, %S grabs %This nipples and jiggles %This %breasts around a bit!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetBreasts", "targetWearsSlingBikini"),
		metaTags : [stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaSlotNipples, stdTag.metaArousing],
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks up behind %T and grabs a hold of the front of %This %TclothLower. %S gives it a rapid tug upwards, causing %Trace's %Trsize %breasts to be exposed! Before %T can react, %S grabs %This nipples and jiggles them around!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetBreasts", "targetUpperBodyCanPullUp"),
		metaTags : [stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaSlotNipples, stdTag.metaArousing],
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["squeeze"]
	},

	{ text : "%S sneaks up behind %T and grabs a firm hold of %This %TclothLower, giving it a forceful tug down and exposing %This %Tgenitals! The %Srace immediately prods %Shis hand up between %T's legs and gives %Thim a %couple of firm rubs!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetLowerBodyCanPullDown"),
		metaTags : [stdTag.metaJiggle, stdTag.metaSlotBreasts, stdTag.metaSlotNipples, stdTag.metaArousing],
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["squeeze"]
	},
	{ text : "%S sneaks around %T and slips %Shis hand into %This %TclothLower, tickling %This %vagina!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetWearsLowerBody", "targetVagina"),
		metaTags : [stdTag.metaTickle, stdTag.metaSlotVagina, stdTag.metaUsedFinger],
		hitfx : ["tickle"]
	},
	{ text : "%S sneaks around %T and slips %Shis hand into %This %TclothLower, tickling %This balls!",
		conditions : humOnHumCond.concat("action_rogue_sneakAttack", "targetWearsLowerBody", "targetPenis"),
		metaTags : [stdTag.metaTickle, stdTag.metaSlotBalls, stdTag.metaUsedFinger],
		hitfx : ["tickle"]
	},
	

	





	// CLERIC | Todo: tag

	// action_cleric_smite
	{ text : "%S smites %T with holy magic!",
		conditions : baseCond.concat([
			"action_cleric_smite",
		]),
		hitfx : ["smite"]
	},


	// action_cleric_chastise
	{ text : "%S chastises %T with divine might!",
		conditions : baseCond.concat([
			"action_cleric_chastise","targetBeast"
		]),
		hitfx : ["chastise"]
	},
	{ text : "Divine magic wraps around %T's %Tpsize %penis!",
		conditions : anyOnHumCond.concat([
			"action_cleric_chastise","targetPenis"
		]),
		hitfx : ["chastise"]
	},
	{ text : "%T's %vagina tingles as divine magic flows across it!",
		conditions : anyOnHumCond.concat([
			"action_cleric_chastise","targetVagina"
		]),
		hitfx : ["chastise"]
	},
	{ text : "Divine chains wrap around %T's nipples, magically restraining them!",
		conditions : anyOnHumCond.concat([
			"action_cleric_chastise","targetBreasts"
		]),
		hitfx : ["chastise"]
	},


	// action_cleric_heal
	{ text : "Divine magic from %S's heal washes across %T!",
		conditions : baseCond.concat([
			"action_cleric_heal",
		]),
		hitfx : ["holyHeal"]
	},

	// action_cleric_reserection
	{ text : "%T is bathed in divine magic, rising to %This feet once more!",
		conditions : baseCond.concat([
			"action_cleric_reserection",
		]),
		hitfx : ["resurrect"]
	},
	{ text : "%S starts drawing a large amount of holy energy around %Shim!",
		numTargets : -1,
		conditions : ["eventIsActionCharged", "action_cleric_reserection"],
		hitfx : ["holyCharged"]
	},

	// action_cleric_penance
	{ text : "%S surrounds %Shimself with holy runes!",
		conditions : baseCond.concat([
			"action_cleric_penance",
		]),
		hitfx : ["holyRunes"]
	},

	// action_cleric_radiant_heal
	{ text : "A pulse of divine magic radiates from %S!",
		numTargets : -1,
		conditions : baseCond.concat([
			"action_cleric_radiant_heal",
		]),
		hitfx : ["aoeHeal","holyHeal"]
	},
	{ text : "Holy sparkles begin to circle around %S!",
		numTargets : -1,
		conditions : ["eventIsActionCharged", "action_cleric_radiant_heal"],
		hitfx : ["holyCharged"]
	},

	




	// TENTACLEMANCER | Todo: Tag when revamp

	// action_tentaclemancer_tentacleWhip
	{ text : "%S summons a tentacle, commanding it to lash at %T!",
		conditions : baseCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBeast"
		]),
		metaTags : [stdTag.metaWhip, stdTag.metaPainful, stdTag.metaUsedTentacles],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a tentacle behind %T whacking across %This %Trsize %butt!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip"
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, slapping up across %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, giving %This %Tpsize %penis a couple of lashes!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetNoLowerBody"
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotPenis, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle behind %T, lashing across %This %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, lashing across %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperBodyHard"
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotBreast, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, giving a jiggling lash across %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperBodyNotHard"
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotBreast, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, smacking %This %Tpsize %penis around!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetLowerBodyNotHard","targetLowerBodyOrNoDamage","targetPenisExposed"
		]),
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlotPenis, stdTag.metaWhip, stdTag.metaPainful],
		hitfx : ["tentacleWhip"]
	},



	// action_tentaclemancer_corruptingOoze
	{ text : "%S flings a purple bolt of sludge at %T, coating %This body!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze","targetNoLowerBody","targetNoUpperBody"
		]),
		metaTags : [stdTag.metaGooey],
		hitfx : ["sludgeBoltPurple"] // 
	},
	{ text : "%S flings a purple bolt of sludge at %T, slipping into %This outfit!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze",
			{conditions:[
				"targetWearsLowerBody","targetWearsUpperBody"
			]},
		]),
		metaTags : [stdTag.metaGooey],
		hitfx : ["sludgeBoltPurple"]
	},
	{ text : "The corrupting ooze constricts around %T's body, immobilizing %Thim!",
		// Custom trigger for proc
		conditions : [
			"eventIsEffectTrigger",
			{
				type:"effectLabel",
				data:{label:"corrupting_ooze_proc"},
				targnr:0
			}
		],
		hitfx : ["sludgePurple"],
		metaTags : [stdTag.metaGooey],
	},


	// action_tentaclemancer_siphonCorruption
	{ text : "The living ooze wiggles around %T's body, allowing %S to absorb its energy!",
		conditions : baseCond.concat([
			"action_tentaclemancer_siphonCorruption","targetBeast"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T protrudes into %This %butt, causing a warm sensation as it wiggles and bubbles inside! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption",
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaArousing],
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T protrudes into %This %vagina, causing a warm sensation as it wriggles and bubbles inside %Thim! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetVagina"
		]),
		hitfx : ['siphonCorruption'],
		metaTags : [stdTag.metaGooey, stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaArousing],
	},
	{ text : "The living ooze attached to %T wraps around %This %penis, causing a warm sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetPenis"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaSqueeze, stdTag.metaSlotPenis, stdTag.metaArousing],
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T wraps around %This nipples, causing a tingling sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetBreasts"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaPenetration, stdTag.metaSlotNipples, stdTag.metaArousing],
		hitfx : ['siphonCorruption'],
	},


	// tentaclemancer_infusion
	{ text : "%S rubs a wad of glowing ooze across %T!",
		conditions : baseCond.concat([
			"action_tentaclemancer_infusion", "targetNotSender"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		audiokits : ["infusion"],
		hitfx : ["glowingOoze"]
	},
	{ text : "%S rubs a wad of glowing ooze across %Thimself!",
		conditions : baseCond.concat([
			"action_tentaclemancer_infusion", "targetIsSender"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		audiokits : ["infusion"],
		hitfx : ["glowingOoze"]
	},

	// tentaclemancer_grease
	{ text : "%S surrounds %T with an oily grease, increasing their speed!",
		conditions : baseCond.concat([
			"action_tentaclemancer_grease", "targetNotSender"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		audiokits : ["grease"],
		hitfx : ["glowingOozeSplat"]
	},
	{ text : "%S surrounds %Thimself with an oily grease, increasing their speed!",
		conditions : baseCond.concat([
			"action_tentaclemancer_grease", "targetIsSender"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		hitfx : ["glowingOozeSplat"],
		audiokits : ["grease"],
	},

	// tentaclemancer_slimeWard
	{ text : "A thin mist of slime surrounds %T!",
		conditions : baseCond.concat([
			"action_tentaclemancer_slimeWard"
		]),
		metaTags : [stdTag.metaGooey, stdTag.metaArousing],
		audiokits : ["slimeWard"],
		hitfx : ["glowingOozeGreen"],
		audiokits : ["slimeWard"],
	},



	// MQ00_Boss
	// action_tentacle_pit
	{ text : "The ground around %S darkens!",
		conditions : baseCond.concat([
			"action_tentacle_pit",
		]),
		hitfx : ["darkOrb"],
	},
	// Proc
	{ text : "Tendrils spring from the darkened ground, restraining %T and lifts %Thim off the ground, spreading the %Trace's legs!",
		conditions : ["eventIsEffectTrigger","action_tentacle_pit_proc",],
		hitfx : ["tentacleGrab"],
	},




	// MONK
	// action_monk_roundKick
	{ text : "%S spins around, throwing a rapid kick at %T!",
		conditions : baseCond.concat([
			"actionHit",
			"eventIsActionUsed",
			"action_monk_roundKick",
		]),
		audiokits : ["monkKick"],
		hitfx : ["punch"],
		metaTags : [stdTag.metaKick, stdTag.metaPainful],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and throws a rapid jab at %T's %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		audiokits : ["monkKick"],
		hitfx : ["punch"],
		metaTags : [stdTag.metaPunch, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and swipes %Shis palm right across %T's %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and smacks %Shis palm right across %T's %Trsize %butt!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotButt],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, forcing %Shis hand between %T's legs, rapidly rubbing %This %vagina!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina"
		],
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaRub, stdTag.metaArousing, stdTag.metaSlotVagina],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, grabbing a hold of and %firmly squeezing %This package!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetPenis","targetLowerBodyNotHard"
		],
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaPainful, stdTag.metaSlotGroin],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and grabs the front of %T's %TclothLower, tugging at it and exposing %This %Tgenitals!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetLowerBodyNotHard","targetLowerBodyDamaged"
		],
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotGroin, stdTag.metaSlotClothes],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and grabs the back of of %T's %TclothLower, tugging it down and exposing %This %Trsize %butt!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetLowerBodyNotHard","targetLowerBodyDamaged","targetLowerBodyWaistband"
		],
		turnTags : [stdTag.ttButtExposed],
		hitfx : ["squeeze"],
		metaTags : [stdTag.metaStretch, stdTag.metaSlotGroin, stdTag.metaSlotClothes],
	},
	
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and slaps %This %Tpsize %penis!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetPenisExposed"
		],
		hitfx : ["slap"],
		metaTags : [stdTag.metaSlap, stdTag.metaPainful, stdTag.metaSlotPenis],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and thrusts a few fingers inside %T's %vagina, briefly wiggling them around!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina","targetGroinExposed"
		],
		hitfx : ["squishTiny"],
		metaTags : [stdTag.metaUsedFinger, stdTag.metaArousing, stdTag.metaSlotVagina, stdTag.metaPenetration],
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S dodges the attack and counters with a tentacle lash across %T's exposed %groin!",
		"armor_slot":"lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles"
		],
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaWhip, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %butt!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"],
		metaTags : [stdTag.metaUsedClaw, stdTag.metaPinch, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"],
		metaTags : [stdTag.metaUsedClaw, stdTag.metaPinch, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's exposed %vagina!",
		"armor_slot":"lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetGroinExposed","targetVagina"
		],
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaSlotVagina, stdTag.metaVeryArousing],
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's %Trsize exposed %butt!",
		"armor_slot":"lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetButtExposed"
		],
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing],
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S slinks under and wraps a tendril around the bottom of %T's %TclothLower, tugging it aside and thrusting a tentacle up inside the %Trace's %Trsize %butt!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetLowerBodyNotPants", "targetLowerBodyNotHard", "targetWearsLowerBody"
		],
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaPenetration, stdTag.metaSlotButt, stdTag.metaVeryArousing],
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S slinks under and wraps a tendril into %T's %TclothLower, wrapping around and %firmly squeezing down on %This genitals!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetLowerBodyNotPants", "targetLowerBodyNotHard", "targetPenis"
		],
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaSlotPenis, stdTag.metaPainful],
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S slinks a tentacle underneath the attack, shooting up towards %T's %groin! The tentacle rapidly immediately wraps around %T's %Tpsize package and squeezes down painfully!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetLowerBodyNotPants", "targetLowerBodyNotHard", "targetPenis", "targetPenisLarge"
		],
		hitfx : ["tentacleSqueeze"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSqueeze, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	

	// action_monk_disablingStrike
	{ text : "%S lands a mystical touch on %T, lowering their physical ability!",
		conditions : baseCond.concat([
			"action_monk_disablingStrike",
		]),
		hitfx : ["darkPunch"]
	},

	// action_monk_upliftingStrike
	{ text : "%S throws a mystical strike at %T, allowing some chi to slip out and surround a nearby ally!",
		conditions : baseCond.concat([
			"action_monk_upliftingStrike",
		]),
		hitfx : ["healingPunch"],
		metaTags : [stdTag.metaPunch],
	},

	// action_monk_meditate
	{ text : "%S enters a calm state.",
		conditions : baseCond.concat([
			"action_monk_meditate",
		]),
		hitfx : ["monkMeditate"],
	},

	// action_monk_lowKick
	{ text : "%S spins around low, sweeping at %Shis enemies' feet!",
		conditions : baseCond.concat(["action_monk_lowKick"]),
		audiokits : ["monkKick"],
		hitfx : ["punch"],
		metaTags : [stdTag.metaKick, stdTag.metaPainful],
		numTargets : -1,
	},

	// action_monk_circleOfHarmony
	{ text : "A circle of energy surrounds %S!",
		conditions : baseCond.concat(["action_monk_circleOfHarmony"]),
		hitfx : ["circleOfHarmony"],
		metaTags : []
	},


	// ELEMENTALIST

	// action_elementalist_iceBlast
	{ text : "%S sends a chilling blast across %T!",
		conditions : baseCond.concat("action_elementalist_iceBlast"),
		hitfx : ["ice_blast"],
		metaTags : [stdTag.metaCold],
	},
	{ text : "%S sends a chilling blast across %T's %breasts, hardening %This nipples!",
		conditions : baseCond.concat("action_elementalist_iceBlast","targetBreasts"),
		hitfx : ["ice_blast"],
		metaTags : [stdTag.metaCold, stdTag.metaSlotNipples],
	},

	// action_elementalist_healingSurge
	{ text : "%S summons a splash of healing water that flows across %T's body!",
		conditions : baseCond.concat([
			"action_elementalist_healingSurge",
		]),
		hitfx : ["healingSurge"],
		metaTags : [stdTag.metaWet],
	},

	// action_elementalist_waterSpout
	{ text : "%S summons a water spout beneath %T, coating %Thim in cold water!",
		conditions : baseCond.concat(["action_elementalist_waterSpout"]),
		hitfx : ["waterSpout"],
		metaTags : [stdTag.metaWet, stdTag.metaCold],
	},
	{ text : "%S summons a cold water spout beneath %T, splashing up against %This %groin!",
		conditions : anyOnHumCond.concat(["action_elementalist_waterSpout",]),
		hitfx : ["waterSpout"],
		metaTags : [stdTag.metaWet, stdTag.metaCold, stdTag.metaSlotGroin],
	},


	// action_elementalist_earthShield
	{ text : "%S beckons sheets of earth to surround %T!",
		conditions : baseCond.concat(["action_elementalist_earthShield"]),
		hitfx : ["earthShield"],
		metaTags : [],
	},

	// action_elementalist_discharge
	{ text : "%S lets out a burst of electricity, shocking all nearby enemies!",
		conditions : baseCond.concat(["action_elementalist_discharge"]),
		numTargets : -1,
		hitfx : ["lampreyShock", "elementalHitSparksNoSound"],	// self
		metaTags : [stdTag.metaShock, stdTag.metaVeryPainful],
	},

	// action_elementalist_riptide
	{ text : "%S starts chanting, condensation building around %Shim at a rapid pace!",
		conditions : ["action_elementalist_riptide", "eventIsActionCharged"],
		hitfx : ["water_cast"],
		metaTags : [],
		numTargets : -1,

	},
	// action_elementalist_riptide finish 
	{ text : "%S sends a flood of enchanted water across the area!",
		conditions : baseCond.concat(["action_elementalist_riptide"]),
		hitfx : ["riptide", "healingSurgeSilent"],
		metaTags : [stdTag.metaWet],
		numTargets : -1,

	},







	// PROPS
	// Groperope
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Trsize %butt, constricting %This buttcheeks!",
		conditions : anyOnHumCond.concat("action_gropeRope"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind, stdTag.metaSlotButt],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's body, constricting firmly!",
		conditions : baseCond.concat("action_gropeRope", "targetBeast"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Trsize %penis, %thoroughly constricting it!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetPenis", "targetGroinExposed"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaSlotPenis],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %groin, %thoroughly constricting it!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetPenis", "targetWearsLowerBody", "targetLowerBodyNotHard"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaSlotGroin],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Tbsize %breasts, %thoroughly constricting them!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaSlotBreasts],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's torso before constricting, chafing into %This %breasts!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind, stdTag.metaSlotBreasts],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself down %This %groin and up across %This %butt, firmly constricting!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetLowerBodyNotHard"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind, stdTag.metaSlotButt, stdTag.metaSlotGroin],
	},
	{ text : "%S lashes %Shis groperope at %T. The rope slips across %This %groin and up across %This back before constricting, slipping between %This buttcheeks and chafing into %This %vagina!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetGroinExposed", "targetVagina"),
		hitfx : ["whipSqueeze"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind, stdTag.metaSlotButt, stdTag.metaSlotVagina],
	},


	// divine scepter
	{ text : "%S points %Shis divine scepter at %T, smiting %Thim with holy magic!",
		conditions : baseCond.concat([
			"action_divineScepter",
		]),
		hitfx : ["smite"]
	},


	// Milk machine
	{ text : "%S latches %Shis milk machine onto %T's %Tbsize exposed %breasts, siphoning an amount of liquid into a small bottle attached to the machine!",
		conditions : anyOnHumCond.concat("action_milk_machine", "targetBreastsExposed"),
		hitfx : ["siphonMilkReverse"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaSuck, stdTag.metaSlotBreasts, stdTag.metaSlotNipples, stdTag.metaArousing],
	},
	{ text : "%S latches %Shis milk machine onto %T's %Tpsize exposed %penis, siphoning a small amount of liquid into a little bottle attached to the machine!",
		conditions : anyOnHumCond.concat("action_milk_machine", "targetPenisExposed"),
		hitfx : ["siphonMilkReverse"],
		metaTags : [stdTag.metaSqueeze, stdTag.metaSuck, stdTag.metaSlotPenis, stdTag.metaArousing],
	},






	// FOOD
	{ text : "%S eats a razzyberry.",
		conditions : baseCond.concat("action_food_razzyberry"),
		hitfx : ["razzyberry"]
	},
	{ text : "%S eats some fried fish.",
		conditions : baseCond.concat("action_food_fried_fish"),
		hitfx : ["eat_generic"]
	},
	{ text : "%S chugs a pint of ale.",
		conditions : baseCond.concat("action_food_ale"),
		hitfx : ["drink_generic"]
	},
	{ text : "%S drinks a small bottle of white liquid.",
		conditions : baseCond.concat("action_food_humanoid_milk"),
		hitfx : ["drink_generic"]
	},

	{ text : "%S throws a small stone at %T!",
		conditions : baseCond.concat("action_throw_rock"),
		metaTags : [stdTag.metaPainful],
		hitfx : ["throwStone"]
	},


	{ text : "%S splashes some sewer water across %T!",
		conditions : baseCond.concat("action_sewer_water", "targetNotSender"),
		metaTags : [stdTag.metaWet],
		hitfx : ["sludgeBoltBlue"]
	},
	{ text : "%S splashes some sewer water onto %Thimself!",
		conditions : baseCond.concat("action_sewer_water", "targetIsSender"),
		metaTags : [stdTag.metaWet],
		hitfx : ["sludgeBoltBlue"]
	},

	
	






	// BOSS FIGHTS
	// SQ_sharktopus
	{ text : "%S hits the gong, creating a ringing noise!",
		conditions : baseCond.concat("targetIsSQ_sharktopus_gong"),
		hitfx : ["gong"],
		metaTags : [stdTag.metaUsedWhip, stdTag.metaSqueeze, stdTag.metaGrind, stdTag.metaSlotButt, stdTag.metaSlotVagina],
		weight : Text.WEIGHT_REQUIRED,
	},

	// action_sharktopus_attack
	// Single target
	{ text : "%S sneaks a tentacle out of the water behind %T, it finds %This %TclothLower and wraps around the back, tugging down %firmly!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack","targetLowerBodyDamaged","targetLowerBodyCanPullDown"),
		hitfx : ["tentacleStretch"],
		turnTags : [stdTag.ttButtExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaSlotClothes],
	},
	{ text : "%S sneaks a tentacle out of the water behind %T, it slips between %This legs and wraps around the front of %This %TclothLower, tugging down %firmly and exposing the %Trace's %Tgenitals!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack","targetLowerBodyDamaged","targetLowerBodyCanPullDown"),
		hitfx : ["tentacleStretch"],
		turnTags : [stdTag.ttGroinExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaSlotClothes],
	},
	{ text : "%S slips a tentacle out of the water between %T's legs, wrapping it around the bottom of %This %TclothLower and tugging down %firmly!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack","targetLowerBodyDamaged","targetLowerBodyNotPants"),
		hitfx : ["tentacleStretch"],
		turnTags : [stdTag.ttGroinExposed, stdTag.ttButtExposed],
		metaTags : [stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaSlotClothes],
	},

	{ text : "%S sneaks a tentacle out of the water beneath %T, flicking it against %This %groin!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "One of %S's tentacles slip out of the water and up behind %T, surprising %Thim with a hard slap across %This %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%T feels tentacles under the surface of the water wrap around and spread %This legs. A moment later, %S shoots out from beneath %Thim, giving a quick bite across %This %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite, stdTag.metaSlotButt, stdTag.metaVeryPainful],
	},
	{ text : "Submerged tentacles wrap around and spread %T legs! A moment later, a thick tentacle shoots out from beneath %Thim, whapping up against %This %groin!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleWhip"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaSlap, stdTag.metaSlotGroin, stdTag.metaVeryPainful],
	},
	{ text : "%S rapidly emerges behind %T, giving the %Trace's %Trsize %butt a quick bite before submerging again!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetLowerBodyOrNoDamage"),
		hitfx : ["biteGeneric"],
		metaTags : [stdTag.metaBite, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	

	// Multi target
	{ text : "%S's tentacles slip out of the water behind %T and %T2, surprising them with a hard slap across their %butts!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleWhip"],
		numTargets : 2,
		metaTags : [stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaPainful],
	},
	{ text : "%S's tentacles rise from the murky water, flicking up between %T and %T2's legs!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleWhip"],
		numTargets : 2,
		metaTags : [stdTag.metaWhip, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	{ text : "%S's tentacles rise from the murky water, wrapping around both %T and %T's groins and squeezes down!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetPenis"),
		hitfx : ["tentacleSqueeze"],
		numTargets : 2,
		metaTags : [stdTag.metaSqueeze, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaPainful],
	},
	{ text : "A sturdy tentacle rises from the murky water behind %T2, it slinks up between %T2his legs towards %T and wraps a hold of %This %TclothLower! Once it grasps a firm hold, the tendril retracts, sending %T backwards and slamming into %T2!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetOneWearsLowerBody", "targetLowerBodyOrNoDamage"),
		hitfx : ["tentacleStretch"],
		numTargets : 2,
		metaTags : [stdTag.metaUsedTentacles],
	},
	{ text : "Two sturdy tentacles rise from below and wrap themselves around the back of %T2's %T2clothLower and %T's %TclothLower, lifting them both out of the water!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetLowerBodyOrNoDamage", "targetWearsLowerBody"),
		hitfx : ["tentacleStretch"],
		numTargets : 2,
		metaTags : [stdTag.metaUsedTentacles],
	},
	{ text : "Two tendrils rise below %T and %T2! The tendrils quickly wrap around the back of %T's %TclothLower and %2T's %T2clothLower, yanking down quickly and exposing their %butts!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetLowerBodyOrNoDamage", "targetWearsLowerBody", "targetLowerBodyCanPullDown"),
		hitfx : ["tentacleStretch"],
		numTargets : 2,
		metaTags : [stdTag.metaUsedTentacles],
	},
	{ text : "Tentacles rise from the water below and wrap around %T and %T2's waists, lifting %T onto %T2's back! %S rises behind them and takes turns at biting each of their %butts!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["biteGeneric"],
		numTargets : 2,
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaBite, stdTag.metaPainful],
	},
	{ text : "%S's tentacles rise from the water and wrap around %T and %T2's waists, slamming them together face first!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack"),
		hitfx : ["tentacleSqueeze"],
		numTargets : 2,
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaPainful],
	},
	{ text : "Tentacles burst from the water below and wrap around the sides of %T's %TclothLower and %T2's %T2clothLower, and lifts both of them into the air before briefly shaking them around!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody", "targetLowerBodyWaistband", "targetLowerBodyOrNoDamage"),
		hitfx : ["tentacleStretch"],
		numTargets : 2,
		metaTags : [stdTag.metaStretch, stdTag.metaUsedTentacles, stdTag.metaWedgie],
	},
	{ text : "A large tentacle seeks its way out of the water and into %T's %TclothLower from the side, slipping out of the other side and finding %T2's %T2clothLower, doing the same to that before coiling around. The two are pulled together groin to groin, forcing them to struggle to loosen the firm grip of the tentacle!",
		conditions : anyOnHumCond.concat("action_sharktopus_attack", "targetLowerBodyOrNoDamage", "targetWearsLowerBody", "targetLowerBodyNotPants"),
		numTargets: 2,
		hitfx : ["tentacleStretch"],
		metaTags : [stdTag.metaUsedTentacles, stdTag.metaStretch],
	},




	// action_sharktopus_arouse
	// Single target
	{ text : "One of %S's tentacles slip out of the water and up between %T's legs, surprising %Thim by grinding it against %This %groin!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "%S quickly emerges behind %T and forces its long tongue down between %This legs, down over %T's %groin and up across %This %butt!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaLick, stdTag.metaUsedTongue, stdTag.metaSlotGroin, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "One of %S's slimy tentacles slips out of the water and prods up against %T's %TclothLower, moving it around in a spiral motion!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "One of %S's tentacles slip out of the water and up behind %T, wrapping around %This neck before forcing itself inside the %Trace's mouth where it thrusts a multitude of times!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["slowThrustsTentacle"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaSlotMouth, stdTag.metaArousing],
	},
	{ text : "%S bursts from the water behind %T and slides its long tongue across the %Trace's %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaLick, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "%S bursts from the water in front of %T and slides its long tongue across the %Trace's %Trsize %groin!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaLick, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "Suddenly something wraps around %T's legs and spreads them, forcing %This lower body beneath the surface of the murky water. Before %The can react, an unknown thick appendage forces its way into the %Trace's %Trsize %butt, wiggling around on the inside!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetButtExposed"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaLick, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "Suddenly something wraps around %T's legs and spreads them, forcing %This lower body beneath the surface of the murky water. Before %The can react, a thick unknown appendage forces its way into the %Trace's %TclothLower and slithers inside %This %Trsize %butt, wiggling around inside %Thim!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaLick, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "Suddenly something wraps around %T's legs and spreads them, forcing %This lower body beneath the surface of the murky water. Before %The can react, an unknown thick appendage forces its way into the %Trace's %vagina, wiggling around inside %Thim!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetVaginaExposed"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaSlotVagina, stdTag.metaArousing],
	},
	{ text : "Suddenly something wraps around %T's legs and spreads them, forcing %This lower body beneath the surface of the murky water. Before %The can react, a thick unknown appendage forces its way into the %Trace's %TclothLower and slithers inside %This %vagina, wiggling around inside %Thim!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody", "targetVagina"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "A thick tentacle bursts from the water and wraps around %T's neck! While grabbing at it, another two wrap around %This knees, lifting the %Trace into the air and spreading %This legs. The %S rises from the water behind %Thim and lashes %Shis tongue up between %T's %Trsize buttcheeks, licking between them a few times before slipping in, licking %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetButtExposed"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "A thick tentacle bursts from the water and wraps around %T's neck! While grabbing at it, another two wrap around %This knees, lifting the %Trace into the air and spreading %This legs. The %S rises from the water behind %Thim and bites at the back of %T's %TclothLower, tugging it down. %S lashes %Shis tongue up between %T's now exposed buttcheeks, licking between them a few times before slipping in, licking %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetLowerBodyCanPullDown"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "A thick tentacle bursts from the water and wraps around %T's neck! While grabbing at it, another two wrap around %This knees, lifting the %Trace into the air and spreading %This legs. The %S rises from the water in front of %Thim and lashes %Shis tongue up at %T's %vagina, licking a few times before slipping in, licking %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetVaginaExposed"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "A thick tentacle bursts from the water and wraps around %T's neck! While grabbing at it, another two wrap around %This knees, lifting the %Trace into the air and spreading %This legs. The %S rises from the water in front of %Thim and bites at the front of %T's %TclothLower, tugging it down. %S lashes %Shis tongue up between %T's now exposed %vagina, licking a few times before slipping in, licking %Thim on the inside!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetLowerBodyCanPullDown", "targetVagina"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTongue, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "Suddenly two tentacles wrap around %T's legs beneath the water, locking them into a place! Something much smaller slips in under %This feet and starts wiggling rapidly, tickling the %Trace!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaTickle, stdTag.metaUsedTentacles, stdTag.metaArousing],
	},
	{ text : "Two tentacles wrap around %T's legs beneath the water and spreads them, forcing %This %butt below the surface with a loud splash! Something with what feels like nubs are suddenly pushed up against the %Trace's %groin and starts wiggling rapidly, heavily tickling the spot!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetLowerBodyNotHard"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaTickle, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "Two tentacles wrap around %T's legs beneath the water and spreads them, forcing %This %butt below the surface with a loud splash! Something with what feels like nubs suddenly slither into %This %TclothLower, pushing up against the %Trace's %Tgenitals and starts wiggling rapidly, heavily tickling the spot!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaTickle, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotGroin],
	},
	{ text : "Two tentacles wrap around %T's legs beneath the water and spreads them, forcing %This %butt below the surface with a loud splash! Something with what feels like nubs suddenly slither up against %This %Tgenitals and starts wiggling rapidly, heavily tickling the area!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody"),
		hitfx : ["tentacleRub"],
		metaTags : [stdTag.metaTickle, stdTag.metaUsedTentacles, stdTag.metaArousing, stdTag.metaSlotGroin],
	},

	
	
	



	// Multi target
	{ text : "%S's tentacles slip out of the water between %T and %T2's legs, surprising them by grinding the slimy appendage against their %groins!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "A multiple of smaller tentacles sneak out of the water between %T and %T2's legs, surprising the two of them by wiggling rapidly against their %groins, tickling both of them!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaTickle, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	
	{ text : "A thick tentacle emerges from the water behind %T, pushing %Thim head first into the front of %T2! Before the two can separate, two slightly smaller tendrils emerge behind them! The tendrils prod up against the back of %T's %TclothLower and %T2's %T2clothLower, grinding in between their buttcheeks and pushing their pelvises together!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody", "targetLowerBodyNotHard"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "A thick tentacle emerges from the water in front of %T and pushes %Thim back towards %T2's back! Before the two can separate, two slightly smaller tendrils emerge behind them and prod up against the their %groins firmly rubbing into both of them!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody", "targetLowerBodyNotHard", "targetVagina"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	
	{ text : "A thick tentacle launches out of the water and lifts %T by %This waist at the same time as another two tendrils grab a hold of %T2's legs beneath the water! %S shoves %T backwards towards %T2's back, leaving %T2 bent over with %T on %This back with %This legs spread by another two of the beast's tendrils. The %S rises out of the water between their legs and extends its long gooey tongue, lashing it up and down between the legs of both its victims!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleSuck"],
		numTargets : 2,
		metaTags : [stdTag.metaLick, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	
	{ text : "A tentacle slithers beneath the surface and loops around %T's lower legs, rapidly lifting and causing the %Trace to hang upside down! A second tendril rises out of the water and wraps around %T2's neck, forcing the %T2race over towards %T and pushing %T2his face firmly into %T's %groin before letting to a few moments later!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaSlotFace, stdTag.metaArousing],
	},
	{ text : "%S slinks a tentacle above the surface, slithering down across %T's %Trsize %butt and up between %This legs, forcing %Thim to stand tiptoe in the cold water as the tendril slithers ahead! It manages to slip between %T2's legs and up across %T2his %T2rsize %butt as it begins to lift at both ends, causing both of them to glide down the slimy appendage until they collide face to face in the middle!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "%S slinks a tentacle above the surface, slithering down across %T's %Trsize %groin and up against %This %butt, forcing %Thim to stand tiptoe in the cold water as the tendril slithers ahead! It manages to slip between %T2's legs and up across %T2his %groin as well, and begins to lift at both ends, causing both of them to glide down the slimy appendage until they collide back to back in the middle!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetVagina"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaArousing],
	},
	{ text : "%S surprises %T1 and %T2 its tentacles wrap around their wrists and give them a hard yank, forcing %T2's hand down the front of %T's %TclothLower and %T's hand down the front of %T's %TclothLower before jiggling their hands around a bit!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetWearsLowerBody", "targetLowerBodyWaistband"),
		hitfx : ["tentacleRub"],
		numTargets : 2,
		metaTags : [stdTag.metaRub, stdTag.metaUsedTentacles, stdTag.metaSlotGroin, stdTag.metaArousing],
	},
	{ text : "Two of %S's cock-tipped tentacles shoot out of the water below %T and %T2, easily sliding into their exposed %butts where they wiggle around a bit!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetButtExposed"),
		hitfx : ["slowThrustsTentacle"],
		numTargets : 2,
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaSlotButt, stdTag.metaVeryArousing],
	},
	{ text : "Two of %S's cock-tipped tentacles shoot out of the water below %T and %T2, easily sliding into their exposed %vaginas where they wiggle around a bit!",
		conditions : anyOnHumCond.concat("action_sharktopus_arouse", "targetVaginaExposed"),
		hitfx : ["slowThrustsTentacle"],
		numTargets : 2,
		metaTags : [stdTag.metaPenetration, stdTag.metaUsedTentacles, stdTag.metaSlotVagina, stdTag.metaVeryArousing],
	},
	



	
];

export default lib;