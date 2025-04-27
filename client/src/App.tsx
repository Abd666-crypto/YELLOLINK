import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import WebScrapers from "@/pages/WebScrapers";
import SocialMedia from "@/pages/SocialMedia";
import DataStorage from "@/pages/DataStorage";
import ApiIntegration from "@/pages/ApiIntegration";
import Automation from "@/pages/Automation";
import Analytics from "@/pages/Analytics";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/web-scrapers" component={WebScrapers} />
      <Route path="/social-media" component={SocialMedia} />
      <Route path="/data-storage" component={DataStorage} />
      <Route path="/api-integration" component={ApiIntegration} />
      <Route path="/automation" component={Automation} />
      <Route path="/analytics" component={Analytics} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - always visible on desktop, toggleable on mobile */}
          <div className={`${sidebarVisible ? "block" : "hidden"} md:block`}>
            <Sidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            
            {/* Main content */}
            <main className="relative flex-1 overflow-y-auto focus:outline-none">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
