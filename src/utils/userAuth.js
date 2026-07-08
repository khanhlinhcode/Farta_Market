const LEGACY_USER_KEYS = [
  "farta_user_token",
  "farta_user_name",
  "farta_user_email",
];

const getStorage = () =>
  typeof window === "undefined" ? null : window.localStorage;

export const clearUserSession = () => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  LEGACY_USER_KEYS.forEach((key) => storage.removeItem(key));
};

export const getUserName = (user) => user?.name || "";
export const isUserLoggedIn = (user) => Boolean(user);
