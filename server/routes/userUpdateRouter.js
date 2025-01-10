const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/', async (req, res) => {
	try {
		const { userId, levelId, achievements } = req.body
		console.log(
			`[Update Request] User: ${userId}, Level: ${levelId}, Achievements:`,
			achievements
		)

		const user = await User.findById(userId)
		if (!user) {
			console.log(`[Error] User not found: ${userId}`)
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден',
			})
		}

		if (!user.achievements) {
			console.log(`[Init] Creating achievements object for user: ${userId}`)
			user.achievements = {}
		}

		const currentTrueCount = Object.values(
			user.achievements[levelId] || {}
		).filter(v => v === true).length
		const newTrueCount = Object.values(achievements).filter(
			v => v === true
		).length

		console.log(
			`[Progress] Level: ${levelId}, Current true: ${currentTrueCount}, New true: ${newTrueCount}`
		)

		if (newTrueCount > currentTrueCount) {
			user.achievements[levelId] = achievements
			user.markModified('achievements')
			await user.save()

			console.log(
				`[Success] Updated achievements for user ${userId}:`,
				JSON.stringify(user.achievements)
			)

			res.json({
				success: true,
				message: 'Прогресс успешно обновлен',
				updatedUser: user,
			})
		} else {
			console.log(`[Rejected] No progress improvement for user ${userId}`)
			res.status(400).json({
				success: false,
				message: 'Текущий результат не лучше предыдущего',
			})
		}
	} catch (error) {
		console.error(`[Error] Failed to update progress:`, error)
		res.status(500).json({
			success: false,
			message: 'Внутренняя ошибка сервера',
			error: error.message,
		})
	}
})

module.exports = router
