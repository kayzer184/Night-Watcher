import React from 'react'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import '../Sass/LevelStarsModal.scss'

const LevelStarsModal = ({ level, isPreview = false, gameStats = null }) => {
	if (isPreview) {
		// Упрощенное отображение для превью
		return (
			<div className='stars-preview'>
				{[1, 2, 3].map(star => (
					<StarIcon key={star} className='star-icon' />
				))}
			</div>
		)
	}

	// Полное отображение для игрового интерфейса
	return (
		<div className='stars-container'>
			<h3>Достижения уровня</h3>
			{Object.values(LEVELS_CONFIG[level].starConditions).map(condition => (
				<div
					key={condition.id}
					className={`star-condition ${
						gameStats && condition.check(gameStats) ? 'completed' : ''
					}`}
				>
					<StarIcon
						className={`star-icon ${
							gameStats && condition.check(gameStats) ? 'filled' : ''
						}`}
					/>
					<span className='condition-description'>{condition.description}</span>
				</div>
			))}
		</div>
	)
}

export default LevelStarsModal
