import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

const SAMPLE_FOUNDERS = [
  {
    name: "Arjun Sharma",
    role: "Founder",
    location: "Kolkata (Within 25 km)",
    tag: "AI & Fintech",
    looking: "CTO / Lead Architect",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Priya Das",
    role: "Co-Founder",
    location: "Bangalore (Within 50 km)",
    tag: "HealthTech & UI/UX",
    looking: "CEO / Growth Lead",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Rahul Mehta",
    role: "Founder",
    location: "Delhi NCR (Within 80 km)",
    tag: "Cloud & DevTools",
    looking: "CTO / Machine Learning",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

const FOUNDING_TEAM = [
  {
    name: "Aman Mistu",
    role: "Lead Creator & Full-Stack Architect",
    bio: "Built the real-time matching engine, proximity radar, and secure communication architecture powering FoundMet.",
    badge: "Core Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    skills: ["React & Node.js", "Socket.IO", "System Design"],
  },
  {
    name: "Rohan Verma",
    role: "Product & Founder Ecosystem",
    bio: "Shaping intuitive workflows for non-technical founders, privacy boundaries, and verified founder credentials.",
    badge: "Product Strategy",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    skills: ["Product Roadmap", "Founder Matching", "Growth"],
  },
  {
    name: "Sneha Mukherjee",
    role: "Lead UI/UX & Design Systems",
    bio: "Designing distraction-free founder dashboards, high-contrast dark modes, and mobile-first discovery experiences.",
    badge: "Design Systems",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    skills: ["UI/UX Systems", "Accessibility", "Design Ops"],
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
                <i className="bi bi-stars"></i> Co-Founder Matching Platform
              </span>

              <h1 className="display-4 fw-bold mb-3 text-main" style={{ letterSpacing: "-0.03em" }}>
                Find Your <span className="foundmet-gradient-text">Co-Founder</span>.
                <br />
                Build Something Real.
              </h1>

              <p className="lead text-secondary mb-4" style={{ maxWidth: "480px", fontSize: "1.05rem" }}>
              Find the right person to build with.
              </p>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/explore" className="btn btn-foundmet btn-lg rounded-pill px-4 shadow-sm fw-bold">
                  <i className="bi bi-search me-2"></i>
                  Explore Builders
                </Link>
                <Link to="/register" className="btn btn-outline-primary btn-lg rounded-pill px-4 fw-semibold">
                  Join Free
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="d-flex align-items-center gap-3 pt-2">
                <div className="d-flex align-items-center">
                  {SAMPLE_FOUNDERS.map((f, i) => (
                    <img
                      key={f.name}
                      src={f.avatar}
                      alt={f.name}
                      className="rounded-circle border border-2 border-white shadow-xs"
                      style={{
                        width: "36px",
                        height: "36px",
                        objectFit: "cover",
                        marginLeft: i > 0 ? "-10px" : "0",
                      }}
                    />
                  ))}
                </div>
                <div className="small text-secondary"><strong className="text-main">1,200+ builders</strong> already exploring</div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="col-lg-5 animate-slide-in">
              <div className="card foundmet-card border-0 shadow-lg p-4 rounded-4 position-relative overflow-hidden animate-float hero-radar-card">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success rounded-circle p-1 animate-radar-pulse"></span>
                    <span className="small fw-bold text-main">Live Match Radar</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1 small">
                    <i className="bi bi-geo-alt-fill me-1"></i> 50–80 km Radius
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
                          style={{ width: "42px", height: "42px", objectFit: "cover" }}
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <strong className="small text-main">{founder.name}</strong>
                            <span className="badge bg-primary text-white" style={{ fontSize: "9px" }}>
                              {founder.role}
                            </span>
                          </div>
                          <small className="text-secondary d-block" style={{ fontSize: "11px" }}>
                            {founder.location}
                          </small>
                          <small className="text-primary fw-semibold" style={{ fontSize: "10px" }}>
                            Needs {founder.looking}
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

      {/* ================= 3-STEP PIPELINE ================= */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-light text-secondary border px-3 py-1 rounded-pill mb-2 small fw-bold">
              The FoundMet Flow
            </span>
            <h2 className="fw-bold text-main">Create Profile → Discover → Connect → Talk → Build</h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-6 col-lg">
              <div className="p-4 rounded-4 bg-light border h-100 feature-step-card">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="bi bi-person-badge fs-4"></i>
                </div>
                <h5 className="fw-bold text-main mb-2">1. Create Profile</h5>
                <p className="small text-secondary mb-0">
                  Your skills. Your goals. Your profile.
                </p>
              </div>
            </div>

            <div className="col-6 col-lg">
              <div className="p-4 rounded-4 bg-light border h-100 feature-step-card">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="bi bi-geo-alt fs-4"></i>
                </div>
                <h5 className="fw-bold text-main mb-2">2. Discover & Proximity Filter</h5>
                <p className="small text-secondary mb-0">
                  Browse people who match your direction.
                </p>
              </div>
            </div>

            <div className="col-6 col-lg">
              <div className="p-4 rounded-4 bg-light border h-100 feature-step-card">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center p-3 mb-3"
                  style={{ width: "56px", height: "56px" }}
                >
                  <i className="bi bi-chat-heart fs-4"></i>
                </div>
                <h5 className="fw-bold text-main mb-2">3. Connect & Chat Securely</h5>
                <p className="small text-secondary mb-0">
                  Send a request and start a private chat.
                </p>
              </div>
            </div>
            <div className="col-6 col-lg"><div className="p-4 rounded-4 bg-light border h-100 feature-step-card"><i className="bi bi-chat-dots fs-4 text-primary"></i><h5 className="fw-bold text-main mb-2 mt-3">4. Talk</h5>            <p className="small text-secondary mb-0">Talk with people who say yes.</p></div></div>
            <div className="col-6 col-lg"><div className="p-4 rounded-4 bg-light border h-100 feature-step-card"><i className="bi bi-rocket-takeoff fs-4 text-primary"></i><h5 className="fw-bold text-main mb-2 mt-3">5. Build</h5>            <p className="small text-secondary mb-0">Make the idea real.</p></div></div>
          </div>
        </div>
      </section>

      {/* ================= FOUNDING MEMBER PERKS ================= */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container">
          <div className="card border-0 rounded-4 p-4 p-md-5 text-white shadow-lg position-relative overflow-hidden animate-glow" style={{ background: "linear-gradient(135deg, #071A3D 0%, #0B5CFF 100%)" }}>
            <div className="row align-items-center g-4">
              <div className="col-lg-8">
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 fw-bold mb-3 d-inline-flex align-items-center gap-1">
                  <i className="bi bi-patch-check-fill"></i> Early Cohort Access
                </span>
                <h2 className="fw-bold mb-2">Join as a Founding Member</h2>
                <p className="opacity-90 mb-4" style={{ maxWidth: "560px" }}>
                  Join the first 1,000 verified builders on FoundMet. Receive an exclusive Founding Member badge, priority discovery in local 50–80 km radar, and direct messaging access.
                </p>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-award-fill text-warning fs-5"></i>
                      <span className="small fw-semibold">Founding Member Badge</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-geo-alt-fill text-info fs-5"></i>
                      <span className="small fw-semibold">Priority 50–80 km Radar</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-chat-dots-fill text-success fs-5"></i>
                      <span className="small fw-semibold">Real-Time Chat & Contact Sharing</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-shield-check-fill text-primary fs-5"></i>
                      <span className="small fw-semibold">100% Free & Zero Equity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 text-lg-end">
                <Link to="/register" className="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark shadow">
                  Claim Founding Profile
                  <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MEET THE CREATORS & FOUNDING TEAM ================= */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill mb-2 small fw-bold">
              Behind FoundMet
            </span>
            <h2 className="fw-bold text-main">Meet the Founding Team</h2>
            <p className="text-secondary small mx-auto" style={{ maxWidth: "480px" }}>
              The creators and builders dedicated to making co-founder discovery effortless, transparent, and secure.
            </p>
          </div>

          <div className="row g-4">
            {FOUNDING_TEAM.map((member) => (
              <div key={member.name} className="col-md-4">
                <div className="card foundmet-card h-100 border p-4 rounded-4 shadow-sm team-card d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="rounded-circle border border-2 border-primary shadow-xs"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="fw-bold text-main mb-0">{member.name}</h6>
                        <small className="text-primary fw-semibold d-block" style={{ fontSize: "12px" }}>
                          {member.role}
                        </small>
                        <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: "10px" }}>
                          {member.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-secondary small mb-3" style={{ lineHeight: "1.5" }}>
                      {member.bio}
                    </p>
                  </div>

                  <div>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {member.skills.map((s) => (
                        <span
                          key={s}
                          className="badge bg-light text-main border rounded-pill"
                          style={{ fontSize: "10px", padding: "4px 8px" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="d-flex align-items-center gap-2 pt-2 border-top">
                      <Link
                        to="/explore"
                        className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-semibold"
                        style={{ fontSize: "12px" }}
                      >
                        <i className="bi bi-chat-text me-1"></i> Connect on FoundMet
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRIVACY & TRUST ================= */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-md-6">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold mb-2">
                Founder Privacy First
              </span>
              <h3 className="fw-bold text-main mb-3">Your Contacts & Ideas Are Protected</h3>
              <ul className="list-unstyled text-secondary small d-flex flex-column gap-3 mb-0">
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-shield-check text-success fs-5"></i>
                  <div>
                    <strong className="text-main d-block">Private Mobile Numbers</strong>
                    Phone numbers are never publicly visible. They can only be requested and shared between accepted connections.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-check-circle text-primary fs-5"></i>
                  <div>
                    <strong className="text-main d-block">Zero Equity & 100% IP Ownership</strong>
                    You retain total ownership of your venture. FoundMet charges zero fees and claims zero equity.
                  </div>
                </li>
                <li className="d-flex align-items-start gap-2">
                  <i className="bi bi-lock text-info fs-5"></i>
                  <div>
                    <strong className="text-main d-block">Authentic Verified Network</strong>
                    Only logged in, verified founders can send connection requests.
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-md-6 text-center">
              <div className="p-4 p-md-5 rounded-4 text-white shadow-lg" style={{ background: "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)" }}>
                <h3 className="fw-bold mb-2">Ready to Build Your Startup?</h3>
                <p className="opacity-90 small mb-4">
                  Join hundreds of founders matching, collaborating, and launching ventures today.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/register" className="btn btn-light rounded-pill px-4 fw-bold text-primary">
                    Create Profile
                  </Link>
                  <Link to="/explore" className="btn btn-outline-light rounded-pill px-4">
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
            <Link to="/explore" className="text-secondary text-decoration-none">Explore Feed</Link>
            <Link to="/terms" className="text-secondary text-decoration-none">Terms</Link>
            <Link to="/privacy" className="text-secondary text-decoration-none">Privacy</Link>
            <Link to="/cookies" className="text-secondary text-decoration-none">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}