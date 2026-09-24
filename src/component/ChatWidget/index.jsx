import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiMessageCircle,
  FiPackage,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiShoppingCart,
  FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import axios from "api/axios";
import useShoppingCart from "hooks/useShoppingCart";
import { getApiBaseUrl } from "../../config/api";
import "./style.scss";
import { selectAuthBootstrapped, selectCustomerUser } from "../../redux/authSlice";

const CHAT_TIMEOUT_MS = 30000;
const HEALTH_TIMEOUT_MS = 5000;
const MAX_CART_CONTEXT_ITEMS = 20;

const validProduct = (product) =>
  product &&
  Number.isInteger(Number(product.id)) &&
  Number(product.id) > 0 &&
  typeof product.name === "string" &&
  Number.isFinite(Number(product.price)) &&
  Number(product.price) >= 0 &&
  Number.isInteger(Number(product.inventory)) &&
  Number(product.inventory) >= 0;

const normalizeResponse = (data) => {
  const content = typeof data?.message === "string" ? data.message : data?.reply;
  if (typeof content !== "string" || !content.trim()) return null;

  const products = Array.isArray(data.products)
    ? data.products.filter(validProduct).slice(0, 5)
    : [];
  const productIds = new Set(products.map((product) => Number(product.id)));
  const actions = Array.isArray(data.suggested_actions)
    ? data.suggested_actions.filter(
        (action) =>
          action?.type === "ADD_TO_CART" &&
          productIds.has(Number(action.product_id)) &&
          Number.isInteger(Number(action.quantity)) &&
          Number(action.quantity) > 0 &&
          Number(action.quantity) <= 100
      ).slice(0, 3)
    : [];
  const citations = data?.answer_status === "verified" && Array.isArray(data.citations)
    ? data.citations.filter(
        (citation) =>
          typeof citation?.source_id === "string" && citation.source_id.trim() &&
          typeof citation?.title === "string" && citation.title.trim() &&
          typeof citation?.section === "string" && citation.section.trim()
      ).slice(0, 5)
    : [];

  return {
    content: content.trim(),
    products,
    actions,
    source: data.source,
    authRequired: data?.auth?.required === true,
    authReason: data?.auth?.reason,
    answerStatus: citations.length > 0 ? "verified" : data?.answer_status,
    citations,
  };
};

const ChatWidget = () => {
  const { t, i18n } = useTranslation();
  const { addToCart, requireCartAuth, authPending } = useShoppingCart();
  const currentUser = useSelector(selectCustomerUser);
  const isBootstrapped = useSelector(selectAuthBootstrapped);
  const ownerId = Number(currentUser?.id || 0);
  const cartLines = useSelector((state) => state.commonSlide?.cart?.products || []);
  const ownerRef = useRef(ownerId);
  ownerRef.current = ownerId;
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
  const pendingActionsRef = useRef(new Set());

  const cartContext = useMemo(
    () => {
      if (!isBootstrapped || !currentUser) return [];
      return (
      cartLines
        .map((line) => ({
          product_id: Number(line?.product?.id),
          quantity: Number(line?.quantity),
        }))
        .filter(
          (line) =>
            Number.isInteger(line.product_id) &&
            line.product_id > 0 &&
            Number.isInteger(line.quantity) &&
            line.quantity > 0 &&
            line.quantity <= 100
        )
        .slice(0, MAX_CART_CONTEXT_ITEMS)
      );
    },
    [cartLines, currentUser, isBootstrapped]
  );

  useEffect(() => {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    pendingActionsRef.current.clear();
    setMessages([{ role: "assistant", content: t("chat.welcome") }]);
    setInput("");
    setLoading(false);
    setUnreadCount(0);
    // Conversation belongs to the current account; locale updates are handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) {
      setUnreadCount(0);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    const welcomeMessage = t("chat.welcome");
    setMessages((currentMessages) => {
      const firstMessage = currentMessages[0];
      if (!firstMessage || firstMessage.role !== "assistant") return currentMessages;

      return [
        { ...firstMessage, content: welcomeMessage },
        ...currentMessages.slice(1),
      ];
    });
  }, [i18n.language, t]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isOpen, loading, messages]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;
    const timeoutId = window.setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

    fetch(`${getApiBaseUrl()}/chat/health`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => {
        if (isActive) setServiceStatus(response.ok && data.status === "online" ? "online" : "offline");
      })
      .catch(() => {
        if (isActive) setServiceStatus("offline");
      })
      .finally(() => window.clearTimeout(timeoutId));

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

  const appendAssistantMessage = (message) => {
    if (!isMountedRef.current) return;
    const normalized = typeof message === "string" ? { content: message } : message;
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "assistant", ...normalized },
    ]);
    if (!isOpenRef.current) setUnreadCount((count) => count + 1);
  };

  const sendMessage = async (retryMessage) => {
    const message = (typeof retryMessage === "string" ? retryMessage : input).trim();
    if (!message || loading || requestControllerRef.current) return;

    setMessages((currentMessages) => [...currentMessages, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const requestOwner = ownerId;
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CHAT_TIMEOUT_MS);
    requestControllerRef.current = controller;
    let errorMessage = t("chat.error");

    try {
      const data = await axios({
        url: "/chat",
        method: "POST",
        signal: controller.signal,
        timeout: CHAT_TIMEOUT_MS,
        headers: { "Accept-Language": i18n.resolvedLanguage || i18n.language },
        data: {
          message,
          history: messages
            .slice(1)
            .slice(-6)
            .map(({ role, content }) => ({ role, content })),
          cart: cartContext,
        },
      });

      if (!isMountedRef.current || ownerRef.current !== requestOwner) return;
      if (controller.signal.aborted) throw new DOMException("Request aborted", "AbortError");
      const responseMessage = normalizeResponse(data);
      if (!responseMessage) throw new Error("Malformed chat response");

      setServiceStatus("online");
      appendAssistantMessage(responseMessage);
    } catch (error) {
      const status = error?.response?.status;
      const networkFailure = !error?.response
        && (error?.isAxiosError === true || error?.code === "ERR_NETWORK");
      if (status === 401) errorMessage = t("chat.signInRequired");
      else if (status === 403) errorMessage = t("chat.forbidden");
      else if (status === 419) errorMessage = t("chat.sessionExpired");
      else if (status === 422) errorMessage = t("chat.invalidRequest");
      else if (status === 429) errorMessage = t("chat.rateLimited");
      else if (status >= 500) errorMessage = t("chat.unavailable");
      else if (status === 409) errorMessage = t("chat.busy");
      else if (networkFailure) errorMessage = t("chat.networkError");
      if (didTimeout || ["ECONNABORTED", "ETIMEDOUT"].includes(error?.code)) {
        errorMessage = t("chat.timeout");
      }

      if (!isMountedRef.current || ownerRef.current !== requestOwner || (controller.signal.aborted && !didTimeout)) return;
      const serviceUnavailable = didTimeout
        || networkFailure
        || status >= 500;
      setServiceStatus(serviceUnavailable ? "offline" : "online");
      appendAssistantMessage({ content: errorMessage, retryMessage: message, isError: true });
    } finally {
      window.clearTimeout(timeoutId);
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        if (isMountedRef.current) setLoading(false);
      }
    }
  };

  const confirmAction = (messageIndex, action, product) => {
    const actionKey = `${messageIndex}:${action.product_id}:${action.quantity}`;
    if (pendingActionsRef.current.has(actionKey) || !validProduct(product)) return;
    pendingActionsRef.current.add(actionKey);

    const cartProduct = {
      id: Number(product.id),
      name: product.name,
      img: product.image_url || "",
      price: Number(product.price),
      inventory: Number(product.inventory),
      category_id: product.category?.id ?? null,
      category: product.category ?? null,
    };
    const result = addToCart(cartProduct, Number(action.quantity));
    if (!result?.ok) {
      pendingActionsRef.current.delete(actionKey);
      return;
    }
    const addedCount = result?.addedCount ?? 0;
    const interpolation = {
      count: addedCount,
      name: product.name,
      limit: result?.maxInventory ?? 0,
    };
    const feedback = addedCount <= 0
      ? t("chat.cartLimit", interpolation)
      : addedCount < Number(action.quantity)
        ? t("chat.cartPartial", interpolation)
        : t("chat.cartAdded", interpolation);

    setMessages((currentMessages) =>
      currentMessages.map((item, index) =>
        index === messageIndex
          ? {
              ...item,
              actions: item.actions?.map((candidate) =>
                candidate === action ? { ...candidate, completed: true } : candidate
              ),
            }
          : item
      )
    );
    appendAssistantMessage(feedback);
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
  const formatPrice = (price) =>
    `${new Intl.NumberFormat(i18n.resolvedLanguage === "en" ? "en-US" : "vi-VN").format(Number(price))} ₫`;

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="chat-widget__panel" role="dialog" aria-modal="false" aria-labelledby="chat-widget-title">
          <header className="chat-widget__header">
            <div className="chat-widget__avatar" aria-hidden="true"><FiMessageCircle /></div>
            <div className="chat-widget__heading">
              <strong id="chat-widget-title">{t("chat.title")}</strong>
              <span className={`is-${serviceStatus}`}><i aria-hidden="true" />{statusLabel}</span>
            </div>
            <button type="button" className="chat-widget__close" onClick={() => setIsOpen(false)} aria-label={t("common.close")}>
              <FiX />
            </button>
          </header>

          <div className="chat-widget__messages" aria-live="polite" aria-busy={loading}>
            {messages.map((message, index) => (
              <div
                className={`chat-widget__turn chat-widget__turn--${message.role}`}
                data-testid={message.role === "assistant" ? "chat-message-bot" : "chat-message-user"}
                key={`${message.role}-${index}`}
              >
                <div className={`chat-widget__message${message.isError ? " is-error" : ""}`}>{message.content}</div>

                {message.answerStatus === "verified" && message.citations?.length > 0 && (
                  <details className="chat-widget__citations">
                    <summary aria-label={t("chat.verifiedSourcesLabel")}>
                      <FiShield aria-hidden="true" />{t("chat.verified")}
                    </summary>
                    <ul aria-label={t("chat.sources")}>
                      {message.citations.map((citation) => (
                        <li key={`${citation.source_id}:${citation.section}`}>
                          <strong>{citation.title}</strong>
                          <span>{citation.section}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {message.products?.length > 0 && (
                  <div className="chat-widget__products" aria-label={t("chat.productResults")}>
                    {message.products.map((product) => {
                      const action = message.actions?.find(
                        (candidate) => Number(candidate.product_id) === Number(product.id)
                      );
                      const outOfStock = product.inventory_status === "out_of_stock" || Number(product.inventory) < 1;

                      return (
                        <article className="chat-widget__product" data-testid="chat-product-card" key={product.id}>
                          <div className="chat-widget__product-image">
                            <FiPackage aria-hidden="true" />
                            {product.image_url && (
                              <img src={product.image_url} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
                            )}
                          </div>
                          <div
                            className="chat-widget__product-copy"
                            aria-label={t("chat.productSummary", {
                              name: product.name,
                              price: formatPrice(product.price),
                              stock: outOfStock ? t("chat.outOfStock") : t("chat.inStock", { count: product.inventory }),
                            })}
                          >
                            <strong aria-hidden="true">{product.name}</strong>
                            <span className="chat-widget__copy-separator" aria-hidden="true"> · </span>
                            <span className="chat-widget__price" aria-hidden="true">{formatPrice(product.price)}</span>
                            <span className="chat-widget__copy-separator" aria-hidden="true"> · </span>
                            <span className={`chat-widget__stock ${outOfStock ? "is-empty" : "is-available"}`} aria-hidden="true">
                              {outOfStock ? t("chat.outOfStock") : t("chat.inStock", { count: product.inventory })}
                            </span>
                          </div>
                          {(action || message.authRequired) && (
                            <button
                              type="button"
                              className="chat-widget__cart-action"
                              disabled={outOfStock || authPending || action?.completed}
                              onClick={() => {
                                if (!currentUser) {
                                  requireCartAuth?.();
                                  return;
                                }
                                if (action) confirmAction(index, action, product);
                              }}
                              aria-label={
                                authPending
                                  ? t("chat.checkingSession")
                                  : !currentUser
                                    ? t("chat.signInToAddAria", { name: product.name })
                                    : action?.completed
                                      ? t("chat.added")
                                      : t("chat.addToCartAria", { count: action?.quantity, name: product.name })
                              }
                            >
                              <FiShoppingCart aria-hidden="true" />
                              {authPending
                                ? t("chat.checkingSession")
                                : !currentUser
                                  ? t("chat.signInToAdd")
                                  : action?.completed
                                    ? t("chat.added")
                                    : t("chat.addToCart", { count: action?.quantity })}
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                {message.retryMessage && (
                  <button type="button" className="chat-widget__retry" onClick={() => sendMessage(message.retryMessage)} disabled={loading}>
                    <FiRefreshCw aria-hidden="true" />{t("chat.retry")}
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-widget__typing" aria-label={t("common.loading")}>
                <span /><span /><span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-widget__footer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea
              ref={inputRef}
              rows={1}
              data-testid="chat-input"
              value={input}
              maxLength={500}
              placeholder={t("chat.placeholder")}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              aria-label={t("chat.placeholder")}
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label={t("chat.send")}><FiSend /></button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`chat-widget__bubble${isOpen ? " is-open" : ""}`}
        data-testid="chat-bubble"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? t("common.close") : t("chat.title")}
        aria-expanded={isOpen}
      >
        {isOpen ? <FiX aria-hidden="true" /> : <FiMessageCircle aria-hidden="true" />}
        {!isOpen && unreadCount > 0 && <span className="chat-widget__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
    </div>
  );
};

export default ChatWidget;
