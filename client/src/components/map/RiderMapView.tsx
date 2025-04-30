import { useEffect, useState } from 'react';
import { AlertCircle, Clock, MapPin, Navigation, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import { apiRequest } from '@/lib/queryClient';

interface RiderMapViewProps {
  riderId: number;
  rideId: number;
  initialDriverLocation?: {
    latitude: number;
    longitude: number;
  };
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  onRideComplete?: () => void;
  onRideCancel?: () => void;
}

export default function RiderMapView({
  riderId,
  rideId,
  initialDriverLocation,
  pickupLocation,
  onRideComplete,
  onRideCancel
}: RiderMapViewProps) {
  const { toast } = useToast();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [estimatedTimeOfArrival, setEstimatedTimeOfArrival] = useState<number | null>(null);
  
  // Connect to WebSocket for real-time driver location updates
  const { connected } = useWebSocket({
    userType: 'rider',
    userId: riderId,
    onMessage: (data) => {
      if (data.type === 'driver_location' && data.rideId === rideId) {
        const newLocation = {
          latitude: data.latitude,
          longitude: data.longitude
        };
        setDriverLocation(newLocation);
        
        // Calculate ETA with traffic consideration
        if (pickupLocation) {
          const eta = calculateETA(
            data.latitude,
            data.longitude,
            pickupLocation.latitude,
            pickupLocation.longitude,
            getTrafficMultiplier()
          );
          setEstimatedTimeOfArrival(eta);
        }
      }
    },
    onConnect: () => {
      toast({
        title: "Connected to driver tracking",
        description: "You'll receive real-time updates on your driver's location.",
        duration: 3000
      });
    },
    onDisconnect: () => {
      toast({
        title: "Disconnected from tracking service",
        description: "Reconnecting...",
        variant: "destructive", 
        duration: 3000
      });
    }
  });

  // Enhanced Premium feature - ETA calculation with traffic consideration
  function calculateETA(
    driverLat: number,
    driverLng: number,
    pickupLat: number,
    pickupLng: number,
    trafficMultiplier: number = 1.0
  ): number {
    // Improved distance calculation using Haversine formula
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

    // Consider current time of day for traffic conditions in Tamale
    const currentHour = new Date().getHours();
    // Rush hours in Tamale: 7-9 AM and 4-7 PM
    let timeBasedMultiplier = 1.0;
    if ((currentHour >= 7 && currentHour <= 9) || (currentHour >= 16 && currentHour <= 19)) {
      timeBasedMultiplier = 1.5; // 50% slower during rush hours
    }
    
    // Dynamic speed calculation based on area and time
    const baseAverageSpeedKmh = 30;
    const effectiveSpeed = baseAverageSpeedKmh / (timeBasedMultiplier * trafficMultiplier);
    
    const estimatedTimeHours = distance / effectiveSpeed;
    return Math.round(estimatedTimeHours * 60); // Return minutes
  }
  
  // Function to get traffic data for Tamale (would connect to real traffic API in production)
  function getTrafficMultiplier(): number {
    // In a real implementation, this would call a traffic API
    // For demonstration, we'll use a time-based simulation
    const date = new Date();
    const hour = date.getHours();
    const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
    
    // Weekend vs weekday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Base multiplier
    let multiplier = 1.0;
    
    // Adjust for rush hours
    if (!isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19))) {
      multiplier = 1.3 + (Math.random() * 0.4); // 1.3-1.7x during rush hours
    } else if (hour >= 22 || hour <= 5) {
      multiplier = 0.8; // 20% faster at night
    }
    
    // Simulate rain effect (random chance)
    if (Math.random() < 0.2) { // 20% chance of rain
      multiplier *= 1.2; // 20% slower in rain
    }
    
    return multiplier;
  }

  // Load the map - in a real implementation, this would use Google Maps or similar
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Cancel the ride
  const handleCancelRide = async () => {
    if (!cancellationReason) {
      toast({
        title: "Cancellation reason required",
        description: "Please provide a reason for cancellation",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await apiRequest(`/api/rides/${rideId}/cancel`, {
        method: 'POST',
        body: { reason: cancellationReason }
      });
      
      toast({
        title: "Ride cancelled",
        description: `Cancellation penalty: ${response.cancellationPenalty}%`,
      });
      
      if (onRideCancel) onRideCancel();
    } catch (error) {
      toast({
        title: "Failed to cancel ride",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  if (!isMapLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <MapPin className="mx-auto mb-4 h-10 w-10 animate-pulse text-primary" />
              <p className="text-lg font-medium">Loading map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCancelling) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <X className="mr-2 h-5 w-5" />
            Cancel Ride
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you cancel now, you may be charged a cancellation fee based on the time elapsed and
              whether a driver has been assigned to your ride.
            </p>
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for cancellation:
              </label>
              <select 
                id="reason"
                className="w-full p-2 border rounded-md"
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="Wait time too long">Wait time too long</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found alternative transportation">Found alternative transportation</option>
                <option value="Price too high">Price too high</option>
                <option value="Mistaken request">Mistaken request</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsCancelling(false)}>
            Go Back
          </Button>
          <Button variant="destructive" onClick={handleCancelRide}>
            Confirm Cancellation
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Driver Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-slate-100 rounded-md overflow-hidden">
          {/* Placeholder for the actual map */}
          <div className="absolute inset-0 bg-gray-200">
            {driverLocation ? (
              <div className="relative w-full h-full">
                {/* The actual map would be rendered here */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500">
                  <MapPin className="h-6 w-6" />
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                    Your pickup
                  </span>
                </div>
                <div 
                  className="absolute bg-green-500 rounded-full p-1"
                  style={{ 
                    top: '60%', // Simplified positioning
                    left: '40%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <AlertCircle className="h-8 w-8 text-amber-500" />
                <span className="ml-2">Waiting for driver location updates...</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Pickup Location:</span>
            </div>
            <span className="text-sm">{pickupLocation.address}</span>
          </div>

          {estimatedTimeOfArrival && (
            <div className="bg-primary/10 p-3 rounded-md">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Estimated Time of Arrival</p>
                  <p className="text-lg font-bold">
                    {estimatedTimeOfArrival < 1 ? 
                      'Less than a minute' : 
                      `${estimatedTimeOfArrival} ${estimatedTimeOfArrival === 1 ? 'minute' : 'minutes'}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-1">
            <p className="text-sm font-medium">Driver's Progress</p>
            <Slider
              defaultValue={[30]}
              max={100}
              step={1}
              disabled
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Driver Assigned</span>
              <span>On the way</span>
              <span>Arrived</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="w-1/2" onClick={() => setIsCancelling(true)}>
          Cancel Ride
        </Button>
        <Button className="w-1/2 ml-2" onClick={onRideComplete}>
          Complete Ride
        </Button>
      </CardFooter>
    </Card>
  );
}