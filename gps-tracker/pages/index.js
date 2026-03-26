<!-- pages/index.js -->
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as firebase from 'firebase/app';
import 'firebase/database';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com/",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialisation Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Configuration Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbG9yNnh5dHQwMDAwM3FxdmFtY25xcmNpIn0.YourAccessTokenHere';

export default function GPSTracker() {
  const [userId, setUserId] = useState('user1');
  const [positions, setPositions] = useState({});
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef({});

  // Initialisation de la carte
  useEffect(() => {
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [2.3522, 48.8566],
      zoom: 13
    });

    // Écouter les mises à jour de positions depuis Firebase
    const positionsRef = firebase.database().ref('positions');
    positionsRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPositions(data);
        updateMarkers(data);
      }
    });

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      positionsRef.off();
    };
  }, [watchId]);

  // Mise à jour des marqueurs sur la carte
  const updateMarkers = (positionsData) => {
    if (!map.current) return;

    Object.keys(positionsData).forEach(id => {
      const pos = positionsData[id];
      if (!markers.current[id]) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = id === userId ? '#ff0000' : '#00ff00';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([pos.lng, pos.lat])
          .addTo(map.current);
        
        markers.current[id] = marker;
      } else {
        markers.current[id].setLngLat([pos.lng, pos.lat]);
      }
    });
  };

  // Démarrer le suivi GPS
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude, timestamp: Date.now() };
        
        // Mettre à jour Firebase
        firebase.database().ref('positions/' + userId).set(newPos);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir la position: ' + error.message);
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

  // Arrêter le suivi GPS
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
        <title>Tracker GPS Temps Réel</title>
        <meta name="description" content="Application de tracking GPS en temps réel" />
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css" rel="stylesheet" />
        <style>{`
          .marker {
            display: block;
            border-radius: 50%;
            cursor: pointer;
            padding: 0;
            transform: translate(-50%, -50%);
            z-index: 100;
          }
          #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
          }
          .controls {
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
            max-width: 300px;
          }
          .btn {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px 0;
            width: 100%;
          }
          .btn:hover {
            background: #4338ca;
          }
          .btn:disabled {
            background: #6b7280;
            cursor: not-allowed;
          }
          .status {
            margin-top: 10px;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
          }
          .tracking {
            background: rgba(34, 197, 94, 0.2);
            color: #bbf7d0;
          }
          .not-tracking {
            background: rgba(239, 68, 68, 0.2);
            color: #fecaca;
          }
        `}</style>
      </Head>

      <main className="relative w-full h-screen">
        <div ref={mapContainer} id="map" className="absolute inset-0" />
        
        <div className="controls">
          <h1 className="text-xl font-bold mb-4">Tracker GPS Temps Réel</h1>
          
          <div className="mb-4">
            <label className="block mb-2">ID Utilisateur:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              placeholder="Entrez votre ID"
            />
          </div>
          
          <button 
            onClick={isTracking ? stopTracking : startTracking}
            className="btn"
            disabled={!userId}
          >
            {isTracking ? 'Arrêter le suivi' : 'Démarrer le suivi'}
          </button>
          
          <div className={`status ${isTracking ? 'tracking' : 'not-tracking'} mt-4`}>
            <strong>Status:</strong> {isTracking ? 'Suivi activé' : 'Suivi désactivé'}
          </div>
          
          <div className="mt-4 text-sm text-gray-300">
            <p>Positions actives: {Object.keys(positions).length}</p>
            <p>Précision: Haute</p>
          </div>
        </div>
      </main>
    </div>
  );
}
