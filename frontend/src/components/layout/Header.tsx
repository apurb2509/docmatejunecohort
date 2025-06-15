import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useClerk, useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/context/UserProfileContext";

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displaySpecialization, setDisplaySpecialization] = useState('');

  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { profile } = useUserProfile();

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();

      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      });

      const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });

      setCurrentTime(timeFormatter.format(now));
      setCurrentDate(dateFormatter.format(now));
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load localStorage profile
  useEffect(() => {
    if (user) {
      const userId = user.id;
      const prefix = `user_${userId}`;
      const isInitialized = localStorage.getItem(`${prefix}_initialized`);

      if (isInitialized) {
        const storedName = localStorage.getItem(`${prefix}_fullName`) || "";
        const storedSpecialization = localStorage.getItem(`${prefix}_specialization`) || "";
        setDisplayName(storedName);
        setDisplaySpecialization(storedSpecialization);
      } else {
        setDisplayName(user.fullName || "Dr. Unknown");
        setDisplaySpecialization(profile.specialization || "Cardiology");
      }
    }
  }, [user, profile]);

  const handleLogoutClick = async () => {
    try {
      localStorage.removeItem("docmate_auth");
      await signOut();
      onLogout();
      navigate("/login");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  const handleProfileSettingsClick = () => {
    navigate("/settings");
  };

  const initials = (displayName || "DocMate")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600 backdrop-blur-lg">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">DocMate</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Online</span>
          </div>
          <div className="text-sm hidden md:block text-gray-400">
            Metro General Hospital • {displaySpecialization || "Cardiology"}
          </div>
        </div>

        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="text-right hidden sm:block">
            <div className="text-white font-mono text-sm sm:text-base">{currentTime}</div>
            <div className="text-xs text-gray-400">{currentDate}</div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden md:block">
              <div className="text-white font-semibold">{displayName || "Dr. Unknown"}</div>
              <div className="text-xs text-gray-400">{displaySpecialization || "Cardiologist"}</div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center hover:opacity-80 shadow-lg"
                >
                  <span className="text-white font-semibold">{initials}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                  onClick={handleProfileSettingsClick}
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  onClick={handleLogoutClick}
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
