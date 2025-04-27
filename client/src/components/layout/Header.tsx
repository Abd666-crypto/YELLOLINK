import { useState } from "react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <div className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
      <Button 
        variant="ghost" 
        size="icon" 
        className="px-4 text-secondary-500 border-r border-secondary-200 focus:outline-none focus:bg-secondary-100 focus:text-secondary-600 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
      <div className="flex justify-between flex-1 px-4">
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="text-secondary-400" size={18} />
              </div>
              <Input 
                className="block w-full h-full py-2 pl-10 pr-3 text-sm placeholder-secondary-500 bg-secondary-50 border border-secondary-300 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Search data sources, scrapers..." 
              />
            </div>
          </div>
        </div>
        <div className="flex items-center ml-4 md:ml-6">
          <Button variant="ghost" size="icon" className="p-1 text-secondary-400 rounded-full hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Bell size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="p-1 ml-3 text-secondary-400 rounded-full hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <Settings size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
