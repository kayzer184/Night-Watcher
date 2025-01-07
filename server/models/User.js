const mongoose = require('mongoose')

// Схема пользователя
const userSchema = new mongoose.Schema({
	googleId: {
		type: String,
		required: [true, 'Google ID is required'],
		unique: true,
		trim: true,
		validate: {
			validator: function (v) {
				return v && v.length > 0
			},
			message: 'Google ID cannot be empty',
		},
	},
	username: {
		type: String,
		required: [true, 'Username is required'],
		trim: true,
		minlength: [2, 'Username must be at least 2 characters long'],
		validate: {
			validator: function (v) {
				return v && v.length >= 2
			},
			message: 'Invalid username format',
		},
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		trim: true,
		lowercase: true,
		validate: {
			validator: function (v) {
				return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(v)
			},
			message: props => `${props.value} is not a valid email address!`,
		},
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true,
	},
	achievements: {
		type: Object,
		default: {},
		required: true,
	},
})

// Добавляем подробное логирование
userSchema.pre('validate', function (next) {
	console.log('Pre-validation data:', {
		googleId: this.googleId,
		username: this.username,
		email: this.email,
		hasAchievements: !!this.achievements,
		createdAt: this.createdAt,
	})
	next()
})

userSchema.pre('save', function (next) {
	console.log('Pre-save data:', {
		googleId: this.googleId,
		username: this.username,
		email: this.email,
		hasAchievements: !!this.achievements,
		createdAt: this.createdAt,
	})
	next()
})

const User = mongoose.model('User', userSchema, 'Users')

module.exports = User
