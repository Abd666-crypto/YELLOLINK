import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionTier } from '@shared/schema';
import { AlertCircle, CheckCircle2, Clock, CornerDownRight, CreditCard, Shield, Zap } from 'lucide-react';

// 1-month duration in milliseconds (30 days)
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// Subscription tier details
const tiers = [
  {
    id: SubscriptionTier.FREE,
    name: 'Free',
    description: 'Basic ride sharing features',
    price: 0,
    features: [
      'Basic ride requests',
      'Ride history',
      'Standard driver matching'
    ],
    color: 'bg-gray-100',
    buttonVariant: 'outline' as const
  },
  {
    id: SubscriptionTier.BASIC,
    name: 'Basic',
    description: 'Enhanced experience',
    price: 5,
    features: [
      'All Free features',
      'Ride cancellation',
      'Favorite drivers',
      'Basic ride tracking'
    ],
    color: 'bg-blue-50',
    buttonVariant: 'secondary' as const
  },
  {
    id: SubscriptionTier.PREMIUM,
    name: 'Premium',
    description: 'Premium experience with all features',
    price: 15,
    features: [
      'All Basic features',
      'Real-time ETA calculation',
      'Advanced driver tracking',
      'Priority matching',
      'Premium support'
    ],
    color: 'bg-amber-50',
    buttonVariant: 'default' as const
  },
  {
    id: SubscriptionTier.BUSINESS,
    name: 'Business',
    description: 'For business travel',
    price: 50,
    features: [
      'All Premium features',
      'Business reporting',
      'Multiple user accounts',
      'Expense tracking',
      'Dedicated support',
      'Corporate billing'
    ],
    color: 'bg-indigo-50',
    buttonVariant: 'outline' as const
  }
];

export default function Subscription() {
  const { toast } = useToast();
  const { userId } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<string>(SubscriptionTier.PREMIUM);
  const [duration, setDuration] = useState<number>(1); // months
  
  // Fetch user's current subscription
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/users', userId, 'subscription'],
    queryFn: () => apiRequest(`/api/users/${userId}/subscription`),
    retry: false
  });
  
  // Fetch premium status
  const { data: premiumStatus } = useQuery({
    queryKey: ['/api/users', userId, 'premium-status'],
    queryFn: () => apiRequest(`/api/users/${userId}/premium-status`),
    retry: false
  });
  
  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: (data: any) => apiRequest('/api/subscriptions', {
      method: 'POST',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'premium-status'] });
      toast({
        title: 'Subscription created',
        description: `You've successfully subscribed to the ${selectedPlan} plan.`,
      });
    },
    onError: () => {
      toast({
        title: 'Subscription failed',
        description: 'There was an error processing your subscription.',
        variant: 'destructive'
      });
    }
  });
  
  // Update subscription mutation
  const updateSubscription = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiRequest(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: data
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'premium-status'] });
      toast({
        title: 'Subscription updated',
        description: `Your subscription has been updated to the ${selectedPlan} plan.`,
      });
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'There was an error updating your subscription.',
        variant: 'destructive'
      });
    }
  });
  
  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/subscriptions/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'premium-status'] });
      toast({
        title: 'Subscription cancelled',
        description: 'Your subscription has been cancelled.',
      });
    },
    onError: () => {
      toast({
        title: 'Cancellation failed',
        description: 'There was an error cancelling your subscription.',
        variant: 'destructive'
      });
    }
  });
  
  const handleSubscribe = () => {
    if (!userId) {
      toast({
        title: 'User ID required',
        description: 'Please log in to subscribe.',
        variant: 'destructive'
      });
      return;
    }
    
    const endDate = new Date(Date.now() + (ONE_MONTH_MS * duration));
    
    // If user already has a subscription, update it
    if (subscription?.id) {
      updateSubscription.mutate({
        id: subscription.id,
        data: {
          tier: selectedPlan,
          endDate: endDate.toISOString()
        }
      });
    } else {
      // Otherwise create a new subscription
      createSubscription.mutate({
        userId: parseInt(userId),
        tier: selectedPlan,
        endDate: endDate.toISOString(),
        autoRenew: true
      });
    }
  };
  
  const handleCancel = () => {
    if (subscription?.id) {
      cancelSubscription.mutate(subscription.id);
    }
  };
  
  // Redirect if no user ID is provided
  if (!userId) {
    setLocation('/');
    return null;
  }
  
  // Find current tier details
  const currentTier = subscription?.tier || SubscriptionTier.FREE;
  const currentTierDetails = tiers.find(tier => tier.id === currentTier);
  
  // Handle loading state
  if (isLoadingSubscription) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-40">
              <div className="space-y-2 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Loading subscription details...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground">Choose the plan that works best for you in Tamale, Ghana</p>
      </div>
      
      {/* Current subscription details */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </div>
              <Badge variant={subscription.isActive ? "default" : "destructive"}>
                {subscription.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Plan</p>
                  <p className="text-lg font-bold">{currentTierDetails?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-lg font-bold">{currentTierDetails?.price} GHS/month</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex items-center gap-2">
                    {premiumStatus?.isPremium ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Premium Benefits Active</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Standard Benefits</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Renewal</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {subscription.isActive && (
                <Button 
                  variant="destructive" 
                  onClick={handleCancel} 
                  disabled={cancelSubscription.isPending}
                >
                  {cancelSubscription.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Plan selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Plan</CardTitle>
          <CardDescription>Choose the right plan for your ride-sharing needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs 
              defaultValue={SubscriptionTier.PREMIUM} 
              value={selectedPlan}
              onValueChange={setSelectedPlan}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full h-auto">
                {tiers.map(tier => (
                  <TabsTrigger 
                    key={tier.id} 
                    value={tier.id}
                    className="py-2"
                  >
                    {tier.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tiers.map(tier => (
                <TabsContent key={tier.id} value={tier.id} className="mt-6 space-y-6">
                  <div className={`rounded-lg p-6 ${tier.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-xl">{tier.name} Plan</h3>
                        <p className="text-muted-foreground">{tier.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          {tier.price} <span className="text-lg">GHS</span>
                        </p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Features</span>
                    </h4>
                    
                    <ul className="grid gap-2 mt-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CornerDownRight className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Select Duration</h4>
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant={duration === 1 ? "default" : "outline"} 
                  onClick={() => setDuration(1)}
                >
                  1 Month
                </Button>
                <Button 
                  variant={duration === 6 ? "default" : "outline"} 
                  onClick={() => setDuration(6)}
                >
                  6 Months
                </Button>
                <Button 
                  variant={duration === 12 ? "default" : "outline"} 
                  onClick={() => setDuration(12)}
                >
                  12 Months
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-xl font-bold">
            Total: {tiers.find(t => t.id === selectedPlan)?.price! * duration} GHS
          </div>
          <Button 
            onClick={handleSubscribe}
            disabled={createSubscription.isPending || updateSubscription.isPending}
            className="gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {(createSubscription.isPending || updateSubscription.isPending) ? 
              'Processing...' : 
              subscription?.id ? 'Update Subscription' : 'Subscribe Now'
            }
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Premium Perks</span>
          </CardTitle>
          <CardDescription>Exclusive benefits for premium subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Real-time Driver Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Premium subscribers can track their driver's location in real-time with 
                precise updates and estimated time of arrival.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Priority Matching</h3>
              <p className="text-sm text-muted-foreground">
                Get matched with top-rated drivers faster during peak hours in Tamale.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">Advanced ETA</h3>
              <p className="text-sm text-muted-foreground">
                Precise arrival estimates based on real-time traffic conditions in Tamale.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">24/7 Premium Support</h3>
              <p className="text-sm text-muted-foreground">
                Dedicated customer support with priority response times.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}