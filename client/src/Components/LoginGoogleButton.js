import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import '../Sass/LoginGoogleButton.scss'

const LoginGoogleButton = () => {
	const navigate = useNavigate()
	const { setUser } = useAuth()
	const [notifications, setNotifications] = useState([])

	useEffect(() => {
		console.log('Current notifications:', notifications)
	}, [notifications])

	const addNotification = notification => {
		setNotifications(prev => [...prev, notification])
		setTimeout(() => {
			setNotifications(prev =>
				prev.filter(n => n.id !== notification.id)
			)
		}, 3000)
	}

	const onSuccess = async response => {
		try {
			const result = await fetch(
				'https://api-night-watcher.vercel.app/auth/google',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ credential: response.credential }),
				}
			)

			const data = await result.json()

			if (data.success) {
				console.log('Google login success')
				setUser(data.user)
			} else {
				console.error('Auth error:', data.message)
				addNotification({
					id: Date.now(),
					type: 'error',
					message: data.message || 'Ошибка авторизации',
				})
			}
		} catch (error) {
			console.error('Auth error:', error)
			addNotification({
				id: Date.now(),
				type: 'error',
				message: 'Ошибка при авторизации',
			})
		}
	}

	return (
		<div className='google-login-button'>
			<GoogleLogin
				onSuccess={onSuccess}
				onError={() => {
					console.log('Login Failed')
					addNotification({
						id: Date.now(),
						type: 'error',
						message: 'Ошибка входа через Google',
					})
				}}
			/>
			<div className='notifications'>
				{notifications.map(notification => (
					<div
						key={notification.id}
						className={`notification ${notification.type}`}
					>
						{notification.message}
					</div>
				))}
			</div>
		</div>
	)
}

export default LoginGoogleButton
