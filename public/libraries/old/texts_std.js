import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import Asset from '../classes/Asset.js';
import T from './stdTag.js';


// Helper list for soundkits
const commonSounds = {
	slapGeneric : 'slapGeneric',
	punchGeneric : 'punchGeneric',
	whipGeneric : 'whipGeneric',
	squeezeGeneric : 'squeezeGeneric',
	slowThrusts : 'slowThrusts',
};

const out = [];


// Auto texts
// Turn change
out.push({
	text : "%T's turn!",
	conditions : [
		{type:Condition.Types.event, data:{event:GameEvent.Types.turnChanged}}
	],
	soundkits : 'turnChanged',
	alwaysAuto : true,
	alwaysOutput : true,
});

out.push({
	text : "Battle Started!",
	soundkits : 'battleStart',
	conditions : [
		{type:Condition.Types.event, data:{event:GameEvent.Types.battleStarted}}
	],
	alwaysAuto : true,
});

out.push({
	text : "The battle has finished...",
	soundkits : 'battleFinished',
	conditions : [
		{type:Condition.Types.event, data:{event:GameEvent.Types.battleEnded}}
	],
	alwaysAuto : true,
});

// Defeat text
out.push({
	alwaysAuto : true,
	text : "%T was defeated!",
	soundkits : 'knockout',
	conditions : [
		{type:Condition.Types.event, data:{event:GameEvent.Types.playerDefeated}}
	],
});

// Generic miss text
out.push({
	text : "%S tries to use %action on %T, but fails!",
	soundkits : 'spellFail',
	conditions : [
		"actionResist"
	],
});


// Diminishing returns resist
out.push({
	text : "%S resisted the stun portion of the attack!",
	soundkits : 'spellFail',
	conditions : [
		"eventIsDiminishingResist",
		"wrapperIsStun"
	]
});


// == Action texts begin == 
let actionCond; 








// == stdAttack == 
actionCond = {type : Condition.Types.actionLabel, data:{label:'stdAttack'}, targnr:0};
	out.push({
		text : "%S throws a punch at %T!",
		soundkits : 'punchGeneric',
		conditions : [
			"actionHit",
			"eventIsActionUsed",
			actionCond,
			"senderNotBeast"
		]
	});


	out.push({
		text : "%S slaps %T's %Tbutt, jiggling %This buttcheeks around!",
		soundkits : 'slapGeneric',
		conditions : ["senderNotBeast","targetNotBeast","actionHit","eventIsActionUsed",actionCond, "targetButtLarge"]
	});

	out.push({
		text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %Tbreasts!",
		soundkits : 'slapGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat([actionCond,"targetBreasts","targetKnockedDownBack","targetTaller",["targetUpperbodyNotHard","targetNoUpperbody"]])
	});

	out.push({
		text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %Tbutt!",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver,T.ttBentOverTable],
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond,"roomTable")
	});

	out.push({
		text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes down hard!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond)
	});

	out.push({
		text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "targetLowerbodyHard")
	});
	out.push({
		text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "targetUpperbodyHard")
	});





	// Tentacles
	out.push({
		text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetBreasts","targetUpperbodyNotHard"]
	});
	out.push({
		text : "%S slips a couple of tendrils around %T's exposed %Tbreasts, firmly squeezing them!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetBreasts","targetNoUpperbody"]
	});
	out.push({
		text : "%S lashes %T's %Trsize %Tbutt with a tentacle!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles"]
	});
	out.push({
		text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		audiokits : 'tentacleWhip',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles"]
	});
	out.push({
		text : "%S slips two tendrils up between %T's legs, slipping part-way inside %This %Tvagina and stretching at it!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles", "targetVagina",{conditions:["targetNoLowerbody","ttGroinExposed"]}]
	});
	out.push({
		text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		audiokits : 'tentacleStretch',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles",  "ttWedgie","targetWearsLowerbody"]
	});
	out.push({
		text : "Two of %S's tentacles wrap around %T's %Tbsize %Tbreasts, squeezing down firmly!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetUpperbodyNotHard", "targetBreasts")
	});
	out.push({
		text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.upperbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetUpperbodyHard", "targetBreasts")
	});
	out.push({
		text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetLowerbodyHard")
	});
	out.push({
		text : "%S flicks %T's %Tgroin with a small tentacle, lashing the front of %This %TclothLower around!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetLowerbodyNotHard", "targetWearsLowerbody", "targetPenis")
	});
	out.push({
		text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetLowerbodyNotHard", "targetWearsLowerbody", "targetPenis")
	});
	out.push({
		text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %Tpenis before constricting %This package!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetWearsLowerbody", "targetPenis")
	});
	out.push({
		text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %Tpenis and constricting it!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", "targetWearsLowerbody", "targetPenis")
	});
	
	out.push({
		text : "%S smacks %T's %Tpsize exposed %Tpenis with a tentacle!",
		audiokits : 'tentacleWhip',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", {conditions:["targetNoLowerbody","ttGroinExposed"]}, "targetPenis")
	});
	




	// Whip prop
	out.push({
		text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %Tbutt!",
		soundkits : commonSounds.whipGeneric,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip" ]
	});
	out.push({
		text : "%S swings %Shis %Sgear at %T, whapping the %Trace's %leftright buttcheek!",
		soundkits : commonSounds.whipGeneric,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip" ]
	});
	out.push({
		text : "%S swings %Shis %Sgear at %T, flicking against %This chest!",
		soundkits : commonSounds.whipGeneric,
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip" ]
	});
	
	out.push({
		text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %Tbreasts!",
		soundkits : 'stretchGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip", "targetBreasts","targetUpperbodyNotHard"]
	});
	out.push({
		text : "%S takes advantate of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %Tbutt!",
		soundkits : 'whipDouble',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip", "targetKnockedDownFront"]
	});

	out.push({
		text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %Tbutt!",
		soundkits : commonSounds.whipGeneric,
		turnTags : [T.ttBentOver],
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "ttBentOver", "senderHasWhip")
	});






















// == stdArouse == 
	actionCond = {type : Condition.Types.actionLabel, data:{label:'stdArouse'}, targnr:0};
	out.push({
		text : "%S tickles %T!",
		soundkits : 'tickleGeneric', 
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderBeast"]
	});
	out.push({
		text : "%S tickles %T!",
		soundkits : 'tickleGeneric',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"targetBeast"]
	});

	out.push({
		text : "%S grabs a hold of and rubs %T's %Tbutt!",
		soundkits : 'squeezeGeneric',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"targetNotBeast","senderNotBeast"]
	});
	out.push({
		text : "%S slips %Shis hand between %T's legs and rubs %This %Tgroin!",
		soundkits : 'squeezeGeneric',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"targetNotBeast","senderNotBeast"]
	});
	out.push({
		text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %Tbreasts!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond,"targetBreasts","senderNotBeast","targetUpperbodyNotHard")
	});
	out.push({
		text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond,"targetBreasts","senderNotBeast","targetUpperbodyHard")
	});
	out.push({
		text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %Tbreasts!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"targetBreasts","senderNotBeast","targetKnockedDownFront","targetTaller",]
	});
	out.push({
		text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbreasts before jiggling them around!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"targetBreasts","senderNotBeast","targetKnockedDownBack","targetTaller",["targetUpperbodyNotHard","targetNoUpperbody"]]
	});
	out.push({
		text : "%S jumps onto the knocked down %Trace's back, squeezes a firm hold of %T's %Trsize buttcheeks and jiggles them around!",
		soundkits : 'squeezeGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderNotBeast","targetKnockedDownFront","targetTaller",["targetWearsThong", "targetNoLowerbody"]]
	});
	out.push({
		text: "%S reaches down towards %T's bulge and teasingly squeezes it!",
		soundkits : 'squeezeGeneric',
		conditions: ["targetNotBeast","actionHit","eventIsActionUsed",actionCond, "targetWearsLowerbody","senderNotBeast","targetPenis"]
	});

	out.push({
		text : "%S spots %T bent over and fondles %This %Tgroin!",
		soundkits : commonSounds.whipGeneric,
		turnTags : [T.ttBentOver],
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "ttBentOver")
	});

	out.push({
		text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Tvagina, landing a %couple of thrusts!",
		soundkits : commonSounds.slowThrusts,
		turnTags : [T.ttBentOver],
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "ttBentOver", "targetVagina", "senderPenis", "targetNoLowerbody", "senderNoLowerbody")
	});
	out.push({
		text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Trsize %Tbutt, landing a %couple of thrusts!",
		soundkits : commonSounds.slowThrusts,
		turnTags : [T.ttBentOver],
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed","senderNotBeast"].concat(actionCond, "ttBentOver", "senderPenis", "targetNoLowerbody", "senderNoLowerbody")
	});


	// Tentacles
	out.push({
		text : "%S slips a couple of tendrils up between %T's legs, rubbing across %This %groin!",
		audiokits : 'squishTiny',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetNotBeast"]
	});
	out.push({
		text : "%S slips a tendril up between %T's buttcheeks, tickling between them!",
		audiokits : 'squishLong',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetNotBeast",["targetWearsThong","targetNoLowerbody","ttButtExposed"]]
	});
	out.push({
		text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tvagina and thrusting a couple of times!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetNotBeast","targetVagina",["targetNoLowerbody","ttGroinExposed"]]
	});
	out.push({
		text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %Tvagina, and the other into %This %Trsize %Tbutt. Pumping rythmically in and out of %T!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetNotBeast","targetVagina","targetNoLowerbody"]
	});
	out.push({
		text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tbutt where it thrusts a couple of times!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetNotBeast",["targetNoLowerbody","ttButtExposed"]]
	});
	
	out.push({
		text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %Tvagina!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetLegsSpread",["targetNoLowerbody","ttGroinExposed"],"targetVagina"]
	});
	out.push({
		text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %Tvagina, rapidly thrusting inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetLegsSpread","targetWearsThong","targetVagina"]
	});
	out.push({
		text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %Tbutt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetLegsSpread","targetKnockedDownFront",["targetNoLowerbody","ttButtExposed"],"targetVagina"]
	});
	out.push({
		text : "%S takes advantage of %T being knocked down and surprises %Thim with a slimy cock-tipped tentacle slipping inside %This mouth, squirming around and tickling %This cheeks!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetLegsSpread","targetKnockedDownFront","targetNotBeast"]
	});
	out.push({
		text : "%S surprises %T with a thick tentacle shoved into %This mouth! The tentacle thrusts a couple of times, leaving a gooey residue behind.",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles"]
	});
	out.push({
		text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %Tbutt and lands some rapid thrusts, making %This %Tbutt somewhat sticky!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetWearsLowerbody"]
	});
	out.push({
		text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %Tvagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetWearsLowerbody","targetVagina"]
	});
	out.push({
		text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %Tvagina and lands some rapid thrusts inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetWearsThong","targetVagina","targetLowerbodyNotHard"]
	});
	out.push({
		text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetWearsLowerbody","targetWearsThong"]
	});
	out.push({
		text : "%S pushes a thick tentacke up between %T's buttcheeks, giving %This rear some rapid prods through %This buttstring!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond,"senderHasTentacles","targetWearsLowerbody","targetWearsThong","ttButtNotExposed")
	});
	out.push({
		text : "%S latches a thick tentacke with suction cups onto %T's %Tgroin and performs a few rapid tugs and prods at %This %TclothLower!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond,"senderHasTentacles","targetWearsLowerbody","targetWearsThong","ttButtNotExposed")
	});
	out.push({
		text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		audiokits : 'gooRub',
		conditions : ["actionHit","eventIsActionUsed",actionCond,"senderHasTentacles","targetWearsLowerbody","ttPussyWedgie"]
	});
	out.push({
		text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %Tvagina and leaving a little slimy residue behind!",
		audiokits : 'gooRub',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasTentacles",  "ttPussyWedgie","targetWearsLowerbody"]
	});

	out.push({
		text : "%S wraps a tentacle around %T's %Tpsize %Tpenis, allowing a small tendril to slip under %This foreskin, tickling the tip of %This %Tpenis!",
		audiokits : 'tentacleTwist',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed"].concat(actionCond, "senderHasTentacles", {conditions:["targetNoLowerbody","ttGroinExposed"]}, "targetPenis", "targetNotCircumcised")
	});


	// Whip prop
	out.push({
		text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %Tgroin!",
		soundkits : 'stretchGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip", "targetVagina","targetNotKnockedDown"]
	});
	out.push({
		text : "%S slips %Shis %Sgear between %T's buttcheeks, grinding it back and fort!",
		soundkits : 'stretchGeneric',
		conditions : ["targetNotBeast","actionHit","eventIsActionUsed",actionCond,"senderHasWhip", "targetVagina",{conditions:["targetWearsThong","targetNoLowerbody"]}]
	});
	




export default out;