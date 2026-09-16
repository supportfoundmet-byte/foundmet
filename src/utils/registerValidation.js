export const STEP_KEYS = [
  "name",
  "email",
  "password",
  "role",
  "address",
  "matchRole",
  "canBring",
  "buildType",
  "commitment",
  "lookingFor",
  "hasProject",
  "projectStatus",
  "projectDetails",
  "projectLink",
  "photo",
  "review",
];

export function getActiveSteps(hasProject) {
  if (hasProject === "yes") {
    return STEP_KEYS;
  }

  return STEP_KEYS.filter(
    (key) =>
      key !== "projectStatus" &&
      key !== "projectDetails" &&
      key !== "projectLink",
  );
}

export function getPasswordStrength(pass) {
  if (!pass) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  switch (score) {
    case 1:
      return { score, label: "Weak", color: "bg-danger" };
    case 2:
      return { score, label: "Fair", color: "bg-warning" };
    case 3:
      return { score, label: "Good", color: "bg-info" };
    case 4:
      return { score, label: "Strong", color: "bg-success" };
    default:
      return { score: 1, label: "Too Short", color: "bg-danger" };
  }
}

export function validateStepInput(stepKey, formData, imageFile) {
  if (stepKey === "name") {
    if (!formData.name.trim()) {
      return { valid: false, message: "Please enter your full name." };
    }
    if (formData.name.trim().length < 2) {
      return {
        valid: false,
        message: "Name must be at least 2 characters.",
      };
    }
  }

  if (stepKey === "email") {
    if (!formData.email.trim()) {
      return {
        valid: false,
        message: "Please enter your email address.",
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return {
        valid: false,
        message: "Please enter a valid email address (e.g. name@domain.com).",
      };
    }
  }

  if (stepKey === "password") {
    if (!formData.password) {
      return { valid: false, message: "Please create a password." };
    }
    if (formData.password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long.",
      };
    }
  }

  if (stepKey === "address") {
    if (!formData.address.trim()) {
      return {
        valid: false,
        message: "Please specify your city or location.",
      };
    }
  }

  if (stepKey === "projectDetails" && formData.hasProject === "yes") {
    if (!formData.projectDetails.trim()) {
      return {
        valid: false,
        message: "Please briefly describe what you are building.",
      };
    }
  }

  if (stepKey === "photo" && !imageFile) {
    return {
      valid: false,
      message: "Please upload a profile photo to continue.",
    };
  }

  return { valid: true, message: "" };
}

export function validateSubmission({ formData, imageFile, agreedToTerms }) {
  if (!agreedToTerms) {
    return {
      valid: false,
      message:
        "Please agree to the Terms of Service & Privacy Policy before creating your profile.",
    };
  }

  if (!imageFile) {
    return {
      valid: false,
      message: "Please upload a profile photo to continue.",
    };
  }

  const nameValidation = validateStepInput("name", formData, imageFile);
  if (!nameValidation.valid) return nameValidation;

  const emailValidation = validateStepInput("email", formData, imageFile);
  if (!emailValidation.valid) return emailValidation;

  const passwordValidation = validateStepInput("password", formData, imageFile);
  if (!passwordValidation.valid) return passwordValidation;

  if (!formData.address.trim()) {
    return {
      valid: false,
      message: "Please specify your city or location.",
    };
  }

  if (formData.hasProject === "yes" && !formData.projectDetails.trim()) {
    return {
      valid: false,
      message: "Please briefly describe what you are building.",
    };
  }

  return { valid: true, message: "" };
}
