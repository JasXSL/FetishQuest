import stdTag from "../libraries/stdTag.js";
import Asset from "./Asset.js";
import { Effect } from "./EffectSys.js";
import GameEvent from "./GameEvent.js";
import Player from "./Player.js";

class Bot{
	constructor( player ){
		
		this.player = player;
		this.actions_used = 0;

		this._battle_start_assets = [];

		if( window.game && window.game.is_host )
			this.useFlavor();	// Starts the timer

	}

	// Is an experimental follower AI
	isAI(){
		return !this.player.generated && this.player.isNPC() && this.player.team === Player.TEAM_PLAYER;
	}

	onTurnStart(){
		this.actions_used = 0;
	}

	// Targs is an array, it performs a weighted rand based on threat, shifts off the character and returns it
	shiftRandomTargetByThreat(targs, action){

		let maxThreat = 0;
		for( let targ of targs )
			maxThreat += Math.max(1,this.player.getPlayerThreat(targ));
		let r = Math.random()*maxThreat,
			threat = 0;
		shuffle(targs);

		// If the action should ignore aggro and just cast at a random target
		if( action.hasTag(stdTag.acNpcIgnoreAggro) || this.player.hasTag(stdTag.plIgnoreAggro) )
			return targs[0];

		for( let i in targs ){
			let targ = targs[i];
			let pthreat = this.player.getPlayerThreat(targ);
			threat += pthreat;
			if( threat >= r ){
				targs.splice(i, 1);
				return targ;
			}
		}
		return targs[0];

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
		let all = this.player.getActions('e').filter(a => {
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
		
		// Beasts don't use sub
		if( Math.random() < 1-this.player.dominant && !this.player.isBeast() ){
			game.useActionOnTarget( actions.stdPunishSub, target, this.player );
			return;
		}

	}

	// Checks if it has at least one castable important ability
	hasCastableImportant(){
		
		const actions = this.player.getActions('e');
		for( let action of actions ){
			if( action.hasTag([stdTag.acNpcImportant, stdTag.acNpcImportantLast]) && action.castable() )
				return true;
		}

	}

	hasHealable(){
		const pl = game.getTeamPlayers(this.player.team);
		for( let p of pl ){
			if( p.hp < p.getMaxHP()*0.7 )
				return true;
		}
	}

	play( force = false ){
		
		if( (!this.player.isNPC() && !force) || !game.battle_active || game.getTurnPlayer() !== this.player )
			return;

		if( !this.player.isDead() ){

			let abils = this.player.getActions('e').filter(el => {
				return !el.hidden && 
					!this.player.isCasting() &&
					el.castable() && 
					(
						el.label !== 'grapple' ||
						!this.player.hasTag(stdTag.gpAlwaysGrapple)
					)
				;
			});
			let highest_cost = 0;
			for( let abil of abils ){
				if( highest_cost < abil.ap && abil._cooldown === 0 )
					highest_cost = abil.ap;
			}

			const AP = this.player.getMomentum();	// Get all momentum

			// Adds some randomness to abilities
			let chance = Math.random();
			if(
				!this.player.hasTag(stdTag.acNpcNoAttack) &&	// This player can't use an action due to a tag
				(
					this.hasCastableImportant() ||		// We have an important spell we MUST cast
					// Chance to stop an ongoing attack
					(
						AP >= highest_cost && 	// We have more AP than our highest costing ability
						this.actions_used && 	// and We have already used an action
						Math.random() < 0.8		// and 20% chance to stop mid attack
					) ||
					chance < 0.1 || 		// 10% chance to go yolo and attack
					AP > Player.MAX_MOMENTUM*0.6 ||	// If greater or equal to 60%, always attack.
					this.player.getTauntedBy(undefined, false).length
				)
			){

				const hasHealable = this.hasHealable();
				shuffle(abils);
				abils.sort((a,b) => {

					const aLast = a.hasTag(stdTag.acNpcImportantLast) && AP <= Math.ceil(a.ap*1.2),
						bLast = b.hasTag(stdTag.acNpcImportantLast) && AP <= Math.ceil(b.ap*1.2)
					;


					// NPC important are run first
					let atag = a.hasTag(stdTag.acNpcImportant) || aLast,
						btag = b.hasTag(stdTag.acNpcImportant) || bLast,
						aIsSTD = a.group === 'stdatt',
						bIsSTD = b.group === 'stdatt'
					;

					// Deprioritize important_last
					if( !aLast && a.hasTag(stdTag.acNpcImportantLast) )
						return 1;
					if( !bLast && b.hasTag(stdTag.acNpcImportantLast) )
						return -1;
					
					if( atag && !btag )
						return -1;
					if( btag && !atag )
						return 1;

					// Prioritize acNpcFirst
					if( a.hasTag(stdTag.acNpcFirst) !== b.hasTag(stdTag.acNpcFirst) )
						return a.hasTag(stdTag.acNpcFirst) ? -1 : 1;

					// Check always grapple
					if( this.player.hasTag(stdTag.gpAlwaysGrapple) ){

						const aGrapple = a.label === 'grapple', bGrapple = b.label === 'grapple';
						if( aGrapple !== bGrapple )
							return aGrapple ? -1 : 1;

					}

					// Put standard attacks last on the first action
					if( aIsSTD && !bIsSTD && !this.actions_used )
						return 1;
					if( bIsSTD && !aIsSTD && !this.actions_used )
						return -1;
					
					if( hasHealable ){
						
						// Healing should have priority
						const aIsHeal = a.hasTag(stdTag.acHeal),
							bIsHeal = b.hasTag(stdTag.acHeal)
						;
						if( aIsHeal !== bIsHeal )
							return aIsHeal ? -1 : 1;

					}

					// The standard attack chances are based on the player proficiency
					if( aIsSTD && bIsSTD ){

						let aSkill = this.player.getBon(a.type)-this.player.level, 
							bSkill = this.player.getBon(b.type)-this.player.level
						;
						// Normalize
						if( aSkill < bSkill ){
							bSkill -= aSkill;
							aSkill = 0;
						}
						else{
							bSkill -= aSkill;
							bSkill = 0;
						}
						// Add a bit of randomness
						aSkill += 2;
						bSkill += 2;

						let rand = Math.random()*(aSkill+bSkill);
						return rand > aSkill ? 1 : -1;

					}

					return 0;
				});

				for( let abil of abils ){

					let targs = abil.getViableTargets().filter(el => {

						if( el.isInvisible() )
							return false;
						// Don't use a detrimental spell on a friend
						// Don't use a beneficial spell on an enemy
						if( abil.isDetrimentalTo(el) === (el.team === this.player.team) )
							return false;
						if( abil.hasTag(stdTag.acHeal) && el.hp/el.getMaxHP() > 0.7 )
							return false;
						if( abil.hasTag(stdTag.acManaHeal) && el.mp/el.getMaxMP() > 0.7 )
							return false;
						return true;
					});

					if( abil.hasTag(stdTag.acSelfHeal) && this.player.hp/this.player.getMaxHP() < 0.5 )
						continue;
					if( targs.length < abil.min_targets )
						continue;

					// Pick a target
					let t = [];
					while( targs.length ){

						const ta = this.shiftRandomTargetByThreat(targs, abil);
						t.push(ta);
						if( t.length >= abil.max_targets )
							break;
					}

					// Game
					setTimeout(() => {

						let success = game.useActionOnTarget( abil, t );
						let time = 2000+Math.random()*1000;
						if( this.player.team === 0 )
							time = Math.floor(time*0.5);
						if( !success )
							time = 400;
						++this.actions_used;

						setTimeout(() => {
							this.play();	
						}, time);

					}, 100);
					
					


					
					
					return;
				}

			}
		}
		// Send end of turn
		game.useActionOnTarget( this.player.getActionByLabel('stdEndTurn'), this.player );

	}

	useFlavor(){

		if( !game.players.includes(this.player) )
			return;

		const ret = !this._aiFlavorTimer;
		clearTimeout(this._aiFlavorTimer);
		this._aiFlavorTimer = setTimeout(() => this.useFlavor(), Math.random()*300000+30000);
		if( ret )
			return;

		// Use flavor items if you can
		if( game.battle_active || !this.isAI() )
			return;
		
		const flavor = this.player.getActions().filter(el => el.hasTag(stdTag.acFlavor));
		shuffle(flavor);
		for( let f of flavor ){

			const targets = f.getViableTargets();
			if( !targets || targets.length < f.min_targets )
				continue;
			
			shuffle(targets);

			f.useOn(targets.slice(0, f.max_targets));
			break;

		}


	}

	async handleEvent( event ){
		if( !this.isAI() )
			return;
		if( !(this.player instanceof Player) )
			return;

		const T = GameEvent.Types, t = event.type;

		if( t === T.battleEnded ){

			// Things it should do
			// Re-equip worn assets

			// We lost, wait longer
			if( this.player.isDead() )
				await delay(10000);
			else
				await delay(4000);
			for( let asset of this._battle_start_assets ){

				if( !asset.equipped && !this.player.getEquippedAssetsBySlots(asset.slots).length ){

					game.equipPlayerItem(this.player, asset.id);
					await delay(500);

				}

			}

			// Loot if possible, but only consumables and gold
			const lootable = game.getEnabledPlayers().filter(el => el.isLootableBy(this.player) && el.team !== this.player.team);
			let viableLoot = [];
			for( let pl of lootable )
				viableLoot.push(...pl.getLootableAssets());
			viableLoot = viableLoot.filter(asset => {
				return (
					['currency', 'food', 'consumable', 'junk'].includes(asset.category)					
				);
			});
			shuffle(viableLoot);

			viableLoot = viableLoot.slice(0, Math.ceil(Math.random()*viableLoot.length/game.getTeamPlayers().length));

			for( let asset of viableLoot ){

				asset.parent.lootToPlayer( asset.id, this.player, true );
				await delay(500);

			}

			// Category can be HP or MP
			/*
			Todo: Food
			const eatIfNecessary = (category = 'HP') => {

				if( category !== 'HP' && category !== 'MP' )
					return;

				let fxtype = Effect.Types.damage;
				if( category === 'MP' )
					fxtype = Effect.Types.addMP;

				const food = this.player.getAssets().map(el => {
					if( 
						el.category !== 'food' ||
						!el?.use_action?.wrappers ||
						!el.isUsable()
					)return false;

					let amount = 0;
					for( let wrapper of el.use_action.wrappers ){

						let effects = wrapper.getEffects({type:fxtype});
						if( !effects.length )
							continue;

						for( let effect of effects ){

							if( !isNaN(effect.data.amount) && (effect.data.amount < 0 && category === 'HP') || (effect.data.amount > 0 && category === 'MP') )
								amount += Math.abs(effect.data.amount);

						}

					}

					if( amount < 1 )
						return false;

					return {
						amt : amount,
						asset : el
					};

				}).filter(el => el);
		
				food.sort((a, b) => a.amt > b.amt ? -1 : 1);
				
				for( let piece of food ){
					if( 
						(category === 'HP' && (piece.amt + this.player.hp > this.player.getMaxHP() && this.player.hp > this.player.getMaxHP()/4)) ||
						(category === 'MP' && (piece.amt + this.player.mp > this.player.getMaxMP() && this.player.mp > this.player.getMaxMP()/4))
					)continue;

					try{

						if( game.useActionOnTarget(
							piece.asset.use_action, 
							this.player,
							this.player
						) )return true;
						

					}catch(err){

					}

				}
				
				return false;

			};
			
			// Use food for HP if necessary
			let max = 5;
			while( eatIfNecessary() && --max )
				await delay(500);
			// same for MP
			max = 5;
			while( eatIfNecessary('MP') && --max )
				await delay(500);
			*/

			// Equip potions and swap out broken gear if possible
			let freePotionSlots = this.player.getNrActionSlots() - this.player.getEquippedAssetsBySlots([Asset.Slots.action]).length;
			const potions = this.player.getAssetsInventory().filter(el => el.slots.includes(Asset.Slots.action));
			shuffle(potions);
			for( let i = 0; i < freePotionSlots && potions.length; ++i )
				game.equipPlayerItem(this.player, potions.shift().id);


			await delay(3000+Math.random()*5000);
			this.useFlavor();

		}

		if( t === T.battleStarted ){
			
			this._battle_start_assets = this.player.getEquippedAssetsBySlots([gAsset.Slots.lowerBody, gAsset.Slots.upperBody]);

		}
		

	}

	static getPlayersWeCanControl(){

		return game.getTeamPlayers().filter(el => {
			const owner = el.netgame_owner;
			if( owner === game.constructor.net.id )
				return true;
			if( game.is_host && (owner === '' || owner === 'DM') )
				return true;
		});

	}

	// Picks a random player to perform an RP
	static randRP(){

		let players = this.getPlayersWeCanControl();
		let stage = game.roleplay.getActiveStage();
		if( !stage )
			return;

		
		
		shuffle(players);
		for( let p of players ){

			// First only allow options that don't end an RP
			let options = stage.getOptions(p);
			let viableOptions = options.filter(st => st.index.length);
			// If that don't work, allow it
			if( !viableOptions.length )
				viableOptions = options;
			
			let opt = randElem(viableOptions);
			if( opt ){
				game.useRoleplayOption(p, opt.id);
				break;
			}
		}

		


	}

}

export default Bot;
