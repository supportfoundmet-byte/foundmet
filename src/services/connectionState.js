export function normalizeConnectionStatus(value) {
  if (!value) return "none";
  if (typeof value === "object") return normalizeConnectionStatus(value.status || value.state);
  const key = String(value).toLowerCase();
  if (key === "connected" || key === "accepted") return "connected";
  if (key === "pending_sent" || key === "pending-sent") return "pending_sent";
  if (key === "pending_received" || key === "pending-received") return "pending_received";
  if (key === "pending") return "pending_sent";
  if (key === "rejected") return "rejected";
  if (key === "blocked") return "blocked";
  return "none";
}

export function connectionLabel(status) {
  const normalized = normalizeConnectionStatus(status);
  if (normalized === "connected") return "Connected";
  if (normalized === "pending_sent") return "Request Sent";
  if (normalized === "pending_received") return "Respond";
  if (normalized === "blocked") return "Blocked";
  return "Connect";
}

export function statusesFromPayload(data, currentUserId) {
  if (data?.states) {
    return Object.fromEntries(
      Object.entries(data.states).map(([id, value]) => [id, normalizeConnectionStatus(value)]),
    );
  }
  const statuses = {};
  const assign = (list, fallback) => {
    (list || []).forEach((connection) => {
      const other =
        String(connection.fromUser?._id) === String(currentUserId)
          ? connection.toUser
          : connection.fromUser;
      if (other?._id) statuses[other._id] = fallback;
    });
  };
  assign(data?.sentRequests, "pending_sent");
  assign(data?.receivedRequests, "pending_received");
  assign(data?.connected, "connected");
  assign(data?.blocked, "blocked");
  return statuses;
}

export function friendlyError(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || error.userMessage || fallback;
}
