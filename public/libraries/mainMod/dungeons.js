const lib = [
	{
		label : "yuug",
		name : "Yuug",
		rooms : [
			{
				outdoors : true,
				zoom : 700,
				discovered : true,
				assets : [
				{
					absolute : true,
					model : "Land.Yuug.Yuug",
					type : "room",
					attachments : [0],
					locked : false
				},
				{
					absolute : true,
					model : "Land.Yuug.Capital",
					type : "exit",
					data : {
						label : "Capital"
					},
					attachments : [0],
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Wallburg",
					type : "exit",
					data : {
						label : "Wallburg"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Westwood",
					type : "exit",
					data : {
						label : "Westwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Eastwood",
					type : "exit",
					data : {
						label : "Eastwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Southwood",
					type : "exit",
					data : {
						label : "Southwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.MidwayFarm",
					type : "exit",
					data : {
						label : "Midway Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Cottaga",
					type : "exit",
					data : {
						label : "Cottaga"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Eaststead",
					type : "exit",
					data : {
						label : "Eaststead"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.WallwayFarm",
					type : "exit",
					data : {
						label : "Wallway Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.EastwoodFarm",
					type : "exit",
					data : {
						label : "Eastwood Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Seawatch",
					type : "exit",
					data : {
						label : "Seawatch"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.AbandonedCottage",
					type : "exit",
					data : {
						label : "Abandoned Cottage"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.WestwallFarm",
					type : "exit",
					data : {
						label : "Westwall Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Port",
					type : "exit",
					data : {
						label : "Yuug Port"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Wall",
					type : "prop"
				}
				],
				"ambiance":"media/audio/ambiance/dungeon.ogg",
				"ambiance_volume":0.2
			}
		]
	},
	{
		label : "yuug_port",
		name : "Yuug Port",
		rooms : [
			{
				outdoors : true,
				discovered : false,
				assets : [
				{
					absolute : true,
					model : "Land.Yuug.Port.LandMid",
					type : "room",
					data : {

					}
				},
				{
					absolute : true,
					model : "Land.Yuug.Ocean",
					type : "prop",
					data : {

					}
				},
				{
					absolute : true,
					model : "Land.Yuug.Port.JettyMid",
					type : "prop",
					data : {

					}
				}
				],
				"ambiance":"media/audio/ambiance/dungeon.ogg",
				"ambiance_volume":0.2
			}
		]
	}
];


export default lib;
