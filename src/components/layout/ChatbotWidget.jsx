import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function ChatbotWidget() {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  const intents = Array.isArray(t("chatbot.intents")) ? t("chatbot.intents") : [];
  const suggestions = Array.isArray(t("chatbot.suggestions")) ? t("chatbot.suggestions") : [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const findAnswer = (text) => {
    const normalized = normalize(text);
    const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);

    const intent = intents.find((item) =>
      item.keywords.split(" ").some((keyword) =>
        keyword.length <= 3 ? tokens.includes(keyword) : normalized.includes(keyword)
      )
    );

    return intent
      ? { text: intent.answer, target: intent.target }
      : { text: t("chatbot.fallback") };
  };

  const send = (rawText) => {
    const text = rawText.trim();
    if (!text) return;

    setMessages((previous) => [...previous, { from: "user", text }]);
    setInput("");

    setTimeout(() => {
      setMessages((previous) => [...previous, { from: "bot", ...findAnswer(text) }]);
    }, 450);
  };

  const goTo = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <div className="evb-container">
      {open && (
        <div className="evb-window">
          <div className="evb-header">
            <div>
              <div className="evb-title">{t("chatbot.title")}</div>
              <div className="evb-sub">{t("chatbot.subtitle")}</div>
            </div>
            <button
              type="button"
              className="evb-close"
              onClick={() => setOpen(false)}
              aria-label={t("chatbot.close")}
            >
              ✕
            </button>
          </div>

          <div className="evb-messages">
            <div className="evb-msg bot">{t("chatbot.greeting")}</div>

            {messages.map((message, index) => (
              <div key={index} className={`evb-msg ${message.from}`}>
                {message.text}
                {message.target && (
                  <button
                    type="button"
                    className="evb-go"
                    onClick={() => goTo(message.target)}
                  >
                    {t("chatbot.go")} →
                  </button>
                )}
              </div>
            ))}

            {messages.length === 0 && (
              <div className="evb-suggestions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => send(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form
            className="evb-input-area"
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("chatbot.placeholder")}
            />
            <button type="submit" className="evb-send" aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="evb-trigger"
        onClick={() => setOpen((previous) => !previous)}
        aria-label={t("chatbot.open")}
        title={t("chatbot.open")}
      >
        <span className="evb-online" />
        <svg width="42" height="42" viewBox="0 0 100 100">
          <circle cx="50" cy="18" r="7" fill="#0066cc" />
          <line x1="50" y1="25" x2="50" y2="34" stroke="#0066cc" strokeWidth="6" />
          <rect x="18" y="34" width="64" height="44" rx="20" fill="#ffffff" stroke="#0066cc" strokeWidth="4" />
          <rect x="25" y="40" width="50" height="32" rx="14" fill="#0c2340" />
          <path d="M 34 55 Q 41 47 48 55" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 52 55 Q 59 47 66 55" stroke="#00f0ff" strokeWidth="5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default ChatbotWidget;