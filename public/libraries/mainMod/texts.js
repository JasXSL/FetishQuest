import Text from '../../classes/Text.js';
import audioKits from './audioKits.js';
import stdTag from '../stdTag.js';
import Asset from '../../classes/Asset.js';
import GameEvent from '../../classes/GameEvent.js';
import Condition from '../../classes/Condition.js';
const baseCond = ['actionHit', 'eventIsActionUsed'];
const anyOnHumCond = baseCond.concat('targetNotBeast');
const humOnHumCond = anyOnHumCond.concat('senderNotBeast');
const humOnAnyCond = baseCond.concat('senderNotBeast');

import C from './conditions.js';


const lib = [
	// Turn changed
	{ text : "%T's turn!",
		conditions : [
			{"type":Condition.Types.event,"data":{"event":GameEvent.Types.turnChanged}}
		],
		alwaysOutput:true,
	},
	// battle started
	{ text : "Battle Started!",
		conditions : [
			{"type":"event","data":{"event":"battleStarted"}}
		],
		audiokits : ["battleStart"]
	},
	// battle finished
	{ text : "The battle has finished...",
		conditions : [
			{"type":"event","data":{"event":"battleEnded"}}
		],
		audiokits : ["battleFinished"]
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
		conditions : ["actionResist"],
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

	// STDAttack
	{ text : "%S throws a punch at %T!",
		"conditions":humOnAnyCond.concat("action_stdAttack"),
		hitfx : ["punch"]
	},
	{ text : "%S slaps %T's %butt, jiggling %This %Trsize buttcheeks around!",
		"conditions": humOnHumCond.concat('action_stdAttack','targetButtLarge'),
		hitfx : ["slap"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %breasts!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["doubleSlap"]
	},
	{ text : "%S leaps on top of the helpless %Trace, straddling them and wiggling %Shis fingers menacingly above %T's breasts before swooping in, catching the %Trace's nipples and proceeding to tweak them between finger and thumb!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["stretch"]
	},
	{ text : "%S takes advantage of an opening in %T's defences, skillfully darting in and gently pinching the %Trace's nipples before quickly tugging %This teats back until they slip free, plucking the sensitive nubs!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{ conditions: ["targetUpperBodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["stretch"]
	},

	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a hold of %This nipples and tugs at them!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetKnockedDownBack","targetTaller","targetBreastsExposed"),
		hitfx : ["stretch"]
	},
	{ text : "%S pinches a hold of %T's nipples and pulls backwards!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetUpperBodyNotHard"),
		audiokits : ["pinchGeneric"],
		hitfx : ["stretch"]
	},
	{ text : "%S rams %Shis knee up at %T's %butt!",
		conditions : humOnHumCond.concat("action_stdAttack"),
		hitfx : ["punch"]
	},
	{ text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable"),
		hitfx : ["slap"]
	},
	{ text : "%S suddenly grabs %T from behind, pulling %Thim back a step and charging forward together towards a nearby table. %S pushes the %Trace's upper body down onto its surface, bending %Thim over the edge. A hand on %This back pins %T there as another firmly swats back and forth across %This %Trsize presented %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable"),
		hitfx : ["slap"]
	},
	
	{ text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes them!",
		conditions : humOnHumCond.concat(["action_stdAttack",]),
		hitfx : ["squeeze"]
	},
	{ text : "%S grabs hold of %T's %Trsize buttcheeks and spreads them apart as %She squeezes them hard!",
		conditions : humOnHumCond.concat(["action_stdAttack","targetButtExposed"]),
		hitfx : ["squeeze"]
	},


	{ text : "%S grabs a hold of %T's %Tbsize %leftright %breast and squeezes down firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["squeeze"]
	},
	{ text : "%S slaps a spread hand onto %T's %Tbsize %leftright %breast, taking hold of it and squeezing down firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["slapSqueeze"]
	},

	{ text : "%S pinches down on %T's %leftright nipple and twists it!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["pinch"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetLowerBodyHard"]),
		hitfx : ["punch"]
	},
	{ text : "%S lands a fearsome blow onto %T's %groin, but most of its force is absorbed by %This %TclothLower.",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetLowerBodyHard"]),
		hitfx : ["punch"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetUpperBodyHard"]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a mighty punch squarely towards the front and center of %T's %TclothUpper. It hits, but %T weathers the attack as it fails to break through.",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetUpperBodyHard"]),
		hitfx : ["punch"]
	},


	// Hogtied
	{ text : "%S slips behind the hogtied %Trace and spanks %This %Trsize exposed %butt a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdAttack","targetHogtied"),
		hitfx : ["slap"]
	},

	// dishonorable
	{ text : "%S shoves %T from behind, bending %Thim over a table and bites %This %Trsize %butt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable","senderDishonorable"),
		hitfx : ["biteGeneric"]
	},

	// tentacles
	{ text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack","senderHasTentacles","targetBreasts","targetUpperBodyNotHard"),
		hitfx : ['tentacleStretch'],
	},
	{ text : "%S loops %Shis tendrils around %T's nipples with amazing accuracy, latching onto them before tugging them outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack","senderHasTentacles","targetBreasts","targetUpperBodyNotHard"),
		hitfx : ['tentacleStretch'],
	},
	{ text : "%S slips a couple of tendrils around %T's exposed %breasts, firmly squeezing them!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetBreasts","targetBreastsExposed"]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S's tentacles shoot out towards %T's exposed %breasts, almost completely wrapping both of them within their coils. The tips of the %Srace's tendrils cruelly flicks at %This nipples as its spiralling grasp tightens firmly, squeezing %This %breasts!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetBreasts","ttBreastsExposed"]),
		hitfx : ['tentacleSqueeze'],
	},

	{ text : "%S slips a couple of tendrils around %T's exposed %breasts, firmly squeezing them!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetBreasts","targetBreastsExposed"]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S lashes its thin tendrils around %T's exposed nipples! Before %T can react, %S wiggles the tendrils at %Shis end, sending a wave across the tentacles. A moment later, the waves reach the %Trace's breasts, flicking the tendrils off painfully.",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderIsGroper","targetBreasts","targetBreastsExposed"]),
		hitfx : ['tentacleWhipSqueeze'],
	},
	{ text : "%S slips a couple of tendrils around %T's exposed nipples, and starts jiggling %This %Tbsize %breasts around!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetBreasts","targetBreastsExposed"]),
		hitfx : ['tentacleSqueeze'],
	},

	{ text : "%S lashes %T's %Trsize %butt with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles"]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles"]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S sends two tendrils slithering up %T's legs, the pair coming together where %This thighs meet. They coiling around each other before prying their way between %This folds, slipping part-way inside %This %vagina and stretching its entrance!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetVagina",
			{
				conditions : [
					"targetNoLowerBody",
					"targetGroinExposed"
				]
			}
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "senderHasTentacles", "ttWedgie", "targetWearsLowerBody"
		]),
		hitfx : ["tentacleStretch"],
		weight : Text.Weights.high,
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([ 
			"action_stdAttack", "senderHasTentacles", "targetUpperBodyHard", "targetBreasts"
		]),
		hitfx : ["tentacleWhip"],		
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerBodyHard"
		]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S flicks %T's %groin with a small tentacle, lashing the front of %This %TclothLower around!",
		armor_slot : Asset.Slots.lowerBody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerBodyNotHard","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerBodyNotHard","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ["tentacleSqueeze"],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %penis before constricting %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %penis and constricting it!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S smacks %T's %Tpsize exposed %penis with a tentacle!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", 
			"senderHasTentacles",
			{
				conditions : [
					"targetNoLowerBody",
					"targetGroinExposed"
				]
			},
			"targetPenis"
		]),
		hitfx : ['tentacleWhip']
	},

	// Cocktopus
	{ text : "%S lashes %Shis bulbed tentacle across %T's %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus",
		]),
		hitfx : ["tentacleWhip"],
	},
	// Latched
	{ text : "%S latches %Shis tentacles around %T's %Tbsize %breasts, constricting them hard!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["tentacleSqueeze"],
	},
	{ text : "%S latches %Shis tentacles around %T's nipples and starts tugging outwards!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's back and starts whipping %This %Trsize %butt with its bulbous tentacles!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S latches its tentacles around %T's neck and constricts!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["tentacleSqueeze"],
	},
	{ text : "%S latches onto %T's back and lashes %This %Tbsize %breasts a %few times from behind!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			"targetBreasts"
		]),
		armor_slot : "upperBody",
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S latches onto %T's legs and lashes %Shis bulbous tentacle across %This %groin a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		armor_slot : "lowerBody",
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S latches onto %T's %Trsize %butt and gives it a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["biteGeneric"],
	},
	{ text : "%S latches onto %T's %TBsize %leftright %breast and gives %This nipple a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperBodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["biteGeneric"],
	},

	// Crab
	{ text : "%S punches %T's %leftright leg with %Shis claw!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsTentacrab"),
		hitfx : ["punch"]
	},
	{ text : "%S punches %T's %Trsize %leftright buttcheek with %Shis claw!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsTentacrab"),
		hitfx : ["punch"]
	},
	{ text : "%S throws a claw punch at %T!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdAttack","senderIsTentacrab"),
		hitfx : ["punch"]
	},


	// Whips
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %butt!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace's %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This chest!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip"
		]),
		armor_slot : Asset.Slots.upperBody,
		hitfx : ["whip"]
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This %leftright %breast!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetBreasts"
		]),
		armor_slot : Asset.Slots.upperBody,
		hitfx : ["whip"]
	},
	{ text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %breasts!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["stretch"]
	},
	{ text : "%S takes advantage of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %butt!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetKnockedDownFront"
		]),
		hitfx : ["whipDouble"]
	},
	{ text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %butt!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdAttack","ttBentOver","senderHasWhip"),
		weight : Text.Weights.high,
		hitfx : ["whip"]
	},

	// stdArouse
	{ text : "%S tickles %T!",
		conditions : baseCond.concat([
			"action_stdArouse", "senderBeast"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S tickles %T!",
		conditions : baseCond.concat([
			"action_stdArouse", "targetBeast"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S grabs a hold of and rubs %T's %butt!",
		conditions : humOnHumCond.concat([
			"action_stdArouse",
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This %groin!",
		conditions : humOnHumCond.concat([
			"action_stdArouse"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %breasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetUpperBodyHard"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %breasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetKnockedDownFront","targetTaller"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %breasts before jiggling them around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{conditions :[
				"targetUpperBodyNotHard",
				"targetBreastsExposed"
			]}
		]),
		hitfx : ["squeeze"]
	},

	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbsize %leftright %breast and gives it a %few rapid licks!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetBreasts", "targetKnockedDownBack", "targetTaller", "targetBreastsExposed"
		]),
		hitfx : ["squeeze"]
	},

	{ text : "%S jumps onto the knocked down %Trace's back, squeezes a firm hold of %T's %Trsize buttcheeks and jiggles them around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetKnockedDownFront","targetTaller",
			{conditions:[
				"targetWearsThong",
				"targetNoLowerBody"
			]}
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S reaches down towards %T's bulge and teasingly squeezes it!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetWearsLowerBody","targetPenis","targetShorter"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S takes advantage of %T being bent over and fondles %This %groin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver"),
		weight : Text.Weights.high,
		hitfx : ["squeeze"]
	},
	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %penis inside the %Trace's %vagina and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S grabs a hold of the knocked down %Trace's legs, lifting them into the air before shoving %Shis %Spsize %penis inside %T's %vagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse","targetKnockedDownBack","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S grabs a hold of the knocked down %Trace's hips, lifting %This %Trsize %butt into the air before shoving %Shis %Spsize %penis inside %T's %vagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse","targetKnockedDownBack","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %penis inside the %Trace's %Trsize %butt and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","senderPenis","targetNoLowerBody","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S jumps onto the table and grabs a hold of %T's face, shoving %Shis %Spsize %penis inside and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOverTable","senderPenis"),
		weight : Text.Weights.max,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S slips %Shis hand between %T's legs and forces a finger up the %Trace's %groin, wiggling it inside %Thim!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetNoLowerBody", "targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This exposed clit!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetNoLowerBody", "targetVagina"
		]),
		hitfx : ["squishTiny"]
	},

	{ text : "%S slips between %T's legs and licks across the %Trace's %groin!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetTaller", "senderTongue"
		]),
		hitfx : ["squishTiny"]
	},

	{ text : "%S shoves %T from behind, bending %Thim over a table before slipping %Shis %Spsize %penis inside the %Trace, landing a %few thrusts!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse","roomTable","senderDishonorable","targetVagina","targetGroinExposed"),
		hitfx : ["slowThrusts"]
	},

	// Hogtied
	{ text : "%S slips behind the hogtied %Trace and spreads %This legs, shoving %Shis %Spsize %penis inside and thrusting a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetHogtied","targetVagina","targetGroinExposed","senderPenis","senderGroinExposed"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S crouches by the hogtied %Trace and grabs a hold of %This head, shoving %Shis %Spsize %penis inside and thrusting a %few times!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetHogtied","senderPenis","senderGroinExposed"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and rubs %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetHogtied"),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and forces a finger up inside %T's %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetHogtied","targetVagina","targetGroinExposed"),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand down between the hogtied %Trace's legs and forces a finger inside %T's %TclothLower and up inside %This %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetHogtied","targetVagina","targetLowerBodyNotHard"),
		hitfx : ["squishTiny"]
	},
	
	

	


	// stdArouse - Tentacles
	{ text : "%S slips a couple of tendrils up between %T's legs, rubbing across %This %groin!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles",
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S slips a tendril up between %T's buttcheeks, tickling between them!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "senderHasTentacles",
			{conditions: [
				"targetWearsThong",
				"targetButtExposed",
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["squishLong"],
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %vagina and thrusting a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","senderHasCocktacles","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %vagina, and the other into %This %Trsize %butt. Pumping rhythmically in and out of %T!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "senderHasTentacles","targetVagina","targetNoLowerBody"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %butt where it thrusts a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","senderHasCocktacles",
			{conditions:[
				"targetNoLowerBody",
				"ttButtExposed"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %vagina!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetGroinExposed","targetVagina","senderHasCocktacles"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %vagina, rapidly thrusting inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetWearsThong","targetVagina","senderHasCocktacles"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %butt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetKnockedDownFront","targetButtExposed","senderHasCocktacles",
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S takes advantage of %T being knocked down and surprises %Thim with a slimy cock-tipped tentacle slipping inside %This mouth, squirming around and tickling %This cheeks!",

		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetKnockedDownFront","senderHasCocktacles",
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S surprises %T with a thick tentacle shoved into %This mouth! The tentacle thrusts a couple of times, leaving a gooey residue behind.",

		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles"
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %butt and lands some rapid thrusts, making %This %butt somewhat sticky!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerBody"
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %vagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerBody","targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %vagina and lands some rapid thrusts inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsThong","targetVagina","targetLowerBodyNotHard"
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerBody","targetWearsThong"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S latches a thick tentacle with suction cups onto %T's %groin and performs a few rapid tugs and prods at %This %TclothLower!",
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsLowerBody","targetWearsThong","ttGroinNotExposed"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
	},
	{ text : "%S latches two thick tentacles with suction cups onto %T's %breasts and performs a few rapid tugs and prods at %This %TclothUpper!",
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsUpperBody","targetUpperBodyNotHard","targetBreasts"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
	},
	{ text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerBody","ttPussyWedgie"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %vagina and leaving a little slimy residue behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","ttPussyWedgie","targetWearsLowerBody"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling %This %groin!",
		conditions : anyOnHumCond.concat(["action_stdArouse","senderHasTentacles"]),
		hitfx : ["tentacleRub"],
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

	},


	// Restrained by and legs spread by tentacles
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %vagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %butt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This nipples!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetBreasts","targetUpperBodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %penis!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetLowerBodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and licks across %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderTongue"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis strapon into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis %penis into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis"),
		hitfx : ['slowThrusts'],
		weight : Text.Weights.high,
	},
	{ text : "%S slips in between %T's legs and forces a finger inside the %Trace's %vagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "%S takes advantage of %T being restrained and starts rapidly licking %This %groin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetGroinExposed","senderTongue"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %penis inside the %Trace's %vagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %penis inside the %Trace's %butt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	


	// Crab
	{ text : "%S slips between %T's legs and reaches up, grinding %Shis claw against the %Trace's %groin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %groin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %Trsize %butt!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling between %This buttcheeks!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and reaches up, prodding %Shis claw part-way into the %Trace's %vagina!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab", "targetVagina", "targetGroinExposed"),
		hitfx : ["squishTiny"]
	},


	// Cocktopus
	{ text : "%S tickles %T's %groin with %Shis ribbed bulb tentacle!",
		conditions : anyOnHumCond.concat(["action_stdArouse","senderIsCocktopus",]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S slips %Shis ribbed bulb tentacle between %T's buttcheeks, stroking it up and down!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus",
			{conditions:[
				'targetButtExposed',
				'targetWearsThong',
			]}
		]),
		hitfx : ["squishTiny"],
	},
	// Cocktopus while latched
	{ text : "%S slips %Shis ribbed bulb tentacle inside %T's %TclothLower from behind, stroking down between the %Trace's buttcheeks and giving %This %vagina a %few tickles!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody', "targetVagina"
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S slips partially inside %T's %TclothLower, forces %Shis ribbed bulb tentacle up inside %This %vagina and wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody', "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips partially inside %T's %TclothLower, forces %Shis ribbed bulb tentacle up inside %This %Trsize %butt and wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody'
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S wraps a tentacle around %T's %Tbsize %leftright %breast and tickles %This nipple with a ribbed tentacle.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerBody', 'targetBreasts'
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S lashes tendrils around %T's nipples, pulling %This %Tbsize %breasts together and thrusting %Shis head-tentacle up and down between them a %few times.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetBreasts', "targetBreastsExposed"
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S pushes one of its ribbed bulbous tentacles into %T's mouth, rubbing it into %This %leftright cheek.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S latches onto %T's %butt and forces one bulbous tentacle inside the %Trace's %Trsize %butt, and the other inside %This %vagina thrusting a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S latches around %T's legs forces both %Shis ribbed bulbous tentacles up into the %Trace's %vagina, swirling them around inside of the %Trace!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S squeezes down firmly on %T's %Trsize buttcheeks!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["tentacleSqueeze"],
	},


	// WHIPS
	{ text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %groin!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasWhip","targetVagina","targetNotKnockedDown"
		]),
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis %Sgear between %T's buttcheeks, grinding it back and forth!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasWhip","targetVagina",
			{conditions : 
				["targetWearsThong","targetButtExposed"]
			}
		]),
		hitfx : ["stretch"]
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
		])
	},
	{ text : "%S assaults %T with suction cup tipped tentacles, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetBreasts","targetNoUpperBody"
		]),
		hitfx : ["tentacleSuck"],

	},
	{ text : "%S slips a hollow tentacle inside %T's %TclothLower, enveloping %This %penis and coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetWearsLowerBody"
		]),
		hitfx : ["tentacleSuck"],

	},
	{ text : "%S envelops %T's %penis with a hollow tentacle, coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetNoLowerBody"
		]),
		hitfx : ["tentacleSuck"],
	},


	// tentacle_fiend_legWrap
	{ text : "%S hoops tentacles around %T's ankles, pulling %Thim to the ground and spreading %This legs!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_legWrap",
		])
	},


	// tentacle_fiend_injectacle
	{ text : "%S's thick tentacle slips into %T's %Tbsize %butt and lands some rapid thrusts before flooding %T's %butt with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetButtExposed",
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S's thick tentacle slips into %T's %vagina, landing some rapid thrusts before flooding it with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina"
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
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
	},


	// tentacle_fiend_tentatug
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
	{ text : "%S latches tentacles onto the back %TclothUpper, stretching backwards and squishing the %Trace's %Tbsize %breasts.",
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
		conditions : baseCond.concat("action_tentacle_ride")
	},


	// action_groper_leg_spread
	{ text : "%S wraps its tendrils around %T's legs, spreading them wide apart!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat("action_groper_leg_spread")
	},

	// action_groper_groin_lash - Renamed to Groper Lash
	{ text : "%S flicks a tendril right across %T's exposed %groin!",
		hitfx : ["whip"],
		conditions : baseCond.concat("action_groper_groin_lash")
	},
	{ text : "%S flicks a tendril right across %T's exposed %groin, whipping %This %penis around!",
		hitfx : ["whip"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetPenis", "targetLowerBodyNotHard")
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lashes painfully twice across %This %Trsize %butt!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard")
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lands a rapid lash across %This %Trsize left buttcheek, briefly followed by another painful snap across %This right, jiggling %This %butt around!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard", "targetButtLarge")
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's restrained legs, the tendril lashes painfully twice across %T's back!",
		hitfx : ["tentacleWhipDouble"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetUpperBodyNotHard")
	},
	{ text : "%S sneaks a tendril behind %T. Taking advantage of the %Trace's spread legs, the tendril lashes painfully up across the %Trace's %groin, briefly constricting %This %vagina before retracting!",
		hitfx : ["tentacleWhipSqueeze"],
		conditions : baseCond.concat("action_groper_groin_lash", "targetLowerBodyNotHard")
	},
	
	// action_groper_groin_grope
	{ text : "%S flicks a tendril up between %T's legs, squeezing %This %groin!",
		hitfx : ["whipSqueeze"],
		conditions : baseCond.concat("action_groper_groin_grope")
	},
	{ text : "%S flicks a tendril up between %T's legs, tickling %This %Tgenitals!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetGroinExposed")
	},
	{ text : "%S flicks a tendril up between %T's legs, slipping up into %This %Trsize %butt and tickling %Thim on the inside!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetButtExposed")
	},
	{ text : "%S flicks a tendril up between %T's legs, slipping up into %This %Trsize %butt and tickling %Thim on the inside!",
		hitfx : ["tickle"],
		conditions : baseCond.concat("action_groper_groin_grope", "targetVagina", "targetGroinExposed")
	},



	// action_groper_sap_squeeze
	{ text : "%S wraps a sap-coated tendril around %T's torso constricting %This %Tbsize %breasts!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetBreasts")
	},
	{ text : "%S wraps a sap-coated tendril around %T's %Trsize buttcheeks and firmly constricts, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze")
	},
	{ text : "%S wraps a sap-coated tendril around %T's %Trsize %groin and firmly constricts, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetPenis")
	},
	{ text : "%S slips a sap-coated tendril up between %T's legs and wrapping itself around %This waist. The tendril constricts %thoroughly, coating the %Trace's pelvic area with a sticky sap!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina")
	},
	{ text : "%S slips a sap-coated tendril up between %T's legs, wrapping itself around %This waist. The tendril constricts, painfully grinding between the %Traces's buttcheeks and partially into %This %vagina, coating the area with a sticky sap!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina", "targetNoLowerBody")
	},
	{ text : "%S hoops a sap-coated tendril around %T's %Tbsize %breasts, constricting firmly and leaving a sticky residue on them!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetBreasts", "targetUpperBodyNotHard")
	},
	{ text : "%S wraps a sap-coated tendril around %T's head, constricting into %This mouth and briefly gagging the %Trace before letting go and leaving a sweet sticky sap behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze")
	},
	{ text : "%S slips its sap-coated root of a tentacle down into the back of %T's %TclothLower, slipping the bumpy appendage down between %This %Trsize buttcheeks and tickling up across the %Trace's %vagina before firmly constricting both, leaving a sticky residue behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : anyOnHumCond.concat("action_groper_sap_squeeze", "targetVagina")
	},
	
	{ text : "%S wraps a sap-coated tendril around %T and constricts, leaving a sticky sap behind!",
		hitfx : ["tentacleSqueeze"],
		conditions : baseCond.concat("action_groper_sap_squeeze")
	},

	// action_groper_sap_inject
	{ text : "%S shoves its thick sticky tendril into %T's exposed %vagina, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetGroinExposed")
	},
	{ text : "%S shoves its thick sticky tendril into %T's %TclothLower and up %This %vagina, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetWearsLowerBody")
	},
	{ text : "%S shoves its thick sticky tendril into %T's exposed %butt, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetGroinExposed")
	},
	{ text : "%S shoves its thick sticky tendril into %T's %TclothLower and up %This %butt, landing a %few rough thrusts before flooding it with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetWearsLowerBody")
	},
	{ text : "%S shoves its thick sticky tendril into %T's mouth, flailing about wildly as the tendril coats it with a sweet sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject")
	},
	{ text : "%S slips its thick tendril down the back of %T's %TclothLower, grinding the bumpy root of a tentacle between %This buttcheeks and across the %Trace's %vagina a %few times before finally probing inside and %this %vagina with a sticky sap!",
		hitfx : ["slowThrustsTentacle"],
		conditions : anyOnHumCond.concat("action_groper_sap_inject", "targetVagina", "targetLowerBodyHard")
	},
	
	
	



	// action_shocktacle_zap
	{ text : "%S wraps charged tentacles around %T's %Tbsize %breasts, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyNotHard")
	},
	{ text : "%S wraps charged tentacles around %T's nipples, constricting and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyNotHard")
	},
	{ text : "%S wraps a charged tentacle around %T's %groin, squeezing down and sending an electric shock through %This %penis!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetPenis", {conditions:[
			"targetGroinExposed", "targetLowerBodyStretchy"
		]}),
		weight : Text.Weights.high
	},
	{ text : "%S wraps charged tentacles around %T's %Trsize buttcheeks, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerBodyNotHard")
	},
	{ text : "%S whaps %T's %Trsize %butt with an electrified tentacle, shocking the %Trace!",
		hitfx : ["tentacleWhipZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap")
	},
	{ text : "%S latches electrified tendrils around %T's %TclothUpper, sending pulses into the metal and shocking %This %Tbsize %breasts!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperBodyMetal")
	},
	{ text : "%S latches electrified tendrils onto %T's %TclothLower, sending pulses into the metal and shocking %This %Tgenitals!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerBodyMetal")
	},
	{ text : "%S electrifies the tentacle currently lifting %T off the ground, sending electric pulses into %This %groin!",
		hitfx : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetRidingOnMyTentacle")
	},
	{ text : "%S prods %T's rear with an electrified tentacle slipping it inside %Thim and shocking %This %butt!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetButtExposed")
	},
	{ text : "%S prods %T's %groin with an electrified tentacle slipping it inside %Thim and shocking %This %vagina!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetGroinExposed", "targetVagina")
	},
	



	// imp_specialDelivery
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %penis into %T's mouth, humping at an overwhelming speed until %She shoots a large squirt of demonic jizz down %T's throat.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %penis into %T's mouth, humping at an overwhelming speed! A few moments later, the %Srace pulls out, shooting a long streak of demonic jizz across %T's face.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery",
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horn and shoves %Shis %Spsize %penis in %T's mouth. The small imp starts thrashing the %penis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorn"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horns and shoves %Shis %Spsize %penis in %T's mouth. The small imp starts thrashing the %penis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorns"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %butt and shoves %Shis %Spsize %penis into %This %vagina! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %butt and shoves %Shis %Spsize %penis inside! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T, latching %Shis legs around the %Trace's chest and grabbing a firm hold of %This nipples, squishing %Shis %Spsize %penis between %T's %Tbsize %breasts. The %Srace begins rapidly humping, eventually reaching climax, shooting %Shis load into %T's face!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto the knocked down %Trace slipping %Shis %Spsize %penis between %T's %Tbsize %breasts, pushes them together and starts rapidly thrusting. A short while later %S pulls back, shooting a long streak of demonic cum across %T's %breasts!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S surprises the knocked down %Trace by squatting near %This face and shoving %Shis %Spsize %penis in %This mouth. The %Srace pumps a few times before forcing a large squirt of demon cum inside %T's mouth!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S surprises the knocked down %Trace by lifting %This hips and shoving %Shis %Spsize %penis into %This %vagina. The %Srace starts humping rapidly, eventually reaching climax and flooding %T with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S squats by %T's %Trsize %butt and slips %Shis %Spsize %penis inside. The %Srace starts rapidly humping, eventually reaching climax and flooding %T's %butt with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownFront","targetButtExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %penis into %This %vagina. %S starts rapidly humping, eventually reaching climax and flooding %T's %vagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetGroinExposed","targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %penis into %This %butt. %S starts rapidly humping, eventually reaching climax and flooding %T's %butt with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},


	// imp_blowFromBelow
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking across %This %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips between %T's legs and throws a slap upwards, smacking across %This %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking the %Trace's %Trsize %leftright buttcheek!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips between %T's legs and throws a punch at each of the %Trace's %Trsize buttcheeks!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punchDouble"]
	},
	{ text : "%S slips between %T's legs and throws a couple of slaps across the front of %T's %TclothLower around, smacking %This %penis around!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetPenis","targetLowerBodyStretchy"
		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips between %T's legs and forces %Shis fist up into the %Trace's %vagina, thrusting a few times!",
		conditions : humOnHumCond.concat(["action_imp_blowFromBelow","targetVagina","targetGroinExposed"]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and forces %Shis fist up into both of their %vaginas, thrusting a few times!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and rams %Shis fist into both of their groins!",
		numTargets:2,
		armor_slot:"lowerBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and %T2, giving a hard smack across both of their %butts!",
		numTargets:2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",

		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips underneath %T and throws a thorough slap across %This %butt!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast, jiggling it around!",
		armor_slot:"upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyHard"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a few rapid slaps across %This %breasts!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["doubleSlap"]
	},
	{ text : "%S grabs a hold of and spreads %T's legs while %The's still bent over the table, followed briefly by the %Srace ramming %Shis knee up into %T's %groin!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_imp_blowFromBelow","ttBentOverTable"),
		weight : Text.Weights.high,
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %breast and %T2's %T2bsize %breast, jiggling them both around!",
		"numTargets":2,
		"armor_slot":"upperBody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["punchDouble"]
	},
	

	// action_imp_claws
	{ text : "%S wraps %Shis claws around %T's %TclothUpper, ripping the piece straight off!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetUpperBodyStripped"),
		hitfx : ["claws"]
	},
	{ text : "%S wraps %Shis claws around %T's %TclothLower, ripping the piece straight off!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyStripped"),
		hitfx : ["claws"]
	},
	{ text : "%S slips %Shis claws around %T's butt-string yanks down hard, pulling the %Trace's %TclothLower off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong", "targetLowerBodyStripped", "targetLowerBodyCanPullDown"
		),
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis claws around the shoulder straps of %T's %TclothLower and yanks down, letting it fall off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsSlingBikini", "targetArmorStripped"
		),
		hitfx : ["stretch"]
	},
	{ text : "%S slinks in between %T's legs and wraps %Shis claws around the front of the %Trace's %TclothLower! With a quick tug, the %Srace yanks the piece straight off!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws", "targetMuchTaller", "targetLowerBodyStripped", "targetLowerBodyCanPullDown"
		),
		hitfx : ["stretch"]
	},
	
	{ text : "%S slips %Shis claws under %T's waistband from behind, tugging upwards %firmly!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis claws around %T's butt-string grabbing a firm hold of it and giving it a hard yank!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis claws under %T's waistband from the front, giving it a hard tug upwards!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttPussyWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs a firm hold of %T's %TclothUpper from behind, pulling it backwards and causing the piece to constrict %This %Tbsize %breasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetUpperBodyNotHard", "targetBreasts", "targetWearsUpperBody", "targetUpperBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttBreastsWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S wraps %Shis claws around the front strings of %T's %TclothUpper, giving it a hard yank out and letting it set back on the side, exposing the %Trace's %Tbsize %breasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetBreasts", "targetWearsSlingBikini", "targetUpperBodyDamagedNotStripped"
		),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs the middle of %T's %TclothUpper with %Shis claws and gives it a hard yank down, exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetBreasts", "targetUpperBodyCanPullDown", "targetUpperBodyDamagedNotStripped"),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grasps %Shis claws around the bottom of %T's %TclothUpper and firmly yanks up, exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetBreasts", "targetUpperBodyCanPullUp", "targetUpperBodyDamagedNotStripped"),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs around the front strings of %T's %TclothLower near %This %groin, giving it a hard yank down, exposing the %Trace's %groin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetWearsSlingBikini", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S wraps %Shis claws around the front of %T's %TclothLower and gives it a hard yank down, exposing the %Trace's %groin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs at the back of %T's %TclothLower with %Shis claws and gives it a hard yank down, exposing the %Trace's %Trsize %butt!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerBodyWaistband", "targetLowerBodyDamagedNotStripped"),
		turnTags : [stdTag.ttButtExposed],
		hitfx : ["stretch"]
	},





	// imp_ankleBite
	{ text : "%S jumps at %T's legs and starts chewing on %This ankle!",
		conditions : anyOnHumCond.concat([
			"action_imp_ankleBite",
		]),
		hitfx : ["biteGeneric"]
	},


	// imp_demonicPinch
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetNotBeast"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards in %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetWearsLowerBody","targetPenis","targetNotCircumcised"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards and jiggling %This %Tpsize %penis around!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetGroinExposed","targetPenis","targetNotCircumcised"
		]),
		weight : Text.Weights.high,
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This clit!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetVagina"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This %leftright nipple!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetBreasts"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This nipples and starts jiggling %This %Tbsize %breasts around in %This %TclothUpper!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetBreasts","targetWearsUpperBody"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, making an invisible force pinch down on the bottom of %T's %leftright breast!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing invisible fingers to pinch %T's %vagina!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetVagina"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's %leftright nipple, twisting it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, twisting both!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, stretching them both outwards!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's %leftright ear, tugging at it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetEars"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's nose!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's taint!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetPenis"),
		hitfx : ["pinch"]
	},
	

	// action_imp_groperopeHogtie
	{ text : "%S lashes %Shis enchanted groperope around %T. The rope immediately wraps around and restrains the %Trace, leaving %Thim on the ground as it begins to grind against %This sensitive areas!",
		conditions : anyOnHumCond.concat("action_imp_groperopeHogtie"),
		hitfx : ["stretch"]
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
		hitfx : ["sludgeBoltBlack"]
	},
	{ text : "%S squirts a large wad of oily ink across %T's %breasts!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink", "targetBreasts"),
		hitfx : ["sludgeBoltBlack"]
	},
	{ text : "%S squirts a large wad of oily ink across %T's %groin!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"]
	},
	{ text : "%S squirts a large wad of oily ink across %T's %butt!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"]
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
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S shoves its big head-tentacle inside %T's %vagina and stirs it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S launches multiple rapid thrusts into %T's %vagina with its large head-tentacle!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["slowThrustsTentacle"]
	},
	{ text : "%S shoves its big headtacle deep inside %T's %butt!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S shoves its big head-tentacle deep inside %T's %butt and wiggles it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S launches multiple rapid thrusts into %T's %Trsize %butt with its large head-tentacle!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["slowThrustsTentacle"]
	},
	{ text : "%S shoves its big headtacle deep down %T's throat!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingMouth"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S starts thrusting %Shis big head-tentacle into %T's mouth!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingMouth"],
		hitfx : ["tentacleSuck"]
	},



	// /\ Finish
	{ text : "%S latches tight onto %T's %Trsize %butt and forces %Shis big head-tentacle up inside the %Trace's %vagina, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingGroin"],
		hitfx : ["sludgeBlack"]
	},
	{ text : "%S latches tight onto %T's hips and forces %Shis big head-tentacle up inside the %Trace's %Trsize %butt, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingButt"],
		hitfx : ["sludgeBlack"]
	},
	{ text : "%S latches tight around the back of %T's head and shoves %Shis big head-tentacle inside %T's throat, flooding it with enough black oily liquid that %The is forced to swallow some!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingMouth"],
		hitfx : ["sludgeBlack"]
	},

	// crab_claw_pinch
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %Trsize %butt with %Shis claws!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch']
	},
	{ text : "%S pinches %T's %leftright foot!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T's face, pinching %This nose!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch']
	},
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %groin with a claw!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This nipples, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetBreasts", "targetUpperBodyNotHard"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Tbsize %breasts, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetBreasts", "targetUpperBodyNotHard"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Trsize %butt, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetLowerBodyNotHard"]),
		hitfx : ['pinch']
	},

	// crab_claw_tug
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothLower!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothUpper!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsUpperBody", "targetUpperBodyDamagedNotStripped"]),
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinching a hold of the bottom of %This %TclothUpper, making the piece slide down and exposing the %Trace's %Tbsize %breasts!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsUpperBody", "targetBreasts", "targetUpperBodyCanPullDown", "targetUpperBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinches a hold of %This %TclothLower and tugs down, exposing %This %Tgenitals!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsThong", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinches a hold of the back of %This %TclothLower and tugs down, exposing %This %butt!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsThong", "targetWearsLowerBody", "targetLowerBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttButtExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T and pinches a hold of the strings of %This %TclothUpper, tugging down and exposing the %Trace's %breasts!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerBodyNotHard", "targetWearsSlingBikini", "targetBreasts", "targetUpperBodyDamagedNotStripped"]),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This outfit!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug"]),
		hitfx : ['stretch']
	},

	// breast_squeeze
	{ text : "%S plants %Shis hands over %T's %Tbsize %breasts, giving them a firm squeeze momentarily, before planting his face between them and shaking it about!",
		conditions : anyOnHumCond.concat([{type:Condition.Types.actionLabel, data:{label:'breast_squeeze'}}]),
		hitfx : ['squeeze']
	},
	

	// whip_legLash
	{ text : "%S lashes %Shis whip across %T's legs!",
		conditions : baseCond.concat([
			"action_whip_legLash"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S lashes %Shis whip across %T's %leftright thigh!",
		conditions : anyOnHumCond.concat([
			"eventIsActionUsed","action_whip_legLash",
		]),
		hitfx : ["whip"]
	},


	// whip_powerLash
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerBodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %breasts, whapping them around!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %leftright %breast, whapping it around!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking multiple times across %This %breasts!",
		armor_slot : Asset.Slots.upperBody,
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts"
		]),
		hitfx : ["whipDouble"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T's %groin, smacking %This bulge around!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerBodyStretchy","targetPenis"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T's %groin, smacking %This %penis around!",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetGroinExposed","targetPenis"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S surprises %T bent over by lashing %Shis %Sgear from below up across the %Trace's %groin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat([
			"action_whip_powerLash","targetVagina","targetWearsLowerBody","ttBentOver"
		]),
		weight : Text.Weights.high,
		hitfx : ["whip"]
	},


	// mq00_ward_boss
	{ text : "%S casts a ward on %T.",
		 conditions : baseCond.concat("action_mq00_ward_boss"),
		 hitfx : ['bolster']
	},



	// Skeleton hand
	{ text : "%S slips %Shis bony hand into %T's %TclothUpper and detaches it! The hand slinks down onto %This %Tbsize %leftright %breast and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetBreasts", {type:Condition.Types.tag, data:{tags:'skeletal_hand_ub'}}),
		hitfx : ["squeeze"]
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand grabs a firm hold of the %Trace's %Trsize %butt and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"]
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand grabs a firm hold of the %Trace's %Trsize %penis and starts fondling it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetPenis", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"]
	},
	{ text : "%S slips %Shis bony hand into %T's %TclothLower and detaches it! The hand immediately finds %This %vagina and starts stroking it!",
		conditions : anyOnHumCond.concat("action_skeleton_looseHand", "targetVagina", {type:Condition.Types.tag, data:{tags:'skeletal_hand_lb'}}),
		hitfx : ["squeeze"]
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















	// GENERIC ACTIONS

	// lowBlow
	{ text : "%S throws a punch at %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a punch at %T's %Tbsize %leftright %breast, jiggling it around in %This %TclothUpper!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperBodyStretchy"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a punch at %T's %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetNotBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S grabs a hold of %T's nipples through %This %TclothUpper, giving them both a painful twist while tugging them out!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperBodyNotHard","targetWearsUpperBody"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S grabs a hold of %T's %groin, painfully squeezing between %This legs!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetLowerBodyNotHard","targetWearsLowerBody",
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S catches %T unaware, throwing a hard punch at its weak spot!",
		conditions : baseCond.concat([
			"action_lowBlow","targetBeast"
		]),
		hitfx : ["punch"]
	},
	// ^skeleton
	{ text : "%S throws a punch with its bony hand, hitting %T's %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_lowBlow","targetBreasts","senderIsSkeleton"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a punch with its bony hand, hitting %T right in %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_lowBlow","targetBreasts","senderIsSkeleton"
		]),
		hitfx : ["punch"]
	},
	






	// PLAYER CLASS ACTIONS


	// WARRIOR
	// warrior_viceGrip
	{ text : "%S grabs a firm hold of %T's %groin and squeezes down hard!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S grabs at %T!",
		conditions : baseCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"]

	},
	{ text : "%S grabs a firm hold of %T's %leftright %breast and squeezes down hard!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetBreasts"
		]),
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of %T's %penis and firmly squeezes down on it!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetPenis",
			{conditions:[
				"targetGroinExposed","targetNoLowerBody"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of %T's %butt and squeezes down firmly!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of %T and %T2's groins and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T and %T2's butts and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip",
		]),
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of one of %T and %T2's %breasts each and squeezes down hard!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetBreasts"
		]),
		hitfx : ["squeeze"]		
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
	},
	{ text : "%S counters %T with a rapid jab to %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetBreasts"
		]),
		hitfx : ["punch"],
	},
	{ text : "%S counters %T with a rapid jab to the %groin!",
		armor_slot : "lowerBody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetNotBeast"
		]),
		hitfx : ["punch"],
	},
	{ text : "%S counters %T with a rapid jab at %This %Trsize %leftright buttcheek!",
		conditions : [
			"action_warrior_revenge","targetNotBeast"
		],
		hitfx : ["punch"],
	},
	{ text : "%S counters %T with a rapid jab to the stomach!",
		conditions : [
			"action_warrior_revenge","targetNotBeast"
		],
		hitfx : ["punch"],
	},







	// ROGUE
	// action_rogue_exploit
	{ text : "%S exploits an opening in %T's defenses, throwing a punch at %Thim!",
		conditions : baseCond.concat([
			"action_rogue_exploit","targetWearsUpperBody","targetWearsLowerBody"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S exploits an opening in %T's defenses, throwing a powerful punch at %Thim!",
		conditions : baseCond.concat([
			"action_rogue_exploit","targetBeast"
		]),
		hitfx : ["punch"]
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


	// action_rogue_corruptingPoison
	{ text : "%S poisons %T, causing a warm feeling to course throughout %This body!",
		conditions : baseCond.concat([
			"action_rogue_corruptingPoison",
		]),
		hitfx : ["poisonPink"]
	},


	// action_rogue_dirtyTricks
	{ text : "%S distracts %T, allowing %Shim to attack from behind!",
		conditions : baseCond.concat([
			"action_rogue_dirtyTricks","targetBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S distracts %T and sneaks behind %Thim, throwing a powerful slap across %T's %Trsize %butt!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetNotBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and a finger down %This buttcrack, tickling at %This rear!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerBody"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and grabs a hold of %This %Tpsize %penis, rubbing the glans with %Shis index finger!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerBody","targetPenis"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and rubs %This clit!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerBody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and wiggles %Shis long finger up inside %T's %vagina!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerBody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping both hands into %T's %TclothUpper and massages %This %Tnipples!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsUpperBody","targetBreasts"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S shoves %T from behind. As %T stumbles forward, %S slips %Shis hand between %T's legs and slides %Shis fingers across %This %groin and %butt!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetVagina"
		]),
		hitfx : ["squeeze"]
	},




	// CLERIC

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




	// TENTACLEMANCER

	// action_tentaclemancer_tentacleWhip
	{ text : "%S summons a tentacle, commanding it to lash at %T!",
		conditions : baseCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBeast"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a tentacle behind %T whacking across %This %Trsize %butt!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, slapping up across %This %groin!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, giving %This %Tpsize %penis a couple of lashes!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetNoLowerBody"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle behind %T, lashing across %This %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, lashing across %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperBodyHard"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, giving a jiggling lash across %This %Tbsize %leftright %breast!",
		armor_slot : "upperBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperBodyNotHard"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, smacking %This %Tpsize %penis around!",
		armor_slot : "lowerBody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetLowerBodyNotHard"
		]),
		hitfx : ["tentacleWhip"]
	},



	// action_tentaclemancer_corruptingOoze
	{ text : "%S flings a purple bolt of sludge at %T, coating %This body!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze","targetNoLowerBody","targetNoUpperBody"
		]),
		hitfx : ["sludgeBoltPurple"] // 
	},
	{ text : "%S flings a purple bolt of sludge at %T, slipping into %This outfit!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze",
			{conditions:[
				"targetWearsLowerBody","targetWearsUpperBody"
			]}
		]),
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
		hitfx : ["sludgePurple"]
	},


	// action_tentaclemancer_siphonCorruption
	{ text : "The living ooze wiggles around %T's body, allowing %S to absorb its energy!",
		conditions : baseCond.concat([
			"action_tentaclemancer_siphonCorruption","targetBeast"
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T protrudes into %This %butt, causing a warm sensation as it wiggles and bubbles inside! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption",
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T protrudes into %This %vagina, causing a warm sensation as it wriggles and bubbles inside %Thim! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetVagina"
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T wraps around %This %penis, causing a warm sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetPenis"
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T wraps around %This nipples, causing a tingling sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetBreasts"
		]),
		hitfx : ['siphonCorruption'],
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
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and throws a rapid jab at %T's %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		audiokits : ["monkKick"],
		hitfx : ["punch"],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and swipes %Shis palm right across %T's %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and smacks %Shis palm right across %T's %Trsize %butt!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, forcing %Shis hand between %T's legs, rapidly rubbing %This %vagina!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina"
		],
		hitfx : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, grabbing a hold of and squeezing %This package!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetPenis","targetLowerBodyNotHard"
		],
		hitfx : ["squeeze"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and thrusts a few fingers inside %T's %vagina, briefly wiggling them around!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina","targetNoLowerBody"
		],
		hitfx : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S ducks under and lashes %T's exposed %groin with a tentacle!",
		"armor_slot":"lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles"
		],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %butt!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %groin!",
		armor_slot : "lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"]
	},

	{ text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's exposed %vagina!",
		"armor_slot":"lowerBody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetNoLowerBody","targetVagina"
		],
		hitfx : ["tentacleRub"]
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
		hitfx : ["healingPunch"]
	},


	// ELEMENTALIST

	// action_elementalist_iceBlast
	{ text : "%S sends a chilling blast across %T!",
		conditions : baseCond.concat("action_elementalist_iceBlast"),
		hitfx : ["ice_blast"]
	},
	{ text : "%S sends a chilling blast across %T's %breasts, hardening %This nipples!",
		conditions : baseCond.concat("action_elementalist_iceBlast","targetBreasts"),
		hitfx : ["ice_blast"]
	},

	// action_elementalist_healingSurge
	{ text : "%S summons a splash of healing water that flows across %T's body!",
		conditions : baseCond.concat([
			"action_elementalist_healingSurge",
		]),
		hitfx : ["healingSurge"]
	},

	// action_elementalist_waterSpout
	{ text : "%S summons a water spout beneath %T, coating %Thim in cold water!",
		conditions : baseCond.concat(["action_elementalist_waterSpout"]),
		hitfx : ["waterSpout"]
	},
	{ text : "%S summons a cold water spout beneath %T, splashing up against %This %groin!",
		conditions : anyOnHumCond.concat(["action_elementalist_waterSpout",]),
		hitfx : ["waterSpout"]
	},







	// PROPS
	// Groperope
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Trsize %butt, constricting %This buttcheeks!",
		conditions : anyOnHumCond.concat("action_gropeRope"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's body, constricting firmly!",
		conditions : baseCond.concat("action_gropeRope", "targetBeast"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Trsize %penis, %thoroughly constricting it!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetPenis", "targetGroinExposed"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %groin, %thoroughly constricting it!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetPenis", "targetWearsLowerBody", "targetLowerBodyNotHard"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's %Tbsize %breasts, %thoroughly constricting them!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself around the %Trace's torso before constricting, chafing into %This %breasts!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetBreasts", "targetUpperBodyNotHard"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope wraps itself down %This %groin and up across %This %butt, firmly constricting!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetLowerBodyNotHard"),
		hitfx : ["whipSqueeze"]
	},
	{ text : "%S lashes %Shis groperope at %T. The rope slips across %This %groin and up across %This back before constricting, slipping between %This buttcheeks and chafing into %This %vagina!",
		conditions : anyOnHumCond.concat("action_gropeRope", "targetGroinExposed", "targetVagina"),
		hitfx : ["whipSqueeze"]
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

	
];

export default lib;