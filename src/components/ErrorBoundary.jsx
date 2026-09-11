import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("FoundMet application error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center bg-background p-4">
        <div className="card foundmet-card border-0 shadow-sm text-center p-4" style={{ maxWidth: "480px" }}>
          <i className="bi bi-exclamation-triangle-fill text-warning display-5 mb-3"></i>
          <h1 className="h3 fw-bold">Something went wrong</h1>
          <p className="text-secondary">Please reload the page or return home. Your session is still protected.</p>
          <div className="d-flex justify-content-center gap-2">
            <button type="button" className="btn btn-foundmet rounded-pill" onClick={() => window.location.reload()}>Reload</button>
            <Link to="/" className="btn btn-outline-primary rounded-pill">Home</Link>
          </div>
        </div>
      </main>
    );
  }
}
