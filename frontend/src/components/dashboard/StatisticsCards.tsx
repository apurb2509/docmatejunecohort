import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const StatisticsCards = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());

  const today = new Date();
  const todayPatients = 24;
  const weekPatients = 156;
  const monthPatients = 678;
  const todayScheduled = 12;
  const weekScheduled = 89;
  const monthScheduled = 345;

  const announcements = [
    "New COVID-19 protocols in effect from Monday",
    "Emergency contact updated: +91-9876543210",
    "Staff meeting scheduled for 3 PM today",
    "New OPD timings: 9 AM - 4 PM",
    "Annual health checkups from July 15"
  ];

  const holidays = [
    new Date(2025, 0, 26),
    new Date(2025, 7, 15),
    new Date(2025, 9, 2),
    new Date(2025, 10, 12),
    new Date(2025, 2, 8)
  ];

  const cardBaseStyle =
    "group transform hover:scale-[1.03] transition-all duration-300 shadow-md hover:shadow-xl border border-blue-200";

  const backgroundStyle = {
    background: "linear-gradient(to bottom right, #2e5ba3, #ffffff20)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Patients Visited */}
      <Card className={cardBaseStyle} style={backgroundStyle}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Patients Visited
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-blue-700">{todayPatients}</div>
              <div className="text-xs text-gray-700">Today</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-green-700">{weekPatients}</div>
              <div className="text-xs text-gray-700">This Week</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-purple-700">{monthPatients}</div>
              <div className="text-xs text-gray-700">This Month</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm" style={{ color: "#21314c" }}>Status</span>
            <Badge className="bg-green-500 text-white">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Appointments */}
      <Card className={cardBaseStyle} style={backgroundStyle}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Scheduled Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-orange-600">{todayScheduled}</div>
              <div className="text-xs text-gray-700">Today</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-blue-600">{weekScheduled}</div>
              <div className="text-xs text-gray-700">This Week</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <div className="text-2xl font-bold text-indigo-600">{monthScheduled}</div>
              <div className="text-xs text-gray-700">This Month</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm" style={{ color: "#21314c" }}>Next Appointment</span>
            <Badge className="bg-blue-500 text-white">N/A</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Office Announcements */}
      <Card className={cardBaseStyle} style={backgroundStyle}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Office Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {announcements.map((announcement, index) => (
              <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-gray-700">{announcement}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm" style={{ color: "#21314c" }}>Front Desk Chat</span>
            <Badge className="bg-purple-500 text-white">3 New</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar & Holidays */}
      <Card className={cardBaseStyle} style={backgroundStyle}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center text-gray-800">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <button onClick={() => setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() - 1)))}>
              ◀️
            </button>
            <div className="text-sm font-semibold text-gray-700">
              {today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            <button onClick={() => setVisibleMonth(new Date(visibleMonth.setMonth(visibleMonth.getMonth() + 1)))}>
              ▶️
            </button>
          </div>
          <div className="w-full rounded-md overflow-hidden border border-blue-300 bg-blue-50 p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md"
              month={visibleMonth}
              fromYear={2020}
              toYear={2030}
              modifiers={{ holiday: holidays, today: today }}
              modifiersStyles={{
                holiday: {
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                },
                today: {
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                },
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "#21314c" }}>Working Days</span>
            <Badge className="bg-green-500 text-white">Mon - Sat</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
