import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/" },
    { id: "patients", label: "Patient Management", icon: "🧑‍⚕️", path: "/patients" },
    { id: "prescriptions", label: "AI Prescriptions", icon: "💊", path: "/prescriptions" },
    { id: "analytics", label: "Analytics", icon: "📊", path: "/analytics" },
    { id: "settings", label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const sidebarStyle: React.CSSProperties = {
    width: isCollapsed ? "64px" : "240px",
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #1E293B, #3B82F6)", // Lighter navy gradient
    color: "#fff",
    borderRight: `1px solid rgba(255,255,255,0.1)`,
    transition: "width 0.3s ease",
    display: "flex",
    flexDirection: "column",
  };

  const headerStyle: React.CSSProperties = {
    padding: "16px",
    borderBottom: `1px solid rgba(255,255,255,0.1)`,
    display: "flex",
    justifyContent: isCollapsed ? "center" : "space-between",
    alignItems: "center",
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: "8px",
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    width: "100%",
    border: "none",
    background: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
    color: "#fff",
    padding: "10px 12px",
    marginBottom: "6px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "normal", // Do not bold on active
    transition: "background 0.2s ease, color 0.2s ease",
  });

  const hoverStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  };

  return (
    <div style={sidebarStyle}>
      {/* Collapse Toggle */}
      <div style={headerStyle}>
        {!isCollapsed && (
          <h2 style={{ fontSize: "16px", color: "#e0e0e0", fontWeight: 600 }}>Menu</h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#ffffff",
          }}
        >
          ☰
        </button>
      </div>

      {/* Navigation */}
      <div style={navStyle}>
        {navigationItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.id === "dashboard" && location.pathname === "/");

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              style={buttonStyle(isActive)}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  hoverStyle.backgroundColor;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = isActive
                  ? "rgba(255, 255, 255, 0.15)"
                  : "transparent";
              }}
            >
              <span style={{ marginRight: isCollapsed ? "0" : "12px" }}>
                {item.icon}
              </span>
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
