import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Car, MapPin, User, Calendar, Star, Clock, Loader2, LocateFixed } from "lucide-react";

// Mock driver ID for demo (in a real app, this would come from authentication)
const MOCK_DRIVER_ID = 1;
const MOCK_USER_ID = 1;

export default function DriverDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  
  // Fetch driver details
  const { data: driver, isLoading: isLoadingDriver } = useQuery({
    queryKey: ['/api/drivers', MOCK_DRIVER_ID],
    queryFn: () => apiRequest(`/api/drivers/${MOCK_DRIVER_ID}`),
  });
  
  // Fetch driver user details
  const { data: driverUser } = useQuery({
    queryKey: ['/api/users', MOCK_USER_ID],
    queryFn: () => apiRequest(`/api/users/${MOCK_USER_ID}`),
    enabled: !!driver,
  });
  
  // Fetch active ride
  const { data: activeRide, isLoading: isLoadingRide } = useQuery({
    queryKey: ['/api/rides/driver', MOCK_DRIVER_ID, 'active'],
    queryFn: () => apiRequest(`/api/rides/driver/${MOCK_DRIVER_ID}/active`),
    refetchInterval: isOnline ? 5000 : false, // Poll when online
    retry: false,
  });
  
  // Fetch ride requests when online
  const { data: rideRequests = [] } = useQuery({
    queryKey: ['/api/rides'],
    queryFn: async () => {
      const rides = await apiRequest('/api/rides');
      // Filter for unassigned rides with status "requested"
      return rides.filter(ride => ride.status === "requested");
    },
    refetchInterval: isOnline && !activeRide ? 5000 : false, // Poll when online and not on an active ride
    enabled: isOnline && !activeRide,
  });
  
  // Fetch all driver's past rides
  const { data: pastRides = [] } = useQuery({
    queryKey: ['/api/rides/driver', MOCK_DRIVER_ID],
    queryFn: async () => {
      const rides = await apiRequest(`/api/rides/driver/${MOCK_DRIVER_ID}`);
      // Only return completed rides
      return rides.filter(ride => ride.status === "completed");
    },
  });
  
  // Toggle online status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => 
      apiRequest(`/api/drivers/${MOCK_DRIVER_ID}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      setIsOnline(prev => !prev);
      toast({
        title: isOnline ? "You are now offline" : "You are now online",
        description: isOnline 
          ? "You won't receive new ride requests" 
          : "You'll start receiving ride requests",
      });
    },
    onError: () => {
      toast({
        title: "Status update failed",
        description: "Failed to update your status. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Accept ride mutation
  const acceptRideMutation = useMutation({
    mutationFn: (rideId: number) => 
      apiRequest(`/api/rides/${rideId}/assign`, {
        method: "PUT",
        body: JSON.stringify({ driverId: MOCK_DRIVER_ID }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rides'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rides/driver', MOCK_DRIVER_ID, 'active'] });
      toast({
        title: "Ride Accepted",
        description: "You have successfully accepted the ride.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to accept ride",
        description: "Someone else may have already accepted this ride.",
        variant: "destructive",
      });
    },
  });
  
  // Complete ride mutation
  const completeRideMutation = useMutation({
    mutationFn: (rideId: number) => 
      apiRequest(`/api/rides/${rideId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "completed" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rides/driver', MOCK_DRIVER_ID, 'active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rides/driver', MOCK_DRIVER_ID] });
      toast({
        title: "Ride Completed",
        description: "The ride has been marked as completed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to complete ride",
        description: "There was an error completing the ride.",
        variant: "destructive",
      });
    },
  });
  
  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: (location: { latitude: number; longitude: number }) => 
      apiRequest(`/api/drivers/${MOCK_DRIVER_ID}/location`, {
        method: "PUT",
        body: JSON.stringify(location),
      }),
    onSuccess: () => {
      console.log("Location updated");
    },
  });
  
  // Handle online/offline toggle
  const handleToggleStatus = () => {
    toggleStatusMutation.mutate(!isOnline);
  };
  
  // Handle ride acceptance
  const handleAcceptRide = (rideId: number) => {
    acceptRideMutation.mutate(rideId);
  };
  
  // Handle ride completion
  const handleCompleteRide = (rideId: number) => {
    completeRideMutation.mutate(rideId);
  };
  
  // Update driver location when online
  useEffect(() => {
    if (!isOnline) return;
    
    // Track location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocationMutation.mutate({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please check your location permissions.",
          variant: "destructive",
        });
      }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, toast, updateLocationMutation]);
  
  // Set initial online status from driver data
  useEffect(() => {
    if (driver) {
      setIsOnline(!!driver.isActive);
    }
  }, [driver]);
  
  // Show loading state
  if (isLoadingDriver) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading your dashboard...</h2>
      </div>
    );
  }
  
  // Calculate driver stats
  const calculateAverageRating = () => {
    if (!driver || !pastRides.length) return "N/A";
    
    const totalRating = pastRides.reduce((sum, ride) => sum + (ride.rating || 0), 0);
    const avgRating = totalRating / pastRides.length;
    return avgRating.toFixed(1);
  };
  
  const calculateTotalEarnings = () => {
    if (!pastRides.length) return 0;
    
    return pastRides.reduce((sum, ride) => sum + ride.fare, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Driver Profile</CardTitle>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={isOnline}
                  onCheckedChange={handleToggleStatus}
                  disabled={toggleStatusMutation.isPending}
                />
                <Label className={isOnline ? "text-primary" : "text-muted-foreground"}>
                  {isOnline ? "Online" : "Offline"}
                </Label>
              </div>
            </div>
            <CardDescription>
              Your driver profile and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{driverUser?.username || "Driver"}</h3>
                <p className="text-muted-foreground">{driverUser?.phoneNumber || "No phone"}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <div className="flex items-center gap-1">
                  <Car className="h-4 w-4 text-primary" />
                  <p className="font-medium">{driver?.licensePlate || "Not set"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-secondary fill-current" />
                  <p className="font-medium">{calculateAverageRating()}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Rides</p>
                <p className="font-medium">{driver?.totalRides || 0}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Earnings</p>
                <p className="font-medium">GHS {calculateTotalEarnings()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="active">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="active">Active Ride</TabsTrigger>
              <TabsTrigger value="requests">Ride Requests</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            {/* Active Ride */}
            <TabsContent value="active" className="space-y-4">
              {isLoadingRide ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : activeRide ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Current Ride</CardTitle>
                      <Badge variant={activeRide.status === "requested" ? "outline" : "default"}>
                        {activeRide.status === "requested" ? "Requested" : "In Progress"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup</p>
                          <p className="font-medium">{activeRide.pickupLocation}</p>
                        </div>
                      </div>
                      {activeRide.dropoffLocation && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Destination</p>
                            <p className="font-medium">{activeRide.dropoffLocation}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Fare:</span>
                      <span className="font-semibold">GHS {activeRide.fare}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full yelo-gradient"
                      onClick={() => handleCompleteRide(activeRide.id)}
                      disabled={completeRideMutation.isPending}
                    >
                      {completeRideMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        "Complete Ride"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Active Ride</CardTitle>
                    <CardDescription>
                      {isOnline 
                        ? "You're online and ready to accept rides. Check the 'Ride Requests' tab for available requests."
                        : "You're currently offline. Go online to start accepting rides."
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <div className="text-center">
                      <Car className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No active ride at the moment</p>
                    </div>
                  </CardContent>
                  {!isOnline && (
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={handleToggleStatus}
                        disabled={toggleStatusMutation.isPending}
                      >
                        Go Online
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
              
              {isOnline && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <LocateFixed className="h-5 w-5 text-primary" />
                      <p className="text-sm">
                        {driver?.latitude && driver?.longitude
                          ? `Lat: ${driver.latitude.toFixed(6)}, Lng: ${driver.longitude.toFixed(6)}`
                          : "Location tracking active..."
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Ride Requests */}
            <TabsContent value="requests">
              {!isOnline ? (
                <Card>
                  <CardHeader>
                    <CardTitle>You're Offline</CardTitle>
                    <CardDescription>
                      Go online to see and accept ride requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8 flex justify-center">
                    <Button 
                      onClick={handleToggleStatus}
                      disabled={toggleStatusMutation.isPending}
                    >
                      Go Online
                    </Button>
                  </CardContent>
                </Card>
              ) : activeRide ? (
                <Card>
                  <CardHeader>
                    <CardTitle>You Have an Active Ride</CardTitle>
                    <CardDescription>
                      Complete your current ride before accepting new requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-8 flex justify-center">
                    <Button 
                      onClick={() => handleCompleteRide(activeRide.id)}
                      variant="outline"
                    >
                      Go to Active Ride
                    </Button>
                  </CardContent>
                </Card>
              ) : rideRequests.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Ride Requests</CardTitle>
                    <CardDescription>
                      There are no ride requests at the moment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <div className="text-center">
                      <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Waiting for new requests...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rideRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">New Ride Request</CardTitle>
                          <Badge variant="outline">
                            {new Date(request.requestTime).toLocaleTimeString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Pickup</p>
                              <p className="font-medium">{request.pickupLocation}</p>
                            </div>
                          </div>
                          {request.dropoffLocation && (
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Destination</p>
                                <p className="font-medium">{request.dropoffLocation}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Fare:</span>
                          <span className="font-semibold">GHS {request.fare}</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full yelo-gradient"
                          onClick={() => handleAcceptRide(request.id)}
                          disabled={acceptRideMutation.isPending}
                        >
                          {acceptRideMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing
                            </>
                          ) : (
                            "Accept Ride"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Ride History */}
            <TabsContent value="history">
              {pastRides.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Ride History</CardTitle>
                    <CardDescription>
                      You haven't completed any rides yet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-8">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Your ride history will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastRides.map((ride) => (
                    <Card key={ride.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">Completed Ride</CardTitle>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">
                              {ride.rating ? (
                                <div className="flex items-center">
                                  <Star className="h-3 w-3 fill-current mr-1" />
                                  {ride.rating}
                                </div>
                              ) : (
                                "No Rating"
                              )}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          {new Date(ride.completionTime || ride.requestTime).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Pickup</p>
                            <p className="font-medium">{ride.pickupLocation}</p>
                          </div>
                        </div>
                        
                        {ride.dropoffLocation && (
                          <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                            <div>
                              <p className="text-sm text-muted-foreground">Destination</p>
                              <p className="font-medium">{ride.dropoffLocation}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2">
                          <span>Earned:</span>
                          <span className="font-semibold">GHS {ride.fare}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}