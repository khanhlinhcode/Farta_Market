import { createSlice } from "@reduxjs/toolkit";
import { getCartLineLimit } from "utils/constant";

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

export const normalizeCart = (cart) => {
  const products = [];
  for (const item of Array.isArray(cart?.products) ? cart.products : []) {
    const id = Number(item?.product?.id);
    const price = Number(item?.product?.price);
    const quantity = Number(item?.quantity);
    const limit = getCartLineLimit(item?.product?.inventory);
    if (!Number.isInteger(id) || id < 1 || !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(quantity) || quantity < 1 || limit === 0) continue;
    const existing = products.find((line) => line.product.id === id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, limit);
    } else {
      products.push({ product: { ...item.product, id }, quantity: Math.min(quantity, limit) });
    }
  }
  return calculateCart(products);
};

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
      const { product, quantity = 1 } = action.payload || {};
      const id = Number(product?.id);
      const requested = Number(quantity);
      const limit = product?.inventory == null ? 100 : getCartLineLimit(product.inventory);
      if (!Number.isInteger(id) || id < 1 || !Number.isInteger(requested) || requested < 1 || limit < 1) return;
      const products = [...state.cart.products];
      const index = products.findIndex((item) => Number(item.product.id) === id);
      const current = index < 0 ? 0 : Number(products[index].quantity);
      const line = { product: { ...product, id }, quantity: Math.min(current + requested, limit) };
      if (index < 0) products.push(line);
      else products[index] = line;
      state.cart = calculateCart(products);
    },
    removeProductFromCart: (state, action) => {
      state.cart = calculateCart(state.cart.products.filter(({ product }) => Number(product.id) !== Number(action.payload)));
    },
  },
});

export const { setCart, addProductToCart, removeProductFromCart } = cartSlice.actions;

export default cartSlice.reducer;
