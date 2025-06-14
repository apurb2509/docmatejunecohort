
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "home", badge: null, path: "/" },
    { id: "patients", label: "Patient Management", icon: "users", badge: "5", path: "/patients" },
    { id: "prescriptions", label: "AI Prescriptions", icon: "pills", badge: "3", path: "/prescriptions" },
    { id: "analytics", label: "Analytics", icon: "chart", badge: "new", path: "/analytics" },
    { id: "settings", label: "Settings", icon: "settings", badge: "1", path: "/settings" },
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      pills: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
      chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    };
    return icons[iconName as keyof typeof icons] || icons.home;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div 
      className={`${isCollapsed ? 'w-16' : 'w-64'} dark:bg-gradient-to-b dark:from-gray-900 dark:to-black dark:border-gray-700 light:bg-gradient-to-b light:from-cream-100 light:to-cream-200 light:border-cream-300 border-r transition-all duration-300 flex flex-col`}
    >
      {/* Collapse Toggle */}
      <div className="p-4 border-b dark:border-gray-700 light:border-cream-300">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="dark:text-gray-400 dark:hover:text-cyan-300 light:text-gray-600 light:hover:text-blue-600 hover:scale-110 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => handleNavigation(item.path)}
            className={`w-full justify-start relative group hover:scale-105 transition-all duration-200 ${
              location.pathname === item.path
                ? 'dark:bg-gradient-to-r dark:from-cyan-500 dark:from-opacity-20 dark:to-transparent dark:text-cyan-300 dark:border-l-2 dark:border-cyan-400 light:bg-gradient-to-r light:from-blue-500 light:from-opacity-20 light:to-transparent light:text-blue-600 light:border-l-2 light:border-blue-500'
                : 'dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 light:text-gray-600 light:hover:text-gray-800 light:hover:bg-cream-200'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {getIcon(item.icon)}
            </svg>
            {!isCollapsed && (
              <>
                <span className="ml-3 flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.badge === "new" 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {isCollapsed && item.badge && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </Button>
        ))}
      </nav>

      {/* Status Panel */}
      {!isCollapsed && (
        <div className="p-4 border-t dark:border-gray-700 light:border-cream-300">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-400 light:text-gray-600">AI System</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-400">Active</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-400 light:text-gray-600">Prescription AI</span>
              <span className="dark:text-cyan-400 light:text-blue-600">Ready</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-400 light:text-gray-600">System Load</span>
              <span className="dark:text-blue-400 light:text-blue-600">Normal</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
