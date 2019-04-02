const lib = {
	first_quest_pickup: {
		stages: [
			{
				index: 0,
				name: "Tavernkeeper",
				text: "OI! Wake up ya damn drunk!",
				options: [
					{
						text: "What?",
						index: 1
					}
				]
			},
			{
				index: 1,
				name: "Tavernkeeper",
				text: "Yer friends left ya here after racking up a massive tab. And I've no idea how ya lost all yer clothes.",
				options: [
					{
						text: "What friends?",
						index: 2
					}
				]
			},
			{
				index: 2,
				name: "Tavernkeeper",
				text: "Look all I know is ye owe me money. But if ye have none, I may 'ave a job for ya!",
				options: [
					{
						text: "Ok?",
						index: 3
					}
				]
			},
			{
				index: 3,
				name: "Tavernkeeper",
				text: "To the west be a cocktopus cave. Problem is they be migrating towards this here port.",
				options: [
					{
						text: "And you want me to take care of them?",
						index: 4
					}
				]
			},
			{
				index: 4,
				name: "Tavernkeeper",
				text: "Aye and go check out the cave while yer at it. Do this and I will write off your tab, maybe even throw in a little something from the lost 'n found box!",
				options: [
					{
						text: "Ok",
						index: -1
					}
				]
			}
		],
		player: "yuug_port_barkeep",
		allow_resume: false
	}
};


function getArray() {
	const out = [];
	for (let action in lib) {
		const l = lib[action];
		l.label = action;
		out.push(l);
	}
	return out;
};

export { getArray };
export default lib;