
const lib = {
	yuug_port_tavern : {
		name : 'Yuug Port Tavern',
		player : 'yuug_port_barkeep',
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
		player : 'Slurt',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:3}
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
