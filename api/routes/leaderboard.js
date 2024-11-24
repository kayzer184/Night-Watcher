const express = require('express');
const Leaderboard = require('../models/leaderboard');
const router = express.Router();

router.get('/', async (req, res) => {
 try {
  const leaderboard = await Leaderboard.find().sort({ rank: 1 });
  console.log("Leaderboard data:", leaderboard) // Added logging
  res.json(leaderboard);
 } catch (err) {
  console.error("Error fetching leaderboard:", err); // Added error logging
  res.status(500).json({ message: err.message });
 }
});

module.exports = router;
