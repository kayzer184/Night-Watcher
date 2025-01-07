import React, { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		const savedUser = localStorage.getItem('user')
		return savedUser ? JSON.parse(savedUser) : null
	})

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
