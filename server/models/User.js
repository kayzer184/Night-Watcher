const mongoose = require('mongoose')

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

module.exports = mongoose.model('User', userSchema, 'Users')
