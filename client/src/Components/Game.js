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
import Tutorial from './Tutorial'

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
	const [waitingForInteraction, setWaitingForInteraction] = useState(true)
	const [showTutorial, setShowTutorial] = useState(true)
	const [currentTutorialStep, setCurrentTutorialStep] = useState(1)
	const [waitingForAction, setWaitingForAction] = useState(false)
	const waitingForActionRef = useRef(false)
	const [lightSwitched, setLightSwitched] = useState(false)
	const [lightSwitches, setLightSwitches] = useState(0)
	const [showTutorialTask, setShowTutorialTask] = useState(false)
	const [tutorialTaskText, setTutorialTaskText] = useState('')
	const currentStepRef = useRef(1)

	useEffect(() => {
		setShowTutorial(level === 1)
	}, [level])
	useEffect(() => {
		if (level === 1) {
			currentStepRef.current = currentTutorialStep
			if ([1, 2, 3, 4].includes(currentTutorialStep)) {
				setShowTutorialTask(false)
				setTutorialTaskText('')
				waitingForActionRef.current = false
				setIsPaused(true)
				isPausedRef.current = true
			} else if (currentTutorialStep === 5) {
				setShowTutorialTask(true)
				setTutorialTaskText('Включите фонарь')
				waitingForActionRef.current = true
				setLightSwitched(false)
				setIsPaused(false)
				isPausedRef.current = false
				NPCObjects.current.forEach(npc => {
					if (npc.mixer) {
						npc.mixer.timeScale = 0
					}
				})
				setNPCMoodDecayRate(0)
				setEnergyDecayRate(0)
			} else if (currentTutorialStep === 6) {
				setShowTutorialTask(false)
				setTutorialTaskText('')
				waitingForActionRef.current = false
				setIsPaused(false)
				isPausedRef.current = false
				NPCObjects.current.forEach(npc => {
					if (npc.mixer) {
						npc.mixer.timeScale = LEVELS_CONFIG[level].npcSpeed
					}
				})
			}
		}
	}, [currentTutorialStep, level])

	const resetGame = () => {
		setNpcMood(0)
		setMaxNpcMood(0)
		setEnergy(100)
		setTimeLeft(LEVELS_CONFIG[level].timeLimit)
		setIsWin(null)
		setLightSwitches(0)
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
				setLightSwitches(prev => prev + 1)
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
				if (!isPausedRef.current || waitingForActionRef.current) {
					mouse.x = (event.clientX / window.innerWidth) * 2 - 1
					mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
					raycaster.setFromCamera(mouse, camera)
					const intersects = raycaster.intersectObjects(scene.children, true)

					if (intersects.length > 0) {
						const intersection = intersects[0]
						hitboxes.forEach(({ box }, index) => {
							if (box.containsPoint(intersection.point)) {
								handleLightSwitch(index)
								setLightSwitches(prev => prev + 1)
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

				// Проверка валидности текущей цели
				if (npcData.currentTarget >= path.length) {
					npcData.currentTarget = 0
				}

				const target = path[npcData.currentTarget]
				if (!target) return

				// Вычисляем направление к цели
				const direction = new THREE.Vector3(
					target.x - model.position.x,
					0,
					target.z - model.position.z
				)

				const distance = direction.length()

				const threshold = Math.max(0.1, normalizedSpeed * 0.25)

				if (distance < threshold) {
					model.position.set(target.x, model.position.y, target.z)
					npcData.currentTarget = (npcData.currentTarget + 1) % path.length
				} else {
					direction.normalize()
					const moveSpeed = Math.max(normalizedSpeed, 0.01)

					const newX = model.position.x + direction.x * moveSpeed
					const newZ = model.position.z + direction.z * moveSpeed

					if (
						Math.abs(newX - target.x) > Math.abs(model.position.x - target.x) ||
						Math.abs(newZ - target.z) > Math.abs(model.position.z - target.z)
					) {
						model.position.set(target.x, model.position.y, target.z)
						npcData.currentTarget = (npcData.currentTarget + 1) % path.length
					} else {
						model.position.x = newX
						model.position.z = newZ
					}

					const angle = Math.atan2(direction.x, direction.z)
					model.rotation.y = angle
				}

				const isNpcInLight = lightObjects.current.some(({ light }) => {
					if (!light.visible) return false
					const distance = model.position.distanceTo(light.position)
					return distance < 300
				})

				setNpcMood(prevMood => {
					const newMood = isNpcInLight
						? Math.min(100, prevMood - NPCMoodDecayRate)
						: Math.max(0, prevMood + NPCMoodDecayRate)
					setMaxNpcMood(prev => Math.max(prev, newMood))
					return newMood // Убрал лишнее сложение
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
		if (ambientLight) {
			ambientLight.intensity = brightness
		}
	}, [brightness, ambientLight])

	const handleMapLoad = mapLoader => {
		setAmbientLight(mapLoader.ambientLight)
	}

	const initializeAudio = async () => {
		try {
			if (!audioManager.current) {
				audioManager.current = new AudioManager()
				await audioManager.current.init()
				const musicPath = LEVELS_CONFIG[level].music
				await audioManager.current.loadMusic(musicPath)

				const savedVolume = localStorage.getItem('gameVolume')
				if (savedVolume !== null) {
					audioManager.current.setVolume(parseFloat(savedVolume))
				} else {
					audioManager.current.setVolume(volume)
				}

				await audioManager.current.audioContext.resume()
				await audioManager.current.play()
				setIsAudioInitialized(true)
			}
		} catch (error) {
			console.error('Failed to initialize audio:', error)
		}
	}

	useEffect(() => {
		const handleFirstInteraction = async () => {
			if (waitingForInteraction) {
				await initializeAudio()
				document.removeEventListener('click', handleFirstInteraction)
			}
		}

		document.addEventListener('click', handleFirstInteraction)

		return () => {
			document.removeEventListener('click', handleFirstInteraction)
			if (audioManager.current) {
				localStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
				localStorage.setItem('gameVolume', volume.toString())
				audioManager.current.stop()
				audioManager.current = null
				setIsAudioInitialized(false)
			}
		}
	}, [waitingForInteraction])

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

	const handleVolumeChange = useCallback(value => {
		setVolume(value)
		if (audioManager.current) {
			audioManager.current.setVolume(value)
			sessionStorage.setItem('lastVolume', value.toString())
		}
	}, [])

	const handleBrightnessChange = useCallback(
		value => {
			setBrightness(value)
			if (ambientLight) {
				ambientLight.intensity = value
			}
		},
		[ambientLight]
	)

	useEffect(() => {
		ifvisible.on('blur', () => {
			if (audioManager.current) {
				audioManager.current.fadeOut()
				sessionStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
				sessionStorage.setItem('lastVolume', volume.toString())
			}
		})

		ifvisible.on('focus', async () => {
			if (audioManager.current) {
				const savedTime = sessionStorage.getItem('musicCurrentTime')
				const savedVolume = sessionStorage.getItem('lastVolume')

				if (savedVolume !== null) {
					audioManager.current.setVolume(parseFloat(savedVolume))
				} else {
					audioManager.current.setVolume(volume)
				}

				if (savedTime) {
					audioManager.current.setCurrentTime(parseFloat(savedTime))
				}

				if (audioManager.current.audioContext.state === 'suspended') {
					await audioManager.current.audioContext.resume()
				}
				await audioManager.current.play()
				audioManager.current.fadeIn()
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
		const handleNavigation = () => {
			if (audioManager.current) {
				localStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
				audioManager.current.stop()
				audioManager.current = null
				setIsAudioInitialized(false)
			}
		}

		// Слушаем событие popstate (навигация назад/вперед)
		window.addEventListener('popstate', handleNavigation)

		// Очистка при размонтировании
		return () => {
			window.removeEventListener('popstate', handleNavigation)
			if (audioManager.current) {
				localStorage.setItem(
					'musicCurrentTime',
					audioManager.current.getCurrentTime()
				)
				audioManager.current.stop()
				audioManager.current = null
				setIsAudioInitialized(false)
			}
		}
	}, [])

	const handleTutorialComplete = () => {
		setShowTutorial(false)
		isPausedRef.current = false
		setIsPaused(false)

		NPCObjects.current.forEach(npc => {
			if (npc.mixer) {
				npc.mixer.timeScale = LEVELS_CONFIG[level].npcSpeed
			}
		})

		setNPCMoodDecayRate(LEVELS_CONFIG[level].moodDecayRate)
		setEnergyDecayRate(LEVELS_CONFIG[level].energyDecayRate)

		lastUpdateRef.current = performance.now()
	}

	const handleWaitForAction = useCallback(waiting => {
		setWaitingForAction(waiting)
		setIsPaused(!waiting)
	}, [])

	const handleLightSwitch = useCallback(
		lightIndex => {
			const light = lightObjects.current[lightIndex]?.light

			// Всегда переключаем свет если есть энергия
			if (light && energy > 0) {
				light.visible = !light.visible

				if (currentStepRef.current === 5) {
					setLightSwitched(true)
					setShowTutorialTask(false)
					setCurrentTutorialStep(6)
					setWaitingForAction(false)
					waitingForActionRef.current = false
				}
			}
		},
		[energy]
	)

	return (
		<div
			ref={mountRef}
			onClick={!isAudioInitialized ? initializeAudio : undefined}
		>
			{showTutorial && !showTutorialTask && level === 1 && (
				<Tutorial
					currentStep={currentTutorialStep}
					setCurrentStep={setCurrentTutorialStep}
					onComplete={handleTutorialComplete}
					gameState={{ lightSwitched }}
					onWaitForAction={handleWaitForAction}
				/>
			)}
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
					isPaused={isPaused && !waitingForAction}
					isWin={isWin}
					level={level}
					maxNpcMood={maxNpcMood}
					ambientLightIntensity={brightness}
					onBrightnessChange={handleBrightnessChange}
					onVolumeChange={handleVolumeChange}
					currentVolume={volume}
					onVolumeControlClick={handleVolumeControlClick}
					onLightSwitch={handleLightSwitch}
					lightSwitches={lightSwitches}
					showTutorialTask={showTutorialTask}
					tutorialTaskText={tutorialTaskText}
				/>
			</div>
		</div>
	)
}

export default Game
