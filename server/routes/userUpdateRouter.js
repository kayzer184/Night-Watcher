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

		let totalStars = 0
		Object.values(updatedUser.achievements).forEach(levelAchievements => {
			totalStars += Object.values(levelAchievements).filter(
				v => v === true
			).length
		})

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
			updatedUser,
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
