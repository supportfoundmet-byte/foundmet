import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./components/Header.jsx";
import "./global.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://foundemet-backend.onrender.com/auth/login";

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

  const handleDemoLogin = () => {
    const demoUser = {
      _id: "demo_user_" + Date.now(),
      name: "Alex Morgan",
      email: "alex@foundmet.io",
      role: "founder",
      hasProject: "yes",
      projectDetails:
        "Building an AI-driven collaboration workspace for early-stage startup teams to find co-founders and track milestones.",
      projectLink: "https://foundmet.io",
      projectStatus: "development",
      lookingFor: ["cto", "cfo"],
      address: "Bangalore, India",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    localStorage.setItem("foundmet_token", "demo_jwt_token_" + Date.now());
    localStorage.setItem("foundmet_user", JSON.stringify(demoUser));
    navigate("/dashboard");
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
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (res.data?.accessToken) {
        localStorage.setItem("foundmet_token", res.data.accessToken);
      }
      if (res.data?.user) {
        localStorage.setItem("foundmet_user", JSON.stringify(res.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const msg =
        err.response?.data?.message ||
        "Login failed. Please verify your credentials or try the Demo Login.";
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

              {/* Demo Account Button for instant testing */}
              <div className="d-grid mb-4">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="btn btn-outline-secondary btn-sm rounded-3 py-2 d-flex align-items-center justify-content-center gap-2"
                  title="Test dashboard immediately without credentials"
                >
                  <i className="bi bi-lightning-charge-fill text-warning"></i>
                  <span>Quick Demo Founder Login</span>
                </button>
              </div>

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
