import Text from '../classes/Text.js';
import libCond from './conditions.js';
const C = libCond;
import {default as Condition, ConditionPackage} from '../classes/Condition.js';
import T from './stdTag.js';

const cAND = (...args) => ConditionPackage.buildAND(...args);
const cOR =  (...args) => ConditionPackage.buildOR(...args);

let out = [], actionCond;

// standard texts
import stdt from './texts_std.js';
import punTexts from './texts_punishments.js';
import Asset from '../classes/Asset.js';
out = out.concat(stdt, punTexts);
const humanAVConds = [
	C.targetNotBeast,
	C.actionHit,
	C.eventIsActionUsed,
	C.senderNotBeast,
];


// ACTIONS HERE

// == NPC ==

// TENTACLE FIEND
	// tentacle_fiend_tentacleMilker
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentacle_fiend_tentacleMilker'}, targnr:0});
	out.push(new Text({
		text : "%S slips suction cup tipped tentacles inside %T's %TclothUpper, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		audiokits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetWearsUpperbody]
	}));
	out.push(new Text({
		text : "%S assaults %T with suction cup tipped tentacles, latching them onto %This nipples and coating them in a sticky liquid. A few moments later, the tendrils start milking %Thim.",
		audiokits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetNoUpperbody]
	}));
	out.push(new Text({
		text : "%S slips a hollow tentacle inside %T's %TclothLower, enveloping %This %Tpenis and coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		audiokits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetPenis,libCond.targetWearsLowerbody]
	}));
	out.push(new Text({
		text : "%S envelops %T's %Tpenis with a hollow tentacle, coating it in sticky liquid. A few moments later, the tentacle start milking %Thim.",
		audiokits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetPenis,libCond.targetNoLowerbody]
	}));

	// tentacle_fiend_legWrap
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentacle_fiend_legWrap'}, targnr:0});
	out.push(new Text({
		text : "%S hoops tentacles around %T's ankles, pulling %Thim to the ground and spreading %This legs!",
		audiokits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));


	// tentacle_fiend_injectacle
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentacle_fiend_injectacle'}, targnr:0});
	
	out.push(new Text({
		text : "%S's thick tentacle slips into %T's %Tbsize %Tbutt and lands some rapid thrusts before flooding %T's %Tbutt with a sticky liquid!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNoLowerbody]
	}));
	out.push(new Text({
		text : "%S's thick tentacle slips into %T's %Tvagina, landing some rapid thrusts before flooding it with a sticky liquid!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNoLowerbody,C.targetVagina]
	}));
	out.push(new Text({
		text : "Two of %S's tentacles slither up between %T's legs, one pushing into %This %Trsize %Tbutt, the other slightly larger one into %This %Tvagina. The tentacles start thrusting into %T in sync, eventually shooting a sizable amount sticky liquid inside %Thim!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNoLowerbody,C.targetVagina]
	}));
	out.push(new Text({
		text : "%S takes advantage of %T's legs being restrained, shoves a thick tentacle into %This %Tvagina and starts thrusting rapidly. Some time later the tentacle finally slows down, squirting a large enough wad of sticky goo into %T that some of it immediately squirts out!",
		audiokits : 'tentacleMultipleThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNoLowerbody,C.targetVagina,C.targetLegsSpread]
	}));




	// tentacle_fiend_tentatug
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentacle_fiend_tentatug'}, targnr:0});
	out.push(new Text({
		text : "%S latches tentacles onto %T's %TclothLower, tugging at the piece.",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	out.push(new Text({
		text : "%S latches tentacles around the sides of %T's %TclothLower, tugging up and out, giving %T a wedgie!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsLowerbody, C.targetLowerbodyWaistband],
		turnTags : [T.ttWedgie],
	}));
	out.push(new Text({
		text : "%S latches tentacles around the bottom of %T's %TclothLower and give a hard tug down, exposing %This %Tgenitals!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsThong],
		turnTags : [T.ttGroinExposed],
	}));	
	out.push(new Text({
		text : "%S latches tentacles around the back of %T's %TclothLower and tugs down, exposing %This %Tbutt!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetNoBodysuit],
		turnTags : [T.ttButtExposed],
	}));
	out.push(new Text({
		text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, chafing into %This %Tvagina!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsThong,C.targetVagina],
		turnTags : [T.ttPussyWedgie,T.ttWedgie],
	}));
	out.push(new Text({
		text : "%S's tentacles wrap around the front of %T's %TclothLower and rigidly tugs upwards, making %This junk flop free!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsThong,C.targetPenis]
	}));
	out.push(new Text({
		text : "%S's tentacles wrap around the bottom of %T's %TclothLower and tugs down before letting go and allowing the piece to snap onto %T's %groin!",
		audiokits : 'tentacleStretch',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsSlingBikini]
	}));
	out.push(new Text({
		text : "%S's tentacles wrap around the front straps of %T's %TclothLower and tugs back before letting go, allowing the piece to snap painfully onto %T's %Tbsize %Tbreasts!",
		audiokits : 'tentacleStretchWhip',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond, C.targetWearsSlingBikini,C.targetBreasts]
	}));

//	Imp
	// Special Delivery
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'imp_specialDelivery'}, targnr:0});
	out.push(new Text({
		text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed until %She shoots a large squirt of demonic jizz down %T's throat.",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S jumps onto %T's head and shoves %Shis %Spsize %Spenis into %T's mouth, humping at an overwhelming speed! A few moments later, the %Srace pulls out, shooting a long streak of demonic jizz across %T's face.",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S jumps onto %T's head and grabs a firm hold of %This horn and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetHorn]
	}));
	out.push(new Text({
		text : "%S jumps onto %T's head and grabs a firm hold of %This horns and shoves %Shis %Spsize %Spenis in %T's mouth. The small imp starts thrashing the %Spenis around, eventually flooding %T's mouth with a long squirt of demonic jizz!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetHorns]
	}));
	out.push(new Text({
		text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis into %This %Tvagina! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetVagina,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));
	out.push(new Text({
		text : "%S jumps and latches onto %T's %Trsize %Tbutt and shoves %Shis %Spsize %Spenis inside! The %Srace starts rapidly humping, eventually shooting a large squirt of demonic jizz into %T!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,[C.targetNoLowerbody,C.ttButtExposed]]
	}));
	out.push(new Text({
		text : "%S jumps onto %T, latching %Shis legs around the %Trace's chest and grabbing a firm hold of %This nipples, squishing %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts. The %Srace begins rapidly humping, eventually reaching climax, shooting %Shis load into %T's face!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,[C.targetNoUpperbody,C.ttBreastsExposed]]
	}));

	out.push(new Text({
		text : "%S jumps onto the knocked down %Trace slipping %Shis %Spsize %Spenis between %T's %Tbsize %Tbreasts, pushes them together and starts rapidly thrusting. A short while later %S pulls back, shooting a long streak of demonic cum across %T's %Tbreasts!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetKnockedDownBack,C.targetBreasts,[C.targetNoUpperbody,C.ttBreastsExposed]]
	}));
	out.push(new Text({
		text : "%S surprises the knocked down %Trace by squatting near %This face and shoving %Shis %Spsize %Spenis in %This mouth. The %Srace pumps a few times before forcing a large squirt of demon cum inside %T's mouth!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetKnockedDownBack]
	}));
	out.push(new Text({
		text : "%S surprises the knocked down %Trace by lifting %This hips and shoving %Shis %Spsize %Spenis into %This %Tvagina. The %Srace starts humping rapidly, eventually reaching climax and flooding %T with demonic spunk!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetKnockedDownBack,C.targetVagina,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));
	out.push(new Text({
		text : "%S squats by %T's %Trsize %Tbutt and slips %Shis %Spsize %Spenis inside. The %Srace starts humping rapidly, eventually reaching climax and flooding %T's %Tbutt with demonic spunk!",
		soundkits : 'thrustCum',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetKnockedDownFront,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));


	// Blow from Below
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'imp_blowFromBelow'}, targnr:0});
	out.push(new Text({
		text : "%S slips between %T's legs and throws a punch upwards, smacking across %This %groin!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S slips between %T's legs and throws a punch upwards, smacking the %Trace's %Trsize %leftright buttcheek!",
		soundkits : 'punchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S slips between %T's legs and throws a punch at each of the %Trace's %Trsize buttcheeks!",
		soundkits : 'punchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S slips between %T's legs and throws a couple of slaps across the front of %T's %TclothLower around, smacking %This %Tpenis around!",
		soundkits : 'slapGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetPenis,C.targetLowerbodyStretchy]
	}));
	out.push(new Text({
		text : "%S slips between %T's legs and forces %Shis fist up into the %Trace's %Tvagina, thrusting a few times!",
		soundkits : 'slowThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetVagina,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));
	out.push(new Text({
		numTargets : 2,
		text : "%S slips between %T and %T2's legs and forces %Shis fist up into both of their %Tvaginas, thrusting a few times!",
		soundkits : 'slowThrusts',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetVagina,[C.targetNoLowerbody,C.ttGroinExposed]]
	}));
	out.push(new Text({
		numTargets : 2,
		text : "%S slips between %T and %T2's legs and rams %Shis fist into both of their groins!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		numTargets : 2,
		text : "%S slips underneath %T and %T2, giving a hard smack across both of their %Tbutts!",
		soundkits : 'slapGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast, jiggling it around!",
		armor_slot : Asset.Slots.upperbody,
		soundkits : 'punchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast!",
		armor_slot : Asset.Slots.upperbody,
		soundkits : 'punchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,C.targetUpperbodyHard]
	}));
	out.push(new Text({
		text : "%S slips underneath %T and throws a few rapid slaps across %This %Tbreasts!",
		soundkits : 'slapGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S grabs a hold of and spreads %T's legs while %The's still bent over the table, followed briefly by the %Srace ramming %Shis knee up into %T's %Tgroin!",
		soundkits : 'punchGeneric',
		turnTags : [T.ttBentOverTable,T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.ttBentOverTable),
	}));
	out.push(new Text({
		numTargets : 2,
		text : "%S slips underneath %T and throws a punch from below at %T's %Tbsize %leftright %Tbreast and %T2's %T2bsize %T2breast, jiggling them both around!",
		armor_slot : Asset.Slots.upperbody,
		soundkits : 'punchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,C.targetUpperbodyNotHard]
	}));

	// Ankle Bite
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'imp_ankleBite'}, targnr:0});
	out.push(new Text({
		text : "%S jumps at %T's legs and starts chewing on %This ankle!",
		soundkits : 'biteGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));

	// Demonic Pinch
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'imp_demonicPinch'}, targnr:0});
	out.push(new Text({
		text : "%S casts a spell, surprising %T with a demonic pinch to %This %Trsize %leftright buttcheek!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards in %This %TclothLower!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetWearsLowerbody,C.targetPenis,C.targetNotCircumcised]
	}));
	out.push(new Text({
		text : "%S casts a spell. %T suddenly feels something pinch %This foreskin, tugging it forwards and jiggling %This %Tpsize %Tpenis around!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,[C.targetNoLowerbody,C.ttGroinExposed],C.targetPenis,C.targetNotCircumcised]
	}));
	out.push(new Text({
		text : "%S casts a spell, surprising %T with a demonic pinch to %This clit!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetVagina]
	}));
	out.push(new Text({
		text : "%S casts a spell, surprising %T as something suddenly pinches down on %This %leftright nipple!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts]
	}));
	out.push(new Text({
		text : "%S casts a spell, surprising %T as something suddenly pinches down on %This nipples and starts jiggling them around in %This %TclothUpper!",
		soundkits : 'pinchGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNotBeast,C.targetBreasts,C.targetWearsUpperbody]
	}));


//


// WHIPS

	// whip_legLash
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'whip_legLash'}, targnr:0});
	out.push(new Text({
		text : "%S lashes %Shis whip across %T's legs!",
		soundkits : 'whipGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	out.push(new Text({
		text : "%S lashes %Shis whip across %T's %leftright thigh!",
		soundkits : 'whipGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));


	// whip_powerLash
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'whip_powerLash'}, targnr:0});
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tgroin!",
		soundkits : 'whipGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetLowerbodyNotHard]
	}));
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %Tbreasts, whapping them around!",
		soundkits : 'whipGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T, cracking hard across %This %leftright %Tbreast, whapping it around!",
		soundkits : 'whipGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetBreasts,C.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T, cracking multiple times across %This %Tbreasts!",
		soundkits : 'whipDouble',
		armor_slot : Asset.Slots.upperbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetBreasts,C.targetUpperbodyHard]
	}));
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This bulge around!",
		soundkits : 'whipGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetLowerbodyNotHard,C.targetLowerbodyStretchy,C.targetPenis]
	}));
	out.push(new Text({
		text : "%S forcefully swings %Shis %Sgear at %T't %Tgroin, smacking %This %Tpenis around!",
		soundkits : 'whipGeneric',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond,C.targetNoLowerbody,C.targetPenis]
	}));
	out.push(new Text({
		text : "%S surprises %T while %The bent over by lashing %Shis %Sgear from below up across the %Trace's %Tgroin!",
		soundkits : 'whipGeneric',
		turnTags : [T.ttBentOver],
		conditions : humanAVConds.concat(actionCond, C.targetVagina, C.targetWearsLowerbody, C.ttBentOver)
	}));


//

// POTIONS
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'minorHealingPotion'}, targnr:0});
	out.push(new Text({
		text : "%S chugs a small bottle of red liquid!",
		soundkits : 'potionUse',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'healingPotion'}, targnr:0});
	out.push(new Text({
		text : "%S chugs a bottle of red liquid!",
		soundkits : 'potionUse',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'majorHealingPotion'}, targnr:0});
	out.push(new Text({
		text : "%S chugs a large bottle of red liquid!",
		soundkits : 'potionUse',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'manaPotion'}, targnr:0});
	out.push(new Text({
		text : "%S chugs a bottle of blue liquid!",
		soundkits : 'potionUse',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'majorManaPotion'}, targnr:0});
	out.push(new Text({
		text : "%S chugs a large bottle of blue liquid!",
		soundkits : 'potionUse',
		conditions : [C.actionHit,C.eventIsActionUsed,actionCond]
	}));


// == PC ==

// __ GENERIC __
// lowBlow
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'lowBlow'}, targnr:0});
	out.push(new Text({
		text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts]
	}));
	out.push(new Text({
		text : "%S throws a punch at %T's %Tbsize %leftright %Tbreast, jiggling it around in %This %TclothUpper!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetUpperbodyStretchy]
	}));
	out.push(new Text({
		text : "%S throws a punch at %T's %groin!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S grabs a hold of %T's nipples through %This %TclothUpper, giving them both a painful twist while tugging them out!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetUpperbodyNotHard,libCond.targetWearsUpperbody]	// notTag conditions need to check if anything is there
	}));
	out.push(new Text({
		text : "%S grabs a hold of %T's %groin, painfully squeezing between %This legs!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetLowerbodyNotHard,libCond.targetWearsLowerbody,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S catches %T unaware, throwing a hard punch at its weak spot!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBeast]
	}));

	// Successful stun for lowBlow
	/*
	out.push(new Text({
		text : "The attack causes %T to flinch!",
		conditions : [libCond.eventIsEffectTrigger,new Condition({type:Condition.Types.effectLabel, data:{label:'lowBlowStun'}})],
	}));
	*/


// WARRIOR
	
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'warrior_viceGrip'}, targnr:0});
	out.push(new Text({
		text : "%S grabs a firm hold of %T's %Tgroin and squeezes down hard!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));
	out.push(new Text({
		text : "%S grabs at %T!",
		soundkits : 'squeezeGeneric',
		conditions : [actionCond,libCond.actionHit,libCond.eventIsActionUsed,libCond.targetBeast]
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of %T's %leftright %Tbreast and squeezes down hard!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond, C.targetBreasts)
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of %T's %Tpenis and firmly squeezes down on it!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond, C.targetPenis, [[C.ttGroinExposed, C.targetNoLowerbody]])
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of %T's %Tbutt and squeezes down firmly!",
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of %T and %T2's groins and squeezes down hard!",
		numTargets : 2,
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of %T and %T2's butts and squeezes down hard!",
		numTargets : 2,
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond)
	}));
	out.push(new Text({
		text : "%S grabs a firm hold of one of %T and %T2's %Tbreasts each and squeezes down hard!",
		numTargets : 2,
		soundkits : 'squeezeGeneric',
		conditions : humanAVConds.concat(actionCond, C.targetBreasts)
	}));


	// Bolster
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'warrior_bolster'}, targnr:0});
	out.push(new Text({
		text : "%S readies %Thimself for combat!",
		soundkits : 'warriorShield',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond],
	}));

	// Revenge
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'warrior_revenge'}, targnr:0});
	out.push(new Text({
		text : "%S retaliates, striking %T hard!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBeast]
	}));
	out.push(new Text({
		text : "%S counters %T with a rapid jab to %This %Tbsize %leftright %Tbreast!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.upperbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBreasts]
	}));
	out.push(new Text({
		text : "%S counters %T with a rapid jab to the %groin!",
		soundkits : 'punchGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S counters %T with a rapid jab at %This %Trsize %leftright buttcheeck!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S counters %T with a rapid jab to the stomach!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));
	


// ROGUE
	// Exploit
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'rogue_exploit'}, targnr:0});
	out.push(new Text({
		text : "%S exploits an opening in %T's defenses, throwing a punch at %Thim!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsUpperbody,libCond.targetWearsLowerbody]
	}));
	// Beast generic
	out.push(new Text({
		text : "%S exploits an opening in %T's defenses, throwing a powerful punch at %Thim!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoLowerbody,libCond.targetNoUpperbody,libCond.targetBeast]
	}));
	out.push(new Text({
		text : "%S slips some fingers up %T's %Tvagina, wiggling them around briefly!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoLowerbody,libCond.targetVagina]
	}));
	out.push(new Text({
		text : "%S slips %Shis between %T's legs, tickling %This clit!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoLowerbody,libCond.targetVagina]
	}));
	out.push(new Text({
		text : "%S slips %Shis between %T's legs and grabs a hold of %T's %Tpsize %Tpenis, giving it a couple of rapid tugs!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoLowerbody,libCond.targetPenis]
	}));
	out.push(new Text({
		text : "%S exploits an opening in %T's defenses, grabs a hold of and rubs %This exposed nipples!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoUpperbody,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S exploits an opening in %T's defenses, grabs a hold of and jiggles %This %Tbsize exposed %Tbreasts around!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNoUpperbody, libCond.targetBreasts]
	}));

	// rogue_corruptingPoison
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'rogue_corruptingPoison'}, targnr:0});
	out.push(new Text({
		text : "%S poisons %T, causing a warm feeling to course throughout %This body!",
		soundkits : 'poisonGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));

	// Dirty Tricks
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'rogue_dirtyTricks'}, targnr:0});
	// Beast generic
	out.push(new Text({
		text : "%S distracts %T, allowing %Shim to attack from behind!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBeast]
	}));
	// Generic
	out.push(new Text({
		text : "%S distracts %T and sneaks behind %Thim, throwing a powerful slap across %T's %Trsize %Tbutt!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S distracts %T, slipping a hand into %T's %TclothLower and a finger down %This buttcrack, tickling at %This rear!",
		soundkits : 'tickleGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsLowerbody]
	}));
	out.push(new Text({
		text : "%S distracts %T, slipping a hand into %T's %TclothLower and grabs a hold of %This %Tpsize %Tpenis, rubbing the glans with %Shis index finger!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsLowerbody,libCond.targetPenis]
	}));
	out.push(new Text({
		text : "%S distracts %T, slipping a hand into %T's %TclothLower and rubs %This clit!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsLowerbody,libCond.targetVagina]
	}));
	out.push(new Text({
		text : "%S distracts %T, slipping a hand into %T's %TclothLower and wiggles %Shis long finger up inside %T's %Tvagina!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsLowerbody,libCond.targetVagina]
	}));
	out.push(new Text({
		text : "%S distracts %T, slipping both hands into %T's %TclothUpper and massages %This %Tnipples!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetWearsUpperbody,libCond.targetBreasts]
	}));
	out.push(new Text({
		text : "%S shoves %T from behind. As %T stumbles forward, %S slips %Shis hand between %T's legs and slides %Shis fingers across %This %groin and %Tbutt!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetVagina]
	}));
	

	
// cleric
	// Paddling
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'cleric_paddling'}, targnr:0});
	// Beast
	out.push(new Text({
		text : "%S whacks %T with a divine paddle!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBeast]
	}));
	out.push(new Text({
		text : "%S whaps %T's %Trsize %Tbutt with a divine paddle!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S summons a divine paddle, using it to repeatedly whack %T across %This buttcheeks!",
		soundkits : 'punchGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetNotBeast]
	}));


	// Smite
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'cleric_smite'}, targnr:0});
	out.push(new Text({
		text : "%S smites %T with holy magic!",
		soundkits : 'holySmite',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));
	

	// Chastise
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'cleric_chastise'}, targnr:0});
	out.push(new Text({
		text : "%S chastises %T with divine might!",
		soundkits : 'holyChastise',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBeast]
	}));
	out.push(new Text({
		text : "Divine magic wraps around %T's %Tpsize %Tpenis!",
		soundkits : 'holyChastise',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetPenis]
	}));
	out.push(new Text({
		text : "%T's %Tvagina tingles as divine magic flows across it!",
		soundkits : 'holyChastise',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetVagina]
	}));
	out.push(new Text({
		text : "Divine chains wrap around %T's nipples, magically restraining them!",
		soundkits : 'holyChastise',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond,libCond.targetBreasts]
	}));
	
	// Chastise
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'cleric_heal'}, targnr:0});
	out.push(new Text({
		text : "Divine magic from %S's heal washes across %T!",
		soundkits : 'holyGeneric',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));


// TENTACLEMANCER

	// Tentacle Whip
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentaclemancer_tentacleWhip'}, targnr:0});
	out.push(new Text({
		text : "%S summons a tentacle, commanding it to lash at %T!",
		soundkits : 'tentacleWhip',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBeast]
	}));
	out.push(new Text({
		text : "%S summons a tentacle behind %T whacking across %This %Trsize %Tbutt!",
		soundkits : 'tentacleWhip',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle beneath %T, slapping up across %This %groin!",
		soundkits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle beneath %T, giving %This %Tpsize %Tpenis a couple of lashes!",
		soundkits : 'tentacleWhip',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetPenis,libCond.targetNoLowerbody]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle behind %T, lashing across %This %Trsize %leftright buttcheek!",
		soundkits : 'tentacleWhip',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle near %T, lashing across %This %Tbsize %leftright %Tbreast!",
		soundkits : 'tentacleWhip',
		armor_slot : Asset.Slots.upperbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetUpperbodyHard]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle near %T, giving a jiggling lash across %This %Tbsize %leftright %Tbreast!",
		soundkits : 'tentacleWhip',
		armor_slot : Asset.Slots.upperbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts,libCond.targetUpperbodyNotHard]
	}));
	out.push(new Text({
		text : "%S summons a slimy tentacle beneath %T, smacking %This %Tpsize %Tpenis around!",
		soundkits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetPenis,libCond.targetLowerbodyNotHard]
	}));

	// Corrupting Ooze
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentaclemancer_corruptingOoze'}, targnr:0});
	out.push(new Text({
		text : "%S flings a purple bolt of sludge at %T, coating %This body!",
		soundkits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNoLowerbody,libCond.targetNoUpperbody]
	}));
	out.push(new Text({
		text : "%S flings a purple bolt of sludge at %T, slipping into %This outfit!",
		soundkits : 'tentacleSuction',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, [libCond.targetWearsLowerbody,libCond.targetWearsUpperbody]]
	}));


	// Corrupting ooze proc
	actionCond = new Condition({type : Condition.Types.effectLabel, data:{label:'corrupting_ooze_proc'}, targnr:0});
	out.push(new Text({
		text : "The corrupting ooze constricts around %T's body, immobilizing %Thim!",
		soundkits : 'tentacleStretch',
		conditions : [libCond.eventIsEffectTrigger,actionCond]
	}));


	// Siphon Corruption
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'tentaclemancer_siphonCorruption'}, targnr:0});
	out.push(new Text({
		text : "The living ooze wiggles around %T's body, allowing %S to absorb its energy!",
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBeast]
	}));
	out.push(new Text({
		text : "The living ooze attached to %T protrudes into %This %Tbutt, causing a warm sensation as it wiggles and bubbles inside! %S absorbs energy from the stimulation.",
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetNotBeast]
	}));
	out.push(new Text({
		text : "The living ooze attached to %T protrudes into %This %Tvagina, causing a warm sensation as it wriggles and bubbles inside %Thim! %S absorbs energy from the stimulation.",
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetVagina]
	}));
	out.push(new Text({
		text : "The living ooze attached to %T wraps around %This %Tpenis, causing a warm sensation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetPenis]
	}));
	out.push(new Text({
		text : "The living ooze attached to %T wraps around %This nipples, causing a tingling senation as it wriggles and bubbles! %S absorbs energy from the stimulation.",
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts]
	}));
	






// MONK
	// monk_roundKick
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'monk_roundKick'}, targnr:0});
	out.push(new Text({
		text : "%S spins around, throwing a rapid kick at %T!",
		soundkits : 'monkKick',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));

	// riposte of above
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and throws a rapid jab at %T's %groin!",
		soundkits : 'monkKick',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and swipes %Shis palm right across %T's %groin!",
		soundkits : 'slapGeneric',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and smacks %Shis palm right across %T's %Trsize %Tbutt!",
		soundkits : 'slapGeneric',
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, forcing %Shis hand between %T's legs, rapidly rubbing %This %Tvagina!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast, libCond.targetVagina]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath, grabbing a hold of and squeezing %This package!",
		soundkits : 'squeezeGeneric',
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast, libCond.targetPenis, libCond.targetLowerbodyNotHard]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S, but %S ducks underneath and thrusts a few fingers inside %T's %Tvagina, briefly wiggling them around!",
		soundkits : 'squishTiny',
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderNotBeast, libCond.targetVagina, libCond.targetNoLowerbody]
	}));
	out.push(new Text({
		text : "%T spins around, attempting a rapid kick at %S. But %S ducks under and lashes %T's exposed %groin with a tentacle!",
		soundkits : 'tentacleWhip',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderHasTentacles]
	}));
	out.push(new Text({
		text : "%T spins around attempting a rapid kick at %S. But %S ducks under and thrusts a tentacle up inside %T's exposed %Tvagina!",
		soundkits : 'gooRub',
		armor_slot : Asset.Slots.lowerbody,
		conditions : [libCond.actionHit,libCond.eventIsRiposte,actionCond, libCond.senderHasTentacles,libCond.targetNoLowerbody,libCond.targetVagina]
	}));


	// Disable
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'monk_disablingStrike'}, targnr:0});
	out.push(new Text({
		text : "%S lands a mystical touch on %T, lowering their physical ability!",
		soundkits : 'darkPunch',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));


	// Uplifting Strike
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'monk_upliftingStrike'}, targnr:0});
	out.push(new Text({
		text : "%S throws a mystical strike at %T, allowing some chi to slip out and surround a nearby ally!",
		soundkits : 'healingPunch',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));



// ELEMENTALIST

	// IceBlast
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'elementalist_iceBlast'}, targnr:0});
	out.push(new Text({
		text : "%S sends a chilling blast across %T!",
		soundkits : 'coldBlast',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));
	out.push(new Text({
		text : "%S sends a chilling blast across %T's %Tbreasts, hardening %This nipples!",
		soundkits : 'coldBlast',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond, libCond.targetBreasts]
	}));

	// HealingSurge
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'elementalist_healingSurge'}, targnr:0});
	out.push(new Text({
		text : "%S summons a splash of healing water that flows across %T's body!",
		soundkits : 'waterHealing',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));


	// WaterSpout (Use)
	actionCond = new Condition({type : Condition.Types.actionLabel, data:{label:'elementalist_waterSpout'}, targnr:0});
	out.push(new Text({
		text : "%S summons a water spout beneath %T!",
		soundkits  : 'waterSpell',
		conditions : [libCond.actionHit,libCond.eventIsActionUsed,actionCond]
	}));
	// WaterSpout (Proc)
	actionCond = new Condition({type : Condition.Types.effectLabel, data:{label:'elementalistWaterSpout_proc'}, targnr:0});
	/*
	out.push(new Text({
		text : "The water spout beneath %T erupts, squirting hot water across %This body!",
		conditions : [libCond.eventIsEffectTrigger,actionCond,libCond.targetBeast],
	}));
	out.push(new Text({
		text : "The water spout beneath %T erupts, squirting hot water across %This %groin!",
		conditions : [libCond.eventIsEffectTrigger,actionCond,libCond.targetNotBeast],
	}));
	out.push(new Text({
		text : "The water spout beneath %T erupts, squirting hot water across %This %Trsize %Tbutt!",
		conditions : [libCond.eventIsEffectTrigger,actionCond,libCond.targetNotBeast],
	}));
	out.push(new Text({
		text : "The water spout beneath %T erupts, squirting hot water up across %This %Tbsize %Tbreasts!",
		conditions : [libCond.eventIsEffectTrigger,actionCond, libCond.targetBreasts],
	}));
	*/	

	// GameEvent.Types.actionUsed


export default out;