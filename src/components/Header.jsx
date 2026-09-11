import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import api from "../services/api.js";

export default function Header() {
  const location = useLocation();
  const [, setSessionKey] = useState(0);

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
    setSessionKey((prev) => prev + 1);
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <nav className="navbar navbar-expand-lg border-bottom sticky-top">
        <div className="container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
            <img src={logo} alt="FoundMet Logo" className="foundmet-logo" />
            <span className="fw-bold fs-4 foundmet-gradient-text">FoundMet</span>
          </Link>

          {/* Controls on right for mobile: Theme toggle + Nav toggle */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-sm btn-light rounded-circle p-2 border"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              <i className={`bi ${theme === "light" ? "bi-moon-stars-fill text-dark" : "bi-sun-fill text-warning"}`}></i>
            </button>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#foundmetNavbar"
              aria-controls="foundmetNavbar"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="collapse navbar-collapse" id="foundmetNavbar">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 ${isActive("/") ? "active fw-bold text-primary" : ""}`}
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 ${isActive("/explore") ? "active fw-bold text-primary" : ""}`}
                  to="/explore"
                >
                  Explore Feed
                </Link>
              </li>
              {currentUser && (
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 ${isActive("/dashboard") ? "active fw-bold text-primary" : ""}`}
                    to="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>

            {/* Right Side Controls */}
            <div className="d-flex align-items-center flex-column flex-lg-row gap-2">
              {/* Desktop Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="btn btn-sm btn-light rounded-circle p-2 border d-none d-lg-flex align-items-center justify-content-center me-1"
                style={{ width: "36px", height: "36px" }}
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                <i className={`bi ${theme === "light" ? "bi-moon-stars-fill text-dark" : "bi-sun-fill text-warning"}`}></i>
              </button>

              <Link
                to="/superadmin"
                className={`btn btn-sm rounded-pill px-3 ${isActive("/superadmin") ? "btn-dark" : "btn-outline-dark"}`}
              >
                Superadmin
              </Link>

              {currentUser ? (
                <div className="d-flex align-items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="d-flex align-items-center gap-2 text-decoration-none p-1 rounded-pill pe-3 border hover-bg-light"
                  >
                    <img
                      src={
                        currentUser.photo ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          currentUser.name || "User"
                        )}&background=0B5CFF&color=fff`
                      }
                      alt={currentUser.name}
                      className="rounded-circle border"
                      style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                    <span className="fw-semibold text-main small">{currentUser.name?.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm px-3 rounded-pill"
                    title="Log out"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-foundmet btn-sm rounded-pill px-3 fw-bold">
                    Join Free
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