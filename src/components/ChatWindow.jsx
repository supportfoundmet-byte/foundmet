/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import { getSocket, registerPresence } from "../services/socket.js";
import { notifyBrowser } from "../services/notifications.js";

const avatarFor = (name, photo) =>
  photo ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "F")}&background=0B5CFF&color=fff&size=80`;

/** Format "Last seen X minutes/hours/days ago" */
function lastSeenText(iso) {
  if (!iso) return "Offline";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  return `Last seen ${Math.floor(hrs / 24)}d ago`;
}

export default function ChatWindow({
  isOpen,
  onClose,
  initialContact = null,
  currentUser,
  connections = {},
  availableFounders = [],
  onStartVideoCall,   // (contact, "video") → from parent VideoCallManager
  onStartAudioCall,   // (contact, "audio") → from parent VideoCallManager
}) {
  const [activeContact, setActiveContact] = useState(initialContact);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Online status — map of userId → { online: bool, lastSeen: string|null }
  const [presenceMap, setPresenceMap] = useState({});

  const [sendError, setSendError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sharedPhones, setSharedPhones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("foundmet_shared_phones") || "{}");
    } catch {
      return {};
    }
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatInputRef = useRef(null);

  // ── Room ID ────────────────────────────────────────────────────────────────
  const roomId =
    currentUser && activeContact
      ? [String(currentUser._id), String(activeContact._id)].sort().join("_")
      : null;

  // ── Contact helpers ────────────────────────────────────────────────────────
  const contactOnline = activeContact
    ? Boolean(presenceMap[String(activeContact._id)]?.online)
    : false;
  const contactLastSeen = activeContact
    ? presenceMap[String(activeContact._id)]?.lastSeen || null
    : null;

  // ── Request notification permission once ───────────────────────────────────
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // ── Sync initialContact prop → state ──────────────────────────────────────
  useEffect(() => {
    if (initialContact) {
      setActiveContact(initialContact);
      setIsMinimized(false);
    }
  }, [initialContact]);

  // ── Presence socket listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?._id) return;
    const socket = registerPresence(currentUser._id);

    // Full online list (backward compat)
    const handleOnlineUsers = (userIds) => {
      if (!Array.isArray(userIds)) return;
      setPresenceMap((prev) => {
        const next = { ...prev };
        // Clear online flags first, then set from the list
        Object.keys(next).forEach((id) => {
          next[id] = { ...next[id], online: false };
        });
        userIds.forEach((id) => {
          next[String(id)] = { ...(next[String(id)] || {}), online: true };
        });
        return next;
      });
    };

    // Targeted events from backend (only sent to connected friends)
    const handleUserOnline = ({ userId }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [String(userId)]: { ...(prev[String(userId)] || {}), online: true },
      }));
    };
    const handleUserOffline = ({ userId, lastSeen }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [String(userId)]: { online: false, lastSeen: lastSeen || null },
      }));
    };

    socket.on("online_users", handleOnlineUsers);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, [currentUser?._id]);

  // ── Load message history when contact changes ──────────────────────────────
  useEffect(() => {
    if (!currentUser?._id || !activeContact?._id || !roomId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);

    api
      .get(`/api/v1/messages/${activeContact._id}`)
      .then(({ data }) => {
        if (cancelled) return;
        const history = Array.isArray(data.messages) ? data.messages : [];
        setMessages(
          history.length
            ? history
            : [
                {
                  id: `init_${roomId}`,
                  roomId,
                  isSystem: true,
                  text: `You and ${activeContact.name} are connected. Messages stay private to this conversation.`,
                  timestamp: new Date().toISOString(),
                },
              ],
        );
        setSendError("");
      })
      .catch((err) => {
        if (!cancelled)
          setSendError(
            err.response?.data?.message || "Could not load chat history.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => { cancelled = true; };
  }, [currentUser?._id, activeContact?._id, roomId]);

  // ── Socket: join room, receive messages, read receipts, typing ─────────────
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = getSocket();

    const joinRoom = () => {
      if (roomId) socket.emit("join_room", { roomId });
    };
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    // De-duplicate & upsert incoming messages
    const upsertMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id || (msg.clientId && m.id === msg.clientId))) {
          return prev.map((m) => (m.id === msg.clientId ? msg : m));
        }
        return [...prev, msg];
      });
    };

    const handleReceiveMessage = (msg) => {
      if (!msg?.roomId) return;
      if (msg.roomId === roomId) {
        upsertMessage(msg);
        if (isMinimized) setUnreadCount((c) => c + 1);
        // Auto mark-read when chat is open and not minimized
        if (!isMinimized && socket.connected) {
          socket.emit("mark_read", { roomId });
        }
      }
      if (String(msg.senderId) !== String(currentUser._id)) {
        notifyBrowser(
          msg.senderName || "New FoundMet message",
          msg.text || "You received a new message.",
        );
      }
    };

    // Handle in-app notification for messages from other conversations
    const handleNewMessageNotification = (notif) => {
      if (notif.roomId !== roomId) {
        notifyBrowser(notif.senderName || "New message", notif.text || "");
      }
    };

    // Real-time read receipts (sender sees ✓✓)
    const handleMessagesRead = ({ roomId: rId, readBy }) => {
      if (rId !== roomId) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(currentUser._id) && !m.readAt
            ? { ...m, readAt: new Date().toISOString(), readBy }
            : m,
        ),
      );
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      if (activeContact && String(userId) === String(activeContact._id)) {
        setIsContactTyping(Boolean(isTyping));
      }
    };

    const handleMessageError = ({ message }) =>
      setSendError(message || "Message could not be sent.");

    socket.on("receive_message", handleReceiveMessage);
    socket.on("new_message_notification", handleNewMessageNotification);
    socket.on("messages_read", handleMessagesRead);
    socket.on("user_typing", handleUserTyping);
    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("new_message_notification", handleNewMessageNotification);
      socket.off("messages_read", handleMessagesRead);
      socket.off("user_typing", handleUserTyping);
      socket.off("message_error", handleMessageError);
    };
  }, [currentUser, roomId, activeContact, isMinimized]);

  // ── Emit mark_read when chat opens / unminimizes ───────────────────────────
  useEffect(() => {
    if (!isMinimized && roomId && currentUser?._id) {
      const socket = getSocket();
      if (socket.connected) socket.emit("mark_read", { roomId });
      setUnreadCount(0);
    }
  }, [isMinimized, roomId, currentUser?._id]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isContactTyping, isMinimized]);

  // ── Typing emission ────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!roomId || !currentUser) return;
    const socket = getSocket();
    socket.emit("typing", {
      roomId,
      userId: currentUser._id,
      userName: currentUser.name,
      isTyping: true,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        roomId,
        userId: currentUser._id,
        userName: currentUser.name,
        isTyping: false,
      });
    }, 1500);
  };

  // ── HTTP fallback for offline delivery ─────────────────────────────────────
  const deliverViaHttp = async (pending) => {
    const { data } = await api.post("/api/v1/messages", {
      receiverId: pending.receiverId,
      text: pending.text,
      clientId: pending.clientId,
    });
    if (data?.message) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pending.clientId ? { ...data.message, pending: false } : m,
        ),
      );
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    (textToSend = null) => {
      const text = (typeof textToSend === "string" ? textToSend : inputText).trim();
      if (!text || !roomId || !currentUser || !activeContact) return;

      const socket = getSocket();
      const clientId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const pending = {
        id: clientId,
        clientId,
        roomId,
        senderId: currentUser._id,
        senderName: currentUser.name,
        senderPhoto: currentUser.photo,
        receiverId: activeContact._id,
        text,
        timestamp: new Date().toISOString(),
        pending: true,
      };

      setSendError("");
      setMessages((prev) => [...prev, pending]);
      setInputText("");

      const fail = (msg) => {
        setSendError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== clientId));
      };

      const sendHttp = () =>
        deliverViaHttp(pending).catch((err) =>
          fail(err.response?.data?.message || err.userMessage || "Message could not be sent."),
        );

      if (!socket.connected) {
        registerPresence(currentUser._id);
        sendHttp();
        return;
      }

      // Stop typing indicator on send
      socket.emit("typing", {
        roomId,
        userId: currentUser._id,
        userName: currentUser.name,
        isTyping: false,
      });

      socket.timeout(8000).emit("send_message", pending, (err, response) => {
        if (err || !response?.ok) sendHttp();
        else if (response.payload) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === clientId ? { ...response.payload, pending: false } : m,
            ),
          );
        }
      });
    },
    [inputText, roomId, currentUser, activeContact],
  );

  // ── Phone sharing helpers ──────────────────────────────────────────────────
  const handleRequestPhone = () => {
    if (!activeContact) return;
    handleSendMessage("I would like to request your mobile number so we can have a quick call.");
    const updated = { ...sharedPhones, [`req_${activeContact._id}`]: true };
    setSharedPhones(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
  };

  const handleSharePhone = () => {
    if (!activeContact) return;
    if (!currentUser.phoneNumber) {
      setSendError("Add your phone number in Settings before sharing it.");
      return;
    }
    handleSendMessage(`Here is my mobile number: ${currentUser.phoneNumber}. Looking forward to connecting.`);
    const updated = { ...sharedPhones, [`shared_${activeContact._id}`]: true };
    setSharedPhones(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  if (!isOpen) return null;

  const connectedFounders = availableFounders.filter(
    (f) => f._id !== currentUser?._id && connections[f._id] === "connected",
  );
  const contactPhone = activeContact?.phoneNumber || "";
  const isPhoneSharedWithMe =
    Boolean(sharedPhones[activeContact?._id]) && Boolean(contactPhone);
  const phoneRequested = Boolean(sharedPhones[`req_${activeContact?._id}`]);

  // Render a read-receipt tick for my messages
  const ReadTick = ({ msg }) => {
    if (String(msg.senderId) !== String(currentUser?._id)) return null;
    if (msg.pending) return <i className="bi bi-clock text-muted" style={{ fontSize: 9 }} />;
    if (msg.readAt)  return <i className="bi bi-check2-all text-primary" style={{ fontSize: 9 }} />;
    return <i className="bi bi-check2 text-muted" style={{ fontSize: 9 }} />;
  };

  return (
    <div className="foundmet-chat-dock position-fixed">
      {isMinimized ? (
        <button
          type="button"
          onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
          className="btn btn-foundmet rounded-pill shadow-lg d-flex align-items-center gap-2 py-2 px-3"
        >
          <i className="bi bi-chat-dots-fill fs-5" />
          <span className="fw-semibold">
            {activeContact ? activeContact.name : "Messages"}
          </span>
          {unreadCount > 0 && (
            <span className="badge bg-danger rounded-pill">{unreadCount}</span>
          )}
        </button>
      ) : (
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column foundmet-chat-card">
          {/* ── Header ── */}
          <div className="p-3 text-white d-flex align-items-center justify-content-between foundmet-chat-header">
            {activeContact ? (
              <div className="d-flex align-items-center gap-2 overflow-hidden flex-grow-1">
                <button
                  type="button"
                  className="btn btn-link text-white p-0 me-1"
                  onClick={() => setActiveContact(null)}
                  title="All chats"
                >
                  <i className="bi bi-chevron-left fs-5" />
                </button>
                <div className="position-relative flex-shrink-0">
                  <img
                    src={avatarFor(activeContact.name, activeContact.photo)}
                    alt=""
                    className="rounded-circle border border-white"
                    style={{ width: 36, height: 36, objectFit: "cover" }}
                  />
                  <span
                    className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${contactOnline ? "bg-success" : "bg-secondary"}`}
                    style={{ width: 10, height: 10 }}
                  />
                </div>
                <div className="text-truncate flex-grow-1">
                  <h6 className="mb-0 fw-bold text-truncate" style={{ fontSize: 14 }}>
                    {activeContact.name}
                  </h6>
                  <small className="opacity-90 d-block text-truncate" style={{ fontSize: 11 }}>
                    {isContactTyping
                      ? "typing…"
                      : contactOnline
                        ? "🟢 Online"
                        : lastSeenText(contactLastSeen)}
                  </small>
                </div>

                {/* Call buttons — only shown when a contact is open */}
                {onStartAudioCall && (
                  <button
                    type="button"
                    className="btn btn-link text-white p-1 flex-shrink-0"
                    onClick={() => onStartAudioCall(activeContact)}
                    title="Voice call"
                  >
                    <i className="bi bi-telephone-fill fs-6" />
                  </button>
                )}
                {onStartVideoCall && (
                  <button
                    type="button"
                    className="btn btn-link text-white p-1 flex-shrink-0"
                    onClick={() => onStartVideoCall(activeContact)}
                    title="Video call"
                  >
                    <i className="bi bi-camera-video-fill fs-6" />
                  </button>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-chat-quote-fill fs-5" />
                <h6 className="mb-0 fw-bold">Messages</h6>
              </div>
            )}

            <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-1">
              <button
                type="button"
                className="btn btn-link text-white p-1"
                onClick={() => setIsMinimized(true)}
                title="Minimize"
              >
                <i className="bi bi-dash-lg" />
              </button>
              <button
                type="button"
                className="btn btn-link text-white p-1"
                onClick={onClose}
                title="Close"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          </div>

          {/* ── Phone sharing strip ── */}
          {activeContact && (
            <div className="p-2 bg-light border-bottom d-flex align-items-center">
              {isPhoneSharedWithMe ? (
                <div className="d-flex align-items-center justify-content-between w-100">
                  <strong className="small text-dark">{contactPhone}</strong>
                  <div className="d-flex gap-1">
                    <a
                      href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-success rounded-pill px-2 py-0"
                    >
                      WA
                    </a>
                    <a
                      href={`tel:${contactPhone}`}
                      className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0"
                    >
                      Call
                    </a>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-between w-100 gap-1">
                  <button
                    type="button"
                    onClick={handleRequestPhone}
                    className="btn btn-sm btn-outline-primary rounded-pill py-0 px-2 flex-grow-1"
                    disabled={phoneRequested}
                  >
                    {phoneRequested ? "Requested" : "Request phone"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSharePhone}
                    className="btn btn-sm btn-outline-success rounded-pill py-0 px-2 flex-grow-1"
                  >
                    Share my number
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Message thread or contact list ── */}
          {activeContact ? (
            <div className="d-flex flex-column flex-grow-1 bg-light overflow-hidden">
              <div className="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-2 foundmet-chat-feed">
                {loadingHistory && (
                  <small className="text-secondary">Loading conversation…</small>
                )}

                {messages.map((msg) => {
                  if (msg.isSystem) {
                    return (
                      <div key={msg.id} className="text-center my-1">
                        <span className="badge bg-white text-secondary border px-2 py-1 small">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  const isMe = String(msg.senderId) === String(currentUser?._id);
                  return (
                    <div
                      key={msg.id}
                      className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}
                    >
                      <div
                        className={`p-2 px-3 rounded-4 small ${isMe ? "bg-primary text-white" : "bg-white text-dark border"}`}
                        style={{
                          maxWidth: "82%",
                          wordBreak: "break-word",
                          opacity: msg.pending ? 0.7 : 1,
                        }}
                      >
                        {msg.text}
                      </div>
                      <small
                        className="text-muted mt-1 px-1 d-flex align-items-center gap-1"
                        style={{ fontSize: 10 }}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                        <ReadTick msg={msg} />
                      </small>
                    </div>
                  );
                })}

                {isContactTyping && (
                  <div className="d-flex align-items-center gap-1 text-secondary small bg-white p-2 rounded-3 border align-self-start">
                    <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: 6, height: 6 }} />
                    <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: 6, height: 6 }} />
                    <span className="spinner-grow spinner-grow-sm" role="status" style={{ width: 6, height: 6 }} />
                    <span className="ms-1">{activeContact.name} is typing</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-2 bg-white border-top d-flex flex-column gap-1"
              >
                {sendError && (
                  <small className="text-danger px-2">{sendError}</small>
                )}
                <div className="d-flex align-items-center gap-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Type a message…"
                    value={inputText}
                    onChange={handleInputChange}
                    maxLength={2000}
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                    style={{ width: 36, height: 36 }}
                  >
                    <i className="bi bi-send-fill" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── Contact list ── */
            <div className="flex-grow-1 p-2 bg-white overflow-y-auto">
              <div className="small text-secondary fw-bold px-2 py-1 text-uppercase">
                Accepted connections ({connectedFounders.length})
              </div>
              {connectedFounders.length ? (
                connectedFounders.map((founder) => {
                  const online = Boolean(presenceMap[String(founder._id)]?.online);
                  const ls = presenceMap[String(founder._id)]?.lastSeen || null;
                  return (
                    <button
                      type="button"
                      key={founder._id}
                      onClick={() => setActiveContact(founder)}
                      className="p-2 rounded-3 d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start message-contact"
                    >
                      <div className="position-relative flex-shrink-0">
                        <img
                          src={avatarFor(founder.name, founder.photo)}
                          alt=""
                          className="rounded-circle border"
                          style={{ width: 40, height: 40, objectFit: "cover" }}
                        />
                        <span
                          className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${online ? "bg-success" : "bg-secondary"}`}
                          style={{ width: 10, height: 10 }}
                        />
                      </div>
                      <span className="flex-grow-1 overflow-hidden">
                        <strong className="d-block text-truncate">{founder.name}</strong>
                        <small className="text-secondary text-truncate d-block">
                          {online ? "🟢 Online" : lastSeenText(ls)}
                        </small>
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-5 text-secondary">
                  <p className="small fw-bold mb-1">No conversations yet</p>
                  <small>Chat unlocks after a founder accepts your connection request.</small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
