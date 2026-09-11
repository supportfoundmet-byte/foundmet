// City coordinates registry for distance calculations (in KM)
const CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
  kolkata: { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  delhi: { lat: 28.6139, lng: 77.209, name: "Delhi NCR" },
  "delhi ncr": { lat: 28.6139, lng: 77.209, name: "Delhi NCR" },
  noida: { lat: 28.5355, lng: 77.391, name: "Noida" },
  gurgaon: { lat: 28.4595, lng: 77.0266, name: "Gurgaon" },
  mumbai: { lat: 19.076, lng: 72.8777, name: "Mumbai" },
  pune: { lat: 18.5204, lng: 73.8567, name: "Pune" },
  hyderabad: { lat: 17.385, lng: 78.4867, name: "Hyderabad" },
  chennai: { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  jaipur: { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  chandigarh: { lat: 30.7333, lng: 76.7794, name: "Chandigarh" },
  "san francisco": { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
  london: { lat: 51.5074, lng: -0.1278, name: "London" },
  newyork: { lat: 40.7128, lng: -74.006, name: "New York" },
};

/**
 * Calculate distance in kilometers using the Haversine formula
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Extract or estimate coordinates from an address string or founder object
 */
export function getCoordinatesFromAddress(addressStr) {
  if (!addressStr || typeof addressStr !== "string") {
    // Default to Bangalore hub if unknown
    return CITY_COORDINATES.bangalore;
  }

  const clean = addressStr.toLowerCase();

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key)) {
      return coords;
    }
  }

  // Fallback
  return CITY_COORDINATES.bangalore;
}

/**
 * Get distance from active user to another founder
 */
export function getDistanceToFounder(userCoords, founder) {
  if (!userCoords) return null;

  const founderCoords =
    founder.coordinates || getCoordinatesFromAddress(founder.address);

  if (!founderCoords || !founderCoords.lat || !founderCoords.lng) {
    return null;
  }

  // If live GPS is active, calculate precise Haversine distance
  if (userCoords.isLiveGPS) {
    const rawDist = getDistanceKm(
      userCoords.lat,
      userCoords.lng,
      founderCoords.lat,
      founderCoords.lng
    );
    return rawDist !== null ? Math.max(rawDist, 1) : null;
  }

  // If both are in the same city estimated by address, add a realistic metro jitter (8 to 28 km)
  if (
    userCoords.name &&
    founderCoords.name &&
    userCoords.name === founderCoords.name
  ) {
    const seed = (founder._id || "seed").charCodeAt(0) % 20;
    return 8 + seed;
  }

  return getDistanceKm(
    userCoords.lat,
    userCoords.lng,
    founderCoords.lat,
    founderCoords.lng
  );
}

/**
 * Acquire user's live GPS coordinates via browser Geolocation API
 */
export function getLiveGPSCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          name: "Live GPS Position",
          isLiveGPS: true,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Calculate co-founder compatibility match score (percentage 70% - 98%)
 */
export function calculateMatchScore(currentUser, founder, userCoords) {
  if (!founder) return 70;

  let score = 70; // Baseline compatibility

  const userRole = (currentUser?.role || "founder").toLowerCase();
  const founderRole = (founder.role || "co-founder").toLowerCase();

  // 1. Role Complementarity (+12%)
  if (userRole !== founderRole) {
    score += 12;
  }

  // 2. Looking-For Skill Match (+10%)
  const founderNeeds = Array.isArray(founder.lookingFor)
    ? founder.lookingFor.map((r) => r.toLowerCase())
    : typeof founder.lookingFor === "string"
    ? [founder.lookingFor.toLowerCase()]
    : [];

  if (founderNeeds.includes("cto") || founderNeeds.includes("ceo") || founderNeeds.includes(userRole)) {
    score += 10;
  }

  // 3. Proximity bonus (+8% for <= 50km, +4% for <= 80km)
  if (userCoords) {
    const dist = getDistanceToFounder(userCoords, founder);
    if (dist !== null) {
      if (dist <= 50) score += 8;
      else if (dist <= 80) score += 4;
    }
  }

  // 4. Project status synergy (+5%)
  if (founder.hasProject === "yes" && founder.projectDetails) {
    score += 5;
  }

  return Math.min(Math.max(score, 72), 98);
}

export { CITY_COORDINATES };


