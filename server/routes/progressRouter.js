const express = require('express')
const router = express.Router()
const UserProgress = require('../models/UserProgress')
const Leaderboard = require('../models/leaderboard')

// Получить прогресс пользователя
router.get('/:userId', async (req, res) => {
	try {
		const progress = await UserProgress.findOne({ userId: req.params.userId })
		res.json(progress || { levels: [] })
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

// Обновить прогресс уровня
router.post('/update', async (req, res) => {
	const { userId, levelId, stars, score } = req.body

	try {
		// Находим или создаем запись прогресса
		let userProgress = await UserProgress.findOne({ userId })
		if (!userProgress) {
			userProgress = new UserProgress({ userId, levels: [] })
		}

		// Обновляем прогресс уровня
		const levelIndex = userProgress.levels.findIndex(l => l.levelId === levelId)
		if (levelIndex === -1) {
			userProgress.levels.push({ levelId, stars, bestScore: score })
		} else if (score > userProgress.levels[levelIndex].bestScore) {
			userProgress.levels[levelIndex].bestScore = score
			userProgress.levels[levelIndex].stars = stars
		}

		// Обновляем общий высший счет
		const newHighestScore = Math.max(score, userProgress.highestScore || 0)
		userProgress.highestScore = newHighestScore

		await userProgress.save()

		// Обновляем таблицу лидеров
		await Leaderboard.findOneAndUpdate(
			{ username: req.body.username },
			{ score: newHighestScore },
			{ upsert: true }
		)

		res.json(userProgress)
	} catch (err) {
		res.status(500).json({ message: err.message })
	}
})

module.exports = router
