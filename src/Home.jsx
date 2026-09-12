import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

const SAMPLE_FOUNDERS = [
  {
    name: "Arjun Sharma",
    role: "Founder",
    location: "Kolkata (Within 25 km)",
    tag: "Building a Finance App",
    looking: "a Technical Co-Founder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Priya Das",
    role: "Co-Founder",
    location: "Bangalore (Within 50 km)",
    tag: "Building a Health App",
    looking: "a Business Co-Founder",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Rahul Mehta",
    role: "Founder",
    location: "Delhi NCR (Within 80 km)",
    tag: "Building Developer Tools",
    looking: "an Engineer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

const STEPS = [
  {
    icon: "bi-person-badge",
    title: "1. Create Your Profile",
    text: "Tell us your skills and what you're trying to build.",
  },
  {
    icon: "bi-geo-alt",
    title: "2. Browse Nearby Founders",
    text: "See people near you who match what you need.",
  },
  {
    icon: "bi-chat-heart",
    title: "3. Send a Request",
    text: "Reach out and start a private conversation.",
  },
  {
    icon: "bi-chat-dots",
    title: "4. Talk It Through",
    text: "Chat with people who say yes.",
  },
  {
    icon: "bi-rocket-takeoff",
    title: "5. Start Building",
    text: "Make the idea real, together.",
  },
];

export default function Home() {
  return (
    <div className="home-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      {/* ================= HERO ================= */}
      <section className="py-5 my-auto landing-hero">
        <div className="container">
          <div className="row align-items-center g-5">
            {/* Left Copy */}
            <div className="col-lg-7 animate-slide-up">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-bold mb-3 d-inline-flex align-items-center gap-1">
                <i className="bi bi-stars"></i> Find Your Co-Founder
              </span>

              <h1
                className="display-4 fw-bold mb-3 text-main"
                style={{ letterSpacing: "-0.03em" }}
              >
                Find Your{" "}
                <span className="foundmet-gradient-text">Co-Founder</span>.
                <br />
                Build Something Real.
              </h1>

              <p
                className="lead text-secondary mb-4"
                style={{ maxWidth: "480px", fontSize: "1.05rem" }}
              >
                Find the right person to build with.
              </p>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link
                  to="/explore"
                  className="btn btn-foundmet btn-lg rounded-pill px-4 shadow-sm fw-bold"
                >
                  <i className="bi bi-search me-2"></i>
                  Browse Founders
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-primary btn-lg rounded-pill px-4 fw-semibold"
                >
                  Join Free
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="col-lg-5 animate-slide-in">
              <div className="card foundmet-card border-0 shadow-lg p-4 rounded-4 position-relative overflow-hidden animate-float hero-radar-card">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success rounded-circle p-1 animate-radar-pulse"></span>
                    <span className="small fw-bold text-main">
                      Founders Near You
                    </span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                    <i className="bi bi-geo-alt-fill me-1"></i> Within 50–80 km
                  </span>
                </div>

                <div className="d-flex flex-column gap-3">
                  {SAMPLE_FOUNDERS.map((founder) => (
                    <div
                      key={founder.name}
                      className="p-3 bg-light rounded-3 border d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={founder.avatar}
                          alt={founder.name}
                          className="rounded-circle border shadow-xs"
                          style={{
                            width: "42px",
                            height: "42px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong className="small text-main">
                              {founder.name}
                            </strong>
                            <span
                              className="badge bg-primary text-white"
                              style={{ fontSize: "9px" }}
                            >
                              {founder.role}
                            </span>
                          </div>
                          <small
                            className="text-secondary d-block"
                            style={{ fontSize: "11px" }}
                          >
                            {founder.location}
                          </small>
                          <small
                            className="text-primary fw-semibold"
                            style={{ fontSize: "10px" }}
                          >
                            Looking for {founder.looking}
                          </small>
                        </div>
                      </div>

                      <Link
                        to="/explore"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        style={{ fontSize: "11px" }}
                      >
                        Connect
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5-STEP PROCESS ================= */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill mb-2 small fw-bold">
              How It Works
            </span>
            <h2 className="fw-bold text-main">
              Create Profile → Discover → Connect → Talk → Build
            </h2>
          </div>

          <div className="row g-4 text-center">
            {STEPS.map((step) => (
              <div className="col-6 col-lg" key={step.title}>
                <div className="p-4 rounded-4 bg-light border h-100 feature-step-card">
                  <div
                    className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-3"
                    style={{ width: "56px", height: "56px" }}
                  >
                    <i className={`bi ${step.icon} fs-4`}></i>
                  </div>
                  <h5 className="fw-bold text-main mb-2">{step.title}</h5>
                  <p className="small text-secondary mb-0">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOUNDING MEMBER PERKS ================= */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container">
          <div
            className="card border-0 rounded-4 p-4 p-md-5 text-white shadow-lg position-relative overflow-hidden animate-glow"
            style={{
              background: "linear-gradient(135deg, #071A3D 0%, #0B5CFF 100%)",
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold mb-3 d-inline-flex align-items-center gap-1">
                  <i className="bi bi-patch-check-fill"></i> Early Access
                </span>
                <h2 className="fw-bold mb-2">Join as a Founding Member</h2>
                <p className="opacity-90 mb-4" style={{ maxWidth: "560px" }}>
                  Join the first 1,000 verified builders on FoundMet. Get a
                  Founding Member badge, get shown first to nearby matches,
                  and message people directly.
                </p>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-award-fill text-warning fs-5"></i>
                      <span className="small fw-semibold">
                        Founding Member Badge
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-geo-alt-fill text-info fs-5"></i>
                      <span className="small fw-semibold">
                        Shown First to Nearby Matches
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-chat-dots-fill text-success fs-5"></i>
                      <span className="small fw-semibold">
                        Chat and Share Contact Instantly
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-shield-check-fill text-primary fs-5"></i>
                      <span className="small fw-semibold">
                        100% Free & Zero Equity
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 text-lg-end">
                <Link
                  to="/register"
                  className="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark shadow"
                >
                  Claim Founding Profile
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRIVACY & TRUST ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold mb-2">
                Your Privacy Comes First
              </span>
              <h3 className="fw-bold text-main mb-3">
                Your Contacts & Ideas Are Protected
              </h3>
              <ul className="list-unstyled text-secondary small d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-shield-check text-success fs-5"></i>
                  <div>
                    <strong className="text-main d-block">
                      Your Phone Number Stays Private
                    </strong>
                    It's never shown publicly. You choose when to share it,
                    only with people you've connected with.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle text-primary fs-5"></i>
                  <div>
                    <strong className="text-main d-block">
                      You Keep 100% Ownership
                    </strong>
                    Your idea stays yours. FoundMet doesn't charge fees or
                    take any ownership in what you build.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-lock text-info fs-5"></i>
                  <div>
                    <strong className="text-main d-block">
                      Real, Verified People
                    </strong>
                    Only people who've signed up and verified their account
                    can send you a request.
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-md-6 text-center">
              <div
                className="p-4 p-md-5 rounded-4 text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
                }}
              >
                <h3 className="fw-bold mb-2">Ready to Build Your Startup?</h3>
                <p className="opacity-90 small mb-4">
                  Join hundreds of founders matching, collaborating, and
                  launching ventures today.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link
                    to="/register"
                    className="btn btn-light rounded-pill px-4 fw-bold text-primary"
                  >
                    Create Profile
                  </Link>
                  <Link
                    to="/explore"
                    className="btn btn-outline-light rounded-pill px-4"
                  >
                    Browse Feed
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-auto py-4 bg-white border-top">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary small">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-main">FoundMet</span>
            <span>•</span>
            <span>Built for people who build.</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/explore" className="text-secondary text-decoration-none">
              Explore Feed
            </Link>
            <Link to="/terms" className="text-secondary text-decoration-none">
              Terms
            </Link>
            <Link to="/privacy" className="text-secondary text-decoration-none">
              Privacy
            </Link>
            <Link to="/cookies" className="text-secondary text-decoration-none">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}