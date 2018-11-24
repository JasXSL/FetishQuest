import Text from '../classes/Text.js';
import libCond from './conditions.js';
const C = libCond;
import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import audioKits from './audioKits.js';
import Asset from '../classes/Asset.js';
import T from './stdTag.js';

const cAND = (...args) => ConditionPackage.buildAND(...args);
const cOR =  (...args) => ConditionPackage.buildOR(...args);

// Helper list for soundkits
const commonSounds = {
	slapGeneric : 'slapGeneric',
	punchGeneric : 'punchGeneric',
	whipGeneric : 'whipGeneric',
	squeezeGeneric : 'squeezeGeneric',
	slowThrusts : 'slowThrusts',
};

const out = [];
// Humanoid attacker/victim conditions
const humanAVConds = [
	C.targetNotBeast,
	C.actionHit,
	C.eventIsActionUsed,
	C.senderNotBeast,
];
// Humanoid victim conditions
const humanVConds = [
	C.targetNotBeast,
	C.actionHit,
	C.eventIsActionUsed,
];

// Auto texts
// Turn change
out.push(new Text({
	text : "%T's turn!",
	conditions : [
		new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.turnChanged}})
	],
	soundkits : 'turnChanged',
	alwaysAuto : true,
	alwaysOutput : true,
}));

out.push(new Text({
	text : "Battle Started!",
	soundkits : 'battleStart',
	conditions : [
		new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.battleStarted}})
	],
	alwaysAuto : true,
}));

out.push(new Text({
	text : "The battle has finished...",
	soundkits : 'battleFinished',
	conditions : [
		new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.battleEnded}})
	],
	alwaysAuto : true,
}));

// Defeat text
out.push(new Text({
	alwaysAuto : true,
	text : "%T was defeated!",
	soundkits : 'knockout',
	conditions : [
		new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.playerDefeated}})
	],
}));

// Generic miss text
out.push(new Text({
	text : "%S tries to use %action on %T, but fails!",
	soundkits : 'spellFail',
	conditions : [
		libCond.actionResist
	],
}));


// Diminishing returns resist
out.push(new Text({
	text : "%S resisted the stun portion of the attack!",
	soundkits : 'spellFail',
	conditions : [
		libCond.eventIsDiminishingResist,
		libCond.wrapperIsStun
	]
}));


// == Action texts begin == 
let actionCond; 








// == stdAttack == 
actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'stdAttack'}, targnr:0});
	out.push(new Text({
		text : "%S throws a punch at %T!",
		soundkits : 'punchGeneric',
		conditions : [
			libCond.actionHit,
			libCond.eventIsActionUsed,
			actionCond,
			libCond.senderNotBeast
		]
	}));


	out.push(new Text({
		text : "%S slaps %T's %Tbutt, jiggling %This buttcheeks around!",
		soundkits : 'slapGeneric',
		conditions : [libCond.senderNotBeast,libCond.targetNotBeast,libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetButtLarge]
	}));

	out.push(new Text({
		text : "%S jumps onto the knocked down %Trace's stomach, throwing two rapid slaps across %T's %Tbsize %Tbreasts!",
		soundkits : 'slapGeneric',
		conditions : humanAVConds.concat([actionCond,C.targetBreasts,C.targetKnockedDownBack,C.targetTaller,[C.targetUpperbodyNotHard,C.targetNoUpperbody]])
	}));

	out.push(new Text({
		text : "%S shoves %T from behind, bending %Thim over a table before slapping %This %Trsize %Tbutt!",
		soundkits : 'slapGeneric',
		turnTags : [T.ttBentOver,T.ttBentOverTable],
		conditions : humanAVConds.concat(actionCond,C.roomTable)
	}));

	out.push(new Text({
		text : "%S grabs a hold of %T's %Trsize buttcheeks and squeezes down hard!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));

	out.push(new Text({
		text : "%S throws at punch at the front of %T's %TclothLower, most of the impact being absorbed by the piece.",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : humanAVConds.concat(actionCond, C.targetLowerbodyHard)
	}));
	out.push(new Text({
		text : "%S throws at punch at the front of %T's %TclothUpper, most of the impact being absorbed by the piece.",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : humanAVConds.concat(actionCond, C.targetUpperbodyHard)
	}));





	// Tentacles
	out.push(new Text({
		text : "%S lashes tentacles around %T's nipples, tugging outwards!",
		audiokits : 'tentacleTwist',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S slips a couple of tendrils around %T's exposed %Tbreasts, firmly squeezing them!",
		audiokits : 'tentacleTwist',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetBreasts,C.targetNoUpperbody]
	}));
	out.push(new Text({
		text : "%S lashes %T's %Trsize %Tbutt with a tentacle!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles]
	}));
	out.push(new Text({
		text : "%S lashes %T's %leftright buttcheek with a tentacle!",
		audiokits : 'tentacleWhip',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles]
	}));
	out.push(new Text({
		text : "%S slips two tendrils up between %T's legs, slipping part-way inside %This %Tvagina and stretching at it!",
		audiokits : 'tentacleTwist',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles, C.targetVagina,cOR(C.targetNoLowerbody,C.ttGroinExposed)]
	}));
	out.push(new Text({
		text : "%S wraps tentacles around %T's ankles and begins spreading %This legs, further stretching at %This %TclothLower!",
		audiokits : 'tentacleStretch',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,  C.ttWedgie,C.targetWearsLowerbody]
	}));
	out.push(new Text({
		text : "Two of %S's tentacles wrap around %T's %Tbsize %Tbreasts, squeezing down firmly!",
		audiokits : 'tentacleTwist',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetUpperbodyNotHard, C.targetBreasts)
	}));
	out.push(new Text({
		text : "%S lashes a thick tentacle across the front of %T's %TclothUpper, most of the impact being absorbed by the armor!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.upperbody,
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetUpperbodyHard, C.targetBreasts)
	}));
	out.push(new Text({
		text : "%S lashes a thick tentacle across the front of %T's %TclothLower, most of the impact being absorbed by the armor!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetLowerbodyHard)
	}));
	out.push(new Text({
		text : "%S flicks %T's %Tgroin with a small tentacle, lashing the front of %This %TclothLower around!",
		audiokits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetLowerbodyNotHard, C.targetWearsLowerbody, C.targetPenis)
	}));
	out.push(new Text({
		text : "%S slithers a tendril around the front of %T's %TclothLower, constricting around %This package!",
		audiokits : 'tentacleTwist',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetLowerbodyNotHard, C.targetWearsLowerbody, C.targetPenis)
	}));
	out.push(new Text({
		text : "%S slithers a tendril inside %T's %TclothLower, slithering down beneath %This balls and up over %This %Tpenis before constricting %This package!",
		audiokits : 'tentacleTwist',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetWearsLowerbody, C.targetPenis)
	}));
	out.push(new Text({
		text : "%S slithers a tendril inside %T's %TclothLower, coiling around %This %Tpenis and constricting it!",
		audiokits : 'tentacleTwist',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, C.targetWearsLowerbody, C.targetPenis)
	}));
	
	out.push(new Text({
		text : "%S smacks %T's %Tpsize exposed %Tpenis with a tentacle!",
		audiokits : 'tentacleWhip',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, cOR(C.targetNoLowerbody,C.ttGroinExposed), C.targetPenis)
	}));
	




	// Whip prop
	out.push(new Text({
		text : "%S swings %Shis %Sgear at %T, whapping the %Trace across the %Tbutt!",
		soundkits : commonSounds.whipGeneric,
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip ]
	}));
	out.push(new Text({
		text : "%S swings %Shis %Sgear at %T, whapping the %Trace's %leftright buttcheek!",
		soundkits : commonSounds.whipGeneric,
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip ]
	}));
	out.push(new Text({
		text : "%S swings %Shis %Sgear at %T, flicking against %This chest!",
		soundkits : commonSounds.whipGeneric,
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip ]
	}));
	
	out.push(new Text({
		text : "%S wraps %Shis %Sgear around %T's chest, chafing into the %Trace's %Tbreasts!",
		soundkits : 'stretchGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip, C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S takes advantate of %T being knocked on their belly, lashing %Shis %Sgear multiple times across %T's %Tbutt!",
		soundkits : 'whipDouble',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip, C.targetKnockedDownFront]
	}));

	out.push(new Text({
		text : "%S takes advantage of %T being bent over and lashes %Shis %Sgear across the %Trace's %Trsize %Tbutt!",
		soundkits : commonSounds.whipGeneric,
		turnTags : [T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.ttBentOver, C.senderHasWhip)
	}));






















// == stdArouse == 
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'stdArouse'}, targnr:0});
	out.push(new Text({
		text : "%S tickles %T!",
		soundkits : 'tickleGeneric', 
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderBeast]
	}));
	out.push(new Text({
		text : "%S tickles %T!",
		soundkits : 'tickleGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetBeast]
	}));

	out.push(new Text({
		text : "%S grabs a hold of and rubs %T's %Tbutt!",
		soundkits : 'squeezeGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.senderNotBeast]
	}));
	out.push(new Text({
		text : "%S slips %Shis hand between %T's legs and rubs %This %Tgroin!",
		soundkits : 'squeezeGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.senderNotBeast]
	}));
	out.push(new Text({
		text : "%S pushes %Shis hands against %T's chest and rubs %This %Tbsize %Tbreasts!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond,C.targetBreasts,C.senderNotBeast,C.targetUpperbodyNotHard)
	}));
	out.push(new Text({
		text : "%S pushes %Shis hands against %T's chest and rubs the front of %This %TclothUpper!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond,C.targetBreasts,C.senderNotBeast,C.targetUpperbodyHard)
	}));
	out.push(new Text({
		text : "%S jumps onto the knocked down %Trace's back, reaching around %T's chest and rubs %This %Tbsize %Tbreasts!",
		soundkits : 'squeezeGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.targetBreasts,C.senderNotBeast,C.targetKnockedDownFront,C.targetTaller,]
	}));
	out.push(new Text({
		text : "%S jumps onto the knocked down %Trace's stomach, grabbing a firm hold of %T's %Tbreasts before jiggling them around!",
		soundkits : 'squeezeGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.targetBreasts,C.senderNotBeast,C.targetKnockedDownBack,C.targetTaller,[C.targetUpperbodyNotHard,C.targetNoUpperbody]]
	}));
	out.push(new Text({
		text : "%S jumps onto the knocked down %Trace's back, squeezes a firm hold of %T's %Trsize buttcheeks and jiggles them around!",
		soundkits : 'squeezeGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderNotBeast,C.targetKnockedDownFront,C.targetTaller,[C.targetWearsThong, C.targetNoLowerbody]]
	}));
	out.push(new Text({
		text: "%S reaches down towards %T's bulge and teasingly squeezes it!",
		soundkits : 'squeezeGeneric',
		conditions: [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsLowerbody,C.senderNotBeast,C.targetPenis]
	}));

	out.push(new Text({
		text : "%S spots %T bent over and fondles %This %Tgroin!",
		soundkits : commonSounds.whipGeneric,
		turnTags : [T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.ttBentOver)
	}));

	out.push(new Text({
		text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Tvagina, landing a %couple of thrusts!",
		soundkits : commonSounds.slowThrusts,
		turnTags : [T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.ttBentOver, C.targetVagina, C.senderPenis, C.targetNoLowerbody, C.senderNoLowerbody)
	}));
	out.push(new Text({
		text : "%S walks up to the bent over %Trace and shoves %Shis %Spsize %Spenis inside %T's %Trsize %Tbutt, landing a %couple of thrusts!",
		soundkits : commonSounds.slowThrusts,
		turnTags : [T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.ttBentOver, C.senderPenis, C.targetNoLowerbody, C.senderNoLowerbody)
	}));


	// Tentacles
	out.push(new Text({
		text : "%S slips a couple of tendrils up between %T's legs, rubbing across %This %groin!",
		audiokits : 'squishTiny',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S slips a tendril up between %T's buttcheeks, tickling between them!",
		audiokits : 'squishLong',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetNotBeast,[C.targetWearsThong,C.targetNoLowerbody,C.ttButtExposed]]
	}));
	out.push(new Text({
		text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tvagina and thrusting a couple of times!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetNotBeast,C.targetVagina,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));
	out.push(new Text({
		text : "%S thrusts two tentacles up between %T's legs, forcing one inside %This %Tvagina, and the other into %This %Trsize %Tbutt. Pumping rythmically in and out of %T!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetNotBeast,C.targetVagina,C.targetNoLowerbody]
	}));
	out.push(new Text({
		text : "%S slips a cock-tipped tentacle up between %T's legs, forcing it into %This %Tbutt where it thrusts a couple of times!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetNotBeast,[C.targetNoLowerbody,C.ttButtExposed]]
	}));
	
	out.push(new Text({
		text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle plunges inside and starts rapidly thrusting into %This %Tvagina!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetLegsSpread,[C.targetNoLowerbody,C.ttGroinExposed],C.targetVagina]
	}));
	out.push(new Text({
		text : "%S slips a slimy cock-tipped tentacle towards %T's exposed %groin. The tentacle wiggles inside %This %TclothLower and up %This %Tvagina, rapidly thrusting inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetLegsSpread,C.targetWearsThong,C.targetVagina]
	}));
	out.push(new Text({
		text : "%S slips a slimy cock-tipped tentacle towards %T's %Trsize exposed %Tbutt. The tentacle wiggles inside and starts rapidly thrusting inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetLegsSpread,C.targetKnockedDownFront,[C.targetNoLowerbody,C.ttButtExposed],C.targetVagina]
	}));
	out.push(new Text({
		text : "%S takes advantage of %T being knocked down and surprises %Thim with a slimy cock-tipped tentacle slipping inside %This mouth, squirming around and tickling %This cheeks!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetLegsSpread,C.targetKnockedDownFront,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S surprises %T with a thick tentacle shoved into %This mouth! The tentacle thrusts a couple of times, leaving a gooey residue behind.",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles]
	}));
	out.push(new Text({
		text : "%S slips a gooey tentacle into %T's %TclothLower! The tentacle pushes its way into %This %Tbsize %Tbutt and lands some rapid thrusts, making %This %Tbutt somewhat sticky!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetWearsLowerbody]
	}));
	out.push(new Text({
		text : "%S slips a thick gooey tendril into %T's %TclothLower! The tentacle pushes its way into %This %Tvagina and lands some rapid thrusts, leaving a sticky liquid behind!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetWearsLowerbody,C.targetVagina]
	}));
	out.push(new Text({
		text : "One of %S's small tentacles loop around the bottom of %T's %TclothLower and tugs it aside. Before %T can react, a thick and slimy tentacle pushes inside %This %Tvagina and lands some rapid thrusts inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetWearsThong,C.targetVagina,C.targetLowerbodyNotHard]
	}));
	out.push(new Text({
		text : "%S slithers a gooey tentacle around %T's butt-string and pushes inside %Thim, landing some rapid thrusts and leaving a slippery substance behind!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetWearsLowerbody,C.targetWearsThong]
	}));
	out.push(new Text({
		text : "%S pushes a thick tentacke up between %T's buttcheeks, giving %This rear some rapid prods through %This buttstring!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : humanVConds.concat(actionCond,C.senderHasTentacles,C.targetWearsLowerbody,C.targetWearsThong,C.ttButtNotExposed)
	}));
	out.push(new Text({
		text : "%S latches a thick tentacke with suction cups onto %T's %Tgroin and performs a few rapid tugs and prods at %This %TclothLower!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : humanVConds.concat(actionCond,C.senderHasTentacles,C.targetWearsLowerbody,C.targetWearsThong,C.ttButtNotExposed)
	}));
	out.push(new Text({
		text : "%S takes advantage of %T's frontal wedgie and slips a flat tentacle with wiggly nubs between %This legs, pushing it up against %This %groin where it intensely tickles %T's exposed mound!",
		audiokits : 'gooRub',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,C.targetWearsLowerbody,C.ttPussyWedgie]
	}));
	out.push(new Text({
		text : "%S slips small tendrils between %T's legs, rapidly tickling the exposed sides of %This %Tvagina and leaving a little slimy residue behind!",
		audiokits : 'gooRub',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasTentacles,  C.ttPussyWedgie,C.targetWearsLowerbody]
	}));

	out.push(new Text({
		text : "%S wraps a tentacle around %T's %Tpsize %Tpenis, allowing a small tendril to slip under %This foreskin, tickling the tip of %This %Tpenis!",
		audiokits : 'tentacleTwist',
		conditions : humanVConds.concat(actionCond, C.senderHasTentacles, cOR(C.targetNoLowerbody,C.ttGroinExposed), C.targetPenis, C.targetNotCircumcised)
	}));


	// Whip prop
	out.push(new Text({
		text : "%S slips %Shis %Sgear between %T's legs, grinding it back and fort across the %Trace's %Tgroin!",
		soundkits : 'stretchGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip, C.targetVagina,C.targetNotKnockedDown]
	}));
	out.push(new Text({
		text : "%S slips %Shis %Sgear between %T's buttcheeks, grinding it back and fort!",
		soundkits : 'stretchGeneric',
		conditions : [C.targetNotBeast,C.actionHit,C.eventIsActionUsed,actionCond,C.senderHasWhip, C.targetVagina,cOR(C.targetWearsThong,C.targetNoLowerbody)]
	}));
	




export default out;