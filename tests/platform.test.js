import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getDistanceKm,
  getCoordinatesFromAddress,
  getDistanceToFounder,
  CITY_COORDINATES,
} from "../src/services/location.js";

describe("1. Haversine Distance & Proximity Engine", () => {
  it("should accurately calculate distance between Delhi and Noida (under 50 km)", () => {
    const delhi = CITY_COORDINATES.delhi;
    const noida = CITY_COORDINATES.noida;
    const dist = getDistanceKm(delhi.lat, delhi.lng, noida.lat, noida.lng);

    assert.ok(typeof dist === "number");
    assert.ok(dist > 0 && dist < 50, `Expected distance < 50km, got ${dist}km`);
  });

  it("should accurately calculate distance between Delhi and Gurgaon (under 50 km)", () => {
    const delhi = CITY_COORDINATES.delhi;
    const gurgaon = CITY_COORDINATES.gurgaon;
    const dist = getDistanceKm(delhi.lat, delhi.lng, gurgaon.lat, gurgaon.lng);

    assert.ok(dist > 0 && dist <= 40, `Expected distance <= 40km, got ${dist}km`);
  });

  it("should accurately identify Bangalore to Kolkata as > 1000 km", () => {
    const blr = CITY_COORDINATES.bangalore;
    const kol = CITY_COORDINATES.kolkata;
    const dist = getDistanceKm(blr.lat, blr.lng, kol.lat, kol.lng);

    assert.ok(dist > 1000, `Expected distance > 1000km, got ${dist}km`);
  });

  it("should parse city coordinates from various address formats", () => {
    const coord1 = getCoordinatesFromAddress("Indiranagar, Bangalore, Karnataka");
    assert.equal(coord1.name, "Bangalore");

    const coord2 = getCoordinatesFromAddress("Salt Lake Sector V, Kolkata");
    assert.equal(coord2.name, "Kolkata");

    const coord3 = getCoordinatesFromAddress("Connaught Place, Delhi NCR");
    assert.equal(coord3.name, "Delhi NCR");

    const coordFallback = getCoordinatesFromAddress("Unknown Island");
    assert.equal(coordFallback.name, "Bangalore");
  });

  it("should calculate intra-city distance for founders in the same city (50km radius)", () => {
    const userCoords = CITY_COORDINATES.bangalore;
    const founder = {
      _id: "founder_blr_01",
      address: "Koramangala, Bangalore",
    };

    const dist = getDistanceToFounder(userCoords, founder);
    assert.ok(dist >= 8 && dist <= 30, `Expected same-city dist between 8-30km, got ${dist}km`);
    assert.ok(dist <= 50, "Same city founder must be within 50km filter");
  });

  it("should calculate exact distance when live GPS is active", () => {
    const liveGPSCoords = {
      lat: 28.5355,
      lng: 77.391, // Noida live GPS coordinates
      isLiveGPS: true,
      accuracy: 12,
    };
    const founder = {
      _id: "founder_delhi_01",
      address: "Connaught Place, Delhi NCR",
    };

    const dist = getDistanceToFounder(liveGPSCoords, founder);
    assert.ok(dist > 0 && dist < 40, `Expected GPS live dist < 40km, got ${dist}km`);
  });
});

describe("2. Proximity Radius Filtering (50 km & 80 km)", () => {
  const userCoords = CITY_COORDINATES.delhi;
  const sampleFounders = [
    { _id: "f1", name: "Founder Noida", address: "Sector 62, Noida" }, // ~20-30km
    { _id: "f2", name: "Founder Gurgaon", address: "Cyber City, Gurgaon" }, // ~30km
    { _id: "f3", name: "Founder Jaipur", address: "Malviya Nagar, Jaipur" }, // ~230km
    { _id: "f4", name: "Founder Mumbai", address: "Bandra, Mumbai" }, // ~1100km
  ];

  it("should filter founders within 50 km", () => {
    const within50 = sampleFounders.filter((f) => {
      const dist = getDistanceToFounder(userCoords, f);
      return dist !== null && dist <= 50;
    });

    const names = within50.map((f) => f.name);
    assert.ok(names.includes("Founder Noida"));
    assert.ok(names.includes("Founder Gurgaon"));
    assert.ok(!names.includes("Founder Jaipur"));
    assert.ok(!names.includes("Founder Mumbai"));
  });

  it("should filter founders within 80 km", () => {
    const within80 = sampleFounders.filter((f) => {
      const dist = getDistanceToFounder(userCoords, f);
      return dist !== null && dist <= 80;
    });

    assert.equal(within80.length, 2);
  });
});

describe("3. Connection State Machine & Chat Gating", () => {
  function canOpenChat(currentUser, founderId, connections) {
    if (!currentUser) return false;
    const status = connections[founderId];
    return status === "connected";
  }

  function getConnectionButtonState(currentUser, founderId, connections) {
    if (!currentUser) return { action: "login_required", label: "Connect" };
    const status = connections[founderId];
    if (status === "connected") return { action: "connected", label: "Connected" };
    if (status === "pending") return { action: "pending", label: "Pending" };
    return { action: "connect", label: "Connect" };
  }

  it("should block chat access for unauthenticated visitors", () => {
    const canChat = canOpenChat(null, "founder123", {});
    assert.equal(canChat, false, "Unauthenticated visitors must not open chat");
  });

  it("should block chat access when connection status is not 'connected'", () => {
    const currentUser = { _id: "user1", name: "Alice" };

    assert.equal(canOpenChat(currentUser, "founder123", {}), false);
    assert.equal(canOpenChat(currentUser, "founder123", { founder123: "pending" }), false);
    assert.equal(canOpenChat(currentUser, "founder123", { founder123: "rejected" }), false);
  });

  it("should allow chat access ONLY when status is 'connected'", () => {
    const currentUser = { _id: "user1", name: "Alice" };
    const connections = { founder123: "connected" };

    assert.equal(canOpenChat(currentUser, "founder123", connections), true);
  });

  it("should reflect correct connection button state lifecycle", () => {
    const currentUser = { _id: "user1" };

    // 1. Initial State
    let btn = getConnectionButtonState(currentUser, "f1", {});
    assert.equal(btn.action, "connect");

    // 2. Request Sent
    btn = getConnectionButtonState(currentUser, "f1", { f1: "pending" });
    assert.equal(btn.action, "pending");
    assert.equal(btn.label, "Pending");

    // 3. Accepted
    btn = getConnectionButtonState(currentUser, "f1", { f1: "connected" });
    assert.equal(btn.action, "connected");
    assert.equal(btn.label, "Connected");
  });
});

describe("4. Mobile Number Privacy & 1-Click Action URLs", () => {
  function formatWhatsAppLink(phone, founderName) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi ${founderName}, connected with you on FoundeMet!`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  }

  function formatPhoneCallLink(phone) {
    if (!phone) return null;
    return `tel:${phone.trim()}`;
  }

  it("should format valid WhatsApp deep link with encoded message", () => {
    const link = formatWhatsAppLink("+91 98765 43210", "Aarav");
    assert.equal(
      link,
      "https://wa.me/919876543210?text=Hi%20Aarav%2C%20connected%20with%20you%20on%20FoundeMet!"
    );
  });

  it("should format valid tel: link for phone dialing", () => {
    const tel = formatPhoneCallLink("+91 9876543210");
    assert.equal(tel, "tel:+91 9876543210");
  });

  it("should conceal mobile number until explicit mutual connection", () => {
    const founder = {
      _id: "f99",
      name: "Rohit",
      phone: "+91 9876543210",
      phonePrivacy: "connections_only",
    };

    function getVisiblePhone(user, founder, isConnected) {
      if (!user || !isConnected) return null;
      return founder.phone;
    }

    assert.equal(getVisiblePhone(null, founder, false), null);
    assert.equal(getVisiblePhone({ _id: "u1" }, founder, false), null);
    assert.equal(getVisiblePhone({ _id: "u1" }, founder, true), "+91 9876543210");
  });
});

describe("5. Registration & Terms and Conditions Enforcement", () => {
  function validateRegistrationPayload(form) {
    const errors = [];
    if (!form.name || form.name.trim().length < 2) {
      errors.push("Full name is required");
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.push("Valid email address is required");
    }
    if (!form.password || form.password.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    if (!form.termsAccepted) {
      errors.push("You must agree to the Terms of Service and Privacy Policy");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  it("should reject registration if terms are not accepted", () => {
    const payload = {
      name: "Dev Founder",
      email: "dev@founder.io",
      password: "securepassword123",
      termsAccepted: false,
    };

    const result = validateRegistrationPayload(payload);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.includes("You must agree to the Terms of Service and Privacy Policy"));
  });

  it("should accept valid registration with terms accepted", () => {
    const payload = {
      name: "Dev Founder",
      email: "dev@founder.io",
      password: "securepassword123",
      termsAccepted: true,
    };

    const result = validateRegistrationPayload(payload);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it("should reject invalid email formats", () => {
    const payload = {
      name: "Dev Founder",
      email: "invalid-email-string",
      password: "securepassword123",
      termsAccepted: true,
    };

    const result = validateRegistrationPayload(payload);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.includes("Valid email address is required"));
  });
});

describe("6. Founder Rating & Endorsement Rules", () => {
  function validateRatingSubmission(raterId, targetId, rating) {
    if (!raterId) return { error: "Authentication required" };
    if (raterId === targetId) return { error: "Cannot rate your own profile" };
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5 stars" };
    }
    return { success: true };
  }

  it("should reject unauthenticated rating submissions", () => {
    const res = validateRatingSubmission(null, "founder2", 5);
    assert.equal(res.error, "Authentication required");
  });

  it("should prevent self-rating", () => {
    const res = validateRatingSubmission("founder1", "founder1", 5);
    assert.equal(res.error, "Cannot rate your own profile");
  });

  it("should enforce 1-5 star bounds", () => {
    assert.equal(validateRatingSubmission("u1", "u2", 0).error, "Rating must be between 1 and 5 stars");
    assert.equal(validateRatingSubmission("u1", "u2", 6).error, "Rating must be between 1 and 5 stars");
    assert.equal(validateRatingSubmission("u1", "u2", 4).success, true);
  });
});
