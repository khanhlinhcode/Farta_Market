import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./commonSlide";     
import wishlistReducer from "./wishlistSlice";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    commonSlide: commonReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
});

export default store;
