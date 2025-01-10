import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../Sass/LevelsPage.scss'
import Background from '../Components/Background'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import LevelStarsModal from '../Components/LevelStarsModal'

import level1Screenshot from '../Assets/ScreenShots/level1.jpg'
import level2Screenshot from '../Assets/ScreenShots/level2.jpg'
import level3Screenshot from '../Assets/ScreenShots/level3.jpg'

const levelData = [
	{
		id: 1,
		name: 'Уровень 1',
		description: 'Это первый уровень, где вы познакомитесь с основами.',
		screenshot: level1Screenshot,
	},
	{
		id: 2,
		name: 'Уровень 2',
		description: 'Сложность повышается. Осторожно!',
		screenshot: level2Screenshot,
	},
	{
		id: 3,
		name: 'Уровень 3',
		description: 'Приготовьтесь к настоящему вызову!',
		screenshot: level3Screenshot,
	},
]

function LevelsPage() {
	const { user } = useAuth()
	const [startAnimation, setStartAnimation] = useState(false)
	const [selectedLevel, setSelectedLevel] = useState(null)
	const [achievements, setAchievements] = useState({})
	const navigate = useNavigate()

	useEffect(() => {
		if (user) {
			fetch(`https://api-night-watcher.vercel.app/getUser/${user.id}`, {
				credentials: 'include',
			})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						console.log('Received achievements:', data.user.achievements)
						setAchievements(data.user.achievements || {})
					}
				})
				.catch(error => {
					console.error('Failed to fetch achievements:', error)
				})
		}
	}, [user])

	function handleBack() {
		setStartAnimation(true)
		setTimeout(() => navigate('/'), 1000)
	}

	function handleLevelSelect(level) {
		setSelectedLevel(level)
	}

	return (
		<div className={`LevelsPage ${startAnimation ? 'animate' : ''}`}>
			<h1 className='title'>Выберите уровень</h1>
			<div className='levels-container'>
				{levelData.map(level => (
					<button
						key={level.id}
						className='level-button'
						onClick={() => handleLevelSelect(level)}
					>
						<span className='level-name'>{level.name}</span>
						<div className='level-stars'>
							{[1, 2, 3].map(starIndex => {
								const levelAchievements = achievements[String(level.id)] || {}
								return (
									<StarIcon
										key={starIndex}
										className={`star-icon ${
											levelAchievements[starIndex] === true ? 'filled' : ''
										}`}
									/>
								)
							})}
						</div>
					</button>
				))}
			</div>
			<button onClick={handleBack} className='back-button'>
				Назад
			</button>
			<Background />

			{selectedLevel && (
				<div className='modal'>
					<div className='modal-content'>
						<h2>{selectedLevel.name}</h2>
						<img
							src={selectedLevel.screenshot}
							alt={`Скриншот ${selectedLevel.name}`}
							className='level-screenshot'
						/>
						<p>{selectedLevel.description}</p>
						<LevelStarsModal
							level={selectedLevel.id}
							user={user}
							isPreview={true}
						/>
						<div className='buttons-container'>
							<button
								className='play-button'
								onClick={() => navigate(`/game?level=${selectedLevel.id}`)}
							>
								Играть
							</button>
							<button
								className='close-button'
								onClick={() => setSelectedLevel(null)}
							>
								Закрыть
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default LevelsPage
