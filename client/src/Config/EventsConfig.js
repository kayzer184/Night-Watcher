export const EVENTS_CONFIG = {
	LEVEL_1: {
		DRUNK_NPC: {
			id: 'DRUNK_NPC',
			duration: 5000,
			conditions: gameState => {
				return gameState.npcMood < 80 && gameState.NPCObjects.length > 0
			},
			action: (gameState, targetNPC) => {
				targetNPC.previousState = {
					speed: targetNPC.speed,
					currentTarget: targetNPC.currentTarget,
					path: targetNPC.path ? [...targetNPC.path] : [],
				}
				targetNPC.speed *= 0.5
				targetNPC.isInEvent = true
			},
			cleanup: targetNPC => {
				if (targetNPC.previousState) {
					targetNPC.speed = targetNPC.previousState.speed
					targetNPC.currentTarget = targetNPC.previousState.currentTarget
					targetNPC.path = targetNPC.previousState.path
						? [...targetNPC.previousState.path]
						: []
					targetNPC.isInEvent = false
				}
			},
		},
		RUNNING_NPC: {
			id: 'RUNNING_NPC',
			duration: 3000,
			conditions: gameState => {
				return gameState.energy > 30 && gameState.NPCObjects.length > 0
			},
			action: (gameState, targetNPC) => {
				targetNPC.previousState = {
					speed: targetNPC.speed,
				}
				targetNPC.speed *= 2
				targetNPC.isInEvent = true
			},
			cleanup: targetNPC => {
				if (targetNPC.previousState) {
					targetNPC.speed = targetNPC.previousState.speed
					targetNPC.isInEvent = false
				}
			},
		},
	},
	LEVEL_2: {
		LOST_NPC: {
			id: 'LOST_NPC',
			duration: 8000,
			conditions: gameState => {
				return gameState.npcMood < 90 && gameState.NPCObjects.length > 0
			},
			action: (gameState, targetNPC) => {
				targetNPC.previousState = {
					path: targetNPC.path ? [...targetNPC.path] : [],
					currentTarget: targetNPC.currentTarget,
				}
				// Создаем временный случайный маршрут
				targetNPC.path = [
					{
						x: targetNPC.model.position.x + (Math.random() * 200 - 100),
						z: targetNPC.model.position.z + (Math.random() * 200 - 100),
					},
				]
				targetNPC.currentTarget = 0
				targetNPC.isInEvent = true
			},
			cleanup: targetNPC => {
				if (targetNPC.previousState) {
					targetNPC.path = targetNPC.previousState.path
						? [...targetNPC.previousState.path]
						: []
					targetNPC.currentTarget = targetNPC.previousState.currentTarget
					targetNPC.isInEvent = false
				}
			},
		},
		PANIC_NPC: {
			id: 'PANIC_NPC',
			duration: 4000,
			conditions: gameState => {
				return gameState.energy < 50 && gameState.NPCObjects.length > 0
			},
			action: (gameState, targetNPC) => {
				targetNPC.previousState = {
					speed: targetNPC.speed,
				}
				targetNPC.speed *= 1.5
				targetNPC.isInEvent = true
			},
			cleanup: targetNPC => {
				if (targetNPC.previousState) {
					targetNPC.speed = targetNPC.previousState.speed
					targetNPC.isInEvent = false
				}
			},
		},
	},
	LEVEL_3: {
		GROUP_PANIC: {
			id: 'GROUP_PANIC',
			duration: 6000,
			conditions: gameState => {
				return gameState.npcMood > 60 && gameState.NPCObjects.length >= 3
			},
			action: (gameState, targetNPC) => {
				const nearbyNPCs = gameState.NPCObjects.filter(
					npc => npc.model.position.distanceTo(targetNPC.model.position) < 200
				)

				nearbyNPCs.forEach(npc => {
					npc.previousState = {
						speed: npc.speed,
					}
					npc.speed *= 1.8
					npc.isInEvent = true
				})
			},
			cleanup: (targetNPC, gameState) => {
				if (targetNPC.previousState) {
					const nearbyNPCs = gameState.NPCObjects.filter(
						npc => npc.model.position.distanceTo(targetNPC.model.position) < 200
					)

					nearbyNPCs.forEach(npc => {
						if (npc.previousState) {
							npc.speed = npc.previousState.speed
							npc.isInEvent = false
						}
					})
				}
			},
		},
	},
}
