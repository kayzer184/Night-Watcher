// api/models/leaderboard.js
const mongoose = require('mongoose');

// Схема для таблицы лидеров
const LeaderboardSchema = new mongoose.Schema({
  rank: { type: Number, required: true },
  username: { type: String, required: true },
  score: { type: Number, required: true }
});

// Модель для работы с коллекцией
const Leaderboard = mongoose.model('LeaderBoard', LeaderboardSchema);

module.exports = Leaderboard;
