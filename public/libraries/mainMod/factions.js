
const lib = {
	yuug_necromancer : {
		name : 'Yuug Necromancers',
	},
	yuug_priests : {
		name : 'Yuug Priests',
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
