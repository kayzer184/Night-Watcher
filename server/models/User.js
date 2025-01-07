const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
	{
		googleId: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		achievements: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: new Map(),
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		collection: 'Users',
		strict: true,
		versionKey: false, // Отключаем поле __v
	}
)

// Добавляем индексы
userSchema.index({ googleId: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

const User = mongoose.model('User', userSchema)

// Убедимся, что индексы созданы
User.createIndexes().catch(console.error)

module.exports = User
