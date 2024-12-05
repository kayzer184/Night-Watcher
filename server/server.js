// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const mongoURI = process.env.MONGODB_URI;

// Подключение к MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Завершаем приложение, если подключение не удалось
  });

// Роут для таблицы лидеров
app.use('/getLeaderBoard', leaderboardRoutes);

// Обработчик корневого маршрута
app.get('/', (req, res) => {
  res.send('Welcome to the Leaderboard API');
});
