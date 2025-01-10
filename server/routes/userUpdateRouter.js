const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Leaderboard = require('../models/leaderboard')

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

		// Подсчитываем количество true в текущих достижениях уровня
		const currentLevelAchievements = user.achievements[levelId] || {}
		const currentTrueCount = Object.values(currentLevelAchievements).filter(
			v => v === true
		).length

		// Подсчитываем количество true в новых достижениях
		const newTrueCount = Object.values(achievements).filter(
			v => v === true
		).length

		console.log(
			`[Progress] Level: ${levelId}, Current true: ${currentTrueCount}, New true: ${newTrueCount}`
		)

		// Обновляем только если новый результат ЛУЧШЕ или РАВЕН текущему
		if (newTrueCount < currentTrueCount) {
			console.log('[Skip] Current result is better:', {
				currentStars: currentTrueCount,
				newStars: newTrueCount,
			})

			// Подсчитываем общее количество звезд для текущего состояния
			let totalStars = 0
			const rawAchievements = JSON.parse(JSON.stringify(user.achievements))

			for (const level in rawAchievements) {
				if (rawAchievements.hasOwnProperty(level) && !isNaN(level)) {
					const levelAchievements = rawAchievements[level]
					const starsInLevel = Object.values(levelAchievements).filter(
						v => v === true
					).length
					console.log(`[Debug] Level ${level} current stars:`, starsInLevel)
					totalStars += starsInLevel
				}
			}

			return res.json({
				success: true,
				message: 'Текущий результат лучше нового',
				updatedUser: JSON.parse(JSON.stringify(user)),
				totalStars,
			})
		}

		const formattedAchievements = {}
		Object.entries(achievements).forEach(([key, value]) => {
			formattedAchievements[parseInt(key)] = value === true
		})

		const updateQuery = {
			$set: {
				[`achievements.${levelId}`]: formattedAchievements,
			},
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
			new: true,
		})

		if (!updatedUser) {
			throw new Error('Failed to update user achievements')
		}

		// Подсчет общего количества звезд
		let totalStars = 0
		const rawAchievements = JSON.parse(JSON.stringify(updatedUser.achievements))

		console.log('[Debug] Raw achievements:', rawAchievements)

		for (const level in rawAchievements) {
			if (rawAchievements.hasOwnProperty(level) && !isNaN(level)) {
				const levelAchievements = rawAchievements[level]
				const starsInLevel = Object.values(levelAchievements).filter(
					v => v === true
				).length
				console.log(`[Debug] Level ${level} stars:`, starsInLevel)
				totalStars += starsInLevel
			}
		}

		console.log('[Debug] Total stars calculated:', totalStars)

		const leaderboardUpdate = await Leaderboard.findOneAndUpdate(
			{ username: updatedUser.username },
			{
				username: updatedUser.username,
				stars: totalStars,
				lastUpdated: new Date(),
			},
			{
				upsert: true,
				new: true,
				runValidators: true,
			}
		)

		console.log('[Success] Updated leaderboard:', {
			username: updatedUser.username,
			stars: totalStars,
			leaderboardId: leaderboardUpdate._id,
		})

		return res.json({
			success: true,
			message: 'Прогресс успешно обновлен',
			updatedUser: JSON.parse(JSON.stringify(updatedUser)),
			totalStars,
		})
	} catch (error) {
		console.error('[Error] Update failed:', error)
		return res.status(500).json({
			success: false,
			message: 'Ошибка при обновлении достижений',
			error: error.message,
		})
	}
})

module.exports = router
