'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { io, Socket } from 'socket.io-client';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp?: string;
}

interface JobTrackingMapProps {
  jobId: string;
  pickUpLocation?: string;
  dropOffLocation?: string;
  initialLat?: number;
  initialLng?: number;
}

export function JobTrackingMap({
  jobId,
  pickUpLocation,
  dropOffLocation,
  initialLat = -1.2921,
  initialLng = 36.8219,
}: JobTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const routeRef = useRef<LocationUpdate[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [locationCount, setLocationCount] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on Nairobi by default
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLng, initialLat],
      zoom: 11,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      // Add route line source
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [] },
        },
      });

      // Route line layer
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
          'line-opacity': 0.7,
          'line-dasharray': [2, 1],
        },
      });
    });

    // Driver marker (orange truck color)
    const el = document.createElement('div');
    el.style.cssText = `
      width: 40px; height: 40px;
      background: #f97316;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    `;

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([initialLng, initialLat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Driver location'))
      .addTo(map);

    markerRef.current = marker;

    // Connect to WebSocket
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('watch-job', jobId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('location', (data: LocationUpdate) => {
      const { lat, lng, timestamp } = data;

      // Update marker position
      marker.setLngLat([lng, lat]);

      // Fly to new position smoothly
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 13),
        speed: 0.8,
        curve: 1,
      });

      // Add to route history
      routeRef.current.push({ lat, lng });

      // Update route line
      const source = map.getSource('route') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeRef.current.map(p => [p.lng, p.lat]),
          },
        });
      }

      setLastUpdate(timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString());
      setLocationCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
      map.remove();
    };
  }, [jobId, initialLat, initialLng]);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-md">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-gray-600 font-medium">
            {isConnected ? 'Live tracking' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {lastUpdate && <span>Last update: {lastUpdate}</span>}
          {locationCount > 0 && <span>{locationCount} pings</span>}
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '420px' }} />

      {/* Location labels */}
      {(pickUpLocation || dropOffLocation) && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-600">
          {pickUpLocation && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>From: {pickUpLocation}</span>
            </div>
          )}
          {dropOffLocation && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>To: {dropOffLocation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}