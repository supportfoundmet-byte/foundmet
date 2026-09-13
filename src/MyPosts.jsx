import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./services/api.js";
import Header from "./components/Header.jsx";
import { DashboardToast } from "./components/DashboardChrome.jsx";
import "./global.css";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("foundmet_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Recently"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

export default function MyPosts() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3500);
  };

  useEffect(() => {
    let active = true;

    Promise.all([api.get("/auth/me"), api.get("/api/v1/posts")])
      .then(([userResponse, postsResponse]) => {
        const user = userResponse.data?.user || userResponse.data?.data?.user;
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        if (!active) return;
        setCurrentUser(user);
        localStorage.setItem("foundmet_user", JSON.stringify(user));
        setPosts(postsResponse.data?.posts || []);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status === 401) {
          localStorage.removeItem("foundmet_user");
          navigate("/login", { replace: true });
          return;
        }
        setErrorMessage(
          requestError.response?.data?.message ||
            "We could not load your posts. Please try again.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const userPosts = useMemo(
    () =>
      posts.filter(
        (post) => String(post.author?._id) === String(currentUser?._id),
      ),
    [currentUser?._id, posts],
  );

  const handleLike = async (post) => {
    try {
      const { data } = await api.post(`/api/v1/posts/${post._id}/like`);
      setPosts((previous) =>
        previous.map((item) =>
          item._id === post._id
            ? { ...item, liked: data.liked, likeCount: data.likeCount }
            : item,
        ),
      );
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Could not update like.");
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;

    try {
      await api.delete(`/api/v1/posts/${postId}`);
      setPosts((previous) => previous.filter((post) => post._id !== postId));
      showToast("Post deleted.");
    } catch (requestError) {
      showToast(requestError.response?.data?.message || "Could not delete post.");
    }
  };

  const avatar =
    currentUser?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      currentUser?.name || "Founder",
    )}&background=0B5CFF&color=fff`;

  return (
    <div className="min-vh-100 bg-background">
      <DashboardToast
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />
      <Header />

      <main className="container py-4 py-lg-5">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <Link
              to="/dashboard"
              className="text-primary text-decoration-none small fw-semibold"
            >
              <i className="bi bi-arrow-left me-1" /> Back to dashboard
            </Link>
            <h1 className="fw-bold text-main mt-2 mb-1">My posts</h1>
            <p className="text-secondary mb-0">
              A home for the ideas, updates, and milestones you have shared.
            </p>
          </div>
          <Link to="/dashboard" className="btn btn-foundmet rounded-pill px-4">
            <i className="bi bi-plus-lg me-2" /> Share an update
          </Link>
        </div>

        {currentUser && (
          <section className="card foundmet-card border-0 shadow-sm p-4 mb-4 bg-white">
            <div className="d-flex align-items-center gap-3">
              <img
                src={avatar}
                alt=""
                className="rounded-circle"
                style={{ width: "56px", height: "56px", objectFit: "cover" }}
              />
              <div>
                <p className="small text-secondary mb-1">Your publishing space</p>
                <h2 className="h5 fw-bold text-main mb-0">{currentUser.name}</h2>
              </div>
              <div className="ms-auto text-end">
                <strong className="d-block fs-4 text-primary">
                  {userPosts.length}
                </strong>
                <span className="small text-secondary">
                  {userPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="card foundmet-card border-0 shadow-sm p-5 bg-white text-center">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-secondary mb-0">Loading your posts...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="alert alert-warning d-flex justify-content-between align-items-center gap-3">
            <span>
              <i className="bi bi-wifi-off me-2" />
              {errorMessage}
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

        {!loading && !errorMessage && userPosts.length === 0 && (
          <div className="card foundmet-card border-0 shadow-sm p-5 bg-white text-center">
            <div className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "64px", height: "64px" }}>
              <i className="bi bi-pencil-square fs-3" />
            </div>
            <h2 className="h5 fw-bold text-main">Your story starts here</h2>
            <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "440px" }}>
              Share what you are building, a milestone, or the kind of
              co-founder you want to meet.
            </p>
            <Link to="/dashboard" className="btn btn-foundmet rounded-pill px-4">
              Create your first post
            </Link>
          </div>
        )}

        {!loading && !errorMessage && userPosts.length > 0 && (
          <div className="row g-4">
            {userPosts.map((post) => (
              <div className="col-12 col-lg-6" key={post._id}>
                <article className="card foundmet-card border-0 shadow-sm p-4 bg-white h-100 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img
                      src={avatar}
                      alt=""
                      className="rounded-circle"
                      style={{ width: "42px", height: "42px", objectFit: "cover" }}
                    />
                    <div>
                      <strong className="d-block text-main">{currentUser.name}</strong>
                      <small className="text-secondary">{formatDate(post.createdAt)}</small>
                    </div>
                    <span className="badge rounded-pill bg-primary-subtle text-primary ms-auto">
                      Your post
                    </span>
                  </div>
                  <p className="text-main mb-4 flex-grow-1" style={{ whiteSpace: "pre-wrap" }}>
                    {post.text}
                  </p>
                  <div className="d-flex align-items-center gap-2 pt-3 border-top">
                    <button
                      type="button"
                      className={`btn btn-sm ${post.liked ? "btn-primary" : "btn-outline-primary"} rounded-pill`}
                      onClick={() => handleLike(post)}
                    >
                      <i className="bi bi-heart me-1" />
                      {post.likeCount || 0} Like{post.likeCount === 1 ? "" : "s"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill ms-auto"
                      onClick={() => handleDelete(post._id)}
                    >
                      <i className="bi bi-trash3 me-1" /> Delete
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
