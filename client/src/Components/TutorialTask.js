import React from 'react'
import '../Sass/TutorialTask.scss'

function TutorialTask({ text }) {
	return (
		<div className='tutorial-task'>
			<div className='tutorial-task-content'>
				<span className='tutorial-task-icon'>⚡</span>
				<p>{text}</p>
			</div>
		</div>
	)
}

export default TutorialTask
