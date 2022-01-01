import Generic from './helpers/Generic.js';
//import Dungeon, { DungeonRoom } from './Dungeon.js';
import Condition from './Condition.js';
//import C from '../libraries/mainMod/conditions.js';

import Calculator from './Calculator.js';
import Asset from './Asset.js';
import GameEvent from './GameEvent.js';
import Action from './Action.js';

class Quest extends Generic{

	static getRelations(){ 
		return {
			objectives : QuestObjective,
			rewards : QuestReward,
			completion_objectives : QuestObjective,
		};
	}

	constructor(data){
		super();
		this.label = '';
		this.name = '';
		this.description = '';
		this.rewards = [];							// QuestReward objects. Use getRewards
		this.exp_multiplier = 1;					// Multiplied against average player level. This means 1x multiplier is worth about 4 sets of monsters
		this.objectives = [];
		this.completion_objectives = [];			// One of these will trigger. This allows you to add auto hand ins through events
		this.completed = false;						// Set internally when the quest finishes to prevent further objective evaluation
		this.hide_rewards = false;					// Todo: Hide rewards from screen
		this.multiply_money = true;					// Multiplies the money reward by nr of players when quest is accepted
		this.multiply_reward = false;				// Multiplies all rewards except money by nr of players when quest is accepted

		this.load(data);
	}
	
	save( full ){
		
		const out = {
			label : this.label,
			name : this.name,
			description : this.description,
			objectives :  QuestObjective.saveThese(this.objectives, full),
			rewards : QuestReward.saveThese(this.rewards, full),
			hide_rewards : this.hide_rewards,
			exp_multiplier : this.exp_multiplier,
			completion_objectives : QuestObjective.saveThese(this.completion_objectives, full)
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
		this.g_rebase();	// Super
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
		if( item.stacking ){
			item._stacks = amount;
			amount = 1;
		}

		for( let i = 0; i<amount; ++i ){
			item = item.clone(this);
			item.g_resetID();
			const reward = new QuestReward();
			reward.setAsset(item);
			this.rewards.push(reward);
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
			for( let reward of rewards ){

				reward = reward.clone(this);
				this.rewards.push(reward);

			}

		}

	}

	// Splits an array of assets to players
	/*
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
			cl.g_resetID();
			cl.restore();
			cl._stacks = n;
			this.addRewardToPlayer(cl, player);
		}
	}
	*/


	getExperience(){
		return Math.ceil(game.getAveragePlayerLevel()*2*this.exp_multiplier);
	}

	// Returns what players can receive a reward
	getViablePlayersForReward( reward ){

		const players = game.getTeamPlayers();
		const out = [];
		for( let player of players ){
			if( reward.testPlayer(player) )
				out.push(player);
		}
		return out;

	}

	// Gets all rewards that are viable to at least one player
	getRewards(){

		const out = [];
		for( let reward of this.rewards ){
			if( this.getViablePlayersForReward(reward).length )
				out.push(reward);
		}
		return out;

	}

	// hand out rewards etc
	onFinish( event ){
		
		this.completed = true;
		
		// Give exp
		let players = game.getTeamPlayers();
		for( let player of players )
			player.addExperience(this.getExperience());

		
		for( let reward of this.rewards ){

			// Who is eligible for this?
			players = this.getViablePlayersForReward(reward);

			// No viable players
			if( !players.length )
				continue;

			// Asset reward type
			if( reward.type === QuestReward.Types.Asset ){

				// Leveled reward
				if( reward.data.level === -1 )
					reward.data.level = game.getAveragePlayerLevel();
				
				if( reward.category !== Asset.Categories.currency && !this.multiply_reward )
					players = [players[Math.floor(Math.random()*players.length)]];

			}

			// Give said reward to each player
			for( let player of players ){

				if( reward.type === QuestReward.Types.Reputation )
					game.addFactionStanding(reward.data.faction, reward.data.amount);

				// Clonable rewards
				else{

					const asset = reward.data.clone();
					if( reward.type === QuestReward.Types.Asset ){
						
						player.addAsset(asset);
						game.ui.addText( 
							player.getColoredName()+" was rewarded "+asset.name+(asset._stacks > 1 ? ' x'+asset._stacks : '')+".", 
							undefined, 
							player.id, 
							player.id, 
							'statMessage important' 
						);

					}
					else if( reward.type === QuestReward.Types.Action )
						player.addAction(asset);	// This method outputs text

		
				}

			}

		}

		// Handle netcode
		game.onQuestCompleted(this);		
		game.removeQuest(this.id);

	}


	getVisibleObjectives(){
		return this.objectives.filter(objective => objective.isVisible());
	}
	

	/* HELPERS */
	// Creates a condition stating that the quest in the event must have the same ID as this one
	createQuestCondition(){
		return new Condition({type:Condition.Types.questIs, data:{id:this.id}});
	}

}


class QuestReward extends Generic{

	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}

	constructor(data){
		super();
		
		this.label = '';
		this.type = QuestReward.Types.Asset;
		this.data = null;
		this.conditions = [];
		
		this.load(data);
	}
	
	save( full ){

		const out = {
			type : this.type,
			data : this.data && this.data.save ? this.data.save(full) : this.data,
			conditions : Condition.saveThese(this.conditions, full)
		};

		if( full !== "mod" ){
			out.id = this.id;
		}
		else{
			out.label = this.label;
			this.g_sanitizeDefaults(out);
		}
		return out;

	}
	
	load(data){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super

		// Cast into object. This is needed for online multiplayer.
		if( this.type === QuestReward.Types.Asset )
			this.data = Asset.convertDummy(Asset.loadThis(this.data));
		if( this.type == QuestReward.Types.Action )
			this.data = Action.loadThis(this.data);

	}

	// Accepts an Asset object or label and adds it as a reward
	setAsset( asset ){
		this.type = QuestReward.Types.Asset;
		this.data = Asset.convertDummy(Asset.loadThis(asset, this), this);
	}

	setAction( action ){
		this.type = QuestReward.Types.Action;
		this.data = Action.loadThis(action, this);
	}

	// Checks if a player is viable to receive this
	testPlayer( player ){

		const evt = new GameEvent({
			asset : this.data,
			sender : player,
			target : player,
		});
		return Condition.all(this.conditions, evt);

	}

}

QuestReward.Types = {
	Asset : "Asset",
	Action : "Action",
	Reputation : "Reputation",	// {faction:(str)label, amount:(int)amount}
};

QuestReward.TypeDescs = {
	[QuestReward.Types.Asset] : "Label of an asset, or an asset object",
	[QuestReward.Types.Action] : "Label of an action",
	[QuestReward.Types.Reputation] : "{faction:(str)label, amount:(int)amount}",
};






class QuestObjective extends Generic{

	static getRelations(){ 
		return {
			events : QuestObjectiveEvent,
			visibility_conditions : Condition,
		};
	}

	constructor(data, parent){
		super();
		this.parent = parent;
		this.label = '';
		this.name = '';
		this.amount = 1;
		this._amount = 0;
		this.visibility_conditions = [];		// Conditions to show this in the log
		this.events = [];						// QuestObjectiveEvent
		this.completion_desc = '';				// Text to concat to description after completing the objective
		this.load(data);
	}

	addAmount( amount = 1, set = false ){
		if( isNaN(amount) )
			return;
		if( this._amount >= this.amount && !set )
			return;
		this._amount += amount;
		if( set )
			this._amount = amount;
		this._amount = Math.max(0,Math.min(this.amount, this._amount));
		game.renderer.drawActiveRoom();
	}

	
	save( full ){
		const out = {
			name : this.name,
			amount : this.amount,
			label : this.label,			// Needed for conditions
			visibility_conditions : Condition.saveThese(this.visibility_conditions),
			completion_desc : this.completion_desc,
		};

		if( full )
			out.events = QuestObjectiveEvent.saveThese(this.events, full);

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
		let data = Quest.saveThis(this, true);
		delete data.id;
		return new this.constructor(data, parent);
	}

	rebase(){
		this.g_rebase();	// Super
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

	isVisible(){
		return Condition.all(this.visibility_conditions, new GameEvent({}));
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

	static getRelations(){ 
		return {
			conditions : Condition,
		};
	}
	
	constructor(data, parent){
		super(data);

		this.parent = parent;
		this.label = '';
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
		else{
			out.label = this.label;
			this.g_sanitizeDefaults(out);
		}
		// No need for full since this won't be sent
		return out;
	}
	load(data){
		this.g_autoload(data);
	}
	rebase(){
		this.g_rebase();	// Super
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
	inv : "inv",			// {label : (str)assetLabel} - Custom, sets _amount to nr of inventory items. Use with inventory change condition.
	add : "add",			// {amount : (str int)amount} - Add to Formulas are allowed
	finish : "finish",		// void - Hands in the quest
};

QuestObjectiveEvent.ActionsDescs = {
	inv : "{label : (str)assetLabel} - Custom, sets _amount to nr of inventory items. Use with inventory change condition.",
	add : "{amount : (str int)amount} - Adds to the objective emount. Math formulas are allowed",
	finish : "void - Hands in the quest",
};




export {QuestObjective, QuestObjectiveEvent, QuestReward};
export default Quest;