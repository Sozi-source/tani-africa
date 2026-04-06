// components/job/JobTrackingMap.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { io, Socket } from 'socket.io-client';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Truck, MapPin, Navigation, Clock, Zap, CheckCircle, AlertCircle, Maximize2, Minimize2, Star } from 'lucide-react';

// No API key needed! Just use the OpenFreeMap style URL
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'; // Free, no token

interface LocationUpdate {
  lat: number;
  lng: number;
  timestamp: string;
}

interface JobTrackingMapProps {
  jobId: string;
  pickUpLocation?: { lat: number; lng: number; address: string };
  dropOffLocation?: { lat: number; lng: number; address: string };
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  estimatedArrival?: string;
}

export function JobTrackingMap({
  jobId,
  pickUpLocation,
  dropOffLocation,
  driverName,
  driverPhone,
  driverRating,
}: JobTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const routeRef = useRef<LocationUpdate[]>([]);
  const pickupMarkerRef = useRef<maplibregl.Marker | null>(null);
  const dropoffMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [locationCount, setLocationCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  const estimateArrival = (distance: number): string => {
    const avgSpeed = 40;
    const minutes = (distance / avgSpeed) * 60;
    const arrivalTime = new Date(Date.now() + minutes * 60000);
    return arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const center = currentLocation 
      ? [currentLocation.lng, currentLocation.lat]
      : pickUpLocation 
        ? [pickUpLocation.lng, pickUpLocation.lat]
        : [36.8219, -1.2921];

    // Initialize map with OpenFreeMap style - NO API KEY NEEDED!
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,  // Free, no token required
      center: center as [number, number],
      zoom: 12,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

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

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f97316',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });

      // Add pickup marker
      if (pickUpLocation) {
        const pickupEl = document.createElement('div');
        pickupEl.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
              Pickup
            </div>
          </div>
        `;
        pickupMarkerRef.current = new maplibregl.Marker({ element: pickupEl, anchor: 'bottom' })
          .setLngLat([pickUpLocation.lng, pickUpLocation.lat])
          .addTo(map);
      }

      // Add dropoff marker
      if (dropOffLocation) {
        const dropoffEl = document.createElement('div');
        dropoffEl.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
              Dropoff
            </div>
          </div>
        `;
        dropoffMarkerRef.current = new maplibregl.Marker({ element: dropoffEl, anchor: 'bottom' })
          .setLngLat([dropOffLocation.lng, dropOffLocation.lat])
          .addTo(map);
      }
    });

    // Create driver marker
    const driverEl = document.createElement('div');
    driverEl.innerHTML = `
      <div class="relative animate-pulse">
        <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white transform -rotate-45">
          <svg class="w-6 h-6 text-white transform rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-2 py-1 rounded">
          Driver
        </div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: driverEl, anchor: 'bottom' })
      .setLngLat(center as [number, number])
      .addTo(map);

    markerRef.current = marker;

    // WebSocket connection (same as before)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('watch-job', jobId);
      setError(null);
    });

    socket.on('connect_error', (err: Error) => {
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('location', (data: LocationUpdate) => {
      const { lat, lng, timestamp } = data;
      if (!lat || !lng) return;

      setCurrentLocation({ lat, lng });
      marker.setLngLat([lng, lat]);

      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 13),
        speed: 0.8,
        curve: 1,
        essential: true,
      });

      routeRef.current.push({ lat, lng, timestamp });
      if (routeRef.current.length > 200) routeRef.current.shift();

      if (map.getSource('route')) {
        const source = map.getSource('route') as maplibregl.GeoJSONSource;
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
      }

      if (dropOffLocation) {
        const distance = calculateDistance(lat, lng, dropOffLocation.lat, dropOffLocation.lng);
        setDistanceToDestination(distance);
      }

      setLastUpdate(timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString());
      setLocationCount(prev => prev + 1);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('unwatch-job', jobId);
        socketRef.current.disconnect();
      }
      if (mapRef.current) mapRef.current.remove();
    };
  }, [jobId, pickUpLocation, dropOffLocation]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      mapContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? 'Live Tracking' : 'Reconnecting...'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">Last update: {lastUpdate}</span>
          )}
        </div>
        <button onClick={toggleFullscreen} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />

      {/* Driver Info Card */}
      {(driverName || driverPhone || driverRating) && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{driverName || 'Driver'}</p>
              {driverRating && (
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600">{driverRating}</span>
                </div>
              )}
              {driverPhone && <p className="text-xs text-gray-500">{driverPhone}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Trip Info Card */}
      <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          {pickUpLocation && (
            <div className="flex items-start gap-2">
              <div className="mt-0.5"><div className="w-2 h-2 bg-green-500 rounded-full" /></div>
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm font-medium text-gray-900 truncate">{pickUpLocation.address}</p>
              </div>
            </div>
          )}
          {dropOffLocation && (
            <div className="flex items-start gap-2">
              <div className="mt-0.5"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>
              <div>
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="text-sm font-medium text-gray-900 truncate">{dropOffLocation.address}</p>
              </div>
            </div>
          )}
        </div>

        {distanceToDestination !== null && dropOffLocation && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Distance to destination</span>
              <span className="text-sm font-semibold text-gray-900">{formatDistance(distanceToDestination)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.max(0, 100 - (distanceToDestination / 10) * 100)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>ETA: {estimateArrival(distanceToDestination)}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Zap className="h-3 w-3" />
                <span>On schedule</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Navigation className="h-3 w-3" />
            <span>{locationCount} location updates</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Live tracking active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute top-4 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}