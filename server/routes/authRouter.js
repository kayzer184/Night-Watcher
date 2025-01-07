const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	const { access_token, username } = req.body

	try {
		// Запрос к Google API
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
		)
		const googleData = await googleResponse.json()

		// Ищем пользователя
		let user = await User.findOne({ googleId: googleData.sub })

		if (user) {
			// Если пользователь существует - просто логиним его
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
		user = new User({
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
		})
		await user.save()

		res.json({
			message: 'Registration successful',
			user: {
				googleId: user.googleId,
				username: user.username,
				email: user.email,
			},
		})
	} catch (error) {
		console.error('Auth error:', error)
		res.status(500).json({ message: 'Authentication failed' })
	}
})

module.exports = router
