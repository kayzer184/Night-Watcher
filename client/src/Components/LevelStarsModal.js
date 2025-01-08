import React from 'react'
import { LEVELS_CONFIG } from '../Config/LevelsConfig'
import { ReactComponent as StarIcon } from '../Assets/Icons/Star.svg'
import '../Sass/LevelStarsModal.scss'

const LevelStarsModal = ({ level, isPreview = false, gameStats = null }) => {
	return (
		<div className='modal-stars-container'>
			<div className='achievements-list'>
				{Object.values(LEVELS_CONFIG[level].starConditions).map(condition => (
					<div
						key={condition.id}
						className={`achievement-item ${
							!isPreview && gameStats && condition.check(gameStats)
								? 'completed'
								: ''
						}`}
					>
						<StarIcon
							className={`achievement-star ${
								!isPreview && gameStats && condition.check(gameStats)
									? 'filled'
									: ''
							}`}
						/>
						<span className='achievement-text'>{condition.description}</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default LevelStarsModal
