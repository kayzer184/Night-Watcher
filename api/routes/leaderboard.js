// routes/leaderboard.js
const express = require('express');
const Leaderboard = require('../models/leaderboard');
const router = express.Router();

// Получить все данные из коллекции leaderboard и отсортировать по убыванию score
router.get('/', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ score: -1 });  // -1 для убывания
    res.json(leaderboard);  // Отправляем данные в формате JSON
  } catch (err) {
    console.error("Error fetching leaderboard:", err);  // Логируем ошибку
    res.status(500).json({ message: err.message });  // Возвращаем ошибку, если запрос не удался
  }
});

module.exports = router;