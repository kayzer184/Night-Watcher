const mongoose = require('mongoose')

// Создаем простую схему
const userSchema = new mongoose.Schema({
	googleId: String,
	username: String,
	email: String,
	achievements: {
		type: Object,
		default: {},
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

// Создаем и экспортируем модель напрямую
const User = mongoose.model('User', userSchema, 'Users')
module.exports = User
