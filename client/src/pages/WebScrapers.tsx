import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WebScrapers() {
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:truncate">Web Scrapers</h2>
          </div>
          <div className="flex mt-4 md:mt-0 md:ml-4">
            <Button>
              <Plus size={16} className="mr-2" />
              New Scraper
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto mt-8 max-w-7xl sm:px-6 md:px-8">
        <div className="p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h3 className="text-lg font-medium text-secondary-900">Web Scraper Configuration</h3>
            <p className="mt-1 text-sm text-secondary-500">
              Configure and manage your web scrapers to collect data from websites.
            </p>
            <div className="mt-6">
              <Button>
                <Plus size={16} className="mr-2" />
                Create Your First Scraper
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
