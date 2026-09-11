import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./services/api.js";
import Header from "./components/Header.jsx";
import "./global.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (res.data?.user) {
        localStorage.setItem("foundmet_user", JSON.stringify(res.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.message ||
        "Login failed. Please verify your credentials and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      <main className="container my-auto py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="hero-badge mb-2">
                <i className="bi bi-shield-lock me-1"></i> Welcome Back
              </span>
              <h2 className="fw-bold mt-2">Log in to FoundMet</h2>
              <p className="text-secondary small">
                Sign in to manage your startup, connections, and messages.
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3"
                role="alert"
              >
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-envelope text-secondary"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="founder@example.com"
                    className="form-control border-start-0 ps-0"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label fw-semibold mb-0">
                    Password
                  </label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-lock text-secondary"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="form-control border-start-0 border-end-0 px-0"
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-foundmet w-100 btn-lg mb-3 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="bi bi-arrow-right"></i>
                  </>
                )}
              </button>

              <div className="text-center border-top pt-3">
                <span className="text-secondary small">
                  Don't have an account yet?{" "}
                  <Link to="/register" className="text-primary fw-bold">
                    Create Founder Profile
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
