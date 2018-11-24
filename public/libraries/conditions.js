import Condition from '../classes/Condition.js';
import GameEvent from '../classes/GameEvent.js';
import stdTag from './stdTag.js';
import { Effect as Effect, Wrapper as Wrapper } from '../classes/EffectSys.js';

const out = {
	'targetAlive' : new Condition({
		type : Condition.Types.tag,
		data : {tags:[stdTag.dead]},
		inverse : true,
		caster : false
	}),
	'targetSameTeam' : new Condition({
		type : Condition.Types.sameTeam,
		caster : false
	}),
	'targetOtherTeam' : new Condition({
		type : Condition.Types.sameTeam,
		caster : false,
		inverse : true
	}),

	'actionNotHidden' : new Condition({type:Condition.Types.actionHidden, inverse:true}),
	'actionHit' : new Condition({type:Condition.Types.actionResisted, inverse:true, targnr:0}),		// Action was not a miss
	'actionResist' : new Condition({type:Condition.Types.actionResisted}),				// Action was fully resisted
	'targetIsWrapperParent' : new Condition({type:Condition.Types.isWrapperParent, anyPlayer:true}),			// A target of this event was the condition's parent's parent
	'senderIsWrapperParent' : new Condition({type:Condition.Types.isWrapperParent, anyPlayer:true, caster:true}),			// The sender of this event was the condition's parent's parent

	// Action tags
	'actionDamaging' : new Condition({type:Condition.Types.actionTag, data:{tags:[stdTag.acDamage]}}),		// Action was not a miss

	'wrapperIsStun' : new Condition({type:Condition.Types.wrapperHasEffect, data:{filters:{type:Effect.Types.stun}}}),

	// Clothing related
	'targetWearsThong' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.asThong]}}),
	'targetWearsSkirt' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.asSkirt]}}),
	'targetWearsSlingBikini' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.asSlingBikini]}}),
	'targetNoBodysuit' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.asBodysuit]}, inverse:true}),
	
	// Has upperbody armor
	'targetWearsUpperbody' : new Condition({type:Condition.Types.tag, data:{tags:['as_upperbody']}}),
	'targetWearsLowerbody' : new Condition({type:Condition.Types.tag, data:{tags:['as_lowerbody']}}),
	'targetNoUpperbody' : new Condition({type:Condition.Types.tag, data:{tags:['as_upperbody']}, inverse:true}),
	'targetNoLowerbody' : new Condition({type:Condition.Types.tag, data:{tags:['as_lowerbody']}, inverse:true}),
	senderWearsUpperbody : new Condition({type:Condition.Types.tag, data:{tags:['as_upperbody']}, caster:true}),
	senderWearsLowerbody : new Condition({type:Condition.Types.tag, data:{tags:['as_lowerbody']}, caster:true}),
	senderNoUpperbody : new Condition({type:Condition.Types.tag, data:{tags:['as_upperbody']}, inverse:true, caster:true}),
	senderNoLowerbody : new Condition({type:Condition.Types.tag, data:{tags:['as_lowerbody']}, inverse:true, caster:true}),


	'targetUpperbodyNotHard' : new Condition({type:Condition.Types.tag, data:{tags:['as_hard_upperbody']}, inverse:true}),
	'targetUpperbodyHard' : new Condition({type:Condition.Types.tag, data:{tags:['as_hard_upperbody']}}),
	'targetLowerbodyNotHard' : new Condition({type:Condition.Types.tag, data:{tags:['as_hard_lowerbody']}, inverse:true}),
	'targetLowerbodyHard' : new Condition({type:Condition.Types.tag, data:{tags:['as_hard_lowerbody']}}),
	'targetUpperbodyStretchy' : new Condition({type:Condition.Types.tag, data:{tags:['as_stretchy_upperbody']}}),
	'targetLowerbodyStretchy' : new Condition({type:Condition.Types.tag, data:{tags:['as_stretchy_lowerbody']}}),

	targetLowerbodyWaistband : new Condition({type:Condition.Types.tag, data:{tags:['as_waistband_lowerbody']}}),

	targetHasRepairable : new Condition({type:Condition.Types.hasRepairable}),
	targetNotFriendly : new Condition({type:Condition.Types.sameTeam, inverse:true}),

	'targetNotBeast' : new Condition({type:Condition.Types.tag, data:{tags:['pl_beast']}, inverse:true}),
	'targetBeast' : new Condition({type:Condition.Types.tag, data:{tags:['pl_beast']}}),	
	'senderNotBeast' : new Condition({type:Condition.Types.tag, data:{tags:['pl_beast']}, inverse:true, caster:true}),
	'senderBeast' : new Condition({type:Condition.Types.tag, data:{tags:['pl_beast']}, caster:true}),

	'senderHasTentacles' : new Condition({type:Condition.Types.tag, data:{tags:['pl_tentacles']}, caster:true}),
	
	'targetNotKnockedDown' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrKnockdown]}, inverse:true}),
	'targetKnockedDown' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrKnockdown]}}),
	'targetKnockedDownBack' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrKnockdownBack]}}),
	'targetKnockedDownFront' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrKnockdownFront]}}),
	
	// Prop conditions
	'senderHasWhip' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.asWhip]}, caster:true}),
	
	
	'targetSoaked' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrSoaked]}}),
	'targetLegsSpread' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.wrLegsSpread]}}),

	'targetHorns' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.plHorns]}}),
	'targetHorn' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.plHorn]}}),

	// targetChestpieceNotHard
	
	// Genital related
	'targetVagina' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.vagina]}}),
	'targetPenis' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.penis]}}),
	'targetBreasts' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.breasts]}}),
	'targetNotCircumcised' : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.plCircumcised]}, inverse:true}),
	'targetButtLarge' : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.butt}}),
	'targetBreastsLarge' : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.breasts}}),
	'targetPenisLarge' : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.penis}}),


	senderVagina : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.vagina]}, caster:true}),
	senderPenis : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.penis]}, caster:true}),
	senderBreasts : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.breasts]}, caster:true}),
	senderNotCircumcised : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.plCircumcised]}, inverse:true, caster:true}),
	senderButtLarge : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.butt}, caster:true}),
	senderBreastsLarge : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.breasts}, caster:true}),
	senderPenisLarge : new Condition({type:Condition.Types.genitalSizeValue, data:{amount:2, genital:stdTag.penis}, caster:true}),


	// Event conditions
	'eventIsActionUsed' : new Condition({type:Condition.Types.event, data:{event:[GameEvent.Types.actionUsed]}, targnr:0}),
	'eventIsDiminishingResist' : new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.diminishingResist}}),		// Action failed due to diminishing returns
	'eventIsWrapperAdded' : new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.wrapperAdded}}),
	'eventIsRiposte' : new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.actionRiposte}}),
	'eventIsEffectTrigger' : new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.effectTrigger}}),
	'eventIsInterrupt' : new Condition({type:Condition.Types.event, data:{event:GameEvent.Types.interrupt}}),
	'eventIsEncounterDefeated' : new Condition({type:Condition.Types.event, data:{event:[GameEvent.Types.encounterDefeated]}}),
	eventIsPlayerDefeated : new Condition({type:Condition.Types.event, data:{event:[GameEvent.Types.playerDefeated]}}),
	eventIsDungeonExited : new Condition({type:Condition.Types.event, data:{event:[GameEvent.Types.dungeonExited]}}),
	eventIsDungeonEntered : new Condition({type:Condition.Types.event, data:{event:[GameEvent.Types.dungeonEntered]}}),

	'targetTaller' : new Condition({type:Condition.Types.sizeValue, data:{amount:'se_Size',operator:'>'}}),
	'targetShorter' : new Condition({type:Condition.Types.sizeValue, data:{amount:'se_Size',operator:'<'}}),

	notInCombat : new Condition({type:Condition.Types.notInCombat}),
	inCombat : new Condition({type:Condition.Types.notInCombat, inverse:true}),
	

	'rand10' : new Condition({type:Condition.Types.rng, data:{chance:10}}),
	'rand20' : new Condition({type:Condition.Types.rng, data:{chance:20}}),
	'rand30' : new Condition({type:Condition.Types.rng, data:{chance:30}}),
	'rand40' : new Condition({type:Condition.Types.rng, data:{chance:40}}),
	'rand50' : new Condition({type:Condition.Types.rng, data:{chance:50}}),
	'rand60' : new Condition({type:Condition.Types.rng, data:{chance:60}}),
	'rand70' : new Condition({type:Condition.Types.rng, data:{chance:70}}),
	'rand80' : new Condition({type:Condition.Types.rng, data:{chance:80}}),
	'rand90' : new Condition({type:Condition.Types.rng, data:{chance:90}}),


	// Dungeon room conditions
	roomTable : new Condition({type:Condition.Types.tag, data:{tags:[stdTag.mTable]}}),

	senderHasNotPunished : new Condition({type:Condition.Types.punishNotUsed, caster:true}),


	senderNotDead : new Condition({type:Condition.Types.defeated, inverse:true, caster:true}),
	targetDead : new Condition({type:Condition.Types.defeated}),
	targetNotDead : new Condition({type:Condition.Types.defeated, inverse:true}),

	senderPunishmentNotUsed : new Condition({type:Condition.Types.punishNotUsed, caster:true}),

	// TurnTags
	ttGroinExposed : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttGroinExposed]}}),
	ttButtExposed : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttButtExposed]}}),
	ttButtNotExposed : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttButtExposed]}, inverse:true}),
	ttBreastsExposed : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttGroinExposed]}}),
	ttWedgie : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttWedgie]}}),
	ttPussyWedgie : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttPussyWedgie]}}),
	ttBentOver : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttBentOver]}}),
	ttBentOverTable : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttBentOverTable]}}),
	ttSpanked : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttSpanked]}}),
	ttNotSpanked : new Condition({type:Condition.Types.textTag, data:{tags:[stdTag.ttSpanked]}, inverse:true}),

};



out.collections = {
	// Std for actions
	std : [
		out.targetAlive,
		out.senderNotDead,
		out.targetNotDead
	],

};

console.log("CONDITION LIB", out);
export default out;