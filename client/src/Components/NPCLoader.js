import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}

export default function NPCLoader(
	NPCObjects,
	NPCMaxCount,
	mixers,
	scene,
	level = 1
) {
	const levelConfig = LEVELS_CONFIG[level]
	const NPCModelLoader = new FBXLoader()

	const indices = Array.from(
		{ length: levelConfig.npcSpawns.length },
		(_, i) => i
	)
	shuffle(indices)
	const spawnIndices = indices.slice(
		0,
		Math.min(levelConfig.npcCount, levelConfig.npcSpawns.length)
	)

	spawnIndices.forEach(index => {
		NPCModelLoader.load(
			`/Models/NPC_${Math.round(Math.random() * 0)}.fbx`,
			NPC => {
				const mixer = new THREE.AnimationMixer(NPC)
				mixers.push(mixer)

				const action = mixer.clipAction(NPC.animations[0], NPC)
				action.play()

				const spawn = levelConfig.npcSpawns[index]
				const path = levelConfig.npcPaths[index]

				NPC.scale.set(0.12, 0.12, 0.12)
				NPC.position.set(spawn[0], spawn[1], spawn[2])
				scene.add(NPC)

				const npcData = {
					model: NPC,
					mixer: mixer,
					path: path,
					action: action,
					currentTarget: 1,
					speed: levelConfig.npcSpeed,
					initialPosition: { x: spawn[0], y: spawn[1], z: spawn[2] },
				}
				NPCObjects.push(npcData)

				NPC.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true
						child.receiveShadow = true
					}
				})
			},
			undefined,
			error => {
				console.error('Error loading NPC model:', error)
			}
		)
	})
}
