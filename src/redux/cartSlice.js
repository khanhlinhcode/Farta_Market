import { createSlice } from "@reduxjs/toolkit";

export const emptyCart = {
  products: [],
  totalPrice: 0,
  totalQuantity: 0,
};

export const calculateCart = (products) => ({
  products,
  totalPrice: products.reduce((sum, item) => {
    return sum + Number(item.product.price || 0) * Number(item.quantity || 0);
  }, 0),
  totalQuantity: products.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
});

const initialState = {
  cart: emptyCart,
};

const cartSlice = createSlice({
  name: "commonSlide",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cart = action.payload;
    },
    addProductToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const products = [...state.cart.products];
      const index = products.findIndex((item) => item.product.id === product.id);

      if (index >= 0) {
        products[index] = {
          ...products[index],
          product,
          quantity: Number(products[index].quantity || 0) + Number(quantity || 0),
        };
      } else {
        products.push({
          product,
          quantity: Number(quantity || 0),
        });
      }

      state.cart = calculateCart(products);
    },
    removeProductFromCart: (state, action) => {
      state.cart = calculateCart(
        state.cart.products.filter((item) => item.product.id !== action.payload)
      );
    },
    clearCartState: (state) => {
      state.cart = emptyCart;
    },
  },
});

export const { setCart, addProductToCart, removeProductFromCart, clearCartState } =
  cartSlice.actions;

export default cartSlice.reducer;
