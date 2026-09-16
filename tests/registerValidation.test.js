import test from "node:test";
import assert from "node:assert/strict";
import {
  getActiveSteps,
  getPasswordStrength,
  validateStepInput,
  validateSubmission,
} from "../src/utils/registerValidation.js";

test("getActiveSteps hides project-specific questions for non-project founders", () => {
  const steps = getActiveSteps("no");
  assert.equal(steps.includes("projectDetails"), false);
  assert.equal(steps.includes("projectLink"), false);
  assert.equal(steps.includes("projectStatus"), false);
  assert.equal(steps.includes("photo"), true);
});

test("getActiveSteps keeps project steps when founder has an active project", () => {
  const steps = getActiveSteps("yes");
  assert.equal(steps.includes("projectDetails"), true);
  assert.equal(steps.includes("projectLink"), true);
  assert.equal(steps.includes("projectStatus"), true);
  assert.equal(steps.includes("photo"), true);
});

test("password strength returns expected labels", () => {
  assert.deepEqual(getPasswordStrength("short1"), {
    score: 1,
    label: "Weak",
    color: "bg-danger",
  });

  assert.deepEqual(getPasswordStrength("StrongPass1!"), {
    score: 4,
    label: "Strong",
    color: "bg-success",
  });
});

test("validateStepInput blocks an empty name and invalid email", () => {
  const emptyName = validateStepInput("name", { name: "", email: "", password: "" }, null);
  assert.equal(emptyName.valid, false);
  assert.match(emptyName.message, /full name/i);

  const invalidEmail = validateStepInput("email", { name: "Ava", email: "ava@", password: "Pass123!" }, null);
  assert.equal(invalidEmail.valid, false);
  assert.match(invalidEmail.message, /valid email/i);
});

test("validateStepInput requires a profile photo on the photo step", () => {
  const result = validateStepInput("photo", { name: "Ava" }, null);
  assert.equal(result.valid, false);
  assert.match(result.message, /profile photo/i);
});

test("validateSubmission prevents sign-up without photo or terms agreement", () => {
  const withoutTerms = validateSubmission({
    formData: {
      name: "Ava Stone",
      email: "ava@example.com",
      password: "StrongPass1!",
      address: "Bengaluru",
      hasProject: "no",
      projectDetails: "",
    },
    imageFile: { name: "ava.png" },
    agreedToTerms: false,
  });
  assert.equal(withoutTerms.valid, false);
  assert.match(withoutTerms.message, /Terms of Service/i);

  const withoutPhoto = validateSubmission({
    formData: {
      name: "Ava Stone",
      email: "ava@example.com",
      password: "StrongPass1!",
      address: "Bengaluru",
      hasProject: "no",
      projectDetails: "",
    },
    imageFile: null,
    agreedToTerms: true,
  });
  assert.equal(withoutPhoto.valid, false);
  assert.match(withoutPhoto.message, /profile photo/i);
});

test("validateSubmission accepts a valid founder profile", () => {
  const result = validateSubmission({
    formData: {
      name: "Ava Stone",
      email: "ava@example.com",
      password: "StrongPass1!",
      address: "Bengaluru, Karnataka",
      hasProject: "yes",
      projectDetails: "Building a B2B AI workflow platform for small teams.",
    },
    imageFile: { name: "ava.png" },
    agreedToTerms: true,
  });

  assert.equal(result.valid, true);
  assert.equal(result.message, "");
});
