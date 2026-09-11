import { useEffect, useRef, useState } from "react";
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

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value));

export default function Explore() {
  const [founders, setFounders] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all"); // "all" | "50" | "80"
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [selectedFounder, setSelectedFounder] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reporting, setReporting] = useState(false);
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
      showToast(`📍 Live GPS locked! Located nearest members (accuracy ±${coords.accuracy}m).`);
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

    if (connections[founder._id] !== "connected") {
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
          params: { page: 1, limit: 50, search: search.trim() || undefined },
          timeout: 8000,
        });

        if (response.data?.users && response.data.users.length > 0) {
          setFounders(response.data.users);
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
  }, [search]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;

    let active = true;
    const syncConnections = async (notify = false) => {
      try {
        const { data } = await api.get("/api/v1/connections", { timeout: 8000 });
        if (!active || !data?.success) return;

        const nextStatuses = {};
        [...(data.connected || []), ...(data.sentRequests || []), ...(data.receivedRequests || [])]
          .forEach((connection) => {
            const otherUser = String(connection.fromUser?._id) === String(currentUser._id)
              ? connection.toUser
              : connection.fromUser;
            if (otherUser?._id) {
              nextStatuses[otherUser._id] = connection.status === "accepted" ? "connected" : "pending";
            }
            if (
              notify &&
              connection.toUser?._id &&
              String(connection.toUser._id) === String(currentUser._id) &&
              connection.status === "pending" &&
              !seenConnectionNotifications.current.has(String(connection._id))
            ) {
              seenConnectionNotifications.current.add(String(connection._id));
              notifyBrowser("New connection request", `${connection.fromUser?.name || "A founder"} wants to connect with you.`);
            }
          });

        setConnections(nextStatuses);
        localStorage.setItem("foundmet_connections", JSON.stringify(nextStatuses));
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

    const currentStatus = connections[founder._id];
    if (currentStatus === "connected") {
      showToast("You are already connected. Open your dashboard to message this founder.");
      return;
    }
    if (currentStatus === "pending") {
      showToast("Your connection request is waiting for a response.");
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
      const updated = { ...connections, [founder._id]: data.connection?.status || "pending" };
      setConnections(updated);
      localStorage.setItem("foundmet_connections", JSON.stringify(updated));
      setConnectionNote("");
      showToast(data.message || `Connection request sent to ${founder.name}.`);
      notifyBrowser("Connection request sent", `Your request to ${founder.name} is pending.`);
    } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("foundmet_user");
      showToast("Your session expired. Please sign in again.");
      setAuthPromptFounder(founder);
    } else if (error.response?.status === 429) {
      showToast("You have sent too many requests. Please try again shortly.");
    } else {
      showToast(error.response?.data?.message || (error.request ? "Connection service is unavailable. Please retry." : "Could not send the connection request."));
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

    if (connections[founder._id] !== "connected") {
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

  // Filter logic (Search, Role, Stage, Proximity 50-80 km)
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
    const dist = getDistanceToFounder(liveUserCoords, founder);
    let matchesDistance = true;
    if (distanceFilter === "50") {
      matchesDistance = dist !== null && dist <= 50;
    } else if (distanceFilter === "80") {
      matchesDistance = dist !== null && dist <= 80;
    }

    return matchesSearch && matchesTab && matchesStage && matchesDistance;
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

  return (
    <div className="explore-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-4 shadow-lg d-flex align-items-center gap-3 animate-fade-in"
          style={{ zIndex: 1065 }}
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
      <section className="explore-hero text-center py-4 bg-white border-bottom">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold mb-2">
                <i className="bi bi-people-fill me-1"></i> Verified Founder Network
              </span>
              <h1 className="h2 fw-bold mt-1 text-main">
                Discover Co-Founders & Startup Teams
              </h1>
              <p className="text-secondary small mb-0 mx-auto" style={{ maxWidth: "560px" }}>
                Connect with engineers, operators, and product leaders. Chat in real-time once connected and safely request mobile numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="explore-search py-3 bg-light border-bottom">
        <div className="container">
          <div className="row g-2 mb-3">
            {/* Search Input */}
            <div className="col-12 col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, role, startup idea, or city..."
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

            {/* Stage Filter */}
            <div className="col-12 col-md-5">
              <select
                className="form-select"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Project Stages</option>
                <option value="idea">Idea Stage</option>
                <option value="development">In Development</option>
                <option value="execution">Live / Execution</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tabs & Distance Filters */}
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-2">
            {/* Role Filter Tabs */}
            <div className="d-flex flex-wrap gap-1 align-items-center">
              {[
                { key: "all", label: "All Builders" },
                { key: "founders", label: "Founders" },
                { key: "co-founders", label: "Co-Founders" },
                { key: "has-project", label: "With Project" },
                { key: "looking-cto", label: "Needs CTO" },
                { key: "looking-ceo", label: "Needs CEO" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`btn btn-sm rounded-pill px-3 py-1 ${
                    activeTab === tab.key
                      ? "btn-primary text-white fw-semibold"
                      : "btn-light text-secondary border"
                  }`}
                  style={{ fontSize: "12px" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 50 - 80 KM Proximity Filter */}
            <div className="d-flex align-items-center gap-1 bg-white p-1 rounded-pill border">
              <span className="small text-secondary px-2 fw-semibold" style={{ fontSize: "11px" }}>
                <i className="bi bi-geo-alt-fill text-danger me-1"></i> Radius:
              </span>
              {[
                { key: "all", label: "All" },
                { key: "50", label: "⚡ < 50 km" },
                { key: "80", label: "🚗 < 80 km" },
              ].map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDistanceFilter(d.key)}
                  className={`btn btn-xs rounded-pill px-2 py-1 ${
                    distanceFilter === d.key
                      ? "btn-dark text-white fw-bold shadow-xs"
                      : "btn-light text-secondary"
                  }`}
                  style={{ fontSize: "11px" }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live GPS Tracker Bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-2 bg-white rounded-3 border shadow-xs">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleToggleGPS}
                disabled={gpsLoading}
                className={`btn btn-sm rounded-pill px-3 py-1 d-inline-flex align-items-center gap-2 fw-semibold transition-all ${
                  gpsActive
                    ? "btn-success text-white shadow-xs"
                    : "btn-outline-primary"
                }`}
                style={{ fontSize: "12px" }}
              >
                {gpsLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: "12px", height: "12px" }}></span>
                    <span>Acquiring GPS Signal...</span>
                  </>
                ) : gpsActive ? (
                  <>
                    <span className="badge bg-white text-success rounded-circle p-1 animate-radar-pulse"></span>
                    <span>Live GPS Active (±{liveUserCoords.accuracy || 15}m)</span>
                    <i className="bi bi-x-circle ms-1 opacity-75" title="Turn off GPS"></i>
                  </>
                ) : (
                  <>
                    <i className="bi bi-crosshair text-primary"></i>
                    <span>📍 Locate Nearest Members via GPS</span>
                  </>
                )}
              </button>

              <span className="small text-secondary" style={{ fontSize: "11px" }}>
                {gpsActive ? (
                  <span className="text-success fw-medium">
                    <i className="bi bi-broadcast me-1"></i>
                    Tracking live from {liveUserCoords.lat.toFixed(3)}°, {liveUserCoords.lng.toFixed(3)}°
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-geo text-muted me-1"></i>
                    Current hub: {currentUser?.address?.split(",")[0] || "Bangalore (Default)"}
                  </span>
                )}
              </span>
            </div>

            {/* Nearest First Sort Toggle */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                type="button"
                onClick={() => setSortByNearest(!sortByNearest)}
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  sortByNearest
                    ? "btn-dark text-white fw-bold shadow-xs"
                    : "btn-light text-secondary border"
                }`}
                style={{ fontSize: "11px" }}
              >
                <i className="bi bi-arrow-down-up me-1"></i>
                {sortByNearest ? "Nearest First ✓" : "Sort Nearest"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Feed Results */}
      <section className="explore-results flex-grow-1 py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-secondary fw-semibold">
              Showing {sortedFounders.length} founders
              {distanceFilter !== "all" ? ` within ${distanceFilter} km` : ""}
              {sortByNearest ? " (Sorted by nearest distance)" : ""}
            </span>
          </div>

          {feedError && !loading && (
            <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
              <span>{feedError}</span>
              <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="row g-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div className="col-12 col-md-6 col-xl-4" key={n}>
                  <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
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
                </div>
              ))}
            </div>
          )}

          {/* Founder Cards Grid */}
          {!loading && sortedFounders.length > 0 && (
            <div className="row g-4">
              {visibleFounders.map((founder) => {
                const isConnected = connections[founder._id] === "connected";
                const isPending = connections[founder._id] === "pending";
                const isSelf = currentUser && currentUser._id === founder._id;

                const distanceKm = getDistanceToFounder(liveUserCoords, founder);
                const rating = ratingsCache[founder._id] || { averageStars: 5.0, totalRatings: 1 };

                const lookingFor = Array.isArray(founder.lookingFor)
                  ? founder.lookingFor
                  : typeof founder.lookingFor === "string"
                  ? [founder.lookingFor]
                  : [];

                return (
                  <div className="col-12 col-md-6 col-xl-4" key={founder._id}>
                    <div className="card foundmet-card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column bg-white">
                      
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
                              {isConnected ? "✓ Connected" : isPending ? "Requested" : "+ Connect"}
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
                onClick={() => {
                  setSearch("");
                  setActiveTab("all");
                  setStageFilter("all");
                  setDistanceFilter("all");
                }}
                className="btn btn-outline-primary rounded-pill px-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

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