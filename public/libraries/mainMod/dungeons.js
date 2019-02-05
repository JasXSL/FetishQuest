const lib = [
	// Yuug world
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
					attachments : [0],
					locked : false
				},
				{
					absolute : true,
					model : "Land.Yuug.Capital",
					data : {
						label : "Capital"
					},
					attachments : [0],
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Wallburg",
					data : {
						label : "Wallburg"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Westwood",
					data : {
						label : "Westwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Eastwood",
					data : {
						label : "Eastwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Southwood",
					data : {
						label : "Southwood"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.MidwayFarm",
					data : {
						label : "Midway Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Cottaga",
					data : {
						label : "Cottaga"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Eaststead",
					data : {
						label : "Eaststead"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.WallwayFarm",
					data : {
						label : "Wallway Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.EastwoodFarm",
					data : {
						label : "Eastwood Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Seawatch",
					data : {
						label : "Seawatch"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.AbandonedCottage",
					data : {
						label : "Abandoned Cottage"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.WestwallFarm",
					data : {
						label : "Westwall Farm"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Port",
					data : {
						label : "Yuug Port"
					},
					locked : true
				},
				{
					absolute : true,
					model : "Land.Yuug.Wall",
				}
				],
				"ambiance":"media/audio/ambiance/dungeon.ogg",
				"ambiance_volume":0.2
			}
		]
	},
	// Yuug port
	{
		label : "yuug_port",
		name : "Yuug Port",
		rooms : [
			{
				outdoors : true,
				discovered : false,
				assets : [
				
					{
						"id": "d9b3857c-f97d-1851-02cf-6d8436bcf100",
						"model": "Land.Yuug.Port.LandMid",
						"absolute": true,
						"room": true
					},
					{
						"id": "b39537fc-c242-548a-0e25-8b06df8677d6",
						"model": "Land.Yuug.Ocean",
						"y": -4.14,
						"absolute": true
					},
					{
						"id": "b93298a7-be0e-b423-59bc-b8d8a81fa733",
						"model": "Land.Yuug.Port.JettyMid",
						"absolute": true
					},
					{
						"id": "35de9c00-c45f-c806-2ca5-3bf0960c9fa2",
						"model": "Structure.Cottage",
						"x": -330,
						"y": 110,
						"z": -215,
						"absolute": true
					},
					{
						"id": "65d65778-7cc3-2df7-4e80-14fcee365128",
						"model": "Structure.CottageBent",
						"x": -48,
						"y": 119,
						"z": -206,
						"absolute": true
					},
					{
						"id": "ed031ccf-72d7-1aa4-8d4b-0092b2dae7a9",
						"model": "Structure.Cottage2StoryB",
						"x": 353.69,
						"y": 116.73,
						"z": -188.41,
						"absolute": true
					},
					{
						"id": "288dbdc6-ec0b-c1b6-9b82-5b8c599dcedb",
						"model": "Nature.Trees.RoundA",
						"x": 290.5,
						"y": 110.76,
						"z": -337.46,
						"absolute": true
					},
					{
						"id": "9f199249-f35f-3ae7-84bb-93fa0b2cd215",
						"model": "Nature.Trees.RoundB",
						"x": -95.65,
						"y": 113.16,
						"z": -364.68,
						"absolute": true
					},
					{
						"id": "2aeef5a6-d26d-f0c2-b9d1-14f51870fdb5",
						"model": "Nature.Trees.RoundC",
						"x": -393.58,
						"y": 93.9,
						"z": -423.01,
						"scaleX": 1.43,
						"scaleY": 1.43,
						"scaleZ": 1.43,
						"absolute": true
					},
					{
						"id": "80c44b9c-aaf2-c0ed-23a6-3ba26316bf37",
						"model": "Generic.Containers.Crate",
						"x": 232.07,
						"y": 123.78,
						"z": -61.47,
						"rotY": 0.15,
						"scaleX": 0.59,
						"scaleY": 0.59,
						"scaleZ": 0.59,
						"tags": [
						"m_crate"
						],
						"absolute": true
					},
					{
						"id": "ba7ed8a0-968b-d262-1cea-57c78d09ddc1",
						"model": "Generic.Containers.CrateOpen",
						"x": 300.69,
						"y": 118.96,
						"z": -62.82,
						"scaleX": 0.58,
						"scaleY": 0.58,
						"scaleZ": 0.58,
						"absolute": true
					},
					{
						"id": "16263b67-a6a4-3a81-ce1d-cf5783ea1799",
						"model": "Generic.Containers.Barrel",
						"x": 126.55,
						"y": 113.78,
						"z": 285.62,
						"scaleX": 0.53,
						"scaleY": 0.53,
						"scaleZ": 0.53,
						"tags": [
						"m_barrel"
						],
						"absolute": true
					},
					{
						"id": "1f73d8e5-a5bf-1632-7cf5-80a82af6158e",
						"model": "Generic.Containers.Barrel",
						"x": 173.95,
						"y": 110.4,
						"z": 232.01,
						"scaleX": 0.72,
						"scaleY": 0.72,
						"scaleZ": 0.72,
						"tags": [
						"m_barrel"
						],
						"absolute": true
					},
					{
						"id": "efdd3ebf-44c8-c7c0-7a2a-1672fdc50d50",
						"model": "Generic.Containers.Barrel",
						"x": -195.63,
						"y": 124.22,
						"z": -84.54,
						"scaleX": 0.58,
						"scaleY": 0.58,
						"scaleZ": 0.58,
						"tags": [
						"m_barrel"
						],
						"absolute": true
					},
					{
						"id": "82bad42c-9a9d-c559-cd65-f2b4cfac1374",
						"model": "Farm.Furniture.Bench",
						"x": -269.4,
						"y": 111.51,
						"z": -328.53,
						"scaleX": 0.81,
						"scaleY": 0.81,
						"scaleZ": 0.81,
						"tags": [
						"m_bench"
						],
						"absolute": true
					},
					{
						"id": "e69656f1-13eb-5005-5336-a9de6b30cc73",
						"model": "Farm.Furniture.Bench",
						"x": -409.75,
						"y": 125.82,
						"z": -107.05,
						"scaleX": 0.72,
						"scaleY": 0.72,
						"scaleZ": 0.72,
						"tags": [
						"m_bench"
						],
						"absolute": true
					}
				],
				"ambiance":"media/audio/ambiance/dungeon.ogg",
				"ambiance_volume":0.2
			}
		]
	}
];


export default lib;
