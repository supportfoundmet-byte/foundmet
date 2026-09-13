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

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ErrorPage from "./ErrorPage.jsx";
import Admin from "./Admin.jsx";
import Seo from "./components/Seo.jsx";

const PAGE_SEO = {
  "/": {
    title: "FoundMet | Find your co-founder nearby",
    description: "Match with complementary founders within 50–80 km, chat privately after connecting, and build together.",
  },
  "/explore": {
    title: "Explore founders | FoundMet",
    description: "Discover verified founders and co-founders near you. Filter by city, distance, and project stage.",
  },
  "/register": {
    title: "Create your founder profile | FoundMet",
    description: "Join FoundMet to find a co-founder, share your idea privately, and connect with builders nearby.",
  },
  "/login": {
    title: "Sign in | FoundMet",
    description: "Sign in to manage connections, messages, and your founder profile.",
  },
  "/dashboard": {
    title: "Dashboard | FoundMet",
    description: "Manage connections, messages, and your startup workspace.",
  },
 
  "/terms": {
    title: "Terms of Service | FoundMet",
    description: "Read the FoundMet terms of service.",
  },
  "/privacy": {
    title: "Privacy Policy | FoundMet",
    description: "How FoundMet handles founder data, location, and private messages.",
  },
  "/cookies": {
    title: "Cookie Policy | FoundMet",
    description: "Cookie use on FoundMet.",
  },
  "/superadmin": {
    title: "Superadmin | FoundMet",
    description: "Restricted administration for FoundMet operators.",
  },
};

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/superadmin");
  const seo = PAGE_SEO[location.pathname] || PAGE_SEO["/"];
  return (
    <ErrorBoundary>
      <Seo title={seo.title} description={seo.description} path={location.pathname} />
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

        {!isAdmin}
        <CookieBanner />
      </div>
    </ErrorBoundary>
  );
}
