const mongoose = require('mongoose')

// Схема пользователя
const userSchema = new mongoose.Schema(
	{
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			auto: true,
		},
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
		achievements: {
			type: Object,
			default: {},
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		__v: {
			type: Number,
			default: 0,
		},
	},
	{
		collection: 'Users',
		versionKey: '__v',
	}
)

// Добавляем индексы в соответствии с существующей структурой
userSchema.index({ googleId: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

const User = mongoose.model('User', userSchema)

module.exports = User
