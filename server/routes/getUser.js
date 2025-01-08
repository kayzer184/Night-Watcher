const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден',
			})
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				googleId: user.googleId,
				username: user.username,
				email: user.email,
				achievements: user.achievements,
				createdAt: user.createdAt
			},
		})
	} catch (error) {
		console.error('Error getting user:', error)
		res.status(500).json({
			success: false,
			message: 'Ошибка при получении данных пользователя',
		})
	}
})

module.exports = router
