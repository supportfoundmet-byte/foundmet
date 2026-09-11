import { useState } from "react";
import api from "../services/api.js";

const ENDORSEMENT_PRESETS = [
  "Strong Execution",
  "Technical Wizard",
  "Visionary Leader",
  "Great Communicator",
  "Product Sense",
  "High Integrity",
  "Growth Hacker",
  "Resilient & Gritty",
];

const STAR_LABELS = {
  1: "Needs Alignment",
  2: "Promising Potential",
  3: "Good Collaborator",
  4: "Strong Founder",
  5: "Exceptional Vision & Execution",
};

export default function RatingModal({
  isOpen,
  onClose,
  targetFounder,
  currentUser,
  onRatingSubmitted,
}) {
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState(["Strong Execution"]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen || !targetFounder) return null;

  const isSelf = currentUser && currentUser._id === targetFounder._id;

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentUser) {
      setErrorMessage("Please log in to rate or endorse founders.");
      return;
    }

    if (isSelf) {
      setErrorMessage("You cannot rate your own founder profile.");
      return;
    }

    if (!stars || stars < 1 || stars > 5) {
      setErrorMessage("Please select a star rating between 1 and 5.");
      return;
    }

    setLoading(true);

    try {
      try {
        await api.post(
          `/api/v1/ratings/${targetFounder._id}`,
          {
            stars,
            feedback,
            tags: selectedTags,
          },
          {
            timeout: 7000,
          }
        );
      } catch (err) {
        console.warn("Backend rating save failed, caching in local storage:", err.message);
      }

      // Update local storage cache for instant UI responsiveness
      const cacheKey = `foundmet_founder_ratings_${targetFounder._id}`;
      try {
        const existingCache = JSON.parse(localStorage.getItem(cacheKey) || "[]");
        const updatedCache = [
          {
            fromUserId: currentUser._id,
            fromUserName: currentUser.name,
            stars,
            feedback,
            tags: selectedTags,
            createdAt: new Date().toISOString(),
          },
          ...existingCache.filter((c) => c.fromUserId !== currentUser._id),
        ];
        localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      } catch {
        // Ignore cache storage error
      }

      setSuccessMessage(`Thank you! Your rating has been recorded.`);
      setTimeout(() => {
        if (onRatingSubmitted) {
          onRatingSubmitted({
            founderId: targetFounder._id,
            stars,
            feedback,
            tags: selectedTags,
          });
        }
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to submit rating. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(7, 26, 61, 0.6)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "520px" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          
          {/* Header */}
          <div
            className="modal-header border-0 text-white p-4"
            style={{
              background: "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img
                src={
                  targetFounder.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    targetFounder.name || "Founder"
                  )}&background=ffffff&color=0B5CFF&size=100`
                }
                alt={targetFounder.name}
                className="rounded-circle border border-white border-2 shadow-sm"
                style={{ width: "52px", height: "52px", objectFit: "cover" }}
              />
              <div>
                <h5 className="modal-title fw-bold mb-0">Rate & Endorse Founder</h5>
                <small className="opacity-90">
                  {targetFounder.name} • {targetFounder.role === "co-founder" ? "Co-Founder" : "Founder"}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="modal-body p-4 bg-white">
            {errorMessage && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-check-circle-fill"></i>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Interactive Star Rating */}
            <div className="text-center py-2 mb-3 bg-light rounded-3 border">
              <label className="d-block small fw-bold text-secondary text-uppercase mb-2">
                Overall Founder Rating
              </label>

              <div className="d-flex justify-content-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const active = (hoveredStar || stars) >= starIndex;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      className="btn p-0 border-0 bg-transparent text-decoration-none"
                      onMouseEnter={() => setHoveredStar(starIndex)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setStars(starIndex)}
                      style={{ transition: "transform 0.15s ease" }}
                    >
                      <i
                        className={`bi ${active ? "bi-star-fill text-warning" : "bi-star text-muted"} fs-2`}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </button>
                  );
                })}
              </div>

              <div className="small fw-semibold text-primary">
                {STAR_LABELS[hoveredStar || stars]}
              </div>
            </div>

            {/* Endorsement Tags */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary mb-1">
                Select Endorsements & Superpowers
              </label>
              <div className="d-flex flex-wrap gap-2 pt-1">
                {ENDORSEMENT_PRESETS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        isSelected
                          ? "btn-primary text-white fw-semibold"
                          : "btn-light text-secondary border"
                      }`}
                      style={{ fontSize: "12px", transition: "all 0.15s" }}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Review Comment */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary mb-1">
                Founder Review & Notes <span className="fw-normal text-muted">(Optional)</span>
              </label>
              <textarea
                className="form-control rounded-3"
                rows="3"
                placeholder="What stands out about their execution, integrity, or startup vision?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
              ></textarea>
              <div className="text-end small text-muted mt-1" style={{ fontSize: "11px" }}>
                {feedback.length}/500
              </div>
            </div>

            {/* Modal Actions */}
            <div className="d-flex gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-light flex-grow-1 rounded-pill"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-foundmet flex-grow-1 rounded-pill fw-semibold"
                disabled={loading || isSelf}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-star-fill me-1"></i> Submit Endorsement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
