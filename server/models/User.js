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
		validate: {
			validator: function (v) {
				return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
			},
			message: props => `${props.value} is not a valid email address!`,
		},
	},
	achievements: {
		type: Object,
		default: {},
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Убедимся, что модель не была определена ранее
const User = mongoose.models.User || mongoose.model('Users', userSchema, 'Users');

module.exports = User;
