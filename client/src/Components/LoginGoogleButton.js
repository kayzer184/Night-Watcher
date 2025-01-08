import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'

const LoginGoogleButton = () => {
	const navigate = useNavigate()
	const { login } = useAuth()

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
				// Используем функцию login из контекста
				login(data.user)
			} else {
				console.error('Auth error:', data.message)
			}
		} catch (error) {
			console.error('Auth error:', error)
		}
	}

	return (
		<div className='google-login-button'>
			<GoogleLogin
				onSuccess={onSuccess}
				onError={() => {
					console.log('Login Failed')
				}}
			/>
		</div>
	)
}

export default LoginGoogleButton
