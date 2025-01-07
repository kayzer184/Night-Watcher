const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	const { access_token, username } = req.body

	// Проверяем входные данные
	if (!access_token || !username) {
		console.log('Missing required fields:', {
			access_token: !!access_token,
			username: !!username,
		})
		return res
			.status(400)
			.json({ message: 'Access token and username are required' })
	}

	try {
		console.log('Fetching user info from Google...')
		// Запрос к Google API
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
		)

		if (!googleResponse.ok) {
			console.error('Google API error:', {
				status: googleResponse.status,
				statusText: googleResponse.statusText,
			})
			return res.status(401).json({ message: 'Failed to verify Google token' })
		}

		const googleData = await googleResponse.json()
		console.log('Google data received:', {
			sub: googleData.sub,
			email: googleData.email,
		})

		// Ищем пользователя
		let user = await User.findOne({ googleId: googleData.sub })
		console.log('Existing user found:', !!user)

		if (user) {
			// Если пользователь существует - просто логиним его
			console.log('User exists, sending response')
			return res.json({
				message: 'Login successful',
				user: {
					googleId: user.googleId,
					username: user.username,
					email: user.email,
				},
			})
		}

		// Если пользователя нет - создаем нового
		console.log('Creating new user...')
		user = new User({
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			createdAt: new Date(),
		})

		await user.save()
		console.log('New user created successfully')

		res.json({
			message: 'Registration successful',
			user: {
				googleId: user.googleId,
				username: user.username,
				email: user.email,
			},
		})
	} catch (error) {
		console.error('Detailed error:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		})

		// Отправляем более информативную ошибку
		res.status(500).json({
			message: 'Authentication failed',
			error: error.message,
			type: error.name,
		})
	}
})

module.exports = router
