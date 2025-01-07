const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/User')

// Проверяем, что модель доступна
console.log('User model:', {
	modelName: User.modelName,
	collection: User.collection.name,
	schema: Object.keys(User.schema.paths),
})

router.post('/google', async (req, res) => {
	try {
		const { access_token, username } = req.body

		if (!access_token || !username) {
			return res
				.status(400)
				.json({ message: 'Access token and username are required' })
		}

		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		)

		if (!googleResponse.ok) {
			console.error('Google API error:', await googleResponse.text())
			return res.status(400).json({ message: 'Invalid access token' })
		}

		const googleData = await googleResponse.json()

		// Проверяем наличие необходимых данных от Google
		if (!googleData.sub || !googleData.email) {
			console.error('Missing Google data:', googleData)
			return res.status(400).json({ message: 'Invalid Google response' })
		}

		// Ищем существующего пользователя
		let user = await User.findOne({ googleId: googleData.sub })

		if (user) {
			return res.status(200).json({
				message: 'User authenticated successfully',
				user: {
					googleId: user.googleId,
					username: user.username,
					email: user.email,
					achievements: user.achievements,
				},
			})
		}

		// Создаем нового пользователя с проверкой всех обязательных полей
		const newUser = {
			googleId: String(googleData.sub),
			username: String(username),
			email: String(googleData.email),
			achievements: new Map(),
			createdAt: new Date(),
		}

		console.log('Creating new user:', JSON.stringify(newUser, null, 2))

		user = new User(newUser)
		await user.save()

		return res.status(201).json({
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
		return res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
			details: error.errors, // Добавляем детали ошибки валидации
		})
	}
})

module.exports = router
