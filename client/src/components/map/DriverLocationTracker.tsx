import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { Loader2, MapPin, AlertTriangle } from 'lucide-react';

interface DriverLocationTrackerProps {
  driverId: number;
  isActive: boolean;
}

export default function DriverLocationTracker({ driverId, isActive }: DriverLocationTrackerProps) {
  const { toast } = useToast();
  const [tracking, setTracking] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  // WebSocket connection
  const { connected, sendMessage } = useWebSocket({
    userType: 'driver',
    userId: driverId,
    onConnect: () => {
      toast({
        title: 'Location Sharing Connected',
        description: 'You are now connected to the location service.',
      });
    },
    onDisconnect: () => {
      if (tracking) {
        toast({
          title: 'Location Sharing Disconnected',
          description: 'Connection to location service lost. Trying to reconnect...',
          variant: 'destructive',
        });
      }
    },
  });

  // Update position handler
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    console.log('Position update:', position.coords);
    setPosition(position);
    setError(null);

    if (connected) {
      sendMessage({
        type: 'location_update',
        userType: 'driver',
        userId: driverId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    }
  }, [connected, sendMessage, driverId]);

  // Handle geolocation errors
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    
    let errorMessage = 'Error accessing your location';
    if (error.code === error.PERMISSION_DENIED) {
      errorMessage = 'Location access denied. Please enable location services for this site.';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      errorMessage = 'Location information is unavailable. Please check your device settings.';
    } else if (error.code === error.TIMEOUT) {
      errorMessage = 'Location request timed out. Please try again.';
    }
    
    setError(errorMessage);
    toast({
      title: 'Location Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, [toast]);

  // Start tracking location
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    try {
      // First get current position
      navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, {
        enableHighAccuracy: true,
      });

      // Then watch position for updates
      const id = navigator.geolocation.watchPosition(handlePositionUpdate, handlePositionError, {
        enableHighAccuracy: true,
        maximumAge: 10000, // 10 seconds
        timeout: 10000, // 10 seconds
      });

      setWatchId(id);
      setTracking(true);
      
      toast({
        title: 'Location Tracking Started',
        description: 'Your location is now being shared with riders.',
      });
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setError('Failed to start location tracking');
    }
  }, [handlePositionUpdate, handlePositionError, toast]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setTracking(false);
    
    toast({
      title: 'Location Tracking Stopped',
      description: 'Your location is no longer being shared.',
    });
  }, [watchId, toast]);

  // Auto-start/stop tracking based on driver active status
  useEffect(() => {
    if (isActive && !tracking) {
      startTracking();
    } else if (!isActive && tracking) {
      stopTracking();
    }
    
    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isActive, tracking, startTracking, stopTracking, watchId]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-muted/20 rounded-lg p-4 border">
      <h3 className="text-sm font-medium mb-2">Location Sharing</h3>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive mb-3 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {position && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span>Current Location:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Latitude:</span>{' '}
              {position.coords.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span>{' '}
              {position.coords.longitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Accuracy:</span>{' '}
              {position.coords.accuracy.toFixed(1)}m
            </div>
            <div>
              <span className="font-medium">Last Update:</span>{' '}
              {new Date(position.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant={tracking ? "destructive" : "default"}
          onClick={tracking ? stopTracking : startTracking}
          className="w-full"
        >
          {tracking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Stop Sharing Location
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Start Sharing Location
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          {tracking 
            ? 'Riders can see your live location on their map.'
            : 'Your location is not being shared.'}
        </p>
      </div>
    </div>
  );
}