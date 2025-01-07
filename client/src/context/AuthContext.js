import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem('user')
		return savedUser ? JSON.parse(savedUser) : null
	})

	// Проверка валидности пользователя при загрузке и после изменения user
	useEffect(() => {
		const validateUser = async () => {
			if (user) {
				try {
					const response = await fetch(
						'https://api-night-watcher.vercel.app/auth/validate',
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								userId: user.id,
								username: user.username,
							}),
						}
					)

					const data = await response.json()

					if (!response.ok) {
						console.log('Сессия недействительна')
						setUser(null)
						localStorage.removeItem('user')

						// Добавляем уведомление через window.dispatchEvent
						const event = new CustomEvent('showNotification', {
							detail: {
								type: 'error',
								message: 'Сессия недействительна. Пожалуйста, войдите снова.',
							},
						})
						window.dispatchEvent(event)
					}
				} catch (error) {
					console.error('Ошибка валидации:', error)
					setUser(null)
					localStorage.removeItem('user')

					// Добавляем уведомление об ошибке
					const event = new CustomEvent('showNotification', {
						detail: {
							type: 'error',
							message: 'Ошибка проверки сессии. Пожалуйста, войдите снова.',
						},
					})
					window.dispatchEvent(event)
				}
			}
		}

		// Добавляем задержку при первой валидации
		const timer = setTimeout(() => {
			validateUser()
		}, 1000) // Задержка в 1 секунду

		return () => clearTimeout(timer)
	}, [user?.id]) // Зависимость от user.id

	// Сохранение пользователя в localStorage
	useEffect(() => {
		if (user) {
			localStorage.setItem('user', JSON.stringify(user))
		} else {
			localStorage.removeItem('user')
		}
	}, [user])

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
