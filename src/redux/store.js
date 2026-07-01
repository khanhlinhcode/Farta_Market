import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./commonSlide";     
import wishlistReducer from "./wishlistSlice";

const store = configureStore({
  reducer: {
    commonSlide: commonReducer,
    wishlist: wishlistReducer,
  },
});

export default store;
