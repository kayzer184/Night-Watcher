import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import addStreetLight from './Street Light'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'

function MapLoader(
	lightObjects,
	hitboxes,
	collidableObjects,
	scene,
	level = 1,
	ambientLightIntensity,
	onLoad
) {
	const levelConfig = LEVELS_CONFIG[level]

	const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightIntensity)
	scene.add(ambientLight)

	const MapModelLoader = new FBXLoader()
	MapModelLoader.load(
		levelConfig.mapModel,
		object => {
			object.scale.set(0.1, 0.1, 0.1)
			object.position.set(0, 0, 0)

			object.traverse(child => {
				if (child.isMesh) {
					child.castShadow = true
					child.receiveShadow = true
					const box = new THREE.Box3().setFromObject(child)
					collidableObjects.push({ object: child, box: box })
				}
			})

			scene.add(object)
		},
		undefined,
		error => {
			console.error('Error loading Map model:', error)
		}
	)

	levelConfig.streetLights.forEach(light => {
		const [x, y, z] = light.position
		const [xR, yR, zR] = light.rotation
		addStreetLight(lightObjects, hitboxes, scene, x, y, z, xR, yR, zR, level)
	})

	if (onLoad) {
		onLoad({ ambientLight })
	}

	return {
		ambientLight,
	}
}

export default MapLoader
