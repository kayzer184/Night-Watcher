const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/update', async (req, res) => {
    try {
        const { userId, levelId, achievements} = req.body

        // Обновляем прогресс пользователя
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Пользователь не найден' 
            })
        }

        if (!user.achievements[levelId]) {
          user.achievements[levelId] = {}
        }

        // Обновляем достижения только если новый результат лучше
        if (!user.achievements[levelId] || 
          Object.keys(achievements).length > Object.keys(user.achievements[levelId]).length) {
          user.achievements[levelId] = achievements
          await user.save()
          res.json({
              success: true,
              message: 'Прогресс успешно обновлен',
              updatedUser: user
          })  
        } else {
            return res.status(400).json({
                success: true,
                message: 'Текущий результат хуже, чем ваш лучший результат'
            })
        }
    } catch (error) {
        console.error('Ошибка при обновлении прогресса:', error)
        res.status(500).json({
            success: false,
            message: 'Внутренняя ошибка сервера'
        })
    }
})

module.exports = router
