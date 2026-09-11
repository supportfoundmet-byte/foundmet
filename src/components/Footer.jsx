import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto py-4 bg-white border-top site-footer">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary small">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-main">FoundMet</span>
            <span>•</span>
            <span>Built for people who build.</span>
          </div>
          <address className="mb-0 mt-1" style={{ fontStyle: "normal" }}>
            India · Matching founders within 50–80 km
          </address>
        </div>
        <nav className="d-flex flex-wrap align-items-center gap-3" aria-label="Footer">
          <Link to="/explore" className="text-secondary text-decoration-none">Explore</Link>
          <Link to="/terms" className="text-secondary text-decoration-none">Terms</Link>
          <Link to="/privacy" className="text-secondary text-decoration-none">Privacy</Link>
          <Link to="/cookies" className="text-secondary text-decoration-none">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
