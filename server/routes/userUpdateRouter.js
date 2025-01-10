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
			user.achievements = {}
		}

		const currentLevelAchievements = user.achievements[levelId] || {}

		const currentTrueCount = Object.values(currentLevelAchievements).filter(
			v => v === true
		).length
		const newTrueCount = Object.values(achievements).filter(
			v => v === true
		).length

		console.log(
			`[Progress] Level: ${levelId}, Current true: ${currentTrueCount}, New true: ${newTrueCount}`
		)

		if (newTrueCount > currentTrueCount) {
			try {
				const result = await User.updateOne(
					{ _id: userId },
					{
						$set: {
							[`achievements.${levelId}`]: achievements,
						},
					}
				)

				if (result.modifiedCount === 1) {
					const updatedUser = await User.findById(userId)
					console.log(
						`[Success] Updated achievements for user ${userId}. New state:`,
						JSON.stringify(updatedUser.achievements)
					)

					return res.json({
						success: true,
						message: 'Прогресс успешно обновлен',
						updatedUser: updatedUser,
					})
				} else {
					throw new Error('Failed to update achievements')
				}
			} catch (updateError) {
				console.error(`[Error] Failed to update achievements:`, updateError)
				return res.status(500).json({
					success: false,
					message: 'Ошибка при обновлении достижений',
				})
			}
		} else {
			console.log(
				`[Rejected] No progress improvement. User: ${userId}, Level: ${levelId}`
			)
			console.log(
				`[Details] Current achievements: ${JSON.stringify(
					currentLevelAchievements
				)}`
			)
			console.log(`[Details] New achievements: ${JSON.stringify(achievements)}`)
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
