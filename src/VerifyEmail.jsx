import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import api from "./services/api.js";
import "./global.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { token: routeToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get("token") || "";

  const [status, setStatus] = useState(token ? "verifying" : "idle"); // idle | verifying | success | error
  const [message, setMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) return;

    let active = true;
    const runVerification = async () => {
      try {
        const { data } = await api.get("/auth/verify-email", {
          params: { token },
        });
        if (!active) return;
        setStatus("success");
        setMessage(
          data?.message ||
            "Your email address has been successfully verified! You can now log in.",
        );
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "This verification link is invalid or has expired. Please request a new one.",
        );
      }
    };

    runVerification();
    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setResendError("Please enter a valid email address.");
      return;
    }

    setResending(true);
    setResendError("");
    setResendSuccess("");

    try {
      const { data } = await api.post("/auth/resend-verification", {
        email: cleanEmail,
      });
      setResendSuccess(
        data?.message ||
          "Verification link has been sent! Please check your inbox and spam folder.",
      );
      setEmailInput("");
    } catch (err) {
      setResendError(
        err.response?.data?.message ||
          "Could not send verification email. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      <main className="container my-auto py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5 text-center rounded-4">
            {/* ── Status: Verifying ── */}
            {status === "verifying" && (
              <div className="py-4">
                <div
                  className="spinner-border text-primary mb-3"
                  style={{ width: "3.5rem", height: "3.5rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Verifying...</span>
                </div>
                <h3 className="fw-bold mb-2 text-main">Verifying Your Email</h3>
                <p className="text-secondary small mb-0">
                  Please wait while we confirm your email address...
                </p>
              </div>
            )}

            {/* ── Status: Success ── */}
            {status === "success" && (
              <div className="py-2">
                <div
                  className="rounded-circle bg-success-subtle text-success mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "72px", height: "72px" }}
                >
                  <i className="bi bi-patch-check-fill fs-1"></i>
                </div>
                <h2 className="fw-bold mb-2 text-main">Email Verified!</h2>
                <p className="text-secondary mb-4">
                  {message || "Your email address has been successfully verified."}
                </p>
                <div className="p-3 bg-light rounded-3 mb-4 text-start small">
                  <div className="d-flex align-items-center gap-2 text-success fw-bold mb-1">
                    <i className="bi bi-shield-check"></i> Account Activated
                  </div>
                  <p className="mb-0 text-secondary">
                    You can now sign in to your founder dashboard, connect with
                    complementary co-founders nearby, and post startup milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="btn btn-foundmet btn-lg w-100 rounded-pill fw-semibold shadow-sm"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i> Sign In to
                  FoundMet
                </button>
              </div>
            )}

            {/* ── Status: Error or Idle (Resend) ── */}
            {(status === "error" || status === "idle") && (
              <div>
                <div
                  className={`rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3 ${
                    status === "error"
                      ? "bg-danger-subtle text-danger"
                      : "bg-primary-subtle text-primary"
                  }`}
                  style={{ width: "72px", height: "72px" }}
                >
                  <i
                    className={`bi ${
                      status === "error"
                        ? "bi-exclamation-triangle-fill"
                        : "bi-envelope-check"
                    } fs-1`}
                  ></i>
                </div>

                <h3 className="fw-bold mb-2 text-main">
                  {status === "error"
                    ? "Verification Failed"
                    : "Email Verification"}
                </h3>
                <p className="text-secondary small mb-4">
                  {status === "error"
                    ? message ||
                      "The verification link is invalid or has expired."
                    : "Need a new verification link? Enter your email address below."}
                </p>

                {resendSuccess && (
                  <div className="alert alert-success small py-2 px-3 mb-3 text-start">
                    <i className="bi bi-check-circle-fill me-1"></i>
                    {resendSuccess}
                  </div>
                )}

                {resendError && (
                  <div className="alert alert-danger small py-2 px-3 mb-3 text-start">
                    <i className="bi bi-exclamation-circle-fill me-1"></i>
                    {resendError}
                  </div>
                )}

                <form onSubmit={handleResend} className="text-start mb-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Your Registered Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-secondary"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="founder@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-foundmet w-100 rounded-pill py-2 fw-semibold"
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Sending link...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-1"></i> Resend Verification
                        Email
                      </>
                    )}
                  </button>
                </form>

                <div className="d-flex justify-content-center gap-3 small pt-2">
                  <Link to="/login" className="text-primary text-decoration-none">
                    Back to Login
                  </Link>
                  <span className="text-muted">•</span>
                  <Link
                    to="/register"
                    className="text-primary text-decoration-none"
                  >
                    Create New Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
