import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function Terms() {
  return (
    <div className="min-vh-100 bg-background d-flex flex-column">
      <Header />
      <main
        className="container my-5 flex-grow-1"
        style={{ maxWidth: "800px" }}
      >
        <div className="card foundmet-card border-0 shadow-sm p-4 p-md-5">
          <div className="mb-4">
            <span className="hero-badge mb-2">Legal & Community Trust</span>
            <h1 className="fw-bold mt-2">
              FoundMet Terms of Service & Community Guidelines
            </h1>
            <p className="text-secondary small">
              Effective date: September 2026 • Simple, founder-friendly rules.
            </p>
          </div>

          <div className="text-secondary d-flex flex-column gap-4">
            <div>
              <h5 className="fw-bold text-main">
                1. 100% Ownership & Zero Equity
              </h5>
              <p className="small mb-0">
                You retain complete, exclusive ownership of your ideas, code,
                pitch decks, and intellectual property. FoundMet claims zero
                equity, zero IP, and zero commission on your startup.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">
                2. Contact & Mobile Number Privacy
              </h5>
              <p className="small mb-0">
                Your mobile phone number and private contact info are hidden by
                default. They can only be revealed to another user after a
                mutual connection request has been accepted AND an explicit
                phone sharing request has been granted.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">
                3. High-Trust Community Standard
              </h5>
              <p className="small mb-0">
                Spamming, unsolicited sales pitches, abusive conduct, or
                deceptive profiles will result in immediate permanent
                suspension. FoundMet is an exclusive network for authentic
                builders.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">4. Real-time Communication</h5>
              <p className="small mb-0">
                Our messaging and chat systems are provided to facilitate
                genuine co-founder discussions. Please exercise standard
                business caution when sharing proprietary trade secrets.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">5. Cookies & Local Session</h5>
              <p className="small mb-0">
                We use strictly essential cookies and local storage to keep your
                session secure and save your preferences (such as Dark Mode).
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">6. Account Security</h5>
              <p className="small mb-0">
                Keep your password private, use a unique password, and notify us
                if you suspect unauthorized access. Sessions use an HttpOnly
                cookie and may be revoked for security or policy violations.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">7. User Content</h5>
              <p className="small mb-0">
                You own your posts, profile content, and ideas. You grant
                FoundMet only the limited permission needed to display that
                content to other members. Do not upload unlawful, misleading,
                abusive, or infringing material.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">8. Safety and Introductions</h5>
              <p className="small mb-0">
                Verify identities independently, protect confidential
                information, and meet in safe public places. FoundMet does not
                guarantee a match, investment, employment, partnership, or the
                accuracy of another member's claims.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">9. Suspension and Removal</h5>
              <p className="small mb-0">
                We may limit, suspend, or remove accounts and content that
                violate these terms, threaten member safety, abuse the service,
                or create legal or security risk. Where appropriate, we may
                preserve information for legal compliance.
              </p>
            </div>

            <div>
              <h5 className="fw-bold text-main">10. Changes and Contact</h5>
              <p className="small mb-0">
                We may update these terms as FoundMet evolves. Continued use
                after an update means you accept the revised terms. Questions or
                reports should be sent through the support channel listed in the
                application.
              </p>
            </div>

            <div className="border-top pt-4 mt-2 d-flex justify-content-between align-items-center">
              <Link
                to="/register"
                className="btn btn-foundmet rounded-pill px-4"
              >
                Back to Registration
              </Link>
              <Link
                to="/explore"
                className="btn btn-outline-primary rounded-pill px-4"
              >
                Explore Founders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
