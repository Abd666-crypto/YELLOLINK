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
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { Loader2, Car, User, Wallet } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  licensePlate: z.string().min(4, "License plate must be at least 4 characters"),
  walletAddress: z.string().min(10, "Wallet address must be at least 10 characters"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

export default function DriverRegister() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      phoneNumber: "",
      licensePlate: "",
      walletAddress: "",
      termsAccepted: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Register user
      const userData = {
        username: values.username,
        password: values.password,
        phoneNumber: values.phoneNumber,
        walletAddress: values.walletAddress,
        role: "driver"
      };
      
      const user = await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      
      // Register driver
      const driverData = {
        userId: user.id,
        licensePlate: values.licensePlate,
        walletAddress: values.walletAddress,
        isActive: true
      };
      
      await apiRequest("/api/drivers", {
        method: "POST",
        body: JSON.stringify(driverData),
      });
      
      toast({
        title: "Registration Successful!",
        description: "You have successfully registered as a YeloLink driver.",
      });
      
      // Navigate to driver dashboard
      navigate("/driver-dashboard");
    } catch (error) {
      console.error("Error registering driver:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your account. Please try again.",
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
          <CardTitle className="text-2xl">Become a YeloLink Driver</CardTitle>
          <CardDescription>
            Join our network of trusted drivers in Tamale and start earning today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter username" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        This will be your login username
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a secure password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        Your contact number for riders
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle License Plate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Car className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="e.g. GT 123-20" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your vehicle's license plate number
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
                      <FormLabel>CELO Wallet Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Wallet className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Your CELO blockchain wallet address" className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your wallet for blockchain verification and payments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the terms and conditions
                        </FormLabel>
                        <FormDescription>
                          By accepting, you agree to YeloLink's terms of service and driver guidelines.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full yelo-gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Register as Driver"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 items-start text-sm text-muted-foreground">
          <p>After registration, we'll verify your information and vehicle documents.</p>
          <p>For assistance, contact YeloLink support at <span className="font-medium">support@yelolink.com</span></p>
        </CardFooter>
      </Card>
    </div>
  );
}