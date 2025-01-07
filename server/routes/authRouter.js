const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/google', async (req, res) => {
	try {
		const { access_token, username } = req.body;
		console.log('Received request data:', { access_token: !!access_token, username });

		if (!access_token || !username) {
			return res.status(400).json({ 
				message: 'Missing required fields',
				received: { hasToken: !!access_token, username }
			});
		}

		// Запрос к Google API
		const googleResponse = await fetch(
			`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
		);

		if (!googleResponse.ok) {
			return res.status(401).json({ 
				message: 'Google API error',
				status: googleResponse.status
			});
		}

		const googleData = await googleResponse.json();
		console.log('Google data:', {
			sub: googleData.sub,
			email: googleData.email,
			verified_email: googleData.email_verified
		});

		// Проверяем существующего пользователя
		const existingUser = await User.findOne({ 
			$or: [
				{ googleId: googleData.sub },
				{ email: googleData.email }
			]
		});

		if (existingUser) {
			console.log('Found existing user:', {
				googleId: existingUser.googleId,
				username: existingUser.username
			});
			return res.json({
				message: 'Login successful',
				user: {
					googleId: existingUser.googleId,
					username: existingUser.username,
					email: existingUser.email
				}
			});
		}

		// Создаем нового пользователя
		const userData = {
			googleId: googleData.sub,
			username: username,
			email: googleData.email,
			achievements: {},
			createdAt: new Date()
		};

		console.log('Creating new user with data:', userData);

		const user = new User(userData);

		try {
			await user.validate(); // Проверяем валидацию перед сохранением
			await user.save();
			console.log('User saved successfully');
			
			res.json({
				message: 'Registration successful',
				user: {
					googleId: user.googleId,
					username: user.username,
					email: user.email
				}
			});
		} catch (validationError) {
			console.error('Validation error:', {
				message: validationError.message,
				errors: validationError.errors
			});
			return res.status(400).json({
				message: 'Validation failed',
				errors: validationError.errors
			});
		}

	} catch (error) {
		console.error('Server error:', {
			name: error.name,
			message: error.message,
			stack: error.stack
		});
		res.status(500).json({
			message: 'Server error',
			error: error.message
		});
	}
});

module.exports = router
