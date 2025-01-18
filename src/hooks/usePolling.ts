import { useState, useCallback, useEffect, useRef } from 'react';
import { replicateService } from '../services/replicate';
import { PredictionStatus } from '../types';

interface PollingOptions {
  interval?: number;
  maxAttempts?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function usePolling() {
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<number>();
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsPolling(false);
    attemptsRef.current = 0;
  }, []);

  const startPolling = useCallback((predictionId: string, options: PollingOptions = {}) => {
    const {
      interval = 1000,
      maxAttempts = 60,
      onSuccess,
      onError
    } = options;

    // Clear any existing polling
    stopPolling();
    
    // Set initial state
    setIsPolling(true);
    attemptsRef.current = 0;

    const pollPrediction = async () => {
      try {
        attemptsRef.current += 1;

        // Check if we've exceeded max attempts
        if (attemptsRef.current > maxAttempts) {
          stopPolling();
          onError?.(new Error('Polling timeout: Max attempts exceeded'));
          return;
        }

        const response = await replicateService.getPrediction(predictionId);

        // If we have a successful status, stop polling and call success callback
        if (response.status === PredictionStatus.SUCCEEDED) {
          stopPolling();
          onSuccess?.(response);
          return;
        }

        // If we have a failed or canceled status, stop polling and call error callback
        if (response.status === PredictionStatus.FAILED || response.status === PredictionStatus.CANCELED) {
          stopPolling();
          onError?.(new Error(`Prediction ${response.status}`));
          return;
        }

        // Continue polling for other statuses (starting, processing)
      } catch (error) {
        stopPolling();
        onError?.(error instanceof Error ? error : new Error('Polling failed'));
      }
    };

    // Start polling
    intervalRef.current = window.setInterval(pollPrediction, interval);

    // Initial poll
    pollPrediction();

    // Cleanup function
    return stopPolling;
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    startPolling,
    stopPolling,
    isPolling
  };
}