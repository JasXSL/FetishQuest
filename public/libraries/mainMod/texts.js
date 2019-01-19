import Text from '../../classes/Text.js';
import conditions from './conditions.js';
import audioKits from './audioKits.js';
import stdTag from '../stdTag.js';
const baseCond = ['actionHit', 'eventIsActionUsed'];
const anyOnHumCond = baseCond.concat('targetNotBeast');
const humOnHumCond = anyOnHumCond.concat('senderNotBeast');
const humOnAnyCond = baseCond.concat('senderNotBeast');
const C = conditions;

const lib = [
	// Turn changed
	{ text : "%T's turn!",
		conditions : [
			{"type":"event","data":{"event":"turnChanged"}}
		],
		"alwaysAuto":true,
		"alwaysOutput":true,
		audiokits : ["turnChanged"]
	},
	// battle started
	{ text : "Battle Started!",
		conditions : [
			{"type":"event","data":{"event":"battleStarted"}}
		],
		"alwaysAuto":true,
		audiokits : ["battleStart"]
	},
	// battle finished
	{ text : "The battle has finished...",
		conditions : [
			{"type":"event","data":{"event":"battleEnded"}}
		],
		"alwaysAuto":true,
		audiokits : ["battleFinished"]
	},
	// player defeated
	{ text : "%T was defeated!",
		"alwaysAuto":true,
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
	{ text : "%S resisted the stun portion of the attack!",
		conditions : ["eventIsDiminishingResist","wrapperIsStun"],
		audiokits : ["spellFail"]
	},

	// STDAttack
	{ text : "%S throws a punch at %T!",
		"conditions":humOnAnyCond.concat("action_stdAttack"),
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slaps %T's %Tbutt, jiggling %This %Trsize buttcheeks around!",
		"conditions": humOnHumCond.concat('action_stdAttack','targetButtLarge'),
		audiokits : ["slapGeneric"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %Tbreasts!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdAttack",
			"targetBreasts",
			"targetKnockedDownBack",
			"targetTaller",
			{ conditions: ["targetUpperbodyNotHard","targetNoUpperbody"] }
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing ahold of %This nipples and tugs at them!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetKnockedDownBack","targetTaller","targetBreastsExposed"),
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S pinches a hold of %T's nipples and pulls backwards!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetUpperbodyNotHard"),
		audiokits : ["stretchGeneric"]
	},

	{ text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %Tbutt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable"),
		audiokits : ["slapGeneric"]
	},
	{ text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes down hard!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdAttack",
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a hold of %T's %Tbsize %leftright %Tbreast and squeezes down firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperbodyNotHard"),
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		"armor_slot":"lowerbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdAttack",
			"targetLowerbodyHard"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		"armor_slot":"upperbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdAttack",
			"targetUpperbodyHard"
		],
		audiokits : ["punchGeneric"]
	},

	// tentacles
	{ text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		audiokits : ["tentacleTwist"],
		conditions : anyOnHumCond.concat("action_stdAttack","senderHasTentacles","targetBreasts","targetUpperbodyNotHard")
	},
	{ text : "%S slips a couple of tendrils around %T's exposed %Tbreasts, firmly squeezing them!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetBreasts",
			"targetNoUpperbody"]
	},
	{ text : "%S lashes %T's %Trsize %Tbutt with a tentacle!",
		audiokits : ["tentacleWhip"
		],
		"armor_slot":"lowerbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles"]
	},
	{ text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		audiokits : ["tentacleWhip"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles"]
	},
	{ text : "%S slips two tendrils up between %T's legs, slipping part-way inside %This %Tvagina and stretching at it!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetVagina",
			{
				conditions : [
					"targetNoLowerbody",
					"ttGroinExposed"
				]
			}
		],
		weight : Text.Weights.high,
	},
	{ text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		audiokits : ["tentacleStretch"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"ttWedgie",
			"targetWearsLowerbody"
		],
		weight : Text.Weights.high,

	},
	{ text : "Two of %S's tentacles wrap around %T's %Tbsize %Tbreasts, squeezing down firmly!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetUpperbodyNotHard",
			"targetBreasts"]
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		audiokits : ["tentacleWhip"
		],
		"armor_slot":"upperbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetUpperbodyHard",
			"targetBreasts"]
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		audiokits : ["tentacleWhip"
		],
		"armor_slot":"lowerbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetLowerbodyHard"]
	},
	{ text : "%S flicks %T's %Tgroin with a small tentacle, lashing the front of %This %TclothLower around!",
		audiokits : ["tentacleWhip"
		],
		"armor_slot":"lowerbody",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetLowerbodyNotHard",
			"targetWearsLowerbody",
			"targetPenis"]
	},
	{ text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetLowerbodyNotHard",
			"targetWearsLowerbody",
			"targetPenis"]
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %Tpenis before constricting %This package!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"targetPenis"]
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %Tpenis and constricting it!",
		audiokits : ["tentacleTwist"
		],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"targetPenis"]
	},
	{ text : "%S smacks %T's %Tpsize exposed %Tpenis with a tentacle!",
		audiokits : ["tentacleWhip"],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasTentacles",
			{
				conditions : [
					"targetNoLowerbody",
					"ttGroinExposed"
				]
			},
			"targetPenis"
		],
		weight : Text.Weights.high,

	},


	// Whips
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %Tbutt!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasWhip"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace's %leftright buttcheek!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasWhip"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This chest!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasWhip"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %Tbreasts!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasWhip",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S takes advantate of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %Tbutt!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdAttack",
			"senderHasWhip",
			"targetKnockedDownFront"
		],
		audiokits : ["whipDouble"]
	},
	{ text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %Tbutt!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdAttack","ttBentOver","senderHasWhip"),
		weight : Text.Weights.high,
		audiokits : ["whipGeneric"]
	},

	// stdArouse
	{ text : "%S tickles %T!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderBeast"
		],
		audiokits : ["tickleGeneric"]
	},
	{ text : "%S tickles %T!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetBeast"
		],
		audiokits : ["tickleGeneric"]
	},
	{ text : "%S grabs a hold of and rubs %T's %Tbutt!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetNotBeast",
			"senderNotBeast"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This %Tgroin!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetNotBeast",
			"senderNotBeast"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %Tbreasts!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdArouse",
			"targetBreasts",
			"senderNotBeast",
			"targetUpperbodyNotHard"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_stdArouse",
			"targetBreasts",
			"senderNotBeast",
			"targetUpperbodyHard"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %Tbreasts!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetBreasts",
			"senderNotBeast",
			"targetKnockedDownFront",
			"targetTaller"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbreasts before jiggling them around!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetBreasts",
			"senderNotBeast",
			"targetKnockedDownBack",
			"targetTaller",
			[
				"targetUpperbodyNotHard",
				"targetNoUpperbody"
			]
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S jumps onto the knocked down %Trace's back, squeezes a firm hold of %T's %Trsize buttcheeks and jiggles them around!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderNotBeast",
			"targetKnockedDownFront",
			"targetTaller",
			[
				"targetWearsThong",
				"targetNoLowerbody"
			]
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S reaches down towards %T's bulge and teasingly squeezes it!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"targetWearsLowerbody",
			"senderNotBeast",
			"targetPenis"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S takes advantage of %T being bent over and fondles %This %Tgroin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver"),
		weight : Text.Weights.high,
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Tvagina, landing a %couple of thrusts!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","targetVagina","senderPenis","targetNoLowerbody","targetGroinExposed"),
		weight : Text.Weights.high,
		audiokits : ["slowThrusts"]
	},
	{ text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Trsize %Tbutt, landing a %couple of thrusts!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","senderPenis","targetNoLowerbody","targetButtExposed"),
		weight : Text.Weights.high,
		audiokits : ["slowThrusts"]
	},

	// stdArouse - Tentacles
	{ text : "%S slips a couple of tendrils up between %T's legs, rubbing across %This %groin!",
		audiokits : ["squishTiny"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetNotBeast"]
	},
	{ text : "%S slips a tendril up between %T's buttcheeks, tickling between them!",
		audiokits : ["squishLong"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetNotBeast",
			[
				"targetWearsThong",
				"targetNoLowerbody",
				"ttButtExposed"
			]
		],
		weight : Text.Weights.high,

	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tvagina and thrusting a couple of times!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetNotBeast",
			"targetVagina",
			"targetGroinExposed"
		],
		weight : Text.Weights.high,

	},
	{ text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %Tvagina, and the other into %This %Trsize %Tbutt. Pumping rythmically in and out of %T!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "senderHasTentacles","targetVagina","targetNoLowerbody"
		])
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tbutt where it thrusts a couple of times!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetNotBeast",
			[
				"targetNoLowerbody",
				"ttButtExposed"
			]
		],
		weight : Text.Weights.high,

	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %Tvagina!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetLegsSpread",
			"targetGroinExposed",
			"targetVagina"
		],
		weight : Text.Weights.high,

	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %Tvagina, rapidly thrusting inside %Thim!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetLegsSpread",
			"targetWearsThong",
			"targetVagina"]
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %Tbutt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetLegsSpread",
			"targetKnockedDownFront",
			[
				"targetNoLowerbody",
				"ttButtExposed"
			],
			"targetVagina"
		],
		weight : Text.Weights.high,

	},
	{ text : "%S takes advantage of %T being knocked down and surprises %Thim with a slimy cock-tipped tentacle slipping inside %This mouth, squirming around and tickling %This cheeks!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetLegsSpread",
			"targetKnockedDownFront",
			"targetNotBeast"]
	},
	{ text : "%S surprises %T with a thick tentacle shoved into %This mouth! The tentacle thrusts a couple of times, leaving a gooey residue behind.",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles"]
	},
	{ text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %Tbutt and lands some rapid thrusts, making %This %Tbutt somewhat sticky!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsLowerbody"]
	},
	{ text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %Tvagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"targetVagina"]
	},
	{ text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %Tvagina and lands some rapid thrusts inside %Thim!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsThong",
			"targetVagina",
			"targetLowerbodyNotHard"]
	},
	{ text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		audiokits : ["tentacleMultipleThrusts"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"targetWearsThong"]
	},
	{ text : "%S pushes a thick tentacle up between %T's buttcheeks, giving %This rear some rapid prods through %This buttstring!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"targetWearsThong",
			"ttButtNotExposed"
		],
		weight : Text.Weights.default,
	},
	{ text : "%S latches a thick tentacle with suction cups onto %T's %Tgroin and performs a few rapid tugs and prods at %This %TclothLower!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsLowerbody","targetWearsThong","ttButtNotExposed"),
		weight : Text.Weights.default,
	},
	{ text : "%S latches two thick tentacles with suction cups onto %T's %Tbreasts and performs a few rapid tugs and prods at %This %TclothUpper!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsUpperbody","targetUpperbodyNotHard","targetBreasts"),
		weight : Text.Weights.default,
	},
	{ text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		audiokits : ["gooRub"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"targetWearsLowerbody",
			"ttPussyWedgie"
		],
		weight : Text.Weights.high,

	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %Tvagina and leaving a little slimy residue behind!",
		audiokits : ["gooRub"],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			"ttPussyWedgie",
			"targetWearsLowerbody"
		],
		weight : Text.Weights.high,
	},
	{ text : "%S wraps a tentacle around %T's %Tpsize %Tpenis, allowing a small tendril to slip under %This foreskin, tickling the tip of %This %Tpenis!",
		audiokits : ["tentacleTwist"],
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasTentacles",
			{conditions : ["targetNoLowerbody","ttGroinExposed"]},
			"targetPenis",
			"targetNotCircumcised"
		],
		weight : Text.Weights.high,
	},
	{ text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %Tgroin!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasWhip",
			"targetVagina",
			"targetNotKnockedDown"
		],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S slips %Shis %Sgear between %T's buttcheeks, grinding it back and fort!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"action_stdArouse",
			"senderHasWhip",
			"targetVagina",
			{
				conditions : [
				"targetWearsThong",
				"targetNoLowerbody"
				]
			}
		],
		audiokits : ["stretchGeneric"]
	},












	// DEFEATS

	// stdPunishDom
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Trsize %Tbutt before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable"),
		audiokits : ["slowThrusts"]
	},
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Tvagina before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
	turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable","targetVagina"),
		audiokits : ["slowThrusts"]
	},
	{ text : "%Rbent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Trsize %Tbutt...",
	turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver"),
		audiokits : ["slowThrusts"],
		weight : Text.Weights.high,

	},
	{ text : "%Rbent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Tvagina...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver","targetVagina"),
		weight : Text.Weights.high,
		audiokits : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's arms from behind and forcing %Shis %Spsize %Spenis iside %T's %Trsize %Tbutt. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis"),
		audiokits : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's hips and forcing %Shis %Spsize %Spenis iside %T's %Tvagina. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","targetVagina"),
		audiokits : ["slowThrusts"]
	},
	{ text : "%S pushes the defeated %Trace to the ground and seats %Shimself on %T's face. %S begins riding %T's face...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderVagina"),
		audiokits : ["slowThrusts"]
	},



	// stdPunishSub
	{ text : "%S used a SUBMISSIVE text against %T!",
		conditions : humOnHumCond.concat("action_stdPunishSub"),
	},



	// stdPunishSad
	{ text : "%S bends the defeated %Trace over a table. Raising %Shis palm high in the air, the %Srace starts forcefully slapping %T's %Trsize %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","roomTable"),
		audiokits : ["slapGeneric"]
	},
	{ text : "%Rbent_over pins %T's arms behind %This back, allowing %S a turn. %S continues the punishment, vigorously spanking the %Trace's already punished %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","ttBentOver","ttSpanked"),
		weight : Text.Weights.high,
		audiokits : ["slapGeneric"]
	},
	{ text : "%Rbent_over pins %T's arms behind %This back, allowing %S a turn. %S raises %Shis palm and starts vigorously spanking the %Trace's %Trsize exposed %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","ttBentOver","ttNotSpanked"),
		weight : Text.Weights.high,
		audiokits : ["slapGeneric"]
	},















	// NPC ACTIONS

	// tentacle_fiend_tentacleMilker
	{ text : "%S slips suction cup tipped tentacles inside %T's %TclothUpper, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		audiokits : ["tentacleSuction"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentacleMilker",
			"targetBreasts",
			"targetWearsUpperbody"
		]
	},
	{ text : "%S assaults %T with suction cup tipped tentacles, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		audiokits : ["tentacleSuction"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentacleMilker",
			"targetBreasts",
			"targetNoUpperbody"]
	},
	{ text : "%S slips a hollow tentacle inside %T's %TclothLower, enveloping %This %Tpenis and coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		audiokits : ["tentacleSuction"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentacleMilker",
			"targetPenis",
			"targetWearsLowerbody"]
	},
	{ text : "%S envelops %T's %Tpenis with a hollow tentacle, coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		audiokits : ["tentacleSuction"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentacleMilker",
			"targetPenis",
			"targetNoLowerbody"]
	},


	// tentacle_fiend_legWrap
	{ text : "%S hoops tentacles around %T's ankles, pulling %Thim to the ground and spreading %This legs!",
		audiokits : ["tentacleSuction"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_legWrap",
		]
	},


	// tentacle_fiend_injectacle
	{ text : "%S's thick tentacle slips into %T's %Tbsize %Tbutt and lands some rapid thrusts before flooding %T's %Tbutt with a sticky liquid!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetButtExposed",
		),
		weight : Text.Weights.high,

	},
	{ text : "%S's thick tentacle slips into %T's %Tvagina, landing some rapid thrusts before flooding it with a sticky liquid!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina"
		),
		weight : Text.Weights.high,
	},
	{ text : "Two of %S's tentacles slither up between %T's legs, one pushing into %This %Trsize %Tbutt, the other slightly larger one into %This %Tvagina. The tentacles start thrusting into %T in sync, eventually shooting a sizable amount sticky liquid inside %Thim!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetVagina",
			{conditions:[
				"targetNoLowerbody", 
				{conditions:[
					"ttGroinExposed",
					"ttButtExposed"
				], min:-1}
			]},
			"targetNoLowerbody",
		),
		weight : Text.Weights.high,

	},
	{ text : "%S takes advantage of %T's legs being restrained, shoves a thick tentacle into %This %Tvagina and starts thrusting rapidly. Some time later the tentacle finally slows down, squirting a large enough wad of sticky goo into %T that some of it immediately squirts out!",
		audiokits : ["tentacleMultipleThrusts"],
		conditions : anyOnHumCond.concat(
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina",
			"targetLegsSpread"
		),
		weight : Text.Weights.high,
	},


	// tentacle_fiend_tentatug
	{ text : "%S latches tentacles onto %T's %TclothLower, tugging at the piece.",
		audiokits : ["tentacleStretch"],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentatug",
		]
	},
	{ text : "%S latches tentacles around the sides of %T's %TclothLower, tugging up and out, giving %T a wedgie!",
		audiokits : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsLowerbody","targetLowerbodyWaistband"),
		turnTags:[stdTag.ttWedgie]
	},
	{ text : "%S latches tentacles around the bottom of %T's %TclothLower and give a hard tug down, exposing %This %Tgenitals!",
		audiokits : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong"),
		turnTags:[stdTag.ttGroinExposed]
	},
	{ text : "%S latches tentacles around the back of %T's %TclothLower and tugs down, exposing %This %Tbutt!",
		audiokits : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetNoBodysuit"),
		turnTags:[stdTag.ttButtExposed]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, chafing into %This %Tvagina!",
		audiokits : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong","targetVagina"),
		turnTags:[stdTag.ttPussyWedgie, stdTag.ttWedgie]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, making %This junk flop free!",
		audiokits : ["tentacleStretch"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentatug",
			"targetWearsThong",
			"targetPenis"]
	},
	{ text : "%S's tentacles wrap around the bottom of %T's %TclothLower and tugs down before letting go and allowing the piece to snap onto %T's %groin!",
		audiokits : ["tentacleStretch"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentatug",
			"targetWearsSlingBikini"]
	},
	{ text : "%S's tentacles wrap around the front straps of %T's %TclothLower and tugs back before letting go, allowing the piece to snap painfully onto %T's %Tbsize %Tbreasts!",
		audiokits : ["tentacleStretchWhip"
		],
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentacle_fiend_tentatug",
			"targetWearsSlingBikini",
			"targetBreasts"]
	},




	// action_tentacle_ride
	{ text : "%S slips a thick tentacle between %T's legs, lifting %Thim off the ground!",
		audiokits : ["tentacleStretch"],
		conditions : baseCond.concat("action_tentacle_ride")
	},


	// action_shocktacle_zap
	{ text : "%S wraps charged tentacles around %T's %Tbsize %Tbreasts, squeezing down and sending an electric shock through them!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyNotHard")
	},
	{ text : "%S wraps charged tentacles around %T's nipples, constricting and sending an electric shock through them!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyNotHard")
	},
	{ text : "%S wraps a charged tentacle around %T's %Tgroin, squeezing down and sending an electric shock through %This %Tpenis!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetPenis", {conditions:[
			"targetGroinExposed", "targetLowerbodyStretchy"
		]}),
		weight : Text.Weights.high
	},
	{ text : "%S wraps charged tentacles around %T's %Trsize buttcheecks, squeezing down and sending an electric shock through them!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerbodyNotHard")
	},
	{ text : "%S whaps %T's %Trsize %Tbutt with an electrified tentacle, shocking the %Trace!",
		audiokits : ["tentacleZap","tentacleWhip"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap")
	},
	{ text : "%S prods %T with an electrified tentacle, shocking the %Trace!",
		audiokits : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap")
	},
	{ text : "%S latches electrified tendrils around %T's %TclothUpper, sending pulses into the metal and shocking %This %Tbsize %Tbreasts!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyMetal")
	},
	{ text : "%S latches electrified tendrils onto %T's %TclothLower, sending pulses into the metal and shocking %This %Tgenitals!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerbodyMetal")
	},
	{ text : "%S electrifies the tentacle currently lifting %T off the ground, sending electric pulses into %This %Tgroin!",
		audiokits : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetRidingOnMyTentacle")
	},
	{ text : "%S prods %T's rear with an electrified tentacle slipping it inside %Thim and shocking %This %Tbutt!",
		audiokits : ["tentacleZap","squishLong"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetButtExposed")
	},
	{ text : "%S prods %T's %Tgroin with an electrified tentacle slipping it inside %Thim and shocking %This %Tvagina!",
		audiokits : ["tentacleZap","squishLong"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetGroinExposed", "targetVagina")
	},
	



	// imp_specialDelivery
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed until %She shoots a large squirt of demonic jizz down %T's throat.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast"
		],
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed! A few moments later, the %Srace pulls out, shooting a long streak of demonic jizz across %T's face.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast"
		],
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horn and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetHorn"
		],
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horns and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetHorns"
		],
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis into %This %Tvagina! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis inside! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetVagina","targetButtExposed"),
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps onto %T, latching %Shis legs around the %Trace's chest and grabbing a firm hold of %This nipples, squishing %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts. The %Srace begins rapidly humping, eventually reaching climax, shooting %Shis load into %T's face!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetBreasts",
			[
				"targetNoUpperbody",
				"ttBreastsExposed"
			]
		],
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S jumps onto the knocked down %Trace slipping %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts, pushes them together and starts rapidly thrusting. A short while later %S pulls back, shooting a long streak of demonic cum across %T's %Tbreasts!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetKnockedDownBack",
			"targetBreasts",
			[
				"targetNoUpperbody",
				"ttBreastsExposed"
			]
		],
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S surprises the knocked down %Trace by squatting near %This face and shoving %Shis %Spsize %Spenis in %This mouth. The %Srace pumps a few times before forcing a large squirt of demon cum inside %T's mouth!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetKnockedDownBack"
		],
		audiokits : ["thrustCum"]
	},
	{ text : "%S surprises the knocked down %Trace by lifting %This hips and shoving %Shis %Spsize %Spenis into %This %Tvagina. The %Srace starts humping rapidly, eventually reaching climax and flooding %T with demonic spunk!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetKnockedDownBack",
			"targetVagina",
			"targetGroinExposed"
		],
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S squats by %T's %Trsize %Tbutt and slips %Shis %Spsize %Spenis inside. The %Srace starts rapidly humping, eventually reaching climax and flooding %T's %Tbutt with demonic spunk!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_specialDelivery",
			"targetNotBeast",
			"targetKnockedDownFront",
			"targetButtExposed"
		],
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %Spenis into %This %Tvagina. %S starts rapidly humping, eventually reaching climax and flooding %T's %Tvagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetGroinExposed","targetVagina"),
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %Spenis into %This %Tbutt. %S starts rapidly humping, eventually reaching climax and flooding %T's %Tbutt with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetButtExposed"),
		weight : Text.Weights.high,
		audiokits : ["thrustCum"]
	},


	// imp_blowFromBelow
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking across %This %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking the %Trace's %Trsize %leftright buttcheek!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips between %T's legs and throws a punch at each of the %Trace's %Trsize buttcheeks!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips between %T's legs and throws a couple of slaps across the front of %T's %TclothLower around, smacking %This %Tpenis around!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetPenis",
			"targetLowerbodyStretchy"
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%S slips between %T's legs and forces %Shis fist up into the %Trace's %Tvagina, thrusting a few times!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetVagina",
			"targetGroinExposed"
		],
		weight : Text.Weights.high,
		audiokits : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and forces %Shis fist up into both of their %Tvaginas, thrusting a few times!",
		"numTargets":2,
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetVagina",
			"targetGroinExposed"
		],
		weight : Text.Weights.high,
		audiokits : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and rams %Shis fist into both of their groins!",
		"numTargets":2,
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips underneath %T and %T2, giving a hard smack across both of their %Tbutts!",
		"numTargets":2,
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast"
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast, jiggling it around!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetBreasts",
			"targetUpperbodyHard"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips underneath %T and throws a few rapid slaps across %This %Tbreasts!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%S grabs a hold of and spreads %T's legs while %The's still bent over the table, followed briefly by the %Srace ramming %Shis knee up into %T's %Tgroin!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_imp_blowFromBelow","ttBentOverTable"),
		weight : Text.Weights.high,
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast and %T2's %T2bsize %T2breast, jiggling them both around!",
		"numTargets":2,
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_blowFromBelow",
			"targetNotBeast",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["punchGeneric"]
	},
	

	// action_imp_claws
	{ text : "%S uses %Shis claws to rip at %T's outfit!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws"
		),
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S slips %Shis claws under %T's waistband from behind, tugging up firmly!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerbodyWaistband"
		),
		turnTags : [stdTag.ttWedgie],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S slips %Shis claws around %T's butt-string grabbing a firm hold of it and giving it a hard yank!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong"
		),
		turnTags : [stdTag.ttWedgie],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S slips %Shis claws under %T's waistband from the front, giving it a hard tug upwards!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerbodyWaistband"
		),
		turnTags : [stdTag.ttPussyWedgie],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S grabs a firm hold of %T's %TclothUpper from behind, pulling it backwards and causing the piece to constrict %This %Tbsize %Tbreasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetUpperbodyNotHard", "targetBreasts", "targetWearsUpperbody"
		),
		turnTags : [stdTag.ttBreastsWedgie],
		audiokits : ["stretchGeneric"]
	},
	{ text : "%S grabs around the front strings of %T's %TclothUpper, giving it a hard yank out and letting it set back on the side, exposing the %Trace's %Tbsize %Tbreasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetBreasts", "targetWearsSlingBikini"
		),
		turnTags : [stdTag.ttBreastsExposed],
		audiokits : ["stretchGeneric"]
	},






	// imp_ankleBite
	{ text : "%S jumps at %T's legs and starts chewing on %This ankle!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_ankleBite",
			"targetNotBeast"
		],
		audiokits : ["biteGeneric"]
	},


	// imp_demonicPinch
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This %Trsize %leftright buttcheek!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast"
		],
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards in %This %TclothLower!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast",
			"targetWearsLowerbody",
			"targetPenis",
			"targetNotCircumcised"
		],
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards and jiggling %This %Tpsize %Tpenis around!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast",
			"targetGroinExposed",
			"targetPenis",
			"targetNotCircumcised"
		],
		weight : Text.Weights.high,
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, surprising %T with a demonic pinch to %This clit!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast",
			"targetVagina"
		],
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This %leftright nipple!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast",
			"targetBreasts"
		],
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This nipples and starts jiggling them around in %This %TclothUpper!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_imp_demonicPinch",
			"targetNotBeast",
			"targetBreasts",
			"targetWearsUpperbody"
		],
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, making an invisible force pinch down on the bottom of %T's %leftright breast!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, causing invisible fingers to pinch %T's %Tvagina!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetVagina"),
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's %leftright nipple, twisting it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, twisting both!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, causing invisible fingers to clamp down onto %T's nipples, stretching them both outwards!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		audiokits : ["pinchGeneric","stretchGeneric"]
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's %leftright ear, tugging at it!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetEars"),
		audiokits : ["pinchGeneric"]
	},
	{ text : "%S casts a spell, causing an invisible force to pinch %T's nose!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch"),
		audiokits : ["pinchGeneric"]
	},
	



	// whip_legLash
	{ text : "%S lashes %Shis whip across %T's legs!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_legLash",
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S lashes %Shis whip across %T's %leftright thigh!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_whip_legLash",
		],
		audiokits : ["whipGeneric"]
	},


	// whip_powerLash
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tgroin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetLowerbodyNotHard"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tbreasts, whapping them around!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %leftright %Tbreast, whapping it around!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking multiple times across %This %Tbreasts!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetBreasts",
			"targetUpperbodyHard"
		],
		audiokits : ["whipDouble"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This bulge around!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetLowerbodyNotHard",
			"targetLowerbodyStretchy",
			"targetPenis"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This %Tpenis around!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_whip_powerLash",
			"targetNoLowerbody",
			"targetPenis"
		],
		audiokits : ["whipGeneric"]
	},
	{ text : "%S surprises %T while %The bent over by lashing %Shis %Sgear from below up across the %Trace's %Tgroin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_whip_powerLash","targetVagina","targetWearsLowerbody","ttBentOver"),
		weight : Text.Weights.high,
		audiokits : ["whipGeneric"]
	},













	// Potions
	{ text : "%S chugs a small bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_minorHealingPotion",
		],
		audiokits : ["potionUse"]
	},
	{ text : "%S chugs a bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_healingPotion",
		],
		audiokits : ["potionUse"]
	},
	{ text : "%S chugs a large bottle of red liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_majorHealingPotion",
		],
		audiokits : ["potionUse"]
	},
	{ text : "%S chugs a bottle of blue liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_manaPotion",
		],
		audiokits : ["potionUse"]
	},
	{ text : "%S chugs a large bottle of blue liquid!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_majorManaPotion",
		],
		audiokits : ["potionUse"]
	},















	// GENERIC ACTIONS

	// lowBlow
	{ text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetBreasts"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast, jiggling it around in %This %TclothUpper!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetBreasts",
			"targetUpperbodyStretchy"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S throws a punch at %T's %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S grabs a hold of %T's nipples through %This %TclothUpper, giving them both a painful twist while tugging them out!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetBreasts",
			"targetUpperbodyNotHard",
			"targetWearsUpperbody"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a hold of %T's %groin, painfully squeezing between %This legs!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetLowerbodyNotHard",
			"targetWearsLowerbody",
			"targetNotBeast"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S catches %T unaware, throwing a hard punch at its weak spot!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_lowBlow",
			"targetBeast"
		],
		audiokits : ["punchGeneric"]
	},









	// PLAYER CLASS ACTIONS


	// WARRIOR
	// warrior_viceGrip
	{ text : "%S grabs a firm hold of %T's %Tgroin and squeezes down hard!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs at %T!",
		conditions : [
			"action_warrior_viceGrip",
			"actionHit",
			"eventIsActionUsed",
			"targetBeast"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T's %leftright %Tbreast and squeezes down hard!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
			"targetBreasts"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T's %Tpenis and firmly squeezes down on it!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
			"targetPenis",
			[
				"ttGroinExposed",
				"targetNoLowerbody"
			]
		],
		weight : Text.Weights.high,
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T's %Tbutt and squeezes down firmly!",
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T and %T2's groins and squeezes down hard!",
		"numTargets":2,
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of %T and %T2's butts and squeezes down hard!",
		"numTargets":2,
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S grabs a firm hold of one of %T and %T2's %Tbreasts each and squeezes down hard!",
		"numTargets":2,
		conditions : [
			"targetNotBeast",
			"actionHit",
			"eventIsActionUsed",
			"senderNotBeast",
			"action_warrior_viceGrip",
			"targetBreasts"
		],
		audiokits : ["squeezeGeneric"]
	},

	// warrior_bolster
	{ text : "%S readies %Thimself for combat!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_bolster",
		],
		audiokits : ["warriorShield"]
	},


	// warrior_revenge
	{ text : "%S retaliates, striking %T hard!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_revenge",
			"targetBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S counters %T with a rapid jab to %This %Tbsize %leftright %Tbreast!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_revenge",
			"targetBreasts"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S counters %T with a rapid jab to the %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_revenge",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S counters %T with a rapid jab at %This %Trsize %leftright buttcheeck!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_revenge",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S counters %T with a rapid jab to the stomach!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_warrior_revenge",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},







	// ROGUE

	// action_rogue_exploit
	{ text : "%S exploits an opening in %T's defenses, throwing a punch at %Thim!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetWearsUpperbody",
			"targetWearsLowerbody"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S exploits an opening in %T's defenses, throwing a powerful punch at %Thim!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoLowerbody",
			"targetNoUpperbody",
			"targetBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S slips some fingers up %T's %Tvagina, wiggling them around briefly!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoLowerbody",
			"targetVagina"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S slips %Shis between %T's legs, tickling %This clit!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoLowerbody",
			"targetVagina"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S slips %Shis between %T's legs and grabs a hold of %T's %Tpsize %Tpenis, giving it a couple of rapid tugs!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoLowerbody",
			"targetPenis"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S exploits an opening in %T's defenses, grabs a hold of and rubs %This exposed nipples!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoUpperbody",
			"targetNotBeast"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S exploits an opening in %T's defenses, grabs a hold of and jiggles %This %Tbsize exposed %Tbreasts around!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_exploit",
			"targetNoUpperbody",
			"targetBreasts"
		],
		audiokits : ["squeezeGeneric"]
	},


	// action_rogue_corruptingPoison
	{ text : "%S poisons %T, causing a warm feeling to course throughout %This body!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_corruptingPoison",
		],
		audiokits : ["poisonGeneric"]
	},


	// action_rogue_dirtyTricks
	{ text : "%S distracts %T, allowing %Shim to attack from behind!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S distracts %T and sneaks behind %Thim, throwing a powerful slap across %T's %Trsize %Tbutt!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and a finger down %This buttcrack, tickling at %This rear!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetWearsLowerbody"
		],
		audiokits : ["tickleGeneric"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and grabs a hold of %This %Tpsize %Tpenis, rubbing the glans with %Shis index finger!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetWearsLowerbody",
			"targetPenis"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and rubs %This clit!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetWearsLowerbody",
			"targetVagina"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and wiggles %Shis long finger up inside %T's %Tvagina!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetWearsLowerbody",
			"targetVagina"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping both hands into %T's %TclothUpper and massages %This %Tnipples!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetWearsUpperbody",
			"targetBreasts"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%S shoves %T from behind. As %T stumbles forward, %S slips %Shis hand between %T's legs and slides %Shis fingers across %This %groin and %Tbutt!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_rogue_dirtyTricks",
			"targetVagina"
		],
		audiokits : ["squeezeGeneric"]
	},




	// CLERIC

	// action_cleric_paddling
	{ text : "%S whacks %T with a divine paddle!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_paddling",
			"targetBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S whaps %T's %Trsize %Tbutt with a divine paddle!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_paddling",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},
	{ text : "%S summons a divine paddle, using it to repeatedly whack %T across %This buttcheeks!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_paddling",
			"targetNotBeast"
		],
		audiokits : ["punchGeneric"]
	},

	// action_cleric_smite
	{ text : "%S smites %T with holy magic!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_smite",
		],
		audiokits : ["holySmite"]
	},


	// action_cleric_chastise
	{ text : "%S chastises %T with divine might!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_chastise",
			"targetBeast"
		],
		audiokits : ["holyChastise"]
	},
	{ text : "Divine magic wraps around %T's %Tpsize %Tpenis!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_chastise",
			"targetPenis"
		],
		audiokits : ["holyChastise"]
	},
	{ text : "%T's %Tvagina tingles as divine magic flows across it!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_chastise",
			"targetVagina"
		],
		audiokits : ["holyChastise"]
	},
	{ text : "Divine chains wrap around %T's nipples, magically restraining them!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_chastise",
			"targetBreasts"
		],
		audiokits : ["holyChastise"]
	},


	// action_cleric_heal
	{ text : "Divine magic from %S's heal washes across %T!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_cleric_heal",
		],
		audiokits : ["holyGeneric"]
	},

	// TENTACLEMANCER

	// action_tentaclemancer_tentacleWhip
	{ text : "%S summons a tentacle, commanding it to lash at %T!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetBeast"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a tentacle behind %T whacking across %This %Trsize %Tbutt!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetNotBeast"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, slapping up across %This %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetNotBeast"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, giving %This %Tpsize %Tpenis a couple of lashes!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetPenis",
			"targetNoLowerbody"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle behind %T, lashing across %This %Trsize %leftright buttcheek!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetNotBeast"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, lashing across %This %Tbsize %leftright %Tbreast!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetBreasts",
			"targetUpperbodyHard"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, giving a jiggling lash across %This %Tbsize %leftright %Tbreast!",
		"armor_slot":"upperbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetBreasts",
			"targetUpperbodyNotHard"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, smacking %This %Tpsize %Tpenis around!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_tentacleWhip",
			"targetPenis",
			"targetLowerbodyNotHard"
		],
		audiokits : ["tentacleWhip"]
	},

	// action_tentaclemancer_corruptingOoze
	{ text : "%S flings a purple bolt of sludge at %T, coating %This body!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_corruptingOoze",
			"targetNoLowerbody",
			"targetNoUpperbody"
		],
		audiokits : ["tentacleSuction"]
	},
	{ text : "%S flings a purple bolt of sludge at %T, slipping into %This outfit!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_corruptingOoze",
			[
				"targetWearsLowerbody",
				"targetWearsUpperbody"
			]
		],
		audiokits : ["tentacleSuction"]
	},
	{ text : "The corrupting ooze constricts around %T's body, immobilizing %Thim!",
		conditions : [
			"eventIsEffectTrigger",
			{
				"type":"effectLabel",
				"data":{
				"label":"corrupting_ooze_proc"
				},
				"targnr":0
			}
		],
		audiokits : ["tentacleStretch"]
	},


	// action_tentaclemancer_siphonCorruption
	{ text : "The living ooze wiggles around %T's body, allowing %S to absorb its energy!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_siphonCorruption",
			"targetBeast"]
	},
	{ text : "The living ooze attached to %T protrudes into %This %Tbutt, causing a warm sensation as it wiggles and bubbles inside! %S absorbs energy from the stimulation.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_siphonCorruption",
			"targetNotBeast"]
	},
	{ text : "The living ooze attached to %T protrudes into %This %Tvagina, causing a warm sensation as it wriggles and bubbles inside %Thim! %S absorbs energy from the stimulation.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_siphonCorruption",
			"targetVagina"]
	},
	{ text : "The living ooze attached to %T wraps around %This %Tpenis, causing a warm sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_siphonCorruption",
			"targetPenis"]
	},
	{ text : "The living ooze attached to %T wraps around %This nipples, causing a tingling senation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_tentaclemancer_siphonCorruption",
			"targetBreasts"]
	},






	// MONK
	// action_monk_roundKick
	{ text : "%S spins around, throwing a rapid kick at %T!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_monk_roundKick",
		],
		audiokits : ["monkKick"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and throws a rapid jab at %T's %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast"
		],
		audiokits : ["monkKick"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and swipes %Shis palm right across %T's %groin!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast"
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and smacks %Shis palm right across %T's %Trsize %Tbutt!",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast"
		],
		audiokits : ["slapGeneric"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, forcing %Shis hand between %T's legs, rapidly rubbing %This %Tvagina!",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast",
			"targetVagina"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, grabbing a hold of and squeezing %This package!",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast",
			"targetPenis",
			"targetLowerbodyNotHard"
		],
		audiokits : ["squeezeGeneric"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and thrusts a few fingers inside %T's %Tvagina, briefly wiggling them around!",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderNotBeast",
			"targetVagina",
			"targetNoLowerbody"
		],
		audiokits : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S ducks under and lashes %T's exposed %groin with a tentacle!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderHasTentacles"
		],
		audiokits : ["tentacleWhip"]
	},
	{ text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's exposed %Tvagina!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit",
			"eventIsRiposte",
			"action_monk_roundKick",
			"senderHasTentacles",
			"targetNoLowerbody",
			"targetVagina"
		],
		audiokits : ["gooRub"]
	},


	// action_monk_disablingStrike
	{ text : "%S lands a mystical touch on %T, lowering their physical ability!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_monk_disablingStrike",
		],
		audiokits : ["darkPunch"]
	},

	// action_monk_upliftingStrike
	{ text : "%S throws a mystical strike at %T, allowing some chi to slip out and surround a nearby ally!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_monk_upliftingStrike",
		],
		audiokits : ["healingPunch"]
	},


	// ELEMENTALIST

	// action_elementalist_iceBlast
	{ text : "%S sends a chilling blast across %T!",
		conditions : baseCond.concat("action_elementalist_iceBlast"),
		hitfx : ["ice_blast"]
	},
	{ text : "%S sends a chilling blast across %T's %Tbreasts, hardening %This nipples!",
		conditions : baseCond.concat("action_elementalist_iceBlast","targetBreasts"),
		hitfx : ["ice_blast"]
	},

	// action_elementalist_healingSurge
	{ text : "%S summons a splash of healing water that flows across %T's body!",
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			"action_elementalist_healingSurge",
		],
		audiokits : ["waterHealing"]
	},

	// action_elementalist_waterSpout
	{ text : "%S summons a water spout beneath %T, coating %Thim in cold water!",
		conditions : baseCond.concat(["action_elementalist_waterSpout",]),
		audiokits : ["waterSpell"]
	},
	{ text : "%S summons a cold water spout beneath %T, splashing up against %This %Tgroin!",
		conditions : anyOnHumCond.concat(["action_elementalist_waterSpout",]),
		audiokits : ["waterSpell"]
	},
	
];

export default lib;