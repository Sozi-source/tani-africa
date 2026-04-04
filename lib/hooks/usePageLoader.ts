import { useEffect, useState } from 'react';

/**
 * Ensures loader is shown for a minimum duration
 * even if loading completes early.
 */
export function usePageLoader(
  isLoading: boolean,
  minDuration = 3000
) {
  const [showLoader, setShowLoader] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    if (!isLoading && minTimeElapsed) {
      setShowLoader(false);
    }
  }, [isLoading, minTimeElapsed]);

  return showLoader;
}