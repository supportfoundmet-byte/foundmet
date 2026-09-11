import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function Privacy() {
  return (
    <div className="min-vh-100 bg-background d-flex flex-column">
      <Header />
      <main className="container my-5 flex-grow-1" style={{ maxWidth: "800px" }}>
        <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5">
          <div className="mb-4">
            <span className="hero-badge mb-2">Privacy Policy</span>
            <h1 className="fw-bold mt-2">FoundMet Founder Privacy Policy</h1>
            <p className="text-secondary small">
              How we safeguard your profile, location, and mobile contact information.
            </p>
          </div>

          <div className="text-secondary d-flex flex-column gap-4">
            <div>
              <h5 className="fw-bold text-main">1. Information We Collect</h5>
              <p className="small mb-0">
                We only collect information you voluntarily provide: your name, email, profile photo, startup stage, skills/roles needed, city/address, and optional phone number.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">2. Proximity & Location</h5>
              <p className="small mb-0">
                We use your city or approximate location strictly to compute proximity distance (e.g. within 50 - 80 km) so you can discover nearby co-founders. We never track or broadcast your real-time GPS coordinates.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">3. Mobile Number Protection</h5>
              <p className="small mb-0">
                Your mobile number is never public. Unauthenticated users and pending connections cannot see your mobile number. It is only shared when you approve a contact sharing request with an accepted connection.
              </p>
            </div>

            <div className="border-top pt-4 mt-2 d-flex justify-content-between align-items-center">
              <Link to="/register" className="btn btn-foundmet rounded-pill px-4">
                Back to Registration
              </Link>
              <Link to="/" className="btn btn-outline-primary rounded-pill px-4">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
