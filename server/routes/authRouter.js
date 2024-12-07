const express = require('express');
const router = express.Router();

// Эндпоинт для получения данных пользователя
router.post('/google', async (req, res) => {
  const { access_token } = req.body;
  console.log('Access token received:', access_token);
  
  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required' });
  }

  try {
    // Запрос данных пользователя с Google API
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

    // Если ответ не успешный (не статус 200), возвращаем ошибку
    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('User data from Google API:', data);
    
    // Возвращаем данные пользователя
    res.status(200).json({
      message: 'User authenticated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Error fetching user info:', error.message || error);
    res.status(500).json({ message: 'Failed to fetch user info', error: error.message });
  }
});

module.exports = router;