import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import api from "../services/api.js";

export default function Header() {
  const location = useLocation();
  const [, setSessionKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dark Mode state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("foundmet_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  // Close the mobile menu automatically whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("foundmet_theme", nextTheme);
    document.documentElement.setAttribute("data-bs-theme", nextTheme);
    if (nextTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("foundmet_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("foundmet_user");
    sessionStorage.removeItem("foundmet_access_token");
    setSessionKey((prev) => prev + 1);
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  const ThemeToggleButton = ({ className = "", style }) => (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn btn-light rounded-circle border d-flex align-items-center justify-content-center ${className}`}
      style={{ width: "36px", height: "36px", flexShrink: 0, ...style }}
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <i
        className={`bi ${
          theme === "light"
            ? "bi-moon-stars-fill text-dark"
            : "bi-sun-fill text-warning"
        }`}
      ></i>
    </button>
  );

  return (
    <header>
      <nav className="navbar navbar-expand-lg border-bottom sticky-top bg-body">
        <div className="container">
          {/* Brand Logo */}
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <img src={logo} alt="FoundMet Logo" className="foundmet-logo" />
            <span className="fw-bold fs-4 foundmet-gradient-text">
              FoundMet
            </span>
          </Link>

          {/* Controls on right for mobile: Theme toggle + Nav toggle */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <ThemeToggleButton />
            <button
              className={`navbar-toggler ${menuOpen ? "" : "collapsed"}`}
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-controls="foundmetNavbar"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className={`navbar-collapse ${menuOpen ? "show" : "collapse"}`}
            id="foundmetNavbar"
          >
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1 gap-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-2 rounded-3 ${
                    isActive("/")
                      ? "active fw-bold text-primary bg-primary bg-opacity-10"
                      : ""
                  }`}
                  to="/"
                  aria-current={isActive("/") ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-2 rounded-3 ${
                    isActive("/explore")
                      ? "active fw-bold text-primary bg-primary bg-opacity-10"
                      : ""
                  }`}
                  to="/explore"
                  aria-current={isActive("/explore") ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  Explore Feed
                </Link>
              </li>
              
              {currentUser && (
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 py-2 rounded-3 ${
                      isActive("/dashboard")
                        ? "active fw-bold text-primary bg-primary bg-opacity-10"
                        : ""
                    }`}
                    to="/dashboard"
                    aria-current={isActive("/dashboard") ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            <hr className="d-lg-none my-2 opacity-25" />

            {/* Right Side Controls */}
            <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 pb-2 pb-lg-0">
              {/* Desktop Theme Toggle */}
              <ThemeToggleButton className="d-none d-lg-flex me-1" />

              {currentUser ? (
                <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="d-flex align-items-center gap-2 text-decoration-none p-1 rounded-pill pe-3 border hover-bg-light"
                  >
                    <img
                      src={
                        currentUser.photo ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentUser.name || "User",
                        )}&background=0B5CFF&color=fff`
                      }
                      alt={currentUser.name}
                      className="rounded-circle border"
                      style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                      }}
                    />
                    <span className="fw-semibold text-main small">
                      {currentUser.name?.split(" ")[0]}
                    </span>
                  </Link>
                  <div className="d-flex align-items-center justify-content-between justify-content-lg-start gap-2">
                    <Link
                      to="/superadmin"
                      onClick={() => setMenuOpen(false)}
                      className={`small text-decoration-none ${
                        isActive("/superadmin")
                          ? "fw-bold text-primary"
                          : "text-muted"
                      }`}
                    >
                      Superadmin
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                      title="Log out"
                    >
                      <i className="bi bi-box-arrow-right me-1"></i>
                      <span className="d-lg-none">Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-foundmet btn-sm rounded-pill px-3 fw-bold"
                  >
                    Join Free
                  </Link>
                  <Link
                    to="/superadmin"
                    onClick={() => setMenuOpen(false)}
                    className={`small text-decoration-none text-center ${
                      isActive("/superadmin")
                        ? "fw-bold text-primary"
                        : "text-muted"
                    }`}
                  >
                    Superadmin
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
