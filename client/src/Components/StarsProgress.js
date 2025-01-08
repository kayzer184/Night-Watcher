import React from 'react'
import '../Sass/StarsProgress.scss'

const StarsProgress = ({ stars, large = false }) => {
	console.log('Rendering stars:', { stars, large })
	return (
		<div className={`stars-container ${large ? 'large' : ''}`}>
			{[1, 2, 3].map(star => {
				console.log(`Star ${star} filled:`, star <= stars)
				return (
					<span
						key={star}
						className={`star ${star <= stars ? 'filled' : 'empty'}`}
					>
						★
					</span>
				)
			})}
		</div>
	)
}

export default StarsProgress
