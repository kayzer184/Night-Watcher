import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Проверяем localStorage при загрузке
		const savedUser = localStorage.getItem('user')
		if (savedUser) {
			// Сразу устанавливаем сохраненные данные
			setUser(JSON.parse(savedUser))

			// Затем обновляем их с сервера
			const userData = JSON.parse(savedUser)
			fetchUserData(userData.id)
		} else {
			setLoading(false)
		}
	}, [])

	const fetchUserData = async userId => {
		try {
			const response = await fetch(
				`https://api-night-watcher.vercel.app/getUser/${userId}`
			)
			const data = await response.json()
			if (data.success) {
				setUser(data.user)
				localStorage.setItem('user', JSON.stringify(data.user))
			}
		} catch (error) {
			console.error('Error fetching user data:', error)
		} finally {
			setLoading(false)
		}
	}

	const login = userData => {
		setUser(userData)
		localStorage.setItem('user', JSON.stringify(userData))
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem('user')
	}

	// Валидация пользователя
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

					if (!response.ok) {
						logout()
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
					logout()
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

		const timer = setTimeout(() => {
			validateUser()
		}, 1000)

		return () => clearTimeout(timer)
	}, [user?.id])

	return (
		<AuthContext.Provider value={{ user, login, logout, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
