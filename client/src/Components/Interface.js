import React, { useState, useEffect, useRef } from 'react'
import ProgressBar from '@ramonak/react-progress-bar'
import createDevTools from './DevTools'
import Modal from './Modal'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import '../Sass/Interface.scss'
import reset from '../Assets/Icons/ResetButton.svg'
import LoginGoogleButton from './LoginGoogleButton'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import { useAuth } from '../context/AuthContext'
import AudioManager from '../Utils/AudioManager'

// Helper function to determine mood color
function getMoodColor(mood) {
	const red = Math.max(mood * 2.55, 0)
	const green = Math.max(255 - mood * 2.55, 0)
	return `rgb(${red}, ${green}, 0)`
}

function Interface({
	NPCObjects,
	NPCMood,
	setNPCMood,
	Energy,
	setEnergy,
	timeLeft,
	setTimeLeft,
	NPCMoodDecayRate,
	setNPCMoodDecayRate,
	energyDecayRate,
	setEnergyDecayRate,
	onPause,
	onRestart,
	isPaused,
	isWin,
	level,
	maxNpcMood,
	ambientLightIntensity,
	setAmbientLightIntensity,
	onVolumeChange,
	currentVolume,
	onBrightnessChange,
	onVolumeControlClick,
}) {
	const { user, setUser } = useAuth()
	const [isModalVisible, setModalVisible] = useState(false)
	const audioManager = new AudioManager()
	const [isMuted, setIsMuted] = useState(() => currentVolume === 0)
	const prevVolume = useRef(() => {
		const savedPrevVolume = localStorage.getItem('prevGameVolume')
		return savedPrevVolume ? parseFloat(savedPrevVolume) : 0.5
	})

	useEffect(() => {
		const isDevMode = localStorage.getItem('Dev Mode') === 'true'

		if (!isDevMode) {
			return
		}

		const { stats, gui } = createDevTools()

		const Settings = {
			fps: false,
		}

		const setNPCSpeed = newSpeed => {
			if (Array.isArray(NPCObjects.current)) {
				NPCObjects.current.forEach(npc => {
					npc.speed = newSpeed
					npc.mixer.timeScale = newSpeed * 2
				})
			} else {
				console.error('NPCObjects.current не является массивом')
			}
		}

		const toggleFPS = () => {
			if (Settings.fps) {
				stats.showPanel(0)
				document.body.appendChild(stats.dom)
			} else {
				stats.dom?.parentNode?.removeChild(stats.dom)
			}
		}

		// GUI setup
		const GameEvents = gui.addFolder('Game Events')
		const PlayerStats = gui.addFolder('Player Stats')
		const GameSettings = gui.addFolder('Game Settings')

		GameEvents.add({ pause: onPause }, 'pause').name('Пауза')
		GameEvents.add({ reset: onRestart }, 'reset').name('Сбросить')

		PlayerStats.add({ NPCMood }, 'NPCMood')
			.min(0)
			.max(100)
			.step(1)
			.name('Недовольство')
			.onChange(setNPCMood)
		PlayerStats.add({ Energy }, 'Energy')
			.min(0)
			.max(100)
			.step(1)
			.name('Энергия')
			.onChange(setEnergy)
		PlayerStats.add({ timeLeft }, 'timeLeft')
			.min(0)
			.max(300)
			.step(1)
			.name('Время')
			.onChange(setTimeLeft)

		PlayerStats.add({ NPCSpeed: 0.33 }, 'NPCSpeed')
			.min(0)
			.max(1)
			.step(0.01)
			.name('Скорость NPC')
			.onChange(setNPCSpeed)

		PlayerStats.add({ NPCMoodDecayRate: 0.005 }, 'NPCMoodDecayRate')
			.min(0)
			.max(1)
			.step(0.001)
			.name('Скорость прироста довольства')
			.onChange(setNPCMoodDecayRate)

		PlayerStats.add({ energyDecayRate: 1 }, 'energyDecayRate')
			.min(0)
			.max(10)
			.step(0.01)
			.name('Скорость расхода энергии')
			.onChange(setEnergyDecayRate)

		GameSettings.add(Settings, 'fps').name('Показывать FPS').onChange(toggleFPS)

		const animationFrame = () => {
			if (Settings.fps) {
				stats.begin()
				stats.end()
			}
			requestAnimationFrame(animationFrame) // Recursive call
		}

		requestAnimationFrame(animationFrame) // Start the loop

		toggleFPS() // Initialize FPS state

		return () => {
			// Cleanup
			gui.destroy()
			stats.dom?.parentNode?.removeChild(stats.dom) // Remove FPS panel
		}
	}, [])

	useEffect(() => {
		if (isWin !== null) {
			setModalVisible(true) // Show modal
		}
	}, [isWin])

	const handleRestart = () => {
		setModalVisible(false) // Сначала скрываем модальное окно
		setTimeout(() => {
			// Даем время на анимацию закрытия
			onRestart() // Затем перезапускаем игру
		}, 300)
	}

	useEffect(() => {
		// Когда isWin меняется и это победа
		if (isWin === true) {
			const sendAchievements = async () => {
				if (!user?.id) return

				const levelAchievements = {
					"1": false,
					"2": false, 
					"3": false
				}
				Object.values(LEVELS_CONFIG[level].starConditions).forEach(
					(condition, index) => {
						levelAchievements[(index + 1).toString()] = condition.check({
							isWin: isWin,
							npcMood: NPCMood,
							maxNpcMood: maxNpcMood,
							energy: Energy,
						})
					}
				)

				try {
					const response = await fetch(
						'https://api-night-watcher.vercel.app/update',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								userId: user.id,
								levelId: level,
								achievements: levelAchievements,
							}),
						}
					)

					const data = await response.json()
					if (!data.success) {
						console.error('Ошибка сохранения прогресса:', data.message)
					}
				} catch (error) {
					console.error('Ошибка отправки данных:', error)
				}
			}

			sendAchievements()
		}
	}, [isWin, level, user?.id, NPCMood, maxNpcMood, Energy])

	const handleVolumeChange = newVolume => {
		// Убедимся, что значение является числом
		const volume = Math.max(0, Math.min(1, parseFloat(newVolume) || 0))
		onVolumeChange(volume)
		setIsMuted(volume === 0)

		// Сохраняем предыдущую громкость только если она больше 0
		if (volume > 0) {
			prevVolume.current = volume
			localStorage.setItem('prevGameVolume', volume.toString())
		}
	}

	const handleMuteToggle = () => {
		if (isMuted) {
			// Восстанавливаем предыдущую громкость
			const savedVolume = localStorage.getItem('prevGameVolume')
			const volumeToRestore = savedVolume ? parseFloat(savedVolume) : 0.5
			handleVolumeChange(volumeToRestore)
		} else {
			// Сохраняем текущую громкость перед мутированием
			if (currentVolume > 0) {
				prevVolume.current = currentVolume
				localStorage.setItem('prevGameVolume', currentVolume.toString())
			}
			handleVolumeChange(0)
		}
	}

	// Обновляем состояние isMuted при изменении громкости
	useEffect(() => {
		setIsMuted(currentVolume === 0)
	}, [currentVolume])

	return (
		<div className='Interface'>
			{/* Mood Progress Bar */}
			<div className='ProgressBar-Wrapper'>
				<h3>Недовольство пешеходов</h3>
				<div className='progress-container'>
					<ProgressBar
						completed={Math.min(NPCMood, 100)}
						maxCompleted={100}
						bgColor={getMoodColor(NPCMood)}
						height='20px'
						borderRadius='5px'
						baseBgColor='#e0e0e0'
						labelAlignment='center'
						customLabel=' '
					/>
					<div className='centered-label'>{`${NPCMood}%`}</div>
				</div>
			</div>

			{/* Energy Progress Bar */}
			<div className='ProgressBar-Wrapper'>
				<h3>Запас энергии</h3>
				<div className='progress-container'>
					<ProgressBar
						completed={Energy}
						maxCompleted={100}
						bgColor='#FFD700'
						height='20px'
						borderRadius='5px'
						baseBgColor='#e0e0e0'
						labelAlignment='center'
						customLabel=' '
					/>
					<div className='centered-label'>{`${Energy}%`}</div>
				</div>
			</div>

			<div className='PB-range-slider-div'>
				<svg
					className='brightness-icon'
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<g>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M4.25 19C4.25 18.5858 4.58579 18.25 5 18.25H19C19.4142 18.25 19.75 18.5858 19.75 19C19.75 19.4142 19.4142 19.75 19 19.75H5C4.58579 19.75 4.25 19.4142 4.25 19ZM7.25 22C7.25 21.5858 7.58579 21.25 8 21.25H16C16.4142 21.25 16.75 21.5858 16.75 22C16.75 22.4142 16.4142 22.75 16 22.75H8C7.58579 22.75 7.25 22.4142 7.25 22Z'
							fill='#fff'
						/>
						<path
							d='M6.08267 15.25C5.5521 14.2858 5.25 13.1778 5.25 12C5.25 8.27208 8.27208 5.25 12 5.25C15.7279 5.25 18.75 8.27208 18.75 12C18.75 13.1778 18.4479 14.2858 17.9173 15.25H22C22.4142 15.25 22.75 15.5858 22.75 16C22.75 16.4142 22.4142 16.75 22 16.75H2C1.58579 16.75 1.25 16.4142 1.25 16C1.25 15.5858 1.58579 15.25 2 15.25H6.08267Z'
							fill='#fff'
						/>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3C12.75 3.41421 12.4142 3.75 12 3.75C11.5858 3.75 11.25 3.41421 11.25 3V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.39861 4.39861C4.6915 4.10572 5.16638 4.10572 5.45927 4.39861L5.85211 4.79145C6.145 5.08434 6.145 5.55921 5.85211 5.85211C5.55921 6.145 5.08434 6.145 4.79145 5.85211L4.39861 5.45927C4.10572 5.16638 4.10572 4.6915 4.39861 4.39861ZM19.6011 4.39887C19.894 4.69176 19.894 5.16664 19.6011 5.45953L19.2083 5.85237C18.9154 6.14526 18.4405 6.14526 18.1476 5.85237C17.8547 5.55947 17.8547 5.0846 18.1476 4.79171L18.5405 4.39887C18.8334 4.10598 19.3082 4.10598 19.6011 4.39887ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3C3.41421 11.25 3.75 11.5858 3.75 12C3.75 12.4142 3.41421 12.75 3 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM20.25 12C20.25 11.5858 20.5858 11.25 21 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H21C20.5858 12.75 20.25 12.4142 20.25 12Z'
							fill='#fff'
						/>
					</g>
				</svg>
				<input
					type='range'
					min='0'
					max='0.2'
					step='0.01'
					value={ambientLightIntensity}
					onChange={e => onBrightnessChange(parseFloat(e.target.value))}
					className='PB-range-slider'
				/>
				<span className='PB-range-slidervalue'>
					{Math.round((ambientLightIntensity / 0.2) * 100)}%
				</span>
			</div>

			{/* Timer */}
			<div className='Timer'>
				<h3>Осталось времени</h3>
				<div className='Timer-Display'>{timeLeft}</div>
			</div>

			{/* Pause and Reset Buttons */}
			<button onClick={onPause} className='pause-button interface-button'>
				<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
					{!isPaused ? (
						<g>
							<rect x='6' y='4' width='4' height='16' />
							<rect x='14' y='4' width='4' height='16' />
						</g>
					) : (
						<polygon points='5,3 19,12 5,21' />
					)}
				</svg>
			</button>
			<button onClick={onRestart} className='reset-button interface-button'>
				<img src={reset} alt='reset' />
			</button>

			{/* Modal for Win or Lose */}
			{isWin ? (
				<Modal isVisible={isModalVisible}>
					<h2>Уровень пройден!</h2>
					<div className='stars-container'>
						<h3>Достижения уровня</h3>
						{Object.values(LEVELS_CONFIG[level].starConditions).map(
							condition => (
								<div
									key={condition.id}
									className={`star-condition ${
										condition.check({
											isWin: isWin,
											npcMood: NPCMood,
											maxNpcMood: maxNpcMood,
											energy: Energy,
										})
											? 'completed'
											: ''
									}`}
								>
									<StarIcon
										className={`star-icon ${
											condition.check({
												isWin: isWin,
												npcMood: NPCMood,
												maxNpcMood: maxNpcMood,
												energy: Energy,
											})
												? 'filled'
												: ''
										}`}
									/>
									<span className='condition-description'>
										{condition.description}
									</span>
								</div>
							)
						)}
						{!user && (
							<div className='login-section'>
								<div className='login-content'>
									<p className='login-text'>
										Войдите, чтобы сохранить прогресс
									</p>
									<LoginGoogleButton />
								</div>
							</div>
						)}
					</div>
					<button
						className='reset-modal-button interface-button'
						onClick={handleRestart}
					>
						<img src={reset} alt='reset' />
					</button>
				</Modal>
			) : (
				<Modal isVisible={isModalVisible}>
					<h2 className='lose-text'>Поражение!</h2>
					<div className='stars-container'>
						<h3>Достижения уровня:</h3>
						{Object.values(LEVELS_CONFIG[level].starConditions).map(
							condition => (
								<div key={condition.id} className='star-condition'>
									<StarIcon className='star-icon' />
									<span className='condition-description'>
										{condition.description}
									</span>
								</div>
							)
						)}
					</div>
					<button
						className='reset-modal-button interface-button'
						onClick={handleRestart}
					>
						<img src={reset} alt='reset' />
					</button>
				</Modal>
			)}

			<div className='volume-control' onClick={onVolumeControlClick}>
				<svg
					className={`volume-icon ${isMuted ? 'muted' : ''}`}
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					onClick={handleMuteToggle}
				>
					<g>
						<path d='M18.36 19.36a1 1 0 0 1-.705-1.71C19.167 16.148 20 14.142 20 12s-.833-4.148-2.345-5.65a1 1 0 1 1 1.41-1.419C20.958 6.812 22 9.322 22 12s-1.042 5.188-2.935 7.069a.997.997 0 0 1-.705.291z' />
						<path d='M15.53 16.53a.999.999 0 0 1-.703-1.711C15.572 14.082 16 13.054 16 12s-.428-2.082-1.173-2.819a1 1 0 1 1 1.406-1.422A6 6 0 0 1 18 12a6 6 0 0 1-1.767 4.241.996.996 0 0 1-.703.289zM12 22a1 1 0 0 1-.707-.293L6.586 17H4c-1.103 0-2-.897-2-2V9c0-1.103.897-2 2-2h2.586l4.707-4.707A.998.998 0 0 1 13 3v18a1 1 0 0 1-1 1z' />
					</g>
					{isMuted && (
						<line
							x1='2'
							y1='2'
							x2='22'
							y2='22'
							stroke='currentColor'
							strokeWidth='2'
						/>
					)}
				</svg>
				<input
					type='range'
					min='0'
					max='1'
					step='0.05'
					value={currentVolume || 0}
					onChange={e => onVolumeChange(parseFloat(e.target.value))}
					onClick={e => e.stopPropagation()}
					className='PB-range-slider'
				/>
				<span className='PB-range-slidervalue'>
					{Math.round((currentVolume || 0) * 100)}%
				</span>
			</div>
		</div>
	)
}

export default Interface
