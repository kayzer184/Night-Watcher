const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { googleId, username, email, createdAt } = req.body;

    if (!googleId || !username || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Проверяем, существует ли пользователь
    let user = await User.findOne({ googleId });

    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Создаем нового пользователя
    user = await User.create({ googleId, username, email, createdAt });

    res.status(200).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Error during user creation:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

module.exports = router;
