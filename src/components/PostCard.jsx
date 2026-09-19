import { useState } from "react";
import api from "../services/api.js";

const CATEGORY_MAP = {
  seeking_cofounder: { label: "Seeking Co-Founder", color: "badge bg-primary text-white" },
  milestone: { label: "Milestone", color: "badge bg-success text-white" },
  idea: { label: "Startup Idea", color: "badge bg-warning text-dark" },
  tech: { label: "Tech Stack", color: "badge bg-info text-dark" },
  general: { label: "General", color: "badge bg-light text-secondary border" },
};

function formatTimeAgo(dateInput) {
  if (!dateInput) return "Just now";
  const diff = (Date.now() - new Date(dateInput).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateInput).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PostCard({
  post,
  currentUser,
  onDeletePost,
  onLikeChange,
  onSharePost,
}) {
  const [liked, setLiked] = useState(Boolean(post.liked));
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);

  // Comment section state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const isOwner = currentUser && String(post.author?._id) === String(currentUser._id);
  const categoryMeta = CATEGORY_MAP[post.category] || CATEGORY_MAP.general;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      showToast("Please sign in to like this post.");
      return;
    }

    const nextLiked = !liked;
    const nextCount = liked ? Math.max(0, likeCount - 1) : likeCount + 1;
    setLiked(nextLiked);
    setLikeCount(nextCount);

    try {
      const { data } = await api.post(`/api/v1/posts/${post._id}/like`);
      if (data?.success) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
        if (onLikeChange) onLikeChange(post._id, data.liked, data.likeCount);
      }
    } catch {
      // Revert on error
      setLiked(!nextLiked);
      setLikeCount(likeCount);
    }
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data } = await api.get(`/api/v1/posts/${post._id}/comments`);
        if (data?.success) {
          setComments(data.comments || []);
        }
      } catch (err) {
        console.warn("Could not load comments:", err);
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Please sign in to comment.");
      return;
    }
    const cleanText = commentText.trim();
    if (!cleanText) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/api/v1/posts/${post._id}/comments`, {
        text: cleanText,
      });

      if (data?.success && data?.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentsCount((prev) => prev + 1);
        setCommentText("");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { data } = await api.delete(
        `/api/v1/posts/${post._id}/comments/${commentId}`
      );
      if (data?.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        setCommentsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete comment.");
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/#post-${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FoundMet Post by ${post.author?.name || "Founder"}`,
          text: post.text.slice(0, 100),
          url: postUrl,
        });
      } catch {
        /* user dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        showToast("Post link copied to clipboard!");
      } catch {
        showToast("Unable to copy link.");
      }
    }

    try {
      const { data } = await api.post(`/api/v1/posts/${post._id}/share`);
      if (data?.success) {
        setSharesCount(data.sharesCount);
        if (onSharePost) onSharePost(post._id, data.sharesCount);
      }
    } catch {
      /* ignore */
    }
  };

  const authorPhoto =
    post.author?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "Founder")}&background=0B5CFF&color=fff&size=96`;

  const userPhoto =
    currentUser?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || "User")}&background=0B5CFF&color=fff&size=96`;

  return (
    <article
      id={`post-${post._id}`}
      className="card foundmet-post-card border-0 shadow-sm rounded-4 mb-3 bg-white overflow-hidden"
    >
      {toastMsg && (
        <div className="bg-primary text-white small py-1 px-3 text-center fw-medium">
          {toastMsg}
        </div>
      )}

      {/* ── Post Header ── */}
      <div className="p-3 pb-2 d-flex align-items-start justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <img
            src={authorPhoto}
            alt={post.author?.name || "Author"}
            className="rounded-circle border"
            style={{ width: "48px", height: "48px", objectFit: "cover" }}
          />
          <div>
            <div className="d-flex align-items-center gap-2">
              <strong className="text-main fs-6">{post.author?.name || "Startup Founder"}</strong>
              <span className={categoryMeta.color} style={{ fontSize: "0.7rem" }}>
                {categoryMeta.label}
              </span>
            </div>
            <div className="text-secondary small d-flex align-items-center gap-1">
              <span className="text-capitalize">{post.author?.role || "Founder"}</span>
              {post.author?.matchRole && (
                <>
                  <span>•</span>
                  <span>Looking for {post.author.matchRole}</span>
                </>
              )}
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <i className="bi bi-globe2" style={{ fontSize: "0.75rem" }} title="Public"></i>
            </div>
          </div>
        </div>

        {/* Action menu */}
        {isOwner && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-link text-secondary p-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              title="More options"
            >
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 small">
              <li>
                <button
                  className="dropdown-item text-danger d-flex align-items-center gap-2"
                  onClick={() => onDeletePost(post._id)}
                >
                  <i className="bi bi-trash3"></i> Delete post
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ── Post Content ── */}
      <div className="px-3 py-2">
        <p
          className="text-main mb-2"
          style={{ whiteSpace: "pre-wrap", lineHeight: "1.5", fontSize: "0.95rem" }}
        >
          {post.text}
        </p>

        {/* Media Image Attachment */}
        {post.media?.url && (
          <div className="mt-2 rounded-3 overflow-hidden border bg-light text-center">
            <img
              src={post.media.url}
              alt="Post attachment"
              className="img-fluid w-100"
              style={{ maxHeight: "420px", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      {/* ── Social Stats Counters ── */}
      <div className="px-3 py-1 d-flex justify-content-between align-items-center text-secondary small border-bottom border-light">
        <div className="d-flex align-items-center gap-1">
          {likeCount > 0 && (
            <span className="badge bg-primary rounded-circle p-1 d-inline-flex align-items-center justify-content-center" style={{ width: "18px", height: "18px" }}>
              <i className="bi bi-hand-thumbs-up-fill text-white" style={{ fontSize: "10px" }}></i>
            </span>
          )}
          <span>
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
        </div>
        <div className="d-flex gap-3">
          <span
            style={{ cursor: "pointer" }}
            onClick={handleToggleComments}
          >
            {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
          </span>
          <span>{sharesCount} {sharesCount === 1 ? "share" : "shares"}</span>
        </div>
      </div>

      {/* ── Action Buttons Bar ── */}
      <div className="px-2 py-1 d-flex align-items-center justify-content-around border-bottom border-light">
        <button
          type="button"
          onClick={handleToggleLike}
          className={`btn btn-sm d-flex align-items-center gap-2 border-0 px-3 py-2 rounded-3 ${
            liked ? "text-primary fw-bold" : "text-secondary"
          }`}
          title="Like post"
        >
          <i className={`bi ${liked ? "bi-hand-thumbs-up-fill text-primary" : "bi-hand-thumbs-up"} fs-6`}></i>
          <span className="small">Like</span>
        </button>

        <button
          type="button"
          onClick={handleToggleComments}
          className={`btn btn-sm d-flex align-items-center gap-2 border-0 px-3 py-2 rounded-3 ${
            showComments ? "text-primary fw-bold" : "text-secondary"
          }`}
          title="Comment on post"
        >
          <i className="bi bi-chat-text fs-6"></i>
          <span className="small">Comment</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="btn btn-sm d-flex align-items-center gap-2 border-0 text-secondary px-3 py-2 rounded-3"
          title="Share post link"
        >
          <i className="bi bi-share fs-6"></i>
          <span className="small">Share</span>
        </button>
      </div>

      {/* ── Expandable Comments Section ── */}
      {showComments && (
        <div className="bg-light p-3 border-top">
          {/* Add Comment Form */}
          {currentUser ? (
            <form onSubmit={handleAddComment} className="d-flex align-items-start gap-2 mb-3">
              <img
                src={userPhoto}
                alt={currentUser.name}
                className="rounded-circle border"
                style={{ width: "36px", height: "36px", objectFit: "cover", flexShrink: 0 }}
              />
              <div className="flex-grow-1 position-relative">
                <input
                  type="text"
                  className="form-control form-control-sm rounded-pill pe-5 py-2"
                  placeholder="Add a startup comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength="1000"
                  disabled={submittingComment}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-sm rounded-pill position-absolute end-0 top-50 translate-middle-y me-1 px-3 py-1"
                  style={{ fontSize: "0.75rem" }}
                  disabled={submittingComment || !commentText.trim()}
                >
                  {submittingComment ? "..." : "Post"}
                </button>
              </div>
            </form>
          ) : (
            <div className="alert alert-light border py-2 px-3 small rounded-pill text-center mb-3">
              <a href="/login" className="text-primary fw-bold text-decoration-none">
                Sign in
              </a>{" "}
              to join the conversation and leave a comment.
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="text-center py-2 text-secondary small">
              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              Loading comments…
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-2 text-secondary small">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {comments.map((comment) => {
                const isCommentAuthor =
                  currentUser && String(comment.author?._id) === String(currentUser._id);
                const commentAvatar =
                  comment.author?.photo ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.name || "User")}&background=0B5CFF&color=fff&size=64`;

                return (
                  <div key={comment._id} className="d-flex align-items-start gap-2">
                    <img
                      src={commentAvatar}
                      alt={comment.author?.name || "Commenter"}
                      className="rounded-circle border"
                      style={{ width: "32px", height: "32px", objectFit: "cover", flexShrink: 0 }}
                    />
                    <div className="bg-white p-2 px-3 rounded-4 border flex-grow-1 position-relative">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div>
                          <strong className="text-main small d-block" style={{ lineHeight: "1.2" }}>
                            {comment.author?.name || "Founder"}
                          </strong>
                          <span className="text-secondary" style={{ fontSize: "0.75rem" }}>
                            {comment.author?.role || "Builder"} • {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {isCommentAuthor && (
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 border-0"
                            onClick={() => handleDeleteComment(comment._id)}
                            title="Delete comment"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </div>
                      <p className="text-main mb-0 small" style={{ whiteSpace: "pre-wrap" }}>
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
