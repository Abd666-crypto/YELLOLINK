import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Loader2, MapPin, CreditCard } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  pickup: z.string().min(5, "Pickup location must be at least 5 characters"),
  dropoff: z.string().min(5, "Dropoff location must be at least 5 characters"),
  momoTxId: z.string().min(8, "MoMo transaction ID must be at least 8 characters"),
  fare: z.coerce.number().min(10, "Minimum fare is 10 GHS"),
  walletAddress: z.string().optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export default function RiderRequest() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickup: "",
      dropoff: "",
      momoTxId: "",
      fare: 20,
      walletAddress: "",
      phoneNumber: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Create user if not exists (simplified for demo)
      const userData = {
        username: values.phoneNumber,
        password: "demo-password-hashed", // In real app, generate secure password
        phoneNumber: values.phoneNumber,
        walletAddress: values.walletAddress || null,
        role: "user"
      };
      
      const user = await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      
      // Request ride
      const rideData = {
        riderId: user.id,
        pickupLocation: values.pickup,
        dropoffLocation: values.dropoff,
        fare: values.fare,
        momoTxId: values.momoTxId,
      };
      
      await apiRequest("/api/rides", {
        method: "POST",
        body: JSON.stringify(rideData),
      });
      
      toast({
        title: "Ride Requested!",
        description: "Your ride has been requested. Waiting for a driver to accept.",
      });
      
      // Navigate to ride status page (to be created)
      navigate("/rider-status");
    } catch (error) {
      console.error("Error requesting ride:", error);
      toast({
        title: "Error",
        description: "Failed to request ride. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Request a Ride in Tamale</CardTitle>
          <CardDescription>
            Fill out the details below to request a ride. Payment is handled via Mobile Money.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pickup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. Tamale Central Market" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where should the driver pick you up?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dropoff"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dropoff Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. Tamale Teaching Hospital" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Where are you going?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0241234567" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your contact number for the driver
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your blockchain wallet address" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your CELO wallet address for blockchain verification
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fare (GHS)</FormLabel>
                        <FormControl>
                          <Input type="number" min={10} {...field} />
                        </FormControl>
                        <FormDescription>
                          The fare amount in Ghana Cedis
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="momoTxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MoMo Transaction ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Your MoMo payment ID" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          The transaction ID from your MoMo payment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full yelo-gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Request Ride"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 items-start">
          <div className="text-sm text-muted-foreground">
            <p>Need help with MoMo payments?</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Transfer the fare amount to: 024 123 4567</li>
              <li>Enter the transaction ID you receive via SMS</li>
              <li>Your payment is held in escrow until ride completion</li>
            </ul>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}