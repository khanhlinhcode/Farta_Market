export const getSessionItem = (key, fallback = null) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const setSessionItem = (key, value) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSessionItem = (key) => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(key);
};
