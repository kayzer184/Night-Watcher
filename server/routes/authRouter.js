const express = require('express');
const router = express.Router();

// Эндпоинт для получения данных пользователя
router.post('/google', async (req, res) => {
  const { accessToken } = req.body;
  console.log(accessToken)
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Запрос данных пользователя с Google API
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    const data = await response.json();
    console.log(data)
    res.status(200).json({
      message: `User authenticated successfully`,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch user info', error: error.message });
  }
});

module.exports = router;