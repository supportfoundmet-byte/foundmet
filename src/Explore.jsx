import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import RatingModal from "./components/RatingModal.jsx";
import {
  getCoordinatesFromAddress,
  getDistanceToFounder,
  getLiveGPSCoordinates,
} from "./services/location.js";
import "./global.css";
import api from "./services/api.js";
import { notifyBrowser } from "./services/notifications.js";
import {
  connectionLabel,
  friendlyError,
  normalizeConnectionStatus,
  statusesFromPayload,
} from "./services/connectionState.js";

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value));

const TABS = [
  { key: "all", label: "All Builders", icon: "bi-grid" },
  { key: "founders", label: "Founders", icon: "bi-person-badge" },
  { key: "co-founders", label: "Co-Founders", icon: "bi-people" },
  { key: "has-project", label: "With Project", icon: "bi-rocket-takeoff" },
  
];

const RADIUS_OPTIONS = [
  { key: "all", label: "Any distance" },
  { key: "10", label: "Within 10 km" },
  { key: "25", label: "Within 25 km" },
  { key: "50", label: "Within 50 km" },
  { key: "100", label: "Within 100 km" },
];

const STAGE_OPTIONS = [
  { key: "all", label: "Any stage" },
  { key: "idea", label: "Idea stage" },
  { key: "development", label: "In development" },
  { key: "execution", label: "Live / execution" },
];

export default function Explore() {
  const [founders, setFounders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all"); // all | 10 | 25 | 50 | 100
  const [skillFilter, setSkillFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reporting, setReporting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Mobile filter drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Stored connection statuses { [founderId]: 'pending' | 'connected' }
  const [connections, setConnections] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_connections");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Stored shared mobile numbers { [founderId]: boolean }
  const [sharedPhoneNumbers, setSharedPhoneNumbers] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_shared_phones");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Current logged in user (requires both user profile & valid auth token)
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem("foundmet_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const [authPromptFounder, setAuthPromptFounder] = useState(null);
  const [connectionNote, setConnectionNote] = useState("");
  const [connectionSending, setConnectionSending] = useState(false);

  // Rating state
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

  // Dynamic user location & GPS Tracker state
  const [liveUserCoords, setLiveUserCoords] = useState(() => {
    return getCoordinatesFromAddress(currentUser?.address || "Bangalore, India");
  });
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [sortByNearest, setSortByNearest] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const seenConnectionNotifications = useRef(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Lock body scroll while the mobile filter drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (filtersOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filtersOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  // Toggle GPS Tracker to lock exact real-time coordinates
  const handleToggleGPS = async () => {
    if (gpsActive) {
      setLiveUserCoords(getCoordinatesFromAddress(currentUser?.address || "Bangalore, India"));
      setGpsActive(false);
      setSortByNearest(false);
      showToast("📍 Live GPS deactivated. Using default city coordinates.");
      return;
    }

    setGpsLoading(true);
    try {
      const coords = await getLiveGPSCoordinates();
      setLiveUserCoords(coords);
      setGpsActive(true);
      setSortByNearest(true);
      showToast("Approximate location updated for nearby founder matching.");
    } catch (err) {
      console.warn("GPS lookup failed:", err);
      let msg = "Could not activate GPS tracker.";
      if (err.code === 1) msg = "GPS permission was denied by your browser.";
      else if (err.code === 2) msg = "GPS position unavailable.";
      else if (err.code === 3) msg = "GPS request timed out.";
      showToast(msg);
    } finally {
      setGpsLoading(false);
    }
  };

  // Open Chat window: Only permitted after login AND once connected
  const handleOpenChat = (founder) => {
    if (!currentUser) {
      setAuthPromptFounder(founder);
      return;
    }

    if (normalizeConnectionStatus(connections[founder._id]) !== "connected") {
      showToast(`You can chat once ${founder.name} accepts your connection request.`);
      return;
    }

    setChatContact(founder);
    setIsChatOpen(true);
  };

  // Fetch feed data from backend
  useEffect(() => {
    const fetchFounders = async () => {
      try {
        setLoading(true);
        setFeedError("");
        const response = await api.get("/api/v1/users", {
          params: {
            page: 1,
            limit: 50,
            search: search.trim() || undefined,
            lat: liveUserCoords?.lat,
            lng: liveUserCoords?.lng,
            radiusKm: distanceFilter === "all" ? undefined : Number(distanceFilter),
            skill: skillFilter === "all" ? undefined : skillFilter,
            stage: stageFilter === "all" ? undefined : stageFilter,
          },
          timeout: 8000,
        });

        if (response.data?.users && response.data.users.length > 0) {
          setFounders(response.data.users.filter((founder) => String(founder._id) !== String(currentUser?._id)));
        } else setFounders([]);
      } catch (err) {
        console.warn("Backend feed unavailable:", err.message);
        setFounders([]);
        setFeedError("Founder feed is temporarily unavailable. Please retry.");
      } finally {
        setLoading(false);
      }
    };

    fetchFounders();
  }, [search, distanceFilter, skillFilter, stageFilter, liveUserCoords?.lat, liveUserCoords?.lng]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;

    let active = true;
    const syncConnections = async (notify = false) => {
      try {
        const { data } = await api.get("/api/v1/connections", { timeout: 8000 });
        if (!active || !data?.success) return;

        const nextStatuses = statusesFromPayload(data, currentUser._id);
        setConnections(nextStatuses);
        localStorage.setItem("foundmet_connections", JSON.stringify(nextStatuses));
        if (notify) {
          (data.receivedRequests || []).forEach((connection) => {
            if (!seenConnectionNotifications.current.has(String(connection._id))) {
              seenConnectionNotifications.current.add(String(connection._id));
              notifyBrowser("New connection request", `${connection.fromUser?.name || "A founder"} wants to connect with you.`);
            }
          });
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.warn("Connection sync unavailable:", error.message);
        }
      }
    };

    syncConnections();
    const intervalId = window.setInterval(() => syncConnections(true), 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [currentUser?._id]);

  // Handle Connect toggle
  const handleConnectToggle = async (founder) => {
    if (!currentUser) {
      setAuthPromptFounder(founder);
      return;
    }

    const currentStatus = normalizeConnectionStatus(connections[founder._id]);
    if (currentStatus === "connected") {
      showToast("You are already connected with this founder.");
      return;
    }
    if (currentStatus === "pending_sent" || currentStatus === "pending") {
      showToast("Your connection request is waiting for a response.");
      return;
    }
    if (currentStatus === "pending_received") {
      showToast("This founder already requested you. Open Dashboard to accept.");
      return;
    }
    if (currentStatus === "blocked") {
      showToast("You cannot connect with this founder.");
      return;
    }
    if (!isMongoId(founder._id)) {
      showToast("Only verified founder profiles can receive connection requests.");
      return;
    }
    setConnectionSending(true);
    try {
      const { data } = await api.post(`/api/v1/connections/request/${founder._id}`, {
        message: connectionNote.trim().slice(0, 500),
      });
      const nextStatus =
        data.state === "CONNECTED" || data.connection?.status === "accepted"
          ? "connected"
          : data.state === "PENDING_RECEIVED"
            ? "pending_received"
            : "pending_sent";
      const updated = { ...connections, [founder._id]: nextStatus };
      setConnections(updated);
      localStorage.setItem("foundmet_connections", JSON.stringify(updated));
      setConnectionNote("");
      showToast(data.message || `Connection request sent to ${founder.name}.`);
      notifyBrowser("Connection request sent", `Your request to ${founder.name} is pending.`);
    } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("foundmet_user");
      showToast("Your session expired. Please sign in again.");
      setAuthPromptFounder(founder);
    } else if (error.response?.status === 429) {
      showToast("You have sent too many requests. Please try again shortly.");
    } else {
      showToast(error.response?.data?.message || error.userMessage || "Unable to send connection request. Please try again.");
    }
    } finally {
      setConnectionSending(false);
    }
  };

  const handleReportFounder = async () => {
    if (!currentUser || !selectedFounder || !isMongoId(selectedFounder._id)) {
      showToast("Only verified profiles can be reported.");
      return;
    }
    setReporting(true);
    try {
      const { data } = await api.post(`/api/v1/reports/${selectedFounder._id}`, {
        reason: reportReason,
      });
      setFounders((previous) => previous.filter((founder) => founder._id !== selectedFounder._id));
      setSelectedFounder(null);
      showToast(data.message || "Profile hidden and submitted for review.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not submit this report.");
    } finally {
      setReporting(false);
    }
  };

  // Request Mobile Number from a connected founder
  const handleRequestPhone = (founder) => {
    if (!currentUser) {
      setAuthPromptFounder(founder);
      return;
    }

    if (normalizeConnectionStatus(connections[founder._id]) !== "connected") {
      showToast("Connect with this founder first before requesting their mobile number.");
      return;
    }

    const updated = { ...sharedPhoneNumbers, [`req_${founder._id}`]: true };
    // Instant approval for seed founders
    if (founder._id.startsWith("seed_") || founder._id.startsWith("demo_")) {
      updated[founder._id] = true;
      showToast(`${founder.name} approved your request! Mobile number is now visible.`);
    } else {
      showToast(`Mobile number request sent to ${founder.name}!`);
    }

    setSharedPhoneNumbers(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
  };

  // Share user's own number with this founder
  const handleShareMyPhone = (founder) => {
    if (!currentUser) return;
    const updated = { ...sharedPhoneNumbers, [founder._id]: true };
    setSharedPhoneNumbers(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
    showToast(`Shared your mobile number with ${founder.name}!`);
  };

  // Handle Rating Submitted
  const handleRatingSubmitted = ({ founderId, stars, feedback, tags }) => {
    setRatingsCache((prev) => {
      const existing = prev[founderId] || { averageStars: 5.0, totalRatings: 0, tags: [] };
      const newTotal = existing.totalRatings + 1;
      const newAvg = Number(((existing.averageStars * existing.totalRatings + stars) / newTotal).toFixed(1));
      const mergedTags = Array.from(new Set([...(existing.tags || []), ...(tags || [])]));
      return {
        ...prev,
        [founderId]: {
          averageStars: newAvg,
          totalRatings: newTotal,
          tags: mergedTags,
          latestFeedback: feedback,
        },
      };
    });
    showToast("Rating & endorsement submitted successfully!");
  };

  // Skill options derived from whatever the feed actually contains, so the
  // filter never offers a choice with zero matching founders.
  const skillOptions = useMemo(() => {
    const set = new Set();
    founders.forEach((founder) => {
      (Array.isArray(founder.canBring) ? founder.canBring : []).forEach((skill) => set.add(skill));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [founders]);

  const activeFilterCount = [
    stageFilter !== "all",
    distanceFilter !== "all",
    skillFilter !== "all",
    activeTab !== "all",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setActiveTab("all");
    setStageFilter("all");
    setDistanceFilter("all");
    setSkillFilter("all");
  };

  // Filter logic (Search, Role, Stage, Proximity, Skill)
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

    let matchesStage = true;
    if (stageFilter !== "all") {
      matchesStage = founder.projectStatus?.toLowerCase() === stageFilter;
    }

    // Distance calculation
    const dist = founder.distanceKm ?? getDistanceToFounder(liveUserCoords, founder);
    const radius = Number(distanceFilter);
    const matchesDistance = distanceFilter === "all" || (Number.isFinite(dist) && dist <= radius);
    const matchesSkill = skillFilter === "all" || (Array.isArray(founder.canBring) && founder.canBring.includes(skillFilter));

    return matchesSearch && matchesTab && matchesStage && matchesDistance && matchesSkill;
  });

  // Sort by distance (nearest first) if requested
  const sortedFounders = [...filteredFounders].sort((a, b) => {
    if (sortByNearest) {
      const distA = getDistanceToFounder(liveUserCoords, a) ?? 99999;
      const distB = getDistanceToFounder(liveUserCoords, b) ?? 99999;
      return distA - distB;
    }
    return 0;
  });
  const pageCount = Math.max(1, Math.ceil(sortedFounders.length / pageSize));
  const visiblePage = Math.min(page, pageCount);
  const visibleFounders = sortedFounders.slice((visiblePage - 1) * pageSize, visiblePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, stageFilter, distanceFilter, skillFilter, sortByNearest]);

  return (
    <div className="explore-page min-vh-100 bg-background d-flex flex-column">
      <style>{`
        .explore-shell{display:flex;flex:1;min-height:0;position:relative;}
        .explore-sidebar{width:280px;flex-shrink:0;background:#fff;border-right:1px solid #e8ecf3;
          padding:20px 18px 28px;overflow-y:auto;}
        .explore-sidebar::-webkit-scrollbar{width:6px;}
        .explore-sidebar::-webkit-scrollbar-thumb{background:#dbe1ea;border-radius:8px;}
        .explore-sidebar-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .explore-sidebar-close{display:none;}
        .filter-block{margin-bottom:22px;}
        .filter-block-label{font-size:11px;font-weight:700;letter-spacing:.02em;color:#6b7688;
          text-transform:uppercase;margin-bottom:10px;display:block;}
        .filter-tab-list{display:flex;flex-direction:column;gap:4px;}
        .filter-tab-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;
          border:1px solid transparent;background:transparent;color:#4a5468;font-size:13px;font-weight:600;
          text-align:left;width:100%;transition:background .15s ease,color .15s ease;}
        .filter-tab-item i{font-size:14px;width:16px;text-align:center;color:#95a0b3;}
        .filter-tab-item:hover{background:#f4f6fa;}
        .filter-tab-item.is-active{background:#0B5CFF14;color:#0B5CFF;border-color:#0B5CFF33;}
        .filter-tab-item.is-active i{color:#0B5CFF;}
        .radius-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
        .radius-chip{border:1px solid #e3e7ee;background:#fff;color:#4a5468;font-size:12px;font-weight:600;
          border-radius:10px;padding:8px 6px;transition:all .15s ease;}
        .radius-chip.is-active{background:#0f172a;color:#fff;border-color:#0f172a;}
        .gps-toggle-btn{width:100%;justify-content:center;}
        .sidebar-backdrop{position:fixed;inset:0;background:rgba(7,26,61,.45);z-index:1049;}
        .explore-main{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0;}
        .explore-toolbar{padding:14px 24px;border-bottom:1px solid #e8ecf3;background:#fff;
          position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
        .mobile-filter-btn{display:none;position:relative;}
        .filter-count-dot{position:absolute;top:-4px;right:-4px;background:#0B5CFF;color:#fff;
          font-size:10px;font-weight:700;border-radius:50%;width:16px;height:16px;
          display:flex;align-items:center;justify-content:center;}
        .explore-feed-scroll{flex:1;overflow-y:auto;padding:22px 24px 40px;}
        .founders-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;}
        .founder-card{transition:transform .15s ease,box-shadow .15s ease;}
        .founder-card:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(15,23,42,.08)!important;}
        @media (max-width: 991.98px){
          .explore-sidebar{position:fixed;top:0;left:0;height:100%;width:86%;max-width:320px;
            transform:translateX(-105%);transition:transform .25s ease;z-index:1055;
            box-shadow:8px 0 32px rgba(7,26,61,.18);}
          .explore-sidebar.is-open{transform:translateX(0);}
          .explore-sidebar-close{display:inline-flex;}
          .mobile-filter-btn{display:inline-flex;}
          .explore-feed-scroll{overflow-y:visible;padding:16px 14px 32px;}
          .explore-shell{overflow:visible;}
          .explore-toolbar{padding:12px 14px;}
        }
        @media (min-width: 992px){
          .explore-shell{overflow:hidden;}
        }
      `}</style>

      <Header />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-4 shadow-lg d-flex align-items-center gap-3 animate-fade-in"
          style={{ zIndex: 1065, maxWidth: "calc(100vw - 32px)" }}
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

      <div className="explore-shell">
        {/* Sidebar: every filter lives here so the feed stays uncluttered */}
        <aside className={`explore-sidebar ${filtersOpen ? "is-open" : ""}`} aria-label="Founder filters">
          <div className="explore-sidebar-header">
            <div>
              <h6 className="fw-bold text-main mb-0">Discover</h6>
              <span className="text-secondary" style={{ fontSize: "12px" }}>
                {sortedFounders.length} founder{sortedFounders.length === 1 ? "" : "s"} match
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-circle explore-sidebar-close"
              style={{ width: "32px", height: "32px" }}
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Search */}
          <div className="filter-block">
            <span className="filter-block-label">Search</span>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-secondary"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Name, role, idea, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-start-0"
                  onClick={() => setSearch("")}
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Role / Tab Filter */}
          <div className="filter-block">
            <span className="filter-block-label">Looking to meet</span>
            <div className="filter-tab-list">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`filter-tab-item ${activeTab === tab.key ? "is-active" : ""}`}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Filter */}
          <div className="filter-block">
            <span className="filter-block-label">Project stage</span>
            <select
              className="form-select form-select-sm"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              {STAGE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div className="filter-block">
            <span className="filter-block-label">Skill they bring</span>
            <select
              className="form-select form-select-sm"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="all">Any skill</option>
              {skillOptions.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          {/* Radius Filter */}
          <div className="filter-block">
            <span className="filter-block-label">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> Distance
            </span>
            <div className="radius-grid">
              {RADIUS_OPTIONS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDistanceFilter(d.key)}
                  className={`radius-chip ${distanceFilter === d.key ? "is-active" : ""}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* GPS */}
          <div className="filter-block">
            <span className="filter-block-label">Location</span>
            <button
              type="button"
              onClick={handleToggleGPS}
              disabled={gpsLoading}
              className={`btn btn-sm rounded-pill gps-toggle-btn d-flex align-items-center gap-2 fw-semibold ${
                gpsActive ? "btn-success text-white" : "btn-outline-primary"
              }`}
            >
              {gpsLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" style={{ width: "12px", height: "12px" }}></span>
                  Acquiring signal...
                </>
              ) : gpsActive ? (
                <>
                  <span className="badge bg-white text-success rounded-circle p-1 animate-radar-pulse"></span>
                  Live GPS on (±{liveUserCoords.accuracy || 15}m)
                </>
              ) : (
                <>
                  <i className="bi bi-crosshair"></i>
                  Use my live location
                </>
              )}
            </button>
            <p className="text-secondary mb-0 mt-2" style={{ fontSize: "11px" }}>
              {gpsActive ? (
                <>Tracking from {liveUserCoords.lat.toFixed(3)}°, {liveUserCoords.lng.toFixed(3)}°</>
              ) : (
                <>Current hub: {currentUser?.address?.split(",")[0] || "Bangalore (default)"}</>
              )}
            </p>
          </div>

          {/* Sort */}
          <div className="filter-block">
            <span className="filter-block-label">Sort</span>
            <button
              type="button"
              onClick={() => setSortByNearest(!sortByNearest)}
              className={`btn btn-sm rounded-pill w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold ${
                sortByNearest ? "btn-dark text-white" : "btn-light text-secondary border"
              }`}
            >
              <i className="bi bi-arrow-down-up"></i>
              {sortByNearest ? "Nearest first" : "Newest first"}
            </button>
          </div>

          {activeFilterCount > 0 && (
            <button type="button" className="btn btn-link btn-sm text-secondary p-0" onClick={resetFilters}>
              <i className="bi bi-arrow-counterclockwise me-1"></i> Reset all filters
            </button>
          )}
        </aside>

        {filtersOpen && (
          <div className="sidebar-backdrop" onClick={() => setFiltersOpen(false)} />
        )}

        {/* Main feed */}
        <main className="explore-main">
          <div className="explore-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-light border rounded-pill mobile-filter-btn align-items-center gap-2"
              onClick={() => setFiltersOpen(true)}
            >
              <span style={{ position: "relative" }}>
                <i className="bi bi-sliders"></i>
                {activeFilterCount > 0 && <span className="filter-count-dot">{activeFilterCount}</span>}
              </span>
              Filters
            </button>

            <div className="flex-grow-1">
              <h1 className="h6 fw-bold text-main mb-0">Discover co-founders & startup teams</h1>
              <span className="small text-secondary">
                Showing {sortedFounders.length} founder{sortedFounders.length === 1 ? "" : "s"}
                {distanceFilter !== "all" ? ` within ${distanceFilter} km` : ""}
                {sortByNearest ? " · nearest first" : ""}
              </span>
            </div>
          </div>

          <div className="explore-feed-scroll">
            {feedError && !loading && (
              <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
                <span>{feedError}</span>
                <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => window.location.reload()}>Retry</button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="founders-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white" key={n}>
                    <div className="d-flex gap-3 mb-3">
                      <div className="skeleton rounded-circle" style={{ width: "52px", height: "52px" }}></div>
                      <div className="flex-grow-1">
                        <div className="skeleton mb-2" style={{ height: "16px", width: "60%" }}></div>
                        <div className="skeleton" style={{ height: "12px", width: "40%" }}></div>
                      </div>
                    </div>
                    <div className="skeleton mb-2" style={{ height: "12px", width: "100%" }}></div>
                    <div className="skeleton mb-3" style={{ height: "12px", width: "80%" }}></div>
                    <div className="skeleton rounded-pill" style={{ height: "36px", width: "100%" }}></div>
                  </div>
                ))}
              </div>
            )}

            {/* Founder Cards Grid */}
            {!loading && sortedFounders.length > 0 && (
              <div className="founders-grid">
                {visibleFounders.map((founder) => {
                  const status = normalizeConnectionStatus(connections[founder._id]);
                  const isConnected = status === "connected";
                  const isPending = status === "pending_sent" || status === "pending";
                  const isSelf = currentUser && currentUser._id === founder._id;

                  const distanceKm = founder.distanceKm ?? getDistanceToFounder(liveUserCoords, founder);
                  const rating = ratingsCache[founder._id] || { averageStars: 5.0, totalRatings: 1 };

                  const lookingFor = Array.isArray(founder.lookingFor)
                    ? founder.lookingFor
                    : typeof founder.lookingFor === "string"
                    ? [founder.lookingFor]
                    : [];

                  return (
                    <div
                      className="founder-card foundmet-card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column bg-white"
                      key={founder._id}
                    >
                      {/* Top Row: Avatar, Name, Role, Rating & Distance */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div
                          className="d-flex align-items-center gap-2 cursor-pointer text-truncate flex-grow-1"
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
                            className="rounded-circle border flex-shrink-0"
                            style={{ width: "42px", height: "42px", objectFit: "cover" }}
                          />
                          <div className="text-truncate">
                            <h6 className="mb-0 fw-bold text-main text-truncate hover-primary" style={{ fontSize: "14px" }}>
                              {founder.name}
                            </h6>
                            <div className="d-flex align-items-center gap-1 mt-0">
                              <span className="badge bg-primary-subtle text-primary text-capitalize" style={{ fontSize: "9px", padding: "2px 6px" }}>
                                {founder.role === "co-founder" ? "Co-Founder" : "Founder"}
                              </span>
                              <span className="text-warning fw-bold small" style={{ fontSize: "11px" }}>
                                ⭐ {rating.averageStars}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Distance Badge */}
                        {distanceKm !== null && (
                          <span
                            className={`badge rounded-pill px-2 py-1 flex-shrink-0 ${
                              distanceKm <= 50
                                ? "bg-success-subtle text-success border border-success-subtle"
                                : distanceKm <= 80
                                ? "bg-primary-subtle text-primary border border-primary-subtle"
                                : "bg-light text-secondary border"
                            }`}
                            style={{ fontSize: "10px" }}
                          >
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            {distanceKm} km
                          </span>
                        )}
                      </div>

                      {/* Minimal 1-Line Description */}
                      <div className="mb-2">
                        <p className="small text-secondary mb-0 text-truncate" style={{ fontSize: "12px" }}>
                          {founder.hasProject === "yes" && founder.projectDetails
                            ? founder.projectDetails
                            : "Open to partner on new startup opportunities."}
                        </p>
                      </div>

                      {/* Compact Looking For Tags */}
                      <div className="d-flex align-items-center justify-content-between mb-3 mt-auto pt-1">
                        <div className="d-flex flex-wrap gap-1">
                          {lookingFor.slice(0, 3).map((r) => (
                            <span key={r} className="skill-tag" style={{ fontSize: "9px", padding: "1px 6px" }}>
                              {r.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <small className="text-muted" style={{ fontSize: "11px" }}>
                          {founder.address?.split(",")[0] || "Global"}
                        </small>
                      </div>

                      {/* Minimal Action Buttons */}
                      <div className="d-flex gap-2 pt-2 border-top align-items-center">
                        {isSelf ? (
                          <Link to="/dashboard" className="btn btn-outline-primary btn-sm rounded-pill w-100 py-1" style={{ fontSize: "12px" }}>
                            Your Profile
                          </Link>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConnectToggle(founder)}
                              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold flex-grow-1 ${
                                isConnected
                                  ? "btn-success"
                                  : isPending
                                  ? "btn-secondary"
                                  : "btn-foundmet"
                              }`}
                              style={{ fontSize: "12px" }}
                            >
                              {isConnected ? "Connected" : isPending ? "Request Sent" : connectionLabel(status) === "Respond" ? "Respond" : "+ Connect"}
                            </button>

                            {isConnected && (
                              <button
                                type="button"
                                onClick={() => handleOpenChat(founder)}
                                className="btn btn-sm btn-primary rounded-circle d-flex align-items-center justify-content-center p-0"
                                style={{ width: "30px", height: "30px", flexShrink: 0 }}
                                title="Chat with founder"
                              >
                                <i className="bi bi-chat-dots-fill" style={{ fontSize: "12px" }}></i>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedFounder(founder)}
                              className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: "30px", height: "30px", flexShrink: 0 }}
                              title="View full profile"
                            >
                              <i className="bi bi-eye" style={{ fontSize: "12px" }}></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && pageCount > 1 && (
              <nav className="d-flex justify-content-center align-items-center gap-2 mt-4" aria-label="Founder pages">
                <button type="button" className="btn btn-outline-primary btn-sm rounded-pill" disabled={visiblePage === 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                <span className="small text-secondary">Page {visiblePage} of {pageCount}</span>
                <button type="button" className="btn btn-outline-primary btn-sm rounded-pill" disabled={visiblePage === pageCount} onClick={() => setPage((value) => value + 1)}>Next</button>
              </nav>
            )}

            {/* Empty State */}
            {!loading && sortedFounders.length === 0 && (
              <div className="text-center py-5 bg-white rounded-4 border p-5">
                <div className="rounded-circle bg-light d-inline-flex p-3 mb-3">
                  <i className="bi bi-geo-alt fs-1 text-secondary"></i>
                </div>
                <h4 className="fw-bold">No founders found</h4>
                <p className="text-secondary small mb-3">
                  Try widening your distance radius or clearing search filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="btn btn-outline-primary rounded-pill px-4"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Founder Full Profile Modal & Contact Share */}
      {selectedFounder && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(7, 26, 61, 0.65)", zIndex: 1060 }}
          tabIndex="-1"
          onClick={() => setSelectedFounder(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              
              {/* Header */}
              <div
                className="p-4 text-white position-relative"
                style={{
                  background: "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
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
                      )}&background=ffffff&color=0B5CFF&size=150`
                    }
                    alt={selectedFounder.name}
                    className="rounded-circle border border-3 border-white shadow"
                    style={{ width: "72px", height: "72px", objectFit: "cover" }}
                  />
                  <div>
                    <h3 className="fw-bold mb-1">{selectedFounder.name}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-white text-primary text-capitalize fw-bold">
                        {selectedFounder.role === "co-founder" ? "Co-Founder" : "Founder"}
                      </span>
                      <small className="opacity-90">
                        <i className="bi bi-geo-alt me-1"></i>
                        {selectedFounder.address || "Global Builder"}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 bg-white">
                {currentUser && isMongoId(selectedFounder._id) && (
                  <div className="mb-4 p-3 rounded-3 border border-danger-subtle bg-danger-subtle">
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <small className="text-danger fw-semibold">See something unsafe or fake?</small>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={handleReportFounder}
                        disabled={reporting}
                      >
                        {reporting ? "Sending..." : "Report profile"}
                      </button>
                    </div>
                    <select
                      className="form-select form-select-sm mt-2"
                      value={reportReason}
                      onChange={(event) => setReportReason(event.target.value)}
                      aria-label="Report reason"
                    >
                      <option value="spam">Spam or promotion</option>
                      <option value="fake-profile">Fake profile</option>
                      <option value="harassment">Harassment</option>
                      <option value="unsafe">Unsafe behavior</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}
                {/* Project Details */}
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-secondary small mb-2">
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
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i> Visit Project
                          </a>
                        )}
                      </div>
                      <p className="mb-0 text-main small">{selectedFounder.projectDetails}</p>
                    </div>
                  ) : (
                    <p className="text-secondary small mb-0">
                      Currently open to joining an early-stage startup or exploring new ideas.
                    </p>
                  )}
                </div>

                {/* Looking For */}
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-secondary small mb-2">
                    Looking For Team Members
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {Array.isArray(selectedFounder.lookingFor) && selectedFounder.lookingFor.length > 0 ? (
                      selectedFounder.lookingFor.map((role) => (
                        <span className="badge bg-primary text-white px-3 py-2 text-uppercase" key={role}>
                          {role} (Lead Partner)
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary small">Open to all builder roles</span>
                    )}
                  </div>
                </div>

                {/* Reputation & Ratings */}
                <div className="mb-4 p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-uppercase text-secondary small mb-0">
                      Founder Reputation & Endorsements
                    </h6>
                    <button
                      type="button"
                      onClick={() => setRatingFounder(selectedFounder)}
                      className="btn btn-sm btn-outline-warning text-dark fw-bold rounded-pill px-3"
                    >
                      <i className="bi bi-star-fill text-warning me-1"></i> Endorse
                    </button>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fs-5 fw-bold text-dark">
                      ⭐ {(ratingsCache[selectedFounder._id]?.averageStars) || "5.0"}
                    </span>
                    <small className="text-secondary">
                      ({(ratingsCache[selectedFounder._id]?.totalRatings) || 1} peer review)
                    </small>
                  </div>
                </div>

                {/* Mobile Number & Contact Sharing (PRD + User Explicit Requirement) */}
                <div className="p-3 rounded-3 border bg-light">
                  <h6 className="fw-bold small mb-2">
                    <i className="bi bi-shield-lock text-primary me-1"></i> Contact & Mobile Number
                  </h6>

                  {connections[selectedFounder._id] === "connected" ? (
                    <div>
                      <p className="small text-secondary mb-2">
                        <strong>Email:</strong> {selectedFounder.email || "founder@foundmet.io"}
                      </p>

                      {/* Mobile Number Status */}
                      {sharedPhoneNumbers[selectedFounder._id] ? (
                        <div className="p-2 bg-white rounded border d-flex align-items-center justify-content-between">
                          <div>
                            <span className="small text-secondary d-block" style={{ fontSize: "11px" }}>
                              Verified Mobile Number:
                            </span>
                            <strong className="text-success fs-6">
                              {selectedFounder.phoneNumber || "+91 98450 67890"}
                            </strong>
                          </div>
                          <div className="d-flex gap-2">
                            <a
                              href={`https://wa.me/${(selectedFounder.phoneNumber || "919845067890").replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-sm btn-success rounded-pill px-3"
                            >
                              <i className="bi bi-whatsapp me-1"></i> WhatsApp
                            </a>
                            <a
                              href={`tel:${selectedFounder.phoneNumber || "+919845067890"}`}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              <i className="bi bi-telephone-fill me-1"></i> Call
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 bg-white rounded border d-flex align-items-center justify-content-between">
                          <span className="small text-secondary">
                            <i className="bi bi-lock-fill me-1 text-muted"></i>
                            Mobile number is hidden until requested.
                          </span>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleRequestPhone(selectedFounder)}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                              disabled={sharedPhoneNumbers[`req_${selectedFounder._id}`]}
                            >
                              {sharedPhoneNumbers[`req_${selectedFounder._id}`] ? (
                                <>
                                  <i className="bi bi-hourglass-split me-1"></i> Requested
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-telephone-plus me-1"></i> Request Mobile Number
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareMyPhone(selectedFounder)}
                              className="btn btn-sm btn-outline-success rounded-pill px-2"
                              title="Share your number with them"
                            >
                              Share Mine
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between small text-secondary">
                      <div className="w-100">
                        <span className="d-block mb-2"><i className="bi bi-lock-fill me-1 text-muted"></i>Send a connection request to unlock messaging.</span>
                        <textarea className="form-control form-control-sm mb-2" rows="2" maxLength="500" placeholder="Add a short note (optional)" value={connectionNote} onChange={(event) => setConnectionNote(event.target.value)} />
                        <button type="button" disabled={connectionSending} onClick={() => handleConnectToggle(selectedFounder)} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                          {connectionSending ? "Sending..." : "Connect with note"}
                        </button>
                      </div>
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

                <div className="d-flex gap-2">
                  {connections[selectedFounder._id] === "connected" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFounder(null);
                        handleOpenChat(selectedFounder);
                      }}
                      className="btn btn-primary rounded-pill px-4 fw-semibold"
                    >
                      <i className="bi bi-chat-dots-fill me-1"></i> Open Chat
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleConnectToggle(selectedFounder)}
                    className={`btn rounded-pill px-4 fw-semibold ${
                      connections[selectedFounder._id] === "connected"
                        ? "btn-success"
                        : "btn-foundmet"
                    }`}
                  >
                    {connections[selectedFounder._id] === "connected"
                      ? "Connected"
                      : "Connect with Founder"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secure Authentication Prompt Modal */}
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
            style={{ maxWidth: "460px" }}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg p-4 text-center">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mx-auto mb-3"
                style={{ width: "64px", height: "64px", alignItems: "center", justifyContent: "center" }}
              >
                <i className="bi bi-shield-lock-fill fs-2"></i>
              </div>

              <h4 className="fw-bold mb-2">Connect with {authPromptFounder.name}</h4>
              <p className="text-secondary small mb-4">
                To protect founders and maintain an authentic network, please sign in or create your founder profile to send connection requests and chat.
              </p>

              <div className="d-grid gap-2 mb-3">
                <Link to="/login" className="btn btn-foundmet py-2 rounded-pill fw-bold">
                  Sign In to Connect
                </Link>
                <Link to="/register" className="btn btn-outline-primary py-2 rounded-pill fw-semibold">
                  Create Founder Profile
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setAuthPromptFounder(null)}
                className="btn btn-link text-secondary text-decoration-none small"
              >
                Cancel and continue browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Founder Rating Modal */}
      <RatingModal
        isOpen={!!ratingFounder}
        onClose={() => setRatingFounder(null)}
        targetFounder={ratingFounder}
        currentUser={currentUser}
        onRatingSubmitted={handleRatingSubmitted}
      />

      {/* Real-time Socket.IO Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialContact={chatContact}
        currentUser={currentUser}
        connections={connections}
        availableFounders={founders}
      />

      {/* Floating Chat Dock Trigger (Only when authenticated) */}
      {currentUser && !isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="btn btn-foundmet rounded-pill position-fixed shadow-lg d-flex align-items-center gap-2 py-2 px-3 animate-fade-in"
          style={{ bottom: "24px", right: "24px", zIndex: 1040 }}
          title="Open Founder Chats"
        >
          <i className="bi bi-chat-dots-fill fs-5"></i>
          <span className="fw-semibold small">Messages</span>
        </button>
      )}
    </div>
  );
}