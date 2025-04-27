import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { FaSpider, FaTwitter, FaNewspaper, FaInstagram } from "react-icons/fa";

// Project type status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${getStatusClass()}`}>
      {status}
    </span>
  );
};

// Project icon component
const ProjectIcon = ({ type }: { type: string }) => {
  switch (type.toLowerCase()) {
    case "web scraper":
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600">
          <FaSpider size={16} />
        </div>
      );
    case "social media":
      if (type.includes("twitter")) {
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600">
            <FaTwitter size={16} />
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600">
            <FaInstagram size={16} />
          </div>
        );
      }
    default:
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600">
          <FaNewspaper size={16} />
        </div>
      );
  }
};

export default function RecentProjects() {
  // In a real app, you would fetch this data from the API
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Sample projects if no data is available
  const sampleProjects: Project[] = [
    {
      id: 1,
      name: "E-commerce Product Monitor",
      description: "Tracking prices on multiple sites",
      type: "Web Scraper",
      status: "Active",
      lastRun: new Date(),
      dataPoints: 342871,
      userId: 1
    },
    {
      id: 2,
      name: "Social Media Sentiment",
      description: "Brand mentions analysis",
      type: "Social Media",
      status: "Active",
      lastRun: new Date(),
      dataPoints: 542128,
      userId: 1
    },
    {
      id: 3,
      name: "News Aggregator",
      description: "Industry news collection",
      type: "Web Scraper",
      status: "Paused",
      lastRun: new Date(Date.now() - 86400000), // Yesterday
      dataPoints: 128543,
      userId: 1
    },
    {
      id: 4,
      name: "Instagram Analytics",
      description: "Competitor posts tracking",
      type: "Social Media",
      status: "Error",
      lastRun: new Date(Date.now() - 86400000), // Yesterday
      dataPoints: 87321,
      userId: 1
    }
  ];

  const displayProjects = projects.length > 0 ? projects : sampleProjects;

  // Format the date
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Format data points
  const formatDataPoints = (count: number) => {
    return count.toLocaleString();
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-secondary-900">Recent Projects</h3>
        <Button size="sm">
          <Plus size={16} className="mr-2" />
          New Project
        </Button>
      </div>
      
      <div className="flex flex-col mt-4">
        <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-b border-secondary-200 shadow sm:rounded-lg">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase">Project</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase">Type</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase">Status</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase">Last Run</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-secondary-500 uppercase">Data Points</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {displayProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8">
                            <ProjectIcon type={project.type} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-secondary-900">{project.name}</div>
                            <div className="text-sm text-secondary-500">{project.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-900">{project.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500 whitespace-nowrap">
                        {formatDate(project.lastRun)}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500 whitespace-nowrap">
                        {formatDataPoints(project.dataPoints)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <a href={`/projects/${project.id}/edit`} className="text-primary-600 hover:text-primary-900">Edit</a>
                        <a href={`/projects/${project.id}`} className="ml-3 text-secondary-600 hover:text-secondary-900">View</a>
                        <a href={`/projects/${project.id}/delete`} className="ml-3 text-red-600 hover:text-red-900">Delete</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
