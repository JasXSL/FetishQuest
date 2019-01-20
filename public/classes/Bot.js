import stdTag from "../libraries/stdTag.js";

class Bot{
	constructor( player ){
		
		this.player = player;
		this.actions_used = 0;

	}

	onTurnStart(){
		this.actions_used = 0;
	}

	// Targs is an array, it performs a weighted rand based on threat, shifts off the character and returns it
	shiftRandomTargetByThreat(targs){
		let maxThreat = 0;
		for( let targ of targs )
			maxThreat += Math.max(1,this.player.getPlayerThreat(targ));
		let r = Math.random()*maxThreat,
			threat = 0;
		shuffle(targs);
		for( let i in targs ){
			let targ = targs[i];
			let pthreat = this.player.getPlayerThreat(targ);
			threat += pthreat;
			if( threat >= r ){
				targs.splice(i, 1);
				return targ;
			}
		}
		return targs[0]
	}

	pickTargetBySexuality( players ){

		let hetero = this.player.hetero;
		let pl = players.filter(p => {
			let hasPenis = p.hasTag(stdTag.penis);
			// Complete homos won't punish girls/cboys
			if( !hasPenis && hetero <= 0 )
				return false;
			// Complete heteros won't punish guys/shemales/herms
			if( hasPenis && hetero >= 1 )
				return false;
			return true;
		});

		if( !pl.length )
			return false;
		return weightedRand(pl, player => {
			let hasPenis = player.hasTag(stdTag.penis);
			// Check how much player is gay
			if( hasPenis )
				return 1-hetero;
			// Check how much player is straight
			return hetero;
		});

	}

	punish( players ){

		let actions = {};
		let all = this.player.getActions().filter(a => {
			return a.label.startsWith("stdPunish");
		});
		for( let action of all )
			actions[action.label] = action;

		// Try to find a fitting punishment
		// Not all monsters are highly sexual, and may choose to not use one
		let target = this.pickTargetBySexuality( players );
		if( !target )
			return;

		// try a sadistic punishment
		if( Math.random() < this.player.sadistic ){
			game.useActionOnTarget( actions.stdPunishSad, target, this.player );
			return;
		}
		
		if( Math.random() < this.player.dominant ){
			game.useActionOnTarget( actions.stdPunishDom, target, this.player );
			return;
		}
		
		if( Math.random() < 1-this.player.dominant ){
			game.useActionOnTarget( actions.stdPunishSub, target, this.player );
			return;
		}

	}

	play( force = false ){
		if( (!this.player.auto_play && !force) || !game.battle_active )
			return;

		// Get viable abilities
		let abils = this.player.getActions().filter(el => {
			return !el.hidden && el.castable();
		});
		let highest_cost = 0;
		for( let abil of abils ){
			if( highest_cost < abil.ap && abil._cooldown === 0 )
				highest_cost = abil.ap;
		}


		// Adds some randomness to abilities
		if(
			(this.player.ap >= highest_cost && (Math.random() < this.player.ap/this.player.getMaxAP() || this.actions_used)) ||
			Math.random() < 0.2 || this.player.ap > this.player.getMaxAP()-3
		){

			shuffle(abils);
			abils.sort((a,b) => {

				// NPC important are run first
				let atag = a.hasTag(stdTag.acNpcImportant),
					btag = b.hasTag(stdTag.acNpcImportant),
					aIsSTD = a.label === 'stdAttack' || a.label === 'stdArouse',
					bIsSTD = b.label === 'stdAttack' || b.label === 'stdArouse'
				;
				if( atag && !btag )
					return -1;
				if( btag && !atag )
					return 1;

				// Put standard attacks last on the first action
				if( aIsSTD && !bIsSTD && !this.actions_used )
					return 1;
				if( bIsSTD && !aIsSTD && !this.actions_used )
					return -1;
				
				return 0;
			});

			for( let abil of abils ){

				let targs = abil.getViableTargets().filter(el => {
					// Don't use a detrimental spell on a friend
					// Don't use a beneficial spell on an enemy
					if( !!abil.detrimental === (el.team === this.player.team) )
						return false;
					if( abil.hasTag(stdTag.acHeal) && el.hp/el.getMaxHP() > 0.5 )
						return false;
					return true;
				});


				if( abil.hasTag(stdTag.acSelfHeal) && this.player.hp/this.player.getMaxHP() < 0.5 )
					continue;
				if( targs.length < abil.min_targets )
					continue;

				// Pick a target
				shuffle(targs);

				let t = [];
				while( targs.length ){
					t.push(this.shiftRandomTargetByThreat(targs));
					if( targs.length >= abil.max_targets )
						break;
				}

				// Game
				let success = game.useActionOnTarget( abil, t );
				let time = 2000+Math.random()*1000;
				if( !success )
					time = 500;
				++this.actions_used;
				if( !game.dm_writes_texts ){
					setTimeout(() => {
						this.play();	
					}, time);
				}
				return;
			}

		}

		// Send end of turn
		game.useActionOnTarget( this.player.getActionByLabel('stdEndTurn'), this.player );

	}

}

export default Bot;
