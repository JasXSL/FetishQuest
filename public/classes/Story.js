import GameAction from './GameAction.js';
import Player from './Player.js';
import Generic from './helpers/Generic.js';
import AssetTemplate, { MaterialTemplate } from './templates/AssetTemplate.js';

export default class Story extends Generic{

	static getRelations(){ 
		return {
			player_options : Player,
			npcs : Player,
			game_actions : GameAction,
		};
	}

	constructor(data, parent){
		super(data);

		this.parent = parent;			// Either a roleplay or dungeon asset
		this.label = '';
		this.name = '';
		this.desc = '';
		this.icon = '';
		
		this.max_nr_player_options = 0;		// use 0 for no max
		this.min_nr_player_options = 1;		// NR options you can pick from
		this.player_options = [];			// Player objects you can pick from
		this.allow_gallery = false;			// Allow players from the gallery table
		this.npcs = [];						// Player objects that will be added as NPCs on your team
		
		this.max_level = 14;
		this.freeze_time = false;			// 
		this.leveled_gear = false;			// Removes levels from equipment
		
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
			player_options : Player.saveThese(this.player_options, full),
			npcs : Player.saveThese(this.npcs, full),
			start_dungeon : this.start_dungeon,
			allow_gallery : this.allow_gallery,
			start_cell : this.start_cell,
			max_level : this.max_level,
			allowed_templates_armor : this.allowed_templates_armor,
			allowed_templates_material : this.allowed_templates_material,
			freeze_time : this.freeze_time,
			leveled_gear : this.leveled_gear,
		};

		if( full )
			out.game_actions = GameAction.saveThese(this.game_actions, full); // These are reset when starting the game

		if( full !== "mod" ){

		}
		else{
			
			this.g_sanitizeDefaults(out);
		}
		return out;
	}


	load( data ){
		this.g_autoload(data);
	}

	rebase(){
		this.g_rebase();	// Super
	}

}
