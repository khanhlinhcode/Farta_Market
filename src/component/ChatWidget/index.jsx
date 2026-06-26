import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { getApiBaseUrl } from "../../config/api";
import useShoppingCart from "hooks/useShoppingCart";
import "./style.scss";

const CHAT_TIMEOUT_MS = 30000;
const HEALTH_TIMEOUT_MS = 5000;

const ChatWidget = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useShoppingCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: t("chat.welcome") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [serviceStatus, setServiceStatus] = useState("checking");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isOpenRef = useRef(false);
  const isMountedRef = useRef(true);
  const requestControllerRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;

    if (isOpen) {
      setUnreadCount(0);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setMessages((currentMessages) =>
      currentMessages.map((message, index) =>
        index === 0 && message.role === "assistant"
          ? { ...message, content: t("chat.welcome") }
          : message
      )
    );
  }, [i18n.resolvedLanguage, t]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, loading, messages]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      HEALTH_TIMEOUT_MS
    );

    const checkHealth = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/chat/health`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (isActive) {
          setServiceStatus(
            response.ok && data.status === "online" ? "online" : "offline"
          );
        }
      } catch {
        if (isActive) {
          setServiceStatus("offline");
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    checkHealth();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestControllerRef.current?.abort();
    };
  }, []);

  const appendAssistantMessage = (content) => {
    if (!isMountedRef.current) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "assistant", content },
    ]);

    if (!isOpenRef.current) {
      setUnreadCount((count) => count + 1);
    }
  };

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage = { role: "user", content: message };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CHAT_TIMEOUT_MS);
    requestControllerRef.current = controller;
    let errorMessage = t("chat.error");

    try {
      const response = await fetch(`${getApiBaseUrl()}/chat`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          message,
          history: messages
            .slice(1)
            .slice(-6)
            .map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        if (response.status === 429) {
          errorMessage = t("chat.rateLimited");
        } else if (response.status === 503) {
          errorMessage = data.message || t("chat.unavailable");
        }

        throw new Error(data.message || "Chat request failed");
      }

      if (isMountedRef.current) {
        setServiceStatus("online");
      }
      if (
        data.action?.type === "add_to_cart" &&
        data.action.product &&
        Number(data.action.quantity) > 0
      ) {
        addToCart(data.action.product, Number(data.action.quantity));
      }
      appendAssistantMessage(data.reply);
    } catch {
      if (didTimeout) {
        errorMessage = t("chat.timeout");
      }

      if (isMountedRef.current) {
        setServiceStatus("offline");
      }
      appendAssistantMessage(errorMessage);
    } finally {
      window.clearTimeout(timeoutId);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const statusLabel = {
    checking: t("chat.checking"),
    online: t("chat.online"),
    offline: t("chat.offline"),
  }[serviceStatus];

  return (
    <div className="chat-widget">
      {isOpen && (
        <section
          className="chat-widget__panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-widget-title"
        >
          <header className="chat-widget__header">
            <div className="chat-widget__avatar" aria-hidden="true">
              <FiMessageCircle />
            </div>
            <div className="chat-widget__heading">
              <strong id="chat-widget-title">{t("chat.title")}</strong>
              <span className={`is-${serviceStatus}`}>
                <i aria-hidden="true" />
                {statusLabel}
              </span>
            </div>
            <button
              type="button"
              className="chat-widget__close"
              onClick={() => setIsOpen(false)}
              aria-label={t("common.close")}
            >
              <FiX />
            </button>
          </header>

          <div
            className="chat-widget__messages"
            aria-live="polite"
            aria-busy={loading}
          >
            {messages.map((message, index) => (
              <div
                className={`chat-widget__message chat-widget__message--${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div
                className="chat-widget__typing"
                aria-label={t("common.loading")}
              >
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="chat-widget__footer">
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              placeholder={t("chat.placeholder")}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              aria-label={t("chat.placeholder")}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label={t("chat.send")}
            >
              <FiSend />
            </button>
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`chat-widget__bubble${isOpen ? " is-open" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? t("common.close") : t("chat.title")}
        aria-expanded={isOpen}
      >
        {isOpen ? <FiX aria-hidden="true" /> : <span aria-hidden="true">💬</span>}
        {!isOpen && unreadCount > 0 && (
          <span className="chat-widget__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
