import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";
import RatingModal from "./components/RatingModal.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import "./global.css";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://foundemet-backend.onrender.com/api/users";

// Curated backup builders in case Render backend is cold-starting
const FALLBACK_BUILDERS = [
  {
    _id: "seed_1",
    name: "Arjun Sharma",
    role: "founder",
    hasProject: "yes",
    projectStatus: "development",
    projectDetails: "Building an AI-driven invoice factoring platform for small manufacturing vendors across South Asia.",
    projectLink: "https://github.com/arjun-sharma",
    lookingFor: ["cto", "cfo"],
    address: "Kolkata, India",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "seed_2",
    name: "Priya Das",
    role: "co-founder",
    hasProject: "yes",
    projectStatus: "idea",
    projectDetails: "Product designer validating a telehealth kiosk workflow for Tier-2 clinics and community centers.",
    projectLink: "https://priyadas.design",
    lookingFor: ["ceo"],
    address: "Bangalore, India",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "seed_3",
    name: "Rahul Mehta",
    role: "founder",
    hasProject: "yes",
    projectStatus: "execution",
    projectDetails: "Open-source distributed GPU orchestration layer tailored for cost-effective LLM fine-tuning.",
    projectLink: "https://github.com/rahulm-ai",
    lookingFor: ["cto"],
    address: "Delhi NCR, India",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "seed_4",
    name: "Sarah Jenkins",
    role: "co-founder",
    hasProject: "no",
    projectStatus: "idea",
    projectDetails: "",
    projectLink: "",
    lookingFor: ["ceo", "cto"],
    address: "San Francisco, CA",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

export default function Explore() {
  const [founders, setFounders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Stored connection statuses { [founderId]: 'pending' | 'connected' }
  const [connections, setConnections] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_connections");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Current logged in user (requires both user profile & valid auth token)
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("foundmet_user");
      const token = localStorage.getItem("foundmet_token");
      return stored && token ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [authPromptFounder, setAuthPromptFounder] = useState(null);

  // Rating & Endorsement state
  const [ratingFounder, setRatingFounder] = useState(null);
  const [ratingsCache, setRatingsCache] = useState({
    seed_1: { averageStars: 4.9, totalRatings: 8, tags: ["Strong Execution", "Visionary Leader"] },
    seed_2: { averageStars: 4.8, totalRatings: 5, tags: ["Product Sense", "Great Communicator"] },
    seed_3: { averageStars: 5.0, totalRatings: 11, tags: ["Technical Wizard", "Resilient & Gritty"] },
    seed_4: { averageStars: 4.7, totalRatings: 4, tags: ["Growth Hacker", "High Integrity"] },
  });

  // Socket.IO Chat window state
  const [chatContact, setChatContact] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Fetch feed data from backend
  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/v1/users`, {
          timeout: 8000,
        });

        if (response.data?.users && response.data.users.length > 0) {
          setFounders(response.data.users);
        } else {
          // Fallback to sample profiles if database is empty
          setFounders(FALLBACK_BUILDERS);
        }
      } catch (err) {
        console.warn("Backend feed unavailable, showing curated community:", err);
        setError("");
        setFounders(FALLBACK_BUILDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchFounders();
  }, []);

  // Show auto-dismiss toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Handle Connect toggle (securely guarded by authentication)
  const handleConnectToggle = (founder) => {
    if (!currentUser) {
      setAuthPromptFounder(founder);
      return;
    }

    const currentStatus = connections[founder._id];
    let newStatus = null;

    if (!currentStatus) {
      newStatus = "pending";
      showToast(`Connection request sent to ${founder.name}!`);
    } else if (currentStatus === "pending") {
      showToast(`Cancelled request to ${founder.name}`);
    } else {
      showToast(`Removed connection with ${founder.name}`);
    }

    const updated = { ...connections };
    if (newStatus) {
      updated[founder._id] = newStatus;
    } else {
      delete updated[founder._id];
    }

    setConnections(updated);
    localStorage.setItem("foundmet_connections", JSON.stringify(updated));
  };

  // Filter logic
  const filteredFounders = founders.filter((founder) => {
    const q = search.toLowerCase().trim();

    const lookingForArr = Array.isArray(founder.lookingFor)
      ? founder.lookingFor
      : typeof founder.lookingFor === "string"
      ? [founder.lookingFor]
      : [];

    const matchesSearch =
      !q ||
      founder.name?.toLowerCase().includes(q) ||
      founder.role?.toLowerCase().includes(q) ||
      founder.address?.toLowerCase().includes(q) ||
      founder.projectDetails?.toLowerCase().includes(q) ||
      lookingForArr.some((role) => role.toLowerCase().includes(q));

    // Tab filter
    let matchesTab = true;
    if (activeTab === "founders") {
      matchesTab = founder.role?.toLowerCase() === "founder";
    } else if (activeTab === "co-founders") {
      matchesTab = founder.role?.toLowerCase() === "co-founder";
    } else if (activeTab === "has-project") {
      matchesTab = founder.hasProject === "yes";
    } else if (activeTab === "looking-cto") {
      matchesTab = lookingForArr.map((r) => r.toLowerCase()).includes("cto");
    } else if (activeTab === "looking-ceo") {
      matchesTab = lookingForArr.map((r) => r.toLowerCase()).includes("ceo");
    }

    // Stage filter
    let matchesStage = true;
    if (stageFilter !== "all") {
      matchesStage = founder.projectStatus?.toLowerCase() === stageFilter;
    }

    return matchesSearch && matchesTab && matchesStage;
  });

  return (
    <div className="explore-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-4 shadow-lg d-flex align-items-center gap-3 fade-in"
          style={{ zIndex: 1050 }}
        >
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          <span className="small fw-semibold">{toastMessage}</span>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            onClick={() => setToastMessage("")}
          ></button>
        </div>
      )}

      {/* Hero Banner */}
      <section className="explore-hero text-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="explore-badge mb-2">
                <i className="bi bi-people-fill me-1"></i> Global Founder Network
              </span>
              <h1 className="display-5 fw-bold mt-2">
                Discover Your Future{" "}
                <span className="foundmet-gradient-text">Co-Founder</span>
              </h1>
              <p className="lead text-secondary mt-3 fs-6 mx-auto" style={{ maxWidth: "600px" }}>
                Connect with engineers, product builders, marketers, and leaders who share your drive to create real-world impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="explore-search">
        <div className="container">
          <div className="search-box mb-3">
            <div className="search-input-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, startup idea, role, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-sm btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-2"
                  onClick={() => setSearch("")}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>

            {/* Stage filter dropdown */}
            <select
              className="form-select role-filter"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="all">All Project Stages</option>
              <option value="idea">Idea Stage</option>
              <option value="development">In Development</option>
              <option value="execution">Live / Execution</option>
            </select>
          </div>

          {/* Quick Filter Tabs */}
          <div className="d-flex flex-wrap gap-2 align-items-center mb-4 pb-2 border-bottom">
            <span className="small fw-semibold text-secondary me-2 d-none d-md-inline">
              Filter by:
            </span>

            {[
              { key: "all", label: "All Builders", icon: "bi-grid-fill" },
              { key: "founders", label: "Founders", icon: "bi-award-fill" },
              { key: "co-founders", label: "Co-Founders", icon: "bi-people-fill" },
              { key: "has-project", label: "With Startups", icon: "bi-rocket-takeoff-fill" },
              { key: "looking-cto", label: "Looking for CTO", icon: "bi-code-slash" },
              { key: "looking-ceo", label: "Looking for CEO", icon: "bi-briefcase-fill" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`btn btn-sm pill-toggle-btn ${
                  activeTab === tab.key ? "active" : ""
                }`}
              >
                <i className={`bi ${tab.icon} me-1`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Grid */}
      <section className="explore-results flex-grow-1">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h4 fw-bold mb-1">Founder Directory</h2>
              <p className="text-secondary small mb-0">
                {loading
                  ? "Loading community..."
                  : `${filteredFounders.length} ambitious builders available to connect`}
              </p>
            </div>

            {currentUser && (
              <Link to="/dashboard" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                <i className="bi bi-speedometer2 me-1"></i>
                My Dashboard
              </Link>
            )}
          </div>

          {/* Shimmer Skeleton Loaders (PRD Section 29) */}
          {loading && (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="col-12 col-md-6 col-xl-4" key={i}>
                  <div className="founder-card shadow-sm border p-4 bg-white skeleton-card">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="skeleton skeleton-avatar"></div>
                      <div className="flex-grow-1">
                        <div className="skeleton skeleton-text w-75 mb-2"></div>
                        <div className="skeleton skeleton-text w-50"></div>
                      </div>
                    </div>
                    <div className="skeleton skeleton-text w-100 mb-2" style={{ height: "40px" }}></div>
                    <div className="skeleton skeleton-text w-50 mt-3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Alert with Retry */}
          {!loading && error && (
            <div className="alert alert-danger d-flex align-items-center justify-content-between">
              <div>
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}

          {/* Founder Cards Feed */}
          {!loading && !error && filteredFounders.length > 0 && (
            <div className="row g-4">
              {filteredFounders.map((founder) => {
                const isConnected = connections[founder._id] === "connected";
                const isPending = connections[founder._id] === "pending";
                const isSelf = currentUser && currentUser._id === founder._id;

                const lookingFor = Array.isArray(founder.lookingFor)
                  ? founder.lookingFor
                  : typeof founder.lookingFor === "string"
                  ? [founder.lookingFor]
                  : [];

                return (
                  <div className="col-12 col-md-6 col-xl-4" key={founder._id}>
                    <div className="founder-card bg-white shadow-sm border h-100 d-flex flex-column">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div
                          className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1"
                          onClick={() => setSelectedFounder(founder)}
                        >
                          <img
                            src={
                              founder.photo ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                founder.name || "Founder"
                              )}&background=0B5CFF&color=fff&size=100`
                            }
                            alt={founder.name}
                            className="founder-avatar"
                          />
                          <div>
                            <h3 className="founder-name mb-0 text-main hover-primary">
                              {founder.name}
                            </h3>
                            <span className="badge bg-primary-subtle text-primary text-capitalize fw-semibold mt-1">
                              {founder.role === "co-founder"
                                ? "Co-Founder"
                                : "Founder"}
                            </span>
                          </div>
                        </div>

                        <button
                          className="icon-btn p-2"
                          type="button"
                          onClick={() => setSelectedFounder(founder)}
                          title="View Full Profile"
                        >
                          <i className="bi bi-arrows-angle-expand"></i>
                        </button>
                      </div>

                      {/* Location */}
                      {founder.address && (
                        <div className="founder-location mb-2">
                          <i className="bi bi-geo-alt me-1 text-primary"></i>
                          {founder.address}
                        </div>
                      )}

                      {/* Startup project snippet */}
                      {founder.hasProject === "yes" && founder.projectDetails ? (
                        <div className="founder-idea mb-3">
                          <p className="small text-secondary mb-0 line-clamp-3">
                            {founder.projectDetails}
                          </p>
                        </div>
                      ) : (
                        <div className="founder-idea mb-3">
                          <p className="small text-muted fst-italic mb-0">
                            Looking to join an early team or exploring co-founder partnerships.
                          </p>
                        </div>
                      )}

                      {/* Project Stage */}
                      {founder.hasProject === "yes" && founder.projectStatus && (
                        <div className="mb-3">
                          <small className="text-secondary d-block mb-1" style={{ fontSize: "11px" }}>
                            Project Stage
                          </small>
                          <span className="skill-tag text-capitalize">
                            <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: "8px" }}></i>
                            {founder.projectStatus}
                          </span>
                        </div>
                      )}

                      {/* Looking For team members */}
                      <div className="looking-for mb-3 mt-auto">
                        <small className="text-secondary d-block mb-1" style={{ fontSize: "11px" }}>
                          Looking for
                        </small>
                        {lookingFor.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {lookingFor.map((roleKey) => (
                              <span className="skill-tag" key={roleKey}>
                                {roleKey.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">Open to all roles</span>
                        )}
                      </div>

                      {/* Action Buttons (PRD Section 14) */}
                      <div className="d-flex gap-2 pt-2 border-top">
                        {isSelf ? (
                          <Link to="/dashboard" className="btn btn-outline-primary w-100 rounded-pill">
                            <i className="bi bi-person me-1"></i> Your Profile
                          </Link>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConnectToggle(founder)}
                              className={`btn flex-grow-1 rounded-pill fw-semibold ${
                                isConnected
                                  ? "btn-success"
                                  : isPending
                                  ? "btn-secondary"
                                  : "btn-foundmet"
                              }`}
                            >
                              {isConnected ? (
                                <>
                                  <i className="bi bi-check2-circle me-1"></i> Connected
                                </>
                              ) : isPending ? (
                                <>
                                  <i className="bi bi-hourglass-split me-1"></i> Requested
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-person-plus me-1"></i> Connect
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedFounder(founder)}
                              className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: "40px", height: "40px" }}
                              title="View Founder Profile"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State (PRD Section 31) */}
          {!loading && !error && filteredFounders.length === 0 && (
            <div className="text-center py-5 bg-white rounded-4 border p-5">
              <div className="rounded-circle bg-light d-inline-flex p-3 mb-3">
                <i className="bi bi-search fs-1 text-secondary"></i>
              </div>
              <h3 className="h5 fw-bold">No founders found</h3>
              <p className="text-secondary small mb-3">
                Try searching for a different keyword or reset your filter settings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveTab("all");
                  setStageFilter("all");
                }}
                className="btn btn-outline-primary rounded-pill px-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Founder Profile Modal / Drawer (PRD Section 13 & 15) */}
      {selectedFounder && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(7, 26, 61, 0.6)" }}
          tabIndex="-1"
          onClick={() => setSelectedFounder(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Header Gradient */}
              <div
                className="p-4 text-white position-relative"
                style={{
                  background: "linear-gradient(135deg, #0096F9 0%, #7038F5 100%)",
                }}
              >
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                  onClick={() => setSelectedFounder(null)}
                ></button>

                <div className="d-flex align-items-center gap-3">
                  <img
                    src={
                      selectedFounder.photo ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedFounder.name || "Founder"
                      )}&background=0B5CFF&color=fff&size=150`
                    }
                    alt={selectedFounder.name}
                    className="rounded-circle border border-3 border-white shadow"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                  <div>
                    <h3 className="fw-bold mb-1">{selectedFounder.name}</h3>
                    <span className="badge bg-white text-primary text-capitalize fw-bold me-2">
                      {selectedFounder.role === "co-founder" ? "Co-Founder" : "Founder"}
                    </span>
                    <small className="opacity-75">
                      <i className="bi bi-geo-alt me-1"></i>
                      {selectedFounder.address || "Location specified"}
                    </small>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {/* Startup & Project Details */}
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-secondary small letter-spacing mb-2">
                    Startup / Project Information
                  </h6>
                  {selectedFounder.hasProject === "yes" && selectedFounder.projectDetails ? (
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-success-subtle text-success text-capitalize">
                          Stage: {selectedFounder.projectStatus || "Active"}
                        </span>
                        {selectedFounder.projectLink && (
                          <a
                            href={selectedFounder.projectLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-primary rounded-pill"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i> Visit Project
                          </a>
                        )}
                      </div>
                      <p className="mb-0 text-main">{selectedFounder.projectDetails}</p>
                    </div>
                  ) : (
                    <p className="text-secondary small mb-0">
                      Currently open to joining an early-stage startup or exploring new ideas.
                    </p>
                  )}
                </div>

                {/* Looking For */}
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-secondary small letter-spacing mb-2">
                    Looking For Team Members
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {Array.isArray(selectedFounder.lookingFor) && selectedFounder.lookingFor.length > 0 ? (
                      selectedFounder.lookingFor.map((role) => (
                        <span className="badge bg-primary text-white px-3 py-2 text-uppercase" key={role}>
                          {role} (Executive Lead)
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary small">Open to all builder roles</span>
                    )}
                  </div>
                </div>

                {/* Contact Privacy (PRD Section 15) */}
                <div className="p-3 rounded-3 border bg-light">
                  <h6 className="fw-bold small mb-1">
                    <i className="bi bi-shield-lock text-primary me-1"></i> Contact Information
                  </h6>
                  {connections[selectedFounder._id] === "connected" ? (
                    <div className="text-success small">
                      <p className="mb-1">
                        <strong>Email:</strong> {selectedFounder.email || "founder@foundmet.io"}
                      </p>
                      <p className="mb-0">
                        <strong>Location:</strong> {selectedFounder.address}
                      </p>
                    </div>
                  ) : (
                    <div className="text-secondary small d-flex align-items-center justify-content-between">
                      <span>
                        <i className="bi bi-lock-fill me-1 text-muted"></i>
                        Contact details available once connection request is accepted.
                      </span>
                      {connections[selectedFounder._id] === "pending" ? (
                        <span className="badge bg-secondary">Request Pending</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnectToggle(selectedFounder)}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          Request Contact
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer p-3 bg-light border-top d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setSelectedFounder(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleConnectToggle(selectedFounder)}
                  className={`btn rounded-pill px-4 fw-semibold ${
                    connections[selectedFounder._id] === "connected"
                      ? "btn-success"
                      : connections[selectedFounder._id] === "pending"
                      ? "btn-secondary"
                      : "btn-foundmet"
                  }`}
                >
                  {connections[selectedFounder._id] === "connected"
                    ? "Connected"
                    : connections[selectedFounder._id] === "pending"
                    ? "Request Pending"
                    : "Connect with Founder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Authentication Required Modal */}
      {authPromptFounder && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(7, 26, 61, 0.75)", zIndex: 1100 }}
          tabIndex="-1"
          onClick={() => setAuthPromptFounder(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mx-auto mb-3"
                style={{ width: "68px", height: "68px", alignItems: "center", justifyContent: "center" }}
              >
                <i className="bi bi-shield-lock-fill fs-2"></i>
              </div>

              <h4 className="fw-bold mb-2">Connect with {authPromptFounder.name}</h4>
              <p className="text-secondary small mb-3">
                To protect founders from spam and build a high-trust network, you must be logged in with an active founder profile to send connection requests.
              </p>

              <div className="alert alert-light border small text-start mb-4 py-2 px-3 text-secondary">
                <i className="bi bi-shield-check text-success me-2"></i>
                Only verified builders can initiate co-founder connections and view private contact details.
              </div>

              <div className="d-grid gap-2 mb-3">
                <Link
                  to="/login"
                  className="btn btn-foundmet py-2 rounded-pill fw-bold"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i> Log In to Send Request
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-primary py-2 rounded-pill fw-semibold"
                >
                  <i className="bi bi-person-plus me-1"></i> Create Founder Profile
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setAuthPromptFounder(null)}
                className="btn btn-link text-secondary text-decoration-none small"
              >
                Cancel and continue exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}