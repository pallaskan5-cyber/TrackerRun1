const express = require('express');
const router = express.Router();

// Stockage temporaire en mémoire (à remplacer par MongoDB en production)
let locations = [];

// Mise à jour de position
router.post('/update-position', (req, res) => {
  const { userId, lat, lng, timestamp } = req.body;
  
  const location = {
    userId,
    lat,
    lng,
    timestamp: timestamp || new Date()
  };
  
  locations.push(location);
  
  // Garder seulement les dernières 1000 positions
  if (locations.length > 1000) {
    locations = locations.slice(-1000);
  }
  
  res.status(200).json({ message: 'Position mise à jour' });
});

// Historique des positions
router.get('/history/:userId', (req, res) => {
  const userId = req.params.userId;
  const userLocations = locations.filter(loc => loc.userId === userId);
  res.json(userLocations);
});

// Positions récentes de tous les utilisateurs
router.get('/recent', (req, res) => {
  const recentLocations = locations.slice(-100); // Dernières 100 positions
  res.json(recentLocations);
});

module.exports = router;
