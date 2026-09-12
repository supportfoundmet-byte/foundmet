import { useState } from "react";
import { Link } from "react-router-dom";

const dashboardItems = [
  { key: "overview", label: "Overview", icon: "bi-speedometer2" },
  { key: "posts", label: "Posts", icon: "bi-pencil-square", countKey: "posts" },
  {
    key: "connections",
    label: "Connections",
    icon: "bi-people",
    countKey: "connections",
  },
  { key: "messages", label: "Messages / Chat", icon: "bi-chat-dots-fill" },
  { key: "projects", label: "My Project", icon: "bi-rocket-takeoff" },
  {
    key: "ideas",
    label: "Startup Ideas",
    icon: "bi-lightbulb",
    countKey: "ideas",
  },
  {
    key: "notifications",
    label: "Alerts",
    icon: "bi-bell",
    countKey: "notifications",
  },
  { key: "settings", label: "Settings", icon: "bi-gear" },
];

export default function DashboardSidebar({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  counts,
}) {
  // Controls whether the menu is expanded on small screens (< lg breakpoint)
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = dashboardItems.find((item) => item.key === activeTab);

  const handleTabChange = (key) => {
    onTabChange(key);
    setMobileOpen(false); // auto-collapse after picking a section on mobile
  };

  return (
    <div className="col-12 col-lg-3 col-xl-2">
      <div
        className="dashboard-sidebar card foundmet-card border-0 shadow-sm p-3 sticky-top bg-white"
        style={{ top: "85px", zIndex: 1020 }}
      >
        {/* Profile block */}
        <div className="text-center pb-3 border-bottom mb-3">
          <img
            src={
              currentUser.photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.name || "Founder",
              )}&background=0B5CFF&color=fff&size=100`
            }
            alt={currentUser.name}
            className="rounded-circle border mb-2 shadow-xs"
            style={{ width: "64px", height: "64px", objectFit: "cover" }}
          />
          <h6 className="fw-bold mb-0 text-main">{currentUser.name}</h6>
          <span className="badge bg-primary text-white text-capitalize mt-1">
            {currentUser.role === "co-founder" ? "Co-Founder" : "Founder"}
          </span>
          <small className="text-secondary d-block mt-1">
            <i className="bi bi-geo-alt me-1"></i>
            {currentUser.address || "Bangalore, India"}
          </small>
        </div>

        {/* Mobile-only toggle bar: shows the active section and expands/collapses the menu */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="btn btn-light d-flex d-lg-none align-items-center justify-content-between w-100 px-3 py-2 rounded-3 border mb-2"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-menu-collapse"
        >
          <span className="d-flex align-items-center gap-2 fw-semibold text-main">
            <i className={`bi ${activeItem?.icon || "bi-list"}`}></i>
            {activeItem?.label || "Menu"}
          </span>
          <i className={`bi ${mobileOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
        </button>

        {/* Menu: always visible on lg+, collapsible on mobile */}
        <nav
          id="dashboard-menu-collapse"
          className={`dashboard-menu nav flex-column gap-1 ${
            mobileOpen ? "d-flex" : "d-none"
          } d-lg-flex`}
          aria-label="Dashboard sections"
        >
          {dashboardItems.map((item) => {
            const count =
              item.countKey === "notifications"
                ? counts.notifications
                : counts[item.countKey];

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 border-0 ${
                  activeTab === item.key
                    ? "btn-primary text-white fw-bold"
                    : "btn-light text-secondary"
                }`}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${item.icon}`}></i>
                  <span className="small">{item.label}</span>
                </div>
                {item.countKey && (
                  <span
                    className={`badge rounded-pill ${
                      activeTab === item.key
                        ? "bg-white text-primary"
                        : "bg-primary text-white"
                    }`}
                    style={{ fontSize: "10px" }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <hr className="my-2" />

          <Link
            to="/explore"
            onClick={() => setMobileOpen(false)}
            className="btn btn-light text-start text-primary fw-semibold px-3 py-2 rounded-3 small"
          >
            <i className="bi bi-compass me-2"></i>
            Explore Feed
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="btn btn-outline-danger text-start px-3 py-2 rounded-3 mt-2 small"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Log Out
          </button>
        </nav>
      </div>
    </div>
  );
}