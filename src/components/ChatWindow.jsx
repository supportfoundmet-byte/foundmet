/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import { getSocket, registerPresence } from "../services/socket.js";
import { notifyBrowser } from "../services/notifications.js";

const avatarFor = (name, photo) =>
  photo ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "F")}&background=0B5CFF&color=fff&size=80`;

export default function ChatWindow({
  isOpen,
  onClose,
  initialContact = null,
  currentUser,
  connections = {},
  availableFounders = [],
}) {
  const [activeContact, setActiveContact] = useState(initialContact);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sendError, setSendError] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sharedPhones, setSharedPhones] = useState(() => {
    try {
      const stored = localStorage.getItem("foundmet_shared_phones");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (initialContact) {
      setActiveContact(initialContact);
      setIsMinimized(false);
    }
  }, [initialContact]);

  const roomId =
    currentUser && activeContact
      ? [String(currentUser._id), String(activeContact._id)].sort().join("_")
      : null;

  useEffect(() => {
    if (!currentUser?._id) return undefined;
    const socket = registerPresence(currentUser._id);
    const handleOnlineUsers = (userIds) => {
      if (Array.isArray(userIds)) setOnlineUsers(userIds.map(String));
    };
    socket.on("online_users", handleOnlineUsers);
    return () => socket.off("online_users", handleOnlineUsers);
  }, [currentUser?._id]);

  useEffect(() => {
    if (!currentUser?._id || !activeContact?._id || !roomId) {
      setMessages([]);
      return undefined;
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
      .catch((error) => {
        if (!cancelled)
          setSendError(
            error.response?.data?.message || "Could not load chat history.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?._id, activeContact?._id, activeContact?.name, roomId]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;
    const socket = getSocket();
    const joinRoom = () => {
      if (roomId) socket.emit("join_room", { roomId });
    };
    if (socket.connected) joinRoom();
    socket.on("connect", joinRoom);

    const upsertMessage = (incomingMsg) => {
      setMessages((prev) => {
        if (
          prev.some(
            (item) =>
              item.id === incomingMsg.id ||
              (incomingMsg.clientId && item.id === incomingMsg.clientId),
          )
        ) {
          return prev.map((item) =>
            item.id === incomingMsg.clientId ? incomingMsg : item,
          );
        }
        return [...prev, incomingMsg];
      });
    };

    const handleReceiveMessage = (incomingMsg) => {
      if (!incomingMsg?.roomId) return;
      const isCurrentThread = incomingMsg.roomId === roomId;
      if (isCurrentThread) {
        upsertMessage(incomingMsg);
        if (isMinimized) setUnreadCount((count) => count + 1);
      }
      if (String(incomingMsg.senderId) !== String(currentUser._id)) {
        notifyBrowser(
          incomingMsg.senderName || "New FoundMet message",
          incomingMsg.text || "You received a new message.",
        );
      }
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      if (activeContact && String(userId) === String(activeContact._id))
        setIsContactTyping(Boolean(isTyping));
    };

    const handleMessageError = ({ message }) =>
      setSendError(message || "Message could not be sent.");

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("message_error", handleMessageError);
    };
  }, [currentUser, roomId, activeContact, isMinimized]);

  useEffect(() => {
    if (!isMinimized)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isContactTyping, isMinimized]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
    if (!roomId || !currentUser) return;
    const socket = getSocket();
    socket.emit("typing", {
      roomId,
      userId: currentUser._id,
      userName: currentUser.name,
      isTyping: true,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        roomId,
        userId: currentUser._id,
        userName: currentUser.name,
        isTyping: false,
      });
    }, 1500);
  };

  const deliverViaHttp = async (pending) => {
    const { data } = await api.post("/api/v1/messages", {
      receiverId: pending.receiverId,
      text: pending.text,
      clientId: pending.clientId,
    });
    if (data?.message) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === pending.clientId
            ? { ...data.message, pending: false }
            : item,
        ),
      );
    }
  };

  const handleSendMessage = (textToSend = null) => {
    const text = (
      typeof textToSend === "string" ? textToSend : inputText
    ).trim();
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

    const fail = (message) => {
      setSendError(message);
      setMessages((prev) => prev.filter((item) => item.id !== clientId));
    };

    const sendHttp = () => {
      deliverViaHttp(pending).catch((error) => {
        fail(
          error.response?.data?.message ||
            error.userMessage ||
            "Message could not be sent.",
        );
      });
    };

    if (!socket.connected) {
      registerPresence(currentUser._id);
      sendHttp();
      return;
    }

    socket.emit("typing", {
      roomId,
      userId: currentUser._id,
      userName: currentUser.name,
      isTyping: false,
    });
    socket.timeout(8000).emit("send_message", pending, (error, response) => {
      if (error || !response?.ok) sendHttp();
      else if (response.payload) {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === clientId
              ? { ...response.payload, pending: false }
              : item,
          ),
        );
      }
    });
  };

  const handleRequestPhoneNumber = () => {
    if (!activeContact) return;
    handleSendMessage(
      "I would like to request your mobile number so we can have a quick call.",
    );
    const updated = { ...sharedPhones, [`req_${activeContact._id}`]: true };
    setSharedPhones(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
  };

  const handleShareMyPhoneNumber = () => {
    if (!activeContact) return;
    if (!currentUser.phoneNumber) {
      setSendError("Add your phone number in Settings before sharing it.");
      return;
    }
    handleSendMessage(
      `Here is my mobile number: ${currentUser.phoneNumber}. Looking forward to connecting.`,
    );
    const updated = { ...sharedPhones, [`shared_${activeContact._id}`]: true };
    setSharedPhones(updated);
    localStorage.setItem("foundmet_shared_phones", JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const connectedFounders = availableFounders.filter(
    (founder) =>
      founder._id !== currentUser?._id &&
      connections[founder._id] === "connected",
  );
  const contactPhone = activeContact?.phoneNumber || "";
  const isPhoneSharedWithMe =
    Boolean(sharedPhones[activeContact?._id]) && Boolean(contactPhone);
  const phoneRequested = Boolean(sharedPhones[`req_${activeContact?._id}`]);

  return (
    <div className="foundmet-chat-dock position-fixed">
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setUnreadCount(0);
          }}
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
          <div className="p-3 text-white d-flex align-items-center justify-content-between foundmet-chat-header">
            {activeContact ? (
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <button
                  type="button"
                  className="btn btn-link text-white p-0 me-1"
                  onClick={() => setActiveContact(null)}
                  title="All chats"
                >
                  <i className="bi bi-chevron-left fs-5" />
                </button>
                <div className="position-relative">
                  <img
                    src={avatarFor(activeContact.name, activeContact.photo)}
                    alt=""
                    className="rounded-circle border border-white"
                    style={{ width: 36, height: 36, objectFit: "cover" }}
                  />
                  <span
                    className={`position-absolute bottom-0 end-0 rounded-circle border border-white ${onlineUsers.includes(String(activeContact._id)) ? "bg-success" : "bg-secondary"}`}
                    style={{ width: 10, height: 10 }}
                  />
                </div>
                <div className="text-truncate">
                  <h6
                    className="mb-0 fw-bold text-truncate"
                    style={{ fontSize: 14 }}
                  >
                    {activeContact.name}
                  </h6>
                  <small
                    className="opacity-90 d-block text-truncate"
                    style={{ fontSize: 11 }}
                  >
                    {isContactTyping
                      ? "typing..."
                      : onlineUsers.includes(String(activeContact._id))
                        ? "Online"
                        : "Offline"}
                  </small>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-chat-quote-fill fs-5" />
                <h6 className="mb-0 fw-bold">Messages</h6>
              </div>
            )}
            <div className="d-flex align-items-center gap-1">
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

          {activeContact && (
            <div className="p-2 bg-light border-bottom d-flex align-items-center justify-content-between">
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
                    onClick={handleRequestPhoneNumber}
                    className="btn btn-sm btn-outline-primary rounded-pill py-0 px-2 flex-grow-1"
                    disabled={phoneRequested}
                  >
                    {phoneRequested ? "Requested" : "Request phone"}
                  </button>
                  <button
                    type="button"
                    onClick={handleShareMyPhoneNumber}
                    className="btn btn-sm btn-outline-success rounded-pill py-0 px-2 flex-grow-1"
                  >
                    Share my number
                  </button>
                </div>
              )}
            </div>
          )}

          {activeContact ? (
            <div className="d-flex flex-column flex-grow-1 bg-light overflow-hidden">
              <div className="flex-grow-1 p-3 overflow-y-auto d-flex flex-column gap-2 foundmet-chat-feed">
                {loadingHistory && (
                  <small className="text-secondary">
                    Loading conversation...
                  </small>
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
                  const isMe =
                    String(msg.senderId) === String(currentUser?._id);
                  return (
                    <div
                      key={msg.id}
                      className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}
                    >
                      <div
                        className={`p-2 px-3 rounded-4 small ${isMe ? "bg-primary text-white" : "bg-white text-main border"}`}
                        style={{
                          maxWidth: "82%",
                          wordBreak: "break-word",
                          opacity: msg.pending ? 0.7 : 1,
                        }}
                      >
                        {msg.text}
                      </div>
                      <small
                        className="text-muted mt-1 px-1"
                        style={{ fontSize: 10 }}
                      >
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </small>
                    </div>
                  );
                })}
                {isContactTyping && (
                  <div className="d-flex align-items-center gap-1 text-secondary small bg-white p-2 rounded-3 border align-self-start">
                    {activeContact.name} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSendMessage();
                }}
                className="p-2 bg-white d-flex flex-column gap-1"
              >
                {sendError && (
                  <small className="text-danger px-2">{sendError}</small>
                )}
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleInputChange}
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0"
                    style={{ width: 36, height: 36 }}
                  >
                    <i className="bi bi-send-fill" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-grow-1 p-2 bg-white overflow-y-auto">
              <div className="small text-secondary fw-bold px-2 py-1 text-uppercase">
                Accepted connections ({connectedFounders.length})
              </div>
              {connectedFounders.length ? (
                connectedFounders.map((founder) => (
                  <button
                    type="button"
                    key={founder._id}
                    onClick={() => setActiveContact(founder)}
                    className="p-2 rounded-3 d-flex align-items-center gap-3 w-100 border-0 bg-transparent text-start message-contact"
                  >
                    <img
                      src={avatarFor(founder.name, founder.photo)}
                      alt=""
                      className="rounded-circle border"
                      style={{ width: 40, height: 40, objectFit: "cover" }}
                    />
                    <span className="flex-grow-1 overflow-hidden">
                      <strong className="d-block text-truncate">
                        {founder.name}
                      </strong>
                      <small className="text-secondary text-truncate d-block">
                        {founder.projectDetails || "Start a conversation"}
                      </small>
                    </span>
                    <span
                      className={`badge ${onlineUsers.includes(String(founder._id)) ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}
                    >
                      {onlineUsers.includes(String(founder._id))
                        ? "Online"
                        : "Offline"}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-5 text-secondary">
                  <p className="small fw-bold mb-1">No conversations yet</p>
                  <small>
                    Chat unlocks after a founder accepts your connection
                    request.
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
