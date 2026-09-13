/* FoundMet Push Service Worker — handles background Web Push notifications */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "FoundMet", body: event.data.text() };
  }

  const title = payload.title || "FoundMet";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/favicon.svg",
    badge: "/favicon.svg",
    tag: payload.tag || "foundmet-notification",
    data: { url: payload.url || "/dashboard" },
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If a FoundMet tab is already open, focus it and navigate
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
