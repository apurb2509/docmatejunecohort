// ...[imports stay unchanged]
import { useEffect, useState, useRef } from "react";
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
import { Search, X, ArrowUp, ArrowDown } from "lucide-react";
import docmateLogo from "@/components/logo/docmate_logo.png";

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [displaySpecialization, setDisplaySpecialization] = useState("");
  const [serverStatus, setServerStatus] = useState<"online" | "offline">("offline");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [matches, setMatches] = useState<Element[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { profile } = useUserProfile();

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      });
      const dateFormatter = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
      setCurrentTime(timeFormatter.format(now));
      setCurrentDate(dateFormatter.format(now));
    };

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      } catch {
        setServerStatus("offline");
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const clearHighlights = () => {
    document.querySelectorAll(".highlighted-search").forEach((el) =>
      el.classList.remove("highlighted-search")
    );
    setMatches([]);
    setCurrentMatchIndex(0);
    setSearchPerformed(false);
  };

  const handleSearch = () => {
    clearHighlights();
    const query = searchQuery.trim();
    if (!query) return;

    const updatedHistory = [...new Set([query, ...searchHistory])].slice(0, 5);
    setSearchHistory(updatedHistory);

    const regex = new RegExp(query, "gi");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const found: Element[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (
        node.nodeValue &&
        regex.test(node.nodeValue) &&
        node.parentElement &&
        node.parentElement.tagName !== "SCRIPT"
      ) {
        node.parentElement.classList.add("highlighted-search");
        found.push(node.parentElement);
      }
    }
    setMatches(found);
    setCurrentMatchIndex(0);
    setSearchPerformed(true);
    if (found.length > 0) {
      found[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleHistoryDelete = (item: string) => {
    setSearchHistory((prev) => prev.filter((entry) => entry !== item));
  };

  const handleArrow = (direction: "up" | "down") => {
    if (matches.length === 0) return;
    const newIndex =
      direction === "up"
        ? (currentMatchIndex - 1 + matches.length) % matches.length
        : (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(newIndex);
    matches[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const initials = (displayName || "DocMate")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 h-16 border-b shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600 backdrop-blur-lg">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img
              src={docmateLogo}
              alt="DocMate Logo"
              className="w-12 h-12 rounded-lg mr-3 shadow-lg object-cover"
            />
            <div className="flex flex-col leading-tight">
              <h1 className="text-3xl font-bold text-white">DocMate</h1>
              <span className="text-[13px] text-gray-300 -mt-1">The Doctor&apos;s Ally</span>
            </div>
          </div>
          <div className="text-sm text-white ml-4 font-semibold">N6T Technologies</div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 px-10 relative">
          <div className="relative w-full max-w-md mx-auto">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onFocus={() => {
                setShowHistory(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowHistory(false);
                  clearHighlights();
                }, 200);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-10 py-2 rounded-full bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-500 w-5 h-5 cursor-pointer"
              onClick={handleSearch}
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-2.5 text-gray-500 w-5 h-5 cursor-pointer"
                onClick={() => {
                  setSearchQuery("");
                  clearHighlights();
                }}
              />
            )}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto z-50">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    className="flex justify-between items-center px-3 py-1 hover:bg-gray-200"
                  >
                    <span
                      className="cursor-pointer w-full"
                      onClick={() => {
                        setSearchQuery(item);
                        handleSearch();
                      }}
                    >
                      {item}
                    </span>
                    <X
                      className="w-4 h-4 text-gray-500 cursor-pointer ml-2"
                      onClick={() => handleHistoryDelete(item)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchPerformed && matches.length > 1 && (
            <div className="absolute top-full mt-2 flex space-x-2 justify-center w-full text-white z-40">
              <button
                onClick={() => handleArrow("up")}
                className="bg-blue-600 p-1 rounded-full"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleArrow("down")}
                className="bg-blue-600 p-1 rounded-full"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 pr-4">
          <div className="text-right hidden sm:block mr-3">
            <div className="text-white font-mono text-sm sm:text-base">{currentTime}</div>
            <div className="text-xs text-gray-400">{currentDate}</div>
          </div>

          {/* ✅ Dynamic Display Name & Specialization */}
          <div className="text-right hidden md:block">
            <div className="text-white font-semibold">{displayName || "Dr. Unknown"}</div>
            <div className="text-xs text-gray-400">{displaySpecialization || "Cardiology"}</div>
          </div>

          <div className="relative pr-2">
            <div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                serverStatus === "online" ? "bg-green-400 animate-pulse" : "bg-red-500 animate-pulse"
              }`}
              title={serverStatus === "online" ? "Server Online" : "Server Breakdown"}
            ></div>
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
      <style>
        {`
        .highlighted-search {
          background-color: yellow;
          border-radius: 3px;
          padding: 0 2px;
          transition: background-color 0.3s;
        }
      `}
      </style>
    </header>
  );
};

export default Header;
