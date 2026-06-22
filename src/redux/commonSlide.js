import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: {
    products: [],
    totalPrice: 0,
    totalQuantity: 0,
  },
};

const commonSlide = createSlice({
  name: "commonSlide",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload;
    },
  },
});
export const { setCart  } = commonSlide.actions;

export default commonSlide.reducer;
