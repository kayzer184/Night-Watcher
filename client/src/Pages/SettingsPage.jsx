import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import LoginGoogleButton from '../Components/LoginGoogleButton'

import Background from '../Components/Background'
import '../Sass/SettingsPage.scss'
import Notification from '../Components/Notification'
import { useAuth } from '../context/AuthContext'

function SettingsPage() {
	const { user, setUser } = useAuth()
	const [startAnimation, setStartAnimation] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [inputValue, setInputValue] = useState('')
	const [accessToken, setAccessToken] = useState('')
	const [notifications, setNotifications] = useState([]) // Состояние для уведомлений
	const navigate = useNavigate()

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: response => {
			console.log('Google login successful:', response)
			setAccessToken(response.access_token)
			setShowModal(true)
			addNotification('success', 'Google login successful!')
		},
		onError: error => {
			console.log(error)
			addNotification('error', 'Google login failed.')
		},
	})

	function handleBack() {
		setStartAnimation(true)
		setTimeout(() => navigate('/'), 1000)
	}

	function handleSendRequest() {
		if (!accessToken) {
			console.error('Access token is missing!')
			addNotification('error', 'Access token is missing!')
			return
		}

		fetch('https://api-night-watcher.vercel.app/auth/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				access_token: accessToken,
				username: inputValue,
			}),
		})
			.then(response => response.json())
			.then(data => {
				console.log('Server response:', data)
				setShowModal(false)
				addNotification('success', 'Registration successful!')
			})
			.catch(error => {
				console.error('Error sending request:', error)
				addNotification('error', 'Failed to register. Please try again.')
			})
	}

	// Функция для добавления уведомления
	function addNotification(type, message) {
		const id = Date.now() // Уникальный идентификатор
		setNotifications(prev => [...prev, { id, type, message }])
		setTimeout(() => removeNotification(id), 5000) // Автоматическое удаление через 5 секунд
	}

	// Функция для удаления уведомления
	function removeNotification(id) {
		setNotifications(prev => prev.filter(notif => notif.id !== id))
	}

	function handleLogout() {
		setUser(null)
	}

	return (
		<div className={`SettingsPage ${startAnimation ? 'animate' : ''}`}>
			<h1 className='title'>Настройки</h1>
			{!user ? (
				<LoginGoogleButton onClick={handleGoogleLogin} />
			) : (
				<div>
					<p>Вы вошли как {user.username}</p>
					<button onClick={handleLogout}>Выйти</button>
				</div>
			)}
			<button onClick={handleBack} className='back-button'>
				Назад
			</button>
			<Background />

			{/* Модальное окно */}
			{showModal && (
				<div className='modal__backdrop'>
					<div className='modal'>
						<span className='modal__title'>Регистрация</span>
						<p className='modal__content'>
							Введите своё имя, под которым попадёте в таблицу лидеров
						</p>
						<div className='modal__form'>
							<input
								type='text'
								name='username'
								className='modal-input'
								value={inputValue}
								onChange={e => setInputValue(e.target.value)}
								placeholder='Введите ваш никнейм'
							/>
							<button className='modal__sign-up' onClick={handleSendRequest}>
								Зарегистрироваться
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='notifications'>
				{notifications.map(notif => (
					<Notification
						key={notif.id}
						status={notif.type}
						Notification__text={notif.message}
					/>
				))}
			</div>
		</div>
	)
}

export default SettingsPage
