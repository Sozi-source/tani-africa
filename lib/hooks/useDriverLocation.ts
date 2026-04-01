'use client';

import { useEffect, useRef, useCallback } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';

const PING_INTERVAL_MS = 30_000; // 30 seconds

interface UseDriverLocationOptions {
  jobId: string | null;
  isActive: boolean; // only ping when job is in progress
}

export function useDriverLocation({ jobId, isActive }: UseDriverLocationOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const latestPositionRef = useRef<GeolocationPosition | null>(null);

  const sendLocation = useCallback(
    async (position: GeolocationPosition) => {
      if (!jobId) return;
      try {
        await apiClient.patch(`/jobs/${jobId}/location`, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (err) {
        console.error('Failed to send location update:', err);
      }
    },
    [jobId],
  );

  useEffect(() => {
    if (!isActive || !jobId) return;

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }

    // Start watching position (continuous GPS)
    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        latestPositionRef.current = position;
      },
      error => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10_000,
        timeout: 15_000,
      },
    );

    // Send location on interval
    intervalRef.current = setInterval(() => {
      if (latestPositionRef.current) {
        sendLocation(latestPositionRef.current);
      }
    }, PING_INTERVAL_MS);

    // Send immediately on start
    navigator.geolocation.getCurrentPosition(
      position => sendLocation(position),
      err => console.error('Initial location error:', err),
      { enableHighAccuracy: true },
    );

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [jobId, isActive, sendLocation]);
}