import { useState, useRef, useEffect, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./services/api.js";
import Header from "./components/Header.jsx";
import {
  getActiveSteps,
  getPasswordStrength,
  validateStepInput,
  validateSubmission,
} from "./utils/registerValidation.js";
import "./global.css";

function ChoiceStep({ title, options, value, multiple = false, onSelect }) {
  return (
    <div className="fade-in">
      <h2 className="display-6 fw-bold text-main mb-2">{title}</h2>
      <p className="text-secondary mb-4">Choose what fits you best.</p>
      <div className="row g-3">
        {options.map(([key, label]) => {
          const selected = multiple ? value.includes(key) : value === key;
          return (
            <div className="col-12 col-sm-6" key={key}>
              <button
                type="button"
                className={`role-select-card w-100 p-3 text-start border ${selected ? "selected" : ""}`}
                onClick={() => onSelect(key)}
              >
                <span className="fw-semibold text-capitalize">{label}</span>
                <i
                  className={`bi ${selected ? "bi-check-circle-fill text-primary" : "bi-circle text-muted"} float-end`}
                ></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const fileInputId = useId();
  const inputRef = useRef(null);

  // Active step key
  const [currentStep, setCurrentStep] = useState("name");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "founder", // "founder" | "co-founder"
    address: "",
    matchRole: "co-founder",
    canBring: [],
    buildType: "startup",
    commitment: "full-time",
    lookingFor: [],
    hasProject: "no", // "yes" | "no"
    projectStatus: "idea", // "idea" | "development" | "execution"
    projectDetails: "",
    projectLink: "",
  });

  // Photo / Image File State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [locating, setLocating] = useState(false);

  // Compute active steps list based on hasProject
  const activeSteps = getActiveSteps(formData.hasProject);
  const currentIndex = activeSteps.indexOf(currentStep);
  const totalSteps = activeSteps.length;
  // Progress percentage (review step is 100%)
  const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100);

  // Auto focus input when step changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentStep]);

  // Handle generic text change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
    setServerError("");
  };

  // Quick preset location selection
  const setQuickLocation = (loc) => {
    setFormData((prev) => ({ ...prev, address: loc }));
    setValidationError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError(
        "Location is not supported. Please enter your city manually.",
      );
      return;
    }
    setLocating(true);
    setValidationError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const result = await response.json();
          const a = result.address || {};
          const location = [
            a.city || a.town || a.village || a.municipality,
            a.state,
            a.country,
          ]
            .filter(Boolean)
            .join(", ");
          setFormData((prev) => ({
            ...prev,
            address:
              location ||
              `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
          }));
        } catch {
          setValidationError(
            "We could not read your location. Please enter it manually.",
          );
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setValidationError(
          "Location permission was not granted. Please enter your city manually.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  // Toggle Looking For multi-select
  const handleLookingForToggle = (roleKey) => {
    setFormData((prev) => {
      const exists = prev.lookingFor.includes(roleKey);
      const updated = exists
        ? prev.lookingFor.filter((item) => item !== roleKey)
        : [...prev.lookingFor, roleKey];
      return { ...prev, lookingFor: updated };
    });
  };

  const toggleChoice = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field])
        ? prev[field].includes(value)
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value]
        : value,
    }));
    setValidationError("");
  };

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationError("Image size must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setValidationError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Validate step input before navigating
  const validateStep = (stepKey) => {
    const result = validateStepInput(stepKey, formData, imageFile);
    if (!result.valid) {
      setValidationError(result.message);
      return false;
    }

    setValidationError("");
    return true;
  };

  // Next step navigation
  const goNext = () => {
    if (!validateStep(currentStep)) return;

    setValidationError("");
    setServerError("");

    const steps = getActiveSteps(formData.hasProject);
    const nextIdx = currentIndex + 1;
    if (nextIdx < steps.length) {
      setCurrentStep(steps[nextIdx]);
    }
  };

  // Previous step navigation
  const goPrev = () => {
    setValidationError("");
    setServerError("");

    const steps = getActiveSteps(formData.hasProject);
    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(steps[prevIdx]);
    }
  };

  // Jump to specific step (used from Review screen)
  const jumpToStep = (stepKey) => {
    setValidationError("");
    setServerError("");
    setCurrentStep(stepKey);
  };

  // Handle Enter keypress for inputs
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      goNext();
    }
  };

  // Final Form Submission to Backend
  const handleSubmit = async () => {
    const submissionCheck = validateSubmission({
      formData,
      imageFile,
      agreedToTerms,
    });

    if (!submissionCheck.valid) {
      setValidationError(submissionCheck.message);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim().toLowerCase());
      data.append("password", formData.password);
      data.append("role", formData.role);
      data.append("address", formData.address.trim());
      data.append("matchRole", formData.matchRole);
      data.append("buildType", formData.buildType);
      data.append("commitment", formData.commitment);
      data.append("hasProject", formData.hasProject);

      if (formData.hasProject === "yes") {
        if (formData.projectDetails.trim()) {
          data.append("projectDetails", formData.projectDetails.trim());
        }
        if (formData.projectLink.trim()) {
          data.append("projectLink", formData.projectLink.trim());
        }
        if (formData.projectStatus) {
          data.append("projectStatus", formData.projectStatus);
        }
      }

      formData.lookingFor.forEach((role) => {
        data.append("lookingFor", role);
      });
      formData.canBring.forEach((strength) =>
        data.append("canBring", strength),
      );

      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await api.post("/auth/create-account", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201 || res.status === 200) {
        const accessToken =
          res.data?.accessToken || res.data?.data?.accessToken;
        if (accessToken)
          sessionStorage.setItem("foundmet_access_token", accessToken);
        if (res.data?.user) {
          localStorage.setItem("foundmet_user", JSON.stringify(res.data.user));
        }
        setSuccess(true);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err.response?.data?.message ||
        "Registration could not be completed. Please verify your details and try again.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Success Celebration View
  if (success) {
    return (
      <div className="register-page min-vh-100 bg-background d-flex flex-column">
        <Header />
        <div className="container my-auto py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-7 col-lg-5">
              <div className="card border-0 shadow-lg p-4 p-md-5 text-center rounded-4 register-success-card fade-in">
                <div className="success-icon-badge mx-auto mb-4">
                  <i className="bi bi-rocket-takeoff-fill display-5 text-white"></i>
                </div>
                <h2 className="fw-bold mb-2">Welcome to FoundMet!</h2>
                <p className="text-secondary mb-4">
                  Awesome work,{" "}
                  <strong className="text-main">{formData.name}</strong>! Your
                  founder profile is now live.
                </p>

                {/* Founder Badge Card */}
                <div className="card bg-light border-0 p-3 rounded-3 mb-4 text-start">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          formData.name || "Founder",
                        )}&background=0B5CFF&color=fff&size=120`
                      }
                      alt="Avatar"
                      className="rounded-circle border"
                      style={{
                        width: "52px",
                        height: "52px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold">{formData.name}</h6>
                      <span className="badge bg-primary text-white text-capitalize mt-1">
                        {formData.role === "co-founder"
                          ? "Co-Founder"
                          : "Founder"}
                      </span>
                      <small className="text-secondary d-block mt-1">
                        <i className="bi bi-geo-alt me-1"></i>
                        {formData.address}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button
                    onClick={() => navigate("/explore")}
                    className="btn btn-foundmet btn-lg w-100"
                  >
                    <i className="bi bi-compass me-2"></i>
                    Explore Fellow Founders
                  </button>
                  <Link to="/" className="btn btn-outline-secondary">
                    Go to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page min-vh-100 bg-background d-flex flex-column">
      <Header />

      {/* Progress & Breadcrumbs Header */}
      <div
        className="w-100 bg-white border-bottom shadow-xs py-2 px-3 sticky-top"
        style={{ top: "72px", zIndex: 100 }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Back & Step Counter */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="btn btn-sm btn-light border rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: "34px", height: "34px" }}
                title="Previous step"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <div className="d-none d-sm-block">
                <span className="text-secondary small fw-semibold">
                  Step{" "}
                  <span className="text-primary fw-bold">
                    {currentIndex + 1}
                  </span>{" "}
                  of {totalSteps}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div
              className="flex-grow-1 mx-2 mx-md-4"
              style={{ maxWidth: "350px" }}
            >
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-primary transition-width"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-bold d-none d-md-inline">
                {progressPercent}% Done
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-lg-none rounded-pill px-3"
                onClick={() => setShowMobilePreview(!showMobilePreview)}
              >
                <i className="bi bi-eye me-1"></i>
                {showMobilePreview ? "Hide Preview" : "Card Preview"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Flow Grid */}
      <main className="container my-auto py-4 py-md-5 flex-grow-1 d-flex align-items-center">
        <div className="row w-100 justify-content-center align-items-center g-4">
          {/* Question Screen (Left / Center) */}
          <div className="col-12 col-lg-7 col-xl-6">
            <div className="question-wrapper p-4 p-sm-5 bg-white rounded-4 border shadow-sm position-relative">
              {/* Step indicator tag */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">
                  {currentStep === "review"
                    ? "Final Review"
                    : `Question ${currentIndex + 1} of ${totalSteps}`}
                </span>
                {currentStep !== "review" && (
                  <span className="text-muted small d-none d-sm-inline">
                    Press{" "}
                    <kbd className="bg-light text-secondary border px-1 rounded">
                      Enter ↵
                    </kbd>
                  </span>
                )}
              </div>

              {/* Errors Display */}
              {(serverError || validationError) && (
                <div
                  className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4 fade-in"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{validationError || serverError}</div>
                </div>
              )}

              {/* ================= STEP 1: NAME ================= */}
              {currentStep === "name" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    What is your full name?
                  </h2>
                  <p className="text-secondary mb-4">
                    Let's start with how co-founders and collaborators will
                    identify you.
                  </p>
                  <div className="mb-4">
                    <input
                      ref={inputRef}
                      type="text"
                      name="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g. Maya Lin"
                      className="form-control form-control-lg fs-4 py-3 border-2"
                      maxLength={100}
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 2: EMAIL ================= */}
              {currentStep === "email" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    What is your email address?
                  </h2>
                  <p className="text-secondary mb-4">
                    Nice to have you here,{" "}
                    <strong className="text-primary">
                      {formData.name || "Founder"}
                    </strong>
                    ! We'll use this for your account.
                  </p>
                  <div className="mb-4">
                    <input
                      ref={inputRef}
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="maya@example.com"
                      className="form-control form-control-lg fs-4 py-3 border-2"
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 3: PASSWORD ================= */}
              {currentStep === "password" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Create a secure password
                  </h2>
                  <p className="text-secondary mb-4">
                    Use at least 8 characters to keep your founder account safe.
                  </p>
                  <div className="mb-4">
                    <div className="input-group">
                      <input
                        ref={inputRef}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="At least 8 characters"
                        className="form-control form-control-lg fs-4 py-3 border-2 border-end-0"
                      />
                      <button
                        type="button"
                        className="input-group-text bg-white border-2 border-start-0 px-3 text-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <i
                          className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} fs-5`}
                        ></i>
                      </button>
                    </div>

                    {/* Live Strength Bar */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar ${passwordStrength.color}`}
                            style={{
                              width: `${(passwordStrength.score / 4) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-1">
                          <small className="text-secondary">
                            Password strength
                          </small>
                          <small
                            className={`fw-bold ${passwordStrength.score >= 3 ? "text-success" : "text-warning"}`}
                          >
                            {passwordStrength.label}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= STEP 4: ROLE ================= */}
              {currentStep === "role" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    What is your role?
                  </h2>
                  <p className="text-secondary mb-4">
                    Are you initiating your own venture, or ready to join as a
                    co-founder?
                  </p>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6">
                      <div
                        className={`role-select-card p-4 text-center cursor-pointer ${
                          formData.role === "founder" ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, role: "founder" }))
                        }
                      >
                        <div
                          className="role-icon mx-auto mb-3"
                          style={{
                            width: "54px",
                            height: "54px",
                            fontSize: "24px",
                          }}
                        >
                          <i className="bi bi-award-fill"></i>
                        </div>
                        <h4 className="fw-bold mb-1">Founder</h4>
                        <p className="text-secondary small mb-0">
                          Starting and leading an ambitious new company
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div
                        className={`role-select-card p-4 text-center cursor-pointer ${
                          formData.role === "co-founder" ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            role: "co-founder",
                          }))
                        }
                      >
                        <div
                          className="role-icon mx-auto mb-3"
                          style={{
                            width: "54px",
                            height: "54px",
                            fontSize: "24px",
                          }}
                        >
                          <i className="bi bi-people-fill"></i>
                        </div>
                        <h4 className="fw-bold mb-1">Co-Founder</h4>
                        <p className="text-secondary small mb-0">
                          Ready to team up and build vision into reality
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 5: LOCATION ================= */}
              {currentStep === "address" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Where are you based?
                  </h2>
                  <p className="text-secondary mb-4">
                    Founders love knowing your location for local meetups or
                    remote work.
                  </p>
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-primary w-100 rounded-pill py-3 mb-3"
                      onClick={useCurrentLocation}
                      disabled={locating}
                    >
                      <i
                        className={`bi ${locating ? "bi-arrow-repeat" : "bi-geo-alt-fill"} me-2`}
                      ></i>
                      {locating
                        ? "Finding your location..."
                        : "Use my current location"}
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your city, country, or choose Remote"
                      className="form-control form-control-lg fs-4 py-3 border-2"
                      maxLength={500}
                    />
                  </div>

                  {/* Quick Pill presets */}
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
                    <small className="text-secondary me-1">
                      Or choose a location:
                    </small>
                    {[
                      "Bangalore, India",
                      "Delhi NCR, India",
                      "Mumbai, India",
                      "Kolkata, India",
                      
                    ].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setQuickLocation(city)}
                        className="btn btn-sm btn-light border rounded-pill px-3"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === "matchRole" && (
                <ChoiceStep
                  title="What are you looking for?"
                  options={[
                    ["co-founder", "Co-founder"],
                    ["builder", "Someone to build with"],
                  ]}
                  value={formData.matchRole}
                  onSelect={(value) => toggleChoice("matchRole", value)}
                />
              )}

              {currentStep === "canBring" && (
                <ChoiceStep
                  title="What can you bring?"
                  options={[
                    "technology",
                    "business",
                    "design",
                    "marketing",
                    "product",
                    "other",
                  ].map((value) => [
                    value,
                    value[0].toUpperCase() + value.slice(1),
                  ])}
                  value={formData.canBring}
                  multiple
                  onSelect={(value) => toggleChoice("canBring", value)}
                />
              )}

              {currentStep === "buildType" && (
                <ChoiceStep
                  title="What do you want to build?"
                  options={["startup", "product", "business", "not-sure"].map(
                    (value) => [
                      value,
                      value === "not-sure"
                        ? "Not sure yet"
                        : value[0].toUpperCase() + value.slice(1),
                    ],
                  )}
                  value={formData.buildType}
                  onSelect={(value) => toggleChoice("buildType", value)}
                />
              )}

              {currentStep === "commitment" && (
                <ChoiceStep
                  title="How committed are you?"
                  options={["full-time", "part-time", "exploring"].map(
                    (value) => [value, value[0].toUpperCase() + value.slice(1)],
                  )}
                  value={formData.commitment}
                  onSelect={(value) => toggleChoice("commitment", value)}
                />
              )}

              {/* ================= STEP 10: LOOKING FOR ================= */}
              {currentStep === "lookingFor" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Who are you looking for?
                  </h2>
                  <p className="text-secondary mb-4">
                    Select the key leadership roles you want to find or recruit
                    (multi-select):
                  </p>

                  <div className="d-flex flex-column gap-3 mb-4">
                    {[
                      {
                        key: "project-helper",
                        title: "Project Helper",
                        desc: "Someone who can help turn an idea into a real project",
                        icon: "bi-code-slash",
                      },
                      {
                        key: "business-partner",
                        title: "Business Partner",
                        desc: "Someone to help with customers, planning, or growth",
                        icon: "bi-briefcase",
                      },
                      {
                        key: "creative-helper",
                        title: "Creative or Marketing Helper",
                        desc: "Someone to help with design, content, or promotion",
                        icon: "bi-graph-up-arrow",
                      },
                    ].map((item) => {
                      const isSelected = formData.lookingFor.includes(item.key);
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleLookingForToggle(item.key)}
                          className={`p-3 rounded-3 border role-select-card cursor-pointer d-flex align-items-center justify-content-between ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div className="role-icon mb-0">
                              <i className={`bi ${item.icon}`}></i>
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0">{item.title}</h6>
                              <small className="text-secondary">
                                {item.desc}
                              </small>
                            </div>
                          </div>
                          <div className="ms-2">
                            <i
                              className={`bi ${
                                isSelected
                                  ? "bi-check-circle-fill text-primary fs-4"
                                  : "bi-circle text-muted fs-4"
                              }`}
                            ></i>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= STEP 7: HAS PROJECT ================= */}
              {currentStep === "hasProject" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Do you have a project or idea?
                  </h2>
                  <p className="text-secondary mb-4">
                    Whether it's an idea on paper or a live product, let us
                    know!
                  </p>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6">
                      <div
                        className={`role-select-card p-4 text-center cursor-pointer ${
                          formData.hasProject === "yes" ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            hasProject: "yes",
                          }))
                        }
                      >
                        <div
                          className="role-icon mx-auto mb-3"
                          style={{
                            width: "54px",
                            height: "54px",
                            fontSize: "24px",
                          }}
                        >
                          <i className="bi bi-rocket-takeoff-fill"></i>
                        </div>
                        <h4 className="fw-bold mb-1">
                          Yes, I have an idea/project
                        </h4>
                        <p className="text-secondary small mb-0">
                          Looking for co-founders to build and scale together
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div
                        className={`role-select-card p-4 text-center cursor-pointer ${
                          formData.hasProject === "no" ? "selected" : ""
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, hasProject: "no" }))
                        }
                      >
                        <div
                          className="role-icon mx-auto mb-3"
                          style={{
                            width: "54px",
                            height: "54px",
                            fontSize: "24px",
                          }}
                        >
                          <i className="bi bi-search-heart-fill"></i>
                        </div>
                        <h4 className="fw-bold mb-1">No, exploring to join</h4>
                        <p className="text-secondary small mb-0">
                          Ready to team up with an exciting early venture
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= STEP 8: PROJECT STATUS (conditional) ================= */}
              {currentStep === "projectStatus" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    What stage is your project in?
                  </h2>
                  <p className="text-secondary mb-4">
                    Select where you are in the journey:
                  </p>

                  <div className="d-flex flex-column gap-3 mb-4">
                    {[
                      {
                        key: "idea",
                        label: "💡 Idea & Planning",
                        desc: "Researching the concept and finding the right team",
                        badge: "Early",
                      },
                      {
                        key: "development",
                        label: "🛠️ In Development",
                        desc: "Building the initial prototype or first MVP",
                        badge: "Building",
                      },
                      {
                        key: "execution",
                        label: "🚀 Live Product",
                        desc: "Product is live or ready for users",
                        badge: "Active",
                      },
                    ].map((item) => {
                      const isSelected = formData.projectStatus === item.key;
                      return (
                        <div
                          key={item.key}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              projectStatus: item.key,
                            }))
                          }
                          className={`p-3 rounded-3 border role-select-card cursor-pointer d-flex align-items-center justify-content-between ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h5 className="fw-bold mb-0">{item.label}</h5>
                              <span className="badge bg-primary-subtle text-primary">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-secondary small mb-0">
                              {item.desc}
                            </p>
                          </div>
                          <i
                            className={`bi ${
                              isSelected
                                ? "bi-check-circle-fill text-primary fs-4"
                                : "bi-circle text-muted fs-4"
                            }`}
                          ></i>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= STEP 9: PROJECT DETAILS (conditional) ================= */}
              {currentStep === "projectDetails" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Describe your project
                  </h2>
                  <p className="text-secondary mb-4">
                    What problem are you solving? Briefly pitch your vision to
                    attract the right people.
                  </p>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-secondary">
                        Summary & Problem Solved
                      </small>
                      <small className="text-secondary">
                        {formData.projectDetails.length}/300
                      </small>
                    </div>
                    <textarea
                      ref={inputRef}
                      name="projectDetails"
                      rows={5}
                      value={formData.projectDetails}
                      onChange={handleChange}
                      placeholder="e.g. Building a peer-to-peer cloud GPU network for indie AI developers, reducing inference costs by 70%..."
                      className="form-control form-control-lg fs-5 p-3 border-2"
                      maxLength={300}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* ================= STEP 10: PROJECT LINK (conditional) ================= */}
              {currentStep === "projectLink" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Got a link to your project?
                  </h2>
                  <p className="text-secondary mb-4">
                    Optional — add your landing page, GitHub repo, or demo.
                  </p>

                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-white border-2 border-end-0">
                        <i className="bi bi-link-45deg fs-4 text-secondary"></i>
                      </span>
                      <input
                        ref={inputRef}
                        type="url"
                        name="projectLink"
                        value={formData.projectLink}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="https://myproject.com or https://github.com/..."
                        className="form-control form-control-lg fs-5 py-3 border-2 border-start-0 ps-0"
                      />
                    </div>
                    <small className="text-secondary mt-2 d-block">
                      No link yet? Feel free to leave blank and continue!
                    </small>
                  </div>
                </div>
              )}

              {/* ================= STEP 11: PROFILE PHOTO ================= */}
              {currentStep === "photo" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Add your profile photo
                  </h2>
                  <p className="text-secondary mb-4">
                    A friendly photo builds instant trust and increases
                    connection responses by 5x.
                  </p>

                  <div className="p-4 bg-light rounded-4 border text-center mb-4">
                    <div
                      className="register-avatar-preview mx-auto mb-3"
                      style={{ width: "96px", height: "96px" }}
                    >
                      <img
                        src={
                          imagePreview ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            formData.name || "Founder",
                          )}&background=0B5CFF&color=fff&size=192`
                        }
                        alt="Avatar preview"
                        className="rounded-circle border shadow-sm"
                        style={{
                          width: "96px",
                          height: "96px",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <h5 className="fw-bold mb-1">
                      {imageFile
                        ? imageFile.name
                        : formData.name
                          ? `${formData.name}'s Avatar`
                          : "Profile Picture"}
                    </h5>
                    <p className="text-secondary small mb-3">
                      JPG, PNG, or WEBP (Max 5MB)
                    </p>

                    <div className="d-flex justify-content-center gap-2">
                      <label
                        htmlFor={fileInputId}
                        className="btn btn-outline-primary rounded-pill px-4"
                      >
                        <i className="bi bi-camera me-2"></i>
                        {imageFile ? "Change Photo" : "Upload Picture"}
                      </label>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="btn btn-outline-danger rounded-pill px-3"
                          title="Remove picture"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                      required
                      aria-label="Profile photo"
                    />
                  </div>
                </div>
              )}

              {/* ================= STEP 12: REVIEW & SUBMIT ================= */}
              {currentStep === "review" && (
                <div className="fade-in">
                  <h2 className="display-6 fw-bold text-main mb-2">
                    Review Your Profile
                  </h2>
                  <p className="text-secondary mb-4">
                    Everything looks ready! Review your information below before
                    launching.
                  </p>

                  <div className="card border p-3 rounded-3 bg-light mb-4">
                    {/* Section 1: Basic */}
                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                      <div>
                        <small className="text-secondary d-block">
                          Full Name & Email
                        </small>
                        <strong>{formData.name}</strong> •{" "}
                        <span className="text-secondary">{formData.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToStep("name")}
                        className="btn btn-sm btn-link text-primary p-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 2: Role & Location */}
                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                      <div>
                        <small className="text-secondary d-block">
                          Role & Location
                        </small>
                        <span className="badge bg-primary text-white text-capitalize me-2">
                          {formData.role === "co-founder"
                            ? "Co-Founder"
                            : "Founder"}
                        </span>
                        <span>{formData.address}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToStep("role")}
                        className="btn btn-sm btn-link text-primary p-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 3: Looking For */}
                    <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                      <div>
                        <small className="text-secondary d-block">
                          Looking For
                        </small>
                        {formData.lookingFor.length > 0 ? (
                          <div className="d-flex gap-1 flex-wrap mt-1">
                            {formData.lookingFor.map((r) => (
                              <span
                                key={r}
                                className="badge bg-secondary-subtle text-dark text-uppercase"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">
                            Open / None specified
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToStep("lookingFor")}
                        className="btn btn-sm btn-link text-primary p-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Section 4: Project */}
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <small className="text-secondary d-block">
                          Project Details
                        </small>
                        {formData.hasProject === "yes" ? (
                          <div>
                            <span className="badge bg-info-subtle text-info-emphasis text-capitalize me-2">
                              {formData.projectStatus}
                            </span>
                            <small className="d-block text-secondary mt-1">
                              {formData.projectDetails || "No details provided"}
                            </small>
                            {formData.projectLink && (
                              <small
                                className="d-block text-primary text-truncate mt-1"
                                style={{ maxWidth: "300px" }}
                              >
                                <i className="bi bi-link me-1"></i>
                                {formData.projectLink}
                              </small>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">
                            Exploring opportunities / Open to join
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => jumpToStep("hasProject")}
                        className="btn btn-sm btn-link text-primary p-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Terms & Conditions Acceptance */}
                  <div className="card border-primary-subtle bg-primary-subtle p-3 rounded-3 mb-4">
                    <div className="form-check d-flex align-items-start gap-2 mb-0">
                      <input
                        className="form-check-input mt-1 flex-shrink-0"
                        type="checkbox"
                        id="agreeTermsCheck"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          setValidationError("");
                        }}
                      />
                      <label
                        className="form-check-label small text-main"
                        htmlFor="agreeTermsCheck"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="btn btn-link text-primary p-0 fw-bold small text-decoration-underline"
                        >
                          FoundMet Terms of Service
                        </button>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          target="_blank"
                          className="text-primary fw-bold text-decoration-underline"
                        >
                          Privacy Policy
                        </Link>
                        . I understand my phone number and private contact
                        details remain private until I approve sharing with
                        connected builders.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Bar (Previous & Next/Submit) */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="btn btn-outline-secondary px-4 rounded-pill"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back
                </button>

                {currentStep !== "review" ? (
                  <button
                    type="button"
                    onClick={goNext}
                    className="btn btn-foundmet px-5 py-2 rounded-pill fs-6 fw-bold"
                  >
                    Continue
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !agreedToTerms}
                    className="btn btn-foundmet px-5 py-2 rounded-pill fs-6 fw-bold d-flex align-items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Create My Profile</span>
                        <i className="bi bi-rocket-takeoff-fill"></i>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="text-center mt-3">
              <Link to="/login" className="text-secondary small">
                Already registered?{" "}
                <span className="text-primary fw-semibold">Sign in here</span>
              </Link>
            </div>
          </div>

          {/* Real-time Live Founder Card Preview (Desktop Right / Mobile Collapsible) */}
          <div
            className={`col-12 col-lg-5 col-xl-5 ${
              showMobilePreview ? "d-block" : "d-none d-lg-block"
            }`}
          >
            <div className="sticky-top" style={{ top: "140px" }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="fw-bold text-secondary small text-uppercase letter-spacing">
                  <i className="bi bi-eye me-1"></i> Your Profile Preview
                </span>
                <span className="badge bg-primary-subtle text-primary border rounded-pill">
                  How others will see you
                </span>
              </div>

              {/* Founder Preview Card */}
              <div className="founder-card shadow-sm border bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          formData.name || "Founder",
                        )}&background=0B5CFF&color=fff&size=100`
                      }
                      alt="Avatar"
                      className="founder-avatar"
                    />
                    <div>
                      <h3 className="founder-name">
                        {formData.name || "Your Name"}
                      </h3>
                      <p className="founder-role mb-0 text-capitalize">
                        {formData.role === "co-founder"
                          ? "Co-Founder"
                          : "Founder"}
                      </p>
                    </div>
                  </div>

                  <button className="icon-btn" type="button" tabIndex={-1}>
                    <i className="bi bi-three-dots"></i>
                  </button>
                </div>

                {/* Location */}
                <div className="founder-location mt-3">
                  <i className="bi bi-geo-alt me-1"></i>
                  {formData.address || "Your City, Country"}
                </div>

                {/* Project details */}
                {formData.hasProject === "yes" && formData.projectDetails ? (
                  <p className="founder-idea mt-3">{formData.projectDetails}</p>
                ) : (
                  <p className="founder-idea mt-3 text-muted fst-italic">
                    {formData.hasProject === "yes"
                      ? "Add your startup description to preview it here..."
                      : "Open to exploring exciting startup opportunities and joining early teams."}
                  </p>
                )}

                {/* Project Status */}
                {formData.hasProject === "yes" && formData.projectStatus && (
                  <div className="mb-3">
                    <small className="text-secondary d-block mb-1">
                      Project Status
                    </small>
                    <span className="skill-tag text-capitalize">
                      {formData.projectStatus}
                    </span>
                  </div>
                )}

                {/* Looking For */}
                <div className="looking-for mt-3">
                  <small className="text-secondary d-block mb-2">
                    Looking for
                  </small>
                  {formData.lookingFor.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {formData.lookingFor.map((item) => (
                        <span className="skill-tag" key={item}>
                          {item
                            .replaceAll("-", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted small">
                      No specific roles selected
                    </span>
                  )}
                </div>

                {/* Preview Connect Button */}
                <div className="d-flex gap-2 mt-4">
                  <button
                    className="btn btn-foundmet flex-grow-1"
                    type="button"
                    disabled
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Connect
                  </button>
                  <button
                    className="btn btn-light border"
                    type="button"
                    disabled
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                </div>
              </div>

              <div className="mt-3 text-center">
                <small className="text-secondary">
                  <i className="bi bi-stars me-1 text-primary"></i>
                  This is how people on FoundMet will see your profile.
                </small>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Interactive Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(7, 26, 61, 0.7)", zIndex: 1100 }}
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px" }}
          >
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white p-3 px-4">
                <h5 className="modal-title fw-bold mb-0">
                  FoundMet Terms of Service
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTermsModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 small text-secondary">
                <h6 className="fw-bold text-dark mb-1">
                  1. 100% Idea & Code Ownership
                </h6>
                <p>
                  You retain full ownership of your ideas, intellectual
                  property, and code. FoundMet takes 0 equity and 0 IP.
                </p>

                <h6 className="fw-bold text-dark mb-1">
                  2. Contact & Mobile Privacy
                </h6>
                <p>
                  Your phone number is strictly private. It is never displayed
                  publicly and can only be shared with your explicit approval
                  after mutual connection acceptance.
                </p>

                <h6 className="fw-bold text-dark mb-1">
                  3. Respectful Collaboration
                </h6>
                <p>
                  FoundMet is a community of builders. Spam, fraudulent pitches,
                  or harassment will result in immediate account termination.
                </p>
              </div>
              <div className="modal-footer border-top p-3 bg-light">
                <button
                  type="button"
                  className="btn btn-foundmet rounded-pill px-4"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(false);
                  }}
                >
                  I Agree & Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
