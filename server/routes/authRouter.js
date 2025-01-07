const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	try {
		const { access_token, username } = req.body

		console.log('1. Received request with:', {
			hasToken: !!access_token,
			username,
		})

		// Проверяем Google токен
		let googleData
		try {
			const googleResponse = await fetch(
				`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
			)

			if (!googleResponse.ok) {
				console.log('2. Google API error:', {
					status: googleResponse.status,
					statusText: googleResponse.statusText,
				})
				return res.status(401).json({ message: 'Invalid Google token' })
			}

			googleData = await googleResponse.json()
			console.log('3. Google API data:', {
				sub: googleData.sub,
				email: googleData.email,
				name: googleData.name,
			})
		} catch (googleError) {
			console.error('4. Google API fetch error:', googleError)
			return res.status(500).json({ message: 'Failed to fetch Google data' })
		}

		// Проверяем обязательные поля
		if (!googleData.sub || !googleData.email) {
			console.log('5. Missing required Google data')
			return res.status(400).json({ message: 'Incomplete Google profile data' })
		}

		// Создаем пользователя
		const userData = {
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			achievements: {},
			createdAt: new Date(),
		}

		console.log('6. Creating user with data:', userData)

		try {
			const user = new User(userData)

			// Явная валидация
			const validationError = user.validateSync()
			if (validationError) {
				console.log('7. Validation failed:', validationError.errors)
				return res.status(400).json({
					message: 'Validation failed',
					errors: validationError.errors,
				})
			}

			// Сохранение
			const savedUser = await user.save()
			console.log('8. User saved:', savedUser.toObject())

			return res.json({
				message: 'Success',
				user: {
					googleId: savedUser.googleId,
					username: savedUser.username,
					email: savedUser.email,
				},
			})
		} catch (error) {
			console.log('9. Save error:', {
				name: error.name,
				message: error.message,
				code: error.code,
				errors: error.errors,
			})

			return res.status(500).json({
				message: 'Failed to create user',
				error: error.message,
				details: error.errors,
			})
		}
	} catch (error) {
		console.error('10. Unexpected error:', error)
		return res.status(500).json({ message: 'Server error' })
	}
})

module.exports = router
