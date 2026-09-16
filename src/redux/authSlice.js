import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isBootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      state.user = action.payload?.role === "customer" ? action.payload : null;
    },
    setAuthBootstrapped: (state, action) => {
      state.isBootstrapped = action.payload ?? true;
    },
    clearCustomerUser: (state) => {
      state.user = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isBootstrapped = true;
    },
  },
});

export const {
  setAuthenticatedUser,
  setAuthBootstrapped,
  clearCustomerUser,
  clearAuth,
} = authSlice.actions;

export const selectCustomerUser = (state) => state.auth?.user || null;
export const selectAuthBootstrapped = (state) =>
  Boolean(state.auth?.isBootstrapped);

export default authSlice.reducer;
