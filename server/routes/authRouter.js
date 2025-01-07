const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	try {
		const { access_token, username } = req.body

		// Подробное логирование входных данных
		console.log('Request body:', {
			hasAccessToken: !!access_token,
			username: username,
			bodyLength: JSON.stringify(req.body).length,
		})

		if (!access_token || !username) {
			console.log('Validation failed - missing fields')
			return res.status(400).json({
				message: 'Missing required fields',
			})
		}

		// Запрос к Google API с обработкой ошибок
		let googleData
		try {
			const googleResponse = await fetch(
				`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
			)
			googleData = await googleResponse.json()
			console.log('Google API response:', {
				hasGoogleId: !!googleData.sub,
				hasEmail: !!googleData.email,
			})
		} catch (googleError) {
			console.error('Google API error:', googleError)
			return res.status(401).json({
				message: 'Failed to verify Google token',
			})
		}

		// Проверяем данные от Google
		if (!googleData.sub || !googleData.email) {
			console.log('Invalid Google data')
			return res.status(400).json({
				message: 'Invalid Google account data',
			})
		}

		// Проверяем существующего пользователя
		const existingUser = await User.findOne({ googleId: googleData.sub })

		if (existingUser) {
			console.log('User exists:', {
				googleId: existingUser.googleId,
				username: existingUser.username,
			})
			return res.json({
				message: 'Login successful',
				user: {
					googleId: existingUser.googleId,
					username: existingUser.username,
					email: existingUser.email,
				},
			})
		}

		// Создаем объект пользователя
		const newUser = {
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			achievements: {},
			createdAt: new Date(),
		}

		// Выводим точные данные для отладки
		console.log('Debug - New user data:', JSON.stringify(newUser, null, 2))

		// Проверяем каждое поле отдельно
		if (!newUser.googleId) console.log('Missing googleId')
		if (!newUser.username) console.log('Missing username')
		if (!newUser.email) console.log('Missing email')

		try {
			// Создаем модель и проверяем её напрямую
			const userModel = new User(newUser)

			// Явная валидация с выводом ошибок
			const validationErrors = userModel.validateSync()
			if (validationErrors) {
				console.error(
					'Validation errors:',
					JSON.stringify(validationErrors.errors, null, 2)
				)
				return res.status(400).json({
					message: 'Validation failed',
					errors: Object.keys(validationErrors.errors).reduce((acc, key) => {
						acc[key] = validationErrors.errors[key].message
						return acc
					}, {}),
				})
			}

			// Пробуем сохранить
			const savedUser = await userModel.save()
			console.log('User saved successfully:', {
				id: savedUser._id,
				googleId: savedUser.googleId,
				email: savedUser.email,
			})

			return res.json({
				message: 'Registration successful',
				user: {
					googleId: savedUser.googleId,
					username: savedUser.username,
					email: savedUser.email,
				},
			})
		} catch (dbError) {
			// Подробный вывод ошибки базы данных
			console.error('Database error details:', {
				name: dbError.name,
				message: dbError.message,
				code: dbError.code,
				errors: dbError.errors
					? JSON.stringify(dbError.errors, null, 2)
					: 'No validation errors',
			})

			if (dbError.code === 11000) {
				return res.status(409).json({
					message: 'User already exists',
					error: 'Duplicate key error',
				})
			}

			return res.status(500).json({
				message: 'Failed to create user',
				error: dbError.message,
				details: dbError.errors,
			})
		}
	} catch (error) {
		console.error('Unexpected error:', error)
		return res.status(500).json({
			message: 'Server error',
			error: error.message,
		})
	}
})

module.exports = router
