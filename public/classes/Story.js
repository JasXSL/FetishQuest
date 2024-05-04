import GameAction from './GameAction.js';
import Player from './Player.js';
import Generic from './helpers/Generic.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';
import PlayerGalleryTemplate from './templates/PlayerGalleryTemplate.js';

export default class Story extends Generic{

	static getRelations(){ 
		return {
			player_options : PlayerGalleryTemplate,
			npcs : Player,
			game_actions : GameAction,
			death_actions : GameAction,
		};
	}

	constructor(data, parent){
		super(data);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.desc = '';
		this.icon = '';
		
		this.battle_won_hp_regen = 0.1;		// Amount of HP restored when winning a battle, multiplied by max HP
		this.max_nr_player_options = 0;		// use 0 for no max
		this.min_nr_player_options = 1;		// NR options you can pick from
		this.player_options = [];			// PlayerGalleryTemplate objects you can pick from
		this.allow_gallery = false;			// Allow players from the gallery table
		this.npcs = [];						// Player objects that will be added as NPCs on your team
		
		this.max_level = 14;
		this.freeze_time = false;			// 
		this.leveled_gear = false;			// Removes levels from equipment
		this.no_exp = false;				// Removes experience

		this.disable_awareness = false;		// Disables awareness system
		this.death_actions = [];			// Game actions to run on death.
		this.death_action_override = false;	// Prevents the default revive
		this.no_kinks = false;				// Don't auto generate kinks

		this.no_std_actions = false;		// Prevents actions marked as "standard" from being automatically added.

		// Picks what templates are allowed from autoloot. Note that these only affect autoloot!
		// Note: These are always IDs
		this.allowed_templates_armor = [];
		this.allowed_templates_material = [];

		this.start_dungeon = '';			// label of dungeon to start in
		this.start_cell = '';

		this.game_actions = [];				// Game actions to run on game start
		
		this.load(data);
	}

	save( full ){

		const out = {
			label : this.label,
			name : this.name,
			desc : this.desc,
			icon : this.icon,
			max_nr_player_options: this.max_nr_player_options,
			min_nr_player_options: this.min_nr_player_options,
			player_options : PlayerGalleryTemplate.saveThese(this.player_options, full),
			npcs : Player.saveThese(this.npcs, full),
			start_dungeon : this.start_dungeon,
			allow_gallery : this.allow_gallery,
			start_cell : this.start_cell,
			max_level : this.max_level,
			allowed_templates_armor : this.allowed_templates_armor,
			allowed_templates_material : this.allowed_templates_material,
			freeze_time : this.freeze_time,
			leveled_gear : this.leveled_gear,
			death_action_override : this.death_action_override,
			no_kinks : this.no_kinks,
			battle_won_hp_regen: this.battle_won_hp_regen,
			 
		};

		if( full ){
			out.no_std_actions = this.no_std_actions;
			out.game_actions = GameAction.saveThese(this.game_actions, full); // These are reset when starting the game
			out.death_actions = GameAction.saveThese(this.death_actions, full); // These are reset when starting the game
		}
		if( full !== "mod" ){

		}
		else{
			this.g_sanitizeDefaults(out);
		}
		return out;
	}

	onGameStart(){
		this.game_actions = []; // Wipe the game actions after running them
		this.player_options = [];
		this.npcs = [];
	}

	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

}
