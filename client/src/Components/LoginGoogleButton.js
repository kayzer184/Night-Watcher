import React, { useState, useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import Alert from './Notification'
import '../Sass/LoginGoogleButton.scss'

const LoginGoogleButton = () => {
	const [showModal, setShowModal] = useState(false)
	const [inputValue, setInputValue] = useState('')
	const [accessToken, setAccessToken] = useState('')
	const [notifications, setNotifications] = useState([])
	const { setUser } = useAuth()

	const addNotification = (type, message) => {
		const id = Date.now()
		setNotifications(prev => [...prev, { id, type, message }])
		setTimeout(() => {
			setNotifications(prev => prev.filter(notif => notif.id !== id))
		}, 5000)
	}

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: async response => {
			console.log('Google login success')
			setAccessToken(response.access_token)

			try {
				const checkResponse = await fetch(
					'https://api-night-watcher.vercel.app/userExist',
					{
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify({
							access_token: response.access_token,
						}),
					}
				)

				const data = await checkResponse.json()
				console.log('User exist check:', data)

				if (!data.exists) {
					setShowModal(true)
				} else {
					await handleAuthRequest(response.access_token)
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

	const handleAuthRequest = async token => {
		try {
			const response = await fetch(
				'https://api-night-watcher.vercel.app/auth/google',
				{
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					body: JSON.stringify({
						access_token: token,
					}),
				}
			)

			const data = await response.json()
			console.log('Auth response:', data)

			if (data.user) {
				setUser(data.user)
				localStorage.setItem('user', JSON.stringify(data.user))
				addNotification('success', 'Успешный вход!')
				console.log('Notification added: success')
			} else {
				addNotification('error', 'Ошибка при входе')
				console.log('Notification added: error')
			}
		} catch (error) {
			console.error('Auth error:', error)
			addNotification('error', 'Ошибка при авторизации')
		}
	}

	const handleSendRequest = () => {
		if (!accessToken || !inputValue) {
			addNotification('error', 'Необходимо ввести имя пользователя')
			console.log('Notification added: error - empty input')
			return
		}

		fetch('https://api-night-watcher.vercel.app/auth/google', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				access_token: accessToken,
				username: inputValue,
			}),
		})
			.then(response => response.json())
			.then(data => {
				console.log('Registration response:', data)
				if (data.user) {
					setUser(data.user)
					localStorage.setItem('user', JSON.stringify(data.user))
					setShowModal(false)
					addNotification('success', 'Регистрация успешно завершена!')
					console.log('Notification added: success - registration')
				} else {
					addNotification('error', data.message || 'Ошибка при регистрации')
					console.log('Notification added: error - registration failed')
				}
			})
			.catch(error => {
				console.error('Error:', error)
				addNotification('error', 'Ошибка при регистрации')
			})
	}

	useEffect(() => {
		console.log('Current notifications:', notifications)
	}, [notifications])

	return (
		<div className='google-login-container'>
			<button className='button' onClick={handleGoogleLogin}>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					preserveAspectRatio='xMidYMid'
					viewBox='0 0 256 262'
					className='svg'
				>
					<path
						fill='#4285F4'
						d='M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027'
						className='blue'
					/>
					<path
						fill='#34A853'
						d='M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1'
						className='green'
					/>
					<path
						fill='#FBBC05'
						d='M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782'
						className='yellow'
					/>
					<path
						fill='#EB4335'
						d='M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251'
						className='red'
					/>
				</svg>
				<span className='text'>Войти с Google</span>
			</button>

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

			<div className='alerts-container'>
				{notifications.map(notif => (
					<Alert
						key={notif.id}
						status={notif.type}
						Notification__text={notif.message}
					/>
				))}
			</div>
		</div>
	)
}

export default LoginGoogleButton
