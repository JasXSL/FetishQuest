import Text from '../../classes/Text.js';
import conditions from './conditions.js';
import audioKits from './audioKits.js';
import stdTag from '../stdTag.js';
import Asset from '../../classes/Asset.js';
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
		alwaysAuto:true,
		alwaysOutput:true,
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
	{ text : "%T resisted the stun portion of the attack!",
		conditions : ["eventIsDiminishingResist","wrapperIsStun"],
		audiokits : ["spellFail"]
	},

	// STDAttack
	{ text : "%S throws a punch at %T!",
		"conditions":humOnAnyCond.concat("action_stdAttack"),
		hitfx : ["punch"]
	},
	{ text : "%S slaps %T's %Tbutt, jiggling %This %Trsize buttcheeks around!",
		"conditions": humOnHumCond.concat('action_stdAttack','targetButtLarge'),
		hitfx : ["slap"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %Tbreasts!",
		conditions : humOnHumCond.concat([ "action_stdAttack", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{ conditions: ["targetUpperbodyNotHard","targetBreastsExposed"] }
		]),
		hitfx : ["doubleSlap"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a hold of %This nipples and tugs at them!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetKnockedDownBack","targetTaller","targetBreastsExposed"),
		hitfx : ["stretch"]
	},
	{ text : "%S pinches a hold of %T's nipples and pulls backwards!",
		conditions : humOnHumCond.concat("action_stdAttack","targetBreasts","targetUpperbodyNotHard"),
		audiokits : ["pinchGeneric"],
		hitfx : ["stretch"]
	},
	{ text : "%S rams %Shis knee up at %T's %Tbutt!",
		conditions : humOnHumCond.concat("action_stdAttack"),
		hitfx : ["punch"]
	},
	{ text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %Tbutt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable"),
		hitfx : ["slap"]
	},
	{ text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes them!",
		conditions : humOnHumCond.concat(["action_stdAttack",]),
		hitfx : ["squeeze"]
	},
	{ text : "%S grabs a hold of %T's %Tbsize %leftright %Tbreast and squeezes down firmly!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperbodyNotHard"),
		hitfx : ["squeeze"]
	},
	{ text : "%S pinches down on %T's %leftright nipple and twists it!",
		conditions : humOnHumCond.concat("action_stdAttack", "targetBreasts", "targetUpperbodyNotHard"),
		hitfx : ["pinch"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		armor_slot : "lowerbody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetLowerbodyHard"]),
		hitfx : ["punch"]
	},
	{ text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		armor_slot : "upperbody",
		conditions : humOnHumCond.concat(["action_stdAttack","targetUpperbodyHard"]),
		hitfx : ["punch"]
	},


	// dishonorable
	{ text : "%S shoves %T from behind, bending %Thim over a table and bites %This %Trsize %Tbutt!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable","senderDishonorable"),
		hitfx : ["biteGeneric"]
	},

	// tentacles
	{ text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		conditions : anyOnHumCond.concat("action_stdAttack","senderHasTentacles","targetBreasts","targetUpperbodyNotHard"),
		hitfx : ['tentacleStretch'],
	},
	{ text : "%S slips a couple of tendrils around %T's exposed %Tbreasts, firmly squeezing them!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetBreasts","targetNoUpperbody"]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S lashes %T's %Trsize %Tbutt with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles"]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles"]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S slips two tendrils up between %T's legs, slipping part-way inside %This %Tvagina and stretching at it!",
		conditions : anyOnHumCond.concat(["action_stdAttack","senderHasTentacles","targetVagina",
			{
				conditions : [
					"targetNoLowerbody",
					"targetGroinExposed"
				]
			}
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", "senderHasTentacles", "ttWedgie", "targetWearsLowerbody"
		]),
		hitfx : ["tentacleStretch"],
		weight : Text.Weights.high,
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		armor_slot : "upperbody",
		conditions : anyOnHumCond.concat([ 
			"action_stdAttack", "senderHasTentacles", "targetUpperbodyHard", "targetBreasts"
		]),
		hitfx : ["tentacleWhip"],		
	},
	{ text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		armor_slot : "lowerbody",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerbodyHard"
		]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S flicks %T's %Tgroin with a small tentacle, lashing the front of %This %TclothLower around!",
		armor_slot : Asset.Slots.lowerbody,
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerbodyNotHard","targetWearsLowerbody","targetPenis"
		]),
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetLowerbodyNotHard","targetWearsLowerbody","targetPenis"
		]),
		hitfx : ["tentacleSqueeze"],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %Tpenis before constricting %This package!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetWearsLowerbody","targetPenis"
		]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %Tpenis and constricting it!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasTentacles","targetWearsLowerbody","targetPenis"
		]),
		hitfx : ['tentacleSqueeze'],
	},
	{ text : "%S smacks %T's %Tpsize exposed %Tpenis with a tentacle!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack", 
			"senderHasTentacles",
			{
				conditions : [
					"targetNoLowerbody",
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
	{ text : "%S latches %Shis tentacles around %T's %Tbsize %Tbreasts, constricting them hard!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperbodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["tentacleSqueeze"],
	},
	{ text : "%S latches %Shis tentacles around %T's nipples and starts tugging outwards!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperbodyStretchy"]}, 
			"targetBreasts"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's back and starts whipping %This %Trsize %Tbutt with its bulbous tentacles!",
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
	{ text : "%S latches onto %T's back and lashes %This %Tbsize %Tbreasts a %few times from behind!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			"targetBreasts"
		]),
		armor_slot : "upperbody",
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S latches onto %T's legs and lashes %Shis bulbous tentacle across %This %Tgroin a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		armor_slot : "lowerbody",
		hitfx : ["tentacleWhip"],
	},
	{ text : "%S latches onto %T's %Trsize %Tbutt and gives it a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
		]),
		hitfx : ["biteGeneric"],
	},
	{ text : "%S latches onto %T's %TBsize %leftright %Tbreast and gives %This nipple a quick bite!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderIsCocktopus","senderLatchingToTarget",
			{conditions:["targetBreastsExposed", "targetUpperbodyStretchy"]}, 
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
	{ text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %Tbutt!",
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
		armor_slot : Asset.Slots.upperbody,
		hitfx : ["whip"]
	},
	{ text : "%S swings %Shis %Sgear at %T, flicking against %This %leftright %Tbreast!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetBreasts"
		]),
		armor_slot : Asset.Slots.upperbody,
		hitfx : ["whip"]
	},
	{ text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %Tbreasts!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["stretch"]
	},
	{ text : "%S takes advantage of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %Tbutt!",
		conditions : anyOnHumCond.concat([
			"action_stdAttack","senderHasWhip","targetKnockedDownFront"
		]),
		hitfx : ["whipDouble"]
	},
	{ text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %Tbutt!",
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
	{ text : "%S grabs a hold of and rubs %T's %Tbutt!",
		conditions : humOnHumCond.concat([
			"action_stdArouse",
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This %Tgroin!",
		conditions : humOnHumCond.concat([
			"action_stdArouse"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %Tbreasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetUpperbodyHard"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %Tbreasts!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetBreasts","targetKnockedDownFront","targetTaller"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbreasts before jiggling them around!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetBreasts", "targetKnockedDownBack", "targetTaller",
			{conditions :[
				"targetUpperbodyNotHard",
				"targetBreastsExposed"
			]}
		]),
		hitfx : ["squeeze"]
	},

	{ text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbsize %leftright %Tbreast and gives it a %few rapid licks!",
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
				"targetNoLowerbody"
			]}
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S reaches down towards %T's bulge and teasingly squeezes it!",
		conditions : humOnHumCond.concat([
			"action_stdArouse","targetWearsLowerbody","targetPenis","targetShorter"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S takes advantage of %T being bent over and fondles %This %Tgroin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver"),
		weight : Text.Weights.high,
		hitfx : ["squeeze"]
	},
	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %Spenis inside the %Trace's %Tvagina and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S grabs a hold of the knocked down %Trace's legs, lifting them into the air before shoving %Shis %Spsize %Spenis inside %T's %Tvagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse","targetKnockedDownBack","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S grabs a hold of the knocked down %Trace's hips, lifting %This %Trsize %Tbutt into the air before shoving %Shis %Spsize %Spenis inside %T's %Tvagina, pounding it a %few times!",
		conditions : humOnHumCond.concat("action_stdArouse","targetKnockedDownBack","targetVagina","senderPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S positions %Shimself behind %T, shoving %Shis %Spsize %Spenis inside the %Trace's %Trsize %Tbutt and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOver","senderPenis","targetNoLowerbody","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S jumps onto the table and grabs a hold of %T's face, shoving %Shis %Spsize %Spenis inside and thrusting a %few times!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdArouse","ttBentOverTable","senderPenis"),
		weight : Text.Weights.max,
		hitfx : ["slowThrusts"]
	},

	{ text : "%S slips %Shis hand between %T's legs and forces a finger up the %Trace's %Tgroin, wiggling it inside %Thim!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetNoLowerbody", "targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs and rubs %This exposed clit!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetNoLowerbody", "targetVagina"
		]),
		hitfx : ["squishTiny"]
	},

	{ text : "%S slips between %T's legs and licks across the %Trace's %Tgroin!",
		conditions : humOnHumCond.concat([
			"action_stdArouse", "targetTaller"
		]),
		hitfx : ["squishTiny"]
	},

	{ text : "%S shoves %T from behind, bending %Thim over a table before slipping %Shis %Spsize %Spenis inside the %Trace, landing a %few thrusts!",
		turnTags:[stdTag.ttBentOver,stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdAttack","roomTable","senderDishonorable","targetVagina","targetGroinExposed"),
		hitfx : ["slowThrusts"]
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
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tvagina and thrusting a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","senderHasCocktacles","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %Tvagina, and the other into %This %Trsize %Tbutt. Pumping rythmically in and out of %T!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse", "senderHasTentacles","targetVagina","targetNoLowerbody"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tbutt where it thrusts a couple of times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","senderHasCocktacles",
			{conditions:[
				"targetNoLowerbody",
				"ttButtExposed"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %Tvagina!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetGroinExposed","targetVagina","senderHasCocktacles"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %Tvagina, rapidly thrusting inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetLegsSpread","targetWearsThong","targetVagina","senderHasCocktacles"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %Tbutt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
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
	{ text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %Tbutt and lands some rapid thrusts, making %This %Tbutt somewhat sticky!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerbody"
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %Tvagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerbody","targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %Tvagina and lands some rapid thrusts inside %Thim!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsThong","targetVagina","targetLowerbodyNotHard"
		]),
		hitfx : ["slowThrustsTentacle"],

	},
	{ text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerbody","targetWearsThong"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S latches a thick tentacle with suction cups onto %T's %Tgroin and performs a few rapid tugs and prods at %This %TclothLower!",
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsLowerbody","targetWearsThong","ttGroinNotExposed"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
	},
	{ text : "%S latches two thick tentacles with suction cups onto %T's %Tbreasts and performs a few rapid tugs and prods at %This %TclothUpper!",
		conditions : anyOnHumCond.concat("action_stdArouse","senderHasTentacles","targetWearsUpperbody","targetUpperbodyNotHard","targetBreasts"),
		weight : Text.Weights.default,
		hitfx : ["slowThrustsTentacleDiscrete"],
	},
	{ text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","targetWearsLowerbody","ttPussyWedgie"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %Tvagina and leaving a little slimy residue behind!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles","ttPussyWedgie","targetWearsLowerbody"
		]),
		weight : Text.Weights.high,
		hitfx : ["tentacleRub"],
	},
	{ text : "%S slips small tendrils between %T's legs, rapidly tickling %This %Tgroin!",
		conditions : anyOnHumCond.concat(["action_stdArouse","senderHasTentacles"]),
		hitfx : ["tentacleRub"],
	},
	{ text : "%S wraps a tentacle around %T's %Tpsize %Tpenis, allowing a small tendril to slip under %This foreskin, tickling the tip of %This %Tpenis!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderHasTentacles",
			{conditions : ["targetNoLowerbody","ttGroinExposed"]},
			"targetPenis",
			"targetNotCircumcised"
		]),
		weight : Text.Weights.high,
		hitfx : ["squishTiny"],

	},


	// Restrained by and legs spread by tentacles
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %Tvagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S slips in between %T's legs and forces %Shis strapon inside the %Trace's %Tbutt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This nipples!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetBreasts","targetUpperbodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %Tpenis!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetPenis","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and starts rubbing %This %Tgroin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetLowerbodyNotHard"),
		weight : Text.Weights.high,
		hitfx : ['squeeze']
	},
	{ text : "%S takes advantage of %T being restrained and licks across %This %Tgroin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis strapon into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "A tentacle restraining %T tugs %This head backwards, allowing %S to thrust %Shis %Spenis into %T's mouth!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis"),
		hitfx : ['slowThrusts'],
		weight : Text.Weights.high,
	},
	{ text : "%S slips in between %T's legs and forces a finger inside the %Trace's %Tvagina, wiggling it around inside %Thim!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderHasStrapon","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "%S takes advantage of %T being restrained and starts rapidly licking %This %Tgroin!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['squishTiny']
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %Spenis inside the %Trace's %Tvagina, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	{ text : "%S slips in between %T's legs and forces %Shis %Spsize %Spenis inside the %Trace's %Tbutt, thrusting for a while!",
		turnTags:[],
		conditions : humOnHumCond.concat("action_stdArouse","targetTentacleLiftSpread","senderPenis","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ['slowThrusts']
	},
	


	// Crab
	{ text : "%S slips between %T's legs and reaches up, grinding %Shis claw against the %Trace's %Tgroin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %Tgroin!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling the %Trace's %Trsize %Tbutt!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and protrudes %Shis tentacles upwards, tickling between %This buttcheeks!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab"),
		hitfx : ["tickle"]
	},
	{ text : "%S slips between %T's legs and reaches up, prodding %Shis claw part-way into the %Trace's %Tvagina!",
		turnTags:[],
		conditions : anyOnHumCond.concat("action_stdArouse","senderIsTentacrab", "targetVagina", "targetGroinExposed"),
		hitfx : ["squishTiny"]
	},


	// Cocktopus
	{ text : "%S tickles %T's %Tgroin with %Shis ribbed bulb tentacle!",
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
	{ text : "%S slips %Shis ribbed bulb tentacle inside %T's %TclothLower from behind, stroking down between the %Trace's buttcheeks and giving %This %Tvagina a %few tickles!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerbody', "targetVagina"
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S slips partially inside %T's %TclothLower, forces %Shis ribbed bulb tentacle up inside %This %Tvagina and wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerbody', "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S slips partially inside %T's %TclothLower, forces %Shis ribbed bulb tentacle up inside %This %Trsize %Tbutt and wiggling it around a bit.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerbody'
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S wraps a tentacle around %T's %Tbsize %leftright %Tbreast and tickles %This nipple with a ribbed tentacle.",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			'targetWearsLowerbody', 'targetBreasts'
		]),
		hitfx : ["squishTiny"],
	},
	{ text : "%S lashes tendrils around %T's nipples, pulling %This %Tbsize %Tbreasts together and thrusting %Shis head-tentacle up and down between them a %few times.",
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
	{ text : "%S latches onto %T's %Tbutt and forces one bulbous tentacle inside the %Trace's %Trsize %Tbutt, and the other inside %This %Tvagina thrusting a %few times!",
		conditions : anyOnHumCond.concat([
			"action_stdArouse","senderIsCocktopus","senderLatchingToTarget",
			"targetGroinExposed", "targetVagina"
		]),
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S latches around %T's legs forces both %Shis ribbed bulbous tentacles up into the %Trace's %Tvagina, swirling them around inside of the %Trace!",
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
	{ text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %Tgroin!",
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
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Trsize %Tbutt before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S bends the defeated %Trace over a table and spreads %This legs, exposing %This %Tvagina before shoving %Shis %Spsize %Spenis inside! %S begins forcefully pounding %T...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","roomTable","targetVagina"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Trsize %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver"),
		hitfx : ["slowThrusts"],
		weight : Text.Weights.high,

	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S to take over. Forcing %Shis %Spsize %Spenis inside, %S starts %thrusting into %T's %Tvagina...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable],
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis","ttBentOver","targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's arms from behind and forces %Shis %Spsize %Spenis iside %T's %Trsize %Tbutt. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
		conditions : humOnHumCond.concat("action_stdPunishDom","senderPenis"),
		hitfx : ["slowThrusts"]
	},
	{ text : "%S pulls the defeated %Trace onto %Shimself as %She lays down, grabbing a hold of %T's hips and forces %Shis %Spsize %Spenis iside %T's %Tvagina. %S begins %thrusting into the %Trace, bouncing %T on %Shis pelvis...",
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
	{ text : "%S bends the defeated %Trace over a table. Raising %Shis palm high in the air, the %Srace starts forcefully slapping %T's %Trsize %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttBentOverTable, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","roomTable"),
		hitfx : ["doubleSlap"],
		weight : Text.Weights.high
	},
	{ text : "%S pins the defeated %Trace's arms behind %This back and bends %Thim forwards. Raising %Shis palm high in the air, %S starts forcefully slapping %T's %Trsize %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","targetNotTaller"),
		hitfx : ["doubleSlap"],
		weight : Text.Weights.high
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S a turn. %S continues the punishment, vigorously spanking the %Trace's already punished %Tbutt...",
		turnTags:[stdTag.ttBentOver, stdTag.ttSpanked],
		conditions : humOnHumCond.concat("action_stdPunishSad","ttBentOver","ttSpanked"),
		weight : Text.Weights.high,
		hitfx : ["doubleSlap"]
	},
	{ text : "%Rtt_bent_over pins %T's arms behind %This back, allowing %S a turn. %S raises %Shis palm and starts vigorously spanking the %Trace's %Trsize exposed %Tbutt...",
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
			"action_tentacle_fiend_tentacleMilker","targetBreasts","targetWearsUpperbody"
		])
	},
	{ text : "%S assaults %T with suction cup tipped tentacles, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetBreasts","targetNoUpperbody"
		]),
		hitfx : ["tentacleSuck"],

	},
	{ text : "%S slips a hollow tentacle inside %T's %TclothLower, enveloping %This %Tpenis and coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetWearsLowerbody"
		]),
		hitfx : ["tentacleSuck"],

	},
	{ text : "%S envelops %T's %Tpenis with a hollow tentacle, coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentacleMilker","targetPenis","targetNoLowerbody"
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
	{ text : "%S's thick tentacle slips into %T's %Tbsize %Tbutt and lands some rapid thrusts before flooding %T's %Tbutt with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetButtExposed",
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S's thick tentacle slips into %T's %Tvagina, landing some rapid thrusts before flooding it with a sticky liquid!",
		conditions : anyOnHumCond.concat(
			"action_tentacle_fiend_injectacle",
			"targetGroinExposed",
			"targetVagina"
		),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "Two of %S's tentacles slither up between %T's legs, one pushing into %This %Trsize %Tbutt, the other slightly larger one into %This %Tvagina. The tentacles start thrusting into %T in sync, eventually shooting a sizable amount sticky liquid inside %Thim!",
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
		hitfx : ["slowThrustsTentacle"],
	},
	{ text : "%S takes advantage of %T's legs being restrained, shoves a thick tentacle into %This %Tvagina and starts thrusting rapidly. Some time later the tentacle finally slows down, squirting a large enough wad of sticky goo into %T that some of it immediately squirts out!",
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
			"action_tentacle_fiend_tentatug",
		])
	},
	{ text : "%S latches tentacles around the sides of %T's %TclothLower, tugging up and out, giving %T a wedgie!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsLowerbody","targetLowerbodyWaistband"),
		turnTags:[stdTag.ttWedgie]
	},
	{ text : "%S latches tentacles around the bottom of %T's %TclothLower and give a hard tug down, exposing %This %Tgenitals!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong"),
		turnTags:[stdTag.ttGroinExposed]
	},
	{ text : "%S latches tentacles around the back of %T's %TclothLower and tugs down, exposing %This %Tbutt!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetNoBodysuit"),
		turnTags:[stdTag.ttButtExposed]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, chafing into %This %Tvagina!",
		hitfx : ["tentacleStretch"],
		conditions : anyOnHumCond.concat("action_tentacle_fiend_tentatug","targetWearsThong","targetVagina"),
		turnTags:[stdTag.ttPussyWedgie, stdTag.ttWedgie]
	},
	{ text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, making %This junk flop free!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug","targetWearsThong","targetPenis"
		]),
		turnTags:[stdTag.ttGroinExposed]
	},
	{ text : "%S's tentacles wrap around the bottom of %T's %TclothLower and tugs down before letting go and allowing the piece to snap onto %T's %groin!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug","targetWearsSlingBikini"
		])
	},
	{ text : "%S's tentacles wrap around the front straps of %T's %TclothLower and tugs back before letting go, allowing the piece to snap painfully onto %T's %Tbsize %Tbreasts!",
		hitfx : ["tentacleStretchWhip"],
		conditions : baseCond.concat([
			"action_tentacle_fiend_tentatug","targetWearsSlingBikini","targetBreasts"
		])
	},
	{ text : "%S slips inside %T's %TclothLower and begins pushing out at it from inside.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsLowerbody"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S slips inside %T's %TclothUpper and begins pushing out at it from inside.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsUpperbody"
		]),
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's legs and wraps a tendril around %T's butt-string, tugging down and exposing %This %Tgenitals.",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetWearsThong"
		]),
		turnTags:[stdTag.ttGroinExposed],
		hitfx : ["tentacleStretch"],
	},
	{ text : "%S latches onto %T's back and slips some tentacles over %This shoulders, grabbing a hold of %This %TclothUpper and tugging upwards, exposing %This %Tbsize %Tbreasts!",
		conditions : anyOnHumCond.concat([
			"action_tentacle_fiend_tentatug","senderIsCocktopus","senderLatchingToTarget",
			"targetBreasts", "targetUpperbodyNotHard"
		]),
		turnTags:[stdTag.ttBreastsExposed],
		hitfx : ["tentacleStretch"],
	},



	// action_tentacle_ride
	{ text : "%S slips a thick tentacle between %T's legs, lifting %Thim off the ground!",
		hitfx : ["tentacleStretch"],
		conditions : baseCond.concat("action_tentacle_ride")
	},


	// action_shocktacle_zap
	{ text : "%S wraps charged tentacles around %T's %Tbsize %Tbreasts, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyNotHard")
	},
	{ text : "%S wraps charged tentacles around %T's nipples, constricting and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyNotHard")
	},
	{ text : "%S wraps a charged tentacle around %T's %Tgroin, squeezing down and sending an electric shock through %This %Tpenis!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetPenis", {conditions:[
			"targetGroinExposed", "targetLowerbodyStretchy"
		]}),
		weight : Text.Weights.high
	},
	{ text : "%S wraps charged tentacles around %T's %Trsize buttcheecks, squeezing down and sending an electric shock through them!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerbodyNotHard")
	},
	{ text : "%S whaps %T's %Trsize %Tbutt with an electrified tentacle, shocking the %Trace!",
		hitfx : ["tentacleWhipZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap")
	},
	{ text : "%S latches electrified tendrils around %T's %TclothUpper, sending pulses into the metal and shocking %This %Tbsize %Tbreasts!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetBreasts", "targetUpperbodyMetal")
	},
	{ text : "%S latches electrified tendrils onto %T's %TclothLower, sending pulses into the metal and shocking %This %Tgenitals!",
		hitfx : ["tentacleSqueezeZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetLowerbodyMetal")
	},
	{ text : "%S electrifies the tentacle currently lifting %T off the ground, sending electric pulses into %This %Tgroin!",
		hitfx : ["tentacleZap"],
		conditions : anyOnHumCond.concat("action_shocktacle_zap", "targetRidingOnMyTentacle")
	},
	{ text : "%S prods %T's rear with an electrified tentacle slipping it inside %Thim and shocking %This %Tbutt!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetButtExposed")
	},
	{ text : "%S prods %T's %Tgroin with an electrified tentacle slipping it inside %Thim and shocking %This %Tvagina!",
		hitfx : ["tentacleZap"],
		conditions : baseCond.concat("action_shocktacle_zap", "targetGroinExposed", "targetVagina")
	},
	



	// imp_specialDelivery
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed until %She shoots a large squirt of demonic jizz down %T's throat.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed! A few moments later, the %Srace pulls out, shooting a long streak of demonic jizz across %T's face.",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery",
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horn and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorn"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T's head and grabs a firm hold of %This horns and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetHorns"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis into %This %Tvagina! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetVagina","targetGroinExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis inside! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto %T, latching %Shis legs around the %Trace's chest and grabbing a firm hold of %This nipples, squishing %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts. The %Srace begins rapidly humping, eventually reaching climax, shooting %Shis load into %T's face!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S jumps onto the knocked down %Trace slipping %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts, pushes them together and starts rapidly thrusting. A short while later %S pulls back, shooting a long streak of demonic cum across %T's %Tbreasts!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetBreasts","targetBreastsExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S surprises the knocked down %Trace by squatting near %This face and shoving %Shis %Spsize %Spenis in %This mouth. The %Srace pumps a few times before forcing a large squirt of demon cum inside %T's mouth!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack"
		]),
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S surprises the knocked down %Trace by lifting %This hips and shoving %Shis %Spsize %Spenis into %This %Tvagina. The %Srace starts humping rapidly, eventually reaching climax and flooding %T with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownBack","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S squats by %T's %Trsize %Tbutt and slips %Shis %Spsize %Spenis inside. The %Srace starts rapidly humping, eventually reaching climax and flooding %T's %Tbutt with demonic spunk!",
		conditions : humOnHumCond.concat([
			"action_imp_specialDelivery","targetKnockedDownFront","targetButtExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %Spenis into %This %Tvagina. %S starts rapidly humping, eventually reaching climax and flooding %T's %Tvagina with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetGroinExposed","targetVagina"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},
	{ text : "%S gets behind the bent over %Trace and slips %Shis %Spenis into %This %Tbutt. %S starts rapidly humping, eventually reaching climax and flooding %T's %Tbutt with demonic %cum!",
		conditions : humOnHumCond.concat("action_imp_specialDelivery","ttBentOver","targetButtExposed"),
		weight : Text.Weights.high,
		hitfx : ["slowThrustsCum"]
	},


	// imp_blowFromBelow
	{ text : "%S slips between %T's legs and throws a punch upwards, smacking across %This %groin!",
		armor_slot : "lowerbody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips between %T's legs and throws a slap upwards, smacking across %This %groin!",
		armor_slot : "lowerbody",
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
	{ text : "%S slips between %T's legs and throws a couple of slaps across the front of %T's %TclothLower around, smacking %This %Tpenis around!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetPenis","targetLowerbodyStretchy"
		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips between %T's legs and forces %Shis fist up into the %Trace's %Tvagina, thrusting a few times!",
		conditions : humOnHumCond.concat(["action_imp_blowFromBelow","targetVagina","targetGroinExposed"]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and forces %Shis fist up into both of their %Tvaginas, thrusting a few times!",
		numTargets : 2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetVagina","targetGroinExposed"
		]),
		weight : Text.Weights.high,
		hitfx : ["slowThrusts"]
	},
	{ text : "%S slips between %T and %T2's legs and rams %Shis fist into both of their groins!",
		numTargets:2,
		armor_slot:"lowerbody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and %T2, giving a hard smack across both of their %Tbutts!",
		numTargets:2,
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",

		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips underneath %T and throws a thorough slap across %This %Tbutt!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow",
		]),
		hitfx : ["slap"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast, jiggling it around!",
		armor_slot:"upperbody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast!",
		armor_slot : "upperbody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperbodyHard"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a few rapid slaps across %This %Tbreasts!",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["doubleSlap"]
	},
	{ text : "%S grabs a hold of and spreads %T's legs while %The's still bent over the table, followed briefly by the %Srace ramming %Shis knee up into %T's %Tgroin!",
		turnTags:[stdTag.ttBentOverTable, stdTag.ttBentOver],
		conditions : humOnHumCond.concat("action_imp_blowFromBelow","ttBentOverTable"),
		weight : Text.Weights.high,
		hitfx : ["punch"]
	},
	{ text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast and %T2's %T2bsize %T2breast, jiggling them both around!",
		"numTargets":2,
		"armor_slot":"upperbody",
		conditions : humOnHumCond.concat([
			"action_imp_blowFromBelow","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["punchDouble"]
	},
	

	// action_imp_claws
	{ text : "%S uses %Shis claws to rip at %T's outfit!",
		conditions : anyOnHumCond.concat(
			"action_imp_claws"
		),
		hitfx : ["claws"]
	},
	{ text : "%S slips %Shis claws under %T's waistband from behind, tugging up firmly!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerbodyWaistband"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis claws around %T's butt-string grabbing a firm hold of it and giving it a hard yank!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetWearsThong"
		),
		turnTags : [stdTag.ttWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S slips %Shis claws under %T's waistband from the front, giving it a hard tug upwards!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetLowerbodyWaistband"
		),
		turnTags : [stdTag.ttPussyWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs a firm hold of %T's %TclothUpper from behind, pulling it backwards and causing the piece to constrict %This %Tbsize %Tbreasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetUpperbodyNotHard", "targetBreasts", "targetWearsUpperbody"
		),
		turnTags : [stdTag.ttBreastsWedgie],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs around the front strings of %T's %TclothUpper, giving it a hard yank out and letting it set back on the side, exposing the %Trace's %Tbsize %Tbreasts!",
		"conditions" : anyOnHumCond.concat(
			"action_imp_claws", "targetBreasts", "targetWearsSlingBikini"
		),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs around the front strings of %T's %TclothLower near %This %Tgroin, giving it a hard yank down, exposing the %Trace's %Tgroin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetWearsSlingBikini"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs at the front of %T's %TclothLower and gives it a hard yank down, exposing the %Trace's %Tgroin!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerbodyWaistband"),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ["stretch"]
	},
	{ text : "%S grabs at the back of %T's %TclothLower and gives it a hard yank down, exposing the %Trace's %Trsize %Tbutt!",
		conditions : anyOnHumCond.concat("action_imp_claws", "targetLowerbodyWaistband"),
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
			"action_imp_demonicPinch","targetWearsLowerbody","targetPenis","targetNotCircumcised"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards and jiggling %This %Tpsize %Tpenis around!",
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
	{ text : "%S casts a spell, surprising %T as something suddenly pinches down on %This nipples and starts jiggling %This %Tbsize %Tbreasts around in %This %TclothUpper!",
		conditions : anyOnHumCond.concat([
			"action_imp_demonicPinch","targetBreasts","targetWearsUpperbody"
		]),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, making an invisible force pinch down on the bottom of %T's %leftright breast!",
		conditions : anyOnHumCond.concat("action_imp_demonicPinch", "targetBreasts"),
		hitfx : ["pinch"]
	},
	{ text : "%S casts a spell, causing invisible fingers to pinch %T's %Tvagina!",
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
	{ text : "%S squirts a large wad of oily ink across %T's %Tbreasts!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink", "targetBreasts"),
		hitfx : ["sludgeBoltBlack"]
	},
	{ text : "%S squirts a large wad of oily ink across %T's %Tgroin!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"]
	},
	{ text : "%S squirts a large wad of oily ink across %T's %Tbutt!",
		conditions : anyOnHumCond.concat("action_cocktopus_ink"),
		hitfx : ["sludgeBoltBlack"]
	},

	// cocktopus_inkject
	{ text : "%S latches around %T's head and starts prodding %This mouth with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingMouth"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches around %T's hips and starts prodding %This %Tbutt with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingButt", "targetNoLowerbody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S latches around %T's %Tbutt and starts prodding %This %Tvagina with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingGroin", "targetNoLowerbody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S slithers into %T's %TclothLower and starts prodding %This %Tbutt with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingButt", "targetWearsLowerbody"),
		hitfx : ["tentacleSqueeze"]
	},
	{ text : "%S slithers into %T's %TclothLower and starts prodding %This %Tvagina with its large head-tentacle!",
		conditions : anyOnHumCond.concat("action_cocktopus_inkject", "senderBlockingGroin", "targetWearsLowerbody"),
		hitfx : ["tentacleSqueeze"]
	},

	// /\ tick
	{ text : "%S shoves its big headtacle deep inside %T's %Tvagina!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S shoves its big head-tentacle inside %T's %Tvagina and stirs it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S launches multiple rapid thrusts into %T's %Tvagina with its large head-tentacle!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingGroin"],
		hitfx : ["slowThrustsTentacle"]
	},
	{ text : "%S shoves its big headtacle deep inside %T's %Tbutt!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S shoves its big head-tentacle deep inside %T's %Tbutt and wiggles it around!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_tick", "senderBlockingButt"],
		hitfx : ["tentacleSuck"]
	},
	{ text : "%S launches multiple rapid thrusts into %T's %Trsize %Tbutt with its large head-tentacle!",
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
	{ text : "%S latches tight onto %T's %Trsize %Tbutt and forces %Shis big head-tentacle up inside the %Trace's %Tvagina, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingGroin"],
		hitfx : ["sludgeBlack"]
	},
	{ text : "%S latches tight onto %T's hips and forces %Shis big head-tentacle up inside the %Trace's %Trsize %Tbutt, flooding it with a black oily liquid!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingButt"],
		hitfx : ["sludgeBlack"]
	},
	{ text : "%S latches tight around the back of %T's head and shoves %Shis big head-tentacle inside %T's throat, flooding it with enough black oily liquid that %The is forced to swallow some!",
		conditions : ["eventIsEffectTrigger", "action_cocktopus_inkject_finish", "senderBlockingMouth"],
		hitfx : ["sludgeBlack"]
	},

	// crab_claw_pinch
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %Trsize %Tbutt with %Shis claws!",
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
	{ text : "%S slips in between %T's legs and reaches up, pinching %This %Tgroin with a claw!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This nipples, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetBreasts", "targetUpperbodyNotHard"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Tbsize %Tbreasts, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetBreasts", "targetUpperbodyNotHard"]),
		hitfx : ['pinch']
	},
	{ text : "%S jumps at %T and pinches a hold of %This %Trsize %Tbutt, hanging on for a moment before dropping off!",
		conditions : anyOnHumCond.concat(["action_crab_claw_pinch", "targetLowerbodyNotHard"]),
		hitfx : ['pinch']
	},

	// crab_claw_tug
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothLower!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsLowerbody"]),
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This %TclothUpper!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetWearsUpperbody"]),
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinches a hold of %This %TclothLower and tugs down, exposing %This %Tgenitals!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerbodyNotHard", "targetWearsThong", "targetWearsLowerbody"]),
		turnTags : [stdTag.ttGroinExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinches a hold of the back of %This %TclothLower and tugs down, exposing %This %Tbutt!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerbodyNotHard", "targetWearsThong", "targetWearsLowerbody"]),
		turnTags : [stdTag.ttButtExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T and pinches a hold of the strings of %This %TclothUpper, tugging down and exposing the %Trace's %Tbreasts!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug", "targetLowerbodyNotHard", "targetWearsSlingBikini", "targetBreasts"]),
		turnTags : [stdTag.ttBreastsExposed],
		hitfx : ['stretch']
	},
	{ text : "%S jumps at %T from behind, pinching a hold of and tugging at %This outfit!",
		conditions : anyOnHumCond.concat(["action_crab_claw_tug"]),
		hitfx : ['stretch']
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
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tgroin!",
		armor_slot : "lowerbody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerbodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tbreasts, whapping them around!",
		armor_slot : "upperbody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %leftright %Tbreast, whapping it around!",
		armor_slot : "upperbody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T, cracking multiple times across %This %Tbreasts!",
		armor_slot : Asset.Slots.upperbody,
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetBreasts"
		]),
		hitfx : ["whipDouble"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This bulge around!",
		armor_slot : "lowerbody",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetLowerbodyStretchy","targetPenis"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This %Tpenis around!",
		conditions : anyOnHumCond.concat([
			"action_whip_powerLash","targetGroinExposed","targetPenis"
		]),
		hitfx : ["whip"]
	},
	{ text : "%S surprises %T bent over by lashing %Shis %Sgear from below up across the %Trace's %Tgroin!",
		turnTags:[stdTag.ttBentOver],
		conditions : humOnHumCond.concat([
			"action_whip_powerLash","targetVagina","targetWearsLowerbody","ttBentOver"
		]),
		weight : Text.Weights.high,
		hitfx : ["whip"]
	},


	// mq00_ward_boss
	{ text : "%S casts a ward on %T.",
		 conditions : baseCond.concat("action_mq00_ward_boss"),
		 hitfx : ['bolster']
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
	{ text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast!",
		armor_slot : "upperbody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast, jiggling it around in %This %TclothUpper!",
		armor_slot : "upperbody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperbodyStretchy"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S throws a punch at %T's %groin!",
		armor_slot : "lowerbody",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetNotBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S grabs a hold of %T's nipples through %This %TclothUpper, giving them both a painful twist while tugging them out!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetBreasts","targetUpperbodyNotHard","targetWearsUpperbody"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S grabs a hold of %T's %groin, painfully squeezing between %This legs!",
		conditions : humOnHumCond.concat([
			"action_lowBlow","targetLowerbodyNotHard","targetWearsLowerbody",
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S catches %T unaware, throwing a hard punch at its weak spot!",
		conditions : baseCond.concat([
			"action_lowBlow","targetBeast"
		]),
		hitfx : ["punch"]
	},









	// PLAYER CLASS ACTIONS


	// WARRIOR
	// warrior_viceGrip
	{ text : "%S grabs a firm hold of %T's %Tgroin and squeezes down hard!",
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
	{ text : "%S grabs a firm hold of %T's %leftright %Tbreast and squeezes down hard!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetBreasts"
		]),
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of %T's %Tpenis and firmly squeezes down on it!",
		conditions : humOnHumCond.concat([
			"action_warrior_viceGrip","targetPenis",
			{conditions:[
				"targetGroinExposed","targetNoLowerbody"
			]}
		]),
		weight : Text.Weights.high,
		hitfx : ["squeeze"]
		
	},
	{ text : "%S grabs a firm hold of %T's %Tbutt and squeezes down firmly!",
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
	{ text : "%S grabs a firm hold of one of %T and %T2's %Tbreasts each and squeezes down hard!",
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
	{ text : "%S counters %T with a rapid jab to %This %Tbsize %leftright %Tbreast!",
		armor_slot : "upperbody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetBreasts"
		]),
		hitfx : ["punch"],
	},
	{ text : "%S counters %T with a rapid jab to the %groin!",
		armor_slot : "lowerbody",
		conditions : humOnHumCond.concat([
			"action_warrior_revenge","targetNotBeast"
		]),
		hitfx : ["punch"],
	},
	{ text : "%S counters %T with a rapid jab at %This %Trsize %leftright buttcheeck!",
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
			"action_rogue_exploit","targetWearsUpperbody","targetWearsLowerbody"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S exploits an opening in %T's defenses, throwing a powerful punch at %Thim!",
		conditions : baseCond.concat([
			"action_rogue_exploit","targetBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S slips some fingers up %T's %Tvagina, wiggling them around briefly!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetNoLowerbody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs, tickling %This clit!",
		conditions : humOnHumCond.concat([
			"action_rogue_exploit","targetGroinExposed","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S slips %Shis hand between %T's legs and grabs a hold of %T's %Tpsize %Tpenis, giving it a couple of rapid tugs!",
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
	{ text : "%S exploits an opening in %T's defenses, grabs a hold of and jiggles %This %Tbsize exposed %Tbreasts around!",
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
	{ text : "%S distracts %T and sneaks behind %Thim, throwing a powerful slap across %T's %Trsize %Tbutt!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetNotBeast"
		]),
		hitfx : ["punch"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and a finger down %This buttcrack, tickling at %This rear!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerbody"
		]),
		hitfx : ["tickle"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and grabs a hold of %This %Tpsize %Tpenis, rubbing the glans with %Shis index finger!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerbody","targetPenis"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and rubs %This clit!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerbody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping a hand into %T's %TclothLower and wiggles %Shis long finger up inside %T's %Tvagina!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsLowerbody","targetVagina"
		]),
		hitfx : ["squishTiny"]
	},
	{ text : "%S distracts %T, slipping both hands into %T's %TclothUpper and massages %This %Tnipples!",
		conditions : humOnHumCond.concat([
			"action_rogue_dirtyTricks","targetWearsUpperbody","targetBreasts"
		]),
		hitfx : ["squeeze"]
	},
	{ text : "%S shoves %T from behind. As %T stumbles forward, %S slips %Shis hand between %T's legs and slides %Shis fingers across %This %groin and %Tbutt!",
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
	{ text : "Divine magic wraps around %T's %Tpsize %Tpenis!",
		conditions : anyOnHumCond.concat([
			"action_cleric_chastise","targetPenis"
		]),
		hitfx : ["chastise"]
	},
	{ text : "%T's %Tvagina tingles as divine magic flows across it!",
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
	{ text : "%S summons a tentacle behind %T whacking across %This %Trsize %Tbutt!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, slapping up across %This %groin!",
		armor_slot : "lowerbody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, giving %This %Tpsize %Tpenis a couple of lashes!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetNoLowerbody"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle behind %T, lashing across %This %Trsize %leftright buttcheek!",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip",
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, lashing across %This %Tbsize %leftright %Tbreast!",
		armor_slot : "upperbody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperbodyHard"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle near %T, giving a jiggling lash across %This %Tbsize %leftright %Tbreast!",
		armor_slot : "upperbody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetBreasts","targetUpperbodyNotHard"
		]),
		hitfx : ["tentacleWhip"]
	},
	{ text : "%S summons a slimy tentacle beneath %T, smacking %This %Tpsize %Tpenis around!",
		armor_slot : "lowerbody",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_tentacleWhip","targetPenis","targetLowerbodyNotHard"
		]),
		hitfx : ["tentacleWhip"]
	},



	// action_tentaclemancer_corruptingOoze
	{ text : "%S flings a purple bolt of sludge at %T, coating %This body!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze","targetNoLowerbody","targetNoUpperbody"
		]),
		hitfx : ["sludgeBoltPurple"] // 
	},
	{ text : "%S flings a purple bolt of sludge at %T, slipping into %This outfit!",
		conditions : baseCond.concat([
			"action_tentaclemancer_corruptingOoze",
			{conditions:[
				"targetWearsLowerbody","targetWearsUpperbody"
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
	{ text : "The living ooze attached to %T protrudes into %This %Tbutt, causing a warm sensation as it wiggles and bubbles inside! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption",
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T protrudes into %This %Tvagina, causing a warm sensation as it wriggles and bubbles inside %Thim! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetVagina"
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T wraps around %This %Tpenis, causing a warm sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : anyOnHumCond.concat([
			"action_tentaclemancer_siphonCorruption","targetPenis"
		]),
		hitfx : ['siphonCorruption'],
	},
	{ text : "The living ooze attached to %T wraps around %This nipples, causing a tingling senation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
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
		armor_slot : "lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		audiokits : ["monkKick"],
		hitfx : ["punch"],
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and swipes %Shis palm right across %T's %groin!",
		armor_slot : "lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and smacks %Shis palm right across %T's %Trsize %Tbutt!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast"
		],
		hitfx : ["slap"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, forcing %Shis hand between %T's legs, rapidly rubbing %This %Tvagina!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina"
		],
		hitfx : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, grabbing a hold of and squeezing %This package!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetPenis","targetLowerbodyNotHard"
		],
		hitfx : ["squeeze"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and thrusts a few fingers inside %T's %Tvagina, briefly wiggling them around!",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderNotBeast","targetVagina","targetNoLowerbody"
		],
		hitfx : ["squishTiny"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S ducks under and lashes %T's exposed %groin with a tentacle!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles"
		],
		hitfx : ["tentacleWhip"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %Tbutt!",
		armor_slot : "lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"]
	},
	{ text : "%T spins around, attempting a rapid kick at %S. But %S slips between %This legs and pinches %This %Tgroin!",
		armor_slot : "lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderIsTentacrab"
		],
		hitfx : ["pinch"]
	},

	{ text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's exposed %Tvagina!",
		"armor_slot":"lowerbody",
		conditions : [
			"actionHit","eventIsRiposte","action_monk_roundKick","senderHasTentacles","targetNoLowerbody","targetVagina"
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
	{ text : "%S sends a chilling blast across %T's %Tbreasts, hardening %This nipples!",
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
	{ text : "%S summons a cold water spout beneath %T, splashing up against %This %Tgroin!",
		conditions : anyOnHumCond.concat(["action_elementalist_waterSpout",]),
		hitfx : ["waterSpout"]
	},
















	// FOOD
	{ text : "%S eats a razzyberry.",
		conditions : baseCond.concat("action_food_razzyberry"),
		hitfx : ["razzyberry"]
	},
	
];

export default lib;