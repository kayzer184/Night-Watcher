// models/leaderboard.js
const mongoose = require('mongoose')

// Модель для таблицы лидеров
const LeaderboardSchema = new mongoose.Schema({
	username: { type: String, required: true },
	stars: { type: Number, required: true, default: 0 }, // Общее количество звезд
	lastUpdated: { type: Date, default: Date.now }, // Для отслеживания последнего обновления
})

const Leaderboard = mongoose.model(
	'Leaderboard',
	LeaderboardSchema,
	'LeaderBoard'
)

module.exports = Leaderboard
