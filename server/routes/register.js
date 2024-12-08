const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { googleId, username, email, createdAt } = req.body;
    const user = await User.create({ googleId, username, email, createdAt });
    res.status(201).json({
      message: 'User created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});