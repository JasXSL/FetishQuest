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
		this.objectives = [];
		this.rewards_assets = [];
		this.rewards_experience = 0;
		this.level = 1;
		this.objectives = [];
		this.completion_objectives = [];			// One of these will trigger. This allows you to add multiple ways of handing in a quest with different outcomes
		this.finished = false;						// Set internally when the quest finishes to prevent further objective evaluation

		this.load(data);
	}
	
	save( full ){

		const out = {
			name : this.name,
			description : this.description,
			objectives : this.objectives.map(el => el.save(full)),
			rewards_assets : this.rewards_assets.map(el => el.save(full)),
			rewards_experience : this.rewards_experience,
			level : this.level,
			completion_objectives : this.completion_objectives.map(el =>el.save(full)),
		};

		if(full )
			out.label = this.label;
		

		if( full !== "mod" ){
			out.id = this.id;			
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
		this.rewards_assets = Asset.loadThese(this.rewards_assets, this);
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

	addGearReward( item ){
		if( !(item instanceof Asset) )
			return console.error(item, "is not an asset");
		item = item.clone(this);
		this.rewards_assets.push(item);
	}


	isCompleted(){
		for( let objective of this.objectives ){
			if( !objective.isCompleted() )
				return false;
		}
		return true;
	}

	// hand out rewards etc
	finish( event ){
		this.finished = true;
		
		// Give exp
		let players = game.getTeamPlayers();
		for( let player of players )
			player.addExperience(this.rewards_experience);

		for( let asset of this.rewards_assets ){
			let rewardee = randElem(players);
			rewardee.addAsset(asset);
			game.ui.addText( rewardee.getColoredName()+" received "+asset.name+".", undefined, rewardee.id,  rewardee.id, 'statMessage important' );
		}

		// Handle netcode
		game.onQuestCompleted(this);
		game.net.dmQuestCompleted(this.id);
		
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
	const level = game.getAveragePlayerLevel();
	quest.level = level;

	const encounters = dungeon.getNumEncounters();
	if( !encounters )
		return game.ui.addError("Unable to generate viable encounters for quest");
		
	if( type === Quest.Types.DungeonClear ){

		quest.name = 'Dungeoneering';
		quest.description = 'Clear the dungeon from monsters.';

		// Add monsterKill objective
		quest.addObjective(QuestObjective.buildEncounterCompletedObjective(quest, dungeon, encounters));

		expBasis = difficultyMultiplier*level/2*encounters;

	}

	let expReward = Math.ceil(expBasis);
	quest.rewards_experience = expReward;
	// Pick a proper reward. For now, just do gear.
	let minGearRarity = Math.min(Asset.Rarity.EPIC, Math.round(game.getTeamPlayers(0).length*difficultyMultiplier+encounters/10));
	let rarity = Asset.rollRarity(minGearRarity);
	quest.addGearReward(Asset.generate(undefined, level, undefined, undefined, rarity));

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
		};

		if( full ){

			out.label = this.label;
			out.events = this.events.map(el => el.save(full));

		}

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
}

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
		if( quest.finished )
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
			quest.finish(event);
		}

	}
}

QuestObjectiveEvent.Actions = {
	add : "add",			// {amount : (str int)amount} - Add to Formulas are allowed
	finish : "finish",		// void - Hands in the quest
};


export {QuestObjective};
export default Quest;