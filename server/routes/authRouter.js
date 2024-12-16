const express = require('express');
const router = express.Router();

router.post('/google', async (req, res) => {
  const { access_token, username } = req.body;

  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required' });
  }
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    // Запрос к Google API
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

    if (!googleResponse.ok) {
      const errorMessage = `Error from Google API: ${googleResponse.statusText}`;
      return res.status(googleResponse.status).json({ message: errorMessage });
    }

    const googleData = await googleResponse.json();

    // Регистрация пользователя в вашем сервисе
    const registerResponse = await fetch('https://api-night-watcher.vercel.app/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleId: googleData.sub,
        username: username,
        email: googleData.email,
        createdAt: Date.now(),
      }),
    });

    if (!registerResponse.ok) {
      const errorMessage = `Error from Registration API: ${registerResponse.statusText}`;
      return res.status(registerResponse.status).json({ message: errorMessage });
    }

    return res.status(200).json({ message: 'User authenticated and registered successfully' });
  } catch (error) {
    const isFetchError = error.message.includes('Failed to fetch');
    const errorMessage = isFetchError
      ? 'Service Unavailable: Could not connect to external services'
      : 'Internal Server Error: Unexpected failure';

    console.error('Unexpected Error:', error);
    return res.status(isFetchError ? 503 : 500).json({ message: errorMessage, error: error.message });
  }
});

module.exports = router;
