const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	const { access_token, username } = req.body

	if (!access_token) {
		return res.status(400).json({ message: 'Access token is required' })
	}
	if (!username) {
		return res.status(400).json({ message: 'Username is required' })
	}

	try {
		// Запрос к Google API
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
		)

		if (!googleResponse.ok) {
			const errorMessage = `Error from Google API: ${googleResponse.statusText}`
			return res.status(googleResponse.status).json({ message: errorMessage })
		}

		const googleData = await googleResponse.json()

		// Проверяем, существует ли пользователь
		let user = await User.findOne({ googleId: googleData.sub })

		if (user) {
			// Если пользователь существует, возвращаем его данные
			return res.status(200).json({
				message: 'User already exists',
				user: {
					googleId: user.googleId,
					username: user.username,
					email: user.email,
					achievements: user.achievements,
				},
			})
		}

		// Создаем нового пользователя
		user = new User({
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			achievements: {}, // Инициализируем пустой объект достижений
			createdAt: new Date(),
		})

		await user.save()

		return res.status(200).json({
			message: 'User created successfully',
			user: {
				googleId: user.googleId,
				username: user.username,
				email: user.email,
				achievements: user.achievements,
			},
		})
	} catch (error) {
		console.error('Auth error:', error)
		const isFetchError = error.message.includes('Failed to fetch')
		const errorMessage = isFetchError
			? 'Service Unavailable: Could not connect to external services'
			: 'Internal Server Error: Unexpected failure'

		return res.status(isFetchError ? 503 : 500).json({
			message: errorMessage,
			error: error.message,
		})
	}
})

module.exports = router
