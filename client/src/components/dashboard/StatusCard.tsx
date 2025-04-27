import { cn } from "@/lib/utils";
import { 
  Worm, 
  Database, 
  Code, 
  HardDrive,
  LucideIcon 
} from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  linkText: string;
  linkHref: string;
}

export default function StatusCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  linkText,
  linkHref
}: StatusCardProps) {
  return (
    <div className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-md",
              iconBgColor,
              iconColor
            )}>
              {icon}
            </div>
          </div>
          <div className="flex-1 w-0 ml-5">
            <dl>
              <dt className="text-sm font-medium truncate text-secondary-500">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-secondary-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-secondary-50">
        <div className="text-sm">
          <a href={linkHref} className="font-medium text-primary-600 hover:text-primary-900">
            {linkText} &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export function StatusCards() {
  return (
    <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
      <StatusCard
        title="Active Scrapers"
        value="12"
        icon={<Worm size={24} />}
        iconBgColor="bg-primary-50"
        iconColor="text-primary-600"
        linkText="View all"
        linkHref="/web-scrapers"
      />
      
      <StatusCard
        title="Data Points Collected"
        value="1.2M"
        icon={<Database size={24} />}
        iconBgColor="bg-green-50"
        iconColor="text-green-600"
        linkText="View details"
        linkHref="/data-storage"
      />
      
      <StatusCard
        title="API Usage"
        value="87%"
        icon={<Code size={24} />}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-600"
        linkText="View usage"
        linkHref="/api-integration"
      />
      
      <StatusCard
        title="Storage Used"
        value="42.8 GB"
        icon={<HardDrive size={24} />}
        iconBgColor="bg-purple-50"
        iconColor="text-purple-600"
        linkText="Upgrade plan"
        linkHref="/upgrade"
      />
    </div>
  );
}
