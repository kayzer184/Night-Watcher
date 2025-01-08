const express = require('express')
const router = express.Router()
const User = require('../models/User')
const cors = require('cors')

// Добавляем CORS middleware для этого маршрута
router.use(
	cors({
		origin: ['http://localhost:3000', 'https://night-watcher.vercel.app'],
		methods: ['POST', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
)

// Обработка OPTIONS запроса
router.options('/', (req, res) => {
	res.status(200).end()
})

router.post('/', async (req, res) => {
	try {
		const { access_token } = req.body

		if (!access_token) {
			return res.status(400).json({ message: 'Access token is required' })
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
			return res.status(400).json({ message: 'Invalid access token' })
		}

		const googleData = await googleResponse.json()

		if (!googleData.sub || !googleData.email) {
			return res.status(400).json({ message: 'Invalid Google response' })
		}

		let existingUser = await User.findOne({ googleId: googleData.sub })

		res.json({ exists: !!existingUser })
	} catch (error) {
		console.error('Server error:', error) // добавляем логирование ошибки
		res.status(500).json({
			message: 'Ошибка сервера при проверке пользователя',
			error: error.message,
		})
	}
})

module.exports = router
