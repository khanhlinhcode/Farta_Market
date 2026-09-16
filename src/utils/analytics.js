export const ANALYTICS_STORAGE_KEYS = {
  visitor: "farta_analytics_visitor",
  session: "farta_analytics_session",
  optOut: "farta_analytics_opt_out",
};

const createUuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

const storedUuid = (storage, key) => {
  try {
    const current = storage.getItem(key);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(current || "")) {
      return current;
    }
    const created = createUuid();
    storage.setItem(key, created);
    return created;
  } catch {
    return createUuid();
  }
};

export const analyticsAllowed = () => {
  if (import.meta.env.VITE_ANALYTICS_ENABLED !== "true") return false;
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return false;
  try {
    return localStorage.getItem(ANALYTICS_STORAGE_KEYS.optOut) !== "1";
  } catch {
    return true;
  }
};

export const getAnalyticsIdentifiers = () => ({
  visitorId: storedUuid(localStorage, ANALYTICS_STORAGE_KEYS.visitor),
  sessionId: storedUuid(sessionStorage, ANALYTICS_STORAGE_KEYS.session),
});

export const getAnalyticsSessionId = () => {
  if (!analyticsAllowed()) return null;
  return getAnalyticsIdentifiers().sessionId;
};
