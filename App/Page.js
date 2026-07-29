"use client";
import React, { useState, useRef, useEffect } from "react";

const FONT_LINK_ID = "ai-chat-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" style={{ flexShrink: 0 }}>
      <circle cx="128" cy="128" r="120" fill="#000000" />
      <g
        transform="translate(128,128) rotate(-45) translate(-128,-128)"
        stroke="#FFFFFF"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <line x1="128" y1="118" x2="182" y2="72" />
        <line x1="128" y1="138" x2="182" y2="184" />
        <circle cx="112" cy="106" r="16" />
        <circle cx="112" cy="150" r="16" />
        <circle cx="128" cy="128" r="4" fill="#FFFFFF" stroke="none" />
      </g>
      <line x1="60" y1="60" x2="196" y2="196" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

function Avatar({ role }) {
  if (role === "user") {
    return (
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: "#D9D9D9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 500,
          color: "#1B1B1F",
          flexShrink: 0,
        }}
      >
        you
      </div>
    );
  }
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        background: "#111111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFFFFF" }} />
    </div>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "#000000",
            animation: `dotPulse 1.1s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  useFonts();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text || isThinking) return;
    setError(null);
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      const reply = textBlock ? textBlock.text : "I didn't get a response back — try again?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError("Something went wrong reaching the assistant. Try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions = [
    "Explain a tricky concept simply",
    "Draft an email for me",
    "Brainstorm ideas for a project",
    "Help me debug some code",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        background: "#FFFFFF",
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: "#1B1B1F",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 24px",
          borderBottom: "1px solid #D9D9D9",
          flexShrink: 0,
        }}
      >
        <Logo />
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 19,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Brick.AI.chats
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: "#7A7A7A",
            marginLeft: 2,
          }}
        >
          general assistant
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {messages.length === 0 && (
            <div style={{ padding: "40px 0" }}>
              <h1
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: 1.25,
                  margin: "0 0 8px 0",
                }}
              >
                What's on your mind?
              </h1>
              <p style={{ fontSize: 14, color: "#7A7A7A", margin: "0 0 28px 0" }}>
                Ask anything — I'll do my best to help.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: "1px solid #D9D9D9",
                      background: "#F4F4F4",
                      color: "#1B1B1F",
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 22, alignItems: "flex-start" }}>
              <Avatar role={m.role} />
              <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap", paddingTop: 3 }}>
                {m.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Avatar role="assistant" />
              <ThinkingDots />
            </div>
          )}

          {error && (
            <div style={{ color: "#B00000", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #D9D9D9", padding: "16px 24px 20px 24px", flexShrink: 0 }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            background: "#F4F4F4",
            border: "1px solid #D9D9D9",
            borderRadius: 12,
            padding: "8px 8px 8px 16px",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant..."
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
              padding: "8px 0",
              maxHeight: 160,
              color: "#1B1B1F",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || isThinking}
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "none",
              background: input.trim() && !isThinking ? "#111111" : "#D9D9D9",
              color: "#FFFFFF",
              cursor: input.trim() && !isThinking ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Send message"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  }
