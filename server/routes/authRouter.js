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

		console.log('Attempting to create user:', newUser)

		// Создаем и сохраняем пользователя с подробным логированием
		try {
			const userModel = new User(newUser)

			// Проверяем валидацию
			const validationError = userModel.validateSync()
			if (validationError) {
				console.error('Validation error:', validationError)
				return res.status(400).json({
					message: 'Validation failed',
					errors: validationError.errors,
				})
			}

			// Сохраняем пользователя
			const savedUser = await userModel.save()
			console.log('User saved successfully:', {
				id: savedUser._id,
				googleId: savedUser.googleId,
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
			console.error('Database error:', {
				name: dbError.name,
				message: dbError.message,
				code: dbError.code,
			})

			return res.status(500).json({
				message: 'Failed to create user',
				error: dbError.message,
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
