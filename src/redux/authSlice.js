import { createSlice } from "@reduxjs/toolkit";

const ADMIN_ROLES = ["admin", "staff"];

const initialState = {
  user: null,
  adminUser: null,
  isBootstrapped: false,
};

const splitUserByRole = (user) => {
  if (!user) {
    return { user: null, adminUser: null };
  }

  if (ADMIN_ROLES.includes(user.role)) {
    return { user: null, adminUser: user };
  }

  return { user, adminUser: null };
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      const nextState = splitUserByRole(action.payload);

      state.user = nextState.user;
      state.adminUser = nextState.adminUser;
    },
    setAuthBootstrapped: (state, action) => {
      state.isBootstrapped = action.payload ?? true;
    },
    clearCustomerUser: (state) => {
      state.user = null;
    },
    clearAdminUser: (state) => {
      state.adminUser = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.adminUser = null;
      state.isBootstrapped = true;
    },
  },
});

export const {
  setAuthenticatedUser,
  setAuthBootstrapped,
  clearCustomerUser,
  clearAdminUser,
  clearAuth,
} = authSlice.actions;

export const selectCustomerUser = (state) => state.auth?.user || null;
export const selectAdminUser = (state) => state.auth?.adminUser || null;
export const selectAuthBootstrapped = (state) =>
  Boolean(state.auth?.isBootstrapped);

export default authSlice.reducer;
