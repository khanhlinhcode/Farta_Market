import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./commonSlide";     

const store = configureStore({
  reducer: {
    commonSlide: commonReducer,
  },
});

export default store;
