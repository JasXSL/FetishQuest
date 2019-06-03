
const lib = {
    yuug_portswood_merchant : {
		player : 'yuug_portswood_merchant',
		conditions : [],
		items : [
			{id:"manaPotion", asset:'manaPotion', amount:3, cost:150}
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
