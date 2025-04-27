import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ApiIntegration() {
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:truncate">API Integration</h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button>
              <Plus size={16} className="mr-2" />
              New API Key
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 md:px-8">
        <div className="p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h3 className="text-lg font-medium text-secondary-900">API Integration</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Manage API keys and integrate with external systems.
            </p>
            <div className="mt-6">
              <Button>
                <Plus size={16} className="mr-2" />
                Create API Key
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
