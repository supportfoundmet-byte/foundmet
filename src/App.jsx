import { Routes, Route, useLocation } from "react-router-dom";
import "./global.css";
import Home from "./Home.jsx";
import Explore from "./Explore.jsx";
import Register from "./Register.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import Terms from "./Terms.jsx";
import Privacy from "./Privacy.jsx";
import Cookies from "./Cookies.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ErrorPage from "./ErrorPage.jsx";
import Admin from "./Admin.jsx";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/superadmin");
  return (
    <ErrorBoundary>
      <div className="App min-vh-100 d-flex flex-column">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/superadmin" element={<Admin />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>

      {!isAdmin && <Chatbot />}

      {/* Global Cookie Consent Banner */}
        <CookieBanner />
      </div>
    </ErrorBoundary>
  );
}