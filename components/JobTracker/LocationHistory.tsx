// components/job/LocationHistory.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, MapPin, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

interface LocationHistoryProps {
  jobId: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export function LocationHistory({ jobId, onLocationSelect }: LocationHistoryProps) {
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/location/history`);
        const data = await response.json();
        setHistory(data.history || []);
      } catch (error) {
        console.error('Failed to fetch location history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [jobId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <span className="font-semibold text-gray-900">Location History</span>
          <span className="text-sm text-gray-500">({history.length} updates)</span>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Navigation className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No location updates yet</p>
              <p className="text-xs mt-1">Driver location will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {[...history].reverse().map((point: LocationPoint, index: number) => (
                <button
                  key={index}
                  onClick={() => onLocationSelect?.(point.lat, point.lng)}
                  className="w-full p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(point.timestamp)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(point.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}