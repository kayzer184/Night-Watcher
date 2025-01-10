export const LEVELS_CONFIG = {
	1: {
		mapModel: '/Models/Map_1.fbx',
		npcModels: ['/Models/NPC_1_1.fbx', '/Models/NPC_1_2.fbx'],
		streetLightModels: ['/Models/Street Light_1.fbx'],
		npcCount: 3,
		npcSpeed: 0.33,
		timeLimit: 90,
		moodDecayRate: 0.003,
		energyDecayRate: 1,
		starConditions: {
			MISSION_COMPLETED: {
				id: 'MISSION_COMPLETED',
				description: 'Пройдите уровень',
				check: gameState => gameState.isWin === true,
			},
			MOOD_CONTROL: {
				id: 'MOOD_CONTROL',
				description: 'Держите недовольство ниже 80%',
				check: gameState => gameState.maxNpcMood < 80,
			},
			ENERGY_SAVE: {
				id: 'ENERGY_SAVE',
				description: 'Сохраните более 25% энергии',
				check: gameState => gameState.energy >= 25,
			},
		},
		streetLights: [
			{ position: [-223, 108, 55], rotation: [0, 0, 0] },
			{ position: [60, 108, 330], rotation: [0, Math.PI / 2, 0] },
			{ position: [60, 108, 930], rotation: [0, Math.PI / 2, 0] },
			{ position: [-245, 108, 1117], rotation: [0, Math.PI / 2, 0] },
			{ position: [-655, 108, 780], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [-660, 108, 358], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [-240, 108, 650], rotation: [0, 0, 0] },
		],
		npcSpawns: [
			[80, 2, -80],
			[-80, 2, -80],
			[-680, 2, -80],
			[80, 2, 1280],
			[-680, 2, 1280],
		],
		npcPaths: [
			[
				{ x: 80, z: -80 },
				{ x: 80, z: 1280 },
				{ x: -680, z: 1280 },
				{ x: -680, z: -80 },
				{ x: -680, z: 520 },
				{ x: -80, z: 520 },
				{ x: -80, z: -80 },
			],
			[
				{ x: -80, z: -80 },
				{ x: 80, z: -80 },
				{ x: 75, z: 675 },
				{ x: -520, z: 680 },
				{ x: -520, z: 1280 },
				{ x: -680, z: 1280 },
				{ x: -680, z: 1110 },
				{ x: -520, z: 1110 },
				{ x: -520, z: 680 },
				{ x: -510, z: 80 },
				{ x: -80, z: 80 },
				{ x: -80, z: -80 },
			],
			[
				{ x: -680, z: -80 },
				{ x: -685, z: 510 },
				{ x: -510, z: 520 },
				{ x: -80, z: 520 },
				{ x: -80, z: 1110 },
				{ x: -80, z: 1280 },
				{ x: -520, z: 1280 },
				{ x: -520, z: 1110 },
				{ x: -520, z: 680 },
				{ x: -80, z: 680 },
				{ x: -80, z: -80 },
				{ x: -680, z: -80 },
			],
			[
				{ x: 80, z: 1280 },
				{ x: 80, z: 1120 },
				{ x: -80, z: 1120 },
				{ x: -80, z: 520 },
				{ x: -80, z: 520 },
				{ x: -680, z: 520 },
				{ x: -680, z: 80 },
				{ x: 80, z: 80 },
				{ x: 80, z: 680 },
				{ x: -680, z: 680 },
				{ x: -680, z: 1120 },
				{ x: -520, z: 1120 },
				{ x: -520, z: 1280 },
				{ x: 80, z: 1280 },
			],
			[
				{ x: -680, z: 1280 },
				{ x: -680, z: 680 },
				{ x: -80, z: 680 },
				{ x: -80, z: 1120 },
				{ x: 80, z: 1120 },
				{ x: 80, z: 1280 },
				{ x: -680, z: 1280 },
			],
		],
		music: '/audio/Music_1.mp3',
		musicVolume: 0.5,
	},
	2: {
		mapModel: '/Models/Map_2.fbx',
		npcModels: ['/Models/NPC_2_1.fbx', '/Models/NPC_2_2.fbx'],
		streetLightModels: ['/Models/Street Light_2.fbx'],
		npcCount: 2,
		npcSpeed: 0.4,
		timeLimit: 75,
		moodDecayRate: 0.003,
		energyDecayRate: 1,
		starConditions: {
			PERFECT_MOOD: {
				id: 'PERFECT_MOOD',
				description: 'Держите недовольство ниже 70%',
				check: gameState => gameState.npcMood < 70,
			},
			ENERGY_MASTER: {
				id: 'ENERGY_MASTER',
				description: 'Сохраните более 50% энергии',
				check: gameState => gameState.energy > 50,
			},
			EVENT_HANDLER: {
				id: 'EVENT_HANDLER',
				description: 'Справьтесь с 3 случайными событиями',
				check: gameState => gameState.handledEvents >= 3,
			},
		},
		streetLights: [
			{ position: [-1100, 105, 175], rotation: [0, 0, 0] },
			{ position: [-550, 105, 180], rotation: [0, 0, 0] },
			{ position: [-20, 105, 180], rotation: [0, 0, 0] },
			{ position: [220, 105, -135], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [220, 105, -600], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [-610, 105, 400], rotation: [0, Math.PI, 0] },
			{ position: [-810, 105, -60], rotation: [0, Math.PI / 2, 0] },
			{ position: [-1100, 105, -330], rotation: [0, Math.PI, 0] },
			{ position: [-575, 105, -330], rotation: [0, Math.PI, 0] },
			{ position: [-415, 105, -85], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [-70, 105, -740], rotation: [0, 0, 0] },
			{ position: [-545, 105, -740], rotation: [0, 0, 0] },
			{ position: [-910, 105, -545], rotation: [0, Math.PI * 1.5, 0] },
		],
		npcSpawns: [
			[-1300, 2, 170],
			[310, 2, -275],
		],
		npcPaths: [
			[
				{ x: -1300, z: 170 },
				{ x: -920, z: 170 },
				{ x: -920, z: 80 },
				{ x: -900, z: 70 },
				{ x: -900, z: -210 },
				{ x: -800, z: -210 },
				{ x: -800, z: -315 },
				{ x: -815, z: -315 },
				{ x: -815, z: -725 },
				{ x: -800, z: -745 },
				{ x: 200, z: -725 },
				{ x: 220, z: 725 },
				{ x: 220, z: 60 },
			],
			[
				{ x: 310, z: -275 },
				{ x: 310, z: -90 },
				{ x: 220, z: -90 },
				{ x: 220, z: 60 },
				{ x: 310, z: 60 },
				{ x: 200, z: 80 },
			],
		],
		music: '/audio/Music_1.mp3',
		musicVolume: 0.5,
	},
	3: {
		mapModel: '/Models/Map_3.fbx',
		npcModels: ['/Models/NPC_0.fbx', '/Models/NPC_1.fbx', '/Models/NPC_2.fbx'],
		streetLightModels: [
			'/Models/Street Light_1.fbx',
			'/Models/Street Light_2.fbx',
		],
		npcCount: 5,
		npcSpeed: 0.45,
		timeLimit: 60,
		moodDecayRate: 0.005,
		energyDecayRate: 1.5,
		starConditions: {
			MOOD_EXPERT: {
				id: 'MOOD_EXPERT',
				description: 'Держите недовольство ниже 60%',
				check: gameState => gameState.npcMood < 60,
			},
			ENERGY_EXPERT: {
				id: 'ENERGY_EXPERT',
				description: 'Сохраните более 40% энергии',
				check: gameState => gameState.energy > 40,
			},
			GROUP_MASTER: {
				id: 'GROUP_MASTER',
				description: 'Успешно разрешите групповую панику',
				check: gameState => gameState.handledGroupPanics > 0,
			},
		},
		streetLights: [],
		npcSpawns: [],
		npcPaths: [],
	},
}
