"use client";

import { useChat } from "@ai-sdk/react";
import { type FormEvent, useEffect, useRef, useState } from "react";

const CLAUDE_MODELS = [
  "claude-haiku-4-5",
  "claude-sonnet-4-5",
  "claude-opus-4",
];

const CLINE_MODELS = [
  "minimax/minimax-m2.5",
  "z-ai/glm-5",
  "kwaipilot/kat-coder-pro",
  "arcee-ai/trinity",
];

export default function ChatPage() {
  const [backend, setBackend] = useState<"claude" | "cline">("claude");
  const [model, setModel] = useState(CLAUDE_MODELS[0]);
  const { messages, sendMessage, status, stop } = useChat();
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";
  const modelOptions = backend === "claude" ? CLAUDE_MODELS : CLINE_MODELS;

  function handleBackendChange(newBackend: "claude" | "cline") {
    setBackend(newBackend);
    const models = newBackend === "claude" ? CLAUDE_MODELS : CLINE_MODELS;
    if (!models.includes(model)) setModel(models[0]);
  }

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Elapsed timer
  useEffect(() => {
    if (isLoading && startRef.current === null) {
      startRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        if (startRef.current !== null)
          setElapsed((Date.now() - startRef.current) / 1000);
      }, 100);
    } else if (!isLoading && startRef.current !== null) {
      setElapsed((Date.now() - startRef.current) / 1000);
      startRef.current = null;
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  }, [isLoading]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setElapsed(null);
    sendMessage({ text }, { body: { backend, model } });
  }

  function fmt(s: number) {
    if (s < 60) return `${s.toFixed(1)}s`;
    return `${Math.floor(s / 60)}m ${(s % 60).toFixed(0)}s`;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      maxWidth: 860,
      margin: "0 auto",
      padding: "0 1rem",
    }}>
      {/* ── Header ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 0 0.75rem",
        borderBottom: "1px solid #dde1e6",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 16,
          }}>AI</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "1rem", lineHeight: 1.2 }}>
              Czech Building Law
            </div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              AI legal assistant
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.8rem" }}>
          <Select
            label="Backend"
            value={backend}
            onChange={(v) => handleBackendChange(v as "claude" | "cline")}
            disabled={isLoading}
            options={[
              { value: "claude", label: "Claude SDK" },
              { value: "cline", label: "Cline CLI" },
            ]}
          />
          <Select
            label="Model"
            value={model}
            onChange={setModel}
            disabled={isLoading}
            options={modelOptions.map((m) => ({ value: m, label: m }))}
          />
        </div>
      </header>

      {/* ── Messages ── */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: "1.25rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
            gap: "0.75rem",
            textAlign: "center",
            padding: "2rem",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 24, fontWeight: 700,
              opacity: 0.8,
            }}>AI</div>
            <div style={{ fontSize: "1.05rem", fontWeight: 500, color: "#6b7280" }}>
              Ask about Czech building law
            </div>
            <div style={{ fontSize: "0.85rem", maxWidth: 400, lineHeight: 1.5 }}>
              Questions about permits, regulations, court rulings, technical standards, and more.
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%",
              padding: "0.7rem 1rem",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user"
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#ffffff",
              color: m.role === "user" ? "#fff" : "#1a1a2e",
              boxShadow: m.role === "user"
                ? "none"
                : "0 1px 3px rgba(0,0,0,0.08)",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {m.parts.map((part, i) =>
                part.type === "text" ? <span key={i}>{part.text}</span> : null
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "0.7rem 1rem",
              borderRadius: "18px 18px 18px 4px",
              background: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              color: "#9ca3af",
              fontSize: "0.92rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <Dots />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div style={{
        flexShrink: 0,
        padding: "0.75rem 0 1rem",
        borderTop: "1px solid #dde1e6",
      }}>
        <form onSubmit={handleSubmit} style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              borderRadius: 24,
              border: "1px solid #d1d5db",
              fontSize: "0.95rem",
              outline: "none",
              background: "#fff",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#667eea")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
          {isLoading ? (
            <button type="button" onClick={() => stop()} style={{
              width: 42, height: 42, borderRadius: "50%",
              border: "1px solid #d1d5db", background: "#fff",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#6b7280",
              flexShrink: 0,
            }} title="Stop">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="3" width="10" height="10" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                width: 42, height: 42, borderRadius: "50%",
                border: "none",
                background: input.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#d1d5db",
                color: "#fff",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
              title="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
          {elapsed !== null && (
            <span style={{
              fontSize: "0.78rem",
              color: "#9ca3af",
              whiteSpace: "nowrap",
              minWidth: 48,
              textAlign: "right",
            }}>
              {fmt(elapsed)}
            </span>
          )}
        </form>
      </div>
    </div>
  );
}

/* ── Small components ── */

function Select({ label, value, onChange, disabled, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
      <span style={{ color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: "0.25rem 0.4rem",
          borderRadius: 6,
          border: "1px solid #d1d5db",
          fontSize: "0.78rem",
          background: "#fff",
          color: "#374151",
          cursor: disabled ? "default" : "pointer",
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#9ca3af",
            animation: `dotPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
