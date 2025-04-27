import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Worm,
  Hash,
  Database,
  Code,
  Bot,
  PieChart,
  Plus,
  BarChart3
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const SidebarLink = ({ href, icon, children, active }: SidebarLinkProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
          active
            ? "bg-primary-50 text-primary-600"
            : "text-secondary-600 hover:bg-secondary-50 hover:text-secondary-800"
        )}
      >
        <span className={cn("mr-3", active ? "text-primary-500" : "text-secondary-400")}>
          {icon}
        </span>
        {children}
      </a>
    </Link>
  );
};

interface DataSourceLinkProps {
  href: string;
  color: string;
  children: React.ReactNode;
}

const DataSourceLink = ({ href, color, children }: DataSourceLinkProps) => {
  return (
    <Link href={href}>
      <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-secondary-600 hover:bg-secondary-50 hover:text-secondary-800 group">
        <span className={`w-2 h-2 mr-3 ${color} rounded-full`}></span>
        {children}
      </a>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-secondary-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
          <h1 className="text-xl font-bold text-primary-600">DataScrape Hub</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            <SidebarLink href="/" icon={<BarChart3 size={18} />} active={location === "/"}>
              Dashboard
            </SidebarLink>
            <SidebarLink href="/web-scrapers" icon={<Worm size={18} />} active={location === "/web-scrapers"}>
              Web Scrapers
            </SidebarLink>
            <SidebarLink href="/social-media" icon={<Hash size={18} />} active={location === "/social-media"}>
              Social Media
            </SidebarLink>
            <SidebarLink href="/data-storage" icon={<Database size={18} />} active={location === "/data-storage"}>
              Data Storage
            </SidebarLink>
            <SidebarLink href="/api-integration" icon={<Code size={18} />} active={location === "/api-integration"}>
              API Integration
            </SidebarLink>
            <SidebarLink href="/automation" icon={<Bot size={18} />} active={location === "/automation"}>
              Automation
            </SidebarLink>
            <SidebarLink href="/analytics" icon={<PieChart size={18} />} active={location === "/analytics"}>
              Analytics
            </SidebarLink>
            
            <div className="pt-4 mt-4 border-t border-secondary-200">
              <h3 className="px-3 text-xs font-semibold tracking-wider text-secondary-500 uppercase">Data Sources</h3>
              <div className="mt-2 space-y-1">
                <DataSourceLink href="/data-sources/ecommerce" color="bg-green-500">
                  E-commerce Sites
                </DataSourceLink>
                <DataSourceLink href="/data-sources/social" color="bg-blue-500">
                  Social Networks
                </DataSourceLink>
                <DataSourceLink href="/data-sources/news" color="bg-yellow-500">
                  News Portals
                </DataSourceLink>
                <Link href="/add-source">
                  <a className="flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:bg-secondary-50 hover:text-primary-700 group">
                    <Plus size={18} className="mr-3 text-primary-500" />
                    Add New Source
                  </a>
                </Link>
              </div>
            </div>
          </nav>
        </div>
        <div className="p-4 border-t border-secondary-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold">
                AM
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-secondary-800">Alex Morgan</p>
              <p className="text-xs text-secondary-500">Data Analyst</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
