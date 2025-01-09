const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/', async (req, res) => {
	try {
		const { userId, levelId, achievements } = req.body
		
		const user = await User.findById(userId)
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден',
			})
		}

		if (!user.achievements) {
			user.achievements = {}
		}

		if (!user.achievements[levelId]) {
			user.achievements[levelId] = {}
		}

		// Подсчитываем количество true
		const currentTrueCount = Object.values(user.achievements[levelId]).filter(
			v => v === true
		).length
		const newTrueCount = Object.values(achievements).filter(
			v => v === true
		).length

		console.log('Current true:', currentTrueCount, 'New true:', newTrueCount)

		if (newTrueCount > currentTrueCount) {
			// Используем markModified чтобы сообщить Mongoose об изменении вложенного объекта
			user.achievements[levelId] = achievements
			user.markModified('achievements')
			await user.save()

			console.log('Saved achievements:', user.achievements)

			res.json({
				success: true,
				message: 'Прогресс успешно обновлен',
				updatedUser: user,
			})
		} else {
			res.status(400).json({
				success: false,
				message: 'Текущий результат не лучше предыдущего',
			})
		}
	} catch (error) {
		console.error('Ошибка при обновлении прогресса:', error)
		res.status(500).json({
			success: false,
			message: 'Внутренняя ошибка сервера',
			error: error.message,
		})
	}
})

module.exports = router
