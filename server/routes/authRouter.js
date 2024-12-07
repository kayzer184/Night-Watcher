const express = require('express');
const router = express.Router();

// Эндпоинт для получения данных пользователя
router.post('/google', async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  try {
    // Запрос данных пользователя с Google API
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);

    //const { sub: googleId, name, email, picture } = response.data;

    res.status(200).json({
      message: `User authenticated successfully`,
      response: response
      //user: { googleId, name, email, picture },
    });
  } catch (error) {
    console.error('Error fetching user info:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch user info', error: error.message });
  }
});

module.exports = router;