const mongoose = require('mongoose');

// Схема пользователя
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,  // Уникальность googleId
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Уникальность email
    validate: {
      validator: function (v) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v); // Простая проверка email
      },
      message: props => `${props.value} is not a valid email address!`,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Создание модели пользователя
const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;