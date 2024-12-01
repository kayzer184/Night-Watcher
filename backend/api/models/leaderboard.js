// models/leaderboard.js
const mongoose = require('mongoose');

// Модель для таблицы лидеров
const LeaderboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
});

const Leaderboard = mongoose.model('Leaderboard', LeaderboardSchema, 'LeaderBoard');

module.exports = Leaderboard;