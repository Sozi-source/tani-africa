'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { io, Socket } from 'socket.io-client';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Truck, Navigation, Clock, Zap, CheckCircle,
  AlertCircle, Maximize2, Minimize2, Star, WifiOff,
} from 'lucide-react';

// Use a more reliable map style that doesn't have missing icon issues
const MAP_STYLE = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{
    id: 'osm',
    type: 'raster',
    source: 'osm',
  }],
};

// Strip /api/v1 (or any path) so socket connects to the bare origin.
function getSocketBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    return new URL(apiUrl).origin;
  } catch {
    return apiUrl;
  }
}

// Null-safe coordinate guard
const isValidCoord = (v: unknown): v is number =>
  typeof v === 'number' && isFinite(v);

async function waitForServer(baseUrl: string, maxWaitMs = 60000): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || `${baseUrl}/api/v1`;
  const probeUrl = `${apiBase}/health`;
  const fallbackUrl = baseUrl;

  const probe = async (url: string) => {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });
      return res.status < 600;
    } catch {
      return false;
    }
  };

  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      if (await probe(probeUrl)) return;
      if (await probe(fallbackUrl)) return;
    } catch {
      // Still cold — wait and retry
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

interface LocationUpdate {
  jobId: string;
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
  const routeRef = useRef<{ lat: number; lng: number }[]>([]);
  const mapLoadedRef = useRef(false);
  const pickUpRef = useRef(pickUpLocation);
  const dropOffRef = useRef(dropOffLocation);

  const [isConnected, setIsConnected] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [locationCount, setLocationCount] = useState(0);
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  // Suppress console warnings from map tile parsing
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      // Filter out the noisy tile parse warnings
      if (message.includes('Expected value to be of type number') ||
          message.includes('found null') ||
          message.includes('worker') ||
          message.includes('could not be loaded')) {
        return;
      }
      originalWarn.apply(console, args);
    };
    
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => { pickUpRef.current = pickUpLocation; }, [pickUpLocation]);
  useEffect(() => { dropOffRef.current = dropOffLocation; }, [dropOffLocation]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }, []
  );

  const formatDistance = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;

  const estimateArrival = (distance: number) => {
    const minutes = (distance / 40) * 60;
    return new Date(Date.now() + minutes * 60000).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit',
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const pickup = pickUpRef.current;
    const dropoff = dropOffRef.current;

    const center: [number, number] =
      pickup && isValidCoord(pickup.lng) && isValidCoord(pickup.lat)
        ? [pickup.lng, pickup.lat]
        : [36.8219, -1.2921];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE as any,
      center,
      zoom: 13,
    });

    mapRef.current = map;

    // Handle map errors gracefully
    map.on('error', (e) => {
      const msg: string = e?.error?.message ?? '';
      // Ignore tile loading errors - they don't break functionality
      if (!msg.includes('tile') && !msg.includes('worker')) {
        setMapError(`Map error: ${msg}`);
      }
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    map.on('load', () => {
      mapLoadedRef.current = true;
      setMapError(null);

      // Add route source and layer
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#c41e3a', // Naivas maroon
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });

      // Add pickup marker
      if (pickup && isValidCoord(pickup.lng) && isValidCoord(pickup.lat)) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="width:36px;height:36px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(34,197,94,0.5)">
            <svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
          </div>`;
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pickup.lng, pickup.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setText(`Pickup: ${pickup.address}`))
          .addTo(map);
      }

      // Add dropoff marker
      if (dropoff && isValidCoord(dropoff.lng) && isValidCoord(dropoff.lat)) {
        const el = document.createElement('div');
        el.innerHTML = `
          <div style="width:36px;height:36px;background:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 10px rgba(239,68,68,0.5)">
            <svg width="16" height="16" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>`;
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([dropoff.lng, dropoff.lat])
          .setPopup(new maplibregl.Popup({ offset: 25 }).setText(`Dropoff: ${dropoff.address}`))
          .addTo(map);
      }

      // Add driver marker
      const driverEl = document.createElement('div');
      driverEl.innerHTML = `
        <div style="width:48px;height:48px;background:#c41e3a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 16px rgba(196,30,58,0.6)">
          <svg width="22" height="22" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM16 16V9l3 7M9 11H4"/>
          </svg>
        </div>`;
      markerRef.current = new maplibregl.Marker({ element: driverEl, anchor: 'center' })
        .setLngLat(center)
        .addTo(map);
    });

    // ─── WebSocket Connection ─────────────────────────────────────────────
    const socketBaseUrl = getSocketBaseUrl();
    let destroyed = false;

    const connectSocket = () => {
      if (destroyed) return;

      const socket = io(`${socketBaseUrl}/tracking`, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 10000,
        timeout: 60000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        setIsWakingUp(false);
        setSocketError(null);
        socket.emit('watch-job', { jobId });
      });

      socket.on('connect_error', (err: Error) => {
        setIsConnected(false);
        const isColdStart =
          err.message.includes('xhr poll error') ||
          err.message.includes('websocket error') ||
          err.message.includes('timeout');
        if (isColdStart) {
          setIsWakingUp(true);
          setSocketError(null);
        } else {
          setIsWakingUp(false);
          setSocketError(`Connection error: ${err.message}`);
        }
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          setSocketError('Disconnected by server');
        }
      });

      socket.on('driver-location', (data: LocationUpdate) => {
        const { lat, lng, timestamp } = data;
        if (!isValidCoord(lat) || !isValidCoord(lng)) return;

        markerRef.current?.setLngLat([lng, lat]);

        if (mapRef.current && mapLoadedRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: Math.max(mapRef.current.getZoom(), 13),
            speed: 0.8,
            curve: 1,
            essential: true,
          });

          routeRef.current.push({ lat, lng });
          if (routeRef.current.length > 200) routeRef.current.shift();

          const source = mapRef.current.getSource('route') as maplibregl.GeoJSONSource | undefined;
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

        const dropoff = dropOffRef.current;
        if (dropoff && isValidCoord(dropoff.lat) && isValidCoord(dropoff.lng)) {
          setDistanceToDestination(calculateDistance(lat, lng, dropoff.lat, dropoff.lng));
        }

        setLastUpdate(
          timestamp
            ? new Date(timestamp).toLocaleTimeString()
            : new Date().toLocaleTimeString()
        );
        setLocationCount(prev => prev + 1);
      });
    };

    // Wait for server then open socket
    setIsWakingUp(true);
    waitForServer(socketBaseUrl).then(() => {
      if (!destroyed) {
        setIsWakingUp(false);
        connectSocket();
      }
    });

    return () => {
      destroyed = true;
      mapLoadedRef.current = false;
      socketRef.current?.emit('unwatch-job', { jobId });
      socketRef.current?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [jobId, calculateDistance]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const statusLabel = isWakingUp
    ? 'Server waking up…'
    : isConnected
    ? 'Live Tracking'
    : 'Reconnecting…';

  const statusDot = isWakingUp
    ? 'bg-yellow-400 animate-pulse'
    : isConnected
    ? 'bg-green-500 animate-pulse'
    : 'bg-red-500';

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${statusDot}`} />
          <span className="text-sm font-medium text-gray-700">{statusLabel}</span>
          {lastUpdate && !isWakingUp && (
            <span className="text-xs text-gray-500">Last update: {lastUpdate}</span>
          )}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Cold-start banner */}
      {isWakingUp && (
        <div className="absolute top-14 left-0 right-0 z-20 px-4 pt-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-yellow-600 shrink-0" />
            <p className="text-xs text-yellow-800">
              Server is starting up — this can take up to 60 seconds. Please wait…
            </p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />

      {/* Driver Info Card */}
      {(driverName || driverPhone || driverRating) && (
        <div className="absolute top-16 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="bg-maroon-100 p-2 rounded-full">
              <Truck className="h-5 w-5 text-maroon-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{driverName ?? 'Driver'}</p>
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
              <div className="mt-1.5 w-2 h-2 bg-green-500 rounded-full shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm font-medium text-gray-900 truncate">{pickUpLocation.address}</p>
              </div>
            </div>
          )}
          {dropOffLocation && (
            <div className="flex items-start gap-2">
              <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full shrink-0" />
              <div className="min-w-0">
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
              <span className="text-sm font-semibold text-gray-900">
                {formatDistance(distanceToDestination)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-maroon-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, 100 - (distanceToDestination / 10) * 100)}%` }}
              />
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

      {/* Error Display */}
      {(socketError || mapError) && !isWakingUp && (
        <div className="absolute top-16 right-4 z-10 bg-red-50 border border-red-200 rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700">{socketError ?? mapError}</p>
          </div>
        </div>
      )}
    </div>
  );
}