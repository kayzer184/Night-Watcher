import React from 'react'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import '../Sass/LevelStarsModal.scss'

const LevelStarsModal = ({
	level,
	isPreview = false,
	gameStats = null,
	achievements = {},
}) => {
	const levelAchievements = achievements[level.toString()] || {}

	return (
		<div className='modal-stars-container'>
			<div className='achievements-section'>
				<h3>Достижения уровня</h3>
				<div className='achievements-list'>
					{Object.values(LEVELS_CONFIG[level].starConditions).map(
						(condition, index) => (
							<div
								key={condition.id}
								className={`achievement-item ${
									levelAchievements[(index + 1).toString()] ? 'completed' : ''
								}`}
							>
								<StarIcon
									className={`achievement-star ${
										levelAchievements[(index + 1).toString()] ? 'filled' : ''
									}`}
								/>
								<span className='achievement-text'>
									{condition.description}
								</span>
							</div>
						)
					)}
				</div>
			</div>
		</div>
	)
}

export default LevelStarsModal
