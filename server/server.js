const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const leaderboardRoutes = require('./routes/leaderboard')
const registerRouter = require('./routes/register')
const authRouter = require('./routes/authRouter')

const app = express()

app.use(
	cors({
		origin: ['https://night-watcher.vercel.app'],
		methods: ['GET', 'POST', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
)

app.use(express.json())

// MongoDB URI
const mongoURI =
	'mongodb+srv://api_backend_user:bNm6rjubtsyEELwh@night-watcher.1nbdj.mongodb.net/Game'

// Подключение к MongoDB
mongoose
	.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB connected')
		app.use('/auth', authRouter)
    app.use('/getLeaderBoard', leaderboardRoutes)
    app.use('/register', registerRouter)
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
