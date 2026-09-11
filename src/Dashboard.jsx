import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import RatingModal from "./components/RatingModal.jsx";
import api from "./services/api.js";
import { disconnectSocket } from "./services/socket.js";
import { notifyBrowser } from "./services/notifications.js";
import "./global.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [messageSearch, setMessageSearch] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Read current user session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Read connections
  const [connections, setConnections] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_connections");
      if (stored) return JSON.parse(stored);
      return {};
    } catch {
      return {};
    }
  });
  const [connectionProfiles, setConnectionProfiles] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [connectionNotifications, setConnectionNotifications] = useState([]);
  const [connectionError, setConnectionError] = useState("");

  // Stored phone sharing
  const [sharedPhones, setSharedPhones] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_shared_phones");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Ideas state
  const [ideas, setIdeas] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_user_ideas");
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: "idea_1",
              title: "AI Co-Founder Matchmaking",
              category: "Productivity",
              status: "Validating",
              notes:
                "Algorithm matching complementary skills, founder stage, and proximity radius within 50-80 km.",
            },
          ];
    } catch {
      return [];
    }
  });
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaCategory, setNewIdeaCategory] = useState("SaaS");
  const [newIdeaNotes, setNewIdeaNotes] = useState("");

  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");

  // Projects editor state
  const [projectForm, setProjectForm] = useState({
    details: currentUser?.projectDetails || "",
    status: currentUser?.projectStatus || "development",
    link: currentUser?.projectLink || "",
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phoneNumber || "+91 98200 12345",
    address: currentUser?.address || "Bangalore, India",
    role: currentUser?.role || "founder",
    matchRole: currentUser?.matchRole || "co-founder",
    canBring: currentUser?.canBring || [],
    buildType: currentUser?.buildType || "not-sure",
    commitment: currentUser?.commitment || "exploring",
    projectDetails: currentUser?.projectDetails || "",
    projectLink: currentUser?.projectLink || "",
    projectStatus: currentUser?.projectStatus || "idea",
    hasProject: currentUser?.hasProject || "no",
    allowPhoneRequest: true,
    discoverableNearby: true,
  });

  useEffect(() => {
    let active = true;
    api
      .get("/auth/me")
      .then(({ data }) => {
        const user = data?.user || data?.data?.user;
        if (active && user) {
          setCurrentUser(user);
          setSettingsForm((previous) => ({
            ...previous,
            name: user.name || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            address: user.address || "",
            role: user.role || "founder",
            matchRole: user.matchRole || "co-founder",
            canBring: user.canBring || [],
            buildType: user.buildType || "not-sure",
            commitment: user.commitment || "exploring",
            projectDetails: user.projectDetails || "",
            projectLink: user.projectLink || "",
            projectStatus: user.projectStatus || "idea",
            hasProject: user.hasProject || "no",
            allowPhoneRequest: user.allowPhoneRequest !== false,
            discoverableNearby: user.discoverableNearby !== false,
          }));
          localStorage.setItem("foundmet_user", JSON.stringify(user));
        }
      })
      .catch((error) => {
        const code = error.response?.data?.errorCode;
        const status = error.response?.status;
        if (status === 401 || code === "ACCOUNT_BANNED" || code === "ACCOUNT_SUSPENDED" || code === "ACCOUNT_UNAVAILABLE") {
          localStorage.removeItem("foundmet_user");
          setCurrentUser(null);
          navigate("/login", { replace: true });
        }
      })
      .finally(() => {
        if (active) setIsLoadingSession(false);
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;
    api
      .get("/api/v1/posts")
      .then(({ data }) => setPosts(data.posts || []))
      .catch((error) =>
        console.warn(
          "Posts unavailable:",
          error.response?.data?.message || error.message,
        ),
      );
    return undefined;
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;
    let active = true;
    api
      .get("/api/v1/connections", { timeout: 8000 })
      .then(({ data }) => {
        if (!active || !data?.success) return;
        setConnectionError("");
        const profiles = (data.connected || [])
          .map((connection) => {
            const profile =
              String(connection.fromUser?._id) === String(currentUser._id)
                ? connection.toUser
                : connection.fromUser;
            return profile
              ? { ...profile, connectionId: connection._id }
              : null;
          })
          .filter(Boolean);
        setConnectionProfiles(profiles);
        setReceivedRequests(data.receivedRequests || []);
        setConnectionNotifications([
          ...(data.receivedRequests || []).map((connection) => ({
            id: `request-${connection._id}`,
            title: `${connection.fromUser?.name || "A founder"} sent you a connection request`,
            detail: "Open Connections to review this request.",
            icon: "bi-person-plus",
            tone: "primary",
          })),
          ...(data.connected || []).map((connection) => ({
            id: `connected-${connection._id}`,
            title: "A connection was accepted",
            detail: "You can now message this founder.",
            icon: "bi-check2-circle",
            tone: "success",
          })),
        ]);
        if (data.receivedRequests?.length) {
          const newest = data.receivedRequests[0];
          notifyBrowser(
            "New connection request",
            `${newest.fromUser?.name || "A founder"} wants to connect with you.`,
          );
        }
        const statuses = {};
        (data.sentRequests || []).forEach((connection) => {
          const other =
            String(connection.fromUser?._id) === String(currentUser._id)
              ? connection.toUser
              : connection.fromUser;
          if (other?._id) statuses[other._id] = "pending";
        });
        (data.receivedRequests || []).forEach((connection) => {
          const other =
            String(connection.fromUser?._id) === String(currentUser._id)
              ? connection.toUser
              : connection.fromUser;
          if (other?._id) statuses[other._id] = "pending";
        });
        profiles.forEach((profile) => {
          statuses[profile._id] = "connected";
        });
        setConnections(statuses);
        localStorage.setItem("foundmet_connections", JSON.stringify(statuses));
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("foundmet_user");
          setCurrentUser(null);
          navigate("/login", { replace: true });
          return;
        }
        setConnectionError(
          error.response?.data?.message ||
            "Connections are temporarily unavailable.",
        );
      });
    return () => {
      active = false;
    };
  }, [currentUser?._id, navigate]);

  // Chat & Rating modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatContact, setActiveChatContact] = useState(null);
  const [ratingFounder, setRatingFounder] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3500);
  };

  const handleLogout = () => {
    api.post("/auth/logout").catch(() => {});
    disconnectSocket();
    localStorage.removeItem("foundmet_user");
    sessionStorage.removeItem("foundmet_access_token");
    setCurrentUser(null);
    navigate("/login");
  };

  const removeConnection = async (id, name) => {
    const profile = connectionProfiles.find(
      (item) => String(item._id) === String(id),
    );
    if (!profile?.connectionId) return;
    try {
      await api.delete(`/api/v1/connections/${profile.connectionId}`);
      setConnectionProfiles((previous) =>
        previous.filter((item) => String(item._id) !== String(id)),
      );
      setConnections((previous) => {
        const updated = { ...previous };
        delete updated[id];
        localStorage.setItem("foundmet_connections", JSON.stringify(updated));
        return updated;
      });
      if (String(activeChatContact?._id) === String(id)) setIsChatOpen(false);
      showToast(`Removed connection with ${name}`);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Could not remove connection.",
      );
    }
  };

  const openChatWith = (founder) => {
    if (!currentUser?._id || connections[founder?._id] !== "connected") {
      showToast("Chat is available only with accepted connections.");
      return;
    }
    setActiveChatContact(founder);
    setIsChatOpen(true);
  };

  const messageContacts = connectionProfiles.filter((founder) =>
    `${founder.name} ${founder.role} ${founder.projectDetails || ""}`
      .toLowerCase()
      .includes(messageSearch.trim().toLowerCase()),
  );

  const respondToConnection = async (connectionId, status) => {
    try {
      await api.put(`/api/v1/connections/${connectionId}`, { status });
      setReceivedRequests((previous) =>
        previous.filter((item) => item._id !== connectionId),
      );
      showToast(
        status === "accepted"
          ? "Connection accepted. You can now message them."
          : "Connection request declined.",
      );
      if (status === "accepted") {
        const { data } = await api.get("/api/v1/connections", {
          timeout: 8000,
        });
        const profiles = (data.connected || [])
          .map((connection) => {
            const profile =
              String(connection.fromUser?._id) === String(currentUser._id)
                ? connection.toUser
                : connection.fromUser;
            return profile
              ? { ...profile, connectionId: connection._id }
              : null;
          })
          .filter(Boolean);
        setConnectionProfiles(profiles);
        const statuses = {};
        profiles.forEach((profile) => {
          statuses[profile._id] = "connected";
        });
        setConnections(statuses);
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || "Could not update connection request.",
      );
    }
  };

  // Request Mobile Number
  const handleRequestPhone = (founder) => {
    openChatWith(founder);
    showToast(`Ask ${founder.name} to share their number in chat.`);
  };

  // Save Project Changes
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const { data } = await api.patch("/auth/me", {
        hasProject: "yes",
        projectDetails: projectForm.details.trim(),
        projectStatus: projectForm.status,
        projectLink: projectForm.link.trim(),
      });
      setCurrentUser(data.user);
      localStorage.setItem("foundmet_user", JSON.stringify(data.user));
      showToast("Project saved.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not save project.");
    }
  };

  const handleDeleteProject = async () => {
    try {
      const { data } = await api.patch("/auth/me", {
        hasProject: "no",
        projectDetails: "",
        projectLink: "",
        projectStatus: null,
      });
      setCurrentUser(data.user);
      setProjectForm({ details: "", status: "development", link: "" });
      localStorage.setItem("foundmet_user", JSON.stringify(data.user));
      showToast("Project removed.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not remove project.");
    }
  };

  // Save Profile Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    api
      .patch("/auth/me", {
        name: settingsForm.name.trim(),
        address: settingsForm.address.trim(),
        phoneNumber: settingsForm.phone.trim(),
        role: settingsForm.role,
        matchRole: settingsForm.matchRole,
        canBring: settingsForm.canBring,
        buildType: settingsForm.buildType,
        commitment: settingsForm.commitment,
        projectDetails: settingsForm.projectDetails,
        projectLink: settingsForm.projectLink,
        projectStatus: settingsForm.projectStatus,
        hasProject: settingsForm.hasProject,
        allowPhoneRequest: settingsForm.allowPhoneRequest,
        discoverableNearby: settingsForm.discoverableNearby,
      })
      .then(({ data }) => {
        setCurrentUser(data.user);
        localStorage.setItem("foundmet_user", JSON.stringify(data.user));
        showToast("Profile settings saved successfully!");
      })
      .catch((error) => {
        showToast(error.response?.data?.message || "Could not save settings.");
      });
  };

  // Add new startup idea
  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    const newIdea = {
      id: `idea_${Date.now()}`,
      title: newIdeaTitle.trim(),
      category: newIdeaCategory,
      status: "Exploring",
      notes: newIdeaNotes.trim(),
    };

    const updated = [newIdea, ...ideas];
    setIdeas(updated);
    localStorage.setItem("foundmet_user_ideas", JSON.stringify(updated));
    setNewIdeaTitle("");
    setNewIdeaNotes("");
    showToast("New startup idea added to backlog!");
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    const text = newPostText.trim();
    if (!text || !currentUser) return;

    try {
      const { data } = await api.post("/api/v1/posts", { text });
      setPosts((previous) => [data.post, ...previous]);
      setNewPostText("");
      showToast("Post published.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not publish post.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await api.delete(`/api/v1/posts/${postId}`);
      setPosts((previous) => previous.filter((post) => post._id !== postId));
      showToast("Post deleted.");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not delete post.");
    }
  };

  const handleLikePost = async (post) => {
    try {
      const { data } = await api.post(`/api/v1/posts/${post._id}/like`);
      setPosts((previous) =>
        previous.map((item) =>
          item._id === post._id
            ? { ...item, liked: data.liked, likeCount: data.likeCount }
            : item,
        ),
      );
    } catch (error) {
      showToast(error.response?.data?.message || "Could not update like.");
    }
  };

  const totalConnectionsCount = Object.keys(connections).length;

  // Unauthenticated screen: CLEAN, NO DEMO LINKS
  if (isLoadingSession && !currentUser) {
    return (
      <div className="min-vh-100 bg-background d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            aria-label="Loading dashboard"
          ></div>
          <p className="small text-secondary mb-0">Loading your workspace</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="dashboard-page min-vh-100 bg-background d-flex flex-column">
        <Header />
        <div className="container my-auto py-5 text-center">
          <div
            className="card foundmet-card border-0 shadow-sm p-4 p-md-5 mx-auto bg-white"
            style={{ maxWidth: "480px" }}
          >
            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mx-auto mb-3">
              <i className="bi bi-person-lock fs-1"></i>
            </div>
            <h3 className="fw-bold mb-2">Founder Dashboard</h3>
            <p className="text-secondary small mb-4">
              Please sign in to access your startup milestones, connections, and
              live messages.
            </p>
            <div className="d-grid gap-2">
              <Link
                to="/login"
                className="btn btn-foundmet py-2 rounded-pill fw-bold"
              >
                Sign In to Your Account
              </Link>
              <Link
                to="/register"
                className="btn btn-outline-primary py-2 rounded-pill fw-semibold"
              >
                Create Founder Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      {/* Floating Toast */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 m-4 p-3 bg-dark text-white rounded-4 shadow-lg d-flex align-items-center gap-3 animate-fade-in"
          style={{ zIndex: 1065 }}
        >
          <i className="bi bi-info-circle-fill text-primary fs-5"></i>
          <span className="small fw-semibold">{toastMessage}</span>
          <button
            type="button"
            className="btn-close btn-close-white ms-auto"
            onClick={() => setToastMessage("")}
          ></button>
        </div>
      )}

      <div className="container-fluid flex-grow-1 px-lg-4 py-4">
        {connectionError && (
          <div
            className="alert alert-warning d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"
            role="alert"
          >
            <span>
              <i className="bi bi-wifi-off me-2" />
              {connectionError}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-warning"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}
        <div className="row g-4">
          {/* ================= SIDEBAR ================= */}
          <div className="col-12 col-lg-3 col-xl-2">
            <div
              className="dashboard-sidebar card foundmet-card border-0 shadow-sm p-3 sticky-top bg-white"
              style={{ top: "85px" }}
            >
              {/* Profile Card */}
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

              {/* Menu Links */}
              <nav
                className="dashboard-menu nav flex-column gap-1"
                aria-label="Dashboard sections"
              >
                {[
                  {
                    key: "overview",
                    label: "Overview",
                    icon: "bi-speedometer2",
                  },
                  {
                    key: "posts",
                    label: "Posts",
                    icon: "bi-pencil-square",
                    count: posts.length,
                  },
                  {
                    key: "connections",
                    label: "Connections",
                    icon: "bi-people",
                    count: totalConnectionsCount,
                  },
                  {
                    key: "messages",
                    label: "Messages / Chat",
                    icon: "bi-chat-dots-fill",
                  },
                  {
                    key: "projects",
                    label: "My Project",
                    icon: "bi-rocket-takeoff",
                  },
                  {
                    key: "ideas",
                    label: "Startup Ideas",
                    icon: "bi-lightbulb",
                    count: ideas.length,
                  },
                  {
                    key: "notifications",
                    label: "Alerts",
                    icon: "bi-bell",
                    count:
                      connectionNotifications.length +
                      (currentUser.congratulations?.length || 0),
                  },
                  { key: "settings", label: "Settings", icon: "bi-gear" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
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
                    {item.count !== undefined && (
                      <span
                        className={`badge rounded-pill ${activeTab === item.key ? "bg-white text-primary" : "bg-primary text-white"}`}
                        style={{ fontSize: "10px" }}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}

                <hr className="my-2" />

                <Link
                  to="/explore"
                  className="btn btn-light text-start text-primary fw-semibold px-3 py-2 rounded-3 small"
                >
                  <i className="bi bi-compass me-2"></i>
                  Explore Feed
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline-danger text-start px-3 py-2 rounded-3 mt-2 small"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Log Out
                </button>
              </nav>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="col-12 col-lg-9 col-xl-10">
            {/* Top Welcome Hero */}
            <div
              className="p-4 rounded-4 text-white mb-4 position-relative overflow-hidden shadow-sm"
              style={{
                background: "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
              }}
            >
              <div className="row align-items-center">
                <div className="col-md-8">
                  <span className="badge bg-white text-primary rounded-pill px-3 py-1 fw-bold mb-2 small">
                    Founder Workspace
                  </span>
                  <h2 className="fw-bold mb-1">
                    Welcome back, {currentUser.name}! 👋
                  </h2>
                  <p className="opacity-90 small mb-0">
                    {currentUser.hasProject === "yes"
                      ? "Your venture is live and visible to builders within your proximity radius."
                      : "Looking for exciting co-founder synergies and startup opportunities."}
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <Link
                    to="/explore"
                    className="btn btn-light btn-sm rounded-pill fw-bold text-primary px-4 shadow-sm"
                  >
                    <i className="bi bi-search me-1"></i> Discover Founders
                  </Link>
                </div>
              </div>
            </div>

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="d-flex flex-column gap-4">
                {/* KPI Metrics */}
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="card foundmet-card border-0 shadow-sm p-3 text-center bg-white">
                      <div className="role-icon mx-auto mb-2 bg-primary-subtle text-primary">
                        <i className="bi bi-people-fill fs-5"></i>
                      </div>
                      <h3 className="fw-bold mb-0">{totalConnectionsCount}</h3>
                      <small className="text-secondary">Connections</small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="card foundmet-card border-0 shadow-sm p-3 text-center bg-white">
                      <div className="role-icon mx-auto mb-2 bg-success-subtle text-success">
                        <i className="bi bi-star-fill fs-5"></i>
                      </div>
                      <h3 className="fw-bold mb-0">N/A</h3>
                      <small className="text-secondary">Reputation Score</small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="card foundmet-card border-0 shadow-sm p-3 text-center bg-white">
                      <div className="role-icon mx-auto mb-2 bg-info-subtle text-info">
                        <i className="bi bi-geo-alt-fill fs-5"></i>
                      </div>
                      <h3 className="fw-bold mb-0">N/A</h3>
                      <small className="text-secondary">
                        Nearby (&lt;80 km)
                      </small>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="card foundmet-card border-0 shadow-sm p-3 text-center bg-white">
                      <div className="role-icon mx-auto mb-2 bg-warning-subtle text-warning">
                        <i className="bi bi-telephone-check-fill fs-5"></i>
                      </div>
                      <h3 className="fw-bold mb-0">
                        {Object.keys(sharedPhones).length}
                      </h3>
                      <small className="text-secondary">Contacts Shared</small>
                    </div>
                  </div>
                </div>
                {receivedRequests.length > 0 && (
                  <div className="card border-0 shadow-sm p-3 mt-3">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-person-plus text-primary me-2"></i>
                      Connection requests
                    </h6>
                    {receivedRequests.map((request) => (
                      <div
                        className="border-top py-3 d-flex flex-wrap align-items-center justify-content-between gap-2"
                        key={request._id}
                      >
                        <div>
                          <strong>{request.fromUser?.name || "Founder"}</strong>
                          <small className="d-block text-secondary">
                            {request.message || "Wants to connect with you."}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary rounded-pill"
                            onClick={() =>
                              respondToConnection(request._id, "accepted")
                            }
                          >
                            Accept
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary rounded-pill"
                            onClick={() =>
                              respondToConnection(request._id, "rejected")
                            }
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Active Connections Table */}
                <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-main">
                      <i className="bi bi-people text-primary me-2"></i>
                      Connected Founders
                    </h5>
                    <Link
                      to="/explore"
                      className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                      Find More
                    </Link>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Founder</th>
                          <th>Location</th>
                          <th>Mobile Number</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {connectionProfiles.length === 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center text-secondary py-4"
                            >
                              No accepted connections yet. Discover founders to
                              start chatting.
                            </td>
                          </tr>
                        )}
                        {connectionProfiles.map((founder) => {
                          const isShared = !!sharedPhones[founder._id];
                          return (
                            <tr key={founder._id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={
                                      founder.photo ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name || "Founder")}&background=0B5CFF&color=fff&size=80`
                                    }
                                    alt={founder.name}
                                    className="rounded-circle border"
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <div>
                                    <strong className="d-block text-main small">
                                      {founder.name}
                                    </strong>
                                    <span
                                      className="badge bg-primary-subtle text-primary text-capitalize"
                                      style={{ fontSize: "9px" }}
                                    >
                                      {founder.role}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <small className="text-secondary">
                                  {founder.address}
                                </small>
                              </td>
                              <td>
                                {isShared ? (
                                  <div className="d-flex align-items-center gap-2">
                                    <strong className="text-success small">
                                      {founder.phoneNumber}
                                    </strong>
                                    {founder.phoneNumber && (
                                      <a
                                        href={`https://wa.me/${String(founder.phoneNumber).replace(/[^0-9]/g, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-xs btn-success rounded-pill px-2 py-0"
                                        style={{ fontSize: "10px" }}
                                      >
                                        <i className="bi bi-whatsapp"></i>
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestPhone(founder)}
                                    className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-0"
                                    style={{ fontSize: "11px" }}
                                  >
                                    <i className="bi bi-telephone-plus me-1"></i>{" "}
                                    Request
                                  </button>
                                )}
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openChatWith(founder)}
                                    className="btn btn-sm btn-primary rounded-pill px-3 py-1"
                                    style={{ fontSize: "11px" }}
                                  >
                                    <i className="bi bi-chat-dots me-1"></i>{" "}
                                    Chat
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRatingFounder(founder)}
                                    className="btn btn-sm btn-outline-warning text-dark rounded-pill px-2 py-1"
                                    style={{ fontSize: "11px" }}
                                    title="Rate Founder"
                                  >
                                    <i className="bi bi-star-fill text-warning"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "posts" && (
              <div className="d-flex flex-column gap-3">
                <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                  <h5 className="fw-bold mb-1 text-main">Share an update</h5>
                  <p className="small text-secondary mb-3">
                    Post progress, ideas, or what you need next.
                  </p>
                  <form onSubmit={handleAddPost}>
                    <textarea
                      className="form-control mb-3"
                      rows="4"
                      maxLength="1000"
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="What are you building?"
                      required
                    />
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-secondary">
                        {newPostText.length}/1000
                      </small>
                      <button
                        type="submit"
                        className="btn btn-foundmet rounded-pill px-4"
                      >
                        <i className="bi bi-send me-1"></i> Publish
                      </button>
                    </div>
                  </form>
                </div>
                {posts.length === 0 ? (
                  <div className="card foundmet-card border-0 shadow-sm p-4 bg-white text-center text-secondary">
                    No posts yet.
                  </div>
                ) : (
                  posts.map((post) => (
                    <article
                      key={post._id}
                      className="card foundmet-card border-0 shadow-sm p-4 bg-white"
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <img
                          src={
                            post.author?.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "Founder")}`
                          }
                          alt=""
                          className="rounded-circle"
                          style={{
                            width: "36px",
                            height: "36px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <strong className="small d-block">
                            {post.author?.name || "Founder"}
                          </strong>
                          <small className="text-secondary">
                            {new Date(post.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <p
                        className="mb-0 text-main"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {post.text}
                      </p>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          type="button"
                          className={`btn btn-sm ${post.liked ? "btn-primary" : "btn-outline-primary"} rounded-pill`}
                          onClick={() => handleLikePost(post)}
                        >
                          <i className="bi bi-heart me-1"></i>
                          {post.likeCount || 0} Like
                          {post.likeCount === 1 ? "" : "s"}
                        </button>
                        {String(post.author?._id) ===
                          String(currentUser?._id) && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* TAB: CONNECTIONS */}
            {activeTab === "connections" && (
              <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-main">
                      Your Co-Founder Network
                    </h5>
                    <p className="small text-secondary mb-0">
                      Chat in real-time and request mobile numbers for direct
                      phone calls.
                    </p>
                  </div>
                  <Link
                    to="/explore"
                    className="btn btn-foundmet btn-sm rounded-pill px-3"
                  >
                    + Find More Founders
                  </Link>
                </div>

                <div className="row g-3">
                  {connectionProfiles.map((founder) => {
                    const isShared = !!sharedPhones[founder._id];
                    return (
                      <div className="col-12 col-md-6" key={founder._id}>
                        <div className="p-3 border rounded-3 bg-light h-100 d-flex flex-column justify-content-between">
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <img
                              src={
                                founder.photo ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name || "Founder")}&background=0B5CFF&color=fff&size=80`
                              }
                              alt={founder.name}
                              className="rounded-circle border"
                              style={{
                                width: "48px",
                                height: "48px",
                                objectFit: "cover",
                              }}
                            />
                            <div>
                              <strong className="text-main d-block">
                                {founder.name}
                              </strong>
                              <span
                                className="badge bg-primary text-white text-capitalize"
                                style={{ fontSize: "10px" }}
                              >
                                {founder.role}
                              </span>
                              <small
                                className="text-secondary d-block"
                                style={{ fontSize: "11px" }}
                              >
                                <i className="bi bi-geo-alt me-1"></i>{" "}
                                {founder.address}
                              </small>
                            </div>
                          </div>

                          <p className="small text-secondary mb-3 line-clamp-2">
                            {founder.projectDetails}
                          </p>

                          {/* Mobile Number Strip */}
                          <div className="p-2 bg-white rounded border mb-3 d-flex align-items-center justify-content-between">
                            <small className="text-secondary">
                              <i className="bi bi-telephone text-primary me-1"></i>
                              {isShared
                                ? founder.phoneNumber
                                : "Mobile number is private"}
                            </small>
                            {isShared ? (
                              <div className="d-flex gap-1">
                                <a
                                  href={`https://wa.me/${String(founder.phoneNumber || "").replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-xs btn-success rounded-pill px-2"
                                  style={{ fontSize: "10px" }}
                                >
                                  WhatsApp
                                </a>
                                <a
                                  href={`tel:${founder.phoneNumber}`}
                                  className="btn btn-xs btn-outline-primary rounded-pill px-2"
                                  style={{ fontSize: "10px" }}
                                >
                                  Call
                                </a>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRequestPhone(founder)}
                                className="btn btn-xs btn-outline-primary rounded-pill px-2"
                                style={{ fontSize: "10px" }}
                              >
                                Request Number
                              </button>
                            )}
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              onClick={() => openChatWith(founder)}
                              className="btn btn-primary btn-sm rounded-pill flex-grow-1"
                            >
                              <i className="bi bi-chat-dots me-1"></i> Chat
                            </button>
                            <button
                              type="button"
                              onClick={() => setRatingFounder(founder)}
                              className="btn btn-outline-warning text-dark btn-sm rounded-pill px-3"
                            >
                              <i className="bi bi-star-fill text-warning me-1"></i>{" "}
                              Endorse
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                removeConnection(founder._id, founder.name)
                              }
                              className="btn btn-outline-danger btn-sm rounded-pill px-2"
                              title="Remove"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: MESSAGES / CHAT */}
            {activeTab === "messages" && (
              <div className="messages-workspace">
                <div className="messages-heading">
                  <div>
                    <span className="admin-eyebrow">YOUR NETWORK</span>
                    <h5 className="fw-bold mb-1 text-main">Messages</h5>
                    <p className="small text-secondary mb-0">
                      Message accepted connections privately and secure
                 
                    </p>
                  </div>
                  <span className="badge rounded-pill bg-primary-subtle text-primary">
                    {connectionProfiles.length} connections
                  </span>
                </div>
                <div className="messages-search">
                  <i className="bi bi-search" />
                  <input
                    aria-label="Search connections to message"
                    value={messageSearch}
                    onChange={(event) => setMessageSearch(event.target.value)}
                    placeholder="Search your connections"
                  />
                </div>
                {messageContacts.length > 0 ? (
                  <div className="messages-list">
                    {messageContacts.map((founder) => (
                      <button
                        type="button"
                        className="message-contact"
                        onClick={() => openChatWith(founder)}
                        key={founder._id}
                      >
                        <img
                          src={
                            founder.photo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(founder.name || "Founder")}&background=0B5CFF&color=fff&size=80`
                          }
                          alt=""
                        />
                        <span className="message-contact-copy">
                          <strong>{founder.name}</strong>
                          <small>
                            {founder.role || "Founder"} ·{" "}
                            {founder.projectDetails ||
                              "Start a professional conversation"}
                          </small>
                        </span>
                        <span className="message-contact-action">
                          <i className="bi bi-chat-dots" /> Message
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="messages-empty">
                    <i className="bi bi-chat-square-text" />
                    <h6>
                      {connectionProfiles.length
                        ? "No matching connections"
                        : "No accepted connections yet"}
                    </h6>
                    <p>
                      {connectionProfiles.length
                        ? "Try another name or role."
                        : "Connect with a founder first. Messaging unlocks after they accept your request."}
                    </p>
                    <Link
                      to="/explore"
                      className="btn btn-foundmet btn-sm rounded-pill px-4"
                    >
                      Find founders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY PROJECT */}
            {activeTab === "projects" && (
              <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                <h5 className="fw-bold mb-1 text-main">
                  Manage Your Startup Venture
                </h5>
                <p className="small text-secondary mb-4">
                  Update your project description, stage, and demo links for
                  co-founders to view.
                </p>

                <form onSubmit={handleSaveProject}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">
                      Project Stage
                    </label>
                    <select
                      className="form-select"
                      value={projectForm.status}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="idea">Idea Stage (Validating)</option>
                      <option value="development">
                        In Development (Building MVP)
                      </option>
                      <option value="execution">
                        Execution / Live Product
                      </option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">
                      Elevator Pitch & Project Details
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={projectForm.details}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          details: e.target.value,
                        })
                      }
                      placeholder="What problem does your startup solve and who are you looking for?"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">
                      Project or GitHub Link
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      value={projectForm.link}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, link: e.target.value })
                      }
                      placeholder="https://yourstartup.com or https://github.com/..."
                    />
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="btn btn-foundmet rounded-pill px-4 fw-semibold"
                    >
                      <i className="bi bi-check2-circle me-1"></i> Save Startup
                      Details
                    </button>
                    {currentUser?.hasProject === "yes" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger rounded-pill px-4"
                        onClick={handleDeleteProject}
                      >
                        Delete Project
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* TAB: STARTUP IDEAS */}
            {activeTab === "ideas" && (
              <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-main">
                      Startup Ideas Backlog
                    </h5>
                    <p className="small text-secondary mb-0">
                      Record, organize, and validate early startup concepts.
                    </p>
                  </div>
                </div>

                {/* Add Idea Card */}
                <form
                  onSubmit={handleAddIdea}
                  className="p-3 border rounded-3 bg-light mb-4"
                >
                  <h6 className="fw-bold small mb-2">+ Add New Concept</h6>
                  <div className="row g-2 mb-2">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Startup Idea Title (e.g. AI Workflow for Clinics)"
                        value={newIdeaTitle}
                        onChange={(e) => setNewIdeaTitle(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select form-select-sm"
                        value={newIdeaCategory}
                        onChange={(e) => setNewIdeaCategory(e.target.value)}
                      >
                        <option value="SaaS">SaaS & B2B</option>
                        <option value="AI / ML">AI & Machine Learning</option>
                        <option value="Fintech">Fintech</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="Consumer">Consumer & Mobile</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-2">
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="Quick summary or hypothesis..."
                      value={newIdeaNotes}
                      onChange={(e) => setNewIdeaNotes(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-pill px-3"
                  >
                    Save to Ideas
                  </button>
                </form>

                {/* Ideas List */}
                <div className="d-flex flex-column gap-2">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-3 border rounded-3 d-flex justify-content-between align-items-start"
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong className="text-main small">
                            {idea.title}
                          </strong>
                          <span
                            className="badge bg-primary-subtle text-primary"
                            style={{ fontSize: "10px" }}
                          >
                            {idea.category}
                          </span>
                        </div>
                        <p className="text-secondary small mb-0">
                          {idea.notes || "No notes yet."}
                        </p>
                      </div>
                      <span className="badge bg-light text-secondary border">
                        {idea.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ALERTS / NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                <h5 className="fw-bold mb-1 text-main">
                  Founder Alerts & Notifications
                </h5>
                <p className="small text-secondary mb-4">
                  Stay updated on connection acceptances, ratings, and contact
                  requests.
                </p>

                <div className="d-flex flex-column gap-2">
                  {connectionNotifications.map((item) => (
                    <div
                      className="p-3 border rounded-3 bg-light d-flex align-items-center gap-3"
                      key={item.id}
                    >
                      <div
                        className={`rounded-circle bg-${item.tone}-subtle text-${item.tone} p-2`}
                      >
                        <i className={`bi ${item.icon} fs-5`}></i>
                      </div>
                      <div>
                        <strong className="small text-main d-block">
                          {item.title}
                        </strong>
                        <small className="text-secondary">{item.detail}</small>
                      </div>
                    </div>
                  ))}
                  {(currentUser.congratulations || []).map((item, index) => (
                    <div
                      className="p-3 border rounded-3 bg-success-subtle d-flex align-items-center gap-3"
                      key={`${item.createdAt}-${index}`}
                    >
                      <div className="rounded-circle bg-success text-white p-2">
                        <i className="bi bi-trophy-fill fs-5"></i>
                      </div>
                      <div>
                        <strong className="small text-main d-block">
                          FoundMet congratulations!
                        </strong>
                        <small className="text-secondary">{item.message}</small>
                      </div>
                    </div>
                  ))}
                  {!currentUser.congratulations?.length && (
                    <div className="text-center py-4 text-secondary small">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="card foundmet-card border-0 shadow-sm p-4 bg-white">
                <h5 className="fw-bold mb-1 text-main">
                  Profile & Privacy Settings
                </h5>
                <p className="small text-secondary mb-4">
                  Manage your public profile details and mobile number
                  visibility preferences.
                </p>

                <form onSubmit={handleSaveSettings}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.name}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">
                          I am looking for
                        </label>
                        <select
                          className="form-select"
                          value={settingsForm.matchRole}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              matchRole: e.target.value,
                            })
                          }
                        >
                          <option value="co-founder">Co-founder</option>
                          <option value="builder">Someone to build with</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">
                          Build focus
                        </label>
                        <select
                          className="form-select"
                          value={settingsForm.buildType}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              buildType: e.target.value,
                            })
                          }
                        >
                          <option value="startup">Startup</option>
                          <option value="product">Product</option>
                          <option value="business">Business</option>
                          <option value="not-sure">Not sure yet</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">
                          Commitment
                        </label>
                        <select
                          className="form-select"
                          value={settingsForm.commitment}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              commitment: e.target.value,
                            })
                          }
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="exploring">Exploring</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">
                        What can you bring?
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {[
                          "technology",
                          "business",
                          "design",
                          "marketing",
                          "product",
                          "other",
                        ].map((item) => (
                          <button
                            type="button"
                            key={item}
                            className={`btn btn-sm rounded-pill ${settingsForm.canBring.includes(item) ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() =>
                              setSettingsForm({
                                ...settingsForm,
                                canBring: settingsForm.canBring.includes(item)
                                  ? settingsForm.canBring.filter(
                                      (value) => value !== item,
                                    )
                                  : [...settingsForm.canBring, item],
                              })
                            }
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-8">
                        <label className="form-label small fw-bold text-secondary">
                          Project details
                        </label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={settingsForm.projectDetails}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              projectDetails: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">
                          Project stage
                        </label>
                        <select
                          className="form-select"
                          value={settingsForm.projectStatus}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              projectStatus: e.target.value,
                            })
                          }
                        >
                          <option value="idea">Idea</option>
                          <option value="development">Development</option>
                          <option value="execution">Execution</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={settingsForm.email}
                        disabled
                      />
                      <small
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        Email cannot be changed.
                      </small>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">
                        Mobile Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.phone}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="+91 98765 43210"
                      />
                      <small
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        Private until shared with connected founders.
                      </small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">
                        City / Region (For 50-80 km search)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={settingsForm.address}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="e.g. Bangalore, India"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 border mb-4">
                    <h6 className="fw-bold small mb-2">
                      Privacy & Visibility Preferences
                    </h6>
                    <div className="form-check form-switch mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="allowPhoneReq"
                        checked={settingsForm.allowPhoneRequest}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            allowPhoneRequest: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="allowPhoneReq"
                      >
                        Allow accepted connections to request my mobile number
                      </label>
                    </div>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="discoverNearby"
                        checked={settingsForm.discoverableNearby}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            discoverableNearby: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="discoverNearby"
                      >
                        Make my profile discoverable to founders within 50 to 80
                        km
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-foundmet rounded-pill px-4 fw-bold"
                  >
                    Save Profile Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Socket.IO Chat Window */}
      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialContact={activeChatContact}
        currentUser={currentUser}
        connections={connections}
        availableFounders={connectionProfiles}
      />

      {/* Founder Rating Modal */}
      <RatingModal
        isOpen={!!ratingFounder}
        onClose={() => setRatingFounder(null)}
        targetFounder={ratingFounder}
        currentUser={currentUser}
        onRatingSubmitted={() =>
          showToast("Endorsement submitted successfully!")
        }
      />
    </div>
  );
}
