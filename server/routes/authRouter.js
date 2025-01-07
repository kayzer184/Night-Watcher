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

		// Получаем данные от Google
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
				},
			}
		)

		if (!googleResponse.ok) {
			return res.status(400).json({ message: 'Invalid access token' })
		}

		const googleData = await googleResponse.json()

		if (!googleData.sub || !googleData.email) {
			return res.status(400).json({ message: 'Invalid Google response' })
		}

		// Ищем существующего пользователя
		let user = await User.findOne({ googleId: googleData.sub })

		// Если пользователь существует и username не передан - это вход
		if (user && !username) {
			return res.status(200).json({
				message: `Добро пожаловать, ${user.username}!`,
				user: {
					id: user.id,
					username: user.username,
				},
			})
		}

		// Если username передан - это регистрация
		if (username) {
			if (user) {
				return res.status(400).json({ message: 'Пользователь уже существует' })
			}

			user = new User({
				googleId: String(googleData.sub),
				username: String(username),
				email: String(googleData.email),
				achievements: new Map(),
				createdAt: new Date(),
			})
			await user.save()

			return res.status(201).json({
				message: `Регистрация успешна, ${username}!`,
				user: {
					id: user.id,
					username: user.username,
				},
			})
		}

		return res.status(400).json({ message: 'Invalid request' })
	} catch (error) {
		console.error('Auth error:', error)
		return res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
			details: error.errors,
		})
	}
})

router.post('/validate', async (req, res) => {
	try {
		const { userId, username } = req.body

		if (!userId || !username) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
			})
		}

		// Проверяем существование пользователя
		const user = await User.findOne({
			_id: userId,
			username: username,
		})

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid session',
			})
		}

		return res.status(200).json({
			success: true,
			message: 'Session valid',
		})
	} catch (error) {
		console.error('Validation error:', error)
		return res.status(500).json({
			success: false,
			message: 'Internal Server Error',
			error: error.message,
		})
	}
})

module.exports = router
