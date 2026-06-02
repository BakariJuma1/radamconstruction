import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { SiteSettingsContext } from "../SiteSettingsContext";
import { buildWhatsAppLink } from "../config";

const API_BASE = "https://radamconstruction.onrender.com";

const WELCOME = {
  role: "assistant",
  content:
    "Hi! I'm the Radamjaribu Builders assistant. I can help you learn about our services, completed projects, and hardware products. What would you like to know?",
};

const WHATSAPP_MESSAGE =
  "Hi Radamjaribu Builders! I was chatting with your assistant and would like to speak with someone directly.";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const { settings } = useContext(SiteSettingsContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const whatsappLink = buildWhatsAppLink(WHATSAPP_MESSAGE, settings?.whatsapp_number);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setThinking(true);

    try {
      const res = await axios.post(`${API_BASE}/ai/chat`, {
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect right now. You can reach us directly on WhatsApp using the button below.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 left-4 sm:left-6 z-50 flex flex-col w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white font-bold text-sm">
                RJB
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">
                  RJB Assistant
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {thinking ? "Typing…" : "Online"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-3 bg-slate-50 max-h-72">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Escalation strip */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-50 border-t border-green-100 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.571a.5.5 0 00.614.611l5.857-1.54A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.792-.525-5.367-1.439l-.385-.228-3.985 1.048 1.006-3.868-.252-.399A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              Talk to a human on WhatsApp
            </a>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 bg-white px-3 py-3 flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about our services or products…"
              className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 max-h-24 overflow-y-auto"
            />
            <button
              onClick={send}
              disabled={!input.trim() || thinking}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:opacity-40"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-slate-700"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        <span>{open ? "Close" : "Ask us anything"}</span>
      </button>
    </>
  );
}
