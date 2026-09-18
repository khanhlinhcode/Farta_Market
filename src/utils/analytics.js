export const ANALYTICS_STORAGE_KEYS = {
  session: "farta_analytics_session",
  optOut: "farta_analytics_opt_out",
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

export const getAnalyticsSession = () => {
  if (!analyticsAllowed()) return null;

  try {
    const value = JSON.parse(sessionStorage.getItem(ANALYTICS_STORAGE_KEYS.session) || "null");
    if (
      typeof value?.token === "string" &&
      Date.parse(value?.expiresAt || "") > Date.now() + 30_000
    ) {
      return value;
    }
  } catch {
    // A corrupt or unavailable storage entry is treated as no analytics session.
  }

  return null;
};

export const storeAnalyticsSession = ({ token, expires_at: expiresAt }) => {
  const value = { token, expiresAt };
  try {
    sessionStorage.setItem(ANALYTICS_STORAGE_KEYS.session, JSON.stringify(value));
  } catch {
    // Tracking remains optional when storage is unavailable.
  }

  return value;
};

export const clearAnalyticsSession = () => {
  try {
    sessionStorage.removeItem(ANALYTICS_STORAGE_KEYS.session);
  } catch {
    // Tracking remains optional when storage is unavailable.
  }
};

export const getAnalyticsToken = () => getAnalyticsSession()?.token || null;
