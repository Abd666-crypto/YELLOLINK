import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// YeloLink Ride-Sharing Pages
import Home from "@/pages/Home";
import RiderRequest from "@/pages/RiderRequest";
import RiderStatus from "@/pages/RiderStatus";
import DriverRegister from "@/pages/DriverRegister";
import DriverDashboard from "@/pages/DriverDashboard";
import Subscription from "@/pages/Subscription";

// Import previous data analytics pages (will be legacy pages)
import Dashboard from "@/pages/Dashboard";
import WebScrapers from "@/pages/WebScrapers";
import SocialMedia from "@/pages/SocialMedia";
import DataStorage from "@/pages/DataStorage";
import ApiIntegration from "@/pages/ApiIntegration";
import Automation from "@/pages/Automation";
import Analytics from "@/pages/Analytics";

// Import layout components 
import YeloHeader from "@/components/layout/YeloHeader";

function Router() {
  return (
    <Switch>
      {/* YeloLink Main Pages */}
      <Route path="/" component={Home} />
      <Route path="/rider-request" component={RiderRequest} />
      <Route path="/rider-status" component={RiderStatus} />
      <Route path="/driver-register" component={DriverRegister} />
      <Route path="/driver-dashboard" component={DriverDashboard} />
      <Route path="/subscription/:userId" component={Subscription} />
      
      {/* Legacy Data Analytics Pages */}
      <Route path="/legacy/dashboard" component={Dashboard} />
      <Route path="/legacy/web-scrapers" component={WebScrapers} />
      <Route path="/legacy/social-media" component={SocialMedia} />
      <Route path="/legacy/data-storage" component={DataStorage} />
      <Route path="/legacy/api-integration" component={ApiIntegration} />
      <Route path="/legacy/automation" component={Automation} />
      <Route path="/legacy/analytics" component={Analytics} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <YeloHeader />
          
          {/* Main content */}
          <main className="min-h-[calc(100vh-4rem)]">
            <Router />
          </main>
          
          {/* Footer */}
          <footer className="py-6 border-t">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} YeloLink - Ride-Sharing for Tamale
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
