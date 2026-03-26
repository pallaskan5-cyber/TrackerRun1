const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gps_tracker_db')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tracking', require('./src/routes/tracking'));

// WebSockets
require('./src/sockets')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
