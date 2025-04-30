import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TrendingDown, Coins, MapPin, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FareCalculatorProps {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  userId?: number;
  onFareCalculated?: (fare: number) => void;
}

interface FareDetails {
  baseFare: number;
  distanceFare: number;
  discountAmount: number;
  finalFare: number;
  distance: number;
  currency: string;
  isPremium: boolean;
  rideCount: number;
  discountPercentage: number;
}

export default function FareCalculator({
  pickupLocation,
  dropoffLocation,
  userId,
  onFareCalculated
}: FareCalculatorProps) {
  const { toast } = useToast();
  const [fareDetails, setFareDetails] = useState<FareDetails | null>(null);

  // Mutation for fare calculation
  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      pickupLatitude: number;
      pickupLongitude: number;
      dropoffLatitude: number;
      dropoffLongitude: number;
      userId?: number;
    }) => apiRequest<FareDetails>('/api/ai/calculate-fare', {
      method: 'POST',
      body: data
    }),
    onSuccess: (data) => {
      setFareDetails(data);
      if (onFareCalculated) {
        onFareCalculated(data.finalFare);
      }
    },
    onError: () => {
      toast({
        title: "Failed to calculate fare",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  });

  // Calculate fare when locations change
  useEffect(() => {
    if (
      pickupLocation?.latitude &&
      pickupLocation?.longitude &&
      dropoffLocation?.latitude &&
      dropoffLocation?.longitude
    ) {
      mutate({
        pickupLatitude: pickupLocation.latitude,
        pickupLongitude: pickupLocation.longitude,
        dropoffLatitude: dropoffLocation.latitude,
        dropoffLongitude: dropoffLocation.longitude,
        userId
      });
    }
  }, [
    pickupLocation?.latitude,
    pickupLocation?.longitude,
    dropoffLocation?.latitude,
    dropoffLocation?.longitude,
    userId,
    mutate
  ]);

  if (isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <BarChart className="mx-auto mb-2 h-8 w-8 animate-pulse text-primary/70" />
              <p className="text-sm text-muted-foreground">Calculating affordable fare...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fareDetails) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <TrendingDown className="mr-2 h-5 w-5 text-primary" />
          Affordable Fare Calculation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
              <span>Trip Distance</span>
            </div>
            <span className="font-medium">{fareDetails.distance} km</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Base Fare</span>
            <span>₵{fareDetails.baseFare}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Distance Fare</span>
            <span>₵{fareDetails.distanceFare}</span>
          </div>
          
          {fareDetails.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <div className="flex items-center">
                <Coins className="mr-1 h-4 w-4" />
                <span>Your Discount ({fareDetails.discountPercentage}%)</span>
              </div>
              <span>-₵{fareDetails.discountAmount}</span>
            </div>
          )}
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-bold">
            <span>Final Fare</span>
            <span className="text-lg">₵{fareDetails.finalFare}</span>
          </div>
        </div>
        
        {fareDetails.isPremium ? (
          <div className="bg-primary/10 p-3 rounded-md text-sm">
            <p className="font-medium">Premium subscriber benefit applied!</p>
            <p className="text-muted-foreground">You're saving money with your premium subscription.</p>
          </div>
        ) : fareDetails.rideCount > 0 ? (
          <div className="bg-primary/10 p-3 rounded-md text-sm">
            <p className="font-medium">Loyalty discount applied!</p>
            <p className="text-muted-foreground">Based on your {fareDetails.rideCount} previous rides.</p>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Fare breakdown for your trip:
            </p>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Base fare</span>
                  <span>{Math.round((fareDetails.baseFare / fareDetails.finalFare) * 100)}%</span>
                </div>
                <Progress value={(fareDetails.baseFare / fareDetails.finalFare) * 100} className="h-1" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Distance-based fare</span>
                  <span>{Math.round((fareDetails.distanceFare / fareDetails.finalFare) * 100)}%</span>
                </div>
                <Progress value={(fareDetails.distanceFare / fareDetails.finalFare) * 100} className="h-1" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="text-xs text-muted-foreground">
          <p>Our pricing uses a decreasing rate per kilometer to ensure affordability for longer trips in Tamale.</p>
          {!fareDetails.isPremium && (
            <p className="mt-1">Subscribe to our premium plan to get additional discounts on all rides!</p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}