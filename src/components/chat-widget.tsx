"use client";

import * as React from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("_chat_vid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("_chat_vid", id);
  }
  return id;
}

export function ChatWidget({ siteId, greeting }: { siteId: string; greeting: string }) {
  const [open, setOpen]         = React.useState(false);
  const [input, setInput]       = React.useState("");
  const [sending, setSending]   = React.useState(false);
  const [sessionId, setSession] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([
    { role: "assistant", content: greeting },
  ]);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef  = React.useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`/api/chat/${siteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
          visitorId: getVisitorId(),
        }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages(m => [...m, { role: "assistant", content: data.content }]);
      }
      if (data.sessionId) setSession(data.sessionId);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "שגיאה זמנית, נסה שוב." }]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="פתח צ'אט"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl transition-all hover:scale-110 hover:bg-indigo-700 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">
            AI
          </span>
        )}
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-40 flex w-[340px] max-w-[calc(100vw-3rem)] flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
          dir="rtl"
          style={{ maxHeight: "520px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-indigo-600 px-4 py-3.5 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">עוזר AI</p>
              <p className="text-indigo-200 text-xs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                מחובר ופעיל
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50" style={{ minHeight: 0, maxHeight: "340px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tl-sm"
                      : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tr-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                  <Bot className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-slate-100">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 bg-white px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="כתוב הודעה..."
              disabled={sending}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none transition-colors disabled:opacity-50"
              dir="rtl"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
