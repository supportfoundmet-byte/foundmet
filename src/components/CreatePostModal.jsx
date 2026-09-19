import { useState } from "react";
import api from "../services/api.js";

const CATEGORIES = [
  { key: "seeking_cofounder", label: "Seeking Co-Founder", icon: "bi-person-plus-fill", badge: "bg-primary text-white" },
  { key: "milestone", label: "Milestone", icon: "bi-trophy-fill", badge: "bg-success text-white" },
  { key: "idea", label: "Startup Idea", icon: "bi-lightbulb-fill", badge: "bg-warning text-dark" },
  { key: "tech", label: "Tech Stack", icon: "bi-code-slash", badge: "bg-info text-dark" },
  { key: "general", label: "General Update", icon: "bi-chat-left-text-fill", badge: "bg-secondary text-white" },
];

export default function CreatePostModal({ isOpen, onClose, currentUser, onPostCreated }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("seeking_cofounder");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) {
      setError("Please write something to share.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await api.post("/api/v1/posts", {
        text: cleanText,
        category,
        mediaUrl: mediaUrl.trim(),
      });

      if (data?.success && data?.post) {
        setText("");
        setMediaUrl("");
        setShowMediaInput(false);
        if (onPostCreated) onPostCreated(data.post);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.userMessage || "Unable to publish post.");
    } finally {
      setSubmitting(false);
    }
  };

  const avatar =
    currentUser?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "Founder")}&background=0B5CFF&color=fff&size=96`;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(1, 25, 64, 0.65)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg px-2">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div className="modal-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between bg-white">
            <h5 className="modal-title fw-bold text-main fs-6 mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-pencil-square text-primary"></i> Create a post
            </h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Modal Body */}
            <div className="modal-body p-4 bg-white">
              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Author & Category Selection */}
              <div className="d-flex align-items-center gap-3 mb-3">
                <img
                  src={avatar}
                  alt={currentUser?.name || "User"}
                  className="rounded-circle border"
                  style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />
                <div className="flex-grow-1">
                  <div className="fw-bold text-main">{currentUser?.name || "Startup Founder"}</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <select
                      className="form-select form-select-sm rounded-pill border py-0 px-2 small w-auto"
                      style={{ fontSize: "0.8rem", cursor: "pointer" }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <span className="badge bg-light text-secondary border small rounded-pill">
                      <i className="bi bi-globe2 me-1"></i> Public
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                className="form-control border-0 px-0 fs-6 shadow-none"
                rows="6"
                placeholder="What do you want to talk about? Share an update, pitch an idea, or ask for a co-founder..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength="2000"
                autoFocus
                required
                style={{ resize: "none" }}
              />

              {/* Media URL Input toggle */}
              {showMediaInput && (
                <div className="mt-3 p-3 bg-light rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="small fw-semibold text-secondary mb-0">
                      <i className="bi bi-image me-1"></i> Image URL (HTTPS)
                    </label>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0 text-decoration-none small"
                      onClick={() => {
                        setShowMediaInput(false);
                        setMediaUrl("");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="url"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="https://images.unsplash.com/... or https://..."
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                  />
                  {mediaUrl && (
                    <div className="mt-2 text-center">
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="rounded-3 border img-fluid"
                        style={{ maxHeight: "180px", objectFit: "cover" }}
                        onError={() => setError("Image URL appears invalid or cannot be loaded.")}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top py-2 px-4 bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${showMediaInput ? "btn-primary" : "btn-outline-secondary"} rounded-pill d-flex align-items-center gap-1`}
                  onClick={() => setShowMediaInput((prev) => !prev)}
                  title="Add Image"
                >
                  <i className="bi bi-image-fill"></i>
                  <span className="small d-none d-sm-inline">Add Photo</span>
                </button>
                <span className="small text-secondary">
                  {text.length}/2000
                </span>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-pill px-3"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-foundmet btn-sm rounded-pill px-4 fw-bold shadow-sm"
                  disabled={submitting || !text.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Posting…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill me-1"></i> Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
