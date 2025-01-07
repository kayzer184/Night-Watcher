const mongoose = require('mongoose')

const levelProgressSchema = new mongoose.Schema({
	levelId: { type: Number, required: true },
	stars: { type: Number, required: true, min: 0, max: 3 },
	bestScore: { type: Number, required: true, default: 0 },
})

const userProgressSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	levels: [levelProgressSchema],
	highestScore: { type: Number, default: 0 },
})

const UserProgress = mongoose.model('UserProgress', userProgressSchema)

module.exports = UserProgress
