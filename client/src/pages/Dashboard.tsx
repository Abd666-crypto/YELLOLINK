import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { StatusCards } from "@/components/dashboard/StatusCard";
import DataFlowBuilder from "@/components/dashboard/DataFlowBuilder";
import RecentProjects from "@/components/dashboard/RecentProjects";
import ApiIntegration from "@/components/dashboard/ApiIntegration";

export default function Dashboard() {
  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:truncate">Dashboard</h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button>
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
            <Button variant="outline" className="ml-3">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 md:px-8">
        {/* Status Cards */}
        <StatusCards />
        
        {/* Data Flow Builder */}
        <DataFlowBuilder />
        
        {/* Recent Projects */}
        <RecentProjects />
        
        {/* API Integration */}
        <ApiIntegration />
      </div>
    </div>
  );
}
