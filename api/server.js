const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://api_backend_user:bNm6rjubtsyEELwh@night-watcher.1nbdj.mongodb.net/Game'; //Store your URI in a variable

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
 process.exit(1);
});

app.use('/leaderboard', leaderboardRoutes);
