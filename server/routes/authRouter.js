// authRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/google', async (req, res) => {
  const { access_token, username } = req.body;

  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required' });
  }

  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({ message: 'Unauthorized: Invalid access token' });
      } else if (response.status === 403) {
        return res.status(403).json({ message: 'Forbidden: Access denied' });
      } else {
        return res.status(response.status).json({ message: `Error from Google API: ${response.statusText}` });
      }
    }

    const data = await response.json();

    const registerUser = await fetch('https://api-night-watcher.vercel.app/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleId: data.sub,
        username: username,
        email: data.email,
        createdAt: Date.now(),
      }),
    });

    if (!registerUser.ok) {
      if (registerUser.status === 409) {
        return res.status(409).json({ message: 'Conflict: User already exists' });
      } else if (registerUser.status === 500) {
        return res.status(500).json({ message: 'Internal Server Error: Registration failed' });
      } else {
        return res.status(registerUser.status).json({ message: `Error from Registration API: ${registerUser.statusText}` });
      }
    }

    return res.status(200).json({ message: 'User authenticated and registered successfully' });
  } catch (error) {
    if (error.message.includes('Failed to fetch')) {
      return res.status(503).json({ message: 'Service Unavailable: Could not connect to Google API or Registration API' });
    }

    console.error('Unexpected Error:', error);
    return res.status(500).json({ message: 'Internal Server Error: Unexpected failure', error: error.message });
  }
});

module.exports = router;