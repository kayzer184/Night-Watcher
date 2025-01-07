const mongoose = require('mongoose')

// Создаем простую схему без лишних валидаций
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

// Добавляем логирование всех операций
userSchema.pre('save', function (next) {
	console.log('Before save:', {
		_id: this._id,
		googleId: this.googleId,
		username: this.username,
		email: this.email,
	})
	next()
})

userSchema.post('save', function (doc) {
	console.log('After save:', {
		_id: doc._id,
		googleId: doc.googleId,
		username: doc.username,
		email: doc.email,
	})
})

// Обработка ошибок
userSchema.post('save', function (error, doc, next) {
	if (error.name === 'MongoServerError') {
		console.log('MongoDB Error:', {
			code: error.code,
			message: error.message,
			keyPattern: error.keyPattern,
		})
	}
	next(error)
})

// Создаем модель
const User = mongoose.model('User', userSchema, 'Users')

// Экспортируем модель и функцию создания пользователя
module.exports = {
	User,
	// Вспомогательная функция для создания пользователя
	async createUser(userData) {
		try {
			console.log('Creating user with:', userData)

			// Проверяем существующего пользователя
			const existingUser = await User.findOne({
				$or: [{ googleId: userData.googleId }, { email: userData.email }],
			})

			if (existingUser) {
				console.log('User exists:', existingUser)
				return {
					success: true,
					user: existingUser,
					isNew: false,
				}
			}

			// Создаем нового пользователя
			const user = new User(userData)
			await user.save()

			console.log('User created:', user)
			return {
				success: true,
				user,
				isNew: true,
			}
		} catch (error) {
			console.error('Create user error:', error)
			return {
				success: false,
				error,
			}
		}
	},
}
