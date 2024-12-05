const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// Middleware
app.use(cors({ 
    origin: 'https://api-night-watcher.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'] 
}));
app.use(express.json());

// MongoDB URI
const mongoURI = 'mongodb+srv://api_backend_user:bNm6rjubtsyEELwh@night-watcher.1nbdj.mongodb.net/Game';

// Подключение к MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Роут для таблицы лидеров
app.use('/getLeaderBoard', leaderboardRoutes);

// Обработчик корневого маршрута
app.get('/', (req, res) => {
  res.send('Welcome to the Leaderboard API');
});

// Экспорт обработчика
module.exports = app;