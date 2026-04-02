// components/job/LocationBadge.tsx
'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface LocationBadgeProps {
  jobId: string;
}

interface LocationData {
  lat: number;
  lng: number;
  timestamp?: string;
}

export function LocationBadge({ jobId }: LocationBadgeProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket: Socket = io(apiUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('watch-job', jobId);
    });

    socket.on('location', (data: LocationData) => {
      setLocation({ lat: data.lat, lng: data.lng });
      setLastUpdate(new Date().toLocaleTimeString());
      setIsLive(true);
      
      // Reset live indicator after 5 seconds
      setTimeout(() => setIsLive(false), 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  if (!location) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
      <div className={`relative ${isLive ? 'animate-pulse' : ''}`}>
        <Navigation className="h-3 w-3 text-blue-600" />
        {isLive && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-blue-700">
        {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
      </span>
      {lastUpdate && (
        <div className="flex items-center gap-1 text-xs text-blue-500">
          <Clock className="h-3 w-3" />
          <span>{lastUpdate}</span>
        </div>
      )}
    </div>
  );
}