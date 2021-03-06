
const lib = {
	yuug_port_tavern : {
		name : 'Yuug Port Tavern',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:1},
			{id:"minorHealingPotion", asset:'minorHealingPotion', amount:3},
			{id:"fish", asset:'food_FriedFish', amount:20, restock_rate:80000},
			{id:"ale", asset:'food_Ale', amount:50, restock_rate:80000},
		]
	},

	yuug_portswood_merchant : {
		name : 'Midway Caravan',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:4},
			{id:"minorHealingPotion", asset:'minorHealingPotion', amount:2},
			{id:"ale", asset:'food_Ale', amount:3},
			{id:"yuug_portswood_silk_thong", asset:'yuug_portswood_silk_thong', amount:1, restock_rate:0},
		]
	},

	yuug_city_greasy_backdoor : {
		name : 'Greasy Backdoor Tavern',
		conditions : [],
		items : [
			{id:"ale", asset:'food_Ale', amount:20, restock_rate:80000},
			{id:"fish", asset:'food_FriedFish', amount:20, restock_rate:80000},
		]
	},

	yuug_necro_tavern : {
		name : 'The Undertavern',
		conditions : [],
		items : [
			{id:"ale", asset:'food_Ale', amount:20, restock_rate:80000},
			{id:"fish", asset:'food_FriedFish', amount:20, restock_rate:80000},
			{id:"manaPotion", asset:'manaPotion', amount:5, restock_rate:80000},
		]
	},

	yuug_necro_quartermaster : {
		name : 'Necromancer Quartermaster',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:5, restock_rate:80000},
			{id:"healingPotion", asset:'healingPotion', amount:5, restock_rate:80000},
			{id:"boneRod", asset:'boneRod', amount:1, restock_rate:80000},
			{id:"genericCottonThong", asset:'genericCottonThong', amount:3, restock_rate:80000},
			{id:"genericNecromancerRobe", asset:'genericNecromancerRobe', amount:3, restock_rate:80000},
		]
	},

	debugShop : {
		name : 'DEBUG SHOP',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:4},
			{id:"minorHealingPotion", asset:'minorHealingPotion', amount:-1},
			{id:"ale", asset:'food_Ale', amount:3},
			{id:"yuug_portswood_silk_thong", asset:'yuug_portswood_silk_thong', amount:1, restock_rate:0},
		]
	}
}; 

function getArray(){
	const out = [];
	for( let action in lib ){
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export {getArray};
export default lib;
