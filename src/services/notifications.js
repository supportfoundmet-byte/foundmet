import api from "./api.js";

// ── Audio for in-app sounds ─────────────────────────────────────────────
let audioContext;
const getAudioContext = () => {
  if (!audioContext && typeof window !== "undefined") {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      /* ignore */
    }
  }
  return audioContext;
};

export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    /* browser autoplay block — silently ignore */
  }
};

/** Show a simple browser Notification (requires permission granted). */
export const notifyBrowser = (title, body, options = {}) => {
  playNotificationSound();
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  )
    return;

  try {
    new Notification(title, {
      body,
      icon: options.icon || "/favicon.svg",
      tag: options.tag,
      silent: true, // We already played our own sound
    });
  } catch {
    /* private/incognito mode may block this */
  }
};

// ── Web Push (VAPID) ────────────────────────────────────────────────────

/** Convert a URL-safe base64 string to a Uint8Array (required by Push API). */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

let _pushRegistered = false;

/**
 * Request Notification permission, then register a Web Push subscription
 * and POST it to the backend.  Safe to call multiple times — deduped.
 */
export async function registerPushSubscription() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    _pushRegistered
  )
    return;

  try {
    // 1 — Ask for permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // 2 — Fetch the server's VAPID public key
    const { data } = await api.get("/api/v1/push/vapid-key");
    if (!data?.vapidPublicKey) return;

    // 3 — Get the active service worker registration
    const reg = await navigator.serviceWorker.ready;

    // 4 — Create (or retrieve) the push subscription
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.vapidPublicKey),
    });

    // 5 — Send the subscription to our backend
    await api.post("/api/v1/push/subscribe", subscription.toJSON());
    _pushRegistered = true;
    console.log("[Push] Browser push subscription registered.");
  } catch (err) {
    console.warn("[Push] Could not register push subscription:", err.message);
  }
}

/** Remove the push subscription (call on logout). */
export async function unregisterPushSubscription() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await api.delete("/api/v1/push/subscribe", {
        data: { endpoint: sub.endpoint },
      });
      await sub.unsubscribe();
    }
    _pushRegistered = false;
  } catch {
    /* ignore */
  }
}
