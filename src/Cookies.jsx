import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function Cookies() {
  return (
    <div className="cookies-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      <main className="container py-5 flex-grow-1" style={{ maxWidth: "800px" }}>
        <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-bold mb-3 d-inline-block">
            Transparency & Security
          </span>
          <h1 className="fw-bold mb-2 text-main">Cookie & Local Storage Policy</h1>
           <p className="text-secondary small mb-4">
            Last updated: September 2026 • Essential cookies only by default
          </p>

          <div className="d-flex flex-column gap-4 text-secondary" style={{ lineHeight: "1.7", fontSize: "14px" }}>
            <section>
              <h5 className="fw-bold text-main">1. What Are Cookies & Local Storage?</h5>
              <p>
                FoundMet uses essential cookies and limited local storage. Authentication uses a Secure, HttpOnly session cookie that JavaScript cannot read. Preference and consent cookies do not track you.
              </p>
            </section>

            <section>
              <h5 className="fw-bold text-main">2. Essential Cookies & Tokens We Use</h5>
              <div className="table-responsive">
                <table className="table table-bordered table-sm small mt-2">
                  <thead className="table-light">
                    <tr>
                      <th>Storage Key</th>
                      <th>Type</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>accessToken</code></td>
                      <td>HttpOnly cookie</td>
                      <td>Encrypted session cookie; JavaScript cannot read it.</td>
                    </tr>
                    <tr>
                      <td><code>foundmet_user</code></td>
                      <td>Profile Cache</td>
                      <td>Your user name, role, and bio for fast local loading.</td>
                    </tr>
                    <tr>
                      <td><code>foundmet_theme</code></td>
                      <td>Preference</td>
                      <td>Remembers your Dark Mode or Light Mode choice.</td>
                    </tr>
                    <tr>
                      <td><code>foundmet_connections</code></td>
                      <td>State</td>
                      <td>Tracks your active and pending co-founder connections.</td>
                    </tr>
                    <tr>
                      <td><code>foundmet_cookie_consent</code></td>
                      <td>Consent</td>
                      <td>Stores your cookie policy acceptance.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h5 className="fw-bold text-main">3. Zero Third-Party Tracking / Zero Ad Networks</h5>
              <p>
                FoundMet <strong>never sells your data</strong> and does <strong>not use advertising, analytics, or third-party tracking cookies</strong>.
              </p>
            </section>

            <section>
              <h5 className="fw-bold text-main">4. Managing Your Preferences</h5>
              <p>
                You can clear local storage and cookies at any time in your browser settings. Clearing the session cookie will require you to sign in again.
              </p>
            </section>
          </div>

          <div className="mt-4 pt-3 border-top d-flex gap-3">
            <Link to="/explore" className="btn btn-foundmet rounded-pill px-4 btn-sm fw-bold">
              Return to Explore
            </Link>
            <Link to="/privacy" className="btn btn-outline-secondary rounded-pill px-3 btn-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-3 bg-white border-top text-center text-secondary small">
        <div className="container">
          FoundMet • Built for people who build.
        </div>
      </footer>
    </div>
  );
}
