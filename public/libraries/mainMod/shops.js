
const lib = {
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
