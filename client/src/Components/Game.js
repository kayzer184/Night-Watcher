import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import '../Sass/Game.scss'
import MapLoader from './MapLoader'
import NPCLoader from './NPCLoader'
import Interface from './Interface'

function Game() {
	const mountRef = useRef(null)
	const raycaster = new THREE.Raycaster()
	const mouse = new THREE.Vector2()
	const [collidableObjects, mixers, hitboxes] = [[], [], []]
	const NPCObjects = useRef([])
	const [npcMood, setNpcMood] = useState(100)
	const [energy, setEnergy] = useState(100)
	const [timeLeft, setTimeLeft] = useState(60)
	const [NPCMoodDecayRate, setNPCMoodDecayRate] = useState(0.05)
	const [energyDecayRate, setEnergyDecayRate] = useState(1)
	const [isWin, setIsWin] = useState(null)
	const isPausedRef = useRef(false)
	const [isPaused, setIsPaused] = useState(false)
	const lightObjects = useRef([])
	const lastEnergyUpdateRef = useRef(Date.now())

	// Константы для контроля итераций
	const ITERATIONS_PER_SECOND = 120 // Желаемое количество итераций в секунду
	const TICK_LENGTH = 724 / ITERATIONS_PER_SECOND // Длительность одной итерации в мс

	// Рефы для контроля времени
	const lastTickRef = useRef(0)
	const lastFrameTimeRef = useRef(0)

	const resetGame = () => {
		setIsWin(null)
		setNpcMood(100)
		setEnergy(100)
		setTimeLeft(60)
		isPausedRef.current = false
		setIsPaused(false)

		NPCObjects.current.forEach(npc => {
			npc.mixer.timeScale = isPausedRef.current ? 0 : 1
			npc.currentTarget = 0
			npc.model.position.set(
				npc.initialPosition.x,
				npc.initialPosition.y,
				npc.initialPosition.z
			)
		})

		lightObjects.current.forEach(lightObject => {
			lightObject.light.visible = lightObject.initialState
		})

		lastEnergyUpdateRef.current = Date.now()
	}

	useEffect(() => {
		const scene = new THREE.Scene()
		scene.background = new THREE.Color(0x000000)

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			10,
			10000
		)
		camera.position.set(0, 500, 20)

		const renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.shadowMap.enabled = true
		renderer.physicallyCorrectLights = true

		if (mountRef.current) mountRef.current.appendChild(renderer.domElement)

		const controls = new OrbitControls(camera, renderer.domElement)
		controls.enableDamping = true
		controls.dampingFactor = 0.25
		controls.maxPolarAngle = Math.PI / 2

		MapLoader(lightObjects.current, hitboxes, collidableObjects, scene)
		NPCLoader(NPCObjects.current, 3, mixers, scene)

		const onWindowResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight
			camera.updateProjectionMatrix()
			renderer.setSize(window.innerWidth, window.innerHeight)
		}

		const toggleLight = (light, index) => {
			light.visible = !light.visible
		}

		const onMouseClick = event => {
			if (!isPausedRef.current) {
				mouse.x = (event.clientX / window.innerWidth) * 2 - 1
				mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

				raycaster.setFromCamera(mouse, camera)
				const intersects = raycaster.intersectObjects(scene.children, true)

				if (intersects.length > 0) {
					const intersection = intersects[0]
					console.log(
						`x: ${intersection.point.x}, y: ${intersection.point.y}, z: ${intersection.point.z}`
					)
					hitboxes.forEach(({ box }, index) => {
						if (box.containsPoint(intersection.point)) {
							const light = lightObjects.current[index].light
							toggleLight(light, index)
						}
					})
				}
			}
		}

		window.addEventListener('click', onMouseClick, false)
		window.addEventListener('resize', onWindowResize)

		const gameLoop = timestamp => {
			if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp
			const deltaTime = timestamp - lastFrameTimeRef.current
			lastFrameTimeRef.current = timestamp

			if (!isPausedRef.current) {
				// Проверяем, нужно ли выполнить итерацию
				if (timestamp - lastTickRef.current >= TICK_LENGTH) {
					// Выполняем фиксированное количество обновлений
					const numOfTicks = Math.floor(
						(timestamp - lastTickRef.current) / TICK_LENGTH
					)

					// Ограничиваем количество тиков, чтобы избежать спирали смерти
					const maxTicksPerFrame = 3
					const ticksToProcess = Math.min(numOfTicks, maxTicksPerFrame)

					for (let i = 0; i < ticksToProcess; i++) {
						updateGameState()
					}

					lastTickRef.current = timestamp
				}

				// Обновляем только визуальную часть
				mixers.forEach(mixer => {
					mixer.update(deltaTime / 1000)
				})

				renderer.render(scene, camera)
			}

			requestAnimationFrame(gameLoop)
		}

		const updateGameState = () => {
			// Фиксированный шаг обновления
			const fixedDelta = TICK_LENGTH / 1000 // в секундах

			// Обновление NPC
			NPCObjects.current.forEach(npcData => {
				const { model, path, speed } = npcData
				const target = path[npcData.currentTarget]
				const direction = new THREE.Vector3(
					target.x - model.position.x,
					0,
					target.z - model.position.z
				)

				if (direction.length() < speed) {
					npcData.currentTarget = (npcData.currentTarget + 1) % path.length
				} else {
					direction.normalize()
					// Используем фиксированный шаг для движения
					model.position.addScaledVector(direction, speed)
					model.rotation.y =
						Math.abs(direction.x) > Math.abs(direction.z)
							? direction.x > 0
								? Math.PI / 2
								: -Math.PI / 2
							: direction.z > 0
							? 0
							: Math.PI
				}
			})

			// Обновление настроения NPC с фиксированным шагом
			setNpcMood(prev => Math.max(0, prev - NPCMoodDecayRate))
		}

		requestAnimationFrame(gameLoop)

		return () => {
			window.removeEventListener('resize', onWindowResize)
			window.removeEventListener('click', onMouseClick)
			if (mountRef.current) mountRef.current.removeChild(renderer.domElement)
			renderer.dispose()
		}
	}, [])

	useEffect(() => {
		if (!isPaused && timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft(prev => prev - 1)
			}, 1000)
			return () => clearInterval(timer)
		}
	}, [isPaused, timeLeft])

	useEffect(() => {
		if (timeLeft === 0 || npcMood === 0 || energy === 0) {
			isPausedRef.current = true
			setIsPaused(true)
			endGame()
		}
	}, [timeLeft, npcMood, energy])

	const handlePause = () => {
		if (isWin === null) {
			isPausedRef.current = !isPausedRef.current
			NPCObjects.current.forEach(npcData => {
				if (npcData.mixer) npcData.mixer.timeScale = isPausedRef.current ? 0 : 1
			})
			setIsPaused(prevPause => !prevPause)
		}
	}

	const endGame = () => {
		NPCObjects.current.forEach(npcData => {
			if (npcData.mixer) npcData.mixer.timeScale = isPausedRef.current ? 0 : 1
		})
		setIsWin(timeLeft === 0 && npcMood !== 0 && energy !== 0)
	}

	return (
		<div ref={mountRef}>
			<div className='Interface-Box'>
				<Interface
					NPCObjects={NPCObjects}
					NPCMood={Math.round(npcMood)}
					setNPCMood={setNpcMood}
					Energy={energy}
					setEnergy={setEnergy}
					timeLeft={timeLeft}
					setTimeLeft={setTimeLeft}
					NPCMoodDecayRate={NPCMoodDecayRate}
					setNPCMoodDecayRate={setNPCMoodDecayRate}
					energyDecayRate={energyDecayRate}
					setEnergyDecayRate={setEnergyDecayRate}
					onPause={handlePause}
					onRestart={resetGame}
					isPaused={isPaused}
					isWin={isWin}
				/>
			</div>
		</div>
	)
}

export default Game
