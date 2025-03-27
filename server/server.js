require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const leaderboardRoutes = require('./routes/leaderboard')
const authRouter = require('./routes/authRouter')
const userExistRouter = require('./routes/userExist')
const getUserRouter = require('./routes/getUser')
const userUpdateRouter = require('./routes/userUpdateRouter')

const app = express()

// Применяем защитные заголовки
app.use(helmet())

// CORS настройки
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'https://night-watcher.vercel.app')
	res.header('Access-Control-Allow-Credentials', 'true')
	res.header(
		'Access-Control-Allow-Methods',
		'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
	)
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, Origin, Accept'
	)
	next()
})

app.use(express.json({ limit: '96kb' }))

const writeLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 50, 
	standardHeaders: true,
	message: 'Слишком много запросов на изменение данных'
})

const registerLimiter = rateLimit({
	windowMs: 12* 60 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	message: 'Слишком много попыток регистрации'
})

const getLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	message: 'Слишком много запросов на чтение данных',
})

app.use(getLimiter)

// MongoDB URI
const mongoURI = process.env.MONGO_URI

// Подключаем роуты
app.use('/auth', authRouter)
app.use('/userExist', userExistRouter)
app.use('/getLeaderBoard', leaderboardRoutes)
app.use('/getUser', getUserRouter)
app.use('/update', userUpdateRouter)

app.use('/update', writeLimiter)
app.use('/auth/', registerLimiter)
app.use('/getLeaderBoard', getLimiter)
app.use('/getUser', getLimiter)
app.use('/userExist', getLimiter)

// Подключение к MongoDB
mongoose
	.connect(mongoURI)
	.then(() => {
		console.log('MongoDB connected')
	})
	.catch(err => {
		console.error('MongoDB connection error:', err)
		process.exit(1)
	})

app.options('*', cors())

app.get('/', (req, res) => {
	res.send('Welcome to the Night-Watcher API')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

module.exports = app
