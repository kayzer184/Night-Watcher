import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'
import { useSearchParams } from 'react-router-dom'

import ifvisible from 'ifvisible.js'

import '../Sass/Game.scss'
import MapLoader from './MapLoader'
import NPCLoader from './NPCLoader'
import Interface from './Interface'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import { EVENTS_CONFIG } from '../Config/EventsConfig'
import { useAuth } from '../context/AuthContext'
import AudioManager from '../Utils/AudioManager'
import { useSettings } from '../context/SettingsContext'

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

function Game() {
	const [searchParams] = useSearchParams()
	const level = parseInt(searchParams.get('level')) || 1

	const mountRef = useRef(null)
	const raycaster = new THREE.Raycaster()
	const mouse = new THREE.Vector2()
	const [collidableObjects, mixers, hitboxes] = [[], [], []]
	const NPCObjects = useRef([])
	const [npcMood, setNpcMood] = useState(0)
	const [energy, setEnergy] = useState(100)
	const [timeLeft, setTimeLeft] = useState(LEVELS_CONFIG[level].timeLimit)
	const [NPCMoodDecayRate, setNPCMoodDecayRate] = useState(
		LEVELS_CONFIG[level].moodDecayRate
	)
	const [energyDecayRate, setEnergyDecayRate] = useState(
		LEVELS_CONFIG[level].energyDecayRate
	)
	const [isWin, setIsWin] = useState(null)
	const isPausedRef = useRef(false)
	const [isPaused, setIsPaused] = useState(false)
	const lightObjects = useRef([])
	const lastEnergyUpdateRef = useRef(Date.now())
	const lastUpdateRef = useRef(performance.now())
	const UPDATES_PER_SECOND = 144
	const UPDATE_INTERVAL = 720 / UPDATES_PER_SECOND
	const accumulatedTimeRef = useRef(0)
	const ANIMATION_SPEED_MULTIPLIER = 1.75
	const [activeEvents, setActiveEvents] = useState(new Map())
	const lastEventCheckRef = useRef(Date.now())
	const [maxNpcMood, setMaxNpcMood] = useState(0)
	const [isSystemPaused, setIsSystemPaused] = useState(null)
	const { user } = useAuth()
	const [ambientLight, setAmbientLight] = useState(null)
	const selectedObjects = useRef([])
	const composerRef = useRef(null)
	const outlinePassRef = useRef(null)
	const audioManager = useRef(null)
	const audioInitialized = useRef(false)
	const { volume, setVolume, brightness, setBrightness } = useSettings()
	const [audioReady, setAudioReady] = useState(false)
	const [isAudioInitialized, setIsAudioInitialized] = useState(false)

	const sendGameResults = async (stars, score) => {
		if (!user) return

		try {
			await fetch('https://api-night-watcher.vercel.app/progress/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.id,
					username: user.username,
					levelId: level,
					stars,
					score: Math.round(score),
				}),
			})
		} catch (error) {
			console.error('Error sending game results:', error)
		}
	}

	const resetGame = () => {
		setNpcMood(0)
		setMaxNpcMood(0)
		setEnergy(100)
		setTimeLeft(LEVELS_CONFIG[level].timeLimit)
		setIsWin(null)
		setIsPaused(false)
		setIsSystemPaused(null)
		isPausedRef.current = false

		lightObjects.current.forEach(light => {
			if (light.light) light.light.visible = false
		})

		const spawnIndices = Array.from(
			{ length: LEVELS_CONFIG[level].npcSpawns.length },
			(_, i) => i
		)
		shuffle(spawnIndices)

		setActiveEvents(new Map())

		NPCObjects.current.forEach((npc, index) => {
			const spawnIndex = spawnIndices[index % spawnIndices.length]
			const spawn = LEVELS_CONFIG[level].npcSpawns[spawnIndex]
			const pathPoints = LEVELS_CONFIG[level].npcPaths[spawnIndex]

			if (npc.model && spawn && pathPoints) {
				npc.isInEvent = false
				npc.currentTarget = 0
				npc.speed = LEVELS_CONFIG[level].npcSpeed

				npc.model.position.set(spawn[0], spawn[1], spawn[2])

				npc.path = pathPoints

				if (npc.mixer && npc.action) {
					npc.action.reset()
					npc.action.play()
					npc.mixer.timeScale = LEVELS_CONFIG[level].npcSpeed
				}
			}
		})

		lastUpdateRef.current = performance.now()
	}

	useEffect(() => {
		ifvisible.on('blur', () => {
			if (isPausedRef.current === false) {
				isPausedRef.current = true
				setIsPaused(true)
				setIsSystemPaused(true)
				NPCObjects.current.forEach(npcData => {
					if (npcData.mixer) {
						npcData.mixer.timeScale = 0
					}
				})
			}
		})

		ifvisible.on('focus', () => {
			if (isSystemPaused) {
				isPausedRef.current = false
				setIsPaused(false)
				setIsSystemPaused(null)
				lastUpdateRef.current = performance.now()
				NPCObjects.current.forEach(npcData => {
					if (npcData.mixer) {
						npcData.mixer.timeScale = 1
					}
				})
			}
		})

		return () => {
			ifvisible.off('blur')
			ifvisible.off('focus')
		}
	}, [isSystemPaused])

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
		if (mountRef.current) {
			mountRef.current.appendChild(renderer.domElement)
		}
		const controls = new OrbitControls(camera, renderer.domElement)
		controls.enableDamping = true
		controls.dampingFactor = 0.25
		controls.maxPolarAngle = Math.PI / 2

		const composer = new EffectComposer(renderer)
		const renderPass = new RenderPass(scene, camera)
		composer.addPass(renderPass)

		const outlinePass = new OutlinePass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			scene,
			camera
		)
		outlinePass.edgeStrength = 3.0
		outlinePass.edgeGlow = 0.0
		outlinePass.edgeThickness = 1.0
		outlinePass.visibleEdgeColor.set('#8FFDFF')
		outlinePass.hiddenEdgeColor.set('#190a05')
		composer.addPass(outlinePass)

		const outputPass = new OutputPass()
		composer.addPass(outputPass)

		const effectFXAA = new ShaderPass(FXAAShader)
		effectFXAA.uniforms['resolution'].value.set(
			1 / window.innerWidth,
			1 / window.innerHeight
		)
		composer.addPass(effectFXAA)

		MapLoader(
			lightObjects.current,
			hitboxes,
			collidableObjects,
			scene,
			level,
			brightness,
			handleMapLoad
		)
		NPCLoader(
			NPCObjects.current,
			LEVELS_CONFIG[level].npcCount,
			mixers,
			scene,
			level
		)

		const toggleLight = (light, index) => {
			if (energy > 0) {
				light.visible = !light.visible
			}
		}

		const onMouseMove = event => {
			if (!isPausedRef.current) {
				mouse.x = (event.clientX / window.innerWidth) * 2 - 1
				mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
				raycaster.setFromCamera(mouse, camera)
				const intersects = raycaster.intersectObjects(scene.children, true)

				if (intersects.length > 0) {
					const intersection = intersects[0]
					let foundHitbox = false
					hitboxes.forEach(({ box }, index) => {
						if (box.containsPoint(intersection.point)) {
							outlinePass.selectedObjects = [lightObjects.current[index].model]
							foundHitbox = true
						}
					})
					if (!foundHitbox) {
						outlinePass.selectedObjects = []
					}
				} else {
					outlinePass.selectedObjects = []
				}
			}
		}

		const onWindowResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight
			camera.updateProjectionMatrix()
			renderer.setSize(window.innerWidth, window.innerHeight)
		}

		window.addEventListener('mousemove', onMouseMove, false)
		window.addEventListener(
			'click',
			event => {
				if (!isPausedRef.current) {
					mouse.x = (event.clientX / window.innerWidth) * 2 - 1
					mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
					raycaster.setFromCamera(mouse, camera)
					const intersects = raycaster.intersectObjects(scene.children, true)

					if (intersects.length > 0) {
						const intersection = intersects[0]
						hitboxes.forEach(({ box }, index) => {
							if (box.containsPoint(intersection.point)) {
								const light = lightObjects.current[index].light
								toggleLight(light, index)
							}
						})
					}
				}
			},
			false
		)
		window.addEventListener('resize', onWindowResize)

		const moveNpc = () => {
			NPCObjects.current.forEach(npcData => {
				if (!npcData.path || !npcData.model) return

				const { model, path, speed } = npcData
				const normalizedSpeed = speed * (1 / UPDATES_PER_SECOND) * 60

				if (npcData.currentTarget >= path.length) {
					npcData.currentTarget = 0
				}

				const target = path[npcData.currentTarget]
				if (!target) return

				const direction = new THREE.Vector3(
					target.x - model.position.x,
					0,
					target.z - model.position.z
				)

				const distance = direction.length()
				if (distance < normalizedSpeed) {
					npcData.currentTarget = (npcData.currentTarget + 1) % path.length
				} else {
					direction.normalize()
					model.position.addScaledVector(direction, normalizedSpeed)
					model.rotation.y =
						Math.abs(direction.x) > Math.abs(direction.z)
							? direction.x > 0
								? Math.PI / 2
								: -Math.PI / 2
							: direction.z > 0
							? 0
							: Math.PI
				}
				let isInLight = lightObjects.current.some(lightObject => {
					return (
						lightObject.light.visible &&
						model.position.distanceTo(lightObject.model.position) < 300
					)
				})
				setNpcMood(prevMood => {
					const newMood = isInLight
						? Math.min(100, prevMood - NPCMoodDecayRate)
						: Math.max(0, prevMood + NPCMoodDecayRate)
					setMaxNpcMood(prev => Math.max(prev, newMood))
					return prevMood + (newMood - prevMood)
				})
			})
		}

		const updateEnergy = () => {
			const currentTime = Date.now()
			if (currentTime - lastEnergyUpdateRef.current >= 1000) {
				lastEnergyUpdateRef.current = currentTime
				const totalEnergyConsumption = lightObjects.current.reduce(
					(acc, lightObject) => {
						return lightObject.light.visible ? acc + energyDecayRate : acc
					},
					0
				)
				setEnergy(prevEnergy =>
					Math.min(100, Math.max(0, prevEnergy - totalEnergyConsumption))
				)
			}
		}

		const handleRandomEvents = () => {
			const currentTime = Date.now()

			if (currentTime - lastEventCheckRef.current >= 10000) {
				lastEventCheckRef.current = currentTime

				if (Math.random() <= 1) {
					const availableEvents = Object.values(
						EVENTS_CONFIG[`LEVEL_${level}`] || {}
					).filter(event =>
						event.conditions({
							npcMood,
							NPCObjects: NPCObjects.current,
							energy,
							timeLeft,
						})
					)

					if (availableEvents.length > 0) {
						const randomEvent =
							availableEvents[
								Math.floor(Math.random() * availableEvents.length)
							]

						const availableNPCs = NPCObjects.current.filter(
							npc => !npc.isInEvent
						)
						if (availableNPCs.length > 0) {
							const targetNPC =
								availableNPCs[Math.floor(Math.random() * availableNPCs.length)]

							randomEvent.action(
								{ npcMood, NPCObjects: NPCObjects.current, energy, timeLeft },
								targetNPC
							)

							setActiveEvents(
								prev =>
									new Map(
										prev.set(targetNPC.id, {
											event: randomEvent,
											endTime: currentTime + randomEvent.duration,
										})
									)
							)
						}
					}
				}
			}

			activeEvents.forEach((eventData, npcId) => {
				if (currentTime >= eventData.endTime) {
					const npc = NPCObjects.current.find(n => n.id === npcId)
					if (npc) {
						eventData.event.cleanup(npc, {
							npcMood,
							NPCObjects: NPCObjects.current,
							energy,
							timeLeft,
						})
					}
					setActiveEvents(prev => {
						const newMap = new Map(prev)
						newMap.delete(npcId)
						return newMap
					})
				}
			})
		}

		const animate = () => {
			const currentTime = performance.now()
			const frameTime = currentTime - lastUpdateRef.current
			lastUpdateRef.current = currentTime

			accumulatedTimeRef.current += frameTime

			while (accumulatedTimeRef.current >= UPDATE_INTERVAL) {
				if (!isPausedRef.current) {
					moveNpc()
					updateEnergy()
					handleRandomEvents()

					NPCObjects.current.forEach(npcData => {
						if (npcData.mixer) {
							npcData.mixer.timeScale =
								npcData.speed * ANIMATION_SPEED_MULTIPLIER
						}
					})

					mixers.forEach(mixer => mixer.update(1 / UPDATES_PER_SECOND))
				}

				accumulatedTimeRef.current -= UPDATE_INTERVAL
			}

			controls.update()
			composer.render()
			requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener('resize', onWindowResize)
			window.removeEventListener('mousemove', onMouseMove)

			if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
				mountRef.current.removeChild(renderer.domElement)
			}

			renderer.dispose()
			scene.clear()
		}
	}, [level])

	useEffect(() => {
		if (!isPaused && timeLeft > 0) {
			const timer = setInterval(() => {
				setTimeLeft(prev => prev - 1)
			}, 1000)
			return () => clearInterval(timer)
		}
	}, [isPaused, timeLeft])

	useEffect(() => {
		if (timeLeft === 0 || npcMood >= 100 || energy === 0) {
			isPausedRef.current = true
			setIsPaused(true)
			endGame()
		}
	}, [timeLeft, npcMood, energy])

	useEffect(() => {
		setEnergy(prevEnergy => Math.min(100, Math.max(0, prevEnergy)))
	}, [energy])

	const handlePause = () => {
		if (isWin === null) {
			isPausedRef.current = !isPausedRef.current
			setIsPaused(prevPause => !prevPause)

			if (isPausedRef.current) {
				audioManager.current.fadeOut()
			} else {
				audioManager.current.fadeIn()
			}

			if (!isPausedRef.current) {
				lastUpdateRef.current = performance.now()
			}

			NPCObjects.current.forEach(npcData => {
				if (npcData.mixer) {
					npcData.mixer.timeScale = isPausedRef.current ? 0 : 1
				}
			})
		}
	}

	const endGame = () => {
		NPCObjects.current.forEach(npcData => {
			if (npcData.mixer) npcData.mixer.timeScale = isPausedRef.current ? 0 : 1
		})
		setIsWin(timeLeft === 0 && npcMood <= 100 && energy !== 0)
	}

	useEffect(() => {
		console.log('Light intensity changed:', brightness)
		if (ambientLight) {
			console.log('Updating light intensity to:', brightness)
			ambientLight.intensity = brightness
		}
	}, [brightness, ambientLight])

	const handleMapLoad = mapLoader => {
		console.log('Map loaded, ambient light:', mapLoader.ambientLight)
		setAmbientLight(mapLoader.ambientLight)
	}

	const initializeAudio = useCallback(async () => {
		if (!isAudioInitialized && !audioManager.current) {
			try {
				audioManager.current = new AudioManager()
				await audioManager.current.init()
				const musicPath = LEVELS_CONFIG[level].music
				await audioManager.current.loadMusic(musicPath)

				const savedTime = localStorage.getItem('musicCurrentTime')
				if (savedTime) {
					audioManager.current.setCurrentTime(parseFloat(savedTime))
				}

				await audioManager.current.play()
				audioManager.current.setVolume(volume)
				setIsAudioInitialized(true)
			} catch (error) {
				console.error('Failed to initialize audio:', error)
			}
		}
	}, [level, volume, isAudioInitialized])

	useEffect(() => {
		const handleUserInteraction = async () => {
			await initializeAudio()
		}

		if (!isAudioInitialized) {
			window.addEventListener('click', handleUserInteraction)
			window.addEventListener('touchstart', handleUserInteraction)
			window.addEventListener('keydown', handleUserInteraction)
		}

		return () => {
			window.removeEventListener('click', handleUserInteraction)
			window.removeEventListener('touchstart', handleUserInteraction)
			window.removeEventListener('keydown', handleUserInteraction)
		}
	}, [initializeAudio, isAudioInitialized])

	useEffect(() => {
		let saveInterval

		if (isAudioInitialized && audioManager.current) {
			saveInterval = setInterval(() => {
				localStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
			}, 1000)
		}

		return () => {
			if (saveInterval) clearInterval(saveInterval)
			if (audioManager.current) {
				localStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
			}
		}
	}, [isAudioInitialized])

	useEffect(() => {
		if (isAudioInitialized && audioManager.current) {
			audioManager.current.setVolume(volume)
		}
	}, [volume, isAudioInitialized])

	const handleVolumeChange = useCallback(
		newVolume => {
			setVolume(newVolume)
		},
		[setVolume]
	)

	const handleBrightnessChange = value => {
		setBrightness(value)
		// ... логика изменения яркости ...
	}

	useEffect(() => {
		ifvisible.on('blur', () => {
			if (audioManager.current) {
				audioManager.current.stop()
				sessionStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
			}
		})

		ifvisible.on('focus', () => {
			if (audioManager.current) {
				const savedTime = sessionStorage.getItem('musicCurrentTime')
				if (savedTime) {
					audioManager.current.setCurrentTime(parseFloat(savedTime))
				}
				audioManager.current.play()
				audioManager.current.setVolume(volume)
			}
		})

		return () => {
			ifvisible.off('blur')
			ifvisible.off('focus')
		}
	}, [volume])

	useEffect(() => {
		return () => {
			if (audioManager.current) {
				sessionStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
				audioManager.current.stop()
				audioManager.current = null
				audioInitialized.current = false
			}
		}
	}, [])

	const handleVolumeControlClick = useCallback(e => {
		e.stopPropagation()
	}, [])

	useEffect(() => {
		const handleBeforeUnload = () => {
			if (audioManager.current) {
				sessionStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [])

	useEffect(() => {
		const autoStartAudio = async () => {
			try {
				const silentAudio = new Audio()
				silentAudio
					.play()
					.then(async () => {
						if (!audioManager.current) {
							audioManager.current = new AudioManager()
							await audioManager.current.init()
							const musicPath = LEVELS_CONFIG[level].music
							await audioManager.current.loadMusic(musicPath)

							const savedTime = localStorage.getItem('musicCurrentTime')
							if (savedTime) {
								audioManager.current.setCurrentTime(parseFloat(savedTime))
							}

							await audioManager.current.play()
							audioManager.current.setVolume(volume)
							setIsAudioInitialized(true)
						}
					})
					.catch(() => {
						console.log('Автозапуск аудио не разрешен браузером')
					})
			} catch (error) {
				console.error('Failed to auto-start audio:', error)
			}
		}

		autoStartAudio()
	}, [])

	const handleGameComplete = async achievements => {
		// Преобразуем достижения в формат с числовыми ключами
		const formattedAchievements = {}
		Object.keys(achievements).forEach((key, index) => {
			formattedAchievements[String(index + 1)] = achievements[key]
		})

		console.log('[Debug] Formatted achievements:', formattedAchievements)

		try {
			const response = await fetch(
				'https://api-night-watcher.vercel.app/updateProgress',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						userId: user.id,
						levelId: level,
						achievements: formattedAchievements, // Отправляем преобразованные достижения
					}),
					credentials: 'include',
				}
			)

			const data = await response.json()
			console.log('[Debug] Update response:', data)

			if (data.success) {
				setShowModal(true)
			} else {
				console.error('[Error] Failed to update progress:', data.message)
			}
		} catch (error) {
			console.error('[Error] Failed to send progress:', error)
		}
	}

	return (
		<div
			ref={mountRef}
			onClick={!isAudioInitialized ? initializeAudio : undefined}
		>
			<div className='Interface-Box'>
				<Interface
					NPCObjects={NPCObjects}
					NPCMood={Math.round(npcMood)}
					setNpcMood={setNpcMood}
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
					level={level}
					maxNpcMood={maxNpcMood}
					ambientLightIntensity={brightness}
					onBrightnessChange={handleBrightnessChange}
					onVolumeChange={handleVolumeChange}
					currentVolume={volume}
					onVolumeControlClick={handleVolumeControlClick}
				/>
			</div>
		</div>
	)
}

export default Game
