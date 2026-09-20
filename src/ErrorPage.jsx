import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function ErrorPage() {
  return (
    <div className="min-vh-100 bg-background d-flex flex-column">
      <Header />

      <main className="error-page flex-grow-1 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="error-card text-center">

                {/* 404 */}
                <div className="error-number foundmet-gradient-text">
                  404
                </div>

                {/* Icon */}
                <div className="error-icon mx-auto mb-4">
                  <i className="bi bi-compass"></i>
                </div>

                <span className="badge rounded-pill error-badge mb-3">
                  Page not found
                </span>

                <h1 className="fw-bold mb-3">
                  Looks like you took a wrong turn.
                </h1>

                <p className="text-secondary mx-auto mb-4 error-description">
                  The page you're looking for doesn't exist, has been moved,
                  or the link may be incorrect.
                </p>

                {/* Actions */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                  <Link
                    to="/"
                    className="btn btn-foundmet rounded-pill px-4 py-2"
                  >
                    <i className="bi bi-house-door me-2"></i>
                    Back to Home
                  </Link>

                  <Link
                    to="/explore"
                    className="btn btn-outline-primary rounded-pill px-4 py-2"
                  >
                    <i className="bi bi-compass me-2"></i>
                    Explore FoundMet
                  </Link>
                </div>

                {/* Bottom message */}
                <div className="error-footer mt-5">
                  <span className="text-secondary small">
                    <i className="bi bi-stars me-1"></i>
                    FoundMet — Built for people who build.
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}