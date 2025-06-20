import { useEffect, useState } from "react";
import StatisticsCards from "./StatisticsCards";
import ActivityFeed from "./ActivityFeed";
import ScheduleTimeline from "./ScheduleTimeline";
import { useUser } from "@clerk/clerk-react";
import { useUserProfile } from "@/context/UserProfileContext";

const DashboardOverview = () => {
  const { user } = useUser();
  const { profile } = useUserProfile();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (user) {
      const userId = user.id;
      const prefix = `user_${userId}`;
      const isInitialized = localStorage.getItem(`${prefix}_initialized`);
      if (isInitialized) {
        const storedName = localStorage.getItem(`${prefix}_fullName`) || "";
        setDisplayName(storedName);
      } else {
        setDisplayName(user.fullName || "Dr. Unknown");
      }
    }
  }, [user, profile]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-400 border-opacity-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {displayName || "Dr. Unknown"}
            </h1>
            <p className="text-gray-300">
              Today is{" "}
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">No active schedule</div>
            <div className="text-sm text-gray-400">
              New appointments will be notified here.
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Schedule Timeline */}
        <div>
          <ScheduleTimeline />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
