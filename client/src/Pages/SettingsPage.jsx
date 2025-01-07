import React, { useState, useEffect } from 'react'
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
		onSuccess: async response => {
			setAccessToken(response.access_token)

			try {
				// Сначала проверяем существование пользователя
				const checkResponse = await fetch(
					'https://api-night-watcher.vercel.app/userExist',
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							access_token: response.access_token,
						}),
					}
				)

				const data = await checkResponse.json()

				if (!data.exists) {
					// Если пользователь не существует, показываем модальное окно регистрации
					setShowModal(true)
				} else {
					// Если пользователь существует, выполняем вход
					handleAuthRequest(response.access_token)
				}
			} catch (error) {
				console.error('Error checking user:', error)
				addNotification('error', 'Ошибка при проверке пользователя')
			}
		},
		onError: error => {
			console.error('Login Failed:', error)
			addNotification('error', 'Ошибка при входе через Google')
		},
	})

	// Функция для авторизации существующего пользователя
	const handleAuthRequest = async token => {
		try {
			const response = await fetch(
				'https://api-night-watcher.vercel.app/auth/google',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						access_token: token,
					}),
				}
			)

			const data = await response.json()

			if (data.user) {
				setUser(data.user)
				localStorage.setItem('user', JSON.stringify(data.user))
				addNotification('success', data.message || 'Успешный вход!')
			} else {
				addNotification('error', data.message || 'Ошибка при входе')
			}
		} catch (error) {
			console.error('Auth error:', error)
			addNotification('error', 'Ошибка при авторизации')
		}
	}

	// Функция для регистрации нового пользователя
	function handleSendRequest() {
		if (!accessToken || !inputValue) {
			addNotification('error', 'Необходимо ввести имя пользователя')
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
				if (data.user) {
					setUser(data.user)
					localStorage.setItem('user', JSON.stringify(data.user))
					setShowModal(false)
					addNotification('success', 'Регистрация успешно завершена!')
				} else {
					addNotification('error', data.message || 'Ошибка при регистрации')
				}
			})
			.catch(error => {
				console.error('Error:', error)
				addNotification('error', 'Ошибка при регистрации')
			})
	}

	function handleBack() {
		setStartAnimation(true)
		setTimeout(() => navigate('/'), 1000)
	}

	function addNotification(type, message) {
		const id = Date.now()
		setNotifications(prev => [...prev, { id, type, message }])
		setTimeout(() => removeNotification(id), 5000)
	}

	function removeNotification(id) {
		setNotifications(prev => prev.filter(notif => notif.id !== id))
	}

	function handleLogout() {
		setUser(null)
		localStorage.removeItem('user')
		addNotification('success', 'Вы успешно вышли из системы')
	}

	useEffect(() => {
		const savedUser = localStorage.getItem('user')
		if (savedUser && !user) {
			setUser(JSON.parse(savedUser))
		}
	}, [])

	return (
		<div className={`SettingsPage ${startAnimation ? 'animate' : ''}`}>
			<h1 className='title'>Настройки</h1>
			{!user ? (
				<LoginGoogleButton onClick={handleGoogleLogin} />
			) : (
				<div className='user-info'>
					<p>Вы вошли как {user.username}</p>
					<button onClick={handleLogout} className='logout-button'>
						Выйти
					</button>
				</div>
			)}
			<button onClick={handleBack} className='back-button'>
				Назад
			</button>
			<Background />
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
								placeholder='Введите имя'
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
