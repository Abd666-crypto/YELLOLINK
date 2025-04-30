import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Activity, MapPin, Award, TrendingUp, Clock, Car, Coins } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';

interface HotspotPrediction {
  area: string;
  coordinates: { latitude: number; longitude: number };
  probability: number; 
  estimatedFare: number;
}

interface DriverStats {
  totalRides: number;
  totalRating: number;
  tokens: number;
  isActive: boolean;
}

export default function DriverDashboard() {
  const { toast } = useToast();
  const [driverId, setDriverId] = useState<number>(1); // Placeholder driver ID
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeView, setActiveView] = useState<'predictions' | 'tokens'>('predictions');
  
  // Connection to real-time websocket for location updates and ride requests
  const { connected, sendMessage } = useWebSocket({
    userType: 'driver',
    userId: driverId,
    onMessage: (data) => {
      // Handle incoming messages (ride requests, etc.)
      if (data.type === 'ride_request') {
        toast({
          title: "New Ride Request",
          description: `Pickup: ${data.pickupLocation}`,
          duration: 10000,
        });
      } else if (data.type === 'ride_cancelled') {
        toast({
          title: "Ride Cancelled",
          description: `Reason: ${data.cancellationReason || 'Not provided'}`,
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  });

  // Fetch driver details
  const { data: driverData, isLoading: loadingDriver } = useQuery({
    queryKey: ['/api/drivers', driverId],
    queryFn: () => apiRequest<DriverStats>(`/api/drivers/${driverId}`),
    enabled: !!driverId,
  });

  // Fetch AI predictions for best ride spots
  const { data: predictions, isLoading: loadingPredictions } = useQuery({
    queryKey: ['/api/ai/predict-rides', driverId, coordinates?.latitude, coordinates?.longitude],
    queryFn: () => 
      apiRequest<{ hotspots: HotspotPrediction[] }>(`/api/ai/predict-rides/${driverId}`),
    enabled: !!driverId && !!coordinates,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch token rewards
  const { data: tokenData, isLoading: loadingTokens } = useQuery({
    queryKey: ['/api/ai/driver-tokens', driverId],
    queryFn: () => 
      apiRequest<{ tokensPrevious: number; tokensEarned: number; tokensTotal: number }>(`/api/ai/driver-tokens/${driverId}`),
    enabled: !!driverId,
  });

  // Get the driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoordinates(newCoordinates);
          
          // Send location update via WebSocket if connected
          if (connected) {
            sendMessage({
              type: 'location_update',
              userType: 'driver',
              userId: driverId,
              ...newCoordinates
            });
          }
        },
        (error) => {
          // Handle geolocation error
          toast({
            title: "Location Error",
            description: "Unable to access your location. Some features may be limited.",
            variant: "destructive"
          });
          
          // Use default Tamale coordinates
          setCoordinates({
            latitude: 9.4047,
            longitude: -0.8423
          });
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
      
      // Set up location tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCoordinates(newCoordinates);
          
          // Send location update via WebSocket if connected
          if (connected) {
            sendMessage({
              type: 'location_update',
              userType: 'driver',
              userId: driverId,
              ...newCoordinates
            });
          }
        },
        (error) => {
          console.error("Geolocation watch error:", error);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 15000,
          timeout: 12000
        }
      );
      
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [driverId, connected, sendMessage, toast]);

  // Toggle driver active status
  const toggleActiveStatus = async () => {
    if (!driverData) return;
    
    try {
      const updatedDriver = await apiRequest(`/api/drivers/${driverId}/status`, {
        method: 'PUT',
        body: { isActive: !driverData.isActive }
      });
      
      toast({
        title: updatedDriver.isActive ? "You're now online" : "You're now offline",
        description: updatedDriver.isActive 
          ? "You'll receive ride requests in your area" 
          : "You won't receive any ride requests",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Status update failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            View predictions, manage rides, and track your rewards
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={toggleActiveStatus}
            variant={driverData?.isActive ? "default" : "outline"}
            className={driverData?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Car className="mr-2 h-4 w-4" />
            {driverData?.isActive ? "Online" : "Go Online"}
          </Button>
        </div>
      </div>

      {/* Driver Stats Summary */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Rides</p>
                <p className="text-2xl font-bold">
                  {loadingDriver ? '...' : driverData?.totalRides || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">
                  {loadingDriver ? '...' : 
                    driverData && driverData.totalRides > 0 ? 
                    (driverData.totalRating / driverData.totalRides).toFixed(1) : 
                    'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-10 w-10 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">YeloTokens</p>
                <p className="text-2xl font-bold">
                  {loadingTokens ? '...' : driverData?.tokens || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge 
                  variant="outline" 
                  className={driverData?.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"}
                >
                  {driverData?.isActive ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 pb-2">
        <Button 
          variant={activeView === 'predictions' ? "default" : "outline"}
          onClick={() => setActiveView('predictions')}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          AI Predictions
        </Button>
        <Button 
          variant={activeView === 'tokens' ? "default" : "outline"}
          onClick={() => setActiveView('tokens')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Token Rewards
        </Button>
      </div>

      {/* Main Content Section */}
      {activeView === 'predictions' ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                AI Ride Predictions
              </div>
            </CardTitle>
            <CardDescription>
              Hotspots with high ride demand in Tamale right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPredictions ? (
              <div className="py-8 text-center">
                <div className="animate-pulse mb-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-muted-foreground">Analyzing ride patterns...</p>
              </div>
            ) : predictions && predictions.hotspots ? (
              <div className="space-y-4">
                {predictions.hotspots.map((hotspot, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <MapPin className={`h-5 w-5 mt-1 ${index === 0 ? 'text-rose-500' : 'text-gray-500'}`} />
                        <div>
                          <p className="font-medium">{hotspot.area}</p>
                          <p className="text-sm text-muted-foreground">
                            Estimated fare: ₵{hotspot.estimatedFare.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {(hotspot.probability * 100).toFixed(0)}% chance
                        </div>
                        <Progress 
                          value={hotspot.probability * 100} 
                          className="h-2 w-24"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No predictions available</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                Token Rewards System
              </div>
            </CardTitle>
            <CardDescription>
              Earn YeloTokens for completing rides and maintaining good ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  YeloToken Rewards
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Complete more rides to earn tokens. Every 10 rides earns you 1 token,
                  with bonus tokens for high ratings and consistent activity.
                </p>
                
                <div className="bg-white rounded p-3 border border-yellow-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Token Balance</span>
                    <span className="font-bold">{driverData?.tokens || 0}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Tokens from rides</span>
                      <span>{Math.floor((driverData?.totalRides || 0) / 10)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rating bonus</span>
                      <span>{driverData && driverData.totalRides > 0 && (driverData.totalRating / driverData.totalRides) >= 4.5 ? '3' : driverData && driverData.totalRides > 0 && (driverData.totalRating / driverData.totalRides) >= 4.0 ? '2' : driverData && driverData.totalRides > 0 && (driverData.totalRating / driverData.totalRides) >= 3.5 ? '1' : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Redeem Tokens</h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <Button variant="outline" className="border-dashed h-auto py-4 flex flex-col">
                    <span className="font-medium">Discount on Platform Fee</span>
                    <span className="text-sm text-muted-foreground mt-1">10 tokens = 5% discount</span>
                  </Button>
                  
                  <Button variant="outline" className="border-dashed h-auto py-4 flex flex-col">
                    <span className="font-medium">Priority Ride Matching</span>
                    <span className="text-sm text-muted-foreground mt-1">15 tokens = 1 week</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}