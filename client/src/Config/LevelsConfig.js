export const LEVELS_CONFIG = {
	1: {
		mapModel: '/Models/Map_1.fbx',
		mapScale: 0.5,
		npcModels: ['/Models/NPC_2_1.fbx'],
		npcScale: 0.2,
		streetLightModels: ['/Models/Street Light_1.fbx'],
		streetLightScale: 0.4,
		npcCount: 2,
		npcSpeed: 0.45,
		timeLimit: 10,
		moodDecayRate: 0.005,
		energyDecayRate: 1,
		starConditions: {
			FINISH_LEVEL: {
				id: 'FINISH_LEVEL', 
				description: 'Пройдите уровень',
				check: gameState => gameState.isWin === true,
			},
			SWITCH_LIGHT: {
				id: 'SWITCH_LIGHT',
				description: 'Включите фонарь 1 раз',
				check: gameState => gameState.lightSwitches > 0,
			},
			KEEP_MOOD: {
				id: 'KEEP_MOOD',
				description: 'Не дайте недовольству подняться выше 50%',
				check: gameState => gameState.maxNpcMood < 50,
			},
		},
		streetLights: [
			{ position: [-130, 130, 360], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [-130, 130, -515], rotation: [0, Math.PI * 1.5, 0] },
			{ position: [255, 130, -90], rotation: [0, 0, 0] },
		],
		npcSpawns: [
			[-70, 2, -715],
			[460, 2, -150],
		],
		npcPaths: [
			[
				{ x: -75, z: -715 },
				{ x: -70, z: 430 },
			],
			[
				{ x: 460, z: -150 },
				{ x: -70, z: -150 },
				{ x: -70, z: -715 },
			],
		],
		music: '/audio/Music_1.mp3',
		musicVolume: 0.25,
	},
	2: {
		mapModel: '/Models/Map_2.fbx',
		mapScale: 0.1,
		npcModels: ['/Models/NPC_2_1.fbx', '/Models/NPC_2_2.fbx'],
		npcScale: 0.12,
		streetLightModels: ['/Models/Street Light_2.fbx'],
		streetLightScale: 0.09,
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
		music: '/audio/Music_2.mp3',
		musicVolume: 0.25,
	},
	3: {
		mapModel: '/Models/Map_3.fbx',
		mapScale: 0.1,
		npcModels: ['/Models/NPC_3_1.fbx', '/Models/NPC_3_2.fbx'],
		npcScale: 0.12,
		streetLightModels: ['/Models/Street Light_3.fbx'],
		streetLightScale: 0.09,
		npcCount: 4,
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
			[-815, 2, 400],
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
				{ x: 200, z: 80 },
				{ x: -815, z: 80 },
				{ x: -815, z: -215 },
				{ x: -915, z: -215 },
				{ x: -915, z: -325 },
				{ x: -900, z: -325 },
				{ x: -900, z: -745 },
			],
			[
				{ x: -815, z: 400 },
				{ x: -400, z: 400 },
				{ x: -400, z: -225 },
				{ x: -815, z: -225 },
				{ x: -815, z: 400 },
			],
		],
		music: '/audio/Music_3.mp3',
		musicVolume: 0.25,
	},
}
