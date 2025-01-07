const mongoose = require('mongoose')

// Схема пользователя
const userSchema = new mongoose.Schema({
	googleId: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	achievements: {
		type: Object,
		default: {},
	},
})

// Добавляем логирование перед сохранением
userSchema.pre('save', function (next) {
	console.log('Attempting to save user:', {
		googleId: this.googleId,
		username: this.username,
		email: this.email,
		achievements: this.achievements,
	})
	next()
})

const User = mongoose.model('User', userSchema, 'Users')

module.exports = User
