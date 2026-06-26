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
