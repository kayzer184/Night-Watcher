import React from 'react'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import '../Sass/LevelStarsModal.scss'

const LevelStarsModal = ({
	level,
	isPreview = false,
	gameStats = null,
	user = {},
}) => {
	console.log('LevelStarsModal props:', { level, user })

	const achievements = user?.achievements || {}
	const levelAchievements = achievements[level.toString()] || {}

	console.log('Achievements for level:', levelAchievements)

	return (
		<div className='modal-stars-container'>
			<div className='achievements-section'>
				<h3>Достижения уровня</h3>
				<div className='achievements-list'>
					{Object.values(LEVELS_CONFIG[level].starConditions).map(
						(condition, index) => {
							const isCompleted = levelAchievements[(index + 1).toString()]
							console.log(`Achievement ${index + 1}:`, isCompleted)

							return (
								<div
									key={condition.id}
									className={`achievement-item ${
										isCompleted ? 'completed' : ''
									}`}
								>
									<StarIcon
										className={`achievement-star ${
											isCompleted ? 'filled' : ''
										}`}
									/>
									<span className='achievement-text'>
										{condition.description}
									</span>
								</div>
							)
						}
					)}
				</div>
			</div>
		</div>
	)
}

export default LevelStarsModal
