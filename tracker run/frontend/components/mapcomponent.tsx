import React, { useEffect, useState } from 'react';
import MapGL, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Location {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

export default function MapComponent() {
  const [viewport, setViewport] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 12,
  });

  const [positions, setPositions] = useState<Location[]>([]);

  useEffect(() => {
    // Simuler des données de test
    const testData: Location[] = [
      { userId: 'user1', lat: 48.8566, lng: 2.3522, timestamp: new Date().toISOString() },
      { userId: 'user2', lat: 48.8606, lng: 2.3376, timestamp: new Date().toISOString() }
    ];
    setPositions(testData);

    // Dans une vraie application, vous connecteriez le WebSocket ici
    /*
    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPositions(prev => [...prev, data]);
    };
    */
  }, []);

  return (
    <div className="h-screen w-full">
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={setViewport}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {positions.map((pos, index) => (
          <Marker 
            key={`${pos.userId}-${index}`} 
            latitude={pos.lat} 
            longitude={pos.lng}
          >
            <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">📍</span>
            </div>
          </Marker>
        ))}
      </MapGL>
    </div>
  );
}
