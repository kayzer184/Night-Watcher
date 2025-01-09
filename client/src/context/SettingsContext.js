import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
	const [volume, setVolume] = useState(() => {
		const savedVolume = localStorage.getItem('gameVolume')
		return savedVolume ? parseFloat(savedVolume) : 0.5
	})

	const [brightness, setBrightness] = useState(() => {
		const savedBrightness = localStorage.getItem('gameBrightness')
		return savedBrightness ? parseFloat(savedBrightness) : 0.05
	})

	useEffect(() => {
		localStorage.setItem('gameVolume', volume)
	}, [volume])

	useEffect(() => {
		localStorage.setItem('gameBrightness', brightness)
	}, [brightness])

	return (
		<SettingsContext.Provider
			value={{
				volume,
				setVolume,
				brightness,
				setBrightness,
			}}
		>
			{children}
		</SettingsContext.Provider>
	)
}

export function useSettings() {
	const context = useContext(SettingsContext)
	if (!context) {
		throw new Error('useSettings must be used within a SettingsProvider')
	}
	return context
}
