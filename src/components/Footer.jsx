
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";

export default function Footer() {
  const reportIssueUrl =
    "https://docs.google.com/forms/d/e/1FAIpQLScJfFBWQqfyek-Y_y9Ai42mLKRtPRu7G5nX2ppi2xn_XzLXOA/viewform?usp=publish-editor";

  return (
    <footer className="mt-auto py-5 bg-white border-top site-footer">
      <div className="container">
        <div className="row g-4">
          {/* Brand & Description */}
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img
                src={logo}
                alt="FoundMet Logo"
                className="rounded"
                style={{
                  width: "42px",
                  height: "42px",
                  objectFit: "contain",
                }}
              />

              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold fs-5 text-main">FoundMet</span>
                <span className="text-secondary">•</span>
                <span className="text-secondary">
                  Built for people who build.
                </span>
              </div>
            </div>

            <p className="text-secondary small mb-2">
              FoundMet helps people discover like-minded builders, founders and
              professionals to create meaningful teams and turn ideas into
              reality.
            </p>

            <address
              className="mb-0 text-secondary small"
              style={{ fontStyle: "normal" }}
            >
              🇮🇳 India · Connecting people within 50–80 km
            </address>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold text-main mb-3">Quick Links</h6>

            <nav
              className="d-flex flex-column gap-2"
              aria-label="Footer navigation"
            >
              <Link to="/" className="text-secondary text-decoration-none">
                Home
              </Link>

              <Link
                to="/explore"
                className="text-secondary text-decoration-none"
              >
                Explore
              </Link>

              <Link
                to="/dashboard"
                className="text-secondary text-decoration-none"
              >
                Dashboard
              </Link>

              <Link
                to="/login"
                className="text-secondary text-decoration-none"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="text-secondary text-decoration-none"
              >
                Join FoundMet
              </Link>
            </nav>
          </div>

          {/* Legal & Support */}
          <div className="col-6 col-md-4">
            <h6 className="fw-bold text-main mb-3">Support & Legal</h6>

            <nav
              className="d-flex flex-column gap-2"
              aria-label="Support and legal"
            >
              <Link
                to="/terms"
                className="text-secondary text-decoration-none"
              >
                Terms & Conditions
              </Link>

              <Link
                to="/privacy"
                className="text-secondary text-decoration-none"
              >
                Privacy Policy
              </Link>

              <Link
                to="/cookies"
                className="text-secondary text-decoration-none"
              >
                Cookie Policy
              </Link>

              {/* Report Bug */}
              <a
                href={reportIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-danger text-decoration-none fw-semibold"
              >
                <i className="bi bi-bug me-2"></i>
                Report an Issue / Bug
              </a>

              {/* Email */}
              <a
                href="mailto:supportfoundmet@gmail.com"
                className="text-secondary text-decoration-none"
              >
                <i className="bi bi-envelope me-2"></i>
                supportfoundmet@gmail.com
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <hr className="my-4 opacity-25" />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-secondary small">
          <span>
            © {new Date().getFullYear()} FoundMet. All rights reserved.
          </span>

          <span>
            Have a problem?{" "}
            <a
              href={reportIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-none fw-semibold"
            >
              Tell us about it →
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

