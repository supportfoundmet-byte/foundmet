import { Link } from "react-router-dom";

export function DashboardToast({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      className="dashboard-toast position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-4 shadow-lg d-flex align-items-center gap-3 animate-fade-in"
      style={{ zIndex: 1065 }}
    >
      <i className="bi bi-info-circle-fill text-primary fs-5"></i>
      <span className="small fw-semibold">{message}</span>
      <button
        type="button"
        className="btn-close btn-close-white ms-auto"
        onClick={onClose}
      ></button>
    </div>
  );
}

export function DashboardHero({ currentUser }) {
  return (
    <div
      className="dashboard-hero p-4 rounded-4 text-white mb-4 position-relative overflow-hidden shadow-sm"
      style={{
        background: "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
      }}
    >
      <div className="row align-items-center">
        <div className="col-12 col-md-8">
          <span className="badge bg-white text-primary rounded-pill px-3 py-1 fw-bold mb-2 small">
            Founder Workspace
          </span>
          <h2 className="fw-bold mb-1 fs-4 fs-md-2">
            Welcome back, {currentUser.name}! 👋
          </h2>
          <p className="opacity-90 small mb-0">
            {currentUser.hasProject === "yes"
              ? "Your venture is live and visible to builders within your proximity radius."
              : "Looking for exciting co-founder synergies and startup opportunities."}
          </p>
        </div>
        <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
          <Link
            to="/explore"
            className="btn btn-light btn-sm rounded-pill fw-bold text-primary px-4 shadow-sm"
          >
            <i className="bi bi-search me-1"></i> Discover Founders
          </Link>
        </div>
      </div>
    </div>
  );
}
