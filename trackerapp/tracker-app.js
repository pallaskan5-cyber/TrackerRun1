// tracker-app.js — Serveur + Client combiné dans un seul fichier (monolithique)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Configuration
const PORT = process.env.PORT || 8000;
const SECRET_KEY = 'mysecretkey';
const TRACK_INTERVAL_MS = 5000; // Envoi toutes les 5s max

// App setup
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIo(server);

// Utilisateurs simulés
const users = {
  admin: { password: 'admin', role: 'admin' },
  user1: { password: 'pass1', role: 'user' }
};

// Positions actuelles
let positions = {};

// Middleware d'auth JWT
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).send("Accès refusé");
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).send("Token invalide");
    req.user = decoded;
    next();
  });
}

// Routes API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }
  const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true }).json({ success: true, role: user.role });
});

app.get('/history/:userId', authenticateToken, (req, res) => {
  // Simuler historique
  const history = [
    { lat: 48.8566, lng: 2.3522, timestamp: Date.now() - 60000 },
    { lat: 48.8576, lng: 2.3532, timestamp: Date.now() - 30000 }
  ];
  res.json(history);
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`Utilisateur connecté : ${socket.id}`);

  socket.on('join-room', ({ userId }) => {
    socket.userId = userId;
    socket.join(userId); // Join room spécifique à l'utilisateur
  });

  socket.on('update-position', (data) => {
    const { userId, coords } = data;
    positions[userId] = coords;

    // Broadcast aux autres clients sauf soi-même
    socket.broadcast.emit('position-update', { userId, coords });
  });

  socket.on('disconnect', () => {
    console.log(`Déconnexion de ${socket.id}`);
    delete positions[socket.userId];
  });
});

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Démarrer serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
