import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../Components/Background'
import '../Sass/SettingsPage.scss'

function SettingsPage() {
	const [startAnimation, setStartAnimation] = useState(false)
	const navigate = useNavigate()

	function handleBack() {
		setStartAnimation(true)
		setTimeout(() => navigate('/'), 1000)
	}

	return (
		<div className={`SettingsPage ${startAnimation ? 'animate' : ''}`}>
			<h1 className='title'>Настройки</h1>
			<button onClick={handleBack} className='back-button'>
				Назад
			</button>
			<Background />
		</div>
	)
}

export default SettingsPage
