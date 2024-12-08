const express = require('express');
const router = express.Router();

router.post('/google', async (req, res) => {
  const { access_token, username } = req.body;
  
  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required' });
  }

  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }
    const data = await response.json();
    
    const registerUser = await fetch('https://api-night-watcher.vercel.app/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ googleId: data.sub, username: username, email: data.email, createdAt: Date.now() }),
    });
    if (!registerUser.ok) {
      throw new Error(`Registration failed with status ${registerUser.status}`);
    }
    res.status(200).json({
      message: 'User authenticated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user info', error: error.message });
  }
});

module.exports = router;