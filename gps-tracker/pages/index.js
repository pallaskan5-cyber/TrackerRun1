// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function GPSTracker() {
  const [userId, setUserId] = useState('user1');
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  
  // Initialisation de Mapbox (seulement côté client)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('mapbox-gl').then((mapboxgl) => {
        mapboxgl.default.accessToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbG9yNnh5dHQwMDAwM3FxdmFtY25xcmNpIn0.YourAccessTokenHere';
        
        const map = new mapboxgl.default.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [2.3522, 48.8566],
          zoom: 13
        });
        
        // Stocker la référence de la carte
        window.gpsMap = map;
      });
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Position:', latitude, longitude);
        
        // Ici vous enverrez à Firebase
        // Pour l'instant on affiche dans la console
      },
      (error) => {
        console.error('Erreur:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Tracker GPS</title>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css" rel="stylesheet" />
      </Head>

      <div id="map" className="w-full h-screen" />
      
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 p-4 rounded-lg">
        <h1 className="text-xl font-bold mb-2">GPS Tracker</h1>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
          placeholder="User ID"
        />
        <button 
          onClick={isTracking ? stopTracking : startTracking}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          {isTracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
    </div>
  );
}
