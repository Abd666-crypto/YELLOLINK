import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { Ride, Driver } from '@shared/schema';
import { MapPin, Car, Navigation, Clock, Loader2 } from 'lucide-react';

interface RiderMapViewProps {
  ride: Ride;
  driver?: Driver;
  isPremium?: boolean;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// Premium feature - ETA calculation
function calculateETA(
  driverLat: number,
  driverLng: number,
  pickupLat: number,
  pickupLng: number
): number {
  // Simple distance calculation using Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (pickupLat - driverLat) * (Math.PI / 180);
  const dLng = (pickupLng - driverLng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(driverLat * (Math.PI / 180)) *
    Math.cos(pickupLat * (Math.PI / 180)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  // Assume average speed of 30 km/h in city traffic
  const averageSpeedKmh = 30;
  const estimatedTimeHours = distance / averageSpeedKmh;
  return Math.round(estimatedTimeHours * 60); // Return minutes
}

export default function RiderMapView({ ride, driver, isPremium = false }: RiderMapViewProps) {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [showPremiumOffer, setShowPremiumOffer] = useState(!isPremium);
  
  // Simulated pickup location (would come from ride details)
  const pickupLocation = {
    latitude: 9.4067, // Tamale city center coordinates (example)
    longitude: -0.8426
  };

  // WebSocket connection for real-time location updates
  const { connected } = useWebSocket({
    userType: 'rider',
    userId: ride.riderId,
    onMessage: (data) => {
      if (data.type === 'driver_location' && data.driverId === ride.driverId) {
        console.log('Received driver location update:', data);
        
        // Update driver location
        setDriverLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: Date.now()
        });
        
        setLastUpdate(new Date());
        
        // Calculate ETA for premium users
        if (isPremium) {
          const eta = calculateETA(
            data.latitude, 
            data.longitude, 
            pickupLocation.latitude, 
            pickupLocation.longitude
          );
          setEtaMinutes(eta);
        }
      }
    },
    onConnect: () => {
      toast({
        title: 'Connected to Driver Location Service',
        description: 'You will receive real-time updates of your driver\'s location.',
      });
    }
  });

  // Draw map (simplified for this example)
  useEffect(() => {
    if (!mapRef.current || !driverLocation) return;
    
    const mapContainer = mapRef.current;
    
    // Clear previous content
    mapContainer.innerHTML = '';
    
    // In a real app, you would integrate with a mapping API like Google Maps, Mapbox, or Leaflet
    // For this example, we'll create a simple visual representation
    
    const mapContent = document.createElement('div');
    mapContent.className = 'relative w-full h-full bg-slate-100 rounded-lg overflow-hidden';
    
    // Driver marker
    const driverMarker = document.createElement('div');
    driverMarker.className = 'absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2';
    driverMarker.style.left = '50%'; // In a real app, calculate position based on coordinates
    driverMarker.style.top = '50%';
    driverMarker.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="6" y="5" width="12" height="10" rx="2"/><path d="M8 10h8"/><path d="M10 2v3"/><path d="M14 2v3"/><path d="M10 15v4"/><path d="M14 15v4"/><path d="M4 10v6"/><path d="M20 10v6"/></svg>';
    
    // Pickup location marker
    const pickupMarker = document.createElement('div');
    pickupMarker.className = 'absolute w-6 h-6 bg-secondary rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2';
    pickupMarker.style.left = '30%'; // In a real app, calculate position based on coordinates
    pickupMarker.style.top = '30%';
    pickupMarker.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
    
    // Add a simple route line
    const routeLine = document.createElement('div');
    routeLine.className = 'absolute w-16 h-1 bg-primary/50 rotate-45';
    routeLine.style.left = '35%';
    routeLine.style.top = '35%';
    
    mapContent.appendChild(routeLine);
    mapContent.appendChild(driverMarker);
    mapContent.appendChild(pickupMarker);
    
    // Add map to container
    mapContainer.appendChild(mapContent);
    
    // Add labels
    const driverLabel = document.createElement('div');
    driverLabel.className = 'absolute text-xs font-medium bg-white px-1 py-0.5 rounded shadow';
    driverLabel.style.left = 'calc(50% + 10px)';
    driverLabel.style.top = 'calc(50% - 15px)';
    driverLabel.textContent = 'Driver';
    
    const pickupLabel = document.createElement('div');
    pickupLabel.className = 'absolute text-xs font-medium bg-white px-1 py-0.5 rounded shadow';
    pickupLabel.style.left = 'calc(30% + 10px)';
    pickupLabel.style.top = 'calc(30% - 15px)';
    pickupLabel.textContent = 'Pickup';
    
    mapContent.appendChild(driverLabel);
    mapContent.appendChild(pickupLabel);
    
  }, [driverLocation]);

  // Upgrade to premium handler
  const handleUpgradeToPremium = () => {
    // In a real app, this would navigate to a payment page or show a modal
    toast({
      title: 'Premium Features',
      description: 'This would take you to a payment page to unlock premium features.',
    });
  };

  // If no driver assigned yet
  if (!driver || ride.status !== 'assigned') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">
              Waiting for a driver to accept your request...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Track Your Driver</h3>
          
          {/* Connection status */}
          <Badge variant={connected ? "outline" : "destructive"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        
        {/* Map container */}
        <div 
          ref={mapRef} 
          className="h-60 bg-muted rounded-lg overflow-hidden relative"
        >
          {!driverLocation && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Waiting for driver's location...
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Location information */}
        <div className="space-y-2">
          {driverLocation && (
            <>
              <div className="flex items-center text-sm">
                <Car className="h-4 w-4 mr-2 text-primary" />
                <span>Driver is on the way to your pickup location.</span>
              </div>
              
              {isPremium && etaMinutes !== null && (
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-secondary" />
                  <span>
                    <span className="font-semibold">ETA:</span> {etaMinutes} minute{etaMinutes !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Navigation className="h-3 w-3 mr-1" />
                <span>
                  Last updated: {lastUpdate?.toLocaleTimeString() || 'Unknown'}
                </span>
              </div>
            </>
          )}
          
          {/* Pickup details */}
          <div className="flex items-start gap-2 text-sm mt-4">
            <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
            <div>
              <p className="font-medium">Pickup Location</p>
              <p className="text-muted-foreground">{ride.pickupLocation}</p>
            </div>
          </div>
        </div>
        
        {/* Premium upgrade offer */}
        {showPremiumOffer && (
          <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-3 rounded-lg">
            <div className="flex items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800">Upgrade to YeloLink Premium</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Get real-time ETAs, priority booking, and advanced tracking features.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleUpgradeToPremium}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
              >
                Upgrade
              </Button>
            </div>
            <button 
              className="text-xs text-amber-700 hover:text-amber-800 mt-2 underline"
              onClick={() => setShowPremiumOffer(false)}
            >
              Dismiss
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}