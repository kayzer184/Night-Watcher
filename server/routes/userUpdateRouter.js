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

		const achievementsToSave = {}
		for (const [key, value] of Object.entries(achievements)) {
			achievementsToSave[key] = value === true
		}

		console.log(
			`[Formatted] Achievements to save:`,
			JSON.stringify(achievementsToSave)
		)

		const currentTrueCount = Object.values(currentLevelAchievements).filter(
			v => v === true
		).length

		const newTrueCount = Object.values(achievementsToSave).filter(
			v => v === true
		).length

		console.log(
			`[Progress] Level: ${levelId}, Current true: ${currentTrueCount}, New true: ${newTrueCount}`
		)

		if (newTrueCount > currentTrueCount) {
			if (!user.achievements[levelId]) {
				user.achievements[levelId] = {}
			}

			user.achievements[levelId] = achievementsToSave

			console.log(
				`[Pre-save] Achievement structure:`,
				JSON.stringify(user.achievements)
			)

			user.markModified(`achievements.${levelId}`)
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

			return res.json({
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
				`[Details] New achievements: ${JSON.stringify(achievementsToSave)}`
			)
			return res.status(400).json({
				success: false,
				message: 'Текущий результат не лучше предыдущего',
			})
		}
	} catch (error) {
		console.error(`[Error] Failed to update progress:`, error)
		return res.status(500).json({
			success: false,
			message: 'Внутренняя ошибка сервера',
			error: error.message,
		})
	}
})

module.exports = router
