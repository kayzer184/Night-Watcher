const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/', async (req, res) => {
	try {
		const { userId, levelId, achievements } = req.body
		console.log(
			`[Update Request] User: ${userId}, Level: ${levelId}, Achievements:`,
			JSON.stringify(achievements)
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

		const currentLevelAchievements = user.achievements[levelId] || {}
		console.log(
			`[Current] Level achievements:`,
			JSON.stringify(currentLevelAchievements)
		)

		console.log(
			`[Received] New achievements data:`,
			JSON.stringify(achievements)
		)

		const currentTrueCount = Object.values(currentLevelAchievements).filter(
			v => v === true
		).length

		const newAchievements = { ...achievements }
		const newTrueCount = Object.values(newAchievements).filter(
			v => v === true
		).length

		console.log(
			`[Progress] Level: ${levelId}, Current true: ${currentTrueCount}, New true: ${newTrueCount}`
		)

		if (newTrueCount > currentTrueCount) {
			user.achievements[levelId] = newAchievements
			user.markModified('achievements')
			await user.save()

			console.log(
				`[Success] Updated achievements for user ${userId}. New state:`,
				JSON.stringify(user.achievements)
			)
			console.log(
				`[Details] Level ${levelId} achievements:`,
				JSON.stringify(user.achievements[levelId])
			)

			res.json({
				success: true,
				message: 'Прогресс успешно обновлен',
				updatedUser: user,
			})
		} else {
			console.log(
				`[Rejected] No progress improvement. User: ${userId}, Level: ${levelId}`
			)
			console.log(
				`[Details] Current achievements: ${JSON.stringify(
					currentLevelAchievements
				)}`
			)
			console.log(
				`[Details] New achievements: ${JSON.stringify(newAchievements)}`
			)
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
