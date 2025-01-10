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

		console.log(
			'[Debug] Current achievements:',
			JSON.stringify(user.achievements)
		)

		const formattedAchievements = {}
		Object.entries(achievements).forEach(([key, value]) => {
			formattedAchievements[parseInt(key)] = value === true
		})

		const updateQuery = {
			$set: {
				[`achievements.${levelId}`]: formattedAchievements,
			},
		}

		console.log('[Debug] Update query:', JSON.stringify(updateQuery))

		const updatedUser = await User.findByIdAndUpdate(userId, updateQuery, {
			new: true,
		})

		if (!updatedUser) {
			throw new Error('Failed to update user achievements')
		}

		console.log(
			'[Debug] Updated user achievements:',
			JSON.stringify(updatedUser.achievements)
		)

		let totalStars = 0
		const achievementsObj = updatedUser.achievements.toObject()

		Object.keys(achievementsObj)
			.filter(key => !isNaN(key))
			.forEach(level => {
				const levelAchievements = achievementsObj[level]
				const starsInLevel = Object.values(levelAchievements).filter(
					v => v === true
				).length
				console.log(`[Debug] Stars in level ${level}:`, starsInLevel)
				totalStars += starsInLevel
			})

		console.log('[Debug] Total stars calculated:', totalStars)

		console.log('[Debug] Achievement structure:', {
			hasAchievements: !!updatedUser.achievements,
			levels: Object.keys(updatedUser.achievements),
			currentLevel: updatedUser.achievements[levelId],
		})

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
			updatedUser: updatedUser.toObject(),
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
