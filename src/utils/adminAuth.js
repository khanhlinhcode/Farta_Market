import { SESSION_KEYS } from "./constant";

export const ADMIN_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
};

const getStorage = () =>
  typeof window === "undefined" ? null : window.localStorage;

export const setAdminSession = ({ token, role }) => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(SESSION_KEYS.ADMIN_TOKEN, token);
  storage.setItem(SESSION_KEYS.ADMIN_ROLE, role);
};

export const clearAdminSession = () => {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(SESSION_KEYS.ADMIN_TOKEN);
  storage.removeItem(SESSION_KEYS.ADMIN_ROLE);
};

export const getAdminRole = () =>
  getStorage()?.getItem(SESSION_KEYS.ADMIN_ROLE) || "";

export const hasAdminRole = (allowedRoles) => {
  const storage = getStorage();
  const token = storage?.getItem(SESSION_KEYS.ADMIN_TOKEN);
  const role = getAdminRole();

  return Boolean(token && allowedRoles.includes(role));
};

export const hasAdminAccess = () =>
  hasAdminRole([ADMIN_ROLES.ADMIN, ADMIN_ROLES.STAFF]);

export const isAdmin = () => getAdminRole() === ADMIN_ROLES.ADMIN;
