import Generic from './helpers/Generic.js';
import Dungeon, { DungeonRoom } from './Dungeon.js';
import Condition from './Condition.js';
import C from '../libraries/mainMod/conditions.js';

import Calculator from './Calculator.js';
import Asset from './Asset.js';

class Quest extends Generic{

	constructor(data){
		super();
		this.label = '';
		this.name = '';
		this.description = '';
		this.rewards = [];							// Assets
		this.exp_multiplier = 1;
		this.objectives = [];
		this.completion_objectives = [];			// One of these will trigger. This allows you to add multiple ways of handing in a quest with different outcomes
		this.completed = false;						// Set internally when the quest finishes to prevent further objective evaluation
		
		this.multiply_money = true;					// Multiplies the money reward by nr of players when quest is accepted
		this.multiply_reward = false;				// Multiplies all rewards except money by nr of players when quest is accepted

		this.load(data);
	}
	
	save( full ){

		const out = {
			label : this.label,
			name : this.name,
			description : this.description,
			objectives : this.objectives.map(el => el.save(full)),
			rewards : Asset.saveThese(this.rewards),
			exp_multiplier : this.exp_multiplier,
			completion_objectives : this.completion_objectives.map(el =>el.save(full))
		};

		if( full !== "mod" ){
			out.id = this.id;			
			out.multiply_money = this.multiply_money;
			out.multiply_reward = this.multiply_reward;
		}
		else
			this.g_sanitizeDefaults(out);

		return out;

	}
	
	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.objectives = QuestObjective.loadThese(this.objectives, this);
		this.rewards = Asset.loadThese(this.rewards, this);
		this.completion_objectives = QuestObjective.loadThese(this.completion_objectives, this);
	}

	addObjective( objective, isCompletionObjective = false ){
		if( !(objective instanceof QuestObjective) )
			return console.error(objective, "is not an objective");
		let obj = objective.clone(this);
		if( isCompletionObjective )
			this.completion_objectives.push(obj);
		else
			this.objectives.push(obj);
		return obj;
	}


	// An encounter was completed that was tied to this quest's dungeon
	onEvent(event){

		let objectives = this.objectives;
		// Completed dungeons only check the finish objective
		if( this.isCompleted() )
			objectives = this.completion_objectives;
		for( let objective of objectives )
			objective.onEvent(event);
		
	}

	addGearReward( item, amount = 1 ){
		if( !(item instanceof Asset) )
			return console.error(item, "is not an asset");
		item = item.clone(this);
		item.g_resetID();
		if( item.stacking )
			item._stacks = amount;
		else{
			for( let i = 0; i<amount; ++i ){
				item = item.clone(this);
				item.g_resetID();
				this.rewards.push(item);
			}
		}		
	}


	isCompleted(){
		for( let objective of this.objectives ){
			if( !objective.isCompleted() )
				return false;
		}
		return true;
	}

	// Checks if an objective is completed by label
	isObjectiveCompleted( label ){
		const ob = this.getObjectiveByLabel(label);
		return ob && ob.isCompleted();
	}

	getObjectiveByLabel( label ){
		for( let objective of this.objectives ){
			if( objective.label === label )
				return objective;
		}
	}

	onAccepted(){
		
		const pLen = game.getTeamPlayers().length;
		if( pLen ){

			const rewards = this.rewards.slice();	// Prevents recursion
			this.rewards = [];
			for( let i in rewards ){

				const reward = Asset.convertDummy(rewards[i], this);
				if( !reward )
					continue;
				
				this.rewards.push(reward);
				if( reward.level === -1 )
					reward.level = game.getAveragePlayerLevel();

				if( reward.category === Asset.Categories.currency ){
					if( this.multiply_money )
						reward._stacks *= pLen;
				}
				// Make copies if reward should be multiplied
				else if( this.multiply_reward && pLen > 1 )
					this.addGearReward(reward, pLen-1);

			}

		}

	}

	// Splits an array of assets to players
	splitStackToPlayers( asset, players ){
		let total = asset._stacks;
		let each = Math.floor(total/players.length);
		let remainder = total%players.length;
		for( let player of players ){
			let n = each;
			if( remainder ){
				++n;
				--remainder;
			}
			const cl = asset.clone();
			asset.g_resetID();
			asset._stacks = n;
			this.addRewardToPlayer(asset, player);
		}
	}

	addRewardToPlayer( asset, player ){
		player.addAsset(asset);
		game.ui.addText( player.getColoredName()+" was rewarded "+asset.name+(asset._stacks > 1 ? ' x'+asset._stacks : '')+".", undefined, player.id,  player.id, 'statMessage important' );
	}

	getExperience(){
		return game.getAveragePlayerLevel()*this.exp_multiplier;
	}

	// hand out rewards etc
	onFinish( event ){
		this.completed = true;
		
		// Give exp
		let players = game.getTeamPlayers();
		for( let player of players )
			player.addExperience(this.getExperience());

		
		const order = shuffle(players.slice());
		let i = 0;
		for( let asset of this.rewards ){

			if( asset._stacks > 1 ){
				this.splitStackToPlayers(asset, order);
				continue;
			}

			const rewardee = players[i];
			this.addRewardToPlayer(asset, rewardee);
			
			++i;
			if( i >= order.length )
				i = 0;

		}

		// Handle netcode
		game.onQuestCompleted(this);		
		game.removeQuest(this.id);
	}


	

	/* HELPERS */
	// Creates a condition stating that the quest in the event must have the same ID as this one
	createQuestCondition(){
		return new Condition({type:Condition.Types.questIs, data:{id:this.id}});
	}

}

// These are only used for the procedural generator
Quest.Types = {
	DungeonClear : 0,			// Wipe out an entire dungeon
	//DungeonReagents : 1,		// Find all assets in a dungeon
	//DungeonBoss : 2,			// Kill a boss
};

Quest.generate = function( type, dungeon, difficultyMultiplier = 1 ){

	if( !type ){
		const types = Object.values(Quest.Types);
		type = types[Math.floor(Math.random()*types.length)];
	}
	
	const quest = new Quest();
	let expBasis = 0;			// Bonus experience basis

	const encounters = dungeon.getNumEncounters();
	if( !encounters )
		return game.modal.addError("Unable to generate viable encounters for quest");
		
	if( type === Quest.Types.DungeonClear ){

		quest.name = 'Dungeoneering';
		quest.description = 'Clear the dungeon from monsters.';

		// Add monsterKill objective
		quest.addObjective(QuestObjective.buildEncounterCompletedObjective(quest, dungeon, encounters));

		expBasis = encounters/2;	// Exp multiplier is a multiplayer against average player level. This makes it level*encounters/2

	}

	quest.exp_multiplier = expBasis;
	// Pick a proper reward. For now, just do gear.
	let minGearRarity = Math.min(Asset.Rarity.EPIC, Math.round(game.getTeamPlayers(0).length*difficultyMultiplier+encounters/10));
	let rarity = Asset.rollRarity(minGearRarity);
	quest.addGearReward(Asset.generate(undefined, undefined, undefined, undefined, rarity));

	// Add dungeon exit ending objective
	quest.addObjective(QuestObjective.buildDungeonExitObjective(quest, dungeon), true);

	return quest;

};











class QuestObjective extends Generic{

	constructor(data, parent){
		super();
		this.parent = parent;
		this.label = '';
		this.name = '';
		this.amount = 1;
		this._amount = 0;
		this.events = [];		// QuestObjectiveEvent
		this.load(data);
	}

	addAmount( amount = 1 ){
		if( this._amount >= this.amount )
			return;
		this._amount = Math.max(0,Math.min(this.amount, this._amount+amount));
	}

	
	save( full ){
		const out = {
			name : this.name,
			amount : this.amount,
			label : this.label,			// Needed for conditions
		};

		if( full )
			out.events = this.events.map(el => el.save(full));

		if( full !== "mod" ){
			
			out.id = this.id;
			out._amount = this._amount;

		}
		else
			this.g_sanitizeDefaults();

		return out;
	}
	
	load(data){
		this.g_autoload(data);
	}


	clone(parent){
		let data = this.save(true);
		delete data.id;
		return new this.constructor(data, parent);
	}

	rebase(){
		this.events = QuestObjectiveEvent.loadThese(this.events, this);
	}

	onEvent( event ){
		for( let ev of this.events )
			ev.trigger(event);
	}

	buildEvent(data){
		let evt = new QuestObjectiveEvent(data, this);
		this.events.push(evt);
		return evt;
	}

	isCompleted(){
		return this._amount >= this.amount;
	}

}

// helpers
QuestObjective.buildDungeonCondition = function( dungeon ){
	return new Condition({type:Condition.Types.dungeonIs, data:{id:dungeon.id}});
};

QuestObjective.buildEncounterCompletedObjective = function( quest, dungeon, nrEncounters = 1 ){
	let libCond = glib.conditions;
	return new QuestObjective({
		amount : nrEncounters,
		label : 'encounters_completed',
		name : 'Encounters Done',
		events : [new QuestObjectiveEvent({
			conditions : [libCond.eventIsEncounterDefeated,QuestObjective.buildDungeonCondition(dungeon)]
		})]
	});
};

QuestObjective.buildDungeonExitObjective = function( quest, dungeon ){
	let libCond = glib.conditions;
	return new QuestObjective({
		label : 'dungeon_exit',
		name : 'Exit the dungeon',
		events : [new QuestObjectiveEvent({
			action : QuestObjectiveEvent.Actions.finish,
			conditions : [libCond.eventIsDungeonExited, QuestObjective.buildDungeonCondition(dungeon)]
		})]
	});
};



class QuestObjectiveEvent extends Generic{
	constructor(data, parent){
		super(data);

		this.parent = parent;
		this.conditions = [];
		this.action = QuestObjectiveEvent.Actions.add;
		this.data = {amount:1};

		this.load(data);
	}
	save( full ){
		const out = {
			conditions : Condition.saveThese(this.conditions, full),
			action : this.action,
			data : this.data
		};

		if( full !== "mod" ){
			out.id = this.id;
		}
		else
			this.g_sanitizeDefaults(out);

		// No need for full since this won't be sent
		return out;
	}
	load(data){
		this.g_autoload(data);
	}
	rebase(){
		this.conditions = Condition.loadThese(this.conditions, this);
	}

	getQuest(){
		return this.parent.parent;
	}

	trigger( event ){
		let quest = this.getQuest();
		// Quest finished, ignore this
		if( quest.completed )
			return;

		// Quest is overwritten if it doesn't exist
		if( !Condition.all(this.conditions, event) )
			return;

		// success! do something
		let TY = QuestObjectiveEvent.Actions;

		// Add 1 to this objective
		if( this.action === TY.add ){

			let amount = Calculator.run(this.data.amount, event);
			this.parent.addAmount(amount);

		}

		// Immediately finish the quest
		if( this.action === TY.finish ){
			quest.onFinish(event);
		}

	}
}

QuestObjectiveEvent.Actions = {
	add : "add",			// {amount : (str int)amount} - Add to Formulas are allowed
	finish : "finish",		// void - Hands in the quest
};






export {QuestObjective, QuestObjectiveEvent};
export default Quest;