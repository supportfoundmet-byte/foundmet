import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import mistu from "./assets/mistu.png";
import snigdha from "./assets/snigdha.png";
import tarunjit from "./assets/tarunjit.png";
import debanjan from "./assets/debanjan.png";
import debatri from "./assets/debaratri.png";
import tunPatra from "./assets/tun_patra.png";

const SAMPLE_FOUNDERS = [
  {
    name: "Arjun Sharma",
    role: "Founder",
    location: "Kolkata · 25 km",
    looking: "Technical Co-Founder",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Priya Das",
    role: "Co-Founder",
    location: "Bangalore · 50 km",
    looking: "Business Co-Founder",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  },
  {
    name: "Rahul Mehta",
    role: "Founder",
    location: "Delhi NCR · 80 km",
    looking: "Engineer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
];

const FOUNDMET_TEAM = [
  {
    name: "Mistu Debnath",
    role: "Full Stack Developer",
    image: mistu,
    description:
      "Leading product development, contributing to the technical vision, and building scalable platform features.",
  },
  {
    name: "Snigdha Saha",
    role: "Content Creator",
    image: snigdha,
    description:
      "Creating content for social media and blogs while supporting brand storytelling and community engagement.",
  },
  {
    name: "Tarunjit Biswas",
    role: "Founder & CEO",
    image: tarunjit,
    description:
      "Driving the overall vision and direction of FoundMet while supporting strategic growth and platform development.",
  },
  {
    name: "Debanjan Mallick",
    role: "Full Stack Developer",
    image: debanjan,
    description:
      "Developing and maintaining the platform while contributing to scalable features and the technical ecosystem.",
  },
  {
    name: "Debatri Raha",
    role: "Frontend Developer",
    image: debatri,
    description:
      "Developing and maintaining the frontend experience while supporting content, research, and community development.",
  },
  {
    name: "Tun Patra",
    role: "Marketing",
    image: tunPatra,
    description:
      "Supporting marketing initiatives, outreach, brand visibility, and FoundMet's growing community.",
  },
];

const STEPS = [
  {
    icon: "bi-person-badge",
    number: "01",
    title: "Create Your Profile",
    text: "Tell us your skills, interests, and what you want to build.",
  },
  {
    icon: "bi-compass",
    number: "02",
    title: "Discover Builders",
    text: "Explore founders and builders who match your goals.",
  },
  {
    icon: "bi-chat-heart",
    number: "03",
    title: "Send a Request",
    text: "Connect with people who look like a strong match.",
  },
  {
    icon: "bi-chat-dots",
    number: "04",
    title: "Talk It Through",
    text: "Start a private conversation and explore the idea together.",
  },
  {
    icon: "bi-rocket-takeoff",
    number: "05",
    title: "Start Building",
    text: "Turn the right conversation into a real team and product.",
  },
];

const TRUST_POINTS = [
  {
    icon: "bi-shield-lock",
    title: "Your Phone Stays Private",
    text: "Your number is not publicly displayed. You choose when to share it.",
  },
  {
    icon: "bi-lightbulb",
    title: "Your Idea Stays Yours",
    text: "FoundMet does not take ownership of the ideas or products you build.",
  },
  {
    icon: "bi-person-check",
    title: "Real Accounts",
    text: "Only registered and verified users can send connection requests.",
  },
];

export default function Home() {
  return (
    <div className="home-page min-vh-100 d-flex flex-column bg-background overflow-hidden">
      <style>{`
        .home-page {
          --fm-blue: #0b5cff;
          --fm-navy: #011940;
          --fm-purple: #7038f5;
          --fm-sky: #0096f9;
          --fm-bg: #f8faff;
          color: var(--fm-navy);
        }

        .home-page .text-main { color: var(--fm-navy) !important; }
        .home-page .text-secondary { color: #63708a !important; }

        .fm-hero {
          position: relative;
          background:
            radial-gradient(circle at 85% 15%, rgba(11,92,255,.13), transparent 28%),
            radial-gradient(circle at 10% 80%, rgba(112,56,245,.08), transparent 25%),
            linear-gradient(180deg, #fff 0%, #f8faff 100%);
        }

        .fm-hero::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          right: -180px;
          top: 80px;
          border: 1px solid rgba(11,92,255,.08);
          border-radius: 50%;
          pointer-events: none;
        }

        .foundmet-gradient-text {
          background: linear-gradient(90deg, var(--fm-blue), var(--fm-purple));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .fm-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(11,92,255,.12);
          background: rgba(11,92,255,.07);
          color: var(--fm-blue);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: .78rem;
          font-weight: 700;
        }

        .fm-hero-title {
          font-size: clamp(2.45rem, 6vw, 4.8rem);
          line-height: .98;
          letter-spacing: -.055em;
          max-width: 760px;
        }

        .fm-hero-copy {
          max-width: 590px;
          font-size: clamp(1rem, 1.7vw, 1.15rem);
          line-height: 1.7;
        }

        .fm-actions .btn {
          min-height: 50px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-foundmet {
          background: linear-gradient(135deg, var(--fm-blue), #386fff);
          border: 0;
          color: #fff;
        }

        .btn-foundmet:hover,
        .btn-foundmet:focus {
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(11,92,255,.24) !important;
        }

        .fm-visual {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(1,25,64,.08);
          box-shadow: 0 24px 70px rgba(1,25,64,.12);
          backdrop-filter: blur(12px);
        }

        .fm-founder-item {
          border: 1px solid #e8edf5;
          background: #fff;
          transition: .2s ease;
        }

        .fm-founder-item:hover {
          border-color: rgba(11,92,255,.25);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(1,25,64,.07);
        }

        .fm-avatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          object-fit: cover;
        }

        .fm-section {
          padding: clamp(60px, 8vw, 100px) 0;
        }

        .fm-section-title {
          font-size: clamp(1.9rem, 4vw, 2.8rem);
          letter-spacing: -.035em;
        }

        .fm-step {
          position: relative;
          height: 100%;
          padding: 26px 20px;
          border: 1px solid #e7ebf3;
          background: #fff;
          border-radius: 22px;
          transition: .25s ease;
        }

        .fm-step:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 35px rgba(1,25,64,.08);
          border-color: rgba(11,92,255,.2);
        }

        .fm-step-icon {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: rgba(11,92,255,.09);
          color: var(--fm-blue);
          font-size: 1.35rem;
        }

        .fm-step-number {
          position: absolute;
          top: 18px;
          right: 18px;
          font-size: .72rem;
          font-weight: 800;
          color: #aab4c5;
        }

        .fm-perks {
          background: linear-gradient(135deg, #011940 0%, #0b5cff 62%, #7038f5 100%);
          border-radius: 30px;
          overflow: hidden;
          position: relative;
        }

        .fm-perks::after {
          content: "";
          position: absolute;
          width: 300px;
          height: 300px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 50%;
          right: -130px;
          top: -120px;
        }

        .fm-perk {
          min-height: 58px;
        }

        .fm-team-card {
          border: 1px solid #e8edf5;
          border-radius: 24px;
          overflow: hidden;
          background: #fff;
          height: 100%;
          transition: .25s ease;
        }

        .fm-team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(1,25,64,.11);
        }

        .fm-team-image {
          aspect-ratio: 4 / 3;
          width: 100%;
          object-fit: cover;
          display: block;
          background: linear-gradient(135deg, #eef4ff, #f5f0ff);
        }

        .fm-role {
          font-size: .75rem;
          font-weight: 700;
          color: var(--fm-blue);
        }

        .fm-trust-card {
          border: 1px solid #e6ebf3;
          border-radius: 24px;
          background: #fff;
          height: 100%;
        }

        .fm-trust-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: rgba(11,92,255,.08);
          color: var(--fm-blue);
          font-size: 1.2rem;
        }

        @media (max-width: 991.98px) {
          .fm-hero {
            padding-top: 40px !important;
          }

          .fm-visual {
            max-width: 720px;
            margin-inline: auto;
          }
        }

        @media (max-width: 575.98px) {
          .fm-hero {
            padding-top: 28px !important;
          }

          .fm-hero-title {
            font-size: clamp(2.35rem, 13vw, 3.4rem);
          }

          .fm-actions {
            display: grid !important;
            grid-template-columns: 1fr;
            gap: 10px !important;
          }

          .fm-actions .btn {
            width: 100%;
          }

          .fm-visual {
            padding: 16px !important;
            border-radius: 22px !important;
          }

          .fm-founder-item {
            align-items: flex-start !important;
            padding: 12px !important;
          }

          .fm-founder-item .connect-btn {
            padding: 7px 10px !important;
            font-size: .72rem !important;
          }

          .fm-founder-meta {
            min-width: 0;
          }

          .fm-founder-meta strong,
          .fm-founder-meta small {
            max-width: 100%;
          }

          .fm-founder-location,
          .fm-founder-looking {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 175px;
          }

          .fm-perks {
            border-radius: 24px;
          }

          .fm-perks .btn {
            width: 100%;
          }

          .fm-team-image {
            aspect-ratio: 1 / 1;
          }
        }
      `}</style>

      <Header />

      {/* HERO SECTION */}
      <main>
        <section className="fm-hero py-5">
          <div className="container py-lg-5">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <div className="animate-slide-up">
                  <span className="fm-badge mb-3">
                    <i className="bi bi-stars" />
                    Find Your Co-Founder
                  </span>

                  <h1 className="fm-hero-title fw-bold text-main mb-4">
                    Find Your{" "}
                    <span className="foundmet-gradient-text">Co-Founder.</span>
                    <br />
                    Build Something Real.
                  </h1>

                  <p className="fm-hero-copy text-secondary mb-4">
                    Find people with complementary skills, shared goals, and
                    the motivation to turn an idea into something real.
                  </p>

                  <div className="fm-actions d-flex flex-wrap gap-3 mb-4">
                    <Link
                      to="/explore"
                      className="btn btn-foundmet btn-lg rounded-pill px-4 fw-bold shadow-sm"
                    >
                      <i className="bi bi-search me-2" />
                      Browse Founders
                    </Link>

                    <Link
                      to="/register"
                      className="btn btn-outline-primary btn-lg rounded-pill px-4 fw-semibold"
                    >
                      Join Free
                      <i className="bi bi-arrow-right ms-2" />
                    </Link>
                  </div>

                  <div className="d-flex flex-wrap gap-3 text-secondary small">
                    <span>
                      <i className="bi bi-check-circle-fill text-success me-1" />
                      Free to join
                    </span>
                    <span>
                      <i className="bi bi-shield-check text-primary me-1" />
                      Private connections
                    </span>
                    <span>
                      <i className="bi bi-people-fill text-primary me-1" />
                      Built for builders
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="fm-visual rounded-4 p-3 p-sm-4 animate-slide-in">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <span className="badge bg-success rounded-circle p-1" />
                      <span className="small fw-bold text-main text-truncate">
                        Builders Near You
                      </span>
                    </div>

                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-1">
                      <i className="bi bi-geo-alt-fill me-1" />
                      Nearby
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {SAMPLE_FOUNDERS.map((founder) => (
                      <div
                        key={founder.name}
                        className="fm-founder-item rounded-3 p-2 p-sm-3 d-flex align-items-center justify-content-between gap-2"
                      >
                        <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
                          <img
                            src={founder.avatar}
                            alt={founder.name}
                            className="fm-avatar rounded-circle border"
                            loading="lazy"
                          />

                          <div className="fm-founder-meta min-w-0">
                            <div className="d-flex align-items-center gap-1 gap-sm-2">
                              <strong className="small text-main text-truncate">
                                {founder.name}
                              </strong>
                              <span
                                className="badge bg-primary text-white d-none d-sm-inline-block"
                                style={{ fontSize: "9px" }}
                              >
                                {founder.role}
                              </span>
                            </div>

                            <small className="fm-founder-location d-block text-secondary">
                              <i className="bi bi-geo-alt me-1" />
                              {founder.location}
                            </small>

                            <small className="fm-founder-looking d-block text-primary fw-semibold">
                              Looking for {founder.looking}
                            </small>
                          </div>
                        </div>

                        <Link
                          to="/explore"
                          className="connect-btn btn btn-sm btn-outline-primary rounded-pill flex-shrink-0"
                        >
                          Connect
                        </Link>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/explore"
                    className="btn btn-light border w-100 rounded-pill mt-3 fw-semibold"
                  >
                    Explore all builders
                    <i className="bi bi-arrow-right ms-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="fm-section bg-white border-top border-bottom">
          <div className="container">
            <div className="text-center mb-5">
              <span className="fm-badge mb-2">How It Works</span>
              <h2 className="fm-section-title fw-bold text-main mb-3">
                From idea to team, in a few simple steps.
              </h2>
              <p className="text-secondary mx-auto mb-0" style={{ maxWidth: 680 }}>
                A simple way to discover the right people, start conversations,
                and build together.
              </p>
            </div>

            <div className="row g-3 g-lg-4">
              {STEPS.map((step) => (
                <div className="col-12 col-sm-6 col-lg" key={step.number}>
                  <div className="fm-step">
                    <span className="fm-step-number">{step.number}</span>
                    <div className="fm-step-icon mb-3">
                      <i className={`bi ${step.icon}`} />
                    </div>
                    <h5 className="fw-bold text-main mb-2">{step.title}</h5>
                    <p className="small text-secondary mb-0 lh-lg">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOUNDING MEMBER SECTION */}
        <section className="fm-section bg-light">
          <div className="container">
            <div className="fm-perks p-4 p-md-5 text-white shadow-lg">
              <div className="row align-items-center g-4 position-relative">
                <div className="col-lg-8">
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold mb-3">
                    <i className="bi bi-patch-check-fill me-1" />
                    Early Access
                  </span>

                  <h2 className="fw-bold mb-3">Join as a Founding Member</h2>

                  <p
                    className="mb-4 opacity-90"
                    style={{ maxWidth: "650px", lineHeight: 1.7 }}
                  >
                    Join the first 1,000 verified builders on FoundMet. Get a
                    Founding Member badge, better visibility to nearby matches,
                    and direct messaging.
                  </p>

                  <div className="row g-3">
                    {[
                      ["bi-award-fill", "Founding Member Badge"],
                      ["bi-geo-alt-fill", "Shown First to Nearby Matches"],
                      ["bi-chat-dots-fill", "Chat and Share Contact"],
                      ["bi-shield-check-fill", "100% Free & Zero Equity"],
                    ].map(([icon, text]) => (
                      <div className="col-12 col-sm-6" key={text}>
                        <div className="fm-perk d-flex align-items-center gap-2">
                          <i className={`bi ${icon} text-warning fs-5`} />
                          <span className="small fw-semibold">{text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-lg-4 text-lg-end">
                  <Link
                    to="/register"
                    className="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark shadow"
                  >
                    Claim Founding Profile
                    <i className="bi bi-arrow-right ms-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="fm-section bg-white border-top border-bottom">
          <div className="container">
            <div className="text-center mb-5">
              <span className="fm-badge mb-2">
                <i className="bi bi-people-fill" />
                The Team Behind FoundMet
              </span>

              <h2 className="fm-section-title fw-bold text-main mb-3">
                Building FoundMet,{" "}
                <span className="foundmet-gradient-text">Together.</span>
              </h2>

              <p
                className="text-secondary mx-auto mb-0"
                style={{ maxWidth: 720, lineHeight: 1.7 }}
              >
                Different skills, different perspectives, one mission —
                connecting innovators, dreamers, and builders with the right
                co-founders.
              </p>
            </div>

            <div className="row g-3 g-md-4">
              {FOUNDMET_TEAM.map((member) => (
                <div className="col-12 col-sm-6 col-lg-4" key={member.name}>
                  <article className="fm-team-card">
                    <div className="position-relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="fm-team-image"
                        loading="lazy"
                      />
                      <span className="badge bg-white text-primary rounded-pill px-3 py-2 position-absolute bottom-0 start-0 m-3 shadow-sm">
                        {member.role}
                      </span>
                    </div>

                    <div className="p-4">
                      <h5 className="fw-bold text-main mb-1">{member.name}</h5>
                      <div className="fm-role mb-3">{member.role}</div>
                      <p className="text-secondary small mb-0 lh-lg">
                        {member.description}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            <div
              className="mt-4 mt-md-5 p-4 p-md-5 rounded-4 text-white text-center shadow-sm"
              style={{
                background: "linear-gradient(135deg, #011940 0%, #0B5CFF 100%)",
              }}
            >
              <h4 className="fw-bold mb-2">Different Skills. One Mission.</h4>
              <p className="mb-0 opacity-90">
                FoundMet — Find Your Co-Founder.
              </p>
            </div>
          </div>
        </section>

        {/* TRUST & CTA SECTION */}
        <section className="fm-section bg-light">
          <div className="container">
            <div className="row g-4 align-items-stretch">
              <div className="col-lg-7">
                <span className="fm-badge mb-3">Privacy & Trust</span>
                <h2 className="fm-section-title fw-bold text-main mb-3">
                  Build with confidence.
                </h2>
                <p className="text-secondary mb-4" style={{ maxWidth: 650 }}>
                  Your profile, conversations, and contact information should
                  stay under your control while you find the right people.
                </p>

                <div className="row g-3">
                  {TRUST_POINTS.map((point) => (
                    <div className="col-12 col-md-4" key={point.title}>
                      <div className="fm-trust-card p-4">
                        <div className="fm-trust-icon mb-3">
                          <i className={`bi ${point.icon}`} />
                        </div>
                        <h6 className="fw-bold text-main">{point.title}</h6>
                        <p className="small text-secondary mb-0 lh-lg">
                          {point.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-lg-5">
                <div
                  className="h-100 rounded-4 p-4 p-md-5 text-white shadow-lg d-flex flex-column justify-content-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #0B5CFF 0%, #7038F5 100%)",
                  }}
                >
                  <span className="small fw-bold opacity-75 mb-2">
                    READY TO BUILD?
                  </span>

                  <h3 className="fw-bold mb-3">
                    Find your people. Build your thing.
                  </h3>

                  <p className="small opacity-90 mb-4 lh-lg">
                    Create your profile and start discovering founders and
                    builders who could become your next teammate.
                  </p>

                  <div className="d-grid d-sm-flex gap-2">
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
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}