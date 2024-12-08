const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { googleId, username, email, createdAt } = req.body;

    // Проверка на существование пользователя с таким googleId
    let user = await User.findOne({ googleId });

    if (user) {
      res.status(409).json({ message: 'User already exists' });
    }

    user = await User.create({ googleId, username, email, createdAt });

    res.status(200).json({
      message: user ? 'User created or updated successfully' : 'Error',
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;