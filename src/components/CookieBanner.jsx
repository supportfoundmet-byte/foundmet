import { useState, useEffect } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((item) => item.startsWith("foundmet_cookie_consent="))
      ?.split("=")[1];
    if (!consent) {
      // Show shortly after load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type) => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `foundmet_cookie_consent=${type}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;
    localStorage.setItem("foundmet_cookies_consent", type);
    setVisible(false);
  };

  if (!visible && !showPolicyModal) return null;

  return (
    <>
      {/* Floating Cookie Consent Toast Banner */}
      {visible && (
        <div
          className="position-fixed bottom-0 start-0 end-0 p-3 p-md-4"
          style={{ zIndex: 1070 }}
        >
          <div
            className="container p-3 p-md-4 rounded-4 shadow-lg border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white text-dark animate-fade-in"
            style={{ maxWidth: "860px" }}
          >
            <div className="d-flex align-items-start gap-3">
              <div
                className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <i className="bi bi-shield-check fs-5"></i>
              </div>
              <div>
                <strong className="d-block mb-1">We respect your founder privacy</strong>
                <p className="small text-secondary mb-0">
                  FoundMet uses essential cookies to keep you safely logged in and remember your preferences (like Dark Mode). We never sell your data.
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPolicyModal(true)}
                className="btn btn-sm btn-link text-secondary text-decoration-none px-2"
              >
                Learn More
              </button>
              <button
                type="button"
                onClick={() => handleAccept("essential")}
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              >
                Essential
              </button>
              <button
                type="button"
                onClick={() => handleAccept("all")}
                className="btn btn-sm btn-foundmet rounded-pill px-4 fw-semibold"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie & Privacy Policy Modal */}
      {showPolicyModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(7, 26, 61, 0.65)", zIndex: 1080 }}
          onClick={() => setShowPolicyModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px" }}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-cookie fs-4"></i>
                  <h5 className="modal-title fw-bold mb-0">FoundMet Cookie & Privacy Policy</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowPolicyModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4 text-secondary small">
                <h6 className="fw-bold text-dark mb-2">1. What are cookies?</h6>
                <p>
                  Cookies are tiny, secure text files stored on your browser to keep track of your active session and preferences.
                </p>

                <h6 className="fw-bold text-dark mb-2 mt-3">2. Essential Cookies We Use</h6>
                <ul className="mb-3 ps-3">
                  <li><strong>Session & Auth:</strong> Keeps your founder session active so you do not have to log in on every refresh.</li>
                  <li><strong>Theme Preference:</strong> Remembers your Dark / Light Mode preference.</li>
                  <li><strong>Connection Cache:</strong> Temporarily caches your connection states for instant page loads.</li>
                </ul>

                <h6 className="fw-bold text-dark mb-2 mt-3">3. Contact & Phone Privacy</h6>
                <p>
                  Your phone number and private contact details are never exposed to search engines or public crawlers. Phone numbers can only be shared with your explicit permission after mutual connection acceptance.
                </p>

                <h6 className="fw-bold text-dark mb-2 mt-3">4. Managing Cookies</h6>
                <p className="mb-0">
                  You can clear cookies at any time via your browser settings or click "Essential Only" below.
                </p>
              </div>

              <div className="modal-footer border-top p-3 bg-light d-flex justify-content-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAccept("all");
                    setShowPolicyModal(false);
                  }}
                  className="btn btn-sm btn-foundmet rounded-pill px-4"
                >
                  I Understand & Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
