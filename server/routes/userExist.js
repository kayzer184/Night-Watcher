const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/', async (req, res) => {
    try {
        const { access_token } = req.body
        
        const googleResponse = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
    
        if (!googleResponse.ok) {
          return res.status(400).json({ message: 'Invalid access token' })
        }
    
        const googleData = await googleResponse.json()
    
        if (!googleData.sub || !googleData.email) {
          return res.status(400).json({ message: 'Invalid Google response' })
        }
    
        let existingUser = await User.findOne({ googleId: googleData.sub })
        
        res.json({ exists: !!existingUser })
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при проверке пользователя' })
    }
})

module.exports = router
