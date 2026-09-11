import { useState, useRef, useEffect } from "react";

const FAQ_DATABASE = [
  {
    keywords: ["connection", "connect", "request", "how to connect"],
    answer:
      "To connect with a founder: Click 'Connect' on their profile in the Explore feed. Once they accept your request, you both become connected and can chat directly in real-time!",
  },
  {
    keywords: ["phone", "mobile", "number", "contact", "whatsapp", "call"],
    answer:
      "For your security, mobile numbers are kept private. Once a founder accepts your connection request, you can click 'Request Mobile Number' inside the chat or profile. If they approve, their number will be revealed with 1-click WhatsApp and Call options.",
  },
  {
    keywords: ["chat", "message", "messaging", "talk", "start chat"],
    answer:
      "You can chat with any founder after you log in AND they accept your connection request. Look for the 'Chat' button on their card or open the Messages tab in your Dashboard.",
  },
  {
    keywords: ["location", "distance", "km", "nearby", "50", "80", "proximity"],
    answer:
      "In the Explore feed, you can toggle 'Within 50 km' or 'Within 80 km' to discover founders and co-founders right in your region for local meetups and whiteboarding sessions.",
  },
  {
    keywords: ["cto", "tech", "developer", "technical cofounder", "engineer"],
    answer:
      "To find a CTO or technical co-founder: Filter by 'Looking for CTO' in the Explore feed. Highlight what problem you are solving, your market traction, and why this project is exciting to build.",
  },
  {
    keywords: ["ceo", "co-founder", "role", "cfo"],
    answer:
      "FoundMet categorizes builders into Founders (leading a project) and Co-Founders (looking to join an early team). Use the top role tabs in Explore to filter by role.",
  },
  {
    keywords: ["pitch", "description", "idea", "project"],
    answer:
      "Keep your project description short and focused: 1) What problem you solve, 2) Who your target user is, and 3) What skill set you need right now to reach your next milestone.",
  },
];

const SUGGESTIONS = [
  "How do connections work?",
  "When can I share a phone number?",
  "How do I find nearby founders?",
  "How do I find a technical co-founder?",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! I'm your FoundMet AI Advisor. How can I help you find a co-founder or navigate the platform today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const replyTimerRef = useRef(null);
  const messageIdRef = useRef(0);

  useEffect(() => () => {
    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const findAnswer = (query) => {
    const q = query.toLowerCase();
    for (const item of FAQ_DATABASE) {
      if (item.keywords.some((k) => q.includes(k))) {
        return item.answer;
      }
    }
    return `Great question! You can discover co-founders in the Explore feed, send connection requests, and once accepted, collaborate via real-time chat and request contact details. Is there a specific topic you'd like guidance on?`;
  };

  const handleSend = (textToSend = null) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text) return;

    const userMsg = {
      id: `user_${messageIdRef.current++}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
    replyTimerRef.current = setTimeout(() => {
      const replyText = findAnswer(text);
      const botReply = {
        id: `bot_${messageIdRef.current++}`,
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
      replyTimerRef.current = null;
    }, 600);
  };

  const handleClose = () => {
    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
      setIsTyping(false);
    }
    setIsOpen(false);
  };

  return (
    <div
      className="foundmet-chatbot position-fixed"
      style={{
        bottom: "24px",
        left: "24px",
        zIndex: 1045,
      }}
    >
      {/* Closed Floating Trigger Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn btn-dark rounded-pill shadow-lg d-flex align-items-center gap-2 py-2 px-3 border border-secondary"
          title="Ask FoundMet AI Advisor"
          style={{ transition: "transform 0.2s" }}
        >
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: "28px", height: "28px" }}
          >
            <i className="bi bi-robot" style={{ fontSize: "14px" }}></i>
          </div>
          <span className="fw-semibold small">AI Advisor</span>
          <span className="badge bg-primary text-white rounded-pill" style={{ fontSize: "10px" }}>
            Help
          </span>
        </button>
      ) : (
        /* Open Chatbot Drawer */
        <div
          className="card border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column"
          style={{
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            height: "460px",
          }}
        >
          {/* Header */}
          <div className="p-3 bg-dark text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
              >
                <i className="bi bi-robot"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold small">FoundMet AI Advisor</h6>
                <small className="text-success d-flex align-items-center gap-1" style={{ fontSize: "10px" }}>
                  <span className="bg-success rounded-circle d-inline-block" style={{ width: "6px", height: "6px" }}></span>
                  Online • Instant Guidance
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link text-white p-1"
              onClick={handleClose}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow-1 p-3 bg-light overflow-y-auto d-flex flex-column gap-2" style={{ maxHeight: "310px" }}>
            {messages.map((m) => {
              const isMe = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`d-flex flex-column ${isMe ? "align-items-end" : "align-items-start"}`}
                >
                  <div
                    className={`p-2 px-3 rounded-4 small ${
                      isMe ? "bg-primary text-white" : "bg-white text-dark border shadow-xs"
                    }`}
                    style={{
                      maxWidth: "85%",
                      fontSize: "12px",
                      lineHeight: "1.4",
                    }}
                  >
                    {m.text}
                  </div>
                  <span className="text-muted mt-1 px-1" style={{ fontSize: "9px" }}>
                    {m.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div className="d-flex align-items-center gap-1 bg-white border p-2 rounded-3 small align-self-start text-secondary">
                <span className="spinner-grow spinner-grow-sm text-primary" style={{ width: "6px", height: "6px" }}></span>
                <span style={{ fontSize: "10px" }}>AI is typing answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Suggestion Pills */}
          <div className="px-2 py-1 bg-white border-top border-bottom d-flex gap-1 overflow-x-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="btn btn-outline-secondary btn-sm rounded-pill text-nowrap py-0 px-2"
                style={{ fontSize: "10px" }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 bg-white d-flex align-items-center gap-2"
          >
            <input
              type="text"
              className="form-control form-control-sm rounded-pill"
              placeholder="Ask anything about FoundMet..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ fontSize: "12px" }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{ width: "30px", height: "30px", flexShrink: 0 }}
            >
              <i className="bi bi-arrow-up" style={{ fontSize: "12px" }}></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
