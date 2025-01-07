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

		try {
			// Проверяем, существует ли пользователь
			const existingUser = await User.findOne({
				googleId: googleData.sub,
			}).exec()

			if (existingUser) {
				console.log('Found existing user:', existingUser._id)
				return res.status(200).json({
					message: 'User already exists',
					user: {
						googleId: existingUser.googleId,
						username: existingUser.username,
						email: existingUser.email,
						achievements: existingUser.achievements,
					},
				})
			}

			// Создаем нового пользователя
			const newUser = new User({
				googleId: googleData.sub,
				username: username,
				email: googleData.email,
				achievements: {},
				createdAt: new Date(),
			})

			const savedUser = await newUser.save()
			console.log('Created new user:', savedUser._id)

			return res.status(200).json({
				message: 'User created successfully',
				user: {
					googleId: savedUser.googleId,
					username: savedUser.username,
					email: savedUser.email,
					achievements: savedUser.achievements,
				},
			})
		} catch (dbError) {
			console.error('Database error:', dbError)
			throw dbError
		}
	} catch (error) {
		console.error('Auth error:', error)
		return res.status(500).json({
			message: 'Internal Server Error',
			error: error.message,
		})
	}
})

module.exports = router
