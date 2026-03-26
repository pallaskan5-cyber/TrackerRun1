module.exports = (io) => {
  // Stockage des positions en temps réel
  let userLocations = new Map();

  io.on('connection', (socket) => {
    console.log('Nouvelle connexion WebSocket:', socket.id);

    // Rejoindre une salle spécifique (optionnel)
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`Utilisateur ${socket.id} a rejoint la salle ${room}`);
    });

    // Réception d'une nouvelle position
    socket.on('send-location', (data) => {
      const { userId, lat, lng, timestamp } = data;
      
      // Mettre à jour la position de l'utilisateur
      userLocations.set(userId, {
        userId,
        lat,
        lng,
        timestamp: timestamp || new Date(),
        socketId: socket.id
      });

      // Diffuser à tous les autres clients
      socket.broadcast.emit('location-update', data);
      
      console.log(`Position reçue de ${userId}: ${lat}, ${lng}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      // Retirer l'utilisateur des positions actives
      for (let [userId, location] of userLocations) {
        if (location.socketId === socket.id) {
          userLocations.delete(userId);
          break;
        }
      }
      console.log('Déconnexion WebSocket:', socket.id);
    });
  });

  // Optionnel: Nettoyer périodiquement les anciennes positions
  setInterval(() => {
    const now = new Date();
    for (let [userId, location] of userLocations) {
      const timeDiff = now - new Date(location.timestamp);
      if (timeDiff > 300000) { // 5 minutes
        userLocations.delete(userId);
      }
    }
  }, 60000); // Toutes les minutes
};
