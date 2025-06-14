import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();

      // Use Intl.DateTimeFormat to get accurate IST time
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
      });

      const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      });

      setCurrentTime(timeFormatter.format(now));
      setCurrentDate(dateFormatter.format(now));
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkTheme]);

  const handleLogout = () => {
    localStorage.removeItem('docmate_auth');
    window.location.reload();
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <header
      className={`h-16 border-b shadow-lg ${
        isDarkTheme
          ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600'
          : 'bg-gradient-to-r from-cream-50 to-cream-100 border-cream-200'
      } backdrop-blur-lg`}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo & Branding */}
        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>DocMate</h1>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>Online</span>
          </div>

          <div className={`text-sm hidden md:block ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            Metro General Hospital • Cardiology
          </div>
        </div>

        {/* User & System Section */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {isDarkTheme ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </Button>

          {/* Real-time IST Clock & Date */}
          <div className="text-right hidden sm:block">
            <div className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-mono text-sm sm:text-base`}>
              {currentTime}
            </div>
            <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
              {currentDate}
            </div>
          </div>

          {/* Doctor Profile with Dropdown */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className={`${isDarkTheme ? 'text-white' : 'text-gray-800'} font-semibold`}>Dr. Sarah Chen</div>
              <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Cardiologist</div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center hover:opacity-80 shadow-lg"
                >
                  <span className="text-white font-semibold">SC</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <DropdownMenuItem className={`${isDarkTheme ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className={`${isDarkTheme ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}>
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`text-red-400 hover:text-red-300 ${isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;