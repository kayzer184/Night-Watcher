import React, { useState, useEffect } from 'react'
import ProgressBar from '@ramonak/react-progress-bar'
import createDevTools from './DevTools'
import Modal from './Modal'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import '../Sass/Interface.scss'
import reset from '../Assets/Icons/ResetButton.svg'
import LoginGoogleButton from './LoginGoogleButton'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import { useAuth } from '../context/AuthContext'

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
}) {
	const { user, setUser } = useAuth()
	const [isModalVisible, setModalVisible] = useState(false)

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
				if (!user?.id) return // Если пользователь не авторизован

				// Собираем достижения уровня
				const levelAchievements = {}
				Object.values(LEVELS_CONFIG[level].starConditions).forEach(
					condition => {
						levelAchievements[condition.id] = condition.check({
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
				<input
					type='range'
					min='0'
					max='1'
					step='0.1'
					value={ambientLightIntensity}
					onChange={e => setAmbientLightIntensity(parseFloat(e.target.value))}
					className='PB-range-slider'
				/>
				<span className='PB-range-slidervalue'>
					{Math.round(ambientLightIntensity * 100)}%
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
		</div>
	)
}

export default Interface
