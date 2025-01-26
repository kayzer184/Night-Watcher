import React, { useEffect, useState } from 'react'
import { TUTORIAL_STEPS } from '../Config/TutorialConfig'
import '../Sass/Tutorial.scss'

function Tutorial({
	currentStep,
	setCurrentStep,
	onComplete,
	gameState,
	onWaitForAction,
}) {
	const currentStepData = TUTORIAL_STEPS[currentStep]
	const [canProgress, setCanProgress] = useState(!currentStepData.waitForAction)

	useEffect(() => {
		if (currentStepData.highlight) {
			const element = document.querySelector(currentStepData.highlight)
			if (element) {
				element.classList.add('tutorial-highlight')
				return () => element.classList.remove('tutorial-highlight')
			}
		}
	}, [currentStep, currentStepData.highlight])

	useEffect(() => {
		if (currentStepData.waitForAction) {
			onWaitForAction(true)
			if (gameState.lightSwitched) {
				setCanProgress(true)
				onWaitForAction(false)
			}
		} else {
			onWaitForAction(false)
			setCanProgress(true)
		}
	}, [currentStepData, gameState, onWaitForAction])

	const handleNext = () => {
		if (currentStep < Object.keys(TUTORIAL_STEPS).length) {
			setCurrentStep(prev => prev + 1)
			setCanProgress(!TUTORIAL_STEPS[currentStep + 1]?.waitForAction)
		} else {
			onComplete()
		}
	}

	return (
		<div
			className={`tutorial-container ${
				currentStepData.overlay ? 'tutorial-overlay' : ''
			}`}
			onClick={e => e.stopPropagation()}
		>
			<div
				className={`tutorial-content tutorial-position-${currentStepData.position}`}
			>
				<p>{currentStepData.text}</p>
				{canProgress && (
					<button onClick={handleNext} className='tutorial-button'>
						{currentStep === Object.keys(TUTORIAL_STEPS).length
							? 'Начать игру'
							: 'Далее'}
					</button>
				)}
			</div>
		</div>
	)
}

export default Tutorial
