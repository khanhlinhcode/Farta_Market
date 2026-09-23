export const getSessionItem = (key, fallback = null) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    let value = window.localStorage.getItem(key);

    if (!value) {
      value = window.sessionStorage.getItem(key);

      if (value) {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      }
    }

    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const setSessionItem = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.sessionStorage.removeItem(key);
};

export const removeSessionItem = (key) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
};

export const getExpiringSessionItem = (key, fallback = null) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    window.localStorage.removeItem(key);
    const stored = window.sessionStorage.getItem(key);
    if (!stored) {
      return fallback;
    }

    const parsed = JSON.parse(stored);
    if (!parsed || Number(parsed.expiresAt) <= Date.now()) {
      window.sessionStorage.removeItem(key);
      return fallback;
    }

    return parsed.value;
  } catch (error) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
    return fallback;
  }
};

export const setExpiringSessionItem = (key, value, ttlMs) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
    window.sessionStorage.setItem(key, JSON.stringify({
      expiresAt: Date.now() + ttlMs,
      value,
    }));
  } catch (error) {
    // The Redux cart remains usable when browser storage is unavailable.
  }
};
