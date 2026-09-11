import { Link } from "react-router-dom";
import Header from "./components/Header.jsx";

export default function ErrorPage() {
  return (
    <div className="min-vh-100 bg-background d-flex flex-column">
      <Header />
      <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <div className="display-1 fw-bold foundmet-gradient-text">404</div>
          <h1 className="h3 fw-bold">Page not found</h1>
          <p className="text-secondary">That page does not exist.</p>
          <Link to="/" className="btn btn-foundmet rounded-pill px-4">Back home</Link>
        </div>
      </main>
    </div>
  );
}
