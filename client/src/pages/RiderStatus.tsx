import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { MapPin, Car, Phone, Star, Loader2, CheckCircle2 } from "lucide-react";

// Mock user ID for demo (in a real app, this would come from authentication)
const MOCK_USER_ID = 1;

export default function RiderStatus() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active ride
  const { data: ride, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/rides/rider', MOCK_USER_ID, 'active'],
    queryFn: () => apiRequest(`/api/rides/rider/${MOCK_USER_ID}/active`),
    refetchInterval: 5000, // Poll every 5 seconds for updates
  });

  // Fetch driver details if assigned
  const { data: driver } = useQuery({
    queryKey: ['/api/drivers', ride?.driverId],
    queryFn: () => apiRequest(`/api/drivers/${ride?.driverId}`),
    enabled: !!ride?.driverId,
  });

  // Fetch user details for driver
  const { data: driverUser } = useQuery({
    queryKey: ['/api/users', driver?.userId],
    queryFn: () => apiRequest(`/api/users/${driver?.userId}`),
    enabled: !!driver?.userId,
  });

  // Submit rating
  const submitRating = async () => {
    if (!rating || !ride) return;
    
    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/rides/${ride.id}/complete`, {
        method: "PUT",
        body: JSON.stringify({ rating }),
      });
      
      toast({
        title: "Thank You!",
        description: "Your rating has been submitted successfully.",
      });
      
      // Navigate to home
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "No Active Ride",
        description: "You don't have any active rides. Request a new ride.",
        variant: "destructive",
      });
      
      // Navigate to request page
      navigate("/rider-request");
    }
  }, [error, toast, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading your ride status...</h2>
      </div>
    );
  }

  // Show rating screen for completed rides
  if (ride && ride.status === "completed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Ride Completed</CardTitle>
            <CardDescription>How was your experience?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Rate your driver</p>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded-full transition-all ${
                      rating && star <= rating ? "text-secondary scale-110" : "text-muted-foreground"
                    }`}
                  >
                    <Star className="h-8 w-8" fill={rating && star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={submitRating} 
              className="w-full yelo-gradient" 
              disabled={!rating || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Rating"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Your Ride Status</CardTitle>
          <CardDescription>
            {ride?.status === "requested" 
              ? "Finding a driver near you..." 
              : "Your driver is on the way to pick you up!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Requested</span>
              <span>Driver Assigned</span>
              <span>Completed</span>
            </div>
            <Progress value={
              ride?.status === "requested" ? 33 : 
              ride?.status === "assigned" ? 66 : 100
            } className="h-2" />
          </div>
          
          {/* Pickup and Dropoff */}
          <div className="space-y-3 border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">{ride?.pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{ride?.dropoffLocation || "Not specified"}</p>
              </div>
            </div>
          </div>
          
          {/* Driver Info (if assigned) */}
          {ride?.status === "assigned" && driver && driverUser && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Driver Information</h3>
              
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{driverUser.username}</p>
                  <p className="text-sm text-muted-foreground">License: {driver.licensePlate}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" asChild>
                <a href={`tel:${driverUser.phoneNumber}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Driver
                </a>
              </Button>
            </div>
          )}
          
          {/* Fare Info */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-medium">Fare:</span>
            <span className="text-lg font-semibold">GHS {ride?.fare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Payment Method:</span>
            <span>Mobile Money (MoMo)</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Transaction ID:</span>
            <span className="font-mono">{ride?.momoTxId}</span>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => refetch()}
          >
            Refresh Status
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}