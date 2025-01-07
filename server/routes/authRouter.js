const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	try {
		const { access_token, username } = req.body
		console.log('Auth request:', { hasToken: !!access_token, username })

		// Получаем данные от Google
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
		)
		const googleData = await googleResponse.json()
		console.log('Google data:', googleData)

		// Проверяем существующего пользователя
		let user = await User.findOne({ googleId: googleData.sub })

		if (user) {
			console.log('Existing user found:', user)
			return res.json({
				message: 'Login successful',
				user: {
					googleId: user.googleId,
					username: user.username,
					email: user.email,
				},
			})
		}

		// Создаем нового пользователя
		user = new User({
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			achievements: {},
			createdAt: new Date(),
		})

		console.log('Attempting to save new user:', user)

		await user.save()
		console.log('New user saved successfully')

		res.json({
			message: 'Registration successful',
			user: {
				googleId: user.googleId,
				username: user.username,
				email: user.email,
			},
		})
	} catch (error) {
		console.error('Auth error:', {
			name: error.name,
			message: error.message,
			stack: error.stack,
		})

		res.status(500).json({
			message: 'Failed to create user',
			error: error.message,
		})
	}
})

module.exports = router
